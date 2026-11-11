const SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "TEXTAREA",
  "INPUT",
  "SELECT",
  "OPTION",
  "CODE",
  "PRE",
  "SVG",
  "PATH",
  "MATH",
]);

const CACHE_STORAGE_KEY = "awud-translate-cache-v3";
const originals = new WeakMap<Text, string>();
const clientCache = new Map<string, string>();
let observer: MutationObserver | null = null;
let currentLang = "en";
let runToken = 0;
let translating = false;
let mutateTimer = 0;
let cacheLoaded = false;

function cacheKey(lang: string, text: string) {
  return `${lang}::${text}`;
}

function looksTranslated(target: string, source: string, translated: string) {
  const s = source.trim();
  const t = translated.trim();
  if (!t || t === s) return false;
  if (/MYMEMORY WARNING|QUERY LENGTH LIMIT|^Sorry/i.test(t)) return false;
  if (s.startsWith(t) && t.length >= 24) return false;
  if (t.startsWith(s.slice(0, Math.min(48, s.length))) && t.length < s.length) return false;

  if (target === "am" || target === "ti") {
    return /[\u1200-\u137F]/.test(t);
  }
  if (target === "ar") return /[\u0600-\u06FF]/.test(t);
  if (target === "zh-CN" || target === "zh") return /[\u4e00-\u9fff]/.test(t);
  if (target === "hi") return /[\u0900-\u097F]/.test(t);
  if (target === "ru") return /[\u0400-\u04FF]/.test(t);
  if (target === "ja") return /[\u3040-\u30ff\u4e00-\u9faf]/.test(t);
  if (target === "ko") return /[\uac00-\ud7af]/.test(t);
  return t.toLowerCase() !== s.toLowerCase();
}

function loadCache() {
  if (cacheLoaded || typeof sessionStorage === "undefined") return;
  cacheLoaded = true;
  try {
    sessionStorage.removeItem("awud-translate-cache-v1");
    sessionStorage.removeItem("awud-translate-cache-v2");
    const raw = sessionStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, string>;
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v !== "string") continue;
      const sep = k.indexOf("::");
      if (sep < 0) continue;
      const lang = k.slice(0, sep);
      const src = k.slice(sep + 2);
      if (looksTranslated(lang, src, v)) clientCache.set(k, v);
    }
  } catch {
    /* ignore */
  }
}

function saveCache() {
  if (typeof sessionStorage === "undefined") return;
  try {
    const obj: Record<string, string> = {};
    let i = 0;
    for (const [k, v] of clientCache) {
      obj[k] = v;
      if (++i >= 800) break;
    }
    sessionStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(obj));
  } catch {
    /* ignore */
  }
}

function shouldSkip(el: Element | null): boolean {
  let cur: Element | null = el;
  while (cur) {
    if (SKIP_TAGS.has(cur.tagName)) return true;
    if (cur.classList?.contains("notranslate")) return true;
    if (cur.getAttribute("translate") === "no") return true;
    if (cur.getAttribute("contenteditable") === "true") return true;
    cur = cur.parentElement;
  }
  return false;
}

function collectTextNodes(root: ParentNode): Text[] {
  const out: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = node as Text;
      if (!(text.nodeValue ?? "").trim()) return NodeFilter.FILTER_REJECT;
      if (shouldSkip(text.parentElement)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let n: Node | null;
  while ((n = walker.nextNode())) out.push(n as Text);
  return out;
}

function rememberOriginal(node: Text, force = false) {
  const value = node.nodeValue ?? "";
  if (!value.trim()) return value;
  if (force || !originals.has(node)) {
    originals.set(node, value);
  }
  return originals.get(node) ?? value;
}

export function snapshotEnglishOriginals() {
  if (typeof document === "undefined") return;
  for (const node of collectTextNodes(document.body)) {
    if (!originals.has(node)) rememberOriginal(node);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function fetchTranslations(texts: string[], target: string): Promise<(string | null)[]> {
  loadCache();
  const missingIdx: number[] = [];
  const out: (string | null)[] = texts.map((text, i) => {
    const hit = clientCache.get(cacheKey(target, text));
    if (hit !== undefined) return hit;
    missingIdx.push(i);
    return null;
  });
  if (missingIdx.length === 0) return out;

  const missingTexts = missingIdx.map((i) => texts[i]);

  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: missingTexts, target }),
      });

      if (res.status === 429) {
        await sleep(1200 * (attempt + 1));
        continue;
      }
      if (!res.ok) return out;

      const data = (await res.json()) as { translations?: unknown[] };
      if (!Array.isArray(data.translations) || data.translations.length !== missingTexts.length) {
        return out;
      }

      data.translations.forEach((translated, j) => {
        const src = missingTexts[j];
        if (typeof translated !== "string") return;
        if (!looksTranslated(target, src, translated)) return;
        clientCache.set(cacheKey(target, src), translated);
        out[missingIdx[j]] = translated;
      });
      saveCache();
      return out;
    } catch {
      await sleep(500 * (attempt + 1));
    }
  }
  return out;
}

