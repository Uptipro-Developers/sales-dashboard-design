import * as React from "react";
import { X } from "lucide-react";
import { cn } from "./utils";

type ToastProps = {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning";
  duration?: number;
  onClose: (id: string) => void;
};

const variantStyles = {
  default: "bg-background border-border",
  success: "bg-green-50 border-green-200 text-green-900",
  error: "bg-red-50 border-red-200 text-red-900",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
};

export function Toast({
  id,
  title,
  description,
  variant = "default",
  duration = 3000,
  onClose,
}: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-md rounded-lg border p-4 shadow-lg transition-all",
        variantStyles[variant],
      )}
    >
      <div className="flex-1">
        {title && <div className="font-semibold">{title}</div>}
        {description && (
          <div className="text-sm opacity-90 mt-1">{description}</div>
        )}
      </div>
      <button
        onClick={() => onClose(id)}
        className="ml-4 inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-black/5 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Toaster({
  toasts,
  onClose,
}: {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}) {
  return (
    <div className="pointer-events-none fixed top-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
}
