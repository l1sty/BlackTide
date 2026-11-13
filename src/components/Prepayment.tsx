"use client";
import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { PaymentSettings } from "@/data/settings";
export default function Prepayment({ payment }: { payment: PaymentSettings }) {
  const { t, language } = useLanguage(),
    [copied, setCopied] = useState(false);
  if (!payment.card) return null;
  const card = payment.card.startsWith("UA")
    ? payment.card
    : payment.card.replace(/(.{4})/g, "$1 ").trim();
  return (
    <details className="prepayment">
      <summary>{t("Карта для предоплаты")}</summary>
      <p className="payment-number">{card}</p>
      {payment.recipient && <p>{payment.recipient}</p>}
      {payment.bank && <p>{payment.bank}</p>}
      <button
        type="button"
        className="copy-card"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(payment.card);
            setCopied(true);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? t("Номер скопирован") : t("Скопировать номер")}
      </button>
      <p>
        {language === "uk" && payment.termsUk ? payment.termsUk : payment.terms}
      </p>
      <small>
        {t(
          "Перевод не подтверждается сайтом автоматически. Подтверждение оплаты — через Black Tide.",
        )}
      </small>
    </details>
  );
}
