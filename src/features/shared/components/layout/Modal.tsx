import React, { useEffect } from "react";
import { createPortal } from "react-dom";

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

  if (typeof document === "undefined" || !isOpen) {
    return null;
  }

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur- transition-opacity animate-in fade-in duration-200 "
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        onClick={handleModalClick}
        className={`
          relative w-full max-w-2xl rounded-2xl 
          bg-secondary-neutral-background-default/60 backdrop-blur-xl
 " text-text-main
          border border-primary-neutral-stroke-default 
          shadow-2xl overflow-hidden flex flex-col 
          animate-in fade-in zoom-in-95 duration-200 
          ${className}
        `}
      >
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-primary-neutral-stroke-default bg-secondary-neutral-background-default/60 ">
            <span className="text-sm font-semibold text-text-main font-Albert_Sans">
              {title}
            </span>
            <button
              onClick={onClose}
              className="text-text-neutral hover:text-text-main transition-colors p-1"
            >
              ✕
            </button>
          </div>
        )}

        <div className="p-4 overflow-y-auto max-h-[70vh] scrollbar-hide">
          {children}
        </div>

        {footer && (
          <div className="px-4 py-3 border-t border-primary-neutral-stroke-default/60 bg-secondary-neutral-background-default/60">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
