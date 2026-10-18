/* ============================================================
   🟣 MENU ADM - RIMURU BOT MD
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
function dbSalvar(a, d) {
  fs.writeFileSync(path.join(DATA_DIR, a), JSON.stringify(d, null, 2))
}

function hashFigurinha(buffer) {
  return crypto.createHash("md5").update(buffer).digest("hex")
}

function msgSucesso(titulo, aviso, detalhes, rodape, nomeBot) {
  return `🟣 • ${titulo} •\n\n╭─〔 💜 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ ${aviso}\n╰──────────────\n\n『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴\n\n${detalhes}\n\n${rodape ? rodape + "\n\n" : ""}"${nomeBot}"`
}

function msgAviso(titulo, aviso, detalhes, rodape, nomeBot) {
  return `🟣 • ${titulo} •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ ${aviso}\n╰──────────────\n\n『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴\n\n${detalhes}\n\n${rodape ? rodape + "\n\n" : ""}"${nomeBot}"`
}

function msgErro(titulo, aviso, detalhes, rodape, nomeBot) {
  return `🟣 • ${titulo} •\n\n╭─〔 🚫 𝐄𝐑𝐑𝐎 〕\n│ ${aviso}\n╰──────────────\n\n『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴\n\n${detalhes}\n\n${rodape ? rodape + "\n\n" : ""}"${nomeBot}"`
}

function lineEmoji(emoji, label, valor) {
  return `${emoji} ${label}:\n╰➜ ${valor}`
}

function nomeBotDb(db) {
  try { return db.config().nomeBot || "Rimuru Bot" } catch { return "Rimuru Bot" }
}

module.exports = {
  menu: "menu-adm",
  grupoOnly: false,
  adminOnly: false,
  donoOnly: false,

  commands: {
    menu: {
      aliases: ["menus", "ajuda", "help", "menuadm"],
      async executar({ sock, msg, prefixoAtivo, db, sender, config }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "!"
        const cfg = db.config() || {}
        const numUser = String(sender || "").split("@")[0].split(":")[0].replace(/\D/g, "")
        const pushName = msg.pushName || "Slime"
        const agora = new Date()
        const hora = agora.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" })
        const h = agora.getHours()
        let saudacao = "Boa noite"
        if (h >= 5 && h < 12) saudacao = "Bom dia"
        else if (h >= 12 && h < 18) saudacao = "Boa tarde"
        let premium = "Não"
        const vips = (db.vips() || {}).vips || {}
        for (const [jidVip, info] of Object.entries(vips)) {
          const n = String(jidVip).split("@")[0].split(":")[0].replace(/\D/g, "")
          if (n === numUser) {
            if (info.expira === "inf" || info.expira > Date.now()) { premium = "Sim 🦠"; break }
          }
        }
        const donoArr = Array.isArray(config && config.dono) ? config.dono : [config && config.dono || "Chefe"]
        const nomeDono = String(donoArr[0] || "Chefe").split("@")[0].split(":")[0].replace(/\D/g, "") || "Chefe"
        const nomeBot = (config && config.nomeBot) || "Rimuru Bot - MD"
        const mentions = sender ? [sender] : []

        const texto = `🟣 • 𝐒𝐀𝐔𝐃𝐀𝐂̧𝐎̃𝐄𝐒 •\n\n╭─〔 🌌 𝐁𝐄𝐌-𝐕𝐈𝐍𝐃𝐎 𝐀 𝐓𝐄𝐌𝐏𝐄𝐒𝐓 〕\n│ ${saudacao}, ${pushName}!\n╰──────────────\n\n『 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐜̧𝐨̃𝐞𝐬 』 ↴\n\n👤 𝐒𝐥𝐢𝐦𝐞:\n╰➜ @${numUser}\n\n🟣 𝐁𝐨𝐭:\n╰➜ ${nomeBot}\n\n👁️ 𝐆𝐫𝐚𝐧𝐝𝐞 𝐒𝐚́𝐛𝐢𝐨:\n╰➜ ${nomeDono}\n\n💜 𝐍𝐨𝐛𝐫𝐞𝐳𝐚:\n╰➜ ${premium}\n\n🕐 𝐇𝐨𝐫𝐚́𝐫𝐢𝐨:\n╰➜ ${hora}\n\n🦠 _"O Grande Sábio está sempre observando."_\n\n"${nomeBot}"`

        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          try {
            if (cfg.tipoMenu === "video") await sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "rimuru-menu.mp4", gifPlayback: true, caption: texto, mentions }, { quoted: msg })
            else await sock.sendMessage(jid, { image: buf, caption: texto, mentions }, { quoted: msg })
          } catch (e) { await sock.sendMessage(jid, { text: texto, mentions }, { quoted: msg }) }
        } else {
          await sock.sendMessage(jid, { text: texto, mentions }, { quoted: msg })
        }

        try {
          await sock.sendMessage(jid, {
            text: "🟣 *Escolha uma categoria de Tempest:*",
            footer: "🌌 " + nomeBot,
            title: "🟣 MENUS DO REINO",
            buttonText: "🦠 ABRIR MENUS",
            sections: [
              { title: "⚔️ ADMINISTRAÇÃO", rows: [{ title: "⚙️ Menu Admin", rowId: p + "menuadmin", description: "Banir, mutar, proteções..." }, { title: "👁️ Menu Dono", rowId: p + "menudono", description: "Comandos do Grande Sábio" }] },
              { title: "💜 ÁREA NOBRE", rows: [{ title: "🟣 Menu VIP", rowId: p + "menuvip", description: "Figurinhas, logos, autofig" }] },
              { title: "🎮 JOGOS E DIVERSÃO", rows: [{ title: "🦠 Menu RPG", rowId: p + "menurpg", description: "Economia, pets, cassino" }, { title: "🌾 Menu Fazenda", rowId: p + "menufazenda", description: "Animais, plantações" }, { title: "🐻 Menu FNAF", rowId: p + "menufnaf", description: "Five Nights at Freddy's" }, { title: "🏙️ Menu Cidade", rowId: p + "menucidade", description: "Casas, banco, crimes" }] }
            ]
          })
        } catch (e) {
          await sock.sendMessage(jid, { text: "🟣 *MENUS DISPONÍVEIS:*\n\n⚙️ ▸ " + p + "menuadmin\n👁️ ▸ " + p + "menudono\n💜 ▸ " + p + "menuvip\n🦠 ▸ " + p + "menurpg\n🌾 ▸ " + p + "menufazenda\n🐻 ▸ " + p + "menufnaf\n🏙️ ▸ " + p + "menucidade" }, { quoted: msg })
        }
      }
    },

    ping: {
      aliases: ["pong", "latencia", "pingar"],
      async executar({ sock, msg, sender, utils, db }) {
        const jid = msg.key.remoteJid
        const t1 = Date.now()
        const num = utils.soNumero(sender)
        const nomeBot = nomeBotDb(db)
        const sent = await sock.sendMessage(jid, { text: "🟣 • 𝐌𝐄𝐃𝐈𝐍𝐃𝐎 𝐋𝐀𝐓𝐄̂𝐍𝐂𝐈𝐀 •\n\n╭─〔 🔮 𝐀𝐍𝐀𝐋𝐈𝐒𝐀𝐍𝐃𝐎 〕\n│ O Grande Sábio está calculando...\n╰──────────────\n\n👁️ [░░░░░░░░░░] 0%" }, { quoted: msg })
        const etapas = [{ espera: 500, pct: 20, msg: "Analisando magia...", emoji: "🦠" }, { espera: 500, pct: 40, msg: "Invocando habilidades...", emoji: "🔮" }, { espera: 500, pct: 60, msg: "Sincronizando com Veldora...", emoji: "🌌" }, { espera: 500, pct: 80, msg: "Calculando rotas neurais...", emoji: "💜" }, { espera: 500, pct: 100, msg: "Finalizando...", emoji: "🟣" }]
        for (const et of etapas) {
          await new Promise(r => setTimeout(r, et.espera))
          const cheios = Math.floor(et.pct / 10)
          const barra = "🟣".repeat(cheios) + "⬛".repeat(10 - cheios)
          try { await sock.sendMessage(jid, { text: "🟣 • 𝐌𝐄𝐃𝐈𝐍𝐃𝐎 𝐋𝐀𝐓𝐄̂𝐍𝐂𝐈𝐀 •\n\n╭─〔 🔮 𝐀𝐍𝐀𝐋𝐈𝐒𝐀𝐍𝐃𝐎 〕\n│ " + et.emoji + " _" + et.msg + "_\n╰──────────────\n\n👁️ [" + barra + "] " + et.pct + "%", edit: sent.key }) } catch (_) {}
        }
        const t2 = Date.now()
        let pingReal = 0
        try { await sock.groupMetadata(jid); pingReal = Date.now() - t2 } catch (_) { pingReal = Date.now() - t2 }
        const pingTotal = Date.now() - t1
        let qual = "", msgQual = "", emoji = "", cor = ""
        if (pingReal < 100) { qual = "PERFEITO"; msgQual = "Conexão telepática ativada."; emoji = "🟣"; cor = "💜" }
        else if (pingReal < 200) { qual = "Excelente"; msgQual = "O fluxo de mana está ótimo."; emoji = "🦠"; cor = "🔮" }
        else if (pingReal < 350) { qual = "Bom"; msgQual = "Tudo sob controle, slime."; emoji = "🌌"; cor = "🔹" }
        else if (pingReal < 500) { qual = "Aceitável"; msgQual = "A conexão começa a enfraquecer..."; emoji = "🌘"; cor = "🟡" }
        else if (pingReal < 800) { qual = "Ruim"; msgQual = "Os cálculos estão lentos..."; emoji = "🌑"; cor = "🟠" }
        else if (pingReal < 1500) { qual = "Péssimo"; msgQual = "Tempest está offline!"; emoji = "💀"; cor = "🔴" }
        else { qual = "MORTO"; msgQual = "O Grande Sábio falhou."; emoji = "☠️"; cor = "⚫" }
        const hora = new Date().toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" })
        const data = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
        await sock.sendMessage(jid, { text: `🟣 • 𝐋𝐀𝐓𝐄̂𝐍𝐂𝐈𝐀 𝐃𝐄 𝐓𝐄𝐌𝐏𝐄𝐒𝐓 •\n\n╭─〔 🔮 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎 〕\n│ ${msgQual}\n╰──────────────\n\n『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴\n\n👤 𝐒𝐥𝐢𝐦𝐞:\n╰➜ @${num}\n\n${emoji} 𝐏𝐢𝐧𝐠:\n╰➜ ${pingReal}ms\n\n⏱️ 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐚𝐦𝐞𝐧𝐭𝐨:\n╰➜ ${pingTotal}ms\n\n${cor} 𝐐𝐮𝐚𝐥𝐢𝐝𝐚𝐝𝐞:\n╰➜ ${qual}\n\n🌐 𝐒𝐭𝐚𝐭𝐮𝐬:\n╰➜ ONLINE ✅\n\n🕐 𝐇𝐨𝐫𝐚́𝐫𝐢𝐨:\n╰➜ ${hora} — ${data}\n\n> 🦠 _${msgQual}_\n\n"${nomeBot}"`, mentions: [sender], edit: sent.key })
      }
    },

    totalcmd: {
      aliases: ["totalcomandos", "quantoscmd", "cmdcount"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const total = global.totalComandos || 0
        const totalAliases = global.totalAliases || 0
        const porCategoria = global.comandosPorCategoria || {}
        let listaCat = ""
        for (const [cat, qtd] of Object.entries(porCategoria)) listaCat += "╰➜ " + cat + ": *" + qtd + "*\n"
        const nomeBot = nomeBotDb(db)
        await sock.sendMessage(jid, { text: `🟣 • 𝐓𝐎𝐓𝐀𝐋 𝐃𝐄 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒 •\n\n╭─〔 🔮 𝐄𝐒𝐓𝐀𝐓𝐈́𝐒𝐓𝐈𝐂𝐀𝐒 〕\n│ Todos os comandos registrados.\n╰──────────────\n\n『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴\n\n⚔️ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬:\n╰➜ ${total}\n\n🔗 𝐀𝐥𝐢𝐚𝐬𝐞𝐬:\n╰➜ ${totalAliases}\n\n📈 𝐓𝐨𝐭𝐚𝐥 𝐠𝐞𝐫𝐚𝐥:\n╰➜ ${total + totalAliases}\n\n📂 𝐏𝐨𝐫 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐚:\n${listaCat || "╰➜ _nenhuma_"}\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    menuadmin: {
      aliases: ["menu-adm", "menua", "adm", "comandosadm"],
      async executar({ sock, msg, prefixoAtivo, db }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "!"
        const cfg = db.config() || {}
        const nomeBot = nomeBotDb(db)
        const texto = `🟣 • 𝐏𝐀𝐈𝐍𝐄𝐋 𝐀𝐃𝐌𝐈𝐍 •\n\n╭─〔 🌌 𝐀𝐔𝐓𝐎𝐑𝐈𝐃𝐀𝐃𝐄 〕\n│ Comandos de administração do grupo.\n╰──────────────\n\n『 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐚𝐬 』 ↴\n\n🤝 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀\n╰➜ \`${p}parceria\` (pedir parceria)\n\n⚙️ 𝐏𝐑𝐄𝐅𝐈𝐗𝐎\n╰➜ \`${p}multiprefixo on/off\`\n╰➜ \`${p}setprefixo <novo>\`\n╰➜ \`${p}prefixo\`\n\n⚠️ 𝐀𝐃𝐕𝐄𝐑𝐓𝐄̂𝐍𝐂𝐈𝐀\n╰➜ \`${p}adv @user motivo\`\n╰➜ \`${p}deladv @user\`\n╰➜ \`${p}listaadv\`\n╰➜ \`${p}veradv @user\`\n\n👥 𝐌𝐄𝐌𝐁𝐑𝐎𝐒\n╰➜ \`${p}promover @user\`\n╰➜ \`${p}rebaixar @user\`\n╰➜ \`${p}ban @user\`\n╰➜ \`${p}mute @user\`\n╰➜ \`${p}desmute @user\`\n╰➜ \`${p}p\` (reply)\n╰➜ \`${p}totag <texto>\`\n\n🏰 𝐆𝐑𝐔𝐏𝐎\n╰➜ \`${p}abrir\` / \`${p}fechar\`\n╰➜ \`${p}link\`\n╰➜ \`${p}soadm on/off\`\n╰➜ \`${p}namegp <nome>\`\n╰➜ \`${p}descricao <texto>\`\n\n👑 𝐒𝐔𝐁-𝐀𝐃𝐌\n╰➜ \`${p}subadm @user\`\n╰➜ \`${p}delsubadm @user\`\n╰➜ \`${p}listasubadm\`\n\n🛡️ 𝐏𝐑𝐎𝐓𝐄𝐂̧𝐎̃𝐄𝐒\n╰➜ \`${p}antilink on/off\`\n╰➜ \`${p}antiaudio on/off\`\n╰➜ \`${p}antivideo on/off\`\n╰➜ \`${p}antifoto on/off\`\n╰➜ \`${p}antifig on/off\`\n╰➜ \`${p}palavrao on/off\`\n╰➜ \`${p}addpalavra <palavra>\`\n╰➜ \`${p}rmpalavra <palavra>\`\n╰➜ \`${p}listapalavra\`\n\n🕵️ 𝐗𝟗 / 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀\n╰➜ \`${p}x9 on/off\`\n╰➜ \`${p}modoparceria on/off\`\n╰➜ \`${p}addparceria @user <qtd>\`\n╰➜ \`${p}rmparceria @user\`\n╰➜ \`${p}parcerias\`\n\n🚫 𝐋𝐈𝐒𝐓𝐀 𝐍𝐄𝐆𝐑𝐀\n╰➜ \`${p}listanegra <número>\`\n╰➜ \`${p}blacklist\`\n╰➜ \`${p}dellista <número>\`\n\n👋 𝐁𝐄𝐌-𝐕𝐈𝐍𝐃𝐎\n╰➜ \`${p}bemvindo on/off\`\n╰➜ \`${p}textobv <texto>\`\n╰➜ \`${p}fundoBV\` (reply)\n╰➜ \`${p}legendasaiu <texto>\`\n╰➜ \`${p}fundoSaiu\` (reply)\n\n⏰ 𝐀𝐆𝐄𝐍𝐃𝐀𝐌𝐄𝐍𝐓𝐎\n╰➜ \`${p}abrirgp hh:mm\`\n╰➜ \`${p}fechargp hh:mm\`\n╰➜ \`${p}fotoabrir\` (reply)\n╰➜ \`${p}fotofechar\` (reply)\n╰➜ \`${p}legendaabrir <texto>\`\n╰➜ \`${p}legendafechar <texto>\`\n╰➜ \`${p}limparfotos\`\n\n🤖 𝐈𝐍𝐓𝐄𝐋𝐈𝐆𝐄̂𝐍𝐂𝐈𝐀\n╰➜ \`${p}iaon\`\n╰➜ \`${p}iaoff\`\n\n🎁 𝐒𝐎𝐑𝐓𝐄𝐈𝐎\n╰➜ \`${p}sorteio <prêmio> <tempo>\`\n\n🎴 𝐅𝐈𝐆𝐔𝐑𝐈𝐍𝐇𝐀𝐒 𝐂𝐎𝐌𝐀𝐍𝐃𝐎\n╰➜ \`${p}rgfig <comando>\` (reply)\n╰➜ \`${p}rmfig\` (reply)\n╰➜ \`${p}listafig\`\n\n🟣 𝐏𝐫𝐞𝐟𝐢𝐱𝐨 𝐚𝐭𝐮𝐚𝐥: \`${p}\`\n\n"${nomeBot}"`
        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          if (cfg.tipoMenu === "video") return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "rimuru.mp4", gifPlayback: true, caption: texto }, { quoted: msg })
          return sock.sendMessage(jid, { image: buf, caption: texto }, { quoted: msg })
        }
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    prefixo: {
      aliases: ["prefix", "prefixoatual", "qualprefixo"],
      async executar({ sock, msg, prefixoAtivo, db }) {
        const jid = msg.key.remoteJid
        const cfg = db.config()
        const padrao = cfg.prefixoGlobal || "!"
        const grupoConf = db.grupos()[jid] || {}
        const nomeBot = nomeBotDb(db)
        let multiStatus = grupoConf.multiprefixo ? "ON ✅" : "OFF ❌"
        let prefixoGrupo = grupoConf.prefixo || padrao
        await sock.sendMessage(jid, { text: `🟣 • 𝐏𝐑𝐄𝐅𝐈𝐗𝐎 •\n\n╭─〔 🔮 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐂̧𝐀̃𝐎 〕\n│ Sistema de prefixos do bot.\n╰──────────────\n\n『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴\n\n🟣 𝐏𝐚𝐝𝐫𝐚̃𝐨:\n╰➜ ${padrao}\n\n🎯 𝐀𝐭𝐢𝐯𝐨 𝐚𝐠𝐨𝐫𝐚:\n╰➜ ${prefixoAtivo}\n\n⚙️ 𝐌𝐮𝐥𝐭𝐢𝐩𝐫𝐞𝐟𝐢𝐱𝐨:\n╰➜ ${multiStatus}\n\n📌 𝐏𝐫𝐞𝐟𝐢𝐱𝐨 𝐝𝐨 𝐠𝐫𝐮𝐩𝐨:\n╰➜ ${prefixoGrupo}\n\n⚔️ 𝐀𝐜𝐞𝐢𝐭𝐨𝐬:\n╰➜ ! e /\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    p: {
      aliases: ["apagar", "delmsg"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo
        if (!ctx || !ctx.stanzaId) return sock.sendMessage(jid, { text: msgAviso("𝐀𝐏𝐀𝐆𝐀𝐑 𝐌𝐄𝐍𝐒𝐀𝐆𝐄𝐌", "Você precisa responder uma mensagem.", "💡 Responda uma msg com `!p`", null, nomeBot) }, { quoted: msg })
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Eu preciso ser admin.", "⚠️ Promova o bot a admin.", null, nomeBot) }, { quoted: msg })
        try {
          await sock.sendMessage(jid, { delete: { remoteJid: jid, fromMe: false, id: ctx.stanzaId, participant: ctx.participant || (ctx.mentionedJid && ctx.mentionedJid[0]) } })
          await sock.sendMessage(jid, { text: msgSucesso("𝐌𝐄𝐍𝐒𝐀𝐆𝐄𝐌 𝐀𝐏𝐀𝐆𝐀𝐃𝐀", "Apagada com sucesso.", "🔥 _\"Ninguém viu...\"_", null, nomeBot) }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: "🟣 " + e.message }, { quoted: msg }) }
      }
    },

    abrir: {
      aliases: ["opennow"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "⚠️ Promova o bot a admin.", null, nomeBot) }, { quoted: msg })
        try { await sock.groupSettingUpdate(jid, "not_announcement"); await sock.sendMessage(jid, { text: msgSucesso("𝐆𝐑𝐔𝐏𝐎 𝐀𝐁𝐄𝐑𝐓𝐎", "O grupo foi aberto.", "🔓 _\"A força ilumina todos.\"_", null, nomeBot) }, { quoted: msg }) } catch (e) { await sock.sendMessage(jid, { text: "🟣 " + e.message }, { quoted: msg }) }
      }
    },

    fechar: {
      aliases: ["closenow"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "⚠️ Promova o bot a admin.", null, nomeBot) }, { quoted: msg })
        try { await sock.groupSettingUpdate(jid, "announcement"); await sock.sendMessage(jid, { text: msgSucesso("𝐆𝐑𝐔𝐏𝐎 𝐅𝐄𝐂𝐇𝐀𝐃𝐎", "O grupo foi fechado.", "🔒 _\"Só os fortes falam.\"_", null, nomeBot) }, { quoted: msg }) } catch (e) { await sock.sendMessage(jid, { text: "🟣 " + e.message }, { quoted: msg }) }
      }
    },

    mute: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        const nomeBot = nomeBotDb(db)
        if (!alvo) return sock.sendMessage(jid, { text: msgAviso("𝐌𝐔𝐓𝐄", "Marque alguém.", "💡 `!mute @user`", null, nomeBot) }, { quoted: msg })
        const mutados = db.mutados(); mutados[jid] = mutados[jid] || {}; mutados[jid][alvo] = Date.now() + 5 * 60 * 1000; db.salvarMutados(mutados)
        await sock.sendMessage(jid, { text: msgSucesso("𝐔𝐒𝐔𝐀́𝐑𝐈𝐎 𝐒𝐈𝐋𝐄𝐍𝐂𝐈𝐀𝐃𝐎", "O usuário foi mutado por 5 minutos.", lineEmoji("👤", "𝐔𝐬𝐮𝐚́𝐫𝐢𝐨", "@" + utils.soNumero(alvo)) + "\n" + lineEmoji("⏰", "𝐃𝐮𝐫𝐚𝐜̧𝐚̃𝐨", "5 minutos"), null, nomeBot), mentions: [alvo] }, { quoted: msg })
      }
    },

    desmute: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        const nomeBot = nomeBotDb(db)
        if (!alvo) return sock.sendMessage(jid, { text: msgAviso("𝐃𝐄𝐒𝐌𝐔𝐓𝐄", "Marque alguém.", "💡 `!desmute @user`", null, nomeBot) }, { quoted: msg })
        const mutados = db.mutados(); if (mutados[jid] && mutados[jid][alvo]) { delete mutados[jid][alvo]; db.salvarMutados(mutados) }
        await sock.sendMessage(jid, { text: msgSucesso("𝐔𝐒𝐔𝐀́𝐑𝐈𝐎 𝐋𝐈𝐁𝐄𝐑𝐀𝐃𝐎", "O usuário pode falar novamente.", lineEmoji("👤", "𝐔𝐬𝐮𝐚́𝐫𝐢𝐨", "@" + utils.soNumero(alvo)), null, nomeBot), mentions: [alvo] }, { quoted: msg })
      }
    },

    antilink: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: msgAviso("𝐀𝐍𝐓𝐈𝐋𝐈𝐍𝐊", "Use on ou off.", "💡 `!antilink on/off`", null, nomeBot) }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].antilink = opcao === "on"; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐍𝐓𝐈𝐋𝐈𝐍𝐊", "Proteção contra links atualizada.", lineEmoji("⚙️", "𝐒𝐭𝐚𝐭𝐮𝐬", opcao.toUpperCase()), null, nomeBot) }, { quoted: msg })
      }
    },

    promover: {
      aliases: ["promote", "daradm"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const alvoRaw = utils.getAlvo(msg)
        if (!alvoRaw) return sock.sendMessage(jid, { text: msgAviso("𝐏𝐑𝐎𝐌𝐎𝐕𝐄𝐑", "Marque alguém.", "💡 `!promover @user`", null, nomeBot) }, { quoted: msg })
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "⚠️ Promova o bot a admin.", null, nomeBot) }, { quoted: msg })
        const n = utils.soNumero(alvoRaw)
        const part = groupMetadata.participants.find(p => [p.id, p.lid, p.phoneNumber].filter(Boolean).map(utils.soNumero).includes(n))
        if (!part) return sock.sendMessage(jid, { text: msgErro("𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎", "Usuário não está no grupo.", lineEmoji("👤", "𝐔𝐬𝐮𝐚́𝐫𝐢𝐨", "@" + n), null, nomeBot) }, { quoted: msg })
        try { await sock.groupParticipantsUpdate(jid, [part.id], "promote"); await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐑𝐎𝐌𝐎𝐕𝐈𝐃𝐎", "O usuário virou admin.", lineEmoji("👤", "𝐔𝐬𝐮𝐚́𝐫𝐢𝐨", "@" + n) + "\n" + lineEmoji("⚔️", "𝐍𝐨𝐯𝐨 𝐜𝐚𝐫𝐠𝐨", "𝐀𝐃𝐌𝐈𝐍"), "⚔️ _\"Bem-vindo à elite.\"_", nomeBot), mentions: [part.id] }, { quoted: msg }) } catch (e) { await sock.sendMessage(jid, { text: "🟣 " + e.message }, { quoted: msg }) }
      }
    },

    ban: {
      aliases: ["kick", "remover"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const alvoRaw = utils.getAlvo(msg)
        if (!alvoRaw) return sock.sendMessage(jid, { text: msgAviso("𝐁𝐀𝐍𝐈𝐑", "Marque alguém.", "💡 `!ban @user`", null, nomeBot) }, { quoted: msg })
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "⚠️ Promova o bot a admin.", null, nomeBot) }, { quoted: msg })
        const n = utils.soNumero(alvoRaw)
        const part = groupMetadata.participants.find(p => [p.id, p.lid, p.phoneNumber].filter(Boolean).map(utils.soNumero).includes(n))
        if (!part) return sock.sendMessage(jid, { text: msgErro("𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎", "Usuário não está no grupo.", lineEmoji("👤", "𝐔𝐬𝐮𝐚́𝐫𝐢𝐨", "@" + n), null, nomeBot) }, { quoted: msg })
        try { await sock.groupParticipantsUpdate(jid, [part.id], "remove"); await sock.sendMessage(jid, { text: msgSucesso("𝐄𝐗𝐏𝐔𝐋𝐒𝐎", "O usuário foi removido do grupo.", lineEmoji("👤", "𝐔𝐬𝐮𝐚́𝐫𝐢𝐨", "@" + n), "⚔️ _\"A força não perdoa.\"_", nomeBot), mentions: [part.id] }, { quoted: msg }) } catch (e) { await sock.sendMessage(jid, { text: "🟣 " + e.message }, { quoted: msg }) }
      }
    },

    rgfig: {
      aliases: ["registrarfig", "addfigcmd", "savefig"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const comando = (args[0] || "").toLowerCase().replace(/^[!/.\-#,]+/, "").trim()
        if (!comando) return sock.sendMessage(jid, { text: msgAviso("𝐑𝐆𝐅𝐈𝐆", "Informe o comando.", "💡 `!rgfig <comando>`", null, nomeBot) }, { quoted: msg })
        const ctx = (msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo) || {}
        const q = ctx.quotedMessage
        const fig = q && q.stickerMessage
        if (!fig) return sock.sendMessage(jid, { text: msgAviso("𝐑𝐆𝐅𝐈𝐆", "Responda uma figurinha.", "💡 Toque e segure a fig", null, nomeBot) }, { quoted: msg })
        await sock.sendMessage(jid, { text: "🟣 Analisando figurinha..." }, { quoted: msg })
        try {
          const alvo = { key: msg.key, message: { stickerMessage: fig }, messageTimestamp: msg.messageTimestamp }
          const buffer = await utils.downloadMediaMessage(alvo, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          if (!buffer || !buffer.length) throw new Error("Figurinha vazia")
          const hash = hashFigurinha(buffer)
          const num = utils.soNumero(sender)
          const dbFig = dbLer("figcmd.json", {})
          dbFig[jid] = dbFig[jid] || {}
          const jaExiste = dbFig[jid][hash]
          if (jaExiste) return sock.sendMessage(jid, { text: msgAviso("𝐉𝐀́ 𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐀𝐃𝐀", "Essa figurinha já está salva.", lineEmoji("🎴", "𝐂𝐨𝐦𝐚𝐧𝐝𝐨", "!" + jaExiste.comando), null, nomeBot), mentions: [`${jaExiste.criadoPor}@s.whatsapp.net`] }, { quoted: msg })
          dbFig[jid][hash] = { comando: comando, criadoPor: num, criadoEm: Date.now() }
          dbSalvar("figcmd.json", dbFig)
          await sock.sendMessage(jid, { text: msgSucesso("𝐅𝐈𝐆𝐔𝐑𝐈𝐍𝐇𝐀 𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐀𝐃𝐀", "A figurinha agora executa o comando.", lineEmoji("🎴", "𝐂𝐨𝐦𝐚𝐧𝐝𝐨", "!" + comando) + "\n" + lineEmoji("👤", "𝐑𝐞𝐠𝐢𝐬𝐭𝐫𝐚𝐝𝐚 𝐩𝐨𝐫", "@" + num), null, nomeBot), mentions: [sender] }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha ao registrar figurinha.", "⚠️ `" + e.message + "`", null, nomeBot) }, { quoted: msg }) }
      }
    },

    rmfig: {
      aliases: ["removerfig", "delfigcmd", "rmfigcmd"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const ctx = (msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo) || {}
        const q = ctx.quotedMessage
        const fig = q && q.stickerMessage
        if (!fig) return sock.sendMessage(jid, { text: msgAviso("𝐑𝐌𝐅𝐈𝐆", "Responda uma figurinha registrada.", "💡 Responda a fig com `!rmfig`", null, nomeBot) }, { quoted: msg })
        await sock.sendMessage(jid, { text: "🟣 Analisando figurinha..." }, { quoted: msg })
        try {
          const alvo = { key: msg.key, message: { stickerMessage: fig }, messageTimestamp: msg.messageTimestamp }
          const buffer = await utils.downloadMediaMessage(alvo, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          if (!buffer || !buffer.length) throw new Error("Figurinha vazia")
          const hash = hashFigurinha(buffer)
          const num = utils.soNumero(sender)
          const dbFig = dbLer("figcmd.json", {})
          const grupo = dbFig[jid] || {}
          if (!grupo[hash]) return sock.sendMessage(jid, { text: msgAviso("𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐀", "Essa figurinha não está registrada.", "💡 Use `!rgfig <comando>` pra registrar.", null, nomeBot) }, { quoted: msg })
          const dados = grupo[hash]
          delete grupo[hash]
          dbFig[jid] = grupo
          dbSalvar("figcmd.json", dbFig)
          await sock.sendMessage(jid, { text: msgSucesso("𝐅𝐈𝐆𝐔𝐑𝐈𝐍𝐇𝐀 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐀", "O gatilho foi desativado.", lineEmoji("🎴", "𝐂𝐨𝐦𝐚𝐧𝐝𝐨", "!" + dados.comando) + "\n" + lineEmoji("👤", "𝐑𝐞𝐦𝐨𝐯𝐢𝐝𝐚 𝐩𝐨𝐫", "@" + num), null, nomeBot), mentions: [sender] }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha ao remover figurinha.", "⚠️ `" + e.message + "`", null, nomeBot) }, { quoted: msg }) }
      }
    },

    listafig: {
      aliases: ["figsregistradas", "figcmdlist", "minhasfig"],
      grupoOnly: true,
      async executar({ sock, msg, utils, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const dbFig = dbLer("figcmd.json", {})
        const grupo = dbFig[jid] || {}
        const entradas = Object.entries(grupo)
        if (!entradas.length) return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐒𝐓𝐀𝐅𝐈𝐆", "Nenhuma figurinha registrada aqui.", "💡 Use `!rgfig <comando>` pra registrar.", null, nomeBot) }, { quoted: msg })
        let txt = "🟣 • 𝐅𝐈𝐆𝐔𝐑𝐈𝐍𝐇𝐀𝐒 𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐀𝐃𝐀𝐒 •\n\n『 𝐋𝐢𝐬𝐭𝐚 』 ↴\n\n"
        const mentions = []
        entradas.forEach(([hash, info], i) => { txt += `╰➜ ${i + 1}. !${info.comando}\n   👤 @${info.criadoPor}\n\n`; mentions.push(`${info.criadoPor}@s.whatsapp.net`) })
        txt += `📊 𝐓𝐨𝐭𝐚𝐥: ${entradas.length}\n\n"${nomeBot}"`
        await sock.sendMessage(jid, { text: txt, mentions }, { quoted: msg })
      }
    }
  }
}