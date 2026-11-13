/* ============================================================
   🌸 MENU VIP - TEMA FLORAL
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

/* ---------- TEMPLATES FLORAIS ---------- */
function boxTop(titulo) {
  return `╔═══ஓ๑♡๑ஓ═══╗
𓆩 ${titulo} 𓆪
╚═══ஓ๑♡๑ஓ═══╝`
}
function boxFim(nomeBot, frase = "Concluído com sucesso.") {
  return `╔═══ஓ๑♡๑ஓ═══╗
𓆩 ${String(nomeBot).toUpperCase()} 𓆪
❝ ${frase} ❞
╚═══ஓ๑♡๑ஓ═══╝`
}
function msgSucesso(titulo, aviso, detalhes, rodape, nomeBot) {
  return `${boxTop(titulo)}

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐒𝐓𝐀𝐓𝐔𝐒 𓆪
↳ ${aviso}
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐃𝐄𝐓𝐀𝐋𝐇𝐄𝐒 𓆪
↳ ${detalhes}
╰┈┈┈┈୨୧┈┈┈┈╯

${rodape ? `╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐍𝐎𝐓𝐀 𓆪
↳ ${rodape}
╰┈┈┈┈୨୧┈┈┈┈╯

` : ""}${boxFim(nomeBot, "Concluído com sucesso.")}`
}
function msgAviso(titulo, aviso, detalhes, rodape, nomeBot) {
  return `${boxTop(titulo)}

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐀𝐕𝐈𝐒𝐎 𓆪
↳ ${aviso}
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐃𝐄𝐓𝐀𝐋𝐇𝐄𝐒 𓆪
↳ ${detalhes}
╰┈┈┈┈୨୧┈┈┈┈╯

${rodape ? `╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐍𝐎𝐓𝐀 𓆪
↳ ${rodape}
╰┈┈┈┈୨୧┈┈┈┈╯

` : ""}${boxFim(nomeBot, "Verifique e tente novamente.")}`
}
function msgErro(titulo, aviso, detalhes, rodape, nomeBot) {
  return `${boxTop(titulo)}

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐄𝐑𝐑𝐎 𓆪
↳ ${aviso}
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐃𝐄𝐓𝐀𝐋𝐇𝐄𝐒 𓆪
↳ ${detalhes}
╰┈┈┈┈୨୧┈┈┈┈╯

${rodape ? `╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐍𝐎𝐓𝐀 𓆪
↳ ${rodape}
╰┈┈┈┈୨୧┈┈┈┈╯

` : ""}${boxFim(nomeBot, "Algo deu errado.")}`
}
function secao(t) { return `╭┈┈┈┈୨୧┈┈┈┈╮\n𓆩 ${t} 𓆪` }
function item(c) { return `↳ \`${c}\`` }
function fimSecao() { return `╰┈┈┈┈୨୧┈┈┈┈╯` }

