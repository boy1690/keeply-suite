---
title: "PPT 이전 버전 복구의 한계: 자동 저장이 끝나는 그 너머"
description: "Word AutoRecover, OneDrive 버전 기록, Time Machine 은 모두 저장 계층 구조 도구입니다. retention 은 짧습니다 — 파일을 닫으면 사라지거나 약 500 개 버전이 상한. 3 개월 전에 보낸 그 버전을 되찾으려면 툴 계층이 필요합니다."
date: 2026-05-02T15:00:00+08:00
draft: false
slug: "client-asked-which-version"
primary_keyword: "ppt 이전 버전 복구"
locale: ko
categories: ["파일 버전 관리"]
tags: ["버전 기록", "AutoRecover", "OneDrive", "delivery-note", "operator-error"]
image: cover.svg
og_image: cover.png
locales_required: [en, zh-TW, zh-CN, ja, ko]
market_strategy: hybrid
ranking_locales: [en, ko]
cta_topic: versioning
---

# PPT 이전 버전 복구의 한계: 자동 저장이 끝나는 그 너머

> 소프트웨어의 내장 버전 기록은 저장 계층 구조이고, 3 개월 전에 보낸 그 버전을 되찾으려면 툴 계층이 필요하다.

토요일 밤 11:23, 클라이언트가 메시지를 보낸다. "3 월에 보내주신 제안서, 그 버전 다시 보내주실 수 있을까요?"

OneDrive 버전 기록을 연다 — 지난주 분만 남아 있다. Word AutoRecover 는 파일을 닫을 때 지워졌다. 노트북에 `_v` 로 끝나는 파일이 7 개. 3 월의 그 납품과 일치하는 게 하나도 없다.

3 개월 전 ⌘+S 를 눌렀던 그 버전을, 도구는 기억하지 않았다.

## 핵심 정리

Microsoft Word 의 「**버전 기록**」, AutoRecover, OneDrive 버전 스냅샷은 모두 **저장 계층 구조 도구** 입니다. "타이핑 도중 크래시" 시나리오를 위한 설계로, retention 은 짧습니다: 파일을 닫으면 사라지는 것부터, 클라우드 버전 기록의 약 500 개까지. 이는 저장 사고 구조이지 납품 추적이 아닙니다. 3 개월 전 납품한 그 버전을 되찾으려면 툴 계층의 독립된 always-on 버전 기록과 납품 시점의 metadata 표식이 필요합니다.

## 목차

1. Word 내장 버전 기록이 할 수 있는 것은?
2. AutoRecover / OneDrive / Time Machine: 각각 얼마나 보관되나?
3. 왜 이 메커니즘들은 3 개월 후에 닿지 않을까?
4. 3 개월 전 납품한 버전을 되찾으려면 무엇이 필요한가?
5. 자주 묻는 질문

---

## Word 내장 버전 기록이 할 수 있는 것은?

Word 와 Office 생태계에는 3 가지 「**버전 복원**」 메커니즘이 있습니다:

