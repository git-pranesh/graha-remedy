// Generate a batch of daily social posts (image card + Facebook and Instagram captions) for review.
// Each day gets the planet of that weekday (Sunday Surya ... Saturday Shani/Rahu/Ketu); a festival in
// our calendar takes over the day before it, so people have time to prepare.
//
// Usage: node social/generate.mjs [--start YYYY-MM-DD] [--days 7]
// Output: social/out/<date>/{card.png, facebook.txt, first-comment.txt, instagram.txt}
//         plus social/out/review.html to look through the whole batch.
// Needs Google Chrome (renders the cards so Devanagari is shaped correctly).
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "out");
const lib = JSON.parse(fs.readFileSync(path.join(HERE, "library.json"), "utf8"));
const CHROME = process.env.CHROME_PATH || [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].find((p) => fs.existsSync(p));

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const EPOCH = Date.UTC(2026, 0, 4); // a Sunday; week numbers count from here so variants rotate weekly

function args() {
  const a = process.argv.slice(2);
  const get = (k, d) => (a.includes(k) ? a[a.indexOf(k) + 1] : d);
  const tomorrow = new Date(Date.now() + 5.5 * 3600e3 + 86400e3).toISOString().slice(0, 10); // IST
  return { start: get("--start", tomorrow), days: Number(get("--days", 7)) };
}

const day = (iso) => new Date(`${iso}T00:00:00Z`);
const iso = (d) => d.toISOString().slice(0, 10);
const addDays = (s, n) => iso(new Date(day(s).getTime() + n * 86400e3));
const pretty = (s) => day(s).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

function utm(pathname, date, id) {
  const u = new URL(pathname, lib.site);
  u.search = new URLSearchParams({ utm_source: "facebook", utm_medium: "social", utm_campaign: "daily_mantra", utm_content: `${date}-${id}` });
  return u.toString();
}

// Festival dates come from the live site, so they always match what the page shows.
async function festivalDates(years) {
  const dates = {};
  for (const y of years) {
    const res = await fetch(`${lib.site}/festivals/${y}`);
    if (!res.ok) throw new Error(`/festivals/${y} returned HTTP ${res.status}`);
    const text = (await res.text()).replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&");
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    lines.forEach((line, i) => {
      const m = line.match(/^(?:Sun|Mon|Tues|Wednes|Thurs|Fri|Satur)day, (\d{1,2} \w+ \d{4})$/);
      if (m && lib.festivals[lines[i + 1]]) dates[lines[i + 1]] = iso(new Date(`${m[1]} UTC`));
    });
  }
  return dates;
}

function planetPost(date) {
  const weekday = WEEKDAYS[day(date).getUTCDay()];
  const week = Math.floor((day(date) - EPOCH) / (7 * 86400e3));
  const pool = lib.weekday_rotation[weekday];
  const key = pool[week % pool.length];
  const p = lib.planets[key];
  const v = p.variants[week % p.variants.length];
  const id = `${key}-${v.kind.startsWith("beej") ? "beej" : "navagraha"}`;
  const dayLine = p.weekday === weekday ? `${weekday} is ${p.name}'s day.` : `${weekday} is a traditional day to chant for ${p.name}.`;
  return {
    date, id, accent: p.accent,
    eyebrow: `${weekday} · ${p.name} (${p.english})`,
    hook: p.hook, intro: `${dayLine} ${p.about}`, kind: v.kind,
    text: v.text, translit: v.translit, meaning: v.meaning,
    howTo: `Chant it 108 times (one mala) on ${weekday}, after a bath, sitting calmly.`,
    link: { label: `${p.name} ${v.kind.startsWith("beej") ? "beej mantra" : "mantras"}, full jaap vidhi and remedies`, url: utm(v.page || p.page, date, id) },
    tool: { label: p.tool.label, url: utm(p.tool.path, date, `${id}-tool`) },
    save: `Save this for ${weekday}. 🙏`,
    cardLine: `Chant 108 times · Save for ${weekday}`,
    cardFoot: "Meaning, jaap vidhi &amp; remedies",
    hashtags: p.hashtags,
  };
}

function festivalPost(date, name, festDate) {
  const f = lib.festivals[name];
  const when = pretty(festDate);
  const id = `festival-${f.slug}`;
  return {
    date, id, accent: f.accent,
    eyebrow: `${when.split(",")[0]} · ${name.replace(/ \(.*\)/, "")}`,
    hook: f.hook.replace("{date}", when), intro: f.about, kind: f.kind,
    text: f.text, translit: f.translit, meaning: f.meaning,
    howTo: "Chant it 108 times (one mala) during the puja, after a bath, with a lamp lit.",
    link: { label: f.cta, url: utm(`/festivals/${f.slug}`, date, id) },
    tool: { label: "Daily panchang for your city", url: utm("/panchang", date, `${id}-panchang`) },
    save: "Save this and share it with family. 🙏",
    cardLine: "Chant 108 times · Share with family",
    cardFoot: "Puja muhurat for your city",
    hashtags: f.hashtags,
  };
}

