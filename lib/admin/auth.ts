import "server-only";
import { betterAuth } from "better-auth";
import { headers } from "next/headers";
import { database } from "./database";
import { authOptions } from "./auth-config";
import { ADMIN_EMAIL, isAdministrator } from "./model";

export function adminConfigured() {
  return Boolean(process.env.DATABASE_URL && process.env.BETTER_AUTH_SECRET && process.env.PEWSS_ADMIN_USER_ID);
}
function buildAuth() {
  return betterAuth(authOptions(database(), process.env.BETTER_AUTH_SECRET ?? "", process.env.BETTER_AUTH_URL ?? "https://pewss.org", async (code) => {
    if (!process.env.RESEND_API_KEY || !process.env.APPLICATION_FROM_EMAIL) throw new Error("Sign-in email is not configured");
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.APPLICATION_FROM_EMAIL, to: [ADMIN_EMAIL],
        subject: "Your PEWSS administrator sign-in code",
        text: `Your PEWSS administrator sign-in code is: ${code}\n\nEnter it at https://pewss.org/admin. It expires in 10 minutes. If you did not request this code, you can ignore this email.` }),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error("Sign-in email could not be sent");
  }));
}
let instance: ReturnType<typeof buildAuth> | undefined;
export function auth() { return instance ??= buildAuth(); }
export async function administrator() {
  if (!adminConfigured()) return null;
  const session = await auth().api.getSession({ headers: await headers() });
  return session && isAdministrator(session.user, process.env.PEWSS_ADMIN_USER_ID) ? session.user : null;
}