function cabecalhoMenu(nomeBot, p) {
  return `${boxTop("𝐌 𝐄 𝐍 𝐔   𝐕 𝐈 𝐏")}

┏━━━〔 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 〕━━━┓
𖤐 Bot » ${nomeBot}
𖤐 Prefixo » ${p}
𖤐 Status » 𝐎𝐍𝐋𝐈𝐍𝐄
┗━━━━━━━━━━━━━━━━━━┛`
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
  } catch (e) {
    try { await sock.sendMessage(jid, { text: "🌸💢 " + e.message }, { quoted }) } catch (_) {}
  }
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

  commands: {    menuvip: {
      aliases: ["vipmenu", "menuv"],
      async executar({ sock, msg, prefixoAtivo, db, sender, config, isDono, isSubDono, isAdmin }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const cfg = db.config() || {}
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)

        if (!checarVip(db, sJ, isDono, isSubDono)) {
          await reagir(sock, msg, "💨")
          return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Você não é um aliado nobre.", "O Grande Sábio não te reconhece.", null, nomeBot) }, { quoted: msg })
        }

        await reagir(sock, msg, "🌸")

        const texto = `${cabecalhoMenu(nomeBot, p)}

${secao("𝐌𝐔́𝐒𝐈𝐂𝐀")}
${item(`${p}play <nome>`)}
${item(`${p}spot <link>`)}
${item(`${p}soundcloud <nome>`)}
${fimSecao()}

${secao("𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐒")}
${item(`${p}insta <link>`)}
${item(`${p}tiktok <link>`)}
${item(`${p}pinterest <busca>`)}
${fimSecao()}

${secao("𝐍𝐎𝐓𝐈́𝐂𝐈𝐀𝐒")}
${item(`${p}g1`)}
${item(`${p}uol`)}
${item(`${p}jovempan`)}
${item(`${p}vasco`)}
${fimSecao()}

${secao("𝐄𝐒𝐓𝐀𝐓𝐈́𝐒𝐓𝐈𝐂𝐀𝐒")}
${item(`${p}tiktoktag <hashtag>`)}
${fimSecao()}

${secao("𝐔𝐓𝐈𝐋𝐈𝐃𝐀𝐃𝐄𝐒")}
${item(`${p}cep <8 dígitos>`)}
${item(`${p}moedas [pares]`)}
${item(`${p}conversor <val> <de> <para>`)}
${item(`${p}qrcode <texto>`)}
${item(`${p}printsite <url>`)}
${item(`${p}feriados [ano]`)}
${fimSecao()}

${secao("𝐈𝐀 & 𝐈𝐌𝐀𝐆𝐄𝐍𝐒")}
${item(`${p}waifu`)}
${item(`${p}upimage <desc>`)}
${item(`${p}deepimage <desc>`)}
${item(`${p}toprompt (reply img)`)}
${item(`${p}axis <pergunta>`)}
${item(`${p}unliai <pergunta>`)}
${item(`${p}gerarnick <txt>`)}
${fimSecao()}

${secao("𝐅𝐈𝐆𝐔𝐑𝐈𝐍𝐇𝐀𝐒")}
${item(`${p}brat <txt>`)}
${item(`${p}s`)}
${item(`${p}rename <txt>`)}
${item(`${p}smeme <txt>`)}
${item(`${p}s3`)}
${item(`${p}procurado`)}
${item(`${p}wasted`)}
${item(`${p}revela`)}
${fimSecao()}

${secao("𝐀𝐔𝐓𝐎")}
${item(`${p}autofig on/off`)}
${item(`${p}autottk on/off`)}
${fimSecao()}

${isDono || isSubDono ? `${secao("𝐀𝐃𝐌𝐈𝐍")}
${item(`${p}api <token>`)}
${fimSecao()}

` : ""}╔═══ஓ๑♡๑ஓ═══╗
𓆩 𝐏𝐑𝐄𝐅𝐈𝐗𝐎 𓆪
↳ \`${p}\`
╚═══ஓ๑♡๑ஓ═══╝

${boxFim(nomeBot, "Não desvie o olhar.")}`

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
        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const apiCfg = dbLer("apiconfig.json", {})

        if (!args.length) {
          await reagir(sock, msg, "🌸")
          return sock.sendMessage(jid, { text: msgAviso(
            "𝐀𝐏𝐈",
            "Configuração atual",
            `Token: \`${apiCfg.token || "(padrão)"}\``,
            `Use: \`${p}api <novo_token>\``,
            nomeBot
          ) }, { quoted: msg })
        }

        const novoToken = args[0].trim()
        if (!novoToken) {
          await reagir(sock, msg, "💨")
          return sock.sendMessage(jid, { text: msgErro("𝐀𝐏𝐈", "Token inválido.", `Ex: \`${p}api rj8SpI\``, null, nomeBot) }, { quoted: msg })
        }

        apiCfg.token = novoToken
        dbSalvar("apiconfig.json", apiCfg)

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso(
          "𝐀𝐏𝐈",
          "Token atualizado!",
          `Novo token: \`${apiCfg.token}\``,
          "Todos os comandos já usam o novo token.",
          nomeBot
        ) }, { quoted: msg })
      }
    },

    play: {
      aliases: ["tocar", "musica", "music"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Música é privilégio dos nobres.", "—", null, nomeBot) }, { quoted: msg }) }
        const busca = args.join(" ").trim()
        if (!busca) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐏𝐋𝐀𝐘", "Me diga o que quer ouvir.", `Use \`${p}play <nome>\``, null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgAviso("𝐁𝐔𝐒𝐂𝐀𝐍𝐃𝐎", "Procurando a música...", busca, null, nomeBot) }, { quoted: msg })
        const res = await baixarMusica(busca, 32)
        if (!res.ok) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha ao baixar.", res.erro, null, nomeBot) }, { quoted: msg }) }
        if (res.info && res.info.thumb) { try { await sock.sendMessage(jid, { image: { url: res.info.thumb }, caption: msgSucesso("𝐏𝐋𝐀𝐘", "Tocando agora", `${res.info.titulo || busca}\nCanal: ${res.info.canal || "?"}\nDuração: ${res.info.duracao || "?"}`, null, nomeBot) }, { quoted: msg }) } catch (_) {} }
        if (res.buffer.length > 16 * 1024 * 1024) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐌𝐔𝐈𝐓𝐎 𝐆𝐑𝐀𝐍𝐃𝐄", "Limite: 16MB", "—", null, nomeBot) }, { quoted: msg }) }
        await sock.sendMessage(jid, { audio: res.buffer, mimetype: "audio/mpeg", ptt: false, fileName: busca.slice(0, 30) + ".mp3" }, { quoted: msg })
      }
    },

    spot: {
      aliases: ["spotify", "musicaspot", "spotdl"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Só nobres!", "—", null, nomeBot) }, { quoted: msg }) }
        const link = args[0]
        if (!link || !/open\.spotify\.com/i.test(link)) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐒𝐏𝐎𝐓", "Informe um link do Spotify.", `Use \`${p}spot <link>\``, null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgAviso("𝐒𝐏𝐎𝐓𝐈𝐅𝐘", "Baixando...", link, null, nomeBot) }, { quoted: msg })
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
          if (buffer.length > 16 * 1024 * 1024) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐌𝐔𝐈𝐓𝐎 𝐆𝐑𝐀𝐍𝐃𝐄", "Limite: 16MB", "—", null, nomeBot) }, { quoted: msg }) }
          await sock.sendMessage(jid, { audio: buffer, mimetype: "audio/mpeg", ptt: false, fileName: trackInfo.title + ".mp3" }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha ao baixar.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    soundcloud: {
      aliases: ["sc"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Só nobres!", "—", null, nomeBot) }, { quoted: msg }) }
        const busca = args.join(" ").trim()
        if (!busca) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐒𝐎𝐔𝐍𝐃𝐂𝐋𝐎𝐔𝐃", "Informe a música.", `Use \`${p}soundcloud <nome>\``, null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgAviso("𝐒𝐎𝐔𝐍𝐃𝐂𝐋𝐎𝐔𝐃", "Procurando...", busca, null, nomeBot) }, { quoted: msg })
        try {
          const sR = await fetch(`${obanaiBase()}/api/search/soundcloud?q=${encodeURIComponent(busca)}&apitoken=${obanaiToken()}`)
          const sD = await sR.json()
          if (!sD.success || !sD.data?.data?.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐄𝐈", "Nada encontrado.", busca, null, nomeBot) }, { quoted: msg }) }
          const m = sD.data.data[0]
          const segs = parseInt(m.duration)
          const durFmt = `${Math.floor(segs / 60)}:${(segs % 60).toString().padStart(2, "0")}`
          await sock.sendMessage(jid, { image: { url: m.thumbnail }, caption: msgSucesso("𝐒𝐎𝐔𝐍𝐃𝐂𝐋𝐎𝐔𝐃", m.title, `Artista: ${m.artist}\nDuração: ${durFmt}`, null, nomeBot) }, { quoted: msg })
          const dlR = await fetch(`${obanaiBase()}/api/dl/soundcloud?url=${encodeURIComponent(m.url)}&apitoken=${obanaiToken()}`)
          const dlD = await dlR.json()
          if (!dlD.success || !dlD.data?.download_url) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha ao baixar.", "—", null, nomeBot) }, { quoted: msg }) }
          const aR = await fetch(dlD.data.download_url)
          const aBuf = Buffer.from(await aR.arrayBuffer())
          if (aBuf.length > 16 * 1024 * 1024) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐌𝐔𝐈𝐓𝐎 𝐆𝐑𝐀𝐍𝐃𝐄", "Limite: 16MB", "—", null, nomeBot) }, { quoted: msg }) }
          await sock.sendMessage(jid, { audio: aBuf, mimetype: "audio/mpeg", ptt: false }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    pinterest: {
      aliases: ["pin"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Só nobres!", "—", null, nomeBot) }, { quoted: msg }) }
        const busca = args.join(" ").trim()
        if (!busca) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐏𝐈𝐍𝐓𝐄𝐑𝐄𝐒𝐓", "Informe a busca.", `Use \`${p}pinterest <busca>\``, null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgAviso("𝐏𝐈𝐍𝐓𝐄𝐑𝐄𝐒𝐓", `Procurando "${busca}"...`, "—", null, nomeBot) }, { quoted: msg })
        try {
          const r = await fetch(`${obanaiBase()}/api/dl/pinterest?q=${encodeURIComponent(busca)}&apitoken=${obanaiToken()}`)
          const data = await r.json()
          if (!data.success || !data.data || !data.data.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐄𝐈", "Nenhuma imagem.", busca, null, nomeBot) }, { quoted: msg }) }
          const items = data.data.slice(0, 5)
          for (const it of items) {
            try { await sock.sendMessage(jid, { image: { url: it.image }, caption: msgSucesso("𝐏𝐈𝐍𝐓𝐄𝐑𝐄𝐒𝐓", it.title || "Sem título", busca, null, nomeBot) }, { quoted: msg }); await new Promise(r2 => setTimeout(r2, 600)) } catch (_) {}
          }
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    insta: {
      aliases: ["instagram", "instadl", "ig"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Só nobres!", "—", null, nomeBot) }, { quoted: msg }) }
        const link = args[0]
        if (!link || !/instagram\.com|instagr\.am/i.test(link)) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐈𝐍𝐒𝐓𝐀", "Informe um link.", `Use \`${p}insta <link>\``, null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        try {
          const res = await baixarInstagram(link)
          if (!res.ok) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha ao baixar.", res.erro, null, nomeBot) }, { quoted: msg }) }
          if (res.buffer.length > 16 * 1024 * 1024) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐌𝐔𝐈𝐓𝐎 𝐆𝐑𝐀𝐍𝐃𝐄", "Limite: 16MB", "—", null, nomeBot) }, { quoted: msg }) }
          if (res.ehVideo) await sock.sendMessage(jid, { video: res.buffer, mimetype: "video/mp4", fileName: "instagram.mp4" }, { quoted: msg })
          else await sock.sendMessage(jid, { image: res.buffer, caption: msgSucesso("𝐈𝐍𝐒𝐓𝐀𝐆𝐑𝐀𝐌", "Mídia baixada.", link, null, nomeBot) }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    tiktok: {
      aliases: ["tt", "ttk"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Só nobres!", "—", null, nomeBot) }, { quoted: msg }) }
        const link = args[0]
        if (!link || !/tiktok\.com|vm\.tiktok|vt\.tiktok/i.test(link)) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐓𝐈𝐊𝐓𝐎𝐊", "Informe um link.", `Use \`${p}tiktok <link>\``, null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        try {
          const url = await baixarTikTok(link)
          const r = await fetch(url)
          await sock.sendMessage(jid, { video: Buffer.from(await r.arrayBuffer()), mimetype: "video/mp4", fileName: "tiktok.mp4" }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    g1: {
      aliases: ["noticiag1"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        await reagir(sock, msg, "🌸")
        try {
          const r = await fetch(`${obanaiBase()}/api/noticias/g1?apitoken=${obanaiToken()}`)
          const data = await r.json()
          if (!data?.status || !data.data?.resultado?.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐆𝟏", "Erro ao buscar.", "—", null, nomeBot) }, { quoted: msg }) }
          const n = data.data.resultado[Math.floor(Math.random() * data.data.resultado.length)]
          await sock.sendMessage(jid, { text: msgSucesso("𝐆𝟏", n.noticia, `Seção: ${n.secao}\nData: ${n.data}\n\n${n.desc}\n\nLink: ${n.link}`, null, nomeBot) }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐆𝟏", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    uol: {
      aliases: ["noticiauol"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        await reagir(sock, msg, "🌸")
        try {
          const r = await fetch(`${obanaiBase()}/api/noticias/uol?apitoken=${obanaiToken()}`)
          const data = await r.json()
          if (!data?.status || !data.data?.resultado?.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐔𝐎𝐋", "Erro.", "—", null, nomeBot) }, { quoted: msg }) }
          const n = data.data.resultado[Math.floor(Math.random() * data.data.resultado.length)]
          await sock.sendMessage(jid, { text: msgSucesso("𝐔𝐎𝐋", n.noticia, `Seção: ${n.secao}\n\n${n.desc}\n\nLink: ${n.link}`, null, nomeBot) }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐔𝐎𝐋", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    jovempan: {
      aliases: ["jp", "noticiajp"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        await reagir(sock, msg, "🌸")
        try {
          const r = await fetch(`${obanaiBase()}/api/noticias/jovempan?apitoken=${obanaiToken()}`)
          const data = await r.json()
          if (!data?.status || !data.data?.resultado?.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐉𝐎𝐕𝐄𝐌 𝐏𝐀𝐍", "Erro.", "—", null, nomeBot) }, { quoted: msg }) }
          const n = data.data.resultado[Math.floor(Math.random() * data.data.resultado.length)]
          await sock.sendMessage(jid, { text: msgSucesso("𝐉𝐎𝐕𝐄𝐌 𝐏𝐀𝐍", n.noticia, `Seção: ${n.secao}\nData: ${n.data}\n\n${n.desc}\n\nLink: ${n.link}`, null, nomeBot) }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐉𝐎𝐕𝐄𝐌 𝐏𝐀𝐍", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    vasco: {
      aliases: ["noticiavasco", "vascao"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        await reagir(sock, msg, "🌸")
        try {
          const r = await fetch(`${obanaiBase()}/api/noticias/vasco?apitoken=${obanaiToken()}`)
          const data = await r.json()
          if (!data?.status || !data.data?.resultado?.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐕𝐀𝐒𝐂𝐎", "Erro.", "—", null, nomeBot) }, { quoted: msg }) }
          const n = data.data.resultado[Math.floor(Math.random() * data.data.resultado.length)]
          await sock.sendMessage(jid, { text: msgSucesso("𝐕𝐀𝐒𝐂𝐎", n.noticia, `${n.desc}\n\nLink: ${n.link}`, null, nomeBot) }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐕𝐀𝐒𝐂𝐎", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    tiktoktag: {
      aliases: ["hashtag", "tttag"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Só nobres!", "—", null, nomeBot) }, { quoted: msg }) }
        const busca = args.join(" ").trim()
        if (!busca) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐓𝐈𝐊𝐓𝐎𝐊 𝐓𝐀𝐆", "Informe a hashtag.", `Use \`${p}tiktoktag <tag>\``, null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgAviso("𝐓𝐈𝐊𝐓𝐎𝐊 𝐓𝐀𝐆", `Analisando #${busca}...`, "—", null, nomeBot) }, { quoted: msg })
        try {
          const r = await fetch(`${obanaiBase()}/api/search/tiktok-tag?q=${encodeURIComponent(busca)}&apitoken=${obanaiToken()}`, { headers: { "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36" } })
          const data = await r.json()
          if (!data.success) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Não consegui obter estatísticas.", busca, null, nomeBot) }, { quoted: msg }) }
          const res = data.data
          let txt = `${boxTop(`𝐓𝐈𝐊𝐓𝐎𝐊 #${busca}`)}

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐄𝐒𝐓𝐀𝐓𝐈́𝐒𝐓𝐈𝐂𝐀𝐒 𓆪
↳ Posts: ${res.posts || "N/A"}
↳ Views: ${res.views || "N/A"}
↳ Views/post: ${res.viewsPerPost || "N/A"}
↳ Hashtags: ${res.mostPopular || "N/A"}
╰┈┈┈┈୨୧┈┈┈┈╯

`
          if (res.trending && res.trending.length > 0) {
            txt += `${secao("𝐓𝐑𝐄𝐍𝐃𝐈𝐍𝐆")}\n`
            for (const tag of res.trending.slice(0, 10)) txt += `↳ #${tag.hashtag} — ${tag.posts}\n`
            txt += `${fimSecao()}\n`
          }
          txt += `\n${boxFim(nomeBot, "Análise completa.")}`
          await sock.sendMessage(jid, { text: txt }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },    conversor: {
      aliases: ["converter"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Só nobres!", "—", null, nomeBot) }, { quoted: msg }) }
        if (args.length < 3) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐂𝐎𝐍𝐕𝐄𝐑𝐒𝐎𝐑", "Use o comando corretamente.", `Ex: \`${p}conversor 10 km mi\``, null, nomeBot) }, { quoted: msg }) }
        const [valor, de, para] = args
        await reagir(sock, msg, "🌸")
        try {
          const r = await fetch(`${obanaiBase()}/api/outros/conversor?de=${encodeURIComponent(de)}&para=${encodeURIComponent(para)}&valor=${encodeURIComponent(valor)}&apitoken=${obanaiToken()}`)
          const data = await r.json()
          if (!data?.success) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐂𝐎𝐍𝐕𝐄𝐑𝐒𝐎𝐑", "Conversão inválida.", data?.message || "—", null, nomeBot) }, { quoted: msg }) }
          await sock.sendMessage(jid, { text: msgSucesso("𝐂𝐎𝐍𝐕𝐄𝐑𝐒𝐎𝐑", data.data.expressao, `Categoria: ${data.data.categoria}`, null, nomeBot) }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    qrcode: {
      aliases: ["qr"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Só nobres!", "—", null, nomeBot) }, { quoted: msg }) }
        const q = args.join(" ").trim()
        if (!q) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐐𝐑𝐂𝐎𝐃𝐄", "Use o comando corretamente.", `Ex: \`${p}qrcode <texto>\``, null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        try {
          const r = await fetch(`${obanaiBase()}/api/tools/qrcode?texto=${encodeURIComponent(q)}&apitoken=${obanaiToken()}`)
          if (!r.ok) throw new Error("Falha ao gerar QR")
          const buffer = Buffer.from(await r.arrayBuffer())
          await sock.sendMessage(jid, { image: buffer, caption: msgSucesso("𝐐𝐑𝐂𝐎𝐃𝐄", "Gerado com sucesso!", q, null, nomeBot) }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    printsite: {
      aliases: ["ss", "print"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Só nobres!", "—", null, nomeBot) }, { quoted: msg }) }
        const url = args[0]
        if (!url || !/^https?:\/\//.test(url)) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐏𝐑𝐈𝐍𝐓𝐒𝐈𝐓𝐄", "Informe a URL.", `Ex: \`${p}printsite https://google.com\``, null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgAviso("𝐏𝐑𝐈𝐍𝐓𝐀𝐍𝐃𝐎", "Tirando print...", url, null, nomeBot) }, { quoted: msg })
        try {
          const r = await fetch(`${obanaiBase()}/api/tools/printsite?url=${encodeURIComponent(url)}&apitoken=${obanaiToken()}`)
          if (!r.ok) throw new Error("Falha ao gerar print")
          const buffer = Buffer.from(await r.arrayBuffer())
          await sock.sendMessage(jid, { image: buffer, caption: msgSucesso("𝐏𝐑𝐈𝐍𝐓", url, "Screenshot gerado", null, nomeBot) }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    cep: {
      aliases: ["buscacep", "consultarcep"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Só nobres!", "—", null, nomeBot) }, { quoted: msg }) }
        const cep = args.join("").replace(/\D/g, "")
        if (cep.length !== 8) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐂𝐄𝐏", "CEP inválido.", `Ex: \`${p}cep 01310930\``, null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        try {
          const d = await buscarCep(cep)
          if (!d) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐂𝐄𝐏", "CEP não encontrado.", cep, null, nomeBot) }, { quoted: msg }) }
          const texto = msgSucesso("𝐂𝐄𝐏", `${d.cep || cep}`, `Rua: ${d.logradouro || "—"}${d.complemento ? ` (${d.complemento})` : ""}\nBairro: ${d.bairro || "—"}\nCidade: ${d.localidade || "—"} - ${d.uf || "—"}\nEstado: ${d.estado || "—"} (${d.regiao || "—"})\nDDD: ${d.ddd || "—"}\nIBGE: ${d.ibge || "—"}`, null, nomeBot)
          await sock.sendMessage(jid, { text: texto }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    axis: {
      aliases: ["axiais"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Só nobres!", "—", null, nomeBot) }, { quoted: msg }) }
        const pergunta = args.join(" ").trim()
        if (!pergunta) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐗𝐈𝐒", "Informe a pergunta.", `Ex: \`${p}axis o que é um slime?\``, null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        try {
          await sock.sendPresenceUpdate("composing", jid)
          await sock.sendMessage(jid, { text: msgAviso("𝐀𝐗𝐈𝐒", "Consultando o Grande Sábio...", pergunta, null, nomeBot) }, { quoted: msg })
          const r = await fetch(`${obanaiBase()}/api/ias/axis?q=${encodeURIComponent(pergunta)}&apitoken=${obanaiToken()}`)
          const data = await r.json()
          if (!data?.success) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "IA indisponível.", "—", null, nomeBot) }, { quoted: msg }) }
          await sock.sendMessage(jid, { text: data.data.texto }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    unliai: {
      aliases: ["ia", "unli", "chatia"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Só nobres!", "—", null, nomeBot) }, { quoted: msg }) }
        const pergunta = args.join(" ").trim()
        if (!pergunta) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐔𝐍𝐋𝐈𝐀𝐈", "Informe a pergunta.", `Ex: \`${p}unliai como fazer bolo?\``, null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        try {
          await sock.sendPresenceUpdate("composing", jid)
          const r = await fetch(`${obanaiBase()}/api/ias/unliai?q=${encodeURIComponent(pergunta)}&apitoken=${obanaiToken()}`)
          const data = await r.json()
          if (!data?.success || !data?.response) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "IA indisponível.", "—", null, nomeBot) }, { quoted: msg }) }
          await sock.sendMessage(jid, { text: data.response }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    gerarnick: {
      aliases: ["nick", "nickname"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Só nobres!", "—", null, nomeBot) }, { quoted: msg }) }
        const texto = args.join(" ").trim()
        if (!texto) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐆𝐄𝐑𝐀𝐑𝐍𝐈𝐂𝐊", "Informe o texto.", `Ex: \`${p}gerarnick meu nome\``, null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        try {
          const textoLimpo = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          const r = await fetch(`${obanaiBase()}/api/tools/gerarnick?texto=${encodeURIComponent(textoLimpo)}&apitoken=${obanaiToken()}`)
          const data = await r.json()
          if (!data?.success || !data.data?.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Não consegui gerar.", "—", null, nomeBot) }, { quoted: msg }) }
          let txt = `${boxTop("𝐍𝐈𝐂𝐊𝐒")}\n\n`
          txt += `╭┈┈┈┈୨୧┈┈┈┈╮\n𓆩 𝐄𝐒𝐓𝐈𝐋𝐎𝐒 𓆪\n`
          data.data.forEach((n, i) => { txt += `↳ ${i + 1}. \`${n.nome}\`\n` })
          txt += `╰┈┈┈┈୨୧┈┈┈┈╯\n\n${boxFim(nomeBot, "Segure pra copiar.")}`
          await sock.sendMessage(jid, { text: txt }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    feriados: {
      aliases: ["feriado", "calendario"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Só nobres!", "—", null, nomeBot) }, { quoted: msg }) }
        const ano = (args[0] && /^\d{4}$/.test(args[0].trim())) ? args[0].trim() : new Date().getFullYear()
        await reagir(sock, msg, "🌸")
        try {
          const r = await fetch(`${obanaiBase()}/api/outros/feriados?ano=${ano}&apitoken=${obanaiToken()}`)
          const data = await r.json()
          if (!data?.success || !data.data?.total) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐅𝐄𝐑𝐈𝐀𝐃𝐎𝐒", "Nenhum feriado.", ano, null, nomeBot) }, { quoted: msg }) }
          const lista = data.data.feriados.map(f => `↳ ${f.date} — ${f.name} (${f.weekday})`).join("\n")
          await sock.sendMessage(jid, { text: `${boxTop(`𝐅𝐄𝐑𝐈𝐀𝐃𝐎𝐒 ${data.data.ano}`)}

${secao("𝐋𝐈𝐒𝐓𝐀")}
${lista}
${fimSecao()}

${boxFim(nomeBot)}` }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    moedas: {
      aliases: ["cotacao", "cambio"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Só nobres!", "—", null, nomeBot) }, { quoted: msg }) }
        const pares = args.join("").trim().toUpperCase().replace(/\s+/g, "") || "USD-BRL,EUR-BRL,BTC-BRL"
        await reagir(sock, msg, "🌸")
        try {
          const r = await fetch(`${obanaiBase()}/api/outros/moedas?pares=${encodeURIComponent(pares)}&apitoken=${obanaiToken()}`)
          const data = await r.json()
          if (!data?.success || !data.data?.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Par inválido.", pares, null, nomeBot) }, { quoted: msg }) }
          let txt = `${boxTop("𝐂𝐎𝐓𝐀𝐂̧𝐎̃𝐄𝐒")}\n\n`
          data.data.forEach(m => {
            txt += `╭┈┈┈┈୨୧┈┈┈┈╮\n𓆩 ${m.nome} 𓆪\n↳ Cotação: 💰 ${m.cotacao}\n↳ Máx: 📈 ${m.maximo}\n↳ Mín: 📉 ${m.minimo}\n↳ Variação: ${m.variacao_pct}%\n╰┈┈┈┈୨୧┈┈┈┈╯\n\n`
          })
          txt += boxFim(nomeBot)
          await sock.sendMessage(jid, { text: txt }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    waifu: {
      aliases: ["waifus", "anime"],
      async executar({ sock, msg, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Só nobres!", "—", null, nomeBot) }, { quoted: msg }) }
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
          await sock.sendMessage(jid, { text: msgAviso("𝐖𝐀𝐈𝐅𝐔", "5 imagens aleatórias", "A serpente aprecia a beleza.", null, nomeBot) }, { quoted: msg })
          for (const url of images) {
            try { await sock.sendMessage(jid, { image: { url }, caption: msgSucesso("𝐖𝐀𝐈𝐅𝐔", "Waifu do dia", "—", null, nomeBot) }, { quoted: msg }); await new Promise(res => setTimeout(res, 500)) } catch (_) {}
          }
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    upimage: {
      aliases: ["upimagem", "gerarimg"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Só nobres!", "—", null, nomeBot) }, { quoted: msg }) }
        const q = args.join(" ").trim()
        if (!q) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐔𝐏𝐈𝐌𝐀𝐆𝐄", "Informe a descrição.", `Ex: \`${p}upimage um gato no espaço\``, null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        try {
          await sock.sendMessage(jid, { text: msgAviso("𝐆𝐄𝐑𝐀𝐍𝐃𝐎", "Criando imagem...", q, null, nomeBot) }, { quoted: msg })
          const r = await fetch(`${obanaiBase()}/api/ias/upimage?q=${encodeURIComponent(q)}&apitoken=${obanaiToken()}`)
          const data = await r.json()
          if (!data?.success || !data?.image_url) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Não foi possível gerar.", q, null, nomeBot) }, { quoted: msg }) }
          await sock.sendMessage(jid, { image: { url: data.image_url }, caption: msgSucesso("𝐔𝐏𝐈𝐌𝐀𝐆𝐄", "Imagem gerada!", q, null, nomeBot) }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    deepimage: {
      aliases: ["deepimg", "gerarimg2"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Só nobres!", "—", null, nomeBot) }, { quoted: msg }) }
        const q = args.join(" ").trim()
        if (!q) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐃𝐄𝐄𝐏𝐈𝐌𝐀𝐆𝐄", "Informe a descrição.", `Ex: \`${p}deepimage um dragão\``, null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        try {
          await sock.sendMessage(jid, { text: msgAviso("𝐆𝐄𝐑𝐀𝐍𝐃𝐎", "Criando imagem...", q, null, nomeBot) }, { quoted: msg })
          const r = await fetch(`${obanaiBase()}/api/ias/deepimage?q=${encodeURIComponent(q)}&apitoken=${obanaiToken()}`)
          const data = await r.json()
          if (!data?.success || !data?.image_url) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Não foi possível gerar.", q, null, nomeBot) }, { quoted: msg }) }
          await sock.sendMessage(jid, { image: { url: data.image_url }, caption: msgSucesso("𝐃𝐄𝐄𝐏𝐈𝐌𝐀𝐆𝐄", "Imagem gerada!", q, null, nomeBot) }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    toprompt: {
      aliases: ["prompt", "img2prompt"],
      async executar({ sock, msg, db, utils, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Só nobres!", "—", null, nomeBot) }, { quoted: msg }) }
        const ctx = msg.message?.extendedTextMessage?.contextInfo || {}
        const qm = ctx.quotedMessage
        if (!qm || !qm.imageMessage) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐓𝐎𝐏𝐑𝐎𝐌𝐏𝐓", "Responda uma imagem.", `Use \`${prefixoAtivo || "+"}toprompt\``, null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        try {
          const alvoMsg = Object.assign({}, msg, { message: { imageMessage: qm.imageMessage } })
          const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          const r = await fetch(`${obanaiBase()}/api/ias/toprompt?url=${encodeURIComponent("data:image/jpeg;base64," + buffer.toString("base64"))}&apitoken=${obanaiToken()}`)
          const data = await r.json()
          if (!data?.status || !data.data?.prompt) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Não foi possível gerar o prompt.", "—", null, nomeBot) }, { quoted: msg }) }
          await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐑𝐎𝐌𝐏𝐓", "Prompt gerado!", data.data.prompt, null, nomeBot) }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    brat: {
      aliases: ["figbrat"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Só nobres!", "—", null, nomeBot) }, { quoted: msg }) }
        const t = args.join(" ").trim()
        if (!t) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐁𝐑𝐀𝐓", "Informe o texto.", `Ex: \`${p}brat <txt>\``, null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
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
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    s: {
      aliases: ["sticker", "fig"],
      async executar({ sock, msg, db, isDono, isSubDono, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Só nobres!", "—", null, nomeBot) }, { quoted: msg }) }
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const q = ctx.quotedMessage
        const eImg = q && q.imageMessage; const eVid = q && q.videoMessage
        if (!eImg && !eVid) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐒", "Responda foto ou vídeo.", `Use \`${prefixoAtivo || "+"}s\` (reply)`, null, nomeBot) }, { quoted: msg }) }
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
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    s3: {
      aliases: ["esticar", "stretch", "gordo"],
      async executar({ sock, msg, db, isDono, isSubDono, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Só nobres!", "—", null, nomeBot) }, { quoted: msg }) }
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const q = ctx.quotedMessage
        const eSti = q && q.stickerMessage; const eImg = q && q.imageMessage; const eVid = q && q.videoMessage
        if (!eSti && !eImg && !eVid) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐒𝟑", "Responda fig, foto ou vídeo.", `Use \`${prefixoAtivo || "+"}s3\` (reply)`, null, nomeBot) }, { quoted: msg }) }
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
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    smeme: {
      aliases: ["smem", "memefig"],
      async executar({ sock, msg, args, db, isDono, isSubDono, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Só nobres!", "—", null, nomeBot) }, { quoted: msg }) }
        const t = args.join(" ").trim()
        if (!t) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐒𝐌𝐄𝐌𝐄", "Informe o texto.", `Ex: \`${p}smeme <txt>\` (reply)`, null, nomeBot) }, { quoted: msg }) }
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const q = ctx.quotedMessage
        if (!q || !q.stickerMessage) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐒𝐌𝐄𝐌𝐄", "Responda uma figurinha.", "—", null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        try { const alvo = Object.assign({}, msg, { message: { stickerMessage: q.stickerMessage } }); const buf = await utils.downloadMediaMessage(alvo, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage }); await enviarFigTexto(sock, jid, buf, t, msg) }
        catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    procurado: {
      aliases: ["wanted", "procurase"],
      async executar({ sock, msg, db, isDono, isSubDono, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Só nobres!", "—", null, nomeBot) }, { quoted: msg }) }
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const q = ctx.quotedMessage
        if (!q || !q.stickerMessage) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐏𝐑𝐎𝐂𝐔𝐑𝐀𝐃𝐎", "Responda uma figurinha.", `Use \`${prefixoAtivo || "+"}procurado\` (reply)`, null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
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
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    wasted: {
      aliases: ["morto", "morreu"],
      async executar({ sock, msg, db, isDono, isSubDono, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Só nobres!", "—", null, nomeBot) }, { quoted: msg }) }
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const q = ctx.quotedMessage
        if (!q || !q.stickerMessage) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐖𝐀𝐒𝐓𝐄𝐃", "Responda uma figurinha.", `Use \`${prefixoAtivo || "+"}wasted\` (reply)`, null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
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
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    rename: {
      aliases: ["renomear", "nomefig", "setnome"],
      async executar({ sock, msg, args, db, isDono, isSubDono, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Só nobres!", "—", null, nomeBot) }, { quoted: msg }) }
        const t = args.join(" ").trim()
        if (!t) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐄𝐍𝐀𝐌𝐄", "Informe o nome.", `Ex: \`${p}rename <txt>\` (reply)`, null, nomeBot) }, { quoted: msg }) }
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const q = ctx.quotedMessage
        if (!q || !q.stickerMessage) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐄𝐍𝐀𝐌𝐄", "Responda uma figurinha.", "—", null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
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
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    revela: {
      aliases: ["revelar", "reveal", "ver"],
      async executar({ sock, msg, db, utils, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Só nobres!", "—", null, nomeBot) }, { quoted: msg }) }
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        let q = ctx.quotedMessage
        if (!q) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐄𝐕𝐄𝐋𝐀", "Responda uma msg de ver uma vez.", `Use \`${prefixoAtivo || "+"}revela\``, null, nomeBot) }, { quoted: msg }) }
        let isVU = false
        if (q.viewOnceMessageV2) { q = q.viewOnceMessageV2.message || q.viewOnceMessageV2; isVU = true }
        else if (q.viewOnceMessage) { q = q.viewOnceMessage.message || q.viewOnceMessage; isVU = true }
        const img = q.imageMessage, vid = q.videoMessage, aud = q.audioMessage
        if (img && img.viewOnce) isVU = true
        if (vid && vid.viewOnce) isVU = true
        if (aud && aud.viewOnce) isVU = true
        if (!isVU) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐍𝐀̃𝐎 𝐄́ 𝐕𝐄𝐑 𝐔𝐌𝐀 𝐕𝐄𝐙", "Não é oculta.", "—", null, nomeBot) }, { quoted: msg }) }
        if (!img && !vid && !aud) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐌𝐈́𝐃𝐈𝐀", "Não há mídia.", "—", null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        try {
          const tipo = img ? "image" : vid ? "video" : "audio"
          const alvo = Object.assign({}, msg, { message: tipo === "image" ? { imageMessage: img } : tipo === "video" ? { videoMessage: vid } : { audioMessage: aud } })
          const buf = await utils.downloadMediaMessage(alvo, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          if (tipo === "image") await sock.sendMessage(jid, { image: buf, caption: msgSucesso("𝐑𝐄𝐕𝐄𝐋𝐀𝐃𝐎", "Mídia revelada!", "—", null, nomeBot) }, { quoted: msg })
          else if (tipo === "video") await sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", caption: msgSucesso("𝐑𝐄𝐕𝐄𝐋𝐀𝐃𝐎", "Mídia revelada!", "—", null, nomeBot) }, { quoted: msg })
          else await sock.sendMessage(jid, { audio: buf, mimetype: "audio/mp4", ptt: false }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    autofig: {
      aliases: ["autosticker", "autofigu"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Só nobres!", "—", null, nomeBot) }, { quoted: msg }) }
        if (!jid.endsWith("@g.us")) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐀𝐔𝐓𝐎𝐅𝐈𝐆", "Só em grupos.", "—", null, nomeBot) }, { quoted: msg }) }
        const op = (args[0] || "").toLowerCase()
        const ac = dbLer("autocfg.json", { grupos: {} })
        ac.grupos = ac.grupos || {}; ac.grupos[jid] = ac.grupos[jid] || {}
        if (!["on", "off"].includes(op)) {
          const s = ac.grupos[jid].autofig ? "ON ✅" : "OFF ❌"
          await reagir(sock, msg, "🌸")
          return sock.sendMessage(jid, { text: msgAviso("𝐀𝐔𝐓𝐎𝐅𝐈𝐆", `Status: ${s}`, `Use \`${p}autofig on/off\``, null, nomeBot) }, { quoted: msg })
        }
        ac.grupos[jid].autofig = op === "on"
        dbSalvar("autocfg.json", ac)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐔𝐓𝐎𝐅𝐈𝐆", op.toUpperCase(), op === "on" ? "Figurinhas automáticas ativadas." : "Desativadas.", null, nomeBot) }, { quoted: msg })
      }
    },

    autottk: {
      aliases: ["autotiktok", "autott"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        if (!checarVip(db, sJ, isDono, isSubDono)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐎́ 𝐕𝐈𝐏", "Só nobres!", "—", null, nomeBot) }, { quoted: msg }) }
        if (!jid.endsWith("@g.us")) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐀𝐔𝐓𝐎𝐓𝐓𝐊", "Só em grupos.", "—", null, nomeBot) }, { quoted: msg }) }
        const op = (args[0] || "").toLowerCase()
        const ac = dbLer("autocfg.json", { grupos: {} })
        ac.grupos = ac.grupos || {}; ac.grupos[jid] = ac.grupos[jid] || {}
        if (!["on", "off"].includes(op)) {
          const s = ac.grupos[jid].autottk ? "ON ✅" : "OFF ❌"
          await reagir(sock, msg, "🌸")
          return sock.sendMessage(jid, { text: msgAviso("𝐀𝐔𝐓𝐎𝐓𝐓𝐊", `Status: ${s}`, `Use \`${p}autottk on/off\``, null, nomeBot) }, { quoted: msg })
        }
        ac.grupos[jid].autottk = op === "on"
        dbSalvar("autocfg.json", ac)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐔𝐓𝐎𝐓𝐓𝐊", op.toUpperCase(), op === "on" ? "Auto TikTok ativado." : "Desativado.", null, nomeBot) }, { quoted: msg })
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
        if (isDono || isSubDono) { await reagir(sock, msg, "🌸"); return sock.sendMessage(jid, { text: msgSucesso("𝐌𝐄𝐔 𝐕𝐈𝐏", "Você é o mestre.", `Cargo: ${isDono ? "GRANDE SÁBIO" : "LUA SUPERIOR"}`, null, nomeBot) }, { quoted: msg }) }
        if (!info) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐌𝐄𝐔 𝐕𝐈𝐏", "Você não é nobre.", "—", null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐌𝐄𝐔 𝐕𝐈𝐏", "Status VIP", `Expira: ${info.expira === "inf" ? "INFINITO ♾️" : new Date(info.expira).toLocaleString("pt-BR")}`, null, nomeBot) }, { quoted: msg })
      }
    }

  }
}