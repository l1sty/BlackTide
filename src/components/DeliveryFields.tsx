"use client";

import { useLanguage } from "@/i18n/LanguageProvider";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
type Choice = {
  id: string;
  label: string;
  detail: string;
};
function SearchField({
  name,
  label,
  value,
  selected,
  onChange,
  onSelect,
  city,
  disabled = false,
}: {
  name: "city" | "branch";
  label: string;
  value: string;
  selected: Choice | null;
  onChange: (value: string) => void;
  onSelect: (choice: Choice) => void;
  city?: string;
  disabled?: boolean;
}) {
  const { t } = useLanguage();
  const id = useId(),
    input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false),
    [active, setActive] = useState(-1);
  const [result, setResult] = useState<{
    items: Choice[];
    loading: boolean;
    error: string;
  }>({
    items: [],
    loading: false,
    error: "",
  });
  useEffect(() => {
    input.current?.setCustomValidity(
      selected ? "" : t("Выберите вариант из списка или включите ручной ввод"),
    );
  }, [selected, value, t]);
  useEffect(() => {
    setActive(-1);
    if (
      !open ||
      disabled ||
      selected ||
      (name === "city" && value.trim().length < 2)
    ) {
      setResult({
        items: [],
        loading: false,
        error: "",
      });
      return;
    }
    const controller = new AbortController();
    setResult({
      items: [],
      loading: true,
      error: "",
    });
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          type: name === "city" ? "cities" : "warehouses",
          q: value,
        });
        if (city) params.set("city", city);
        const response = await fetch("/api/delivery?" + params, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Не удалось загрузить справочник");
        if (!Array.isArray(data.items))
          throw new Error("Не удалось загрузить справочник");
        if (!controller.signal.aborted)
          setResult({
            items: data.items,
            loading: false,
            error: "",
          });
      } catch (err) {
        if (!controller.signal.aborted)
          setResult({
            items: [],
            loading: false,
            error:
              err instanceof Error
                ? err.message
                : "Не удалось загрузить справочник",
          });
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [name, value, selected, city, disabled, open]);
  function choose(item: Choice) {
    onSelect(item);
    setOpen(false);
  }
  function keys(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      if (result.items.length)
        setActive(
          (i) =>
            (i + (e.key === "ArrowDown" ? 1 : -1) + result.items.length) %
            result.items.length,
        );
    }
    if (e.key === "Enter" && open) {
      e.preventDefault();
      if (active >= 0 && result.items[active]) choose(result.items[active]);
    }
  }
  useEffect(() => {
    if (active >= 0)
      document.getElementById(id + "-" + active)?.scrollIntoView({
        block: "nearest",
      });
  }, [active, id]);
  const show = open && !selected && !disabled;
  return (
    <div className="address-field">
      <label htmlFor={id}>{t(label)}</label>
      <input
        ref={input}
        id={id}
        name={name}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={show && result.items.length > 0}
        aria-controls={id + "-list"}
        aria-activedescendant={
          show && active >= 0 ? id + "-" + active : undefined
        }
        autoComplete="off"
        required
        maxLength={name === "branch" ? 300 : 120}
        value={value}
        disabled={disabled}
        placeholder={
          name === "city"
            ? t("Начните вводить название")
            : t("Номер отделения или улица")
        }
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={keys}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
      />
      {show && (
        <>
          {result.items.length > 0 && (
            <ul
              id={id + "-list"}
              role="listbox"
              aria-label={label}
              className="address-options"
            >
              {result.items.map((item, i) => (
                <li
                  key={item.id}
                  id={id + "-" + i}
                  role="option"
                  aria-selected={active === i}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => choose(item)}
                >
                  <span>{item.label}</span>
                  {item.detail && <small>{item.detail}</small>}
                </li>
              ))}
            </ul>
          )}
          <small className="address-feedback" role="status">
            {result.loading
              ? t("Ищем…")
              : t(result.error) ||
                (name === "city" && value.trim().length < 2
                  ? t("Введите минимум 2 буквы")
                  : result.items.length
                    ? t(
                        "Показаны первые 30 результатов. Уточните поиск при необходимости.",
                      )
                    : t(
                        "Ничего не найдено. Уточните запрос или введите адрес вручную.",
                      ))}
          </small>
        </>
      )}
    </div>
  );
}
export default function DeliveryFields() {
  const { t } = useLanguage();
  const [manual, setManual] = useState(false);
  const [city, setCity] = useState(""),
    [branch, setBranch] = useState("");
  const [cityChoice, setCityChoice] = useState<Choice | null>(null),
    [branchChoice, setBranchChoice] = useState<Choice | null>(null);
  return (
    <div className="delivery-fields">
      <div className="delivery-heading">
        <span>{t("Новая Почта")}</span>
        <button
          type="button"
          className="delivery-mode"
          onClick={() => {
            setManual(!manual);
            setCityChoice(null);
            setBranchChoice(null);
          }}
        >
          {manual ? t("Поиск по справочнику") : t("Ввести вручную")}
        </button>
      </div>
      {manual ? (
        <>
          <label>
            {t("Город")}
            <input
              name="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              maxLength={120}
              autoComplete="address-level2"
            />
          </label>
          <label>
            {t("Отделение Новой Почты")}
            <input
              name="branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              required
              maxLength={300}
            />
          </label>
        </>
      ) : (
        <>
          <SearchField
            name="city"
            label={t("Город")}
            value={city}
            selected={cityChoice}
            onChange={(v) => {
              setCity(v);
              setCityChoice(null);
              setBranch("");
              setBranchChoice(null);
            }}
            onSelect={(c) => {
              setCity(c.label + (c.detail ? " · " + c.detail : ""));
              setCityChoice(c);
              setBranch("");
              setBranchChoice(null);
            }}
          />
          <SearchField
            name="branch"
            label={t("Отделение Новой Почты")}
            value={branch}
            selected={branchChoice}
            city={cityChoice?.id}
            disabled={!cityChoice}
            onChange={(v) => {
              setBranch(v);
              setBranchChoice(null);
            }}
            onSelect={(b) => {
              setBranch(b.label);
              setBranchChoice(b);
            }}
          />
          {!cityChoice && (
            <small className="address-feedback">
              {t("Сначала выберите город из списка")}
            </small>
          )}
        </>
      )}
    </div>
  );
}
