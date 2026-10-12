/* ============================================================
   🌙 MENU FNAF - KOKUSHIBO BOT MD
   ============================================================ */

const ANIMATRONICOS = [
  { id: "freddy", nome: "Freddy", emoji: "🐻" },
  { id: "bonnie", nome: "Bonnie", emoji: "🐰" },
  { id: "chica", nome: "Chica", emoji: "🐔" },
  { id: "foxy", nome: "Foxy", emoji: "🦊" }
]

const POSICOES = ["salao", "corredor", "cozinha", "porta1", "porta2"]
const POSICAO_NOME = {
  salao: "Salão Principal",
  corredor: "Corredor",
  cozinha: "Cozinha",
  porta1: "Porta Esquerda",
  porta2: "Porta Direita"
}

const NOITES = [
  { noite: 1, animatronicos: 1, velocidade: 12000, velocidadeEnergia: 800, chanceFicar: 0.15 },
  { noite: 2, animatronicos: 2, velocidade: 10000, velocidadeEnergia: 900, chanceFicar: 0.20 },
  { noite: 3, animatronicos: 3, velocidade: 8500, velocidadeEnergia: 1000, chanceFicar: 0.25 },
  { noite: 4, animatronicos: 4, velocidade: 7000, velocidadeEnergia: 1100, chanceFicar: 0.30 },
  { noite: 5, animatronicos: 4, velocidade: 5500, velocidadeEnergia: 1200, chanceFicar: 0.35 }
]

// Lobbys em memória
const lobbys = new Map()  // jid → { criador, jogadores: [], aberto: true }
// Jogos ativos em memória
const jogosAtivos = new Map()  // jid → { ... }

function renderStatus(jogo) {
  const tempoRestante = Math.max(0, Math.ceil((jogo.fimEm - Date.now()) / 1000))
  const min = Math.floor(tempoRestante / 60)
  const seg = tempoRestante % 60
  const tempoTxt = String(min).padStart(2, "0") + ":" + String(seg).padStart(2, "0")

  const energiaBarra = (() => {
    const c = Math.max(0, Math.min(10, Math.round(jogo.energia / 10)))
    return "🟪".repeat(c) + "⬛".repeat(10 - c)
  })()

  let txt = "╔══════════════════════════════╗\n" +
    "║  🌙 𝐅𝐍𝐀𝐅 𝐋𝐔𝐍𝐀𝐑 - 𝐍𝐎𝐈𝐓𝐄 " + jogo.noite + "/5\n" +
    "╚══════════════════════════════╝\n\n" +
    "⏰ *Tempo:* " + tempoTxt + " / 04:00\n" +
    "🔋 *Energia:* " + energiaBarra + " " + Math.floor(jogo.energia) + "%\n\n" +
    "━━━━━━━━━━━━━━━━━━━━━━\n" +
    "🚪 *PORTAS*\n" +
    "▸ Porta 1 (Esq): " + (jogo.portas[0] ? "🔒 FECHADA" : "🔓 ABERTA") + "\n" +
    "▸ Porta 2 (Dir): " + (jogo.portas[1] ? "🔒 FECHADA" : "🔓 ABERTA") + "\n\n" +
    "💡 *LUZES*\n" +
    "▸ Luz 1 (Esq): " + (jogo.luzes[0] ? "🟢 LIGADA" : "⚫ APAGADA") + "\n" +
    "▸ Luz 2 (Dir): " + (jogo.luzes[1] ? "🟢 LIGADA" : "⚫ APAGADA") + "\n\n" +
    "━━━━━━━━━━━━━━━━━━━━━━\n" +
    "👁️ *AMEAÇAS VISÍVEIS:*\n"

  let temAmeaca = false
  jogo.animatronicos.forEach(a => {
    if (jogo.luzes[0] && a.posicao === "porta1") {
      txt += "🚨 " + a.emoji + " " + a.nome + " na PORTA ESQUERDA!\n"
      temAmeaca = true
    }
    if (jogo.luzes[1] && a.posicao === "porta2") {
      txt += "🚨 " + a.emoji + " " + a.nome + " na PORTA DIREITA!\n"
      temAmeaca = true
    }
  })
  if (!temAmeaca) txt += "_Sem ameaças visíveis..._\n"

  txt += "\n━━━━━━━━━━━━━━━━━━━━━━\n" +
    "🎮 *COMANDOS:*\n" +
    "▸ `!fecharporta 1/2`\n" +
    "▸ `!portaluz 1/2`\n" +
    "▸ `!cameras`\n" +
    "▸ `!statusfnaf`\n" +
    "▸ `!sairfnaf`"

  return txt
}

