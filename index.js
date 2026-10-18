/* ============================================================
   🔥 AKAZA BOT MD
   ============================================================ */

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadMediaMessage
} = require("@itsliaaa/baileys")
const { Boom } = require("@hapi/boom")
const P = require("pino")
const fs = require("fs")
const path = require("path")
const readline = require("readline")
const crypto = require("crypto")

const config = require("./config")

const DATA_DIR = path.join(__dirname, "data")
const MENUS_DIR = path.join(__dirname, "menus")

// ============================================================
// 📁 BOOTSTRAP
// ============================================================
function bootstrap() {
  const pastas = [
    DATA_DIR,
    MENUS_DIR,
    path.join(MENUS_DIR, "menu-adm"),
    path.join(MENUS_DIR, "menu-dono"),
    path.join(MENUS_DIR, "menu-vip"),
    path.join(MENUS_DIR, "menu-rpg"),
    path.join(MENUS_DIR, "menu-fazenda"),
    path.join(MENUS_DIR, "menu-fnaf"),
    path.join(MENUS_DIR, "menu-cidade")
  ]
  for (const pasta of pastas) {
    if (!fs.existsSync(pasta)) {
      try { fs.mkdirSync(pasta, { recursive: true }); console.log("📁 Pasta criada: " + pasta) } catch (e) { console.log("❌ " + e.message) }
    }
  }

  const arquivoCidadeJson = path.join(DATA_DIR, "cidade.json")
  if (!fs.existsSync(arquivoCidadeJson)) {
    try { fs.writeFileSync(arquivoCidadeJson, JSON.stringify({ usuarios: {}, casas: {}, predios: {} }, null, 2)) } catch (e) {}
  }

  const commitPath = path.join(DATA_DIR, "ultimo_commit.json")
  let commitData = { versao: 3 }
  if (fs.existsSync(commitPath)) {
    try {
      commitData = JSON.parse(fs.readFileSync(commitPath, "utf8"))
      commitData.versao = 3
      fs.writeFileSync(commitPath, JSON.stringify(commitData, null, 2))
    } catch (e) {
      fs.writeFileSync(commitPath, JSON.stringify({ versao: 3, hash: "reset" }, null, 2))
    }
  } else {
    try { fs.writeFileSync(commitPath, JSON.stringify({ versao: 3, hash: "reset" }, null, 2)) } catch (e) {}
  }
}
bootstrap()

// ============================================================
// 💾 DB
// ============================================================
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

const db = {
  grupos: () => dbLer("grupos.json", {}),
  salvarGrupos: (d) => dbSalvar("grupos.json", d),
  advs: () => dbLer("advs.json", {}),
  salvarAdvs: (d) => dbSalvar("advs.json", d),
  config: () => dbLer("config.json", { fotoMenu: null, prefixoGlobal: null, slow: false, subdonos: [], nomeBot: "Akaza" }),
  salvarConfig: (d) => dbSalvar("config.json", d),
  canal: () => dbLer("canal.json", { jid: null, nome: null, link: null }),
  salvarCanal: (d) => dbSalvar("canal.json", d),
  listanegra: () => dbLer("listanegra.json", {}),
  salvarListanegra: (d) => dbSalvar("listanegra.json", d),
  aluguel: () => dbLer("aluguel.json", { ativo: false, grupos: {} }),
  salvarAluguel: (d) => dbSalvar("aluguel.json", d),
  parcerias: () => dbLer("parcerias.json", {}),
  salvarParcerias: (d) => dbSalvar("parcerias.json", d),
  avisos: () => dbLer("avisos.json", {}),
  salvarAvisos: (d) => dbSalvar("avisos.json", d),
  afk: () => dbLer("afk.json", {}),
  salvarAfk: (d) => dbSalvar("afk.json", d),
  mutados: () => dbLer("mutados.json", {}),
  salvarMutados: (d) => dbSalvar("mutados.json", d),
  palavroes: () => dbLer("palavroes.json", {}),
  salvarPalavroes: (d) => dbSalvar("palavroes.json", d),
  subadmins: () => dbLer("subadmins.json", {}),
  salvarSubadmins: (d) => dbSalvar("subadmins.json", d),
  vips: () => dbLer("vips.json", { vips: {} }),
  salvarVips: (d) => dbSalvar("vips.json", d),
  bangp: () => dbLer("bangp.json", { grupos: {} }),
  salvarBangp: (d) => dbSalvar("bangp.json", d),
  rpg: () => dbLer("rpg.json", { usuarios: {} }),
  salvarRpg: (d) => dbSalvar("rpg.json", d),
  autocfg: () => dbLer("autocfg.json", { grupos: {} }),
  salvarAutocfg: (d) => dbSalvar("autocfg.json", d)
}

// ============================================================
// 🛠️ HELPERS
// ============================================================
function getAlvo(msg) {
  const ctx = (msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo) ||
              (msg.message && msg.message.imageMessage && msg.message.imageMessage.contextInfo) ||
              (msg.message && msg.message.videoMessage && msg.message.videoMessage.contextInfo) || {}
  const mentions = ctx.mentionedJid || []
  if (mentions.length) return mentions[0]
  if (ctx.participant) return ctx.participant
  return null
}

function soNumero(jid) {
  if (!jid) return ""
  if (typeof jid === "object") jid = jid.phoneNumber || jid.id || ""
  return String(jid).split("@")[0].split(":")[0].replace(/\D/g, "")
}

function getTexto(msg) {
  return (msg.message && msg.message.conversation) ||
         (msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.text) ||
         (msg.message && msg.message.imageMessage && msg.message.imageMessage.caption) ||
         (msg.message && msg.message.videoMessage && msg.message.videoMessage.caption) || ""
}

function getTextoBotao(msg) {
  try {
    if (msg.message && msg.message.buttonsResponseMessage) return msg.message.buttonsResponseMessage.selectedButtonId || ""
    if (msg.message && msg.message.templateButtonReplyMessage) return msg.message.templateButtonReplyMessage.selectedId || ""
    if (msg.message && msg.message.listResponseMessage) return msg.message.listResponseMessage.singleSelectReply && msg.message.listResponseMessage.singleSelectReply.selectedRowId || ""
    
    const msgStr = JSON.stringify(msg.message)
    if (msgStr.includes('"selectedId":"menu"') || msgStr.includes('"id":"menu"') || msgStr.includes('menu')) {
      if (msg.message.interactiveResponseMessage || msg.message.buttonsResponseMessage || msgStr.includes("nativeFlowResponse")) {
        return "menu"
      }
    }
  } catch (_) {}
  return ""
}

function naListaNegra(jidGrupo, jidOuNum) {
  const num = soNumero(jidOuNum)
  if (!num) return false
  return (db.listanegra()[jidGrupo] || []).includes(num)
}

function aluguelAtivo() { return db.aluguel().ativo === true }

function grupoTemAluguel(jid) {
  const a = db.aluguel()
  const exp = a.grupos && a.grupos[jid]
  return exp && Date.now() < exp
}

function formatarTempo(ms) {
  const s = Math.floor(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60), d = Math.floor(h / 24)
  if (d > 0) return d + "d " + (h % 24) + "h"
  if (h > 0) return h + "h " + (m % 60) + "min"
  if (m > 0) return m + "min " + (s % 60) + "s"
  return s + "s"
}

function adicionarAviso(grupoJid, userJid, tipo) {
  const avisos = db.avisos()
  avisos[grupoJid] = avisos[grupoJid] || {}
  const num = soNumero(userJid)
  avisos[grupoJid][num] = avisos[grupoJid][num] || {}
  avisos[grupoJid][num][tipo] = (avisos[grupoJid][num][tipo] || 0) + 1
  db.salvarAvisos(avisos)
  return avisos[grupoJid][num][tipo]
}

function limparAvisos(grupoJid, userJid, tipo) {
  const avisos = db.avisos()
  const num = soNumero(userJid)
  if (avisos[grupoJid] && avisos[grupoJid][num] && avisos[grupoJid][num][tipo]) {
    avisos[grupoJid][num][tipo] = 0
    db.salvarAvisos(avisos)
  }
}

