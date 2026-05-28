---
name: design-system
description: UI 코드(.tsx / .jsx / .css / Tailwind 클래스)를 작성하거나 수정할 때 자동 활성화된다. 버튼·카드·입력 필드·모달·레이아웃 등 스타일이 포함된 모든 컴포넌트 작업, 색상·여백·폰트 관련 코드 변경, 디자인 토큰 적용 요청에 사용한다. "버튼 만들어줘", "카드 스타일", "UI 구현", "색상 적용", "스타일 수정" 등의 요청에도 트리거한다.
---

# Design System Skill

UI 코드 작성/수정 시 `docs/design-system/`의 문서를 참조해 토큰과 패턴을 일관되게 적용한다.

## Step 1: 레퍼런스 로드

작업 시작 전 아래 파일을 **항상** 읽는다.

| 파일 | 내용 |
|------|------|
| `docs/design-system/colors.md` | 색상 팔레트, 의미별 토큰 매핑 |
| `docs/design-system/typography.md` | 폰트 스케일, weight, Tailwind 클래스 |
| `docs/design-system/spacing.md` | spacing 스케일, 그리드 패턴 |
| `docs/design-system/components.md` | 버튼·카드·Input·Modal·Chip 패턴 |

추가로 필요 시:
- `docs/design-system/tokens.md` — CSS 변수 전체 목록
- `docs/design-system/guidelines/elevation.md` — depth/shadow 규칙
- `docs/design-system/guidelines/do-dont.md` — 위반 패턴 체크리스트

## Step 2: 구현 규칙

### 색상
- **hard-coded 색상값(`#xxxxxx`) 직접 입력 금지** — `colors.md`의 토큰 hex 값을 의미 기반으로 선택
- 텍스트: `#2b3437`(기본) / `#586064`(보조) — `#000000` 금지
- 배경: surface 계층에서 선택 (`#ffffff` → `#f8f9fa` → `#f1f4f6` → `#eaeff1`)
- 액센트(`#0053dc`): CTA / focus / link에만

### Spacing
- **임의의 px/rem 값 직접 입력 금지** — `spacing.md`의 스케일에서 선택
- 리스트 항목 간격: `gap-[1.4rem]`
- Label ↔ Input: `gap-[0.35rem]`
- 섹션 간격: `gap-[3.5rem]`

### 컴포넌트
- `components.md`에 정의된 패턴을 **우선적으로 재사용** — 새로 만들기 전에 확인
- 버튼: 3종(Primary/Secondary/Ghost)만 사용, 테두리 금지
- 카드: 테두리·그림자 금지, Tonal Layering으로 depth 표현
- 구분선(`border-b`, `<hr>`): 금지 → `gap`으로 대체

## Step 3: 작성 후 검증

구현 완료 후 아래 항목을 코드에서 직접 확인하고 위반 시 즉시 수정한다.

```
❌ border-b / border-gray / border-solid  → 실선 테두리 위반
❌ shadow-md / shadow-lg                  → 카드 그림자 위반
❌ text-black / #000000                   → 순수 검정 위반
❌ 임의 hex (#3a4b5c 등)                  → 토큰 미사용 위반
❌ 임의 rem/px (mt-[23px] 등)             → spacing 스케일 미사용 위반
```

위반 없으면 "✅ 디자인 시스템 검증 완료"를 보고한다.
