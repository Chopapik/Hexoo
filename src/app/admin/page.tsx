"use client";

import AllUsersList from "@/features/admin/components/AllUsersList";
export default function AdminPanel() {
  return (
    <div className="w-full flex flex-col p-10 gap-10">
      <div className="w-full flex space-between">
        <span className="text-text-main text-xl font-semibold">
          Panel Administratora
        </span>
      </div>
      <div className="w-full flex justify-center">
        <AllUsersList />
      </div>
    </div>
  );
}
