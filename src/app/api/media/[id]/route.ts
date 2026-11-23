import { database } from "@/lib/store-db";
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[\da-f-]{36}$/.test(id)) return new Response(null, { status: 404 });
  const { rows: [row] } = await (await database()).execute({
    sql: "SELECT data FROM media WHERE id=?", args: [id],
  });
  if (!row || !(row.data instanceof ArrayBuffer)) return new Response(null, { status: 404 });
  return new Response(row.data, {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public,max-age=31536000,immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
