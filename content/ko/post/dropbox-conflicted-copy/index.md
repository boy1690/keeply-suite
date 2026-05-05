---
title: "드롭박스 충돌된 사본이 계속 생기는 이유 (4 가지 sync 설계로 근본 해결)"
description: "충돌된 사본은 버그가 아닙니다. Dropbox 가 last-writer-wins 로 충돌 감지층 없이 설계한 결과입니다."
date: 2026-05-05T05:55:00+08:00
draft: false
slug: dropbox-conflicted-copy
primary_keyword: "드롭박스 충돌된 사본"
locales: [zh-TW, en, zh-CN, ja, ko, it]
categories:
  - 파일 관리
tags:
  - 버전 관리
  - Dropbox
  - 클라우드 동기화
  - 충돌 해결
image: cover.svg
og_image: cover.png
role: cluster
pillar_parent: file-version-management-complete-guide
---

목요일 밤 10:30, 동료 Anna 와 공유 Dropbox 에서 같은 제안서를 편집 중. 그녀는 3 단락을 추가했습니다. 당신은 동시에 마지막 CTA 를 추가. 둘 다 Cmd+S. 다음 날 폴더를 열면 한 파일이 더 있습니다: `제안서 (Anna 의 충돌된 사본 2026-05-02).docx`. 그녀의 수정은 당신 쪽에 없고, 당신의 수정은 그녀 쪽에 없습니다. 1 시간 동안 손으로 합치고, 30 분 동안 빠진 게 없는지 확인.

이건 버그가 아닙니다. Dropbox 가 충돌 감지층이 없는 결과입니다. 먼저 충돌된 사본이 생기는 진짜 mechanism 을 보고, 그 다음 3 가지 sync 설계로 어떻게 근본 해결하는지 보여드릴게요.

## 목차

