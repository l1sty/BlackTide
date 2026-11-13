export const categories = ["Все", "Джинсы", "Сумки", "Кошельки"] as const;
export type Category = (typeof categories)[number];
export type Product = {
  nameUk?: string;
  materialUk?: string;
  fitUk?: string;
  colorUk?: string;
  status: keyof typeof productStatuses;
  id: string;
  name: string;
  category: Exclude<Category, "Все">;
  price: number;
  color: string;
  material: string;
  fit: string;
  dimensions: string;
  measurements?: Record<string, number>;
  sizes: string[];
  images: string[];
  imageLabels?: string[];
};
export const productStatuses = {
  in_stock: "В наличии",
  made_to_order: "Под заказ",
  sold_out: "Продано",
  unknown: "Наличие уточняется",
} as const;
const denimSizes = ["S", "M", "L", "XL"];
export const products: Product[] = [
  {
    id: "BT-191",
    status: "in_stock",
    name: "Джинсовый картхолдер",
    category: "Кошельки",
    price: 300,
    color: "Чёрный",
    material: "Чёрная джинсовая ткань с ручной обработкой.",
    fit: "Одно отделение для ID-карты, металлическая заклёпка.",
    dimensions: "8 × 10 см",
    sizes: ["Единый"],
    images: [1, 2, 3].map((i) => `/images/wallet-191-${i}.webp`),
  },
  {
    id: "BT-116",
    status: "sold_out",
    name: "Джинсовый кошелёк с кнопкой",
    category: "Кошельки",
    price: 399,
    color: "Чёрно-белый",
    material: "Белая джинсовая ткань, окрашенная чёрной краской.",
    fit: "Складывается втрое. Отделение для купюр и карман 7 × 6 см.",
    dimensions: "9 × 6,5 см в сложенном виде; 20 × 9 см в разложенном",
    sizes: ["Единый"],
    images: [1, 2, 3, 4, 5].map((i) => `/images/wallet-116-${i}.webp`),
  },
  {
    id: "BT-01",
    status: "made_to_order",
    name: "Голубые джинсы клёш",
    category: "Джинсы",
    price: 1800,
    color: "Голубой",
    material: "Деним с эффектом выцветания и загрязнений.",
    fit: "Ручная работа. Доступен пошив под заказ.",
    dimensions: "",
    sizes: ["S"],
    measurements: {
      "Полуобхват талии": 39,
      "Полуобхват бёдер": 44,
      "Полуобхват колена": 19,
      "Длина по внешнему шву": 105,
      "Передняя посадка": 30,
      "Ширина низа штанины": 25,
    },
    images: [
      "/images/photo_2026-11-13_16-12-48-black.webp",
      "/images/photo_2026-11-13_16-12-54-black.webp",
    ],
    imageLabels: ["Вид спереди", "Вид сзади"],
  },
  {
    id: "BT-04",
    status: "unknown",
    name: "Джинсы Washed Loose",
    category: "Джинсы",
    price: 3450,
    color: "Графит",
    material:
      "Выстиранный хлопковый деним, стальная молния и металлическая пуговица.",
    fit: "Свободный силуэт и глубокие задние карманы.",
    dimensions: "",
    sizes: denimSizes,
    images: [
      "/images/photo_2026-11-01_11-40-56-black.webp",
      "/images/photo_2026-11-01_11-40-57-black.webp",
    ],
    imageLabels: ["Вид спереди", "Вид сзади"],
  },
  {
    id: "BT-155",
    status: "made_to_order",
    name: "Чёрные клёш с выцветанием",
    category: "Джинсы",
    price: 1800,
    color: "Чёрный",
    fit: "Ручная работа. Доступен пошив под заказ.",
    material: "Состаренный деним с эффектом выцветания.",
    dimensions: "",
    sizes: ["S–M"],
    measurements: {
      "Полуобхват талии": 43.5,
      "Полуобхват бёдер": 48,
      "Полуобхват колена": 19,
      "Длина по внешнему шву": 105,
      "Передняя посадка": 25,
      "Ширина низа штанины": 26,
    },
    images: [
      "/images/post-155-2-black.webp",
      "/images/post-155-1-black.webp",
      "/images/post-155-3-black.webp",
    ],
    imageLabels: ["Вид спереди", "Вид сзади", "Деталь низа"],
  },
  {
    id: "BT-95",
    status: "made_to_order",
    name: "Чёрные клёш с контрастными потёртостями",
    category: "Джинсы",
    price: 2000,
    color: "Чёрный",
    fit: "Ручная работа. Доступен пошив под заказ.",
    material: "Деним с контрастным выцветанием и обработкой низа.",
    dimensions: "",
    sizes: ["S–M"],
    measurements: {
      "Полуобхват талии": 38.5,
      "Полуобхват бёдер": 48,
      "Длина по внешнему шву": 109,
      "Передняя посадка": 29,
      "Ширина низа штанины": 27,
    },
    images: [
      "/images/post-95-2-black.webp",
      "/images/post-95-1-black.webp",
      "/images/post-95-3-black.webp",
    ],
    imageLabels: ["Вид спереди", "Вид сзади", "Деталь низа"],
  },
];
export const money = (n: number) =>
  new Intl.NumberFormat("ru-RU").format(n) + " грн";
export type Line = { id: string; size: string; qty: number };
export function validLine(
  value: unknown,
  catalog: Product[] = products,
): value is Line {
  if (!value || typeof value !== "object") return false;
  const line = value as Line;
  return (
    catalog.some(
      (p) =>
        p.id === line.id &&
        p.sizes.includes(line.size) &&
        p.status !== "sold_out",
    ) &&
    Number.isInteger(line.qty) &&
    line.qty > 0 &&
    line.qty <= 99
  );
}
export function restoreCart(
  value: unknown,
  catalog: Product[] = products,
): Line[] {
  if (!Array.isArray(value)) return [];
  const lines: Line[] = [];
  for (const item of value.filter((item) => validLine(item, catalog))) {
    const existing = lines.find(
      (line) => line.id === item.id && line.size === item.size,
    );
    if (existing) existing.qty = Math.min(99, existing.qty + item.qty);
    else lines.push({ id: item.id, size: item.size, qty: item.qty });
  }
  return lines;
}
