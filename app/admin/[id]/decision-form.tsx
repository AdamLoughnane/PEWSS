"use client";
import { useState, type FormEvent } from "react";
import {
  decisionTemplate,
  type Decision,
  type DecisionKind,
} from "../../../lib/admin/model";
import styles from "../admin.module.css";
export function DecisionForm({
  id,
  name,
  email,
  decision,
  expired,
}: {
  id: string;
  name: string;
  email: string;
  decision: Decision | null;
  expired: boolean;
}) {
  const [outcome, setOutcome] = useState<DecisionKind | null>(
    decision?.outcome ?? null,
  );
  const [subject, setSubject] = useState(decision?.subject ?? "");
  const [body, setBody] = useState(decision?.body ?? "");
  const [confirmed, setConfirmed] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [reloadNeeded, setReloadNeeded] = useState(false);
  function choose(value: DecisionKind) {
    const template = decisionTemplate(name, value);
    setOutcome(value);
    setSubject(template.subject);
    setBody(template.body);
    setConfirmed(false);
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!confirmed || pending || reloadNeeded) return;
    setPending(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/applicants/${id}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome, subject, body, confirm: true }),
      });
      const result = await response.json();
      if (response.ok) {
        window.location.reload();
        return;
      }
      setMessage(result.message ?? "The decision could not be confirmed.");
      setReloadNeeded(true);
    } catch {
      setMessage(
        "The response was interrupted. Refresh to check the saved decision before trying again.",
      );
      setReloadNeeded(true);
    } finally {
      setPending(false);
    }
  }
  if (decision?.state === "sent")
    return (
      <section className={styles.panel}>
        <h2>Decision email</h2>
        <p>
          <span className={`${styles.badge} ${styles[decision.outcome]}`}>
            {decision.outcome}
          </span>
        </p>
        <p>
          Email accepted for delivery on{" "}
          {new Date(decision.sent_at!).toLocaleString("en-IE", {
            timeZone: "Europe/Dublin",
          })}
          .
        </p>
        <p className={styles.subtitle}>
          This records the email provider’s acceptance, not confirmation that
          the applicant has read it.
        </p>
        <h3>To</h3>
        <p>{decision.recipient}</p>
        <h3>Subject</h3>
        <p>{decision.subject}</p>
        <h3>Message sent</h3>
        <p className={styles.response}>{decision.body}</p>
      </section>
    );
  return (
    <section className={styles.panel}>
      <h2>Application decision</h2>
      <p>
        Choose a decision, review the email, and confirm when you are ready to
        send it.
      </p>
      {!outcome ? (
        <div className={styles.actions}>
          <button
            className={`${styles.button} ${styles.primary}`}
            onClick={() => choose("accepted")}
          >
            Accept applicant
          </button>
          <button
            className={`${styles.button} ${styles.reject}`}
            onClick={() => choose("rejected")}
          >
            Reject applicant
          </button>
        </div>
      ) : (
        <form onSubmit={submit}>
          {decision && (
            <p role="status" className={styles.notice}>
              {expired
                ? "The safe retry window has expired. Check this email in Resend before taking further action. Sending is disabled to prevent a duplicate."
                : "A previous send was not confirmed. The saved email below is locked so you can retry it safely. If it was just sent, wait one minute, then refresh."}
            </p>
          )}
          <h3>
            {outcome === "accepted"
              ? "Offer of a place"
              : "Application rejection"}
          </h3>
          <p>
            To: <strong>{email}</strong>
          </p>
          <div className={styles.field}>
            <label htmlFor="decision-subject">Subject</label>
            <input
              id="decision-subject"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setConfirmed(false);
              }}
              maxLength={200}
              required
              disabled={Boolean(decision) || pending || reloadNeeded}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="decision-body">Email message</label>
            <textarea
              id="decision-body"
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                setConfirmed(false);
              }}
              maxLength={10000}
              required
              disabled={Boolean(decision) || pending || reloadNeeded}
            />
          </div>
          <label className={styles.confirm}>
            <input
              type="checkbox"
              checked={confirmed}
              required
              onChange={(e) => setConfirmed(e.target.checked)}
              disabled={pending || Boolean(expired) || reloadNeeded}
            />
            <span>
              I have reviewed this email and want to send{" "}
              {outcome === "accepted" ? "an acceptance" : "a rejection"} to{" "}
              <strong>{email}</strong>.
            </span>
          </label>
          {message && (
            <p role="alert" className={styles.notice}>
              {message}
            </p>
          )}
          <div className={styles.actions}>
            <button
              className={`${styles.button} ${styles.primary}`}
              disabled={
                !confirmed || pending || Boolean(expired) || reloadNeeded
              }
            >
              {pending
                ? "Sending…"
                : decision
                  ? "Retry saved email"
                  : "Confirm decision and send email"}
            </button>
            {!decision && (
              <button
                type="button"
                className={styles.button}
                disabled={pending || reloadNeeded}
                onClick={() => {
                  setOutcome(null);
                  setConfirmed(false);
                }}
              >
                Cancel
              </button>
            )}
            {(decision || reloadNeeded) && (
              <button
                type="button"
                className={styles.button}
                disabled={pending}
                onClick={() => window.location.reload()}
              >
                Refresh status
              </button>
            )}
          </div>
        </form>
      )}
    </section>
  );
}
