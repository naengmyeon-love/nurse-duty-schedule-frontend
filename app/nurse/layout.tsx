import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";

export default async function NurseLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("NURSE");
  return <AppShell role="NURSE" userName={user.name} wardName={user.ward.name}>{children}</AppShell>;
}
