---
title: "【2026 파일 관리】iCloud 와 Dropbox 를 비교하기 전에:4 개 클라우드가 공유하는 버전 기록의 절벽"
description: "iCloud、Dropbox、OneDrive、Google Drive 비교 글은 모두 용량・가격・공유 UX 만 측정하고 retention 은 측정하지 않는다. 구조적 빈틈:4 개 모두 버전 기록에 cap 을 둔다(시간제 또는 계수제). Apple 은 iCloud 정책조차 공개하지 않았다. 대가는 3 개월 뒤 나타난다——필요한 버전이 사라져 있다."
voice_version: v2-2026-05-12
date: 2026-05-12T08:00:00+08:00
draft: false
slug: "cloud-version-history-cliff"
retrofit_status: v1-legacy
primary_keyword: "아이클라우드 드롭박스 차이"
locale: ko
categories: [파일 관리]
tags: [클라우드 동기화, 버전 관리, 도구 비교]
image: cover.svg
og_image: cover.png
cta_topic: backup
role: cluster
pillar_parent: file-version-management-complete-guide
locales_required: [en, zh-TW, zh-CN, ja, ko, it]
image_alt_data: "iCloud Drive、Dropbox、OneDrive、Google Drive 4 개 클라우드의 버전 기록 retention 을 나란히 비교 — Apple 은 미공개、Dropbox 는 30/180/365 일、OneDrive 는 500 버전 계수、Google Drive 는 30 일 또는 100 버전 — 4 개 모두 공통 cap 이 있음을 드러낸다. 비교 글이 보여주지 않은 표"
faq_schema:
  - q: iCloud、Dropbox、OneDrive、Google Drive 4 개 모두 버전 기록이 있나요?
    a: 4 개 중 3 개만 범용 파일 버전 기록을 노출합니다. iCloud Drive 는 PSD / Word / PDF 등 Apple 네이티브 외 파일의 버전 기록을 노출하지 않습니다. Pages、Numbers、Keynote 만 내장 버전 브라우저가 있습니다. Dropbox、OneDrive、Google Drive 모두 버전을 보관하지만 cap 형태가 다릅니다.
  - q: Dropbox 는 파일 버전을 며칠 보관하나요?
    a: Basic、Plus、Family 플랜은 30 일. Professional、Essentials、Business、Standard 는 180 일. Business Plus、Advanced、Enterprise 는 365 일. 더 긴 보관 플랜으로 업그레이드해도 과거 버전에는 소급 적용되지 않습니다.
  - q: OneDrive 의 500 버전 한도와 Dropbox 의 30 일 윈도우의 차이는?
    a: OneDrive 는 버전 수로 cap——500 major version 보관, 초과 시 가장 오래된 것부터 삭제. Dropbox 는 시간으로 cap——30 일을 넘긴 버전은 버전 수에 관계없이 사라짐. 전자는 활발한 파일이 1 주일 안에 기록을 잃을 수 있다는 뜻, 후자는 정적인 파일이 30 일 시점에 단 5 버전만 있어도 사라진다는 뜻입니다.
  - q: iCloud Drive 가 PSD 나 Word 의 버전 기록을 보관하나요?
    a: 아닙니다. iCloud Drive 는 Apple 외 파일의 최신 버전만 동기화하고 과거 버전은 보관하지 않습니다. Apple 은 이러한 파일의 버전 기록 retention 정책을 공개한 적이 없습니다——공개할 정책이 없기 때문입니다. 「최근 삭제됨」 폴더(30 일)는 삭제 복구만 다루고, 같은 자리 편집의 버전 회귀는 다루지 않습니다.
  - q: Keeply 는 클라우드 스토리지의 대체품인가요?
    a: 아닙니다. Keeply 는 클라우드 동기화 위에 얹는 또 다른 계층입니다 — 매번 저장을 로컬에 보관하고 시간 cap 도 계수 cap 도 없습니다. 클라우드가 동기화와 오프사이트 사본을 담당하고 Keeply 가 버전 기록을 담당합니다. 도구를 바꾸는 게 아니라 한 계층을 올려 놓는 것입니다.
---

# 【2026 파일 관리】iCloud 와 Dropbox 를 비교하기 전에:4 개 클라우드가 공유하는 버전 기록의 절벽

> 용량과 가격은 잘못된 축. Retention 이야말로 모든 비교 글이 쓸모없어지는 지점.

금요일 오후 4:23, 클라이언트가 메일을 보냅니다:「두 달 전 제안의 v3 버전 보내주실 수 있나요? 가격 변경 전 그 버전이요.」

Dropbox 를 엽니다. 버전 기록은 30 일 전까지. 클라이언트가 원하는 버전은 60 일 깊이에 묻혀 있습니다.

사라졌습니다.

이건 어느 한 클라우드만의 문제가 아닙니다. 비교 글이 한 번도 알려주지 않은 4 개 클라우드 공통의 문제입니다.

