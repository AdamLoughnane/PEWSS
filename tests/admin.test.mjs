import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import { PGlite } from "@electric-sql/pglite";
async function moduleUrl(path, replacements = {}) {
  let source = await readFile(new URL(path, import.meta.url), "utf8");
  for (const [before, after] of Object.entries(replacements))
    source = source.replaceAll(before, after);
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ES2022,
    },
  });
  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}
const modelUrl = await moduleUrl("../lib/admin/model.ts");
const { isAdministrator, validDecision, decisionTemplate } = await import(
  modelUrl
);
const { deliverDecision } = await import(
  await moduleUrl("../lib/admin/delivery.ts", {
    '"./model"': JSON.stringify(modelUrl),
  })
);
const id = "42e5f0ce-3e6a-4c22-81ea-3923f2502ffb";
const lease = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const actor = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const decision = {
  id,
  sender: "PEWSS <applications@mail.pewss.org>",
  recipient: "applicant@example.com",
  subject: "A decision",
  body: "A personal message",
  outcome: "accepted",
};

test("only the confirmed organiser identity has administrator access", () => {
  const user = {
    id: actor,
    email: "adam.loughnane@ucc.ie",
    email_confirmed_at: "2026-11-06",
  };
  assert.equal(isAdministrator(user, actor), true);
  for (const candidate of [
    null,
    { ...user, id: lease },
    { ...user, email: "attacker@example.com" },
    { ...user, email_confirmed_at: undefined },
  ])
    assert.equal(isAdministrator(candidate, actor), false);
  assert.equal(isAdministrator(user, undefined), false);
});
test("decision input rejects header injection, invalid decisions and oversized messages", () => {
  assert.equal(validDecision({ ...decision }), true);
  for (const patch of [
    { subject: "Hello\r\nBcc: other@example.com" },
    { body: "" },
    { outcome: "waitlist" },
    { body: "x".repeat(10001) },
  ])
    assert.equal(validDecision({ ...decision, ...patch }), false);
  assert.match(decisionTemplate("Example", "accepted").body, /26–29 May 2027/);
});
test("saved recipient and immutable idempotency key are used for decisions", async () => {
  let finished = false;
  const result = await deliverDecision({
    apiKey: "test",
    claim: async () => ({ result: "claimed", decision }),
    send: async (url, options) => {
      assert.equal(url, "https://api.resend.com/emails");
      assert.equal(options.headers["Idempotency-Key"], `pewss-decision/${id}`);
      const payload = JSON.parse(options.body);
      assert.deepEqual(payload.to, ["applicant@example.com"]);
      assert.equal(payload.reply_to, "adam.loughnane@ucc.ie");
      return Response.json({ id: "resend-test" });
    },
    finish: async (d, p) => {
      assert.equal(d, decision);
      assert.equal(p, "resend-test");
      finished = true;
    },
    uncertain: async () => assert.fail(),
  });
  assert.equal(result.ok, true);
  assert.equal(finished, true);
});
test("sent, busy and expired decisions do not send another email", async () => {
  for (const result of ["sent", "busy", "expired", "immutable", "missing"]) {
    await deliverDecision({
      apiKey: "test",
      claim: async () => ({ result }),
      send: async () => assert.fail(),
      finish: async () => assert.fail(),
      uncertain: async () => assert.fail(),
    });
  }
});
test("provider or persistence failures never claim a confirmed decision", async () => {
  for (const stage of ["send", "finish"]) {
    let uncertain = false;
    const result = await deliverDecision({
      apiKey: "test",
      claim: async () => ({ result: "claimed", decision }),
      send: async () => {
        if (stage === "send") throw new Error("private error");
        return Response.json({ id: "provider-id" });
      },
      finish: async () => {
        if (stage === "finish") throw new Error("private error");
      },
      uncertain: async () => {
        uncertain = true;
      },
    });
    assert.equal(result.status, 502);
    assert.equal(result.ok, undefined);
    assert.equal(uncertain, true);
    assert.ok(!result.message.includes("private error"));
  }
});
test("database blocks public access and serialises decisions with safe retry limits", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      "create role anon; create role authenticated; create role service_role bypassrls;",
    );
    await db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/202611060001_admin.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    await db.query(
      "insert into public.pewss_applications(id,reference,name,email,career_stage,country,responses,payload_hash) values($1,'test-reference','Test','applicant@example.com','PhD student','Ireland','{}','hash')",
      [id],
    );
    for (const role of ["anon", "authenticated"]) {
      await db.exec(`set role ${role}`);
      await assert.rejects(db.query("select * from public.pewss_applications"));
      await assert.rejects(db.query("select * from public.pewss_decisions"));
      await assert.rejects(
        db.query("select public.pewss_auth_limit('test',60,1)"),
      );
      await db.exec("reset role");
    }
    await db.exec("set role service_role");
    const claim = async (outcome = "accepted", subject = "Subject") =>
      (
        await db.query(
          "select public.pewss_claim_decision($1,$2,$3,$4,$5,$6,$7) as result",
          [id, outcome, subject, "Body", decision.sender, actor, lease],
        )
      ).rows[0].result;
    const first = await claim();
    assert.equal(first.result, "claimed");
    assert.equal(first.decision.recipient, "applicant@example.com");
    assert.equal((await claim("rejected")).result, "busy");
    await db.query(
      "update public.pewss_decisions set lease_until=now()-interval '1 minute',state='uncertain'",
    );
    assert.equal((await claim("rejected")).result, "immutable");
    const retry = await claim();
    assert.equal(retry.decision.id, first.decision.id);
    await db.query(
      "update public.pewss_decisions set created_at=now()-interval '24 hours',lease_until=now()-interval '1 minute'",
    );
    assert.equal((await claim()).result, "expired");
    const finished = await db.query(
      "select public.pewss_finish_decision($1,$2,$3) as ok",
      [first.decision.id, lease, "provider-id"],
    );
    assert.equal(finished.rows[0].ok, true);
    assert.equal((await claim()).result, "sent");
    assert.equal(
      (await db.query("select status from public.pewss_applications")).rows[0]
        .status,
      "accepted",
    );
    const rate = async () =>
      (
        await db.query(
          "select public.pewss_auth_limit('test-limit',60,1) as allowed",
        )
      ).rows[0].allowed;
    assert.equal(await rate(), true);
    assert.equal(await rate(), false);
  } finally {
    await db.close();
  }
});

test("email import preserves multiline responses and requires the original acknowledgement", async () => {
  const { parseApplicationEmail } = await import(
    await moduleUrl("../lib/admin/import.ts")
  );
  const { buildApplicationEmail } = await import(
    await moduleUrl("../lib/applications.ts")
  );
  const application = {
    name: "Example Applicant",
    email: "example@example.com",
    institution: "",
    careerStage: "PhD student",
    country: "Ireland",
    researchInterests: "First paragraph\n\nSecond paragraph",
    biography: "A biography",
    statement: "A statement",
    website: "",
    orcid: "",
    ects: "No",
    photo: null,
    photoConsent: false,
    privacyAcknowledgement: true,
  };
  const email = buildApplicationEmail(
    application,
    "PEWSS <applications@mail.pewss.org>",
    `PEWSS-2027-${id}`,
  );
  const parsed = parseApplicationEmail(email.text);
  assert.equal(parsed.email, application.email);
  assert.equal(parsed.researchInterests, application.researchInterests);
  assert.equal(parsed.institution, "");
  assert.throws(() =>
    parseApplicationEmail(
      email.text.replace("Privacy acknowledgement", "Missing label"),
    ),
  );
});
