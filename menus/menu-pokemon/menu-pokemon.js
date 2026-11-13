/* ============================================================
   🌸 MENU POKÉMON - TEMA FLORAL
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
  sock.sendMessage(jid, { text: msgErro("𝐏𝐎𝐊𝐄́𝐌𝐎𝐍 𝐎𝐅𝐅", "O sistema Pokémon está desativado.", "Peça a um admin para ativar.", `Use \`${p}pokemon on\``, nomeBot) }, { quoted: msg }).catch(() => {})
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

function getCargoETextoSimplificado({ sender, config, db, isDono, isSubDono, isAdmin, msg }) {
  const pushName = msg.pushName || "Treinador"
  let cargo = "👤 𝐓𝐑𝐄𝐈𝐍𝐀𝐃𝐎𝐑"
  if (isDono) cargo = "👑 𝐌𝐄𝐒𝐓𝐑𝐄"
  else if (isSubDono) cargo = "💠 𝐋𝐔𝐀"
  else if (isAdmin) cargo = "⚔️ 𝐂𝐎𝐌𝐀𝐍𝐃𝐀𝐍𝐓𝐄"
  return { pushName, cargo, nomeBot: nomeBotDb(db) }
}

module.exports = {
  menu: "menu-pokemon",
  grupoOnly: false,
  adminOnly: false,
  donoOnly: false,  async rendaAutomatica(sock, db) {
    const agora = Date.now()
    const cfg = getPokeCfg()
    const gruposAtivos = Object.keys(cfg.grupos || {}).filter(j => cfg.grupos[j]?.ativo === true)

    for (const jid of gruposAtivos) {
      const sel = getSelvagem(jid)
      if (sel && sel.expiraEm > agora) continue
      if (sel && sel.expiraEm <= agora) {
        delSelvagem(jid)
        try { await sock.sendMessage(jid, { text: msgAviso("𝐏𝐎𝐊𝐄́𝐌𝐎𝐍 𝐅𝐔𝐆𝐈𝐔", "Ninguém capturou a tempo.", "Aguarde o próximo (30min)", null, nomeBotDb(db)) }) } catch (_) {}
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
      const shinyTxt = shiny ? "\n✨✨✨ **SHINY!** ✨✨✨" : ""

      try {
        await sock.sendMessage(jid, {
          text: `${boxTop("𝐏𝐎𝐊𝐄́𝐌𝐎𝐍 𝐒𝐄𝐋𝐕𝐀𝐆𝐄𝐌")}

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 ${pokemon.emoji} ${pokemon.nome} 𓆪
↳ ${emojiRar} Raridade: ${raridade}
↳ 🎚️ Nível: ${nivel}
↳ ${TIPOS[pokemon.tipo]?.emoji || "❓"} Tipo: ${pokemon.tipo}
↳ ❤️ HP: ${pokemon.hpMax}${shinyTxt}
╰┈┈┈┈୨୧┈┈┈┈╯

╭┈┈┈┈୨୧┈┈┈┈╮
𓆩 𝐓𝐄𝐌𝐏𝐎 𓆪
↳ 3 minutos para capturar!
↳ \`+pokecapturar\`
╰┈┈┈┈୨୧┈┈┈┈╯

${boxFim(nomeBotDb(db), "Corre que ele foge!")}`
        })
      } catch (_) {}
    }
  },

  commands: {

    menupokemon: {
      aliases: ["pokemon", "menup", "comandospokemon"],
      async executar({ sock, msg, prefixoAtivo, db, sender, config, isDono, isSubDono, isAdmin, groupMetadata }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const cfg = getCfg(db)
        const num = soNumero(sender)
        const { u } = getTreinador(num)
        const { pushName, cargo, nomeBot } = getCargoETextoSimplificado({ sender, config, db, isDono, isSubDono, isAdmin, msg })
        await reagir(sock, msg, "🌸")

        const texto = `${boxTop("𝐏 𝐎 𝐊 𝐄́ 𝐌 𝐎 𝐍")}

┏━━━〔 𝐓𝐑𝐄𝐈𝐍𝐀𝐃𝐎𝐑 〕━━━┓
𖤐 Usuário » ${pushName}
𖤐 Nível » ${u.nivel}
𖤐 XP » ${u.xp}/${u.nivel * 100}
𖤐 PokéCoins » ${u.pokecoins}
𖤐 Vitórias » ${u.vitorias}
𖤐 Derrotas » ${u.derrotas}
┗━━━━━━━━━━━━━━━━━━┛

${secao("𝐂𝐀𝐏𝐓𝐔𝐑𝐀")}
${item(`${p}pokecapturar`)}
${item(`${p}pokebola <tipo> <qtd>`)}
${item(`${p}pokebolas`)}
${fimSecao()}

${secao("𝐌𝐄𝐔 𝐓𝐈𝐌𝐄")}
${item(`${p}poketime`)}
${item(`${p}pokebox`)}
${item(`${p}pokedex`)}
${item(`${p}pokever <nome>`)}
${item(`${p}pokemover <slot>`)}
${item(`${p}pokearmazenar <nome>`)}
${item(`${p}pokelibertar <nome>`)}
${fimSecao()}

${secao("𝐏𝐯𝐏")}
${item(`${p}pvppoke`)}
${item(`${p}entrarpvp`)}
${item(`${p}escolherpkm <nº>`)}
${item(`${p}recusar`)}
${fimSecao()}

${secao("𝐋𝐎𝐉𝐀 & 𝐂𝐀𝐑𝐓𝐄𝐈𝐑𝐀")}
${item(`${p}pokeloja`)}
${item(`${p}pokecarteira`)}
${item(`${p}pokemissao`)}
${item(`${p}rankingpkc`)}
${fimSecao()}

${secao("𝐀𝐃𝐌𝐈𝐍")}
${item(`${p}pokemon on/off`)}
${item(`${p}gerarkeypkc <qtd>`)}
${item(`${p}keypkc <key>`)}
${fimSecao()}

╔═══ஓ๑♡๑ஓ═══╗
𓆩 𝐏𝐑𝐄𝐅𝐈𝐗𝐎 𓆪
↳ \`${p}\`
╚═══ஓ๑♡๑ஓ═══╝

${boxFim(nomeBot, "Gotta catch 'em all!")}`

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
      async executar({ sock, msg, args, db, prefixoAtivo, isDono, isSubDono, isAdmin }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const nomeBot = nomeBotDb(db)
        const op = (args[0] || "").toLowerCase()

        if (!isDono && !isSubDono && !isAdmin) {
          await reagir(sock, msg, "💨")
          return sock.sendMessage(jid, { text: msgErro("𝐀𝐕𝐈𝐒𝐎", "Apenas admins podem ativar.", `Use \`${p}menuadm\``, null, nomeBot) }, { quoted: msg })
        }

        const cfg = getPokeCfg()
        cfg.grupos[jid] = cfg.grupos[jid] || {}

        if (!["on", "off"].includes(op)) {
          const s = cfg.grupos[jid].ativo ? "ON ✅" : "OFF ❌"
          await reagir(sock, msg, "🌸")
          return sock.sendMessage(jid, { text: msgAviso("𝐏𝐎𝐊𝐄́𝐌𝐎𝐍", `Sistema atualmente: ${s}`, `Use \`${p}pokemon on\` ou \`${p}pokemon off\``, null, nomeBot) }, { quoted: msg })
        }

        cfg.grupos[jid].ativo = op === "on"
        salvarPokeCfg(cfg)

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐎𝐊𝐄́𝐌𝐎𝐍", `Sistema ${op.toUpperCase()}`, op === "on" ? "Os comandos voltaram!" : "O modo Pokémon está desativado.", null, nomeBot) }, { quoted: msg })
      }
    },

    pokebola: {
      aliases: ["buybola", "comprarbola"],
      async executar({ sock, msg, args, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const num = soNumero(sender)
        const { u } = getTreinador(num)
        const tipo = (args[0] || "").toLowerCase()
        const qtd = parseInt(args[1]) || 1

        if (!BOLAS[tipo]) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐏𝐎𝐊𝐄𝐁𝐎𝐋𝐀", "Tipo inválido.", `Use: \`${p}pokebola pokebola 10\`\nTipos: pokebola, greatball, ultraball, masterball`, null, nomeBot) }, { quoted: msg }) }
        if (qtd < 1 || qtd > 50) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐏𝐎𝐊𝐄𝐁𝐎𝐋𝐀", "Qtd inválida.", "1 a 50", null, nomeBot) }, { quoted: msg }) }

        const bola = BOLAS[tipo]
        const total = bola.preco * qtd
        if (u.pokecoins < total) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐏𝐎𝐊𝐄𝐁𝐎𝐋𝐀", "PokéCoins insuficiente.", `Faltam ${total - u.pokecoins}`, null, nomeBot) }, { quoted: msg }) }

        u.pokecoins -= total
        u.pokebolas[tipo] = (u.pokebolas[tipo] || 0) + qtd
        salvarTreinadorUser(num, u)

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐎𝐊𝐄𝐁𝐎𝐋𝐀", "Comprada!", `${bola.emoji} ${bola.nome} x${qtd}\nPago: -${total} PokéCoins`, null, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    pokebolas: {
      aliases: ["minhasbolas", "bolas"],
      async executar({ sock, msg, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const nomeBot = nomeBotDb(db)
        const num = soNumero(sender)
        const { u } = getTreinador(num)
        await reagir(sock, msg, "🌸")

        let txt = `${boxTop("𝐒𝐔𝐀𝐒 𝐏𝐎𝐊𝐄𝐁𝐎𝐋𝐀𝐒")}\n\n`
        for (const [id, bola] of Object.entries(BOLAS)) {
          txt += `╭┈┈┈┈୨୧┈┈┈┈╮\n𓆩 ${bola.emoji} ${bola.nome} 𓆪\n↳ Quantidade: ${u.pokebolas[id] || 0}\n╰┈┈┈┈୨୧┈┈┈┈╯\n`
        }
        txt += `\n${boxFim(nomeBot, "Boa sorte na captura!")}`
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    pokecapturar: {
      aliases: ["capturar", "catch"],
      async executar({ sock, msg, db, sender, args, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const num = soNumero(sender)
        const { u } = getTreinador(num)

        const sel = getSelvagem(jid)
        if (!sel) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐂𝐀𝐏𝐓𝐔𝐑𝐀𝐑", "Nenhum Pokémon selvagem.", "Aguarde um aparecer no grupo.", null, nomeBot) }, { quoted: msg }) }
        if (sel.expiraEm <= Date.now()) { delSelvagem(jid); await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐂𝐀𝐏𝐓𝐔𝐑𝐀𝐑", "O Pokémon fugiu.", "Aguarde o próximo.", null, nomeBot) }, { quoted: msg }) }

        const tipoBola = (args[0] || "pokebola").toLowerCase()
        if (!BOLAS[tipoBola]) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐂𝐀𝐏𝐓𝐔𝐑𝐀𝐑", "Bola inválida.", `Use: \`${p}pokecapturar pokebola\``, null, nomeBot) }, { quoted: msg }) }
        if ((u.pokebolas[tipoBola] || 0) < 1) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐂𝐀𝐏𝐓𝐔𝐑𝐀𝐑", "Sem essa bola.", `Compre com \`${p}pokebola ${tipoBola} 10\``, null, nomeBot) }, { quoted: msg }) }

        u.pokebolas[tipoBola] -= 1

        const chance = calcularChanceCaptura(sel.pokemon, u, tipoBola)
        const sorteio = Math.random() * 100
        const pegou = sorteio < chance

        await reagir(sock, msg, "🌸")

        if (!pegou) {
          salvarTreinadorUser(num, u)
          await sock.sendMessage(jid, { text: msgErro("𝐅𝐔𝐆𝐈𝐔", "O Pokémon escapou!", `${sel.pokemon.emoji} ${sel.pokemon.nome}\nChance era: ${chance.toFixed(1)}%\nTente com uma bola melhor.`, null, nomeBot) }, { quoted: msg })
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
        const shinyTxt = sel.pokemon.shiny ? "\n✨✨✨ **SHINY!** ✨✨✨" : ""

        await sock.sendMessage(jid, { text: msgSucesso("𝐂𝐀𝐏𝐓𝐔𝐑𝐀𝐃𝐎!", `Você capturou ${sel.pokemon.emoji} ${sel.pokemon.nome}!`, `Raridade: ${sel.pokemon.raridade}\nNível: ${sel.pokemon.nivel}\nTipo: ${sel.pokemon.tipo}\nHP: ${sel.pokemon.hpMax}${shinyTxt}\n\nDestino: ${destino}`, `+20 XP${upou ? `\n⭐ Subiu para nível ${u.nivel}!` : ""}`, nomeBot), mentions: [sender] }, { quoted: msg })
      }
    },

    poketime: {
      aliases: ["meutime", "time"],
      async executar({ sock, msg, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const num = soNumero(sender)
        const { u } = getTreinador(num)
        if (!u.time.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐓𝐈𝐌𝐄", "Seu time está vazio.", `Capture com \`${p}pokecapturar\``, null, nomeBot) }, { quoted: msg }) }

        await reagir(sock, msg, "🌸")
        let txt = `${boxTop(`𝐓𝐈𝐌𝐄 (${u.time.length}/6)`)}\n\n`
        u.time.forEach((pkm, i) => {
          const emojiRar = { Comum: "🟢", Incomum: "🔵", Raro: "🟣", Épico: "🟡", Lendário: "🔴", Mítico: "💀" }[pkm.raridade]
          const shiny = pkm.shiny ? " ✨" : ""
          txt += `╭┈┈┈┈୨୧┈┈┈┈╮\n𓆩 #${i + 1} ${pkm.emoji} ${pkm.nome}${shiny} 𓆪\n↳ ${emojiRar} ${pkm.raridade}\n↳ 🎚️ Nível: ${pkm.nivel}\n↳ ${TIPOS[pkm.tipo]?.emoji || "❓"} ${pkm.tipo}\n↳ ❤️ ${pkm.hp}/${pkm.hpMax}\n╰┈┈┈┈୨୧┈┈┈┈╯\n`
        })
        txt += `\n${boxFim(nomeBot, "Pronto pra batalha!")}`
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    pokebox: {
      aliases: ["box", "pc"],
      async executar({ sock, msg, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const num = soNumero(sender)
        const { u } = getTreinador(num)
        if (!u.box.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐁𝐎𝐗", "Seu box está vazio.", `Capture mais com \`${p}pokecapturar\``, null, nomeBot) }, { quoted: msg }) }

        await reagir(sock, msg, "🌸")
        let txt = `${boxTop(`𝐁𝐎𝐗 (${u.box.length})`)}\n\n`
        u.box.slice(0, 20).forEach((pkm, i) => {
          const shiny = pkm.shiny ? " ✨" : ""
          txt += `#${i + 1}. ${pkm.emoji} ${pkm.nome}${shiny} — Nv ${pkm.nivel}\n`
        })
        if (u.box.length > 20) txt += `\n... e mais ${u.box.length - 20} Pokémon`
        txt += `\n${boxFim(nomeBot)}`
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    pokedex: {
      aliases: ["dex", "pokédex"],
      async executar({ sock, msg, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const nomeBot = nomeBotDb(db)
        const num = soNumero(sender)
        const { u } = getTreinador(num)
        await reagir(sock, msg, "🌸")

        let txt = `${boxTop("𝐏𝐎𝐊𝐄́𝐃𝐄𝐗")}\n\n`
        txt += `╭┈┈┈┈୨୧┈┈┈┈╮\n𓆩 𝐓𝐎𝐓𝐀𝐋 𓆪\n↳ ${u.pokedex.length} / ${POKEMONS.length}\n╰┈┈┈┈୨୧┈┈┈┈╯\n\n`
        for (const raridade of RARIDADES) {
          const total = POKEMONS.filter(x => x.raridade === raridade).length
          const capturados = u.pokedex.filter(id => POKEMONS.find(x => x.id === id && x.raridade === raridade)).length
          txt += `↳ ${raridade}: ${capturados}/${total}\n`
        }
        txt += `\n${boxFim(nomeBot)}`
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    pokever: {
      aliases: ["verpokemon", "info"],
      async executar({ sock, msg, args, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const nomeBot = nomeBotDb(db)
        const num = soNumero(sender)
        const { u } = getTreinador(num)
        const busca = normalizar(args.join(" "))
        if (!busca) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐕𝐄𝐑", "Informe o nome.", "Use `+pokever pikachu`", null, nomeBot) }, { quoted: msg }) }

        const pkm = u.time.find(p2 => normalizar(p2.nome) === busca || p2.id === busca) || u.box.find(p2 => normalizar(p2.nome) === busca || p2.id === busca)
        if (!pkm) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐕𝐄𝐑", "Você não tem esse Pokémon.", busca, null, nomeBot) }, { quoted: msg }) }

        await reagir(sock, msg, "🌸")
        const emojiRar = { Comum: "🟢", Incomum: "🔵", Raro: "🟣", Épico: "🟡", Lendário: "🔴", Mítico: "💀" }[pkm.raridade]
        const shiny = pkm.shiny ? " ✨" : ""
        await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐎𝐊𝐄́𝐌𝐎𝐍", `${pkm.emoji} ${pkm.nome}${shiny}`, `${emojiRar} ${pkm.raridade}\n🎚️ Nível: ${pkm.nivel}\n${TIPOS[pkm.tipo]?.emoji || "❓"} ${pkm.tipo}\n\n❤️ HP: ${pkm.hp}/${pkm.hpMax}\n⚔️ ATK: ${pkm.atk}\n🛡️ DEF: ${pkm.def}\n💨 SPD: ${pkm.spd}`, null, nomeBot) }, { quoted: msg })
      }
    },

    pokemover: {
      aliases: ["mover", "pormtime"],
      async executar({ sock, msg, args, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const nomeBot = nomeBotDb(db)
        const num = soNumero(sender)
        const { u } = getTreinador(num)
        const idx = parseInt(args[0]) - 1
        if (isNaN(idx) || idx < 0 || idx >= u.box.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐌𝐎𝐕𝐄𝐑", "Índice inválido.", "Use `+pokemover <nº>`", null, nomeBot) }, { quoted: msg }) }
        if (u.time.length >= 6) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐌𝐎𝐕𝐄𝐑", "Time cheio.", "Armazene um primeiro.", null, nomeBot) }, { quoted: msg }) }
        const pkm = u.box.splice(idx, 1)[0]
        u.time.push(pkm)
        salvarTreinadorUser(num, u)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐌𝐎𝐕𝐈𝐃𝐎", "Pokémon no time!", `${pkm.emoji} ${pkm.nome}`, null, nomeBot) }, { quoted: msg })
      }
    },

    pokearmazenar: {
      aliases: ["armazenar", "guardar"],
      async executar({ sock, msg, args, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const nomeBot = nomeBotDb(db)
        const num = soNumero(sender)
        const { u } = getTreinador(num)
        const busca = normalizar(args.join(" "))
        if (!busca) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐀𝐑𝐌𝐀𝐙𝐄𝐍𝐀𝐑", "Informe o nome.", "Use `+pokearmazenar pikachu`", null, nomeBot) }, { quoted: msg }) }
        const idx = u.time.findIndex(p2 => normalizar(p2.nome) === busca || p2.id === busca)
        if (idx === -1) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐀𝐑𝐌𝐀𝐙𝐄𝐍𝐀𝐑", "Não está no time.", busca, null, nomeBot) }, { quoted: msg }) }
        if (u.time.length <= 1) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐀𝐑𝐌𝐀𝐙𝐄𝐍𝐀𝐑", "Precisa ter ao menos 1 no time.", "—", null, nomeBot) }, { quoted: msg }) }
        const pkm = u.time.splice(idx, 1)[0]
        u.box.push(pkm)
        salvarTreinadorUser(num, u)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐑𝐌𝐀𝐙𝐄𝐍𝐀𝐃𝐎", "Pokémon no box!", `${pkm.emoji} ${pkm.nome}`, null, nomeBot) }, { quoted: msg })
      }
    },

    pokelibertar: {
      aliases: ["liberar", "soltar"],
      async executar({ sock, msg, args, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const nomeBot = nomeBotDb(db)
        const num = soNumero(sender)
        const { u } = getTreinador(num)
        const busca = normalizar(args.join(" "))
        if (!busca) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐋𝐈𝐁𝐄𝐑𝐓𝐀𝐑", "Informe o nome.", "Use `+pokelibertar pikachu`", null, nomeBot) }, { quoted: msg }) }
        const idx = u.box.findIndex(p2 => normalizar(p2.nome) === busca || p2.id === busca)
        if (idx === -1) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐋𝐈𝐁𝐄𝐑𝐓𝐀𝐑", "Não está no box.", busca, null, nomeBot) }, { quoted: msg }) }
        const pkm = u.box.splice(idx, 1)[0]
        const upou = darXpTreinador(u, 10)
        u.pokecoins += 50
        salvarTreinadorUser(num, u)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐋𝐈𝐁𝐄𝐑𝐓𝐀𝐃𝐎", "Pokémon voltou à natureza.", `${pkm.emoji} ${pkm.nome}\n+10 XP\n+50 PokéCoins${upou ? `\n⭐ Subiu de nível!` : ""}`, null, nomeBot) }, { quoted: msg })
      }
    },    pvppoke: {
      aliases: ["pvppokemon", "lobbypoke", "lobby"],
      async executar({ sock, msg, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const num = soNumero(sender)

        const { u } = getTreinador(num)
        if (!u.time.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐏𝐯𝐏", "Você não tem Pokémon.", `Capture com \`${p}pokecapturar\``, null, nomeBot) }, { quoted: msg }) }

        const lobbyAtual = getLobby(jid)
        if (lobbyAtual) {
          if (lobbyAtual.jogador1 === num) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐎𝐁𝐁𝐘", "Você já tem um lobby aberto.", "Aguarde alguém entrar.", null, nomeBot) }, { quoted: msg }) }
          await reagir(sock, msg, "💨")
          return sock.sendMessage(jid, { text: msgErro("𝐋𝐎𝐁𝐁𝐘", "Já tem um lobby aberto neste grupo.", "Aguarde ele fechar.", null, nomeBot) }, { quoted: msg })
        }

        setLobby(jid, { jogador1: num, jogador2: null, estado: "esperando", criadoEm: Date.now(), escolha1: null, escolha2: null, pokemon1: null, pokemon2: null })

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, {
          text: `${boxTop("𝐋𝐎𝐁𝐁𝐘 𝐏𝐯𝐏")}

╭┈┈┈┈୨┈┈┈┈╮
𓆩 𝐉𝐎𝐆𝐀𝐃𝐎𝐑 𝟏 𓆪
↳ @${num}
↳ ${u.time.length} Pokémon no time
╰┈┈┈┈୨┈┈┈┈╯

╭┈┈┈┈୨┈┈┈┈╮
𓆩 𝐀𝐆𝐔𝐀𝐑𝐃𝐀𝐍𝐃𝐎 𓆪
↳ Aguardando oponente...
↳ \`${p}entrarpvp\` para entrar
╰┈┈┈┈୨┈┈┈┈╯

${boxFim(nomeBot, "Entre quem tiver coragem!")}`,
          mentions: [`${num}@s.whatsapp.net`]
        }, { quoted: msg })
      }
    },

    entrarpvp: {
      aliases: ["entrar", "joinpvp"],
      async executar({ sock, msg, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const num = soNumero(sender)

        const lobby = getLobby(jid)
        if (!lobby) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐋𝐎𝐁𝐁𝐘", "Nenhum lobby aberto.", `Use \`${p}pvppoke\` pra abrir um.`, null, nomeBot) }, { quoted: msg }) }
        if (lobby.jogador1 === num) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐋𝐎𝐁𝐁𝐘", "Você é o jogador 1.", "Aguarde alguém entrar.", null, nomeBot) }, { quoted: msg }) }
        if (lobby.jogador2) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐋𝐎𝐁𝐁𝐘", "Lobby já está cheio.", "Aguarde o próximo.", null, nomeBot) }, { quoted: msg }) }

        const { u: u2 } = getTreinador(num)
        if (!u2.time.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐏𝐯𝐏", "Você não tem Pokémon.", `Capture com \`${p}pokecapturar\``, null, nomeBot) }, { quoted: msg }) }

        lobby.jogador2 = num
        lobby.estado = "escolhendo"
        setLobby(jid, lobby)

        const { u: u1 } = getTreinador(lobby.jogador1)

        let txt = `${boxTop("𝐁𝐀𝐓𝐀𝐋𝐇𝐀 𝐏𝐯𝐏")}

╭┈┈┈┈୨┈┈┈┈╮
𓆩 @${lobby.jogador1} 𓆪
`
        u1.time.forEach((pk, i) => { txt += `↳ #${i + 1} ${pk.emoji} ${pk.nome} (Nv ${pk.nivel}) — ${pk.tipo}\n` })
        txt += `╰┈┈┈┈୨┈┈┈┈╯\n\n`

        txt += `╭┈┈┈┈୨┈┈┈┈╮
𓆩 @${num} 𓆪
`
        u2.time.forEach((pk, i) => { txt += `↳ #${i + 1} ${pk.emoji} ${pk.nome} (Nv ${pk.nivel}) — ${pk.tipo}\n` })
        txt += `╰┈┈┈┈୨┈┈┈┈╯\n\n`

        txt += `╭┈┈┈┈୨┈┈┈┈╮
𓆩 𝐄𝐒𝐂𝐎𝐋𝐇𝐀𝐌 𓆪
↳ @${lobby.jogador1}: \`${p}escolherpkm <nº>\`
↳ @${num}: \`${p}escolherpkm <nº>\`
╰┈┈┈┈୨┈┈┈┈╯

${boxFim(nomeBot, "Escolham seus campeões!")}`

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: txt, mentions: [`${lobby.jogador1}@s.whatsapp.net`, `${num}@s.whatsapp.net`] }, { quoted: msg })
      }
    },

    recusar: {
      aliases: ["recusardesafio", "cancelarpvp"],
      async executar({ sock, msg, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const nomeBot = nomeBotDb(db)
        const num = soNumero(sender)
        const lobby = getLobby(jid)
        if (!lobby) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐑𝐄𝐂𝐔𝐒𝐀𝐑", "Nenhum lobby aberto.", "—", null, nomeBot) }, { quoted: msg }) }
        if (lobby.jogador1 !== num && lobby.jogador2 !== num) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐑𝐄𝐂𝐔𝐒𝐀𝐑", "Você não está nesse lobby.", "—", null, nomeBot) }, { quoted: msg }) }
        delLobby(jid)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐑𝐄𝐂𝐔𝐒𝐀𝐃𝐎", "Lobby cancelado.", `@${num} cancelou.`, null, nomeBot), mentions: [`${num}@s.whatsapp.net`] }, { quoted: msg })
      }
    },

    escolherpkm: {
      aliases: ["escolher", "pickpkm"],
      async executar({ sock, msg, args, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const nomeBot = nomeBotDb(db)
        const p = prefixoAtivo || "+"
        const num = soNumero(sender)

        const lobby = getLobby(jid)
        if (!lobby) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐄𝐒𝐂𝐎𝐋𝐇𝐄𝐑", "Nenhuma batalha ativa.", `Use \`${p}pvppoke\``, null, nomeBot) }, { quoted: msg }) }
        if (lobby.estado !== "escolhendo") { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐄𝐒𝐂𝐎𝐋𝐇𝐄𝐑", "Batalha não está na fase de escolha.", "—", null, nomeBot) }, { quoted: msg }) }
        if (num !== lobby.jogador1 && num !== lobby.jogador2) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐄𝐒𝐂𝐎𝐋𝐇𝐄𝐑", "Você não está nessa batalha.", "—", null, nomeBot) }, { quoted: msg }) }

        const idx = parseInt(args[0]) - 1
        if (isNaN(idx) || idx < 0) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐄𝐒𝐂𝐎𝐋𝐇𝐄𝐑", "Índice inválido.", `Use \`${p}escolherpkm 1\``, null, nomeBot) }, { quoted: msg }) }

        const { u } = getTreinador(num)
        if (idx >= u.time.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐄𝐒𝐂𝐎𝐋𝐇𝐄𝐑", "Pokémon não existe.", "—", null, nomeBot) }, { quoted: msg }) }
        const pkm = u.time[idx]

        if (num === lobby.jogador1) {
          if (lobby.escolha1 !== null) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐄𝐒𝐂𝐎𝐋𝐇𝐄𝐑", "Você já escolheu.", `${lobby.pokemon1?.emoji} ${lobby.pokemon1?.nome}`, null, nomeBot) }, { quoted: msg }) }
          lobby.escolha1 = idx; lobby.pokemon1 = pkm
        } else {
          if (lobby.escolha2 !== null) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐄𝐒𝐂𝐎𝐋𝐇𝐄𝐑", "Você já escolheu.", `${lobby.pokemon2?.emoji} ${lobby.pokemon2?.nome}`, null, nomeBot) }, { quoted: msg }) }
          lobby.escolha2 = idx; lobby.pokemon2 = pkm
        }
        setLobby(jid, lobby)

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐄𝐒𝐂𝐎𝐋𝐇𝐈𝐃𝐎", "Pokémon pronto!", `${pkm.emoji} ${pkm.nome} (Nv ${pkm.nivel})`, null, nomeBot) }, { quoted: msg })

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

          const resultadoTxt = `${boxTop("𝐁𝐀𝐓𝐀𝐋𝐇𝐀 𝐏𝐯𝐏")}

╭┈┈┈┈୨┈┈┈┈╮
𓆩 ${p1.emoji} ${p1.nome} 𓆪
↳ Dano: ${dano1}
↳ HP: ${p1.hp} → ${Math.max(0, hp1Restante)}
╰┈┈┈┈୨┈┈┈┈╯

╭┈┈┈┈୨┈┈┈┈╮
𓆩 ${p2.emoji} ${p2.nome} 𓆪
↳ Dano: ${dano2}
↳ HP: ${p2.hp} → ${Math.max(0, hp2Restante)}
╰┈┈┈┈୨┈┈┈┈╯

╭┈┈┈┈୨┈┈┈┈╮
𓆩 𝐕𝐄𝐍𝐂𝐄𝐃𝐎𝐑 𓆪
↳ ${vencedor === "empate" ? "🤝 Empate!" : `🏆 @${vencedor}`}
╰┈┈┈┈୨┈┈┈┈╯

╭┈┈┈┈୨┈┈┈┈╮
𓆩 𝐑𝐄𝐂𝐎𝐌𝐏𝐄𝐍𝐒𝐀 𓆪
↳ ${recompensaTxt}
╰┈┈┈┈୨┈┈┈┈╯

${boxFim(nomeBot, "GG!")}`

          await sock.sendMessage(jid, { text: resultadoTxt, mentions: [`${lobby.jogador1}@s.whatsapp.net`, `${lobby.jogador2}@s.whatsapp.net`] }, { quoted: msg })
        }
      }
    },

    pokeloja: {
      aliases: ["lojapokemon", "shoppokemon"],
      async executar({ sock, msg, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const nomeBot = nomeBotDb(db)
        const num = soNumero(sender)
        const { u } = getTreinador(num)
        await reagir(sock, msg, "🌸")

        let txt = `${boxTop("𝐋𝐎𝐉𝐀 𝐏𝐎𝐊𝐄́𝐌𝐎𝐍")}

╭┈┈┈┈୨┈┈┈┈╮
𓆩 𝐒𝐄𝐔 𝐒𝐀𝐋𝐃𝐎 𓆪
↳ ${u.pokecoins} PokéCoins
╰┈┈┈┈୨┈┈┈┈╯
`
        for (const [id, bola] of Object.entries(BOLAS)) {
          txt += `\n╭┈┈┈┈୨┈┈┈┈╮\n𓆩 ${bola.emoji} ${bola.nome} 𓆪\n↳ 💰 ${bola.preco} PokéCoins\n↳ 🎯 Bônus: +${bola.bonus}%\n↳ 🛒 \`+pokebola ${id} <qtd>\`\n╰┈┈┈┈୨┈┈┈┈╯`
        }
        txt += `\n\n${boxFim(nomeBot, "Compre e capture!")}`
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    pokecarteira: {
      aliases: ["carteira", "saldo", "pokecoins"],
      async executar({ sock, msg, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const nomeBot = nomeBotDb(db)
        const num = soNumero(sender)
        const { u } = getTreinador(num)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐂𝐀𝐑𝐓𝐄𝐈𝐑𝐀", "Seu saldo Pokémon.", `💎 PokéCoins: *${u.pokecoins}*\n🏆 Vitórias: ${u.vitorias}\n💀 Derrotas: ${u.derrotas}\n🎚️ Nível: ${u.nivel}`, null, nomeBot) }, { quoted: msg })
      }
    },

    pokemissao: {
      aliases: ["missaopokemon", "missaopkc"],
      async executar({ sock, msg, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const nomeBot = nomeBotDb(db)
        const num = soNumero(sender)
        const { u } = getTreinador(num)
        const agora = Date.now()

        if (u.ultimaMissao && agora - u.ultimaMissao < 30 * 60 * 1000) {
          const falta = 30 * 60 * 1000 - (agora - u.ultimaMissao)
          const min = Math.floor(falta / 60000), seg = Math.floor((falta % 60000) / 1000)
          await reagir(sock, msg, "⏰")
          return sock.sendMessage(jid, { text: msgAviso("𝐌𝐈𝐒𝐒𝐀̃𝐎", "Aguarde para nova missão.", `${min}min ${seg}s`, null, nomeBot) }, { quoted: msg })
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
        await sock.sendMessage(jid, { text: msgSucesso("𝐌𝐈𝐒𝐒𝐀̃𝐎 𝐂𝐎𝐍𝐂𝐋𝐔𝐈́𝐃𝐀", m.nome, `+${m.xp} XP\n+${m.coins} PokéCoins${upou ? `\n⭐ Subiu para nível ${u.nivel}!` : ""}`, null, nomeBot) }, { quoted: msg })
      }
    },

    rankingpkc: {
      aliases: ["rankingpokemon", "toppokemon"],
      async executar({ sock, msg, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const nomeBot = nomeBotDb(db)
        const t = dbLer("pokemon.json", { treinadores: {} })
        const treinadores = t.treinadores || {}
        const lista = Object.entries(treinadores).map(([num, u]) => ({ num, coins: u.pokecoins || 0, nivel: u.nivel || 1, vitorias: u.vitorias || 0 }))
        if (!lista.length) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐀𝐍𝐊𝐈𝐍𝐆", "Ninguém jogou ainda.", "—", null, nomeBot) }, { quoted: msg }) }
        lista.sort((a, b) => b.coins - a.coins)
        const top10 = lista.slice(0, 10)

        let txt = `${boxTop("𝐑𝐀𝐍𝐊𝐈𝐍𝐆 𝐏𝐎𝐊𝐄́𝐌𝐎𝐍")}\n\n`
        top10.forEach((t2, i) => {
          const medalha = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🌸"
          txt += `╭┈┈┈┈୨┈┈┈┈╮\n𓆩 ${medalha} #${i + 1} 𓆪\n↳ @${t2.num}\n↳ 💎 ${t2.coins} PokéCoins\n↳ 🏆 ${t2.vitorias} vitórias\n↳ 🎚️ Nível ${t2.nivel}\n╰┈┈┈┈୨┈┈┈┈╯\n`
        })
        txt += `\n${boxFim(nomeBot, "TOP 10 PokéCoins.")}`
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: txt, mentions: top10.map(t2 => t2.num + "@s.whatsapp.net") }, { quoted: msg })
      }
    },

    gerarkeypkc: {
      aliases: ["gerarkeypokemon", "criarkeypkc"],
      donoOnly: true,
      async executar({ sock, msg, args, db, isDono, isSubDono, prefixoAtivo }) {
        if (!isDono && !isSubDono) { await reagir(sock, msg, "💨"); return }
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const qtd = parseInt(args[0])
        if (!qtd || qtd <= 0) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐊𝐄𝐘 𝐏𝐊𝐂", "Quantidade inválida.", "Use `+gerarkeypkc <qtd>`", null, nomeBot) }, { quoted: msg }) }

        const dbKeys = dbLer("keyspkc.json", { keys: {} })
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        let novaKey = "PKC-"
        for (let i = 0; i < 8; i++) novaKey += chars.charAt(Math.floor(Math.random() * chars.length))

        dbKeys.keys[novaKey] = { pokecoins: qtd, usado: false, criadoPor: msg.key.participant || msg.key.remoteJid, criadoEm: Date.now() }
        dbSalvar("keyspkc.json", dbKeys)

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐊𝐄𝐘 𝐏𝐊𝐂", "Nova key criada!", `Key: \`${novaKey}\`\nValor: *${qtd} PokéCoins*\n\nUso único.`, `Entregue com \`+keypkc ${novaKey}\``, nomeBot) }, { quoted: msg })
      }
    },

    keypkc: {
      aliases: ["resgatarpkc", "usarkeypkc"],
      async executar({ sock, msg, args, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (bloquearSeOff(sock, msg, db, prefixoAtivo)) return
        const nomeBot = nomeBotDb(db)
        const num = soNumero(sender)
        const keyInserida = (args[0] || "").toUpperCase().trim()
        if (!keyInserida) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐊𝐄𝐘 𝐏𝐊𝐂", "Key em falta.", "Use `+keypkc <key>`", null, nomeBot) }, { quoted: msg }) }

        const dbKeys = dbLer("keyspkc.json", { keys: {} })
        let keyReal = null
        for (const k in dbKeys.keys) { if (k.toUpperCase() === keyInserida) { keyReal = k; break } }
        if (!keyReal || !dbKeys.keys[keyReal]) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐊𝐄𝐘 𝐏𝐊𝐂", "Key inválida.", "—", null, nomeBot) }, { quoted: msg }) }

        const dataKey = dbKeys.keys[keyReal]
        if (dataKey.usado) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐊𝐄𝐘 𝐏𝐊𝐂", "Key já resgatada.", "—", null, nomeBot) }, { quoted: msg }) }

        const { u } = getTreinador(num)
        u.pokecoins += dataKey.pokecoins
        salvarTreinadorUser(num, u)
        dataKey.usado = true
        dataKey.usadoPor = num
        dataKey.usadoEm = Date.now()
        dbSalvar("keyspkc.json", dbKeys)

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝐊𝐄𝐘 𝐏𝐊𝐂", "Key resgatada!", `+${dataKey.pokecoins} PokéCoins\nSaldo: ${u.pokecoins}`, null, nomeBot), mentions: [`${num}@s.whatsapp.net`] }, { quoted: msg })
      }
    }

  }
}