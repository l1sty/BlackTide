import { useLanguage } from "@/i18n/LanguageProvider";
import { useState } from "react";
import { Plus } from "lucide-react";
import { productStatuses, type Product } from "@/data/products";
import MeasureGuide from "./MeasureGuide";
import Overlay from "./Overlay";
export default function ProductView({
  product: p,
  close,
  add,
}: {
  product: Product;
  close: () => void;
  add: (size: string) => void;
}) {
  const { t, money, locale, productText } = useLanguage();
  const [image, setImage] = useState(0),
    [size, setSize] = useState(p.sizes[0]);
  return (
    <Overlay close={close} title={productText(p, "name")}>
      <div className="product-layout">
        <div className="gallery">
          <img
            className="main-photo"
            src={p.images[image]}
            alt={
              productText(p, "name") +
              " — " +
              t(
                p.imageLabels?.[image] ??
                  (image ? t("Деталь") : t("Общий вид")),
              )
            }
          />
          <div className="thumbs">
            {p.images.map((src, i) => (
              <button
                aria-pressed={image === i}
                key={src}
                onClick={() => setImage(i)}
                aria-label={t(
                  p.imageLabels?.[i] ?? (i ? "Деталь" : "Общий вид"),
                )}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        </div>
        <div className="product-info">
          <small className="mono">{p.id} / BLACK TIDE</small>
          <h2>{productText(p, "name")}</h2>
          <b>{money(p.price)}</b>
          <span className="product-status" data-status={p.status}>
            {t(productStatuses[p.status])}
          </span>
          <p>{productText(p, "fit")}</p>
          <p>{productText(p, "material")}</p>
          <p>
            {t("Цвет —")} {productText(p, "color")}
          </p>
          {p.category === "Джинсы" ? (
            <>
              <label>{t("Размер")}</label>
              <div className="sizes">
                {p.sizes.map((s) => (
                  <button
                    key={t(s)}
                    aria-pressed={s === size}
                    onClick={() => setSize(s)}
                  >
                    {t(s)}
                  </button>
                ))}
              </div>
              {p.measurements ? (
                <details open>
                  <summary>{t("Таблица замеров")}</summary>
                  <table>
                    <caption>{t("Замеры изделия, см")}</caption>
                    <tbody>
                      {Object.entries(p.measurements).map(([label, value]) => (
                        <tr key={t(label)}>
                          <th scope="row">{label}</th>
                          <td>{value.toLocaleString(locale)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              ) : (
                <p>{t("Замеры уточняются")}</p>
              )}
              <MeasureGuide />
            </>
          ) : (
            <p>
              {t("Габариты —")}
              {p.dimensions}
            </p>
          )}
          <button
            className="solid"
            disabled={p.status === "sold_out"}
            onClick={() => add(size)}
          >
            {p.status === "sold_out" ? t("Продано") : t("В корзину")} <Plus />
          </button>
        </div>
      </div>
    </Overlay>
  );
}