function ehSubAdmin(jidGrupo, jidUser) {
  const subs = db.subadmins()[jidGrupo] || []
  const num = soNumero(jidUser)
  return subs.some(s => soNumero(s) === num)
}

function botEhAdmin(meta, sock) {
  if (!meta) return false
  const botIds = [sock.user && sock.user.id, sock.user && sock.user.lid, sock.user && sock.user.jid].filter(Boolean).map(soNumero)
  const botPart = meta.participants.find(p => {
    const ids = [p.id, p.lid, p.phoneNumber].filter(Boolean).map(soNumero)
    return ids.some(id => botIds.includes(id))
  })
  return botPart && (botPart.admin === "admin" || botPart.admin === "superadmin")
}

function dataBrasil() {
  return new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).split("/").reverse().join("-")
}

async function notificarX9(sock, groupJid, tipo, autor, alvo) {
  try {
    const conf = db.grupos()[groupJid] || {}
    if (!conf.x9) return
    const meta = await sock.groupMetadata(groupJid)
    const autorNum = soNumero(autor)
    const alvoNum = alvo ? soNumero(alvo) : null
    const nomeGrupo = meta.subject || "Grupo"
    const hora = new Date().toLocaleString("pt-BR")
    let texto = ""
    if (tipo === "PROMOTE") texto = "🔥 X9 - @" + autorNum + " promoveu @" + alvoNum + "\n" + nomeGrupo + "\n" + hora
    else if (tipo === "DEMOTE") texto = "🔥 X9 - @" + autorNum + " rebaixou @" + alvoNum + "\n" + nomeGrupo + "\n" + hora
    else if (tipo === "REMOVE") texto = "🔥 X9 - @" + autorNum + " removeu @" + alvoNum + "\n" + nomeGrupo + "\n" + hora
    else return
    await sock.sendMessage(groupJid, { text: texto, mentions: [autor, alvo].filter(Boolean) })
  } catch (e) { console.log("X9 erro:", e.message) }
}

// ============================================================
// 🎨 AUTOFIX + AUTOTTK
// ============================================================
async function processarAutoFig(sock, msg, remetente, isGrupo) {
  if (!isGrupo) return false
  const conf = (db.autocfg().grupos && db.autocfg().grupos[remetente]) || {}
  if (!conf.autofig) return false

  const temImg = msg.message && msg.message.imageMessage
  const temVid = msg.message && msg.message.videoMessage
  if (!temImg && !temVid) return false

  try {
    const sharp = require("sharp")
    const ff = require("@ffmpeg-installer/ffmpeg").path
    const os = require("os")
    const { execSync } = require("child_process")

    const buf = await downloadMediaMessage(msg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })

    let wp
    if (temImg) {
      wp = await sharp(buf).resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 90 }).toBuffer()
    } else {
      const tIn = path.join(os.tmpdir(), "af_" + Date.now() + ".mp4")
      const tOut = path.join(os.tmpdir(), "af_" + Date.now() + ".webp")
      fs.writeFileSync(tIn, buf)
      execSync(`"${ff}" -y -i "${tIn}" -vcodec libwebp -filter:v "fps=15,scale=512:512:force_original_aspect_ratio=decrease" -lossless 0 -compression_level 6 -q:v 50 -loop 0 -preset default -an -vsync 0 -s 512:512 "${tOut}"`, { stdio: "ignore" })
      wp = fs.readFileSync(tOut)
      try { fs.unlinkSync(tIn) } catch (_) {}
      try { fs.unlinkSync(tOut) } catch (_) {}
    }

    await sock.sendMessage(remetente, { sticker: wp }, { quoted: msg })
    return true
  } catch (e) { console.log("Erro autofig:", e.message); return false }
}

async function processarAutoTtk(sock, msg, remetente, isGrupo) {
  if (!isGrupo) return false
  const conf = (db.autocfg().grupos && db.autocfg().grupos[remetente]) || {}
  if (!conf.autottk) return false

  const texto = getTexto(msg)
  if (!texto) return false
  const match = texto.match(/https?:\/\/(www\.|vm\.|vt\.)?tiktok\.com\/[^\s]+/i)
  if (!match) return false

  try {
    const r = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(match[0])}&hd=1`)
    const d = await r.json()
    if (d.code !== 0 || !d.data || !d.data.play) return false

    const vid = await fetch(d.data.play)
    const buffer = Buffer.from(await vid.arrayBuffer())

    if (buffer.length > 16 * 1024 * 1024) {
      await sock.sendMessage(remetente, { text: "🔥 Vídeo muito grande (max 16MB)" }, { quoted: msg })
      return true
    }

    await sock.sendMessage(remetente, { video: buffer, mimetype: "video/mp4", fileName: "tiktok.mp4" }, { quoted: msg })
    return true
  } catch (e) { console.log("Erro autottk:", e.message); return false }
}

// ============================================================
// 🤖 SISTEMA DE IA
// ============================================================
async function processarIA(sock, msg, remetente, sender, isGrupo, db) {
  if (isGrupo) {
    const conf = db.grupos()[remetente] || {}
    if (!conf.iaAtiva) return false
  }

  const texto = getTexto(msg)
  if (!texto) return false

  const botNum = soNumero(sock.user?.id)
  const botNome = (db.config().nomeBot || "Akaza").toLowerCase()
  
  const ctx = msg.message?.extendedTextMessage?.contextInfo || {}
  const mentionedJid = ctx.mentionedJid || []
  
  const mencionadoPorId = mentionedJid.some(j => soNumero(j) === botNum)
  const mencionadoPorTexto = texto.toLowerCase().includes("@" + botNome) || texto.toLowerCase().includes("@" + botNome.replace(/\s+/g, ""))
  const respondendoBot = ctx.participant && soNumero(ctx.participant) === botNum

  if (!mencionadoPorId && !respondendoBot && !mencionadoPorTexto) return false

  let pergunta = texto
    .replace(/@\d+/g, "")
    .replace(new RegExp("@" + botNome, "gi"), "")
    .replace(new RegExp(botNome, "gi"), "")
    .trim()

  if (!pergunta) pergunta = "Oi"

  try {
    await sock.sendPresenceUpdate("composing", remetente)

    const promptSistema = encodeURIComponent(`Você é o Akaza, um bot de WhatsApp estilo anime/inspirado em Demon Slayer. Responda de forma curta, direta e com personalidade. Use emojis às vezes (❄️⚔️🔥). Não seja muito formal. O usuário disse: ${pergunta}`)
    
    const response = await fetch(`https://text.pollinations.ai/${promptSistema}`, {
      method: 'GET',
      headers: { 'Content-Type': 'text/plain' },
      signal: AbortSignal.timeout(30000)
    })

    if (!response.ok) throw new Error("Erro na API da IA")

    const resposta = await response.text()

    if (resposta && resposta.trim()) {
      await sock.sendMessage(remetente, { text: resposta.trim() }, { quoted: msg })
    } else {
      await sock.sendMessage(remetente, { text: "❄️ Não consegui pensar em nada..." }, { quoted: msg })
    }
    return true
  } catch (e) {
    console.log("❌ Erro IA:", e.message)
    await sock.sendMessage(remetente, { text: `❄️ Erro na IA: ${e.message}` }, { quoted: msg })
    return true
  }
}

// ============================================================
// 📦 CARREGADOR DE MENUS
// ============================================================
const comandos = new Map()
const aliases = new Map()
global.rendasAutomaticas = global.rendasAutomaticas || []

