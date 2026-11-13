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
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const el = dialog.current!;
    el.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      el.close();
      document.body.style.overflow = old;
    };
  }, []);
  return (
    <dialog
      data-lenis-prevent=""
      ref={dialog}
      aria-label={title}
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
      <button className="close" aria-label="Закрыть" onClick={close}>
        <X />
      </button>
      {children}
    </dialog>
  );
}
