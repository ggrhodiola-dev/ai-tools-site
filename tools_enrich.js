const fs = require("fs")

const filePath = "./data/tools.json"

const tools = JSON.parse(fs.readFileSync(filePath, "utf8"))

function guessCategory(name) {

    name = name.toLowerCase()

    if (name.includes("journey") || name.includes("leonardo")) return "image"
    if (name.includes("runway") || name.includes("video")) return "video"
    if (name.includes("perplexity")) return "search"
    if (name.includes("claude") || name.includes("gpt") || name.includes("gemini")) return "chatbot"

    return "ai-tool"
}

function guessTags(name, cat) {

    const tags = [cat]

    if (cat === "image") tags.push("image", "generation")
    if (cat === "video") tags.push("video")
    if (cat === "chatbot") tags.push("chat", "assistant")
    if (cat === "search") tags.push("search")

    return [...new Set(tags)]
}

function guessDescription(name, cat) {

    const map = {

        chatbot: `${name}はAIチャットアシスタントです。文章生成、質問回答、調査、プログラミング補助など幅広い用途に利用できます。`,

        image: `${name}はAI画像生成ツールです。テキストから画像やイラストを生成でき、デザインやクリエイティブ制作に利用できます。`,

        video: `${name}はAI動画生成・編集ツールです。動画制作や映像コンテンツ作成をAIで効率化できます。`,

        search: `${name}はAI検索エンジンです。Web情報をAIが整理して回答し、リサーチや情報収集を効率化できます。`,

        "ai-tool": `${name}はAIを活用したツールです。生成・分析・自動化など様々な用途に利用できます。`

    }

    return map[cat] || map["ai-tool"]
}

function guessURL(name) {

    const urls = {

        "chatgpt": "https://chat.openai.com",
        "claude": "https://claude.ai",
        "gemini": "https://gemini.google.com",
        "midjourney": "https://www.midjourney.com",
        "perplexity": "https://www.perplexity.ai",
        "runway": "https://runwayml.com",
        "leonardo ai": "https://leonardo.ai"

    }

    return urls[name.toLowerCase()] || ""
}

tools.forEach(t => {

    // category
    if (!t.category || t.category === "ai-tool") {
        t.category = guessCategory(t.name)
    }

    // tags
    if (!t.tags || t.tags.length === 0) {
        t.tags = guessTags(t.name, t.category)
    }

    // description
    if (!t.description || t.description.length < 80) {
        t.description = guessDescription(t.name, t.category)
    }

    // url
    if (!t.url) {
        t.url = guessURL(t.name)
    }

    // free plan
    if (t.free_plan === null) {
        t.free_plan = true
    }

})

fs.writeFileSync(filePath, JSON.stringify(tools, null, 2), "utf8")

console.log("tools.json 更新完了")