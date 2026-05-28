# Do / Don't

디자인 시스템 준수 여부를 검증할 때 이 파일을 기준으로 한다.

## ✅ Do

1. 영역 구분은 **배경색 전환**으로 (sidebar: `surface-container-low` / main: `surface`)
2. 액센트(`--tertiary`)는 의도적 액션(CTA, focus, link)에만 — sparingly
3. `surface-container-highest`를 사이드바 **선택 상태**에 사용
4. 여백이 애매하면 항상 **늘리는** 방향으로 결정
5. 메타데이터/태그는 `label-md` + `uppercase` + `letter-spacing: +0.05em`
6. Input focus 상태는 `1px solid --tertiary` 테두리로 표현
7. 카드 hover는 배경을 `surface` → `surface-container-low`로 전환

## ❌ Don't

1. `1px solid border`로 사이드바/카드 경계 구분 **금지** → 색상 전환으로 대체
2. 일반 카드에 `box-shadow` **금지** → Tonal Layering으로 대체
3. 리스트 항목 사이 `<hr>` 또는 `border-b` **금지** → `gap: 1.4rem`으로 대체
4. 텍스트에 `#000000` **금지** → `--on-surface` (#2b3437) 사용
5. 기능적 명확성 없는 아이콘 **금지** — 타이포그래피 중심
6. 사이드바 ↔ 메인 경계에 테두리 **금지** → `surface-container-low` vs `surface` 차이로만

## 검증 패턴 (자동화 참고)

위반 가능성이 높은 코드 패턴:

```
border-b          → divider 금지 위반 가능성
border-gray       → 실선 테두리 금지 위반 가능성
shadow-md / shadow-lg  → 일반 카드 shadow 금지 위반 가능성
text-black / #000 → 순수 검정 금지 위반 가능성
border-solid      → 실선 테두리 금지 위반 가능성
```
