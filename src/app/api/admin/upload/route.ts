import { admin, sameOrigin } from "@/lib/admin-auth";
import { database } from "@/lib/store-db";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
export async function POST(req: Request) {
  if (!sameOrigin(req) || !(await admin()))
    return Response.json({ error: "Требуется вход" }, { status: 403 });
  if (Number(req.headers.get("content-length")) > 9000000)
    return Response.json(
      { error: "Файл должен быть меньше 8 МБ" },
      { status: 413 },
    );
  try {
    const file = (await req.formData()).get("file");
    if (
      !(file instanceof File) ||
      file.size > 8000000 ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    )
      return Response.json(
        { error: "Выберите JPG, PNG или WebP до 8 МБ" },
        { status: 400 },
      );
    const image = await sharp(Buffer.from(await file.arrayBuffer()), {
      limitInputPixels: 40000000,
    })
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 92 })
      .toBuffer();
    const id = randomUUID();
    database().prepare("INSERT INTO media(id,data) VALUES(?,?)").run(id, image);
    return Response.json({ url: "/api/media/" + id });
  } catch {
    return Response.json(
      { error: "Не удалось обработать изображение" },
      { status: 400 },
    );
  }
}
