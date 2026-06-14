import React, { useEffect } from "react";
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
        <div className="fixed inset-0 z-100 flex items-center justify-center p-0 lg:p-4 ">
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
            className={`
              relative w-full max-lg:h-dvh max-lg:max-h-dvh max-lg:max-w-none max-lg:rounded-none lg:max-w-3xl lg:rounded-2xl
              bg-modal-chrome-background-default backdrop-blur-xl
              text-foreground-primary-default
              border border-modal-chrome-border-default
              shadow-2xl overflow-hidden flex flex-col
              ${className}
            `}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {title && (
              <div className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 border-b border-modal-chrome-border-default bg-modal-chrome-background-default">
                <span className="text-sm font-semibold text-foreground-primary-default font-sans">
                  {title}
                </span>
                <button
                  onClick={onClose}
                  className="bg-button-transparent-background-default text-foreground-secondary-default hover:bg-button-transparent-background-hover hover:text-foreground-primary-default transition-colors p-1"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex-1 min-h-0 overflow-hidden">{children}</div>

            {footer && (
              <div className="px-3 py-2.5 sm:px-4 sm:py-3 border-t border-modal-chrome-border-default bg-modal-chrome-background-default">
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
