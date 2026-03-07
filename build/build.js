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

function esc(s) {
    return String(s || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
}

function safeDesc(t) {
    return t.description || `${t.name}のAIツール紹介ページ`
}

function safeUrl(u) {
    return u || "#"
}

function copyPublic() {
    const src = path.join(root, "public")
    if (!fs.existsSync(src)) return
    fs.cpSync(src, outDir, { recursive: true })
}

function getLogoUrl(url) {
    if (!url || url === "#") return ""
    try {
        const domain = new URL(url).hostname
        if (!domain) return ""
        return `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(domain)}`
    } catch {
        return ""
    }
}

function getInitial(name) {
    const s = String(name || "").trim()
    return s ? esc(s[0].toUpperCase()) : "?"
}

function renderLogo(name, url, imgClass = "card-logo", fallbackClass = "card-logo-fallback") {
    const logoUrl = getLogoUrl(url)
    const initial = getInitial(name)

    if (!logoUrl) {
        return `<span class="${fallbackClass}" aria-hidden="true">${initial}</span>`
    }

    return `
<img
  class="${imgClass}"
  src="${logoUrl}"
  alt="${esc(name)} logo"
  loading="lazy"
  referrerpolicy="no-referrer"
  onerror="this.style.display='none';this.nextElementSibling.style.display='inline-flex';"
>
<span class="${fallbackClass}" aria-hidden="true" style="display:none;">${initial}</span>
`
}

function renderTags(t) {

    if (!t.tags) return ""

    return `
<div class="tags">
${t.tags.slice(0, 4).map(tag => `
<span class="tag">${esc(tag)}</span>
`).join("")}
</div>
`
}

function layout(title, body, desc = "AIツール紹介サイト") {

    return `<!DOCTYPE html>
<html lang="ja">
<head>

<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">

<title>${esc(title)}</title>

<meta name="description" content="${esc(desc)}">

<link rel="stylesheet" href="/css/style.css">

</head>

<body>

<header>

<div class="container">

<h1>
<a href="/">AIツール紹介サイト</a>
</h1>

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
</html>`
}

function breadcrumb(cat, name) {

    return `
<div class="container breadcrumb">

<a href="/">ホーム</a>
<span> › </span>

<a href="/category/${slug(cat)}/">
${esc(cat)}
</a>

<span> › </span>

${esc(name)}

</div>
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
<a href="/tools/${r.slug}/">
${esc(r.name)}
</a>
</li>

`).join("")

        const body = `

${breadcrumb(t.category, t.name)}

<section class="section container">

<div class="tool-header">
${renderLogo(t.name, safeUrl(t.url), "tool-logo", "tool-logo-fallback")}
<h1>${esc(t.name)}</h1>
</div>

<p class="tool-meta">

カテゴリ:
<a href="/category/${slug(t.category)}/">
${esc(t.category)}
</a>

</p>

<p>${esc(safeDesc(t))}</p>

${renderTags(t)}

<p>

<a href="${safeUrl(t.url)}" target="_blank" rel="noopener noreferrer">
公式サイト
</a>

</p>

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
            `${t.name}のAIツール情報`
        )

        fs.writeFileSync(
            path.join(dir, "index.html"),
            html
        )

    })

}

function buildList() {

    const items = tools.map(t => `

<div class="card">

<div class="card-head">
${renderLogo(t.name, safeUrl(t.url), "card-logo", "card-logo-fallback")}
<h3>
<a href="/tools/${t.slug}/">
${esc(t.name)}
</a>
</h3>
</div>

<p>${esc(safeDesc(t))}</p>

${renderTags(t)}

<p>
<a href="${safeUrl(t.url)}" target="_blank" rel="noopener noreferrer">
公式サイト →
</a>
</p>

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

    const html = layout("AIツール一覧", body)

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

<div class="card-head">
${renderLogo(t.name, safeUrl(t.url), "card-logo", "card-logo-fallback")}
<a href="/tools/${t.slug}/">
${esc(t.name)}
</a>
</div>

<p>${esc(safeDesc(t))}</p>

${renderTags(t)}

</div>

`).join("")

        const body = `

<section class="section container">

<h1>${esc(cat)} AIツール</h1>

<div class="grid">

${items}

</div>

</section>

`

        const html = layout(`${cat} AIツール一覧`, body)

        fs.writeFileSync(path.join(dir, "index.html"), html)

    })

}

function buildCategoryIndex() {

    const cats = [...new Set(tools.map(t => t.category).filter(Boolean))]

    const icon = {
        chatbot: "💬",
        image: "🖼️",
        video: "🎬",
        audio: "🎵",
        writing: "✍️",
        design: "🎨",
        development: "💻",
        search: "🔎",
        productivity: "📋",
        presentation: "📊",
        website: "🌐",
        "3d": "🧊"
    }

    const items = cats.map(c => `

<div class="card">

<a href="/category/${slug(c)}/">

${icon[c] || "🤖"} ${esc(c)}

</a>

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

    const html = layout("AIツールカテゴリ", body)

    const dir = path.join(outDir, "category")

    ensureDir(dir)

    fs.writeFileSync(path.join(dir, "index.html"), html)

}