function renderCameras(jogo) {
  let txt = "╔══════════════════════════════╗\n" +
    "║   🎥 𝐂𝐀𝐌𝐄𝐑𝐀𝐒 - 𝐍𝐎𝐈𝐓𝐄 " + jogo.noite + "/5\n" +
    "╚══════════════════════════════╝\n\n"

  POSICOES.forEach(pos => {
    const aqui = jogo.animatronicos.filter(a => a.posicao === pos)
    if (aqui.length) {
      txt += "📹 *" + POSICAO_NOME[pos] + ":*\n"
      aqui.forEach(a => {
        txt += "   " + a.emoji + " " + a.nome + "\n"
      })
      txt += "\n"
    }
  })

  txt += "━━━━━━━━━━━━━━━━━━━━━━\n" +
    "🌙 _\"Meus 6 olhos veem tudo.\"_"

  return txt
}

async function atualizarMensagem(sock, jogo, msgEdit) {
  try {
    const texto = renderStatus(jogo)
    await sock.sendMessage(jogo.jid, { text: texto, edit: msgEdit.key })
  } catch (e) {
    console.log("Erro atualizar FNAF:", e.message)
  }
}

async function loopFnaf(sock, jogo, msgEdit) {
  if (jogo.finalizado) return

  const agora = Date.now()

  // Verifica tempo
  if (agora >= jogo.fimEm) {
    jogo.finalizado = true
    jogosAtivos.delete(jogo.jid)

    if (jogo.noite >= 5) {
      await sock.sendMessage(jogo.jid, {
        text: "╔══════════════════════════════╗\n" +
          "║  🌙🏆 𝐕𝐈𝐓𝐎́𝐑𝐈𝐀 𝐋𝐔𝐍𝐀𝐑 🏆🌙\n" +
          "╚══════════════════════════════╝\n\n" +
          "> 👁️ _\"Você sobreviveu TODAS as 5 noites...\"_\n" +
          "> _\"Impressionante, mortal.\"_\n\n" +
          "━━━━━━━━━━━━━━━━━━━━━━\n" +
          "🎖️ *TÍTULO:* Lua Superior\n" +
          "🌙 *Recompensa:* +5000 gold\n" +
          "⚔️ _\"Kokushibo te reconhece.\"_\n" +
          "━━━━━━━━━━━━━━━━━━━━━━"
      })
    } else {
      await sock.sendMessage(jogo.jid, {
        text: "╔══════════════════════════════╗\n" +
          "║  🌙✅ 𝐍𝐎𝐈𝐓𝐄 " + jogo.noite + " 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀 ✅🌙\n" +
          "╚══════════════════════════════╝\n\n" +
          "> 👁️ _\"Você sobreviveu... por enquanto.\"_\n\n" +
          "━━━━━━━━━━━━━━━━━━━━━━\n" +
          "📅 Próxima: *Noite " + (jogo.noite + 1) + "/5*\n" +
          "💡 Manda `!fnaf começar` pra continuar\n" +
          "━━━━━━━━━━━━━━━━━━━━━━"
      })
    }
    return
  }

  // Energia
  const energiaCaindo = (jogo.velocidadeEnergia / 1000) * 0.1
  let energiaExtra = 0
  if (jogo.portas[0]) energiaExtra += 0.3
  if (jogo.portas[1]) energiaExtra += 0.3
  if (jogo.luzes[0]) energiaExtra += 0.2
  if (jogo.luzes[1]) energiaExtra += 0.2

  jogo.energia -= (energiaCaindo + energiaExtra)

  if (jogo.energia <= 0) {
    jogo.finalizado = true
    jogosAtivos.delete(jogo.jid)
    await sock.sendMessage(jogo.jid, {
      text: "╔══════════════════════════════╗\n" +
        "║  🌙💀 𝐄𝐍𝐄𝐑𝐆𝐈𝐀 𝐄𝐒𝐆𝐎𝐓𝐀𝐃𝐀 💀🌙\n" +
        "╚══════════════════════════════╝\n\n" +
        "> _\"A escuridão consumiu tudo...\"_\n" +
        "> _\"Meus 6 olhos se fecharam.\"_\n\n" +
        "━━━━━━━━━━━━━━━━━━━━━━\n" +
        "❌ Você foi pego pelos animatrônicos\n" +
        "💡 Manda `!fnaf começar` pra tentar de novo\n" +
        "━━━━━━━━━━━━━━━━━━━━━━"
    })
    return
  }

  // Move animatrônicos
  for (const a of jogo.animatronicos) {
    if (a.posicao === "porta1" || a.posicao === "porta2") {
      const portaIdx = a.posicao === "porta1" ? 0 : 1
      const portaFechada = jogo.portas[portaIdx]

      if (portaFechada) {
        if (Math.random() > jogo.chanceFicar) {
          a.posicao = "corredor"
          a.tempoPorta = 0
        } else {
          a.tempoPorta = (a.tempoPorta || 0) + 1
          if (a.tempoPorta >= 3) {
            jogo.finalizado = true
            jogosAtivos.delete(jogo.jid)
            await sock.sendMessage(jogo.jid, {
              text: "╔══════════════════════════════╗\n" +
                "║  🌙💀 𝐆𝐀𝐌𝐄 𝐎𝐕𝐄𝐑 💀🌙\n" +
                "╚══════════════════════════════╝\n\n" +
                a.emoji + " *" + a.nome + "* te pegou!\n\n" +
                "> _\"Ele não se abalou...\"_\n\n" +
                "━━━━━━━━━━━━━━━━━━━━━━\n" +
                "❌ Você morreu na *Noite " + jogo.noite + "/5*\n" +
                "💡 Manda `!fnaf começar` pra tentar de novo"
            })
            return
          }
        }
      } else {
        jogo.finalizado = true
        jogosAtivos.delete(jogo.jid)
        await sock.sendMessage(jogo.jid, {
          text: "╔══════════════════════════════╗\n" +
            "║  🌙💀 𝐆𝐀𝐌𝐄 𝐎𝐕𝐄𝐑 💀🌙\n" +
            "╚══════════════════════════════╝\n\n" +
            a.emoji + " *" + a.nome + "* entrou pela porta aberta!\n\n" +
            "> _\"Ele não precisou se esforçar...\"_\n\n" +
            "━━━━━━━━━━━━━━━━━━━━━━\n" +
            "❌ Você morreu na *Noite " + jogo.noite + "/5*\n" +
            "💡 Manda `!fnaf começar` pra tentar de novo"
        })
        return
      }
    } else {
      if (Math.random() < 0.5) {
        const idx = POSICOES.indexOf(a.posicao)
        if (idx < POSICOES.length - 1) {
          a.posicao = POSICOES[idx + 1]
          if (a.posicao === "cozinha" && Math.random() < 0.5) {
            a.posicao = Math.random() < 0.5 ? "porta1" : "porta2"
          }
        }
      }
    }
  }

  await atualizarMensagem(sock, jogo, msgEdit)
  setTimeout(() => loopFnaf(sock, jogo, msgEdit), jogo.velocidadeAnim)
}

