/* ============================================================
   MENU FAZENDA - ESTILO ADM
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

/* ---------- RESPOSTAS PADRONIZADAS ---------- */
function msgSucesso(titulo, aviso, detalhes) {
  return `✨ *${titulo || "𝑺𝑼𝑪𝑬𝑺𝑺𝑶"}*\n\n✅ ${aviso}${detalhes ? `\n\n📌 ${detalhes}` : ""}`
}
function msgAviso(titulo, aviso, detalhes) {
  return `⚠️ *${titulo}*\n\n🔸 ${aviso}${detalhes ? `\n\n📌 ${detalhes}` : ""}`
}
function msgErro(titulo, aviso, detalhes) {
  return `❌ *${titulo}*\n\n🚫 ${aviso}${detalhes ? `\n\n📌 ${detalhes}` : ""}`
}

function gerarKeyAleatoria() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let key = "KEYFZ-"
  for (let i = 0; i < 8; i++) key += chars.charAt(Math.floor(Math.random() * chars.length))
  return key
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

/* ---------- MUTAÇÕES ---------- */
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
  sementes: { milho: 8, trigo: 8, arroz: 6, feijao: 6, batata: 6, cenoura: 6, soja: 3, tomate: 3, melancia: 2, morango: 2, uva: 1, cafe: 1 },
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

function sistemaFazendaAtivo(jid) {
  const cfg = dbLer("fazendacfg.json", { grupos: {} })
  return cfg.grupos[jid]?.ativo === true
}

/* 🔒 REGRAS DE DUPLICATA */
function jaTemSemente(u, sementeId) { return (u.sementes && u.sementes[sementeId] && u.sementes[sementeId] > 0) }
function jaTemPlanta(u, sementeId) { return (u.plantacoes || []).some(p => p.id === sementeId) }

