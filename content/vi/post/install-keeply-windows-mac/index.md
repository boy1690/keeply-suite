---
title: "Cách cài Keeply trên Windows và macOS trong 10 phút"
description: "Bỏ qua dòng chữ nhỏ 'Run anyway' và đoán mò — cài Keeply trong mười phút và bảo vệ dự án đầu tiên ngay trong ngày."
date: 2026-04-26
draft: false
tags: ["cài đặt", "hướng dẫn", "Windows", "macOS", "winget"]
categories: ["hướng dẫn"]
primary_keyword: "cài Keeply"
locales: ["en", "zh-TW", "zh-CN", "ja", "vi"]
slug: install-keeply-windows-mac
image: cover.svg
og_image: cover.png
---

> "Tôi nhấp đúp, màn hình xanh hiện ra, và tôi nghĩ đó là virus nên đóng lại."
>
> — Một designer vừa mới nghe về Keeply, trả lời ngay chiều hôm đó.

Anh ấy không phải người đầu tiên. Màn hình xanh trên Windows có lẽ chặn nhiều người hơn số người thực sự cài xong.

Đây là toàn bộ con đường từ đầu đến cuối: **vì sao màn hình xanh xuất hiện → ba cách cài sạch hơn → mở dự án đầu tiên ngay sau đó**.

## Mục lục

