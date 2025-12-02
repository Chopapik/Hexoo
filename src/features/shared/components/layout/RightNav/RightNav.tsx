import React from "react";
import Hexoo3Dv2 from "./Hexoo3Dv2";
import Hexoo3D from "./Hexoo3D";

function RightNavContent() {
  return (
    <div className="p-3 w-full h-full flex flex-col gap-4">
      <Hexoo3Dv2 />
      <Hexoo3D />
    </div>
  );
}

export function RightNavSidebar() {
  return (
    <div className="hidden md:flex md:sticky md:top-4 self-start bg-primary-neutral-background-default border-t-2 border-primary-neutral-stroke-default rounded-xl overflow-hidden md:w-20 lg:w-[244px] xl:w-72 h-full">
      <RightNavContent />
    </div>
  );
}

type RightNavOverlayProps = {
  open?: boolean;
  onClose?: () => void;
};

export function RightNavOverlay({
  open = false,
  onClose,
}: RightNavOverlayProps) {
  return (
    <>
      <div
        className={`md:hidden fixed inset-y-0 right-0 z-50 w-72 max-w-[85vw] bg-primary-neutral-background-default border-t border-primary-neutral-stroke-default rounded-l-xl shadow-xl transform transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <RightNavContent />
      </div>
      {open && (
        <button
          aria-label="Close right sidebar"
          onClick={onClose}
          className="md:hidden fixed inset-0 bg-black/30 z-40"
        />
      )}
    </>
  );
}
