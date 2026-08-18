# 듀티메이트 프런트엔드

가상 간호사 데이터로 간호사 듀티표 기능을 체험하는 공개 데모의 Next.js
프런트엔드입니다. 이름 + 직원번호 데모 로그인, 희망 OFF, 휴가, 자동 듀티 생성,
근무 교환·대체 요청과 수간호사 관리 화면을 제공합니다.

> 공개 데모이며 모든 데이터는 가상 데이터이고 언제든 초기화될 수 있습니다.
> 실제 이름, 직원번호, 병원명, 연락처 등 개인정보를 입력하지 마세요.

## 저장소 경계

이 저장소는 **PUBLIC**으로 공개해도 되는 UI와 서버 프록시만 포함합니다.

- Prisma Client, DB 스키마, migration, seed를 포함하지 않습니다.
- 브라우저는 DB나 비공개 백엔드에 직접 접근하지 않습니다.
- 프런트 서버만 `BACKEND_SHARED_SECRET`을 사용해 백엔드 API를 호출합니다.
- 로그인 토큰은 프런트 도메인의 `HttpOnly` 쿠키에만 저장됩니다.
- `NEXT_PUBLIC_` 환경변수에 비밀값을 넣으면 안 됩니다.

DB와 권한 검증, seed, 자동 듀티 생성 로직은 비공개
`nurse-duty-schedule-backend` 저장소에 있습니다.

## 공개 데모 계정

로그인 화면에 대표 계정이 표시되며 비밀번호는 사용하지 않습니다.

| 역할 | 이름 | 직원번호 |
|---|---|---|
| 수간호사 | 관리자 | H001 |
| 일반 간호사 | 김민지 | N001 |
| 일반 간호사 | 이서연 | N002 |
| 일반 간호사 | 박지현 | N003 |
| 일반 간호사 | 최수진 | N004 |
| 일반 간호사 | 정하늘 | N005 |
| 일반 간호사 | 윤서영 | N006 |

이 로그인 방식은 공개 기능 체험 전용이며 실제 병원 인증에 사용할 수 없습니다.

## 로컬 실행

Node.js 22를 권장합니다.

```bash
npm install
cp .env.example .env
npm run dev
```

먼저 비공개 백엔드를 실행하고 `.env`에 다음 값을 설정합니다.

```dotenv
BACKEND_API_URL="http://localhost:3001"
BACKEND_SHARED_SECRET="백엔드와 동일한 32자 이상의 무작위 값"
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY="base64로 인코딩된 32바이트 키"
```

키와 공유 비밀은 각각 다음처럼 만들 수 있습니다.

```bash
openssl rand -hex 32
openssl rand -base64 32
```

## Render 배포

1. Render에서 **New > Web Service**를 선택합니다.
2. GitHub의 `nurse-duty-schedule-frontend` 저장소와 `main` 브랜치를 연결합니다.
3. Runtime은 Node, Instance Type은 Free를 선택합니다.
4. 아래 명령과 Health Check Path를 입력합니다.

```text
Build Command: npm ci && npm run build
Start Command: npm run start
Health Check Path: /login
```

Render Environment에는 다음 값을 입력합니다.

| Key | 값 |
|---|---|
| `BACKEND_API_URL` | 배포된 비공개 백엔드의 `https://...onrender.com` 주소 |
| `BACKEND_SHARED_SECRET` | 백엔드의 `FRONTEND_SHARED_SECRET`과 동일한 값 |
| `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` | `openssl rand -base64 32` 결과 |
| `NODE_VERSION` | `22` |

`BACKEND_SHARED_SECRET`은 공개 GitHub 저장소에 쓰지 말고 Render의 Environment에만
저장합니다. `render.yaml`의 비밀값은 `sync: false`라서 화면에서 직접 입력해야 합니다.

## 보안 동작

- 모든 페이지에 공개 데모 및 개인정보 입력 금지 안내를 표시합니다.
- 쿠키는 `HttpOnly`, `SameSite=Lax`, 운영 환경 `Secure`, `Priority=High`입니다.
- 프런트 서버 액션은 백엔드에 전달하기 전 입력 크기와 허용 필드를 제한합니다.
- 백엔드는 매 요청마다 세션에서 사용자·병동·역할을 다시 조회합니다.
- 운영 오류 화면에는 내부 예외, stack, DB 정보를 표시하지 않습니다.

## 검증

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## GitHub에 올리면 안 되는 파일

- `.env`, `.env.local`, `.env.production` 등 실제 환경변수 파일
- 실제 `BACKEND_SHARED_SECRET`
- 실제 `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`
- 로그인 토큰, 로그, 백업, 실제 개인정보가 담긴 파일
- `node_modules/`, `.next/`

값이 placeholder인 `.env.example`만 커밋합니다.
