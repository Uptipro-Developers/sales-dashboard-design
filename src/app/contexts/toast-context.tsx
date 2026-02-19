import React, { createContext, useContext, useState, useCallback } from "react";
import { Toast as ToastComponent, Toaster } from "../components/ui/toast";

type Toast = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning";
  duration?: number;
  onClose?: (id: string) => void;
};

type ToastContextType = {
  toast: (toast: Omit<Toast, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const success = useCallback(
    (title: string, description?: string) => {
      toast({ title, description, variant: "success" });
    },
    [toast],
  );

  const error = useCallback(
    (title: string, description?: string) => {
      toast({ title, description, variant: "error" });
    },
    [toast],
  );

  const warning = useCallback(
    (title: string, description?: string) => {
      toast({ title, description, variant: "warning" });
    },
    [toast],
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, warning }}>
      {children}
      <Toaster
        toasts={toasts.map((t) => ({ ...t, onClose: removeToast }))}
        onClose={removeToast}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
