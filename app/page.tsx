import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  redirect(user.role === "HEAD_NURSE" ? "/head/dashboard" : "/nurse");
}
