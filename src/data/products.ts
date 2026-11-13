export const categories = ["Все", "Джинсы", "Сумки", "Кошельки"] as const;
export type Category = (typeof categories)[number];
export type Product = {
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
const denimSizes = ["S", "M", "L", "XL"];
export const products: Product[] = [
  {
    id: "BT-01",
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
export function validLine(value: unknown): value is Line {
  if (!value || typeof value !== "object") return false;
  const line = value as Line;
  return (
    products.some((p) => p.id === line.id && p.sizes.includes(line.size)) &&
    Number.isInteger(line.qty) &&
    line.qty > 0 &&
    line.qty <= 99
  );
}