## 비교 글이 보여주지 않는 그 버전 기록 표

용량, 공유, 월정액 — 모든 「iCloud vs Dropbox vs OneDrive vs Google Drive」 비교 글이 다루는 지점입니다. retention 규칙을 나란히 놓은 글은 없습니다. 여기에 모아 두었습니다:

| 클라우드 | 범용 파일 버전 기록 | Retention 모양 | 실제 상한 |
|---|---|---|---|
| **iCloud Drive** | ❌ Apple 외 파일은 노출 안 됨 | 「최근 삭제됨」 폴더만 | 삭제 복구 30 일;PSD / Word / PDF 에는 버전 기록 화면 없음 |
| **Dropbox** | ✅ 있음 | 시간제 | [30 일(Basic / Plus / Family)/ 180 일(Pro / Business)/ 365 일(Enterprise)](https://help.dropbox.com/files-folders/restore-delete/version-history-overview) |
| **OneDrive** | ✅ 있음 | 계수제 + 삭제 윈도우 | [500 주요 버전 보관](https://learn.microsoft.com/en-us/sharepoint/document-library-version-history-limits);휴지통 personal 30 일 / business 93 일 |
| **Google Drive**(네이티브 외 파일) | ✅ 있음 | 시간 + 계수(먼저 발동하는 쪽이 이김) | [30 일 OR 100 versions](https://support.google.com/drive/answer/2409045), 「Keep forever」를 누르지 않는 한 |

이 표를 10 초 응시해 보세요. 4 개의 모양이 근본적으로 다릅니다. apple-to-apple 비교를 하려 해도 할 수 없습니다.

## 3 가지 다른 「retention」 메커니즘, 1 개의 공통 사각지대

버전 기록을 노출하는 3 개 클라우드는 각각 완전히 다른 상한 을 사용합니다.

**시간제(Dropbox)** — 당신에게 주어지는 건 윈도우. 30 / 180 / 365 일. 윈도우 밖의 버전은 몇 개가 있든 사라집니다. 2 개월 전 한 번 만진 파일과 2 개월 전 50 번 만진 파일의 결말은 같습니다:둘 다 사라집니다.

**계수제(OneDrive)** — 당신에게 주어지는 건 슬롯 수. 500 주요 버전 보관. 500 을 넘으면 가장 오래된 버전이 삭제되고 새 버전이 자리를 차지합니다. 2 년에 걸쳐 500 버전이 쌓일 수도 있고, 1 주일 만에 500 번 편집해서 1 월에 봤던 버전이 2 월에는 이미 사라져 있을 수도 있습니다.

**하이브리드제(Google Drive)** — 먼저 발동하는 쪽이 이깁니다. 30 일 OR 100 versions. 조용히 편집되는 PSD 는 30 일 시점에 15 버전만 있어도 기록이 사라질 수 있고, 집중 편집되는 문서는 2 주일 안에 100 버전 상한에 도달할 수 있습니다. Google 은 「Keep forever」 per-version override 를 제공 — 다만 저장 당시에 누를 것을 기억해야 합니다.

**4 번째 iCloud Drive** — 완전히 다른 문제:**범용 파일에 버전 기록 화면이 없음**. Pages、Numbers、Keynote 에는 네이티브 버전 브라우저가 있습니다(Apple 이 macOS 문서 아키텍처에서 상속). Word、PSD、PDF, iCloud Drive 안의 그 외 모든 것:최신 버전만 동기화되고 과거 버전은 보관되지 않습니다. Apple 은 Apple 외 파일 타입에 대한 명확한 retention 정책을 공개한 적이 없습니다 — 공개할 정책이 없기 때문입니다.

4 개 공통의 사각지대:**모든 클라우드에 상한 이 있다. Cap 의 모양은 다르다. 비교 글은 어느 모양이 당신의 일에 맞는지 한 번도 알려주지 않았다.**

## 왜 비교 글은 retention 을 다루지 않을까?

Retention 은 스펙 표에 표시하기 어렵습니다.

용량은 숫자 하나:GB. 가격은 숫자 하나:월 $X. 공유 UX 는 스크린샷 한 장.

Retention 은 조건의 트리:플랜 등급、파일 타입、버전 수、경과 시간、「Keep forever」 같은 수동 override. 그래서 리뷰 사이트는 건너뜁니다 — 스펙 표 형식에 맞지 않기 때문입니다.

이게 구매자의 사각지대입니다:비교 글로 클라우드 retention 을 사는 건 트렁크 크기만으로 차를 사는 것과 같습니다. 트렁크는 사겠지만 맞는 차는 사지 못합니다.

당신이 진짜로 필요로 하는 그 버전은 비교표에 가격이 붙어 있지 않습니다. 당신이 진짜로 필요로 하는 그 버전은 선택을 끝낸 뒤 2 개월이 지나서야 등장합니다.

## 클라우드 기능 안에는 없는 그 버전 기록 계층

리프레임해 봅시다:클라우드를 바꾸지 않고 이 문제를 풀 수 있습니다. 당신의 클라우드는 동기화에는 문제 없습니다. 부족한 건 **별도의 계층**입니다 — 파일 수준 버전 기록, 시간 상한 없음, 매 저장마다 자동 발동.

구체적으로:

- **클라우드(4 개 중 어느 것이든)** 는 동기화 + 오프사이트 사본 담당
- **버전 기록 계층(Keeply 또는 동류)** 은 매 저장、시간 상한 없음、계수 상한 없음、저장 당시 「Keep forever」 결정 필요 없음

Dropbox 나 iCloud 를 대체하는 게 아닙니다. 클라우드가 본래 설계되지 않았던 계층을 위에 올려 놓는 것입니다.

[Keeply](https://keeply.work) 는 iCloud Drive、Dropbox、OneDrive、Google Drive、Synology / QNAP NAS、순수 Finder 폴더와 다 어울립니다 — 시스템을 바꾸는 게 아니라 기존 시스템 위에 한 계층을 추가하는 것입니다.

Keeply 는 이 계층의 reference 구현입니다:매 저장을 로컬에 보관、시간 상한 없음、계수 상한 없음、그리고 「Release」 동결 메커니즘 — 어떤 버전을 「이 버전을 클라이언트에게 보냄」 으로 표시하면 그 스냅샷은 이후 50 번 저장해도 영원히 살아남습니다. 2 개월 전 버전의 복구는 약 2 클릭.

```
Keeply 타임라인 — proposal.psd
────────────────────────────────
● 2026-05-12 14:23   (현재)
● 2026-04-15 09:11   ◀ 27 일 전
● 2026-03-08 17:42   ◀ 65 일 전  ★ Release:client-signoff
● 2026-02-14 11:30
```

65 일 전 버전 위의 Release 표시는 OneDrive 의 500 버전 상한、Dropbox 의 30 일 윈도우、Google Drive 의 100 버전 계수를 모두 넘기고도 끌어올 수 있음을 뜻합니다 — Keeply 는 클라우드처럼 상한 을 적용하지 않기 때문입니다.

## 이 글이 부족한 장면

이 글은 모든 retention 상황을 해결하지 않습니다. 3 가지 경계를 분명히 합시다:

**단순한 삭제 복구, 깊은 기록이 아닌 경우**:「실수로 파일을 지웠다」 가 걱정이라면 각 클라우드의 30 일 휴지통으로 충분합니다. 이 글이 설명하는 계층은 필요 없습니다.

**규제 수준의 불변 아카이브(GDPR / SOX / HIPAA)**:버전 기록은 immutable archive 가 아닙니다. 컴플라이언스가 「원본은 수정 불가」를 요구한다면 정규 아카이브 도구가 필요합니다 — Veeam、Acronis、업계 인증 공급자. Keeply 와 동류 도구는 작업 중 버전 계층이지 아카이브 시스템이 아닙니다.

**Cloud-native 1 인 워크플로우(Pages / Numbers / Sheets)**:작업이 전적으로 Apple 네이티브 포맷 또는 Google 네이티브 Docs / Sheets 에서 끝난다면 내장 버전 기록으로 충분할 수 있습니다. 대가는 파일 타입 lock-in — Pages 파일을 Word 에서 바로 열 수 없고 변환해야 합니다. 어떤 사람에게는 가치 있는 거래, 어떤 사람에게는 그렇지 않은 거래.

## 더 읽기

전체 그림은 [파일 버전 관리 완전 가이드](/ko/post/file-version-management-complete-guide/) 에서 4 가지 구조적 이유로 풀어냅니다.

[3-2-1 백업 원칙](/ko/post/3-2-1-backup-rule/) 은 공간 중복성의 절반을 다룹니다 — 사본 3 개、매체 2 종、오프사이트 1 개. 이 글은 시간 중복성의 나머지 절반:파일이 시간 속에서 꺼낼 수 있게 유지되는 방법.

[Keeply 는 실제로 무엇을 보관하나요? 백업・클라우드 도구와 어떻게 다른가요](/ko/post/what-keeply-saves-vs-backup-cloud/) 은 Keeply 를 백업 도구、클라우드 스토리지와 3 개의 서로 다른 계층으로 비교합니다(경쟁 제품 3 개가 아니라).

---

비교 글의 프레이밍은 당신을 루프에 가둡니다:더 큰 용량、더 좋은 공유、더 많은 기능. 실제로 부서지는 것 — 60 일 전 그 버전 — 은 스펙 표에 한 번도 등장하지 않습니다.

공유 요구와 가격에 맞는 클라우드를 고르세요. 그런 다음 절벽을 막는 계층을 추가하세요.

2 개월 뒤 클라이언트가 물었을 때, 답은 「네, 있습니다」 — 「잠깐만요, 어, 사라졌네요」 가 아니라.

---

> 저자 소개:Ting-Wei Tsao、Keeply 창업자.
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
