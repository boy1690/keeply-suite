---
title: "【2026 파일 관리】Time Machine vs Dropbox：backup、sync、그리고 둘 다 아닌 세 번째 축"
description: "모든 Time Machine vs Dropbox 비교 글은 backup vs sync 이분법으로 쓴다. 둘 다 맞다. 둘 다 세 번째 축——파일 단위의 의도적인 버전 기록——을 놓친다. 3 개월 뒤 「그때 의도적으로 저장한 그 버전」이 필요할 때, 그 빈틈이 진짜 아프다."
voice_version: v2-2026-05-13
date: 2026-05-13T09:00:00+08:00
draft: false
slug: "time-machine-vs-dropbox"
primary_keyword: "타임머신 드롭박스 차이"
locale: ko
categories: [파일 관리]
tags: [버전 관리, 클라우드 동기화, 도구 비교]
image: cover.svg
og_image: cover.png
cta_topic: backup
role: cluster
pillar_parent: file-version-management-complete-guide
locales_required: [en, zh-TW, zh-CN, ja, ko, it]
image_alt_data: "Time Machine(디스크 수준 snapshot)、Dropbox(클라우드 동기화)、세 번째 축 「파일 수준 의도적 버전 기록」을 비교하는 3 축 다이어그램——표준 Time Machine vs Dropbox 비교가 3 축 중 2 축만 다룬다는 점을 보여준다"
faq_schema:
  - q: Time Machine 이 내 Dropbox 폴더를 백업하나요?
    a: 기본적으로 합니다. Time Machine 은 Dropbox 폴더를 포함해 홈 디렉터리 전체를 snapshot 합니다. 다만 백업하는 건 동기화된 상태이지 Dropbox 자체의 버전 기록이 아닙니다. Time Machine 공간을 절약하려면 Dropbox 를 Time Machine 제외 목록에 추가할 수 있습니다.
    
  - q: Time Machine 만으로 충분한가요?
    a: 「디스크 고장 / Mac 통째로 재설치」 같은 재해 복구에는 충분합니다——Time Machine 은 기기 전체를 복원합니다. 하지만 「2 개월 전 화요일 오후에 의도적으로 저장한 그 버전이 필요해」에는 부족합니다——Time Machine 은 시간 단위 디스크 snapshot 이지、파일 수준 저장 의도 기록이 아닙니다.
    
  - q: Time Machine 과 Dropbox 둘 다 돌려야 하나요?
    a: 서로 다른 문제를 풀므로 대부분의 사람은 둘 다 돌리는 게 유리합니다——Time Machine 으로 디스크 전체 복원、Dropbox 로 기기 간 동기화와 오프사이트 사본. 하지만 둘 다 돌려도 세 번째 축——파일 단위 의도적 버전 기록、retention cap 없음——은 비어 있습니다.
    
  - q: Time Machine snapshot 과 Dropbox 버전 기록의 차이는?
    a: Time Machine snapshot 은 디스크 수준입니다——시간 단위로 디스크 전체를 snapshot 하고 시간이 지나면서 오래된 것을 솎아 냅니다. snapshot 이 커버하는 어떤 파일도 복원할 수 있지만「날짜」로 탐색할 뿐「저장 이벤트」로는 탐색하지 못합니다. Dropbox 버전 기록은 파일 수준——파일별 버전 목록을 보관하지만 무료 30 일 cap、유료 180 또는 365 일. Time Machine 은 디스크를 알고、Dropbox 는 파일을 알지만、둘 다 당신의 저장 의도를 모릅니다.
    
  - q: 둘 다 놓치는 세 번째 축이란 뭔가요?
    a: 파일 수준의 의도적 버전 기록、시간 cap 없음、계수 cap 없음——매 Cmd+S 를 독립적으로 되찾을 수 있는 지점으로 기록하고、특정 버전을「이게 클라이언트에게 보낸 그것」으로 마크하면 영원히 살아남는 구조. Keeply 같은 도구는 디스크 백업과 클라우드 동기화와 별개로 이 세 번째 계층을 만듭니다.
---

# 【2026 파일 관리】Time Machine vs Dropbox：backup、sync、그리고 둘 다 아닌 세 번째 축

> 모든 비교 글이 backup vs sync 로 쓴다. 둘 다 맞다. 둘 다 3 개월 뒤 실제 필요할 그 세 번째 축을 놓친다.

금요일 저녁 6:18, 「가격 바꾸기 전 그 버전」 의 제안서를 찾고 있다. 2 개월 전 화요일이라는 건 기억난다——오후에 의도적으로 한 버전을 저장했다.

