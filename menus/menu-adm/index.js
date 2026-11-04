/* ============================================================
   🍏 MENU ADM - APPLE GREEN EDITION
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

async function reagir(sock, msg, emoji) {
  try { await sock.sendMessage(msg.key.remoteJid, { react: { text: emoji, key: msg.key } }) } catch (_) {}
}

function nomeBotDb(db) { try { return db.config().nomeBot || "Bot" } catch { return "Bot" } }

function msgSucesso(titulo, aviso, detalhes, rodape, nomeBot) {
  return `🍏 • ${titulo} •\n\n🟢 ${aviso}\n\n💧 ${detalhes}\n\n${rodape ? rodape + "\n\n" : ""}🧊 "${nomeBot}"`
}
function msgAviso(titulo, aviso, detalhes, rodape, nomeBot) {
  return `💧 • ${titulo} •\n\n🧊 ${aviso}\n\n🍏 ${detalhes}\n\n${rodape ? rodape + "\n\n" : ""}🟢 "${nomeBot}"`
}
function msgErro(titulo, aviso, detalhes, rodape, nomeBot) {
  return `💨 • ${titulo} •\n\n🍏 ${aviso}\n\n🧊 ${detalhes}\n\n${rodape ? rodape + "\n\n" : ""}🟢 "${nomeBot}"`
}

function cabecalhoMenu(nomeBot, p) {
  return `╭━━━━━━━━━━━━━━━━━━━━━━╮
┃ 🍏 𝐀𝐃𝐌𝐈𝐍𝐈𝐒𝐓𝐑𝐀𝐂̧𝐀̃𝐎 🍏
┣━━━━━━━━━━━━━━━━━━━━━━┫
┃ 🟢 𝐁𝐨𝐭: ${nomeBot}
┃ 🧊 𝐏𝐫𝐞𝐟𝐢𝐱𝐨: ${p}
┃ 💧 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐎𝐧𝐥𝐢𝐧𝐞
╰━━━━━━━━━━━━━━━━━━━━━━╯`
}
function secao(t) { return `╭━━━━━〔 🍏 ${t} 🍏 〕━━━━━╮` }
function item(c) { return `┃ 🟢 ${c}` }
function fimSecao() { return `╰━━━━━━━━━━━━━━━━━━━━━━╯` }

module.exports = {
  menu: "menu-adm",
  grupoOnly: false,
  adminOnly: false,
  donoOnly: false,
  commands: {

    menuadmin: {
      aliases: ["menu-adm", "menua", "adm", "comandosadm"],
      async executar({ sock, msg, prefixoAtivo, db }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        const nomeBot = nomeBotDb(db)
        await reagir(sock, msg, "🍏")
        const texto = `${cabecalhoMenu(nomeBot, p)}

${secao("⚔️ 𝐌𝐎𝐃𝐄𝐑𝐀𝐂̧𝐀̃𝐎")}
${item(`${p}adv`)}
${item(`${p}deladv`)}
${item(`${p}listaadv`)}
${item(`${p}promover`)}
${item(`${p}rebaixar`)}
${item(`${p}ban`)}
${item(`${p}mute`)}
${item(`${p}desmute`)}
${item(`${p}p (reply)`)}
${item(`${p}totag <txt>`)}
${item(`${p}abrir`)}
${item(`${p}fechar`)}
${item(`${p}link`)}
${item(`${p}namegp`)}
${item(`${p}descricao`)}
${item(`${p}soadm on/off`)}
${fimSecao()}

${secao("🛡️ 𝐏𝐑𝐎𝐓𝐄𝐂̧𝐎̃𝐄𝐒")}
${item(`${p}antilink`)}
${item(`${p}antiaudio`)}
${item(`${p}antivideo`)}
${item(`${p}antifoto`)}
${item(`${p}antifig`)}
${item(`${p}anticall`)}
${item(`${p}palavrao on/off`)}
${item(`${p}addpalavra`)}
${item(`${p}rmpalavra`)}
${item(`${p}listapalavra`)}
${fimSecao()}

${secao("👑 𝐒𝐔𝐁-𝐀𝐃𝐌𝐈𝐍𝐒")}
${item(`${p}subadm`)}
${item(`${p}delsubadm`)}
${item(`${p}listasubadm`)}
${fimSecao()}

${secao("⚙️ 𝐏𝐑𝐄𝐅𝐈𝐗𝐎")}
${item(`${p}multiprefixo on/off`)}
${item(`${p}setprefixo <novo>`)}
${fimSecao()}

${secao("🕵️ 𝐗𝟗")}
${item(`${p}x9 on/off`)}
${fimSecao()}

${secao("🚫 𝐋𝐈𝐒𝐓𝐀 𝐍𝐄𝐆𝐑𝐀")}
${item(`${p}listanegra <núm>`)}
${item(`${p}blacklist`)}
${item(`${p}dellista <núm>`)}
${fimSecao()}

${secao("👋 𝐁𝐄𝐌-𝐕𝐈𝐍𝐃𝐎")}
${item(`${p}bemvindo on/off`)}
${item(`${p}textobv`)}
${item(`${p}fundobv`)}
${item(`${p}legendasaiu`)}
${item(`${p}fundosaiu`)}
${item(`${p}verbv (testar)`)}
${item(`${p}limparfotos`)}
${fimSecao()}

${secao("⏰ 𝐀𝐆𝐄𝐍𝐃𝐀𝐌𝐄𝐍𝐓𝐎")}
${item(`${p}abrirgp`)}
${item(`${p}fechargp hh:mm`)}
${item(`${p}fotoabrir`)}
${item(`${p}fotofechar`)}
${item(`${p}legendaabrir`)}
${item(`${p}legendafechar`)}
${fimSecao()}

${secao("🤝 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀")}
${item(`${p}modoparceria on/off`)}
${item(`${p}addparceria @user <qtd>`)}
${item(`${p}delparceria @user`)}
${item(`${p}parcerias`)}
${fimSecao()}

${secao("🎴 𝐅𝐈𝐆𝐔𝐑𝐈𝐍𝐇𝐀𝐒")}
${item(`${p}rgfig <cmd> (reply)`)}
${item(`${p}rmfig (reply)`)}
${item(`${p}listafig`)}
${fimSecao()}

🍏 𝐏𝐫𝐞𝐟𝐢𝐱𝐨: \`${p}\`
🟢 _"Sistema de moderação."_
🧊 "${nomeBot}"`
        const cfg = db.config() || {}
        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          try {
            if (cfg.tipoMenu === "video") return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "menu.mp4", gifPlayback: true, caption: texto }, { quoted: msg })
            return sock.sendMessage(jid, { image: buf, caption: texto }, { quoted: msg })
          } catch (e) { return sock.sendMessage(jid, { text: texto }, { quoted: msg }) }
        }
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },p: {
  aliases: ["apagar", "delmsg"], adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, prefixoAtivo, groupMetadata, utils, db }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo
    if (!ctx || !ctx.stanzaId) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐏𝐀𝐆𝐀𝐑", "Responda uma mensagem.", `Use \`${p}p\` reply`, null, nomeBot) }, { quoted: msg }) }
    if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "Promova o bot", null, nomeBot) }, { quoted: msg }) }
    try { await sock.sendMessage(jid, { delete: { remoteJid: jid, fromMe: false, id: ctx.stanzaId, participant: ctx.participant || (ctx.mentionedJid && ctx.mentionedJid[0]) } }); await reagir(sock, msg, "🍏"); await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐏𝐀𝐆𝐀𝐃𝐀", "Mensagem removida.", "🍏 Concluído", null, nomeBot) }, { quoted: msg }) } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: "💧 " + e.message }, { quoted: msg }) }
  }
},

abrir: {
  aliases: ["opennow"], adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, groupMetadata, utils, db }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
    if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "Promova o bot", null, nomeBot) }, { quoted: msg }) }
    try { await sock.groupSettingUpdate(jid, "not_announcement"); await reagir(sock, msg, "🍏"); await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐁𝐄𝐑𝐓𝐎", "Grupo aberto.", "🍏 Todos podem falar", null, nomeBot) }, { quoted: msg }) } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: "💧 " + e.message }, { quoted: msg }) }
  }
},

fechar: {
  aliases: ["closenow"], adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, groupMetadata, utils, db }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
    if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "Promova o bot", null, nomeBot) }, { quoted: msg }) }
    try { await sock.groupSettingUpdate(jid, "announcement"); await reagir(sock, msg, "🍏"); await sock.sendMessage(jid, { text: msgSucesso("𝐅𝐄𝐂𝐇𝐀𝐃𝐎", "Grupo fechado.", "🍏 Só admins falam", null, nomeBot) }, { quoted: msg }) } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: "💧 " + e.message }, { quoted: msg }) }
  }
},

namegp: {
  aliases: ["setnomegp", "nomegrupo"], adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, args, prefixoAtivo, groupMetadata, utils, db }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const nome = args.join(" ").trim()
    if (!nome) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐍𝐎𝐌𝐄", "Informe o nome.", `\`${p}namegp <nome>\``, null, nomeBot) }, { quoted: msg }) }
    if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "Promova o bot", null, nomeBot) }, { quoted: msg }) }
    try { await sock.groupUpdateSubject(jid, nome); await reagir(sock, msg, "🍏"); await sock.sendMessage(jid, { text: msgSucesso("𝐍𝐎𝐌𝐄", "Nome alterado.", `🍏 ${nome}`, null, nomeBot) }, { quoted: msg }) } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: "💧 " + e.message }, { quoted: msg }) }
  }
},

descricao: {
  aliases: ["setdescricao", "descgp"], adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, args, prefixoAtivo, groupMetadata, utils, db }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const desc = args.join(" ").trim()
    if (!desc) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐃𝐄𝐒𝐂𝐑𝐈𝐂̧𝐀̃𝐎", "Informe o texto.", `\`${p}descricao <texto>\``, null, nomeBot) }, { quoted: msg }) }
    if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "Promova o bot", null, nomeBot) }, { quoted: msg }) }
    try { await sock.groupUpdateDescription(jid, desc); await reagir(sock, msg, "🍏"); await sock.sendMessage(jid, { text: msgSucesso("𝐃𝐄𝐒𝐂𝐑𝐈𝐂̧𝐀̃𝐎", "Descrição alterada.", "🍏 Texto salvo", null, nomeBot) }, { quoted: msg }) } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: "💧 " + e.message }, { quoted: msg }) }
  }
},

link: {
  aliases: ["linkgp"], adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, groupMetadata, utils, db }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
    if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "Promova o bot", null, nomeBot) }, { quoted: msg }) }
    try { const code = await sock.groupInviteCode(jid); await reagir(sock, msg, "🍏"); await sock.sendMessage(jid, { text: msgSucesso("𝐋𝐈𝐍𝐊", "Link gerado.", `🍏 https://chat.whatsapp.com/${code}`, null, nomeBot) }, { quoted: msg }) } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: "💧 " + e.message }, { quoted: msg }) }
  }
},

mute: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, prefixoAtivo, utils, db }) {
    const jid = msg.key.remoteJid; const alvo = utils.getAlvo(msg); const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
    if (!alvo) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐌𝐔𝐓𝐄", "Marque alguém.", `\`${p}mute @user\``, null, nomeBot) }, { quoted: msg }) }
    const ctx = msg.message?.extendedTextMessage?.contextInfo
    if (ctx && ctx.participant === alvo) { await sock.sendMessage(jid, { delete: { remoteJid: jid, fromMe: false, id: ctx.stanzaId, participant: alvo } }) }
    const mutados = dbLer("mutados.json", {}); mutados[jid] = mutados[jid] || {}; mutados[jid][utils.soNumero(alvo)] = Date.now() + 5 * 60 * 1000; dbSalvar("mutados.json", mutados)
    await reagir(sock, msg, "🍏")
    await sock.sendMessage(jid, { text: msgSucesso("𝐌𝐔𝐓𝐀𝐃𝐎", "Silenciado por 5min.", `🍏 @${utils.soNumero(alvo)}`, null, nomeBot), mentions: [alvo] }, { quoted: msg })
  }
},

desmute: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, prefixoAtivo, utils, db }) {
    const jid = msg.key.remoteJid; const alvo = utils.getAlvo(msg); const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
    if (!alvo) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐃𝐄𝐒𝐌𝐔𝐓𝐄", "Marque alguém.", `\`${p}desmute @user\``, null, nomeBot) }, { quoted: msg }) }
    const mutados = dbLer("mutados.json", {}); if (mutados[jid] && mutados[jid][utils.soNumero(alvo)]) { delete mutados[jid][utils.soNumero(alvo)]; dbSalvar("mutados.json", mutados) }
    await reagir(sock, msg, "🍏")
    await sock.sendMessage(jid, { text: msgSucesso("𝐋𝐈𝐁𝐄𝐑𝐀𝐃𝐎", "Pode falar.", `🍏 @${utils.soNumero(alvo)}`, null, nomeBot), mentions: [alvo] }, { quoted: msg })
  }
},promover: {
  aliases: ["promote", "daradm"], adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, groupMetadata, utils, db, prefixoAtivo }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const alvoRaw = utils.getAlvo(msg)
    if (!alvoRaw) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐏𝐑𝐎𝐌𝐎𝐕𝐄𝐑", "Marque alguém.", `\`${p}promover @user\``, null, nomeBot) }, { quoted: msg }) }
    if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "Promova o bot", null, nomeBot) }, { quoted: msg }) }
    const n = utils.soNumero(alvoRaw); const part = groupMetadata.participants.find(pa => [pa.id, pa.lid, pa.phoneNumber].filter(Boolean).map(utils.soNumero).includes(n))
    if (!part) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgErro("𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎", "Usuário fora do grupo.", `@${n}`, null, nomeBot) }, { quoted: msg }) }
    try { await sock.groupParticipantsUpdate(jid, [part.id], "promote"); await reagir(sock, msg, "🍏"); await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐑𝐎𝐌𝐎𝐕𝐈𝐃𝐎", "Virou admin.", `🍏 @${n}`, null, nomeBot), mentions: [part.id] }, { quoted: msg }) } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: "💧 " + e.message }, { quoted: msg }) }
  }
},

rebaixar: {
  aliases: ["demote", "tiraradm"], adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, groupMetadata, utils, db, prefixoAtivo }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const alvoRaw = utils.getAlvo(msg)
    if (!alvoRaw) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐄𝐁𝐀𝐈𝐗𝐀𝐑", "Marque alguém.", `\`${p}rebaixar @user\``, null, nomeBot) }, { quoted: msg }) }
    if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "Promova o bot", null, nomeBot) }, { quoted: msg }) }
    const n = utils.soNumero(alvoRaw); const part = groupMetadata.participants.find(pa => [pa.id, pa.lid, pa.phoneNumber].filter(Boolean).map(utils.soNumero).includes(n))
    if (!part) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgErro("𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎", "Usuário fora do grupo.", `@${n}`, null, nomeBot) }, { quoted: msg }) }
    try { await sock.groupParticipantsUpdate(jid, [part.id], "demote"); await reagir(sock, msg, "🍏"); await sock.sendMessage(jid, { text: msgSucesso("𝐑𝐄𝐁𝐀𝐈𝐗𝐀𝐃𝐎", "Perdeu admin.", `🍏 @${n}`, null, nomeBot), mentions: [part.id] }, { quoted: msg }) } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: "💧 " + e.message }, { quoted: msg }) }
  }
},

ban: {
  aliases: ["kick", "remover"], adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, groupMetadata, utils, db, prefixoAtivo }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const alvoRaw = utils.getAlvo(msg)
    if (!alvoRaw) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐁𝐀𝐍𝐈𝐑", "Marque alguém.", `\`${p}ban @user\``, null, nomeBot) }, { quoted: msg }) }
    if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Eu (o bot) preciso ser admin.", "Promova o bot", null, nomeBot) }, { quoted: msg }) }
    const n = utils.soNumero(alvoRaw)
    const part = groupMetadata.participants.find(pa => { const pIds = [pa.id, pa.lid, pa.phoneNumber].filter(Boolean).map(utils.soNumero); return pIds.includes(n) })
    if (!part) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgErro("𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎", "Usuário fora do grupo.", `@${n}`, null, nomeBot) }, { quoted: msg }) }
    try { await sock.groupParticipantsUpdate(jid, [part.id], "remove"); await reagir(sock, msg, "🍏"); await sock.sendMessage(jid, { text: msgSucesso("𝐄𝐗𝐏𝐔𝐋𝐒𝐎", "Usuário removido.", `🍏 @${n}`, null, nomeBot), mentions: [part.id] }, { quoted: msg }) } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: "💧 " + e.message }, { quoted: msg }) }
  }
},

adv: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, args, db, utils, prefixoAtivo }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const alvo = utils.getAlvo(msg)
    if (!alvo) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐃𝐕𝐄𝐑𝐓𝐈𝐑", "Marque alguém.", `\`${p}adv @user <motivo>\``, null, nomeBot) }, { quoted: msg }) }
    const motivo = args.filter(a => !a.includes("@")).join(" ") || "Sem motivo"
    const advs = db.advs(); advs[jid] = advs[jid] || {}; advs[jid][alvo] = (advs[jid][alvo] || 0) + 1; const total = advs[jid][alvo]; const n = utils.soNumero(alvo)
    if (total >= 3) { delete advs[jid][alvo]; db.salvarAdvs(advs); await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐋𝐈𝐌𝐈𝐓𝐄", "3/3 atingido. Removido.", `🍏 @${n} • ${motivo}`, null, nomeBot), mentions: [alvo] }, { quoted: msg }); try { await sock.groupParticipantsUpdate(jid, [alvo], "remove") } catch (_) {}; return }
    db.salvarAdvs(advs); await reagir(sock, msg, "🍏")
    await sock.sendMessage(jid, { text: msgAviso("𝐀𝐃𝐕𝐄𝐑𝐓𝐈𝐃𝐎", "Advertência aplicada.", `🍏 @${n} • ${total}/3`, null, nomeBot), mentions: [alvo] }, { quoted: msg })
  }
},

deladv: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, db, utils, prefixoAtivo }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const alvo = utils.getAlvo(msg)
    if (!alvo) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐄𝐌𝐎𝐕𝐄𝐑 𝐀𝐃𝐕", "Marque alguém.", `\`${p}deladv @user\``, null, nomeBot) }, { quoted: msg }) }
    const advs = db.advs(); const atual = (advs[jid] && advs[jid][alvo]) || 0
    if (atual <= 0) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgSucesso("𝐅𝐈𝐂𝐇𝐀 𝐋𝐈𝐌𝐏𝐀", "Sem advertências.", `🍏 @${utils.soNumero(alvo)}`, null, nomeBot), mentions: [alvo] }, { quoted: msg }) }
    advs[jid][alvo] = atual - 1; if (advs[jid][alvo] === 0) delete advs[jid][alvo]; db.salvarAdvs(advs); await reagir(sock, msg, "🍏")
    await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐃𝐕 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐀", "Advertência removida.", `🍏 @${utils.soNumero(alvo)} • ${(advs[jid] && advs[jid][alvo]) || 0}/3`, null, nomeBot), mentions: [alvo] }, { quoted: msg })
  }
},

listaadv: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, db, utils }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const entradas = Object.entries(db.advs()[jid] || {})
    if (!entradas.length) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐒𝐓𝐀 𝐕𝐀𝐙𝐈𝐀", "Sem advertências.", "Use `+adv`", null, nomeBot) }, { quoted: msg }) }
    entradas.sort((a, b) => b[1] - a[1]); let t = "💧 • 𝐀𝐃𝐕𝐄𝐑𝐓𝐄̂𝐍𝐂𝐈𝐀𝐒 •\n\n🍏 Lista:\n\n"
    entradas.forEach(([j, q], i) => { t += `🍏 ${i + 1}. @${utils.soNumero(j)} — ${q}/3\n` }); t += `\n🟢 Total: ${entradas.length}\n\n"${nomeBot}"`
    await reagir(sock, msg, "🍏"); await sock.sendMessage(jid, { text: t, mentions: entradas.map(e => e[0]) }, { quoted: msg })
  }
},

totag: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, args, groupMetadata, prefixoAtivo }) {
    const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; let texto = args.join(" ").trim()
    if (!texto) { const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const q = ctx.quotedMessage; if (q) texto = q.conversation || (q.extendedTextMessage && q.extendedTextMessage.text) || (q.imageMessage && q.imageMessage.caption) || "" }
    if (!texto) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `💧 \`${p}totag <texto>\`` }, { quoted: msg }) }
    const mentions = groupMetadata.participants.map(pa => pa.id); await reagir(sock, msg, "🍏"); await sock.sendMessage(jid, { text: texto, mentions }, { quoted: msg })
  }
},palavrao: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, args, prefixoAtivo, db }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
    if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐏𝐀𝐋𝐀𝐕𝐑𝐀̃𝐎", "Use on/off.", `\`${p}palavrao on/off\``, null, nomeBot) }, { quoted: msg }) }
    const cfg = dbLer("admsettings.json", {}); cfg[jid] = cfg[jid] || {}; cfg[jid].antipalavrao = opcao === "on"; dbSalvar("admsettings.json", cfg)
    await reagir(sock, msg, "🍏"); await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐀𝐋𝐀𝐕𝐑𝐀̃𝐎", "Filtro configurado.", `🍏 ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
  }
},

addpalavra: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, args, prefixoAtivo, db }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const palavra = args.join(" ").trim().toLowerCase()
    if (!palavra) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐃𝐈𝐂𝐈𝐎𝐍𝐀𝐑", "Informe a palavra.", `\`${p}addpalavra <p>\``, null, nomeBot) }, { quoted: msg }) }
    const pal = dbLer("palavroes.json", {}); pal[jid] = pal[jid] || []
    if (pal[jid].includes(palavra)) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐉𝐀́ 𝐄𝐗𝐈𝐒𝐓𝐄", "Palavra na lista.", `🍏 ${palavra}`, null, nomeBot) }, { quoted: msg }) }
    pal[jid].push(palavra); dbSalvar("palavroes.json", pal); await reagir(sock, msg, "🍏")
    await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐃𝐈𝐂𝐈𝐎𝐍𝐀𝐃𝐀", "Palavra proibida.", `🍏 ${palavra}`, null, nomeBot) }, { quoted: msg })
  }
},

rmpalavra: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, args, prefixoAtivo, db }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const palavra = args.join(" ").trim().toLowerCase()
    if (!palavra) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐄𝐌𝐎𝐕𝐄𝐑", "Informe a palavra.", `\`${p}rmpalavra <p>\``, null, nomeBot) }, { quoted: msg }) }
    const pal = dbLer("palavroes.json", {}); const arr = pal[jid] || []; const idx = arr.indexOf(palavra)
    if (idx === -1) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐀", "Palavra fora da lista.", `🍏 ${palavra}`, null, nomeBot) }, { quoted: msg }) }
    arr.splice(idx, 1); pal[jid] = arr; dbSalvar("palavroes.json", pal); await reagir(sock, msg, "🍏")
    await sock.sendMessage(jid, { text: msgSucesso("𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐀", "Palavra liberada.", `🍏 ${palavra}`, null, nomeBot) }, { quoted: msg })
  }
},

listapalavra: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, prefixoAtivo, db }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const lista = dbLer("palavroes.json", {})[jid] || []
    if (!lista.length) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐒𝐓𝐀 𝐕𝐀𝐙𝐈𝐀", "Nenhuma palavra.", `Use \`${p}addpalavra\``, null, nomeBot) }, { quoted: msg }) }
    let t = "💧 • 𝐏𝐀𝐋𝐀𝐕𝐑𝐀𝐒 •\n\n🍏 Lista:\n\n"; lista.forEach((pal, i) => { t += `🍏 ${i + 1}. \`${pal}\`\n` }); t += `\n🟢 Total: ${lista.length}\n\n"${nomeBot}"`
    await reagir(sock, msg, "🍏"); await sock.sendMessage(jid, { text: t }, { quoted: msg })
  }
},

antilink: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, args, prefixoAtivo, db }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
    if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐍𝐓𝐈𝐋𝐈𝐍𝐊", "Use on/off.", `\`${p}antilink on/off\``, null, nomeBot) }, { quoted: msg }) }
    const cfg = dbLer("admsettings.json", {}); cfg[jid] = cfg[jid] || {}; cfg[jid].antilink = opcao === "on"; dbSalvar("admsettings.json", cfg)
    await reagir(sock, msg, "🍏"); await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐍𝐓𝐈𝐋𝐈𝐍𝐊", "Proteção atualizada.", `🍏 ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
  }
},

antiaudio: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, args, prefixoAtivo, db }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
    if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐍𝐓𝐈𝐀́𝐔𝐃𝐈𝐎", "Use on/off.", `\`${p}antiaudio on/off\``, null, nomeBot) }, { quoted: msg }) }
    const cfg = dbLer("admsettings.json", {}); cfg[jid] = cfg[jid] || {}; cfg[jid].antiaudio = opcao === "on"; dbSalvar("admsettings.json", cfg)
    await reagir(sock, msg, "🍏"); await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐍𝐓𝐈𝐀́𝐔𝐃𝐈𝐎", "Proteção atualizada.", `🍏 ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
  }
},

antivideo: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, args, prefixoAtivo, db }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
    if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐍𝐓𝐈𝐕𝐈́𝐃𝐄𝐎", "Use on/off.", `\`${p}antivideo on/off\``, null, nomeBot) }, { quoted: msg }) }
    const cfg = dbLer("admsettings.json", {}); cfg[jid] = cfg[jid] || {}; cfg[jid].antivideo = opcao === "on"; dbSalvar("admsettings.json", cfg)
    await reagir(sock, msg, "🍏"); await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐍𝐓𝐈𝐕𝐈́𝐃𝐄𝐎", "Proteção atualizada.", `🍏 ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
  }
},

antifoto: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, args, prefixoAtivo, db }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
    if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐍𝐓𝐈𝐅𝐎𝐓𝐎", "Use on/off.", `\`${p}antifoto on/off\``, null, nomeBot) }, { quoted: msg }) }
    const cfg = dbLer("admsettings.json", {}); cfg[jid] = cfg[jid] || {}; cfg[jid].antifoto = opcao === "on"; dbSalvar("admsettings.json", cfg)
    await reagir(sock, msg, "🍏"); await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐍𝐓𝐈𝐅𝐎𝐓𝐎", "Proteção atualizada.", `🍏 ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
  }
},

antifig: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, args, prefixoAtivo, db }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
    if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐍𝐓𝐈𝐅𝐈𝐆", "Use on/off.", `\`${p}antifig on/off\``, null, nomeBot) }, { quoted: msg }) }
    const cfg = dbLer("admsettings.json", {}); cfg[jid] = cfg[jid] || {}; cfg[jid].antisticker = opcao === "on"; dbSalvar("admsettings.json", cfg)
    await reagir(sock, msg, "🍏"); await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐍𝐓𝐈𝐅𝐈𝐆", "Proteção atualizada.", `🍏 ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
  }
},

anticall: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, args, prefixoAtivo, db }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
    if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐍𝐓𝐈𝐂𝐀𝐋𝐋", "Use on/off.", `\`${p}anticall on/off\``, null, nomeBot) }, { quoted: msg }) }
    const cfg = dbLer("admsettings.json", {}); cfg[jid] = cfg[jid] || {}; cfg[jid].anticall = opcao === "on"; dbSalvar("admsettings.json", cfg)
    await reagir(sock, msg, "🍏"); await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐍𝐓𝐈𝐂𝐀𝐋𝐋", "Proteção atualizada.", `🍏 ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
  }
},subadm: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, db, utils, prefixoAtivo }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const alvo = utils.getAlvo(msg)
    if (!alvo) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐒𝐔𝐁-𝐀𝐃𝐌", "Marque alguém.", `\`${p}subadm @user\``, null, nomeBot) }, { quoted: msg }) }
    const subs = dbLer("subadmins.json", {}); subs[jid] = subs[jid] || []
    if (subs[jid].some(s => utils.soNumero(s) === utils.soNumero(alvo))) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐉𝐀́ 𝐄́", "Já é Sub-Adm.", `🍏 @${utils.soNumero(alvo)}`, null, nomeBot) }, { quoted: msg }) }
    subs[jid].push(alvo); dbSalvar("subadmins.json", subs); await reagir(sock, msg, "🍏")
    await sock.sendMessage(jid, { text: msgSucesso("𝐒𝐔𝐁-𝐀𝐃𝐌", "Virou Sub-Adm.", `🍏 @${utils.soNumero(alvo)}`, null, nomeBot), mentions: [alvo] }, { quoted: msg })
  }
},

delsubadm: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, db, utils, prefixoAtivo }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const alvo = utils.getAlvo(msg)
    if (!alvo) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐄𝐌𝐎𝐕𝐄𝐑", "Marque alguém.", `\`${p}delsubadm @user\``, null, nomeBot) }, { quoted: msg }) }
    const subs = dbLer("subadmins.json", {}); subs[jid] = (subs[jid] || []).filter(s => utils.soNumero(s) !== utils.soNumero(alvo)); dbSalvar("subadmins.json", subs); await reagir(sock, msg, "🍏")
    await sock.sendMessage(jid, { text: msgSucesso("𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐎", "Não é mais Sub-Adm.", `🍏 @${utils.soNumero(alvo)}`, null, nomeBot), mentions: [alvo] }, { quoted: msg })
  }
},

listasubadm: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, db, utils, prefixoAtivo }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const subs = dbLer("subadmins.json", {})[jid] || []
    if (!subs.length) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐒𝐓𝐀 𝐕𝐀𝐙𝐈𝐀", "Sem Sub-Admins.", `Use \`${p}subadm\``, null, nomeBot) }, { quoted: msg }) }
    let t = "💧 • 𝐒𝐔𝐁-𝐀𝐃𝐌𝐈𝐍𝐒 •\n\n🍏 Lista:\n\n"; subs.forEach((s, i) => { t += `🍏 ${i + 1}. @${utils.soNumero(s)}\n` }); t += `\n🟢 Total: ${subs.length}\n\n"${nomeBot}"`
    await reagir(sock, msg, "🍏"); await sock.sendMessage(jid, { text: t, mentions: subs }, { quoted: msg })
  }
},

soadm: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, args, prefixoAtivo, db }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
    if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐒𝐎 𝐀𝐃𝐌", "Use on/off.", `\`${p}soadm on/off\``, null, nomeBot) }, { quoted: msg }) }
    const cfg = dbLer("admsettings.json", {}); cfg[jid] = cfg[jid] || {}; cfg[jid].soadm = opcao === "on"; dbSalvar("admsettings.json", cfg)
    await reagir(sock, msg, "🍏"); await sock.sendMessage(jid, { text: msgSucesso("𝐒𝐎 𝐀𝐃𝐌", "Configurado.", `🍏 ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
  }
},

multiprefixo: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, args, db, prefixoAtivo }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
    if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐌𝐔𝐋𝐓𝐈𝐏𝐑𝐄𝐅𝐈𝐗𝐎", "Use on/off.", `\`${p}multiprefixo on/off\``, null, nomeBot) }, { quoted: msg }) }
    const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].multiprefixo = opcao === "on"; db.salvarGrupos(g); await reagir(sock, msg, "🍏")
    await sock.sendMessage(jid, { text: msgSucesso("𝐌𝐔𝐋𝐓𝐈𝐏𝐑𝐄𝐅𝐈𝐗𝐎", "Configurado.", `🍏 ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
  }
},

setprefixo: {
  aliases: ["setprefix", "trocarp"], adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, args, db, prefixoAtivo }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const g = db.grupos(); const conf = g[jid] || {}
    if (!conf.multiprefixo) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐌𝐔𝐋𝐓𝐈𝐏𝐑𝐄𝐅𝐈𝐗𝐎 𝐎𝐅𝐅", "Ative primeiro.", `\`${p}multiprefixo on\``, null, nomeBot) }, { quoted: msg }) }
    const novo = args[0]
    if (!novo) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐒𝐄𝐓𝐏𝐑𝐄𝐅𝐈𝐗𝐎", "Informe o prefixo.", `\`${p}setprefixo <s>\``, null, nomeBot) }, { quoted: msg }) }
    if (novo.length > 3) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgErro("𝐋𝐎𝐍𝐆𝐎", "Máximo 3 caracteres.", `🍏 ${novo}`, null, nomeBot) }, { quoted: msg }) }
    g[jid].prefixo = novo; db.salvarGrupos(g); await reagir(sock, msg, "🍏")
    await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐑𝐄𝐅𝐈𝐗𝐎", "Alterado.", `🍏 \`${novo}\``, null, nomeBot) }, { quoted: msg })
  }
},

x9: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, args, prefixoAtivo, db }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
    if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐗𝟗", "Use on/off.", `\`${p}x9 on/off\``, null, nomeBot) }, { quoted: msg }) }
    const cfg = dbLer("admsettings.json", {}); cfg[jid] = cfg[jid] || {}; cfg[jid].x9 = opcao === "on"; dbSalvar("admsettings.json", cfg)
    await reagir(sock, msg, "🍏"); await sock.sendMessage(jid, { text: msgSucesso("𝐗𝟗", "Espionagem configurada.", `🍏 ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
  }
},

listanegra: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, args, db, groupMetadata, utils, prefixoAtivo }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const numero = (args[0] || "").replace(/\D/g, "")
    if (!numero || numero.length < 8) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐒𝐓𝐀 𝐍𝐄𝐆𝐑𝐀", "Informe o número.", `\`${p}listanegra <núm>\``, null, nomeBot) }, { quoted: msg }) }
    const lista = dbLer("blacklist.json", {}); lista[jid] = lista[jid] || []
    if (lista[jid].includes(numero)) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐉𝐀́ 𝐍𝐀 𝐋𝐈𝐒𝐓𝐀", "Número já marcado.", `🍏 +${numero}`, null, nomeBot) }, { quoted: msg }) }
    lista[jid].push(numero); dbSalvar("blacklist.json", lista); await reagir(sock, msg, "🍏")
    await sock.sendMessage(jid, { text: msgSucesso("𝐍𝐔́𝐌𝐄𝐑𝐎", "Marcado na lista negra.", `🍏 +${numero}`, null, nomeBot) }, { quoted: msg })
    try { const part = groupMetadata && groupMetadata.participants.find(pa => [pa.id, pa.lid, pa.phoneNumber].filter(Boolean).map(utils.soNumero).includes(numero)); if (part) { await sock.groupParticipantsUpdate(jid, [part.id], "remove"); await sock.sendMessage(jid, { text: msgSucesso("𝐄𝐗𝐏𝐔𝐋𝐒𝐎", "Removido automaticamente.", `🍏 @${numero}`, null, nomeBot), mentions: [part.id] }) } } catch (_) {}
  }
},

blacklist: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, prefixoAtivo }) {
    const jid = msg.key.remoteJid; const nomeBot = "Bot"; const p = prefixoAtivo || "+"; const lista = (dbLer("blacklist.json", {})[jid] || [])
    if (!lista.length) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐒𝐓𝐀 𝐕𝐀𝐙𝐈𝐀", "Sem números.", `Use \`${p}listanegra\``, null, nomeBot) }, { quoted: msg }) }
    let t = "💧 • 𝐁𝐋𝐀𝐂𝐊𝐋𝐈𝐒𝐓 •\n\n🍏 Lista:\n\n"; lista.forEach((n, i) => { t += `🍏 ${i + 1}. +${n}\n` }); t += `\n🟢 Total: ${lista.length}\n\n"${nomeBot}"`
    await reagir(sock, msg, "🍏"); await sock.sendMessage(jid, { text: t }, { quoted: msg })
  }
},

dellista: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, args, prefixoAtivo }) {
    const jid = msg.key.remoteJid; const nomeBot = "Bot"; const p = prefixoAtivo || "+"; const numero = (args[0] || "").replace(/\D/g, "")
    if (!numero) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐃𝐄𝐋𝐋𝐈𝐒𝐓𝐀", "Informe o número.", `\`${p}dellista <núm>\``, null, nomeBot) }, { quoted: msg }) }
    const lista = dbLer("blacklist.json", {}); const arr = lista[jid] || []; const idx = arr.indexOf(numero)
    if (idx === -1) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎", "Número fora da lista.", `🍏 +${numero}`, null, nomeBot) }, { quoted: msg }) }
    arr.splice(idx, 1); lista[jid] = arr; dbSalvar("blacklist.json", lista); await reagir(sock, msg, "🍏")
    await sock.sendMessage(jid, { text: msgSucesso("𝐍𝐔́𝐌𝐄𝐑𝐎", "Removido da lista.", `🍏 +${numero}`, null, nomeBot) }, { quoted: msg })
  }
},bemvindo: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, args, db, prefixoAtivo }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
    if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐁𝐄𝐌-𝐕𝐈𝐍𝐃𝐎", "Use on/off.", `\`${p}bemvindo on/off\``, null, nomeBot) }, { quoted: msg }) }
    const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].bemvindo = opcao === "on"; db.salvarGrupos(g); await reagir(sock, msg, "🍏")
    await sock.sendMessage(jid, { text: msgSucesso("𝐁𝐄𝐌-𝐕𝐈𝐍𝐃𝐎", "Configurado.", `🍏 ${opcao.toUpperCase()}`, null, nomeBot) }, { quoted: msg })
  }
},

textobv: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, args, db, prefixoAtivo }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const t = args.join(" ").trim()
    if (!t) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐓𝐄𝐗𝐓𝐎", "Informe o texto.", `\`${p}textobv <txt>\` (%nmr%)`, null, nomeBot) }, { quoted: msg }) }
    const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].textobv = t; db.salvarGrupos(g); await reagir(sock, msg, "🍏")
    await sock.sendMessage(jid, { text: msgSucesso("𝐓𝐄𝐗𝐓𝐎", "Salvo.", `🍏 ${t}`, null, nomeBot) }, { quoted: msg })
  }
},

fundobv: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, db, utils, prefixoAtivo }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const quoted = ctx.quotedMessage
    const tem = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage)
    if (!tem) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐅𝐔𝐍𝐃𝐎", "Responda uma imagem.", `\`${p}fundobv\` (reply)`, null, nomeBot) }, { quoted: msg }) }
    const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage } })
    const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
    const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].fundobv = buffer.toString("base64"); db.salvarGrupos(g); await reagir(sock, msg, "🍏")
    await sock.sendMessage(jid, { image: buffer, caption: msgSucesso("𝐅𝐔𝐍𝐃𝐎", "Imagem salva.", "🍏 Aplicada ao grupo", null, nomeBot) }, { quoted: msg })
  }
},

legendasaiu: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, args, db, prefixoAtivo }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const t = args.join(" ").trim()
    if (!t) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀", "Informe o texto.", `\`${p}legendasaiu <txt>\` (%nmr%)`, null, nomeBot) }, { quoted: msg }) }
    const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].legendasaiu = t; db.salvarGrupos(g); await reagir(sock, msg, "🍏")
    await sock.sendMessage(jid, { text: msgSucesso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀", "Salva.", `🍏 ${t}`, null, nomeBot) }, { quoted: msg })
  }
},

fundosaiu: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, db, utils, prefixoAtivo }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const quoted = ctx.quotedMessage
    const tem = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage)
    if (!tem) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐅𝐔𝐍𝐃𝐎", "Responda uma imagem.", `\`${p}fundosaiu\` (reply)`, null, nomeBot) }, { quoted: msg }) }
    const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage } })
    const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
    const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].fundosaiu = buffer.toString("base64"); db.salvarGrupos(g); await reagir(sock, msg, "🍏")
    await sock.sendMessage(jid, { image: buffer, caption: msgSucesso("𝐅𝐔𝐍𝐃𝐎", "Imagem salva.", "🍏 Aplicada ao grupo", null, nomeBot) }, { quoted: msg })
  }
},

verbv: {
  aliases: ["testebv", "verbemvindo"], adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, db }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
    const g = db.grupos(); const conf = g[jid] || {}
    const meta = await sock.groupMetadata(jid).catch(()=>null)
    const nomeGrupo = meta?.subject || "o grupo"
    const numTeste = "5511999999999"
    const textoPadrao = `💧 Bem-vindo(a) ao grupo, @${numTeste}!\n\n🟢 Leia as regras e aproveite.\n\n_"${nomeBot}"_`
    const textoFinal = (conf.textobv && conf.textobv.trim()) ? conf.textobv.replace(/%nmr%/g, '@' + numTeste).replace(/%grupo%/g, nomeGrupo) : textoPadrao
    await reagir(sock, msg, "🍏")
    try {
      if (conf.fundobv) {
        const buf = Buffer.from(conf.fundobv, 'base64')
        await sock.sendMessage(jid, { image: buf, caption: `🍏 *[TESTE DE BOAS-VINDAS]*\n\n` + textoFinal }, { quoted: msg })
      } else {
        await sock.sendMessage(jid, { text: `🍏 *[TESTE DE BOAS-VINDAS]*\n\n` + textoFinal }, { quoted: msg })
      }
    } catch(e) { await sock.sendMessage(jid, { text: `💧 Erro: ${e.message}` }, { quoted: msg }) }
  }
},

abrirgp: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, args, db, utils, groupMetadata, prefixoAtivo }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
    if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "Promova o bot", null, nomeBot) }, { quoted: msg }) }
    const hora = args[0]
    if (!hora || !/^\d{1,2}:\d{2}$/.test(hora)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐀𝐁𝐑𝐈𝐑𝐆𝐏", "Informe o horário.", `\`${p}abrirgp hh:mm\``, null, nomeBot) }, { quoted: msg }) }
    const [h, m] = hora.split(":").map(Number); const fmt = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0")
    const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].abrirHora = fmt; g[jid].ultimoAbrir = null; db.salvarGrupos(g); await reagir(sock, msg, "🍏")
    await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐁𝐄𝐑𝐓𝐔𝐑𝐀", "Agendada.", `🍏 ${fmt}`, null, nomeBot) }, { quoted: msg })
  }
},

fechargp: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, args, db, utils, groupMetadata, prefixoAtivo }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
    if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "💨"); return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "Promova o bot", null, nomeBot) }, { quoted: msg }) }
    const hora = args[0]
    if (!hora || !/^\d{1,2}:\d{2}$/.test(hora)) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐅𝐄𝐂𝐇𝐀𝐑𝐆𝐏", "Informe o horário.", `\`${p}fechargp hh:mm\``, null, nomeBot) }, { quoted: msg }) }
    const [h, m] = hora.split(":").map(Number); const fmt = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0")
    const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].fecharHora = fmt; g[jid].ultimoFechar = null; db.salvarGrupos(g); await reagir(sock, msg, "🍏")
    await sock.sendMessage(jid, { text: msgSucesso("𝐅𝐄𝐂𝐇𝐀𝐌𝐄𝐍𝐓𝐎", "Agendado.", `🍏 ${fmt}`, null, nomeBot) }, { quoted: msg })
  }
},

fotoabrir: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, args, db, utils, prefixoAtivo }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const quoted = ctx.quotedMessage
    const tem = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage); const legenda = (args.join(" ").trim()) || (quoted && quoted.imageMessage && quoted.imageMessage.caption) || null
    const g = db.grupos(); g[jid] = g[jid] || {}
    if (tem) { const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage } }); const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage }); g[jid].fotoAbrir = buffer.toString("base64"); if (legenda) g[jid].legendaAbrir = legenda; db.salvarGrupos(g); await reagir(sock, msg, "🍏"); return sock.sendMessage(jid, { image: buffer, caption: msgSucesso("𝐅𝐎𝐓𝐎", "Abertura salva.", "🍏 Aplicada ao grupo", null, nomeBot) }, { quoted: msg }) }
    if (legenda) { g[jid].legendaAbrir = legenda; db.salvarGrupos(g); await reagir(sock, msg, "🍏"); return sock.sendMessage(jid, { text: msgSucesso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀", "Salva.", `🍏 ${legenda}`, null, nomeBot) }, { quoted: msg }) }
    await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐅𝐎𝐓𝐎", "Responda uma imagem.", `\`${p}fotoabrir\` (reply)`, null, nomeBot) }, { quoted: msg })
  }
},

fotofechar: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, args, db, utils, prefixoAtivo }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const quoted = ctx.quotedMessage
    const tem = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage); const legenda = (args.join(" ").trim()) || (quoted && quoted.imageMessage && quoted.imageMessage.caption) || null
    const g = db.grupos(); g[jid] = g[jid] || {}
    if (tem) { const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage } }); const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage }); g[jid].fotoFechar = buffer.toString("base64"); if (legenda) g[jid].legendaFechar = legenda; db.salvarGrupos(g); await reagir(sock, msg, "🍏"); return sock.sendMessage(jid, { image: buffer, caption: msgSucesso("𝐅𝐎𝐓𝐎", "Fechamento salva.", "🍏 Aplicada ao grupo", null, nomeBot) }, { quoted: msg }) }
    if (legenda) { g[jid].legendaFechar = legenda; db.salvarGrupos(g); await reagir(sock, msg, "🍏"); return sock.sendMessage(jid, { text: msgSucesso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀", "Salva.", `🍏 ${legenda}`, null, nomeBot) }, { quoted: msg }) }
    await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐅𝐎𝐓𝐎", "Responda uma imagem.", `\`${p}fotofechar\` (reply)`, null, nomeBot) }, { quoted: msg })
  }
},

legendaabrir: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, args, db, prefixoAtivo }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; let t = args.join(" ").trim()
    if (!t) { const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const q = ctx.quotedMessage; if (q) t = q.conversation || (q.extendedTextMessage && q.extendedTextMessage.text) || (q.imageMessage && q.imageMessage.caption) || "" }
    if (!t) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀", "Informe o texto.", `\`${p}legendaabrir <txt>\``, null, nomeBot) }, { quoted: msg }) }
    const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].legendaAbrir = t; db.salvarGrupos(g); await reagir(sock, msg, "🍏")
    await sock.sendMessage(jid, { text: msgSucesso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀", "Salva.", `🍏 ${t}`, null, nomeBot) }, { quoted: msg })
  }
},

legendafechar: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, args, db, prefixoAtivo }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; let t = args.join(" ").trim()
    if (!t) { const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const q = ctx.quotedMessage; if (q) t = q.conversation || (q.extendedTextMessage && q.extendedTextMessage.text) || (q.imageMessage && q.imageMessage.caption) || "" }
    if (!t) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀", "Informe o texto.", `\`${p}legendafechar <txt>\``, null, nomeBot) }, { quoted: msg }) }
    const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].legendaFechar = t; db.salvarGrupos(g); await reagir(sock, msg, "🍏")
    await sock.sendMessage(jid, { text: msgSucesso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀", "Salva.", `🍏 ${t}`, null, nomeBot) }, { quoted: msg })
  }
},

limparfotos: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, db }) {
    const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const g = db.grupos(); g[jid] = g[jid] || {}
    delete g[jid].fotoAbrir; delete g[jid].fotoFechar; delete g[jid].legendaAbrir; delete g[jid].legendaFechar; db.salvarGrupos(g); await reagir(sock, msg, "🍏")
    await sock.sendMessage(jid, { text: msgSucesso("𝐋𝐈𝐌𝐏𝐄𝐙𝐀", "Fotos e legendas removidas.", "🍏 Tudo limpo", null, nomeBot) }, { quoted: msg })
  }
},modoparceria: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, args, prefixoAtivo }) {
    const jid = msg.key.remoteJid; const nomeBot = "Bot"
    const parcerias = dbLer("parcerias.json", {}); parcerias[jid] = parcerias[jid] || { ativo: false, parceiros: {} }
    const sub = (args[0] || "").toLowerCase()
    if (sub === "on") parcerias[jid].ativo = true
    else if (sub === "off") parcerias[jid].ativo = false
    else parcerias[jid].ativo = !parcerias[jid].ativo
    dbSalvar("parcerias.json", parcerias); await reagir(sock, msg, "🍏")
    await sock.sendMessage(jid, { text: `🍏 • 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀 •\n\n🟢 Modo parceria: ${parcerias[jid].ativo ? "ON ✅" : "OFF ❌"}\n\n🧊 "${nomeBot}"` }, { quoted: msg })
  }
},

addparceria: {
  adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, args, prefixoAtivo, utils }) {
    const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; const nomeBot = "Bot"
    const alvo = utils.getAlvo(msg); const qtdStr = args.find(a => /^\d+$/.test(a)); const qtd = qtdStr ? parseInt(qtdStr) : 5
    if (!alvo) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `🍏 Use: \`${p}addparceria @user <qtd>\`` }, { quoted: msg }) }
    const parcerias = dbLer("parcerias.json", {}); parcerias[jid] = parcerias[jid] || { ativo: true, parceiros: {} }
    parcerias[jid].parceiros[alvo] = { total: qtd, usados: 0, desde: Date.now() }; dbSalvar("parcerias.json", parcerias)
    await reagir(sock, msg, "🍏")
    await sock.sendMessage(jid, { text: `🍏 • 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀 •\n\n🟢 @${utils.soNumero(alvo)} agora é parceiro!\n💧 Limite: ${qtd} links\n\n🧊 "${nomeBot}"`, mentions: [alvo] }, { quoted: msg })
  }
},

delparceria: {
  aliases: ["rmparceria"], adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, utils }) {
    const jid = msg.key.remoteJid; const nomeBot = "Bot"; const alvo = utils.getAlvo(msg)
    if (!alvo) { await reagir(sock, msg, "🧊"); return }
    const parcerias = dbLer("parcerias.json", {})
    if (parcerias[jid] && parcerias[jid].parceiros && parcerias[jid].parceiros[alvo]) {
      delete parcerias[jid].parceiros[alvo]; dbSalvar("parcerias.json", parcerias)
      await reagir(sock, msg, "🍏")
      await sock.sendMessage(jid, { text: `🍏 • 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀 •\n\n🟢 @${utils.soNumero(alvo)} não é mais parceiro.\n\n🧊 "${nomeBot}"`, mentions: [alvo] }, { quoted: msg })
    } else { await reagir(sock, msg, "🧊") }
  }
},

parcerias: {
  aliases: ["listaparceiros"], adminOnly: true, grupoOnly: true,
  async executar({ sock, msg, utils }) {
    const jid = msg.key.remoteJid; const nomeBot = "Bot"
    const parcerias = dbLer("parcerias.json", {}); const lista = Object.entries(parcerias[jid]?.parceiros || {})
    if (!lista.length) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: `🍏 • 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀𝐒 •\n\n💧 Nenhum parceiro ainda.\n\n🧊 "${nomeBot}"` }, { quoted: msg }) }
    let txt = `🍏 • 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀𝐒 •\n\n🟢 Total: ${lista.length}\n\n`; const mentions = []
    lista.forEach(([jidP, info], i) => { txt += `🍏 ${i + 1}. @${utils.soNumero(jidP)} — ${info.usados}/${info.total} links\n`; mentions.push(jidP) })
    txt += `\n🧊 "${nomeBot}"`; await reagir(sock, msg, "🍏"); await sock.sendMessage(jid, { text: txt, mentions }, { quoted: msg })
  }
},    rgfig: {
      aliases: ["registrarfig", "addfigcmd"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"; const comando = (args[0] || "").toLowerCase()
        if (!comando) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐀𝐑", "Informe o comando.", `\`${p}rgfig <comando>\` (reply)`, null, nomeBot) }, { quoted: msg }) }
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const quoted = ctx.quotedMessage
        const temFig = (msg.message && msg.message.stickerMessage) || (quoted && quoted.stickerMessage)
        if (!temFig) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐅𝐈𝐆𝐔𝐑𝐈𝐍𝐇𝐀", "Responda uma figurinha.", `\`${p}rgfig <comando>\``, null, nomeBot) }, { quoted: msg }) }
        try {
          const alvoMsg = (msg.message && msg.message.stickerMessage) ? msg : { ...msg, message: { stickerMessage: quoted.stickerMessage } }
          const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          const hash = crypto.createHash("md5").update(buffer).digest("hex")
          const dbFig = dbLer("figcmd.json", {}); dbFig[jid] = dbFig[jid] || {}
          dbFig[jid][hash] = { comando: comando, criadoPor: utils.soNumero(msg.key.participant), data: Date.now() }; dbSalvar("figcmd.json", dbFig)
          await reagir(sock, msg, "🍏"); await sock.sendMessage(jid, { text: msgSucesso("𝐅𝐈𝐆𝐔𝐑𝐈𝐍𝐇𝐀", "Comando vinculado.", `🍏 Figurinha ativará: \`${p}${comando}\``, null, nomeBot) }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha ao salvar figurinha.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    rmfig: {
      aliases: ["removerfigcmd", "delfigcmd"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}; const quoted = ctx.quotedMessage
        const temFig = (msg.message && msg.message.stickerMessage) || (quoted && quoted.stickerMessage)
        if (!temFig) { await reagir(sock, msg, "💧"); return sock.sendMessage(jid, { text: msgAviso("𝐑𝐄𝐌𝐎𝐕𝐄𝐑", "Responda a figurinha.", `\`${p}rmfig\` (reply)`, null, nomeBot) }, { quoted: msg }) }
        try {
          const alvoMsg = (msg.message && msg.message.stickerMessage) ? msg : { ...msg, message: { stickerMessage: quoted.stickerMessage } }
          const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          const hash = crypto.createHash("md5").update(buffer).digest("hex")
          const dbFig = dbLer("figcmd.json", {})
          if (dbFig[jid] && dbFig[jid][hash]) { delete dbFig[jid][hash]; dbSalvar("figcmd.json", dbFig); await reagir(sock, msg, "🍏"); await sock.sendMessage(jid, { text: msgSucesso("𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐀", "Comando desvinculado.", "🍏 Figurinha não ativa mais comando", null, nomeBot) }, { quoted: msg }) }
          else { await reagir(sock, msg, "💧"); await sock.sendMessage(jid, { text: msgAviso("𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐀", "Figurinha sem comando.", "🍏 Nada a remover", null, nomeBot) }, { quoted: msg }) }
        } catch (e) { await reagir(sock, msg, "💨"); await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha ao remover.", e.message, null, nomeBot) }, { quoted: msg }) }
      }
    },

    listafig: {
      aliases: ["figs", "listafiguras", "figcomandos"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db); const p = prefixoAtivo || "+"
        const dbFig = dbLer("figcmd.json", {}); const grupo = dbFig[jid] || {}; const total = Object.keys(grupo).length
        if (!total) { await reagir(sock, msg, "🧊"); return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐒𝐓𝐀 𝐕𝐀𝐙𝐈𝐀", "Nenhuma figurinha.", `Use \`${p}rgfig <cmd>\``, null, nomeBot) }, { quoted: msg }) }
        let txt = `🍏 • 𝐅𝐈𝐆𝐔𝐑𝐈𝐍𝐇𝐀𝐒 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒 •\n\n🟢 Total: ${total}\n\n`
        for (const [hash, info] of Object.entries(grupo)) { txt += `🍏 \`${p}${info.comando}\`\n` }
        txt += `\n🧊 "${nomeBot}"`; await reagir(sock, msg, "🍏"); await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    }

  }
}