/* ============================================================
   🐉 MENU DRAGÃO - COMO TREINAR SEU DRAGÃO
   ============================================================ */

const fs = require("fs")
const path = require("path")

const DATA_DIR = path.join(__dirname, "..", "..", "data")

function dbLer(a, p = {}) {
  const f = path.join(DATA_DIR, a)
  if (!fs.existsSync(f)) { fs.writeFileSync(f, JSON.stringify(p, null, 2)); return p }
  try { return JSON.parse(fs.readFileSync(f, "utf8")) } catch { return p }
}
function dbSalvar(a, d) { fs.writeFileSync(path.join(DATA_DIR, a), JSON.stringify(d, null, 2)) }

async function reagir(sock, msg, emoji) {
  try { await sock.sendMessage(msg.key.remoteJid, { react: { text: emoji, key: msg.key } }) } catch (_) {}
}

function nomeBotDb(db) { try { return db.config().nomeBot || "Rimuru Bot" } catch { return "Rimuru Bot" } }

const DRAGOES = {
  "Terror Terrível": { raridade: "Comum", chance: 60, foto: "https://static.wikia.nocookie.net/howtotrainyourdragon/images/6/6e/Terrible_Terror.png", hp: 100, energia: 50, atk: 10, def: 5, evasao: 10 },
  "Gronckle": { raridade: "Comum", chance: 60, foto: "https://static.wikia.nocookie.net/howtotrainyourdragon/images/5/5e/Gronckle.png", hp: 150, energia: 40, atk: 15, def: 20, evasao: 5 },
  "Nadder Mortal": { raridade: "Comum", chance: 60, foto: "https://static.wikia.nocookie.net/howtotrainyourdragon/images/4/4e/Deadly_Nadder.png", hp: 120, energia: 60, atk: 18, def: 10, evasao: 15 },
  "Pesadelo Monstruoso": { raridade: "Raro", chance: 25, foto: "https://static.wikia.nocookie.net/howtotrainyourdragon/images/7/7e/Monstrous_Nightmare.png", hp: 180, energia: 70, atk: 25, def: 15, evasao: 10 },
  "Ziperarrepiante": { raridade: "Raro", chance: 25, foto: "https://static.wikia.nocookie.net/howtotrainyourdragon/images/8/8e/Hideous_Zippleback.png", hp: 160, energia: 65, atk: 22, def: 18, evasao: 12 },
  "Nadder Mortal (Tempestade)": { raridade: "Raro", chance: 25, foto: "https://static.wikia.nocookie.net/howtotrainyourdragon/images/2/2e/Stormfly.png", hp: 140, energia: 75, atk: 24, def: 12, evasao: 18 },
  "Fúria da Noite": { raridade: "Épico", chance: 10, foto: "https://static.wikia.nocookie.net/howtotrainyourdragon/images/1/1e/Toothless.png", hp: 200, energia: 90, atk: 35, def: 20, evasao: 25 },
  "Fúria da Luz": { raridade: "Épico", chance: 10, foto: "https://static.wikia.nocookie.net/howtotrainyourdragon/images/3/3e/Light_Fury.png", hp: 200, energia: 90, atk: 35, def: 20, evasao: 25 },
  "Corta-Tormenta": { raridade: "Épico", chance: 10, foto: "https://static.wikia.nocookie.net/howtotrainyourdragon/images/5/5e/Stormcutter.png", hp: 220, energia: 85, atk: 30, def: 25, evasao: 20 },
  "Morte Vermelha": { raridade: "Lendário", chance: 5, foto: "https://static.wikia.nocookie.net/howtotrainyourdragon/images/9/9e/Red_Death.png", hp: 400, energia: 120, atk: 50, def: 40, evasao: 10 },
  "Morte Gritante": { raridade: "Lendário", chance: 5, foto: "https://static.wikia.nocookie.net/howtotrainyourdragon/images/6/6e/Screaming_Death.png", hp: 450, energia: 130, atk: 55, def: 45, evasao: 8 },
  "Bewilderbeast": { raridade: "Lendário", chance: 5, foto: "https://static.wikia.nocookie.net/howtotrainyourdragon/images/7/7e/Bewilderbeast.png", hp: 500, energia: 150, atk: 60, def: 50, evasao: 5 },
  "Fúria da Noite (Asa de Titã)": { raridade: "Mítico", chance: 0.1, foto: "https://static.wikia.nocookie.net/howtotrainyourdragon/images/1/1e/Toothless.png", hp: 600, energia: 200, atk: 80, def: 60, evasao: 30 }
}

