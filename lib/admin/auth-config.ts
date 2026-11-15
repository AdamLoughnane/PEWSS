import { createHmac } from "node:crypto";
import type { BetterAuthOptions } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { ADMIN_EMAIL } from "./model";

export function authOptions(database: BetterAuthOptions["database"], secret: string, baseURL: string,
  sendCode: (code: string) => Promise<void>) {
  if (secret.length < 32) throw new Error("PEWSS authentication secret is missing or too short");
  return {
    appName: "PEWSS Administration",
    database, secret, baseURL,
    basePath: "/api/admin/auth",
    trustedOrigins: [baseURL],
    emailAndPassword: { enabled: false },
    user: { modelName: "pewss_auth_user", changeEmail: { enabled: false }, deleteUser: { enabled: false } },
    session: {
      modelName: "pewss_auth_session", expiresIn: 60 * 60 * 24 * 7,
      disableSessionRefresh: true, cookieCache: { enabled: false },
    },
    account: { modelName: "pewss_auth_account" },
    verification: { modelName: "pewss_auth_verification" },
    advanced: {
      cookiePrefix: "pewss-admin",
      useSecureCookies: baseURL.startsWith("https://"),
      defaultCookieAttributes: { httpOnly: true, sameSite: "lax" as const, path: "/" },
    },
    // No public Better Auth handler is mounted. The single PEWSS endpoint enforces
    // the fixed organiser address, same-origin requests and persistent rate limits.
    databaseHooks: { user: { create: { before: async () => false as const } } },
    plugins: [emailOTP({
      disableSignUp: true, otpLength: 8, expiresIn: 600, allowedAttempts: 5,
      storeOTP: { hash: async (otp) => createHmac("sha256", secret).update(otp).digest("hex") },
      async sendVerificationOTP({ email, otp, type }) {
        if (email.toLowerCase() !== ADMIN_EMAIL || type !== "sign-in") throw new Error("Sign-in unavailable");
        await sendCode(otp);
      },
    })],
  } satisfies BetterAuthOptions;
}
