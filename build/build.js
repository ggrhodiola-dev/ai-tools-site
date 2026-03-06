const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dataFile = path.join(root, "data", "tools.json");
const outDir = path.join(root, "site_out");

const tools = JSON.parse(fs.readFileSync(dataFile));

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function slug(s) {
    return s
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");
}

function copyPublic() {

    const src = path.join(root, "public");
    if (!fs.existsSync(src)) return;

    fs.cpSync(src, outDir, { recursive: true });

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
<a href="/category/">カテゴリ</a>

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

function buildTools() {

    tools.forEach(t => {

        const dir = path.join(outDir, "tools", t.slug);

        ensureDir(dir);

        const body = `

<section class="section container">

<h1>${t.name}</h1>

<p>${t.description || ""}</p>

<p>

<a href="${t.url || "#"}" target="_blank">
公式サイト
</a>

</p>

</section>

`;

        const html = layout(t.name, body);

        fs.writeFileSync(
            path.join(dir, "index.html"),
            html
        );

    });

}

function buildList() {

    const items = tools.map(t => `

<div class="card">

<a href="/tools/${t.slug}/">

${t.name}

</a>

<p>

${t.description || ""}

</p>

</div>

`).join("");

    const body = `

<section class="section container">

<h1>AIツール一覧</h1>

<div class="grid">

${items}

</div>

</section>

`;

    const html = layout("AIツール一覧", body);

    const dir = path.join(outDir, "ai-tools");

    ensureDir(dir);

    fs.writeFileSync(
        path.join(dir, "index.html"),
        html
    );

}

function buildCategories() {

    const map = {};

    tools.forEach(t => {

        if (!t.category) return;

        if (!map[t.category]) map[t.category] = [];

        map[t.category].push(t);

    });

    Object.entries(map).forEach(([cat, list]) => {

        const dir = path.join(outDir, "category", slug(cat));

        ensureDir(dir);

        const items = list.map(t => `

<div class="card">

<a href="/tools/${t.slug}/">

${t.name}

</a>

<p>

${t.description || ""}

</p>

</div>

`).join("");

        const body = `

<section class="section container">

<h1>${cat} AIツール</h1>

<div class="grid">

${items}

</div>

</section>

`;

        const html = layout(cat + " AIツール", body);

        fs.writeFileSync(
            path.join(dir, "index.html"),
            html
        );

    });

}

function buildCategoryIndex() {

    const cats = [...new Set(tools.map(t => t.category).filter(Boolean))];

    const items = cats.map(c => `

<div class="card">

<a href="/category/${slug(c)}/">

${c}

</a>

</div>

`).join("");

    const body = `

<section class="section container">

<h1>AIツールカテゴリ</h1>

<div class="grid">

${items}

</div>

</section>

`;

    const html = layout("AIツールカテゴリ", body);

    const dir = path.join(outDir, "category");

    ensureDir(dir);

    fs.writeFileSync(
        path.join(dir, "index.html"),
        html
    );

}

function buildHome() {

    const featured = tools.slice(0, 8).map(t => `

<div class="card">

<a href="/tools/${t.slug}/">

${t.name}

</a>

<p>

${t.description || ""}

</p>

</div>

`).join("");

    const latest = tools.slice(-8).map(t => `

<div class="card">

<a href="/tools/${t.slug}/">

${t.name}

</a>

</div>

`).join("");

    const cats = [...new Set(tools.map(t => t.category).filter(Boolean))].slice(0, 8);

    const catHtml = cats.map(c => `

<div class="card">

<a href="/category/${slug(c)}/">

${c}

</a>

</div>

`).join("");

    const body = `

<section class="hero">

<h2>AIツール検索・比較サイト</h2>

<p>

300以上のAIツールをカテゴリ別に整理

</p>

<div class="search">

<input id="searchBox" placeholder="AIツール検索">

</div>

</section>

<section class="section container">

<h2>AIツールカテゴリ</h2>

<div class="grid">

${catHtml}

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

<a href="/ai-tools/">

すべてのAIツールを見る →

</a>

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

function build() {

    ensureDir(outDir);

    copyPublic();

    buildTools();

    buildList();

    buildCategoryIndex();

    buildCategories();

    buildHome();

}

build();