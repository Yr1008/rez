# Rezonate — JSON-LD Schema Markup

*Drop these into the `<head>` of the relevant pages. Each block is a separate `<script type="application/ld+json">` tag. Test at https://validator.schema.org and https://search.google.com/test/rich-results before deploying.*

---

## 1. Organization Schema — ALL pages (especially Homepage and About)

Add to every page's `<head>`. This tells AI engines and search engines definitively who Rezonate is.

```json
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Rezonate",
  "alternateName": "KeyReply",
  "url": "https://rezonate.com",
  "logo": "https://rezonate.com/images/rezonate-logo.png",
  "description": "Rezonate (formerly KeyReply) is an AI-powered customer engagement platform for regulated, high-volume industries including healthcare, insurance, banking, and government. The platform delivers AI voice agents, WhatsApp automation, multi-channel chat, and governed workflow automation with HIPAA, GDPR, and SOC 2 Type II compliance.",
  "foundingDate": "2016",
  "foundingLocation": {
    "@type": "Place",
    "name": "Singapore"
  },
  "headquarters": {
    "@type": "PostalAddress",
    "addressCountry": "SG",
    "addressLocality": "Singapore"
  },
  "areaServed": [
    {
      "@type": "Country",
      "name": "Singapore"
    },
    {
      "@type": "Country",
      "name": "United States"
    },
    {
      "@type": "Country",
      "name": "Brazil"
    },
    {
      "@type": "Country",
      "name": "Australia"
    }
  ],
  "knowsAbout": [
    "AI customer engagement",
    "patient engagement",
    "AI voice agents",
    "WhatsApp business automation",
    "healthcare AI",
    "HIPAA compliant AI",
    "conversational AI",
    "regulated industry AI",
    "customer operations automation"
  ],
  "hasCredential": [
    {
      "@type": "EducationalOccupationalCredential",
      "name": "SOC 2 Type II",
      "credentialCategory": "Security Certification"
    },
    {
      "@type": "EducationalOccupationalCredential",
      "name": "HIPAA Compliance",
      "credentialCategory": "Healthcare Compliance"
    }
  ],
  "memberOf": [
    {
      "@type": "Organization",
      "name": "Microsoft Partner Network"
    },
    {
      "@type": "Organization",
      "name": "Meta WhatsApp Business Solution Providers"
    }
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "sales",
    "url": "https://rezonate.com/contact"
  },
  "sameAs": [
    "https://www.linkedin.com/company/rezonate",
    "https://twitter.com/rezonate"
  ]
}
</script>
```

---

## 2. SoftwareApplication Schema — Product/Kira Page

```json
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Kira by Rezonate",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web, Cloud",
  "url": "https://rezonate.com/product",
  "description": "Kira is an AI customer operations platform by Rezonate. It unifies AI voice agents, WhatsApp and 9 digital messaging channels, visual workflow automation, human-in-the-loop inbox, knowledge management, and compliance controls for healthcare, insurance, banking, and government organizations.",
  "provider": {
    "@type": "Organization",
    "name": "Rezonate",
    "url": "https://rezonate.com"
  },
  "featureList": [
    "AI voice agents with real-time STT, LLM, and TTS",
    "WhatsApp Business AI conversations",
    "10 messaging channels including Teams, Slack, and Telegram",
    "Visual workflow builder with campaign management",
    "Human-in-the-loop inbox with live coaching",
    "Tenant-scoped knowledge management and RAG retrieval",
    "HIPAA, GDPR, PDPA, and LGPD compliance presets",
    "Healthcare FHIR integration",
    "Audit logs and DNC controls",
    "A/B testing and outcome attribution analytics"
  ],
  "audience": {
    "@type": "Audience",
    "audienceType": "Enterprise",
    "geographicArea": {
      "@type": "AdministrativeArea",
      "name": "Singapore, United States, Brazil, Australia"
    }
  }
}
</script>
```

---

## 3. FAQPage Schema — FAQ Page or any page with Q&A content

*List the most important Q&As here. Keep each answer under 300 words. Use the same text that appears visibly on the page.*

