/* ============================================================
   🔥 AKAZA/RIMURU BOT MD - INDEX COMPLETO (FIX ADMIN)
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
    DATA_DIR, MENUS_DIR, path.join(MENUS_DIR, "menu-adm"), path.join(MENUS_DIR, "menu-dono"),
    path.join(MENUS_DIR, "menu-vip"), path.join(MENUS_DIR, "menu-rpg"), path.join(MENUS_DIR, "menu-fazenda"),
    path.join(MENUS_DIR, "menu-fnaf"), path.join(MENUS_DIR, "menu-cidade")
  ]
  for (const pasta of pastas) {
    if (!fs.existsSync(pasta)) {
      try { fs.mkdirSync(pasta, { recursive: true }); console.log("📁 Pasta criada: " + pasta) } catch (e) { console.log("❌ " + e.message) }
    }
  }
  const arquivoCidadeJson = path.join(DATA_DIR, "cidade.json")
  if (!fs.existsSync(arquivoCidadeJson)) { try { fs.writeFileSync(arquivoCidadeJson, JSON.stringify({ usuarios: {}, casas: {}, predios: {} }, null, 2)) } catch (e) {} }
  const commitPath = path.join(DATA_DIR, "ultimo_commit.json")
  if (!fs.existsSync(commitPath)) { try { fs.writeFileSync(commitPath, JSON.stringify({ versao: 3, hash: "reset" }, null, 2)) } catch (e) {} }
}
bootstrap()

// ============================================================
// 💾 DB
// ============================================================
function dbLer(arquivo, padrao = {}) {
  const p = path.join(DATA_DIR, arquivo)
  if (!fs.existsSync(p)) { fs.writeFileSync(p, JSON.stringify(padrao, null, 2)); return padrao }
  try { return JSON.parse(fs.readFileSync(p, "utf8")) } catch { return padrao }
}
function dbSalvar(arquivo, dados) { fs.writeFileSync(path.join(DATA_DIR, arquivo), JSON.stringify(dados, null, 2)) }

const db = {
  grupos: () => dbLer("grupos.json", {}), salvarGrupos: (d) => dbSalvar("grupos.json", d),
  advs: () => dbLer("advs.json", {}), salvarAdvs: (d) => dbSalvar("advs.json", d),
  config: () => dbLer("config.json", { fotoMenu: null, prefixoGlobal: null, slow: false, subdonos: [], nomeBot: "Rimuru" }),
  salvarConfig: (d) => dbSalvar("config.json", d),
  canal: () => dbLer("canal.json", { jid: null, nome: null, link: null }), salvarCanal: (d) => dbSalvar("canal.json", d),
  listanegra: () => dbLer("listanegra.json", {}), salvarListanegra: (d) => dbSalvar("listanegra.json", d),
  aluguel: () => dbLer("aluguel.json", { ativo: false, grupos: {} }), salvarAluguel: (d) => dbSalvar("aluguel.json", d),
  parcerias: () => dbLer("parcerias.json", {}), salvarParcerias: (d) => dbSalvar("parcerias.json", d),
  avisos: () => dbLer("avisos.json", {}), salvarAvisos: (d) => dbSalvar("avisos.json", d),
  afk: () => dbLer("afk.json", {}), salvarAfk: (d) => dbSalvar("afk.json", d),
  mutados: () => dbLer("mutados.json", {}), salvarMutados: (d) => dbSalvar("mutados.json", d),
  palavroes: () => dbLer("palavroes.json", {}), salvarPalavroes: (d) => dbSalvar("palavroes.json", d),
  subadmins: () => dbLer("subadmins.json", {}), salvarSubadmins: (d) => dbSalvar("subadmins.json", d),
  vips: () => dbLer("vips.json", { vips: {} }), salvarVips: (d) => dbSalvar("vips.json", d),
  bangp: () => dbLer("bangp.json", { grupos: {} }), salvarBangp: (d) => dbSalvar("bangp.json", d),
  rpg: () => dbLer("rpg.json", { usuarios: {} }), salvarRpg: (d) => dbSalvar("rpg.json", d),
  autocfg: () => dbLer("autocfg.json", { grupos: {} }), salvarAutocfg: (d) => dbSalvar("autocfg.json", d)
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
  } catch (_) {}
  return ""
}
function naListaNegra(jidGrupo, jidOuNum) { const num = soNumero(jidOuNum); if (!num) return false; return (db.listanegra()[jidGrupo] || []).includes(num) }
function aluguelAtivo() { return db.aluguel().ativo === true }
function grupoTemAluguel(jid) { const a = db.aluguel(); const exp = a.grupos && a.grupos[jid]; return exp && Date.now() < exp }
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
  if (avisos[grupoJid] && avisos[grupoJid][num] && avisos[grupoJid][num][tipo]) { avisos[grupoJid][num][tipo] = 0; db.salvarAvisos(avisos) }
}
function ehSubAdmin(jidGrupo, jidUser) { const subs = db.subadmins()[jidGrupo] || []; const num = soNumero(jidUser); return subs.some(s => soNumero(s) === num) }
function botEhAdmin(meta, sock) {
  if (!meta) return false
  const botIds = [sock.user && sock.user.id, sock.user && sock.user.lid, sock.user && sock.user.jid].filter(Boolean).map(soNumero)
  const botPart = meta.participants.find(p => {
    const ids = [p.id, p.lid, p.phoneNumber].filter(Boolean).map(soNumero)
    return ids.some(id => botIds.includes(id))
  })
  return botPart && (botPart.admin === "admin" || botPart.admin === "superadmin")
}
function dataBrasil() { return new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).split("/").reverse().join("-") }

// ============================================================
// 📦 CARREGADOR DE MENUS
// ============================================================
const comandos = new Map()
const aliases = new Map()
global.rendasAutomaticas = global.rendasAutomaticas || []

function carregarMenus() {
  comandos.clear(); aliases.clear(); global.rendasAutomaticas = []
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
        if (typeof mod.rendaAutomatica === "function") global.rendasAutomaticas.push(mod.rendaAutomatica)
        const menuCfg = { grupoOnly: mod.grupoOnly || false, adminOnly: mod.adminOnly || false, donoOnly: mod.donoOnly || false }
        for (const [nome, cmd] of Object.entries(mod.commands)) {
          const pacote = {
            nome, aliases: cmd.aliases || [], categoria: mod.menu || pasta,
            grupoOnly: cmd.grupoOnly !== undefined ? cmd.grupoOnly : menuCfg.grupoOnly,
            adminOnly: cmd.adminOnly !== undefined ? cmd.adminOnly : menuCfg.adminOnly,
            donoOnly: cmd.donoOnly !== undefined ? cmd.donoOnly : menuCfg.donoOnly,
            executar: cmd.executar
          }
          comandos.set(nome, pacote)
          for (const a of pacote.aliases) aliases.set(a, nome)
        }
      } catch (e) { console.log("Erro ao carregar " + pasta + "/" + arq + ":", e.message) }
    }
  }
  const categorias = {}
  for (const [nome, cmd] of comandos.entries()) { const cat = cmd.categoria || "outros"; categorias[cat] = (categorias[cat] || 0) + 1 }
  global.totalComandos = comandos.size; global.totalAliases = aliases.size; global.comandosPorCategoria = categorias
  console.log("\n🔥 Bot carregou " + comandos.size + " comandos...\n")
}
global.__carregarMenus = carregarMenus
function getComando(n) { if (comandos.has(n)) return comandos.get(n); if (aliases.has(n)) return comandos.get(aliases.get(n)); return null }

let canalCache = null
function recarregarCanal() { canalCache = db.canal() }
function envolverSendMessage(sock) {
  const original = sock.sendMessage.bind(sock)
  sock.sendMessage = async (jid, content, options = {}) => {
    try {
      const temBotoes = content && (content.buttons || content.sections || content.templateButtons || content.buttonText || content.interactiveButtons || content.listMessage)
      if (temBotoes || options.edit || options.ignorarCanal) return original(jid, content, options)
      if (!canalCache) recarregarCanal()
      const c = canalCache
      if (c && c.jid && c.jid !== "0@newsletter") {
        content.contextInfo = content.contextInfo || {}
        content.contextInfo.forwardedNewsletterMessageInfo = { newsletterJid: c.jid, newsletterName: c.nome || "Canal", serverMessageId: 0 }
        content.contextInfo.forwardingScore = 1; content.contextInfo.isForwarded = true
      }
    } catch (_) {}
    return original(jid, content, options)
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
    version, logger: P({ level: "silent" }), auth: state, printQRInTerminal: false,
    browser: ["Ubuntu", "Chrome", "20.0.04"], connectTimeoutMs: 60000, defaultQueryTimeoutMs: 0,
    keepAliveIntervalMs: 30000, syncFullHistory: false
  })

  sockGlobal = sock; recarregarCanal(); envolverSendMessage(sock); sock.ev.on("creds.update", saveCreds)

  if (!state.creds.registered) {
    setTimeout(async () => {
      try {
        console.log("\n═══════════════════════════════\n   🔥 BOT - MD\n═══════════════════════════════\n")
        console.log("Digite o NUMERO do bot (com DDI, so digitos):\nExemplo: 5511999999999\n")
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
        rl.question("Numero: ", async (numeroDigitado) => {
          rl.close()
          const numero = String(numeroDigitado).replace(/\D/g, "")
          if (!numero || numero.length < 10) { console.log("\nNumero invalido! Reinicie o bot."); process.exit(1) }
          NUMERO_PAREAMENTO = numero
          try {
            const code = await sock.requestPairingCode(numero)
            console.log("\n╔═══════════════════════════════╗\n║   CODIGO DE PAREAMENTO        ║\n╠═══════════════════════════════╣")
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
      const motivo = (lastDisconnect?.error instanceof Boom) ? lastDisconnect.error.output.statusCode : null
      if (motivo === DisconnectReason.loggedOut) process.exit(1)
      else setTimeout(() => iniciar(), 3000)
    } else if (connection === "open") { console.log("\n🔥 CONECTADO! Bot online\n") }
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
    const senderCandidatos = [sender, senderRaw, msg.key && msg.key.participant, msg.key && msg.key.participantPn, msg.key && msg.key.participantLid, msg.key && msg.key.remoteJid, msg.participant, sock.user && sock.user.id, sock.user && sock.user.lid].filter(Boolean)
    const senderNums = senderCandidatos.map(soNumero).filter(Boolean)
    const isDono = msg.key.fromMe === true || senderNums.some(n => numerosDono.includes(n))

    const cfgSub = db.config()
    const numerosSub = (cfgSub.subdonos || []).map(soNumero)
    const isSubDono = senderNums.some(n => numerosSub.includes(n)) && !isDono

    if (isGrupo && !isDono && !isSubDono) {
      const b = db.bangp()
      if (b.grupos && b.grupos[remetente]) return
    }

    const grupos = db.grupos()
    const confGrupo = grupos[remetente] || {}
    const cfgGlobal = db.config()

    const prefixoGlobal = cfgGlobal.prefixoGlobal || config.prefixo || "+"
    let prefixosAtivos = (isGrupo && confGrupo.multiprefixo && confGrupo.prefixo) ? [confGrupo.prefixo] : [prefixoGlobal]

    let texto = getTexto(msg)
    const btnId = getTextoBotao(msg)
    if (btnId) texto = btnId.replace(new RegExp("^\\" + prefixoGlobal + "+"), prefixoGlobal)

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
      if (primeira === "prefixo") { cmdName = "prefixo"; args = partes.slice(1); prefixoUsado = "" } 
      else return
    }

    if (cmdName.toLowerCase() === "prefixo") {
      const p = prefixoGlobal
      const numUser = soNumero(sender)
      const nomeBot = db.config().nomeBot || "Rimuru Bot"
      const cfgCmd = db.config()
      const mencoes = sender ? [sender] : []
      const textoBase = `💜 • 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐂̧𝐀̃𝐎 •\n\n╭─〔 🦄 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 〕\n│ Olá @${numUser}, este é o meu prefixo.\n╰──────────────\n\n🫟 𝐏𝐫𝐞𝐟𝐢𝐱𝐨 𝐀𝐭𝐮𝐚𝐥:\n╰➜ 『 ${p} 』\n\n💡 Para usar meus comandos, digite:\n╰➜ ${p}menu\n\n💜 _"Use com sabedoria."_\n\n"${nomeBot}"`
      const opcoesEnvio = { caption: textoBase, mentions: mencoes, footer: "⚔️ " + nomeBot, buttons: [{ buttonId: p + "menu", buttonText: { displayText: "❄️ Menu-principal" }, type: 1 }], headerType: 1, ignorarCanal: true }
      try {
        if (cfgCmd.fotoCmd) {
          const buf = Buffer.from(cfgCmd.fotoCmd, "base64")
          if (cfgCmd.tipoFotoCmd === "video") await sock.sendMessage(remetente, { video: buf, mimetype: "video/mp4", fileName: "rimuru.mp4", gifPlayback: true, ...opcoesEnvio }, { quoted: msg })
          else await sock.sendMessage(remetente, { image: buf, ...opcoesEnvio }, { quoted: msg })
        } else { await sock.sendMessage(remetente, { text: textoBase, mentions: mencoes, buttons: opcoesEnvio.buttons, ignorarCanal: true }, { quoted: msg }) }
      } catch (e) { await sock.sendMessage(remetente, { text: textoBase, mentions: mencoes, ignorarCanal: true }, { quoted: msg }) }
      return
    }

    const cmd = getComando(cmdName.toLowerCase())
    
    if (!cmd) {
      const p = prefixoUsado || prefixoGlobal
      const cmdLimpo = (cmdName || "").trim().toLowerCase()
      const VARIACOES_CMD_ERRADO = [
        { topo: "💧 • 𝐂𝐎𝐌𝐀𝐍𝐃𝐎 𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎 •", aviso: "O comando informado não foi reconhecido.", frase: "💡 Verifique a escrita e tente novamente!" },
        { topo: "💧 • 𝐂𝐎𝐌𝐀𝐍𝐃𝐎 𝐈𝐍𝐕𝐀́𝐋𝐈𝐃𝐎 •", aviso: "Isso não existe no meu repertório.", frase: "💡 Confira antes de tentar novamente." }
      ]
      const v = VARIACOES_CMD_ERRADO[Math.floor(Math.random() * VARIACOES_CMD_ERRADO.length)]
      const numUser = soNumero(sender)
      const hora = new Date().toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" })
      const data = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
      const nomeBot = db.config().nomeBot || "Rimuru Bot"
      const cmdExibido = cmdLimpo ? (p + cmdLimpo) : p

      const textoBase = `${v.topo}\n\n╭─〔 🔷 𝐀𝐕𝐈𝐒𝐎 〕\n│ ${v.aviso}\n╰──────────────\n\n『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴\n\n👤 𝐔𝐬𝐮𝐚́𝐫𝐢𝐨:\n╰➜ @${numUser}\n\n🫟 𝐏𝐫𝐞𝐟𝐢𝐱𝐨:\n╰➜ ${p}\n\n❔ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨 𝐮𝐬𝐚𝐝𝐨:\n╰➜ ${cmdExibido}\n\n🕐 𝐇𝐨𝐫𝐚́𝐫𝐢𝐨:\n╰➜ ${hora} — ${data}\n\n${v.frase}\n\n"${nomeBot}"`
      
      const cfgCmd = db.config()
      const mencoes = sender ? [sender] : []
      const opcoesErro = { caption: textoBase, mentions: mencoes, footer: "⚔️ " + nomeBot, buttons: [{ buttonId: p + "menu", buttonText: { displayText: "❄️ Menu-principal" }, type: 1 }], headerType: 1, ignorarCanal: true }
      
      try {
        if (cfgCmd.fotoCmd) {
          const buf = Buffer.from(cfgCmd.fotoCmd, "base64")
          if (cfgCmd.tipoFotoCmd === "video") await sock.sendMessage(remetente, { video: buf, mimetype: "video/mp4", fileName: "rimuru.mp4", gifPlayback: true, ...opcoesErro }, { quoted: msg })
          else await sock.sendMessage(remetente, { image: buf, ...opcoesErro }, { quoted: msg })
        } else { await sock.sendMessage(remetente, { text: textoBase, mentions: mencoes, ignorarCanal: true }, { quoted: msg }) }
      } catch (e) { await sock.sendMessage(remetente, { text: textoBase, mentions: mencoes, ignorarCanal: true }, { quoted: msg }) }
      return
    }

    try {
      const cidData = dbLer("cidade.json", { usuarios: {} })
      const numSender = soNumero(sender)
      const userCidade = cidData.usuarios && cidData.usuarios[numSender]
      if (userCidade && userCidade.preso && userCidade.preso > Date.now()) {
        const tempoRestante = formatarTempo(userCidade.preso - Date.now())
        if (cmdName.toLowerCase() !== "prefixo") {
          await sock.sendMessage(remetente, { text: "🔥🚔 VOCÊ ESTÁ PRESO!\n\n⏰ Tempo: " + tempoRestante }, { quoted: msg }); return
        }
      }
      if (userCidade && userCidade.preso && userCidade.preso <= Date.now()) { cidData.usuarios[numSender].preso = null; dbSalvar("cidade.json", cidData) }
    } catch (_) {}

    let groupMetadata = null
    let isAdmin = false
    if (isGrupo) {
      try {
        groupMetadata = await sock.groupMetadata(remetente)
        // ✅ CORREÇÃO ADMIN: Puxa todos os IDs para garantir que vai achar
        const senderNums2 = [sender, senderRaw, msg.key?.participant, msg.key?.participantPn, msg.key?.participantLid, sock.user?.id, sock.user?.lid].filter(Boolean).map(soNumero)
        const p = groupMetadata.participants.find(x => {
          const pIds = [x.id, x.lid, x.phoneNumber].filter(Boolean).map(soNumero)
          return pIds.some(id => senderNums2.includes(id))
        })
        isAdmin = p && (p.admin === "admin" || p.admin === "superadmin")
      } catch (e) { console.log("Erro metadata:", e.message) }
    }

    const ehSub = isGrupo && ehSubAdmin(remetente, sender)
    const permitidoSub = ["mute", "desmute", "ban", "kick", "link", "linkgp", "fechar", "closenow", "abrir", "opennow"]
    const ehComandoSub = permitidoSub.includes(cmd.nome) || (cmd.aliases || []).some(a => permitidoSub.includes(a))
    const podeAdmin = isAdmin || isDono || isSubDono || (ehSub && ehComandoSub)

    if (cfgGlobal.slow && !isDono && !isSubDono) { await new Promise(r => setTimeout(r, 2500)) }

    if (cmd.categoria === "menu-rpg" && isGrupo) {
      const excecoes = ["rpg", "menurpg", "prefixo"]
      if (!excecoes.includes(cmd.nome) && confGrupo.rpgAtivo !== true) { return sock.sendMessage(remetente, { text: `💧 RPG OFF! Ative com ${prefixoGlobal}rpg on` }, { quoted: msg }) }
    }

    if (cmd.donoOnly && !isDono && !isSubDono) { return sock.sendMessage(remetente, { text: "💧 Esse comando e so do mestre!" }, { quoted: msg }) }
    if (cmd.adminOnly && !podeAdmin) { return sock.sendMessage(remetente, { text: "💧 Esse comando e de admin!" }, { quoted: msg }) }
    if (cmd.grupoOnly && !isGrupo) { return sock.sendMessage(remetente, { text: "💧 So em grupo!" }, { quoted: msg }) }

    try {
      await cmd.executar({
        sock, msg, args, sender, isGrupo, isAdmin, isDono, isSubDono, ehSub, podeAdmin, groupMetadata, config,
        prefixoAtivo: prefixoUsado || prefixoGlobal,
        db,
        utils: { getAlvo, soNumero, getTexto, downloadMediaMessage, recarregarCanal, naListaNegra, aluguelAtivo, grupoTemAluguel, formatarTempo, adicionarAviso, limparAvisos, DATA_DIR, botEhAdmin, dbLer, dbSalvar, getTextoBotao, ehSubAdmin }
      })
    } catch (e) {
      console.log("ERRO em " + cmd.nome + ":", e)
      try { await sock.sendMessage(remetente, { text: "💧 ERRO no comando " + cmd.nome + "\n\n" + e.message }, { quoted: msg }) } catch (_) {}
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
      if (action === "add") {
        for (const p of participants) {
          const info = normalizar(p); if (!info) continue
          if (naListaNegra(id, info.jidReal || info.melhor)) { try { await sock.groupParticipantsUpdate(id, [info.melhor], "remove") } catch (_) {} }
        }
      }
      if (!conf.bemvindo) return
      const aplicar = (t, num, fb) => (t && t.trim() ? t : fb).replace(/%nmr%/g, "@" + num).replace(/#numero/g, "@" + num)
      if (action === "add") {
        for (const p of participants) {
          const info = normalizar(p); if (!info) continue
          if (naListaNegra(id, info.jidReal || info.melhor)) continue
          const txt = aplicar(conf.textobv, info.num, "Bem-vindo(a) @" + info.num + "!")
          try { if (conf.fundobv) await sock.sendMessage(id, { image: Buffer.from(conf.fundobv, "base64"), caption: txt, mentions: [info.melhor] }); else await sock.sendMessage(id, { text: txt, mentions: [info.melhor] }) } catch (_) {}
        }
      }
      if (action === "remove") {
        for (const p of participants) {
          const info = normalizar(p); if (!info) continue
          const txt = aplicar(conf.legendasaiu, info.num, "Ate logo @" + info.num + "!")
          try { if (conf.fundosaiu) await sock.sendMessage(id, { image: Buffer.from(conf.fundosaiu, "base64"), caption: txt, mentions: [info.melhor] }); else await sock.sendMessage(id, { text: txt, mentions: [info.melhor] }) } catch (_) {}
        }
      }
    } catch (e) { console.log("Erro participants:", e.message) }
  })
}

// ============================================================
// 💻 CONSOLE E AGENDAMENTOS
// ============================================================
function checarAgendamentos() {
  setInterval(async () => {
    if (!sockGlobal) return
    try {
      const v = db.vips(); let vipAlterou = false; const agoraMs = Date.now()
      for (const [jidVip, info] of Object.entries(v.vips || {})) { if (info.expira !== "inf" && info.expira <= agoraMs) { delete v.vips[jidVip]; vipAlterou = true } }
      if (vipAlterou) db.salvarVips(v)
    } catch (e) {}
    if (global.rendasAutomaticas && global.rendasAutomaticas.length) {
      for (const fn of global.rendasAutomaticas) { try { await fn(sockGlobal, db) } catch (e) {} }
    }
  }, 30000)
}

carregarMenus()
iniciar()
checarAgendamentos()