function carregarMenus() {
  comandos.clear()
  aliases.clear()
  global.rendasAutomaticas = []

  if (!fs.existsSync(MENUS_DIR)) return
  const pastas = fs.readdirSync(MENUS_DIR)
  for (const pasta of pastas) {
    const caminhoPasta = path.join(MENUS_DIR, pasta)
    if (!fs.statSync(caminhoPasta).isDirectory()) continue

    const arquivos = fs.readdirSync(caminhoPasta).filter(f => f.endsWith(".js"))

    for (const arq of arquivos) {
      const arquivo = path.join(caminhoPasta, arq)
      try {
        delete require.cache[require.resolve(arquivo)]
        const mod = require(arquivo)
        if (!mod.commands) continue

        if (typeof mod.rendaAutomatica === "function") {
          global.rendasAutomaticas.push(mod.rendaAutomatica)
          console.log("[" + pasta + "/" + arq + "] renda automatica registrada!")
        }

        const menuCfg = {
          grupoOnly: mod.grupoOnly || false,
          adminOnly: mod.adminOnly || false,
          donoOnly: mod.donoOnly || false
        }
        for (const [nome, cmd] of Object.entries(mod.commands)) {
          const pacote = {
            nome,
            aliases: cmd.aliases || [],
            categoria: mod.menu || pasta,
            grupoOnly: cmd.grupoOnly !== undefined ? cmd.grupoOnly : menuCfg.grupoOnly,
            adminOnly: cmd.adminOnly !== undefined ? cmd.adminOnly : menuCfg.adminOnly,
            donoOnly: cmd.donoOnly !== undefined ? cmd.donoOnly : menuCfg.donoOnly,
            executar: cmd.executar
          }
          comandos.set(nome, pacote)
          for (const a of pacote.aliases) aliases.set(a, nome)
          console.log("[" + pasta + "/" + arq + "] " + nome + " ~ carregado!")
        }
      } catch (e) {
        console.log("Erro ao carregar " + pasta + "/" + arq + ":", e.message)
        console.log(e.stack)
      }
    }
  }

  const categorias = {}
  for (const [nome, cmd] of comandos.entries()) {
    const cat = cmd.categoria || "outros"
    categorias[cat] = (categorias[cat] || 0) + 1
  }
  global.totalComandos = comandos.size
  global.totalAliases = aliases.size
  global.comandosPorCategoria = categorias

  console.log("\n🔥 Akaza Bot carregou " + comandos.size + " comandos...")
  console.log(aliases.size + " aliases registrados\n")
}

global.__carregarMenus = carregarMenus

function getComando(n) {
  if (comandos.has(n)) return comandos.get(n)
  if (aliases.has(n)) return comandos.get(aliases.get(n))
  return null
}

let canalCache = null
function recarregarCanal() { canalCache = db.canal() }

function envolverSendMessage(sock) {
  const original = sock.sendMessage.bind(sock)
  sock.sendMessage = async (jid, content, options = {}) => {
    try {
      const temBotoes = content && (content.buttons || content.sections || content.templateButtons || content.buttonText || content.interactiveButtons || content.listMessage)
      if (temBotoes) return original(jid, content, options)
      if (options.edit) return original(jid, content, options)
      
      if (options.ignorarCanal) return original(jid, content, options)

      if (!canalCache) recarregarCanal()
      const c = canalCache
      if (c && c.jid && c.jid !== "0@newsletter") {
        content.contextInfo = content.contextInfo || {}
        content.contextInfo.forwardedNewsletterMessageInfo = {
          newsletterJid: c.jid,
          newsletterName: c.nome || "Canal",
          serverMessageId: 0
        }
        content.contextInfo.forwardingScore = 1
        content.contextInfo.isForwarded = true
      }
    } catch (_) {}
    return original(jid, content, options)
  }
}

// ============================================================
// 🔥 COMANDOS SEM PREFIXO
// ============================================================
async function processarComandoSemPrefixo(sock, msg, remetente, sender, isGrupo, isDono, isSubDono) {
  if (!isGrupo) return false
  if (msg.key.fromMe) return false

  try {
    const textoOriginal = getTexto(msg).trim()
    if (!textoOriginal) return false
    const texto = textoOriginal.toLowerCase()

    const cfg = db.config()
    const nomeBot = (cfg.nomeBot || "akaza").toLowerCase().trim()
    if (!nomeBot) return false

    const textoSemEspaco = texto.replace(/\s+/g, " ")
    const nomeSemEspaco = nomeBot.replace(/\s+/g, "")

    let comando = null
    if (textoSemEspaco.startsWith(nomeBot)) {
      const resto = textoSemEspaco.slice(nomeBot.length).trim()
      if (resto === "fecha") comando = "fecha"
      else if (resto === "abre") comando = "abre"
    }
    if (!comando) {
      const textoSemEspacoTotal = texto.replace(/\s+/g, "")
      if (textoSemEspacoTotal.startsWith(nomeSemEspaco)) {
        const resto = textoSemEspacoTotal.slice(nomeSemEspaco.length)
        if (resto === "fecha") comando = "fecha"
        else if (resto === "abre") comando = "abre"
      }
    }

    if (!comando) return false

    let ehAdmin = false
    try {
      const meta = await sock.groupMetadata(remetente)
      const p = meta.participants.find(x => 
        x.id === sender || 
        soNumero(x.id) === soNumero(sender) || 
        soNumero(x.lid) === soNumero(sender)
      )
      ehAdmin = p && (p.admin === "admin" || p.admin === "superadmin")
    } catch (e) { console.log("Erro ao verificar admin:", e.message) }

    if (!ehAdmin && !isDono && !isSubDono) {
      await sock.sendMessage(remetente, {
        text: "🔥⚔️ *SEM PERMISSÃO*\n\n" +
          "> 👁️ _\"Meus olhos veem que você não é admin.\"_\n" +
          "> _\"Não posso obedecer.\"_\n\n> ⚔️ _\"Respeite a hierarquia.\"_"
      }, { quoted: msg })
      return true
    }

    if (comando === "fecha") {
      try {
        await sock.groupSettingUpdate(remetente, "announcement")
        await sock.sendMessage(remetente, {
          text: "🔥🔒 *GRUPO FECHADO*\n\n" +
            "> _\"A força observa em silêncio.\"_\n" +
            "> _\"Só os dignos falam.\"_\n\n" +
            "━━━━━━━━━━━━━━━━━━━━━━\n" +
            "⚔️ _Respiração... 3ª Forma: Aniquilação._"
        }, { quoted: msg })
      } catch (e) {
        await sock.sendMessage(remetente, { text: "🔥 *Erro ao fechar:* " + e.message }, { quoted: msg })
      }
      return true
    }

    if (comando === "abre") {
      try {
        await sock.groupSettingUpdate(remetente, "not_announcement")
        await sock.sendMessage(remetente, {
          text: "🔥🔓 *GRUPO ABERTO*\n\n" +
            "> _\"A força ilumina todos.\"_\n" +
            "> _\"Respirem, mortais.\"_\n\n" +
            "━━━━━━━━━━━━━━━━━━━━━━\n" +
            "⚔️ _Respirando Lua Crescente..._"
        }, { quoted: msg })
      } catch (e) {
        await sock.sendMessage(remetente, { text: "🔥 *Erro ao abrir:* " + e.message }, { quoted: msg })
      }
      return true
    }

  } catch (e) {
    console.log("Erro comando sem prefixo:", e.message)
  }
  return false
}

