"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { useEffect, useRef, useState } from "react";
import { ShoppingBag } from "lucide-react";
const sections = [
  {
    id: "catalog",
    label: "Каталог",
  },
  {
    id: "delivery",
    label: "Доставка",
  },
] as const;

// Capsule normal and exponential edge falloff adapted from dashersw/liquid-glass-js.
// Cache the field as an SVG displacement map so scrolling needs no JS draw loop.
function capsuleMap(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const pixels = ctx.createImageData(width, height);
  const radius = height / 2;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const dx = x - Math.max(radius, Math.min(width - radius, x)),
        dy = y - radius;
      const distance = Math.hypot(dx, dy),
        edge = Math.max(0, radius - distance);
      const strength = 110 * Math.exp(-edge * 0.15);
      const i = (y * width + x) * 4;
      pixels.data[i] = 128 + (strength * dx) / (distance || 1);
      pixels.data[i + 1] = 128 + (strength * dy) / (distance || 1);
      pixels.data[i + 2] = 128;
      pixels.data[i + 3] = 255;
    }
  ctx.putImageData(pixels, 0, 0);
  return canvas.toDataURL();
}
export default function Navigation({
  count,
  open,
}: {
  count: number;
  open: () => void;
}) {
  const { t, language, setLanguage } = useLanguage();
  const ref = useRef<HTMLElement>(null);
  const [map, setMap] = useState("");
  const [active, setActive] = useState(0);
  useEffect(() => {
    const elements = sections.map(({ id }) => document.getElementById(id)!);
    function sync() {
      if (document.querySelector("dialog[open]")) return;
      const line = (ref.current?.getBoundingClientRect().bottom ?? 88) + 32;
      let index = 0;
      elements.forEach((section, i) => {
        if (section.getBoundingClientRect().top <= line) index = i;
      });
      if (
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2
      )
        index = sections.length - 1;
      setActive(index);
    }
    const observer = new ResizeObserver(sync);
    observer.observe(document.body);
    window.addEventListener("scroll", sync, {
      passive: true,
    });
    sync();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", sync);
    };
  }, []);
  useEffect(() => {
    if (!/Chrome\//.test(navigator.userAgent)) return;
    const observer = new ResizeObserver(() => {
      if (!ref.current) return;
      setMap(
        matchMedia("(min-width: 800px) and (pointer: fine)").matches
          ? capsuleMap(ref.current.offsetWidth, ref.current.offsetHeight)
          : "",
      );
    });
    observer.observe(ref.current!);
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <svg aria-hidden="true" width="0" height="0" className="filter-def">
        <defs>
          <filter
            id="bt-glass"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            colorInterpolationFilters="sRGB"
          >
            <feImage
              href={map || undefined}
              result="lens"
              width="100%"
              height="100%"
              preserveAspectRatio="none"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="lens"
              scale="18"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <header ref={ref} className={"dock " + (map ? "refract" : "")}>
        <a href="#top" className="logo">
          BLACK TIDE
        </a>
        <nav aria-label={t("Разделы магазина")}>
          <span
            className="active-tab"
            style={{
              transform: `translateX(${active * 100}%)`,
            }}
          >
            <i key={active} />
          </span>
          {sections.map(({ id, label }, index) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={active === index ? "location" : undefined}
            >
              <span className="category-label">{t(label)}</span>
            </a>
          ))}
        </nav>
        <div className="dock-actions">
          <div
            className="language-switch"
            role="group"
            aria-label={t("Язык сайта")}
          >
            <button
              type="button"
              lang="uk"
              aria-pressed={language === "uk"}
              onClick={() => setLanguage("uk")}
            >
              Укр
            </button>
            <button
              type="button"
              lang="ru"
              aria-pressed={language === "ru"}
              onClick={() => setLanguage("ru")}
            >
              Рус
            </button>
          </div>
          <button
            className="bag-button"
            onClick={open}
            aria-label={t("Корзина, товаров") + ": " + count}
          >
            <ShoppingBag />
            <span>{t("Корзина")}</span>
            <b>{count}</b>
          </button>
        </div>
      </header>
    </>
  );
}
