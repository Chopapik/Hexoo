"use client";

import { useState } from "react";
import AllUsersList from "../../features/admin/components/AllUsersList";
import ActivityLogTable from "../../features/admin/components/ActivityLogTable";
import Button from "../../features/shared/components/ui/Button";
import { useI18n } from "@/i18n/useI18n";

type AdminView = "users" | "activity";

export default function AdminPanel() {
  const { t } = useI18n();
  const [activeView, setActiveView] = useState<AdminView>("users");

  return (
    <div className="w-full flex flex-col p-10 gap-10">
      <div className="w-full flex items-center justify-between gap-4">
        <span className="text-foreground-primary-default text-xl font-semibold">
          {t("admin.title")}
        </span>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center rounded-full bg-surface-card-background-default/60 border border-surface-card-border-default p-1">
            <Button
              type="button"
              onClick={() => setActiveView("users")}
              size="sm"
              variant={activeView === "users" ? "default" : "ghost"}
              className={`px-4 ${
                activeView !== "users"
                  ? "text-foreground-secondary-default hover:text-foreground-primary-default"
                  : ""
              }`}
              text={t("admin.users")}
            />
            <Button
              type="button"
              onClick={() => setActiveView("activity")}
              size="sm"
              variant={activeView === "activity" ? "default" : "ghost"}
              className={`px-4 ${
                activeView !== "activity"
                  ? "text-foreground-secondary-default hover:text-foreground-primary-default"
                  : ""
              }`}
              text={t("admin.activity")}
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