function sortearDragao() {
  const roll = Math.random() * 100
  let raridadeAlvo = "Comum"
  if (roll < 0.1) raridadeAlvo = "Mítico"
  else if (roll < 5.1) raridadeAlvo = "Lendário"
  else if (roll < 15.1) raridadeAlvo = "Épico"
  else if (roll < 40.1) raridadeAlvo = "Raro"
  const candidatos = Object.entries(DRAGOES).filter(([_, d]) => d.raridade === raridadeAlvo)
  if (!candidatos.length) return null
  const [nome, dados] = candidatos[Math.floor(Math.random() * candidatos.length)]
  return { nome, ...dados }
}

function getDragoesUser(db, userId) {
  const d = dbLer("dragoes.json", { usuarios: {} })
  d.usuarios[userId] = d.usuarios[userId] || { dragoes: {}, ativo: null, emBatalha: null, dragaoBatalha: null }
  return { dbDragoes: d, user: d.usuarios[userId] }
}
function salvarDragoesUser(db, userId, user) {
  const d = dbLer("dragoes.json", { usuarios: {} })
  d.usuarios[userId] = user
  dbSalvar("dragoes.json", d)
}

const sessoes = new Map()
function chaveSessao(jid) { return `dragao_${jid}` }

module.exports = {
  menu: "menu-dragao",
  grupoOnly: true,
  adminOnly: false,
  donoOnly: false,

  commands: {

    dragao: {
      aliases: ["dragon", "dragaoon"],
      async executar({ sock, msg, args, db, prefixoAtivo, isDono, isSubDono, isAdmin }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const nomeBot = nomeBotDb(db)
        const op = (args[0] || "").toLowerCase()
        if (!isDono && !isSubDono && !isAdmin) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: `🐉 • 𝐀𝐕𝐈𝐒𝐎 •\n\n🌸 Apenas admins podem ativar.\n\n"${nomeBot}"` }, { quoted: msg })
        }
        const cfg = dbLer("dragaocfg.json", { grupos: {} })
        cfg.grupos[jid] = cfg.grupos[jid] || {}
        if (!["on", "off"].includes(op)) {
          const s = cfg.grupos[jid].ativo ? "ON ✅" : "OFF ❌"
          await reagir(sock, msg, "🐉")
          return sock.sendMessage(jid, { text: `🐉 • 𝐃𝐑𝐀𝐆𝐀̃𝐎 •\n\n🌸 Status: ${s}\n🐍 \`${p}dragao on/off\`\n\n"${nomeBot}"` }, { quoted: msg })
        }
        cfg.grupos[jid].ativo = op === "on"
        dbSalvar("dragaocfg.json", cfg)
        await reagir(sock, msg, "🐉")
        await sock.sendMessage(jid, { text: `🐉 • 𝐃𝐑𝐀𝐆𝐀̃𝐎 •\n\n🌸 Sistema ${op.toUpperCase()}\n🐍 Dragões podem aparecer a qualquer momento!\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    domar: {
      aliases: ["domesticar", "tamedragon"],
      async executar({ sock, msg, args, db, prefixoAtivo, sender }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const nomeBot = nomeBotDb(db)
        const nomeDragao = args.join(" ").trim()
        const chave = chaveSessao(jid)
        const sessao = sessoes.get(chave)
        if (!sessao) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: `🐉 • 𝐃𝐎𝐌𝐀𝐑 •\n\n🌸 Nenhum dragão apareceu ainda.\n🐍 Aguarde um aparecer.\n\n"${nomeBot}"` }, { quoted: msg })
        }
        if (Date.now() - sessao.timestamp > 60000) {
          sessoes.delete(chave)
          await reagir(sock, msg, "⏰")
          return sock.sendMessage(jid, { text: `🐉 • 𝐓𝐄𝐌𝐏𝐎 𝐄𝐒𝐆𝐎𝐓𝐀𝐃𝐎 •\n\n🌸 O dragão fugiu.\n\n"${nomeBot}"` }, { quoted: msg })
        }
        if (nomeDragao.toLowerCase() !== sessao.dragao.nome.toLowerCase()) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: `🐉 • 𝐍𝐎𝐌𝐄 𝐄𝐑𝐑𝐀𝐃𝐎 •\n\n🌸 O dragão é: *${sessao.dragao.nome}*\n🐍 Tente: \`${p}domar ${sessao.dragao.nome}\`\n\n"${nomeBot}"` }, { quoted: msg })
        }
        const chances = { "Comum": 70, "Raro": 50, "Épico": 30, "Lendário": 10, "Mítico": 1 }
        const chanceBase = chances[sessao.dragao.raridade] || 50
        if (Math.random() * 100 > chanceBase) {
          if (Math.random() < 0.5) {
            sessoes.delete(chave)
            await reagir(sock, msg, "💨")
            return sock.sendMessage(jid, { text: `🐉 • 𝐅𝐔𝐆𝐈𝐔 •\n\n🌸 O ${sessao.dragao.nome} não gostou de você e fugiu!\n\n"${nomeBot}"` }, { quoted: msg })
          } else {
            await reagir(sock, msg, "😤")
            return sock.sendMessage(jid, { text: `🐉 • 𝐅𝐀𝐋𝐇𝐎𝐔 •\n\n🌸 O ${sessao.dragao.nome} resistiu!\n🐍 Tente novamente: \`${p}domar ${sessao.dragao.nome}\`\n\n"${nomeBot}"` }, { quoted: msg })
          }
        }
        const userId = sender.split("@")[0]
        const { user } = getDragoesUser(db, userId)
        user.dragoes[sessao.dragao.nome] = {
          nome: sessao.dragao.nome, raridade: sessao.dragao.raridade, foto: sessao.dragao.foto,
          hp: sessao.dragao.hp, hpMax: sessao.dragao.hp, energia: sessao.dragao.energia, energiaMax: sessao.dragao.energia,
          atk: sessao.dragao.atk, def: sessao.dragao.def, evasao: sessao.dragao.evasao,
          evoluido: false, asaTita: false, domadoEm: Date.now()
        }
        salvarDragoesUser(db, userId, user)
        sessoes.delete(chave)
        await reagir(sock, msg, "🐉")
        await sock.sendMessage(jid, {
          image: { url: sessao.dragao.foto },
          caption: `🐉 • 𝐃𝐎𝐌𝐀𝐃𝐎! •\n\n🌸 *${sessao.dragao.nome}*\n🐍 Raridade: ${sessao.dragao.raridade}\n\n_"Bem-vindo ao seu novo companheiro."_\n\n"${nomeBot}"`
        }, { quoted: msg })
      }
    },

    alimentardragao: {
      aliases: ["feedragon", "alimentar"],
      async executar({ sock, msg, args, db, prefixoAtivo, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const nomeDragao = args.join(" ").trim()
        const userId = sender.split("@")[0]
        const { user } = getDragoesUser(db, userId)
        if (!user.dragoes[nomeDragao]) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: `🐉 • 𝐀𝐋𝐈𝐌𝐄𝐍𝐓𝐀𝐑 •\n\n🌸 Você não tem esse dragão.\n\n"${nomeBot}"` }, { quoted: msg })
        }
        const d = user.dragoes[nomeDragao]
        d.hp = Math.min(d.hpMax, d.hp + 30)
        d.energia = Math.min(d.energiaMax, d.energia + 20)
        salvarDragoesUser(db, userId, user)
        await reagir(sock, msg, "🍖")
        await sock.sendMessage(jid, { text: `🐉 • 𝐀𝐋𝐈𝐌𝐄𝐍𝐓𝐀𝐃𝐎 •\n\n🌸 *${nomeDragao}*\n🐍 HP: ${d.hp}/${d.hpMax}\n🌸 Energia: ${d.energia}/${d.energiaMax}\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    evoluirdragao: {
      aliases: ["evolve", "evoluir"],
      async executar({ sock, msg, args, db, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const nomeDragao = args.join(" ").trim()
        const userId = sender.split("@")[0]
        const { user } = getDragoesUser(db, userId)
        if (!user.dragoes[nomeDragao]) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: `🐉 • 𝐄𝐕𝐎𝐋𝐔𝐈𝐑 •\n\n🌸 Você não tem esse dragão.\n\n"${nomeBot}"` }, { quoted: msg })
        }
        const d = user.dragoes[nomeDragao]
        if (d.asaTita) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: `🐉 • 𝐉𝐀́ 𝐄́ 𝐀𝐒𝐀 𝐃𝐄 𝐓𝐈𝐓𝐀̃ •\n\n"${nomeBot}"` }, { quoted: msg })
        }
        if (Math.random() > 0.01) {
          await reagir(sock, msg, "💨")
          return sock.sendMessage(jid, { text: `🐉 • 𝐅𝐀𝐋𝐇𝐎𝐔 •\n\n🌸 O ${nomeDragao} não evoluiu... (1% de chance)\n🐍 Tente novamente.\n\n"${nomeBot}"` }, { quoted: msg })
        }
        d.asaTita = true
        d.evoluido = true
        d.hp = Math.floor(d.hp * 1.5)
        d.hpMax = Math.floor(d.hpMax * 1.5)
        d.energia = Math.floor(d.energia * 1.5)
        d.energiaMax = Math.floor(d.energiaMax * 1.5)
        d.atk = Math.floor(d.atk * 1.3)
        d.def = Math.floor(d.def * 1.3)
        salvarDragoesUser(db, userId, user)
        await reagir(sock, msg, "⚡")
        await sock.sendMessage(jid, {
          image: { url: d.foto },
          caption: `🐉 • 𝐀𝐒𝐀 𝐃𝐄 𝐓𝐈𝐓𝐀̃! •\n\n🌸 *${nomeDragao}* evoluiu!\n🐍 HP: ${d.hp}/${d.hpMax}\n🌸 Energia: ${d.energia}/${d.energiaMax}\n🐍 ATK: ${d.atk} | DEF: ${d.def}\n\n_"O poder de um Titã desperta."_\n\n"${nomeBot}"`
        }, { quoted: msg })
      }
    },

    meudragao: {
      aliases: ["meusdragoes", "mydragons"],
      async executar({ sock, msg, db, prefixoAtivo, sender }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const nomeBot = nomeBotDb(db)
        const userId = sender.split("@")[0]
        const { user } = getDragoesUser(db, userId)
        const dragoes = Object.values(user.dragoes)
        if (!dragoes.length) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: `🐉 • 𝐌𝐄𝐔𝐒 𝐃𝐑𝐀𝐆𝐎̃𝐄𝐒 •\n\n🌸 Você não tem nenhum dragão.\n🐍 Use \`${p}domar\` quando um aparecer.\n\n"${nomeBot}"` }, { quoted: msg })
        }
        let txt = `🐉 • 𝐌𝐄𝐔𝐒 𝐃𝐑𝐀𝐆𝐎̃𝐄𝐒 •\n\n`
        dragoes.forEach((d, i) => {
          const titulo = d.asaTita ? `⚡ ${d.nome} (ASA DE TITÃ)` : d.nome
          txt += `🐍 ${i + 1}. *${titulo}*\n   🌸 ${d.raridade} | HP: ${d.hp}/${d.hpMax} | EN: ${d.energia}/${d.energiaMax}\n`
        })
        txt += `\n_"A serpente observa seus dragões."_ 🐍\n\n"${nomeBot}"`
        await reagir(sock, msg, "🐉")
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    escolherdragao: {
      aliases: ["selectdragon", "escolher"],
      async executar({ sock, msg, args, db, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const nomeDragao = args.join(" ").trim()
        const userId = sender.split("@")[0]
        const { user } = getDragoesUser(db, userId)
        if (!user.dragoes[nomeDragao]) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: `🐉 • 𝐄𝐒𝐂𝐎𝐋𝐇𝐄𝐑 •\n\n🌸 Você não tem esse dragão.\n\n"${nomeBot}"` }, { quoted: msg })
        }
        user.dragaoBatalha = nomeDragao
        salvarDragoesUser(db, userId, user)
        await reagir(sock, msg, "⚔️")
        await sock.sendMessage(jid, { text: `🐉 • 𝐄𝐒𝐂𝐎𝐋𝐇𝐈𝐃𝐎 •\n\n🌸 *${nomeDragao}* está pronto para batalha!\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    batalhadragao: {
      aliases: ["batalhar", "battle"],
      async executar({ sock, msg, args, db, prefixoAtivo, sender }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const nomeBot = nomeBotDb(db)
        const ctx = msg.message?.extendedTextMessage?.contextInfo || {}
        const alvo = ctx.mentionedJid?.[0] || ctx.participant
        if (!alvo) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: `🐉 • 𝐁𝐀𝐓𝐀𝐋𝐇𝐀 •\n\n🌸 Marque alguém: \`${p}batalhadragao @user\`\n\n"${nomeBot}"` }, { quoted: msg })
        }
        const userId1 = sender.split("@")[0]
        const userId2 = alvo.split("@")[0]
        const { user: user1 } = getDragoesUser(db, userId1)
        const { user: user2 } = getDragoesUser(db, userId2)
        if (!Object.keys(user1.dragoes).length) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: `🐉 • 𝐄𝐑𝐑𝐎 •\n\n🌸 Você não tem dragões.\n\n"${nomeBot}"` }, { quoted: msg })
        }
        if (!Object.keys(user2.dragoes).length) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: `🐉 • 𝐄𝐑𝐑𝐎 •\n\n🌸 ${userId2} não tem dragões.\n\n"${nomeBot}"` }, { quoted: msg })
        }
        const chaveBatalha = `batalha_${jid}`
        sessoes.set(chaveBatalha, {
          jogador1: { id: userId1, dragao: null, hp: 0, hpMax: 0, energia: 0, energiaMax: 0, atk: 0, def: 0, evasao: 0, escolhido: false },
          jogador2: { id: userId2, dragao: null, hp: 0, hpMax: 0, energia: 0, energiaMax: 0, atk: 0, def: 0, evasao: 0, escolhido: false },
          turno: 0, timestamp: Date.now(), estado: "escolhendo", aguardando: 1
        })
        await reagir(sock, msg, "⚔️")
        await sock.sendMessage(jid, {
          text: `🐉 • 𝐁𝐀𝐓𝐀𝐋𝐇𝐀 𝐈𝐍𝐈𝐂𝐈𝐀𝐃𝐀 •\n\n🌸 @${userId1} vs @${userId2}\n\n🐍 *JOGADOR 1*, escolha seu dragão:\n\`${p}escolherdragao <nome>\`\n\n🌸 *JOGADOR 2*, aguarde...\n\n"${nomeBot}"`,
          mentions: [sender, alvo]
        }, { quoted: msg })
      }
    },

    ataque: {
      aliases: ["atacar", "attack"],
      async executar({ sock, msg, args, db, prefixoAtivo, sender }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const nomeBot = nomeBotDb(db)
        const numAtaque = parseInt(args[0])
        const userId = sender.split("@")[0]
        if (![1, 2, 3].includes(numAtaque)) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: `🐉 • 𝐀𝐓𝐀𝐐𝐔𝐄 •\n\n🌸 Use: \`${p}ataque 1\`, \`${p}ataque 2\` ou \`${p}ataque 3\`\n\n"${nomeBot}"` }, { quoted: msg })
        }
        const chaveBatalha = `batalha_${jid}`
        const batalha = sessoes.get(chaveBatalha)
        if (!batalha) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: `🐉 • 𝐄𝐑𝐑𝐎 •\n\n🌸 Nenhuma batalha ativa.\n\n"${nomeBot}"` }, { quoted: msg })
        }
        const atacante = batalha.jogador1.id === userId ? batalha.jogador1 : batalha.jogador2.id === userId ? batalha.jogador2 : null
        const defensor = atacante === batalha.jogador1 ? batalha.jogador2 : batalha.jogador1
        if (!atacante || !atacante.dragao) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: `🐉 • 𝐄𝐑𝐑𝐎 •\n\n🌸 Você não está na batalha ou não escolheu dragão.\n\n"${nomeBot}"` }, { quoted: msg })
        }
        const custos = { 1: 10, 2: 20, 3: 30 }
        const custo = custos[numAtaque]
        if (atacante.energia < custo) {
          await reagir(sock, msg, "⚡")
          return sock.sendMessage(jid, { text: `🐉 • 𝐒𝐄𝐌 𝐄𝐍𝐄𝐑𝐆𝐈𝐀 •\n\n🌸 ${atacante.dragao} não tem energia suficiente.\n🐍 Energia: ${atacante.energia}/${atacante.energiaMax}\n\n"${nomeBot}"` }, { quoted: msg })
        }
        atacante.energia -= custo
        const danoBase = { 1: atacante.atk * 0.5, 2: atacante.atk * 0.8, 3: atacante.atk * 1.2 }[numAtaque]
        const critico = Math.random() < 0.15
        const danoFinal = Math.floor(danoBase * (critico ? 2 : 1) * (0.9 + Math.random() * 0.2))
        const esquivou = Math.random() * 100 < defensor.evasao
        let log = ""
        if (esquivou) {
          log = `🌸 ${defensor.dragao} esquivou do ataque!`
        } else {
          defensor.hp -= danoFinal
          log = `🐍 ${atacante.dragao} usou ataque ${numAtaque}!\n🌸 Dano: ${danoFinal}${critico ? " 💥 CRÍTICO!" : ""}\n🐍 ${defensor.dragao} HP: ${Math.max(0, defensor.hp)}/${defensor.hpMax}`
        }
        if (defensor.hp <= 0 || defensor.energia <= 0) {
          const vencedor = defensor.hp <= 0 ? atacante : defensor
          sessoes.delete(chaveBatalha)
          await reagir(sock, msg, "🏆")
          return sock.sendMessage(jid, { text: `🐉 • 𝐁𝐀𝐓𝐀𝐋𝐇𝐀 𝐄𝐍𝐂𝐄𝐑𝐑𝐀𝐃𝐀 •\n\n🏆 Vencedor: ${vencedor.dragao} (@${vencedor.id})\n\n${log}\n\n"${nomeBot}"` }, { quoted: msg })
        }
        await reagir(sock, msg, "⚔️")
        await sock.sendMessage(jid, { text: `🐉 • 𝐓𝐔𝐑𝐍𝐎 •\n\n${log}\n\n🌸 Vez de @${defensor.id}\n🐍 Use \`${p}ataque 1/2/3\`\n\n"${nomeBot}"` }, { quoted: msg })
      }
    }

  }
}