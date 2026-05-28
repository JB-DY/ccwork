# Design System — The Digital Atelier

> **Soft Minimalism** 철학. 콘텐츠가 UI보다 앞선다. UI는 조용하게, 정보는 선명하게.

---

## 빠른 참조

| 작업 | 읽을 파일 |
|------|-----------|
| 색상 팔레트 / 의미별 매핑 | [`colors.md`](./colors.md) |
| 색상 CSS 변수명 | [`tokens.md`](./tokens.md) |
| 폰트 / 타입 스케일 | [`typography.md`](./typography.md) |
| 여백 / 그리드 | [`spacing.md`](./spacing.md) |
| 컴포넌트 패턴 전체 | [`components.md`](./components.md) |
| 버튼 상세 | [`components/buttons.md`](./components/buttons.md) |
| 카드/리스트 상세 | [`components/cards.md`](./components/cards.md) |
| Input 상세 | [`components/inputs.md`](./components/inputs.md) |
| 태그/칩 상세 | [`components/chips.md`](./components/chips.md) |
| depth/shadow 규칙 | [`guidelines/elevation.md`](./guidelines/elevation.md) |
| 위반 여부 검증 | [`guidelines/do-dont.md`](./guidelines/do-dont.md) |

---

## 핵심 원칙 3가지

1. **No-Line Rule** — 실선 테두리로 영역을 나누지 않는다. 배경색 전환으로 대체.
2. **Tonal Layering** — 그림자 대신 surface 계층 차이로 depth 표현.
3. **Accent Sparingly** — `--tertiary`(#0053dc)는 CTA, focus, link에만.

---

## 주요 토큰 요약

```
배경 캔버스        #f8f9fa   --surface
사이드바 배경      #f1f4f6   --surface-container-low
카드 배경          #ffffff   --surface-container-lowest
기본 텍스트        #2b3437   --on-surface
보조 텍스트        #586064   --on-surface-variant
액센트             #0053dc   --tertiary
```
