import { useState, useEffect } from "react";
import { toastStore } from "@utils/toastStore";

/**
 * AppToast — Hệ thống thông báo Sileo-style.
 *
 * Quy tắc:
 * - Vị trí cố định: top-right màn hình (z-index 99999).
 * - Stack vertically.
 * - Text-only, không icon, không emoji.
 * - Animation mượt mà: fade-in + slide-in từ phải.
 * - Tự động ẩn sau 2.5s.
 */
export default function AppToast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return toastStore.subscribe((newToast) => {
      setToasts((prev) => [...prev, { ...newToast, visible: false }]);
      
      // Delay fade-in slightly to allow DOM to mount
      setTimeout(() => {
        setToasts((prev) => 
          prev.map((t) => (t.id === newToast.id ? { ...t, visible: true } : t))
        );
      }, 10);

      // Trigger fade-out
      setTimeout(() => {
        setToasts((prev) => 
          prev.map((t) => (t.id === newToast.id ? { ...t, visible: false } : t))
        );
      }, 2500);

      // Remove from state after animation completes
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 2800);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-6 right-6 pointer-events-none flex flex-col gap-3 items-end"
      style={{ zIndex: 99999 }}
    >
      {toasts.map((toast) => {
        const isError = toast.type === "error";
        return (
          <div
            key={toast.id}
            style={{
              background: isError 
                ? "linear-gradient(135deg, #ef4444, #dc2626)" 
                : "linear-gradient(135deg, #18181b, #09090b)", // Dark premium background
              color: "#ffffff", 
              border: isError ? "1px solid #f87171" : "1px solid #27272a", 
              borderRadius: "18px", 
              padding: "16px 24px", 
              fontSize: "14px",
              fontWeight: "600",
              letterSpacing: "0.3px", 
              boxShadow: isError 
                ? "0 20px 40px rgba(220, 38, 38, 0.25), 0 8px 16px rgba(220, 38, 38, 0.15)"
                : "0 20px 40px rgba(0, 0, 0, 0.3), 0 8px 16px rgba(0, 0, 0, 0.2)", 
              maxWidth: "340px",
              minWidth: "220px",
              textAlign: "left",
              transition: "opacity 400ms cubic-bezier(0.16, 1, 0.3, 1), transform 400ms cubic-bezier(0.16, 1, 0.3, 1)", 
              opacity: toast.visible ? 1 : 0,
              transform: toast.visible ? "translate3d(0, 0, 0) scale(1)" : "translate3d(40px, 0, 0) scale(0.9)",
              pointerEvents: "none",
            }}
          >
            {toast.message}
          </div>
        );
      })}
    </div>
  );
}
