"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="error-page">
      <section className="card">
        <p className="eyebrow">TEMPORARY ERROR</p>
        <h1>요청을 처리하지 못했습니다.</h1>
        <p>잠시 후 다시 시도해 주세요. 공개 데모에는 내부 오류 정보가 표시되지 않습니다.</p>
        <button className="button primary" type="button" onClick={reset}>다시 시도</button>
      </section>
    </main>
  );
}
