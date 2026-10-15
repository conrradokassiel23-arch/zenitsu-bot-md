/* ============================================================
   ❄️ MENU CIDADE - AKAZA BOT MD
   ============================================================ */

const fs = require("fs")
const path = require("path")

const DATA_DIR = path.join(__dirname, "..", "..", "data")

function dbLer(arquivo, padrao = {}) {
  const p = path.join(DATA_DIR, arquivo)
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, JSON.stringify(padrao, null, 2))
    return padrao
  }
  try { return JSON.parse(fs.readFileSync(p, "utf8")) } catch { return padrao }
}

function dbSalvar(arquivo, dados) {
  fs.writeFileSync(path.join(DATA_DIR, arquivo), JSON.stringify(dados, null, 2))
}

function nomeBotDb(db) {
  try { return db.config().nomeBot || "Akaza Bot" } catch { return "Akaza Bot" }
}

function lineEmoji(emoji, label, valor) {
  return `${emoji} ${label}:\n╰➜ ${valor}`
}

const CASAS = [
  { id: "barraco", nome: "Barraco", emoji: "🏚️", preco: 500, renda: 30, desc: "Um teto simples" },
  { id: "kitnet", nome: "Kitnet", emoji: "🏠", preco: 1500, renda: 80, desc: "Espaço pequeno" },
  { id: "casa", nome: "Casa", emoji: "🏡", preco: 4000, renda: 200, desc: "Casa padrão" },
  { id: "sobrado", nome: "Sobrado", emoji: "🏘️", preco: 9000, renda: 450, desc: "Dois andares" },
  { id: "mansao", nome: "Mansão", emoji: "🏛️", preco: 25000, renda: 1200, desc: "Luxo puro" },
  { id: "chacara", nome: "Chácara", emoji: "🌳", preco: 40000, renda: 2000, desc: "Verde e paz" },
  { id: "mansaoLuxo", nome: "Mansão de Luxo", emoji: "💎", preco: 80000, renda: 4000, desc: "Fortuna pura" },
  { id: "palacio", nome: "Palácio Imperial", emoji: "👑", preco: 200000, renda: 10000, desc: "Só pra realeza" }
]

const PREDIOS = [
  { id: "lojinha", nome: "Lojinha", emoji: "🏪", preco: 5000, renda: 250, desc: "Comércio básico" },
  { id: "supermercado", nome: "Supermercado", emoji: "🛒", preco: 15000, renda: 800, desc: "Muita clientela" },
  { id: "shopping", nome: "Shopping", emoji: "🏬", preco: 50000, renda: 2500, desc: "Muitas lojas" },
  { id: "hospital", nome: "Hospital", emoji: "🏥", preco: 80000, renda: 4000, desc: "Salva vidas" },
  { id: "hotel", nome: "Hotel 5 Estrelas", emoji: "🏨", preco: 120000, renda: 6000, desc: "Turistas ricos" },
  { id: "banco", nome: "Banco", emoji: "🏦", preco: 250000, renda: 12000, desc: "Juros altos" },
  { id: "petrolifera", nome: "Petrolífera", emoji: "🛢️", preco: 400000, renda: 20000, desc: "Ouro negro" },
  { id: "arranhaceu", nome: "Arranha-céu", emoji: "🌆", preco: 800000, renda: 40000, desc: "O topo da cidade" }
]

const MERCADO = [
  { id: "pao", nome: "Pão", emoji: "🍞", preco: 10, cura: 5, desc: "+5 fome" },
  { id: "agua", nome: "Água", emoji: "💧", preco: 5, cura: 3, desc: "+3 sede" },
  { id: "lanche", nome: "Lanche", emoji: "🍔", preco: 30, cura: 15, desc: "+15 fome" },
  { id: "pizza", nome: "Pizza", emoji: "🍕", preco: 50, cura: 25, desc: "+25 fome" },
  { id: "sushi", nome: "Sushi", emoji: "🍣", preco: 80, cura: 35, desc: "+35 fome" },
  { id: "cerveja", nome: "Cerveja", emoji: "🍺", preco: 15, cura: 10, desc: "+10 sede" },
  { id: "cafe", nome: "Café", emoji: "☕", preco: 12, cura: 8, desc: "+8 sede" },
  { id: "suco", nome: "Suco", emoji: "🧃", preco: 8, cura: 6, desc: "+6 sede" },
  { id: "energetico", nome: "Energético", emoji: "🥤", preco: 25, cura: 20, desc: "+20 sede" },
  { id: "flor", nome: "Flor", emoji: "🌹", preco: 100, cura: 0, desc: "Presente romântico" }
]

const BANCO = { taxaJuros: 0.02, taxaSaque: 0.01, taxaDeposito: 0, limiteSaque: 50000 }
const POLICIA = { fiancaPorMinuto: 100, tempoPadrao: 10 * 60 * 1000, multaFuga: 5000 }

const GIFS = {
  matar: ["https://media.tenor.com/3l-VLbYPkHYAAAAC/anime-hit.gif", "https://media.tenor.com/KmS2-Y8sNbsAAAAC/anime-slice.gif", "https://media.tenor.com/1PJv5sTfWq0AAAAC/anime-punch.gif", "https://media.tenor.com/XqZ0cXXYaCsAAAAC/anime-sword.gif"],
  beijar: ["https://media.tenor.com/COhjzNhZAeDmwAAAAC/anime-kiss.gif", "https://media.tenor.com/d4V5IvuHtd2wsWXhPEAAAAC/anime-kiss-cute.gif", "https://media.tenor.com/1Tb8eN2nq0YAAAAC/kiss-anime.gif", "https://media.tenor.com/gU9YcH4q0sAAAAAC/anime-kiss-love.gif"],
  abracar: ["https://media.tenor.com/YmHap1Mrb0r98mqhj8AAAAC/anime-hug.gif", "https://media.tenor.com/R9UGudw6U0VvsePwmAAAAAC/anime-hug-cute.gif", "https://media.tenor.com/1T8n2S0nHbAAAAAC/hug-anime.gif", "https://media.tenor.com/X8zX1zS0nHYAAAAC/anime-hug-love.gif"],
  chutar: ["https://media.tenor.com/IRbWyxAtSYZzzJhLvGAAAAC/anime-kick.gif", "https://media.tenor.com/2C8XXg1612JNVR1l8YAAAAC/anime-kick-hit.gif", "https://media.tenor.com/Q3n8nX0nHbAAAAAC/anime-kick-fight.gif", "https://media.tenor.com/Y7Y2pW0nHbAAAAAC/kick-anime.gif"],
  louca: ["https://media.tenor.com/3oEjI6SIIHBdRxXI40/giphy.gif", "https://media.tenor.com/l0MYEqEzwMWFCg8rm/giphy.gif", "https://media.tenor.com/26BRuo6sLetdllPAQ/giphy.gif", "https://media.tenor.com/l4FGI8GoTL7N4DsyI/giphy.gif"]
}

