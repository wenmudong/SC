"use client";

import { ReactNode } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string | ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmClassName?: string;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  confirmClassName = "",
}: ConfirmDialogProps) {
  const { t } = useLanguage();
  const effectiveConfirmText = confirmText ?? t("confirm.confirm");
  const effectiveCancelText = cancelText ?? t("confirm.cancel");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-medium text-neutral-900">{title}</h2>

        <div className="mb-6 text-neutral-600">
          {typeof message === "string" ? <p>{message}</p> : message}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-neutral-600 transition-colors hover:bg-neutral-50"
          >
            {effectiveCancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-lg bg-neutral-900 px-4 py-2 text-white transition-colors hover:bg-neutral-800 ${confirmClassName}`}
          >
            {effectiveConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
