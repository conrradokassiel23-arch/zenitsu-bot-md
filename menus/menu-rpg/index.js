/* ============================================================
   💧❄️🧊 MENU RPG - RIMURU BOT MD
   ============================================================ */

const fs = require("fs")
const path = require("path")

const DATA_DIR = path.join(__dirname, "..", "..", "data")

function dbLer(arquivo, padrao = {}) {
  const p = path.join(DATA_DIR, arquivo)
  if (!fs.existsSync(p)) { fs.writeFileSync(p, JSON.stringify(padrao, null, 2)); return padrao }
  try { return JSON.parse(fs.readFileSync(p, "utf8")) } catch { return padrao }
}
function dbSalvar(arquivo, dados) { fs.writeFileSync(path.join(DATA_DIR, arquivo), JSON.stringify(dados, null, 2)) }

async function reagir(sock, msg, emoji) {
  try { await sock.sendMessage(msg.key.remoteJid, { react: { text: emoji, key: msg.key } }) } catch (_) {}
}

function normalizar(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() }
function fmt(v) { if (typeof v !== "number" || isNaN(v) || !isFinite(v)) return "0"; if (v > 999999999999) v = 999999999999; if (v < 0) v = 0; return Math.floor(v).toLocaleString("pt-BR") }
function soNumero(jid) { if (!jid) return ""; if (typeof jid === "object") jid = jid.phoneNumber || jid.id || ""; return String(jid).split("@")[0].split(":")[0].replace(/\D/g, "") }
function mJid(n) { const x = soNumero(n); if (!x) return null; if (x.length >= 10 && x.length <= 15) return x + "@s.whatsapp.net"; return String(n) }
function formatarTempo(ms) { const s = Math.floor(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60), d = Math.floor(h / 24); if (d > 0) return d + "d " + (h % 24) + "h"; if (h > 0) return h + "h " + (m % 60) + "min"; if (m > 0) return m + "min " + (s % 60) + "s"; return s + "s" }
function sanearNum(v, max = 999999999999) { if (typeof v !== "number" || isNaN(v) || !isFinite(v)) return 0; if (v < 0) return 0; if (v > max) return max; return Math.floor(v) }
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
  const pushName = msg.pushName || "Slime"
  const donoArr = Array.isArray(config && config.dono) ? config.dono : [config && config.dono || "Chefe"]
  const nomeDono = String(donoArr[0] || "Chefe").split("@")[0].split(":")[0].replace(/\D/g, "") || "Chefe"
  const cargo = detectarCargo({ sender, config, db, groupMetadata, isDono, isSubDono, isAdmin })
  const nomeBot = (config && config.nomeBot) || nomeBotDb(db)
  return { pushName, nomeDono, cargo, nomeBot }
}

const lidCache = new Map()
async function resolverNumero(sock, jidGrupo, jid) {
  if (!jid) return ""
  const s = String(jid)
  if (s.endsWith("@s.whatsapp.net")) return soNumero(s)
  if (s.endsWith("@lid") && jidGrupo) {
    const chaveCache = jidGrupo + "|" + s
    if (lidCache.has(chaveCache)) return lidCache.get(chaveCache)
    try {
      const meta = await sock.groupMetadata(jidGrupo)
      const lidNum = soNumero(s)
      const p = meta.participants.find(x => soNumero(x.id) === lidNum || soNumero(x.lid) === lidNum)
      if (p) { if (p.phoneNumber) { const rn = soNumero(p.phoneNumber); lidCache.set(chaveCache, rn); return rn } if (p.id && !String(p.id).endsWith("@lid")) { const rn = soNumero(p.id); lidCache.set(chaveCache, rn); return rn } }
    } catch (_) {}
    return soNumero(s)
  }
  return soNumero(s)
}
async function coletarMembros(sock, jidGrupo) {
  const numeros = new Set()
  try { const meta = await sock.groupMetadata(jidGrupo); for (const p of meta.participants) { if (p.phoneNumber) { const n = soNumero(p.phoneNumber); if (n && n.length >= 10 && n.length <= 15) numeros.add(n) } } } catch (_) {}
  return { numeros }
}

const PETS = [
  { id: "raposa", nome: "Raposa", emoji: "🦊", preco: 700, vip: false, buff: "15% de roubar alguém aleatório a cada 3h", forca: 30, velocidade: 50, rouboAuto: { chance: 0.15, intervalo: 3 * 60 * 60 * 1000 } },
  { id: "onca", nome: "Onça", emoji: "🐆", preco: 1000, vip: false, buff: "+40% de chance em corridapet", forca: 60, velocidade: 70, corridaBonus: 0.40 },
  { id: "ursoPolar", nome: "Urso Polar", emoji: "🐻‍❄️", preco: 1500, vip: false, buff: "+10% sorte em pescar, -15% em pets", forca: 75, velocidade: 40, pescaBonus: 0.10, descontoLoja: 0.15 },
  { id: "unicornio", nome: "Unicórnio", emoji: "🦄", preco: 2000, vip: true, buff: "+10% sorte, +10% proteção, 5% roubo auto 2h", forca: 80, velocidade: 90, sorteBonus: 0.10, protecaoRoubo: 0.10, rouboAuto: { chance: 0.05, intervalo: 2 * 60 * 60 * 1000 }, levelUpBonus: 0.01, trabalharBonus: 0.05 }
]

function acharPet(nome) { const n = normalizar(nome); return PETS.find(p => normalizar(p.nome) === n || p.id === n || normalizar(p.nome).includes(n)) }

const PRECO_PICARETA = 800
const PRECO_VARA = 500
const COOLDOWN_TRABALHO = 60 * 60 * 1000
const COOLDOWN_ROUBO = 30 * 60 * 1000
const COOLDOWN_CRIME = 30 * 60 * 1000
const COOLDOWN_MINERAR = 20 * 60 * 1000
const COOLDOWN_PESCAR = 20 * 60 * 1000
const COOLDOWN_CORRIDA = 15 * 60 * 1000
const COOLDOWN_BATALHA = 20 * 60 * 1000
const COOLDOWN_EXPLORAR = 30 * 60 * 1000
const NIVEL_MIN_EXPLORAR = 3