Time Machine 을 연다. 기술적으로는 거기 있다——하지만 Time Machine 은 Documents 폴더 전체의 날짜별 snapshot 더미를 뒤지게 한다. 정확한 날짜는 모른다. 「2 개월 전 화요일、점심 후」 만 기억난다.

Dropbox 를 연다. 버전 기록은 30 일. 사라졌다.

표준 조언「Time Machine 과 Dropbox 둘 다 써라」가 실제로 가진 질문에 답하지 않는 두 도구를 줬다는 걸 깨닫는다.

## Time Machine vs Dropbox 비교 글이 실제로 비교하는 것

당신이 읽은 모든 비교 글은 이걸 2 축 대결로 그립니다：

| 축 | Time Machine | Dropbox |
|---|---|---|
| 로컬 디스크 백업 | ✅ 디스크 전체 snapshot | ❌ 본업이 아님 |
| 기기 간 클라우드 동기화 | ❌ 본업이 아님 | ✅ 핵심 기능 |

둘 다 맞고、둘 다 참. 모든 글의 결론：「둘 다 써라」. 합리적인 조언——범위가 틀렸음.

테이블에 올라가지 않은 세 번째 축이 있기 때문.

## 세 번째 축：파일 수준 의도적 버전 기록

모든 비교 글이 놓치는 것：**파일별 의도적 저장의 기록、시간 cap 없음、계수 cap 없음、특정 저장을 「영원히 남는 마일스톤」으로 표시할 수 있는 능력**.

세 번째 축을 추가한 같은 테이블：

| 축 | Time Machine | Dropbox |
|---|---|---|
| 로컬 디스크 백업 | ✅ 디스크 전체 시간 단위 snapshot | ❌ |
| 기기 간 클라우드 동기화 | ❌ | ✅ |
| **파일 수준 의도적 버전 기록** | ⚠️ 디스크 수준만、파일 수준 아님 | ⚠️ 30 일 cap(유료 180) |

Time Machine 에는 snapshot 이 있지만 디스크 수준입니다. 당신이 오후 2:47 에 특정 파일에 의도적으로 Cmd+S 를 눌렀다는 걸 모릅니다. 다음 시간 단위 snapshot 시의 디스크 상태만 알 뿐이며、이는 2:00(저장 전)이나 3:00(저장 후이지만 그 사이 변한 다른 것도 포함) 일 수 있습니다.

Dropbox 에는 파일 수준 버전이 있지만 무료 30 일 cap、유료 180 또는 365 일. cap 을 넘으면 그 파일 수준 기록은 사라집니다.

그래서「2 개월 전 화요일 오후에 의도적으로 저장한 그 버전」이 필요할 때、Time Machine 에는 바이트는 있지만(어딘가 snapshot 안에) 인덱스가 없습니다. Dropbox 에는 인덱스가 있었지만 31 일째에 버렸습니다.

## 왜 세 번째 축은 비교 글에 나타나지 않을까

분류학 문제입니다.

리뷰어는「경쟁자」로 프레이밍된 제품을 비교합니다. Time Machine 과 Dropbox 는 실제로 경쟁자가 아닙니다——Apple 은 OS 와 함께 하나를 출하、Dropbox 는 구독을 팝니다.「vs」 프레이밍은 둘 다 파일을 다루기에 사용자가 겹친다고 가정한 데서 옵니다.

세 번째 축——파일 수준 의도적 버전 기록——은 주류 도구 대부분이 차지하지 않는 카테고리입니다. 그래서 리뷰 사이트에 그 슬롯에 넣을 벤더가 없고、축은 보이지 않게 됩니다.

당신은 보이는 축으로 도구를 고릅니다. Time Machine + Dropbox 를 고르고、모든 걸 커버했다고 느끼고、필요해질 때 빈틈을 발견합니다.

## 도구가 세 번째 축을 구현하면 어떻게 보일까

「파일 수준 의도적 버전 기록」 을 중심으로 만들어진 도구는 이런 것들을 합니다：

- **의도적인 Cmd+S 마다 버전 저장**——snapshot 스케줄이 아니라
- **시간 cap 없음**——2 년 전 버전은 어제 버전만큼 쉽게 꺼낼 수 있음
- **계수 cap 없음**——500 번 저장한 후에도 초기 것이 살아 있음
- **「Release」또는「Milestone」마커**——특정 저장을「이게 3 월 8 일에 클라이언트에게 보낸 것」으로 표시하면 500 번 더 저장해도 영원히 살아남음
- **Time Machine 과 Dropbox 와 공존**——대체하지 않고、세 번째 축에 거주

