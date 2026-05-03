---
title: "Como instalar o Keeply no Windows e no macOS em 10 minutos"
description: "Pule a letra miúda do 'Executar mesmo assim' e a adivinhação — instale o Keeply em dez minutos e proteja seu primeiro projeto no mesmo dia."
date: 2026-04-26
draft: false
tags: ["instalação", "tutorial", "Windows", "macOS", "winget"]
categories: ["tutorial"]
primary_keyword: "instalar Keeply"
locales: ["en", "zh-TW", "zh-CN", "ja", "pt"]
slug: install-keeply-windows-mac
image: cover.svg
og_image: cover.png
cta_topic: install
---

> "Cliquei duas vezes, apareceu a tela azul, e eu achei que era vírus e fechei."
>
> — Um designer que tinha acabado de ouvir falar do Keeply, respondendo na mesma tarde.

Ele não é o primeiro. A tela azul no Windows provavelmente faz mais gente desistir do que conseguir terminar a instalação.

Aqui está o caminho inteiro do começo ao fim: **por que a tela azul aparece → três caminhos mais limpos para instalar → abrir seu primeiro projeto logo em seguida**.

## Sumário

1. [Por que a tela azul aparece (não é problema do Keeply)](#why-smartscreen)
2. [Três caminhos — escolha o que se encaixa para você](#three-paths)
3. [Windows caminho 1: um comando winget (recomendado)](#path-winget)
4. [Windows caminho 2: baixar o .exe](#path-exe)
5. [Instalação no macOS: o passo do clique com botão direito que você não pode pular](#path-macos)
6. [Depois de instalar: jogue dentro seu primeiro projeto](#first-project)
7. [Travou? 5 erros comuns](#troubleshoot)

## Por que a tela azul aparece (não é problema do Keeply) {#why-smartscreen}

Essa tela se chama [SmartScreen](https://learn.microsoft.com/en-us/windows/security/operating-system-security/virus-and-threat-protection/microsoft-defender-smartscreen/). Ela não decide "esse software é malicioso?" — ela decide "será que gente suficiente já usou isso?".

Pense assim: um restaurante novo sem nenhuma avaliação no Google não é comida ruim. É só comida que ninguém avaliou ainda.

O SmartScreen trata software novo da mesma forma. Ele constrói confiança com **volume de download + tempo**, e cada nova versão passa por esse período de observação de novo. O Keeply bate nisso toda vez que sai uma atualização. Nada disso tem a ver com o software ser seguro ou não.

Então por que isso assusta as pessoas? Porque a tela só te dá um botão gigante de "Não executar". Para executar mesmo assim, você tem que clicar num link minúsculo chamado **Mais informações** lá no canto. Visualmente não parece um aviso — parece um muro.

Mas você não precisa lidar com isso. **O Keeply está publicado no [repositório de pacotes winget da Microsoft](https://github.com/microsoft/winget-pkgs)**, e esse caminho não dispara o aviso.

Então o ponto não é como contornar o aviso. É como pegar um caminho onde o aviso nunca aparece.

![Aviso do Windows SmartScreen, com o pequeno link "Mais informações" circulado](fig-smartscreen-warning.svg)

## Três caminhos — escolha o que se encaixa para você {#three-paths}

| Caminho | Melhor se você | Tempo | Tela azul? |
| --- | --- | --- | --- |
| **A. Comando winget** (Windows) | não se importa de colar uma linha no PowerShell | 2 min | Não |
| **B. Download oficial do .exe** (Windows) | não quer abrir um terminal preto | 5 min | Sim — vamos te guiar por ela |
| **C. Download oficial do .dmg** (macOS) | está num Mac | 3 min | Não, mas precisa de clique com botão direito |

Já escolheu? Pule para a seção correspondente. Pule as outras.

## Windows caminho 1 — um comando winget (recomendado) {#path-winget}

O **winget** é o "gerenciador de pacotes" embutido do Windows — basicamente uma Microsoft Store, só que para a linha de comando. Já vem incorporado no Windows desde a versão 10 1809. Você não precisa instalar nada extra.

Abra o PowerShell (busque "PowerShell" no menu Iniciar), cole esta linha, aperte Enter:

```powershell
winget install Boy1690.Keeply
```

![PowerShell rodando winget — download e instalação completos em cerca de 30 segundos](fig-powershell-winget.svg)

Cerca de 30 segundos e está pronto. Sem tela azul. Sem letra miúda de "Mais informações".

Por que esse caminho é tão limpo? Porque para estar listado no winget, o Keeply tem que passar pela [revisão oficial da Microsoft no GitHub](https://github.com/microsoft/winget-pkgs): eles checam a fonte do instalador, assinaturas de arquivo e comportamento de instalação. Só sai depois que tudo passa.

Em outras palavras: quando você roda esse comando, a Microsoft já fez uma rodada de verificação para você. A checagem do SmartScreen é redundante nesse caminho, então simplesmente não aparece.

Caminho curto e caminho de confiança, em uma linha só.

## Windows caminho 2 — baixar o .exe {#path-exe}

Não quer encostar no PowerShell? Tudo bem. Vá no keeply.work, clique em download, pegue o `.exe`, dê dois cliques.

A tela azul do SmartScreen vai aparecer. **Isso é normal** ([por quê, veja acima](#why-smartscreen)). Para prosseguir:

1. Clique em **Mais informações** (o pequeno texto sublinhado no aviso)
2. Aparece um botão **Executar mesmo assim**
3. Clique nele. O instalador toma conta dali em diante.

![Quando você clica em "Mais informações", o botão "Executar mesmo assim" aparece ao lado de "Não executar"](fig-smartscreen-run-anyway.svg)

O desvio inteiro adiciona talvez 3 minutos — a maior parte é psicológica, não cliques de fato. Daqui em diante, esse caminho e o caminho 1 convergem.

## Instalação no macOS — o passo do clique com botão direito que você não pode pular {#path-macos}

Sem tela azul no Mac. Mas você não consegue dar dois cliques no primeiro lançamento — o [Gatekeeper do macOS](https://support.apple.com/en-us/102445) vai bloquear.

Fluxo correto:

1. Baixe o `.dmg`, arraste o Keeply para a pasta Aplicativos
2. Abra Aplicativos, ache o Keeply
3. **Clique com o botão direito → Abrir** (não dois cliques)

   ![Menu de clique direito do Finder no macOS com "Abrir" destacado no topo](fig-macos-rightclick.svg)

4. Aparece um diálogo — clique em "Abrir"

   ![Diálogo de confirmação do macOS com o botão "Abrir" destacado](fig-gatekeeper-dialog.svg)

É só isso. **Só o primeiro lançamento precisa disso** — dois cliques funcionam normalmente depois.

Por que o desvio na primeira vez? O Gatekeeper bloqueia o lançamento via dois cliques de qualquer app que ele ainda não viu notarizado. Clique direito → Abrir é o jeito da Apple de dizer "Eu sei o que estou instalando, me deixa passar".

Isso não é uma esquisitice do Keeply. Todo app novo de Mac que ainda não esteve na sua máquina se comporta da mesma forma no primeiro lançamento.

## Depois de instalar — jogue dentro seu primeiro projeto {#first-project}

Instalado não é pronto. Seu primeiro projeto sendo protegido no mesmo dia — isso é pronto.

Abra o Keeply, clique em **Novo projeto**, escolha uma pasta em que você está trabalhando ativamente.

<!-- TODO: substituir por screenshot real keeply-add-project.png (caixa de diálogo "Novo projeto" do Keeply) -->

**O que jogar dentro primeiro**: o que você está com a mão agora que não pode perder e que continua editando. Uma proposta, um contrato, um arquivo de design, um deck — qualquer um serve. Não escolha uma pasta que você não toca há seis meses. O valor daquela pasta está em arquivar, não em proteger. Outra história.

A primeira varredura leva 1 a 2 minutos. Depois disso, o Keeply fica de olho na pasta em segundo plano e **registra versões automaticamente conforme você salva**. Sem botão de "ponto de verificação" para apertar manualmente.

Um exemplo inventado mas típico: uma designer joga dentro a pasta da proposta do Q2 logo depois de instalar. A primeira varredura leva 2 minutos. Três dias depois, ela percebe que trocou a cor do logo errado no sábado passado — puxar a versão anterior do histórico leva 20 segundos.

Pessoas que usam o primeiro projeto no dia da instalação ficam por muito mais tempo do que pessoas que esperam uma semana.

## Travou? 5 erros comuns {#troubleshoot}

| Sintoma | Solução |
| --- | --- |
| Comando `winget` não encontrado | Significa que seu Windows ainda não tem o App Installer. Use o caminho 2 (baixar o .exe) — não brigue contra |
| Win 11 diz "precisa de administrador" | Reabra o PowerShell com **Executar como administrador** |
| Mac diz "não pode ser aberto porque é de um desenvolvedor não identificado" | Clique direito → Abrir (não dois cliques). Veja a seção macOS acima |
| Rede da empresa bloqueia o download | Use o comando winget — ele passa pelo CDN da Microsoft e geralmente atravessa |
| Instalou mas não abre | Reinicie uma vez. Ainda nada? Mande e-mail para [support@keeply.work](mailto:support@keeply.work) |

## A única coisa para lembrar

Uma coisa:

**A tela azul não é um veredito — é reputação ainda sendo construída.**

Você não precisa contornar o aviso. Você só precisa pegar o caminho do winget, onde o aviso nunca aparece.
