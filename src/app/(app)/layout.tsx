import type { ReactNode } from "react";
import { AppShell } from "@/components/shell";
import { getShellData } from "@/lib/shell-data";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const shell = await getShellData();
  return <AppShell {...shell}>{children}</AppShell>;
}
