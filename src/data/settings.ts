export type PaymentSettings = {
  card: string;
  recipient: string;
  bank: string;
  terms: string;
  termsUk: string;
};
export const defaultPayment: PaymentSettings = {
  card: "4441111046654499",
  recipient: "",
  bank: "",
  terms:
    "Сумму предоплаты согласуем при подтверждении заказа. Переводите оплату после подтверждения заказа Black Tide.",
  termsUk:
    "Суму передоплати узгодимо під час підтвердження замовлення. Переказуйте оплату після підтвердження замовлення Black Tide.",
};