- **AutoRecover**: 크래시 시 저장되지 않은 내용을 구조. 기본 10 분마다 자동 임시 저장. 파일이 정상 종료되면 지워짐.
- **자동 저장**（[OneDrive / SharePoint 온라인 Word](https://support.microsoft.com/en-us/office/restore-a-previous-version-of-a-file-stored-in-onedrive-159cad6d-d76e-4981-88ef-de6e96c93893)）: 입력 중 클라우드에 즉시 저장.
- **OneDrive 버전 기록**: 매 저장마다 스냅샷을 남겨 임의 시점으로 돌아갈 수 있음. Microsoft 의 [SharePoint 버전 관리 문서](https://support.microsoft.com/en-us/office/enable-and-configure-versioning-for-a-list-or-library-1555d642-23ee-446a-990a-bcab618c7a37) 에 따르면 기본 약 500 개 주 버전 보관.

이 3 가지의 설계 의도는 분명합니다: 「**타이핑 중 크래시**」 또는 「**방금 덮어썼다**」 같은 **단기 저장 사고** 용. 「**3 개월 후 클라이언트가 그 버전을 묻는다**」 시나리오의 설계 목표가 아닙니다.

## AutoRecover / OneDrive / Time Machine: 각각 얼마나 보관되나?

retention 숫자를 나란히 보면:

| 메커니즘 | 기본 retention | prune 조건 | 적합 시나리오 |
| --- | --- | --- | --- |
| Word AutoRecover | 파일 닫으면 즉시 삭제 | 파일 종료, Word 재시작 | 크래시 구조 |
| OneDrive 자동 저장 | 입력 중 저장 | — | 실시간 협업 |
| OneDrive 버전 기록 | 기본 약 [500 개 버전](https://support.microsoft.com/en-us/office/enable-and-configure-versioning-for-a-list-or-library-1555d642-23ee-446a-990a-bcab618c7a37) | 500 초과시 가장 오래된 것 prune | 단기 롤백 |
| Mac [Time Machine](https://support.apple.com/en-us/HT201250) | hourly 24h + daily 30 일 + weekly 디스크 가득 찰 때까지 | 디스크 가득 | 시스템 레벨 백업 |
| Windows 파일 기록 | 설정 조정 가능 | 설정 조정 가능 | 시스템 레벨 백업 |

그래요, 모든 메커니즘에는 상한이 있어요. 파일 닫을 때 삭제부터 500 개 버전까지, 3 개월의 선을 못 넘습니다.

## 왜 이 메커니즘들은 3 개월 후에 닿지 않을까?

여기서 아무도 분명히 말하지 않은 차이가 있습니다: **저장 계층** vs **툴 계층**.

소프트웨어의 내장 버전 기록은 **저장 계층** 에 살고 있습니다. 그 존재 이유는 「가장 최근 쓰기 실패 시 롤백」 — 그래서 retention 이 짧아요. 파일 닫을 때 삭제부터 500 개 버전까지, 설계 참조점은 「평균 사용자가 한 달 안에 돌아보는 횟수」 입니다. 3 개월 이상은 설계 목표에 없고, prune 되는 게 합리적입니다.

A 씨는 컨설턴트입니다. 토요일 11:23, 클라이언트가 3 월 보고서를 요청합니다. OneDrive 버전 기록을 열어보니 가장 오래된 게 4 월 28 일. AutoRecover 는 진작 꺼두었다. 노트북에 `_v` 로 시작하는 .docx 가 8 개. 어떤 파일도 3 월 그 주의 납품 날짜와 일치하지 않는다.

여기서 가장 힘든 점은 A 씨가 나중에 깨닫는 거예요. 3 월 그 납품은 당일 export 한 PDF 를 첨부한 것이었고, 원본 .docx 는 몇 주 전에 덮어쓰기로 사라졌어요. **그가 보낸 PDF 는 클라이언트 메일함에 있지만, 그 PDF 에서 .docx 그 버전으로 돌아가서 이어서 작업할 수는 없어요.**

## 3 개월 전 납품한 버전을 되찾으려면 무엇이 필요한가?

두 계층이 필요합니다:

- **always-on 버전 기록**: 매 저장이 남고, prune 되지 않음. Word 나 OneDrive 의 retention policy 에 의존하지 않음.
- **납품 메모 metadata**: export 할 때 「누가, 언제, 어느 버전에 해당하는지」 의 metadata 를 자동으로 임베드. 3 개월 후 도구에 다시 드롭하면 전체 origin 이 보임.

[Keeply](https://keeply.work) 는 이 두 계층을 제공합니다.

B 씨는 Keeply 를 반년 동안 사용했습니다. 월요일 아침, 클라이언트가 4 월의 디자인을 다시 보내달라고 메시지. 클라이언트 email 에서 첨부 .pdf 를 찾아 Keeply 에 드롭. Keeply 가 「이것은 2026-04-12 의 v3 발표 자료입니다」 라고 띄움 — 원본 .docx commit hash 와 용도 분류 「업주 승인본」 포함. 「이 버전으로 돌아가기」 클릭하면 3 초 후 Word 가 4/12 의 그 버전을 열어줍니다.

다만 Keeply 는 AutoRecover 를 대체하지 않습니다 — 타이핑 중 크래시는 AutoRecover 가 여전히 1 차 방어선. Keeply 는 소급도 안 됩니다: 납품 시점에 Keeply 가 사용 중이어야 metadata 가 임베드됩니다. Keeply 도입 전의 납품은 본 글이 구해줄 수 없습니다. 도입 후의 납품은 모두 구해줄 수 있습니다.

그래요, 한숨 돌릴 수 있는 부분입니다.

## 자주 묻는 질문

**Q1: Word AutoRecover 를 끌 수 있나요?**

끌 수 있지만 기본은 켜져 있습니다. 경로: 「파일 → 옵션 → 저장 → 자동 복구 정보를 10 분마다 저장」. 다만 AutoRecover 는 파일이 정상 종료되면 지워집니다. 장기 보존이 아닙니다.

**Q2: OneDrive 개인용과 비즈니스의 버전 보관 수가 같은가요?**

같지 않습니다. OneDrive 개인은 기본 약 500 개. OneDrive for Business（Microsoft 365）도 기본 500 개지만 관리자가 조정 가능. 상한 도달 시 가장 오래된 것 prune.

**Q3: Time Machine 은 백업인가요, 버전 관리인가요?**

Time Machine 은 시스템 레벨 백업입니다. 디스크 전체 스냅샷을 보존하지, 「proposal.docx 의 매 저장 버전」 단위로 추적하지 않습니다. Time Machine 에서 특정 단일 파일 버전을 구할 수는 있지만 번거롭습니다.

**Q4: Google Docs 수정 기록은 얼마나 보관되나요?**

Google 은 명확한 retention 숫자를 공개하지 않습니다. [공식 문서](https://support.google.com/docs/answer/190843) 에 「오래된 수정 버전은 공간 절약을 위해 병합될 수 있다」 고 명시. 실무 경험: 3 개월 이상 수정 버전은 자동 병합 또는 prune 되는 경우가 많음.

**Q5: Keeply 의 계층은 Git 과 같나요?**

Keeply 는 Git 엔진을 사용하지만 UI 에 Git 용어는 노출하지 않습니다. 보이는 단어는 「버전 저장 / 작업 사본 / 프로젝트 위치로 동기화」 입니다. Git 의 commit / branch / push 는 UI 에 나오지 않습니다. 비개발자에게는 사무실 언어의 버전 관리입니다.

---

11:23 의 그 메시지, 다음에 언제 올지 모릅니다.

하지만 한 가지는 압니다: 5 분 전의 버전과 3 개월 전의 버전을, 도구가 같은 것으로 다루게 해서는 안 됩니다.

오늘부터의 납품 하나하나를, 도구가 그 한 부를 기억해주게 할 수 있을까요?
