---
title: "Cómo instalar Keeply en Windows y macOS en 10 minutos"
description: "Sáltate la letra pequeña del 'Ejecutar de todas formas' y las dudas — instala Keeply en diez minutos y protege tu primer proyecto el mismo día."
date: 2026-04-26
draft: false
tags: ["instalación", "tutorial", "Windows", "macOS", "winget"]
categories: ["tutorial"]
primary_keyword: "instalar Keeply"
locales: ["en", "zh-TW", "zh-CN", "ja", "es"]
slug: install-keeply-windows-mac
image: cover.svg
og_image: cover.png
cta_topic: install
---

> "Hice doble clic, apareció la pantalla azul y supuse que era un virus, así que la cerré."
>
> — Una diseñadora que acababa de oír hablar de Keeply, respondiendo esa misma tarde.

No es la primera. La pantalla azul de Windows probablemente detiene a más gente de la que termina instalando.

Aquí está el camino completo de principio a fin: **por qué aparece la pantalla azul → tres formas más limpias de instalar → abrir tu primer proyecto justo después**.

## Tabla de contenidos

1. [Por qué aparece la pantalla azul (no es un problema de Keeply)](#why-smartscreen)
2. [Tres caminos — elige el que te vaya](#three-paths)
3. [Windows camino 1: un comando winget (recomendado)](#path-winget)
4. [Windows camino 2: descargar el .exe](#path-exe)
5. [Instalación en macOS: el paso del clic derecho que no puedes saltarte](#path-macos)
6. [Después de instalar: arrastra tu primer proyecto](#first-project)
7. [¿Atascado? 5 errores comunes](#troubleshoot)

## Por qué aparece la pantalla azul (no es un problema de Keeply) {#why-smartscreen}

Esa pantalla se llama [SmartScreen](https://learn.microsoft.com/en-us/windows/security/operating-system-security/virus-and-threat-protection/microsoft-defender-smartscreen/). No decide "¿este software es malicioso?" — decide "¿lo ha usado ya suficiente gente?".

Piénsalo así: un restaurante nuevo sin reseñas en Google no es mala comida. Es comida que todavía nadie ha valorado.

SmartScreen trata el software nuevo de la misma manera. Construye confianza con **volumen de descargas + tiempo**, y cada nueva versión pasa otra vez por este período de observación. Keeply choca con esto cada vez que publica una actualización. Nada de esto tiene que ver con si el software en sí es seguro.

¿Entonces por qué asusta a la gente? Porque la pantalla solo te da un botón gigante de "No ejecutar". Para ejecutar de todas formas, tienes que hacer clic en un enlace diminuto llamado **Más información** a un lado. Visualmente no se lee como un aviso — se lee como un muro.

Pero no tienes que lidiar con esto. **Keeply está publicado en el [repositorio de paquetes winget de Microsoft](https://github.com/microsoft/winget-pkgs)**, y ese camino no dispara la advertencia en absoluto.

Así que el punto no es cómo saltarse la advertencia. Es tomar un camino donde la advertencia nunca aparece.

![Advertencia de Windows SmartScreen, con el pequeño enlace "Más información" rodeado](fig-smartscreen-warning.svg)

## Tres caminos — elige el que te vaya {#three-paths}

| Camino | Mejor si tú | Tiempo | ¿Pantalla azul? |
| --- | --- | --- | --- |
| **A. Comando winget** (Windows) | no te importa pegar una línea en PowerShell | 2 min | No |
| **B. Descarga del .exe oficial** (Windows) | no quieres abrir una terminal negra | 5 min | Sí — te lo guiamos |
| **C. Descarga del .dmg oficial** (macOS) | estás en un Mac | 3 min | No, pero hace falta clic derecho |

¿Ya elegiste? Salta a la sección que toca. Sáltate las demás.

## Windows camino 1 — un comando winget (recomendado) {#path-winget}

**winget** es el "gestor de paquetes" integrado de Windows — básicamente una Microsoft Store pero para la línea de comandos. Lleva integrado en Windows desde la versión 10 1809. No necesitas instalar nada extra.

Abre PowerShell (busca "PowerShell" en el menú Inicio), pega esta línea, pulsa Enter:

```powershell
winget install Boy1690.Keeply
```

![PowerShell ejecutando winget — la descarga e instalación se completa en unos 30 segundos](fig-powershell-winget.svg)

Unos 30 segundos y listo. Sin pantalla azul. Sin la letra pequeña de "Más información".

¿Por qué es tan limpio este camino? Porque para estar listado en winget, Keeply tiene que pasar [la revisión oficial de Microsoft en GitHub](https://github.com/microsoft/winget-pkgs): comprueban la fuente del instalador, las firmas de archivo y el comportamiento de instalación. Solo se publica cuando todo pasa.

Dicho de otra forma: cuando ejecutas ese comando, Microsoft ya ha hecho una ronda de verificación por ti. La comprobación de SmartScreen es redundante en este camino, así que simplemente no aparece.

Camino corto y camino de confianza, en una sola línea.

## Windows camino 2 — descargar el .exe {#path-exe}

¿No quieres tocar PowerShell? Vale. Ve a keeply.work, haz clic en descargar, agarra el `.exe`, doble clic.

Aparecerá la pantalla azul de SmartScreen. **Es normal** ([por qué, ver arriba](#why-smartscreen)). Para continuar:

1. Haz clic en **Más información** (el pequeño texto subrayado en la advertencia)
2. Aparece un botón **Ejecutar de todas formas**
3. Haz clic. El instalador toma el control desde ahí.

![Una vez que haces clic en "Más información", aparece el botón "Ejecutar de todas formas" junto a "No ejecutar"](fig-smartscreen-run-anyway.svg)

Todo el rodeo añade quizá 3 minutos — la mayoría psicológico, no clics reales. A partir de aquí, este camino y el camino 1 convergen.

## Instalación en macOS — el paso del clic derecho que no puedes saltarte {#path-macos}

Sin pantalla azul en Mac. Pero no puedes hacer doble clic en el primer arranque — [Gatekeeper de macOS](https://support.apple.com/en-us/102445) lo bloqueará.

Flujo correcto:

1. Descarga el `.dmg`, arrastra Keeply a tu carpeta Aplicaciones
2. Abre Aplicaciones, encuentra Keeply
3. **Clic derecho → Abrir** (no doble clic)

   ![Menú contextual del Finder de macOS con "Abrir" resaltado arriba](fig-macos-rightclick.svg)

4. Aparece un diálogo — haz clic en "Abrir"

   ![Diálogo de confirmación de macOS con el botón "Abrir" resaltado](fig-gatekeeper-dialog.svg)

Eso es. **Solo el primer arranque necesita esto** — el doble clic funciona normalmente después.

¿Por qué el rodeo la primera vez? Gatekeeper bloquea el lanzamiento por doble clic de cualquier app que no haya visto notarizada. Clic derecho → Abrir es la manera de Apple de decir "sé lo que estoy instalando, déjame pasar".

Esto no es una rareza de Keeply. Cualquier app nueva de Mac que no haya estado antes en tu máquina se comporta igual en el primer arranque.

## Después de instalar — arrastra tu primer proyecto {#first-project}

Instalado no es estar listo. Tu primer proyecto protegido el mismo día — eso es estar listo.

Abre Keeply, pulsa **Nuevo proyecto**, elige una carpeta en la que estés trabajando activamente.

<!-- TODO: 替換為真實截圖 keeply-add-project.png（Keeply「新增專案」對話框） -->

**Qué arrastrar primero**: lo que tengas ahora mismo en las manos que no puedes permitirte perder y que sigues editando. Una propuesta, un contrato, un archivo de diseño, una presentación — cualquiera vale. No elijas una carpeta que no has tocado en seis meses. El valor de esa carpeta está en archivar, no en proteger. Otra historia.

El primer escaneo tarda de 1 a 2 minutos. Después de eso, Keeply vigila la carpeta en segundo plano y **registra versiones automáticamente cuando guardas**. Sin botón manual de "punto de control" que pulsar.

Un ejemplo inventado pero típico: una diseñadora arrastra su carpeta de propuesta del Q2 justo después de instalar. El primer escaneo tarda 2 minutos. Tres días después se da cuenta de que cambió mal el color de un logo el sábado pasado — sacar la versión anterior del historial le toma 20 segundos.

Quien usa el primer proyecto el día de la instalación se queda mucho más que quien espera una semana.

## ¿Atascado? 5 errores comunes {#troubleshoot}

| Síntoma | Solución |
| --- | --- |
| Comando `winget` no encontrado | Significa que tu Windows todavía no tiene App Installer. Usa el camino 2 (descarga el .exe) en vez de pelearte con esto |
| Win 11 dice "se requiere administrador" | Vuelve a abrir PowerShell con **Ejecutar como administrador** |
| Mac dice "no se puede abrir porque proviene de un desarrollador no identificado" | Clic derecho → Abrir (no doble clic). Mira la sección de macOS arriba |
| La red de la empresa bloquea la descarga | Usa el comando winget en su lugar — pasa por el CDN de Microsoft y normalmente atraviesa |
| Instalado pero no abre | Reinicia una vez. ¿Sigue sin nada? Escribe a [support@keeply.work](mailto:support@keeply.work) |

## Lo único que hay que recordar

Una sola cosa:

**La pantalla azul no es un veredicto — es reputación todavía construyéndose.**

No necesitas saltarte la advertencia. Solo necesitas tomar el camino de winget donde la advertencia nunca aparece.
