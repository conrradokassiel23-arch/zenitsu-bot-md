/* ============================================================
   ⚡ MENU RPG - ZENITSU BOT MD
   ============================================================ */

const fs = require("fs")
const path = require("path")

const DATA_DIR = path.join(__dirname, "..", "..", "data")

function dbLer(arquivo, padrao = {}) {
  const p = path.join(DATA_DIR, arquivo)
  if (!fs.existsSync(p)) {
    fs.writeFileSync(p, JSON.stringify(padrao, null, 2))
    return padrao
  }
  try { return JSON.parse(fs.readFileSync(p, "utf8")) } catch { return padrao }
}

function dbSalvar(arquivo, dados) {
  fs.writeFileSync(path.join(DATA_DIR, arquivo), JSON.stringify(dados, null, 2))
}

function normalizar(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()
}

function fmt(v) {
  if (typeof v !== "number" || isNaN(v) || !isFinite(v)) return "0"
  if (v > 999999999999) v = 999999999999
  if (v < 0) v = 0
  return Math.floor(v).toLocaleString("pt-BR")
}

function soNumero(jid) {
  if (!jid) return ""
  if (typeof jid === "object") jid = jid.phoneNumber || jid.id || ""
  return String(jid).split("@")[0].split(":")[0].replace(/\D/g, "")
}

function mJid(numeroOuJid) {
  const n = soNumero(numeroOuJid)
  if (!n) return null
  if (n.length >= 10 && n.length <= 15) return n + "@s.whatsapp.net"
  return String(numeroOuJid)
}

function formatarTempo(ms) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (d > 0) return d + "d " + (h % 24) + "h"
  if (h > 0) return h + "h " + (m % 60) + "min"
  if (m > 0) return m + "min " + (s % 60) + "s"
  return s + "s"
}

function sanearNum(v, max = 999999999999) {
  if (typeof v !== "number" || isNaN(v) || !isFinite(v)) return 0
  if (v < 0) return 0
  if (v > max) return max
  return Math.floor(v)
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
      if (p) {
        if (p.phoneNumber) {
          const rn = soNumero(p.phoneNumber)
          lidCache.set(chaveCache, rn)
          return rn
        }
        if (p.id && !String(p.id).endsWith("@lid")) {
          const rn = soNumero(p.id)
          lidCache.set(chaveCache, rn)
          return rn
        }
      }
    } catch (_) {}
    return soNumero(s)
  }

  return soNumero(s)
}

async function coletarMembros(sock, jidGrupo) {
  const numeros = new Set()
  try {
    const meta = await sock.groupMetadata(jidGrupo)
    for (const p of meta.participants) {
      if (p.phoneNumber) {
        const n = soNumero(p.phoneNumber)
        if (n && n.length >= 10 && n.length <= 15) numeros.add(n)
      }
    }
  } catch (_) {}
  return { numeros }
}

const PETS = [
  { id: "raposa", nome: "Raposa", emoji: "🦊", preco: 700, vip: false, buff: "15% de roubar alguém aleatório a cada 3h", forca: 30, velocidade: 50, rouboAuto: { chance: 0.15, intervalo: 3 * 60 * 60 * 1000 } },
  { id: "onca", nome: "Onça", emoji: "🐆", preco: 1000, vip: false, buff: "+40% de chance em corridapet, mais forte em batalhapet", forca: 60, velocidade: 70, corridaBonus: 0.40 },
  { id: "ursoPolar", nome: "Urso Polar", emoji: "🐻‍❄️", preco: 1500, vip: false, buff: "+10% sorte em pescar, -15% em todos os pets da loja", forca: 75, velocidade: 40, pescaBonus: 0.10, descontoLoja: 0.15 },
  { id: "unicornio", nome: "Unicórnio", emoji: "🦄", preco: 2000, vip: true, buff: "+10% sorte, +10% proteção roubo, 5% roubar auto a cada 2h, +1% level up daily, +5% gold no trabalhar", forca: 80, velocidade: 90, sorteBonus: 0.10, protecaoRoubo: 0.10, rouboAuto: { chance: 0.05, intervalo: 2 * 60 * 60 * 1000 }, levelUpBonus: 0.01, trabalharBonus: 0.05 }
]

function acharPet(nome) {
  const n = normalizar(nome)
  return PETS.find(p => normalizar(p.nome) === n || p.id === n || normalizar(p.nome).includes(n))
}

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

const MITOS = [
  "A luz do Sol demora cerca de 8 minutos e 20 segundos para chegar até a Terra.",
  "Existem mais estrelas no universo observável do que grãos de areia em todas as praias da Terra.",
  "Um dia em Vênus dura mais tempo do que um ano venusiano.",
  "Em Júpiter e Saturno chove diamante em algumas camadas da atmosfera.",
  "O Monte Olimpo em Marte é o maior vulcão do sistema solar — quase 3x o Everest.",
  "A Estação Espacial Internacional viaja a cerca de 28.000 km/h.",
  "Existem planetas que orbitam duas estrelas ao mesmo tempo (como Tatooine).",
  "A galáxia de Andrômeda vai colidir com a Via Láctea em ~4 bilhões de anos.",
  "Buracos negros supermassivos existem no centro de quase todas as galáxias grandes.",
  "A Lua se afasta da Terra cerca de 3,8 cm por ano.",
  "O coração de uma baleia azul é tão grande que um humano poderia rastejar dentro dele.",
  "Uma colher de chá de estrela de nêutrons pesaria cerca de 6 bilhões de toneladas.",
  "Existe um planeta feito de diamante (55 Cancri e) a 40 anos-luz da Terra.",
  "O espaço não é completamente silencioso — tem som, só que em frequências que não ouvimos.",
  "Existem mais árvores na Terra do que estrelas na Via Láctea.",
  "Um raio é 5x mais quente que a superfície do Sol.",
  "Formigas conseguem carregar 50x o próprio peso.",
  "O polvo tem 3 corações e sangue azul.",
  "O mel nunca estraga — já acharam potes de mel comestíveis em tumbas egípcias.",
  "Uma nuvem comum pesa cerca de 500 toneladas.",
  "Os golfinhos têm nomes uns para os outros.",
  "A bananeira é tecnicamente uma erva gigante.",
  "O cérebro humano gera eletricidade suficiente pra acender uma lâmpada.",
  "O DNA humano é 60% igual ao da banana."
]

