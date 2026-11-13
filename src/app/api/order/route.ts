import { products, money, validLine, type Line } from "@/data/products";
export async function POST(req: Request) {
  const error = (message: string, status: number) =>
    Response.json({ error: message }, { status });
  let data;
  try {
    data = await req.json();
  } catch {
    return error("Некорректный формат заказа", 400);
  }
  const lines: Line[] = data?.items;
  const c = data?.customer;
  if (
    !Array.isArray(lines) ||
    !lines.length ||
    lines.length > 24 ||
    !lines.every(validLine)
  )
    return error("Проверьте товары и размеры", 400);
  if (
    !c ||
    !["name", "phone", "telegram", "city", "branch"].every(
      (k) =>
        typeof c[k] === "string" &&
        c[k].trim().length > 0 &&
        c[k].length <= 120 &&
        !/[\r\n]/.test(c[k]),
    )
  )
    return error("Заполните контактные данные и адрес доставки", 400);
  if (
    !/^[+\d() \-]{7,24}$/.test(c.phone) ||
    c.phone.replace(/\D/g, "").length < 7
  )
    return error("Проверьте номер телефона", 400);
  const token = process.env.TELEGRAM_BOT_TOKEN,
    chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat)
    return error("Приём заказов временно недоступен. Корзина сохранена.", 503);
  let total = 0;
  const rows = lines.map((line) => {
    const p = products.find((x) => x.id === line.id)!;
    total += p.price * line.qty;
    return `${p.id} · ${p.name} · ${line.size} × ${line.qty} — ${money(p.price * line.qty)}`;
  });
  const text = [
    "Новый заказ — Black Tide",
    "",
    ...rows,
    "",
    `Итого: ${money(total)}`,
    `Имя: ${c.name}`,
    `Телефон: ${c.phone}`,
    `Telegram: ${c.telegram}`,
    `Город: ${c.city}`,
    `Новая Почта: ${c.branch}`,
  ].join("\n");
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chat, text }),
        signal: AbortSignal.timeout(12000),
      },
    );
    if (!response.ok || !(await response.json()).ok) throw new Error();
    return Response.json({ ok: true });
  } catch {
    return error("Не удалось подтвердить отправку. Корзина сохранена.", 502);
  }
}
