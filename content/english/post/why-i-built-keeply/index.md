---
title: "Why I Built Keeply: For People Who Lose Files in Shared Folders Every Day"
description: "Keeply grew out of shared-folder chaos, not to turn you into a dev."
date: 2026-05-06T01:00:00+08:00
draft: false
slug: why-i-built-keeply
locales: [zh-TW, en, zh-CN, ja, ko, it]
categories: [Founder notes]
tags: []
image: cover.svg
og_image: cover.png
role: standalone
template: T6
image_alt_data: "Founder sketch by a window with handwritten character 創 (create) — the moment that triggered Keeply was watching a colleague lose 6 weeks of CAD work to an unsaved overwrite, realizing existing tools were never designed for non-developers"
---

For the past few years I've worked alongside engineers in the construction industry. Many of them are 50, 60 years old. The computer isn't their most comfortable tool, but the daily blueprints, change orders, and contracts all run through it. The shared folder is where they collaborate: one NAS, a group of people, N versions of files, edits all the time.

I've watched [the chaos play out](/en/post/autocad-wrong-version-crew/) too many times. Designers send a new version to the office. Whoever picks up the email saves it to the NAS but doesn't tell the site. The site supervisor that day is working from last week's drawing. The concrete is already poured, the dimensions are wrong, you have to break it out, re-embed the frame, push the schedule back two days. Nobody did anything wrong. But somebody pays.

## The fork I took

I use git fluently. Software engineers do, there are even paid courses for it. When I find a problem I commit, branch, reset, the tool feels like a second hand.

But the moment I said "try git" to a construction site supervisor, I got back a confused face every time. Git isn't built for them: CLI, merge conflict, HEAD pointer, every concept is a wall in the way. I was stuck in the middle: I used the tool fluently, my customers couldn't, the shared folder kept producing weekly stories of concrete getting broken out.

Teaching them to learn git is cheaper. Building a tool they don't have to learn is harder. I picked the harder one.

## A mistake I made (one of)

The first version of Keeply had too many features. I thought: construction needs this, designers need that, accounting firms will use it too. I wanted to catch every case. The result felt like a Swiss Army knife: every feature was there, but no one used it smoothly.

So I cut. And cut again.

Now every new feature has to pass three questions before it ships in Keeply: will the site actually use this? Will my 60-year-old supervisors open it? Who'll care if I cut it? Any "no" = don't ship. Fewer features isn't a bug. It's a design choice.

## Why I'm writing this

This is about the **founding intent**.

Keeply isn't trying to win the version-control fight against git, SVN, or Mercurial, devs won that one twenty years ago. Keeply is for people who **don't open git** every day but **do open folders** every day: site supervisors, designers, lawyers, accountants, students, freelancers.

If you're one of those people, read [The hidden cost of shared folders](/en/post/hidden-cost-shared-folders/) and you'll get it: you're not bad at organizing files. The tool just pushed the responsibility for organizing them onto your memory.

See you in the next version.

---

> About the author: Ting-Wei Tsao, founder of Keeply.
> [LinkedIn](https://www.linkedin.com/in/ting-wei-tsao-b57480152/)