// ============================================================
// 🎴 DETECTOR DE FIGURINHAS COMANDO
// ============================================================
async function processarFigCmd(sock, msg, remetente, sender, isGrupo, isDono, isSubDono) {
  if (!isGrupo) return false
  if (msg.key.fromMe) return false
  if (!msg.message || !msg.message.stickerMessage) return false

  try {
    const dbFig = dbLer("figcmd.json", {})
    const grupo = dbFig[remetente] || {}
    if (!Object.keys(grupo).length) return false

    const buf = await downloadMediaMessage(msg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
    if (!buf || !buf.length) return false

    const hash = crypto.createHash("md5").update(buf).digest("hex")
    const dados = grupo[hash]

    if (!dados) return false

    const cmdExecutar = getComando(dados.comando)
    if (!cmdExecutar) {
      console.log("🎴 Figcmd registrada mas comando não existe:", dados.comando)
      return false
    }

    console.log("🎴 Figurinha comando detectada:", dados.comando, "por", soNumero(sender))

    let groupMetadata = null
    let isAdmin = false
    try {
      groupMetadata = await sock.groupMetadata(remetente)
      const p = groupMetadata.participants.find(x => x.id === sender || soNumero(x.id) === soNumero(sender) || soNumero(x.lid) === soNumero(sender))
      isAdmin = p && (p.admin === "admin" || p.admin === "superadmin")
    } catch (_) {}

    const ehSub = ehSubAdmin(remetente, sender)
    const permitidoSub = ["mute", "desmute", "ban", "kick", "link", "linkgp", "fechar", "closenow", "abrir", "opennow"]
    const ehComandoSub = permitidoSub.includes(cmdExecutar.nome) || (cmdExecutar.aliases || []).some(a => permitidoSub.includes(a))
    const podeAdmin = isAdmin || isDono || isSubDono || (ehSub && ehComandoSub)

    if (cmdExecutar.donoOnly && !isDono && !isSubDono) {
      await sock.sendMessage(remetente, { text: "🔥 Esse comando é só do mestre!" }, { quoted: msg })
      return true
    }
    if (cmdExecutar.adminOnly && !podeAdmin && !isSubDono) {
      await sock.sendMessage(remetente, { text: "🔥 Esse comando é de adm!" }, { quoted: msg })
      return true
    }

    try {
      await cmdExecutar.executar({
        sock, msg, args: [],
        sender, isGrupo, isAdmin, isDono, isSubDono,
        ehSub, podeAdmin,
        groupMetadata, config, prefixoAtivo: db.config().prefixoGlobal || config.prefixo || "!",
        db,
        utils: {
          getAlvo, soNumero, getTexto, downloadMediaMessage, recarregarCanal,
          naListaNegra, aluguelAtivo, grupoTemAluguel, formatarTempo,
          adicionarAviso, limparAvisos, DATA_DIR, botEhAdmin,
          dbLer, dbSalvar, getTextoBotao, ehSubAdmin
        }
      })
    } catch (e) {
      console.log("Erro ao executar figcmd:", e.message)
    }

    return true

  } catch (e) {
    console.log("Erro detector figcmd:", e.message)
    return false
  }
}

// ============================================================
// 🚀 START
// ============================================================
let NUMERO_PAREAMENTO = null
let sockGlobal = null

async function iniciar() {
  const { state, saveCreds } = await useMultiFileAuthState("auth")
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    logger: P({ level: "silent" }),
    auth: state,
    printQRInTerminal: false,
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 30000,
    syncFullHistory: false
  })

  sockGlobal = sock
  recarregarCanal()
  envolverSendMessage(sock)
  sock.ev.on("creds.update", saveCreds)

  if (!state.creds.registered) {
    setTimeout(async () => {
      try {
        console.log("\n═══════════════════════════════")
        console.log("   🔥 AKAZA BOT - MD")
        console.log("═══════════════════════════════\n")
        console.log("Digite o NUMERO do bot (com DDI, so digitos):")
        console.log("Exemplo: 5511999999999\n")

        const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
        rl.question("Numero: ", async (numeroDigitado) => {
          rl.close()
          const numero = String(numeroDigitado).replace(/\D/g, "")
          if (!numero || numero.length < 10) { console.log("\nNumero invalido! Reinicie o bot."); process.exit(1) }
          NUMERO_PAREAMENTO = numero
          console.log("\nNumero salvo: " + numero + "\nGerando codigo de pareamento...\n")
          try {
            const code = await sock.requestPairingCode(numero)
            console.log("╔═══════════════════════════════╗")
            console.log("║   CODIGO DE PAREAMENTO        ║")
            console.log("╠═══════════════════════════════╣")
            console.log("║   " + code + "                       ║")
            console.log("╚═══════════════════════════════╝\n")
            console.log("WhatsApp > Aparelhos conectados > Conectar > Conectar com numero\n")
          } catch (e) { console.log("Erro ao gerar codigo:", e.message) }
        })
      } catch (e) { console.log("Erro:", e.message) }
    }, 5000)
  }

  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "close") {
      const motivo = (lastDisconnect?.error instanceof Boom)
        ? lastDisconnect.error.output.statusCode
        : null
      if (motivo === DisconnectReason.loggedOut) process.exit(1)
      else setTimeout(() => iniciar(), 3000)
    } else if (connection === "open") {
      console.log("\n🔥 CONECTADO! Akaza Bot online\n")
    }
  })

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return
    const msg = messages[0]
    if (!msg.message) return

    const remetente = msg.key.remoteJid
    const isGrupo = remetente.endsWith("@g.us")

    let senderRaw = isGrupo ? msg.key.participant : remetente
    let sender = senderRaw

    if (senderRaw && senderRaw.endsWith("@lid")) {
      if (msg.key && msg.key.participantPn) sender = msg.key.participantPn
      else if (msg.key && msg.key.participantAlt) sender = msg.key.participantAlt
      else if (isGrupo) {
        try {
          const meta = await sock.groupMetadata(remetente).catch(() => null)
          if (meta) {
            const p = meta.participants.find(x => x.lid === senderRaw || x.id === senderRaw || (x.lid && soNumero(x.lid) === soNumero(senderRaw)))
            if (p && p.phoneNumber) sender = p.phoneNumber
            else if (p && p.id && !p.id.endsWith("@lid")) sender = p.id
          }
        } catch (_) {}
      }
    }

    const numerosDono = (Array.isArray(config.dono) ? config.dono : [config.dono]).map(soNumero)
    const senderCandidatos = [
      sender, senderRaw,
      msg.key && msg.key.participant, msg.key && msg.key.participantPn,
      msg.key && msg.key.participantLid, msg.key && msg.key.remoteJid, msg.participant,
      sock.user && sock.user.id, sock.user && sock.user.lid
    ].filter(Boolean)
    const senderNums = senderCandidatos.map(soNumero).filter(Boolean)
    const isDono = msg.key.fromMe === true || senderNums.some(n => numerosDono.includes(n))

    const cfgSub = db.config()
    const numerosSub = (cfgSub.subdonos || []).map(soNumero)
    const isSubDono = senderNums.some(n => numerosSub.includes(n)) && !isDono

    if (isGrupo && !isDono && !isSubDono) {
      const b = db.bangp()
      if (b.grupos && b.grupos[remetente]) return
    }

    if (isGrupo && !msg.key.fromMe) {
      const feito = await processarComandoSemPrefixo(sock, msg, remetente, sender, isGrupo, isDono, isSubDono)
      if (feito) return
    }

    if (isGrupo && !msg.key.fromMe) {
      const feito = await processarFigCmd(sock, msg, remetente, sender, isGrupo, isDono, isSubDono)
      if (feito) return
    }

    if (!msg.key.fromMe) {
      const feito = await processarIA(sock, msg, remetente, sender, isGrupo, db)
      if (feito) return
    }

    if (isGrupo && !msg.key.fromMe) {
      try {
        const confAuto = (db.autocfg().grupos && db.autocfg().grupos[remetente]) || {}
        if (confAuto.autottk) {
          const feito = await processarAutoTtk(sock, msg, remetente, isGrupo)
          if (feito) return
        }
        if (confAuto.autofig) {
          const feito = await processarAutoFig(sock, msg, remetente, isGrupo)
          if (feito) return
        }
      } catch (e) { console.log("Erro auto:", e.message) }
    }

    if (isGrupo && !msg.key.fromMe) {
      try {
        const grupos = db.grupos()
        const conf = grupos[remetente] || {}
        if (conf.rpgAtivo === true) {
          const rpg = db.rpg()
          const dataHoje = dataBrasil()
          const num = soNumero(sender)
          rpg.usuarios = rpg.usuarios || {}
          rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
          if (rpg.usuarios[num].ultimoGanho !== dataHoje) {
            rpg.usuarios[num].moedas = (rpg.usuarios[num].moedas || 0) + 100
            rpg.usuarios[num].ultimoGanho = dataHoje
            db.salvarRpg(rpg)
            await sock.sendMessage(remetente, {
              text: "🔥💰 Gold diario! +100 pra @" + num + "\nSaldo: " + rpg.usuarios[num].moedas,
              mentions: [sender]
            })
          }
        }
      } catch (_) {}
    }

    if (isGrupo && aluguelAtivo() && !isDono && !isSubDono && !grupoTemAluguel(remetente)) return

    if (isGrupo && !msg.key.fromMe) {
      const cands = [sender, msg.key && msg.key.participantPn, msg.key && msg.key.participantLid].filter(Boolean)
      if (cands.some(j => naListaNegra(remetente, j))) {
        try { await sock.sendMessage(remetente, { delete: msg.key }) } catch (_) {}
        try { await sock.groupParticipantsUpdate(remetente, [sender], "remove") } catch (_) {}
        return
      }
    }

    if (isGrupo && !msg.key.fromMe) {
      const grupos = db.grupos()
      const conf = grupos[remetente] || {}
      const meta = await sock.groupMetadata(remetente).catch(() => null)

      const senderCands = [
        sender, senderRaw,
        msg.key && msg.key.participant, msg.key && msg.key.participantPn,
        msg.key && msg.key.participantLid, msg.key && msg.key.remoteJid
      ].filter(Boolean).map(soNumero)

      const isAdm = meta && meta.participants.find(p => {
        const pIds = [p.id, p.lid, p.phoneNumber].filter(Boolean).map(soNumero)
        return senderCands.some(cand => pIds.includes(cand))
      })
      const ehAdmin = isAdm && (isAdm.admin === "admin" || isAdm.admin === "superadmin")
      const ehSub = ehSubAdmin(remetente, sender)
      const podeBurlar = ehAdmin || isDono || isSubDono || ehSub

      const mutados = db.mutados()
      const mutadosG = mutados[remetente] || {}
      let jidMutado = null
      for (const c of senderCands) {
        for (const j of Object.keys(mutadosG)) {
          if (soNumero(j) === soNumero(c) && mutadosG[j] > Date.now()) { jidMutado = j; break }
        }
        if (jidMutado) break
      }
      if (jidMutado && !podeBurlar) {
        try { await sock.sendMessage(remetente, { delete: msg.key }) } catch (_) {}
        return
      }

      if (conf.palavrao && !podeBurlar) {
        const lista = db.palavroes()[remetente] || []
        const normalizar = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim()
        const textoNorm = normalizar(getTexto(msg))
        const temPalavrao = lista.some(p => {
          const pl = normalizar(p)
          if (!pl) return false
          return new RegExp("\\b" + pl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i").test(textoNorm)
        })
        if (lista.length && textoNorm && temPalavrao) {
          try { await sock.sendMessage(remetente, { delete: msg.key }) } catch (_) {}
          const n = adicionarAviso(remetente, sender, "palavrao")
          if (n >= 3) {
            limparAvisos(remetente, sender, "palavrao")
            await sock.sendMessage(remetente, { text: "@" + soNumero(sender) + " 3/3 palavras proibidas!", mentions: [sender] })
            try { await sock.groupParticipantsUpdate(remetente, [sender], "remove") } catch (_) {}
          } else {
            await sock.sendMessage(remetente, { text: "@" + soNumero(sender) + " palavra proibida - " + n + "/3", mentions: [sender] })
          }
          return
        }
      }

      const afks = db.afk()
      const afkGrupo = afks[remetente] || {}
      let jidAfk = null
      for (const c of senderCands) {
        for (const j of Object.keys(afkGrupo)) {
          if (soNumero(j) === soNumero(c)) { jidAfk = j; break }
        }
        if (jidAfk) break
      }
      if (jidAfk && afkGrupo[jidAfk]) {
        const info = afkGrupo[jidAfk]
        const tempo = formatarTempo(Date.now() - info.desde)
        delete afkGrupo[jidAfk]
        afks[remetente] = afkGrupo
        db.salvarAfk(afks)
        await sock.sendMessage(remetente, {
          text: "🔥 @" + soNumero(jidAfk) + " voltou! Ficou AFK " + tempo,
          mentions: [jidAfk]
        })
      }

      const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
      const mencionados = ctx.mentionedJid || []
      for (const m of mencionados) {
        for (const [j, info] of Object.entries(afkGrupo)) {
          if (soNumero(j) === soNumero(m)) {
            const tempo = formatarTempo(Date.now() - info.desde)
            await sock.sendMessage(remetente, {
              text: "🔥💤 AFK: @" + soNumero(j) + "\nHa " + tempo + "\nMotivo: " + info.motivo,
              mentions: [j]
            })
          }
        }
      }

      if (conf.antilink && !podeBurlar) {
        const textoMsg = getTexto(msg)
        const linkGrupo = /(chat\.whatsapp\.com|wa\.me\/)/i.test(textoMsg)
        const linkGeral = /(https?:\/\/|www\.|\.com|\.net|\.br|\.io|\.org|\.xyz|\.tv|\.me|\.gg)/i.test(textoMsg)

        if (linkGrupo) {
          const parcerias = db.parcerias()
          const p = parcerias[remetente] || {}
          const parceiros = p.parceiros || {}
          const modoParceria = p.ativo === true

          let encontrado = null
          let jidParceiro = null
          for (const [jidP, info] of Object.entries(parceiros)) {
            const jidPNum = soNumero(jidP)
            if (senderCands.some(cand => cand === jidPNum)) {
              encontrado = info
              jidParceiro = jidP
              break
            }
          }

          if (modoParceria && encontrado) {
            if (encontrado.usados < encontrado.total) {
              encontrado.usados++
              db.salvarParcerias(parcerias)
              const restantes = encontrado.total - encontrado.usados
              const extra = restantes === 0 
                ? "⚠️ *Esse foi o seu último link de hoje!* Volta amanhã." 
                : `✨ Ainda tem *${restantes}* link(s) restante(s) hoje.`

              try {
                await sock.sendMessage(remetente, {
                  text: `❄️ • 𝐀𝐋𝐈𝐀𝐍𝐂̧𝐀 𝐀𝐏𝐑𝐎𝐕𝐀𝐃𝐀 •\n\n╭─〔 ✅ 𝐀𝐂𝐄𝐒𝐒𝐎 𝐋𝐈𝐁𝐄𝐑𝐀𝐃𝐎 〕\n│ @${soNumero(sender)}, o link foi autorizado!\n╰──────────────\n\n『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴\n📊 𝐔𝐬𝐨:\n╰➜ ${encontrado.usados}/${encontrado.total} links enviados.\n\n${extra}\n\n❄️ _"Tempest sempre honra suas alianças."_`,
                  mentions: [sender]
                })
              } catch (e) { console.log("Erro msg parceria:", e.message) }
              return
            } else {
              try { await sock.sendMessage(remetente, { delete: msg.key }) } catch (_) {}
              try {
                await sock.sendMessage(remetente, {
                  text: `❄️ • 𝐀𝐋𝐈𝐀𝐍𝐂̧𝐀 𝐄𝐒𝐆𝐎𝐓𝐀𝐃𝐀 •\n\n╭─〔 ⚠️ 𝐌𝐀𝐍𝐀 𝐈𝐍𝐒𝐔𝐅𝐈𝐂𝐈𝐄𝐍𝐓𝐄 〕\n│ @${soNumero(sender)}, você já usou todos os seus links hoje.\n╰──────────────\n\n『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴\n📊 𝐔𝐬𝐨:\n╰➜ ${encontrado.usados}/${encontrado.total} links diários.\n\n⏰ 𝐑𝐞𝐬𝐭𝐚𝐮𝐫𝐚𝐜̧𝐚̃𝐨:\n╰➜ Meia-noite (00:00).\n\n❄️ _"Descanse, slime. Amanhã você tenta de novo."_`,
                  mentions: [sender]
                })
              } catch (e) { console.log("Erro msg esgotada:", e.message) }
              return
            }
          }

          try { await sock.sendMessage(remetente, { delete: msg.key }) } catch (_) {}
          try {
            await sock.sendMessage(remetente, {
              text: `❄️ • 𝐎 𝐆𝐑𝐀𝐍𝐃𝐄 𝐒𝐀́𝐁𝐈𝐎 𝐀𝐍𝐀𝐋𝐈𝐒𝐎𝐔 •\n\n╭─〔 🚫 𝐋𝐈𝐍𝐊 𝐃𝐄𝐕𝐎𝐑𝐀𝐃𝐎 〕\n│ @${soNumero(sender)}, você tentou enviar um link de grupo sem autorização.\n╰──────────────\n\n『 𝐑𝐄𝐋𝐀𝐓𝐎́𝐑𝐈𝐎 』 ↴\n🧊 𝐀𝐜̧𝐚̃𝐨:\n╰➜ _Ativando [Predador]... Link apagado._\n\n📜 𝐌𝐨𝐭𝐢𝐯𝐨:\n╰➜ Sem aliança/parceria com o Reino de Tempest.\n\n💡 𝐒𝐨𝐥𝐮𝐜̧𝐚̃𝐨:\n╰➜ Peça para um administrador usar:\n   \`!parceria\`\n\n❄️ _"O Grande Sábio não tolera spam."_`,
              mentions: [sender]
            })
          } catch (e) { console.log("Erro msg bloqueio:", e.message) }
          return
        }

        if (linkGeral) {
          try { await sock.sendMessage(remetente, { delete: msg.key }) } catch (_) {}
          const n = adicionarAviso(remetente, sender, "link")
          if (n >= 3) {
            limparAvisos(remetente, sender, "link")
            await sock.sendMessage(remetente, { 
              text: `❄️ • 𝐄𝐗𝐏𝐔𝐋𝐒𝐎 𝐃𝐄 𝐓𝐄𝐌𝐏𝐄𝐒𝐓 •\n\n╭─〔 💀 𝐀𝐌𝐄𝐀𝐂̧𝐀 〕\n│ @${soNumero(sender)} atingiu 3/3 avisos.\n╰──────────────\n\n> _"Veldora, cuide disso."_`, 
              mentions: [sender] 
            })
            try { await sock.groupParticipantsUpdate(remetente, [sender], "remove") } catch (_) {}
          } else {
            await sock.sendMessage(remetente, { 
              text: `❄️ • 𝐀𝐍𝐓𝐈-𝐋𝐈𝐍𝐊 𝐀𝐓𝐈𝐕𝐀𝐃𝐎 •\n\n╭─〔 🐉 𝐕𝐄𝐋𝐃𝐎𝐑𝐀 𝐈𝐍𝐓𝐄𝐑𝐂𝐄𝐏𝐓𝐎𝐔 〕\n│ @${soNumero(sender)}, links externos não são permitidos aqui.\n╰──────────────\n\n『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴\n⚠️ 𝐀𝐯𝐢𝐬𝐨𝐬:\n╰➜ ${n}/3\n\n💡 _Pare de spammar ou será devorado._\n\n❄️ _"A tempestade se aproxima..."_`, 
              mentions: [sender] 
            })
          }
          return
        }
      }

      const antimap = [
        { cond: conf.antiaudio && msg.message && msg.message.audioMessage, tipo: "audio", nome: "Audio" },
        { cond: conf.antivideo && msg.message && msg.message.videoMessage, tipo: "video", nome: "Video" },
        { cond: conf.antifoto && msg.message && msg.message.imageMessage, tipo: "foto", nome: "Foto" },
        { cond: conf.antifig && msg.message && msg.message.stickerMessage, tipo: "fig", nome: "Figurinha" }
      ]
      for (const a of antimap) {
        if (a.cond && !podeBurlar) {
          const n = adicionarAviso(remetente, sender, a.tipo)
          try { await sock.sendMessage(remetente, { delete: msg.key }) } catch (_) {}
          if (n >= 3) {
            limparAvisos(remetente, sender, a.tipo)
            await sock.sendMessage(remetente, { text: "@" + soNumero(sender) + " 3/3 " + a.nome + "s!", mentions: [sender] })
            try { await sock.groupParticipantsUpdate(remetente, [sender], "remove") } catch (_) {}
          } else {
            await sock.sendMessage(remetente, { text: a.nome + "! " + n + "/3", mentions: [sender] })
          }
          return
        }
      }
    }

    const hoje = dataBrasil()
    const cfgAll = db.config()
    if (cfgAll.ultimoReset !== hoje) {
      const parceriasAll = db.parcerias()
      for (const jid of Object.keys(parceriasAll)) {
        const p = parceriasAll[jid]
        if (p && p.parceiros) for (const jidP of Object.keys(p.parceiros)) p.parceiros[jidP].usados = 0
      }
      db.salvarParcerias(parceriasAll)
      cfgAll.ultimoReset = hoje
      db.salvarConfig(cfgAll)
    }

    const grupos = db.grupos()
    const confGrupo = grupos[remetente] || {}
    const cfgGlobal = db.config()

    const prefixoGlobal = cfgGlobal.prefixoGlobal || config.prefixo || "!"
    let prefixosAtivos
    if (isGrupo && confGrupo.multiprefixo && confGrupo.prefixo) prefixosAtivos = [confGrupo.prefixo]
    else prefixosAtivos = [prefixoGlobal]

    let texto = getTexto(msg)

    const btnId = getTextoBotao(msg)
    if (btnId) {
      texto = btnId.replace(new RegExp("^\\" + prefixoGlobal + "+"), prefixoGlobal)
    }

    let prefixoUsado = prefixosAtivos.find(p => texto.startsWith(p))
    let cmdName = ""
    let args = []

    if (prefixoUsado) {
      const partes = texto.slice(prefixoUsado.length).trim().split(/\s+/)
      cmdName = partes[0]
      args = partes.slice(1)
    } else {
      const partes = texto.trim().split(/\s+/)
      const primeira = (partes[0] || "").toLowerCase()
      if (primeira === "prefixo") {
        cmdName = "prefixo"
        args = partes.slice(1)
        prefixoUsado = ""
      } else return
    }

    if (cmdName.toLowerCase() === "prefixo") {
      const p = prefixoGlobal
      const numUser = soNumero(sender)
      const nomeBot = db.config().nomeBot || "Akaza Bot"
      const cfgCmd = db.config()
      const mencoes = sender ? [sender] : []

      const textoBase = 
`💜 • 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐂̧𝐀̃𝐎 •

╭─〔 🦄 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 〕
│ Olá @${numUser}, este é o meu prefixo.
╰──────────────

🫟 𝐏𝐫𝐞𝐟𝐢𝐱𝐨 𝐀𝐭𝐮𝐚𝐥:
╰➜ 『 ${p} 』

💡 Para usar meus comandos, digite:
╰➜ ${p}menu

💜 _"Use com sabedoria."_

"${nomeBot}"`

      const opcoesEnvio = { 
        caption: textoBase, 
        mentions: mencoes,
        footer: "⚔️ " + nomeBot,
        buttons: [
          { buttonId: prefixoGlobal + "menu", buttonText: { displayText: "❄️ Menu-principal" }, type: 1 }
        ],
        headerType: 1,
        ignorarCanal: true
      }

      try {
        if (cfgCmd.fotoCmd) {
          const buf = Buffer.from(cfgCmd.fotoCmd, "base64")
          if (cfgCmd.tipoFotoCmd === "video") {
            await sock.sendMessage(remetente, { video: buf, mimetype: "video/mp4", fileName: "akaza.mp4", gifPlayback: true, ...opcoesEnvio }, { quoted: msg })
          } else {
            await sock.sendMessage(remetente, { image: buf, ...opcoesEnvio }, { quoted: msg })
          }
        } else {
          await sock.sendMessage(remetente, { text: textoBase, mentions: mencoes, buttons: opcoesEnvio.buttons, ignorarCanal: true }, { quoted: msg })
        }
      } catch (e) {
        console.log("Erro ao enviar prefixo com botão:", e.message)
        await sock.sendMessage(remetente, { text: textoBase, mentions: mencoes, ignorarCanal: true }, { quoted: msg })
      }
      return
    }

    const cmd = getComando(cmdName.toLowerCase())
    if (!cmd) {
      const p = (isGrupo && confGrupo.multiprefixo && confGrupo.prefixo) ? confGrupo.prefixo : prefixoGlobal
      const cmdLimpo = (cmdName || "").trim().toLowerCase()
      
      const VARIACOES_CMD_ERRADO = [
        { topo: "🔥 • 𝐂𝐎𝐌𝐀𝐍𝐃𝐎 𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎 •", aviso: "O comando informado não foi reconhecido.", frase: "💡 Verifique a escrita e tente novamente!" },
        { topo: "🔥 • 𝐂𝐎𝐌𝐀𝐍𝐃𝐎 𝐈𝐍𝐕𝐀́𝐋𝐈𝐃𝐎 •", aviso: "Isso não existe no meu repertório.", frase: "💡 Confira antes de tentar novamente." }
      ]

      const v = VARIACOES_CMD_ERRADO[Math.floor(Math.random() * VARIACOES_CMD_ERRADO.length)]
      const numUser = soNumero(sender)
      const hora = new Date().toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" })
      const data = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
      const nomeBot = db.config().nomeBot || "Akaza Bot"
      const cmdExibido = cmdLimpo ? (p + cmdLimpo) : p

      const textoBase =
`${v.topo}

╭─〔 🦄 𝐀𝐕𝐈𝐒𝐎 〕
│ ${v.aviso}
╰──────────────

『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴

👤 𝐔𝐬𝐮𝐚́𝐫𝐢𝐨:
╰➜ @${numUser}

🫟 𝐏𝐫𝐞𝐟𝐢𝐱𝐨:
╰➜ ${p}

❔ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨 𝐮𝐬𝐚𝐝𝐨:
╰➜ ${cmdExibido}

🕐 𝐇𝐨𝐫𝐚́𝐫𝐢𝐨:
╰➜ ${hora} — ${data}

${v.frase}

"${nomeBot}"`

      const cfgCmd = db.config()
      const mencoes = sender ? [sender] : []

      const opcoesErro = { 
        caption: textoBase, 
        mentions: mencoes,
        footer: "⚔️ " + nomeBot,
        buttons: [
          { buttonId: prefixoGlobal + "menu", buttonText: { displayText: "❄️ Menu-principal" }, type: 1 }
        ],
        headerType: 1,
        ignorarCanal: true
      }

      try {
        if (cfgCmd.fotoCmd) {
          const buf = Buffer.from(cfgCmd.fotoCmd, "base64")
          if (cfgCmd.tipoFotoCmd === "video") {
            await sock.sendMessage(remetente, { video: buf, mimetype: "video/mp4", fileName: "akaza.mp4", gifPlayback: true, ...opcoesErro }, { quoted: msg })
          } else {
            await sock.sendMessage(remetente, { image: buf, ...opcoesErro }, { quoted: msg })
          }
        } else {
          await sock.sendMessage(remetente, { text: textoBase, mentions: mencoes, buttons: opcoesErro.buttons, ignorarCanal: true }, { quoted: msg })
        }
      } catch (e) {
        await sock.sendMessage(remetente, { text: textoBase, mentions: mencoes, ignorarCanal: true }, { quoted: msg })
      }
      return
    }

    try {
      const cidData = dbLer("cidade.json", { usuarios: {} })
      const numSender = soNumero(sender)
      const userCidade = cidData.usuarios && cidData.usuarios[numSender]
      if (userCidade && userCidade.preso && userCidade.preso > Date.now()) {
        const tempoRestante = formatarTempo(userCidade.preso - Date.now())
        if (cmdName.toLowerCase() !== "prefixo") {
          await sock.sendMessage(remetente, { text: "🔥🚔 VOCÊ ESTÁ PRESO!\n\n⏰ Tempo: " + tempoRestante }, { quoted: msg })
          return
        }
      }
      if (userCidade && userCidade.preso && userCidade.preso <= Date.now()) {
        cidData.usuarios[numSender].preso = null
        dbSalvar("cidade.json", cidData)
      }
    } catch (_) {}

    let groupMetadata = null
    let isAdmin = false
    if (isGrupo) {
      groupMetadata = await sock.groupMetadata(remetente)
      const p = groupMetadata.participants.find(x => x.id === sender || soNumero(x.id) === soNumero(sender) || soNumero(x.lid) === soNumero(sender))
      isAdmin = p && (p.admin === "admin" || p.admin === "superadmin")
    }

    const ehSub = isGrupo && ehSubAdmin(remetente, sender)
    const permitidoSub = ["mute", "desmute", "ban", "kick", "link", "linkgp", "fechar", "closenow", "abrir", "opennow"]
    const ehComandoSub = permitidoSub.includes(cmd.nome) || (cmd.aliases || []).some(a => permitidoSub.includes(a))
    const podeAdmin = isAdmin || isDono || isSubDono || (ehSub && ehComandoSub)

    if (cfgGlobal.slow && !isDono && !isSubDono) {
      await new Promise(r => setTimeout(r, 2500))
    }

    if (cmd.categoria === "menu-rpg" && isGrupo) {
      const excecoes = ["rpg", "menurpg", "prefixo"]
      if (!excecoes.includes(cmd.nome) && confGrupo.rpgAtivo !== true) {
        return sock.sendMessage(remetente, { text: "🔥 RPG OFF! Ative com !rpg on" }, { quoted: msg })
      }
    }

    if (cmd.donoOnly && !isDono && !isSubDono) {
      return sock.sendMessage(remetente, { text: "🔥 Esse comando e so do mestre!" }, { quoted: msg })
    }
    if (cmd.adminOnly && !podeAdmin && !isSubDono) {
      return sock.sendMessage(remetente, { text: "🔥 Esse comando e de admin!" }, { quoted: msg })
    }
    if (cmd.grupoOnly && !isGrupo) {
      return sock.sendMessage(remetente, { text: "🔥 So em grupo!" }, { quoted: msg })
    }

    try {
      await cmd.executar({
        sock, msg, args,
        sender, isGrupo, isAdmin, isDono, isSubDono,
        ehSub, podeAdmin,
        groupMetadata, config, prefixoAtivo: prefixoUsado || prefixoGlobal,
        db,
        utils: {
          getAlvo, soNumero, getTexto, downloadMediaMessage, recarregarCanal,
          naListaNegra, aluguelAtivo, grupoTemAluguel, formatarTempo,
          adicionarAviso, limparAvisos, DATA_DIR, botEhAdmin,
          dbLer, dbSalvar, getTextoBotao, ehSubAdmin
        }
      })
    } catch (e) {
      console.log("ERRO em " + cmd.nome + ":")
      console.log(e)
      try {
        await sock.sendMessage(remetente, { text: "🔥 ERRO no comando " + cmd.nome + "\n\n" + e.message }, { quoted: msg })
      } catch (_) {}
    }
  })

  sock.ev.on("group-participants.update", async (ev) => {
    try {
      const { id, participants, action, author } = ev
      const conf = db.grupos()[id] || {}

      function normalizar(p) {
        if (!p) return null
        if (typeof p === "string") return { jidReal: p.endsWith("@lid") ? null : p, melhor: p, num: soNumero(p) }
        if (typeof p === "object") {
          const jidReal = p.phoneNumber || (p.id && !p.id.endsWith("@lid") ? p.id : null)
          const lid = p.id && p.id.endsWith("@lid") ? p.id : null
          const melhor = jidReal || lid || p.id || p.phoneNumber
          return { jidReal, melhor, num: soNumero(melhor) }
        }
        return null
      }

      if (author && conf.x9) {
        for (const p of participants) {
          const info = normalizar(p)
          if (!info) continue
          if (action === "promote") await notificarX9(sock, id, "PROMOTE", author, info.melhor)
          else if (action === "demote") await notificarX9(sock, id, "DEMOTE", author, info.melhor)
          else if (action === "remove") await notificarX9(sock, id, "REMOVE", author, info.melhor)
        }
      }

      if (action === "add") {
        for (const p of participants) {
          const info = normalizar(p)
          if (!info) continue
          if (naListaNegra(id, info.jidReal || info.melhor)) {
            try { await sock.groupParticipantsUpdate(id, [info.melhor], "remove") } catch (_) {}
          }
        }
      }

      if (!conf.bemvindo) return
      const aplicar = (t, num, fb) => (t && t.trim() ? t : fb).replace(/%nmr%/g, "@" + num).replace(/#numero/g, "@" + num)

      if (action === "add") {
        for (const p of participants) {
          const info = normalizar(p)
          if (!info) continue
          if (naListaNegra(id, info.jidReal || info.melhor)) continue
          const txt = aplicar(conf.textobv, info.num, "Bem-vindo(a) @" + info.num + "!")
          try {
            if (conf.fundobv) await sock.sendMessage(id, { image: Buffer.from(conf.fundobv, "base64"), caption: txt, mentions: [info.melhor] })
            else await sock.sendMessage(id, { text: txt, mentions: [info.melhor] })
          } catch (_) {}
        }
      }

      if (action === "remove") {
        for (const p of participants) {
          const info = normalizar(p)
          if (!info) continue
          const txt = aplicar(conf.legendasaiu, info.num, "Ate logo @" + info.num + "!")
          try {
            if (conf.fundosaiu) await sock.sendMessage(id, { image: Buffer.from(conf.fundosaiu, "base64"), caption: txt, mentions: [info.melhor] })
            else await sock.sendMessage(id, { text: txt, mentions: [info.melhor] })
          } catch (_) {}
        }
      }
    } catch (e) { console.log("Erro participants:", e.message) }
  })
}

