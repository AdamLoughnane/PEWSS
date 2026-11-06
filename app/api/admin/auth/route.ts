import { createHash } from "node:crypto";
import { ADMIN_EMAIL, isAdministrator } from "../../../../lib/admin/model";
import {
  adminConfigured,
  authClient,
  database,
  privateJson,
  sameOrigin,
  smallJson,
} from "../../../../lib/admin/supabase";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return privateJson({ message: "Please use the PEWSS sign-in page." }, 403);
  if (!adminConfigured())
    return privateJson(
      { message: "Administrator sign-in is not configured yet." },
      503,
    );
  try {
    const body = await smallJson(request);
    const client = await authClient();
    if (body.action === "logout") {
      const { error } = await client.auth.signOut();
      return error
        ? privateJson({ message: "Could not sign out. Please try again." }, 503)
        : privateJson({ ok: true });
    }
    if (body.action !== "request" && body.action !== "verify")
      return privateJson({ message: "Invalid sign-in request." }, 400);
    // This endpoint never accepts an alternative destination for a login email.
    if (
      typeof body.email !== "string" ||
      body.email.trim().toLowerCase() !== ADMIN_EMAIL
    )
      return privateJson(
        { message: "This account does not have administrator access." },
        403,
      );
    const ip =
      request.headers.get("x-vercel-forwarded-for") ??
      request.headers.get("x-forwarded-for") ??
      "local";
    const key = createHash("sha256")
      .update(`${process.env.SUPABASE_SECRET_KEY}:${ip}:${body.action}`)
      .digest("hex");
    const db = database();
    const { data: allowed, error: limitError } = await db.rpc(
      "pewss_auth_limit",
      { p_key: key, p_seconds: 600, p_max: body.action === "verify" ? 10 : 5 },
    );
    if (limitError)
      return privateJson(
        { message: "Sign-in is temporarily unavailable." },
        503,
      );
    if (!allowed)
      return privateJson(
        {
          message:
            "Too many attempts. Please wait ten minutes before trying again.",
        },
        429,
      );
    if (body.action === "request") {
      const { data: mailAllowed, error } = await db.rpc("pewss_auth_limit", {
        p_key: "admin-email",
        p_seconds: 60,
        p_max: 1,
      });
      if (error)
        return privateJson(
          { message: "Sign-in is temporarily unavailable." },
          503,
        );
      if (!mailAllowed)
        return privateJson(
          {
            message:
              "A code was requested recently. Please wait a minute before requesting another.",
          },
          429,
        );
      const result = await client.auth.signInWithOtp({
        email: ADMIN_EMAIL,
        options: { shouldCreateUser: false },
      });
      return result.error
        ? privateJson(
            {
              message:
                "Could not send a sign-in code. Please try again shortly.",
            },
            503,
          )
        : privateJson({ ok: true });
    }
    if (typeof body.code !== "string" || !/^\d{6,8}$/.test(body.code.trim()))
      return privateJson({ message: "Enter the code from your email." }, 400);
    const { data, error } = await client.auth.verifyOtp({
      email: ADMIN_EMAIL,
      token: body.code.trim(),
      type: "email",
    });
    if (error || !isAdministrator(data.user, process.env.PEWSS_ADMIN_USER_ID)) {
      if (data.session) await client.auth.signOut();
      return privateJson(
        {
          message:
            "That code is invalid or has expired. Please request a new code.",
        },
        401,
      );
    }
    return privateJson({ ok: true });
  } catch {
    return privateJson(
      { message: "Sign-in could not be completed. Please try again." },
      503,
    );
  }
}