[Keeply](https://keeply.work) 는 이 세 번째 계층의 한 구현입니다. 로컬에서 돌고、추가한 폴더를 watch 하고、의도적인 저장마다 잡아냅니다、cap 없음. Release 기능으로 특정 버전을 마일스톤으로 동결할 수 있습니다.

```
Keeply — 2 개월 전 화요일 오후

2026-03-08 — 화요일
─────────────────────────────────
● 14:23   proposal.psd          (자동 저장)
● 14:47   proposal.psd          ★ Release：client-pricing-v1
● 15:11   proposal.psd          (자동 저장)
● 15:42   proposal.psd          (자동 저장)
```

저 ★ 마커가「화요일 오후에 의도적으로 저장한 그 버전」을 돌려줍니다——Dropbox 의 30 일 cap、Time Machine 의 시간 단위 솎아내기、그리고 정확히 어느 날이었는지 잊은 당신의 기억을 모두 견디고.

## Time Machine 과 Dropbox 는 여전히 중요

이건 둘 중 어느 하나를 대체하라는 주장이 아닙니다.

**Time Machine** 은 다음에 맞는 도구：하드웨어 고장 후 디스크 전체 복원、「Mac 을 도난당해서 새 기기에 복원」、「잘못된 시스템 업데이트를 되돌리고 싶음」. 완전한 디스크 안전망. 돌려야 함.

**Dropbox** 는 다음에 맞는 도구：기기 간 동기화、클라이언트와 폴더 공유、작업 중 파일의 오프사이트 사본. 완전한 동기화 솔루션. 돌려야 함.

둘 다 잘 못하는 것：「컴퓨터 전체 snapshot 이 아니라、내가 어렴풋이 기억하는 날짜의 그 파일 버전을 줘」. 그게 세 번째 축.

## 세 번째 축을 추가할 가치가 없는 장면

3 가지 경계、이 글의 프레이밍이 적용되지 않는 곳：

**30 일 이전 파일을 보관하지 않는 경우**：워크플로우가 단기 사이클이고 한 달이 지난 게 중요하지 않으면 Dropbox 의 30 일 윈도우로 충분. 쓰지 않을 복잡성을 추가하지 마세요.

**작업이 전적으로 Pages / Numbers / Keynote 인 경우**：Apple 의 네이티브 파일 타입은 내장 버전 기록이 있고 Time Machine 이나 타사 도구에 의존하지 않습니다. 세 번째 축이 파일 포맷에 내장. 대가는 파일 타입 lock-in.

**불변 아카이브가 필요한 규제 산업에 있는 경우**：버전 기록은 컴플라이언스 아카이브가 아닙니다. GDPR / HIPAA / SOX 가 「이 버전은 생성 후 수정 불가」를 요구한다면 아카이브 등급 도구(Veeam、Acronis)가 필요하지 Time Machine + Dropbox + 버전 기록이 아닙니다.

## 더 읽기

전체 그림은 [파일 버전 관리 완전 가이드](/ko/post/file-version-management-complete-guide/) 에서 4 가지 구조적 이유로 풀어냅니다.

[iCloud 와 Dropbox 를 비교하기 전에：4 개 클라우드가 공유하는 버전 기록의 절벽](/ko/post/cloud-version-history-cliff/) — 클라우드 vs 클라우드의 비교 대조판；이 글은 로컬 vs 클라우드.

[Keeply 는 실제로 무엇을 보관하나요? 백업・클라우드 도구와 어떻게 다른가요](/ko/post/what-keeply-saves-vs-backup-cloud/) — 같은 3 계층 사고를 Keeply 주역으로 프레이밍.

---

「Time Machine vs Dropbox」 에는 단일 답이 없었습니다、맞는 질문이 아니었기 때문에.

맞는 질문은：어느 축을 커버하려고 하나요? 그 축에 거주하는 도구가 있나요?

Backup 축：Time Machine. Sync 축：Dropbox. 버전 기록 축：당신이 읽은 비교표에 없음. 거기에 거주하는 계층을 추가하거나、빈틈이 거기 있다는 걸 알고 받아들이거나.

3 개월 뒤、화요일 오후의 의도적인 저장이 필요할 때、답은「클릭、3 월 8 일、복원」—— 「Time Machine 부팅해서 한 시간 스크롤」 이 아닙니다.

---

> 저자 소개：Ting-Wei Tsao、Keeply 창업자.
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
