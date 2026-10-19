/* ============================================================
   💧❄️🧊 MENU VIP - RIMURU BOT MD
   ============================================================ */

const fs = require("fs")
const path = require("path")
const os = require("os")
const { execSync } = require("child_process")

const DATA_DIR = path.join(__dirname, "..", "..", "data")

function dbLer(a, p = {}) {
  const f = path.join(DATA_DIR, a)
  if (!fs.existsSync(f)) { fs.writeFileSync(f, JSON.stringify(p, null, 2)); return p }
  try { return JSON.parse(fs.readFileSync(f, "utf8")) } catch { return p }
}
function dbSalvar(a, d) { fs.writeFileSync(path.join(DATA_DIR, a), JSON.stringify(d, null, 2)) }

async function reagir(sock, msg, emoji) {
  try { await sock.sendMessage(msg.key.remoteJid, { react: { text: emoji, key: msg.key } }) } catch (_) {}
}

function checarVip(db, sJ, isD, isS) {
  if (isD || isS) return true
  const v = (db.vips() || {}).vips || {}
  for (const j of sJ) {
    const n = String(j).split("@")[0].split(":")[0].replace(/\D/g, "")
    for (const [k, i] of Object.entries(v)) {
      if (String(k).split("@")[0].split(":")[0].replace(/\D/g, "") === n) {
        if (i.expira === "inf" || i.expira > Date.now()) return true
      }
    }
  }
  return false
}

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
  try {
    const subs = (db.config?.().subdonos || []).map(n => String(n).split("@")[0].split(":")[0].replace(/\D/g, ""))
    if (isSubDono || subs.includes(num)) return "💠 𝐋𝐔𝐀 𝐒𝐔𝐏𝐄𝐑𝐈𝐎𝐑"
  } catch (_) {}
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

async function baixarMusica(busca, qualidade = 64) {
  try {
    const apiRes = await fetch(`https://obanai-apis.eu.cc/api/dl/play?q=${encodeURIComponent(busca)}&apitoken=rj8SpI`)
    const apiData = await apiRes.json()
    if (apiData.success && apiData.data?.url?.mp3) {
      const audioRes = await fetch(apiData.data.url.mp3)
      const buffer = Buffer.from(await audioRes.arrayBuffer())
      if (buffer.length > 0 && buffer.length < 16 * 1024 * 1024) return { ok: true, buffer, titulo: apiData.data.titulo || busca, info: apiData.data }
      if (buffer.length >= 16 * 1024 * 1024) return { ok: false, erro: "Música muito grande (limite 16MB)" }
    }
  } catch (e) {}
  try {
    const youtubeDl = require("youtube-dl-exec")
    const tmpDir = os.tmpdir()
    const id = Date.now() + "_" + Math.floor(Math.random() * 9999)
    const outTpl = path.join(tmpDir, "rimuru_mus_" + id + ".%(ext)s")
    const ehUrl = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|music\.youtube\.com)/i.test(busca)
    const alvo = ehUrl ? busca : "ytsearch1:" + busca
    await youtubeDl(alvo, { extractAudio: true, audioFormat: "mp3", audioQuality: qualidade + "K", output: outTpl, noPlaylist: true, maxFilesize: "16M", noWarnings: true, noCheckCertificates: true, extractorArgs: "youtube:player_client=web,web_safari,web_embedded", noCacheDir: true })
    const prefixo = "rimuru_mus_" + id
    const arquivos = fs.readdirSync(tmpDir).filter(f => f.startsWith(prefixo) && (f.endsWith(".mp3") || f.endsWith(".m4a") || f.endsWith(".webm") || f.endsWith(".opus")))
    if (arquivos.length > 0) {
      const caminho = path.join(tmpDir, arquivos[0])
      const buffer = fs.readFileSync(caminho)
      try { fs.unlinkSync(caminho) } catch (_) {}
      if (buffer.length < 16 * 1024 * 1024) return { ok: true, buffer, titulo: busca }
      return { ok: false, erro: "Música muito grande (limite 16MB)" }
    }
  } catch (e) {}
  return { ok: false, erro: "Todas as tentativas falharam. Tente outra música." }
}

async function baixarInstagram(link) {
  try {
    const youtubeDl = require("youtube-dl-exec")
    const tmpDir = os.tmpdir()
    const id = Date.now() + "_" + Math.floor(Math.random() * 9999)
    const outTpl = path.join(tmpDir, "rimuru_insta_" + id + ".%(ext)s")
    await youtubeDl(link, { output: outTpl, noPlaylist: true, noWarnings: true, noCheckCertificates: true })
    const prefixo = "rimuru_insta_" + id
    const arquivos = fs.readdirSync(tmpDir).filter(f => f.startsWith(prefixo) && !f.endsWith(".part") && !f.endsWith(".ytdl"))
    if (arquivos.length > 0) {
      const caminho = path.join(tmpDir, arquivos[0])
      const buffer = fs.readFileSync(caminho)
      const ehVideo = /\.(mp4|mov|webm|mkv)$/i.test(arquivos[0])
      try { fs.unlinkSync(caminho) } catch (_) {}
      return { ok: true, buffer, ehVideo }
    }
    return { ok: false, erro: "Arquivo não encontrado" }
  } catch (e) { return { ok: false, erro: e.message } }
}

