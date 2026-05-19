---
title: "Dosya sürüm yönetimi: herkes neden kendi adlandırma kuralını icat eder?"
description: "Paylaşımlı klasörler, Dropbox ve NAS sürücüleri dosya geçmişini yönetmek için tasarlanmadı. 4 yapısal boşlukları var ve her biri bu işi sana bırakıyor."
slug: file-version-management-complete-guide
date: 2026-04-28T09:00:00+08:00
draft: false
categories:
  - Dosya sürüm yönetimi
tags:
  - dosya sürüm yönetimi
  - paylaşımlı klasörler
  - Dropbox
  - NAS
  - bilgi çalışanları
image: cover.svg
og_image: cover.png
cta_topic: versioning
---

> Sorun senin disiplinsizliğin değil. Kullandığın araç bu iş için tasarlanmamış.

Üç farklı kişiyi düşün.

**Kişi A** serbest bir tasarımcı. Masaüstünde `_v3_final_FINAL.psd` var.
**Kişi B** bir hukuk bürosunda çalışıyor. Bilgisayarında `sozlesme_v7_musterikopya_2025-04-15.docx` var.
Bu yazıyı okuyan **sen** ise muhtemelen şu an `tez_bolum3_hoca_sonrasi_gercekten_son_v2.docx` adlı dosyaya bakıyorsun.

Farklı meslekler. Farklı dosya adları. **Aynı belirti**.

OCD'li oldukları için değil. Çünkü bunu yapmazsan **dosyaların bir rezalete dönüyor**. NAS'ta silinmiş bir şey, geri getirilemiyor. O yüzden sonunda bir `eski/` klasörü açıyor, tüm geçmiş değişiklikleri oraya park ediyorsun.

