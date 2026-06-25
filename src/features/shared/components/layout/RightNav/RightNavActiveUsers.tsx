"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/features/shared/components/ui/Avatar";
import { useActiveUsers } from "@/features/users/hooks/useActiveUsers";
import { useAppStore } from "@/lib/store/store";
import { useI18n } from "@/i18n/useI18n";

const READY_MIN_MS = 600;

export function RightNavActiveUsers() {
  const { t } = useI18n();
  const onlineUids = useAppStore((s) => s.presence.onlineUids);
  const selfUid = useAppStore((s) => s.auth.user?.uid);

  const uids = useMemo(() => Array.from(onlineUids), [onlineUids]);
  const needsFetch = uids.length > 1;

  const { data: users = [], isLoading } = useActiveUsers(uids);

  const [minDelayElapsed, setMinDelayElapsed] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setMinDelayElapsed(true), READY_MIN_MS);
    return () => window.clearTimeout(id);
  }, []);

  const isReady = minDelayElapsed && (!needsFetch || !isLoading);

  const activeUsers = users.filter((u) => u.uid !== selfUid);
  const isEmpty = activeUsers.length === 0;

  return (
    <section className="flex w-full shrink-0 flex-col items-center">
      <div className="flex w-full flex-col items-center transition-all duration-300 ease-soft">
        <h3 className="min-w-full text-center text-xs font-bold leading-[15px] tracking-[0.5px] text-[#262626] transition-all duration-300 ease-soft">
          {t("right.activeUsers")}
        </h3>
      </div>

      <div
        className={`flex w-full text-foreground-secondary-default ${
          !isReady || isEmpty
            ? "flex-col items-center"
            : "flex-row flex-wrap content-center items-center justify-center gap-2.5 overflow-y-auto pb-1 [scrollbar-width:thin]"
        }`}
      >
        {!isReady ? null : isEmpty ? (
          <>
            <Image
              src="/images/face01.png"
              alt=""
              width={89}
              height={160}
              className="h-[160px] w-[89px] object-cover"
              sizes="89px"
            />
            <span className="w-3/5 text-center font-serif text-sm font-medium leading-5 tracking-[-0.11px] text-foreground-secondary-default">
              {t("right.noActiveUsers")}
            </span>
          </>
        ) : (
          activeUsers.map((u) => (
            <Link
              key={u.uid}
              href={`/profile/${encodeURIComponent(u.uid)}`}
              title={u.name}
            >
              <Avatar src={u.avatarUrl} alt={u.name} width={52} height={52} />
              <span className="sr-only">
                {t("right.profileSr", { name: u.name })}
              </span>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
