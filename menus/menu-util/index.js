/* ============================================================
   💻 MENU UTIL - CODIFICAR (ANÁLISE COMPLETA)
   ============================================================ */

const crypto = require("crypto")

function nomeBotDb(db) {
  try { return db.config().nomeBot || "Rimuru Bot" } catch { return "Rimuru Bot" }
}

async function reagir(sock, msg, emoji) {
  try { await sock.sendMessage(msg.key.remoteJid, { react: { text: emoji, key: msg.key } }) } catch (_) {}
}

module.exports = {
  menu: "menu-util",
  grupoOnly: false,
  adminOnly: false,
  donoOnly: false,

  commands: {

    codificar: {
      aliases: ["analisar", "inspect", "inspecionar", "code"],

      async executar({ sock, msg, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const nomeBot = nomeBotDb(db)

        // Captura a mensagem respondida
        const ctx = msg.message?.extendedTextMessage?.contextInfo ||
                    msg.message?.imageMessage?.contextInfo ||
                    msg.message?.videoMessage?.contextInfo ||
                    msg.message?.documentMessage?.contextInfo ||
                    msg.message?.audioMessage?.contextInfo ||
                    msg.message?.stickerMessage?.contextInfo

        const quoted = ctx?.quotedMessage

        if (!quoted) {
          await reagir(sock, msg, "❄️")
          return sock.sendMessage(jid, {
            text: `💻 • 𝐂𝐎𝐃𝐈𝐅𝐈𝐂𝐀𝐑 •\n\n🤍 Responda uma mensagem com código / texto / objeto.\n🩵 \`${p}codificar\` (reply)\n\n"${nomeBot}"`
          }, { quoted: msg })
        }

        // Extração do conteúdo
        let codigo = ''
        let tipo = 'Texto / Script'

        if (quoted.conversation) codigo = quoted.conversation
        else if (quoted.extendedTextMessage?.text) codigo = quoted.extendedTextMessage.text
        else if (quoted.imageMessage?.caption) codigo = quoted.imageMessage.caption
        else if (quoted.videoMessage?.caption) codigo = quoted.videoMessage.caption
        else if (quoted.documentMessage?.caption) codigo = quoted.documentMessage.caption
        else { tipo = 'Objeto Baileys RAW (JSON)'; codigo = JSON.stringify(quoted, null, 2) }

        // Análise
        const totalChars = codigo.length
        const totalLinhas = codigo.split('\n').length
        const bytes = Buffer.byteLength(codigo, 'utf8')

        const temRequires = (codigo.match(/require\(.*?\)/g) || []).length
        const temAsyncAwait = (codigo.match(/\b(async|await)\b/g) || []).length
        const temFuncoes = (codigo.match(/\b(function|=>)\b/g) || []).length
        const temVariaveis = (codigo.match(/\b(const|let|var)\b/g) || []).length
        const temIfs = (codigo.match(/\bif\b/g) || []).length
        const temLoops = (codigo.match(/\b(for|while)\b/g) || []).length
        const temExports = (codigo.match(/\bmodule\.exports\b/g) || []).length
        const temTryCatch = (codigo.match(/\btry\b/g) || []).length

        // Hashes
        const md5 = crypto.createHash('md5').update(codigo).digest('hex')
        const sha1 = crypto.createHash('sha1').update(codigo).digest('hex')
        const sha256 = crypto.createHash('sha256').update(codigo).digest('hex')
        const sha512 = crypto.createHash('sha512').update(codigo).digest('hex')
        const base64 = Buffer.from(codigo, 'utf-8').toString('base64')
        const hex = Buffer.from(codigo, 'utf-8').toString('hex')

        // Cabeçalho
        let cabecalho = `╭━〔 💻 𝐀𝐍𝐀́𝐋𝐈𝐒𝐄 〕━╮\n`
        cabecalho += `┃ 📌 Tipo: ${tipo}\n`
        cabecalho += `┃ 📊 ${totalLinhas} linhas | ${totalChars} chars | ${bytes} B\n`
        if (tipo !== 'Objeto Baileys RAW (JSON)') {
          cabecalho += `┃ ⚙️ ${temVariaveis} vars | ${temFuncoes} funcs\n`
          cabecalho += `┃ 🔄 ${temAsyncAwait} async/await | ${temRequires} requires\n`
          cabecalho += `┃ 🔀 ${temIfs} ifs | ${temLoops} loops | ${temTryCatch} try\n`
          cabecalho += `┃ 📤 ${temExports} module.exports\n`
        }
        cabecalho += `╰━━━━━━━━━━━━━━━╯\n\n`
        cabecalho += `🔐 *HASHES DE INTEGRIDADE*\n`
        cabecalho += `┃ MD5: \`${md5}\`\n`
        cabecalho += `┃ SHA1: \`${sha1}\`\n`
        cabecalho += `┃ SHA256: \`${sha256}\`\n`
        cabecalho += `┃ SHA512: \`${sha512.slice(0, 64)}...\` (truncado)\n\n`
        cabecalho += `"${nomeBot}"`

        await reagir(sock, msg, "🩵")
        await sock.sendMessage(jid, { text: cabecalho }, { quoted: msg })

        const TAMANHO_MAX = 3400

        // Código completo em partes
        const partes = []
        for (let i = 0; i < codigo.length; i += TAMANHO_MAX) partes.push(codigo.slice(i, i + TAMANHO_MAX))

        for (let i = 0; i < partes.length; i++) {
          const header = `📦 *CÓDIGO [${i + 1}/${partes.length}]*\n`
          try {
            await sock.sendMessage(jid, { text: `${header}\`\`\`javascript\n${partes[i]}\n\`\`\`` }, { quoted: msg })
          } catch (e) {
            await sock.sendMessage(jid, { text: `${header}(raw)\n${partes[i]}` }, { quoted: msg })
          }
          await new Promise(r => setTimeout(r, 800))
        }

        // Base64 completo em partes
        const partesB64 = []
        for (let i = 0; i < base64.length; i += TAMANHO_MAX) partesB64.push(base64.slice(i, i + TAMANHO_MAX))

        for (let i = 0; i < partesB64.length; i++) {
          const header = `🔒 *BASE64 [${i + 1}/${partesB64.length}]*\n`
          await sock.sendMessage(jid, { text: `${header}\`\`\`\n${partesB64[i]}\n\`\`\`` }, { quoted: msg })
          await new Promise(r => setTimeout(r, 800))
        }

        // Hex (só se ≤ 5000 chars)
        if (codigo.length <= 5000) {
          const partesHex = []
          for (let i = 0; i < hex.length; i += TAMANHO_MAX) partesHex.push(hex.slice(i, i + TAMANHO_MAX))
          for (let i = 0; i < partesHex.length; i++) {
            const header = `🔡 *HEX [${i + 1}/${partesHex.length}]*\n`
            await sock.sendMessage(jid, { text: `${header}\`\`\`\n${partesHex[i]}\n\`\`\`` }, { quoted: msg })
            await new Promise(r => setTimeout(r, 800))
          }
        } else {
          await sock.sendMessage(jid, { text: `🔡 *HEX*\n> Ignorado (código > 5000 chars)` }, { quoted: msg })
        }

        // Resumo final
        const totalMensagens = 1 + partes.length + partesB64.length + (codigo.length <= 5000 ? Math.ceil(hex.length / TAMANHO_MAX) : 0)
        await sock.sendMessage(jid, {
          text: `╭━〔 ✅ 𝐂𝐎𝐍𝐂𝐋𝐔𝐈́𝐃𝐎 〕━╮\n┃ 🤍 Análise finalizada.\n┃ 📊 ${totalMensagens} mensagens enviadas\n┃ 🧊 ${partes.length} parte(s) de código\n┃ 🔒 ${partesB64.length} parte(s) de base64\n╰━━━━━━━━━━━━━━━╯\n\n"${nomeBot}"`
        }, { quoted: msg })
      }
    },

    menuutil: {
      aliases: ["utilidades", "utilmenu", "menuu"],
      async executar({ sock, msg, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const nomeBot = nomeBotDb(db)

        const texto = `╭━〔 💻 𝐌𝐄𝐍𝐔 𝐔𝐓𝐈𝐋 〕━╮
┃ 🤍 Ferramentas úteis
╰━━━━━━━━━━━━━━━╯

╭━〔 🔍 𝐀𝐍𝐀́𝐋𝐈𝐒𝐄 〕━╮
┃ 💻 ${p}codificar (reply)
┃ 🧊 Analisa código/texto/JSON
┃ 🩵 Hashes MD5/SHA1/SHA256/SHA512
┃ ☁️ Base64 + Hex completo
╰━━━━━━━━━━━━━━━╯

💻 Prefixo: \`${p}\`

_"A serpente analisa tudo."_ 🐍

"${nomeBot}"`

        await reagir(sock, msg, "🩵")
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    }

  }
}