function restoreEnglishInPlace() {
  for (const node of collectTextNodes(document.body)) {
    const original = originals.get(node);
    if (original !== undefined && original.trim()) {
      if (node.nodeValue !== original) node.nodeValue = original;
    } else if ((node.nodeValue ?? "").trim()) {
      rememberOriginal(node);
    }
  }
}

function buildWork(lang: string) {
  const nodes = collectTextNodes(document.body);
  nodes.sort((a, b) => {
    const ar = a.parentElement?.getBoundingClientRect().top ?? 0;
    const br = b.parentElement?.getBoundingClientRect().top ?? 0;
    return ar - br;
  });

  const unique: string[] = [];
  const indexByText = new Map<string, number>();
  const paired: { node: Text; key: string }[] = [];

  for (const node of nodes) {
    const key = rememberOriginal(node).trim();
    if (!key) continue;
    paired.push({ node, key });
    if (!indexByText.has(key)) {
      indexByText.set(key, unique.length);
      unique.push(key);
    }
  }

  loadCache();
  for (const { node, key } of paired) {
    const hit = clientCache.get(cacheKey(lang, key));
    if (hit !== undefined && node.nodeValue !== hit) node.nodeValue = hit;
  }

  return { unique, paired };
}

async function applyLanguage(lang: string, onProgress?: (done: number, total: number) => void) {
  const token = ++runToken;
  currentLang = lang;

  if (lang === "en") {
    restoreEnglishInPlace();
    onProgress?.(1, 1);
    return;
  }

  restoreEnglishInPlace();
  const { unique, paired } = buildWork(lang);
  if (unique.length === 0) {
    onProgress?.(1, 1);
    return;
  }

  const translated = new Map<string, string>();
  const chunkSize = 12;
  let done = 0;

  for (let i = 0; i < unique.length; i += chunkSize) {
    if (token !== runToken || currentLang !== lang) return;
    const chunk = unique.slice(i, i + chunkSize);
    const part = await fetchTranslations(chunk, lang);
    chunk.forEach((src, idx) => {
      const value = part[idx];
      if (typeof value === "string" && looksTranslated(lang, src, value)) {
        translated.set(src, value);
      }
    });
    done += chunk.length;
    onProgress?.(done, unique.length);

    for (const { node, key } of paired) {
      const next = translated.get(key) ?? clientCache.get(cacheKey(lang, key));
      if (next && node.nodeValue !== next) node.nodeValue = next;
    }

    if (i + chunkSize < unique.length) await sleep(150);
  }
}

function scheduleRetranslate() {
  if (currentLang === "en" || translating) return;
  window.clearTimeout(mutateTimer);
  mutateTimer = window.setTimeout(() => {
    void translatePage(currentLang);
  }, 1500);
}

function onMutations(mutations: MutationRecord[]) {
  if (currentLang === "en" || translating) return;
  let needs = false;

  for (const m of mutations) {
    if (m.type !== "childList") continue;
    for (const node of m.addedNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node as Text;
        if (!shouldSkip(text.parentElement) && (text.nodeValue ?? "").trim() && !originals.has(text)) {
          rememberOriginal(text);
          needs = true;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        for (const text of collectTextNodes(node as Element)) {
          if (!originals.has(text)) {
            rememberOriginal(text);
            needs = true;
          }
        }
      }
    }
  }

  if (needs) scheduleRetranslate();
}

export function ensureObserver() {
  if (observer || typeof document === "undefined") return;
  observer = new MutationObserver(onMutations);
  observer.observe(document.body, { subtree: true, childList: true });
}

export async function translatePage(
  lang: string,
  onProgress?: (done: number, total: number) => void
) {
  if (typeof document === "undefined") return;
  loadCache();
  ensureObserver();
  if (translating) {
    currentLang = lang;
    runToken += 1;
  }
  translating = true;
  try {
    await applyLanguage(lang, onProgress);
  } catch {
    /* swallow */
  } finally {
    translating = false;
  }
}

export function getDomTranslatorLang() {
  return currentLang;
}
