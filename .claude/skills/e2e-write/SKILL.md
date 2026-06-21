---
name: e2e-write
description: 기능 PRD(`docs/features/{기능명}/prd.md`)의 "사용자 스토리"를 읽어 Playwright E2E 테스트 코드로 옮기는 스킬. `/e2e-write <기능명>` 호출이나 사용자가 "E2E 테스트 작성", "e2e 짜줘", "사용자 시나리오 테스트", "플레이라이트 테스트 만들어줘", "end-to-end 테스트", "e2e-write tag" 같이 말할 때 반드시 사용한다. 이 스킬은 `e2e/` 디렉토리에 `*.spec.ts`만 생성/수정하며 `src/` 구현 코드와 Vitest 단위 테스트는 건드리지 않는다 — 단위 테스트가 이미 검증하는 순수 로직은 중복하지 않고, 실제 브라우저+json-server 스택을 가로지르는 사용자 여정만 검증하는 게 목적이다.
context: fork
---

# E2E Write Skill

기능 PRD의 **사용자 스토리**를 실제 브라우저에서 도는 **Playwright E2E 테스트**로 옮긴다.

근거: 사용자 스토리는 `docs/features/{기능명}/prd.md` § 2에 이미 확정되어 있다 (feature-planner 스킬 산출물). E2E는 그 스토리가 **실제 앱에서 처음부터 끝까지** 동작하는지 검증한다.

---

## E2E 테스트의 본질 — "단위 테스트가 못 보는 경계를 본다"

이 프로젝트의 단위 테스트(Vitest)는 `vi.mock('../api/notes')`로 **API를 가짜로 대체**한다. 그래서 단위 테스트는 다음을 **절대 검증하지 못한다**:

- 실제 json-server(`http://localhost:3001`)로의 HTTP 왕복과 **영속화**
- **페이지 새로고침** 후에도 데이터가 살아있는지
- 사이드바 ↔ 에디터 등 **컴포넌트를 가로지르는 네비게이션**
- 실제 브라우저 렌더링·클릭·키 입력의 통합

> **E2E의 일은 정확히 이 빈틈이다.** 단위 테스트가 이미 mock 뒤에서 초록색으로 증명한 것을, 느리고 비싼 브라우저로 다시 확인하지 않는다. E2E는 "여러 조각이 실제로 연결되어 사용자의 목표가 달성되는가"를 본다.

이 한 줄을 어기면(= 단위 테스트 중복) E2E 스위트는 느리고, 깨지기 쉽고, 가치가 낮아진다.

---

## 입출력 계약

### 입력
- `$ARGUMENTS` — 기능명 (예: `tag`). `docs/features/`의 하위 폴더명과 일치.
  - 모호하면 `docs/features/`를 나열해 사용자에게 묻는다. 임의로 고르지 않는다.
- `docs/features/{기능명}/prd.md`에서:
  - **§ 2 사용자 스토리** — E2E 시나리오의 원천
  - **§ 1 개요 / 제약 조건** — 기능의 핵심 흐름과 한계
  - **§ 4 Out of Scope** — 테스트하면 **안 되는** 범위 (여기 있는 건 E2E도 다루지 않는다)

### 산출물
- `e2e/{기능명}.spec.ts` — Playwright 테스트 (사용자 여정 단위)
- 최초 1회: `playwright.config.ts` + `vite.config.ts`의 Vitest `exclude` 보정 (아래 "사전 준비" 참조)

---

## 무엇을 E2E로 옮기고, 무엇을 버리는가 (가장 중요)

사용자 스토리를 그대로 1:1로 옮기지 않는다. **단위 테스트가 이미 검증하는 순수 로직은 버리고**, 스택을 가로지르는 흐름만 남긴다.

`tag` 기능을 예로 든 판정 기준:

| PRD 사용자 스토리 | 단위 테스트가 이미 검증? | E2E에서? |
|---|---|---|
| 태그 입력 후 Enter로 추가 | △ NoteEditor가 mock 위에서 칩 렌더 검증 | ✅ **여정의 일부로** 포함 (실제 추가→저장→영속 흐름) |
| × 버튼으로 즉시 제거 | ✅ NoteEditor.test 다수 | ❌ 단독 테스트 불필요 (여정 중 한 동작으로만) |
| 저장 시 태그가 서버에 함께 저장 | ❌ API가 mock이라 **영속 검증 불가** | ✅ **E2E의 핵심** — 저장 후 새로고침해 살아있는지 |
| 중복/공백 무시 | ✅ useTagInput.test 완전 커버 | ❌ 재현 금지 (순수 로직) |
| 10개 도달 시 추가 안 됨 | ✅ useTagInput.test 경계 커버 | ❌ 재현 금지 |
| 20자 초과 입력 차단 | ✅ useTagInput.test 커버 | ❌ 재현 금지 |

