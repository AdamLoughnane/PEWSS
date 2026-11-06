"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { careerStages, creditChoices, MAX_PHOTO_BYTES, textFields, type FieldErrors, type TextField } from "../../lib/applications";
import styles from "./application-form.module.css";
import siteStyles from "../home.module.css";

export function ApplicationForm({ enabled }: { enabled: boolean }) {
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const [hasPhoto, setHasPhoto] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);
  const photoConsentInput = useRef<HTMLInputElement>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const submissionId = useRef<string | null>(null);
  const submitting = useRef(false);
  const feedback = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message || reference) feedback.current?.focus();
  }, [message, reference]);

  function updatePhoto(hasFile: boolean) {
    setHasPhoto(hasFile);
    if (photoConsentInput.current) photoConsentInput.current.checked = false;
    submissionId.current = null;
    setErrors((current) => {
      const next = { ...current };
      delete next.photo;
      delete next.photoConsent;
      return next;
    });
  }

  function removePhoto() {
    if (photoInput.current) photoInput.current.value = "";
    updatePhoto(false);
    photoInput.current?.focus();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enabled || submitting.current) return;
    const form = new FormData(event.currentTarget);
    const photo = form.get("photo");
    if (photo instanceof File && photo.size > MAX_PHOTO_BYTES) {
      setErrors({ photo: "Please choose a photograph smaller than 2 MB." });
      setMessage("Please check the highlighted fields.");
      return;
    }
    submissionId.current ??= crypto.randomUUID();
    form.set("submissionId", submissionId.current);
    submitting.current = true;
    setPending(true);
    setErrors({});
    setMessage("");
    try {
      const response = await fetch("/api/applications", { method: "POST", body: form, signal: AbortSignal.timeout(45000) });
      const result = await response.json();
      if (!response.ok || result.ok !== true) {
        setErrors(result.errors ?? {});
        setMessage(result.message ?? "Your application could not be sent. Please try again.");
      } else {
        setReference(result.reference);
      }
    } catch {
      setMessage("We could not confirm that your application was sent. Your entries are still here. Please check your connection and try again, or contact adam.loughnane@ucc.ie.");
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  function field(name: TextField, options: { multiline?: boolean; hint?: string; type?: string; autoComplete?: string } = {}) {
    const spec = textFields[name];
    const hint = options.hint ?? (options.multiline ? `Up to ${spec.maxLength.toLocaleString()} characters.` : undefined);
    const common = {
      id: name, name, required: spec.required, maxLength: spec.maxLength,
      "aria-invalid": errors[name] ? true as const : undefined,
      "aria-describedby": [hint ? `${name}-hint` : "", errors[name] ? `${name}-error` : ""].filter(Boolean).join(" ") || undefined,
    };
    return (
      <div className={styles.field}>
        <label htmlFor={name}>{spec.label}{!spec.required && <span> (optional)</span>}</label>
        {hint && <p id={`${name}-hint`} className={styles.hint}>{hint}</p>}
        {options.multiline ? <><textarea {...common} rows={name === "statement" ? 8 : 5} onChange={(event) => setCounts((current) => ({ ...current, [name]: event.target.value.length }))} /><p className={styles.count}>{counts[name] ?? 0} / {spec.maxLength.toLocaleString()} characters</p></> : <input {...common} type={options.type ?? "text"} autoComplete={options.autoComplete} />}
        {errors[name] && <p id={`${name}-error`} className={styles.error}>{errors[name]}</p>}
      </div>
    );
  }

  if (reference) return (
    <div className={styles.confirmation} ref={feedback} tabIndex={-1} role="status">
      <p className={siteStyles.eyebrow}>Thank you for applying</p>
      <h2>Your application has been submitted.</h2>
      <p>It has been sent to the organising team. We will contact you at the email address you provided.</p>
      <p className={styles.reference}>Your reference: <strong>{reference}</strong></p>
      <p>Please save this reference for your records.</p>
      <Link href="/" className={`${siteStyles.button} ${siteStyles.darkButton}`}>Back to the Summer School <span aria-hidden="true">→</span></Link>
    </div>
  );

  return (
    <form className={styles.form} action="/api/applications" method="post" encType="multipart/form-data" onSubmit={submit} onChange={() => { if (!pending) submissionId.current = null; }}>
      {!enabled && <div className={styles.notice}><strong>Applications opening soon</strong><p>You can review the application questions below. Submissions are not being accepted yet.</p></div>}
      <p className={styles.guidance}>Fields are required unless marked optional. No account is needed.</p>
      {message && <div className={styles.errorSummary} role="alert" ref={feedback} tabIndex={-1}><p>{message}</p>{Object.keys(errors).length > 0 && <ul>{Object.entries(errors).map(([name, error]) => <li key={name}><a href={`#${name}`}>{error}</a></li>)}</ul>}</div>}
      <noscript><p className={styles.notice}>Please enable JavaScript to submit this form, or contact <a href="mailto:adam.loughnane@ucc.ie">adam.loughnane@ucc.ie</a>.</p></noscript>
      <fieldset disabled={pending} className={styles.group}>
        <legend><span>01</span> About you</legend>
        <div className={styles.grid}>
          {field("name", { autoComplete: "name" })}
          {field("email", { type: "email", autoComplete: "email" })}
          {field("institution", { autoComplete: "organization" })}
          <div className={styles.field}><label htmlFor="careerStage">Programme / career stage</label><select id="careerStage" name="careerStage" required defaultValue="" aria-invalid={Boolean(errors.careerStage)} aria-describedby={errors.careerStage ? "careerStage-error" : undefined}><option value="" disabled>Select your career stage</option>{careerStages.map((stage) => <option key={stage}>{stage}</option>)}</select>{errors.careerStage && <p id="careerStage-error" className={styles.error}>{errors.careerStage}</p>}</div>
          {field("country", { autoComplete: "country-name" })}
        </div>
      </fieldset>
      <fieldset disabled={pending} className={styles.group}>
        <legend><span>02</span> Your interests and application</legend>
        {field("researchInterests", { multiline: true, hint: "Tell us about the questions, traditions, or creative practices that guide your work." })}
        {field("biography", { multiline: true, hint: "Introduce yourself and your academic or professional background." })}
        {field("statement", { multiline: true, hint: "How does your work connect with (non)Self and Space? What would you like to bring to, and explore through, the Summer School?" })}
      </fieldset>
      <fieldset disabled={pending} className={styles.group}>
        <legend><span>03</span> Links and photograph</legend>
        <div className={styles.grid}>
          {field("website", { hint: "For example, example.com or www.example.com. No https:// needed." })}
          {field("orcid", { hint: "Your 16-character iD, e.g. 0000-0002-1825-0097." })}
        </div>
        <div className={styles.field}>
          <label htmlFor="photo">Profile photograph <span>(optional)</span></label>
          <p id="photo-hint" className={styles.hint}>JPEG, PNG, or WebP. Maximum 2 MB. Your photograph will be attached to your application email.</p>
          <input ref={photoInput} type="file" id="photo" name="photo" accept="image/jpeg,image/png,image/webp" aria-invalid={Boolean(errors.photo)} aria-describedby={`photo-hint${errors.photo ? " photo-error" : ""}`} onChange={(event) => updatePhoto(Boolean(event.target.files?.length))} />
          {hasPhoto && <button type="button" className={styles.removePhoto} onClick={removePhoto}>Remove photograph</button>}
          {errors.photo && <p id="photo-error" className={styles.error}>{errors.photo}</p>}
        </div>
        {hasPhoto && <div className={styles.field}><label className={styles.checkbox} htmlFor="photoConsent"><input ref={photoConsentInput} type="checkbox" id="photoConsent" name="photoConsent" value="yes" required aria-invalid={Boolean(errors.photoConsent)} aria-describedby={errors.photoConsent ? "photoConsent-error" : undefined} /><span>I give permission for the organising team to use this photograph with my application. It will not be published without separate permission.</span></label>{errors.photoConsent && <p id="photoConsent-error" className={styles.error}>{errors.photoConsent}</p>}</div>}
      </fieldset>
      <fieldset disabled={pending} className={styles.group}>
        <legend><span>04</span> Graduate credit</legend>
        <div className={styles.field}><label htmlFor="ects">Are you interested in ECTS credit?</label><p id="ects-hint" className={styles.hint}>Credit arrangements and requirements will be confirmed separately.</p><select id="ects" name="ects" required defaultValue="" aria-invalid={Boolean(errors.ects)} aria-describedby={`ects-hint${errors.ects ? " ects-error" : ""}`}><option value="" disabled>Select an option</option>{creditChoices.map((choice) => <option key={choice}>{choice}</option>)}</select>{errors.ects && <p id="ects-error" className={styles.error}>{errors.ects}</p>}</div>
      </fieldset>
      <fieldset disabled={pending} className={styles.group}>
        <legend><span>05</span> Before you submit</legend>
        <div className={styles.privacy}>
          <h3>How your application is used</h3>
          <p>Your information and any photograph will be emailed to the PEWSS organising team to review your application and contact you about the Summer School.</p>
          <p>Submitting this form does not create a public profile or add you to a mailing list.</p>
        </div>
        <div className={styles.field}><label className={styles.checkbox} htmlFor="privacyAcknowledgement"><input type="checkbox" id="privacyAcknowledgement" name="privacyAcknowledgement" value="yes" required aria-invalid={Boolean(errors.privacyAcknowledgement)} aria-describedby={errors.privacyAcknowledgement ? "privacyAcknowledgement-error" : undefined} /><span>I understand that my information will be sent to the organising team and used to review my application and contact me about the Summer School.</span></label>{errors.privacyAcknowledgement && <p id="privacyAcknowledgement-error" className={styles.error}>{errors.privacyAcknowledgement}</p>}</div>
        <div className={styles.trap} aria-hidden="true"><label htmlFor="companyWebsite">Leave this field empty</label><input id="companyWebsite" name="companyWebsite" type="text" tabIndex={-1} autoComplete="off" /></div>
        <button type="submit" disabled={!enabled || pending} className={`${siteStyles.button} ${siteStyles.goldButton} ${styles.submit}`} aria-describedby="submit-note">{pending ? "Sending your application…" : "Submit application"}<span aria-hidden="true">→</span></button>
        <p id="submit-note" className={styles.hint}>{enabled ? "A confirmation will appear here once your application has been submitted. Please keep this page open while it sends." : "The submit button will become available when applications open."}</p>
      </fieldset>
    </form>
  );
}
