/* ============================================================
   💧❄️🧊 MENU FAZENDA - RIMURU BOT MD (PREFIXO DINÂMICO)
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
function nomeBotDb(db) { try { return db.config().nomeBot || "Rimuru Bot" } catch { return "Rimuru Bot" } }
function lineEmoji(emoji, label, valor) { return `${emoji} ${label}:\n╰➜ ${valor}` }

function msgSucesso(titulo, aviso, detalhes, rodape, nomeBot) {
  return `💧 • ${titulo} •\n\n❄️ ${aviso}\n\n🧊 ${detalhes}\n\n${rodape ? rodape + "\n\n" : ""}"${nomeBot}"`
}
function msgAviso(titulo, aviso, detalhes, rodape, nomeBot) {
  return `💧 • ${titulo} •\n\n❄️ ${aviso}\n\n🧊 ${detalhes}\n\n${rodape ? rodape + "\n\n" : ""}"${nomeBot}"`
}
function msgErro(titulo, aviso, detalhes, rodape, nomeBot) {
  return `💧 • ${titulo} •\n\n❄️ ${aviso}\n\n🧊 ${detalhes}\n\n${rodape ? rodape + "\n\n" : ""}"${nomeBot}"`
}

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

const INTERVALO_RENDA = 3 * 60 * 60 * 1000
const MAX_UPGRADES = 10
const CAP_BASE = 3
const CAP_UPGRADE = 3
const PRECO_CERCADO = 500
const PRECO_ALIMENTAR = 300
const PRECO_BANHO = 200
const PRECO_TERRA = 800
const PRECO_AGUA = 50
const AGUA_POR_REGA = 1

const ANIMAIS = [
  { id: "galinha", nome: "Galinha", emoji: "🐔", preco: 100, producao: 15 },
  { id: "galo", nome: "Galo", emoji: "🐓", preco: 120, producao: 18 },
  { id: "pato", nome: "Pato", emoji: "🦆", preco: 150, producao: 22 },
  { id: "ganso", nome: "Ganso", emoji: "🦢", preco: 180, producao: 25 },
  { id: "peru", nome: "Peru", emoji: "🦃", preco: 200, producao: 28 },
  { id: "marreco", nome: "Marreco", emoji: "🦆", preco: 140, producao: 20 },
  { id: "codorna", nome: "Codorna", emoji: "🐦", preco: 90, producao: 12 },
  { id: "faisao", nome: "Faisão", emoji: "🦜", preco: 220, producao: 30 },
  { id: "pavao", nome: "Pavão", emoji: "🦚", preco: 500, producao: 60 },
  { id: "cisne", nome: "Cisne", emoji: "🦢", preco: 450, producao: 55 },
  { id: "avestruz", nome: "Avestruz", emoji: "🦤", preco: 800, producao: 100 },
  { id: "vaca", nome: "Vaca", emoji: "🐮", preco: 500, producao: 65 },
  { id: "boi", nome: "Boi", emoji: "🐂", preco: 700, producao: 85 },
  { id: "porco", nome: "Porco", emoji: "🐷", preco: 400, producao: 50 },
  { id: "cabra", nome: "Cabra", emoji: "🐐", preco: 350, producao: 45 },
  { id: "ovelha", nome: "Ovelha", emoji: "🐑", preco: 400, producao: 52 },
  { id: "cavalo", nome: "Cavalo", emoji: "🐴", preco: 900, producao: 100 },
  { id: "coelho", nome: "Coelho", emoji: "🐰", preco: 120, producao: 18 }
]

const SEMENTES = [
  { id: "milho", nome: "Milho", emoji: "🌽", preco: 30, vendaBase: 90, tempo: 20 },
  { id: "trigo", nome: "Trigo", emoji: "🌾", preco: 25, vendaBase: 75, tempo: 18 },
  { id: "arroz", nome: "Arroz", emoji: "🍚", preco: 35, vendaBase: 100, tempo: 22 },
  { id: "feijao", nome: "Feijão", emoji: "🫘", preco: 28, vendaBase: 85, tempo: 20 },
  { id: "soja", nome: "Soja", emoji: "🫘", preco: 40, vendaBase: 120, tempo: 25 },
  { id: "batata", nome: "Batata", emoji: "🥔", preco: 30, vendaBase: 90, tempo: 20 },
  { id: "cenoura", nome: "Cenoura", emoji: "🥕", preco: 28, vendaBase: 82, tempo: 19 },
  { id: "tomate", nome: "Tomate", emoji: "🍅", preco: 40, vendaBase: 118, tempo: 25 },
  { id: "melancia", nome: "Melancia", emoji: "🍉", preco: 65, vendaBase: 195, tempo: 40 },
  { id: "morango", nome: "Morango", emoji: "🍓", preco: 70, vendaBase: 210, tempo: 32 },
  { id: "uva", nome: "Uva", emoji: "🍇", preco: 80, vendaBase: 240, tempo: 45 },
  { id: "cafe", nome: "Café", emoji: "☕", preco: 100, vendaBase: 300, tempo: 50 }
]

function acharAnimal(nome) { const n = normalizar(nome); return ANIMAIS.find(a => normalizar(a.nome) === n) || ANIMAIS.find(a => a.id === n) || ANIMAIS.find(a => normalizar(a.nome).includes(n)) }
function acharSemente(nome) { const n = normalizar(nome); return SEMENTES.find(s => normalizar(s.nome) === n) || SEMENTES.find(s => s.id === n) || SEMENTES.find(s => normalizar(s.nome).includes(n)) }

function getFazenda(num) {
  const f = dbLer("fazenda.json", { usuarios: {} })
  f.usuarios = f.usuarios || {}
  f.usuarios[num] = f.usuarios[num] || { cercados: 0, limiteAnimais: 0, upgrades: 0, animais: [], sujeira: 0, ultimaRenda: Date.now(), rendaTotal: 0, rendaPendente: 0, terras: 0, agua: 0, sementes: {}, plantacoes: [] }
  const u = f.usuarios[num]
  u.terras = u.terras || 0; u.agua = u.agua || 0; u.sementes = u.sementes || {}; u.plantacoes = u.plantacoes || []; u.rendaPendente = u.rendaPendente || 0
  return { f, u }
}

function calcularRenda(user) {
  if (!user.animais || !user.animais.length) return 0
  let renda = 0
  for (const a of user.animais) { const info = ANIMAIS.find(x => x.id === a.id); if (!info) continue; let prod = info.producao; prod *= (1 - Math.min(a.fome || 0, 100) / 200); prod *= (1 - Math.min(a.sujo || 0, 100) / 200); renda += prod }
  renda *= (1 - Math.min(user.sujeira || 0, 100) / 200)
  renda *= (1 + (user.upgrades || 0) * 0.05)
  return Math.floor(renda)
}

function nivelFazenda(user) { const total = user.limiteAnimais || 0; if (total === 0) return 0; return Math.floor(total / CAP_UPGRADE) }
function qualidadePlanta(p) { const regas = p.regas || 0; return Math.min(100, Math.floor(regas * 15 + (p.qualidadeBase || 50))) }
function valorPlanta(p) { const s = SEMENTES.find(x => x.id === p.id); if (!s) return 0; const q = qualidadePlanta(p); return Math.floor(s.vendaBase * (0.5 + q / 100)) }

module.exports = {
  menu: "menu-fazenda",
  grupoOnly: false,
  adminOnly: false,
  donoOnly: false,

  async rendaAutomatica(sock, db) {
    const f = dbLer("fazenda.json", { usuarios: {} })
    let alterou = false
    const agora = Date.now()
    for (const [num, user] of Object.entries(f.usuarios || {})) {
      if (user.plantacoes) { for (const p of user.plantacoes) { if (p.pronta) continue; const s = SEMENTES.find(x => x.id === p.id); if (!s) continue; const tempoNecessario = s.tempo * 60 * 1000; const regasBonus = (p.regas || 0) * 2 * 60 * 1000; const tempoFinal = Math.max(5 * 60 * 1000, tempoNecessario - regasBonus); if (agora - p.plantadaEm >= tempoFinal) { p.pronta = true; p.prontaEm = agora; alterou = true } } }
      if (!user.animais || !user.animais.length) continue
      if (agora - (user.ultimaRenda || 0) < INTERVALO_RENDA) continue
      const renda = calcularRenda(user)
      user.rendaPendente = (user.rendaPendente || 0) + renda
      user.rendaTotal = (user.rendaTotal || 0) + renda
      for (const a of user.animais) { a.fome = Math.min(100, (a.fome || 0) + 20); a.sujo = Math.min(100, (a.sujo || 0) + 15) }
      user.sujeira = Math.min(100, (user.sujeira || 0) + 20); user.ultimaRenda = agora; alterou = true
      try { const grupos = db.grupos(); const grupo = user.ultimoGrupo || Object.keys(grupos).find(j => j.endsWith("@g.us")); if (grupo) { await sock.sendMessage(grupo, { text: `💧 • 𝐑𝐄𝐍𝐃𝐀 •\n\n❄️ Fazenda gerou renda\n🧊 Slime: ${num}\n🧊 +${renda} gold\n🧊 Pendente: ${user.rendaPendente}\n\n💡 \`!resgatarfazenda\`` }) } } catch (_) {}
    }
    if (alterou) dbSalvar("fazenda.json", f)
  },

  commands: {

    menufazenda: {
      aliases: ["fazenda", "menuf", "comandosfazenda"],
      async executar({ sock, msg, prefixoAtivo, db, sender, config, isDono, isSubDono, isAdmin, groupMetadata }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; const cfg = db.config()
        const { pushName, nomeDono, cargo, nomeBot } = getCargoETexto({ sender, config, db, groupMetadata, isDono, isSubDono, isAdmin, msg })
        await reagir(sock, msg, "💧")
        const texto = `${cardPerfil({ nomeBot, nomeUsuario: pushName, cargo, dono: nomeDono })}

${secao("💰 ʀᴇsɢᴀᴛᴀʀ")}
${item(`${p}resgatarfazenda`)}

${secao("🐾 ᴀɴɪᴍᴀɪs")}
${item(`${p}animais / ${p}compraranimal <nome>`)}
${item(`${p}venderanimal <nome>`)}
${item(`${p}statusanimais`)}

${secao("🌱 sᴇᴍᴇɴᴛᴇs")}
${item(`${p}sementes / ${p}comprarsemente <nome>`)}
${item(`${p}plantarsemente <nome>`)}
${item(`${p}regarsementes / ${p}regarplanta <nome>`)}
${item(`${p}venderplanta <nome>`)}

${secao("🏠 ᴄᴇʀᴄᴀs")}
${item(`${p}comprarcercado`)}
${item(`${p}comprarterra / ${p}compraragua`)}

${secao("🍖 ᴄᴜɪᴅᴀᴅᴏs")}
${item(`${p}alimentaranimais (300$)`)}
${item(`${p}banhoanimais (200$)`)}
${item(`${p}limparfazenda`)}

${secao("📊 sᴛᴀᴛᴜs")}
${item(`${p}statusfazenda / ${p}statusplanta`)}

💧 Prefixo: \`${p}\`

_"A renda acumula de 3h em 3h!"_

"${nomeBot}"`
        if (cfg.fotoMenu) { const buf = Buffer.from(cfg.fotoMenu, "base64"); if (cfg.tipoMenu === "video") return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "rimuru.mp4", gifPlayback: true, caption: texto }, { quoted: msg }); return sock.sendMessage(jid, { image: buf, caption: texto }, { quoted: msg }) }
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    resgatarfazenda: {
      aliases: ["resgatar", "coletar", "coletarfazenda"],
      async executar({ sock, msg, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const num = utils.soNumero(sender); const { f, u } = getFazenda(num); const pendente = u.rendaPendente || 0
        if (pendente <= 0) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐄𝐒𝐆𝐀𝐓𝐀𝐑", "Nada pra resgatar.", "Renda acumula a cada 3h", null, nomeBot) }, { quoted: msg }) }
        const rpg = db.rpg(); rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }; rpg.usuarios[num].moedas = (rpg.usuarios[num].moedas || 0) + pendente; db.salvarRpg(rpg)
        u.rendaPendente = 0; dbSalvar("fazenda.json", f)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐑𝐄𝐒𝐆𝐀𝐓𝐄", "Renda coletada", lineEmoji("👤", "Slime", "@" + num) + "\n" + lineEmoji("💰", "Valor", "+" + pendente + " gold") + "\n" + lineEmoji("💼", "Total", rpg.usuarios[num].moedas), null, nomeBot), mentions: [`${num}@s.whatsapp.net`] }, { quoted: msg })
      }
    },

    animais: {
      aliases: ["listaanimais", "lojaanimais"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        await reagir(sock, msg, "💧")
        let txt = `💧 • 𝐀𝐍𝐈𝐌𝐀𝐈𝐒 •\n\n❄️ Lista:\n\n`
        ANIMAIS.forEach((a, i) => { txt += `🧊 ${i + 1}. ${a.emoji} ${a.nome} — 💰 ${a.preco} | 📈 ${a.producao}/3h\n` })
        txt += `\n💡 \`!compraranimal <nome>\`\n\n"${nomeBot}"`
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    comprarcercado: {
      aliases: ["cercado", "buycercado"],
      async executar({ sock, msg, db, utils, sender }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender); const { f, u } = getFazenda(num)
        if (u.upgrades >= MAX_UPGRADES) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐂𝐄𝐑𝐂𝐀𝐃𝐎", "Máximo atingido.", `Upgrades: ${u.upgrades}/${MAX_UPGRADES}`, null, nomeBot) }, { quoted: msg }) }
        const rpg = db.rpg(); rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }; const gold = rpg.usuarios[num].moedas || 0
        const preco = u.upgrades === 0 ? 0 : PRECO_CERCADO
        if (gold < preco) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐂𝐄𝐑𝐂𝐀𝐃𝐎", "Gold insuficiente.", `Faltam ${preco - gold} gold`, null, nomeBot) }, { quoted: msg }) }
        rpg.usuarios[num].moedas = gold - preco; u.upgrades += 1; u.cercados += 1; u.limiteAnimais = CAP_BASE + (u.upgrades - 1) * CAP_UPGRADE
        db.salvarRpg(rpg); dbSalvar("fazenda.json", f)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐂𝐄𝐑𝐂𝐀𝐃𝐎", "Mais espaço pros animais.", lineEmoji("🐾", "Capacidade", u.limiteAnimais) + "\n" + lineEmoji("📊", "Upgrades", `${u.upgrades}/${MAX_UPGRADES}`), null, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    compraranimal: {
      aliases: ["buyanimal", "adotaranimal"],
      async executar({ sock, msg, args, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const num = utils.soNumero(sender); const { f, u } = getFazenda(num)
        if (u.cercados === 0) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐍𝐈𝐌𝐀𝐋", "Compre cercado primeiro.", `Use \`${p}comprarcercado\``, null, nomeBot) }, { quoted: msg }) }
        if (u.animais.length >= u.limiteAnimais) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐀𝐍𝐈𝐌𝐀𝐋", "Cercado cheio.", `Ocupado: ${u.animais.length}/${u.limiteAnimais}`, null, nomeBot) }, { quoted: msg }) }
        const animal = acharAnimal(args.join(" "))
        if (!animal) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐀𝐍𝐈𝐌𝐀𝐋", "Não achei.", `Veja \`${p}animais\``, null, nomeBot) }, { quoted: msg }) }
        const rpg = db.rpg(); rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        if ((rpg.usuarios[num].moedas || 0) < animal.preco) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐀𝐍𝐈𝐌𝐀𝐋", "Gold insuficiente.", `Faltam ${animal.preco - (rpg.usuarios[num].moedas || 0)} gold`, null, nomeBot) }, { quoted: msg }) }
        rpg.usuarios[num].moedas -= animal.preco
        u.animais.push({ id: animal.id, nome: animal.nome, emoji: animal.emoji, fome: 0, sujo: 0, compradoEm: Date.now() })
        db.salvarRpg(rpg); dbSalvar("fazenda.json", f)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐍𝐈𝐌𝐀𝐋", "Novo animal.", lineEmoji(animal.emoji, "Animal", animal.nome) + "\n" + lineEmoji("📈", "Produção", animal.producao + "/3h"), null, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    venderanimal: {
      aliases: ["vendaranimal", "sellanimal"],
      async executar({ sock, msg, args, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const num = utils.soNumero(sender); const { f, u } = getFazenda(num)
        const idx = u.animais.findIndex(a => normalizar(a.nome) === normalizar(args.join(" ")) || a.id === normalizar(args.join(" ")))
        if (idx === -1) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐕𝐄𝐍𝐃𝐄𝐑", "Você não tem esse.", `Veja \`${p}statusanimais\``, null, nomeBot) }, { quoted: msg }) }
        const a = u.animais[idx]; const info = ANIMAIS.find(x => x.id === a.id); const valor = Math.floor((info?.preco || 100) * 0.5)
        u.animais.splice(idx, 1); const rpg = db.rpg(); rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }; rpg.usuarios[num].moedas = (rpg.usuarios[num].moedas || 0) + valor
        db.salvarRpg(rpg); dbSalvar("fazenda.json", f)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐕𝐄𝐍𝐃𝐈𝐃𝐎", "Animal vendido.", lineEmoji(a.emoji, "Animal", a.nome) + "\n" + lineEmoji("💰", "Valor", "+" + valor + " gold"), null, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    alimentaranimais: {
      aliases: ["alimentaranimal", "feedanimais"],
      async executar({ sock, msg, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const num = utils.soNumero(sender); const { f, u } = getFazenda(num)
        if (!u.animais.length) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐋𝐈𝐌𝐄𝐍𝐓𝐀𝐑", "Sem animais.", `Use \`${p}compraranimal\``, null, nomeBot) }, { quoted: msg }) }
        const rpg = db.rpg(); rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        if ((rpg.usuarios[num].moedas || 0) < PRECO_ALIMENTAR) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐀𝐋𝐈𝐌𝐄𝐍𝐓𝐀𝐑", "Gold insuficiente.", `Precisa ${PRECO_ALIMENTAR} gold`, null, nomeBot) }, { quoted: msg }) }
        rpg.usuarios[num].moedas -= PRECO_ALIMENTAR; let n = 0
        for (const a of u.animais) { if ((a.fome || 0) > 0) { a.fome = 0; n++ } }
        db.salvarRpg(rpg); dbSalvar("fazenda.json", f)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐋𝐈𝐌𝐄𝐍𝐓𝐀𝐃𝐎𝐒", "Todos alimentados.", lineEmoji("🐾", "Animais", n) + "\n" + lineEmoji("💰", "Pago", "-" + PRECO_ALIMENTAR + " gold"), null, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    banhoanimais: {
      aliases: ["banhoanimal", "lavaranimais"],
      async executar({ sock, msg, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const num = utils.soNumero(sender); const { f, u } = getFazenda(num)
        if (!u.animais.length) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐁𝐀𝐍𝐇𝐎", "Sem animais.", `Use \`${p}compraranimal\``, null, nomeBot) }, { quoted: msg }) }
        const rpg = db.rpg(); rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        if ((rpg.usuarios[num].moedas || 0) < PRECO_BANHO) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐁𝐀𝐍𝐇𝐎", "Gold insuficiente.", `Precisa ${PRECO_BANHO} gold`, null, nomeBot) }, { quoted: msg }) }
        rpg.usuarios[num].moedas -= PRECO_BANHO; let n = 0
        for (const a of u.animais) { if ((a.sujo || 0) > 0) { a.sujo = 0; n++ } }
        db.salvarRpg(rpg); dbSalvar("fazenda.json", f)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐋𝐀𝐕𝐀𝐃𝐎𝐒", "Todos lavados.", lineEmoji("🚿", "Animais", n) + "\n" + lineEmoji("💰", "Pago", "-" + PRECO_BANHO + " gold"), null, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    limparfazenda: {
      aliases: ["limparfaz"],
      async executar({ sock, msg, utils, sender, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const num = utils.soNumero(sender); const { f, u } = getFazenda(num)
        if ((u.sujeira || 0) === 0) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgSucesso("𝐋𝐈𝐌𝐏𝐄𝐙𝐀", "Já tá limpa.", "Nada a fazer", null, nomeBot) }, { quoted: msg }) }
        u.sujeira = 0; dbSalvar("fazenda.json", f)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐋𝐈𝐌𝐏𝐀", "Sujeira removida.", "Tudo brilhando!", null, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    statusfazenda: {
      aliases: ["fazendastatus", "minhafazenda"],
      async executar({ sock, msg, utils, sender, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const num = utils.soNumero(sender); const { u } = getFazenda(num)
        if (u.cercados === 0 && u.terras === 0) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐒𝐓𝐀𝐓𝐔𝐒", "Você não tem fazenda.", `Use \`${p}comprarcercado\``, null, nomeBot) }, { quoted: msg }) }
        const nivel = nivelFazenda(u); const renda = calcularRenda(u)
        const restante = Math.max(0, INTERVALO_RENDA - (Date.now() - (u.ultimaRenda || Date.now())))
        const h = Math.floor(restante / 3600000); const m = Math.floor((restante % 3600000) / 60000)
        const tempo = h > 0 ? `${h}h ${m}min` : `${m}min`
        const cheio = Math.min(10, Math.floor(u.animais.length / Math.max(1, u.limiteAnimais) * 10))
        const barra = "💧".repeat(cheio) + "⬛".repeat(10 - cheio)
        const statusSujeira = u.sujeira > 70 ? "🚨" : u.sujeira > 40 ? "❄️" : "✅"
        const prontas = (u.plantacoes || []).filter(p => p.pronta).length
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐒𝐓𝐀𝐓𝐔𝐒 •\n\n❄️ @${num}\n\n🧊 Nível: ${nivel}\n🧊 Cercados: ${u.cercados}\n🧊 Terras: ${u.terras}\n🧊 Água: ${u.agua}L\n🧊 Animais:\n${barra} ${u.animais.length}/${u.limiteAnimais}\n🧊 Plantações: ${u.plantacoes.length} (${prontas} prontas)\n🧊 Sujeira: ${u.sujeira}% ${statusSujeira}\n\n💰 Renda:\n🧊 Rendimento: ${renda}/3h\n🧊 Pendente: ${u.rendaPendente || 0}\n🧊 Próxima: ${tempo}\n🧊 Total: ${u.rendaTotal || 0}\n🧊 Upgrade: ${u.upgrades}/${MAX_UPGRADES}\n\n💡 \`${p}resgatarfazenda\`\n\n"${nomeBot}"`, mentions: [`${num}@s.whatsapp.net`] }, { quoted: msg })
      }
    },

    statusanimais: {
      aliases: ["meusanimais", "veranimais"],
      async executar({ sock, msg, utils, sender, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const num = utils.soNumero(sender); const { u } = getFazenda(num)
        if (!u.animais.length) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐍𝐈𝐌𝐀𝐈𝐒", "Você não tem animais.", `Use \`${p}compraranimal\``, null, nomeBot) }, { quoted: msg }) }
        let txt = `💧 • 𝐀𝐍𝐈𝐌𝐀𝐈𝐒 (${u.animais.length}/${u.limiteAnimais}) •\n\n❄️ Lista:\n\n`
        for (const a of u.animais) { const fomeIco = a.fome > 70 ? "🚨" : a.fome > 40 ? "❄️" : "✅"; const sujoIco = a.sujo > 70 ? "🚨" : a.sujo > 40 ? "❄️" : "✅"; txt += `🧊 ${a.emoji} ${a.nome} — 🍖 ${fomeIco} ${a.fome}% | 🚿 ${sujoIco} ${a.sujo}%\n` }
        txt += `\n"${nomeBot}"`
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: txt, mentions: [sender] }, { quoted: msg })
      }
    },

    sementes: {
      aliases: ["lojasementes", "listarsementes"],
      async executar({ sock, msg, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        await reagir(sock, msg, "💧")
        let txt = `💧 • 𝐒𝐄𝐌𝐄𝐍𝐓𝐄𝐒 •\n\n❄️ Lista:\n\n`
        SEMENTES.forEach((s, i) => { txt += `🧊 ${i + 1}. ${s.emoji} ${s.nome} — 💰 ${s.preco} | ⏰ ${s.tempo}min | 💵 ~${s.vendaBase}\n` })
        txt += `\n💡 \`${p}comprarsemente <nome> <qtd>\`\n\n"${nomeBot}"`
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    comprarsemente: {
      aliases: ["buysemente"],
      async executar({ sock, msg, args, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const num = utils.soNumero(sender); const { f, u } = getFazenda(num)
        if (u.terras === 0) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐒𝐄𝐌𝐄𝐍𝐓𝐄", "Compre terra primeiro.", `Use \`${p}comprarterra\``, null, nomeBot) }, { quoted: msg }) }
        let qtd = 1; const ultimo = args[args.length - 1]; if (/^\d+$/.test(ultimo)) { qtd = parseInt(ultimo); args.pop() }
        const sem = acharSemente(args.join(" "))
        if (!sem) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌𝐄𝐍𝐓𝐄", "Não achei.", `Veja \`${p}sementes\``, null, nomeBot) }, { quoted: msg }) }
        const total = sem.preco * qtd
        const rpg = db.rpg(); rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        if ((rpg.usuarios[num].moedas || 0) < total) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌𝐄𝐍𝐓𝐄", "Gold insuficiente.", `Faltam ${total - (rpg.usuarios[num].moedas || 0)} gold`, null, nomeBot) }, { quoted: msg }) }
        rpg.usuarios[num].moedas -= total; u.sementes[sem.id] = (u.sementes[sem.id] || 0) + qtd
        db.salvarRpg(rpg); dbSalvar("fazenda.json", f)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐒𝐄𝐌𝐄𝐍𝐓𝐄", "Adicionada ao estoque.", lineEmoji(sem.emoji, "Semente", sem.nome + " x" + qtd) + "\n" + lineEmoji("💰", "Pago", "-" + total + " gold"), null, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    comprarterra: {
      aliases: ["terra", "buyterra"],
      async executar({ sock, msg, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const num = utils.soNumero(sender); const { f, u } = getFazenda(num)
        if (u.terras >= 20) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐓𝐄𝐑𝐑𝐀", "Máximo 20 terras.", `Terras: ${u.terras}`, null, nomeBot) }, { quoted: msg }) }
        const rpg = db.rpg(); rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }; const gold = rpg.usuarios[num].moedas || 0
        const preco = PRECO_TERRA + u.terras * 200
        if (gold < preco) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐓𝐄𝐑𝐑𝐀", "Gold insuficiente.", `Precisa ${preco} | Faltam ${preco - gold}`, null, nomeBot) }, { quoted: msg }) }
        rpg.usuarios[num].moedas = gold - preco; u.terras += 1; db.salvarRpg(rpg); dbSalvar("fazenda.json", f)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐓𝐄𝐑𝐑𝐀", "Mais espaço pra plantação.", lineEmoji("🟫", "Total", u.terras) + "\n" + lineEmoji("💰", "Pago", "-" + preco + " gold"), null, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    compraragua: {
      aliases: ["agua", "buyagua"],
      async executar({ sock, msg, args, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const num = utils.soNumero(sender); const { f, u } = getFazenda(num)
        const qtd = parseInt(args[0]) || 10
        if (qtd < 1 || qtd > 100) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐀́𝐆𝐔𝐀", "Qtd inválida.", `Use \`${p}compraragua <1-100>\``, null, nomeBot) }, { quoted: msg }) }
        const total = PRECO_AGUA * qtd
        const rpg = db.rpg(); rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
        if ((rpg.usuarios[num].moedas || 0) < total) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐀́𝐆𝐔𝐀", "Gold insuficiente.", `Faltam ${total - (rpg.usuarios[num].moedas || 0)} gold`, null, nomeBot) }, { quoted: msg }) }
        rpg.usuarios[num].moedas -= total; u.agua += qtd; db.salvarRpg(rpg); dbSalvar("fazenda.json", f)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐀́𝐆𝐔𝐀", "Estoque atualizado.", lineEmoji("💧", "Qtd", qtd + "L") + "\n" + lineEmoji("💼", "Total", u.agua + "L") + "\n" + lineEmoji("💰", "Pago", "-" + total + " gold"), null, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    plantarsemente: {
      aliases: ["plantar", "plant"],
      async executar({ sock, msg, args, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const num = utils.soNumero(sender); const { f, u } = getFazenda(num)
        if (u.terras === 0) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐏𝐋𝐀𝐍𝐓𝐀𝐑", "Sem terra!", `Use \`${p}comprarterra\``, null, nomeBot) }, { quoted: msg }) }
        if (u.plantacoes.length >= u.terras) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐏𝐋𝐀𝐍𝐓𝐀𝐑", "Terras ocupadas.", `Ocupadas: ${u.plantacoes.length}/${u.terras}`, null, nomeBot) }, { quoted: msg }) }
        const sem = acharSemente(args.join(" "))
        if (!sem) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐏𝐋𝐀𝐍𝐓𝐀𝐑", "Não achei.", `Veja \`${p}sementes\``, null, nomeBot) }, { quoted: msg }) }
        if ((u.sementes[sem.id] || 0) < 1) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐏𝐋𝐀𝐍𝐓𝐀𝐑", "Não tem essa semente.", `Semente: ${sem.nome}`, null, nomeBot) }, { quoted: msg }) }
        u.sementes[sem.id]--; if (u.sementes[sem.id] === 0) delete u.sementes[sem.id]
        u.plantacoes.push({ id: sem.id, nome: sem.nome, emoji: sem.emoji, plantadaEm: Date.now(), regas: 0, qualidadeBase: 30, pronta: false, prontaEm: null })
        dbSalvar("fazenda.json", f)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐋𝐀𝐍𝐓𝐀𝐃𝐀", "Semente no chão.", lineEmoji(sem.emoji, "Semente", sem.nome) + "\n" + lineEmoji("⏰", "Tempo", "~" + sem.tempo + "min") + "\n\n💡 \`" + p + "regarplanta " + sem.nome + "\`", null, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    regarsementes: {
      aliases: ["regartudo", "regartodas"],
      async executar({ sock, msg, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const num = utils.soNumero(sender); const { f, u } = getFazenda(num)
        if (!u.plantacoes.length) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐄𝐆𝐀𝐑", "Sem plantações.", `Use \`${p}plantarsemente\``, null, nomeBot) }, { quoted: msg }) }
        if (u.agua < AGUA_POR_REGA) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐑𝐄𝐆𝐀𝐑", "Sem água.", `Use \`${p}compraragua\``, null, nomeBot) }, { quoted: msg }) }
        let regadas = 0
        for (const p2 of u.plantacoes) { if (u.agua < AGUA_POR_REGA) break; if (p2.pronta) continue; u.agua -= AGUA_POR_REGA; p2.regas = (p2.regas || 0) + 1; p2.qualidadeBase = Math.min(100, (p2.qualidadeBase || 30) + 5); regadas++ }
        dbSalvar("fazenda.json", f)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐑𝐄𝐆𝐀𝐃𝐀𝐒", "Rega em massa.", lineEmoji("💧", "Regadas", regadas) + "\n" + lineEmoji("💼", "Água", u.agua + "L"), null, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    regarplanta: {
      aliases: ["regar"],
      async executar({ sock, msg, args, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const num = utils.soNumero(sender); const { f, u } = getFazenda(num)
        if (u.agua < AGUA_POR_REGA) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐑𝐄𝐆𝐀𝐑", "Sem água.", `Use \`${p}compraragua\``, null, nomeBot) }, { quoted: msg }) }
        const busca = normalizar(args.join(" "))
        const planta = u.plantacoes.find(x => normalizar(x.nome) === busca || x.id === busca || normalizar(x.nome).includes(busca))
        if (!planta) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐑𝐄𝐆𝐀𝐑", "Planta não encontrada.", `Veja \`${p}statusplanta\``, null, nomeBot) }, { quoted: msg }) }
        if (planta.pronta) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐄𝐆𝐀𝐑", "Já está pronta.", `Use ${p}venderplanta ${planta.nome}`, null, nomeBot) }, { quoted: msg }) }
        u.agua -= AGUA_POR_REGA; planta.regas = (planta.regas || 0) + 1; planta.qualidadeBase = Math.min(100, (planta.qualidadeBase || 30) + 5); dbSalvar("fazenda.json", f)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐑𝐄𝐆𝐀𝐃𝐀", "Planta regada.", lineEmoji(planta.emoji, "Planta", planta.nome) + "\n" + lineEmoji("💧", "Água", u.agua + "L") + "\n" + lineEmoji("📊", "Regas", planta.regas), null, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    venderplanta: {
      aliases: ["vender", "colher"],
      async executar({ sock, msg, args, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const num = utils.soNumero(sender); const { f, u } = getFazenda(num)
        const busca = normalizar(args.join(" "))
        if (!busca) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐕𝐄𝐍𝐃𝐄𝐑", "Informe o nome.", `\`${p}venderplanta <nome>\``, null, nomeBot) }, { quoted: msg }) }
        const idx = u.plantacoes.findIndex(x => normalizar(x.nome) === busca || x.id === busca || normalizar(x.nome).includes(busca))
        if (idx === -1) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐕𝐄𝐍𝐃𝐄𝐑", "Você não tem.", `Veja \`${p}statusplanta\``, null, nomeBot) }, { quoted: msg }) }
        const planta = u.plantacoes[idx]
        if (!planta.pronta) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐕𝐄𝐍𝐃𝐄𝐑", "Ainda não está pronta.", `Planta: ${planta.nome}`, null, nomeBot) }, { quoted: msg }) }
        const valor = valorPlanta(planta); const qualidade = qualidadePlanta(planta)
        u.plantacoes.splice(idx, 1)
        const rpg = db.rpg(); rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }; rpg.usuarios[num].moedas = (rpg.usuarios[num].moedas || 0) + valor
        db.salvarRpg(rpg); dbSalvar("fazenda.json", f)
        const estrelas = qualidade >= 90 ? "💧💧" : qualidade >= 70 ? "💧" : ""
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐕𝐄𝐍𝐃𝐈𝐃𝐀", "Colheita vendida.", lineEmoji(planta.emoji, "Planta", planta.nome) + "\n" + lineEmoji("📊", "Qualidade", qualidade + "% " + estrelas) + "\n" + lineEmoji("💵", "Valor", "+" + valor + " gold"), null, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    statusplanta: {
      aliases: ["minhasplantas", "plantacoes"],
      async executar({ sock, msg, utils, sender, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const num = utils.soNumero(sender); const { u } = getFazenda(num)
        if (!u.plantacoes.length) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐏𝐋𝐀𝐍𝐓𝐀𝐒", "Sem plantações.", `Use \`${p}plantarsemente\``, null, nomeBot) }, { quoted: msg }) }
        let txt = `💧 • 𝐏𝐋𝐀𝐍𝐓𝐀𝐂̧𝐎̃𝐄𝐒 (${u.plantacoes.length}/${u.terras}) •\n\n❄️ Lista:\n\n`
        for (const planta of u.plantacoes) { const q = qualidadePlanta(planta); const estrelas = q >= 90 ? "💧💧" : q >= 70 ? "💧" : ""; const status = planta.pronta ? "✅ Pronta!" : "⏰ Crescendo"; txt += `🧊 ${planta.emoji} ${planta.nome} — ${status}\n🧊 📊 ${q}% ${estrelas} | 💧 Regas: ${planta.regas || 0}\n` }
        txt += `\n"${nomeBot}"`
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: txt, mentions: [sender] }, { quoted: msg })
      }
    }

  }
}