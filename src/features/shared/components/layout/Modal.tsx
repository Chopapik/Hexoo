import React, { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen?: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className = "",
}: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (typeof document === "undefined") {
    return null;
  }

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-0 sm:p-4">
          <motion.div
            className="absolute inset-0 bg-modal-overlay-background-default backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.div
            onClick={handleModalClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            className={`
              relative flex h-dvh max-h-dvh w-full flex-col overflow-hidden rounded-none
              sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:max-w-3xl sm:rounded-2xl
              bg-modal-chrome-background-default backdrop-blur-xl
              text-foreground-primary-default
              border border-modal-chrome-border-default
              shadow-xl
              ${className}
            `}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {title && (
              <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-modal-chrome-border-default bg-modal-chrome-background-default px-3 sm:px-4">
                <span
                  id={titleId}
                  className="font-sans text-sm font-semibold text-foreground-primary-default"
                >
                  {title}
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="flex size-7 items-center justify-center rounded-lg bg-button-transparent-background-default text-foreground-secondary-default transition-colors hover:bg-button-transparent-background-hover hover:text-foreground-primary-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fuchsia-border-default/60"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-hidden bg-modal-surface-background-default">
              {children}
            </div>

            {footer && (
              <div className="shrink-0 border-t border-modal-chrome-border-default bg-modal-chrome-background-default px-3 py-2.5">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
