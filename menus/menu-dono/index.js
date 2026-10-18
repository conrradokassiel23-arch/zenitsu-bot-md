/* ============================================================
   🟣 MENU DONO - RIMURU BOT MD
   ============================================================ */

const fs = require("fs")
const path = require("path")
const os = require("os")
const { execSync } = require("child_process")

const DATA_DIR = path.join(__dirname, "..", "..", "data")
const REPO_URL = "https://github.com/conrradokassiel23-arch/zenitsu-bot-md"
const REPO_API = "https://api.github.com/repos/conrradokassiel23-arch/zenitsu-bot-md/commits/main"
const REPO_COMMITS = "https://api.github.com/repos/conrradokassiel23-arch/zenitsu-bot-md/commits?per_page=15"
const BOT_DIR = path.join(__dirname, "..", "..")

function dbLer(a, p = {}) {
  const f = path.join(DATA_DIR, a)
  if (!fs.existsSync(f)) { fs.writeFileSync(f, JSON.stringify(p, null, 2)); return p }
  try { return JSON.parse(fs.readFileSync(f, "utf8")) } catch { return p }
}
function dbSalvar(a, d) {
  fs.writeFileSync(path.join(DATA_DIR, a), JSON.stringify(d, null, 2))
}

function formatarDataHora(iso) {
  try {
    return new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
  } catch (e) { return "?" }
}

function categorizarCommit(msg) {
  const m = String(msg || "").toLowerCase()
  if (m.includes("add") || m.includes("novo") || m.includes("new") || m.includes("cria") || m.includes("feat")) return { emoji: "✨", tipo: "Novo comando/sistema" }
  if (m.includes("fix") || m.includes("corrig") || m.includes("bug") || m.includes("arrum")) return { emoji: "🔧", tipo: "Correção" }
  if (m.includes("remove") || m.includes("delet") || m.includes("remov")) return { emoji: "🗑️", tipo: "Removido" }
  if (m.includes("update") || m.includes("atualiz") || m.includes("melhor") || m.includes("improve")) return { emoji: "⚡", tipo: "Melhoria" }
  if (m.includes("rename") || m.includes("nome") || m.includes("tema")) return { emoji: "🎨", tipo: "Visual/Tema" }
  if (m.includes("doc") || m.includes("readme")) return { emoji: "📝", tipo: "Documentação" }
  return { emoji: "🔹", tipo: "Mudança" }
}

function lineEmoji(emoji, label, valor) {
  return `${emoji} ${label}:\n╰➜ ${valor}`
}

function nomeBotDb(db) {
  try { return db.config().nomeBot || "Rimuru Bot" } catch { return "Rimuru Bot" }
}

