# Cards & Lists

## 카드

```
배경: --surface-container-lowest (#ffffff)
부모 영역 배경: --surface-container (#eaeff1) 이상
테두리: 없음 (Tonal Layering으로 구분)
Radius: 0.75rem ~ 1rem
Shadow: 없음 (기본 카드)
Hover: 배경 surface → surface-container-low 전환
```

## Tailwind 예시

```tsx
// 카드
<div className="bg-white rounded-xl p-4 hover:bg-[#f1f4f6] transition-colors cursor-pointer">
  {children}
</div>

// 선택된 상태 (사이드바 항목)
<div className={`rounded-xl p-4 transition-colors ${
  isSelected ? 'bg-[#dbe4e7]' : 'bg-white hover:bg-[#f1f4f6]'
}`}>
  {children}
</div>
```

## 리스트

- 항목 간 구분선(`border-b`, `<hr>`) **금지**
- `gap: 1.4rem` (spacing.4) 으로 간격 확보
- hover: `surface` → `surface-container-low` 전환

```tsx
<ul className="flex flex-col gap-[1.4rem]">
  {items.map(item => <li key={item.id}>{item.content}</li>)}
</ul>
```
