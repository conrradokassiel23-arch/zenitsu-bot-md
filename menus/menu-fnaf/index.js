/* ============================================================
   🟣 MENU FNAF - RIMURU BOT MD
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

const lobbys = new Map()
const jogosAtivos = new Map()

function nomeBotDb(db) {
  try { return db.config().nomeBot || "Rimuru Bot" } catch { return "Rimuru Bot" }
}

function renderStatus(jogo) {
  const tempoRestante = Math.max(0, Math.ceil((jogo.fimEm - Date.now()) / 1000))
  const min = Math.floor(tempoRestante / 60)
  const seg = tempoRestante % 60
  const tempoTxt = String(min).padStart(2, "0") + ":" + String(seg).padStart(2, "0")

  const energiaBarra = (() => {
    const c = Math.max(0, Math.min(10, Math.round(jogo.energia / 10)))
    return "🟣".repeat(c) + "⬛".repeat(10 - c)
  })()

  let txt = `🟣 • 𝐅𝐍𝐀𝐅 𝐓𝐄𝐌𝐏𝐄𝐒𝐓 •

╭─〔 💜 𝐍𝐎𝐈𝐓𝐄 ${jogo.noite}/5 〕
│ Sobreviva até o amanhecer.
╰──────────────

『 𝐒𝐭𝐚𝐭𝐮𝐬 』 ↴

⏰ 𝐓𝐞𝐦𝐩𝐨:
╰➜ ${tempoTxt} / 04:00

🦠 𝐄𝐧𝐞𝐫𝐠𝐢𝐚:
${energiaBarra} ${Math.floor(jogo.energia)}%

🚪 𝐏𝐎𝐑𝐓𝐀𝐒
╰➜ Porta 1 (Esq): ${jogo.portas[0] ? "🔒 FECHADA" : "🔓 ABERTA"}
╰➜ Porta 2 (Dir): ${jogo.portas[1] ? "🔒 FECHADA" : "🔓 ABERTA"}

💡 𝐋𝐔𝐙𝐄𝐒
╰➜ Luz 1 (Esq): ${jogo.luzes[0] ? "🟢 LIGADA" : "⚫ APAGADA"}
╰➜ Luz 2 (Dir): ${jogo.luzes[1] ? "🟢 LIGADA" : "⚫ APAGADA"}

👁️ 𝐀𝐌𝐄𝐀𝐂̧𝐀𝐒 𝐕𝐈𝐒𝐈́𝐕𝐄𝐈𝐒:`

  let temAmeaca = false
  jogo.animatronicos.forEach(a => {
    if (jogo.luzes[0] && a.posicao === "porta1") {
      txt += `\n╰➜ 🚨 ${a.emoji} ${a.nome} na PORTA ESQUERDA!`
      temAmeaca = true
    }
    if (jogo.luzes[1] && a.posicao === "porta2") {
      txt += `\n╰➜ 🚨 ${a.emoji} ${a.nome} na PORTA DIREITA!`
      temAmeaca = true
    }
  })
  if (!temAmeaca) txt += "\n╰➜ _Sem ameaças visíveis..._"

  txt += `

🎮 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒:
╰➜ \`!fecharporta 1/2\`
╰➜ \`!portaluz 1/2\`
╰➜ \`!cameras\`
╰➜ \`!statusfnaf\`
╰➜ \`!sairfnaf\`

"${jogo.nomeBot}"`

  return txt
}

function renderCameras(jogo) {
  let txt = `🟣 • 𝐂𝐀𝐌𝐄𝐑𝐀𝐒 •

╭─〔 🎥 𝐍𝐎𝐈𝐓𝐄 ${jogo.noite}/5 〕
│ Visão das câmeras de segurança.
╰──────────────

『 𝐋𝐨𝐜𝐚𝐢𝐬 』 ↴

`
  POSICOES.forEach(pos => {
    const aqui = jogo.animatronicos.filter(a => a.posicao === pos)
    if (aqui.length) {
      txt += `📹 ${POSICAO_NOME[pos]}:\n`
      aqui.forEach(a => {
        txt += `╰➜ ${a.emoji} ${a.nome}\n`
      })
      txt += "\n"
    }
  })

  txt += `🟣 _"O Grande Sábio vê tudo."_\n\n"${jogo.nomeBot}"`
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

  if (agora >= jogo.fimEm) {
    jogo.finalizado = true
    jogosAtivos.delete(jogo.jid)

    if (jogo.noite >= 5) {
      await sock.sendMessage(jogo.jid, {
        text:
`🟣 • 𝐕𝐈𝐓𝐎́𝐑𝐈𝐀 𝐓𝐄𝐌𝐏𝐄𝐒𝐓 •

╭─〔 🏆 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕
│ Você sobreviveu TODAS as 5 noites.
╰──────────────

『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴

🎖️ 𝐓𝐢́𝐭𝐮𝐥𝐨:
╰➜ Lorde Demônio

🌙 𝐑𝐞𝐜𝐨𝐦𝐩𝐞𝐧𝐬𝐚:
╰➜ +5000 gold

🟣 _"Rimuru te reconhece."_

"${jogo.nomeBot}"`
      })
    } else {
      await sock.sendMessage(jogo.jid, {
        text:
`🟣 • 𝐍𝐎𝐈𝐓𝐄 ${jogo.noite} 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀 •

╭─〔 💜 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕
│ Você sobreviveu... por enquanto.
╰──────────────

『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴

📅 𝐏𝐫𝐨́𝐱𝐢𝐦𝐚:
╰➜ Noite ${jogo.noite + 1}/5

💡 Manda \`!fnaf começar\` pra continuar

"${jogo.nomeBot}"`
      })
    }
    return
  }

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
      text:
`🟣 • 𝐄𝐍𝐄𝐑𝐆𝐈𝐀 𝐄𝐒𝐆𝐎𝐓𝐀𝐃𝐀 •

╭─〔 💀 𝐅𝐈𝐌 𝐃𝐄 𝐉𝐎𝐆𝐎 〕
│ A escuridão consumiu tudo.
╰──────────────

『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴

❌ 𝐅𝐨𝐢 𝐩𝐞𝐠𝐨 𝐩𝐞𝐥𝐨𝐬 𝐚𝐧𝐢𝐦𝐚𝐭𝐫𝐨̂𝐧𝐢𝐜𝐨𝐬
💡 \`!fnaf começar\` pra tentar de novo

"${jogo.nomeBot}"`
    })
    return
  }

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
              text:
`🟣 • 𝐆𝐀𝐌𝐄 𝐎𝐕𝐄𝐑 •

╭─〔 💀 𝐅𝐈𝐌 𝐃𝐄 𝐉𝐎𝐆𝐎 〕
│ ${a.emoji} ${a.nome} te pegou!
╰──────────────

『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴

❌ 𝐕𝐨𝐜𝐞̂ 𝐦𝐨𝐫𝐫𝐞𝐮 𝐧𝐚 𝐍𝐨𝐢𝐭𝐞 ${jogo.noite}/5
💡 \`!fnaf começar\` pra tentar de novo

"${jogo.nomeBot}"`
            })
            return
          }
        }
      } else {
        jogo.finalizado = true
        jogosAtivos.delete(jogo.jid)
        await sock.sendMessage(jogo.jid, {
          text:
`🟣 • 𝐆𝐀𝐌𝐄 𝐎𝐕𝐄𝐑 •

╭─〔 💀 𝐅𝐈𝐌 𝐃𝐄 𝐉𝐎𝐆𝐎 〕
│ ${a.emoji} ${a.nome} entrou pela porta aberta!
╰──────────────

『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴

❌ 𝐕𝐨𝐜𝐞̂ 𝐦𝐨𝐫𝐫𝐞𝐮 𝐧𝐚 𝐍𝐨𝐢𝐭𝐞 ${jogo.noite}/5
💡 \`!fnaf começar\` pra tentar de novo

"${jogo.nomeBot}"`
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

    menufnaf: {
      aliases: ["fnafmenu", "menuf", "ajudafnaf"],
      async executar({ sock, msg, prefixoAtivo, db }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo
        const nomeBot = nomeBotDb(db)
        const cfg = db.config()
        const texto =
`🟣 • 𝐌𝐄𝐍𝐔 𝐅𝐍𝐀𝐅 𝐓𝐄𝐌𝐏𝐄𝐒𝐓 •

╭─〔 💜 𝐒𝐎𝐁𝐑𝐄𝐕𝐈𝐕𝐄̂𝐍𝐂𝐈𝐀 〕
│ Cinco noites. 4 minutos cada.
╰──────────────

『 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐚𝐬 』 ↴

🎮 𝐋𝐎𝐁𝐁𝐘
╰➜ \`${p}lobbyfnaf\` — cria um lobby
╰➜ \`${p}entrarfnaf\` — entra no lobby
╰➜ \`${p}sairlobby\` — sai do lobby
╰➜ \`${p}iniciarfnaf\` — inicia o jogo

🎯 𝐄𝐌 𝐉𝐎𝐆𝐎
╰➜ \`${p}fecharporta 1/2\`
╰➜ \`${p}portaluz 1/2\`
╰➜ \`${p}cameras\`
╰➜ \`${p}statusfnaf\`
╰➜ \`${p}sairfnaf\`

🐻 𝐀𝐍𝐈𝐌𝐀𝐓𝐑𝐎̂𝐍𝐈𝐂𝐎𝐒
╰➜ 🐻 Freddy
╰➜ 🐰 Bonnie
╰➜ 🐔 Chica
╰➜ 🦊 Foxy

🟣 _"Sobreviva se puder."_

"${nomeBot}"`

        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          if (cfg.tipoMenu === "video") return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "rimuru.mp4", gifPlayback: true, caption: texto }, { quoted: msg })
          return sock.sendMessage(jid, { image: buf, caption: texto }, { quoted: msg })
        }
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    lobbyfnaf: {
      aliases: ["criarlobby", "novolobby"],
      async executar({ sock, msg, sender, utils, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        if (!jid.endsWith("@g.us")) return sock.sendMessage(jid, { text: `🟣 • 𝐋𝐎𝐁𝐁𝐘 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Só em grupos.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        if (jogosAtivos.has(jid)) return sock.sendMessage(jid, { text: `🟣 • 𝐋𝐎𝐁𝐁𝐘 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Jogo em andamento.\n╰──────────────\n\n💡 Espere a partida atual terminar.\n\n"${nomeBot}"` }, { quoted: msg })
        if (lobbys.has(jid)) return sock.sendMessage(jid, { text: `🟣 • 𝐋𝐎𝐁𝐁𝐘 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Já tem lobby aberto.\n╰──────────────\n\n💡 Use \`!entrarfnaf\`\n\n"${nomeBot}"` }, { quoted: msg })
        const num = utils.soNumero(sender)
        lobbys.set(jid, { criador: num, criadorJid: sender, jogadores: [sender], aberto: true, criadoEm: Date.now() })
        await sock.sendMessage(jid, {
          text:
`🟣 • 𝐋𝐎𝐁𝐁𝐘 𝐂𝐑𝐈𝐀𝐃𝐎 •

╭─〔 💜 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕
│ Lobby aberto pra jogadores.
╰──────────────

『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴

👑 𝐇𝐨𝐬𝐭:
╰➜ @${num}

👥 𝐉𝐨𝐠𝐚𝐝𝐨𝐫𝐞𝐬:
╰➜ 1/5

📋 𝐋𝐢𝐬𝐭𝐚:
╰➜ 1. @${num}

💡 \`!entrarfnaf\` pra entrar
🎮 \`!iniciarfnaf\` pra começar

⚔️ _Máx: 5 jogadores_

"${nomeBot}"`,
          mentions: [sender]
        }, { quoted: msg })
      }
    },

    entrarlobby: {
      aliases: ["entrarfnaf", "entrarlobbyfnaf", "participo"],
      async executar({ sock, msg, sender, utils, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        if (!jid.endsWith("@g.us")) return sock.sendMessage(jid, { text: `🟣 • 𝐋𝐎𝐁𝐁𝐘 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Só em grupos.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const lobby = lobbys.get(jid)
        if (!lobby || !lobby.aberto) return sock.sendMessage(jid, { text: `🟣 • 𝐋𝐎𝐁𝐁𝐘 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Sem lobby aberto.\n╰──────────────\n\n💡 Use \`!lobbyfnaf\`\n\n"${nomeBot}"` }, { quoted: msg })
        const num = utils.soNumero(sender)
        if (lobby.jogadores.some(j => utils.soNumero(j) === num)) return sock.sendMessage(jid, { text: `🟣 • 𝐋𝐎𝐁𝐁𝐘 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Você já tá no lobby.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        if (lobby.jogadores.length >= 5) return sock.sendMessage(jid, { text: `🟣 • 𝐋𝐎𝐁𝐁𝐘 •\n\n╭─〔 🚫 𝐄𝐑𝐑𝐎 〕\n│ Lobby cheio.\n╰──────────────\n\n⚔️ Máx 5 corajosos.\n\n"${nomeBot}"` }, { quoted: msg })
        lobby.jogadores.push(sender)
        let lista = ""
        lobby.jogadores.forEach((j, i) => { lista += `╰➜ ${i + 1}. @${utils.soNumero(j)}\n` })
        await sock.sendMessage(jid, {
          text:
`🟣 • 𝐍𝐎𝐕𝐎 𝐉𝐎𝐆𝐀𝐃𝐎𝐑 •

╭─〔 💜 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕
│ @${num} entrou no lobby.
╰──────────────

『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴

👥 𝐉𝐨𝐠𝐚𝐝𝐨𝐫𝐞𝐬:
╰➜ ${lobby.jogadores.length}/5

📋 𝐋𝐢𝐬𝐭𝐚:
${lista}
💡 Mais alguém? \`!entrarfnaf\`

"${nomeBot}"`,
          mentions: lobby.jogadores
        }, { quoted: msg })
      }
    },

    sairlobby: {
      aliases: ["sairlobbyfnaf", "abandonarlobby"],
      async executar({ sock, msg, sender, utils, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const lobby = lobbys.get(jid)
        if (!lobby) return
        const num = utils.soNumero(sender)
        const idx = lobby.jogadores.findIndex(j => utils.soNumero(j) === num)
        if (idx === -1) return
        lobby.jogadores.splice(idx, 1)
        if (lobby.jogadores.length === 0) {
          lobbys.delete(jid)
          return sock.sendMessage(jid, { text: `🟣 • 𝐋𝐎𝐁𝐁𝐘 𝐂𝐀𝐍𝐂𝐄𝐋𝐀𝐃𝐎 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Todos saíram.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
        if (utils.soNumero(lobby.criadorJid) === num) {
          lobby.criador = utils.soNumero(lobby.jogadores[0])
          lobby.criadorJid = lobby.jogadores[0]
        }
        await sock.sendMessage(jid, { text: `🟣 • 𝐒𝐀𝐈𝐔 𝐃𝐎 𝐋𝐎𝐁𝐁𝐘 •\n\n╭─〔 👋 𝐀𝐓𝐄́ 𝐋𝐎𝐆𝐎 〕\n│ @${num} saiu do lobby.\n╰──────────────\n\n👥 𝐉𝐨𝐠𝐚𝐝𝐨𝐫𝐞𝐬:\n╰➜ ${lobby.jogadores.length}/5\n\n"${nomeBot}"`, mentions: [sender] }, { quoted: msg })
      }
    },

    iniciarfnaf: {
      aliases: ["comecarfnaf", "startfnaf", "fnafcomecar"],
      async executar({ sock, msg, sender, utils, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        if (!jid.endsWith("@g.us")) return sock.sendMessage(jid, { text: `🟣 • 𝐅𝐍𝐀𝐅 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Só em grupos.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        if (jogosAtivos.has(jid)) return sock.sendMessage(jid, { text: `🟣 • 𝐅𝐍𝐀𝐅 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Jogo em andamento.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const lobby = lobbys.get(jid)
        if (!lobby) return sock.sendMessage(jid, { text: `🟣 • 𝐅𝐍𝐀𝐅 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Sem lobby.\n╰──────────────\n\n💡 Use \`!lobbyfnaf\` primeiro\n\n"${nomeBot}"` }, { quoted: msg })
        const num = utils.soNumero(sender)
        if (utils.soNumero(lobby.criadorJid) !== num) return sock.sendMessage(jid, { text: `🟣 • 𝐅𝐍𝐀𝐅 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Só o host pode iniciar.\n╰──────────────\n\n👑 Host: @${lobby.criador}\n\n"${nomeBot}"`, mentions: [lobby.criadorJid] }, { quoted: msg })
        if (lobby.jogadores.length < 1) return sock.sendMessage(jid, { text: `🟣 • 𝐅𝐍𝐀𝐅 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Precisa de pelo menos 1 jogador.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        lobby.aberto = false
        lobbys.delete(jid)
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
          jid, jogadores: lobby.jogadores, host: lobby.criador, hostJid: lobby.criadorJid,
          noite: noiteAtual, energia: 100, portas: [false, false], luzes: [false, false],
          animatronicos: anims.map(a => ({ ...a, posicao: "salao", tempoPorta: 0 })),
          fimEm: Date.now() + 4 * 60 * 1000, velocidadeAnim: cfg.velocidade, velocidadeEnergia: cfg.velocidadeEnergia,
          chanceFicar: cfg.chanceFicar, finalizado: false, nomeBot
        }
        jogosAtivos.set(jid, jogo)
        let lista = ""
        lobby.jogadores.forEach((j, i) => { lista += `╰➜ ${i + 1}. @${utils.soNumero(j)}\n` })
        const msgInicial =
`🟣 • 𝐅𝐍𝐀𝐅 𝐓𝐄𝐌𝐏𝐄𝐒𝐓 •

╭─〔 💜 𝐍𝐎𝐈𝐓𝐄 ${noiteAtual}/5 〕
│ A noite começa...
╰──────────────

『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴

👥 𝐉𝐎𝐆𝐀𝐃𝐎𝐑𝐄𝐒:
${lista}
⏰ 𝐃𝐮𝐫𝐚𝐜̧𝐚̃𝐨:
╰➜ 4 minutos

🦠 𝐄𝐧𝐞𝐫𝐠𝐢𝐚:
╰➜ 100%

🐻 𝐀𝐧𝐢𝐦𝐚𝐭𝐫𝐨̂𝐧𝐢𝐜𝐨𝐬:
╰➜ ${cfg.animatronicos}

🎲 𝐂𝐡𝐚𝐧𝐜𝐞 𝐝𝐞 𝐧𝐚̃𝐨 𝐬𝐞 𝐚𝐛𝐚𝐥𝐚𝐫:
╰➜ ${Math.floor(cfg.chanceFicar * 100)}%

⚔️ 𝐒𝐨𝐛𝐫𝐞𝐯𝐢𝐯𝐚𝐦 𝐮𝐬𝐚𝐧𝐝𝐨:
╰➜ \`!fecharporta 1/2\`
╰➜ \`!portaluz 1/2\`
╰➜ \`!cameras\`

🟣 _"Boa sorte, mortais."_

"${nomeBot}"`
        const msgEdit = await sock.sendMessage(jid, { text: msgInicial, mentions: lobby.jogadores }, { quoted: msg })
        setTimeout(() => loopFnaf(sock, jogo, msgEdit), 5000)
      }
    },

    fecharporta: {
      aliases: ["portafechar"],
      async executar({ sock, msg, args, utils, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const jogo = jogosAtivos.get(jid)
        if (!jogo || jogo.finalizado) return
        const num = utils.soNumero(msg.key.participant || msg.key.remoteJid)
        if (!jogo.jogadores.some(j => utils.soNumero(j) === num)) return
        const idx = parseInt(args[0]) - 1
        if (idx !== 0 && idx !== 1) return sock.sendMessage(jid, { text: `🟣 • 𝐅𝐍𝐀𝐅 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Use 1 ou 2.\n╰──────────────\n\n💡 \`!fecharporta 1\` ou \`!fecharporta 2\`\n\n"${nomeBot}"` }, { quoted: msg })
        jogo.portas[idx] = !jogo.portas[idx]
        const estado = jogo.portas[idx] ? "🔒 FECHADA" : "🔓 ABERTA"
        await sock.sendMessage(jid, { text: `🟣 • 𝐅𝐍𝐀𝐅 •\n\n╭─〔 🚪 𝐏𝐎𝐑𝐓𝐀 ${idx + 1} 〕\n│ A porta foi ${estado}\n╰──────────────\n\n_"O Grande Sábio controla as portas."_\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    portaluz: {
      aliases: ["luzporta", "ligarluz"],
      async executar({ sock, msg, args, utils, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const jogo = jogosAtivos.get(jid)
        if (!jogo || jogo.finalizado) return
        const num = utils.soNumero(msg.key.participant || msg.key.remoteJid)
        if (!jogo.jogadores.some(j => utils.soNumero(j) === num)) return
        const idx = parseInt(args[0]) - 1
        if (idx !== 0 && idx !== 1) return sock.sendMessage(jid, { text: `🟣 • 𝐅𝐍𝐀𝐅 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Use 1 ou 2.\n╰──────────────\n\n💡 \`!portaluz 1\` ou \`!portaluz 2\`\n\n"${nomeBot}"` }, { quoted: msg })
        jogo.luzes[idx] = !jogo.luzes[idx]
        let msgExtra = ""
        if (jogo.luzes[idx]) {
          const animsNaPorta = jogo.animatronicos.filter(a => a.posicao === (idx === 0 ? "porta1" : "porta2"))
          if (animsNaPorta.length) msgExtra = "\n\n🚨 𝐕𝐈𝐔:\n" + animsNaPorta.map(a => `╰➜ ${a.emoji} ${a.nome}`).join("\n")
          else msgExtra = "\n\n✅ _Nada por aqui..._"
        }
        const estado = jogo.luzes[idx] ? "🟢 LIGADA" : "⚫ APAGADA"
        await sock.sendMessage(jid, { text: `🟣 • 𝐅𝐍𝐀𝐅 •\n\n╭─〔 💡 𝐋𝐔𝐙 ${idx + 1} 〕\n│ A luz foi ${estado}${msgExtra}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    cameras: {
      aliases: ["cam", "vercameras"],
      async executar({ sock, msg, utils, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const jogo = jogosAtivos.get(jid)
        if (!jogo || jogo.finalizado) return
        const num = utils.soNumero(msg.key.participant || msg.key.remoteJid)
        if (!jogo.jogadores.some(j => utils.soNumero(j) === num)) return
        await sock.sendMessage(jid, { text: renderCameras(jogo) }, { quoted: msg })
      }
    },

    statusfnaf: {
      aliases: ["fnafstatus", "meufnaf", "statusjogo"],
      async executar({ sock, msg, utils, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const jogo = jogosAtivos.get(jid)
        if (!jogo || jogo.finalizado) return sock.sendMessage(jid, { text: `🟣 • 𝐅𝐍𝐀𝐅 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Sem jogo em andamento.\n╰──────────────\n\n💡 Use \`!lobbyfnaf\`\n\n"${nomeBot}"` }, { quoted: msg })
        const num = utils.soNumero(msg.key.participant || msg.key.remoteJid)
        if (!jogo.jogadores.some(j => utils.soNumero(j) === num)) return
        await sock.sendMessage(jid, { text: renderStatus(jogo) }, { quoted: msg })
      }
    },

    sairfnaf: {
      aliases: ["abandonarfnaf", "cancelarfnaf", "fugirfnaf"],
      async executar({ sock, msg, utils, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const jogo = jogosAtivos.get(jid)
        if (!jogo || jogo.finalizado) return
        const num = utils.soNumero(msg.key.participant || msg.key.remoteJid)
        if (!jogo.jogadores.some(j => utils.soNumero(j) === num)) return
        jogo.finalizado = true
        jogosAtivos.delete(jid)
        await sock.sendMessage(jid, { text: `🟣 • 𝐉𝐎𝐆𝐎 𝐄𝐍𝐂𝐄𝐑𝐑𝐀𝐃𝐎 •\n\n╭─〔 💤 𝐅𝐔𝐆𝐀 〕\n│ Você fugiu da lua.\n╰──────────────\n\n_"Covarde."_\n\n💡 \`!lobbyfnaf\` pra criar outro\n\n"${nomeBot}"` }, { quoted: msg })
      }
    }

  }
}