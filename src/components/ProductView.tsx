import { useState } from "react";
import { Plus } from "lucide-react";
import { money, type Product } from "@/data/products";
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
  const [image, setImage] = useState(0),
    [size, setSize] = useState(p.sizes[0]);
  return (
    <Overlay close={close} title={p.name}>
      <div className="product-layout">
        <div className="gallery">
          <img
            className="main-photo"
            src={p.images[image]}
            alt={
              p.name +
              " — " +
              (p.imageLabels?.[image] ?? (image ? "Деталь" : "Общий вид"))
            }
          />
          <div className="thumbs">
            {p.images.map((src, i) => (
              <button
                aria-pressed={image === i}
                key={src}
                onClick={() => setImage(i)}
                aria-label={p.imageLabels?.[i] ?? (i ? "Деталь" : "Общий вид")}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        </div>
        <div className="product-info">
          <small className="mono">{p.id} / BLACK TIDE</small>
          <h2>{p.name}</h2>
          <b>{money(p.price)}</b>
          <p>{p.fit}</p>
          <p>{p.material}</p>
          <p>Цвет — {p.color}</p>
          {p.category === "Джинсы" ? (
            <>
              <label>Размер</label>
              <div className="sizes">
                {p.sizes.map((s) => (
                  <button
                    key={s}
                    aria-pressed={s === size}
                    onClick={() => setSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {p.measurements ? (
                <details open>
                  <summary>Таблица замеров</summary>
                  <table>
                    <caption>Замеры изделия, см</caption>
                    <tbody>
                      {Object.entries(p.measurements).map(([label, value]) => (
                        <tr key={label}>
                          <th scope="row">{label}</th>
                          <td>{value.toLocaleString("ru-RU")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              ) : (
                <p>Замеры уточняются</p>
              )}
            </>
          ) : (
            <p>Габариты — {p.dimensions}</p>
          )}
          <button className="solid" onClick={() => add(size)}>
            В корзину <Plus />
          </button>
        </div>
      </div>
    </Overlay>
  );
}
