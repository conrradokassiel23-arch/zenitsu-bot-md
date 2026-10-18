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
  return `🟣 • ${titulo} •

╭─〔 💜 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕
│ ${aviso}
╰──────────────

『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴

${detalhes}

${rodape ? rodape + "\n\n" : ""}"${nomeBot}"`
}

function msgAviso(titulo, aviso, detalhes, rodape, nomeBot) {
  return `🟣 • ${titulo} •

╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕
│ ${aviso}
╰──────────────

『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴

${detalhes}

${rodape ? rodape + "\n\n" : ""}"${nomeBot}"`
}

function msgErro(titulo, aviso, detalhes, rodape, nomeBot) {
  return `🟣 • ${titulo} •

╭─〔 🚫 𝐄𝐑𝐑𝐎 〕
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

        const texto =
`🟣 • 𝐒𝐀𝐔𝐃𝐀𝐂̧𝐎̃𝐄𝐒 •

╭─〔 🌌 𝐁𝐄𝐌-𝐕𝐈𝐍𝐃𝐎 𝐀 𝐓𝐄𝐌𝐏𝐄𝐒𝐓 〕
│ ${saudacao}, ${pushName}!
╰──────────────

『 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐜̧𝐨̃𝐞𝐬 』 ↴

👤 𝐒𝐥𝐢𝐦𝐞:
╰➜ @${numUser}

🟣 𝐁𝐨𝐭:
╰➜ ${nomeBot}

👁️ 𝐆𝐫𝐚𝐧𝐝𝐞 𝐒𝐚́𝐛𝐢𝐨:
╰➜ ${nomeDono}

💜 𝐍𝐨𝐛𝐫𝐞𝐳𝐚:
╰➜ ${premium}

🕐 𝐇𝐨𝐫𝐚́𝐫𝐢𝐨:
╰➜ ${hora}

🦠 _"O Grande Sábio está sempre observando."_

"${nomeBot}"`

        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          try {
            if (cfg.tipoMenu === "video") {
              await sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "rimuru-menu.mp4", gifPlayback: true, caption: texto, mentions }, { quoted: msg })
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
            text: "🟣 *Escolha uma categoria de Tempest:*",
            footer: "🌌 " + nomeBot,
            title: "🟣 MENUS DO REINO",
            buttonText: "🦠 ABRIR MENUS",
            sections: [
              {
                title: "⚔️ ADMINISTRAÇÃO",
                rows: [
                  { title: "⚙️ Menu Admin", rowId: p + "menuadmin", description: "Banir, mutar, proteções..." },
                  { title: "👁️ Menu Dono", rowId: p + "menudono", description: "Comandos do Grande Sábio" }
                ]
              },
              {
                title: "💜 ÁREA NOBRE",
                rows: [
                  { title: "🟣 Menu VIP", rowId: p + "menuvip", description: "Figurinhas, logos, autofig" }
                ]
              },
              {
                title: "🎮 JOGOS E DIVERSÃO",
                rows: [
                  { title: "🦠 Menu RPG", rowId: p + "menurpg", description: "Economia, pets, cassino" },
                  { title: "🌾 Menu Fazenda", rowId: p + "menufazenda", description: "Animais, plantações" },
                  { title: "🐻 Menu FNAF", rowId: p + "menufnaf", description: "Five Nights at Freddy's" },
                  { title: "🏙️ Menu Cidade", rowId: p + "menucidade", description: "Casas, banco, crimes" }
                ]
              }
            ]
          })
        } catch (e) {
          await sock.sendMessage(jid, {
            text: "🟣 *MENUS DISPONÍVEIS:*\n\n" +
              "⚙️ ▸ " + p + "menuadmin\n" +
              "👁️ ▸ " + p + "menudono\n" +
              "💜 ▸ " + p + "menuvip\n" +
              "🦠 ▸ " + p + "menurpg\n" +
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
          text: "🟣 • 𝐌𝐄𝐃𝐈𝐍𝐃𝐎 𝐋𝐀𝐓𝐄̂𝐍𝐂𝐈𝐀 •\n\n" +
            "╭─〔 🔮 𝐀𝐍𝐀𝐋𝐈𝐒𝐀𝐍𝐃𝐎 〕\n" +
            "│ O Grande Sábio está calculando...\n" +
            "╰──────────────\n\n" +
            "👁️ [░░░░░░░░░░] 0%"
        }, { quoted: msg })

        const etapas = [
          { espera: 500, pct: 20, msg: "Analisando magia...", emoji: "🦠" },
          { espera: 500, pct: 40, msg: "Invocando habilidades...", emoji: "🔮" },
          { espera: 500, pct: 60, msg: "Sincronizando com Veldora...", emoji: "🌌" },
          { espera: 500, pct: 80, msg: "Calculando rotas neurais...", emoji: "💜" },
          { espera: 500, pct: 100, msg: "Finalizando...", emoji: "🟣" }
        ]

        for (const et of etapas) {
          await new Promise(r => setTimeout(r, et.espera))
          const cheios = Math.floor(et.pct / 10)
          const barra = "🟣".repeat(cheios) + "⬛".repeat(10 - cheios)
          try {
            await sock.sendMessage(jid, {
              text: "🟣 • 𝐌𝐄𝐃𝐈𝐍𝐃𝐎 𝐋𝐀𝐓𝐄̂𝐍𝐂𝐈𝐀 •\n\n" +
                "╭─〔 🔮 𝐀𝐍𝐀𝐋𝐈𝐒𝐀𝐍𝐃𝐎 〕\n" +
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
        if (pingReal < 100) { qual = "PERFEITO"; msgQual = "Conexão telepática ativada."; emoji = "🟣"; cor = "💜" }
        else if (pingReal < 200) { qual = "Excelente"; msgQual = "O fluxo de mana está ótimo."; emoji = "🦠"; cor = "🔮" }
        else if (pingReal < 350) { qual = "Bom"; msgQual = "Tudo sob controle, slime."; emoji = "🌌"; cor = "🔹" }
        else if (pingReal < 500) { qual = "Aceitável"; msgQual = "A conexão começa a enfraquecer..."; emoji = "🌘"; cor = "🟡" }
        else if (pingReal < 800) { qual = "Ruim"; msgQual = "Os cálculos estão lentos..."; emoji = "🌑"; cor = "🟠" }
        else if (pingReal < 1500) { qual = "Péssimo"; msgQual = "Tempest está offline!"; emoji = "💀"; cor = "🔴" }
        else { qual = "MORTO"; msgQual = "O Grande Sábio falhou."; emoji = "☠️"; cor = "⚫" }

        const hora = new Date().toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" })
        const data = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })

        await sock.sendMessage(jid, {
          text:
`🟣 • 𝐋𝐀𝐓𝐄̂𝐍𝐂𝐈𝐀 𝐃𝐄 𝐓𝐄𝐌𝐏𝐄𝐒𝐓 •

╭─〔 🔮 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎 〕
│ ${msgQual}
╰──────────────

『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴

👤 𝐒𝐥𝐢𝐦𝐞:
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

> 🦠 _${msgQual}_

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
`🟣 • 𝐓𝐎𝐓𝐀𝐋 𝐃𝐄 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒 •

╭─〔 🔮 𝐄𝐒𝐓𝐀𝐓𝐈́𝐒𝐓𝐈𝐂𝐀𝐒 〕
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
`🟣 • 𝐏𝐀𝐈𝐍𝐄𝐋 𝐀𝐃𝐌𝐈𝐍 •

╭─〔 🌌 𝐀𝐔𝐓𝐎𝐑𝐈𝐃𝐀𝐃𝐄 〕
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

🟣 𝐏𝐫𝐞𝐟𝐢𝐱𝐨 𝐚𝐭𝐮𝐚𝐥: \`${p}\`

"${nomeBot}"`

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

        await sock.sendMessage(jid, {
          text:
`🟣 • 𝐏𝐑𝐄𝐅𝐈𝐗𝐎 •

╭─〔 🔮 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐂̧𝐀̃𝐎 〕
│ Sistema de prefixos do bot.
╰──────────────

『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴

🟣 𝐏𝐚𝐝𝐫𝐚̃𝐨:
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
        try {
          await sock.groupSettingUpdate(jid, "not_announcement")
          await sock.sendMessage(jid, { text: msgSucesso("𝐆𝐑𝐔𝐏𝐎 𝐀𝐁𝐄𝐑𝐓𝐎", "O grupo foi aberto.", "🔓 _\"A força ilumina todos.\"_", null, nomeBot) }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: "🟣 " + e.message }, { quoted: msg }) }
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
        } catch (e) { await sock.sendMessage(jid, { text: "🟣 " + e.message }, { quoted: msg }) }
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
        try {
          await sock.groupParticipantsUpdate(jid, [part.id], "promote")
          await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐑𝐎𝐌𝐎𝐕𝐈𝐃𝐎", "O usuário virou admin.", lineEmoji("👤", "𝐔𝐬𝐮𝐚́𝐫𝐢𝐨", "@" + n) + "\n" + lineEmoji("⚔️", "𝐍𝐨𝐯𝐨 𝐜𝐚𝐫𝐠𝐨", "𝐀𝐃𝐌𝐈𝐍"), "⚔️ _\"Bem-vindo à elite.\"_", nomeBot), mentions: [part.id] }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: "🟣 " + e.message }, { quoted: msg }) }
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
        } catch (e) { await sock.sendMessage(jid, { text: "🟣 " + e.message }, { quoted: msg }) }
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
          await sock.sendMessage(jid, { text: msgErro("𝐋𝐈𝐌𝐈𝐓𝐄 𝐀𝐓𝐈𝐍𝐆𝐈𝐃𝐎", "O usuário atingiu 3/3 e foi removido.", lineEmoji("👤", "𝐔𝐬𝐮𝐚́𝐫𝐢𝐨", "@" + n) + "\n" + lineEmoji("📄", "𝐌𝐨𝐭𝐢𝐯𝐨", motivo), "⚔️ _\"Sentença do Grande Sábio.\"_", nomeBot), mentions: [alvo] }, { quoted: msg })
          try { await sock.groupParticipantsUpdate(jid, [alvo], "remove") } catch (_) {}
          return
        }
        db.salvarAdvs(advs)
        await sock.sendMessage(jid, { text: msgAviso("𝐀𝐃𝐕𝐄𝐑𝐓𝐄̂𝐍𝐂𝐈𝐀 𝐃𝐀𝐃𝐀", "Usuário advertido.", lineEmoji("👤", "𝐔𝐬𝐮𝐚́𝐫𝐢𝐨", "@" + n) + "\n" + lineEmoji("⚠️", "𝐀𝐝𝐯𝐞𝐫𝐭𝐞̂𝐧𝐜𝐢𝐚𝐬", total + "/3") + "\n" + lineEmoji("📄", "𝐌𝐨𝐭𝐢𝐯𝐨", motivo), null, nomeBot), mentions: [alvo] }, { quoted: msg })
      }
    },

    parceria: {
      aliases: ["pedirparceria", "quero parceria"],
      adminOnly: false, grupoOnly: true,
      async executar({ sock, msg, db, groupMetadata, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const numUser = utils.soNumero(msg.key.participant || msg.key.remoteJid)
        if (!groupMetadata) return
        const admins = groupMetadata.participants.filter(p => p.admin === "admin" || p.admin === "superadmin").map(p => p.id)
        if (admins.length === 0) return sock.sendMessage(jid, { text: msgAviso("𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀", "Não encontrei nenhum admin no grupo.", "⚠️ Avise o dono do grupo.", null, nomeBot) }, { quoted: msg })
        let txt = `🟣 • 𝐏𝐄𝐃𝐈𝐃𝐎 𝐃𝐄 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀 •\n\n`
        txt += `╭─〔 🤝 𝐒𝐎𝐋𝐈𝐂𝐈𝐓𝐀𝐂̧𝐀̃𝐎 〕\n`
        txt += `│ @${numUser} está pedindo aliança.\n`
        txt += `╰──────────────\n\n`
        txt += `『 𝐀𝐃𝐌𝐈𝐍𝐒 𝐌𝐀𝐑𝐂𝐀𝐃𝐎𝐒 』 ↴\n\n`
        admins.forEach((a, i) => { txt += `╰➜ ${i + 1}. @${utils.soNumero(a)}\n` })
        txt += `\n💡 *Administradores*, para liberar, usem:\n`
        txt += `╰➜ \`!addparceria @${numUser} <qtd>\`\n\n`
        txt += `"${nomeBot}"`
        await sock.sendMessage(jid, { text: txt, mentions: [msg.key.participant || msg.key.remoteJid, ...admins] }, { quoted: msg })
      }
    },

    addparceria: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: msgAviso("𝐀𝐃𝐃𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀", "Marque um usuário.", "💡 `!addparceria @user <qtd>`", null, nomeBot) }, { quoted: msg })
        const qtd = parseInt(args.find(a => /^\d+$/.test(a)) || "0", 10)
        if (!qtd || qtd <= 0) return sock.sendMessage(jid, { text: msgAviso("𝐐𝐔𝐀𝐍𝐓𝐈𝐃𝐀𝐃𝐄", "Informe a quantidade de links por dia.", "💡 `!addparceria @user <qtd>`\n📌 Exemplo: `!addparceria @user 2`", null, nomeBot) }, { quoted: msg })
        const parcerias = db.parcerias()
        parcerias[jid] = parcerias[jid] || { ativo: false, parceiros: {} }
        parcerias[jid].parceiros = parcerias[jid].parceiros || {}
        parcerias[jid].parceiros[alvo] = { total: qtd, usados: 0, desde: Date.now() }
        db.salvarParcerias(parcerias)
        await sock.sendMessage(jid, { text: msgSucesso("𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀 𝐀𝐃𝐈𝐂𝐈𝐎𝐍𝐀𝐃𝐀", "O usuário agora pode enviar links diários.", lineEmoji("👤", "𝐔𝐬𝐮𝐚́𝐫𝐢𝐨", "@" + utils.soNumero(alvo)) + "\n" + lineEmoji("📊", "𝐋𝐢𝐦𝐢𝐭𝐞", qtd + " link(s) por dia") + "\n" + lineEmoji("⏰", "𝐑𝐞𝐬𝐞𝐭", "Todos os dias às 00:00"), null, nomeBot), mentions: [alvo] }, { quoted: msg })
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

    rgfig: {
      aliases: ["registrarfig", "addfigcmd", "savefig"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils, sender }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const comando = (args[0] || "").toLowerCase().replace(/^[!/.\-#,]+/, "").trim()
        if (!comando) return sock.sendMessage(jid, { text: msgAviso("𝐑𝐆𝐅𝐈𝐆", "Informe o comando que a figurinha vai executar.", "💡 Responda uma fig com:\n╰➜ `!rgfig <comando>`\n\n📌 Exemplo:\n╰➜ `!rgfig ban`", null, nomeBot) }, { quoted: msg })
        const ctx = (msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo) || {}
        const q = ctx.quotedMessage
        const fig = q && q.stickerMessage
        if (!fig) return sock.sendMessage(jid, { text: msgAviso("𝐑𝐆𝐅𝐈𝐆", "Você precisa responder uma figurinha.", "💡 Toque e segure a fig\n╰➜ Responda com `!rgfig " + comando + "`", null, nomeBot) }, { quoted: msg })
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
          if (jaExiste) return sock.sendMessage(jid, { text: msgAviso("𝐉𝐀́ 𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐀𝐃𝐀", "Essa figurinha já está salva.", lineEmoji("🎴", "𝐂𝐨𝐦𝐚𝐧𝐝𝐨", "!" + jaExiste.comando) + "\n" + lineEmoji("👤", "𝐑𝐞𝐠𝐢𝐬𝐭𝐫𝐚𝐝𝐚 𝐩𝐨𝐫", "@" + jaExiste.criadoPor) + "\n\n💡 Use `!rmfig` pra remover.", null, nomeBot), mentions: [`${jaExiste.criadoPor}@s.whatsapp.net`] }, { quoted: msg })
          dbFig[jid][hash] = { comando: comando, criadoPor: num, criadoEm: Date.now() }
          dbSalvar("figcmd.json", dbFig)
          await sock.sendMessage(jid, { text: msgSucesso("𝐅𝐈𝐆𝐔𝐑𝐈𝐍𝐇𝐀 𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐀𝐃𝐀", "A figurinha agora executa o comando.", lineEmoji("🎴", "𝐂𝐨𝐦𝐚𝐧𝐝𝐨", "!" + comando) + "\n" + lineEmoji("👤", "𝐑𝐞𝐠𝐢𝐬𝐭𝐫𝐚𝐝𝐚 𝐩𝐨𝐫", "@" + num) + "\n" + lineEmoji("📁", "𝐆𝐫𝐮𝐩𝐨", "Este grupo (único)") + "\n\n💡 Mande a figurinha pra ativar!", null, nomeBot), mentions: [sender] }, { quoted: msg })
        } catch (e) {
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
        await sock.sendMessage(jid, { text: "🟣 Analisando figurinha..." }, { quoted: msg })
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
        let txt = "🟣 • 𝐅𝐈𝐆𝐔𝐑𝐈𝐍𝐇𝐀𝐒 𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐀𝐃𝐀𝐒 •\n\n『 𝐋𝐢𝐬𝐭𝐚 』 ↴\n\n"
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