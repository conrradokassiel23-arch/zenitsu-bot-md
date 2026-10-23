/* ============================================================
   🐍🌸 MENU VIP - OBANAI EDITION (COMPLETO + NOVOS)
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

function obanaiToken() { try { return require("../../config").obanaiToken || "rj8SpI" } catch (_) { return "rj8SpI" } }
function obanaiBase() { try { return require("../../config").obanaiApiBase || "https://obanai-apis.eu.cc" } catch (_) { return "https://obanai-apis.eu.cc" } }

function cardPerfil({ nomeBot, nomeUsuario, cargo, dono }) {
  return `╭━━━〔 🐍 𝐎𝐁𝐀𝐍𝐀𝐈 𝐈𝐆𝐔𝐑𝐎 🐍 〕━━━╮
┃ 🌸 Mestre da Serpente 🌸
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ 🐍 𝐁𝐨𝐭: ${nomeBot || "Obanai"}
┃ 🌸 𝐔𝐬𝐮á𝐫𝐢𝐨: ${nomeUsuario || "? "}
┃ 🐍 𝐂𝐚𝐫𝐠𝐨: ${cargo || "Mortal"}
┃ 🌸 𝐃𝐨𝐧𝐨: ${dono || "Obanai"}
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ 🐍 _"A serpente não perdoa."_ 🌸
╰━━━〔 🐍 𝐈𝐆𝐔𝐑𝐎 𝐎𝐁𝐀𝐍𝐀𝐈 🐍 〕━━━╯`
}
function secao(t) { return `╭━━━〔 🐍 ${t} 🐍 〕━━━╮\n┃` }
function item(c) { return `┃ 🐍 ${c}\n┃` }

function detectarCargo({ sender, config, db, groupMetadata, isDono, isSubDono, isAdmin }) {
  const num = String(sender || "").split("@")[0].split(":")[0].replace(/\D/g, "")
  const donos = (Array.isArray(config?.dono) ? config.dono : [config?.dono]).map(n => String(n).split("@")[0].split(":")[0].replace(/\D/g, "")).filter(Boolean)
  if (isDono || donos.includes(num)) return "🐍 Mestre da Serpente"
  try { const subs = (db.config?.().subdonos || []).map(n => String(n).split("@")[0].split(":")[0].replace(/\D/g, "")); if (isSubDono || subs.includes(num)) return "🌸 Hashira da Serpente" } catch (_) {}
  try { const vips = (db.vips?.() || {}).vips || {}; for (const [j, info] of Object.entries(vips)) { const jn = String(j).split("@")[0].split(":")[0].replace(/\D/g, ""); if (jn === num && (info.expira === "inf" || info.expira > Date.now())) return "❄️ Nobre Aliado" } } catch (_) {}
  if (isAdmin) return "🐍 Espadachim"
  return "🌸 Aprendiz"
}

function getCargoETexto(ctx) {
  const { sender, config, db, groupMetadata, isDono, isSubDono, isAdmin, msg } = ctx
  const pushName = msg.pushName || "Mortal"
  const donoArr = Array.isArray(config && config.dono) ? config.dono : [config && config.dono || "Chefe"]
  const nomeDono = String(donoArr[0] || "Chefe").split("@")[0].split(":")[0].replace(/\D/g, "") || "Chefe"
  const cargo = detectarCargo({ sender, config, db, groupMetadata, isDono, isSubDono, isAdmin })
  const nomeBot = (config && config.nomeBot) || nomeBotDb(db)
  return { pushName, nomeDono, cargo, nomeBot }
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
      const data = {
        cep: v.cep, logradouro: v.logradouro, complemento: v.complemento,
        bairro: v.bairro, localidade: v.localidade, uf: v.uf,
        estado: v.estado || "", regiao: v.regiao || "", ddd: v.ddd, ibge: v.ibge
      }
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
    }
  } catch (e) {}
  return { ok: false, erro: "Falha ao baixar." }
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
  } catch (e) { await sock.sendMessage(jid, { text: "🐍 Erro: " + e.message }, { quoted }) }
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
        const p = prefixoAtivo || "+"
        const cfg = db.config()
        const { pushName, nomeDono, cargo, nomeBot } = getCargoETexto({ sender, config, db, groupMetadata, isDono, isSubDono, isAdmin, msg })

        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        const ehVipUser = checarVip(db, sJ, isDono, isSubDono)

        if (!ehVipUser) {
          await reagir(sock, msg, "❄️")
          return sock.sendMessage(jid, { text: `🐍 • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n🌸 Você não é um aliado nobre.\n\n_"O Grande Sábio não te reconhece."_\n\n"${nomeBot}"` }, { quoted: msg })
        }

        await reagir(sock, msg, "🐍")

        const texto = `${cardPerfil({ nomeBot, nomeUsuario: pushName, cargo, dono: nomeDono })}

${secao("🌸 𝐌𝐔́𝐒𝐈𝐂𝐀")}
${item(`${p}play <nome> / ${p}spot <link>`)}
${item(`${p}soundcloud <nome>`)}

${secao("🐍 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐒")}
${item(`${p}insta <link> / ${p}tiktok <link>`)}
${item(`${p}pinterest <busca>`)}

${secao("🌸 𝐍𝐎𝐓𝐈́𝐂𝐈𝐀𝐒")}
${item(`${p}g1 / ${p}uol / ${p}jovempan`)}
${item(`${p}vasco`)}

${secao("🐍 𝐄𝐒𝐓𝐀𝐓𝐈́𝐒𝐓𝐈𝐂𝐀𝐒")}
${item(`${p}tiktoktag <hashtag>`)}

${secao("🌸 𝐔𝐓𝐈𝐋𝐈𝐃𝐀𝐃𝐄𝐒")}
${item(`${p}cep <8 dígitos>`)}
${item(`${p}moedas [pares]`)}
${item(`${p}conversor <val> <de> <para>`)}
${item(`${p}qrcode <texto>`)}
${item(`${p}printsite <url>`)}
${item(`${p}feriados [ano]`)}

${secao("🐍 𝐈𝐀 & 𝐈𝐌𝐀𝐆𝐄𝐍𝐒")}
${item(`${p}waifu`)}
${item(`${p}upimage <desc>`)}
${item(`${p}deepimage <desc>`)}
${item(`${p}toprompt (reply img)`)}
${item(`${p}axis <pergunta>`)}
${item(`${p}unliai <pergunta>`)}
${item(`${p}gerarnick <txt>`)}

${secao("🌸 𝐅𝐈𝐆𝐔𝐑𝐈𝐍𝐇𝐀𝐒")}
${item(`${p}brat / ${p}s / ${p}rename`)}
${item(`${p}smeme / ${p}s3`)}
${item(`${p}procurado / ${p}wasted / ${p}revela`)}

${secao("🐍 𝐃𝐈𝐕𝐄𝐑𝐒𝐀̃𝐎")}
${item(`${p}dino`)}

${secao("🌸 𝐀𝐔𝐓𝐎")}
${item(`${p}autofig on/off`)}
${item(`${p}autottk on/off`)}

🐍 Prefixo: \`${p}\`

╰━━━〔 🌸 _"Não desvie o olhar."_ 🐍 〕━━━╯
"${nomeBot}"`

        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          if (cfg.tipoMenu === "video") return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "obanai.mp4", gifPlayback: true, caption: texto }, { quoted: msg })
          return sock.sendMessage(jid, { image: buf, caption: texto }, { quoted: msg })
        }
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    // ============================================================
    // 🐍 WAIFU (ADAPTADO - ENVIA IMAGENS SEPARADAS)
    // ============================================================
    waifu: {
      aliases: ["waifus", "anime"],
      async executar({ sock, msg, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        
        if (!checarVip(db, sJ, isDono, isSubDono)) {
          await reagir(sock, msg, "🧊")
          return sock.sendMessage(jid, { text: `🐍 • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n🌸 Só nobres!\n\n"${nomeBot}"` }, { quoted: msg })
        }

        await reagir(sock, msg, "🐍")
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

          if (!images.length) {
            for (let i = 0; i < 5; i++) images.push(`https://picsum.photos/id/${100 + i}/400/400`)
          }

          await sock.sendMessage(jid, { text: `🌸 • 𝐖𝐀𝐈𝐅𝐔 •\n\n🐍 5 imagens aleatórias\n\n_"A serpente aprecia a beleza."_\n\n"${nomeBot}"` }, { quoted: msg })

          for (const url of images) {
            try {
              await sock.sendMessage(jid, { image: { url }, caption: `🐍 • 𝐖𝐀𝐈𝐅𝐔 •\n\n"${nomeBot}"` }, { quoted: msg })
              await new Promise(res => setTimeout(res, 500))
            } catch (_) {}
          }
        } catch (e) {
          await reagir(sock, msg, "🧊")
          await sock.sendMessage(jid, { text: `🐍 • 𝐄𝐑𝐑𝐎 •\n\n🌸 Não consegui buscar imagens.\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    // ============================================================
    // 🐍 TOPROMPT (IMG → PROMPT)
    // ============================================================
    toprompt: {
      aliases: ["prompt", "img2prompt"],
      async executar({ sock, msg, db, utils, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        
        if (!checarVip(db, sJ, isDono, isSubDono)) {
          await reagir(sock, msg, "🧊")
          return sock.sendMessage(jid, { text: `🐍 • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n🌸 Só nobres!\n\n"${nomeBot}"` }, { quoted: msg })
        }

        const ctx = msg.message?.extendedTextMessage?.contextInfo || {}
        const qm = ctx.quotedMessage
        if (!qm || !qm.imageMessage) {
          await reagir(sock, msg, "🧊")
          return sock.sendMessage(jid, { text: `🐍 • 𝐓𝐎𝐏𝐑𝐎𝐌𝐏𝐓 •\n\n🌸 Responda uma imagem com:\n🐍 \`${prefixoAtivo || "+"}toprompt\`\n\n"${nomeBot}"` }, { quoted: msg })
        }

        await reagir(sock, msg, "🐍")
        try {
          const alvoMsg = Object.assign({}, msg, { message: { imageMessage: qm.imageMessage } })
          const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          
          // Upload temporário para API de prompt
          const formData = new FormData()
          const blob = new Blob([buffer], { type: "image/jpeg" })
          formData.append("file", blob, `${Date.now()}.jpg`)
          
          // Tenta usar a API direta (se aceitar buffer base64)
          const r = await fetch(`${obanaiBase()}/api/ias/toprompt?url=${encodeURIComponent("data:image/jpeg;base64," + buffer.toString("base64"))}&apitoken=${obanaiToken()}`)
          const data = await r.json()
          
          if (!data?.status || !data.data?.prompt) {
            await reagir(sock, msg, "🧊")
            return sock.sendMessage(jid, { text: `🐍 • 𝐄𝐑𝐑𝐎 •\n\n🌸 Não foi possível gerar o prompt.\n\n"${nomeBot}"` }, { quoted: msg })
          }
          
          await sock.sendMessage(jid, { text: `🌸 • 𝐏𝐑𝐎𝐌𝐏𝐓 •\n\n🐍 ${data.data.prompt}\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) {
          await reagir(sock, msg, "🧊")
          await sock.sendMessage(jid, { text: `🐍 • 𝐄𝐑𝐑𝐎 •\n\n🌸 ${e.message}\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    // ============================================================
    // 🐍 UPIMAGE (GERA IMAGEM)
    // ============================================================
    upimage: {
      aliases: ["upimagem", "gerarimg"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        
        if (!checarVip(db, sJ, isDono, isSubDono)) {
          await reagir(sock, msg, "🧊")
          return sock.sendMessage(jid, { text: `🐍 • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n🌸 Só nobres!\n\n"${nomeBot}"` }, { quoted: msg })
        }

        const q = args.join(" ").trim()
        if (!q) {
          await reagir(sock, msg, "🧊")
          return sock.sendMessage(jid, { text: `🐍 • 𝐔𝐏𝐈𝐌𝐀𝐆𝐄 •\n\n🌸 Use: \`${p}upimage <descrição>\`\n\n"${nomeBot}"` }, { quoted: msg })
        }

        await reagir(sock, msg, "🐍")
        try {
          await sock.sendMessage(jid, { text: `🌸 • 𝐆𝐄𝐑𝐀𝐍𝐃𝐎 •\n\n🐍 Criando imagem...\n\n"${nomeBot}"` }, { quoted: msg })
          const r = await fetch(`${obanaiBase()}/api/ias/upimage?q=${encodeURIComponent(q)}&apitoken=${obanaiToken()}`)
          const data = await r.json()
          
          if (!data?.success || !data?.image_url) {
            await reagir(sock, msg, "🧊")
            return sock.sendMessage(jid, { text: `🐍 • 𝐄𝐑𝐑𝐎 •\n\n🌸 Não foi possível gerar.\n\n"${nomeBot}"` }, { quoted: msg })
          }
          
          await sock.sendMessage(jid, { image: { url: data.image_url }, caption: `🌸 • 𝐔𝐏𝐈𝐌𝐀𝐆𝐄 •\n\n🐍 ${q}\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) {
          await reagir(sock, msg, "🧊")
          await sock.sendMessage(jid, { text: `🐍 • 𝐄𝐑𝐑𝐎 •\n\n🌸 ${e.message}\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    // ============================================================
    // 🐍 DEEPIMAGE (GERA IMAGEM)
    // ============================================================
    deepimage: {
      aliases: ["deepimg", "gerarimg2"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        
        if (!checarVip(db, sJ, isDono, isSubDono)) {
          await reagir(sock, msg, "🧊")
          return sock.sendMessage(jid, { text: `🐍 • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n🌸 Só nobres!\n\n"${nomeBot}"` }, { quoted: msg })
        }

        const q = args.join(" ").trim()
        if (!q) {
          await reagir(sock, msg, "🧊")
          return sock.sendMessage(jid, { text: `🐍 • 𝐃𝐄𝐄𝐏𝐈𝐌𝐀𝐆𝐄 •\n\n🌸 Use: \`${p}deepimage <descrição>\`\n\n"${nomeBot}"` }, { quoted: msg })
        }

        await reagir(sock, msg, "🐍")
        try {
          await sock.sendMessage(jid, { text: `🌸 • 𝐆𝐄𝐑𝐀𝐍𝐃𝐎 •\n\n🐍 Criando imagem...\n\n"${nomeBot}"` }, { quoted: msg })
          const r = await fetch(`${obanaiBase()}/api/ias/deepimage?q=${encodeURIComponent(q)}&apitoken=${obanaiToken()}`)
          const data = await r.json()
          
          if (!data?.success || !data?.image_url) {
            await reagir(sock, msg, "🧊")
            return sock.sendMessage(jid, { text: `🐍 • 𝐄𝐑𝐑𝐎 •\n\n🌸 Não foi possível gerar.\n\n"${nomeBot}"` }, { quoted: msg })
          }
          
          await sock.sendMessage(jid, { image: { url: data.image_url }, caption: `🌸 • 𝐃𝐄𝐄𝐏𝐈𝐌𝐀𝐆𝐄 •\n\n🐍 ${q}\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) {
          await reagir(sock, msg, "🧊")
          await sock.sendMessage(jid, { text: `🐍 • 𝐄𝐑𝐑𝐎 •\n\n🌸 ${e.message}\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    // ============================================================
    // 🐍 DINO (JOGO INTERATIVO)
    // ============================================================
    dino: {
      aliases: ["jogodino", "dinossauro"],
      async executar({ sock, msg, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        
        if (!checarVip(db, sJ, isDono, isSubDono)) {
          await reagir(sock, msg, "🧊")
          return sock.sendMessage(jid, { text: `🐍 • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n🌸 Só nobres!\n\n"${nomeBot}"` }, { quoted: msg })
        }

        await reagir(sock, msg, "🐍")
        try {
          const dinoHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;box-sizing:border-box}html,body{margin:0;padding:0;width:100%;min-height:100%;overflow:hidden;background:#fff}body{display:flex;justify-content:center;align-items:flex-start;padding:10px}canvas{display:block;width:100%;max-width:600px;height:auto;background:#fff;image-rendering:pixelated;image-rendering:crisp-edges;transition:filter .3s;touch-action:none}</style></head>
<body><canvas id="c" width="600" height="150"></canvas>
<script>
(function(){'use strict';const cv=document.getElementById('c');const x=cv.getContext('2d',{alpha:false});x.imageSmoothingEnabled=false;const W=600,H=150,GROUND_LINE=127;const TREX={x:848,y:2,w:44,h:47,wDuck:59,hDuck:25};const GROUND_Y=H-TREX.h-10,GROUND_Y_DUCK=H-TREX.hDuck-10;const CACTUS_SMALL={x:228,y:2,w:17,h:35,groundY:105};const CACTUS_LARGE={x:332,y:2,w:25,h:50,groundY:90};const PTERO={x:134,y:2,w:46,h:40,ys:[100,75,50]};const CLOUD={x:86,y:2,w:46,h:14};let night=false;let distSinceInvert=0;let dino,obstacles,clouds,groundOffset,speed,score,hi=0,gameOver,started,last=0,spawnTimer;function reset(){dino={x:40,duck:false,y:GROUND_Y,vy:0,onGround:true,runFrame:0,runTimer:0};obstacles=[];clouds=[{x:200,y:30},{x:420,y:45},{x:560,y:20}];groundOffset=0;speed=6;score=0;gameOver=false;started=false;last=0;night=false;distSinceInvert=0;spawnTimer=60}function jump(){if(gameOver){reset();started=true;return}started=true;if(dino.onGround&&!dino.duck){dino.vy=-10;dino.onGround=false}}function setDuck(v){if(!dino.onGround)return;dino.duck=v;dino.y=v?GROUND_Y_DUCK:GROUND_Y}document.addEventListener('keydown',function(e){if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();jump()}if(e.code==='ArrowDown'){e.preventDefault();setDuck(true)}});document.addEventListener('keyup',function(e){if(e.code==='ArrowDown'){e.preventDefault();setDuck(false)}});document.body.addEventListener('pointerdown',function(e){e.preventDefault();jump()},{passive:false});function spawnObstacle(){const r=Math.random();if(r<.35){obstacles.push({type:'cs',x:W,w:CACTUS_SMALL.w,h:CACTUS_SMALL.h,y:CACTUS_SMALL.groundY})}else if(r<.70){obstacles.push({type:'cl',x:W,w:CACTUS_LARGE.w,h:CACTUS_LARGE.h,y:CACTUS_LARGE.groundY})}else{const y=PTERO.ys[Math.floor(Math.random()*PTERO.ys.length)];obstacles.push({type:'pt',x:W,w:PTERO.w,h:PTERO.h,y:y,frame:0,frameTimer:0})}}function hit(a,b){return(a.x+6<b.x+b.w-4&&a.x+a.w-6>b.x+4&&a.y+6<b.y+b.h-4&&a.y+a.h-6>b.y+4)}function drawDino(){let sx,sy,sw,sh;if(dino.duck){sw=TREX.wDuck;sh=TREX.hDuck;sx=TREX.x+(dino.onGround?[264,323][Math.floor(dino.runFrame)%2]:264);sy=TREX.y}else if(!dino.onGround){sw=TREX.w;sh=TREX.h;sx=TREX.x;sy=TREX.y}else{sw=TREX.w;sh=TREX.h;sx=started?TREX.x+[88,132][Math.floor(dino.runFrame)%2]:TREX.x;sy=TREX.y}x.fillStyle='#535353';x.fillRect(dino.x,dino.y,sw,sh)}function drawObstacle(o){x.fillStyle='#535353';x.fillRect(o.x,o.y,o.w,o.h)}function drawGround(){x.strokeStyle='#535353';x.lineWidth=2;x.setLineDash([2,6]);x.lineDashOffset=-groundOffset;x.beginPath();x.moveTo(0,GROUND_LINE);x.lineTo(W,GROUND_LINE);x.stroke();x.setLineDash([])}function drawClouds(){x.fillStyle='#e0e0e0';clouds.forEach(function(c){x.fillRect(c.x,c.y,CLOUD.w,CLOUD.h)})}function drawScore(){x.fillStyle='#535353';x.font='16px monospace';x.textAlign='right';const s=String(Math.floor(score)).padStart(5,'0');const h=String(Math.floor(hi)).padStart(5,'0');x.fillText(hi>0?'HI '+h+'   '+s:s,W-10,22);x.textAlign='left'}function drawMessage(){x.fillStyle='#535353';x.textAlign='center';if(gameOver){x.font='bold 18px monospace';x.fillText('GAME OVER',W/2,55);x.font='12px monospace';x.fillText('toque ou espaço pra reiniciar',W/2,75)}else if(!started){x.font='13px monospace';x.fillText('toque na tela ou espaço pra começar',W/2,60)}x.textAlign='left'}function loop(t){if(!last)last=t;const dt=Math.min((t-last)/16.67,2);last=t;x.setTransform(1,0,0,1,0,0);x.fillStyle='#fff';x.fillRect(0,0,W,H);drawClouds();if(started&&!gameOver){groundOffset+=speed*dt;dino.runTimer+=dt;if(dino.runTimer>5){dino.runFrame++;dino.runTimer=0}dino.vy+=.6*dt;dino.y+=dino.vy*dt;const floorY=dino.duck?GROUND_Y_DUCK:GROUND_Y;if(dino.y>=floorY){dino.y=floorY;dino.vy=0;dino.onGround=true}clouds.forEach(function(c){c.x-=speed*.15*dt;if(c.x<-50){c.x=W+Math.random()*100}});spawnTimer-=dt;if(spawnTimer<=0){spawnObstacle();spawnTimer=Math.max(35,75-speed*2.2)+Math.random()*35}obstacles.forEach(function(o){o.x-=speed*dt;if(o.type==='pt'){o.frameTimer+=dt;if(o.frameTimer>12){o.frame++;o.frameTimer=0}}});obstacles=obstacles.filter(function(o){return o.x>-60});speed=Math.min(13,speed+.0025*dt);score+=dt*.12;if(score>hi){hi=score}distSinceInvert+=dt;if(distSinceInvert>350){distSinceInvert=0;night=!night}const db={x:dino.x,y:dino.y,w:dino.duck?TREX.wDuck:TREX.w,h:dino.duck?TREX.hDuck:TREX.h};for(const o of obstacles){if(hit(db,o)){gameOver=true;break}}}drawGround();obstacles.forEach(drawObstacle);drawDino();drawScore();drawMessage();cv.style.filter=night?'invert(1)':'none';requestAnimationFrame(loop)}function start(){reset();x.fillStyle='#fff';x.fillRect(0,0,W,H);drawGround();drawDino();drawScore();drawMessage();requestAnimationFrame(loop)}start()})();
</script></body></html>`

          await sock.sendMessage(jid, { text: `🌸 • 𝐃𝐈𝐍𝐎 •\n\n🐍 Abra o link para jogar:\n\n\`\`\`${dinoHtml}\`\`\`\n\n_"A serpente desafia você."_\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) {
          await reagir(sock, msg, "🧊")
          await sock.sendMessage(jid, { text: `🐍 • 𝐄𝐑𝐑𝐎 •\n\n🌸 ${e.message}\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    // ============================================================
    // 🐍 MOEDAS (COTAÇÃO)
    // ============================================================
    moedas: {
      aliases: ["cotacao", "cambio"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        
        if (!checarVip(db, sJ, isDono, isSubDono)) {
          await reagir(sock, msg, "🧊")
          return sock.sendMessage(jid, { text: `🐍 • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n🌸 Só nobres!\n\n"${nomeBot}"` }, { quoted: msg })
        }

        const pares = args.join("").trim().toUpperCase().replace(/\s+/g, "") || "USD-BRL,EUR-BRL,BTC-BRL"
        await reagir(sock, msg, "🐍")
        try {
          const r = await fetch(`${obanaiBase()}/api/outros/moedas?pares=${encodeURIComponent(pares)}&apitoken=${obanaiToken()}`)
          const data = await r.json()
          
          if (!data?.success || !data.data?.length) {
            await reagir(sock, msg, "🧊")
            return sock.sendMessage(jid, { text: `🐍 • 𝐄𝐑𝐑𝐎 •\n\n🌸 Par inválido ou não encontrado.\n\n"${nomeBot}"` }, { quoted: msg })
          }
          
          const lista = data.data.map(m => `🐍 • ${m.nome}\n🌸 💰 ${m.cotacao} | 📈 ${m.maximo} | 📉 ${m.minimo} | ${m.variacao_pct}%`).join("\n\n")
          await sock.sendMessage(jid, { text: `🌸 • 𝐂𝐎𝐓𝐀𝐂̧𝐎̃𝐄𝐒 •\n\n${lista}\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) {
          await reagir(sock, msg, "🧊")
          await sock.sendMessage(jid, { text: `🐍 • 𝐄𝐑𝐑𝐎 •\n\n🌸 ${e.message}\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    // ============================================================
    // 🐍 CONVERSOR
    // ============================================================
    conversor: {
      aliases: ["converter"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        
        if (!checarVip(db, sJ, isDono, isSubDono)) {
          await reagir(sock, msg, "🧊")
          return sock.sendMessage(jid, { text: `🐍 • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n🌸 Só nobres!\n\n"${nomeBot}"` }, { quoted: msg })
        }

        if (args.length < 3) {
          await reagir(sock, msg, "🧊")
          return sock.sendMessage(jid, { text: `🐍 • 𝐂𝐎𝐍𝐕𝐄𝐑𝐒𝐎𝐑 •\n\n🌸 Use: \`${p}conversor 10 km mi\`\n\n"${nomeBot}"` }, { quoted: msg })
        }

        const [valor, de, para] = args
        await reagir(sock, msg, "🐍")
        try {
          const r = await fetch(`${obanaiBase()}/api/outros/conversor?de=${encodeURIComponent(de)}&para=${encodeURIComponent(para)}&valor=${encodeURIComponent(valor)}&apitoken=${obanaiToken()}`)
          const data = await r.json()
          
          if (!data?.success) {
            await reagir(sock, msg, "🧊")
            return sock.sendMessage(jid, { text: `🐍 • 𝐄𝐑𝐑𝐎 •\n\n🌸 ${data?.message || "Conversão inválida."}\n\n"${nomeBot}"` }, { quoted: msg })
          }
          
          await sock.sendMessage(jid, { text: `🌸 • 𝐂𝐎𝐍𝐕𝐄𝐑𝐒𝐎𝐑 •\n\n🐍 ${data.data.expressao}\n🌸 Categoria: ${data.data.categoria}\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) {
          await reagir(sock, msg, "🧊")
          await sock.sendMessage(jid, { text: `🐍 • 𝐄𝐑𝐑𝐎 •\n\n🌸 ${e.message}\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    // ============================================================
    // 🐍 QRCODE
    // ============================================================
    qrcode: {
      aliases: ["qr"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        
        if (!checarVip(db, sJ, isDono, isSubDono)) {
          await reagir(sock, msg, "🧊")
          return sock.sendMessage(jid, { text: `🐍 • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n🌸 Só nobres!\n\n"${nomeBot}"` }, { quoted: msg })
        }

        const q = args.join(" ").trim()
        if (!q) {
          await reagir(sock, msg, "🧊")
          return sock.sendMessage(jid, { text: `🐍 • 𝐐𝐑𝐂𝐎𝐃𝐄 •\n\n🌸 Use: \`${p}qrcode <texto>\`\n\n"${nomeBot}"` }, { quoted: msg })
        }

        await reagir(sock, msg, "🐍")
        try {
          const r = await fetch(`${obanaiBase()}/api/tools/qrcode?texto=${encodeURIComponent(q)}&apitoken=${obanaiToken()}`)
          if (!r.ok) throw new Error("Falha ao gerar QR")
          const buffer = Buffer.from(await r.arrayBuffer())
          await sock.sendMessage(jid, { image: buffer, caption: `🌸 • 𝐐𝐑𝐂𝐎𝐃𝐄 •\n\n🐍 Gerado\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) {
          await reagir(sock, msg, "🧊")
          await sock.sendMessage(jid, { text: `🐍 • 𝐄𝐑𝐑𝐎 •\n\n🌸 ${e.message}\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    // ============================================================
    // 🐍 PRINTSITE
    // ============================================================
    printsite: {
      aliases: ["ss", "print"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        
        if (!checarVip(db, sJ, isDono, isSubDono)) {
          await reagir(sock, msg, "🧊")
          return sock.sendMessage(jid, { text: `🐍 • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n🌸 Só nobres!\n\n"${nomeBot}"` }, { quoted: msg })
        }

        const url = args[0]
        if (!url || !/^https?:\/\//.test(url)) {
          await reagir(sock, msg, "🧊")
          return sock.sendMessage(jid, { text: `🐍 • 𝐏𝐑𝐈𝐍𝐓𝐒𝐈𝐓𝐄 •\n\n🌸 Use: \`${p}printsite <url>\`\n\n"${nomeBot}"` }, { quoted: msg })
        }

        await reagir(sock, msg, "🐍")
        try {
          await sock.sendMessage(jid, { text: `🌸 • 𝐏𝐑𝐈𝐍𝐓𝐀𝐍𝐃𝐎 •\n\n🐍 Tirando print...\n\n"${nomeBot}"` }, { quoted: msg })
          const r = await fetch(`${obanaiBase()}/api/tools/printsite?url=${encodeURIComponent(url)}&apitoken=${obanaiToken()}`)
          if (!r.ok) throw new Error("Falha ao gerar print")
          const buffer = Buffer.from(await r.arrayBuffer())
          await sock.sendMessage(jid, { image: buffer, caption: `🌸 • 𝐏𝐑𝐈𝐍𝐓 •\n\n🐍 ${url}\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) {
          await reagir(sock, msg, "🧊")
          await sock.sendMessage(jid, { text: `🐍 • 𝐄𝐑𝐑𝐎 •\n\n🌸 ${e.message}\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    // ============================================================
    // 🐍 CEP
    // ============================================================
    cep: {
      aliases: ["buscacep", "consultarcep"],
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
        
        if (!checarVip(db, sJ, isDono, isSubDono)) {
          await reagir(sock, msg, "🧊")
          return sock.sendMessage(jid, { text: `🐍 • 𝐒𝐎́ 𝐕𝐈𝐏 •\n\n🌸 Só nobres!\n\n"${nomeBot}"` }, { quoted: msg })
        }

        const cep = args.join("").replace(/\D/g, "")
        if (cep.length !== 8) {
          await reagir(sock, msg, "🧊")
          return sock.sendMessage(jid, { text: `🐍 • 𝐂𝐄𝐏 •\n\n🌸 Use: \`${p}cep 01310930\`\n\n"${nomeBot}"` }, { quoted: msg })
        }

        await reagir(sock, msg, "🐍")
        try {
          const d = await buscarCep(cep)
          if (!d) {
            await reagir(sock, msg, "🧊")
            return sock.sendMessage(jid, { text: `🐍 • 𝐂𝐄𝐏 •\n\n🌸 CEP *${cep}* não encontrado.\n\n"${nomeBot}"` }, { quoted: msg })
          }
          const texto = `🐍 • 𝐂𝐄𝐏 • 🌸\n\n❄️ *${d.cep || cep}*\n\n🐍 𝐑𝐔𝐀:\n🌸 ${d.logradouro || "—"}${d.complemento ? ` (${d.complemento})` : ""}\n\n🐍 𝐁𝐀𝐈𝐑𝐑𝐎:\n🌸 ${d.bairro || "—"}\n\n🐍 𝐂𝐈𝐃𝐀𝐃𝐄:\n🌸 ${d.localidade || "—"} - ${d.uf || "—"}\n\n🐍 𝐄𝐒𝐓𝐀𝐃𝐎:\n🌸 ${d.estado || "—"} (${d.regiao || "—"})\n\n🐍 𝐃𝐃𝐃:\n🌸 ${d.ddd || "—"}\n\n🐍 𝐈𝐁𝐆𝐄:\n🌸 ${d.ibge || "—"}\n\n"${nomeBot}"`
          await sock.sendMessage(jid, { text: texto }, { quoted: msg })
        } catch (e) {
          await reagir(sock, msg, "🧊")
          await sock.sendMessage(jid, { text: `🐍 • 𝐄𝐑𝐑𝐎 •\n\n🌸 ${e.message}\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    }

  }
}