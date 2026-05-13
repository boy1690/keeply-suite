# Handoff: Schema.org JSON-LD for `keeply.work` main site

> Created 2026-05-13 during cross-repo SEO audit. This file lives in
> keeply-blog repo (where SEO audits run) but the **work belongs in**
> `keeply-website` repo. CLAUDE.md P0 cross-repo boundary forbids
> writing to that repo from here — this is a spec / suggested
> implementation, not a PR.

## Why this matters

The 2026 SEO checklist treats Schema.org JSON-LD as a hard
prerequisite for AI Overview / SGE / Perplexity / ChatGPT Search
entity recognition. The blog already ships full schema:

- `BlogPosting` per article
- `BreadcrumbList`, `FAQPage`, `Organization`, `Person`, `ImageObject`,
  `WebPage`

The main site landing page (`https://keeply.work/`) has **zero**
JSON-LD. That's the only gap on otherwise-strong SEO infrastructure.

Audit command used:

```bash
curl -s https://keeply.work/ | grep -oE '"@type":"[A-Za-z]+"' | sort -u
# (empty output = no JSON-LD present)
```

## What to add

### Required pieces

1. **Organization** on every page (most critical for entity SEO)
2. **WebSite** on landing page (enables sitelinks search box)
3. **SoftwareApplication** on landing page (product is a desktop app)
4. **BreadcrumbList** on subpages (already present? worth verifying)

### Suggested JSON-LD (drop into `<head>` of every page)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://keeply.work/#org",
      "name": "Keeply",
      "url": "https://keeply.work/",
      "logo": "https://keeply.work/logo.svg",
      "sameAs": [
        "https://github.com/boy1690",
        "https://blog.keeply.work/"
      ],
      "founder": {
        "@type": "Person",
        "name": "Tsao Ting Wei",
        "alternateName": "曹庭維",
        "jobTitle": "Founder",
        "url": "https://github.com/boy1690"
      },
      "description": "File management software for project management teams. Built-in version history, multi-location storage (3-2-1 compliant), and multi-repo Release."
    },
    {
      "@type": "WebSite",
      "@id": "https://keeply.work/#site",
      "url": "https://keeply.work/",
      "name": "Keeply",
      "publisher": { "@id": "https://keeply.work/#org" },
      "inLanguage": "en"
    },
    {
      "@type": "SoftwareApplication",
      "name": "Keeply",
      "applicationCategory": "ProductivityApplication",
      "operatingSystem": "Windows, macOS",
      "url": "https://keeply.work/",
      "image": "https://keeply.work/og-image.png",
      "publisher": { "@id": "https://keeply.work/#org" },
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "description": "Your file history guardian. Built-in version history, 3-2-1 multi-location storage, multi-repo Release — no git terminology required."
    }
  ]
}
</script>
```

Adjust `founder` / `sameAs` / pricing fields based on what the
website team prefers to expose.

### Per-locale variant

`keeply.work` is multilingual (19 locales like the blog). Each locale
should have its own JSON-LD with the locale-specific `description` and
`inLanguage` value. Mirror the blog's pattern.

## Verification

After deploy:

```bash
# Should show all three @types
curl -s https://keeply.work/ | grep -oE '"@type":"[A-Za-z]+"' | sort -u
# expected: Organization, SoftwareApplication, WebSite, plus Person inside Organization
```

Or paste the page URL into Google's [Rich Results Test](https://search.google.com/test/rich-results)
— should detect Organization + SoftwareApplication.

## Effort estimate

~30 min for one engineer who knows the keeply-website Hugo/Astro/Next
templates. The JSON-LD goes into the head partial alongside whatever
meta tags already live there.

## Why this is here, not in keeply-website

`d:\tools\doing\keeply-blog\CLAUDE.md` P0 cross-repo boundary:

> 本 repo（`d:\tools\doing\keeply-blog\`）**只能寫自己**。三個外部 repo
> 一律 OFF-LIMITS … `d:\tools\doing\keeply-website\` keeply.work
> 主站 — **絕對禁寫**。

So this spec sits in the blog repo (where it surfaced) and waits for
the keeply-website maintainer to action.

## Status

- [ ] Spec reviewed by keeply-website maintainer
- [ ] JSON-LD merged in keeply-website head partial
- [ ] Verified via Rich Results Test on production URL
- [ ] (Optional) Per-locale `description` + `inLanguage` filled in
