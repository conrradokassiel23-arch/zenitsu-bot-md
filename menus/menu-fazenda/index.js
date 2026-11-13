/* ============================================================
   🌸 MENU FAZENDA - TEMA FLORAL
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
function nomeBotDb(db) { try { return db.config?.()?.nomeBot || "Rimuru" } catch { return "Rimuru" } }
function getCfg(db) { try { return db.config?.() || {} } catch { return {} } }
function soNumero(jid) { if (!jid) return ""; if (typeof jid === "object") jid = jid.phoneNumber || jid.id || ""; return String(jid).split("@")[0].split(":")[0].replace(/\D/g, "") }

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

function cardPerfil({ nomeBot, nomeUsuario, cargo, dono }) {
  return `${boxTop("𝐅 𝐀 𝐙 𝐄 𝐍 𝐃 𝐀")}

┏━━━〔 𝐏𝐑𝐎𝐅𝐈𝐋𝐄 〕━━━┓
𖤐 Bot » ${nomeBot}
𖤐 Usuário » ${nomeUsuario}
𖤐 Cargo » ${cargo}
𖤐 Dono » ${dono}
┗━━━━━━━━━━━━━━━━━━┛`
}

function detectarCargo({ sender, config, db, groupMetadata, isDono, isSubDono, isAdmin }) {
  const num = String(sender || "").split("@")[0].split(":")[0].replace(/\D/g, "")
  const donos = (Array.isArray(config?.dono) ? config.dono : [config?.dono]).map(n => String(n).split("@")[0].split(":")[0].replace(/\D/g, "")).filter(Boolean)
  if (isDono || donos.includes(num)) return "👑 𝐆𝐑𝐀𝐍𝐃𝐄 𝐒𝐀́𝐁𝐈𝐎"
  try { const subs = (db.config?.().subdonos || []).map(n => String(n).split("@")[0].split(":")[0].replace(/\D/g, "")); if (isSubDono || subs.includes(num)) return "💠 𝐋𝐔𝐀 𝐒𝐔𝐏𝐄𝐑𝐈𝐎𝐑" } catch (_) {}
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

function gerarKeyAleatoria() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = 'KEYFZ-';
  for (let i = 0; i < 8; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
  return key;
}

/* ---------- GOLD FZ ---------- */
function getGoldFZ(num) {
  const g = dbLer("goldfz.json", { usuarios: {} })
  g.usuarios = g.usuarios || {}
  g.usuarios[num] = g.usuarios[num] || 0
  return { g, saldo: g.usuarios[num] }
}
function salvarGoldFZ(g) { dbSalvar("goldfz.json", g) }
function addGoldFZ(num, qtd) {
  const { g } = getGoldFZ(num)
  g.usuarios[num] = (g.usuarios[num] || 0) + qtd
  salvarGoldFZ(g)
  return g.usuarios[num]
}
function removeGoldFZ(num, qtd) {
  const { g, saldo } = getGoldFZ(num)
  if (saldo < qtd) return { ok: false, saldo }
  g.usuarios[num] = saldo - qtd
  salvarGoldFZ(g)
  return { ok: true, saldo: g.usuarios[num] }
}

/* ---------- MUTAÇÕES (todas permanentes) ---------- */
const MUTACOES = {
  flamejante: { id: "flamejante", nome: "Flamejante", emoji: "🔥", bonus: 2.0, peso: 15, raridade: "Raro" },
  gold:       { id: "gold",       nome: "Gold",       emoji: "🟡", bonus: 3.0, peso: 8,  raridade: "Épico" },
  rainbow:    { id: "rainbow",    nome: "Rainbow",    emoji: "🌈", bonus: 5.0, peso: 2,  raridade: "Lendário" },
  diamante:   { id: "diamante",   nome: "Diamante",   emoji: "💎", bonus: 7.0, peso: 1,  raridade: "Mítico" },
  acida:      { id: "acida",      nome: "Ácida",      emoji: "☢️", bonus: 8.0, peso: 1,  raridade: "Mítico" },
  bone:       { id: "bone",       nome: "Bone",       emoji: "💀", bonus: 10.0, peso: 0.5, raridade: "Mítico" }
}

function sortearUmaMutacao(mutacoesBloqueadas = []) {
  const disponiveis = []
  for (const [id, mut] of Object.entries(MUTACOES)) {
    if (mutacoesBloqueadas.includes(id)) continue
    disponiveis.push({ id, ...mut })
  }
  const totalPeso = disponiveis.reduce((s, m) => s + m.peso, 0)
  const chanceSemMut = 80
  const r = Math.random() * (totalPeso + chanceSemMut)
  if (r > totalPeso) return null
  let acc = r
  for (const m of disponiveis) {
    acc -= m.peso
    if (acc <= 0) return m
  }
  return null
}

function sortearMutacoes() {
  const resultado = []
  const m1 = sortearUmaMutacao([])
  if (m1) {
    resultado.push(m1.id)
    const m2 = sortearUmaMutacao([m1.id])
    if (m2) resultado.push(m2.id)
  }
  return resultado
}

/* ---------- CONFIGURAÇÕES ---------- */
const INTERVALO_RENDA = 3 * 60 * 60 * 1000
const INTERVALO_RESTOCK = 60 * 60 * 1000
const INTERVALO_VENDEDOR_SEMENTE = 4 * 60 * 60 * 1000
const INTERVALO_VENDEDOR_ANIMAL = 3 * 60 * 60 * 1000
const INTERVALO_EVENTO_AGUA = 2 * 60 * 60 * 1000
const DURACAO_VENDEDOR = 30 * 60 * 1000

const MAX_UPGRADES = 10
const CAP_BASE = 3
const CAP_UPGRADE = 3
const PRECO_CERCADO = 500
const PRECO_ALIMENTAR = 300
const PRECO_BANHO = 200
const PRECO_TERRA = 800
const PRECO_AGUA = 50
const AGUA_POR_REGA = 1
const GALAO_AGUA = 10

/* Animais só de fazenda */
const ANIMAIS = [
  { id: "galinha", nome: "Galinha", emoji: "🐔", preco: 100, producaoHora: 5, raridade: "Comum" },
  { id: "galo", nome: "Galo", emoji: "🐓", preco: 150, producaoHora: 8, raridade: "Comum" },
  { id: "porco", nome: "Porco", emoji: "🐷", preco: 400, producaoHora: 17, raridade: "Raro" },
  { id: "ovelha", nome: "Ovelha", emoji: "🐑", preco: 400, producaoHora: 17, raridade: "Raro" },
  { id: "vaca", nome: "Vaca", emoji: "🐮", preco: 500, producaoHora: 22, raridade: "Épico" },
  { id: "boi", nome: "Boi", emoji: "🐂", preco: 700, producaoHora: 28, raridade: "Épico" },
  { id: "cavalo", nome: "Cavalo", emoji: "🐴", preco: 900, producaoHora: 33, raridade: "Lendário" }
]

const SEMENTES = [
  { id: "milho", nome: "Milho", emoji: "🌽", preco: 30, vendaBase: 30, tempo: 20, raridade: "Comum" },
  { id: "trigo", nome: "Trigo", emoji: "🌾", preco: 25, vendaBase: 25, tempo: 18, raridade: "Comum" },
  { id: "arroz", nome: "Arroz", emoji: "🍚", preco: 35, vendaBase: 35, tempo: 22, raridade: "Comum" },
  { id: "feijao", nome: "Feijão", emoji: "🫘", preco: 28, vendaBase: 28, tempo: 20, raridade: "Comum" },
  { id: "batata", nome: "Batata", emoji: "🥔", preco: 30, vendaBase: 30, tempo: 20, raridade: "Comum" },
  { id: "cenoura", nome: "Cenoura", emoji: "🥕", preco: 28, vendaBase: 28, tempo: 19, raridade: "Comum" },
  { id: "soja", nome: "Soja", emoji: "🫘", preco: 40, vendaBase: 40, tempo: 25, raridade: "Raro" },
  { id: "tomate", nome: "Tomate", emoji: "🍅", preco: 40, vendaBase: 40, tempo: 25, raridade: "Raro" },
  { id: "melancia", nome: "Melancia", emoji: "🍉", preco: 65, vendaBase: 65, tempo: 40, raridade: "Épico" },
  { id: "morango", nome: "Morango", emoji: "🍓", preco: 70, vendaBase: 70, tempo: 32, raridade: "Épico" },
  { id: "uva", nome: "Uva", emoji: "🍇", preco: 80, vendaBase: 80, tempo: 45, raridade: "Lendário" },
  { id: "cafe", nome: "Café", emoji: "☕", preco: 100, vendaBase: 100, tempo: 50, raridade: "Lendário" }
]

const STOCK_MAX = {
  sementes: {
    milho: 8, trigo: 8, arroz: 6, feijao: 6, batata: 6, cenoura: 6,
    soja: 3, tomate: 3,
    melancia: 2, morango: 2,
    uva: 1, cafe: 1
  },
  animais: { galinha: 5, galo: 4, porco: 2, ovelha: 2, vaca: 1, boi: 1, cavalo: 1 }
}

const RARIDADES = ["Comum", "Raro", "Épico", "Lendário"]
const PESOS_RARIDADE_VENDEDOR = { Comum: 0.30, Raro: 0.35, Épico: 0.25, Lendário: 0.10 }