module.exports = {
  menu: "menu-fazenda",
  grupoOnly: false,
  adminOnly: false,
  donoOnly: false,

  async rendaAutomatica(sock, db) {
    const f = dbLer("fazenda.json", { usuarios: {} })
    let alterou = false
    const agora = Date.now()
    const restockAgora = restockLoja()
    const cfgFaz = dbLer("fazendacfg.json", { grupos: {} })
    const gruposAtivos = Object.keys(cfgFaz.grupos || {}).filter(j => cfgFaz.grupos[j]?.ativo === true)

    if (restockAgora) {
      for (const jid of gruposAtivos) {
        try {
          await sock.sendMessage(jid, { text: msgAviso("𝑳𝑶𝑱𝑨 𝑨𝑻𝑼𝑨𝑳𝑰𝒁𝑨𝑫𝑨", "O estoque foi reabastecido!", "Sementes raras têm estoque baixo. Use +sementes") })
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
            await sock.sendMessage(jid, { text: msgAviso("𝑽𝑬𝑵𝑫𝑬𝑫𝑶𝑹 𝑫𝑬 𝑺𝑬𝑴𝑬𝑵𝑻𝑬𝑺", "Vendedor ambulante chegou!", "Sementes com -30%\nJanela: 30 minutos\nUse +vendedorsementes") })
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
            await sock.sendMessage(jid, { text: msgAviso("𝑽𝑬𝑵𝑫𝑬𝑫𝑶𝑹 𝑫𝑬 𝑨𝑵𝑰𝑴𝑨𝑰𝑺", "Vendedor de animais chegou!", "Animais com -25%\nJanela: 30 minutos\nUse +vendedoranimais") })
            await new Promise(r => setTimeout(r, 1500))
          } catch (_) {}
        }
        alterou = true
      }
      if (agora - (v.ultimoEventoAgua || 0) >= INTERVALO_EVENTO_AGUA) {
        v.ultimoEventoAgua = agora
        for (const jid of gruposAtivos) {
          try {
            await sock.sendMessage(jid, { text: msgAviso("𝑬𝑽𝑬𝑵𝑻𝑶 𝑨𝑮𝑼𝑨", "3 galões por 60 GoldFZ!", "Normal: 150 GoldFZ\nJanela: 30 minutos\nUse +eventoagua") })
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
      aliases: ["menuf", "comandosfazenda"],
      async executar({ sock, msg, prefixoAtivo, db }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const cfg = getCfg(db)
        const nomeBot = nomeBotDb(db)
        await reagir(sock, msg, "🌸")

        const texto = `𝑴𝑬𝑵𝑼 𝑭𝑨𝒁𝑬𝑵𝑫𝑨

🤖 Bot: ${nomeBot}
⚡ Prefixo: ${p}
🟢 Status: Online

𝑮𝑶𝑳𝑫 𝑭𝒁
${p}saldofz
${p}gerarkeyfz <qtd>
${p}keygoldfz <key>

𝑹𝑬𝑺𝑮𝑨𝑻𝑨𝑹
${p}resgatarfazenda

𝑨𝑵𝑰𝑴𝑨𝑰𝑺
${p}animais
${p}compraranimal <nome>
${p}venderanimal <nome>
${p}statusanimais

𝑺𝑬𝑴𝑬𝑵𝑻𝑬𝑺
${p}sementes
${p}comprarsemente <nome>
${p}plantarsemente <nome>
${p}regarsementes
${p}regarplanta <nome>
${p}venderplanta <nome>
${p}statusplanta

𝑪𝑬𝑹𝑪𝑨𝑺 𝑬 𝑻𝑬𝑹𝑹𝑨𝑺
${p}comprarcercado
${p}comprarterra
${p}compraragua <qtd>

𝑪𝑼𝑰𝑫𝑨𝑫𝑶𝑺
${p}alimentaranimais
${p}banhoanimais
${p}limparfazenda

𝑽𝑬𝑵𝑫𝑬𝑫𝑶𝑹𝑬𝑺
${p}vendedorsementes
${p}comprarvendedor <nome>
${p}vendedoranimais
${p}comprarvendedoranimal <nome>
${p}eventoagua

𝑺𝑻𝑨𝑻𝑼𝑺
${p}statusfazenda

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

    fazenda: {
      aliases: ["fazendaon", "fazendaoff", "ativarfazenda"],
      async executar({ sock, msg, args, prefixoAtivo, isDono, isSubDono, isAdmin }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const op = (args[0] || "").toLowerCase()
        if (!isDono && !isSubDono && !isAdmin) {
          await reagir(sock, msg, "🚫")
          return sock.sendMessage(jid, { text: msgErro("𝑺𝑬𝑴 𝑷𝑬𝑹𝑴𝑰𝑺𝑺𝑨𝑶", "Apenas admins podem ativar.", `Use ${p}menuadm`) }, { quoted: msg })
        }
        const cfg = dbLer("fazendacfg.json", { grupos: {} })
        cfg.grupos[jid] = cfg.grupos[jid] || {}
        if (!["on", "off"].includes(op)) {
          const s = cfg.grupos[jid].ativo ? "ON ✅" : "OFF ❌"
          await reagir(sock, msg, "⚙️")
          return sock.sendMessage(jid, { text: msgAviso("𝑭𝑨𝒁𝑬𝑵𝑫𝑨", `Sistema atualmente: ${s}`, `Use ${p}fazenda on ou ${p}fazenda off`) }, { quoted: msg })
        }
        cfg.grupos[jid].ativo = op === "on"
        dbSalvar("fazendacfg.json", cfg)
        await reagir(sock, msg, "⚙️")
        await sock.sendMessage(jid, { text: op === "on" ? msgSucesso("𝑭𝑨𝒁𝑬𝑵𝑫𝑨", "Sistema ativado.", "Os comandos voltaram!") : msgAviso("𝑭𝑨𝒁𝑬𝑵𝑫𝑨", "Sistema desativado.", "O modo fazenda está off.") }, { quoted: msg })
      }
    },

    saldofz: {
      aliases: ["goldfz", "meugoldfz", "meusaldo"],
      async executar({ sock, msg, sender }) {
        const jid = msg.key.remoteJid
        const num = soNumero(sender)
        const { saldo } = getGoldFZ(num)
        await reagir(sock, msg, "💰")
        await sock.sendMessage(jid, { text: msgSucesso("𝑮𝑶𝑳𝑫𝑭𝒁", "Saldo da fazenda.", `Você tem *${saldo} GoldFZ*`) }, { quoted: msg })
      }
    },

    resgatarfazenda: {
      aliases: ["resgatar", "coletar", "coletarfazenda"],
      async executar({ sock, msg, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        if (!sistemaFazendaAtivo(jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑭𝑨𝒁𝑬𝑵𝑫𝑨 𝑶𝑭𝑭", "O modo fazenda está desativado.", `Peça a um admin: ${p}fazenda on`) }, { quoted: msg }) }
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        const pendente = u.rendaPendente || 0
        if (pendente <= 0) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑹𝑬𝑺𝑮𝑨𝑻𝑨𝑹", "Nada pra resgatar.", "Renda acumula a cada 3h.") }, { quoted: msg }) }
        addGoldFZ(num, pendente)
        u.rendaPendente = 0
        dbSalvar("fazenda.json", f)
        const { saldo } = getGoldFZ(num)
        await reagir(sock, msg, "💰")
        await sock.sendMessage(jid, { text: msgSucesso("𝑹𝑬𝑺𝑮𝑨𝑻𝑬", "Renda coletada.", `+${pendente} GoldFZ\nSaldo: ${saldo}`), mentions: [`${num}@s.whatsapp.net`] }, { quoted: msg })
      }
    },

    animais: {
      aliases: ["listaanimais", "lojaanimais"],
      async executar({ sock, msg, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        if (!sistemaFazendaAtivo(jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑭𝑨𝒁𝑬𝑵𝑫𝑨 𝑶𝑭𝑭", "O modo fazenda está desativado.", `Peça a um admin: ${p}fazenda on`) }, { quoted: msg }) }
        const loja = getLoja()
        let txt = `🐾 *𝑳𝑶𝑱𝑨 𝑫𝑬 𝑨𝑵𝑰𝑴𝑨𝑰𝑺*\n\n`
        for (const a of ANIMAIS) {
          const stock = loja.animais[a.id] || 0
          txt += `${a.emoji} *${a.nome}*\n💰 ${a.preco} GoldFZ | 📈 +${a.producaoHora}/h\n📦 Stock: ${stock}\n\n`
        }
        txt += `📌 Use ${p}compraranimal <nome>\n\n> _Stock reabastece a cada 1h._`
        await reagir(sock, msg, "🐾")
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    comprarcercado: {
      aliases: ["cercado", "buycercado"],
      async executar({ sock, msg, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        if (!sistemaFazendaAtivo(jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑭𝑨𝒁𝑬𝑵𝑫𝑨 𝑶𝑭𝑭", "O modo fazenda está desativado.", `Peça a um admin: ${p}fazenda on`) }, { quoted: msg }) }
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        if (u.upgrades >= MAX_UPGRADES) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑪𝑬𝑹𝑪𝑨𝑫𝑶", "Máximo atingido.", `Upgrades: ${u.upgrades}/${MAX_UPGRADES}`) }, { quoted: msg }) }
        const { saldo } = getGoldFZ(num)
        const preco = u.upgrades === 0 ? 0 : PRECO_CERCADO
        if (saldo < preco) { await reagir(sock, msg, "💸"); return sock.sendMessage(jid, { text: msgErro("𝑪𝑬𝑹𝑪𝑨𝑫𝑶", "GoldFZ insuficiente.", `Faltam ${preco - saldo} GoldFZ`) }, { quoted: msg }) }
        if (preco > 0) removeGoldFZ(num, preco)
        u.upgrades += 1; u.cercados += 1
        u.limiteAnimais = CAP_BASE + (u.upgrades - 1) * CAP_UPGRADE
        dbSalvar("fazenda.json", f)
        await reagir(sock, msg, "🏠")
        await sock.sendMessage(jid, { text: msgSucesso("𝑪𝑬𝑹𝑪𝑨𝑫𝑶", "Mais espaço pros animais.", `Capacidade: ${u.limiteAnimais}\nUpgrades: ${u.upgrades}/${MAX_UPGRADES}`), mentions: [sender] }, { quoted: msg })
      }
    },

    compraranimal: {
      aliases: ["buyanimal", "adotaranimal"],
      async executar({ sock, msg, args, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        if (!sistemaFazendaAtivo(jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑭𝑨𝒁𝑬𝑵𝑫𝑨 𝑶𝑭𝑭", "O modo fazenda está desativado.", `Peça a um admin: ${p}fazenda on`) }, { quoted: msg }) }
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        if (u.cercados === 0) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑨𝑵𝑰𝑴𝑨𝑳", "Compre cercado primeiro.", `Use ${p}comprarcercado`) }, { quoted: msg }) }
        if (u.animais.length >= u.limiteAnimais) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑨𝑵𝑰𝑴𝑨𝑳", "Cercado cheio.", `Ocupado: ${u.animais.length}/${u.limiteAnimais}`) }, { quoted: msg }) }
        const animal = acharAnimal(args.join(" "))
        if (!animal) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑨𝑵𝑰𝑴𝑨𝑳", "Não achei.", `Veja ${p}animais`) }, { quoted: msg }) }
        const loja = getLoja()
        if ((loja.animais[animal.id] || 0) < 1) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑨𝑵𝑰𝑴𝑨𝑳", "Esgotado na loja.", "Reabastece a cada 1h") }, { quoted: msg }) }
        const { saldo } = getGoldFZ(num)
        if (saldo < animal.preco) { await reagir(sock, msg, "💸"); return sock.sendMessage(jid, { text: msgErro("𝑨𝑵𝑰𝑴𝑨𝑳", "GoldFZ insuficiente.", `Faltam ${animal.preco - saldo} GoldFZ`) }, { quoted: msg }) }
        removeGoldFZ(num, animal.preco)
        u.animais.push({ id: animal.id, nome: animal.nome, emoji: animal.emoji, fome: 0, sujo: 0, compradoEm: Date.now() })
        loja.animais[animal.id] -= 1
        dbSalvar("fazenda.json", f); salvarLoja(loja)
        await reagir(sock, msg, "🐾")
        await sock.sendMessage(jid, { text: msgSucesso("𝑨𝑵𝑰𝑴𝑨𝑳", "Novo animal.", `${animal.emoji} ${animal.nome}\nProdução: +${animal.producaoHora}/h\nStock: ${loja.animais[animal.id]}`), mentions: [sender] }, { quoted: msg })
      }
    },

    venderanimal: {
      aliases: ["vendaranimal", "sellanimal"],
      async executar({ sock, msg, args, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        if (!sistemaFazendaAtivo(jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑭𝑨𝒁𝑬𝑵𝑫𝑨 𝑶𝑭𝑭", "O modo fazenda está desativado.", `Peça a um admin: ${p}fazenda on`) }, { quoted: msg }) }
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        const busca = normalizar(args.join(" "))
        const idx = u.animais.findIndex(a => normalizar(a.nome) === busca || a.id === busca)
        if (idx === -1) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑽𝑬𝑵𝑫𝑬𝑹", "Você não tem esse.", `Veja ${p}statusanimais`) }, { quoted: msg }) }
        const a = u.animais[idx]
        const info = ANIMAIS.find(x => x.id === a.id)
        const valor = Math.floor((info?.preco || 100) * 0.5)
        u.animais.splice(idx, 1)
        addGoldFZ(num, valor)
        dbSalvar("fazenda.json", f)
        await reagir(sock, msg, "💵")
        await sock.sendMessage(jid, { text: msgSucesso("𝑽𝑬𝑵𝑫𝑰𝑫𝑶", "Animal vendido.", `${a.emoji} ${a.nome}\n+${valor} GoldFZ`), mentions: [sender] }, { quoted: msg })
      }
    },

    alimentaranimais: {
      aliases: ["alimentaranimal", "feedanimais"],
      async executar({ sock, msg, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        if (!sistemaFazendaAtivo(jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑭𝑨𝒁𝑬𝑵𝑫𝑨 𝑶𝑭𝑭", "O modo fazenda está desativado.", `Peça a um admin: ${p}fazenda on`) }, { quoted: msg }) }
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        if (!u.animais.length) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑨𝑳𝑰𝑴𝑬𝑵𝑻𝑨𝑹", "Sem animais.", `Use ${p}compraranimal`) }, { quoted: msg }) }
        const { saldo } = getGoldFZ(num)
        if (saldo < PRECO_ALIMENTAR) { await reagir(sock, msg, "💸"); return sock.sendMessage(jid, { text: msgErro("𝑨𝑳𝑰𝑴𝑬𝑵𝑻𝑨𝑹", "GoldFZ insuficiente.", `Precisa ${PRECO_ALIMENTAR} GoldFZ`) }, { quoted: msg }) }
        removeGoldFZ(num, PRECO_ALIMENTAR)
        let n = 0
        for (const a of u.animais) { if ((a.fome || 0) > 0) { a.fome = 0; n++ } }
        dbSalvar("fazenda.json", f)
        await reagir(sock, msg, "🍎")
        await sock.sendMessage(jid, { text: msgSucesso("𝑨𝑳𝑰𝑴𝑬𝑵𝑻𝑨𝑫𝑶𝑺", "Todos alimentados.", `Animais: ${n}\nPago: -${PRECO_ALIMENTAR} GoldFZ`), mentions: [sender] }, { quoted: msg })
      }
    },

    banhoanimais: {
      aliases: ["banhoanimal", "lavaranimais"],
      async executar({ sock, msg, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        if (!sistemaFazendaAtivo(jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑭𝑨𝒁𝑬𝑵𝑫𝑨 𝑶𝑭𝑭", "O modo fazenda está desativado.", `Peça a um admin: ${p}fazenda on`) }, { quoted: msg }) }
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        if (!u.animais.length) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑩𝑨𝑵𝑯𝑶", "Sem animais.", `Use ${p}compraranimal`) }, { quoted: msg }) }
        const { saldo } = getGoldFZ(num)
        if (saldo < PRECO_BANHO) { await reagir(sock, msg, "💸"); return sock.sendMessage(jid, { text: msgErro("𝑩𝑨𝑵𝑯𝑶", "GoldFZ insuficiente.", `Precisa ${PRECO_BANHO} GoldFZ`) }, { quoted: msg }) }
        removeGoldFZ(num, PRECO_BANHO)
        let n = 0
        for (const a of u.animais) { if ((a.sujo || 0) > 0) { a.sujo = 0; n++ } }
        dbSalvar("fazenda.json", f)
        await reagir(sock, msg, "🛁")
        await sock.sendMessage(jid, { text: msgSucesso("𝑳𝑨𝑽𝑨𝑫𝑶𝑺", "Todos lavados.", `Animais: ${n}\nPago: -${PRECO_BANHO} GoldFZ`), mentions: [sender] }, { quoted: msg })
      }
    },

    limparfazenda: {
      aliases: ["limparfaz"],
      async executar({ sock, msg, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        if (!sistemaFazendaAtivo(jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑭𝑨𝒁𝑬𝑵𝑫𝑨 𝑶𝑭𝑭", "O modo fazenda está desativado.", `Peça a um admin: ${p}fazenda on`) }, { quoted: msg }) }
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        if ((u.sujeira || 0) === 0) { await reagir(sock, msg, "🧹"); return sock.sendMessage(jid, { text: msgSucesso("𝑳𝑰𝑴𝑷𝑬𝒁𝑨", "Já tá limpa.", "Nada a fazer.") }, { quoted: msg }) }
        u.sujeira = 0
        dbSalvar("fazenda.json", f)
        await reagir(sock, msg, "🧹")
        await sock.sendMessage(jid, { text: msgSucesso("𝑳𝑰𝑴𝑷𝑨", "Sujeira removida.", "Tudo brilhando!") }, { quoted: msg })
      }
    },

    statusfazenda: {
      aliases: ["fazendastatus", "minhafazenda"],
      async executar({ sock, msg, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        if (!sistemaFazendaAtivo(jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑭𝑨𝒁𝑬𝑵𝑫𝑨 𝑶𝑭𝑭", "O modo fazenda está desativado.", `Peça a um admin: ${p}fazenda on`) }, { quoted: msg }) }
        const num = soNumero(sender)
        const { u } = getFazenda(num)
        if (u.cercados === 0 && u.terras === 0) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑺𝑻𝑨𝑻𝑼𝑺", "Você não tem fazenda.", `Use ${p}comprarcercado`) }, { quoted: msg }) }
        const { saldo } = getGoldFZ(num)
        const nivel = nivelFazenda(u)
        const rendaHora = Math.floor(calcularRenda(u))
        const restante = Math.max(0, INTERVALO_RENDA - (Date.now() - (u.ultimaRenda || Date.now())))
        const h = Math.floor(restante / 3600000), m = Math.floor((restante % 3600000) / 60000)
        const tempo = h > 0 ? `${h}h ${m}min` : `${m}min`
        const prontas = (u.plantacoes || []).filter(p2 => p2.pronta).length
        const texto = `📊 *𝑺𝑻𝑨𝑻𝑼𝑺 𝑭𝑨𝒁𝑬𝑵𝑫𝑨*

👤 Usuário: @${num}
💰 Saldo: ${saldo} GoldFZ

🏠 *ESTRUTURA*
Nível: ${nivel}
Cercados: ${u.cercados}
Terras: ${u.terras}
Água: ${u.agua}L

🐾 *ANIMAIS*
Total: ${u.animais.length}/${u.limiteAnimais}

🌱 *PLANTAÇÕES*
Total: ${u.plantacoes.length}
Prontas: ${prontas}

🧹 *SUJEIRA*
${u.sujeira}%

📈 *RENDA*
Por hora: ${rendaHora}/h
Pendente: ${u.rendaPendente || 0}
Próxima: ${tempo}
Total: ${u.rendaTotal || 0}
Upgrades: ${u.upgrades}/${MAX_UPGRADES}

📌 Use ${p}resgatarfazenda`
        await reagir(sock, msg, "📊")
        await sock.sendMessage(jid, { text: texto, mentions: [`${num}@s.whatsapp.net`] }, { quoted: msg })
      }
    },

    statusanimais: {
      aliases: ["meusanimais", "veranimais"],
      async executar({ sock, msg, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        if (!sistemaFazendaAtivo(jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑭𝑨𝒁𝑬𝑵𝑫𝑨 𝑶𝑭𝑭", "O modo fazenda está desativado.", `Peça a um admin: ${p}fazenda on`) }, { quoted: msg }) }
        const num = soNumero(sender)
        const { u } = getFazenda(num)
        if (!u.animais.length) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑨𝑵𝑰𝑴𝑨𝑰𝑺", "Você não tem animais.", `Use ${p}compraranimal`) }, { quoted: msg }) }
        let txt = `🐾 *𝑴𝑬𝑼𝑺 𝑨𝑵𝑰𝑴𝑨𝑰𝑺* (${u.animais.length}/${u.limiteAnimais})\n\n`
        for (const a of u.animais) {
          const fomeIco = a.fome > 70 ? "🚨" : a.fome > 40 ? "❄️" : "✅"
          const sujoIco = a.sujo > 70 ? "🚨" : a.sujo > 40 ? "❄️" : "✅"
          txt += `${a.emoji} *${a.nome}*\n🍖 Fome: ${fomeIco} ${a.fome}%\n🧼 Sujo: ${sujoIco} ${a.sujo}%\n\n`
        }
        await reagir(sock, msg, "🐾")
        await sock.sendMessage(jid, { text: txt, mentions: [sender] }, { quoted: msg })
      }
    },

    sementes: {
      aliases: ["lojasementes", "listarsementes"],
      async executar({ sock, msg, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        if (!sistemaFazendaAtivo(jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑭𝑨𝒁𝑬𝑵𝑫𝑨 𝑶𝑭𝑭", "O modo fazenda está desativado.", `Peça a um admin: ${p}fazenda on`) }, { quoted: msg }) }
        const loja = getLoja()
        const emojiRar = { Comum: "🟢", Raro: "💙", Épico: "💜", Lendário: "🌟" }
        let txt = `🌱 *𝑳𝑶𝑱𝑨 𝑫𝑬 𝑺𝑬𝑴𝑬𝑵𝑻𝑬𝑺*\n\n📌 Use ${p}comprarsemente <nome>\n\n`
        for (const raridade of ["Comum", "Raro", "Épico", "Lendário"]) {
          const lista = SEMENTES.filter(s => s.raridade === raridade)
          if (!lista.length) continue
          txt += `${emojiRar[raridade]} *${raridade.toUpperCase()}*\n`
          for (const s of lista) {
            const stock = loja.sementes[s.id] || 0
            const stockTxt = stock === 0 ? "🚫 ESGOTADO" : `📦 ${stock}`
            txt += `${s.emoji} *${s.nome}* — ${s.preco} GoldFZ | ⏰ ${s.tempo}min | ${stockTxt}\n`
          }
          txt += `\n`
        }
        txt += `> _Stock reabastece a cada 1h._`
        await reagir(sock, msg, "🌱")
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    comprarsemente: {
      aliases: ["buysemente"],
      async executar({ sock, msg, args, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        if (!sistemaFazendaAtivo(jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑭𝑨𝒁𝑬𝑵𝑫𝑨 𝑶𝑭𝑭", "O modo fazenda está desativado.", `Peça a um admin: ${p}fazenda on`) }, { quoted: msg }) }
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        if (u.terras === 0) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑺𝑬𝑴𝑬𝑵𝑻𝑬", "Compre terra primeiro.", `Use ${p}comprarterra`) }, { quoted: msg }) }
        const sem = acharSemente(args.join(" "))
        if (!sem) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑬𝑴𝑬𝑵𝑻𝑬", "Não achei.", `Veja ${p}sementes`) }, { quoted: msg }) }
        if (jaTemSemente(u, sem.id)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑱𝑨 𝑻𝑬𝑴 𝑬𝑺𝑺𝑨 𝑺𝑬𝑴𝑬𝑵𝑻𝑬", "Você já tem essa semente.", `Plante a que você tem antes de comprar outra.\nUse ${p}plantarsemente ${sem.nome}`) }, { quoted: msg }) }
        if (jaTemPlanta(u, sem.id)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑱𝑨 𝑻𝑬𝑴 𝑷𝑳𝑨𝑵𝑻𝑨", "Você já tem uma plantação dessa.", `Venda a plantação antes de comprar outra semente.\nUse ${p}venderplanta ${sem.nome}`) }, { quoted: msg }) }
        const loja = getLoja()
        if ((loja.sementes[sem.id] || 0) < 1) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑬𝑴𝑬𝑵𝑻𝑬", "Esgotado na loja.", `Stock: ${loja.sementes[sem.id] || 0}`) }, { quoted: msg }) }
        const { saldo } = getGoldFZ(num)
        if (saldo < sem.preco) { await reagir(sock, msg, "💸"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑬𝑴𝑬𝑵𝑻𝑬", "GoldFZ insuficiente.", `Faltam ${sem.preco - saldo} GoldFZ`) }, { quoted: msg }) }
        removeGoldFZ(num, sem.preco)
        u.sementes[sem.id] = 1
        loja.sementes[sem.id] -= 1
        dbSalvar("fazenda.json", f); salvarLoja(loja)
        await reagir(sock, msg, "🌱")
        await sock.sendMessage(jid, { text: msgSucesso("𝑺𝑬𝑴𝑬𝑵𝑻𝑬", "Adicionada ao estoque.", `${sem.emoji} ${sem.nome}\nPago: -${sem.preco} GoldFZ`) }, { quoted: msg })
      }
    },

    comprarterra: {
      aliases: ["terra", "buyterra"],
      async executar({ sock, msg, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        if (!sistemaFazendaAtivo(jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑭𝑨𝒁𝑬𝑵𝑫𝑨 𝑶𝑭𝑭", "O modo fazenda está desativado.", `Peça a um admin: ${p}fazenda on`) }, { quoted: msg }) }
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        if (u.terras >= 20) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑻𝑬𝑹𝑹𝑨", "Máximo 20 terras.", `Terras: ${u.terras}`) }, { quoted: msg }) }
        const { saldo } = getGoldFZ(num)
        const preco = PRECO_TERRA + u.terras * 200
        if (saldo < preco) { await reagir(sock, msg, "💸"); return sock.sendMessage(jid, { text: msgErro("𝑻𝑬𝑹𝑹𝑨", "GoldFZ insuficiente.", `Precisa ${preco} | Faltam ${preco - saldo}`) }, { quoted: msg }) }
        removeGoldFZ(num, preco)
        u.terras += 1
        dbSalvar("fazenda.json", f)
        await reagir(sock, msg, "🏞️")
        await sock.sendMessage(jid, { text: msgSucesso("𝑻𝑬𝑹𝑹𝑨", "Mais espaço pra plantação.", `Total: ${u.terras}\nPago: -${preco} GoldFZ`) }, { quoted: msg })
      }
    },

    compraragua: {
      aliases: ["agua", "buyagua"],
      async executar({ sock, msg, args, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        if (!sistemaFazendaAtivo(jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑭𝑨𝒁𝑬𝑵𝑫𝑨 𝑶𝑭𝑭", "O modo fazenda está desativado.", `Peça a um admin: ${p}fazenda on`) }, { quoted: msg }) }
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        const qtd = parseInt(args[0]) || 10
        if (qtd < 1 || qtd > 100) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑨𝑮𝑼𝑨", "Qtd inválida.", `Use ${p}compraragua <1-100>`) }, { quoted: msg }) }
        const total = PRECO_AGUA * qtd
        const { saldo } = getGoldFZ(num)
        if (saldo < total) { await reagir(sock, msg, "💸"); return sock.sendMessage(jid, { text: msgErro("𝑨𝑮𝑼𝑨", "GoldFZ insuficiente.", `Faltam ${total - saldo} GoldFZ`) }, { quoted: msg }) }
        removeGoldFZ(num, total)
        u.agua += qtd
        dbSalvar("fazenda.json", f)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝑨𝑮𝑼𝑨", "Estoque atualizado.", `+${qtd}L\nTotal: ${u.agua}L\nPago: -${total} GoldFZ`) }, { quoted: msg })
      }
    },

    plantarsemente: {
      aliases: ["plantar", "plant"],
      async executar({ sock, msg, args, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        if (!sistemaFazendaAtivo(jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑭𝑨𝒁𝑬𝑵𝑫𝑨 𝑶𝑭𝑭", "O modo fazenda está desativado.", `Peça a um admin: ${p}fazenda on`) }, { quoted: msg }) }
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        if (u.terras === 0) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑷𝑳𝑨𝑵𝑻𝑨𝑹", "Sem terra!", `Use ${p}comprarterra`) }, { quoted: msg }) }
        if (u.plantacoes.length >= u.terras) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑷𝑳𝑨𝑵𝑻𝑨𝑹", "Terras ocupadas.", `Ocupadas: ${u.plantacoes.length}/${u.terras}`) }, { quoted: msg }) }
        const sem = acharSemente(args.join(" "))
        if (!sem) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑷𝑳𝑨𝑵𝑻𝑨𝑹", "Não achei.", `Veja ${p}sementes`) }, { quoted: msg }) }
        if ((u.sementes[sem.id] || 0) < 1) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑷𝑳𝑨𝑵𝑻𝑨𝑹", "Não tem essa semente.", `Compre em ${p}comprarsemente ${sem.nome}`) }, { quoted: msg }) }
        if (jaTemPlanta(u, sem.id)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑱𝑨 𝑻𝑬𝑴 𝑷𝑳𝑨𝑵𝑻𝑨", "Você já tem uma plantação dessa.", `Venda antes de plantar outra.\nUse ${p}venderplanta ${sem.nome}`) }, { quoted: msg }) }
        u.sementes[sem.id] -= 1
        if (u.sementes[sem.id] === 0) delete u.sementes[sem.id]
        const mutacoes = sortearMutacoes()
        u.plantacoes.push({ id: sem.id, nome: sem.nome, emoji: sem.emoji, plantadaEm: Date.now(), regas: 0, qualidadeBase: 30, pronta: false, prontaEm: null, mutacoes: mutacoes })
        dbSalvar("fazenda.json", f)
        let avisoMut = ""
        if (mutacoes.length > 0) {
          avisoMut = "\n\n"
          for (const mId of mutacoes) { const mut = MUTACOES[mId]; if (mut) avisoMut += `${mut.emoji} MUTAÇÃO ${mut.nome.toUpperCase()}! Bônus: x${mut.bonus}\n` }
        }
        await reagir(sock, msg, "🌱")
        await sock.sendMessage(jid, { text: msgSucesso("𝑷𝑳𝑨𝑵𝑻𝑨𝑫𝑨", "Semente no chão.", `${sem.emoji} ${sem.nome}\nTempo: ~${sem.tempo}min${avisoMut}\n\nUse ${p}regarplanta ${sem.nome}`) }, { quoted: msg })
      }
    },

    regarsementes: {
      aliases: ["regartudo", "regartodas"],
      async executar({ sock, msg, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        if (!sistemaFazendaAtivo(jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑭𝑨𝒁𝑬𝑵𝑫𝑨 𝑶𝑭𝑭", "O modo fazenda está desativado.", `Peça a um admin: ${p}fazenda on`) }, { quoted: msg }) }
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        if (!u.plantacoes.length) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑹𝑬𝑮𝑨𝑹", "Sem plantações.", `Use ${p}plantarsemente`) }, { quoted: msg }) }
        if (u.agua < AGUA_POR_REGA) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑹𝑬𝑮𝑨𝑹", "Sem água.", `Use ${p}compraragua`) }, { quoted: msg }) }
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
        await reagir(sock, msg, "💦")
        await sock.sendMessage(jid, { text: msgSucesso("𝑹𝑬𝑮𝑨𝑫𝑨𝑺", "Rega em massa.", `Regadas: ${regadas}\nÁgua: ${u.agua}L`) }, { quoted: msg })
      }
    },

    regarplanta: {
      aliases: ["regar"],
      async executar({ sock, msg, args, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        if (!sistemaFazendaAtivo(jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑭𝑨𝒁𝑬𝑵𝑫𝑨 𝑶𝑭𝑭", "O modo fazenda está desativado.", `Peça a um admin: ${p}fazenda on`) }, { quoted: msg }) }
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        if (u.agua < AGUA_POR_REGA) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑹𝑬𝑮𝑨𝑹", "Sem água.", `Use ${p}compraragua`) }, { quoted: msg }) }
        const busca = normalizar(args.join(" "))
        const planta = u.plantacoes.find(x => normalizar(x.nome) === busca || x.id === busca || normalizar(x.nome).includes(busca))
        if (!planta) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑹𝑬𝑮𝑨𝑹", "Planta não encontrada.", `Veja ${p}statusplanta`) }, { quoted: msg }) }
        if (planta.pronta) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑹𝑬𝑮𝑨𝑹", "Já está pronta.", `Use ${p}venderplanta ${planta.nome}`) }, { quoted: msg }) }
        u.agua -= AGUA_POR_REGA
        planta.regas = (planta.regas || 0) + 1
        planta.qualidadeBase = Math.min(100, (planta.qualidadeBase || 30) + 5)
        dbSalvar("fazenda.json", f)
        await reagir(sock, msg, "💦")
        await sock.sendMessage(jid, { text: msgSucesso("𝑹𝑬𝑮𝑨𝑫𝑨", "Planta regada.", `${planta.emoji} ${planta.nome}\nÁgua: ${u.agua}L\nRegas: ${planta.regas}`) }, { quoted: msg })
      }
    },

    venderplanta: {
      aliases: ["vender", "colher"],
      async executar({ sock, msg, args, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        if (!sistemaFazendaAtivo(jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑭𝑨𝒁𝑬𝑵𝑫𝑨 𝑶𝑭𝑭", "O modo fazenda está desativado.", `Peça a um admin: ${p}fazenda on`) }, { quoted: msg }) }
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        const busca = normalizar(args.join(" "))
        if (!busca) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑽𝑬𝑵𝑫𝑬𝑹", "Informe o nome.", `${p}venderplanta <nome>`) }, { quoted: msg }) }
        const idx = u.plantacoes.findIndex(x => normalizar(x.nome) === busca || x.id === busca || normalizar(x.nome).includes(busca))
        if (idx === -1) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑽𝑬𝑵𝑫𝑬𝑹", "Você não tem.", `Veja ${p}statusplanta`) }, { quoted: msg }) }
        const planta = u.plantacoes[idx]
        if (!planta.pronta) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑽𝑬𝑵𝑫𝑬𝑹", "Ainda não está pronta.", `Planta: ${planta.nome}`) }, { quoted: msg }) }
        const valor = valorPlanta(planta)
        const qualidade = qualidadePlanta(planta)
        u.plantacoes.splice(idx, 1)
        addGoldFZ(num, valor)
        dbSalvar("fazenda.json", f)
        let mutTxt = ""
        if (Array.isArray(planta.mutacoes) && planta.mutacoes.length > 0) {
          for (const mId of planta.mutacoes) { const mut = MUTACOES[mId]; if (mut) mutTxt += `\n${mut.emoji} ${mut.nome} (x${mut.bonus})` }
        }
        await reagir(sock, msg, "💵")
        await sock.sendMessage(jid, { text: msgSucesso("𝑽𝑬𝑵𝑫𝑰𝑫𝑨", "Colheita vendida.", `${planta.emoji} ${planta.nome}${mutTxt}\nQualidade: ${qualidade}%\n+${valor} GoldFZ`) }, { quoted: msg })
      }
    },

    statusplanta: {
      aliases: ["minhasplantas", "plantacoes"],
      async executar({ sock, msg, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        if (!sistemaFazendaAtivo(jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑭𝑨𝒁𝑬𝑵𝑫𝑨 𝑶𝑭𝑭", "O modo fazenda está desativado.", `Peça a um admin: ${p}fazenda on`) }, { quoted: msg }) }
        const num = soNumero(sender)
        const { u } = getFazenda(num)
        if (!u.plantacoes.length) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑷𝑳𝑨𝑵𝑻𝑨𝑺", "Sem plantações.", `Use ${p}plantarsemente`) }, { quoted: msg }) }
        const agora = Date.now()
        let txt = `🌱 *𝑷𝑳𝑨𝑵𝑻𝑨𝑪𝑶𝑬𝑺* (${u.plantacoes.length}/${u.terras})\n\n`
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
          let mutTxt = ""
          if (Array.isArray(planta.mutacoes) && planta.mutacoes.length > 0) {
            for (const mId of planta.mutacoes) { const mut = MUTACOES[mId]; if (mut) mutTxt += ` ${mut.emoji}` }
          }
          txt += `${planta.emoji} *${planta.nome}*${mutTxt}\n⏰ ${tempoTxt} | 🌱 ${progresso}%\n💧 Qualidade: ${q}% | 🚿 Regas: ${planta.regas || 0}\n\n`
        }
        await reagir(sock, msg, "🌱")
        await sock.sendMessage(jid, { text: txt, mentions: [sender] }, { quoted: msg })
      }
    },

    vendedorsementes: {
      aliases: ["vsementes", "vendorsementes"],
      async executar({ sock, msg, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        if (!sistemaFazendaAtivo(jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑭𝑨𝒁𝑬𝑵𝑫𝑨 𝑶𝑭𝑭", "O modo fazenda está desativado.", `Peça a um admin: ${p}fazenda on`) }, { quoted: msg }) }
        const v = getVendedores()
        if (!v.sementes.ativo || Date.now() > v.sementes.expiraEm) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑽𝑬𝑵𝑫𝑬𝑫𝑶𝑹", "O vendedor de sementes foi embora.", "Aguarde o próximo (4h).") }, { quoted: msg }) }
        const restante = Math.max(0, v.sementes.expiraEm - Date.now())
        const min = Math.floor(restante / 60000), seg = Math.floor((restante % 60000) / 1000)
        let txt = `🛒 *𝑽𝑬𝑵𝑫𝑬𝑫𝑶𝑹 𝑫𝑬 𝑺𝑬𝑴𝑬𝑵𝑻𝑬𝑺*\n\n⏰ Janela: ${min}min ${seg}s\n\n`
        v.sementes.itens.forEach((it, i) => {
          const desc = Math.round((1 - it.preco / it.precoOriginal) * 100)
          txt += `${i + 1}. ${it.emoji} *${it.nome}*\n💰 ${it.preco} GoldFZ (-${desc}%)\n📈 Rende: ~${it.vendaBase}/h | ${it.raridade}\n\n`
        })
        txt += `📌 Use ${p}comprarvendedor <nome>`
        await reagir(sock, msg, "🛒")
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    comprarvendedor: {
      aliases: ["buyvendedor", "comprarvendedorsemente"],
      async executar({ sock, msg, args, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        if (!sistemaFazendaAtivo(jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑭𝑨𝒁𝑬𝑵𝑫𝑨 𝑶𝑭𝑭", "O modo fazenda está desativado.", `Peça a um admin: ${p}fazenda on`) }, { quoted: msg }) }
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        if (u.terras === 0) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑽𝑬𝑵𝑫𝑬𝑫𝑶𝑹", "Compre terra primeiro.", `Use ${p}comprarterra`) }, { quoted: msg }) }
        const v = getVendedores()
        if (!v.sementes.ativo || Date.now() > v.sementes.expiraEm) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑽𝑬𝑵𝑫𝑬𝑫𝑶𝑹", "Vendedor foi embora.", "Aguarde o próximo (4h).") }, { quoted: msg }) }
        const busca = normalizar(args.join(" "))
        const oferta = v.sementes.itens.find(x => normalizar(x.nome) === busca || x.id === busca || normalizar(x.nome).includes(busca))
        if (!oferta) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑽𝑬𝑵𝑫𝑬𝑫𝑶𝑹", "Oferta não encontrada.", `Veja ${p}vendedorsementes`) }, { quoted: msg }) }
        if (jaTemSemente(u, oferta.id)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑱𝑨 𝑻𝑬𝑴 𝑬𝑺𝑺𝑨 𝑺𝑬𝑴𝑬𝑵𝑻𝑬", "Você já tem essa semente.", `Plante antes de comprar outra.\nUse ${p}plantarsemente ${oferta.nome}`) }, { quoted: msg }) }
        if (jaTemPlanta(u, oferta.id)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑱𝑨 𝑻𝑬𝑴 𝑷𝑳𝑨𝑵𝑻𝑨", "Você já tem uma plantação dessa.", `Venda antes.\nUse ${p}venderplanta ${oferta.nome}`) }, { quoted: msg }) }
        const { saldo } = getGoldFZ(num)
        if (saldo < oferta.preco) { await reagir(sock, msg, "💸"); return sock.sendMessage(jid, { text: msgErro("𝑽𝑬𝑵𝑫𝑬𝑫𝑶𝑹", "GoldFZ insuficiente.", `Faltam ${oferta.preco - saldo} GoldFZ`) }, { quoted: msg }) }
        removeGoldFZ(num, oferta.preco)
        u.sementes[oferta.id] = 1
        dbSalvar("fazenda.json", f)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝑶𝑭𝑬𝑹𝑻𝑨", "Semente do vendedor!", `${oferta.emoji} ${oferta.nome}\nPago: -${oferta.preco} GoldFZ`) }, { quoted: msg })
      }
    },

    vendedoranimais: {
      aliases: ["vanimais", "vendoranimais"],
      async executar({ sock, msg, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        if (!sistemaFazendaAtivo(jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑭𝑨𝒁𝑬𝑵𝑫𝑨 𝑶𝑭𝑭", "O modo fazenda está desativado.", `Peça a um admin: ${p}fazenda on`) }, { quoted: msg }) }
        const v = getVendedores()
        if (!v.animais.ativo || Date.now() > v.animais.expiraEm) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑽𝑬𝑵𝑫𝑬𝑫𝑶𝑹", "O vendedor de animais foi embora.", "Aguarde o próximo (3h).") }, { quoted: msg }) }
        const restante = Math.max(0, v.animais.expiraEm - Date.now())
        const min = Math.floor(restante / 60000), seg = Math.floor((restante % 60000) / 1000)
        let txt = `🛒 *𝑽𝑬𝑵𝑫𝑬𝑫𝑶𝑹 𝑫𝑬 𝑨𝑵𝑰𝑴𝑨𝑰𝑺*\n\n⏰ Janela: ${min}min ${seg}s\n\n`
        v.animais.itens.forEach((it, i) => {
          const desc = Math.round((1 - it.preco / it.precoOriginal) * 100)
          txt += `${i + 1}. ${it.emoji} *${it.nome}*\n💰 ${it.preco} GoldFZ (-${desc}%)\n📈 Rende: +${it.producaoHora}/h | ${it.raridade}\n\n`
        })
        txt += `📌 Use ${p}comprarvendedoranimal <nome>`
        await reagir(sock, msg, "🛒")
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    comprarvendedoranimal: {
      aliases: ["buyvendedoranimal", "compraranimalvendedor"],
      async executar({ sock, msg, args, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        if (!sistemaFazendaAtivo(jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑭𝑨𝒁𝑬𝑵𝑫𝑨 𝑶𝑭𝑭", "O modo fazenda está desativado.", `Peça a um admin: ${p}fazenda on`) }, { quoted: msg }) }
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        if (u.cercados === 0) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑽𝑬𝑵𝑫𝑬𝑫𝑶𝑹", "Compre cercado primeiro.", `Use ${p}comprarcercado`) }, { quoted: msg }) }
        if (u.animais.length >= u.limiteAnimais) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑽𝑬𝑵𝑫𝑬𝑫𝑶𝑹", "Cercado cheio.", `Ocupado: ${u.animais.length}/${u.limiteAnimais}`) }, { quoted: msg }) }
        const v = getVendedores()
        if (!v.animais.ativo || Date.now() > v.animais.expiraEm) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑽𝑬𝑵𝑫𝑬𝑫𝑶𝑹", "Vendedor foi embora.", "Aguarde o próximo (3h).") }, { quoted: msg }) }
        const busca = normalizar(args.join(" "))
        const oferta = v.animais.itens.find(x => normalizar(x.nome) === busca || x.id === busca || normalizar(x.nome).includes(busca))
        if (!oferta) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑽𝑬𝑵𝑫𝑬𝑫𝑶𝑹", "Oferta não encontrada.", `Veja ${p}vendedoranimais`) }, { quoted: msg }) }
        const { saldo } = getGoldFZ(num)
        if (saldo < oferta.preco) { await reagir(sock, msg, "💸"); return sock.sendMessage(jid, { text: msgErro("𝑽𝑬𝑵𝑫𝑬𝑫𝑶𝑹", "GoldFZ insuficiente.", `Faltam ${oferta.preco - saldo} GoldFZ`) }, { quoted: msg }) }
        removeGoldFZ(num, oferta.preco)
        u.animais.push({ id: oferta.id, nome: oferta.nome, emoji: oferta.emoji, fome: 0, sujo: 0, compradoEm: Date.now() })
        dbSalvar("fazenda.json", f)
        await reagir(sock, msg, "🐾")
        await sock.sendMessage(jid, { text: msgSucesso("𝑶𝑭𝑬𝑹𝑻𝑨", "Animal do vendedor!", `${oferta.emoji} ${oferta.nome}\nRende: +${oferta.producaoHora}/h\nPago: -${oferta.preco} GoldFZ`) }, { quoted: msg })
      }
    },

    eventoagua: {
      aliases: ["promocaoagua", "aguapromo"],
      async executar({ sock, msg, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        if (!sistemaFazendaAtivo(jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑭𝑨𝒁𝑬𝑵𝑫𝑨 𝑶𝑭𝑭", "O modo fazenda está desativado.", `Peça a um admin: ${p}fazenda on`) }, { quoted: msg }) }
        const num = soNumero(sender)
        const { f, u } = getFazenda(num)
        const v = getVendedores()
        const expiraEm = (v.ultimoEventoAgua || 0) + DURACAO_VENDEDOR
        if (Date.now() > expiraEm) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝑬𝑽𝑬𝑵𝑻𝑶", "O evento de água terminou.", "Aguarde o próximo (2h).") }, { quoted: msg }) }
        const PRECO_PROMO = 60
        const { saldo } = getGoldFZ(num)
        if (saldo < PRECO_PROMO) { await reagir(sock, msg, "💸"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑽𝑬𝑵𝑻𝑶", "GoldFZ insuficiente.", `Precisa ${PRECO_PROMO} GoldFZ`) }, { quoted: msg }) }
        removeGoldFZ(num, PRECO_PROMO)
        u.agua += 3 * GALAO_AGUA
        dbSalvar("fazenda.json", f)
        await reagir(sock, msg, "🚰")
        await sock.sendMessage(jid, { text: msgSucesso("𝑬𝑽𝑬𝑵𝑻𝑶 𝑨𝑮𝑼𝑨", "3 galões por 60 GoldFZ!", `Total: ${u.agua}L\nPago: -${PRECO_PROMO} GoldFZ`) }, { quoted: msg })
      }
    },

    gerarkeyfz: {
      aliases: ["gerarkeyfazenda", "criarkeyfz"],
      donoOnly: true,
      async executar({ sock, msg, args, isDono, isSubDono }) {
        if (!isDono && !isSubDono) { await reagir(sock, msg, "🚫"); return }
        const jid = msg.key.remoteJid
        const qtd = parseInt(args[0])
        if (!qtd || qtd <= 0) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgErro("𝑲𝑬𝒀 𝑭𝒁", "Quantidade inválida.", "Use +gerarkeyfz <qtd>\nEx: +gerarkeyfz 1000") }, { quoted: msg }) }
        const dbKeys = dbLer("keysfz.json", { keys: {} })
        const novaKey = gerarKeyAleatoria()
        dbKeys.keys[novaKey] = { goldfz: qtd, usado: false, criadoPor: msg.key.participant || msg.key.remoteJid, criadoEm: Date.now() }
        dbSalvar("keysfz.json", dbKeys)
        await reagir(sock, msg, "🔑")
        await sock.sendMessage(jid, { text: msgSucesso("𝑲𝑬𝒀 𝑭𝒁", "Nova key de GoldFZ criada!", `Key: \`${novaKey}\`\nValor: *${qtd} GoldFZ*\n\nEssa key é de uso único.`) }, { quoted: msg })
      }
    },

    keygoldfz: {
      aliases: ["resgatargoldfz", "usarkeyfz"],
      async executar({ sock, msg, args, sender }) {
        const jid = msg.key.remoteJid
        const keyInserida = (args[0] || "").toUpperCase().trim()
        if (!keyInserida) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgErro("𝑲𝑬𝒀 𝑭𝒁", "Key em falta.", "Use +keygoldfz <key>") }, { quoted: msg }) }
        const dbKeys = dbLer("keysfz.json", { keys: {} })
        let keyReal = null
        for (const k in dbKeys.keys) { if (k.toUpperCase() === keyInserida) { keyReal = k; break } }
        if (!keyReal || !dbKeys.keys[keyReal]) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑲𝑬𝒀 𝑭𝒁", "Key inválida.", "A key digitada não existe ou está errada.") }, { quoted: msg }) }
        const dataKey = dbKeys.keys[keyReal]
        if (dataKey.usado) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑲𝑬𝒀 𝑭𝒁", "Key já resgatada.", "Essa key já foi utilizada.") }, { quoted: msg }) }
        const num = soNumero(sender)
        addGoldFZ(num, dataKey.goldfz)
        const { saldo } = getGoldFZ(num)
        dataKey.usado = true
        dataKey.usadoPor = num
        dataKey.usadoEm = Date.now()
        dbSalvar("keysfz.json", dbKeys)
        await reagir(sock, msg, "🔑")
        await sock.sendMessage(jid, { text: msgSucesso("𝑲𝑬𝒀 𝑭𝒁", "Key resgatada!", `+${dataKey.goldfz} GoldFZ\nSaldo: ${saldo}`) }, { quoted: msg })
      }
    }

  }
}