---
title: "Why I Built Keeply: Starting from \"Where Did My Files Go?\""
description: "Keeply is built so you can see your files—not so you'll learn to be a dev."
date: 2026-05-06T01:00:00+08:00
draft: false
slug: why-i-built-keeply
locales: [zh-TW, en, zh-CN, ja, ko, it]
categories:
  - Founder note
tags:
  - Keeply
  - Design philosophy
  - Founder
image: cover.svg
og_image: cover.png
role: standalone
template: T6
---

The first early tester opened the NAS folder to look at his files. Inside he saw `objects/`, `pack/`, `HEAD`. None of his design files. He messaged me: "Where did my files go?"

That second I knew what we got wrong.

We picked "backup" as the core concept. In an engineer's head, backup is fine: compressed, encoded, not directly browsable. But to a user, **the opposite of "backup" isn't "no backup," it's "can't find it."** Open a folder and not see your stuff = trust broken. Tech can say it's safe, but if eyes say not safe, it's not safe.

That was Keeply's first turn. It later became formal [ADR-001](https://github.com/boy1690): drop "backup" as the core metaphor, switch to "project location." One word changed, the whole data structure shifted.

## The fork I took

There were two roads. Either teach the user to be a dev (learn that `objects/` is a pack file, `HEAD` is a pointer), or make the tool speak office language ("save version," "version history," "restore").

Teaching users is cheaper. Building a real tool is harder. I chose the latter.

Keeply's [mission](https://github.com/boy1690) became one sentence: "**Let non-technical people manage file versions in office language, with no need to know Git exists.**" The UI doesn't show commit, branch, HEAD, stash—not even as metaphors. Underneath it's a git2 engine, but that's my problem, not yours.

## A mistake I made (one of)

Not every design call is right. Back in April this year I asked a higher-tier model to draft a Free / Team tier differentiation strategy. It came back with 530 lines: 5 use-case quotas, watermark evidence, RFC 3161 timestamps, 5 complex upgrade triggers.

I rejected all of it.

The reasoning: watermarks aren't legal evidence in Taiwan (formal documents are). Multiple folders on one NAS are physically equivalent to multi-vault—a number cap means nothing. RFC 3161 timestamps have no real selling point for Taiwan users (they go to the post office for evidence stamps or to a notary). **Those features serve theory, not real users.**

Now every spec decision goes through three questions: do users want this? Does it have meaning in the actual scenario? Will anyone care if I cut it? Any "no" = don't ship.

## Why I'm writing this

This isn't marketing. It's **transparency**: my reasons for building this tool, the mistakes I've made, the principles I hold.

If you're going to hand a tool 5 to 10 years of client data, design files, contracts—you need to know how the person building it thinks. I can't promise Keeply will always be right, but I can promise: every decision is written down, every mistake gets reframed, every over-engineered idea gets killed.

See you in the next version.

---

> About the author: Ting-Wei Tsao, founder of Keeply.
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
