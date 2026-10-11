/* ============================================================
   🌙 MENU FNAF - NAPOLEÃO BONAPARTE
   Five Nights at Freddy's Imperial (1 a 5)
   ============================================================ */

const fs = require("fs")
const path = require("path")

const ROOT = path.join(__dirname, "..", "..")
const DATA_DIR = path.join(ROOT, "data")
const FOTO_DIR = path.join(DATA_DIR, "fnaf-assets")

for (const dir of [DATA_DIR, FOTO_DIR]) {
  if (!fs.existsSync(dir)) {
    try { fs.mkdirSync(dir, { recursive: true }) } catch (_) {}
  }
}

function lerFoto(nome) {
  try {
    const p = path.join(FOTO_DIR, nome)
    if (!fs.existsSync(p)) return null
    return fs.readFileSync(p)
  } catch (_) { return null }
}

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

const sleep = (ms) => new Promise(r => setTimeout(r, ms))
const nJid = (j) => String(j).split("@")[0].split(":")[0].replace(/\D/g, "")
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

// ============================================================
// 🖼️ URLs PÚBLICAS (GitHub raw)
// ============================================================
const GH = "https://raw.githubusercontent.com/Amnottu/FNAF-Assets/main/"

const FOTOS_URL = {
  // 🎮 FNAF 1
  "freddy":  GH + "FNAF1/Freddy.png",
  "bonnie":  GH + "FNAF1/Bonnie.png",
  "chica":   GH + "FNAF1/Chica.png",
  "foxy":    GH + "FNAF1/Foxy.png",
  "golden":  GH + "FNAF1/GoldenFreddy.png",
  // 🎮 FNAF 2
  "toyfreddy":  GH + "FNAF2/ToyFreddy.png",
  "toybonnie":  GH + "FNAF2/ToyBonnie.png",
  "toychica":   GH + "FNAF2/ToyChica.png",
  "bb":         GH + "FNAF2/BalloonBoy.png",
  "mangle":     GH + "FNAF2/Mangle.png",
  "puppet":     GH + "FNAF2/Puppet.png",
  "witheredfreddy":  GH + "FNAF2/WitheredFreddy.png",
  "witheredbonnie":  GH + "FNAF2/WitheredBonnie.png",
  // 🎮 FNAF 3
  "springtrap":     GH + "FNAF3/Springtrap.png",
  "phantomfreddy":  GH + "FNAF3/PhantomFreddy.png",
  // 🎮 FNAF 4
  "nightmarefreddy":   GH + "FNAF4/NightmareFreddy.png",
  "nightmarebonnie":   GH + "FNAF4/NightmareBonnie.png",
  "nightmarechica":    GH + "FNAF4/NightmareChica.png",
  "nightmarefoxy":     GH + "FNAF4/NightmareFoxy.png",
  "nightmarefredbear": GH + "FNAF4/NightmareFredbear.png",
  // 🎮 FNAF 5
  "circusbaby":    GH + "FNAFSL/CircusBaby.png",
  "ballora":       GH + "FNAFSL/Ballora.png",
  "funtimefreddy": GH + "FNAFSL/FuntimeFreddy.png",
  "funtimefoxy":   GH + "FNAFSL/FuntimeFoxy.png",
  "ennard":        GH + "FNAFSL/Ennard.png"
}

