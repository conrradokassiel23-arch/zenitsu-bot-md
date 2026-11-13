/* ============================================================
   🌸 MENU PRINCIPAL - TEMA FLORAL
   ============================================================ */

const fs = require("fs")
const path = require("path")

const DATA_DIR = path.join(__dirname, "..", "..", "data")

async function reagir(sock, msg, emoji) {
  try { await sock.sendMessage(msg.key.remoteJid, { react: { text: emoji, key: msg.key } }) } catch (_) {}
}

function nomeBotDb(db) {
  try { return db.config?.()?.nomeBot || "Bot" } catch { return "Bot" }
}

function getCfg(db) {
  try { return db.config?.() || {} } catch { return {} }
}

module.exports = {
  menu: "menu-membros",
  grupoOnly: false,
  adminOnly: false,
  donoOnly: false,

  commands: {

    menu: {
      aliases: ["menugeral", "menus", "ajuda"],
      async executar({ sock, msg, prefixoAtivo, db }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const nomeBot = nomeBotDb(db)
        const cfg = getCfg(db)
        const pushName = msg.pushName || "Usuário"
        const hora = new Date().toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" })

        await reagir(sock, msg, "🌸")

        const texto = `╔═══ஓ๑♡๑ஓ═══╗
𓆩 𝐌 𝐄 𝐍 𝐔 𓆪
╚═══ஓ๑♡๑ஓ═══╝

┏━━━〔 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 〕━━━┓
𖤐 Usuário » ${pushName}
𖤐 Bot » ${nomeBot}
𖤐 Horário » ${hora}
𖤐 Prefixo » ${p}
┗━━━━━━━━━━━━━━━━━━┛

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐌𝐄𝐌𝐁𝐑𝐎𝐒 𓆪
↳ \`${p}menu-membros\`
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐀𝐃𝐌𝐈𝐍𝐈𝐒𝐓𝐑𝐀𝐂̧𝐀̃𝐎 𓆪
↳ \`${p}menuadm\`
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐏𝐑𝐎𝐏𝐑𝐈𝐄𝐓𝐀́𝐑𝐈𝐎 𓆪
↳ \`${p}menudono\`
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐕𝐈𝐏 𓆪
↳ \`${p}menuvip\`
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐑𝐏𝐆 𓆪
↳ \`${p}menurpg\`
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐅𝐀𝐙𝐄𝐍𝐃𝐀 𓆪
↳ \`${p}menufazenda\`
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୨୧┈┈┈┈╮
𓆩 𝐂𝐈𝐃𝐀𝐃𝐄 𓆪
↳ \`${p}menucidade\`
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐃𝐑𝐀𝐆𝐎̃𝐄𝐒 𓆪
↳ \`${p}menudragao\`
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐅𝐍𝐀𝐅 𓆪
↳ \`${p}menufnaf\`
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐔𝐓𝐈𝐋𝐈𝐃𝐀𝐃𝐄𝐒 𓆪
↳ \`${p}menuutil\`
╰┈┈┈┈୨୧┈┈┈┈╯

╔═══ஓ๑♡๑ஓ═══╗
𓆩 ${nomeBot.toUpperCase()} 𓆪
𝐁𝐄𝐘𝐎𝐍𝐃 𝐓𝐇𝐄 𝐎𝐑𝐃𝐈𝐍𝐀𝐑𝐘
╚═══ஓ๑♡๑ஓ═══╝`

        if (cfg.fotoMenu) {
          let buf = null
          try {
            const limpo = String(cfg.fotoMenu).replace(/^data:[^;]+;base64,/, "")
            buf = Buffer.from(limpo, "base64")
          } catch { buf = null }

          if (buf) {
            try {
              if (cfg.tipoMenu === "video") {
                await sock.sendMessage(jid, {
                  video: buf,
                  mimetype: "video/mp4",
                  fileName: "menu.mp4",
                  gifPlayback: true,
                  caption: texto
                }, { quoted: msg })
              } else {
                await sock.sendMessage(jid, { image: buf, caption: texto }, { quoted: msg })
              }
            } catch (err) {
              await sock.sendMessage(jid, { text: texto }, { quoted: msg })
            }
          } else {
            await sock.sendMessage(jid, { text: texto }, { quoted: msg })
          }
        } else {
          await sock.sendMessage(jid, { text: texto }, { quoted: msg })
        }
      }
    },

    ping: {
      aliases: ["latencia", "pong", "velocidade"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)

        const t1 = Date.now()
        await reagir(sock, msg, "🩸")
        const t2 = Date.now()
        const latencia = t2 - t1

        const texto = `╔═══ஓ๑♡๑ஓ═══╗
𓆩 𝐏 𝐈 𝐍 𝐆 𓆪
╚═══ஓ๑♡๑ஓ═══╝

┏━━━〔 𝐒𝐘𝐒𝐓𝐄𝐌 〕━━━┓
𖤐 Status » 𝐎𝐍𝐋𝐈𝐍𝐄
𖤐 Latência » ${latencia}ms
𖤐 Bot » ${nomeBot}
┗━━━━━━━━━━━━━━━━━━┛

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃 𓆪
❝ Always online. ❞
╰┈┈┈┈୨୧┈┈┈┈╯`

        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    prefixo: {
      aliases: ["prefix", "meuprefixo", "verprefixo"],
      async executar({ sock, msg, prefixoAtivo, db }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const nomeBot = nomeBotDb(db)
        const sender = (msg.key.participant || msg.key.remoteJid || "").replace(/:\d+@/, "@")
        const numUser = String(sender).split("@")[0]

        const agora = new Date()
        const hora = agora.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" })
        const data = agora.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })

        await reagir(sock, msg, "🌸")

        const texto = `╔═══ஓ๑♡๑ஓ═══╗
𓆩 𝐏 𝐑 𝐄 𝐅 𝐈 𝐗 𝐎 𓆪
╚═══ஓ๑♡๑ஓ═══╝

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐀𝐓𝐔𝐀𝐋 𓆪
↳ \`${p}\`
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐔𝐒𝐔𝐀́𝐑𝐈𝐎 𓆪
↳ @${numUser}
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐄𝐗𝐄𝐌𝐏𝐋𝐎 𓆪
↳ \`${p}menu\`
↳ \`${p}ping\`
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐇𝐎𝐑𝐀́𝐑𝐈𝐎 𓆪
↳ ${hora} — ${data}
╰┈┈┈┈୨୧┈┈┈┈╯

╔═══ஓ๑♡๑ஓ═══╗
𓆩 ${nomeBot.toUpperCase()} 𓆪
❝ Use com sabedoria. ❞
╚═══ஓ๑♡๑ஓ═══╝`

        await sock.sendMessage(jid, { text: texto, mentions: [sender] }, { quoted: msg })
      }
    },

    invalidcommand: {
      aliases: ["comandoinvalido", "erro"],
      async executar({ sock, msg, prefixoAtivo, db }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const nomeBot = nomeBotDb(db)
        const cfg = getCfg(db)
        const sender = (msg.key.participant || msg.key.remoteJid || "").replace(/:\d+@/, "@")
        const numUser = String(sender).split("@")[0]

        const agora = new Date()
        const hora = agora.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" })
        const data = agora.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })

        await reagir(sock, msg, "🩸")

        const texto = `╔═══ஓ๑♡๑ஓ═══╗
𓆩 𝐂𝐎𝐌𝐀𝐍𝐃𝐎 𝐈𝐍𝐕𝐀́𝐋𝐈𝐃𝐎 𓆪
╚═══ஓ๑♡๑ஓ═══╝

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐀𝐕𝐈𝐒𝐎 𓆪
O comando informado não foi reconhecido.
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐔𝐒𝐔𝐀́𝐑𝐈𝐎 𓆪
↳ @${numUser}
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐏𝐑𝐄𝐅𝐈𝐗𝐎 𓆪
↳ ${p}
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐇𝐎𝐑𝐀́𝐑𝐈𝐎 𓆪
↳ ${hora} — ${data}
╰┈┈┈┈୨୧┈┈┈┈╯

╔═══ஓ๑♡๑ஓ═══╗
❝ Verifique e tente novamente. ❞
╚═══ஓ๑♡๑ஓ═══╝`

        // 🔧 MÍDIA DO cfg (fotoCmd / tipoFotoCmd / audioMenu)
        let buf = null
        if (cfg.fotoCmd) {
          try {
            const limpo = String(cfg.fotoCmd).replace(/^data:[^;]+;base64,/, "")
            buf = Buffer.from(limpo, "base64")
          } catch { buf = null }
        }

        // 1) Áudio (se existir) - manda como PTT ANTES
        if (cfg.audioMenu) {
          try {
            const audioBuf = Buffer.from(String(cfg.audioMenu).replace(/^data:[^;]+;base64,/, ""), "base64")
            if (audioBuf && audioBuf.length) {
              await sock.sendMessage(jid, {
                audio: audioBuf,
                mimetype: "audio/mp4",
                ptt: true
              }, { quoted: msg })
            }
          } catch (err) {
            console.log("⚠️ Erro audioMenu invalidcommand:", err.message)
          }
        }

        // 2) Foto ou vídeo do fotoCmd
        if (buf && buf.length) {
          try {
            if (cfg.tipoFotoCmd === "video") {
              await sock.sendMessage(jid, {
                video: buf,
                mimetype: "video/mp4",
                fileName: "comando.mp4",
                gifPlayback: true,
                caption: texto,
                mentions: [sender]
              }, { quoted: msg })
              return
            } else {
              await sock.sendMessage(jid, {
                image: buf,
                caption: texto,
                mentions: [sender]
              }, { quoted: msg })
              return
            }
          } catch (err) {
            console.log("⚠️ Erro fotoCmd invalidcommand:", err.message)
          }
        }

        // 3) Fallback texto
        await sock.sendMessage(jid, { text: texto, mentions: [sender] }, { quoted: msg })
      }
    }

  }
}