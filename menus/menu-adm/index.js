/* ============================================================
   💧❄️🧊 MENU ADM - RIMURU BOT MD
   ============================================================ */

const fs = require("fs")
const path = require("path")
const crypto = require("crypto")

const DATA_DIR = path.join(__dirname, "..", "..", "data")

function dbLer(a, p = {}) {
  const f = path.join(DATA_DIR, a)
  if (!fs.existsSync(f)) { fs.writeFileSync(f, JSON.stringify(p, null, 2)); return p }
  try { return JSON.parse(fs.readFileSync(f, "utf8")) } catch { return p }
}
function dbSalvar(a, d) { fs.writeFileSync(path.join(DATA_DIR, a), JSON.stringify(d, null, 2)) }
function hashFigurinha(buffer) { return crypto.createHash("md5").update(buffer).digest("hex") }

async function reagir(sock, msg, emoji) {
  try { await sock.sendMessage(msg.key.remoteJid, { react: { text: emoji, key: msg.key } }) } catch (_) {}
}

function msgSucesso(titulo, aviso, detalhes, rodape, nomeBot) {
  return `💧 • ${titulo} •\n\n❄️ ${aviso}\n\n🧊 ${detalhes}\n\n${rodape ? rodape + "\n\n" : ""}"${nomeBot}"`
}
function msgAviso(titulo, aviso, detalhes, rodape, nomeBot) {
  return `💧 • ${titulo} •\n\n❄️ ${aviso}\n\n🧊 ${detalhes}\n\n${rodape ? rodape + "\n\n" : ""}"${nomeBot}"`
}
function msgErro(titulo, aviso, detalhes, rodape, nomeBot) {
  return `💧 • ${titulo} •\n\n❄️ ${aviso}\n\n🧊 ${detalhes}\n\n${rodape ? rodape + "\n\n" : ""}"${nomeBot}"`
}
function lineEmoji(emoji, label, valor) { return `${emoji} ${label}:\n╰➜ ${valor}` }
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
function secao(titulo) { return `┏✰ *${titulo}*ׅ\n┗┉━─━┈━──━┈━──━┈━─━┉┉⟐` }
function item(cmd) { return `🧊 ${cmd}` }

