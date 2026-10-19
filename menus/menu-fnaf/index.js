/* ============================================================
   💧❄️🧊 MENU FNAF - RIMURU BOT MD (PREFIXO DINÂMICO)
   ============================================================ */

const fs = require("fs")
const path = require("path")

const DATA_DIR = path.join(__dirname, "..", "..", "data")

async function reagir(sock, msg, emoji) {
  try { await sock.sendMessage(msg.key.remoteJid, { react: { text: emoji, key: msg.key } }) } catch (_) {}
}

function nomeBotDb(db) { try { return db.config().nomeBot || "Rimuru Bot" } catch { return "Rimuru Bot" } }

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

const ANIMATRONICOS = [
  { id: "freddy", nome: "Freddy", emoji: "🐻" },
  { id: "bonnie", nome: "Bonnie", emoji: "🐰" },
  { id: "chica", nome: "Chica", emoji: "🐔" },
  { id: "foxy", nome: "Foxy", emoji: "🦊" }
]
const POSICOES = ["salao", "corredor", "cozinha", "porta1", "porta2"]
const POSICAO_NOME = { salao: "Salão Principal", corredor: "Corredor", cozinha: "Cozinha", porta1: "Porta Esquerda", porta2: "Porta Direita" }
const NOITES = [
  { noite: 1, animatronicos: 1, velocidade: 12000, velocidadeEnergia: 800, chanceFicar: 0.15 },
  { noite: 2, animatronicos: 2, velocidade: 10000, velocidadeEnergia: 900, chanceFicar: 0.20 },
  { noite: 3, animatronicos: 3, velocidade: 8500, velocidadeEnergia: 1000, chanceFicar: 0.25 },
  { noite: 4, animatronicos: 4, velocidade: 7000, velocidadeEnergia: 1100, chanceFicar: 0.30 },
  { noite: 5, animatronicos: 4, velocidade: 5500, velocidadeEnergia: 1200, chanceFicar: 0.35 }
]

const lobbys = new Map()
const jogosAtivos = new Map()

function renderStatus(jogo) {
  const tempoRestante = Math.max(0, Math.ceil((jogo.fimEm - Date.now()) / 1000))
  const min = Math.floor(tempoRestante / 60)
  const seg = tempoRestante % 60
  const tempoTxt = String(min).padStart(2, "0") + ":" + String(seg).padStart(2, "0")
  const energiaBarra = (() => { const c = Math.max(0, Math.min(10, Math.round(jogo.energia / 10))); return "💧".repeat(c) + "⬛".repeat(10 - c) })()
  let txt = `💧 • 𝐅𝐍𝐀𝐅 𝐓𝐄𝐌𝐏𝐄𝐒𝐓 •\n\n❄️ NOITE ${jogo.noite}/5\n🧊 Sobreviva até amanhecer\n\n⏰ Tempo: ${tempoTxt}/04:00\n🧊 Energia:\n${energiaBarra} ${Math.floor(jogo.energia)}%\n\n🚪 Portas:\n🧊 Esq: ${jogo.portas[0] ? "🔒 FECHADA" : "🔓 ABERTA"}\n🧊 Dir: ${jogo.portas[1] ? "🔒 FECHADA" : "🔓 ABERTA"}\n\n💡 Luzes:\n🧊 Esq: ${jogo.luzes[0] ? "🟢 LIGADA" : "⚫ APAGADA"}\n🧊 Dir: ${jogo.luzes[1] ? "🟢 LIGADA" : "⚫ APAGADA"}\n\n👁️ Ameaças:`
  let temAmeaca = false
  jogo.animatronicos.forEach(a => {
    if (jogo.luzes[0] && a.posicao === "porta1") { txt += `\n🧊 🚨 ${a.emoji} ${a.nome} na PORTA ESQ!`; temAmeaca = true }
    if (jogo.luzes[1] && a.posicao === "porta2") { txt += `\n🧊 🚨 ${a.emoji} ${a.nome} na PORTA DIR!`; temAmeaca = true }
  })
  if (!temAmeaca) txt += "\n🧊 _Sem ameaças visíveis..._"
  txt += `\n\n🎮 Comandos:\n🧊 \`${jogo.prefixo}fecharporta 1/2\`\n🧊 \`${jogo.prefixo}portaluz 1/2\`\n🧊 \`${jogo.prefixo}cameras\`\n🧊 \`${jogo.prefixo}statusfnaf\`\n🧊 \`${jogo.prefixo}sairfnaf\`\n\n"${jogo.nomeBot}"`
  return txt
}