const NAPOLEAO = [
  "Um homem não é derrotado por outros, é derrotado por si mesmo.",
  "O impossível é uma palavra que só existe no dicionário dos fracos.",
  "A vitória pertence a quem persiste mais tempo.",
  "Nunca interrompa seu inimigo quando ele está cometendo um erro.",
  "A melhor forma de prever o futuro é criá-lo.",
  "Toda dificuldade é uma oportunidade pra quem tem coragem.",
  "Quem quer, dá um jeito. Quem não quer, dá uma desculpa.",
  "A coragem não é ausência de medo. É agir apesar dele.",
  "Enquanto você dorme, alguém mais faminto está trabalhando.",
  "O mundo pertence aos que acordam cedo e não desistem.",
  "A disciplina é a ponte entre metas e conquistas.",
  "Você não precisa ser o mais forte, só o mais insistente.",
  "Aquele que domina a si mesmo é mais poderoso que aquele que conquista cidades.",
  "Um leão nunca se preocupa com a opinião de ovelhas.",
  "O medo mata mais sonhos do que a falha real.",
  "Se você quer algo que nunca teve, precisa fazer algo que nunca fez.",
  "A melhor vingança é o sucesso estrondoso.",
  "Não conte seus planos. Mostre os resultados.",
  "Sua única competição é quem você foi ontem.",
  "Enquanto houver sopro de vida, haverá esperança.",
  "Cai 7 vezes, levanta 8.",
  "Ninguém constrói um império dormindo até o meio-dia.",
  "A mente é como um paraquedas: só funciona quando aberta.",
  "O segredo do sucesso é começar."
]

const FRASES = [
  "Nem todo mundo que sorri está feliz; às vezes, é só o jeito mais bonito de esconder o vazio.",
  "A pior solidão é estar rodeado de gente e não conseguir falar com ninguém.",
  "Sorrir virou hábito. Sentir virou cansaço.",
  "Eu não estou triste. Eu só estou cansado de fingir que estou bem.",
  "A saudade é o preço que a gente paga por ter amado alguém de verdade.",
  "Ninguém percebe o quanto você está mal até você parar de sorrir.",
  "Você pode ser a pessoa mais forte do mundo e ainda assim querer desabar em algum colo.",
  "As pessoas vão embora. Sempre vão. Aprenda isso antes que doa demais.",
  "Eu sinto falta de quem eu era antes de tudo isso.",
  "Tem coisas que a gente só entende depois que perde.",
  "O silêncio grita mais alto que qualquer palavra.",
  "Alguns dias a gente só sobrevive. E tá tudo bem.",
  "A vida cobra caro as escolhas que a gente faz com o coração.",
  "Não é fraqueza chorar. Fraqueza é engolir tudo e fingir que não dói.",
  "A gente cresce, mas nunca deixa de ser criança que quer colo.",
  "Existem feridas que o tempo não cura. Só ensina a conviver.",
  "Um dia você percebe que a pessoa que mais te machucou era você mesmo.",
  "Tem abraços que falam mais que mil palavras.",
  "A distância dói, mas a indiferença destrói.",
  "Todo mundo é forte até chegar o dia que a saudade bate."
]

function sortearPorChance(lista) {
  const r = Math.random()
  let acumulado = 0
  for (const item of lista) {
    acumulado += item.chance
    if (r <= acumulado) return item
  }
  return lista[0]
}

function getRpg(num) {
  const r = dbLer("rpg.json", { usuarios: {} })
  r.usuarios = r.usuarios || {}
  r.usuarios[num] = r.usuarios[num] || {}
  const u = r.usuarios[num]
  u.moedas = sanearNum(u.moedas)
  u.xp = sanearNum(u.xp, 999999)
  u.nivel = sanearNum(u.nivel, 9999) || 1
  u.ultimoTrabalho = sanearNum(u.ultimoTrabalho)
  u.ultimoRoubo = sanearNum(u.ultimoRoubo)
  u.ultimoCrime = sanearNum(u.ultimoCrime)
  u.ultimoMinerar = sanearNum(u.ultimoMinerar)
  u.ultimoPescar = sanearNum(u.ultimoPescar)
  u.ultimoCorrida = sanearNum(u.ultimoCorrida)
  u.ultimoBatalha = sanearNum(u.ultimoBatalha)
  u.ultimoExplorar = sanearNum(u.ultimoExplorar)
  u.temPicareta = u.temPicareta || false
  u.temVara = u.temVara || false
  u.pet = u.pet || null
  u.petGrupo = u.petGrupo || null
  u.petFome = u.petFome ?? 100
  u.petSede = u.petSede ?? 100
  u.petFelicidade = u.petFelicidade ?? 100
  u.petVida = u.petVida ?? 100
  u.petVidaMax = u.petVidaMax ?? 100
  u.ultimoRouboPet = sanearNum(u.ultimoRouboPet)
  u.daily = u.daily || 0
  return { r, u }
}

function salvarRpg(r) {
  dbSalvar("rpg.json", r)
}

function ehVip(db, sender, isDono, isSubDono) {
  if (isDono || isSubDono) return true
  const num = soNumero(sender)
  const v = (db.vips() || {}).vips || {}
  for (const [jidVip, info] of Object.entries(v)) {
    const n = soNumero(jidVip)
    if (n === num && (info.expira === "inf" || info.expira > Date.now())) return true
  }
  return false
}

function xpNecessario(nivel) {
  return Math.floor(100 * Math.pow(1.5, nivel - 1))
}

function ganharXp(u, qtd) {
  u.xp = sanearNum((u.xp || 0) + qtd, 999999)
  let subiu = 0
  while (u.xp >= xpNecessario(u.nivel) && subiu < 100) {
    u.xp -= xpNecessario(u.nivel)
    u.nivel++
    subiu++
  }
  return subiu
}

