const fs = require("fs")
const path = require("path")

const root = path.resolve(__dirname, "..")
const dataFile = path.join(root, "data", "tools.json")
const outDir = path.join(root, "site_out")

const tools = JSON.parse(fs.readFileSync(dataFile, "utf8"))

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function slug(s) {
    return String(s || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "")
}

function escapeHtml(str) {
    return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
}

function copyPublic() {
    const src = path.join(root, "public")
    if (!fs.existsSync(src)) return
    fs.cpSync(src, outDir, { recursive: true })
}

function safeUrl(url) {
    const s = String(url || "").trim()
    return s || "#"
}

function toolDescription(t) {
    return t.description || `${t.name}のAIツール紹介ページです。`
}

function renderOfficialLink(url) {
    const safe = safeUrl(url)
    if (safe === "#") {
        return `<span>公式サイト情報なし</span>`
    }
    return `<a href="${escapeHtml(safe)}" target="_blank" rel="noopener noreferrer">公式サイト</a>`
}

function layout(title, body, desc = "AIツール比較サイト") {
    return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(desc)}">
<link rel="stylesheet" href="/css/style.css">
</head>
<body>

<header>
<div class="container">
<h1><a href="/">AIツール比較サイト</a></h1>
<nav>
<a href="/ai-tools/">AIツール一覧</a>
<a href="/ranking/">ランキング</a>
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
`
}

function buildTools() {
    tools.forEach(t => {
        const dir = path.join(outDir, "tools", t.slug)
        ensureDir(dir)

        const related = tools
            .filter(x => x.slug !== t.slug && x.category === t.category)
            .slice(0, 6)

        const relatedHtml = related.map(r => `
<li>
<a href="/tools/${r.slug}/">${escapeHtml(r.name)}</a>
</li>
`).join("")

        const body = `
<section class="section container">

<h1>${escapeHtml(t.name)}</h1>

<p class="tool-meta">
カテゴリ:
<a href="/category/${slug(t.category)}/">${escapeHtml(t.category || "other")}</a>
</p>

<p>${escapeHtml(toolDescription(t))}</p>

<p>${renderOfficialLink(t.url)}</p>

</section>

<section class="section container">

<h2>関連AIツール</h2>

<ul>
${relatedHtml}
</ul>

</section>
`

        const html = layout(
            `${t.name} | AIツール`,
            body,
            `${t.name}の特徴・使い方・公式サイト情報`
        )

        fs.writeFileSync(path.join(dir, "index.html"), html)
    })
}

function buildList() {
    const items = tools.map(t => `
<div class="card">

<h3>
<a href="/tools/${t.slug}/">${escapeHtml(t.name)}</a>
</h3>

<p>${escapeHtml(toolDescription(t))}</p>

<p>${renderOfficialLink(t.url).replace(">公式サイト<", ">公式サイト →<")}</p>

</div>
`).join("")

    const body = `
<section class="section container">

<h1>AIツール一覧</h1>

<p>現在 ${tools.length} のAIツールを掲載</p>

<div class="grid">
${items}
</div>

</section>
`

    const html = layout(
        "AIツール一覧",
        body,
        "人気AIツールの一覧ページ"
    )

    const dir = path.join(outDir, "ai-tools")
    ensureDir(dir)
    fs.writeFileSync(path.join(dir, "index.html"), html)
}

function buildCategories() {
    const map = {}

    tools.forEach(t => {
        if (!t.category) return
        if (!map[t.category]) map[t.category] = []
        map[t.category].push(t)
    })

    Object.entries(map).forEach(([cat, list]) => {
        const dir = path.join(outDir, "category", slug(cat))
        ensureDir(dir)

        const items = list.map(t => `
<div class="card">
<a href="/tools/${t.slug}/">${escapeHtml(t.name)}</a>
<p>${escapeHtml(toolDescription(t))}</p>
</div>
`).join("")

        const body = `
<section class="section container">

<h1>${escapeHtml(cat)} AIツール</h1>

<div class="grid">
${items}
</div>

</section>
`

        const html = layout(
            `${cat} AIツール一覧`,
            body,
            `${cat}系AIツールまとめ`
        )

        fs.writeFileSync(path.join(dir, "index.html"), html)
    })
}

function buildCategoryIndex() {
    const cats = [...new Set(tools.map(t => t.category).filter(Boolean))]

    const items = cats.map(c => `
<div class="card">
<a href="/category/${slug(c)}/">${escapeHtml(c)}</a>
</div>
`).join("")

    const body = `
<section class="section container">

<h1>AIツールカテゴリ</h1>

<div class="grid">
${items}
</div>

</section>
`

    const html = layout(
        "AIツールカテゴリ",
        body,
        "AIツールカテゴリ一覧"
    )

    const dir = path.join(outDir, "category")
    ensureDir(dir)
    fs.writeFileSync(path.join(dir, "index.html"), html)
}

function buildTags() {
    const map = {}

    tools.forEach(t => {
        if (!t.tags) return
        t.tags.forEach(tag => {
            if (!map[tag]) map[tag] = []
            map[tag].push(t)
        })
    })

    Object.entries(map).forEach(([tag, list]) => {
        const dir = path.join(outDir, "tag", slug(tag))
        ensureDir(dir)

        const items = list.map(t => `
<div class="card">
<a href="/tools/${t.slug}/">${escapeHtml(t.name)}</a>
<p>${escapeHtml(toolDescription(t))}</p>
</div>
`).join("")

        const body = `
<section class="section container">

<h1>${escapeHtml(tag)} AIツール</h1>

<div class="grid">
${items}
</div>

