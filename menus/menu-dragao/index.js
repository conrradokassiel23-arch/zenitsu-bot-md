/* ============================================================
   🐉 MENU DRAGÃO - RIMURU BOT MD (BLOQUEIO ON/OFF + KEYS)
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

function getAlvo(msg) {
  const ctx = (msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo) || {};
  const mentions = ctx.mentionedJid || [];
  if (mentions.length) return mentions[0];
  if (ctx.participant) return ctx.participant;
  return null;
}

// 🔥 FUNÇÃO QUE VERIFICA SE O SISTEMA TÁ ATIVO NO GRUPO 🔥
function sistemaAtivo(db, jid) {
  const cfg = dbLer("dragaocfg.json", { grupos: {} })
  return cfg.grupos[jid]?.ativo === true
}

function gerarKeyAleatoria() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = 'KEY-';
  for (let i = 0; i < 8; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

// FUNÇÕES DE RESPOSTA PREMIUM
function msgSucesso(titulo, aviso, detalhes, rodape, nomeBot) {
  return `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🍏 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 🍏
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ 🟢 ${titulo}
┃ 🧊 ${aviso}
╰━━━━━━━━━━━━━━━━━━━━━━╯

💧 ${detalhes}

${rodape ? rodape + "\n\n" : ""}🧊 _"${nomeBot}"_`
}

function msgAviso(titulo, aviso, detalhes, rodape, nomeBot) {
  return `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 💧 𝐀𝐕𝐈𝐒𝐎 💧
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ 🧊 ${titulo}
┃ 🍏 ${aviso}
╰━━━━━━━━━━━━━━━━━━━━━━╯

🟢 ${detalhes}

${rodape ? rodape + "\n\n" : ""}🧊 _"${nomeBot}"_`
}

function msgErro(titulo, aviso, detalhes, rodape, nomeBot) {
  return `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 💨 𝐄𝐑𝐑𝐎 💨
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ 🍏 ${titulo}
┃ 🧊 ${aviso}
╰━━━━━━━━━━━━━━━━━━━━━━╯

💧 ${detalhes}

${rodape ? rodape + "\n\n" : ""}🟢 _"${nomeBot}"_`
}

const DRAGOES = {
  "Terror Terrível": { raridade: "Comum", foto: "https://files.catbox.moe/0055r7.jpg", hp: 100, energia: 50, atk: 10, def: 5, evasao: 10, xp: 10, bioma: "Comum" },
  "Gronckle": { raridade: "Comum", foto: "https://files.catbox.moe/9yvvc5.jpg", hp: 150, energia: 40, atk: 15, def: 20, evasao: 5, xp: 10, bioma: "Comum" },
  "Nadder Mortal": { raridade: "Comum", foto: "https://files.catbox.moe/762qus.jpg", hp: 120, energia: 60, atk: 18, def: 10, evasao: 15, xp: 15, bioma: "Comum" },
  "Pesadelo Monstruoso": { raridade: "Raro", foto: "https://files.catbox.moe/g4ocxh.jpg", hp: 180, energia: 70, atk: 25, def: 15, evasao: 10, xp: 20, bioma: "Comum" },
  "Ziperarrepiante": { raridade: "Raro", foto: "https://files.catbox.moe/yk9eic.jpg", hp: 160, energia: 65, atk: 22, def: 18, evasao: 12, xp: 20, bioma: "Comum" },
  "Nadder Mortal (Tempestade)": { raridade: "Raro", foto: "https://files.catbox.moe/bwhqmc.jpg", hp: 140, energia: 75, atk: 24, def: 12, evasao: 18, xp: 25, bioma: "Floresta" },
  "Fúria da Noite": { raridade: "Épico", foto: "https://files.catbox.moe/06lj5i.jpg", hp: 200, energia: 90, atk: 35, def: 20, evasao: 25, xp: 50, bioma: "Caverna" },
  "Fúria da Luz": { raridade: "Épico", foto: "https://files.catbox.moe/vz770u.jpg", hp: 200, energia: 90, atk: 35, def: 20, evasao: 25, xp: 50, bioma: "Caverna" },
  "Corta-Tormenta": { raridade: "Épico", foto: "https://files.catbox.moe/js58qw.jpg", hp: 220, energia: 85, atk: 30, def: 25, evasao: 20, xp: 60, bioma: "Praia" },
  "Morte Vermelha": { raridade: "Lendário", foto: "https://files.catbox.moe/45uete.jpg", hp: 400, energia: 120, atk: 50, def: 40, evasao: 10, xp: 100, bioma: "Montanha" },
  "Morte Gritante": { raridade: "Lendário", foto: "https://files.catbox.moe/lh62l3.jpg", hp: 450, energia: 130, atk: 55, def: 45, evasao: 8, xp: 120, bioma: "Montanha" },
  "Bewilderbeast": { raridade: "Lendário", foto: "https://files.catbox.moe/r47clm.jpg", hp: 500, energia: 150, atk: 60, def: 50, evasao: 5, xp: 150, bioma: "Gelo" },
  "Asa de Fogo": { raridade: "Lendário", foto: "https://i.ibb.co/DD1xPGdR/IMG-20261103-WA0004.jpg", hp: 480, energia: 140, atk: 58, def: 45, evasao: 15, xp: 130, bioma: "Vulcão" },
  "Morte Púrpura": { raridade: "Lendário", foto: "https://i.ibb.co/Y4xbSPBh/IMG-20261103-WA0002.jpg", hp: 460, energia: 135, atk: 55, def: 48, evasao: 12, xp: 135, bioma: "Pântano" },
  "Fúria da Noite (Asa de Titã)": { raridade: "Mítico", foto: "https://files.catbox.moe/r91204.jpg", hp: 600, energia: 200, atk: 80, def: 60, evasao: 30, xp: 250, bioma: "Secreto" },
  "Death Song": { raridade: "Mítico", foto: "https://i.ibb.co/k2pr1csQ/IMG-20261103-WA0001.jpg", hp: 650, energia: 220, atk: 85, def: 65, evasao: 25, xp: 280, bioma: "Selva Sombria" },
  "Estridente": { raridade: "Mítico", foto: "https://i.ibb.co/j9RSQpQf/IMG-20261103-WA0003.jpg", hp: 620, energia: 210, atk: 80, def: 60, evasao: 35, xp: 260, bioma: "Montanha Rochosa" }
};

const OVOS = {
  "Ovo Comum": { raridade: "Comum", choca: ["Terror Terrível", "Gronckle", "Nadder Mortal"], foto: "https://files.catbox.moe/0055r7.jpg" },
  "Ovo Raro": { raridade: "Raro", choca: ["Pesadelo Monstruoso", "Ziperarrepiante", "Nadder Mortal (Tempestade)"], foto: "https://files.catbox.moe/g4ocxh.jpg" },
  "Ovo Épico": { raridade: "Épico", choca: ["Fúria da Noite", "Fúria da Luz", "Corta-Tormenta"], foto: "https://files.catbox.moe/06lj5i.jpg" },
  "Ovo Lendário": { raridade: "Lendário", choca: ["Morte Vermelha", "Morte Gritante", "Bewilderbeast", "Asa de Fogo", "Morte Púrpura"], foto: "https://files.catbox.moe/45uete.jpg" },
  "Ovo Mítico": { raridade: "Mítico", choca: ["Death Song", "Estridente", "Fúria da Noite (Asa de Titã)"], foto: "https://files.catbox.moe/r91204.jpg" }
}

const MISSOES = {
  "pirata": { nome: "Resgatar dragões de navios piratas", raridade: "Comum", nivelMin: 1, dragaoAlvo: "Terror Terrível", xp: 50, dropOvo: "Ovo Comum", chanceDrop: 5, foto: "https://files.catbox.moe/0055r7.jpg" },
  "banguela": { nome: "Salvar o Banguela", raridade: "Média", nivelMin: 2, dragaoAlvo: "Fúria da Noite", xp: 100, dropOvo: "Ovo Épico", chanceDrop: 5, foto: "https://files.catbox.moe/06lj5i.jpg" },
  "morte_gritante": { nome: "Derrote o Morte Gritante", raridade: "Lendária", nivelMin: 5, dragaoAlvo: "Morte Gritante", xp: 250, dropOvo: "Ovo Lendário", chanceDrop: 5, foto: "https://files.catbox.moe/lh62l3.jpg" },
  "estridante": { nome: "Derrote o Estridente", raridade: "Mítica", nivelMin: 8, dragaoAlvo: "Estridente", xp: 500, dropOvo: "Ovo Mítico", chanceDrop: 5, foto: "https://i.ibb.co/j9RSQpQf/IMG-20261103-WA0003.jpg" }
};

const BOSSES = {
  "Morte Vermelha (Boss)": { raridade: "Lendário", foto: "https://files.catbox.moe/45uete.jpg", hp: 800, atk: 50, def: 30, evasao: 5, xp: 200, dropOvo: "Ovo Lendário" },
  "Morte Gritante (Boss)": { raridade: "Lendário", foto: "https://files.catbox.moe/lh62l3.jpg", hp: 850, atk: 55, def: 35, evasao: 5, xp: 250, dropOvo: "Ovo Lendário" },
  "Bewilderbeast (Boss)": { raridade: "Lendário", foto: "https://files.catbox.moe/r47clm.jpg", hp: 1000, atk: 60, def: 40, evasao: 5, xp: 300, dropOvo: "Ovo Lendário" },
  "Death Song (Boss)": { raridade: "Mítico", foto: "https://i.ibb.co/k2pr1csQ/IMG-20261103-WA0001.jpg", hp: 1200, atk: 70, def: 50, evasao: 15, xp: 500, dropOvo: "Ovo Mítico" },
  "Estridente (Boss)": { raridade: "Mítico", foto: "https://i.ibb.co/j9RSQpQf/IMG-20261103-WA0003.jpg", hp: 1100, atk: 75, def: 45, evasao: 20, xp: 450, dropOvo: "Ovo Mítico" }
};

const SALAS_RUINA = [
  { nivel: 1, hpInimigo: 150, atkInimigo: 15, xp: 30 },
  { nivel: 2, hpInimigo: 300, atkInimigo: 25, xp: 60 },
  { nivel: 3, hpInimigo: 500, atkInimigo: 40, xp: 120 },
  { nivel: 4, hpInimigo: 800, atkInimigo: 60, xp: 200 },
  { nivel: 5, hpInimigo: 1200, atkInimigo: 90, xp: 350 }
];

function buscarUsuario(db, sender, msg) {
  const d = dbLer("dragoes.json", { usuarios: {} })
  
  let numSender = String(sender).replace(/\D/g, "")
  if (msg && msg.key && msg.key.participant && !msg.key.participant.endsWith("@lid")) {
      numSender = String(msg.key.participant).replace(/\D/g, "")
  }
  if (!numSender || numSender.length < 8) {
      numSender = String(sender).replace(/\D/g, "")
  }

  let idOriginal = String(sender).split("@")[0].split(":")[0]
  
  if (!numSender && !idOriginal) return { dbDragoes: d, user: { dragoes: {}, gold: 0, hpVila: 100, maxVila: 100, nivelVila: 1, xpTreinador: 0, nivelTreinador: 1, inventario: { selas: 0, pergaminhos: 0, ovos: {} }, pvpAtivo: true, ultimaMissao: 0, ultimoBoss: 0, ultimaRuina: 0 }, idReal: "0@s.whatsapp.net" }

  let idEncontrado = null
  for (const key of Object.keys(d.usuarios)) {
    const u = d.usuarios[key]
    if (numSender && numSender.length > 8 && (key.includes(numSender) || (u.telefoneReal && u.telefoneReal === numSender))) { idEncontrado = key; break }
    if (idOriginal && key.split("@")[0].split(":")[0] === idOriginal) { idEncontrado = key; break }
    if (u.apelidos && u.apelidos.some(ap => (idOriginal && ap.includes(idOriginal)) || (numSender.length > 8 && ap.includes(numSender)))) { idEncontrado = key; break }
  }

  if (idEncontrado) {
    const u = d.usuarios[idEncontrado]
    if (!u.apelidos) u.apelidos = []
    if (idOriginal && !u.apelidos.includes(idOriginal)) u.apelidos.push(idOriginal)
    if (numSender && !u.telefoneReal) u.telefoneReal = numSender
    
    u.xpTreinador = typeof u.xpTreinador === "number" ? u.xpTreinador : 0
    u.nivelTreinador = typeof u.nivelTreinador === "number" ? u.nivelTreinador : 1
    u.nivelVila = typeof u.nivelVila === "number" ? u.nivelVila : 1
    u.maxVila = typeof u.maxVila === "number" ? u.maxVila : 100
    u.ultimaMissao = u.ultimaMissao || 0
    u.ultimoBoss = u.ultimoBoss || 0
    u.ultimaRuina = u.ultimaRuina || 0
    u.inventario = u.inventario || { selas: 0, pergaminhos: 0, ovos: {} }
    u.inventario.ovos = u.inventario.ovos || {}
    
    dbSalvar("dragoes.json", d)
    return { dbDragoes: d, user: u, idReal: idEncontrado }
  }

  const novoId = (numSender || idOriginal) + "@s.whatsapp.net"
  d.usuarios[novoId] = { dragoes: {}, gold: 0, hpVila: 100, maxVila: 100, nivelVila: 1, xpTreinador: 0, nivelTreinador: 1, inventario: { selas: 0, pergaminhos: 0, ovos: {} }, dragaoBatalha: null, pvpAtivo: true, ultimaMissao: 0, ultimoBoss: 0, ultimaRuina: 0, telefoneReal: numSender, apelidos: [idOriginal] }
  dbSalvar("dragoes.json", d)
  return { dbDragoes: d, user: d.usuarios[novoId], idReal: novoId }
}

function salvarDragoesUser(db, idReal, user) {
  const d = dbLer("dragoes.json", { usuarios: {} })
  d.usuarios[idReal] = user
  dbSalvar("dragoes.json", d)
}

function getSessao(jid) { const s = dbLer("dragoesessoes.json", {}); return s[jid] || null; }
function setSessao(jid, sessao) { const s = dbLer("dragoesessoes.json", {}); s[jid] = sessao; dbSalvar("dragoesessoes.json", s); }
function delSessao(jid) { const s = dbLer("dragoesessoes.json", {}); delete s[jid]; dbSalvar("dragoesessoes.json", s); }

function darXp(user, qtd) {
  if (user.nivelTreinador >= 15) {
    user.nivelTreinador = 15;
    user.xpTreinador = 0;
    return false;
  }
  
  user.xpTreinador = (user.xpTreinador || 0) + qtd;
  let upou = false;
  
  while (user.nivelTreinador < 15) {
    const xpNec = user.nivelTreinador * 200;
    if (user.xpTreinador >= xpNec) {
      user.nivelTreinador++;
      user.xpTreinador -= xpNec;
      upou = true;
    } else {
      break;
    }
  }
  
  if (user.nivelTreinador >= 15) {
    user.nivelTreinador = 15;
    user.xpTreinador = 0;
  }
  
  return upou;
}

async function rendaAutomatica(sock, db) {
  const cfg = dbLer("dragaocfg.json", { grupos: {} })
  const gruposAtivos = Object.entries(cfg.grupos || {}).filter(([_, c]) => c.ativo === true)
  if (!gruposAtivos.length) return
  if (Math.random() > 0.2) return 

  const [jidGrupo] = gruposAtivos[Math.floor(Math.random() * gruposAtivos.length)]
  const dAll = dbLer("dragoes.json", { usuarios: {} })
  
  const usersNoGrupo = Object.keys(dAll.usuarios).filter(u => (dAll.usuarios[u].dragoes && Object.keys(dAll.usuarios[u].dragoes).length > 0))
  if (!usersNoGrupo.length) return

  const userId = usersNoGrupo[Math.floor(Math.random() * usersNoGrupo.length)]
  const user = dAll.usuarios[userId]
  const dragoesNomes = Object.keys(user.dragoes)
  const dragaoNome = dragoesNomes[Math.floor(Math.random() * dragoesNomes.length)]
  const dragao = user.dragoes[dragaoNome]
  const infoDragao = DRAGOES[dragao.nome.replace(" (Asa de Titã)", "").replace(" (Bebê)", "")] || DRAGOES[dragaoNome]

  const defesa = (dragao.atk + dragao.def + (dragao.nivel * 5)) * (dragao.asaTita ? 1.5 : 1)
  const ataqueCacador = 50 + Math.random() * 50

  let texto = `🏹 • 𝐈𝐍𝐕𝐀𝐒𝐀̃𝐎 𝐃𝐄 𝐂𝐀𝐂̧𝐀𝐃𝐎𝐑𝐄𝐒! •\n\n🌸 Caçadores estão atacando a vila de @${userId.split("@")[0]}!\n\n`
  
  if (defesa >= ataqueCacador) {
    user.gold = (user.gold || 0) + 100
    const xpGanha = infoDragao ? infoDragao.xp : 20
    const upou = darXp(user, xpGanha)
    dbSalvar("dragoes.json", dAll)
    texto += `🐍 *${dragaoNome}* defendeu a vila com sucesso!\n🌸 Defesa: ${Math.floor(defesa)} vs Ataque: ${Math.floor(ataqueCacador)}\n\n🪙 Recompensa: +100 Gold\n✨ XP: +${xpGanha}${upou ? `\n⭐ **UPOU PARA NÍVEL ${user.nivelTreinador}!**` : ""}\n\n_"A serpente protege os seus."_ 🐍`
  } else {
    user.hpVila = (user.hpVila || 100) - 25
    if (user.hpVila < 0) user.hpVila = 0
    dbSalvar("dragoes.json", dAll)
    texto += `🩸 *${dragaoNome}* não resistiu!\n🌸 Defesa: ${Math.floor(defesa)} vs Ataque: ${Math.floor(ataqueCacador)}\n\n🏚️ Vida da vila: ${user.hpVila}/${user.maxVila}\n\n_"Precisamos treinar mais."_ 🐍`
  }
  await sock.sendMessage(jidGrupo, { text: texto, mentions: [userId] })
}module.exports = {
  menu: "menu-dragao",
  grupoOnly: true,
  adminOnly: false,
  donoOnly: false,
  rendaAutomatica,

  commands: {

    menudragao: {
      aliases: ["dragaomenu", "comandosdragao"],
      async executar({ sock, msg, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const nomeBot = nomeBotDb(db)
        const cfg = db.config() || {}

        const texto = `🐉 • 𝐌𝐄𝐍𝐔 𝐃𝐑𝐀𝐆𝐀̃𝐎 •\n\n` +
        `╭━〔 🐍 𝐆𝐄𝐑𝐀𝐋 〕━╮\n` +
        `┃ 🩵 ${p}dragao on/off\n` +
        `┃ 🤍 ${p}domar <nome>\n` +
        `┃ 🧊 ${p}meudragao\n` +
        `┃ 👁️ ${p}verdragao @user\n` +
        `┃ ☁️ ${p}alimentardragao <nome>\n` +
        `┃ 🦋 ${p}treinadordg\n` +
        `┃ 🏰 ${p}uparvila\n` +
        `╰━━━━━━━━━━━━━━━╯\n\n` +
        `╭━〔 ⚔️ 𝐀𝐂̧𝐎̃𝐄𝐒 〕━╮\n` +
        `┃ 🛡️ ${p}batalha on/off\n` +
        `┃ 🏟️ ${p}batalhadragao\n` +
        `┃ 🌸 ${p}escolherdg <nº>\n` +
        `┃ 🐉 ${p}ataque 1/2/3\n` +
        `┃ 👹 ${p}boss\n` +
        `┃ 🏛️ ${p}ruinas\n` +
        `╰━━━━━━━━━━━━━━━╯\n\n` +
        `╭━〔 🪙 𝐄𝐂𝐎𝐍𝐎𝐌𝐈𝐀 〕━╮\n` +
        `┃ 💰 ${p}saldo / ${p}lojadragao\n` +
        `┃ 🛒 ${p}comprardragao <item>\n` +
        `┃ 🎒 ${p}inventariodragao\n` +
        `┃ 🐎 ${p}usarsela <nome>\n` +
        `┃ 📜 ${p}evoluirdragao <nome>\n` +
        `╰━━━━━━━━━━━━━━━━━╯\n\n` +
        `╭━〔 🥚 𝐎𝐕𝐎𝐒 & 𝐕𝐎𝐎 〕━╮\n` +
        `┃ ☁️ ${p}voar <nome>\n` +
        `┃ 🐣 ${p}chocarovo <nome>\n` +
        `┃ 📖 ${p}livrodg\n` +
        `╰━━━━━━━━━━━━━━━━━╯\n\n` +
        `╭━〔 📜 𝐌𝐈𝐒𝐒𝐎̃𝐄𝐒 〕━╮\n` +
        `┃ ⚔️ ${p}missao\n` +
        `╰━━━━━━━━━━━━━━━╯\n\n` +
        `_"O Grande Sábio observa."_ 🐍\n\n"${nomeBot}"`

        await reagir(sock, msg, "🐉")
        
        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          try {
            if (cfg.tipoMenu === "video") return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "menu.mp4", gifPlayback: true, caption: texto }, { quoted: msg })
            return sock.sendMessage(jid, { image: buf, caption: texto }, { quoted: msg })
          } catch (e) { return sock.sendMessage(jid, { text: texto }, { quoted: msg }) }
        }
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    dragao: {
      aliases: ["dragon", "dragaoon"],
      async executar({ sock, msg, args, db, prefixoAtivo, isDono, isSubDono, isAdmin }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const nomeBot = nomeBotDb(db)
        const op = (args[0] || "").toLowerCase()

        if (!isDono && !isSubDono && !isAdmin) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐀𝐕𝐈𝐒𝐎", "Apenas admins podem ativar.", `Use o comando \`${p}menuadm\` para ver os comandos de administração.`, null, nomeBot) }, { quoted: msg })
        }

        const cfg = dbLer("dragaocfg.json", { grupos: {} })
        cfg.grupos[jid] = cfg.grupos[jid] || {}

        if (!["on", "off"].includes(op)) {
          const s = cfg.grupos[jid].ativo ? "ON ✅" : "OFF ❌"
          await reagir(sock, msg, "🐉")
          return sock.sendMessage(jid, { text: msgAviso("𝐃𝐑𝐀𝐆𝐀̃𝐎", `O sistema está atualmente: ${s}`, `Use \`${p}dragao on\` ou \`${p}dragao off\` para mudar.`, null, nomeBot) }, { quoted: msg })
        }

        cfg.grupos[jid].ativo = op === "on"
        dbSalvar("dragaocfg.json", cfg)
        await reagir(sock, msg, "🐉")
        await sock.sendMessage(jid, { text: msgSucesso("𝐃𝐑𝐀𝐆𝐀̃𝐎", `Sistema ${op.toUpperCase()}`, "Os dragões selvagens podem aparecer no grupo!", null, nomeBot) }, { quoted: msg })
      }
    },

    batalha: {
      aliases: ["pvp", "permitirbatalha"],
      async executar({ sock, msg, args, db, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)

        if (!sistemaAtivo(db, jid)) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐎𝐅𝐅", "O jogo está desativado.", `Um administrador precisa usar \`+dragao on\` para ativar.`, null, nomeBot) }, { quoted: msg })
        }

        const op = (args[0] || "").toLowerCase()
        const { user, idReal } = buscarUsuario(db, sender, msg)

        if (user.pvpAtivo === undefined) user.pvpAtivo = true

        if (!["on", "off"].includes(op)) {
          const s = user.pvpAtivo ? "ON ✅" : "OFF ❌"
          await reagir(sock, msg, "⚔️")
          return sock.sendMessage(jid, { text: msgAviso("𝐁𝐀𝐓𝐀𝐋𝐇𝐀 𝐏𝐕𝐏", `Status atual: ${s}`, `Para mudar, use \`+batalha on\` ou \`+batalha off\`.`, null, nomeBot) }, { quoted: msg })
        }

        user.pvpAtivo = op === "on"
        salvarDragoesUser(db, idReal, user)
        
        await reagir(sock, msg, op === "on" ? "🟢" : "🔴")
        await sock.sendMessage(jid, { text: msgSucesso("𝐁𝐀𝐓𝐀𝐋𝐇𝐀 𝐏𝐕𝐏", `Você ${op === "on" ? "AGORA PODE" : "NÃO PODE MAIS"} ser desafiado!`, `Status: ${op.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
      }
    },

    treinadordg: {
      aliases: ["meutreinador", "leveltreinador"],
      async executar({ sock, msg, db, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)

        if (!sistemaAtivo(db, jid)) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐎𝐅𝐅", "O jogo está desativado.", `Um administrador precisa usar \`+dragao on\` para ativar.`, null, nomeBot) }, { quoted: msg })
        }

        const { user } = buscarUsuario(db, sender, msg) 
        
        const xpNec = user.nivelTreinador * 200
        const progresso = Math.floor((user.xpTreinador / xpNec) * 10)
        const barra = "🟢".repeat(Math.min(10, progresso)) + "⬛".repeat(Math.max(0, 10 - progresso))

        const texto = msgSucesso(
          "𝐓𝐑𝐄𝐈𝐍𝐀𝐃𝐎𝐑",
          "Seu progresso atual",
          `🌸 Nível: *${user.nivelTreinador}* / 15\n🐍 XP: *${user.xpTreinador}* / ${xpNec}\n${barra}\n\n🏰 Vila Nível: ${user.nivelVila}/6`,
          `💡 Use \`+missao\` para ganhar XP!`,
          nomeBot
        )
        
        await reagir(sock, msg, "🐍")
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    uparvila: {
      aliases: ["upvila", "evoluirvila"],
      async executar({ sock, msg, db, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)

        if (!sistemaAtivo(db, jid)) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐎𝐅𝐅", "O jogo está desativado.", `Um administrador precisa usar \`+dragao on\` para ativar.`, null, nomeBot) }, { quoted: msg })
        }

        const { user, idReal } = buscarUsuario(db, sender, msg)

        if (user.nivelVila >= 6) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgAviso("𝐕𝐈𝐋𝐀 𝐌𝐀𝐗𝐈𝐌𝐀", "Sua vila já está no nível máximo (6).", `Vida: ${user.hpVila}/${user.maxVila}`, null, nomeBot) }, { quoted: msg })
        }

        const custo = user.nivelVila * 200
        if ((user.gold || 0) < custo) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐆𝐎𝐋𝐃", "Você não tem ouro suficiente.", `Custa *${custo} Gold* para upar.\nSeu saldo: *${user.gold}*`, null, nomeBot) }, { quoted: msg })
        }

        user.gold -= custo
        user.nivelVila += 1
        user.maxVila = 100 + (user.nivelVila - 1) * 120
        if (user.maxVila > 700) user.maxVila = 700
        user.hpVila = user.maxVila

        salvarDragoesUser(db, idReal, user)
        await reagir(sock, msg, "🏰")
        await sock.sendMessage(jid, { text: msgSucesso("𝐕𝐈𝐋𝐀 𝐔𝐏𝐀𝐃𝐀", "Sua vila cresceu!", `🌸 Novo Nível: *${user.nivelVila}*\n🐍 Vida Máxima: *${user.maxVila}*\n🪙 Gold restante: ${user.gold}`, null, nomeBot) }, { quoted: msg })
      }
    },

    meudragao: {
      aliases: ["meusdragoes", "mydragons"],
      async executar({ sock, msg, db, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)

        if (!sistemaAtivo(db, jid)) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐎𝐅𝐅", "O jogo está desativado.", `Um administrador precisa usar \`+dragao on\` para ativar.`, null, nomeBot) }, { quoted: msg })
        }

        const { user } = buscarUsuario(db, sender, msg)
        const dragoes = Object.values(user.dragoes)

        if (!dragoes.length) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐍𝐄𝐍𝐇𝐔𝐌 𝐃𝐑𝐀𝐆𝐀̃𝐎", "Você ainda não domou nenhum.", `Use o comando \`+domar <nome>\` quando um dragão aparecer no grupo.`, "🍏 _A serpente aguarda._", nomeBot) }, { quoted: msg })
        }

        let txt = msgSucesso(
          "𝐒𝐄𝐔𝐒 𝐃𝐑𝐀𝐆𝐎̃𝐄𝐒",
          "Aqui está a sua coleção!",
          `🪙 Gold: *${user.gold || 0}*\n🏰 Vila: *${user.hpVila}/${user.maxVila}* (Nv. ${user.nivelVila})\n🛡️ PvP: *${user.pvpAtivo === false ? "OFF" : "ON"}*`,
          null,
          nomeBot
        )

        txt += `\n\n`
        dragoes.forEach((d, i) => {
          const titulo = d.asaTita ? `⚡ ${d.nome}` : d.nome
          const sela = d.temSela ? "🐎" : "❌"
          const bebe = d.ehBebe ? "🐣 Bebê" : "Adulto"
          txt += `🐍 *${i + 1}. ${titulo}*\n   🌸 Nv. ${d.nivel} | ${d.raridade} | ${sela} | ${bebe}\n   🐉 HP: ${d.hp}/${d.hpMax} | EN: ${d.energia}/${d.energiaMax}\n\n`
        })
        txt += `🧊 _Use \`+voar <nome>\` para voar ou \`+batalhadragao\` para lutar._\n\n`

        await reagir(sock, msg, "🐉")
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    verdragao: {
      aliases: ["vd", "verdragoes", "dragoesde"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)

        if (!sistemaAtivo(db, jid)) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐎𝐅𝐅", "O jogo está desativado.", `Um administrador precisa usar \`+dragao on\` para ativar.`, null, nomeBot) }, { quoted: msg })
        }

        let alvo = utils.getAlvo(msg)
        if (!alvo) {
          const txt = msg.message?.conversation || msg.message?.extendedTextMessage?.text || ""
          const args = txt.split(" ").slice(1)
          if (args[0]) alvo = args[0].replace(/\D/g, "") + "@s.whatsapp.net"
        }

        if (!alvo) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐕𝐄𝐑 𝐃𝐑𝐀𝐆𝐎̃𝐄𝐒", "Você não marcou ninguém.", `Marque um usuário ou digite o número.\n🐍 Exemplo: \`+verdragao 5511999999999\``, null, nomeBot) }, { quoted: msg })
        }

        const { user } = buscarUsuario(db, alvo, msg)
        const dragoes = Object.values(user.dragoes)
        const numAlvo = alvo.split("@")[0]

        if (!dragoes.length) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgAviso("𝐄𝐑𝐑𝐎", "Treinador sem dragões.", `O treinador ${numAlvo} não tem dragões.`, null, nomeBot) }, { quoted: msg })
        }

        let txt = `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🐉 𝐃𝐑𝐀𝐆𝐎̃𝐄𝐒 𝐃𝐄 ${numAlvo} 🐉
┣━━━━━━━━━━━━━━━━━━━━━━┫\n`
        dragoes.forEach((d, i) => {
          const titulo = d.asaTita ? `⚡ ${d.nome}` : d.nome
          const sela = d.temSela ? "🐎" : "❌"
          const bebe = d.ehBebe ? "🐣 Bebê" : "Adulto"
          txt += `┃ 🐍 ${i + 1}. *${titulo}*\n┃ 🌸 Nv. ${d.nivel} | ${d.raridade} | ${sela} | ${bebe}\n┃ 🐉 HP: ${d.hp}/${d.hpMax}\n┣━━━━━━━━━━━━━━━━━━━━━━┫\n`
        })
        txt += `\n_"A serpente observa."_ 🐍\n\n"${nomeBot}"`

        await reagir(sock, msg, "🔍")
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    domar: {
      aliases: ["domesticar", "tamedragon"],
      async executar({ sock, msg, args, db, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)

        if (!sistemaAtivo(db, jid)) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐎𝐅𝐅", "O jogo está desativado.", `Um administrador precisa usar \`+dragao on\` para ativar.`, null, nomeBot) }, { quoted: msg })
        }

        const nomeDragao = args.join(" ").trim()
        const sessao = getSessao(jid)

        if (!sessao || !sessao.dragao) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐃𝐎𝐌𝐀𝐑", "Nenhum dragão para domar.", "Aguarde um dragão aparecer no grupo para usar este comando.", null, nomeBot) }, { quoted: msg })
        }

        if (Date.now() - sessao.timestamp > 60000) {
          delSessao(jid)
          await reagir(sock, msg, "⏰")
          return sock.sendMessage(jid, { text: msgAviso("𝐓𝐄𝐌𝐏𝐎 𝐄𝐒𝐆𝐎𝐓𝐀𝐃𝐎", "O dragão fugiu.", "Ele esperou muito tempo e foi embora.", null, nomeBot) }, { quoted: msg })
        }

        if (nomeDragao.toLowerCase() !== sessao.dragao.nome.toLowerCase()) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐍𝐎𝐌𝐄 𝐄𝐑𝐑𝐀𝐃𝐎", "O nome não coincide.", `O dragão no grupo é: *${sessao.dragao.nome}*\nTente \`+domar ${sessao.dragao.nome}\``, null, nomeBot) }, { quoted: msg })
        }

        const { user, idReal } = buscarUsuario(db, sender, msg)
        
        const chances = { "Comum": 70, "Raro": 50, "Épico": 30, "Lendário": 10, "Mítico": 1 }
        const chanceBase = chances[sessao.dragao.raridade] || 50
        const bonusNivel = user.nivelTreinador * 2
        const chanceFinal = chanceBase + bonusNivel

        if (Math.random() * 100 > chanceFinal) {
          if (Math.random() < 0.5) {
            delSessao(jid)
            await reagir(sock, msg, "💨")
            return sock.sendMessage(jid, { text: msgErro("𝐅𝐔𝐆𝐈𝐔", "O dragão fugiu!", `Sua chance era de ${chanceFinal}%.\nTente aumentar seu nível de treinador com \`+missao\`.`, null, nomeBot) }, { quoted: msg })
          } else {
            await reagir(sock, msg, "😤")
            return sock.sendMessage(jid, { text: msgAviso("𝐅𝐀𝐋𝐇𝐎𝐔", "O dragão resistiu!", `Sua chance era de ${chanceFinal}%.\nUse \`+domar ${sessao.dragao.nome}\` novamente.`, null, nomeBot) }, { quoted: msg })
          }
        }

        user.dragoes[sessao.dragao.nome] = {
          nome: sessao.dragao.nome, raridade: sessao.dragao.raridade, foto: sessao.dragao.foto,
          hp: sessao.dragao.hp, hpMax: sessao.dragao.hp, energia: sessao.dragao.energia, energiaMax: sessao.dragao.energia,
          atk: sessao.dragao.atk, def: sessao.dragao.def, evasao: sessao.dragao.evasao,
          nivel: 1, temSela: false, asaTita: false, tentativasTita: 0, ehBebe: false, domadoEm: Date.now()
        }
        salvarDragoesUser(db, idReal, user)
        delSessao(jid)

        await reagir(sock, msg, "🐉")
        await sock.sendMessage(jid, {
          image: { url: sessao.dragao.foto },
          caption: msgSucesso("𝐃𝐎𝐌𝐀𝐃𝐎!", "Você domou um novo dragão!", `🌸 *${sessao.dragao.nome}*\n🐍 Nível: 1 | Raridade: ${sessao.dragao.raridade}`, `💡 Use \`+meudragao\` para ver sua coleção.`, nomeBot)
        }, { quoted: msg })
      }
    },

    batalhadragao: {
      aliases: ["batalhar", "battle", "lobby"],
      async executar({ sock, msg, db, prefixoAtivo, sender }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const nomeBot = nomeBotDb(db)

        if (!sistemaAtivo(db, jid)) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐎𝐅𝐅", "O jogo está desativado.", `Um administrador precisa usar \`+dragao on\` para ativar.`, null, nomeBot) }, { quoted: msg })
        }

        const { user, idReal } = buscarUsuario(db, sender, msg)
        
        const chaveLobby = `lobby_${jid}`
        let lobby = getSessao(chaveLobby)

        if (!lobby || (lobby.jogador1 && lobby.jogador2)) {
          if (Object.keys(user.dragoes || {}).length === 0) {
            await reagir(sock, msg, "❌")
            return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Sem dragões.", `Você precisa domar um dragão antes de batalhar.`, null, nomeBot) }, { quoted: msg })
          }
          
          if (user.pvpAtivo === false) {
            await reagir(sock, msg, "❌")
            return sock.sendMessage(jid, { text: msgErro("𝐏𝐕𝐏 𝐎𝐅𝐅", "Você desativou o PvP.", `Use \`${p}batalha on\` para reativar.`, null, nomeBot) }, { quoted: msg })
          }

          lobby = { jogador1: { id: idReal, num: idReal.split("@")[0], dragao: null, escolhido: false }, jogador2: null, estado: "esperando" }
          setSessao(chaveLobby, lobby)
          await reagir(sock, msg, "🏟️")
          return sock.sendMessage(jid, { text: msgSucesso("𝐋𝐎𝐁𝐁𝐘 𝐀𝐁𝐄𝐑𝐓𝐎", "Aguardando oponente...", `🌸 @${lobby.jogador1.num} abriu um lobby!\n🐍 Para entrar, use \`${p}batalhadragao\`\n\n_"Aguardando..."_`, null, nomeBot), mentions: [idReal] }, { quoted: msg })
        }

        if (lobby && lobby.jogador1 && !lobby.jogador2) {
          if (lobby.jogador1.id === idReal) {
            await reagir(sock, msg, "❌")
            return sock.sendMessage(jid, { text: msgAviso("𝐀𝐕𝐈𝐒𝐎", "Você já está no lobby.", "Aguarde alguém entrar.", null, nomeBot) }, { quoted: msg })
          }

          if (Object.keys(user.dragoes || {}).length === 0) {
            await reagir(sock, msg, "❌")
            return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Sem dragões.", `Domine um dragão antes.`, null, nomeBot) }, { quoted: msg })
          }

          if (user.pvpAtivo === false) {
            await reagir(sock, msg, "❌")
            return sock.sendMessage(jid, { text: msgErro("𝐏𝐕𝐏 𝐎𝐅𝐅", "Você desativou o PvP.", `Use \`${p}batalha on\` para reativar.`, null, nomeBot) }, { quoted: msg })
          }

          lobby.jogador2 = { id: idReal, num: idReal.split("@")[0], dragao: null, escolhido: false }
          lobby.estado = "escolhendo"
          
          const chaveBatalha = `batalha_${jid}`
          setSessao(chaveBatalha, lobby)
          delSessao(chaveLobby)

          const { user: u1 } = buscarUsuario(db, lobby.jogador1.id, msg)
          const { user: u2 } = buscarUsuario(db, lobby.jogador2.id, msg)

          let txt = `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🐉 𝐁𝐀𝐓𝐀𝐋𝐇𝐀 𝐏𝐑𝐎𝐍𝐓𝐀 🐉
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ 🌸 @${lobby.jogador1.num} vs @${lobby.jogador2.num}
┣━━━━━━━━━━━━━━━━━━━━━━┫\n`
          
          txt += `┃ 🐍 *DRAGÕES DE @${lobby.jogador1.num}:*\n`
          let idx1 = 1
          for (const nome in u1.dragoes) { txt += `┃ 🧊 ${idx1}. ${nome} (Nv. ${u1.dragoes[nome].nivel})\n`; idx1++ }
          
          txt += `┣━━━━━━━━━━━━━━━━━━━━━━┫\n┃ 🐍 *DRAGÕES DE @${lobby.jogador2.num}:*\n`
          let idx2 = 1
          for (const nome in u2.dragoes) { txt += `┃ 🧊 ${idx2}. ${nome} (Nv. ${u2.dragoes[nome].nivel})\n`; idx2++ }

          txt += `╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n⚠️ *Escolham seus dragões:*\n🐍 @${lobby.jogador1.num}: \`${p}escolherdg 1\`\n🌸 @${lobby.jogador2.num}: \`${p}escolherdg 1\`\n\n_"Que o melhor vença!"_\n\n"${nomeBot}"`

          await reagir(sock, msg, "🔥")
          return sock.sendMessage(jid, { text: txt, mentions: [lobby.jogador1.id, lobby.jogador2.id] }, { quoted: msg })
        }
      }
    },

    escolherdg: {
      aliases: ["escolher", "selectdragon"],
      async executar({ sock, msg, args, db, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)

        if (!sistemaAtivo(db, jid)) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐎𝐅𝐅", "O jogo está desativado.", `Um administrador precisa usar \`+dragao on\` para ativar.`, null, nomeBot) }, { quoted: msg })
        }

        const numEscolha = parseInt(args[0])
        if (!numEscolha || numEscolha < 1) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Número inválido.", `Use o número do dragão.\n🐍 Exemplo: \`+escolherdg 1\``, null, nomeBot) }, { quoted: msg })
        }

        const chaveBatalha = `batalha_${jid}`
        const batalha = getSessao(chaveBatalha)
        
        if (!batalha || batalha.estado !== "escolhendo") {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Nenhuma batalha ativa.", "Não há batalha em andamento neste grupo.", null, nomeBot) }, { quoted: msg })
        }

        const { user, idReal } = buscarUsuario(db, sender, msg)
        const jogador = batalha.jogador1.id === idReal ? batalha.jogador1 : batalha.jogador2.id === idReal ? batalha.jogador2 : null
        
        if (!jogador) return

        const nomesDragoes = Object.keys(user.dragoes)
        const dragaoNome = nomesDragoes[numEscolha - 1]

        if (!dragaoNome) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Número não existe.", "Você não tem um dragão nesse slot.", null, nomeBot) }, { quoted: msg })
        }

        const d = user.dragoes[dragaoNome]
        jogador.dragao = dragaoNome
        jogador.hp = d.hp
        jogador.hpMax = d.hpMax
        jogador.energia = d.energia
        jogador.energiaMax = d.energiaMax
        jogador.atk = d.atk
        jogador.def = d.def
        jogador.evasao = d.evasao
        jogador.escolhido = true
        setSessao(chaveBatalha, batalha)

        if (batalha.jogador1.escolhido && batalha.jogador2.escolhido) {
          batalha.estado = "iniciada"
          batalha.turno = 1
          setSessao(chaveBatalha, batalha)
          
          await reagir(sock, msg, "🔥")
          return sock.sendMessage(jid, { 
            text: msgSucesso("𝐁𝐀𝐓𝐀𝐋𝐇𝐀 𝐏𝐑𝐎𝐍𝐓𝐀", "Os dois dragões foram escolhidos!", `🐍 *${batalha.jogador1.dragao}* (@${batalha.jogador1.num})\n   🆚\n🌸 *${batalha.jogador2.dragao}* (@${batalha.jogador2.num})\n\n⚔️ *JOGADOR 1*, comece atacando:\n\`+ataque 1/2/3\``, null, nomeBot),
            mentions: [batalha.jogador1.id, batalha.jogador2.id]
          }, { quoted: msg })
        } else {
          await reagir(sock, msg, "⏳")
          return sock.sendMessage(jid, { text: msgAviso("𝐄𝐒𝐂𝐎𝐋𝐇𝐈𝐃𝐎", "Dragão pronto para a batalha.", `🌸 *${dragaoNome}* foi escolhido!\n🐍 Aguardando o oponente escolher...`, null, nomeBot) }, { quoted: msg })
        }
      }
    },

    ataque: {
      aliases: ["atacar", "attack"],
      async executar({ sock, msg, args, db, prefixoAtivo, sender }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const nomeBot = nomeBotDb(db)

        if (!sistemaAtivo(db, jid)) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐎𝐅𝐅", "O jogo está desativado.", `Um administrador precisa usar \`+dragao on\` para ativar.`, null, nomeBot) }, { quoted: msg })
        }

        const numAtaque = parseInt(args[0])
        const { idReal: userId } = buscarUsuario(db, sender, msg)

        if (![1, 2, 3].includes(numAtaque)) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Ataque inválido.", `Use: \`${p}ataque 1\`, \`${p}ataque 2\` ou \`${p}ataque 3\`.`, null, nomeBot) }, { quoted: msg })
        }

        const chaveBatalha = `batalha_${jid}`
        const batalha = getSessao(chaveBatalha)

        if (!batalha || batalha.estado !== "iniciada") {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Batalha não iniciada.", "Nenhuma batalha em andamento.", null, nomeBot) }, { quoted: msg })
        }

        const jogadorAtual = batalha.turno === 1 ? batalha.jogador1 : batalha.jogador2
        if (jogadorAtual.id !== userId) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgAviso("𝐄𝐒𝐏𝐄𝐑𝐄", "Não é seu turno.", "Aguarde o oponente atacar.", null, nomeBot) }, { quoted: msg })
        }

        const atacante = jogadorAtual
        const defensor = batalha.turno === 1 ? batalha.jogador2 : batalha.jogador1

        const custos = { 1: 10, 2: 20, 3: 30 }
        const custo = custos[numAtaque]
        
        if (atacante.energia < custo) {
          const vencedor = batalha.jogador1.energia >= batalha.jogador2.energia ? batalha.jogador1 : batalha.jogador2
          const perdedor = vencedor === batalha.jogador1 ? batalha.jogador2 : batalha.jogador1
          delSessao(chaveBatalha)
          
          const { user: uVencedor, idReal: idVencedor } = buscarUsuario(db, vencedor.id, msg)
          const upouV = darXp(uVencedor, 50)
          salvarDragoesUser(db, idVencedor, uVencedor)

          await reagir(sock, msg, "🪫")
          return sock.sendMessage(jid, { text: msgAviso("𝐅𝐈𝐌 𝐃𝐄 𝐉𝐎𝐆𝐎", "Cansaço extremo.", `🌸 ${atacante.dragao} ficou exausto!\n\n🏆 Vencedor: *${vencedor.dragao}* (@${vencedor.num})\n✨ XP ganho: +50${upouV ? `\n⭐ **UPOU PARA NÍVEL ${uVencedor.nivelTreinador}!**` : ""}`, null, nomeBot) }, { quoted: msg })
        }

        atacante.energia -= custo
        
        const danoBase = { 1: atacante.atk * 1.5, 2: atacante.atk * 2.5, 3: atacante.atk * 4.0 }[numAtaque]
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

        if (defensor.hp <= 0) {
          delSessao(chaveBatalha)
          
          const { user: uVencedor, idReal: idVencedor } = buscarUsuario(db, atacante.id, msg)
          const upouV = darXp(uVencedor, 50)
          salvarDragoesUser(db, idVencedor, uVencedor)

          await reagir(sock, msg, "🏆")
          return sock.sendMessage(jid, { text: msgSucesso("𝐁𝐀𝐓𝐀𝐋𝐇𝐀 𝐄𝐍𝐂𝐄𝐑𝐑𝐀𝐃𝐀", "Temos um vencedor!", `🏆 Vencedor: *${atacante.dragao}* (@${atacante.num})\n\n${log}\n✨ XP ganho: +50${upouV ? `\n⭐ **UPOU PARA NÍVEL ${uVencedor.nivelTreinador}!**` : ""}`, null, nomeBot) }, { quoted: msg })
        }

        batalha.turno = batalha.turno === 1 ? 2 : 1
        setSessao(chaveBatalha, batalha)

        await reagir(sock, msg, "⚔️")
        await sock.sendMessage(jid, { 
          text: msgAviso("𝐓𝐔𝐑𝐍𝐎", "Seu oponente atacou!", `${log}\n\n🌸 Vez de @${defensor.num} atacar:\n🐍 Use \`${p}ataque 1/2/3\``, null, nomeBot),
          mentions: [defensor.id.includes("@") ? defensor.id : defensor.id + "@s.whatsapp.net"]
        }, { quoted: msg })
      }
    },    lojadragao: {
      aliases: ["lojadragão", "shopdragao"],
      async executar({ sock, msg, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)

        if (!sistemaAtivo(db, jid)) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐎𝐅𝐅", "O jogo está desativado.", `Um administrador precisa usar \`+dragao on\` para ativar.`, null, nomeBot) }, { quoted: msg })
        }

        const p = prefixoAtivo || "+"
        const { user } = buscarUsuario(db, sender, msg)

        const texto = msgAviso(
          "𝐋𝐎𝐉𝐀 𝐃𝐑𝐀𝐆𝐀̃𝐎",
          `Seu saldo: *${user.gold || 0} Goldragon*`,
          `╭━〔 🐎 𝐒𝐄𝐋𝐀 〕━╮\n┃ 💰 Preço: 150 Gold\n┃ 🐍 Necessária para voar\n┃ 🛒 \`${p}comprardragao sela\`\n╰━━━━━━━━━━━━━━━╯\n\n╭━〔 📜 𝐏𝐄𝐑𝐆𝐀𝐌𝐈𝐍𝐇𝐎 〕━╮\n┃ 💰 Preço: 300 Gold\n┃ 🐍 Sobe 1 nível do dragão\n┃ 🧬 Nv 7+ = chance de Asa de Titã\n┃ 🛒 \`${p}comprardragao pergaminho\`\n╰━━━━━━━━━━━━━━━╯`,
          `💡 _Invista sabiamente._`,
          nomeBot
        )

        await reagir(sock, msg, "🪙")
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    comprardragao: {
      aliases: ["comprardragão", "buydragao", "comprar"],
      async executar({ sock, msg, args, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)

        if (!sistemaAtivo(db, jid)) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐎𝐅𝐅", "O jogo está desativado.", `Um administrador precisa usar \`+dragao on\` para ativar.`, null, nomeBot) }, { quoted: msg })
        }

        const p = prefixoAtivo || "+"
        const item = args.join(" ").trim().toLowerCase()
        const { user, idReal } = buscarUsuario(db, sender, msg)

        const sentMsg = await sock.sendMessage(jid, { text: `⏳ • 𝐏𝐑𝐎𝐂𝐄𝐒𝐒𝐀𝐍𝐃𝐎...` }, { quoted: msg })

        if (item === "sela" || item === "selas") {
          if ((user.gold || 0) < 150) {
            await reagir(sock, msg, "❌")
            return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐆𝐎𝐋𝐃", "Ouro insuficiente.", `Você precisa de 150 Gold (tem ${user.gold || 0}).`, null, nomeBot), edit: sentMsg.key })
          }
          user.gold -= 150
          user.inventario.selas = (user.inventario.selas || 0) + 1
          salvarDragoesUser(db, idReal, user)
          await reagir(sock, msg, "🐎")
          return sock.sendMessage(jid, { text: msgSucesso("𝐂𝐎𝐌𝐏𝐑𝐀𝐃𝐎", "1 Sela adquirida!", `🐍 Saldo atual: ${user.gold} Gold\n🐎 Use: \`${p}usarsela <nome>\``, null, nomeBot), edit: sentMsg.key })
        }

        if (item === "pergaminho" || item === "pergaminhos") {
          if ((user.gold || 0) < 300) {
            await reagir(sock, msg, "❌")
            return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐆𝐎𝐋𝐃", "Ouro insuficiente.", `Você precisa de 300 Gold (tem ${user.gold || 0}).`, null, nomeBot), edit: sentMsg.key })
          }
          user.gold -= 300
          user.inventario.pergaminhos = (user.inventario.pergaminhos || 0) + 1
          salvarDragoesUser(db, idReal, user)
          await reagir(sock, msg, "📜")
          return sock.sendMessage(jid, { text: msgSucesso("𝐂𝐎𝐌𝐏𝐑𝐀𝐃𝐎", "1 Pergaminho adquirido!", `🐍 Saldo atual: ${user.gold} Gold\n📜 Use: \`${p}evoluirdragao <nome>\``, null, nomeBot), edit: sentMsg.key })
        }

        await reagir(sock, msg, "❌")
        await sock.sendMessage(jid, { text: msgErro("𝐋𝐎𝐉𝐀", "Item inválido.", `🌸 Você digitou: *${item || "vazio"}*\n🐍 Use: \`${p}comprardragao sela\` ou \`${p}comprardragao pergaminho\``, null, nomeBot), edit: sentMsg.key })
      }
    },

    saldo: {
      aliases: ["gold", "meugold", "meusaldo"],
      async executar({ sock, msg, db, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)

        if (!sistemaAtivo(db, jid)) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐎𝐅𝐅", "O jogo está desativado.", `Um administrador precisa usar \`+dragao on\` para ativar.`, null, nomeBot) }, { quoted: msg })
        }

        const { user } = buscarUsuario(db, sender, msg)
        
        await reagir(sock, msg, "🪙")
        await sock.sendMessage(jid, { 
          text: msgSucesso("𝐂𝐀𝐑𝐓𝐄𝐈𝐑𝐀", "O ouro atrai dragões.", `🪙 Seu saldo atual é de *${user.gold || 0} Goldragon*\n🧊 Use \`+lojadragao\` para gastar.`, null, nomeBot) 
        }, { quoted: msg })
      }
    },

    inventariodragao: {
      aliases: ["inv_dragao", "mochiladragao"],
      async executar({ sock, msg, db, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)

        if (!sistemaAtivo(db, jid)) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐎𝐅𝐅", "O jogo está desativado.", `Um administrador precisa usar \`+dragao on\` para ativar.`, null, nomeBot) }, { quoted: msg })
        }

        const { user } = buscarUsuario(db, sender, msg)

        let ovosTxt = ""
        const ovos = Object.entries(user.inventario.ovos || {}).filter(([_, qtd]) => qtd > 0)
        if (ovos.length) { ovos.forEach(([nome, qtd]) => { ovosTxt += `┃ 🐣 ${nome} (x${qtd})\n` }) } 
        else { ovosTxt = "┃ 🧊 Nenhum ovo.\n" }

        let txt = `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🎒 𝐈𝐍𝐕𝐄𝐍𝐓𝐀́𝐑𝐈𝐎 🎒
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ 🪙 Goldragon: *${user.gold || 0}*
┃ 🏰 Vida da Vila: *${user.hpVila || 100}/${user.maxVila || 100}*
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ 🐎 Selas: *${user.inventario.selas}*
┃ 📜 Pergaminhos: *${user.inventario.pergaminhos}*
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ 🥚 *Ovos:*
${ovosTxt}╰━━━━━━━━━━━━━━━━━━━━━━╯

💡 _Use \`+chocarovo <nome>\` para chocar._\n\n"${nomeBot}"`

        await reagir(sock, msg, "🎒")
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    usarsela: {
      aliases: ["equiparsela", "colocarsela"],
      async executar({ sock, msg, args, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)

        if (!sistemaAtivo(db, jid)) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐎𝐅𝐅", "O jogo está desativado.", `Um administrador precisa usar \`+dragao on\` para ativar.`, null, nomeBot) }, { quoted: msg })
        }

        const p = prefixoAtivo || "+"
        const nomeDragao = args.join(" ").trim()
        const { user, idReal } = buscarUsuario(db, sender, msg)

        const nomeReal = Object.keys(user.dragoes).find(k => k.toLowerCase() === nomeDragao.toLowerCase())
        if (!nomeReal) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Dragão não encontrado.", `Você não tem o dragão: *${nomeDragao}*.`, `💡 Use \`${p}meudragao\` para ver seus dragões.`, nomeBot) }, { quoted: msg })
        }

        const d = user.dragoes[nomeReal]
        if (d.temSela) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgAviso("𝐉𝐀́ 𝐓𝐄𝐌 𝐒𝐄𝐋𝐀", "Este dragão já está equipado.", `*${nomeReal}* já pode voar.`, null, nomeBot) }, { quoted: msg })
        }

        if (user.inventario.selas < 1) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐒𝐄𝐋𝐀", "Você não tem selas no inventário.", `Compre com \`${p}comprardragao sela\``, null, nomeBot) }, { quoted: msg })
        }

        user.inventario.selas -= 1
        d.temSela = true
        salvarDragoesUser(db, idReal, user)

        await reagir(sock, msg, "🐎")
        await sock.sendMessage(jid, { text: msgSucesso("𝐒𝐄𝐋𝐀 𝐄𝐐𝐔𝐈𝐏𝐀𝐃𝐀", "Dragão pronto para voar!", `🌸 *${nomeReal}* agora tem sela!\n🐍 Use \`${p}voar ${nomeReal}\` para voar.`, null, nomeBot) }, { quoted: msg })
      }
    },

    voar: {
      aliases: ["fly", "voardragao"],
      async executar({ sock, msg, args, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)

        if (!sistemaAtivo(db, jid)) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐎𝐅𝐅", "O jogo está desativado.", `Um administrador precisa usar \`+dragao on\` para ativar.`, null, nomeBot) }, { quoted: msg })
        }

        const p = prefixoAtivo || "+"
        const nomeDragao = args.join(" ").trim()
        const { user, idReal } = buscarUsuario(db, sender, msg)

        const nomeReal = Object.keys(user.dragoes).find(k => k.toLowerCase() === nomeDragao.toLowerCase())
        if (!nomeReal) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Dragão não encontrado.", `Você não tem o dragão: *${nomeDragao}*.`, null, nomeBot) }, { quoted: msg })
        }

        const d = user.dragoes[nomeReal]
        if (!d.temSela) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐒𝐄𝐋𝐀", "Dragão sem sela.", `*${nomeReal}* não pode voar sem sela!\n🐍 Compre com \`${p}comprardragao sela\``, null, nomeBot) }, { quoted: msg })
        }

        const chanceVoar = { "Comum": 60, "Raro": 70, "Épico": 85, "Lendário": 95, "Mítico": 99 }[d.raridade] || 60
        if (Math.random() * 100 > chanceVoar) {
          await reagir(sock, msg, "💨")
          return sock.sendMessage(jid, { text: msgErro("𝐐𝐔𝐄𝐃𝐀", "Você caiu durante o voo.", `🌸 Você e *${nomeReal}* caíram!\n🐍 Tente novamente.`, null, nomeBot) }, { quoted: msg })
        }

        let recompensa = 0
        if (d.raridade === "Comum") recompensa = Math.floor(Math.random() * 21) + 10
        else if (d.raridade === "Raro") recompensa = Math.floor(Math.random() * 41) + 30
        else if (d.raridade === "Épico") recompensa = Math.floor(Math.random() * 51) + 70
        else if (d.raridade === "Lendário") recompensa = Math.floor(Math.random() * 101) + 150
        else if (d.raridade === "Mítico") recompensa = Math.floor(Math.random() * 201) + 300

        if (d.asaTita) recompensa = Math.floor(recompensa * 1.5)
        user.gold = (user.gold || 0) + recompensa
        
        let achouOvo = ""
        let xpGanhaVoar = 20
        const sorteOvo = Math.random() * 100
        const chanceOvo = 5 + (user.nivelTreinador * 2)
        if (sorteOvo < chanceOvo) {
          let tipoOvo = "Ovo Comum"
          if (user.nivelTreinador >= 10 && Math.random() < 0.2) tipoOvo = "Ovo Mítico"
          else if (user.nivelTreinador >= 8 && Math.random() < 0.3) tipoOvo = "Ovo Lendário"
          else if (user.nivelTreinador >= 5 && Math.random() < 0.4) tipoOvo = "Ovo Épico"
          else if (user.nivelTreinador >= 2 && Math.random() < 0.6) tipoOvo = "Ovo Raro"
          
          user.inventario.ovos[tipoOvo] = (user.inventario.ovos[tipoOvo] || 0) + 1
          achouOvo = `\n\n🥚 *VOCÊ ACHOU UM OVO!*\n🌸 ${tipoOvo} foi adicionado ao seu inventário.`
          xpGanhaVoar += 30 
        }

        const upou = darXp(user, xpGanhaVoar)
        salvarDragoesUser(db, idReal, user)
        
        const locais = ["Montanhas Geladas", "Ilha dos Dragões", "Cavernas Ocultas", "Vale Escondido", "Mar de Nuvens"]
        const local = locais[Math.floor(Math.random() * locais.length)]

        await reagir(sock, msg, "☁️")
        await sock.sendMessage(jid, { text: msgSucesso("𝐕𝐎𝐀𝐍𝐃𝐎", "Sobrevoando os céus!", `🌸 Você subiu em *${nomeReal}*!\n🐍 Local: *${local}*\n\n🪙 Recompensa: +${recompensa} Gold\n✨ XP: +${xpGanhaVoar}${upou ? `\n⭐ **UPOU PARA NÍVEL ${user.nivelTreinador}!**` : ""}\n💰 Saldo: ${user.gold} Gold${achouOvo}`, `🐍 _Liberdade... e lucro!_`, nomeBot) }, { quoted: msg })
      }
    },

    chocarovo: {
      aliases: ["chocar", "eclodirovo"],
      async executar({ sock, msg, args, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)

        if (!sistemaAtivo(db, jid)) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐎𝐅𝐅", "O jogo está desativado.", `Um administrador precisa usar \`+dragao on\` para ativar.`, null, nomeBot) }, { quoted: msg })
        }

        const p = prefixoAtivo || "+"
        const nomeOvo = args.join(" ").trim()
        const { user, idReal } = buscarUsuario(db, sender, msg)

        if (!nomeOvo) {
          const ovos = Object.entries(user.inventario.ovos || {}).filter(([_, qtd]) => qtd > 0)
          if (!ovos.length) {
            await reagir(sock, msg, "❌")
            return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐎𝐕𝐎𝐒", "Você não tem ovos.", `Voe com seu dragão para achar ovos.\n🐍 Use \`${p}voar <nome>\``, null, nomeBot) }, { quoted: msg })
          }
          let lista = ""
          ovos.forEach(([n, q]) => { lista += `🧊 ${n} (x${q})\n` })
          await reagir(sock, msg, "🥚")
          return sock.sendMessage(jid, { text: msgAviso("𝐒𝐄𝐔𝐒 𝐎𝐕𝐎𝐒", "Escolha um ovo para chocar.", `${lista}\n🐍 Para chocar:\n\`${p}chocarovo <nome do ovo>\``, null, nomeBot) }, { quoted: msg })
        }

        const nomeRealOvo = Object.keys(user.inventario.ovos).find(k => k.toLowerCase() === nomeOvo.toLowerCase())
        if (!nomeRealOvo || user.inventario.ovos[nomeRealOvo] < 1) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Ovo não encontrado.", `Você não tem o ovo: *${nomeOvo}*.`, null, nomeBot) }, { quoted: msg })
        }

        if (Object.keys(user.dragoes).length >= 15) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐌𝐈𝐓𝐄", "Você atingiu o limite de 15 dragões.", `Venda ou doe algum dragão antes de chocar outro ovo.`, null, nomeBot) }, { quoted: msg })
        }

        user.inventario.ovos[nomeRealOvo] -= 1
        if (user.inventario.ovos[nomeRealOvo] <= 0) delete user.inventario.ovos[nomeRealOvo]

        const ovoInfo = OVOS[nomeRealOvo]
        const dragaoAleatorio = ovoInfo.choca[Math.floor(Math.random() * ovoInfo.choca.length)]
        const dadosDragao = DRAGOES[dragaoAleatorio]

        const dragaoBebe = {
          nome: `${dragaoAleatorio} (Bebê)`,
          raridade: dadosDragao.raridade,
          foto: dadosDragao.foto,
          hp: Math.floor(dadosDragao.hp * 0.3),
          hpMax: Math.floor(dadosDragao.hp * 0.3),
          energia: Math.floor(dadosDragao.energia * 0.3),
          energiaMax: Math.floor(dadosDragao.energia * 0.3),
          atk: Math.floor(dadosDragao.atk * 0.3),
          def: Math.floor(dadosDragao.def * 0.3),
          evasao: dadosDragao.evasao,
          nivel: 1, temSela: false, asaTita: false, tentativasTita: 0, ehBebe: true, domadoEm: Date.now()
        }

        user.dragoes[dragaoBebe.nome] = dragaoBebe
        salvarDragoesUser(db, idReal, user)

        await reagir(sock, msg, "🐣")
        await sock.sendMessage(jid, { image: { url: dadosDragao.foto }, caption: msgSucesso("𝐎𝐕𝐎 𝐂𝐇𝐎𝐂𝐀𝐃𝐎", "Nasceu um dragão bebê!", `🌸 *${dragaoAleatorio} (Bebê)*\n🐍 Use pergaminhos para evoluir até a fase adulta.`, `📜 Use \`${p}evoluirdragao <nome>\``, nomeBot) }, { quoted: msg })
      }
    },

    livrodg: {
      aliases: ["livro", "dragoes"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)

        if (!sistemaAtivo(db, jid)) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐎𝐅𝐅", "O jogo está desativado.", `Um administrador precisa usar \`+dragao on\` para ativar.`, null, nomeBot) }, { quoted: msg })
        }

        let txt = `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 📖 𝐋𝐈𝐕𝐑𝐎 𝐃𝐄 𝐃𝐑𝐀𝐆𝐎̃𝐄𝐒 📖
┣━━━━━━━━━━━━━━━━━━━━━━┫\n`
        
        for (const [nome, info] of Object.entries(DRAGOES)) {
          txt += `┃ 🌸 *${nome}*\n┃ 🐍 Raridade: ${info.raridade} | Bioma: ${info.bioma}\n┃ 🧊 HP: ${info.hp} | ATK: ${info.atk} | DEF: ${info.def} | EVS: ${info.evasao}\n┣━━━━━━━━━━━━━━━━━━━━━━┫\n`
        }

        txt += `\n_"Conhecimento é poder."_ 🐍\n\n"${nomeBot}"`
        await reagir(sock, msg, "📖")
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    evoluirdragao: {
      aliases: ["evolve", "evoluir"],
      async executar({ sock, msg, args, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)

        if (!sistemaAtivo(db, jid)) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐎𝐅𝐅", "O jogo está desativado.", `Um administrador precisa usar \`+dragao on\` para ativar.`, null, nomeBot) }, { quoted: msg })
        }

        const p = prefixoAtivo || "+"
        const nomeDragao = args.join(" ").trim()
        const { user, idReal } = buscarUsuario(db, sender, msg)

        const nomeReal = Object.keys(user.dragoes).find(k => k.toLowerCase() === nomeDragao.toLowerCase())

        if (!nomeReal) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Dragão não encontrado.", `Você não tem o dragão: *${nomeDragao}*.`, null, nomeBot) }, { quoted: msg })
        }

        if (user.inventario.pergaminhos < 1) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐆𝐀𝐌𝐈𝐍𝐇𝐎", "Pergaminho em falta.", `Você precisa de um pergaminho. Compre com \`${p}comprardragao pergaminho\`.`, null, nomeBot) }, { quoted: msg })
        }

        const d = user.dragoes[nomeReal]
        if (d.asaTita) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgAviso("𝐉𝐀́ 𝐄́ 𝐓𝐈𝐓𝐀̃", "Evolução máxima atingida.", `*${nomeReal}* já é uma Asa de Titã!`, null, nomeBot) }, { quoted: msg })
        }

        user.inventario.pergaminhos -= 1

        if (d.ehBebe) {
          d.ehBebe = false;
          d.nome = d.nome.replace(" (Bebê)", "");
          const novoNome = d.nome;
          delete user.dragoes[nomeReal];
          d.hpMax = DRAGOES[novoNome].hp;
          d.hp = d.hpMax;
          d.energiaMax = DRAGOES[novoNome].energia;
          d.energia = d.energiaMax;
          d.atk = DRAGOES[novoNome].atk;
          d.def = DRAGOES[novoNome].def;
          user.dragoes[novoNome] = d;
          salvarDragoesUser(db, idReal, user);
          await reagir(sock, msg, "🦋");
          return sock.sendMessage(jid, { text: msgSucesso("𝐂𝐑𝐄𝐒𝐂𝐄𝐔", "Fase adulta atingida!", `🌸 *${novoNome}* se tornou adulto.\n🐍 Está pronto para batalhar e voar!`, null, nomeBot) }, { quoted: msg })
        }

        if (d.nivel < 7) {
          d.nivel += 1
          d.hpMax = Math.floor(d.hpMax * 1.15)
          d.hp = d.hpMax
          d.energiaMax = Math.floor(d.energiaMax * 1.15)
          d.energia = d.energiaMax
          d.atk = Math.floor(d.atk * 1.1)
          d.def = Math.floor(d.def * 1.1)
          salvarDragoesUser(db, idReal, user)
          await reagir(sock, msg, "📜")
          await sock.sendMessage(jid, { text: msgSucesso("𝐄𝐕𝐎𝐋𝐔𝐈𝐔", "Nível aumentado!", `🌸 *${nomeReal}* subiu para o Nível ${d.nivel}!\n🐍 Status aumentados.`, null, nomeBot) }, { quoted: msg })
        } else {
          d.tentativasTita += 1
          const chanceBase = 5
          const chanceFinal = chanceBase * d.tentativasTita
          if (Math.random() * 100 < chanceFinal) {
            d.asaTita = true
            const novoNome = `${nomeReal} (Asa de Titã)`
            d.nome = novoNome
            d.hpMax = Math.floor(d.hpMax * 1.5)
            d.hp = d.hpMax
            d.energiaMax = Math.floor(d.energiaMax * 1.5)
            d.energia = d.energiaMax
            d.atk = Math.floor(d.atk * 1.3)
            d.def = Math.floor(d.def * 1.3)
            d.evasao += 10
            delete user.dragoes[nomeReal]
            user.dragoes[novoNome] = d
            salvarDragoesUser(db, idReal, user)
            await reagir(sock, msg, "⚡")
            await sock.sendMessage(jid, { image: { url: "https://files.catbox.moe/r91204.jpg" }, caption: msgSucesso("𝐀𝐒𝐀 𝐃𝐄 𝐓𝐈𝐓𝐀̃", "O poder ancestral despertou!", `🌸 *${nomeReal}* EVOLUIU PARA TITÃ!`, null, nomeBot) }, { quoted: msg })
          } else {
            salvarDragoesUser(db, idReal, user)
            await reagir(sock, msg, "💨")
            await sock.sendMessage(jid, { text: msgAviso("𝐄𝐕𝐎𝐋𝐔𝐂̧𝐀̃𝐎 𝐅𝐀𝐋𝐇𝐎𝐔", "O despertar não ocorreu.", `🌸 *${nomeReal}* não despertou como Asa de Titã.\n🐍 Chance atual na próxima: ${Math.min(100, chanceFinal + 5)}%`, null, nomeBot) }, { quoted: msg })
          }
        }
      }
    },

    alimentardragao: {
      aliases: ["feedragon", "alimentar"],
      async executar({ sock, msg, args, db, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)

        if (!sistemaAtivo(db, jid)) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐎𝐅𝐅", "O jogo está desativado.", `Um administrador precisa usar \`+dragao on\` para ativar.`, null, nomeBot) }, { quoted: msg })
        }

        const nomeDragao = args.join(" ").trim()
        const { user, idReal } = buscarUsuario(db, sender, msg)

        const nomeReal = Object.keys(user.dragoes).find(k => k.toLowerCase() === nomeDragao.toLowerCase())

        if (!nomeReal) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Dragão não encontrado.", `Você não tem o dragão: *${nomeDragao}*.`, null, nomeBot) }, { quoted: msg })
        }

        const d = user.dragoes[nomeReal]
        d.hp = Math.min(d.hpMax, d.hp + 30)
        d.energia = Math.min(d.energiaMax, d.energia + 20)
        salvarDragoesUser(db, idReal, user)

        await reagir(sock, msg, "🍖")
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐋𝐈𝐌𝐄𝐍𝐓𝐀𝐃𝐎", "Refeição servida!", `🌸 *${nomeReal}*\n🐍 HP: ${d.hp}/${d.hpMax}\n🌸 Energia: ${d.energia}/${d.energiaMax}`, null, nomeBot) }, { quoted: msg })
      }
    },

    missao: {
      aliases: ["missoes", "farmar", "treinar"],
      async executar({ sock, msg, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid;
        const nomeBot = nomeBotDb(db);

        if (!sistemaAtivo(db, jid)) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐎𝐅𝐅", "O jogo está desativado.", `Um administrador precisa usar \`+dragao on\` para ativar.`, null, nomeBot) }, { quoted: msg })
        }

        const p = prefixoAtivo || "+";
        const { user, idReal } = buscarUsuario(db, sender, msg);

        const agora = Date.now();
        const cooldown = 30 * 60 * 1000;
        const ultimaMissao = user.ultimaMissao || 0;
        
        const chaveSessao = `missao_${jid}`;
        let sessao = getSessao(chaveSessao);

        if (sessao && sessao.jogador === idReal && sessao.estado === "ativa") {
          const m = MISSOES[sessao.tipoMissao];
          const { user: uAtacante } = buscarUsuario(db, sender, msg);
          
          const dragoes = Object.values(uAtacante.dragoes);
          if (dragoes.length === 0) {
             await reagir(sock, msg, "❌");
             delSessao(chaveSessao);
             return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Sem dragões para lutar.", "Você não tem dragões para realizar a missão.", null, nomeBot) }, { quoted: msg });
          }

          const dragaoEscolhido = dragoes[Math.floor(Math.random() * dragoes.length)];
          const poderJogador = dragaoEscolhido.atk + dragaoEscolhido.def + (uAtacante.nivelTreinador * 10);
          const poderInimigo = 50 + (m.nivelMin * 20);
          
          if (poderJogador >= poderInimigo) {
            const upou = darXp(uAtacante, m.xp);
            
            let dropMsg = "";
            if (Math.random() * 100 <= m.chanceDrop) {
              uAtacante.inventario.ovos[m.dropOvo] = (uAtacante.inventario.ovos[m.dropOvo] || 0) + 1;
              dropMsg = `\n\n🥚 *DROP!* Você encontrou um *${m.dropOvo}*!`;
            }

            uAtacante.ultimaMissao = agora;
            salvarDragoesUser(db, idReal, uAtacante);
            delSessao(chaveSessao);

            await reagir(sock, msg, "🏆");
            return sock.sendMessage(jid, { text: msgSucesso("𝐕𝐈𝐓𝐎́𝐑𝐈𝐀", "Missão concluída com sucesso!", `🌸 Seu dragão *${dragaoEscolhido.nome}* venceu!\n🐍 XP ganho: +${m.xp}${upou ? `\n⭐ **UPOU PARA NÍVEL ${uAtacante.nivelTreinador}!**` : ""}${dropMsg}`, `💡 Use \`${p}missao\` novamente em 30 minutos.`, nomeBot) }, { quoted: msg });

          } else {
            uAtacante.ultimaMissao = agora;
            salvarDragoesUser(db, idReal, uAtacante);
            delSessao(chaveSessao);
            
            await reagir(sock, msg, "💀");
            return sock.sendMessage(jid, { text: msgErro("𝐃𝐄𝐑𝐑𝐎𝐓𝐀", "Seu dragão não foi forte o suficiente.", `🌸 *${dragaoEscolhido.nome}* foi derrotado.\n🐍 Tente novamente daqui a 30 minutos.`, null, nomeBot) }, { quoted: msg });
          }
        }

        if (agora - ultimaMissao < cooldown) {
          const falta = cooldown - (agora - ultimaMissao);
          const min = Math.floor(falta / 60000);
          const seg = Math.floor((falta % 60000) / 1000);
          await reagir(sock, msg, "⏰");
          return sock.sendMessage(jid, { text: msgAviso("𝐄𝐒𝐏𝐄𝐑𝐄", "Aguarde para nova missão.", `🌸 Suas missões renovam em *${min}min ${seg}s*.`, null, nomeBot) }, { quoted: msg });
        }

        const missoesDisponiveis = Object.entries(MISSOES).filter(([_, m]) => user.nivelTreinador >= m.nivelMin);
        
        if (!missoesDisponiveis.length) {
           await reagir(sock, msg, "❌");
           return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Nível insuficiente.", "Você ainda não tem nível para nenhuma missão.\n🐍 Treine defendendo a vila primeiro!", null, nomeBot) }, { quoted: msg });
        }

        const [tipoMissao, dadosMissao] = missoesDisponiveis[Math.floor(Math.random() * missoesDisponiveis.length)];

        setSessao(chaveSessao, { jogador: idReal, tipoMissao, estado: "ativa", timestamp: agora });

        const emojiRaridade = { "Comum": "🟢", "Média": "🔵", "Lendária": "🟣", "Mítica": "🔴" }[dadosMissao.raridade];

        await reagir(sock, msg, "📜");
        await sock.sendMessage(jid, {
          image: { url: dadosMissao.foto },
          caption: msgAviso("𝐍𝐎𝐕𝐀 𝐌𝐈𝐒𝐒𝐀̃𝐎", "Uma missão apareceu!", `${emojiRaridade} *${dadosMissao.nome}*\n🌸 Raridade: ${dadosMissao.raridade}\n🐍 Nível mínimo: ${dadosMissao.nivelMin}\n\n🪙 Recompensa: +${dadosMissao.xp} XP\n🥚 Chance de Ovo: ${dadosMissao.chanceDrop}%\n\n⚔️ Use \`${p}missao\` novamente para LUTAR!`, `🐉 _O perigo chama._`, nomeBot)
        }, { quoted: msg });
      }
    },

    boss: {
      aliases: ["bosses", "invadir"],
      async executar({ sock, msg, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)

        if (!sistemaAtivo(db, jid)) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐎𝐅𝐅", "O jogo está desativado.", `Um administrador precisa usar \`+dragao on\` para ativar.`, null, nomeBot) }, { quoted: msg })
        }

        const { user, idReal } = buscarUsuario(db, sender, msg)
        const agora = Date.now()
        const cooldown = 30 * 60 * 1000 
        const ultimoBoss = user.ultimoBoss || 0

        if (agora - ultimoBoss < cooldown) {
          const falta = cooldown - (agora - ultimoBoss)
          const min = Math.floor(falta / 60000)
          const seg = Math.floor((falta % 60000) / 1000)
          await reagir(sock, msg, "⏰")
          return sock.sendMessage(jid, { text: msgAviso("𝐄𝐒𝐏𝐄𝐑𝐄", "Bosses não estão disponíveis.", `🌸 Os chefes só aparecem em *${min}min ${seg}s*.`, null, nomeBot) }, { quoted: msg })
        }

        const dragoes = Object.values(user.dragoes)
        if (dragoes.length === 0) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Sem dragões.", "Você não tem dragões para lutar contra o Boss!", null, nomeBot) }, { quoted: msg })
        }

        await reagir(sock, msg, "👹")
        await new Promise(r => setTimeout(r, 1500))
        
        const bossNomes = Object.keys(BOSSES)
        const bossNome = bossNomes[Math.floor(Math.random() * bossNomes.length)]
        const boss = BOSSES[bossNome]

        let txt = `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 👹 𝐁𝐎𝐒𝐒 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎 👹
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ 🌸 *${bossNome}*
┃ 🐍 Raridade: ${boss.raridade}
┃ ❤️ HP: ${boss.hp}
┃ ⚔️ ATK: ${boss.atk}
┣━━━━━━━━━━━━━━━━━━━━━━┫\n`
        
        dragoes.sort((a, b) => (b.atk + b.def) - (a.atk + a.def))
        const dragaoEscolhido = dragoes[0]
        
        txt += `┃ ⚔️ Seu dragão *${dragaoEscolhido.nome}* vai lutar!\n╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n`
        
        const poderJogador = (dragaoEscolhido.atk * 2) + dragaoEscolhido.def + (user.nivelTreinador * 15)
        const poderBoss = (boss.atk * 1.5) + boss.def

        let ganhou = poderJogador >= poderBoss || Math.random() < 0.3; 

        if (ganhou) {
          txt += `🏆 *SEU DRAGÃO VENCEU!*\n`
          const upou = darXp(user, boss.xp)
          txt += `✨ XP ganho: +${boss.xp}${upou ? `\n⭐ **UPOU PARA NÍVEL ${user.nivelTreinador}!**` : ""}\n`
          
          if (Math.random() * 100 <= 10) { 
            user.inventario.ovos[boss.dropOvo] = (user.inventario.ovos[boss.dropOvo] || 0) + 1
            txt += `\n🥚 *DROP!* Você encontrou um *${boss.dropOvo}*!\n`
          }
        } else {
          txt += `💀 *SEU DRAGÃO FOI DERROTADO...*\n`
          txt += `🐍 O Boss era forte demais. Tente novamente daqui a 30 minutos.\n`
        }

        user.ultimoBoss = agora
        salvarDragoesUser(db, idReal, user)

        await sock.sendMessage(jid, { image: { url: boss.foto }, caption: txt + `\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    ruinas: {
      aliases: ["ruina", "explorar"],
      async executar({ sock, msg, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)

        if (!sistemaAtivo(db, jid)) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐎𝐅𝐅", "O jogo está desativado.", `Um administrador precisa usar \`+dragao on\` para ativar.`, null, nomeBot) }, { quoted: msg })
        }

        const { user, idReal } = buscarUsuario(db, sender, msg)
        const agora = Date.now()
        const cooldown = 20 * 60 * 1000 
        const ultimaRuina = user.ultimaRuina || 0

        if (agora - ultimaRuina < cooldown) {
          const falta = cooldown - (agora - ultimaRuina)
          const min = Math.floor(falta / 60000)
          const seg = Math.floor((falta % 60000) / 1000)
          await reagir(sock, msg, "⏰")
          return sock.sendMessage(jid, { text: msgAviso("𝐄𝐒𝐏𝐄𝐑𝐄", "As ruínas estão fechadas.", `🌸 Elas se reabrem em *${min}min ${seg}s*.`, null, nomeBot) }, { quoted: msg })
        }

        const dragoes = Object.values(user.dragoes)
        if (dragoes.length === 0) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Sem dragões.", "Você não tem dragões para explorar!", null, nomeBot) }, { quoted: msg })
        }

        await reagir(sock, msg, "🏛️")
        await new Promise(r => setTimeout(r, 1500))
        
        dragoes.sort((a, b) => b.hp - a.hp)
        const dragaoEscolhido = dragoes[0]

        let poderJogador = (dragaoEscolhido.atk * 2) + dragaoEscolhido.def + (user.nivelTreinador * 15)
        let andares = 0
        let xpTotal = 0
        let txt = `🏛️ • 𝐑𝐔𝐈́𝐍𝐀𝐒 •\n\n🌸 Dragão escolhido: *${dragaoEscolhido.nome}*\n🐍 Explorando...\n\n`

        for (let i = 0; i < 5; i++) {
          const sala = SALAS_RUINA[i]
          txt += `📍 *Andar ${sala.nivel}* — Inimigo (HP: ${sala.hpInimigo} | ATK: ${sala.atkInimigo})\n`
          
          if (poderJogador >= (sala.hpInimigo + sala.atkInimigo)) {
            andares++
            xpTotal += sala.xp
            txt += `⚔️ Você venceu o inimigo!\n✨ +${sala.xp} XP\n\n`
            poderJogador -= sala.atkInimigo
          } else {
            txt += `💀 Seu dragão foi derrotado... A ruína termina aqui.\n\n`
            break
          }
        }

        if (andares > 0) {
          const upou = darXp(user, xpTotal)
          txt += `🏆 *VITÓRIA!*\n🌸 Andares conquistados: ${andares}/5\n✨ XP Total: +${xpTotal}${upou ? `\n⭐ **UPOU PARA NÍVEL ${user.nivelTreinador}!**` : ""}\n`
          
          if (Math.random() * 100 <= 15) { 
             const tipoOvo = andares >= 4 ? "Ovo Lendário" : andares >= 2 ? "Ovo Épico" : "Ovo Raro"
             user.inventario.ovos[tipoOvo] = (user.inventario.ovos[tipoOvo] || 0) + 1
             txt += `\n🥚 *DROP!* Você encontrou um *${tipoOvo}*!\n`
          }
        } else {
          txt += `🏚️ Você não conseguiu passar do primeiro andar...\n`
        }

        user.ultimaRuina = agora
        salvarDragoesUser(db, idReal, user)

        await sock.sendMessage(jid, { image: { url: "https://files.catbox.moe/r47clm.jpg" }, caption: txt + `\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    // ========== 🔥 COMANDOS DE KEY (NÃO SÃO BLOQUEADOS PELO SISTEMA OFF) 🔥 ==========

    gerarkeyxp: {
      aliases: ["gerarkey", "criarxp"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        
        if (!isDono && !isSubDono) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐀𝐕𝐈𝐒𝐎", "Comando restrito.", "Apenas o mestre pode gerar keys!", null, nomeBot) }, { quoted: msg })
        }

        const qtd = parseInt(args[0])
        if (!qtd || qtd <= 0) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Quantidade inválida.", "Digite a quantidade de XP para a key.\n🐍 Exemplo: `+gerarkeyxp 500`", null, nomeBot) }, { quoted: msg })
        }

        const dbKeys = dbLer("keysxp.json", { keys: {} })
        const novaKey = gerarKeyAleatoria()

        dbKeys.keys[novaKey] = { xp: qtd, usado: false, criadoPor: msg.key.participant || msg.key.remoteJid, criadoEm: Date.now() }
        dbSalvar("keysxp.json", dbKeys)

        await reagir(sock, msg, "🎟️")
        await sock.sendMessage(jid, { 
          text: msgSucesso("𝐊𝐄𝐘 𝐆𝐄𝐑𝐀𝐃𝐀", "Uma nova key de XP foi criada!", `🎟️ Key: \`${novaKey}\`\n🐍 Valor: *+${qtd} XP*\n\n🧊 _Essa key é de uso único._`, `💡 Entregue ao escolhido com \`+keyxp ${novaKey}\``, nomeBot) 
        }, { quoted: msg })
      }
    },

    keyxp: {
      aliases: ["resgatarxp", "usarkey"],
      async executar({ sock, msg, args, db, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const keyInserida = (args[0] || "").toUpperCase().trim()

        if (!keyInserida) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Key em falta.", "Digite a key para resgatar.\n🐍 Exemplo: `+keyxp KEY-XXXXXX`", null, nomeBot) }, { quoted: msg })
        }

        const dbKeys = dbLer("keysxp.json", { keys: {} })
        
        // 🔥 PROCURA A KEY SEM DIFERENCIAR MAIÚSCULA DE MINÚSCULA
        let keyReal = null;
        for (const k in dbKeys.keys) {
            if (k.toUpperCase() === keyInserida) { keyReal = k; break; }
        }

        if (!keyReal || !dbKeys.keys[keyReal]) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Key inválida.", "A key digitada não existe ou está errada.", null, nomeBot) }, { quoted: msg })
        }

        const dataKey = dbKeys.keys[keyReal]

        if (dataKey.usado) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Key já resgatada.", "Essa key já foi utilizada por outra pessoa.", null, nomeBot) }, { quoted: msg })
        }

        const { user, idReal } = buscarUsuario(db, sender, msg)
        const qtdXp = dataKey.xp
        const upou = darXp(user, qtdXp)
        salvarDragoesUser(db, idReal, user)

        dataKey.usado = true
        dataKey.usadoPor = idReal
        dataKey.usadoEm = Date.now()
        dbSalvar("keysxp.json", dbKeys)

        const xpNec = user.nivelTreinador * 200
        const progresso = Math.floor((user.xpTreinador / xpNec) * 10)
        const barra = "🟢".repeat(Math.min(10, progresso)) + "⬛".repeat(Math.max(0, 10 - progresso))
        const pct = Math.floor((user.xpTreinador / xpNec) * 100)

        let msgTexto = `🎟️ • 𝐊𝐄𝐘 𝐑𝐄𝐒𝐆𝐀𝐓𝐀𝐃𝐀 •\n\n`
        msgTexto += `🌸 Você resgatou *${qtdXp} XP*!\n\n`
        msgTexto += `🐍 Nível: *${user.nivelTreinador}* / 15\n`
        msgTexto += `🧊 Progresso: ${user.xpTreinador}/${xpNec} (${pct}%)\n`
        msgTexto += `${barra}\n`
        if (upou) msgTexto += `\n⭐ **SUBIU DE NÍVEL!**`
        msgTexto += `\n\n"${nomeBot}"`

        await reagir(sock, msg, "✨")
        await sock.sendMessage(jid, { text: msgTexto }, { quoted: msg })
      }
    },

    gerarkeygold: {
      aliases: ["gerarkeyg", "criargold"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        
        if (!isDono && !isSubDono) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐀𝐕𝐈𝐒𝐎", "Comando restrito.", "Apenas o mestre pode gerar keys!", null, nomeBot) }, { quoted: msg })
        }

        const qtd = parseInt(args[0])
        if (!qtd || qtd <= 0) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Quantidade inválida.", "Digite a quantidade de Gold para a key.\n🐍 Exemplo: `+gerarkeygold 1000`", null, nomeBot) }, { quoted: msg })
        }

        const dbKeys = dbLer("keysgold.json", { keys: {} })
        const novaKey = gerarKeyAleatoria()

        dbKeys.keys[novaKey] = { gold: qtd, usado: false, criadoPor: msg.key.participant || msg.key.remoteJid, criadoEm: Date.now() }
        dbSalvar("keysgold.json", dbKeys)

        await reagir(sock, msg, "🎟️")
        await sock.sendMessage(jid, { 
          text: msgSucesso("𝐊𝐄𝐘 𝐃𝐄 𝐆𝐎𝐋𝐃", "Uma nova key de Gold foi criada!", `🎟️ Key: \`${novaKey}\`\n🐍 Valor: *+${qtd} Gold*\n\n🧊 _Essa key é de uso único._`, `💡 Entregue ao escolhido com \`+keygold ${novaKey}\``, nomeBot) 
        }, { quoted: msg })
      }
    },

    keygold: {
      aliases: ["resgatargold", "usarkeygold"],
      async executar({ sock, msg, args, db, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const keyInserida = (args[0] || "").toUpperCase().trim()

        if (!keyInserida) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Key em falta.", "Digite a key para resgatar.\n🐍 Exemplo: `+keygold KEY-XXXXXX`", null, nomeBot) }, { quoted: msg })
        }

        const dbKeys = dbLer("keysgold.json", { keys: {} })
        
        // 🔥 PROCURA A KEY SEM DIFERENCIAR MAIÚSCULA DE MINÚSCULA
        let keyReal = null;
        for (const k in dbKeys.keys) {
            if (k.toUpperCase() === keyInserida) { keyReal = k; break; }
        }

        if (!keyReal || !dbKeys.keys[keyReal]) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Key inválida.", "A key digitada não existe ou está errada.", null, nomeBot) }, { quoted: msg })
        }

        const dataKey = dbKeys.keys[keyReal]

        if (dataKey.usado) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Key já resgatada.", "Essa key já foi utilizada por outra pessoa.", null, nomeBot) }, { quoted: msg })
        }

        const { user, idReal } = buscarUsuario(db, sender, msg)
        const qtdGold = dataKey.gold
        
        user.gold = (user.gold || 0) + qtdGold
        salvarDragoesUser(db, idReal, user)

        dataKey.usado = true
        dataKey.usadoPor = idReal
        dataKey.usadoEm = Date.now()
        dbSalvar("keysgold.json", dbKeys)

        let msgTexto = `🎟️ • 𝐊𝐄𝐘 𝐑𝐄𝐒𝐆𝐀𝐓𝐀𝐃𝐀 •\n\n`
        msgTexto += `🌸 Você resgatou *${qtdGold} Gold*!\n\n`
        msgTexto += `🪙 Saldo atual: *${user.gold}*\n`
        msgTexto += `\n"${nomeBot}"`

        await reagir(sock, msg, "🪙")
        await sock.sendMessage(jid, { text: msgTexto }, { quoted: msg })
      }
    },

    // ========== 🔥 COMANDOS DE ADMIN (NÃO SÃO BLOQUEADOS) 🔥 ==========

    addxp: {
      aliases: ["darxp", "addxp"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        
        if (!isDono && !isSubDono) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐀𝐕𝐈𝐒𝐎", "Comando restrito.", "Apenas o mestre pode dar XP!", null, nomeBot) }, { quoted: msg })
        }

        let alvo = getAlvo(msg)
        if (!alvo) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Alvo não definido.", "Você precisa **marcar** a pessoa para dar XP.\n🐍 Exemplo: `+addxp @usuario 200`", null, nomeBot) }, { quoted: msg })
        }

        const qtd = parseInt(args.find(a => !isNaN(a) && !a.includes("@")))
        if (!qtd || qtd <= 0) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Valor inválido.", "Digite uma quantidade válida de XP.", null, nomeBot) }, { quoted: msg })
        }

        const { user, idReal } = buscarUsuario(db, alvo, msg)
        const upou = darXp(user, qtd)
        salvarDragoesUser(db, idReal, user)

        const xpNec = user.nivelTreinador * 200
        const progresso = Math.floor((user.xpTreinador / xpNec) * 10)
        const barra = "🟢".repeat(Math.min(10, progresso)) + "⬛".repeat(Math.max(0, 10 - progresso))
        const pct = Math.floor((user.xpTreinador / xpNec) * 100)

        let msgTexto = `✨ • 𝐗𝐏 𝐀𝐃𝐈𝐂𝐈𝐎𝐍𝐀𝐃𝐎 •\n\n`
        msgTexto += `🌸 Mestre enviou *${qtd} XP* para @${idReal.split("@")[0]}!\n\n`
        msgTexto += `🐍 Nível: *${user.nivelTreinador}* / 15\n`
        msgTexto += `🧊 Progresso: ${user.xpTreinador}/${xpNec} (${pct}%)\n`
        msgTexto += `${barra}\n`
        if (upou) msgTexto += `\n⭐ **SUBIU DE NÍVEL!**`
        msgTexto += `\n\n"${nomeBot}"`

        await reagir(sock, msg, "✨")
        await sock.sendMessage(jid, { text: msgTexto, mentions: [alvo] }, { quoted: msg })
      }
    },

    addgoldragon: {
      aliases: ["dargold", "addgold"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        
        if (!isDono && !isSubDono) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐀𝐕𝐈𝐒𝐎", "Comando restrito.", "Apenas o mestre pode dar gold!", null, nomeBot) }, { quoted: msg })
        }

        let alvo = getAlvo(msg)
        if (!alvo) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Alvo não definido.", "Você precisa **marcar** a pessoa para dar gold.\n🐍 Exemplo: `+addgold @usuario 100`", null, nomeBot) }, { quoted: msg })
        }

        const qtd = parseInt(args.find(a => !isNaN(a) && !a.includes("@")))
        if (!qtd || qtd <= 0) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Valor inválido.", "Digite uma quantidade válida de Gold.", null, nomeBot) }, { quoted: msg })
        }

        const { user, idReal } = buscarUsuario(db, alvo, msg)
        user.gold = (user.gold || 0) + qtd
        salvarDragoesUser(db, idReal, user)

        await reagir(sock, msg, "🪙")
        await sock.sendMessage(jid, { text: msgSucesso("𝐆𝐎𝐋𝐃 𝐀𝐃𝐈𝐂𝐈𝐎𝐍𝐀𝐃𝐎", "Ouro enviado com sucesso!", `🌸 Mestre enviou *${qtd} Gold* para @${idReal.split("@")[0]}!\n🐍 Saldo atual: *${user.gold}*`, null, nomeBot), mentions: [alvo] }, { quoted: msg })
      }
    },

    spawndragao: {
      aliases: ["forcardragao", "spawn"],
      async executar({ sock, msg, args, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)

        if (!isDono && !isSubDono) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐀𝐕𝐈𝐒𝐎", "Comando restrito.", "Apenas o mestre pode forçar spawn!", null, nomeBot) }, { quoted: msg })
        }

        const raridadeArg = (args[0] || "").toLowerCase()
        let raridadeAlvo = ""
        
        if (raridadeArg === "comum") raridadeAlvo = "Comum"
        else if (raridadeArg === "raro") raridadeAlvo = "Raro"
        else if (raridadeArg === "epico") raridadeAlvo = "Épico"
        else if (raridadeArg === "lendario") raridadeAlvo = "Lendário"
        else if (raridadeArg === "mitico") raridadeAlvo = "Mítico"
        else {
             const roll = Math.random() * 100
             if (roll < 0.1) raridadeAlvo = "Mítico"
             else if (roll < 5.1) raridadeAlvo = "Lendário"
             else if (roll < 15.1) raridadeAlvo = "Épico"
             else if (roll < 40.1) raridadeAlvo = "Raro"
             else raridadeAlvo = "Comum"
        }

        const candidatos = Object.entries(DRAGOES).filter(([_, d]) => d.raridade === raridadeAlvo)
        if (!candidatos.length) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Raridade inválida.", `Raridade *${raridadeArg}* não encontrada.\n🐍 Use: comum, raro, epico, lendario ou mitico.`, null, nomeBot) }, { quoted: msg })
        }

        const [nome, dados] = candidatos[Math.floor(Math.random() * candidatos.length)]
        const dragao = { nome, ...dados }

        const sessaoAtual = getSessao(jid)
        if (sessaoAtual && sessaoAtual.dragao && Date.now() - sessaoAtual.timestamp < 60000) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgAviso("𝐀𝐕𝐈𝐒𝐎", "Já tem um dragão no grupo.", "Espere ele fugir ou ser domado.", null, nomeBot) }, { quoted: msg })
        }

        setSessao(jid, { dragao, timestamp: Date.now() })
        const emojiRaridade = { "Comum": "🟢", "Raro": "🔵", "Épico": "🟣", "Lendário": "🟡", "Mítico": "🔴" }[dragao.raridade] || "🐉"
        
        const texto = `🐉 • 𝐃𝐑𝐀𝐆𝐀̃𝐎 𝐀𝐏𝐀𝐑𝐄𝐂𝐄𝐔! •\n\n${emojiRaridade} *${dragao.nome}*\n🐍 Raridade: ${dragao.raridade}\n\n🌸 Vocês têm *1 minuto* pra domar!\n🐍 Use: \`+domar ${dragao.nome}\`\n\n_"A serpente observa..."_ 🐍`

        await reagir(sock, msg, "🐉")
        try { await sock.sendMessage(jid, { image: { url: dragao.foto }, caption: texto }, { quoted: msg }) } 
        catch (e) { await sock.sendMessage(jid, { text: texto }, { quoted: msg }) }

        setTimeout(() => {
          const s = getSessao(jid)
          if (s && s.dragao && Date.now() - s.timestamp >= 55000) {
            delSessao(jid)
            sock.sendMessage(jid, { text: msgAviso("𝐅𝐔𝐆𝐈𝐔", "O dragão foi embora.", `🌸 O *${dragao.nome}* fugiu... ninguém o domou a tempo.`, null, nomeBot) }).catch(() => {})
          }
        }, 60000)
      }
    }

  }
}