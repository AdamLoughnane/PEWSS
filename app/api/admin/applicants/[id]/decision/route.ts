import { randomUUID } from "node:crypto";
import {
  administrator,
  database,
  privateJson,
  sameOrigin,
  smallJson,
} from "../../../../../../lib/admin/supabase";
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
    const db = database();
    const lease = randomUUID();
    const result = await deliverDecision({
      apiKey: process.env.RESEND_API_KEY,
      send: fetch,
      async claim() {
        const { data, error } = await db.rpc("pewss_claim_decision", {
          p_application: id,
          p_outcome: body.outcome,
          p_subject: body.subject,
          p_body: body.body,
          p_sender: process.env.APPLICATION_FROM_EMAIL,
          p_actor: user.id,
          p_lease: lease,
        });
        if (error) throw new Error("Could not claim decision");
        return data;
      },
      async finish(decision, providerId) {
        const { data, error } = await db.rpc("pewss_finish_decision", {
          p_decision: decision.id,
          p_lease: lease,
          p_provider: providerId,
        });
        if (error || data !== true)
          throw new Error("Could not confirm decision");
      },
      async uncertain(decision) {
        await db
          .from("pewss_decisions")
          .update({ state: "uncertain", lease_until: new Date().toISOString() })
          .eq("id", decision.id)
          .eq("lease_id", lease)
          .neq("state", "sent");
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
