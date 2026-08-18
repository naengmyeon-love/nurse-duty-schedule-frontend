import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HeadLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("HEAD_NURSE");
  return <AppShell role="HEAD_NURSE" userName={user.name} wardName={user.ward.name}>{children}</AppShell>;
}
