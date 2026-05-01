---
title: "Cara install Keeply di Windows dan macOS dalam 10 menit"
description: "Lewati cetakan kecil 'Run anyway' dan tebak-menebak — install Keeply dalam sepuluh menit dan lindungi proyek pertamamu di hari yang sama."
date: 2026-04-26
draft: false
tags: ["install", "tutorial", "Windows", "macOS", "winget"]
categories: ["tutorial"]
primary_keyword: "install Keeply"
locales: ["en", "zh-TW", "zh-CN", "ja", "id"]
slug: install-keeply-windows-mac
image: cover.svg
og_image: cover.png
---

> "Aku double-click, layar biru muncul, lalu kupikir itu virus dan langsung kututup."
>
> — Seorang desainer yang baru mendengar Keeply, membalas sore itu juga.

Dia bukan yang pertama. Layar biru di Windows mungkin menghentikan lebih banyak orang daripada yang berhasil install.

Berikut jalur lengkapnya dari awal sampai akhir: **kenapa layar biru muncul → tiga jalur install yang lebih bersih → membuka proyek pertamamu setelahnya**.

## Daftar isi

1. [Kenapa layar biru muncul (ini bukan masalah Keeply)](#why-smartscreen)
2. [Tiga jalur — pilih yang cocok untukmu](#three-paths)
3. [Windows jalur 1: satu perintah winget (direkomendasikan)](#path-winget)
4. [Windows jalur 2: download .exe](#path-exe)
5. [Install macOS: langkah klik kanan yang tidak boleh dilewati](#path-macos)
6. [Setelah install: masukkan proyek pertamamu](#first-project)
7. [Tersangkut? 5 error umum](#troubleshoot)

## Kenapa layar biru muncul (ini bukan masalah Keeply) {#why-smartscreen}

Layar itu namanya [SmartScreen](https://learn.microsoft.com/en-us/windows/security/operating-system-security/virus-and-threat-protection/microsoft-defender-smartscreen/). Ia tidak memutuskan "apakah software ini berbahaya?" — ia memutuskan "apakah cukup banyak orang sudah pakai ini?".

Pikirkan begini: restoran baru tanpa review Google bukan berarti makanannya buruk. Itu hanya makanan yang belum sempat dinilai siapa pun.

SmartScreen memperlakukan software baru dengan cara yang sama. Ia membangun kepercayaan dengan **volume download + waktu**, dan setiap rilis baru melewati periode pengamatan ini lagi. Keeply terkena ini setiap kali merilis update. Tidak ada hubungannya dengan apakah software itu sendiri aman.

Lalu kenapa ini menakutkan orang? Karena layar ini hanya memberimu tombol "Don't run" yang besar. Untuk tetap menjalankannya, kamu harus klik link kecil bernama **More info** di samping. Secara visual ini tidak terbaca sebagai notice — terbaca sebagai dinding.

Tapi kamu tidak perlu menghadapinya. **Keeply dipublikasikan di [winget package repo Microsoft](https://github.com/microsoft/winget-pkgs)**, dan jalur itu sama sekali tidak memicu peringatan.

Jadi intinya bukan bagaimana melewati peringatan. Intinya adalah memilih jalur di mana peringatan tidak pernah muncul.

![Peringatan Windows SmartScreen, dengan link kecil "More info" dilingkari](fig-smartscreen-warning.svg)

## Tiga jalur — pilih yang cocok untukmu {#three-paths}

| Jalur | Cocok kalau kamu | Waktu | Layar biru? |
| --- | --- | --- | --- |
| **A. Perintah winget** (Windows) | tidak keberatan paste satu baris ke PowerShell | 2 menit | Tidak |
| **B. Download .exe resmi** (Windows) | tidak mau buka terminal hitam | 5 menit | Ya — kami pandu kamu |
| **C. Download .dmg resmi** (macOS) | pakai Mac | 3 menit | Tidak, tapi klik kanan diperlukan |

Sudah pilih? Lompat ke bagian yang cocok. Lewati yang lain.

## Windows jalur 1 — satu perintah winget (direkomendasikan) {#path-winget}

**winget** adalah "package manager" bawaan Windows — pada dasarnya Microsoft Store tapi untuk command line. Sudah dipanggang ke Windows sejak versi 10 1809. Kamu tidak perlu install apa pun ekstra.

Buka PowerShell (cari "PowerShell" di Start menu), paste baris ini, tekan Enter:

```powershell
winget install Boy1690.Keeply
```

![PowerShell menjalankan winget — download dan install selesai sekitar 30 detik](fig-powershell-winget.svg)

Sekitar 30 detik dan selesai. Tanpa layar biru. Tanpa cetakan kecil "More info".

Kenapa jalur ini bersih sekali? Karena untuk bisa terdaftar di winget sama sekali, Keeply harus lolos [review resmi Microsoft di GitHub](https://github.com/microsoft/winget-pkgs): mereka mengecek sumber installer, signature file, dan perilaku instalasi. Hanya rilis kalau semuanya lolos.

Dengan kata lain: saat kamu menjalankan perintah itu, Microsoft sudah melakukan satu putaran pengecekan untukmu. Cek SmartScreen redundan di jalur ini, jadi langsung tidak muncul.

Jalur pendek dan jalur kepercayaan, dalam satu baris.

## Windows jalur 2 — download .exe {#path-exe}

Tidak mau menyentuh PowerShell? Oke. Kunjungi keeply.work, klik download, ambil `.exe`, double-click.

Layar biru SmartScreen akan muncul. **Itu normal** ([alasannya, lihat di atas](#why-smartscreen)). Untuk lanjut:

1. Klik **More info** (teks kecil bergaris bawah pada peringatan)
2. Tombol **Run anyway** muncul
3. Klik. Installer mengambil alih dari sana.

![Setelah klik "More info", tombol "Run anyway" muncul di samping "Don't run"](fig-smartscreen-run-anyway.svg)

Detour ini menambah mungkin 3 menit — sebagian besar psikologis, bukan klik aktual. Dari sini, jalur ini dan jalur 1 bertemu.

## Install macOS — langkah klik kanan yang tidak boleh dilewati {#path-macos}

Tidak ada layar biru di Mac. Tapi kamu tidak bisa double-click pada peluncuran pertama — [Gatekeeper macOS](https://support.apple.com/en-us/102445) akan memblokirnya.

Alur yang benar:

1. Download `.dmg`, drag Keeply ke folder Applications-mu
2. Buka Applications, cari Keeply
3. **Klik kanan → Open** (bukan double-click)

   ![Menu klik kanan macOS Finder dengan "Open" diberi highlight di atas](fig-macos-rightclick.svg)

4. Dialog muncul — klik "Open"

   ![Dialog konfirmasi macOS dengan tombol "Open" diberi highlight](fig-gatekeeper-dialog.svg)

Itu saja. **Hanya peluncuran pertama yang butuh ini** — double-click bekerja normal setelahnya.

Kenapa harus detour pertama kali? Gatekeeper memblokir peluncuran double-click untuk app apa pun yang belum pernah dilihatnya ter-notarized. Klik kanan → Open adalah cara Apple bilang "Aku tahu apa yang kuinstall, biarkan aku lewat".

Ini bukan keanehan Keeply. Setiap app Mac baru yang belum pernah ada di mesinmu berperilaku sama pada peluncuran pertama.

## Setelah install — masukkan proyek pertamamu {#first-project}

Sudah install bukan berarti selesai. Proyek pertamamu terlindungi di hari yang sama — itu selesai.

Buka Keeply, klik **New project**, pilih folder yang sedang aktif kamu kerjakan.

<!-- TODO: ganti dengan screenshot asli keeply-add-project.png (dialog "New project" Keeply) -->

**Apa yang dimasukkan dulu**: apa pun yang sedang kamu pegang sekarang yang tidak boleh hilang dan terus kamu edit. Pitch, kontrak, file desain, deck — semuanya cocok. Jangan pilih folder yang belum kamu sentuh enam bulan. Nilai folder itu di pengarsipan, bukan perlindungan. Cerita berbeda.

Scan pertama butuh 1 sampai 2 menit. Setelah itu, Keeply mengawasi folder di latar dan **mencatat versi otomatis saat kamu menyimpan**. Tidak ada tombol "checkpoint" manual untuk ditekan.

Contoh tipikal yang dibuat-buat: seorang desainer memasukkan folder pitch Q2 mereka tepat setelah install. Scan pertama 2 menit. Tiga hari kemudian, mereka sadar Sabtu lalu menukar warna logo dengan salah — menarik versi sebelumnya dari history butuh 20 detik.

Orang yang menggunakan proyek pertama di hari install bertahan jauh lebih lama daripada orang yang menunggu seminggu.

## Tersangkut? 5 error umum {#troubleshoot}

| Gejala | Solusi |
| --- | --- |
| Perintah `winget` tidak ditemukan | Berarti Windows-mu belum punya App Installer. Pakai jalur 2 (download .exe) — jangan dilawan |
| Win 11 bilang "needs administrator" | Buka ulang PowerShell dengan **Run as administrator** |
| Mac bilang "cannot be opened because it is from an unidentified developer" | Klik kanan → Open (bukan double-click). Lihat bagian macOS di atas |
| Jaringan kantor memblokir download | Pakai perintah winget — ia melalui CDN Microsoft dan biasanya tembus |
| Sudah install tapi tidak mau buka | Restart sekali. Masih tidak ada? Email [support@keeply.work](mailto:support@keeply.work) |

## Satu hal untuk diingat

Satu hal:

**Layar biru bukan vonis — itu reputasi yang masih dibangun.**

Kamu tidak perlu melewati peringatan. Kamu hanya perlu mengambil jalur winget di mana peringatan tidak pernah muncul.
