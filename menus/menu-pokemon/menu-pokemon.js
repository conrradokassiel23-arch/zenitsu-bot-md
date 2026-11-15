/* ============================================================
   🌸 MENU POKÉMON - LIMPO E ESTILIZADO
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
function soNumero(jid) { if (!jid) return ""; if (typeof jid === "object") jid = jid.phoneNumber || jid.id || ""; return String(jid).split("@")[0].split(":")[0].replace(/\D/g, "") }
function getCfg(db) { try { return db.config?.() || {} } catch { return {} } }

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

/* ---------- TIPOS ---------- */
const TIPOS = {
  normal: { emoji: "⚪", forte: [], fraco: ["lutador"] },
  fogo: { emoji: "🔥", forte: ["planta", "gelo", "inseto", "aço"], fraco: ["água", "terra", "pedra"] },
  água: { emoji: "💧", forte: ["fogo", "terra", "pedra"], fraco: ["elétrico", "planta"] },
  planta: { emoji: "🌿", forte: ["água", "terra", "pedra"], fraco: ["fogo", "gelo", "veneno", "voador", "inseto"] },
  elétrico: { emoji: "⚡", forte: ["água", "voador"], fraco: ["terra"] },
  gelo: { emoji: "❄️", forte: ["planta", "terra", "voador", "dragão"], fraco: ["fogo", "lutador", "pedra", "aço"] },
  lutador: { emoji: "🥊", forte: ["normal", "gelo", "pedra", "sombrio", "aço"], fraco: ["voador", "psíquico", "fada"] },
  veneno: { emoji: "☠️", forte: ["planta", "fada"], fraco: ["terra", "psíquico"] },
  terra: { emoji: "⛰️", forte: ["fogo", "elétrico", "veneno", "pedra", "aço"], fraco: ["água", "planta", "gelo"] },
  voador: { emoji: "🦅", forte: ["planta", "lutador", "inseto"], fraco: ["elétrico", "gelo", "pedra"] },
  psíquico: { emoji: "🔮", forte: ["lutador", "veneno"], fraco: ["inseto", "fantasma", "sombrio"] },
  inseto: { emoji: "🐛", forte: ["planta", "psíquico", "sombrio"], fraco: ["fogo", "voador", "pedra"] },
  pedra: { emoji: "🪨", forte: ["fogo", "gelo", "voador", "inseto"], fraco: ["água", "planta", "lutador", "terra", "aço"] },
  fantasma: { emoji: "👻", forte: ["psíquico", "fantasma"], fraco: ["fantasma", "sombrio"] },
  dragão: { emoji: "🐉", forte: ["dragão"], fraco: ["gelo", "dragão", "fada"] },
  aço: { emoji: "⚙️", forte: ["gelo", "pedra", "fada"], fraco: ["fogo", "lutador", "terra"] },
  fada: { emoji: "🧚", forte: ["dragão", "lutador", "sombrio"], fraco: ["veneno", "aço"] },
  sombrio: { emoji: "🌑", forte: ["psíquico", "fantasma"], fraco: ["lutador", "inseto", "fada"] }
}

function multiplicadorTipo(tipoAtk, tipoDef) {
  const atk = TIPOS[tipoAtk]
  if (!atk) return 1
  if (atk.forte.includes(tipoDef)) return 2
  if (atk.fraco.includes(tipoDef)) return 0.5
  return 1
}

