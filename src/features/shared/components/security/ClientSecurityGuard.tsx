"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getActiveBlock } from "@/lib/security/clientBlockStore";

export default function ClientSecurityGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (pathname.includes("/critical-error")) {
      setIsChecking(false);
      return;
    }

    const block = getActiveBlock();

    if (block) {
      const codeParam = encodeURIComponent("RATE_LIMIT");
      const detailsParam = encodeURIComponent(JSON.stringify(block.details));

      router.replace(
        `/critical-error?status=${codeParam}&details=${detailsParam}`
      );
    } else {
      setIsChecking(false);
    }
  }, [pathname, router]);

  if (isChecking) {
    return null;
  }

  return <>{children}</>;
}
