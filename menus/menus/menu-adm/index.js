/* ============================================================
   ⚔️ MENU ADM - NAPOLEÃO BONAPARTE
   ============================================================ */

module.exports = {
  menu: "menu-adm",
  grupoOnly: false,
  adminOnly: false,
  donoOnly: false,

  commands: {

    // ============ MENU ============
    menu: {
      aliases: ["menus", "ajuda", "help", "menuadm"],
      async executar({ sock, msg, prefixoAtivo, db, sender, config }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "!"
        const cfg = db.config() || {}

        const numUser = String(sender || "").split("@")[0].split(":")[0].replace(/\D/g, "")
        const pushName = msg.pushName || "Soldado"
        const agora = new Date()
        const hora = agora.toLocaleTimeString("pt-BR")
        const h = agora.getHours()
        let saudacao = "Boa noite"
        if (h >= 5 && h < 12) saudacao = "Bom dia"
        else if (h >= 12 && h < 18) saudacao = "Boa tarde"

        let premium = "Não"
        const vips = (db.vips() || {}).vips || {}
        for (const [jidVip, info] of Object.entries(vips)) {
          const n = String(jidVip).split("@")[0].split(":")[0].replace(/\D/g, "")
          if (n === numUser) {
            if (info.expira === "inf" || info.expira > Date.now()) { premium = "Sim 💎"; break }
          }
        }

        const donoArr = Array.isArray(config?.dono) ? config.dono : [config?.dono || "Chefe"]
        const nomeDono = String(donoArr[0] || "Chefe").split("@")[0].split(":")[0].replace(/\D/g, "") || "Chefe"
        const nomeBot = config?.nomeBot || "Napoleão Bonaparte - MD"
        const mentions = sender ? [sender] : []

        const texto =
"🎩 Saudações, @" + numUser + " " + saudacao + " 🦅\n\n" +
"╭═════════════════════╮\n" +
"│ ⚔️ Número: " + numUser + "\n" +
"│ 🎩 Bot: " + nomeBot + "\n" +
"│ 👑 Imperador: " + nomeDono + "\n" +
"│ 🦅 Soldado: " + pushName + "\n" +
"│ 💎 Nobreza: " + premium + "\n" +
"│ 🏰 Hora: " + hora + "\n" +
"╰═════════════════════╯\n\n" +
"┌─ [ 🎩 " + nomeBot + " ] ─┐\n" +
"│\n" +
"│  _\"Um exército marcha com disciplina.\"_\n" +
"│\n" +
"└──────────────────────┘"

        const secoes = [{
          title: "⚔️ NAPOLEÃO BONAPARTE",
          rows: [
            { title: "⚔️ Menu Admin",     rowId: p + "menuadmin",   description: "Comandos de administração" },
            { title: "👑 Menu Imperador",  rowId: p + "menudono",    description: "Comandos exclusivos do dono" },
            { title: "💎 Menu Nobreza",    rowId: p + "menuvip",     description: "Comandos VIP" },
            { title: "🎩 Menu RPG",        rowId: p + "menurpg",     description: "Economia, pets, pokémon" },
            { title: "🏰 Menu Fazenda",    rowId: p + "menufazenda", description: "Animais, plantações" },
            { title: "🌙 Menu FNAF",       rowId: p + "menufnaf",    description: "Five Nights at Freddy's" }
          ]
        }]

        // 📸 MENSAGEM 1
        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          try {
            if (cfg.tipoMenu === "video") {
              await sock.sendMessage(jid, {
                video: buf,
                mimetype: "video/mp4",
                fileName: "napoleao-menu.mp4",
                gifPlayback: true,
                caption: texto,
                mentions: mentions
              }, { quoted: msg })
            } else {
              await sock.sendMessage(jid, {
                image: buf,
                caption: texto,
                mentions: mentions
              }, { quoted: msg })
            }
          } catch (e) {
            console.log("⚠️ [menu] erro midia:", e.message)
            await sock.sendMessage(jid, { text: texto, mentions: mentions }, { quoted: msg })
          }
        } else {
          await sock.sendMessage(jid, { text: texto, mentions: mentions }, { quoted: msg })
        }

        // 📋 MENSAGEM 2: LISTA
        try {
          await sock.sendMessage(jid, {
            text: "🎩 *Escolha um menu abaixo:*",
            footer: "🦅 " + nomeBot,
            title: "⚔️ MENUS DO IMPÉRIO",
            buttonText: "☰ ABRIR MENUS",
            sections: secoes
          })
        } catch (e) {
          console.log("❌ [menu] lista falhou:", e.message)
          await sock.sendMessage(jid, {
            text: "⚔️ *Menus:*\n▸ " + p + "menuadmin\n▸ " + p + "menudono\n▸ " + p + "menuvip\n▸ " + p + "menurpg\n▸ " + p + "menufazenda\n▸ " + p + "menufnaf"
          }, { quoted: msg })
        }
      }
    },

    // ============ TOTAL CMD ============
    totalcmd: {
      aliases: ["totalcomandos", "quantoscmd", "cmdcount"],
      async executar({ sock, msg }) {
        const jid = msg.key.remoteJid

        const total = global.totalComandos || 0
        const totalAliases = global.totalAliases || 0
        const porCategoria = global.comandosPorCategoria || {}

        let listaCat = ""
        for (const [cat, qtd] of Object.entries(porCategoria)) {
          listaCat += "▸ " + cat + ": *" + qtd + "*\n"
        }

        const texto =
"╔══════════════════════════════╗\n" +
"║   🎩 𝐓𝐎𝐓𝐀𝐋 𝐃𝐄 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒\n" +
"╚══════════════════════════════╝\n\n" +
"📊 *Estatísticas do Império:*\n\n" +
"▸ ⚔️ Comandos: *" + total + "*\n" +
"▸ 🔗 Aliases: *" + totalAliases + "*\n" +
"▸ 📈 Total geral: *" + (total + totalAliases) + "*\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
"📂 *POR CATEGORIA:*\n" +
(listaCat || "_nenhuma_") + "\n" +
"━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
"🦅 _\"Um exército bem organizado.\"_\n" +
"🎩 _\"Finge que não viu...\"_"

        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    // ============ MENUADMIN ============
    menuadmin: {
      aliases: ["menu-adm", "menua", "adm", "comandosadm"],
      async executar({ sock, msg, prefixoAtivo, db }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "!"
        const cfg = db.config() || {}

        const texto =
"╔══════════════════════════════╗\n" +
"║   ⚔️  𝐂𝐎𝐌𝐀𝐍𝐃𝐎 𝐆𝐄𝐍𝐄𝐑𝐀𝐋  ⚔️\n" +
"╚══════════════════════════════╝\n\n" +
"🎩 *Napoleão apresenta:*\n" +
"🦅 *as ordens do general!*\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
"🗡️ *PREFIXO*\n" +
"▸ " + p + "multiprefixo on/off\n" +
"▸ " + p + "setprefixo <novo>\n" +
"▸ " + p + "prefixo\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
"⚠️ *ADVERTÊNCIAS*\n" +
"▸ " + p + "adv @user motivo\n" +
"▸ " + p + "deladv @user\n" +
"▸ " + p + "listaadv\n" +
"▸ " + p + "veradv @user\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
"👥 *SOLDADOS*\n" +
"▸ " + p + "promover @user\n" +
"▸ " + p + "rebaixar @user\n" +
"▸ " + p + "ban @user\n" +
"▸ " + p + "mute @user\n" +
"▸ " + p + "desmute @user\n" +
"▸ " + p + "p (reply)\n" +
"▸ " + p + "totag <texto>\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
"🏰 *TERRITÓRIO*\n" +
"▸ " + p + "abrir / " + p + "fechar\n" +
"▸ " + p + "link\n" +
"▸ " + p + "soadm on/off\n" +
"▸ " + p + "namegp <nome>\n" +
"▸ " + p + "descricao <texto>\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
"👑 *SUB-GENERAIS*\n" +
"▸ " + p + "subadm @user\n" +
"▸ " + p + "delsubadm @user\n" +
"▸ " + p + "listasubadm\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
"🛡️ *PROTEÇÕES*\n" +
"▸ " + p + "antilink on/off\n" +
"▸ " + p + "antiaudio on/off\n" +
"▸ " + p + "antivideo on/off\n" +
"▸ " + p + "antifoto on/off\n" +
"▸ " + p + "antifig on/off\n" +
"▸ " + p + "palavrao on/off\n" +
"▸ " + p + "addpalavra <palavra>\n" +
"▸ " + p + "rmpalavra <palavra>\n" +
"▸ " + p + "listapalavra\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
"🕵️ *ESPIONAGEM*\n" +
"▸ " + p + "x9 on/off\n" +
"▸ " + p + "modoparceria on/off\n" +
"▸ " + p + "addparceria @user <qtd>\n" +
"▸ " + p + "rmparceria @user\n" +
"▸ " + p + "parcerias\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
"🚫 *LISTA NEGRA*\n" +
"▸ " + p + "listanegra <número>\n" +
"▸ " + p + "blacklist\n" +
"▸ " + p + "dellista <número>\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
"👋 *CHEGADA / PARTIDA*\n" +
"▸ " + p + "bemvindo on/off\n" +
"▸ " + p + "textobv <texto>\n" +
"▸ " + p + "fundoBV (reply)\n" +
"▸ " + p + "legendasaiu <texto>\n" +
"▸ " + p + "fundoSaiu (reply)\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
"⏰ *AGENDAMENTO*\n" +
"▸ " + p + "abrirgp hh:mm\n" +
"▸ " + p + "fechargp hh:mm\n" +
"▸ " + p + "fotoabrir (reply)\n" +
"▸ " + p + "fotofechar (reply)\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
"🎁 *SORTEIO*\n" +
"▸ " + p + "sorteio <prêmio> <tempo>\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
"📊 *ESTATÍSTICAS*\n" +
"▸ " + p + "totalcmd\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
"🦅 _\"A disciplina é a mãe da vitória.\"_\n" +
"🎩 Prefixo atual: *" + p + "*"

        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          if (cfg.tipoMenu === "video") return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "napoleao.mp4", gifPlayback: true, caption: texto }, { quoted: msg })
          return sock.sendMessage(jid, { image: buf, caption: texto }, { quoted: msg })
        }
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    // ============ MENU FNAF ============
    menufnaf: {
      aliases: ["fnafmenu", "menuf"],
      async executar({ sock, msg, prefixoAtivo, db, isDono, isSubDono }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "!"
        const sJ = [msg.key.participant, msg.key.remoteJid, msg.participant].filter(Boolean)

        let ehVip = isDono || isSubDono
        if (!ehVip) {
          const vips = (db.vips() || {}).vips || {}
          for (const j of sJ) {
            const num = String(j).split("@")[0].split(":")[0].replace(/\D/g, "")
            for (const [jidVip, info] of Object.entries(vips)) {
              if (String(jidVip).split("@")[0].split(":")[0].replace(/\D/g, "") === num) {
                if (info.expira === "inf" || info.expira > Date.now()) { ehVip = true; break }
              }
            }
            if (ehVip) break
          }
        }
        if (!ehVip) return sock.sendMessage(jid, { text: "🎩💢 Só nobres podem acessar o FNAF!" }, { quoted: msg })

        const cfg = db.config() || {}

        const texto =
"╔══════════════════════════════╗\n" +
"║   🌙 𝐅𝐍𝐀𝐅 𝐈𝐌𝐏𝐄𝐑𝐈𝐀𝐋 🎩\n" +
"╚══════════════════════════════╝\n\n" +
"🎩 *Napoleão apresenta:*\n" +
"🦅 *as noites mais sombrias!*\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
"📋 *JOGOS*\n" +
"▸ " + p + "listarfnaf\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
"🎮 *LOBBY*\n" +
"▸ " + p + "abrirfnaf 1/2/3/4/5\n" +
"▸ " + p + "entrarfnaf\n" +
"▸ " + p + "sairfnaf\n" +
"▸ " + p + "iniciarfnaf\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
"⚔️ *EM JOGO*\n" +
"▸ " + p + "fecharporta 1/2\n" +
"▸ " + p + "portaluz 1/2\n" +
"▸ " + p + "statusfnaf\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
"🚫 *ADMIN*\n" +
"▸ " + p + "cancelarfnaf\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
"🐻 *ANIMATRÔNICOS*\n" +
"▸ FNAF 1: Freddy, Bonnie, Chica, Foxy, Golden\n" +
"▸ FNAF 2: Toys, BB, Mangle, Puppet, Withereds\n" +
"▸ FNAF 3: Springtrap, Phantom Freddy\n" +
"▸ FNAF 4: Nightmares\n" +
"▸ FNAF 5: Baby, Ballora, Funtimes, Ennard\n" +
"━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
"🦅 _\"Resistam até às 6h!\"_\n" +
"🎩 _\"Uma noite longa nos espera.\"_"

        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          if (cfg.tipoMenu === "video") return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "napoleao.mp4", gifPlayback: true, caption: texto }, { quoted: msg })
          return sock.sendMessage(jid, { image: buf, caption: texto }, { quoted: msg })
        }
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    // ============ PREFIXO ============
    prefixo: {
      aliases: ["prefix", "prefixoatual", "qualprefixo"],
      async executar({ sock, msg, prefixoAtivo, db }) {
        const jid = msg.key.remoteJid
        const cfg = db.config()
        const padrao = cfg.prefixoGlobal || "!"
        const grupoConf = db.grupos()[jid] || {}
        let texto = "╭━━━〔 🗡️ 𝐏𝐑𝐄𝐅𝐈𝐗𝐎 🗡️ 〕━━━╮\n┃\n┃ 🦅 *O general informa:*\n┃\n┃ ⚔️ Prefixo padrão: *" + padrao + "*\n┃ 🎩 Prefixo ativo: *" + prefixoAtivo + "*\n┃\n"
        if (grupoConf.multiprefixo) {
          texto += "┃ 🏰 Multiprefixo: *ON*\n┃    Prefixo do grupo: *" + (grupoConf.prefixo || padrao) + "*\n"
        } else {
          texto += "┃ 🏰 Multiprefixo: *OFF*\n"
        }
        texto += "┃\n┃ 🦅 Aceitos: *!* e */*\n┃\n┃ 🎩 _\"Ordens claras, vitórias certas.\"_\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯"
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    // ============ PING ============
    ping: {
      aliases: ["pong", "latencia"],
      async executar({ sock, msg, sender, utils }) {
        const jid = msg.key.remoteJid
        const t1 = Date.now()
        const sent = await sock.sendMessage(jid, {
          text: "╭━━━〔 ⚔️ 𝐌𝐄𝐃𝐈𝐍𝐃𝐎 ⚔️ 〕━━━╮\n┃ 🦅 Napoleão tá medindo...\n┃ [░░░░░░░░░░] 0%\n╰━━━━━━━━━━━━━━━━━━━━╯"
        }, { quoted: msg })
        const etapas = [
          { espera: 400, pct: 15, msg: "Montando cavalaria..." },
          { espera: 500, pct: 30, msg: "Medindo artilharia..." },
          { espera: 400, pct: 50, msg: "Verificando divisões..." },
          { espera: 500, pct: 70, msg: "Calculando tropas..." },
          { espera: 400, pct: 90, msg: "Finalizando batalha..." }
        ]
        for (const et of etapas) {
          await new Promise(r => setTimeout(r, et.espera))
          const cheios = Math.floor(et.pct / 10)
          const barra = "🟫".repeat(cheios) + "⬛".repeat(10 - cheios)
          try {
            await sock.sendMessage(jid, { text: "╭━━━〔 ⚔️ 𝐌𝐄𝐃𝐈𝐍𝐃𝐎 ⚔️ 〕━━━╮\n┃ 🦅 " + et.msg + "\n┃ [" + barra + "] " + et.pct + "%\n╰━━━━━━━━━━━━━━━━━━━━╯", edit: sent.key })
          } catch (_) {}
        }
        const t2 = Date.now()
        let pingReal = 0
        try { await sock.groupMetadata(jid); pingReal = Date.now() - t2 } catch (_) { pingReal = Date.now() - t2 }
        const pingTotal = Date.now() - t1
        let qual = "🟢 Excelente", msgQual = "🦅 Napoleão tá imbatível!", emoji = "🟢"
        if (pingReal > 200) { qual = "🟡 Aceitável"; msgQual = "🎩 Cavalaria um pouco lenta~"; emoji = "🟡" }
        if (pingReal > 500) { qual = "🔴 Ruim"; msgQual = "💢 Tropas dispersas!"; emoji = "🔴" }
        if (pingReal > 1000) { qual = "💀 Péssimo"; msgQual = "💢 Reorganiza o exército!"; emoji = "💀" }
        const agora = new Date()
        const hora = String(agora.getHours()).padStart(2, "0") + ":" + String(agora.getMinutes()).padStart(2, "0") + ":" + String(agora.getSeconds()).padStart(2, "0")
        await sock.sendMessage(jid, {
          text: "╭━━━〔 ⚔️ 𝐏𝐈𝐍𝐆 𝐍𝐀𝐏𝐎𝐋𝐄𝐀̃𝐎 ⚔️ 〕━━━╮\n┃ 🦅 *Latência do império*\n┃\n┃ " + emoji + " Ping: *" + pingReal + "ms*\n┃ ⏱️ Processamento: *" + pingTotal + "ms*\n┃ 📡 Qualidade: *" + qual + "*\n┃ 🕐 Hora: *" + hora + "*\n┃\n┃ 👤 @" + utils.soNumero(sender) + "\n┃\n┃ " + msgQual + "\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━╯",
          mentions: [sender], edit: sent.key
        })
      }
    },

    // ============ P (APAGAR) ============
    p: {
      aliases: ["apagar", "delmsg"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils }) {
        const jid = msg.key.remoteJid
        const ctx = msg.message?.extendedTextMessage?.contextInfo
        if (!ctx?.stanzaId) return sock.sendMessage(jid, { text: "╭━━━〔 🗡️ 𝐀𝐏𝐀𝐆𝐀𝐑 🗡️ 〕━━━╮\n┃ 🦅 Responda uma mensagem com *!p*\n╰━━━━━━━━━━━━━━━━━━━━╯" }, { quoted: msg })
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: "╭━━━〔 🗡️ 𝐀𝐏𝐀𝐆𝐀𝐑 🗡️ 〕━━━╮\n┃ 🦅 Napoleão precisa ser *admin*!\n╰━━━━━━━━━━━━━━━━━━━━╯" }, { quoted: msg })
        try {
          await sock.sendMessage(jid, { delete: { remoteJid: jid, fromMe: false, id: ctx.stanzaId, participant: ctx.participant || ctx.mentionedJid?.[0] } })
          await sock.sendMessage(jid, { text: "╭━━━〔 🗡️ 𝐀𝐏𝐀𝐆𝐀𝐃𝐎 🗡️ 〕━━━╮\n┃ 🦅 *Napoleão apagou!*\n┃ 🎩 _\"O inimigo nem viu.\"_\n╰━━━━━━━━━━━━━━━━━━━━╯" }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: "╭━━━〔 🗡️ 𝐄𝐑𝐑𝐎 🗡️ 〕━━━╮\n┃ 💢 " + e.message + "\n╰━━━━━━━━━━━━━━━━━━━━╯" }, { quoted: msg }) }
      }
    },

    // ============ ABRIR ============
    abrir: {
      aliases: ["opennow"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils }) {
        const jid = msg.key.remoteJid
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: "🦅 Napoleão precisa ser *admin*!" }, { quoted: msg })
        try {
          await sock.groupSettingUpdate(jid, "not_announcement")
          await sock.sendMessage(jid, { text: "╭━━━〔 🏰 𝐀𝐁𝐄𝐑𝐓𝐎 🏰 〕━━━╮\n┃ 🦅 *Território aberto!*\n┃ 🎩 Todos podem falar~\n╰━━━━━━━━━━━━━━━━━━━━╯" }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: "💢 " + e.message }, { quoted: msg }) }
      }
    },

    // ============ FECHAR ============
    fechar: {
      aliases: ["closenow"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils }) {
        const jid = msg.key.remoteJid
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: "🦅 Napoleão precisa ser *admin*!" }, { quoted: msg })
        try {
          await sock.groupSettingUpdate(jid, "announcement")
          await sock.sendMessage(jid, { text: "╭━━━〔 🏰 𝐅𝐄𝐂𝐇𝐀𝐃𝐎 🏰 〕━━━╮\n┃ 🦅 *Território fechado!*\n┃ 🎩 Só oficiais falam~\n╰━━━━━━━━━━━━━━━━━━━━╯" }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: "💢 " + e.message }, { quoted: msg }) }
      }
    },

    // ============ NAMEGP ============
    namegp: {
      aliases: ["setnomegp", "nomegrupo"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, groupMetadata, utils }) {
        const jid = msg.key.remoteJid
        const nome = args.join(" ").trim()
        if (!nome) return sock.sendMessage(jid, { text: "📜 Use: *!namegp <novo nome>*" }, { quoted: msg })
        if (nome.length > 25) return sock.sendMessage(jid, { text: "💢 Máximo 25 caracteres!" }, { quoted: msg })
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: "🦅 Napoleão precisa ser *admin*!" }, { quoted: msg })
        try {
          await sock.groupUpdateSubject(jid, nome)
          await sock.sendMessage(jid, { text: "╭━━━〔 📜 𝐍𝐎𝐌𝐄 𝐀𝐋𝐓𝐄𝐑𝐀𝐃𝐎 📜 〕━━━╮\n┃ 🏰 Novo nome: *" + nome + "*\n┃ 🦅 Napoleão renomeou o território!\n╰━━━━━━━━━━━━━━━━━━━━╯" }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: "💢 " + e.message }, { quoted: msg }) }
      }
    },

    // ============ DESCRICAO ============
    descricao: {
      aliases: ["setdescricao", "descgp"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, groupMetadata, utils }) {
        const jid = msg.key.remoteJid
        const desc = args.join(" ").trim()
        if (!desc) return sock.sendMessage(jid, { text: "📜 Use: *!descricao <texto>*" }, { quoted: msg })
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: "🦅 Napoleão precisa ser *admin*!" }, { quoted: msg })
        try {
          await sock.groupUpdateDescription(jid, desc)
          await sock.sendMessage(jid, { text: "╭━━━〔 📜 𝐃𝐄𝐒𝐂𝐑𝐈𝐂̧𝐀̃𝐎 𝐀𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐃𝐀 📜 〕━━━╮\n┃ 🏰 " + desc + "\n┃ 🦅 _\"A história será escrita.\"_\n╰━━━━━━━━━━━━━━━━━━━━╯" }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: "💢 " + e.message }, { quoted: msg }) }
      }
    },

    // ============ LINK ============
    link: {
      aliases: ["linkgp"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils }) {
        const jid = msg.key.remoteJid
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: "🦅 Napoleão precisa ser *admin*!" }, { quoted: msg })
        try {
          const code = await sock.groupInviteCode(jid)
          await sock.sendMessage(jid, { text: "🔗 https://chat.whatsapp.com/" + code }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: "💢 " + e.message }, { quoted: msg }) }
      }
    },

    // ============ MUTE ============
    mute: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: "🦅 Marque um soldado~" }, { quoted: msg })
        const mutados = db.mutados()
        mutados[jid] = mutados[jid] || {}
        mutados[jid][alvo] = Date.now() + 5 * 60 * 1000
        db.salvarMutados(mutados)
        await sock.sendMessage(jid, { text: "🔇 @" + utils.soNumero(alvo) + " silenciado *5 min*\n🦅 _\"Silêncio, soldado.\"_", mentions: [alvo] }, { quoted: msg })
      }
    },

    // ============ DESMUTE ============
    desmute: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: "🦅 Marque um soldado~" }, { quoted: msg })
        const mutados = db.mutados()
        if (mutados[jid]?.[alvo]) { delete mutados[jid][alvo]; db.salvarMutados(mutados) }
        await sock.sendMessage(jid, { text: "🔊 @" + utils.soNumero(alvo) + " liberado!\n🎩 _\"Fale, soldado.\"_", mentions: [alvo] }, { quoted: msg })
      }
    },

    // ============ PALAVRAO ============
    palavrao: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: "🤬 Use: *!palavrao on/off*" }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].palavrao = opcao === "on"; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: "⚔️ Palavrão: *" + opcao.toUpperCase() + "*\n🦅 _\"Respeito é disciplina.\"_" }, { quoted: msg })
      }
    },

    addpalavra: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const palavra = args.join(" ").trim().toLowerCase()
        if (!palavra) return sock.sendMessage(jid, { text: "📝 *!addpalavra <palavra>*" }, { quoted: msg })
        const p = db.palavroes(); p[jid] = p[jid] || []
        if (p[jid].includes(palavra)) return sock.sendMessage(jid, { text: "🦅 Já tá na lista!" }, { quoted: msg })
        p[jid].push(palavra); db.salvarPalavroes(p)
        await sock.sendMessage(jid, { text: "📝 `" + palavra + "` adicionada!\n⚔️ _\"Ordem registrada.\"_" }, { quoted: msg })
      }
    },

    rmpalavra: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const palavra = args.join(" ").trim().toLowerCase()
        if (!palavra) return sock.sendMessage(jid, { text: "🗑️ *!rmpalavra <palavra>*" }, { quoted: msg })
        const p = db.palavroes(); const arr = p[jid] || []
        const idx = arr.indexOf(palavra)
        if (idx === -1) return sock.sendMessage(jid, { text: "🦅 Não tá na lista!" }, { quoted: msg })
        arr.splice(idx, 1); p[jid] = arr; db.salvarPalavroes(p)
        await sock.sendMessage(jid, { text: "✅ `" + palavra + "` removida!" }, { quoted: msg })
      }
    },

    listapalavra: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const lista = db.palavroes()[jid] || []
        if (!lista.length) return sock.sendMessage(jid, { text: "📝 Nenhuma palavra proibida~" }, { quoted: msg })
        let t = "🤬 *PALAVRAS PROIBIDAS*\n\n"
        lista.forEach((p, i) => { t += (i + 1) + ". `" + p + "`\n" })
        await sock.sendMessage(jid, { text: t }, { quoted: msg })
      }
    },

    // ============ ANTILINK ============
    antilink: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: "🔗 Use: *!antilink on/off*" }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].antilink = opcao === "on"; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: "⚔️ Antilink: *" + opcao.toUpperCase() + "*\n🦅 _\"Sem divulgação!\"_" }, { quoted: msg })
      }
    },

    antiaudio: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: "🎵 Use: *!antiaudio on/off*" }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].antiaudio = opcao === "on"; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: "🎵 Antiaudio: *" + opcao.toUpperCase() + "*" }, { quoted: msg })
      }
    },

    antivideo: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: "🎬 Use: *!antivideo on/off*" }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].antivideo = opcao === "on"; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: "🎬 Antivideo: *" + opcao.toUpperCase() + "*" }, { quoted: msg })
      }
    },

    antifoto: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: "🖼️ Use: *!antifoto on/off*" }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].antifoto = opcao === "on"; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: "🖼️ Antifoto: *" + opcao.toUpperCase() + "*" }, { quoted: msg })
      }
    },

    antifig: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: "🎨 Use: *!antifig on/off*" }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].antifig = opcao === "on"; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: "🎨 Antifig: *" + opcao.toUpperCase() + "*" }, { quoted: msg })
      }
    },

    // ============ PROMOVER ============
    promover: {
      aliases: ["promote", "daradm"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils }) {
        const jid = msg.key.remoteJid
        const alvoRaw = utils.getAlvo(msg)
        if (!alvoRaw) return sock.sendMessage(jid, { text: "🦅 Marque um soldado~" }, { quoted: msg })
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: "🦅 Preciso ser *admin*!" }, { quoted: msg })
        const n = utils.soNumero(alvoRaw)
        const part = groupMetadata.participants.find(p => [p.id, p.lid, p.phoneNumber].filter(Boolean).map(utils.soNumero).includes(n))
        if (!part) return sock.sendMessage(jid, { text: "🦅 Não achei o soldado~" }, { quoted: msg })
        try {
          await sock.groupParticipantsUpdate(jid, [part.id], "promote")
          await sock.sendMessage(jid, { text: "🎩 @" + n + " promovido a *General*!\n🦅 _\"Patente merecida.\"_", mentions: [part.id] }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: "💢 " + e.message }, { quoted: msg }) }
      }
    },

    rebaixar: {
      aliases: ["demote", "tiraradm"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils }) {
        const jid = msg.key.remoteJid
        const alvoRaw = utils.getAlvo(msg)
        if (!alvoRaw) return sock.sendMessage(jid, { text: "🦅 Marque um soldado~" }, { quoted: msg })
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: "🦅 Preciso ser *admin*!" }, { quoted: msg })
        const n = utils.soNumero(alvoRaw)
        const part = groupMetadata.participants.find(p => [p.id, p.lid, p.phoneNumber].filter(Boolean).map(utils.soNumero).includes(n))
        if (!part) return sock.sendMessage(jid, { text: "🦅 Não achei~" }, { quoted: msg })
        try {
          await sock.groupParticipantsUpdate(jid, [part.id], "demote")
          await sock.sendMessage(jid, { text: "⚔️ @" + n + " rebaixado a *soldado*!\n🦅 _\"Volte à tropa.\"_", mentions: [part.id] }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: "💢 " + e.message }, { quoted: msg }) }
      }
    },

    ban: {
      aliases: ["kick", "remover"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils }) {
        const jid = msg.key.remoteJid
        const alvoRaw = utils.getAlvo(msg)
        if (!alvoRaw) return sock.sendMessage(jid, { text: "🦅 Marque um soldado~" }, { quoted: msg })
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: "🦅 Preciso ser *admin*!" }, { quoted: msg })
        const n = utils.soNumero(alvoRaw)
        const part = groupMetadata.participants.find(p => [p.id, p.lid, p.phoneNumber].filter(Boolean).map(utils.soNumero).includes(n))
        if (!part) return sock.sendMessage(jid, { text: "🦅 Não achei~" }, { quoted: msg })
        try {
          await sock.groupParticipantsUpdate(jid, [part.id], "remove")
          await sock.sendMessage(jid, { text: "🚫 @" + n + " expulso!\n🦅 _\"Traição se paga.\"_", mentions: [part.id] }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: "💢 " + e.message }, { quoted: msg }) }
      }
    },

    // ============ ADV ============
    veradv: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: "🦅 Marque um soldado~" }, { quoted: msg })
        const total = db.advs()[jid]?.[alvo] || 0
        await sock.sendMessage(jid, { text: "📊 @" + utils.soNumero(alvo) + " — *" + total + "/3* advertências", mentions: [alvo] }, { quoted: msg })
      }
    },

    adv: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: "🦅 Use: *!adv @user <motivo>*" }, { quoted: msg })
        const motivo = args.filter(a => !a.includes("@")).join(" ") || "Sem motivo"
        const advs = db.advs()
        advs[jid] = advs[jid] || {}
        advs[jid][alvo] = (advs[jid][alvo] || 0) + 1
        const total = advs[jid][alvo]
        const n = utils.soNumero(alvo)
        if (total >= 3) {
          delete advs[jid][alvo]; db.salvarAdvs(advs)
          await sock.sendMessage(jid, { text: "⚔️ @" + n + " atingiu *3/3*!\n🦅 _\"A corte decidiu.\"_", mentions: [alvo] }, { quoted: msg })
          try { await sock.groupParticipantsUpdate(jid, [alvo], "remove") } catch (_) {}
          return
        }
        db.salvarAdvs(advs)
        await sock.sendMessage(jid, { text: "⚠️ @" + n + " — *" + total + "/3*\n📄 " + motivo, mentions: [alvo] }, { quoted: msg })
      }
    },

    deladv: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: "🦅 Marque~" }, { quoted: msg })
        const advs = db.advs()
        const atual = advs[jid]?.[alvo] || 0
        if (atual <= 0) return sock.sendMessage(jid, { text: "✅ Ficha limpa!" }, { quoted: msg })
        advs[jid][alvo] = atual - 1
        if (advs[jid][alvo] === 0) delete advs[jid][alvo]
        db.salvarAdvs(advs)
        await sock.sendMessage(jid, { text: "🎩 @" + utils.soNumero(alvo) + " — *" + (advs[jid]?.[alvo] || 0) + "/3*", mentions: [alvo] }, { quoted: msg })
      }
    },

    listaadv: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const entradas = Object.entries(db.advs()[jid] || {})
        if (!entradas.length) return sock.sendMessage(jid, { text: "📋 Nenhuma advertência~" }, { quoted: msg })
        entradas.sort((a, b) => b[1] - a[1])
        let t = "📋 *FICHAS SUJAS*\n\n"
        entradas.forEach(([j, q], i) => { t += (i + 1) + ". @" + utils.soNumero(j) + " — *" + q + "/3*\n" })
        await sock.sendMessage(jid, { text: t, mentions: entradas.map(([j]) => j) }, { quoted: msg })
      }
    },

    // ============ TOTAG ============
    totag: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, groupMetadata }) {
        const jid = msg.key.remoteJid
        let texto = args.join(" ").trim()
        if (!texto) {
          const ctx = msg.message?.extendedTextMessage?.contextInfo || {}
          const q = ctx.quotedMessage
          if (q) texto = q.conversation || q.extendedTextMessage?.text || q.imageMessage?.caption || ""
        }
        if (!texto) return sock.sendMessage(jid, { text: "📢 *!totag <texto>*" }, { quoted: msg })
        const mentions = groupMetadata.participants.map(p => p.id)
        await sock.sendMessage(jid, { text: texto, mentions }, { quoted: msg })
      }
    },

    // ============ SUBADM ============
    subadm: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: "🦅 Marque~" }, { quoted: msg })
        const subs = db.subadmins(); subs[jid] = subs[jid] || []
        if (subs[jid].some(s => utils.soNumero(s) === utils.soNumero(alvo))) return sock.sendMessage(jid, { text: "🦅 Já é sub-general!" }, { quoted: msg })
        subs[jid].push(alvo); db.salvarSubadmins(subs)
        await sock.sendMessage(jid, { text: "🎩 @" + utils.soNumero(alvo) + " agora é *Sub-General*!", mentions: [alvo] }, { quoted: msg })
      }
    },

    delsubadm: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: "🦅 Marque~" }, { quoted: msg })
        const subs = db.subadmins()
        subs[jid] = (subs[jid] || []).filter(s => utils.soNumero(s) !== utils.soNumero(alvo))
        db.salvarSubadmins(subs)
        await sock.sendMessage(jid, { text: "⚔️ @" + utils.soNumero(alvo) + " não é mais *Sub-General*~", mentions: [alvo] }, { quoted: msg })
      }
    },

    listasubadm: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const subs = db.subadmins()[jid] || []
        if (!subs.length) return sock.sendMessage(jid, { text: "🎩 Nenhum Sub-General~" }, { quoted: msg })
        let t = "🎩 *SUB-GENERAIS*\n\n"
        subs.forEach((s, i) => { t += (i + 1) + ". @" + utils.soNumero(s) + "\n" })
        await sock.sendMessage(jid, { text: t, mentions: subs }, { quoted: msg })
      }
    },

    // ============ SOADM ============
    soadm: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: "🔒 *!soadm on/off*" }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].soadm = opcao === "on"; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: "🏰 Só oficiais: *" + opcao.toUpperCase() + "*" }, { quoted: msg })
      }
    },

    // ============ MULTIPREFIXO ============
    multiprefixo: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: "⚙️ *!multiprefixo on/off*" }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].multiprefixo = opcao === "on"; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: "⚙️ Multiprefixo: *" + opcao.toUpperCase() + "*" }, { quoted: msg })
      }
    },

    setprefixo: {
      aliases: ["setprefix", "trocarp"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const g = db.grupos()
        const conf = g[jid] || {}
        if (!conf.multiprefixo) return sock.sendMessage(jid, { text: "🦅 Multiprefixo OFF~" }, { quoted: msg })
        const novo = args[0]
        if (!novo) return sock.sendMessage(jid, { text: "⚙️ *!setprefixo <novo>*" }, { quoted: msg })
        if (novo.length > 3) return sock.sendMessage(jid, { text: "💢 Máx 3!" }, { quoted: msg })
        g[jid].prefixo = novo; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: "⚔️ Prefixo: *" + novo + "*" }, { quoted: msg })
      }
    },

    // ============ X9 ============
    x9: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: "🕵️ *!x9 on/off*" }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].x9 = opcao === "on"; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: "🕵️ Espionagem X9: *" + opcao.toUpperCase() + "*" }, { quoted: msg })
      }
    },

    // ============ LISTA NEGRA ============
    listanegra: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, groupMetadata, utils }) {
        const jid = msg.key.remoteJid
        const numero = (args[0] || "").replace(/\D/g, "")
        if (!numero || numero.length < 8) return sock.sendMessage(jid, { text: "🚫 *!listanegra <número>*" }, { quoted: msg })
        const lista = db.listanegra(); lista[jid] = lista[jid] || []
        if (lista[jid].includes(numero)) return sock.sendMessage(jid, { text: "🦅 Já tá na lista negra!" }, { quoted: msg })
        lista[jid].push(numero); db.salvarListanegra(lista)
        await sock.sendMessage(jid, { text: "🚫 +" + numero + " marcado como *traidor*!" }, { quoted: msg })
        try {
          const part = groupMetadata?.participants.find(p => [p.id, p.lid, p.phoneNumber].filter(Boolean).map(utils.soNumero).includes(numero))
          if (part) {
            await sock.groupParticipantsUpdate(jid, [part.id], "remove")
            await sock.sendMessage(jid, { text: "⚔️ @" + numero + " expulso!", mentions: [part.id] })
          }
        } catch (_) {}
      }
    },

    blacklist: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const lista = (db.listanegra()[jid] || [])
        if (!lista.length) return sock.sendMessage(jid, { text: "🚫 Lista negra vazia~" }, { quoted: msg })
        let t = "🚫 *TRAIDORES*\n\n"
        lista.forEach((n, i) => { t += (i + 1) + ". +" + n + "\n" })
        await sock.sendMessage(jid, { text: t }, { quoted: msg })
      }
    },

    dellista: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const numero = (args[0] || "").replace(/\D/g, "")
        if (!numero) return sock.sendMessage(jid, { text: "🚫 *!dellista <número>*" }, { quoted: msg })
        const lista = db.listanegra(); const arr = lista[jid] || []
        const idx = arr.indexOf(numero)
        if (idx === -1) return sock.sendMessage(jid, { text: "🦅 Não tá na lista!" }, { quoted: msg })
        arr.splice(idx, 1); lista[jid] = arr; db.salvarListanegra(lista)
        await sock.sendMessage(jid, { text: "✅ +" + numero + " perdoado!" }, { quoted: msg })
      }
    },

    // ============ BEMVINDO ============
    bemvindo: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: "👋 *!bemvindo on/off*" }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].bemvindo = opcao === "on"; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: "🎩 Boas-vindas: *" + opcao.toUpperCase() + "*" }, { quoted: msg })
      }
    },

    textobv: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const t = args.join(" ").trim()
        if (!t) return sock.sendMessage(jid, { text: "📝 *!textobv <texto>* (%nmr%)" }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].textobv = t; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: "✅ Texto de boas-vindas salvo!" }, { quoted: msg })
      }
    },

    fundobv: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const ctx = msg.message?.extendedTextMessage?.contextInfo || {}
        const quoted = ctx.quotedMessage
        const tem = msg.message?.imageMessage || quoted?.imageMessage
        if (!tem) return sock.sendMessage(jid, { text: "🖼️ Manda imagem~" }, { quoted: msg })
        const alvoMsg = msg.message?.imageMessage ? msg : { ...msg, message: { imageMessage: quoted.imageMessage } }
        const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].fundobv = buffer.toString("base64"); db.salvarGrupos(g)
        await sock.sendMessage(jid, { image: buffer, caption: "🎩 Foto de chegada salva!" }, { quoted: msg })
      }
    },

    legendasaiu: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const t = args.join(" ").trim()
        if (!t) return sock.sendMessage(jid, { text: "📝 *!legendasaiu <texto>* (%nmr%)" }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].legendasaiu = t; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: "✅ Legenda de partida salva!" }, { quoted: msg })
      }
    },

    fundosaiu: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const ctx = msg.message?.extendedTextMessage?.contextInfo || {}
        const quoted = ctx.quotedMessage
        const tem = msg.message?.imageMessage || quoted?.imageMessage
        if (!tem) return sock.sendMessage(jid, { text: "🖼️ Manda imagem~" }, { quoted: msg })
        const alvoMsg = msg.message?.imageMessage ? msg : { ...msg, message: { imageMessage: quoted.imageMessage } }
        const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].fundosaiu = buffer.toString("base64"); db.salvarGrupos(g)
        await sock.sendMessage(jid, { image: buffer, caption: "🎩 Foto de partida salva!" }, { quoted: msg })
      }
    },

    // ============ AGENDAMENTO ============
    abrirgp: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils, groupMetadata }) {
        const jid = msg.key.remoteJid
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: "🦅 Preciso ser *admin*!" }, { quoted: msg })
        const hora = args[0]
        if (!hora || !/^\d{1,2}:\d{2}$/.test(hora)) return sock.sendMessage(jid, { text: "⏰ *!abrirgp hh:mm*" }, { quoted: msg })
        const [h, m] = hora.split(":").map(Number)
        const fmt = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0")
        const g = db.grupos(); g[jid] = g[jid] || {}
        g[jid].abrirHora = fmt; g[jid].ultimoAbrir = null; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: "🏰 Abertura agendada para *" + fmt + "*" }, { quoted: msg })
      }
    },

    fechargp: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils, groupMetadata }) {
        const jid = msg.key.remoteJid
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: "🦅 Preciso ser *admin*!" }, { quoted: msg })
        const hora = args[0]
        if (!hora || !/^\d{1,2}:\d{2}$/.test(hora)) return sock.sendMessage(jid, { text: "⏰ *!fechargp hh:mm*" }, { quoted: msg })
        const [h, m] = hora.split(":").map(Number)
        const fmt = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0")
        const g = db.grupos(); g[jid] = g[jid] || {}
        g[jid].fecharHora = fmt; g[jid].ultimoFechar = null; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: "🏰 Fechamento agendado para *" + fmt + "*" }, { quoted: msg })
      }
    },

    fotoabrir: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils }) {
        const jid = msg.key.remoteJid
        const ctx = msg.message?.extendedTextMessage?.contextInfo || {}
        const quoted = ctx.quotedMessage
        const tem = msg.message?.imageMessage || quoted?.imageMessage
        const legenda = (args.join(" ").trim()) || (quoted?.imageMessage?.caption) || null
        const g = db.grupos(); g[jid] = g[jid] || {}
        if (tem) {
          const alvoMsg = msg.message?.imageMessage ? msg : { ...msg, message: { imageMessage: quoted.imageMessage } }
          const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          g[jid].fotoAbrir = buffer.toString("base64")
          if (legenda) g[jid].legendaAbrir = legenda
          db.salvarGrupos(g)
          return sock.sendMessage(jid, { image: buffer, caption: "🎩 Foto de abertura salva!" }, { quoted: msg })
        }
        if (legenda) { g[jid].legendaAbrir = legenda; db.salvarGrupos(g); return sock.sendMessage(jid, { text: "✅ " + legenda }, { quoted: msg }) }
      }
    },

    fotofechar: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils }) {
        const jid = msg.key.remoteJid
        const ctx = msg.message?.extendedTextMessage?.contextInfo || {}
        const quoted = ctx.quotedMessage
        const tem = msg.message?.imageMessage || quoted?.imageMessage
        const legenda = (args.join(" ").trim()) || (quoted?.imageMessage?.caption) || null
        const g = db.grupos(); g[jid] = g[jid] || {}
        if (tem) {
          const alvoMsg = msg.message?.imageMessage ? msg : { ...msg, message: { imageMessage: quoted.imageMessage } }
          const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          g[jid].fotoFechar = buffer.toString("base64")
          if (legenda) g[jid].legendaFechar = legenda
          db.salvarGrupos(g)
          return sock.sendMessage(jid, { image: buffer, caption: "🎩 Foto de fechamento salva!" }, { quoted: msg })
        }
        if (legenda) { g[jid].legendaFechar = legenda; db.salvarGrupos(g); return sock.sendMessage(jid, { text: "✅ " + legenda }, { quoted: msg }) }
      }
    },

    // ============ SORTEIO ============
    sorteio: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, utils }) {
        const jid = msg.key.remoteJid
        if (args.length < 2) return sock.sendMessage(jid, { text: "🎁 *!sorteio <prêmio> <tempo>*" }, { quoted: msg })
        const dRaw = args[args.length - 1].toLowerCase()
        const premio = args.slice(0, -1).join(" ")
        const m = dRaw.match(/^(\d+)(s|m|h)$/)
        if (!m) return sock.sendMessage(jid, { text: "🦅 Use 30s/5m/1h" }, { quoted: msg })
        const v = parseInt(m[1]), u = m[2]
        let ms = 0, txt = ""
        if (u === "s") { ms = v * 1000; txt = v + "s" }
        if (u === "m") { ms = v * 60000; txt = v + "min" }
        if (u === "h") { ms = v * 3600000; txt = v + "h" }
        await sock.sendMessage(jid, { text: "⚔️ *SORTEIO IMPERIAL*\n\n" + premio + "\n⏰ " + txt }, { quoted: msg })
        setTimeout(async () => {
          try {
            const meta = await sock.groupMetadata(jid)
            const mbs = meta.participants.map(p => p.id)
            if (!mbs.length) return
            const g = mbs[Math.floor(Math.random() * mbs.length)]
            await sock.sendMessage(jid, { text: "🎉 *VENCEDOR!*\n\n" + premio + "\n🥇 @" + utils.soNumero(g) + "\n🦅 _\"A fortuna sorri aos corajosos.\"_", mentions: [g] })
          } catch (_) {}
        }, ms)
      }
    },

    // ============ PARCERIA ============
    modoparceria: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const parcerias = db.parcerias()
        parcerias[jid] = parcerias[jid] || { ativo: false, parceiros: {} }
        const sub = (args[0] || "").toLowerCase()
        if (sub === "on") parcerias[jid].ativo = true
        else if (sub === "off") parcerias[jid].ativo = false
        else parcerias[jid].ativo = !parcerias[jid].ativo
        db.salvarParcerias(parcerias)
        await sock.sendMessage(jid, { text: "🤝 Aliança: *" + (parcerias[jid].ativo ? "ON" : "OFF") + "*" }, { quoted: msg })
      }
    },

    addparceria: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: "⚔️ Marque um soldado!" }, { quoted: msg })
        const qtd = parseInt(args.find(a => /^\d+$/.test(a)) || "0", 10)
        if (!qtd) return sock.sendMessage(jid, { text: "⚠️ Quantidade!" }, { quoted: msg })
        const parcerias = db.parcerias()
        parcerias[jid] = parcerias[jid] || { ativo: false, parceiros: {} }
        parcerias[jid].parceiros = parcerias[jid].parceiros || {}
        parcerias[jid].parceiros[alvo] = { total: qtd, usados: 0, desde: Date.now() }
        db.salvarParcerias(parcerias)
        await sock.sendMessage(jid, { text: "🤝 @" + utils.soNumero(alvo) + " → *" + qtd + "*", mentions: [alvo] }, { quoted: msg })
      }
    },

    rmparceria: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: "⚔️ Marque!" }, { quoted: msg })
        const parcerias = db.parcerias()
        if (!parcerias[jid]?.parceiros?.[alvo]) return sock.sendMessage(jid, { text: "💔 Sem aliança." }, { quoted: msg })
        delete parcerias[jid].parceiros[alvo]; db.salvarParcerias(parcerias)
        await sock.sendMessage(jid, { text: "⚔️ @" + utils.soNumero(alvo) + " fora da aliança!", mentions: [alvo] }, { quoted: msg })
      }
    },

    parcerias: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const dados = (db.parcerias())[jid] || {}
        if (!dados.parceiros || !Object.keys(dados.parceiros).length) return sock.sendMessage(jid, { text: "🤝 Nenhuma aliança." }, { quoted: msg })
        const ativo = dados.ativo ? "🟢" : "🔴"
        let txt = "🤝 *ALIANÇAS* (" + ativo + ")\n\n"
        const mentions = []
        for (const [jidP, info] of Object.entries(dados.parceiros)) {
          txt += "👤 @" + utils.soNumero(jidP) + "\n📊 " + info.usados + "/" + info.total + "\n\n"
          mentions.push(jidP)
        }
        await sock.sendMessage(jid, { text: txt, mentions: mentions }, { quoted: msg })
      }
    }

  }
                }
