# Design Tokens

모든 색상 변수의 단일 출처(single source of truth). 스타일 작업 시 여기서 토큰명을 확인한다.

## CSS Variables

```css
/* Surface 계층 (depth 표현용) */
--surface-container-lowest: #ffffff;   /* 카드, 활성 작업 영역 */
--surface: #f8f9fa;                    /* 기본 캔버스 */
--background: #f8f9fa;                 /* surface와 동일 */
--surface-container-low: #f1f4f6;      /* 사이드바, 내비게이션 */
--surface-container: #eaeff1;          /* 섹션 구분 영역 */
--surface-container-high: #e2e9ec;     /* Secondary 버튼 배경 */
--surface-container-highest: #dbe4e7;  /* Chip, 선택된 사이드바 항목 */

/* 텍스트 */
--on-surface: #2b3437;         /* 기본/강조 텍스트 */
--on-surface-variant: #586064; /* 장문 본문, 보조 설명 */

/* 액센트 — sparingly 사용 */
--tertiary: #0053dc;           /* Ghost 버튼, Focus 테두리, 링크 */
--tertiary-container: #3e76fe; /* Primary 버튼 그라데이션 끝 */
--on-tertiary: #faf8ff;        /* Primary 버튼 위 텍스트 */

/* 테두리 */
--outline-variant: #abb3b7;    /* Ghost Border: 15% opacity로만 사용 */
```

## Surface 계층 시각화

```
깊이 낮음 (뒤)                          깊이 높음 (앞)
─────────────────────────────────────────────────────▶
surface-container  surface-container-low  surface  surface-container-lowest
   #eaeff1              #f1f4f6          #f8f9fa       #ffffff
  (섹션 배경)          (사이드바)        (캔버스)       (카드)
```

## Ghost Border

실선 테두리 금지 원칙의 유일한 예외 — 접근성이 필요한 경우에만.

```css
border: 1px solid rgba(171, 179, 183, 0.15);
```

선이 "보이는" 게 아니라 "존재가 느껴지는" 수준이어야 한다.
