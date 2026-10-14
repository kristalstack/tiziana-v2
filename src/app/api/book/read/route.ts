import { authenticatedDatabase, jsonError } from "@/lib/tiziana-server";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export async function GET(request: Request) {
  const auth = await authenticatedDatabase(request);
  if (!auth) return jsonError("Authentication required", 401);
  const { data, error } = await auth.db.from("product_entitlements")
    .select("id").eq("user_id", auth.user.id).eq("product", "book").limit(1);
  if (error) return jsonError("Access could not be verified", 503);
  if (!data?.length) return jsonError("Book purchase required", 403);
  try {
    const pdf = await readFile(path.join(process.cwd(), "private", "la-psicologia-del-dating.pdf"));
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=la-psicologia-del-dating.pdf",
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Book file unavailable", error);
    return jsonError("Book unavailable", 503);
  }
}
