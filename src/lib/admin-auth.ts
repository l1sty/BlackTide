import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { database } from "./store-db";
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
    process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET,
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
  return req.headers.get("origin") === new URL(req.url).origin;
}
export function allowAttempt() {
  const db = database(),
    now = Date.now();
  db.exec("BEGIN IMMEDIATE");
  try {
    const row = db
      .prepare("SELECT count,started FROM login_attempts WHERE id=1")
      .get() as { count: number; started: number } | undefined;
    if (row && now - row.started < 900000 && row.count >= 30) {
      db.exec("COMMIT");
      return false;
    }
    const reset = !row || now - row.started >= 900000;
    db.prepare(
      "INSERT INTO login_attempts(id,count,started) VALUES(1,1,?) ON CONFLICT(id) DO UPDATE SET count=?,started=?",
    ).run(now, reset ? 1 : row!.count + 1, reset ? now : row!.started);
    db.exec("COMMIT");
    return true;
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}
