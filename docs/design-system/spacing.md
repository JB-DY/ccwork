# Spacing

> 여백은 장식이 아니라 구조다. 구분선 대신 공간으로 계층을 만든다.

## 기준 단위

**1.4rem** = `spacing.4` = 기본 리듬 단위.
모든 간격은 이 단위의 배수 또는 분수로 구성된다.

---

## Spacing Scale

| 토큰 | 값 | px(16px 기준) | Tailwind | 용도 |
|------|----|---------------|---------|------|
| `spacing.1` | 0.35rem | 5.6px | `gap-[0.35rem]` / `p-[0.35rem]` | Label ↔ Input |
| `spacing.2` | 0.7rem | 11.2px | `gap-[0.7rem]` / `mb-[0.7rem]` | Headline ↔ Body |
| `spacing.3` | 1.05rem | 16.8px | `gap-[1.05rem]` | 인라인 요소 간격 |
| `spacing.4` | 1.4rem | 22.4px | `gap-[1.4rem]` / `p-[1.4rem]` | **기본 리듬** — 리스트 항목 간격 |
| `spacing.6` | 2.1rem | 33.6px | `gap-[2.1rem]` / `p-[2.1rem]` | 카드 내부 패딩 |
| `spacing.8` | 2.8rem | 44.8px | `p-[2.8rem]` | 섹션 내부 패딩 |
| `spacing.10` | 3.5rem | 56px | `gap-[3.5rem]` / `py-[3.5rem]` | 대형 레이아웃 섹션 간격 |

---

## 레이아웃 그리드

```
┌─────────────────────────────────────────────┐
│  App (100vw)                                 │
│  ┌──────────┬──────────────────────────────┐ │
│  │ Sidebar  │        Main Content          │ │
│  │  w-72    │         flex-1               │ │
│  │  p-3     │         p-8                  │ │
│  └──────────┴──────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

| 영역 | 너비 | 패딩 | 배경 |
|------|------|------|------|
| Sidebar | `w-72` (288px) | `p-3` | `surface-container-low` |
| Main | `flex-1` | `p-8` | `surface` |
| Header | `100%` | `px-6 py-4` | `surface-container-lowest` |

---

## 컴포넌트별 spacing 패턴

### 카드
```tsx
<div className="p-4 rounded-xl">        {/* spacing.4 내부 패딩 */}
  <h3 className="mb-[0.7rem]">제목</h3>  {/* spacing.2 아래 여백 */}
  <p>내용</p>
</div>
```

### 리스트
```tsx
<ul className="flex flex-col gap-[1.4rem]">  {/* spacing.4 항목 간격 */}
  {/* 구분선(border-b, hr) 절대 금지 */}
</ul>
```

### 폼 필드
```tsx
<div className="flex flex-col gap-[0.35rem]">  {/* spacing.1 label-input 간격 */}
  <label>레이블</label>
  <input />
</div>
```

---

## 원칙

- 여백이 애매하면 **항상 늘리는** 방향으로 결정
- 구분선(`border-b`, `<hr>`) **금지** — `gap`으로 대체
- 대형 레이아웃 블록 사이는 `spacing.10`으로 "atmospheric" 여백 유지
- 수직 리듬: Headline → Body 사이 `spacing.2`, Section → Section 사이 `spacing.10`
