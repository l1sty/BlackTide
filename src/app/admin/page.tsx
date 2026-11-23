import type { Metadata } from "next";
import AdminPanel from "@/components/AdminPanel";
import "./admin.css";
export const metadata: Metadata = {
  title: "Админ-панель — Black Tide",
  robots: { index: false, follow: false },
};
export default function Page() {
  return <AdminPanel />;
}
