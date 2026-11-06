import {
  administrator,
  database,
  privateJson,
} from "../../../../../../lib/admin/supabase";
import { UUID } from "../../../../../../lib/admin/model";
export const runtime = "nodejs";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await administrator()))
      return privateJson({ message: "Sign in required." }, 401);
    const { id } = await params;
    if (!UUID.test(id)) return privateJson({ message: "Not found." }, 404);
    const { data, error } = await database()
      .from("pewss_applications")
      .select("photo")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error("Could not load photograph");
    const photo = data?.photo;
    if (
      !photo ||
      !["image/png", "image/jpeg", "image/webp"].includes(photo.content_type)
    )
      return privateJson({ message: "No photograph." }, 404);
    return new Response(Buffer.from(photo.content, "base64"), {
      headers: {
        "Content-Type": photo.content_type,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": `inline; filename="${photo.filename}"`,
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch {
    return privateJson({ message: "Could not load photograph." }, 503);
  }
}
