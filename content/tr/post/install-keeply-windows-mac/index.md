---
title: "Keeply'yi Windows ve macOS'a 10 dakikada nasıl kurarsın"
description: "\"Yine de çalıştır\" küçük yazılarını ve tahmin oyununu atla — Keeply'yi on dakikada kur, ilk projeni aynı gün koruma altına al."
date: 2026-04-26
draft: false
tags: ["kurulum", "öğretici", "Windows", "macOS", "winget"]
categories: ["öğretici"]
primary_keyword: "Keeply kurulumu"
locales: ["en", "zh-TW", "zh-CN", "ja", "tr"]
slug: install-keeply-windows-mac
image: cover.svg
og_image: cover.png
cta_topic: install
---

> "Çift tıkladım, mavi ekran çıktı, virüs sandım ve kapattım."
>
> — Keeply'yi yeni duymuş bir tasarımcı, aynı öğleden sonra yanıt veriyor.

İlk değil. Windows'taki mavi ekran muhtemelen kurulumu bitirenden çok daha fazla insanı durduruyor.

İşte baştan sona tüm yol: **mavi ekran neden çıkıyor → daha temiz üç kurulum yolu → hemen ardından ilk projeni açma**.

## İçindekiler

1. [Mavi ekran neden çıkar (Keeply sorunu değil)](#why-smartscreen)
2. [Üç yol — sana uyanı seç](#three-paths)
3. [Windows yolu 1: tek bir winget komutu (önerilen)](#path-winget)
4. [Windows yolu 2: .exe indir](#path-exe)
5. [macOS kurulumu: atlanamayan sağ tık adımı](#path-macos)
6. [Kurulumdan sonra: ilk projeni içine bırak](#first-project)
7. [Takıldın mı? 5 yaygın hata](#troubleshoot)

## Mavi ekran neden çıkar (Keeply sorunu değil) {#why-smartscreen}

O ekranın adı [SmartScreen](https://learn.microsoft.com/en-us/windows/security/operating-system-security/virus-and-threat-protection/microsoft-defender-smartscreen/). "Bu yazılım kötü amaçlı mı?" sorusuna karar vermiyor — "yeterince insan kullandı mı?" sorusuna karar veriyor.

Şöyle düşün: Google yorumları olmayan yeni bir restoran kötü yemek demek değil. Sadece henüz kimsenin puanlamadığı yemek.

SmartScreen yeni yazılıma aynı şekilde davranıyor. Güveni **indirme hacmi + zaman** ile inşa ediyor ve her yeni sürüm bu gözlem süresinden tekrar geçiyor. Keeply her güncelleme yayınladığında bunu yaşıyor. Hiçbiri yazılımın güvenli olup olmadığıyla ilgili değil.

Peki neden insanları korkutuyor? Çünkü ekran sana yalnızca devasa bir "Çalıştırma" düğmesi veriyor. Yine de çalıştırmak için, kenardaki **Ek bilgi** adlı küçük bir bağlantıya tıklaman gerekiyor. Görsel olarak bir uyarı gibi okunmuyor — bir duvar gibi okunuyor.

Ama bununla uğraşmana gerek yok. **Keeply [Microsoft'un winget paket deposunda](https://github.com/microsoft/winget-pkgs) yayımlanıyor** ve o yol uyarıyı hiç tetiklemiyor.

Yani mesele uyarıyı nasıl atlayacağın değil. Mesele uyarının hiç çıkmadığı bir yolu seçmek.

![Windows SmartScreen uyarısı, küçük "Ek bilgi" bağlantısı işaretli](fig-smartscreen-warning.svg)

## Üç yol — sana uyanı seç {#three-paths}

| Yol | Sana uyar eğer | Süre | Mavi ekran? |
| --- | --- | --- | --- |
| **A. winget komutu** (Windows) | PowerShell'e bir satır yapıştırmaktan rahatsız değilsen | 2 dk | Yok |
| **B. Resmi .exe indirme** (Windows) | Siyah terminal açmak istemiyorsan | 5 dk | Var — adım adım anlatacağız |
| **C. Resmi .dmg indirme** (macOS) | Mac'tesin | 3 dk | Yok, ama sağ tık gerekli |

Birini seçtin mi? Eşleşen bölüme atla. Diğerlerini geç.

## Windows yolu 1 — tek bir winget komutu (önerilen) {#path-winget}

**winget**, Windows'un yerleşik "paket yöneticisi" — temelde komut satırı için bir Microsoft Store. Windows 10 1809'dan beri sisteme dahil. Ekstra bir şey kurman gerekmiyor.

PowerShell'i aç (Başlat menüsünde "PowerShell" ara), bu satırı yapıştır, Enter'a bas:

```powershell
winget install Boy1690.Keeply
```

![PowerShell winget çalıştırıyor — indirme ve kurulum yaklaşık 30 saniyede tamamlanıyor](fig-powershell-winget.svg)

Yaklaşık 30 saniye ve bitti. Mavi ekran yok. "Ek bilgi" küçük yazısı yok.

Bu yol neden bu kadar temiz? Çünkü winget'te listelenmek için bile Keeply'nin [Microsoft'un GitHub üzerindeki resmi incelemesinden](https://github.com/microsoft/winget-pkgs) geçmesi gerekiyor: kurulum kaynağını, dosya imzalarını ve kurulum davranışını kontrol ediyorlar. Her şey geçtikten sonra yayımlanıyor.

Başka türlü söylersek: o komutu çalıştırdığında, Microsoft senin için bir tur inceleme yapmış oluyor. SmartScreen'in kontrolü bu yolda gereksiz, o yüzden hiç çıkmıyor.

Kısa yol ve güven yolu, tek satırda.

## Windows yolu 2 — .exe indir {#path-exe}

PowerShell'e dokunmak istemiyor musun? Tamam. keeply.work'e git, indir'e tıkla, `.exe`'yi al, çift tıkla.

SmartScreen mavi ekranı çıkacak. **Bu normal** ([nedeni için yukarıya bak](#why-smartscreen)). Devam etmek için:

1. **Ek bilgi**'ye tıkla (uyarıdaki küçük altı çizili yazı)
2. **Yine de çalıştır** düğmesi belirir
3. Tıkla. Yükleyici buradan devralıyor.

![Bir kez "Ek bilgi"ye tıkladığında, "Yine de çalıştır" düğmesi "Çalıştırma"nın yanında belirir](fig-smartscreen-run-anyway.svg)

Tüm sapma belki 3 dakika ekler — büyük kısmı psikolojik, gerçek tıklamalar değil. Buradan itibaren bu yol ile 1. yol birleşir.

## macOS kurulumu — atlanamayan sağ tık adımı {#path-macos}

Mac'te mavi ekran yok. Ama ilk açılışta çift tıklayamazsın — [macOS Gatekeeper](https://support.apple.com/en-us/102445) onu engeller.

Doğru akış:

1. `.dmg`'yi indir, Keeply'yi Uygulamalar klasörüne sürükle
2. Uygulamalar'ı aç, Keeply'yi bul
3. **Sağ tık → Aç** (çift tık değil)

   ![macOS Finder sağ tık menüsü, en üstte vurgulanmış "Aç" ile](fig-macos-rightclick.svg)

4. Bir iletişim kutusu çıkar — "Aç"a tıkla

   ![macOS onay iletişim kutusu, "Aç" düğmesi vurgulanmış](fig-gatekeeper-dialog.svg)

İşte bu kadar. **Yalnızca ilk açılış buna ihtiyaç duyar** — sonrasında çift tık normal şekilde çalışır.

İlk seferde neden bu sapma? Gatekeeper, noterlenmiş olarak görmediği herhangi bir uygulama için çift tık başlatmasını engeller. Sağ tık → Aç, Apple'ın "Ne kurduğumu biliyorum, bırak geçeyim" deme yolu.

Bu Keeply'ye özgü bir tuhaflık değil. Makinende daha önce hiç bulunmamış her yeni Mac uygulaması ilk açılışta aynı şekilde davranır.

## Kurulumdan sonra — ilk projeni içine bırak {#first-project}

Kurulu olmak bitti demek değil. İlk projenin aynı gün korunma altında olması — bu bitti demek.

Keeply'yi aç, **Yeni proje**'ye bas, aktif olarak çalıştığın bir klasör seç.

<!-- TODO: gerçek ekran görüntüsü ile değiştir keeply-add-project.png (Keeply "Yeni proje" iletişim kutusu) -->

**İlk olarak ne bırakmalı**: şu an elinde olan, kaybetmeyi göze alamayacağın ve düzenlemeye devam ettiğin her ne ise. Bir teklif, bir sözleşme, bir tasarım dosyası, bir sunum — herhangi biri olur. Altı aydır dokunmadığın bir klasör seçme. O klasörün değeri arşivlemede, korumada değil. Farklı hikaye.

İlk tarama 1 ila 2 dakika sürer. Ondan sonra, Keeply klasörü arka planda izler ve **sen kaydettikçe sürümleri otomatik olarak kaydeder**. Basılacak elle "kontrol noktası" düğmesi yok.

Uydurma ama tipik bir örnek: bir tasarımcı kurulumdan hemen sonra Q2 teklif klasörünü bırakıyor. İlk tarama 2 dakika sürüyor. Üç gün sonra, geçen cumartesi bir logo rengini yanlış değiştirdiğini fark ediyor — geçmişten önceki sürümü çekmek 20 saniye sürüyor.

Kurulum gününde ilk projeyi kullananlar, bir hafta bekleyenlere kıyasla çok daha uzun süre kalıyor.

## Takıldın mı? 5 yaygın hata {#troubleshoot}

| Belirti | Çözüm |
| --- | --- |
| `winget` komutu bulunamadı | Windows'unda henüz App Installer yok demektir. Onun yerine 2. yolu (.exe indir) kullan — boğuşma |
| Win 11 "yönetici gerekiyor" diyor | PowerShell'i **Yönetici olarak çalıştır** ile yeniden aç |
| Mac "tanımlanamayan bir geliştiriciden olduğu için açılamıyor" diyor | Sağ tık → Aç (çift tık değil). Yukarıdaki macOS bölümüne bak |
| Şirket ağı indirmeyi engelliyor | Onun yerine winget komutunu kullan — Microsoft'un CDN'i üzerinden gider ve genellikle geçer |
| Kuruldu ama açılmıyor | Bir kez yeniden başlat. Hâlâ bir şey yok mu? [support@keeply.work](mailto:support@keeply.work) adresine e-posta at |

## Hatırlanacak tek şey

Tek şey:

**Mavi ekran bir karar değil — hâlâ inşa edilen bir itibar.**

Uyarıyı atlamana gerek yok. Sadece uyarının hiç çıkmadığı winget yolunu seçmen gerekiyor.