// ============================================================
// ⏰ AGENDAMENTOS
// ============================================================
function checarAgendamentos() {
  setInterval(async () => {
    if (!sockGlobal) return

    try {
      const v = db.vips()
      let vipAlterou = false
      const agoraMs = Date.now()
      for (const [jidVip, info] of Object.entries(v.vips || {})) {
        if (info.expira !== "inf" && info.expira <= agoraMs) { delete v.vips[jidVip]; vipAlterou = true }
      }
      if (vipAlterou) db.salvarVips(v)
    } catch (e) { console.log("Erro VIP cleanup:", e.message) }

    if (global.rendasAutomaticas && global.rendasAutomaticas.length) {
      for (const fn of global.rendasAutomaticas) {
        try { await fn(sockGlobal, db) } catch (e) { console.log("Erro renda auto:", e.message) }
      }
    }

    try {
      const cidData = dbLer("cidade.json", { usuarios: {}, casas: {}, predios: {} })
      const rpg = db.rpg()
      rpg.usuarios = rpg.usuarios || {}

      const INTERVALO = 60 * 60 * 1000
      if (!global._ultimaRendaCidade) global._ultimaRendaCidade = 0
      const agora2 = Date.now()

      if (agora2 - global._ultimaRendaCidade >= INTERVALO) {
        global._ultimaRendaCidade = agora2
        let alterouCidade = false

        for (const [num, user] of Object.entries(cidData.usuarios || {})) {
          let rendaTotal = 0
          if (user.casa && cidData.casas && cidData.casas[user.casa]) {
            const casa = cidData.casas[user.casa]
            const sujeira = user.sujeiraCasa || 0
            rendaTotal += casa.renda - Math.floor(casa.renda * (sujeira / 100))
            cidData.usuarios[num].sujeiraCasa = Math.min(100, (user.sujeiraCasa || 0) + 10)
            alterouCidade = true
          }
          if (user.predio && cidData.predios && cidData.predios[user.predio]) {
            const predio = cidData.predios[user.predio]
            const sujeira = user.sujeiraPredio || 0
            rendaTotal += predio.renda - Math.floor(predio.renda * (sujeira / 100))
            cidData.usuarios[num].sujeiraPredio = Math.min(100, (user.sujeiraPredio || 0) + 10)
            alterouCidade = true
          }
          if (rendaTotal > 0) {
            rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
            rpg.usuarios[num].moedas = (rpg.usuarios[num].moedas || 0) + rendaTotal
          }
        }

        if (alterouCidade) dbSalvar("cidade.json", cidData)
        db.salvarRpg(rpg)
      }
    } catch (e) { console.log("Erro renda cidade:", e.message) }

    try {
      const agora = new Date()
      const horaAtual = String(agora.getHours()).padStart(2, "0") + ":" + String(agora.getMinutes()).padStart(2, "0")
      const dataHoje = agora.toISOString().slice(0, 10)
      const grupos = db.grupos()
      let alterou = false
      for (const [jid, conf] of Object.entries(grupos)) {
        if (!jid.endsWith("@g.us")) continue
        if (conf.abrirHora === horaAtual && conf.ultimoAbrir !== dataHoje) {
          try {
            await sockGlobal.groupSettingUpdate(jid, "not_announcement")
            const legenda = (conf.legendaAbrir && conf.legendaAbrir.trim()) || "Territorio aberto!"
            if (conf.fotoAbrir) await sockGlobal.sendMessage(jid, { image: Buffer.from(conf.fotoAbrir, "base64"), caption: legenda })
            else await sockGlobal.sendMessage(jid, { text: legenda })
            conf.ultimoAbrir = dataHoje; alterou = true
          } catch (e) {}
        }
        if (conf.fecharHora === horaAtual && conf.ultimoFechar !== dataHoje) {
          try {
            await sockGlobal.groupSettingUpdate(jid, "announcement")
            const legenda = (conf.legendaFechar && conf.legendaFechar.trim()) || "Territorio fechado!"
            if (conf.fotoFechar) await sockGlobal.sendMessage(jid, { image: Buffer.from(conf.fotoFechar, "base64"), caption: legenda })
            else await sockGlobal.sendMessage(jid, { text: legenda })
            conf.ultimoFechar = dataHoje; alterou = true
          } catch (e) {}
        }
      }
      if (alterou) db.salvarGrupos(grupos)
    } catch (e) { console.log("Erro agendamento:", e.message) }
  }, 30000)
}

