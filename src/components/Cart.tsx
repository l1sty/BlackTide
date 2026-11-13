import { useState, useRef, type FormEvent } from "react";
import { Minus, Plus, Trash2, ArrowUpRight } from "lucide-react";
import { products, money, type Line } from "@/data/products";
import Overlay from "./Overlay";
export default function Cart({
  items,
  setItems,
  close,
}: {
  items: Line[];
  setItems: (lines: Line[]) => void;
  close: () => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(false);
  const sending = useRef(false);
  function change(i: number, qty: number) {
    setItems(
      items
        .map((l, j) => (i === j ? { ...l, qty } : l))
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
      const body = JSON.stringify({ items, customer });
      const res = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });
      const response = await res.json();
      if (!res.ok) throw new Error(response.error);
      setSuccess(true);
      setItems([]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось отправить заказ",
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
      title="Корзина"
    >
      <small className="mono">BLACK TIDE</small>
      <h2>Корзина</h2>
      {success ? (
        <>
          <h3>Заказ принят</h3>
          <p>Black Tide свяжется с вами для подтверждения доставки.</p>
          <button className="solid" onClick={close}>
            В каталог
          </button>
        </>
      ) : !items.length ? (
        <>
          <p>В корзине пока пусто</p>
          <button className="solid" onClick={close}>
            Продолжить покупки
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
                    <strong>{p.name}</strong>
                    <small>
                      {p.color} · {l.size}
                    </small>
                    <div className="stepper">
                      <button
                        aria-label="Уменьшить количество"
                        onClick={() => change(i, l.qty - 1)}
                      >
                        <Minus />
                      </button>
                      {l.qty}
                      <button
                        disabled={l.qty >= 99}
                        aria-label="Увеличить количество"
                        onClick={() => change(i, l.qty + 1)}
                      >
                        <Plus />
                      </button>
                    </div>
                  </div>
                  <div className="line-end">
                    {money(p.price * l.qty)}
                    <button
                      aria-label="Удалить позицию"
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
            <span>Итого</span>
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
            <h3>Быстрый заказ</h3>
            <fieldset disabled={busy}>
              {[
                ["name", "Имя", "name"],
                ["phone", "Телефон", "tel"],
                ["telegram", "Ник в Telegram", "off"],
                ["city", "Город", "address-level2"],
                ["branch", "Отделение Новой Почты", "off"],
              ].map(([key, title, auto]) => (
                <label key={key}>
                  {title}
                  <input
                    name={key}
                    type={key === "phone" ? "tel" : "text"}
                    autoComplete={auto}
                    required
                    maxLength={120}
                  />
                </label>
              ))}
              {error && <p role="alert">{error}</p>}
              <button className="solid" type="submit">
                {busy ? "Отправляем…" : "Оформить заказ"}
                <ArrowUpRight />
              </button>
            </fieldset>
          </form>
        </>
      )}
    </Overlay>
  );
}
