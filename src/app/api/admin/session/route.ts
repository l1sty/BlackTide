import {
  admin,
  configured,
  correctPassword,
  allowAttempt,
  sameOrigin,
  login,
  logout,
} from "@/lib/admin-auth";
export async function GET() {
  return Response.json(
    { authenticated: await admin(), configured: configured() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(req: Request) {
  if (!sameOrigin(req))
    return Response.json(
      { error: "Недопустимый источник запроса" },
      { status: 403 },
    );
  if (!configured())
    return Response.json(
      { error: "Задайте ADMIN_PASSWORD и ADMIN_SESSION_SECRET на сервере" },
      { status: 503 },
    );
  if (!allowAttempt())
    return Response.json(
      { error: "Слишком много попыток. Повторите через 15 минут." },
      { status: 429 },
    );
  let data;
  try {
    data = await req.json();
  } catch {
    return Response.json({ error: "Некорректный запрос" }, { status: 400 });
  }
  if (
    typeof data?.password !== "string" ||
    data.password.length > 200 ||
    !correctPassword(data.password)
  )
    return Response.json({ error: "Неверный пароль" }, { status: 401 });
  await login(new URL(req.url).protocol === "https:");
  return Response.json({ ok: true });
}
export async function DELETE(req: Request) {
  if (!sameOrigin(req))
    return Response.json(
      { error: "Недопустимый источник запроса" },
      { status: 403 },
    );
  await logout();
  return Response.json({ ok: true });
}
