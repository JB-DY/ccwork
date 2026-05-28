# Buttons

## 스펙

| 종류 | 배경 | 텍스트 | 테두리 | Radius | Hover |
|------|------|--------|--------|--------|-------|
| Primary | `linear-gradient(--tertiary, --tertiary-container)` | `--on-tertiary` | 없음 | 0.375rem | opacity 75% |
| Secondary | `--surface-container-high` | `--on-surface` | 없음 | 0.375rem | `--surface-container-highest` |
| Ghost | 없음 | `--tertiary` | 없음 | 0.375rem | `--tertiary` 2% opacity 배경 |

## Tailwind 예시

```tsx
// Primary
<button className="bg-gradient-to-r from-[#0053dc] to-[#3e76fe] text-[#faf8ff] px-5 py-2 rounded-[0.375rem] hover:opacity-75 transition-opacity">
  저장
</button>

// Secondary
<button className="bg-[#e2e9ec] text-[#2b3437] px-5 py-2 rounded-[0.375rem] hover:bg-[#dbe4e7] transition-colors">
  취소
</button>

// Ghost
<button className="text-[#0053dc] px-5 py-2 rounded-[0.375rem] hover:bg-[#0053dc]/[0.02] transition-colors">
  더 보기
</button>
```

## 규칙

- 버튼에 테두리 사용 금지
- Primary는 페이지당 하나의 주요 액션에만 사용
- disabled 상태: `opacity-40` + `cursor-not-allowed`
