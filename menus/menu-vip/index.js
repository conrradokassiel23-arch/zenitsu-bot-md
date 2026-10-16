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
// 🎵 BAIXAR MÚSICA
// ============================================================
async function baixarMusica(busca, qualidade = 64) {
  try {
    try {
      const apiUrl = `https://api.vevioz.com/api/button/mp3/${encodeURIComponent(busca)}`
      const r = await fetch(apiUrl, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" } })
      const html = await r.text()
      const match = html.match(/href="(https:\/\/[^"]+\.mp3[^"]*)"/)
      if (match && match[1]) {
        const audioRes = await fetch(match[1])
        const buffer = Buffer.from(await audioRes.arrayBuffer())
        if (buffer.length > 0 && buffer.length < 16 * 1024 * 1024) return { ok: true, buffer, titulo: busca }
        if (buffer.length >= 16 * 1024 * 1024) return { ok: false, erro: "Música muito grande (limite 16MB)" }
      }
    } catch (e) { console.log("🎵 vevioz falhou:", e.message) }

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
  } catch (e) {
    console.log("🎵 Erro baixarMusica:", e.message)
    return { ok: false, erro: e.message }
  }
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

        const texto = `❄️ • 𝐌𝐄𝐍𝐔 𝐕𝐈𝐏 •\n\n╭─〔 ♦️ 𝐀́𝐑𝐄𝐀 𝐍𝐎𝐁𝐑𝐄 〕\n│ Apenas nobres podem ver esses segredos.\n╰──────────────\n\n『 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐚𝐬 』 ↴\n\n🎵 𝐌𝐔́𝐒𝐈𝐂𝐀\n╰➜ \`${p}play <nome ou link>\`\n╰➜ \`${p}play2 <nome>\`\n╰➜ \`${p}spot <link>\`\n╰➜ \`${p}soundcloud <nome>\`\n\n📥 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐒\n╰➜ \`${p}insta <link>\`\n╰➜ \`${p}tiktok <link>\`\n\n📰 𝐍𝐎𝐓𝐈́𝐂𝐈𝐀𝐒\n╰➜ \`${p}g1\`\n╰➜ \`${p}uol\`\n╰➜ \`${p}jovempan\`\n╰➜ \`${p}vasco\`\n\n🎨 𝐅𝐈𝐆𝐔𝐑𝐈𝐍𝐇𝐀𝐒\n╰➜ \`${p}brat / ${p}s / ${p}rename\`\n╰➜ \`${p}smeme / ${p}s3\`\n╰➜ \`${p}procurado / ${p}wasted / ${p}revela\`\n\n🛠️ 𝐅𝐄𝐑𝐑𝐀𝐌𝐄𝐍𝐓𝐀𝐒\n╰➜ \`${p}gerarnick <texto>\`\n╰➜ \`${p}llamacoder <desc>\`\n\n🌸 𝐃𝐈𝐕𝐄𝐑𝐒𝐀̃𝐎\n╰➜ \`${p}waifu\`\n\n🤖 𝐈𝐍𝐓𝐄𝐋𝐈𝐆𝐄̂𝐍𝐂𝐈𝐀\n╰➜ \`${p}unliai <pergunta>\`\n\n📅 𝐔𝐓𝐈𝐋𝐈𝐃𝐀𝐃𝐄𝐒\n╰➜ \`${p}feriados [ano]\`\n\n♦️ 𝐄𝐗𝐓𝐑𝐀𝐒\n╰➜ \`${p}fraseprofunda\`\n╰➜ \`${p}mito\`\n╰➜ \`${p}n apoleao\`\n\n💠 _"A força recompensa os nobres."_\n\n"${nomeBot}"`

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

        try {
          const apiRes = await fetch(`https://obanai-apis.eu.cc/api/dl/play?q=${encodeURIComponent(busca)}&apitoken=rj8SpI`)
          const apiData = await apiRes.json()
          if (apiData.success && apiData.data?.url?.mp3) {
            const m = apiData.data
            try {
              await sock.sendMessage(jid, { image: { url: m.thumb }, caption: `❄️ • 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎 •\n\n🎵 ${m.titulo}\n👤 ${m.canal}\n⏱️ ${m.duracao}\n👁️ ${m.views}\n\n"${nomeBot}"` }, { quoted: msg })
            } catch (_) {
              await sock.sendMessage(jid, { text: `❄️ • 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎 •\n\n🎵 ${m.titulo}\n👤 ${m.canal}\n⏱️ ${m.duracao}\n\n"${nomeBot}"` }, { quoted: msg })
            }
            const audioRes = await fetch(m.url.mp3)
            const audioBuf = Buffer.from(await audioRes.arrayBuffer())
            if (audioBuf.length < 16 * 1024 * 1024) {
              await sock.sendMessage(jid, { audio: audioBuf, mimetype: "audio/mpeg", ptt: false }, { quoted: msg })
              return
            }
          }
        } catch (e) { console.log("🎵 API obanai play falhou:", e.message) }

        try {
          const res = await baixarMusica(busca, 32)
          if (!res.ok) return sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${res.erro}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          if (res.buffer.length > 16 * 1024 * 1024) return sock.sendMessage(jid, { text: `❄️ • 𝐌𝐔𝐈𝐓𝐎 𝐆𝐑𝐀𝐍𝐃𝐄 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Limite: 16MB\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          await sock.sendMessage(jid, { audio: res.buffer, mimetype: "audio/mp4", ptt: false, fileName: busca.slice(0, 30) + ".mp3" }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    play2: {
      aliases: ["musica2", "ytplay"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Só nobres!\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })

        const busca = args.join(" ").trim()
        if (!busca) return sock.sendMessage(jid, { text: `❄️ • 𝐏𝐋𝐀𝐘𝟐 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Informe a música.\n╰──────────────\n\n💡 \`!play2 <nome>\`\n\n"${nomeBot}"` }, { quoted: msg })

        await sock.sendMessage(jid, { text: `❄️ • 𝐁𝐔𝐒𝐂𝐀𝐍𝐃𝐎 •\n\n╭─〔 ♦️ 𝐀𝐆𝐔𝐀𝐑𝐃𝐄 〕\n│ Baixando com ytdl...\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })

        try {
          const ytdl = require("iguro-ytdl")
          const resultado = await ytdl.ytplay(busca)
          if (!resultado.status) return sock.sendMessage(jid, { text: `❄️ • 𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐄𝐈 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Música não encontrada.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          const { title, channel, thumbnail, duration, views, download } = resultado.result
          const viewsFmt = views >= 1000000 ? `${(views/1000000).toFixed(1)}M` : views >= 1000 ? `${(views/1000).toFixed(1)}K` : views
          await sock.sendMessage(jid, { image: { url: thumbnail }, caption: `❄️ • 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎 •\n\n🎵 ${title}\n👤 ${channel}\n⏱️ ${duration}\n👁️ ${viewsFmt}\n\n"${nomeBot}"` }, { quoted: msg })
          const audioRes = await fetch(download.mp3)
          const audioBuf = Buffer.from(await audioRes.arrayBuffer())
          if (audioBuf.length > 16 * 1024 * 1024) return sock.sendMessage(jid, { text: `❄️ • 𝐌𝐔𝐈𝐓𝐎 𝐆𝐑𝐀𝐍𝐃𝐄 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Limite: 16MB\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          await sock.sendMessage(jid, { audio: audioBuf, mimetype: "audio/mpeg", ptt: false }, { quoted: msg })
        } catch (e) {
          console.error("Erro play2:", e.message)
          await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Falha ao baixar. Tente de novo.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
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

        await sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎𝐔𝐍𝐃𝐂𝐋𝐎𝐔𝐃 •\n\n╭─〔 ♦️ 𝐁𝐔𝐒𝐂𝐀𝐍𝐃𝐎 〕\n│ Procurando no SoundCloud...\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })

        try {
          const searchRes = await fetch(`https://obanai-apis.eu.cc/api/search/soundcloud?q=${encodeURIComponent(busca)}&apitoken=rj8SpI`)
          const searchData = await searchRes.json()
          if (!searchData.success || !searchData.data?.data || !searchData.data.data.length) return sock.sendMessage(jid, { text: `❄️ • 𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐄𝐈 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Nenhuma música encontrada.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          const primeira = searchData.data.data[0]
          const duracaoSegundos = parseInt(primeira.duration)
          const duracaoFormatada = `${Math.floor(duracaoSegundos / 60)}:${(duracaoSegundos % 60).toString().padStart(2, "0")}`
          await sock.sendMessage(jid, { image: { url: primeira.thumbnail }, caption: `❄️ • 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎 •\n\n📌 ${primeira.title}\n🎤 ${primeira.artist}\n⏱️ ${duracaoFormatada}\n\n"${nomeBot}"` }, { quoted: msg })
          const dlRes = await fetch(`https://obanai-apis.eu.cc/api/dl/soundcloud?url=${encodeURIComponent(primeira.url)}&apitoken=rj8SpI`)
          const dlData = await dlRes.json()
          if (!dlData.success || !dlData.data?.download_url) return sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Falha ao baixar.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          const audioRes = await fetch(dlData.data.download_url)
          const audioBuf = Buffer.from(await audioRes.arrayBuffer())
          if (audioBuf.length > 16 * 1024 * 1024) return sock.sendMessage(jid, { text: `❄️ • 𝐌𝐔𝐈𝐓𝐎 𝐆𝐑𝐀𝐍𝐃𝐄 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Limite: 16MB\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          await sock.sendMessage(jid, { audio: audioBuf, mimetype: "audio/mpeg", ptt: false }, { quoted: msg })
        } catch (e) {
          console.error("Erro soundcloud:", e.message)
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
          if (!data?.status || !data.data?.resultado?.length) return sock.sendMessage(jid, { text: `❄️ • 𝐆𝟏 𝐍𝐎𝐓𝐈́𝐂𝐈𝐀𝐒 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Erro ao buscar notícias.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          const n = data.data.resultado[Math.floor(Math.random() * data.data.resultado.length)]
          await sock.sendMessage(jid, { text: `❄️ • 𝐆𝟏 𝐍𝐎𝐓𝐈́𝐂𝐈𝐀𝐒 •\n\n╭─〔 📰 𝐍𝐎𝐓𝐈́𝐂𝐈𝐀 〕\n│ Aleatória do G1\n╰──────────────\n\n📌 𝐓𝐢́𝐭𝐮𝐥𝐨:\n╰➜ ${n.noticia}\n\n📁 𝐒𝐞𝐜̧𝐚̃𝐨:\n╰➜ ${n.secao}\n\n🕒 𝐃𝐚𝐭𝐚:\n╰➜ ${n.data}\n\n📝 𝐃𝐞𝐬𝐜𝐫𝐢𝐜̧𝐚̃𝐨:\n╰➜ ${n.desc}\n\n🔗 𝐋𝐢𝐧𝐤:\n╰➜ ${n.link}\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) {
          console.error("Erro g1:", e.message)
          await sock.sendMessage(jid, { text: `❄️ • 𝐆𝟏 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
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
          if (!data?.status || !data.data?.resultado?.length) return sock.sendMessage(jid, { text: `❄️ • 𝐔𝐎𝐋 𝐍𝐎𝐓𝐈́𝐂𝐈𝐀𝐒 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Erro ao buscar notícias.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          const n = data.data.resultado[Math.floor(Math.random() * data.data.resultado.length)]
          await sock.sendMessage(jid, { text: `❄️ • 𝐔𝐎𝐋 𝐍𝐎𝐓𝐈́𝐂𝐈𝐀𝐒 •\n\n╭─〔 📰 𝐍𝐎𝐓𝐈́𝐂𝐈𝐀 〕\n│ Aleatória do UOL\n╰──────────────\n\n📌 𝐓𝐢́𝐭𝐮𝐥𝐨:\n╰➜ ${n.noticia}\n\n📁 𝐒𝐞𝐜̧𝐚̃𝐨:\n╰➜ ${n.secao}\n\n📝 𝐃𝐞𝐬𝐜𝐫𝐢𝐜̧𝐚̃𝐨:\n╰➜ ${n.desc}\n\n🔗 𝐋𝐢𝐧𝐤:\n╰➜ ${n.link}\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) {
          console.error("Erro uol:", e.message)
          await sock.sendMessage(jid, { text: `❄️ • 𝐔𝐎𝐋 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
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
          if (!data?.status || !data.data?.resultado?.length) return sock.sendMessage(jid, { text: `❄️ • 𝐉𝐎𝐕𝐄𝐌 𝐏𝐀𝐍 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Erro ao buscar notícias.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          const n = data.data.resultado[Math.floor(Math.random() * data.data.resultado.length)]
          await sock.sendMessage(jid, { text: `❄️ • 𝐉𝐎𝐕𝐄𝐌 𝐏𝐀𝐍 •\n\n╭─〔 📰 𝐍𝐎𝐓𝐈́𝐂𝐈𝐀 〕\n│ Aleatória da Jovem Pan\n╰──────────────\n\n📌 𝐓𝐢́𝐭𝐮𝐥𝐨:\n╰➜ ${n.noticia}\n\n📁 𝐒𝐞𝐜̧𝐚̃𝐨:\n╰➜ ${n.secao}\n\n🕒 𝐃𝐚𝐭𝐚:\n╰➜ ${n.data}\n\n📝 𝐃𝐞𝐬𝐜𝐫𝐢𝐜̧𝐚̃𝐨:\n╰➜ ${n.desc}\n\n🔗 𝐋𝐢𝐧𝐤:\n╰➜ ${n.link}\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) {
          console.error("Erro jovempan:", e.message)
          await sock.sendMessage(jid, { text: `❄️ • 𝐉𝐎𝐕𝐄𝐌 𝐏𝐀𝐍 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
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
          if (!data?.status || !data.data?.resultado?.length) return sock.sendMessage(jid, { text: `⚓ • 𝐕𝐀𝐒𝐂𝐎 𝐍𝐎𝐓𝐈́𝐂𝐈𝐀𝐒 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Erro ao buscar notícias.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          const n = data.data.resultado[Math.floor(Math.random() * data.data.resultado.length)]
          await sock.sendMessage(jid, { text: `⚓ • 𝐕𝐀𝐒𝐂𝐎 𝐍𝐎𝐓𝐈́𝐂𝐈𝐀𝐒 •\n\n╭─〔 📰 𝐍𝐎𝐓𝐈́𝐂𝐈𝐀 〕\n│ Aleatória do Vasco\n╰──────────────\n\n📌 𝐓𝐢́𝐭𝐮𝐥𝐨:\n╰➜ ${n.noticia}\n\n📝 𝐃𝐞𝐬𝐜𝐫𝐢𝐜̧𝐚̃𝐨:\n╰➜ ${n.desc}\n\n🔗 𝐋𝐢𝐧𝐤:\n╰➜ ${n.link}\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) {
          console.error("Erro vasco:", e.message)
          await sock.sendMessage(jid, { text: `⚓ • 𝐕𝐀𝐒𝐂𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
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
        if (!texto) return sock.sendMessage(jid, { text: `❄️ • 𝐆𝐄𝐑𝐀𝐑𝐍𝐈𝐂𝐊 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Informe o texto.\n╰──────────────\n\n💡 \`!gerarnick <texto>\`\n\n"${nomeBot}"` }, { quoted: msg })
        await sock.sendMessage(jid, { text: `❄️ • 𝐆𝐄𝐑𝐀𝐑𝐍𝐈𝐂𝐊 •\n\n╭─〔 ♦️ 𝐆𝐄𝐑𝐀𝐍𝐃𝐎 〕\n│ Gerando estilos...\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        try {
          const textoLimpo = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          const r = await fetch(`https://obanai-apis.eu.cc/api/tools/gerarnick?texto=${encodeURIComponent(textoLimpo)}&apitoken=rj8SpI`)
          const data = await r.json()
          if (!data?.success || !data.data?.length) return sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Não consegui gerar nicks.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          let txt = `❄️ • 𝐄𝐒𝐓𝐈𝐋𝐎𝐒 𝐏𝐀𝐑𝐀 "${textoLimpo}" •\n\n『 𝐋𝐢𝐬𝐭𝐚 』 ↴\n\n`
          data.data.forEach((n, i) => { txt += `${i + 1}. \`${n.nome}\`\n\n` })
          txt += `💡 Toque e segure pra copiar.\n\n"${nomeBot}"`
          await sock.sendMessage(jid, { text: txt }, { quoted: msg })
        } catch (e) {
          console.error("Erro gerarnick:", e.message)
          await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    llamacoder: {
      aliases: ["geracodigo", "codigo"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Só nobres!\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const prompt = args.join(" ").trim()
        if (!prompt) return sock.sendMessage(jid, { text: `❄️ • 𝐋𝐋𝐀𝐌𝐀𝐂𝐎𝐃𝐄𝐑 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Informe a descrição.\n╰──────────────\n\n💡 \`!llamacoder <descrição>\`\n📌 Ex: \`!llamacoder landing page restaurante\`\n\n"${nomeBot}"` }, { quoted: msg })
        await sock.sendMessage(jid, { text: `❄️ • 𝐋𝐋𝐀𝐌𝐀𝐂𝐎𝐃𝐄𝐑 •\n\n╭─〔 ♦️ 𝐆𝐄𝐑𝐀𝐍𝐃𝐎 𝐂𝐎́𝐃𝐈𝐆𝐎 〕\n│ Isso pode levar até 2 minutos...\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        try {
          const https = require("https")
          const postToLlamacoder = (pathUrl, data) => new Promise((resolve, reject) => {
            const body = JSON.stringify(data)
            const req = https.request({ hostname: "llamacoder.together.ai", path: pathUrl, method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } }, (res) => {
              let raw = ""
              res.on("data", (c) => raw += c)
              res.on("end", () => { try { resolve(JSON.parse(raw)) } catch (e) { reject(e) } })
            })
            req.on("error", reject)
            req.write(body)
            req.end()
          })
          const streamFromLlamacoder = (pathUrl, data) => new Promise((resolve, reject) => {
            const body = JSON.stringify(data)
            let full = ""
            const req = https.request({ hostname: "llamacoder.together.ai", path: pathUrl, method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } }, (res) => {
              res.on("data", (chunk) => {
                chunk.toString().split("\n").filter(Boolean).forEach((line) => {
                  try { const j = JSON.parse(line); const text = j.choices?.[0]?.delta?.content; if (text) full += text } catch {}
                })
              })
              res.on("end", () => resolve(full))
            })
            req.on("error", reject)
            req.write(body)
            req.end()
          })
          const { lastMessageId } = await postToLlamacoder("/api/create-chat", { prompt, model: "zai-org/GLM-5", quality: "low" })
          const output = await streamFromLlamacoder("/api/get-next-completion-stream-promise", { messageId: lastMessageId, model: "zai-org/GLM-5" })
          const files = []
          const regex = /```(?:tsx|ts|js|jsx|css|json|html|py|java|go|rs)\{path=([^}]+)\}\n([\s\S]*?)```/g
          let match
          while ((match = regex.exec(output)) !== null) files.push({ path: match[1], content: match[2].trim() })
          if (files.length === 0) return sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Não foi possível gerar o código.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          const tempDir = path.join(os.tmpdir(), "akaza_code")
          if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
          const slug = prompt.replace(/\s+/g, "-").toLowerCase().slice(0, 30)
          const outDir = path.join(tempDir, `output-${slug}`)
          const zipPath = path.join(tempDir, `code-${slug}.zip`)
          if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true })
          if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath)
          fs.mkdirSync(outDir, { recursive: true })
          for (const file of files) {
            const full = path.join(outDir, file.path)
            fs.mkdirSync(path.dirname(full), { recursive: true })
            fs.writeFileSync(full, file.content)
          }
          execSync(`zip -r "${zipPath}" .`, { cwd: outDir })
          const zipBuffer = fs.readFileSync(zipPath)
          fs.rmSync(outDir, { recursive: true, force: true })
          fs.unlinkSync(zipPath)
          await sock.sendMessage(jid, { document: zipBuffer, fileName: `${slug}.zip`, mimetype: "application/zip", caption: `❄️ • 𝐂𝐎́𝐃𝐈𝐆𝐎 𝐆𝐄𝐑𝐀𝐃𝐎 •\n\n📦 𝐀𝐫𝐪𝐮𝐢𝐯𝐨𝐬: ${files.length}\n👤 ${msg.pushName || "?"}\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) {
          console.error("[ERRO LLAMACODER]:", e.message)
          await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    waifu: {
      async executar({ sock, msg, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Só nobres!\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        await sock.sendMessage(jid, { text: `❄️ • 𝐖𝐀𝐈𝐅𝐔 •\n\n╭─〔 ♦️ 𝐁𝐔𝐒𝐂𝐀𝐍𝐃𝐎 〕\n│ Buscando imagens...\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        try {
          const fetchRetry = async (url, retries = 2) => {
            for (let i = 0; i < retries; i++) {
              try {
                const r = await fetch(url, { signal: AbortSignal.timeout(10000) })
                return await r.json()
              } catch (err) {
                if (i === retries - 1) throw err
                await new Promise(r => setTimeout(r, 1000))
              }
            }
          }
          const images = []
          for (let i = 0; i < 5; i++) {
            try {
              const data = await fetchRetry("https://nekos.best/api/v2/waifu")
              if (data?.results?.[0]?.url) images.push(data.results[0].url)
              await new Promise(r => setTimeout(r, 300))
            } catch (err) { console.log(`Erro waifu ${i + 1}:`, err.message) }
          }
          if (!images.length) for (let i = 0; i < 5; i++) images.push(`https://picsum.photos/id/${100 + i}/400/400`)
          const txt = `❄️ • 𝐖𝐀𝐈𝐅𝐔 •\n\n╭─〔 🙇‍♂️ 𝟓 𝐈𝐌𝐀𝐆𝐄𝐍𝐒 〕\n│ Aproveite\n╰──────────────\n\n"${nomeBot}"`
          for (const url of images) {
            try {
              await sock.sendMessage(jid, { image: { url }, caption: txt }, { quoted: msg })
              await new Promise(r => setTimeout(r, 800))
            } catch (_) {}
          }
        } catch (e) {
          console.error("Erro waifu:", e.message)
          await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Erro ao buscar imagens.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    feriados: {
      aliases: ["feriado", "calendario"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const ano = (args[0] && /^\d{4}$/.test(args[0].trim())) ? args[0].trim() : new Date().getFullYear()
        await sock.sendMessage(jid, { text: `❄️ • 𝐅𝐄𝐑𝐈𝐀𝐃𝐎𝐒 •\n\n╭─〔 ♦️ 𝐁𝐔𝐒𝐂𝐀𝐍𝐃𝐎 〕\n│ Procurando feriados de ${ano}...\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        try {
          const r = await fetch(`https://obanai-apis.eu.cc/api/outros/feriados?ano=${ano}&apitoken=rj8SpI`)
          const data = await r.json()
          if (!data?.success || !data.data?.total) return sock.sendMessage(jid, { text: `❄️ • 𝐅𝐄𝐑𝐈𝐀𝐃𝐎𝐒 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Nenhum feriado encontrado.\n╰──────────────\n\n💡 Tente: \`!feriados 2027\`\n\n"${nomeBot}"` }, { quoted: msg })
          const lista = data.data.feriados.map(f => `📌 *${f.date}* — ${f.name} _(${f.weekday})_`).join("\n")
          await sock.sendMessage(jid, { text: `❄️ • 𝐅𝐄𝐑𝐈𝐀𝐃𝐎𝐒 •\n\n╭─〔 🗓️ 𝐀𝐍𝐎 ${data.data.ano} 〕\n│ ${data.data.total} feriados\n╰──────────────\n\n${lista}\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) {
          console.log("Erro feriados:", e.message)
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
        if (!pergunta) return sock.sendMessage(jid, { text: `❄️ • 𝐔𝐍𝐋𝐈𝐀𝐈 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Informe a pergunta.\n╰──────────────\n\n💡 \`!unliai <pergunta>\`\n\n"${nomeBot}"` }, { quoted: msg })
        try {
          await sock.sendPresenceUpdate("composing", jid)
          await sock.sendMessage(jid, { text: `❄️ • 𝐔𝐍𝐋𝐈𝐀𝐈 •\n\n╭─〔 ♦️ 𝐏𝐄𝐍𝐒𝐀𝐍𝐃𝐎 〕\n│ Consultando a IA...\n╰──────────────\n\n❔ ${pergunta}\n\n"${nomeBot}"` }, { quoted: msg })
          const r = await fetch(`https://obanai-apis.eu.cc/api/ias/unliai?q=${encodeURIComponent(pergunta)}&apitoken=rj8SpI`)
          const data = await r.json()
          if (!data?.success || !data?.response) return sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Não consegui acessar a IA.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          await sock.sendMessage(jid, { text: data.response }, { quoted: msg })
        } catch (e) {
          console.log("Erro unliai:", e.message)
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
        if (!link || !/instagram\.com|instagr\.am/i.test(link)) return sock.sendMessage(jid, { text: `❄️ • 𝐈𝐍𝐒𝐓𝐀 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Informe um link.\n╰──────────────\n\n💡 \`!insta <link>\`\n\n"${nomeBot}"` }, { quoted: msg })
        await sock.sendMessage(jid, { text: `❄️ • 𝐁𝐀𝐈𝐗𝐀𝐍𝐃𝐎 •\n\n╭─〔 ♦️ 𝐀𝐆𝐔𝐀𝐑𝐃𝐄 〕\n│ Baixando do Instagram...\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        try {
          const res = await baixarInstagram(link)
          if (!res.ok) return sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${res.erro}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          const buffer = res.buffer
          if (buffer.length > 16 * 1024 * 1024) return sock.sendMessage(jid, { text: `❄️ • 𝐌𝐔𝐈𝐓𝐎 𝐆𝐑𝐀𝐍𝐃𝐄 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Limite: 16MB\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
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
        if (!link || !/tiktok\.com|vm\.tiktok|vt\.tiktok/i.test(link)) return sock.sendMessage(jid, { text: `❄️ • 𝐓𝐈𝐊𝐓𝐎𝐊 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Informe um link.\n╰──────────────\n\n💡 \`!tiktok <link>\`\n\n"${nomeBot}"` }, { quoted: msg })
        await sock.sendMessage(jid, { text: `❄️ • 𝐁𝐀𝐈𝐗𝐀𝐍𝐃𝐎 •\n\n╭─〔 ♦️ 𝐀𝐆𝐔𝐀𝐑𝐃𝐄 〕\n│ Baixando o vídeo...\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
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
        await sock.sendMessage(jid, { text: `❄️ • 𝐀𝐔𝐓𝐎𝐅𝐈𝐆 •\n\n╭─〔 ✅ 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Configuração atualizada.\n╰──────────────\n\n⚙️ ${op.toUpperCase()}\n\n"${nomeBot}"` }, { quoted: msg })
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
        await sock.sendMessage(jid, { text: `❄️ • 𝐀𝐔𝐓𝐎𝐓𝐓𝐊 •\n\n╭─〔 ✅ 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Configuração atualizada.\n╰──────────────\n\n⚙️ ${op.toUpperCase()}\n\n"${nomeBot}"` }, { quoted: msg })
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
        if (!img && !vid && !aud) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐄𝐌 𝐌𝐈́𝐃𝐈𝐀 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ Sem mídia.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        await sock.sendMessage(jid, { text: `❄️ • 𝐑𝐄𝐕𝐄𝐋𝐀𝐍𝐃𝐎 •\n\n╭─〔 👁️ 𝐀𝐆𝐔𝐀𝐑𝐃𝐄 〕\n│ Revelando...\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        try {
          const tipo = img ? "image" : vid ? "video" : "audio"
          const alvo = Object.assign({}, msg, { message: tipo === "image" ? { imageMessage: img } : tipo === "video" ? { videoMessage: vid } : { audioMessage: aud } })
          const buf = await utils.downloadMediaMessage(alvo, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          if (tipo === "image") await sock.sendMessage(jid, { image: buf, caption: `❄️ • 𝐑𝐄𝐕𝐄𝐋𝐀𝐃𝐎 •\n\n╭─〔 ✅ 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Mídia revelada.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          else if (tipo === "video") await sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", caption: `❄️ • 𝐑𝐄𝐕𝐄𝐋𝐀𝐃𝐎 •\n\n╭─〔 ✅ 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Vídeo revelado.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
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
        if (!t) return sock.sendMessage(jid, { text: `❄️ • 𝐁𝐑𝐀𝐓 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Informe o texto.\n╰──────────────\n\n💡 \`!brat <texto>\`\n\n"${nomeBot}"` }, { quoted: msg })
        await sock.sendMessage(jid, { text: `❄️ • 𝐁𝐑𝐀𝐓 •\n\n╭─〔 ♦️ 𝐂𝐑𝐈𝐀𝐍𝐃𝐎 〕\n│ Gerando figurinha...\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
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
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Só nobres!\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const q = ctx.quotedMessage
        const eImg = q && q.imageMessage
        const eVid = q && q.videoMessage
        if (!eImg && !eVid) return sock.sendMessage(jid, { text: `❄️ • 𝐒 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Responda foto ou vídeo.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        await sock.sendMessage(jid, { text: `❄️ • 𝐒 •\n\n╭─〔 ♦️ 𝐏𝐑𝐄𝐏𝐀𝐑𝐀𝐍𝐃𝐎 〕\n│ Criando figurinha...\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
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
      aliases: ["esticar", "stretch", "s3fig", "gordo"],
      async executar({ sock, msg, db, isDono, isSubDono, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Só nobres!\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const q = ctx.quotedMessage
        if (!q) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝟑 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Responda fig, foto ou vídeo.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const eSti = q.stickerMessage
        const eImg = q.imageMessage
        const eVid = q.videoMessage
        if (!eSti && !eImg && !eVid) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝟑 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Responda fig, foto ou vídeo.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        await sock.sendMessage(jid, { text: `❄️ • 𝐒𝟑 •\n\n╭─〔 ♦️ 𝐄𝐍𝐆𝐎𝐑𝐃𝐀𝐍𝐃𝐎 〕\n│ Aplicando efeito...\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
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
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Só nobres!\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const t = args.join(" ").trim()
        if (!t) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐌𝐄𝐌𝐄 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Informe o texto.\n╰──────────────\n\n💡 \`!smeme <texto>\`\n\n"${nomeBot}"` }, { quoted: msg })
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const q = ctx.quotedMessage
        if (!q || !q.stickerMessage) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐌𝐄𝐌𝐄 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Responda uma figurinha.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        await sock.sendMessage(jid, { text: `❄️ • 𝐒𝐌𝐄𝐌𝐄 •\n\n╭─〔 ♦️ 𝐂𝐑𝐈𝐀𝐍𝐃𝐎 〕\n│ Gerando meme...\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
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
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Só nobres!\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const q = ctx.quotedMessage
        if (!q || !q.stickerMessage) return sock.sendMessage(jid, { text: `❄️ • 𝐏𝐑𝐎𝐂𝐔𝐑𝐀𝐃𝐎 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Responda uma figurinha.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        await sock.sendMessage(jid, { text: `❄️ • 𝐏𝐑𝐎𝐂𝐔𝐑𝐀𝐃𝐎 •\n\n╭─〔 ♦️ 𝐂𝐑𝐈𝐀𝐍𝐃𝐎 〕\n│ Gerando cartaz...\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
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
          await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    wasted: {
      aliases: ["morto", "morreu"],
      async executar({ sock, msg, db, isDono, isSubDono, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Só nobres!\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const q = ctx.quotedMessage
        if (!q || !q.stickerMessage) return sock.sendMessage(jid, { text: `❄️ • 𝐖𝐀𝐒𝐓𝐄𝐃 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Responda uma figurinha.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        await sock.sendMessage(jid, { text: `❄️ • 𝐖𝐀𝐒𝐓𝐄𝐃 •\n\n╭─〔 ♦️ 𝐀𝐏𝐋𝐈𝐂𝐀𝐍𝐃𝐎 〕\n│ Aplicando efeito...\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
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
          await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    rename: {
      aliases: ["renomear", "nomefig", "setnome"],
      async executar({ sock, msg, args, db, isDono, isSubDono, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: `❄️ • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Só nobres!\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const t = args.join(" ").trim()
        if (!t) return sock.sendMessage(jid, { text: `❄️ • 𝐑𝐄𝐍𝐀𝐌𝐄 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Informe o nome do pack.\n╰──────────────\n\n💡 \`!rename <texto>\`\n\n"${nomeBot}"` }, { quoted: msg })
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const q = ctx.quotedMessage
        if (!q || !q.stickerMessage) return sock.sendMessage(jid, { text: `❄️ • 𝐑𝐄𝐍𝐀𝐌𝐄 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Responda uma figurinha.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        await sock.sendMessage(jid, { text: `❄️ • 𝐑𝐄𝐍𝐀𝐌𝐄 •\n\n╭─〔 ♦️ 𝐑𝐄𝐍𝐎𝐌𝐄𝐀𝐍𝐃𝐎 〕\n│ Aplicando nome...\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
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
          await sock.sendMessage(jid, { text: `❄️ • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
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
        if (isDono || isSubDono) return sock.sendMessage(jid, { text: `❄️ • 𝐌𝐄𝐔 𝐕𝐈𝐏 •\n\n╭─〔 👑 𝐀𝐔𝐓𝐎𝐑𝐈𝐃𝐀𝐃𝐄 〕\n│ Você é o mestre.\n╰──────────────\n\n💠 𝐂𝐚𝐫𝐠𝐨:\n╰➜ ${isDono ? "IMPERADOR" : "LUA SUPERIOR"}\n\n"${nomeBot}"` }, { quoted: msg })
        if (!info) return sock.sendMessage(jid, { text: `❄️ • 𝐌𝐄𝐔 𝐕𝐈𝐏 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Você não é nobre.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        await sock.sendMessage(jid, { text: `❄️ • 𝐌𝐄𝐔 𝐕𝐈𝐏 •\n\n╭─〔 ♦️ 𝐒𝐓𝐀𝐓𝐔𝐒 〕\n│ Sua nobreza atual.\n╰──────────────\n\n💠 𝐄𝐱𝐩𝐢𝐫𝐚:\n╰➜ ${info.expira === "inf" ? "INFINITO ♾️" : new Date(info.expira).toLocaleString("pt-BR")}\n\n"${nomeBot}"` }, { quoted: msg })
      }
    }

  }
}