---
title: "Vì sao đội thi công của bạn cứ mở nhầm bản vẽ AutoCAD tuần trước"
description: "9:40 sáng, bạn ghé văn phòng, PM mở bản chỉnh sửa thứ Năm tuần trước — chi tiết khung đã đổi. Bạn ở công trường mỗi ngày, không ai báo. Bê tông đã đổ. Hướng dẫn quản lý phiên bản bản vẽ thực dụng cho giám sát hiện trường: không công cụ mới cho đội, không đại tu quy trình, chỉ cần một cách để mỗi lần chỉnh sửa đều để lại dấu vết riêng."
slug: "autocad-wrong-version-crew"
date: 2026-04-24
image: cover.svg
og_image: cover.png
categories:
  - Quản lý tệp
tags:
  - AutoCAD
  - Xây dựng
  - Quản lý phiên bản
  - Quản lý hiện trường
cta_topic: versioning
---

9:40 sáng. Bạn cuối cùng cũng tạt qua văn phòng và thoải mái lướt ảnh công trường hôm qua cho PM xem — đoạn cống thoát nước đã đổ bê tông xong, các khung đúc tại chỗ đã đặt trong bản sàn, chuẩn bị lắp lưới chắn.

PM không nói gì. Anh ấy mở một file trên bàn: `A-05_drain_0422_issued.dwg`.

"Khung sai rồi. Kiến trúc sư chỉnh lại lần nữa hôm thứ Năm tuần trước."

Bạn cảm thấy ngực trĩu xuống. Bản chỉnh sửa thứ Năm tuần trước đã đến văn phòng — Mike nhận, lưu vào server, không ping ai. Bạn ở công trường mỗi ngày. Không ai nhắc trong cuộc họp sáng thứ Hai. Bạn không có lý do gì để biết.

Đoạn đó đã đổ bê tông rồi. Chi tiết khung đổi — nghĩa là phải đục bê tông đã đông cứng để rút khung cũ, đặt khung mới đúng kích thước, đổ lại mép, chờ đông cứng. Thêm hai ngày vào tiến độ. Các đội thầu khác đang xếp hàng phía sau, tất cả đều chờ.

Bạn không gửi sai file cho đội. Bạn chỉ không biết file đã đổi.

## Mục lục

