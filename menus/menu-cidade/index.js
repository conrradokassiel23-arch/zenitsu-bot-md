/* ============================================================
   🏙️ MENU CIDADE - NAPOLEÃO BONAPARTE
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

const BANCO = {
  taxaJuros: 0.02,
  taxaSaque: 0.01,
  taxaDeposito: 0,
  limiteSaque: 50000
}

const POLICIA = {
  fiancaPorMinuto: 100,
  tempoPadrao: 10 * 60 * 1000,
  multaFuga: 5000
}

// ============================================================
// 💞 GIFS DE ANIME (combinam com o comando)
// ============================================================
const GIFS = {
  // ☠️ MATAR - Anime sword fight / luta
  matar: [
    "https://media.tenor.com/3l-VLbYPkHYAAAAC/anime-hit.gif",
    "https://media.tenor.com/KmS2-Y8sNbsAAAAC/anime-slice.gif",
    "https://media.tenor.com/1PJv5sTfWq0AAAAC/anime-punch.gif",
    "https://media.tenor.com/XqZ0cXXYaCsAAAAC/anime-sword.gif"
  ],

  // 💋 BEIJAR - Anime casal se beijando
  beijar: [
    "https://media.tenor.com/COhjzNhZAeDmwAAAAC/anime-kiss.gif",
    "https://media.tenor.com/d4V5IvuHtd2wsWXhPEAAAAC/anime-kiss-cute.gif",
    "https://media.tenor.com/1Tb8eN2nq0YAAAAC/kiss-anime.gif",
    "https://media.tenor.com/gU9YcH4q0sAAAAAC/anime-kiss-love.gif"
  ],

  // 🤗 ABRAÇAR - Anime abraço fofo
  abracar: [
    "https://media.tenor.com/YmHap1Mrb0r98mqhj8AAAAC/anime-hug.gif",
    "https://media.tenor.com/R9UGudw6U0VvsePwmAAAAAC/anime-hug-cute.gif",
    "https://media.tenor.com/1T8n2S0nHbAAAAAC/hug-anime.gif",
    "https://media.tenor.com/X8zX1zS0nHYAAAAC/anime-hug-love.gif"
  ],

  // 🦵 CHUTAR - Anime chute
  chutar: [
    "https://media.tenor.com/IRbWyxAtSYZzzJhLvGAAAAC/anime-kick.gif",
    "https://media.tenor.com/2C8XXg1612JNVR1l8YAAAAC/anime-kick-hit.gif",
    "https://media.tenor.com/Q3n8nX0nHbAAAAAC/anime-kick-fight.gif",
    "https://media.tenor.com/Y7Y2pW0nHbAAAAAC/kick-anime.gif"
  ],

  // 🍽️ LAVAR LOUÇA - Pessoa lavando pratos
  louca: [
    "https://media.tenor.com/3oEjI6SIIHBdRxXI40/giphy.gif",
    "https://media.tenor.com/l0MYEqEzwMWFCg8rm/giphy.gif",
    "https://media.tenor.com/26BRuo6sLetdllPAQ/giphy.gif",
    "https://media.tenor.com/l4FGI8GoTL7N4DsyI/giphy.gif"
  ]
}

const FRASES_MATAR = [
  "☠️ @A mandou @B de base!",
  "⚔️ @A atropelou @B com estilo!",
  "💥 @A pulverizou @B!",
  "🔥 @A mandou @B pra vala!",
  "🗡️ @A executou @B sem piedade!",
  "💀 @A venceu a batalha contra @B!",
  "🎯 @A acertou o golpe final em @B!"
]

const FRASES_BEIJAR = [
  "💋 @A roubou um beijo de @B!",
  "😘 @A beijou @B apaixonadamente!",
  "💕 @A deu um beijo doce em @B!",
  "😍 @A não resistiu e beijou @B!",
  "🌹 @A beijou @B com carinho!"
]

const FRASES_ABRACAR = [
  "🤗 @A abraçou @B apertado!",
  "💞 @A deu um abraço quentinho em @B!",
  "🫂 @A envolveu @B num abraço!",
  "💖 @A abraçou @B com muito carinho!",
  "🥰 @A deu aquele abraço gostoso em @B!"
]

const FRASES_CHUTAR = [
  "🦵 @A deu um chute voador em @B!",
  "👟 @A chutou a bunda de @B!",
  "💢 @A meteu o pé em @B!",
  "🦶 @A chutou @B pra longe!",
  "⚡ @A deu um chute forte em @B!"
]

const FRASES_LOUCA = [
  "🍽️ @A mandou @B lavar a louça!",
  "🧼 @A colocou @B pra lavar os pratos!",
  "💦 @A tá lavando a louça e chamou @B pra ajudar!",
  "🫧 @A mandou @B esfregar a panela!",
  "🧽 @A jogou o pano de prato em @B — vai trabalhar!"
]

function sortearGif(lista) {
  return lista[Math.floor(Math.random() * lista.length)]
}

function sortearFrase(lista, numA, numB) {
  const f = lista[Math.floor(Math.random() * lista.length)]
  return f.replace(/@A/g, "@" + numA).replace(/@B/g, "@" + numB)
}

async function enviarGif(sock, jid, url, frase, mentions, quoted) {
  try {
    const r = await fetch(url)
    if (!r.ok) throw new Error("HTTP " + r.status)
    const buffer = Buffer.from(await r.arrayBuffer())
    await sock.sendMessage(jid, {
      video: buffer,
      mimetype: "video/mp4",
      gifPlayback: true,
      caption: frase,
      mentions
    }, { quoted })
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
  return "🟩".repeat(c) + "⬛".repeat(10 - c)
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
        const cfg = db.config()
        const texto =
`╭━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃   🏙️  𝐌𝐄𝐍𝐔 𝐂𝐈𝐃𝐀𝐃𝐄  🏙️        ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

🎩 *Napoleão apresenta:*
🦅 *a capital do império!*

━━━━━━━━━━━━━━━━━━━━━━━━━
🏠 *CASAS*
▸ ${p}lojacasa
▸ ${p}comprarcasa <nome>
▸ ${p}vendercasa
▸ ${p}minhacasa
▸ ${p}lavarcasa

━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 *PRÉDIOS*
▸ ${p}lojapredio
▸ ${p}comprarpredio <nome>
▸ ${p}venderpredio
▸ ${p}meupredio
▸ ${p}lavarpredio

━━━━━━━━━━━━━━━━━━━━━━━━━
🏦 *BANCO*
▸ ${p}banco
▸ ${p}depositar <valor>
▸ ${p}sacar <valor>
▸ ${p}transferir @user <valor>
▸ ${p}extrato

━━━━━━━━━━━━━━━━━━━━━━━━━
🛒 *MERCADO*
▸ ${p}mercado
▸ ${p}compraritem <nome> <qtd>
▸ ${p}mochila
▸ ${p}consumir <nome>

━━━━━━━━━━━━━━━━━━━━━━━━━
🚔 *POLÍCIA*
▸ ${p}crimeurbano
▸ ${p}statuspreso
▸ ${p}pagar fianca
▸ ${p}fugircadeia

━━━━━━━━━━━━━━━━━━━━━━━━━
💞 *INTERAÇÕES*
▸ ${p}matar @user
▸ ${p}beijar @user
▸ ${p}abraçar @user
▸ ${p}chutar @user
▸ ${p}louça @user

━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *PERFIL*
▸ ${p}cidadeperfil
▸ ${p}ranking

━━━━━━━━━━━━━━━━━━━━━━━━━

🦅 _"Uma cidade forte, um império forte."_
🎩 _"Finge que não viu..."_`

        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          if (cfg.tipoMenu === "video") return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "napoleao.mp4", gifPlayback: true, caption: texto }, { quoted: msg })
          return sock.sendMessage(jid, { image: buf, caption: texto }, { quoted: msg })
        }
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    lojacasa: {
      aliases: ["casas", "lojacasas"],
      async executar({ sock, msg, prefixoAtivo }) {
        let txt = "🏠 *LOJA DE CASAS* 🏠\n\n"
        CASAS.forEach((c, i) => {
          txt += (i + 1) + ". " + c.emoji + " *" + c.nome + "*\n   💰 " + fmtGold(c.preco) + " | 📈 +" + c.renda + "/h\n   📝 " + c.desc + "\n\n"
        })
        txt += "💡 Use *" + prefixoAtivo + "comprarcasa <nome>*"
        await sock.sendMessage(msg.key.remoteJid, { text: txt }, { quoted: msg })
      }
    },

    comprarcasa: {
      aliases: ["buycasa"],
      async executar({ sock, msg, args, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)

        if (u.casa) {
          const atual = acharCasa(u.casa)
          return sock.sendMessage(jid, { text: "🏠 Você já tem *" + (atual?.nome || u.casa) + "*!\n💡 Venda primeiro com *!vendercasa*" }, { quoted: msg })
        }

        const casa = acharCasa(args.join(" "))
        if (!casa) return sock.sendMessage(jid, { text: "❌ Casa não achada!\n💡 Veja *!lojacasa*" }, { quoted: msg })

        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}
        rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        if ((rpg.usuarios[num].moedas || 0) < casa.preco) {
          return sock.sendMessage(jid, { text: "💢 Faltam *" + fmtGold(casa.preco - (rpg.usuarios[num].moedas || 0)) + "* gold!" }, { quoted: msg })
        }

        rpg.usuarios[num].moedas -= casa.preco
        u.casa = casa.id
        u.sujeiraCasa = 0

        db.salvarRpg(rpg)
        dbSalvar("cidade.json", c)

        await sock.sendMessage(jid, {
          text: "╭━━━〔 🏠 𝐂𝐀𝐒𝐀 𝐂𝐎𝐌𝐏𝐑𝐀𝐃𝐀 〕━━━╮\n┃ 👤 @" + num + "\n┃ " + casa.emoji + " *" + casa.nome + "*\n┃ 📈 Renda: *+" + casa.renda + "/h*\n┃ 💰 Pago: *-" + fmtGold(casa.preco) + "*\n╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n🦅 _\"Um teto pro soldado.\"_",
          mentions: [sender]
        }, { quoted: msg })
      }
    },

    vendercasa: {
      aliases: ["sellcasa"],
      async executar({ sock, msg, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)

        if (!u.casa) return sock.sendMessage(jid, { text: "🏠 Você não tem casa!" }, { quoted: msg })

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

        await sock.sendMessage(jid, {
          text: "💰 *CASA VENDIDA*\n\n" + casa.emoji + " " + casa.nome + "\n💵 *+" + fmtGold(valorVenda) + "*\n📉 (70% do valor)\n\n🦅 _\"Adeus, lar.\"_",
          mentions: [sender]
        }, { quoted: msg })
      }
    },

    minhacasa: {
      aliases: ["casastatus"],
      async executar({ sock, msg, utils, sender }) {
        const jid = msg.key.remoteJid
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)

        if (!u.casa) return sock.sendMessage(jid, { text: "🏠 Sem casa!\n💡 Use *!lojacasa*" }, { quoted: msg })

        const casa = acharCasa(u.casa)
        const sujeira = u.sujeiraCasa || 0
        const statusSujeira = sujeira > 70 ? "🔴" : sujeira > 40 ? "🟡" : "🟢"
        const rendaAtual = Math.max(0, casa.renda - Math.floor(casa.renda * (sujeira / 100)))

        await sock.sendMessage(jid, {
          text: "╭━━━〔 🏠 𝐌𝐈𝐍𝐇𝐀 𝐂𝐀𝐒𝐀 〕━━━╮\n┃ 👤 @" + num + "\n┃ " + casa.emoji + " *" + casa.nome + "*\n┃\n┃ 📈 Renda base: *+" + casa.renda + "/h*\n┃ 📈 Renda atual: *+" + rendaAtual + "/h*\n┃ 🧹 Sujeira: *" + sujeira + "%* " + statusSujeira + "\n┃\n┃ " + barraHP(100 - sujeira, 100) + "\n╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n" + (sujeira > 50 ? "⚠️ _A casa tá suja! Use !lavarcasa_" : "✅ _Tudo limpo, soldado._"),
          mentions: [sender]
        }, { quoted: msg })
      }
    },

    lavarcasa: {
      aliases: ["limparcasa"],
      async executar({ sock, msg, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)

        if (!u.casa) return sock.sendMessage(jid, { text: "🏠 Sem casa!" }, { quoted: msg })

        const sujeira = u.sujeiraCasa || 0
        if (sujeira === 0) return sock.sendMessage(jid, { text: "✨ Já tá limpa!" }, { quoted: msg })

        const custo = Math.floor(sujeira * 5)

        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}
        rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        if ((rpg.usuarios[num].moedas || 0) < custo) {
          return sock.sendMessage(jid, { text: "💢 Precisa de *" + fmtGold(custo) + "* gold pra limpar!" }, { quoted: msg })
        }

        rpg.usuarios[num].moedas -= custo
        u.sujeiraCasa = 0

        db.salvarRpg(rpg)
        dbSalvar("cidade.json", c)

        await sock.sendMessage(jid, {
          text: "🧹 *CASA LIMPA!*\n\n💰 -" + fmtGold(custo) + "\n✨ Sujeira: *0%*\n\n🦅 _\"Disciplina também é limpeza.\"_",
          mentions: [sender]
        }, { quoted: msg })
      }
    },

    lojapredio: {
      aliases: ["predios", "lojapredios"],
      async executar({ sock, msg, prefixoAtivo }) {
        let txt = "🏢 *LOJA DE PRÉDIOS* 🏢\n\n"
        PREDIOS.forEach((p, i) => {
          txt += (i + 1) + ". " + p.emoji + " *" + p.nome + "*\n   💰 " + fmtGold(p.preco) + " | 📈 +" + p.renda + "/h\n   📝 " + p.desc + "\n\n"
        })
        txt += "💡 Use *" + prefixoAtivo + "comprarpredio <nome>*"
        await sock.sendMessage(msg.key.remoteJid, { text: txt }, { quoted: msg })
      }
    },

    comprarpredio: {
      aliases: ["buypredio"],
      async executar({ sock, msg, args, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)

        if (u.predio) {
          const atual = acharPredio(u.predio)
          return sock.sendMessage(jid, { text: "🏢 Você já tem *" + (atual?.nome || u.predio) + "*!\n💡 Venda primeiro com *!venderpredio*" }, { quoted: msg })
        }

        const predio = acharPredio(args.join(" "))
        if (!predio) return sock.sendMessage(jid, { text: "❌ Prédio não achado!\n💡 Veja *!lojapredio*" }, { quoted: msg })

        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}
        rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        if ((rpg.usuarios[num].moedas || 0) < predio.preco) {
          return sock.sendMessage(jid, { text: "💢 Faltam *" + fmtGold(predio.preco - (rpg.usuarios[num].moedas || 0)) + "* gold!" }, { quoted: msg })
        }

        rpg.usuarios[num].moedas -= predio.preco
        u.predio = predio.id
        u.sujeiraPredio = 0

        db.salvarRpg(rpg)
        dbSalvar("cidade.json", c)

        await sock.sendMessage(jid, {
          text: "╭━━━〔 🏢 𝐏𝐑𝐄́𝐃𝐈𝐎 𝐂𝐎𝐌𝐏𝐑𝐀𝐃𝐎 〕━━━╮\n┃ 👤 @" + num + "\n┃ " + predio.emoji + " *" + predio.nome + "*\n┃ 📈 Renda: *+" + predio.renda + "/h*\n┃ 💰 Pago: *-" + fmtGold(predio.preco) + "*\n╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n🦅 _\"Um império se ergue.\"_",
          mentions: [sender]
        }, { quoted: msg })
      }
    },

    venderpredio: {
      aliases: ["sellpredio"],
      async executar({ sock, msg, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)

        if (!u.predio) return sock.sendMessage(jid, { text: "🏢 Você não tem prédio!" }, { quoted: msg })

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

        await sock.sendMessage(jid, {
          text: "💰 *PRÉDIO VENDIDO*\n\n" + predio.emoji + " " + predio.nome + "\n💵 *+" + fmtGold(valorVenda) + "*\n📉 (70% do valor)\n\n🦅 _\"Negócio fechado.\"_",
          mentions: [sender]
        }, { quoted: msg })
      }
    },

    meupredio: {
      aliases: ["prediostatus"],
      async executar({ sock, msg, utils, sender }) {
        const jid = msg.key.remoteJid
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)

        if (!u.predio) return sock.sendMessage(jid, { text: "🏢 Sem prédio!\n💡 Use *!lojapredio*" }, { quoted: msg })

        const predio = acharPredio(u.predio)
        const sujeira = u.sujeiraPredio || 0
        const statusSujeira = sujeira > 70 ? "🔴" : sujeira > 40 ? "🟡" : "🟢"
        const rendaAtual = Math.max(0, predio.renda - Math.floor(predio.renda * (sujeira / 100)))

        await sock.sendMessage(jid, {
          text: "╭━━━〔 🏢 𝐌𝐄𝐔 𝐏𝐑𝐄́𝐃𝐈𝐎 〕━━━╮\n┃ 👤 @" + num + "\n┃ " + predio.emoji + " *" + predio.nome + "*\n┃\n┃ 📈 Renda base: *+" + predio.renda + "/h*\n┃ 📈 Renda atual: *+" + rendaAtual + "/h*\n┃ 🧹 Sujeira: *" + sujeira + "%* " + statusSujeira + "\n┃\n┃ " + barraHP(100 - sujeira, 100) + "\n╰━━━━━━━━━━━━━━━━━━━━━━╯",
          mentions: [sender]
        }, { quoted: msg })
      }
    },

    lavarpredio: {
      aliases: ["limparpredio"],
      async executar({ sock, msg, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)

        if (!u.predio) return sock.sendMessage(jid, { text: "🏢 Sem prédio!" }, { quoted: msg })

        const sujeira = u.sujeiraPredio || 0
        if (sujeira === 0) return sock.sendMessage(jid, { text: "✨ Já tá limpo!" }, { quoted: msg })

        const custo = Math.floor(sujeira * 10)

        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}
        rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        if ((rpg.usuarios[num].moedas || 0) < custo) {
          return sock.sendMessage(jid, { text: "💢 Precisa de *" + fmtGold(custo) + "* gold!" }, { quoted: msg })
        }

        rpg.usuarios[num].moedas -= custo
        u.sujeiraPredio = 0

        db.salvarRpg(rpg)
        dbSalvar("cidade.json", c)

        await sock.sendMessage(jid, {
          text: "🧹 *PRÉDIO LIMPO!*\n\n💰 -" + fmtGold(custo) + "\n✨ Sujeira: *0%*",
          mentions: [sender]
        }, { quoted: msg })
      }
    },

    banco: {
      aliases: ["bancostatus", "minhaconta"],
      async executar({ sock, msg, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)
        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}
        const gold = (rpg.usuarios[num]?.moedas) || 0

        await sock.sendMessage(jid, {
          text: "╭━━━〔 🏦 𝐁𝐀𝐍𝐂𝐎 𝐈𝐌𝐏𝐄𝐑𝐈𝐀𝐋 〕━━━╮\n┃ 👤 @" + num + "\n┃\n┃ 💵 Carteira: *" + fmtGold(gold) + "*\n┃ 🏦 Banco: *" + fmtGold(u.banco || 0) + "*\n┃ 📈 Juros: *" + (BANCO.taxaJuros * 100).toFixed(0) + "%/dia*\n┃\n┃ 💰 Total: *" + fmtGold(gold + (u.banco || 0)) + "*\n╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n💡 *!depositar <valor>* | *!sacar <valor>*",
          mentions: [sender]
        }, { quoted: msg })
      }
    },

    depositar: {
      aliases: ["dep"],
      async executar({ sock, msg, args, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)
        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}
        rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }

        const gold = Math.floor(rpg.usuarios[num].moedas || 0)
        let valor = args[0] === "tudo" ? gold : Math.floor(parseInt(args[0]) || 0)

        if (!valor || valor <= 0) return sock.sendMessage(jid, { text: "🏦 Use *!depositar <valor>* ou *!depositar tudo*" }, { quoted: msg })
        if (valor > gold) return sock.sendMessage(jid, { text: "💢 Você só tem *" + fmtGold(gold) + "* gold!" }, { quoted: msg })

        rpg.usuarios[num].moedas = gold - valor
        u.banco = Math.floor((u.banco || 0) + valor)

        db.salvarRpg(rpg)
        dbSalvar("cidade.json", c)

        await sock.sendMessage(jid, {
          text: "🏦 *DEPÓSITO*\n\n💵 -" + fmtGold(valor) + "\n🏦 Banco: *" + fmtGold(u.banco) + "*\n\n🎩 _\"Guardado, soldado.\"_",
          mentions: [sender]
        }, { quoted: msg })
      }
    },

    sacar: {
      aliases: ["saque"],
      async executar({ sock, msg, args, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)
        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}
        rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }

        let valor = args[0] === "tudo" ? Math.floor(u.banco || 0) : Math.floor(parseInt(args[0]) || 0)
        if (!valor || valor <= 0) return sock.sendMessage(jid, { text: "🏦 Use *!sacar <valor>* ou *!sacar tudo*" }, { quoted: msg })
        if (valor > (u.banco || 0)) return sock.sendMessage(jid, { text: "💢 Você só tem *" + fmtGold(u.banco) + "* no banco!" }, { quoted: msg })
        if (valor > BANCO.limiteSaque) return sock.sendMessage(jid, { text: "💢 Limite por saque: *" + fmtGold(BANCO.limiteSaque) + "*" }, { quoted: msg })

        const taxa = Math.floor(valor * BANCO.taxaSaque)
        const recebido = valor - taxa

        u.banco = Math.floor((u.banco || 0) - valor)
        rpg.usuarios[num].moedas = Math.floor((rpg.usuarios[num].moedas || 0) + recebido)

        db.salvarRpg(rpg)
        dbSalvar("cidade.json", c)

        await sock.sendMessage(jid, {
          text: "🏦 *SAQUE*\n\n💵 Saque: *" + fmtGold(valor) + "*\n💸 Taxa (1%): *-" + fmtGold(taxa) + "*\n✅ Recebido: *+" + fmtGold(recebido) + "*\n🏦 Banco: *" + fmtGold(u.banco) + "*\n👛 Carteira: *" + fmtGold(rpg.usuarios[num].moedas) + "*",
          mentions: [sender]
        }, { quoted: msg })
      }
    },

    transferir: {
      aliases: ["pix", "transf"],
      async executar({ sock, msg, args, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const num = utils.soNumero(sender)
        const alvo = utils.getAlvo(msg)

        if (!alvo) return sock.sendMessage(jid, { text: "🏦 *!transferir @user <valor>*" }, { quoted: msg })

        const numAlvo = utils.soNumero(alvo)
        if (num === numAlvo) return sock.sendMessage(jid, { text: "💢 Não pode transferir pra você!" }, { quoted: msg })

        const valor = Math.floor(parseInt(args.filter(a => !a.startsWith("@"))[0]) || 0)
        if (!valor || valor <= 0) return sock.sendMessage(jid, { text: "🏦 Valor inválido!" }, { quoted: msg })

        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}
        rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        rpg.usuarios[numAlvo] = rpg.usuarios[numAlvo] || { moedas: 0 }

        if ((rpg.usuarios[num].moedas || 0) < valor) return sock.sendMessage(jid, { text: "💢 Sem gold suficiente!" }, { quoted: msg })

        rpg.usuarios[num].moedas -= valor
        rpg.usuarios[numAlvo].moedas = (rpg.usuarios[numAlvo].moedas || 0) + valor

        db.salvarRpg(rpg)

        await sock.sendMessage(jid, {
          text: "🏦 *TRANSFERÊNCIA*\n\n👤 @" + num + "\n➡️ @" + numAlvo + "\n💰 *" + fmtGold(valor) + "*\n\n🦅 _\"Ouro passa de mão em mão.\"_",
          mentions: [sender, alvo]
        }, { quoted: msg })
      }
    },

    extrato: {
      aliases: ["historico"],
      async executar({ sock, msg, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)
        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}
        const gold = (rpg.usuarios[num]?.moedas) || 0

        const casa = u.casa ? acharCasa(u.casa) : null
        const predio = u.predio ? acharPredio(u.predio) : null
        const patrimonio = gold + (u.banco || 0)
          + (casa ? casa.preco : 0)
          + (predio ? predio.preco : 0)

        await sock.sendMessage(jid, {
          text: "╭━━━〔 📊 𝐄𝐗𝐓𝐑𝐀𝐓𝐎 〕━━━╮\n┃ 👤 @" + num + "\n┃\n┃ 💵 Carteira: *" + fmtGold(gold) + "*\n┃ 🏦 Banco: *" + fmtGold(u.banco || 0) + "*\n┃\n┃ 🏠 Casa: *" + (casa ? casa.nome : "Nenhuma") + "*\n┃ 🏢 Prédio: *" + (predio ? predio.nome : "Nenhum") + "*\n┃\n┃ 📈 Total patrimônio:\n┃   *" + fmtGold(patrimonio) + "*\n╰━━━━━━━━━━━━━━━━━━━━━━╯",
          mentions: [sender]
        }, { quoted: msg })
      }
    },

    mercado: {
      aliases: ["loja", "mercadoitens"],
      async executar({ sock, msg, prefixoAtivo }) {
        let txt = "🛒 *MERCADO IMPERIAL* 🛒\n\n"
        MERCADO.forEach((i, idx) => {
          txt += (idx + 1) + ". " + i.emoji + " *" + i.nome + "*\n   💰 " + i.preco + " | " + i.desc + "\n"
        })
        txt += "\n💡 *" + prefixoAtivo + "compraritem <nome> <qtd>*\n🍽️ *" + prefixoAtivo + "consumir <nome>*"
        await sock.sendMessage(msg.key.remoteJid, { text: txt }, { quoted: msg })
      }
    },

    compraritem: {
      aliases: ["buyitem", "compraritemmercado"],
      async executar({ sock, msg, args, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)

        let qtd = 1
        if (/^\d+$/.test(args[args.length - 1])) {
          qtd = parseInt(args.pop())
        }

        const item = acharItem(args.join(" "))
        if (!item) return sock.sendMessage(jid, { text: "❌ Item não achado!\n💡 *!mercado*" }, { quoted: msg })
        if (qtd < 1 || qtd > 100) return sock.sendMessage(jid, { text: "💢 Qtd: 1-100" }, { quoted: msg })

        const total = item.preco * qtd
        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}
        rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        if ((rpg.usuarios[num].moedas || 0) < total) return sock.sendMessage(jid, { text: "💢 Faltam *" + fmtGold(total - (rpg.usuarios[num].moedas || 0)) + "* gold!" }, { quoted: msg })

        rpg.usuarios[num].moedas -= total

        const existente = u.itens.find(i => i.id === item.id)
        if (existente) existente.qtd += qtd
        else u.itens.push({ id: item.id, nome: item.nome, emoji: item.emoji, qtd, cura: item.cura })

        db.salvarRpg(rpg)
        dbSalvar("cidade.json", c)

        await sock.sendMessage(jid, {
          text: "🛒 *COMPRA*\n\n" + item.emoji + " *" + item.nome + "* x" + qtd + "\n💰 *-" + fmtGold(total) + "*\n\n📦 Use *!mochila* pra ver",
          mentions: [sender]
        }, { quoted: msg })
      }
    },

    mochila: {
      aliases: ["inventario", "itens"],
      async executar({ sock, msg, utils, sender }) {
        const jid = msg.key.remoteJid
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)

        if (!u.itens.length) return sock.sendMessage(jid, { text: "🎒 Mochila vazia!\n💡 *!mercado*" }, { quoted: msg })

        let txt = "🎒 *MOCHILA DE @" + num + "*\n\n"
        u.itens.forEach(i => {
          txt += i.emoji + " *" + i.nome + "* x" + i.qtd + "\n"
        })
        txt += "\n🍽️ Use *!consumir <nome>*"
        await sock.sendMessage(jid, { text: txt, mentions: [sender] }, { quoted: msg })
      }
    },

    consumir: {
      aliases: ["comer", "beber", "usar"],
      async executar({ sock, msg, args, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)

        const item = acharItem(args.join(" "))
        if (!item) return sock.sendMessage(jid, { text: "❌ Item não achado!" }, { quoted: msg })

        const idx = u.itens.findIndex(i => i.id === item.id)
        if (idx === -1 || u.itens[idx].qtd <= 0) return sock.sendMessage(jid, { text: "💢 Você não tem *" + item.nome + "*!" }, { quoted: msg })

        u.itens[idx].qtd--
        if (u.itens[idx].qtd <= 0) u.itens.splice(idx, 1)

        if (item.id === "agua" || item.id === "cerveja" || item.id === "cafe" || item.id === "suco" || item.id === "energetico") {
          u.sede = Math.min(100, (u.sede || 100) + item.cura)
        } else if (item.cura > 0) {
          u.fome = Math.min(100, (u.fome || 100) + item.cura)
        }

        dbSalvar("cidade.json", c)

        await sock.sendMessage(jid, {
          text: "🍽️ *CONSUMIDO*\n\n" + item.emoji + " *" + item.nome + "*\n\n🍖 Fome: *" + u.fome + "%*\n💧 Sede: *" + u.sede + "%*",
          mentions: [sender]
        }, { quoted: msg })
      }
    },

    crimeurbano: {
      aliases: ["crimecidade", "assaltarcidade"],
      async executar({ sock, msg, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)
        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}
        rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }

        if (u.preso && u.preso > Date.now()) return sock.sendMessage(jid, { text: "🚔 Você já tá preso!" }, { quoted: msg })
        if (u.ultimoCrimeUrbano && (Date.now() - u.ultimoCrimeUrbano) < 30 * 60 * 1000) {
          return sock.sendMessage(jid, { text: "⏰ Aguarde *" + formatarTempo(30 * 60 * 1000 - (Date.now() - u.ultimoCrimeUrbano)) + "*" }, { quoted: msg })
        }

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
          db.salvarRpg(rpg)
          dbSalvar("cidade.json", c)

          await sock.sendMessage(jid, {
            text: "🦹 *CRIME BEM-SUCEDIDO!*\n\n🏪 Alvo: *" + alvo.nome + "*\n💰 Botim: *+" + fmtGold(bonus) + "*\n\n🎯 XP: +15\n🦅 _\"A águia atacou.\"_",
            mentions: [sender]
          }, { quoted: msg })
        } else {
          const tempo = POLICIA.tempoPadrao + Math.floor(alvo.valor / 100) * 60 * 1000
          u.preso = Date.now() + tempo
          dbSalvar("cidade.json", c)

          await sock.sendMessage(jid, {
            text: "🚨 *PRESO!*\n\n🏪 Alvo: *" + alvo.nome + "*\n⏰ Tempo: *" + formatarTempo(tempo) + "*\n\n💰 Fiança: *" + fmtGold(tempo / 60000 * POLICIA.fiancaPorMinuto) + "* gold\n\n💡 *!pagar fianca* pra sair",
            mentions: [sender]
          }, { quoted: msg })
        }
      }
    },

    statuspreso: {
      aliases: ["cadeia", "minhapena"],
      async executar({ sock, msg, utils, sender }) {
        const jid = msg.key.remoteJid
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)

        if (!u.preso || u.preso <= Date.now()) return sock.sendMessage(jid, { text: "✅ Você tá livre!" }, { quoted: msg })

        const restante = u.preso - Date.now()
        const fianca = Math.floor(restante / 60000 * POLICIA.fiancaPorMinuto)

        await sock.sendMessage(jid, {
          text: "🚔 *VOCÊ ESTÁ PRESO*\n\n⏰ Restante: *" + formatarTempo(restante) + "*\n💰 Fiança: *" + fmtGold(fianca) + "* gold\n\n💡 *!pagar fianca* | *!fugircadeia*",
          mentions: [sender]
        }, { quoted: msg })
      }
    },

    pagar: {
      aliases: ["fianca"],
      async executar({ sock, msg, args, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)

        if (args[0] && args[0].toLowerCase() !== "fianca") {
          return sock.sendMessage(jid, { text: "🚔 Use *!pagar fianca*" }, { quoted: msg })
        }

        if (!u.preso || u.preso <= Date.now()) return sock.sendMessage(jid, { text: "✅ Você tá livre!" }, { quoted: msg })

        const restante = u.preso - Date.now()
        const fianca = Math.floor(restante / 60000 * POLICIA.fiancaPorMinuto)

        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}
        rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        if ((rpg.usuarios[num].moedas || 0) < fianca) {
          return sock.sendMessage(jid, { text: "💢 Faltam *" + fmtGold(fianca - (rpg.usuarios[num].moedas || 0)) + "* gold!" }, { quoted: msg })
        }

        rpg.usuarios[num].moedas -= fianca
        u.preso = null

        db.salvarRpg(rpg)
        dbSalvar("cidade.json", c)

        await sock.sendMessage(jid, {
          text: "💰 *FIANÇA PAGA*\n\n✅ Você está livre!\n💸 -" + fmtGold(fianca) + "\n\n🦅 _\"A liberdade tem seu preço.\"_",
          mentions: [sender]
        }, { quoted: msg })
      }
    },

    fugircadeia: {
      aliases: ["fugir", "escapar"],
      async executar({ sock, msg, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const num = utils.soNumero(sender)
        const c = getCidade()
        const u = getUser(c, num)
        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}
        rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }

        if (!u.preso || u.preso <= Date.now()) return sock.sendMessage(jid, { text: "✅ Você tá livre!" }, { quoted: msg })

        const chance = 0.30 + (u.crimes || 0) * 0.01
        if (Math.random() < chance) {
          u.preso = null
          dbSalvar("cidade.json", c)
          await sock.sendMessage(jid, {
            text: "🏃 *FUGA BEM-SUCEDIDA!*\n\n✅ Você escapou!\n\n🦅 _\"Ninguém prende o Bonaparte.\"_",
            mentions: [sender]
          }, { quoted: msg })
        } else {
          const multa = POLICIA.multaFuga
          rpg.usuarios[num].moedas = Math.max(0, (rpg.usuarios[num].moedas || 0) - multa)
          u.preso = Date.now() + 20 * 60 * 1000
          db.salvarRpg(rpg)
          dbSalvar("cidade.json", c)
          await sock.sendMessage(jid, {
            text: "🚨 *FUGA FRACASSADA!*\n\n💸 Multa: *-" + fmtGold(multa) + "*\n⏰ +20min de pena\n\n👁️ _\"A polícia te pegou.\"_",
            mentions: [sender]
          }, { quoted: msg })
        }
      }
    },

    matar: {
      aliases: ["mat4r", "assassinar"],
      async executar({ sock, msg, utils, sender }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: "☠️ Use *!matar @user* (ou responda a msg)" }, { quoted: msg })
        const numA = utils.soNumero(sender)
        const numB = utils.soNumero(alvo)
        if (numA === numB) return sock.sendMessage(jid, { text: "🤔 Não pode matar você mesmo!" }, { quoted: msg })

        const gif = sortearGif(GIFS.matar)
        const frase = sortearFrase(FRASES_MATAR, numA, numB) + "\n\n🦅 _\"Guerra é guerra.\"_"
        await enviarGif(sock, jid, gif, frase, [sender, alvo], msg)
      }
    },

    beijar: {
      aliases: ["beijo", "kiss", "beij4r"],
      async executar({ sock, msg, utils, sender }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: "💋 Use *!beijar @user* (ou responda a msg)" }, { quoted: msg })
        const numA = utils.soNumero(sender)
        const numB = utils.soNumero(alvo)
        if (numA === numB) return sock.sendMessage(jid, { text: "🤔 Beijar a si mesmo? Sem graça..." }, { quoted: msg })

        const gif = sortearGif(GIFS.beijar)
        const frase = sortearFrase(FRASES_BEIJAR, numA, numB) + "\n\n💕 _\"O amor vence batalhas.\"_"
        await enviarGif(sock, jid, gif, frase, [sender, alvo], msg)
      }
    },

    "abraçar": {
      aliases: ["abraco", "abracar", "hug", "abraç4r"],
      async executar({ sock, msg, utils, sender }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: "🤗 Use *!abraçar @user* (ou responda a msg)" }, { quoted: msg })
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
        if (!alvo) return sock.sendMessage(jid, { text: "🦵 Use *!chutar @user* (ou responda a msg)" }, { quoted: msg })
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
        if (!alvo) return sock.sendMessage(jid, { text: "🍽️ Use *!louça @user* (ou responda a msg)" }, { quoted: msg })
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

        await sock.sendMessage(jid, {
          text: "╭━━━〔 👤 𝐂𝐈𝐃𝐀𝐃𝐀̃𝐎 〕━━━╮\n┃ @" + num + "\n┃\n┃ 🎖️ Nível: *" + nivel + "* (" + xp + "/" + xpNec + " XP)\n┃ 💵 Carteira: *" + fmtGold(gold) + "*\n┃ 🏦 Banco: *" + fmtGold(u.banco || 0) + "*\n┃\n┃ 🏠 Casa: *" + (casa?.nome || "Nenhuma") + "*\n┃ 🏢 Prédio: *" + (predio?.nome || "Nenhum") + "*\n┃ 📈 Renda total: *+" + rendaHora + "/h*\n┃\n┃ 🍖 Fome: *" + (u.fome || 100) + "%*\n┃ 💧 Sede: *" + (u.sede || 100) + "%*\n┃ " + barraHP(u.fome || 100) + "\n┃\n┃ 🚔 Crimes: *" + (u.crimes || 0) + "*\n┃ " + (u.preso && u.preso > Date.now() ? "🚔 *PRESO*" : "✅ Livre") + "\n╰━━━━━━━━━━━━━━━━━━━━━━╯",
          mentions: [sender]
        }, { quoted: msg })
      }
    },

    ranking: {
      aliases: ["top", "topcidade"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const c = getCidade()
        const rpg = db.rpg()
        rpg.usuarios = rpg.usuarios || {}

        const lista = []
        for (const [num, u] of Object.entries(c.usuarios)) {
          const gold = (rpg.usuarios[num]?.moedas) || 0
          const patrimonio = gold + (u.banco || 0)
            + (u.casa ? acharCasa(u.casa)?.preco || 0 : 0)
            + (u.predio ? acharPredio(u.predio)?.preco || 0 : 0)
          lista.push({ num, patrimonio })
        }

        if (!lista.length) return sock.sendMessage(jid, { text: "📊 Vazio!" }, { quoted: msg })

        lista.sort((a, b) => b.patrimonio - a.patrimonio)
        const top10 = lista.slice(0, 10)

        let txt = "🏆 *RANKING DA CIDADE* 🏆\n\n"
        top10.forEach((p, i) => {
          const medalha = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "▸"
          txt += medalha + " @" + p.num + "\n   💰 *" + fmtGold(p.patrimonio) + "*\n\n"
        })

        await sock.sendMessage(jid, {
          text: txt,
          mentions: top10.map(p => p.num + "@s.whatsapp.net")
        }, { quoted: msg })
      }
    }

  }
  }
