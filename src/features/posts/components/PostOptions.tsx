"use client";

import { useState, useRef, useEffect } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import { BsThreeDots, BsFlag } from "react-icons/bs";
import ReportPostModal from "./ReportPostModal";

const DotsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
);

export default function PostOptions({
  postId,
  authorId,
}: {
  postId: string;
  authorId: string;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const currentUser = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (currentUser?.uid === authorId) return null;

  return (
    <>
      {isReportModalOpen && (
        <ReportPostModal
          postId={postId}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      <div className="relative" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
          className="p-2 text-text-neutral hover:text-text-main transition-colors rounded-full hover:bg-white/5"
        >
          <DotsIcon />
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 top-8 w-48 bg-[#1E1E1E] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(false);
                setIsReportModalOpen(true);
              }}
              className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors flex items-center gap-3 font-medium"
            >
              <BsFlag /> Zgłoś naruszenie
            </button>
          </div>
        )}
      </div>
    </>
  );
}
