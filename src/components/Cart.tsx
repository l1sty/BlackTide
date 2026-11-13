import { useLanguage } from "@/i18n/LanguageProvider";
import { useState, useRef, type FormEvent } from "react";
import { Minus, Plus, Trash2, ArrowUpRight } from "lucide-react";
import { type Product, type Line } from "@/data/products";
import type { PaymentSettings } from "@/data/settings";
import Prepayment from "./Prepayment";
import Overlay from "./Overlay";
import DeliveryFields from "./DeliveryFields";
export default function Cart({
  products,
  payment,
  items,
  setItems,
  close,
}: {
  products: Product[];
  payment: PaymentSettings;
  items: Line[];
  setItems: (lines: Line[]) => void;
  close: () => void;
}) {
  const { t, money, productText } = useLanguage();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(false);
  const sending = useRef(false);
  function change(i: number, qty: number) {
    setItems(
      items
        .map((l, j) =>
          i === j
            ? {
                ...l,
                qty,
              }
            : l,
        )
        .filter((l) => l.qty > 0),
    );
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending.current) return;
    const customer = Object.fromEntries(new FormData(e.currentTarget));
    sending.current = true;
    setBusy(true);
    setError("");
    try {
      const body = JSON.stringify({
        items: items.map((line) => ({
          ...line,
          unitPrice: products.find((p) => p.id === line.id)?.price,
        })),
        customer,
      });
      const res = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
        signal: AbortSignal.timeout(20000),
      });
      const response = await res.json().catch(() => {
        throw new Error(
          "Не удалось получить ответ сервера. Корзина сохранена.",
        );
      });
      if (!res.ok)
        throw new Error(
          typeof response?.error === "string" && response.error.trim()
            ? response.error
            : "Не удалось отправить заказ. Корзина сохранена.",
        );
      if (response?.ok !== true)
        throw new Error("Не удалось подтвердить заказ. Корзина сохранена.");
      setSuccess(true);
      setItems([]);
    } catch (err) {
      setError(
        err instanceof Error && err.name === "TimeoutError"
          ? "Сервер не ответил вовремя. Корзина сохранена."
          : err instanceof TypeError
            ? "Нет соединения с сервером. Проверьте интернет. Корзина сохранена."
            : err instanceof Error
              ? err.message
              : "Не удалось отправить заказ",
      );
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }
  return (
    <Overlay
      drawer
      close={() => {
        if (!busy) close();
      }}
      title={t("Корзина")}
    >
      <small className="mono">BLACK TIDE</small>
      <h2>{t("Корзина")}</h2>
      {success ? (
        <>
          <h3>{t("Заказ принят")}</h3>
          <p>{t("Black Tide свяжется с вами для подтверждения доставки.")}</p>
          <Prepayment payment={payment} />
          <button className="solid" onClick={close}>
            {t("В каталог")}
          </button>
        </>
      ) : !items.length ? (
        <>
          <p>{t("В корзине пока пусто")}</p>
          <button className="solid" onClick={close}>
            {t("Продолжить покупки")}
          </button>
        </>
      ) : (
        <>
          <fieldset disabled={busy}>
            {items.map((l, i) => {
              const p = products.find((x) => x.id === l.id)!;
              return (
                <div className="cart-line" key={l.id + l.size}>
                  <img src={p.images[0]} alt="" />
                  <div>
                    <strong>{productText(p, "name")}</strong>
                    <small>
                      {productText(p, "color")} · {l.size}
                    </small>
                    <div className="stepper">
                      <button
                        aria-label={t("Уменьшить количество")}
                        onClick={() => change(i, l.qty - 1)}
                      >
                        <Minus />
                      </button>
                      {l.qty}
                      <button
                        disabled={l.qty >= 99}
                        aria-label={t("Увеличить количество")}
                        onClick={() => change(i, l.qty + 1)}
                      >
                        <Plus />
                      </button>
                    </div>
                  </div>
                  <div className="line-end">
                    {money(p.price * l.qty)}
                    <button
                      aria-label={t("Удалить позицию")}
                      onClick={() => change(i, 0)}
                    >
                      <Trash2 />
                    </button>
                  </div>
                </div>
              );
            })}
          </fieldset>
          <div className="total">
            <span>{t("Итого")}</span>
            <strong>
              {money(
                items.reduce(
                  (s, l) =>
                    s + products.find((p) => p.id === l.id)!.price * l.qty,
                  0,
                ),
              )}
            </strong>
          </div>
          <form onSubmit={submit}>
            <Prepayment payment={payment} />
            <h3>{t("Быстрый заказ")}</h3>
            <fieldset disabled={busy}>
              {[
                ["name", t("Имя"), "name"],
                ["phone", t("Телефон"), "tel"],
                ["telegram", t("Ник в Telegram"), "off"],
              ].map(([key, title, auto]) => (
                <label key={key}>
                  {t(title)}
                  <input
                    name={key}
                    type={key === "phone" ? "tel" : "text"}
                    autoComplete={auto}
                    required
                    maxLength={120}
                  />
                </label>
              ))}
              <DeliveryFields />
              {error && <p role="alert">{t(error)}</p>}
              <button className="solid" type="submit">
                {busy ? t("Отправляем…") : t("Оформить заказ")}
                <ArrowUpRight />
              </button>
            </fieldset>
          </form>
        </>
      )}
    </Overlay>
  );
}