/* ---------- POKÉMONS ---------- */
const POKEMONS = [
  { id: "pidgey", nome: "Pidgey", tipo: "normal", emoji: "🐦", raridade: "Comum", hp: 40, atk: 45, def: 40, spd: 56 },
  { id: "rattata", nome: "Rattata", tipo: "normal", emoji: "🐭", raridade: "Comum", hp: 30, atk: 56, def: 35, spd: 72 },
  { id: "caterpie", nome: "Caterpie", tipo: "inseto", emoji: "🐛", raridade: "Comum", hp: 45, atk: 30, def: 35, spd: 45 },
  { id: "weedle", nome: "Weedle", tipo: "inseto", emoji: "🐝", raridade: "Comum", hp: 40, atk: 35, def: 30, spd: 50 },
  { id: "zubat", nome: "Zubat", tipo: "veneno", emoji: "🦇", raridade: "Comum", hp: 40, atk: 45, def: 35, spd: 55 },
  { id: "oddish", nome: "Oddish", tipo: "planta", emoji: "🌱", raridade: "Comum", hp: 45, atk: 50, def: 55, spd: 30 },
  { id: "bellsprout", nome: "Bellsprout", tipo: "planta", emoji: "🌿", raridade: "Comum", hp: 50, atk: 75, def: 35, spd: 40 },
  { id: "diglett", nome: "Diglett", tipo: "terra", emoji: "🪨", raridade: "Comum", hp: 10, atk: 55, def: 25, spd: 95 },
  { id: "ekans", nome: "Ekans", tipo: "veneno", emoji: "🐍", raridade: "Comum", hp: 35, atk: 60, def: 44, spd: 55 },
  { id: "sandshrew", nome: "Sandshrew", tipo: "terra", emoji: "🦔", raridade: "Comum", hp: 50, atk: 75, def: 85, spd: 40 },
  { id: "poliwag", nome: "Poliwag", tipo: "água", emoji: "🐸", raridade: "Comum", hp: 40, atk: 50, def: 40, spd: 90 },
  { id: "slowpoke", nome: "Slowpoke", tipo: "água", emoji: "🦥", raridade: "Comum", hp: 90, atk: 65, def: 65, spd: 15 },
  { id: "magnemite", nome: "Magnemite", tipo: "elétrico", emoji: "🧲", raridade: "Comum", hp: 25, atk: 35, def: 70, spd: 45 },
  { id: "gastly", nome: "Gastly", tipo: "fantasma", emoji: "👻", raridade: "Comum", hp: 30, atk: 100, def: 35, spd: 80 },
  { id: "krabby", nome: "Krabby", tipo: "água", emoji: "🦀", raridade: "Comum", hp: 30, atk: 105, def: 90, spd: 50 },
  { id: "goldeen", nome: "Goldeen", tipo: "água", emoji: "🐠", raridade: "Comum", hp: 45, atk: 67, def: 60, spd: 63 },
  { id: "magikarp", nome: "Magikarp", tipo: "água", emoji: "🐟", raridade: "Comum", hp: 20, atk: 10, def: 55, spd: 80 },
  { id: "machop", nome: "Machop", tipo: "lutador", emoji: "💪", raridade: "Comum", hp: 70, atk: 80, def: 50, spd: 35 },
  { id: "meowth", nome: "Meowth", tipo: "normal", emoji: "🐱", raridade: "Comum", hp: 40, atk: 45, def: 35, spd: 90 },
  { id: "mankey", nome: "Mankey", tipo: "lutador", emoji: "🐒", raridade: "Comum", hp: 40, atk: 80, def: 35, spd: 70 },
  { id: "voltorb", nome: "Voltorb", tipo: "elétrico", emoji: "⚡", raridade: "Comum", hp: 40, atk: 30, def: 50, spd: 100 },
  { id: "drowzee", nome: "Drowzee", tipo: "psíquico", emoji: "💤", raridade: "Comum", hp: 60, atk: 48, def: 45, spd: 42 },
  { id: "bulbasaur", nome: "Bulbasaur", tipo: "planta", emoji: "🌱", raridade: "Incomum", hp: 45, atk: 49, def: 49, spd: 45 },
  { id: "charmander", nome: "Charmander", tipo: "fogo", emoji: "🔥", raridade: "Incomum", hp: 39, atk: 52, def: 43, spd: 65 },
  { id: "squirtle", nome: "Squirtle", tipo: "água", emoji: "💧", raridade: "Incomum", hp: 44, atk: 48, def: 65, spd: 43 },
  { id: "pikachu", nome: "Pikachu", tipo: "elétrico", emoji: "⚡", raridade: "Incomum", hp: 35, atk: 55, def: 40, spd: 90 },
  { id: "growlithe", nome: "Growlithe", tipo: "fogo", emoji: "🔥", raridade: "Incomum", hp: 55, atk: 70, def: 45, spd: 60 },
  { id: "vulpix", nome: "Vulpix", tipo: "fogo", emoji: "🦊", raridade: "Incomum", hp: 38, atk: 41, def: 40, spd: 65 },
  { id: "psyduck", nome: "Psyduck", tipo: "água", emoji: "🦆", raridade: "Incomum", hp: 50, atk: 52, def: 48, spd: 55 },
  { id: "abra", nome: "Abra", tipo: "psíquico", emoji: "🔮", raridade: "Incomum", hp: 25, atk: 20, def: 15, spd: 90 },
  { id: "jigglypuff", nome: "Jigglypuff", tipo: "normal", emoji: "🎤", raridade: "Incomum", hp: 115, atk: 45, def: 20, spd: 20 },
  { id: "clefairy", nome: "Clefairy", tipo: "fada", emoji: "🧚", raridade: "Incomum", hp: 70, atk: 45, def: 48, spd: 35 },
  { id: "cubone", nome: "Cubone", tipo: "terra", emoji: "🦴", raridade: "Incomum", hp: 50, atk: 50, def: 95, spd: 35 },
  { id: "rhyhorn", nome: "Rhyhorn", tipo: "pedra", emoji: "🦏", raridade: "Incomum", hp: 80, atk: 85, def: 95, spd: 25 },
  { id: "seel", nome: "Seel", tipo: "água", emoji: "🦭", raridade: "Incomum", hp: 65, atk: 45, def: 55, spd: 45 },
  { id: "shellder", nome: "Shellder", tipo: "água", emoji: "🐚", raridade: "Incomum", hp: 30, atk: 65, def: 100, spd: 40 },
  { id: "staryu", nome: "Staryu", tipo: "água", emoji: "⭐", raridade: "Incomum", hp: 30, atk: 45, def: 55, spd: 85 },
  { id: "arcanine", nome: "Arcanine", tipo: "fogo", emoji: "🦁", raridade: "Raro", hp: 90, atk: 110, def: 80, spd: 95 },
  { id: "ninetales", nome: "Ninetales", tipo: "fogo", emoji: "🦊", raridade: "Raro", hp: 73, atk: 76, def: 75, spd: 100 },
  { id: "machamp", nome: "Machamp", tipo: "lutador", emoji: "💪", raridade: "Raro", hp: 90, atk: 130, def: 80, spd: 55 },
  { id: "golem", nome: "Golem", tipo: "pedra", emoji: "🪨", raridade: "Raro", hp: 80, atk: 110, def: 130, spd: 45 },
  { id: "rapidash", nome: "Rapidash", tipo: "fogo", emoji: "🐎", raridade: "Raro", hp: 65, atk: 100, def: 70, spd: 105 },
  { id: "slowbro", nome: "Slowbro", tipo: "água", emoji: "🦥", raridade: "Raro", hp: 95, atk: 75, def: 110, spd: 30 },
  { id: "magneton", nome: "Magneton", tipo: "elétrico", emoji: "🧲", raridade: "Raro", hp: 50, atk: 60, def: 95, spd: 70 },
  { id: "muk", nome: "Muk", tipo: "veneno", emoji: "☠️", raridade: "Raro", hp: 105, atk: 105, def: 75, spd: 50 },
  { id: "cloyster", nome: "Cloyster", tipo: "água", emoji: "🐚", raridade: "Raro", hp: 50, atk: 95, def: 180, spd: 70 },
  { id: "hypno", nome: "Hypno", tipo: "psíquico", emoji: "💤", raridade: "Raro", hp: 85, atk: 73, def: 70, spd: 67 },
  { id: "hitmonlee", nome: "Hitmonlee", tipo: "lutador", emoji: "🥊", raridade: "Raro", hp: 50, atk: 120, def: 53, spd: 87 },
  { id: "hitmonchan", nome: "Hitmonchan", tipo: "lutador", emoji: "🥊", raridade: "Raro", hp: 50, atk: 105, def: 79, spd: 76 },
  { id: "scyther", nome: "Scyther", tipo: "inseto", emoji: "🦗", raridade: "Raro", hp: 70, atk: 110, def: 80, spd: 105 },
  { id: "snorlax", nome: "Snorlax", tipo: "normal", emoji: "😴", raridade: "Raro", hp: 160, atk: 110, def: 65, spd: 30 },
  { id: "chansey", nome: "Chansey", tipo: "normal", emoji: "🥚", raridade: "Raro", hp: 250, atk: 5, def: 5, spd: 50 },
  { id: "tangela", nome: "Tangela", tipo: "planta", emoji: "🌿", raridade: "Raro", hp: 65, atk: 55, def: 115, spd: 60 },
  { id: "kangaskhan", nome: "Kangaskhan", tipo: "normal", emoji: "🦘", raridade: "Raro", hp: 105, atk: 95, def: 80, spd: 90 },
  { id: "dratini", nome: "Dratini", tipo: "dragão", emoji: "🐉", raridade: "Raro", hp: 41, atk: 64, def: 45, spd: 50 },
  { id: "dragonair", nome: "Dragonair", tipo: "dragão", emoji: "🐉", raridade: "Raro", hp: 61, atk: 84, def: 65, spd: 70 },
  { id: "omanyte", nome: "Omanyte", tipo: "pedra", emoji: "🐚", raridade: "Épico", hp: 35, atk: 40, def: 100, spd: 35 },
  { id: "kabuto", nome: "Kabuto", tipo: "pedra", emoji: "🦀", raridade: "Épico", hp: 30, atk: 80, def: 90, spd: 55 },
  { id: "aerodactyl", nome: "Aerodactyl", tipo: "pedra", emoji: "🦅", raridade: "Épico", hp: 80, atk: 105, def: 65, spd: 130 },
  { id: "lapras", nome: "Lapras", tipo: "água", emoji: "🦭", raridade: "Épico", hp: 130, atk: 85, def: 80, spd: 60 },
  { id: "ditto", nome: "Ditto", tipo: "normal", emoji: "🫠", raridade: "Épico", hp: 48, atk: 48, def: 48, spd: 48 },
  { id: "porygon", nome: "Porygon", tipo: "normal", emoji: "💻", raridade: "Épico", hp: 65, atk: 60, def: 70, spd: 40 },
  { id: "eevee", nome: "Eevee", tipo: "normal", emoji: "🦊", raridade: "Épico", hp: 55, atk: 55, def: 50, spd: 55 },
  { id: "vaporeon", nome: "Vaporeon", tipo: "água", emoji: "💧", raridade: "Épico", hp: 130, atk: 65, def: 60, spd: 65 },
  { id: "jolteon", nome: "Jolteon", tipo: "elétrico", emoji: "⚡", raridade: "Épico", hp: 65, atk: 65, def: 60, spd: 130 },
  { id: "flareon", nome: "Flareon", tipo: "fogo", emoji: "🔥", raridade: "Épico", hp: 65, atk: 130, def: 60, spd: 65 },
  { id: "articuno", nome: "Articuno", tipo: "gelo", emoji: "❄️", raridade: "Lendário", hp: 90, atk: 85, def: 100, spd: 85 },
  { id: "zapdos", nome: "Zapdos", tipo: "elétrico", emoji: "⚡", raridade: "Lendário", hp: 90, atk: 90, def: 85, spd: 100 },
  { id: "moltres", nome: "Moltres", tipo: "fogo", emoji: "🔥", raridade: "Lendário", hp: 90, atk: 100, def: 90, spd: 90 },
  { id: "mewtwo", nome: "Mewtwo", tipo: "psíquico", emoji: "🔮", raridade: "Lendário", hp: 106, atk: 110, def: 90, spd: 130 },
  { id: "mew", nome: "Mew", tipo: "psíquico", emoji: "🧚", raridade: "Mítico", hp: 100, atk: 100, def: 100, spd: 100 },
  { id: "rayquaza", nome: "Rayquaza", tipo: "dragão", emoji: "🐉", raridade: "Mítico", hp: 105, atk: 150, def: 90, spd: 95 }
]