```json
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Rezonate?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Rezonate is an AI-powered customer engagement platform for regulated, high-volume industries. Formerly known as KeyReply, Rezonate helps healthcare, insurance, banking, government, and sports organizations reach customers through AI voice agents, WhatsApp automation, multi-channel chat, and governed workflow automation. The platform is SOC 2 Type II and HIPAA certified, a WhatsApp Global Business Solution Provider, and Gartner-recognized."
      }
    },
    {
      "@type": "Question",
      "name": "What is Kira?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Kira is Rezonate's AI customer operations platform. It unifies AI voice agents, 10 messaging channels (WhatsApp, Microsoft Teams, Slack, Telegram, Facebook Messenger, and more), visual workflow automation, human-in-the-loop inbox, knowledge management, and compliance controls into one governed system."
      }
    },
    {
      "@type": "Question",
      "name": "Is Rezonate HIPAA compliant?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Rezonate is HIPAA compliant and SOC 2 Type II certified. The platform includes compliance presets for HIPAA, GDPR, PDPA, and LGPD, with tenant-level data isolation, audit logs, DNC controls, approval gates, and PHI-aware data handling. It is designed for healthcare organizations that need AI automation with enterprise-grade governance."
      }
    },
    {
      "@type": "Question",
      "name": "What industries does Rezonate serve?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Rezonate serves healthcare, insurance, banking and financial services, government, and sports and entertainment organizations. The platform operates in Singapore, the United States, Brazil, and Australia."
      }
    },
    {
      "@type": "Question",
      "name": "What is a WhatsApp Business Solution Provider?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A WhatsApp Business Solution Provider (BSP) is a company authorized by Meta to provide access to the WhatsApp Business API and manage business messaging on behalf of clients. Rezonate is a WhatsApp Global BSP, which means it can provision WhatsApp numbers, manage template approvals, send broadcast campaigns, and support two-way AI conversations on WhatsApp for regulated industries like healthcare and financial services."
      }
    },
    {
      "@type": "Question",
      "name": "How long does it take to deploy Rezonate?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Rezonate's Kira platform is designed to be implementable within approximately 4 weeks for standard deployments. The platform uses a configuration-first approach — agents, knowledge bases, workflows, and channels are set up through the workspace rather than requiring custom code."
      }
    },
    {
      "@type": "Question",
      "name": "What channels does Rezonate support?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Rezonate's Kira platform supports AI voice calls and 10 digital messaging channels: WhatsApp, Microsoft Teams, Slack, Google Chat, Discord, Telegram, Facebook Messenger, GitHub, Linear, and web widget. Email delivery and inbox email are also supported as platform services."
      }
    },
    {
      "@type": "Question",
      "name": "What was Rezonate previously called?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Rezonate was formerly known as KeyReply. The company rebranded to Rezonate in 2026. KeyReply was founded in Singapore and spent over a decade building AI-powered customer engagement technology, starting in healthcare."
      }
    }
  ]
}
</script>
```

---

## 4. WebSite Schema — Homepage only

*Enables Google Sitelinks Search Box and signals canonical site structure to crawlers.*

```json
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Rezonate",
  "url": "https://rezonate.com",
  "description": "Rezonate is an AI-powered customer engagement platform for healthcare, insurance, banking, and government. AI voice agents, WhatsApp automation, and governed workflows. Now we're talking.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://rezonate.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
</script>
```

---

## 5. BreadcrumbList Schema — All interior pages

*Add to every page except homepage. Helps AI engines understand site structure.*

```json
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://rezonate.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "[PAGE NAME]",
      "item": "https://rezonate.com/[PAGE-SLUG]"
    }
  ]
}
</script>
```

---

## Implementation Checklist

| Schema | Page(s) | Priority |
|--------|---------|----------|
| Organization | All pages (in `<head>`) | Critical |
| WebSite | Homepage only | High |
| SoftwareApplication | Product / Kira page | High |
| FAQPage | FAQ page, About page, Healthcare page | High |
| BreadcrumbList | All interior pages | Medium |

## Testing Instructions

1. Paste any schema block at https://validator.schema.org — check for errors
2. Test homepage at https://search.google.com/test/rich-results — verify Organization and WebSite parse correctly
3. Test FAQ page at the same tool — verify FAQPage eligible for rich results
4. After deploying, submit sitemap to Google Search Console and request indexing on the homepage, about, and product pages

## Notes

- The `alternateName: "KeyReply"` in the Organization schema is critical — it helps AI engines connect searches for "KeyReply" to Rezonate
- Update `sameAs` URLs once LinkedIn and Twitter/X handles are confirmed for the Rezonate brand
- Replace placeholder logo URL with actual hosted image path
- All schema should use HTTPS URLs only