module.exports = {
  menu: "menu-fnaf",
  grupoOnly: false,
  adminOnly: false,
  donoOnly: false,

  commands: {

    // ============ MENU ============
    menufnaf: {
      aliases: ["fnafmenu", "menuf", "ajudafnaf"],
      async executar({ sock, msg, prefixoAtivo, db }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo

        const texto = "🌙👁️ *MENU FNAF LUNAR* 👁️🌙\n\n" +
          "> _\"Cinco noites... 4 minutos cada.\"_\n" +
          "> _\"Será que você sobrevive?\"_\n\n" +
          "━━━━━━━━━━━━━━━━━━━━━━\n" +
          "🎮 *LOBBY*\n" +
          "▸ `" + p + "lobbyfnaf` — cria um lobby\n" +
          "▸ `" + p + "entrarfnaf` — entra no lobby\n" +
          "▸ `" + p + "sairlobby` — sai do lobby\n" +
          "▸ `" + p + "iniciarfnaf` — inicia o jogo\n\n" +
          "━━━━━━━━━━━━━━━━━━━━━━\n" +
          "🎯 *EM JOGO*\n" +
          "▸ `" + p + "fecharporta 1/2` — fecha porta\n" +
          "▸ `" + p + "portaluz 1/2` — acende luz\n" +
          "▸ `" + p + "cameras` — vê os animatrônicos\n" +
          "▸ `" + p + "statusfnaf` — status geral\n" +
          "▸ `" + p + "sairfnaf` — abandona\n\n" +
          "━━━━━━━━━━━━━━━━━━━━━━\n" +
          "🐻 *ANIMATRÔNICOS:* 🐰🐔🦊\n\n" +
          "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
          "⚔️ _\"Meus 6 olhos veem o medo em você.\"_"

        const cfg = db.config()
        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          if (cfg.tipoMenu === "video") return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "kokushibo.mp4", gifPlayback: true, caption: texto }, { quoted: msg })
          return sock.sendMessage(jid, { image: buf, caption: texto }, { quoted: msg })
        }
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    // ============ LOBBY ============
    lobbyfnaf: {
      aliases: ["criarlobby", "lobbyfnaf", "novolobby"],
      async executar({ sock, msg, sender, utils }) {
        const jid = msg.key.remoteJid
        if (!jid.endsWith("@g.us")) return sock.sendMessage(jid, { text: "🌙 Só em grupo!" }, { quoted: msg })

        if (jogosAtivos.has(jid)) {
          return sock.sendMessage(jid, { text: "🌙⚔️ *JOGO EM ANDAMENTO*\n\n> _\"Espere a partida atual terminar.\"_" }, { quoted: msg })
        }

        if (lobbys.has(jid)) {
          return sock.sendMessage(jid, { text: "🌙👁️ *JÁ TEM LOBBY*\n\n> _\"Meus olhos veem um lobby aberto.\"_\n\n💡 Use `!entrarfnaf` pra entrar" }, { quoted: msg })
        }

        const num = utils.soNumero(sender)
        lobbys.set(jid, {
          criador: num,
          criadorJid: sender,
          jogadores: [sender],
          aberto: true,
          criadoEm: Date.now()
        })

        await sock.sendMessage(jid, {
          text: "╔══════════════════════════════╗\n" +
            "║  🌙 𝐋𝐎𝐁𝐁𝐘 𝐅𝐍𝐀𝐅 𝐂𝐑𝐈𝐀𝐃𝐎 🌙\n" +
            "╚══════════════════════════════╝\n\n" +
            "> 👁️ _\"A lua observa a chegada dos corajosos.\"_\n\n" +
            "👑 *Host:* @" + num + "\n" +
            "👥 *Jogadores:* *1/5*\n\n" +
            "━━━━━━━━━━━━━━━━━━━━━━\n" +
            "📋 *JOGADORES:*\n" +
            "▸ 1. @" + num + "\n\n" +
            "━━━━━━━━━━━━━━━━━━━━━━\n" +
            "💡 Use `!entrarfnaf` pra entrar\n" +
            "🎮 Use `!iniciarfnaf` quando todos estiverem prontos\n\n" +
            "⚔️ _Máx: 5 jogadores_",
          mentions: [sender]
        }, { quoted: msg })
      }
    },

    entrarlobby: {
      aliases: ["entrarfnaf", "entrarlobbyfnaf", "participo"],
      async executar({ sock, msg, sender, utils }) {
        const jid = msg.key.remoteJid
        if (!jid.endsWith("@g.us")) return sock.sendMessage(jid, { text: "🌙 Só em grupo!" }, { quoted: msg })

        const lobby = lobbys.get(jid)
        if (!lobby || !lobby.aberto) {
          return sock.sendMessage(jid, { text: "🌙💢 *SEM LOBBY ABERTO*\n\n> _\"Ninguém criou lobby ainda.\"_\n\n💡 Use `!lobbyfnaf`" }, { quoted: msg })
        }

        const num = utils.soNumero(sender)
        if (lobby.jogadores.some(j => utils.soNumero(j) === num)) {
          return sock.sendMessage(jid, { text: "🌙 Você já tá no lobby!" }, { quoted: msg })
        }

        if (lobby.jogadores.length >= 5) {
          return sock.sendMessage(jid, { text: "🌙💢 *LOBBY CHEIO*\n\n> _\"Máx 5 corajosos.\"_" }, { quoted: msg })
        }

        lobby.jogadores.push(sender)

        let lista = ""
        lobby.jogadores.forEach((j, i) => {
          lista += "▸ " + (i + 1) + ". @" + utils.soNumero(j) + "\n"
        })

        await sock.sendMessage(jid, {
          text: "🌙✅ *@" + num + " ENTROU!*\n\n" +
            "👥 *Jogadores:* *" + lobby.jogadores.length + "/5*\n\n" +
            "━━━━━━━━━━━━━━━━━━━━━━\n" +
            "📋 *JOGADORES:*\n" + lista + "\n" +
            "━━━━━━━━━━━━━━━━━━━━━━\n" +
            "💡 Mais alguém? `!entrarfnaf`",
          mentions: lobby.jogadores
        }, { quoted: msg })
      }
    },

    sairlobby: {
      aliases: ["sairlobbyfnaf", "abandonarlobby"],
      async executar({ sock, msg, sender, utils }) {
        const jid = msg.key.remoteJid
        const lobby = lobbys.get(jid)
        if (!lobby) return

        const num = utils.soNumero(sender)
        const idx = lobby.jogadores.findIndex(j => utils.soNumero(j) === num)
        if (idx === -1) return

        lobby.jogadores.splice(idx, 1)

        if (lobby.jogadores.length === 0) {
          lobbys.delete(jid)
          return sock.sendMessage(jid, { text: "🌙💤 *LOBBY CANCELADO*\n\n> _\"Todos saíram...\"_" }, { quoted: msg })
        }

        if (utils.soNumero(lobby.criadorJid) === num) {
          lobby.criador = utils.soNumero(lobby.jogadores[0])
          lobby.criadorJid = lobby.jogadores[0]
        }

        await sock.sendMessage(jid, {
          text: "🌙👋 *@" + num + " SAIU DO LOBBY*\n\n👥 *Jogadores:* *" + lobby.jogadores.length + "/5*",
          mentions: [sender]
        }, { quoted: msg })
      }
    },

    iniciarfnaf: {
      aliases: ["comecarfnaf", "startfnaf", "fnafcomecar"],
      async executar({ sock, msg, sender, utils }) {
        const jid = msg.key.remoteJid
        if (!jid.endsWith("@g.us")) return sock.sendMessage(jid, { text: "🌙 Só em grupo!" }, { quoted: msg })

        if (jogosAtivos.has(jid)) {
          return sock.sendMessage(jid, { text: "🌙⚔️ *JOGO EM ANDAMENTO*" }, { quoted: msg })
        }

        const lobby = lobbys.get(jid)
        if (!lobby) {
          return sock.sendMessage(jid, { text: "🌙💢 *SEM LOBBY*\n\n💡 Use `!lobbyfnaf` primeiro" }, { quoted: msg })
        }

        const num = utils.soNumero(sender)
        if (utils.soNumero(lobby.criadorJid) !== num) {
          return sock.sendMessage(jid, { text: "🌙⚔️ *SÓ O HOST*\n\n> _\"Só @" + lobby.criador + " pode iniciar.\"_\n\n💡 Host: @" + lobby.criador, mentions: [lobby.criadorJid] }, { quoted: msg })
        }

        if (lobby.jogadores.length < 1) {
          return sock.sendMessage(jid, { text: "🌙💢 *PRECISA DE PELO MENOS 1 JOGADOR*" }, { quoted: msg })
        }

        // Fecha lobby
        lobby.aberto = false
        lobbys.delete(jid)

        // Pega a noite do primeiro jogador (host)
        let noiteAtual = 1
        try {
          const fs = require("fs")
          const path = require("path")
          const progPath = path.join(__dirname, "..", "..", "data", "fnaf_progresso.json")
          if (fs.existsSync(progPath)) {
            const prog = JSON.parse(fs.readFileSync(progPath, "utf8"))
            noiteAtual = (prog[lobby.criador]?.noite) || 1
          }
        } catch (_) {}

        if (noiteAtual > 5) noiteAtual = 1

        const cfg = NOITES[noiteAtual - 1]
        const anims = [...ANIMATRONICOS].sort(() => Math.random() - 0.5).slice(0, cfg.animatronicos)

        const jogo = {
          jid,
          jogadores: lobby.jogadores,
          host: lobby.criador,
          hostJid: lobby.criadorJid,
          noite: noiteAtual,
          energia: 100,
          portas: [false, false],
          luzes: [false, false],
          animatronicos: anims.map(a => ({ ...a, posicao: "salao", tempoPorta: 0 })),
          fimEm: Date.now() + 4 * 60 * 1000,
          velocidadeAnim: cfg.velocidade,
          velocidadeEnergia: cfg.velocidadeEnergia,
          chanceFicar: cfg.chanceFicar,
          finalizado: false
        }

        jogosAtivos.set(jid, jogo)

        let lista = ""
        lobby.jogadores.forEach((j, i) => {
          lista += "▸ " + (i + 1) + ". @" + utils.soNumero(j) + "\n"
        })

        const msgInicial = "╔══════════════════════════════╗\n" +
          "║  🌙 𝐅𝐍𝐀𝐅 𝐋𝐔𝐍𝐀𝐑 - 𝐍𝐎𝐈𝐓𝐄 " + noiteAtual + "/5\n" +
          "╚══════════════════════════════╝\n\n" +
          "> 👁️ _\"A noite começa...\"_\n" +
          "> _\"Meus 6 olhos veem todos vocês.\"_\n\n" +
          "━━━━━━━━━━━━━━━━━━━━━━\n" +
          "👥 *JOGADORES:*\n" + lista + "\n" +
          "━━━━━━━━━━━━━━━━━━━━━━\n" +
          "⏰ Duração: *4 minutos*\n" +
          "🔋 Energia: *100%*\n" +
          "🐻 Animatrônicos: *" + cfg.animatronicos + "*\n" +
          "🎲 Chance de não se abalar: *" + Math.floor(cfg.chanceFicar * 100) + "%*\n" +
          "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
          "⚔️ _Sobrevivam usando:_\n" +
          "▸ `!fecharporta 1/2`\n" +
          "▸ `!portaluz 1/2`\n" +
          "▸ `!cameras`\n\n" +
          "🌙 _\"Boa sorte, mortais.\"_"

        const msgEdit = await sock.sendMessage(jid, { text: msgInicial, mentions: lobby.jogadores }, { quoted: msg })
        setTimeout(() => loopFnaf(sock, jogo, msgEdit), 5000)
      }
    },

    // ============ EM JOGO ============
    fecharporta: {
      aliases: ["portafechar", "fecharporta"],
      async executar({ sock, msg, args, utils }) {
        const jid = msg.key.remoteJid
        const jogo = jogosAtivos.get(jid)
        if (!jogo || jogo.finalizado) return

        const num = utils.soNumero(msg.key.participant || msg.key.remoteJid)
        if (!jogo.jogadores.some(j => utils.soNumero(j) === num)) return

        const idx = parseInt(args[0]) - 1
        if (idx !== 0 && idx !== 1) return sock.sendMessage(jid, { text: "🌙 Use `!fecharporta 1` ou `!fecharporta 2`" }, { quoted: msg })

        jogo.portas[idx] = !jogo.portas[idx]
        const estado = jogo.portas[idx] ? "🔒 FECHADA" : "🔓 ABERTA"
        await sock.sendMessage(jid, {
          text: "🌙🚪 *PORTA " + (idx + 1) + " " + estado + "*\n\n> _\"A lua controla as portas.\"_"
        }, { quoted: msg })
      }
    },

    portaluz: {
      aliases: ["luzporta", "ligarluz"],
      async executar({ sock, msg, args, utils }) {
        const jid = msg.key.remoteJid
        const jogo = jogosAtivos.get(jid)
        if (!jogo || jogo.finalizado) return

        const num = utils.soNumero(msg.key.participant || msg.key.remoteJid)
        if (!jogo.jogadores.some(j => utils.soNumero(j) === num)) return

        const idx = parseInt(args[0]) - 1
        if (idx !== 0 && idx !== 1) return sock.sendMessage(jid, { text: "🌙 Use `!portaluz 1` ou `!portaluz 2`" }, { quoted: msg })

        jogo.luzes[idx] = !jogo.luzes[idx]

        let msgExtra = ""
        if (jogo.luzes[idx]) {
          const animsNaPorta = jogo.animatronicos.filter(a => a.posicao === (idx === 0 ? "porta1" : "porta2"))
          if (animsNaPorta.length) {
            msgExtra = "\n\n🚨 *VIU:* " + animsNaPorta.map(a => a.emoji + " " + a.nome).join(", ")
          } else {
            msgExtra = "\n\n✅ _Nada por aqui..._"
          }
        }

        const estado = jogo.luzes[idx] ? "🟢 LIGADA" : "⚫ APAGADA"
        await sock.sendMessage(jid, {
          text: "🌙💡 *LUZ " + (idx + 1) + " " + estado + "*" + msgExtra
        }, { quoted: msg })
      }
    },

    cameras: {
      aliases: ["cam", "vercameras"],
      async executar({ sock, msg, utils }) {
        const jid = msg.key.remoteJid
        const jogo = jogosAtivos.get(jid)
        if (!jogo || jogo.finalizado) return

        const num = utils.soNumero(msg.key.participant || msg.key.remoteJid)
        if (!jogo.jogadores.some(j => utils.soNumero(j) === num)) return

        await sock.sendMessage(jid, { text: renderCameras(jogo) }, { quoted: msg })
      }
    },

    statusfnaf: {
      aliases: ["fnafstatus", "meufnaf", "statusjogo"],
      async executar({ sock, msg, utils }) {
        const jid = msg.key.remoteJid
        const jogo = jogosAtivos.get(jid)
        if (!jogo || jogo.finalizado) {
          return sock.sendMessage(jid, { text: "🌙💢 *SEM JOGO*\n\n> _\"Nenhuma partida em andamento.\"_\n\n💡 Use `!lobbyfnaf` pra criar" }, { quoted: msg })
        }

        const num = utils.soNumero(msg.key.participant || msg.key.remoteJid)
        if (!jogo.jogadores.some(j => utils.soNumero(j) === num)) return

        await sock.sendMessage(jid, { text: renderStatus(jogo) }, { quoted: msg })
      }
    },

    sairfnaf: {
      aliases: ["abandonarfnaf", "cancelarfnaf", "fugirfnaf"],
      async executar({ sock, msg, utils }) {
        const jid = msg.key.remoteJid
        const jogo = jogosAtivos.get(jid)
        if (!jogo || jogo.finalizado) return

        const num = utils.soNumero(msg.key.participant || msg.key.remoteJid)
        if (!jogo.jogadores.some(j => utils.soNumero(j) === num)) return

        jogo.finalizado = true
        jogosAtivos.delete(jid)

        await sock.sendMessage(jid, {
          text: "🌙💤 *JOGO ENCERRADO*\n\n> _\"Você fugiu da lua...\"_\n> _\"Covarde.\"_\n\n━━━━━━━━━━━━━━━━━━━━━━\n💡 Manda `!lobbyfnaf` pra criar outro"
        }, { quoted: msg })
      }
    }

  }
}