/* ============================================================
   🧊 MENU DONO - OBANAI MAID EDITION (BRANCO/CIANO)
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
const REPO_COMMITS = "https://api.github.com/repos/conrradokassiel23-arch/zenitsu-bot-md/commits?per_page=15"

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

function categorizarCommit(msg) {
  const m = String(msg || "").toLowerCase()
  if (m.includes("add") || m.includes("novo") || m.includes("new") || m.includes("cria") || m.includes("feat")) return { emoji: "❄️", tipo: "Novo comando" }
  if (m.includes("fix") || m.includes("corrig") || m.includes("bug") || m.includes("arrum")) return { emoji: "🧊", tipo: "Correção" }
  if (m.includes("remove") || m.includes("delet") || m.includes("remov")) return { emoji: "☁️", tipo: "Removido" }
  if (m.includes("update") || m.includes("atualiz") || m.includes("melhor") || m.includes("improve")) return { emoji: "🩵", tipo: "Melhoria" }
  return { emoji: "🤍", tipo: "Mudança" }
}

function nomeBotDb(db) {
  if (!global.__nomeBotCache) {
    try { global.__nomeBotCache = db.config().nomeBot || "Rimuru Bot" } catch { global.__nomeBotCache = "Rimuru Bot" }
  }
  return global.__nomeBotCache
}

function cardPerfilMaid({ nomeBot, nomeUsuario, cargo, dono }) {
  return `╭━━━〔 🧊 𝐎𝐁𝐀𝐍𝐀𝐈 𝐌𝐀𝐈𝐃 🧊 〕━━━╮
┃ 🩵 Bot: ${nomeBot || "Obanai"}
┃ 🤍 Usuário: ${nomeUsuario || "? "}
┃ ☁️ Cargo: ${cargo || "Mortal"}
┃ 🦋 Dono: ${dono || "Obanai"}
╰━━━━━━━━━━━━━━━━━━━━━━━━━╯`
}

function detectarCargo({ sender, config, db, groupMetadata, isDono, isSubDono, isAdmin }) {
  const num = String(sender || "").split("@")[0].split(":")[0].replace(/\D/g, "")
  const donos = (Array.isArray(config?.dono) ? config.dono : [config?.dono]).map(n => String(n).split("@")[0].split(":")[0].replace(/\D/g, "")).filter(Boolean)
  if (isDono || donos.includes(num)) return "🦋 Mestre"
  try { const subs = (db.config?.().subdonos || []).map(n => String(n).split("@")[0].split(":")[0].replace(/\D/g, "")); if (isSubDono || subs.includes(num)) return "🩵 Hashira" } catch (_) {}
  if (isAdmin) return "⚔️ Espadachim"
  return "🤍 Aprendiz"
}

function getCargoETexto(ctx) {
  const { sender, config, db, groupMetadata, isDono, isSubDono, isAdmin, msg } = ctx
  const pushName = msg.pushName || "Mortal"
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

function logDiv(tipo, msg) {
  const agora = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
  const prefixos = {
    inicio: "🚀 [DIVULGAÇÃO]", ciclo: "🔄 [DIVULGAÇÃO]", envio: "📤 [DIVULGAÇÃO]", ok: "✅ [DIVULGAÇÃO]", erro: "❌ [DIVULGAÇÃO]", aviso: "⚠️ [DIVULGAÇÃO]", fim: "🛑 [DIVULGAÇÃO]"
  }
  console.log(`\n${prefixos[tipo] || "ℹ️ [DIVULGAÇÃO]"} [${agora}]\n   ${msg}`)
}

function logLoopEncerrado(motivo, detalhes = {}) {
  const agora = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
  console.log(`\n╔══════════════════════════════════════════════════╗`)
  console.log(`║   🛑  LOOP DE DIVULGAÇÃO ENCERRADO               ║`)
  console.log(`╠══════════════════════════════════════════════════╣`)
  console.log(`║   🕐 Hora: ${agora}`)
  console.log(`║   📋 Motivo: ${motivo}`)
  if (detalhes.divAtivas !== undefined) console.log(`║   📸 Divulgações ativas: ${detalhes.divAtivas}`)
  if (detalhes.divTotal !== undefined) console.log(`║   📦 Divulgações totais: ${detalhes.divTotal}`)
  if (detalhes.grupos !== undefined) console.log(`║   👥 Grupos ativos: ${detalhes.grupos}`)
  if (detalhes.ciclos !== undefined) console.log(`║   🔄 Ciclos completados: ${detalhes.ciclos}`)
  if (detalhes.enviados !== undefined) console.log(`║   ✅ Envios com sucesso: ${detalhes.enviados}`)
  if (detalhes.falhas !== undefined) console.log(`║   ❌ Falhas de envio: ${detalhes.falhas}`)
  console.log(`╚══════════════════════════════════════════════════╝\n`)
}

module.exports = {
  menu: "menu-dono",
  grupoOnly: false,
  adminOnly: false,
  donoOnly: true,

  commands: {

    menudono: {
      aliases: ["dono", "comandosdono", "menud", "imperador", "grandesabio", "obanai", "serpente"],
      async executar({ sock, msg, prefixoAtivo, db, sender, config, isDono, isSubDono, isAdmin, groupMetadata }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const cfg = db.config() || {}
        const numUser = String(sender || "").split("@")[0].split(":")[0].replace(/\D/g, "")
        const { pushName, nomeDono, cargo, nomeBot } = getCargoETexto({ sender, config, db, groupMetadata, isDono, isSubDono, isAdmin, msg })
        const agora = new Date()
        const hora = agora.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" })
        const data = agora.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
        const mentions = sender ? [sender] : []
        
        await reagir(sock, msg, "🧊")

        const texto = `${cardPerfilMaid({ nomeBot, nomeUsuario: pushName, cargo, dono: nomeDono })}

╭━〔 ⚙️ 𝐆𝐄𝐑𝐀𝐋 〕━╮
┃ 🩵 ${p}entrar <link>
┃ 🤍 ${p}reload / ${p}reiniciar
┃ 🧊 ${p}botoff / ${p}boton
┃ ☁️ ${p}status <txt> (reply)
┃ 🦋 ${p}setfoto (reply)
┃ 🩵 ${p}fotocmd (reply)
┃ 🤍 ${p}audiomenu (reply)
┃ 🧊 ${p}nuke / ${p}limpargp
┃ ☁️ ${p}maxenvio <nº>
┃ 🦋 ${p}play3 <msg>
╰━━━━━━━━━━━━━━━╯

╭━〔 📢 𝐃𝐈𝐕𝐔𝐋𝐆𝐀𝐂̧𝐀̃𝐎 〕━╮
┃ 🩵 ${p}div <tempo> (reply)
┃ 🤍 ${p}listadiv / ${p}apagardiv
┃ 🧊 ${p}grupos / ${p}addtodos
┃ ☁️ ${p}addgp / ${p}removergp
┃ 🦋 ${p}intervalo <tempo>
┃ 🩵 ${p}iniciardv / ${p}parardv
┃ 🤍 ${p}estado
╰━━━━━━━━━━━━━━━━━━━╯

╭━〔 💰 𝐀𝐋𝐔𝐆𝐔𝐄𝐋 〕━╮
┃ 🧊 ${p}aluguel on/off
┃ ☁️ ${p}addaluguel <tempo>
┃ 🦋 ${p}listaaluguel
┃ 🩵 ${p}delaluguel
╰━━━━━━━━━━━━━━━╯

╭━〔 👑 𝐒𝐔𝐁-𝐃𝐎𝐍𝐎𝐒 〕━╮
┃ 🤍 ${p}addsubdono @user
┃ 🧊 ${p}delsubdono @user
┃ ☁️ ${p}listasubdono
╰━━━━━━━━━━━━━━━━━╯

╭━〔 💙 𝐕𝐈𝐏 〕━╮
┃ 🦋 ${p}addvip @user <tempo>
┃ 🩵 ${p}delvip @user
┃ 🤍 ${p}listavip
╰━━━━━━━━━━━━━╯

╭━〔 🚫 𝐁𝐀𝐍𝐈𝐌𝐄𝐍𝐓𝐎 〕━╮
┃ 🧊 ${p}banirgp / ${p}desbanirgp
┃ ☁️ ${p}listabangp
╰━━━━━━━━━━━━━━━━━╯

╭━〔 ⚙️ 𝐀𝐉𝐔𝐒𝐓𝐄𝐒 〕━╮
┃ 🦋 ${p}prefixoglobal <s>
┃ 🩵 ${p}slow on/off
╰━━━━━━━━━━━━━━━╯

🧊 Prefixo: \`${p}\`
🤍 Horário: ${hora} — ${data}

_"A maid está observando."_ 🦋

"${nomeBot}"`

        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          try {
            if (cfg.tipoMenu === "video") return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "obanai.mp4", gifPlayback: true, caption: texto, mentions }, { quoted: msg })
            return sock.sendMessage(jid, { image: buf, caption: texto, mentions }, { quoted: msg })
          } catch (e) { return sock.sendMessage(jid, { text: texto, mentions }, { quoted: msg }) }
        }
        await sock.sendMessage(jid, { text: texto, mentions }, { quoted: msg })
      }
    },

    botoff: {
      aliases: ["desligar", "offbot"],
      grupoOnly: true,
      async executar({ sock, msg, db, isDono, isSubDono }) {
        if (!isDono && !isSubDono) return
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const g = db.grupos()
        g[jid] = g[jid] || {}
        g[jid].mudo = true
        db.salvarGrupos(g)
        
        await reagir(sock, msg, "🏳️‍⚧️")
        await sock.sendMessage(jid, { text: `╭━〔 🧊 𝐁𝐎𝐓𝐎𝐅𝐅 〕━╮\n┃ 🤍 O bot foi silenciado.\n┃ 🩵 Reagirei apenas com 🏳️‍⚧️\n╰━━━━━━━━━━━━━━━╯\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    boton: {
      aliases: ["ligar", "onbot"],
      grupoOnly: true,
      async executar({ sock, msg, db, isDono, isSubDono }) {
        if (!isDono && !isSubDono) return
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const g = db.grupos()
        g[jid] = g[jid] || {}
        g[jid].mudo = false
        db.salvarGrupos(g)
        
        await reagir(sock, msg, "✅")
        await sock.sendMessage(jid, { text: `╭━〔 🩵 𝐁𝐎𝐓𝐎𝐍 〕━╮\n┃ 🤍 O bot voltou a responder.\n╰━━━━━━━━━━━━━━━╯\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    status: {
      aliases: ["postarstatus", "stt"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        if (!isDono && !isSubDono) return
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const texto = args.join(" ").trim()
        const ctx = msg.message?.extendedTextMessage?.contextInfo || {}
        const quoted = ctx.quotedMessage

        if (!quoted && !texto) {
          await reagir(sock, msg, "🧊")
          return sock.sendMessage(jid, { text: `╭━〔 ☁️ 𝐒𝐓𝐀𝐓𝐔𝐒 〕━╮\n┃ 🤍 Envie/responda uma mídia/texto.\n┃ 🩵 \`+status <texto>\`\n╰━━━━━━━━━━━━━━━╯\n"${nomeBot}"` }, { quoted: msg })
        }

        await reagir(sock, msg, "🩵")
        try {
          const { enviarStatus } = require("../status-helper")
          
          await enviarStatus({
            carol: sock,
            from: jid,
            msg,
            text: texto,
            quoted,
            caption: texto,
            linkPreview: true
          })
          
          await sock.sendMessage(jid, { text: `╭━〔 🦋 𝐒𝐓𝐀𝐓𝐔𝐒 〕━╮\n┃ 🤍 Postado com sucesso!\n╰━━━━━━━━━━━━━━━╯\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) {
          await reagir(sock, msg, "❌")
          await sock.sendMessage(jid, { text: `╭━〔 🧊 𝐄𝐑𝐑𝐎 〕━╮\n┃ ☁️ ${e.message}\n╰━━━━━━━━━━━━━━━╯\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    grupos: {
      aliases: ["listagrupos"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const todosGrupos = Object.keys(db.grupos()).filter(g => g.endsWith("@g.us"))
        const todosObj = dbLer("todosgrupos.json", { ativos: [] })
        const ativos = todosObj.ativos || []

        if (!todosGrupos.length) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐆𝐑𝐔𝐏𝐎𝐒 〕━╮\n┃ 🤍 Nenhum grupo salvo.\n╰━━━━━━━━━━━━━━━╯\n"${nomeBot}"` }, { quoted: msg })
        }

        await reagir(sock, msg, "🩵")
        const nomesDb = dbLer("nomes_grupos.json", {})
        let txt = `╭━〔 ☁️ 𝐆𝐑𝐔𝐏𝐎𝐒 〕━╮\n`
        txt += `┃ 🩵 Total: ${todosGrupos.length}\n`
        txt += `┃ 🤍 Ativos: ${todosGrupos.filter(g => ativos.includes(g)).length}\n╰━━━━━━━━━━━━━━━╯\n\n`

        let mudouCache = false
        for (let i = 0; i < todosGrupos.length; i++) {
          const grupoJid = todosGrupos[i]
          let nomeG = nomesDb[grupoJid] || null
          if (!nomeG) {
            try { 
              const meta = await sock.groupMetadata(grupoJid); 
              if (meta && meta.subject) {
                nomeG = meta.subject 
                nomesDb[grupoJid] = nomeG
                mudouCache = true
              }
            } catch (_) { nomeG = "⚠️ Sem acesso" }
            await new Promise(r => setTimeout(r, 350))
          }
          const taAtivo = ativos.includes(grupoJid)
          const emoji = taAtivo ? "🩵" : "❌"
          txt += `🧊 ${i + 1}. ${nomeG} ${emoji}\n`
        }

        if (mudouCache) dbSalvar("nomes_grupos.json", nomesDb)
        txt += `\n🤍 _"Use +addgp <nº>"_\n\n"${nomeBot}"`
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    addgp: {
      aliases: ["addgrupo", "ativargp"],
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        if (!args.length) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐀𝐃𝐃𝐆𝐏 〕━╮\n┃ 🤍 Use: \`${p}addgp 1 2\`\n╰━━━━━━━━━━━━━━━╯\n"${nomeBot}"` }, { quoted: msg })
        }

        const todosGrupos = Object.keys(db.grupos()).filter(g => g.endsWith("@g.us"))
        const todosObj = dbLer("todosgrupos.json", { ativos: [] })
        let ativos = todosObj.ativos || []
        const adicionados = []
        const erros = []

        for (const arg of args) {
          const num = parseInt(arg)
          if (!num || num < 1 || num > todosGrupos.length) { erros.push(`${arg}`); continue }
          const grupoJid = todosGrupos[num - 1]
          if (!ativos.includes(grupoJid)) { ativos.push(grupoJid); adicionados.push(num) }
        }

        todosObj.ativos = ativos
        dbSalvar("todosgrupos.json", todosObj)
        await reagir(sock, msg, "🩵")

        let texto = `╭━〔 🩵 𝐀𝐃𝐃𝐆𝐏 〕━╮\n`
        if (adicionados.length > 0) texto += `┃ 🤍 Add: ${adicionados.join(", ")}\n`
        if (erros.length > 0) texto += `┃ ❌ Erros: ${erros.join(", ")}\n`
        texto += `┃ 🧊 Total: ${ativos.length}\n╰━━━━━━━━━━━━━━━╯\n"${nomeBot}"`
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    removergp: {
      aliases: ["removergrupo", "desativargp", "rmgp"],
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        if (!args.length) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐑𝐌𝐆𝐏 〕━╮\n┃ 🤍 Use: \`${p}removergp 1\`\n╰━━━━━━━━━━━━━━━╯\n"${nomeBot}"` }, { quoted: msg })
        }

        const todosGrupos = Object.keys(db.grupos()).filter(g => g.endsWith("@g.us"))
        const todosObj = dbLer("todosgrupos.json", { ativos: [] })
        let ativos = todosObj.ativos || []
        const removidos = []
        const erros = []

        for (const arg of args) {
          const num = parseInt(arg)
          if (!num || num < 1 || num > todosGrupos.length) { erros.push(`${arg}`); continue }
          const grupoJid = todosGrupos[num - 1]
          if (ativos.includes(grupoJid)) { ativos = ativos.filter(g => g !== grupoJid); removidos.push(num) }
        }

        todosObj.ativos = ativos
        dbSalvar("todosgrupos.json", todosObj)
        await reagir(sock, msg, "🩵")

        let texto = `╭━〔 🩵 𝐑𝐌𝐆𝐏 〕━╮\n`
        if (removidos.length > 0) texto += `┃ 🤍 Removidos: ${removidos.join(", ")}\n`
        if (erros.length > 0) texto += `┃ ❌ Erros: ${erros.join(", ")}\n`
        texto += `┃ 🧊 Total: ${ativos.length}\n╰━━━━━━━━━━━━━━━╯\n"${nomeBot}"`
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    addtodos: {
      aliases: ["ativartodos"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const todosGrupos = Object.keys(db.grupos()).filter(g => g.endsWith("@g.us"))
        const todosObj = dbLer("todosgrupos.json", { ativos: [] })
        todosObj.ativos = todosGrupos
        dbSalvar("todosgrupos.json", todosObj)
        await reagir(sock, msg, "🩵")
        await sock.sendMessage(jid, { text: `╭━〔 🧊 𝐀𝐃𝐃𝐓𝐎𝐃𝐎𝐒 〕━╮\n┃ 🤍 Todos (${todosGrupos.length}) foram ativados.\n╰━━━━━━━━━━━━━━━╯\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    deltodos: {
      aliases: ["desativartodos", "removergrupos"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const todosObj = dbLer("todosgrupos.json", { ativos: [] })
        todosObj.ativos = []
        dbSalvar("todosgrupos.json", todosObj)
        await reagir(sock, msg, "🩵")
        await sock.sendMessage(jid, { text: `╭━〔 🧊 𝐃𝐄𝐋𝐓𝐎𝐃𝐎𝐒 〕━╮\n┃ 🤍 Nenhum grupo receberá.\n╰━━━━━━━━━━━━━━━╯\n"${nomeBot}"` }, { quoted: msg })
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
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐃𝐈𝐕 〕━╮\n┃ 🤍 \`${p}div 10m\` (reply mídia)\n╰━━━━━━━━━━━━━━━╯\n"${nomeBot}"` }, { quoted: msg })
        }

        const ctx = msg.message?.extendedTextMessage?.contextInfo || {}
        const q = ctx.quotedMessage
        const isVideo = q && q.videoMessage
        const isImage = q && q.imageMessage
        const textoLegenda = isVideo ? q.videoMessage.caption : isImage ? q.imageMessage.caption : ""

        if (!isVideo && !isImage) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐃𝐈𝐕 〕━╮\n┃ 🤍 Responda uma mídia.\n╰━━━━━━━━━━━━━━━╯\n"${nomeBot}"` }, { quoted: msg })
        }

        await reagir(sock, msg, "🩵")
        try {
          const alvoMsg = Object.assign({}, msg, { message: isVideo ? { videoMessage: q.videoMessage } : { imageMessage: q.imageMessage } })
          const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          if (buffer.length > 20 * 1024 * 1024) {
            await reagir(sock, msg, "❌")
            return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐄𝐑𝐑𝐎 〕━╮\n┃ ☁️ Máx 20MB.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
          }

          const ms = parseTempo(tempoStr)
          const expiraEm = Date.now() + ms
          const divs = dbLer("divulgacoes.json", { lista: [] })
          divs.lista = divs.lista || []
          const novaDiv = { id: Date.now(), tipo: isVideo ? "video" : "image", buffer: buffer.toString("base64"), legenda: textoLegenda || "", expiraEm: expiraEm, criadoEm: Date.now() }
          divs.lista.push(novaDiv)
          dbSalvar("divulgacoes.json", divs)

          await sock.sendMessage(jid, { text: `╭━〔 🩵 𝐃𝐈𝐕 𝐒𝐀𝐋𝐕𝐀 〕━╮\n┃ 🤍 Expira em: ${formatarTempo(ms)}\n╰━━━━━━━━━━━━━━━╯\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) {
          await reagir(sock, msg, "❌")
          await sock.sendMessage(jid, { text: `╭━〔 🧊 𝐄𝐑𝐑𝐎 〕━╮\n┃ ☁️ ${e.message}\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
        }
      }
    },

    listadiv: {
      aliases: ["listadivulgacao", "verdivs"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const divs = dbLer("divulgacoes.json", { lista: [] })
        const ativas = (divs.lista || []).filter(d => d.expiraEm > Date.now())

        if (!ativas.length) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐋𝐈𝐒𝐓𝐀 〕━╮\n┃ 🤍 Nenhuma ativa.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
        }

        await reagir(sock, msg, "🩵")
        for (let i = 0; i < ativas.length; i++) {
          const d = ativas[i]
          const tempoRestante = formatarTempo(d.expiraEm - Date.now())
          const tipo = d.tipo === "video" ? "🎥 Vídeo" : "🖼️ Imagem"
          await sock.sendMessage(jid, { text: `╭━〔 🩵 𝐃𝐈𝐕 #${i + 1} 〕━╮\n┃ ☁️ Tipo: ${tipo}\n┃ 🤍 Tempo: ${tempoRestante}\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
          await new Promise(r => setTimeout(r, 1000))
        }
      }
    },

    apagardiv: {
      aliases: ["deldiv", "rmdiv"],
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const num = parseInt(args[0])
        if (!num || num < 1) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐀𝐏𝐀𝐆𝐀𝐑 〕━╮\n┃ 🤍 \`${p}apagardiv 1\`\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
        }

        const divs = dbLer("divulgacoes.json", { lista: [] })
        const ativas = (divs.lista || []).filter(d => d.expiraEm > Date.now())
        if (num > ativas.length) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐄𝐑𝐑𝐎 〕━╮\n┃ ☁️ Número inválido.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
        }

        const divApagar = ativas[num - 1]
        divs.lista = divs.lista.filter(d => d.id !== divApagar.id)
        dbSalvar("divulgacoes.json", divs)
        await reagir(sock, msg, "🩵")
        await sock.sendMessage(jid, { text: `╭━〔 🩵 𝐀𝐏𝐀𝐆𝐀𝐃𝐀 〕━╮\n┃ 🤍 Div #${num} removida.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
      }
    },

    intervalo: {
      aliases: ["setintervalo", "tempociclo"],
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const tempoStr = args[0]?.toLowerCase()
        if (!tempoStr || !/^\d+(s|m|h|d)$/.test(tempoStr)) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐈𝐍𝐓𝐄𝐑𝐕𝐀𝐋𝐎 〕━╮\n┃ 🤍 \`${p}intervalo 50m\`\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
        }
        const ms = parseTempo(tempoStr)
        const cfg = db.config()
        cfg.intervaloDiv = ms
        db.salvarConfig(cfg)
        await reagir(sock, msg, "🩵")
        await sock.sendMessage(jid, { text: `╭━〔 🩵 𝐈𝐍𝐓𝐄𝐑𝐕𝐀𝐋𝐎 〕━╮\n┃ 🤍 Alterado: ${tempoStr}\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
      }
    },

    iniciardv: {
      aliases: ["startdiv", "enviardv"],
      async executar({ sock, msg, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const divs = dbLer("divulgacoes.json", { lista: [] })
        const ativas = (divs.lista || []).filter(d => d.expiraEm > Date.now())
        if (!ativas.length) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐄𝐑𝐑𝐎 〕━╮\n┃ 🤍 Nenhuma div ativa.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
        }
        const todosObj = dbLer("todosgrupos.json", { ativos: [] })
        let grupos = todosObj.ativos || []
        if (grupos.length === 0) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐄𝐑𝐑𝐎 〕━╮\n┃ 🤍 Nenhum grupo ativo.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
        }

        if (global.dvRodando) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐀𝐕𝐈𝐒𝐎 〕━╮\n┃ 🤍 Já está rodando.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
        }

        await reagir(sock, msg, "🩵")
        const intervalo = db.config().intervaloDiv || 1800000
        await sock.sendMessage(jid, { text: `╭━〔 🩵 𝐈𝐍𝐈𝐂𝐈𝐀𝐍𝐃𝐎 〕━╮\n┃ ☁️ Grupos: ${grupos.length}\n┃ 🤍 Divs: ${ativas.length}\n┃ 🧊 Intervalo: ${formatarTempo(intervalo)}\n╰━━━━━━━━━━━━━━━╯\n"${nomeBot}"` }, { quoted: msg })

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
            if (!ativasAgora.length) {
              global.dvRodando = false
              if (global.dvTimeout) { clearTimeout(global.dvTimeout); global.dvTimeout = null }
              return logLoopEncerrado("Nenhuma divulgação ativa", { divAtivas: 0, ...stats })
            }

            const todosAgora = dbLer("todosgrupos.json", { ativos: [] })
            const gruposAgora = todosAgora.ativos || []
            if (!gruposAgora.length) {
              global.dvRodando = false
              if (global.dvTimeout) { clearTimeout(global.dvTimeout); global.dvTimeout = null }
              return logLoopEncerrado("Nenhum grupo ativo", { divAtivas: ativasAgora.length, grupos: 0, ...stats })
            }

            for (const grupo of gruposAgora) {
              if (!global.dvRodando) return
              for (const d of ativasAgora) {
                if (!global.dvRodando) return
                if (d.expiraEm <= Date.now()) continue

                const buffer = Buffer.from(d.buffer, "base64")
                const linkCanal = db.canal()?.link || ""
                const legendaFinal = `${d.legenda || ""}\n\n${linkCanal ? `🩵 *Canal:* ${linkCanal}` : ""}`.trim()

                try {
                  if (d.tipo === "video") await sock.sendMessage(grupo, { video: buffer, caption: legendaFinal, gifPlayback: false, mimetype: "video/mp4" })
                  else await sock.sendMessage(grupo, { image: buffer, caption: legendaFinal })
                  stats.enviados++
                } catch (err) {
                  stats.falhas++
                }
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
            global.dvTimeout = null
            global.dvProximoCiclo = null
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
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        global.dvRodando = false
        if (global.dvTimeout) { clearTimeout(global.dvTimeout); global.dvTimeout = null }
        global.dvProximoCiclo = null
        await reagir(sock, msg, "🧊")
        await sock.sendMessage(jid, { text: `╭━〔 🧊 𝐏𝐀𝐑𝐀𝐃𝐎 〕━╮\n┃ 🤍 Loop encerrado.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
      }
    },

    estado: {
      aliases: ["status", "statusdiv", "estadodiv", "infodiv"],
      async executar({ sock, msg, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        await reagir(sock, msg, "🩵")
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

        let blocoDivs = divsAtivas.length === 0 ? `🐍 _Nenhuma ativa_\n` : ""
        divsAtivas.forEach((d, i) => {
          const restante = formatarTempo(d.expiraEm - agora)
          blocoDivs += `┃ 🧊 ${i + 1}. ${d.tipo} - ${restante}\n`
        })

        const blocoGrupos = gruposAtivos.length === 0 ? `┃ 🐍 _Nenhum grupo_\n` : `┃ 🤍 Total: ${gruposAtivos.length}\n`
        let blocoProximo = ""
        if (!rodando) blocoProximo = `┃ 🤍 _Loop parado_\n`
        else if (!temTimer) blocoProximo = `┃ ☁️ _Em execução..._\n`
        else {
          const proximo = global.dvProximoCiclo || (agora + intervalo)
          const falta = Math.max(0, proximo - agora)
          blocoProximo = `┃ 🩵 Falta: ${formatarTempo(falta)}\n`
        }

        const texto = `╭━〔 ☁️ 𝐄𝐒𝐓𝐀𝐃𝐎 〕━╮
┃ 🧊 Status: ${emojiStatus} ${txtStatus}
┃ 🤍 Timer: ${temTimer ? "✅" : "❌"}
╰━━━━━━━━━━━━━━━╯

╭━〔 🩵 𝐃𝐈𝐕𝐔𝐋𝐆𝐀𝐂̧𝐎̃𝐄𝐒 〕━╮
${blocoDivs}╰━━━━━━━━━━━━━━━━━╯

╭━〔 🤍 𝐆𝐑𝐔𝐏𝐎𝐒 〕━╮
${blocoGrupos}╰━━━━━━━━━━━━━━━╯

╭━〔 🧊 𝐏𝐑𝐎́𝐗𝐈𝐌𝐎 〕━╮
${blocoProximo}╰━━━━━━━━━━━━━━━╯
"${nomeBot}"`

        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    audiomenu: {
      aliases: ["addaudio", "setaudio"],
      async executar({ sock, msg, db, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const ctx = msg.message?.extendedTextMessage?.contextInfo || {}
        const quoted = ctx.quotedMessage
        const temAudio = quoted && (quoted.audioMessage || quoted.ptvMessage)
        if (!temAudio) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐀𝐔𝐃𝐈𝐎𝐌𝐄𝐍𝐔 〕━╮\n┃ 🤍 Responda um áudio.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
        await reagir(sock, msg, "🩵")
        try {
          const alvoMsg = Object.assign({}, msg, { message: { audioMessage: quoted.audioMessage || quoted.ptvMessage } })
          const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          const cfg = db.config()
          cfg.audioMenu = buffer.toString("base64")
          db.salvarConfig(cfg)
          await sock.sendMessage(jid, { text: `╭━〔 🩵 𝐀𝐔𝐃𝐈𝐎 𝐒𝐀𝐋𝐕𝐎 〕━╮\n┃ 🤍 O áudio será enviado nos menus.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "❌"); await sock.sendMessage(jid, { text: `╭━〔 🧊 𝐄𝐑𝐑𝐎 〕━╮\n┃ ☁️ ${e.message}\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
      }
    },

    rmaudio: {
      aliases: ["delaudio", "removeraudio"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const cfg = db.config()
        if (!cfg.audioMenu) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐑𝐌𝐀𝐔𝐃𝐈𝐎 〕━╮\n┃ 🤍 Não tem áudio.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
        cfg.audioMenu = null
        db.salvarConfig(cfg)
        await reagir(sock, msg, "🩵")
        await sock.sendMessage(jid, { text: `╭━〔 🩵 𝐀𝐔𝐃𝐈𝐎 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐎 〕━╮\n┃ 🤍 Áudio removido dos menus.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
      }
    },

    teste: {
      aliases: ["json", "debugmsg", "verbot"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const ctx = (msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo) || {}
        const quoted = ctx.quotedMessage
        if (!quoted) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐓𝐄𝐒𝐓𝐄 〕━╮\n┃ 🤍 Responda uma mensagem.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
        await reagir(sock, msg, "🩵")
        const info = { key: { remoteJid: jid, fromMe: false, id: ctx.stanzaId || "", participant: ctx.participant || "" }, messageTimestamp: msg.messageTimestamp, pushName: msg.pushName || "", broadcast: false, message: quoted }
        const jsonStr = JSON.stringify(info, null, 3)
        const pedacos = []; const tamanhoMax = 3900
        for (let i = 0; i < jsonStr.length; i += tamanhoMax) pedacos.push(jsonStr.slice(i, i + tamanhoMax))
        await sock.sendMessage(jid, { text: `╭━〔 🩵 𝐉𝐒𝐎𝐍 〕━╮\n┃ 🤍 Debug\n╰━━━━━━━━━━━━━━━╯\n\`\`\`json\n${pedacos[0]}\`\`\`` }, { quoted: msg })
        for (let i = 1; i < pedacos.length; i++) await sock.sendMessage(jid, { text: `\`\`\`json\n${pedacos[i]}\`\`\`` }, { quoted: msg })
      }
    },

    testa: {
      aliases: ["fakereply", "forcarmsg"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const alvo = utils.getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐓𝐄𝐒𝐓𝐀 〕━╮\n┃ 🤍 Marque alguém.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
        await reagir(sock, msg, "🩵")
        try { await sock.sendMessage(jid, { text: "🧊 A maid observa... 🤍", mentions: [alvo] }) } catch (_) {}
      }
    },

    get: {
      aliases: ["pegar", "getcase", "copiar"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        let nomeComando = args[0] ? args[0].toLowerCase().replace(/[^a-z0-9]/g, "") : ""
        const ctx = msg.message?.extendedTextMessage?.contextInfo || {}
        const quoted = ctx.quotedMessage
        if (!quoted) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐆𝐄𝐓 〕━╮\n┃ 🤍 Responda uma mensagem.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
        const textoResposta = quoted.conversation || (quoted.extendedTextMessage && quoted.extendedTextMessage.text) || (quoted.imageMessage && quoted.imageMessage.caption) || (quoted.videoMessage && quoted.videoMessage.caption) || ""
        if (!textoResposta) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐆𝐄𝐓 〕━╮\n┃ 🤍 Sem texto.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
        if (!nomeComando) { const primeiraPalavra = textoResposta.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, ""); nomeComando = primeiraPalavra || "comando_novo" }
        await reagir(sock, msg, "🩵")
        const textoEscapado = textoResposta.replace(/`/g, "\\`").replace(/\$/g, "\\$")
        const bloco = `comando_${nomeComando}: {\n  aliases: [],\n  async executar({ sock, msg, prefixoAtivo }) {\n    await sock.sendMessage(msg.key.remoteJid, { text: \`${textoEscapado}\` }, { quoted: msg })\n  }\n}`
        await sock.sendMessage(jid, { text: `╭━〔 🩵 𝐂𝐎𝐌𝐀𝐍𝐃𝐎 〕━╮\n┃ 🤍 Cole no menu-vip\n╰━━━━━━━━━━━━━━━╯\n\`\`\`javascript\n${bloco}\n\`\`\`` }, { quoted: msg })
      }
    },

    googlevoz: {
      aliases: ["tts", "falar", "googlevoice"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const textoFinal = args.join(" ").trim()
        if (!textoFinal) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐓𝐓𝐒 〕━╮\n┃ 🤍 Digite o texto.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
        if (textoFinal.length > 200) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐓𝐄𝐗𝐓𝐎 𝐋𝐎𝐍𝐆𝐎 〕━╮\n┃ 🤍 Máx 200 caracteres.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
        await reagir(sock, msg, "🩵")
        try {
          await sock.sendMessage(jid, { text: `╭━〔 🩵 𝐆𝐄𝐑𝐀𝐍𝐃𝐎 〕━╮\n┃ 🤍 Gerando voz...\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
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
          try { fs.unlinkSync(tIn); } catch (_) {}
          try { fs.unlinkSync(tOut); } catch (_) {}
          await sock.sendMessage(jid, { audio: bufferOgg, mimetype: "audio/ogg; codecs=opus", ptt: true }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "❌"); await sock.sendMessage(jid, { text: `╭━〔 🧊 𝐄𝐑𝐑𝐎 〕━╮\n┃ ☁️ ${e.message}\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
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
        if (numerosDono.length) numerosDono.forEach((n) => { numerosTxt += `┃ 🦋 +${n}\n` })
        else numerosTxt = "┃ 🤍 _não configurado_\n"
        await reagir(sock, msg, "🩵")
        await sock.sendMessage(jid, { text: `╭━〔 🧊 𝐃𝐎𝐍𝐎 〕━╮\n┃ 🩵 ${nomeBot}\n${numerosTxt}┃ ☁️ Prefixo: ${prefixo}\n┃ 🤍 Horário: ${hora} — ${data}\n╰━━━━━━━━━━━━━━━╯\n"${nomeBot}"`, mentions }, { quoted: msg })
      }
    },

    atualizar: {
      aliases: ["update", "git"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        await reagir(sock, msg, "🩵")
        const sent = await sock.sendMessage(jid, { text: `╭━〔 🧊 𝐀𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐍𝐃𝐎 〕━╮\n┃ 🤍 Buscando no GitHub...\n┃ ☁️ [░░░░░░░░░░] 0%\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
        const atualizarProgresso = async (pct, titulo, msg2) => {
          const cheios = Math.floor(pct / 10); const barra = "🩵".repeat(cheios) + "⬛".repeat(10 - cheios)
          try { await sock.sendMessage(jid, { text: `╭━〔 🧊 ${titulo} 〕━╮\n┃ ☁️ ${msg2}\n┃ 🤍 [${barra}] ${pct}%\n╰━━━━━━━━━━━━━━━╯`, edit: sent.key }) } catch (_) {}
        }
        let zipPath, extractDir
        try {
          await new Promise(r => setTimeout(r, 800))
          await atualizarProgresso(15, "📡 VERIFICANDO", "Buscando commit...")
          if (!fs.existsSync(DATA_DIR)) { try { fs.mkdirSync(DATA_DIR, { recursive: true }) } catch (e) {} }
          const apiResp = await fetch(REPO_API, { headers: { "User-Agent": "ObanaiBot" } })
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
            return sock.sendMessage(jid, { text: `╭━〔 🩵 𝐄𝐌 𝐃𝐈𝐀 〕━╮\n┃ 🤍 Versão atual: V${versaoAtual}\n┃ ☁️ ${commitHash.slice(0, 7)}\n╰━━━━━━━━━━━━━━━╯`, edit: sent.key })
          }
          const versaoNova = versaoAtual + 1
          const cat = categorizarCommit(commitMsg)
          await atualizarProgresso(45, "🔥 NOVA VERSÃO", `V${versaoAtual} → V${versaoNova}`)
          await new Promise(r => setTimeout(r, 700))
          await atualizarProgresso(60, "📥 BAIXANDO", "Baixando...")
          const tmp = os.tmpdir(); const id = Date.now()
          zipPath = path.join(tmp, "obanai_" + id + ".zip"); extractDir = path.join(tmp, "obanai_" + id)
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
          await sock.sendMessage(jid, { text: `╭━〔 🩵 𝐀𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐃𝐎 〕━╮\n┃ 🧊 V${versaoAtual} → V${versaoNova}\n┃ 🤍 ${commitMsg}\n┃ ☁️ ${formatarDataHora(commitData)}\n╰━━━━━━━━━━━━━━━╯\nReiniciando...`, edit: sent.key })
          await new Promise(r => setTimeout(r, 3000))
          process.exit(0)
        } catch (e) {
          try { if (zipPath) fs.unlinkSync(zipPath) } catch (_) {}
          try { if (extractDir) fs.rmSync(extractDir, { recursive: true, force: true }) } catch (_) {}
          await reagir(sock, msg, "❌")
          await sock.sendMessage(jid, { text: `╭━〔 🧊 𝐅𝐀𝐋𝐇𝐀 〕━╮\n┃ ☁️ ${e.message}\n╰━━━━━━━━━━━━━━━╯`, edit: sent.key })
        }
      }
    },

    nomebot: {
      aliases: ["setnomebot", "nomedobot"],
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const novoNome = args.join(" ").trim()
        if (!novoNome) { const cfg = db.config(); await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐍𝐎𝐌𝐄 〕━╮\n┃ 🤍 Atual: ${cfg.nomeBot || "Obanai"}\n┃ ☁️ \`${p}nomebot <nome>\`\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
        if (novoNome.length > 20) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐍𝐎𝐌𝐄 𝐋𝐎𝐍𝐆𝐎 〕━╮\n┃ 🤍 Máx 20 caracteres.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
        const cfg = db.config(); cfg.nomeBot = novoNome; db.salvarConfig(cfg)
        global.__nomeBotCache = null
        await reagir(sock, msg, "🩵")
        await sock.sendMessage(jid, { text: `╭━〔 🩵 𝐍𝐎𝐌𝐄 〕━╮\n┃ 🤍 Alterado: ${novoNome}\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
      }
    },

    reload: {
      aliases: ["recarregar", "reloadmenus"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        await reagir(sock, msg, "🩵")
        try {
          if (typeof global.__carregarMenus === "function") {
            global.__carregarMenus()
            global.__nomeBotCache = null
            const total = global.totalComandos || 0
            await sock.sendMessage(jid, { text: `╭━〔 🩵 𝐑𝐄𝐂𝐀𝐑𝐑𝐄𝐆𝐀𝐃𝐎 〕━╮\n┃ 🤍 Menus atualizados.\n┃ ☁️ ${total} comandos\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
          } else {
            await sock.sendMessage(jid, { text: `╭━〔 🧊 𝐄𝐑𝐑𝐎 〕━╮\n┃ 🤍 Use \`+reiniciar\`\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
          }
        } catch (e) { await reagir(sock, msg, "❌"); await sock.sendMessage(jid, { text: `╭━〔 🧊 𝐄𝐑𝐑𝐎 〕━╮\n┃ ☁️ ${e.message}\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
      }
    },

    reiniciar: {
      aliases: ["restart"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        await reagir(sock, msg, "🩵")
        try {
          await sock.sendMessage(jid, { text: `╭━〔 🧊 𝐑𝐄𝐈𝐍𝐈𝐂𝐈𝐀𝐍𝐃𝐎 〕━╮\n┃ 🤍 Aguardem...\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
          await new Promise(r => setTimeout(r, 3000))
          process.exit(0)
        } catch (e) { await reagir(sock, msg, "❌"); await sock.sendMessage(jid, { text: `╭━〔 🧊 𝐄𝐑𝐑𝐎 〕━╮\n┃ ☁️ ${e.message}\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
      }
    },

    entrar: {
      aliases: ["entrargp", "join", "joinlink"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const link = args[0]
        if (!link) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐄𝐍𝐓𝐑𝐀𝐑 〕━╮\n┃ 🤍 Informe o link.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
        const match = link.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/)
        if (!match) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐋𝐈𝐍𝐊 𝐈𝐍𝐕𝐀́𝐋𝐈𝐃𝐎 〕━╮\n┃ 🤍 Não é link de grupo.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
        await reagir(sock, msg, "🩵")
        try { await sock.sendMessage(jid, { text: `╭━〔 🧊 𝐄𝐍𝐓𝐑𝐀𝐍𝐃𝐎 〕━╮\n┃ 🤍 Entrando...\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }); const info = await sock.groupAcceptInvite(match[1]); await sock.sendMessage(jid, { text: `╭━〔 🩵 𝐄𝐍𝐓𝐑𝐄𝐈 〕━╮\n┃ 🤍 Mais um território.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
        catch (e) { await reagir(sock, msg, "❌"); await sock.sendMessage(jid, { text: `╭━〔 🧊 𝐄𝐑𝐑𝐎 〕━╮\n┃ ☁️ ${e.message}\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
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
        if (!temImg && !temVid) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐒𝐄𝐓𝐅𝐎𝐓𝐎 〕━╮\n┃ 🤍 Envie/responda imagem/vídeo.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
        await reagir(sock, msg, "🩵")
        try {
          const cfg = db.config()
          if (temImg) {
            const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage || quoted.viewOnceMessage?.message?.imageMessage || quoted.viewOnceMessageV2?.message?.imageMessage } })
            const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
            cfg.fotoMenu = buffer.toString("base64"); cfg.tipoMenu = "foto"; db.salvarConfig(cfg)
            return sock.sendMessage(jid, { image: buffer, caption: `╭━〔 🩵 𝐅𝐎𝐓𝐎 〕━╮\n┃ 🤍 Salva no menu.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
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
          await sock.sendMessage(jid, { video: outBuffer, mimetype: "video/mp4", fileName: "obanai.mp4", gifPlayback: true, caption: `╭━〔 🩵 𝐕𝐈́𝐃𝐄𝐎 〕━╮\n┃ 🤍 Salvo no menu.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "❌"); await sock.sendMessage(jid, { text: `╭━〔 🧊 𝐄𝐑𝐑𝐎 〕━╮\n┃ ☁️ ${e.message}\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
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
        if (!temImg && !temVid) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐅𝐎𝐓𝐎𝐂𝐌𝐃 〕━╮\n┃ 🤍 Envie/responda imagem/vídeo.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
        await reagir(sock, msg, "🩵")
        try {
          const cfg = db.config()
          if (temImg) {
            const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage || quoted.viewOnceMessage?.message?.imageMessage || quoted.viewOnceMessageV2?.message?.imageMessage } })
            const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
            cfg.fotoCmd = buffer.toString("base64"); cfg.tipoFotoCmd = "foto"; db.salvarConfig(cfg)
            return sock.sendMessage(jid, { image: buffer, caption: `╭━〔 🩵 𝐅𝐎𝐓𝐎 𝐂𝐌𝐃 〕━╮\n┃ 🤍 Salva no comando.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
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
          await sock.sendMessage(jid, { video: outBuffer, mimetype: "video/mp4", fileName: "obanai.mp4", gifPlayback: true, caption: `╭━〔 🩵 𝐕𝐈́𝐃𝐄𝐎 𝐂𝐌𝐃 〕━╮\n┃ 🤍 Salvo no comando.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "❌"); await sock.sendMessage(jid, { text: `╭━〔 🧊 𝐄𝐑𝐑𝐎 〕━╮\n┃ ☁️ ${e.message}\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
      }
    },

    addvip: {
      aliases: ["darvip", "setvip"],
      async executar({ sock, msg, args, db, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const alvo = utils.getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐀𝐃𝐃𝐕𝐈𝐏 〕━╮\n┃ 🤍 Marque o usuário.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
        const tempo = (args.find(a => /^(inf|\d+[dhm])$/i.test(a)) || "").toLowerCase()
        if (!tempo) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐀𝐃𝐃𝐕𝐈𝐏 〕━╮\n┃ 🤍 Informe o tempo.\n┃ ☁️ 1d / 7d / inf\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
        let expira = "inf"
        if (tempo !== "inf") { const v = parseInt(tempo); const u = tempo.slice(-1); let ms = 0; if (u === "d") ms = v * 24 * 60 * 60 * 1000; if (u === "h") ms = v * 60 * 60 * 1000; if (u === "m") ms = v * 60 * 1000; expira = Date.now() + ms }
        const v = db.vips(); v.vips = v.vips || {}; v.vips[alvo] = { expira, desde: Date.now() }; db.salvarVips(v)
        const num = utils.soNumero(alvo)
        await reagir(sock, msg, "🩵")
        await sock.sendMessage(jid, { text: `╭━〔 🩵 𝐍𝐎𝐁𝐑𝐄 〕━╮\n┃ 🤍 @${num}\n┃ ☁️ Tempo: ${tempo === "inf" ? "ETERNO ♾️" : tempo.toUpperCase()}\n╰━━━━━━━━━━━━━━━╯`, mentions: [alvo] }, { quoted: msg })
      }
    },

    delvip: {
      aliases: ["rmvip", "removervip"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const alvo = utils.getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐃𝐄𝐋𝐕𝐈𝐏 〕━╮\n┃ 🤍 Marque o usuário.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
        const v = db.vips()
        if (!v.vips || !v.vips[alvo]) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐍𝐀̃𝐎 𝐄́ 𝐕𝐈𝐏 〕━╮\n┃ 🤍 @${utils.soNumero(alvo)}\n╰━━━━━━━━━━━━━━━╯`, mentions: [alvo] }, { quoted: msg }) }
        delete v.vips[alvo]; db.salvarVips(v)
        await reagir(sock, msg, "🩵")
        await sock.sendMessage(jid, { text: `╭━〔 🩵 𝐕𝐈𝐏 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐎 〕━╮\n┃ 🤍 @${utils.soNumero(alvo)}\n╰━━━━━━━━━━━━━━━╯`, mentions: [alvo] }, { quoted: msg })
      }
    },

    listavip: {
      aliases: ["vips", "vervips"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const v = db.vips(); const vips = Object.entries(v.vips || {})
        if (!vips.length) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐍𝐈𝐍𝐆𝐔𝐄́𝐌 〕━╮\n┃ 🤍 Sem nobres.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
        let txt = "╭━〔 🩵 𝐋𝐈𝐒𝐓𝐀 𝐕𝐈𝐏 〕━╮\n"; const mentions = []
        vips.forEach(([jidVip, info], i) => { const num = utils.soNumero(jidVip); const expira = info.expira === "inf" ? "♾️" : new Date(info.expira).toLocaleDateString("pt-BR"); txt += `┃ 🤍 ${i + 1}. @${num} — ${expira}\n`; mentions.push(jidVip) })
        txt += `╰━━━━━━━━━━━━━━━╯\n"${nomeBot}"`
        await reagir(sock, msg, "🩵")
        await sock.sendMessage(jid, { text: txt, mentions }, { quoted: msg })
      }
    },

    addsubdono: {
      aliases: ["addsub", "darsub"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const alvo = utils.getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐀𝐃𝐃𝐒𝐔𝐁 〕━╮\n┃ 🤍 Marque o usuário.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
        const cfg = db.config(); cfg.subdonos = cfg.subdonos || []; const num = utils.soNumero(alvo)
        if (cfg.subdonos.some(s => utils.soNumero(s) === num)) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐉𝐀́ 𝐄́ 〕━╮\n┃ 🤍 @${num}\n╰━━━━━━━━━━━━━━━╯`, mentions: [alvo] }, { quoted: msg }) }
        cfg.subdonos.push(alvo); db.salvarConfig(cfg)
        await reagir(sock, msg, "🩵")
        await sock.sendMessage(jid, { text: `╭━〔 🩵 𝐍𝐎𝐕𝐀 𝐋𝐔𝐀 〕━╮\n┃ 🤍 @${num}\n╰━━━━━━━━━━━━━━━╯`, mentions: [alvo] }, { quoted: msg })
      }
    },

    delsubdono: {
      aliases: ["delsub", "rmsub", "rmsubdono"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const alvo = utils.getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐃𝐄𝐋𝐒𝐔𝐁 〕━╮\n┃ 🤍 Marque o usuário.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
        const cfg = db.config(); const num = utils.soNumero(alvo)
        cfg.subdonos = (cfg.subdonos || []).filter(s => utils.soNumero(s) !== num); db.salvarConfig(cfg)
        await reagir(sock, msg, "🩵")
        await sock.sendMessage(jid, { text: `╭━〔 🩵 𝐑𝐄𝐁𝐀𝐈𝐗𝐀𝐃𝐎 〕━╮\n┃ 🤍 @${num}\n╰━━━━━━━━━━━━━━━╯`, mentions: [alvo] }, { quoted: msg })
      }
    },

    listasubdono: {
      aliases: ["subdonos", "listasub"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const cfg = db.config(); const subs = cfg.subdonos || []
        if (!subs.length) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐍𝐈𝐍𝐆𝐔𝐄́𝐌 〕━╮\n┃ 🤍 Sem subs.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
        let txt = "╭━〔 🩵 𝐋𝐔𝐀𝐒 〕━╮\n"; const mentions = []
        subs.forEach((jidS, i) => { txt += `┃ 🤍 ${i + 1}. @${utils.soNumero(jidS)}\n`; mentions.push(jidS) })
        txt += `╰━━━━━━━━━━━━━━━╯\n"${nomeBot}"`
        await reagir(sock, msg, "🩵")
        await sock.sendMessage(jid, { text: txt, mentions }, { quoted: msg })
      }
    },

    prefixoglobal: {
      aliases: ["setprefixoglobal"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const novo = args[0]
        if (!novo || novo.length > 3) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐏𝐑𝐄𝐅𝐈𝐗𝐎 〕━╮\n┃ 🤍 Curto, pf.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
        const cfg = db.config(); cfg.prefixoGlobal = novo; db.salvarConfig(cfg)
        await reagir(sock, msg, "🩵")
        await sock.sendMessage(jid, { text: `╭━〔 🩵 𝐏𝐑𝐄𝐅𝐈𝐗𝐎 〕━╮\n┃ 🤍 Alterado: \`${novo}\`\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
      }
    },

    slow: {
      aliases: ["modolento"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐒𝐋𝐎𝐖 〕━╮\n┃ 🤍 Use on/off.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
        const cfg = db.config(); cfg.slow = opcao === "on"; db.salvarConfig(cfg)
        await reagir(sock, msg, "🩵")
        await sock.sendMessage(jid, { text: `╭━〔 🩵 𝐌𝐎𝐃𝐎 𝐋𝐄𝐍𝐓𝐎 〕━╮\n┃ 🤍 ${opcao.toUpperCase()}\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
      }
    },

    aluguel: {
      aliases: ["modoaluguel", "sistaluguel"],
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase(); const a = db.aluguel()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "🩵"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐀𝐋𝐔𝐆𝐔𝐄𝐋 〕━╮\n┃ 🤍 Status: ${a.ativo ? "ON ✅" : "OFF ❌"}\n┃ ☁️ \`${p}aluguel on/off\`\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
        a.ativo = (opcao === "on"); db.salvarAluguel(a)
        await reagir(sock, msg, "🩵")
        await sock.sendMessage(jid, { text: `╭━〔 🩵 𝐀𝐋𝐔𝐆𝐔𝐄𝐋 〕━╮\n┃ 🤍 Modo: ${opcao.toUpperCase()}\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
      }
    },

    addaluguel: {
      aliases: ["davaluguel", "setaluguel"], grupoOnly: true,
      async executar({ sock, msg, args, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const tempoStr = args.join(" ").trim().toLowerCase()
        if (!tempoStr) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐀𝐃𝐃𝐀𝐋𝐔𝐆𝐔𝐄𝐋 〕━╮\n┃ 🤍 Informe o tempo.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
        const partes = tempoStr.split(/\s+/); let totalMs = 0
        for (const part of partes) { const m = part.match(/^(\d+)(min|h|dia|d|sem|mes|ano)$/); if (!m) continue; const v = parseInt(m[1]); const u = m[2]; let ms = 0; if (u === "min") ms = v * 60 * 1000; else if (u === "h") ms = v * 60 * 60 * 1000; else if (u === "d" || u === "dia") ms = v * 24 * 60 * 60 * 1000; else if (u === "sem") ms = v * 7 * 24 * 60 * 60 * 1000; else if (u === "mes") ms = v * 30 * 24 * 60 * 60 * 1000; else if (u === "ano") ms = v * 365 * 24 * 60 * 60 * 1000; totalMs += ms }
        if (totalMs <= 0) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐄𝐑𝐑𝐎 〕━╮\n┃ 🤍 Formato inválido.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
        const a = db.aluguel(); a.grupos = a.grupos || {}; const agora = Date.now(); const atual = (a.grupos[jid] > agora) ? a.grupos[jid] : agora
        a.grupos[jid] = atual + totalMs; if (!a.ativo) a.ativo = true; db.salvarAluguel(a)
        await reagir(sock, msg, "🩵")
        await sock.sendMessage(jid, { text: `╭━〔 🩵 𝐀𝐋𝐔𝐆𝐔𝐄𝐋 〕━╮\n┃ 🤍 Expira em ${utils.formatarTempo(a.grupos[jid] - agora)}\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
      }
    },

    listaaluguel: {
      aliases: ["alugueis", "veralugueis"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const a = db.aluguel(); const agora = Date.now()
        const entradas = Object.entries(a.grupos || {}).filter(e => e[1] > agora)
        if (!entradas.length) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐍𝐀𝐃𝐀 〕━╮\n┃ 🤍 Vazio.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
        let txt = "╭━〔 🩵 𝐀𝐋𝐔𝐆𝐀𝐃𝐎𝐒 〕━╮\n"
        for (const [jidG, exp] of entradas) { try { const meta = await sock.groupMetadata(jidG); txt += `┃ 🤍 ${meta.subject || "?"} — ${utils.formatarTempo(exp - agora)}\n` } catch (_) { txt += `┃ 🤍 \`${jidG}\` — ${utils.formatarTempo(exp - agora)}\n` } }
        txt += `╰━━━━━━━━━━━━━━━╯\n"${nomeBot}"`
        await reagir(sock, msg, "🩵")
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    delaluguel: {
      aliases: ["rmaluguel", "removeraluguel"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const a = db.aluguel(); a.grupos = a.grupos || {}
        if (!args.length && jid.endsWith("@g.us")) {
          if (!a.grupos[jid]) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐒𝐄𝐌 𝐀𝐋𝐔𝐆𝐔𝐄𝐋 〕━╮\n┃ 🤍 Vazio.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
          delete a.grupos[jid]; db.salvarAluguel(a); await reagir(sock, msg, "🩵")
          return sock.sendMessage(jid, { text: `╭━〔 🩵 𝐋𝐈𝐁𝐄𝐑𝐓𝐀𝐃𝐎 〕━╮\n┃ 🤍 Aluguel removido.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
        }
        await reagir(sock, msg, "❌")
        await sock.sendMessage(jid, { text: `╭━〔 🧊 𝐃𝐄𝐋𝐀𝐋𝐔𝐆𝐔𝐄𝐋 〕━╮\n┃ 🤍 Use em grupo.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
      }
    },

    banirgp: {
      aliases: ["bangp", "banirgrupo"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const b = db.bangp(); b.grupos = b.grupos || {}; b.grupos[jid] = true; db.salvarBangp(b)
        await reagir(sock, msg, "🩵")
        await sock.sendMessage(jid, { text: `╭━〔 🧊 𝐁𝐀𝐍𝐈𝐃𝐎 〕━╮\n┃ 🤍 Meus olhos não querem ver vocês.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
      }
    },

    desbanirgp: {
      aliases: ["desbangp"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const b = db.bangp()
        if (b.grupos && b.grupos[jid]) { delete b.grupos[jid]; db.salvarBangp(b); await reagir(sock, msg, "🩵"); return sock.sendMessage(jid, { text: `╭━〔 🩵 𝐋𝐈𝐁𝐄𝐑𝐀𝐃𝐎 〕━╮\n┃ 🤍 Perdoado... uma vez.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
        await reagir(sock, msg, "❌")
        await sock.sendMessage(jid, { text: `╭━〔 🧊 𝐍𝐀̃𝐎 𝐁𝐀𝐍𝐈𝐃𝐎 〕━╮\n┃ 🤍 Não presta atenção.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
      }
    },

    listabangp: {
      aliases: ["gruposbanidos"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const b = db.bangp(); const grupos = Object.keys(b.grupos || {})
        if (!grupos.length) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐍𝐀𝐃𝐀 〕━╮\n┃ 🤍 Por enquanto.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }
        let txt = "╭━〔 🩵 𝐁𝐀𝐍𝐈𝐃𝐎𝐒 〕━╮\n"; grupos.forEach((g, i) => { txt += `┃ 🤍 ${i + 1}. \`${g}\`\n` }); txt += `╰━━━━━━━━━━━━━━━╯\n"${nomeBot}"`
        await reagir(sock, msg, "🩵")
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    nuke: {
      aliases: ["explodir", "destruir"],
      async executar({ sock, msg, groupMetadata, utils, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        if (!jid.endsWith("@g.us")) return
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐏𝐑𝐄𝐂𝐈𝐒𝐎 𝐀𝐃𝐌 〕━╮\n┃ 🤍 Promova o bot.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }

        const chave = jid + "_nuke"
        if (!confirmacoesPendentes.has(chave)) {
          confirmacoesPendentes.set(chave, Date.now())
          setTimeout(() => confirmacoesPendentes.delete(chave), 60000)
          await reagir(sock, msg, "🩵")
          return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐍𝐔𝐊𝐄 〕━╮\n┃ 🤍 Remove TODOS os membros.\n┃ ☁️ Confirme: \`${p}nuke confirmar\`\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
        }
        if (!msg.message?.extendedTextMessage?.text?.toLowerCase().includes("confirmar")) {
          confirmacoesPendentes.delete(chave)
          return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐂𝐀𝐍𝐂𝐄𝐋𝐀𝐃𝐎 〕━╮\n┃ 🤍 Abortado.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
        }
        confirmacoesPendentes.delete(chave)

        await reagir(sock, msg, "🩵")
        await sock.sendMessage(jid, { text: `╭━〔 🩵 𝐍𝐔𝐊𝐄 〕━╮\n┃ 🤍 Não olhe pra trás.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
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

    limpargp: {
      aliases: ["limpargrupo"],
      async executar({ sock, msg, groupMetadata, utils, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        if (!jid.endsWith("@g.us")) return
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐏𝐑𝐄𝐂𝐈𝐒𝐎 𝐀𝐃𝐌 〕━╮\n┃ 🤍 Promova o bot.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg }) }

        const chave = jid + "_limpar"
        if (!confirmacoesPendentes.has(chave)) {
          confirmacoesPendentes.set(chave, Date.now())
          setTimeout(() => confirmacoesPendentes.delete(chave), 60000)
          await reagir(sock, msg, "🩵")
          return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐋𝐈𝐌𝐏𝐄𝐙𝐀 〕━╮\n┃ 🤍 Remove membros comuns.\n┃ ☁️ Confirme: \`${p}limpargp confirmar\`\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
        }
        if (!msg.message?.extendedTextMessage?.text?.toLowerCase().includes("confirmar")) {
          confirmacoesPendentes.delete(chave)
          return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐂𝐀𝐍𝐂𝐄𝐋𝐀𝐃𝐎 〕━╮\n┃ 🤍 Abortado.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
        }
        confirmacoesPendentes.delete(chave)

        await reagir(sock, msg, "🩵")
        await sock.sendMessage(jid, { text: `╭━〔 🩵 𝐋𝐈𝐌𝐏𝐄𝐙𝐀 〕━╮\n┃ 🤍 O silêncio observa.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
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
      aliases: ["setmax", "configenvio"],
      grupoOnly: true,
      async executar({ sock, msg, args, db, isDono }) {
        const jid = msg.key.remoteJid
        if (!isDono) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐀𝐕𝐈𝐒𝐎 〕━╮\n┃ 🤍 Apenas o dono.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
        }

        const qtd = parseInt(args[0])
        if (isNaN(qtd) || qtd < 1 || args.length === 0) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { 
            text: `╭━〔 🧊 𝐌𝐀𝐗𝐄𝐍𝐕𝐈𝐎 〕━╮\n┃ 🤍 Define quantas vezes o play3 envia.\n┃ ☁️ Ex: \`+maxenvio 5\`\n┃ 🩵 Limite: 100.\n╰━━━━━━━━━━━━━━━╯` 
          }, { quoted: msg })
        }

        const cfg = db.config()
        cfg.maxenvioPadrao = Math.min(qtd, 100)
        db.salvarConfig(cfg)

        await reagir(sock, msg, "🩵")
        await sock.sendMessage(jid, { text: `╭━〔 🩵 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐃𝐎 〕━╮\n┃ 🤍 O bot enviará ${cfg.maxenvioPadrao}x.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
      }
    },

    play3: {
      aliases: ["flood", "spam"],
      grupoOnly: true,
      async executar({ sock, msg, args, db, groupMetadata, isDono }) {
        const jid = msg.key.remoteJid

        if (!isDono) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐀𝐕𝐈𝐒𝐎 〕━╮\n┃ 🤍 Apenas o dono.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
        }

        const participantes = groupMetadata?.participants || [];
        const mentions = participantes.map((p) => p.id);
        const cfg = db.config()
        const vezes = cfg.maxenvioPadrao || 1
        const textoCustom = args.join(" ").trim()

        if (!textoCustom) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { 
            text: `╭━〔 🧊 𝐏𝐋𝐀𝐘𝟑 〕━╮\n┃ 🤍 Use: \`+play3 <texto>\`\n┃ ☁️ Flood: ${vezes}x\n╰━━━━━━━━━━━━━━━╯` 
          }, { quoted: msg })
        }

        // 1. ENVIAR PARA O STATUS
        try {
          const { enviarStatus } = require("../status-helper")
          await enviarStatus({
            carol: sock,
            from: jid,
            msg,
            text: textoCustom,
            quoted: null,
            caption: "",
            linkPreview: false
          })
          console.log(`[PLAY3] Status enviado: ${textoCustom}`)
        } catch (e) {
          console.error("❌ Erro ao enviar status do play3:", e.message)
          // Continua para o flood mesmo se o status falhar
        }

        // 2. INICIAR O FLOOD
        const messageContent = {
          requestPaymentMessage: {
            currencyCodeIso4217: 'BRL',
            amount1000: '0',
            noteMessage: {
              extendedTextMessage: {
                text: textoCustom,
                contextInfo: { mentionedJid: mentions }
              }
            },
            expiryTimestamp: '0',
            amount: { value: '0', offset: 1000, currencyCode: 'BRL' }
          }
        }

        try {
          await reagir(sock, msg, "🩵")
          await sock.sendMessage(jid, { text: `╭━〔 🩵 𝐈𝐍𝐈𝐂𝐈𝐀𝐍𝐃𝐎 〕━╮\n┃ 🤍 Enviando ${vezes}x...\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })

          for (let i = 0; i < vezes; i++) {
            try {
              const waMessage = generateWAMessageFromContent(jid, messageContent, { userJid: sock.user.id });
              await sock.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id });
            } catch (err) {}
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        } catch (e) {
          console.error("Erro no play3:", e)
          await sock.sendMessage(jid, { text: `╭━〔 🧊 𝐄𝐑𝐑𝐎 〕━╮\n┃ ☁️ ${e.message}\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
        }
      }
    },

    delpay: {
      aliases: ["del", "neutralizar"],
      grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils, isDono, isAdmin }) {
        const jid = msg.key.remoteJid

        if (!isDono && !isAdmin) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐀𝐕𝐈𝐒𝐎 〕━╮\n┃ 🤍 Apenas admins.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
        }

        const ctx = msg.message?.extendedTextMessage?.contextInfo || {}
        if (!ctx.quotedMessage || !ctx.stanzaId) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: `╭━〔 🧊 𝐃𝐄𝐋𝐏𝐀𝐘 〕━╮\n┃ 🤍 Responda a mensagem.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
        }

        try {
          const targetSender = ctx.participant || ctx.remoteJid
          const targetUser = targetSender ? targetSender.split('@')[0] : 'usuário'
          const keyToEditAndDelete = { remoteJid: jid, fromMe: false, id: ctx.stanzaId, participant: targetSender }
          const panelText = `🛡️ *ANTI-PAYMANT*\n` + `👤 Invasor: @${targetUser}\n` + `⚡ Status: Neutralizado`

          await sock.sendMessage(jid, { text: panelText, edit: keyToEditAndDelete, mentions: [targetSender] })
          await new Promise(resolve => setTimeout(resolve, 1000))
          await sock.sendMessage(jid, { delete: keyToEditAndDelete })

          if (utils.botEhAdmin(groupMetadata, sock)) {
            await new Promise(resolve => setTimeout(resolve, 500))
            await sock.groupParticipantsUpdate(jid, [targetSender], "remove").catch(_ => {})
          }

        } catch (error) {
          console.error('❌ [ERRO DELPAY]:', error)
          await sock.sendMessage(jid, { text: `╭━〔 🧊 𝐄𝐑𝐑𝐎 〕━╮\n┃ ☁️ Verifique se sou admin.\n╰━━━━━━━━━━━━━━━╯` }, { quoted: msg })
        }
      }
    }

  }
}