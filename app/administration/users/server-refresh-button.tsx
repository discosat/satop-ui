"use client";

import { RefreshButton } from "@/components/refresh-button";
import { useRouter } from "next/navigation";

export function ServerRefreshButton() {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
  };

  return <RefreshButton onClick={handleRefresh} />;
}
