import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

// Use the installed TypeScript compiler so tests also run on the project's Node 20.
const source = await readFile(new URL("../lib/applications.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
const { validateApplication, buildApplicationEmail, handleApplicationRequest, MAX_PHOTO_BYTES, MAX_REQUEST_BYTES } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

const config = { open: "true", apiKey: "test-key-not-a-real-credential", from: "PEWSS <applications@example.com>" };
const id = "42e5f0ce-3e6a-4c22-81ea-3923f2502ffb";
function validForm() {
  const form = new FormData();
  for (const [key, value] of Object.entries({ name: "Test Applicant", email: "applicant@example.com", institution: "Independent researcher", careerStage: "PhD student", country: "Ireland", researchInterests: "Embodiment and place", biography: "A fictional applicant used for local testing.", statement: "I would like to explore selfhood and space across traditions.", website: "https://example.com", orcid: "0000-0002-1825-0097", ects: "Not sure yet", privacyAcknowledgement: "yes", submissionId: id })) form.set(key, value);
  return form;
}
function request(form = validForm(), origin = "https://pewss.org") {
  return new Request("https://pewss.org/api/applications", { method: "POST", headers: { Origin: origin }, body: form });
}
function neverDeliver() { assert.fail("Invalid or disabled applications must never be emailed"); }

test("validates all required data, career choices, ECTS choice and acknowledgement", async () => {
  assert.equal((await validateApplication(validForm())).ok, true);
  const form = validForm();
  form.set("name", "\n "); form.set("email", "one@example.com\r\nBcc: someone@example.com");
  form.set("careerStage", "forged-choice"); form.set("ects", "forged-choice");
  form.delete("privacyAcknowledgement"); form.set("statement", "x".repeat(5001));
  const result = await validateApplication(form);
  assert.equal(result.ok, false);
  for (const key of ["name", "email", "careerStage", "ects", "privacyAcknowledgement", "statement"]) assert.ok(result.errors[key]);
});

test("rejects unsafe URLs, bad ORCID checksums, and header injection", async () => {
  const form = validForm();
  form.set("name", "Applicant\r\nBcc: other@example.com");
  form.set("website", "javascript:alert(1)"); form.set("orcid", "0000-0002-1825-0098");
  const result = await validateApplication(form);
  assert.equal(result.ok, false);
  for (const key of ["name", "website", "orcid"]) assert.ok(result.errors[key]);
});

test("accepts website addresses without a scheme and normalises them for email", async () => {
  for (const [input, expected] of [
    ["example.com", "https://example.com/"],
    ["www.example.com/profile?lang=en", "https://www.example.com/profile?lang=en"],
    ["https://example.com/about", "https://example.com/about"],
    ["http://example.com", "http://example.com/"],
  ]) {
    const form = validForm(); form.set("website", input);
    const result = await validateApplication(form);
    assert.equal(result.ok, true, input);
    assert.equal(result.application.website, expected);
    assert.ok(buildApplicationEmail(result.application, config.from, id).text.includes(expected));
  }
  for (const input of ["javascript:alert(1)", "ftp://example.com", "user:password@example.com", "not a website"]) {
    const form = validForm(); form.set("website", input);
    assert.ok((await validateApplication(form)).errors.website, input);
  }
});

test("valid photo requires consent, keeps a safe attachment filename, and escapes email markup", async () => {
  const form = validForm();
  form.set("photo", new Blob([Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=", "base64")], { type: "image/png" }), "../../<unsafe>.png");
  assert.ok((await validateApplication(form)).errors.photoConsent);
  form.set("photoConsent", "yes"); form.set("statement", '<img src="https://example.com/track"> & sample');
  const result = await validateApplication(form);
  assert.equal(result.ok, true);
  const email = buildApplicationEmail(result.application, config.from, id);
  assert.deepEqual(email.to, ["adam.loughnane@ucc.ie"]);
  assert.equal(email.reply_to, "applicant@example.com");
  assert.equal(email.attachments[0].filename, "profile-photo.png");
  assert.ok(email.html.includes("&lt;img")); assert.ok(!email.html.includes("<img"));
  assert.ok(email.text.includes('<img src="https://example.com/track"> & sample'));
});

test("rejects oversized and disguised file uploads", async () => {
  const form = validForm(); form.set("photoConsent", "yes");
  form.set("photo", new Blob(["<svg onload='alert(1)' />"], { type: "image/png" }), "photo.png");
  assert.ok((await validateApplication(form)).errors.photo);
  form.set("photo", new Blob([new Uint8Array(MAX_PHOTO_BYTES + 1)], { type: "image/png" }), "photo.png");
  assert.ok((await validateApplication(form)).errors.photo);
});

test("disabled, cross-origin, spam and invalid submissions never contact the email provider", async () => {
  assert.equal((await handleApplicationRequest(request(), {}, neverDeliver)).status, 503);
  assert.equal((await handleApplicationRequest(request(validForm(), "https://other.example"), config, neverDeliver)).status, 403);
  const spam = validForm(); spam.set("companyWebsite", "spam");
  assert.equal((await handleApplicationRequest(request(spam), config, neverDeliver)).status, 400);
  const invalid = validForm(); invalid.delete("email");
  assert.equal((await handleApplicationRequest(request(invalid), config, neverDeliver)).status, 400);
  const missingId = validForm(); missingId.delete("submissionId");
  assert.equal((await handleApplicationRequest(request(missingId), config, neverDeliver)).status, 400);
});

test("limits the actual request body even without a Content-Length header", async () => {
  const large = new Request("https://pewss.org/api/applications", { method: "POST", headers: { origin: "https://pewss.org", "content-type": "multipart/form-data; boundary=test" }, body: new Uint8Array(MAX_REQUEST_BYTES + 1) });
  assert.equal((await handleApplicationRequest(large, config, neverDeliver)).status, 413);
});

test("successful delivery targets only Adam, includes all fields, and reuses the idempotency key", async () => {
  const keys = [];
  const deliver = async (url, options) => {
    assert.equal(url, "https://api.resend.com/emails");
    const email = JSON.parse(options.body);
    assert.deepEqual(email.to, ["adam.loughnane@ucc.ie"]);
    assert.equal(email.from, config.from); assert.equal(email.reply_to, "applicant@example.com");
    for (const value of ["Test Applicant", "PhD student", "Ireland", "Embodiment and place", "Not sure yet", "0000-0002-1825-0097"]) assert.ok(email.text.includes(value));
    keys.push(options.headers["Idempotency-Key"]);
    return Response.json({ id: "mock-email-id" });
  };
  const form = validForm(); form.set("to", "attacker@example.com"); form.set("from", "attacker@example.com");
  const response = await handleApplicationRequest(request(form), config, deliver);
  assert.equal(response.status, 200); assert.equal((await response.json()).reference, `PEWSS-2027-${id}`);
  await handleApplicationRequest(request(), config, deliver);
  assert.equal(keys[0], keys[1]);
});

test("provider errors, invalid responses and network failures never claim success or leak details", async () => {
  for (const deliver of [async () => Response.json({ message: "private-provider-detail" }, { status: 403 }), async () => Response.json({}), async () => { throw new Error("private-provider-detail"); }]) {
    const response = await handleApplicationRequest(request(), config, deliver);
    assert.equal(response.status, 502);
    const result = await response.json();
    assert.equal(result.ok, undefined);
    assert.ok(!JSON.stringify(result).includes("private-provider-detail"));
    assert.match(result.message, /could not confirm/);
  }
});