function renderCameras(jogo) {
  let txt = `💧 • 𝐂𝐀𝐌𝐄𝐑𝐀𝐒 •\n\n❄️ NOITE ${jogo.noite}/5\n🧊 Locais:\n\n`
  POSICOES.forEach(pos => { const aqui = jogo.animatronicos.filter(a => a.posicao === pos); if (aqui.length) { txt += `📹 ${POSICAO_NOME[pos]}:\n`; aqui.forEach(a => { txt += `🧊 ${a.emoji} ${a.nome}\n` }); txt += "\n" } })
  txt += `💧 _"O Grande Sábio vê tudo."_\n\n"${jogo.nomeBot}"`
  return txt
}

async function atualizarMensagem(sock, jogo, msgEdit) {
  try { const texto = renderStatus(jogo); await sock.sendMessage(jogo.jid, { text: texto, edit: msgEdit.key }) } catch (e) { console.log("Erro atualizar FNAF:", e.message) }
}

async function loopFnaf(sock, jogo, msgEdit) {
  if (jogo.finalizado) return
  const agora = Date.now()
  if (agora >= jogo.fimEm) {
    jogo.finalizado = true; jogosAtivos.delete(jogo.jid)
    if (jogo.noite >= 5) {
      await sock.sendMessage(jogo.jid, { text: `💧 • 𝐕𝐈𝐓𝐎́𝐑𝐈𝐀 •\n\n❄️ Sobreviveu TODAS as 5 noites\n🧊 Título: Lorde Demônio\n🧊 +5000 gold\n\n_"Rimuru te reconhece."_\n\n"${jogo.nomeBot}"` })
    } else {
      await sock.sendMessage(jogo.jid, { text: `💧 • 𝐍𝐎𝐈𝐓𝐄 ${jogo.noite} 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀 •\n\n❄️ Sobreviveu\n🧊 Próxima: Noite ${jogo.noite + 1}/5\n\n💡 \`${jogo.prefixo}fnaf começar\`\n\n"${jogo.nomeBot}"` })
    }
    return
  }
  const energiaCaindo = (jogo.velocidadeEnergia / 1000) * 0.1
  let energiaExtra = 0
  if (jogo.portas[0]) energiaExtra += 0.3; if (jogo.portas[1]) energiaExtra += 0.3
  if (jogo.luzes[0]) energiaExtra += 0.2; if (jogo.luzes[1]) energiaExtra += 0.2
  jogo.energia -= (energiaCaindo + energiaExtra)
  if (jogo.energia <= 0) { jogo.finalizado = true; jogosAtivos.delete(jogo.jid); await sock.sendMessage(jogo.jid, { text: `💧 • 𝐄𝐍𝐄𝐑𝐆𝐈𝐀 𝐄𝐒𝐆𝐎𝐓𝐀𝐃𝐀 •\n\n❄️ A escuridão consumiu tudo\n🧊 Foi pego pelos animatrônicos\n\n💡 \`${jogo.prefixo}fnaf começar\`\n\n"${jogo.nomeBot}"` }); return }
  for (const a of jogo.animatronicos) {
    if (a.posicao === "porta1" || a.posicao === "porta2") {
      const portaIdx = a.posicao === "porta1" ? 0 : 1
      const portaFechada = jogo.portas[portaIdx]
      if (portaFechada) {
        if (Math.random() > jogo.chanceFicar) { a.posicao = "corredor"; a.tempoPorta = 0 }
        else { a.tempoPorta = (a.tempoPorta || 0) + 1; if (a.tempoPorta >= 3) { jogo.finalizado = true; jogosAtivos.delete(jogo.jid); await sock.sendMessage(jogo.jid, { text: `💧 • 𝐆𝐀𝐌𝐄 𝐎𝐕𝐄𝐑 •\n\n❄️ ${a.emoji} ${a.nome} te pegou!\n🧊 Morreu na Noite ${jogo.noite}/5\n\n💡 \`${jogo.prefixo}fnaf começar\`\n\n"${jogo.nomeBot}"` }); return } }
      } else { jogo.finalizado = true; jogosAtivos.delete(jogo.jid); await sock.sendMessage(jogo.jid, { text: `💧 • 𝐆𝐀𝐌𝐄 𝐎𝐕𝐄𝐑 •\n\n❄️ ${a.emoji} ${a.nome} entrou pela porta aberta!\n🧊 Morreu na Noite ${jogo.noite}/5\n\n💡 \`${jogo.prefixo}fnaf começar\`\n\n"${jogo.nomeBot}"` }); return }
    } else {
      if (Math.random() < 0.5) { const idx = POSICOES.indexOf(a.posicao); if (idx < POSICOES.length - 1) { a.posicao = POSICOES[idx + 1]; if (a.posicao === "cozinha" && Math.random() < 0.5) { a.posicao = Math.random() < 0.5 ? "porta1" : "porta2" } } }
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
      async executar({ sock, msg, prefixoAtivo, db, sender, config, isDono, isSubDono, isAdmin, groupMetadata }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; const cfg = db.config()
        const { pushName, nomeDono, cargo, nomeBot } = getCargoETexto({ sender, config, db, groupMetadata, isDono, isSubDono, isAdmin, msg })
        await reagir(sock, msg, "💧")
        const texto = `${cardPerfil({ nomeBot, nomeUsuario: pushName, cargo, dono: nomeDono })}

${secao("🎮 ʟᴏʙʙʏ")}
${item(`${p}lobbyfnaf — cria lobby`)}
${item(`${p}entrarfnaf — entra`)}
${item(`${p}sairlobby — sai`)}
${item(`${p}iniciarfnaf — inicia`)}

${secao("🎯 ᴇᴍ ᴊᴏɢᴏ")}
${item(`${p}fecharporta 1/2`)}
${item(`${p}portaluz 1/2`)}
${item(`${p}cameras / ${p}statusfnaf`)}
${item(`${p}sairfnaf`)}

${secao("🐻 ᴀɴɪᴍᴀᴛʀᴏ̂ɴɪᴄᴏs")}
${item("🐻 Freddy / 🐰 Bonnie")}
${item("🐔 Chica / 🦊 Foxy")}

💧 Prefixo: \`${p}\`

_"Sobreviva se puder."_

"${nomeBot}"`
        if (cfg.fotoMenu) { const buf = Buffer.from(cfg.fotoMenu, "base64"); if (cfg.tipoMenu === "video") return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "rimuru.mp4", gifPlayback: true, caption: texto }, { quoted: msg }); return sock.sendMessage(jid, { image: buf, caption: texto }, { quoted: msg }) }
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    lobbyfnaf: {
      aliases: ["criarlobby", "novolobby"],
      async executar({ sock, msg, sender, utils, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        if (!jid.endsWith("@g.us")) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐋𝐎𝐁𝐁𝐘 •\n\n❄️ Só em grupos.\n\n"${nomeBot}"` }, { quoted: msg }) }
        if (jogosAtivos.has(jid)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐋𝐎𝐁𝐁𝐘 •\n\n❄️ Jogo em andamento.\n\n"${nomeBot}"` }, { quoted: msg }) }
        if (lobbys.has(jid)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐋𝐎𝐁𝐁𝐘 •\n\n❄️ Já tem lobby aberto.\n🧊 \`${p}entrarfnaf\`\n\n"${nomeBot}"` }, { quoted: msg }) }
        const num = utils.soNumero(sender)
        lobbys.set(jid, { criador: num, criadorJid: sender, jogadores: [sender], aberto: true, criadoEm: Date.now() })
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐋𝐎𝐁𝐁𝐘 •\n\n❄️ Aberto pra jogadores\n🧊 Host: @${num}\n🧊 Jogadores: 1/5\n🧊 1. @${num}\n\n💡 \`${p}entrarfnaf\` / \`${p}iniciarfnaf\`\n\n⚔️ Máx: 5\n\n"${nomeBot}"`, mentions: [sender] }, { quoted: msg })
      }
    },

    entrarlobby: {
      aliases: ["entrarfnaf", "entrarlobbyfnaf", "participo"],
      async executar({ sock, msg, sender, utils, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        if (!jid.endsWith("@g.us")) { await reagir(sock, msg, "🧊"); return }
        const lobby = lobbys.get(jid)
        if (!lobby || !lobby.aberto) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐋𝐎𝐁𝐁𝐘 •\n\n❄️ Sem lobby aberto.\n🧊 \`${p}lobbyfnaf\`\n\n"${nomeBot}"` }, { quoted: msg }) }
        const num = utils.soNumero(sender)
        if (lobby.jogadores.some(j => utils.soNumero(j) === num)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐋𝐎𝐁𝐁𝐘 •\n\n❄️ Você já tá no lobby.\n\n"${nomeBot}"` }, { quoted: msg }) }
        if (lobby.jogadores.length >= 5) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐋𝐎𝐁𝐁𝐘 •\n\n❄️ Lobby cheio.\n🧊 Máx 5\n\n"${nomeBot}"` }, { quoted: msg }) }
        lobby.jogadores.push(sender); let lista = ""
        lobby.jogadores.forEach((j, i) => { lista += `🧊 ${i + 1}. @${utils.soNumero(j)}\n` })
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐍𝐎𝐕𝐎 𝐉𝐎𝐆𝐀𝐃𝐎𝐑 •\n\n❄️ @${num} entrou\n🧊 ${lobby.jogadores.length}/5\n\n${lista}\n💡 \`${p}iniciarfnaf\`\n\n"${nomeBot}"`, mentions: lobby.jogadores }, { quoted: msg })
      }
    },

    sairlobby: {
      aliases: ["sairlobbyfnaf", "abandonarlobby"],
      async executar({ sock, msg, sender, utils, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const lobby = lobbys.get(jid); if (!lobby) return
        const num = utils.soNumero(sender); const idx = lobby.jogadores.findIndex(j => utils.soNumero(j) === num); if (idx === -1) return
        lobby.jogadores.splice(idx, 1)
        if (lobby.jogadores.length === 0) { lobbys.delete(jid); await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: `💧 • 𝐋𝐎𝐁𝐁𝐘 •\n\n❄️ Todos saíram. Cancelado.\n\n"${nomeBot}"` }, { quoted: msg }) }
        if (utils.soNumero(lobby.criadorJid) === num) { lobby.criador = utils.soNumero(lobby.jogadores[0]); lobby.criadorJid = lobby.jogadores[0] }
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐒𝐀𝐈𝐔 •\n\n❄️ @${num} saiu\n🧊 ${lobby.jogadores.length}/5\n\n"${nomeBot}"`, mentions: [sender] }, { quoted: msg })
      }
    },

    iniciarfnaf: {
      aliases: ["comecarfnaf", "startfnaf", "fnafcomecar"],
      async executar({ sock, msg, sender, utils, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        if (!jid.endsWith("@g.us")) { await reagir(sock, msg, "🧊"); return }
        if (jogosAtivos.has(jid)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐅𝐍𝐀𝐅 •\n\n❄️ Jogo em andamento.\n\n"${nomeBot}"` }, { quoted: msg }) }
        const lobby = lobbys.get(jid)
        if (!lobby) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐅𝐍𝐀𝐅 •\n\n❄️ Sem lobby.\n🧊 Use \`${p}lobbyfnaf\`\n\n"${nomeBot}"` }, { quoted: msg }) }
        const num = utils.soNumero(sender)
        if (utils.soNumero(lobby.criadorJid) !== num) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐅𝐍𝐀𝐅 •\n\n❄️ Só o host inicia.\n🧊 Host: @${lobby.criador}\n\n"${nomeBot}"`, mentions: [lobby.criadorJid] }, { quoted: msg }) }
        if (lobby.jogadores.length < 1) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐅𝐍𝐀𝐅 •\n\n❄️ Precisa 1+ jogador.\n\n"${nomeBot}"` }, { quoted: msg }) }
        lobby.aberto = false; lobbys.delete(jid)
        let noiteAtual = 1
        try { const progPath = path.join(DATA_DIR, "fnaf_progresso.json"); if (fs.existsSync(progPath)) { const prog = JSON.parse(fs.readFileSync(progPath, "utf8")); noiteAtual = (prog[lobby.criador]?.noite) || 1 } } catch (_) {}
        if (noiteAtual > 5) noiteAtual = 1
        const cfg = NOITES[noiteAtual - 1]
        const anims = [...ANIMATRONICOS].sort(() => Math.random() - 0.5).slice(0, cfg.animatronicos)
        const jogo = { jid, jogadores: lobby.jogadores, host: lobby.criador, hostJid: lobby.criadorJid, noite: noiteAtual, energia: 100, portas: [false, false], luzes: [false, false], animatronicos: anims.map(a => ({ ...a, posicao: "salao", tempoPorta: 0 })), fimEm: Date.now() + 4 * 60 * 1000, velocidadeAnim: cfg.velocidade, velocidadeEnergia: cfg.velocidadeEnergia, chanceFicar: cfg.chanceFicar, finalizado: false, nomeBot, prefixo: p }
        jogosAtivos.set(jid, jogo)
        let lista = ""; lobby.jogadores.forEach((j, i) => { lista += `🧊 ${i + 1}. @${utils.soNumero(j)}\n` })
        await reagir(sock, msg, "💧")
        const msgInicial = `💧 • 𝐅𝐍𝐀𝐅 𝐓𝐄𝐌𝐏𝐄𝐒𝐓 •\n\n❄️ NOITE ${noiteAtual}/5\n🧊 A noite começa...\n\n👥 Jogadores:\n${lista}\n⏰ Duração: 4min\n🧊 Energia: 100%\n🐻 Animatrônicos: ${cfg.animatronicos}\n🧊 Chance de não se abalar: ${Math.floor(cfg.chanceFicar * 100)}%\n\n⚔️ Use:\n🧊 \`${p}fecharporta 1/2\`\n🧊 \`${p}portaluz 1/2\`\n🧊 \`${p}cameras\`\n\n💧 _"Boa sorte, mortais."_\n\n"${nomeBot}"`
        const msgEdit = await sock.sendMessage(jid, { text: msgInicial, mentions: lobby.jogadores }, { quoted: msg })
        setTimeout(() => loopFnaf(sock, jogo, msgEdit), 5000)
      }
    },

    fecharporta: {
      aliases: ["portafechar"],
      async executar({ sock, msg, args, utils, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const jogo = jogosAtivos.get(jid); if (!jogo || jogo.finalizado) return
        const num = utils.soNumero(msg.key.participant || msg.key.remoteJid)
        if (!jogo.jogadores.some(j => utils.soNumero(j) === num)) return
        const idx = parseInt(args[0]) - 1
        if (idx !== 0 && idx !== 1) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐅𝐍𝐀𝐅 •\n\n❄️ Use 1 ou 2.\n🧊 \`${p}fecharporta 1\`\n\n"${nomeBot}"` }, { quoted: msg }) }
        jogo.portas[idx] = !jogo.portas[idx]
        const estado = jogo.portas[idx] ? "🔒 FECHADA" : "🔓 ABERTA"
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐅𝐍𝐀𝐅 •\n\n❄️ Porta ${idx + 1} ${estado}\n🧊 _"O Grande Sábio controla as portas."_\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    portaluz: {
      aliases: ["luzporta", "ligarluz"],
      async executar({ sock, msg, args, utils, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const jogo = jogosAtivos.get(jid); if (!jogo || jogo.finalizado) return
        const num = utils.soNumero(msg.key.participant || msg.key.remoteJid)
        if (!jogo.jogadores.some(j => utils.soNumero(j) === num)) return
        const idx = parseInt(args[0]) - 1
        if (idx !== 0 && idx !== 1) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐅𝐍𝐀𝐅 •\n\n❄️ Use 1 ou 2.\n🧊 \`${p}portaluz 1\`\n\n"${nomeBot}"` }, { quoted: msg }) }
        jogo.luzes[idx] = !jogo.luzes[idx]
        let msgExtra = ""
        if (jogo.luzes[idx]) { const animsNaPorta = jogo.animatronicos.filter(a => a.posicao === (idx === 0 ? "porta1" : "porta2")); if (animsNaPorta.length) msgExtra = "\n\n🚨 VIU:\n" + animsNaPorta.map(a => `🧊 ${a.emoji} ${a.nome}`).join("\n"); else msgExtra = "\n\n✅ _Nada por aqui..._" }
        const estado = jogo.luzes[idx] ? "🟢 LIGADA" : "⚫ APAGADA"
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐅𝐍𝐀𝐅 •\n\n❄️ Luz ${idx + 1} ${estado}${msgExtra}\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    cameras: {
      aliases: ["cam", "vercameras"],
      async executar({ sock, msg, utils, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const jogo = jogosAtivos.get(jid); if (!jogo || jogo.finalizado) return
        const num = utils.soNumero(msg.key.participant || msg.key.remoteJid)
        if (!jogo.jogadores.some(j => utils.soNumero(j) === num)) return
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: renderCameras(jogo) }, { quoted: msg })
      }
    },

    statusfnaf: {
      aliases: ["fnafstatus", "meufnaf", "statusjogo"],
      async executar({ sock, msg, utils, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const jogo = jogosAtivos.get(jid)
        if (!jogo || jogo.finalizado) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 • 𝐅𝐍𝐀𝐅 •\n\n❄️ Sem jogo em andamento.\n🧊 Use \`${p}lobbyfnaf\`\n\n"${nomeBot}"` }, { quoted: msg }) }
        const num = utils.soNumero(msg.key.participant || msg.key.remoteJid)
        if (!jogo.jogadores.some(j => utils.soNumero(j) === num)) return
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: renderStatus(jogo) }, { quoted: msg })
      }
    },

    sairfnaf: {
      aliases: ["abandonarfnaf", "cancelarfnaf", "fugirfnaf"],
      async executar({ sock, msg, utils, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const jogo = jogosAtivos.get(jid); if (!jogo || jogo.finalizado) return
        const num = utils.soNumero(msg.key.participant || msg.key.remoteJid)
        if (!jogo.jogadores.some(j => utils.soNumero(j) === num)) return
        jogo.finalizado = true; jogosAtivos.delete(jid)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐉𝐎𝐆𝐎 𝐄𝐍𝐂𝐄𝐑𝐑𝐀𝐃𝐎 •\n\n❄️ Você fugiu da lua\n🧊 _"Covarde."_\n\n💡 \`${p}lobbyfnaf\` pra criar outro\n\n"${nomeBot}"` }, { quoted: msg })
      }
    }

  }
}