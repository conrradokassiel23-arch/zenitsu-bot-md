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
  { noite: 1, animatronicos: 1, velocidade: 12000, energiaQueda: 800, chanceFicar: 0.15 },
  { noite: 2, animatronicos: 2, velocidade: 10000, energiaQueda: 900, chanceFicar: 0.20 },
  { noite: 3, animatronicos: 3, velocidade: 8500, energiaQueda: 1000, chanceFicar: 0.25 },
  { noite: 4, animatronicos: 4, velocidade: 7000, energiaQueda: 1100, chanceFicar: 0.30 },
  { noite: 5, animatronicos: 4, velocidade: 5500, energiaQueda: 1200, chanceFicar: 0.35 }
]

// Armazena jogos ativos em memória
const jogosAtivos = new Map()

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

    // VITÓRIA
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
      // Dá recompensa
      try {
        const db = require("path").join(__dirname, "..", "..", "data")
        const fs = require("fs")
        const rpgPath = require("path").join(db, "rpg.json")
        if (fs.existsSync(rpgPath)) {
          const rpg = JSON.parse(fs.readFileSync(rpgPath, "utf8"))
          rpg.usuarios = rpg.usuarios || {}
          rpg.usuarios[jogo.num] = rpg.usuarios[jogo.num] || { moedas: 0 }
          rpg.usuarios[jogo.num].moedas = (rpg.usuarios[jogo.num].moedas || 0) + 5000
          fs.writeFileSync(rpgPath, JSON.stringify(rpg, null, 2))
        }
      } catch (_) {}
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

  // Atualiza energia
  const intervalo = jogo.velocidadeEnergia
  const energiaCaindo = (intervalo / 1000) * 1 // ~1% por segundo
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
    // Se tá na porta, verifica
    if (a.posicao === "porta1" || a.posicao === "porta2") {
      const portaIdx = a.posicao === "porta1" ? 0 : 1
      const portaFechada = jogo.portas[portaIdx]

      if (portaFechada) {
        // Tem chance de ir embora
        if (Math.random() > jogo.chanceFicar) {
          a.posicao = "corredor"
          a.tempoPorta = 0
        } else {
          // Não se abalou
          a.tempoPorta = (a.tempoPorta || 0) + 1
          if (a.tempoPorta >= 3) {
            // ATACA
            jogo.finalizado = true
            jogosAtivos.delete(jogo.jid)
            await sock.sendMessage(jogo.jid, {
              text: "╔══════════════════════════════╗\n" +
                "║  🌙💀 𝐆𝐀𝐌𝐄 𝐎𝐕𝐄𝐑 💀🌙\n" +
                "╚══════════════════════════════╝\n\n" +
                a.emoji + " *" + a.nome + "* te pegou!\n\n" +
                "> _\"Ele não se abalou...\"_\n" +
                "> _\"A escuridão da lua o consumiu.\"_\n\n" +
                "━━━━━━━━━━━━━━━━━━━━━━\n" +
                "❌ Você morreu na *Noite " + jogo.noite + "/5*\n" +
                "🔁 Voltou pra Noite 1\n" +
                "💡 Manda `!fnaf começar` pra tentar de novo\n" +
                "━━━━━━━━━━━━━━━━━━━━━━"
            })
            return
          }
        }
      } else {
        // Porta aberta e animatrônico na porta → ataca rápido
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
            "🔁 Voltou pra Noite 1\n" +
            "💡 Manda `!fnaf começar` pra tentar de novo\n" +
            "━━━━━━━━━━━━━━━━━━━━━━"
        })
        return
      }
    } else {
      // Move normalmente
      if (Math.random() < 0.5) {
        const idx = POSICOES.indexOf(a.posicao)
        if (idx < POSICOES.length - 1) {
          a.posicao = POSICOES[idx + 1]
          // 50% de chance de ir pra porta 1 ou 2
          if (a.posicao === "cozinha" && Math.random() < 0.5) {
            a.posicao = Math.random() < 0.5 ? "porta1" : "porta2"
          }
        }
      }
    }
  }

  // Atualiza mensagem
  await atualizarMensagem(sock, jogo, msgEdit)

  // Próximo loop
  setTimeout(() => loopFnaf(sock, jogo, msgEdit), jogo.velocidadeAnim)
}

