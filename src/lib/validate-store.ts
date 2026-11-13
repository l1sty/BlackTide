import { categories, productStatuses, type Product } from "@/data/products";
import type { StoreData } from "@/data/settings";
const text = (value: unknown, max: number) =>
  typeof value === "string" && value.length <= max;
const image = (value: unknown) =>
  typeof value === "string" &&
  /^\/(?:images\/[\w.\-/]+|api\/media\/[\da-f-]+)$/.test(value) &&
  !value.includes("..");
export function validStore(value: unknown): value is StoreData {
  if (!value || typeof value !== "object") return false;
  const data = value as StoreData;
  if (
    !Number.isSafeInteger(data.revision) ||
    data.revision < 0 ||
    !Array.isArray(data.products) ||
    data.products.length > 200
  )
    return false;
  const ids = new Set<string>();
  for (const p of data.products) {
    if (
      !p ||
      !/^BT-[\w-]{1,30}$/.test(p.id) ||
      ids.has(p.id) ||
      !text(p.name, 150) ||
      !p.name.trim() ||
      !categories.slice(1).includes(p.category) ||
      !Object.hasOwn(productStatuses, p.status) ||
      !Number.isSafeInteger(p.price) ||
      p.price < 1 ||
      p.price > 1000000 ||
      !["material", "fit", "color", "dimensions"].every((k) =>
        text(p[k as keyof Product], 2000),
      ) ||
      !["nameUk", "materialUk", "fitUk", "colorUk"].every(
        (k) =>
          p[k as keyof Product] === undefined ||
          text(p[k as keyof Product], 2000),
      ) ||
      !Array.isArray(p.sizes) ||
      !p.sizes.length ||
      p.sizes.length > 20 ||
      !p.sizes.every((s) => text(s, 20) && s.trim()) ||
      !Array.isArray(p.images) ||
      !p.images.length ||
      p.images.length > 12 ||
      !p.images.every(image) ||
      (p.imageLabels !== undefined &&
        (!Array.isArray(p.imageLabels) ||
          !p.imageLabels.every((s) => text(s, 100)))) ||
      (p.measurements !== undefined &&
        (!p.measurements ||
          typeof p.measurements !== "object" ||
          Array.isArray(p.measurements) ||
          Object.entries(p.measurements).some(
            ([k, v]) =>
              !text(k, 120) ||
              typeof v !== "number" ||
              !Number.isFinite(v) ||
              v <= 0 ||
              v > 300,
          )))
    )
      return false;
    ids.add(p.id);
  }
  const payment = data.payment;
  return Boolean(
    payment &&
    text(payment.card, 34) &&
    (!payment.card || /^(?:\d{16,19}|UA\d{27})$/.test(payment.card)) &&
    text(payment.recipient, 120) &&
    text(payment.bank, 120) &&
    text(payment.terms, 1000) &&
    text(payment.termsUk, 1000),
  );
}
