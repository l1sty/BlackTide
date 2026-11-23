import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { database, storageConfigured } from "./store-db";
const cookieName = "black-tide-admin";
function same(a: string, b: string) {
  return timingSafeEqual(
    createHash("sha256").update(a).digest(),
    createHash("sha256").update(b).digest(),
  );
}
function signature(value: string) {
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET || "")
    .update(value)
    .digest("hex");
}
export function configured() {
  return Boolean(
    storageConfigured() && process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET,
  );
}
export function correctPassword(password: string) {
  return configured() && same(password, process.env.ADMIN_PASSWORD!);
}
export async function admin() {
  if (!configured()) return false;
  const token = (await cookies()).get(cookieName)?.value || "",
    [expires, sig] = token.split(".");
  return (
    Number(expires) > Date.now() &&
    Number(expires) < Date.now() + 7 * 60 * 60 * 1000 &&
    same(sig || "", signature(expires))
  );
}
export async function login(secure: boolean) {
  const expires = String(Date.now() + 6 * 60 * 60 * 1000);
  (await cookies()).set(cookieName, expires + "." + signature(expires), {
    httpOnly: true,
    sameSite: "strict",
    secure,
    path: "/",
    maxAge: 21600,
  });
}
export async function logout() {
  (await cookies()).delete(cookieName);
}
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    const url = new URL(origin);
    return ["https:", "http:"].includes(url.protocol) && url.host === req.headers.get("host");
  } catch {
    return false;
  }
}
export async function allowAttempt() {
  const db = await database();
  const now = Date.now();
  const { rows } = await db.execute({
    sql: `INSERT INTO login_attempts(id,count,started) VALUES(1,1,?)
          ON CONFLICT(id) DO UPDATE SET
            count=CASE WHEN started<=? THEN 1 ELSE count+1 END,
            started=CASE WHEN started<=? THEN excluded.started ELSE started END
          WHERE started<=? OR count<30 RETURNING count`,
    args: [now, now-900000, now-900000, now-900000],
  });
  return rows.length > 0;
}

