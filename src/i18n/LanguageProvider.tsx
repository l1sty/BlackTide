"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import ukrainian from "./uk.json";
import type { Product } from "@/data/products";
type Language = "ru" | "uk";
const dictionary: Record<string, string> = ukrainian;
type LanguageContext = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (value: string) => string;
  locale: string;
  money: (value: number) => string;
  productText: (
    product: Product,
    field: "name" | "color" | "material" | "fit",
  ) => string;
};
const Context = createContext<LanguageContext | null>(null);
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ru");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("black-tide-language");
      if (saved === "ru" || saved === "uk") setLanguageState(saved);
    } catch {}
  }, []);
  const setLanguage = useCallback((value: Language) => {
    setLanguageState(value);
    try {
      localStorage.setItem("black-tide-language", value);
    } catch {}
  }, []);
  const t = useCallback(
    (value: string) =>
      language === "uk" ? (dictionary[value] ?? value) : value,
    [language],
  );
  const locale = language === "uk" ? "uk-UA" : "ru-RU";
  useEffect(() => {
    document.documentElement.lang = language;
    document.title =
      language === "uk"
        ? "Black Tide — денім і шкіряні аксесуари"
        : "Black Tide — деним и кожаные аксессуары";
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        language === "uk"
          ? "Авторські джинси, сумки та гаманці Black Tide. Оберіть модель і оформіть доставку Новою Поштою по Україні."
          : "Авторские джинсы, сумки и кошельки Black Tide. Выберите модель и оформите доставку Новой Почтой по Украине.",
      );
  }, [language]);
  const money = (value: number) =>
    new Intl.NumberFormat(locale).format(value) + " грн";
  return (
    <Context.Provider
      value={{
        language,
        setLanguage,
        t,
        locale,
        money,
        productText: (p, key) => {
          const localized = p[(key + "Uk") as keyof Product];
          return language === "uk" && typeof localized === "string" && localized
            ? localized
            : t(p[key]);
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useLanguage() {
  const value = useContext(Context);
  if (!value) throw new Error("LanguageProvider is required");
  return value;
}