function captions(p) {
  const body = [
    p.hook, "", p.intro, "", `The ${p.kind}:`, "", p.text, "", p.translit, "",
    `Meaning: ${p.meaning}`, "", `How to chant: ${p.howTo}`,
  ];
  const tags = p.hashtags.join(" ");
  return {
    // Link in the caption: simplest; Facebook makes it clickable.
    facebook: [...body, "", `👉 ${p.link.label}: ${p.link.url}`, `🔍 ${p.tool.label}: ${p.tool.url}`, "", p.save, "", tags].join("\n"),
    // Alternative: caption without links, links posted as the first comment.
    firstComment: [`👉 ${p.link.label}: ${p.link.url}`, `🔍 ${p.tool.label}: ${p.tool.url}`].join("\n"),
    // Instagram captions can't hold clickable links.
    instagram: [...body, "", `👉 ${p.link.label}: link in bio (graharemedy.com)`, "", p.save, "", tags, "#Hinduism #Sanatan #Spirituality"].join("\n"),
  };
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>");

function cardHtml(p) {
  const long = p.text.length > 40;
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;1,500&family=Inter:wght@500;600&family=Noto+Serif+Devanagari:wght@600&display=block" rel="stylesheet">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1080px; height: 1350px; overflow: hidden; color: #F3F0EC; font-family: Inter, sans-serif;
    background: radial-gradient(circle at 50% 30%, ${p.accent}38, transparent 55%), linear-gradient(170deg, #17404A, #0B2227); }
  .frame { position: absolute; inset: 36px; border: 2px solid ${p.accent}66; border-radius: 28px; }
  .wrap { position: absolute; inset: 0; padding: 110px 100px 96px; display: flex; flex-direction: column; text-align: center; }
  .eyebrow { font-size: 26px; letter-spacing: .22em; text-transform: uppercase; color: ${p.accent}; font-weight: 600; }
  .hook { margin-top: 44px; font-family: "Cormorant Garamond", serif; font-size: 66px; line-height: 1.12; font-weight: 600; text-wrap: balance; }
  .mid { margin: auto 0; }
  .orb { width: 110px; height: 110px; border-radius: 50%; margin: 0 auto 56px;
    background: radial-gradient(circle at 35% 35%, #fff9, ${p.accent} 45%, ${p.accent}55); box-shadow: 0 0 80px ${p.accent}88; }
  .mantra { font-family: "Noto Serif Devanagari", serif; font-size: ${long ? 44 : 64}px; line-height: 1.6; color: #FCE9C2; }
  .translit { margin-top: 22px; font-family: "Cormorant Garamond", serif; font-style: italic; font-size: ${long ? 30 : 38}px; line-height: 1.3; color: #F3F0ECcc; }
  .chant { margin-top: 34px; font-size: 24px; letter-spacing: .14em; text-transform: uppercase; color: ${p.accent}; }
  .foot { padding-top: 40px; border-top: 1px solid #F3F0EC33; font-size: 27px; color: #F3F0ECcc; }
  .foot b { color: #fff; font-weight: 600; }
</style></head><body><div class="frame"></div><div class="wrap">
  <div class="eyebrow">${esc(p.eyebrow)}</div>
  <div class="hook">${esc(p.hook)}</div>
  <div class="mid">
    <div class="orb"></div>
    <div class="mantra">${esc(p.text)}</div>
    <div class="translit">${esc(p.translit)}</div>
    <div class="chant">${esc(p.cardLine)}</div>
  </div>
  <div class="foot">${p.cardFoot} · <b>graharemedy.com</b></div>
</div></body></html>`;
}

function render(htmlPath, pngPath) {
  if (!CHROME) throw new Error("Google Chrome not found; set CHROME_PATH");
  execFileSync(CHROME, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
    "--window-size=1080,1350", "--virtual-time-budget=10000", `--screenshot=${pngPath}`, `file://${htmlPath}`,
  ], { stdio: "ignore" });
}

function reviewHtml(posts) {
  const cards = posts.map((p) => `<section><img src="${p.date}/card.png"><div><h2>${pretty(p.date)} <small>${p.id}</small></h2>
<pre>${esc(p.captions.facebook).replace(/<br>/g, "\n")}</pre></div></section>`).join("\n");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Social posts for review</title><style>
body { font-family: system-ui, sans-serif; background: #F3F0EC; color: #13343B; margin: 0 auto; max-width: 1100px; padding: 24px 16px; }
section { display: grid; grid-template-columns: minmax(0, 360px) minmax(0, 1fr); gap: 24px; background: #fff; border-radius: 12px; padding: 20px; margin: 20px 0; }
img { width: 100%; border-radius: 8px; } pre { white-space: pre-wrap; font: 14px/1.5 system-ui, sans-serif; }
small { color: #5B6266; font-weight: 400; font-size: 13px; } @media (max-width: 700px) { section { grid-template-columns: 1fr; } }
</style></head><body><h1>Social posts for review</h1>${cards}</body></html>`;
}

async function main() {
  const { start, days } = args();
  const dates = Array.from({ length: days }, (_, i) => addDays(start, i));
  const years = [...new Set([...dates, addDays(dates.at(-1), 1)].map((d) => d.slice(0, 4)))];
  const fest = await festivalDates(years);

  const posts = dates.map((date) => {
    const name = Object.keys(lib.festivals).find((n) => fest[n] && addDays(fest[n], -1) === date);
    return name ? festivalPost(date, name, fest[name]) : planetPost(date);
  });

  for (const p of posts) {
    const dir = path.join(OUT, p.date);
    fs.mkdirSync(dir, { recursive: true });
    p.captions = captions(p);
    fs.writeFileSync(path.join(dir, "facebook.txt"), p.captions.facebook);
    fs.writeFileSync(path.join(dir, "first-comment.txt"), p.captions.firstComment);
    fs.writeFileSync(path.join(dir, "instagram.txt"), p.captions.instagram);
    fs.writeFileSync(path.join(dir, "card.html"), cardHtml(p));
    render(path.join(dir, "card.html"), path.join(dir, "card.png"));
    console.log(`${p.date}  ${p.id}`);
  }
  fs.writeFileSync(path.join(OUT, "review.html"), reviewHtml(posts));
  console.log(`Review: ${path.join(OUT, "review.html")}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