function precoComDesconto(preco, temUrso) {
  if (!temUrso) return preco
  return Math.floor(preco * 0.85)
}

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

      const vitimas = membrosArr
        .filter(n => n !== num)
        .map(n => ({ num: n, u: r.usuarios[n] }))
        .filter(x => x.u && sanearNum(x.u.moedas) > 100 && x.u.pet !== "unicornio")

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

      try {
        await sock.sendMessage(grupoPet, {
          text: petInfo.emoji + " O *" + petInfo.nome + "* de @" + num + " roubou *" + fmt(roubado) + " gold* de @" + vitima.num + "!",
          mentions: [mJid(num), mJid(vitima.num)]
        })
      } catch (_) {}
    }
    if (alterou) salvarRpg(r)
  },

  commands: {

    menurpg: {
      aliases: ["comandosrpg", "menur"],
      async executar({ sock, msg, prefixoAtivo, db }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "!"
        const cfg = db.config()
        const texto =
`╔══════════════════════════════╗
║   ⚡⚔️  𝐌𝐄𝐍𝐔 𝐑𝐏𝐆  ⚔️⚡
╚══════════════════════════════╝

🦅 *Zenitsu apresenta:*
⚡ *o mundo do trovão!*

━━━━━━━━━━━━━━━━━━━━━━━━━
⚡💰 *ECONOMIA*
▸ ${p}daily
▸ ${p}trabalhar
▸ ${p}cassino <valor>
▸ ${p}crime
▸ ${p}roubar @user

━━━━━━━━━━━━━━━━━━━━━━━━━
⚡⛏️ *FERRAMENTAS*
▸ ${p}comprarpicareta
▸ ${p}minerar
▸ ${p}comprarvara
▸ ${p}pescar

━━━━━━━━━━━━━━━━━━━━━━━━━
⚡🗺️ *EXPLORAÇÃO* (Nv. 3+)
▸ ${p}explorar

━━━━━━━━━━━━━━━━━━━━━━━━━
⚡🐾 *PETS*
▸ ${p}lojapet
▸ ${p}comprarpet <nome>
▸ ${p}meupet
▸ ${p}alimentarpet
▸ ${p}curarpet
▸ ${p}batalhapet @user
▸ ${p}corridapet @user
▸ ${p}venderpet <nome>
▸ ${p}doarpet <nome> @user

━━━━━━━━━━━━━━━━━━━━━━━━━
⚡👤 *PERFIL*
▸ ${p}perfil
▸ ${p}rank

━━━━━━━━━━━━━━━━━━━━━━━━━
⚡💤 *AFK*
▸ ${p}afk <motivo>

━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ _"O trovão recompensa os fortes."_`
        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          if (cfg.tipoMenu === "video") return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "zenitsu.mp4", gifPlayback: true, caption: texto }, { quoted: msg })
          return sock.sendMessage(jid, { image: buf, caption: texto }, { quoted: msg })
        }
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    rpg: {
      aliases: ["rpgativo", "ativarrpg", "rpgonoff"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) {
          const g = db.grupos(); const ativo = g[jid]?.rpgAtivo === true
          return sock.sendMessage(jid, { text: "⚡⚔️ *RPG DO GRUPO*\n\n📊 Status: *" + (ativo ? "ON ✅" : "OFF ❌") + "*\n\n⚡ Use *!rpg on* ou *!rpg off*" }, { quoted: msg })
        }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].rpgAtivo = opcao === "on"; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: opcao === "on" ? "⚡⚔️ RPG ATIVADO!" : "⚡💤 RPG DESATIVADO!" }, { quoted: msg })
      }
    },

    daily: { aliases: ["diario"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { r, u } = getRpg(num)
      const hoje = new Date().toISOString().slice(0, 10)
      if (u.daily === hoje) return sock.sendMessage(jid, { text: "⚡⏰ Você já pegou o *daily* hoje!" }, { quoted: msg })
      let valor = 200 + u.nivel * 50
      let extra = ""
      if (u.pet === "unicornio" && Math.random() < 0.01) { const s = ganharXp(u, xpNecessario(u.nivel)); valor += 500; extra = "\n\n🦄 *BÔNUS UNICÓRNIO!*\n⬆️ Subiu *" + s + "* nível!\n💰 +500 gold" }
      u.moedas = sanearNum(u.moedas + valor); u.daily = hoje
      const subiuNivel = ganharXp(u, 25); salvarRpg(r)
      let txt = "⚡💰 *DAILY*\n\n👤 @" + num + "\n💰 *+" + fmt(valor) + " gold*\n🎯 *+25 XP*"
      if (subiuNivel) txt += "\n⬆️ Subiu *" + subiuNivel + "* nível!"
      txt += extra
      await sock.sendMessage(jid, { text: txt, mentions: [mJid(num)] }, { quoted: msg })
    }},

    trabalhar: { aliases: ["work", "trampar"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { r, u } = getRpg(num)
      const cooldown = COOLDOWN_TRABALHO - (Date.now() - u.ultimoTrabalho)
      if (cooldown > 0) return sock.sendMessage(jid, { text: "⚡⏰ Espere *" + formatarTempo(cooldown) + "*!" }, { quoted: msg })
      const trabalhos = ["entregador", "pedreiro", "motoqueiro", "vendedor", "programador", "garçom", "motorista"]
      const trabalho = trabalhos[Math.floor(Math.random() * trabalhos.length)]
      let salario = 100 + u.nivel * 30 + Math.floor(Math.random() * 100)
      let bonus = ""
      if (u.pet === "unicornio") { salario = Math.floor(salario * 1.05); bonus = "\n🦄 *Bônus Unicórnio: +5%*" }
      u.moedas = sanearNum(u.moedas + salario); u.ultimoTrabalho = Date.now()
      const subiu = ganharXp(u, 15); salvarRpg(r)
      let txt = "⚡💼 *TRABALHO*\n\n👤 @" + num + "\n⚒️ Trabalhou como *" + trabalho + "*\n💰 *+" + fmt(salario) + " gold*"
      if (bonus) txt += bonus
      txt += "\n🎯 *+15 XP*"
      if (subiu) txt += "\n⬆️ Subiu *" + subiu + "* nível!"
      await sock.sendMessage(jid, { text: txt, mentions: [mJid(num)] }, { quoted: msg })
    }},

    cassino: { aliases: ["bet", "apostar"], async executar({ sock, msg, args, db, utils, sender }) {
      const jid = msg.key.remoteJid
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { r, u } = getRpg(num)
      const valor = Math.floor(parseInt(args[0]) || 0)
      if (!valor || valor <= 0) return sock.sendMessage(jid, { text: "⚡🎰 Use *!cassino <valor>*" }, { quoted: msg })
      if (valor > u.moedas) return sock.sendMessage(jid, { text: "⚡💢 Você só tem *" + fmt(u.moedas) + "* gold!" }, { quoted: msg })
      const ganhou = Math.random() < 0.48
      const emoji = ["🎰", "🎲", "🃏"][Math.floor(Math.random() * 3)]
      if (ganhou) {
        u.moedas = sanearNum(u.moedas + valor); ganharXp(u, 10); salvarRpg(r)
        await sock.sendMessage(jid, { text: emoji + " *VOCÊ GANHOU!*\n\n👤 @" + num + "\n💰 *+" + fmt(valor) + "*\n💼 Total: *" + fmt(u.moedas) + "*", mentions: [mJid(num)] }, { quoted: msg })
      } else {
        u.moedas = sanearNum(u.moedas - valor); salvarRpg(r)
        await sock.sendMessage(jid, { text: emoji + " *VOCÊ PERDEU!*\n\n👤 @" + num + "\n💸 *-" + fmt(valor) + "*\n💼 Total: *" + fmt(u.moedas) + "*", mentions: [mJid(num)] }, { quoted: msg })
      }
    }},

    roubar: { aliases: ["assaltar", "roub4r"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid
      const alvo = utils.getAlvo(msg)
      if (!alvo) return sock.sendMessage(jid, { text: "⚡🔫 Use *!roubar @user*" }, { quoted: msg })
      const numReal = await resolverNumero(sock, jid, sender)
      const numAlvoReal = await resolverNumero(sock, jid, alvo)
      if (!numReal || !numAlvoReal) return sock.sendMessage(jid, { text: "⚡💢 Não consegui identificar!" }, { quoted: msg })
      if (numAlvoReal === numReal) return sock.sendMessage(jid, { text: "⚡❓ Não pode roubar você mesmo!" }, { quoted: msg })
      const { r, u } = getRpg(numReal)
      const { r: rAlvo, u: uAlvo } = getRpg(numAlvoReal)
      const cooldown = COOLDOWN_ROUBO - (Date.now() - u.ultimoRoubo)
      if (cooldown > 0) return sock.sendMessage(jid, { text: "⚡⏰ Espere *" + formatarTempo(cooldown) + "*!" }, { quoted: msg })
      if (uAlvo.moedas < 100) return sock.sendMessage(jid, { text: "⚡💢 @" + numAlvoReal + " é pobre demais!", mentions: [mJid(numAlvoReal)] }, { quoted: msg })
      u.ultimoRoubo = Date.now()
      let chance = 0.45
      if (uAlvo.pet === "unicornio") chance -= 0.10
      const sucesso = Math.random() < chance
      const valor = Math.min(Math.floor(uAlvo.moedas * (0.10 + Math.random() * 0.15)), 10000)
      if (sucesso) {
        u.moedas = sanearNum(u.moedas + valor); uAlvo.moedas = sanearNum(uAlvo.moedas - valor); ganharXp(u, 20)
        salvarRpg(r); salvarRpg(rAlvo)
        await sock.sendMessage(jid, { text: "⚡🦹 *ROUBO BEM-SUCEDIDO!*\n\n👤 @" + numReal + "\n🎯 Alvo: @" + numAlvoReal + "\n💰 *+" + fmt(valor) + "*", mentions: [mJid(numReal), mJid(numAlvoReal)] }, { quoted: msg })
      } else {
        const multa = Math.floor(valor * 0.5)
        u.moedas = sanearNum(Math.max(0, u.moedas - multa)); salvarRpg(r)
        await sock.sendMessage(jid, { text: "⚡🚨 *ROUBO FALHOU!*\n\n👤 @" + numReal + "\n🎯 Alvo: @" + numAlvoReal + "\n💸 Multa: *-" + fmt(multa) + "*", mentions: [mJid(numReal), mJid(numAlvoReal)] }, { quoted: msg })
      }
    }},

    crime: { aliases: ["crimeurbano"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { r, u } = getRpg(num)
      const cooldown = COOLDOWN_CRIME - (Date.now() - u.ultimoCrime)
      if (cooldown > 0) return sock.sendMessage(jid, { text: "⚡⏰ Espere *" + formatarTempo(cooldown) + "*!" }, { quoted: msg })
      u.ultimoCrime = Date.now()
      const crimes = [
        { nome: "Assalto a banco", min: 500, max: 2000, risco: 0.55 },
        { nome: "Roubo de carro", min: 200, max: 800, risco: 0.40 },
        { nome: "Tráfico", min: 300, max: 1500, risco: 0.50 },
        { nome: "Contrabando", min: 400, max: 1800, risco: 0.45 },
        { nome: "Furto de loja", min: 100, max: 500, risco: 0.25 }
      ]
      const crime = crimes[Math.floor(Math.random() * crimes.length)]
      const ganhou = Math.random() > crime.risco
      if (ganhou) {
        const valor = Math.floor(crime.min + Math.random() * (crime.max - crime.min))
        u.moedas = sanearNum(u.moedas + valor); ganharXp(u, 25); salvarRpg(r)
        await sock.sendMessage(jid, { text: "⚡🦹 *" + crime.nome.toUpperCase() + "*\n\n👤 @" + num + "\n💰 Botim: *+" + fmt(valor) + "*", mentions: [mJid(num)] }, { quoted: msg })
      } else {
        const multa = Math.floor(crime.min * 1.5)
        u.moedas = sanearNum(Math.max(0, u.moedas - multa)); salvarRpg(r)
        await sock.sendMessage(jid, { text: "⚡🚨 *" + crime.nome.toUpperCase() + "*\n\n👤 @" + num + "\n💸 Multa: *-" + fmt(multa) + "*", mentions: [mJid(num)] }, { quoted: msg })
      }
    }},

    comprarpicareta: { aliases: ["buypicareta", "picareta"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { r, u } = getRpg(num)
      if (u.temPicareta) return sock.sendMessage(jid, { text: "⚡⛏️ Você já tem uma *picareta*!" }, { quoted: msg })
      if (u.moedas < PRECO_PICARETA) return sock.sendMessage(jid, { text: "⚡💢 Faltam *" + fmt(PRECO_PICARETA - u.moedas) + "* gold!" }, { quoted: msg })
      u.moedas = sanearNum(u.moedas - PRECO_PICARETA); u.temPicareta = true; salvarRpg(r)
      await sock.sendMessage(jid, { text: "⚡⛏️ *PICARETA COMPRADA!*\n\n💰 *-" + fmt(PRECO_PICARETA) + "*", mentions: [mJid(num)] }, { quoted: msg })
    }},

    minerar: { aliases: ["mine", "mineracao"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { r, u } = getRpg(num)
      if (!u.temPicareta) return sock.sendMessage(jid, { text: "⚡💢 Você precisa de uma *picareta*!" }, { quoted: msg })
      const cooldown = COOLDOWN_MINERAR - (Date.now() - u.ultimoMinerar)
      if (cooldown > 0) return sock.sendMessage(jid, { text: "⚡⏰ Espere *" + formatarTempo(cooldown) + "*!" }, { quoted: msg })
      u.ultimoMinerar = Date.now()
      const minerio = sortearPorChance(MINERIOS)
      u.moedas = sanearNum(u.moedas + minerio.valor); ganharXp(u, 10); salvarRpg(r)
      await sock.sendMessage(jid, { text: "⚡⛏️ *MINERAÇÃO*\n\n👤 @" + num + "\n" + minerio.emoji + " Achou: *" + minerio.nome + "*\n💰 *+" + fmt(minerio.valor) + "*", mentions: [mJid(num)] }, { quoted: msg })
    }},

    comprarvara: { aliases: ["buyvara", "vara"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { r, u } = getRpg(num)
      if (u.temVara) return sock.sendMessage(jid, { text: "⚡🎣 Você já tem uma *vara*!" }, { quoted: msg })
      if (u.moedas < PRECO_VARA) return sock.sendMessage(jid, { text: "⚡💢 Faltam *" + fmt(PRECO_VARA - u.moedas) + "* gold!" }, { quoted: msg })
      u.moedas = sanearNum(u.moedas - PRECO_VARA); u.temVara = true; salvarRpg(r)
      await sock.sendMessage(jid, { text: "⚡🎣 *VARA COMPRADA!*\n\n💰 *-" + fmt(PRECO_VARA) + "*", mentions: [mJid(num)] }, { quoted: msg })
    }},

    pescar: { aliases: ["pesca", "fish"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { r, u } = getRpg(num)
      if (!u.temVara) return sock.sendMessage(jid, { text: "⚡💢 Você precisa de uma *vara*!" }, { quoted: msg })
      const cooldown = COOLDOWN_PESCAR - (Date.now() - u.ultimoPescar)
      if (cooldown > 0) return sock.sendMessage(jid, { text: "⚡⏰ Espere *" + formatarTempo(cooldown) + "*!" }, { quoted: msg })
      u.ultimoPescar = Date.now()
      const peixe = sortearPorChance(PEIXES)
      let valor = peixe.valor
      let bonus = ""
      if (u.pet === "ursoPolar") { valor = Math.floor(valor * 1.10); bonus = "\n🐻‍❄️ *Bônus Urso Polar: +10%*" }
      u.moedas = sanearNum(u.moedas + valor); ganharXp(u, 12); salvarRpg(r)
      await sock.sendMessage(jid, { text: "⚡🎣 *PESCARIA*\n\n👤 @" + num + "\n" + peixe.emoji + " Pescou: *" + peixe.nome + "*\n💰 *+" + fmt(valor) + "*" + bonus, mentions: [mJid(num)] }, { quoted: msg })
    }},

    lojapet: { aliases: ["petshop", "lojapets"], async executar({ sock, msg, db, utils, sender, isDono, isSubDono }) {
      const jid = msg.key.remoteJid
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { u } = getRpg(num)
      const temUrso = u.pet === "ursoPolar"
      const ehVipUser = ehVip(db, sender, isDono, isSubDono)
      let txt = "⚡🐾 *LOJA DE PETS*\n\n"
      for (const pet of PETS) {
        const preco = precoComDesconto(pet.preco, temUrso && pet.id !== "unicornio")
        const tag = pet.vip ? " 💎VIP" : ""
        txt += pet.emoji + " *" + pet.nome + "*" + tag + "\n💰 " + fmt(preco) + " gold\n📜 " + pet.buff + "\n\n"
      }
      txt += "━━━━━━━━━━━━━━━━━━━━━━━━━\n"
      if (temUrso) txt += "🐻‍❄️ *Urso Polar ativo: -15% em todos!*\n"
      if (ehVipUser) txt += "💎 *Você é VIP!*\n"
      txt += "\n💡 Use *!comprarpet <nome>*"
      await sock.sendMessage(jid, { text: txt }, { quoted: msg })
    }},

    comprarpet: { aliases: ["buypet", "adotarpet"], async executar({ sock, msg, args, db, utils, sender, isDono, isSubDono }) {
      const jid = msg.key.remoteJid
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { r, u } = getRpg(num)
      if (u.pet) return sock.sendMessage(jid, { text: "⚡🐾 Você já tem um pet!" }, { quoted: msg })
      const pet = acharPet(args.join(" "))
      if (!pet) return sock.sendMessage(jid, { text: "⚡❌ Pet não achado!" }, { quoted: msg })
      if (pet.vip && !ehVip(db, sender, isDono, isSubDono)) return sock.sendMessage(jid, { text: "⚡💎 O *" + pet.nome + "* é exclusivo VIP!" }, { quoted: msg })
      const preco = precoComDesconto(pet.preco, u.pet === "ursoPolar" && pet.id !== "unicornio")
      if (u.moedas < preco) return sock.sendMessage(jid, { text: "⚡💢 Faltam *" + fmt(preco - u.moedas) + "* gold!" }, { quoted: msg })
      u.moedas = sanearNum(u.moedas - preco); u.pet = pet.id
      u.petGrupo = jid.endsWith("@g.us") ? jid : null
      u.petFome = 100; u.petSede = 100; u.petFelicidade = 100
      u.petVida = pet.forca * 10; u.petVidaMax = pet.forca * 10
      u.ultimoRouboPet = Date.now(); salvarRpg(r)
      await sock.sendMessage(jid, { text: "⚡🐾 *PET ADOTADO!*\n\n👤 @" + num + "\n" + pet.emoji + " *" + pet.nome + "*\n💰 *-" + fmt(preco) + "*\n\n📜 " + pet.buff, mentions: [mJid(num)] }, { quoted: msg })
    }},

    meupet: { aliases: ["pet", "statuspet"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { u } = getRpg(num)
      if (!u.pet) return sock.sendMessage(jid, { text: "⚡🐾 Você não tem pet!" }, { quoted: msg })
      const pet = PETS.find(p => p.id === u.pet)
      if (!pet) return sock.sendMessage(jid, { text: "⚡❌ Pet bugado!" }, { quoted: msg })
      const barra = (v) => { const c = Math.max(0, Math.min(10, Math.round(v / 10))); return "🟩".repeat(c) + "⬛".repeat(10 - c) }
      const ic = (v) => v > 70 ? "🟢" : v > 40 ? "🟡" : "🔴"
      const txt =
`╔══════════════════════════════╗
║   ${pet.emoji} 𝐌𝐄𝐔 𝐏𝐄𝐓 ${pet.emoji}
╚══════════════════════════════╝

👤 @${num}
🐾 *${pet.nome}*

🍖 Fome: ${ic(u.petFome)} *${u.petFome}%*
${barra(u.petFome)}

💧 Sede: ${ic(u.petSede)} *${u.petSede}%*
${barra(u.petSede)}

😊 Felicidade: ${ic(u.petFelicidade)} *${u.petFelicidade}%*
${barra(u.petFelicidade)}

❤️ Vida: ${ic(u.petVida / u.petVidaMax * 100)} *${u.petVida}/${u.petVidaMax}*
${barra(u.petVida / u.petVidaMax * 100)}

⚔️ Força: *${pet.forca}*
🏃 Velocidade: *${pet.velocidade}*`
      await sock.sendMessage(jid, { text: txt, mentions: [mJid(num)] }, { quoted: msg })
    }},

    alimentarpet: { aliases: ["feedpet", "darpet"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { r, u } = getRpg(num)
      if (!u.pet) return sock.sendMessage(jid, { text: "⚡🐾 Sem pet!" }, { quoted: msg })
      const custo = 50
      if (u.moedas < custo) return sock.sendMessage(jid, { text: "⚡💢 Precisa *" + fmt(custo) + "* gold!" }, { quoted: msg })
      u.moedas = sanearNum(u.moedas - custo)
      u.petFome = Math.min(100, u.petFome + 30); u.petSede = Math.min(100, u.petSede + 20); u.petFelicidade = Math.min(100, u.petFelicidade + 10)
      salvarRpg(r)
      const pet = PETS.find(p => p.id === u.pet)
      await sock.sendMessage(jid, { text: pet.emoji + " *PET ALIMENTADO!*\n\n🍖 " + u.petFome + "%\n💧 " + u.petSede + "%\n💰 *-" + fmt(custo) + "*", mentions: [mJid(num)] }, { quoted: msg })
    }},

    curarpet: { aliases: ["healpet", "curar"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { r, u } = getRpg(num)
      if (!u.pet) return sock.sendMessage(jid, { text: "⚡🐾 Sem pet!" }, { quoted: msg })
      if (u.petVida >= u.petVidaMax) return sock.sendMessage(jid, { text: "⚡❤️ Vida cheia!" }, { quoted: msg })
      const custo = (u.petVidaMax - u.petVida) * 3
      if (u.moedas < custo) return sock.sendMessage(jid, { text: "⚡💢 Precisa *" + fmt(custo) + "* gold!" }, { quoted: msg })
      u.moedas = sanearNum(u.moedas - custo); u.petVida = u.petVidaMax; salvarRpg(r)
      const pet = PETS.find(p => p.id === u.pet)
      await sock.sendMessage(jid, { text: pet.emoji + " *PET CURADO!*\n\n❤️ " + u.petVida + "/" + u.petVidaMax + "\n💰 *-" + fmt(custo) + "*", mentions: [mJid(num)] }, { quoted: msg })
    }},

    venderpet: { aliases: ["sellpet"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { r, u } = getRpg(num)
      if (!u.pet) return sock.sendMessage(jid, { text: "⚡🐾 Sem pet!" }, { quoted: msg })
      const pet = PETS.find(p => p.id === u.pet)
      if (pet.vip) return sock.sendMessage(jid, { text: "⚡💎 Pets VIP não podem ser vendidos!" }, { quoted: msg })
      const valor = Math.floor(pet.preco * 0.6)
      u.moedas = sanearNum(u.moedas + valor); u.pet = null; u.petGrupo = null; salvarRpg(r)
      await sock.sendMessage(jid, { text: pet.emoji + " *PET VENDIDO!*\n\n" + pet.nome + "\n💰 *+" + fmt(valor) + "*", mentions: [mJid(num)] }, { quoted: msg })
    }},

    doarpet: { aliases: ["givepet", "presentepet"], async executar({ sock, msg, args, db, utils, sender }) {
      const jid = msg.key.remoteJid
      const alvo = utils.getAlvo(msg)
      if (!alvo) return sock.sendMessage(jid, { text: "⚡🎁 Use *!doarpet @user*" }, { quoted: msg })
      const numReal = await resolverNumero(sock, jid, sender)
      const numAlvoReal = await resolverNumero(sock, jid, alvo)
      if (!numReal || !numAlvoReal) return sock.sendMessage(jid, { text: "⚡💢 Não identifiquei!" }, { quoted: msg })
      if (numAlvoReal === numReal) return sock.sendMessage(jid, { text: "⚡❓ Não pode doar pra você!" }, { quoted: msg })
      const { r, u } = getRpg(numReal)
      const { r: rAlvo, u: uAlvo } = getRpg(numAlvoReal)
      if (!u.pet) return sock.sendMessage(jid, { text: "⚡🐾 Sem pet!" }, { quoted: msg })
      if (uAlvo.pet) return sock.sendMessage(jid, { text: "⚡💢 @" + numAlvoReal + " já tem pet!", mentions: [mJid(numAlvoReal)] }, { quoted: msg })
      const pet = PETS.find(p => p.id === u.pet)
      if (pet.vip) return sock.sendMessage(jid, { text: "⚡💎 Pets VIP não podem ser doados!" }, { quoted: msg })
      uAlvo.pet = pet.id; uAlvo.petGrupo = u.petGrupo
      uAlvo.petFome = u.petFome; uAlvo.petSede = u.petSede; uAlvo.petFelicidade = u.petFelicidade
      uAlvo.petVida = u.petVida; uAlvo.petVidaMax = u.petVidaMax; uAlvo.ultimoRouboPet = Date.now()
      u.pet = null; u.petGrupo = null
      salvarRpg(r); salvarRpg(rAlvo)
      await sock.sendMessage(jid, { text: pet.emoji + " *PET DOADO!*\n\n👤 De: @" + numReal + "\n🎁 Para: @" + numAlvoReal + "\n🐾 *" + pet.nome + "*", mentions: [mJid(numReal), mJid(numAlvoReal)] }, { quoted: msg })
    }},

    batalhapet: { aliases: ["batalhar", "petbatalha"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid
      const alvo = utils.getAlvo(msg)
      if (!alvo) return sock.sendMessage(jid, { text: "⚡⚔️ Use *!batalhapet @user*" }, { quoted: msg })
      const numReal = await resolverNumero(sock, jid, sender)
      const numAlvoReal = await resolverNumero(sock, jid, alvo)
      if (!numReal || !numAlvoReal) return sock.sendMessage(jid, { text: "⚡💢 Não identifiquei!" }, { quoted: msg })
      if (numAlvoReal === numReal) return sock.sendMessage(jid, { text: "⚡❓ Não pode batalhar consigo!" }, { quoted: msg })
      const { r, u } = getRpg(numReal)
      const { r: rAlvo, u: uAlvo } = getRpg(numAlvoReal)
      if (!u.pet || !uAlvo.pet) return sock.sendMessage(jid, { text: "⚡🐾 Um dos dois não tem pet!" }, { quoted: msg })
      const cooldown = COOLDOWN_BATALHA - (Date.now() - u.ultimoBatalha)
      if (cooldown > 0) return sock.sendMessage(jid, { text: "⚡⏰ Espere *" + formatarTempo(cooldown) + "*!" }, { quoted: msg })
      u.ultimoBatalha = Date.now()
      const pet1 = PETS.find(p => p.id === u.pet)
      const pet2 = PETS.find(p => p.id === uAlvo.pet)
      const f1 = pet1.forca * (u.petVida / u.petVidaMax) * (u.petFome / 100)
      const f2 = pet2.forca * (uAlvo.petVida / uAlvo.petVidaMax) * (uAlvo.petFome / 100)
      const chance1 = f1 / (f1 + f2)
      const venceu = Math.random() < chance1
      const premio = 100
      if (venceu) {
        const dano = Math.floor(uAlvo.petVidaMax * 0.3)
        uAlvo.petVida = Math.max(0, uAlvo.petVida - dano)
        u.moedas = sanearNum(u.moedas + premio); ganharXp(u, 20)
        salvarRpg(r); salvarRpg(rAlvo)
        await sock.sendMessage(jid, { text: "⚡⚔️ *BATALHA*\n\n" + pet1.emoji + " @" + numReal + " VS " + pet2.emoji + " @" + numAlvoReal + "\n\n🏆 *@" + numReal + " VENCEU!*\n💰 *+" + premio + "*", mentions: [mJid(numReal), mJid(numAlvoReal)] }, { quoted: msg })
      } else {
        const dano = Math.floor(u.petVidaMax * 0.3)
        u.petVida = Math.max(0, u.petVida - dano)
        uAlvo.moedas = sanearNum(uAlvo.moedas + premio); ganharXp(uAlvo, 20)
        salvarRpg(r); salvarRpg(rAlvo)
        await sock.sendMessage(jid, { text: "⚡⚔️ *BATALHA*\n\n" + pet1.emoji + " @" + numReal + " VS " + pet2.emoji + " @" + numAlvoReal + "\n\n🏆 *@" + numAlvoReal + " VENCEU!*\n💰 *+" + premio + "*", mentions: [mJid(numReal), mJid(numAlvoReal)] }, { quoted: msg })
      }
    }},

    corridapet: { aliases: ["corrida", "racepet"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid
      const alvo = utils.getAlvo(msg)
      if (!alvo) return sock.sendMessage(jid, { text: "⚡🏁 Use *!corridapet @user*" }, { quoted: msg })
      const numReal = await resolverNumero(sock, jid, sender)
      const numAlvoReal = await resolverNumero(sock, jid, alvo)
      if (!numReal || !numAlvoReal) return sock.sendMessage(jid, { text: "⚡💢 Não identifiquei!" }, { quoted: msg })
      if (numAlvoReal === numReal) return sock.sendMessage(jid, { text: "⚡❓ Não pode correr consigo!" }, { quoted: msg })
      const { r, u } = getRpg(numReal)
      const { r: rAlvo, u: uAlvo } = getRpg(numAlvoReal)
      if (!u.pet || !uAlvo.pet) return sock.sendMessage(jid, { text: "⚡🐾 Um dos dois não tem pet!" }, { quoted: msg })
      const cooldown = COOLDOWN_CORRIDA - (Date.now() - u.ultimoCorrida)
      if (cooldown > 0) return sock.sendMessage(jid, { text: "⚡⏰ Espere *" + formatarTempo(cooldown) + "*!" }, { quoted: msg })
      u.ultimoCorrida = Date.now()
      const pet1 = PETS.find(p => p.id === u.pet)
      const pet2 = PETS.find(p => p.id === uAlvo.pet)
      let b1 = 0, b2 = 0
      if (pet1.corridaBonus) b1 = pet1.corridaBonus
      if (pet2.corridaBonus) b2 = pet2.corridaBonus
      const v1 = pet1.velocidade + b1 * 100
      const v2 = pet2.velocidade + b2 * 100
      const chance1 = v1 / (v1 + v2)
      const venceu = Math.random() < chance1
      const premio = 150
      if (venceu) {
        u.moedas = sanearNum(u.moedas + premio); ganharXp(u, 15); salvarRpg(r)
        await sock.sendMessage(jid, { text: "⚡🏁 *CORRIDA*\n\n" + pet1.emoji + " @" + numReal + " VS " + pet2.emoji + " @" + numAlvoReal + "\n\n🏆 *@" + numReal + " VENCEU!*\n💰 *+" + premio + "*", mentions: [mJid(numReal), mJid(numAlvoReal)] }, { quoted: msg })
      } else {
        uAlvo.moedas = sanearNum(uAlvo.moedas + premio); ganharXp(uAlvo, 15); salvarRpg(rAlvo)
        await sock.sendMessage(jid, { text: "⚡🏁 *CORRIDA*\n\n" + pet1.emoji + " @" + numReal + " VS " + pet2.emoji + " @" + numAlvoReal + "\n\n🏆 *@" + numAlvoReal + " VENCEU!*\n💰 *+" + premio + "*", mentions: [mJid(numReal), mJid(numAlvoReal)] }, { quoted: msg })
      }
    }},

    explorar: { aliases: ["exploracao", "aventura", "exp"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { r, u } = getRpg(num)
      if (u.nivel < NIVEL_MIN_EXPLORAR) return sock.sendMessage(jid, { text: "⚡🗺️ *EXPLORAR*\n\n💢 Precisa Nível *" + NIVEL_MIN_EXPLORAR + "*+\n📊 Você: *" + u.nivel + "*" }, { quoted: msg })
      const cooldown = COOLDOWN_EXPLORAR - (Date.now() - u.ultimoExplorar)
      if (cooldown > 0) return sock.sendMessage(jid, { text: "⚡⏰ Espere *" + formatarTempo(cooldown) + "*!" }, { quoted: msg })
      u.ultimoExplorar = Date.now()
      const local = EXPLORAR[Math.floor(Math.random() * EXPLORAR.length)]
      const sucesso = Math.random() < 0.75
      if (sucesso) {
        const valor = Math.floor(local.min + Math.random() * (local.max - local.min))
        const xp = local.xp + Math.floor(Math.random() * 20)
        u.moedas = sanearNum(u.moedas + valor)
        const subiu = ganharXp(u, xp); salvarRpg(r)
        let txt = "⚡🗺️ *EXPLORAÇÃO*\n\n👤 @" + num + "\n" + local.emoji + " *" + local.nome + "*\n\n💰 *+" + fmt(valor) + " gold*\n🎯 *+" + xp + " XP*"
        if (subiu) txt += "\n⬆️ Subiu *" + subiu + "* nível!"
        await sock.sendMessage(jid, { text: txt, mentions: [mJid(num)] }, { quoted: msg })
      } else {
        const perda = Math.floor((u.moedas || 0) * 0.05)
        u.moedas = sanearNum(Math.max(0, u.moedas - perda)); ganharXp(u, 5); salvarRpg(r)
        await sock.sendMessage(jid, { text: "⚡🗺️ *EXPLORAÇÃO*\n\n👤 @" + num + "\n" + local.emoji + " *" + local.nome + "*\n\n💢 Se perdeu!\n💸 *-" + fmt(perda) + " gold*\n🎯 *+5 XP*", mentions: [mJid(num)] }, { quoted: msg })
      }
    }},

    perfil: { aliases: ["meuperfil", "rpgperfil"], async executar({ sock, msg, db, utils, sender }) {
      const jid = msg.key.remoteJid
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const { u } = getRpg(num)
      const xpNec = xpNecessario(u.nivel)
      const pct = Math.floor(u.xp / xpNec * 10)
      const barra = "🟨".repeat(Math.min(10, pct)) + "⬛".repeat(Math.max(0, 10 - pct))
      const pet = u.pet ? PETS.find(p => p.id === u.pet) : null
      const petTxt = pet ? pet.emoji + " " + pet.nome : "❌ Sem pet"
      const txt =
`╔══════════════════════════════╗
║   ⚡👤 𝐏𝐄𝐑𝐅𝐈𝐋 👤⚡
╚══════════════════════════════╝

👤 @${num}

🎖️ Nível: *${u.nivel}*
${barra} ${u.xp}/${xpNec} XP

💰 Carteira: *${fmt(u.moedas)}*
🐾 Pet: ${petTxt}
⛏️ Picareta: ${u.temPicareta ? "✅" : "❌"}
🎣 Vara: ${u.temVara ? "✅" : "❌"}

⚡ _"O trovão reconhece os fortes."_`
      let fotoUrl = null
      try { fotoUrl = await sock.profilePictureUrl(mJid(num), "image") } catch (_) {}
      if (!fotoUrl) { try { fotoUrl = await sock.profilePictureUrl(sender, "image") } catch (_) {} }
      if (fotoUrl) {
        await sock.sendMessage(jid, { image: { url: fotoUrl }, caption: txt, mentions: [mJid(num)] }, { quoted: msg })
      } else {
        await sock.sendMessage(jid, { text: txt, mentions: [mJid(num)] }, { quoted: msg })
      }
    }},

    rank: { aliases: ["ranking", "top"], async executar({ sock, msg, db, utils }) {
      const jid = msg.key.remoteJid
      if (!jid.endsWith("@g.us")) return sock.sendMessage(jid, { text: "⚡📊 Só em grupos!" }, { quoted: msg })
      const { numeros } = await coletarMembros(sock, jid)
      if (numeros.size === 0) return sock.sendMessage(jid, { text: "⚡💢 Não identifiquei membros!" }, { quoted: msg })
      const r = dbLer("rpg.json", { usuarios: {} })
      const lista = Object.entries(r.usuarios || {})
        .filter(([num]) => numeros.has(num))
        .map(([num, u]) => {
          let moedas = u.moedas || 0
          if (typeof moedas !== "number" || !isFinite(moedas) || moedas < 0) moedas = 0
          if (moedas > 999999999999) moedas = 999999999999
          return { num, moedas, nivel: u.nivel || 1 }
        })
      lista.sort((a, b) => b.moedas - a.moedas)
      const top = lista.slice(0, 10)
      if (!top.length) return sock.sendMessage(jid, { text: "⚡📊 Ninguém do grupo tá no RPG!" }, { quoted: msg })
      let txt = "⚡🏆 *RANKING*\n\n"
      top.forEach((p, i) => {
        const medalha = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "▸"
        txt += medalha + " @" + p.num + "\n💰 *" + fmt(p.moedas) + "* | 🎖️ Nv " + p.nivel + "\n\n"
      })
      await sock.sendMessage(jid, { text: txt, mentions: top.map(p => mJid(p.num)) }, { quoted: msg })
    }},

    afk: { aliases: ["ausente"], async executar({ sock, msg, args, db, utils, sender }) {
      const jid = msg.key.remoteJid
      if (!jid.endsWith("@g.us")) return sock.sendMessage(jid, { text: "⚡💤 Só em grupos!" }, { quoted: msg })
      const num = await resolverNumero(sock, jid, sender) || utils.soNumero(sender)
      const motivo = args.join(" ").trim() || "Sem motivo"
      const afks = db.afk()
      afks[jid] = afks[jid] || {}
      afks[jid][sender] = { desde: Date.now(), motivo }
      afks[jid][mJid(num)] = { desde: Date.now(), motivo }
      db.salvarAfk(afks)
      await sock.sendMessage(jid, { text: "⚡💤 *AFK ATIVADO*\n\n👤 @" + num + "\n📝 *" + motivo + "*", mentions: [mJid(num)] }, { quoted: msg })
    }},

    mito: { aliases: ["mitos", "fato", "espaco"], async executar({ sock, msg, db, isDono, isSubDono }) {
      const jid = msg.key.remoteJid
      const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
      if (!ehVip(db, sJ[0] || msg.key.remoteJid, isDono, isSubDono)) return sock.sendMessage(jid, { text: "⚡ Só nobres!" }, { quoted: msg })
      const f = MITOS[Math.floor(Math.random() * MITOS.length)]
      const uN = msg.key.participant || jid
      const h = new Date().toLocaleTimeString("pt-BR")
      await sock.sendMessage(jid, { text: "⚡🌌 *FATO*\n\n🛸 _" + f + "_\n\n👤 @" + soNumero(uN) + "\n⏰ " + h, mentions: [uN] }, { quoted: msg })
    }},

    napoleao: { async executar({ sock, msg, db, isDono, isSubDono }) {
      const jid = msg.key.remoteJid
      const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
      if (!ehVip(db, sJ[0] || msg.key.remoteJid, isDono, isSubDono)) return sock.sendMessage(jid, { text: "⚡ Só nobres!" }, { quoted: msg })
      const f = NAPOLEAO[Math.floor(Math.random() * NAPOLEAO.length)]
      const uN = msg.key.participant || jid
      const h = new Date().toLocaleTimeString("pt-BR")
      await sock.sendMessage(jid, { text: "⚡⚔️ *NAPOLEÃO*\n\n🔥 _" + f + "_\n\n👤 @" + soNumero(uN) + "\n⏰ " + h, mentions: [uN] }, { quoted: msg })
    }},

    fraseprofunda: { aliases: ["frase", "motivacao"], async executar({ sock, msg, db, isDono, isSubDono }) {
      const jid = msg.key.remoteJid
      const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)
      if (!ehVip(db, sJ[0] || msg.key.remoteJid, isDono, isSubDono)) return sock.sendMessage(jid, { text: "⚡ Só nobres!" }, { quoted: msg })
      const f = FRASES[Math.floor(Math.random() * FRASES.length)]
      const uN = msg.key.participant || jid
      const h = new Date().toLocaleTimeString("pt-BR")
      await sock.sendMessage(jid, { text: "⚡🌙 *FRASE*\n\n💭 _" + f + "_\n\n👤 @" + soNumero(uN) + "\n⏰ " + h, mentions: [uN] }, { quoted: msg })
    }}

  }
      }
