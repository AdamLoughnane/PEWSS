export const ADMIN_EMAIL = "adam.loughnane@ucc.ie";
export const UUID =
  /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
export type DecisionKind = "accepted" | "rejected";
export type Decision = {
  id: string;
  application_id: string;
  outcome: DecisionKind;
  subject: string;
  body: string;
  recipient: string;
  sender: string;
  state: "sending" | "uncertain" | "sent";
  created_at: string;
  sent_at: string | null;
  provider_id: string | null;
};
export type ApplicantSummary = {
  id: string;
  reference: string;
  name: string;
  email: string;
  institution: string;
  career_stage: string;
  country: string;
  created_at: string;
  status: "pending" | DecisionKind;
  notification_sent: boolean;
};
export function isAdministrator(
  user: { id: string; email?: string; email_confirmed_at?: string } | null,
  allowedId?: string,
) {
  return Boolean(
    allowedId &&
    user?.id === allowedId &&
    user?.email?.toLowerCase() === ADMIN_EMAIL &&
    user.email_confirmed_at,
  );
}
export function decisionTemplate(name: string, outcome: DecisionKind) {
  const introduction = `Dear ${name},\n\nThank you for applying to the Phenomenology East and West Summer School 2027, “(non)Self and Space”.`;
  return {
    subject:
      outcome === "accepted"
        ? "Your PEWSS 2027 application — offer of a place"
        : "Your PEWSS 2027 application — decision",
    body:
      outcome === "accepted"
        ? `${introduction}\n\nWe are pleased to offer you a place at the Summer School, taking place at University College Cork from 26–29 May 2027.\n\nPlease reply to this email to let us know whether you would like to accept your place. We will share further practical information and next steps with you.\n\nWe look forward to welcoming you to Cork.\n\nBest wishes,\nAdam Loughnane\nPEWSS organising team`
        : `${introduction}\n\nThank you for the time and thought you put into your application. We regret that we are unable to offer you a place at this year’s Summer School.\n\nWe appreciate your interest in PEWSS and wish you all the best with your work.\n\nBest wishes,\nAdam Loughnane\nPEWSS organising team`,
  };
}
export function validDecision(
  value: unknown,
): value is { outcome: DecisionKind; subject: string; body: string } {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    (v.outcome === "accepted" || v.outcome === "rejected") &&
    typeof v.subject === "string" &&
    v.subject.trim().length > 0 &&
    v.subject.length <= 200 &&
    !/[\r\n\x00-\x1f\x7f]/.test(v.subject) &&
    typeof v.body === "string" &&
    v.body.trim().length > 0 &&
    v.body.length <= 10000 &&
    !/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(v.body)
  );
}
export function decisionEmail(
  decision: Pick<Decision, "sender" | "recipient" | "subject" | "body">,
) {
  return {
    from: decision.sender,
    to: [decision.recipient],
    reply_to: ADMIN_EMAIL,
    subject: decision.subject,
    text: decision.body,
  };
}
