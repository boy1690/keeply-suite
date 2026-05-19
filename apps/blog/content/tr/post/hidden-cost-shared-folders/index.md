---
title: "Paylaşılan klasörlerin sürüm sorunu: yılda 83 saatlik mikropanik vergisi"
description: "Perşembe, 17:30. Plan bitti ama elin dosya adının üzerinde kalakaldı. Aracın savunma yükünü hafızana bırakıyor. Yılda 83 saat, endişeyle ödenen vergi."
slug: "hidden-cost-shared-folders"
date: 2026-04-23
image: cover.svg
og_image: cover.png
categories:
  - Dosya yönetimi
tags:
  - paylaşılan klasörler
  - sürüm kontrolü
  - işbirliği
cta_topic: versioning
---

Perşembe günü saat 17:30. Ofis yavaş yavaş sessizleşiyor. Atriumun planını bitirdin. Zamanında çıkıp düzgün bir akşam yemeği yiyebilirdin. Ama elin farenin üzerinde kaldı, klasöre dik dik bakıyorsun.

İçinde `Floorplan_v6.dwg`, `Floorplan_v7_Client.dwg` ve `Floorplan_v7_FINAL_DOKUNMA.dwg` isimli bir dosya var.

Derin bir nefes alıp sağ tıklıyorsun az önce kaydettiğin dosyaya ve dikkatle ismini `Floorplan_v8_teslim_0423.dwg` olarak değiştiriyorsun. Sonra Slack'i açıyorsun ve karşıdaki meslektaşına yazıyorsun: "Hey, az önce v8'i kaydettim. Cepheyi düzenleyeceksen bunu al. Benimkini üzerine yazma."

Kaydetmiyorsun. Sigorta alıyorsun. Ve bu sigortanın bedeli, her gün yavaş yavaş aşınan odaklanman ve çıkış saatin.

## İçindekiler

- [Görünmez fatura, endişeyle ödenir](#anxious-bill)
- [İsimlendirme kuralları: suçlulukla yazılmış karşılıksız çek](#naming-failure)
- [Sonu gelmeyen bu savunma savaşını bitir](#end-the-war)

---

## Görünmez fatura, endişeyle ödenir {#anxious-bill}

[Asana'nın Anatomy of Work araştırmasına](https://asana.com/resources/why-work-about-work-is-bad) göre, yılda 83 saati bu "savunma eylemlerine" harcıyoruz. Ama 83 saat sadece soğuk bir sayı. O duyguyu anlatmıyor.

Gerçek maliyet, **bir türlü geçmeyen mikropanik**.
Müteahhide çizim gönderdikten sonraki o an, omurganızdan bir ürperti geçer ve koşarak klasörü yeniden açarsınız: "Dur bir dakika, az önce gönderdiğim `v7_FINAL` miydi yoksa `v7_gerçek_son` muydu?"
Patron "son sürüm bu mu?" diye sorduğunda hemen evet diyemezsin. "Bir kontrol edeyim" deyip sonra sonek ormanında bulmaca oyununa başlarsın.

Bu bir yönetim başarısızlığı değil. Sen ya da ekibin tembel değilsiniz. Araçlarınız, işinizi koruma sorumluluğunun tamamını kırılgan hafızanıza yüklüyor.

---

## İsimlendirme kuralları: suçlulukla yazılmış karşılıksız çek {#naming-failure}

Bir çizim üzerine yazıldığında, ofis "klasör temizlik kampanyası" başlatır ve herkesten `tarih_proje_sürüm_isim` gibi askeri bir kurala sıkıca uymasını ister.

İlk iki hafta herkes dikkatlidir. Altıncı haftada teslim baskısıyla koşan biri öylece `_YENİ` ekler. Üç ay sonra klasör yine çöplüğe dönmüştür. O dağınık isimlere bakarken, sanki ekibi yönetememişsin gibi hafif bir suçluluk bile hissedersin.

Kendini kandırma. Bu insan doğasına aykırı. Kafan tesisat, yönetmelik kontrolü ve tasarım değişiklikleriyle doluyken, elin üzerine yazılma korkusuyla içgüdüsel olarak `_FINAL` yazar.

---

## Sonu gelmeyen bu savunma savaşını bitir {#end-the-war}

Yarın sabah klasörü açtığını düşün. İçinde sadece tertemiz bir `Floorplan.dwg` var.

Açarsın, düzenlersin, kaydedersin, kapatırsın. Tereddüt yok. İsim değiştirme yok. Masaüstüne yedek yok. Grup sohbetine duyuru yok. Çünkü altındaki sistem her değişikliği sessizce hatırladı. Alt yüklenici yanlışlıkla dünkü tasarımının üzerine yazarsa paniğe gerek yok. İki tık. Üç saniye. Her şey yerine döner.

Bu sihir değil. Yazılım mühendisleri on yıllardır Git ile bu huzurun tadını çıkarıyor. Ama inşaat, mimarlık ve tasarımda hâlâ felakete karşı savaşmak için `_v7` yazıyoruz.

Bu yıllık 83 saatlik savunma vergisini çok yıldır ödüyorsun. Bir daha ki sefer elin `_v8` yazmaya uzandığında dur ve kendine sor:

**Tasarım mı yapıyorum, yoksa dosya bekçiliği mi?**

---

O perşembe 17:30, dosya adının üzerinde asılı kalan eli hatırlıyor musun? Artık dosya bekçiliği yapmana gerek yok. **Keeply senin dosya koruyucu meleğin**, her değişikliği senin yerine hatırlar ve sürüm geçmişini mevcut klasörlerine getirir. Göç yok. Öğrenilecek yeni araç yok.

[Koruyucu meleğinle tanış →](https://keeply.work)

---

## Kaynaklar

- [Asana, Why Work About Work Is Bad / Anatomy of Work](https://asana.com/resources/why-work-about-work-is-bad)
- Ek okumalar: [IDC, The High Cost of Not Finding Information (2012)](https://computhink.com/wp-content/uploads/2015/10/IDC20on20The20High20Cost20Of20Not20Finding20Information.pdf) · [McKinsey Global Institute, The Social Economy (2012)](https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/the-social-economy)