// ============================================================
// 🎮 ANIMATRÔNICOS POR JOGO
// ============================================================
const ANIMATRONICOS = {
  "1": [
    { id: "freddy", nome: "Freddy Fazbear", emoji: "🐻", arquivo: "freddy.png", acao: "fecharporta", dica: "🚪 FECHE A PORTA" },
    { id: "bonnie", nome: "Bonnie",          emoji: "🐰", arquivo: "bonnie.png", acao: "portaluz",    dica: "💡 LIGUE A LUZ" },
    { id: "chica",  nome: "Chica",           emoji: "🐔", arquivo: "chica.png",  acao: "fecharporta", dica: "🚪 FECHE A PORTA" },
    { id: "foxy",   nome: "Foxy",            emoji: "🦊", arquivo: "foxy.png",   acao: "portaluz",    dica: "💡 LIGUE A LUZ" },
    { id: "golden", nome: "Golden Freddy",   emoji: "👑", arquivo: "golden.png", acao: "aleatorio",   dica: "⚠️ REAJA RÁPIDO" }
  ],
  "2": [
    { id: "toyfreddy", nome: "Toy Freddy", emoji: "🧸", arquivo: "toyfreddy.png", acao: "fecharporta", dica: "🚪 FECHE A PORTA" },
    { id: "toybonnie", nome: "Toy Bonnie", emoji: "🧸", arquivo: "toybonnie.png", acao: "portaluz",    dica: "💡 LIGUE A LUZ" },
    { id: "toychica",  nome: "Toy Chica",  emoji: "🧸", arquivo: "toychica.png",  acao: "fecharporta", dica: "🚪 FECHE A PORTA" },
    { id: "bb",        nome: "Balloon Boy", emoji: "🎈", arquivo: "bb.png",       acao: "portaluz",    dica: "💡 LIGUE A LUZ" },
    { id: "mangle",    nome: "Mangle",     emoji: "🦊", arquivo: "mangle.png",    acao: "fecharporta", dica: "🚪 FECHE A PORTA" },
    { id: "puppet",    nome: "The Puppet", emoji: "👤", arquivo: "puppet.png",    acao: "aleatorio",   dica: "⚠️ REAJA RÁPIDO" },
    { id: "witheredfreddy", nome: "Withered Freddy", emoji: "🐻", arquivo: "witheredfreddy.png", acao: "fecharporta", dica: "🚪 FECHE A PORTA" },
    { id: "witheredbonnie", nome: "Withered Bonnie", emoji: "🐰", arquivo: "witheredbonnie.png", acao: "portaluz",    dica: "💡 LIGUE A LUZ" }
  ],
  "3": [
    { id: "springtrap",    nome: "Springtrap",     emoji: "🐰", arquivo: "springtrap.png",    acao: "aleatorio",   dica: "⚠️ CUIDADO" },
    { id: "phantomfreddy", nome: "Phantom Freddy", emoji: "👻", arquivo: "phantomfreddy.png", acao: "portaluz",    dica: "💡 LIGUE A LUZ" }
  ],
  "4": [
    { id: "nightmarefreddy",   nome: "Nightmare Freddy",   emoji: "😱", arquivo: "nightmarefreddy.png",   acao: "fecharporta", dica: "🚪 FECHE A PORTA" },
    { id: "nightmarebonnie",   nome: "Nightmare Bonnie",   emoji: "😱", arquivo: "nightmarebonnie.png",   acao: "portaluz",    dica: "💡 LIGUE A LUZ" },
    { id: "nightmarechica",    nome: "Nightmare Chica",    emoji: "😱", arquivo: "nightmarechica.png",    acao: "fecharporta", dica: "🚪 FECHE A PORTA" },
    { id: "nightmarefoxy",     nome: "Nightmare Foxy",     emoji: "😱", arquivo: "nightmarefoxy.png",     acao: "portaluz",    dica: "💡 LIGUE A LUZ" },
    { id: "nightmarefredbear", nome: "Nightmare Fredbear", emoji: "👑", arquivo: "nightmarefredbear.png", acao: "aleatorio",   dica: "⚠️ REAJA RÁPIDO" }
  ],
  "5": [
    { id: "circusbaby",    nome: "Circus Baby",     emoji: "🤖", arquivo: "circusbaby.png",    acao: "fecharporta", dica: "🚪 FECHE A PORTA" },
    { id: "ballora",       nome: "Ballora",         emoji: "🩰", arquivo: "ballora.png",       acao: "portaluz",    dica: "💡 LIGUE A LUZ" },
    { id: "funtimefreddy", nome: "Funtime Freddy",  emoji: "🐻", arquivo: "funtimefreddy.png", acao: "fecharporta", dica: "🚪 FECHE A PORTA" },
    { id: "funtimefoxy",   nome: "Funtime Foxy",    emoji: "🦊", arquivo: "funtimefoxy.png",   acao: "portaluz",    dica: "💡 LIGUE A LUZ" },
    { id: "ennard",        nome: "Ennard",          emoji: "🧬", arquivo: "ennard.png",        acao: "aleatorio",   dica: "⚠️ CUIDADO" }
  ]
}