- ["Đó có phải bản chỉnh sửa thứ Năm tuần trước không?"](#h2-1)
- [Trước khi "phát hành để thi công," có rất nhiều bản nháp. Rồi kiến trúc sư lại quay về một bản cũ](#h2-2)
- [Văn phòng biết. Hiện trường thì không](#h2-3)
- [Cho bản vẽ của bạn dòng thời gian riêng](#h2-4)
- [Người duy nhất không cần điều này: đội thi công lắp đặt theo bản in](#h2-5)

---

## "Đó có phải bản chỉnh sửa thứ Năm tuần trước không?" {#h2-1}

Đó là câu PM hỏi lại khi có gì đó trông không ổn. Đội thi công cũng hỏi vậy. Họ không có ý gì — chỉ muốn xác nhận. Vấn đề là, một nửa số lần bạn cũng không trả lời ngay được.

Bạn mở laptop. Thư mục dự án có `A-05_drain_0418.dwg`, `A-05_drain_0422_issued.dwg`, `A-05_drain_0422_issued_revframe.dwg`. Còn có `A-05_drain_0420_avoidutility.dwg` ai đó thả vào nhóm WhatsApp. Và bản đầu tháng Ba, `A-05_drain_0315.dwg`, bạn không bao giờ xóa vì kiến trúc sư đôi khi quay lại bố cục cũ khi một thay đổi không hiệu quả.

Năm tên file. Bạn biết một trong số đó là cái đội đang thi công theo. Nhưng bạn không nhớ là cái nào.

Đây không phải lười biếng, không phải của bạn cũng không phải của Mike. Đó là khoảng trống giữa "một bản vẽ mới đến văn phòng" và "hiện trường biết về nó" không có ai được giao trách nhiệm. Bạn tình cờ là người đứng ở cả hai phía của khoảng trống đó.

---

## Trước khi "phát hành để thi công," có rất nhiều bản nháp. Rồi kiến trúc sư lại quay về một bản cũ {#h2-2}

Bạn có thể nghĩ, "Được, mỗi lần ở văn phòng tôi sẽ kiểm tra hai lần." Lý thuyết thì có. Thực tế thì sụp đổ vì **các bản nháp cứ chồng chất trước khi bất cứ thứ gì được phát hành chính thức**.

Một chi tiết, từ phác thảo sơ đồ đầu tiên đến phát hành để thi công, đi qua rất nhiều phiên bản. Chủ đầu tư thêm một góp ý — chỉnh sửa. Đi khảo sát hiện trường phát hiện xung đột với tiện ích — chỉnh sửa. Kỹ sư kết cấu duyệt lại — chỉnh sửa. **Rồi kiến trúc sư đến rev 5 và chủ đầu tư nói "thật ra chi tiết mép của rev 2 sạch hơn," nên quay lại**. Bạn mở thư mục và thấy sáu file, hai trong số đó gần như giống hệt nhau — nhưng bạn không biết cái nào là cái có giá trị ngay lúc này.

Nếu bạn chờ kiến trúc sư "chốt cuối cùng" trước khi cho đội bắt đầu, tiến độ sẽ đè bẹp bạn. Ba đội thầu đang xếp hàng sau đoạn này. Mỗi ngày bạn giữ lại, bạn đốt nhân công, thiết bị, và độ trượt thời gian. Vậy nên GC chấp nhận rủi ro tính toán — **tiếp tục với phiên bản mới nhất nhìn thấy**, đặt cược rằng bản chỉnh sửa tiếp theo sẽ không quá kịch liệt.

Hầu hết thời gian, đặt cược thắng. Đôi khi không. Đó là tuần này.

---

## Văn phòng biết. Hiện trường thì không {#h2-3}

Điểm gãy thực sự là ở đây: **một bản vẽ mới đến văn phòng, hiện trường không nghe tin, và không ai mang tin nhắn vượt qua khoảng trống**.

Phía văn phòng, người nhận email có thể là trợ lý PM, nhân viên hành chính, hoặc một super khác. Bản năng của họ khi một file đến là "lưu cho đúng" — thư mục, đặt tên, lưu trữ. Họ không phải lúc nào cũng biết chính xác hiện trường tuần này đang làm gì, và họ không phải lúc nào cũng nhìn thoáng qua là biết liệu bản chỉnh sửa này có phải loại cần được báo động ngay không. Với họ, đã lưu là xong.

Phía hiện trường, bạn ra ngoài mỗi ngày. Ngay cả khi bạn ghé văn phòng mỗi thứ Sáu để đồng bộ, giữa lần kiểm tra cuối và lần kiểm tra tiếp theo, kiến trúc sư có thể đã phát hành hai bản chỉnh sửa và quay về một cái. Bạn có thể tìm ra nếu đi tìm — nhưng **chỉ khi bạn đủ kỷ luật để chủ động kiểm tra lại**. Không phải super nào cũng làm vậy, mỗi lần.

Phía đội thi công, họ thi công theo bất cứ thứ gì bạn đưa cho họ lần cuối. Họ không biết liệu có file mới hơn ở văn phòng hay không. Và họ cũng không nên cần biết — công việc của họ là lắp đặt theo bản vẽ, không phải theo dõi phiên bản.

Trong ba mạch đó, **mạch giữa văn phòng và hiện trường là dễ rớt nhất**. Không phải vì ai đó lười. Vì không có quy trình nào ép đường dây đó luôn mở. Một tin nhắn "đã tải lên phiên bản mới" trong nhóm chat bị bỏ lỡ là bị bỏ lỡ vĩnh viễn.

---

## Cho bản vẽ của bạn dòng thời gian riêng {#h2-4}

Không có gì nhiều. Bốn bước.

**1. Khoảnh khắc một file mới đến văn phòng, ping hiện trường — và chờ một câu "đã nhận" trả lại.** Không phải "đã lưu xong." **Bắt tay chỉ hoàn tất khi người ở hiện trường xác nhận rõ ràng**. Có thể WhatsApp, có thể Slack, có thể một cuộc gọi điện. Quy tắc là: hiện trường phải xác nhận bằng văn bản. Không xác nhận, bàn giao chưa hoàn tất.

**2. Trước khi bất kỳ bản chỉnh sửa mới nào ghi đè lên bản trước đó, giữ bản trước đó riêng biệt.** Đặt tên `A-05_drain_0418_architect_rev3.dwg`, `A-05_drain_0422_architect_rev4.dwg`. Đây là **cho lúc kiến trúc sư quay lại** — bạn vẫn có thể mở chính xác rev 3 trông như thế nào.

**3. Để công cụ ghi lại mọi bản chỉnh sửa tự động, và làm cho nó hiển thị cho mọi người.** Đây là chỗ công cụ tiếp quản phần mà kỷ luật không thể duy trì. [Keeply](https://keeply.work) được xây cho đúng việc này. Mỗi lần lưu tự động ghi một phiên bản. Files giữ nguyên vị trí — trong thư mục dự án của bạn, ngay nơi đội của bạn đã quen nhìn. **Miễn là mọi người mở cùng một vault chia sẻ (thường là NAS công ty), mọi người thấy cùng một dòng thời gian** — khoảnh khắc văn phòng thả file mới vào, super hiện trường mở Keeply trên công trường và dòng thời gian hiện "15:30 hôm nay, kiến trúc sư lại chỉnh sửa." Lưu ý thẳng thắn: nếu bạn cần so sánh hai bản vẽ `.dwg` từng dòng, bạn vẫn phải mở AutoCAD và tự làm — Keeply không làm so sánh bản vẽ CAD. Nhưng "có một phiên bản mới rơi xuống, ai gửi, khi nào, và bạn đã mở chưa?" — cái đó bạn ngừng bỏ lỡ. PM hỏi "Cậu đã xem bản chỉnh sửa thứ Năm tuần trước chưa?" và dòng thời gian trả lời.

Đại khái trên màn hình trông như thế này:

```text
A-05_drain.dwg
Vault: Z:\Projects\MapleSt_Drainage\
─────────────────────────────────────────────

 Mô tả phiên bản                        Tag     Khi nào
─────────────────────────────────────────────
 ●  Chi tiết khung được chỉnh             Hôm nay
 ●  Định tuyến lại để tránh tiện ích       04/20
 ●  Phát hành sau khi chủ đầu tư duyệt ⭐Issued 04/18
 ●  Mặt cắt được điều chỉnh                04/15

─────────────────────────────────────────────
 Thành viên vault (NAS chia sẻ)
   Mike (văn phòng) · Bạn (hiện trường) · Chen (đội trưởng)

   Mọi người mở cùng thư mục, mọi người thấy
   cùng dòng thời gian. Khoảnh khắc một phiên bản
   mới rơi xuống, nó hiện ra cho mọi người.
   Hover bất kỳ hàng nào → khôi phục một cú click.
```

**4. Ít nhất một bản sao không nằm trên máy này và không nằm trên NAS công trường.** Ổ đĩa ngoài, đám mây, slot backup — gì cũng được. Quan trọng là **ít nhất một bản sao ở nơi khác**. Ổ NAS văn phòng hỏng, bị xóa, bị tái sử dụng cho dự án tiếp theo. Sao lưu ở nơi khác là khoản bảo hiểm rẻ nhất bạn từng mua cho mình.

Bước 1 và 2 có thể chạy bằng kỷ luật đơn thuần, nhưng thật lòng — ba tháng nữa bạn sẽ bỏ lỡ một nửa. Bước 3 là cách công cụ bắt nửa còn lại.

---

## Người duy nhất không cần điều này: đội thi công lắp đặt theo bản in {#h2-5}

Hãy thẳng thắn — bài này không dành cho mọi người trong xây dựng. Nhưng danh sách loại trừ ngắn hơn bạn nghĩ.

**Người duy nhất hoàn toàn không cần điều này là đội thi công lắp đặt theo bản vẽ trước mặt họ.** Công việc của họ là thi công theo bản đã giao, không đuổi theo phiên bản. Đuổi theo phiên bản là việc của bạn.

**Công trình công thật ra cần điều này nhiều hơn, không phải ít hơn.** Bạn có thể giả định các dự án công lớn đã được bao phủ vì họ đã có một nền tảng cộng tác BIM. Ngược lại. Công trình công chạy nhiều giấy tờ hơn dự án tư đáng kể, yêu cầu thay đổi kéo dài qua nhiều tháng, thay đổi quản lý cao hơn, đống tài liệu phình ra nhanh hơn, và trí nhớ tổ chức gãy dễ hơn. Nền tảng BIM giải quyết bàn giao cuối cùng. Chúng không giải quyết tài liệu kế hoạch, file chia sẻ, và ghi chú chỉnh sửa mà bản vẽ thiết kế tích lũy trong quá trình — và những thứ đó mới thực sự lớn lên, ngày qua ngày.

**Các shop một người cũng cần.** Bạn có thể nghĩ: "Chỉ có mình tôi trên dự án này từ đầu đến cuối, tôi có thực sự cần quản lý phiên bản không?" Có. Vì ba tháng nữa, nhìn cùng file đó, **bạn sẽ quên tại sao mình-trong-quá-khứ đã thay đổi**. Một dòng thời gian lưu nhiều hơn chính file đó — nó lưu lý do tại thời điểm đó. Mình-trong-tương-lai sẽ cảm ơn mình-hiện-tại đã để lại dấu vết.

Mọi người khác — nhà ở nhỏ-vừa, thương mại, hoàn thiện nội thất, thoát nước, cảnh quan, đường, công trình campus, công trình công, dự án BIM, designer solo, công ty thiết kế — **nếu công việc của bạn liên quan đến một file bị thay đổi và mở lại sau đó bởi người khác hoặc bởi mình-trong-tương-lai, bạn cần một dòng thời gian.** Mỗi lần đường dây đó gãy, thời gian và tiền bước ra khỏi túi bạn.

---

Một file `.dwg` không chỉ là bản vẽ. Đó là ảnh chụp về điều mà thiết kế, văn phòng, và hiện trường đã đồng thuận tại một khoảnh khắc cụ thể. Khoảnh khắc đó cứ thay đổi, cứ được trao tay, cứ được thi công từ phiên bản sai.

Đáng để cho mỗi dự án của bạn dòng thời gian riêng?

---

Nhớ khoảnh khắc 9:40 sáng đó — PM mở bản chỉnh sửa thứ Năm, và ngực bạn trĩu xuống? Bạn không phải làm người quản lý phiên bản nữa. **Keeply: ký ức bảo vệ cho file của bạn.** Nhớ mỗi lần lưu, mỗi phiên bản phát hành, mỗi ảnh chụp trước khi cái cũ bị ghi đè. Sống bên trong thư mục dự án hiện có của bạn — không công cụ mới, không thói quen mới cho đội. Xây dựng phù hợp đặc biệt, vì đường dây giữa văn phòng và hiện trường gãy trên mọi dự án.

[Gặp Keeply →](https://keeply.work)
