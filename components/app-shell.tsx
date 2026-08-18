import Link from "next/link";
import { ArrowLeftRight, BedSingle, CalendarDays, ClipboardCheck, ClipboardPenLine, LayoutDashboard, LogOut, Plane, Stethoscope, Users } from "lucide-react";
import type { ReactNode } from "react";
import { logoutAction } from "@/app/actions";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard };

const headItems: NavItem[] = [
  { href: "/head/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/head/schedule", label: "듀티표", icon: CalendarDays },
  { href: "/head/requests", label: "희망 OFF", icon: ClipboardCheck },
  { href: "/head/patient-assignments", label: "환자배정", icon: BedSingle },
  { href: "/head/handoffs", label: "인수인계", icon: ClipboardPenLine },
  { href: "/head/vacations", label: "휴가 현황", icon: Plane },
  { href: "/head/nurses", label: "간호사 관리", icon: Users },
  { href: "/head/shift-changes", label: "근무 변동", icon: ArrowLeftRight },
];

const nurseItems: NavItem[] = [
  { href: "/nurse", label: "대시보드", icon: LayoutDashboard },
  { href: "/nurse/schedule", label: "듀티표", icon: CalendarDays },
  { href: "/nurse/request-off", label: "희망 OFF", icon: ClipboardCheck },
  { href: "/nurse/patient-assignments", label: "환자배정", icon: BedSingle },
  { href: "/nurse/handoffs", label: "인수인계", icon: ClipboardPenLine },
  { href: "/nurse/vacations", label: "휴가·연차", icon: Plane },
  { href: "/nurse/shift-changes", label: "근무 변동", icon: ArrowLeftRight },
];

export function AppShell({
  role,
  userName,
  wardName,
  children,
}: {
  role: "HEAD_NURSE" | "NURSE";
  userName: string;
  wardName: string;
  children: ReactNode;
}) {
  const items = role === "HEAD_NURSE" ? headItems : nurseItems;
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href={role === "HEAD_NURSE" ? "/head/dashboard" : "/nurse"}>
          <span className="brand-mark"><Stethoscope size={20} aria-hidden="true" /></span>
          <span><strong>듀티메이트</strong><small>{wardName}</small></span>
        </Link>
        <nav aria-label="주 메뉴">
          {items.map((item) => (
            <Link href={item.href} key={item.href}>
              <item.icon size={18} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="account-card">
          <span className="avatar">{userName.slice(0, 1)}</span>
          <span><strong>{userName}</strong><small>{role === "HEAD_NURSE" ? "수간호사" : "간호사"}</small></span>
          <form action={logoutAction}>
            <button className="icon-button" type="submit" aria-label="로그아웃"><LogOut size={17} /></button>
          </form>
        </div>
      </aside>
      <main className="main-content">{children}</main>
      <nav className="mobile-nav" aria-label="모바일 주 메뉴">
        {items.map((item) => (
          <Link href={item.href} key={item.href}><item.icon size={18} /><span>{item.label.replace(" 관리", "")}</span></Link>
        ))}
      </nav>
    </div>
  );
}
