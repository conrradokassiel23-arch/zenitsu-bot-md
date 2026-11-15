/* ============================================================
   🌸 MENU DRAGÃO - LIMPO E ESTILIZADO
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

function nomeBotDb(db) { try { return db.config?.()?.nomeBot || "Rimuru" } catch { return "Rimuru" } }
function getCfg(db) { try { return db.config?.() || {} } catch { return {} } }

function getAlvo(msg) {
  const ctx = (msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo) || {};
  const mentions = ctx.mentionedJid || [];
  if (mentions.length) return mentions[0];
  if (ctx.participant) return ctx.participant;
  return null;
}

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
    } else break;
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

  let texto = `𝑰𝑵𝑽𝑨𝑺𝑨̃𝑶 𝑫𝑬 𝑪𝑨𝑪̧𝑨𝑫𝑶𝑹𝑬𝑺\n\n🌸 Caçadores estão atacando a vila de @${userId.split("@")[0]}!\n\n`

  if (defesa >= ataqueCacador) {
    user.gold = (user.gold || 0) + 100
    const xpGanha = infoDragao ? infoDragao.xp : 20
    const upou = darXp(user, xpGanha)
    dbSalvar("dragoes.json", dAll)
    texto += `✅ Defendido!\n*${dragaoNome}* protegeu a vila!\nDefesa: ${Math.floor(defesa)} vs Ataque: ${Math.floor(ataqueCacador)}\n\n+100 Gold\n+${xpGanha} XP${upou ? `\n⭐ UPOU PARA NÍVEL ${user.nivelTreinador}!` : ""}`
  } else {
    user.hpVila = (user.hpVila || 100) - 25
    if (user.hpVila < 0) user.hpVila = 0
    dbSalvar("dragoes.json", dAll)
    texto += `❌ Ataque!\n*${dragaoNome}* não resistiu!\nDefesa: ${Math.floor(defesa)} vs Ataque: ${Math.floor(ataqueCacador)}\nVida da vila: ${user.hpVila}/${user.maxVila}`
  }
  await sock.sendMessage(jidGrupo, { text: texto, mentions: [userId] })
}

module.exports = {
  menu: "menu-dragao",
  grupoOnly: true,
  adminOnly: false,
  donoOnly: false,

  async rendaAutomatica(sock, db) {
    return rendaAutomatica(sock, db);
  },

  commands: {
    menudragao: {
      aliases: ["dragaomenu", "comandosdragao"],
      async executar({ sock, msg, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const nomeBot = nomeBotDb(db)
        const cfg = getCfg(db)

        await reagir(sock, msg, "🐉")

        const texto = `🐉 *𝑴𝑬𝑵𝑼 𝑫𝑹𝑨𝑮𝑨̃𝑶* 🐉

🤖 𝐁𝐨𝐭: ${nomeBot}
⚡ 𝐏𝐫𝐞𝐟𝐢𝐱𝐨: ${p}
🟢 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐎𝐧𝐥𝐢𝐧𝐞

🌿 *𝑮𝑬𝑹𝑨𝑳*
${p}dragao on/off
${p}domar <nome>
${p}meudragao
${p}verdragao @user
${p}alimentardragao <nome>
${p}treinadordg
${p}uparvila

🌿 *𝑨𝑪̧𝑶̃𝑬𝑺*
${p}batalha on/off
${p}batalhadragao
${p}escolherdg <nº>
${p}ataque 1/2/3
${p}boss
${p}ruinas

🌿 *𝑬𝑪𝑶𝑵𝑶𝑴𝑰𝑨*
${p}saldo
${p}lojadragao
${p}comprardragao <item>
${p}inventariodragao
${p}usarsela <nome>
${p}evoluirdragao <nome>

🌿 *𝑶𝑽𝑶𝑺 & 𝑽𝑶𝑶*
${p}voar <nome>
${p}chocarovo <nome>
${p}meuseggs
${p}livrodg

🌿 *𝑴𝑰𝑺𝑺𝑶̃𝑬𝑺*
${p}missao

> _Prefixo: ${p}_`

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

    dragao: {
      aliases: ["dragon", "dragaoon"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const nomeBot = nomeBotDb(db)
        const op = (args[0] || "").toLowerCase()

        const cfg = dbLer("dragaocfg.json", { grupos: {} })
        cfg.grupos[jid] = cfg.grupos[jid] || {}

        if (!["on", "off"].includes(op)) {
          const s = cfg.grupos[jid].ativo ? "ON ✅" : "OFF ❌"
          await reagir(sock, msg, "🐉")
          return sock.sendMessage(jid, { text: msgAviso("𝑫𝑹𝑨𝑮𝑨̃𝑶", `Status atual: ${s}`, `Use \`${p}dragao on/off\``) }, { quoted: msg })
        }

        cfg.grupos[jid].ativo = op === "on"
        dbSalvar("dragaocfg.json", cfg)
        await reagir(sock, msg, op === "on" ? "✅" : "🗑️")
        await sock.sendMessage(jid, { text: op === "on" ? msgSucesso("", "Sistema ativado.") : msgAviso("𝑫𝑹𝑨𝑮𝑨̃𝑶", "Sistema desativado.") }, { quoted: msg })
      }
    },

    batalha: {
      aliases: ["pvp", "permitirbatalha"],
      async executar({ sock, msg, args, db, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)

        if (!sistemaAtivo(db, jid)) {
          await reagir(sock, msg, "🚫")
          return sock.sendMessage(jid, { text: msgErro("𝑺𝑰𝑺𝑻𝑬𝑴𝑨 𝑶𝑭𝑭", "O jogo está desativado.") }, { quoted: msg })
        }

        const op = (args[0] || "").toLowerCase()
        const { user, idReal } = buscarUsuario(db, sender, msg)
        if (user.pvpAtivo === undefined) user.pvpAtivo = true

        if (!["on", "off"].includes(op)) {
          const s = user.pvpAtivo ? "ON ✅" : "OFF ❌"
          await reagir(sock, msg, "⚔️")
          return sock.sendMessage(jid, { text: msgAviso("𝑩𝑨𝑻𝑨𝑳𝑯𝑨 𝑷𝑽𝑷", `Status atual: ${s}`, `Use \`+batalha on/off\``) }, { quoted: msg })
        }

        user.pvpAtivo = op === "on"
        salvarDragoesUser(db, idReal, user)
        await reagir(sock, msg, op === "on" ? "✅" : "🗑️")
        await sock.sendMessage(jid, { text: msgSucesso("", `Você ${op === "on" ? "AGORA PODE" : "NÃO PODE MAIS"} ser desafiado!`) }, { quoted: msg })
      }
    },

    treinadordg: {
      aliases: ["meutreinador", "leveltreinador"],
      async executar({ sock, msg, db, sender }) {
        const jid = msg.key.remoteJid
        if (!sistemaAtivo(db, jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑰𝑺𝑻𝑬𝑴𝑨 𝑶𝑭𝑭", "O jogo está desativado.") }, { quoted: msg }) }
        const { user } = buscarUsuario(db, sender, msg)
        const xpNec = user.nivelTreinador * 200
        const progresso = Math.floor((user.xpTreinador / xpNec) * 10)
        const barra = "🐉".repeat(Math.min(10, progresso)) + "⬛".repeat(Math.max(0, 10 - progresso))

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("𝑻𝑹𝑬𝑰𝑵𝑨𝑫𝑶𝑹", "Seu progresso atual", `Nível: ${user.nivelTreinador} / 15\nXP: ${user.xpTreinador} / ${xpNec}\n${barra}\nVila Nível: ${user.nivelVila}/6`) }, { quoted: msg })
      }
    },

    uparvila: {
      aliases: ["upvila", "evoluirvila"],
      async executar({ sock, msg, db, sender }) {
        const jid = msg.key.remoteJid
        if (!sistemaAtivo(db, jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑰𝑺𝑻𝑬𝑴𝑨 𝑶𝑭𝑭", "O jogo está desativado.") }, { quoted: msg }) }
        const { user, idReal } = buscarUsuario(db, sender, msg)
        if (user.nivelVila >= 6) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑽𝑰𝑳𝑨 𝑴𝑨𝑿𝑰𝑴𝑨", "Sua vila já está no nível máximo (6).") }, { quoted: msg }) }
        const custo = user.nivelVila * 200
        if ((user.gold || 0) < custo) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑬𝑴 𝑮𝑶𝑳𝑫", "Você não tem ouro suficiente.", `Custa ${custo} Gold | Saldo: ${user.gold}`) }, { quoted: msg }) }
        user.gold -= custo
        user.nivelVila += 1
        user.maxVila = 100 + (user.nivelVila - 1) * 120
        if (user.maxVila > 700) user.maxVila = 700
        user.hpVila = user.maxVila
        salvarDragoesUser(db, idReal, user)
        await reagir(sock, msg, "✅")
        await sock.sendMessage(jid, { text: msgSucesso("", "Sua vila cresceu!", `Novo Nível: ${user.nivelVila}\nVida Máxima: ${user.maxVila}\nGold restante: ${user.gold}`) }, { quoted: msg })
      }
    },

    meudragao: {
      aliases: ["meusdragoes", "mydragons"],
      async executar({ sock, msg, db, sender }) {
        const jid = msg.key.remoteJid
        if (!sistemaAtivo(db, jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑰𝑺𝑻𝑬𝑴𝑨 𝑶𝑭𝑭", "O jogo está desativado.") }, { quoted: msg }) }
        const { user } = buscarUsuario(db, sender, msg)
        const dragoes = Object.values(user.dragoes)
        if (!dragoes.length) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgErro("𝑵𝑬𝑵𝑯𝑼𝑴 𝑫𝑹𝑨𝑮𝑨̃𝑶", "Você ainda não domou nenhum.") }, { quoted: msg }) }

        let txt = `𝑺𝑬𝑼𝑺 𝑫𝑹𝑨𝑮𝑶̃𝑬𝑺\n\nGold: ${user.gold || 0}\nVila: ${user.hpVila}/${user.maxVila} (Nv. ${user.nivelVila})\nPvP: ${user.pvpAtivo === false ? "OFF" : "ON"}\n\n`
        dragoes.forEach((d, i) => {
          const titulo = d.asaTita ? `⚡ ${d.nome}` : d.nome
          const sela = d.temSela ? "🐎" : "❌"
          const bebe = d.ehBebe ? "🐣 Bebê" : "Adulto"
          txt += `#${i + 1} ${titulo}\nNv. ${d.nivel} • ${d.raridade} • ${sela} • ${bebe}\nHP: ${d.hp}/${d.hpMax} • EN: ${d.energia}/${d.energiaMax}\n\n`
        })
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    verdragao: {
      aliases: ["vd", "verdragoes", "dragoesde"],
      async executar({ sock, msg, db, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        if (!sistemaAtivo(db, jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑰𝑺𝑻𝑬𝑴𝑨 𝑶𝑭𝑭", "O jogo está desativado.") }, { quoted: msg }) }

        let alvo = getAlvo(msg)
        if (!alvo) {
          const txt = msg.message?.conversation || msg.message?.extendedTextMessage?.text || ""
          const args = txt.split(" ").slice(1)
          if (args[0]) alvo = args[0].replace(/\D/g, "") + "@s.whatsapp.net"
        }
        if (!alvo) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgErro("𝑽𝑬𝑹 𝑫𝑹𝑨𝑮𝑶̃𝑬𝑺", "Você não marcou ninguém.", "Marque ou digite o número.") }, { quoted: msg }) }

        const { user } = buscarUsuario(db, alvo, msg)
        const dragoes = Object.values(user.dragoes)
        const numAlvo = alvo.split("@")[0]
        if (!dragoes.length) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑬𝑹𝑹𝑶", "Treinador sem dragões.", `O treinador ${numAlvo} não tem dragões.`) }, { quoted: msg }) }

        let txt = `𝑫𝑹𝑨𝑮𝑶̃𝑬𝑺 𝑫𝑬 ${numAlvo}\n\n`
        dragoes.forEach((d, i) => {
          const titulo = d.asaTita ? `⚡ ${d.nome}` : d.nome
          const sela = d.temSela ? "🐎" : "❌"
          const bebe = d.ehBebe ? "🐣 Bebê" : "Adulto"
          txt += `#${i + 1} ${titulo}\nNv. ${d.nivel} • ${d.raridade} • ${sela} • ${bebe}\nHP: ${d.hp}/${d.hpMax}\n\n`
        })
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    domar: {
      aliases: ["domesticar", "tamedragon"],
      async executar({ sock, msg, args, db, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        if (!sistemaAtivo(db, jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑰𝑺𝑻𝑬𝑴𝑨 𝑶𝑭𝑭", "O jogo está desativado.") }, { quoted: msg }) }

        const nomeDragao = args.join(" ").trim()
        const sessao = getSessao(jid)
        if (!sessao || !sessao.dragao) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑫𝑶𝑴𝑨𝑹", "Nenhum dragão para domar.", "Aguarde um dragão aparecer no grupo.") }, { quoted: msg }) }
        if (Date.now() - sessao.timestamp > 60000) { delSessao(jid); await reagir(sock, msg, "⏰"); return sock.sendMessage(jid, { text: msgAviso("𝑻𝑬𝑴𝑷𝑶 𝑬𝑺𝑮𝑶𝑻𝑨𝑫𝑶", "O dragão fugiu.", "Ele esperou muito tempo e foi embora.") }, { quoted: msg }) }
        if (nomeDragao.toLowerCase() !== sessao.dragao.nome.toLowerCase()) {
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgErro("𝑵𝑶𝑴𝑬 𝑬𝑹𝑹𝑨𝑫𝑶", "O nome não coincide.", `O dragão no grupo é: ${sessao.dragao.nome}\nTente \`+domar ${sessao.dragao.nome}\``) }, { quoted: msg })
        }

        const { user, idReal } = buscarUsuario(db, sender, msg)
        const chances = { "Comum": 70, "Raro": 50, "Épico": 30, "Lendário": 10, "Mítico": 1 }
        const chanceBase = chances[sessao.dragao.raridade] || 50
        const bonusNivel = user.nivelTreinador * 2
        const chanceFinal = chanceBase + bonusNivel

        if (Math.random() * 100 > chanceFinal) {
          if (Math.random() < 0.5) { delSessao(jid); await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑭𝑼𝑮𝑰𝑼", "O dragão fugiu!", `Sua chance era de ${chanceFinal}%.`) }, { quoted: msg }) }
          await reagir(sock, msg, "❌")
          return sock.sendMessage(jid, { text: msgAviso("𝑭𝑨𝑳𝑯𝑶𝑼", "O dragão resistiu!", `Sua chance era de ${chanceFinal}%.`) }, { quoted: msg })
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
          caption: msgSucesso("", "Você domou um novo dragão!", `${sessao.dragao.nome}\nNível: 1 | Raridade: ${sessao.dragao.raridade}`)
        }, { quoted: msg })
      }
    },

    batalhadragao: {
      aliases: ["batalhar", "battle", "lobby"],
      async executar({ sock, msg, db, prefixoAtivo, sender }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const nomeBot = nomeBotDb(db)
        if (!sistemaAtivo(db, jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑰𝑺𝑻𝑬𝑴𝑨 𝑶𝑭𝑭", "O jogo está desativado.") }, { quoted: msg }) }

        const { user, idReal } = buscarUsuario(db, sender, msg)
        const chaveLobby = `lobby_${jid}`
        let lobby = getSessao(chaveLobby)

        if (!lobby || (lobby.jogador1 && lobby.jogador2)) {
          if (Object.keys(user.dragoes || {}).length === 0) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Sem dragões.", "Domine um dragão antes de batalhar.") }, { quoted: msg }) }
          if (user.pvpAtivo === false) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑷𝑽𝑷 𝑶𝑭𝑭", "Você desativou o PvP.", `Use \`${p}batalha on\``) }, { quoted: msg }) }
          lobby = { jogador1: { id: idReal, num: idReal.split("@")[0], dragao: null, escolhido: false }, jogador2: null, estado: "esperando" }
          setSessao(chaveLobby, lobby)
          await reagir(sock, msg, "⚔️")
          return sock.sendMessage(jid, { text: msgSucesso("", "Lobby aberto.", `@${lobby.jogador1.num} abriu um lobby!\nPara entrar: \`${p}batalhadragao\``), mentions: [idReal] }, { quoted: msg })
        }

        if (lobby && lobby.jogador1 && !lobby.jogador2) {
          if (lobby.jogador1.id === idReal) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑨𝑽𝑰𝑺𝑶", "Você já está no lobby.", "Aguarde alguém entrar.") }, { quoted: msg }) }
          if (Object.keys(user.dragoes || {}).length === 0) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Sem dragões.", "Domine um dragão antes.") }, { quoted: msg }) }
          if (user.pvpAtivo === false) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑷𝑽𝑷 𝑶𝑭𝑭", "Você desativou o PvP.", `Use \`${p}batalha on\``) }, { quoted: msg }) }

          lobby.jogador2 = { id: idReal, num: idReal.split("@")[0], dragao: null, escolhido: false }
          lobby.estado = "escolhendo"
          const chaveBatalha = `batalha_${jid}`
          setSessao(chaveBatalha, lobby)
          delSessao(chaveLobby)

          const { user: u1 } = buscarUsuario(db, lobby.jogador1.id, msg)
          const { user: u2 } = buscarUsuario(db, lobby.jogador2.id, msg)

          let txt = `𝑩𝑨𝑻𝑨𝑳𝑯𝑨 𝑷𝑹𝑶𝑵𝑻𝑨\n\n@${lobby.jogador1.num} vs @${lobby.jogador2.num}\n\n@${lobby.jogador1.num}:\n`
          let idx1 = 1
          for (const nome in u1.dragoes) { txt += `${idx1}. ${nome} (Nv. ${u1.dragoes[nome].nivel})\n`; idx1++ }
          txt += `\n@${lobby.jogador2.num}:\n`
          let idx2 = 1
          for (const nome in u2.dragoes) { txt += `${idx2}. ${nome} (Nv. ${u2.dragoes[nome].nivel})\n`; idx2++ }
          txt += `\nEscolham:\n${p}escolherdg 1`

          await reagir(sock, msg, "⚔️")
          return sock.sendMessage(jid, { text: txt, mentions: [lobby.jogador1.id, lobby.jogador2.id] }, { quoted: msg })
        }
      }
    },

    escolherdg: {
      aliases: ["escolher", "selectdragon"],
      async executar({ sock, msg, args, db, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        if (!sistemaAtivo(db, jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑰𝑺𝑻𝑬𝑴𝑨 𝑶𝑭𝑭", "O jogo está desativado.") }, { quoted: msg }) }

        const numEscolha = parseInt(args[0])
        if (!numEscolha || numEscolha < 1) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Número inválido.", "Use o número do dragão.") }, { quoted: msg }) }

        const chaveBatalha = `batalha_${jid}`
        const batalha = getSessao(chaveBatalha)
        if (!batalha || batalha.estado !== "escolhendo") { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Nenhuma batalha ativa.", "Não há batalha em andamento neste grupo.") }, { quoted: msg }) }

        const { user, idReal } = buscarUsuario(db, sender, msg)
        const jogador = batalha.jogador1.id === idReal ? batalha.jogador1 : batalha.jogador2.id === idReal ? batalha.jogador2 : null
        if (!jogador) return

        const nomesDragoes = Object.keys(user.dragoes)
        const dragaoNome = nomesDragoes[numEscolha - 1]
        if (!dragaoNome) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Número não existe.", "Você não tem um dragão nesse slot.") }, { quoted: msg }) }

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
          await reagir(sock, msg, "⚔️")
          return sock.sendMessage(jid, {
            text: msgSucesso("", "Os dois dragões foram escolhidos!", `${batalha.jogador1.dragao} (@${batalha.jogador1.num})\nvs\n${batalha.jogador2.dragao} (@${batalha.jogador2.num})\n\nJOGADOR 1, comece:\n\`+ataque 1/2/3\``),
            mentions: [batalha.jogador1.id, batalha.jogador2.id]
          }, { quoted: msg })
        }
        await reagir(sock, msg, "🌸")
        return sock.sendMessage(jid, { text: msgAviso("𝑬𝑺𝑪𝑶𝑳𝑯𝑰𝑫𝑶", "Dragão pronto para a batalha.", `${dragaoNome} foi escolhido!\nAguardando o oponente escolher...`) }, { quoted: msg })
      }
    },

    ataque: {
      aliases: ["atacar", "attack"],
      async executar({ sock, msg, args, db, prefixoAtivo, sender }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const nomeBot = nomeBotDb(db)
        if (!sistemaAtivo(db, jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑰𝑺𝑻𝑬𝑴𝑨 𝑶𝑭𝑭", "O jogo está desativado.") }, { quoted: msg }) }

        const numAtaque = parseInt(args[0])
        const { idReal: userId } = buscarUsuario(db, sender, msg)
        if (![1, 2, 3].includes(numAtaque)) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Ataque inválido.", `Use: \`${p}ataque 1\`, \`${p}ataque 2\` ou \`${p}ataque 3\`.`) }, { quoted: msg }) }

        const chaveBatalha = `batalha_${jid}`
        const batalha = getSessao(chaveBatalha)
        if (!batalha || batalha.estado !== "iniciada") { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Batalha não iniciada.", "Nenhuma batalha em andamento.") }, { quoted: msg }) }

        const jogadorAtual = batalha.turno === 1 ? batalha.jogador1 : batalha.jogador2
        if (jogadorAtual.id !== userId) { await reagir(sock, msg, "⏰"); return sock.sendMessage(jid, { text: msgAviso("𝑬𝑺𝑷𝑬𝑹𝑬", "Não é seu turno.", "Aguarde o oponente atacar.") }, { quoted: msg }) }

        const atacante = jogadorAtual
        const defensor = batalha.turno === 1 ? batalha.jogador2 : batalha.jogador1
        const custos = { 1: 10, 2: 20, 3: 30 }
        const custo = custos[numAtaque]

        if (atacante.energia < custo) {
          const vencedor = batalha.jogador1.energia >= batalha.jogador2.energia ? batalha.jogador1 : batalha.jogador2
          delSessao(chaveBatalha)
          const { user: uVencedor, idReal: idVencedor } = buscarUsuario(db, vencedor.id, msg)
          const upouV = darXp(uVencedor, 50)
          salvarDragoesUser(db, idVencedor, uVencedor)
          await reagir(sock, msg, "🏆")
          return sock.sendMessage(jid, { text: msgAviso("𝑭𝑰𝑴 𝑫𝑬 𝑱𝑶𝑮𝑶", "Cansaço extremo.", `${atacante.dragao} ficou exausto!\n\nVencedor: ${vencedor.dragao} (@${vencedor.num})\n+50 XP${upouV ? `\n⭐ UPOU PARA NÍVEL ${uVencedor.nivelTreinador}!` : ""}`) }, { quoted: msg })
        }

        atacante.energia -= custo
        const danoBase = { 1: atacante.atk * 1.5, 2: atacante.atk * 2.5, 3: atacante.atk * 4.0 }[numAtaque]
        const critico = Math.random() < 0.15
        const danoFinal = Math.floor(danoBase * (critico ? 2 : 1) * (0.9 + Math.random() * 0.2))
        const esquivou = Math.random() * 100 < defensor.evasao

        let log = ""
        if (esquivou) { log = `${defensor.dragao} esquivou do ataque!` }
        else { defensor.hp -= danoFinal; log = `${atacante.dragao} usou ataque ${numAtaque}!\nDano: ${danoFinal}${critico ? " 💥 CRÍTICO!" : ""}\n${defensor.dragao} HP: ${Math.max(0, defensor.hp)}/${defensor.hpMax}` }

        if (defensor.hp <= 0) {
          delSessao(chaveBatalha)
          const { user: uVencedor, idReal: idVencedor } = buscarUsuario(db, atacante.id, msg)
          const upouV = darXp(uVencedor, 50)
          salvarDragoesUser(db, idVencedor, uVencedor)
          await reagir(sock, msg, "🏆")
          return sock.sendMessage(jid, { text: msgSucesso("𝑩𝑨𝑻𝑨𝑳𝑯𝑨 𝑬𝑵𝑪𝑬𝑹𝑹𝑨𝑫𝑨", "Temos um vencedor!", `Vencedor: ${atacante.dragao} (@${atacante.num})\n\n${log}\n+50 XP${upouV ? `\n⭐ UPOU PARA NÍVEL ${uVencedor.nivelTreinador}!` : ""}`) }, { quoted: msg })
        }

        batalha.turno = batalha.turno === 1 ? 2 : 1
        setSessao(chaveBatalha, batalha)

        await reagir(sock, msg, "⚔️")
        await sock.sendMessage(jid, {
          text: msgAviso("𝑻𝑼𝑹𝑵𝑶", "Seu oponente atacou!", `${log}\n\nVez de @${defensor.num} atacar:\nUse \`${p}ataque 1/2/3\``),
          mentions: [defensor.id.includes("@") ? defensor.id : defensor.id + "@s.whatsapp.net"]
        }, { quoted: msg })
      }
    },

    lojadragao: {
      aliases: ["lojadragão", "shopdragao"],
      async executar({ sock, msg, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (!sistemaAtivo(db, jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑰𝑺𝑻𝑬𝑴𝑨 𝑶𝑭𝑭", "O jogo está desativado.") }, { quoted: msg }) }
        const p = prefixoAtivo || "+"
        const { user } = buscarUsuario(db, sender, msg)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgAviso("𝑳𝑶𝑱𝑨 𝑫𝑹𝑨𝑮𝑨̃𝑶", `Seu saldo: ${user.gold || 0} Goldragon`, `Sela: 150 Gold\nPergaminho: 300 Gold\n\nUse \`${p}comprardragao sela\` ou \`${p}comprardragao pergaminho\``) }, { quoted: msg })
      }
    },

    comprardragao: {
      aliases: ["comprardragão", "buydragao", "comprar"],
      async executar({ sock, msg, args, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (!sistemaAtivo(db, jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑰𝑺𝑻𝑬𝑴𝑨 𝑶𝑭𝑭", "O jogo está desativado.") }, { quoted: msg }) }
        const p = prefixoAtivo || "+"
        const item = args.join(" ").trim().toLowerCase()
        const { user, idReal } = buscarUsuario(db, sender, msg)

        if (item === "sela" || item === "selas") {
          if ((user.gold || 0) < 150) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑬𝑴 𝑮𝑶𝑳𝑫", "Ouro insuficiente.", `Precisa 150 Gold (tem ${user.gold || 0}).`) }, { quoted: msg }) }
          user.gold -= 150; user.inventario.selas = (user.inventario.selas || 0) + 1
          salvarDragoesUser(db, idReal, user)
          await reagir(sock, msg, "✅")
          return sock.sendMessage(jid, { text: msgSucesso("", "1 Sela adquirida!", `Saldo atual: ${user.gold} Gold\nUse: \`${p}usarsela <nome>\``) }, { quoted: msg })
        }

        if (item === "pergaminho" || item === "pergaminhos") {
          if ((user.gold || 0) < 300) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑬𝑴 𝑮𝑶𝑳𝑫", "Ouro insuficiente.", `Precisa 300 Gold (tem ${user.gold || 0}).`) }, { quoted: msg }) }
          user.gold -= 300; user.inventario.pergaminhos = (user.inventario.pergaminhos || 0) + 1
          salvarDragoesUser(db, idReal, user)
          await reagir(sock, msg, "✅")
          return sock.sendMessage(jid, { text: msgSucesso("", "1 Pergaminho adquirido!", `Saldo atual: ${user.gold} Gold\nUse: \`${p}evoluirdragao <nome>\``) }, { quoted: msg })
        }

        await reagir(sock, msg, "❌")
        await sock.sendMessage(jid, { text: msgErro("𝑳𝑶𝑱𝑨", "Item inválido.", `Você digitou: ${item || "vazio"}`) }, { quoted: msg })
      }
    },

    saldo: {
      aliases: ["gold", "meugold", "meusaldo"],
      async executar({ sock, msg, db, sender }) {
        const jid = msg.key.remoteJid
        if (!sistemaAtivo(db, jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑰𝑺𝑻𝑬𝑴𝑨 𝑶𝑭𝑭", "O jogo está desativado.") }, { quoted: msg }) }
        const { user } = buscarUsuario(db, sender, msg)
        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("", "O ouro atrai dragões.", `Seu saldo atual é de ${user.gold || 0} Goldragon`) }, { quoted: msg })
      }
    },

    inventariodragao: {
      aliases: ["inv_dragao", "mochiladragao"],
      async executar({ sock, msg, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (!sistemaAtivo(db, jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑰𝑺𝑻𝑬𝑴𝑨 𝑶𝑭𝑭", "O jogo está desativado.") }, { quoted: msg }) }
        const p = prefixoAtivo || "+"
        const { user } = buscarUsuario(db, sender, msg)

        let ovosTxt = ""
        const ovos = Object.entries(user.inventario.ovos || {}).filter(([_, qtd]) => qtd > 0)
        if (ovos.length) { ovos.forEach(([nome, qtd]) => { ovosTxt += `${nome} (x${qtd})\n` }) }
        else { ovosTxt = "Nenhum ovo.\n" }

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: `𝑰𝑵𝑽𝑬𝑵𝑻𝑨́𝑹𝑰𝑶\n\nGoldragon: ${user.gold || 0}\nVida da Vila: ${user.hpVila || 100}/${user.maxVila || 100}\n\nSelas: ${user.inventario.selas}\nPergaminhos: ${user.inventario.pergaminhos}\n\nOvos:\n${ovosTxt}\n\n> Use ${p}chocarovo <nome>.` }, { quoted: msg })
      }
    },

    meuseggs: {
      aliases: ["meusovos", "verovos", "meusegg"],
      async executar({ sock, msg, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (!sistemaAtivo(db, jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑰𝑺𝑻𝑬𝑴𝑨 𝑶𝑭𝑭", "O jogo está desativado.") }, { quoted: msg }) }
        const p = prefixoAtivo || "+"
        const { user } = buscarUsuario(db, sender, msg)
        const ovos = Object.entries(user.inventario?.ovos || {}).filter(([_, qtd]) => qtd > 0)

        if (!ovos.length) {
          await reagir(sock, msg, "⚠️")
          return sock.sendMessage(jid, { text: msgAviso("𝑴𝑬𝑼𝑺 𝑶𝑽𝑶𝑺", "Você não tem nenhum ovo.", `Voe com seu dragão para encontrar ovos.\nUse \`${p}voar <nome>\``) }, { quoted: msg })
        }

        let txt = `𝑴𝑬𝑼𝑺 𝑶𝑽𝑶𝑺\n\n`
        let total = 0
        for (const [nome, qtd] of ovos) { txt += `${nome} x${qtd}\n`; total += qtd }
        txt += `\nTotal: ${total}\n\nUse \`${p}chocarovo <nome>\``
        await reagir(sock, msg, "🥚")
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    usarsela: {
      aliases: ["equiparsela", "colocarsela"],
      async executar({ sock, msg, args, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (!sistemaAtivo(db, jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑰𝑺𝑻𝑬𝑴𝑨 𝑶𝑭𝑭", "O jogo está desativado.") }, { quoted: msg }) }
        const p = prefixoAtivo || "+"
        const nomeDragao = args.join(" ").trim()
        const { user, idReal } = buscarUsuario(db, sender, msg)
        const nomeReal = Object.keys(user.dragoes).find(k => k.toLowerCase() === nomeDragao.toLowerCase())
        if (!nomeReal) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Dragão não encontrado.", `Você não tem o dragão: ${nomeDragao}.`) }, { quoted: msg }) }

        const d = user.dragoes[nomeReal]
        if (d.temSela) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑱𝑨́ 𝑻𝑬𝑴 𝑺𝑬𝑳𝑨", "Este dragão já está equipado.", `${nomeReal} já pode voar.`) }, { quoted: msg }) }
        if (user.inventario.selas < 1) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑬𝑴 𝑺𝑬𝑳𝑨", "Você não tem selas.", `Compre com \`${p}comprardragao sela\``) }, { quoted: msg }) }

        user.inventario.selas -= 1
        d.temSela = true
        salvarDragoesUser(db, idReal, user)

        await reagir(sock, msg, "✅")
        await sock.sendMessage(jid, { text: msgSucesso("", "Dragão pronto para voar!", `${nomeReal} agora tem sela!\nUse \`${p}voar ${nomeReal}\` para voar.`) }, { quoted: msg })
      }
    },

    voar: {
      aliases: ["fly", "voardragao"],
      async executar({ sock, msg, args, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (!sistemaAtivo(db, jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑰𝑺𝑻𝑬𝑴𝑨 𝑶𝑭𝑭", "O jogo está desativado.") }, { quoted: msg }) }
        const p = prefixoAtivo || "+"
        const nomeDragao = args.join(" ").trim()
        const { user, idReal } = buscarUsuario(db, sender, msg)
        const nomeReal = Object.keys(user.dragoes).find(k => k.toLowerCase() === nomeDragao.toLowerCase())
        if (!nomeReal) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Dragão não encontrado.", `Você não tem o dragão: ${nomeDragao}.`) }, { quoted: msg }) }

        const d = user.dragoes[nomeReal]
        if (!d.temSela) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑬𝑴 𝑺𝑬𝑳𝑨", "Dragão sem sela.", `${nomeReal} não pode voar sem sela!\nCompre com \`${p}comprardragao sela\``) }, { quoted: msg }) }

        const chanceVoar = { "Comum": 60, "Raro": 70, "Épico": 85, "Lendário": 95, "Mítico": 99 }[d.raridade] || 60
        if (Math.random() * 100 > chanceVoar) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑸𝑼𝑬𝑫𝑨", "Você caiu durante o voo.", `Você e ${nomeReal} caíram!\nTente novamente.`) }, { quoted: msg }) }

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
          achouOvo = `\n\n🥚 *VOCÊ ACHOU UM OVO!*\n${tipoOvo} foi adicionado ao inventário.`
          xpGanhaVoar += 30
        }

        const upou = darXp(user, xpGanhaVoar)
        salvarDragoesUser(db, idReal, user)
        const locais = ["Montanhas Geladas", "Ilha dos Dragões", "Cavernas Ocultas", "Vale Escondido", "Mar de Nuvens"]
        const local = locais[Math.floor(Math.random() * locais.length)]

        await reagir(sock, msg, "🌸")
        await sock.sendMessage(jid, { text: msgSucesso("", "Sobrevoando os céus!", `Você subiu em ${nomeReal}!\nLocal: ${local}\n\nRecompensa: +${recompensa} Gold\nXP: +${xpGanhaVoar}${upou ? `\n⭐ UPOU PARA NÍVEL ${user.nivelTreinador}!` : ""}\nSaldo: ${user.gold} Gold${achouOvo}`) }, { quoted: msg })
      }
    },

    chocarovo: {
      aliases: ["chocar", "eclodirovo"],
      async executar({ sock, msg, args, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (!sistemaAtivo(db, jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑰𝑺𝑻𝑬𝑴𝑨 𝑶𝑭𝑭", "O jogo está desativado.") }, { quoted: msg }) }
        const p = prefixoAtivo || "+"
        const nomeOvo = args.join(" ").trim()
        const { user, idReal } = buscarUsuario(db, sender, msg)

        if (!nomeOvo) {
          const ovos = Object.entries(user.inventario.ovos || {}).filter(([_, qtd]) => qtd > 0)
          if (!ovos.length) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑬𝑴 𝑶𝑽𝑶𝑺", "Você não tem ovos.", `Voe com seu dragão para achar ovos.\nUse \`${p}voar <nome>\``) }, { quoted: msg }) }
          let lista = ""
          ovos.forEach(([n, q]) => { lista += `${n} (x${q})\n` })
          await reagir(sock, msg, "🌸")
          return sock.sendMessage(jid, { text: msgAviso("𝑺𝑬𝑼𝑺 𝑶𝑽𝑶𝑺", "Escolha um ovo para chocar.", `${lista}\nPara chocar:\n\`${p}chocarovo <nome do ovo>\``) }, { quoted: msg })
        }

        const nomeRealOvo = Object.keys(user.inventario.ovos).find(k => k.toLowerCase() === nomeOvo.toLowerCase())
        if (!nomeRealOvo || user.inventario.ovos[nomeRealOvo] < 1) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Ovo não encontrado.", `Você não tem o ovo: ${nomeOvo}.`) }, { quoted: msg }) }
        if (Object.keys(user.dragoes).length >= 15) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑳𝑰𝑴𝑰𝑻𝑬", "Você atingiu o limite de 15 dragões.", `Venda ou doe algum antes de chocar outro ovo.`) }, { quoted: msg }) }

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

        await reagir(sock, msg, "🐉")
        await sock.sendMessage(jid, { image: { url: dadosDragao.foto }, caption: msgSucesso("", "Nasceu um dragão bebê!", `${dragaoAleatorio} (Bebê)\nUse pergaminhos para evoluir até a fase adulta.`) }, { quoted: msg })
      }
    },

    livrodg: {
      aliases: ["livro", "dragoes"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        if (!sistemaAtivo(db, jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑰𝑺𝑻𝑬𝑴𝑨 𝑶𝑭𝑭", "O jogo está desativado.") }, { quoted: msg }) }
        let txt = `𝑳𝑰𝑽𝑹𝑶 𝑫𝑬 𝑫𝑹𝑨𝑮𝑶̃𝑬𝑺\n\n`
        for (const [nome, info] of Object.entries(DRAGOES)) {
          txt += `${nome}\n${info.raridade} • ${info.bioma}\nHP: ${info.hp} • ATK: ${info.atk} • DEF: ${info.def}\n\n`
        }
        await reagir(sock, msg, "📖")
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    evoluirdragao: {
      aliases: ["evolve", "evoluir"],
      async executar({ sock, msg, args, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (!sistemaAtivo(db, jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑰𝑺𝑻𝑬𝑴𝑨 𝑶𝑭𝑭", "O jogo está desativado.") }, { quoted: msg }) }
        const p = prefixoAtivo || "+"
        const nomeDragao = args.join(" ").trim()
        const { user, idReal } = buscarUsuario(db, sender, msg)
        const nomeReal = Object.keys(user.dragoes).find(k => k.toLowerCase() === nomeDragao.toLowerCase())
        if (!nomeReal) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Dragão não encontrado.", `Você não tem o dragão: ${nomeDragao}.`) }, { quoted: msg }) }
        if (user.inventario.pergaminhos < 1) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑬𝑴 𝑷𝑬𝑹𝑮𝑨𝑴𝑰𝑵𝑯𝑶", "Pergaminho em falta.", `Compre com \`${p}comprardragao pergaminho\`.`) }, { quoted: msg }) }

        const d = user.dragoes[nomeReal]
        if (d.asaTita) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑱𝑨́ 𝑬́ 𝑻𝑰𝑻𝑨̃", "Evolução máxima atingida.", `${nomeReal} já é uma Asa de Titã!`) }, { quoted: msg }) }

        user.inventario.pergaminhos -= 1

        if (d.ehBebe) {
          d.ehBebe = false
          d.nome = d.nome.replace(" (Bebê)", "")
          const novoNome = d.nome
          delete user.dragoes[nomeReal]
          d.hpMax = DRAGOES[novoNome].hp
          d.hp = d.hpMax
          d.energiaMax = DRAGOES[novoNome].energia
          d.energia = d.energiaMax
          d.atk = DRAGOES[novoNome].atk
          d.def = DRAGOES[novoNome].def
          user.dragoes[novoNome] = d
          salvarDragoesUser(db, idReal, user)
          await reagir(sock, msg, "🐉")
          return sock.sendMessage(jid, { text: msgSucesso("", "Fase adulta atingida!", `${novoNome} se tornou adulto.\nEstá pronto para batalhar e voar!`) }, { quoted: msg })
        }

        if (d.nivel < 7) {
          d.nivel += 1
          d.hpMax = Math.floor(d.hpMax * 1.15); d.hp = d.hpMax
          d.energiaMax = Math.floor(d.energiaMax * 1.15); d.energia = d.energiaMax
          d.atk = Math.floor(d.atk * 1.1); d.def = Math.floor(d.def * 1.1)
          salvarDragoesUser(db, idReal, user)
          await reagir(sock, msg, "✅")
          await sock.sendMessage(jid, { text: msgSucesso("", "Nível aumentado!", `${nomeReal} subiu para o Nível ${d.nivel}!\nStatus aumentados.`) }, { quoted: msg })
        } else {
          d.tentativasTita += 1
          const chanceFinal = 5 * d.tentativasTita
          if (Math.random() * 100 < chanceFinal) {
            d.asaTita = true
            const novoNome = `${nomeReal} (Asa de Titã)`
            d.nome = novoNome
            d.hpMax = Math.floor(d.hpMax * 1.5); d.hp = d.hpMax
            d.energiaMax = Math.floor(d.energiaMax * 1.5); d.energia = d.energiaMax
            d.atk = Math.floor(d.atk * 1.3); d.def = Math.floor(d.def * 1.3)
            d.evasao += 10
            delete user.dragoes[nomeReal]
            user.dragoes[novoNome] = d
            salvarDragoesUser(db, idReal, user)
            await reagir(sock, msg, "⚡")
            await sock.sendMessage(jid, { image: { url: "https://files.catbox.moe/r91204.jpg" }, caption: msgSucesso("", "O poder ancestral despertou!", `${nomeReal} EVOLUIU PARA TITÃ!`) }, { quoted: msg })
          } else {
            salvarDragoesUser(db, idReal, user)
            await reagir(sock, msg, "❌")
            await sock.sendMessage(jid, { text: msgAviso("𝑬𝑽𝑶𝑳𝑼𝑪̧𝑨̃𝑶 𝑭𝑨𝑳𝑯𝑶𝑼", "O despertar não ocorreu.", `${nomeReal} não despertou como Asa de Titã.\nChance atual na próxima: ${Math.min(100, chanceFinal + 5)}%`) }, { quoted: msg })
          }
        }
      }
    },

    alimentardragao: {
      aliases: ["feedragon", "alimentar"],
      async executar({ sock, msg, args, db, sender }) {
        const jid = msg.key.remoteJid
        if (!sistemaAtivo(db, jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑰𝑺𝑻𝑬𝑴𝑨 𝑶𝑭𝑭", "O jogo está desativado.") }, { quoted: msg }) }
        const nomeDragao = args.join(" ").trim()
        const { user, idReal } = buscarUsuario(db, sender, msg)
        const nomeReal = Object.keys(user.dragoes).find(k => k.toLowerCase() === nomeDragao.toLowerCase())
        if (!nomeReal) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Dragão não encontrado.", `Você não tem o dragão: ${nomeDragao}.`) }, { quoted: msg }) }

        const d = user.dragoes[nomeReal]
        d.hp = Math.min(d.hpMax, d.hp + 30)
        d.energia = Math.min(d.energiaMax, d.energia + 20)
        salvarDragoesUser(db, idReal, user)

        await reagir(sock, msg, "🍖")
        await sock.sendMessage(jid, { text: msgSucesso("", "Refeição servida!", `${nomeReal}\nHP: ${d.hp}/${d.hpMax}\nEnergia: ${d.energia}/${d.energiaMax}`) }, { quoted: msg })
      }
    },

    missao: {
      aliases: ["missoes", "farmar", "treinar"],
      async executar({ sock, msg, db, sender, prefixoAtivo }) {
        const jid = msg.key.remoteJid
        if (!sistemaAtivo(db, jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑰𝑺𝑻𝑬𝑴𝑨 𝑶𝑭𝑭", "O jogo está desativado.") }, { quoted: msg }) }
        const p = prefixoAtivo || "+"
        const { user, idReal } = buscarUsuario(db, sender, msg)
        const agora = Date.now()
        const cooldown = 30 * 60 * 1000
        const ultimaMissao = user.ultimaMissao || 0
        const chaveSessao = `missao_${jid}`
        let sessao = getSessao(chaveSessao)

        if (sessao && sessao.jogador === idReal && sessao.estado === "ativa") {
          const m = MISSOES[sessao.tipoMissao]
          const { user: uAtacante } = buscarUsuario(db, sender, msg)
          const dragoes = Object.values(uAtacante.dragoes)
          if (dragoes.length === 0) { await reagir(sock, msg, "❌"); delSessao(chaveSessao); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Sem dragões para lutar.", "Você não tem dragões.") }, { quoted: msg }) }

          const dragaoEscolhido = dragoes[Math.floor(Math.random() * dragoes.length)]
          const poderJogador = dragaoEscolhido.atk + dragaoEscolhido.def + (uAtacante.nivelTreinador * 10)
          const poderInimigo = 50 + (m.nivelMin * 20)

          if (poderJogador >= poderInimigo) {
            const upou = darXp(uAtacante, m.xp)
            let dropMsg = ""
            if (Math.random() * 100 <= m.chanceDrop) {
              uAtacante.inventario.ovos[m.dropOvo] = (uAtacante.inventario.ovos[m.dropOvo] || 0) + 1
              dropMsg = `\n\n🥚 *DROP!* Você encontrou um *${m.dropOvo}*!`
            }
            uAtacante.ultimaMissao = agora
            salvarDragoesUser(db, idReal, uAtacante)
            delSessao(chaveSessao)
            await reagir(sock, msg, "🏆")
            return sock.sendMessage(jid, { text: msgSucesso("", "Missão concluída com sucesso!", `Seu dragão ${dragaoEscolhido.nome} venceu!\nXP: +${m.xp}${upou ? `\n⭐ UPOU PARA NÍVEL ${uAtacante.nivelTreinador}!` : ""}${dropMsg}`) }, { quoted: msg })
          } else {
            uAtacante.ultimaMissao = agora
            salvarDragoesUser(db, idReal, uAtacante)
            delSessao(chaveSessao)
            await reagir(sock, msg, "❌")
            return sock.sendMessage(jid, { text: msgErro("𝑫𝑬𝑹𝑹𝑶𝑻𝑨", "Seu dragão não foi forte o suficiente.", `${dragaoEscolhido.nome} foi derrotado.\nTente novamente em 30 minutos.`) }, { quoted: msg })
          }
        }

        if (agora - ultimaMissao < cooldown) {
          const falta = cooldown - (agora - ultimaMissao)
          const min = Math.floor(falta / 60000)
          const seg = Math.floor((falta % 60000) / 1000)
          await reagir(sock, msg, "⏰")
          return sock.sendMessage(jid, { text: msgAviso("𝑬𝑺𝑷𝑬𝑹𝑬", "Aguarde para nova missão.", `Suas missões renovam em ${min}min ${seg}s.`) }, { quoted: msg })
        }

        const missoesDisponiveis = Object.entries(MISSOES).filter(([_, m]) => user.nivelTreinador >= m.nivelMin)
        if (!missoesDisponiveis.length) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Nível insuficiente.", "Você ainda não tem nível para nenhuma missão.") }, { quoted: msg }) }

        const [tipoMissao, dadosMissao] = missoesDisponiveis[Math.floor(Math.random() * missoesDisponiveis.length)]
        setSessao(chaveSessao, { jogador: idReal, tipoMissao, estado: "ativa", timestamp: agora })

        await reagir(sock, msg, "📜")
        await sock.sendMessage(jid, {
          image: { url: dadosMissao.foto },
          caption: msgAviso("𝑵𝑶𝑽𝑨 𝑴𝑰𝑺𝑺𝑨̃𝑶", "Uma missão apareceu!", `${dadosMissao.nome}\nRaridade: ${dadosMissao.raridade}\nNível mínimo: ${dadosMissao.nivelMin}\n\nRecompensa: +${dadosMissao.xp} XP\n\nUse \`${p}missao\` novamente para LUTAR!`)
        }, { quoted: msg })
      }
    },

    boss: {
      aliases: ["bosses", "invadir"],
      async executar({ sock, msg, db, sender }) {
        const jid = msg.key.remoteJid
        if (!sistemaAtivo(db, jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑰𝑺𝑻𝑬𝑴𝑨 𝑶𝑭𝑭", "O jogo está desativado.") }, { quoted: msg }) }
        const { user, idReal } = buscarUsuario(db, sender, msg)
        const agora = Date.now()
        const cooldown = 30 * 60 * 1000
        const ultimoBoss = user.ultimoBoss || 0

        if (agora - ultimoBoss < cooldown) {
          const falta = cooldown - (agora - ultimoBoss)
          const min = Math.floor(falta / 60000)
          const seg = Math.floor((falta % 60000) / 1000)
          await reagir(sock, msg, "⏰")
          return sock.sendMessage(jid, { text: msgAviso("𝑬𝑺𝑷𝑬𝑹𝑬", "Bosses não estão disponíveis.", `Os chefes só aparecem em ${min}min ${seg}s.`) }, { quoted: msg })
        }

        const dragoes = Object.values(user.dragoes)
        if (dragoes.length === 0) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Sem dragões.", "Você não tem dragões para lutar contra o Boss!") }, { quoted: msg }) }

        await reagir(sock, msg, "🔥")
        await new Promise(r => setTimeout(r, 1500))

        const bossNomes = Object.keys(BOSSES)
        const bossNome = bossNomes[Math.floor(Math.random() * bossNomes.length)]
        const boss = BOSSES[bossNome]

        let txt = `𝑩𝑶𝑺𝑺 𝑬𝑵𝑪𝑶𝑵𝑻𝑹𝑨𝑫𝑶\n\n${bossNome}\nRaridade: ${boss.raridade}\nHP: ${boss.hp}\nATK: ${boss.atk}\n\n`

        dragoes.sort((a, b) => (b.atk + b.def) - (a.atk + a.def))
        const dragaoEscolhido = dragoes[0]
        txt += `Seu dragão: ${dragaoEscolhido.nome} vai lutar!\n\n`

        const poderJogador = (dragaoEscolhido.atk * 2) + dragaoEscolhido.def + (user.nivelTreinador * 15)
        const poderBoss = (boss.atk * 1.5) + boss.def
        let ganhou = poderJogador >= poderBoss || Math.random() < 0.3

        if (ganhou) {
          txt += `✅ VITÓRIA!\nSeu dragão venceu!\n`
          const upou = darXp(user, boss.xp)
          txt += `XP: +${boss.xp}${upou ? `\n⭐ UPOU PARA NÍVEL ${user.nivelTreinador}!` : ""}`
          if (Math.random() * 100 <= 10) {
            user.inventario.ovos[boss.dropOvo] = (user.inventario.ovos[boss.dropOvo] || 0) + 1
            txt += `\n\n🥚 *DROP!* Você encontrou um *${boss.dropOvo}*!`
          }
        } else {
          txt += `❌ DERROTA...\nSeu dragão foi derrotado.\nO Boss era forte demais.\nTente novamente em 30 minutos.`
        }

        user.ultimoBoss = agora
        salvarDragoesUser(db, idReal, user)
        await sock.sendMessage(jid, { image: { url: boss.foto }, caption: txt }, { quoted: msg })
      }
    },

    ruinas: {
      aliases: ["ruina", "explorar"],
      async executar({ sock, msg, db, sender }) {
        const jid = msg.key.remoteJid
        if (!sistemaAtivo(db, jid)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑰𝑺𝑻𝑬𝑴𝑨 𝑶𝑭𝑭", "O jogo está desativado.") }, { quoted: msg }) }
        const { user, idReal } = buscarUsuario(db, sender, msg)
        const agora = Date.now()
        const cooldown = 20 * 60 * 1000
        const ultimaRuina = user.ultimaRuina || 0

        if (agora - ultimaRuina < cooldown) {
          const falta = cooldown - (agora - ultimaRuina)
          const min = Math.floor(falta / 60000)
          const seg = Math.floor((falta % 60000) / 1000)
          await reagir(sock, msg, "⏰")
          return sock.sendMessage(jid, { text: msgAviso("𝑬𝑺𝑷𝑬𝑹𝑬", "As ruínas estão fechadas.", `Elas se reabrem em ${min}min ${seg}s.`) }, { quoted: msg })
        }

        const dragoes = Object.values(user.dragoes)
        if (dragoes.length === 0) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Sem dragões.", "Você não tem dragões para explorar!") }, { quoted: msg }) }

        await reagir(sock, msg, "🏚️")
        await new Promise(r => setTimeout(r, 1500))

        dragoes.sort((a, b) => b.hp - a.hp)
        const dragaoEscolhido = dragoes[0]
        let poderJogador = (dragaoEscolhido.atk * 2) + dragaoEscolhido.def + (user.nivelTreinador * 15)
        let andares = 0
        let xpTotal = 0
        let txt = `𝑹𝑼𝑰́𝑵𝑨𝑺\n\nDragão: ${dragaoEscolhido.nome}\n\nExplorando...\n\n`

        for (let i = 0; i < 5; i++) {
          const sala = SALAS_RUINA[i]
          txt += `Andar ${sala.nivel} — Inimigo (HP: ${sala.hpInimigo} • ATK: ${sala.atkInimigo})\n`
          if (poderJogador >= (sala.hpInimigo + sala.atkInimigo)) {
            andares++
            xpTotal += sala.xp
            txt += `✅ Você venceu! +${sala.xp} XP\n\n`
            poderJogador -= sala.atkInimigo
          } else {
            txt += `💀 Seu dragão foi derrotado... A ruína termina aqui.\n\n`
            break
          }
        }

        if (andares > 0) {
          const upou = darXp(user, xpTotal)
          txt += `VITÓRIA\nAndares: ${andares}/5\nXP: +${xpTotal}${upou ? `\n⭐ UPOU PARA NÍVEL ${user.nivelTreinador}!` : ""}\n`
          if (Math.random() * 100 <= 15) {
            const tipoOvo = andares >= 4 ? "Ovo Lendário" : andares >= 2 ? "Ovo Épico" : "Ovo Raro"
            user.inventario.ovos[tipoOvo] = (user.inventario.ovos[tipoOvo] || 0) + 1
            txt += `\n🥚 *DROP!* Você encontrou um *${tipoOvo}*!\n`
          }
        } else {
          txt += `Você não conseguiu passar do primeiro andar...\n`
        }

        user.ultimaRuina = agora
        salvarDragoesUser(db, idReal, user)
        await sock.sendMessage(jid, { image: { url: "https://files.catbox.moe/r47clm.jpg" }, caption: txt }, { quoted: msg })
      }
    },

    gerarkeyxp: {
      aliases: ["gerarkey", "criarxp"],
      donoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const qtd = parseInt(args[0])
        if (!qtd || qtd <= 0) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Quantidade inválida.", "Digite a quantidade de XP.\nExemplo: `+gerarkeyxp 500`") }, { quoted: msg }) }

        const dbKeys = dbLer("keysxp.json", { keys: {} })
        const novaKey = gerarKeyAleatoria()
        dbKeys.keys[novaKey] = { xp: qtd, usado: false, criadoPor: msg.key.participant || msg.key.remoteJid, criadoEm: Date.now() }
        dbSalvar("keysxp.json", dbKeys)

        await reagir(sock, msg, "🔑")
        await sock.sendMessage(jid, { text: msgSucesso("𝑲𝑬𝒀 𝑮𝑬𝑹𝑨𝑫𝑨", "Nova key de XP criada!", `Key: \`${novaKey}\`\nValor: +${qtd} XP\n\nEssa key é de uso único.`) }, { quoted: msg })
      }
    },

    keyxp: {
      aliases: ["resgatarxp", "usarkey"],
      async executar({ sock, msg, args, db, sender }) {
        const jid = msg.key.remoteJid
        const keyInserida = (args[0] || "").toUpperCase().trim()
        if (!keyInserida) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Key em falta.", "Digite a key.\nExemplo: `+keyxp KEY-XXXXXX`") }, { quoted: msg }) }

        const dbKeys = dbLer("keysxp.json", { keys: {} })
        let keyReal = null
        for (const k in dbKeys.keys) { if (k.toUpperCase() === keyInserida) { keyReal = k; break } }
        if (!keyReal || !dbKeys.keys[keyReal]) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Key inválida.", "A key digitada não existe ou está errada.") }, { quoted: msg }) }

        const dataKey = dbKeys.keys[keyReal]
        if (dataKey.usado) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Key já resgatada.", "Essa key já foi utilizada.") }, { quoted: msg }) }

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
        const barra = "🐉".repeat(Math.min(10, progresso)) + "⬛".repeat(Math.max(0, 10 - progresso))
        const pct = Math.floor((user.xpTreinador / xpNec) * 100)

        await reagir(sock, msg, "✅")
        await sock.sendMessage(jid, { text: `𝑲𝑬𝒀 𝑹𝑬𝑺𝑮𝑨𝑻𝑨𝑫𝑨\n\n+${qtdXp} XP\n\nNível: ${user.nivelTreinador} / 15\nXP: ${user.xpTreinador}/${xpNec} (${pct}%)\n${barra}\n\n${upou ? "⭐ **SUBIU DE NÍVEL!**\n" : ""}` }, { quoted: msg })
      }
    },

    gerarkeygold: {
      aliases: ["gerarkeyg", "criargold"],
      donoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const qtd = parseInt(args[0])
        if (!qtd || qtd <= 0) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Quantidade inválida.", "Digite a quantidade de Gold.\nExemplo: `+gerarkeygold 1000`") }, { quoted: msg }) }

        const dbKeys = dbLer("keysgold.json", { keys: {} })
        const novaKey = gerarKeyAleatoria()
        dbKeys.keys[novaKey] = { gold: qtd, usado: false, criadoPor: msg.key.participant || msg.key.remoteJid, criadoEm: Date.now() }
        dbSalvar("keysgold.json", dbKeys)

        await reagir(sock, msg, "🔑")
        await sock.sendMessage(jid, { text: msgSucesso("𝑲𝑬𝒀 𝑫𝑬 𝑮𝑶𝑳𝑫", "Nova key de Gold criada!", `Key: \`${novaKey}\`\nValor: +${qtd} Gold\n\nEssa key é de uso único.`) }, { quoted: msg })
      }
    },

    keygold: {
      aliases: ["resgatargold", "usarkeygold"],
      async executar({ sock, msg, args, db, sender }) {
        const jid = msg.key.remoteJid
        const keyInserida = (args[0] || "").toUpperCase().trim()
        if (!keyInserida) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Key em falta.", "Digite a key.\nExemplo: `+keygold KEY-XXXXXX`") }, { quoted: msg }) }

        const dbKeys = dbLer("keysgold.json", { keys: {} })
        let keyReal = null
        for (const k in dbKeys.keys) { if (k.toUpperCase() === keyInserida) { keyReal = k; break } }
        if (!keyReal || !dbKeys.keys[keyReal]) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Key inválida.", "A key digitada não existe ou está errada.") }, { quoted: msg }) }

        const dataKey = dbKeys.keys[keyReal]
        if (dataKey.usado) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Key já resgatada.", "Essa key já foi utilizada.") }, { quoted: msg }) }

        const { user, idReal } = buscarUsuario(db, sender, msg)
        const qtdGold = dataKey.gold
        user.gold = (user.gold || 0) + qtdGold
        salvarDragoesUser(db, idReal, user)

        dataKey.usado = true
        dataKey.usadoPor = idReal
        dataKey.usadoEm = Date.now()
        dbSalvar("keysgold.json", dbKeys)

        await reagir(sock, msg, "💰")
        await sock.sendMessage(jid, { text: `𝑲𝑬𝒀 𝑹𝑬𝑺𝑮𝑨𝑻𝑨𝑫𝑨\n\n+${qtdGold} Gold\nSaldo: ${user.gold} Gold` }, { quoted: msg })
      }
    },

    addxp: {
      aliases: ["darxp", "addxp"],
      donoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        let alvo = getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Alvo não definido.", "Marque a pessoa.\nExemplo: `+addxp @usuario 200`") }, { quoted: msg }) }

        const qtd = parseInt(args.find(a => !isNaN(a) && !a.includes("@")))
        if (!qtd || qtd <= 0) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Valor inválido.", "Digite uma quantidade válida de XP.") }, { quoted: msg }) }

        const { user, idReal } = buscarUsuario(db, alvo, msg)
        const upou = darXp(user, qtd)
        salvarDragoesUser(db, idReal, user)

        const xpNec = user.nivelTreinador * 200
        const progresso = Math.floor((user.xpTreinador / xpNec) * 10)
        const barra = "🐉".repeat(Math.min(10, progresso)) + "⬛".repeat(Math.max(0, 10 - progresso))
        const pct = Math.floor((user.xpTreinador / xpNec) * 100)

        await reagir(sock, msg, "✅")
        await sock.sendMessage(jid, { text: `𝑿𝑷 𝑨𝑫𝑰𝑪𝑰𝑶𝑵𝑨𝑫𝑶\n\nMestre enviou +${qtd} XP\nPara @${idReal.split("@")[0]}\n\nNível: ${user.nivelTreinador} / 15\nXP: ${user.xpTreinador}/${xpNec} (${pct}%)\n${barra}\n\n${upou ? "⭐ **SUBIU DE NÍVEL!**\n" : ""}`, mentions: [alvo] }, { quoted: msg })
      }
    },

    addgoldragon: {
      aliases: ["dargold", "addgold"],
      donoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        let alvo = getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Alvo não definido.", "Marque a pessoa.\nExemplo: `+addgold @usuario 100`") }, { quoted: msg }) }

        const qtd = parseInt(args.find(a => !isNaN(a) && !a.includes("@")))
        if (!qtd || qtd <= 0) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Valor inválido.", "Digite uma quantidade válida de Gold.") }, { quoted: msg }) }

        const { user, idReal } = buscarUsuario(db, alvo, msg)
        user.gold = (user.gold || 0) + qtd
        salvarDragoesUser(db, idReal, user)

        await reagir(sock, msg, "💰")
        await sock.sendMessage(jid, { text: msgSucesso("", "Ouro enviado com sucesso!", `Mestre enviou ${qtd} Gold para @${idReal.split("@")[0]}!\nSaldo atual: ${user.gold}`), mentions: [alvo] }, { quoted: msg })
      }
    },

    spawndragao: {
      aliases: ["forcardragao", "spawn"],
      donoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
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
        if (!candidatos.length) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Raridade inválida.", `Raridade ${raridadeArg} não encontrada.\nUse: comum, raro, epico, lendario ou mitico.`) }, { quoted: msg }) }

        const [nome, dados] = candidatos[Math.floor(Math.random() * candidatos.length)]
        const dragao = { nome, ...dados }

        const sessaoAtual = getSessao(jid)
        if (sessaoAtual && sessaoAtual.dragao && Date.now() - sessaoAtual.timestamp < 60000) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑨𝑽𝑰𝑺𝑶", "Já tem um dragão no grupo.", "Espere ele fugir ou ser domado.") }, { quoted: msg }) }

        setSessao(jid, { dragao, timestamp: Date.now() })
        const emojiRaridade = { "Comum": "🟢", "Raro": "🔵", "Épico": "🟣", "Lendário": "🟡", "Mítico": "🔴" }[dragao.raridade] || "🌸"

        const texto = `𝑫𝑹𝑨𝑮𝑨̃𝑶 𝑨𝑷𝑨𝑹𝑬𝑪𝑬𝑼\n\n${emojiRaridade} ${dragao.nome}\nRaridade: ${dragao.raridade}\n\nVocês têm 1 minuto pra domar!\nUse: \`+domar ${dragao.nome}\``

        await reagir(sock, msg, "🐉")
        try { await sock.sendMessage(jid, { image: { url: dragao.foto }, caption: texto }, { quoted: msg }) }
        catch (e) { await sock.sendMessage(jid, { text: texto }, { quoted: msg }) }

        setTimeout(() => {
          const s = getSessao(jid)
          if (s && s.dragao && Date.now() - s.timestamp >= 55000) {
            delSessao(jid)
            sock.sendMessage(jid, { text: msgAviso("𝑭𝑼𝑮𝑰𝑼", "O dragão foi embora.", `O ${dragao.nome} fugiu... ninguém o domou a tempo.`) }).catch(() => {})
          }
        }, 60000)
      }
    }

  }
}