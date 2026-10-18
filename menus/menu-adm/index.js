/* ============================================================
   ❄️ MENU ADM - AKAZA BOT MD
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

// ============================================================
// 🎨 TEMPLATES DE RESPOSTA
// ============================================================
function msgSucesso(titulo, aviso, detalhes, rodape, nomeBot) {
  return `❄️ • ${titulo} •

╭─〔 ✅ 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕
│ ${aviso}
╰──────────────

『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴

${detalhes}

${rodape ? rodape + "\n\n" : ""}"${nomeBot}"`
}

function msgAviso(titulo, aviso, detalhes, rodape, nomeBot) {
  return `❄️ • ${titulo} •

╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕
│ ${aviso}
╰──────────────

『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴

${detalhes}

${rodape ? rodape + "\n\n" : ""}"${nomeBot}"`
}

function msgErro(titulo, aviso, detalhes, rodape, nomeBot) {
  return `❄️ • ${titulo} •

╭─〔 ❌ 𝐄𝐑𝐑𝐎 〕
│ ${aviso}
╰──────────────

『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴

${detalhes}

${rodape ? rodape + "\n\n" : ""}"${nomeBot}"`
}

function lineEmoji(emoji, label, valor) {
  return `${emoji} ${label}:\n╰➜ ${valor}`
}

function nomeBotDb(db) {
  try { return db.config().nomeBot || "Akaza Bot" } catch { return "Akaza Bot" }
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
        const pushName = msg.pushName || "Soldado"
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
            if (info.expira === "inf" || info.expira > Date.now()) { premium = "Sim ❄️"; break }
          }
        }
        const donoArr = Array.isArray(config && config.dono) ? config.dono : [config && config.dono || "Chefe"]
        const nomeDono = String(donoArr[0] || "Chefe").split("@")[0].split(":")[0].replace(/\D/g, "") || "Chefe"
        const nomeBot = (config && config.nomeBot) || "Akaza Bot - MD"
        const mentions = sender ? [sender] : []

        const texto =
`❄️ • 𝐒𝐀𝐔𝐃𝐀𝐂̧𝐎̃𝐄𝐒 •

╭─〔 ⚔️ 𝐁𝐄𝐌-𝐕𝐈𝐍𝐃𝐎 〕
│ ${saudacao}, ${pushName}!
╰──────────────

『 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐜̧𝐨̃𝐞𝐬 』 ↴

👤 𝐒𝐨𝐥𝐝𝐚𝐝𝐨:
╰➜ @${numUser}

❄️ 𝐁𝐨𝐭:
╰➜ ${nomeBot}

👁️ 𝐋𝐮𝐚 𝐒𝐮𝐩𝐞𝐫𝐢𝐨𝐫:
╰➜ ${nomeDono}

💠 𝐍𝐨𝐛𝐫𝐞𝐳𝐚:
╰➜ ${premium}

🕐 𝐇𝐨𝐫𝐚́𝐫𝐢𝐨:
╰➜ ${hora}

❄️ _"A força observa tudo em silêncio."_

"${nomeBot}"`

        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          try {
            if (cfg.tipoMenu === "video") {
              await sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "akaza-menu.mp4", gifPlayback: true, caption: texto, mentions }, { quoted: msg })
            } else {
              await sock.sendMessage(jid, { image: buf, caption: texto, mentions }, { quoted: msg })
            }
          } catch (e) {
            await sock.sendMessage(jid, { text: texto, mentions }, { quoted: msg })
          }
        } else {
          await sock.sendMessage(jid, { text: texto, mentions }, { quoted: msg })
        }

        try {
          await sock.sendMessage(jid, {
            text: "❄️ *Escolha uma categoria:*",
            footer: "⚔️ " + nomeBot,
            title: "❄️ MENUS DO IMPÉRIO",
            buttonText: "☰ ABRIR MENUS",
            sections: [
              {
                title: "⚔️ ADMINISTRAÇÃO",
                rows: [
                  { title: "⚔️ Menu Admin", rowId: p + "menuadmin", description: "Banir, mutar, proteções, x9..." },
                  { title: "👁️ Menu Dono", rowId: p + "menudono", description: "Comandos exclusivos do mestre" }
                ]
              },
              {
                title: "💠 ÁREA NOBRE",
                rows: [
                  { title: "💠 Menu VIP", rowId: p + "menuvip", description: "Figurinhas, logos, autofig, autottk" }
                ]
              },
              {
                title: "🎮 JOGOS E DIVERSÃO",
                rows: [
                  { title: "❄️ Menu RPG", rowId: p + "menurpg", description: "Economia, pets, exploração, cassino" },
                  { title: "🌾 Menu Fazenda", rowId: p + "menufazenda", description: "Animais, plantações, cercados" },
                  { title: "🐻 Menu FNAF", rowId: p + "menufnaf", description: "Five Nights at Freddy's" },
                  { title: "🏙️ Menu Cidade", rowId: p + "menucidade", description: "Casas, banco, crimes, interações" }
                ]
              }
            ]
          })
        } catch (e) {
          await sock.sendMessage(jid, {
            text: "❄️ *MENUS DISPONÍVEIS:*\n\n" +
              "⚔️ ▸ " + p + "menuadmin\n" +
              "👁️ ▸ " + p + "menudono\n" +
              "💠 ▸ " + p + "menuvip\n" +
              "❄️ ▸ " + p + "menurpg\n" +
              "🌾 ▸ " + p + "menufazenda\n" +
              "🐻 ▸ " + p + "menufnaf\n" +
              "🏙️ ▸ " + p + "menucidade"
          }, { quoted: msg })
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

        const sent = await sock.sendMessage(jid, {
          text: "❄️ • 𝐌𝐄𝐃𝐈𝐍𝐃𝐎 𝐋𝐀𝐓𝐄̂𝐍𝐂𝐈𝐀 •\n\n" +
            "╭─〔 ♦️ 𝐀𝐍𝐀𝐋𝐈𝐒𝐀𝐍𝐃𝐎 〕\n" +
            "│ A força observa em silêncio...\n" +
            "╰──────────────\n\n" +
            "👁️ [░░░░░░░░░░] 0%"
        }, { quoted: msg })

        const etapas = [
          { espera: 500, pct: 20, msg: "Respirando...", emoji: "🌬️" },
          { espera: 500, pct: 40, msg: "Invocando golpes...", emoji: "⚔️" },
          { espera: 500, pct: 60, msg: "Ativando olhos...", emoji: "👁️" },
          { espera: 500, pct: 80, msg: "Sentindo o fluxo...", emoji: "❄️" },
          { espera: 500, pct: 100, msg: "Finalizando...", emoji: "♦️" }
        ]

        for (const et of etapas) {
          await new Promise(r => setTimeout(r, et.espera))
          const cheios = Math.floor(et.pct / 10)
          const barra = "❄️".repeat(cheios) + "⬛".repeat(10 - cheios)
          try {
            await sock.sendMessage(jid, {
              text: "❄️ • 𝐌𝐄𝐃𝐈𝐍𝐃𝐎 𝐋𝐀𝐓𝐄̂𝐍𝐂𝐈𝐀 •\n\n" +
                "╭─〔 ♦️ 𝐀𝐍𝐀𝐋𝐈𝐒𝐀𝐍𝐃𝐎 〕\n" +
                "│ " + et.emoji + " _" + et.msg + "_\n" +
                "╰──────────────\n\n" +
                "👁️ [" + barra + "] " + et.pct + "%",
              edit: sent.key
            })
          } catch (_) {}
        }

        const t2 = Date.now()
        let pingReal = 0
        try { await sock.groupMetadata(jid); pingReal = Date.now() - t2 } catch (_) { pingReal = Date.now() - t2 }
        const pingTotal = Date.now() - t1

        let qual = "", msgQual = "", emoji = "", cor = ""
        if (pingReal < 100) { qual = "PERFEITO"; msgQual = "A força está em sintonia total."; emoji = "❄️"; cor = "💠" }
        else if (pingReal < 200) { qual = "Excelente"; msgQual = "O fluxo do Akaza flui bem."; emoji = "💠"; cor = "🔷" }
        else if (pingReal < 350) { qual = "Bom"; msgQual = "Tudo sob controle, guerreiro."; emoji = "🌙"; cor = "🔹" }
        else if (pingReal < 500) { qual = "Aceitável"; msgQual = "A força começa a enfraquecer..."; emoji = "🌘"; cor = "🟡" }
        else if (pingReal < 800) { qual = "Ruim"; msgQual = "Os golpes estão lentos..."; emoji = "🌑"; cor = "🟠" }
        else if (pingReal < 1500) { qual = "Péssimo"; msgQual = "O império está desmoronando!"; emoji = "💀"; cor = "🔴" }
        else { qual = "MORTO"; msgQual = "A força caiu. Akaza está em silêncio."; emoji = "☠️"; cor = "⚫" }

        const hora = new Date().toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" })
        const data = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })

        await sock.sendMessage(jid, {
          text:
`❄️ • 𝐋𝐀𝐓𝐄̂𝐍𝐂𝐈𝐀 𝐀𝐊𝐀𝐙𝐀 •

╭─〔 ♦️ 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎 〕
│ ${msgQual}
╰──────────────

『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴

👤 𝐆𝐮𝐞𝐫𝐫𝐞𝐢𝐫𝐨:
╰➜ @${num}

${emoji} 𝐏𝐢𝐧𝐠:
╰➜ ${pingReal}ms

⏱️ 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐚𝐦𝐞𝐧𝐭𝐨:
╰➜ ${pingTotal}ms

${cor} 𝐐𝐮𝐚𝐥𝐢𝐝𝐚𝐝𝐞:
╰➜ ${qual}

🌐 𝐒𝐭𝐚𝐭𝐮𝐬:
╰➜ ONLINE ✅

🕐 𝐇𝐨𝐫𝐚́𝐫𝐢𝐨:
╰➜ ${hora} — ${data}

> ⚔️ _${msgQual}_

"${nomeBot}"`,
          mentions: [sender],
          edit: sent.key
        })
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
        for (const [cat, qtd] of Object.entries(porCategoria)) {
          listaCat += "╰➜ " + cat + ": *" + qtd + "*\n"
        }
        const nomeBot = nomeBotDb(db)
        await sock.sendMessage(jid, {
          text:
`❄️ • 𝐓𝐎𝐓𝐀𝐋 𝐃𝐄 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒 •

╭─〔 ♦️ 𝐄𝐒𝐓𝐀𝐓𝐈́𝐒𝐓𝐈𝐂𝐀𝐒 〕
│ Todos os comandos registrados.
╰──────────────

『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴

⚔️ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬:
╰➜ ${total}

🔗 𝐀𝐥𝐢𝐚𝐬𝐞𝐬:
╰➜ ${totalAliases}

📈 𝐓𝐨𝐭𝐚𝐥 𝐠𝐞𝐫𝐚𝐥:
╰➜ ${total + totalAliases}

📂 𝐏𝐨𝐫 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐚:
${listaCat || "╰➜ _nenhuma_"}

"${nomeBot}"`
        }, { quoted: msg })
      }
    },

    menuadmin: {
      aliases: ["menu-adm", "menua", "adm", "comandosadm"],
      async executar({ sock, msg, prefixoAtivo, db }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "!"
        const cfg = db.config() || {}
        const nomeBot = nomeBotDb(db)
        const texto =
`❄️ • 𝐏𝐀𝐈𝐍𝐄𝐋 𝐀𝐃𝐌𝐈𝐍 •

╭─〔 ⚔️ 𝐀𝐔𝐓𝐎𝐑𝐈𝐃𝐀𝐃𝐄 〕
│ Comandos de administração do grupo.
╰──────────────

『 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐚𝐬 』 ↴

🤝 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀
╰➜ \`${p}parceria\` (pedir parceria)

⚙️ 𝐏𝐑𝐄𝐅𝐈𝐗𝐎
╰➜ \`${p}multiprefixo on/off\`
╰➜ \`${p}setprefixo <novo>\`
╰➜ \`${p}prefixo\`

⚠️ 𝐀𝐃𝐕𝐄𝐑𝐓𝐄̂𝐍𝐂𝐈𝐀
╰➜ \`${p}adv @user motivo\`
╰➜ \`${p}deladv @user\`
╰➜ \`${p}listaadv\`
╰➜ \`${p}veradv @user\`

👥 𝐌𝐄𝐌𝐁𝐑𝐎𝐒
╰➜ \`${p}promover @user\`
╰➜ \`${p}rebaixar @user\`
╰➜ \`${p}ban @user\`
╰➜ \`${p}mute @user\`
╰➜ \`${p}desmute @user\`
╰➜ \`${p}p\` (reply)
╰➜ \`${p}totag <texto>\`

🏰 𝐆𝐑𝐔𝐏𝐎
╰➜ \`${p}abrir\` / \`${p}fechar\`
╰➜ \`${p}link\`
╰➜ \`${p}soadm on/off\`
╰➜ \`${p}namegp <nome>\`
╰➜ \`${p}descricao <texto>\`

👑 𝐒𝐔𝐁-𝐀𝐃𝐌
╰➜ \`${p}subadm @user\`
╰➜ \`${p}delsubadm @user\`
╰➜ \`${p}listasubadm\`

🛡️ 𝐏𝐑𝐎𝐓𝐄𝐂̧𝐎̃𝐄𝐒
╰➜ \`${p}antilink on/off\`
╰➜ \`${p}antiaudio on/off\`
╰➜ \`${p}antivideo on/off\`
╰➜ \`${p}antifoto on/off\`
╰➜ \`${p}antifig on/off\`
╰➜ \`${p}palavrao on/off\`
╰➜ \`${p}addpalavra <palavra>\`
╰➜ \`${p}rmpalavra <palavra>\`
╰➜ \`${p}listapalavra\`

🕵️ 𝐗𝟗 / 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀
╰➜ \`${p}x9 on/off\`
╰➜ \`${p}modoparceria on/off\`
╰➜ \`${p}addparceria @user <qtd>\`
╰➜ \`${p}rmparceria @user\`
╰➜ \`${p}parcerias\`

🚫 𝐋𝐈𝐒𝐓𝐀 𝐍𝐄𝐆𝐑𝐀
╰➜ \`${p}listanegra <número>\`
╰➜ \`${p}blacklist\`
╰➜ \`${p}dellista <número>\`

👋 𝐁𝐄𝐌-𝐕𝐈𝐍𝐃𝐎
╰➜ \`${p}bemvindo on/off\`
╰➜ \`${p}textobv <texto>\`
╰➜ \`${p}fundoBV\` (reply)
╰➜ \`${p}legendasaiu <texto>\`
╰➜ \`${p}fundoSaiu\` (reply)

⏰ 𝐀𝐆𝐄𝐍𝐃𝐀𝐌𝐄𝐍𝐓𝐎
╰➜ \`${p}abrirgp hh:mm\`
╰➜ \`${p}fechargp hh:mm\`
╰➜ \`${p}fotoabrir\` (reply)
╰➜ \`${p}fotofechar\` (reply)
╰➜ \`${p}legendaabrir <texto>\`
╰➜ \`${p}legendafechar <texto>\`
╰➜ \`${p}limparfotos\`

🤖 𝐈𝐍𝐓𝐄𝐋𝐈𝐆𝐄̂𝐍𝐂𝐈𝐀
╰➜ \`${p}iaon\`
╰➜ \`${p}iaoff\`

🎁 𝐒𝐎𝐑𝐓𝐄𝐈𝐎
╰➜ \`${p}sorteio <prêmio> <tempo>\`

🎴 𝐅𝐈𝐆𝐔𝐑𝐈𝐍𝐇𝐀𝐒 𝐂𝐎𝐌𝐀𝐍𝐃𝐎
╰➜ \`${p}rgfig <comando>\` (reply)
╰➜ \`${p}rmfig\` (reply)
╰➜ \`${p}listafig\`

❄️ 𝐏𝐫𝐞𝐟𝐢𝐱𝐨 𝐚𝐭𝐮𝐚𝐥: \`${p}\`

"${nomeBot}"`

        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          if (cfg.tipoMenu === "video") return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "akaza.mp4", gifPlayback: true, caption: texto }, { quoted: msg })
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

        await sock.sendMessage(jid, {
          text:
`❄️ • 𝐏𝐑𝐄𝐅𝐈𝐗𝐎 •

╭─〔 ♦️ 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐂̧𝐀̃𝐎 〕
│ Sistema de prefixos do bot.
╰──────────────

『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴

❄️ 𝐏𝐚𝐝𝐫𝐚̃𝐨:
╰➜ ${padrao}

🎯 𝐀𝐭𝐢𝐯𝐨 𝐚𝐠𝐨𝐫𝐚:
╰➜ ${prefixoAtivo}

⚙️ 𝐌𝐮𝐥𝐭𝐢𝐩𝐫𝐞𝐟𝐢𝐱𝐨:
╰➜ ${multiStatus}

📌 𝐏𝐫𝐞𝐟𝐢𝐱𝐨 𝐝𝐨 𝐠𝐫𝐮𝐩𝐨:
╰➜ ${prefixoGrupo}

⚔️ 𝐀𝐜𝐞𝐢𝐭𝐨𝐬:
╰➜ ! e /

"${nomeBot}"`
        }, { quoted: msg })
      }
    },

    p: {
      aliases: ["apagar", "delmsg"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo
        if (!ctx || !ctx.stanzaId) {
          return sock.sendMessage(jid, {
            text: msgAviso("𝐀𝐏𝐀𝐆𝐀𝐑 𝐌𝐄𝐍𝐒𝐀𝐆𝐄𝐌", "Você precisa responder uma mensagem.", "💡 Responda uma msg com `!p`", null, nomeBot)
          }, { quoted: msg })
        }
        if (!utils.botEhAdmin(groupMetadata, sock)) {
          return sock.sendMessage(jid, {
            text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Eu preciso ser admin.", "⚠️ Promova o bot a admin.", null, nomeBot)
          }, { quoted: msg })
        }
        try {
          await sock.sendMessage(jid, { delete: { remoteJid: jid, fromMe: false, id: ctx.stanzaId, participant: ctx.participant || (ctx.mentionedJid && ctx.mentionedJid[0]) } })
          await sock.sendMessage(jid, {
            text: msgSucesso("𝐌𝐄𝐍𝐒𝐀𝐆𝐄𝐌 𝐀𝐏𝐀𝐆𝐀𝐃𝐀", "Apagada com sucesso.", "🔥 _\"Ninguém viu...\"_", null, nomeBot)
          }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: "❄️ " + e.message }, { quoted: msg }) }
      }
    },

    abrir: {
      aliases: ["opennow"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "⚠️ Promova o bot a admin.", null, nomeBot) }, { quoted: msg })
        try {
          await sock.groupSettingUpdate(jid, "not_announcement")
          await sock.sendMessage(jid, { text: msgSucesso("𝐆𝐑𝐔𝐏𝐎 𝐀𝐁𝐄𝐑𝐓𝐎", "O grupo foi aberto.", "🔓 _\"A força ilumina todos.\"_", null, nomeBot) }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: "❄️ " + e.message }, { quoted: msg }) }
      }
    },

    fechar: {
      aliases: ["closenow"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "⚠️ Promova o bot a admin.", null, nomeBot) }, { quoted: msg })
        try {
          await sock.groupSettingUpdate(jid, "announcement")
          await sock.sendMessage(jid, { text: msgSucesso("𝐆𝐑𝐔𝐏𝐎 𝐅𝐄𝐂𝐇𝐀𝐃𝐎", "O grupo foi fechado.", "🔒 _\"Só os fortes falam.\"_", null, nomeBot) }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: "❄️ " + e.message }, { quoted: msg }) }
      }
    },

    namegp: {
      aliases: ["setnomegp", "nomegrupo"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, groupMetadata, utils, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const nome = args.join(" ").trim()
        if (!nome) return sock.sendMessage(jid, { text: msgAviso("𝐍𝐎𝐌𝐄 𝐃𝐎 𝐆𝐑𝐔𝐏𝐎", "Informe o nome.", "💡 `!namegp <nome>`", null, nomeBot) }, { quoted: msg })
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "⚠️ Promova o bot a admin.", null, nomeBot) }, { quoted: msg })
        try {
          await sock.groupUpdateSubject(jid, nome)
          await sock.sendMessage(jid, { text: msgSucesso("𝐍𝐎𝐌𝐄 𝐀𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐃𝐎", "Nome do grupo alterado.", lineEmoji("📝", "𝐍𝐨𝐯𝐨 𝐧𝐨𝐦𝐞", nome), null, nomeBot) }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: "❄️ " + e.message }, { quoted: msg }) }
      }
    },

    descricao: {
      aliases: ["setdescricao", "descgp"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, groupMetadata, utils, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const desc = args.join(" ").trim()
        if (!desc) return sock.sendMessage(jid, { text: msgAviso("𝐃𝐄𝐒𝐂𝐑𝐈𝐂̧𝐀̃𝐎", "Informe o texto.", "💡 `!descricao <texto>`", null, nomeBot) }, { quoted: msg })
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "⚠️ Promova o bot a admin.", null, nomeBot) }, { quoted: msg })
        try {
          await sock.groupUpdateDescription(jid, desc)
          await sock.sendMessage(jid, { text: msgSucesso("𝐃𝐄𝐒𝐂𝐑𝐈𝐂̧𝐀̃𝐎 𝐀𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐃𝐀", "Descrição do grupo alterada.", "📝 _Novo texto salvo._", null, nomeBot) }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: "❄️ " + e.message }, { quoted: msg }) }
      }
    },

    link: {
      aliases: ["linkgp"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "⚠️ Promova o bot a admin.", null, nomeBot) }, { quoted: msg })
        try {
          const code = await sock.groupInviteCode(jid)
          await sock.sendMessage(jid, { text: msgSucesso("𝐋𝐈𝐍𝐊 𝐃𝐎 𝐆𝐑𝐔𝐏𝐎", "Link gerado com sucesso.", lineEmoji("🔗", "𝐋𝐢𝐧𝐤", "https://chat.whatsapp.com/" + code), null, nomeBot) }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: "❄️ " + e.message }, { quoted: msg }) }
      }
    },

    mute: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        const nomeBot = nomeBotDb(db)
        if (!alvo) return sock.sendMessage(jid, { text: msgAviso("𝐌𝐔𝐓𝐄", "Marque alguém.", "💡 `!mute @user`", null, nomeBot) }, { quoted: msg })
        const mutados = db.mutados()
        mutados[jid] = mutados[jid] || {}
        mutados[jid][alvo] = Date.now() + 5 * 60 * 1000
        db.salvarMutados(mutados)
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
        const mutados = db.mutados()
        if (mutados[jid] && mutados[jid][alvo]) { delete mutados[jid][alvo]; db.salvarMutados(mutados) }
        await sock.sendMessage(jid, { text: msgSucesso("𝐔𝐒𝐔𝐀́𝐑𝐈𝐎 𝐋𝐈𝐁𝐄𝐑𝐀𝐃𝐎", "O usuário pode falar novamente.", lineEmoji("👤", "𝐔𝐬𝐮𝐚́𝐫𝐢𝐨", "@" + utils.soNumero(alvo)), null, nomeBot), mentions: [alvo] }, { quoted: msg })
      }
    },

    palavrao: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: msgAviso("𝐏𝐀𝐋𝐀𝐕𝐑𝐀̃𝐎", "Use on ou off.", "💡 `!palavrao on/off`", null, nomeBot) }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].palavrao = opcao === "on"; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐀𝐋𝐀𝐕𝐑𝐀̃𝐎 𝐀𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐃𝐎", "Filtro de palavras configurado.", lineEmoji("⚙️", "𝐒𝐭𝐚𝐭𝐮𝐬", opcao.toUpperCase()), null, nomeBot) }, { quoted: msg })
      }
    },

    addpalavra: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const palavra = args.join(" ").trim().toLowerCase()
        if (!palavra) return sock.sendMessage(jid, { text: msgAviso("𝐀𝐃𝐈𝐂𝐈𝐎𝐍𝐀𝐑 𝐏𝐀𝐋𝐀𝐕𝐑𝐀", "Informe a palavra.", "💡 `!addpalavra <palavra>`", null, nomeBot) }, { quoted: msg })
        const p = db.palavroes(); p[jid] = p[jid] || []
        if (p[jid].includes(palavra)) return sock.sendMessage(jid, { text: msgAviso("𝐏𝐀𝐋𝐀𝐕𝐑𝐀 𝐉𝐀́ 𝐄𝐗𝐈𝐒𝐓𝐄", "Essa palavra já está na lista.", lineEmoji("📝", "𝐏𝐚𝐥𝐚𝐯𝐫𝐚", palavra), null, nomeBot) }, { quoted: msg })
        p[jid].push(palavra); db.salvarPalavroes(p)
        await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐀𝐋𝐀𝐕𝐑𝐀 𝐀𝐃𝐈𝐂𝐈𝐎𝐍𝐀𝐃𝐀", "Palavra adicionada à lista negra.", lineEmoji("📝", "𝐏𝐚𝐥𝐚𝐯𝐫𝐚", palavra), null, nomeBot) }, { quoted: msg })
      }
    },

    rmpalavra: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const palavra = args.join(" ").trim().toLowerCase()
        if (!palavra) return sock.sendMessage(jid, { text: msgAviso("𝐑𝐄𝐌𝐎𝐕𝐄𝐑 𝐏𝐀𝐋𝐀𝐕𝐑𝐀", "Informe a palavra.", "💡 `!rmpalavra <palavra>`", null, nomeBot) }, { quoted: msg })
        const p = db.palavroes(); const arr = p[jid] || []
        const idx = arr.indexOf(palavra)
        if (idx === -1) return sock.sendMessage(jid, { text: msgAviso("𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐀", "Essa palavra não está na lista.", lineEmoji("📝", "𝐏𝐚𝐥𝐚𝐯𝐫𝐚", palavra), null, nomeBot) }, { quoted: msg })
        arr.splice(idx, 1); p[jid] = arr; db.salvarPalavroes(p)
        await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐀𝐋𝐀𝐕𝐑𝐀 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐀", "Palavra removida com sucesso.", lineEmoji("📝", "𝐏𝐚𝐥𝐚𝐯𝐫𝐚", palavra), null, nomeBot) }, { quoted: msg })
      }
    },

    listapalavra: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const lista = db.palavroes()[jid] || []
        if (!lista.length) return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐒𝐓𝐀 𝐕𝐀𝐙𝐈𝐀", "Nenhuma palavra cadastrada.", "💡 Use `!addpalavra <palavra>`", null, nomeBot) }, { quoted: msg })
        let t = "❄️ • 𝐏𝐀𝐋𝐀𝐕𝐑𝐀𝐒 𝐏𝐑𝐎𝐈𝐁𝐈𝐃𝐀𝐒 •\n\n『 𝐋𝐢𝐬𝐭𝐚 』 ↴\n\n"
        lista.forEach((p, i) => { t += `╰➜ ${i + 1}. \`${p}\`\n` })
        t += `\n📊 𝐓𝐨𝐭𝐚𝐥: ${lista.length}\n\n"${nomeBot}"`
        await sock.sendMessage(jid, { text: t }, { quoted: msg })
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

    antiaudio: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: msgAviso("𝐀𝐍𝐓𝐈𝐀́𝐔𝐃𝐈𝐎", "Use on ou off.", "💡 `!antiaudio on/off`", null, nomeBot) }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].antiaudio = opcao === "on"; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐍𝐓𝐈𝐀́𝐔𝐃𝐈𝐎", "Proteção contra áudios atualizada.", lineEmoji("⚙️", "𝐒𝐭𝐚𝐭𝐮𝐬", opcao.toUpperCase()), null, nomeBot) }, { quoted: msg })
      }
    },

    antivideo: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: msgAviso("𝐀𝐍𝐓𝐈𝐕𝐈́𝐃𝐄𝐎", "Use on ou off.", "💡 `!antivideo on/off`", null, nomeBot) }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].antivideo = opcao === "on"; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐍𝐓𝐈𝐕𝐈́𝐃𝐄𝐎", "Proteção contra vídeos atualizada.", lineEmoji("⚙️", "𝐒𝐭𝐚𝐭𝐮𝐬", opcao.toUpperCase()), null, nomeBot) }, { quoted: msg })
      }
    },

    antifoto: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: msgAviso("𝐀𝐍𝐓𝐈𝐅𝐎𝐓𝐎", "Use on ou off.", "💡 `!antifoto on/off`", null, nomeBot) }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].antifoto = opcao === "on"; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐍𝐓𝐈𝐅𝐎𝐓𝐎", "Proteção contra fotos atualizada.", lineEmoji("⚙️", "𝐒𝐭𝐚𝐭𝐮𝐬", opcao.toUpperCase()), null, nomeBot) }, { quoted: msg })
      }
    },

    antifig: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: msgAviso("𝐀𝐍𝐓𝐈𝐅𝐈𝐆", "Use on ou off.", "💡 `!antifig on/off`", null, nomeBot) }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].antifig = opcao === "on"; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐍𝐓𝐈𝐅𝐈𝐆", "Proteção contra figurinhas atualizada.", lineEmoji("⚙️", "𝐒𝐭𝐚𝐭𝐮𝐬", opcao.toUpperCase()), null, nomeBot) }, { quoted: msg })
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
        try {
          await sock.groupParticipantsUpdate(jid, [part.id], "promote")
          await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐑𝐎𝐌𝐎𝐕𝐈𝐃𝐎", "O usuário virou admin.", lineEmoji("👤", "𝐔𝐬𝐮𝐚́𝐫𝐢𝐨", "@" + n) + "\n" + lineEmoji("⚔️", "𝐍𝐨𝐯𝐨 𝐜𝐚𝐫𝐠𝐨", "𝐀𝐃𝐌𝐈𝐍"), "⚔️ _\"Bem-vindo à elite.\"_", nomeBot), mentions: [part.id] }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: "❄️ " + e.message }, { quoted: msg }) }
      }
    },

    rebaixar: {
      aliases: ["demote", "tiraradm"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const alvoRaw = utils.getAlvo(msg)
        if (!alvoRaw) return sock.sendMessage(jid, { text: msgAviso("𝐑𝐄𝐁𝐀𝐈𝐗𝐀𝐑", "Marque alguém.", "💡 `!rebaixar @user`", null, nomeBot) }, { quoted: msg })
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "⚠️ Promova o bot a admin.", null, nomeBot) }, { quoted: msg })
        const n = utils.soNumero(alvoRaw)
        const part = groupMetadata.participants.find(p => [p.id, p.lid, p.phoneNumber].filter(Boolean).map(utils.soNumero).includes(n))
        if (!part) return sock.sendMessage(jid, { text: msgErro("𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎", "Usuário não está no grupo.", lineEmoji("👤", "𝐔𝐬𝐮𝐚́𝐫𝐢𝐨", "@" + n), null, nomeBot) }, { quoted: msg })
        try {
          await sock.groupParticipantsUpdate(jid, [part.id], "demote")
          await sock.sendMessage(jid, { text: msgSucesso("𝐑𝐄𝐁𝐀𝐈𝐗𝐀𝐃𝐎", "O usuário perdeu o cargo de admin.", lineEmoji("👤", "𝐔𝐬𝐮𝐚́𝐫𝐢𝐨", "@" + n) + "\n" + lineEmoji("⚔️", "𝐂𝐚𝐫𝐠𝐨", "𝐌𝐄𝐌𝐁𝐑𝐎"), "⚔️ _\"A força não brilha pra todos.\"_", nomeBot), mentions: [part.id] }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: "❄️ " + e.message }, { quoted: msg }) }
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
        try {
          await sock.groupParticipantsUpdate(jid, [part.id], "remove")
          await sock.sendMessage(jid, { text: msgSucesso("𝐄𝐗𝐏𝐔𝐋𝐒𝐎", "O usuário foi removido do grupo.", lineEmoji("👤", "𝐔𝐬𝐮𝐚́𝐫𝐢𝐨", "@" + n), "⚔️ _\"A força não perdoa.\"_", nomeBot), mentions: [part.id] }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: "❄️ " + e.message }, { quoted: msg }) }
      }
    },

    veradv: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: msgAviso("𝐕𝐄𝐑 𝐀𝐃𝐕", "Marque alguém.", "💡 `!veradv @user`", null, nomeBot) }, { quoted: msg })
        const total = (db.advs()[jid] && db.advs()[jid][alvo]) || 0
        await sock.sendMessage(jid, { text: msgSucesso("𝐅𝐈𝐂𝐇𝐀 𝐃𝐎 𝐔𝐒𝐔𝐀́𝐑𝐈𝐎", "Consulta de advertências.", lineEmoji("👤", "𝐔𝐬𝐮𝐚́𝐫𝐢𝐨", "@" + utils.soNumero(alvo)) + "\n" + lineEmoji("⚠️", "𝐀𝐝𝐯𝐞𝐫𝐭𝐞̂𝐧𝐜𝐢𝐚𝐬", total + "/3"), null, nomeBot), mentions: [alvo] }, { quoted: msg })
      }
    },

    adv: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: msgAviso("𝐀𝐃𝐕𝐄𝐑𝐓𝐈𝐑", "Marque alguém.", "💡 `!adv @user <motivo>`", null, nomeBot) }, { quoted: msg })
        const motivo = args.filter(a => !a.includes("@")).join(" ") || "Sem motivo"
        const advs = db.advs()
        advs[jid] = advs[jid] || {}
        advs[jid][alvo] = (advs[jid][alvo] || 0) + 1
        const total = advs[jid][alvo]
        const n = utils.soNumero(alvo)
        if (total >= 3) {
          delete advs[jid][alvo]; db.salvarAdvs(advs)
          await sock.sendMessage(jid, { text: msgErro("𝐋𝐈𝐌𝐈𝐓𝐄 𝐀𝐓𝐈𝐍𝐆𝐈𝐃𝐎", "O usuário atingiu 3/3 e foi removido.", lineEmoji("👤", "𝐔𝐬𝐮𝐚́𝐫𝐢𝐨", "@" + n) + "\n" + lineEmoji("📄", "𝐌𝐨𝐭𝐢𝐯𝐨", motivo), "⚔️ _\"Sentença da força.\"_", nomeBot), mentions: [alvo] }, { quoted: msg })
          try { await sock.groupParticipantsUpdate(jid, [alvo], "remove") } catch (_) {}
          return
        }
        db.salvarAdvs(advs)
        await sock.sendMessage(jid, { text: msgAviso("𝐀𝐃𝐕𝐄𝐑𝐓𝐄̂𝐍𝐂𝐈𝐀 𝐃𝐀𝐃𝐀", "Usuário advertido.", lineEmoji("👤", "𝐔𝐬𝐮𝐚́𝐫𝐢𝐨", "@" + n) + "\n" + lineEmoji("⚠️", "𝐀𝐝𝐯𝐞𝐫𝐭𝐞̂𝐧𝐜𝐢𝐚𝐬", total + "/3") + "\n" + lineEmoji("📄", "𝐌𝐨𝐭𝐢𝐯𝐨", motivo), null, nomeBot), mentions: [alvo] }, { quoted: msg })
      }
    },

    deladv: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: msgAviso("𝐑𝐄𝐌𝐎𝐕𝐄𝐑 𝐀𝐃𝐕", "Marque alguém.", "💡 `!deladv @user`", null, nomeBot) }, { quoted: msg })
        const advs = db.advs()
        const atual = (advs[jid] && advs[jid][alvo]) || 0
        if (atual <= 0) return sock.sendMessage(jid, { text: msgSucesso("𝐅𝐈𝐂𝐇𝐀 𝐋𝐈𝐌𝐏𝐀", "O usuário não tem advertências.", lineEmoji("👤", "𝐔𝐬𝐮𝐚́𝐫𝐢𝐨", "@" + utils.soNumero(alvo)), null, nomeBot), mentions: [alvo] }, { quoted: msg })
        advs[jid][alvo] = atual - 1
        if (advs[jid][alvo] === 0) delete advs[jid][alvo]
        db.salvarAdvs(advs)
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐃𝐕 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐀", "Uma advertência foi removida.", lineEmoji("👤", "𝐔𝐬𝐮𝐚́𝐫𝐢𝐨", "@" + utils.soNumero(alvo)) + "\n" + lineEmoji("⚠️", "𝐀𝐝𝐯𝐞𝐫𝐭𝐞̂𝐧𝐜𝐢𝐚𝐬", ((advs[jid] && advs[jid][alvo]) || 0) + "/3"), null, nomeBot), mentions: [alvo] }, { quoted: msg })
      }
    },

    listaadv: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const entradas = Object.entries(db.advs()[jid] || {})
        if (!entradas.length) return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐒𝐓𝐀 𝐕𝐀𝐙𝐈𝐀", "Nenhuma advertência registrada.", "💡 Use `!adv @user`", null, nomeBot) }, { quoted: msg })
        entradas.sort((a, b) => b[1] - a[1])
        let t = "❄️ • 𝐅𝐈𝐂𝐇𝐀𝐒 𝐒𝐔𝐉𝐀𝐒 •\n\n『 𝐋𝐢𝐬𝐭𝐚 』 ↴\n\n"
        entradas.forEach(([j, q], i) => { t += `╰➜ ${i + 1}. @${utils.soNumero(j)} — *${q}/3*\n` })
        t += `\n📊 𝐓𝐨𝐭𝐚𝐥: ${entradas.length}\n\n"${nomeBot}"`
        await sock.sendMessage(jid, { text: t, mentions: entradas.map(e => e[0]) }, { quoted: msg })
      }
    },

    totag: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, groupMetadata }) {
        const jid = msg.key.remoteJid
        let texto = args.join(" ").trim()
        if (!texto) {
          const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
          const q = ctx.quotedMessage
          if (q) texto = q.conversation || (q.extendedTextMessage && q.extendedTextMessage.text) || (q.imageMessage && q.imageMessage.caption) || ""
        }
        if (!texto) return sock.sendMessage(jid, { text: "❄️ `!totag <texto>`" }, { quoted: msg })
        const mentions = groupMetadata.participants.map(p => p.id)
        await sock.sendMessage(jid, { text: texto, mentions }, { quoted: msg })
      }
    },

    subadm: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: msgAviso("𝐒𝐔𝐁-𝐀𝐃𝐌", "Marque alguém.", "💡 `!subadm @user`", null, nomeBot) }, { quoted: msg })
        const subs = db.subadmins(); subs[jid] = subs[jid] || []
        if (subs[jid].some(s => utils.soNumero(s) === utils.soNumero(alvo))) return sock.sendMessage(jid, { text: msgAviso("𝐉𝐀́ 𝐄́ 𝐒𝐔𝐁-𝐀𝐃𝐌", "O usuário já é Sub-Adm.", lineEmoji("👤", "𝐔𝐬𝐮𝐚́𝐫𝐢𝐨", "@" + utils.soNumero(alvo)), null, nomeBot) }, { quoted: msg })
        subs[jid].push(alvo); db.salvarSubadmins(subs)
        await sock.sendMessage(jid, { text: msgSucesso("𝐒𝐔𝐁-𝐀𝐃𝐌 𝐀𝐃𝐈𝐂𝐈𝐎𝐍𝐀𝐃𝐎", "O usuário virou Sub-Adm.", lineEmoji("👤", "𝐔𝐬𝐮𝐚́𝐫𝐢𝐨", "@" + utils.soNumero(alvo)) + "\n" + lineEmoji("⚔️", "𝐂𝐚𝐫𝐠𝐨", "𝐒𝐔𝐁-𝐀𝐃𝐌"), null, nomeBot), mentions: [alvo] }, { quoted: msg })
      }
    },

    delsubadm: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: msgAviso("𝐑𝐄𝐌𝐎𝐕𝐄𝐑 𝐒𝐔𝐁-𝐀𝐃𝐌", "Marque alguém.", "💡 `!delsubadm @user`", null, nomeBot) }, { quoted: msg })
        const subs = db.subadmins()
        subs[jid] = (subs[jid] || []).filter(s => utils.soNumero(s) !== utils.soNumero(alvo))
        db.salvarSubadmins(subs)
        await sock.sendMessage(jid, { text: msgSucesso("𝐒𝐔𝐁-𝐀𝐃𝐌 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐎", "O usuário não é mais Sub-Adm.", lineEmoji("👤", "𝐔𝐬𝐮𝐚́𝐫𝐢𝐨", "@" + utils.soNumero(alvo)), null, nomeBot), mentions: [alvo] }, { quoted: msg })
      }
    },

    listasubadm: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const subs = db.subadmins()[jid] || []
        if (!subs.length) return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐒𝐓𝐀 𝐕𝐀𝐙𝐈𝐀", "Nenhum Sub-Adm cadastrado.", "💡 Use `!subadm @user`", null, nomeBot) }, { quoted: msg })
        let t = "❄️ • 𝐒𝐔𝐁-𝐀𝐃𝐌𝐈𝐍𝐒 •\n\n『 𝐋𝐢𝐬𝐭𝐚 』 ↴\n\n"
        subs.forEach((s, i) => { t += `╰➜ ${i + 1}. @${utils.soNumero(s)}\n` })
        t += `\n📊 𝐓𝐨𝐭𝐚𝐥: ${subs.length}\n\n"${nomeBot}"`
        await sock.sendMessage(jid, { text: t, mentions: subs }, { quoted: msg })
      }
    },

    soadm: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: msgAviso("𝐒𝐎 𝐀𝐃𝐌", "Use on ou off.", "💡 `!soadm on/off`", null, nomeBot) }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].soadm = opcao === "on"; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: msgSucesso("𝐒𝐎 𝐀𝐃𝐌", "Configuração atualizada.", lineEmoji("⚙️", "𝐒𝐭𝐚𝐭𝐮𝐬", opcao.toUpperCase()), null, nomeBot) }, { quoted: msg })
      }
    },

    multiprefixo: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: msgAviso("𝐌𝐔𝐋𝐓𝐈𝐏𝐑𝐄𝐅𝐈𝐗𝐎", "Use on ou off.", "💡 `!multiprefixo on/off`", null, nomeBot) }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].multiprefixo = opcao === "on"; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: msgSucesso("𝐌𝐔𝐋𝐓𝐈𝐏𝐑𝐄𝐅𝐈𝐗𝐎", "Configuração atualizada.", lineEmoji("⚙️", "𝐒𝐭𝐚𝐭𝐮𝐬", opcao.toUpperCase()), null, nomeBot) }, { quoted: msg })
      }
    },

    setprefixo: {
      aliases: ["setprefix", "trocarp"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const g = db.grupos()
        const conf = g[jid] || {}
        if (!conf.multiprefixo) return sock.sendMessage(jid, { text: msgAviso("𝐌𝐔𝐋𝐓𝐈𝐏𝐑𝐄𝐅𝐈𝐗𝐎 𝐎𝐅𝐅", "Ative o multiprefixo primeiro.", "💡 `!multiprefixo on`", null, nomeBot) }, { quoted: msg })
        const novo = args[0]
        if (!novo) return sock.sendMessage(jid, { text: msgAviso("𝐒𝐄𝐓𝐏𝐑𝐄𝐅𝐈𝐗𝐎", "Informe o novo prefixo.", "💡 `!setprefixo <novo>`", null, nomeBot) }, { quoted: msg })
        if (novo.length > 3) return sock.sendMessage(jid, { text: msgErro("𝐌𝐔𝐈𝐓𝐎 𝐋𝐎𝐍𝐆𝐎", "O prefixo deve ter no máximo 3 caracteres.", lineEmoji("📝", "𝐕𝐚𝐥𝐨𝐫", novo), null, nomeBot) }, { quoted: msg })
        g[jid].prefixo = novo; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐑𝐄𝐅𝐈𝐗𝐎 𝐀𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐃𝐎", "Prefixo do grupo alterado.", lineEmoji("📝", "𝐍𝐨𝐯𝐨", "`" + novo + "`"), null, nomeBot) }, { quoted: msg })
      }
    },

    x9: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: msgAviso("𝐗𝟗", "Use on ou off.", "💡 `!x9 on/off`", null, nomeBot) }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].x9 = opcao === "on"; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: msgSucesso("𝐗𝟗 𝐀𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐃𝐎", "Espionagem configurada.", lineEmoji("⚙️", "𝐒𝐭𝐚𝐭𝐮𝐬", opcao.toUpperCase()), null, nomeBot) }, { quoted: msg })
      }
    },

    listanegra: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, groupMetadata, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const numero = (args[0] || "").replace(/\D/g, "")
        if (!numero || numero.length < 8) return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐒𝐓𝐀 𝐍𝐄𝐆𝐑𝐀", "Informe o número.", "💡 `!listanegra <número>`", null, nomeBot) }, { quoted: msg })
        const lista = db.listanegra(); lista[jid] = lista[jid] || []
        if (lista[jid].includes(numero)) return sock.sendMessage(jid, { text: msgAviso("𝐉𝐀́ 𝐍𝐀 𝐋𝐈𝐒𝐓𝐀", "Esse número já está na lista negra.", lineEmoji("📱", "𝐍𝐮́𝐦𝐞𝐫𝐨", "+" + numero), null, nomeBot) }, { quoted: msg })
        lista[jid].push(numero); db.salvarListanegra(lista)
        await sock.sendMessage(jid, { text: msgSucesso("𝐍𝐔́𝐌𝐄𝐑𝐎 𝐀𝐃𝐈𝐂𝐈𝐎𝐍𝐀𝐃𝐎", "Número marcado na lista negra.", lineEmoji("📱", "𝐍𝐮́𝐦𝐞𝐫𝐨", "+" + numero), null, nomeBot) }, { quoted: msg })
        try {
          const part = groupMetadata && groupMetadata.participants.find(p => [p.id, p.lid, p.phoneNumber].filter(Boolean).map(utils.soNumero).includes(numero))
          if (part) {
            await sock.groupParticipantsUpdate(jid, [part.id], "remove")
            await sock.sendMessage(jid, { text: msgSucesso("𝐄𝐗𝐏𝐔𝐋𝐒𝐎 𝐀𝐔𝐓𝐎𝐌𝐀́𝐓𝐈𝐂𝐎", "O usuário foi removido.", lineEmoji("👤", "𝐔𝐬𝐮𝐚́𝐫𝐢𝐨", "@" + numero), null, nomeBot), mentions: [part.id] })
          }
        } catch (_) {}
      }
    },

    blacklist: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const lista = (db.listanegra()[jid] || [])
        if (!lista.length) return sock.sendMessage(jid, { text: msgAviso("𝐋𝐈𝐒𝐓𝐀 𝐕𝐀𝐙𝐈𝐀", "Nenhum número na lista negra.", "💡 Use `!listanegra <número>`", null, nomeBot) }, { quoted: msg })
        let t = "❄️ • 𝐓𝐑𝐀𝐈𝐃𝐎𝐑𝐄𝐒 •\n\n『 𝐋𝐢𝐬𝐭𝐚 』 ↴\n\n"
        lista.forEach((n, i) => { t += `╰➜ ${i + 1}. +${n}\n` })
        t += `\n📊 𝐓𝐨𝐭𝐚𝐥: ${lista.length}\n\n"${nomeBot}"`
        await sock.sendMessage(jid, { text: t }, { quoted: msg })
      }
    },

    dellista: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const numero = (args[0] || "").replace(/\D/g, "")
        if (!numero) return sock.sendMessage(jid, { text: msgAviso("𝐃𝐄𝐋𝐋𝐈𝐒𝐓𝐀", "Informe o número.", "💡 `!dellista <número>`", null, nomeBot) }, { quoted: msg })
        const lista = db.listanegra(); const arr = lista[jid] || []
        const idx = arr.indexOf(numero)
        if (idx === -1) return sock.sendMessage(jid, { text: msgAviso("𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎", "Número não está na lista.", lineEmoji("📱", "𝐍𝐮́𝐦𝐞𝐫𝐨", "+" + numero), null, nomeBot) }, { quoted: msg })
        arr.splice(idx, 1); lista[jid] = arr; db.salvarListanegra(lista)
        await sock.sendMessage(jid, { text: msgSucesso("𝐍𝐔́𝐌𝐄𝐑𝐎 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐎", "Número perdoado.", lineEmoji("📱", "𝐍𝐮́𝐦𝐞𝐫𝐨", "+" + numero), null, nomeBot) }, { quoted: msg })
      }
    },

    bemvindo: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: msgAviso("𝐁𝐄𝐌-𝐕𝐈𝐍𝐃𝐎", "Use on ou off.", "💡 `!bemvindo on/off`", null, nomeBot) }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].bemvindo = opcao === "on"; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: msgSucesso("𝐁𝐄𝐌-𝐕𝐈𝐍𝐃𝐎", "Mensagem de boas-vindas atualizada.", lineEmoji("⚙️", "𝐒𝐭𝐚𝐭𝐮𝐬", opcao.toUpperCase()), null, nomeBot) }, { quoted: msg })
      }
    },

    textobv: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const t = args.join(" ").trim()
        if (!t) return sock.sendMessage(jid, { text: msgAviso("𝐓𝐄𝐗𝐓𝐎 𝐁𝐕", "Informe o texto.", "💡 `!textobv <texto>` (%nmr%)", null, nomeBot) }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].textobv = t; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: msgSucesso("𝐓𝐄𝐗𝐓𝐎 𝐒𝐀𝐋𝐕𝐎", "Texto de boas-vindas salvo.", lineEmoji("📝", "𝐓𝐞𝐱𝐭𝐨", t), null, nomeBot) }, { quoted: msg })
      }
    },

    fundobv: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const quoted = ctx.quotedMessage
        const tem = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage)
        if (!tem) return sock.sendMessage(jid, { text: msgAviso("𝐅𝐔𝐍𝐃𝐎 𝐁𝐕", "Envie ou responda uma imagem.", "💡 `!fundobv` (reply imagem)", null, nomeBot) }, { quoted: msg })
        const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage } })
        const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].fundobv = buffer.toString("base64"); db.salvarGrupos(g)
        await sock.sendMessage(jid, { image: buffer, caption: msgSucesso("𝐅𝐔𝐍𝐃𝐎 𝐁𝐕 𝐒𝐀𝐋𝐕𝐎", "Imagem de boas-vindas salva.", "🖼️ _Aplicada ao grupo._", null, nomeBot) }, { quoted: msg })
      }
    },

    legendasaiu: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const t = args.join(" ").trim()
        if (!t) return sock.sendMessage(jid, { text: msgAviso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀 𝐒𝐀𝐈𝐔", "Informe o texto.", "💡 `!legendasaiu <texto>` (%nmr%)", null, nomeBot) }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].legendasaiu = t; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: msgSucesso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀 𝐒𝐀𝐋𝐕𝐀", "Legenda de partida salva.", lineEmoji("📝", "𝐓𝐞𝐱𝐭𝐨", t), null, nomeBot) }, { quoted: msg })
      }
    },

    fundosaiu: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const quoted = ctx.quotedMessage
        const tem = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage)
        if (!tem) return sock.sendMessage(jid, { text: msgAviso("𝐅𝐔𝐍𝐃𝐎 𝐒𝐀𝐈𝐔", "Envie ou responda uma imagem.", "💡 `!fundosaiu` (reply imagem)", null, nomeBot) }, { quoted: msg })
        const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage } })
        const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].fundosaiu = buffer.toString("base64"); db.salvarGrupos(g)
        await sock.sendMessage(jid, { image: buffer, caption: msgSucesso("𝐅𝐔𝐍𝐃𝐎 𝐒𝐀𝐈𝐔 𝐒𝐀𝐋𝐕𝐎", "Imagem de partida salva.", "🖼️ _Aplicada ao grupo._", null, nomeBot) }, { quoted: msg })
      }
    },

    abrirgp: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils, groupMetadata }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "⚠️ Promova o bot a admin.", null, nomeBot) }, { quoted: msg })
        const hora = args[0]
        if (!hora || !/^\d{1,2}:\d{2}$/.test(hora)) return sock.sendMessage(jid, { text: msgAviso("𝐀𝐁𝐑𝐈𝐑𝐆𝐏", "Informe o horário.", "💡 `!abrirgp hh:mm`", null, nomeBot) }, { quoted: msg })
        const [h, m] = hora.split(":").map(Number)
        const fmt = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0")
        const g = db.grupos(); g[jid] = g[jid] || {}
        g[jid].abrirHora = fmt; g[jid].ultimoAbrir = null; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: msgSucesso("𝐀𝐁𝐄𝐑𝐓𝐔𝐑𝐀 𝐀𝐆𝐄𝐍𝐃𝐀𝐃𝐀", "O grupo será aberto no horário.", lineEmoji("⏰", "𝐇𝐨𝐫𝐚́𝐫𝐢𝐨", fmt), null, nomeBot) }, { quoted: msg })
      }
    },

    fechargp: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils, groupMetadata }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: msgErro("𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎", "Preciso ser admin.", "⚠️ Promova o bot a admin.", null, nomeBot) }, { quoted: msg })
        const hora = args[0]
        if (!hora || !/^\d{1,2}:\d{2}$/.test(hora)) return sock.sendMessage(jid, { text: msgAviso("𝐅𝐄𝐂𝐇𝐀𝐑𝐆𝐏", "Informe o horário.", "💡 `!fechargp hh:mm`", null, nomeBot) }, { quoted: msg })
        const [h, m] = hora.split(":").map(Number)
        const fmt = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0")
        const g = db.grupos(); g[jid] = g[jid] || {}
        g[jid].fecharHora = fmt; g[jid].ultimoFechar = null; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: msgSucesso("𝐅𝐄𝐂𝐇𝐀𝐌𝐄𝐍𝐓𝐎 𝐀𝐆𝐄𝐍𝐃𝐀𝐃𝐎", "O grupo será fechado no horário.", lineEmoji("⏰", "𝐇𝐨𝐫𝐚́𝐫𝐢𝐨", fmt), null, nomeBot) }, { quoted: msg })
      }
    },

    fotoabrir: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const quoted = ctx.quotedMessage
        const tem = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage)
        const legenda = (args.join(" ").trim()) || (quoted && quoted.imageMessage && quoted.imageMessage.caption) || null
        const g = db.grupos(); g[jid] = g[jid] || {}
        if (tem) {
          const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage } })
          const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          g[jid].fotoAbrir = buffer.toString("base64")
          if (legenda) g[jid].legendaAbrir = legenda
          db.salvarGrupos(g)
          return sock.sendMessage(jid, { image: buffer, caption: msgSucesso("𝐅𝐎𝐓𝐎 𝐀𝐁𝐑𝐈𝐑 𝐒𝐀𝐋𝐕𝐀", "Imagem de abertura salva.", (legenda ? lineEmoji("📝", "𝐋𝐞𝐠𝐞𝐧𝐝𝐚", legenda) : "🖼️ _Aplicada ao grupo._"), null, nomeBot) }, { quoted: msg })
        }
        if (legenda) { g[jid].legendaAbrir = legenda; db.salvarGrupos(g); return sock.sendMessage(jid, { text: msgSucesso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀 𝐒𝐀𝐋𝐕𝐀", "Legenda salva.", lineEmoji("📝", "𝐓𝐞𝐱𝐭𝐨", legenda), null, nomeBot) }, { quoted: msg }) }
        return sock.sendMessage(jid, { text: msgAviso("𝐅𝐎𝐓𝐎 𝐀𝐁𝐑𝐈𝐑", "Envie ou responda uma imagem.", "💡 `!fotoabrir` (reply imagem)", null, nomeBot) }, { quoted: msg })
      }
    },

    fotofechar: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const quoted = ctx.quotedMessage
        const tem = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage)
        const legenda = (args.join(" ").trim()) || (quoted && quoted.imageMessage && quoted.imageMessage.caption) || null
        const g = db.grupos(); g[jid] = g[jid] || {}
        if (tem) {
          const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage } })
          const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          g[jid].fotoFechar = buffer.toString("base64")
          if (legenda) g[jid].legendaFechar = legenda
          db.salvarGrupos(g)
          return sock.sendMessage(jid, { image: buffer, caption: msgSucesso("𝐅𝐎𝐓𝐎 𝐅𝐄𝐂𝐇𝐀𝐑 𝐒𝐀𝐋𝐕𝐀", "Imagem de fechamento salva.", (legenda ? lineEmoji("📝", "𝐋𝐞𝐠𝐞𝐧𝐝𝐚", legenda) : "🖼️ _Aplicada ao grupo._"), null, nomeBot) }, { quoted: msg })
        }
        if (legenda) { g[jid].legendaFechar = legenda; db.salvarGrupos(g); return sock.sendMessage(jid, { text: msgSucesso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀 𝐒𝐀𝐋𝐕𝐀", "Legenda salva.", lineEmoji("📝", "𝐓𝐞𝐱𝐭𝐨", legenda), null, nomeBot) }, { quoted: msg }) }
        return sock.sendMessage(jid, { text: msgAviso("𝐅𝐎𝐓𝐎 𝐅𝐄𝐂𝐇𝐀𝐑", "Envie ou responda uma imagem.", "💡 `!fotofechar` (reply imagem)", null, nomeBot) }, { quoted: msg })
      }
    },

    legendaabrir: {
      aliases: ["setlegendaabrir", "legendabrir", "legendaabrirgp"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        let t = args.join(" ").trim()
        if (!t) {
          const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
          const q = ctx.quotedMessage
          if (q) t = q.conversation || (q.extendedTextMessage && q.extendedTextMessage.text) || (q.imageMessage && q.imageMessage.caption) || ""
        }
        if (!t) return sock.sendMessage(jid, { text: msgAviso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀 𝐀𝐁𝐑𝐈𝐑", "Informe o texto.", "💡 `!legendaabrir <texto>`\n╰➜ ou responda uma msg", null, nomeBot) }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].legendaAbrir = t; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: msgSucesso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀 𝐀𝐁𝐑𝐈𝐑 𝐒𝐀𝐋𝐕𝐀", "Será enviada junto com a foto ao abrir o grupo.", lineEmoji("📝", "𝐓𝐞𝐱𝐭𝐨", t), null, nomeBot) }, { quoted: msg })
      }
    },

    legendafechar: {
      aliases: ["setlegendafechar", "legendfechar", "legendafechargp"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        let t = args.join(" ").trim()
        if (!t) {
          const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
          const q = ctx.quotedMessage
          if (q) t = q.conversation || (q.extendedTextMessage && q.extendedTextMessage.text) || (q.imageMessage && q.imageMessage.caption) || ""
        }
        if (!t) return sock.sendMessage(jid, { text: msgAviso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀 𝐅𝐄𝐂𝐇𝐀𝐑", "Informe o texto.", "💡 `!legendafechar <texto>`\n╰➜ ou responda uma msg", null, nomeBot) }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].legendaFechar = t; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: msgSucesso("𝐋𝐄𝐆𝐄𝐍𝐃𝐀 𝐅𝐄𝐂𝐇𝐀𝐑 𝐒𝐀𝐋𝐕𝐀", "Será enviada junto com a foto ao fechar o grupo.", lineEmoji("📝", "𝐓𝐞𝐱𝐭𝐨", t), null, nomeBot) }, { quoted: msg })
      }
    },

    limparfotos: {
      aliases: ["rmsfotos", "resetfotos", "limparfoto"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const g = db.grupos(); g[jid] = g[jid] || {}
        const tinha = {
          fotoAbrir: !!g[jid].fotoAbrir,
          fotoFechar: !!g[jid].fotoFechar,
          legendaAbrir: !!g[jid].legendaAbrir,
          legendaFechar: !!g[jid].legendaFechar
        }
        delete g[jid].fotoAbrir
        delete g[jid].fotoFechar
        delete g[jid].legendaAbrir
        delete g[jid].legendaFechar
        db.salvarGrupos(g)
        await sock.sendMessage(jid, {
          text: msgSucesso("𝐋𝐈𝐌𝐏𝐄𝐙𝐀 𝐅𝐄𝐈𝐓𝐀", "Fotos e legendas de abrir/fechar foram removidas.", 
            lineEmoji("🖼️", "𝐅𝐨𝐭𝐨 𝐚𝐛𝐫𝐢𝐫", tinha.fotoAbrir ? "removida" : "não tinha") + "\n" +
            lineEmoji("🖼️", "𝐅𝐨𝐭𝐨 𝐟𝐞𝐜𝐡𝐚𝐫", tinha.fotoFechar ? "removida" : "não tinha") + "\n" +
            lineEmoji("📝", "𝐋𝐞𝐠𝐞𝐧𝐝𝐚 𝐚𝐛𝐫𝐢𝐫", tinha.legendaAbrir ? "removida" : "não tinha") + "\n" +
            lineEmoji("📝", "𝐋𝐞𝐠𝐞𝐧𝐝𝐚 𝐟𝐞𝐜𝐡𝐚𝐫", tinha.legendaFechar ? "removida" : "não tinha"),
            null, nomeBot)
        }, { quoted: msg })
      }
    },

    // ============================================================
    // 🤖 INTELIGÊNCIA ARTIFICIAL
    // ============================================================

    iaon: {
      aliases: ["ativaria", "ligaria"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const g = db.grupos(); g[jid] = g[jid] || {}
        g[jid].iaAtiva = true; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: `❄️ • 𝐈𝐀 𝐀𝐓𝐈𝐕𝐀𝐃𝐀 •\n\n╭─〔 ✅ 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Agora eu respondo quando me marcarem.\n╰──────────────\n\n💡 Marque o bot ou responda uma msg dele.\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    iaoff: {
      aliases: ["desligaria", "desativaria"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const g = db.grupos(); g[jid] = g[jid] || {}
        g[jid].iaAtiva = false; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: `❄️ • 𝐈𝐀 𝐃𝐄𝐒𝐀𝐓𝐈𝐕𝐀𝐃𝐀 •\n\n╭─〔 ⚠️ 𝐀𝐕𝐈𝐒𝐎 〕\n│ Não respondo mais automaticamente.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    // ============================================================

    sorteio: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, utils, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        if (args.length < 2) return sock.sendMessage(jid, { text: msgAviso("𝐒𝐎𝐑𝐓𝐄𝐈𝐎", "Informe prêmio e tempo.", "💡 `!sorteio <prêmio> <tempo>`", null, nomeBot) }, { quoted: msg })
        const dRaw = args[args.length - 1].toLowerCase()
        const premio = args.slice(0, -1).join(" ")
        const m = dRaw.match(/^(\d+)(s|m|h)$/)
        if (!m) return sock.sendMessage(jid, { text: msgAviso("𝐅𝐎𝐑𝐌𝐀𝐓𝐎 𝐄𝐑𝐑𝐀𝐃𝐎", "Use 30s / 5m / 1h.", "💡 `!sorteio prêmio 5m`", null, nomeBot) }, { quoted: msg })
        const v = parseInt(m[1]), u = m[2]
        let ms = 0, txt = ""
        if (u === "s") { ms = v * 1000; txt = v + "s" }
        if (u === "m") { ms = v * 60000; txt = v + "min" }
        if (u === "h") { ms = v * 3600000; txt = v + "h" }
        await sock.sendMessage(jid, { text: msgSucesso("𝐒𝐎𝐑𝐓𝐄𝐈𝐎 𝐈𝐍𝐈𝐂𝐈𝐀𝐃𝐎", "Boa sorte a todos!", lineEmoji("🎁", "𝐏𝐫𝐞̂𝐦𝐢𝐨", premio) + "\n" + lineEmoji("⏰", "𝐓𝐞𝐦𝐩𝐨", txt), null, nomeBot) }, { quoted: msg })
        setTimeout(async () => {
          try {
            const meta = await sock.groupMetadata(jid)
            const mbs = meta.participants.map(p => p.id)
            if (!mbs.length) return
            const g = mbs[Math.floor(Math.random() * mbs.length)]
            await sock.sendMessage(jid, { text: msgSucesso("𝐕𝐄𝐍𝐂𝐄𝐃𝐎𝐑", "A força escolheu o sortudo!", lineEmoji("🎁", "𝐏𝐫𝐞̂𝐦𝐢𝐨", premio) + "\n" + lineEmoji("🥇", "𝐕𝐞𝐧𝐜𝐞𝐝𝐨𝐫", "@" + utils.soNumero(g)), null, nomeBot), mentions: [g] })
          } catch (_) {}
        }, ms)
      }
    },

    modoparceria: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const parcerias = db.parcerias()
        parcerias[jid] = parcerias[jid] || { ativo: false, parceiros: {} }
        const sub = (args[0] || "").toLowerCase()
        if (sub === "on") parcerias[jid].ativo = true
        else if (sub === "off") parcerias[jid].ativo = false
        else parcerias[jid].ativo = !parcerias[jid].ativo
        db.salvarParcerias(parcerias)
        await sock.sendMessage(jid, { text: msgSucesso("𝐌𝐎𝐃𝐎 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀", "Configuração atualizada.", lineEmoji("🤝", "𝐒𝐭𝐚𝐭𝐮𝐬", parcerias[jid].ativo ? "ON ✅" : "OFF ❌"), null, nomeBot) }, { quoted: msg })
      }
    },

    parceria: {
      aliases: ["pedirparceria", "quero parceria"],
      adminOnly: false, grupoOnly: true, // Qualquer membro pode usar
      async executar({ sock, msg, db, groupMetadata, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const numUser = utils.soNumero(msg.key.participant || msg.key.remoteJid)
        
        if (!groupMetadata) return

        // Pega todos os admins do grupo
        const admins = groupMetadata.participants.filter(p => p.admin === "admin" || p.admin === "superadmin").map(p => p.id)
        
        if (admins.length === 0) {
          return sock.sendMessage(jid, { 
            text: msgAviso("𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀", "Não encontrei nenhum admin no grupo.", "⚠️ Avise o dono do grupo.", null, nomeBot) 
          }, { quoted: msg })
        }

        // Monta a mensagem marcando todos os admins
        let txt = `❄️ • 𝐏𝐄𝐃𝐈𝐃𝐎 𝐃𝐄 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀 •\n\n`
        txt += `╭─〔 🤝 𝐒𝐎𝐋𝐈𝐂𝐈𝐓𝐀𝐂̧𝐀̃𝐎 〕\n`
        txt += `│ @${numUser} está pedindo parceria.\n`
        txt += `╰──────────────\n\n`
        txt += `『 𝐀𝐃𝐌𝐈𝐍𝐒 𝐌𝐀𝐑𝐂𝐀𝐃𝐎𝐒 』 ↴\n\n`
        
        admins.forEach((a, i) => {
          txt += `╰➜ ${i + 1}. @${utils.soNumero(a)}\n`
        })

        txt += `\n💡 *Administradores*, para liberar, usem:\n`
        txt += `╰➜ \`!addparceria @${numUser} <qtd>\`\n\n`
        txt += `"${nomeBot}"`

        // Envia a mensagem com as menções
        await sock.sendMessage(jid, { 
          text: txt, 
          mentions: [msg.key.participant || msg.key.remoteJid, ...admins] 
        }, { quoted: msg })
      }
    },

    addparceria: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const alvo = utils.getAlvo(msg)
        
        if (!alvo) {
          return sock.sendMessage(jid, { 
            text: msgAviso("𝐀𝐃𝐃𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀", "Marque um usuário.", "💡 `!addparceria @user <qtd>`", null, nomeBot) 
          }, { quoted: msg })
        }

        const qtd = parseInt(args.find(a => /^\d+$/.test(a)) || "0", 10)
        if (!qtd || qtd <= 0) {
          return sock.sendMessage(jid, { 
            text: msgAviso("𝐐𝐔𝐀𝐍𝐓𝐈𝐃𝐀𝐃𝐄", "Informe a quantidade de links por dia.", "💡 `!addparceria @user <qtd>`\n📌 Exemplo: `!addparceria @user 2`", null, nomeBot) 
          }, { quoted: msg })
        }

        const parcerias = db.parcerias()
        parcerias[jid] = parcerias[jid] || { ativo: false, parceiros: {} }
        parcerias[jid].parceiros = parcerias[jid].parceiros || {}
        
        // Salva a parceria com o limite diário
        parcerias[jid].parceiros[alvo] = { total: qtd, usados: 0, desde: Date.now() }
        db.salvarParcerias(parcerias)

        await sock.sendMessage(jid, { 
          text: msgSucesso("𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀 𝐀𝐃𝐈𝐂𝐈𝐎𝐍𝐀𝐃𝐀", "O usuário agora pode enviar links diários.", lineEmoji("👤", "𝐔𝐬𝐮𝐚́𝐫𝐢𝐨", "@" + utils.soNumero(alvo)) + "\n" + lineEmoji("📊", "𝐋𝐢𝐦𝐢𝐭𝐞", qtd + " link(s) por dia") + "\n" + lineEmoji("⏰", "𝐑𝐞𝐬𝐞𝐭", "Todos os dias às 00:00"), null, nomeBot), 
          mentions: [alvo] 
        }, { quoted: msg })
      }
    },

    rmparceria: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: msgAviso("𝐑𝐌𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀", "Marque um usuário.", "💡 `!rmparceria @user`", null, nomeBot) }, { quoted: msg })
        const parcerias = db.parcerias()
        if (!parcerias[jid] || !parcerias[jid].parceiros || !parcerias[jid].parceiros[alvo]) return sock.sendMessage(jid, { text: msgAviso("𝐒𝐄𝐌 𝐀𝐋𝐈𝐀𝐍𝐂̧𝐀", "Esse usuário não tem parceria.", lineEmoji("👤", "𝐔𝐬𝐮𝐚́𝐫𝐢𝐨", "@" + utils.soNumero(alvo)), null, nomeBot) }, { quoted: msg })
        delete parcerias[jid].parceiros[alvo]; db.salvarParcerias(parcerias)
        await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐀", "Parceria desfeita.", lineEmoji("👤", "𝐔𝐬𝐮𝐚́𝐫𝐢𝐨", "@" + utils.soNumero(alvo)), null, nomeBot), mentions: [alvo] }, { quoted: msg })
      }
    },

    parcerias: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const dados = (db.parcerias())[jid] || {}
        if (!dados.parceiros || !Object.keys(dados.parceiros).length) return sock.sendMessage(jid, { text: msgAviso("𝐒𝐄𝐌 𝐀𝐋𝐈𝐀𝐍𝐂̧𝐀𝐒", "Nenhuma parceria registrada.", "💡 Use `!addparceria @user <qtd>`", null, nomeBot) }, { quoted: msg })
        const ativo = dados.ativo ? "🟢 ON" : "🔴 OFF"
        let txt = `❄️ • 𝐀𝐋𝐈𝐀𝐍𝐂̧𝐀𝐒 (${ativo}) •\n\n『 𝐋𝐢𝐬𝐭𝐚 』 ↴\n\n`
        const mentions = []
        let i = 1
        for (const [jidP, info] of Object.entries(dados.parceiros)) {
          txt += `╰➜ ${i}. @${utils.soNumero(jidP)}\n   📊 ${info.usados}/${info.total}\n\n`
          mentions.push(jidP)
          i++
        }
        txt += `"${nomeBot}"`
        await sock.sendMessage(jid, { text: txt, mentions: mentions }, { quoted: msg })
      }
    },

    // ============================================================
    // 🎴 FIGURINHAS COMANDO
    // ============================================================

    rgfig: {
      aliases: ["registrarfig", "addfigcmd", "savefig"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const comando = (args[0] || "").toLowerCase().replace(/^[!/.\-#,]+/, "").trim()

        if (!comando) {
          return sock.sendMessage(jid, { text: msgAviso("𝐑𝐆𝐅𝐈𝐆", "Informe o comando que a figurinha vai executar.", "💡 Responda uma fig com:\n╰➜ `!rgfig <comando>`\n\n📌 Exemplo:\n╰➜ `!rgfig ban`", null, nomeBot) }, { quoted: msg })
        }

        const ctx = (msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo) || {}
        const q = ctx.quotedMessage
        const fig = q && q.stickerMessage

        if (!fig) {
          return sock.sendMessage(jid, { text: msgAviso("𝐑𝐆𝐅𝐈𝐆", "Você precisa responder uma figurinha.", "💡 Toque e segure a fig\n╰➜ Responda com `!rgfig " + comando + "`", null, nomeBot) }, { quoted: msg })
        }

        await sock.sendMessage(jid, { text: "❄️ Analisando figurinha..." }, { quoted: msg })

        try {
          const alvo = { key: msg.key, message: { stickerMessage: fig }, messageTimestamp: msg.messageTimestamp }
          const buffer = await utils.downloadMediaMessage(alvo, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          if (!buffer || !buffer.length) throw new Error("Figurinha vazia")

          const hash = hashFigurinha(buffer)
          const num = utils.soNumero(sender)

          const dbFig = dbLer("figcmd.json", {})
          dbFig[jid] = dbFig[jid] || {}

          const jaExiste = dbFig[jid][hash]
          if (jaExiste) {
            return sock.sendMessage(jid, { text: msgAviso("𝐉𝐀́ 𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐀𝐃𝐀", "Essa figurinha já está salva.", lineEmoji("🎴", "𝐂𝐨𝐦𝐚𝐧𝐝𝐨", "!" + jaExiste.comando) + "\n" + lineEmoji("👤", "𝐑𝐞𝐠𝐢𝐬𝐭𝐫𝐚𝐝𝐚 𝐩𝐨𝐫", "@" + jaExiste.criadoPor) + "\n\n💡 Use `!rmfig` pra remover.", null, nomeBot), mentions: [`${jaExiste.criadoPor}@s.whatsapp.net`] }, { quoted: msg })
          }

          dbFig[jid][hash] = { comando: comando, criadoPor: num, criadoEm: Date.now() }
          dbSalvar("figcmd.json", dbFig)

          await sock.sendMessage(jid, { text: msgSucesso("𝐅𝐈𝐆𝐔𝐑𝐈𝐍𝐇𝐀 𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐀𝐃𝐀", "A figurinha agora executa o comando.", lineEmoji("🎴", "𝐂𝐨𝐦𝐚𝐧𝐝𝐨", "!" + comando) + "\n" + lineEmoji("👤", "𝐑𝐞𝐠𝐢𝐬𝐭𝐫𝐚𝐝𝐚 𝐩𝐨𝐫", "@" + num) + "\n" + lineEmoji("📁", "𝐆𝐫𝐮𝐩𝐨", "Este grupo (único)") + "\n\n💡 Mande a figurinha pra ativar!", null, nomeBot), mentions: [sender] }, { quoted: msg })
        } catch (e) {
          console.log("Erro rgfig:", e.message)
          await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha ao registrar figurinha.", "⚠️ `" + e.message + "`", null, nomeBot) }, { quoted: msg })
        }
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

        await sock.sendMessage(jid, { text: "❄️ Analisando figurinha..." }, { quoted: msg })

        try {
          const alvo = { key: msg.key, message: { stickerMessage: fig }, messageTimestamp: msg.messageTimestamp }
          const buffer = await utils.downloadMediaMessage(alvo, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          if (!buffer || !buffer.length) throw new Error("Figurinha vazia")

          const hash = hashFigurinha(buffer)
          const num = utils.soNumero(sender)

          const dbFig = dbLer("figcmd.json", {})
          const grupo = dbFig[jid] || {}

          if (!grupo[hash]) return sock.sendMessage(jid, { text: msgAviso("𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐀", "Essa figurinha não está registrada neste grupo.", "💡 Use `!rgfig <comando>` pra registrar.", null, nomeBot) }, { quoted: msg })

          const dados = grupo[hash]
          delete grupo[hash]
          dbFig[jid] = grupo
          dbSalvar("figcmd.json", dbFig)

          await sock.sendMessage(jid, { text: msgSucesso("𝐅𝐈𝐆𝐔𝐑𝐈𝐍𝐇𝐀 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐀", "O gatilho foi desativado.", lineEmoji("🎴", "𝐂𝐨𝐦𝐚𝐧𝐝𝐨", "!" + dados.comando) + "\n" + lineEmoji("👤", "𝐑𝐞𝐦𝐨𝐯𝐢𝐝𝐚 𝐩𝐨𝐫", "@" + num), null, nomeBot), mentions: [sender] }, { quoted: msg })
        } catch (e) {
          console.log("Erro rmfig:", e.message)
          await sock.sendMessage(jid, { text: msgErro("𝐄𝐑𝐑𝐎", "Falha ao remover figurinha.", "⚠️ `" + e.message + "`", null, nomeBot) }, { quoted: msg })
        }
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

        let txt = "❄️ • 𝐅𝐈𝐆𝐔𝐑𝐈𝐍𝐇𝐀𝐒 𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐀𝐃𝐀𝐒 •\n\n『 𝐋𝐢𝐬𝐭𝐚 』 ↴\n\n"
        const mentions = []
        entradas.forEach(([hash, info], i) => {
          txt += `╰➜ ${i + 1}. !${info.comando}\n   👤 @${info.criadoPor}\n   🔑 ${hash.slice(0, 8)}...\n\n`
          mentions.push(`${info.criadoPor}@s.whatsapp.net`)
        })
        txt += `📊 𝐓𝐨𝐭𝐚𝐥: ${entradas.length}\n\n"${nomeBot}"`
        await sock.sendMessage(jid, { text: txt, mentions }, { quoted: msg })
      }
    }

  }
}