const RARIDADES = ["Comum", "Incomum", "Raro", "Épico", "Lendário", "Mítico"]
const PESOS_RARIDADE = { Comum: 0.60, Incomum: 0.25, Raro: 0.10, Épico: 0.04, Lendário: 0.009, Mítico: 0.001 }

function sortearRaridade() { const r = Math.random(); let acc = 0; for (const rar of RARIDADES) { acc += PESOS_RARIDADE[rar]; if (r < acc) return rar } return "Comum" }
function itensPorRaridade(raridade) { return POKEMONS.filter(x => x.raridade === raridade) }

/* ---------- CONFIG POR GRUPO ---------- */
function getPokeCfg() { return dbLer("pokemoncfg.json", { grupos: {} }) }
function salvarPokeCfg(cfg) { dbSalvar("pokemoncfg.json", cfg) }
function sistemaPokemonAtivo(db, jid) { const cfg = getPokeCfg(); return cfg.grupos[jid]?.ativo === true }

function bloquearSeOff(sock, msg, db, prefixoAtivo) {
  const jid = msg.key.remoteJid
  if (sistemaPokemonAtivo(db, jid)) return false
  const nomeBot = nomeBotDb(db)
  const p = prefixoAtivo || "+"
  sock.sendMessage(jid, { text: msgErro("𝑷𝑶𝑲𝑬́𝑴𝑶𝑵 𝑶𝑭𝑭", "O sistema Pokémon está desativado.", `Use \`${p}pokemon on\``) }, { quoted: msg }).catch(() => {})
  return true
}

/* ---------- TREINADOR ---------- */
function getTreinador(num) {
  const t = dbLer("pokemon.json", { treinadores: {} })
  t.treinadores = t.treinadores || {}
  t.treinadores[num] = t.treinadores[num] || { nivel: 1, xp: 0, pokecoins: 0, time: [], box: [], pokedex: [], pokebolas: { pokebola: 10, greatball: 0, ultraball: 0, masterball: 0 }, vitorias: 0, derrotas: 0, ultimaCaptura: 0, ultimoPvP: 0, ultimaMissao: 0 }
  const u = t.treinadores[num]
  u.time = u.time || []; u.box = u.box || []; u.pokedex = u.pokedex || []
  u.pokebolas = u.pokebolas || { pokebola: 10, greatball: 0, ultraball: 0, masterball: 0 }
  return { t, u }
}
function salvarTreinadorUser(num, u) { const t = dbLer("pokemon.json", { treinadores: {} }); t.treinadores = t.treinadores || {}; t.treinadores[num] = u; dbSalvar("pokemon.json", t) }

function criarPokemon(base, nivel, shiny = false) {
  const nv = nivel || 3
  return { id: base.id, nome: base.nome, tipo: base.tipo, emoji: base.emoji, raridade: base.raridade, nivel: nv, shiny, hpMax: base.hp + nv * 2, hp: base.hp + nv * 2, atk: base.atk + nv * 2, def: base.def + nv * 2, spd: base.spd + nv * 2, xp: 0 }
}

function darXpTreinador(u, xp) {
  u.xp = (u.xp || 0) + xp
  let upou = false
  while (u.xp >= u.nivel * 100) { u.xp -= u.nivel * 100; u.nivel++; upou = true }
  return upou
}

/* ---------- POKÉBOLAS ---------- */
const BOLAS = {
  pokebola: { nome: "Pokébola", emoji: "🔴", bonus: 10, preco: 100 },
  greatball: { nome: "Great Ball", emoji: "🔵", bonus: 25, preco: 300 },
  ultraball: { nome: "Ultra Ball", emoji: "🟣", bonus: 45, preco: 800 },
  masterball: { nome: "Master Ball", emoji: "🟡", bonus: 100, preco: 5000 }
}

function calcularChanceCaptura(pokemon, treinador, tipoBola) {
  const hpFracao = pokemon.hp / pokemon.hpMax
  const bonusHP = (1 - hpFracao) * 50
  const bonusBola = BOLAS[tipoBola]?.bonus || 10
  const bonusNivel = treinador.nivel * 2
  const bonusRaridade = { Comum: 30, Incomum: 20, Raro: 10, Épico: 5, Lendário: 1, Mítico: 0.1 }[pokemon.raridade] || 0
  const bonusShiny = pokemon.shiny ? 50 : 0
  return Math.min(100, bonusHP + bonusBola + bonusNivel + bonusRaridade + bonusShiny)
}

