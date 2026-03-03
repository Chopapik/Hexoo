"use client";

import { useState } from "react";
import AllUsersList from "../../features/admin/components/AllUsersList";
import ActivityLogTable from "../../features/admin/components/ActivityLogTable";
import Button from "../../features/shared/components/ui/Button";

type AdminView = "users" | "activity";

export default function AdminPanel() {
  const [activeView, setActiveView] = useState<AdminView>("users");

  return (
    <div className="w-full flex flex-col p-10 gap-10">
      <div className="w-full flex items-center justify-between gap-4">
        <span className="text-text-main text-xl font-semibold">
          Panel Administratora
        </span>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center rounded-full bg-primary-neutral-background-default/60 border border-primary-neutral-stroke-default p-1">
            <Button
              type="button"
              onClick={() => setActiveView("users")}
              size="sm"
              variant={activeView === "users" ? "default" : "transparent"}
              className={`px-4 ${
                activeView !== "users"
                  ? "text-text-neutral hover:text-text-main"
                  : ""
              }`}
              text="Użytkownicy"
            />
            <Button
              type="button"
              onClick={() => setActiveView("activity")}
              size="sm"
              variant={activeView === "activity" ? "default" : "transparent"}
              className={`px-4 ${
                activeView !== "activity"
                  ? "text-text-neutral hover:text-text-main"
                  : ""
              }`}
              text="Log aktywności"
            />
          </div>
        </div>
      </div>

      <div className="w-full flex justify-center">
        {activeView === "users" ? <AllUsersList /> : <ActivityLogTable />}
      </div>
    </div>
  );
}
