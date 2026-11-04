/* ============================================================
   🍏 MENU MEMBROS & MENU GERAL
   ============================================================ */

const fs = require("fs")
const path = require("path")
const os = require("os")

const DATA_DIR = path.join(__dirname, "..", "..", "data")

async function reagir(sock, msg, emoji) {
  try { await sock.sendMessage(msg.key.remoteJid, { react: { text: emoji, key: msg.key } }) } catch (_) {}
}

function nomeBotDb(db) { try { return db.config().nomeBot || "Bot" } catch { return "Bot" } }

function secao(t) { return `╭━━━━━〔 🍏 ${t} 🍏 〕━━━━━╮` }
function item(c) { return `┃ 🟢 ${c}` }
function fimSecao() { return `╰━━━━━━━━━━━━━━━━━━━━━━╯` }

function formatarUptime(ms) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (d > 0) return `${d}d ${h % 24}h ${m % 60}min`
  if (h > 0) return `${h}h ${m % 60}min`
  if (m > 0) return `${m}min ${s % 60}s`
  return `${s}s`
}

if (!global.__botInicio) global.__botInicio = Date.now()

module.exports = {
  menu: "menu-membros",
  grupoOnly: false,
  adminOnly: false,
  donoOnly: false,

  commands: {

    // 🌟 MENU GERAL (Visual Melhorado)
    menu: {
      aliases: ["menugeral", "menus", "ajuda"],
      async executar({ sock, msg, prefixoAtivo, db, sender, config, isDono, isSubDono, isAdmin }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const nomeBot = nomeBotDb(db)
        const cfg = db.config() || {}
        const pushName = msg.pushName || "Mortal"
        
        const hora = new Date().toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" })
        
        await reagir(sock, msg, "🍏")

        const texto = `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🍏 𝐌𝐄𝐍𝐔 𝐆𝐄𝐑𝐀𝐋 🍏
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ 🟢 𝐎𝐥𝐚́: ${pushName}
┃ 🧊 𝐁𝐨𝐭: ${nomeBot}
┃ 💧 𝐇𝐨𝐫𝐚: ${hora}
╰━━━━━━━━━━━━━━━━━━━━━━╯

${secao("🛠️ 𝐂𝐀𝐓𝐄𝐆𝐎𝐑𝐈𝐀𝐒")}
${item(`${p}menumembro - Comandos de membro`)}
${item(`${p}menuadm - Administração`)}
${item(`${p}menudono - Dono do Bot`)}
${item(`${p}menuvip - Área VIP`)}
${item(`${p}menurpg - Jogos de RPG`)}
${item(`${p}menufazenda - Jogo de Fazenda`)}
${item(`${p}menucidade - Jogo de Cidade`)}
${item(`${p}menudragao - Domador de Dragões`)}
${item(`${p}menufnaf - FNAF`)}
${item(`${p}menuutil - Utilidades`)}
${fimSecao()}

🍏 𝐏𝐫𝐞𝐟𝐢𝐱𝐨: \`${p}\`
🟢 _"Escolha o seu destino."_
🧊 "${nomeBot}"`

        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          try {
            if (cfg.tipoMenu === "video") {
              await sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "menu.mp4", gifPlayback: true, caption: texto }, { quoted: msg })
            } else {
              await sock.sendMessage(jid, { image: buf, caption: texto }, { quoted: msg })
            }
          } catch (e) {
            await sock.sendMessage(jid, { text: texto }, { quoted: msg })
          }
        } else {
          await sock.sendMessage(jid, { text: texto }, { quoted: msg })
        }
      }
    },

    // 🍏 MENU DE MEMBRO
    menumembro: {
      aliases: ["menumembros", "membros", "menbros"],
      async executar({ sock, msg, prefixoAtivo, db, sender }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const nomeBot = nomeBotDb(db)
        const cfg = db.config() || {}

        await reagir(sock, msg, "🍏")

        const abordagem = `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🍏 𝐎𝐋𝐀́, 𝐌𝐄𝐌𝐁𝐑𝐎! 🍏
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ 🟢 𝐁𝐞𝐦-𝐯𝐢𝐧𝐝𝐨(𝐚)!
┃ 🧊 𝐀𝐪𝐮𝐢 𝐯𝐨𝐜𝐞̂ 𝐞𝐧𝐜𝐨𝐧𝐭𝐫𝐚
┃ 💧 𝐜𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐩𝐚𝐫𝐚 𝐭𝐨𝐝𝐨𝐬.
╰━━━━━━━━━━━━━━━━━━━━━━╯

🍏 _"Use com moderação."_
🧊 "${nomeBot}"`

        const listaComandos = `${secao("🛠️ 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒")}
${item(`${p}ping`)}
${item(`${p}menumembro`)}
${fimSecao()}

🍏 𝐏𝐫𝐞𝐟𝐢𝐱𝐨: \`${p}\`
🟢 _"Área livre para todos."_
🧊 "${nomeBot}"`

        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          try {
            if (cfg.tipoMenu === "video") {
              await sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "menu.mp4", gifPlayback: true, caption: abordagem }, { quoted: msg })
            } else {
              await sock.sendMessage(jid, { image: buf, caption: abordagem }, { quoted: msg })
            }
          } catch (e) {
            await sock.sendMessage(jid, { text: abordagem }, { quoted: msg })
          }
        } else {
          await sock.sendMessage(jid, { text: abordagem }, { quoted: msg })
        }

        await new Promise(r => setTimeout(r, 800))
        await sock.sendMessage(jid, { text: listaComandos }, { quoted: msg })
      }
    },

    // ⚡ PING
    ping: {
      aliases: ["latencia", "pong", "velocidade"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)

        const t1 = Date.now()
        await reagir(sock, msg, "🍏")
        const t2 = Date.now()
        const latenciaMensagem = t2 - t1

        const uptime = formatarUptime(Date.now() - (global.__botInicio || Date.now()))
        const memUsada = process.memoryUsage().rss / 1024 / 1024
        const memTotal = os.totalmem() / 1024 / 1024

        let statusConexao = ""
        let emojiStatus = ""
        if (latenciaMensagem < 100) { statusConexao = "🟢 Excelente"; emojiStatus = "⚡" }
        else if (latenciaMensagem < 300) { statusConexao = "🟢 Boa"; emojiStatus = "🍏" }
        else if (latenciaMensagem < 800) { statusConexao = "💧 Média"; emojiStatus = "💧" }
        else { statusConexao = "💨 Lenta"; emojiStatus = "💨" }

        const texto = `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🍏 𝐏𝐈𝐍𝐆 🍏
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ 🟢 𝐋𝐚𝐭𝐞̂𝐧𝐜𝐢𝐚: ${latenciaMensagem}ms
┃ 💧 𝐒𝐭𝐚𝐭𝐮𝐬: ${statusConexao}
┃ 🧊 𝐔𝐩𝐭𝐢𝐦𝐞: ${uptime}
┃ 🍏 𝐌𝐞𝐦𝐨́𝐫𝐢𝐚: ${memUsada.toFixed(1)}MB
╰━━━━━━━━━━━━━━━━━━━━━━╯

${emojiStatus} _"Bot online e operante."_
🧊 "${nomeBot}"`

        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    }

  }
}