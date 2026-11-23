import Store from "@/components/Store";
import { readStore } from "@/lib/store-db";
export const dynamic = "force-dynamic";
export default async function Page() {
  const data = await readStore();
  return <Store products={data.products} payment={data.payment} />;
}
