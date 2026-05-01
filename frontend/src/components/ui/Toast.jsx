import { useState, useCallback, useEffect } from "react";

let _addToast = null;

export function useToast() {
  const toast = useCallback((message, type = "info", duration = 4000) => {
    if (_addToast) _addToast({ message, type, duration });
  }, []);

  return {
    toast,
    success: (msg, dur) => toast(msg, "success", dur),
    error: (msg, dur) => toast(msg, "error", dur),
    info: (msg, dur) => toast(msg, "info", dur),
  };
}

let _id = 0;

export function Toaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    _addToast = ({ message, type, duration }) => {
      const id = ++_id;
      setToasts((prev) => [
        ...prev,
        { id, message, type, duration, leaving: false },
      ]);
      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
        );
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 350);
      }, duration);
    };
    return () => {
      _addToast = null;
    };
  }, []);

  const dismiss = (id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
    );
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 350);
  };

  if (!toasts.length) return null;

  return (
    <div className="toaster">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast--${t.type}${t.leaving ? " toast--leave" : ""}`}
        >
          <span className="toast__icon">
            {t.type === "success" && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            )}
            {t.type === "error" && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            )}
            {t.type === "info" && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
            )}
          </span>
          <span className="toast__msg">{t.message}</span>
          <button className="toast__close" onClick={() => dismiss(t.id)}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
