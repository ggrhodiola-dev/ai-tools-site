const fs = require("fs")
const path = require("path")

const tools = require("../data/tools.json")

const outDir = "site_out"

/* =========================
utility
========================= */

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
}

function esc(str = "") {
    return str.replace(/[&<>"]/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;"
    })[c])
}

function slug(str = "") {
    return str.toLowerCase().replace(/\s+/g, "-")
}

function safeDesc(t) {
    return t.description || ""
}

/* =========================
layout
========================= */

function layout(title, body, desc = "") {

    return `<!DOCTYPE html>
<html lang="ja">
<head>

<meta charset="utf-8">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">

<link rel="stylesheet" href="/css/style.css">

</head>

<body>

<header>
<div class="container">

<h1>
<a href="/">AIツール比較サイト</a>
</h1>

<nav>
<a href="/tools/">AIツール一覧</a>
<a href="/ranking/">ランキング</a>
<a href="/category/">カテゴリ</a>
</nav>

</div>
</header>

${body}

<footer>
AIツール比較サイト
</footer>

</body>
</html>`
}

/* =========================
ロゴ取得
========================= */

function getLogo(url) {

    let domain = ""

    try {
        domain = new URL(url).hostname
    } catch (e) { }

    if (!domain) return ""

    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`
}

/* =========================
ツールページ生成
========================= */

function buildTools() {

    tools.forEach(t => {

        const dir = path.join(outDir, "tools", t.slug)

        ensureDir(dir)

        const logo = getLogo(t.url)

        const body = `

<section class="section container">

<div class="tool-header">

<img class="tool-logo" src="${logo}" alt="${esc(t.name)}">

<h1>${esc(t.name)}</h1>

</div>

<p class="tool-meta">

カテゴリ:
<a href="/category/${slug(t.category)}">
${esc(t.category)}
</a>

</p>

<p>

${esc(safeDesc(t))}

</p>

<p>

<a class="btn" href="${t.url}" target="_blank">
公式サイト
</a>

</p>

</section>
`

        const html = layout(

            `${t.name} | AIツール`,

            body,

            t.description

        )

        fs.writeFileSync(

            path.join(dir, "index.html"),

            html

        )

    })

}

/* =========================
トップページ
========================= */

function buildHome() {

    const toolCount = tools.length

    const shuffled = [...tools].sort(() => 0.5 - Math.random())

    const popular = shuffled.slice(0, 8)

    const popularHtml = popular.map(t => {

        const logo = getLogo(t.url)

        return `

<div class="card">

<div class="card-head">

<img class="card-logo" src="${logo}">

<h3>

<a href="/tools/${t.slug}/">

${esc(t.name)}

</a>

</h3>

</div>

<p>

${esc(safeDesc(t))}

</p>

</div>

`

    }).join("")

    /* ランキング */

    const ranking = tools.slice(0, 10)

    const rankingHtml = ranking.map((t, i) => `

<li>

<span class="rank-number">${i + 1}</span>

<a href="/tools/${t.slug}/">

${esc(t.name)}

</a>

</li>

`).join("")

    /* 新着 */

    const latest = [...tools].reverse().slice(0, 8)

    const latestHtml = latest.map(t => `

<li>

<a href="/tools/${t.slug}/">

${esc(t.name)}

</a>

</li>

`).join("")

    /* カテゴリ */

    const categoryMap = {}

    tools.forEach(t => {
        if (!categoryMap[t.category]) categoryMap[t.category] = 0
        categoryMap[t.category]++
    })

    const catHtml = Object.entries(categoryMap).map(([c, count]) => `

<a class="cat-card" href="/category/${slug(c)}/">

<span>${esc(c)}</span>

<span>${count}</span>

</a>

`).join("")

    /* 本文 */

    const body = `

<section class="hero">

<h2>AIツール比較サイト</h2>

<p>

${toolCount}+ のAIツールを検索・比較できるディレクトリ

</p>

<div class="search">

<input placeholder="AIツール検索">

</div>

</section>

<section class="section container">

<h2>人気AIツール</h2>

<div class="grid">

${popularHtml}

</div>

</section>

<section class="section container">

<h2>AIツールランキング</h2>

<ol>

${rankingHtml}

</ol>

</section>

<section class="section container">

<h2>新着AIツール</h2>

<ul>

${latestHtml}

</ul>

</section>

<section class="section container">

<h2>AIツールカテゴリ</h2>

<div class="cat-grid">

${catHtml}

</div>

</section>

`

    const html = layout(

        "AIツール比較サイト",

        body,

        "AIツールを検索・比較できるディレクトリ"

    )

    fs.writeFileSync(

        path.join(outDir, "index.html"),

        html

    )

}

/* =========================
build
========================= */

function build() {

    ensureDir(outDir)

    buildTools()

    buildHome()

}

build()