1. [Vì sao màn hình xanh xuất hiện (không phải lỗi của Keeply)](#why-smartscreen)
2. [Ba con đường — chọn cái nào hợp với bạn](#three-paths)
3. [Windows con đường 1: một lệnh winget (khuyến nghị)](#path-winget)
4. [Windows con đường 2: tải file .exe](#path-exe)
5. [macOS cài: bước nhấp chuột phải bạn không thể bỏ qua](#path-macos)
6. [Sau khi cài: thả dự án đầu tiên vào](#first-project)
7. [Bị kẹt? 5 lỗi thường gặp](#troubleshoot)

## Vì sao màn hình xanh xuất hiện (không phải lỗi của Keeply) {#why-smartscreen}

Màn hình đó gọi là [SmartScreen](https://learn.microsoft.com/en-us/windows/security/operating-system-security/virus-and-threat-protection/microsoft-defender-smartscreen/). Nó không quyết định "phần mềm này có độc hại không?" — nó quyết định "đã có đủ người dùng nó chưa?".

Nghĩ thế này: một nhà hàng mới chưa có đánh giá Google không phải là đồ ăn dở. Chỉ là đồ ăn chưa ai đánh giá.

SmartScreen đối xử với phần mềm mới y như vậy. Nó xây niềm tin bằng **lượt tải + thời gian**, và mỗi bản phát hành mới đều phải trải qua giai đoạn quan sát này lại. Keeply gặp chuyện này mỗi lần ra bản cập nhật. Không có gì liên quan đến việc phần mềm có an toàn hay không.

Vậy tại sao nó làm người ta sợ? Vì màn hình chỉ cho bạn nút khổng lồ "Don't run". Để chạy bất chấp, bạn phải nhấp một liên kết bé tí gọi là **More info** ở bên cạnh. Trông không giống một thông báo — trông giống một bức tường.

Nhưng bạn không phải đối phó với nó. **Keeply được xuất bản trong [kho gói winget của Microsoft](https://github.com/microsoft/winget-pkgs)**, và con đường đó hoàn toàn không kích hoạt cảnh báo.

Vậy nên vấn đề không phải là làm sao vượt qua cảnh báo. Vấn đề là chọn con đường mà cảnh báo không bao giờ xuất hiện.

![Cảnh báo SmartScreen của Windows, với liên kết nhỏ "More info" được khoanh tròn](fig-smartscreen-warning.svg)

## Ba con đường — chọn cái nào hợp với bạn {#three-paths}

| Con đường | Phù hợp nếu bạn | Thời gian | Màn hình xanh? |
| --- | --- | --- | --- |
| **A. Lệnh winget** (Windows) | không ngại dán một dòng vào PowerShell | 2 phút | Không |
| **B. Tải .exe chính thức** (Windows) | không muốn mở terminal đen | 5 phút | Có — chúng tôi sẽ hướng dẫn bạn qua |
| **C. Tải .dmg chính thức** (macOS) | dùng Mac | 3 phút | Không, nhưng cần nhấp chuột phải |

Đã chọn? Nhảy đến phần tương ứng. Bỏ qua những phần khác.

## Windows con đường 1 — một lệnh winget (khuyến nghị) {#path-winget}

**winget** là "trình quản lý gói" có sẵn của Windows — về cơ bản giống Microsoft Store nhưng cho dòng lệnh. Nó đã được tích hợp vào Windows từ phiên bản 10 1809. Bạn không cần cài thêm gì.

Mở PowerShell (tìm "PowerShell" trong menu Start), dán dòng này, nhấn Enter:

```powershell
winget install Boy1690.Keeply
```

![PowerShell chạy winget — tải xuống và cài đặt hoàn tất trong khoảng 30 giây](fig-powershell-winget.svg)

Khoảng 30 giây và xong. Không màn hình xanh. Không dòng chữ nhỏ "More info".

Vì sao con đường này sạch như vậy? Vì để được liệt kê trong winget, Keeply phải vượt qua [vòng duyệt chính thức của Microsoft trên GitHub](https://github.com/microsoft/winget-pkgs): họ kiểm tra nguồn cài đặt, chữ ký file, và hành vi cài đặt. Chỉ phát hành sau khi mọi thứ đã qua.

Nói cách khác: khi bạn chạy lệnh đó, Microsoft đã thay bạn duyệt một vòng rồi. Kiểm tra của SmartScreen trên con đường này là dư thừa, nên nó không xuất hiện.

Con đường ngắn và con đường tin cậy, trong một dòng.

## Windows con đường 2 — tải file .exe {#path-exe}

Không muốn động đến PowerShell? Được thôi. Vào keeply.work, nhấp tải xuống, lấy file `.exe`, nhấp đúp.

Màn hình xanh SmartScreen sẽ hiện ra. **Đó là bình thường** ([vì sao, xem ở trên](#why-smartscreen)). Để tiếp tục:

1. Nhấp **More info** (chữ gạch dưới nhỏ trên cảnh báo)
2. Một nút **Run anyway** xuất hiện
3. Nhấp nó. Trình cài đặt sẽ tiếp quản từ đó.

![Khi bạn nhấp "More info", nút "Run anyway" xuất hiện bên cạnh "Don't run"](fig-smartscreen-run-anyway.svg)

Toàn bộ vòng vèo này thêm khoảng 3 phút — phần lớn là tâm lý, không phải cú click thực tế. Từ đây, con đường này và con đường 1 hội tụ.

## macOS cài — bước nhấp chuột phải bạn không thể bỏ qua {#path-macos}

Không có màn hình xanh trên Mac. Nhưng bạn không thể nhấp đúp khi mở lần đầu — [macOS Gatekeeper](https://support.apple.com/en-us/102445) sẽ chặn.

Quy trình đúng:

1. Tải `.dmg`, kéo Keeply vào thư mục Applications
2. Mở Applications, tìm Keeply
3. **Nhấp chuột phải → Open** (không phải nhấp đúp)

   ![Menu nhấp chuột phải của macOS Finder với "Open" được làm nổi bật ở trên cùng](fig-macos-rightclick.svg)

4. Một hộp thoại xuất hiện — nhấp "Open"

   ![Hộp thoại xác nhận của macOS với nút "Open" được làm nổi bật](fig-gatekeeper-dialog.svg)

Vậy thôi. **Chỉ lần mở đầu cần điều này** — nhấp đúp hoạt động bình thường sau đó.

Vì sao vòng vèo lần đầu? Gatekeeper chặn việc nhấp đúp mở bất kỳ ứng dụng nào nó chưa thấy đã được công chứng. Nhấp chuột phải → Open là cách Apple nói "Tôi biết tôi đang cài gì, cho tôi qua".

Đây không phải đặc điểm riêng của Keeply. Mọi ứng dụng Mac mới chưa từng có trên máy bạn đều hoạt động như vậy khi mở lần đầu.

## Sau khi cài — thả dự án đầu tiên vào {#first-project}

Đã cài không phải đã xong. Dự án đầu tiên được bảo vệ ngay trong ngày — mới là xong.

Mở Keeply, nhấn **New project**, chọn một thư mục bạn đang làm việc.

<!-- TODO: thay bằng ảnh chụp thật keeply-add-project.png (hộp thoại "Thêm dự án" của Keeply) -->

**Nên thả gì vào trước**: bất cứ thứ gì bạn đang giữ ngay lúc này mà không thể mất và bạn vẫn đang chỉnh sửa. Một bản pitch, hợp đồng, file thiết kế, deck — bất cứ cái nào cũng được. Đừng chọn thư mục bạn không động vào suốt sáu tháng. Giá trị của thư mục đó nằm ở lưu trữ, không phải ở bảo vệ. Câu chuyện khác.

Lần quét đầu tiên mất 1 đến 2 phút. Sau đó, Keeply theo dõi thư mục trong nền và **tự động ghi phiên bản khi bạn lưu**. Không có nút "checkpoint" thủ công nào để bấm.

Một ví dụ giả định nhưng điển hình: một designer thả thư mục pitch quý 2 vào ngay sau khi cài. Lần quét đầu mất 2 phút. Ba ngày sau, họ nhận ra mình đã đổi sai màu logo hôm thứ Bảy — kéo phiên bản trước từ lịch sử mất 20 giây.

Người dùng dự án đầu tiên trong ngày cài đặt ở lại lâu hơn nhiều so với người chờ một tuần.

## Bị kẹt? 5 lỗi thường gặp {#troubleshoot}

| Triệu chứng | Sửa |
| --- | --- |
| Lệnh `winget` không tìm thấy | Nghĩa là Windows của bạn chưa có App Installer. Dùng con đường 2 (tải .exe) thay thế — đừng đấu với nó |
| Win 11 nói "cần administrator" | Mở lại PowerShell với **Run as administrator** |
| Mac nói "không thể mở vì đến từ một developer chưa xác định" | Nhấp chuột phải → Open (không phải nhấp đúp). Xem phần macOS ở trên |
| Mạng công ty chặn tải xuống | Dùng lệnh winget thay thế — nó đi qua CDN của Microsoft và thường vượt qua được |
| Đã cài nhưng không mở được | Khởi động lại một lần. Vẫn không gì? Email [support@keeply.work](mailto:support@keeply.work) |

## Một điều cần nhớ

Một điều:

**Màn hình xanh không phải phán quyết — đó là uy tín đang được xây.**

Bạn không cần vượt qua cảnh báo. Bạn chỉ cần đi con đường winget nơi cảnh báo không bao giờ hiện ra.