const MINERIOS = [
  { nome: "Pedra", emoji: "🪨", valor: 20, chance: 0.40 },
  { nome: "Carvão", emoji: "⚫", valor: 50, chance: 0.25 },
  { nome: "Ferro", emoji: "⛓️", valor: 120, chance: 0.18 },
  { nome: "Ouro", emoji: "🥇", valor: 400, chance: 0.10 },
  { nome: "Diamante", emoji: "💎", valor: 1200, chance: 0.06 },
  { nome: "Esmeralda", emoji: "💚", valor: 800, chance: 0.01 }
]
const PEIXES = [
  { nome: "Sardinha", emoji: "🐟", valor: 15, chance: 0.35 },
  { nome: "Tilápia", emoji: "🐠", valor: 40, chance: 0.25 },
  { nome: "Bagre", emoji: "🐡", valor: 90, chance: 0.18 },
  { nome: "Dourado", emoji: "🐟", valor: 250, chance: 0.12 },
  { nome: "Pintado", emoji: "🐟", valor: 500, chance: 0.07 },
  { nome: "Tambaqui", emoji: "🐟", valor: 900, chance: 0.02 },
  { nome: "Peixe Lendário", emoji: "🐉", valor: 3000, chance: 0.01 }
]
const EXPLORAR = [
  { nome: "Floresta Sombria", emoji: "🌲", min: 300, max: 800, xp: 30 },
  { nome: "Caverna Profunda", emoji: "🕳️", min: 500, max: 1500, xp: 50 },
  { nome: "Ruínas Antigas", emoji: "🏛️", min: 800, max: 2000, xp: 70 },
  { nome: "Vulcão Adormecido", emoji: "🌋", min: 1000, max: 3000, xp: 100 },
  { nome: "Templo Perdido", emoji: "⛩️", min: 1500, max: 4000, xp: 120 },
  { nome: "Cidade Abandonada", emoji: "🏚️", min: 600, max: 1800, xp: 60 },
  { nome: "Deserto Infinito", emoji: "🏜️", min: 400, max: 1200, xp: 45 },
  { nome: "Ilha Misteriosa", emoji: "🏝️", min: 2000, max: 5000, xp: 150 }
]

function sortearPorChance(lista) { const r = Math.random(); let acumulado = 0; for (const item of lista) { acumulado += item.chance; if (r <= acumulado) return item } return lista[0] }

function getRpg(num) {
  const r = dbLer("rpg.json", { usuarios: {} })
  r.usuarios = r.usuarios || {}
  r.usuarios[num] = r.usuarios[num] || {}
  const u = r.usuarios[num]
  u.moedas = sanearNum(u.moedas); u.xp = sanearNum(u.xp, 999999); u.nivel = sanearNum(u.nivel, 9999) || 1
  u.ultimoTrabalho = sanearNum(u.ultimoTrabalho); u.ultimoRoubo = sanearNum(u.ultimoRoubo); u.ultimoCrime = sanearNum(u.ultimoCrime)
  u.ultimoMinerar = sanearNum(u.ultimoMinerar); u.ultimoPescar = sanearNum(u.ultimoPescar); u.ultimoCorrida = sanearNum(u.ultimoCorrida)
  u.ultimoBatalha = sanearNum(u.ultimoBatalha); u.ultimoExplorar = sanearNum(u.ultimoExplorar)
  u.temPicareta = u.temPicareta || false; u.temVara = u.temVara || false
  u.pet = u.pet || null; u.petGrupo = u.petGrupo || null
  u.petFome = u.petFome ?? 100; u.petSede = u.petSede ?? 100; u.petFelicidade = u.petFelicidade ?? 100
  u.petVida = u.petVida ?? 100; u.petVidaMax = u.petVidaMax ?? 100
  u.ultimoRouboPet = sanearNum(u.ultimoRouboPet); u.daily = u.daily || 0
  return { r, u }
}
function salvarRpg(r) { dbSalvar("rpg.json", r) }
function ehVip(db, sender, isDono, isSubDono) { if (isDono || isSubDono) return true; const num = soNumero(sender); const v = (db.vips() || {}).vips || {}; for (const [jidVip, info] of Object.entries(v)) { const n = soNumero(jidVip); if (n === num && (info.expira === "inf" || info.expira > Date.now())) return true } return false }
function xpNecessario(nivel) { return Math.floor(100 * Math.pow(1.5, nivel - 1)) }
function ganharXp(u, qtd) { u.xp = sanearNum((u.xp || 0) + qtd, 999999); let subiu = 0; while (u.xp >= xpNecessario(u.nivel) && subiu < 100) { u.xp -= xpNecessario(u.nivel); u.nivel++; subiu++ } return subiu }
function precoComDesconto(preco, temUrso) { if (!temUrso) return preco; return Math.floor(preco * 0.85) }