const FRASES_MATAR = ["☠️ @A mandou @B de base!", "⚔️ @A atropelou @B com estilo!", "💥 @A pulverizou @B!", "🔥 @A mandou @B pra vala!", "🗡️ @A executou @B sem piedade!", "💀 @A venceu a batalha contra @B!", "🎯 @A acertou o golpe final em @B!"]
const FRASES_BEIJAR = ["💋 @A roubou um beijo de @B!", "😘 @A beijou @B apaixonadamente!", "💕 @A deu um beijo doce em @B!", "😍 @A não resistiu e beijou @B!", "🌹 @A beijou @B com carinho!"]
const FRASES_ABRACAR = ["🤗 @A abraçou @B apertado!", "💞 @A deu um abraço quentinho em @B!", "🫂 @A envolveu @B num abraço!", "💖 @A abraçou @B com muito carinho!", "🥰 @A deu aquele abraço gostoso em @B!"]
const FRASES_CHUTAR = ["🦵 @A deu um chute voador em @B!", "👟 @A chutou a bunda de @B!", "💢 @A meteu o pé em @B!", "🦶 @A chutou @B pra longe!", "⚡ @A deu um chute forte em @B!"]
const FRASES_LOUCA = ["🍽️ @A mandou @B lavar a louça!", "🧼 @A colocou @B pra lavar os pratos!", "💦 @A tá lavando a louça e chamou @B pra ajudar!", "🫧 @A mandou @B esfregar a panela!", "🧽 @A jogou o pano de prato em @B — vai trabalhar!"]

function sortearGif(lista) { return lista[Math.floor(Math.random() * lista.length)] }
function sortearFrase(lista, numA, numB) {
  const f = lista[Math.floor(Math.random() * lista.length)]
  return f.replace(/@A/g, "@" + numA).replace(/@B/g, "@" + numB)
}

async function enviarGif(sock, jid, url, frase, mentions, quoted) {
  try {
    const r = await fetch(url)
    if (!r.ok) throw new Error("HTTP " + r.status)
    const buffer = Buffer.from(await r.arrayBuffer())
    await sock.sendMessage(jid, { video: buffer, mimetype: "video/mp4", gifPlayback: true, caption: frase, mentions }, { quoted })
    return true
  } catch (e) {
    console.log("Erro enviarGif:", e.message)
    await sock.sendMessage(jid, { text: frase, mentions }, { quoted })
    return false
  }
}

function normalizar(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
}

function acharCasa(id) {
  return CASAS.find(c => c.id === id) || CASAS.find(c => normalizar(c.nome) === normalizar(id)) || CASAS.find(c => normalizar(c.nome).includes(normalizar(id)))
}
function acharPredio(id) {
  return PREDIOS.find(p => p.id === id) || PREDIOS.find(p => normalizar(p.nome) === normalizar(id)) || PREDIOS.find(p => normalizar(p.nome).includes(normalizar(id)))
}
function acharItem(id) {
  return MERCADO.find(i => i.id === id) || MERCADO.find(i => normalizar(i.nome) === normalizar(id)) || MERCADO.find(i => normalizar(i.nome).includes(normalizar(id)))
}

function getCidade() {
  const c = dbLer("cidade.json", { usuarios: {}, casas: {}, predios: {} })
  c.usuarios = c.usuarios || {}
  c.casas = c.casas || {}
  c.predios = c.predios || {}
  return c
}

function getUser(c, num) {
  c.usuarios[num] = c.usuarios[num] || {
    casa: null, predio: null, sujeiraCasa: 0, sujeiraPredio: 0,
    banco: 0, ultimoJuros: 0, itens: [], fome: 100, sede: 100,
    preso: null, crimes: 0, nivel: 1, xp: 0
  }
  const u = c.usuarios[num]
  u.itens = u.itens || []
  u.fome = u.fome ?? 100
  u.sede = u.sede ?? 100
  return u
}

function formatarTempo(ms) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (d > 0) return d + "d " + (h % 24) + "h"
  if (h > 0) return h + "h " + (m % 60) + "min"
  if (m > 0) return m + "min " + (s % 60) + "s"
  return s + "s"
}

function barraHP(v, max = 100) {
  const c = Math.max(0, Math.min(10, Math.round((v / max) * 10)))
  return "🟦".repeat(c) + "⬛".repeat(10 - c)
}

function fmtGold(v) {
  if (typeof v !== "number" || isNaN(v)) return "0"
  return Math.floor(v).toLocaleString("pt-BR")
}

