"use client";
import { useState, useSyncExternalStore, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { browserSupportsWebAuthn, startAuthentication, startRegistration } from "@simplewebauthn/browser";
import styles from "./admin.module.css";
async function authPost(body: object) {
  const response = await fetch("/api/admin/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message ?? "Please try again.");
  return data;
}
function passkeyError(error: unknown) {
  if (error instanceof Error && error.name === "NotAllowedError") return "The passkey request was cancelled or timed out.";
  return error instanceof Error && error.message ? error.message : "Please try again.";
}
const noSubscription = () => () => {};
// False during server rendering; checked in the browser after hydration.
function usePasskeySupport() {
  return useSyncExternalStore(noSubscription, browserSupportsWebAuthn, () => false);
}
export function AdminLogin({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const passkeySupported = usePasskeySupport();
  async function passkeySignIn() {
    setPending(true);
    setMessage("");
    try {
      const { options } = await authPost({ action: "passkey-login-options" });
      const response = await startAuthentication({ optionsJSON: options });
      await authPost({ action: "passkey-login-verify", response });
      router.replace("/admin");
      router.refresh();
    } catch (error) {
      setMessage(passkeyError(error));
    } finally {
      setPending(false);
    }
  }
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
        Access is restricted to the organiser. Sign in with your passkey, or
        with a one-time code sent to your authorised email address.
      </p>
      {!configured && (
        <p className={styles.notice}>
          The private dashboard is being configured. Sign-in will be available
          once setup is complete.
        </p>
      )}
      {configured && passkeySupported && (
        <div className={styles.panel}>
          <button
            type="button"
            className={`${styles.button} ${styles.primary}`}
            disabled={pending}
            onClick={() => void passkeySignIn()}
          >
            Sign in with passkey
          </button>
          <p className={styles.subtitle}>
            Uses Touch ID or your device’s screen lock. If you have not set up a
            passkey yet, use an emailed code below.
          </p>
        </div>
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
          className={passkeySupported ? styles.button : `${styles.button} ${styles.primary}`}
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

export function PasskeySetup({ existing }: { existing: number }) {
  const router = useRouter();
  const supported = usePasskeySupport();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  if (!supported) return null;
  return (
    <div>
      <button
        className={styles.button}
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setMessage("");
          try {
            const { options } = await authPost({ action: "passkey-register-options" });
            const response = await startRegistration({ optionsJSON: options });
            await authPost({ action: "passkey-register-verify", response });
            setMessage("Passkey saved. Next time, choose “Sign in with passkey”.");
            router.refresh();
          } catch (error) {
            setMessage(passkeyError(error));
          } finally {
            setPending(false);
          }
        }}
      >
        {pending ? "Waiting for passkey…" : existing > 0 ? "Add passkey on another device" : "Set up passkey"}
      </button>
      {message && <p role="status" className={styles.subtitle}>{message}</p>}
    </div>
  );
}