module.exports = {
  menu: "menu-rpg",
  grupoOnly: false,
  adminOnly: false,
  donoOnly: false,

  async rendaAutomatica(sock, db) {
    const r = dbLer("rpg.json", { usuarios: {} })
    let alterou = false
    const agora = Date.now()
    for (const [num, u] of Object.entries(r.usuarios || {})) {
      if (!u.pet) continue
      const petInfo = PETS.find(p => p.id === u.pet)
      if (!petInfo || !petInfo.rouboAuto) continue
      if ((agora - (u.ultimoRouboPet || 0)) < petInfo.rouboAuto.intervalo) continue
      const grupoPet = u.petGrupo
      if (!grupoPet) continue
      const grupos = db.grupos()
      if (grupos[grupoPet]?.rpgAtivo !== true) continue
      const { numeros } = await coletarMembros(sock, grupoPet)
      const membrosArr = Array.from(numeros)
      const vitimas = membrosArr.filter(n => n !== num).map(n => ({ num: n, u: r.usuarios[n] })).filter(x => x.u && sanearNum(x.u.moedas) > 100 && x.u.pet !== "unicornio")
      if (!vitimas.length) continue
      const vitima = vitimas[Math.floor(Math.random() * vitimas.length)]
      const moedasVitima = sanearNum(vitima.u.moedas)
      const roubado = Math.min(Math.floor(moedasVitima * (petInfo.rouboAuto.chance > 0.10 ? 0.12 : 0.08)), 10000)
      if (roubado <= 0) continue
      vitima.u.moedas = sanearNum(moedasVitima - roubado)
      r.usuarios[num].moedas = sanearNum(sanearNum(r.usuarios[num].moedas) + roubado)
      r.usuarios[num].ultimoRouboPet = agora
      r.usuarios[num].petFome = Math.min(100, sanearNum(r.usuarios[num].petFome) + 20)
      alterou = true
      try { await sock.sendMessage(grupoPet, { text: `💧 ${petInfo.emoji} *${petInfo.nome}* de @${num} roubou *${fmt(roubado)} gold* de @${vitima.num}!`, mentions: [mJid(num), mJid(vitima.num)] }) } catch (_) {}
    }
    if (alterou) salvarRpg(r)
  },

  commands: {

    menurpg: {
      aliases: ["comandosrpg", "menur"],
      async executar({ sock, msg, prefixoAtivo, db, sender, config, isDono, isSubDono, isAdmin, groupMetadata }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "!"
        const cfg = db.config()
        const { pushName, nomeDono, cargo, nomeBot } = getCargoETexto({ sender, config, db, groupMetadata, isDono, isSubDono, isAdmin, msg })
        await reagir(sock, msg, "💧")
        const texto = `${cardPerfil({ nomeBot, nomeUsuario: pushName, cargo, dono: nomeDono })}

${secao("💰 ᴇᴄᴏɴᴏᴍɪᴀ")}
${item("!daily / !trabalhar")}
${item("!cassino <valor>")}
${item("!crime / !roubar @user")}

${secao("⛏️ ғᴇʀʀᴀᴍᴇɴᴛᴀs")}
${item("!comprarpicareta / !minerar")}
${item("!comprarvara / !pescar")}

${secao("🗺️ ᴇxᴘʟᴏʀᴀᴄ̧ᴀ̃ᴏ (Nv.3+)")}
${item("!explorar")}

${secao("🐾 ᴘᴇᴛs")}
${item("!lojapet / !comprarpet <nome>")}
${item("!meupet / !alimentarpet / !curarpet")}
${item("!batalhapet @user")}
${item("!corridapet @user")}
${item("!venderpet / !doarpet")}

${secao("👤 ᴘᴇʀғɪʟ")}
${item("!perfil / !rank")}

${secao("💤 ᴀғᴋ")}
${item("!afk <motivo>")}

💧 Prefixo: \`${p}\`

"${nomeBot}"`
        if (cfg.fotoMenu) { const buf = Buffer.from(cfg.fotoMenu, "base64"); if (cfg.tipoMenu === "video") return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "rimuru.mp4", gifPlayback: true, caption: texto }, { quoted: msg }); return sock.sendMessage(jid, { image: buf, caption: texto }, { quoted: msg }) }
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    rpg: {
      aliases: ["rpgativo", "ativarrpg", "rpgonoff"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) {
          const g = db.grupos(); const ativo = g[jid]?.rpgAtivo === true
          await reagir(sock, msg, "❄️")
          return sock.sendMessage(jid, { text: `💧 • 𝐑𝐏𝐆 •\n\n❄️ Status: ${ativo ? "ON ✅" : "OFF ❌"}\n🧊 \`!rpg on/off\`\n\n"${nomeBot}"` }, { quoted: msg })
        }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].rpgAtivo = opcao === "on"; db.salvarGrupos(g)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐑𝐏𝐆 •\n\n❄️ ${opcao.toUpperCase()}\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    daily: { aliases: ["diario"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { r, u } = getRpg(num)
      const hoje = new Date().toISOString().slice(0, 10)
      if (u.daily === hoje) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐃𝐀𝐈𝐋𝐘 •\n\n❄️ Você já pegou hoje.\n\n"${nomeBot}"` }, { quoted: msg }) }
      await reagir(sock, msg, "💧")
      let valor = 200 + u.nivel * 50; let extra = ""
      if (u.pet === "unicornio" && Math.random() < 0.01) { const s = ganharXp(u, xpNecessario(u.nivel)); valor += 500; extra = `\n\n🦄 Bônus Unicórnio! +${s} nível, +500 gold` }
      u.moedas = sanearNum(u.moedas + valor); u.daily = hoje
      const subiuNivel = ganharXp(u, 25); salvarRpg(r)
      await sock.sendMessage(jid, { text: `💧 • 𝐃𝐀𝐈𝐋𝐘 •\n\n❄️ Recompensa coletada\n🧊 +${fmt(valor)} gold\n🧊 +25 XP${subiuNivel ? `\n🧊 ⬆️ Subiu ${subiuNivel} nível!` : ""}${extra}\n\n"${nomeBot}"`, mentions: [mJid(num)] }, { quoted: msg })
    }},

    trabalhar: { aliases: ["work", "trampar"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { r, u } = getRpg(num)
      const cooldown = COOLDOWN_TRABALHO - (Date.now() - u.ultimoTrabalho)
      if (cooldown > 0) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐓𝐑𝐀𝐁𝐀𝐋𝐇𝐎 •\n\n❄️ Espere ${formatarTempo(cooldown)}\n\n"${nomeBot}"` }, { quoted: msg }) }
      await reagir(sock, msg, "💧")
      const trabalhos = ["entregador", "pedreiro", "motoqueiro", "vendedor", "programador", "garçom", "motorista"]
      const trabalho = trabalhos[Math.floor(Math.random() * trabalhos.length)]
      let salario = 100 + u.nivel * 30 + Math.floor(Math.random() * 100); let bonus = ""
      if (u.pet === "unicornio") { salario = Math.floor(salario * 1.05); bonus = "\n🦄 Bônus: +5%" }
      u.moedas = sanearNum(u.moedas + salario); u.ultimoTrabalho = Date.now()
      const subiu = ganharXp(u, 15); salvarRpg(r)
      await sock.sendMessage(jid, { text: `💧 • 𝐓𝐑𝐀𝐁𝐀𝐋𝐇𝐎 •\n\n❄️ ${trabalho}\n🧊 +${fmt(salario)} gold${bonus}\n🧊 +15 XP${subiu ? `\n🧊 ⬆️ Subiu ${subiu} nível!` : ""}\n\n"${nomeBot}"`, mentions: [mJid(num)] }, { quoted: msg })
    }},

    cassino: { aliases: ["bet", "apostar"], async executar({ sock, msg, args, db, utils, sender }) {
      const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { r, u } = getRpg(num)
      const valor = Math.floor(parseInt(args[0]) || 0)
      if (!valor || valor <= 0) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐂𝐀𝐒𝐒𝐈𝐍𝐎 •\n\n❄️ Informe o valor.\n🧊 \`!cassino <valor>\`\n\n"${nomeBot}"` }, { quoted: msg }) }
      if (valor > u.moedas) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐂𝐀𝐒𝐒𝐈𝐍𝐎 •\n\n❄️ Você só tem ${fmt(u.moedas)} gold.\n\n"${nomeBot}"` }, { quoted: msg }) }
      await reagir(sock, msg, "💧")
      const ganhou = Math.random() < 0.48; const emoji = ["🎰", "🎲", "🃏"][Math.floor(Math.random() * 3)]
      if (ganhou) { u.moedas = sanearNum(u.moedas + valor); ganharXp(u, 10); salvarRpg(r); await sock.sendMessage(jid, { text: `${emoji} • 𝐆𝐀𝐍𝐇𝐎𝐔 •\n\n❄️ A sorte sorriu!\n🧊 +${fmt(valor)}\n🧊 Total: ${fmt(u.moedas)}\n\n"${nomeBot}"`, mentions: [mJid(num)] }, { quoted: msg }) }
      else { u.moedas = sanearNum(u.moedas - valor); salvarRpg(r); await sock.sendMessage(jid, { text: `${emoji} • 𝐏𝐄𝐑𝐃𝐄𝐔 •\n\n❄️ A sorte não estava do seu lado.\n🧊 -${fmt(valor)}\n🧊 Total: ${fmt(u.moedas)}\n\n"${nomeBot}"`, mentions: [mJid(num)] }, { quoted: msg }) }
    }},

    roubar: { aliases: ["assaltar", "roub4r"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const alvo = utils.getAlvo(msg)
      if (!alvo) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐑𝐎𝐔𝐁𝐀𝐑 •\n\n❄️ Marque um usuário.\n🧊 \`!roubar @user\`\n\n"${nomeBot}"` }, { quoted: msg }) }
      const numReal = await resolverNumero(sock, jid, sender); const numAlvoReal = await resolverNumero(sock, jid, alvo)
      if (!numReal || !numAlvoReal) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐑𝐎𝐔𝐁𝐀𝐑 •\n\n❄️ Não identifiquei.\n\n"${nomeBot}"` }, { quoted: msg }) }
      if (numAlvoReal === numReal) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐑𝐎𝐔𝐁𝐀𝐑 •\n\n❄️ Não pode roubar você mesmo.\n\n"${nomeBot}"` }, { quoted: msg }) }
      const { r, u } = getRpg(numReal); const { r: rAlvo, u: uAlvo } = getRpg(numAlvoReal)
      const cooldown = COOLDOWN_ROUBO - (Date.now() - u.ultimoRoubo)
      if (cooldown > 0) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐑𝐎𝐔𝐁𝐀𝐑 •\n\n❄️ Espere ${formatarTempo(cooldown)}\n\n"${nomeBot}"` }, { quoted: msg }) }
      if (uAlvo.moedas < 100) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐑𝐎𝐔𝐁𝐀𝐑 •\n\n❄️ @${numAlvoReal} é pobre demais.\n\n"${nomeBot}"`, mentions: [mJid(numAlvoReal)] }, { quoted: msg }) }
      u.ultimoRoubo = Date.now()
      let chance = 0.45; if (uAlvo.pet === "unicornio") chance -= 0.10
      const sucesso = Math.random() < chance
      const valor = Math.min(Math.floor(uAlvo.moedas * (0.10 + Math.random() * 0.15)), 10000)
      await reagir(sock, msg, "💧")
      if (sucesso) { u.moedas = sanearNum(u.moedas + valor); uAlvo.moedas = sanearNum(uAlvo.moedas - valor); ganharXp(u, 20); salvarRpg(r); salvarRpg(rAlvo); await sock.sendMessage(jid, { text: `💧 • 𝐑𝐎𝐔𝐁𝐎 𝐁𝐄𝐌-𝐒𝐔𝐂𝐄𝐃𝐈𝐃𝐎 •\n\n❄️ O Predador atacou\n🧊 Ladrão: @${numReal}\n🧊 Alvo: @${numAlvoReal}\n🧊 +${fmt(valor)} gold\n\n"${nomeBot}"`, mentions: [mJid(numReal), mJid(numAlvoReal)] }, { quoted: msg }) }
      else { const multa = Math.floor(valor * 0.5); u.moedas = sanearNum(Math.max(0, u.moedas - multa)); salvarRpg(r); await sock.sendMessage(jid, { text: `💧 • 𝐑𝐎𝐔𝐁𝐎 𝐅𝐀𝐋𝐇𝐎𝐔 •\n\n❄️ A guarda de Tempest te pegou\n🧊 -${fmt(multa)} gold\n\n"${nomeBot}"`, mentions: [mJid(numReal), mJid(numAlvoReal)] }, { quoted: msg }) }
    }},

    crime: { aliases: ["crimeurbano"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { r, u } = getRpg(num)
      const cooldown = COOLDOWN_CRIME - (Date.now() - u.ultimoCrime)
      if (cooldown > 0) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐂𝐑𝐈𝐌𝐄 •\n\n❄️ Espere ${formatarTempo(cooldown)}\n\n"${nomeBot}"` }, { quoted: msg }) }
      await reagir(sock, msg, "💧")
      u.ultimoCrime = Date.now()
      const crimes = [{ nome: "Assalto a banco", min: 500, max: 2000, risco: 0.55 }, { nome: "Roubo de carro", min: 200, max: 800, risco: 0.40 }, { nome: "Tráfico", min: 300, max: 1500, risco: 0.50 }, { nome: "Contrabando", min: 400, max: 1800, risco: 0.45 }, { nome: "Furto de loja", min: 100, max: 500, risco: 0.25 }]
      const crime = crimes[Math.floor(Math.random() * crimes.length)]
      const ganhou = Math.random() > crime.risco
      if (ganhou) { const valor = Math.floor(crime.min + Math.random() * (crime.max - crime.min)); u.moedas = sanearNum(u.moedas + valor); ganharXp(u, 25); salvarRpg(r); await sock.sendMessage(jid, { text: `💧 • ${crime.nome.toUpperCase()} •\n\n❄️ Executado\n🧊 +${fmt(valor)} gold\n\n"${nomeBot}"`, mentions: [mJid(num)] }, { quoted: msg }) }
      else { const multa = Math.floor(crime.min * 1.5); u.moedas = sanearNum(Math.max(0, u.moedas - multa)); salvarRpg(r); await sock.sendMessage(jid, { text: `💧 • ${crime.nome.toUpperCase()} •\n\n❄️ Você foi pego\n🧊 -${fmt(multa)} gold\n\n"${nomeBot}"`, mentions: [mJid(num)] }, { quoted: msg }) }
    }},

    comprarpicareta: { aliases: ["buypicareta", "picareta"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { r, u } = getRpg(num)
      if (u.temPicareta) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐏𝐈𝐂𝐀𝐑𝐄𝐓𝐀 •\n\n❄️ Você já tem.\n\n"${nomeBot}"` }, { quoted: msg }) }
      if (u.moedas < PRECO_PICARETA) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐏𝐈𝐂𝐀𝐑𝐄𝐓𝐀 •\n\n❄️ Faltam ${fmt(PRECO_PICARETA - u.moedas)} gold.\n\n"${nomeBot}"` }, { quoted: msg }) }
      u.moedas = sanearNum(u.moedas - PRECO_PICARETA); u.temPicareta = true; salvarRpg(r)
      await reagir(sock, msg, "💧")
      await sock.sendMessage(jid, { text: `💧 • 𝐏𝐈𝐂𝐀𝐑𝐄𝐓𝐀 •\n\n❄️ Adquirida\n🧊 -${fmt(PRECO_PICARETA)} gold\n\n"${nomeBot}"`, mentions: [mJid(num)] }, { quoted: msg })
    }},

    minerar: { aliases: ["mine", "mineracao"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { r, u } = getRpg(num)
      if (!u.temPicareta) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐌𝐈𝐍𝐄𝐑𝐀𝐑 •\n\n❄️ Precisa de picareta.\n\n"${nomeBot}"` }, { quoted: msg }) }
      const cooldown = COOLDOWN_MINERAR - (Date.now() - u.ultimoMinerar)
      if (cooldown > 0) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐌𝐈𝐍𝐄𝐑𝐀𝐑 •\n\n❄️ Espere ${formatarTempo(cooldown)}\n\n"${nomeBot}"` }, { quoted: msg }) }
      await reagir(sock, msg, "💧")
      u.ultimoMinerar = Date.now()
      const minerio = sortearPorChance(MINERIOS)
      u.moedas = sanearNum(u.moedas + minerio.valor); ganharXp(u, 10); salvarRpg(r)
      await sock.sendMessage(jid, { text: `💧 • 𝐌𝐈𝐍𝐄𝐑𝐀𝐂̧𝐀̃𝐎 •\n\n❄️ Minério encontrado\n🧊 ${minerio.emoji} ${minerio.nome}\n🧊 +${fmt(minerio.valor)} gold\n\n"${nomeBot}"`, mentions: [mJid(num)] }, { quoted: msg })
    }},

    comprarvara: { aliases: ["buyvara", "vara"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { r, u } = getRpg(num)
      if (u.temVara) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐕𝐀𝐑𝐀 •\n\n❄️ Você já tem.\n\n"${nomeBot}"` }, { quoted: msg }) }
      if (u.moedas < PRECO_VARA) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐕𝐀𝐑𝐀 •\n\n❄️ Faltam ${fmt(PRECO_VARA - u.moedas)} gold.\n\n"${nomeBot}"` }, { quoted: msg }) }
      u.moedas = sanearNum(u.moedas - PRECO_VARA); u.temVara = true; salvarRpg(r)
      await reagir(sock, msg, "💧")
      await sock.sendMessage(jid, { text: `💧 • 𝐕𝐀𝐑𝐀 •\n\n❄️ Adquirida\n🧊 -${fmt(PRECO_VARA)} gold\n\n"${nomeBot}"`, mentions: [mJid(num)] }, { quoted: msg })
    }},

    pescar: { aliases: ["pesca", "fish"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { r, u } = getRpg(num)
      if (!u.temVara) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐏𝐄𝐒𝐂𝐀𝐑 •\n\n❄️ Precisa de vara.\n\n"${nomeBot}"` }, { quoted: msg }) }
      const cooldown = COOLDOWN_PESCAR - (Date.now() - u.ultimoPescar)
      if (cooldown > 0) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐏𝐄𝐒𝐂𝐀𝐑 •\n\n❄️ Espere ${formatarTempo(cooldown)}\n\n"${nomeBot}"` }, { quoted: msg }) }
      await reagir(sock, msg, "💧")
      u.ultimoPescar = Date.now()
      const peixe = sortearPorChance(PEIXES); let valor = peixe.valor; let bonus = ""
      if (u.pet === "ursoPolar") { valor = Math.floor(valor * 1.10); bonus = "\n🐻‍❄️ Bônus: +10%" }
      u.moedas = sanearNum(u.moedas + valor); ganharXp(u, 12); salvarRpg(r)
      await sock.sendMessage(jid, { text: `💧 • 𝐏𝐄𝐒𝐂𝐀𝐑𝐈𝐀 •\n\n❄️ Peixe fisgado\n🧊 ${peixe.emoji} ${peixe.nome}\n🧊 +${fmt(valor)} gold${bonus}\n\n"${nomeBot}"`, mentions: [mJid(num)] }, { quoted: msg })
    }},

    lojapet: { aliases: ["petshop", "lojapets"], async executar({ sock, msg, db, utils, sender, isDono, isSubDono }) {
      const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { u } = getRpg(num)
      const temUrso = u.pet === "ursoPolar"; const ehVipUser = ehVip(db, sender, isDono, isSubDono)
      await reagir(sock, msg, "💧")
      let txt = `💧 • 𝐋𝐎𝐉𝐀 𝐏𝐄𝐓𝐒 •\n\n❄️ Animais disponíveis:\n\n`
      for (const pet of PETS) { const preco = precoComDesconto(pet.preco, temUrso && pet.id !== "unicornio"); const tag = pet.vip ? " ❄️VIP" : ""; txt += `🧊 ${pet.emoji} ${pet.nome}${tag}\n🧊 💰 ${fmt(preco)} gold\n🧊 ${pet.buff}\n\n` }
      if (temUrso) txt += "🐻‍❄️ Urso Polar: -15% em todos!\n"
      if (ehVipUser) txt += "❄️ Você é VIP!\n"
      txt += `\n🧊 \`!comprarpet <nome>\`\n\n"${nomeBot}"`
      await sock.sendMessage(jid, { text: txt }, { quoted: msg })
    }},

    comprarpet: { aliases: ["buypet", "adotarpet"], async executar({ sock, msg, args, db, utils, sender, isDono, isSubDono }) {
      const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { r, u } = getRpg(num)
      if (u.pet) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐏𝐄𝐓 •\n\n❄️ Você já tem pet.\n\n"${nomeBot}"` }, { quoted: msg }) }
      const pet = acharPet(args.join(" "))
      if (!pet) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐏𝐄𝐓 •\n\n❄️ Pet não encontrado.\n🧊 Veja !lojapet\n\n"${nomeBot}"` }, { quoted: msg }) }
      if (pet.vip && !ehVip(db, sender, isDono, isSubDono)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐏𝐄𝐓 •\n\n❄️ ${pet.nome} é VIP.\n\n"${nomeBot}"` }, { quoted: msg }) }
      const preco = precoComDesconto(pet.preco, u.pet === "ursoPolar" && pet.id !== "unicornio")
      if (u.moedas < preco) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐏𝐄𝐓 •\n\n❄️ Faltam ${fmt(preco - u.moedas)} gold.\n\n"${nomeBot}"` }, { quoted: msg }) }
      u.moedas = sanearNum(u.moedas - preco); u.pet = pet.id; u.petGrupo = jid.endsWith("@g.us") ? jid : null
      u.petFome = 100; u.petSede = 100; u.petFelicidade = 100
      u.petVida = pet.forca * 10; u.petVidaMax = pet.forca * 10; u.ultimoRouboPet = Date.now(); salvarRpg(r)
      await reagir(sock, msg, "💧")
      await sock.sendMessage(jid, { text: `💧 • 𝐏𝐄𝐓 •\n\n❄️ Adotado!\n🧊 ${pet.emoji} ${pet.nome}\n🧊 -${fmt(preco)} gold\n🧊 ${pet.buff}\n\n"${nomeBot}"`, mentions: [mJid(num)] }, { quoted: msg })
    }},

    meupet: { aliases: ["pet", "statuspet"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { u } = getRpg(num)
      if (!u.pet) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐌𝐄𝐔 𝐏𝐄𝐓 •\n\n❄️ Você não tem pet.\n\n"${nomeBot}"` }, { quoted: msg }) }
      const pet = PETS.find(p => p.id === u.pet)
      if (!pet) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐌𝐄𝐔 𝐏𝐄𝐓 •\n\n❄️ Pet corrompido.\n\n"${nomeBot}"` }, { quoted: msg }) }
      const barra = (v) => { const c = Math.max(0, Math.min(10, Math.round(v / 10))); return "💧".repeat(c) + "⬛".repeat(10 - c) }
      const ic = (v) => v > 70 ? "✅" : v > 40 ? "❄️" : "🧊"
      await reagir(sock, msg, "💧")
      await sock.sendMessage(jid, { text: `💧 • 𝐌𝐄𝐔 𝐏𝐄𝐓 ${pet.emoji} •\n\n❄️ ${pet.nome}\n🧊 @${num}\n\n🧊 Fome: ${ic(u.petFome)} ${u.petFome}%\n${barra(u.petFome)}\n\n🧊 Sede: ${ic(u.petSede)} ${u.petSede}%\n${barra(u.petSede)}\n\n🧊 Felicidade: ${ic(u.petFelicidade)} ${u.petFelicidade}%\n${barra(u.petFelicidade)}\n\n🧊 Vida: ${ic(u.petVida / u.petVidaMax * 100)} ${u.petVida}/${u.petVidaMax}\n${barra(u.petVida / u.petVidaMax * 100)}\n\n🧊 Força: ${pet.forca}\n🧊 Velocidade: ${pet.velocidade}\n\n"${nomeBot}"`, mentions: [mJid(num)] }, { quoted: msg })
    }},

    alimentarpet: { aliases: ["feedpet", "darpet"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { r, u } = getRpg(num)
      if (!u.pet) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐀𝐋𝐈𝐌𝐄𝐍𝐓𝐀𝐑 •\n\n❄️ Você não tem pet.\n\n"${nomeBot}"` }, { quoted: msg }) }
      const custo = 50
      if (u.moedas < custo) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐀𝐋𝐈𝐌𝐄𝐍𝐓𝐀𝐑 •\n\n❄️ Precisa ${fmt(custo)} gold.\n\n"${nomeBot}"` }, { quoted: msg }) }
      u.moedas = sanearNum(u.moedas - custo); u.petFome = Math.min(100, u.petFome + 30); u.petSede = Math.min(100, u.petSede + 20); u.petFelicidade = Math.min(100, u.petFelicidade + 10); salvarRpg(r)
      await reagir(sock, msg, "💧")
      const pet = PETS.find(p => p.id === u.pet)
      await sock.sendMessage(jid, { text: `💧 • 𝐏𝐄𝐓 𝐀𝐋𝐈𝐌𝐄𝐍𝐓𝐀𝐃𝐎 •\n\n❄️ ${pet.emoji} ${pet.nome}\n🧊 Fome: ${u.petFome}%\n🧊 Sede: ${u.petSede}%\n🧊 -${fmt(custo)} gold\n\n"${nomeBot}"`, mentions: [mJid(num)] }, { quoted: msg })
    }},

    curarpet: { aliases: ["healpet", "curar"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { r, u } = getRpg(num)
      if (!u.pet) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐂𝐔𝐑𝐀𝐑 •\n\n❄️ Você não tem pet.\n\n"${nomeBot}"` }, { quoted: msg }) }
      if (u.petVida >= u.petVidaMax) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐂𝐔𝐑𝐀𝐑 •\n\n❄️ Vida cheia.\n\n"${nomeBot}"` }, { quoted: msg }) }
      const custo = (u.petVidaMax - u.petVida) * 3
      if (u.moedas < custo) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐂𝐔𝐑𝐀𝐑 •\n\n❄️ Precisa ${fmt(custo)} gold.\n\n"${nomeBot}"` }, { quoted: msg }) }
      u.moedas = sanearNum(u.moedas - custo); u.petVida = u.petVidaMax; salvarRpg(r)
      await reagir(sock, msg, "💧")
      const pet = PETS.find(p => p.id === u.pet)
      await sock.sendMessage(jid, { text: `💧 • 𝐏𝐄𝐓 𝐂𝐔𝐑𝐀𝐃𝐎 •\n\n❄️ ${pet.emoji} ${pet.nome}\n🧊 Vida: ${u.petVida}/${u.petVidaMax}\n🧊 -${fmt(custo)} gold\n\n"${nomeBot}"`, mentions: [mJid(num)] }, { quoted: msg })
    }},

    venderpet: { aliases: ["sellpet"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { r, u } = getRpg(num)
      if (!u.pet) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐕𝐄𝐍𝐃𝐄𝐑 •\n\n❄️ Você não tem pet.\n\n"${nomeBot}"` }, { quoted: msg }) }
      const pet = PETS.find(p => p.id === u.pet)
      if (pet.vip) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐕𝐄𝐍𝐃𝐄𝐑 •\n\n❄️ Pets VIP não podem ser vendidos.\n\n"${nomeBot}"` }, { quoted: msg }) }
      const valor = Math.floor(pet.preco * 0.6); u.moedas = sanearNum(u.moedas + valor); u.pet = null; u.petGrupo = null; salvarRpg(r)
      await reagir(sock, msg, "💧")
      await sock.sendMessage(jid, { text: `💧 • 𝐏𝐄𝐓 𝐕𝐄𝐍𝐃𝐈𝐃𝐎 •\n\n❄️ ${pet.emoji} ${pet.nome}\n🧊 +${fmt(valor)} gold\n\n"${nomeBot}"`, mentions: [mJid(num)] }, { quoted: msg })
    }},

    doarpet: { aliases: ["givepet", "presentepet"], async executar({ sock, msg, args, db, utils, sender }) {
      const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const alvo = utils.getAlvo(msg)
      if (!alvo) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐃𝐎𝐀𝐑 •\n\n❄️ Marque um usuário.\n🧊 \`!doarpet @user\`\n\n"${nomeBot}"` }, { quoted: msg }) }
      const numReal = await resolverNumero(sock, jid, sender); const numAlvoReal = await resolverNumero(sock, jid, alvo)
      if (!numReal || !numAlvoReal) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐃𝐎𝐀𝐑 •\n\n❄️ Não identifiquei.\n\n"${nomeBot}"` }, { quoted: msg }) }
      if (numAlvoReal === numReal) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐃𝐎𝐀𝐑 •\n\n❄️ Não pode doar pra você.\n\n"${nomeBot}"` }, { quoted: msg }) }
      const { r, u } = getRpg(numReal); const { r: rAlvo, u: uAlvo } = getRpg(numAlvoReal)
      if (!u.pet) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐃𝐎𝐀𝐑 •\n\n❄️ Você não tem pet.\n\n"${nomeBot}"` }, { quoted: msg }) }
      if (uAlvo.pet) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐃𝐎𝐀𝐑 •\n\n❄️ @${numAlvoReal} já tem pet.\n\n"${nomeBot}"`, mentions: [mJid(numAlvoReal)] }, { quoted: msg }) }
      const pet = PETS.find(p => p.id === u.pet)
      if (pet.vip) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐃𝐎𝐀𝐑 •\n\n❄️ Pets VIP não podem ser doados.\n\n"${nomeBot}"` }, { quoted: msg }) }
      uAlvo.pet = pet.id; uAlvo.petGrupo = u.petGrupo; uAlvo.petFome = u.petFome; uAlvo.petSede = u.petSede; uAlvo.petFelicidade = u.petFelicidade; uAlvo.petVida = u.petVida; uAlvo.petVidaMax = u.petVidaMax; uAlvo.ultimoRouboPet = Date.now(); u.pet = null; u.petGrupo = null
      salvarRpg(r); salvarRpg(rAlvo)
      await reagir(sock, msg, "💧")
      await sock.sendMessage(jid, { text: `💧 • 𝐏𝐄𝐓 𝐃𝐎𝐀𝐃𝐎 •\n\n❄️ ${pet.emoji} ${pet.nome}\n🧊 De: @${numReal}\n🧊 Para: @${numAlvoReal}\n\n"${nomeBot}"`, mentions: [mJid(numReal), mJid(numAlvoReal)] }, { quoted: msg })
    }},

    batalhapet: { aliases: ["batalhar", "petbatalha"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const alvo = utils.getAlvo(msg)
      if (!alvo) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐁𝐀𝐓𝐀𝐋𝐇𝐀 •\n\n❄️ Marque um usuário.\n\n"${nomeBot}"` }, { quoted: msg }) }
      const numReal = await resolverNumero(sock, jid, sender); const numAlvoReal = await resolverNumero(sock, jid, alvo)
      if (!numReal || !numAlvoReal) { await reagir(sock, msg, "🧊"); return }
      if (numAlvoReal === numReal) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐁𝐀𝐓𝐀𝐋𝐇𝐀 •\n\n❄️ Não pode batalhar consigo.\n\n"${nomeBot}"` }, { quoted: msg }) }
      const { r, u } = getRpg(numReal); const { r: rAlvo, u: uAlvo } = getRpg(numAlvoReal)
      if (!u.pet || !uAlvo.pet) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐁𝐀𝐓𝐀𝐋𝐇𝐀 •\n\n❄️ Um dos dois não tem pet.\n\n"${nomeBot}"` }, { quoted: msg }) }
      const cooldown = COOLDOWN_BATALHA - (Date.now() - u.ultimoBatalha)
      if (cooldown > 0) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐁𝐀𝐓𝐀𝐋𝐇𝐀 •\n\n❄️ Espere ${formatarTempo(cooldown)}\n\n"${nomeBot}"` }, { quoted: msg }) }
      u.ultimoBatalha = Date.now()
      const pet1 = PETS.find(p => p.id === u.pet); const pet2 = PETS.find(p => p.id === uAlvo.pet)
      const f1 = pet1.forca * (u.petVida / u.petVidaMax) * (u.petFome / 100); const f2 = pet2.forca * (uAlvo.petVida / uAlvo.petVidaMax) * (uAlvo.petFome / 100)
      const chance1 = f1 / (f1 + f2); const venceu = Math.random() < chance1; const premio = 100
      await reagir(sock, msg, "💧")
      if (venceu) { const dano = Math.floor(uAlvo.petVidaMax * 0.3); uAlvo.petVida = Math.max(0, uAlvo.petVida - dano); u.moedas = sanearNum(u.moedas + premio); ganharXp(u, 20); salvarRpg(r); salvarRpg(rAlvo); await sock.sendMessage(jid, { text: `💧 • 𝐁𝐀𝐓𝐀𝐋𝐇𝐀 •\n\n❄️ ${pet1.emoji} @${numReal} VS ${pet2.emoji} @${numAlvoReal}\n🧊 Vencedor: @${numReal}\n🧊 +${premio} gold\n\n"${nomeBot}"`, mentions: [mJid(numReal), mJid(numAlvoReal)] }, { quoted: msg }) }
      else { const dano = Math.floor(u.petVidaMax * 0.3); u.petVida = Math.max(0, u.petVida - dano); uAlvo.moedas = sanearNum(uAlvo.moedas + premio); ganharXp(uAlvo, 20); salvarRpg(r); salvarRpg(rAlvo); await sock.sendMessage(jid, { text: `💧 • 𝐁𝐀𝐓𝐀𝐋𝐇𝐀 •\n\n❄️ ${pet1.emoji} @${numReal} VS ${pet2.emoji} @${numAlvoReal}\n🧊 Vencedor: @${numAlvoReal}\n🧊 +${premio} gold\n\n"${nomeBot}"`, mentions: [mJid(numReal), mJid(numAlvoReal)] }, { quoted: msg }) }
    }},

    corridapet: { aliases: ["corrida", "racepet"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const alvo = utils.getAlvo(msg)
      if (!alvo) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 • 𝐂𝐎𝐑𝐑𝐈𝐃𝐀 •\n\n❄️ Marque um usuário.\n\n"${nomeBot}"` }, { quoted: msg }) }
      const numReal = await resolverNumero(sock, jid, sender); const numAlvoReal = await resolverNumero(sock, jid, alvo)
      if (!numReal || !numAlvoReal) { await reagir(sock, msg, "🧊"); return }
      if (numAlvoReal === numReal) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐂𝐎𝐑𝐑𝐈𝐃𝐀 •\n\n❄️ Não pode correr consigo.\n\n"${nomeBot}"` }, { quoted: msg }) }
      const { r, u } = getRpg(numReal); const { r: rAlvo, u: uAlvo } = getRpg(numAlvoReal)
      if (!u.pet || !uAlvo.pet) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐂𝐎𝐑𝐑𝐈𝐃𝐀 •\n\n❄️ Um dos dois não tem pet.\n\n"${nomeBot}"` }, { quoted: msg }) }
      const cooldown = COOLDOWN_CORRIDA - (Date.now() - u.ultimoCorrida)
      if (cooldown > 0) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐂𝐎𝐑𝐑𝐈𝐃𝐀 •\n\n❄️ Espere ${formatarTempo(cooldown)}\n\n"${nomeBot}"` }, { quoted: msg }) }
      u.ultimoCorrida = Date.now()
      const pet1 = PETS.find(p => p.id === u.pet); const pet2 = PETS.find(p => p.id === uAlvo.pet)
      let b1 = 0, b2 = 0; if (pet1.corridaBonus) b1 = pet1.corridaBonus; if (pet2.corridaBonus) b2 = pet2.corridaBonus
      const v1 = pet1.velocidade + b1 * 100; const v2 = pet2.velocidade + b2 * 100
      const chance1 = v1 / (v1 + v2); const venceu = Math.random() < chance1; const premio = 150
      await reagir(sock, msg, "💧")
      if (venceu) { u.moedas = sanearNum(u.moedas + premio); ganharXp(u, 15); salvarRpg(r); await sock.sendMessage(jid, { text: `💧 • 𝐂𝐎𝐑𝐑𝐈𝐃𝐀 •\n\n❄️ ${pet1.emoji} @${numReal} VS ${pet2.emoji} @${numAlvoReal}\n🧊 Vencedor: @${numReal}\n🧊 +${premio} gold\n\n"${nomeBot}"`, mentions: [mJid(numReal), mJid(numAlvoReal)] }, { quoted: msg }) }
      else { uAlvo.moedas = sanearNum(uAlvo.moedas + premio); ganharXp(uAlvo, 15); salvarRpg(rAlvo); await sock.sendMessage(jid, { text: `💧 • 𝐂𝐎𝐑𝐑𝐈𝐃𝐀 •\n\n❄️ ${pet1.emoji} @${numReal} VS ${pet2.emoji} @${numAlvoReal}\n🧊 Vencedor: @${numAlvoReal}\n🧊 +${premio} gold\n\n"${nomeBot}"`, mentions: [mJid(numReal), mJid(numAlvoReal)] }, { quoted: msg }) }
    }},

    explorar: { aliases: ["exploracao", "aventura", "exp"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { r, u } = getRpg(num)
      if (u.nivel < NIVEL_MIN_EXPLORAR) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐄𝐗𝐏𝐋𝐎𝐑𝐀𝐑 •\n\n❄️ Precisa nível ${NIVEL_MIN_EXPLORAR}+\n🧊 Você: ${u.nivel}\n\n"${nomeBot}"` }, { quoted: msg }) }
      const cooldown = COOLDOWN_EXPLORAR - (Date.now() - u.ultimoExplorar)
      if (cooldown > 0) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐄𝐗𝐏𝐋𝐎𝐑𝐀𝐑 •\n\n❄️ Espere ${formatarTempo(cooldown)}\n\n"${nomeBot}"` }, { quoted: msg }) }
      await reagir(sock, msg, "💧")
      u.ultimoExplorar = Date.now()
      const local = EXPLORAR[Math.floor(Math.random() * EXPLORAR.length)]
      const sucesso = Math.random() < 0.75
      if (sucesso) { const valor = Math.floor(local.min + Math.random() * (local.max - local.min)); const xp = local.xp + Math.floor(Math.random() * 20); u.moedas = sanearNum(u.moedas + valor); const subiu = ganharXp(u, xp); salvarRpg(r); await sock.sendMessage(jid, { text: `💧 • 𝐄𝐗𝐏𝐋𝐎𝐑𝐀𝐂̧𝐀̃𝐎 •\n\n❄️ ${local.emoji} ${local.nome}\n🧊 +${fmt(valor)} gold\n🧊 +${xp} XP${subiu ? `\n🧊 ⬆️ Subiu ${subiu}!` : ""}\n\n"${nomeBot}"`, mentions: [mJid(num)] }, { quoted: msg }) }
      else { const perda = Math.floor((u.moedas || 0) * 0.05); u.moedas = sanearNum(Math.max(0, u.moedas - perda)); ganharXp(u, 5); salvarRpg(r); await sock.sendMessage(jid, { text: `💧 • 𝐄𝐗𝐏𝐋𝐎𝐑𝐀𝐂̧𝐀̃𝐎 •\n\n❄️ ${local.emoji} ${local.nome}\n🧊 Falhou\n🧊 -${fmt(perda)} gold\n🧊 +5 XP\n\n"${nomeBot}"`, mentions: [mJid(num)] }, { quoted: msg }) }
    }},

    perfil: { aliases: ["meuperfil", "rpgperfil"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { u } = getRpg(num)
      const xpNec = xpNecessario(u.nivel); const pct = Math.floor(u.xp / xpNec * 10)
      const barra = "💧".repeat(Math.min(10, pct)) + "⬛".repeat(Math.max(0, 10 - pct))
      const pet = u.pet ? PETS.find(p => p.id === u.pet) : null
      const petTxt = pet ? `${pet.emoji} ${pet.nome}` : "🧊 Sem pet"
      await reagir(sock, msg, "💧")
      const texto = `💧 • 𝐏𝐄𝐑𝐅𝐈𝐋 •\n\n❄️ @${num}\n\n🧊 Nível: ${u.nivel}\n${barra} ${u.xp}/${xpNec} XP\n\n🧊 Carteira: ${fmt(u.moedas)} gold\n🧊 Pet: ${petTxt}\n🧊 Picareta: ${u.temPicareta ? "✅" : "❌"}\n🧊 Vara: ${u.temVara ? "✅" : "❌"}\n\n_"O Grande Sábio reconhece os fortes."_\n\n"${nomeBot}"`
      let fotoUrl = null
      try { fotoUrl = await sock.profilePictureUrl(mJid(num), "image") } catch (_) {}
      if (!fotoUrl) { try { fotoUrl = await sock.profilePictureUrl(sender, "image") } catch (_) {} }
      if (fotoUrl) await sock.sendMessage(jid, { image: { url: fotoUrl }, caption: texto, mentions: [mJid(num)] }, { quoted: msg })
      else await sock.sendMessage(jid, { text: texto, mentions: [mJid(num)] }, { quoted: msg })
    }},

    rank: { aliases: ["ranking", "top"], async executar({ sock, msg, db, utils }) {
      const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
      if (!jid.endsWith("@g.us")) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐑𝐀𝐍𝐊 •\n\n❄️ Só em grupos.\n\n"${nomeBot}"` }, { quoted: msg }) }
      const { numeros } = await coletarMembros(sock, jid)
      if (numeros.size === 0) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐑𝐀𝐍𝐊 •\n\n❄️ Não identifiquei membros.\n\n"${nomeBot}"` }, { quoted: msg }) }
      const r = dbLer("rpg.json", { usuarios: {} })
      const lista = Object.entries(r.usuarios || {}).filter(([num]) => numeros.has(num)).map(([num, u]) => { let moedas = u.moedas || 0; if (typeof moedas !== "number" || !isFinite(moedas) || moedas < 0) moedas = 0; if (moedas > 999999999999) moedas = 999999999999; return { num, moedas, nivel: u.nivel || 1 } })
      lista.sort((a, b) => b.moedas - a.moedas)
      const top = lista.slice(0, 10)
      if (!top.length) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐑𝐀𝐍𝐊 •\n\n❄️ Ninguém tá no RPG.\n\n"${nomeBot}"` }, { quoted: msg }) }
      let txt = `💧 • 𝐑𝐀𝐍𝐊𝐈𝐍𝐆 •\n\n❄️ TOP 10 mais ricos:\n\n`
      top.forEach((p, i) => { const medalha = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🧊"; txt += `${medalha} @${p.num} — ${fmt(p.moedas)} | Nv ${p.nivel}\n` })
      txt += `\n"${nomeBot}"`
      await reagir(sock, msg, "💧")
      await sock.sendMessage(jid, { text: txt, mentions: top.map(p => mJid(p.num)) }, { quoted: msg })
    }},

    afk: { aliases: ["ausente"], async executar({ sock, msg, args, db, utils, sender }) {
      const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
      if (!jid.endsWith("@g.us")) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐀𝐅𝐊 •\n\n❄️ Só em grupos.\n\n"${nomeBot}"` }, { quoted: msg }) }
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const motivo = args.join(" ").trim() || "Sem motivo"
      const afks = db.afk(); afks[jid] = afks[jid] || {}; afks[jid][sender] = { desde: Date.now(), motivo }; afks[jid][mJid(num)] = { desde: Date.now(), motivo }; db.salvarAfk(afks)
      await reagir(sock, msg, "💧")
      await sock.sendMessage(jid, { text: `💧 • 𝐀𝐅𝐊 •\n\n❄️ Modo ausente ativo\n🧊 @${num}\n🧊 ${motivo}\n\n"${nomeBot}"`, mentions: [mJid(num)] }, { quoted: msg })
    }}

  }
}