import { decisionEmail, type Decision } from "./model";
type Claim = { result: string; decision?: Decision };
export type DecisionDelivery = {
  claim(): Promise<Claim>;
  finish(decision: Decision, providerId: string): Promise<void>;
  uncertain(decision: Decision): Promise<void>;
  send: typeof fetch;
  apiKey: string;
};
export async function deliverDecision(
  deps: DecisionDelivery,
): Promise<{ status: number; message: string; ok?: boolean }> {
  const claim = await deps.claim();
  if (claim.result === "sent")
    return {
      status: 200,
      ok: true,
      message: "This decision email has already been sent.",
    };
  if (claim.result === "missing")
    return { status: 404, message: "Application not found." };
  if (claim.result === "expired")
    return {
      status: 409,
      message:
        "Delivery needs a manual check in Resend before retrying. The safe retry window has expired; no additional email was sent.",
    };
  if (claim.result !== "claimed" || !claim.decision)
    return {
      status: 409,
      message:
        "A decision is already being processed. Refresh the page before retrying the saved email.",
    };
  const decision = claim.decision;
  try {
    const response = await deps.send("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${deps.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `pewss-decision/${decision.id}`,
      },
      body: JSON.stringify(decisionEmail(decision)),
      signal: AbortSignal.timeout(20000),
    });
    const result = await response.json();
    if (!response.ok || typeof result.id !== "string" || !result.id)
      throw new Error("Email not accepted");
    await deps.finish(decision, result.id);
    return {
      status: 200,
      ok: true,
      message: "Decision saved and email accepted for delivery.",
    };
  } catch {
    // Keep the immutable payload and idempotency key for a safe retry. Do not claim success.
    await deps.uncertain(decision).catch(() => {});
    return {
      status: 502,
      message:
        "Email delivery could not be confirmed. Refresh to retry the saved email. The applicant’s status has not been changed.",
    };
  }
}
