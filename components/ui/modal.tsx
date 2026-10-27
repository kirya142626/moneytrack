"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal is rendered through a portal into the themed app shell. Rendering it
 * inline used to place the fixed overlay inside `.animate-fade-up`, whose
 * retained `transform` becomes a containing block for `position: fixed`.
 * The result was an overlay sized to the page content instead of the viewport
 * (and no dimming over the sidebar), which looked like a white screen with a
 * small dialog floating in the middle.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const [portal, setPortal] = useState<HTMLElement | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    // Keep the modal inside the element that carries the current theme CSS
    // variables, but outside animated/transformed page containers.
    const themeRoot = document.querySelector<HTMLElement>("[data-theme]") ?? document.body;
    let node = themeRoot.querySelector<HTMLElement>(":scope > [data-modal-root]");
    if (!node) {
      node = document.createElement("div");
      node.setAttribute("data-modal-root", "");
      themeRoot.appendChild(node);
    }
    setPortal(node);
    return () => setPortal(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null,
      );
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !portal) return;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = window.requestAnimationFrame(() => dialogRef.current?.focus());
    return () => {
      window.cancelAnimationFrame(frame);
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [open, portal]);

  if (!open || !portal) return null;

  const width = size === "sm" ? "max-w-md" : size === "lg" ? "max-w-2xl" : "max-w-lg";

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4" role="presentation">
      <div
        className="absolute inset-0 bg-[#07110c]/55 animate-fade-in"
        onClick={() => onCloseRef.current()}
        aria-hidden
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-line bg-surface-raised shadow-2xl outline-none animate-scale-in sm:rounded-2xl",
          width,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div>
            <h2 id={titleId} className="text-[17px] font-semibold tracking-[-0.01em] text-ink">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1 text-[13px] leading-5 text-muted">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onCloseRef.current()}
            className="-mr-1 -mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-muted hover:text-ink"
            aria-label="Закрыть"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overscroll-contain overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer ? (
          <div className="flex flex-col-reverse gap-2 border-t border-line bg-surface/60 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    portal,
  );
}
