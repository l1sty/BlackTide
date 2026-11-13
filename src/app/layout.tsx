import type { Metadata, Viewport } from "next";
import "@fontsource-variable/oswald";
import "lenis/dist/lenis.css";
import "./globals.css";
import "./glass.css";
import "./mobile.css";
export const viewport: Viewport = {
  viewportFit: "cover",
  colorScheme: "dark",
  themeColor: "#070809",
};
export const metadata: Metadata = {
  title: "Black Tide — деним и кожаные аксессуары",
  description:
    "Авторские джинсы, сумки и кошельки Black Tide. Выберите модель и оформите доставку Новой Почтой по Украине.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
