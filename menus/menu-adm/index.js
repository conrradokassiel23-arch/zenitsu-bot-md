/* ============================================================
   💧❄️🧊 MENU ADM - RIMURU BOT MD (COMPLETO E REVISADO)
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
        const p = prefixoAtivo || "+"
        const cfg = db.config() || {}
        const { pushName, nomeDono, cargo, nomeBot } = getCargoETexto({ sender, config, db, groupMetadata, isDono, isSubDono, isAdmin, msg })
        const h = new Date().getHours()
        let saudacao = "Boa noite"
        if (h >= 5 && h < 12) saudacao = "Bom dia"
        else if (h >= 12 && h < 18) saudacao = "Boa tarde"
        const mentions = sender ? [sender] : []
        
        await reagir(sock, msg, "💧")

        const texto = `${cardPerfil({ nomeBot, nomeUsuario: pushName, cargo, dono: nomeDono })}

💧 *${saudacao}, ${pushName}!* 
❄️ Prefixo: \`${p}\`

${secao("⚔️ ᴀᴅᴍɪɴɪsᴛʀᴀᴄ̧ᴀ̃ᴏ")}
${item(`\`${p}menuadmin\` — banir, mutar, proteções`)}
${item(`\`${p}menudono\` — comandos do Grande Sábio`)}

${secao("❄️ ᴀ́ʀᴇᴀ ɴᴏʙʀᴇ")}
${item(`\`${p}menuvip\` — figurinhas, downloads, IA`)}

${secao("🎮 ᴊᴏɢᴏs ᴇ ᴅɪᴠᴇʀsᴀ̃ᴏ")}
${item(`\`${p}menurpg\` — economia, pets, cassino`)}
${item(`\`${p}menufazenda\` — animais, plantações`)}
${item(`\`${p}menufnaf\` — Five Nights at Freddy's`)}
${item(`\`${p}menucidade\` — casas, banco, crimes`)}

_"O Grande Sábio observa."_
"${nomeBot}"`

        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          try {
            if (cfg.tipoMenu === "video") await sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "rimuru.mp4", gifPlayback: true, caption: texto, mentions }, { quoted: msg })
            else await sock.sendMessage(jid, { image: buf, caption: texto, mentions }, { quoted: msg })
          } catch (e) { await sock.sendMessage(jid, { text: texto, mentions }, { quoted: msg }) }
        } else {
          await sock.sendMessage(jid, { text: texto, mentions }, { quoted: msg })
        }
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
        await sock.sendMessage(jid, { text: `💧 • 𝐓𝐎𝐓𝐀𝐋 •\n\n❄️ Estatísticas\n\n🧊 Comandos: ${total}\n🧊 Aliases: ${totalAliases}\n🧊 Total: ${total + totalAliases}\n\n🧊 Por categoria:\n${listaCat || "🧊 _nenhuma_"}\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    menuadmin: {
      aliases: ["menu-adm", "menua", "adm", "comandosadm"],
      async executar({ sock, msg, prefixoAtivo, db, sender, config, isDono, isSubDono, isAdmin, groupMetadata }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; const cfg = db.config() || {}
        const { pushName, nomeDono, cargo, nomeBot } = getCargoETexto({ sender, config, db, groupMetadata, isDono, isSubDono, isAdmin, msg })
        await reagir(sock, msg, "❄️")
        const texto = `${cardPerfil({ nomeBot, nomeUsuario: pushName, cargo, dono: nomeDono })}

${secao("⚔️ ᴀᴅᴍɪɴ")}
${item(`${p}adv / ${p}deladv / ${p}listaadv`)}
${item(`${p}promover / ${p}rebaixar / ${p}ban`)}
${item(`${p}mute / ${p}desmute`)}
${item(`${p}p (reply) / ${p}totag <txt>`)}
${item(`${p}abrir / ${p}fechar / ${p}link`)}
${item(`${p}namegp / ${p}descricao`)}
${item(`${p}soadm on/off`)}

${secao("🛡️ ᴘʀᴏᴛᴇᴄ̧ᴏ̃ᴇs")}
${item(`${p}antilink / ${p}antiaudio / ${p}antivideo`)}
${item(`${p}antifoto / ${p}antifig`)}
${item(`${p}palavrao on/off`)}
${item(`${p}addpalavra / ${p}rmpalavra / ${p}listapalavra`)}

${secao("👑 sᴜʙ-ᴀᴅᴍ")}
${item(`${p}subadm / ${p}delsubadm / ${p}listasubadm`)}

${secao("⚙️ ᴘʀᴇғɪxᴏ")}
${item(`${p}multiprefixo on/off`)}
${item(`${p}setprefixo <novo>`)}

${secao("🕵️ x𝟵 / ᴘᴀʀᴄᴇʀɪᴀ")}
${item(`${p}x9 on/off`)}
${item(`${p}modoparceria on/off`)}
${item(`${p}addparceria / ${p}rmparceria / ${p}parcerias`)}
${item(`${p}cadastrarparceria / ${p}vercadastrados`)}

${secao("🚫 ʟɪsᴛᴀ ɴᴇɢʀᴀ")}
${item(`${p}listanegra <núm>`)}
${item(`${p}blacklist / ${p}dellista <núm>`)}

${secao("👋 ʙᴇᴍ-ᴠɪɴᴅᴏ")}
${item(`${p}bemvindo on/off`)}
${item(`${p}textobv <txt> / ${p}fundoBV (reply)`)}
${item(`${p}legendasaiu <txt> / ${p}fundoSaiu (reply)`)}

${secao("⏰ ᴀɢᴇɴᴅᴀᴍᴇɴᴛᴏ")}
${item(`${p}abrirgp / ${p}fechargp hh:mm`)}
${item(`${p}fotoabrir / ${p}fotofechar (reply)`)}
${item(`${p}legendaabrir / ${p}legendafechar <txt>`)}
${item(`${p}limparfotos`)}

${secao("🤖 ɪᴀ / sᴏʀᴛᴇɪᴏ")}
${item(`${p}iaon / ${p}iaoff`)}
${item(`${p}sorteio <prêmio> <tempo>`)}

${secao("🎴 ғɪɢ ᴄᴏᴍᴀɴᴅᴏ")}
${item(`${p}rgfig <cmd> (reply)`)}
${item(`${p}rmfig (reply) / ${p}listafig`)}

💧 Prefixo: \`${p}\`

"${nomeBot}"`
        if (cfg.fotoMenu) { const buf = Buffer.from(cfg.fotoMenu, "base64"); if (cfg.tipoMenu === "video") return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "rimuru.mp4", gifPlayback: true, caption: texto }, { quoted: msg }); return sock.sendMessage(jid, { image: buf, caption: texto }, { quoted: msg }) }
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    prefixo: {
      aliases: ["prefix", "prefixoatual", "qualprefixo"],
      async executar({ sock, msg, prefixoAtivo, db }) {
        const jid = msg.key.remoteJid; const cfg = db.config(); const padrao = cfg.prefixoGlobal || "+"; const grupoConf = db.grupos()[jid] || {}; const nomeBot = nomeBotDb(db)
        let multiStatus = grupoConf.multiprefixo ? "ON ✅" : "OFF ❌"; let prefixoGrupo = grupoConf.prefixo || padrao
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐏𝐑𝐄𝐅𝐈𝐗𝐎 •\n\n❄️ Configuração\n\n🧊 Padrão: ${padrao}\n🧊 Ativo: ${prefixoAtivo}\n🧊 Multiprefixo: ${multiStatus}\n🧊 Grupo: ${prefixoGrupo}\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    p: {
      aliases: ["apagar", "delmsg"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, prefixoAtivo, groupMetadata, utils, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo
        if (!ctx || !ctx.stanzaId) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐏𝐀𝐆𝐀𝐑", "Responda uma mensagem.", `Use \`${p}p\` reply`, null, nomeBot) }, { quoted: msg }) }
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
      async executar({ sock, msg, args, prefixoAtivo, groupMetadata, utils, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const nome = args.join(" ").trim()
        if (!nome) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐍𝐎𝐌𝐄", "Informe o nome.", `\`${p}namegp <nome>\``, null, nomeBot) }, { quoted: msg }) }
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "Promova o bot", null, nomeBot) }, { quoted: msg }) }
        try { await sock.groupUpdateSubject(jid, nome); await reagir(sock, msg, "💧"); await sock.sendMessage(jid, { text: msgSucesso("𝐍𝐎𝐌𝐄", "Nome alterado.", `❄️ ${nome}`, null, nomeBot) }, { quoted: msg }) } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: "💧 " + e.message }, { quoted: msg }) }
      }
    },

    descricao: {
      aliases: ["setdescricao", "descgp"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, prefixoAtivo, groupMetadata, utils, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const desc = args.join(" ").trim()
        if (!desc) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐃𝐄𝐒𝐂𝐑𝐈𝐂̧𝐀̃𝐎", "Informe o texto.", `\`${p}descricao <texto>\``, null, nomeBot) }, { quoted: msg }) }
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
      async executar({ sock, msg, db, prefixoAtivo, utils }) {
        const jid = msg.key.remoteJid; const alvo = utils.getAlvo(msg); const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        if (!alvo) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐌𝐔𝐓𝐄", "Marque alguém.", `\`${p}mute @user\``, null, nomeBot) }, { quoted: msg }) }
        const mutados = db.mutados(); mutados[jid] = mutados[jid] || {}; mutados[jid][alvo] = Date.now() + 5 * 60 * 1000; db.salvarMutados(mutados)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐌𝐔𝐓𝐀𝐃𝐎", "Usuário silenciado por 5min.", `❄️ @${utils.soNumero(alvo)}`, null, nomeBot), mentions: [alvo] }, { quoted: msg })
      }
    },

    desmute: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, prefixoAtivo, utils }) {
        const jid = msg.key.remoteJid; const alvo = utils.getAlvo(msg); const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        if (!alvo) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐃𝐄𝐒𝐌𝐔𝐓𝐄", "Marque alguém.", `\`${p}desmute @user\``, null, nomeBot) }, { quoted: msg }) }
        const mutados = db.mutados(); if (mutados[jid] && mutados[jid][alvo]) { delete mutados[jid][alvo]; db.salvarMutados(mutados) }
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐋𝐈𝐁𝐄𝐑𝐀𝐃𝐎", "Usuário pode falar.", `❄️ @${utils.soNumero(alvo)}`, null, nomeBot), mentions: [alvo] }, { quoted: msg })
      }
    },

    palavrao: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐏𝐀𝐋𝐀𝐕𝐑𝐀̃𝐎", "Use on/off.", `\`${p}palavrao on/off\``, null, nomeBot) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].palavrao = opcao === "on"; db.salvarGrupos(g)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐀𝐋𝐀𝐕𝐑𝐀̃𝐎", "Filtro configurado.", `❄️ ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
      }
    },

    addpalavra: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const palavra = args.join(" ").trim().toLowerCase()
        if (!palavra) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐃𝐈𝐂𝐈𝐎𝐍𝐀𝐑", "Informe a palavra.", `\`${p}addpalavra <p>\``, null, nomeBot) }, { quoted: msg }) }
        const pal = db.palavroes(); pal[jid] = pal[jid] || []
        if (pal[jid].includes(palavra)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐉𝐀́ 𝐄𝐗𝐈𝐒𝐓𝐄", "Palavra na lista.", `❄️ ${palavra}`, null, nomeBot) }, { quoted: msg }) }
        pal[jid].push(palavra); db.salvarPalavroes(pal)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐃𝐈𝐂𝐈𝐎𝐍𝐀𝐃𝐀", "Palavra proibida.", `❄️ ${palavra}`, null, nomeBot) }, { quoted: msg })
      }
    },

    rmpalavra: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const palavra = args.join(" ").trim().toLowerCase()
        if (!palavra) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐄𝐌𝐎𝐕𝐄𝐑", "Informe a palavra.", `\`${p}rmpalavra <p>\``, null, nomeBot) }, { quoted: msg }) }
        const pal = db.palavroes(); const arr = pal[jid] || []; const idx = arr.indexOf(palavra)
        if (idx === -1) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐀", "Palavra fora da lista.", `❄️ ${palavra}`, null, nomeBot) }, { quoted: msg }) }
        arr.splice(idx, 1); pal[jid] = arr; db.salvarPalavroes(pal)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐀", "Palavra liberada.", `❄️ ${palavra}`, null, nomeBot) }, { quoted: msg })
      }
    },

    listapalavra: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const lista = db.palavroes()[jid] || []
        if (!lista.length) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐒𝐓𝐀 𝐕𝐀𝐙𝐈𝐀", "Nenhuma palavra.", `Use \`${p}addpalavra\``, null, nomeBot) }, { quoted: msg }) }
        let t = "💧 • 𝐏𝐀𝐋𝐀𝐕𝐑𝐀𝐒 •\n\n❄️ Lista:\n\n"; lista.forEach((pal, i) => { t += `🧊 ${i + 1}. \`${pal}\`\n` }); t += `\n🧊 Total: ${lista.length}\n\n"${nomeBot}"`
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: t }, { quoted: msg })
      }
    },

    antilink: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐍𝐓𝐈𝐋𝐈𝐍𝐊", "Use on/off.", `\`${p}antilink on/off\``, null, nomeBot) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].antilink = opcao === "on"; db.salvarGrupos(g)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐍𝐓𝐈𝐋𝐈𝐍𝐊", "Proteção atualizada.", `❄️ ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
      }
    },

    antiaudio: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐍𝐓𝐈𝐀́𝐔𝐃𝐈𝐎", "Use on/off.", `\`${p}antiaudio on/off\``, null, nomeBot) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].antiaudio = opcao === "on"; db.salvarGrupos(g)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐍𝐓𝐈𝐀́𝐔𝐃𝐈𝐎", "Proteção atualizada.", `❄️ ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
      }
    },

    antivideo: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐍𝐓𝐈𝐕𝐈́𝐃𝐄𝐎", "Use on/off.", `\`${p}antivideo on/off\``, null, nomeBot) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].antivideo = opcao === "on"; db.salvarGrupos(g)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐍𝐓𝐈𝐕𝐈́𝐃𝐄𝐎", "Proteção atualizada.", `❄️ ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
      }
    },

    antifoto: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐍𝐓𝐈𝐅𝐎𝐓𝐎", "Use on/off.", `\`${p}antifoto on/off\``, null, nomeBot) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].antifoto = opcao === "on"; db.salvarGrupos(g)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐍𝐓𝐈𝐅𝐎𝐓𝐎", "Proteção atualizada.", `❄️ ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
      }
    },

    antifig: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐍𝐓𝐈𝐅𝐈𝐆", "Use on/off.", `\`${p}antifig on/off\``, null, nomeBot) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].antifig = opcao === "on"; db.salvarGrupos(g)
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐍𝐓𝐈𝐅𝐈𝐆", "Proteção atualizada.", `❄️ ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
      }
    },

    promover: {
      aliases: ["promote", "daradm"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const alvoRaw = utils.getAlvo(msg)
        if (!alvoRaw) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐏𝐑𝐎𝐌𝐎𝐕𝐄𝐑", "Marque alguém.", `\`${p}promover @user\``, null, nomeBot) }, { quoted: msg }) }
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "Promova o bot", null, nomeBot) }, { quoted: msg }) }
        const n = utils.soNumero(alvoRaw); const part = groupMetadata.participants.find(pa => [pa.id, pa.lid, pa.phoneNumber].filter(Boolean).map(utils.soNumero).includes(n))
        if (!part) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎", "Usuário fora do grupo.", `@${n}`, null, nomeBot) }, { quoted: msg }) }
        try { await sock.groupParticipantsUpdate(jid, [part.id], "promote"); await reagir(sock, msg, "💧"); await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐑𝐎𝐌𝐎𝐕𝐈𝐃𝐎", "Virou admin.", `❄️ @${n}`, null, nomeBot), mentions: [part.id] }, { quoted: msg }) } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: "💧 " + e.message }, { quoted: msg }) }
      }
    },

    rebaixar: {
      aliases: ["demote", "tiraradm"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const alvoRaw = utils.getAlvo(msg)
        if (!alvoRaw) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐄𝐁𝐀𝐈𝐗𝐀𝐑", "Marque alguém.", `\`${p}rebaixar @user\``, null, nomeBot) }, { quoted: msg }) }
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "Promova o bot", null, nomeBot) }, { quoted: msg }) }
        const n = utils.soNumero(alvoRaw); const part = groupMetadata.participants.find(pa => [pa.id, pa.lid, pa.phoneNumber].filter(Boolean).map(utils.soNumero).includes(n))
        if (!part) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎", "Usuário fora do grupo.", `@${n}`, null, nomeBot) }, { quoted: msg }) }
        try { await sock.groupParticipantsUpdate(jid, [part.id], "demote"); await reagir(sock, msg, "💧"); await sock.sendMessage(jid, { text: msgSucesso("𝐑𝐄𝐁𝐀𝐈𝐗𝐀𝐃𝐎", "Perdeu admin.", `❄️ @${n}`, null, nomeBot), mentions: [part.id] }, { quoted: msg }) } catch (e) { await reagir(sock, msg, "🧊"); await sock.sendMessage(jid, { text: "💧 " + e.message }, { quoted: msg }) }
      }
    },

    ban: {
      aliases: ["kick", "remover"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const alvoRaw = utils.getAlvo(msg)
        
        if (!alvoRaw) { 
          await reagir(sock, msg, "❄️")
          return sock.sendMessage(jid, { text: msgAviso("𝐁𝐀𝐍𝐈𝐑", "Marque alguém.", `\`${p}ban @user\``, null, nomeBot) }, { quoted: msg }) 
        }
        
        if (!utils.botEhAdmin(groupMetadata, sock)) { 
          await reagir(sock, msg, "🧊")
          return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Eu (o bot) preciso ser admin.", "Promova o bot", null, nomeBot) }, { quoted: msg }) 
        }
        
        const n = utils.soNumero(alvoRaw)
        const part = groupMetadata.participants.find(pa => {
          const pIds = [pa.id, pa.lid, pa.phoneNumber].filter(Boolean).map(utils.soNumero)
          return pIds.includes(n)
        })
        
        if (!part) { 
          await reagir(sock, msg, "🧊")
          return sock.sendMessage(jid, { text: msgErro("𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎", "Usuário fora do grupo.", `@${n}`, null, nomeBot) }, { quoted: msg }) 
        }
        
        try { 
          await sock.groupParticipantsUpdate(jid, [part.id], "remove")
          await reagir(sock, msg, "💧")
          await sock.sendMessage(jid, { text: msgSucesso("𝐄𝐗𝐏𝐔𝐋𝐒𝐎", "Usuário removido.", `❄️ @${n}`, null, nomeBot), mentions: [part.id] }, { quoted: msg }) 
        } catch (e) { 
          await reagir(sock, msg, "🧊")
          await sock.sendMessage(jid, { text: "💧 " + e.message }, { quoted: msg }) 
        }
      }
    },

    adv: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const alvo = utils.getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐃𝐕𝐄𝐑𝐓𝐈𝐑", "Marque alguém.", `\`${p}adv @user <motivo>\``, null, nomeBot) }, { quoted: msg }) }
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
      async executar({ sock, msg, db, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const alvo = utils.getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐄𝐌𝐎𝐕𝐄𝐑 𝐀𝐃𝐕", "Marque alguém.", `\`${p}deladv @user\``, null, nomeBot) }, { quoted: msg }) }
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
        if (!entradas.length) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐒𝐓𝐀 𝐕𝐀𝐙𝐈𝐀", "Sem advertências.", "Use `+adv`", null, nomeBot) }, { quoted: msg }) }
        entradas.sort((a, b) => b[1] - a[1]); let t = "💧 • 𝐀𝐃𝐕𝐄𝐑𝐓𝐄̂𝐍𝐂𝐈𝐀𝐒 •\n\n❄️ Lista:\n\n"
        entradas.forEach(([j, q], i) => { t += `🧊 ${i + 1}. @${utils.soNumero(j)} — ${q}/3\n` }); t += `\n🧊 Total: ${entradas.length}\n\n"${nomeBot}"`
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: t, mentions: entradas.map(e => e[0]) }, { quoted: msg })
      }
    },

    totag: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, groupMetadata, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; let texto = args.join(" ").trim()
        if (!texto) { const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const q = ctx.quotedMessage; if (q) texto = q.conversation || (q.extendedTextMessage && q.extendedTextMessage.text) || (q.imageMessage && q.imageMessage.caption) || "" }
        if (!texto) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: `💧 \`${p}totag <texto>\`` }, { quoted: msg }) }
        const mentions = groupMetadata.participants.map(pa => pa.id); await reagir(sock, msg, "💧"); await sock.sendMessage(jid, { text: texto, mentions }, { quoted: msg })
      }
    },

    subadm: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const alvo = utils.getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐒𝐔𝐁-𝐀𝐃𝐌", "Marque alguém.", `\`${p}subadm @user\``, null, nomeBot) }, { quoted: msg }) }
        const subs = db.subadmins(); subs[jid] = subs[jid] || []
        if (subs[jid].some(s => utils.soNumero(s) === utils.soNumero(alvo))) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐉𝐀́ 𝐄́", "Já é Sub-Adm.", `❄️ @${utils.soNumero(alvo)}`, null, nomeBot) }, { quoted: msg }) }
        subs[jid].push(alvo); db.salvarSubadmins(subs); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐒𝐔𝐁-𝐀𝐃𝐌", "Virou Sub-Adm.", `❄️ @${utils.soNumero(alvo)}`, null, nomeBot), mentions: [alvo] }, { quoted: msg })
      }
    },

    delsubadm: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const alvo = utils.getAlvo(msg)
        if (!alvo) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐄𝐌𝐎𝐕𝐄𝐑", "Marque alguém.", `\`${p}delsubadm @user\``, null, nomeBot) }, { quoted: msg }) }
        const subs = db.subadmins(); subs[jid] = (subs[jid] || []).filter(s => utils.soNumero(s) !== utils.soNumero(alvo)); db.salvarSubadmins(subs); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐎", "Não é mais Sub-Adm.", `❄️ @${utils.soNumero(alvo)}`, null, nomeBot), mentions: [alvo] }, { quoted: msg })
      }
    },

    listasubadm: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const subs = db.subadmins()[jid] || []
        if (!subs.length) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐒𝐓𝐀 𝐕𝐀𝐙𝐈𝐀", "Sem Sub-Admins.", `Use \`${p}subadm\``, null, nomeBot) }, { quoted: msg }) }
        let t = "💧 • 𝐒𝐔𝐁-𝐀𝐃𝐌𝐈𝐍𝐒 •\n\n❄️ Lista:\n\n"; subs.forEach((s, i) => { t += `🧊 ${i + 1}. @${utils.soNumero(s)}\n` }); t += `\n🧊 Total: ${subs.length}\n\n"${nomeBot}"`
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: t, mentions: subs }, { quoted: msg })
      }
    },

    soadm: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐒𝐎 𝐀𝐃𝐌", "Use on/off.", `\`${p}soadm on/off\``, null, nomeBot) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].soadm = opcao === "on"; db.salvarGrupos(g); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐒𝐎 𝐀𝐃𝐌", "Configurado.", `❄️ ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
      }
    },

    multiprefixo: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐌𝐔𝐋𝐓𝐈𝐏𝐑𝐄𝐅𝐈𝐗𝐎", "Use on/off.", `\`${p}multiprefixo on/off\``, null, nomeBot) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].multiprefixo = opcao === "on"; db.salvarGrupos(g); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐌𝐔𝐋𝐓𝐈𝐏𝐑𝐄𝐅𝐈𝐗𝐎", "Configurado.", `❄️ ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
      }
    },

    setprefixo: {
      aliases: ["setprefix", "trocarp"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const g = db.grupos(); const conf = g[jid] || {}
        if (!conf.multiprefixo) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐌𝐔𝐋𝐓𝐈𝐏𝐑𝐄𝐅𝐈𝐗𝐎 𝐎𝐅𝐅", "Ative primeiro.", `\`${p}multiprefixo on\``, null, nomeBot) }, { quoted: msg }) }
        const novo = args[0]
        if (!novo) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐒𝐄𝐓𝐏𝐑𝐄𝐅𝐈𝐗𝐎", "Informe o prefixo.", `\`${p}setprefixo <s>\``, null, nomeBot) }, { quoted: msg }) }
        if (novo.length > 3) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐋𝐎𝐍𝐆𝐎", "Máximo 3 caracteres.", `❄️ ${novo}`, null, nomeBot) }, { quoted: msg }) }
        g[jid].prefixo = novo; db.salvarGrupos(g); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐑𝐄𝐅𝐈𝐗𝐎", "Alterado.", `❄️ \`${novo}\``, null, nomeBot) }, { quoted: msg })
      }
    },

    x9: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐗𝟗", "Use on/off.", `\`${p}x9 on/off\``, null, nomeBot) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].x9 = opcao === "on"; db.salvarGrupos(g); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐗𝟗", "Espionagem configurada.", `❄️ ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
      }
    },

    listanegra: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, groupMetadata, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const numero = (args[0] || "").replace(/\D/g, "")
        if (!numero || numero.length < 8) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐒𝐓𝐀 𝐍𝐄𝐆𝐑𝐀", "Informe o número.", `\`${p}listanegra <núm>\``, null, nomeBot) }, { quoted: msg }) }
        const lista = db.listanegra(); lista[jid] = lista[jid] || []
        if (lista[jid].includes(numero)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐉𝐀́ 𝐍𝐀 𝐋𝐈𝐒𝐓𝐀", "Número já marcado.", `❄️ +${numero}`, null, nomeBot) }, { quoted: msg }) }
        lista[jid].push(numero); db.salvarListanegra(lista); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐍𝐔́𝐌𝐄𝐑𝐎", "Marcado na lista negra.", `❄️ +${numero}`, null, nomeBot) }, { quoted: msg })
        try { const part = groupMetadata && groupMetadata.participants.find(pa => [pa.id, pa.lid, pa.phoneNumber].filter(Boolean).map(utils.soNumero).includes(numero)); if (part) { await sock.groupParticipantsUpdate(jid, [part.id], "remove"); await sock.sendMessage(jid, { text: msgSucesso("𝐄𝐗𝐏𝐔𝐋𝐒𝐎", "Removido automaticamente.", `❄️ @${numero}`, null, nomeBot), mentions: [part.id] }) } } catch (_) {}
      }
    },

    blacklist: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const lista = (db.listanegra()[jid] || [])
        if (!lista.length) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐒𝐓𝐀 𝐕𝐀𝐙𝐈𝐀", "Sem números.", `Use \`${p}listanegra\``, null, nomeBot) }, { quoted: msg }) }
        let t = "💧 • 𝐁𝐋𝐀𝐂𝐊𝐋𝐈𝐒𝐓 •\n\n❄️ Lista:\n\n"; lista.forEach((n, i) => { t += `🧊 ${i + 1}. +${n}\n` }); t += `\n🧊 Total: ${lista.length}\n\n"${nomeBot}"`
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: t }, { quoted: msg })
      }
    },

    dellista: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const numero = (args[0] || "").replace(/\D/g, "")
        if (!numero) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐃𝐄𝐋𝐋𝐈𝐒𝐓𝐀", "Informe o número.", `\`${p}dellista <núm>\``, null, nomeBot) }, { quoted: msg }) }
        const lista = db.listanegra(); const arr = lista[jid] || []; const idx = arr.indexOf(numero)
        if (idx === -1) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎", "Número fora da lista.", `❄️ +${numero}`, null, nomeBot) }, { quoted: msg }) }
        arr.splice(idx, 1); lista[jid] = arr; db.salvarListanegra(lista); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐍𝐔́𝐌𝐄𝐑𝐎", "Removido da lista.", `❄️ +${numero}`, null, nomeBot) }, { quoted: msg })
      }
    },

    bemvindo: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐁𝐄𝐌-𝐕𝐈𝐍𝐃𝐎", "Use on/off.", `\`${p}bemvindo on/off\``, null, nomeBot) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].bemvindo = opcao === "on"; db.salvarGrupos(g); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐁𝐄𝐌-𝐕𝐈𝐍𝐃𝐎", "Configurado.", `❄️ ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
      }
    },

    textobv: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const t = args.join(" ").trim()
        if (!t) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐓𝐄𝐗𝐓𝐎", "Informe o texto.", `\`${p}textobv <txt>\` (%nmr%)`, null, nomeBot) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].textobv = t; db.salvarGrupos(g); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐓𝐄𝐗𝐓𝐎", "Salvo.", `❄️ ${t}`, null, nomeBot) }, { quoted: msg })
      }
    },

    fundobv: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const quoted = ctx.quotedMessage
        const tem = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage)
        if (!tem) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐅𝐔𝐍𝐃𝐎", "Responda uma imagem.", `\`${p}fundobv\` (reply)`, null, nomeBot) }, { quoted: msg }) }
        const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage } })
        const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].fundobv = buffer.toString("base64"); db.salvarGrupos(g); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { image: buffer, caption: msgSucesso("𝐅𝐔𝐍𝐃𝐎", "Imagem salva.", "❄️ Aplicada ao grupo", null, nomeBot) }, { quoted: msg })
      }
    },

    legendasaiu: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const t = args.join(" ").trim()
        if (!t) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀", "Informe o texto.", `\`${p}legendasaiu <txt>\` (%nmr%)`, null, nomeBot) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].legendasaiu = t; db.salvarGrupos(g); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀", "Salva.", `❄️ ${t}`, null, nomeBot) }, { quoted: msg })
      }
    },

    fundosaiu: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const quoted = ctx.quotedMessage
        const tem = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage)
        if (!tem) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐅𝐔𝐍𝐃𝐎", "Responda uma imagem.", `\`${p}fundosaiu\` (reply)`, null, nomeBot) }, { quoted: msg }) }
        const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage } })
        const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].fundosaiu = buffer.toString("base64"); db.salvarGrupos(g); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { image: buffer, caption: msgSucesso("𝐅𝐔𝐍𝐃𝐎", "Imagem salva.", "❄️ Aplicada ao grupo", null, nomeBot) }, { quoted: msg })
      }
    },

    abrirgp: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils, groupMetadata, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "Promova o bot", null, nomeBot) }, { quoted: msg }) }
        const hora = args[0]
        if (!hora || !/^\d{1,2}:\d{2}$/.test(hora)) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐁𝐑𝐈𝐑𝐆𝐏", "Informe o horário.", `\`${p}abrirgp hh:mm\``, null, nomeBot) }, { quoted: msg }) }
        const [h, m] = hora.split(":").map(Number); const fmt = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0")
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].abrirHora = fmt; g[jid].ultimoAbrir = null; db.salvarGrupos(g); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐁𝐄𝐑𝐓𝐔𝐑𝐀", "Agendada.", `❄️ ${fmt}`, null, nomeBot) }, { quoted: msg })
      }
    },

    fechargp: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils, groupMetadata, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "Promova o bot", null, nomeBot) }, { quoted: msg }) }
        const hora = args[0]
        if (!hora || !/^\d{1,2}:\d{2}$/.test(hora)) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐅𝐄𝐂𝐇𝐀𝐑𝐆𝐏", "Informe o horário.", `\`${p}fechargp hh:mm\``, null, nomeBot) }, { quoted: msg }) }
        const [h, m] = hora.split(":").map(Number); const fmt = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0")
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].fecharHora = fmt; g[jid].ultimoFechar = null; db.salvarGrupos(g); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐅𝐄𝐂𝐇𝐀𝐌𝐄𝐍𝐓𝐎", "Agendado.", `❄️ ${fmt}`, null, nomeBot) }, { quoted: msg })
      }
    },

    fotoabrir: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const quoted = ctx.quotedMessage
        const tem = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage); const legenda = (args.join(" ").trim()) || (quoted && quoted.imageMessage && quoted.imageMessage.caption) || null
        const g = db.grupos(); g[jid] = g[jid] || {}
        if (tem) { const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage } }); const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage }); g[jid].fotoAbrir = buffer.toString("base64"); if (legenda) g[jid].legendaAbrir = legenda; db.salvarGrupos(g); await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { image: buffer, caption: msgSucesso("𝐅𝐎𝐓𝐎", "Abertura salva.", "❄️ Aplicada ao grupo", null, nomeBot) }, { quoted: msg }) }
        if (legenda) { g[jid].legendaAbrir = legenda; db.salvarGrupos(g); await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgSucesso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀", "Salva.", `❄️ ${legenda}`, null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐅𝐎𝐓𝐎", "Responda uma imagem.", `\`${p}fotoabrir\` (reply)`, null, nomeBot) }, { quoted: msg })
      }
    },

    fotofechar: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const quoted = ctx.quotedMessage
        const tem = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage); const legenda = (args.join(" ").trim()) || (quoted && quoted.imageMessage && quoted.imageMessage.caption) || null
        const g = db.grupos(); g[jid] = g[jid] || {}
        if (tem) { const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage } }); const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage }); g[jid].fotoFechar = buffer.toString("base64"); if (legenda) g[jid].legendaFechar = legenda; db.salvarGrupos(g); await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { image: buffer, caption: msgSucesso("𝐅𝐎𝐓𝐎", "Fechamento salva.", "❄️ Aplicada ao grupo", null, nomeBot) }, { quoted: msg }) }
        if (legenda) { g[jid].legendaFechar = legenda; db.salvarGrupos(g); await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgSucesso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀", "Salva.", `❄️ ${legenda}`, null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐅𝐎𝐓𝐎", "Responda uma imagem.", `\`${p}fotofechar\` (reply)`, null, nomeBot) }, { quoted: msg })
      }
    },

    legendaabrir: {
      aliases: ["setlegendaabrir", "legendabrir", "legendaabrirgp"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; let t = args.join(" ").trim()
        if (!t) { const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const q = ctx.quotedMessage; if (q) t = q.conversation || (q.extendedTextMessage && q.extendedTextMessage.text) || (q.imageMessage && q.imageMessage.caption) || "" }
        if (!t) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀", "Informe o texto.", `\`${p}legendaabrir <txt>\``, null, nomeBot) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].legendaAbrir = t; db.salvarGrupos(g); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀", "Salva.", `❄️ ${t}`, null, nomeBot) }, { quoted: msg })
      }
    },

    legendafechar: {
      aliases: ["setlegendafechar", "legendfechar", "legendafechargp"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; let t = args.join(" ").trim()
        if (!t) { const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const q = ctx.quotedMessage; if (q) t = q.conversation || (q.extendedTextMessage && q.extendedTextMessage.text) || (q.imageMessage && q.imageMessage.caption) || "" }
        if (!t) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀", "Informe o texto.", `\`${p}legendafechar <txt>\``, null, nomeBot) }, { quoted: msg }) }
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
      async executar({ sock, msg, args, utils, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        if (args.length < 2) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐒𝐎𝐑𝐓𝐄𝐈𝐎", "Informe prêmio e tempo.", `\`${p}sorteio <prêmio> <tempo>\``, null, nomeBot) }, { quoted: msg }) }
        const dRaw = args[args.length - 1].toLowerCase(); const premio = args.slice(0, -1).join(" "); const m = dRaw.match(/^(\d+)(s|m|h)$/)
        if (!m) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐅𝐎𝐑𝐌𝐀𝐓𝐎", "Use 30s / 5m / 1h.", `\`${p}sorteio prêmio 5m\``, null, nomeBot) }, { quoted: msg }) }
        const v = parseInt(m[1]), u = m[2]; let ms = 0, txt = ""
        if (u === "s") { ms = v * 1000; txt = v + "s" } if (u === "m") { ms = v * 60000; txt = v + "min" } if (u === "h") { ms = v * 3600000; txt = v + "h" }
        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐒𝐎𝐑𝐓𝐄𝐈𝐎", "Iniciado.", `❄️ Prêmio: ${premio} • Tempo: ${txt}`, null, nomeBot) }, { quoted: msg })
        setTimeout(async () => {
          try { const meta = await sock.groupMetadata(jid); const mbs = meta.participants.map(pa => pa.id); if (!mbs.length) return; const g = mbs[Math.floor(Math.random() * mbs.length)]; await sock.sendMessage(jid, { text: msgSucesso("𝐕𝐄𝐍𝐂𝐄𝐃𝐎𝐑", "Sorteado!", `❄️ @${utils.soNumero(g)} • Prêmio: ${premio}`, null, nomeBot), mentions: [g] }) } catch (_) {}
        }, ms)
      }
    },

    modoparceria: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const parcerias = db.parcerias(); parcerias[jid] = parcerias[jid] || { ativo: false, parceiros: {} }
        const sub = (args[0] || "").toLowerCase(); if (sub === "on") parcerias[jid].ativo = true; else if (sub === "off") parcerias[jid].ativo = false; else parcerias[jid].ativo = !parcerias[jid].ativo
        db.salvarParcerias(parcerias); await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀", "Configurado.", `❄️ ${parcerias[jid].ativo ? "ON ✅" : "OFF ❌"}`, null, nomeBot) }, { quoted: msg })
      }
    },

    parceria: {
      aliases: ["pedirparceria", "quero parceria"], adminOnly: false, grupoOnly: true,
      async executar({ sock, msg, db, groupMetadata, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const numUser = utils.soNumero(msg.key.participant || msg.key.remoteJid)
        if (!groupMetadata) return; const admins = groupMetadata.participants.filter(pa => pa.admin === "admin" || pa.admin === "superadmin").map(pa => pa.id)
        if (admins.length === 0) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀", "Sem admin no grupo.", "Avise o dono", null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        let txt = `💧 • 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀 •\n\n❄️ @${numUser} pede aliança.\n\n🧊 Admins:\n`
        admins.forEach((a, i) => { txt += `🧊 ${i + 1}. @${utils.soNumero(a)}\n` })
        txt += `\n🧊 Use: \`${p}addparceria @${numUser} <qtd>\`\n\n"${nomeBot}"`
        await sock.sendMessage(jid, { text: txt, mentions: [msg.key.participant || msg.key.remoteJid, ...admins] }, { quoted: msg })
      }
    },

    adms: {
      aliases: ["admins", "chamaradm"],
      adminOnly: false, grupoOnly: true,
      async executar({ sock, msg, db, groupMetadata, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const numUser = utils.soNumero(msg.key.participant || msg.key.remoteJid)
        if (!groupMetadata) return; const admins = groupMetadata.participants.filter(pa => pa.admin === "admin" || pa.admin === "superadmin").map(pa => pa.id)
        if (admins.length === 0) { await reagir(sock, msg, "❄️"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐃𝐌𝐒", "Sem admin no grupo.", "Avise o dono", null, nomeBot) }, { quoted: msg }) }
        await reagir(sock, msg, "💧")
        let txt = `💧 • 𝐂𝐇𝐀𝐌𝐀𝐍𝐃𝐎 𝐀𝐃𝐌𝐈𝐍𝐒 •\n\n❄️ @${numUser} está chamando os administradores.\n\n🧊 Admins:\n`
        admins.forEach((a, i) => { txt += `🧊 ${i + 1}. @${utils.soNumero(a)}\n` })
        txt += `\n💡 _Aguarde o retorno de um deles._\n\n"${nomeBot}"`
        await sock.sendMessage(jid, { text: txt, mentions: [msg.key.participant || msg.key.remoteJid, ...admins] }, { quoted: msg })
      }
    },

    cadastrarparceria: {
      aliases: ["addgp", "cadastrargp"],
      async executar({ sock, msg, args, db, utils, sender, prefixoAtivo, groupMetadata }) {
        const jid = msg.key.remoteJid; 
        const nomeBot = nomeBotDb(db); 
        const p = prefixoAtivo || "+"; 
        const numUser = utils.soNumero(sender);
        const link = args[0];

        if (!link || !link.includes("chat.whatsapp.com/")) {
          await reagir(sock, msg, "❄️");
          return sock.sendMessage(jid, { text: `💧 • 𝐂𝐀𝐃𝐀𝐒𝐓𝐑𝐀𝐑 •\n\n❄️ Informe um link de grupo válido.\n🧊 Ex: \`${p}cadastrarparceria https://chat.whatsapp.com/...\`\n\n"${nomeBot}"` }, { quoted: msg })
        }

        const parcerias = db.parcerias();
        const pGrupo = parcerias[jid] || { ativo: true, parceiros: {} };
        pGrupo.parceiros = pGrupo.parceiros || {};

        const jaTem = Object.values(pGrupo.parceiros).some(info => info.link === link);
        if (jaTem) {
          await reagir(sock, msg, "🧊");
          return sock.sendMessage(jid, { text: `💧 • 𝐂𝐀𝐃𝐀𝐒𝐓𝐑𝐀𝐑 •\n\n❄️ Esse link já está cadastrado por alguém.\n\n"${nomeBot}"` }, { quoted: msg })
        }

        const userJid = sender;
        if (pGrupo.parceiros[userJid]) {
          pGrupo.parceiros[userJid].total += 5;
          pGrupo.parceiros[userJid].link = link;
        } else {
          pGrupo.parceiros[userJid] = { total: 5, usados: 0, link: link, desde: Date.now() };
        }

        db.salvarParcerias(parcerias);

        await reagir(sock, msg, "💧")
        await sock.sendMessage(jid, { text: `💧 • 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀 𝐂𝐀𝐃𝐀𝐒𝐓𝐑𝐀𝐃𝐀 •\n\n╭─〔 ❄️ 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ @${numUser}, seu link foi registrado!\n╰──────────────\n\n🧊 𝐁𝐨̂𝐧𝐮𝐬: +5 limites de links/dia\n🧊 𝐋𝐢𝐧𝐤: ${link}\n\n"${nomeBot}"`, mentions: [sender] }, { quoted: msg })

        // 🔥 AQUI ESTÁ A CORREÇÃO: Envia mensagem no PV de todos os admins do grupo
        if (groupMetadata) {
          const admins = groupMetadata.participants.filter(pa => pa.admin === "admin" || pa.admin === "superadmin").map(pa => pa.id);
          const nomeGrupo = groupMetadata.subject || "Grupo";
          
          for (const adminJid of admins) {
            if (utils.soNumero(adminJid) === utils.soNumero(sock.user.id)) continue;
            
            try {
              await sock.sendMessage(adminJid, { 
                text: `🚨 *NOVA PARCERIA CADASTRADA* 🚨\n\n👤 *Usuário:* @${numUser}\n👥 *Grupo:* ${nomeGrupo}\n🔗 *Link:* ${link}\n\n⚠️ *AÇÃO NECESSÁRIA:*\nChame o usuário no privado para combinar a divulgação e oficializar a parceria!\n\n"${nomeBot}"`,
                mentions: [sender]
              });
            } catch (err) {
              console.log("❌ Erro ao avisar admin no PV:", err.message)
            }
          }
        }
      }
    },

    vercadastrados: {
      aliases: ["cadastrados", "listaparcerias"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid;
        const nomeBot = nomeBotDb(db);
        const p = prefixoAtivo || "+";
        const parcerias = db.parcerias();
        const pGrupo = parcerias[jid] || { parceiros: {} };
        const parceiros = Object.entries(pGrupo.parceiros || {});

        if (!parceiros.length) {
          await reagir(sock, msg, "❄️");
          return sock.sendMessage(jid, { text: `💧 • 𝐂𝐀𝐃𝐀𝐒𝐓𝐑𝐀𝐃𝐎𝐒 •\n\n❄️ Nenhum grupo cadastrado.\n\n"${nomeBot}"` }, { quoted: msg });
        }

        let txt = `💧 • 𝐆𝐑𝐔𝐏𝐎𝐒 𝐂𝐀𝐃𝐀𝐒𝐓𝐑𝐀𝐃𝐎𝐒 •\n\n`;
        const mentions = [];
        let i = 1;
        for (const [userJid, info] of parceiros) {
          txt += `🧊 ${i}. @${utils.soNumero(userJid)}\n`;
          txt += `╰➜ Usados: ${info.usados}/${info.total}\n`;
          txt += `╰➜ Link: ${info.link}\n\n`;
          mentions.push(userJid);
          i++;
        }
        txt += `"${nomeBot}"`;
        
        await reagir(sock, msg, "💧");
        await sock.sendMessage(jid, { text: txt, mentions }, { quoted: msg });
      }
    }
  }
}