// ============================================================
// 🌙 CONFIG DAS NOITES
// ============================================================
const NOITES = {
  "1": [
    { noite: 1, intervalos: [25, 35], vidas: 3, duracao: 180000, qtd: 1 },
    { noite: 2, intervalos: [22, 30], vidas: 3, duracao: 180000, qtd: 1 },
    { noite: 3, intervalos: [18, 28], vidas: 3, duracao: 180000, qtd: 2 },
    { noite: 4, intervalos: [16, 24], vidas: 2, duracao: 180000, qtd: 2 },
    { noite: 5, intervalos: [14, 22], vidas: 2, duracao: 180000, qtd: 3 },
    { noite: 6, intervalos: [12, 20], vidas: 1, duracao: 180000, qtd: 3 }
  ],
  "2": [
    { noite: 1, intervalos: [22, 32], vidas: 3, duracao: 180000, qtd: 2 },
    { noite: 2, intervalos: [20, 28], vidas: 3, duracao: 180000, qtd: 2 },
    { noite: 3, intervalos: [17, 25], vidas: 3, duracao: 180000, qtd: 3 },
    { noite: 4, intervalos: [15, 22], vidas: 2, duracao: 180000, qtd: 3 },
    { noite: 5, intervalos: [13, 20], vidas: 2, duracao: 180000, qtd: 4 },
    { noite: 6, intervalos: [11, 18], vidas: 1, duracao: 180000, qtd: 4 }
  ],
  "3": [
    { noite: 1, intervalos: [25, 35], vidas: 3, duracao: 180000, qtd: 1 },
    { noite: 2, intervalos: [20, 28], vidas: 3, duracao: 180000, qtd: 1 },
    { noite: 3, intervalos: [16, 24], vidas: 2, duracao: 180000, qtd: 2 },
    { noite: 4, intervalos: [13, 20], vidas: 2, duracao: 180000, qtd: 2 },
    { noite: 5, intervalos: [11, 17], vidas: 1, duracao: 180000, qtd: 3 },
    { noite: 6, intervalos: [9, 15],  vidas: 1, duracao: 180000, qtd: 3 }
  ],
  "4": [
    { noite: 1, intervalos: [22, 30], vidas: 3, duracao: 180000, qtd: 2 },
    { noite: 2, intervalos: [18, 26], vidas: 3, duracao: 180000, qtd: 2 },
    { noite: 3, intervalos: [15, 22], vidas: 2, duracao: 180000, qtd: 3 },
    { noite: 4, intervalos: [12, 18], vidas: 2, duracao: 180000, qtd: 3 },
    { noite: 5, intervalos: [10, 16], vidas: 1, duracao: 180000, qtd: 4 },
    { noite: 6, intervalos: [8, 13],  vidas: 1, duracao: 180000, qtd: 4 }
  ],
  "5": [
    { noite: 1, intervalos: [22, 30], vidas: 3, duracao: 180000, qtd: 2 },
    { noite: 2, intervalos: [18, 26], vidas: 3, duracao: 180000, qtd: 2 },
    { noite: 3, intervalos: [15, 22], vidas: 2, duracao: 180000, qtd: 3 },
    { noite: 4, intervalos: [12, 18], vidas: 2, duracao: 180000, qtd: 3 },
    { noite: 5, intervalos: [10, 16], vidas: 1, duracao: 180000, qtd: 4 },
    { noite: 6, intervalos: [8, 13],  vidas: 1, duracao: 180000, qtd: 4 }
  ]
}

const HORARIOS = ["12:00 AM", "01:00 AM", "02:00 AM", "03:00 AM", "04:00 AM", "05:00 AM"]

const NOMES_JOGOS = {
  "1": "FNAF 1 - Freddy Fazbear's Pizza",
  "2": "FNAF 2 - Grand Reopening",
  "3": "FNAF 3 - Fazbear's Fright",
  "4": "FNAF 4 - The Final Chapter",
  "5": "FNAF SL - Sister Location"
}

// ============================================================
// 🎮 ESTADO DAS PARTIDAS
// ============================================================
const partidas = {}

function fecharPartida(jid) {
  const p = partidas[jid]
  if (!p) return
  if (p.timer) clearTimeout(p.timer)
  if (p.timerSpawn) clearInterval(p.timerSpawn)
  if (p.timerHora) clearInterval(p.timerHora)
  delete partidas[jid]
}

function formatarVidas(v) {
  return "❤️".repeat(v) + "🖤".repeat(Math.max(0, 3 - v))
}

// ============================================================
// 🎨 RENDERIZADORES
// ============================================================
function renderLobby(jid) {
  const p = partidas[jid]
  if (!p) return ""
  const lista = p.jogadores.map((j, i) => {
    const status = j.morto ? "💀" : "🟢"
    return status + " " + (i + 1) + ". @" + nJid(j.jid)
  }).join("\n")

  return `╔══════════════════════════════╗
║   🎩 𝐅𝐍𝐀𝐅 𝐈𝐌𝐏𝐄𝐑𝐈𝐀𝐋 🌙
║   🎮 ${NOMES_JOGOS[p.jogo]}
║   🌃 NOITE ${p.noite}/6
╚══════════════════════════════╝

🎩 *Napoleão convoca a tropa:*
🦅 *sobrevivam até às 6h!*

━━━━━━━━━━━━━━━━━━━━━━━━━
👥 *JOGADORES (${p.jogadores.length}/5)*
${lista || "_ninguém ainda_"}
━━━━━━━━━━━━━━━━━━━━━━━━━

🎮 Use:
▸ !entrarfnaf  — entrar
▸ !iniciarfnaf — começar
▸ !sairfnaf    — sair

🦅 _"Uma noite longa nos espera."_`
}

function renderAtaque(jogador, anim, porta) {
  return `🚨 *ATENÇÃO* @${nJid(jogador.jid)}!

${anim.emoji} *${anim.nome}* na *PORTA ${porta}*!
${anim.dica} ${porta}

⏰ *9 SEGUNDOS* pra reagir!
👉 Use: *!${anim.acao} ${porta}*`
}

