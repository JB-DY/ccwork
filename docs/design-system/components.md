# Components

> 모든 컴포넌트는 디자인 토큰만 사용한다. 임의 색상값 금지.

---

## Button

세 가지 변형만 존재한다. 테두리 없음 원칙 적용.

| 변형 | 배경 | 텍스트 | Hover | 용도 |
|------|------|--------|-------|------|
| Primary | `#0053dc → #3e76fe` (gradient) | `#faf8ff` | opacity 75% | 페이지당 1개, 주요 액션 |
| Secondary | `#e2e9ec` | `#2b3437` | `#dbe4e7` | 보조 액션, 취소 |
| Ghost | transparent | `#0053dc` | `#0053dc` 2% bg | 부가 액션, 인라인 링크형 |

```tsx
// Primary
<button className="bg-gradient-to-r from-[#0053dc] to-[#3e76fe] text-[#faf8ff]
                   px-5 py-2 rounded-[0.375rem] font-medium
                   hover:opacity-75 disabled:opacity-40
                   transition-opacity cursor-pointer">
  저장
</button>

// Secondary
<button className="bg-[#e2e9ec] text-[#2b3437]
                   px-5 py-2 rounded-[0.375rem] font-medium
                   hover:bg-[#dbe4e7] transition-colors cursor-pointer">
  취소
</button>

// Ghost
<button className="text-[#0053dc]
                   px-5 py-2 rounded-[0.375rem] font-medium
                   hover:bg-[#0053dc]/[0.02] transition-colors cursor-pointer">
  더 보기
</button>
```

**규칙:** 버튼 테두리 금지 / disabled: `opacity-40 cursor-not-allowed`

---

## Card

그림자 없이 Tonal Layering으로 부각. 부모보다 밝은 배경(`#ffffff`)이 "떠있는" 느낌을 만든다.

```tsx
// 기본 카드 (부모 배경이 #eaeff1 이상이어야 효과 발생)
<div className="bg-white rounded-xl p-4
                hover:bg-[#f1f4f6] transition-colors cursor-pointer">
  <h3 className="text-[#2b3437] font-semibold text-sm mb-[0.7rem]">제목</h3>
  <p className="text-[#586064] text-sm leading-relaxed">내용</p>
</div>

// 선택된 상태 (사이드바 항목)
<div className={`rounded-xl p-4 transition-colors cursor-pointer ${
  isSelected
    ? 'bg-[#dbe4e7]'
    : 'bg-white hover:bg-[#f1f4f6]'
}`}>
  {children}
</div>
```

**규칙:** `shadow-md` 이상 금지 / 리스트 구분선 금지 → `gap-[1.4rem]` 사용

---

## Input

Ghost Border로 존재감을 최소화, focus 시에만 액센트 테두리 노출.

```tsx
// 단일 필드
<div className="flex flex-col gap-[0.35rem]">
  <label className="text-[0.75rem] font-medium uppercase tracking-[0.05em] text-[#586064]">
    제목
  </label>
  <input
    type="text"
    placeholder="내용을 입력하세요"
    className="bg-white border border-[rgba(171,179,183,0.15)] rounded-[0.375rem]
               px-3 py-2 text-[#2b3437] text-sm outline-none
               placeholder:text-[#586064]/50
               focus:border-[#0053dc] transition-colors"
  />
</div>

// Textarea
<textarea
  rows={6}
  className="w-full bg-white border border-[rgba(171,179,183,0.15)] rounded-[0.375rem]
             px-3 py-2 text-[#2b3437] text-sm leading-[1.7] outline-none resize-none
             placeholder:text-[#586064]/50
             focus:border-[#0053dc] transition-colors"
/>
```

**규칙:** Label은 항상 input 위에 / `resize-none` / 에러 상태 시 테두리 색상만 변경

---

## Modal

Glassmorphism 적용. 배경 흐림 + surface 80% opacity로 "유리" 질감.

```tsx
// Overlay
<div className="fixed inset-0 bg-[#2b3437]/20 backdrop-blur-[2px] z-40"
     onClick={onClose} />

// Modal Panel
<div className="fixed inset-0 flex items-center justify-center z-50 p-4">
  <div className="bg-[rgba(248,249,250,0.9)] backdrop-blur-[12px]
                  rounded-2xl p-8 w-full max-w-lg
                  shadow-[0_8px_40px_rgba(43,52,55,0.08)]">
    {/* 헤더 */}
    <p className="text-[0.75rem] font-medium uppercase tracking-[0.05em] text-[#586064] mb-6">
      섹션 레이블
    </p>
    {/* 콘텐츠 */}
    {children}
    {/* 액션 */}
    <div className="flex gap-3 mt-6 pt-4 border-t border-[rgba(171,179,183,0.15)]">
      <button className="bg-gradient-to-r from-[#0053dc] to-[#3e76fe] text-[#faf8ff]
                         px-5 py-2 rounded-[0.375rem] font-medium hover:opacity-75 transition-opacity">
        확인
      </button>
      <button className="bg-[#e2e9ec] text-[#2b3437] px-5 py-2 rounded-[0.375rem]
                         font-medium hover:bg-[#dbe4e7] transition-colors"
              onClick={onClose}>
        취소
      </button>
    </div>
  </div>
</div>
```

**규칙:** Modal 내부 구분선은 Ghost Border만 허용 / 배경 overlay 클릭으로 닫기 지원

---

## Knowledge Token (Chip)

주제 태그. 단일 스타일만 존재 — 색상 변형 없음.

```tsx
// 기본 (정적)
<span className="bg-[#dbe4e7] text-[#586064]
                 text-[0.75rem] font-medium uppercase tracking-[0.05em]
                 rounded-full px-3 py-1">
  javascript
</span>

// 클릭 가능
<button className="bg-[#dbe4e7] text-[#586064]
                   text-[0.75rem] font-medium uppercase tracking-[0.05em]
                   rounded-full px-3 py-1
                   hover:bg-[#e2e9ec] transition-colors cursor-pointer">
  design
</button>
```

**규칙:** 테두리 없음 / 색상 변형 없음 / 배지류도 동일 스타일 적용