**원칙**:
- 검증 로직(trim·중복·최대 개수·길이 제한)은 순수 함수/훅에서 단위 테스트가 남김없이 본다 → **E2E에서 다시 열거하지 않는다.**
- E2E는 그중 **대표 1~3개의 완결된 여정**만 만든다. 각 여정은 "앱 진입 → 조작 → 저장 → **실제 영속/새로고침 확인**"으로 끝나야 단위 테스트와 차별화된다.
- 검증 규칙을 굳이 E2E에 넣어야 한다면, 단독 테스트가 아니라 **여정 안의 한 스텝**으로 녹인다 (예: "공백을 넣어도 칩이 안 생기는 걸 확인하고, 유효한 태그를 넣어 저장으로 진행").

---

## E2E 작성 원칙 (Playwright best practices)

1. **사용자 관점 흐름을 테스트한다.** 내부 상태·클래스명·prop이 아니라, 사용자가 화면에서 보고 누르는 것을 따라간다.
2. **사용자 대면 locator를 우선한다.** `getByRole`, `getByPlaceholder`, `getByText`, `getByLabel` 순. CSS 셀렉터는 피한다. 이미 코드에 있는 `data-testid`(`tag-chip`, `tag-chip-remove`)는 사용자에게 안 보이는 요소를 집을 때만 fallback으로 쓴다.
3. **web-first 단언으로 자동 대기한다.** `await expect(locator).toBeVisible()`처럼 단언이 알아서 재시도한다. **`waitForTimeout`·임의 `sleep` 금지** — flaky의 주원인.
4. **테스트는 서로 격리한다.** 각 테스트는 자신의 데이터를 직접 준비(seed)하고 끝나면 정리(cleanup)한다. 다른 테스트의 실행 순서나 잔여 데이터에 의존하지 않는다 (아래 "데이터 격리").
5. **단위 테스트와 중복하지 않는다.** (위 "무엇을 옮기는가" 참조 — 이 스킬의 정체성)

---

## 데이터 격리 — db.json을 오염시키지 않기

이 앱은 `webServer`로 띄운 실제 json-server가 `db.json`을 직접 읽고 쓴다. 테스트가 노트를 만들고 방치하면 `db.json`이 영구히 오염된다. 그래서 **테스트마다 API로 시드하고 정리**한다.

- `beforeEach`: Playwright `request` fixture로 `POST /notes`해 이 테스트 전용 노트를 만들고 `id`를 기억.
- `afterEach`: `DELETE /notes/:id`로 정리. 테스트 중 새로 만든 노트도 추적해 함께 지운다.
- UI가 아니라 **API로 사전 상태를 만든다** — 빠르고 안정적이며, "준비"와 "검증"을 분리한다.

> 대안(별도 `db.e2e.json`으로 json-server 격리)도 가능하지만, 학습 프로젝트에서는 위 seed/cleanup 방식이 설정 변경 없이 자기완결적이라 기본으로 삼는다.

---

## 사전 준비 (최초 1회, 없을 때만)

### 1. `@playwright/test` 설치 확인
`package.json` devDependencies에 `@playwright/test`가 있고 브라우저가 설치됐는지 확인. 없으면 `npm i -D @playwright/test && npx playwright install` 안내.

### 2. `playwright.config.ts` 생성 (루트, 없을 때만)

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // 단일 json-server/db.json 공유 → 순차 실행이 안전
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev', // vite(5173) + json-server(3001) 동시 기동
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

### 3. Vitest가 E2E 스펙을 삼키지 않게 막기 (필수)

`vite.config.ts`의 Vitest 기본 `include`는 `**/*.spec.ts`를 **어디서든** 잡는다. `e2e/`를 비워두면 Vitest가 Playwright 스펙을 실행하려다 깨진다. `test` 블록에 `exclude`를 추가한다:

```ts
import { defineConfig, configDefaults } from 'vitest/config';
// ...
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
```

> 반대 방향(Playwright가 `src/`의 Vitest 파일을 잡는 것)은 `testDir: './e2e'`가 막아준다.

---

## 실행 순서

### 단계 1 — PRD 사용자 스토리 읽기
`docs/features/{기능명}/prd.md` § 2의 스토리 목록과 § 1 제약, § 4 Out of Scope를 읽는다.

### 단계 2 — 스토리 → E2E 시나리오로 필터링
위 "무엇을 옮기는가" 표 기준으로, 각 스토리를 분류:
- **순수 검증 로직 (단위가 커버)** → 버린다.
- **스택을 가로지르는 흐름** → 완결된 여정으로 묶는다.

여러 스토리가 하나의 자연스러운 사용자 여정으로 합쳐지면 **하나의 `test`로 합친다**. (예: "태그 추가" + "저장 시 서버 반영"은 한 여정.)

사용자에게 도출한 여정 목록을 먼저 보고하고, spec 작성 전 합의한다.

### 단계 3 — 사전 준비 확인 (위 섹션, 없을 때만)

### 단계 4 — `e2e/{기능명}.spec.ts` 작성
- `test.describe`로 기능 단위로 묶는다.
- `test` 제목은 **사용자 여정**을 1인칭/행동 중심으로 적는다. (단위 테스트의 `should...when...`과 달리, "사용자가 ~하면 ~된다" 흐름)
- 각 test = Arrange(API seed) → Act(UI 조작) → Assert(web-first 단언, **영속/새로고침 포함**).

