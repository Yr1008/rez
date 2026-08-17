import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const distDir = resolve(process.argv[2] || "dist");
const headers = await readFile(join(distDir, "_headers"), "utf8");
const policyLine = headers.split("\n").find((line) => line.trim().startsWith("Content-Security-Policy:"));

if (!policyLine) throw new Error("Content-Security-Policy header is missing");

const policy = policyLine.slice(policyLine.indexOf(":") + 1).trim();

function parsePolicy(value) {
  return new Map(value.split(";").map((entry) => {
    const [name, ...sources] = entry.trim().split(/\s+/);
    return [name, sources];
  }));
}

const directives = parsePolicy(policy);

function requireDirective(name, expected) {
  const actual = directives.get(name);
  if (!actual) throw new Error(`CSP directive is missing: ${name}`);
  if (expected && actual.join(" ") !== expected) {
    throw new Error(`${name} must be ${expected}; received ${actual.join(" ")}`);
  }
  return actual;
}

for (const name of ["default-src", "base-uri", "object-src", "frame-ancestors", "script-src", "style-src", "img-src", "connect-src", "form-action"]) {
  requireDirective(name);
}
requireDirective("script-src-attr", "'none'");
requireDirective("style-src-attr", "'none'");
requireDirective("form-action", "'self'");
requireDirective("frame-src", "'self'");

if (/['"]unsafe-(?:inline|eval)['"]/.test(policy)) {
  throw new Error("CSP must not permit unsafe-inline or unsafe-eval");
}

for (const name of ["img-src", "connect-src"]) {
  for (const source of requireDirective(name)) {
    if (source === "https:" || source === "wss:" || source.includes("*")) {
      throw new Error(`${name} contains a broad source: ${source}`);
    }
  }
}

if (/hsforms|hubspot|hubapi|recaptcha/i.test(policy)) {
  throw new Error("Site CSP must not grant HubSpot or reCAPTCHA access");
}

const embedPolicyMatch = headers.match(/(?:^|\n)\/embed\/\*\n\s+Content-Security-Policy:\s*([^\n]+)/);
if (!embedPolicyMatch) throw new Error("CSP policy for /embed/* is missing");
const embedPolicy = embedPolicyMatch[1].trim();
const embedDirectives = parsePolicy(embedPolicy);
const embedExpected = new Map([
  ["default-src", "'none'"],
  ["base-uri", "'none'"],
  ["object-src", "'none'"],
  ["frame-ancestors", "'self'"],
  ["script-src", "'unsafe-inline' https://js.hsforms.net"],
  ["script-src-attr", "'none'"],
  ["connect-src", "'none'"],
  ["frame-src", "https://js.hsforms.net"],
  ["form-action", "'none'"],
]);
for (const [name, expected] of embedExpected) {
  const actual = embedDirectives.get(name)?.join(" ");
  if (actual !== expected) {
    throw new Error(`/embed/* ${name} must be ${expected}; received ${actual || "missing"}`);
  }
}
if (embedPolicy.includes("'unsafe-eval'")) {
  throw new Error("/embed/* CSP must not permit unsafe-eval");
}

const embedHtml = await readFile(join(distDir, "embed", "form.html"), "utf8");
if (!/forms\/embed\/4034633\.js/.test(embedHtml) || !/class="hs-form-frame"/.test(embedHtml)) {
  throw new Error("embed/form.html must use HubSpot's standard iframe embed");
}
if (/forms\/embed\/developer\//.test(embedHtml) || /id="hs-script-loader"/.test(embedHtml)) {
  throw new Error("embed/form.html must not use the inline developer embed or tracking loader");
}

const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
const htmlFiles = (await readdir(distDir)).filter((name) => name.endsWith(".html"));

for (const file of htmlFiles) {
  const html = await readFile(join(distDir, file), "utf8");
  const withoutScripts = html.replace(scriptRe, "");
  if (/<style\b/i.test(html)) throw new Error(`${file}: inline style block remains`);
  if (/\sstyle\s*=/i.test(withoutScripts)) throw new Error(`${file}: inline style attribute remains`);
  if (/\son[a-z]+\s*=/i.test(withoutScripts)) throw new Error(`${file}: inline event handler remains`);

  scriptRe.lastIndex = 0;
  for (const match of html.matchAll(scriptRe)) {
    const attrs = match[1];
    if (/\bsrc\s*=/i.test(attrs)) continue;
    const typeMatch = attrs.match(/\btype\s*=\s*(["'])(.*?)\1/i);
    const type = (typeMatch?.[2] || "").trim().toLowerCase().split(";")[0];
    const executable = !type || type === "module" || type === "text/javascript" || type === "application/javascript";
    if (executable) throw new Error(`${file}: executable inline script remains`);
  }
}

console.log(`CSP check passed: ${htmlFiles.length} pages use a restrictive policy without executable inline code`);