function detectarCargo({ sender, config, db, groupMetadata, isDono, isSubDono, isAdmin }) {
  const num = String(sender || "").split("@")[0].split(":")[0].replace(/\D/g, "")
  const donos = (Array.isArray(config?.dono) ? config.dono : [config?.dono]).map(n => String(n).split("@")[0].split(":")[0].replace(/\D/g, "")).filter(Boolean)
  if (isDono || donos.includes(num)) return "👑 𝐆𝐑𝐀𝐍𝐃𝐄 𝐒𝐀́𝐁𝐈𝐎"
  try {
    const subs = (db.config?.().subdonos || []).map(n => String(n).split("@")[0].split(":")[0].replace(/\D/g, ""))
    if (isSubDono || subs.includes(num)) return "💠 𝐋𝐔𝐀 𝐒𝐔𝐏𝐄𝐑𝐈𝐎𝐑"
  } catch (_) {}
  try {
    const vips = (db.vips?.() || {}).vips || {}
    for (const [j, info] of Object.entries(vips)) {
      const jn = String(j).split("@")[0].split(":")[0].replace(/\D/g, "")
      if (jn === num && (info.expira === "inf" || info.expira > Date.now())) return "❄️ 𝐍𝐎𝐁𝐑𝐄 𝐀𝐋𝐈𝐀𝐃𝐎"
    }
  } catch (_) {}
  if (isAdmin) return "⚔️ 𝐂𝐎𝐌𝐀𝐍𝐃𝐀𝐍𝐓𝐄"
  try {
    const subsAdm = (db.subadmins?.() || {})[groupMetadata?.id] || []
    if (subsAdm.some(s => String(s).split("@")[0].split(":")[0].replace(/\D/g, "") === num)) return "🛡️ 𝐆𝐔𝐀𝐑𝐃𝐀 𝐑𝐄𝐀𝐋"
  } catch (_) {}
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

module.exports = {
  menu: "menu-adm",
  grupoOnly: false,
  adminOnly: false,
  donoOnly: false,

  commands: {
    menu: {
      aliases: ["menus", "ajuda", "help", "menuadm"],
      async executar({ sock, msg, prefixoAtivo, db, sender, config, isDono, isSubDono, isAdmin, groupMetadata }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "!"
        const cfg = db.config() || {}
        const { pushName, nomeDono, cargo, nomeBot } = getCargoETexto({ sender, config, db, groupMetadata, isDono, isSubDono, isAdmin, msg })
        const h = new Date().getHours()
        let saudacao = "Boa noite"; if (h >= 5 && h < 12) saudacao = "Bom dia"; else if (h >= 12 && h < 18) saudacao = "Boa tarde"
        const mentions = sender ? [sender] : []
        await reagir(sock, msg, "💧")
        const texto = `${cardPerfil({ nomeBot, nomeUsuario: pushName, cargo, dono: nomeDono })}

💧 *${saudacao}, ${pushName}!*
❄️ Prefixo: \`${p}\`
🧊 \`${p}menuadmin\` • \`${p}menuvip\` • \`${p}menudono\`
🧊 \`${p}menurpg\` • \`${p}menufazenda\` • \`${p}menufnaf\` • \`${p}menucidade\`

_"O Grande Sábio observa."_

"${nomeBot}"`
        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          try {
            if (cfg.tipoMenu === "video") await sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "rimuru.mp4", gifPlayback: true, caption: texto, mentions }, { quoted: msg })
            else await sock.sendMessage(jid, { image: buf, caption: texto, mentions }, { quoted: msg })
          } catch (e) { await sock.sendMessage(jid, { text: texto, mentions }, { quoted: msg }) }
        } else await sock.sendMessage(jid, { text: texto, mentions }, { quoted: msg })
      }
    },

    ping: {
      aliases: ["pong", "latencia", "pingar"],
      async executar({ sock, msg, sender, utils, db }) {
        const jid = msg.key.remoteJid; const t1 = Date.now(); const num = utils.soNumero(sender); const nomeBot = nomeBotDb(db)
        await reagir(sock, msg, "💧")
        const sent = await sock.sendMessage(jid, { text: "💧 • 𝐌𝐄𝐃𝐈𝐍𝐃𝐎 •\n\n❄️ O Grande Sábio calcula...\n🧊 [░░░░░░░░░░] 0%" }, { quoted: msg })
        const etapas = [{ espera: 400, pct: 25 }, { espera: 400, pct: 50 }, { espera: 400, pct: 75 }, { espera: 400, pct: 100 }]
        for (const et of etapas) { await new Promise(r => setTimeout(r, et.espera)); const cheios = Math.floor(et.pct / 10); const barra = "💧".repeat(cheios) + "⬛".repeat(10 - cheios); try { await sock.sendMessage(jid, { text: "💧 • 𝐌𝐄𝐃𝐈𝐍𝐃𝐎 •\n\n❄️ Calculando...\n🧊 [" + barra + "] " + et.pct + "%", edit: sent.key }) } catch (_) {} }
        const t2 = Date.now(); let pingReal = 0; try { await sock.groupMetadata(jid); pingReal = Date.now() - t2 } catch (_) { pingReal = Date.now() - t2 }; const pingTotal = Date.now() - t1
        let qual = "PERFEITO", emoji = "💧"
        if (pingReal > 100) { qual = "Excelente"; emoji = "❄️" }
        if (pingReal > 200) { qual = "Bom"; emoji = "🧊" }
        if (pingReal > 350) { qual = "Aceitável"; emoji = "🌘" }
        if (pingReal > 500) { qual = "Ruim"; emoji = "🌑" }
        if (pingReal > 800) { qual = "Péssimo"; emoji = "💀" }
        if (pingReal > 1500) { qual = "MORTO"; emoji = "☠️" }
        await sock.sendMessage(jid, { text: `💧 • 𝐋𝐀𝐓𝐄̂𝐍𝐂𝐈𝐀 •\n\n❄️ ${qual}\n\n🧊 Ping: ${pingReal}ms\n🧊 Proc: ${pingTotal}ms\n🧊 User: @${num}\n\n${emoji} _ONLINE ✅_\n\n"${nomeBot}"`, mentions: [sender], edit: sent.key })
      }
    },

    totalcmd: {
      aliases: ["totalcomandos", "quantoscmd", "cmdcount"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const total = global.totalComandos || 0; const totalAliases = global.totalAliases || 0; const porCategoria = global.comandosPorCategoria || {}; let listaCat = ""
        for (const [cat, qtd] of Object.entries(porCategoria)) listaCat += `🧊 ${cat}: *${qtd}*\n`
        const nomeBot = nomeBotDb(db)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐓𝐎𝐓𝐀𝐋 •\n\n❄️ Estatísticas do bot\n\n🧊 Comandos: ${total}\n🧊 Aliases: ${totalAliases}\n🧊 Total: ${total + totalAliases}\n\n🧊 Por categoria:\n${listaCat || "🧊 _nenhuma_"}\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    menuadmin: {
      aliases: ["menu-adm", "menua", "adm", "comandosadm"],
      async executar({ sock, msg, prefixoAtivo, db, sender, config, isDono, isSubDono, isAdmin, groupMetadata }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "!"; const cfg = db.config() || {}
        const { pushName, nomeDono, cargo, nomeBot } = getCargoETexto({ sender, config, db, groupMetadata, isDono, isSubDono, isAdmin, msg })
        await reagir(sock, msg, "❄️")
        const texto = `${cardPerfil({ nomeBot, nomeUsuario: pushName, cargo, dono: nomeDono })}

${secao("⚔️ ᴀᴅᴍɪɴ")}
${item("!adv / !deladv / !listaadv")}
${item("!promover / !rebaixar / !ban")}
${item("!mute / !desmute")}
${item("!p (reply) / !totag <txt>")}
${item("!abrir / !fechar / !link")}
${item("!namegp / !descricao")}
${item("!soadm on/off")}

${secao("🛡️ ᴘʀᴏᴛᴇᴄ̧ᴏ̃ᴇs")}
${item("!antilink / !antiaudio / !antivideo")}
${item("!antifoto / !antifig")}
${item("!palavrao on/off")}
${item("!addpalavra / !rmpalavra / !listapalavra")}

${secao("👑 sᴜʙ-ᴀᴅᴍ")}
${item("!subadm / !delsubadm / !listasubadm")}

${secao("⚙️ ᴘʀᴇғɪxᴏ")}
${item("!multiprefixo on/off")}
${item("!setprefixo <novo>")}

${secao("🕵️ x𝟵 / ᴘᴀʀᴄᴇʀɪᴀ")}
${item("!x9 on/off")}
${item("!modoparceria on/off")}
${item("!addparceria / !rmparceria / !parcerias")}

${secao("🚫 ʟɪsᴛᴀ ɴᴇɢʀᴀ")}
${item("!listanegra <núm>")}
${item("!blacklist / !dellista <núm>")}

${secao("👋 ʙᴇᴍ-ᴠɪɴᴅᴏ")}
${item("!bemvindo on/off")}
${item("!textobv <txt> / !fundoBV (reply)")}
${item("!legendasaiu <txt> / !fundoSaiu (reply)")}

${secao("⏰ ᴀɢᴇɴᴅᴀᴍᴇɴᴛᴏ")}
${item("!abrirgp / !fechargp hh:mm")}
${item("!fotoabrir / !fotofechar (reply)")}
${item("!legendaabrir / !legendafechar <txt>")}
${item("!limparfotos")}

${secao("🤖 ɪᴀ / sᴏʀᴛᴇɪᴏ")}
${item("!iaon / !iaoff")}
${item("!sorteio <prêmio> <tempo>")}

${secao("🎴 ғɪɢ ᴄᴏᴍᴀɴᴅᴏ")}
${item("!rgfig <cmd> (reply)")}
${item("!rmfig (reply) / !listafig")}

💧 Prefixo: \`${p}\`

"${nomeBot}"`
        if (cfg.fotoMenu) { const buf = Buffer.from(cfg.fotoMenu, "base64"); if (cfg.tipoMenu === "video") return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "rimuru.mp4", gifPlayback: true, caption: texto }, { quoted: msg }); return sock.sendMessage(jid, { image: buf, caption: texto }, { quoted: msg }) }
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    prefixo: {
      aliases: ["prefix", "prefixoatual", "qualprefixo"],
      async executar({ sock, msg, prefixoAtivo, db }) {
        const jid = msg.key.remoteJid; const cfg = db.config(); const padrao = cfg.prefixoGlobal || "!"; const grupoConf = db.grupos()[jid] || {}; const nomeBot = nomeBotDb(db)
        let multiStatus = grupoConf.multiprefixo ? "ON ✅" : "OFF ❌"; let prefixoGrupo = grupoConf.prefixo || padrao
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐏𝐑𝐄𝐅𝐈𝐗𝐎 •\n\n❄️ Configuração\n\n🧊 Padrão: ${padrao}\n🧊 Ativo: ${prefixoAtivo}\n🧊 Multiprefixo: ${multiStatus}\n🧊 Grupo: ${prefixoGrupo}\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    p: {
      aliases: ["apagar", "delmsg"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo
        if (!ctx || !ctx.stanzaId) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐏𝐀𝐆𝐀𝐑", "Responda uma mensagem.", "Use `!p` reply", null, nomeBot) }, { quoted: msg }) }
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "Promova o bot", null, nomeBot) }, { quoted: msg }) }
        try { await sock.sendMessage(jid, { delete: { remoteJid: jid, fromMe: false, id: ctx.stanzaId, participant: ctx.participant || (ctx.mentionedJid && ctx.mentionedJid[0]) } }); await reagir(sock, msg, "💧"); await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐏𝐀𝐆𝐀𝐃𝐀", "Mensagem removida.", "❄️ Concluído", null, nomeBot) }, { quoted: msg }) } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: "💧 " + e.message }, { quoted: msg }) }
      }
    },

    abrir: {
      aliases: ["opennow"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "Promova o bot", null, nomeBot) }, { quoted: msg }) }
        try { await sock.groupSettingUpdate(jid, "not_announcement"); await reagir(sock, msg, "💧"); await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐁𝐄𝐑𝐓𝐎", "Grupo aberto.", "❄️ Todos podem falar", null, nomeBot) }, { quoted: msg }) } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: "💧 " + e.message }, { quoted: msg }) }
      }
    },

    fechar: {
      aliases: ["closenow"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "Promova o bot", null, nomeBot) }, { quoted: msg }) }
        try { await sock.groupSettingUpdate(jid, "announcement"); await reagir(sock, msg, "💧"); await sock.sendMessage(jid, { text: msgSucesso("𝐅𝐄𝐂𝐇𝐀𝐃𝐎", "Grupo fechado.", "❄️ Só admins falam", null, nomeBot) }, { quoted: msg }) } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: "💧 " + e.message }, { quoted: msg }) }
      }
    },

    namegp: {
      aliases: ["setnomegp", "nomegrupo"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, groupMetadata, utils, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const nome = args.join(" ").trim()
        if (!nome) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐍𝐎𝐌𝐄", "Informe o nome.", "`!namegp <nome>`", null, nomeBot) }, { quoted: msg }) }
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "Promova o bot", null, nomeBot) }, { quoted: msg }) }
        try { await sock.groupUpdateSubject(jid, nome); await reagir(sock, msg, "💧"); await sock.sendMessage(jid, { text: msgSucesso("𝐍𝐎𝐌𝐄", "Nome alterado.", `❄️ ${nome}`, null, nomeBot) }, { quoted: msg }) } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: "💧 " + e.message }, { quoted: msg }) }
      }
    },

    descricao: {
      aliases: ["setdescricao", "descgp"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, groupMetadata, utils, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const desc = args.join(" ").trim()
        if (!desc) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐃𝐄𝐒𝐂𝐑𝐈𝐂̧𝐀̃𝐎", "Informe o texto.", "`!descricao <texto>`", null, nomeBot) }, { quoted: msg }) }
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "Promova o bot", null, nomeBot) }, { quoted: msg }) }
        try { await sock.groupUpdateDescription(jid, desc); await reagir(sock, msg, "💧"); await sock.sendMessage(jid, { text: msgSucesso("𝐃𝐄𝐒𝐂𝐑𝐈𝐂̧𝐀̃𝐎", "Descrição alterada.", "❄️ Texto salvo", null, nomeBot) }, { quoted: msg }) } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: "💧 " + e.message }, { quoted: msg }) }
      }
    },

    link: {
      aliases: ["linkgp"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "Promova o bot", null, nomeBot) }, { quoted: msg }) }
        try { const code = await sock.groupInviteCode(jid); await reagir(sock, msg, "💧"); await sock.sendMessage(jid, { text: msgSucesso("𝐋𝐈𝐍𝐊", "Link gerado.", `❄️ https://chat.whatsapp.com/${code}`, null, nomeBot) }, { quoted: msg }) } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: "💧 " + e.message }, { quoted: msg }) }
      }
    },

    mute: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const alvo = utils.getAlvo(msg); const nomeBot = nomeBotDb(db)
        if (!alvo) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐌𝐔𝐓𝐄", "Marque alguém.", "`!mute @user`", null, nomeBot) }, { quoted: msg }) }
        const mutados = db.mutados(); mutados[jid] = mutados[jid] || {}; mutados[jid][alvo] = Date.now() + 5 * 60 * 1000; db.salvarMutados(mutados)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐌𝐔𝐓𝐀𝐃𝐎", "Usuário silenciado por 5min.", `❄️ @${utils.soNumero(alvo)}`, null, nomeBot), mentions: [alvo] }, { quoted: msg })
      }
    },

    desmute: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const alvo = utils.getAlvo(msg); const nomeBot = nomeBotDb(db)
        if (!alvo) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐃𝐄𝐒𝐌𝐔𝐓𝐄", "Marque alguém.", "`!desmute @user`", null, nomeBot) }, { quoted: msg }) }
        const mutados = db.mutados(); if (mutados[jid] && mutados[jid][alvo]) { delete mutados[jid][alvo]; db.salvarMutados(mutados) }
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐋𝐈𝐁𝐄𝐑𝐀𝐃𝐎", "Usuário pode falar.", `❄️ @${utils.soNumero(alvo)}`, null, nomeBot), mentions: [alvo] }, { quoted: msg })
      }
    },

    palavrao: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐏𝐀𝐋𝐀𝐕𝐑𝐀̃𝐎", "Use on/off.", "`!palavrao on/off`", null, nomeBot) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].palavrao = opcao === "on"; db.salvarGrupos(g)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐀𝐋𝐀𝐕𝐑𝐀̃𝐎", "Filtro configurado.", `❄️ ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
      }
    },

    addpalavra: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const palavra = args.join(" ").trim().toLowerCase()
        if (!palavra) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐃𝐈𝐂𝐈𝐎𝐍𝐀𝐑", "Informe a palavra.", "`!addpalavra <p>`", null, nomeBot) }, { quoted: msg }) }
        const p = db.palavroes(); p[jid] = p[jid] || []
        if (p[jid].includes(palavra)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐉𝐀́ 𝐄𝐗𝐈𝐒𝐓𝐄", "Palavra na lista.", `❄️ ${palavra}`, null, nomeBot) }, { quoted: msg }) }
        p[jid].push(palavra); db.salvarPalavroes(p)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐃𝐈𝐂𝐈𝐎𝐍𝐀𝐃𝐀", "Palavra proibida.", `❄️ ${palavra}`, null, nomeBot) }, { quoted: msg })
      }
    },

    rmpalavra: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const palavra = args.join(" ").trim().toLowerCase()
        if (!palavra) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐄𝐌𝐎𝐕𝐄𝐑", "Informe a palavra.", "`!rmpalavra <p>`", null, nomeBot) }, { quoted: msg }) }
        const p = db.palavroes(); const arr = p[jid] || []; const idx = arr.indexOf(palavra)
        if (idx === -1) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐀", "Palavra fora da lista.", `❄️ ${palavra}`, null, nomeBot) }, { quoted: msg }) }
        arr.splice(idx, 1); p[jid] = arr; db.salvarPalavroes(p)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐀", "Palavra liberada.", `❄️ ${palavra}`, null, nomeBot) }, { quoted: msg })
      }
    },

    listapalavra: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const lista = db.palavroes()[jid] || []
        if (!lista.length) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐒𝐓𝐀 𝐕𝐀𝐙𝐈𝐀", "Nenhuma palavra.", "Use `!addpalavra`", null, nomeBot) }, { quoted: msg }) }
        let t = "💧 • 𝐏𝐀𝐋𝐀𝐕𝐑𝐀𝐒 •\n\n❄️ Lista:\n\n"; lista.forEach((p, i) => { t += `🧊 ${i + 1}. \`${p}\`\n` }); t += `\n🧊 Total: ${lista.length}\n\n"${nomeBot}"`
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: t }, { quoted: msg })
      }
    },

    antilink: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐍𝐓𝐈𝐋𝐈𝐍𝐊", "Use on/off.", "`!antilink on/off`", null, nomeBot) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].antilink = opcao === "on"; db.salvarGrupos(g)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐍𝐓𝐈𝐋𝐈𝐍𝐊", "Proteção atualizada.", `❄️ ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
      }
    },

    antiaudio: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐍𝐓𝐈𝐀́𝐔𝐃𝐈𝐎", "Use on/off.", "`!antiaudio on/off`", null, nomeBot) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].antiaudio = opcao === "on"; db.salvarGrupos(g)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐍𝐓𝐈𝐀́𝐔𝐃𝐈𝐎", "Proteção atualizada.", `❄️ ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
      }
    },

    antivideo: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐍𝐓𝐈𝐕𝐈́𝐃𝐄𝐎", "Use on/off.", "`!antivideo on/off`", null, nomeBot) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].antivideo = opcao === "on"; db.salvarGrupos(g)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐍𝐓𝐈𝐕𝐈́𝐃𝐄𝐎", "Proteção atualizada.", `❄️ ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
      }
    },

    antifoto: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐍𝐓𝐈𝐅𝐎𝐓𝐎", "Use on/off.", "`!antifoto on/off`", null, nomeBot) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].antifoto = opcao === "on"; db.salvarGrupos(g)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐍𝐓𝐈𝐅𝐎𝐓𝐎", "Proteção atualizada.", `❄️ ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
      }
    },

    antifig: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐍𝐓𝐈𝐅𝐈𝐆", "Use on/off.", "`!antifig on/off`", null, nomeBot) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].antifig = opcao === "on"; db.salvarGrupos(g)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐍𝐓𝐈𝐅𝐈𝐆", "Proteção atualizada.", `❄️ ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
      }
    },

    promover: {
      aliases: ["promote", "daradm"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const alvoRaw = utils.getAlvo(msg)
        if (!alvoRaw) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐏𝐑𝐎𝐌𝐎𝐕𝐄𝐑", "Marque alguém.", "`!promover @user`", null, nomeBot) }, { quoted: msg }) }
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "Promova o bot", null, nomeBot) }, { quoted: msg }) }
        const n = utils.soNumero(alvoRaw); const part = groupMetadata.participants.find(p => [p.id, p.lid, p.phoneNumber].filter(Boolean).map(utils.soNumero).includes(n))
        if (!part) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎", "Usuário fora do grupo.", `@${n}`, null, nomeBot) }, { quoted: msg }) }
        try { await sock.groupParticipantsUpdate(jid, [part.id], "promote"); await reagir(sock, msg, "💧"); await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐑𝐎𝐌𝐎𝐕𝐈𝐃𝐎", "Virou admin.", `❄️ @${n}`, null, nomeBot), mentions: [part.id] }, { quoted: msg }) } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: "💧 " + e.message }, { quoted: msg }) }
      }
    },

    rebaixar: {
      aliases: ["demote", "tiraradm"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const alvoRaw = utils.getAlvo(msg)
        if (!alvoRaw) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐄𝐁𝐀𝐈𝐗𝐀𝐑", "Marque alguém.", "`!rebaixar @user`", null, nomeBot) }, { quoted: msg }) }
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "Promova o bot", null, nomeBot) }, { quoted: msg }) }
        const n = utils.soNumero(alvoRaw); const part = groupMetadata.participants.find(p => [p.id, p.lid, p.phoneNumber].filter(Boolean).map(utils.soNumero).includes(n))
        if (!part) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎", "Usuário fora do grupo.", `@${n}`, null, nomeBot) }, { quoted: msg }) }
        try { await sock.groupParticipantsUpdate(jid, [part.id], "demote"); await reagir(sock, msg, "💧"); await sock.sendMessage(jid, { text: msgSucesso("𝐑𝐄𝐁𝐀𝐈𝐗𝐀𝐃𝐎", "Perdeu admin.", `❄️ @${n}`, null, nomeBot), mentions: [part.id] }, { quoted: msg }) } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: "💧 " + e.message }, { quoted: msg }) }
      }
    },

    ban: {
      aliases: ["kick", "remover"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const alvoRaw = utils.getAlvo(msg)
        if (!alvoRaw) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐁𝐀𝐍𝐈𝐑", "Marque alguém.", "`!ban @user`", null, nomeBot) }, { quoted: msg }) }
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "Promova o bot", null, nomeBot) }, { quoted: msg }) }
        const n = utils.soNumero(alvoRaw); const part = groupMetadata.participants.find(p => [p.id, p.lid, p.phoneNumber].filter(Boolean).map(utils.soNumero).includes(n))
        if (!part) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎", "Usuário fora do grupo.", `@${n}`, null, nomeBot) }, { quoted: msg }) }
        try { await sock.groupParticipantsUpdate(jid, [part.id], "remove"); await reagir(sock, msg, "💧"); await sock.sendMessage(jid, { text: msgSucesso("𝐄𝐗𝐏𝐔𝐋𝐒𝐎", "Usuário removido.", `❄️ @${n}`, null, nomeBot), mentions: [part.id] }, { quoted: msg }) } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: "💧 " + e.message }, { quoted: msg }) }
      }
    },

    adv: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const alvo = utils.getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐃𝐕𝐄𝐑𝐓𝐈𝐑", "Marque alguém.", "`!adv @user <motivo>`", null, nomeBot) }, { quoted: msg }) }
        const motivo = args.filter(a => !a.includes("@")).join(" ") || "Sem motivo"
        const advs = db.advs(); advs[jid] = advs[jid] || {}; advs[jid][alvo] = (advs[jid][alvo] || 0) + 1; const total = advs[jid][alvo]; const n = utils.soNumero(alvo)
        if (total >= 3) {
          delete advs[jid][alvo]; db.salvarAdvs(advs)
          await reagir(sock, msg, "💧")
          await sock.sendMessage(jid, { text: msgErro("𝐋𝐈𝐌𝐈𝐓𝐄", "3/3 atingido. Removido.", `❄️ @${n} • ${motivo}`, null, nomeBot), mentions: [alvo] }, { quoted: msg })
          try { await sock.groupParticipantsUpdate(jid, [alvo], "remove") } catch (_) {}
          return
        }
        db.salvarAdvs(advs); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgAviso("𝐀𝐃𝐕𝐄𝐑𝐓𝐈𝐃𝐎", "Advertência aplicada.", `❄️ @${n} • ${total}/3`, null, nomeBot), mentions: [alvo] }, { quoted: msg })
      }
    },

    deladv: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const alvo = utils.getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐄𝐌𝐎𝐕𝐄𝐑 𝐀𝐃𝐕", "Marque alguém.", "`!deladv @user`", null, nomeBot) }, { quoted: msg }) }
        const advs = db.advs(); const atual = (advs[jid] && advs[jid][alvo]) || 0
        if (atual <= 0) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgSucesso("𝐅𝐈𝐂𝐇𝐀 𝐋𝐈𝐌𝐏𝐀", "Sem advertências.", `❄️ @${utils.soNumero(alvo)}`, null, nomeBot), mentions: [alvo] }, { quoted: msg }) }
        advs[jid][alvo] = atual - 1; if (advs[jid][alvo] === 0) delete advs[jid][alvo]; db.salvarAdvs(advs)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐃𝐕 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐀", "Advertência removida.", `❄️ @${utils.soNumero(alvo)} • ${(advs[jid] && advs[jid][alvo]) || 0}/3`, null, nomeBot), mentions: [alvo] }, { quoted: msg })
      }
    },

    listaadv: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const entradas = Object.entries(db.advs()[jid] || {})
        if (!entradas.length) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐒𝐓𝐀 𝐕𝐀𝐙𝐈𝐀", "Sem advertências.", "Use `!adv`", null, nomeBot) }, { quoted: msg }) }
        entradas.sort((a, b) => b[1] - a[1]); let t = "💧 • 𝐀𝐃𝐕𝐄𝐑𝐓𝐄̂𝐍𝐂𝐈𝐀𝐒 •\n\n❄️ Lista:\n\n"
        entradas.forEach(([j, q], i) => { t += `🧊 ${i + 1}. @${utils.soNumero(j)} — ${q}/3\n` }); t += `\n🧊 Total: ${entradas.length}\n\n"${nomeBot}"`
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: t, mentions: entradas.map(e => e[0]) }, { quoted: msg })
      }
    },

    totag: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, groupMetadata }) {
        const jid = msg.key.remoteJid; let texto = args.join(" ").trim()
        if (!texto) { const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const q = ctx.quotedMessage; if (q) texto = q.conversation || (q.extendedTextMessage && q.extendedTextMessage.text) || (q.imageMessage && q.imageMessage.caption) || "" }
        if (!texto) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: "💧 `!totag <texto>`" }, { quoted: msg }) }
        const mentions = groupMetadata.participants.map(p => p.id); await reagir(sock, msg, "💧"); await sock.sendMessage(jid, { text: texto, mentions }, { quoted: msg })
      }
    },

    subadm: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const alvo = utils.getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐒𝐔𝐁-𝐀𝐃𝐌", "Marque alguém.", "`!subadm @user`", null, nomeBot) }, { quoted: msg }) }
        const subs = db.subadmins(); subs[jid] = subs[jid] || []
        if (subs[jid].some(s => utils.soNumero(s) === utils.soNumero(alvo))) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐉𝐀́ 𝐄́", "Já é Sub-Adm.", `❄️ @${utils.soNumero(alvo)}`, null, nomeBot) }, { quoted: msg }) }
        subs[jid].push(alvo); db.salvarSubadmins(subs); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐒𝐔𝐁-𝐀𝐃𝐌", "Virou Sub-Adm.", `❄️ @${utils.soNumero(alvo)}`, null, nomeBot), mentions: [alvo] }, { quoted: msg })
      }
    },

    delsubadm: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const alvo = utils.getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐄𝐌𝐎𝐕𝐄𝐑", "Marque alguém.", "`!delsubadm @user`", null, nomeBot) }, { quoted: msg }) }
        const subs = db.subadmins(); subs[jid] = (subs[jid] || []).filter(s => utils.soNumero(s) !== utils.soNumero(alvo)); db.salvarSubadmins(subs); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐎", "Não é mais Sub-Adm.", `❄️ @${utils.soNumero(alvo)}`, null, nomeBot), mentions: [alvo] }, { quoted: msg })
      }
    },

    listasubadm: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const subs = db.subadmins()[jid] || []
        if (!subs.length) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐒𝐓𝐀 𝐕𝐀𝐙𝐈𝐀", "Sem Sub-Admins.", "Use `!subadm`", null, nomeBot) }, { quoted: msg }) }
        let t = "💧 • 𝐒𝐔𝐁-𝐀𝐃𝐌𝐈𝐍𝐒 •\n\n❄️ Lista:\n\n"; subs.forEach((s, i) => { t += `🧊 ${i + 1}. @${utils.soNumero(s)}\n` }); t += `\n🧊 Total: ${subs.length}\n\n"${nomeBot}"`
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: t, mentions: subs }, { quoted: msg })
      }
    },

    soadm: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐒𝐎 𝐀𝐃𝐌", "Use on/off.", "`!soadm on/off`", null, nomeBot) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].soadm = opcao === "on"; db.salvarGrupos(g); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐒𝐎 𝐀𝐃𝐌", "Configurado.", `❄️ ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
      }
    },

    multiprefixo: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐌𝐔𝐋𝐓𝐈𝐏𝐑𝐄𝐅𝐈𝐗𝐎", "Use on/off.", "`!multiprefixo on/off`", null, nomeBot) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].multiprefixo = opcao === "on"; db.salvarGrupos(g); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐌𝐔𝐋𝐓𝐈𝐏𝐑𝐄𝐅𝐈𝐗𝐎", "Configurado.", `❄️ ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
      }
    },

    setprefixo: {
      aliases: ["setprefix", "trocarp"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const g = db.grupos(); const conf = g[jid] || {}
        if (!conf.multiprefixo) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐌𝐔𝐋𝐓𝐈𝐏𝐑𝐄𝐅𝐈𝐗𝐎 𝐎𝐅𝐅", "Ative primeiro.", "`!multiprefixo on`", null, nomeBot) }, { quoted: msg }) }
        const novo = args[0]
        if (!novo) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐒𝐄𝐓𝐏𝐑𝐄𝐅𝐈𝐗𝐎", "Informe o prefixo.", "`!setprefixo <s>`", null, nomeBot) }, { quoted: msg }) }
        if (novo.length > 3) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐋𝐎𝐍𝐆𝐎", "Máximo 3 caracteres.", `❄️ ${novo}`, null, nomeBot) }, { quoted: msg }) }
        g[jid].prefixo = novo; db.salvarGrupos(g); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐑𝐄𝐅𝐈𝐗𝐎", "Alterado.", `❄️ \`${novo}\``, null, nomeBot) }, { quoted: msg })
      }
    },

    x9: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐗𝟗", "Use on/off.", "`!x9 on/off`", null, nomeBot) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].x9 = opcao === "on"; db.salvarGrupos(g); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐗𝟗", "Espionagem configurada.", `❄️ ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
      }
    },

    listanegra: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, groupMetadata, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const numero = (args[0] || "").replace(/\D/g, "")
        if (!numero || numero.length < 8) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐒𝐓𝐀 𝐍𝐄𝐆𝐑𝐀", "Informe o número.", "`!listanegra <núm>`", null, nomeBot) }, { quoted: msg }) }
        const lista = db.listanegra(); lista[jid] = lista[jid] || []
        if (lista[jid].includes(numero)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐉𝐀́ 𝐍𝐀 𝐋𝐈𝐒𝐓𝐀", "Número já marcado.", `❄️ +${numero}`, null, nomeBot) }, { quoted: msg }) }
        lista[jid].push(numero); db.salvarListanegra(lista); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐍𝐔́𝐌𝐄𝐑𝐎", "Marcado na lista negra.", `❄️ +${numero}`, null, nomeBot) }, { quoted: msg })
        try { const part = groupMetadata && groupMetadata.participants.find(p => [p.id, p.lid, p.phoneNumber].filter(Boolean).map(utils.soNumero).includes(numero)); if (part) { await sock.groupParticipantsUpdate(jid, [part.id], "remove"); await sock.sendMessage(jid, { text: msgSucesso("𝐄𝐗𝐏𝐔𝐋𝐒𝐎", "Removido automaticamente.", `❄️ @${numero}`, null, nomeBot), mentions: [part.id] }) } } catch (_) {}
      }
    },

    blacklist: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const lista = (db.listanegra()[jid] || [])
        if (!lista.length) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐒𝐓𝐀 𝐕𝐀𝐙𝐈𝐀", "Sem números.", "Use `!listanegra`", null, nomeBot) }, { quoted: msg }) }
        let t = "💧 • 𝐁𝐋𝐀𝐂𝐊𝐋𝐈𝐒𝐓 •\n\n❄️ Lista:\n\n"; lista.forEach((n, i) => { t += `🧊 ${i + 1}. +${n}\n` }); t += `\n🧊 Total: ${lista.length}\n\n"${nomeBot}"`
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: t }, { quoted: msg })
      }
    },

    dellista: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const numero = (args[0] || "").replace(/\D/g, "")
        if (!numero) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐃𝐄𝐋𝐋𝐈𝐒𝐓𝐀", "Informe o número.", "`!dellista <núm>`", null, nomeBot) }, { quoted: msg }) }
        const lista = db.listanegra(); const arr = lista[jid] || []; const idx = arr.indexOf(numero)
        if (idx === -1) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎", "Número fora da lista.", `❄️ +${numero}`, null, nomeBot) }, { quoted: msg }) }
        arr.splice(idx, 1); lista[jid] = arr; db.salvarListanegra(lista); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐍𝐔́𝐌𝐄𝐑𝐎", "Removido da lista.", `❄️ +${numero}`, null, nomeBot) }, { quoted: msg })
      }
    },

    bemvindo: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐁𝐄𝐌-𝐕𝐈𝐍𝐃𝐎", "Use on/off.", "`!bemvindo on/off`", null, nomeBot) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].bemvindo = opcao === "on"; db.salvarGrupos(g); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐁𝐄𝐌-𝐕𝐈𝐍𝐃𝐎", "Configurado.", `❄️ ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
      }
    },

    textobv: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const t = args.join(" ").trim()
        if (!t) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐓𝐄𝐗𝐓𝐎", "Informe o texto.", "`!textobv <txt>` (%nmr%)", null, nomeBot) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].textobv = t; db.salvarGrupos(g); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐓𝐄𝐗𝐓𝐎", "Salvo.", `❄️ ${t}`, null, nomeBot) }, { quoted: msg })
      }
    },

    fundobv: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const quoted = ctx.quotedMessage
        const tem = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage)
        if (!tem) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐅𝐔𝐍𝐃𝐎", "Responda uma imagem.", "`!fundobv` (reply)", null, nomeBot) }, { quoted: msg }) }
        const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage } })
        const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].fundobv = buffer.toString("base64"); db.salvarGrupos(g); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { image: buffer, caption: msgSucesso("𝐅𝐔𝐍𝐃𝐎", "Imagem salva.", "❄️ Aplicada ao grupo", null, nomeBot) }, { quoted: msg })
      }
    },

    legendasaiu: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const t = args.join(" ").trim()
        if (!t) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀", "Informe o texto.", "`!legendasaiu <txt>` (%nmr%)", null, nomeBot) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].legendasaiu = t; db.salvarGrupos(g); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀", "Salva.", `❄️ ${t}`, null, nomeBot) }, { quoted: msg })
      }
    },

    fundosaiu: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const quoted = ctx.quotedMessage
        const tem = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage)
        if (!tem) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐅𝐔𝐍𝐃𝐎", "Responda uma imagem.", "`!fundosaiu` (reply)", null, nomeBot) }, { quoted: msg }) }
        const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage } })
        const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].fundosaiu = buffer.toString("base64"); db.salvarGrupos(g); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { image: buffer, caption: msgSucesso("𝐅𝐔𝐍𝐃𝐎", "Imagem salva.", "❄️ Aplicada ao grupo", null, nomeBot) }, { quoted: msg })
      }
    },

    abrirgp: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils, groupMetadata }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "Promova o bot", null, nomeBot) }, { quoted: msg }) }
        const hora = args[0]
        if (!hora || !/^\d{1,2}:\d{2}$/.test(hora)) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐁𝐑𝐈𝐑𝐆𝐏", "Informe o horário.", "`!abrirgp hh:mm`", null, nomeBot) }, { quoted: msg }) }
        const [h, m] = hora.split(":").map(Number); const fmt = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0")
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].abrirHora = fmt; g[jid].ultimoAbrir = null; db.salvarGrupos(g); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐁𝐄𝐑𝐓𝐔𝐑𝐀", "Agendada.", `❄️ ${fmt}`, null, nomeBot) }, { quoted: msg })
      }
    },

    fechargp: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils, groupMetadata }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "Promova o bot", null, nomeBot) }, { quoted: msg }) }
        const hora = args[0]
        if (!hora || !/^\d{1,2}:\d{2}$/.test(hora)) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐅𝐄𝐂𝐇𝐀𝐑𝐆𝐏", "Informe o horário.", "`!fechargp hh:mm`", null, nomeBot) }, { quoted: msg }) }
        const [h, m] = hora.split(":").map(Number); const fmt = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0")
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].fecharHora = fmt; g[jid].ultimoFechar = null; db.salvarGrupos(g); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐅𝐄𝐂𝐇𝐀𝐌𝐄𝐍𝐓𝐎", "Agendado.", `❄️ ${fmt}`, null, nomeBot) }, { quoted: msg })
      }
    },

    fotoabrir: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const quoted = ctx.quotedMessage
        const tem = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage); const legenda = (args.join(" ").trim()) || (quoted && quoted.imageMessage && quoted.imageMessage.caption) || null
        const g = db.grupos(); g[jid] = g[jid] || {}
        if (tem) { const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage } }); const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage }); g[jid].fotoAbrir = buffer.toString("base64"); if (legenda) g[jid].legendaAbrir = legenda; db.salvarGrupos(g); await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { image: buffer, caption: msgSucesso("𝐅𝐎𝐓𝐎", "Abertura salva.", "❄️ Aplicada ao grupo", null, nomeBot) }, { quoted: msg }) }
        if (legenda) { g[jid].legendaAbrir = legenda; db.salvarGrupos(g); await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgSucesso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀", "Salva.", `❄️ ${legenda}`, null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐅𝐎𝐓𝐎", "Responda uma imagem.", "`!fotoabrir` (reply)", null, nomeBot) }, { quoted: msg })
      }
    },

    fotofechar: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const quoted = ctx.quotedMessage
        const tem = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage); const legenda = (args.join(" ").trim()) || (quoted && quoted.imageMessage && quoted.imageMessage.caption) || null
        const g = db.grupos(); g[jid] = g[jid] || {}
        if (tem) { const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage } }); const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage }); g[jid].fotoFechar = buffer.toString("base64"); if (legenda) g[jid].legendaFechar = legenda; db.salvarGrupos(g); await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { image: buffer, caption: msgSucesso("𝐅𝐎𝐓𝐎", "Fechamento salva.", "❄️ Aplicada ao grupo", null, nomeBot) }, { quoted: msg }) }
        if (legenda) { g[jid].legendaFechar = legenda; db.salvarGrupos(g); await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgSucesso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀", "Salva.", `❄️ ${legenda}`, null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐅𝐎𝐓𝐎", "Responda uma imagem.", "`!fotofechar` (reply)", null, nomeBot) }, { quoted: msg })
      }
    },

    legendaabrir: {
      aliases: ["setlegendaabrir", "legendabrir", "legendaabrirgp"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); let t = args.join(" ").trim()
        if (!t) { const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const q = ctx.quotedMessage; if (q) t = q.conversation || (q.extendedTextMessage && q.extendedTextMessage.text) || (q.imageMessage && q.imageMessage.caption) || "" }
        if (!t) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀", "Informe o texto.", "`!legendaabrir <txt>`", null, nomeBot) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].legendaAbrir = t; db.salvarGrupos(g); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀", "Salva.", `❄️ ${t}`, null, nomeBot) }, { quoted: msg })
      }
    },

    legendafechar: {
      aliases: ["setlegendafechar", "legendfechar", "legendafechargp"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); let t = args.join(" ").trim()
        if (!t) { const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const q = ctx.quotedMessage; if (q) t = q.conversation || (q.extendedTextMessage && q.extendedTextMessage.text) || (q.imageMessage && q.imageMessage.caption) || "" }
        if (!t) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀", "Informe o texto.", "`!legendafechar <txt>`", null, nomeBot) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].legendaFechar = t; db.salvarGrupos(g); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀", "Salva.", `❄️ ${t}`, null, nomeBot) }, { quoted: msg })
      }
    },

    limparfotos: {
      aliases: ["rmsfotos", "resetfotos", "limparfoto"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const g = db.grupos(); g[jid] = g[jid] || {}
        delete g[jid].fotoAbrir; delete g[jid].fotoFechar; delete g[jid].legendaAbrir; delete g[jid].legendaFechar; db.salvarGrupos(g); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐋𝐈𝐌𝐏𝐄𝐙𝐀", "Fotos e legendas removidas.", "❄️ Tudo limpo", null, nomeBot) }, { quoted: msg })
      }
    },

    iaon: {
      aliases: ["ativaria", "ligaria"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].iaAtiva = true; db.salvarGrupos(g); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐈𝐀", "Ativada.", "❄️ Marque o bot pra conversar", null, nomeBot) }, { quoted: msg })
      }
    },

    iaoff: {
      aliases: ["desligaria", "desativaria"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].iaAtiva = false; db.salvarGrupos(g); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐈𝐀", "Desativada.", "❄️ Não respondo mais", null, nomeBot) }, { quoted: msg })
      }
    },

    sorteio: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, utils, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        if (args.length < 2) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐒𝐎𝐑𝐓𝐄𝐈𝐎", "Informe prêmio e tempo.", "`!sorteio <prêmio> <tempo>`", null, nomeBot) }, { quoted: msg }) }
        const dRaw = args[args.length - 1].toLowerCase(); const premio = args.slice(0, -1).join(" "); const m = dRaw.match(/^(\d+)(s|m|h)$/)
        if (!m) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐅𝐎𝐑𝐌𝐀𝐓𝐎", "Use 30s / 5m / 1h.", "`!sorteio prêmio 5m`", null, nomeBot) }, { quoted: msg }) }
        const v = parseInt(m[1]), u = m[2]; let ms = 0, txt = ""
        if (u === "s") { ms = v * 1000; txt = v + "s" } if (u === "m") { ms = v * 60000; txt = v + "min" } if (u === "h") { ms = v * 3600000; txt = v + "h" }
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐒𝐎𝐑𝐓𝐄𝐈𝐎", "Iniciado.", `❄️ Prêmio: ${premio} • Tempo: ${txt}`, null, nomeBot) }, { quoted: msg })
        setTimeout(async () => {
          try { const meta = await sock.groupMetadata(jid); const mbs = meta.participants.map(p => p.id); if (!mbs.length) return; const g = mbs[Math.floor(Math.random() * mbs.length)]; await sock.sendMessage(jid, { text: msgSucesso("𝐕𝐄𝐍𝐂𝐄𝐃𝐎𝐑", "Sorteado!", `❄️ @${utils.soNumero(g)} • Prêmio: ${premio}`, null, nomeBot), mentions: [g] }) } catch (_) {}
        }, ms)
      }
    },

    modoparceria: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const parcerias = db.parcerias(); parcerias[jid] = parcerias[jid] || { ativo: false, parceiros: {} }
        const sub = (args[0] || "").toLowerCase(); if (sub === "on") parcerias[jid].ativo = true; else if (sub === "off") parcerias[jid].ativo = false; else parcerias[jid].ativo = !parcerias[jid].ativo
        db.salvarParcerias(parcerias); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀", "Configurado.", `❄️ ${parcerias[jid].ativo ? "ON ✅" : "OFF ❌"}`, null, nomeBot) }, { quoted: msg })
      }
    },

    parceria: {
      aliases: ["pedirparceria", "quero parceria"], adminOnly: false, grupoOnly: true,
      async executar({ sock, msg, db, groupMetadata, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const numUser = utils.soNumero(msg.key.participant || msg.key.remoteJid)
        if (!groupMetadata) return; const admins = groupMetadata.participants.filter(p => p.admin === "admin" || p.admin === "superadmin").map(p => p.id)
        if (admins.length === 0) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀", "Sem admin no grupo.", "Avise o dono", null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        let txt = `💧 • 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀 •\n\n❄️ @${numUser} pede aliança.\n\n🧊 Admins:\n`
        admins.forEach((a, i) => { txt += `🧊 ${i + 1}. @${utils.soNumero(a)}\n` })
        txt += `\n🧊 Use: \`!addparceria @${numUser} <qtd>\`\n\n"${nomeBot}"`
        await sock.sendMessage(jid, { text: txt, mentions: [msg.key.participant || msg.key.remoteJid, ...admins] }, { quoted: msg })
      }
    },

    addparceria: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const alvo = utils.getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐃𝐃𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀", "Marque um usuário.", "`!addparceria @user <qtd>`", null, nomeBot) }, { quoted: msg }) }
        const qtd = parseInt(args.find(a => /^\d+$/.test(a)) || "0", 10)
        if (!qtd || qtd <= 0) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐐𝐔𝐀𝐍𝐓𝐈𝐃𝐀𝐃𝐄", "Informe a qtd de links/dia.", "`!addparceria @user <qtd>`", null, nomeBot) }, { quoted: msg }) }
        const parcerias = db.parcerias(); parcerias[jid] = parcerias[jid] || { ativo: false, parceiros: {} }; parcerias[jid].parceiros = parcerias[jid].parceiros || {}
        parcerias[jid].parceiros[alvo] = { total: qtd, usados: 0, desde: Date.now() }; db.salvarParcerias(parcerias); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀", "Adicionada.", `❄️ @${utils.soNumero(alvo)} • ${qtd} link(s)/dia`, null, nomeBot), mentions: [alvo] }, { quoted: msg })
      }
    },

    rmparceria: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const alvo = utils.getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐌𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀", "Marque um usuário.", "`!rmparceria @user`", null, nomeBot) }, { quoted: msg }) }
        const parcerias = db.parcerias()
        if (!parcerias[jid] || !parcerias[jid].parceiros || !parcerias[jid].parceiros[alvo]) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐒𝐄𝐌 𝐀𝐋𝐈𝐀𝐍𝐂̧𝐀", "Esse usuário sem parceria.", `❄️ @${utils.soNumero(alvo)}`, null, nomeBot) }, { quoted: msg }) }
        delete parcerias[jid].parceiros[alvo]; db.salvarParcerias(parcerias); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀", "Removida.", `❄️ @${utils.soNumero(alvo)}`, null, nomeBot), mentions: [alvo] }, { quoted: msg })
      }
    },

    parcerias: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const dados = (db.parcerias())[jid] || {}
        if (!dados.parceiros || !Object.keys(dados.parceiros).length) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐒𝐄𝐌 𝐀𝐋𝐈𝐀𝐍𝐂̧𝐀𝐒", "Nenhuma parceria.", "Use `!addparceria`", null, nomeBot) }, { quoted: msg }) }
        const ativo = dados.ativo ? "ON ✅" : "OFF ❌"; let txt = `💧 • 𝐀𝐋𝐈𝐀𝐍𝐂̧𝐀𝐒 (${ativo}) •\n\n❄️ Lista:\n\n`; const mentions = []; let i = 1
        for (const [jidP, info] of Object.entries(dados.parceiros)) { txt += `🧊 ${i}. @${utils.soNumero(jidP)} — ${info.usados}/${info.total}\n`; mentions.push(jidP); i++ }
        txt += `\n"${nomeBot}"`; await reagir(sock, msg, "💧"); await sock.sendMessage(jid, { text: txt, mentions: mentions }, { quoted: msg })
      }
    },

    rgfig: {
      aliases: ["registrarfig", "addfigcmd", "savefig"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils, sender }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const comando = (args[0] || "").toLowerCase().replace(/^[!/.\-#,]+/, "").trim()
        if (!comando) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐆𝐅𝐈𝐆", "Informe o comando.", "`!rgfig <cmd>`", null, nomeBot) }, { quoted: msg }) }
        const ctx = (msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo) || {}; const q = ctx.quotedMessage; const fig = q && q.stickerMessage
        if (!fig) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐆𝐅𝐈𝐆", "Responda uma figurinha.", "`!rgfig <cmd>` (reply)", null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🧊")
        try {
          const alvo = { key: msg.key, message: { stickerMessage: fig }, messageTimestamp: msg.messageTimestamp }
          const buffer = await utils.downloadMediaMessage(alvo, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          if (!buffer || !buffer.length) throw new Error("Figurinha vazia")
          const hash = hashFigurinha(buffer); const num = utils.soNumero(sender); const dbFig = dbLer("figcmd.json", {}); dbFig[jid] = dbFig[jid] || {}
          const jaExiste = dbFig[jid][hash]
          if (jaExiste) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐉𝐀́ 𝐒𝐀𝐋𝐕𝐀", "Essa figurinha já registrada.", `❄️ !${jaExiste.comando}`, null, nomeBot), mentions: [`${jaExiste.criadoPor}@s.whatsapp.net`] }, { quoted: msg }) }
          dbFig[jid][hash] = { comando: comando, criadoPor: num, criadoEm: Date.now() }; dbSalvar("figcmd.json", dbFig)
          await reagir(sock, msg, "💧")
          await sock.sendMessage(jid, { text: msgSucesso("𝐅𝐈𝐆 𝐒𝐀𝐋𝐕𝐀", "Figurinha executará o comando.", `❄️ !${comando}`, null, nomeBot), mentions: [sender] }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha ao registrar.", "`" + e.message + "`", null, nomeBot) }, { quoted: msg }) }
      }
    },

    rmfig: {
      aliases: ["removerfig", "delfigcmd", "rmfigcmd"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils, sender }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const ctx = (msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo) || {}; const q = ctx.quotedMessage; const fig = q && q.stickerMessage
        if (!fig) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐌𝐅𝐈𝐆", "Responda uma figurinha.", "`!rmfig` (reply)", null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "🧊")
        try {
          const alvo = { key: msg.key, message: { stickerMessage: fig }, messageTimestamp: msg.messageTimestamp }
          const buffer = await utils.downloadMediaMessage(alvo, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          if (!buffer || !buffer.length) throw new Error("Figurinha vazia")
          const hash = hashFigurinha(buffer); const num = utils.soNumero(sender); const dbFig = dbLer("figcmd.json", {}); const grupo = dbFig[jid] || {}
          if (!grupo[hash]) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐀", "Figurinha não registrada.", "`!rgfig <cmd>`", null, nomeBot) }, { quoted: msg }) }
          const dados = grupo[hash]; delete grupo[hash]; dbFig[jid] = grupo; dbSalvar("figcmd.json", dbFig)
          await reagir(sock, msg, "💧")
          await sock.sendMessage(jid, { text: msgSucesso("𝐅𝐈𝐆 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐀", "Gatilho desativado.", `❄️ !${dados.comando}`, null, nomeBot), mentions: [sender] }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha ao remover.", "`" + e.message + "`", null, nomeBot) }, { quoted: msg }) }
      }
    },

    listafig: {
      aliases: ["figsregistradas", "figcmdlist", "minhasfig"], grupoOnly: true,
      async executar({ sock, msg, utils, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const dbFig = dbLer("figcmd.json", {}); const grupo = dbFig[jid] || {}; const entradas = Object.entries(grupo)
        if (!entradas.length) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐒𝐓𝐀𝐅𝐈𝐆", "Nenhuma figurinha registrada.", "`!rgfig <cmd>`", null, nomeBot) }, { quoted: msg }) }
        let txt = "💧 • 𝐅𝐈𝐆𝐒 •\n\n❄️ Lista:\n\n"; const mentions = []
        entradas.forEach(([hash, info], i) => { txt += `🧊 ${i + 1}. !${info.comando} — @${info.criadoPor}\n`; mentions.push(`${info.criadoPor}@s.whatsapp.net`) })
        txt += `\n🧊 Total: ${entradas.length}\n\n"${nomeBot}"`
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: txt, mentions }, { quoted: msg })
      }
    }
  }
}