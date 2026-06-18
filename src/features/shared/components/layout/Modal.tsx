import React, { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/utils";

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
            className={cn(
              "relative flex h-auto max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] min-w-80 max-w-[337px] flex-col overflow-hidden",
              "border border-modal-chrome-border-default bg-modal-chrome-background-default text-foreground-primary-default backdrop-blur-xl",
              "shadow-[0px_4px_6px_0px_rgba(0,0,0,0.25)]",
              "sm:max-h-[calc(100dvh-2rem)] sm:w-[768px] sm:max-w-[calc(100vw-2rem)] sm:rounded-2xl sm:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.25)]",
              className,
            )}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {title && (
              <div className="flex min-h-11 w-full shrink-0 items-center gap-3 overflow-hidden border-b border-modal-chrome-border-default bg-modal-chrome-background-default px-3 py-2.5 sm:px-4 sm:py-3">
                <span
                  id={titleId}
                  className="min-w-0 truncate font-sans text-sm font-normal leading-tight text-foreground-primary-default"
                >
                  {title}
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="ml-auto flex size-7 shrink-0 items-center justify-center rounded-lg bg-button-transparent-background-default font-sans text-base font-bold leading-none text-foreground-secondary-default transition-colors hover:bg-button-transparent-background-hover hover:text-foreground-primary-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-fuchsia-border-default/60"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto bg-modal-overlay-background-default">
              {children}
            </div>

            {footer && (
              <div className="flex min-h-[60px] h-auto shrink-0 items-center justify-end border-t border-modal-chrome-border-default bg-modal-chrome-background-default px-3 py-2.5">
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
