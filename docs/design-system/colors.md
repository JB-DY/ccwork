# Colors

> 색상은 의미를 전달하는 도구다. 순수한 미적 용도로만 사용하지 않는다.

## Primary / Accent

단일 액센트 컬러 시스템. `tertiary`가 유일한 브랜드 컬러이며 **sparingly** 사용한다.

| 역할 | 토큰 | Hex | 용도 |
|------|------|-----|------|
| Accent | `--tertiary` | `#0053dc` | CTA, Focus 테두리, 링크, Ghost 버튼 텍스트 |
| Accent Gradient End | `--tertiary-container` | `#3e76fe` | Primary 버튼 그라데이션 끝점 |
| On Accent | `--on-tertiary` | `#faf8ff` | Primary 버튼 위 텍스트 |

**Primary 버튼 그라데이션:**
```css
background: linear-gradient(to right, #0053dc, #3e76fe);
```

---

## Surface (배경 계층)

depth를 그림자 대신 배경색 전환으로 표현한다. 실선 테두리 금지.

| 토큰 | Hex | 레이어 | 용도 |
|------|-----|--------|------|
| `--surface-container-lowest` | `#ffffff` | 최상단 | 카드, 활성 입력 필드, 모달 내부 |
| `--surface` / `--background` | `#f8f9fa` | 기본 | 앱 전체 캔버스 |
| `--surface-container-low` | `#f1f4f6` | 보조 | 사이드바, 내비게이션 배경 |
| `--surface-container` | `#eaeff1` | 섹션 | 콘텐츠 구분 영역 |
| `--surface-container-high` | `#e2e9ec` | 강조 | Secondary 버튼 배경 |
| `--surface-container-highest` | `#dbe4e7` | 선택 | 선택된 항목, Chip 배경 |

**계층 시각화 (뒤 → 앞):**
```
#eaeff1 → #f1f4f6 → #f8f9fa → #ffffff
 섹션       사이드바    캔버스     카드
```

---

## Text

| 토큰 | Hex | 용도 |
|------|-----|------|
| `--on-surface` | `#2b3437` | 제목, 강조 텍스트, 버튼 레이블 |
| `--on-surface-variant` | `#586064` | 본문 장문, 메타데이터, 보조 설명 |

- `#000000` (순수 검정) **사용 금지**
- 강조가 필요하면 `--on-surface-variant` → `--on-surface`로 색상 전환

---

## State

| 상태 | 표현 방식 | 색상 |
|------|-----------|------|
| Hover (카드/리스트) | 배경 전환 | `surface` → `surface-container-low` (#f1f4f6) |
| Selected (사이드바) | 배경 전환 | → `surface-container-highest` (#dbe4e7) |
| Focus (Input) | 테두리 전환 | ghost border → `1px solid #0053dc` |
| Disabled | opacity | `opacity: 0.4` |
| Ghost Border | 테두리 fallback | `rgba(171, 179, 183, 0.15)` |

---

## Outline

| 토큰 | Hex | 용도 |
|------|-----|------|
| `--outline-variant` | `#abb3b7` | Ghost Border base (15% opacity로만 사용) |

```css
/* Ghost Border — 접근성 fallback 전용 */
border: 1px solid rgba(171, 179, 183, 0.15);
```
