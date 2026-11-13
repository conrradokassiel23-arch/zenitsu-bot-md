/* ============================================================
   🌸 MENU CIDADE - TEMA FLORAL
   ============================================================ */

const fs = require("fs")
const path = require("path")

const DATA_DIR = path.join(__dirname, "..", "..", "data")

function dbLer(arquivo, padrao = {}) {
  const p = path.join(DATA_DIR, arquivo)
  if (!fs.existsSync(p)) { fs.writeFileSync(p, JSON.stringify(padrao, null, 2)); return padrao }
  try { return JSON.parse(fs.readFileSync(p, "utf8")) } catch { return padrao }
}
function dbSalvar(arquivo, dados) { fs.writeFileSync(path.join(DATA_DIR, arquivo), JSON.stringify(dados, null, 2)) }

async function reagir(sock, msg, emoji) {
  try { await sock.sendMessage(msg.key.remoteJid, { react: { text: emoji, key: msg.key } }) } catch (_) {}
}

function nomeBotDb(db) { try { return db.config?.()?.nomeBot || "Rimuru" } catch { return "Rimuru" } }
function getCfg(db) { try { return db.config?.() || {} } catch { return {} } }
function normalizar(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() }

/* ---------- TEMPLATES FLORAIS ---------- */
function boxTop(titulo) {
  return `╔═══ஓ๑♡๑ஓ═══╗
𓆩 ${titulo} 𓆪
╚═══ஓ๑♡๑ஓ═══╝`
}
function boxFim(nomeBot, frase = "Concluído com sucesso.") {
  return `╔═══ஓ๑♡๑ஓ═══╗
𓆩 ${String(nomeBot).toUpperCase()} 𓆪
❝ ${frase} ❞
╚═══ஓ๑♡๑ஓ═══╝`
}
function msgSucesso(titulo, aviso, detalhes, rodape, nomeBot) {
  return `${boxTop(titulo)}

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐒𝐓𝐀𝐓𝐔𝐒 𓆪
↳ ${aviso}
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐃𝐄𝐓𝐀𝐋𝐇𝐄𝐒 𓆪
↳ ${detalhes}
╰┈┈┈┈୨୧┈┈┈┈╯

${rodape ? `╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐍𝐎𝐓𝐀 𓆪
↳ ${rodape}
╰┈┈┈┈୨୧┈┈┈┈╯

` : ""}${boxFim(nomeBot, "Concluído com sucesso.")}`
}
function msgAviso(titulo, aviso, detalhes, rodape, nomeBot) {
  return `${boxTop(titulo)}

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐀𝐕𝐈𝐒𝐎 𓆪
↳ ${aviso}
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐃𝐄𝐓𝐀𝐋𝐇𝐄𝐒 𓆪
↳ ${detalhes}
╰┈┈┈┈୨୧┈┈┈┈╯

${rodape ? `╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐍𝐎𝐓𝐀 𓆪
↳ ${rodape}
╰┈┈┈┈୨୧┈┈┈┈╯

` : ""}${boxFim(nomeBot, "Verifique e tente novamente.")}`
}
function msgErro(titulo, aviso, detalhes, rodape, nomeBot) {
  return `${boxTop(titulo)}

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐄𝐑𝐑𝐎 𓆪
↳ ${aviso}
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐃𝐄𝐓𝐀𝐋𝐇𝐄𝐒 𓆪
↳ ${detalhes}
╰┈┈┈┈୨୧┈┈┈┈╯

${rodape ? `╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐍𝐎𝐓𝐀 𓆪
↳ ${rodape}
╰┈┈┈┈୨୧┈┈┈┈╯

` : ""}${boxFim(nomeBot, "Algo deu errado.")}`
}
function secao(t) { return `╭┈┈┈┈୨୧┈┈┈┈╮\n𓆩 ${t} 𓆪` }
function item(c) { return `↳ \`${c}\`` }
function fimSecao() { return `╰┈┈┈┈୨୧┈┈┈┈╯` }

function cardPerfil({ nomeBot, nomeUsuario, cargo, dono }) {
  return `╔═══ஓ๑♡๑ஓ═══╗
𓆩 𝐂 𝐈 𝐃 𝐀 𝐃 𝐄 𓆪
╚═══ஓ๑♡๑ஓ═══╝

┏━━━〔 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 〕━━━┓
𖤐 Bot » ${nomeBot}
𖤐 Usuário » ${nomeUsuario}
𖤐 Cargo » ${cargo}
𖤐 Dono » ${dono}
┗━━━━━━━━━━━━━━━━━━┛`
}

function detectarCargo({ sender, config, db, groupMetadata, isDono, isSubDono, isAdmin }) {
  const num = String(sender || "").split("@")[0].split(":")[0].replace(/\D/g, "")
  const donos = (Array.isArray(config?.dono) ? config.dono : [config?.dono]).map(n => String(n).split("@")[0].split(":")[0].replace(/\D/g, "")).filter(Boolean)
  if (isDono || donos.includes(num)) return "👑 𝐆𝐑𝐀𝐍𝐃𝐄 𝐒𝐀́𝐁𝐈𝐎"
  try { const subs = (db.config?.().subdonos || []).map(n => String(n).split("@")[0].split(":")[0].replace(/\D/g, "")); if (isSubDono || subs.includes(num)) return "💠 𝐋𝐔𝐀 𝐒𝐔𝐏𝐄𝐑𝐈𝐎𝐑" } catch (_) {}
  try {
    const vips = (db.vips?.() || {}).vips || {}
    for (const [j, info] of Object.entries(vips)) {
      const jn = String(j).split("@")[0].split(":")[0].replace(/\D/g, "")
      if (jn === num && (info.expira === "inf" || info.expira > Date.now())) return "❄️ 𝐍𝐎𝐁𝐑𝐄 𝐀𝐋𝐈𝐀𝐃𝐎"
    }
  } catch (_) {}
  if (isAdmin) return "⚔️ 𝐂𝐎𝐌𝐀𝐍𝐃𝐀𝐍𝐓𝐄"
  try {
    const subsAdm = (db.subadmins?.() || {})[groupMetadata?.id] || []
    if (subsAdm.some(s => String(s).split("@")[0].split(":")[0].replace(/\D/g, "") === num)) return "🛡️ 𝐆𝐔𝐀𝐑𝐃𝐀 𝐑𝐄𝐀𝐋"
  } catch (_) {}
  return "👤 𝐒𝐋𝐈𝐌𝐄 𝐂𝐎𝐌𝐔𝐌"
}

function getCargoETexto(ctx) {
  const { sender, config, db, groupMetadata, isDono, isSubDono, isAdmin, msg } = ctx
  const pushName = msg.pushName || "Slime"
  const donoArr = Array.isArray(config && config.dono) ? config.dono : [config && config.dono || "Chefe"]
  const nomeDono = String(donoArr[0] || "Chefe").split("@")[0].split(":")[0].replace(/\D/g, "") || "Chefe"
  const cargo = detectarCargo({ sender, config, db, groupMetadata, isDono, isSubDono, isAdmin })
  const nomeBot = (config && config.nomeBot) || nomeBotDb(db)
  return { pushName, nomeDono, cargo, nomeBot }
}