// ============================================================
// 🖼️ ENVIAR ATAQUE (foto local → URL → texto)
// ============================================================
async function enviarAtaque(sock, jid, jog, anim, porta) {
  const legenda = renderAtaque(jog, anim, porta)
  const fotoLocal = lerFoto(anim.arquivo)
  const urlRemota = FOTOS_URL[anim.id]

  if (fotoLocal) {
    try {
      await sock.sendMessage(jid, {
        image: fotoLocal,
        caption: legenda,
        mentions: [jog.jid]
      })
      return
    } catch (e) {
      console.log("⚠️ erro foto local:", e.message)
    }
  }

  if (urlRemota) {
    try {
      await sock.sendMessage(jid, {
        image: { url: urlRemota },
        caption: legenda,
        mentions: [jog.jid]
      })
      return
    } catch (e) {
      console.log("⚠️ erro foto remota:", e.message)
    }
  }

  // fallback: só texto
  try {
    await sock.sendMessage(jid, {
      text: legenda,
      mentions: [jog.jid]
    })
  } catch (_) {}
}

// ============================================================
// 🌙 LOOP PRINCIPAL (CORRIGIDO)
// ============================================================
async function rodarPartida(sock, jid) {
  const p = partidas[jid]
  if (!p) return

  const cfg = NOITES[p.jogo][p.noite - 1]
  const animLista = ANIMATRONICOS[p.jogo]
  const totalHoras = 6
  const intervaloHora = cfg.duracao / totalHoras
  let horaIdx = 0

  p.horaAtual = HORARIOS[0]
  p.fimEm = Date.now() + cfg.duracao
  p.ataquesTotal = 0
  p.fase = "rodando"

  // ⏰ UPDATE DE HORA
  p.timerHora = setInterval(async () => {
    const p2 = partidas[jid]
    if (!p2 || p2.fase !== "rodando") return
    horaIdx++
    if (horaIdx >= HORARIOS.length) return
    p2.horaAtual = HORARIOS[horaIdx]
    try {
      await sock.sendMessage(jid, {
        text: `🕐 *${HORARIOS[horaIdx]}* — ${horaIdx + 1}h se passou...\n🚨 Atenção redobrada, soldados!`
      })
    } catch (_) {}
  }, intervaloHora)

  // 🎲 ATAQUES
  const intervalo = rnd(cfg.intervalos[0], cfg.intervalos[1]) * 1000
  p.timerSpawn = setInterval(async () => {
    const p2 = partidas[jid]
    if (!p2 || p2.fase !== "rodando") return

    const vivos = p2.jogadores.filter(j => !j.morto)
    if (vivos.length === 0) return

    for (const jog of vivos) {
      if (jog.morto) continue
      if (jog.ataqueAtual && !jog.ataqueAtual.resolvido) continue

      // 🎲 60% de chance de ser atacado
      if (Math.random() > 0.6) continue

      const animBase = animLista[rnd(0, animLista.length - 1)]
      const porta = rnd(1, 2)
      const acaoNecessaria = animBase.acao === "aleatorio"
        ? (Math.random() < 0.5 ? "fecharporta" : "portaluz")
        : animBase.acao
      const anim = Object.assign({}, animBase, { acao: acaoNecessaria })

      // 🎯 SÓ marca ataque se realmente for atacar
      const atk = { anim: anim, porta: porta, expira: Date.now() + 9000, resolvido: false }
      jog.ataqueAtual = atk
      p2.ataquesTotal++

      // 📤 envia
      enviarAtaque(sock, jid, jog, anim, porta).catch(() => {})

      // ⏰ timeout individual
      setTimeout(async () => {
        const p3 = partidas[jid]
        if (!p3 || p3.fase !== "rodando") return
        const j3 = p3.jogadores.find(x => x.jid === jog.jid)
        if (!j3 || j3.morto) return

        // ✅ SÓ tira vida se for o MESMO ataque que ficou pendente
        if (j3.ataqueAtual && j3.ataqueAtual === atk && !j3.ataqueAtual.resolvido && Date.now() >= j3.ataqueAtual.expira) {
          j3.ataqueAtual = null
          j3.vidas--
          if (j3.vidas <= 0) {
            j3.morto = true
            await sock.sendMessage(jid, {
              text: `💀 @${nJid(j3.jid)} *FOI PEGO!*\n${anim.emoji} O animatrônico chegou...\n\n❌ *ELIMINADO!*`,
              mentions: [j3.jid]
            })
          } else {
            await sock.sendMessage(jid, {
              text: `⏰ @${nJid(j3.jid)} *não reagiu a tempo!*\n💔 Perdeu 1 vida — ${formatarVidas(j3.vidas)}`,
              mentions: [j3.jid]
            })
          }
          const p4 = partidas[jid]
          if (p4 && p4.jogadores.every(j => j.morto)) {
            await finalizarPartida(sock, jid, false)
          }
        }
      }, 9300)
    }
  }, intervalo)

  p.timer = setTimeout(async () => {
    await finalizarPartida(sock, jid, true)
  }, cfg.duracao + 500)
}