![Three filenames side by side — Kişi A's .psd / Kişi B's .docx / you-the-reader's thesis.docx. Caption: Farklı meslekler](image-1.svg)

---

**Özet**: Paylaşımlı klasörler, Dropbox ve NAS sürücüleri **dosya geçmişini yönetmek için tasarlanmadı**. 4 yapısal boşlukları var ve her biri bu işi sana bırakıyor. Bu yazı her birini tek tek açıklıyor — ve Keeply'nin hangilerini çözüp hangilerini çözmediğini dürüstçe söylüyor.

## Yazı haritası

1. ["Önceki sürüm" düğmesi hiç var olmadı](#reason-1)
2. [30 günlük sürüm geçmişinin koşulları var](#reason-2)
3. [Sürüm geçmişi sana "ne zaman"ı söyler, "neden"i değil](#reason-3)
4. [Adlandırma kuralları hafızayı insanların sırtına yükler](#reason-4)
5. [Keeply'nin cevap olmadığı durumlar](#limitations)

---

## 1. "Önceki sürüm" düğmesi hiç var olmadı {#reason-1}

Dünkü tasarım dosyasının eski halini arıyorsun.

Dropbox'ı veya Google Drive'ı açıyorsun — her şey en son haliyle duruyor. Sürüm geçmişi üç menü derinliğinde. Biri sana söylemediyse bulamıyorsun.

![Dropbox ve Google Drive: sürüm geçmişi her ikisinde de üç menü derinliğinde gizli](image-2.svg)

Şirket NAS'ını açıyorsun — orada duran o karmaşık sürüm numaraları *zaten* senin sürüm geçmişin.

![NAS folder screenshot. `_v2.psd` / `_v3.psd` / `_v3_final.psd` / `_v3_final_real.psd` / `_v3_finalfinal.psd` lined up. C](image-4.svg)

**Bu araçlar dosya geçmişini yönetmek için tasarlanmadı**.

Bulut sürücülerinin önceliği, dosyalarının üç farklı cihazda aynı görünmesini sağlamak.
Bu hedef, "tüm eski sürümleri sakla" ile çelişiyor.

Araçlar senkronizasyonu seçti. **Değişikliklerin zaman çizelgesini sana göstermiyor**.

> 2015 yılında, UCSD'de dilbilim doktora öğrencisi Will Styler tez dosyalarını kaybetti. 7 farklı yedek planı vardı. Her biri başarısız oldu. Sonradan bu deneyimi diğer öğrenciler için yazdı. Son cümle şuydu: "Fazlalık aptallığı engellemez." [Olayın tamamı](https://wstyler.ucsd.edu/posts/lost_dissertation_files.html)

→ İlgili: [Tek bir bilgisayardaki yüksek lisans tezi: kimsenin seni uyarmadığı kumar](/en/post/thesis-single-point-of-failure/)

---

## 2. 30 günlük sürüm geçmişinin koşulları var {#reason-2}

Tamam. Dropbox'ın gerçekten sürüm geçmişi olduğunu öğrendin. Rahatladın mı?

Dur, daha bitmedi. Sıradaki kötü haber geliyor: **30 günlük sınır**.

![Dropbox official version-history docs screenshot. Circle the Basic / Plus / Family: 30 days / Professional: 180 days / ](image-5.svg)

Günlük hayata çevirirsek: geçen çeyrekten bir müşteri brifingi arıyorsun. Kurumsal pakete para ödemiyorsan, **o dosya artık mevcut değil**.

30 günlük sınır bir teknik kısıt değil, ticari bir karar — sürüm geçmişi yükseltme için bir neden haline getirilmiş.
(Keeply'de dosya geçmişin sonsuza kadar ücretsiz.)

> Nisan 2026, Hacker News. julianozen kullanıcısı şunu paylaştı: babasının 2 yıldır dokunmadığı bir dosyanın üzerine yazmış. İki gün sonra geri almak istediler — mümkün olmadı. Dropbox'ın açıklaması: 30 günlük saklama süresinin dışında. julianozen'in tepkisi: "Bu 30 günlük geçmişin tanımı bu değil." lazide adlı kullanıcı ekledi: "Bu tam bir saçmalık." [Tam tartışma](https://news.ycombinator.com/item?id=47772260)

30 günlük pencere "dün yanlışlıkla dosyamın üzerine yazdım" senaryosu için tasarlandı.
"Müşterim gelecek hafta geçen çeyreğin sunumunu istiyor" senaryosu için — **yanlış aracı kullanmak seni istediğin yere götürmüyor**.

→ İlgili: [Paylaşımlı klasörlerin gizli maliyeti](/en/post/hidden-cost-shared-folders/)

---

## 3. Sürüm geçmişi sana "ne zaman"ı söyler, "neden"i değil {#reason-3}

Diyelim ki ilk iki sorunu çözdün: geçmiş açık, 30 gün yeterli.
Daha derin bir sorun seni bekliyor.

Sürüm geçmişi "2025-04-15 14:23'te değiştirildi" diyor.
**14:23'te ne değiştiğini söylemiyor. Neden değiştiğini de söylemiyor.**

![Side-by-side compare. Left: current version UI (just date + user). Right: what it should look like with a why this ch](image-6.svg)

Bazı işler için bu sorun değil. Bazıları için ölümcül:

- **Tasarımcı** bir katmanın opaklığını %30 olarak değiştirdi. Geçmiş "değiştirildi" diyor. Hangi katman olduğunu söylemiyor.
- **Avukat** bir sözleşme maddesini "gerekir"den "edebilir"e çevirdi. Tek kelime. Geçmiş "değiştirildi" diyor. Hangi kelime olduğunu söylemiyor.
- **Yüksek lisans öğrencisi** "bu argümanın sınırlılıkları var" ifadesini "bu argüman açıkça doğru" olarak değiştirdi — ihtiyatlıdan iddialıya. Geçmiş "değiştirildi" diyor. Anlamın tersine döndüğünü söylemiyor.

> Ocak 2025, Legal Cheek anonim bir avukat hikayesi yayımladı: "Stajyerken yanlış vasiyetnameyi yanlış vefat edenin ailesine gönderdim." Felaket "sürüm kaydedilmedi" değildi — "hangi sürümün güncel olduğunu bilmiyordum" idi. [Tam hikaye](https://www.legalcheek.com/2025/01/courtroom-etiquette-email-blunders-and-document-mix-ups-lawyers-share-their-most-embarrassing-mistakes/)

İşte herkesin yanıldığı nokta burada.

**Yedekleme dosyayı saklamak demek.**
**Sürüm yönetimi ise dosyayı saklamak *artı* neyi neden değiştirdiğini kaydetmek demek.**

**Yedekleme sana birincisini veriyor. Yönetim ikincisini.**

O yüzden niyeti dosya adına sıkıştırmaya başlıyorsun: `sozlesme_v7_musteri_istegine_gore_madde3.docx`.
Dosya adı yetmiyor, bir elektronik tablo açıyorsun. Tablo yetişemiyor, bir Slack kanalı başlatıyorsun.
**Sonunda "sürüm yönetim sistemin" dosya adları + elektronik tablo + Slack + hafızan oluyor**. Herhangi bir parça çöktüğünde bütün sistem kayıyor.
Üç ay sonra kayıtlarını açtığında kendi geçmiş alışkanlıklarının şimdikilerle örtüşmediğini görüyorsun.

---

## 4. Adlandırma kuralları hafızayı insanların sırtına yükler {#reason-4}

Yukarıdaki üç sorunu yaşayan her şirket aynı şeyi yapıyor — **14 sayfalık bir adlandırma kuralı PDF'i yazıyor**.

Genellikle şöyle görünür:

```text
[YYYY-MM-DD]_[ProjeKodu]_[BelgeTipi]_[Durum]_[Yazar].uzanti
```

Çok düzenli.

![Two side by side. Left: page 1 of the naming convention PDF, neat and structured. Right: a real coworker's desktop scree](image-7.svg)

Altı ay sonra kimse uymuyor. Tanıdık geliyor, değil mi?

İş arkadaşların tembel olduğu için değil.
**Kontrol edilemez bir gruba kural uygulamaya çalışıyoruz — bu deneyin nasıl sonuçlanacağı başından belli.**

> Asana forumu, Haziran 2023, "efsanevi dosya adlandırma felaketi" başlıklı tartışma. Becky_Caday: "Aynı dosyanın birden fazla versiyonu, çünkü biri orijinal dosyayı açıp düzenleyebildiğini bilmiyordu — sadece bir kelimeyi büyük harfe çevirdi. `Liste 2.0` `LİSTE 2.0` oldu." Arndt_Dienstbier: "Boşluk karakterini sürüm için kullanıyorlardı" (birden fazla `Belge.docx`, yalnızca sondaki boşluk sayısıyla ayrışıyordu). [Tam tartışma](https://forum.asana.com/t/share-your-epic-file-naming-fails-and-lets-laugh-together/462366)

Her ekip üyesi, her kayıtta, kuralı hatırlamak + uygulamak + zamanı olduğunda buna uymak zorunda. Bunlardan biri başarısız olduğunda, **tebrikler — bir rezalet daha**.

Adlandırma kuralını hatırlamak **bir aracın yapması gereken iş**.
Her bireyin disiplinine bırakılacak bir şey değil.

→ İlgili: [AutoCAD ekibi yanlış sürümü yüklediğinde ne olur](/en/post/autocad-wrong-version-crew/)

---

## 5. Keeply'nin cevap olmadığı durumlar {#limitations}

Keeply'yi bu 4 yapısal boşluğu doldurmak için inşa ettik.
Ama **Keeply'nin cevap olmadığı** senaryolar da var:

- **Canlı işbirlikçi toplantı notları** → Notion / Google Docs kullan. Keeply, bireyler ve küçük ekipler için uzun vadeli sürüm hafızasıdır, gerçek zamanlı işbirlik aracı değil.
- **50 GB+ video içeriği** → Frame.io / PostHaste kullan. Keeply'nin sürüm mantığı (her kayıtta yalnızca değişiklikleri kaydeder) büyük ikili dosyalar için ekonomik değil.
- **Kurumlar arası hukuki imza süreçleri** → DocuSign / Adobe Sign kullan. Sözleşme 10 farklı hukuk bürosuna gidiyorsa, Keeply o uyumluluk çerçevesinin içinde değil.

Diğer %80'lik bilgi çalışanı senaryoları için — **tasarımcılar, hukuk bürosu içi paralegal'lar, muhasebeciler, yüksek lisans öğrencileri, PM ekipleri, serbest çalışanlar** — o 4 yapısal boşluk seni vuracak.
Bizim çözmek istediğimiz yer orası.

---

Açılıştaki soruya dönelim: paylaşımlı klasör kullanan herkes neden kendi adlandırma kuralını icat ediyor?

Çünkü **gerçekte istedikleri şey temiz bir yapıydı; yanlış bilgiyle karar vermemek istiyorlardı**.
O yüzden sürümleri dosya adlarına, elektronik tablolara, hafızaya gömdüler.
Ve her seferinde bir rezalet daha eklendi klasöre.

Kurumsal hafızayı insanların disiplinine bırakmak, **sonucu baştan belli olan bir tasarım**.

**Asıl soru adlandırma kuralını daha iyi nasıl uygularsın değil.
Kullandığın aracın bu işi senin yerine yapıp yapmadığı.**

---

> Yazar hakkında: [Kurucu Gerçek Adı], Keeply kurucusu.
> LinkedIn (Touch 4 doldur) ｜ X (Touch 4 doldur)
