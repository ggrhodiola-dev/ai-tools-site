function buildHome() {

    const toolCount = tools.length

    /* -----------------------
    人気ツール（ランダム）
    ----------------------- */

    const shuffled = [...tools].sort(() => 0.5 - Math.random())

    const popular = shuffled.slice(0, 8)

    const popularHtml = popular.map(t => {

        let domain = ""

        try {
            domain = new URL(t.url).hostname
        } catch (e) { }

        const logo = domain
            ? `https://www.google.com/s2/favicons?sz=64&domain=${domain}`
            : ""

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

<p>${esc(shortDesc(t))}</p>

</div>
`

    }).join("")


    /* -----------------------
    ランキング
    ----------------------- */

    const ranking = tools.slice(0, 10)

    const rankingHtml = ranking.map((t, i) => `

<li>
<span class="rank-number">${i + 1}</span>
<a href="/tools/${t.slug}/">
${esc(t.name)}
</a>
</li>

`).join("")


    /* -----------------------
    新着ツール
    ----------------------- */

    const latest = [...tools].reverse().slice(0, 8)

    const latestHtml = latest.map(t => `

<li>
<a href="/tools/${t.slug}/">
${esc(t.name)}
</a>
</li>

`).join("")


    /* -----------------------
    カテゴリ
    ----------------------- */

    const catHtml = Object.keys(categories).map(c => `

<a class="cat-card" href="/category/${slug(c)}/">

${esc(c)}

<span>${categories[c].length}</span>

</a>

`).join("")


    /* -----------------------
    本文
    ----------------------- */

    const body = `

<section class="hero">

<h2>AIツール比較サイト</h2>

<p>

${toolCount}+ のAIツールを検索・比較できるディレクトリ

</p>

<div class="search">

<input id="searchBox" placeholder="AIツール検索">

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

<ol class="ranking">

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