module.exports = {
  menu: "menu-fnaf",
  grupoOnly: false,
  adminOnly: false,
  donoOnly: false,

  commands: {

    menufnaf: {
      aliases: ["fnaf", "fnafmenu", "menuf"],
      async executar({ sock, msg, prefixoAtivo, db }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo

        const texto = "🌙👁️ *MENU FNAF LUNAR* 👁️🌙\n\n" +
          "> _\"Cinco noites... 4 minutos cada.\"_\n" +
          "> _\"Será que você sobrevive?\"_\n\n" +
          "━━━━━━━━━━━━━━━━━━━━━━\n" +
          "🎮 *COMO JOGAR*\n" +
          "▸ `" + p + "fnaf começar` — inicia a noite atual\n" +
          "▸ `" + p + "fecharporta 1/2` — fecha porta esq/dir\n" +
          "▸ `" + p + "portaluz 1/2` — acende luz esq/dir\n" +
          "▸ `" + p + "cameras` — vê onde os animatrônicos estão\n" +
          "▸ `" + p + "statusfnaf` — status geral\n" +
          "▸ `" + p + "sairfnaf` — abandona o jogo\n\n" +
          "━━━━━━━━━━━━━━━━━━━━━━\n" +
          "🐻 *ANIMATRÔNICOS*\n" +
          "▸ 🐻 Freddy\n" +
          "▸ 🐰 Bonnie\n" +
          "▸ 🐔 Chica\n" +
          "▸ 🦊 Foxy\n\n" +
          "━━━━━━━━━━━━━━━━━━━━━━\n" +
          "🌙 *SISTEMA*\n" +
          "▸ 🔋 Energia cai sozinha\n" +
          "▸ 🚪 Portas fechadas gastam mais\n" +
          "▸ 💡 Luzes ligadas também gastam\n" +
          "▸ 🎲 Animatrônicos podem NÃO se abalar (30%)\n" +
          "▸ ⏰ Cada noite dura 4 minutos\n\n" +
          "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
          "> ⚔️ _\"Meus 6 olhos veem o medo em você.\"_\n" +
          "> 🌙 _\"Sobreviva se puder.\"_"

        const cfg = db.config()
        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          if (cfg.tipoMenu === "video") return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "kokushibo.mp4", gifPlayback: true, caption: texto }, { quoted: msg })
          return sock.sendMessage(jid, { image: buf, caption: texto }, { quoted: msg })
        }
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    iniciarfnaf: {
      aliases: ["fnafcomecar", "comecarfnaf", "startfnaf"],
      async executar({ sock, msg, sender, utils }) {
        const jid = msg.key.remoteJid
        if (!jid.endsWith("@g.us")) return sock.sendMessage(jid, { text: "🌙 Só em grupo!" }, { quoted: msg })

        if (jogosAtivos.has(jid)) {
          return sock.sendMessage(jid, { text: "🌙👁️ *JÁ TEM JOGO*\n\n> _\"Espere a partida atual terminar.\"_\n\n💡 Use `!sairfnaf` pra cancelar" }, { quoted: msg })
        }

        const num = utils.soNumero(sender)

        // Verifica qual noite o jogador tá
        let noiteAtual = 1
        try {
          const fs = require("fs")
          const path = require("path")
          const progPath = path.join(__dirname, "..", "..", "data", "fnaf_progresso.json")
          if (fs.existsSync(progPath)) {
            const prog = JSON.parse(fs.readFileSync(progPath, "utf8"))
            noiteAtual = prog[num]?.noite || 1
          }
        } catch (_) {}

        if (noiteAtual > 5) noiteAtual = 1

        const cfg = NOITES[noiteAtual - 1]

        // Escolhe animatrônicos aleatórios
        const anims = [...ANIMATRONICOS].sort(() => Math.random() - 0.5).slice(0, cfg.animatronicos)

        const jogo = {
          jid,
          num,
          noite: noiteAtual,
          energia: 100,
          portas: [false, false],
          luzes: [false, false],
          animatronicos: anims.map(a => ({ ...a, posicao: "salao", tempoPorta: 0 })),
          fimEm: Date.now() + 4 * 60 * 1000, // 4 minutos
          velocidadeAnim: cfg.velocidade,
          velocidadeEnergia: cfg.energiaQueda,
          chanceFicar: cfg.chanceFicar,
          finalizado: false
        }

        jogosAtivos.set(jid, jogo)

        // Mensagem inicial
        const msgInicial = "╔══════════════════════════════╗\n" +
          "║  🌙 𝐅𝐍𝐀𝐅 𝐋𝐔𝐍𝐀𝐑 - 𝐍𝐎𝐈𝐓𝐄 " + noiteAtual + "/5\n" +
          "╚══════════════════════════════╝\n\n" +
          "> 👁️ _\"A noite começa...\"_\n" +
          "> _\"Meus 6 olhos veem você, @" + num + ".\"_\n\n" +
          "━━━━━━━━━━━━━━━━━━━━━━\n" +
          "⏰ Duração: *4 minutos*\n" +
          "🔋 Energia: *100%*\n" +
          "🐻 Animatrônicos: *" + cfg.animatronicos + "*\n" +
          "🎲 Chance de não se abalar: *" + Math.floor(cfg.chanceFicar * 100) + "%*\n" +
          "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
          "⚔️ _Sobreviva usando:_\n" +
          "▸ `!fecharporta 1/2`\n" +
          "▸ `!portaluz 1/2`\n" +
          "▸ `!cameras`\n\n" +
          "🌙 _\"Boa sorte...\"_"

        const msgEdit = await sock.sendMessage(jid, { text: msgInicial }, { quoted: msg })

        // Inicia loop
        setTimeout(() => loopFnaf(sock, jogo, msgEdit), 5000)
      }
    },

    fecharporta: {
      aliases: ["portafechar", "fechar"],
      async executar({ sock, msg, args, utils }) {
        const jid = msg.key.remoteJid
        const jogo = jogosAtivos.get(jid)
        if (!jogo || jogo.finalizado) return

        const num = utils.soNumero(msg.key.participant || msg.key.remoteJid)
        if (num !== jogo.num) return

        const idx = parseInt(args[0]) - 1
        if (idx !== 0 && idx !== 1) return sock.sendMessage(jid, { text: "🌙 Use `!fecharporta 1` ou `!fecharporta 2`" }, { quoted: msg })

        jogo.portas[idx] = !jogo.portas[idx]

        const estado = jogo.portas[idx] ? "🔒 FECHADA" : "🔓 ABERTA"
        await sock.sendMessage(jid, {
          text: "🌙🚪 *PORTA " + (idx + 1) + " " + estado + "*\n\n> _\"A lua controla as portas.\"_\n\n_\"Meus olhos vigiam...\"_"
        }, { quoted: msg })
      }
    },

    portaluz: {
      aliases: ["luzporta", "luz"],
      async executar({ sock, msg, args, utils }) {
        const jid = msg.key.remoteJid
        const jogo = jogosAtivos.get(jid)
        if (!jogo || jogo.finalizado) return

        const num = utils.soNumero(msg.key.participant || msg.key.remoteJid)
        if (num !== jogo.num) return

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
        if (num !== jogo.num) return

        await sock.sendMessage(jid, { text: renderCameras(jogo) }, { quoted: msg })
      }
    },

    statusfnaf: {
      aliases: ["fnafstatus", "meufnaf"],
      async executar({ sock, msg, utils }) {
        const jid = msg.key.remoteJid
        const jogo = jogosAtivos.get(jid)
        if (!jogo || jogo.finalizado) return

        const num = utils.soNumero(msg.key.participant || msg.key.remoteJid)
        if (num !== jogo.num) return

        await sock.sendMessage(jid, { text: renderStatus(jogo) }, { quoted: msg })
      }
    },

    sairfnaf: {
      aliases: ["sair", "abandonarfnaf", "cancelarfnaf"],
      async executar({ sock, msg, utils }) {
        const jid = msg.key.remoteJid
        const jogo = jogosAtivos.get(jid)
        if (!jogo) return

        const num = utils.soNumero(msg.key.participant || msg.key.remoteJid)
        if (num !== jogo.num) return

        jogo.finalizado = true
        jogosAtivos.delete(jid)

        await sock.sendMessage(jid, {
          text: "🌙💤 *JOGO ENCERRADO*\n\n> _\"Você fugiu da lua...\"_\n> _\"Covarde.\"_\n\n━━━━━━━━━━━━━━━━━━━━━━\n💡 Manda `!fnaf começar` pra tentar de novo"
        }, { quoted: msg })
      }
    }

  }
}