import {
  administrator,
  privateJson,
  sameOrigin,
} from "../../../../lib/admin/supabase";
import { applicationStore } from "../../../../lib/admin/applications";
import { parseApplicationEmail } from "../../../../lib/admin/import";
import { UUID } from "../../../../lib/admin/model";
import {
  MAX_REQUEST_BYTES,
  validateApplication,
} from "../../../../lib/applications";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return privateJson({ message: "Please use the dashboard." }, 403);
  try {
    if (!(await administrator()))
      return privateJson({ message: "Administrator sign-in required." }, 401);
    const reader = request.body?.getReader();
    if (!reader) return privateJson({ message: "Missing email." }, 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_REQUEST_BYTES) {
        await reader.cancel();
        return privateJson({ message: "The import is too large." }, 413);
      }
      chunks.push(value);
    }
    const form = await new Response(Buffer.concat(chunks), {
      headers: { "Content-Type": request.headers.get("content-type") ?? "" },
    }).formData();
    if (form.get("confirm") !== "yes")
      return privateJson(
        { message: "Review and confirm the imported responses first." },
        400,
      );
    let parsed: Record<string, string>;
    try {
      parsed = parseApplicationEmail(String(form.get("emailText") ?? ""));
    } catch (error) {
      return privateJson({ message: (error as Error).message }, 400);
    }
    const id = parsed.reference.replace("PEWSS-2027-", "");
    if (!UUID.test(id))
      return privateJson({ message: "Invalid reference." }, 400);
    const data = new FormData();
    Object.entries(parsed).forEach(([key, value]) => data.set(key, value));
    data.set("privacyAcknowledgement", "yes");
    const photo = form.get("photo");
    if (photo && typeof photo !== "string" && photo.size) {
      if (
        !parsed.photoDescription.startsWith(
          "Attached; permission given for application use only",
        )
      )
        return privateJson(
          {
            message:
              "The original email does not record permission for a photograph.",
          },
          400,
        );
      data.set("photo", photo);
      data.set("photoConsent", "yes");
    } else if (parsed.photoDescription.startsWith("Attached"))
      return privateJson(
        {
          message:
            "Attach the original photograph so the imported record is complete.",
        },
        400,
      );
    const validated = await validateApplication(data);
    if (!validated.ok)
      return privateJson(
        {
          message:
            "Some imported fields are invalid. Check the original email.",
          errors: validated.errors,
        },
        400,
      );
    const received = String(form.get("receivedAt") ?? "");
    const date = new Date(received);
    if (
      !received ||
      !Number.isFinite(date.getTime()) ||
      date.getTime() > Date.now() + 60000
    )
      return privateJson(
        { message: "Enter the original email’s received date and time." },
        400,
      );
    const store = applicationStore({
      source: "email_import",
      receivedAt: date.toISOString(),
    });
    await store.save(validated.application, parsed.reference);
    await store.markNotified(parsed.reference);
    return privateJson({ ok: true, id });
  } catch {
    return privateJson(
      {
        message:
          "Import could not be completed. Check that this reference has not already been imported with different details.",
      },
      503,
    );
  }
}