- [충돌된 사본이 나타나는 시점](#when-it-happens)
- [Dropbox 가 이렇게 설계한 이유](#why-dropbox-design)
- [두 파일을 수동으로 합치는 건 증상 치료](#why-manual-merge-fails)
- [3 가지 sync 설계로 근본 해결](#three-designs)
- [Keeply 가 맞지 않는 경우](#boundaries)

## 충돌된 사본이 나타나는 시점 {#when-it-happens}

「충돌된 사본이 계속 생긴다」를 풀어보면, 4 가지 완전히 다른 시나리오가 각각 트리거합니다:

| # | 시나리오 | mechanism |
|---|---|---|
| 1 | **두 명 동시 편집** | 양쪽 다 Cmd+S 업로드, Dropbox 는 앞에서 변경됐는지 모름 |
| 2 | **오프라인 편집 후 온라인** | 기차에서 편집, Wi-Fi 에서 sync 시 클라우드 버전과 안 맞음 |
| 3 | **여러 디바이스 전환** | 노트북 중간까지→폰 계속→노트북이 나중에 sync 충돌 |
| 4 | **크로스 OS sync 지연** | Mac vs Windows 시계 몇 초 차이, Dropbox 가 collision 판정 |

말 안 하면 모르는 사실: 4 가지 중 하나만 밟아도 충돌된 사본이 생깁니다. **당신의 평소 업무 방식은 최소 2 개는 밟습니다.**

## Dropbox 가 이렇게 설계한 이유 {#why-dropbox-design}

Dropbox 는 **last-writer-wins + 옛 버전을 따로 저장** 으로 설계: 두 명 동시 편집, 나중 업로드가 이김, 앞 버전은 `(충돌된 사본)` 으로 보존.

충돌 감지가 기술적으로 어려운 게 아닙니다. 상업 trade-off 입니다:

- **실시간 경험 우선**: sync 가 작업을 막을 수 없음. 매번 「병합 방식 선택」이 뜨면 Dropbox 가 불편해짐.
- **충돌 해결을 사용자에게 떠넘김**: 다른 버전 별도 저장 = 「다 보관해드릴게요, 직접 결정하세요」
- **설계자의 선택**: 아무도 잃지 않지만, 당신이 일을 함.

맞아요, 이게 짜증나는 부분입니다. Dropbox 는 도구가 해야 할 일 (충돌 감지층) 을 사용자 규율에 떠넘깁니다. 그리고 규율은 자동화를 절대 이기지 못합니다.

## 두 파일을 수동으로 합치는 건 증상 치료 {#why-manual-merge-fails}

Dropbox Help Center 가 가르치는 fix: 「두 파일 열기, 차이 비교, 수동으로 메인에 병합, 충돌된 사본 삭제.」 들어보면 합리적.

하지만 이 fix 는 **mechanism 을 바꾸지 않습니다**. 다음 주에 또 sync collision, 새로운 충돌된 사본 생성, 또 수동 병합. 한 달 후 4-5 번 했습니다.

병합을 못해서가 아닙니다. **충돌을 막지 않도록 설계된 도구** 를 쓰고 있습니다. 해법은 sync mechanism 을 바꾸는 것이지, 자기를 더 빨리 병합하도록 훈련하는 게 아닙니다.

Google 상위 3 위 (Dropbox Help / EaseUS / Wondershare) 와 비교: 모두 증상 치료 가이드. mechanism 각도에서 자르는 사람 없음. 이 글이 자릅니다.

## 3 가지 sync 설계로 근본 해결 {#three-designs}

sync 설계가 할 수 있는 일을 3 가지 패턴으로 나눕니다. 각각 다른 collision 시나리오 해결:

### Design A: Detect-and-prompt sync (Git 식 merge)

양쪽이 같은 파일 편집, sync 시 collision 감지, UI prompt 가 사용자에게 선택 요청: A 유지, B 유지, 둘 다 병합. **예**: Git (CLI 권), **Keeply** spec M3-100 conflict-detection (오피스 언어로 wrap, 「merge conflict」jargon 없음). **시나리오 #1 + #2 해결.**

### Design B: File locking (atomic check-out)

파일을 열면 도구가 자동 lock. 동료가 열면 「Anna 가 편집 중」 표시, 변경 불가. **예**: SharePoint, Adobe Creative Cloud Files, Bentley ProjectWise. **시나리오 #1 + #3 + #4 전부 해결**, trade-off: 동료가 기다려야 함.

### Design C: Local Clone + manual sync (Keeply 모델)

Working copy 는 당신 머신에, sync 는 능동적 push (실시간 미러가 아님). collision 은 push 시 감지, UI prompt 가 사용자에게 선택 요청. **예**: **Keeply** 의 Local Clone Pattern (spec M3-098) + SMB safety layer (M3-095) + conflict-detection (M3-100). **시나리오 #1-#4 전부 해결**, trade-off: Dropbox 만큼 즉시는 아님.

이때 알게 됩니다, 시나리오 #4 (크로스 OS sync 지연) 가 가장 어렵습니다, 순수 시계 문제니까. Design A 와 C 는 detect 가능하지만, 해결은 여전히 사용자 개입 필요.

## Keeply 가 맞지 않는 경우 {#boundaries}

Keeply 가 모든 Dropbox 시나리오를 해결하진 않습니다:

- **대용량 파일 실시간 동기화**: Premiere project 편집하며 sync, Keeply 의 Local Clone 모델은 부적합 (push 몇 분).
- **모바일 디바이스 접근**: Keeply 는 desktop-first, Dropbox app 이 폰에서 훨씬 부드러움.
- **외부 공유 링크**: Dropbox 의 「Share link」는 Keeply 에 대응 기능 없음.
- **협업 빈도 매우 높음** (1 시간 내 multiple edits): Keeply UX 가 Dropbox 보다 느림, 그 경우엔 Google Docs co-edit 사용 권장.

## 다음에 `(충돌된 사본)` 을 보기 전에

다음에 폴더에 `(충돌된 사본)` filename 이 더 생겨도, 더 이상 1 시간 수동 병합에 쓰지 않습니다. 그게 mechanism 문제임을 알고, 다른 선택지가 있다는 걸 아니까요.

Keeply 가 sync 충돌을 어떻게 해결하는지 보고 싶나요? [「파일 버전 관리 완전 가이드」 계속 읽기.](/ko/post/file-version-management-complete-guide/)

---

> 저자 소개: Ting-Wei Tsao, Keeply 창업자.
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
