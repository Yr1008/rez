# Agent-readiness — what's in the repo vs what needs infra

Done in this repo (deploy to activate):
- robots.txt, sitemap.xml, llms.txt, llms-full.txt
- vercel.json: HTTP Link headers (llms-txt + sitemap), markdown content negotiation (Accept: text/markdown -> /md/*.md), audio/ogg MIME
- /md/*.md markdown mirrors for all 11 pages
- JSON-LD: Organization (+sameAs), WebSite, SoftwareApplication (solutions), FAQPage (home), BreadcrumbList (interior pages)

Needs infra access (cannot be done from static files):
1. DNS for AI Discovery (DNS-AID): add TXT record at _aid.getrezonate.com -> "v=aid1; llms=https://getrezonate.com/llms.txt"
2. Google Search Console: submit sitemap.xml, request indexing for /, /about, /solutions
3. If Cloudflare fronts the domain: enable "Markdown for Agents" (Speed > Optimization) — the vercel.json rewrites cover it if serving direct from Vercel
