"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  ArrowDown,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import Navigation from "./Navigation";
import { useStoreScroll } from "./useStoreScroll";
import ProductView from "./ProductView";
import Cart from "./Cart";
import {
  products,
  categories,
  money,
  validLine,
  type Category,
  type Line,
  type Product,
} from "@/data/products";
const HardwareScene = dynamic(() => import("./HardwareScene"), { ssr: false });
const BloodTrim = dynamic(() => import("./BloodTrim"), {ssr:false});
const slides = [
  {
    image: "/images/black-tide-coast.webp",
    label: "Деним и кожа",
    heading: "BLACK TIDE",
    category: "Все" as Category,
  },
  {
    image: "/images/gothic-cathedral.webp",
    label: "Джинсы",
    heading: "RAW STRAIGHT",
    copy: "Прямой крой и светлый деним.",
    category: "Джинсы" as Category,
  },
  {
    image: "/images/gothic-cloister.webp",
    label: "Джинсы",
    heading: "WASHED LOOSE",
    copy: "Свободная посадка и контрастный деним.",
    category: "Джинсы" as Category,
  },
];
export default function Store() {
  const [showHardware, setShowHardware] = useState(false);
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: no-preference)");
    let supported: boolean | undefined;
    function update() {
      if (motion.matches && supported === undefined) {
        const gl = document.createElement("canvas").getContext("webgl2");
        supported = Boolean(gl);
        gl?.getExtension("WEBGL_lose_context")?.loseContext();
      }
      setShowHardware(motion.matches && Boolean(supported));
    }
    update();
    motion.addEventListener("change", update);
    return () => motion.removeEventListener("change", update);
  }, []);
  const [category, setCategory] = useState<Category>("Все"),
    [slide, setSlide] = useState(0),
    [selected, setSelected] = useState<Product | null>(null),
    [cart, setCart] = useState(false);
  const [items, setItems] = useState<Line[]>([]),
    [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("black-tide-cart") || "[]");
      if (Array.isArray(saved)) setItems(saved.filter(validLine));
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
    ),
    scene = slides[slide];
  const { progress, readout, toCatalog } = useStoreScroll(
    category,
    cart || Boolean(selected),
  );
  function choose(c: Category) {
    setCategory(c);
    toCatalog();
  }
  function add(size: string) {
    if (!selected) return;
    const id = selected.id;
    setItems((lines) =>
      lines.some((l) => l.id === id && l.size === size)
        ? lines.map((l) =>
            l.id === id && l.size === size
              ? { ...l, qty: Math.min(99, l.qty + 1) }
              : l,
          )
        : [...lines, { id, size, qty: 1 }],
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
        count={items.reduce((s, l) => s + l.qty, 0)}
        open={() => setCart(true)}
      />
      <section className={"hero scene-" + slide} aria-label="Лукбук Black Tide">
        <img
          className="hero-image"
          src={scene.image}
          alt={
            slide === 0
              ? "Штормовой берег и готический замок Black Tide"
              : scene.label
          }
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <div className="hero-frame max-w-[1440px] mx-auto">
          <figure className="hardware-study">
            <div className="hardware-model">
              <img
                className="hardware-poster"
                src={`/images/hardware-${slide}.webp`}
                alt=""
              />
              {showHardware && <HardwareScene slide={slide} />}
            </div>
          </figure>
          <div className="hero-copy">
            {slide !== 0 && (
              <div className="collection-tag">
                <i />
                Коллекция 01 <span>/</span> {scene.label}
              </div>
            )}
            <h1>{scene.heading}</h1>
            {scene.copy && <p>{scene.copy}</p>}
            <button
              className="hero-action"
              onClick={() => choose(scene.category)}
            >
              Смотреть коллекцию{" "}
              <span className="action-arrow">
                <ArrowUpRight />
              </span>
            </button>
          </div>
          <div className="slide-controls">
            <span className="mono">
              <b>0{slide + 1}</b> / 03
            </span>
            <button
              aria-label="Предыдущий кадр"
              onClick={() => setSlide((slide + 2) % 3)}
            >
              <ChevronLeft />
            </button>
            <button
              aria-label="Следующий кадр"
              onClick={() => setSlide((slide + 1) % 3)}
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </section>
      <section id="catalog" className="catalog">
        <BloodTrim/>
        <div className="max-w-[1440px] mx-auto">
          <div className="catalog-head flex items-end justify-between">
            <h2>
              Каталог<span>/ {String(visible.length).padStart(2, "0")}</span>
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
                    {c}
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
                    alt={p.name}
                  />
                  <span className="code mono">{p.id}</span>
                  <span className="card-open">
                    <Plus />
                  </span>
                </div>
                <div className="card-caption">
                  <div className="card-text">
                    <h3>{p.name}</h3>
                    <span>{money(p.price)}</span>
                  </div>
                  <small>{p.color}</small>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
      <section id="delivery" className="store-editorial shipping">
        <div className="editorial-inner">
          <h2>Доставка</h2>
          <div>
            <h3>Новой Почтой по Украине</h3>
            <p>
              При оформлении заказа укажите город и отделение Новой Почты.
              Оставьте телефон и ник в Telegram, чтобы мы могли подтвердить
              заказ и согласовать детали отправки.
            </p>
          </div>
        </div>
      </section>
      <footer>
        <a className="logo" href="#top">
          BLACK TIDE
        </a>
        <span>Деним и кожаные аксессуары</span>
        <a href="#top" aria-label="Наверх">
          <ArrowDown style={{ transform: "rotate(180deg)" }} />
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
        <Cart items={items} setItems={setItems} close={() => setCart(false)} />
      )}
    </main>
  );
}
