import Store from "@/components/Store";
import { products } from "@/data/products";
import { defaultPayment } from "@/data/settings";
export default function Page() {
  return <Store products={products} payment={defaultPayment} />;
}
