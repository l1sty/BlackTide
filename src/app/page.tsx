import Store from "@/components/Store";
import { readStore } from "@/lib/store-db";
export const dynamic = "force-dynamic";
export default function Page() {
  const data = readStore();
  return <Store products={data.products} payment={data.payment} />;
}
