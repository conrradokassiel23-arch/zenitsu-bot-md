/* ============================================================
   MENU VIP - ESTILO ADM
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

function nomeBotDb(db) { try { return db.config?.()?.nomeBot || "Rimuru" } catch { return "Rimuru" } }

function obanaiToken() {
  try {
    const apiCfg = dbLer("apiconfig.json", {})
    if (apiCfg.token) return apiCfg.token
  } catch (_) {}
  try { return require("../../config").obanaiToken || "rj8SpI" } catch (_) { return "rj8SpI" }
}

function obanaiBase() {
  try { return require("../../config").obanaiApiBase || "https://obanai-apis.eu.cc" } catch (_) { return "https://obanai-apis.eu.cc" }
}

/* ---------- RESPOSTAS PADRONIZADAS (ESTILO ADM) ---------- */
function msgSucesso(titulo, aviso, detalhes) {
  return `✨ *${titulo || "𝑺𝑼𝑪𝑬𝑺𝑺𝑶"}*\n\n✅ ${aviso}${detalhes ? `\n\n📌 ${detalhes}` : ""}`
}
function msgAviso(titulo, aviso, detalhes) {
  return `⚠️ *${titulo}*\n\n🔸 ${aviso}${detalhes ? `\n\n📌 ${detalhes}` : ""}`
}
function msgErro(titulo, aviso, detalhes) {
  return `❌ *${titulo}*\n\n🚫 ${aviso}${detalhes ? `\n\n📌 ${detalhes}` : ""}`
}

const cepCache = new Map()
const CEP_CACHE_TTL = 24 * 60 * 60 * 1000

async function buscarCep(cep) {
  if (cepCache.has(cep)) {
    const c = cepCache.get(cep)
    if (Date.now() - c.ts < CEP_CACHE_TTL) return c.data
    cepCache.delete(cep)
  }
  try {
    const r = await fetch(`${obanaiBase()}/api/outros/cep?cep=${cep}&apitoken=${obanaiToken()}`)
    const data = await r.json()
    if (data?.success && data?.data?.cep) {
      cepCache.set(cep, { data: data.data, ts: Date.now() })
      return data.data
    }
  } catch (_) {}
  try {
    const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    const v = await r.json()
    if (!v.erro) {
      const data = { cep: v.cep, logradouro: v.logradouro, complemento: v.complemento, bairro: v.bairro, localidade: v.localidade, uf: v.uf, estado: v.estado || "", regiao: v.regiao || "", ddd: v.ddd, ibge: v.ibge }
      cepCache.set(cep, { data, ts: Date.now() })
      return data
    }
  } catch (_) {}
  return null
}

