import { query } from "../../../../../../lib/admin/database";
import { randomUUID } from "node:crypto";
import {
  administrator,
  privateJson,
  sameOrigin,
  smallJson,
} from "../../../../../../lib/admin/server";
import { UUID, validDecision } from "../../../../../../lib/admin/model";
import { deliverDecision } from "../../../../../../lib/admin/delivery";
export const runtime = "nodejs";
export const maxDuration = 30;
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!sameOrigin(request))
    return privateJson(
      { message: "Please use the administrator dashboard." },
      403,
    );
  try {
    const user = await administrator();
    if (!user)
      return privateJson(
        { message: "Please sign in as the administrator." },
        401,
      );
    const { id } = await params;
    if (!UUID.test(id))
      return privateJson({ message: "Application not found." }, 404);
    const body = await smallJson(request);
    if (body.confirm !== true || !validDecision(body))
      return privateJson(
        {
          message:
            "Review the decision, subject and message, then confirm sending.",
        },
        400,
      );
    if (!process.env.RESEND_API_KEY || !process.env.APPLICATION_FROM_EMAIL)
      return privateJson({ message: "Email delivery is not configured." }, 503);
    const lease = randomUUID();
    const result = await deliverDecision({
      apiKey: process.env.RESEND_API_KEY,
      send: fetch,
      async claim() {
        const { rows } = await query("select public.pewss_claim_decision($1,$2,$3,$4,$5,$6,$7) as result",
          [id,body.outcome,body.subject,body.body,process.env.APPLICATION_FROM_EMAIL,user.id,lease]);
        return rows[0].result;
      },
      async finish(decision, providerId) {
        const { rows } = await query("select public.pewss_finish_decision($1,$2,$3) as ok", [decision.id,lease,providerId]);
        if (rows[0]?.ok !== true) throw new Error("Could not confirm decision");
      },
      async uncertain(decision) {
        await query("update public.pewss_decisions set state='uncertain',lease_until=now() where id=$1 and lease_id=$2 and state<>'sent'", [decision.id,lease]);
      },
    });
    return privateJson(result, result.status);
  } catch {
    return privateJson(
      {
        message:
          "The decision could not be processed. Please refresh and try again.",
      },
      503,
    );
  }
}
