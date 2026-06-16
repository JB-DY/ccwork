---
name: ac-verifier
description: 이슈의 Acceptance Criteria 충족 여부를 독립 검증한다. 테스트 통과 여부가 아닌 AC의 의도가 코드에 반영되었는지 판단한다. `/ac-verifier <이슈번호>` 호출이나 "AC 검증", "이슈 N 검증", "AC 충족 확인" 같은 요청에 사용한다.
---

# AC Verifier Command

`ac-verifier` 서브에이전트를 띄워 이슈의 Acceptance Criteria 충족 여부를 독립 검증한다.

## 입력

`$ARGUMENTS` — 검증할 이슈 번호 (예: `1`)

## 동작

`Agent` 도구로 `subagent_type: "ac-verifier"` 를 호출하여 다음을 위임한다:

- 검증 대상 이슈 번호: `$ARGUMENTS`
- 작업 디렉토리: 현재 프로젝트
- 참조할 파일:
  - GitHub 이슈 — `gh issue view $ARGUMENTS`
  - `docs/features/{feature}/issue-{N}.md` — 시그니처 / 시나리오 / 체크박스
  - `src/` — 구현 코드
  - `src/**/*.test.ts(x)` — 테스트 코드

## 산출물

ac-verifier 에이전트가 보고하는 형식:

- 각 AC별 `✅ 충족 / ⚠️ 부분 충족 / ❌ 미충족` 판정과 근거
- 갭이 있는 AC에 대한 추가 테스트 시나리오 제안

## 사전 확인

- `gh auth status` 로 GitHub 인증 상태 확인 — 미인증이면 즉시 보고하고 중단
- 이슈 번호에 대응하는 `docs/features/{feature}/issue-{N}.md` 가 존재하지 않으면 사용자에게 어떤 feature 폴더를 봐야 하는지 묻는다
