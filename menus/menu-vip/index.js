/* ============================================================
   🌙 MENU VIP - KOKUSHIBO BOT MD
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

async function baixarTikTok(u) {
  const r = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(u)}&hd=1`)
  const d = await r.json()
  if (d.code !== 0 || !d.data || !d.data.play) throw new Error("Falha no link.")
  return d.data.play
}

// ============================================================
// 🎵 BAIXAR MÚSICA (YouTube via yt-dlp)
// ============================================================
function baixarMusica(busca, qualidade = 64) {
  const tmpDir = os.tmpdir()
  const id = Date.now() + "_" + Math.floor(Math.random() * 9999)
  const outTpl = path.join(tmpDir, "kokushibo_mus_" + id + ".%(ext)s")

  const ehUrl = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|music\.youtube\.com)/i.test(busca)
  const alvo = ehUrl ? busca : "ytsearch1:" + busca

  const cmds = [
    `yt-dlp -x --audio-format mp3 --audio-quality ${qualidade}k -o "${outTpl}" --no-playlist --match-filter "duration < 1200" --max-filesize 16M "${alvo}"`,
    `python3 -m yt_dlp -x --audio-format mp3 --audio-quality ${qualidade}k -o "${outTpl}" --no-playlist --match-filter "duration < 1200" --max-filesize 16M "${alvo}"`,
    `python -m yt_dlp -x --audio-format mp3 --audio-quality ${qualidade}k -o "${outTpl}" --no-playlist --match-filter "duration < 1200" --max-filesize 16M "${alvo}"`
  ]

  let ultimoErro = "yt-dlp não encontrado"
  for (const cmd of cmds) {
    try {
      execSync(cmd, { stdio: "ignore", timeout: 120000 })
      const prefixo = "kokushibo_mus_" + id
      const arquivos = fs.readdirSync(tmpDir).filter(f => f.startsWith(prefixo) && (f.endsWith(".mp3") || f.endsWith(".m4a") || f.endsWith(".webm") || f.endsWith(".opus")))
      if (arquivos.length > 0) {
        const caminho = path.join(tmpDir, arquivos[0])
        const buffer = fs.readFileSync(caminho)
        try { fs.unlinkSync(caminho) } catch (_) {}
        return { ok: true, buffer, qualidade }
      }
    } catch (e) {
      ultimoErro = e.message
    }
  }

  return { ok: false, erro: ultimoErro }
}

// ============================================================
// 🎥 BAIXAR VÍDEO DO YOUTUBE
// ============================================================
function baixarVideoYoutube(link) {
  const tmpDir = os.tmpdir()
  const id = Date.now() + "_" + Math.floor(Math.random() * 9999)
  const outTpl = path.join(tmpDir, "kokushibo_vid_" + id + ".%(ext)s")

  const cmds = [
    `yt-dlp -f "best[ext=mp4][filesize<16M]/best[filesize<16M]" -o "${outTpl}" --no-playlist --max-filesize 16M "${link}"`,
    `python3 -m yt_dlp -f "best[ext=mp4][filesize<16M]/best[filesize<16M]" -o "${outTpl}" --no-playlist --max-filesize 16M "${link}"`,
    `python -m yt_dlp -f "best[ext=mp4][filesize<16M]/best[filesize<16M]" -o "${outTpl}" --no-playlist --max-filesize 16M "${link}"`
  ]

  let ultimoErro = "yt-dlp não encontrado"
  for (const cmd of cmds) {
    try {
      execSync(cmd, { stdio: "ignore", timeout: 120000 })
      const prefixo = "kokushibo_vid_" + id
      const arquivos = fs.readdirSync(tmpDir).filter(f => f.startsWith(prefixo) && f.endsWith(".mp4"))
      if (arquivos.length > 0) {
        const caminho = path.join(tmpDir, arquivos[0])
        const buffer = fs.readFileSync(caminho)
        try { fs.unlinkSync(caminho) } catch (_) {}
        return { ok: true, buffer }
      }
    } catch (e) {
      ultimoErro = e.message
    }
  }

  return { ok: false, erro: ultimoErro }
}

// ============================================================
// 📸 BAIXAR INSTAGRAM (via yt-dlp)
// ============================================================
function baixarInstagram(link) {
  const tmpDir = os.tmpdir()
  const id = Date.now() + "_" + Math.floor(Math.random() * 9999)
  const outTpl = path.join(tmpDir, "kokushibo_insta_" + id + ".%(ext)s")

  const cmds = [
    `yt-dlp -o "${outTpl}" --no-playlist "${link}"`,
    `python3 -m yt_dlp -o "${outTpl}" --no-playlist "${link}"`,
    `python -m yt_dlp -o "${outTpl}" --no-playlist "${link}"`
  ]

  let ultimoErro = "yt-dlp não encontrado"
  for (const cmd of cmds) {
    try {
      execSync(cmd, { stdio: "ignore", timeout: 90000 })
      const prefixo = "kokushibo_insta_" + id
      const arquivos = fs.readdirSync(tmpDir).filter(f => f.startsWith(prefixo) && !f.endsWith(".part") && !f.endsWith(".ytdl"))
      if (arquivos.length > 0) {
        const caminho = path.join(tmpDir, arquivos[0])
        const buffer = fs.readFileSync(caminho)
        const ehVideo = /\.(mp4|mov|webm|mkv)$/i.test(arquivos[0])
        try { fs.unlinkSync(caminho) } catch (_) {}
        return { ok: true, buffer, ehVideo }
      }
    } catch (e) {
      ultimoErro = e.message
    }
  }

  return { ok: false, erro: ultimoErro }
}

// ============================================================
// 📌 BUSCAR PINTEREST (via pinterest-scraper-api)
// ============================================================
async function buscarPinterest(busca, limite = 20) {
  try {
    const pinterestScraper = require("pinterest-scraper-api")

    let resultados

    // Tenta diferentes métodos da lib
    if (typeof pinterestScraper.searchPinterest === "function") {
      resultados = await pinterestScraper.searchPinterest(busca, limite)
    } else if (typeof pinterestScraper.search === "function") {
      resultados = await pinterestScraper.search(busca, limite)
    } else if (typeof pinterestScraper === "function") {
      resultados = await pinterestScraper(busca, limite)
    } else {
      throw new Error("Função de busca não encontrada na lib")
    }

    if (!resultados) throw new Error("Lib não retornou dados")

    // Normaliza
    const lista = Array.isArray(resultados) ? resultados : (resultados.data || resultados.results || resultados.pins || [])

    if (!lista.length) throw new Error("Nenhum resultado encontrado")

    // Extrai URLs das imagens
    const urls = []
    for (const item of lista) {
      let url = null
      if (typeof item === "string") url = item
      else url = item.imageUrl || item.url || item.image || item.images?.orig?.url || item.images?.["736x"]?.url || item.media || null

      if (url && typeof url === "string") urls.push(url)
    }

    const unicas = [...new Set(urls)].slice(0, limite)

    if (!unicas.length) throw new Error("Nenhuma URL válida")

    return { ok: true, urls: unicas }

  } catch (e) {
    return { ok: false, erro: e.message }
  }
}

const VERDADES = ["Qual é o seu maior sonho?","Qual foi o momento mais feliz da sua vida?","Qual é o seu maior medo?","Quem é a pessoa que você mais admira?","Qual foi a coisa mais engraçada que já te aconteceu?","Qual é a sua comida favorita?","Qual a música que mais te marca?","Qual foi o melhor presente que você já ganhou?","Se você pudesse viajar pra qualquer lugar agora, pra onde iria?","Qual é o seu hobby favorito?","Qual filme você já assistiu mais de 10 vezes?","O que te faz rir muito?","Qual é a sua maior qualidade?","E o seu maior defeito?","Se você pudesse ter um superpoder, qual seria?","Qual foi a última vez que você riu até chorar?","Qual é o seu desenho ou anime favorito?","Qual é a coisa mais aleatória que você já pesquisou?","Qual animal você seria se pudesse escolher?","Qual foi a melhor fase da sua vida até agora?"]
const DESAFIOS = ["Mande um áudio cantando uma música aleatória","Tire uma selfie com pose engraçada","Marque alguém do grupo e diga 'você é top'","Mande áudio imitando alguém do grupo","Conte uma piada pra todos","Fale 'bom dia' pra 3 pessoas aleatórias e mande print","Escreva um poema de 4 linhas sobre alguém do grupo","Mande áudio com sotaque diferente","Escreva 3 coisas aleatórias sobre você","Mande uma foto sua de um ângulo bem feio","Faça uma declaração divertida pra alguém do grupo","Mande áudio falando 'miau' 5 vezes","Marque alguém e elogie 3 coisas nessa pessoa","Escreva um status engraçado e mande print","Faça uma dancinha e mande o vídeo","Fale só em emojis pelas próximas 3 mensagens","Descreva alguém do grupo sem falar o nome","Mande uma foto sua de 2 anos atrás"]

const BOLAS = [
  { id: "comum", nome: "Comum", emoji: "⚪", dano: 16, ch: 0, ef: "nenhum", desc: "Básica equilibrada" },
  { id: "fogo", nome: "Fogo", emoji: "🔴", dano: 18, ch: 0.30, ef: "queimar", desc: "30% Queimar" },
  { id: "gelo", nome: "Gelo", emoji: "🔵", dano: 12, ch: 0.30, ef: "congelar", desc: "30% Congelar" },
  { id: "eletrica", nome: "Elétrica", emoji: "🟡", dano: 17, ch: 0.35, ef: "critico", desc: "35% Crit x2" },
  { id: "pesada", nome: "Pesada", emoji: "🟤", dano: 24, ch: 0.25, ef: "armadura", desc: "25% -armadura" },
  { id: "rapida", nome: "Rápida", emoji: "🟢", dano: 11, ch: 0.50, ef: "duplo", desc: "50% Ataque duplo" },
  { id: "venenosa", nome: "Venenosa", emoji: "🟣", dano: 9, ch: 0.60, ef: "veneno", desc: "60% Veneno" },
  { id: "cura", nome: "Cura", emoji: "🩷", dano: 8, ch: 0.70, ef: "cura", desc: "70% Cura" },
  { id: "dourada", nome: "Dourada", emoji: "🌟", dano: 19, ch: 0.35, ef: "brilho", desc: "35% Brilho x1.8" },
  { id: "diamante", nome: "Diamante", emoji: "💎", dano: 22, ch: 0.35, ef: "perfurar", desc: "35% Golpe x3" }
]

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
  } catch (e) { await sock.sendMessage(jid, { text: "🌙💢 " + e.message }, { quoted }) }
}

// ============================================================
// 🌙 CONVERTER IMAGEM EM FIGURINHA COM EXIF DE PACK
// ============================================================
async function imagemParaFigurinha(buffer, packId, packName, autor) {
  try {
    const sharp = require("sharp")
    const { Image } = require("node-webpmux")

    let webpBuf = await sharp(buffer)
      .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 85 })
      .toBuffer()

    const img = new Image()
    await img.load(webpBuf)

    const json = {
      "sticker-pack-id": packId,
      "sticker-pack-name": packName,
      "sticker-pack-publisher": autor,
      "emojis": ["🌙"]
    }

    const exifAttr = Buffer.from([
      0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x16, 0x00, 0x00, 0x00
    ])
    const jsonBuf = Buffer.from(JSON.stringify(json), "utf8")
    const exif = Buffer.concat([exifAttr, jsonBuf])
    exif.writeUIntLE(jsonBuf.length, 14, 4)

    img.exif = exif
    const outBuf = await img.save(null)

    return outBuf
  } catch (e) {
    console.log("Erro converter figurinha:", e.message)
    return null
  }
}

module.exports = {
  menu: "menu-vip",
  grupoOnly: false,
  adminOnly: false,
  donoOnly: false,

  commands: {

    // ============ MENU VIP ============
    menuvip: {
      aliases: ["vipmenu", "menuv"],
      async executar({ sock, msg, prefixoAtivo, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo
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
          return sock.sendMessage(jid, { text: "🌙💜 *SÓ VIP*\n\n> _\"Meus olhos veem que você não é nobre.\"_\n\n_\"Vá embora.\"_" }, { quoted: msg })
        }

        const texto = "🌙💜 *MENU VIP - KOKUSHIBO* 💜🌙\n\n" +
          "> _\"Apenas nobres podem ver esses segredos.\"_\n\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "🎵 *MÚSICA*\n" +
          "▸ `" + p + "play <nome ou link>`\n" +
          "▸ `" + p + "spot <link>`\n\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "📥 *DOWNLOADS*\n" +
          "▸ `" + p + "insta <link>`\n" +
          "▸ `" + p + "tiktok <link>`\n" +
          "▸ `" + p + "packfig <busca>`\n\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "🎨 *FIGURINHAS*\n" +
          "▸ `" + p + "brat / " + p + "ttps / " + p + "s`\n" +
          "▸ `" + p + "smeme / " + p + "s3 / " + p + "rename`\n" +
          "▸ `" + p + "procurado / " + p + "wasted / " + p + "revela`\n\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "🎮 *JOGOS*\n" +
          "▸ `" + p + "verdadedesafio`\n" +
          "▸ `" + p + "bolavsbola`\n" +
          "▸ `" + p + "jogodavelha`\n\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "⚔️ *EXTRAS*\n" +
          "▸ `" + p + "fraseprofunda`\n" +
          "▸ `" + p + "mito`\n" +
          "▸ `" + p + "napoleao`\n\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
          "> 💜 _\"A lua recompensa os nobres.\"_"

        const cfg = db.config()
        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          if (cfg.tipoMenu === "video") return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "kokushibo.mp4", gifPlayback: true, caption: texto }, { quoted: msg })
          return sock.sendMessage(jid, { image: buf, caption: texto }, { quoted: msg })
        }
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    // ============ PLAY ============
    play: {
      aliases: ["tocar", "musica", "music"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)

        if (!checarVip(db, sJ, isDono, isSubDono)) {
          return sock.sendMessage(jid, { text: "🌙💜 *SÓ VIP*\n\n> _\"Música é privilégio dos nobres.\"_\n\n_\"Vá embora, mortal.\"_" }, { quoted: msg })
        }

        const busca = args.join(" ").trim()
        if (!busca) {
          return sock.sendMessage(jid, {
            text: "🌙🎵 *PLAY*\n\n> _\"Me diga o que quer ouvir.\"_\n\n💡 `!play <nome>`\n💡 `!play <link yt>` _(vídeo)_\n\n⚠️ _Limite: 20 min_"
          }, { quoted: msg })
        }

        const ehLinkVideo = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch|youtu\.be\/)/i.test(busca)

        if (ehLinkVideo) {
          await sock.sendMessage(jid, { text: "🌙🎥 *BAIXANDO VÍDEO...*\n\n📥 _Aguarde._" }, { quoted: msg })
          try {
            const res = baixarVideoYoutube(busca)
            if (!res.ok) throw new Error(res.erro)
            const buffer = res.buffer
            const tamanhoMB = (buffer.length / 1024 / 1024).toFixed(2)
            if (buffer.length > 16 * 1024 * 1024) {
              return sock.sendMessage(jid, { text: "🌙💢 *MUITO GRANDE*\n\n⚠️ " + tamanhoMB + "MB" }, { quoted: msg })
            }
            await sock.sendMessage(jid, { video: buffer, mimetype: "video/mp4", fileName: "youtube.mp4" }, { quoted: msg })
          } catch (e) {
            await sock.sendMessage(jid, { text: "🌙💥 *ERRO*\n\n⚠️ `" + e.message + "`" }, { quoted: msg })
          }
          return
        }

        await sock.sendMessage(jid, { text: "🌙🎵 *BUSCANDO...*\n\n📥 _Aguarde._" }, { quoted: msg })

        try {
          let res = baixarMusica(busca, 64)
          if (res.ok && res.buffer.length > 16 * 1024 * 1024) {
            await sock.sendMessage(jid, { text: "🌙💢 *MUITO GRANDE*\n\n> _\"Tentando reduzir qualidade...\"_" }, { quoted: msg })
            res = baixarMusica(busca, 32)
          }
          if (!res.ok) {
            return sock.sendMessage(jid, { text: "🌙💥 *ERRO*\n\n⚠️ _Verifique yt-dlp/ffmpeg._" }, { quoted: msg })
          }
          const buffer = res.buffer
          if (buffer.length > 16 * 1024 * 1024) {
            return sock.sendMessage(jid, { text: "🌙💢 *MUITO GRANDE*\n\n⚠️ Limite: 16MB" }, { quoted: msg })
          }
          await sock.sendMessage(jid, {
            audio: buffer,
            mimetype: "audio/mp4",
            ptt: false,
            fileName: (busca.length > 30 ? busca.slice(0, 30) : busca) + ".mp3"
          }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: "🌙💥 *ERRO*\n\n⚠️ `" + e.message + "`" }, { quoted: msg })
        }
      }
    },

    // ============ PACKFIG ============
    packfig: {
      aliases: ["pack", "figpack", "stickerpack"],
      async executar({ sock, msg, args, db, isDono, isSubDono, sender, utils }) {
        const jid = msg.key.remoteJid
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)

        if (!checarVip(db, sJ, isDono, isSubDono)) {
          return sock.sendMessage(jid, { text: "🌙💜 *SÓ VIP*\n\n> _\"Packs são privilégio dos nobres.\"_\n\n_\"Vá embora, mortal.\"_" }, { quoted: msg })
        }

        const busca = args.join(" ").trim()
        if (!busca) {
          return sock.sendMessage(jid, {
            text: "🌙🎨 *PACKFIG*\n\n> _\"Me diga o que buscar.\"_\n\n💡 `!packfig <nome>`\n\n📌 Ex: `!packfig goku`\n\n⚠️ _20 figurinhas por pack_"
          }, { quoted: msg })
        }

        const num = utils.soNumero(sender)

        await sock.sendMessage(jid, {
          text: "🌙🎨 *BUSCANDO NO PINTEREST...*\n\n> _\"Meus 6 olhos procuram " + busca + "...\"_\n\n📥 _Aguarde..._"
        }, { quoted: msg })

        try {
          const res = await buscarPinterest(busca, 20)

          if (!res.ok || !res.urls.length) {
            return sock.sendMessage(jid, {
              text: "🌙💥 *ERRO*\n\n> _\"Não encontrei imagens...\"_\n\n⚠️ `" + (res.erro || "Sem resultados") + "`\n\n💡 Tente uma busca mais simples."
            }, { quoted: msg })
          }

          await sock.sendMessage(jid, {
            text: "🌙🎨 *CRIANDO PACK...*\n\n> _\"Encontrei " + res.urls.length + " imagens.\"_\n> _\"Convertendo...\"_\n\n⚠️ _Aguarde._"
          }, { quoted: msg })

          const packId = "com.kokushibo.pack." + Date.now() + "." + num
          const packName = busca
          const autor = "Kokushibo Bot"

          let enviados = 0
          let falhas = 0

          for (let i = 0; i < res.urls.length; i++) {
            try {
              const imgRes = await fetch(res.urls[i], {
                headers: {
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                  "Referer": "https://br.pinterest.com/"
                }
              })
              if (!imgRes.ok) { falhas++; continue }
              const imgBuf = Buffer.from(await imgRes.arrayBuffer())
              const fig = await imagemParaFigurinha(imgBuf, packId, packName, autor)
              if (fig) {
                await sock.sendMessage(jid, { sticker: fig }, { quoted: msg })
                enviados++
              } else {
                falhas++
              }
            } catch (e) {
              falhas++
              console.log("Erro figurinha " + i + ":", e.message)
            }
            await new Promise(r => setTimeout(r, 300))
          }

          await sock.sendMessage(jid, {
            text: "🌙✅ *PACK ENVIADO!*\n\n" +
              "> 👁️ _\"Criei " + enviados + " figurinhas.\"_\n" +
              (falhas > 0 ? "> _\"" + falhas + " falharam.\"_\n" : "") +
              "\n━━━━━━━━━━━━━━━━━━━━━━\n" +
              "📦 *Pack:* " + packName + "\n" +
              "🎨 *Autor:* " + autor + "\n" +
              "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
              "> 💜 _\"Todas as imagens foram apagadas.\"_"
          }, { quoted: msg })

          console.log("🎨 Pack criado:", enviados, "figurinhas de", busca)

        } catch (e) {
          console.log("Erro packfig:", e.message)
          await sock.sendMessage(jid, {
            text: "🌙💥 *ERRO NO PACK*\n\n⚠️ `" + e.message + "`"
          }, { quoted: msg })
        }
      }
    },

    // ============ SPOT ============
    spot: {
      aliases: ["spotify", "musicaspot", "spotdl"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: "🌙💜 Só nobres!" }, { quoted: msg })

        const link = args[0]
        if (!link || !/open\.spotify\.com/i.test(link)) {
          return sock.sendMessage(jid, { text: "🌙🎵 `!spot <link do Spotify>`" }, { quoted: msg })
        }

        await sock.sendMessage(jid, { text: "🌙🎵 *BUSCANDO NO SPOTIFY...*\n\n📥 _Aguarde._" }, { quoted: msg })

        try {
          const SpottyDL = require("spottydl")
          const tmpDir = os.tmpdir()
          const id = Date.now() + "_" + Math.floor(Math.random() * 9999)
          const pastaTemp = path.join(tmpDir, "kokushibo_spot_" + id)
          if (!fs.existsSync(pastaTemp)) fs.mkdirSync(pastaTemp, { recursive: true })

          const trackInfo = await SpottyDL.getTrack(link)
          if (!trackInfo || !trackInfo.title) throw new Error("Link inválido")

          const resultado = await SpottyDL.downloadTrack(trackInfo, pastaTemp)
          if (!resultado || !resultado[0] || resultado[0].status !== "Success") throw new Error("Falha ao baixar")

          const arquivoBaixado = resultado[0].filename
          if (!fs.existsSync(arquivoBaixado)) throw new Error("Arquivo não encontrado")

          const buffer = fs.readFileSync(arquivoBaixado)
          const tamanhoMB = (buffer.length / 1024 / 1024).toFixed(2)

          try { fs.unlinkSync(arquivoBaixado) } catch (_) {}
          try { fs.rmSync(pastaTemp, { recursive: true, force: true }) } catch (_) {}

          if (buffer.length > 16 * 1024 * 1024) {
            return sock.sendMessage(jid, { text: "🌙💢 *MUITO GRANDE*\n\n⚠️ " + tamanhoMB + "MB" }, { quoted: msg })
          }

          await sock.sendMessage(jid, {
            audio: buffer,
            mimetype: "audio/mp4",
            ptt: false,
            fileName: trackInfo.title + " - " + (trackInfo.artist || "?") + ".mp3"
          }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: "🌙💥 *ERRO NO SPOTIFY*\n\n⚠️ `" + e.message + "`" }, { quoted: msg })
        }
      }
    },

    // ============ INSTA ============
    insta: {
      aliases: ["instagram", "instadl", "ig"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: "🌙💜 Só nobres!" }, { quoted: msg })

        const link = args[0]
        if (!link || !/instagram\.com|instagr\.am/i.test(link)) {
          return sock.sendMessage(jid, { text: "🌙📥 `!insta <link>`" }, { quoted: msg })
        }

        await sock.sendMessage(jid, { text: "🌙📥 *BAIXANDO DO INSTAGRAM...*\n\n📥 _Aguarde..._" }, { quoted: msg })

        try {
          const res = baixarInstagram(link)
          if (!res.ok) return sock.sendMessage(jid, { text: "🌙💥 *ERRO*\n\n⚠️ `" + res.erro + "`" }, { quoted: msg })
          const buffer = res.buffer
          if (buffer.length > 16 * 1024 * 1024) return sock.sendMessage(jid, { text: "🌙💢 *MUITO GRANDE*" }, { quoted: msg })
          if (res.ehVideo) {
            await sock.sendMessage(jid, { video: buffer, mimetype: "video/mp4", fileName: "instagram.mp4" }, { quoted: msg })
          } else {
            await sock.sendMessage(jid, { image: buffer, caption: "🌙📸 *INSTAGRAM*" }, { quoted: msg })
          }
        } catch (e) {
          await sock.sendMessage(jid, { text: "🌙💥 *ERRO*\n\n⚠️ `" + e.message + "`" }, { quoted: msg })
        }
      }
    },

    // ============ AUTOFIX ============
    autofig: {
      aliases: ["autosticker", "autofigu"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: "🌙💜 Só nobres!" }, { quoted: msg })
        if (!jid.endsWith("@g.us")) return sock.sendMessage(jid, { text: "🌙 Só em grupos!" }, { quoted: msg })

        const op = (args[0] || "").toLowerCase()
        const ac = dbLer("autocfg.json", { grupos: {} })
        ac.grupos = ac.grupos || {}
        ac.grupos[jid] = ac.grupos[jid] || {}
        if (!["on", "off"].includes(op)) {
          const s = ac.grupos[jid].autofig ? "ON ✅" : "OFF ❌"
          return sock.sendMessage(jid, { text: "🌙 *AUTOFIX*\n\n📊 Status: *" + s + "*\n\n💡 `!autofig on/off`" }, { quoted: msg })
        }
        ac.grupos[jid].autofig = op === "on"
        dbSalvar("autocfg.json", ac)
        await sock.sendMessage(jid, { text: "🌙 Autofig: *" + op.toUpperCase() + "*" }, { quoted: msg })
      }
    },

    autottk: {
      aliases: ["autotiktok", "autott"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: "🌙💜 Só nobres!" }, { quoted: msg })
        if (!jid.endsWith("@g.us")) return sock.sendMessage(jid, { text: "🌙 Só em grupos!" }, { quoted: msg })

        const op = (args[0] || "").toLowerCase()
        const ac = dbLer("autocfg.json", { grupos: {} })
        ac.grupos = ac.grupos || {}
        ac.grupos[jid] = ac.grupos[jid] || {}
        if (!["on", "off"].includes(op)) {
          const s = ac.grupos[jid].autottk ? "ON ✅" : "OFF ❌"
          return sock.sendMessage(jid, { text: "🌙 *AUTOTTK*\n\n📊 Status: *" + s + "*\n\n💡 `!autottk on/off`" }, { quoted: msg })
        }
        ac.grupos[jid].autottk = op === "on"
        dbSalvar("autocfg.json", ac)
        await sock.sendMessage(jid, { text: "🌙 Autottk: *" + op.toUpperCase() + "*" }, { quoted: msg })
      }
    },

    // ============ TIKTOK ============
    tiktok: {
      aliases: ["tt", "ttk"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: "🌙💜 Só nobres!" }, { quoted: msg })

        const link = args[0]
        if (!link || !/tiktok\.com|vm\.tiktok|vt\.tiktok/i.test(link)) return sock.sendMessage(jid, { text: "🌙📥 `!tiktok <link>`" }, { quoted: msg })

        await sock.sendMessage(jid, { text: "🌙📥 *BAIXANDO...*" }, { quoted: msg })

        try {
          const url = await baixarTikTok(link)
          const r = await fetch(url)
          await sock.sendMessage(jid, { video: Buffer.from(await r.arrayBuffer()), mimetype: "video/mp4", fileName: "tiktok.mp4" }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: "🌙💢 " + e.message }, { quoted: msg })
        }
      }
    },

    // ============ REVELA ============
    revela: {
      aliases: ["revelar", "reveal", "ver"],
      async executar({ sock, msg, db, utils, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: "🌙💜 Só nobres!" }, { quoted: msg })

        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        let q = ctx.quotedMessage
        if (!q) return sock.sendMessage(jid, { text: "🌙👁️ Responda uma mensagem de *ver uma vez*" }, { quoted: msg })

        let isVU = false
        if (q.viewOnceMessageV2) { q = q.viewOnceMessageV2.message || q.viewOnceMessageV2; isVU = true }
        else if (q.viewOnceMessage) { q = q.viewOnceMessage.message || q.viewOnceMessage; isVU = true }

        const img = q.imageMessage, vid = q.videoMessage, aud = q.audioMessage
        if (img && img.viewOnce) isVU = true
        if (vid && vid.viewOnce) isVU = true
        if (aud && aud.viewOnce) isVU = true
        if (!isVU) return sock.sendMessage(jid, { text: "🌙❌ Não é de *ver uma vez*!" }, { quoted: msg })
        if (!img && !vid && !aud) return sock.sendMessage(jid, { text: "🌙❌ Sem mídia!" }, { quoted: msg })

        await sock.sendMessage(jid, { text: "🌙👁️ *REVELANDO...*" }, { quoted: msg })

        try {
          const tipo = img ? "image" : vid ? "video" : "audio"
          const alvo = Object.assign({}, msg, { message: tipo === "image" ? { imageMessage: img } : tipo === "video" ? { videoMessage: vid } : { audioMessage: aud } })
          const buf = await utils.downloadMediaMessage(alvo, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          if (tipo === "image") await sock.sendMessage(jid, { image: buf, caption: "🌙👁️ *REVELADO*" }, { quoted: msg })
          else if (tipo === "video") await sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", caption: "🌙👁️ *REVELADO*" }, { quoted: msg })
          else await sock.sendMessage(jid, { audio: buf, mimetype: "audio/mp4", ptt: false }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: "🌙💢 " + e.message }, { quoted: msg })
        }
      }
    },

    // ============ BRAT ============
    brat: {
      aliases: ["figbrat"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: "🌙💜 Só nobres!" }, { quoted: msg })

        const t = args.join(" ").trim()
        if (!t) return sock.sendMessage(jid, { text: "🌙🎨 `!brat <texto>`" }, { quoted: msg })

        await sock.sendMessage(jid, { text: "🌙🎨 *CRIANDO...*" }, { quoted: msg })

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
          await sock.sendMessage(jid, { text: "🌙💢 " + e.message }, { quoted: msg })
        }
      }
    },

    // ============ S ============
    s: {
      aliases: ["sticker", "fig"],
      async executar({ sock, msg, db, isDono, isSubDono, utils }) {
        const jid = msg.key.remoteJid
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: "🌙💜 Só nobres!" }, { quoted: msg })

        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const q = ctx.quotedMessage
        const eImg = q && q.imageMessage
        const eVid = q && q.videoMessage
        if (!eImg && !eVid) return sock.sendMessage(jid, { text: "🌙🎨 Responda foto/vídeo!" }, { quoted: msg })

        await sock.sendMessage(jid, { text: "🌙🎨 *PREPARANDO...*" }, { quoted: msg })

        try {
          const sharp = require("sharp")
          const ff = require("@ffmpeg-installer/ffmpeg").path
          const os = require("os")
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
          await sock.sendMessage(jid, { text: "🌙💢 " + e.message }, { quoted: msg })
        }
      }
    },

    // ============ S3 ============
    s3: {
      aliases: ["esticar", "stretch", "s3fig", "gordo"],
      async executar({ sock, msg, db, isDono, isSubDono, utils }) {
        const jid = msg.key.remoteJid
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: "🌙💜 Só nobres!" }, { quoted: msg })

        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const q = ctx.quotedMessage
        if (!q) return sock.sendMessage(jid, { text: "🌙🎨 Responda figurinha, foto ou vídeo" }, { quoted: msg })

        const eSti = q.stickerMessage
        const eImg = q.imageMessage
        const eVid = q.videoMessage
        if (!eSti && !eImg && !eVid) return sock.sendMessage(jid, { text: "🌙🎨 Responda figurinha, foto ou vídeo!" }, { quoted: msg })

        await sock.sendMessage(jid, { text: "🌙🎨 *ENGORDANDO 40%...*" }, { quoted: msg })

        try {
          const sharp = require("sharp")
          const ff = require("@ffmpeg-installer/ffmpeg").path
          const os = require("os")
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
            resultado = await sharp(buf, { animated: false })
              .resize(512, alturaFinal, { fit: "fill" })
              .extend({ top: paddingVertical, bottom: paddingVertical, left: 0, right: 0, background: { r: 0, g: 0, b: 0, alpha: 0 } })
              .webp({ quality: 90 })
              .toBuffer()
          }
          await sock.sendMessage(jid, { sticker: resultado }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: "🌙💢 " + e.message }, { quoted: msg })
        }
      }
    },

    // ============ SMEME ============
    smeme: {
      aliases: ["smem", "memefig"],
      async executar({ sock, msg, args, db, isDono, isSubDono, utils }) {
        const jid = msg.key.remoteJid
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: "🌙💜 Só nobres!" }, { quoted: msg })

        const t = args.join(" ").trim()
        if (!t) return sock.sendMessage(jid, { text: "🌙🎨 `!smeme <texto>`" }, { quoted: msg })

        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const q = ctx.quotedMessage
        if (!q || !q.stickerMessage) return sock.sendMessage(jid, { text: "🌙🎨 Responda figurinha!" }, { quoted: msg })

        await sock.sendMessage(jid, { text: "🌙🎨 *CRIANDO...*" }, { quoted: msg })

        try {
          const alvo = Object.assign({}, msg, { message: { stickerMessage: q.stickerMessage } })
          const buf = await utils.downloadMediaMessage(alvo, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          await enviarFigTexto(sock, jid, buf, t, msg)
        } catch (e) {
          await sock.sendMessage(jid, { text: "🌙💢 " + e.message }, { quoted: msg })
        }
      }
    },

    // ============ PROCURADO ============
    procurado: {
      aliases: ["wanted", "procurase"],
      async executar({ sock, msg, db, isDono, isSubDono, utils }) {
        const jid = msg.key.remoteJid
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: "🌙💜 Só nobres!" }, { quoted: msg })

        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const q = ctx.quotedMessage
        if (!q || !q.stickerMessage) return sock.sendMessage(jid, { text: "🌙🎨 Responda figurinha!" }, { quoted: msg })

        await sock.sendMessage(jid, { text: "🌙🎨 *CRIANDO CARTAZ...*" }, { quoted: msg })

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
          await sock.sendMessage(jid, { text: "🌙💢 " + e.message }, { quoted: msg })
        }
      }
    },

    // ============ WASTED ============
    wasted: {
      aliases: ["morto", "morreu"],
      async executar({ sock, msg, db, isDono, isSubDono, utils }) {
        const jid = msg.key.remoteJid
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: "🌙💜 Só nobres!" }, { quoted: msg })

        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const q = ctx.quotedMessage
        if (!q || !q.stickerMessage) return sock.sendMessage(jid, { text: "🌙🎨 Responda figurinha!" }, { quoted: msg })

        await sock.sendMessage(jid, { text: "🌙🎨 *APLICANDO WASTED...*" }, { quoted: msg })

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
          await sock.sendMessage(jid, { text: "🌙💢 " + e.message }, { quoted: msg })
        }
      }
    },

    // ============ RENAME ============
    rename: {
      aliases: ["renomear", "nomefig", "setnome"],
      async executar({ sock, msg, args, db, isDono, isSubDono, utils }) {
        const jid = msg.key.remoteJid
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) return sock.sendMessage(jid, { text: "🌙💜 Só nobres!" }, { quoted: msg })

        const t = args.join(" ").trim()
        if (!t) return sock.sendMessage(jid, { text: "🌙🎨 `!rename <texto>` (responda figurinha)" }, { quoted: msg })

        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const q = ctx.quotedMessage
        if (!q || !q.stickerMessage) return sock.sendMessage(jid, { text: "🌙🎨 Responda figurinha!" }, { quoted: msg })

        await sock.sendMessage(jid, { text: "🌙🎨 *RENOMEANDO...*" }, { quoted: msg })

        try {
          const alvo = Object.assign({}, msg, { message: { stickerMessage: q.stickerMessage } })
          const buf = await utils.downloadMediaMessage(alvo, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          let outBuf = buf
          try {
            const { Image } = require("node-webpmux")
            const img = new Image()
            await img.load(buf)
            const json = { "sticker-pack-id": "com.kokushibo." + Date.now(), "sticker-pack-name": t, "sticker-pack-publisher": t, "emojis": ["🌙"] }
            const exifAttr = Buffer.from([0x49,0x49,0x2A,0x00,0x08,0x00,0x00,0x00,0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,0x00,0x00,0x16,0x00,0x00,0x00])
            const jsonBuf = Buffer.from(JSON.stringify(json), "utf8")
            const exif = Buffer.concat([exifAttr, jsonBuf])
            exif.writeUIntLE(jsonBuf.length, 14, 4)
            img.exif = exif
            outBuf = await img.save(null)
          } catch (e) { console.log("Aviso exif:", e.message) }
          await sock.sendMessage(jid, { sticker: outBuf, packname: t, author: t }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: "🌙💢 " + e.message }, { quoted: msg })
        }
      }
    },

    // ============ MEU VIP ============
    meuvip: {
      aliases: ["vipinfo"],
      async executar({ sock, msg, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
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

        if (isDono || isSubDono) return sock.sendMessage(jid, { text: "🌙💜 *MEU VIP*\n\n👑 " + (isDono ? "IMPERADOR" : "LUA SUPERIOR") }, { quoted: msg })
        if (!info) return sock.sendMessage(jid, { text: "🌙 Você não é nobre!" }, { quoted: msg })

        await sock.sendMessage(jid, { text: "🌙💜 *MEU VIP*\n\n👤 " + (info.expira === "inf" ? "INFINITO ♾️" : "expira em " + new Date(info.expira).toLocaleString("pt-BR")) }, { quoted: msg })
      }
    }

  }
}