# Elevation & Depth

그림자가 아닌 **배경색 전환**으로 depth를 표현한다.

## Tonal Layering (기본)

```
surface-container (#eaeff1)           ← 섹션 배경
  └── surface-container-lowest (#fff) ← 카드 → "종이 위에 놓인" 느낌
```

일반 카드에 `box-shadow` 적용 금지. 색상 차이만으로 충분하다.

## Glassmorphism (플로팅 전용)

모달, 드롭다운, 호버 브레드크럼에만 적용.

```css
background: rgba(248, 249, 250, 0.8); /* --surface 80% */
backdrop-filter: blur(12px);
```

## Ambient Shadow (floating 필수 요소)

팝오버처럼 반드시 떠야 하는 요소에만.

```css
box-shadow: 0 8px 40px rgba(43, 52, 55, 0.06); /* --on-surface 6% */
```

- blur: 24–40px
- 그림자에 액센트 색상 tint 추가 시 팔레트 통일감 향상
- 기본 카드/리스트에는 절대 적용하지 않는다
