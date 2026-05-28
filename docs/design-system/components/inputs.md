# Input Fields

## 스펙

```
배경: --surface-container-lowest (#ffffff)
기본 테두리: ghost border (1px solid rgba(171,179,183,0.15))
Focus 테두리: 1px solid --tertiary (#0053dc)
Radius: 0.375rem
Label: label-md (0.75rem, uppercase, letter-spacing +0.05em)
Label 위치: input 위, spacing.1 (0.35rem) 간격
```

## Tailwind 예시

```tsx
<div className="flex flex-col gap-[0.35rem]">
  <label className="text-[0.75rem] font-medium uppercase tracking-[0.05em] text-[#586064]">
    제목
  </label>
  <input
    className="bg-white border border-[rgba(171,179,183,0.15)] rounded-[0.375rem] px-3 py-2
               text-[#2b3437] outline-none
               focus:border-[#0053dc] transition-colors"
    placeholder="제목을 입력하세요"
  />
</div>
```

## 규칙

- placeholder 색상: `--on-surface-variant` 50% opacity
- 에러 상태: 테두리를 destructive 색상으로 전환 (별도 토큰 정의 시)
- Textarea도 동일 스펙 적용, `resize-none`