// ============================================================
// 💻 CONSOLE
// ============================================================
function iniciarConsole() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: "akaza> " })
  rl.prompt()
  rl.on("line", async (linha) => {
    const texto = linha.trim()
    const [cmd, ...args] = texto.split(/\s+/)
    const c = (cmd || "").toLowerCase()
    if (!c) { rl.prompt(); return }
    if (c === "saida" || c === "exit") process.exit(0)
    if (c === "canal") {
      const sub = (args[0] || "").toLowerCase()
      if (sub === "ver") {
        const c1 = db.canal()
        console.log(c1 && c1.jid ? "\n" + c1.nome + " | " + c1.link + "\n" : "\nNenhum canal.\n")
        rl.prompt(); return
      }
      if (sub === "0" || sub === "off") {
        db.salvarCanal({ jid: null, nome: null, link: null })
        recarregarCanal()
        console.log("\nDesativado!\n"); rl.prompt(); return
      }
      if (sub.startsWith("http")) { await salvarCanalPeloLink(sub); rl.prompt(); return }
      rl.question("Link (ou 0): ", async (l) => {
        l = (l || "").trim()
        if (l === "0" || !l) { rl.prompt(); return }
        await salvarCanalPeloLink(l); rl.prompt()
      })
      return
    }
    if (c === "reload") {
      carregarMenus()
      console.log("Menus recarregados!\n")
      rl.prompt(); return
    }
    rl.prompt()
  })
}

async function salvarCanalPeloLink(link) {
  const codigo = String(link).replace(/.*whatsapp\.com\/channel\//, "").replace(/.*wa\.me\/channel\//, "").split(/[\/?\s]/)[0]
  if (!codigo || !sockGlobal) return
  try {
    const meta = await sockGlobal.newsletterMetadata("invite", codigo)
    const jidReal = meta && (meta.jid || meta.id)
    if (!jidReal) throw new Error("Canal nao encontrado")
    db.salvarCanal({ jid: jidReal, nome: meta.name || "Canal", link: "https://whatsapp.com/channel/" + codigo })
    recarregarCanal()
    console.log("\nCanal salvo!\n")
  } catch (e) { console.log(e.message + "\n") }
}

// ============================================================
// 🚀 START
// ============================================================
carregarMenus()
iniciar()
iniciarConsole()
checarAgendamentos()