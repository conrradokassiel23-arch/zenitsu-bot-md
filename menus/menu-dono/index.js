/* ============================================================
   🌸 MENU DONO - TEMA FLORAL
   ============================================================ */

const fs = require("fs")
const path = require("path")
const os = require("os")
const { execSync } = require("child_process")
const { generateWAMessageFromContent } = require('@whiskeysockets/baileys')

const DATA_DIR = path.join(__dirname, "..", "..", "data")
const BOT_DIR = path.join(__dirname, "..", "..")
const REPO_URL = "https://github.com/conrradokassiel23-arch/zenitsu-bot-md"
const REPO_API = "https://api.github.com/repos/conrradokassiel23-arch/zenitsu-bot-md/commits/main"

function dbLer(a, p = {}) {
  const f = path.join(DATA_DIR, a)
  if (!fs.existsSync(f)) { fs.writeFileSync(f, JSON.stringify(p, null, 2)); return p }
  try { return JSON.parse(fs.readFileSync(f, "utf8")) } catch { return p }
}
function dbSalvar(a, d) { fs.writeFileSync(path.join(DATA_DIR, a), JSON.stringify(d, null, 2)) }

async function reagir(sock, msg, emoji) {
  try { await sock.sendMessage(msg.key.remoteJid, { react: { text: emoji, key: msg.key } }) } catch (_) {}
}

function formatarDataHora(iso) { try { return new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) } catch (e) { return "?" } }
function nomeBotDb(db) { try { return db.config?.()?.nomeBot || "Rimuru" } catch { return "Rimuru" } }
function getCfg(db) { try { return db.config?.() || {} } catch { return {} } }
function soNumero(jid) { if (!jid) return ""; if (typeof jid === "object") jid = jid.phoneNumber || jid.id || ""; return String(jid).split("@")[0].split(":")[0].replace(/\D/g, "") }

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
  return `${boxTop("𝐃 𝐎 𝐍 𝐎")}

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
  if (isAdmin) return "⚔️ 𝐂𝐎𝐌𝐀𝐍𝐃𝐀𝐍𝐓𝐄"
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

const confirmacoesPendentes = new Map()
global.dvRodando = false
global.dvTimeout = null
global.dvStats = { ciclos: 0, enviados: 0, falhas: 0 }
global.dvProximoCiclo = null

function formatarTempo(ms) {
  const s = Math.floor(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60), d = Math.floor(h / 24)
  if (d > 0) return d + "d " + (h % 24) + "h"
  if (h > 0) return h + "h " + (m % 60) + "min"
  if (m > 0) return m + "min " + (s % 60) + "s"
  return s + "s"
}

function parseTempo(str) {
  const match = str.match(/^(\d+)(m|h|d|s)$/i)
  if (!match) return 0
  const v = parseInt(match[1])
  const u = match[2].toLowerCase()
  if (u === "s") return v * 1000
  if (u === "m") return v * 60 * 1000
  if (u === "h") return v * 60 * 60 * 1000
  if (u === "d") return v * 24 * 60 * 60 * 1000
  return 0
}

module.exports = {
  menu: "menu-dono",
  grupoOnly: false,
  adminOnly: false,
  donoOnly: true,

  commands: {    menudono: {
      aliases: ["dono", "comandosdono", "menud", "imperador", "grandesabio"],
      async executar({ sock, msg, prefixoAtivo, db, sender, config, isDono, isSubDono, isAdmin, groupMetadata }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const cfg = getCfg(db)
        const { pushName, nomeDono, cargo, nomeBot } = getCargoETexto({ sender, config, db, groupMetadata, isDono, isSubDono, isAdmin, msg })
        const agora = new Date()
        const hora = agora.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" })
        const data = agora.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
        const mentions = sender ? [sender] : []

        await reagir(sock, msg, "🌸")

        const texto = `${cardPerfil({ nomeBot, nomeUsuario: pushName, cargo, dono: nomeDono })}

${secao("𝐆𝐄𝐑𝐀𝐋")}
${item(`${p}entrar <link>`)}
${item(`${p}reload`)}
${item(`${p}reiniciar`)}
${item(`${p}atualizar`)}
${item(`${p}botoff`)}
${item(`${p}boton`)}
${item(`${p}status <txt>`)}
${item(`${p}setfoto`)}
${item(`${p}fotocmd`)}
${item(`${p}fotocmdc`)}
${item(`${p}audiomenu`)}
${item(`${p}nuke`)}
${item(`${p}limpargp`)}
${item(`${p}maxenvio <nº>`)}
${item(`${p}play3 <msg>`)}
${fimSecao()}

${secao("𝐃𝐈𝐕𝐔𝐋𝐆𝐀𝐂̧𝐀̃𝐎")}
${item(`${p}div <tempo>`)}
${item(`${p}listadiv`)}
${item(`${p}apagardiv`)}
${item(`${p}grupos`)}
${item(`${p}addtodos`)}
${item(`${p}addgp`)}
${item(`${p}removergp`)}
${item(`${p}intervalo <tempo>`)}
${item(`${p}iniciardv`)}
${item(`${p}parardv`)}
${item(`${p}estado`)}
${fimSecao()}

${secao("𝐀𝐋𝐔𝐆𝐔𝐄𝐋")}
${item(`${p}aluguel on/off`)}
${item(`${p}addaluguel <tempo>`)}
${item(`${p}listaaluguel`)}
${item(`${p}delaluguel`)}
${fimSecao()}

${secao("𝐒𝐔𝐁-𝐃𝐎𝐍𝐎𝐒")}
${item(`${p}addsubdono @user`)}
${item(`${p}delsubdono @user`)}
${item(`${p}listasubdono`)}
${fimSecao()}

${secao("𝐕𝐈𝐏")}
${item(`${p}addvip @user <tempo>`)}
${item(`${p}delvip @user`)}
${item(`${p}listavip`)}
${fimSecao()}

${secao("𝐁𝐀𝐍𝐈𝐌𝐄𝐍𝐓𝐎")}
${item(`${p}banirgp`)}
${item(`${p}desbanirgp`)}
${item(`${p}listabangp`)}
${fimSecao()}

${secao("𝐁𝐋𝐎𝐐𝐔𝐄𝐈𝐎")}
${item(`${p}blockcmd <nome>`)}
${item(`${p}desblockcmd <nome>`)}
${item(`${p}listblockcmd`)}
${fimSecao()}

${secao("𝐀𝐉𝐔𝐒𝐓𝐄𝐒")}
${item(`${p}prefixoglobal <s>`)}
${item(`${p}slow on/off`)}
${fimSecao()}

