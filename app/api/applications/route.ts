import { handleApplicationRequest } from "../../../lib/applications";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  return handleApplicationRequest(request, {
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.APPLICATION_FROM_EMAIL,
    open: process.env.APPLICATIONS_OPEN,
  });
}
