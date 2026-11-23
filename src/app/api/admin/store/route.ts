import { admin, sameOrigin } from "@/lib/admin-auth";
import { readStore, saveStore } from "@/lib/store-db";
import { validStore } from "@/lib/validate-store";
export async function GET() {
  if (!(await admin()))
    return Response.json({ error: "Войдите в админ-панель" }, { status: 401 });
  return Response.json(await readStore(), {
    headers: { "Cache-Control": "no-store" },
  });
}
export async function PUT(req: Request) {
  if (!sameOrigin(req) || !(await admin()))
    return Response.json({ error: "Требуется вход" }, { status: 403 });
  if (Number(req.headers.get("content-length")) > 1000000)
    return Response.json({ error: "Слишком большой запрос" }, { status: 413 });
  let data;
  try {
    data = await req.json();
  } catch {
    return Response.json({ error: "Некорректный запрос" }, { status: 400 });
  }
  if (!validStore(data))
    return Response.json(
      {
        error:
          "Проверьте поля товаров и реквизиты. Фотографии должны быть загружены или находиться в /images/.",
      },
      { status: 400 },
    );
  if (!(await saveStore(data)))
    return Response.json(
      {
        error:
          "Данные изменены в другой вкладке. Скопируйте свои изменения и перезагрузите страницу.",
      },
      { status: 409 },
    );
  return Response.json(await readStore(), {
    headers: { "Cache-Control": "no-store" },
  });
}