╔═══ஓ๑♡๑ஓ═══╗
𓆩 𝐏𝐑𝐄𝐅𝐈𝐗𝐎 𓆪
↳ \`${p}\`
╚═══ஓ๑♡๑ஓ═══╝

╔═══ஓ๑♡๑ஓ═══╗
𓆩 𝐇𝐎𝐑𝐀́𝐑𝐈𝐎 𓆪
↳ ${hora} — ${data}
╚═══ஓ๑♡๑ஓ═══╝

${boxFim(nomeBot, "A serpente observa.")}`

        if (cfg.fotoMenu) {
          let buf = null
          try {
            const limpo = String(cfg.fotoMenu).replace(/^data:[^;]+;base64,/, "")
            buf = Buffer.from(limpo, "base64")
          } catch { buf = null }
          if (buf && buf.length) {
            try {
              if (cfg.tipoMenu === "video") return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "menu.mp4", gifPlayback: true, caption: texto, mentions }, { quoted: msg })
              return sock.sendMessage(jid, { image: buf, caption: texto, mentions }, { quoted: msg })
            } catch (e) { return sock.sendMessage(jid, { text: texto, mentions }, { quoted: msg }) }
          }
        }
        await sock.sendMessage(jid, { text: texto, mentions }, { quoted: msg })
      }
    },

    botoff: {
      aliases: ["desligar", "offbot"],
      async executar({ sock, msg, db, isDono, isSubDono }) {
        if (!isDono && !isSubDono) { await reagir(sock, msg, "💨"); return }
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const cfg = db.config()
        cfg.botGlobalOff = true
        db.salvarConfig(cfg)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐁𝐎𝐓𝐎𝐅𝐅", "Bot silenciado GLOBALMENTE.", "Todos os grupos afetados.", "Reagirei apenas com 🏳️‍⚧️", nomeBot) }, { quoted: msg })
      }
    },

    boton: {
      aliases: ["ligar", "onbot"],
      async executar({ sock, msg, db, isDono, isSubDono }) {
        if (!isDono && !isSubDono) { await reagir(sock, msg, "💨"); return }
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const cfg = db.config()
        cfg.botGlobalOff = false
        db.salvarConfig(cfg)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐁𝐎𝐓𝐎𝐍", "Bot reativado GLOBALMENTE.", "Todos os grupos funcionando.", null, nomeBot) }, { quoted: msg })
      }
    },

    status: {
      aliases: ["postarstatus", "stt"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        if (!isDono && !isSubDono) return
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const texto = args.join(" ").trim()
        const ctx = msg.message?.extendedTextMessage?.contextInfo || {}
        const quoted = ctx.quotedMessage
        if (!quoted && !texto) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐒𝐓𝐀𝐓𝐔𝐒", "Envie/responda uma mídia/texto.", "—", "`+status <texto>`", nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        try {
          const { enviarStatus } = require("../status-helper")
          await enviarStatus({ carol: sock, from: jid, msg, text: texto, quoted, caption: texto, linkPreview: true })
          await sock.sendMessage(jid, { text: msgSucesso("𝐒𝐓𝐀𝐓𝐔𝐒", "Postado com sucesso.", "Status enviado", null, nomeBot) }, { quoted: msg })
        } catch (e) {
          await reagir(sock, msg, "💨")
          await sock.sendMessage(jid, { text: msgErro("𝐒𝐓𝐀𝐓𝐔𝐒", "Falha ao postar.", e.message, null, nomeBot) }, { quoted: msg })
        }
      }
    },

    grupos: {
      aliases: ["listagrupos"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const todosGrupos = Object.keys(db.grupos()).filter(g => g.endsWith("@g.us"))
        const todosObj = dbLer("todosgrupos.json", { ativos: [] })
        const ativos = todosObj.ativos || []
        if (!todosGrupos.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐆𝐑𝐔𝐏𝐎𝐒", "Nenhum grupo salvo.", "—", null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        const nomesDb = dbLer("nomes_grupos.json", {})
        let txt = `${boxTop("𝐆𝐑𝐔𝐏𝐎𝐒")}\n\n`
        txt += `╭┈┈┈┈୨୧┈┈┈┈╮\n𓆩 𝐓𝐎𝐓𝐀𝐈𝐒 𓆪\n↳ ${todosGrupos.length}\n╰┈┈┈┈୨୧┈┈┈┈╯\n\n`
        txt += `╭┈┈┈┈୨୧┈┈┈┈╮\n𓆩 𝐀𝐓𝐈𝐕𝐎𝐒 𓆪\n↳ ${todosGrupos.filter(g => ativos.includes(g)).length}\n╰┈┈┈┈୨୧┈┈┈┈╯\n\n`
        let mudouCache = false
        for (let i = 0; i < todosGrupos.length; i++) {
          const grupoJid = todosGrupos[i]
          let nomeG = nomesDb[grupoJid] || null
          if (!nomeG) {
            try {
              const meta = await sock.groupMetadata(grupoJid)
              if (meta && meta.subject) { nomeG = meta.subject; nomesDb[grupoJid] = nomeG; mudouCache = true }
            } catch (_) { nomeG = "⚠️ Sem acesso" }
            await new Promise(r => setTimeout(r, 350))
          }
          const taAtivo = ativos.includes(grupoJid)
          txt += `╭┈┈┈┈୨୧┈┈┈┈╮\n𓆩 #${i + 1} 𓆪\n↳ ${nomeG}\n↳ ${taAtivo ? "🌸 𝐀𝐓𝐈𝐕𝐎" : "❌ 𝐈𝐍𝐀𝐓𝐈𝐕𝐎"}\n╰┈┈┈┈୨୧┈┈┈┈╯\n`
        }
        if (mudouCache) dbSalvar("nomes_grupos.json", nomesDb)
        txt += `\n${boxFim(nomeBot, "Use addgp <nº>.")}`
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    addgp: {
      aliases: ["addgrupo", "ativargp"],
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        if (!args.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐃𝐃𝐆𝐏", "Use o comando.", "—", `\`${p}addgp 1 2\``, nomeBot) }, { quoted: msg }) }
        const todosGrupos = Object.keys(db.grupos()).filter(g => g.endsWith("@g.us"))
        const todosObj = dbLer("todosgrupos.json", { ativos: [] })
        let ativos = todosObj.ativos || []
        const adicionados = []; const erros = []
        for (const arg of args) {
          const num = parseInt(arg)
          if (!num || num < 1 || num > todosGrupos.length) { erros.push(`${arg}`); continue }
          const grupoJid = todosGrupos[num - 1]
          if (!ativos.includes(grupoJid)) { ativos.push(grupoJid); adicionados.push(num) }
        }
        todosObj.ativos = ativos; dbSalvar("todosgrupos.json", todosObj)
        await reagir(sock, msg, "🌸")
        let detalhes = ""
        if (adicionados.length > 0) detalhes += `Add: ${adicionados.join(", ")}`
        if (erros.length > 0) detalhes += `${detalhes ? " • " : ""}Erros: ${erros.join(", ")}`
        if (!detalhes) detalhes = "Nada alterado"
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐃𝐃𝐆𝐏", "Grupos adicionados.", detalhes, `Total: ${ativos.length}`, nomeBot) }, { quoted: msg })
      }
    },

    removergp: {
      aliases: ["removergrupo", "desativargp", "rmgp"],
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        if (!args.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐌𝐆𝐏", "Use o comando.", "—", `\`${p}removergp 1\``, nomeBot) }, { quoted: msg }) }
        const todosGrupos = Object.keys(db.grupos()).filter(g => g.endsWith("@g.us"))
        const todosObj = dbLer("todosgrupos.json", { ativos: [] })
        let ativos = todosObj.ativos || []
        const removidos = []; const erros = []
        for (const arg of args) {
          const num = parseInt(arg)
          if (!num || num < 1 || num > todosGrupos.length) { erros.push(`${arg}`); continue }
          const grupoJid = todosGrupos[num - 1]
          if (ativos.includes(grupoJid)) { ativos = ativos.filter(g => g !== grupoJid); removidos.push(num) }
        }
        todosObj.ativos = ativos; dbSalvar("todosgrupos.json", todosObj)
        await reagir(sock, msg, "🌸")
        let detalhes = ""
        if (removidos.length > 0) detalhes += `Removidos: ${removidos.join(", ")}`
        if (erros.length > 0) detalhes += `${detalhes ? " • " : ""}Erros: ${erros.join(", ")}`
        if (!detalhes) detalhes = "Nada alterado"
        await sock.sendMessage(jid, { text: msgSucesso("𝐑𝐌𝐆𝐏", "Grupos removidos.", detalhes, `Total: ${ativos.length}`, nomeBot) }, { quoted: msg })
      }
    },

    addtodos: {
      aliases: ["ativartodos"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const todosGrupos = Object.keys(db.grupos()).filter(g => g.endsWith("@g.us"))
        const todosObj = dbLer("todosgrupos.json", { ativos: [] })
        todosObj.ativos = todosGrupos; dbSalvar("todosgrupos.json", todosObj)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐃𝐃𝐓𝐎𝐃𝐎𝐒", "Todos ativados.", `Total: ${todosGrupos.length}`, null, nomeBot) }, { quoted: msg })
      }
    },

    deltodos: {
      aliases: ["desativartodos", "removergrupos"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const todosObj = dbLer("todosgrupos.json", { ativos: [] })
        todosObj.ativos = []; dbSalvar("todosgrupos.json", todosObj)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐃𝐄𝐋𝐓𝐎𝐃𝐎𝐒", "Nenhum grupo receberá.", "Lista limpa", null, nomeBot) }, { quoted: msg })
      }
    },

    nuke: {
      aliases: ["explodir", "destruir"],
      async executar({ sock, msg, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)

        if (!isDono && !isSubDono) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐍𝐔𝐊𝐄", "Apenas o Dono Principal pode usar.", "—", null, nomeBot) }, { quoted: msg }) }
        if (!jid.endsWith("@g.us")) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐍𝐔𝐊𝐄", "Só funciona em grupos.", "—", null, nomeBot) }, { quoted: msg }) }

        let meta
        try { meta = await sock.groupMetadata(jid) } catch (e) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐍𝐔𝐊𝐄", "Não consegui obter os dados do grupo.", e.message, null, nomeBot) }, { quoted: msg }) }

        const botJid = sock.user.id
        const donoJid = msg.key.participant || msg.key.remoteJid
        const autorNome = msg.pushName || donoJid.split("@")[0]

        const membrosParaRemover = meta.participants
          .filter(p => p.id !== botJid && p.id !== donoJid)
          .map(p => p.id)

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, {
          text: `${boxTop("𝐈𝐍𝐈𝐂𝐈𝐀𝐍𝐃𝐎 𝐍𝐔𝐊𝐄")}

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐀𝐕𝐈𝐒𝐎 𓆪
↳ Removendo *${membrosParaRemover.length}* membros.
↳ Isso pode demorar.
╰┈┈┈┈୨୧┈┈┈┈╯

${boxFim(nomeBot, "A serpente observa.")}`
        })

        try { await sock.groupUpdateSubject(jid, "🗑 Grupo Excluído") } catch {}
        const dataAgora = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
        try { await sock.groupUpdateDescription(jid, `Este grupo foi excluído por @${autorNome} em ${dataAgora}.`) } catch {}

        const LOTE = 5
        for (let i = 0; i < membrosParaRemover.length; i += LOTE) {
          const lote = membrosParaRemover.slice(i, i + LOTE)
          try { await sock.groupParticipantsUpdate(jid, lote, "remove") } catch (e) { console.log("Erro ao remover lote:", e.message) }
          await new Promise(r => setTimeout(r, 2000))
        }

        await sock.sendMessage(jid, {
          text: `${boxTop("𝐆𝐑𝐔𝐏𝐎 𝐋𝐈𝐌𝐏𝐎")}

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐀𝐕𝐈𝐒𝐎 𓆪
↳ O bot vai sair agora.
╰┈┈┈┈୨୧┈┈┈┈╯

${boxFim(nomeBot, "Até a próxima.")}`
        })
        await new Promise(r => setTimeout(r, 2000))
        try { await sock.groupLeave(jid) } catch (e) { console.log("Erro ao sair:", e.message) }
      }
    },

    div: {
      aliases: ["divulgar", "adddiv"],
      async executar({ sock, msg, args, db, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const tempoStr = args[0]?.toLowerCase()
        if (!tempoStr || !/^\d+(s|m|h|d)$/.test(tempoStr)) {
          await reagir(sock, msg, "💨")
          return sock.sendMessage(jid, { text: msgAviso("𝐃𝐈𝐕", "Informe o tempo.", "—", `\`${p}div 10m\` (reply mídia)`, nomeBot) }, { quoted: msg })
        }
        const ctx = msg.message?.extendedTextMessage?.contextInfo || {}
        const q = ctx.quotedMessage
        const isVideo = q && q.videoMessage
        const isImage = q && q.imageMessage
        const textoLegenda = isVideo ? q.videoMessage.caption : isImage ? q.imageMessage.caption : ""
        if (!isVideo && !isImage) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐃𝐈𝐕", "Responda uma mídia.", "—", null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        try {
          const alvoMsg = Object.assign({}, msg, { message: isVideo ? { videoMessage: q.videoMessage } : { imageMessage: q.imageMessage } })
          const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          if (buffer.length > 20 * 1024 * 1024) {
            await reagir(sock, msg, "💨")
            return sock.sendMessage(jid, { text: msgErro("𝐃𝐈𝐕", "Mídia muito grande.", "Máx 20MB", null, nomeBot) }, { quoted: msg })
          }
          const ms = parseTempo(tempoStr)
          const expiraEm = Date.now() + ms
          const divs = dbLer("divulgacoes.json", { lista: [] })
          divs.lista = divs.lista || []
          const novaDiv = { id: Date.now(), tipo: isVideo ? "video" : "image", buffer: buffer.toString("base64"), legenda: textoLegenda || "", expiraEm: expiraEm, criadoEm: Date.now() }
          divs.lista.push(novaDiv)
          dbSalvar("divulgacoes.json", divs)
          await sock.sendMessage(jid, { text: msgSucesso("𝐃𝐈𝐕 𝐒𝐀𝐋𝐕𝐀", "Divulgação criada.", `Expira em ${formatarTempo(ms)}`, null, nomeBot) }, { quoted: msg })
        } catch (e) {
          await reagir(sock, msg, "💨")
          await sock.sendMessage(jid, { text: msgErro("𝐃𝐈𝐕", "Falha ao salvar.", e.message, null, nomeBot) }, { quoted: msg })
        }
      }
    },

    listadiv: {
      aliases: ["listadivulgacao", "verdivs"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const divs = dbLer("divulgacoes.json", { lista: [] })
        const ativas = (divs.lista || []).filter(d => d.expiraEm > Date.now())
        if (!ativas.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐒𝐓𝐀 𝐃𝐈𝐕", "Nenhuma ativa.", "—", null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        let txt = `${boxTop("𝐃𝐈𝐕𝐔𝐋𝐆𝐀𝐂̧𝐎̃𝐄𝐒")}\n\n`
        ativas.forEach((d, i) => {
          const tempoRestante = formatarTempo(d.expiraEm - Date.now())
          const tipo = d.tipo === "video" ? "🎥 Vídeo" : "🖼️ Imagem"
          txt += `╭┈┈┈┈୨୧┈┈┈┈╮\n𓆩 #${i + 1} 𓆪\n↳ ${tipo}\n↳ ${tempoRestante}\n╰┈┈┈┈୨୧┈┈┈┈╯\n`
        })
        txt += `\n${boxFim(nomeBot)}`
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    apagardiv: {
      aliases: ["deldiv", "rmdiv"],
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const num = parseInt(args[0])
        if (!num || num < 1) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐏𝐀𝐆𝐀𝐑 𝐃𝐈𝐕", "Informe o número.", "—", `\`${p}apagardiv 1\``, nomeBot) }, { quoted: msg }) }
        const divs = dbLer("divulgacoes.json", { lista: [] })
        const ativas = (divs.lista || []).filter(d => d.expiraEm > Date.now())
        if (num > ativas.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐀𝐏𝐀𝐆𝐀𝐑 𝐃𝐈𝐕", "Número inválido.", `Máx: ${ativas.length}`, null, nomeBot) }, { quoted: msg }) }
        const divApagar = ativas[num - 1]
        divs.lista = divs.lista.filter(d => d.id !== divApagar.id)
        dbSalvar("divulgacoes.json", divs)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐏𝐀𝐆𝐀𝐃𝐀", "Divulgação removida.", `#${num}`, null, nomeBot) }, { quoted: msg })
      }
    },

    intervalo: {
      aliases: ["setintervalo", "tempociclo"],
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const tempoStr = args[0]?.toLowerCase()
        if (!tempoStr || !/^\d+(s|m|h|d)$/.test(tempoStr)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐈𝐍𝐓𝐄𝐑𝐕𝐀𝐋𝐎", "Informe o tempo.", "—", `\`${p}intervalo 50m\``, nomeBot) }, { quoted: msg }) }
        const ms = parseTempo(tempoStr)
        const cfg = db.config()
        cfg.intervaloDiv = ms
        db.salvarConfig(cfg)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐈𝐍𝐓𝐄𝐑𝐕𝐀𝐋𝐎", "Alterado.", tempoStr, null, nomeBot) }, { quoted: msg })
      }
    },

    iniciardv: {
      aliases: ["startdiv", "enviardv"],
      async executar({ sock, msg, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const divs = dbLer("divulgacoes.json", { lista: [] })
        const ativas = (divs.lista || []).filter(d => d.expiraEm > Date.now())
        if (!ativas.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐈𝐍𝐈𝐂𝐈𝐀𝐑 𝐃𝐈𝐕", "Nenhuma div ativa.", "—", null, nomeBot) }, { quoted: msg }) }
        const todosObj = dbLer("todosgrupos.json", { ativos: [] })
        let grupos = todosObj.ativos || []
        if (grupos.length === 0) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐈𝐍𝐈𝐂𝐈𝐀𝐑 𝐃𝐈𝐕", "Nenhum grupo ativo.", "—", null, nomeBot) }, { quoted: msg }) }
        if (global.dvRodando) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐈𝐍𝐈𝐂𝐈𝐀𝐑 𝐃𝐈𝐕", "Já está rodando.", "—", null, nomeBot) }, { quoted: msg }) }

        await reagir(sock, msg, "🌸")
        const intervalo = db.config().intervaloDiv || 1800000
        await sock.sendMessage(jid, { text: msgSucesso("𝐈𝐍𝐈𝐂𝐈𝐀𝐍𝐃𝐎", "Loop iniciado.", `Grupos: ${grupos.length} • Divs: ${ativas.length}`, `Intervalo: ${formatarTempo(intervalo)}`, nomeBot) }, { quoted: msg })

        global.dvRodando = true
        const stats = { ciclos: 0, enviados: 0, falhas: 0 }
        global.dvStats = stats
        global.dvProximoCiclo = null

        const rodarCiclo = async () => {
          if (!global.dvRodando) return
          stats.ciclos++
          global.dvProximoCiclo = null
          try {
            const divsAtuais = dbLer("divulgacoes.json", { lista: [] })
            const ativasAgora = (divsAtuais.lista || []).filter(d => d.expiraEm > Date.now())
            if (!ativasAgora.length) { global.dvRodando = false; if (global.dvTimeout) { clearTimeout(global.dvTimeout); global.dvTimeout = null }; return }
            const todosAgora = dbLer("todosgrupos.json", { ativos: [] })
            const gruposAgora = todosAgora.ativos || []
            if (!gruposAgora.length) { global.dvRodando = false; if (global.dvTimeout) { clearTimeout(global.dvTimeout); global.dvTimeout = null }; return }
            for (const grupo of gruposAgora) {
              if (!global.dvRodando) return
              for (const d of ativasAgora) {
                if (!global.dvRodando) return
                if (d.expiraEm <= Date.now()) continue
                const buffer = Buffer.from(d.buffer, "base64")
                const linkCanal = db.canal()?.link || ""
                const legendaFinal = `${d.legenda || ""}\n\n${linkCanal ? `🌸 *Canal:* ${linkCanal}` : ""}`.trim()
                try {
                  if (d.tipo === "video") await sock.sendMessage(grupo, { video: buffer, caption: legendaFinal, gifPlayback: false, mimetype: "video/mp4" })
                  else await sock.sendMessage(grupo, { image: buffer, caption: legendaFinal })
                  stats.enviados++
                } catch (err) { stats.falhas++ }
                await new Promise(r => setTimeout(r, 5000))
              }
              await new Promise(r => setTimeout(r, 10000))
            }
          } catch (errCiclo) {}
          if (!global.dvRodando) return
          const cfgAtual = db.config()
          const novoIntervalo = cfgAtual.intervaloDiv || 1800000
          if (global.dvTimeout) clearTimeout(global.dvTimeout)
          global.dvProximoCiclo = Date.now() + novoIntervalo
          global.dvTimeout = setTimeout(() => {
            global.dvTimeout = null; global.dvProximoCiclo = null
            rodarCiclo().catch(() => {})
          }, novoIntervalo)
        }
        rodarCiclo().catch(() => {
          global.dvRodando = false
          if (global.dvTimeout) { clearTimeout(global.dvTimeout); global.dvTimeout = null }
          global.dvProximoCiclo = null
        })
      }
    },

    parardv: {
      aliases: ["stopdiv"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        global.dvRodando = false
        if (global.dvTimeout) { clearTimeout(global.dvTimeout); global.dvTimeout = null }
        global.dvProximoCiclo = null
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐀𝐑𝐀𝐃𝐎", "Loop encerrado.", "Sem envios automáticos", null, nomeBot) }, { quoted: msg })
      }
    },

    estado: {
      aliases: ["statusdiv", "estadodiv", "infodiv"],
      async executar({ sock, msg, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        await reagir(sock, msg, "🌸")
        const agora = Date.now()
        const divs = dbLer("divulgacoes.json", { lista: [] })
        const todasDivs = divs.lista || []
        const divsAtivas = todasDivs.filter(d => d.expiraEm > agora)
        const todosObj = dbLer("todosgrupos.json", { ativos: [] })
        const gruposAtivos = todosObj.ativos || []
        const cfg = db.config() || {}
        const intervalo = cfg.intervaloDiv || 1800000
        const rodando = global.dvRodando === true
        const temTimer = global.dvTimeout !== null && global.dvTimeout !== undefined
        const emojiStatus = rodando ? "🟢" : "🔴"
        const txtStatus = rodando ? "RODANDO" : "PARADO"

        let blocoDivs = divsAtivas.length === 0 ? `↳ _Nenhuma ativa_\n` : ""
        divsAtivas.forEach((d, i) => { blocoDivs += `↳ ${i + 1}. ${d.tipo} - ${formatarTempo(d.expiraEm - agora)}\n` })
        const blocoGrupos = gruposAtivos.length === 0 ? `↳ _Nenhum grupo_\n` : `↳ Total: ${gruposAtivos.length}\n`
        let blocoProximo = ""
        if (!rodando) blocoProximo = `↳ _Loop parado_\n`
        else if (!temTimer) blocoProximo = `↳ _Em execução..._\n`
        else {
          const proximo = global.dvProximoCiclo || (agora + intervalo)
          const falta = Math.max(0, proximo - agora)
          blocoProximo = `↳ Falta: ${formatarTempo(falta)}\n`
        }

        const texto = `${boxTop("𝐄𝐒𝐓𝐀𝐃𝐎")}

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐒𝐓𝐀𝐓𝐔𝐒 𓆪
↳ ${emojiStatus} ${txtStatus}
↳ Timer: ${temTimer ? "✅" : "❌"}
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐃𝐈𝐕𝐔𝐋𝐆𝐀𝐂̧𝐎̃𝐄𝐒 𓆪
${blocoDivs}╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐆𝐑𝐔𝐏𝐎𝐒 𓆪
${blocoGrupos}╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐏𝐑𝐎́𝐗𝐈𝐌𝐎 𓆪
${blocoProximo}╰┈┈┈┈୨୧┈┈┈┈╯

${boxFim(nomeBot)}`
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },    audiomenu: {
      aliases: ["addaudio", "setaudio"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const ctx = msg.message?.extendedTextMessage?.contextInfo || {}
        const quoted = ctx.quotedMessage
        const temAudio = quoted && (quoted.audioMessage || quoted.ptvMessage)
        if (!temAudio) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐔𝐃𝐈𝐎𝐌𝐄𝐍𝐔", "Responda um áudio.", "—", null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        try {
          const alvoMsg = Object.assign({}, msg, { message: { audioMessage: quoted.audioMessage || quoted.ptvMessage } })
          const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          const cfg = db.config()
          cfg.audioMenu = buffer.toString("base64")
          db.salvarConfig(cfg)
          await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐔𝐃𝐈𝐎𝐌𝐄𝐍𝐔", "Áudio salvo.", "Será enviado nos menus", null, nomeBot) }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐀𝐔𝐃𝐈𝐎𝐌𝐄𝐍𝐔", "Falha ao salvar.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    rmaudio: {
      aliases: ["delaudio", "removeraudio"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const cfg = db.config()
        if (!cfg.audioMenu) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐌𝐀𝐔𝐃𝐈𝐎", "Não tem áudio salvo.", "—", null, nomeBot) }, { quoted: msg }) }
        cfg.audioMenu = null
        db.salvarConfig(cfg)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐔𝐃𝐈𝐎 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐎", "Áudio dos menus removido.", "—", null, nomeBot) }, { quoted: msg })
      }
    },

    teste: {
      aliases: ["json", "debugmsg", "verbot"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const ctx = (msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo) || {}
        const quoted = ctx.quotedMessage
        if (!quoted) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐓𝐄𝐒𝐓𝐄", "Responda uma mensagem.", "—", null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        const info = { key: { remoteJid: jid, fromMe: false, id: ctx.stanzaId || "", participant: ctx.participant || "" }, messageTimestamp: msg.messageTimestamp, pushName: msg.pushName || "", broadcast: false, message: quoted }
        const jsonStr = JSON.stringify(info, null, 3)
        const pedacos = []; const tamanhoMax = 3900
        for (let i = 0; i < jsonStr.length; i += tamanhoMax) pedacos.push(jsonStr.slice(i, i + tamanhoMax))
        await sock.sendMessage(jid, { text: `${boxTop("𝐉𝐒𝐎𝐍")}\n\n\`\`\`json\n${pedacos[0]}\`\`\`` }, { quoted: msg })
        for (let i = 1; i < pedacos.length; i++) await sock.sendMessage(jid, { text: `\`\`\`json\n${pedacos[i]}\`\`\`` }, { quoted: msg })
      }
    },

    get: {
      aliases: ["pegar", "getcase", "copiar"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        let nomeComando = args[0] ? args[0].toLowerCase().replace(/[^a-z0-9]/g, "") : ""
        const ctx = msg.message?.extendedTextMessage?.contextInfo || {}
        const quoted = ctx.quotedMessage
        if (!quoted) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐆𝐄𝐓", "Responda uma mensagem.", "—", null, nomeBot) }, { quoted: msg }) }
        const textoResposta = quoted.conversation || (quoted.extendedTextMessage && quoted.extendedTextMessage.text) || (quoted.imageMessage && quoted.imageMessage.caption) || (quoted.videoMessage && quoted.videoMessage.caption) || ""
        if (!textoResposta) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐆𝐄𝐓", "Mensagem sem texto.", "—", null, nomeBot) }, { quoted: msg }) }
        if (!nomeComando) { const primeiraPalavra = textoResposta.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, ""); nomeComando = primeiraPalavra || "comando_novo" }
        await reagir(sock, msg, "🌸")
        const textoEscapado = textoResposta.replace(/`/g, "\\`").replace(/\$/g, "\\$")
        const bloco = `comando_${nomeComando}: {\n  aliases: [],\n  async executar({ sock, msg, prefixoAtivo }) {\n    await sock.sendMessage(msg.key.remoteJid, { text: \`${textoEscapado}\` }, { quoted: msg })\n  }\n}`
        await sock.sendMessage(jid, { text: `${boxTop("𝐂𝐎𝐌𝐀𝐍𝐃𝐎")}\n\nCole no menu-vip\n\n\`\`\`javascript\n${bloco}\n\`\`\`` }, { quoted: msg })
      }
    },

    googlevoz: {
      aliases: ["tts", "falar", "googlevoice"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const textoFinal = args.join(" ").trim()
        if (!textoFinal) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐓𝐓𝐒", "Digite o texto.", "—", null, nomeBot) }, { quoted: msg }) }
        if (textoFinal.length > 200) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐓𝐓𝐒", "Texto muito longo.", "Máx 200 chars", null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        try {
          await sock.sendMessage(jid, { text: msgAviso("𝐆𝐄𝐑𝐀𝐍𝐃𝐎", "Gerando voz...", "Aguarde", null, nomeBot) }, { quoted: msg })
          const urlTTS = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(textoFinal)}&tl=pt&client=tw-ob`
          const resTTS = await fetch(urlTTS)
          if (!resTTS.ok) throw new Error("Falha ao gerar áudio.")
          const bufferMp3 = Buffer.from(await resTTS.arrayBuffer())
          const ff = require("@ffmpeg-installer/ffmpeg").path
          const tmp = os.tmpdir()
          const tIn = path.join(tmp, "tts_in_" + Date.now() + ".mp3")
          const tOut = path.join(tmp, "tts_out_" + Date.now() + ".ogg")
          fs.writeFileSync(tIn, bufferMp3)
          execSync(`"${ff}" -i "${tIn}" -c:a libopus -b:a 64k -ar 48000 -ac 1 -application voip -avoid_negative_ts make_zero "${tOut}"`, { timeout: 60000 })
          const bufferOgg = fs.readFileSync(tOut)
          try { fs.unlinkSync(tIn) } catch (_) {}
          try { fs.unlinkSync(tOut) } catch (_) {}
          await sock.sendMessage(jid, { audio: bufferOgg, mimetype: "audio/ogg; codecs=opus", ptt: true }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐓𝐓𝐒", "Falha ao gerar áudio.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    dono: {
      aliases: ["donoinfo", "infodono", "mestre"],
      async executar({ sock, msg, config, utils, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const donoArr = Array.isArray(config && config.dono) ? config.dono : [config && config.dono || ""]
        const numerosDono = donoArr.map(n => utils.soNumero(n)).filter(Boolean)
        const prefixo = (config && config.prefixo) || "+"
        const agora = new Date()
        const hora = agora.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" })
        const data = agora.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
        const mentions = numerosDono.map(n => n + "@s.whatsapp.net")
        let numerosTxt = ""
        if (numerosDono.length) numerosDono.forEach((n) => { numerosTxt += `↳ +${n}\n` })
        else numerosTxt = "↳ _não configurado_\n"
        await reagir(sock, msg, "🌸")
        const texto = `${boxTop("𝐃𝐎𝐍𝐎")}

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐁𝐎𝐓 𓆪
↳ ${nomeBot}
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐍𝐔́𝐌𝐄𝐑𝐎𝐒 𓆪
${numerosTxt}╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐈𝐍𝐅𝐎 𓆪
↳ Prefixo: ${prefixo}
↳ ${hora} — ${data}
╰┈┈┈┈୨୧┈┈┈┈╯

${boxFim(nomeBot)}`
        await sock.sendMessage(jid, { text: texto, mentions }, { quoted: msg })
      }
    },

    atualizar: {
      aliases: ["update", "git", "att"],
      donoOnly: true,
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        await reagir(sock, msg, "🌸")
        const sent = await sock.sendMessage(jid, { text: `${boxTop("𝐀𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐍𝐃𝐎")}\n\nBuscando no GitHub...\n[░░░░░░░░░░] 0%` }, { quoted: msg })
        const atualizarProgresso = async (pct, titulo, msg2) => {
          const cheios = Math.floor(pct / 10); const barra = "🌸".repeat(cheios) + "⬛".repeat(10 - cheios)
          try { await sock.sendMessage(jid, { text: `${boxTop(titulo)}\n\n${msg2}\n[${barra}] ${pct}%`, edit: sent.key }) } catch (_) {}
        }
        let zipPath, extractDir
        try {
          await new Promise(r => setTimeout(r, 800))
          await atualizarProgresso(15, "📡 VERIFICANDO", "Buscando commit...")
          if (!fs.existsSync(DATA_DIR)) { try { fs.mkdirSync(DATA_DIR, { recursive: true }) } catch (e) {} }
          const apiResp = await fetch(REPO_API, { headers: { "User-Agent": "RimuruBot" } })
          if (!apiResp.ok) throw new Error("GitHub respondeu " + apiResp.status)
          const apiData = await apiResp.json()
          const commitHash = apiData.sha
          const commitMsg = (apiData.commit && apiData.commit.message || "").split("\n")[0]
          const commitData = apiData.commit && apiData.commit.author && apiData.commit.author.date
          await atualizarProgresso(30, "📡 VERIFICANDO", "Comparando...")
          const commitSalvo = dbLer("ultimo_commit.json", { hash: null, versao: 0 })
          const versaoAtual = commitSalvo.versao || 0
          if (commitSalvo.hash === commitHash) {
            await new Promise(r => setTimeout(r, 500))
            return sock.sendMessage(jid, { text: `${boxTop("𝐄𝐌 𝐃𝐈𝐀")}\n\nVersão atual: V${versaoAtual}\n${commitHash.slice(0, 7)}`, edit: sent.key })
          }
          const versaoNova = versaoAtual + 1
          await atualizarProgresso(45, "🔥 NOVA VERSÃO", `V${versaoAtual} → V${versaoNova}`)
          await new Promise(r => setTimeout(r, 700))
          await atualizarProgresso(60, "📥 BAIXANDO", "Baixando...")
          const tmp = os.tmpdir(); const id = Date.now()
          zipPath = path.join(tmp, "rimuru_" + id + ".zip"); extractDir = path.join(tmp, "rimuru_" + id)
          const r = await fetch(REPO_URL + "/archive/refs/heads/main.zip")
          if (!r.ok) throw new Error("Download falhou: HTTP " + r.status)
          fs.writeFileSync(zipPath, Buffer.from(await r.arrayBuffer()))
          await atualizarProgresso(72, "📦 EXTRAINDO", "Descompactando...")
          if (!fs.existsSync(extractDir)) fs.mkdirSync(extractDir, { recursive: true })
          try { execSync(`unzip -o "${zipPath}" -d "${extractDir}"`, { stdio: "ignore" }) } catch (_) { try { execSync(`tar -xf "${zipPath}" -C "${extractDir}"`, { stdio: "ignore" }) } catch (e2) { throw new Error("Falta unzip/tar") } }
          const pastas = fs.readdirSync(extractDir).filter(f => fs.statSync(path.join(extractDir, f)).isDirectory())
          if (!pastas.length) throw new Error("Zip vazio")
          const raiz = path.join(extractDir, pastas[0])
          await atualizarProgresso(85, "🔧 APLICANDO", "Copiando...")
          const preservar = ["auth", "data", "node_modules", ".git", "config.js"]
          function copiarRecursivo(src, dest) {
            for (const item of fs.readdirSync(src)) {
              const srcPath = path.join(src, item); const destPath = path.join(dest, item)
              const stat = fs.statSync(srcPath)
              if (stat.isDirectory()) { if (preservar.includes(item)) continue; if (!fs.existsSync(destPath)) fs.mkdirSync(destPath, { recursive: true }); copiarRecursivo(srcPath, destPath) }
              else { if (preservar.includes(item)) continue; fs.copyFileSync(srcPath, destPath) }
            }
          }
          copiarRecursivo(raiz, BOT_DIR)
          fs.writeFileSync(path.join(DATA_DIR, "ultimo_commit.json"), JSON.stringify({ hash: commitHash, versao: versaoNova, msg: commitMsg, data: commitData, atualizadoEm: Date.now() }, null, 2))
          try { fs.unlinkSync(zipPath) } catch (_) {}
          try { fs.rmSync(extractDir, { recursive: true, force: true }) } catch (_) {}
          await atualizarProgresso(95, "♻️ RECARREGANDO", "Recarregando...")
          try { if (global.__carregarMenus) global.__carregarMenus() } catch (e) {}
          await atualizarProgresso(100, "✅ CONCLUÍDO", "Tudo aplicado!")
          await new Promise(r => setTimeout(r, 1000))
          await sock.sendMessage(jid, { text: `${boxTop("𝐀𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐃𝐎")}\n\nV${versaoAtual} → V${versaoNova}\n${commitMsg}\n${formatarDataHora(commitData)}\n\nReiniciando...`, edit: sent.key })
          await new Promise(r => setTimeout(r, 3000))
          process.exit(0)
        } catch (e) {
          try { if (zipPath) fs.unlinkSync(zipPath) } catch (_) {}
          try { if (extractDir) fs.rmSync(extractDir, { recursive: true, force: true }) } catch (_) {}
          await reagir(sock, msg, "💨")
          await sock.sendMessage(jid, { text: `${boxTop("𝐅𝐀𝐋𝐇𝐀")}\n\n${e.message}`, edit: sent.key })
        }
      }
    },

    nomebot: {
      aliases: ["setnomebot", "nomedobot"],
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const novoNome = args.join(" ").trim()
        if (!novoNome) { const cfg = db.config(); await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐍𝐎𝐌𝐄", `Atual: ${cfg.nomeBot || "Rimuru"}`, "Informe o novo nome.", `\`${p}nomebot <nome>\``, nomeBot) }, { quoted: msg }) }
        if (novoNome.length > 20) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐍𝐎𝐌𝐄", "Nome muito longo.", "Máx 20 caracteres", null, nomeBot) }, { quoted: msg }) }
        const cfg = db.config(); cfg.nomeBot = novoNome; db.salvarConfig(cfg)
        global.__nomeBotCache = null
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐍𝐎𝐌𝐄", "Alterado.", novoNome, null, nomeBot) }, { quoted: msg })
      }
    },

    reload: {
      aliases: ["recarregar", "reloadmenus"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        await reagir(sock, msg, "🌸")
        try {
          if (typeof global.__carregarMenus === "function") {
            global.__carregarMenus()
            global.__nomeBotCache = null
            const total = global.totalComandos || 0
            await sock.sendMessage(jid, { text: msgSucesso("𝐑𝐄𝐂𝐀𝐑𝐑𝐄𝐆𝐀𝐃𝐎", "Menus atualizados.", `${total} comandos`, null, nomeBot) }, { quoted: msg })
          } else {
            await sock.sendMessage(jid, { text: msgAviso("𝐑𝐄𝐂𝐀𝐑𝐑𝐄𝐆𝐀𝐑", "Função indisponível.", "Use +reiniciar", null, nomeBot) }, { quoted: msg })
          }
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐑𝐄𝐂𝐀𝐑𝐑𝐄𝐆𝐀𝐑", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    reiniciar: {
      aliases: ["restart"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        await reagir(sock, msg, "🌸")
        try {
          await sock.sendMessage(jid, { text: msgAviso("𝐑𝐄𝐈𝐍𝐈𝐂𝐈𝐀𝐍𝐃𝐎", "Aguarde...", "Reiniciando o bot", null, nomeBot) }, { quoted: msg })
          await new Promise(r => setTimeout(r, 3000))
          process.exit(0)
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐑𝐄𝐈𝐍𝐈𝐂𝐈𝐀𝐑", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    entrar: {
      aliases: ["entrargp", "join", "joinlink"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const link = args[0]
        if (!link) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐄𝐍𝐓𝐑𝐀𝐑", "Informe o link.", "—", null, nomeBot) }, { quoted: msg }) }
        const match = link.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/)
        if (!match) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐄𝐍𝐓𝐑𝐀𝐑", "Link inválido.", "Precisa ser chat.whatsapp.com/...", null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        try {
          await sock.sendMessage(jid, { text: msgAviso("𝐄𝐍𝐓𝐑𝐀𝐍𝐃𝐎", "Entrando...", "Aguarde", null, nomeBot) }, { quoted: msg })
          await sock.groupAcceptInvite(match[1])
          await sock.sendMessage(jid, { text: msgSucesso("𝐄𝐍𝐓𝐑𝐄𝐈", "Mais um território.", "Grupo adicionado", null, nomeBot) }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐍𝐓𝐑𝐀𝐑", "Falha ao entrar.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    setfoto: {
      aliases: ["fotomenu", "videomenu"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const quoted = ctx.quotedMessage
        let temImg = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage)
        let temVid = (msg.message && msg.message.videoMessage) || (quoted && quoted.videoMessage)
        if (quoted && quoted.viewOnceMessage) { temImg = temImg || quoted.viewOnceMessage.message?.imageMessage; temVid = temVid || quoted.viewOnceMessage.message?.videoMessage }
        if (quoted && quoted.viewOnceMessageV2) { temImg = temImg || quoted.viewOnceMessageV2.message?.imageMessage; temVid = temVid || quoted.viewOnceMessageV2.message?.videoMessage }
        if (!temImg && !temVid) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐒𝐄𝐓𝐅𝐎𝐓𝐎", "Envie/responda imagem/vídeo.", "—", null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        try {
          const cfg = db.config()
          if (temImg) {
            const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage || quoted.viewOnceMessage?.message?.imageMessage || quoted.viewOnceMessageV2?.message?.imageMessage } })
            const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
            cfg.fotoMenu = buffer.toString("base64"); cfg.tipoMenu = "foto"; db.salvarConfig(cfg)
            return sock.sendMessage(jid, { image: buffer, caption: msgSucesso("𝐅𝐎𝐓𝐎", "Salva no menu.", "Tipo: imagem", null, nomeBot) }, { quoted: msg })
          }
          const vidMsg = (msg.message && msg.message.videoMessage) ? msg : Object.assign({}, msg, { message: { videoMessage: quoted.videoMessage || quoted.viewOnceMessage?.message?.videoMessage || quoted.viewOnceMessageV2?.message?.videoMessage } })
          const vidBuffer = await utils.downloadMediaMessage(vidMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          const ff = require("@ffmpeg-installer/ffmpeg").path; const tmp = os.tmpdir()
          const tIn = path.join(tmp, "menu_" + Date.now() + ".mp4"); const tOut = path.join(tmp, "menu_" + Date.now() + "_out.mp4")
          fs.writeFileSync(tIn, vidBuffer)
          execSync(`"${ff}" -y -i "${tIn}" -vf "fps=12,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black" -an -c:v libx264 -preset fast -crf 30 -pix_fmt yuv420p -movflags +faststart "${tOut}"`, { timeout: 180000 })
          let outBuffer = fs.readFileSync(tOut)
          if (outBuffer.length > 15 * 1024 * 1024) {
            const tOut2 = path.join(tmp, "menu_" + Date.now() + "_out2.mp4")
            execSync(`"${ff}" -y -i "${tOut}" -vf "fps=8,scale=384:384:force_original_aspect_ratio=decrease,pad=384:384:(ow-iw)/2:(oh-ih)/2:color=black" -an -c:v libx264 -preset fast -crf 32 -pix_fmt yuv420p -movflags +faststart "${tOut2}"`, { timeout: 180000 })
            outBuffer = fs.readFileSync(tOut2); try { fs.unlinkSync(tOut2) } catch (_) {}
          }
          cfg.fotoMenu = outBuffer.toString("base64"); cfg.tipoMenu = "video"; db.salvarConfig(cfg)
          try { fs.unlinkSync(tIn) } catch (_) {}; try { fs.unlinkSync(tOut) } catch (_) {}
          await sock.sendMessage(jid, { video: outBuffer, mimetype: "video/mp4", fileName: "menu.mp4", gifPlayback: true, caption: msgSucesso("𝐕𝐈́𝐃𝐄𝐎", "Salvo no menu.", "Tipo: vídeo", null, nomeBot) }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐓𝐅𝐎𝐓𝐎", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    fotocmd: {
      aliases: ["fotocomando", "fotonaoencontrado", "setfotocmd"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const ctx = (msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo) || {}
        const quoted = ctx.quotedMessage
        let temImg = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage)
        let temVid = (msg.message && msg.message.videoMessage) || (quoted && quoted.videoMessage)
        if (quoted && quoted.viewOnceMessage) { temImg = temImg || quoted.viewOnceMessage.message?.imageMessage; temVid = temVid || quoted.viewOnceMessage.message?.videoMessage }
        if (quoted && quoted.viewOnceMessageV2) { temImg = temImg || quoted.viewOnceMessageV2.message?.imageMessage; temVid = temVid || quoted.viewOnceMessageV2.message?.videoMessage }
        if (!temImg && !temVid) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐅𝐎𝐓𝐎𝐂𝐌𝐃", "Envie/responda imagem/vídeo.", "—", null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        try {
          const cfg = db.config()
          if (temImg) {
            const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage || quoted.viewOnceMessage?.message?.imageMessage || quoted.viewOnceMessageV2?.message?.imageMessage } })
            const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
            cfg.fotoCmd = buffer.toString("base64"); cfg.tipoFotoCmd = "foto"; db.salvarConfig(cfg)
            return sock.sendMessage(jid, { image: buffer, caption: msgSucesso("𝐅𝐎𝐓𝐎 𝐂𝐌𝐃", "Salva no comando inválido.", "Tipo: imagem", null, nomeBot) }, { quoted: msg })
          }
          const vidMsg = (msg.message && msg.message.videoMessage) ? msg : Object.assign({}, msg, { message: { videoMessage: quoted.videoMessage || quoted.viewOnceMessage?.message?.videoMessage || quoted.viewOnceMessageV2?.message?.videoMessage } })
          const vidBuffer = await utils.downloadMediaMessage(vidMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          const ff = require("@ffmpeg-installer/ffmpeg").path; const tmp = os.tmpdir()
          const tIn = path.join(tmp, "cmd_" + Date.now() + ".mp4"); const tOut = path.join(tmp, "cmd_" + Date.now() + "_out.mp4")
          fs.writeFileSync(tIn, vidBuffer)
          execSync(`"${ff}" -y -i "${tIn}" -vf "fps=12,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black" -an -c:v libx264 -preset fast -crf 30 -pix_fmt yuv420p -movflags +faststart "${tOut}"`, { timeout: 180000 })
          let outBuffer = fs.readFileSync(tOut)
          if (outBuffer.length > 15 * 1024 * 1024) {
            const tOut2 = path.join(tmp, "cmd_" + Date.now() + "_out2.mp4")
            execSync(`"${ff}" -y -i "${tOut}" -vf "fps=8,scale=384:384:force_original_aspect_ratio=decrease,pad=384:384:(ow-iw)/2:(oh-ih)/2:color=black" -an -c:v libx264 -preset fast -crf 32 -pix_fmt yuv420p -movflags +faststart "${tOut2}"`, { timeout: 180000 })
            outBuffer = fs.readFileSync(tOut2); try { fs.unlinkSync(tOut2) } catch (_) {}
          }
          cfg.fotoCmd = outBuffer.toString("base64"); cfg.tipoFotoCmd = "video"; db.salvarConfig(cfg)
          try { fs.unlinkSync(tIn) } catch (_) {}; try { fs.unlinkSync(tOut) } catch (_) {}
          await sock.sendMessage(jid, { video: outBuffer, mimetype: "video/mp4", fileName: "cmd.mp4", gifPlayback: true, caption: msgSucesso("𝐕𝐈́𝐃𝐄𝐎 𝐂𝐌𝐃", "Salvo no comando inválido.", "Tipo: vídeo", null, nomeBot) }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐅𝐎𝐓𝐎𝐂𝐌𝐃", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    fotocmdc: {
      aliases: ["fotocomandoencontrado", "setfotocmdc", "fotocmd2"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const ctx = (msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo) || {}
        const quoted = ctx.quotedMessage
        let temImg = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage)
        let temVid = (msg.message && msg.message.videoMessage) || (quoted && quoted.videoMessage)
        if (quoted && quoted.viewOnceMessage) { temImg = temImg || quoted.viewOnceMessage.message?.imageMessage; temVid = temVid || quoted.viewOnceMessage.message?.videoMessage }
        if (quoted && quoted.viewOnceMessageV2) { temImg = temImg || quoted.viewOnceMessageV2.message?.imageMessage; temVid = temVid || quoted.viewOnceMessageV2.message?.videoMessage }
        if (!temImg && !temVid) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐅𝐎𝐓𝐎𝐂𝐌𝐃𝐂", "Envie/responda imagem/vídeo.", "—", null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        try {
          const cfg = db.config()
          if (temImg) {
            const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage || quoted.viewOnceMessage?.message?.imageMessage || quoted.viewOnceMessageV2?.message?.imageMessage } })
            const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
            cfg.fotoCmdEncontrado = buffer.toString("base64"); cfg.tipoFotoCmdEncontrado = "foto"; db.salvarConfig(cfg)
            return sock.sendMessage(jid, { image: buffer, caption: msgSucesso("𝐅𝐎𝐓𝐎 𝐂𝐌𝐃𝐂", "Salva no comando encontrado.", "Tipo: imagem", null, nomeBot) }, { quoted: msg })
          }
          const vidMsg = (msg.message && msg.message.videoMessage) ? msg : Object.assign({}, msg, { message: { videoMessage: quoted.videoMessage || quoted.viewOnceMessage?.message?.videoMessage || quoted.viewOnceMessageV2?.message?.videoMessage } })
          const vidBuffer = await utils.downloadMediaMessage(vidMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          const ff = require("@ffmpeg-installer/ffmpeg").path; const tmp = os.tmpdir()
          const tIn = path.join(tmp, "cmdc_" + Date.now() + ".mp4"); const tOut = path.join(tmp, "cmdc_" + Date.now() + "_out.mp4")
          fs.writeFileSync(tIn, vidBuffer)
          execSync(`"${ff}" -y -i "${tIn}" -vf "fps=12,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black" -an -c:v libx264 -preset fast -crf 30 -pix_fmt yuv420p -movflags +faststart "${tOut}"`, { timeout: 180000 })
          let outBuffer = fs.readFileSync(tOut)
          if (outBuffer.length > 15 * 1024 * 1024) {
            const tOut2 = path.join(tmp, "cmdc_" + Date.now() + "_out2.mp4")
            execSync(`"${ff}" -y -i "${tOut}" -vf "fps=8,scale=384:384:force_original_aspect_ratio=decrease,pad=384:384:(ow-iw)/2:(oh-ih)/2:color=black" -an -c:v libx264 -preset fast -crf 32 -pix_fmt yuv420p -movflags +faststart "${tOut2}"`, { timeout: 180000 })
            outBuffer = fs.readFileSync(tOut2); try { fs.unlinkSync(tOut2) } catch (_) {}
          }
          cfg.fotoCmdEncontrado = outBuffer.toString("base64"); cfg.tipoFotoCmdEncontrado = "video"; db.salvarConfig(cfg)
          try { fs.unlinkSync(tIn) } catch (_) {}; try { fs.unlinkSync(tOut) } catch (_) {}
          await sock.sendMessage(jid, { video: outBuffer, mimetype: "video/mp4", fileName: "cmdc.gif", gifPlayback: true, caption: msgSucesso("𝐆𝐈𝐅 𝐂𝐌𝐃𝐂", "Salvo como GIF.", "Tipo: GIF animado", null, nomeBot) }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐅𝐎𝐓𝐎𝐂𝐌𝐃𝐂", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    addvip: {
      aliases: ["darvip", "setvip"],
      async executar({ sock, msg, args, db, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const alvo = utils.getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐃𝐃𝐕𝐈𝐏", "Marque o usuário.", "—", null, nomeBot) }, { quoted: msg }) }
        const tempo = (args.find(a => /^(inf|\d+[dhm])$/i.test(a)) || "").toLowerCase()
        if (!tempo) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐃𝐃𝐕𝐈𝐏", "Informe o tempo.", "Ex: 1d / 7d / inf", `\`${p}addvip @user <tempo>\``, nomeBot) }, { quoted: msg }) }
        let expira = "inf"
        if (tempo !== "inf") { const v = parseInt(tempo); const u = tempo.slice(-1); let ms = 0; if (u === "d") ms = v * 24 * 60 * 60 * 1000; if (u === "h") ms = v * 60 * 60 * 1000; if (u === "m") ms = v * 60 * 1000; expira = Date.now() + ms }
        const v = db.vips(); v.vips = v.vips || {}; v.vips[alvo] = { expira, desde: Date.now() }; db.salvarVips(v)
        const num = utils.soNumero(alvo)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐍𝐎𝐁𝐑𝐄 𝐀𝐋𝐈𝐀𝐃𝐎", "VIP concedido.", `@${num}`, `Tempo: ${tempo === "inf" ? "ETERNO" : tempo.toUpperCase()}`, nomeBot), mentions: [alvo] }, { quoted: msg })
      }
    },

    delvip: {
      aliases: ["rmvip", "removervip"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const alvo = utils.getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐃𝐄𝐋𝐕𝐈𝐏", "Marque o usuário.", "—", null, nomeBot) }, { quoted: msg }) }
        const v = db.vips()
        if (!v.vips || !v.vips[alvo]) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐃𝐄𝐋𝐕𝐈𝐏", "Não é VIP.", `@${utils.soNumero(alvo)}`, null, nomeBot), mentions: [alvo] }, { quoted: msg }) }
        delete v.vips[alvo]; db.salvarVips(v)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐕𝐈𝐏 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐎", "Adeus nobreza.", `@${utils.soNumero(alvo)}`, null, nomeBot), mentions: [alvo] }, { quoted: msg })
      }
    },

    listavip: {
      aliases: ["vips", "vervips"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const v = db.vips(); const vips = Object.entries(v.vips || {})
        if (!vips.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐒𝐓𝐀 𝐕𝐈𝐏", "Ninguém é VIP.", "—", null, nomeBot) }, { quoted: msg }) }
        let txt = `${boxTop("𝐋𝐈𝐒𝐓𝐀 𝐕𝐈𝐏")}\n\n`; const mentions = []
        vips.forEach(([jidVip, info], i) => { const num = utils.soNumero(jidVip); const expira = info.expira === "inf" ? "♾️" : new Date(info.expira).toLocaleDateString("pt-BR"); txt += `╭┈┈┈┈୨୧┈┈┈┈╮\n𓆩 #${i + 1} 𓆪\n↳ @${num}\n↳ ${expira}\n╰┈┈┈┈୨୧┈┈┈┈╯\n`; mentions.push(jidVip) })
        txt += `\n${boxFim(nomeBot)}`
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: txt, mentions }, { quoted: msg })
      }
    },

    addsubdono: {
      aliases: ["addsub", "darsub"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const alvo = utils.getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐃𝐃𝐒𝐔𝐁", "Marque o usuário.", "—", null, nomeBot) }, { quoted: msg }) }
        const cfg = db.config(); cfg.subdonos = cfg.subdonos || []; const num = utils.soNumero(alvo)
        if (cfg.subdonos.some(s => utils.soNumero(s) === num)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐃𝐃𝐒𝐔𝐁", "Já é Sub-Dono.", `@${num}`, null, nomeBot), mentions: [alvo] }, { quoted: msg }) }
        cfg.subdonos.push(alvo); db.salvarConfig(cfg)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐍𝐎𝐕𝐀 𝐋𝐔𝐀", "Virou Sub-Dono.", `@${num}`, null, nomeBot), mentions: [alvo] }, { quoted: msg })
      }
    },

    delsubdono: {
      aliases: ["delsub", "rmsub", "rmsubdono"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const alvo = utils.getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐃𝐄𝐋𝐒𝐔𝐁", "Marque o usuário.", "—", null, nomeBot) }, { quoted: msg }) }
        const cfg = db.config(); const num = utils.soNumero(alvo)
        cfg.subdonos = (cfg.subdonos || []).filter(s => utils.soNumero(s) !== num); db.salvarConfig(cfg)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐑𝐄𝐁𝐀𝐈𝐗𝐀𝐃𝐎", "Não é mais Sub-Dono.", `@${num}`, null, nomeBot), mentions: [alvo] }, { quoted: msg })
      }
    },

    listasubdono: {
      aliases: ["subdonos", "listasub"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const cfg = db.config(); const subs = cfg.subdonos || []
        if (!subs.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐒𝐓𝐀 𝐒𝐔𝐁", "Nenhum Sub-Dono.", "—", null, nomeBot) }, { quoted: msg }) }
        let txt = `${boxTop("𝐋𝐔𝐀𝐒")}\n\n`; const mentions = []
        subs.forEach((jidS, i) => { txt += `╭┈┈┈┈୨୧┈┈┈┈╮\n𓆩 #${i + 1} 𓆪\n↳ @${utils.soNumero(jidS)}\n╰┈┈┈┈୨୧┈┈┈┈╯\n`; mentions.push(jidS) })
        txt += `\n${boxFim(nomeBot)}`
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: txt, mentions }, { quoted: msg })
      }
    },

    prefixoglobal: {
      aliases: ["setprefixoglobal"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const novo = args[0]
        if (!novo || novo.length > 3) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐏𝐑𝐄𝐅𝐈𝐗𝐎", "Prefixo inválido.", "Máx 3 caracteres", null, nomeBot) }, { quoted: msg }) }
        const cfg = db.config(); cfg.prefixoGlobal = novo; db.salvarConfig(cfg)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐑𝐄𝐅𝐈𝐗𝐎", "Alterado globalmente.", `\`${novo}\``, null, nomeBot) }, { quoted: msg })
      }
    },

    slow: {
      aliases: ["modolento"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐒𝐋𝐎𝐖", "Use on/off.", "—", null, nomeBot) }, { quoted: msg }) }
        const cfg = db.config(); cfg.slow = opcao === "on"; db.salvarConfig(cfg)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐌𝐎𝐃𝐎 𝐋𝐄𝐍𝐓𝐎", "Configurado.", opcao.toUpperCase(), null, nomeBot) }, { quoted: msg })
      }
    },

    aluguel: {
      aliases: ["modoaluguel", "sistaluguel"],
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase(); const a = db.aluguel()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "🌸"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐋𝐔𝐆𝐔𝐄𝐋", `Status: ${a.ativo ? "ON ✅" : "OFF ❌"}`, "—", `\`${p}aluguel on/off\``, nomeBot) }, { quoted: msg }) }
        a.ativo = (opcao === "on"); db.salvarAluguel(a)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐋𝐔𝐆𝐔𝐄𝐋", "Modo alterado.", opcao.toUpperCase(), null, nomeBot) }, { quoted: msg })
      }
    },

    addaluguel: {
      aliases: ["davaluguel", "setaluguel"], grupoOnly: true,
      async executar({ sock, msg, args, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const tempoStr = args.join(" ").trim().toLowerCase()
        if (!tempoStr) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐃𝐃𝐀𝐋𝐔𝐆𝐔𝐄𝐋", "Informe o tempo.", "Ex: 7 dias / 1 mes", null, nomeBot) }, { quoted: msg }) }
        const partes = tempoStr.split(/\s+/); let totalMs = 0
        for (const part of partes) {
          const m = part.match(/^(\d+)(min|h|dia|d|sem|mes|ano)$/)
          if (!m) continue
          const v = parseInt(m[1]); const u = m[2]; let ms = 0
          if (u === "min") ms = v * 60 * 1000
          else if (u === "h") ms = v * 60 * 60 * 1000
          else if (u === "d" || u === "dia") ms = v * 24 * 60 * 60 * 1000
          else if (u === "sem") ms = v * 7 * 24 * 60 * 60 * 1000
          else if (u === "mes") ms = v * 30 * 24 * 60 * 60 * 1000
          else if (u === "ano") ms = v * 365 * 24 * 60 * 60 * 1000
          totalMs += ms
        }
        if (totalMs <= 0) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐀𝐃𝐃𝐀𝐋𝐔𝐆𝐔𝐄𝐋", "Formato inválido.", "Use ex: 7 dias", null, nomeBot) }, { quoted: msg }) }
        const a = db.aluguel(); a.grupos = a.grupos || {}
        const agora = Date.now(); const atual = (a.grupos[jid] > agora) ? a.grupos[jid] : agora
        a.grupos[jid] = atual + totalMs; if (!a.ativo) a.ativo = true; db.salvarAluguel(a)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐋𝐔𝐆𝐔𝐄𝐋", "Adicionado.", `Expira em ${utils.formatarTempo(a.grupos[jid] - agora)}`, null, nomeBot) }, { quoted: msg })
      }
    },

    listaaluguel: {
      aliases: ["alugueis", "veralugueis"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const a = db.aluguel(); const agora = Date.now()
        const entradas = Object.entries(a.grupos || {}).filter(e => e[1] > agora)
        if (!entradas.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐒𝐓𝐀 𝐀𝐋𝐔𝐆𝐔𝐄𝐋", "Nenhum aluguel ativo.", "—", null, nomeBot) }, { quoted: msg }) }
        let txt = `${boxTop("𝐀𝐋𝐔𝐆𝐀𝐃𝐎𝐒")}\n\n`
        for (const [jidG, exp] of entradas) {
          try {
            const meta = await sock.groupMetadata(jidG)
            txt += `╭┈┈┈┈୨୧┈┈┈┈╮\n𓆩 𝐆𝐑𝐔𝐏𝐎 𓆪\n↳ ${meta.subject || "?"}\n↳ ${utils.formatarTempo(exp - agora)}\n╰┈┈┈┈୨୧┈┈┈┈╯\n`
          } catch (_) {
            txt += `╭┈┈┈┈୨୧┈┈┈┈╮\n𓆩 𝐆𝐑𝐔𝐏𝐎 𓆪\n↳ \`${jidG}\`\n↳ ${utils.formatarTempo(exp - agora)}\n╰┈┈┈┈୨୧┈┈┈┈╯\n`
          }
        }
        txt += `\n${boxFim(nomeBot)}`
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    delaluguel: {
      aliases: ["rmaluguel", "removeraluguel"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const a = db.aluguel(); a.grupos = a.grupos || {}
        if (!jid.endsWith("@g.us")) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐃𝐄𝐋𝐀𝐋𝐔𝐆𝐔𝐄𝐋", "Use em grupo.", "—", null, nomeBot) }, { quoted: msg }) }
        if (!a.grupos[jid]) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐃𝐄𝐋𝐀𝐋𝐔𝐆𝐔𝐄𝐋", "Sem aluguel ativo.", "—", null, nomeBot) }, { quoted: msg }) }
        delete a.grupos[jid]; db.salvarAluguel(a)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐋𝐈𝐁𝐄𝐑𝐓𝐀𝐃𝐎", "Aluguel removido.", "—", null, nomeBot) }, { quoted: msg })
      }
    },

    banirgp: {
      aliases: ["bangp", "banirgrupo"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const b = db.bangp(); b.grupos = b.grupos || {}; b.grupos[jid] = true; db.salvarBangp(b)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐁𝐀𝐍𝐈𝐃𝐎", "Grupo banido.", "Não respondo mais aqui", null, nomeBot) }, { quoted: msg })
      }
    },

    desbanirgp: {
      aliases: ["desbangp"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const b = db.bangp()
        if (b.grupos && b.grupos[jid]) { delete b.grupos[jid]; db.salvarBangp(b); await reagir(sock, msg, "🌸"); return sock.sendMessage(jid, { text: msgSucesso("𝐋𝐈𝐁𝐄𝐑𝐀𝐃𝐎", "Grupo liberado.", "Voltou a responder", null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "💨")
        await sock.sendMessage(jid, { text: msgAviso("𝐃𝐄𝐒𝐁𝐀𝐍𝐈𝐑", "Grupo não está banido.", "—", null, nomeBot) }, { quoted: msg })
      }
    },

    listabangp: {
      aliases: ["gruposbanidos"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const b = db.bangp(); const grupos = Object.keys(b.grupos || {})
        if (!grupos.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐒𝐓𝐀 𝐁𝐀𝐍", "Nenhum grupo banido.", "—", null, nomeBot) }, { quoted: msg }) }
        let txt = `${boxTop("𝐁𝐀𝐍𝐈𝐃𝐎𝐒")}\n\n`
        grupos.forEach((g, i) => { txt += `╭┈┈┈┈୨୧┈┈┈┈╮\n𓆩 #${i + 1} 𓆪\n↳ \`${g}\`\n╰┈┈┈┈୨୧┈┈┈┈╯\n` })
        txt += `\n${boxFim(nomeBot)}`
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    limpargp: {
      aliases: ["limpargrupo"],
      async executar({ sock, msg, groupMetadata, utils, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        if (!jid.endsWith("@g.us")) return
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐋𝐈𝐌𝐏𝐀𝐑𝐆𝐏", "Preciso ser admin.", "Promova o bot", null, nomeBot) }, { quoted: msg }) }
        const chave = jid + "_limpar"
        if (!confirmacoesPendentes.has(chave)) {
          confirmacoesPendentes.set(chave, Date.now())
          setTimeout(() => confirmacoesPendentes.delete(chave), 60000)
          await reagir(sock, msg, "🌸")
          return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐌𝐏𝐄𝐙𝐀", "Remove membros comuns.", "⚠️ Ação destrutiva", `Confirme: \`${p}limpargp confirmar\``, nomeBot) }, { quoted: msg })
        }
        if (!msg.message?.extendedTextMessage?.text?.toLowerCase().includes("confirmar")) {
          confirmacoesPendentes.delete(chave)
          return sock.sendMessage(jid, { text: msgAviso("𝐂𝐀𝐍𝐂𝐄𝐋𝐀𝐃𝐎", "Abortado.", "—", null, nomeBot) }, { quoted: msg })
        }
        confirmacoesPendentes.delete(chave)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐌𝐏𝐄𝐙𝐀", "O silêncio observa.", "Executando...", null, nomeBot) }, { quoted: msg })
        const meta = await sock.groupMetadata(jid)
        const botIds = [sock.user?.id, sock.user?.lid].filter(Boolean).map(utils.soNumero)
        const alvos = meta.participants.filter(pa => {
          const pIds = [pa.id, pa.lid, pa.phoneNumber].filter(Boolean).map(utils.soNumero)
          if (pIds.some(id => botIds.includes(id))) return false
          if (pa.admin === "admin" || pa.admin === "superadmin") return false
          return true
        }).map(pa => pa.id).slice(0, 50)
        for (const a of alvos) { try { await sock.groupParticipantsUpdate(jid, [a], "remove") } catch (_) {}; await new Promise(r => setTimeout(r, 1500)) }
      }
    },

    maxenvio: {
      aliases: ["setmax", "configenvio"], grupoOnly: true,
      async executar({ sock, msg, args, db, isDono }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        if (!isDono) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐌𝐀𝐗𝐄𝐍𝐕𝐈𝐎", "Apenas o dono.", "—", null, nomeBot) }, { quoted: msg }) }
        const qtd = parseInt(args[0])
        if (isNaN(qtd) || qtd < 1 || args.length === 0) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐌𝐀𝐗𝐄𝐍𝐕𝐈𝐎", "Define quantas vezes o play3 envia.", "Ex: +maxenvio 5", "Limite: 100", nomeBot) }, { quoted: msg }) }
        const cfg = db.config(); cfg.maxenvioPadrao = Math.min(qtd, 100); db.salvarConfig(cfg)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐃𝐎", "Max envio definido.", `${cfg.maxenvioPadrao}x`, null, nomeBot) }, { quoted: msg })
      }
    },

    play3: {
      aliases: ["flood", "spam"], grupoOnly: true,
      async executar({ sock, msg, args, db, groupMetadata, isDono }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        if (!isDono) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐏𝐋𝐀𝐘𝟑", "Apenas o dono.", "—", null, nomeBot) }, { quoted: msg }) }
        const participantes = groupMetadata?.participants || []
        const mentions = participantes.map((p) => p.id)
        const cfg = db.config(); const vezes = cfg.maxenvioPadrao || 1
        const textoCustom = args.join(" ").trim()
        if (!textoCustom) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐏𝐋𝐀𝐘𝟑", "Use o comando.", "Ex: +play3 <texto>", `Flood: ${vezes}x`, nomeBot) }, { quoted: msg }) }

        try {
          const { enviarStatus } = require("../status-helper")
          await enviarStatus({ carol: sock, from: jid, msg, text: textoCustom, quoted: null, caption: "", linkPreview: false })
        } catch (e) { console.error("❌ Erro status play3:", e.message) }

        try {
          await reagir(sock, msg, "🌸")
          await sock.sendMessage(jid, { text: msgAviso("𝐈𝐍𝐈𝐂𝐈𝐀𝐍𝐃𝐎", `Enviando ${vezes}x...`, "Flood em execução", null, nomeBot) }, { quoted: msg })

          const messageContent = {
            requestPaymentMessage: {
              currencyCodeIso4217: 'BRL', amount1000: '0',
              noteMessage: { extendedTextMessage: { text: textoCustom, contextInfo: { mentionedJid: mentions } } },
              expiryTimestamp: '0',
              amount: { value: '0', offset: 1000, currencyCode: 'BRL' }
            }
          }

          for (let i = 0; i < vezes; i++) {
            try {
              const waMessage = generateWAMessageFromContent(jid, messageContent, { userJid: sock.user.id })
              await sock.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id })
            } catch (err) {
              try { await sock.sendMessage(jid, { text: textoCustom, mentions }, { quoted: msg }) } catch (_) {}
            }
            await new Promise(resolve => setTimeout(resolve, 200))
          }
        } catch (e) {
          console.error("Erro play3:", e)
          await sock.sendMessage(jid, { text: msgErro("𝐏𝐋𝐀𝐘𝟑", "Falha no flood.", e.message, null, nomeBot) }, { quoted: msg })
        }
      }
    },

    delpay: {
      aliases: ["del", "neutralizar"], grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils, isDono, isAdmin }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        if (!isDono && !isAdmin) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐃𝐄𝐋𝐏𝐀𝐘", "Apenas admins.", "—", null, nomeBot) }, { quoted: msg }) }
        const ctx = msg.message?.extendedTextMessage?.contextInfo || {}
        if (!ctx.quotedMessage || !ctx.stanzaId) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐃𝐄𝐋𝐏𝐀𝐘", "Responda a mensagem.", "—", null, nomeBot) }, { quoted: msg }) }
        try {
          const targetSender = ctx.participant || ctx.remoteJid
          const targetUser = targetSender ? targetSender.split('@')[0] : 'usuário'
          const keyToEditAndDelete = { remoteJid: jid, fromMe: false, id: ctx.stanzaId, participant: targetSender }
          const panelText = `🌸 *ANTI-PAYMANT*\n` + `👤 Invasor: @${targetUser}\n` + `⚡ Status: Neutralizado`
          await sock.sendMessage(jid, { text: panelText, edit: keyToEditAndDelete, mentions: [targetSender] })
          await new Promise(resolve => setTimeout(resolve, 1000))
          await sock.sendMessage(jid, { delete: keyToEditAndDelete })
          if (utils.botEhAdmin(groupMetadata, sock)) {
            await new Promise(resolve => setTimeout(resolve, 500))
            await sock.groupParticipantsUpdate(jid, [targetSender], "remove").catch(_ => {})
          }
        } catch (error) {
          console.error('❌ [ERRO DELPAY]:', error)
          await sock.sendMessage(jid, { text: msgErro("𝐃𝐄𝐋𝐏𝐀𝐘", "Verifique se sou admin.", error.message, null, nomeBot) }, { quoted: msg })
        }
      }
    },

    blockcmd: {
      aliases: ["bloquearcmd", "block"],
      donoOnly: true,
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const nomeBot = nomeBotDb(db)
        const alvo = (args[0] || "").toLowerCase().trim()

        if (!alvo) {
          await reagir(sock, msg, "💨")
          return sock.sendMessage(jid, { text: msgAviso("𝐁𝐋𝐎𝐂𝐊𝐂𝐌𝐃", "Informe o comando.", "—", `\`${p}blockcmd <nome>\``, nomeBot) }, { quoted: msg })
        }

        const bl = dbLer("blockcmd.json", {})
        if (bl[alvo]) {
          await reagir(sock, msg, "💧")
          return sock.sendMessage(jid, { text: msgAviso("𝐁𝐋𝐎𝐂𝐊𝐂𝐌𝐃", "Já está bloqueado.", `\`${alvo}\``, null, nomeBot) }, { quoted: msg })
        }

        bl[alvo] = true
        dbSalvar("blockcmd.json", bl)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐁𝐋𝐎𝐂𝐊𝐂𝐌𝐃", "Comando bloqueado.", `Só dono usa \`${p}${alvo}\``, "Use desblockcmd para liberar", nomeBot) }, { quoted: msg })
      }
    },

    desblockcmd: {
      aliases: ["desbloquearcmd", "unblock"],
      donoOnly: true,
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const nomeBot = nomeBotDb(db)
        const alvo = (args[0] || "").toLowerCase().trim()

        if (!alvo) {
          await reagir(sock, msg, "💨")
          return sock.sendMessage(jid, { text: msgAviso("𝐃𝐄𝐒𝐁𝐋𝐎𝐂𝐊𝐂𝐌𝐃", "Informe o comando.", "—", `\`${p}desblockcmd <nome>\``, nomeBot) }, { quoted: msg })
        }

        const bl = dbLer("blockcmd.json", {})
        if (!bl[alvo]) {
          await reagir(sock, msg, "💧")
          return sock.sendMessage(jid, { text: msgAviso("𝐃𝐄𝐒𝐁𝐋𝐎𝐂𝐊𝐂𝐌𝐃", "Esse comando não está bloqueado.", `\`${alvo}\``, null, nomeBot) }, { quoted: msg })
        }

        delete bl[alvo]
        dbSalvar("blockcmd.json", bl)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐃𝐄𝐒𝐁𝐋𝐎𝐂𝐊𝐂𝐌𝐃", "Comando liberado.", `\`${p}${alvo}\` voltou ao normal`, null, nomeBot) }, { quoted: msg })
      }
    },

    listblockcmd: {
      aliases: ["listablock", "bloqueados"],
      donoOnly: true,
      async executar({ sock, msg, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const nomeBot = nomeBotDb(db)
        const bl = dbLer("blockcmd.json", {})
        const lista = Object.keys(bl)

        if (!lista.length) {
          await reagir(sock, msg, "💨")
          return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐒𝐓𝐀 𝐁𝐋𝐎𝐐𝐔𝐄𝐀𝐃𝐎𝐒", "Nenhum comando bloqueado.", "—", null, nomeBot) }, { quoted: msg })
        }

        await reagir(sock, msg, "🌸")
        let txt = `${boxTop("𝐁𝐋𝐎𝐐𝐔𝐄𝐀𝐃𝐎𝐒")}\n\n`
        lista.forEach((c, i) => {
          txt += `╭┈┈┈┈୨୧┈┈┈┈╮\n𓆩 #${i + 1} 𓆪\n↳ \`${p}${c}\`\n╰┈┈┈┈୨୧┈┈┈┈╯\n`
        })
        txt += `\n╔═══ஓ๑♡๑ஓ═══╗\n𓆩 𝐓𝐎𝐓𝐀𝐋 𓆪\n↳ ${lista.length}\n╚═══ஓ๑♡๑ஓ═══╝\n\n${boxFim(nomeBot)}`
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    }

  }
}