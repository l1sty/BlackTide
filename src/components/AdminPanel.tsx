"use client";
import { useEffect, useState, type FormEvent } from "react";
import { categories, productStatuses, type Product } from "@/data/products";
import type { StoreData } from "@/data/settings";

async function api(path: string, options: RequestInit = {}) {
  const response = await fetch(path, { ...options, cache: "no-store" });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error || "Не удалось выполнить запрос");
  return data;
}
function ProductEditor({
  product: p,
  change,
  upload,
  busy,
}: {
  product: Product;
  change: (p: Product) => void;
  upload: (file: File) => Promise<string>;
  busy: boolean;
}) {
  const [measures, setMeasures] = useState(
    Object.entries(p.measurements || {})
      .map(([k, v]) => k + "=" + v)
      .join("\n"),
  );
  const fields = [
    ["name", "Название"],
    ["nameUk", "Название українською"],
    ["color", "Цвет"],
    ["colorUk", "Колір українською"],
    ["fit", "Описание"],
    ["fitUk", "Опис українською"],
    ["material", "Материалы"],
    ["materialUk", "Матеріали українською"],
    ["dimensions", "Габариты"],
  ] as const;
  return (
    <div className="admin-product">
      <h2>{p.id}</h2>
      <div className="admin-fields">
        {fields.map(([key, label]) => (
          <label key={key}>
            {label}
            <input
              value={p[key] || ""}
              required={key === "name"}
              maxLength={key === "name" ? 150 : 2000}
              onChange={(e) => change({ ...p, [key]: e.target.value })}
            />
          </label>
        ))}
        <label>
          Цена, грн
          <input
            type="number"
            min="1"
            max="1000000"
            step="1"
            required
            value={p.price}
            onChange={(e) => change({ ...p, price: Number(e.target.value) })}
          />
        </label>
        <label>
          Категория
          <select
            value={p.category}
            onChange={(e) =>
              change({ ...p, category: e.target.value as Product["category"] })
            }
          >
            {categories.slice(1).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Статус
          <select
            value={p.status}
            onChange={(e) =>
              change({ ...p, status: e.target.value as Product["status"] })
            }
          >
            {Object.entries(productStatuses).map(([key, label]) => (
              <option value={key} key={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Размеры через запятую
          <input
            required
            value={p.sizes.join(", ")}
            onChange={(e) =>
              change({
                ...p,
                sizes: e.target.value.split(",").map((s) => s.trim()),
              })
            }
          />
        </label>
      </div>
      <label>
        Замеры в см, каждый с новой строки
        <textarea
          rows={6}
          placeholder={"Полуобхват талии=39\nДлина по внешнему шву=105"}
          value={measures}
          onChange={(e) => {
            const value = e.target.value;
            setMeasures(value);
            const entries = value.trim()
              ? value
                  .split("\n")
                  .filter((s) => s.trim())
                  .map((s) => s.split("="))
              : [];
            const valid = entries.every(
              ([label, v, ...rest]) =>
                label?.trim() &&
                v?.trim() &&
                !rest.length &&
                Number.isFinite(Number(v.replace(",", "."))) &&
                Number(v.replace(",", ".")) > 0,
            );
            e.target.setCustomValidity(
              valid
                ? ""
                : "Укажите название и положительное число через знак =",
            );
            if (valid)
              change({
                ...p,
                measurements: Object.fromEntries(
                  entries.map(([label, v]) => [
                    label.trim(),
                    Number(v.replace(",", ".")),
                  ]),
                ),
              });
          }}
        />
      </label>
      <h3>Фотографии</h3>
      <p>Первое фото используется в каталоге. JPG, PNG или WebP, до 4 МБ.</p>
      <div className="admin-photos">
        {p.images.map((image, i) => (
          <div key={image + i}>
            <img src={image} alt={"Фото " + (i + 1)} />
            <div>
              <button
                type="button"
                disabled={i === 0 || busy}
                onClick={() => {
                  const images = [...p.images];
                  [images[i - 1], images[i]] = [images[i], images[i - 1]];
                  change({ ...p, images, imageLabels: undefined });
                }}
              >
                ←
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  change({
                    ...p,
                    images: p.images.filter((_, index) => index !== i),
                    imageLabels: undefined,
                  })
                }
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
      <label>
        Добавить фото
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy || p.images.length >= 12}
          onChange={async (e) => {
            const input = e.currentTarget,
              file = input.files?.[0];
            if (!file) return;
            const url = await upload(file);
            if (url) change({ ...p, images: [...p.images, url] });
            input.value = "";
          }}
        />
      </label>
    </div>
  );
}
export default function AdminPanel() {
  const [checking, setChecking] = useState(true),
    [auth, setAuth] = useState(false),
    [password, setPassword] = useState("");
  const [data, setData] = useState<StoreData | null>(null),
    [selected, setSelected] = useState(0),
    [tab, setTab] = useState<"products" | "payment">("products");
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [dirty, setDirty] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const session = await api("/api/admin/session");
        setAuth(session.authenticated);
        if (session.authenticated) setData(await api("/api/admin/store"));
        if (!session.configured)
          setMessage(
            "Настройте базу данных, ADMIN_PASSWORD и ADMIN_SESSION_SECRET в окружении сервера.",
          );
      } catch {
        setMessage("Не удалось подключиться к серверу");
      } finally {
        setChecking(false);
      }
    })();
  }, []);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  async function signIn(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      await api("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      setPassword("");
      setData(await api("/api/admin/store"));
      setAuth(true);
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    if (!data) return;
    setBusy(true);
    setMessage("");
    try {
      setData(
        await api("/api/admin/store", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }),
      );
      setDirty(false);
      setMessage("Сохранено. Изменения видны после обновления витрины.");
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function upload(file: File) {
    setBusy(true);
    setMessage("");
    try {
      const body = new FormData();
      body.set("file", file);
      return (await api("/api/admin/upload", { method: "POST", body }))
        .url as string;
    } catch (err) {
      setMessage((err as Error).message);
      return "";
    } finally {
      setBusy(false);
    }
  }
  function edit(next: StoreData) {
    setData(next);
    setDirty(true);
    setMessage("");
  }
  if (checking)
    return (
      <main className="admin-shell">
        <p>Загружаем Black Tide…</p>
      </main>
    );
  if (!auth || !data)
    return (
      <main className="admin-shell admin-login">
        <a href="/" className="logo">
          BLACK TIDE
        </a>
        <h1>Вход в админ-панель</h1>
        <form onSubmit={signIn}>
          <label>
            Пароль
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button className="solid" disabled={busy}>
            {busy ? "Входим…" : "Войти"}
          </button>
        </form>
        {message && <p role="status">{message}</p>}
      </main>
    );
  return (
    <main className="admin-shell">
      <header className="admin-header">
        <a href="/" className="logo">
          BLACK TIDE
        </a>
        <h1>Управление магазином</h1>
        <a href="/" target="_blank" rel="noreferrer">
          Открыть витрину
        </a>
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            if (dirty && !confirm("Выйти без сохранения изменений?")) return;
            try {
              await api("/api/admin/session", { method: "DELETE" });
              setAuth(false);
              setData(null);
              setDirty(false);
            } catch (err) {
              setMessage((err as Error).message);
            }
          }}
        >
          Выйти
        </button>
      </header>
      <nav className="admin-tabs">
        <button
          type="button"
          aria-pressed={tab === "products"}
          onClick={() => setTab("products")}
        >
          Товары
        </button>
        <button
          type="button"
          aria-pressed={tab === "payment"}
          onClick={() => setTab("payment")}
        >
          Предоплата
        </button>
      </nav>
      <form id="store-editor" onSubmit={save}>
        <fieldset disabled={busy}>
          {tab === "products" ? (
            <div className="admin-grid">
              <aside>
                <button
                  type="button"
                  onClick={() => {
                    const product: Product = {
                      id: "BT-" + crypto.randomUUID().slice(0, 8),
                      name: "Новый товар",
                      category: "Джинсы",
                      status: "unknown",
                      price: 0,
                      color: "",
                      material: "",
                      fit: "",
                      dimensions: "",
                      sizes: ["S"],
                      images: [],
                    };
                    edit({ ...data, products: [...data.products, product] });
                    setSelected(data.products.length);
                  }}
                >
                  Добавить товар
                </button>
                <div className="admin-product-list">
                  {data.products.map((p, i) => (
                    <button
                      type="button"
                      key={p.id}
                      aria-pressed={selected === i}
                      onClick={() => setSelected(i)}
                    >
                      <span>{p.name}</span>
                      <small>
                        {p.id} · {p.price} грн · {productStatuses[p.status]}
                      </small>
                    </button>
                  ))}
                </div>
              </aside>
              <section>
                {data.products[selected] ? (
                  <>
                    <ProductEditor
                      key={data.products[selected].id}
                      product={data.products[selected]}
                      busy={busy}
                      upload={upload}
                      change={(p) =>
                        edit({
                          ...data,
                          products: data.products.map((old, i) =>
                            i === selected ? p : old,
                          ),
                        })
                      }
                    />
                    <button
                      type="button"
                      className="admin-delete"
                      onClick={() => {
                        if (confirm("Удалить товар из каталога?")) {
                          edit({
                            ...data,
                            products: data.products.filter(
                              (_, i) => i !== selected,
                            ),
                          });
                          setSelected(0);
                        }
                      }}
                    >
                      Удалить товар
                    </button>
                  </>
                ) : (
                  <p>Добавьте первый товар</p>
                )}
              </section>
            </div>
          ) : (
            <section className="admin-payment">
              <h2>Реквизиты предоплаты</h2>
              {(
                [
                  ["card", "Номер карты или IBAN"],
                  ["recipient", "Получатель"],
                  ["bank", "Банк"],
                  ["terms", "Условия предоплаты"],
                  ["termsUk", "Умови передоплати українською"],
                ] as const
              ).map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input
                    value={data.payment[key]}
                    onChange={(e) =>
                      edit({
                        ...data,
                        payment: {
                          ...data.payment,
                          [key]:
                            key === "card"
                              ? e.target.value.replace(/\s/g, "")
                              : e.target.value,
                        },
                      })
                    }
                  />
                </label>
              ))}
              <p>
                Оставьте номер пустым, чтобы скрыть реквизиты на сайте. Переводы
                подтверждаются вручную через Black Tide.
              </p>
            </section>
          )}
        </fieldset>
        <div className="admin-save">
          <button className="solid" disabled={busy}>
            {busy ? "Сохраняем…" : "Сохранить изменения"}
          </button>
          <span>
            {dirty ? "Есть несохранённые изменения" : "Изменения сохранены"}
          </span>
        </div>
      </form>
      {message && (
        <p role="status" className="admin-message">
          {message}
        </p>
      )}
    </main>
  );
}
