import { CalendarCheck2, CheckCircle2, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/actions";
import { DEMO_ACCOUNTS } from "@/lib/domain";

export const dynamic = "force-dynamic";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "로그인" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; reset?: string }> }) {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "HEAD_NURSE" ? "/head/dashboard" : "/nurse");
  const { error, reset } = await searchParams;
  return (
    <main className="login-page">
      <section className="login-intro">
        <div className="login-brand"><span><CalendarCheck2 size={26} /></span> 듀티메이트</div>
        <div><p className="eyebrow light">SMART WARD SCHEDULING</p><h1>더 차분한 근무표,<br />더 편안한 우리 병동.</h1><p>희망 OFF부터 휴가, 확정 듀티까지<br />한눈에 확인하고 간편하게 관리하세요.</p></div>
        <ul><li><CheckCircle2 /> 희망 OFF와 실제 근무표를 분리 관리</li><li><CheckCircle2 /> 근무 인원 부족을 날짜별로 즉시 확인</li><li><ShieldCheck /> 실제 병원·직원 정보가 없는 공개 체험용 데모</li></ul>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <div className="mobile-logo"><CalendarCheck2 /> 듀티메이트</div>
          <div><p className="eyebrow">PUBLIC DEMO</p><h2>데모 로그인</h2><p>아래 공개 계정으로 바로 체험하거나 이름과 직원번호를 입력하세요.</p></div>
          {reset && <div className="alert success" role="status">가상 데모 데이터로 초기화했습니다. 다시 로그인해 주세요.</div>}
          {error && <div className="alert error" role="alert">{error === "missing" ? "이름과 일련번호를 모두 입력해주세요." : "등록된 정보와 일치하지 않습니다."}</div>}
          <div className="demo-account-grid">
            {DEMO_ACCOUNTS.map((account) => <form action={loginAction} key={account.employeeNumber}>
              <input type="hidden" name="name" value={account.name} />
              <input type="hidden" name="employeeNumber" value={account.employeeNumber} />
              <button className="demo-account-button" type="submit"><span>{account.role}</span><strong>{account.name} · {account.employeeNumber}</strong></button>
            </form>)}
          </div>
          <div className="login-divider"><span>직접 입력</span></div>
          <form className="login-fields" action={loginAction}>
            <label>이름<input name="name" placeholder="예: 김민지" autoComplete="name" maxLength={40} autoFocus required /></label>
            <label>직원번호<input name="employeeNumber" placeholder="예: N001" autoComplete="off" maxLength={20} pattern="[A-Za-z0-9_-]+" required /></label>
            <button className="button primary large" type="submit">로그인</button>
          </form>
          <p className="login-help">실제 이름, 직원번호, 병원 정보 등 개인정보를 입력하지 마세요.</p>
        </div>
      </section>
    </main>
  );
}