module.exports = {
  menu: "menu-cidade",
  grupoOnly: false,
  adminOnly: false,
  donoOnly: false,

  async rendaAutomatica(sock, db) {
    const c = getCidade()
    const agora = Date.now()
    const INTERVALO_JUROS = 24 * 60 * 60 * 1000
    let alterou = false
    for (const [num, u] of Object.entries(c.usuarios)) {
      if ((u.banco || 0) > 0 && (agora - (u.ultimoJuros || 0)) >= INTERVALO_JUROS) {
        const juros = Math.floor(u.banco * BANCO.taxaJuros)
        u.banco += juros
        u.ultimoJuros = agora
        alterou = true
      }
    }
    if (alterou) dbSalvar("cidade.json", c)
  },

  commands: {

    menucidade: {
      aliases: ["cidade", "menuc", "comandoscidade"],
      async executar({ sock, msg, prefixoAtivo, db }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo
        const nomeBot = nomeBotDb(db)
        const cfg = db.config()
        const texto =
`❄️ • 𝐌𝐄𝐍𝐔 𝐂𝐈𝐃𝐀𝐃𝐄 •

╭─〔 🏙️ 𝐂𝐀𝐏𝐈𝐓𝐀𝐋 〕
│ A capital do império gelado.
╰──────────────

『 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐚𝐬 』 ↴

🏠 𝐂𝐀𝐒𝐀𝐒
╰➜ \`${p}lojacasa\`
╰➜ \`${p}comprarcasa <nome>\`
╰➜ \`${p}vendercasa\`
╰➜ \`${p}minhacasa\`
╰➜ \`${p}lavarcasa\`

🏢 𝐏𝐑𝐄́𝐃𝐈𝐎𝐒
╰➜ \`${p}lojapredio\`
╰➜ \`${p}comprarpredio <nome>\`
╰➜ \`${p}venderpredio\`
╰➜ \`${p}meupredio\`
╰➜ \`${p}lavarpredio\`

🏦 𝐁𝐀𝐍𝐂𝐎
╰➜ \`${p}banco\`
╰➜ \`${p}depositar <valor>\`
╰➜ \`${p}sacar <valor>\`
╰➜ \`${p}transferir @user <valor>\`
╰➜ \`${p}extrato\`

🛒 𝐌𝐄𝐑𝐂𝐀𝐃𝐎
╰➜ \`${p}mercado\`
╰➜ \`${p}compraritem <nome> <qtd>\`
╰➜ \`${p}mochila\`
╰➜ \`${p}consumir <nome>\`

🚔 𝐏𝐎𝐋𝐈́𝐂𝐈𝐀
╰➜ \`${p}crimeurbano\`
╰➜ \`${p}statuspreso\`
╰➜ \`${p}pagar fianca\`
╰➜ \`${p}fugircadeia\`

💞 𝐈𝐍𝐓𝐄𝐑𝐀𝐂̧𝐎̃𝐄𝐒
╰➜ \`${p}matar @user\`
╰➜ \`${p}beijar @user\`
╰➜ \`${p}abraçar @user\`
╰➜ \`${p}chutar @user\`
╰➜ \`${p}louça @user\`

👤 𝐏𝐄𝐑𝐅𝐈𝐋
╰➜ \`${p}cidadeperfil\`
╰➜ \`${p}ranking\`

❄️ _"Uma cidade forte, um império forte."_

"${nomeBot}"`

        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          if (cfg.tipoMenu === "video") return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "akaza.mp4", gifPlayback: true, caption: texto }, { quoted: msg })
          return sock.sendMessage(jid, { image: buf, caption: texto }, { quoted: msg })
        }
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    lojacasa: {
      aliases: ["casas", "lojacasas"],
      async executar({ sock, msg, prefixoAtivo, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        let txt = `❄️ • 𝐋𝐎𝐉𝐀 𝐃𝐄 𝐂𝐀𝐒𝐀𝐒 •\n\n『 𝐋𝐢𝐬𝐭𝐚 』 ↴\n\n`
        CASAS.forEach((c, i) => {
          txt += `${i + 1}. ${c.emoji} ${c.nome}\n╰➜ 💰 ${fmtGold(c.preco)} | 📈 +${c.renda}/h\n╰➜ 📝 ${c.desc}\n\n`
        })
        txt += `💡 Use \`!comprarcasa <nome>\`\n\n"${nomeBot}"`
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    comprarcasa: {
      aliases: ["buycasa"],
      async executar({ sock, msg, args, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)
        if (u.casa) {
          const atual = acharCasa(u.casa)
          return sock.sendMessage(jid, { text: `❄️ • 𝐂𝐎𝐌𝐏𝐑𝐀𝐑 𝐂𝐀𝐒𝐀 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Você já tem ${atual?.nome || u.casa}.\n╰──────────────\n\n💡 Venda primeiro com \`!vendercasa\`\n\n"${nomeBot}"` }, { quoted: msg })
        }
        const casa = acharCasa(args.join(" "))
        if (!casa) return sock.sendMessage(jid, { text: `❄️ • 𝐂𝐎𝐌𝐏𝐑𝐀𝐑 𝐂𝐀𝐒𝐀 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Casa não encontrada.\n╰──────────────\n\n💡 Veja \`!lojacasa\`\n\n"${nomeBot}"` }, { quoted: msg })
        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}
        rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        if ((rpg.usuarios[num].moedas || 0) < casa.preco) return sock.sendMessage(jid, { text: `❄️ • 𝐂𝐎𝐌𝐏𝐑𝐀𝐑 𝐂𝐀𝐒𝐀 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Faltam ${fmtGold(casa.preco - (rpg.usuarios[num].moedas || 0))} gold.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        rpg.usuarios[num].moedas -= casa.preco
        u.casa = casa.id
        u.sujeiraCasa = 0
        db.salvarRpg(rpg)
        dbSalvar("cidade.json", c)
        await sock.sendMessage(jid, { text: `❄️ • 𝐂𝐀𝐒𝐀 𝐂𝐎𝐌𝐏𝐑𝐀𝐃𝐀 •\n\n╭─〔 ✅ 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Um teto pro guerreiro.\n╰──────────────\n\n👤 𝐔𝐬𝐮𝐚́𝐫𝐢𝐨:\n╰➜ @${num}\n\n${casa.emoji} 𝐂𝐚𝐬𝐚:\n╰➜ ${casa.nome}\n\n📈 𝐑𝐞𝐧𝐝𝐚:\n╰➜ +${casa.renda}/h\n\n💰 𝐏𝐚𝐠𝐨:\n╰➜ -${fmtGold(casa.preco)}\n\n"${nomeBot}"`, mentions: [sender] }, { quoted: msg })
      }
    },

    vendercasa: {
      aliases: ["sellcasa"],
      async executar({ sock, msg, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)
        if (!u.casa) return sock.sendMessage(jid, { text: `❄️ • 𝐕𝐄𝐍𝐃𝐄𝐑 𝐂𝐀𝐒𝐀 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Você não tem casa.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const casa = acharCasa(u.casa)
        const valorVenda = Math.floor(casa.preco * 0.7)
        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}
        rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        rpg.usuarios[num].moedas = (rpg.usuarios[num].moedas || 0) + valorVenda
        u.casa = null
        u.sujeiraCasa = 0
        db.salvarRpg(rpg)
        dbSalvar("cidade.json", c)
        await sock.sendMessage(jid, { text: `❄️ • 𝐂𝐀𝐒𝐀 𝐕𝐄𝐍𝐃𝐈𝐃𝐀 •\n\n╭─〔 ✅ 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Adeus, lar.\n╰──────────────\n\n${casa.emoji} ${casa.nome}\n\n💰 𝐕𝐚𝐥𝐨𝐫:\n╰➜ +${fmtGold(valorVenda)}\n\n📉 (70% do valor)\n\n"${nomeBot}"`, mentions: [sender] }, { quoted: msg })
      }
    },

    minhacasa: {
      aliases: ["casastatus"],
      async executar({ sock, msg, utils, sender, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)
        if (!u.casa) return sock.sendMessage(jid, { text: `❄️ • 𝐌𝐈𝐍𝐇𝐀 𝐂𝐀𝐒𝐀 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Você não tem casa.\n╰──────────────\n\n💡 Use \`!lojacasa\`\n\n"${nomeBot}"` }, { quoted: msg })
        const casa = acharCasa(u.casa)
        const sujeira = u.sujeiraCasa || 0
        const statusSujeira = sujeira > 70 ? "🔴" : sujeira > 40 ? "🟡" : "🟢"
        const rendaAtual = Math.max(0, casa.renda - Math.floor(casa.renda * (sujeira / 100)))
        await sock.sendMessage(jid, { text: `❄️ • 𝐌𝐈𝐍𝐇𝐀 𝐂𝐀𝐒𝐀 •\n\n╭─〔 🏠 𝐒𝐓𝐀𝐓𝐔𝐒 〕\n│ ${casa.emoji} ${casa.nome}\n╰──────────────\n\n👤 @${num}\n\n📈 𝐑𝐞𝐧𝐝𝐚 𝐛𝐚𝐬𝐞:\n╰➜ +${casa.renda}/h\n\n📈 𝐑𝐞𝐧𝐝𝐚 𝐚𝐭𝐮𝐚𝐥:\n╰➜ +${rendaAtual}/h\n\n🧹 𝐒𝐮𝐣𝐞𝐢𝐫𝐚:\n╰➜ ${sujeira}% ${statusSujeira}\n\n${barraHP(100 - sujeira, 100)}\n\n${sujeira > 50 ? "⚠️ _A casa tá suja! Use !lavarcasa_" : "✅ _Tudo limpo._"}\n\n"${nomeBot}"`, mentions: [sender] }, { quoted: msg })
      }
    },

    lavarcasa: {
      aliases: ["limparcasa"],
      async executar({ sock, msg, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)
        if (!u.casa) return sock.sendMessage(jid, { text: `❄️ • 𝐋𝐀𝐕𝐀𝐑 𝐂𝐀𝐒𝐀 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Você não tem casa.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const sujeira = u.sujeiraCasa || 0
        if (sujeira === 0) return sock.sendMessage(jid, { text: `❄️ • 𝐋𝐀𝐕𝐀𝐑 𝐂𝐀𝐒𝐀 •\n\n╭─〔 ✅ 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Já tá limpa!\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const custo = Math.floor(sujeira * 5)
        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}
        rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        if ((rpg.usuarios[num].moedas || 0) < custo) return sock.sendMessage(jid, { text: `❄️ • 𝐋𝐀𝐕𝐀𝐑 𝐂𝐀𝐒𝐀 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Precisa de ${fmtGold(custo)} gold.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        rpg.usuarios[num].moedas -= custo
        u.sujeiraCasa = 0
        db.salvarRpg(rpg)
        dbSalvar("cidade.json", c)
        await sock.sendMessage(jid, { text: `❄️ • 𝐂𝐀𝐒𝐀 𝐋𝐈𝐌𝐏𝐀 •\n\n╭─〔 ✅ 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ A sujeira foi removida.\n╰──────────────\n\n💰 𝐏𝐚𝐠𝐨:\n╰➜ -${fmtGold(custo)}\n\n✨ 𝐒𝐮𝐣𝐞𝐢𝐫𝐚:\n╰➜ 0%\n\n"${nomeBot}"`, mentions: [sender] }, { quoted: msg })
      }
    },

    lojapredio: {
      aliases: ["predios", "lojapredios"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        let txt = `❄️ • 𝐋𝐎𝐉𝐀 𝐃𝐄 𝐏𝐑𝐄́𝐃𝐈𝐎𝐒 •\n\n『 𝐋𝐢𝐬𝐭𝐚 』 ↴\n\n`
        PREDIOS.forEach((p, i) => {
          txt += `${i + 1}. ${p.emoji} ${p.nome}\n╰➜ 💰 ${fmtGold(p.preco)} | 📈 +${p.renda}/h\n╰➜ 📝 ${p.desc}\n\n`
        })
        txt += `💡 Use \`!comprarpredio <nome>\`\n\n"${nomeBot}"`
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    comprarpredio: {
      aliases: ["buypredio"],
      async executar({ sock, msg, args, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)
        if (u.predio) {
          const atual = acharPredio(u.predio)
          return sock.sendMessage(jid, { text: `❄️ • 𝐂𝐎𝐌𝐏𝐑𝐀𝐑 𝐏𝐑𝐄́𝐃𝐈𝐎 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Você já tem ${atual?.nome || u.predio}.\n╰──────────────\n\n💡 Venda com \`!venderpredio\`\n\n"${nomeBot}"` }, { quoted: msg })
        }
        const predio = acharPredio(args.join(" "))
        if (!predio) return sock.sendMessage(jid, { text: `❄️ • 𝐂𝐎𝐌𝐏𝐑𝐀𝐑 𝐏𝐑𝐄́𝐃𝐈𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Prédio não encontrado.\n╰──────────────\n\n💡 Veja \`!lojapredio\`\n\n"${nomeBot}"` }, { quoted: msg })
        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}
        rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        if ((rpg.usuarios[num].moedas || 0) < predio.preco) return sock.sendMessage(jid, { text: `❄️ • 𝐂𝐎𝐌𝐏𝐑𝐀𝐑 𝐏𝐑𝐄́𝐃𝐈𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Faltam ${fmtGold(predio.preco - (rpg.usuarios[num].moedas || 0))} gold.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        rpg.usuarios[num].moedas -= predio.preco
        u.predio = predio.id
        u.sujeiraPredio = 0
        db.salvarRpg(rpg)
        dbSalvar("cidade.json", c)
        await sock.sendMessage(jid, { text: `❄️ • 𝐏𝐑𝐄́𝐃𝐈𝐎 𝐂𝐎𝐌𝐏𝐑𝐀𝐃𝐎 •\n\n╭─〔 ✅ 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Um império se ergue.\n╰──────────────\n\n👤 @${num}\n\n${predio.emoji} ${predio.nome}\n\n📈 𝐑𝐞𝐧𝐝𝐚:\n╰➜ +${predio.renda}/h\n\n💰 𝐏𝐚𝐠𝐨:\n╰➜ -${fmtGold(predio.preco)}\n\n"${nomeBot}"`, mentions: [sender] }, { quoted: msg })
      }
    },

    venderpredio: {
      aliases: ["sellpredio"],
      async executar({ sock, msg, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)
        if (!u.predio) return sock.sendMessage(jid, { text: `❄️ • 𝐕𝐄𝐍𝐃𝐄𝐑 𝐏𝐑𝐄́𝐃𝐈𝐎 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Você não tem prédio.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const predio = acharPredio(u.predio)
        const valorVenda = Math.floor(predio.preco * 0.7)
        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}
        rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        rpg.usuarios[num].moedas = (rpg.usuarios[num].moedas || 0) + valorVenda
        u.predio = null
        u.sujeiraPredio = 0
        db.salvarRpg(rpg)
        dbSalvar("cidade.json", c)
        await sock.sendMessage(jid, { text: `❄️ • 𝐏𝐑𝐄́𝐃𝐈𝐎 𝐕𝐄𝐍𝐃𝐈𝐃𝐎 •\n\n╭─〔 ✅ 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Negócio fechado.\n╰──────────────\n\n${predio.emoji} ${predio.nome}\n\n💰 𝐕𝐚𝐥𝐨𝐫:\n╰➜ +${fmtGold(valorVenda)}\n\n📉 (70% do valor)\n\n"${nomeBot}"`, mentions: [sender] }, { quoted: msg })
      }
    },

    meupredio: {
      aliases: ["prediostatus"],
      async executar({ sock, msg, utils, sender, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)
        if (!u.predio) return sock.sendMessage(jid, { text: `❄️ • 𝐌𝐄𝐔 𝐏𝐑𝐄́𝐃𝐈𝐎 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Você não tem prédio.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const predio = acharPredio(u.predio)
        const sujeira = u.sujeiraPredio || 0
        const statusSujeira = sujeira > 70 ? "🔴" : sujeira > 40 ? "🟡" : "🟢"
        const rendaAtual = Math.max(0, predio.renda - Math.floor(predio.renda * (sujeira / 100)))
        await sock.sendMessage(jid, { text: `❄️ • 𝐌𝐄𝐔 𝐏𝐑𝐄́𝐃𝐈𝐎 •\n\n╭─〔 🏢 𝐒𝐓𝐀𝐓𝐔𝐒 〕\n│ ${predio.emoji} ${predio.nome}\n╰──────────────\n\n👤 @${num}\n\n📈 𝐑𝐞𝐧𝐝𝐚 𝐛𝐚𝐬𝐞:\n╰➜ +${predio.renda}/h\n\n📈 𝐑𝐞𝐧𝐝𝐚 𝐚𝐭𝐮𝐚𝐥:\n╰➜ +${rendaAtual}/h\n\n🧹 𝐒𝐮𝐣𝐞𝐢𝐫𝐚:\n╰➜ ${sujeira}% ${statusSujeira}\n\n${barraHP(100 - sujeira, 100)}\n\n"${nomeBot}"`, mentions: [sender] }, { quoted: msg })
      }
    },

    lavarpredio: {
      aliases: ["limparpredio"],
      async executar({ sock, msg, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)
        if (!u.predio) return sock.sendMessage(jid, { text: `❄️ • 𝐋𝐀𝐕𝐀𝐑 𝐏𝐑𝐄́𝐃𝐈𝐎 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Você não tem prédio.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const sujeira = u.sujeiraPredio || 0
        if (sujeira === 0) return sock.sendMessage(jid, { text: `❄️ • 𝐋𝐀𝐕𝐀𝐑 𝐏𝐑𝐄́𝐃𝐈𝐎 •\n\n╭─〔 ✅ 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Já tá limpo!\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const custo = Math.floor(sujeira * 10)
        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}
        rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        if ((rpg.usuarios[num].moedas || 0) < custo) return sock.sendMessage(jid, { text: `❄️ • 𝐋𝐀𝐕𝐀𝐑 𝐏𝐑𝐄́𝐃𝐈𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Precisa de ${fmtGold(custo)} gold.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        rpg.usuarios[num].moedas -= custo
        u.sujeiraPredio = 0
        db.salvarRpg(rpg)
        dbSalvar("cidade.json", c)
        await sock.sendMessage(jid, { text: `❄️ • 𝐏𝐑𝐄́𝐃𝐈𝐎 𝐋𝐈𝐌𝐏𝐎 •\n\n╭─〔 ✅ 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Sujeira removida.\n╰──────────────\n\n💰 𝐏𝐚𝐠𝐨:\n╰➜ -${fmtGold(custo)}\n\n✨ 𝐒𝐮𝐣𝐞𝐢𝐫𝐚:\n╰➜ 0%\n\n"${nomeBot}"`, mentions: [sender] }, { quoted: msg })
      }
    },

    banco: {
      aliases: ["bancostatus", "minhaconta"],
      async executar({ sock, msg, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)
        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}
        const gold = (rpg.usuarios[num]?.moedas) || 0
        await sock.sendMessage(jid, { text: `❄️ • 𝐁𝐀𝐍𝐂𝐎 𝐈𝐌𝐏𝐄𝐑𝐈𝐀𝐋 •\n\n╭─〔 🏦 𝐒𝐓𝐀𝐓𝐔𝐒 〕\n│ Sua conta bancária.\n╰──────────────\n\n👤 @${num}\n\n💵 𝐂𝐚𝐫𝐭𝐞𝐢𝐫𝐚:\n╰➜ ${fmtGold(gold)}\n\n🏦 𝐁𝐚𝐧𝐜𝐨:\n╰➜ ${fmtGold(u.banco || 0)}\n\n📈 𝐉𝐮𝐫𝐨𝐬:\n╰➜ ${(BANCO.taxaJuros * 100).toFixed(0)}%/dia\n\n💰 𝐓𝐨𝐭𝐚𝐥:\n╰➜ ${fmtGold(gold + (u.banco || 0))}\n\n💡 \`!depositar <valor>\` | \`!sacar <valor>\`\n\n"${nomeBot}"`, mentions: [sender] }, { quoted: msg })
      }
    },

    depositar: {
      aliases: ["dep"],
      async executar({ sock, msg, args, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)
        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}
        rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        const gold = Math.floor(rpg.usuarios[num].moedas || 0)
        let valor = args[0] === "tudo" ? gold : Math.floor(parseInt(args[0]) || 0)
        if (!valor || valor <= 0) return sock.sendMessage(jid, { text: `❄️ • 𝐃𝐄𝐏𝐎𝐒𝐈𝐓𝐀𝐑 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Informe o valor.\n╰──────────────\n\n💡 \`!depositar <valor>\`\n\n"${nomeBot}"` }, { quoted: msg })
        if (valor > gold) return sock.sendMessage(jid, { text: `❄️ • 𝐃𝐄𝐏𝐎𝐒𝐈𝐓𝐀𝐑 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Você só tem ${fmtGold(gold)} gold.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        rpg.usuarios[num].moedas = gold - valor
        u.banco = Math.floor((u.banco || 0) + valor)
        db.salvarRpg(rpg)
        dbSalvar("cidade.json", c)
        await sock.sendMessage(jid, { text: `❄️ • 𝐃𝐄𝐏𝐎́𝐒𝐈𝐓𝐎 •\n\n╭─〔 ✅ 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Gold guardado no banco.\n╰──────────────\n\n💵 𝐃𝐞𝐩𝐨𝐬𝐢𝐭𝐚𝐝𝐨:\n╰➜ -${fmtGold(valor)}\n\n🏦 𝐁𝐚𝐧𝐜𝐨:\n╰➜ ${fmtGold(u.banco)}\n\n"${nomeBot}"`, mentions: [sender] }, { quoted: msg })
      }
    },

    sacar: {
      aliases: ["saque"],
      async executar({ sock, msg, args, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)
        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}
        rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        let valor = args[0] === "tudo" ? Math.floor(u.banco || 0) : Math.floor(parseInt(args[0]) || 0)
        if (!valor || valor <= 0) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐀𝐂𝐀𝐑 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Informe o valor.\n╰──────────────\n\n💡 \`!sacar <valor>\`\n\n"${nomeBot}"` }, { quoted: msg })
        if (valor > (u.banco || 0)) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐀𝐂𝐀𝐑 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Você só tem ${fmtGold(u.banco)} no banco.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        if (valor > BANCO.limiteSaque) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐀𝐂𝐀𝐑 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Limite por saque: ${fmtGold(BANCO.limiteSaque)}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const taxa = Math.floor(valor * BANCO.taxaSaque)
        const recebido = valor - taxa
        u.banco = Math.floor((u.banco || 0) - valor)
        rpg.usuarios[num].moedas = Math.floor((rpg.usuarios[num].moedas || 0) + recebido)
        db.salvarRpg(rpg)
        dbSalvar("cidade.json", c)
        await sock.sendMessage(jid, { text: `❄️ • 𝐒𝐀𝐐𝐔𝐄 •\n\n╭─〔 ✅ 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Dinheiro retirado.\n╰──────────────\n\n💵 𝐒𝐚𝐪𝐮𝐞:\n╰➜ ${fmtGold(valor)}\n\n💸 𝐓𝐚𝐱𝐚 (1%):\n╰➜ -${fmtGold(taxa)}\n\n✅ 𝐑𝐞𝐜𝐞𝐛𝐢𝐝𝐨:\n╰➜ +${fmtGold(recebido)}\n\n🏦 𝐁𝐚𝐧𝐜𝐨:\n╰➜ ${fmtGold(u.banco)}\n\n👛 𝐂𝐚𝐫𝐭𝐞𝐢𝐫𝐚:\n╰➜ ${fmtGold(rpg.usuarios[num].moedas)}\n\n"${nomeBot}"`, mentions: [sender] }, { quoted: msg })
      }
    },

    transferir: {
      aliases: ["pix", "transf"],
      async executar({ sock, msg, args, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender)
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: `❄️ • 𝐓𝐑𝐀𝐍𝐒𝐅𝐄𝐑𝐈𝐑 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Marque um usuário.\n╰──────────────\n\n💡 \`!transferir @user <valor>\`\n\n"${nomeBot}"` }, { quoted: msg })
        const numAlvo = utils.soNumero(alvo)
        if (num === numAlvo) return sock.sendMessage(jid, { text: `❄️ • 𝐓𝐑𝐀𝐍𝐒𝐅𝐄𝐑𝐈𝐑 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Não pode transferir pra você.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const valor = Math.floor(parseInt(args.filter(a => !a.startsWith("@"))[0]) || 0)
        if (!valor || valor <= 0) return sock.sendMessage(jid, { text: `❄️ • 𝐓𝐑𝐀𝐍𝐒𝐅𝐄𝐑𝐈𝐑 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Valor inválido.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}
        rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        rpg.usuarios[numAlvo] = rpg.usuarios[numAlvo] || { moedas: 0 }
        if ((rpg.usuarios[num].moedas || 0) < valor) return sock.sendMessage(jid, { text: `❄️ • 𝐓𝐑𝐀𝐍𝐒𝐅𝐄𝐑𝐈𝐑 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Sem gold suficiente.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        rpg.usuarios[num].moedas -= valor
        rpg.usuarios[numAlvo].moedas = (rpg.usuarios[numAlvo].moedas || 0) + valor
        db.salvarRpg(rpg)
        await sock.sendMessage(jid, { text: `❄️ • 𝐓𝐑𝐀𝐍𝐒𝐅𝐄𝐑𝐄̂𝐍𝐂𝐈𝐀 •\n\n╭─〔 ✅ 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Ouro passou de mão em mão.\n╰──────────────\n\n👤 𝐃𝐞:\n╰➜ @${num}\n\n➡️ 𝐏𝐚𝐫𝐚:\n╰➜ @${numAlvo}\n\n💰 𝐕𝐚𝐥𝐨𝐫:\n╰➜ ${fmtGold(valor)}\n\n"${nomeBot}"`, mentions: [sender, alvo] }, { quoted: msg })
      }
    },

    extrato: {
      aliases: ["historico"],
      async executar({ sock, msg, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)
        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}
        const gold = (rpg.usuarios[num]?.moedas) || 0
        const casa = u.casa ? acharCasa(u.casa) : null
        const predio = u.predio ? acharPredio(u.predio) : null
        const patrimonio = gold + (u.banco || 0) + (casa ? casa.preco : 0) + (predio ? predio.preco : 0)
        await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐗𝐓𝐑𝐀𝐓𝐎 •\n\n╭─〔 📊 𝐏𝐀𝐓𝐑𝐈𝐌𝐎̂𝐍𝐈𝐎 〕\n│ Resumo dos seus bens.\n╰──────────────\n\n👤 @${num}\n\n💵 𝐂𝐚𝐫𝐭𝐞𝐢𝐫𝐚:\n╰➜ ${fmtGold(gold)}\n\n🏦 𝐁𝐚𝐧𝐜𝐨:\n╰➜ ${fmtGold(u.banco || 0)}\n\n🏠 𝐂𝐚𝐬𝐚:\n╰➜ ${casa ? casa.nome : "Nenhuma"}\n\n🏢 𝐏𝐫𝐞́𝐝𝐢𝐨:\n╰➜ ${predio ? predio.nome : "Nenhum"}\n\n📈 𝐓𝐨𝐭𝐚𝐥:\n╰➜ ${fmtGold(patrimonio)}\n\n"${nomeBot}"`, mentions: [sender] }, { quoted: msg })
      }
    },

    mercado: {
      aliases: ["loja", "mercadoitens"],
      async executar({ sock, msg, prefixoAtivo, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        let txt = `❄️ • 𝐌𝐄𝐑𝐂𝐀𝐃𝐎 𝐈𝐌𝐏𝐄𝐑𝐈𝐀𝐋 •\n\n『 𝐋𝐢𝐬𝐭𝐚 』 ↴\n\n`
        MERCADO.forEach((i, idx) => {
          txt += `${idx + 1}. ${i.emoji} ${i.nome}\n╰➜ 💰 ${i.preco} | ${i.desc}\n\n`
        })
        txt += `💡 \`!compraritem <nome> <qtd>\`\n🍽️ \`!consumir <nome>\`\n\n"${nomeBot}"`
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    compraritem: {
      aliases: ["buyitem"],
      async executar({ sock, msg, args, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)
        let qtd = 1
        if (/^\d+$/.test(args[args.length - 1])) { qtd = parseInt(args.pop()) }
        const item = acharItem(args.join(" "))
        if (!item) return sock.sendMessage(jid, { text: `❄️ • 𝐂𝐎𝐌𝐏𝐑𝐀𝐑 𝐈𝐓𝐄𝐌 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Item não encontrado.\n╰──────────────\n\n💡 Veja \`!mercado\`\n\n"${nomeBot}"` }, { quoted: msg })
        if (qtd < 1 || qtd > 100) return sock.sendMessage(jid, { text: `❄️ • 𝐂𝐎𝐌𝐏𝐑𝐀𝐑 𝐈𝐓𝐄𝐌 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Qtd: 1-100\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const total = item.preco * qtd
        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}
        rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        if ((rpg.usuarios[num].moedas || 0) < total) return sock.sendMessage(jid, { text: `❄️ • 𝐂𝐎𝐌𝐏𝐑𝐀𝐑 𝐈𝐓𝐄𝐌 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Faltam ${fmtGold(total - (rpg.usuarios[num].moedas || 0))} gold.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        rpg.usuarios[num].moedas -= total
        const existente = u.itens.find(i => i.id === item.id)
        if (existente) existente.qtd += qtd
        else u.itens.push({ id: item.id, nome: item.nome, emoji: item.emoji, qtd, cura: item.cura })
        db.salvarRpg(rpg)
        dbSalvar("cidade.json", c)
        await sock.sendMessage(jid, { text: `❄️ • 𝐂𝐎𝐌𝐏𝐑𝐀 𝐑𝐄𝐀𝐋𝐈𝐙𝐀𝐃𝐀 •\n\n╭─〔 ✅ 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Item comprado com sucesso.\n╰──────────────\n\n${item.emoji} ${item.nome} x${qtd}\n\n💰 𝐏𝐚𝐠𝐨:\n╰➜ -${fmtGold(total)}\n\n📦 \`!mochila\` pra ver\n\n"${nomeBot}"`, mentions: [sender] }, { quoted: msg })
      }
    },

    mochila: {
      aliases: ["inventario", "itens"],
      async executar({ sock, msg, utils, sender, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)
        if (!u.itens.length) return sock.sendMessage(jid, { text: `❄️ • 𝐌𝐎𝐂𝐇𝐈𝐋𝐀 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Mochila vazia.\n╰──────────────\n\n💡 \`!mercado\`\n\n"${nomeBot}"` }, { quoted: msg })
        let txt = `❄️ • 𝐌𝐎𝐂𝐇𝐈𝐋𝐀 •\n\n╭─〔 🎒 𝐈𝐓𝐄𝐍𝐒 〕\n│ @${num}\n╰──────────────\n\n`
        u.itens.forEach(i => {
          txt += `${i.emoji} ${i.nome} x${i.qtd}\n`
        })
        txt += `\n🍽️ \`!consumir <nome>\`\n\n"${nomeBot}"`
        await sock.sendMessage(jid, { text: txt, mentions: [sender] }, { quoted: msg })
      }
    },

    consumir: {
      aliases: ["comer", "beber", "usar"],
      async executar({ sock, msg, args, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)
        const item = acharItem(args.join(" "))
        if (!item) return sock.sendMessage(jid, { text: `❄️ • 𝐂𝐎𝐍𝐒𝐔𝐌𝐈𝐑 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Item não encontrado.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const idx = u.itens.findIndex(i => i.id === item.id)
        if (idx === -1 || u.itens[idx].qtd <= 0) return sock.sendMessage(jid, { text: `❄️ • 𝐂𝐎𝐍𝐒𝐔𝐌𝐈𝐑 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Você não tem ${item.nome}.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        u.itens[idx].qtd--
        if (u.itens[idx].qtd <= 0) u.itens.splice(idx, 1)
        if (item.id === "agua" || item.id === "cerveja" || item.id === "cafe" || item.id === "suco" || item.id === "energetico") {
          u.sede = Math.min(100, (u.sede || 100) + item.cura)
        } else if (item.cura > 0) {
          u.fome = Math.min(100, (u.fome || 100) + item.cura)
        }
        dbSalvar("cidade.json", c)
        await sock.sendMessage(jid, { text: `❄️ • 𝐂𝐎𝐍𝐒𝐔𝐌𝐈𝐃𝐎 •\n\n╭─〔 ✅ 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ ${item.emoji} ${item.nome}\n╰──────────────\n\n🍖 𝐅𝐨𝐦𝐞:\n╰➜ ${u.fome}%\n\n💧 𝐒𝐞𝐝𝐞:\n╰➜ ${u.sede}%\n\n"${nomeBot}"`, mentions: [sender] }, { quoted: msg })
      }
    },

    crimeurbano: {
      aliases: ["crimecidade"],
      async executar({ sock, msg, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)
        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}
        rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        if (u.preso && u.preso > Date.now()) return sock.sendMessage(jid, { text: `❄️ • 𝐂𝐑𝐈𝐌𝐄 •\n\n╭─〔 🚔 𝐏𝐑𝐄𝐒𝐎 〕\n│ Você já tá preso.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        if (u.ultimoCrimeUrbano && (Date.now() - u.ultimoCrimeUrbano) < 30 * 60 * 1000) return sock.sendMessage(jid, { text: `❄️ • 𝐂𝐑𝐈𝐌𝐄 •\n\n╭─〔 ⏰ 𝐀𝐆𝐔𝐀𝐑𝐃𝐄 〕\n│ ${formatarTempo(30 * 60 * 1000 - (Date.now() - u.ultimoCrimeUrbano))}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const alvos = [
          { nome: "Padaria", valor: 200, risco: 0.20 },
          { nome: "Farmácia", valor: 500, risco: 0.30 },
          { nome: "Joalheria", valor: 2000, risco: 0.50 },
          { nome: "Banco Central", valor: 10000, risco: 0.75 },
          { nome: "Residência", valor: 300, risco: 0.15 }
        ]
        const alvo = alvos[Math.floor(Math.random() * alvos.length)]
        u.ultimoCrimeUrbano = Date.now()
        u.crimes = (u.crimes || 0) + 1
        if (Math.random() > alvo.risco) {
          const bonus = Math.floor(alvo.valor * (1 + u.crimes * 0.02))
          rpg.usuarios[num].moedas = (rpg.usuarios[num].moedas || 0) + bonus
          u.xp = (u.xp || 0) + 15
          db.salvarRpg(rpg); dbSalvar("cidade.json", c)
          await sock.sendMessage(jid, { text: `❄️ • 𝐂𝐑𝐈𝐌𝐄 𝐁𝐄𝐌-𝐒𝐔𝐂𝐄𝐃𝐈𝐃𝐎 •\n\n╭─〔 ✅ 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ A força atacou.\n╰──────────────\n\n🏪 𝐀𝐥𝐯𝐨:\n╰➜ ${alvo.nome}\n\n💰 𝐁𝐨𝐭𝐢𝐦:\n╰➜ +${fmtGold(bonus)}\n\n🎯 𝐗𝐏:\n╰➜ +15\n\n"${nomeBot}"`, mentions: [sender] }, { quoted: msg })
        } else {
          const tempo = POLICIA.tempoPadrao + Math.floor(alvo.valor / 100) * 60 * 1000
          u.preso = Date.now() + tempo
          dbSalvar("cidade.json", c)
          await sock.sendMessage(jid, { text: `❄️ • 𝐏𝐑𝐄𝐒𝐎 •\n\n╭─〔 🚔 𝐏𝐎𝐋𝐈́𝐂𝐈𝐀 〕\n│ Você foi pego!\n╰──────────────\n\n🏪 𝐀𝐥𝐯𝐨:\n╰➜ ${alvo.nome}\n\n⏰ 𝐓𝐞𝐦𝐩𝐨:\n╰➜ ${formatarTempo(tempo)}\n\n💰 𝐅𝐢𝐚𝐧𝐜̧𝐚:\n╰➜ ${fmtGold(tempo / 60000 * POLICIA.fiancaPorMinuto)} gold\n\n💡 \`!pagar fianca\`\n\n"${nomeBot}"`, mentions: [sender] }, { quoted: msg })
        }
      }
    },

    statuspreso: {
      aliases: ["cadeia", "minhapena"],
      async executar({ sock, msg, utils, sender, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)
        if (!u.preso || u.preso <= Date.now()) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐓𝐀𝐓𝐔𝐒 •\n\n╭─〔 ✅ 𝐋𝐈𝐕𝐑𝐄 〕\n│ Você tá livre.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const restante = u.preso - Date.now()
        const fianca = Math.floor(restante / 60000 * POLICIA.fiancaPorMinuto)
        await sock.sendMessage(jid, { text: `❄️ • 𝐏𝐑𝐄𝐒𝐎 •\n\n╭─〔 🚔 𝐂𝐀𝐃𝐄𝐈𝐀 〕\n│ Você está preso.\n╰──────────────\n\n⏰ 𝐑𝐞𝐬𝐭𝐚𝐧𝐭𝐞:\n╰➜ ${formatarTempo(restante)}\n\n💰 𝐅𝐢𝐚𝐧𝐜̧𝐚:\n╰➜ ${fmtGold(fianca)} gold\n\n💡 \`!pagar fianca\` | \`!fugircadeia\`\n\n"${nomeBot}"`, mentions: [sender] }, { quoted: msg })
      }
    },

    pagar: {
      aliases: ["fianca"],
      async executar({ sock, msg, args, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)
        if (args[0] && args[0].toLowerCase() !== "fianca") return sock.sendMessage(jid, { text: `❄️ • 𝐏𝐀𝐆𝐀𝐑 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Use o comando certo.\n╰──────────────\n\n💡 \`!pagar fianca\`\n\n"${nomeBot}"` }, { quoted: msg })
        if (!u.preso || u.preso <= Date.now()) return sock.sendMessage(jid, { text: `❄️ • 𝐏𝐀𝐆𝐀𝐑 •\n\n╭─〔 ✅ 𝐋𝐈𝐕𝐑𝐄 〕\n│ Você tá livre.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const restante = u.preso - Date.now()
        const fianca = Math.floor(restante / 60000 * POLICIA.fiancaPorMinuto)
        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}
        rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        if ((rpg.usuarios[num].moedas || 0) < fianca) return sock.sendMessage(jid, { text: `❄️ • 𝐏𝐀𝐆𝐀𝐑 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Faltam ${fmtGold(fianca - (rpg.usuarios[num].moedas || 0))} gold.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        rpg.usuarios[num].moedas -= fianca
        u.preso = null
        db.salvarRpg(rpg); dbSalvar("cidade.json", c)
        await sock.sendMessage(jid, { text: `❄️ • 𝐅𝐈𝐀𝐍𝐂̧𝐀 𝐏𝐀𝐆𝐀 •\n\n╭─〔 ✅ 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Você está livre.\n╰──────────────\n\n💸 𝐏𝐚𝐠𝐨:\n╰➜ -${fmtGold(fianca)}\n\n❄️ _"A liberdade tem seu preço."_\n\n"${nomeBot}"`, mentions: [sender] }, { quoted: msg })
      }
    },

    fugircadeia: {
      aliases: ["fugir", "escapar"],
      async executar({ sock, msg, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)
        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}
        rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        if (!u.preso || u.preso <= Date.now()) return sock.sendMessage(jid, { text: `❄️ • 𝐅𝐔𝐆𝐈𝐑 •\n\n╭─〔 ✅ 𝐋𝐈𝐕𝐑𝐄 〕\n│ Você tá livre.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const chance = 0.30 + (u.crimes || 0) * 0.01
        if (Math.random() < chance) {
          u.preso = null
          dbSalvar("cidade.json", c)
          await sock.sendMessage(jid, { text: `❄️ • 𝐅𝐔𝐆𝐀 𝐁𝐄𝐌-𝐒𝐔𝐂𝐄𝐃𝐈𝐃𝐀 •\n\n╭─〔 ✅ 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Você escapou.\n╰──────────────\n\n❄️ _"Ninguém prende o Akaza."_\n\n"${nomeBot}"`, mentions: [sender] }, { quoted: msg })
        } else {
          const multa = POLICIA.multaFuga
          rpg.usuarios[num].moedas = Math.max(0, (rpg.usuarios[num].moedas || 0) - multa)
          u.preso = Date.now() + 20 * 60 * 1000
          db.salvarRpg(rpg); dbSalvar("cidade.json", c)
          await sock.sendMessage(jid, { text: `❄️ • 𝐅𝐔𝐆𝐀 𝐅𝐑𝐀𝐂𝐀𝐒𝐒𝐀𝐃𝐀 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ A polícia te pegou.\n╰──────────────\n\n💸 𝐌𝐮𝐥𝐭𝐚:\n╰➜ -${fmtGold(multa)}\n\n⏰ 𝐏𝐞𝐧𝐚 𝐞𝐱𝐭𝐫𝐚:\n╰➜ +20min\n\n"${nomeBot}"`, mentions: [sender] }, { quoted: msg })
        }
      }
    },

    matar: {
      aliases: ["mat4r", "assassinar"],
      async executar({ sock, msg, utils, sender }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: "☠️ Use *!matar @user* (ou responda)" }, { quoted: msg })
        const numA = utils.soNumero(sender)
        const numB = utils.soNumero(alvo)
        if (numA === numB) return sock.sendMessage(jid, { text: "🤔 Não pode matar você mesmo!" }, { quoted: msg })
        const gif = sortearGif(GIFS.matar)
        const frase = sortearFrase(FRASES_MATAR, numA, numB) + "\n\n❄️ _\"Guerra é guerra.\"_"
        await enviarGif(sock, jid, gif, frase, [sender, alvo], msg)
      }
    },

    beijar: {
      aliases: ["beijo", "kiss", "beij4r"],
      async executar({ sock, msg, utils, sender }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: "💋 Use *!beijar @user* (ou responda)" }, { quoted: msg })
        const numA = utils.soNumero(sender)
        const numB = utils.soNumero(alvo)
        if (numA === numB) return sock.sendMessage(jid, { text: "🤔 Beijar a si mesmo? Sem graça..." }, { quoted: msg })
        const gif = sortearGif(GIFS.beijar)
        const frase = sortearFrase(FRASES_BEIJAR, numA, numB) + "\n\n💕 _\"O amor vence batalhas.\"_"
        await enviarGif(sock, jid, gif, frase, [sender, alvo], msg)
      }
    },

    "abraçar": {
      aliases: ["abraco", "abracar", "hug"],
      async executar({ sock, msg, utils, sender }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: "🤗 Use *!abraçar @user* (ou responda)" }, { quoted: msg })
        const numA = utils.soNumero(sender)
        const numB = utils.soNumero(alvo)
        if (numA === numB) return sock.sendMessage(jid, { text: "🤔 Se abraçar sozinho? Triste..." }, { quoted: msg })
        const gif = sortearGif(GIFS.abracar)
        const frase = sortearFrase(FRASES_ABRACAR, numA, numB) + "\n\n💞 _\"Um abraço cura tudo.\"_"
        await enviarGif(sock, jid, gif, frase, [sender, alvo], msg)
      }
    },

    chutar: {
      aliases: ["chut4r", "kickar"],
      async executar({ sock, msg, utils, sender }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: "🦵 Use *!chutar @user* (ou responda)" }, { quoted: msg })
        const numA = utils.soNumero(sender)
        const numB = utils.soNumero(alvo)
        if (numA === numB) return sock.sendMessage(jid, { text: "🤔 Se chutar? Sei não..." }, { quoted: msg })
        const gif = sortearGif(GIFS.chutar)
        const frase = sortearFrase(FRASES_CHUTAR, numA, numB) + "\n\n🦶 _\"Tomou um chute voador!\"_"
        await enviarGif(sock, jid, gif, frase, [sender, alvo], msg)
      }
    },

    "louça": {
      aliases: ["louca", "lavarlouca", "pratos"],
      async executar({ sock, msg, utils, sender }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: "🍽️ Use *!louça @user* (ou responda)" }, { quoted: msg })
        const numA = utils.soNumero(sender)
        const numB = utils.soNumero(alvo)
        if (numA === numB) return sock.sendMessage(jid, { text: "🤔 Se mandar lavar louça? Kkkk" }, { quoted: msg })
        const gif = sortearGif(GIFS.louca)
        const frase = sortearFrase(FRASES_LOUCA, numA, numB) + "\n\n🧽 _\"A pia não vai se limpar sozinha.\"_"
        await enviarGif(sock, jid, gif, frase, [sender, alvo], msg)
      }
    },

    cidadeperfil: {
      aliases: ["perfilcidade", "cidadao"],
      async executar({ sock, msg, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)
        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}
        const gold = (rpg.usuarios[num]?.moedas) || 0
        const casa = u.casa ? acharCasa(u.casa) : null
        const predio = u.predio ? acharPredio(u.predio) : null
        const nivel = u.nivel || 1
        const xp = u.xp || 0
        const xpNec = nivel * 100
        const rendaHora = (casa ? casa.renda : 0) + (predio ? predio.renda : 0)
        await sock.sendMessage(jid, { text: `❄️ • 𝐂𝐈𝐃𝐀𝐃𝐀̃𝐎 •\n\n╭─〔 👤 𝐏𝐄𝐑𝐅𝐈𝐋 〕\n│ @${num}\n╰──────────────\n\n🎖️ 𝐍𝐢́𝐯𝐞𝐥:\n╰➜ ${nivel} (${xp}/${xpNec} XP)\n\n💵 𝐂𝐚𝐫𝐭𝐞𝐢𝐫𝐚:\n╰➜ ${fmtGold(gold)}\n\n🏦 𝐁𝐚𝐧𝐜𝐨:\n╰➜ ${fmtGold(u.banco || 0)}\n\n🏠 𝐂𝐚𝐬𝐚:\n╰➜ ${casa?.nome || "Nenhuma"}\n\n🏢 𝐏𝐫𝐞́𝐝𝐢𝐨:\n╰➜ ${predio?.nome || "Nenhum"}\n\n📈 𝐑𝐞𝐧𝐝𝐚 𝐭𝐨𝐭𝐚𝐥:\n╰➜ +${rendaHora}/h\n\n🍖 𝐅𝐨𝐦𝐞:\n╰➜ ${u.fome || 100}%\n\n💧 𝐒𝐞𝐝𝐞:\n╰➜ ${u.sede || 100}%\n\n${barraHP(u.fome || 100)}\n\n🚔 𝐂𝐫𝐢𝐦𝐞𝐬:\n╰➜ ${u.crimes || 0}\n\n${u.preso && u.preso > Date.now() ? "🚔 *PRESO*" : "✅ Livre"}\n\n"${nomeBot}"`, mentions: [sender] }, { quoted: msg })
      }
    },

    ranking: {
      aliases: ["top", "topcidade"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const c = getCidade()
        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}
        const lista = []
        for (const [num, u] of Object.entries(c.usuarios)) {
          const gold = (rpg.usuarios[num]?.moedas) || 0
          const patrimonio = gold + (u.banco || 0) + (u.casa ? acharCasa(u.casa)?.preco || 0 : 0) + (u.predio ? acharPredio(u.predio)?.preco || 0 : 0)
          lista.push({ num, patrimonio })
        }
        if (!lista.length) return sock.sendMessage(jid, { text: `❄️ • 𝐑𝐀𝐍𝐊𝐈𝐍𝐆 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Vazio!\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        lista.sort((a, b) => b.patrimonio - a.patrimonio)
        const top10 = lista.slice(0, 10)
        let txt = `❄️ • 𝐑𝐀𝐍𝐊𝐈𝐍𝐆 𝐃𝐀 𝐂𝐈𝐃𝐀𝐃𝐄 •\n\n╭─〔 🏆 𝐓𝐎𝐏 𝟏𝟎 〕\n│ Os mais ricos da cidade.\n╰──────────────\n\n`
        top10.forEach((p, i) => {
          const medalha = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "▸"
          txt += `${medalha} @${p.num}\n╰➜ 💰 ${fmtGold(p.patrimonio)}\n\n`
        })
        txt += `"${nomeBot}"`
        await sock.sendMessage(jid, { text: txt, mentions: top10.map(p => p.num + "@s.whatsapp.net") }, { quoted: msg })
      }
    }

  }
}