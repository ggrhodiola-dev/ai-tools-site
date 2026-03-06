const fs = require("fs");
const path = require("path");

const tools = require("../data/tools.json");

const root = path.join(__dirname, "..");
const outDir = path.join(root, "site_out");

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function copyDir(src, dest) {
    if (!fs.existsSync(src)) return;
    ensureDir(dest);

    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

function copyPublic() {
    const src = path.join(root, "public");
    const dest = outDir;
    if (!fs.existsSync(src)) return;

    // Node v16+ なら fs.cpSync が使えます
    fs.cpSync(src, dest, { recursive: true });
}

function slugify(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function renderList(title, arr) {

    if (!arr || arr.length === 0) return "";

    let html = `<h3>${title}</h3><ul>`;

    arr.forEach(v => {
        html += `<li>${v}</li>`;
    });

    html += `</ul>`;

    return html;
}

function layout(title, body) {

    return `
<!DOCTYPE html>
<html>

<head>

<meta charset="utf-8">

<meta name="viewport" content="width=device-width,initial-scale=1">

<title>${title}</title>

<link rel="stylesheet" href="/css/style.css">

</head>

<body>

<header>

<div class="container">

<h1>
<a href="/">AIツール比較サイト</a>
</h1>

<nav>
<a href="/ai-tools/">AIツール一覧</a>
</nav>

</div>

</header>

${body}

<footer>

AI Tools Directory

</footer>

</body>

</html>
`;
}

/* =========================
   TOOLS
========================= */

function buildTools() {

    tools.forEach(tool => {

        const slug = tool.slug || slugify(tool.name);

        const dir = path.join(outDir, "tools", slug);

        ensureDir(dir);

        const tags = (tool.tags || [])
            .map(t => `<a class="tag" href="/tags/${t}/">${t}</a>`)
            .join(" ");

        const related = tools
            .filter(t => t.category === tool.category && t.slug !== tool.slug)
            .slice(0, 5)
            .map(t => `<li><a href="/tools/${t.slug}/">${t.name}</a></li>`)
            .join("");

        const body = `

<h1>${tool.name}</h1>

<p class="desc">
${tool.description || ""}
</p>

<p>
<a class="btn" href="${tool.url || "#"}" target="_blank">
公式サイトを見る
</a>
</p>

${renderList("主な機能", tool.features)}

${renderList("用途", tool.use_cases)}

${renderList("メリット", tool.pros)}

${renderList("デメリット", tool.cons)}

${tool.pricing ? `<h3>料金</h3><p>${tool.pricing}</p>` : ""}

${tool.platforms ?
                `<h3>対応プラットフォーム</h3>
<ul>
${tool.platforms.map(p => `<li>${p}</li>`).join("")}
</ul>` : ""}

${tool.api !== undefined ?
                `<h3>API</h3>
<p>${tool.api ? "あり" : "なし"}</p>` : ""}

<div class="tags">
${tags}
</div>

<h3>関連AIツール</h3>

<ul>
${related}
</ul>

`;

        const html = layout(tool.name, body);

        fs.writeFileSync(
            path.join(dir, "index.html"),
            html
        );

    });

}

/* =========================
   TAGS
========================= */

function buildTags() {

    const tagMap = {};

    tools.forEach(t => {

        (t.tags || []).forEach(tag => {

            if (!tagMap[tag]) tagMap[tag] = [];

            tagMap[tag].push(t);

        });

    });

    Object.keys(tagMap).forEach(tag => {

        const dir = path.join(outDir, "tags", tag);

        ensureDir(dir);

        let items = "";

        tagMap[tag].forEach(t => {

            items += `<li><a href="/tools/${t.slug}/">${t.name}</a></li>`;

        });

        const body = `

<h1>${tag} AIツール</h1>

<ul>

${items}

</ul>

`;

        const html = layout(`${tag} AIツール`, body);

        fs.writeFileSync(
            path.join(dir, "index.html"),
            html
        );

    });

}

/* =========================
   CATEGORIES
========================= */

function buildCategories() {

    const catMap = {};

    tools.forEach(t => {

        if (!catMap[t.category]) catMap[t.category] = [];

        catMap[t.category].push(t);

    });

    Object.keys(catMap).forEach(cat => {

        const dir = path.join(outDir, "categories", cat);

        ensureDir(dir);

        let items = "";

        catMap[cat].forEach(t => {

            items += `

<li>

<a href="/tools/${t.slug}/">

${t.name}

</a>

<p>

${t.description || ""}

</p>

</li>

`;

        });

        const body = `

<h1>${cat} AIツール</h1>

<ul>

${items}

</ul>

`;

        const html = layout(`${cat} AIツール`, body);

        fs.writeFileSync(
            path.join(dir, "index.html"),
            html
        );

    });

}

/* =========================
   LIST
========================= */

function buildList() {

    const dir = path.join(outDir, "ai-tools");

    ensureDir(dir);

    let items = "";

    tools.forEach(t => {

        items += `<li><a href="/tools/${t.slug}/">${t.name}</a></li>`;

    });

    const body = `

<h1>AIツール一覧</h1>

<ul class="tool-list">

${items}

</ul>

`;

    const html = layout("AIツール一覧", body);

    fs.writeFileSync(
        path.join(dir, "index.html"),
        html
    );

}

/* =========================
   HOME
========================= */

function buildHome() {

    const featured = tools.slice(0, 8).map(t => `
<div class="card">
<a href="/tools/${t.slug}/">${t.name}</a>
<p>${t.description || ""}</p>
</div>
`).join("");

    const latest = tools.slice(-8).map(t => `
<div class="card">
<a href="/tools/${t.slug}/">${t.name}</a>
</div>
`).join("");

    const body = `

<section class="hero">

<h2>AIツール検索・比較サイト</h2>
<p>300以上のAIツールをカテゴリ別に整理</p>

<div class="search">
<input id="searchBox" placeholder="AIツールを検索">
</div>

</section>

<section class="section container">

<h2>人気AIツール</h2>

<div class="grid">
${featured}
</div>

</section>

<section class="section container">

<h2>最新AIツール</h2>

<div class="grid">
${latest}
</div>

</section>

<section class="section container">

<h2>AIツール一覧</h2>

<p>
<a href="/ai-tools/">すべてのAIツールを見る →</a>
</p>

</section>

<script>

const input=document.getElementById("searchBox");

input.addEventListener("input",()=>{

const q=input.value.toLowerCase();

document.querySelectorAll(".card").forEach(c=>{

const t=c.innerText.toLowerCase();

c.style.display=t.includes(q)?"block":"none";

});

});

</script>

`;

    const html = layout("AIツール比較サイト", body);

    fs.writeFileSync(
        path.join(outDir, "index.html"),
        html
    );

}

/* =========================
   SITEMAP
========================= */

function buildSitemap() {

    let urls = "";

    tools.forEach(t => {

        urls += `

<url>

<loc>/tools/${t.slug}/</loc>

</url>

`;

    });

    const xml = `

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${urls}

</urlset>

`;

    fs.writeFileSync(
        path.join(outDir, "sitemap.xml"),
        xml
    );

}

/* =========================
   BUILD
========================= */

function build() {

    ensureDir(outDir);

    copyPublic();

    buildTools();
    buildTags();
    buildCategories();
    buildList();
    buildHome();
    buildSitemap();

}

build();