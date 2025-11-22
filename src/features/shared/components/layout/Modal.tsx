"use client";

import { ReactNode, useEffect } from "react";

interface ModalProps {
  isOpen?: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function Modal({
  isOpen = true,
  onClose,
  title,
  children,
  className = "w-[560px]",
}: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      <div
        className={`
          relative z-10 flex flex-col rounded-2xl p-6 shadow-lg 
          border border-primary-neutral-stroke-default
          glass-card backdrop-blur-md bg-neutral-900/80 
          ${className}
        `}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-Albert_Sans font-semibold text-text-main">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="text-text-neutral pointer hover:text-text-main transition-colors p-1 rounded-md hover:bg-white/5"
            aria-label="Zamknij"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