// ============================================================
// 🏆 FINALIZAR
// ============================================================
async function finalizarPartida(sock, jid, sobreviveu) {
  const p = partidas[jid]
  if (!p) return

  if (p.timer) clearTimeout(p.timer)
  if (p.timerSpawn) clearInterval(p.timerSpawn)
  if (p.timerHora) clearInterval(p.timerHora)
  p.fase = "finalizada"

  const vivos = p.jogadores.filter(j => !j.morto)
  const mortos = p.jogadores.filter(j => j.morto)

  if (sobreviveu && vivos.length > 0) {
    const premio = 500 + (p.noite * 100) + (parseInt(p.jogo) * 150)
    const rpg = dbLer("rpg.json", { usuarios: {} })
    rpg.usuarios = rpg.usuarios || {}
    for (const j of vivos) {
      const num = nJid(j.jid)
      rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 }
      rpg.usuarios[num].moedas = (rpg.usuarios[num].moedas || 0) + premio
    }
    dbSalvar("rpg.json", rpg)

    let txt = `╔══════════════════════════════╗
║   🌅 𝐒𝐎𝐁𝐑𝐄𝐕𝐈𝐕𝐄𝐑𝐀𝐌! ☀️
║   🕕 6:00 AM — ${NOMES_JOGOS[p.jogo]}
║   🌃 NOITE ${p.noite}
╚══════════════════════════════╝

🎩 *Napoleão aplaude:*
🦅 *os soldados resistiram!*

━━━━━━━━━━━━━━━━━━━━━━━━━
🏆 *SOBREVIVENTES:*
${vivos.map(j => `⚔️ @${nJid(j.jid)} — ${formatarVidas(j.vidas)}`).join("\n")}
${mortos.length ? `\n💀 *CAÍDOS:*\n${mortos.map(j => `⚰️ @${nJid(j.jid)}`).join("\n")}` : ""}
━━━━━━━━━━━━━━━━━━━━━━━━━
💰 *Prêmio:* +${premio} gold cada
🚨 Ataques: *${p.ataquesTotal}*

🎩 _"Uma noite vencida, soldados!"_
🦅 _"Descansem... a próxima será pior."_`

    await sock.sendMessage(jid, {
      text: txt,
      mentions: vivos.map(j => j.jid).concat(mortos.map(j => j.jid))
    })

    if (p.noite < 6 && vivos.length > 0) {
      await sleep(5000)
      const p2 = partidas[jid]
      if (!p2) return
      p2.noite++
      p2.jogadores = vivos.map(j => ({
        jid: j.jid,
        vidas: NOITES[p2.jogo][p2.noite - 1].vidas,
        morto: false,
        ataqueAtual: null
      }))
      p2.ataquesTotal = 0
      p2.fase = "preparando"
      delete p2.timer
      delete p2.timerSpawn
      delete p2.timerHora

      await sock.sendMessage(jid, {
        text: `🌙 *NOITE ${p2.noite} COMEÇA EM 5 SEGUNDOS!*\n\nPreparem-se, soldados... 👁️`
      })
      await sleep(5000)
      await rodarPartida(sock, jid)
    } else {
      if (p.noite === 6) {
        await sock.sendMessage(jid, {
          text: `🎩👑 *TODAS AS 6 NOITES VENCIDAS!* 👑🎩\n🎮 ${NOMES_JOGOS[p.jogo]}\n\n🦅 Vocês são lendas do império!\n🎩 _"Napoleão se curva."_"`
        })
      }
      fecharPartida(jid)
    }
  } else {
    let txt = `╔══════════════════════════════╗
║   💀 𝐓𝐎𝐃𝐎𝐒 𝐂𝐀Í𝐑𝐀𝐌 💀
║   🎮 ${NOMES_JOGOS[p.jogo]}
║   🌃 NOITE ${p.noite}
╚══════════════════════════════╝

🎩 *Napoleão lamenta:*
🦅 *a noite foi fatal...*

━━━━━━━━━━━━━━━━━━━━━━━━━
${p.jogadores.map(j => `⚰️ @${nJid(j.jid)}`).join("\n")}
━━━━━━━━━━━━━━━━━━━━━━━━━

🎩 _"Os animatrônicos venceram."_
👁️ _"Mas amanhã... a tropa volta."_`

    await sock.sendMessage(jid, {
      text: txt,
      mentions: p.jogadores.map(j => j.jid)
    })
    fecharPartida(jid)
  }
}