/* ---------- SELVAGEM ---------- */
function getSelvagem(jid) { return dbLer("pokemonselvagem.json", {})[jid] || null }
function setSelvagem(jid, dado) { const s = dbLer("pokemonselvagem.json", {}); s[jid] = dado; dbSalvar("pokemonselvagem.json", s) }
function delSelvagem(jid) { const s = dbLer("pokemonselvagem.json", {}); delete s[jid]; dbSalvar("pokemonselvagem.json", s) }

/* ---------- LOBBY PVP ---------- */
function getLobby(jid) { return dbLer("pokemonlobby.json", {})[jid] || null }
function setLobby(jid, dados) { const l = dbLer("pokemonlobby.json", {}); l[jid] = dados; dbSalvar("pokemonlobby.json", l) }
function delLobby(jid) { const l = dbLer("pokemonlobby.json", {}); delete l[jid]; dbSalvar("pokemonlobby.json", l) }

module.exports = {
  menu: "menu-pokemon",
  grupoOnly: false,
  adminOnly: false,
  donoOnly: false,

  async rendaAutomatica(sock, db) {
    const agora = Date.now()
    const cfg = getPokeCfg()
    const gruposAtivos = Object.keys(cfg.grupos || {}).filter(j => cfg.grupos[j]?.ativo === true)

    for (const jid of gruposAtivos) {
      const sel = getSelvagem(jid)
      if (sel && sel.expiraEm > agora) continue
      if (sel && sel.expiraEm <= agora) {
        delSelvagem(jid)
        try { await sock.sendMessage(jid, { text: msgAviso("𝑷𝑶𝑲𝑬́𝑴𝑶𝑵 𝑭𝑼𝑮𝑰𝑼", "Ninguém capturou a tempo.", "Aguarde o próximo.") }) } catch (_) {}
        continue
      }

      if (Math.random() > 0.15) continue

      const raridade = sortearRaridade()
      const pool = itensPorRaridade(raridade)
      if (!pool.length) continue
      const base = pool[Math.floor(Math.random() * pool.length)]
      const nivel = Math.floor(Math.random() * 15) + 1
      const shiny = Math.random() < (1 / 512)
      const pokemon = criarPokemon(base, nivel, shiny)

      setSelvagem(jid, { pokemon, expiraEm: agora + 3 * 60 * 1000, criadoEm: agora })

      const emojiRar = { Comum: "🟢", Incomum: "🔵", Raro: "🟣", Épico: "🟡", Lendário: "🔴", Mítico: "💀" }[raridade]
      const shinyTxt = shiny ? "\n✨ *SHINY!* ✨" : ""

      try {
        await sock.sendMessage(jid, {
          text: `𝑷𝑶𝑲𝑬́𝑴𝑶𝑵 𝑺𝑬𝑳𝑽𝑨𝑮𝑬𝑴\n\n${pokemon.emoji} ${pokemon.nome}\n${emojiRar} Raridade: ${raridade}\n🎚️ Nível: ${nivel}\n${TIPOS[pokemon.tipo]?.emoji || "❓"} Tipo: ${pokemon.tipo}\n❤️ HP: ${pokemon.hpMax}${shinyTxt}\n\nUse \`+pokecapturar\` em 3 minutos!`
        })
      } catch (_) {}
    }
  },

  commands: {

    menupokemon: {
      aliases: ["pokemon", "menup", "comandospokemon"],
      async executar({ sock, msg, prefixoAtivo, db, sender, isDono, isSubDono, isAdmin }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const nomeBot = nomeBotDb(db)
        const num = soNumero(sender)
        const { u } = getTreinador(num)
        await reagir(sock, msg, "🌸")

        const texto = `𝑷𝑶𝑲𝑬́𝑴𝑶𝑵

Usuário: ${msg.pushName || "Treinador"}
Nível: ${u.nivel}
XP: ${u.xp}/${u.nivel * 100}
PokéCoins: ${u.pokecoins}
Vitórias: ${u.vitorias}
Derrotas: ${u.derrotas}

𝑪𝑨𝑷𝑻𝑼𝑹𝑨
${p}pokecapturar
${p}pokebola <tipo> <qtd>
${p}pokebolas

𝑴𝑬𝑼 𝑻𝑰𝑴𝑬
${p}poketime
${p}pokebox
${p}pokedex
${p}pokever <nome>
${p}pokemover <slot>
${p}pokearmazenar <nome>
${p}pokelibertar <nome>

𝑷𝒗𝑷
${p}pvppoke
${p}entrarpvp
${p}escolherpkm <nº>
${p}recusar

𝑳𝑶𝑱𝑨 & 𝑪𝑨𝑹𝑻𝑬𝑰𝑹𝑨
${p}pokeloja
${p}pokecarteira
${p}pokemissao
${p}rankingpkc

𝑨𝑫𝑴𝑰𝑵
${p}pokemon on/off
${p}gerarkeypkc <qtd>
${p}keypkc <key>

> _Prefixo: ${p}_`

        const cfg = getCfg(db)
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

    pokemon: {
      aliases: ["pokemonon", "pokemonoff", "ativarpokemon"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, prefixoAtivo, isDono, isSubDono, isAdmin }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const nomeBot = nomeBotDb(db)
        const op = (args[0] || "").toLowerCase()

        if (!isDono && !isSubDono && !isAdmin) {
          await reagir(sock, msg, "🚫")
          return sock.sendMessage(jid, { text: msgErro("𝑨𝑽𝑰𝑺𝑶", "Apenas admins podem ativar.") }, { quoted: msg })
        }

        const cfg = getPokeCfg()
        cfg.grupos[jid] = cfg.grupos[jid] || {}

        if (!["on", "off"].includes(op)) {
          const s = cfg.grupos[jid].ativo ? "ON ✅" : "OFF ❌"
          await reagir(sock, msg, "🌸")
          return sock.sendMessage(jid, { text: msgAviso("𝑷𝑶𝑲𝑬́𝑴𝑶𝑵", `Status atual: ${s}`, `Use \`${p}pokemon on/off\``) }, { quoted: msg })
        }

        cfg.grupos[jid].ativo = op === "on"
        salvarPokeCfg(cfg)

        await reagir(sock, msg, op === "on" ? "✅" : "🗑️")
        await sock.sendMessage(jid, { text: op === "on" ? msgSucesso("", "Sistema ativado.") : msgAviso("𝑷𝑶𝑲𝑬́𝑴𝑶𝑵", "Sistema desativado.") }, { quoted: msg })
      }
    },

    pokebola: {
      aliases: ["buybola", "comprarbola"],
      async executar({ sock, msg, args, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const p = prefixoAtivo || "+"
        const num = soNumero(sender)
        const { u } = getTreinador(num)
        const tipo = (args[0] || "").toLowerCase()
        const qtd = parseInt(args[1]) || 1

        if (!BOLAS[tipo]) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑷𝑶𝑲𝑬𝑩𝑶𝑳𝑨", "Tipo inválido.", `Use: \`${p}pokebola pokebola 10\``) }, { quoted: msg }) }
        if (qtd < 1 || qtd > 50) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑷𝑶𝑲𝑬𝑩𝑶𝑳𝑨", "Qtd inválida.", "1 a 50") }, { quoted: msg }) }

        const bola = BOLAS[tipo]
        const total = bola.preco * qtd
        if (u.pokecoins < total) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑷𝑶𝑲𝑬𝑩𝑶𝑳𝑨", "PokéCoins insuficiente.", `Faltam ${total - u.pokecoins}`) }, { quoted: msg }) }

        u.pokecoins -= total
        u.pokebolas[tipo] = (u.pokebolas[tipo] || 0) + qtd
        salvarTreinadorUser(num, u)

        await reagir(sock, msg, "✅")
        await sock.sendMessage(jid, { text: msgSucesso("", "Comprada!", `${bola.emoji} ${bola.nome} x${qtd}\n-${total} PokéCoins`) }, { quoted: msg })
      }
    },

    pokebolas: {
      aliases: ["minhasbolas", "bolas"],
      async executar({ sock, msg, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const num = soNumero(sender)
        const { u } = getTreinador(num)
        await reagir(sock, msg, "🌸")

        let txt = `𝑺𝑼𝑨𝑺 𝑷𝑶𝑲𝑬𝑩𝑶𝑳𝑨𝑺\n\n`
        for (const [id, bola] of Object.entries(BOLAS)) {
          txt += `${bola.emoji} ${bola.nome}: ${u.pokebolas[id] || 0}\n`
        }
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    pokecapturar: {
      aliases: ["capturar", "catch"],
      async executar({ sock, msg, db, sender, args, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const p = prefixoAtivo || "+"
        const num = soNumero(sender)
        const { u } = getTreinador(num)

        const sel = getSelvagem(jid)
        if (!sel) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑪𝑨𝑷𝑻𝑼𝑹𝑨𝑹", "Nenhum Pokémon selvagem.", "Aguarde um aparecer.") }, { quoted: msg }) }
        if (sel.expiraEm <= Date.now()) { delSelvagem(jid); await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑪𝑨𝑷𝑻𝑼𝑹𝑨𝑹", "O Pokémon fugiu.") }, { quoted: msg }) }

        const tipoBola = (args[0] || "pokebola").toLowerCase()
        if (!BOLAS[tipoBola]) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑪𝑨𝑷𝑻𝑼𝑹𝑨𝑹", "Bola inválida.", `Use: \`${p}pokecapturar pokebola\``) }, { quoted: msg }) }
        if ((u.pokebolas[tipoBola] || 0) < 1) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑪𝑨𝑷𝑻𝑼𝑹𝑨𝑹", "Sem essa bola.", `Compre com \`${p}pokebola ${tipoBola} 10\``) }, { quoted: msg }) }

        u.pokebolas[tipoBola] -= 1
        const chance = calcularChanceCaptura(sel.pokemon, u, tipoBola)
        const sorteio = Math.random() * 100
        const pegou = sorteio < chance

        await reagir(sock, msg, "🌸")

        if (!pegou) {
          salvarTreinadorUser(num, u)
          await sock.sendMessage(jid, { text: msgErro("𝑭𝑼𝑮𝑰𝑼", "O Pokémon escapou!", `${sel.pokemon.emoji} ${sel.pokemon.nome}\nChance era: ${chance.toFixed(1)}%`) }, { quoted: msg })
          return
        }

        if (u.time.length < 6) u.time.push(sel.pokemon)
        else u.box.push(sel.pokemon)

        if (!u.pokedex.includes(sel.pokemon.id)) u.pokedex.push(sel.pokemon.id)
        u.ultimaCaptura = Date.now()
        const upou = darXpTreinador(u, 20)
        salvarTreinadorUser(num, u)
        delSelvagem(jid)

        const destino = u.time.length <= 6 ? "Time" : "Box"
        const shinyTxt = sel.pokemon.shiny ? "\n✨ *SHINY!* ✨" : ""

        await sock.sendMessage(jid, { text: msgSucesso("", "Pokémon capturado!", `${sel.pokemon.emoji} ${sel.pokemon.nome}\nRaridade: ${sel.pokemon.raridade}\nNível: ${sel.pokemon.nivel}\nTipo: ${sel.pokemon.tipo}\nHP: ${sel.pokemon.hpMax}${shinyTxt}\nDestino: ${destino}`), mentions: [sender] }, { quoted: msg })
      }
    },

    poketime: {
      aliases: ["meutime", "time"],
      async executar({ sock, msg, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const p = prefixoAtivo || "+"
        const num = soNumero(sender)
        const { u } = getTreinador(num)
        if (!u.time.length) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑻𝑰𝑴𝑬", "Seu time está vazio.", `Capture com \`${p}pokecapturar\``) }, { quoted: msg }) }

        await reagir(sock, msg, "🌸")
        let txt = `𝑻𝑰𝑴𝑬 (${u.time.length}/6)\n\n`
        u.time.forEach((pkm, i) => {
          const shiny = pkm.shiny ? " ✨" : ""
          txt += `#${i + 1} ${pkm.emoji} ${pkm.nome}${shiny}\nNível: ${pkm.nivel} | ${pkm.raridade}\nTipo: ${pkm.tipo} | HP: ${pkm.hp}/${pkm.hpMax}\n\n`
        })
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    pokebox: {
      aliases: ["box", "pc"],
      async executar({ sock, msg, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const p = prefixoAtivo || "+"
        const num = soNumero(sender)
        const { u } = getTreinador(num)
        if (!u.box.length) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑩𝑶𝑿", "Seu box está vazio.", `Capture mais com \`${p}pokecapturar\``) }, { quoted: msg }) }

        await reagir(sock, msg, "🌸")
        let txt = `𝑩𝑶𝑿 (${u.box.length})\n\n`
        u.box.slice(0, 20).forEach((pkm, i) => {
          const shiny = pkm.shiny ? " ✨" : ""
          txt += `${i + 1}. ${pkm.emoji} ${pkm.nome}${shiny} — Nv ${pkm.nivel}\n`
        })
        if (u.box.length > 20) txt += `\n... e mais ${u.box.length - 20}`
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    pokedex: {
      aliases: ["dex", "pokédex"],
      async executar({ sock, msg, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const num = soNumero(sender)
        const { u } = getTreinador(num)
        await reagir(sock, msg, "🌸")

        let txt = `𝑷𝑶𝑲𝑬́𝑫𝑬𝑿\n\nTotal: ${u.pokedex.length} / ${POKEMONS.length}\n\n`
        for (const raridade of RARIDADES) {
          const total = POKEMONS.filter(x => x.raridade === raridade).length
          const capturados = u.pokedex.filter(id => POKEMONS.find(x => x.id === id && x.raridade === raridade)).length
          txt += `${raridade}: ${capturados}/${total}\n`
        }
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    pokever: {
      aliases: ["verpokemon", "info"],
      async executar({ sock, msg, args, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const num = soNumero(sender)
        const { u } = getTreinador(num)
        const busca = normalizar(args.join(" "))
        if (!busca) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgErro("𝑽𝑬𝑹", "Informe o nome.", "Use `+pokever pikachu`") }, { quoted: msg }) }

        const pkm = u.time.find(p2 => normalizar(p2.nome) === busca || p2.id === busca) || u.box.find(p2 => normalizar(p2.nome) === busca || p2.id === busca)
        if (!pkm) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑽𝑬𝑹", "Você não tem esse Pokémon.", busca) }, { quoted: msg }) }

        await reagir(sock, msg, "🌸")
        const shiny = pkm.shiny ? " ✨" : ""
        await sock.sendMessage(jid, { text: msgSucesso("", `${pkm.emoji} ${pkm.nome}${shiny}`, `${pkm.raridade} | Nv ${pkm.nivel}\nTipo: ${pkm.tipo}\nHP: ${pkm.hp}/${pkm.hpMax}\nATK: ${pkm.atk} | DEF: ${pkm.def} | SPD: ${pkm.spd}`) }, { quoted: msg })
      }
    },

    pokemover: {
      aliases: ["mover", "pormtime"],
      async executar({ sock, msg, args, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const num = soNumero(sender)
        const { u } = getTreinador(num)
        const idx = parseInt(args[0]) - 1
        if (isNaN(idx) || idx < 0 || idx >= u.box.length) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgErro("𝑴𝑶𝑽𝑬𝑹", "Índice inválido.", "Use `+pokemover <nº>`") }, { quoted: msg }) }
        if (u.time.length >= 6) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑴𝑶𝑽𝑬𝑹", "Time cheio.", "Armazene um primeiro.") }, { quoted: msg }) }
        const pkm = u.box.splice(idx, 1)[0]
        u.time.push(pkm)
        salvarTreinadorUser(num, u)
        await reagir(sock, msg, "✅")
        await sock.sendMessage(jid, { text: msgSucesso("", "Pokémon no time!", `${pkm.emoji} ${pkm.nome}`) }, { quoted: msg })
      }
    },

    pokearmazenar: {
      aliases: ["armazenar", "guardar"],
      async executar({ sock, msg, args, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const num = soNumero(sender)
        const { u } = getTreinador(num)
        const busca = normalizar(args.join(" "))
        if (!busca) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgErro("𝑨𝑹𝑴𝑨𝒁𝑬𝑵𝑨𝑹", "Informe o nome.", "Use `+pokearmazenar pikachu`") }, { quoted: msg }) }
        const idx = u.time.findIndex(p2 => normalizar(p2.nome) === busca || p2.id === busca)
        if (idx === -1) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑨𝑹𝑴𝑨𝒁𝑬𝑵𝑨𝑹", "Não está no time.", busca) }, { quoted: msg }) }
        if (u.time.length <= 1) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑨𝑹𝑴𝑨𝒁𝑬𝑵𝑨𝑹", "Precisa ter ao menos 1 no time.") }, { quoted: msg }) }
        const pkm = u.time.splice(idx, 1)[0]
        u.box.push(pkm)
        salvarTreinadorUser(num, u)
        await reagir(sock, msg, "✅")
        await sock.sendMessage(jid, { text: msgSucesso("", "Pokémon no box!", `${pkm.emoji} ${pkm.nome}`) }, { quoted: msg })
      }
    },

    pokelibertar: {
      aliases: ["liberar", "soltar"],
      async executar({ sock, msg, args, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const num = soNumero(sender)
        const { u } = getTreinador(num)
        const busca = normalizar(args.join(" "))
        if (!busca) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgErro("𝑳𝑰𝑩𝑬𝑹𝑻𝑨𝑹", "Informe o nome.", "Use `+pokelibertar pikachu`") }, { quoted: msg }) }
        const idx = u.box.findIndex(p2 => normalizar(p2.nome) === busca || p2.id === busca)
        if (idx === -1) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑳𝑰𝑩𝑬𝑹𝑻𝑨𝑹", "Não está no box.", busca) }, { quoted: msg }) }
        const pkm = u.box.splice(idx, 1)[0]
        const upou = darXpTreinador(u, 10)
        u.pokecoins += 50
        salvarTreinadorUser(num, u)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("", "Pokémon liberado.", `${pkm.emoji} ${pkm.nome}\n+10 XP\n+50 PokéCoins${upou ? `\n⭐ Subiu de nível!` : ""}`) }, { quoted: msg })
      }
    },

    pvppoke: {
      aliases: ["pvppokemon", "lobbypoke", "lobby"],
      async executar({ sock, msg, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const p = prefixoAtivo || "+"
        const num = soNumero(sender)
        const { u } = getTreinador(num)
        if (!u.time.length) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑷𝒗𝑷", "Você não tem Pokémon.", `Capture com \`${p}pokecapturar\``) }, { quoted: msg }) }

        const lobbyAtual = getLobby(jid)
        if (lobbyAtual) {
          if (lobbyAtual.jogador1 === num) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑳𝑶𝑩𝑩𝒀", "Você já tem um lobby aberto.", "Aguarde alguém entrar.") }, { quoted: msg }) }
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝑳𝑶𝑩𝑩𝒀", "Já tem um lobby aberto neste grupo.") }, { quoted: msg })
        }

        setLobby(jid, { jogador1: num, jogador2: null, estado: "esperando", criadoEm: Date.now(), escolha1: null, escolha2: null, pokemon1: null, pokemon2: null })

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: `𝑳𝑶𝑩𝑩𝒀 𝑷𝒗𝑷\n\n@${num} abriu um lobby!\n\nUse \`${p}entrarpvp\` para entrar.`, mentions: [`${num}@s.whatsapp.net`] }, { quoted: msg })
      }
    },

    entrarpvp: {
      aliases: ["entrar", "joinpvp"],
      async executar({ sock, msg, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const p = prefixoAtivo || "+"
        const num = soNumero(sender)

        const lobby = getLobby(jid)
        if (!lobby) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑳𝑶𝑩𝑩𝒀", "Nenhum lobby aberto.", `Use \`${p}pvppoke\``) }, { quoted: msg }) }
        if (lobby.jogador1 === num) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgErro("𝑳𝑶𝑩𝑩𝒀", "Você é o jogador 1.", "Aguarde alguém entrar.") }, { quoted: msg }) }
        if (lobby.jogador2) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑳𝑶𝑩𝑩𝒀", "Lobby já está cheio.") }, { quoted: msg }) }

        const { u: u2 } = getTreinador(num)
        if (!u2.time.length) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑷𝒗𝑷", "Você não tem Pokémon.") }, { quoted: msg }) }

        lobby.jogador2 = num
        lobby.estado = "escolhendo"
        setLobby(jid, lobby)

        const { u: u1 } = getTreinador(lobby.jogador1)

        let txt = `𝑩𝑨𝑻𝑨𝑳𝑯𝑨 𝑷𝒗𝑷\n\n@${lobby.jogador1}:\n`
        u1.time.forEach((pk, i) => { txt += `${i + 1}. ${pk.emoji} ${pk.nome} (Nv ${pk.nivel})\n` })
        txt += `\n@${num}:\n`
        u2.time.forEach((pk, i) => { txt += `${i + 1}. ${pk.emoji} ${pk.nome} (Nv ${pk.nivel})\n` })
        txt += `\nEscolham:\n${p}escolherpkm <nº>`

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: txt, mentions: [`${lobby.jogador1}@s.whatsapp.net`, `${num}@s.whatsapp.net`] }, { quoted: msg })
      }
    },

    recusar: {
      aliases: ["recusardesafio", "cancelarpvp"],
      async executar({ sock, msg, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const num = soNumero(sender)
        const lobby = getLobby(jid)
        if (!lobby) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑹𝑬𝑪𝑼𝑺𝑨𝑹", "Nenhum lobby aberto.") }, { quoted: msg }) }
        if (lobby.jogador1 !== num && lobby.jogador2 !== num) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑹𝑬𝑪𝑼𝑺𝑨𝑹", "Você não está nesse lobby.") }, { quoted: msg }) }
        delLobby(jid)
        await reagir(sock, msg, "🗑️")
        await sock.sendMessage(jid, { text: msgSucesso("", "Lobby cancelado.", `@${num}`), mentions: [`${num}@s.whatsapp.net`] }, { quoted: msg })
      }
    },

    escolherpkm: {
      aliases: ["escolher", "pickpkm"],
      async executar({ sock, msg, args, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const p = prefixoAtivo || "+"
        const num = soNumero(sender)

        const lobby = getLobby(jid)
        if (!lobby) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑺𝑪𝑶𝑳𝑯𝑬𝑹", "Nenhuma batalha ativa.", `Use \`${p}pvppoke\``) }, { quoted: msg }) }
        if (lobby.estado !== "escolhendo") { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑺𝑪𝑶𝑳𝑯𝑬𝑹", "Batalha não está na fase de escolha.") }, { quoted: msg }) }
        if (num !== lobby.jogador1 && num !== lobby.jogador2) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑺𝑪𝑶𝑳𝑯𝑬𝑹", "Você não está nessa batalha.") }, { quoted: msg }) }

        const idx = parseInt(args[0]) - 1
        if (isNaN(idx) || idx < 0) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑺𝑪𝑶𝑳𝑯𝑬𝑹", "Índice inválido.", `Use \`${p}escolherpkm 1\``) }, { quoted: msg }) }

        const { u } = getTreinador(num)
        if (idx >= u.time.length) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑺𝑪𝑶𝑳𝑯𝑬𝑹", "Pokémon não existe.") }, { quoted: msg }) }
        const pkm = u.time[idx]

        if (num === lobby.jogador1) {
          if (lobby.escolha1 !== null) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑺𝑪𝑶𝑳𝑯𝑬𝑹", "Você já escolheu.", `${lobby.pokemon1?.emoji} ${lobby.pokemon1?.nome}`) }, { quoted: msg }) }
          lobby.escolha1 = idx; lobby.pokemon1 = pkm
        } else {
          if (lobby.escolha2 !== null) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑺𝑪𝑶𝑳𝑯𝑬𝑹", "Você já escolheu.", `${lobby.pokemon2?.emoji} ${lobby.pokemon2?.nome}`) }, { quoted: msg }) }
          lobby.escolha2 = idx; lobby.pokemon2 = pkm
        }
        setLobby(jid, lobby)

        await reagir(sock, msg, "✅")
        await sock.sendMessage(jid, { text: msgSucesso("", "Pokémon pronto!", `${pkm.emoji} ${pkm.nome} (Nv ${pkm.nivel})`) }, { quoted: msg })

        if (lobby.escolha1 !== null && lobby.escolha2 !== null) {
          const p1 = lobby.pokemon1
          const p2 = lobby.pokemon2
          const m1 = multiplicadorTipo(p1.tipo, p2.tipo)
          const m2 = multiplicadorTipo(p2.tipo, p1.tipo)
          const dano1 = Math.max(1, Math.floor(p1.atk * m1 - p2.def * 0.5))
          const dano2 = Math.max(1, Math.floor(p2.atk * m2 - p1.def * 0.5))
          const hp1Restante = p1.hp - dano2
          const hp2Restante = p2.hp - dano1

          let vencedor = null
          if (hp1Restante <= 0 && hp2Restante <= 0) vencedor = "empate"
          else if (hp1Restante <= 0) vencedor = lobby.jogador2
          else if (hp2Restante <= 0) vencedor = lobby.jogador1
          else if (hp2Restante < hp1Restante) vencedor = lobby.jogador1
          else if (hp1Restante < hp2Restante) vencedor = lobby.jogador2
          else vencedor = "empate"

          delLobby(jid)

          const { u: u1 } = getTreinador(lobby.jogador1)
          const { u: u2 } = getTreinador(lobby.jogador2)

          let recompensaTxt = ""
          if (vencedor === "empate") {
            u1.pokecoins += 30; u2.pokecoins += 30
            recompensaTxt = "Empate! Cada um +30 PokéCoins"
          } else if (vencedor === lobby.jogador1) {
            u1.pokecoins += 100; u1.vitorias = (u1.vitorias || 0) + 1; u2.derrotas = (u2.derrotas || 0) + 1
            darXpTreinador(u1, 50)
            recompensaTxt = `@${lobby.jogador1} venceu! +100 PokéCoins +50 XP`
          } else {
            u2.pokecoins += 100; u2.vitorias = (u2.vitorias || 0) + 1; u1.derrotas = (u1.derrotas || 0) + 1
            darXpTreinador(u2, 50)
            recompensaTxt = `@${lobby.jogador2} venceu! +100 PokéCoins +50 XP`
          }
          salvarTreinadorUser(lobby.jogador1, u1)
          salvarTreinadorUser(lobby.jogador2, u2)

          const resultadoTxt = `𝑩𝑨𝑻𝑨𝑳𝑯𝑨 𝑷𝒗𝑷\n\n${p1.emoji} ${p1.nome}\nDano: ${dano1} | HP: ${p1.hp} → ${Math.max(0, hp1Restante)}\n\n${p2.emoji} ${p2.nome}\nDano: ${dano2} | HP: ${p2.hp} → ${Math.max(0, hp2Restante)}\n\n${vencedor === "empate" ? "🤝 Empate!" : `🏆 @${vencedor}`}\n\n${recompensaTxt}`

          await sock.sendMessage(jid, { text: resultadoTxt, mentions: [`${lobby.jogador1}@s.whatsapp.net`, `${lobby.jogador2}@s.whatsapp.net`] }, { quoted: msg })
        }
      }
    },

    pokeloja: {
      aliases: ["lojapokemon", "shoppokemon"],
      async executar({ sock, msg, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const num = soNumero(sender)
        const { u } = getTreinador(num)
        await reagir(sock, msg, "🌸")

        let txt = `𝑳𝑶𝑱𝑨 𝑷𝑶𝑲𝑬́𝑴𝑶𝑵\n\nSeu saldo: ${u.pokecoins} PokéCoins\n\n`
        for (const [id, bola] of Object.entries(BOLAS)) {
          txt += `${bola.emoji} ${bola.nome}\n${bola.preco} PokéCoins | +${bola.bonus}%\n${p}pokebola ${id} <qtd>\n\n`
        }
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    pokecarteira: {
      aliases: ["carteira", "saldo", "pokecoins"],
      async executar({ sock, msg, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const num = soNumero(sender)
        const { u } = getTreinador(num)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝑪𝑨𝑹𝑻𝑬𝑰𝑹𝑨", "Seu saldo Pokémon.", `PokéCoins: ${u.pokecoins}\nVitórias: ${u.vitorias}\nDerrotas: ${u.derrotas}\nNível: ${u.nivel}`) }, { quoted: msg })
      }
    },

    pokemissao: {
      aliases: ["missaopokemon", "missaopkc"],
      async executar({ sock, msg, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const num = soNumero(sender)
        const { u } = getTreinador(num)
        const agora = Date.now()

        if (u.ultimaMissao && agora - u.ultimaMissao < 30 * 60 * 1000) {
          const falta = 30 * 60 * 1000 - (agora - u.ultimaMissao)
          const min = Math.floor(falta / 60000), seg = Math.floor((falta % 60000) / 1000)
          await reagir(sock, msg, "⏰")
          return sock.sendMessage(jid, { text: msgAviso("𝑴𝑰𝑺𝑺𝑨𝑶", "Aguarde para nova missão.", `${min}min ${seg}s`) }, { quoted: msg })
        }

        const missoes = [
          { nome: "Capture 3 Pokémon", xp: 30, coins: 100 },
          { nome: "Vença 1 PvP", xp: 50, coins: 150 },
          { nome: "Registre 1 Pokémon na Pokédex", xp: 20, coins: 80 },
          { nome: "Liberte 1 Pokémon", xp: 100, coins: 300 }
        ]
        const m = missoes[Math.floor(Math.random() * missoes.length)]

        const upou = darXpTreinador(u, m.xp)
        u.pokecoins += m.coins
        u.ultimaMissao = agora
        salvarTreinadorUser(num, u)

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝑴𝑰𝑺𝑺𝑨𝑶 𝑪𝑶𝑵𝑪𝑳𝑼𝑰́𝑫𝑨", m.nome, `+${m.xp} XP\n+${m.coins} PokéCoins${upou ? `\n⭐ Subiu para nível ${u.nivel}!` : ""}`) }, { quoted: msg })
      }
    },

    rankingpkc: {
      aliases: ["rankingpokemon", "toppokemon"],
      async executar({ sock, msg, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const t = dbLer("pokemon.json", { treinadores: {} })
        const treinadores = t.treinadores || {}
        const lista = Object.entries(treinadores).map(([num, u]) => ({ num, coins: u.pokecoins || 0, nivel: u.nivel || 1, vitorias: u.vitorias || 0 }))
        if (!lista.length) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgAviso("𝑹𝑨𝑵𝑲𝑰𝑵𝑮", "Ninguém jogou ainda.") }, { quoted: msg }) }
        lista.sort((a, b) => b.coins - a.coins)
        const top10 = lista.slice(0, 10)

        let txt = `𝑹𝑨𝑵𝑲𝑰𝑵𝑮 𝑷𝑶𝑲𝑬́𝑴𝑶𝑵\n\n`
        top10.forEach((t2, i) => {
          txt += `${i + 1}. @${t2.num} — ${t2.coins} PokéCoins | Nv ${t2.nivel} | ${t2.vitorias}🏆\n`
        })
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: txt, mentions: top10.map(t2 => t2.num + "@s.whatsapp.net") }, { quoted: msg })
      }
    },

    gerarkeypkc: {
      aliases: ["gerarkeypokemon", "criarkeypkc"],
      donoOnly: true,
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        if (!isDono && !isSubDono) { await reagir(sock, msg, "🚫"); return }
        const jid = msg.key.remoteJid
        const qtd = parseInt(args[0])
        if (!qtd || qtd <= 0) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgErro("𝑲𝑬𝒀 𝑷𝑲𝑪", "Quantidade inválida.", "Use `+gerarkeypkc <qtd>`") }, { quoted: msg }) }

        const dbKeys = dbLer("keyspkc.json", { keys: {} })
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        let novaKey = "PKC-"
        for (let i = 0; i < 8; i++) novaKey += chars.charAt(Math.floor(Math.random() * chars.length))

        dbKeys.keys[novaKey] = { pokecoins: qtd, usado: false, criadoPor: msg.key.participant || msg.key.remoteJid, criadoEm: Date.now() }
        dbSalvar("keyspkc.json", dbKeys)

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝑲𝑬𝒀 𝑷𝑲𝑪", "Nova key criada!", `Key: \`${novaKey}\`\nValor: ${qtd} PokéCoins\n\nUso único.`) }, { quoted: msg })
      }
    },

    keypkc: {
      aliases: ["resgatarpkc", "usarkeypkc"],
      async executar({ sock, msg, args, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const num = soNumero(sender)
        const keyInserida = (args[0] || "").toUpperCase().trim()
        if (!keyInserida) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgErro("𝑲𝑬𝒀 𝑷𝑲𝑪", "Key em falta.", "Use `+keypkc <key>`") }, { quoted: msg }) }

        const dbKeys = dbLer("keyspkc.json", { keys: {} })
        let keyReal = null
        for (const k in dbKeys.keys) { if (k.toUpperCase() === keyInserida) { keyReal = k; break } }
        if (!keyReal || !dbKeys.keys[keyReal]) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑲𝑬𝒀 𝑷𝑲𝑪", "Key inválida.") }, { quoted: msg }) }

        const dataKey = dbKeys.keys[keyReal]
        if (dataKey.usado) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑲𝑬𝒀 𝑷𝑲𝑪", "Key já resgatada.") }, { quoted: msg }) }

        const { u } = getTreinador(num)
        u.pokecoins += dataKey.pokecoins
        salvarTreinadorUser(num, u)
        dataKey.usado = true
        dataKey.usadoPor = num
        dataKey.usadoEm = Date.now()
        dbSalvar("keyspkc.json", dbKeys)

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝑲𝑬𝒀 𝑷𝑲𝑪", "Key resgatada!", `+${dataKey.pokecoins} PokéCoins\nSaldo: ${u.pokecoins}`), mentions: [`${num}@s.whatsapp.net`] }, { quoted: msg })
      }
    }

  }
}