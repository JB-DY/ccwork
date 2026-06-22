# Typography

> 타이포그래피가 UI다. 아이콘보다 글자로 계층을 만든다.

## Font Family

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Inter** 단독 사용. 스케일과 weight 조작만으로 계층을 표현한다.

---

## Type Scale

| 역할 | 토큰 | Size | Weight | Line-height | Letter-spacing | Tailwind |
|------|------|------|--------|-------------|----------------|---------|
| Display | `display-lg` | 3.5rem (56px) | 700 | 1.1 | -0.02em | `text-[3.5rem] font-bold leading-[1.1] tracking-[-0.02em]` |
| Headline | `headline-md` | 1.75rem (28px) | 600 | 1.4 | 0 | `text-[1.75rem] font-semibold leading-[1.4]` |
| Body | `body-lg` | 1rem (16px) | 400 | 1.7 | 0 | `text-base font-normal leading-[1.7]` |
| Label | `label-md` | 0.75rem (12px) | 500 | 1.4 | +0.05em | `text-[0.75rem] font-medium leading-[1.4] tracking-[0.05em] uppercase` |

---

## 용도별 사용 지침

### Display (`display-lg`)
랜딩 페이지, 섹션 핵심 한 줄 문장. 한 페이지에 1회 사용을 권장.
```tsx
<h1 className="text-[3.5rem] font-bold leading-[1.1] tracking-[-0.02em] text-[#2b3437]">
  Today I Learned
</h1>
```

### Headline (`headline-md`)
TIL 항목 제목, 페이지 섹션 헤더. 넉넉한 line-height(1.4)로 가독성 확보.
```tsx
<h2 className="text-[1.75rem] font-semibold leading-[1.4] text-[#2b3437]">
  항목 제목
</h2>
```

### Body (`body-lg`)
본문 장문. `--on-surface-variant`(#586064)로 눈의 피로를 줄인다.
강조가 필요한 구간만 `--on-surface`(#2b3437)로 전환.
```tsx
<p className="text-base leading-[1.7] text-[#586064]">
  본문 내용...
</p>
```

### Label (`label-md`)
메타데이터, 날짜, 태그 레이블. 반드시 `uppercase` + `letter-spacing +0.05em` 적용.
```tsx
<span className="text-[0.75rem] font-medium uppercase tracking-[0.05em] text-[#586064]">
  2026-05-29
</span>
```

---

## 색상 규칙

| 상황 | 색상 |
|------|------|
| 기본 텍스트, 제목 | `--on-surface` (#2b3437) |
| 본문, 메타데이터 | `--on-surface-variant` (#586064) |
| 강조 전환 | variant → on-surface |
| 금지 | `#000000` 순수 검정 |

---

## 규칙

- **폰트 크기 변경으로 강조 금지** — 색상 전환으로 대체
- **아이콘 의존 금지** — 기능적 명확성이 없으면 텍스트로만 표현
- Label은 항상 `uppercase` — 내러티브 콘텐츠와 기능적 메타데이터를 구분
