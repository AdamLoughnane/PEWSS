"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./admin.module.css";
export function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  async function send(action: "request" | "verify") {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, email, code }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message);
        return;
      }
      if (action === "verify") {
        router.replace("/admin");
        router.refresh();
      } else {
        setSent(true);
        setMessage("Check your email for a sign-in code.");
      }
    } catch {
      setMessage("Could not connect. Please try again.");
    } finally {
      setPending(false);
    }
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    void send(sent ? "verify" : "request");
  }
  return (
    <section className={styles.login}>
      <p className={styles.subtitle}>PEWSS 2027</p>
      <h1 className={styles.title}>Administrator sign-in</h1>
      <p className={styles.subtitle}>
        Access is restricted to the organiser. Sign in using a one-time code
        sent to your authorised email address.
      </p>
      {!configured && (
        <p className={styles.notice}>
          The private dashboard is being configured. Sign-in will be available
          once setup is complete.
        </p>
      )}
      <form onSubmit={submit} className={styles.panel}>
        <div className={styles.field}>
          <label htmlFor="admin-email">Email address</label>
          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            disabled={pending || sent || !configured}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {sent && (
          <div className={styles.field}>
            <label htmlFor="admin-code">Sign-in code</label>
            <input
              id="admin-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6,8}"
              maxLength={8}
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
        )}
        {message && (
          <p role="status" className={styles.notice}>
            {message}
          </p>
        )}
        <button
          className={`${styles.button} ${styles.primary}`}
          disabled={pending || !configured}
        >
          {pending
            ? "Please wait…"
            : sent
              ? "Sign in"
              : "Email me a sign-in code"}
        </button>
        {sent && (
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.button}
              disabled={pending}
              onClick={() => void send("request")}
            >
              Send a new code
            </button>
            <button
              type="button"
              className={styles.button}
              disabled={pending}
              onClick={() => {
                setSent(false);
                setCode("");
              }}
            >
              Change email
            </button>
          </div>
        )}
      </form>
    </section>
  );
}
export function SignOut() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  return (
    <div>
      <button
        className={styles.button}
        disabled={pending}
        onClick={async () => {
          setPending(true);
          try {
            const response = await fetch("/api/admin/auth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "logout" }),
            });
            if (!response.ok) throw new Error();
            router.replace("/admin");
            router.refresh();
          } catch {
            setError("Sign-out failed. Please try again.");
            setPending(false);
          }
        }}
      >
        {pending ? "Signing out…" : "Sign out"}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
