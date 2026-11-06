export const APPLICATION_RECIPIENT = "adam.loughnane@ucc.ie";
export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
export const MAX_REQUEST_BYTES = MAX_PHOTO_BYTES + 128 * 1024;

export const careerStages = ["MA student", "PhD student", "Early-career researcher", "Practitioner", "Other"] as const;
export const creditChoices = ["Yes", "No", "Not sure yet"] as const;

export const textFields = {
  name: { label: "Full name", maxLength: 120, required: true },
  email: { label: "Email address", maxLength: 254, required: true },
  institution: { label: "Institution or professional affiliation", maxLength: 200, required: false },
  country: { label: "Country", maxLength: 100, required: true },
  researchInterests: { label: "Research interests", maxLength: 1500, required: true },
  biography: { label: "Short biography", maxLength: 2000, required: true },
  statement: { label: "Statement of interest", maxLength: 5000, required: true },
  website: { label: "Website", maxLength: 500, required: false },
  orcid: { label: "ORCID iD", maxLength: 19, required: false },
} as const;

export type TextField = keyof typeof textFields;
export type FieldErrors = Record<string, string>;
export type Application = Record<TextField, string> & {
  careerStage: string;
  ects: string;
  privacyAcknowledgement: true;
  photoConsent: boolean;
  photo: { content: string; filename: string; content_type: string } | null;
};

function validOrcid(value: string) {
  if (!/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(value)) return false;
  const digits = value.replaceAll("-", "");
  let total = 0;
  for (const digit of digits.slice(0, 15)) total = (total + Number(digit)) * 2;
  const check = (12 - total % 11) % 11;
  return digits[15] === (check === 10 ? "X" : String(check));
}

export async function validateApplication(form: FormData): Promise<
  { ok: true; application: Application } | { ok: false; errors: FieldErrors }
> {
  const errors: FieldErrors = {};
  const values = {} as Record<TextField, string>;
  for (const [key, spec] of Object.entries(textFields)) {
    const entry = form.get(key);
    const value = typeof entry === "string" ? entry.trim() : "";
    values[key as TextField] = value;
    if (spec.required && !value) errors[key] = `Please enter your ${spec.label.toLowerCase()}.`;
    else if (value.length > spec.maxLength) errors[key] = `Please use ${spec.maxLength.toLocaleString()} characters or fewer.`;
    else if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) errors[key] = "Please remove unsupported characters.";
  }
  if (values.name && /[\r\n]/.test(values.name)) errors.name = "Please enter your name on one line.";
  if (values.email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(values.email)) errors.email = "Please enter a valid email address.";
  if (values.website) {
    try {
      const address = /^[a-z][a-z\d+.-]*:/i.test(values.website) ? values.website : `https://${values.website}`;
      if (/\s/.test(address)) throw new Error();
      const url = new URL(address);
      if (!["https:", "http:"].includes(url.protocol) || !url.hostname || url.username || url.password) throw new Error();
      values.website = url.href;
    } catch {
      errors.website = "Please enter a valid website address, such as example.com.";
    }
  }
  values.orcid = values.orcid.toUpperCase();
  if (values.orcid && !validOrcid(values.orcid)) errors.orcid = "Please enter a valid ORCID iD, such as 0000-0002-1825-0097.";

  const careerStage = form.get("careerStage");
  const ects = form.get("ects");
  if (!careerStages.some((choice) => choice === careerStage)) errors.careerStage = "Please select your programme or career stage.";
  if (!creditChoices.some((choice) => choice === ects)) errors.ects = "Please tell us whether you are interested in ECTS credit.";
  if (form.get("privacyAcknowledgement") !== "yes") errors.privacyAcknowledgement = "Please acknowledge how your application will be used.";

  const upload = form.get("photo");
  const photoConsent = form.get("photoConsent") === "yes";
  let photo: Application["photo"] = null;
  if (upload && typeof upload !== "string" && upload.size > 0) {
    if (upload.size > MAX_PHOTO_BYTES) {
      errors.photo = "Please choose a photograph smaller than 2 MB.";
    } else {
      const bytes = new Uint8Array(await upload.arrayBuffer());
      const png = [137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => bytes[i] === n);
      const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
      const webp = String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
      const type = png ? "image/png" : jpeg ? "image/jpeg" : webp ? "image/webp" : null;
      if (!type || type !== upload.type) {
        errors.photo = "Please upload a JPEG, PNG, or WebP photograph.";
      } else {
        photo = { content: Buffer.from(bytes).toString("base64"), filename: `profile-photo.${png ? "png" : jpeg ? "jpg" : "webp"}`, content_type: type };
      }
    }
    if (!photoConsent) errors.photoConsent = "Please confirm that the organising team may use this photograph with your application.";
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, application: { ...values, careerStage: careerStage as string, ects: ects as string, privacyAcknowledgement: true, photoConsent, photo } };
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
}

