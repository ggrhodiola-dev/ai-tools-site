const fs = require("fs")

const file = "./data/tools.json"

const tools = JSON.parse(fs.readFileSync(file, "utf8"))

let id = tools.length + 1

const extra = [

    "Stable Diffusion",
    "DALL-E",
    "Playground AI",
    "BlueWillow",
    "Adobe Firefly",
    "Pika Labs",
    "Synthesia",
    "HeyGen",
    "Luma AI",
    "Pictory",
    "Descript",
    "ElevenLabs",
    "Murf AI",
    "Speechify",
    "Otter AI",
    "DeepL Write",
    "Quillbot",
    "Copy AI",
    "Writesonic",
    "Jasper AI",
    "Rytr",
    "Sudowrite",
    "Notion AI",
    "Taskade AI",
    "Mem AI",
    "Tome AI",
    "Gamma AI",
    "Beautiful AI",
    "Perplexity Pro",
    "Elicit AI",
    "Scite AI",
    "Consensus AI",
    "Phind",
    "Codeium",
    "Tabnine",
    "Replit Ghostwriter",
    "Amazon CodeWhisperer",
    "Cursor AI",
    "Supermaven",
    "Blackbox AI",
    "Durable AI",
    "10Web AI",
    "Framer AI",
    "Builder AI",
    "Hostinger AI",
    "Looka AI",
    "LogoAI",
    "Brandmark",
    "Khroma",
    "Uizard",
    "Galileo AI",
    "Magician AI",
    "Remove BG",
    "Clipdrop",
    "Cleanup Pictures",
    "Upscale Media",
    "Topaz AI",
    "RunDiffusion",
    "Krea AI",
    "Scenario AI",
    "Artbreeder",
    "NightCafe",
    "DreamStudio",
    "PlayHT",
    "WellSaid Labs",
    "Resemble AI",
    "Voice AI",
    "Cleanvoice AI",
    "Podcastle",
    "Opus Clip",
    "Vidyo AI",
    "Wisecut",
    "FlexClip AI",
    "InVideo AI",
    "Kapwing AI",
    "VEED AI",
    "Designs AI",
    "Stockimg AI",
    "Hotpot AI",
    "DeepAI",
    "PromptHero",
    "Lexica",
    "CivitAI",
    "PromptBase",
    "PromptLayer",
    "FlowGPT",
    "AgentGPT",
    "AutoGPT",
    "BabyAGI",
    "Godmode AI",
    "Adept AI",
    "Character AI",
    "Janitor AI",
    "Chai AI",
    "Replika",
    "Pi AI",
    "Poe AI",
    "HuggingChat",
    "LangChain",
    "LlamaIndex",
    "Ollama",
    "LM Studio"

]

extra.forEach(name => {

    const slug = name.toLowerCase().replace(/\s+/g, "-")

    tools.push({

        id: id++,
        name: name,
        slug: slug,
        url: "",
        category: "ai-tool",
        tags: ["ai"],
        free_plan: null,
        description: `${name} はAIを活用したツールです。生成・分析・自動化など様々な用途に利用できます。`

    })

})

fs.writeFileSync(file, JSON.stringify(tools, null, 2))

console.log("ツール追加完了 :", extra.length)
console.log("総ツール数 :", tools.length)