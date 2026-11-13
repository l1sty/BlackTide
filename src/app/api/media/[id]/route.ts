import { database } from "@/lib/store-db";
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[\da-f-]{36}$/.test(id)) return new Response(null, { status: 404 });
  const row = database()
    .prepare("SELECT data FROM media WHERE id=?")
    .get(id) as { data: Uint8Array } | undefined;
  if (!row) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(row.data), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public,max-age=31536000,immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