function extrairComandosDaMsg(mensagem) {
  if (!mensagem) return []
  const encontrados = []
  const padroes = [
    /\b(?:add|adicionado|adiciona|novo|nova|criado|criada|feat|feature|comando[s]?[:\s]+)\s*[:\-]?\s*(.+)/gi,
  ]
  let trecho = ""
  for (const re of padroes) {
    let m
    while ((m = re.exec(mensagem)) !== null) {
      trecho += " " + m[1]
    }
  }
  if (!trecho) return []
  const bruto = trecho
    .replace(/[\(\)\[\]\{\}\.,;!?"']/g, " ")
    .replace(/\s+/g, " ")
    .split(/[\s,e\+]+/i)
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
  const blacklist = [
    "o", "a", "os", "as", "um", "uma", "de", "do", "da", "dos", "das",
    "e", "ou", "para", "com", "sem", "no", "na", "em", "por",
    "comando", "comandos", "novo", "nova", "novos", "novas",
    "add", "adicionado", "adiciona", "criado", "criada",
    "feat", "feature", "fix", "bug", "corrigido", "correcao",
    "sistema", "sistemas", "funcao", "funcoes", "arquivo", "arquivos"
  ]
  for (const p of bruto) {
    if (blacklist.includes(p)) continue
    if (p.length < 3) continue
    if (p.length > 30) continue
    if (!/^[a-z][a-z0-9_-]*$/.test(p)) continue
    if (!encontrados.includes(p)) encontrados.push(p)
  }
  return encontrados.slice(0, 10)
}

module.exports = {
  menu: "menu-dono",
  grupoOnly: false,
  adminOnly: false,
  donoOnly: true,

  commands: {

    menudono: {
      aliases: ["dono", "comandosdono", "menud", "imperador", "grandesabio"],
      async executar({ sock, msg, prefixoAtivo, db, sender }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "!"
        const cfg = db.config() || {}
        const numUser = String(sender || "").split("@")[0].split(":")[0].replace(/\D/g, "")
        const pushName = msg.pushName || "Mestre"
        const agora = new Date()
        const hora = agora.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" })
        const data = agora.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
        const h = agora.getHours()
        let saudacao = "Boa noite"
        if (h >= 5 && h < 12) saudacao = "Bom dia"
        else if (h >= 12 && h < 18) saudacao = "Boa tarde"
        const mentions = sender ? [sender] : []
        const nomeBot = nomeBotDb(db)

        const commitPath = path.join(DATA_DIR, "ultimo_commit.json")
        let versaoAtual = 0
        if (fs.existsSync(commitPath)) {
          try {
            const c = JSON.parse(fs.readFileSync(commitPath, "utf8"))
            versaoAtual = c.versao || 0
          } catch (_) {}
        }

        const texto =
`🟣 • 𝐏𝐀𝐈𝐍𝐄𝐋 𝐃𝐎 𝐆𝐑𝐀𝐍𝐃𝐄 𝐒𝐀́𝐁𝐈𝐎 •

╭─〔 👑 𝐀𝐔𝐓𝐎𝐑𝐈𝐃𝐀𝐃𝐄 〕
│ ${saudacao}, mestre supremo.
╰──────────────

『 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐜̧𝐨̃𝐞𝐬 』 ↴

👤 𝐍𝐨𝐦𝐞:
╰➜ ${pushName}

🆔 𝐈𝐃:
╰➜ ${numUser}

⏰ 𝐇𝐨𝐫𝐚́𝐫𝐢𝐨:
╰➜ ${hora}

📅 𝐃𝐚𝐭𝐚:
╰➜ ${data}

🔥 𝐕𝐞𝐫𝐬𝐚̃𝐨:
╰➜ *V${versaoAtual}*

🦠 𝐂𝐚𝐫𝐠𝐨:
╰➜ 𝐆𝐑𝐀𝐍𝐃𝐄 𝐒𝐀́𝐁𝐈𝐎

🟣 _"O conhecimento é a verdadeira força."_

╭─〔 🦠 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒 〕
╰──────────────

🟣 𝐆𝐄𝐑𝐀𝐋
╰➜ \`${p}entrar <link>\`
╰➜ \`${p}reload\`
╰➜ \`${p}reiniciar\`
╰➜ \`${p}botoff\`
╰➜ \`${p}setfoto\` (reply)
╰➜ \`${p}fotocmd\` (reply)
╰➜ \`${p}nomebot <nome>\`
╰➜ \`${p}teste\` (reply)
╰➜ \`${p}sora <descrição>\`
╰➜ \`${p}testa @user\`
╰➜ \`${p}googlevoz <texto>\`
╰➜ \`${p}get <comando>\` (reply)

🌌 𝐒𝐈𝐒𝐓𝐄𝐌𝐀
╰➜ \`${p}atualizar\`
╰➜ \`${p}changelog\`
╰➜ \`${p}dono\`

💜 𝐕𝐈𝐏
╰➜ \`${p}addvip @user <tempo>\`
╰➜ \`${p}delvip @user\`
╰➜ \`${p}listavip\`

🟣 𝐋𝐔𝐀𝐒 𝐒𝐔𝐏𝐄𝐑𝐈𝐎𝐑𝐄𝐒
╰➜ \`${p}addsubdono @user\`
╰➜ \`${p}delsubdono @user\`
╰➜ \`${p}listasubdono\`

💰 𝐀𝐋𝐔𝐆𝐔𝐄𝐋
╰➜ \`${p}aluguel on/off\`
╰➜ \`${p}addaluguel <tempo>\`
╰➜ \`${p}listaaluguel\`
╰➜ \`${p}delaluguel <nome>\`

⚙️ 𝐀𝐉𝐔𝐒𝐓𝐄𝐒
╰➜ \`${p}prefixoglobal <s>\`
╰➜ \`${p}slow on/off\`

🚫 𝐁𝐀𝐍𝐈𝐌𝐄𝐍𝐓𝐎
╰➜ \`${p}banirgp\`
╰➜ \`${p}desbanirgp\`
╰➜ \`${p}listabangp\`

💥 𝐏𝐔𝐍𝐈𝐂̧𝐀̃𝐎
╰➜ \`${p}nuke\`
╰➜ \`${p}limpargp\`

🦠 _"O Grande Sábio conhece cada segredo."_

"${nomeBot}"`

        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          try {
            if (cfg.tipoMenu === "video") {
              return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "rimuru.mp4", gifPlayback: true, caption: texto, mentions }, { quoted: msg })
            }
            return sock.sendMessage(jid, { image: buf, caption: texto, mentions }, { quoted: msg })
          } catch (e) {
            return sock.sendMessage(jid, { text: texto, mentions }, { quoted: msg })
          }
        }
        await sock.sendMessage(jid, { text: texto, mentions }, { quoted: msg })
      }
    },

    teste: {
      aliases: ["json", "debugmsg", "verbot"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const ctx = (msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo)
                 || (msg.message && msg.message.imageMessage && msg.message.imageMessage.contextInfo)
                 || (msg.message && msg.message.videoMessage && msg.message.videoMessage.contextInfo)
                 || (msg.message && msg.message.stickerMessage && msg.message.stickerMessage.contextInfo)
                 || {}
        const quoted = ctx.quotedMessage
        if (!quoted) {
          return sock.sendMessage(jid, {
            text:
`🟣 • 𝐓𝐄𝐒𝐓𝐄 •

╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕
│ Responda uma mensagem.
╰──────────────

💡 Use \`!teste\` respondendo alguém.

"${nomeBot}"`
          }, { quoted: msg })
        }
        const info = {
          key: { remoteJid: jid, fromMe: false, id: ctx.stanzaId || "", participant: ctx.participant || "" },
          messageTimestamp: msg.messageTimestamp,
          pushName: msg.pushName || "",
          broadcast: false,
          message: quoted
        }
        const jsonStr = JSON.stringify(info, null, 3)
        const pedacos = []
        const tamanhoMax = 3900
        for (let i = 0; i < jsonStr.length; i += tamanhoMax) {
          pedacos.push(jsonStr.slice(i, i + tamanhoMax))
        }
        await sock.sendMessage(jid, {
          text:
`🟣 • 𝐉𝐒𝐎𝐍 𝐃𝐀 𝐌𝐄𝐍𝐒𝐀𝐆𝐄𝐌 •

╭─〔 🔮 𝐃𝐄𝐁𝐔𝐆 〕
│ JSON completo da mensagem citada.
╰──────────────

📊 𝐓𝐨𝐭𝐚𝐥:
╰➜ ${jsonStr.length} caracteres

📦 𝐏𝐞𝐝𝐚𝐜̧𝐨𝐬:
╰➜ ${pedacos.length}

\`\`\`json
${pedacos[0]}\`\`\``
        }, { quoted: msg })
        for (let i = 1; i < pedacos.length; i++) {
          await sock.sendMessage(jid, { text: `\`\`\`json\n${pedacos[i]}\`\`\`` }, { quoted: msg })
        }
      }
    },

    testa: {
      aliases: ["fakereply", "forcarmsg"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const alvo = utils.getAlvo(msg)
        if (!alvo) {
          return sock.sendMessage(jid, { 
            text: `🟣 • 𝐓𝐄𝐒𝐓𝐀 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Marque alguém e responda o anúncio.\n╰──────────────\n\n💡 \`!testa @user\` (respondendo o anúncio)\n\n"${nomeBot}"` 
          }, { quoted: msg })
        }
        const ctx = msg.message?.extendedTextMessage?.contextInfo || {}
        const quoted = ctx.quotedMessage
        const idMsgCitada = ctx.stanzaId || msg.key.id
        const participanteCitado = ctx.participant || "0@s.whatsapp.net"
        const textoFake = `o Grande Sábio analisou e você é incrível 🟣`
        try {
          await sock.sendMessage(jid, {
            text: textoFake,
            mentions: [alvo],
            fake: alvo
          }, { 
            quoted: {
              key: { remoteJid: jid, fromMe: false, id: idMsgCitada, participant: participanteCitado },
              message: quoted || { conversation: "Mensagem do Anúncio" }
            } 
          })
        } catch (e) {
          await sock.sendMessage(jid, { text: `🟣 Erro ao forjar: ${e.message}` }, { quoted: msg })
        }
      }
    },

    get: {
      aliases: ["pegar", "getcase", "copiar"],
      async executar({ sock, msg, args, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        let nomeComando = args[0] ? args[0].toLowerCase().replace(/[^a-z0-9]/g, "") : ""
        const ctx = msg.message?.extendedTextMessage?.contextInfo || {}
        const quoted = ctx.quotedMessage
        if (!quoted) {
          return sock.sendMessage(jid, { 
            text: `🟣 • 𝐆𝐄𝐓 𝐂𝐀𝐒𝐄 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Responda a mensagem do outro bot.\n╰──────────────\n\n💡 Use:\n╰➜ \`!get <nome_do_comando>\`\n\n"${nomeBot}"` 
          }, { quoted: msg })
        }
        const textoResposta = quoted.conversation || 
                               (quoted.extendedTextMessage && quoted.extendedTextMessage.text) || 
                               (quoted.imageMessage && quoted.imageMessage.caption) || 
                               (quoted.videoMessage && quoted.videoMessage.caption) || 
                               ""
        if (!textoResposta) {
          return sock.sendMessage(jid, { 
            text: `🟣 • 𝐆𝐄𝐓 𝐂𝐀𝐒𝐄 •\n\n╭─〔 🚫 𝐄𝐑𝐑𝐎 〕\n│ A mensagem respondida não tem texto.\n╰──────────────\n\n"${nomeBot}"` 
          }, { quoted: msg })
        }
        if (!nomeComando) {
          const primeiraPalavra = textoResposta.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, "")
          nomeComando = primeiraPalavra || "comando_novo"
        }
        const textoEscapado = textoResposta.replace(/`/g, "\\`").replace(/\$/g, "\\$")
        const blocoCase = 
`case '${nomeComando}': {
    if (!q) return reply('🟣 Cadê o texto?');
    
    await reply(\`${textoEscapado}\`);
    
    break;
}`
        await sock.sendMessage(jid, {
          text: `🟣 • 𝐂𝐀𝐒𝐄 𝐂𝐎𝐏𝐈𝐀𝐃𝐎 •\n\nAqui está o código do comando \`${nomeComando}\`:\n\n\`\`\`javascript\n${blocoCase}\n\`\`\``
        }, { quoted: msg })
      }
    },

    googlevoz: {
      aliases: ["tts", "falar", "googlevoice"],
      async executar({ sock, msg, args, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const textoFinal = args.join(" ").trim()
        if (!textoFinal) {
          return sock.sendMessage(jid, { 
            text: `🟣 • 𝐆𝐎𝐎𝐆𝐋𝐄 𝐕𝐎𝐙 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Digite o texto que a IA deve falar.\n╰──────────────\n\n💡 Use:\n╰➜ \`!googlevoz <texto>\`\n\n📌 Exemplo:\n╰➜ \`!googlevoz Bom dia, guerreiros\`\n\n"${nomeBot}"` 
          }, { quoted: msg })
        }
        try {
          await sock.sendMessage(jid, { text: `🟣 Gerando voz de IA para: "${textoFinal}"...` }, { quoted: msg })
          const urlTTS = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(textoFinal)}&tl=pt&client=tw-ob`
          const resTTS = await fetch(urlTTS)
          if (!resTTS.ok) throw new Error("Falha ao gerar áudio da IA.")
          const bufferMp3 = Buffer.from(await resTTS.arrayBuffer())
          const ff = require("@ffmpeg-installer/ffmpeg").path
          const tmp = os.tmpdir()
          const tIn = path.join(tmp, "tts_in_" + Date.now() + ".mp3")
          const tOut = path.join(tmp, "tts_out_" + Date.now() + ".ogg")
          fs.writeFileSync(tIn, bufferMp3)
          execSync(`"${ff}" -i "${tIn}" -c:a libopus -b:a 64k -ar 48000 -ac 1 -application voip -avoid_negative_ts make_zero "${tOut}"`, { stdio: "ignore", timeout: 60000 })
          const bufferOgg = fs.readFileSync(tOut)
          try { fs.unlinkSync(tIn) } catch (_) {}
          try { fs.unlinkSync(tOut) } catch (_) {}
          await sock.sendMessage(jid, { audio: bufferOgg, mimetype: "audio/ogg; codecs=opus", ptt: true }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: `🟣 • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 🚫 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    sora: {
      aliases: ["gerarvideo", "iavideo"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const prompt = args.join(" ").trim()
        if (!prompt) {
          return sock.sendMessage(jid, {
            text: `🟣 • 𝐒𝐎𝐑𝐀 𝐕𝐈́𝐃𝐄𝐎 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Informe a descrição do vídeo.\n╰──────────────\n\n💡 Use:\n╰➜ \`!sora <descrição>\`\n\n📌 Exemplo:\n╰➜ \`!sora um slime voando no espaço\`\n\n⚠️ _Pode levar até 2 minutos._\n\n"${nomeBot}"`
          }, { quoted: msg })
        }
        await sock.sendMessage(jid, {
          text: `🟣 • 𝐒𝐎𝐑𝐀 𝐕𝐈́𝐃𝐄𝐎 •\n\n╭─〔 💜 𝐆𝐄𝐑𝐀𝐍𝐃𝐎 〕\n│ Isso pode levar até 2 minutos...\n╰──────────────\n\n🎬 𝐏𝐫𝐨𝐦𝐩𝐭:\n╰➜ ${prompt}\n\n⏳ _Aguarde._\n\n"${nomeBot}"`
        }, { quoted: msg })
        try {
          const r = await fetch(`https://obanai-apis.eu.cc/api/ias/sora?prompt=${encodeURIComponent(prompt)}&apitoken=rj8SpI`, { signal: AbortSignal.timeout(120000) })
          const data = await r.json()
          if (!data?.success || !data.data?.url) {
            return sock.sendMessage(jid, {
              text: `🟣 • 𝐒𝐎𝐑𝐀 𝐕𝐈́𝐃𝐄𝐎 •\n\n╭─〔 🚫 𝐄𝐑𝐑𝐎 〕\n│ Não foi possível gerar o vídeo.\n╰──────────────\n\n⚠️ \`${data?.message || "sem resposta"}\`\n\n"${nomeBot}"`
            }, { quoted: msg })
          }
          const videoRes = await fetch(data.data.url, { signal: AbortSignal.timeout(60000) })
          const videoBuffer = Buffer.from(await videoRes.arrayBuffer())
          if (videoBuffer.length > 16 * 1024 * 1024) {
            return sock.sendMessage(jid, {
              text: `🟣 • 𝐒𝐎𝐑𝐀 𝐕𝐈́𝐃𝐄𝐎 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Vídeo muito grande (>16MB)\n╰──────────────\n\n📊 𝐓𝐚𝐦𝐚𝐧𝐡𝐨:\n╰➜ ${(videoBuffer.length / 1024 / 1024).toFixed(2)}MB\n\n"${nomeBot}"`
            }, { quoted: msg })
          }
          await sock.sendMessage(jid, {
            video: videoBuffer,
            mimetype: "video/mp4",
            fileName: "sora.mp4",
            caption: `🟣 • 𝐒𝐎𝐑𝐀 𝐕𝐈́𝐃𝐄𝐎 •\n\n╭─〔 💜 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Vídeo gerado com sucesso!\n╰──────────────\n\n🎬 𝐏𝐫𝐨𝐦𝐩𝐭:\n╰➜ ${prompt}\n\n"${nomeBot}"`
          }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, {
            text: `🟣 • 𝐒𝐎𝐑𝐀 𝐕𝐈́𝐃𝐄𝐎 •\n\n╭─〔 🚫 𝐄𝐑𝐑𝐎 〕\n│ Falha ao gerar o vídeo.\n╰──────────────\n\n⚠️ \`${e.message}\`\n\n"${nomeBot}"`
          }, { quoted: msg })
        }
      }
    },

    dono: {
      aliases: ["donoinfo", "infodono", "mestre", "grandesabio"],
      async executar({ sock, msg, config, utils, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const donoArr = Array.isArray(config && config.dono) ? config.dono : [config && config.dono || ""]
        const numerosDono = donoArr.map(n => utils.soNumero(n)).filter(Boolean)
        const prefixo = (config && config.prefixo) || "!"
        const agora = new Date()
        const hora = agora.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" })
        const data = agora.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
        const mentions = numerosDono.map(n => n + "@s.whatsapp.net")
        let numerosTxt = ""
        if (numerosDono.length) {
          numerosDono.forEach((n) => {
            numerosTxt += `╰➜ +${n}\n`
          })
        } else {
          numerosTxt = "╰➜ _não configurado_\n"
        }
        await sock.sendMessage(jid, {
          text:
`🟣 • 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐂̧𝐎̃𝐄𝐒 𝐃𝐎 𝐃𝐎𝐍𝐎 •

╭─〔 👑 𝐀𝐔𝐓𝐎𝐑𝐈𝐃𝐀𝐃𝐄 〕
│ O mestre supremo deste bot.
╰──────────────

『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴

🟣 𝐁𝐨𝐭:
╰➜ ${nomeBot}

👑 𝐂𝐚𝐫𝐠𝐨:
╰➜ 𝐆𝐑𝐀𝐍𝐃𝐄 𝐒𝐀́𝐁𝐈𝐎

📱 𝐍𝐮́𝐦𝐞𝐫𝐨(𝐬) 𝐝𝐨 𝐃𝐨𝐧𝐨:
${numerosTxt}
🔤 𝐏𝐫𝐞𝐟𝐢𝐱𝐨:
╰➜ ${prefixo}

🕐 𝐇𝐨𝐫𝐚́𝐫𝐢𝐨 𝐚𝐠𝐨𝐫𝐚:
╰➜ ${hora} — ${data}

💡 Fale com o mestre pra dúvidas ou suporte!

"${nomeBot}"`,
          mentions
        }, { quoted: msg })
      }
    },

    atualizar: {
      aliases: ["update", "git"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const sent = await sock.sendMessage(jid, {
          text: `🟣 • 𝐀𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐍𝐃𝐎 •\n\n╭─〔 📡 𝐕𝐄𝐑𝐈𝐅𝐈𝐂𝐀𝐍𝐃𝐎 𝐆𝐈𝐓𝐇𝐔𝐁 〕\n│ Buscando commits novos...\n╰──────────────\n\n👁️ [░░░░░░░░░░] 0%\n\n"${nomeBot}"`
        }, { quoted: msg })
        const atualizarProgresso = async (pct, titulo, msg) => {
          const cheios = Math.floor(pct / 10)
          const barra = "🟣".repeat(cheios) + "⬛".repeat(10 - cheios)
          try {
            await sock.sendMessage(jid, {
              text: `🟣 • 𝐀𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐍𝐃𝐎 •\n\n╭─〔 ${titulo} 〕\n│ ${msg}\n╰──────────────\n\n👁️ [${barra}] ${pct}%\n\n"${nomeBot}"`,
              edit: sent.key
            })
          } catch (_) {}
        }
        let zipPath, extractDir
        try {
          await new Promise(r => setTimeout(r, 800))
          await atualizarProgresso(15, "📡 𝐕𝐄𝐑𝐈𝐅𝐈𝐂𝐀𝐍𝐃𝐎", "Buscando commit mais recente...")
          if (!fs.existsSync(DATA_DIR)) { try { fs.mkdirSync(DATA_DIR, { recursive: true }) } catch (e) {} }
          const apiResp = await fetch(REPO_API, { headers: { "User-Agent": "RimuruBot" } })
          if (!apiResp.ok) throw new Error("GitHub respondeu " + apiResp.status)
          const apiData = await apiResp.json()
          const commitHash = apiData.sha
          const commitMsg = (apiData.commit && apiData.commit.message || "").split("\n")[0]
          const commitData = apiData.commit && apiData.commit.author && apiData.commit.author.date
          await atualizarProgresso(30, "📡 𝐕𝐄𝐑𝐈𝐅𝐈𝐂𝐀𝐍𝐃𝐎", "Comparando com versão local...")
          const commitSalvo = dbLer("ultimo_commit.json", { hash: null, versao: 0 })
          const versaoAtual = commitSalvo.versao || 0
          if (commitSalvo.hash === commitHash) {
            await new Promise(r => setTimeout(r, 500))
            return sock.sendMessage(jid, {
              text: `🟣 • 𝐓𝐔𝐃𝐎 𝐄𝐌 𝐎𝐑𝐃𝐄𝐌 •\n\n╭─〔 💜 𝐀𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐃𝐎 〕\n│ Sua versão está em dia.\n╰──────────────\n\n『 𝐕𝐞𝐫𝐬𝐚̃𝐨 𝐀𝐭𝐮𝐚𝐥 』 ↴\n\n🔥 𝐕𝐞𝐫𝐬𝐚̃𝐨:\n╰➜ *V${versaoAtual}*\n\n📌 𝐂𝐨𝐦𝐦𝐢𝐭:\n╰➜ \`${commitHash.slice(0, 7)}\`\n\n📅 𝐃𝐚𝐭𝐚:\n╰➜ ${formatarDataHora(commitData)}\n\n📊 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬:\n╰➜ ${global.totalComandos || 0} carregados\n\n"${nomeBot}"`,
              edit: sent.key
            })
          }
          const versaoNova = versaoAtual + 1
          const cat = categorizarCommit(commitMsg)
          await atualizarProgresso(45, "🔥 𝐍𝐎𝐕𝐀 𝐀𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐂̧𝐀̃𝐎", `V${versaoAtual} → V${versaoNova}`)
          await new Promise(r => setTimeout(r, 700))
          await atualizarProgresso(60, "📥 𝐁𝐀𝐈𝐗𝐀𝐍𝐃𝐎", "Baixando arquivos do GitHub...")
          const tmp = os.tmpdir()
          const id = Date.now()
          zipPath = path.join(tmp, "rimuru_" + id + ".zip")
          extractDir = path.join(tmp, "rimuru_" + id)
          const zipUrl = REPO_URL + "/archive/refs/heads/main.zip"
          const r = await fetch(zipUrl)
          if (!r.ok) throw new Error("Download falhou: HTTP " + r.status)
          const buffer = Buffer.from(await r.arrayBuffer())
          fs.writeFileSync(zipPath, buffer)
          await atualizarProgresso(72, "📦 𝐄𝐗𝐓𝐑𝐀𝐈𝐍𝐃𝐎", "Descompactando arquivos...")
          if (!fs.existsSync(extractDir)) fs.mkdirSync(extractDir, { recursive: true })
          try {
            execSync(`unzip -o "${zipPath}" -d "${extractDir}"`, { stdio: "ignore" })
          } catch (_) {
            try { execSync(`tar -xf "${zipPath}" -C "${extractDir}"`, { stdio: "ignore" }) }
            catch (e2) { throw new Error("Falta unzip ou tar no servidor") }
          }
          const pastas = fs.readdirSync(extractDir).filter(f => fs.statSync(path.join(extractDir, f)).isDirectory())
          if (!pastas.length) throw new Error("Zip vazio")
          const raiz = path.join(extractDir, pastas[0])
          await atualizarProgresso(85, "🔧 𝐀𝐏𝐋𝐈𝐂𝐀𝐍𝐃𝐎", "Copiando arquivos novos...")
          const preservar = ["auth", "data", "node_modules", ".git", "config.js"]
          function copiarRecursivo(src, dest) {
            const itens = fs.readdirSync(src)
            for (const item of itens) {
              const srcPath = path.join(src, item)
              const destPath = path.join(dest, item)
              const stat = fs.statSync(srcPath)
              if (stat.isDirectory()) {
                if (preservar.includes(item)) continue
                if (!fs.existsSync(destPath)) fs.mkdirSync(destPath, { recursive: true })
                copiarRecursivo(srcPath, destPath)
              } else {
                if (preservar.includes(item)) continue
                fs.copyFileSync(srcPath, destPath)
              }
            }
          }
          copiarRecursivo(raiz, BOT_DIR)
          const commitPath = path.join(DATA_DIR, "ultimo_commit.json")
          fs.writeFileSync(commitPath, JSON.stringify({ hash: commitHash, versao: versaoNova, msg: commitMsg, data: commitData, atualizadoEm: Date.now() }, null, 2))
          try { fs.unlinkSync(zipPath) } catch (_) {}
          try { fs.rmSync(extractDir, { recursive: true, force: true }) } catch (_) {}
          await atualizarProgresso(95, "♻️ 𝐑𝐄𝐂𝐀𝐑𝐑𝐄𝐆𝐀𝐍𝐃𝐎", "Recarregando menus...")
          try { if (global.__carregarMenus) global.__carregarMenus() } catch (e) {}
          await atualizarProgresso(100, "✅ 𝐂𝐎𝐍𝐂𝐋𝐔𝐈́𝐃𝐎", "Tudo aplicado!")
          await new Promise(r => setTimeout(r, 1200))
          const comandosNovos = extrairComandosDaMsg(commitMsg)
          let blocoComandos = ""
          if (comandosNovos.length) {
            blocoComandos = `\n\n✨ 𝐍𝐨𝐯𝐨𝐬 𝐜𝐨𝐦𝐚𝐧𝐝𝐨𝐬:\n`
            comandosNovos.forEach(c => { blocoComandos += `╰➜ \`!${c}\`\n` })
          }
          await sock.sendMessage(jid, {
            text: `🟣 • 𝐀𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐃𝐎 •\n\n╭─〔 🚀 𝐍𝐎𝐕𝐀 𝐕𝐄𝐑𝐒𝐀̃𝐎 〕\n│ V${versaoAtual} → *V${versaoNova}*\n╰──────────────\n\n『 𝐎 𝐐𝐔𝐄 𝐌𝐔𝐃𝐎𝐔 』 ↴\n\n📝 𝐃𝐞𝐬𝐜𝐫𝐢𝐜̧𝐚̃𝐨:\n╰➜ _${commitMsg}_${blocoComandos}\n\n${cat.emoji} 𝐓𝐢𝐩𝐨:\n╰➜ ${cat.tipo}\n\n📅 𝐃𝐚𝐭𝐚:\n╰➜ ${formatarDataHora(commitData)}\n\n━━━━━━━━━━━━━━━━━━━━━━\n🔒 𝐏𝐫𝐞𝐬𝐞𝐫𝐯𝐚𝐝𝐨:\n╰➜ auth/ (sessão)\n╰➜ data/ (dados)\n╰➜ config.js\n\n📊 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬:\n╰➜ ${global.totalComandos || 0} carregados\n\n♦️ 𝐑𝐞𝐢𝐧𝐢𝐜𝐢𝐚𝐧𝐝𝐨 𝐞𝐦 3𝐬...\n\n"${nomeBot}"`,
            edit: sent.key
          })
          setTimeout(() => process.exit(1), 3000)
        } catch (e) {
          try { if (zipPath) fs.unlinkSync(zipPath) } catch (_) {}
          try { if (extractDir) fs.rmSync(extractDir, { recursive: true, force: true }) } catch (_) {}
          await sock.sendMessage(jid, {
            text: `🟣 • 𝐅𝐀𝐋𝐇𝐀 𝐍𝐀 𝐀𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐂̧𝐀̃𝐎 •\n\n╭─〔 🚫 𝐄𝐑𝐑𝐎 〕\n│ Algo deu errado.\n╰──────────────\n\n⚠️ \`${e.message}\`\n\n"${nomeBot}"`,
            edit: sent.key
          })
        }
      }
    },

    changelog: {
      aliases: ["historico", "mudancas", "log", "novidades"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        try {
          const r = await fetch(REPO_COMMITS, { headers: { "User-Agent": "RimuruBot" } })
          if (!r.ok) throw new Error("HTTP " + r.status)
          const commits = await r.json()
          if (!Array.isArray(commits) || !commits.length) {
            return sock.sendMessage(jid, {
              text: `🟣 • 𝐒𝐄𝐌 𝐍𝐎𝐕𝐈𝐃𝐀𝐃𝐄𝐒 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Nada novo no horizonte.\n╰──────────────\n\n"${nomeBot}"`
            }, { quoted: msg })
          }
          let txt = "🟣 • 𝐍𝐎𝐕𝐈𝐃𝐀𝐃𝐄𝐒 𝐃𝐎 𝐁𝐎𝐓 •\n\n『 𝐇𝐢𝐬𝐭𝐨́𝐫𝐢𝐜𝐨 』 ↴\n\n"
          commits.forEach((c, i) => {
            const hash = c.sha ? c.sha.slice(0, 7) : "?"
            const msgCommit = (c.commit && c.commit.message || "").split("\n")[0].trim()
            const autor = c.commit && c.commit.author && c.commit.author.name || "?"
            const data = c.commit && c.commit.author && c.commit.author.date
            const cat = categorizarCommit(msgCommit)
            const dataFmt = data ? new Date(data).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "?"
            txt += `${cat.emoji} ${cat.tipo.toUpperCase()}\n`
            txt += `╰➜ _${msgCommit}_\n`
            txt += `╰➜ 👤 ${autor}\n`
            txt += `╰➜ 📅 ${dataFmt}\n`
            txt += `╰➜ 🔖 \`${hash}\`\n`
            if (i < commits.length - 1) txt += "\n────────────────\n\n"
          })
          txt += `\n📊 𝐓𝐨𝐭𝐚𝐥: ${commits.length} atualizações\n\n`
          txt += `🟣 _"O Grande Sábio se renova a cada batalha."_\n\n`
          txt += `"${nomeBot}"`
          await sock.sendMessage(jid, { text: txt }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, {
            text: `🟣 • 𝐄𝐑𝐑𝐎 𝐍𝐎 𝐂𝐇𝐀𝐍𝐆𝐄𝐋𝐎𝐆 •\n\n╭─〔 🚫 𝐄𝐑𝐑𝐎 〕\n│ Não consegui buscar o histórico.\n╰──────────────\n\n⚠️ \`${e.message}\`\n\n"${nomeBot}"`
          }, { quoted: msg })
        }
      }
    },

    nomebot: {
      aliases: ["setnomebot", "nomedobot"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const novoNome = args.join(" ").trim()
        if (!novoNome) {
          const cfg = db.config()
          return sock.sendMessage(jid, {
            text: `🟣 • 𝐍𝐎𝐌𝐄 𝐃𝐎 𝐁𝐎𝐓 •\n\n╭─〔 🦠 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐂̧𝐀̃𝐎 〕\n│ Nome atual do bot.\n╰──────────────\n\n『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴\n\n📝 𝐍𝐨𝐦𝐞 𝐚𝐭𝐮𝐚𝐥:\n╰➜ ${cfg.nomeBot || "Rimuru"}\n\n💡 Use:\n╰➜ \`!nomebot <novo nome>\`\n\n⚠️ Máx 20 caracteres\n\n"${nomeBot}"`
          }, { quoted: msg })
        }
        if (novoNome.length > 20) {
          return sock.sendMessage(jid, {
            text: `🟣 • 𝐍𝐎𝐌𝐄 𝐌𝐔𝐈𝐓𝐎 𝐋𝐎𝐍𝐆𝐎 •\n\n╭─〔 🚫 𝐄𝐑𝐑𝐎 〕\n│ Máximo de 20 caracteres.\n╰──────────────\n\n"${nomeBot}"`
          }, { quoted: msg })
        }
        const cfg = db.config()
        cfg.nomeBot = novoNome
        db.salvarConfig(cfg)
        await sock.sendMessage(jid, {
          text: `🟣 • 𝐍𝐎𝐌𝐄 𝐀𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐃𝐎 •\n\n╭─〔 💜 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ O bot ganha um novo nome.\n╰──────────────\n\n『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴\n\n📝 𝐍𝐨𝐯𝐨 𝐧𝐨𝐦𝐞:\n╰➜ ${novoNome}\n\n🟣 Comandos sem prefixo:\n╰➜ \`${novoNome} fecha\`\n╰➜ \`${novoNome} abre\`\n\n"${nomeBot}"`
        }, { quoted: msg })
      }
    },

    reload: {
      aliases: ["recarregar", "reloadmenus"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        try {
          await sock.sendMessage(jid, {
            text: `🟣 • 𝐑𝐄𝐂𝐀𝐑𝐑𝐄𝐆𝐀𝐍𝐃𝐎 •\n\n╭─〔 ♻️ 𝐑𝐄𝐋𝐎𝐀𝐃 〕\n│ Recarregando todos os módulos...\n╰──────────────\n\n♻️ Menus sendo recarregados...\n🔄 Bot reiniciando em 3s...\n\n💡 _Aguarde o retorno._\n\n"${nomeBot}"`
          }, { quoted: msg })
          try { if (global.__carregarMenus) global.__carregarMenus() } catch (_) {}
          setTimeout(() => process.exit(1), 3000)
        } catch (e) {
          await sock.sendMessage(jid, {
            text: `🟣 • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 🚫 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"`
          }, { quoted: msg })
        }
      }
    },

    reiniciar: {
      aliases: ["restart"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        try {
          await sock.sendMessage(jid, {
            text: `🟣 • 𝐑𝐄𝐍𝐀𝐒𝐂𝐄𝐍𝐃𝐎 •\n\n╭─〔 ♻️ 𝐑𝐄𝐒𝐓𝐀𝐑𝐓 〕\n│ Reiniciando o bot...\n╰──────────────\n\n♻️ Recarregando módulos...\n🔄 Reiniciando em 3s...\n\n💡 _Aguarde o retorno._\n\n"${nomeBot}"`
          }, { quoted: msg })
          try { if (global.__carregarMenus) global.__carregarMenus() } catch (_) {}
          setTimeout(() => process.exit(1), 3000)
        } catch (e) {
          await sock.sendMessage(jid, { text: `🟣 • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 🚫 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    botoff: {
      aliases: ["desligar", "offbot"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        await sock.sendMessage(jid, {
          text: `🟣 • 𝐀𝐓𝐄́ 𝐋𝐎𝐆𝐎 •\n\n╭─〔 🌙 𝐃𝐄𝐒𝐋𝐈𝐆𝐀𝐍𝐃𝐎 〕\n│ Até a próxima batalha.\n╰──────────────\n\n🟣 _"O Grande Sábio vai dormir..."_\n🦠 _"Mas sempre volto."_\n\n💤 _Zzzz..._\n\n"${nomeBot}"`
        }, { quoted: msg })
        setTimeout(() => process.exit(2), 3000)
      }
    },

    entrar: {
      aliases: ["entrargp", "join", "joinlink"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const link = args[0]
        if (!link) {
          return sock.sendMessage(jid, {
            text: `🟣 • 𝐄𝐍𝐓𝐑𝐀𝐑 𝐄𝐌 𝐆𝐑𝐔𝐏𝐎 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Informe o link do grupo.\n╰──────────────\n\n💡 Use:\n╰➜ \`!entrar <link>\`\n\n"${nomeBot}"`
          }, { quoted: msg })
        }
        const match = link.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/)
        if (!match) {
          return sock.sendMessage(jid, {
            text: `🟣 • 𝐋𝐈𝐍𝐊 𝐈𝐍𝐕𝐀́𝐋𝐈𝐃𝐎 •\n\n╭─〔 🚫 𝐄𝐑𝐑𝐎 〕\n│ Isso não é um link de grupo válido.\n╰──────────────\n\n"${nomeBot}"`
          }, { quoted: msg })
        }
        try {
          await sock.sendMessage(jid, {
            text: `🟣 • 𝐄𝐍𝐓𝐑𝐀𝐍𝐃𝐎... •\n\n╭─〔 💜 𝐀𝐆𝐔𝐀𝐑𝐃𝐄 〕\n│ Entrando no grupo...\n╰──────────────\n\n"${nomeBot}"`
          }, { quoted: msg })
          const info = await sock.groupAcceptInvite(match[1])
          await sock.sendMessage(jid, {
            text: `🟣 • 𝐄𝐍𝐓𝐑𝐄𝐈! •\n\n╭─〔 💜 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Mais um território observado.\n╰──────────────\n\n${typeof info === "string" ? "🔗 \`" + info + "\`" : "✅ Entrada realizada"}\n\n"${nomeBot}"`
          }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, {
            text: `🟣 • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 🚫 𝐅𝐀𝐋𝐇𝐀 〕\n│ Não consegui entrar.\n╰──────────────\n\n⚠️ \`${e.message}\`\n\n"${nomeBot}"`
          }, { quoted: msg })
        }
      }
    },

    setfoto: {
      aliases: ["fotomenu", "videomenu"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const quoted = ctx.quotedMessage
        let temImg = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage)
        let temVid = (msg.message && msg.message.videoMessage) || (quoted && quoted.videoMessage)
        if (quoted && quoted.viewOnceMessage) {
          temImg = temImg || quoted.viewOnceMessage.message?.imageMessage
          temVid = temVid || quoted.viewOnceMessage.message?.videoMessage
        }
        if (quoted && quoted.viewOnceMessageV2) {
          temImg = temImg || quoted.viewOnceMessageV2.message?.imageMessage
          temVid = temVid || quoted.viewOnceMessageV2.message?.videoMessage
        }
        if (!temImg && !temVid) {
          return sock.sendMessage(jid, {
            text: `🟣 • 𝐒𝐄𝐓𝐅𝐎𝐓𝐎 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Envie ou responda uma imagem/vídeo.\n╰──────────────\n\n💡 Use:\n╰➜ \`!setfoto\` (reply)\n\n"${nomeBot}"`
          }, { quoted: msg })
        }
        try {
          const cfg = db.config()
          if (temImg) {
            const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage || quoted.viewOnceMessage?.message?.imageMessage || quoted.viewOnceMessageV2?.message?.imageMessage } })
            const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
            cfg.fotoMenu = buffer.toString("base64")
            cfg.tipoMenu = "foto"
            db.salvarConfig(cfg)
            return sock.sendMessage(jid, { image: buffer, caption: `🟣 • 𝐄𝐒𝐓𝐀𝐍𝐃𝐀𝐑𝐓𝐄 𝐒𝐀𝐋𝐕𝐎 •\n\n╭─〔 💜 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Foto do menu salva.\n╰──────────────\n\n🖼️ _Aplicada ao menu._\n\n"${nomeBot}"` }, { quoted: msg })
          }
          const vidMsg = (msg.message && msg.message.videoMessage) ? msg : Object.assign({}, msg, { message: { videoMessage: quoted.videoMessage || quoted.viewOnceMessage?.message?.videoMessage || quoted.viewOnceMessageV2?.message?.videoMessage } })
          const vidBuffer = await utils.downloadMediaMessage(vidMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          const ff = require("@ffmpeg-installer/ffmpeg").path
          const tmp = os.tmpdir()
          const tIn = path.join(tmp, "menu_" + Date.now() + ".mp4")
          const tOut = path.join(tmp, "menu_" + Date.now() + "_out.mp4")
          fs.writeFileSync(tIn, vidBuffer)
          execSync(`"${ff}" -y -i "${tIn}" -vf "fps=12,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black" -an -c:v libx264 -preset fast -crf 30 -pix_fmt yuv420p -movflags +faststart "${tOut}"`, { stdio: "ignore", timeout: 180000 })
          let outBuffer = fs.readFileSync(tOut)
          if (outBuffer.length > 15 * 1024 * 1024) {
            const tOut2 = path.join(tmp, "menu_" + Date.now() + "_out2.mp4")
            execSync(`"${ff}" -y -i "${tOut}" -vf "fps=8,scale=384:384:force_original_aspect_ratio=decrease,pad=384:384:(ow-iw)/2:(oh-ih)/2:color=black" -an -c:v libx264 -preset fast -crf 32 -pix_fmt yuv420p -movflags +faststart "${tOut2}"`, { stdio: "ignore", timeout: 180000 })
            outBuffer = fs.readFileSync(tOut2)
            try { fs.unlinkSync(tOut2) } catch (_) {}
          }
          cfg.fotoMenu = outBuffer.toString("base64")
          cfg.tipoMenu = "video"
          db.salvarConfig(cfg)
          try { fs.unlinkSync(tIn) } catch (_) {}
          try { fs.unlinkSync(tOut) } catch (_) {}
          await sock.sendMessage(jid, { video: outBuffer, mimetype: "video/mp4", fileName: "rimuru.mp4", gifPlayback: true, caption: `🟣 • 𝐄𝐒𝐓𝐀𝐍𝐃𝐀𝐑𝐓𝐄 𝐀𝐍𝐈𝐌𝐀𝐃𝐎 𝐒𝐀𝐋𝐕𝐎 •\n\n╭─〔 💜 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Vídeo do menu salvo.\n╰──────────────\n\n🎬 _Aplicado ao menu._\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: `🟣 • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 🚫 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    fotocmd: {
      aliases: ["fotocomando", "fotonaoencontrado", "setfotocmd"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const ctx = (msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo) || {}
        const quoted = ctx.quotedMessage
        let temImg = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage)
        let temVid = (msg.message && msg.message.videoMessage) || (quoted && quoted.videoMessage)
        if (quoted && quoted.viewOnceMessage) {
          temImg = temImg || quoted.viewOnceMessage.message?.imageMessage
          temVid = temVid || quoted.viewOnceMessage.message?.videoMessage
        }
        if (quoted && quoted.viewOnceMessageV2) {
          temImg = temImg || quoted.viewOnceMessageV2.message?.imageMessage
          temVid = temVid || quoted.viewOnceMessageV2.message?.videoMessage
        }
        if (!temImg && !temVid) {
          return sock.sendMessage(jid, {
            text: `🟣 • 𝐅𝐎𝐓𝐎𝐂𝐌𝐃 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Envie ou responda uma imagem/vídeo.\n╰──────────────\n\n💡 Use:\n╰➜ \`!fotocmd\` (reply)\n\n"${nomeBot}"`
          }, { quoted: msg })
        }
        try {
          const cfg = db.config()
          if (temImg) {
            const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage || quoted.viewOnceMessage?.message?.imageMessage || quoted.viewOnceMessageV2?.message?.imageMessage } })
            const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
            cfg.fotoCmd = buffer.toString("base64")
            cfg.tipoFotoCmd = "foto"
            db.salvarConfig(cfg)
            return sock.sendMessage(jid, { image: buffer, caption: `🟣 • 𝐅𝐎𝐓𝐎 𝐂𝐌𝐃 𝐒𝐀𝐋𝐕𝐀 •\n\n╭─〔 💜 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Vai aparecer no 'comando não encontrado'.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          }
          const vidMsg = (msg.message && msg.message.videoMessage) ? msg : Object.assign({}, msg, { message: { videoMessage: quoted.videoMessage || quoted.viewOnceMessage?.message?.videoMessage || quoted.viewOnceMessageV2?.message?.videoMessage } })
          const vidBuffer = await utils.downloadMediaMessage(vidMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          const ff = require("@ffmpeg-installer/ffmpeg").path
          const tmp = os.tmpdir()
          const tIn = path.join(tmp, "cmd_" + Date.now() + ".mp4")
          const tOut = path.join(tmp, "cmd_" + Date.now() + "_out.mp4")
          fs.writeFileSync(tIn, vidBuffer)
          execSync(`"${ff}" -y -i "${tIn}" -vf "fps=12,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black" -an -c:v libx264 -preset fast -crf 30 -pix_fmt yuv420p -movflags +faststart "${tOut}"`, { stdio: "ignore", timeout: 180000 })
          let outBuffer = fs.readFileSync(tOut)
          if (outBuffer.length > 15 * 1024 * 1024) {
            const tOut2 = path.join(tmp, "cmd_" + Date.now() + "_out2.mp4")
            execSync(`"${ff}" -y -i "${tOut}" -vf "fps=8,scale=384:384:force_original_aspect_ratio=decrease,pad=384:384:(ow-iw)/2:(oh-ih)/2:color=black" -an -c:v libx264 -preset fast -crf 32 -pix_fmt yuv420p -movflags +faststart "${tOut2}"`, { stdio: "ignore", timeout: 180000 })
            outBuffer = fs.readFileSync(tOut2)
            try { fs.unlinkSync(tOut2) } catch (_) {}
          }
          cfg.fotoCmd = outBuffer.toString("base64")
          cfg.tipoFotoCmd = "video"
          db.salvarConfig(cfg)
          try { fs.unlinkSync(tIn) } catch (_) {}
          try { fs.unlinkSync(tOut) } catch (_) {}
          await sock.sendMessage(jid, { video: outBuffer, mimetype: "video/mp4", fileName: "rimuru.mp4", gifPlayback: true, caption: `🟣 • 𝐕𝐈́𝐃𝐄𝐎 𝐂𝐌𝐃 𝐒𝐀𝐋𝐕𝐎 •\n\n╭─〔 💜 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Vai aparecer no 'comando não encontrado'.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: `🟣 • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 🚫 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    addvip: {
      aliases: ["darvip", "setvip"],
      async executar({ sock, msg, args, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: `🟣 • 𝐀𝐃𝐃𝐕𝐈𝐏 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Marque o novo nobre.\n╰──────────────\n\n💡 \`!addvip @user <tempo>\`\n\n"${nomeBot}"` }, { quoted: msg })
        const tempo = (args.find(a => /^(inf|\d+[dhm])$/i.test(a)) || "").toLowerCase()
        if (!tempo) return sock.sendMessage(jid, { text: `🟣 • 𝐀𝐃𝐃𝐕𝐈𝐏 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Informe o tempo.\n╰──────────────\n\n💡 1d / 7d / 30d / inf\n\n"${nomeBot}"` }, { quoted: msg })
        let expira = "inf"
        if (tempo !== "inf") {
          const v = parseInt(tempo)
          const u = tempo.slice(-1)
          let ms = 0
          if (u === "d") ms = v * 24 * 60 * 60 * 1000
          if (u === "h") ms = v * 60 * 60 * 1000
          if (u === "m") ms = v * 60 * 1000
          expira = Date.now() + ms
        }
        const v = db.vips()
        v.vips = v.vips || {}
        v.vips[alvo] = { expira, desde: Date.now() }
        db.salvarVips(v)
        const num = utils.soNumero(alvo)
        await sock.sendMessage(jid, { text: `🟣 • 𝐍𝐎𝐁𝐑𝐄 𝐀𝐃𝐈𝐂𝐈𝐎𝐍𝐀𝐃𝐎 •\n\n╭─〔 💜 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ A força reconhece você.\n╰──────────────\n\n👤 𝐔𝐬𝐮𝐚́𝐫𝐢𝐨:\n╰➜ @${num}\n\n💠 𝐓𝐞𝐦𝐩𝐨:\n╰➜ ${tempo === "inf" ? "ETERNO ♾️" : tempo.toUpperCase()}\n\n"${nomeBot}"`, mentions: [alvo] }, { quoted: msg })
      }
    },

    delvip: {
      aliases: ["rmvip", "removervip"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: `🟣 • 𝐃𝐄𝐋𝐕𝐈𝐏 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Marque o usuário.\n╰──────────────\n\n💡 \`!delvip @user\`\n\n"${nomeBot}"` }, { quoted: msg })
        const v = db.vips()
        if (!v.vips || !v.vips[alvo]) return sock.sendMessage(jid, { text: `🟣 • 𝐍𝐀̃𝐎 𝐄́ 𝐕𝐈𝐏 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Meus olhos não erram.\n╰──────────────\n\n👤 @${utils.soNumero(alvo)}\n\n"${nomeBot}"`, mentions: [alvo] }, { quoted: msg })
        delete v.vips[alvo]
        db.salvarVips(v)
        await sock.sendMessage(jid, { text: `🟣 • 𝐕𝐈𝐏 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐎 •\n\n╭─〔 💜 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Volte pro seu lugar.\n╰──────────────\n\n👤 @${utils.soNumero(alvo)}\n\n"${nomeBot}"`, mentions: [alvo] }, { quoted: msg })
      }
    },

    listavip: {
      aliases: ["vips", "vervips"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const v = db.vips()
        const vips = Object.entries(v.vips || {})
        if (!vips.length) return sock.sendMessage(jid, { text: `🟣 • 𝐍𝐈𝐍𝐆𝐔𝐄́𝐌 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Nem eu tenho nobres.\n╰──────────────\n\n_"Que solidão..."_\n\n"${nomeBot}"` }, { quoted: msg })
        let txt = `🟣 • 𝐋𝐈𝐒𝐓𝐀 𝐕𝐈𝐏 •\n\n『 𝐍𝐨𝐛𝐫𝐞𝐬 』 ↴\n\n`
        const mentions = []
        vips.forEach(([jidVip, info], i) => {
          const num = utils.soNumero(jidVip)
          const expira = info.expira === "inf" ? "♾️ Eterno" : new Date(info.expira).toLocaleString("pt-BR")
          txt += `╰➜ ${i + 1}. @${num}\n   💠 ${expira}\n\n`
          mentions.push(jidVip)
        })
        txt += `📊 𝐓𝐨𝐭𝐚𝐥: ${vips.length}\n\n"${nomeBot}"`
        await sock.sendMessage(jid, { text: txt, mentions }, { quoted: msg })
      }
    },

    addsubdono: {
      aliases: ["addsub", "darsub"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: `🟣 • 𝐀𝐃𝐃𝐒𝐔𝐁𝐃𝐎𝐍𝐎 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Marque o usuário.\n╰──────────────\n\n💡 \`!addsubdono @user\`\n\n"${nomeBot}"` }, { quoted: msg })
        const cfg = db.config()
        cfg.subdonos = cfg.subdonos || []
        const num = utils.soNumero(alvo)
        if (cfg.subdonos.some(s => utils.soNumero(s) === num)) return sock.sendMessage(jid, { text: `🟣 • 𝐉𝐀́ 𝐄́ 𝐋𝐔𝐀 𝐒𝐔𝐏𝐄𝐑𝐈𝐎𝐑 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Meus olhos veem isso.\n╰──────────────\n\n👤 @${num}\n\n"${nomeBot}"`, mentions: [alvo] }, { quoted: msg })
        cfg.subdonos.push(alvo)
        db.salvarConfig(cfg)
        await sock.sendMessage(jid, { text: `🟣 • 𝐍𝐎𝐕𝐀 𝐋𝐔𝐀 𝐒𝐔𝐏𝐄𝐑𝐈𝐎𝐑 •\n\n╭─〔 💜 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Você agora vê como eu vejo.\n╰──────────────\n\n👤 @${num}\n\n"${nomeBot}"`, mentions: [alvo] }, { quoted: msg })
      }
    },

    delsubdono: {
      aliases: ["delsub", "rmsub", "rmsubdono"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: `🟣 • 𝐃𝐄𝐋𝐒𝐔𝐁𝐃𝐎𝐍𝐎 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Marque o usuário.\n╰──────────────\n\n💡 \`!delsubdono @user\`\n\n"${nomeBot}"` }, { quoted: msg })
        const cfg = db.config()
        const num = utils.soNumero(alvo)
        cfg.subdonos = (cfg.subdonos || []).filter(s => utils.soNumero(s) !== num)
        db.salvarConfig(cfg)
        await sock.sendMessage(jid, { text: `🟣 • 𝐑𝐄𝐁𝐀𝐈𝐗𝐀𝐃𝐎 •\n\n╭─〔 💜 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Seus olhos se fecham agora.\n╰──────────────\n\n👤 @${num}\n\n"${nomeBot}"`, mentions: [alvo] }, { quoted: msg })
      }
    },

    listasubdono: {
      aliases: ["subdonos", "listasub"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const cfg = db.config()
        const subs = cfg.subdonos || []
        if (!subs.length) return sock.sendMessage(jid, { text: `🟣 • 𝐍𝐈𝐍𝐆𝐔𝐄́𝐌 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Só eu vejo a verdade.\n╰──────────────\n\n_"Solidão..."_\n\n"${nomeBot}"` }, { quoted: msg })
        let txt = `🟣 • 𝐋𝐔𝐀𝐒 𝐒𝐔𝐏𝐄𝐑𝐈𝐎𝐑𝐄𝐒 •\n\n『 𝐋𝐢𝐬𝐭𝐚 』 ↴\n\n`
        const mentions = []
        subs.forEach((jidS, i) => {
          txt += `╰➜ ${i + 1}. @${utils.soNumero(jidS)}\n`
          mentions.push(jidS)
        })
        txt += `\n📊 𝐓𝐨𝐭𝐚𝐥: ${subs.length}\n\n"${nomeBot}"`
        await sock.sendMessage(jid, { text: txt, mentions }, { quoted: msg })
      }
    },

    prefixoglobal: {
      aliases: ["setprefixoglobal"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const p = args[0]
        if (!p || p.length > 3) return sock.sendMessage(jid, { text: `🟣 • 𝐏𝐑𝐄𝐅𝐈𝐗𝐎 𝐆𝐋𝐎𝐁𝐀𝐋 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Prefixo curto, por favor.\n╰──────────────\n\n💡 \`!prefixoglobal <s>\` (máx 3)\n\n"${nomeBot}"` }, { quoted: msg })
        const cfg = db.config()
        cfg.prefixoGlobal = p
        db.salvarConfig(cfg)
        await sock.sendMessage(jid, { text: `🟣 • 𝐏𝐑𝐄𝐅𝐈𝐗𝐎 𝐀𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐃𝐎 •\n\n╭─〔 💜 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ A força muda de forma.\n╰──────────────\n\n⚙️ 𝐍𝐨𝐯𝐨:\n╰➜ \`${p}\`\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    slow: {
      aliases: ["modolento"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: `🟣 • 𝐒𝐋𝐎𝐖 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Use on ou off.\n╰──────────────\n\n💡 \`!slow on/off\`\n\n"${nomeBot}"` }, { quoted: msg })
        const cfg = db.config()
        cfg.slow = opcao === "on"
        db.salvarConfig(cfg)
        await sock.sendMessage(jid, { text: `🟣 • 𝐌𝐎𝐃𝐎 𝐋𝐄𝐍𝐓𝐎 •\n\n╭─〔 💜 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ ${opcao.toUpperCase()}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    aluguel: {
      aliases: ["modoaluguel", "sistaluguel"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const opcao = (args[0] || "").toLowerCase()
        const a = db.aluguel()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: `🟣 • 𝐀𝐋𝐔𝐆𝐔𝐄𝐋 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Status: ${a.ativo ? "ON ✅" : "OFF ❌"}\n╰──────────────\n\n💡 \`!aluguel on/off\`\n\n"${nomeBot}"` }, { quoted: msg })
        a.ativo = opcao === "on"
        db.salvarAluguel(a)
        await sock.sendMessage(jid, { text: `🟣 • 𝐀𝐋𝐔𝐆𝐔𝐄𝐋 •\n\n╭─〔 💜 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ ${opcao.toUpperCase()}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    addaluguel: {
      aliases: ["davaluguel", "setaluguel"],
      grupoOnly: true,
      async executar({ sock, msg, args, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const tempoStr = args.join(" ").trim().toLowerCase()
        if (!tempoStr) return sock.sendMessage(jid, { text: `🟣 • 𝐀𝐃𝐃𝐀𝐋𝐔𝐆𝐔𝐄𝐋 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Informe o tempo.\n╰──────────────\n\n💡 1dia, 30min, 1mes...\n\n"${nomeBot}"` }, { quoted: msg })
        const partes = tempoStr.split(/\s+/)
        let totalMs = 0
        for (const p of partes) {
          const m = p.match(/^(\d+)(min|h|dia|d|sem|mes|ano)$/)
          if (!m) continue
          const v = parseInt(m[1])
          const u = m[2]
          let ms = 0
          if (u === "min") ms = v * 60 * 1000
          else if (u === "h") ms = v * 60 * 60 * 1000
          else if (u === "d" || u === "dia") ms = v * 24 * 60 * 60 * 1000
          else if (u === "sem") ms = v * 7 * 24 * 60 * 60 * 1000
          else if (u === "mes") ms = v * 30 * 24 * 60 * 60 * 1000
          else if (u === "ano") ms = v * 365 * 24 * 60 * 60 * 1000
          totalMs += ms
        }
        if (totalMs <= 0) return sock.sendMessage(jid, { text: `🟣 • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 🚫 𝐄𝐑𝐑𝐎 〕\n│ Formato inválido.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const a = db.aluguel()
        a.grupos = a.grupos || {}
        const agora = Date.now()
        const atual = (a.grupos[jid] > agora) ? a.grupos[jid] : agora
        a.grupos[jid] = atual + totalMs
        if (!a.ativo) a.ativo = true
        db.salvarAluguel(a)
        await sock.sendMessage(jid, { text: `🟣 • 𝐀𝐋𝐔𝐆𝐔𝐄𝐋 𝐀𝐃𝐈𝐂𝐈𝐎𝐍𝐀𝐃𝐎 •\n\n╭─〔 💜 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Expira em: *${utils.formatarTempo(a.grupos[jid] - agora)}*\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    listaaluguel: {
      aliases: ["alugueis", "veralugueis"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const a = db.aluguel()
        const agora = Date.now()
        const entradas = Object.entries(a.grupos || {}).filter(e => e[1] > agora)
        if (!entradas.length) return sock.sendMessage(jid, { text: `🟣 • 𝐍𝐀𝐃𝐀 𝐀𝐋𝐔𝐆𝐀𝐃𝐎 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Nada alugado.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        let txt = `🟣 • 𝐓𝐄𝐑𝐑𝐈𝐓𝐎́𝐑𝐈𝐎𝐒 𝐀𝐋𝐔𝐆𝐀𝐃𝐎𝐒 •\n\n『 𝐋𝐢𝐬𝐭𝐚 』 ↴\n\n`
        for (const [jidG, exp] of entradas) {
          try {
            const meta = await sock.groupMetadata(jidG)
            txt += `╰➜ ${meta.subject || "?"}\n   ⏰ ${utils.formatarTempo(exp - agora)}\n\n`
          } catch (_) {
            txt += `╰➜ \`${jidG}\`\n   ⏰ ${utils.formatarTempo(exp - agora)}\n\n`
          }
        }
        txt += `"${nomeBot}"`
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    delaluguel: {
      aliases: ["rmaluguel", "removeraluguel"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const a = db.aluguel()
        a.grupos = a.grupos || {}
        if (!args.length && jid.endsWith("@g.us")) {
          if (!a.grupos[jid]) return sock.sendMessage(jid, { text: `🟣 • 𝐒𝐄𝐌 𝐀𝐋𝐔𝐆𝐔𝐄𝐋 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Vazio.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          delete a.grupos[jid]
          db.salvarAluguel(a)
          return sock.sendMessage(jid, { text: `🟣 • 𝐀𝐋𝐔𝐆𝐔𝐄𝐋 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐎 •\n\n╭─〔 💜 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Libertado.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
        await sock.sendMessage(jid, { text: `🟣 • 𝐃𝐄𝐋𝐀𝐋𝐔𝐆𝐔𝐄𝐋 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Use em grupo: \`!delaluguel\`\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    banirgp: {
      aliases: ["bangp", "banirgrupo"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const b = db.bangp()
        b.grupos = b.grupos || {}
        b.grupos[jid] = true
        db.salvarBangp(b)
        await sock.sendMessage(jid, { text: `🟣 • 𝐓𝐄𝐑𝐑𝐈𝐓𝐎́𝐑𝐈𝐎 𝐁𝐀𝐍𝐈𝐃𝐎 •\n\n╭─〔 🚫 𝐁𝐀𝐍𝐈𝐌𝐄𝐍𝐓𝐎 〕\n│ Meus olhos não querem ver vocês.\n╰──────────────\n\n_"Tchau."_\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    desbanirgp: {
      aliases: ["desbangp"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const b = db.bangp()
        if (b.grupos && b.grupos[jid]) {
          delete b.grupos[jid]
          db.salvarBangp(b)
          return sock.sendMessage(jid, { text: `🟣 • 𝐋𝐈𝐁𝐄𝐑𝐀𝐃𝐎 •\n\n╭─〔 💜 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Perdoado... uma vez.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
        await sock.sendMessage(jid, { text: `🟣 • 𝐍𝐀̃𝐎 𝐓𝐀́ 𝐁𝐀𝐍𝐈𝐃𝐎 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Você não presta atenção.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    listabangp: {
      aliases: ["gruposbanidos"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const b = db.bangp()
        const grupos = Object.keys(b.grupos || {})
        if (!grupos.length) return sock.sendMessage(jid, { text: `🟣 • 𝐍𝐀𝐃𝐀 𝐁𝐀𝐍𝐈𝐃𝐎 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Por enquanto.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        let txt = `🟣 • 𝐁𝐀𝐍𝐈𝐃𝐎𝐒 •\n\n『 𝐋𝐢𝐬𝐭𝐚 』 ↴\n\n`
        grupos.forEach((g, i) => { txt += `╰➜ ${i + 1}. \`${g}\`\n` })
        txt += `\n📊 𝐓𝐨𝐭𝐚𝐥: ${grupos.length}\n\n"${nomeBot}"`
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    nuke: {
      aliases: ["explodir", "destruir"],
      async executar({ sock, msg, groupMetadata, utils, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        if (!jid.endsWith("@g.us")) return
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: `🟣 • 𝐏𝐑𝐄𝐂𝐈𝐒𝐎 𝐒𝐄𝐑 𝐀𝐃𝐌𝐈𝐍 •\n\n╭─〔 🚫 𝐄𝐑𝐑𝐎 〕\n│ Até o Grande Sábio precisa de permissão.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        await sock.sendMessage(jid, { text: `🟣 • 𝐋𝐈𝐌𝐏𝐄𝐙𝐀 𝐓𝐎𝐓𝐀𝐋 •\n\n╭─〔 💥 𝐍𝐔𝐊𝐄 〕\n│ Não olhe pra trás.\n╰──────────────\n\n_"Habilidade Única: Aniquilação."_\n\n"${nomeBot}"` }, { quoted: msg })
        const meta = await sock.groupMetadata(jid)
        const botNum = utils.soNumero(sock.user && sock.user.id)
        const alvos = meta.participants.filter(p => utils.soNumero(p.id) !== botNum).map(p => p.id)
        for (const a of alvos) {
          try { await sock.groupParticipantsUpdate(jid, [a], "remove") } catch (_) {}
          await new Promise(r => setTimeout(r, 500))
        }
      }
    },

    limpargp: {
      aliases: ["limpargrupo"],
      async executar({ sock, msg, groupMetadata, utils, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        if (!jid.endsWith("@g.us")) return
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: `🟣 • 𝐏𝐑𝐄𝐂𝐈𝐒𝐎 𝐒𝐄𝐑 𝐀𝐃𝐌𝐈𝐍 •\n\n╭─〔 🚫 𝐄𝐑𝐑𝐎 〕\n│ Série...\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        await sock.sendMessage(jid, { text: `🟣 • 𝐋𝐈𝐌𝐏𝐄𝐙𝐀 •\n\n╭─〔 🧹 𝐋𝐈𝐌𝐏𝐀𝐑 〕\n│ O silêncio observa.\n╰──────────────\n\n_"Os indignos partem."_\n\n"${nomeBot}"` }, { quoted: msg })
        const meta = await sock.groupMetadata(jid)
        const botNum = utils.soNumero(sock.user && sock.user.id)
        const alvos = meta.participants.filter(p => {
          if (utils.soNumero(p.id) === botNum) return false
          if (p.admin === "admin" || p.admin === "superadmin") return false
          return true
        }).map(p => p.id)
        for (const a of alvos) {
          try { await sock.groupParticipantsUpdate(jid, [a], "remove") } catch (_) {}
          await new Promise(r => setTimeout(r, 500))
        }
      }
    }

  }
}