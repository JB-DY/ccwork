# Knowledge Token (Topic Chip)

주제 태그(`#javascript`, `#design` 등)에 사용하는 칩 컴포넌트.

## 스펙

```
배경: --surface-container-highest (#dbe4e7)
텍스트: --on-surface-variant (#586064)
타이포: label-md (0.75rem, uppercase, letter-spacing +0.05em)
Radius: 9999px (full)
테두리: 없음
Padding: 0.25rem 0.75rem
```

## Tailwind 예시

```tsx
<span className="bg-[#dbe4e7] text-[#586064] text-[0.75rem] font-medium uppercase tracking-[0.05em] rounded-full px-3 py-1">
  javascript
</span>
```

## 규칙

- 테두리 사용 금지
- 색상 변형 없이 단일 스타일만 사용 (배지류도 동일)
- 클릭 가능한 칩: hover 시 `surface-container-high`(#e2e9ec)로 배경 전환
