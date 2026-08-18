"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ko">
      <body>
        <aside className="demo-notice" aria-label="공개 데모 안내">
          공개 데모이며 모든 데이터는 가상 데이터이고 언제든 초기화될 수 있습니다. 실제 개인정보를 입력하지 마세요.
        </aside>
        <main className="error-page">
          <section className="card">
            <h1>일시적인 오류가 발생했습니다.</h1>
            <p>내부 오류 정보는 공개하지 않습니다. 잠시 후 다시 시도해 주세요.</p>
            <button className="button primary" type="button" onClick={reset}>다시 시도</button>
          </section>
        </main>
      </body>
    </html>
  );
}
