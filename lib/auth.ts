import { redirect } from "next/navigation";
import type { Role } from "@/lib/domain";
import { getCurrentUser, roleHome } from "@/lib/backend";

export { getCurrentUser } from "@/lib/backend";

export async function requireUser(role?: Role) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (role && user.role !== role) redirect(roleHome(user.role));
  return user;
}