### 단계 5 — 실행
```bash
npx playwright test
```
한 스펙만: `npx playwright test e2e/{기능명}.spec.ts`. 디버깅 시 `--headed` 또는 `--ui`.

### 단계 6 — 보고
통과/실패와 각 여정이 검증한 "단위가 못 보는 경계"를 한 줄씩 요약해 보고한다.

---

## 스펙 템플릿 (이 앱에 맞춰진 예)

```ts
import { test, expect, type APIRequestContext } from '@playwright/test';

const API = 'http://localhost:3001/notes';

// API로 사전 노트 생성 (UI가 아니라 직접 — 빠르고 격리됨)
async function seedNote(
  request: APIRequestContext,
  data: { title: string; content?: string; tags?: string[] },
) {
  const now = new Date().toISOString();
  const res = await request.post(API, {
    data: { content: '', tags: [], createdAt: now, updatedAt: now, ...data },
  });
  return (await res.json()) as { id: string };
}

test.describe('태그 기능 E2E', () => {
  const created: string[] = [];

  test.afterEach(async ({ request }) => {
    // 이 테스트가 만든 노트 정리 — db.json 오염 방지
    for (const id of created.splice(0)) {
      await request.delete(`${API}/${id}`);
    }
  });

  test('사용자가 노트에 태그를 추가·저장하면 새로고침 후에도 태그가 유지된다', async ({
    page,
    request,
  }) => {
    // Arrange: 태그 없는 노트를 API로 준비
    const note = await seedNote(request, { title: 'E2E 노트', content: '본문' });
    created.push(note.id);

    // Act: 앱 진입 → 노트 선택 → 태그 추가 → 저장
    await page.goto('/');
    await page.getByText('E2E 노트').click();
    const tagInput = page.getByPlaceholder('태그 추가');
    await tagInput.fill('playwright');
    await tagInput.press('Enter');
    await page.getByRole('button', { name: '저장' }).click();

    // Assert: 새로고침해도 칩이 살아있다 = 실제 서버에 영속됨
    //         (단위 테스트는 mock이라 절대 못 보는 지점)
    await page.reload();
    await page.getByText('E2E 노트').click();
    await expect(page.getByText('playwright')).toBeVisible();
  });
});
```

---

## 절대 금지

- **단위 테스트가 검증하는 순수 로직을 E2E로 재현 금지** — trim·중복·최대 개수·길이 제한을 별도 E2E 케이스로 나열하지 않는다. (이 스킬의 핵심 규칙)
- **`waitForTimeout`·임의 `sleep` 금지** — web-first 단언의 자동 대기를 쓴다.
- **`src/` 구현 코드·Vitest 단위 테스트 수정 금지** — E2E는 `e2e/`만 만진다. (단, 사전 준비의 `playwright.config.ts`/`vite.config.ts` `exclude` 보정은 예외)
- **테스트가 만든 데이터를 정리하지 않고 방치 금지** — `db.json`이 영구 오염된다.
- **구현 세부 단언 금지** — Tailwind 클래스명, React 내부 상태, prop 값에 의존하지 않는다.
- **§ 4 Out of Scope 항목 테스트 금지** — 필터링/자동완성/정렬 등은 기능 밖.

---

## 자주 하는 실수

- ❌ 사용자 스토리 6개 → E2E 6개로 1:1 변환 → 단위 테스트와 광범위하게 중복. 여정 단위로 **합치고 줄인다.**
- ❌ "20자 초과 차단"을 E2E 단독 케이스로 작성 → useTagInput.test가 이미 커버. 버린다.
- ❌ 저장 후 새로고침 없이 화면의 칩만 단언 → mock 단위 테스트와 다를 게 없다. **반드시 reload로 영속을 확인**해야 E2E의 값어치가 산다.
- ❌ `page.locator('.bg-\\[\\#dbe4e7\\]')` 같은 클래스 셀렉터 → 깨지기 쉽다. `getByText`/`getByRole`/testid 사용.
- ❌ 테스트 간 데이터 공유(앞 테스트가 만든 노트에 의존) → 순서/병렬에 취약. 각자 seed/cleanup.
- ❌ `e2e/`에 스펙을 두고 Vitest `exclude`를 안 넣음 → `npm test`가 Playwright 스펙을 실행하려다 폭발.

---

## 끝맺음

`npx playwright test` 결과를 사용자에게 보고한다.

```
✓ 태그 기능 E2E > 사용자가 ... 새로고침 후에도 태그가 유지된다 (Ns)
검증한 경계: 실제 json-server 영속 + 새로고침 생존 (단위 테스트 mock으로는 불가능)
Total: N passed
```

이 스위트는 단위 테스트(빠른 로직 검증)와 **상호보완**한다 — 겹치지 않고, 스택 통합만 지킨다.
