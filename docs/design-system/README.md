# Design System — The Digital Atelier

> **Soft Minimalism** 철학 기반. 모든 스타일 작업 전 이 문서를 참고할 것.
> 콘텐츠가 UI보다 앞서야 한다. UI는 조용하게, 정보는 선명하게.

---

## 1. Color Tokens

### Surface 계층

배경 색상만으로 depth를 표현한다. **1px 실선 테두리로 영역을 구분하는 것은 금지.**

| 토큰 | Hex | 용도 |
|------|-----|------|
| `--surface-container-lowest` | `#ffffff` | 카드, 활성 작업 영역 (가장 앞에 뜨는 느낌) |
| `--surface` / `--background` | `#f8f9fa` | 기본 캔버스 |
| `--surface-container-low` | `#f1f4f6` | 사이드바, 내비게이션 배경 |
| `--surface-container` | `#eaeff1` | 섹션 구분 영역 |
| `--surface-container-high` | `#e2e9ec` | Secondary 버튼 배경 |
| `--surface-container-highest` | `#dbe4e7` | Knowledge Token, 선택된 사이드바 항목 |

### 텍스트

| 토큰 | Hex | 용도 |
|------|-----|------|
| `--on-surface` | `#2b3437` | 기본 텍스트, 강조 텍스트 |
| `--on-surface-variant` | `#586064` | 본문 장문, 보조 설명 |

### 액센트 (sparingly 사용)

| 토큰 | Hex | 용도 |
|------|-----|------|
| `--tertiary` | `#0053dc` | Ghost 버튼 텍스트, Focus 테두리, 링크 |
| `--tertiary-container` | `#3e76fe` | Primary 버튼 그라데이션 끝 |
| `--on-tertiary` | `#faf8ff` | Primary 버튼 위 텍스트 |

### Ghost Border (접근성 fallback 전용)

```css
border: 1px solid rgba(171, 179, 183, 0.15); /* --outline-variant 15% opacity */
```

유사한 배경끼리 맞닿아 구분이 필요할 때만 사용. 선이 보이는 게 아니라 "존재가 느껴지는" 수준.

---

## 2. Typography

폰트: **Inter** 단독 사용.

| 역할 | 토큰 | Size | Weight | Line-height | Letter-spacing | 용도 |
|------|------|------|--------|-------------|----------------|------|
| Display | `display-lg` | 3.5rem | 700 | 1.1 | -0.02em | 랜딩, 핵심 한 줄 |
| Headline | `headline-md` | 1.75rem | 600 | 1.4 | 0 | TIL 항목 제목 |
| Body | `body-lg` | 1rem | 400 | 1.7 | 0 | 본문 장문 |
| Label | `label-md` | 0.75rem | 500 | 1.4 | +0.05em | 메타데이터, 태그 (항상 uppercase) |

- 장문 본문: `--on-surface-variant` (#586064) — 눈의 피로 감소
- 강조 텍스트: `--on-surface` (#2b3437) 로 전환
- **순수 검정(#000000) 사용 금지**

---

## 3. Elevation & Depth

### Tonal Layering (기본 원칙)

그림자 대신 배경색 전환으로 depth를 만든다.

```
surface-container (#eaeff1)          ← 섹션 배경
  └── surface-container-lowest (#fff)  ← 그 위에 카드 → "종이 위에 놓인" 느낌
```

### Glassmorphism (플로팅 요소 전용)

모달, 드롭다운, 호버 브레드크럼에 한해 적용.

```css
background: rgba(248, 249, 250, 0.8); /* surface 80% */
backdrop-filter: blur(12px);
```

### Ambient Shadow (팝오버 등 floating 필수 요소)

```css
box-shadow: 0 8px 40px rgba(43, 52, 55, 0.06); /* on-surface 6% */
```

blur 24–40px. 기본 카드에는 적용하지 않는다.

---

## 4. Components

### Buttons

| 종류 | 배경 | 텍스트 | 테두리 | Radius |
|------|------|--------|--------|--------|
| Primary | `linear-gradient(tertiary → tertiary-container)` | `on-tertiary` | 없음 | 0.375rem |
| Secondary | `surface-container-high` | `on-surface` | 없음 | 0.375rem |
| Ghost | 없음 | `tertiary` | 없음 | 0.375rem |

- Ghost hover: 액센트 색상 2% opacity 배경 추가

### Cards & Lists

- 리스트 항목 구분: **구분선 금지** → `gap: 1.4rem` (spacing.4) 으로 대체
- hover: `surface` → `surface-container-low` 배경 전환

### Input Fields

```
기본: surface-container-lowest 배경 + ghost border (1px, 15% opacity)
focus: 테두리 → 1px solid tertiary (#0053dc)
label: label-md, uppercase, input 위 spacing.1 간격
```

### Knowledge Token (Topic Chip)

```
배경: surface-container-highest (#dbe4e7)
텍스트: on-surface-variant (#586064), label-md, uppercase
radius: 9999px (full)
테두리: 없음
```

---

## 5. Spacing Scale

기준 단위: **1.4rem (spacing.4)**

| 토큰 | 값 | 용도 |
|------|----|------|
| `spacing.1` | 0.35rem | label ↔ input 간격 |
| `spacing.2` | 0.7rem | 헤드라인 ↔ 본문 간격 |
| `spacing.4` | 1.4rem | 리스트 항목 간격 (기본 리듬) |
| `spacing.10` | 3.5rem | 대형 레이아웃 섹션 간격 |

여백을 구조 요소로 사용한다. 여백이 충분하지 않다면 늘리는 방향으로.

---

## 6. Do / Don't

### ✅ Do

- 영역 구분은 **배경색 전환**으로 (sidebar: `surface-container-low` / main: `surface`)
- 액센트 색상(`tertiary`)은 의도적 액션(CTA, focus, link)에만 사용
- `surface-container-highest`를 사이드바 **선택 상태**에 사용
- 여백이 애매하면 항상 **늘리는** 방향으로 결정
- 메타데이터/태그는 `label-md` + `uppercase` + `letter-spacing: +0.05em`

### ❌ Don't

- `1px solid border`로 사이드바나 카드 경계 구분 **금지**
- 일반 카드에 `box-shadow` 적용 **금지** (Tonal Layering으로 대체)
- 리스트 항목 사이에 `<hr>` 또는 divider 라인 **금지**
- 텍스트에 순수 검정(`#000000`) **금지** → `--on-surface` (#2b3437) 사용
- 기능적 명확성 없는 아이콘 **금지** (타이포그래피 중심 시스템)
- 사이드바와 메인 영역 경계에 테두리 **금지** → 색상 차이로만 표현
