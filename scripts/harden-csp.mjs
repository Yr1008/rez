import { createHash } from "node:crypto";
import { mkdir, readdir, rm, writeFile, readFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

const distDir = resolve(process.argv[2] || "dist");
const assetDir = join(distDir, "rz", "csp");
const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
const styleRe = /<style\b([^>]*)>([\s\S]*?)<\/style\s*>/gi;
const dataScriptRe = /<script\b([^>]*\bdata-dc-script\b[^>]*)>([\s\S]*?)<\/script\s*>/gi;
const assets = new Map();
const factories = [];

await rm(assetDir, { recursive: true, force: true });
await mkdir(assetDir, { recursive: true });

const htmlFiles = (await readdir(distDir))
  .filter((name) => name.endsWith(".html"))
  .sort();

function slugFor(file) {
  return basename(file, ".html").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function componentNameFor(file) {
  return basename(file).replace(/\.dc\.html$/i, "").replace(/\.html$/i, "");
}

function addAsset(name, content) {
  if (assets.has(name)) throw new Error(`Duplicate CSP asset: ${name}`);
  assets.set(name, content.trim() + "\n");
  return `/rz/csp/${name}`;
}

function attrValue(attrs, name) {
  const match = attrs.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i"));
  return match ? match[2] : null;
}

function isExecutableScript(attrs) {
  if (/\bsrc\s*=/i.test(attrs)) return false;
  const type = (attrValue(attrs, "type") || "").trim().toLowerCase().split(";")[0];
  return !type || type === "module" || type === "text/javascript" || type === "application/javascript";
}

function externalizeScripts(html, slug) {
  let index = 0;
  return html.replace(scriptRe, (full, attrs, body) => {
    if (/\bdata-dc-script\b/i.test(attrs) || !isExecutableScript(attrs)) return full;
    const href = addAsset(`${slug}-script-${++index}.js`, body);
    const kept = attrs.trim();
    return `<script${kept ? ` ${kept}` : ""} src="${href}"></script>`;
  });
}

function externalizeStyles(html, slug) {
  let index = 0;
  return html.replace(styleRe, (_full, attrs, body) => {
    const href = addAsset(`${slug}-style-${++index}.css`, body);
    const media = attrValue(attrs, "media");
    return `<link rel="stylesheet" href="${href}"${media ? ` media="${media}"` : ""}>`;
  });
}

function addClass(tag, className) {
  const match = tag.match(/\sclass\s*=\s*(["'])(.*?)\1/i);
  if (match) {
    return tag.replace(match[0], ` class=${match[1]}${match[2]} ${className}${match[1]}`);
  }
  return tag.replace(/\s*\/?>$/, (end) => ` class="${className}"${end}`);
}

function transformDcTemplate(content, slug) {
  const pseudoRules = new Map();
  const transformed = content.replace(/<(?!\/|!)[^>]+>/g, (originalTag) => {
    let tag = originalTag;
    const pseudoRe = /\sstyle-([a-z-]+)\s*=\s*(["'])(.*?)\2/gi;
    let match;
    const classes = [];
    while ((match = pseudoRe.exec(originalTag))) {
      if (match[3].includes("{{")) throw new Error(`${slug}: dynamic style-${match[1]} is not supported`);
      const key = `${match[1]}\0${match[3]}`;
      let className = pseudoRules.get(key)?.className;
      if (!className) {
        className = `rzp-${createHash("sha256").update(key).digest("hex").slice(0, 12)}`;
        pseudoRules.set(key, { className, pseudo: match[1], css: match[3] });
      }
      classes.push(className);
    }
    tag = tag.replace(pseudoRe, "");
    for (const className of classes) tag = addClass(tag, className);
    return tag
      .replace(/\sstyle(\s*=\s*["'])/gi, " data-dc-style$1")
      .replace(/\son([a-z]+)(\s*=\s*["'])/gi, " data-dc-on$1$2");
  });
  const css = [...pseudoRules.values()]
    .map(({ className, pseudo, css: declarations }) => `.${className}:${pseudo}{${declarations}}`)
    .join("\n");
  return { content: transformed, pseudoCss: css };
}

function protectScripts(html, transform) {
  const blocks = [];
  const protectedHtml = html.replace(scriptRe, (block) => {
    const token = `RZCSPPROTECTED${blocks.length}TOKEN`;
    blocks.push(block);
    return token;
  });
  let result = transform(protectedHtml);
  blocks.forEach((block, index) => {
    result = result.replace(`RZCSPPROTECTED${index}TOKEN`, block);
  });
  return result;
}

function transformStaticStyleAttrs(html, slug) {
  const rules = [];
  let index = 0;
  const transformed = protectScripts(html, (input) => input.replace(/<(?!\/|!)[^>]+>/g, (tag) => {
    const match = tag.match(/\sstyle\s*=\s*(["'])(.*?)\1/i);
    if (!match) return tag;
    if (match[2].includes("{{")) throw new Error(`${slug}: dynamic style outside x-dc`);
    const token = `${slug}-${++index}`;
    const selector = Array(8).fill(`[data-rz-style="${token}"]`).join("");
    rules.push(`${selector}{${match[2]}}`);
    return tag.replace(match[0], ` data-rz-style="${token}"`);
  }));
  return { html: transformed, css: rules.join("\n") };
}

function stripScriptBlocks(html) {
  return html.replace(scriptRe, "");
}

for (const file of htmlFiles) {
  const path = join(distDir, file);
  const slug = slugFor(file);
  const componentName = componentNameFor(file);
  let html = await readFile(path, "utf8");

  dataScriptRe.lastIndex = 0;
  const logic = dataScriptRe.exec(html);
  if (logic) {
    if (!/class\s+Component\s+extends\s+DCLogic/.test(logic[2])) {
      throw new Error(`${file}: data-dc-script does not define Component`);
    }
    factories.push({ name: componentName, source: logic[2].trim() });
  }

  html = externalizeScripts(html, slug);
  html = externalizeStyles(html, slug);

  const dcMatch = html.match(/(<x-dc\b[^>]*>)([\s\S]*?)(<\/x-dc>)/i);
  if (dcMatch) {
    const dc = transformDcTemplate(dcMatch[2], slug);
    let dcContent = dc.content;
    if (dc.pseudoCss) {
      const href = addAsset(`${slug}-pseudo.css`, dc.pseudoCss);
      if (/<\/helmet>/i.test(dcContent)) {
        dcContent = dcContent.replace(/<\/helmet>/i, `<link rel="stylesheet" href="${href}">\n</helmet>`);
      } else {
        html = html.replace(/<\/head>/i, `<link rel="stylesheet" href="${href}">\n</head>`);
      }
    }
    html = html.replace(dcMatch[0], `${dcMatch[1]}${dcContent}${dcMatch[3]}`);
    html = html.replace(
      /<script\s+src=["']\.\/support\.js["'][^>]*><\/script>/i,
      (tag) => `<link rel="stylesheet" href="/rz/dc-runtime.css?v=20260806">\n<script src="/rz/csp/dc-logic.js"></script>\n${tag}`,
    );
  }

  dataScriptRe.lastIndex = 0;
  html = html.replace(dataScriptRe, (_full, attrs) => `<script ${attrs.trim()}>external:${componentName}</script>`);

  const staticStyles = transformStaticStyleAttrs(html, slug);
  html = staticStyles.html;
  if (staticStyles.css) {
    const href = addAsset(`${slug}-inline.css`, staticStyles.css);
    html = html.replace(/<\/head>/i, `<link rel="stylesheet" href="${href}">\n</head>`);
  }

  const activeHtml = stripScriptBlocks(html);
  if (/<x-import\b/i.test(activeHtml)) {
    throw new Error(`${file}: x-import requires prebundling before strict CSP deployment`);
  }
  if (/<style\b/i.test(html)) throw new Error(`${file}: inline style block remains`);
  if (/\sstyle\s*=/i.test(activeHtml)) throw new Error(`${file}: inline style attribute remains`);
  if (/\sstyle-[a-z-]+\s*=/i.test(activeHtml)) throw new Error(`${file}: dynamic pseudo style remains`);
  if (/\son[a-z]+\s*=/i.test(activeHtml)) throw new Error(`${file}: inline event handler remains`);
  scriptRe.lastIndex = 0;
  for (const match of html.matchAll(scriptRe)) {
    if (isExecutableScript(match[1])) throw new Error(`${file}: executable inline script remains`);
  }

  await writeFile(path, html);
}

const logicBundle = [
  '"use strict";',
  "window.__dcLogicFactories = window.__dcLogicFactories || Object.create(null);",
  ...factories.map(({ name, source }) => [
    `window.__dcLogicFactories[${JSON.stringify(name)}] = function (DCLogic, React) {`,
    source,
    "return Component;",
    "};",
    `window.__dcLogicFactories[${JSON.stringify(`${name}.dc`)}] = window.__dcLogicFactories[${JSON.stringify(name)}];`,
  ].join("\n")),
].join("\n\n");
addAsset("dc-logic.js", logicBundle);

for (const [name, content] of assets) {
  await writeFile(join(assetDir, name), content);
}

console.log(`CSP hardening: ${htmlFiles.length} pages, ${assets.size} external assets, ${factories.length} logic factories`);