export function buildApplicationEmail(application: Application, from: string, reference: string) {
  const fields = [
    ["Application reference", reference],
    ["Full name", application.name],
    ["Email address", application.email],
    ["Institution or professional affiliation", application.institution || "Not provided"],
    ["Programme / career stage", application.careerStage],
    ["Country", application.country],
    ["Research interests", application.researchInterests],
    ["Short biography", application.biography],
    ["Statement of interest", application.statement],
    ["Website", application.website || "Not provided"],
    ["ORCID iD", application.orcid || "Not provided"],
    ["Interested in ECTS credit", application.ects],
    ["Profile photograph", application.photo ? "Attached; permission given for application use only" : "Not provided"],
    ["Privacy acknowledgement", "Acknowledged: send this application to Adam Loughnane for application review and related contact"],
  ];
  return {
    from,
    to: [APPLICATION_RECIPIENT],
    reply_to: application.email,
    subject: `PEWSS 2027 application: ${application.name}`,
    text: `PEWSS 2027 - (non)Self and Space\n\n${fields.map(([label, value]) => `${label}\n${value}`).join("\n\n")}`,
    html: `<div style="background:#f8f6f1;color:#272e2c;font-family:Arial,sans-serif;padding:28px;max-width:680px"><p style="letter-spacing:2px;font-size:12px">PEWSS 2027</p><h1 style="font-family:Georgia,serif;font-weight:normal">New application</h1><p>(non)Self and Space · 26–29 May 2027</p>${fields.map(([label, value]) => `<h2 style="font-size:13px;margin:24px 0 8px">${escapeHtml(label)}</h2><p style="line-height:1.6;margin:0;white-space:pre-wrap;overflow-wrap:anywhere">${escapeHtml(value)}</p>`).join("")}</div>`,
    ...(application.photo ? { attachments: [application.photo] } : {}),
  };
}

export type DeliveryConfig = { apiKey?: string; from?: string; open?: string };
export type ApplicationStore = {
  save(application: Application, reference: string): Promise<{ notified: boolean }>;
  markNotified(reference: string): Promise<void>;
};

export function applicationsEnabled(config: DeliveryConfig) {
  return config.open === "true" && Boolean(config.apiKey?.trim()) && Boolean(config.from?.trim());
}

export function sameOriginRequest(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (!origin) return false;
    const parsed = new URL(origin);
    const url = new URL(request.url);
    const host = request.headers.get("host") ?? url.host;
    const protocol = request.headers.get("x-forwarded-proto") ?? url.protocol.slice(0, -1);
    return parsed.origin === origin && parsed.host === host && parsed.protocol === `${protocol}:`;
  } catch { return false; }
}

export async function handleApplicationRequest(request: Request, config: DeliveryConfig, deliver: typeof fetch = fetch, store?: ApplicationStore) {
  const json = (body: object, status: number) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
  if (!sameOriginRequest(request)) return json({ message: "Please submit your application from the PEWSS website." }, 403);
  if (!applicationsEnabled(config)) return json({ message: "Applications are not open yet. Please return when submissions open." }, 503);
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data")) return json({ message: "Please use the application form to submit your information." }, 415);
  if (Number(request.headers.get("content-length")) > MAX_REQUEST_BYTES) return json({ message: "This submission is too large. Please use a photograph smaller than 2 MB." }, 413);

  let form: FormData;
  try {
    // Bound the actual streamed body as well as the optional Content-Length header.
    const reader = request.body?.getReader();
    if (!reader) return json({ message: "Your application is empty." }, 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_REQUEST_BYTES) {
        await reader.cancel();
        return json({ message: "This submission is too large. Please use a photograph smaller than 2 MB." }, 413);
      }
      chunks.push(value);
    }
    form = await new Response(Buffer.concat(chunks), { headers: { "Content-Type": request.headers.get("content-type")! } }).formData();
  } catch {
    return json({ message: "We could not read this submission. Please try again." }, 400);
  }
  if (form.get("companyWebsite")) return json({ message: "We could not accept this submission. Please try again." }, 400);
  const validated = await validateApplication(form);
  if (!validated.ok) return json({ message: "Please check the highlighted fields.", errors: validated.errors }, 400);
  const submissionId = form.get("submissionId");
  if (typeof submissionId !== "string" || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(submissionId)) return json({ message: "Please reload the page and try again." }, 400);
  const reference = `PEWSS-2027-${submissionId}`;
  if (store) {
    try {
      const saved = await store.save(validated.application, reference);
      if (saved.notified) return json({ ok: true, reference }, 200);
    } catch {
      return json({ message: "We could not save your application. Your entries are still here. Please try again, or contact adam.loughnane@ucc.ie." }, 503);
    }
  }
  try {
    const response = await deliver("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json", "Idempotency-Key": reference },
      body: JSON.stringify(buildApplicationEmail(validated.application, config.from!, reference)),
      signal: AbortSignal.timeout(20000),
    });
    const result = await response.json();
    if (!response.ok || typeof result.id !== "string" || !result.id) throw new Error("Email delivery request was not accepted");
    if (store) await store.markNotified(reference);
    return json({ ok: true, reference }, 200);
  } catch {
    // A durable record is a successful submission even if the organiser notification fails.
    if (store) return json({ ok: true, reference }, 200);
    // Never expose credentials, provider responses, or applicant data in logs/errors.
    return json({ message: "We could not confirm that your application was sent. Your entries are still here. Please try again, or contact adam.loughnane@ucc.ie." }, 502);
  }
}
