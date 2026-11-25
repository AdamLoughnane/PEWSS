import { createHmac } from "node:crypto";
import type { AuthenticationResponseJSON } from "@simplewebauthn/browser";
import { ADMIN_EMAIL, isAdministrator } from "../../../../lib/admin/model";
import { auth } from "../../../../lib/admin/auth";
import { query } from "../../../../lib/admin/database";
import { adminConfigured, privateJson, sameOrigin, smallJson } from "../../../../lib/admin/server";

export const runtime = "nodejs";
function withCookies(source: Response, body: object = { ok: true }) {
  const response = privateJson(body);
  for (const cookie of source.headers.getSetCookie()) response.headers.append("Set-Cookie", cookie);
  return response;
}
const passkeyActions = ["passkey-register-options", "passkey-register-verify", "passkey-login-options", "passkey-login-verify"];
async function passkey(request: Request, body: Record<string, unknown>) {
  const headers = request.headers;
  if (body.action === "passkey-register-options" || body.action === "passkey-register-verify") {
    // Only the signed-in organiser can add a passkey, and only to their own account.
    const session = await auth().api.getSession({ headers });
    if (!session || !isAdministrator(session.user, process.env.PEWSS_ADMIN_USER_ID))
      return privateJson({ message: "Please sign in before setting up a passkey." }, 401);
    const response = body.action === "passkey-register-options"
      ? await auth().api.generatePasskeyRegistrationOptions({ headers, query: { name: "PEWSS administrator" }, asResponse: true })
      : await auth().api.verifyPasskeyRegistration({
        body: { response: body.response, name: "PEWSS administrator" }, headers, asResponse: true,
      });
    if (response.status === 403)
      return privateJson({ message: "For security, a passkey can only be added within 15 minutes of signing in. Please sign out, sign in again with an emailed code, and then set up your passkey." }, 403);
    if (!response.ok) return privateJson({ message: "The passkey could not be set up. Please try again." }, 400);
    const data = await response.json();
    return withCookies(response, body.action === "passkey-register-options" ? { options: data } : { ok: true });
  }
  const ip = headers.get("x-vercel-forwarded-for") ?? headers.get("x-forwarded-for") ?? "local";
  const key = createHmac("sha256", process.env.BETTER_AUTH_SECRET!).update(`${ip}:passkey`).digest("hex");
  if (!await withinLimit(key, 600, 20))
    return privateJson({ message: "Too many attempts. Please wait ten minutes before trying again." }, 429);
  if (body.action === "passkey-login-options") {
    const response = await auth().api.generatePasskeyAuthenticationOptions({ headers, asResponse: true });
    if (!response.ok) return privateJson({ message: "Passkey sign-in is unavailable. Please use an emailed code." }, 503);
    return withCookies(response, { options: await response.json() });
  }
  const response = await auth().api.verifyPasskeyAuthentication({ body: { response: body.response as AuthenticationResponseJSON }, headers, asResponse: true });
  const data = response.ok ? await response.json() : null;
  if (!data || !isAdministrator(data.user, process.env.PEWSS_ADMIN_USER_ID))
    return privateJson({ message: "That passkey was not recognised. Please try again or use an emailed code." }, 401);
  // As with codes: cookies only after verifying identity; never return a session token in JSON.
  return withCookies(response);
}
async function withinLimit(key: string, seconds: number, maximum: number) {
  const result = await query<{ allowed: boolean }>(
    "select public.pewss_auth_limit($1,$2,$3) as allowed", [key, seconds, maximum]);
  return result.rows[0]?.allowed === true;
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return privateJson({ message: "Please use the PEWSS sign-in page." }, 403);
  if (!adminConfigured()) return privateJson({ message: "Administrator sign-in is not configured yet." }, 503);
  try {
    const body = await smallJson(request);
    if (body.action === "logout") {
      const response = await auth().api.signOut({ headers: request.headers, asResponse: true });
      if (!response.ok) return privateJson({ message: "Could not sign out. Please try again." }, 503);
      return withCookies(response);
    }
    if (passkeyActions.includes(body.action)) {
      if (body.action.endsWith("-verify") && (typeof body.response !== "object" || body.response === null || Array.isArray(body.response)))
        return privateJson({ message: "Invalid passkey response." }, 400);
      return await passkey(request, body);
    }
    if (body.action !== "request" && body.action !== "verify") return privateJson({ message: "Invalid sign-in request." }, 400);
    if (typeof body.email !== "string" || body.email.trim().toLowerCase() !== ADMIN_EMAIL)
      return privateJson({ message: "This account does not have administrator access." }, 403);
    const ip = request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-forwarded-for") ?? "local";
    const key = createHmac("sha256", process.env.BETTER_AUTH_SECRET!).update(`${ip}:${body.action}`).digest("hex");
    if (!await withinLimit(key, 600, body.action === "verify" ? 10 : 5))
      return privateJson({ message: "Too many attempts. Please wait ten minutes before trying again." }, 429);
    if (body.action === "request") {
      if (!await withinLimit("admin-email", 60, 1))
        return privateJson({ message: "A code was requested recently. Please wait a minute before requesting another." }, 429);
      await auth().api.sendVerificationOTP({ body: { email: ADMIN_EMAIL, type: "sign-in" }, headers: request.headers });
      return privateJson({ ok: true });
    }
    if (typeof body.code !== "string" || !/^\d{8}$/.test(body.code.trim()))
      return privateJson({ message: "Enter the eight-digit code from your email." }, 400);
    const response = await auth().api.signInEmailOTP({
      body: { email: ADMIN_EMAIL, otp: body.code.trim() }, headers: request.headers, asResponse: true,
    });
    const data = await response.json();
    if (!response.ok || !isAdministrator(data.user, process.env.PEWSS_ADMIN_USER_ID))
      return privateJson({ message: "That code is invalid or has expired. Please request a new code." }, 401);
    // Send cookies only after verifying identity; never return a session token in JSON.
    return withCookies(response);
  } catch {
    return privateJson({ message: "Sign-in could not be completed. Please try again." }, 503);
  }
}