/* ---------- CONSTANTES DO JOGO ---------- */
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

const FRASES_MATAR = ["💧 @A mandou @B de base!", "❄️ @A atropelou @B com estilo!", "🧊 @A pulverizou @B!", "💧 @A mandou @B pra vala!", "❄️ @A executou @B sem piedade!", "🧊 @A venceu @B!", "💧 @A acertou o golpe final em @B!"]
const FRASES_BEIJAR = ["💧 @A roubou um beijo de @B!", "❄️ @A beijou @B apaixonadamente!", "🧊 @A deu um beijo doce em @B!", "💧 @A não resistiu e beijou @B!", "❄️ @A beijou @B com carinho!"]
const FRASES_ABRACAR = ["💧 @A abraçou @B apertado!", "❄️ @A deu um abraço quentinho em @B!", "🧊 @A envolveu @B num abraço!", "💧 @A abraçou @B com muito carinho!", "❄️ @A deu aquele abraço gostoso em @B!"]
const FRASES_CHUTAR = ["💧 @A deu um chute voador em @B!", "❄️ @A chutou a bunda de @B!", "🧊 @A meteu o pé em @B!", "💧 @A chutou @B pra longe!", "❄️ @A deu um chute forte em @B!"]
const FRASES_LOUCA = ["💧 @A mandou @B lavar a louça!", "❄️ @A colocou @B pra lavar os pratos!", "🧊 @A tá lavando louça e chamou @B!", "💧 @A mandou @B esfregar a panela!", "❄️ @A jogou o pano em @B — vai trabalhar!"]

function sortearGif(lista) { return lista[Math.floor(Math.random() * lista.length)] }
function sortearFrase(lista, numA, numB) { const f = lista[Math.floor(Math.random() * lista.length)]; return f.replace(/@A/g, "@" + numA).replace(/@B/g, "@" + numB) }

async function enviarGif(sock, jid, url, frase, mentions, quoted) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(15000) })
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

function acharCasa(id) { return CASAS.find(c => c.id === id) || CASAS.find(c => normalizar(c.nome) === normalizar(id)) || CASAS.find(c => normalizar(c.nome).includes(normalizar(id))) }
function acharPredio(id) { return PREDIOS.find(p => p.id === id) || PREDIOS.find(p => normalizar(p.nome) === normalizar(id)) || PREDIOS.find(p => normalizar(p.nome).includes(normalizar(id))) }
function acharItem(id) { return MERCADO.find(i => i.id === id) || MERCADO.find(i => normalizar(i.nome) === normalizar(id)) || MERCADO.find(i => normalizar(i.nome).includes(normalizar(id))) }

function getCidade() { const c = dbLer("cidade.json", { usuarios: {}, casas: {}, predios: {} }); c.usuarios = c.usuarios || {}; c.casas = c.casas || {}; c.predios = c.predios || {}; return c }
function getUser(c, num) {
  c.usuarios[num] = c.usuarios[num] || { casa: null, predio: null, sujeiraCasa: 0, sujeiraPredio: 0, banco: 0, ultimoJuros: 0, itens: [], fome: 100, sede: 100, preso: null, crimes: 0, nivel: 1, xp: 0 }
  const u = c.usuarios[num]; u.itens = u.itens || []; u.fome = u.fome ?? 100; u.sede = u.sede ?? 100; return u
}
function formatarTempo(ms) { const s = Math.floor(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60), d = Math.floor(h / 24); if (d > 0) return d + "d " + (h % 24) + "h"; if (h > 0) return h + "h " + (m % 60) + "min"; if (m > 0) return m + "min " + (s % 60) + "s"; return s + "s" }
function barraHP(v, max = 100) { const c = Math.max(0, Math.min(10, Math.round((v / max) * 10))); return "💧".repeat(c) + "⬛".repeat(10 - c) }
function fmtGold(v) {
  if (typeof v !== "number" || isNaN(v) || !isFinite(v)) return "0"
  return Math.floor(v).toLocaleString("pt-BR")
}

