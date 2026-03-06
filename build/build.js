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

function copyPublic() {

    const src = path.join(root, "public")

    if (!fs.existsSync(src)) return

    fs.cpSync(src, outDir, { recursive: true })

}

function layout(title, body, desc = "AIツール比較サイト") {

    return `<!DOCTYPE html>
<html lang="ja">
<head>

<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">

<title>${title}</title>

<meta name="description" content="${desc}">

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
${r.name}
</a>
</li>
`).join("")

        const breadcrumb = `
<div class="container breadcrumb">
<a href="/">ホーム</a>
<span> › </span>
<a href="/category/${slug(t.category)}/">${t.category}</a>
<span> › </span>
${t.name}
</div>
`

        const body = `

${breadcrumb}

<section class="section container">

<h1>${t.name}</h1>

<p class="tool-meta">
カテゴリ:
<a href="/category/${slug(t.category)}/">
${t.category}
</a>
</p>

<p>${t.description || ""}</p>

<p>
<a href="${t.url || "#"}" target="_blank">
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
            `${t.name}の特徴・使い方・公式サイト`
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

<h3>

<a href="/tools/${t.slug}/">
${t.name}
</a>

</h3>

<p>${t.description || ""}</p>

<p>

<a href="${t.url || "#"}" target="_blank">
公式サイト →
</a>

</p>

</div>

`).join("")

    const body = `

<section class="section container">

<h1>AIツール一覧</h1>

<p>

現在 ${tools.length} のAIツールを掲載

</p>

<div class="grid">

${items}

</div>

</section>
`

    const html = layout(
        "AIツール一覧",
        body,
        "人気AIツール一覧"
    )

    const dir = path.join(outDir, "ai-tools")

    ensureDir(dir)

    fs.writeFileSync(
        path.join(dir, "index.html"),
        html
    )

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

<a href="/tools/${t.slug}/">
${t.name}
</a>

<p>${t.description || ""}</p>

</div>

`).join("")

        const body = `

<section class="section container">

<h1>${cat} AIツール</h1>

<div class="grid">

${items}

</div>

</section>
`

        const html = layout(
            `${cat} AIツール一覧`,
            body,
            `${cat}AIツールまとめ`
        )

        fs.writeFileSync(
            path.join(dir, "index.html"),
            html
        )

    })

}

function buildCategoryIndex() {

    const cats = [...new Set(tools.map(t => t.category).filter(Boolean))]

    const items = cats.map(c => `

<div class="card">

<a href="/category/${slug(c)}/">

${c}

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

    const html = layout(
        "AIツールカテゴリ",
        body,
        "AIツールカテゴリ一覧"
    )

    const dir = path.join(outDir, "category")

    ensureDir(dir)

    fs.writeFileSync(
        path.join(dir, "index.html"),
        html
    )

}

function buildRanking() {

    const top = tools.slice(0, 50)

    const items = top.map((t, i) => `

<div class="card">

<h3>${i + 1}.
<a href="/tools/${t.slug}/">
${t.name}
</a>
</h3>

<p>${t.description || ""}</p>

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

    fs.writeFileSync(
        path.join(dir, "index.html"),
        html
    )

}

function buildComparisons() {

    const dir = path.join(outDir, "compare")

    ensureDir(dir)

    let count = 0

    for (let i = 0; i < tools.length; i++) {

        for (let j = i + 1; j < tools.length; j++) {

            if (tools[i].category !== tools[j].category) continue

            if (count > 200) break

            const a = tools[i]
            const b = tools[j]

            const slugName = `${a.slug}-vs-${b.slug}`

            const pageDir = path.join(dir, slugName)

            ensureDir(pageDir)

            const body = `

<section class="section container">

<h1>${a.name} vs ${b.name}</h1>

<div class="grid">

<div class="card">

<h2>${a.name}</h2>

<p>${a.description || ""}</p>

</div>

<div class="card">

<h2>${b.name}</h2>

<p>${b.description || ""}</p>

</div>

</div>

</section>
`

            const html = layout(
                `${a.name} vs ${b.name} 比較`,
                body
            )

            fs.writeFileSync(
                path.join(pageDir, "index.html"),
                html
            )

            count++

        }

    }

}

function buildSearch() {

    const dir = path.join(outDir, "search")

    ensureDir(dir)

    const data = JSON.stringify(tools.map(t => ({
        name: t.name,
        slug: t.slug,
        desc: t.description
    })))

    const body = `

<section class="section container">

<h1>AIツール検索</h1>

<input id="searchBox" placeholder="AIツール名検索">

<div id="result" class="grid"></div>

</section>

<script>

const tools=${data}

const box=document.getElementById("searchBox")

const result=document.getElementById("result")

function search(q){

result.innerHTML=""

if(q.length<2) return

const hits=tools.filter(t=>
t.name.toLowerCase().includes(q)
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

    const html = layout(
        "AIツール検索",
        body
    )

    fs.writeFileSync(
        path.join(dir, "index.html"),
        html
    )

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

    fs.writeFileSync(
        path.join(outDir, "sitemap.xml"),
        xml
    )

}

function build() {

    ensureDir(outDir)

    copyPublic()

    buildTools()
    buildList()
    buildCategoryIndex()
    buildCategories()

    buildRanking()
    buildComparisons()

    buildSearch()

    buildHome()

    buildSitemap()

}

function buildHome() {

    const featured = tools.slice(0, 8).map(t => `

<div class="card">

<h3>

<a href="/tools/${t.slug}/">
${t.name}
</a>

</h3>

<p>${t.description || ""}</p>

</div>

`).join("")

    const cats = [...new Set(tools.map(t => t.category).filter(Boolean))]

    const catHtml = cats.map(c => `

<div class="card">

<a href="/category/${slug(c)}/">

${c}

</a>

</div>

`).join("")

    const body = `

<section class="hero">

<h2>AIツール比較サイト</h2>

<p>

人気AIツールを検索・比較できるディレクトリ

</p>

<form action="/search/" method="get" class="search">

<input name="q" placeholder="AIツール検索">

</form>

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
`

    const html = layout(
        "AIツール比較サイト",
        body,
        "AIツール検索・比較サイト"
    )

    fs.writeFileSync(
        path.join(outDir, "index.html"),
        html
    )

}

build()