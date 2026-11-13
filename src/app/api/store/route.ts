import { readStore } from "@/lib/store-db";
export async function GET() {
  return Response.json(readStore(), {
    headers: { "Cache-Control": "no-store" },
  });
}
