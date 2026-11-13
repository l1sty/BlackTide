import { useLanguage } from "@/i18n/LanguageProvider";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
export default function Overlay({
  children,
  close,
  title,
  drawer = false,
}: {
  children: React.ReactNode;
  close: () => void;
  title: string;
  drawer?: boolean;
}) {
  const { t } = useLanguage();
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = dialog.current!;
    el.showModal();
    const old = document.body.style.overflow;
    const y = window.scrollY;
    const previous = {
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    document.body.style.position = "fixed";
    document.body.style.top = `-${y}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
    return () => {
      el.close();
      document.body.style.overflow = old;
      Object.assign(document.body.style, previous);
      window.scrollTo({
        top: y,
        behavior: "instant",
      });
    };
  }, []);
  return (
    <dialog
      data-lenis-prevent=""
      ref={dialog}
      aria-label={t(title)}
      className={drawer ? "drawer" : "product-dialog"}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === dialog.current) {
          const r = dialog.current!.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            close();
        }
      }}
    >
      <div className="dialog-tools">
        <button className="close" aria-label={t("Закрыть")} onClick={close}>
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
