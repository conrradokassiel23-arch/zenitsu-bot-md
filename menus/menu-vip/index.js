/* ============================================================
   ❄️ MENU VIP - AKAZA BOT MD
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
function dbSalvar(a, d) {
  fs.writeFileSync(path.join(DATA_DIR, a), JSON.stringify(d, null, 2))
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

function nomeBotDb(db) {
  try { return db.config().nomeBot || "Akaza Bot" } catch { return "Akaza Bot" }
}

function lineEmoji(emoji, label, valor) {
  return `${emoji} ${label}:\n╰➜ ${valor}`
}

// ============================================================
// 🎵 BAIXAR MÚSICA (API obanai → fallback youtube-dl-exec)
// ============================================================
async function baixarMusica(busca, qualidade = 64) {
  // 🎯 TENTATIVA 1: API obanai (a que funciona)
  try {
    const apiRes = await fetch(`https://obanai-apis.eu.cc/api/dl/play?q=${encodeURIComponent(busca)}&apitoken=rj8SpI`)
    const apiData = await apiRes.json()
    if (apiData.success && apiData.data?.url?.mp3) {
      const audioRes = await fetch(apiData.data.url.mp3)
      const buffer = Buffer.from(await audioRes.arrayBuffer())
      if (buffer.length > 0 && buffer.length < 16 * 1024 * 1024) {
        return { ok: true, buffer, titulo: apiData.data.titulo || busca, info: apiData.data }
      }
      if (buffer.length >= 16 * 1024 * 1024) {
        return { ok: false, erro: "Música muito grande (limite 16MB do WhatsApp)" }
      }
    }
  } catch (e) {
    console.log("🎵 API obanai play falhou:", e.message)
  }

  // 🎯 TENTATIVA 2: youtube-dl-exec
  try {
    const youtubeDl = require("youtube-dl-exec")
    const tmpDir = os.tmpdir()
    const id = Date.now() + "_" + Math.floor(Math.random() * 9999)
    const outTpl = path.join(tmpDir, "akaza_mus_" + id + ".%(ext)s")
    const ehUrl = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|music\.youtube\.com)/i.test(busca)
    const alvo = ehUrl ? busca : "ytsearch1:" + busca
    await youtubeDl(alvo, { extractAudio: true, audioFormat: "mp3", audioQuality: qualidade + "K", output: outTpl, noPlaylist: true, maxFilesize: "16M", noWarnings: true, noCheckCertificates: true, extractorArgs: "youtube:player_client=web,web_safari,web_embedded", noCacheDir: true })
    const prefixo = "akaza_mus_" + id
    const arquivos = fs.readdirSync(tmpDir).filter(f => f.startsWith(prefixo) && (f.endsWith(".mp3") || f.endsWith(".m4a") || f.endsWith(".webm") || f.endsWith(".opus")))
    if (arquivos.length > 0) {
      const caminho = path.join(tmpDir, arquivos[0])
      const buffer = fs.readFileSync(caminho)
      try { fs.unlinkSync(caminho) } catch (_) {}
      if (buffer.length < 16 * 1024 * 1024) return { ok: true, buffer, titulo: busca }
      return { ok: false, erro: "Música muito grande (limite 16MB)" }
    }
  } catch (e) { console.log("🎵 youtube-dl-exec falhou:", e.message) }

  return { ok: false, erro: "Todas as tentativas falharam. Tente outra música." }
}

async function baixarVideoYoutube(link) {
  try {
    const youtubeDl = require("youtube-dl-exec")
    const tmpDir = os.tmpdir()
    const id = Date.now() + "_" + Math.floor(Math.random() * 9999)
    const outTpl = path.join(tmpDir, "akaza_vid_" + id + ".%(ext)s")
    await youtubeDl(link, { format: "best[ext=mp4][filesize<16M]/best[filesize<16M]", output: outTpl, noPlaylist: true, maxFilesize: "16M", noWarnings: true, noCheckCertificates: true, extractorArgs: "youtube:player_client=web,web_safari,web_embedded", noCacheDir: true })
    const prefixo = "akaza_vid_" + id
    const arquivos = fs.readdirSync(tmpDir).filter(f => f.startsWith(prefixo) && f.endsWith(".mp4"))
    if (arquivos.length > 0) {
      const caminho = path.join(tmpDir, arquivos[0])
      const buffer = fs.readFileSync(caminho)
      try { fs.unlinkSync(caminho) } catch (_) {}
      return { ok: true, buffer }
    }
    return { ok: false, erro: "Arquivo não encontrado" }
  } catch (e) {
    console.log("🎥 Erro baixarVideoYoutube:", e.message)
    return { ok: false, erro: e.message }
  }
}

async function baixarInstagram(link) {
  try {
    const youtubeDl = require("youtube-dl-exec")
    const tmpDir = os.tmpdir()
    const id = Date.now() + "_" + Math.floor(Math.random() * 9999)
    const outTpl = path.join(tmpDir, "akaza_insta_" + id + ".%(ext)s")
    await youtubeDl(link, { output: outTpl, noPlaylist: true, noWarnings: true, noCheckCertificates: true })
    const prefixo = "akaza_insta_" + id
    const arquivos = fs.readdirSync(tmpDir).filter(f => f.startsWith(prefixo) && !f.endsWith(".part") && !f.endsWith(".ytdl"))
    if (arquivos.length > 0) {
      const caminho = path.join(tmpDir, arquivos[0])
      const buffer = fs.readFileSync(caminho)
      const ehVideo = /\.(mp4|mov|webm|mkv)$/i.test(arquivos[0])
      try { fs.unlinkSync(caminho) } catch (_) {}
      return { ok: true, buffer, ehVideo }
    }
    return { ok: false, erro: "Arquivo não encontrado" }
  } catch (e) {
    console.log("Erro baixarInstagram:", e.message)
    return { ok: false, erro: e.message }
  }
}

async function baixarTikTok(u) {
  try {
    const r = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(u)}&hd=1`)
    const d = await r.json()
    if (d.code !== 0 || !d.data || !d.data.play) throw new Error("Falha no link.")
    return d.data.play
  } catch (e) {
    throw new Error("Falha no TikTok: " + e.message)
  }
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
  } catch (e) { await sock.sendMessage(jid, { text: "❄️💢 " + e.message }, { quoted }) }
}

module.exports = {
  menu: "menu-vip",
  grupoOnly: false,
  adminOnly: false,
  donoOnly: false,

  commands: {

    menuvip: {
      aliases: ["vipmenu", "menuv"],
      async executar({ sock, msg, prefixoAtivo, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)

        let infoVip = null
        const vips = (db.vips() || {}).vips || {}
        for (const j of sJ) {
          const num = String(j).split("@")[0].split(":")[0].replace(/\D/g, "")
          for (const [jV, i] of Object.entries(vips)) {
            if (String(jV).split("@")[0].split(":")[0].replace(/\D/g, "") === num) {
              if (i.expira === "inf" || i.expira > Date.now()) { infoVip = i; break }
            }
          }
          if (infoVip) break
        }

        if (!infoVip && !isDono && !isSubDono) {
          return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Você não é nobre.\n╰──────────────\n\n_"Vá embora."_\n\n"${nomeBot}"` }, { quoted: msg })
        }

        const texto = `❄️ • 𝐌𝐄𝐍𝐔 𝐕𝐈𝐏 •\n\n╭─〔 ♦️ 𝐀́𝐑𝐄𝐀 𝐍𝐎𝐁𝐑𝐄 〕\n│ Apenas nobres podem ver esses segredos.\n╰──────────────\n\n『 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐚𝐬 』 ↴\n\n🎵 𝐌𝐔́𝐒𝐈𝐂𝐀\n╰➜ \`${p}play <nome ou link>\`\n╰➜ \`${p}spot <link>\`\n╰➜ \`${p}soundcloud <nome>\`\n\n📥 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐒\n╰➜ \`${p}insta <link>\`\n╰➜ \`${p}tiktok <link>\`\n╰➜ \`${p}pinterest <busca>\`\n\n📰 𝐍𝐎𝐓𝐈́𝐂𝐈𝐀𝐒\n╰➜ \`${p}g1\`\n╰➜ \`${p}uol\`\n╰➜ \`${p}jovempan\`\n╰➜ \`${p}vasco\`\n\n🔍 𝐄𝐒𝐓𝐀𝐓𝐈́𝐒𝐓𝐈𝐂𝐀𝐒\n╰➜ \`${p}tiktoktag <hashtag>\`\n\n🎨 𝐅𝐈𝐆𝐔𝐑𝐈𝐍𝐇𝐀𝐒\n╰➜ \`${p}brat / ${p}s / ${p}rename\`\n╰➜ \`${p}smeme / ${p}s3\`\n╰➜ \`${p}procurado / ${p}wasted / ${p}revela\`\n\n🛠️ 𝐅𝐄𝐑𝐑𝐀𝐌𝐄𝐍𝐓𝐀𝐒\n╰➜ \`${p}gerarnick <texto>\`\n╰➜ \`${p}llamacoder <desc>\`\n\n🤖 𝐈𝐍𝐓𝐄𝐋𝐈𝐆𝐄̂𝐍𝐂𝐈𝐀\n╰➜ \`${p}unliai <pergunta>\`\n╰➜ \`${p}axis <pergunta>\`\n\n📅 𝐔𝐓𝐈𝐋𝐈𝐃𝐀𝐃𝐄𝐒\n╰➜ \`${p}feriados [ano]\`\n\n🌸 𝐃𝐈𝐕𝐄𝐑𝐒𝐀̃𝐎\n╰➜ \`${p}waifu\`\n\n💠 _"A força recompensa os nobres."_\n\n"${nomeBot}"`

        const cfg = db.config()
        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          if (cfg.tipoMenu === "video") return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "akaza.mp4", gifPlayback: true, caption: texto }, { quoted: msg })
          return sock.sendMessage(jid, { image: buf, caption: texto }, { quoted: msg })
        }
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    play: {
      aliases: ["tocar", "musica", "music"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Música é privilégio dos nobres.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })

        const busca = args.join(" ").trim()
        if (!busca) return sock.sendMessage(jid, { text: `❄️ • 𝐏𝐋𝐀𝐘 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Me diga o que quer ouvir.\n╰──────────────\n\n💡 \`!play <nome>\`\n\n"${nomeBot}"` }, { quoted: msg })

        await sock.sendMessage(jid, { text: `❄️ • 𝐁𝐔𝐒𝐂𝐀𝐍𝐃𝐎 •\n\n╭─〔 ♦️ 𝐀𝐆𝐔𝐀𝐑𝐃𝐄 〕\n│ Procurando a música...\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })

        const res = await baixarMusica(busca, 32)
        if (!res.ok) {
          return sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${res.erro}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }

        // Se tiver info do obanai, manda a capa
        if (res.info && res.info.thumb) {
          try {
            await sock.sendMessage(jid, {
              image: { url: res.info.thumb },
              caption: `❄️ • 𝐏𝐋𝐀𝐘 •\n\n╭─〔 🎵 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐂̧𝐎̃𝐄𝐒 〕\n│ Tocando agora\n╰──────────────\n\n🎵 ${res.info.titulo || busca}\n👤 ${res.info.canal || "?"}\n⏱️ ${res.info.duracao || "?"}\n\n"${nomeBot}"`
            }, { quoted: msg })
          } catch (_) {}
        }

        if (res.buffer.length > 16 * 1024 * 1024) {
          return sock.sendMessage(jid, { text: `❄️ • 𝐌𝐔𝐈𝐓𝐎 𝐆𝐑𝐀𝐍𝐃𝐄 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Limite: 16MB\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }

        await sock.sendMessage(jid, { audio: res.buffer, mimetype: "audio/mpeg", ptt: false, fileName: busca.slice(0, 30) + ".mp3" }, { quoted: msg })
      }
    },

    spot: {
      aliases: ["spotify", "musicaspot", "spotdl"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Só nobres!\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const link = args[0]
        if (!link || !/open\.spotify\.com/i.test(link)) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐏𝐎𝐓 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Informe um link do Spotify.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        await sock.sendMessage(jid, { text: `❄️ • 𝐒𝐏𝐎𝐓𝐈𝐅𝐘 •\n\n╭─〔 ♦️ 𝐁𝐔𝐒𝐂𝐀𝐍𝐃𝐎 〕\n│ Baixando...\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        try {
          const SpottyDL = require("spottydl")
          const tmpDir = os.tmpdir()
          const id = Date.now() + "_" + Math.floor(Math.random() * 9999)
          const pastaTemp = path.join(tmpDir, "akaza_spot_" + id)
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
          if (buffer.length > 16 * 1024 * 1024) return sock.sendMessage(jid, { text: `❄️ • 𝐌𝐔𝐈𝐓𝐎 𝐆𝐑𝐀𝐍𝐃𝐄 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Limite: 16MB\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          await sock.sendMessage(jid, { audio: buffer, mimetype: "audio/mpeg", ptt: false, fileName: trackInfo.title + ".mp3" }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    soundcloud: {
      aliases: ["sc"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Só nobres!\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const busca = args.join(" ").trim()
        if (!busca) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎𝐔𝐍𝐃𝐂𝐋𝐎𝐔𝐃 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Informe a música.\n╰──────────────\n\n💡 \`!soundcloud <nome>\`\n\n"${nomeBot}"` }, { quoted: msg })
        await sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎𝐔𝐍𝐃𝐂𝐋𝐎𝐔𝐃 •\n\n╭─〔 ♦️ 𝐁𝐔𝐒𝐂𝐀𝐍𝐃𝐎 〕\n│ Procurando...\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        try {
          const sR = await fetch(`https://obanai-apis.eu.cc/api/search/soundcloud?q=${encodeURIComponent(busca)}&apitoken=rj8SpI`)
          const sD = await sR.json()
          if (!sD.success || !sD.data?.data?.length) return sock.sendMessage(jid, { text: `❄️ • 𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐄𝐈 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Nada encontrado.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          const m = sD.data.data[0]
          const segs = parseInt(m.duration)
          const durFmt = `${Math.floor(segs / 60)}:${(segs % 60).toString().padStart(2, "0")}`
          await sock.sendMessage(jid, { image: { url: m.thumbnail }, caption: `❄️ • 𝐒𝐎𝐔𝐍𝐃𝐂𝐋𝐎𝐔𝐃 •\n\n📌 ${m.title}\n🎤 ${m.artist}\n⏱️ ${durFmt}\n\n"${nomeBot}"` }, { quoted: msg })
          const dlR = await fetch(`https://obanai-apis.eu.cc/api/dl/soundcloud?url=${encodeURIComponent(m.url)}&apitoken=rj8SpI`)
          const dlD = await dlR.json()
          if (!dlD.success || !dlD.data?.download_url) return sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Falha ao baixar.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          const aR = await fetch(dlD.data.download_url)
          const aBuf = Buffer.from(await aR.arrayBuffer())
          if (aBuf.length > 16 * 1024 * 1024) return sock.sendMessage(jid, { text: `❄️ • 𝐌𝐔𝐈𝐓𝐎 𝐆𝐑𝐀𝐍𝐃𝐄 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Limite: 16MB\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          await sock.sendMessage(jid, { audio: aBuf, mimetype: "audio/mpeg", ptt: false }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    pinterest: {
      aliases: ["pin"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Só nobres!\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })

        const busca = args.join(" ").trim()
        if (!busca) return sock.sendMessage(jid, { text: `❄️ • 𝐏𝐈𝐍𝐓𝐄𝐑𝐄𝐒𝐓 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Informe a busca.\n╰──────────────\n\n💡 \`!pinterest <busca>\`\n\n"${nomeBot}"` }, { quoted: msg })

        await sock.sendMessage(jid, { text: `❄️ • 𝐏𝐈𝐍𝐓𝐄𝐑𝐄𝐒𝐓 •\n\n╭─〔 ♦️ 𝐁𝐔𝐒𝐂𝐀𝐍𝐃𝐎 〕\n│ Procurando "${busca}"...\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })

        try {
          const r = await fetch(`https://obanai-apis.eu.cc/api/dl/pinterest?q=${encodeURIComponent(busca)}&apitoken=rj8SpI`)
          const data = await r.json()
          if (!data.success || !data.data || !data.data.length) {
            return sock.sendMessage(jid, { text: `❄️ • 𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐄𝐈 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Nenhuma imagem encontrada.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          }
          const items = data.data.slice(0, 5)
          let enviadas = 0
          for (const item of items) {
            try {
              await sock.sendMessage(jid, { image: { url: item.image }, caption: `❄️ • 𝐏𝐈𝐍𝐓𝐄𝐑𝐄𝐒𝐓 •\n\n📌 ${item.title || "Sem título"}\n👤 ${msg.pushName || "?"}\n\n"${nomeBot}"` }, { quoted: msg })
              enviadas++
              await new Promise(r => setTimeout(r, 600))
            } catch (e) { console.log("Erro enviar pinterest:", e.message) }
          }
          if (enviadas === 0) {
            await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Falha ao enviar imagens.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          }
        } catch (e) {
          console.error("Erro pinterest:", e.message)
          await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    tiktoktag: {
      aliases: ["hashtag", "tttag"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Só nobres!\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })

        const busca = args.join(" ").trim()
        if (!busca) return sock.sendMessage(jid, { text: `❄️ • 𝐓𝐈𝐊𝐓𝐎𝐊 𝐓𝐀𝐆 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Informe a hashtag.\n╰──────────────\n\n💡 \`!tiktoktag <hashtag>\`\n📌 Ex: \`!tiktoktag animes\`\n\n"${nomeBot}"` }, { quoted: msg })

        await sock.sendMessage(jid, { text: `❄️ • 𝐓𝐈𝐊𝐓𝐎𝐊 𝐓𝐀𝐆 •\n\n╭─〔 ♦️ 𝐁𝐔𝐒𝐂𝐀𝐍𝐃𝐎 〕\n│ Analisando #${busca}...\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })

        try {
          const r = await fetch(`https://obanai-apis.eu.cc/api/search/tiktok-tag?q=${encodeURIComponent(busca)}&apitoken=rj8SpI`, {
            headers: { "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36" }
          })
          const data = await r.json()
          if (!data.success) {
            return sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Não consegui obter estatísticas.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          }
          const res = data.data
          let txt = `❄️ • 𝐓𝐈𝐊𝐓𝐎𝐊 #${busca} •\n\n╭─〔 📊 𝐄𝐒𝐓𝐀𝐓𝐈́𝐒𝐓𝐈𝐂𝐀𝐒 〕\n│ Dados da hashtag\n╰──────────────\n\n`
          txt += `📌 𝐏𝐨𝐬𝐭𝐬:\n╰➜ ${res.posts || "N/A"}\n\n`
          txt += `👁️ 𝐕𝐢𝐞𝐰𝐬:\n╰➜ ${res.views || "N/A"}\n\n`
          txt += `📈 𝐕𝐢𝐞𝐰𝐬 𝐩𝐨𝐫 𝐩𝐨𝐬𝐭:\n╰➜ ${res.viewsPerPost || "N/A"}\n\n`
          txt += `🔥 𝐇𝐚𝐬𝐡𝐭𝐚𝐠𝐬 𝐫𝐞𝐥𝐚𝐜𝐢𝐨𝐧𝐚𝐝𝐨𝐬:\n╰➜ ${res.mostPopular || "N/A"}\n\n`
          txt += `🏆 𝐓𝐫𝐞𝐧𝐝𝐢𝐧𝐠 𝐫𝐞𝐥𝐚𝐜𝐢𝐨𝐧𝐚𝐝𝐨𝐬:\n`
          if (res.trending && res.trending.length > 0) {
            for (const tag of res.trending.slice(0, 10)) {
              txt += `╰➜ #${tag.hashtag} — ${tag.posts} posts\n`
            }
          } else {
            txt += `╰➜ _Sem dados_\n`
          }
          txt += `\n"${nomeBot}"`
          await sock.sendMessage(jid, { text: txt }, { quoted: msg })
        } catch (e) {
          console.error("Erro tiktoktag:", e.message)
          await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    axis: {
      aliases: ["axiais"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Só nobres!\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })

        const pergunta = args.join(" ").trim()
        if (!pergunta) return sock.sendMessage(jid, { text: `❄️ • 𝐀𝐗𝐈𝐒 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Informe a pergunta.\n╰──────────────\n\n💡 \`!axis <pergunta>\`\n\n"${nomeBot}"` }, { quoted: msg })

        try {
          await sock.sendPresenceUpdate("composing", jid)
          await sock.sendMessage(jid, { text: `❄️ • 𝐀𝐗𝐈𝐒 •\n\n╭─〔 ♦️ 𝐏𝐄𝐍𝐒𝐀𝐍𝐃𝐎 〕\n│ Consultando a IA...\n╰──────────────\n\n❔ ${pergunta}\n\n"${nomeBot}"` }, { quoted: msg })

          const r = await fetch(`https://obanai-apis.eu.cc/api/ias/axis?q=${encodeURIComponent(pergunta)}&apitoken=rj8SpI`)
          const data = await r.json()
          if (!data?.success) {
            return sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Não consegui acessar a IA.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          }
          await sock.sendMessage(jid, { text: data.data.texto }, { quoted: msg })
        } catch (e) {
          console.error("Erro axis:", e.message)
          await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    g1: {
      aliases: ["noticiag1"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        try {
          const r = await fetch(`https://obanai-apis.eu.cc/api/noticias/g1?apitoken=rj8SpI`)
          const data = await r.json()
          if (!data?.status || !data.data?.resultado?.length) return sock.sendMessage(jid, { text: `❄️ • 𝐆𝟏 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Erro.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          const n = data.data.resultado[Math.floor(Math.random() * data.data.resultado.length)]
          await sock.sendMessage(jid, { text: `❄️ • 𝐆𝟏 𝐍𝐎𝐓𝐈́𝐂𝐈𝐀𝐒 •\n\n╭─〔 📰 𝐍𝐎𝐓𝐈́𝐂𝐈𝐀 〕\n│ Aleatória\n╰──────────────\n\n📌 ${n.noticia}\n\n📁 ${n.secao}\n🕒 ${n.data}\n\n📝 ${n.desc}\n\n🔗 ${n.link}\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    uol: {
      aliases: ["noticiauol"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        try {
          const r = await fetch(`https://obanai-apis.eu.cc/api/noticias/uol?apitoken=rj8SpI`)
          const data = await r.json()
          if (!data?.status || !data.data?.resultado?.length) return sock.sendMessage(jid, { text: `❄️ • 𝐔𝐎𝐋 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Erro.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          const n = data.data.resultado[Math.floor(Math.random() * data.data.resultado.length)]
          await sock.sendMessage(jid, { text: `❄️ • 𝐔𝐎𝐋 𝐍𝐎𝐓𝐈́𝐂𝐈𝐀𝐒 •\n\n╭─〔 📰 𝐍𝐎𝐓𝐈́𝐂𝐈𝐀 〕\n│ Aleatória\n╰──────────────\n\n📌 ${n.noticia}\n\n📁 ${n.secao}\n\n📝 ${n.desc}\n\n🔗 ${n.link}\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    jovempan: {
      aliases: ["jp", "noticiajp"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        try {
          const r = await fetch(`https://obanai-apis.eu.cc/api/noticias/jovempan?apitoken=rj8SpI`)
          const data = await r.json()
          if (!data?.status || !data.data?.resultado?.length) return sock.sendMessage(jid, { text: `❄️ • 𝐉𝐎𝐕𝐄𝐌 𝐏𝐀𝐍 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Erro.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          const n = data.data.resultado[Math.floor(Math.random() * data.data.resultado.length)]
          await sock.sendMessage(jid, { text: `❄️ • 𝐉𝐎𝐕𝐄𝐌 𝐏𝐀𝐍 •\n\n╭─〔 📰 𝐍𝐎𝐓𝐈́𝐂𝐈𝐀 〕\n│ Aleatória\n╰──────────────\n\n📌 ${n.noticia}\n\n📁 ${n.secao}\n🕒 ${n.data}\n\n📝 ${n.desc}\n\n🔗 ${n.link}\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    vasco: {
      aliases: ["noticiavasco", "vascao"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        try {
          const r = await fetch(`https://obanai-apis.eu.cc/api/noticias/vasco?apitoken=rj8SpI`)
          const data = await r.json()
          if (!data?.status || !data.data?.resultado?.length) return sock.sendMessage(jid, { text: `⚓ • 𝐕𝐀𝐒𝐂𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Erro.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          const n = data.data.resultado[Math.floor(Math.random() * data.data.resultado.length)]
          await sock.sendMessage(jid, { text: `⚓ • 𝐕𝐀𝐒𝐂𝐎 𝐍𝐎𝐓𝐈́𝐂𝐈𝐀𝐒 •\n\n╭─〔 📰 𝐍𝐎𝐓𝐈́𝐂𝐈𝐀 〕\n│ Aleatória\n╰──────────────\n\n📌 ${n.noticia}\n\n📝 ${n.desc}\n\n🔗 ${n.link}\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: `⚓ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    gerarnick: {
      aliases: ["nick", "nickname"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Só nobres!\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const texto = args.join(" ").trim()
        if (!texto) return sock.sendMessage(jid, { text: `❄️ • 𝐆𝐄𝐑𝐀𝐑𝐍𝐈𝐂𝐊 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Informe o texto.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        try {
          const textoLimpo = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          const r = await fetch(`https://obanai-apis.eu.cc/api/tools/gerarnick?texto=${encodeURIComponent(textoLimpo)}&apitoken=rj8SpI`)
          const data = await r.json()
          if (!data?.success || !data.data?.length) return sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Não consegui gerar.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          let txt = `❄️ • 𝐄𝐒𝐓𝐈𝐋𝐎𝐒 𝐏𝐀𝐑𝐀 "${textoLimpo}" •\n\n『 𝐋𝐢𝐬𝐭𝐚 』 ↴\n\n`
          data.data.forEach((n, i) => { txt += `${i + 1}. \`${n.nome}\`\n\n` })
          txt += `💡 Toque e segure pra copiar.\n\n"${nomeBot}"`
          await sock.sendMessage(jid, { text: txt }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    feriados: {
      aliases: ["feriado", "calendario"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const ano = (args[0] && /^\d{4}$/.test(args[0].trim())) ? args[0].trim() : new Date().getFullYear()
        try {
          const r = await fetch(`https://obanai-apis.eu.cc/api/outros/feriados?ano=${ano}&apitoken=rj8SpI`)
          const data = await r.json()
          if (!data?.success || !data.data?.total) return sock.sendMessage(jid, { text: `❄️ • 𝐅𝐄𝐑𝐈𝐀𝐃𝐎𝐒 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Nenhum feriado.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          const lista = data.data.feriados.map(f => `📌 *${f.date}* — ${f.name} _(${f.weekday})_`).join("\n")
          await sock.sendMessage(jid, { text: `❄️ • 𝐅𝐄𝐑𝐈𝐀𝐃𝐎𝐒 ${data.data.ano} •\n\n${lista}\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    unliai: {
      aliases: ["ia", "unli", "chatia"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const pergunta = args.join(" ").trim()
        if (!pergunta) return sock.sendMessage(jid, { text: `❄️ • 𝐔𝐍𝐋𝐈𝐀𝐈 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Informe a pergunta.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        try {
          await sock.sendPresenceUpdate("composing", jid)
          const r = await fetch(`https://obanai-apis.eu.cc/api/ias/unliai?q=${encodeURIComponent(pergunta)}&apitoken=rj8SpI`)
          const data = await r.json()
          if (!data?.success || !data?.response) return sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ IA indisponível.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          await sock.sendMessage(jid, { text: data.response }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    insta: {
      aliases: ["instagram", "instadl", "ig"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Só nobres!\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const link = args[0]
        if (!link || !/instagram\.com|instagr\.am/i.test(link)) return sock.sendMessage(jid, { text: `❄️ • 𝐈𝐍𝐒𝐓𝐀 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Informe um link.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        try {
          const res = await baixarInstagram(link)
          if (!res.ok) return sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${res.erro}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          const buffer = res.buffer
          if (buffer.length > 16 * 1024 * 1024) return sock.sendMessage(jid, { text: `❄️ • 𝐌𝐔𝐈𝐓𝐎 𝐆𝐑𝐀𝐍𝐃𝐄 •\n\n"${nomeBot}"` }, { quoted: msg })
          if (res.ehVideo) await sock.sendMessage(jid, { video: buffer, mimetype: "video/mp4", fileName: "instagram.mp4" }, { quoted: msg })
          else await sock.sendMessage(jid, { image: buffer, caption: `❄️ • 𝐈𝐍𝐒𝐓𝐀𝐆𝐑𝐀𝐌 •\n\n╭─〔 ✅ 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Mídia baixada.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    tiktok: {
      aliases: ["tt", "ttk"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Só nobres!\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const link = args[0]
        if (!link || !/tiktok\.com|vm\.tiktok|vt\.tiktok/i.test(link)) return sock.sendMessage(jid, { text: `❄️ • 𝐓𝐈𝐊𝐓𝐎𝐊 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Informe um link.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        try {
          const url = await baixarTikTok(link)
          const r = await fetch(url)
          await sock.sendMessage(jid, { video: Buffer.from(await r.arrayBuffer()), mimetype: "video/mp4", fileName: "tiktok.mp4" }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    autofig: {
      aliases: ["autosticker", "autofigu"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Só nobres!\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        if (!jid.endsWith("@g.us")) return sock.sendMessage(jid, { text: `❄️ • 𝐀𝐔𝐓𝐎𝐅𝐈𝐆 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Só em grupos.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const op = (args[0] || "").toLowerCase()
        const ac = dbLer("autocfg.json", { grupos: {} })
        ac.grupos = ac.grupos || {}
        ac.grupos[jid] = ac.grupos[jid] || {}
        if (!["on", "off"].includes(op)) {
          const s = ac.grupos[jid].autofig ? "ON ✅" : "OFF ❌"
          return sock.sendMessage(jid, { text: `❄️ • 𝐀𝐔𝐓𝐎𝐅𝐈𝐆 •\n\n╭─〔 ♦️ 𝐒𝐓𝐀𝐓𝐔𝐒 〕\n│ ${s}\n╰──────────────\n\n💡 \`!autofig on/off\`\n\n"${nomeBot}"` }, { quoted: msg })
        }
        ac.grupos[jid].autofig = op === "on"
        dbSalvar("autocfg.json", ac)
        await sock.sendMessage(jid, { text: `❄️ • 𝐀𝐔𝐓𝐎𝐅𝐈𝐆 •\n\n╭─〔 ✅ 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ ${op.toUpperCase()}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    autottk: {
      aliases: ["autotiktok", "autott"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Só nobres!\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        if (!jid.endsWith("@g.us")) return sock.sendMessage(jid, { text: `❄️ • 𝐀𝐔𝐓𝐎𝐓𝐓𝐊 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Só em grupos.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const op = (args[0] || "").toLowerCase()
        const ac = dbLer("autocfg.json", { grupos: {} })
        ac.grupos = ac.grupos || {}
        ac.grupos[jid] = ac.grupos[jid] || {}
        if (!["on", "off"].includes(op)) {
          const s = ac.grupos[jid].autottk ? "ON ✅" : "OFF ❌"
          return sock.sendMessage(jid, { text: `❄️ • 𝐀𝐔𝐓𝐎𝐓𝐓𝐊 •\n\n╭─〔 ♦️ 𝐒𝐓𝐀𝐓𝐔𝐒 〕\n│ ${s}\n╰──────────────\n\n💡 \`!autottk on/off\`\n\n"${nomeBot}"` }, { quoted: msg })
        }
        ac.grupos[jid].autottk = op === "on"
        dbSalvar("autocfg.json", ac)
        await sock.sendMessage(jid, { text: `❄️ • 𝐀𝐔𝐓𝐎𝐓𝐓𝐊 •\n\n╭─〔 ✅ 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ ${op.toUpperCase()}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    revela: {
      aliases: ["revelar", "reveal", "ver"],
      async executar({ sock, msg, db, utils, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Só nobres!\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        let q = ctx.quotedMessage
        if (!q) return sock.sendMessage(jid, { text: `❄️ • 𝐑𝐄𝐕𝐄𝐋𝐀 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Responda uma msg de ver uma vez.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        let isVU = false
        if (q.viewOnceMessageV2) { q = q.viewOnceMessageV2.message || q.viewOnceMessageV2; isVU = true }
        else if (q.viewOnceMessage) { q = q.viewOnceMessage.message || q.viewOnceMessage; isVU = true }
        const img = q.imageMessage, vid = q.videoMessage, aud = q.audioMessage
        if (img && img.viewOnce) isVU = true
        if (vid && vid.viewOnce) isVU = true
        if (aud && aud.viewOnce) isVU = true
        if (!isVU) return sock.sendMessage(jid, { text: `❄️ • 𝐍𝐀̃𝐎 𝐄́ 𝐕𝐄𝐑 𝐔𝐌𝐀 𝐕𝐄𝐙 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Não é oculta.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        if (!img && !vid && !aud) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐄𝐌 𝐌𝐈́𝐃𝐈𝐀 •\n\n"${nomeBot}"` }, { quoted: msg })
        try {
          const tipo = img ? "image" : vid ? "video" : "audio"
          const alvo = Object.assign({}, msg, { message: tipo === "image" ? { imageMessage: img } : tipo === "video" ? { videoMessage: vid } : { audioMessage: aud } })
          const buf = await utils.downloadMediaMessage(alvo, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          if (tipo === "image") await sock.sendMessage(jid, { image: buf, caption: `❄️ • 𝐑𝐄𝐕𝐄𝐋𝐀𝐃𝐎 •\n\n"${nomeBot}"` }, { quoted: msg })
          else if (tipo === "video") await sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", caption: `❄️ • 𝐑𝐄𝐕𝐄𝐋𝐀𝐃𝐎 •\n\n"${nomeBot}"` }, { quoted: msg })
          else await sock.sendMessage(jid, { audio: buf, mimetype: "audio/mp4", ptt: false }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    brat: {
      aliases: ["figbrat"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Só nobres!\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const t = args.join(" ").trim()
        if (!t) return sock.sendMessage(jid, { text: `❄️ • 𝐁𝐑𝐀𝐓 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Informe o texto.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        try {
          const sharp = require("sharp")
          const T = 512
          const F = t.length > 40 ? 40 : t.length > 20 ? 55 : 70
          const pal = t.split(" ")
          const lin = []
          let la = "", mc = t.length > 40 ? 12 : t.length > 20 ? 10 : 8
          for (const pa of pal) {
            if ((la + " " + pa).trim().length <= mc) la = (la + " " + pa).trim()
            else { if (la) lin.push(la); la = pa }
          }
          if (la) lin.push(la)
          const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          const aL = F + 15
          const aT = lin.length * aL
          const yI = (T - aT) / 2 + F
          let tsp = ""
          lin.forEach((l, i) => {
            const y = yI + i * aL
            tsp += `<text x="${T/2}" y="${y}" font-family="Arial" font-size="${F}" font-weight="bold" fill="#000" text-anchor="middle">${esc(l)}</text>`
          })
          const svg = `<svg width="${T}" height="${T}" xmlns="http://www.w3.org/2000/svg"><rect width="${T}" height="${T}" fill="#FFF"/>${tsp}</svg>`
          const buf = await sharp(Buffer.from(svg)).webp({ quality: 90 }).toBuffer()
          await sock.sendMessage(jid, { sticker: buf }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    s: {
      aliases: ["sticker", "fig"],
      async executar({ sock, msg, db, isDono, isSubDono, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n"${nomeBot}"` }, { quoted: msg })
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const q = ctx.quotedMessage
        const eImg = q && q.imageMessage
        const eVid = q && q.videoMessage
        if (!eImg && !eVid) return sock.sendMessage(jid, { text: `❄️ • 𝐒 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Responda foto ou vídeo.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        try {
          const sharp = require("sharp")
          const ff = require("@ffmpeg-installer/ffmpeg").path
          const { execSync } = require("child_process")
          const alvo = Object.assign({}, msg, { message: eImg ? { imageMessage: q.imageMessage } : { videoMessage: q.videoMessage } })
          const buf = await utils.downloadMediaMessage(alvo, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          let wp
          if (eImg) {
            wp = await sharp(buf).resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 90 }).toBuffer()
          } else {
            const tIn = path.join(os.tmpdir(), "s_" + Date.now() + ".mp4")
            const tOut = path.join(os.tmpdir(), "s_" + Date.now() + ".webp")
            fs.writeFileSync(tIn, buf)
            execSync(`"${ff}" -y -i "${tIn}" -vcodec libwebp -filter:v "fps=15,scale=512:512:force_original_aspect_ratio=decrease" -lossless 0 -compression_level 6 -q:v 50 -loop 0 -preset default -an -vsync 0 -s 512:512 "${tOut}"`, { stdio: "ignore" })
            wp = fs.readFileSync(tOut)
            try { fs.unlinkSync(tIn) } catch (_) {}
            try { fs.unlinkSync(tOut) } catch (_) {}
          }
          await sock.sendMessage(jid, { sticker: wp }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    s3: {
      aliases: ["esticar", "stretch", "gordo"],
      async executar({ sock, msg, db, isDono, isSubDono, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n"${nomeBot}"` }, { quoted: msg })
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const q = ctx.quotedMessage
        const eSti = q && q.stickerMessage
        const eImg = q && q.imageMessage
        const eVid = q && q.videoMessage
        if (!eSti && !eImg && !eVid) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝟑 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Responda fig, foto ou vídeo.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        try {
          const sharp = require("sharp")
          const ff = require("@ffmpeg-installer/ffmpeg").path
          const { execSync } = require("child_process")
          let alvo
          if (eSti) alvo = Object.assign({}, msg, { message: { stickerMessage: q.stickerMessage } })
          else if (eImg) alvo = Object.assign({}, msg, { message: { imageMessage: q.imageMessage } })
          else alvo = Object.assign({}, msg, { message: { videoMessage: q.videoMessage } })
          const buf = await utils.downloadMediaMessage(alvo, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          const T = 512
          const alturaFinal = Math.floor(T * 0.6)
          const paddingVertical = Math.floor((T - alturaFinal) / 2)
          let resultado
          if (eVid) {
            const tIn = path.join(os.tmpdir(), "s3_" + Date.now() + ".mp4")
            const tOut = path.join(os.tmpdir(), "s3_" + Date.now() + ".webp")
            fs.writeFileSync(tIn, buf)
            execSync(`"${ff}" -y -i "${tIn}" -vcodec libwebp -filter:v "fps=15,scale=512:307:force_original_aspect_ratio=disable,pad=512:512:0:102:color=0x00000000" -lossless 0 -compression_level 6 -q:v 60 -loop 0 -preset default -an -vsync 0 -s 512:512 "${tOut}"`, { stdio: "ignore" })
            resultado = fs.readFileSync(tOut)
            try { fs.unlinkSync(tIn) } catch (_) {}
            try { fs.unlinkSync(tOut) } catch (_) {}
          } else {
            resultado = await sharp(buf, { animated: false }).resize(512, alturaFinal, { fit: "fill" }).extend({ top: paddingVertical, bottom: paddingVertical, left: 0, right: 0, background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 90 }).toBuffer()
          }
          await sock.sendMessage(jid, { sticker: resultado }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    smeme: {
      aliases: ["smem", "memefig"],
      async executar({ sock, msg, args, db, isDono, isSubDono, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n"${nomeBot}"` }, { quoted: msg })
        const t = args.join(" ").trim()
        if (!t) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐌𝐄𝐌𝐄 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Informe o texto.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const q = ctx.quotedMessage
        if (!q || !q.stickerMessage) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐌𝐄𝐌𝐄 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Responda uma figurinha.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        try {
          const alvo = Object.assign({}, msg, { message: { stickerMessage: q.stickerMessage } })
          const buf = await utils.downloadMediaMessage(alvo, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          await enviarFigTexto(sock, jid, buf, t, msg)
        } catch (e) {
          await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    procurado: {
      aliases: ["wanted", "procurase"],
      async executar({ sock, msg, db, isDono, isSubDono, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n"${nomeBot}"` }, { quoted: msg })
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const q = ctx.quotedMessage
        if (!q || !q.stickerMessage) return sock.sendMessage(jid, { text: `❄️ • 𝐏𝐑𝐎𝐂𝐔𝐑𝐀𝐃𝐎 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Responda uma figurinha.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
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
        } catch (e) {
          await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    wasted: {
      aliases: ["morto", "morreu"],
      async executar({ sock, msg, db, isDono, isSubDono, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n"${nomeBot}"` }, { quoted: msg })
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const q = ctx.quotedMessage
        if (!q || !q.stickerMessage) return sock.sendMessage(jid, { text: `❄️ • 𝐖𝐀𝐒𝐓𝐄𝐃 •\n\n"${nomeBot}"` }, { quoted: msg })
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
        } catch (e) {
          await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    rename: {
      aliases: ["renomear", "nomefig", "setnome"],
      async executar({ sock, msg, args, db, isDono, isSubDono, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n"${nomeBot}"` }, { quoted: msg })
        const t = args.join(" ").trim()
        if (!t) return sock.sendMessage(jid, { text: `❄️ • 𝐑𝐄𝐍𝐀𝐌𝐄 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Informe o nome.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const q = ctx.quotedMessage
        if (!q || !q.stickerMessage) return sock.sendMessage(jid, { text: `❄️ • 𝐑𝐄𝐍𝐀𝐌𝐄 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Responda uma figurinha.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        try {
          const alvo = Object.assign({}, msg, { message: { stickerMessage: q.stickerMessage } })
          const buf = await utils.downloadMediaMessage(alvo, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          let outBuf = buf
          try {
            const { Image } = require("node-webpmux")
            const img = new Image()
            await img.load(buf)
            const json = { "sticker-pack-id": "com.akaza." + Date.now(), "sticker-pack-name": t, "sticker-pack-publisher": t, "emojis": ["❄️", "♦️"] }
            const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
            const jsonBuf = Buffer.from(JSON.stringify(json), "utf8")
            const exif = Buffer.concat([exifAttr, jsonBuf])
            exif.writeUIntLE(jsonBuf.length, 14, 4)
            img.exif = exif
            outBuf = await img.save(null)
          } catch (e) { console.log("Aviso exif:", e.message) }
          await sock.sendMessage(jid, { sticker: outBuf, packname: t, author: t }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    meuvip: {
      aliases: ["vipinfo"],
      async executar({ sock, msg, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        const vips = (db.vips() || {}).vips || {}
        let info = null
        for (const j of sJ) {
          const num = String(j).split("@")[0].split(":")[0].replace(/\D/g, "")
          for (const [jV, i] of Object.entries(vips)) {
            if (String(jV).split("@")[0].split(":")[0].replace(/\D/g, "") === num) {
              if (i.expira === "inf" || i.expira > Date.now()) { info = i; break }
            }
          }
          if (info) break
        }
        if (isDono || isSubDono) return sock.sendMessage(jid, { text: `❄️ • 𝐌𝐄𝐔 𝐕𝐈𝐏 •\n\n╭─〔 👑 𝐀𝐔𝐓𝐎𝐑𝐈𝐃𝐀𝐃𝐄 〕\n│ Você é o mestre.\n╰──────────────\n\n💠 ${isDono ? "IMPERADOR" : "LUA SUPERIOR"}\n\n"${nomeBot}"` }, { quoted: msg })
        if (!info) return sock.sendMessage(jid, { text: `❄️ • 𝐌𝐄𝐔 𝐕𝐈𝐏 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Você não é nobre.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        await sock.sendMessage(jid, { text: `❄️ • 𝐌𝐄𝐔 𝐕𝐈𝐏 •\n\n╭─〔 ♦️ 𝐒𝐓𝐀𝐓𝐔𝐒 〕\n│ 💠 ${info.expira === "inf" ? "INFINITO ♾️" : "Expira em " + new Date(info.expira).toLocaleString("pt-BR")}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
      }
    }

  }
}