function acharAnimal(nome) { const n = normalizar(nome); return ANIMAIS.find(a => normalizar(a.nome) === n) || ANIMAIS.find(a => a.id === n) || ANIMAIS.find(a => normalizar(a.nome).includes(n)) }
function acharSemente(nome) { const n = normalizar(nome); return SEMENTES.find(s => normalizar(s.nome) === n) || SEMENTES.find(s => s.id === n) || SEMENTES.find(s => normalizar(s.nome).includes(n)) }
function sortearRaridade(pesos) { const r = Math.random(); let acc = 0; for (const rar of RARIDADES) { acc += pesos[rar] || 0; if (r < acc) return rar } return "Comum" }
function itensPorRaridade(lista, raridade) { return lista.filter(x => x.raridade === raridade) }

function getFazenda(num) {
  const f = dbLer("fazenda.json", { usuarios: {} })
  f.usuarios = f.usuarios || {}
  f.usuarios[num] = f.usuarios[num] || { cercados: 0, limiteAnimais: 0, upgrades: 0, animais: [], sujeira: 0, ultimaRenda: Date.now(), rendaTotal: 0, rendaPendente: 0, terras: 0, agua: 0, sementes: {}, plantacoes: [] }
  const u = f.usuarios[num]
  u.terras = u.terras || 0; u.agua = u.agua || 0; u.sementes = u.sementes || {}; u.plantacoes = u.plantacoes || []; u.rendaPendente = u.rendaPendente || 0
  return { f, u }
}

function getLoja() {
  const loja = dbLer("fazendaloja.json", { sementes: {}, animais: {}, ultimoRestock: 0 })
  loja.sementes = loja.sementes || {}; loja.animais = loja.animais || {}
  if (Object.keys(loja.sementes).length === 0) { for (const [id, qtd] of Object.entries(STOCK_MAX.sementes)) loja.sementes[id] = qtd }
  if (Object.keys(loja.animais).length === 0) { for (const [id, qtd] of Object.entries(STOCK_MAX.animais)) loja.animais[id] = qtd }
  return loja
}
function salvarLoja(loja) { dbSalvar("fazendaloja.json", loja) }

function restockLoja() {
  const loja = getLoja()
  const agora = Date.now()
  if (agora - (loja.ultimoRestock || 0) < INTERVALO_RESTOCK) return false
  for (const [id, qtd] of Object.entries(STOCK_MAX.sementes)) loja.sementes[id] = qtd
  for (const [id, qtd] of Object.entries(STOCK_MAX.animais)) loja.animais[id] = qtd
  loja.ultimoRestock = agora
  salvarLoja(loja)
  return true
}

function getVendedores() {
  return dbLer("fazendavendedores.json", {
    sementes: { ativo: false, expiraEm: 0, chegouEm: 0, itens: [] },
    animais: { ativo: false, expiraEm: 0, chegouEm: 0, itens: [] },
    ultimoSemente: 0,
    ultimoAnimal: 0,
    ultimoEventoAgua: 0
  })
}
function salvarVendedores(v) { dbSalvar("fazendavendedores.json", v) }

function gerarOfertasSementes() {
  const ofertas = []; const usados = new Set()
  for (let i = 0; i < 5; i++) {
    const raridade = sortearRaridade(PESOS_RARIDADE_VENDEDOR)
    const pool = itensPorRaridade(SEMENTES, raridade).filter(x => !usados.has(x.id))
    if (!pool.length) continue
    const item = pool[Math.floor(Math.random() * pool.length)]
    usados.add(item.id)
    const preco = Math.floor(item.preco * 0.7)
    ofertas.push({ id: item.id, nome: item.nome, emoji: item.emoji, precoOriginal: item.preco, preco, raridade: item.raridade, vendaBase: item.vendaBase, tempo: item.tempo })
  }
  return ofertas
}
function gerarOfertasAnimais() {
  const ofertas = []; const usados = new Set()
  for (let i = 0; i < 5; i++) {
    const raridade = sortearRaridade(PESOS_RARIDADE_VENDEDOR)
    const pool = itensPorRaridade(ANIMAIS, raridade).filter(x => !usados.has(x.id))
    if (!pool.length) continue
    const item = pool[Math.floor(Math.random() * pool.length)]
    usados.add(item.id)
    const preco = Math.floor(item.preco * 0.75)
    ofertas.push({ id: item.id, nome: item.nome, emoji: item.emoji, precoOriginal: item.preco, preco, raridade: item.raridade, producaoHora: item.producaoHora })
  }
  return ofertas
}

function calcularRenda(user) {
  if (!user.animais || !user.animais.length) return 0
  let renda = 0
  for (const a of user.animais) {
    const info = ANIMAIS.find(x => x.id === a.id)
    if (!info) continue
    let prod = info.producaoHora
    prod *= (1 - Math.min(a.fome || 0, 100) / 200)
    prod *= (1 - Math.min(a.sujo || 0, 100) / 200)
    renda += prod
  }
  renda *= (1 - Math.min(user.sujeira || 0, 100) / 200)
  renda *= (1 + (user.upgrades || 0) * 0.05)
  return renda
}

function nivelFazenda(user) { const total = user.limiteAnimais || 0; if (total === 0) return 0; return Math.floor(total / CAP_UPGRADE) }
function qualidadePlanta(p) {
  const regas = p.regas || 0
  let q = Math.min(100, Math.floor(regas * 15 + (p.qualidadeBase || 50)))
  if (Array.isArray(p.mutacoes)) {
    for (const mId of p.mutacoes) {
      const mut = MUTACOES[mId]
      if (mut) q = Math.min(100, q + Math.floor(mut.bonus * 5))
    }
  }
  return q
}
function valorPlanta(p) {
  const s = SEMENTES.find(x => x.id === p.id)
  if (!s) return 0
  const q = qualidadePlanta(p)
  let valor = Math.floor(s.vendaBase * (0.5 + q / 100))
  if (Array.isArray(p.mutacoes) && p.mutacoes.length > 0) {
    let bonusTotal = 1
    for (const mId of p.mutacoes) {
      const mut = MUTACOES[mId]
      if (mut) bonusTotal *= mut.bonus
    }
    valor = Math.floor(valor * bonusTotal)
  }
  return valor
}

function sistemaFazendaAtivo(db, jid) {
  const cfg = dbLer("fazendacfg.json", { grupos: {} })
  return cfg.grupos[jid]?.ativo === true
}