function buildRanking() {

    const top = tools.slice(0, 50)

    const items = top.map((t, i) => `

<div class="card">

<div class="card-head">
${renderLogo(t.name, safeUrl(t.url), "card-logo", "card-logo-fallback")}
<h3>${i + 1}.
<a href="/tools/${t.slug}/">
${esc(t.name)}
</a>
</h3>
</div>

<p>${esc(safeDesc(t))}</p>

${renderTags(t)}

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

    const html = layout("AIツールランキング", body)

    const dir = path.join(outDir, "ranking")

    ensureDir(dir)

    fs.writeFileSync(path.join(dir, "index.html"), html)

}

function buildHome() {

    const shuffled = [...tools].sort(() => 0.5 - Math.random())

    // 人気ツール 12件
    const featured = shuffled.slice(0, 12).map(t => `

<div class="card">

<div class="card-head">
${renderLogo(t.name, safeUrl(t.url))}
<h3>
<a href="/tools/${t.slug}/">
${esc(t.name)}
</a>
</h3>
</div>

<p>${esc(safeDesc(t))}</p>

${renderTags(t)}

</div>

`).join("")

    const cats = [...new Set(tools.map(t => t.category).filter(Boolean))]

    const icon = {
        chatbot: "💬",
        image: "🖼️",
        video: "🎬",
        audio: "🎵",
        writing: "✍️",
        design: "🎨",
        development: "💻",
        search: "🔎",
        productivity: "📋",
        presentation: "📊",
        website: "🌐",
        "3d": "🧊"
    }

    const catHtml = cats.map(c => `

<div class="card">

<a href="/category/${slug(c)}/">

${icon[c] || "🤖"} ${esc(c)}

</a>

</div>

`).join("")

    const body = `

<section class="hero">

<h2>AIツール紹介サイト</h2>

<p>

人気AIツールをカテゴリ別に紹介しているAIツールディレクトリサイトです。

</p>

<form action="/search/" method="get" autocomplete="off">
  <input name="q" placeholder="AIツールを検索…">
</form>

</section>

<section class="section container">

<h2>AIツールとは</h2>

<p>
AIツールとは、人工知能（AI）を活用してさまざまな作業を効率化できるサービスの総称です。  
文章作成、画像生成、動画制作、音声生成、プログラミング支援、検索支援など、多くの分野で利用されており、個人から企業まで幅広く活用されています。
</p>

<p>
このサイトでは、世界中のAIツールをカテゴリ別に整理し、用途に応じて探しやすいようにまとめています。  
新しいAIサービスも次々と登場しているため、人気ツールから新しいツールまで幅広く紹介しています。
</p>

<p>
文章作成AI、画像生成AI、動画AI、音声AI、開発支援AIなど、目的に合ったAIツールを見つける際の参考としてご活用ください。
</p>

</section>

<section class="section container">

<h2>Pick Up AIツール</h2>

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

`

    const html = layout("AIツール紹介サイト", body)

    fs.writeFileSync(path.join(outDir, "index.html"), html)

}

function buildSitemap() {

    let urls = ["/", "/ai-tools/", "/ranking/", "/category/", "/search/"]

    tools.forEach(t => {
        urls.push(`/tools/${t.slug}/`)
    })

    const xml = `<?xml version="1.0" encoding="UTF-8"?>

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

${urls.map(u => `

<url>
<loc>${u}</loc>
</url>

`).join("")}

</urlset>
`

    fs.writeFileSync(path.join(outDir, "sitemap.xml"), xml)

}

function buildSearch() {

    const dir = path.join(outDir, "search")

    ensureDir(dir)

    const data = JSON.stringify(
        tools.map(t => ({
            name: t.name,
            slug: t.slug,
            desc: t.description || "",
            tags: t.tags || [],
            category: t.category || ""
        }))
    )

    const body = `

<section class="section container">

<h1>AIツール検索</h1>

<input id="searchBox" placeholder="AIツール検索">

<div id="result" class="grid"></div>

</section>

<script>

const tools=${data}

const box=document.getElementById("searchBox")
const result=document.getElementById("result")

function search(q){

result.innerHTML=""

if(q.length<2)return

const hits=tools.filter(t=>

t.name.toLowerCase().includes(q)
||
t.desc.toLowerCase().includes(q)
||
t.category.toLowerCase().includes(q)
||
t.tags.join(" ").toLowerCase().includes(q)

).slice(0,50)

hits.forEach(t=>{

const card=document.createElement("div")

card.className="card"

card.innerHTML=
'<h3><a href="/tools/'+t.slug+'/">'+t.name+'</a></h3>'+
'<p>'+t.desc+'</p>'

result.appendChild(card)

})

}

box.addEventListener("input",e=>{
search(e.target.value.toLowerCase())
})

</script>

`

    const html = layout("AIツール検索", body)

    fs.writeFileSync(path.join(dir, "index.html"), html)

}

function build() {

    ensureDir(outDir)

    copyPublic()

    buildTools()
    buildList()
    buildCategoryIndex()
    buildCategories()
    buildRanking()
    buildSearch()
    buildHome()
    buildSitemap()
    buildSearch();
}

build()