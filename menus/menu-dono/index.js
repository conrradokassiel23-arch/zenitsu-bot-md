/* ============================================================
   💧❄️🧊 MENU DONO - RIMURU BOT MD (PREFIXO DINÂMICO E RESTART FIX)
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
function dbSalvar(a, d) { fs.writeFileSync(path.join(DATA_DIR, a), JSON.stringify(d, null, 2)) }

async function reagir(sock, msg, emoji) {
  try { await sock.sendMessage(msg.key.remoteJid, { react: { text: emoji, key: msg.key } }) } catch (_) {}
}

function formatarDataHora(iso) {
  try { return new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) } catch (e) { return "?" }
}

function categorizarCommit(msg) {
  const m = String(msg || "").toLowerCase()
  if (m.includes("add") || m.includes("novo") || m.includes("new") || m.includes("cria") || m.includes("feat")) return { emoji: "❄️", tipo: "Novo comando/sistema" }
  if (m.includes("fix") || m.includes("corrig") || m.includes("bug") || m.includes("arrum")) return { emoji: "💧", tipo: "Correção" }
  if (m.includes("remove") || m.includes("delet") || m.includes("remov")) return { emoji: "🧊", tipo: "Removido" }
  if (m.includes("update") || m.includes("atualiz") || m.includes("melhor") || m.includes("improve")) return { emoji: "❄️", tipo: "Melhoria" }
  if (m.includes("rename") || m.includes("nome") || m.includes("tema")) return { emoji: "💧", tipo: "Visual/Tema" }
  if (m.includes("doc") || m.includes("readme")) return { emoji: "🧊", tipo: "Documentação" }
  return { emoji: "💧", tipo: "Mudança" }
}

function lineEmoji(emoji, label, valor) { return `${emoji} ${label}:\n╰➜ ${valor}` }
function nomeBotDb(db) { try { return db.config().nomeBot || "Rimuru Bot" } catch { return "Rimuru Bot" } }

function cardPerfil({ nomeBot, nomeUsuario, cargo, dono }) {
  return `┏┉━─━┈━──━┈━──━┈━─━┉┉⟐
┃╭┈ׅ᳝𑂳໋֕𔓕᳝┉۪࣮᪲۟۫─ׅ͚᷂࠭━⵿໋݊┅᮫ׅ᳝۫💧࣭࣪࣪┅⵿᳝۟━໋ׅ࣪࣪─໋͚ׅ۪֘┉᳝ׅ᪲𔓕໋۪࣪┈᩿࣪╮
┃࣪│᨞⁞🔹️⃞⃞⟡ ʙᴏᴛ: ${nomeBot || "ʀɪᴍᴜʀᴜ - ʙᴏᴛ"}
┃࣪│᨞⁞🔹️⃞⃞⟡ ᴜsᴜᴀʀɪᴏ: ${nomeUsuario || "ᴜsᴜᴀʀɪᴏ"}
┃࣪│᨞⁞🔹️⃞⃞⟡ ᴄᴀʀɢᴏ: ${cargo || "👤 𝐒𝐋𝐈𝐌𝐄 𝐂𝐎𝐌𝐔𝐌"}
┃࣪│᨞⁞🔹️⃞⃞⟡ ᴅᴏɴᴏ: ${dono || "𝐀𝐧֟፝𝐨̷𝐧𝐢𝐦𝐨̷.𝐣𝐬"}
┃╰┈ׅ᳝𑂳໋֕𔓕᳝┉۪࣮᪲۟۫─ׅ͚᷂࠭━⵿໋݊┅᮫ׅ᳝۫💧࣭࣪࣪┅⵿᳝۟━໋ׅ࣪࣪─໋͚ׅ۪֘┉᳝ׅ᪲𔓕໋۪࣪┈᩿࣪╯
┗┉━─━┈━──━┈━──━┈━─━┉┉⟐`
}
function secao(t) { return `┏✰ *${t}*ׅ\n┗┉━─━┈━──━┈━──━┈━─━┉┉⟐` }
function item(c) { return `🧊 ${c}` }

function detectarCargo({ sender, config, db, groupMetadata, isDono, isSubDono, isAdmin }) {
  const num = String(sender || "").split("@")[0].split(":")[0].replace(/\D/g, "")
  const donos = (Array.isArray(config?.dono) ? config.dono : [config?.dono]).map(n => String(n).split("@")[0].split(":")[0].replace(/\D/g, "")).filter(Boolean)
  if (isDono || donos.includes(num)) return "👑 𝐆𝐑𝐀𝐍𝐃𝐄 𝐒𝐀́𝐁𝐈𝐎"
  try { const subs = (db.config?.().subdonos || []).map(n => String(n).split("@")[0].split(":")[0].replace(/\D/g, "")); if (isSubDono || subs.includes(num)) return "💠 𝐋𝐔𝐀 𝐒𝐔𝐏𝐄𝐑𝐈𝐎𝐑" } catch (_) {}
  try { const vips = (db.vips?.() || {}).vips || {}; for (const [j, info] of Object.entries(vips)) { const jn = String(j).split("@")[0].split(":")[0].replace(/\D/g, ""); if (jn === num && (info.expira === "inf" || info.expira > Date.now())) return "❄️ 𝐍𝐎𝐁𝐑𝐄 𝐀𝐋𝐈𝐀𝐃𝐎" } } catch (_) {}
  if (isAdmin) return "⚔️ 𝐂𝐎𝐌𝐀𝐍𝐃𝐀𝐍𝐓𝐄"
  try { const subsAdm = (db.subadmins?.() || {})[groupMetadata?.id] || []; if (subsAdm.some(s => String(s).split("@")[0].split(":")[0].replace(/\D/g, "") === num)) return "🛡️ 𝐆𝐔𝐀𝐑𝐃𝐀 𝐑𝐄𝐀𝐋" } catch (_) {}
  return "👤 𝐒𝐋𝐈𝐌𝐄 𝐂𝐎𝐌𝐔𝐌"
}

function getCargoETexto(ctx) {
  const { sender, config, db, groupMetadata, isDono, isSubDono, isAdmin, msg } = ctx
  const pushName = msg.pushName || "Mestre"
  const donoArr = Array.isArray(config && config.dono) ? config.dono : [config && config.dono || "Chefe"]
  const nomeDono = String(donoArr[0] || "Chefe").split("@")[0].split(":")[0].replace(/\D/g, "") || "Chefe"
  const cargo = detectarCargo({ sender, config, db, groupMetadata, isDono, isSubDono, isAdmin })
  const nomeBot = (config && config.nomeBot) || nomeBotDb(db)
  return { pushName, nomeDono, cargo, nomeBot }
}

function extrairComandosDaMsg(mensagem) {
  if (!mensagem) return []
  const encontrados = []
  const padroes = [/\b(?:add|adicionado|adiciona|novo|nova|criado|criada|feat|feature|comando[s]?[:\s]+)\s*[:\-]?\s*(.+)/gi]
  let trecho = ""
  for (const re of padroes) { let m; while ((m = re.exec(mensagem)) !== null) trecho += " " + m[1] }
  if (!trecho) return []
  const bruto = trecho.replace(/[\(\)\[\]\{\}\.,;!?"']/g, " ").replace(/\s+/g, " ").split(/[\s,e\+]+/i).map(s => s.trim().toLowerCase()).filter(Boolean)
  const blacklist = ["o","a","os","as","um","uma","de","do","da","dos","das","e","ou","para","com","sem","no","na","em","por","comando","comandos","novo","nova","novos","novas","add","adicionado","adiciona","criado","criada","feat","feature","fix","bug","corrigido","correcao","sistema","sistemas","funcao","funcoes","arquivo","arquivos"]
  for (const p of bruto) { if (blacklist.includes(p)) continue; if (p.length < 3) continue; if (p.length > 30) continue; if (!/^[a-z][a-z0-9_-]*$/.test(p)) continue; if (!encontrados.includes(p)) encontrados.push(p) }
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
      async executar({ sock, msg, prefixoAtivo, db, sender, config, isDono, isSubDono, isAdmin, groupMetadata }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const cfg = db.config() || {}
        const numUser = String(sender || "").split("@")[0].split(":")[0].replace(/\D/g, "")
        const { pushName, nomeDono, cargo, nomeBot } = getCargoETexto({ sender, config, db, groupMetadata, isDono, isSubDono, isAdmin, msg })
        const agora = new Date()
        const hora = agora.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" })
        const data = agora.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
        const h = agora.getHours()
        let saudacao = "Boa noite"
        if (h >= 5 && h < 12) saudacao = "Bom dia"
        else if (h >= 12 && h < 18) saudacao = "Boa tarde"
        const mentions = sender ? [sender] : []
        const commitPath = path.join(DATA_DIR, "ultimo_commit.json")
        let versaoAtual = 0
        if (fs.existsSync(commitPath)) { try { const c = JSON.parse(fs.readFileSync(commitPath, "utf8")); versaoAtual = c.versao || 0 } catch (_) {} }
        
        await reagir(sock, msg, "💧")
        
        const texto = `${cardPerfil({ nomeBot, nomeUsuario: pushName, cargo, dono: nomeDono })}

💧 *${saudacao}, mestre.*
❄️ ID: ${numUser}
🧊 Versão: *V${versaoAtual}*
🧊 Horário: ${hora} — ${data}

_"O conhecimento é a verdadeira força."_

${secao("🌌 ɢᴇʀᴀʟ")}
${item(`${p}entrar <link> / ${p}reload / ${p}reiniciar`)}
${item(`${p}botoff / ${p}setfoto (reply)`)}
${item(`${p}fotocmd (reply) / ${p}nomebot <nome>`)}
${item(`${p}teste (reply) / ${p}sora <desc>`)}
${item(`${p}testa @user / ${p}googlevoz <txt>`)}
${item(`${p}get <cmd> (reply)`)}

${secao("⚙️ sɪsᴛᴇᴍᴀ")}
${item(`${p}atualizar / ${p}changelog / ${p}dono`)}

${secao("💜 ᴠɪᴘ")}
${item(`${p}addvip @user <tempo>`)}
${item(`${p}delvip @user / ${p}listavip`)}

${secao("👑 ʟᴜᴀs sᴜᴘᴇʀɪᴏʀᴇs")}
${item(`${p}addsubdono / ${p}delsubdono / ${p}listasubdono`)}

${secao("💰 ᴀʟᴜɢᴜᴇʟ")}
${item(`${p}aluguel on/off`)}
${item(`${p}addaluguel <tempo>`)}
${item(`${p}listaaluguel / ${p}delaluguel`)}

${secao("⚙️ ᴀᴊᴜsᴛᴇs")}
${item(`${p}prefixoglobal <s>`)}
${item(`${p}slow on/off`)}

${secao("🚫 ʙᴀɴɪᴍᴇɴᴛᴏ")}
${item(`${p}banirgp / ${p}desbanirgp / ${p}listabangp`)}

${secao("💥 ᴘᴜɴɪᴄ̧ᴀ̃ᴏ")}
${item(`${p}nuke / ${p}limpargp`)}

💧 Prefixo: \`${p}\`

"${nomeBot}"`

        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          try {
            if (cfg.tipoMenu === "video") return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "rimuru.mp4", gifPlayback: true, caption: texto, mentions }, { quoted: msg })
            return sock.sendMessage(jid, { image: buf, caption: texto, mentions }, { quoted: msg })
          } catch (e) { return sock.sendMessage(jid, { text: texto, mentions }, { quoted: msg }) }
        }
        await sock.sendMessage(jid, { text: texto, mentions }, { quoted: msg })
      }
    },

    teste: {
      aliases: ["json", "debugmsg", "verbot"],
      async executar({ sock, msg, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const ctx = (msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo) || (msg.message && msg.message.imageMessage && msg.message.imageMessage.contextInfo) || (msg.message && msg.message.videoMessage && msg.message.videoMessage.contextInfo) || (msg.message && msg.message.stickerMessage && msg.message.stickerMessage.contextInfo) || {}
        const quoted = ctx.quotedMessage
        if (!quoted) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐓𝐄𝐒𝐓𝐄 •\n\n❄️ Responda uma mensagem.\n🧊 Use \`${p}teste\` reply\n\n"${nomeBot}"` }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        const info = { key: { remoteJid: jid, fromMe: false, id: ctx.stanzaId || "", participant: ctx.participant || "" }, messageTimestamp: msg.messageTimestamp, pushName: msg.pushName || "", broadcast: false, message: quoted }
        const jsonStr = JSON.stringify(info, null, 3)
        const pedacos = []; const tamanhoMax = 3900
        for (let i = 0; i < jsonStr.length; i += tamanhoMax) pedacos.push(jsonStr.slice(i, i + tamanhoMax))
        await sock.sendMessage(jid, { text: `💧 • 𝐉𝐒𝐎𝐍 •\n\n❄️ Debug da mensagem\n🧊 Total: ${jsonStr.length} chars\n🧊 Pedaços: ${pedacos.length}\n\n\`\`\`json\n${pedacos[0]}\`\`\`` }, { quoted: msg })
        for (let i = 1; i < pedacos.length; i++) await sock.sendMessage(jid, { text: `\`\`\`json\n${pedacos[i]}\`\`\`` }, { quoted: msg })
      }
    },

    testa: {
      aliases: ["fakereply", "forcarmsg"],
      async executar({ sock, msg, db, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const alvo = utils.getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐓𝐄𝐒𝐓𝐀 •\n\n❄️ Marque alguém e responda o anúncio.\n🧊 \`${p}testa @user\`\n\n"${nomeBot}"` }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        const ctx = msg.message?.extendedTextMessage?.contextInfo || {}
        const quoted = ctx.quotedMessage
        const idMsgCitada = ctx.stanzaId || msg.key.id
        const participanteCitado = ctx.participant || "0@s.whatsapp.net"
        try { await sock.sendMessage(jid, { text: "o Grande Sábio analisou e você é incrível 💧", mentions: [alvo], fake: alvo }, { quoted: { key: { remoteJid: jid, fromMe: false, id: idMsgCitada, participant: participanteCitado }, message: quoted || { conversation: "Mensagem do Anúncio" } } }) }
        catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: `💧 Erro ao forjar: ${e.message}` }, { quoted: msg }) }
      }
    },

    get: {
      aliases: ["pegar", "getcase", "copiar"],
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        let nomeComando = args[0] ? args[0].toLowerCase().replace(/[^a-z0-9]/g, "") : ""
        const ctx = msg.message?.extendedTextMessage?.contextInfo || {}
        const quoted = ctx.quotedMessage
        if (!quoted) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐆𝐄𝐓 •\n\n❄️ Responda a mensagem do outro bot.\n🧊 \`${p}get <nome>\`\n\n"${nomeBot}"` }, { quoted: msg }) }
        const textoResposta = quoted.conversation || (quoted.extendedTextMessage && quoted.extendedTextMessage.text) || (quoted.imageMessage && quoted.imageMessage.caption) || (quoted.videoMessage && quoted.videoMessage.caption) || ""
        if (!textoResposta) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐆𝐄𝐓 •\n\n❄️ A msg respondida não tem texto.\n\n"${nomeBot}"` }, { quoted: msg }) }
        if (!nomeComando) { const primeiraPalavra = textoResposta.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, ""); nomeComando = primeiraPalavra || "comando_novo" }
        await reagir(sock, msg, "💧")
        const textoEscapado = textoResposta.replace(/`/g, "\\`").replace(/\$/g, "\\$")
        const blocoCase = `case '${nomeComando}': {\n    if (!q) return reply('💧 Cadê o texto?');\n    \n    await reply(\`${textoEscapado}\`);\n    \n    break;\n}`
        await sock.sendMessage(jid, { text: `💧 • 𝐂𝐀𝐒𝐄 •\n\n❄️ Comando \`${nomeComando}\`\n\n\`\`\`javascript\n${blocoCase}\n\`\`\`` }, { quoted: msg })
      }
    },

    googlevoz: {
      aliases: ["tts", "falar", "googlevoice"],
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const textoFinal = args.join(" ").trim()
        if (!textoFinal) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐆𝐎𝐎𝐆𝐋𝐄 𝐕𝐎𝐙 •\n\n❄️ Digite o texto.\n🧊 \`${p}googlevoz <texto>\`\n\n"${nomeBot}"` }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        try {
          await sock.sendMessage(jid, { text: `💧 Gerando voz pra: "${textoFinal}"...` }, { quoted: msg })
          const urlTTS = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(textoFinal)}&tl=pt&client=tw-ob`
          const resTTS = await fetch(urlTTS)
          if (!resTTS.ok) throw new Error("Falha ao gerar áudio.")
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
        } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ ${e.message}\n\n"${nomeBot}"` }, { quoted: msg }) }
      }
    },

    sora: {
      aliases: ["gerarvideo", "iavideo"],
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const prompt = args.join(" ").trim()
        if (!prompt) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐎𝐑𝐀 •\n\n❄️ Informe a descrição.\n🧊 \`${p}sora <desc>\`\n\n"${nomeBot}"` }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐒𝐎𝐑𝐀 •\n\n❄️ Gerando vídeo...\n🧊 Pode levar 2min\n\n"${nomeBot}"` }, { quoted: msg })
        try {
          const r = await fetch(`https://obanai-apis.eu.cc/api/ias/sora?prompt=${encodeURIComponent(prompt)}&apitoken=rj8SpI`, { signal: AbortSignal.timeout(120000) })
          const data = await r.json()
          if (!data?.success || !data.data?.url) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐎𝐑𝐀 •\n\n❄️ Não gerou.\n🧊 ${data?.message || "sem resposta"}\n\n"${nomeBot}"` }, { quoted: msg }) }
          const videoRes = await fetch(data.data.url, { signal: AbortSignal.timeout(60000) })
          const videoBuffer = Buffer.from(await videoRes.arrayBuffer())
          if (videoBuffer.length > 16 * 1024 * 1024) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐎𝐑𝐀 •\n\n❄️ Vídeo > 16MB\n\n"${nomeBot}"` }, { quoted: msg }) }
          await sock.sendMessage(jid, { video: videoBuffer, mimetype: "video/mp4", fileName: "sora.mp4", caption: `💧 • 𝐒𝐎𝐑𝐀 •\n\n❄️ Gerado!\n🧊 ${prompt}\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: `💧 • 𝐒𝐎𝐑𝐀 •\n\n❄️ ${e.message}\n\n"${nomeBot}"` }, { quoted: msg }) }
      }
    },

    dono: {
      aliases: ["donoinfo", "infodono", "mestre", "grandesabio"],
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
        if (numerosDono.length) numerosDono.forEach((n) => { numerosTxt += `🧊 +${n}\n` })
        else numerosTxt = "🧊 _não configurado_\n"
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐃𝐎𝐍𝐎 •\n\n❄️ ${nomeBot}\n\n🧊 Cargo: GRANDE SÁBIO\n${numerosTxt}🧊 Prefixo: ${prefixo}\n🧊 Horário: ${hora} — ${data}\n\n"${nomeBot}"`, mentions }, { quoted: msg })
      }
    },

    atualizar: {
      aliases: ["update", "git"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        await reagir(sock, msg, "💧")
        const sent = await sock.sendMessage(jid, { text: `💧 • 𝐀𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐍𝐃𝐎 •\n\n❄️ Buscando no GitHub...\n🧊 [░░░░░░░░░░] 0%\n\n"${nomeBot}"` }, { quoted: msg })
        const atualizarProgresso = async (pct, titulo, msg) => {
          const cheios = Math.floor(pct / 10); const barra = "💧".repeat(cheios) + "⬛".repeat(10 - cheios)
          try { await sock.sendMessage(jid, { text: `💧 • 𝐀𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐍𝐃𝐎 •\n\n❄️ ${titulo}\n🧊 ${msg}\n\n🧊 [${barra}] ${pct}%\n\n"${nomeBot}"`, edit: sent.key }) } catch (_) {}
        }
        let zipPath, extractDir
        try {
          await new Promise(r => setTimeout(r, 800))
          await atualizarProgresso(15, "📡 VERIFICANDO", "Buscando commit mais recente...")
          if (!fs.existsSync(DATA_DIR)) { try { fs.mkdirSync(DATA_DIR, { recursive: true }) } catch (e) {} }
          const apiResp = await fetch(REPO_API, { headers: { "User-Agent": "RimuruBot" } })
          if (!apiResp.ok) throw new Error("GitHub respondeu " + apiResp.status)
          const apiData = await apiResp.json()
          const commitHash = apiData.sha
          const commitMsg = (apiData.commit && apiData.commit.message || "").split("\n")[0]
          const commitData = apiData.commit && apiData.commit.author && apiData.commit.author.date
          await atualizarProgresso(30, "📡 VERIFICANDO", "Comparando com versão local...")
          const commitSalvo = dbLer("ultimo_commit.json", { hash: null, versao: 0 })
          const versaoAtual = commitSalvo.versao || 0
          if (commitSalvo.hash === commitHash) {
            await new Promise(r => setTimeout(r, 500))
            return sock.sendMessage(jid, { text: `💧 • 𝐄𝐌 𝐃𝐈𝐀 •\n\n❄️ Versão atual.\n🧊 V${versaoAtual}\n🧊 ${commitHash.slice(0, 7)}\n🧊 ${formatarDataHora(commitData)}\n\n"${nomeBot}"`, edit: sent.key })
          }
          const versaoNova = versaoAtual + 1
          const cat = categorizarCommit(commitMsg)
          await atualizarProgresso(45, "🔥 NOVA VERSÃO", `V${versaoAtual} → V${versaoNova}`)
          await new Promise(r => setTimeout(r, 700))
          await atualizarProgresso(60, "📥 BAIXANDO", "Baixando arquivos...")
          const tmp = os.tmpdir(); const id = Date.now()
          zipPath = path.join(tmp, "rimuru_" + id + ".zip"); extractDir = path.join(tmp, "rimuru_" + id)
          const r = await fetch(REPO_URL + "/archive/refs/heads/main.zip")
          if (!r.ok) throw new Error("Download falhou: HTTP " + r.status)
          fs.writeFileSync(zipPath, Buffer.from(await r.arrayBuffer()))
          await atualizarProgresso(72, "📦 EXTRAINDO", "Descompactando...")
          if (!fs.existsSync(extractDir)) fs.mkdirSync(extractDir, { recursive: true })
          try { execSync(`unzip -o "${zipPath}" -d "${extractDir}"`, { stdio: "ignore" }) }
          catch (_) { try { execSync(`tar -xf "${zipPath}" -C "${extractDir}"`, { stdio: "ignore" }) } catch (e2) { throw new Error("Falta unzip/tar") } }
          const pastas = fs.readdirSync(extractDir).filter(f => fs.statSync(path.join(extractDir, f)).isDirectory())
          if (!pastas.length) throw new Error("Zip vazio")
          const raiz = path.join(extractDir, pastas[0])
          await atualizarProgresso(85, "🔧 APLICANDO", "Copiando arquivos...")
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
          await atualizarProgresso(95, "♻️ RECARREGANDO", "Recarregando menus...")
          try { if (global.__carregarMenus) global.__carregarMenus() } catch (e) {}
          await atualizarProgresso(100, "✅ CONCLUÍDO", "Tudo aplicado!")
          
          await new Promise(r => setTimeout(r, 1000))
          const comandosNovos = extrairComandosDaMsg(commitMsg)
          let blocoComandos = ""
          if (comandosNovos.length) { blocoComandos = `\n\n❄️ Novos:\n`; comandosNovos.forEach(c => { blocoComandos += `🧊 ${c}\n` }) }
          
          await sock.sendMessage(jid, { text: `💧 • 𝐀𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐃𝐎 •\n\n❄️ V${versaoAtual} → *V${versaoNova}*\n\n🧊 ${commitMsg}${blocoComandos}\n\n🧊 ${cat.emoji} ${cat.tipo}\n🧊 ${formatarDataHora(commitData)}\n\n🔒 Preservado: auth/ data/ config.js\n\n♦️ Reiniciando em 3s...\n\n"${nomeBot}"`, edit: sent.key })
          
          // ✅ ESPERA 3 SEGUNDOS E FECHA PARA O PM2 REINICIAR
          await new Promise(r => setTimeout(r, 3000))
          process.exit(0)
        } catch (e) {
          try { if (zipPath) fs.unlinkSync(zipPath) } catch (_) {}
          try { if (extractDir) fs.rmSync(extractDir, { recursive: true, force: true }) } catch (_) {}
          await reagir(sock, msg, "🧊")
          await sock.sendMessage(jid, { text: `💧 • 𝐅𝐀𝐋𝐇𝐀 •\n\n❄️ ${e.message}\n\n"${nomeBot}"`, edit: sent.key })
        }
      }
    },

    changelog: {
      aliases: ["historico", "mudancas", "log", "novidades"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        await reagir(sock, msg, "💧")
        try {
          const r = await fetch(REPO_COMMITS, { headers: { "User-Agent": "RimuruBot" } })
          if (!r.ok) throw new Error("HTTP " + r.status)
          const commits = await r.json()
          if (!Array.isArray(commits) || !commits.length) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐄𝐌 𝐍𝐎𝐕𝐈𝐃𝐀𝐃𝐄𝐒 •\n\n❄️ Nada novo.\n\n"${nomeBot}"` }, { quoted: msg }) }
          let txt = "💧 • 𝐍𝐎𝐕𝐈𝐃𝐀𝐃𝐄𝐒 •\n\n❄️ Histórico:\n\n"
          commits.forEach((c, i) => {
            const hash = c.sha ? c.sha.slice(0, 7) : "?"
            const msgCommit = (c.commit && c.commit.message || "").split("\n")[0].trim()
            const autor = c.commit && c.commit.author && c.commit.author.name || "?"
            const data = c.commit && c.commit.author && c.commit.author.date
            const cat = categorizarCommit(msgCommit)
            const dataFmt = data ? new Date(data).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "?"
            txt += `🧊 ${cat.emoji} ${cat.tipo}\n🧊 _${msgCommit}_\n🧊 👤 ${autor}\n🧊 📅 ${dataFmt}\n🧊 \`${hash}\`\n`
            if (i < commits.length - 1) txt += "\n"
          })
          txt += `\n🧊 Total: ${commits.length}\n\n"${nomeBot}"`
          await sock.sendMessage(jid, { text: txt }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ ${e.message}\n\n"${nomeBot}"` }, { quoted: msg }) }
      }
    },

    nomebot: {
      aliases: ["setnomebot", "nomedobot"],
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const novoNome = args.join(" ").trim()
        if (!novoNome) { const cfg = db.config(); await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐍𝐎𝐌𝐄 •\n\n❄️ Atual: ${cfg.nomeBot || "Rimuru"}\n🧊 \`${p}nomebot <nome>\` (máx 20)\n\n"${nomeBot}"` }, { quoted: msg }) }
        if (novoNome.length > 20) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐍𝐎𝐌𝐄 𝐋𝐎𝐍𝐆𝐎 •\n\n❄️ Máx 20 caracteres.\n\n"${nomeBot}"` }, { quoted: msg }) }
        const cfg = db.config(); cfg.nomeBot = novoNome; db.salvarConfig(cfg)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐍𝐎𝐌𝐄 •\n\n❄️ Alterado para ${novoNome}\n🧊 \`${novoNome} fecha\`\n🧊 \`${novoNome} abre\`\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    reload: {
      aliases: ["recarregar", "reloadmenus"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        await reagir(sock, msg, "💧")
        try { 
          await sock.sendMessage(jid, { text: `💧 • 𝐑𝐄𝐂𝐀𝐑𝐑𝐄𝐆𝐀𝐍𝐃𝐎 •\n\n❄️ Recarregando módulos...\n🧊 O bot reiniciará em 3s.\n\n"${nomeBot}"` }, { quoted: msg })
          
          try { if (global.__carregarMenus) global.__carregarMenus() } catch (_) {}
          
          // ✅ ESPERA 3 SEGUNDOS ANTES DE FECHAR PARA O PM2 REINICIAR
          await new Promise(r => setTimeout(r, 3000))
          process.exit(0)
        } catch (e) { 
          await reagir(sock, msg, "🧊")
          await sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ ${e.message}\n\n"${nomeBot}"` }, { quoted: msg }) 
        }
      }
    },

    reiniciar: {
      aliases: ["restart"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        await reagir(sock, msg, "💧")
        try { 
          await sock.sendMessage(jid, { text: `💧 • 𝐑𝐄𝐈𝐍𝐈𝐂𝐈𝐀𝐍𝐃𝐎 •\n\n❄️ Reiniciando o servidor...\n🧊 Aguardem alguns segundos.\n\n"${nomeBot}"` }, { quoted: msg })
          
          // ✅ ESPERA 3 SEGUNDOS ANTES DE FECHAR PARA O PM2 REINICIAR
          await new Promise(r => setTimeout(r, 3000))
          process.exit(0) 
        } catch (e) { 
          await reagir(sock, msg, "🧊")
          await sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ ${e.message}\n\n"${nomeBot}"` }, { quoted: msg }) 
        }
      }
    },

    botoff: {
      aliases: ["desligar", "offbot"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐀𝐓𝐄́ 𝐋𝐎𝐆𝐎 •\n\n❄️ Desligando...\n🧊 Até a próxima\n\n💤 _Zzzz..._\n\n"${nomeBot}"` }, { quoted: msg })
        
        // Aqui o processo é morto de verdade sem reiniciar (pm2 stop ou exit 2)
        await new Promise(r => setTimeout(r, 3000))
        process.exit(2)
      }
    },

    entrar: {
      aliases: ["entrargp", "join", "joinlink"],
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const link = args[0]
        if (!link) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐄𝐍𝐓𝐑𝐀𝐑 •\n\n❄️ Informe o link.\n🧊 \`${p}entrar <link>\`\n\n"${nomeBot}"` }, { quoted: msg }) }
        const match = link.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/)
        if (!match) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐋𝐈𝐍𝐊 𝐈𝐍𝐕𝐀́𝐋𝐈𝐃𝐎 •\n\n❄️ Não é link de grupo.\n\n"${nomeBot}"` }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        try { await sock.sendMessage(jid, { text: `💧 • 𝐄𝐍𝐓𝐑𝐀𝐍𝐃𝐎 •\n\n❄️ Entrando no grupo...\n\n"${nomeBot}"` }, { quoted: msg }); const info = await sock.groupAcceptInvite(match[1]); await sock.sendMessage(jid, { text: `💧 • 𝐄𝐍𝐓𝐑𝐄𝐈 •\n\n❄️ Mais um território.\n🧊 ${typeof info === "string" ? "`" + info + "`" : "✅ Entrada realizada"}\n\n"${nomeBot}"` }, { quoted: msg }) }
        catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ ${e.message}\n\n"${nomeBot}"` }, { quoted: msg }) }
      }
    },

    setfoto: {
      aliases: ["fotomenu", "videomenu"],
      async executar({ sock, msg, db, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const quoted = ctx.quotedMessage
        let temImg = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage)
        let temVid = (msg.message && msg.message.videoMessage) || (quoted && quoted.videoMessage)
        if (quoted && quoted.viewOnceMessage) { temImg = temImg || quoted.viewOnceMessage.message?.imageMessage; temVid = temVid || quoted.viewOnceMessage.message?.videoMessage }
        if (quoted && quoted.viewOnceMessageV2) { temImg = temImg || quoted.viewOnceMessageV2.message?.imageMessage; temVid = temVid || quoted.viewOnceMessageV2.message?.videoMessage }
        if (!temImg && !temVid) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐄𝐓𝐅𝐎𝐓𝐎 •\n\n❄️ Envie/responda imagem/vídeo.\n🧊 \`${p}setfoto\` (reply)\n\n"${nomeBot}"` }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        try {
          const cfg = db.config()
          if (temImg) {
            const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage || quoted.viewOnceMessage?.message?.imageMessage || quoted.viewOnceMessageV2?.message?.imageMessage } })
            const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
            cfg.fotoMenu = buffer.toString("base64"); cfg.tipoMenu = "foto"; db.salvarConfig(cfg)
            return sock.sendMessage(jid, { image: buffer, caption: `💧 • 𝐅𝐎𝐓𝐎 •\n\n❄️ Salva no menu.\n\n"${nomeBot}"` }, { quoted: msg })
          }
          const vidMsg = (msg.message && msg.message.videoMessage) ? msg : Object.assign({}, msg, { message: { videoMessage: quoted.videoMessage || quoted.viewOnceMessage?.message?.videoMessage || quoted.viewOnceMessageV2?.message?.videoMessage } })
          const vidBuffer = await utils.downloadMediaMessage(vidMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          const ff = require("@ffmpeg-installer/ffmpeg").path; const tmp = os.tmpdir()
          const tIn = path.join(tmp, "menu_" + Date.now() + ".mp4"); const tOut = path.join(tmp, "menu_" + Date.now() + "_out.mp4")
          fs.writeFileSync(tIn, vidBuffer)
          execSync(`"${ff}" -y -i "${tIn}" -vf "fps=12,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black" -an -c:v libx264 -preset fast -crf 30 -pix_fmt yuv420p -movflags +faststart "${tOut}"`, { stdio: "ignore", timeout: 180000 })
          let outBuffer = fs.readFileSync(tOut)
          if (outBuffer.length > 15 * 1024 * 1024) { const tOut2 = path.join(tmp, "menu_" + Date.now() + "_out2.mp4"); execSync(`"${ff}" -y -i "${tOut}" -vf "fps=8,scale=384:384:force_original_aspect_ratio=decrease,pad=384:384:(ow-iw)/2:(oh-ih)/2:color=black" -an -c:v libx264 -preset fast -crf 32 -pix_fmt yuv420p -movflags +faststart "${tOut2}"`, { stdio: "ignore", timeout: 180000 }); outBuffer = fs.readFileSync(tOut2); try { fs.unlinkSync(tOut2) } catch (_) {} }
          cfg.fotoMenu = outBuffer.toString("base64"); cfg.tipoMenu = "video"; db.salvarConfig(cfg)
          try { fs.unlinkSync(tIn) } catch (_) {}; try { fs.unlinkSync(tOut) } catch (_) {}
          await sock.sendMessage(jid, { video: outBuffer, mimetype: "video/mp4", fileName: "rimuru.mp4", gifPlayback: true, caption: `💧 • 𝐕𝐈́𝐃𝐄𝐎 •\n\n❄️ Salvo no menu.\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ ${e.message}\n\n"${nomeBot}"` }, { quoted: msg }) }
      }
    },

    fotocmd: {
      aliases: ["fotocomando", "fotonaoencontrado", "setfotocmd"],
      async executar({ sock, msg, db, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const ctx = (msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo) || {}
        const quoted = ctx.quotedMessage
        let temImg = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage)
        let temVid = (msg.message && msg.message.videoMessage) || (quoted && quoted.videoMessage)
        if (quoted && quoted.viewOnceMessage) { temImg = temImg || quoted.viewOnceMessage.message?.imageMessage; temVid = temVid || quoted.viewOnceMessage.message?.videoMessage }
        if (quoted && quoted.viewOnceMessageV2) { temImg = temImg || quoted.viewOnceMessageV2.message?.imageMessage; temVid = temVid || quoted.viewOnceMessageV2.message?.videoMessage }
        if (!temImg && !temVid) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐅𝐎𝐓𝐎𝐂𝐌𝐃 •\n\n❄️ Envie/responda imagem/vídeo.\n🧊 \`${p}fotocmd\` (reply)\n\n"${nomeBot}"` }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        try {
          const cfg = db.config()
          if (temImg) {
            const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage || quoted.viewOnceMessage?.message?.imageMessage || quoted.viewOnceMessageV2?.message?.imageMessage } })
            const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
            cfg.fotoCmd = buffer.toString("base64"); cfg.tipoFotoCmd = "foto"; db.salvarConfig(cfg)
            return sock.sendMessage(jid, { image: buffer, caption: `💧 • 𝐅𝐎𝐓𝐎 𝐂𝐌𝐃 •\n\n❄️ Aparecerá no "comando não encontrado".\n\n"${nomeBot}"` }, { quoted: msg })
          }
          const vidMsg = (msg.message && msg.message.videoMessage) ? msg : Object.assign({}, msg, { message: { videoMessage: quoted.videoMessage || quoted.viewOnceMessage?.message?.videoMessage || quoted.viewOnceMessageV2?.message?.videoMessage } })
          const vidBuffer = await utils.downloadMediaMessage(vidMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          const ff = require("@ffmpeg-installer/ffmpeg").path; const tmp = os.tmpdir()
          const tIn = path.join(tmp, "cmd_" + Date.now() + ".mp4"); const tOut = path.join(tmp, "cmd_" + Date.now() + "_out.mp4")
          fs.writeFileSync(tIn, vidBuffer)
          execSync(`"${ff}" -y -i "${tIn}" -vf "fps=12,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black" -an -c:v libx264 -preset fast -crf 30 -pix_fmt yuv420p -movflags +faststart "${tOut}"`, { stdio: "ignore", timeout: 180000 })
          let outBuffer = fs.readFileSync(tOut)
          if (outBuffer.length > 15 * 1024 * 1024) { const tOut2 = path.join(tmp, "cmd_" + Date.now() + "_out2.mp4"); execSync(`"${ff}" -y -i "${tOut}" -vf "fps=8,scale=384:384:force_original_aspect_ratio=decrease,pad=384:384:(ow-iw)/2:(oh-ih)/2:color=black" -an -c:v libx264 -preset fast -crf 32 -pix_fmt yuv420p -movflags +faststart "${tOut2}"`, { stdio: "ignore", timeout: 180000 }); outBuffer = fs.readFileSync(tOut2); try { fs.unlinkSync(tOut2) } catch (_) {} }
          cfg.fotoCmd = outBuffer.toString("base64"); cfg.tipoFotoCmd = "video"; db.salvarConfig(cfg)
          try { fs.unlinkSync(tIn) } catch (_) {}; try { fs.unlinkSync(tOut) } catch (_) {}
          await sock.sendMessage(jid, { video: outBuffer, mimetype: "video/mp4", fileName: "rimuru.mp4", gifPlayback: true, caption: `💧 • 𝐕𝐈́𝐃𝐄𝐎 𝐂𝐌𝐃 •\n\n❄️ Aparecerá no "comando não encontrado".\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ ${e.message}\n\n"${nomeBot}"` }, { quoted: msg }) }
      }
    },

    addvip: {
      aliases: ["darvip", "setvip"],
      async executar({ sock, msg, args, db, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const alvo = utils.getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐀𝐃𝐃𝐕𝐈𝐏 •\n\n❄️ Marque o novo nobre.\n🧊 \`${p}addvip @user <tempo>\`\n\n"${nomeBot}"` }, { quoted: msg }) }
        const tempo = (args.find(a => /^(inf|\d+[dhm])$/i.test(a)) || "").toLowerCase()
        if (!tempo) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐀𝐃𝐃𝐕𝐈𝐏 •\n\n❄️ Informe o tempo.\n🧊 1d / 7d / 30d / inf\n\n"${nomeBot}"` }, { quoted: msg }) }
        let expira = "inf"
        if (tempo !== "inf") { const v = parseInt(tempo); const u = tempo.slice(-1); let ms = 0; if (u === "d") ms = v * 24 * 60 * 60 * 1000; if (u === "h") ms = v * 60 * 60 * 1000; if (u === "m") ms = v * 60 * 1000; expira = Date.now() + ms }
        const v = db.vips(); v.vips = v.vips || {}; v.vips[alvo] = { expira, desde: Date.now() }; db.salvarVips(v)
        const num = utils.soNumero(alvo)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐍𝐎𝐁𝐑𝐄 •\n\n❄️ Adicionado\n🧊 @${num}\n🧊 Tempo: ${tempo === "inf" ? "ETERNO ♾️" : tempo.toUpperCase()}\n\n"${nomeBot}"`, mentions: [alvo] }, { quoted: msg })
      }
    },

    delvip: {
      aliases: ["rmvip", "removervip"],
      async executar({ sock, msg, db, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const alvo = utils.getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐃𝐄𝐋𝐕𝐈𝐏 •\n\n❄️ Marque o usuário.\n🧊 \`${p}delvip @user\`\n\n"${nomeBot}"` }, { quoted: msg }) }
        const v = db.vips()
        if (!v.vips || !v.vips[alvo]) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐍𝐀̃𝐎 𝐄́ 𝐕𝐈𝐏 •\n\n❄️ Meus olhos não erram.\n🧊 @${utils.soNumero(alvo)}\n\n"${nomeBot}"`, mentions: [alvo] }, { quoted: msg }) }
        delete v.vips[alvo]; db.salvarVips(v)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐕𝐈𝐏 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐎 •\n\n❄️ @${utils.soNumero(alvo)}\n\n"${nomeBot}"`, mentions: [alvo] }, { quoted: msg })
      }
    },

    listavip: {
      aliases: ["vips", "vervips"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const v = db.vips(); const vips = Object.entries(v.vips || {})
        if (!vips.length) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐍𝐈𝐍𝐆𝐔𝐄́𝐌 •\n\n❄️ Sem nobres.\n\n"${nomeBot}"` }, { quoted: msg }) }
        let txt = "💧 • 𝐋𝐈𝐒𝐓𝐀 𝐕𝐈𝐏 •\n\n❄️ Nobres:\n\n"; const mentions = []
        vips.forEach(([jidVip, info], i) => { const num = utils.soNumero(jidVip); const expira = info.expira === "inf" ? "♾️ Eterno" : new Date(info.expira).toLocaleString("pt-BR"); txt += `🧊 ${i + 1}. @${num} — ${expira}\n`; mentions.push(jidVip) })
        txt += `\n🧊 Total: ${vips.length}\n\n"${nomeBot}"`
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: txt, mentions }, { quoted: msg })
      }
    },

    addsubdono: {
      aliases: ["addsub", "darsub"],
      async executar({ sock, msg, db, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const alvo = utils.getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐀𝐃𝐃𝐒𝐔𝐁 •\n\n❄️ Marque o usuário.\n🧊 \`${p}addsubdono @user\`\n\n"${nomeBot}"` }, { quoted: msg }) }
        const cfg = db.config(); cfg.subdonos = cfg.subdonos || []; const num = utils.soNumero(alvo)
        if (cfg.subdonos.some(s => utils.soNumero(s) === num)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐉𝐀́ 𝐄́ •\n\n❄️ Já é Lua Superior.\n🧊 @${num}\n\n"${nomeBot}"`, mentions: [alvo] }, { quoted: msg }) }
        cfg.subdonos.push(alvo); db.salvarConfig(cfg)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐍𝐎𝐕𝐀 𝐋𝐔𝐀 •\n\n❄️ Você agora vê como eu vejo.\n🧊 @${num}\n\n"${nomeBot}"`, mentions: [alvo] }, { quoted: msg })
      }
    },

    delsubdono: {
      aliases: ["delsub", "rmsub", "rmsubdono"],
      async executar({ sock, msg, db, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const alvo = utils.getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐃𝐄𝐋𝐒𝐔𝐁 •\n\n❄️ Marque o usuário.\n🧊 \`${p}delsubdono @user\`\n\n"${nomeBot}"` }, { quoted: msg }) }
        const cfg = db.config(); const num = utils.soNumero(alvo)
        cfg.subdonos = (cfg.subdonos || []).filter(s => utils.soNumero(s) !== num); db.salvarConfig(cfg)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐑𝐄𝐁𝐀𝐈𝐗𝐀𝐃𝐎 •\n\n❄️ Seus olhos se fecham.\n🧊 @${num}\n\n"${nomeBot}"`, mentions: [alvo] }, { quoted: msg })
      }
    },

    listasubdono: {
      aliases: ["subdonos", "listasub"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const cfg = db.config(); const subs = cfg.subdonos || []
        if (!subs.length) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐍𝐈𝐍𝐆𝐔𝐄́𝐌 •\n\n❄️ Só eu vejo a verdade.\n\n"${nomeBot}"` }, { quoted: msg }) }
        let txt = "💧 • 𝐋𝐔𝐀𝐒 𝐒𝐔𝐏𝐄𝐑𝐈𝐎𝐑𝐄𝐒 •\n\n❄️ Lista:\n\n"; const mentions = []
        subs.forEach((jidS, i) => { txt += `🧊 ${i + 1}. @${utils.soNumero(jidS)}\n`; mentions.push(jidS) })
        txt += `\n🧊 Total: ${subs.length}\n\n"${nomeBot}"`
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: txt, mentions }, { quoted: msg })
      }
    },

    prefixoglobal: {
      aliases: ["setprefixoglobal"],
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const novo = args[0]
        if (!novo || novo.length > 3) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐏𝐑𝐄𝐅𝐈𝐗𝐎 •\n\n❄️ Prefixo curto, pf.\n🧊 \`${p}prefixoglobal <s>\` (máx 3)\n\n"${nomeBot}"` }, { quoted: msg }) }
        const cfg = db.config(); cfg.prefixoGlobal = novo; db.salvarConfig(cfg)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐏𝐑𝐄𝐅𝐈𝐗𝐎 •\n\n❄️ Alterado\n🧊 \`${novo}\`\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    slow: {
      aliases: ["modolento"],
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐋𝐎𝐖 •\n\n❄️ Use on/off.\n🧊 \`${p}slow on/off\`\n\n"${nomeBot}"` }, { quoted: msg }) }
        const cfg = db.config(); cfg.slow = opcao === "on"; db.salvarConfig(cfg)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐌𝐎𝐃𝐎 𝐋𝐄𝐍𝐓𝐎 •\n\n❄️ ${opcao.toUpperCase()}\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    aluguel: {
      aliases: ["modoaluguel", "sistaluguel"],
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase(); const a = db.aluguel()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐀𝐋𝐔𝐆𝐔𝐄𝐋 •\n\n❄️ Status: ${a.ativo ? "ON ✅" : "OFF ❌"}\n🧊 \`${p}aluguel on/off\`\n\n"${nomeBot}"` }, { quoted: msg }) }
        a.ativo = opcao === "on"; db.salvarAluguel(a)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐀𝐋𝐔𝐆𝐔𝐄𝐋 •\n\n❄️ ${opcao.toUpperCase()}\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    addaluguel: {
      aliases: ["davaluguel", "setaluguel"], grupoOnly: true,
      async executar({ sock, msg, args, db, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const tempoStr = args.join(" ").trim().toLowerCase()
        if (!tempoStr) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐀𝐃𝐃𝐀𝐋𝐔𝐆𝐔𝐄𝐋 •\n\n❄️ Informe o tempo.\n🧊 1dia, 30min, 1mes...\n🧊 \`${p}addaluguel <tempo>\`\n\n"${nomeBot}"` }, { quoted: msg }) }
        const partes = tempoStr.split(/\s+/); let totalMs = 0
        for (const part of partes) { const m = part.match(/^(\d+)(min|h|dia|d|sem|mes|ano)$/); if (!m) continue; const v = parseInt(m[1]); const u = m[2]; let ms = 0; if (u === "min") ms = v * 60 * 1000; else if (u === "h") ms = v * 60 * 60 * 1000; else if (u === "d" || u === "dia") ms = v * 24 * 60 * 60 * 1000; else if (u === "sem") ms = v * 7 * 24 * 60 * 60 * 1000; else if (u === "mes") ms = v * 30 * 24 * 60 * 60 * 1000; else if (u === "ano") ms = v * 365 * 24 * 60 * 60 * 1000; totalMs += ms }
        if (totalMs <= 0) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ Formato inválido.\n\n"${nomeBot}"` }, { quoted: msg }) }
        const a = db.aluguel(); a.grupos = a.grupos || {}; const agora = Date.now(); const atual = (a.grupos[jid] > agora) ? a.grupos[jid] : agora
        a.grupos[jid] = atual + totalMs; if (!a.ativo) a.ativo = true; db.salvarAluguel(a)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐀𝐋𝐔𝐆𝐔𝐄𝐋 •\n\n❄️ Adicionado\n🧊 Expira em ${utils.formatarTempo(a.grupos[jid] - agora)}\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    listaaluguel: {
      aliases: ["alugueis", "veralugueis"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const a = db.aluguel(); const agora = Date.now()
        const entradas = Object.entries(a.grupos || {}).filter(e => e[1] > agora)
        if (!entradas.length) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐍𝐀𝐃𝐀 𝐀𝐋𝐔𝐆𝐀𝐃𝐎 •\n\n❄️ Vazio.\n\n"${nomeBot}"` }, { quoted: msg }) }
        let txt = "💧 • 𝐀𝐋𝐔𝐆𝐀𝐃𝐎𝐒 •\n\n❄️ Lista:\n\n"
        for (const [jidG, exp] of entradas) { try { const meta = await sock.groupMetadata(jidG); txt += `🧊 ${meta.subject || "?"} — ${utils.formatarTempo(exp - agora)}\n` } catch (_) { txt += `🧊 \`${jidG}\` — ${utils.formatarTempo(exp - agora)}\n` } }
        txt += `\n"${nomeBot}"`
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    delaluguel: {
      aliases: ["rmaluguel", "removeraluguel"],
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const a = db.aluguel(); a.grupos = a.grupos || {}
        if (!args.length && jid.endsWith("@g.us")) {
          if (!a.grupos[jid]) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐄𝐌 𝐀𝐋𝐔𝐆𝐔𝐄𝐋 •\n\n❄️ Vazio.\n\n"${nomeBot}"` }, { quoted: msg }) }
          delete a.grupos[jid]; db.salvarAluguel(a); await reagir(sock, msg, "💧")
          return sock.sendMessage(jid, { text: `💧 • 𝐋𝐈𝐁𝐄𝐑𝐓𝐀𝐃𝐎 •\n\n❄️ Aluguel removido.\n\n"${nomeBot}"` }, { quoted: msg })
        }
        await reagir(sock, msg, "❄️")
        await sock.sendMessage(jid, { text: `💧 • 𝐃𝐄𝐋𝐀𝐋𝐔𝐆𝐔𝐄𝐋 •\n\n❄️ Use em grupo: \`${p}delaluguel\`\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    banirgp: {
      aliases: ["bangp", "banirgrupo"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const b = db.bangp(); b.grupos = b.grupos || {}; b.grupos[jid] = true; db.salvarBangp(b)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐁𝐀𝐍𝐈𝐃𝐎 •\n\n❄️ Meus olhos não querem ver vocês.\n🧊 _"Tchau."_\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    desbanirgp: {
      aliases: ["desbangp"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const b = db.bangp()
        if (b.grupos && b.grupos[jid]) { delete b.grupos[jid]; db.salvarBangp(b); await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: `💧 • 𝐋𝐈𝐁𝐄𝐑𝐀𝐃𝐎 •\n\n❄️ Perdoado... uma vez.\n\n"${nomeBot}"` }, { quoted: msg }) }
        await reagir(sock, msg, "🧊")
        await sock.sendMessage(jid, { text: `💧 • 𝐍𝐀̃𝐎 𝐁𝐀𝐍𝐈𝐃𝐎 •\n\n❄️ Você não presta atenção.\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    listabangp: {
      aliases: ["gruposbanidos"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const b = db.bangp(); const grupos = Object.keys(b.grupos || {})
        if (!grupos.length) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐍𝐀𝐃𝐀 •\n\n❄️ Por enquanto.\n\n"${nomeBot}"` }, { quoted: msg }) }
        let txt = "💧 • 𝐁𝐀𝐍𝐈𝐃𝐎𝐒 •\n\n❄️ Lista:\n\n"; grupos.forEach((g, i) => { txt += `🧊 ${i + 1}. \`${g}\`\n` }); txt += `\n🧊 Total: ${grupos.length}\n\n"${nomeBot}"`
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    nuke: {
      aliases: ["explodir", "destruir"],
      async executar({ sock, msg, groupMetadata, utils, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        if (!jid.endsWith("@g.us")) return
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐏𝐑𝐄𝐂𝐈𝐒𝐎 𝐀𝐃𝐌 •\n\n❄️ Até o Grande Sábio precisa permissão.\n\n"${nomeBot}"` }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐍𝐔𝐊𝐄 •\n\n❄️ Não olhe pra trás.\n🧊 _"Habilidade Única: Aniquilação."_\n\n"${nomeBot}"` }, { quoted: msg })
        const meta = await sock.groupMetadata(jid); const botNum = utils.soNumero(sock.user && sock.user.id)
        const alvos = meta.participants.filter(p => utils.soNumero(p.id) !== botNum).map(p => p.id)
        for (const a of alvos) { try { await sock.groupParticipantsUpdate(jid, [a], "remove") } catch (_) {}; await new Promise(r => setTimeout(r, 500)) }
      }
    },

    limpargp: {
      aliases: ["limpargrupo"],
      async executar({ sock, msg, groupMetadata, utils, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        if (!jid.endsWith("@g.us")) return
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐏𝐑𝐄𝐂𝐈𝐒𝐎 𝐀𝐃𝐌 •\n\n❄️ Série...\n\n"${nomeBot}"` }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐋𝐈𝐌𝐏𝐄𝐙𝐀 •\n\n❄️ O silêncio observa.\n🧊 _"Os indignos partem."_\n\n"${nomeBot}"` }, { quoted: msg })
        const meta = await sock.groupMetadata(jid); const botNum = utils.soNumero(sock.user && sock.user.id)
        const alvos = meta.participants.filter(p => { if (utils.soNumero(p.id) === botNum) return false; if (p.admin === "admin" || p.admin === "superadmin") return false; return true }).map(p => p.id)
        for (const a of alvos) { try { await sock.groupParticipantsUpdate(jid, [a], "remove") } catch (_) {}; await new Promise(r => setTimeout(r, 500)) }
      }
    }

  }
}