// ============================================================
// 🎯 VIP
// ============================================================
function ehVipOuDono(db, utils, sender, isDono, isSubDono) {
  if (isDono || isSubDono) return true
  const vips = (db.vips() || {}).vips || {}
  const numUser = utils.soNumero(sender)
  for (const [jidVip, info] of Object.entries(vips)) {
    if (utils.soNumero(jidVip) === numUser && (info.expira === "inf" || info.expira > Date.now())) {
      return true
    }
  }
  return false
}

// ============================================================
// 📦 MODULE
// ============================================================
module.exports = {
  menu: "menu-fnaf",
  grupoOnly: false,
  adminOnly: false,
  donoOnly: false,

  commands: {

    abrirfnaf: {
      aliases: ["fnaf", "fnaflobby", "abrirfnaf1"],
      grupoOnly: true,
      async executar({ sock, msg, args, db, utils, sender, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        if (!ehVipOuDono(db, utils, sender, isDono, isSubDono)) {
          return sock.sendMessage(jid, { text: `🎩💢 Só nobres podem abrir o FNAF!` }, { quoted: msg })
        }
        if (partidas[jid]) return sock.sendMessage(jid, { text: `🎩💢 Já tem uma partida rolando!` }, { quoted: msg })

        let jogo = parseInt(args[0]) || 1
        if (jogo < 1 || jogo > 5) jogo = 1
        jogo = String(jogo)

        partidas[jid] = {
          fase: "lobby",
          jogo: jogo,
          noite: 1,
          jogadores: [{ jid: sender, vidas: NOITES[jogo][0].vidas, morto: false, ataqueAtual: null }],
          ataquesTotal: 0,
          criadoEm: Date.now()
        }

        await sock.sendMessage(jid, {
          text: renderLobby(jid) + `\n\n👥 *@${utils.soNumero(sender)}* abriu o lobby!\n🎮 Jogo: *${NOMES_JOGOS[jogo]}*\n👉 Usem *!entrarfnaf*`
        }, { quoted: msg })
      }
    },

    entrarfnaf: {
      aliases: ["joinfnaf", "entrarfnaf1"],
      grupoOnly: true,
      async executar({ sock, msg, utils, sender }) {
        const jid = msg.key.remoteJid
        const p = partidas[jid]
        if (!p) return sock.sendMessage(jid, { text: `🎩💢 Nenhum lobby aberto! Use *!abrirfnaf*` }, { quoted: msg })
        if (p.fase !== "lobby") return sock.sendMessage(jid, { text: `🎩💢 Partida já começou!` }, { quoted: msg })
        if (p.jogadores.length >= 5) return sock.sendMessage(jid, { text: `🎩💢 Lobby cheio (5/5)!` }, { quoted: msg })
        if (p.jogadores.some(j => j.jid === sender)) return sock.sendMessage(jid, { text: `🎩💢 Você já tá no lobby!` }, { quoted: msg })

        p.jogadores.push({ jid: sender, vidas: NOITES[p.jogo][0].vidas, morto: false, ataqueAtual: null })

        await sock.sendMessage(jid, {
          text: `🎩 @${utils.soNumero(sender)} entrou no lobby!\n\n${renderLobby(jid)}`
        }, { quoted: msg })
      }
    },

    sairfnaf: {
      aliases: ["quitfnaf", "sairfnaf1"],
      grupoOnly: true,
      async executar({ sock, msg, utils, sender }) {
        const jid = msg.key.remoteJid
        const p = partidas[jid]
        if (!p) return sock.sendMessage(jid, { text: `🎩💢 Sem partida ativa!` }, { quoted: msg })

        const idx = p.jogadores.findIndex(j => j.jid === sender)
        if (idx === -1) return sock.sendMessage(jid, { text: `🎩💢 Você não tá participando!` }, { quoted: msg })

        p.jogadores.splice(idx, 1)

        if (p.jogadores.length === 0) {
          fecharPartida(jid)
          return sock.sendMessage(jid, { text: `🎩 Todos saíram — partida cancelada!` }, { quoted: msg })
        }

        await sock.sendMessage(jid, {
          text: `🎩 @${utils.soNumero(sender)} saiu!\n\n${renderLobby(jid)}`
        }, { quoted: msg })
      }
    },

    iniciarfnaf: {
      aliases: ["startfnaf", "iniciarfnaf1"],
      grupoOnly: true,
      async executar({ sock, msg, args, utils, sender, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const p = partidas[jid]
        if (!p) return sock.sendMessage(jid, { text: `🎩💢 Nenhum lobby aberto! Use *!abrirfnaf 1/2/3/4/5*` }, { quoted: msg })
        if (p.fase !== "lobby") return sock.sendMessage(jid, { text: `🎩💢 Partida já começou!` }, { quoted: msg })
        if (p.jogadores.length < 1) return sock.sendMessage(jid, { text: `🎩💢 Precisa de 1+ jogador!` }, { quoted: msg })

        if (args[0]) {
          let novoJogo = parseInt(args[0])
          if (novoJogo >= 1 && novoJogo <= 5) p.jogo = String(novoJogo)
        }

        const criador = p.jogadores[0].jid
        if (criador !== sender && !isDono && !isSubDono) {
          return sock.sendMessage(jid, { text: `🎩💢 Só quem abriu o lobby pode iniciar!` }, { quoted: msg })
        }

        await sock.sendMessage(jid, {
          text: `🎩 *FNAF INICIADO!* 🦅\n\n🎮 *${NOMES_JOGOS[p.jogo]}*\n🌃 *NOITE 1* — 3 minutos\n❤️ Vidas: ${NOITES[p.jogo][0].vidas}\n👥 Jogadores: ${p.jogadores.length}\n\n⚔️ *Sobrevivam até às 6h!*`
        }, { quoted: msg })

        await sleep(3000)
        await rodarPartida(sock, jid)
      }
    },

    fecharporta: {
      aliases: ["closeporta", "fecharporta1"],
      grupoOnly: true,
      async executar({ sock, msg, args, utils, sender }) {
        const jid = msg.key.remoteJid
        const p = partidas[jid]
        if (!p || p.fase !== "rodando") return sock.sendMessage(jid, { text: `🎩💢 Sem partida rodando!` }, { quoted: msg })

        const porta = parseInt(args[0])
        if (!porta || ![1, 2].includes(porta)) return sock.sendMessage(jid, { text: `🎩 Use: *!fecharporta 1* ou *!fecharporta 2*` }, { quoted: msg })

        const jog = p.jogadores.find(j => j.jid === sender)
        if (!jog || jog.morto) return
        const atk = jog.ataqueAtual
        if (!atk || atk.resolvido) return

        if (atk.anim.acao === "fecharporta" && atk.porta === porta && Date.now() < atk.expira) {
          atk.resolvido = true
          jog.ataqueAtual = null
          await sock.sendMessage(jid, {
            text: `✅ @${utils.soNumero(jog.jid)} *fechou a porta ${porta} a tempo!*\n🛡️ Sobreviveu — ${formatarVidas(jog.vidas)}`,
            mentions: [jog.jid]
          }, { quoted: msg })
        } else if (atk.anim.acao !== "fecharporta") {
          atk.resolvido = true
          jog.ataqueAtual = null
          jog.vidas--
          if (jog.vidas <= 0) {
            jog.morto = true
            await sock.sendMessage(jid, {
              text: `💀 @${utils.soNumero(jog.jid)} *ação errada!*\n${atk.anim.emoji} ${atk.anim.nome} te pegou!\n\n❌ *ELIMINADO!*`,
              mentions: [jog.jid]
            }, { quoted: msg })
          } else {
            await sock.sendMessage(jid, {
              text: `❌ @${utils.soNumero(jog.jid)} *ação errada!*\nEra pra ${atk.anim.dica.toLowerCase()}!\n💔 -1 vida — ${formatarVidas(jog.vidas)}`,
              mentions: [jog.jid]
            }, { quoted: msg })
          }
          if (p.jogadores.every(j => j.morto)) await finalizarPartida(sock, jid, false)
        }
      }
    },

    portaluz: {
      aliases: ["luzporta", "portaluz1"],
      grupoOnly: true,
      async executar({ sock, msg, args, utils, sender }) {
        const jid = msg.key.remoteJid
        const p = partidas[jid]
        if (!p || p.fase !== "rodando") return sock.sendMessage(jid, { text: `🎩💢 Sem partida rodando!` }, { quoted: msg })

        const porta = parseInt(args[0])
        if (!porta || ![1, 2].includes(porta)) return sock.sendMessage(jid, { text: `🎩 Use: *!portaluz 1* ou *!portaluz 2*` }, { quoted: msg })

        const jog = p.jogadores.find(j => j.jid === sender)
        if (!jog || jog.morto) return
        const atk = jog.ataqueAtual
        if (!atk || atk.resolvido) return

        if (atk.anim.acao === "portaluz" && atk.porta === porta && Date.now() < atk.expira) {
          atk.resolvido = true
          jog.ataqueAtual = null
          await sock.sendMessage(jid, {
            text: `✅ @${utils.soNumero(jog.jid)} *ligou a luz da porta ${porta} a tempo!*\n🛡️ Sobreviveu — ${formatarVidas(jog.vidas)}`,
            mentions: [jog.jid]
          }, { quoted: msg })
        } else if (atk.anim.acao !== "portaluz") {
          atk.resolvido = true
          jog.ataqueAtual = null
          jog.vidas--
          if (jog.vidas <= 0) {
            jog.morto = true
            await sock.sendMessage(jid, {
              text: `💀 @${utils.soNumero(jog.jid)} *ação errada!*\n${atk.anim.emoji} ${atk.anim.nome} te pegou!\n\n❌ *ELIMINADO!*`,
              mentions: [jog.jid]
            }, { quoted: msg })
          } else {
            await sock.sendMessage(jid, {
              text: `❌ @${utils.soNumero(jog.jid)} *ação errada!*\nEra pra ${atk.anim.dica.toLowerCase()}!\n💔 -1 vida — ${formatarVidas(jog.vidas)}`,
              mentions: [jog.jid]
            }, { quoted: msg })
          }
          if (p.jogadores.every(j => j.morto)) await finalizarPartida(sock, jid, false)
        }
      }
    },

    statusfnaf: {
      aliases: ["fnafstatus", "infofnaf"],
      grupoOnly: true,
      async executar({ sock, msg }) {
        const jid = msg.key.remoteJid
        const p = partidas[jid]
        if (!p) return sock.sendMessage(jid, { text: `🎩💢 Sem partida FNAF rolando!` }, { quoted: msg })
        if (p.fase === "lobby") {
          return sock.sendMessage(jid, { text: renderLobby(jid) }, { quoted: msg })
        }
        const lista = p.jogadores.map((j) => {
          const status = j.morto ? "💀 MORTO" : "🟢 " + formatarVidas(j.vidas)
          return "👤 @" + nJid(j.jid) + " — " + status
        }).join("\n")
        const restante = Math.max(0, Math.floor((p.fimEm - Date.now()) / 1000))
        await sock.sendMessage(jid, {
          text: `╔══════════════════════════════╗
║   🎩 𝐅𝐍𝐀𝐅 𝐈𝐌𝐏𝐄𝐑𝐈𝐀𝐋 🌙
║   🎮 ${NOMES_JOGOS[p.jogo]}
║   🕐 ${p.horaAtual} — NOITE ${p.noite}/6
╚══════════════════════════════╝

👥 *TROPA:*
${lista}

━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ Tempo restante: *${restante}s*
🚨 Ataques: *${p.ataquesTotal}*
⚔️ Vivos: *${p.jogadores.filter(j => !j.morto).length}*
━━━━━━━━━━━━━━━━━━━━━━━━━`
        }, { quoted: msg })
      }
    },

    cancelarfnaf: {
      aliases: ["fecharfnaf", "abortarfnaf"],
      grupoOnly: true,
      async executar({ sock, msg, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const p = partidas[jid]
        if (!p) return sock.sendMessage(jid, { text: `🎩💢 Sem partida FNAF rolando!` }, { quoted: msg })
        if (!isDono && !isSubDono) return sock.sendMessage(jid, { text: `🎩💢 Só nobres podem cancelar!` }, { quoted: msg })
        fecharPartida(jid)
        await sock.sendMessage(jid, { text: `🎩 FNAF cancelado!\n🦅 _"Recuem, soldados."_` }, { quoted: msg })
      }
    },

    listarfnaf: {
      aliases: ["fnafjogos", "versõesfnaf"],
      async executar({ sock, msg }) {
        const jid = msg.key.remoteJid
        const texto = `╔══════════════════════════════╗
║   🎩 𝐅𝐍𝐀𝐅 𝐈𝐌𝐏𝐄𝐑𝐈𝐀𝐋 🌙
║   🎮 JOGOS DISPONÍVEIS
╚══════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━
🎮 *1️⃣ FNAF 1*
▸ 🐻 Freddy • 🐰 Bonnie • 🐔 Chica • 🦊 Foxy • 👑 Golden

🎮 *2️⃣ FNAF 2*
▸ 🧸 Toy Freddy • 🧸 Toy Bonnie • 🧸 Toy Chica
▸ 🎈 Balloon Boy • 🦊 Mangle • 👤 Puppet
▸ 🐻 Withered Freddy • 🐰 Withered Bonnie

🎮 *3️⃣ FNAF 3*
▸ 🐰 Springtrap • 👻 Phantom Freddy

🎮 *4️⃣ FNAF 4*
▸ 😱 Nightmare Freddy • 😱 Nightmare Bonnie
▸ 😱 Nightmare Chica • 😱 Nightmare Foxy
▸ 👑 Nightmare Fredbear

🎮 *5️⃣ FNAF SL (Sister Location)*
▸ 🤖 Circus Baby • 🩰 Ballora
▸ 🐻 Funtime Freddy • 🦊 Funtime Foxy
▸ 🧬 Ennard
━━━━━━━━━━━━━━━━━━━━━━━━━

👉 Use: *!abrirfnaf <1-5>*
Ex: *!abrirfnaf 3*`

        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    }

  }
     }
