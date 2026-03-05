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

function slugify(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
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
            .map(t => `<a href="/tags/${t}/">${t}</a>`)
            .join(" ");

        const related = tools
            .filter(t => t.category === tool.category && t.slug !== tool.slug)
            .slice(0, 5)
            .map(t => `<li><a href="/tools/${t.slug}/">${t.name}</a></li>`)
            .join("");

        const html = `
<html>
<head>
<title>${tool.name}</title>
<meta charset="utf-8">
</head>

<body>

<h1>${tool.name}</h1>

<p>${tool.description || ""}</p>

<p>
<a href="${tool.url || "#"}" target="_blank">
公式サイト
</a>
</p>

<div>
${tags}
</div>

<h3>関連AIツール</h3>
<ul>
${related}
</ul>

</body>
</html>
`;

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

        const html = `
<html>
<head>
<title>${tag} AIツール</title>
<meta charset="utf-8">
</head>

<body>

<h1>${tag} AIツール</h1>

<ul>
${items}
</ul>

</body>
</html>
`;

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
<a href="/tools/${t.slug}/">${t.name}</a>
<p>${t.description || ""}</p>
</li>
`;

        });

        const html = `
<html>
<head>
<title>${cat} AIツール</title>
<meta charset="utf-8">
</head>

<body>

<h1>${cat} AIツール</h1>

<ul>
${items}
</ul>

</body>
</html>
`;

        fs.writeFileSync(
            path.join(dir, "index.html"),
            html
        );

    });

}

/* =========================
   AI TOOLS LIST
========================= */

function buildList() {

    const dir = path.join(outDir, "ai-tools");

    ensureDir(dir);

    let items = "";

    tools.forEach(t => {

        items += `<li><a href="/tools/${t.slug}/">${t.name}</a></li>`;

    });

    const html = `
<html>
<head>
<title>AIツール一覧</title>
<meta charset="utf-8">
</head>

<body>

<h1>AIツール一覧</h1>

<ul>
${items}
</ul>

</body>
</html>
`;

    fs.writeFileSync(
        path.join(dir, "index.html"),
        html
    );

}

/* =========================
   HOME
========================= */

function buildHome() {

    const html = `
<html>
<head>
<title>AIツールデータベース</title>
<meta charset="utf-8">
</head>

<body>

<h1>AIツールデータベース</h1>

<p>
AIツールをカテゴリ別に整理したデータベースです。
</p>

<ul>
<li><a href="/ai-tools/">AIツール一覧</a></li>
<li><a href="/categories/">カテゴリ</a></li>
<li><a href="/tags/">タグ</a></li>
</ul>

</body>
</html>
`;

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

    buildTools();
    buildTags();
    buildCategories();
    buildList();
    buildHome();
    buildSitemap();

}

build();