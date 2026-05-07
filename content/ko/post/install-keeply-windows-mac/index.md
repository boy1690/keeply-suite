---
title: "Windows와 macOS에 Keeply 10분 만에 설치하기"
description: "「실행 안 함」 안내 문구와 추측은 그만. 10분 만에 Keeply를 설치하고 당일에 첫 프로젝트를 보호하세요."
date: 2026-04-26
draft: false
tags: [Keeply 튜토리얼]
categories: [튜토리얼]
primary_keyword: "Keeply 설치"
locales: ["en", "zh-TW", "zh-CN", "ja", "ko"]
slug: install-keeply-windows-mac
image: cover.svg
og_image: cover.png
cta_topic: install
---

> "더블클릭했더니 파란 화면이 떠서, 바이러스인 줄 알고 그냥 닫아버렸어요."
>
> — Keeply 얘기를 막 들었던 디자이너, 그날 오후의 답변.

이 분이 처음이 아니에요. Windows의 파란 화면은 설치를 끝내는 사람보다 더 많은 사람을 막아 세워요.

처음부터 끝까지 전부 짚어볼게요: **파란 화면이 왜 뜨는지 → 더 깔끔한 3가지 설치 경로 → 설치 직후 첫 프로젝트 열기**.

## 글 목차

1. [파란 화면이 왜 뜨는지 (Keeply 문제가 아니에요)](#why-smartscreen)
2. [3가지 경로 — 자기에게 맞는 걸 고르세요](#three-paths)
3. [Windows 경로 1: winget 명령어 한 줄 (추천)](#path-winget)
4. [Windows 경로 2: .exe 파일 다운로드](#path-exe)
5. [macOS 설치: 우클릭 단계는 건너뛸 수 없어요](#path-macos)
6. [설치 후: 첫 프로젝트를 넣어보세요](#first-project)
7. [막혔나요? 자주 보는 5가지 오류](#troubleshoot)

## 파란 화면이 왜 뜨는지 (Keeply 문제가 아니에요) {#why-smartscreen}

그 화면의 이름은 [SmartScreen](https://learn.microsoft.com/en-us/windows/security/operating-system-security/virus-and-threat-protection/microsoft-defender-smartscreen/)이에요. 이건 「이 소프트웨어가 악성인가?」를 판단하지 않아요. 「충분한 사람들이 이미 사용했나?」를 판단해요.

이렇게 생각해 보세요. Google 리뷰가 하나도 없는 새 식당이라고 음식이 나쁜 건 아니에요. 그냥 아직 아무도 평가하지 않은 음식일 뿐이죠.

SmartScreen은 새 소프트웨어를 똑같이 다뤄요. **다운로드 수 + 시간**으로 신뢰를 쌓고, 새 버전이 나올 때마다 이 관찰 기간을 다시 거쳐요. Keeply도 업데이트를 배포할 때마다 이걸 매번 마주쳐요. 소프트웨어 자체의 안전성과는 아무 상관이 없어요.

그런데 왜 사람들을 겁먹게 만들까요? 화면이 큼지막한 「실행 안 함」 버튼만 보여주거든요. 그래도 실행하려면, 옆에 있는 작은 **추가 정보**라는 링크를 클릭해야 해요. 시각적으로 안내문이 아니라 — 벽처럼 보여요.

하지만 이걸 마주칠 필요가 없어요. **Keeply는 [Microsoft의 winget 패키지 저장소](https://github.com/microsoft/winget-pkgs)에 등록되어 있어요**. 이 경로는 경고를 아예 띄우지 않아요.

그러니까 핵심은 경고를 우회하는 방법이 아니에요. 경고가 처음부터 나타나지 않는 경로를 고르는 거예요.

![Windows SmartScreen 경고 화면, 작은 「추가 정보」 링크에 동그라미 표시](fig-smartscreen-warning.svg)

## 3가지 경로 — 자기에게 맞는 걸 고르세요 {#three-paths}

| 경로 | 이런 분께 | 시간 | 파란 화면? |
| --- | --- | --- | --- |
| **A. winget 명령어** (Windows) | PowerShell에 한 줄 붙여넣는 거 괜찮은 분 | 2분 | 안 떠요 |
| **B. 공식 .exe 다운로드** (Windows) | 검은 터미널 창은 열고 싶지 않은 분 | 5분 | 떠요 — 같이 통과해 드릴게요 |
| **C. 공식 .dmg 다운로드** (macOS) | Mac 사용자 | 3분 | 안 떠요. 우클릭은 필요해요 |

골랐나요? 해당 섹션으로 바로 점프하세요. 나머지는 건너뛰셔도 돼요.

## Windows 경로 1 — winget 명령어 한 줄 (추천) {#path-winget}

**winget**은 Windows에 기본 내장된 「패키지 관리자」예요. 쉽게 말해 명령줄용 Microsoft Store 같은 거예요. Windows 10 1809 버전부터 들어 있어요. 추가로 설치할 게 없어요.

PowerShell을 열고 (시작 메뉴에서 「PowerShell」 검색), 이 줄을 붙여넣고 Enter:

```powershell
winget install Boy1690.Keeply
```

![PowerShell에서 winget 실행 — 다운로드와 설치가 약 30초 안에 끝나요](fig-powershell-winget.svg)

약 30초면 끝나요. 파란 화면 없이. 「추가 정보」 안내 문구 없이.

이 경로가 왜 이렇게 깔끔할까요? winget에 등록되려면 Keeply가 [Microsoft의 GitHub 공식 심사](https://github.com/microsoft/winget-pkgs)를 통과해야 하기 때문이에요. 설치 파일 출처, 파일 서명, 설치 동작을 모두 확인해요. 전부 통과해야 비로소 배포돼요.

다르게 말하면, 그 명령어를 실행할 때 Microsoft가 이미 한 차례 검증을 끝내놓은 거예요. 이 경로에서는 SmartScreen 검사가 중복이 되니까, 그냥 나타나지 않아요.

짧은 경로와 신뢰의 경로, 한 줄로 끝.

## Windows 경로 2 — .exe 파일 다운로드 {#path-exe}

PowerShell은 만지기 싫다고요? 괜찮아요. keeply.work에 가서 다운로드 클릭, `.exe` 받고, 더블클릭하세요.

SmartScreen 파란 화면이 뜰 거예요. **정상이에요** ([이유는 위 참조](#why-smartscreen)). 진행하려면:

1. **추가 정보** 클릭 (경고창의 작은 밑줄 텍스트)
2. **계속 실행** 버튼이 나타나요
3. 클릭. 그 다음부터는 설치 마법사가 알아서 해요.

![「추가 정보」를 클릭하면 「실행 안 함」 옆에 「계속 실행」 버튼이 나타나요](fig-smartscreen-run-anyway.svg)

이 우회 전체가 추가로 3분쯤 걸려요. 대부분이 클릭이 아니라 심리적 시간이에요. 여기서부터는 경로 1과 똑같아요.

## macOS 설치 — 우클릭 단계는 건너뛸 수 없어요 {#path-macos}

Mac에는 파란 화면이 없어요. 하지만 처음 실행할 때 더블클릭이 안 돼요 — [macOS Gatekeeper](https://support.apple.com/en-us/102445)가 막거든요.

올바른 순서:

1. `.dmg` 다운로드, Keeply를 응용 프로그램 폴더로 드래그
2. 응용 프로그램을 열고, Keeply 찾기
3. **우클릭 → 열기** (더블클릭 말고)

   ![macOS Finder 우클릭 메뉴, 맨 위의 「열기」가 강조됨](fig-macos-rightclick.svg)

4. 대화 상자가 나타나면 — 「열기」 클릭

   ![macOS 확인 대화 상자, 「열기」 버튼이 강조됨](fig-gatekeeper-dialog.svg)

끝이에요. **첫 실행 때만 이렇게 해야 해요** — 그 다음부터는 더블클릭으로 평소처럼 열려요.

왜 첫 실행 때만 이런 우회가 필요할까요? Gatekeeper는 공증이 확인되지 않은 앱은 더블클릭 실행을 차단해요. 우클릭 → 열기는 「내가 뭘 설치하는지 알고 있어요, 통과시켜 주세요」라고 Apple에게 말하는 방식이에요.

이건 Keeply만의 문제가 아니에요. 처음 보는 새 Mac 앱은 모두 첫 실행에서 똑같이 동작해요.

## 설치 후 — 첫 프로젝트를 넣어보세요 {#first-project}

설치를 마쳤다고 끝난 게 아니에요. 그날 안에 첫 프로젝트가 보호되는 것 — 그게 끝난 거예요.

Keeply를 열고, **새 프로젝트** 버튼을 누르고, 지금 작업 중인 폴더를 고르세요.

<!-- TODO: 替換為真實截圖 keeply-add-project.png（Keeply「新增專案」對話框） -->

**제일 먼저 뭘 넣어야 할까요**: 지금 손에 들고 있는 것 중에서, 잃어버리면 안 되고 계속 편집 중인 것. 제안서, 계약서, 디자인 파일, 발표 자료 — 뭐든 좋아요. 6개월 동안 안 건드린 폴더는 고르지 마세요. 그 폴더의 가치는 보관에 있지, 보호에 있지 않아요. 다른 얘기예요.

첫 스캔은 1~2분 걸려요. 그 후로 Keeply는 백그라운드에서 폴더를 지켜보면서 **저장할 때마다 자동으로 버전을 기록해요**. 「체크포인트」 버튼을 누를 필요가 없어요.

가상이지만 흔한 예: 디자이너가 설치 직후 2분기 제안서 폴더를 넣었어요. 첫 스캔 2분. 사흘 뒤, 지난 토요일에 로고 색을 잘못 바꾼 걸 깨달아요 — 이력에서 이전 버전 가져오는 데 20초.

설치 당일에 첫 프로젝트를 사용한 사람은, 일주일 미루는 사람보다 훨씬 오래 남아 있어요.

## 막혔나요? 자주 보는 5가지 오류 {#troubleshoot}

| 증상 | 해결 |
| --- | --- |
| `winget` 명령어가 없다고 나옴 | Windows에 App Installer가 아직 없다는 뜻. 경로 2 (.exe 다운로드)로 가세요 — 억지로 싸우지 마세요 |
| Win 11에서 「관리자 권한 필요」라고 나옴 | PowerShell을 **관리자 권한으로 실행**으로 다시 열기 |
| Mac에서 「확인되지 않은 개발자라 열 수 없습니다」 | 우클릭 → 열기 (더블클릭 말고). 위 macOS 섹션 참조 |
| 회사 네트워크가 다운로드를 막음 | winget 명령어를 쓰세요 — Microsoft CDN을 통해서 보통 통과해요 |
| 설치는 됐는데 안 열림 | 한 번 재시작. 그래도 안 되면 [support@keeply.work](mailto:support@keeply.work)로 메일 |

## 한 가지만 기억한다면

이거 하나:

**파란 화면은 평결이 아니에요. 아직 쌓이는 중인 평판이에요.**

경고를 우회할 필요가 없어요. winget 경로로 가면 — 경고가 처음부터 나오지 않아요.
