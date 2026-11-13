"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { useEffect, useState } from "react";

import { ArrowDown, ArrowUpRight, Plus } from "lucide-react";
import Navigation from "./Navigation";
import { useStoreScroll } from "./useStoreScroll";
import ProductView from "./ProductView";
import Cart from "./Cart";
import {
  productStatuses,
  categories,
  restoreCart,
  type Category,
  type Line,
  type Product,
} from "@/data/products";
import type { PaymentSettings } from "@/data/settings";
export default function Store({
  products,
  payment,
}: {
  products: Product[];
  payment: PaymentSettings;
}) {
  const { t, money, productText } = useLanguage();
  const [category, setCategory] = useState<Category>("Все"),
    [selected, setSelected] = useState<Product | null>(null),
    [cart, setCart] = useState(false);
  const [items, setItems] = useState<Line[]>([]),
    [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("black-tide-cart") || "[]");
      setItems(restoreCart(saved, products));
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem("black-tide-cart", JSON.stringify(items));
      } catch {}
  }, [items, ready]);
  const visible = products.filter(
    (p) => category === "Все" || p.category === category,
  );
  const currentItems = restoreCart(items, products);
  const { progress, readout, toCatalog } = useStoreScroll(
    category,
    cart || Boolean(selected),
  );
  function choose(c: Category) {
    setCategory(c);
    toCatalog();
  }
  function add(size: string) {
    if (!selected || selected.status === "sold_out") return;
    const id = selected.id;
    setItems((lines) =>
      lines.some((l) => l.id === id && l.size === size)
        ? lines.map((l) =>
            l.id === id && l.size === size
              ? {
                  ...l,
                  qty: Math.min(99, l.qty + 1),
                }
              : l,
          )
        : [
            ...lines,
            {
              id,
              size,
              qty: 1,
            },
          ],
    );
    setSelected(null);
    setCart(true);
  }
  return (
    <main id="top">
      <div className="scroll-meter" aria-hidden="true">
        <span ref={readout}>0%</span>
        <div ref={progress} />
      </div>
      <Navigation
        count={currentItems.reduce((s, l) => s + l.qty, 0)}
        open={() => setCart(true)}
      />
      <section className="hero scene-0" aria-label={t("Лукбук Black Tide")}>
        <img
          className="hero-image"
          src="/images/black-tide-coast-clean.webp"
          alt={t("Штормовой берег и готический замок Black Tide")}
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <div className="hero-frame max-w-[1440px] mx-auto">
          <div className="hero-copy">
            <h1>BLACK TIDE</h1>
            <button className="hero-action" onClick={() => choose("Все")}>
              {t("Смотреть коллекцию")}{" "}
              <span className="action-arrow">
                <ArrowUpRight />
              </span>
            </button>
          </div>
        </div>
      </section>
      <section id="catalog" className="catalog">
        <div className="max-w-[1440px] mx-auto">
          <div className="catalog-head flex items-end justify-between">
            <h2>
              {t("Каталог")}
              <span>/ {String(visible.length).padStart(2, "0")}</span>
            </h2>
            <div className="catalog-filters">
              {categories
                .filter(
                  (c) => c === "Все" || products.some((p) => p.category === c),
                )
                .map((c) => (
                  <button
                    key={c}
                    aria-pressed={category === c}
                    onClick={() => setCategory(c)}
                  >
                    {t(c)}
                  </button>
                ))}
            </div>
          </div>
          <div className="product-grid grid">
            {visible.map((p) => (
              <button
                key={p.id}
                className="card"
                onClick={() => setSelected(p)}
              >
                <div className="card-pic">
                  <img
                    src={p.images[0]}
                    loading="lazy"
                    width="640"
                    height="720"
                    alt={productText(p, "name")}
                  />
                  <span className="code mono">{p.id}</span>
                  <span className="card-open">
                    <Plus />
                  </span>
                </div>
                <div className="card-caption">
                  <div className="card-text">
                    <h3>{productText(p, "name")}</h3>
                    <span>{money(p.price)}</span>
                  </div>
                  <small>{productText(p, "color")}</small>
                  <span className="product-status" data-status={p.status}>
                    {t(productStatuses[p.status])}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
      <section id="delivery" className="store-editorial shipping">
        <div className="editorial-inner">
          <h2>{t("Доставка")}</h2>
          <div>
            <h3>{t("Новой Почтой по Украине")}</h3>
            <p>
              {t(
                "При оформлении заказа укажите город и отделение Новой Почты. Оставьте телефон и ник в Telegram, чтобы мы могли подтвердить заказ и согласовать детали отправки.",
              )}
            </p>
          </div>
        </div>
      </section>
      <footer>
        <a className="logo" href="#top">
          BLACK TIDE
        </a>
        <span>{t("Деним и кожаные аксессуары")}</span>
        <a href="#top" aria-label={t("Наверх")}>
          <ArrowDown
            style={{
              transform: "rotate(180deg)",
            }}
          />
        </a>
      </footer>
      {selected && (
        <ProductView
          product={selected}
          close={() => setSelected(null)}
          add={add}
        />
      )}
      {cart && (
        <Cart
          products={products}
          payment={payment}
          items={currentItems}
          setItems={setItems}
          close={() => setCart(false)}
        />
      )}
    </main>
  );
}