async function baixarTikTok(u) {
  try {
    const r = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(u)}&hd=1`)
    const d = await r.json()
    if (d.code !== 0 || !d.data || !d.data.play) throw new Error("Falha no link.")
    return d.data.play
  } catch (e) { throw new Error("Falha no TikTok: " + e.message) }
}

async function enviarFigTexto(sock, jid, buf, texto, quoted) {
  try {
    const sharp = require("sharp")
    const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    const t = texto.toUpperCase()
    const T = 512
    const F = t.length > 30 ? 36 : t.length > 15 ? 48 : 60
    const svg = `<svg width="${T}" height="${T}" xmlns="http://www.w3.org/2000/svg"><text x="${T/2}" y="${F+10}" font-family="Arial, sans-serif" font-size="${F}" font-weight="900" fill="#FFFFFF" stroke="#000000" stroke-width="4" text-anchor="middle" paint-order="stroke fill">${esc(t)}</text></svg>`
    const ov = await sharp(Buffer.from(svg)).png().toBuffer()
    const out = await sharp(buf, { animated: false }).resize(T, T, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).composite([{ input: ov, top: 0, left: 0 }]).webp({ quality: 90 }).toBuffer()
    await sock.sendMessage(jid, { sticker: out }, { quoted })
  } catch (e) { await sock.sendMessage(jid, { text: "💧💢 " + e.message }, { quoted }) }
}

module.exports = {
  menu: "menu-vip",
  grupoOnly: false,
  adminOnly: false,
  donoOnly: false,

  commands: {

    menuvip: {
      aliases: ["vipmenu", "menuv"],
      async executar({ sock, msg, prefixoAtivo, db, sender, config, isDono, isSubDono, isAdmin, groupMetadata }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo
        const nomeBot = nomeBotDb(db)
        const { pushName, nomeDono, cargo } = getCargoETexto({ sender, config, db, groupMetadata, isDono, isSubDono, isAdmin, msg })
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        await reagir(sock, msg, "💧")
        const texto = `${cardPerfil({ nomeBot, nomeUsuario: pushName, cargo, dono: nomeDono })}

${secao("🎵 ᴍᴜ́sɪᴄᴀ")}
${item("!play <nome> / !spot <link>")}
${item("!soundcloud <nome>")}

${secao("📥 ᴅᴏᴡɴʟᴏᴀᴅs")}
${item("!insta <link> / !tiktok <link>")}
${item("!pinterest <busca>")}

${secao("📰 ɴᴏᴛɪ́ᴄɪᴀs")}
${item("!g1 / !uol / !jovempan")}
${item("!vasco")}

${secao("🔍 ᴇsᴛᴀᴛɪ́sᴛɪᴄᴀs")}
${item("!tiktoktag <hashtag>")}

${secao("🎨 ғɪɢᴜʀɪɴʜᴀs")}
${item("!brat / !s / !rename")}
${item("!smeme / !s3")}
${item("!procurado / !wasted / !revela")}

${secao("🛠️ ғᴇʀʀᴀᴍᴇɴᴛᴀs")}
${item("!gerarnick <txt>")}
${item("!llamacoder <desc>")}

${secao("🤖 ɪɴᴛᴇʟɪɢᴇ̂ɴᴄɪᴀ")}
${item("!unliai <pergunta>")}
${item("!axis <pergunta>")}
${item("!mito / !napoleao / !fraseprofunda")}

${secao("📅 ᴜᴛɪʟɪᴅᴀᴅᴇs")}
${item("!feriados [ano]")}

${secao("🌸 ᴅɪᴠᴇʀsᴀ̃ᴏ")}
${item("!waifu")}

${secao("⚙️ ᴀᴜᴛᴏ")}
${item("!autofig on/off")}
${item("!autottk on/off")}

💧 Prefixo: \`${p}\`

"${nomeBot}"`
        const cfg = db.config()
        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          if (cfg.tipoMenu === "video") return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "rimuru.mp4", gifPlayback: true, caption: texto }, { quoted: msg })
          return sock.sendMessage(jid, { image: buf, caption: texto }, { quoted: msg })
        }
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    play: {
      aliases: ["tocar", "musica", "music"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n❄️ Música é privilégio dos nobres.\n\n"${nomeBot}"` }, { quoted: msg }) }
        const busca = args.join(" ").trim()
        if (!busca) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐏𝐋𝐀𝐘 •\n\n❄️ Me diga o que quer ouvir.\n🧊 \`!play <nome>\`\n\n"${nomeBot}"` }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐁𝐔𝐒𝐂𝐀𝐍𝐃𝐎 •\n\n❄️ Procurando a música...\n\n"${nomeBot}"` }, { quoted: msg })
        const res = await baixarMusica(busca, 32)
        if (!res.ok) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ ${res.erro}\n\n"${nomeBot}"` }, { quoted: msg }) }
        if (res.info && res.info.thumb) { try { await sock.sendMessage(jid, { image: { url: res.info.thumb }, caption: `💧 • 𝐏𝐋𝐀𝐘 •\n\n❄️ Tocando agora\n🧊 ${res.info.titulo || busca}\n🧊 👤 ${res.info.canal || "?"}\n🧊 ⏱️ ${res.info.duracao || "?"}\n\n"${nomeBot}"` }, { quoted: msg }) } catch (_) {} }
        if (res.buffer.length > 16 * 1024 * 1024) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐌𝐔𝐈𝐓𝐎 𝐆𝐑𝐀𝐍𝐃𝐄 •\n\n❄️ Limite: 16MB\n\n"${nomeBot}"` }, { quoted: msg }) }
        await sock.sendMessage(jid, { audio: res.buffer, mimetype: "audio/mpeg", ptt: false, fileName: busca.slice(0, 30) + ".mp3" }, { quoted: msg })
      }
    },

    spot: {
      aliases: ["spotify", "musicaspot", "spotdl"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n❄️ Só nobres!\n\n"${nomeBot}"` }, { quoted: msg }) }
        const link = args[0]
        if (!link || !/open\.spotify\.com/i.test(link)) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐏𝐎𝐓 •\n\n❄️ Informe um link do Spotify.\n\n"${nomeBot}"` }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐒𝐏𝐎𝐓𝐈𝐅𝐘 •\n\n❄️ Baixando...\n\n"${nomeBot}"` }, { quoted: msg })
        try {
          const SpottyDL = require("spottydl")
          const tmpDir = os.tmpdir()
          const id = Date.now() + "_" + Math.floor(Math.random() * 9999)
          const pastaTemp = path.join(tmpDir, "rimuru_spot_" + id)
          if (!fs.existsSync(pastaTemp)) fs.mkdirSync(pastaTemp, { recursive: true })
          const trackInfo = await SpottyDL.getTrack(link)
          if (!trackInfo || !trackInfo.title) throw new Error("Link inválido")
          const resultado = await SpottyDL.downloadTrack(trackInfo, pastaTemp)
          if (!resultado || !resultado[0] || resultado[0].status !== "Success") throw new Error("Falha ao baixar")
          const arquivoBaixado = resultado[0].filename
          if (!fs.existsSync(arquivoBaixado)) throw new Error("Arquivo não encontrado")
          const buffer = fs.readFileSync(arquivoBaixado)
          try { fs.unlinkSync(arquivoBaixado) } catch (_) {}
          try { fs.rmSync(pastaTemp, { recursive: true, force: true }) } catch (_) {}
          if (buffer.length > 16 * 1024 * 1024) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐌𝐔𝐈𝐓𝐎 𝐆𝐑𝐀𝐍𝐃𝐄 •\n\n❄️ Limite: 16MB\n\n"${nomeBot}"` }, { quoted: msg }) }
          await sock.sendMessage(jid, { audio: buffer, mimetype: "audio/mpeg", ptt: false, fileName: trackInfo.title + ".mp3" }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ ${e.message}\n\n"${nomeBot}"` }, { quoted: msg }) }
      }
    },

    soundcloud: {
      aliases: ["sc"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n❄️ Só nobres!\n\n"${nomeBot}"` }, { quoted: msg }) }
        const busca = args.join(" ").trim()
        if (!busca) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐎𝐔𝐍𝐃𝐂𝐋𝐎𝐔𝐃 •\n\n❄️ Informe a música.\n🧊 \`!soundcloud <nome>\`\n\n"${nomeBot}"` }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐒𝐎𝐔𝐍𝐃𝐂𝐋𝐎𝐔𝐃 •\n\n❄️ Procurando...\n\n"${nomeBot}"` }, { quoted: msg })
        try {
          const sR = await fetch(`https://obanai-apis.eu.cc/api/search/soundcloud?q=${encodeURIComponent(busca)}&apitoken=rj8SpI`)
          const sD = await sR.json()
          if (!sD.success || !sD.data?.data?.length) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐄𝐈 •\n\n❄️ Nada encontrado.\n\n"${nomeBot}"` }, { quoted: msg }) }
          const m = sD.data.data[0]
          const segs = parseInt(m.duration)
          const durFmt = `${Math.floor(segs / 60)}:${(segs % 60).toString().padStart(2, "0")}`
          await sock.sendMessage(jid, { image: { url: m.thumbnail }, caption: `💧 • 𝐒𝐎𝐔𝐍𝐃𝐂𝐋𝐎𝐔𝐃 •\n\n🧊 ${m.title}\n🧊 🎤 ${m.artist}\n🧊 ⏱️ ${durFmt}\n\n"${nomeBot}"` }, { quoted: msg })
          const dlR = await fetch(`https://obanai-apis.eu.cc/api/dl/soundcloud?url=${encodeURIComponent(m.url)}&apitoken=rj8SpI`)
          const dlD = await dlR.json()
          if (!dlD.success || !dlD.data?.download_url) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ Falha ao baixar.\n\n"${nomeBot}"` }, { quoted: msg }) }
          const aR = await fetch(dlD.data.download_url)
          const aBuf = Buffer.from(await aR.arrayBuffer())
          if (aBuf.length > 16 * 1024 * 1024) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐌𝐔𝐈𝐓𝐎 𝐆𝐑𝐀𝐍𝐃𝐄 •\n\n❄️ Limite: 16MB\n\n"${nomeBot}"` }, { quoted: msg }) }
          await sock.sendMessage(jid, { audio: aBuf, mimetype: "audio/mpeg", ptt: false }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ ${e.message}\n\n"${nomeBot}"` }, { quoted: msg }) }
      }
    },

    pinterest: {
      aliases: ["pin"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n❄️ Só nobres!\n\n"${nomeBot}"` }, { quoted: msg }) }
        const busca = args.join(" ").trim()
        if (!busca) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐏𝐈𝐍𝐓𝐄𝐑𝐄𝐒𝐓 •\n\n❄️ Informe a busca.\n🧊 \`!pinterest <busca>\`\n\n"${nomeBot}"` }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐏𝐈𝐍𝐓𝐄𝐑𝐄𝐒𝐓 •\n\n❄️ Procurando "${busca}"...\n\n"${nomeBot}"` }, { quoted: msg })
        try {
          const r = await fetch(`https://obanai-apis.eu.cc/api/dl/pinterest?q=${encodeURIComponent(busca)}&apitoken=rj8SpI`)
          const data = await r.json()
          if (!data.success || !data.data || !data.data.length) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐄𝐈 •\n\n❄️ Nenhuma imagem.\n\n"${nomeBot}"` }, { quoted: msg }) }
          const items = data.data.slice(0, 5)
          for (const item of items) { try { await sock.sendMessage(jid, { image: { url: item.image }, caption: `💧 • 𝐏𝐈𝐍𝐓𝐄𝐑𝐄𝐒𝐓 •\n\n🧊 ${item.title || "Sem título"}\n\n"${nomeBot}"` }, { quoted: msg }); await new Promise(r => setTimeout(r, 600)) } catch (e) { console.log("Erro pinterest:", e.message) } }
        } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ ${e.message}\n\n"${nomeBot}"` }, { quoted: msg }) }
      }
    },

    tiktoktag: {
      aliases: ["hashtag", "tttag"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n❄️ Só nobres!\n\n"${nomeBot}"` }, { quoted: msg }) }
        const busca = args.join(" ").trim()
        if (!busca) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐓𝐈𝐊𝐓𝐎𝐊 𝐓𝐀𝐆 •\n\n❄️ Informe a hashtag.\n🧊 \`!tiktoktag <tag>\`\n\n"${nomeBot}"` }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐓𝐈𝐊𝐓𝐎𝐊 𝐓𝐀𝐆 •\n\n❄️ Analisando #${busca}...\n\n"${nomeBot}"` }, { quoted: msg })
        try {
          const r = await fetch(`https://obanai-apis.eu.cc/api/search/tiktok-tag?q=${encodeURIComponent(busca)}&apitoken=rj8SpI`, { headers: { "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36" } })
          const data = await r.json()
          if (!data.success) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ Não consegui obter estatísticas.\n\n"${nomeBot}"` }, { quoted: msg }) }
          const res = data.data
          let txt = `💧 • 𝐓𝐈𝐊𝐓𝐎𝐊 #${busca} •\n\n❄️ Estatísticas\n\n🧊 Posts: ${res.posts || "N/A"}\n🧊 Views: ${res.views || "N/A"}\n🧊 Views/post: ${res.viewsPerPost || "N/A"}\n🧊 Hashtags: ${res.mostPopular || "N/A"}\n\n🧊 Trending:\n`
          if (res.trending && res.trending.length > 0) { for (const tag of res.trending.slice(0, 10)) txt += `🧊 #${tag.hashtag} — ${tag.posts}\n` } else txt += `🧊 _Sem dados_\n`
          txt += `\n"${nomeBot}"`
          await sock.sendMessage(jid, { text: txt }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ ${e.message}\n\n"${nomeBot}"` }, { quoted: msg }) }
      }
    },

    axis: {
      aliases: ["axiais"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n❄️ Só nobres!\n\n"${nomeBot}"` }, { quoted: msg }) }
        const pergunta = args.join(" ").trim()
        if (!pergunta) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐀𝐗𝐈𝐒 •\n\n❄️ Informe a pergunta.\n🧊 \`!axis <pergunta>\`\n\n"${nomeBot}"` }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        try {
          await sock.sendPresenceUpdate("composing", jid)
          await sock.sendMessage(jid, { text: `💧 • 𝐀𝐗𝐈𝐒 •\n\n❄️ Consultando o Grande Sábio...\n🧊 ${pergunta}\n\n"${nomeBot}"` }, { quoted: msg })
          const r = await fetch(`https://obanai-apis.eu.cc/api/ias/axis?q=${encodeURIComponent(pergunta)}&apitoken=rj8SpI`)
          const data = await r.json()
          if (!data?.success) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ IA indisponível.\n\n"${nomeBot}"` }, { quoted: msg }) }
          await sock.sendMessage(jid, { text: data.data.texto }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ ${e.message}\n\n"${nomeBot}"` }, { quoted: msg }) }
      }
    },

    g1: {
      aliases: ["noticiag1"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        await reagir(sock, msg, "💧")
        try {
          const r = await fetch(`https://obanai-apis.eu.cc/api/noticias/g1?apitoken=rj8SpI`)
          const data = await r.json()
          if (!data?.status || !data.data?.resultado?.length) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐆𝟏 •\n\n❄️ Erro.\n\n"${nomeBot}"` }, { quoted: msg }) }
          const n = data.data.resultado[Math.floor(Math.random() * data.data.resultado.length)]
          await sock.sendMessage(jid, { text: `💧 • 𝐆𝟏 •\n\n❄️ ${n.noticia}\n\n🧊 ${n.secao}\n🧊 ${n.data}\n\n🧊 ${n.desc}\n\n🧊 ${n.link}\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ ${e.message}\n\n"${nomeBot}"` }, { quoted: msg }) }
      }
    },

    uol: {
      aliases: ["noticiauol"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        await reagir(sock, msg, "💧")
        try {
          const r = await fetch(`https://obanai-apis.eu.cc/api/noticias/uol?apitoken=rj8SpI`)
          const data = await r.json()
          if (!data?.status || !data.data?.resultado?.length) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐔𝐎𝐋 •\n\n❄️ Erro.\n\n"${nomeBot}"` }, { quoted: msg }) }
          const n = data.data.resultado[Math.floor(Math.random() * data.data.resultado.length)]
          await sock.sendMessage(jid, { text: `💧 • 𝐔𝐎𝐋 •\n\n❄️ ${n.noticia}\n\n🧊 ${n.secao}\n🧊 ${n.desc}\n🧊 ${n.link}\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ ${e.message}\n\n"${nomeBot}"` }, { quoted: msg }) }
      }
    },

    jovempan: {
      aliases: ["jp", "noticiajp"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        await reagir(sock, msg, "💧")
        try {
          const r = await fetch(`https://obanai-apis.eu.cc/api/noticias/jovempan?apitoken=rj8SpI`)
          const data = await r.json()
          if (!data?.status || !data.data?.resultado?.length) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐉𝐎𝐕𝐄𝐌 𝐏𝐀𝐍 •\n\n❄️ Erro.\n\n"${nomeBot}"` }, { quoted: msg }) }
          const n = data.data.resultado[Math.floor(Math.random() * data.data.resultado.length)]
          await sock.sendMessage(jid, { text: `💧 • 𝐉𝐎𝐕𝐄𝐌 𝐏𝐀𝐍 •\n\n❄️ ${n.noticia}\n\n🧊 ${n.secao}\n🧊 ${n.data}\n🧊 ${n.desc}\n🧊 ${n.link}\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ ${e.message}\n\n"${nomeBot}"` }, { quoted: msg }) }
      }
    },

    vasco: {
      aliases: ["noticiavasco", "vascao"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        await reagir(sock, msg, "💧")
        try {
          const r = await fetch(`https://obanai-apis.eu.cc/api/noticias/vasco?apitoken=rj8SpI`)
          const data = await r.json()
          if (!data?.status || !data.data?.resultado?.length) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐕𝐀𝐒𝐂𝐎 •\n\n❄️ Erro.\n\n"${nomeBot}"` }, { quoted: msg }) }
          const n = data.data.resultado[Math.floor(Math.random() * data.data.resultado.length)]
          await sock.sendMessage(jid, { text: `💧 • 𝐕𝐀𝐒𝐂𝐎 •\n\n❄️ ${n.noticia}\n\n🧊 ${n.desc}\n🧊 ${n.link}\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ ${e.message}\n\n"${nomeBot}"` }, { quoted: msg }) }
      }
    },

    gerarnick: {
      aliases: ["nick", "nickname"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n❄️ Só nobres!\n\n"${nomeBot}"` }, { quoted: msg }) }
        const texto = args.join(" ").trim()
        if (!texto) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐆𝐄𝐑𝐀𝐑𝐍𝐈𝐂𝐊 •\n\n❄️ Informe o texto.\n\n"${nomeBot}"` }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        try {
          const textoLimpo = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          const r = await fetch(`https://obanai-apis.eu.cc/api/tools/gerarnick?texto=${encodeURIComponent(textoLimpo)}&apitoken=rj8SpI`)
          const data = await r.json()
          if (!data?.success || !data.data?.length) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ Não consegui gerar.\n\n"${nomeBot}"` }, { quoted: msg }) }
          let txt = `💧 • 𝐍𝐈𝐂𝐊𝐒 •\n\n❄️ Estilos para "${textoLimpo}":\n\n`
          data.data.forEach((n, i) => { txt += `🧊 ${i + 1}. \`${n.nome}\`\n` })
          txt += `\n💡 Segure pra copiar.\n\n"${nomeBot}"`
          await sock.sendMessage(jid, { text: txt }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ ${e.message}\n\n"${nomeBot}"` }, { quoted: msg }) }
      }
    },

    feriados: {
      aliases: ["feriado", "calendario"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const ano = (args[0] && /^\d{4}$/.test(args[0].trim())) ? args[0].trim() : new Date().getFullYear()
        await reagir(sock, msg, "💧")
        try {
          const r = await fetch(`https://obanai-apis.eu.cc/api/outros/feriados?ano=${ano}&apitoken=rj8SpI`)
          const data = await r.json()
          if (!data?.success || !data.data?.total) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐅𝐄𝐑𝐈𝐀𝐃𝐎𝐒 •\n\n❄️ Nenhum feriado.\n\n"${nomeBot}"` }, { quoted: msg }) }
          const lista = data.data.feriados.map(f => `🧊 ${f.date} — ${f.name} (${f.weekday})`).join("\n")
          await sock.sendMessage(jid, { text: `💧 • 𝐅𝐄𝐑𝐈𝐀𝐃𝐎𝐒 ${data.data.ano} •\n\n❄️ Lista:\n\n${lista}\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ ${e.message}\n\n"${nomeBot}"` }, { quoted: msg }) }
      }
    },

    unliai: {
      aliases: ["ia", "unli", "chatia"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const pergunta = args.join(" ").trim()
        if (!pergunta) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐔𝐍𝐋𝐈𝐀𝐈 •\n\n❄️ Informe a pergunta.\n\n"${nomeBot}"` }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        try {
          await sock.sendPresenceUpdate("composing", jid)
          const r = await fetch(`https://obanai-apis.eu.cc/api/ias/unliai?q=${encodeURIComponent(pergunta)}&apitoken=rj8SpI`)
          const data = await r.json()
          if (!data?.success || !data?.response) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ IA indisponível.\n\n"${nomeBot}"` }, { quoted: msg }) }
          await sock.sendMessage(jid, { text: data.response }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ ${e.message}\n\n"${nomeBot}"` }, { quoted: msg }) }
      }
    },

    insta: {
      aliases: ["instagram", "instadl", "ig"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n❄️ Só nobres!\n\n"${nomeBot}"` }, { quoted: msg }) }
        const link = args[0]
        if (!link || !/instagram\.com|instagr\.am/i.test(link)) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐈𝐍𝐒𝐓𝐀 •\n\n❄️ Informe um link.\n\n"${nomeBot}"` }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        try {
          const res = await baixarInstagram(link)
          if (!res.ok) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ ${res.erro}\n\n"${nomeBot}"` }, { quoted: msg }) }
          const buffer = res.buffer
          if (buffer.length > 16 * 1024 * 1024) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐌𝐔𝐈𝐓𝐎 𝐆𝐑𝐀𝐍𝐃𝐄 •\n\n❄️ Limite: 16MB\n\n"${nomeBot}"` }, { quoted: msg }) }
          if (res.ehVideo) await sock.sendMessage(jid, { video: buffer, mimetype: "video/mp4", fileName: "instagram.mp4" }, { quoted: msg })
          else await sock.sendMessage(jid, { image: buffer, caption: `💧 • 𝐈𝐍𝐒𝐓𝐀𝐆𝐑𝐀𝐌 •\n\n❄️ Mídia baixada.\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ ${e.message}\n\n"${nomeBot}"` }, { quoted: msg }) }
      }
    },

    tiktok: {
      aliases: ["tt", "ttk"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n❄️ Só nobres!\n\n"${nomeBot}"` }, { quoted: msg }) }
        const link = args[0]
        if (!link || !/tiktok\.com|vm\.tiktok|vt\.tiktok/i.test(link)) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐓𝐈𝐊𝐓𝐎𝐊 •\n\n❄️ Informe um link.\n\n"${nomeBot}"` }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        try {
          const url = await baixarTikTok(link)
          const r = await fetch(url)
          await sock.sendMessage(jid, { video: Buffer.from(await r.arrayBuffer()), mimetype: "video/mp4", fileName: "tiktok.mp4" }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ ${e.message}\n\n"${nomeBot}"` }, { quoted: msg }) }
      }
    },

    autofig: {
      aliases: ["autosticker", "autofigu"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n❄️ Só nobres!\n\n"${nomeBot}"` }, { quoted: msg }) }
        if (!jid.endsWith("@g.us")) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐀𝐔𝐓𝐎𝐅𝐈𝐆 •\n\n❄️ Só em grupos.\n\n"${nomeBot}"` }, { quoted: msg }) }
        const op = (args[0] || "").toLowerCase()
        const ac = dbLer("autocfg.json", { grupos: {} })
        ac.grupos = ac.grupos || {}
        ac.grupos[jid] = ac.grupos[jid] || {}
        if (!["on", "off"].includes(op)) {
          const s = ac.grupos[jid].autofig ? "ON ✅" : "OFF ❌"
          await reagir(sock, msg, "❄️")
          return sock.sendMessage(jid, { text: `💧 • 𝐀𝐔𝐓𝐎𝐅𝐈𝐆 •\n\n❄️ Status: ${s}\n🧊 \`!autofig on/off\`\n\n"${nomeBot}"` }, { quoted: msg })
        }
        ac.grupos[jid].autofig = op === "on"
        dbSalvar("autocfg.json", ac)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐀𝐔𝐓𝐎𝐅𝐈𝐆 •\n\n❄️ ${op.toUpperCase()}\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    autottk: {
      aliases: ["autotiktok", "autott"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n❄️ Só nobres!\n\n"${nomeBot}"` }, { quoted: msg }) }
        if (!jid.endsWith("@g.us")) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐀𝐔𝐓𝐎𝐓𝐓𝐊 •\n\n❄️ Só em grupos.\n\n"${nomeBot}"` }, { quoted: msg }) }
        const op = (args[0] || "").toLowerCase()
        const ac = dbLer("autocfg.json", { grupos: {} })
        ac.grupos = ac.grupos || {}
        ac.grupos[jid] = ac.grupos[jid] || {}
        if (!["on", "off"].includes(op)) {
          const s = ac.grupos[jid].autottk ? "ON ✅" : "OFF ❌"
          await reagir(sock, msg, "❄️")
          return sock.sendMessage(jid, { text: `💧 • 𝐀𝐔𝐓𝐎𝐓𝐓𝐊 •\n\n❄️ Status: ${s}\n🧊 \`!autottk on/off\`\n\n"${nomeBot}"` }, { quoted: msg })
        }
        ac.grupos[jid].autottk = op === "on"
        dbSalvar("autocfg.json", ac)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐀𝐔𝐓𝐎𝐓𝐓𝐊 •\n\n❄️ ${op.toUpperCase()}\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    revela: {
      aliases: ["revelar", "reveal", "ver"],
      async executar({ sock, msg, db, utils, isDono, isSubDono }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n❄️ Só nobres!\n\n"${nomeBot}"` }, { quoted: msg }) }
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        let q = ctx.quotedMessage
        if (!q) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐑𝐄𝐕𝐄𝐋𝐀 •\n\n❄️ Responda uma msg de ver uma vez.\n\n"${nomeBot}"` }, { quoted: msg }) }
        let isVU = false
        if (q.viewOnceMessageV2) { q = q.viewOnceMessageV2.message || q.viewOnceMessageV2; isVU = true }
        else if (q.viewOnceMessage) { q = q.viewOnceMessage.message || q.viewOnceMessage; isVU = true }
        const img = q.imageMessage, vid = q.videoMessage, aud = q.audioMessage
        if (img && img.viewOnce) isVU = true
        if (vid && vid.viewOnce) isVU = true
        if (aud && aud.viewOnce) isVU = true
        if (!isVU) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐍𝐀̃𝐎 𝐄́ 𝐕𝐄𝐑 𝐔𝐌𝐀 𝐕𝐄𝐙 •\n\n❄️ Não é oculta.\n\n"${nomeBot}"` }, { quoted: msg }) }
        if (!img && !vid && !aud) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐄𝐌 𝐌𝐈́𝐃𝐈𝐀 •\n\n"${nomeBot}"` }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        try {
          const tipo = img ? "image" : vid ? "video" : "audio"
          const alvo = Object.assign({}, msg, { message: tipo === "image" ? { imageMessage: img } : tipo === "video" ? { videoMessage: vid } : { audioMessage: aud } })
          const buf = await utils.downloadMediaMessage(alvo, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          if (tipo === "image") await sock.sendMessage(jid, { image: buf, caption: `💧 • 𝐑𝐄𝐕𝐄𝐋𝐀𝐃𝐎 •\n\n"${nomeBot}"` }, { quoted: msg })
          else if (tipo === "video") await sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", caption: `💧 • 𝐑𝐄𝐕𝐄𝐋𝐀𝐃𝐎 •\n\n"${nomeBot}"` }, { quoted: msg })
          else await sock.sendMessage(jid, { audio: buf, mimetype: "audio/mp4", ptt: false }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ ${e.message}\n\n"${nomeBot}"` }, { quoted: msg }) }
      }
    },

    brat: {
      aliases: ["figbrat"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n❄️ Só nobres!\n\n"${nomeBot}"` }, { quoted: msg }) }
        const t = args.join(" ").trim()
        if (!t) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐁𝐑𝐀𝐓 •\n\n❄️ Informe o texto.\n\n"${nomeBot}"` }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        try {
          const sharp = require("sharp")
          const T = 512; const F = t.length > 40 ? 40 : t.length > 20 ? 55 : 70
          const pal = t.split(" "); const lin = []; let la = "", mc = t.length > 40 ? 12 : t.length > 20 ? 10 : 8
          for (const pa of pal) { if ((la + " " + pa).trim().length <= mc) la = (la + " " + pa).trim(); else { if (la) lin.push(la); la = pa } }
          if (la) lin.push(la)
          const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          const aL = F + 15; const aT = lin.length * aL; const yI = (T - aT) / 2 + F
          let tsp = ""
          lin.forEach((l, i) => { const y = yI + i * aL; tsp += `<text x="${T/2}" y="${y}" font-family="Arial" font-size="${F}" font-weight="bold" fill="#000" text-anchor="middle">${esc(l)}</text>` })
          const svg = `<svg width="${T}" height="${T}" xmlns="http://www.w3.org/2000/svg"><rect width="${T}" height="${T}" fill="#FFF"/>${tsp}</svg>`
          const buf = await sharp(Buffer.from(svg)).webp({ quality: 90 }).toBuffer()
          await sock.sendMessage(jid, { sticker: buf }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ ${e.message}\n\n"${nomeBot}"` }, { quoted: msg }) }
      }
    },

    s: {
      aliases: ["sticker", "fig"],
      async executar({ sock, msg, db, isDono, isSubDono, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n"${nomeBot}"` }, { quoted: msg }) }
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const q = ctx.quotedMessage
        const eImg = q && q.imageMessage; const eVid = q && q.videoMessage
        if (!eImg && !eVid) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐒 •\n\n❄️ Responda foto ou vídeo.\n\n"${nomeBot}"` }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        try {
          const sharp = require("sharp"); const ff = require("@ffmpeg-installer/ffmpeg").path; const { execSync } = require("child_process")
          const alvo = Object.assign({}, msg, { message: eImg ? { imageMessage: q.imageMessage } : { videoMessage: q.videoMessage } })
          const buf = await utils.downloadMediaMessage(alvo, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          let wp
          if (eImg) wp = await sharp(buf).resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 90 }).toBuffer()
          else {
            const tIn = path.join(os.tmpdir(), "s_" + Date.now() + ".mp4"); const tOut = path.join(os.tmpdir(), "s_" + Date.now() + ".webp")
            fs.writeFileSync(tIn, buf)
            execSync(`"${ff}" -y -i "${tIn}" -vcodec libwebp -filter:v "fps=15,scale=512:512:force_original_aspect_ratio=decrease" -lossless 0 -compression_level 6 -q:v 50 -loop 0 -preset default -an -vsync 0 -s 512:512 "${tOut}"`, { stdio: "ignore" })
            wp = fs.readFileSync(tOut); try { fs.unlinkSync(tIn) } catch (_) {}; try { fs.unlinkSync(tOut) } catch (_) {}
          }
          await sock.sendMessage(jid, { sticker: wp }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ ${e.message}\n\n"${nomeBot}"` }, { quoted: msg }) }
      }
    },

    s3: {
      aliases: ["esticar", "stretch", "gordo"],
      async executar({ sock, msg, db, isDono, isSubDono, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n"${nomeBot}"` }, { quoted: msg }) }
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const q = ctx.quotedMessage
        const eSti = q && q.stickerMessage; const eImg = q && q.imageMessage; const eVid = q && q.videoMessage
        if (!eSti && !eImg && !eVid) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝟑 •\n\n❄️ Responda fig, foto ou vídeo.\n\n"${nomeBot}"` }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        try {
          const sharp = require("sharp"); const ff = require("@ffmpeg-installer/ffmpeg").path; const { execSync } = require("child_process")
          let alvo
          if (eSti) alvo = Object.assign({}, msg, { message: { stickerMessage: q.stickerMessage } })
          else if (eImg) alvo = Object.assign({}, msg, { message: { imageMessage: q.imageMessage } })
          else alvo = Object.assign({}, msg, { message: { videoMessage: q.videoMessage } })
          const buf = await utils.downloadMediaMessage(alvo, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          const T = 512; const alturaFinal = Math.floor(T * 0.6); const paddingVertical = Math.floor((T - alturaFinal) / 2)
          let resultado
          if (eVid) {
            const tIn = path.join(os.tmpdir(), "s3_" + Date.now() + ".mp4"); const tOut = path.join(os.tmpdir(), "s3_" + Date.now() + ".webp")
            fs.writeFileSync(tIn, buf)
            execSync(`"${ff}" -y -i "${tIn}" -vcodec libwebp -filter:v "fps=15,scale=512:307:force_original_aspect_ratio=disable,pad=512:512:0:102:color=0x00000000" -lossless 0 -compression_level 6 -q:v 60 -loop 0 -preset default -an -vsync 0 -s 512:512 "${tOut}"`, { stdio: "ignore" })
            resultado = fs.readFileSync(tOut); try { fs.unlinkSync(tIn) } catch (_) {}; try { fs.unlinkSync(tOut) } catch (_) {}
          } else resultado = await sharp(buf, { animated: false }).resize(512, alturaFinal, { fit: "fill" }).extend({ top: paddingVertical, bottom: paddingVertical, left: 0, right: 0, background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 90 }).toBuffer()
          await sock.sendMessage(jid, { sticker: resultado }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ ${e.message}\n\n"${nomeBot}"` }, { quoted: msg }) }
      }
    },

    smeme: {
      aliases: ["smem", "memefig"],
      async executar({ sock, msg, args, db, isDono, isSubDono, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n"${nomeBot}"` }, { quoted: msg }) }
        const t = args.join(" ").trim()
        if (!t) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐌𝐄𝐌𝐄 •\n\n❄️ Informe o texto.\n\n"${nomeBot}"` }, { quoted: msg }) }
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const q = ctx.quotedMessage
        if (!q || !q.stickerMessage) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐌𝐄𝐌𝐄 •\n\n❄️ Responda uma figurinha.\n\n"${nomeBot}"` }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        try { const alvo = Object.assign({}, msg, { message: { stickerMessage: q.stickerMessage } }); const buf = await utils.downloadMediaMessage(alvo, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage }); await enviarFigTexto(sock, jid, buf, t, msg) }
        catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n❄️ ${e.message}\n\n"${nomeBot}"` }, { quoted: msg }) }
      }
    },

    procurado: {
      aliases: ["wanted", "procurase"],
      async executar({ sock, msg, db, isDono, isSubDono, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n"${nomeBot}"` }, { quoted: msg }) }
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const q = ctx.quotedMessage
        if (!q || !q.stickerMessage) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐏𝐑𝐎𝐂𝐔𝐑𝐀𝐃𝐎 •\n\n❄️ Responda uma figurinha.\n\n"${nomeBot}"` }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        try {
          const sharp = require("sharp")
          const alvo = Object.assign({}, msg, { message: { stickerMessage: q.stickerMessage } })
          const buf = await utils.downloadMediaMessage(alvo, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          const T = 512, FT = 340
          const foto = await sharp(buf, { animated: false }).resize(FT, FT, { fit: "cover" }).grayscale().modulate({ brightness: 0.95 }).extend({ top: 6, bottom: 6, left: 6, right: 6, background: { r: 43, g: 24, b: 16, alpha: 1 } }).png().toBuffer()
          const svg = `<svg width="${T}" height="${T}" xmlns="http://www.w3.org/2000/svg"><rect width="${T}" height="${T}" fill="#D4B483"/><rect x="6" y="6" width="${T-12}" height="${T-12}" fill="none" stroke="#2B1810" stroke-width="5"/><text x="${T/2}" y="80" font-family="Georgia, serif" font-size="76" font-weight="900" fill="#2B1810" text-anchor="middle">WANTED</text><text x="${T/2}" y="112" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#5C3D1E" text-anchor="middle">DEAD OR ALIVE</text><text x="${T/2}" y="${T-42}" font-family="Georgia, serif" font-size="26" font-weight="900" fill="#2B1810" text-anchor="middle">★ REWARD ★</text><text x="${T/2}" y="${T-14}" font-family="Georgia, serif" font-size="24" font-weight="bold" fill="#5C3D1E" text-anchor="middle">$ 999.999.999</text></svg>`
          const cartaz = await sharp(Buffer.from(svg)).png().toBuffer()
          const res = await sharp(cartaz).composite([{ input: foto, top: 138, left: Math.floor((T-(FT+12))/2) }]).webp({ quality: 92 }).toBuffer()
          await sock.sendMessage(jid, { sticker: res }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n"${nomeBot}"` }, { quoted: msg }) }
      }
    },

    wasted: {
      aliases: ["morto", "morreu"],
      async executar({ sock, msg, db, isDono, isSubDono, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n"${nomeBot}"` }, { quoted: msg }) }
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const q = ctx.quotedMessage
        if (!q || !q.stickerMessage) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐖𝐀𝐒𝐓𝐄𝐃 •\n\n"${nomeBot}"` }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        try {
          const sharp = require("sharp")
          const alvo = Object.assign({}, msg, { message: { stickerMessage: q.stickerMessage } })
          const buf = await utils.downloadMediaMessage(alvo, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          const T = 512
          const base = await sharp(buf, { animated: false }).resize(T, T, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).modulate({ brightness: 0.55, saturation: 0.15 }).png().toBuffer()
          const baseGray = await sharp(base).grayscale().toBuffer()
          const svgW = `<svg width="${T}" height="${T}" xmlns="http://www.w3.org/2000/svg"><text x="${T/2}" y="${T/2+25}" font-family="Impact, 'Arial Black', sans-serif" font-size="95" font-weight="900" fill="#CC0000" stroke="#000000" stroke-width="4" text-anchor="middle" transform="rotate(-12 ${T/2} ${T/2})">WASTED</text></svg>`
          const ov = await sharp(Buffer.from(svgW)).png().toBuffer()
          const res = await sharp(baseGray).composite([{ input: ov, top: 0, left: 0 }]).webp({ quality: 92 }).toBuffer()
          await sock.sendMessage(jid, { sticker: res }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n"${nomeBot}"` }, { quoted: msg }) }
      }
    },

    rename: {
      aliases: ["renomear", "nomefig", "setnome"],
      async executar({ sock, msg, args, db, isDono, isSubDono, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n"${nomeBot}"` }, { quoted: msg }) }
        const t = args.join(" ").trim()
        if (!t) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐑𝐄𝐍𝐀𝐌𝐄 •\n\n❄️ Informe o nome.\n\n"${nomeBot}"` }, { quoted: msg }) }
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const q = ctx.quotedMessage
        if (!q || !q.stickerMessage) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐑𝐄𝐍𝐀𝐌𝐄 •\n\n❄️ Responda uma figurinha.\n\n"${nomeBot}"` }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        try {
          const alvo = Object.assign({}, msg, { message: { stickerMessage: q.stickerMessage } })
          const buf = await utils.downloadMediaMessage(alvo, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          let outBuf = buf
          try {
            const { Image } = require("node-webpmux")
            const img = new Image(); await img.load(buf)
            const json = { "sticker-pack-id": "com.rimuru." + Date.now(), "sticker-pack-name": t, "sticker-pack-publisher": t, "emojis": ["💧", "❄️"] }
            const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
            const jsonBuf = Buffer.from(JSON.stringify(json), "utf8")
            const exif = Buffer.concat([exifAttr, jsonBuf]); exif.writeUIntLE(jsonBuf.length, 14, 4)
            img.exif = exif; outBuf = await img.save(null)
          } catch (e) {}
          await sock.sendMessage(jid, { sticker: outBuf, packname: t, author: t }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: `💧 • 𝐄𝐑𝐑𝐎 •\n\n"${nomeBot}"` }, { quoted: msg }) }
      }
    },

    meuvip: {
      aliases: ["vipinfo"],
      async executar({ sock, msg, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        const vips = (db.vips() || {}).vips || {}
        let info = null
        for (const j of sJ) {
          const num = String(j).split("@")[0].split(":")[0].replace(/\D/g, "")
          for (const [jV, i] of Object.entries(vips)) { if (String(jV).split("@")[0].split(":")[0].replace(/\D/g, "") === num) { if (i.expira === "inf" || i.expira > Date.now()) { info = i; break } } }
          if (info) break
        }
        if (isDono || isSubDono) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: `💧 • 𝐌𝐄𝐔 𝐕𝐈𝐏 •\n\n❄️ Você é o mestre.\n🧊 ${isDono ? "GRANDE SÁBIO" : "LUA SUPERIOR"}\n\n"${nomeBot}"` }, { quoted: msg }) }
        if (!info) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐌𝐄𝐔 𝐕𝐈𝐏 •\n\n❄️ Você não é nobre.\n\n"${nomeBot}"` }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐌𝐄𝐔 𝐕𝐈𝐏 •\n\n❄️ Status: ${info.expira === "inf" ? "INFINITO ♾️" : "Expira em " + new Date(info.expira).toLocaleString("pt-BR")}\n\n"${nomeBot}"` }, { quoted: msg })
      }
    }

  }
}