"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { parseApplicationEmail } from "../../../lib/admin/import";
import styles from "../admin.module.css";
export function ImportForm() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<Record<string, string> | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const form = new FormData(event.currentTarget);
      form.set(
        "receivedAt",
        new Date(String(form.get("receivedAt"))).toISOString(),
      );
      const response = await fetch("/api/admin/import", {
        method: "POST",
        body: form,
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.message);
        return;
      }
      router.push(`/admin/${result.id}`);
      router.refresh();
    } catch {
      setMessage("The import could not be confirmed. Please try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={submit} className={styles.panel}>
      <div className={styles.field}>
        <label htmlFor="original-email">Original email body</label>
        <textarea
          id="original-email"
          name="emailText"
          maxLength={30000}
          value={text}
          required
          disabled={pending}
          onChange={(e) => {
            setText(e.target.value);
            setPreview(null);
          }}
        />
      </div>
      <button
        type="button"
        className={styles.button}
        disabled={pending}
        onClick={() => {
          try {
            setPreview(parseApplicationEmail(text));
            setMessage("");
          } catch (error) {
            setMessage((error as Error).message);
          }
        }}
      >
        Preview application
      </button>
      {preview && (
        <>
          <h2>Review extracted details</h2>
          <dl>
            {Object.entries(preview).map(([key, value]) => (
              <div style={{ display: "contents" }} key={key}>
                <dt>{key}</dt>
                <dd className={styles.response}>{value || "Not provided"}</dd>
              </div>
            ))}
          </dl>
          <div className={styles.field}>
            <label htmlFor="received-at">
              Original email received date and time
            </label>
            <input
              id="received-at"
              name="receivedAt"
              type="datetime-local"
              required
            />
          </div>
          {preview.photoDescription.startsWith("Attached") && (
            <div className={styles.field}>
              <label htmlFor="original-photo">
                Original photograph attachment
              </label>
              <input
                id="original-photo"
                name="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required
              />
              <p>JPEG, PNG or WebP, maximum 2 MB.</p>
            </div>
          )}
          <label className={styles.confirm}>
            <input name="confirm" type="checkbox" value="yes" required />
            <span>
              I have checked the name, email and responses against the original
              application.
            </span>
          </label>
          <button
            className={`${styles.button} ${styles.primary}`}
            disabled={pending}
          >
            {pending ? "Importing…" : "Import application"}
          </button>
        </>
      )}
      {message && (
        <p role="alert" className={styles.notice}>
          {message}
        </p>
      )}
    </form>
  );
}