async function baixarMusica(busca, qualidade = 64) {
  try {
    const apiRes = await fetch(`${obanaiBase()}/api/dl/play?q=${encodeURIComponent(busca)}&apitoken=${obanaiToken()}`)
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
        const p = prefixoAtivo || "+"
        const cfg = db.config() || {}
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)

        if (!checarVip(db, sJ, isDono, isSubDono)) {
          await reagir(sock, msg, "💨")
          return sock.sendMessage(jid, { text: msgErro("𝑺𝑶 𝑽𝑰𝑷", "Você não é um aliado nobre.", "O Grande Sábio não te reconhece.") }, { quoted: msg })
        }

        await reagir(sock, msg, "👑")

        const texto = `𝑴𝑬𝑵𝑼 𝑽𝑰𝑷

🤖 Bot: ${nomeBot}
⚡ Prefixo: ${p}
🟢 Status: Online

𝑴𝑼𝑺𝑰𝑪𝑨
${p}play <nome>
${p}spot <link>

𝑫𝑶𝑾𝑵𝑳𝑶𝑨𝑫𝑺
${p}insta <link>
${p}tiktok <link>
${p}pinterest <busca>

𝑵𝑶𝑻𝑰𝑪𝑰𝑨𝑺
${p}g1
${p}uol
${p}jovempan
${p}vasco

𝑼𝑻𝑰𝑳𝑰𝑫𝑨𝑫𝑬𝑺
${p}cep <8 dígitos>
${p}moedas [pares]
${p}conversor <val> <de> <para>
${p}qrcode <texto>
${p}printsite <url>
${p}feriados [ano]

𝑰𝑨 & 𝑰𝑴𝑨𝑮𝑬𝑵𝑺
${p}waifu
${p}upimage <desc>
${p}toprompt (reply img)
${p}axis <pergunta>

𝑭𝑰𝑮𝑼𝑹𝑰𝑵𝑯𝑨𝑺
${p}brat <txt>
${p}s
${p}rename <txt>
${p}s3

𝑨𝑼𝑻𝑶
${p}autofig on/off
${p}autottk on/off

> _Prefixo atual: ${p}_`

        if (cfg.fotoMenu) {
          let buf = null
          try {
            const limpo = String(cfg.fotoMenu).replace(/^data:[^;]+;base64,/, "")
            buf = Buffer.from(limpo, "base64")
          } catch { buf = null }
          if (buf && buf.length) {
            try {
              if (cfg.tipoMenu === "video") return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "menu.mp4", gifPlayback: true, caption: texto }, { quoted: msg })
              return sock.sendMessage(jid, { image: buf, caption: texto }, { quoted: msg })
            } catch (e) { return sock.sendMessage(jid, { text: texto }, { quoted: msg }) }
          }
        }
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    api: {
      aliases: ["setapi", "configapi"],
      donoOnly: true,
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        if (!isDono && !isSubDono) { await reagir(sock, msg, "💨"); return }
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const apiCfg = dbLer("apiconfig.json", {})

        if (!args.length) {
          await reagir(sock, msg, "🔑")
          return sock.sendMessage(jid, { text: msgAviso("𝑨𝑷𝑰", "Configuração atual", `Token: \`${apiCfg.token || "(padrão)"}\`\n\nUse \`${p}api <novo_token>\``) }, { quoted: msg })
        }

        const novoToken = args[0].trim()
        if (!novoToken) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑨𝑷𝑰", "Token inválido.", `Ex: \`${p}api rj8SpI\``) }, { quoted: msg }) }

        apiCfg.token = novoToken
        dbSalvar("apiconfig.json", apiCfg)
        await reagir(sock, msg, "🔑")
        await sock.sendMessage(jid, { text: msgSucesso("𝑨𝑷𝑰", "Token atualizado!", `Novo token: \`${apiCfg.token}\`\n\nTodos os comandos já usam o novo token.`) }, { quoted: msg })
      }
    },

    play: {
      aliases: ["tocar", "musica", "music"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑶 𝑽𝑰𝑷", "Música é privilégio dos nobres.", "—") }, { quoted: msg }) }
        const busca = args.join(" ").trim()
        if (!busca) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑷𝑳𝑨𝒀", "Me diga o que quer ouvir.", `Use \`${p}play <nome>\``) }, { quoted: msg }) }
        await reagir(sock, msg, "🎵")
        await sock.sendMessage(jid, { text: msgAviso("𝑩𝑼𝑺𝑪𝑨𝑵𝑫𝑶", "Procurando a música...", busca) }, { quoted: msg })
        const res = await baixarMusica(busca, 32)
        if (!res.ok) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha ao baixar.", res.erro) }, { quoted: msg }) }
        if (res.info && res.info.thumb) { try { await sock.sendMessage(jid, { image: { url: res.info.thumb }, caption: msgSucesso("𝑷𝑳𝑨𝒀", "Tocando agora", `${res.info.titulo || busca}\nCanal: ${res.info.canal || "?"}\nDuração: ${res.info.duracao || "?"}`) }, { quoted: msg }) } catch (_) {} }
        if (res.buffer.length > 16 * 1024 * 1024) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑴𝑼𝑰𝑻𝑶 𝑮𝑹𝑨𝑵𝑫𝑬", "Limite: 16MB", "—") }, { quoted: msg }) }
        await sock.sendMessage(jid, { audio: res.buffer, mimetype: "audio/mpeg", ptt: false, fileName: busca.slice(0, 30) + ".mp3" }, { quoted: msg })
      }
    },

    spot: {
      aliases: ["spotify", "musicaspot", "spotdl"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑶 𝑽𝑰𝑷", "Só nobres!", "—") }, { quoted: msg }) }
        const link = args[0]
        if (!link || !/open\.spotify\.com/i.test(link)) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑺𝑷𝑶𝑻", "Informe um link do Spotify.", `Use \`${p}spot <link>\``) }, { quoted: msg }) }
        await reagir(sock, msg, "🎧")
        await sock.sendMessage(jid, { text: msgAviso("𝑺𝑷𝑶𝑻𝑰𝑭𝒀", "Baixando...", link) }, { quoted: msg })
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
          if (buffer.length > 16 * 1024 * 1024) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑴𝑼𝑰𝑻𝑶 𝑮𝑹𝑨𝑵𝑫𝑬", "Limite: 16MB", "—") }, { quoted: msg }) }
          await sock.sendMessage(jid, { audio: buffer, mimetype: "audio/mpeg", ptt: false, fileName: trackInfo.title + ".mp3" }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha ao baixar.", e.message) }, { quoted: msg }) }
      }
    },

    pinterest: {
      aliases: ["pin"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑶 𝑽𝑰𝑷", "Só nobres!", "—") }, { quoted: msg }) }
        const busca = args.join(" ").trim()
        if (!busca) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑷𝑰𝑵𝑻𝑬𝑹𝑬𝑺𝑻", "Informe a busca.", `Use \`${p}pinterest <busca>\``) }, { quoted: msg }) }
        await reagir(sock, msg, "📌")
        await sock.sendMessage(jid, { text: msgAviso("𝑷𝑰𝑵𝑻𝑬𝑹𝑬𝑺𝑻", `Procurando "${busca}"...`, "—") }, { quoted: msg })
        try {
          const r = await fetch(`${obanaiBase()}/api/dl/pinterest?q=${encodeURIComponent(busca)}&apitoken=${obanaiToken()}`)
          const data = await r.json()
          if (!data.success || !data.data || !data.data.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑵𝑨𝑶 𝑬𝑵𝑪𝑶𝑵𝑻𝑹𝑬𝑰", "Nenhuma imagem.", busca) }, { quoted: msg }) }
          const items = data.data.slice(0, 5)
          for (const it of items) {
            try { await sock.sendMessage(jid, { image: { url: it.image }, caption: msgSucesso("𝑷𝑰𝑵𝑻𝑬𝑹𝑬𝑺𝑻", it.title || "Sem título", busca) }, { quoted: msg }); await new Promise(r2 => setTimeout(r2, 600)) } catch (_) {}
          }
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha.", e.message) }, { quoted: msg }) }
      }
    },

    insta: {
      aliases: ["instagram", "instadl", "ig"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑶 𝑽𝑰𝑷", "Só nobres!", "—") }, { quoted: msg }) }
        const link = args[0]
        if (!link || !/instagram\.com|instagr\.am/i.test(link)) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑰𝑵𝑺𝑻𝑨", "Informe um link.", `Use \`${p}insta <link>\``) }, { quoted: msg }) }
        await reagir(sock, msg, "📸")
        try {
          const res = await baixarInstagram(link)
          if (!res.ok) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha ao baixar.", res.erro) }, { quoted: msg }) }
          if (res.buffer.length > 16 * 1024 * 1024) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑴𝑼𝑰𝑻𝑶 𝑮𝑹𝑨𝑵𝑫𝑬", "Limite: 16MB", "—") }, { quoted: msg }) }
          if (res.ehVideo) await sock.sendMessage(jid, { video: res.buffer, mimetype: "video/mp4", fileName: "instagram.mp4" }, { quoted: msg })
          else await sock.sendMessage(jid, { image: res.buffer, caption: msgSucesso("𝑰𝑵𝑺𝑻𝑨𝑮𝑹𝑨𝑴", "Mídia baixada.", link) }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha.", e.message) }, { quoted: msg }) }
      }
    },

    tiktok: {
      aliases: ["tt", "ttk"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑶 𝑽𝑰𝑷", "Só nobres!", "—") }, { quoted: msg }) }
        const link = args[0]
        if (!link || !/tiktok\.com|vm\.tiktok|vt\.tiktok/i.test(link)) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑻𝑰𝑲𝑻𝑶𝑲", "Informe um link.", `Use \`${p}tiktok <link>\``) }, { quoted: msg }) }
        await reagir(sock, msg, "🎬")
        try {
          const url = await baixarTikTok(link)
          const r = await fetch(url)
          await sock.sendMessage(jid, { video: Buffer.from(await r.arrayBuffer()), mimetype: "video/mp4", fileName: "tiktok.mp4" }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha.", e.message) }, { quoted: msg }) }
      }
    },

    g1: {
      aliases: ["noticiag1"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        await reagir(sock, msg, "📰")
        try {
          const r = await fetch(`${obanaiBase()}/api/noticias/g1?apitoken=${obanaiToken()}`)
          const data = await r.json()
          if (!data?.status || !data.data?.resultado?.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑮𝟏", "Erro ao buscar.", "—") }, { quoted: msg }) }
          const n = data.data.resultado[Math.floor(Math.random() * data.data.resultado.length)]
          await sock.sendMessage(jid, { text: msgSucesso("𝑮𝟏", n.noticia, `Seção: ${n.secao}\nData: ${n.data}\n\n${n.desc}\n\nLink: ${n.link}`) }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝑮𝟏", "Falha.", e.message) }, { quoted: msg }) }
      }
    },

    uol: {
      aliases: ["noticiauol"],
      async executar({ sock, msg }) {
        const jid = msg.key.remoteJid
        await reagir(sock, msg, "📰")
        try {
          const r = await fetch(`${obanaiBase()}/api/noticias/uol?apitoken=${obanaiToken()}`)
          const data = await r.json()
          if (!data?.status || !data.data?.resultado?.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑼𝑶𝑳", "Erro.", "—") }, { quoted: msg }) }
          const n = data.data.resultado[Math.floor(Math.random() * data.data.resultado.length)]
          await sock.sendMessage(jid, { text: msgSucesso("𝑼𝑶𝑳", n.noticia, `Seção: ${n.secao}\n\n${n.desc}\n\nLink: ${n.link}`) }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝑼𝑶𝑳", "Falha.", e.message) }, { quoted: msg }) }
      }
    },

    jovempan: {
      aliases: ["jp", "noticiajp"],
      async executar({ sock, msg }) {
        const jid = msg.key.remoteJid
        await reagir(sock, msg, "📻")
        try {
          const r = await fetch(`${obanaiBase()}/api/noticias/jovempan?apitoken=${obanaiToken()}`)
          const data = await r.json()
          if (!data?.status || !data.data?.resultado?.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑱𝑶𝑽𝑬𝑴 𝑷𝑨𝑵", "Erro.", "—") }, { quoted: msg }) }
          const n = data.data.resultado[Math.floor(Math.random() * data.data.resultado.length)]
          await sock.sendMessage(jid, { text: msgSucesso("𝑱𝑶𝑽𝑬𝑴 𝑷𝑨𝑵", n.noticia, `Seção: ${n.secao}\nData: ${n.data}\n\n${n.desc}\n\nLink: ${n.link}`) }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝑱𝑶𝑽𝑬𝑴 𝑷𝑨𝑵", "Falha.", e.message) }, { quoted: msg }) }
      }
    },

    vasco: {
      aliases: ["noticiavasco", "vascao"],
      async executar({ sock, msg }) {
        const jid = msg.key.remoteJid
        await reagir(sock, msg, "⚽")
        try {
          const r = await fetch(`${obanaiBase()}/api/noticias/vasco?apitoken=${obanaiToken()}`)
          const data = await r.json()
          if (!data?.status || !data.data?.resultado?.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑽𝑨𝑺𝑪𝑶", "Erro.", "—") }, { quoted: msg }) }
          const n = data.data.resultado[Math.floor(Math.random() * data.data.resultado.length)]
          await sock.sendMessage(jid, { text: msgSucesso("𝑽𝑨𝑺𝑪𝑶", n.noticia, `${n.desc}\n\nLink: ${n.link}`) }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝑽𝑨𝑺𝑪𝑶", "Falha.", e.message) }, { quoted: msg }) }
      }
    },

    conversor: {
      aliases: ["converter"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑶 𝑽𝑰𝑷", "Só nobres!", "—") }, { quoted: msg }) }
        if (args.length < 3) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑪𝑶𝑵𝑽𝑬𝑹𝑺𝑶𝑹", "Use o comando corretamente.", `Ex: \`${p}conversor 10 km mi\``) }, { quoted: msg }) }
        const [valor, de, para] = args
        await reagir(sock, msg, "🔄")
        try {
          const r = await fetch(`${obanaiBase()}/api/outros/conversor?de=${encodeURIComponent(de)}&para=${encodeURIComponent(para)}&valor=${encodeURIComponent(valor)}&apitoken=${obanaiToken()}`)
          const data = await r.json()
          if (!data?.success) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑪𝑶𝑵𝑽𝑬𝑹𝑺𝑶𝑹", "Conversão inválida.", data?.message || "—") }, { quoted: msg }) }
          await sock.sendMessage(jid, { text: msgSucesso("𝑪𝑶𝑵𝑽𝑬𝑹𝑺𝑶𝑹", data.data.expressao, `Categoria: ${data.data.categoria}`) }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha.", e.message) }, { quoted: msg }) }
      }
    },

    qrcode: {
      aliases: ["qr"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑶 𝑽𝑰𝑷", "Só nobres!", "—") }, { quoted: msg }) }
        const q = args.join(" ").trim()
        if (!q) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑸𝑹𝑪𝑶𝑫𝑬", "Use o comando corretamente.", `Ex: \`${p}qrcode <texto>\``) }, { quoted: msg }) }
        await reagir(sock, msg, "📱")
        try {
          const r = await fetch(`${obanaiBase()}/api/tools/qrcode?texto=${encodeURIComponent(q)}&apitoken=${obanaiToken()}`)
          if (!r.ok) throw new Error("Falha ao gerar QR")
          const buffer = Buffer.from(await r.arrayBuffer())
          await sock.sendMessage(jid, { image: buffer, caption: msgSucesso("𝑸𝑹𝑪𝑶𝑫𝑬", "Gerado com sucesso!", q) }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha.", e.message) }, { quoted: msg }) }
      }
    },

    printsite: {
      aliases: ["ss", "print"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑶 𝑽𝑰𝑷", "Só nobres!", "—") }, { quoted: msg }) }
        const url = args[0]
        if (!url || !/^https?:\/\//.test(url)) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑷𝑹𝑰𝑵𝑻𝑺𝑰𝑻𝑬", "Informe a URL.", `Ex: \`${p}printsite https://google.com\``) }, { quoted: msg }) }
        await reagir(sock, msg, "🖥️")
        await sock.sendMessage(jid, { text: msgAviso("𝑷𝑹𝑰𝑵𝑻𝑨𝑵𝑫𝑶", "Tirando print...", url) }, { quoted: msg })
        try {
          const r = await fetch(`${obanaiBase()}/api/tools/printsite?url=${encodeURIComponent(url)}&apitoken=${obanaiToken()}`)
          if (!r.ok) throw new Error("Falha ao gerar print")
          const buffer = Buffer.from(await r.arrayBuffer())
          await sock.sendMessage(jid, { image: buffer, caption: msgSucesso("𝑷𝑹𝑰𝑵𝑻", url, "Screenshot gerado") }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha.", e.message) }, { quoted: msg }) }
      }
    },

    cep: {
      aliases: ["buscacep", "consultarcep"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑶 𝑽𝑰𝑷", "Só nobres!", "—") }, { quoted: msg }) }
        const cep = args.join("").replace(/\D/g, "")
        if (cep.length !== 8) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑪𝑬𝑷", "CEP inválido.", `Ex: \`${p}cep 01310930\``) }, { quoted: msg }) }
        await reagir(sock, msg, "📍")
        try {
          const d = await buscarCep(cep)
          if (!d) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑪𝑬𝑷", "CEP não encontrado.", cep) }, { quoted: msg }) }
          await sock.sendMessage(jid, { text: msgSucesso("𝑪𝑬𝑷", `${d.cep || cep}`, `Rua: ${d.logradouro || "—"}${d.complemento ? ` (${d.complemento})` : ""}\nBairro: ${d.bairro || "—"}\nCidade: ${d.localidade || "—"} - ${d.uf || "—"}\nEstado: ${d.estado || "—"} (${d.regiao || "—"})\nDDD: ${d.ddd || "—"}\nIBGE: ${d.ibge || "—"}`) }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha.", e.message) }, { quoted: msg }) }
      }
    },

    feriados: {
      aliases: ["feriado", "calendario"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑶 𝑽𝑰𝑷", "Só nobres!", "—") }, { quoted: msg }) }
        const ano = (args[0] && /^\d{4}$/.test(args[0].trim())) ? args[0].trim() : new Date().getFullYear()
        await reagir(sock, msg, "📅")
        try {
          const r = await fetch(`${obanaiBase()}/api/outros/feriados?ano=${ano}&apitoken=${obanaiToken()}`)
          const data = await r.json()
          if (!data?.success || !data.data?.total) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑭𝑬𝑹𝑰𝑨𝑫𝑶𝑺", "Nenhum feriado.", ano) }, { quoted: msg }) }
          let txt = `📅 *𝑭𝑬𝑹𝑰𝑨𝑫𝑶𝑺 ${data.data.ano}*\n\n`
          for (const f of data.data.feriados) txt += `• ${f.date} — ${f.name} (${f.weekday})\n`
          await sock.sendMessage(jid, { text: txt }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha.", e.message) }, { quoted: msg }) }
      }
    },

    moedas: {
      aliases: ["cotacao", "cambio"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑶 𝑽𝑰𝑷", "Só nobres!", "—") }, { quoted: msg }) }
        const pares = args.join("").trim().toUpperCase().replace(/\s+/g, "") || "USD-BRL,EUR-BRL,BTC-BRL"
        await reagir(sock, msg, "💱")
        try {
          const r = await fetch(`${obanaiBase()}/api/outros/moedas?pares=${encodeURIComponent(pares)}&apitoken=${obanaiToken()}`)
          const data = await r.json()
          if (!data?.success || !data.data?.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Par inválido.", pares) }, { quoted: msg }) }
          let txt = `💱 *𝑪𝑶𝑻𝑨𝑪̧𝑶̃𝑬𝑺*\n\n`
          for (const m of data.data) txt += `• *${m.nome}* — 💰 ${m.cotacao} | 📈 ${m.maximo} | 📉 ${m.minimo} | ${m.variacao_pct}%\n`
          await sock.sendMessage(jid, { text: txt }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha.", e.message) }, { quoted: msg }) }
      }
    },

    axis: {
      aliases: ["axiais"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑶 𝑽𝑰𝑷", "Só nobres!", "—") }, { quoted: msg }) }
        const pergunta = args.join(" ").trim()
        if (!pergunta) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑨𝑿𝑰𝑺", "Informe a pergunta.", `Ex: \`${p}axis o que é um slime?\``) }, { quoted: msg }) }
        await reagir(sock, msg, "🧠")
        try {
          await sock.sendPresenceUpdate("composing", jid)
          await sock.sendMessage(jid, { text: msgAviso("𝑨𝑿𝑰𝑺", "Consultando o Grande Sábio...", pergunta) }, { quoted: msg })
          const r = await fetch(`${obanaiBase()}/api/ias/axis?q=${encodeURIComponent(pergunta)}&apitoken=${obanaiToken()}`)
          const data = await r.json()
          if (!data?.success) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "IA indisponível.", "—") }, { quoted: msg }) }
          await sock.sendMessage(jid, { text: data.data.texto }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha.", e.message) }, { quoted: msg }) }
      }
    },

    waifu: {
      aliases: ["waifus", "anime"],
      async executar({ sock, msg, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑶 𝑽𝑰𝑷", "Só nobres!", "—") }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        try {
          const images = []
          for (let i = 0; i < 5; i++) {
            try {
              const r = await fetch("https://nekos.best/api/v2/waifu")
              const data = await r.json()
              if (data?.results?.[0]?.url) images.push(data.results[0].url)
              await new Promise(res => setTimeout(res, 300))
            } catch (_) {}
          }
          if (!images.length) { for (let i = 0; i < 5; i++) images.push(`https://picsum.photos/id/${100 + i}/400/400`) }
          await sock.sendMessage(jid, { text: msgAviso("𝑾𝑨𝑰𝑭𝑼", "5 imagens aleatórias", "A serpente aprecia a beleza.") }, { quoted: msg })
          for (const url of images) {
            try { await sock.sendMessage(jid, { image: { url }, caption: msgSucesso("𝑾𝑨𝑰𝑭𝑼", "Waifu do dia", "—") }, { quoted: msg }); await new Promise(res => setTimeout(res, 500)) } catch (_) {}
          }
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha.", e.message) }, { quoted: msg }) }
      }
    },

    upimage: {
      aliases: ["upimagem", "gerarimg"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑶 𝑽𝑰𝑷", "Só nobres!", "—") }, { quoted: msg }) }
        const q = args.join(" ").trim()
        if (!q) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑼𝑷𝑰𝑴𝑨𝑮𝑬", "Informe a descrição.", `Ex: \`${p}upimage um gato no espaço\``) }, { quoted: msg }) }
        await reagir(sock, msg, "🎨")
        try {
          await sock.sendMessage(jid, { text: msgAviso("𝑮𝑬𝑹𝑨𝑵𝑫𝑶", "Criando imagem...", q) }, { quoted: msg })
          const r = await fetch(`${obanaiBase()}/api/ias/upimage?q=${encodeURIComponent(q)}&apitoken=${obanaiToken()}`)
          const data = await r.json()
          if (!data?.success || !data?.image_url) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Não foi possível gerar.", q) }, { quoted: msg }) }
          await sock.sendMessage(jid, { image: { url: data.image_url }, caption: msgSucesso("𝑼𝑷𝑰𝑴𝑨𝑮𝑬", "Imagem gerada!", q) }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha.", e.message) }, { quoted: msg }) }
      }
    },

    toprompt: {
      aliases: ["prompt", "img2prompt"],
      async executar({ sock, msg, db, utils, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑶 𝑽𝑰𝑷", "Só nobres!", "—") }, { quoted: msg }) }
        const ctx = msg.message?.extendedTextMessage?.contextInfo || {}
        const qm = ctx.quotedMessage
        if (!qm || !qm.imageMessage) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑻𝑶𝑷𝑹𝑶𝑴𝑷𝑻", "Responda uma imagem.", `Use \`${prefixoAtivo || "+"}toprompt\``) }, { quoted: msg }) }
        await reagir(sock, msg, "🖼️")
        try {
          const alvoMsg = Object.assign({}, msg, { message: { imageMessage: qm.imageMessage } })
          const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          const r = await fetch(`${obanaiBase()}/api/ias/toprompt?url=${encodeURIComponent("data:image/jpeg;base64," + buffer.toString("base64"))}&apitoken=${obanaiToken()}`)
          const data = await r.json()
          if (!data?.status || !data.data?.prompt) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Não foi possível gerar o prompt.", "—") }, { quoted: msg }) }
          await sock.sendMessage(jid, { text: msgSucesso("𝑷𝑹𝑶𝑴𝑷𝑻", "Prompt gerado!", data.data.prompt) }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha.", e.message) }, { quoted: msg }) }
      }
    },

    brat: {
      aliases: ["figbrat"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑶 𝑽𝑰𝑷", "Só nobres!", "—") }, { quoted: msg }) }
        const t = args.join(" ").trim()
        if (!t) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑩𝑹𝑨𝑻", "Informe o texto.", `Ex: \`${p}brat <txt>\``) }, { quoted: msg }) }
        await reagir(sock, msg, "🖤")
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
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha.", e.message) }, { quoted: msg }) }
      }
    },

    s: {
      aliases: ["sticker", "fig"],
      async executar({ sock, msg, db, isDono, isSubDono, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑶 𝑽𝑰𝑷", "Só nobres!", "—") }, { quoted: msg }) }
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const q = ctx.quotedMessage
        const eImg = q && q.imageMessage; const eVid = q && q.videoMessage
        if (!eImg && !eVid) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑺", "Responda foto ou vídeo.", `Use \`${prefixoAtivo || "+"}s\` (reply)`) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        try {
          const sharp = require("sharp"); const ff = require("@ffmpeg-installer/ffmpeg").path
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
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha.", e.message) }, { quoted: msg }) }
      }
    },

    s3: {
      aliases: ["esticar", "stretch", "gordo"],
      async executar({ sock, msg, db, isDono, isSubDono, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑶 𝑽𝑰𝑷", "Só nobres!", "—") }, { quoted: msg }) }
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const q = ctx.quotedMessage
        const eSti = q && q.stickerMessage; const eImg = q && q.imageMessage; const eVid = q && q.videoMessage
        if (!eSti && !eImg && !eVid) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑺𝟑", "Responda fig, foto ou vídeo.", `Use \`${prefixoAtivo || "+"}s3\` (reply)`) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        try {
          const sharp = require("sharp"); const ff = require("@ffmpeg-installer/ffmpeg").path
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
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha.", e.message) }, { quoted: msg }) }
      }
    },

    rename: {
      aliases: ["renomear", "nomefig", "setnome"],
      async executar({ sock, msg, args, db, isDono, isSubDono, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑶 𝑽𝑰𝑷", "Só nobres!", "—") }, { quoted: msg }) }
        const t = args.join(" ").trim()
        if (!t) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑹𝑬𝑵𝑨𝑴𝑬", "Informe o nome.", `Ex: \`${p}rename <txt>\` (reply)`) }, { quoted: msg }) }
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const q = ctx.quotedMessage
        if (!q || !q.stickerMessage) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑹𝑬𝑵𝑨𝑴𝑬", "Responda uma figurinha.", "—") }, { quoted: msg }) }
        await reagir(sock, msg, "✏️")
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
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha.", e.message) }, { quoted: msg }) }
      }
    },

    autofig: {
      aliases: ["autosticker", "autofigu"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑶 𝑽𝑰𝑷", "Só nobres!", "—") }, { quoted: msg }) }
        if (!jid.endsWith("@g.us")) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑨𝑼𝑻𝑶𝑭𝑰𝑮", "Só em grupos.", "—") }, { quoted: msg }) }
        const op = (args[0] || "").toLowerCase()
        const ac = dbLer("autocfg.json", { grupos: {} })
        ac.grupos = ac.grupos || {}; ac.grupos[jid] = ac.grupos[jid] || {}
        if (!["on", "off"].includes(op)) {
          const s = ac.grupos[jid].autofig ? "ON ✅" : "OFF ❌"
          await reagir(sock, msg, "⚙️")
          return sock.sendMessage(jid, { text: msgAviso("𝑨𝑼𝑻𝑶𝑭𝑰𝑮", `Status: ${s}`, `Use \`${p}autofig on/off\``) }, { quoted: msg })
        }
        ac.grupos[jid].autofig = op === "on"
        dbSalvar("autocfg.json", ac)
        await reagir(sock, msg, "⚙️")
        await sock.sendMessage(jid, { text: msgSucesso("𝑨𝑼𝑻𝑶𝑭𝑰𝑮", op.toUpperCase(), op === "on" ? "Figurinhas automáticas ativadas." : "Desativadas.") }, { quoted: msg })
      }
    },

    autottk: {
      aliases: ["autotiktok", "autott"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑶 𝑽𝑰𝑷", "Só nobres!", "—") }, { quoted: msg }) }
        if (!jid.endsWith("@g.us")) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑨𝑼𝑻𝑶𝑻𝑻𝑲", "Só em grupos.", "—") }, { quoted: msg }) }
        const op = (args[0] || "").toLowerCase()
        const ac = dbLer("autocfg.json", { grupos: {} })
        ac.grupos = ac.grupos || {}; ac.grupos[jid] = ac.grupos[jid] || {}
        if (!["on", "off"].includes(op)) {
          const s = ac.grupos[jid].autottk ? "ON ✅" : "OFF ❌"
          await reagir(sock, msg, "⚙️")
          return sock.sendMessage(jid, { text: msgAviso("𝑨𝑼𝑻𝑶𝑻𝑻𝑲", `Status: ${s}`, `Use \`${p}autottk on/off\``) }, { quoted: msg })
        }
        ac.grupos[jid].autottk = op === "on"
        dbSalvar("autocfg.json", ac)
        await reagir(sock, msg, "⚙️")
        await sock.sendMessage(jid, { text: msgSucesso("𝑨𝑼𝑻𝑶𝑻𝑻𝑲", op.toUpperCase(), op === "on" ? "Auto TikTok ativado." : "Desativado.") }, { quoted: msg })
      }
    },

    meuvip: {
      aliases: ["vipinfo"],
      async executar({ sock, msg, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        const vips = (db.vips() || {}).vips || {}
        let info = null
        for (const j of sJ) {
          const num = String(j).split("@")[0].split(":")[0].replace(/\D/g, "")
          for (const [jV, i] of Object.entries(vips)) { if (String(jV).split("@")[0].split(":")[0].replace(/\D/g, "") === num) { if (i.expira === "inf" || i.expira > Date.now()) { info = i; break } } }
          if (info) break
        }
        if (isDono || isSubDono) { await reagir(sock, msg, "👑"); return sock.sendMessage(jid, { text: msgSucesso("𝑴𝑬𝑼 𝑽𝑰𝑷", "Você é o mestre.", `Cargo: ${isDono ? "GRANDE SÁBIO" : "LUA SUPERIOR"}`) }, { quoted: msg }) }
        if (!info) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝑴𝑬𝑼 𝑽𝑰𝑷", "Você não é nobre.", "—") }, { quoted: msg }) }
        await reagir(sock, msg, "👑")
        await sock.sendMessage(jid, { text: msgSucesso("𝑴𝑬𝑼 𝑽𝑰𝑷", "Status VIP", `Expira: ${info.expira === "inf" ? "INFINITO ♾️" : new Date(info.expira).toLocaleString("pt-BR")}`) }, { quoted: msg })
      }
    }

  }
}