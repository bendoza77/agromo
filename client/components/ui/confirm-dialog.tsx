"use client";

import { useEffect, useId, useRef } from "react";
import { Spinner } from "@/components/ui/spinner";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Built on the native <dialog> element: modal focus trapping, Escape to close
 * and focus restoration come from the browser.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "გაუქმება",
  tone = "default",
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={descId}
      onCancel={(e) => {
        e.preventDefault();
        if (!pending) onCancel();
      }}
      onClick={(e) => {
        if (e.target === ref.current && !pending) onCancel();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-line bg-white p-0 text-ink-900 shadow-[var(--shadow-raised)]"
    >
      <div className="p-6">
        <h2 id={titleId} className="font-display text-xl font-semibold">
          {title}
        </h2>
        <div id={descId} className="mt-2 text-[0.9375rem] leading-relaxed text-ink-600">
          {description}
        </div>
      </div>
      <div className="flex flex-col-reverse gap-2 border-t border-line bg-cream-50 px-6 py-4 sm:flex-row sm:justify-end">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={pending} autoFocus>
          {cancelLabel}
        </button>
        <button
          type="button"
          className={tone === "danger" ? "btn btn-danger" : "btn btn-primary"}
          onClick={onConfirm}
          disabled={pending}
        >
          {pending && <Spinner />}
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
