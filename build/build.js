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


        /* -------------------------
        タグリンク
        ------------------------- */

        const tagLinks = (t.tags || [])
            .map(tag => `<a href="/tag/${slug(tag)}/">${esc(tag)}</a>`)
            .join(" ")


        /* -------------------------
        ドメイン取得
        ------------------------- */

        let domain = ""

        try {
            domain = new URL(t.url).hostname
        } catch (e) {
            domain = ""
        }


        /* -------------------------
        ロゴ
        ------------------------- */

        const logo = domain
            ? `https://www.google.com/s2/favicons?sz=64&domain=${domain}`
            : ""


        /* -------------------------
        スクリーンショット
        ------------------------- */

        const screenshot = t.url
            ? `https://image.thum.io/get/width/1200/${t.url}`
            : ""


        /* -------------------------
        本文
        ------------------------- */

        const body = `

${breadcrumb(t.category, t.name)}

<section class="section container">

<div class="tool-header">

<img class="tool-logo" src="${logo}" alt="${esc(t.name)}">

<h1>${esc(t.name)}</h1>

</div>

<div class="tool-shot">

<img src="${screenshot}" alt="${esc(t.name)} screenshot">

</div>

<p class="tool-meta">

カテゴリ:
<a href="/category/${slug(t.category)}/">
${esc(t.category)}
</a>

</p>

<p class="tool-tags">

${tagLinks}

</p>

<p>

${esc(safeDesc(t))}

</p>

<p>

<a class="btn" href="${safeUrl(t.url)}" target="_blank">
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