module.exports = {
  menu: "menu-fazenda",
  grupoOnly: false,
  adminOnly: false,
  donoOnly: false,  async rendaAutomatica(sock, db) {
    const f = dbLer("fazenda.json", { usuarios: {} })
    let alterou = false
    const agora = Date.now()

    const restockAgora = restockLoja()

    const cfgFaz = dbLer("fazendacfg.json", { grupos: {} })
    const gruposAtivos = Object.keys(cfgFaz.grupos || {}).filter(j => cfgFaz.grupos[j]?.ativo === true)

    if (restockAgora) {
      for (const jid of gruposAtivos) {
        try {
          await sock.sendMessage(jid, { text: `${boxTop("𝐋𝐎𝐉𝐀 𝐀𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐃𝐀")}

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐀𝐕𝐈𝐒𝐎 𓆪
↳ O estoque da loja foi reabastecido!
↳ Sementes raras têm estoque baixo!
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒 𓆪
↳ \`+sementes\`
↳ \`+animais\`
╰┈┈┈┈୨୧┈┈┈┈╯

${boxFim(nomeBotDb(db), "Corre que acaba!")}` })
          await new Promise(r => setTimeout(r, 1500))
        } catch (_) {}
      }
    }

    if (gruposAtivos.length > 0) {
      const v = getVendedores()

      if (agora - (v.ultimoSemente || 0) >= INTERVALO_VENDEDOR_SEMENTE) {
        v.sementes = { ativo: true, expiraEm: agora + DURACAO_VENDEDOR, chegouEm: agora, itens: gerarOfertasSementes() }
        v.ultimoSemente = agora
        for (const jid of gruposAtivos) {
          try {
            await sock.sendMessage(jid, { text: `${boxTop("𝐕𝐄𝐍𝐃𝐄𝐃𝐎𝐑 𝐃𝐄 𝐒𝐄𝐌𝐄𝐍𝐓𝐄𝐒")}

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐀𝐕𝐈𝐒𝐎 𓆪
↳ Vendedor ambulante chegou!
↳ Sementes com -30%
↳ Janela: 30 minutos
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒 𓆪
↳ \`+vendedorsementes\`
↳ \`+comprarvendedor <nome>\`
╰┈┈┈┈୨୧┈┈┈┈╯

${boxFim(nomeBotDb(db), "Corre que é por tempo limitado!")}` })
            await new Promise(r => setTimeout(r, 1500))
          } catch (_) {}
        }
        alterou = true
      }

      if (agora - (v.ultimoAnimal || 0) >= INTERVALO_VENDEDOR_ANIMAL) {
        v.animais = { ativo: true, expiraEm: agora + DURACAO_VENDEDOR, chegouEm: agora, itens: gerarOfertasAnimais() }
        v.ultimoAnimal = agora
        for (const jid of gruposAtivos) {
          try {
            await sock.sendMessage(jid, { text: `${boxTop("𝐕𝐄𝐍𝐃𝐄𝐃𝐎𝐑 𝐃𝐄 𝐀𝐍𝐈𝐌𝐀𝐈𝐒")}

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐀𝐕𝐈𝐒𝐎 𓆪
↳ Vendedor de animais chegou!
↳ Animais com -25%
↳ Janela: 30 minutos
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒 𓆪
↳ \`+vendedoranimais\`
↳ \`+comprarvendedoranimal <nome>\`
╰┈┈┈┈୨୧┈┈┈┈╯

${boxFim(nomeBotDb(db), "Aproveite enquanto há!")}` })
            await new Promise(r => setTimeout(r, 1500))
          } catch (_) {}
        }
        alterou = true
      }

      if (agora - (v.ultimoEventoAgua || 0) >= INTERVALO_EVENTO_AGUA) {
        v.ultimoEventoAgua = agora
        for (const jid of gruposAtivos) {
          try {
            await sock.sendMessage(jid, { text: `${boxTop("𝐄𝐕𝐄𝐍𝐓𝐎 𝐀́𝐆𝐔𝐀")}

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐏𝐑𝐎𝐌𝐎𝐂̧𝐀̃𝐎 𓆪
↳ 3 galões de água por 60 GoldFZ!
↳ Normal: 150 GoldFZ
↳ Janela: 30 minutos
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐂𝐎𝐌𝐀𝐍𝐃𝐎 𓆪
↳ \`+eventoagua\`
╰┈┈┈┈୨୧┈┈┈┈╯

${boxFim(nomeBotDb(db), "Corre que acaba!")}` })
            await new Promise(r => setTimeout(r, 1500))
          } catch (_) {}
        }
        alterou = true
      }

      if (alterou) salvarVendedores(v)
    }

    for (const [num, user] of Object.entries(f.usuarios || {})) {
      if (user.plantacoes) {
        for (const p of user.plantacoes) {
          if (p.pronta) continue
          const s = SEMENTES.find(x => x.id === p.id)
          if (!s) continue
          const tempoNecessario = s.tempo * 60 * 1000
          const regasBonus = (p.regas || 0) * 2 * 60 * 1000
          const tempoFinal = Math.max(60 * 1000, tempoNecessario - regasBonus)
          if (agora - p.plantadaEm >= tempoFinal) { p.pronta = true; p.prontaEm = agora; alterou = true }
        }
      }
      if (!user.animais || !user.animais.length) continue
      if (agora - (user.ultimaRenda || 0) < INTERVALO_RENDA) continue
      const renda3h = calcularRenda(user) * 3
      user.rendaPendente = (user.rendaPendente || 0) + renda3h
      user.rendaTotal = (user.rendaTotal || 0) + renda3h
      for (const a of user.animais) { a.fome = Math.min(100, (a.fome || 0) + 20); a.sujo = Math.min(100, (a.sujo || 0) + 15) }
      user.sujeira = Math.min(100, (user.sujeira || 0) + 20)
      user.ultimaRenda = agora
      alterou = true
    }
    if (alterou) dbSalvar("fazenda.json", f)
  },

  commands: {

    menufazenda: {
      aliases: ["fazenda", "menuf", "comandosfazenda"],
      async executar({ sock, msg, prefixoAtivo, db, sender, config, isDono, isSubDono, isAdmin, groupMetadata }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const cfg = getCfg(db)
        const { pushName, nomeDono, cargo, nomeBot } = getCargoETexto({ sender, config, db, groupMetadata, isDono, isSubDono, isAdmin, msg })
        await reagir(sock, msg, "🌸")

        const texto = `${cardPerfil({ nomeBot, nomeUsuario: pushName, cargo, dono: nomeDono })}

${secao("𝐆𝐎𝐋𝐃 𝐅𝐙")}
${item(`${p}saldofz`)}
${item(`${p}gerarkeyfz <qtd>`)}
${item(`${p}keygoldfz <key>`)}
${fimSecao()}

${secao("𝐑𝐄𝐒𝐆𝐀𝐓𝐀𝐑")}
${item(`${p}resgatarfazenda`)}
${fimSecao()}

${secao("𝐀𝐍𝐈𝐌𝐀𝐈𝐒")}
${item(`${p}animais`)}
${item(`${p}compraranimal <nome>`)}
${item(`${p}venderanimal <nome>`)}
${item(`${p}statusanimais`)}
${fimSecao()}

${secao("𝐒𝐄𝐌𝐄𝐍𝐓𝐄𝐒")}
${item(`${p}sementes`)}
${item(`${p}comprarsemente <nome> <qtd>`)}
${item(`${p}plantarsemente <nome>`)}
${item(`${p}regarsementes`)}
${item(`${p}regarplanta <nome>`)}
${item(`${p}venderplanta <nome>`)}
${item(`${p}statusplanta`)}
${fimSecao()}

${secao("𝐂𝐄𝐑𝐂𝐀𝐒 & 𝐓𝐄𝐑𝐑𝐀𝐒")}
${item(`${p}comprarcercado`)}
${item(`${p}comprarterra`)}
${item(`${p}compraragua <qtd>`)}
${fimSecao()}

${secao("𝐂𝐔𝐈𝐃𝐀𝐃𝐎𝐒")}
${item(`${p}alimentaranimais`)}
${item(`${p}banhoanimais`)}
${item(`${p}limparfazenda`)}
${fimSecao()}

${secao("𝐕𝐄𝐍𝐃𝐄𝐃𝐎𝐑𝐄𝐒")}
${item(`${p}vendedorsementes`)}
${item(`${p}comprarvendedor <nome>`)}
${item(`${p}vendedoranimais`)}
${item(`${p}comprarvendedoranimal <nome>`)}
${item(`${p}eventoagua`)}
${fimSecao()}

${secao("𝐒𝐓𝐀𝐓𝐔𝐒")}
${item(`${p}statusfazenda`)}
${fimSecao()}

╔═══ஓ๑♡๑ஓ═══╗
𓆩 𝐏𝐑𝐄𝐅𝐈𝐗𝐎 𓆪
↳ \`${p}\`
╚═══ஓ๑♡๑ஓ═══╝

${boxFim(nomeBot, "A renda acumula de 3h em 3h!")}`

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

    fazenda: {
      aliases: ["fazendaon", "fazendaoff", "ativarfazenda"],
      async executar({ sock, msg, args, db, prefixoAtivo, isDono, isSubDono, isAdmin }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const nomeBot = nomeBotDb(db)
        const op = (args[0] || "").toLowerCase()

        if (!isDono && !isSubDono && !isAdmin) {
          await reagir(sock, msg, "💨")
          return sock.sendMessage(jid, { text: msgErro("𝐀𝐕𝐈𝐒𝐎", "Apenas admins podem ativar.", `Use \`${p}menuadm\` para ver os comandos.`, null, nomeBot) }, { quoted: msg })
        }

        const cfg = dbLer("fazendacfg.json", { grupos: {} })
        cfg.grupos[jid] = cfg.grupos[jid] || {}

        if (!["on", "off"].includes(op)) {
          const s = cfg.grupos[jid].ativo ? "ON ✅" : "OFF ❌"
          await reagir(sock, msg, "🌸")
          return sock.sendMessage(jid, { text: msgAviso("𝐅𝐀𝐙𝐄𝐍𝐃𝐀", `Sistema atualmente: ${s}`, `Use \`${p}fazenda on\` ou \`${p}fazenda off\``, null, nomeBot) }, { quoted: msg })
        }

        cfg.grupos[jid].ativo = op === "on"
        dbSalvar("fazendacfg.json", cfg)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐅𝐀𝐙𝐄𝐍𝐃𝐀", `Sistema ${op.toUpperCase()}`, op === "on" ? "Os comandos voltaram!" : "O modo fazenda está desativado.", null, nomeBot) }, { quoted: msg })
      }
    },

    saldofz: {
      aliases: ["goldfz", "meugoldfz", "meusaldo"],
      async executar({ sock, msg, db, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const num = soNumero(sender)
        const { saldo } = getGoldFZ(num)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, {
          text: msgSucesso("𝐆𝐎𝐋𝐃𝐅𝐙", "Saldo da fazenda.", `Você tem *${saldo} GoldFZ*`, "Use `+keygoldfz <key>` para adicionar.", nomeBot)
        }, { quoted: msg })
      }
    },

    resgatarfazenda: {
      aliases: ["resgatar", "coletar", "coletarfazenda"],
      async executar({ sock, msg, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const cfg = dbLer("fazendacfg.json", { grupos: {} })
        if (!cfg.grupos[jid]?.ativo) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐅𝐀𝐙𝐄𝐍𝐃𝐀 𝐎𝐅𝐅", "O modo fazenda está desativado.", `Peça a um admin para ativar.`, `Use \`${prefixoAtivo || "+"}fazenda on\``, nomeBotDb(db)) }, { quoted: msg }) }

        const nomeBot = nomeBotDb(db)
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        const pendente = u.rendaPendente || 0
        if (pendente <= 0) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐄𝐒𝐆𝐀𝐓𝐀𝐑", "Nada pra resgatar.", "Renda acumula a cada 3h", null, nomeBot) }, { quoted: msg }) }

        addGoldFZ(num, pendente)
        u.rendaPendente = 0
        dbSalvar("fazenda.json", f)
        const { saldo } = getGoldFZ(num)

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐑𝐄𝐒𝐆𝐀𝐓𝐄", "Renda coletada", `+${pendente} GoldFZ\nSaldo: ${saldo}`, null, nomeBot), mentions: [`${num}@s.whatsapp.net`] }, { quoted: msg })
      }
    },

    animais: {
      aliases: ["listaanimais", "lojaanimais"],
      async executar({ sock, msg, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const cfg = dbLer("fazendacfg.json", { grupos: {} })
        if (!cfg.grupos[jid]?.ativo) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐅𝐀𝐙𝐄𝐍𝐃𝐀 𝐎𝐅𝐅", "O modo fazenda está desativado.", `Peça a um admin para ativar.`, null, nomeBotDb(db)) }, { quoted: msg }) }

        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const loja = getLoja()
        await reagir(sock, msg, "🌸")
        let txt = `${boxTop("𝐋𝐎𝐉𝐀 𝐃𝐄 𝐀𝐍𝐈𝐌𝐀𝐈𝐒")}\n\n`
        for (const a of ANIMAIS) {
          const stock = loja.animais[a.id] || 0
          txt += `${secao(a.emoji + " " + a.nome.toUpperCase())}\n↳ 💰 ${a.preco} GoldFZ\n↳ 📈 +${a.producaoHora}/h\n↳ 📦 Stock: ${stock}\n${fimSecao()}\n`
        }
        txt += `\n╭┈┈┈┈୨୧┈┈┈┈╮\n𓆩 𝐂𝐎𝐌𝐏𝐑𝐀𝐑 𓆪\n↳ \`${p}compraranimal <nome>\`\n╰┈┈┈┈୨୧┈┈┈┈╯\n\n${boxFim(nomeBot, "Stock reabastece a cada 1h.")}`
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    comprarcercado: {
      aliases: ["cercado", "buycercado"],
      async executar({ sock, msg, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const cfg = dbLer("fazendacfg.json", { grupos: {} })
        if (!cfg.grupos[jid]?.ativo) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐅𝐀𝐙𝐄𝐍𝐃𝐀 𝐎𝐅𝐅", "O modo fazenda está desativado.", `Peça a um admin para ativar.`, null, nomeBotDb(db)) }, { quoted: msg }) }

        const nomeBot = nomeBotDb(db)
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        if (u.upgrades >= MAX_UPGRADES) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐂𝐄𝐑𝐂𝐀𝐃𝐎", "Máximo atingido.", `Upgrades: ${u.upgrades}/${MAX_UPGRADES}`, null, nomeBot) }, { quoted: msg }) }

        const { saldo } = getGoldFZ(num)
        const preco = u.upgrades === 0 ? 0 : PRECO_CERCADO
        if (saldo < preco) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐂𝐄𝐑𝐂𝐀𝐃𝐎", "GoldFZ insuficiente.", `Faltam ${preco - saldo} GoldFZ`, null, nomeBot) }, { quoted: msg }) }

        if (preco > 0) removeGoldFZ(num, preco)
        u.upgrades += 1; u.cercados += 1
        u.limiteAnimais = CAP_BASE + (u.upgrades - 1) * CAP_UPGRADE
        dbSalvar("fazenda.json", f)

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐂𝐄𝐑𝐂𝐀𝐃𝐎", "Mais espaço pros animais.", `Capacidade: ${u.limiteAnimais}\nUpgrades: ${u.upgrades}/${MAX_UPGRADES}`, null, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    compraranimal: {
      aliases: ["buyanimal", "adotaranimal"],
      async executar({ sock, msg, args, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const cfg = dbLer("fazendacfg.json", { grupos: {} })
        if (!cfg.grupos[jid]?.ativo) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐅𝐀𝐙𝐄𝐍𝐃𝐀 𝐎𝐅𝐅", "O modo fazenda está desativado.", `Peça a um admin para ativar.`, null, nomeBotDb(db)) }, { quoted: msg }) }

        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        if (u.cercados === 0) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐍𝐈𝐌𝐀𝐋", "Compre cercado primeiro.", `Use \`${p}comprarcercado\``, null, nomeBot) }, { quoted: msg }) }
        if (u.animais.length >= u.limiteAnimais) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐀𝐍𝐈𝐌𝐀𝐋", "Cercado cheio.", `Ocupado: ${u.animais.length}/${u.limiteAnimais}`, null, nomeBot) }, { quoted: msg }) }

        const animal = acharAnimal(args.join(" "))
        if (!animal) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐀𝐍𝐈𝐌𝐀𝐋", "Não achei.", `Veja \`${p}animais\``, null, nomeBot) }, { quoted: msg }) }

        const loja = getLoja()
        if ((loja.animais[animal.id] || 0) < 1) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐀𝐍𝐈𝐌𝐀𝐋", "Esgotado na loja.", `Stock: 0\nReabastece a cada 1h`, null, nomeBot) }, { quoted: msg }) }

        const { saldo } = getGoldFZ(num)
        if (saldo < animal.preco) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐀𝐍𝐈𝐌𝐀𝐋", "GoldFZ insuficiente.", `Faltam ${animal.preco - saldo} GoldFZ`, null, nomeBot) }, { quoted: msg }) }

        removeGoldFZ(num, animal.preco)
        u.animais.push({ id: animal.id, nome: animal.nome, emoji: animal.emoji, fome: 0, sujo: 0, compradoEm: Date.now() })
        loja.animais[animal.id] -= 1
        dbSalvar("fazenda.json", f); salvarLoja(loja)

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐍𝐈𝐌𝐀𝐋", "Novo animal.", `${animal.emoji} ${animal.nome}\nProdução: +${animal.producaoHora}/h\nStock restante: ${loja.animais[animal.id]}`, null, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    venderanimal: {
      aliases: ["vendaranimal", "sellanimal"],
      async executar({ sock, msg, args, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const cfg = dbLer("fazendacfg.json", { grupos: {} })
        if (!cfg.grupos[jid]?.ativo) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐅𝐀𝐙𝐄𝐍𝐃𝐀 𝐎𝐅𝐅", "O modo fazenda está desativado.", `Peça a um admin para ativar.`, null, nomeBotDb(db)) }, { quoted: msg }) }

        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        const busca = normalizar(args.join(" "))
        const idx = u.animais.findIndex(a => normalizar(a.nome) === busca || a.id === busca)
        if (idx === -1) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐕𝐄𝐍𝐃𝐄𝐑", "Você não tem esse.", `Veja \`${p}statusanimais\``, null, nomeBot) }, { quoted: msg }) }

        const a = u.animais[idx]
        const info = ANIMAIS.find(x => x.id === a.id)
        const valor = Math.floor((info?.preco || 100) * 0.5)
        u.animais.splice(idx, 1)
        addGoldFZ(num, valor)
        dbSalvar("fazenda.json", f)

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐕𝐄𝐍𝐃𝐈𝐃𝐎", "Animal vendido.", `${a.emoji} ${a.nome}\n+${valor} GoldFZ`, null, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },    alimentaranimais: {
      aliases: ["alimentaranimal", "feedanimais"],
      async executar({ sock, msg, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const cfg = dbLer("fazendacfg.json", { grupos: {} })
        if (!cfg.grupos[jid]?.ativo) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐅𝐀𝐙𝐄𝐍𝐃𝐀 𝐎𝐅𝐅", "O modo fazenda está desativado.", `Peça a um admin para ativar.`, null, nomeBotDb(db)) }, { quoted: msg }) }

        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        if (!u.animais.length) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐋𝐈𝐌𝐄𝐍𝐓𝐀𝐑", "Sem animais.", `Use \`${p}compraranimal\``, null, nomeBot) }, { quoted: msg }) }

        const { saldo } = getGoldFZ(num)
        if (saldo < PRECO_ALIMENTAR) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐀𝐋𝐈𝐌𝐄𝐍𝐓𝐀𝐑", "GoldFZ insuficiente.", `Precisa ${PRECO_ALIMENTAR} GoldFZ`, null, nomeBot) }, { quoted: msg }) }

        removeGoldFZ(num, PRECO_ALIMENTAR)
        let n = 0
        for (const a of u.animais) { if ((a.fome || 0) > 0) { a.fome = 0; n++ } }
        dbSalvar("fazenda.json", f)

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐋𝐈𝐌𝐄𝐍𝐓𝐀𝐃𝐎𝐒", "Todos alimentados.", `Animais: ${n}\nPago: -${PRECO_ALIMENTAR} GoldFZ`, null, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    banhoanimais: {
      aliases: ["banhoanimal", "lavaranimais"],
      async executar({ sock, msg, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const cfg = dbLer("fazendacfg.json", { grupos: {} })
        if (!cfg.grupos[jid]?.ativo) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐅𝐀𝐙𝐄𝐍𝐃𝐀 𝐎𝐅𝐅", "O modo fazenda está desativado.", `Peça a um admin para ativar.`, null, nomeBotDb(db)) }, { quoted: msg }) }

        const nomeBot = nomeBotDb(db)
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        if (!u.animais.length) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐁𝐀𝐍𝐇𝐎", "Sem animais.", `Use \`+compraranimal\``, null, nomeBot) }, { quoted: msg }) }

        const { saldo } = getGoldFZ(num)
        if (saldo < PRECO_BANHO) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐁𝐀𝐍𝐇𝐎", "GoldFZ insuficiente.", `Precisa ${PRECO_BANHO} GoldFZ`, null, nomeBot) }, { quoted: msg }) }

        removeGoldFZ(num, PRECO_BANHO)
        let n = 0
        for (const a of u.animais) { if ((a.sujo || 0) > 0) { a.sujo = 0; n++ } }
        dbSalvar("fazenda.json", f)

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐋𝐀𝐕𝐀𝐃𝐎𝐒", "Todos lavados.", `Animais: ${n}\nPago: -${PRECO_BANHO} GoldFZ`, null, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    limparfazenda: {
      aliases: ["limparfaz"],
      async executar({ sock, msg, utils, sender, db }) {
        const jid = msg.key.remoteJid
        const cfg = dbLer("fazendacfg.json", { grupos: {} })
        if (!cfg.grupos[jid]?.ativo) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐅𝐀𝐙𝐄𝐍𝐃𝐀 𝐎𝐅𝐅", "O modo fazenda está desativado.", `Peça a um admin para ativar.`, null, nomeBotDb(db)) }, { quoted: msg }) }

        const nomeBot = nomeBotDb(db)
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        if ((u.sujeira || 0) === 0) { await reagir(sock, msg, "🌸"); return sock.sendMessage(jid, { text: msgSucesso("𝐋𝐈𝐌𝐏𝐄𝐙𝐀", "Já tá limpa.", "Nada a fazer", null, nomeBot) }, { quoted: msg }) }
        u.sujeira = 0
        dbSalvar("fazenda.json", f)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐋𝐈𝐌𝐏𝐀", "Sujeira removida.", "Tudo brilhando!", null, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    statusfazenda: {
      aliases: ["fazendastatus", "minhafazenda"],
      async executar({ sock, msg, utils, sender, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const cfg = dbLer("fazendacfg.json", { grupos: {} })
        if (!cfg.grupos[jid]?.ativo) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐅𝐀𝐙𝐄𝐍𝐃𝐀 𝐎𝐅𝐅", "O modo fazenda está desativado.", `Peça a um admin para ativar.`, null, nomeBotDb(db)) }, { quoted: msg }) }

        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const num = soNumero(sender)
        const { u } = getFazenda(num)
        if (u.cercados === 0 && u.terras === 0) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐒𝐓𝐀𝐓𝐔𝐒", "Você não tem fazenda.", `Use \`${p}comprarcercado\``, null, nomeBot) }, { quoted: msg }) }

        const { saldo } = getGoldFZ(num)
        const nivel = nivelFazenda(u)
        const rendaHora = Math.floor(calcularRenda(u))
        const restante = Math.max(0, INTERVALO_RENDA - (Date.now() - (u.ultimaRenda || Date.now())))
        const h = Math.floor(restante / 3600000), m = Math.floor((restante % 3600000) / 60000)
        const tempo = h > 0 ? `${h}h ${m}min` : `${m}min`
        const cheio = Math.min(10, Math.floor(u.animais.length / Math.max(1, u.limiteAnimais) * 10))
        const barra = "🌸".repeat(cheio) + "⬛".repeat(10 - cheio)
        const statusSujeira = u.sujeira > 70 ? "🚨" : u.sujeira > 40 ? "❄️" : "✅"
        const prontas = (u.plantacoes || []).filter(p2 => p2.pronta).length

        const texto = `${boxTop("𝐒𝐓𝐀𝐓𝐔𝐒")}

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐔𝐒𝐔𝐀́𝐑𝐈𝐎 𓆪
↳ @${num}
↳ ${saldo} GoldFZ
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐄𝐒𝐓𝐑𝐔𝐓𝐔𝐑𝐀 𓆪
↳ Nível: ${nivel}
↳ Cercados: ${u.cercados}
↳ Terras: ${u.terras}
↳ Água: ${u.agua}L
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐀𝐍𝐈𝐌𝐀𝐈𝐒 𓆪
↳ ${u.animais.length}/${u.limiteAnimais}
↳ ${barra}
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐏𝐋𝐀𝐍𝐓𝐀𝐂̧𝐎̃𝐄𝐒 𓆪
↳ Total: ${u.plantacoes.length}
↳ Prontas: ${prontas}
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐒𝐔𝐉𝐄𝐈𝐑𝐀 𓆪
↳ ${u.sujeira}% ${statusSujeira}
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐑𝐄𝐍𝐃𝐀 𓆪
↳ ${rendaHora}/h
↳ Pendente: ${u.rendaPendente || 0}
↳ Próxima: ${tempo}
↳ Total: ${u.rendaTotal || 0}
↳ Upgrades: ${u.upgrades}/${MAX_UPGRADES}
╰┈┈┈┈୨୧┈┈┈┈╯

${boxFim(nomeBot, "Use resgatarfazenda.")}`

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: texto, mentions: [`${num}@s.whatsapp.net`] }, { quoted: msg })
      }
    },

    statusanimais: {
      aliases: ["meusanimais", "veranimais"],
      async executar({ sock, msg, utils, sender, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const cfg = dbLer("fazendacfg.json", { grupos: {} })
        if (!cfg.grupos[jid]?.ativo) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐅𝐀𝐙𝐄𝐍𝐃𝐀 𝐎𝐅𝐅", "O modo fazenda está desativado.", `Peça a um admin para ativar.`, null, nomeBotDb(db)) }, { quoted: msg }) }

        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const num = soNumero(sender)
        const { u } = getFazenda(num)
        if (!u.animais.length) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐍𝐈𝐌𝐀𝐈𝐒", "Você não tem animais.", `Use \`${p}compraranimal\``, null, nomeBot) }, { quoted: msg }) }

        let txt = `${boxTop(`𝐀𝐍𝐈𝐌𝐀𝐈𝐒 (${u.animais.length}/${u.limiteAnimais})`)}\n\n`
        for (const a of u.animais) {
          const fomeIco = a.fome > 70 ? "🚨" : a.fome > 40 ? "❄️" : "✅"
          const sujoIco = a.sujo > 70 ? "🚨" : a.sujo > 40 ? "❄️" : "✅"
          txt += `╭┈┈┈┈୨୧┈┈┈┈╮\n𓆩 ${a.emoji} ${a.nome} 𓆪\n↳ Fome: ${fomeIco} ${a.fome}%\n↳ Sujo: ${sujoIco} ${a.sujo}%\n╰┈┈┈┈୨୧┈┈┈┈╯\n`
        }
        txt += `\n${boxFim(nomeBot)}`
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: txt, mentions: [sender] }, { quoted: msg })
      }
    },

    sementes: {
      aliases: ["lojasementes", "listarsementes"],
      async executar({ sock, msg, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const cfg = dbLer("fazendacfg.json", { grupos: {} })
        if (!cfg.grupos[jid]?.ativo) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐅𝐀𝐙𝐄𝐍𝐃𝐀 𝐎𝐅𝐅", "O modo fazenda está desativado.", `Peça a um admin para ativar.`, null, nomeBotDb(db)) }, { quoted: msg }) }

        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const loja = getLoja()
        await reagir(sock, msg, "🌸")

        const grupos = { Comum: [], Raro: [], Épico: [], Lendário: [] }
        for (const s of SEMENTES) { if (!grupos[s.raridade]) grupos[s.raridade] = []; grupos[s.raridade].push(s) }
        const emojiRar = { Comum: "🟢", Raro: "💙", Épico: "💜", Lendário: "🌟" }

        let txt = `${boxTop("𝐋𝐎𝐉𝐀 𝐃𝐄 𝐒𝐄𝐌𝐄𝐍𝐓𝐄𝐒")}

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐈𝐍𝐅𝐎 𓆪
↳ Stock reabastece a cada 1h
↳ Sementes raras têm stock baixo
↳ \`${p}comprarsemente <nome> <qtd>\`
╰┈┈┈┈୨୧┈┈┈┈╯
`
        for (const raridade of ["Comum", "Raro", "Épico", "Lendário"]) {
          const lista = grupos[raridade] || []
          if (!lista.length) continue
          txt += `\n${secao(`${emojiRar[raridade]} ${raridade.toUpperCase()}`)}\n`
          for (const s of lista) {
            const stock = loja.sementes[s.id] || 0
            const stockTxt = stock === 0 ? "🚫 ESGOTADO" : `📦 ${stock}`
            txt += `╭┈┈┈┈୨୧┈┈┈┈╮\n𓆩 ${s.emoji} ${s.nome} 𓆪\n↳ 💰 ${s.preco} GoldFZ\n↳ ⏰ ${s.tempo}min\n↳ 💵 ~${s.vendaBase}/h\n↳ ${stockTxt}\n╰┈┈┈┈୨୧┈┈┈┈╯\n`
          }
          txt += `${fimSecao()}\n`
        }
        txt += `\n${boxFim(nomeBot, "Corre que o stock acaba!")}`
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    comprarsemente: {
      aliases: ["buysemente"],
      async executar({ sock, msg, args, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const cfg = dbLer("fazendacfg.json", { grupos: {} })
        if (!cfg.grupos[jid]?.ativo) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐅𝐀𝐙𝐄𝐍𝐃𝐀 𝐎𝐅𝐅", "O modo fazenda está desativado.", `Peça a um admin para ativar.`, null, nomeBotDb(db)) }, { quoted: msg }) }

        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        if (u.terras === 0) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐒𝐄𝐌𝐄𝐍𝐓𝐄", "Compre terra primeiro.", `Use \`${p}comprarterra\``, null, nomeBot) }, { quoted: msg }) }

        let qtd = 1
        const ultimo = args[args.length - 1]
        if (/^\d+$/.test(ultimo)) { qtd = parseInt(ultimo); args.pop() }
        const sem = acharSemente(args.join(" "))
        if (!sem) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌𝐄𝐍𝐓𝐄", "Não achei.", `Veja \`${p}sementes\``, null, nomeBot) }, { quoted: msg }) }

        const loja = getLoja()
        if ((loja.sementes[sem.id] || 0) < qtd) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌𝐄𝐍𝐓𝐄", "Stock insuficiente.", `Stock: ${loja.sementes[sem.id] || 0}`, null, nomeBot) }, { quoted: msg }) }

        const total = sem.preco * qtd
        const { saldo } = getGoldFZ(num)
        if (saldo < total) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌𝐄𝐍𝐓𝐄", "GoldFZ insuficiente.", `Faltam ${total - saldo} GoldFZ`, null, nomeBot) }, { quoted: msg }) }

        removeGoldFZ(num, total)
        u.sementes[sem.id] = (u.sementes[sem.id] || 0) + qtd
        loja.sementes[sem.id] -= qtd
        dbSalvar("fazenda.json", f); salvarLoja(loja)

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐒𝐄𝐌𝐄𝐍𝐓𝐄", "Adicionada ao estoque.", `${sem.emoji} ${sem.nome} x${qtd}\nPago: -${total} GoldFZ`, null, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    comprarterra: {
      aliases: ["terra", "buyterra"],
      async executar({ sock, msg, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const cfg = dbLer("fazendacfg.json", { grupos: {} })
        if (!cfg.grupos[jid]?.ativo) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐅𝐀𝐙𝐄𝐍𝐃𝐀 𝐎𝐅𝐅", "O modo fazenda está desativado.", `Peça a um admin para ativar.`, null, nomeBotDb(db)) }, { quoted: msg }) }

        const nomeBot = nomeBotDb(db)
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        if (u.terras >= 20) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐓𝐄𝐑𝐑𝐀", "Máximo 20 terras.", `Terras: ${u.terras}`, null, nomeBot) }, { quoted: msg }) }

        const { saldo } = getGoldFZ(num)
        const preco = PRECO_TERRA + u.terras * 200
        if (saldo < preco) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐓𝐄𝐑𝐑𝐀", "GoldFZ insuficiente.", `Precisa ${preco} | Faltam ${preco - saldo}`, null, nomeBot) }, { quoted: msg }) }

        removeGoldFZ(num, preco)
        u.terras += 1
        dbSalvar("fazenda.json", f)

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐓𝐄𝐑𝐑𝐀", "Mais espaço pra plantação.", `Total: ${u.terras}\nPago: -${preco} GoldFZ`, null, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    compraragua: {
      aliases: ["agua", "buyagua"],
      async executar({ sock, msg, args, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const cfg = dbLer("fazendacfg.json", { grupos: {} })
        if (!cfg.grupos[jid]?.ativo) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐅𝐀𝐙𝐄𝐍𝐃𝐀 𝐎𝐅𝐅", "O modo fazenda está desativado.", `Peça a um admin para ativar.`, null, nomeBotDb(db)) }, { quoted: msg }) }

        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        const qtd = parseInt(args[0]) || 10
        if (qtd < 1 || qtd > 100) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐀́𝐆𝐔𝐀", "Qtd inválida.", `Use \`${p}compraragua <1-100>\``, null, nomeBot) }, { quoted: msg }) }

        const total = PRECO_AGUA * qtd
        const { saldo } = getGoldFZ(num)
        if (saldo < total) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐀́𝐆𝐔𝐀", "GoldFZ insuficiente.", `Faltam ${total - saldo} GoldFZ`, null, nomeBot) }, { quoted: msg }) }

        removeGoldFZ(num, total)
        u.agua += qtd
        dbSalvar("fazenda.json", f)

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐀́𝐆𝐔𝐀", "Estoque atualizado.", `+${qtd}L\nTotal: ${u.agua}L\nPago: -${total} GoldFZ`, null, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    plantarsemente: {
      aliases: ["plantar", "plant"],
      async executar({ sock, msg, args, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const cfg = dbLer("fazendacfg.json", { grupos: {} })
        if (!cfg.grupos[jid]?.ativo) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐅𝐀𝐙𝐄𝐍𝐃𝐀 𝐎𝐅𝐅", "O modo fazenda está desativado.", `Peça a um admin para ativar.`, null, nomeBotDb(db)) }, { quoted: msg }) }

        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        if (u.terras === 0) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐏𝐋𝐀𝐍𝐓𝐀𝐑", "Sem terra!", `Use \`${p}comprarterra\``, null, nomeBot) }, { quoted: msg }) }
        if (u.plantacoes.length >= u.terras) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐏𝐋𝐀𝐍𝐓𝐀𝐑", "Terras ocupadas.", `Ocupadas: ${u.plantacoes.length}/${u.terras}`, null, nomeBot) }, { quoted: msg }) }

        const sem = acharSemente(args.join(" "))
        if (!sem) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐏𝐋𝐀𝐍𝐓𝐀𝐑", "Não achei.", `Veja \`${p}sementes\``, null, nomeBot) }, { quoted: msg }) }
        if ((u.sementes[sem.id] || 0) < 1) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐏𝐋𝐀𝐍𝐓𝐀𝐑", "Não tem essa semente.", `Semente: ${sem.nome}`, null, nomeBot) }, { quoted: msg }) }

        u.sementes[sem.id] -= 1
        if (u.sementes[sem.id] === 0) delete u.sementes[sem.id]

        const mutacoes = sortearMutacoes()

        u.plantacoes.push({
          id: sem.id, nome: sem.nome, emoji: sem.emoji,
          plantadaEm: Date.now(),
          regas: 0,
          qualidadeBase: 30,
          pronta: false,
          prontaEm: null,
          mutacoes: mutacoes
        })
        dbSalvar("fazenda.json", f)

        let avisoMut = ""
        if (mutacoes.length > 0) {
          avisoMut = `\n\n`
          for (const mId of mutacoes) {
            const mut = MUTACOES[mId]
            if (mut) avisoMut += `${mut.emoji} *MUTAÇÃO ${mut.nome.toUpperCase()}!*\nBônus: x${mut.bonus}\n`
          }
        }

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐋𝐀𝐍𝐓𝐀𝐃𝐀", "Semente no chão.", `${sem.emoji} ${sem.nome}\nTempo: ~${sem.tempo}min${avisoMut}\n\nUse \`${p}regarplanta ${sem.nome}\``, null, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    regarsementes: {
      aliases: ["regartudo", "regartodas"],
      async executar({ sock, msg, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const cfg = dbLer("fazendacfg.json", { grupos: {} })
        if (!cfg.grupos[jid]?.ativo) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐅𝐀𝐙𝐄𝐍𝐃𝐀 𝐎𝐅𝐅", "O modo fazenda está desativado.", `Peça a um admin para ativar.`, null, nomeBotDb(db)) }, { quoted: msg }) }

        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        if (!u.plantacoes.length) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐄𝐆𝐀𝐑", "Sem plantações.", `Use \`${p}plantarsemente\``, null, nomeBot) }, { quoted: msg }) }
        if (u.agua < AGUA_POR_REGA) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐑𝐄𝐆𝐀𝐑", "Sem água.", `Use \`${p}compraragua\``, null, nomeBot) }, { quoted: msg }) }

        let regadas = 0
        for (const p2 of u.plantacoes) {
          if (u.agua < AGUA_POR_REGA) break
          if (p2.pronta) continue
          u.agua -= AGUA_POR_REGA
          p2.regas = (p2.regas || 0) + 1
          p2.qualidadeBase = Math.min(100, (p2.qualidadeBase || 30) + 5)
          regadas++
        }
        dbSalvar("fazenda.json", f)

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐑𝐄𝐆𝐀𝐃𝐀𝐒", "Rega em massa.", `Regadas: ${regadas}\nÁgua: ${u.agua}L`, null, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    regarplanta: {
      aliases: ["regar"],
      async executar({ sock, msg, args, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const cfg = dbLer("fazendacfg.json", { grupos: {} })
        if (!cfg.grupos[jid]?.ativo) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐅𝐀𝐙𝐄𝐍𝐃𝐀 𝐎𝐅𝐅", "O modo fazenda está desativado.", `Peça a um admin para ativar.`, null, nomeBotDb(db)) }, { quoted: msg }) }

        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        if (u.agua < AGUA_POR_REGA) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐑𝐄𝐆𝐀𝐑", "Sem água.", `Use \`${p}compraragua\``, null, nomeBot) }, { quoted: msg }) }

        const busca = normalizar(args.join(" "))
        const planta = u.plantacoes.find(x => normalizar(x.nome) === busca || x.id === busca || normalizar(x.nome).includes(busca))
        if (!planta) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐑𝐄𝐆𝐀𝐑", "Planta não encontrada.", `Veja \`${p}statusplanta\``, null, nomeBot) }, { quoted: msg }) }
        if (planta.pronta) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐄𝐆𝐀𝐑", "Já está pronta.", `Use ${p}venderplanta ${planta.nome}`, null, nomeBot) }, { quoted: msg }) }

        u.agua -= AGUA_POR_REGA
        planta.regas = (planta.regas || 0) + 1
        planta.qualidadeBase = Math.min(100, (planta.qualidadeBase || 30) + 5)
        dbSalvar("fazenda.json", f)

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐑𝐄𝐆𝐀𝐃𝐀", "Planta regada.", `${planta.emoji} ${planta.nome}\nÁgua: ${u.agua}L\nRegas: ${planta.regas}`, null, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    venderplanta: {
      aliases: ["vender", "colher"],
      async executar({ sock, msg, args, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const cfg = dbLer("fazendacfg.json", { grupos: {} })
        if (!cfg.grupos[jid]?.ativo) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐅𝐀𝐙𝐄𝐍𝐃𝐀 𝐎𝐅𝐅", "O modo fazenda está desativado.", `Peça a um admin para ativar.`, null, nomeBotDb(db)) }, { quoted: msg }) }

        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        const busca = normalizar(args.join(" "))
        if (!busca) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐕𝐄𝐍𝐃𝐄𝐑", "Informe o nome.", `\`${p}venderplanta <nome>\``, null, nomeBot) }, { quoted: msg }) }

        const idx = u.plantacoes.findIndex(x => normalizar(x.nome) === busca || x.id === busca || normalizar(x.nome).includes(busca))
        if (idx === -1) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐕𝐄𝐍𝐃𝐄𝐑", "Você não tem.", `Veja \`${p}statusplanta\``, null, nomeBot) }, { quoted: msg }) }

        const planta = u.plantacoes[idx]
        if (!planta.pronta) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐕𝐄𝐍𝐃𝐄𝐑", "Ainda não está pronta.", `Planta: ${planta.nome}`, null, nomeBot) }, { quoted: msg }) }

        const valor = valorPlanta(planta)
        const qualidade = qualidadePlanta(planta)
        u.plantacoes.splice(idx, 1)
        addGoldFZ(num, valor)
        dbSalvar("fazenda.json", f)

        let mutTxt = ""
        if (Array.isArray(planta.mutacoes) && planta.mutacoes.length > 0) {
          for (const mId of planta.mutacoes) {
            const mut = MUTACOES[mId]
            if (mut) mutTxt += `\n${mut.emoji} ${mut.nome} (x${mut.bonus})`
          }
        }

        const estrelas = qualidade >= 90 ? "💧💧" : qualidade >= 70 ? "💧" : ""
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐕𝐄𝐍𝐃𝐈𝐃𝐀", "Colheita vendida.", `${planta.emoji} ${planta.nome}${mutTxt}\nQualidade: ${qualidade}% ${estrelas}\n+${valor} GoldFZ`, null, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    statusplanta: {
      aliases: ["minhasplantas", "plantacoes"],
      async executar({ sock, msg, utils, sender, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const cfg = dbLer("fazendacfg.json", { grupos: {} })
        if (!cfg.grupos[jid]?.ativo) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐅𝐀𝐙𝐄𝐍𝐃𝐀 𝐎𝐅𝐅", "O modo fazenda está desativado.", `Peça a um admin para ativar.`, null, nomeBotDb(db)) }, { quoted: msg }) }

        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const num = soNumero(sender)
        const { u } = getFazenda(num)
        if (!u.plantacoes.length) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐏𝐋𝐀𝐍𝐓𝐀𝐒", "Sem plantações.", `Use \`${p}plantarsemente\``, null, nomeBot) }, { quoted: msg }) }

        const agora = Date.now()
        let txt = `${boxTop(`𝐏𝐋𝐀𝐍𝐓𝐀𝐂̧𝐎̃𝐄𝐒 (${u.plantacoes.length}/${u.terras})`)}\n\n`

        for (const planta of u.plantacoes) {
          const s = SEMENTES.find(x => x.id === planta.id)
          if (!s) continue
          const tempoNecessario = s.tempo * 60 * 1000
          const regasBonus = (planta.regas || 0) * 2 * 60 * 1000
          const tempoFinal = Math.max(60 * 1000, tempoNecessario - regasBonus)
          const decorrido = agora - planta.plantadaEm
          const restante = Math.max(0, tempoFinal - decorrido)
          const progresso = Math.min(100, Math.floor((decorrido / tempoFinal) * 100))
          const min = Math.floor(restante / 60000)
          const seg = Math.floor((restante % 60000) / 1000)
          const tempoTxt = planta.pronta ? "✅ Pronta!" : `${min}min ${seg}s`
          const q = qualidadePlanta(planta)
          const estrelas = q >= 90 ? "💧💧" : q >= 70 ? "💧" : ""
          let mutTxt = ""
          if (Array.isArray(planta.mutacoes) && planta.mutacoes.length > 0) {
            for (const mId of planta.mutacoes) { const mut = MUTACOES[mId]; if (mut) mutTxt += ` ${mut.emoji}` }
          }
          txt += `╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 ${planta.emoji} ${planta.nome}${mutTxt} 𓆪
↳ ${planta.pronta ? "✅ Pronta" : `⏰ ${tempoTxt}`}
↳ 🌱 Crescimento: ${progresso}%
↳ 💧 Qualidade: ${q}% ${estrelas}
↳ 🚿 Regas: ${planta.regas || 0}
╰┈┈┈┈୨୧┈┈┈┈╯
`
        }
        txt += `\n${boxFim(nomeBot)}`
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: txt, mentions: [sender] }, { quoted: msg })
      }
    },

    vendedorsementes: {
      aliases: ["vsementes", "vendorsementes"],
      async executar({ sock, msg, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const cfg = dbLer("fazendacfg.json", { grupos: {} })
        if (!cfg.grupos[jid]?.ativo) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐅𝐀𝐙𝐄𝐍𝐃𝐀 𝐎𝐅𝐅", "O modo fazenda está desativado.", `Peça a um admin para ativar.`, null, nomeBotDb(db)) }, { quoted: msg }) }

        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const v = getVendedores()
        if (!v.sementes.ativo || Date.now() > v.sementes.expiraEm) {
          await reagir(sock, msg, "💧")
          return sock.sendMessage(jid, { text: msgAviso("𝐕𝐄𝐍𝐃𝐄𝐃𝐎𝐑", "O vendedor de sementes foi embora.", "Aguarde o próximo (4h)", null, nomeBot) }, { quoted: msg })
        }
        const restante = Math.max(0, v.sementes.expiraEm - Date.now())
        const min = Math.floor(restante / 60000), seg = Math.floor((restante % 60000) / 1000)
        let txt = `${boxTop("𝐕𝐄𝐍𝐃𝐄𝐃𝐎𝐑 𝐃𝐄 𝐒𝐄𝐌𝐄𝐍𝐓𝐄𝐒")}

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐉𝐀𝐍𝐄𝐋𝐀 𓆪
↳ ${min}min ${seg}s restantes
╰┈┈┈┈୨୧┈┈┈┈╯

`
        v.sementes.itens.forEach((it, i) => {
          const desc = Math.round((1 - it.preco / it.precoOriginal) * 100)
          txt += `╭┈┈┈┈୨୧┈┈┈┈╮\n𓆩 #${i + 1} ${it.emoji} ${it.nome} 𓆪\n↳ ${it.preco} GoldFZ (-${desc}%)\n↳ Rende: ~${it.vendaBase}/h\n↳ ${it.raridade}\n╰┈┈┈┈୨୧┈┈┈┈╯\n`
        })
        txt += `\n╭┈┈┈┈୨୧┈┈┈┈╮\n𓆩 𝐂𝐎𝐌𝐏𝐑𝐀𝐑 𓆪\n↳ \`${p}comprarvendedor <nome>\`\n╰┈┈┈┈୨୧┈┈┈┈╯\n\n${boxFim(nomeBot)}`
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    comprarvendedor: {
      aliases: ["buyvendedor", "comprarvendedorsemente"],
      async executar({ sock, msg, args, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const cfg = dbLer("fazendacfg.json", { grupos: {} })
        if (!cfg.grupos[jid]?.ativo) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐅𝐀𝐙𝐄𝐍𝐃𝐀 𝐎𝐅𝐅", "O modo fazenda está desativado.", `Peça a um admin para ativar.`, null, nomeBotDb(db)) }, { quoted: msg }) }

        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        if (u.terras === 0) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐕𝐄𝐍𝐃𝐄𝐃𝐎𝐑", "Compre terra primeiro.", `Use \`${p}comprarterra\``, null, nomeBot) }, { quoted: msg }) }

        const v = getVendedores()
        if (!v.sementes.ativo || Date.now() > v.sementes.expiraEm) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐕𝐄𝐍𝐃𝐄𝐃𝐎𝐑", "Vendedor foi embora.", "Aguarde o próximo (4h)", null, nomeBot) }, { quoted: msg }) }

        let qtd = 1
        const ultimo = args[args.length - 1]
        if (/^\d+$/.test(ultimo)) { qtd = parseInt(ultimo); args.pop() }
        const busca = normalizar(args.join(" "))
        const oferta = v.sementes.itens.find(x => normalizar(x.nome) === busca || x.id === busca || normalizar(x.nome).includes(busca))
        if (!oferta) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐕𝐄𝐍𝐃𝐄𝐃𝐎𝐑", "Oferta não encontrada.", `Veja \`${p}vendedorsementes\``, null, nomeBot) }, { quoted: msg }) }

        const total = oferta.preco * qtd
        const { saldo } = getGoldFZ(num)
        if (saldo < total) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐕𝐄𝐍𝐃𝐄𝐃𝐎𝐑", "GoldFZ insuficiente.", `Faltam ${total - saldo} GoldFZ`, null, nomeBot) }, { quoted: msg }) }

        removeGoldFZ(num, total)
        u.sementes[oferta.id] = (u.sementes[oferta.id] || 0) + qtd
        dbSalvar("fazenda.json", f)

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐎𝐅𝐄𝐑𝐓𝐀", "Semente do vendedor!", `${oferta.emoji} ${oferta.nome} x${qtd}\nPago: -${total} GoldFZ`, null, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    vendedoranimais: {
      aliases: ["vanimais", "vendoranimais"],
      async executar({ sock, msg, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const cfg = dbLer("fazendacfg.json", { grupos: {} })
        if (!cfg.grupos[jid]?.ativo) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐅𝐀𝐙𝐄𝐍𝐃𝐀 𝐎𝐅𝐅", "O modo fazenda está desativado.", `Peça a um admin para ativar.`, null, nomeBotDb(db)) }, { quoted: msg }) }

        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const v = getVendedores()
        if (!v.animais.ativo || Date.now() > v.animais.expiraEm) {
          await reagir(sock, msg, "💧")
          return sock.sendMessage(jid, { text: msgAviso("𝐕𝐄𝐍𝐃𝐄𝐃𝐎𝐑", "O vendedor de animais foi embora.", "Aguarde o próximo (3h)", null, nomeBot) }, { quoted: msg })
        }
        const restante = Math.max(0, v.animais.expiraEm - Date.now())
        const min = Math.floor(restante / 60000), seg = Math.floor((restante % 60000) / 1000)
        let txt = `${boxTop("𝐕𝐄𝐍𝐃𝐄𝐃𝐎𝐑 𝐃𝐄 𝐀𝐍𝐈𝐌𝐀𝐈𝐒")}

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐉𝐀𝐍𝐄𝐋𝐀 𓆪
↳ ${min}min ${seg}s restantes
╰┈┈┈┈୨୧┈┈┈┈╯

`
        v.animais.itens.forEach((it, i) => {
          const desc = Math.round((1 - it.preco / it.precoOriginal) * 100)
          txt += `╭┈┈┈┈୨୧┈┈┈┈╮\n𓆩 #${i + 1} ${it.emoji} ${it.nome} 𓆪\n↳ ${it.preco} GoldFZ (-${desc}%)\n↳ Rende: +${it.producaoHora}/h\n↳ ${it.raridade}\n╰┈┈┈┈୨୧┈┈┈┈╯\n`
        })
        txt += `\n╭┈┈┈┈୨୧┈┈┈┈╮\n𓆩 𝐂𝐎𝐌𝐏𝐑𝐀𝐑 𓆪\n↳ \`${p}comprarvendedoranimal <nome>\`\n╰┈┈┈┈୨୧┈┈┈┈╯\n\n${boxFim(nomeBot)}`
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    comprarvendedoranimal: {
      aliases: ["buyvendedoranimal", "compraranimalvendedor"],
      async executar({ sock, msg, args, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const cfg = dbLer("fazendacfg.json", { grupos: {} })
        if (!cfg.grupos[jid]?.ativo) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐅𝐀𝐙𝐄𝐍𝐃𝐀 𝐎𝐅𝐅", "O modo fazenda está desativado.", `Peça a um admin para ativar.`, null, nomeBotDb(db)) }, { quoted: msg }) }

        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        if (u.cercados === 0) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐕𝐄𝐍𝐃𝐄𝐃𝐎𝐑", "Compre cercado primeiro.", `Use \`${p}comprarcercado\``, null, nomeBot) }, { quoted: msg }) }
        if (u.animais.length >= u.limiteAnimais) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐕𝐄𝐍𝐃𝐄𝐃𝐎𝐑", "Cercado cheio.", `Ocupado: ${u.animais.length}/${u.limiteAnimais}`, null, nomeBot) }, { quoted: msg }) }

        const v = getVendedores()
        if (!v.animais.ativo || Date.now() > v.animais.expiraEm) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐕𝐄𝐍𝐃𝐄𝐃𝐎𝐑", "Vendedor foi embora.", "Aguarde o próximo (3h)", null, nomeBot) }, { quoted: msg }) }

        const busca = normalizar(args.join(" "))
        const oferta = v.animais.itens.find(x => normalizar(x.nome) === busca || x.id === busca || normalizar(x.nome).includes(busca))
        if (!oferta) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐕𝐄𝐍𝐃𝐄𝐃𝐎𝐑", "Oferta não encontrada.", `Veja \`${p}vendedoranimais\``, null, nomeBot) }, { quoted: msg }) }

        const { saldo } = getGoldFZ(num)
        if (saldo < oferta.preco) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐕𝐄𝐍𝐃𝐄𝐃𝐎𝐑", "GoldFZ insuficiente.", `Faltam ${oferta.preco - saldo} GoldFZ`, null, nomeBot) }, { quoted: msg }) }

        removeGoldFZ(num, oferta.preco)
        u.animais.push({ id: oferta.id, nome: oferta.nome, emoji: oferta.emoji, fome: 0, sujo: 0, compradoEm: Date.now() })
        dbSalvar("fazenda.json", f)

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐎𝐅𝐄𝐑𝐓𝐀", "Animal do vendedor!", `${oferta.emoji} ${oferta.nome}\nRende: +${oferta.producaoHora}/h\nPago: -${oferta.preco} GoldFZ`, null, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    eventoagua: {
      aliases: ["promocaoagua", "aguaPromo"],
      async executar({ sock, msg, db, utils, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const cfg = dbLer("fazendacfg.json", { grupos: {} })
        if (!cfg.grupos[jid]?.ativo) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐅𝐀𝐙𝐄𝐍𝐃𝐀 𝐎𝐅𝐅", "O modo fazenda está desativado.", `Peça a um admin para ativar.`, null, nomeBotDb(db)) }, { quoted: msg }) }

        const nomeBot = nomeBotDb(db)
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        const v = getVendedores()
        const expiraEm = (v.ultimoEventoAgua || 0) + DURACAO_VENDEDOR
        if (Date.now() > expiraEm) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐄𝐕𝐄𝐍𝐓𝐎", "O evento de água terminou.", "Aguarde o próximo (2h)", null, nomeBot) }, { quoted: msg }) }

        const PRECO_PROMO = 60
        const { saldo } = getGoldFZ(num)
        if (saldo < PRECO_PROMO) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐄𝐕𝐄𝐍𝐓𝐎", "GoldFZ insuficiente.", `Precisa ${PRECO_PROMO} GoldFZ`, null, nomeBot) }, { quoted: msg }) }

        removeGoldFZ(num, PRECO_PROMO)
        u.agua += 3 * GALAO_AGUA
        dbSalvar("fazenda.json", f)

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐄𝐕𝐄𝐍𝐓𝐎 𝐀́𝐆𝐔𝐀", "3 galões por 60 GoldFZ!", `Total: ${u.agua}L\nPago: -${PRECO_PROMO} GoldFZ`, "Use nas plantações!", nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    gerarkeyfz: {
      aliases: ["gerarkeyfazenda", "criarkeyfz"],
      donoOnly: true,
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        if (!isDono && !isSubDono) { await reagir(sock, msg, "💨"); return }
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const qtd = parseInt(args[0])
        if (!qtd || qtd <= 0) {
          await reagir(sock, msg, "💨")
          return sock.sendMessage(jid, { text: msgErro("𝐊𝐄𝐘 𝐅𝐙", "Quantidade inválida.", "Use `+gerarkeyfz <qtd>`\nEx: `+gerarkeyfz 1000`", null, nomeBot) }, { quoted: msg })
        }

        const dbKeys = dbLer("keysfz.json", { keys: {} })
        const novaKey = gerarKeyAleatoria()
        dbKeys.keys[novaKey] = { goldfz: qtd, usado: false, criadoPor: msg.key.participant || msg.key.remoteJid, criadoEm: Date.now() }
        dbSalvar("keysfz.json", dbKeys)

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐊𝐄𝐘 𝐅𝐙", "Nova key de GoldFZ criada!", `Key: \`${novaKey}\`\nValor: *${qtd} GoldFZ*\n\nEssa key é de uso único.`, `Entregue com \`+keygoldfz ${novaKey}\``, nomeBot) }, { quoted: msg })
      }
    },

    keygoldfz: {
      aliases: ["resgatargoldfz", "usarkeyfz"],
      async executar({ sock, msg, args, db, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const keyInserida = (args[0] || "").toUpperCase().trim()
        if (!keyInserida) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐊𝐄𝐘 𝐅𝐙", "Key em falta.", "Use `+keygoldfz <key>`", null, nomeBot) }, { quoted: msg }) }

        const dbKeys = dbLer("keysfz.json", { keys: {} })
        let keyReal = null
        for (const k in dbKeys.keys) { if (k.toUpperCase() === keyInserida) { keyReal = k; break } }
        if (!keyReal || !dbKeys.keys[keyReal]) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐊𝐄𝐘 𝐅𝐙", "Key inválida.", "A key digitada não existe ou está errada.", null, nomeBot) }, { quoted: msg }) }

        const dataKey = dbKeys.keys[keyReal]
        if (dataKey.usado) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐊𝐄𝐘 𝐅𝐙", "Key já resgatada.", "Essa key já foi utilizada.", null, nomeBot) }, { quoted: msg }) }

        const num = soNumero(sender)
        addGoldFZ(num, dataKey.goldfz)
        const { saldo } = getGoldFZ(num)

        dataKey.usado = true
        dataKey.usadoPor = num
        dataKey.usadoEm = Date.now()
        dbSalvar("keysfz.json", dbKeys)

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: `${boxTop("𝐊𝐄𝐘 𝐅𝐙")}

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐑𝐄𝐒𝐆𝐀𝐓𝐀𝐃𝐀 𓆪
↳ +${dataKey.goldfz} GoldFZ
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐒𝐀𝐋𝐃𝐎 𓆪
↳ ${saldo} GoldFZ
╰┈┈┈┈୨୧┈┈┈┈╯

${boxFim(nomeBot)}` }, { quoted: msg })
      }
    }

  }
}