</section>
`

        const html = layout(
            `${tag} AIツール`,
            body,
            `${tag}タグのAIツール`
        )

        fs.writeFileSync(path.join(dir, "index.html"), html)
    })
}

function buildRanking() {
    const top = tools.slice(0, 50)

    const items = top.map((t, i) => `
<div class="card">

<h3>${i + 1}. <a href="/tools/${t.slug}/">${escapeHtml(t.name)}</a></h3>

<p>${escapeHtml(toolDescription(t))}</p>

</div>
`).join("")

    const body = `
<section class="section container">

<h1>AIツール人気ランキング</h1>

<div class="grid">
${items}
</div>

</section>
`

    const html = layout(
        "AIツールランキング",
        body,
        "人気AIツールランキング"
    )

    const dir = path.join(outDir, "ranking")
    ensureDir(dir)
    fs.writeFileSync(path.join(dir, "index.html"), html)
}

function buildComparisons() {
    const dir = path.join(outDir, "compare")
    ensureDir(dir)

    const pairs = []

    for (let i = 0; i < tools.length; i++) {
        for (let j = i + 1; j < tools.length; j++) {
            if (tools[i].category && tools[i].category === tools[j].category) {
                pairs.push([tools[i], tools[j]])
            }
        }
    }

    pairs.slice(0, 200).forEach(([a, b]) => {
        const slugName = `${a.slug}-vs-${b.slug}`
        const pageDir = path.join(dir, slugName)
        ensureDir(pageDir)

        const body = `
<section class="section container">

<h1>${escapeHtml(a.name)} vs ${escapeHtml(b.name)}</h1>

<div class="grid">

<div class="card">
<h2>${escapeHtml(a.name)}</h2>
<p>${escapeHtml(toolDescription(a))}</p>
<p>${renderOfficialLink(a.url)}</p>
<p>
<a href="/tools/${a.slug}/">詳細ページを見る</a>
</p>
</div>

<div class="card">
<h2>${escapeHtml(b.name)}</h2>
<p>${escapeHtml(toolDescription(b))}</p>
<p>${renderOfficialLink(b.url)}</p>
<p>
<a href="/tools/${b.slug}/">詳細ページを見る</a>
</p>
</div>

</div>

</section>
`

        const html = layout(
            `${a.name} vs ${b.name} 比較`,
            body,
            `${a.name}と${b.name}のAIツール比較`
        )

        fs.writeFileSync(path.join(pageDir, "index.html"), html)
    })
}

function buildHome() {
    const featured = tools.slice(0, 8).map(t => `
<div class="card">

<h3>
<a href="/tools/${t.slug}/">${escapeHtml(t.name)}</a>
</h3>

<p>${escapeHtml(toolDescription(t))}</p>

</div>
`).join("")

    const cats = [...new Set(tools.map(t => t.category).filter(Boolean))]

    const catHtml = cats.map(c => `
<div class="card">
<a href="/category/${slug(c)}/">${escapeHtml(c)}</a>
</div>
`).join("")

    const searchData = JSON.stringify(
        tools.map(t => ({
            name: t.name,
            slug: t.slug
        }))
    )

    const body = `
<section class="hero">

<h2>AIツール比較サイト</h2>

<p>人気AIツールを検索・比較できるディレクトリ</p>

<div class="search">
<input id="searchBox" placeholder="AIツール検索">
</div>

</section>

<section class="section container">

<h2>人気AIツール</h2>

<div class="grid">
${featured}
</div>

</section>

<section class="section container">

<h2>AIツールカテゴリ</h2>

<div class="grid">
${catHtml}
</div>

</section>

<section class="section container">

<a href="/ai-tools/">
すべてのAIツールを見る →
</a>

</section>

<script>
const tools = ${searchData}
const box = document.getElementById("searchBox")

if (box) {
    box.addEventListener("input", e => {
        const q = e.target.value.toLowerCase().trim()
        if (q.length < 2) return

        const hit = tools.find(t => t.name.toLowerCase().includes(q))

        if (hit) {
            window.location = "/tools/" + hit.slug + "/"
        }
    })
}
</script>
`

    const html = layout(
        "AIツール比較サイト",
        body,
        "AIツール比較・検索サイト"
    )

    fs.writeFileSync(path.join(outDir, "index.html"), html)
}

function buildSitemap() {
    const urls = ["/", "/ai-tools/", "/ranking/", "/category/"]

    const categories = [...new Set(tools.map(t => t.category).filter(Boolean))]
    const tags = [...new Set(tools.flatMap(t => t.tags || []))]

    categories.forEach(c => {
        urls.push(`/category/${slug(c)}/`)
    })

    tags.forEach(tag => {
        urls.push(`/tag/${slug(tag)}/`)
    })

    tools.forEach(t => {
        urls.push(`/tools/${t.slug}/`)
    })

    const comparisonPairs = []
    for (let i = 0; i < tools.length; i++) {
        for (let j = i + 1; j < tools.length; j++) {
            if (tools[i].category && tools[i].category === tools[j].category) {
                comparisonPairs.push(`/compare/${tools[i].slug}-vs-${tools[j].slug}/`)
            }
        }
    }

    comparisonPairs.slice(0, 200).forEach(u => urls.push(u))

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `
<url>
<loc>${u}</loc>
</url>`).join("")}
</urlset>
`

    fs.writeFileSync(path.join(outDir, "sitemap.xml"), xml)
}

function build() {
    ensureDir(outDir)

    copyPublic()

    buildTools()
    buildList()
    buildCategoryIndex()
    buildCategories()
    buildTags()
    buildRanking()
    buildComparisons()
    buildHome()
    buildSitemap()
}

build()