module.exports = {
  menu: "menu-cidade",
  grupoOnly: false,
  adminOnly: false,
  donoOnly: false,

  async rendaAutomatica(sock, db) {
    const c = getCidade(); const agora = Date.now(); const INTERVALO_JUROS = 24 * 60 * 60 * 1000; let alterou = false
    for (const [num, u] of Object.entries(c.usuarios)) {
      if ((u.banco || 0) > 0 && (agora - (u.ultimoJuros || 0)) >= INTERVALO_JUROS) {
        const juros = Math.floor(u.banco * BANCO.taxaJuros)
        u.banco += juros; u.ultimoJuros = agora; alterou = true
      }
    }
    if (alterou) dbSalvar("cidade.json", c)
  },

  commands: {

    menucidade: {
      aliases: ["cidade", "menuc", "comandoscidade"],
      async executar({ sock, msg, prefixoAtivo, db, sender, config, isDono, isSubDono, isAdmin, groupMetadata }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"
        const cfg = getCfg(db)
        const { pushName, nomeDono, cargo, nomeBot } = getCargoETexto({ sender, config, db, groupMetadata, isDono, isSubDono, isAdmin, msg })
        await reagir(sock, msg, "🌸")

        const texto = `${cardPerfil({ nomeBot, nomeUsuario: pushName, cargo, dono: nomeDono })}

${secao("𝐂𝐀𝐒𝐀𝐒")}
${item(`${p}lojacasa`)}
${item(`${p}comprarcasa <nome>`)}
${item(`${p}vendercasa`)}
${item(`${p}minhacasa`)}
${item(`${p}lavarcasa`)}
${fimSecao()}

${secao("𝐏𝐑𝐄́𝐃𝐈𝐎𝐒")}
${item(`${p}lojapredio`)}
${item(`${p}comprarpredio <nome>`)}
${item(`${p}venderpredio`)}
${item(`${p}meupredio`)}
${item(`${p}lavarpredio`)}
${fimSecao()}

${secao("𝐁𝐀𝐍𝐂𝐎")}
${item(`${p}banco`)}
${item(`${p}depositar <valor>`)}
${item(`${p}sacar <valor>`)}
${item(`${p}transferir @user <valor>`)}
${item(`${p}extrato`)}
${fimSecao()}

${secao("𝐌𝐄𝐑𝐂𝐀𝐃𝐎")}
${item(`${p}mercado`)}
${item(`${p}compraritem <nome> <qtd>`)}
${item(`${p}mochila`)}
${item(`${p}consumir <nome>`)}
${fimSecao()}

${secao("𝐏𝐎𝐋𝐈́𝐂𝐈𝐀")}
${item(`${p}crimeurbano`)}
${item(`${p}statuspreso`)}
${item(`${p}pagar fianca`)}
${item(`${p}fugircadeia`)}
${fimSecao()}

${secao("𝐈𝐍𝐓𝐄𝐑𝐀𝐂̧𝐎̃𝐄𝐒")}
${item(`${p}matar @user`)}
${item(`${p}beijar @user`)}
${item(`${p}abraçar @user`)}
${item(`${p}chutar @user`)}
${item(`${p}louça @user`)}
${fimSecao()}

${secao("𝐏𝐄𝐑𝐅𝐈𝐋")}
${item(`${p}cidadeperfil`)}
${item(`${p}ranking`)}
${fimSecao()}

╔═══ஓ๑♡๑ஓ═══╗
𓆩 𝐏𝐑𝐄𝐅𝐈𝐗𝐎 𓆪
↳ \`${p}\`
╚═══ஓ๑♡๑ஓ═══╝

╔═══ஓ๑♡๑ஓ═══╗
𓆩 ${nomeBot.toUpperCase()} 𓆪
❝ Uma cidade forte, um império forte. ❞
╚═══ஓ๑♡๑ஓ═══╝`

        if (cfg.fotoMenu) {
          let buf = null
          try {
            const limpo = String(cfg.fotoMenu).replace(/^data:[^;]+;base64,/, "")
            buf = Buffer.from(limpo, "base64")
          } catch { buf = null }
          if (buf && buf.length) {
            try {
              if (cfg.tipoMenu === "video") return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "rimuru.mp4", gifPlayback: true, caption: texto }, { quoted: msg })
              return sock.sendMessage(jid, { image: buf, caption: texto }, { quoted: msg })
            } catch (e) { return sock.sendMessage(jid, { text: texto }, { quoted: msg }) }
          }
        }
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    lojacasa: {
      aliases: ["casas", "lojacasas"],
      async executar({ sock, msg, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        await reagir(sock, msg, "🌸")
        let txt = `${boxTop("𝐋𝐎𝐉𝐀 𝐂𝐀𝐒𝐀𝐒")}\n\n`
        CASAS.forEach((c, i) => {
          txt += `${secao(`#${i + 1}`)}\n↳ ${c.emoji} ${c.nome}\n↳ 💰 ${fmtGold(c.preco)} | 📈 +${c.renda}/h\n↳ ${c.desc}\n${fimSecao()}\n`
        })
        txt += `\n╔═══ஓ๑♡๑ஓ═══╗\n𓆩 𝐂𝐎𝐌𝐏𝐑𝐀𝐑 𓆪\n↳ \`${p}comprarcasa <nome>\`\n╚═══ஓ๑♡๑ஓ═══╝\n\n${boxFim(nomeBot)}`
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    comprarcasa: {
      aliases: ["buycasa"],
      async executar({ sock, msg, args, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const num = utils.soNumero(sender); const c = getCidade(); const u = getUser(c, num)
        if (u.casa) {
          const atual = acharCasa(u.casa)
          await reagir(sock, msg, "🧊")
          return sock.sendMessage(jid, { text: msgAviso("𝐂𝐎𝐌𝐏𝐑𝐀𝐑", "Você já tem uma casa.", `${atual?.nome || u.casa}`, `\`${p}vendercasa\` primeiro`, nomeBot) }, { quoted: msg })
        }
        const casa = acharCasa(args.join(" "))
        if (!casa) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐂𝐎𝐌𝐏𝐑𝐀𝐑", "Casa não encontrada.", args.join(" ") || "—", `\`${p}lojacasa\``, nomeBot) }, { quoted: msg }) }
        const rpg = db.rpg(); rpg.usuarios = rpg.usuarios || {}; rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        if ((rpg.usuarios[num].moedas || 0) < casa.preco) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐂𝐎𝐌𝐏𝐑𝐀𝐑", "Gold insuficiente.", `Faltam ${fmtGold(casa.preco - (rpg.usuarios[num].moedas || 0))}`, null, nomeBot) }, { quoted: msg }) }
        rpg.usuarios[num].moedas -= casa.preco; u.casa = casa.id; u.sujeiraCasa = 0
        db.salvarRpg(rpg); dbSalvar("cidade.json", c)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐂𝐀𝐒𝐀", "Comprada.", `${casa.emoji} ${casa.nome} • +${casa.renda}/h`, `-${fmtGold(casa.preco)} gold`, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    vendercasa: {
      aliases: ["sellcasa"],
      async executar({ sock, msg, db, utils, sender }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender); const c = getCidade(); const u = getUser(c, num)
        if (!u.casa) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐕𝐄𝐍𝐃𝐄𝐑", "Você não tem casa.", "—", null, nomeBot) }, { quoted: msg }) }
        const casa = acharCasa(u.casa); const valorVenda = Math.floor(casa.preco * 0.7)
        const rpg = db.rpg(); rpg.usuarios = rpg.usuarios || {}; rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }; rpg.usuarios[num].moedas = (rpg.usuarios[num].moedas || 0) + valorVenda
        u.casa = null; u.sujeiraCasa = 0; db.salvarRpg(rpg); dbSalvar("cidade.json", c)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐕𝐄𝐍𝐃𝐈𝐃𝐀", "Casa vendida.", `${casa.emoji} ${casa.nome}`, `+${fmtGold(valorVenda)} gold (70%)`, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    minhacasa: {
      aliases: ["casastatus"],
      async executar({ sock, msg, utils, sender, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const num = utils.soNumero(sender); const c = getCidade(); const u = getUser(c, num)
        if (!u.casa) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐌𝐈𝐍𝐇𝐀 𝐂𝐀𝐒𝐀", "Você não tem casa.", "—", `\`${p}lojacasa\``, nomeBot) }, { quoted: msg }) }
        const casa = acharCasa(u.casa); const sujeira = u.sujeiraCasa || 0
        const statusSujeira = sujeira > 70 ? "🚨" : sujeira > 40 ? "❄️" : "✅"
        const rendaAtual = Math.max(0, casa.renda - Math.floor(casa.renda * (sujeira / 100)))
        await reagir(sock, msg, "🌸")
        const texto = `${boxTop("𝐌𝐈𝐍𝐇𝐀 𝐂𝐀𝐒𝐀")}

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐃𝐎𝐍𝐎 𓆪
↳ @${num}
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐂𝐀𝐒𝐀 𓆪
↳ ${casa.emoji} ${casa.nome}
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐑𝐄𝐍𝐃𝐀 𓆪
↳ Base: +${casa.renda}/h
↳ Atual: +${rendaAtual}/h
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐒𝐔𝐉𝐄𝐈𝐑𝐀 𓆪
↳ ${sujeira}% ${statusSujeira}
↳ ${barraHP(100 - sujeira, 100)}
╰┈┈┈┈୨୧┈┈┈┈╯

${sujeira > 50 ? `╭┈┈┈┈୨୧┈┈┈┈╮\n𓆩 𝐀𝐕𝐈𝐒𝐎 𓆪\n↳ Use \`${p}lavarcasa\`\n╰┈┈┈┈୨୧┈┈┈┈╯\n\n` : ""}${boxFim(nomeBot, sujeira > 50 ? "Suja! Lave a casa." : "Tudo em ordem.")}`
        await sock.sendMessage(jid, { text: texto, mentions: [sender] }, { quoted: msg })
      }
    },

    lavarcasa: {
      aliases: ["limparcasa"],
      async executar({ sock, msg, db, utils, sender }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender); const c = getCidade(); const u = getUser(c, num)
        if (!u.casa) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐀𝐕𝐀𝐑", "Você não tem casa.", "—", null, nomeBot) }, { quoted: msg }) }
        const sujeira = u.sujeiraCasa || 0
        if (sujeira === 0) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐀𝐕𝐀𝐑", "Já está limpa!", "0% sujeira", null, nomeBot) }, { quoted: msg }) }
        const custo = Math.floor(sujeira * 5)
        const rpg = db.rpg(); rpg.usuarios = rpg.usuarios || {}; rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        if ((rpg.usuarios[num].moedas || 0) < custo) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐋𝐀𝐕𝐀𝐑", "Gold insuficiente.", `Precisa ${fmtGold(custo)}`, null, nomeBot) }, { quoted: msg }) }
        rpg.usuarios[num].moedas -= custo; u.sujeiraCasa = 0; db.salvarRpg(rpg); dbSalvar("cidade.json", c)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐋𝐈𝐌𝐏𝐀", "Sujeira removida.", "0% sujeira", `-${fmtGold(custo)} gold`, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    lojapredio: {
      aliases: ["predios", "lojapredios"],
      async executar({ sock, msg, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        await reagir(sock, msg, "🌸")
        let txt = `${boxTop("𝐋𝐎𝐉𝐀 𝐏𝐑𝐄́𝐃𝐈𝐎𝐒")}\n\n`
        PREDIOS.forEach((pr, i) => {
          txt += `${secao(`#${i + 1}`)}\n↳ ${pr.emoji} ${pr.nome}\n↳ 💰 ${fmtGold(pr.preco)} | 📈 +${pr.renda}/h\n↳ ${pr.desc}\n${fimSecao()}\n`
        })
        txt += `\n╔═══ஓ๑♡๑ஓ═══╗\n𓆩 𝐂𝐎𝐌𝐏𝐑𝐀𝐑 𓆪\n↳ \`${p}comprarpredio <nome>\`\n╚═══ஓ๑♡๑ஓ═══╝\n\n${boxFim(nomeBot)}`
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    comprarpredio: {
      aliases: ["buypredio"],
      async executar({ sock, msg, args, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const num = utils.soNumero(sender); const c = getCidade(); const u = getUser(c, num)
        if (u.predio) {
          const atual = acharPredio(u.predio)
          await reagir(sock, msg, "🧊")
          return sock.sendMessage(jid, { text: msgAviso("𝐂𝐎𝐌𝐏𝐑𝐀𝐑", "Você já tem um prédio.", `${atual?.nome || u.predio}`, `\`${p}venderpredio\` primeiro`, nomeBot) }, { quoted: msg })
        }
        const predio = acharPredio(args.join(" "))
        if (!predio) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐂𝐎𝐌𝐏𝐑𝐀𝐑", "Prédio não encontrado.", args.join(" ") || "—", `\`${p}lojapredio\``, nomeBot) }, { quoted: msg }) }
        const rpg = db.rpg(); rpg.usuarios = rpg.usuarios || {}; rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        if ((rpg.usuarios[num].moedas || 0) < predio.preco) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐂𝐎𝐌𝐏𝐑𝐀𝐑", "Gold insuficiente.", `Faltam ${fmtGold(predio.preco - (rpg.usuarios[num].moedas || 0))}`, null, nomeBot) }, { quoted: msg }) }
        rpg.usuarios[num].moedas -= predio.preco; u.predio = predio.id; u.sujeiraPredio = 0
        db.salvarRpg(rpg); dbSalvar("cidade.json", c)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐑𝐄́𝐃𝐈𝐎", "Comprado.", `${predio.emoji} ${predio.nome} • +${predio.renda}/h`, `-${fmtGold(predio.preco)} gold`, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    venderpredio: {
      aliases: ["sellpredio"],
      async executar({ sock, msg, db, utils, sender }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender); const c = getCidade(); const u = getUser(c, num)
        if (!u.predio) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐕𝐄𝐍𝐃𝐄𝐑", "Você não tem prédio.", "—", null, nomeBot) }, { quoted: msg }) }
        const predio = acharPredio(u.predio); const valorVenda = Math.floor(predio.preco * 0.7)
        const rpg = db.rpg(); rpg.usuarios = rpg.usuarios || {}; rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }; rpg.usuarios[num].moedas = (rpg.usuarios[num].moedas || 0) + valorVenda
        u.predio = null; u.sujeiraPredio = 0; db.salvarRpg(rpg); dbSalvar("cidade.json", c)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐕𝐄𝐍𝐃𝐈𝐃𝐎", "Prédio vendido.", `${predio.emoji} ${predio.nome}`, `+${fmtGold(valorVenda)} gold (70%)`, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    meupredio: {
      aliases: ["prediostatus"],
      async executar({ sock, msg, utils, sender, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender); const c = getCidade(); const u = getUser(c, num)
        if (!u.predio) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐌𝐄𝐔 𝐏𝐑𝐄́𝐃𝐈𝐎", "Você não tem prédio.", "—", null, nomeBot) }, { quoted: msg }) }
        const predio = acharPredio(u.predio); const sujeira = u.sujeiraPredio || 0
        const statusSujeira = sujeira > 70 ? "🚨" : sujeira > 40 ? "❄️" : "✅"
        const rendaAtual = Math.max(0, predio.renda - Math.floor(predio.renda * (sujeira / 100)))
        await reagir(sock, msg, "🌸")
        const texto = `${boxTop("𝐌𝐄𝐔 𝐏𝐑𝐄́𝐃𝐈𝐎")}

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐃𝐎𝐍𝐎 𓆪
↳ @${num}
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐏𝐑𝐄́𝐃𝐈𝐎 𓆪
↳ ${predio.emoji} ${predio.nome}
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐑𝐄𝐍𝐃𝐀 𓆪
↳ Base: +${predio.renda}/h
↳ Atual: +${rendaAtual}/h
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐒𝐔𝐉𝐄𝐈𝐑𝐀 𓆪
↳ ${sujeira}% ${statusSujeira}
↳ ${barraHP(100 - sujeira, 100)}
╰┈┈┈┈୨୧┈┈┈┈╯

${boxFim(nomeBot, sujeira > 50 ? "Sujo! Lave o prédio." : "Tudo em ordem.")}`
        await sock.sendMessage(jid, { text: texto, mentions: [sender] }, { quoted: msg })
      }
    },

    lavarpredio: {
      aliases: ["limparpredio"],
      async executar({ sock, msg, db, utils, sender }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender); const c = getCidade(); const u = getUser(c, num)
        if (!u.predio) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐀𝐕𝐀𝐑", "Você não tem prédio.", "—", null, nomeBot) }, { quoted: msg }) }
        const sujeira = u.sujeiraPredio || 0
        if (sujeira === 0) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐀𝐕𝐀𝐑", "Já está limpo!", "0% sujeira", null, nomeBot) }, { quoted: msg }) }
        const custo = Math.floor(sujeira * 10)
        const rpg = db.rpg(); rpg.usuarios = rpg.usuarios || {}; rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        if ((rpg.usuarios[num].moedas || 0) < custo) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐋𝐀𝐕𝐀𝐑", "Gold insuficiente.", `Precisa ${fmtGold(custo)}`, null, nomeBot) }, { quoted: msg }) }
        rpg.usuarios[num].moedas -= custo; u.sujeiraPredio = 0; db.salvarRpg(rpg); dbSalvar("cidade.json", c)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐋𝐈𝐌𝐏𝐎", "Sujeira removida.", "0% sujeira", `-${fmtGold(custo)} gold`, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    banco: {
      aliases: ["bancostatus", "minhaconta"],
      async executar({ sock, msg, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const num = utils.soNumero(sender); const c = getCidade(); const u = getUser(c, num)
        const rpg = db.rpg(); rpg.usuarios = rpg.usuarios || {}; const gold = (rpg.usuarios[num]?.moedas) || 0
        await reagir(sock, msg, "🌸")
        const texto = `${boxTop("𝐁𝐀𝐍𝐂𝐎")}

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐂𝐎𝐍𝐓𝐀 𓆪
↳ @${num}
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐒𝐀𝐋𝐃𝐎𝐒 𓆪
↳ Carteira: ${fmtGold(gold)}
↳ Banco: ${fmtGold(u.banco || 0)}
↳ Juros: ${(BANCO.taxaJuros * 100).toFixed(0)}%/dia
↳ Total: ${fmtGold(gold + (u.banco || 0))}
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒 𓆪
↳ \`${p}depositar\`
↳ \`${p}sacar\`
↳ \`${p}transferir\`
╰┈┈┈┈୨୧┈┈┈┈╯

${boxFim(nomeBot)}`
        await sock.sendMessage(jid, { text: texto, mentions: [sender] }, { quoted: msg })
      }
    },

    depositar: {
      aliases: ["dep"],
      async executar({ sock, msg, args, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const num = utils.soNumero(sender); const c = getCidade(); const u = getUser(c, num)
        const rpg = db.rpg(); rpg.usuarios = rpg.usuarios || {}; rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        const gold = Math.floor(rpg.usuarios[num].moedas || 0)
        let valor = args[0] === "tudo" ? gold : Math.floor(parseInt(args[0]) || 0)
        if (!valor || valor <= 0) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐃𝐄𝐏𝐎𝐒𝐈𝐓𝐀𝐑", "Informe valor.", "—", `\`${p}depositar <valor>\``, nomeBot) }, { quoted: msg }) }
        if (valor > gold) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐃𝐄𝐏𝐎𝐒𝐈𝐓𝐀𝐑", "Gold insuficiente.", `Você tem ${fmtGold(gold)}`, null, nomeBot) }, { quoted: msg }) }
        rpg.usuarios[num].moedas = gold - valor; u.banco = Math.floor((u.banco || 0) + valor)
        db.salvarRpg(rpg); dbSalvar("cidade.json", c)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐃𝐄𝐏𝐎́𝐒𝐈𝐓𝐎", "Depositado.", `-${fmtGold(valor)} gold`, `Banco: ${fmtGold(u.banco)}`, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    sacar: {
      aliases: ["saque"],
      async executar({ sock, msg, args, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const num = utils.soNumero(sender); const c = getCidade(); const u = getUser(c, num)
        const rpg = db.rpg(); rpg.usuarios = rpg.usuarios || {}; rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        let valor = args[0] === "tudo" ? Math.floor(u.banco || 0) : Math.floor(parseInt(args[0]) || 0)
        if (!valor || valor <= 0) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐒𝐀𝐂𝐀𝐑", "Informe valor.", "—", `\`${p}sacar <valor>\``, nomeBot) }, { quoted: msg }) }
        if (valor > (u.banco || 0)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐀𝐂𝐀𝐑", "Saldo insuficiente.", `Banco: ${fmtGold(u.banco)}`, null, nomeBot) }, { quoted: msg }) }
        if (valor > BANCO.limiteSaque) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐀𝐂𝐀𝐑", "Limite excedido.", `Máx: ${fmtGold(BANCO.limiteSaque)}`, null, nomeBot) }, { quoted: msg }) }
        const taxa = Math.floor(valor * BANCO.taxaSaque); const recebido = valor - taxa
        u.banco = Math.floor((u.banco || 0) - valor); rpg.usuarios[num].moedas = Math.floor((rpg.usuarios[num].moedas || 0) + recebido)
        db.salvarRpg(rpg); dbSalvar("cidade.json", c)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐒𝐀𝐐𝐔𝐄", "Retirado.", `-${fmtGold(valor)} gold • +${fmtGold(recebido)}`, `Taxa (1%): -${fmtGold(taxa)} • Banco: ${fmtGold(u.banco)}`, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    transferir: {
      aliases: ["pix", "transf"],
      async executar({ sock, msg, args, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const num = utils.soNumero(sender); const alvo = utils.getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐓𝐑𝐀𝐍𝐒𝐅𝐄𝐑𝐈𝐑", "Marque um usuário.", "—", `\`${p}transferir @user <valor>\``, nomeBot) }, { quoted: msg }) }
        const numAlvo = utils.soNumero(alvo)
        if (num === numAlvo) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐓𝐑𝐀𝐍𝐒𝐅𝐄𝐑𝐈𝐑", "Não pode pra você mesmo.", "—", null, nomeBot) }, { quoted: msg }) }
        const valor = Math.floor(parseInt(args.filter(a => !a.startsWith("@"))[0]) || 0)
        if (!valor || valor <= 0) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐓𝐑𝐀𝐍𝐒𝐅𝐄𝐑𝐈𝐑", "Valor inválido.", "—", null, nomeBot) }, { quoted: msg }) }
        const rpg = db.rpg(); rpg.usuarios = rpg.usuarios || {}; rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }; rpg.usuarios[numAlvo] = rpg.usuarios[numAlvo] || { moedas: 0 }
        if ((rpg.usuarios[num].moedas || 0) < valor) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐓𝐑𝐀𝐍𝐒𝐅𝐄𝐑𝐈𝐑", "Gold insuficiente.", `Você tem ${fmtGold(rpg.usuarios[num].moedas || 0)}`, null, nomeBot) }, { quoted: msg }) }
        rpg.usuarios[num].moedas -= valor; rpg.usuarios[numAlvo].moedas = (rpg.usuarios[numAlvo].moedas || 0) + valor; db.salvarRpg(rpg)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐓𝐑𝐀𝐍𝐒𝐅𝐄𝐑𝐄̂𝐍𝐂𝐈𝐀", "Ouro passou.", `De: @${num} • Para: @${numAlvo}`, `${fmtGold(valor)} gold`, nomeBot), mentions: [sender, alvo] }, { quoted: msg })
      }
    },

    extrato: {
      aliases: ["historico"],
      async executar({ sock, msg, db, utils, sender }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender); const c = getCidade(); const u = getUser(c, num)
        const rpg = db.rpg(); rpg.usuarios = rpg.usuarios || {}; const gold = (rpg.usuarios[num]?.moedas) || 0
        const casa = u.casa ? acharCasa(u.casa) : null; const predio = u.predio ? acharPredio(u.predio) : null
        const patrimonio = gold + (u.banco || 0) + (casa ? casa.preco : 0) + (predio ? predio.preco : 0)
        await reagir(sock, msg, "🌸")
        const texto = `${boxTop("𝐄𝐗𝐓𝐑𝐀𝐓𝐎")}

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐔𝐒𝐔𝐀́𝐑𝐈𝐎 𓆪
↳ @${num}
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐁𝐄𝐍𝐒 𓆪
↳ Carteira: ${fmtGold(gold)}
↳ Banco: ${fmtGold(u.banco || 0)}
↳ Casa: ${casa ? casa.nome : "Nenhuma"}
↳ Prédio: ${predio ? predio.nome : "Nenhum"}
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐏𝐀𝐓𝐑𝐈𝐌𝐎̂𝐍𝐈𝐎 𓆪
↳ ${fmtGold(patrimonio)} gold
╰┈┈┈┈୨୧┈┈┈┈╯

${boxFim(nomeBot)}`
        await sock.sendMessage(jid, { text: texto, mentions: [sender] }, { quoted: msg })
      }
    },

    mercado: {
      aliases: ["loja", "mercadoitens"],
      async executar({ sock, msg, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        await reagir(sock, msg, "🌸")
        let txt = `${boxTop("𝐌𝐄𝐑𝐂𝐀𝐃𝐎")}\n\n`
        MERCADO.forEach((i, idx) => {
          txt += `${secao(`#${idx + 1}`)}\n↳ ${i.emoji} ${i.nome}\n↳ 💰 ${fmtGold(i.preco)} • ${i.desc}\n${fimSecao()}\n`
        })
        txt += `\n╭┈┈┈┈୨୧┈┈┈┈╮\n𓆩 𝐂𝐎𝐌𝐏𝐑𝐀𝐑 𓆪\n↳ \`${p}compraritem <nome> <qtd>\`\n╰┈┈┈┈୨୧┈┈┈┈╯\n\n╭┈┈┈┈୨୧┈┈┈┈╮\n𓆩 𝐂𝐎𝐍𝐒𝐔𝐌𝐈𝐑 𓆪\n↳ \`${p}consumir <nome>\`\n╰┈┈┈┈୨୧┈┈┈┈╯\n\n${boxFim(nomeBot)}`
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    compraritem: {
      aliases: ["buyitem"],
      async executar({ sock, msg, args, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const num = utils.soNumero(sender); const c = getCidade(); const u = getUser(c, num)
        let qtd = 1; if (/^\d+$/.test(args[args.length - 1])) qtd = parseInt(args.pop())
        const item = acharItem(args.join(" "))
        if (!item) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐂𝐎𝐌𝐏𝐑𝐀𝐑", "Item não encontrado.", args.join(" ") || "—", `\`${p}mercado\``, nomeBot) }, { quoted: msg }) }
        if (qtd < 1 || qtd > 100) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐂𝐎𝐌𝐏𝐑𝐀𝐑", "Quantidade inválida.", "Use 1 a 100", null, nomeBot) }, { quoted: msg }) }
        const total = item.preco * qtd
        const rpg = db.rpg(); rpg.usuarios = rpg.usuarios || {}; rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        if ((rpg.usuarios[num].moedas || 0) < total) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐂𝐎𝐌𝐏𝐑𝐀𝐑", "Gold insuficiente.", `Faltam ${fmtGold(total - (rpg.usuarios[num].moedas || 0))}`, null, nomeBot) }, { quoted: msg }) }
        rpg.usuarios[num].moedas -= total
        const existente = u.itens.find(i => i.id === item.id)
        if (existente) existente.qtd += qtd
        else u.itens.push({ id: item.id, nome: item.nome, emoji: item.emoji, qtd, cura: item.cura })
        db.salvarRpg(rpg); dbSalvar("cidade.json", c)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐂𝐎𝐌𝐏𝐑𝐀𝐃𝐎", "Item comprado.", `${item.emoji} ${item.nome} x${qtd}`, `-${fmtGold(total)} gold`, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    mochila: {
      aliases: ["inventario", "itens"],
      async executar({ sock, msg, utils, sender, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const num = utils.soNumero(sender); const c = getCidade(); const u = getUser(c, num)
        if (!u.itens.length) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐌𝐎𝐂𝐇𝐈𝐋𝐀", "Vazia.", "—", `\`${p}mercado\``, nomeBot) }, { quoted: msg }) }
        let txt = `${boxTop("𝐌𝐎𝐂𝐇𝐈𝐋𝐀")}\n\n`
        u.itens.forEach(i => { txt += `╭┈┈┈┈୨୧┈┈┈┈╮\n𓆩 𝐈𝐓𝐄𝐌 𓆪\n↳ ${i.emoji} ${i.nome} x${i.qtd}\n╰┈┈┈┈୨୧┈┈┈┈╯\n` })
        txt += `\n╭┈┈┈┈୨୧┈┈┈┈╮\n𓆩 𝐔𝐒𝐀𝐑 𓆪\n↳ \`${p}consumir <nome>\`\n╰┈┈┈┈୨୧┈┈┈┈╯\n\n${boxFim(nomeBot)}`
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: txt, mentions: [sender] }, { quoted: msg })
      }
    },

    consumir: {
      aliases: ["comer", "beber", "usar"],
      async executar({ sock, msg, args, db, utils, sender }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender); const c = getCidade(); const u = getUser(c, num)
        const item = acharItem(args.join(" "))
        if (!item) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐂𝐎𝐍𝐒𝐔𝐌𝐈𝐑", "Item não encontrado.", args.join(" ") || "—", null, nomeBot) }, { quoted: msg }) }
        const idx = u.itens.findIndex(i => i.id === item.id)
        if (idx === -1 || u.itens[idx].qtd <= 0) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐂𝐎𝐍𝐒𝐔𝐌𝐈𝐑", "Você não tem esse item.", item.nome, null, nomeBot) }, { quoted: msg }) }
        u.itens[idx].qtd--; if (u.itens[idx].qtd <= 0) u.itens.splice(idx, 1)
        const bebidas = ["agua", "cerveja", "cafe", "suco", "energetico"]
        if (bebidas.includes(item.id)) u.sede = Math.min(100, (u.sede || 100) + item.cura)
        else if (item.cura > 0) u.fome = Math.min(100, (u.fome || 100) + item.cura)
        dbSalvar("cidade.json", c)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐂𝐎𝐍𝐒𝐔𝐌𝐈𝐃𝐎", `${item.emoji} ${item.nome}`, `Fome: ${u.fome}% • Sede: ${u.sede}%`, null, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    crimeurbano: {
      aliases: ["crimecidade"],
      async executar({ sock, msg, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const num = utils.soNumero(sender); const c = getCidade(); const u = getUser(c, num)
        const rpg = db.rpg(); rpg.usuarios = rpg.usuarios || {}; rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        if (u.preso && u.preso > Date.now()) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐂𝐑𝐈𝐌𝐄", "Você está preso.", formatarTempo(u.preso - Date.now()), null, nomeBot) }, { quoted: msg }) }
        if (u.ultimoCrimeUrbano && (Date.now() - u.ultimoCrimeUrbano) < 30 * 60 * 1000) {
          await reagir(sock, msg, "🧊")
          return sock.sendMessage(jid, { text: msgAviso("𝐂𝐑𝐈𝐌𝐄", "Aguarde o cooldown.", formatarTempo(30 * 60 * 1000 - (Date.now() - u.ultimoCrimeUrbano)), null, nomeBot) }, { quoted: msg })
        }
        const alvos = [
          { nome: "Padaria", valor: 200, chance: 0.80 },
          { nome: "Farmácia", valor: 500, chance: 0.70 },
          { nome: "Joalheria", valor: 2000, chance: 0.50 },
          { nome: "Banco Central", valor: 10000, chance: 0.25 },
          { nome: "Residência", valor: 300, chance: 0.85 }
        ]
        const alvo = alvos[Math.floor(Math.random() * alvos.length)]
        u.ultimoCrimeUrbano = Date.now(); u.crimes = (u.crimes || 0) + 1
        await reagir(sock, msg, "🌸")
        if (Math.random() < alvo.chance) {
          const bonus = Math.floor(alvo.valor * (1 + (u.crimes || 0) * 0.02))
          rpg.usuarios[num].moedas = (rpg.usuarios[num].moedas || 0) + bonus
          u.xp = (u.xp || 0) + 15
          db.salvarRpg(rpg); dbSalvar("cidade.json", c)
          await sock.sendMessage(jid, { text: msgSucesso("𝐂𝐑𝐈𝐌𝐄 ✓", "O Grande Sábio agiu.", `Alvo: ${alvo.nome} • +${fmtGold(bonus)} gold`, "+15 XP", nomeBot), mentions: [sender] }, { quoted: msg })
        } else {
          const tempo = POLICIA.tempoPadrao + Math.floor(alvo.valor / 100) * 60 * 1000
          u.preso = Date.now() + tempo; dbSalvar("cidade.json", c)
          await sock.sendMessage(jid, { text: msgErro("𝐏𝐑𝐄𝐒𝐎", "Você foi pego!", `Alvo: ${alvo.nome} • Pena: ${formatarTempo(tempo)}`, `Fiança: ${fmtGold(tempo / 60000 * POLICIA.fiancaPorMinuto)} • \`${p}pagar fianca\``, nomeBot), mentions: [sender] }, { quoted: msg })
        }
      }
    },

    statuspreso: {
      aliases: ["cadeia", "minhapena"],
      async executar({ sock, msg, utils, sender, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const num = utils.soNumero(sender); const c = getCidade(); const u = getUser(c, num)
        if (!u.preso || u.preso <= Date.now()) { await reagir(sock, msg, "🌸"); return sock.sendMessage(jid, { text: msgSucesso("𝐒𝐓𝐀𝐓𝐔𝐒", "Você está livre.", "Sem pena ativa", null, nomeBot) }, { quoted: msg }) }
        const restante = u.preso - Date.now(); const fianca = Math.floor(restante / 60000 * POLICIA.fiancaPorMinuto)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgAviso("𝐏𝐑𝐄𝐒𝐎", "Cadeia.", `Restante: ${formatarTempo(restante)}`, `Fiança: ${fmtGold(fianca)} • \`${p}pagar fianca\` / \`${p}fugircadeia\``, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    pagar: {
      aliases: ["fianca"],
      async executar({ sock, msg, args, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const num = utils.soNumero(sender); const c = getCidade(); const u = getUser(c, num)
        if (!args[0] || args[0].toLowerCase() !== "fianca") { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐏𝐀𝐆𝐀𝐑", "Use o comando correto.", "—", `\`${p}pagar fianca\``, nomeBot) }, { quoted: msg }) }
        if (!u.preso || u.preso <= Date.now()) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐏𝐀𝐆𝐀𝐑", "Você está livre.", "Sem pena ativa", null, nomeBot) }, { quoted: msg }) }
        const restante = u.preso - Date.now(); const fianca = Math.floor(restante / 60000 * POLICIA.fiancaPorMinuto)
        const rpg = db.rpg(); rpg.usuarios = rpg.usuarios || {}; rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        if ((rpg.usuarios[num].moedas || 0) < fianca) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐏𝐀𝐆𝐀𝐑", "Gold insuficiente.", `Faltam ${fmtGold(fianca - (rpg.usuarios[num].moedas || 0))}`, null, nomeBot) }, { quoted: msg }) }
        rpg.usuarios[num].moedas -= fianca; u.preso = null; db.salvarRpg(rpg); dbSalvar("cidade.json", c)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐅𝐈𝐀𝐍𝐂̧𝐀", "Paga, você está livre.", `-${fmtGold(fianca)} gold`, "\"A liberdade tem seu preço.\"", nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    fugircadeia: {
      aliases: ["fugir", "escapar"],
      async executar({ sock, msg, db, utils, sender }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender); const c = getCidade(); const u = getUser(c, num)
        const rpg = db.rpg(); rpg.usuarios = rpg.usuarios || {}; rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        if (!u.preso || u.preso <= Date.now()) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐅𝐔𝐆𝐈𝐑", "Você está livre.", "—", null, nomeBot) }, { quoted: msg }) }
        const chance = Math.min(0.85, 0.30 + (u.crimes || 0) * 0.01)
        await reagir(sock, msg, "🌸")
        if (Math.random() < chance) {
          u.preso = null; dbSalvar("cidade.json", c)
          await sock.sendMessage(jid, { text: msgSucesso("𝐅𝐔𝐆𝐀 ✓", "Você escapou!", "\"Ninguém prende o Grande Sábio.\"", null, nomeBot), mentions: [sender] }, { quoted: msg })
        } else {
          const multa = POLICIA.multaFuga
          rpg.usuarios[num].moedas = Math.max(0, (rpg.usuarios[num].moedas || 0) - multa)
          u.preso = Date.now() + 20 * 60 * 1000
          db.salvarRpg(rpg); dbSalvar("cidade.json", c)
          await sock.sendMessage(jid, { text: msgErro("𝐅𝐔𝐆𝐀 ✗", "A polícia te pegou.", `-${fmtGold(multa)} gold • +20min de pena`, null, nomeBot), mentions: [sender] }, { quoted: msg })
        }
      }
    },

    matar: {
      aliases: ["mat4r", "assassinar"],
      async executar({ sock, msg, utils, sender }) {
        const jid = msg.key.remoteJid; const alvo = utils.getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: "🌸 Use *+matar @user*" }, { quoted: msg }) }
        const numA = utils.soNumero(sender); const numB = utils.soNumero(alvo)
        if (numA === numB) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: "🧊 Não pode matar você mesmo!" }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        const gif = sortearGif(GIFS.matar)
        const frase = sortearFrase(FRASES_MATAR, numA, numB) + "\n\n💧 _\"Guerra é guerra.\"_"
        await enviarGif(sock, jid, gif, frase, [sender, alvo], msg)
      }
    },

    beijar: {
      aliases: ["beijo", "kiss", "beij4r"],
      async executar({ sock, msg, utils, sender }) {
        const jid = msg.key.remoteJid; const alvo = utils.getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: "🌸 Use *+beijar @user*" }, { quoted: msg }) }
        const numA = utils.soNumero(sender); const numB = utils.soNumero(alvo)
        if (numA === numB) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: "🧊 Beijar a si mesmo? Sem graça..." }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        const gif = sortearGif(GIFS.beijar)
        const frase = sortearFrase(FRASES_BEIJAR, numA, numB) + "\n\n💧 _\"O amor vence batalhas.\"_"
        await enviarGif(sock, jid, gif, frase, [sender, alvo], msg)
      }
    },

    "abraçar": {
      aliases: ["abraco", "abracar", "hug"],
      async executar({ sock, msg, utils, sender }) {
        const jid = msg.key.remoteJid; const alvo = utils.getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: "🌸 Use *+abraçar @user*" }, { quoted: msg }) }
        const numA = utils.soNumero(sender); const numB = utils.soNumero(alvo)
        if (numA === numB) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: "🧊 Se abraçar sozinho? Triste..." }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        const gif = sortearGif(GIFS.abracar)
        const frase = sortearFrase(FRASES_ABRACAR, numA, numB) + "\n\n💧 _\"Um abraço cura tudo.\"_"
        await enviarGif(sock, jid, gif, frase, [sender, alvo], msg)
      }
    },

    chutar: {
      aliases: ["chut4r", "kickar"],
      async executar({ sock, msg, utils, sender }) {
        const jid = msg.key.remoteJid; const alvo = utils.getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: "🌸 Use *+chutar @user*" }, { quoted: msg }) }
        const numA = utils.soNumero(sender); const numB = utils.soNumero(alvo)
        if (numA === numB) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: "🧊 Se chutar? Sei não..." }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        const gif = sortearGif(GIFS.chutar)
        const frase = sortearFrase(FRASES_CHUTAR, numA, numB) + "\n\n💧 _\"Tomou um chute voador!\"_"
        await enviarGif(sock, jid, gif, frase, [sender, alvo], msg)
      }
    },

    "louça": {
      aliases: ["louca", "lavarlouca", "pratos"],
      async executar({ sock, msg, utils, sender }) {
        const jid = msg.key.remoteJid; const alvo = utils.getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: "🌸 Use *+louça @user*" }, { quoted: msg }) }
        const numA = utils.soNumero(sender); const numB = utils.soNumero(alvo)
        if (numA === numB) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: "🧊 Se mandar lavar louça? Kkkk" }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        const gif = sortearGif(GIFS.louca)
        const frase = sortearFrase(FRASES_LOUCA, numA, numB) + "\n\n💧 _\"A pia não vai se limpar sozinha.\"_"
        await enviarGif(sock, jid, gif, frase, [sender, alvo], msg)
      }
    },

    cidadeperfil: {
      aliases: ["perfilcidade", "cidadao"],
      async executar({ sock, msg, db, utils, sender }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender); const c = getCidade(); const u = getUser(c, num)
        const rpg = db.rpg(); rpg.usuarios = rpg.usuarios || {}; const gold = (rpg.usuarios[num]?.moedas) || 0
        const casa = u.casa ? acharCasa(u.casa) : null; const predio = u.predio ? acharPredio(u.predio) : null
        const nivel = u.nivel || 1; const xp = u.xp || 0; const xpNec = nivel * 100
        const rendaHora = (casa ? casa.renda : 0) + (predio ? predio.renda : 0)
        await reagir(sock, msg, "🌸")
        const texto = `${boxTop("𝐂𝐈𝐃𝐀𝐃𝐀̃𝐎")}

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐔𝐒𝐔𝐀́𝐑𝐈𝐎 𓆪
↳ @${num}
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐍𝐈́𝐕𝐄𝐋 𓆪
↳ ${nivel} (${xp}/${xpNec} XP)
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐁𝐄𝐍𝐒 𓆪
↳ Carteira: ${fmtGold(gold)}
↳ Banco: ${fmtGold(u.banco || 0)}
↳ Casa: ${casa?.nome || "Nenhuma"}
↳ Prédio: ${predio?.nome || "Nenhum"}
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐑𝐄𝐍𝐃𝐀 𓆪
↳ +${rendaHora}/h
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐕𝐈𝐓𝐀𝐈𝐒 𓆪
↳ Fome: ${u.fome || 100}%
↳ Sede: ${u.sede || 100}%
↳ ${barraHP(u.fome || 100)}
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐂𝐑𝐈𝐌𝐄𝐒 𓆪
↳ ${u.crimes || 0} cometidos
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐒𝐓𝐀𝐓𝐔𝐒 𓆪
↳ ${u.preso && u.preso > Date.now() ? "🚔 𝐏𝐑𝐄𝐒𝐎" : "✅ 𝐋𝐈𝐕𝐑𝐄"}
╰┈┈┈┈୨୧┈┈┈┈╯

${boxFim(nomeBot)}`
        await sock.sendMessage(jid, { text: texto, mentions: [sender] }, { quoted: msg })
      }
    },

    ranking: {
      aliases: ["top", "topcidade"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const c = getCidade(); const rpg = db.rpg(); rpg.usuarios = rpg.usuarios || {}
        const lista = []
        for (const [num, u] of Object.entries(c.usuarios)) {
          const gold = (rpg.usuarios[num]?.moedas) || 0
          const patrimonio = gold + (u.banco || 0) + (u.casa ? (acharCasa(u.casa)?.preco || 0) : 0) + (u.predio ? (acharPredio(u.predio)?.preco || 0) : 0)
          lista.push({ num, patrimonio })
        }
        if (!lista.length) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐀𝐍𝐊𝐈𝐍𝐆", "Vazio!", "—", null, nomeBot) }, { quoted: msg }) }
        lista.sort((a, b) => b.patrimonio - a.patrimonio)
        const top10 = lista.slice(0, 10)
        let txt = `${boxTop("𝐑𝐀𝐍𝐊𝐈𝐍𝐆")}\n\n`
        top10.forEach((p2, i) => {
          const medalha = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🌸"
          txt += `╭┈┈┈┈୨୧┈┈┈┈╮\n𓆩 ${medalha} #${i + 1} 𓆪\n↳ @${p2.num}\n↳ ${fmtGold(p2.patrimonio)} gold\n╰┈┈┈┈୨୧┈┈┈┈╯\n`
        })
        txt += `\n${boxFim(nomeBot, "TOP 10 mais ricos.")}`
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: txt, mentions: top10.map(p2 => p2.num + "@s.whatsapp.net") }, { quoted: msg })
      }
    }

  }
}