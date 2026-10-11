/* ============================================================
   ⚡ MENU ADM - ZENITSU BOT MD
   ============================================================ */

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
        const donoArr = Array.isArray(config && config.dono) ? config.dono : [config && config.dono || "Chefe"]
        const nomeDono = String(donoArr[0] || "Chefe").split("@")[0].split(":")[0].replace(/\D/g, "") || "Chefe"
        const nomeBot = (config && config.nomeBot) || "Zenitsu Bot - MD"
        const mentions = sender ? [sender] : []

        const texto =
`⚡ *SAUDAÇÕES, @${numUser}* 🦅
${saudacao}!

╭━━━━━━━━━━━━━━━━━━━━━╮
┃ 👤 *Soldado:* ${pushName}
┃ 🎩 *Bot:* ${nomeBot}
┃ 👑 *Imperador:* ${nomeDono}
┃ 💎 *Nobreza:* ${premium}
┃ ⏰ *Hora:* ${hora}
╰━━━━━━━━━━━━━━━━━━━━━╯

⚡ _"Um exército marcha com disciplina."_`

        // 📸 Mensagem 1: com foto/vídeo ou texto
        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          try {
            if (cfg.tipoMenu === "video") {
              await sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "zenitsu-menu.mp4", gifPlayback: true, caption: texto, mentions }, { quoted: msg })
            } else {
              await sock.sendMessage(jid, { image: buf, caption: texto, mentions }, { quoted: msg })
            }
          } catch (e) {
            await sock.sendMessage(jid, { text: texto, mentions }, { quoted: msg })
          }
        } else {
          await sock.sendMessage(jid, { text: texto, mentions }, { quoted: msg })
        }

        // 📋 Mensagem 2: lista de menus melhorada
        try {
          await sock.sendMessage(jid, {
            text: "⚡ *Escolha uma categoria de comandos:*",
            footer: "🦅 " + nomeBot,
            title: "⚡ MENUS DO IMPÉRIO",
            buttonText: "☰ ABRIR MENUS",
            sections: [
              {
                title: "⚔️ ADMINISTRAÇÃO",
                rows: [
                  { title: "🛡️ Menu Admin", rowId: p + "menuadmin", description: "Banir, mutar, proteções, x9..." },
                  { title: "👑 Menu Dono", rowId: p + "menudono", description: "Comandos exclusivos do imperador" }
                ]
              },
              {
                title: "💎 ÁREA NOBRE",
                rows: [
                  { title: "💎 Menu VIP", rowId: p + "menuvip", description: "Figurinhas, logos, autofig, autottk" }
                ]
              },
              {
                title: "🎮 JOGOS E DIVERSÃO",
                rows: [
                  { title: "⚡ Menu RPG", rowId: p + "menurpg", description: "Economia, pets, exploração, cassino" },
                  { title: "🌾 Menu Fazenda", rowId: p + "menufazenda", description: "Animais, plantações, cercados" },
                  { title: "🌙 Menu FNAF", rowId: p + "menufnaf", description: "Five Nights at Freddy's" },
                  { title: "🏙️ Menu Cidade", rowId: p + "menucidade", description: "Casas, banco, crimes, interações" }
                ]
              }
            ]
          })
        } catch (e) {
          // Se a lista falhar (WhatsApp antigo), manda texto puro
          await sock.sendMessage(jid, {
            text: "⚡ *MENUS DISPONÍVEIS:*\n\n" +
              "🛡️ ▸ " + p + "menuadmin\n" +
              "👑 ▸ " + p + "menudono\n" +
              "💎 ▸ " + p + "menuvip\n" +
              "⚡ ▸ " + p + "menurpg\n" +
              "🌾 ▸ " + p + "menufazenda\n" +
              "🌙 ▸ " + p + "menufnaf\n" +
              "🏙️ ▸ " + p + "menucidade"
          }, { quoted: msg })
        }
      }
    },

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
        await sock.sendMessage(jid, {
          text: "⚡ TOTAL DE COMANDOS\n\n▸ ⚡ Comandos: *" + total + "*\n▸ 🔗 Aliases: *" + totalAliases + "*\n▸ 📈 Total: *" + (total + totalAliases) + "*\n\n📂 POR CATEGORIA:\n" + (listaCat || "_nenhuma_")
        }, { quoted: msg })
      }
    },

    menuadmin: {
      aliases: ["menu-adm", "menua", "adm", "comandosadm"],
      async executar({ sock, msg, prefixoAtivo, db }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "!"
        const cfg = db.config() || {}
        const texto =
"⚡ *COMANDO ADMIN*\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━\n" +
"🗡️ *PREFIXO*\n▸ " + p + "multiprefixo on/off\n▸ " + p + "setprefixo <novo>\n▸ " + p + "prefixo\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━\n" +
"⚠️ *ADV*\n▸ " + p + "adv @user motivo\n▸ " + p + "deladv @user\n▸ " + p + "listaadv\n▸ " + p + "veradv @user\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━\n" +
"👥 *MEMBROS*\n▸ " + p + "promover @user\n▸ " + p + "rebaixar @user\n▸ " + p + "ban @user\n▸ " + p + "mute @user\n▸ " + p + "desmute @user\n▸ " + p + "p (reply)\n▸ " + p + "totag <texto>\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━\n" +
"🏰 *GRUPO*\n▸ " + p + "abrir / " + p + "fechar\n▸ " + p + "link\n▸ " + p + "soadm on/off\n▸ " + p + "namegp <nome>\n▸ " + p + "descricao <texto>\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━\n" +
"👑 *SUB-ADM*\n▸ " + p + "subadm @user\n▸ " + p + "delsubadm @user\n▸ " + p + "listasubadm\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━\n" +
"🛡️ *PROTEÇÕES*\n▸ " + p + "antilink on/off\n▸ " + p + "antiaudio on/off\n▸ " + p + "antivideo on/off\n▸ " + p + "antifoto on/off\n▸ " + p + "antifig on/off\n▸ " + p + "palavrao on/off\n▸ " + p + "addpalavra <palavra>\n▸ " + p + "rmpalavra <palavra>\n▸ " + p + "listapalavra\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━\n" +
"🕵️ *X9 / PARCERIA*\n▸ " + p + "x9 on/off\n▸ " + p + "modoparceria on/off\n▸ " + p + "addparceria @user <qtd>\n▸ " + p + "rmparceria @user\n▸ " + p + "parcerias\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━\n" +
"🚫 *LISTA NEGRA*\n▸ " + p + "listanegra <número>\n▸ " + p + "blacklist\n▸ " + p + "dellista <número>\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━\n" +
"👋 *BEM-VINDO*\n▸ " + p + "bemvindo on/off\n▸ " + p + "textobv <texto>\n▸ " + p + "fundoBV (reply)\n▸ " + p + "legendasaiu <texto>\n▸ " + p + "fundoSaiu (reply)\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━\n" +
"⏰ *AGENDAMENTO*\n▸ " + p + "abrirgp hh:mm\n▸ " + p + "fechargp hh:mm\n▸ " + p + "fotoabrir (reply)\n▸ " + p + "fotofechar (reply)\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━\n" +
"🎁 *SORTEIO*\n▸ " + p + "sorteio <prêmio> <tempo>\n\n" +
"━━━━━━━━━━━━━━━━━━━━━━\n\n" +
"⚡ Prefixo atual: *" + p + "*"
        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          if (cfg.tipoMenu === "video") return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "zenitsu.mp4", gifPlayback: true, caption: texto }, { quoted: msg })
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
        let texto = "⚡ *PREFIXO*\n\n▸ Padrão: *" + padrao + "*\n▸ Ativo: *" + prefixoAtivo + "*\n"
        if (grupoConf.multiprefixo) texto += "▸ Multiprefixo: *ON*\n▸ Do grupo: *" + (grupoConf.prefixo || padrao) + "*\n"
        else texto += "▸ Multiprefixo: *OFF*\n"
        texto += "\n⚡ Aceitos: *!* e */*"
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    ping: {
      aliases: ["pong", "latencia"],
      async executar({ sock, msg, sender, utils }) {
        const jid = msg.key.remoteJid
        const t1 = Date.now()
        const sent = await sock.sendMessage(jid, { text: "⚡ Medindo..." }, { quoted: msg })
        const t2 = Date.now()
        let pingReal = 0
        try { await sock.groupMetadata(jid); pingReal = Date.now() - t2 } catch (_) { pingReal = Date.now() - t2 }
        const pingTotal = Date.now() - t1
        let qual = "🟢 Ótimo"
        if (pingReal > 200) qual = "🟡 Aceitável"
        if (pingReal > 500) qual = "🔴 Ruim"
        if (pingReal > 1000) qual = "💀 Péssimo"
        await sock.sendMessage(jid, {
          text: "⚡ *PING*\n\n▸ Ping: *" + pingReal + "ms*\n▸ Processamento: *" + pingTotal + "ms*\n▸ Qualidade: *" + qual + "*\n▸ @" + utils.soNumero(sender),
          mentions: [sender], edit: sent.key
        })
      }
    },

    p: {
      aliases: ["apagar", "delmsg"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils }) {
        const jid = msg.key.remoteJid
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo
        if (!ctx || !ctx.stanzaId) return sock.sendMessage(jid, { text: "⚡ Responda uma mensagem com *!p*" }, { quoted: msg })
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: "⚡ Preciso ser *admin*!" }, { quoted: msg })
        try {
          await sock.sendMessage(jid, { delete: { remoteJid: jid, fromMe: false, id: ctx.stanzaId, participant: ctx.participant || (ctx.mentionedJid && ctx.mentionedJid[0]) } })
          await sock.sendMessage(jid, { text: "⚡ Apagado!" }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: "⚡💢 " + e.message }, { quoted: msg }) }
      }
    },

    abrir: {
      aliases: ["opennow"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils }) {
        const jid = msg.key.remoteJid
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: "⚡ Preciso ser admin!" }, { quoted: msg })
        try {
          await sock.groupSettingUpdate(jid, "not_announcement")
          await sock.sendMessage(jid, { text: "⚡ *TERRITÓRIO ABERTO!*" }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: "⚡💢 " + e.message }, { quoted: msg }) }
      }
    },

    fechar: {
      aliases: ["closenow"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils }) {
        const jid = msg.key.remoteJid
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: "⚡ Preciso ser admin!" }, { quoted: msg })
        try {
          await sock.groupSettingUpdate(jid, "announcement")
          await sock.sendMessage(jid, { text: "⚡ *TERRITÓRIO FECHADO!*" }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: "⚡💢 " + e.message }, { quoted: msg }) }
      }
    },

    namegp: {
      aliases: ["setnomegp", "nomegrupo"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, groupMetadata, utils }) {
        const jid = msg.key.remoteJid
        const nome = args.join(" ").trim()
        if (!nome) return sock.sendMessage(jid, { text: "⚡ Use: *!namegp <nome>*" }, { quoted: msg })
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: "⚡ Preciso ser admin!" }, { quoted: msg })
        try {
          await sock.groupUpdateSubject(jid, nome)
          await sock.sendMessage(jid, { text: "⚡ Nome: *" + nome + "*" }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: "⚡💢 " + e.message }, { quoted: msg }) }
      }
    },

    descricao: {
      aliases: ["setdescricao", "descgp"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, groupMetadata, utils }) {
        const jid = msg.key.remoteJid
        const desc = args.join(" ").trim()
        if (!desc) return sock.sendMessage(jid, { text: "⚡ Use: *!descricao <texto>*" }, { quoted: msg })
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: "⚡ Preciso ser admin!" }, { quoted: msg })
        try {
          await sock.groupUpdateDescription(jid, desc)
          await sock.sendMessage(jid, { text: "⚡ Descrição atualizada!" }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: "⚡💢 " + e.message }, { quoted: msg }) }
      }
    },

    link: {
      aliases: ["linkgp"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils }) {
        const jid = msg.key.remoteJid
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: "⚡ Preciso ser admin!" }, { quoted: msg })
        try {
          const code = await sock.groupInviteCode(jid)
          await sock.sendMessage(jid, { text: "🔗 https://chat.whatsapp.com/" + code }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: "⚡💢 " + e.message }, { quoted: msg }) }
      }
    },

    mute: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: "⚡ Marque alguém!" }, { quoted: msg })
        const mutados = db.mutados()
        mutados[jid] = mutados[jid] || {}
        mutados[jid][alvo] = Date.now() + 5 * 60 * 1000
        db.salvarMutados(mutados)
        await sock.sendMessage(jid, { text: "🔇 @" + utils.soNumero(alvo) + " silenciado *5 min*", mentions: [alvo] }, { quoted: msg })
      }
    },

    desmute: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: "⚡ Marque alguém!" }, { quoted: msg })
        const mutados = db.mutados()
        if (mutados[jid] && mutados[jid][alvo]) { delete mutados[jid][alvo]; db.salvarMutados(mutados) }
        await sock.sendMessage(jid, { text: "🔊 @" + utils.soNumero(alvo) + " liberado!", mentions: [alvo] }, { quoted: msg })
      }
    },

    palavrao: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: "⚡ Use: *!palavrao on/off*" }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].palavrao = opcao === "on"; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: "⚡ Palavrão: *" + opcao.toUpperCase() + "*" }, { quoted: msg })
      }
    },

    addpalavra: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const palavra = args.join(" ").trim().toLowerCase()
        if (!palavra) return sock.sendMessage(jid, { text: "⚡ *!addpalavra <palavra>*" }, { quoted: msg })
        const p = db.palavroes(); p[jid] = p[jid] || []
        if (p[jid].includes(palavra)) return sock.sendMessage(jid, { text: "⚡ Já tá na lista!" }, { quoted: msg })
        p[jid].push(palavra); db.salvarPalavroes(p)
        await sock.sendMessage(jid, { text: "⚡ `" + palavra + "` adicionada!" }, { quoted: msg })
      }
    },

    rmpalavra: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const palavra = args.join(" ").trim().toLowerCase()
        if (!palavra) return sock.sendMessage(jid, { text: "⚡ *!rmpalavra <palavra>*" }, { quoted: msg })
        const p = db.palavroes(); const arr = p[jid] || []
        const idx = arr.indexOf(palavra)
        if (idx === -1) return sock.sendMessage(jid, { text: "⚡ Não tá na lista!" }, { quoted: msg })
        arr.splice(idx, 1); p[jid] = arr; db.salvarPalavroes(p)
        await sock.sendMessage(jid, { text: "✅ `" + palavra + "` removida!" }, { quoted: msg })
      }
    },

    listapalavra: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const lista = db.palavroes()[jid] || []
        if (!lista.length) return sock.sendMessage(jid, { text: "⚡ Nenhuma palavra!" }, { quoted: msg })
        let t = "⚡ *PALAVRAS PROIBIDAS*\n\n"
        lista.forEach((p, i) => { t += (i + 1) + ". `" + p + "`\n" })
        await sock.sendMessage(jid, { text: t }, { quoted: msg })
      }
    },

    antilink: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: "⚡ *!antilink on/off*" }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].antilink = opcao === "on"; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: "⚡ Antilink: *" + opcao.toUpperCase() + "*" }, { quoted: msg })
      }
    },

    antiaudio: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: "⚡ *!antiaudio on/off*" }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].antiaudio = opcao === "on"; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: "⚡ Antiaudio: *" + opcao.toUpperCase() + "*" }, { quoted: msg })
      }
    },

    antivideo: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: "⚡ *!antivideo on/off*" }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].antivideo = opcao === "on"; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: "⚡ Antivideo: *" + opcao.toUpperCase() + "*" }, { quoted: msg })
      }
    },

    antifoto: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: "⚡ *!antifoto on/off*" }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].antifoto = opcao === "on"; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: "⚡ Antifoto: *" + opcao.toUpperCase() + "*" }, { quoted: msg })
      }
    },

    antifig: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: "⚡ *!antifig on/off*" }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].antifig = opcao === "on"; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: "⚡ Antifig: *" + opcao.toUpperCase() + "*" }, { quoted: msg })
      }
    },

    promover: {
      aliases: ["promote", "daradm"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils }) {
        const jid = msg.key.remoteJid
        const alvoRaw = utils.getAlvo(msg)
        if (!alvoRaw) return sock.sendMessage(jid, { text: "⚡ Marque alguém!" }, { quoted: msg })
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: "⚡ Preciso ser admin!" }, { quoted: msg })
        const n = utils.soNumero(alvoRaw)
        const part = groupMetadata.participants.find(p => [p.id, p.lid, p.phoneNumber].filter(Boolean).map(utils.soNumero).includes(n))
        if (!part) return sock.sendMessage(jid, { text: "⚡ Não achei!" }, { quoted: msg })
        try {
          await sock.groupParticipantsUpdate(jid, [part.id], "promote")
          await sock.sendMessage(jid, { text: "⚡ @" + n + " promovido!", mentions: [part.id] }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: "⚡💢 " + e.message }, { quoted: msg }) }
      }
    },

    rebaixar: {
      aliases: ["demote", "tiraradm"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils }) {
        const jid = msg.key.remoteJid
        const alvoRaw = utils.getAlvo(msg)
        if (!alvoRaw) return sock.sendMessage(jid, { text: "⚡ Marque alguém!" }, { quoted: msg })
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: "⚡ Preciso ser admin!" }, { quoted: msg })
        const n = utils.soNumero(alvoRaw)
        const part = groupMetadata.participants.find(p => [p.id, p.lid, p.phoneNumber].filter(Boolean).map(utils.soNumero).includes(n))
        if (!part) return sock.sendMessage(jid, { text: "⚡ Não achei!" }, { quoted: msg })
        try {
          await sock.groupParticipantsUpdate(jid, [part.id], "demote")
          await sock.sendMessage(jid, { text: "⚡ @" + n + " rebaixado!", mentions: [part.id] }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: "⚡💢 " + e.message }, { quoted: msg }) }
      }
    },

    ban: {
      aliases: ["kick", "remover"],
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils }) {
        const jid = msg.key.remoteJid
        const alvoRaw = utils.getAlvo(msg)
        if (!alvoRaw) return sock.sendMessage(jid, { text: "⚡ Marque alguém!" }, { quoted: msg })
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: "⚡ Preciso ser admin!" }, { quoted: msg })
        const n = utils.soNumero(alvoRaw)
        const part = groupMetadata.participants.find(p => [p.id, p.lid, p.phoneNumber].filter(Boolean).map(utils.soNumero).includes(n))
        if (!part) return sock.sendMessage(jid, { text: "⚡ Não achei!" }, { quoted: msg })
        try {
          await sock.groupParticipantsUpdate(jid, [part.id], "remove")
          await sock.sendMessage(jid, { text: "⚡ @" + n + " expulso!", mentions: [part.id] }, { quoted: msg })
        } catch (e) { await sock.sendMessage(jid, { text: "⚡💢 " + e.message }, { quoted: msg }) }
      }
    },

    veradv: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: "⚡ Marque alguém!" }, { quoted: msg })
        const total = (db.advs()[jid] && db.advs()[jid][alvo]) || 0
        await sock.sendMessage(jid, { text: "⚡ @" + utils.soNumero(alvo) + " — *" + total + "/3*", mentions: [alvo] }, { quoted: msg })
      }
    },

    adv: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: "⚡ Use: *!adv @user <motivo>*" }, { quoted: msg })
        const motivo = args.filter(a => !a.includes("@")).join(" ") || "Sem motivo"
        const advs = db.advs()
        advs[jid] = advs[jid] || {}
        advs[jid][alvo] = (advs[jid][alvo] || 0) + 1
        const total = advs[jid][alvo]
        const n = utils.soNumero(alvo)
        if (total >= 3) {
          delete advs[jid][alvo]; db.salvarAdvs(advs)
          await sock.sendMessage(jid, { text: "⚡ @" + n + " atingiu *3/3*!", mentions: [alvo] }, { quoted: msg })
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
        if (!alvo) return sock.sendMessage(jid, { text: "⚡ Marque alguém!" }, { quoted: msg })
        const advs = db.advs()
        const atual = (advs[jid] && advs[jid][alvo]) || 0
        if (atual <= 0) return sock.sendMessage(jid, { text: "✅ Ficha limpa!" }, { quoted: msg })
        advs[jid][alvo] = atual - 1
        if (advs[jid][alvo] === 0) delete advs[jid][alvo]
        db.salvarAdvs(advs)
        await sock.sendMessage(jid, { text: "⚡ @" + utils.soNumero(alvo) + " — *" + ((advs[jid] && advs[jid][alvo]) || 0) + "/3*", mentions: [alvo] }, { quoted: msg })
      }
    },

    listaadv: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const entradas = Object.entries(db.advs()[jid] || {})
        if (!entradas.length) return sock.sendMessage(jid, { text: "📋 Nenhuma advertência!" }, { quoted: msg })
        entradas.sort((a, b) => b[1] - a[1])
        let t = "📋 *FICHAS SUJAS*\n\n"
        entradas.forEach(([j, q], i) => { t += (i + 1) + ". @" + utils.soNumero(j) + " — *" + q + "/3*\n" })
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
        if (!texto) return sock.sendMessage(jid, { text: "📢 *!totag <texto>*" }, { quoted: msg })
        const mentions = groupMetadata.participants.map(p => p.id)
        await sock.sendMessage(jid, { text: texto, mentions }, { quoted: msg })
      }
    },

    subadm: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: "⚡ Marque alguém!" }, { quoted: msg })
        const subs = db.subadmins(); subs[jid] = subs[jid] || []
        if (subs[jid].some(s => utils.soNumero(s) === utils.soNumero(alvo))) return sock.sendMessage(jid, { text: "⚡ Já é sub-adm!" }, { quoted: msg })
        subs[jid].push(alvo); db.salvarSubadmins(subs)
        await sock.sendMessage(jid, { text: "⚡ @" + utils.soNumero(alvo) + " agora é *Sub-Adm*!", mentions: [alvo] }, { quoted: msg })
      }
    },

    delsubadm: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: "⚡ Marque alguém!" }, { quoted: msg })
        const subs = db.subadmins()
        subs[jid] = (subs[jid] || []).filter(s => utils.soNumero(s) !== utils.soNumero(alvo))
        db.salvarSubadmins(subs)
        await sock.sendMessage(jid, { text: "⚡ @" + utils.soNumero(alvo) + " não é mais Sub-Adm!", mentions: [alvo] }, { quoted: msg })
      }
    },

    listasubadm: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const subs = db.subadmins()[jid] || []
        if (!subs.length) return sock.sendMessage(jid, { text: "⚡ Nenhum Sub-Adm!" }, { quoted: msg })
        let t = "⚡ *SUB-ADMINS*\n\n"
        subs.forEach((s, i) => { t += (i + 1) + ". @" + utils.soNumero(s) + "\n" })
        await sock.sendMessage(jid, { text: t, mentions: subs }, { quoted: msg })
      }
    },

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
        if (!conf.multiprefixo) return sock.sendMessage(jid, { text: "⚡ Multiprefixo OFF!" }, { quoted: msg })
        const novo = args[0]
        if (!novo) return sock.sendMessage(jid, { text: "⚙️ *!setprefixo <novo>*" }, { quoted: msg })
        if (novo.length > 3) return sock.sendMessage(jid, { text: "💢 Máx 3!" }, { quoted: msg })
        g[jid].prefixo = novo; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: "⚡ Prefixo: *" + novo + "*" }, { quoted: msg })
      }
    },

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

    listanegra: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, groupMetadata, utils }) {
        const jid = msg.key.remoteJid
        const numero = (args[0] || "").replace(/\D/g, "")
        if (!numero || numero.length < 8) return sock.sendMessage(jid, { text: "🚫 *!listanegra <número>*" }, { quoted: msg })
        const lista = db.listanegra(); lista[jid] = lista[jid] || []
        if (lista[jid].includes(numero)) return sock.sendMessage(jid, { text: "⚡ Já tá na lista negra!" }, { quoted: msg })
        lista[jid].push(numero); db.salvarListanegra(lista)
        await sock.sendMessage(jid, { text: "🚫 +" + numero + " marcado!" }, { quoted: msg })
        try {
          const part = groupMetadata && groupMetadata.participants.find(p => [p.id, p.lid, p.phoneNumber].filter(Boolean).map(utils.soNumero).includes(numero))
          if (part) {
            await sock.groupParticipantsUpdate(jid, [part.id], "remove")
            await sock.sendMessage(jid, { text: "⚡ @" + numero + " expulso!", mentions: [part.id] })
          }
        } catch (_) {}
      }
    },

    blacklist: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const lista = (db.listanegra()[jid] || [])
        if (!lista.length) return sock.sendMessage(jid, { text: "🚫 Lista negra vazia!" }, { quoted: msg })
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
        if (idx === -1) return sock.sendMessage(jid, { text: "⚡ Não tá na lista!" }, { quoted: msg })
        arr.splice(idx, 1); lista[jid] = arr; db.salvarListanegra(lista)
        await sock.sendMessage(jid, { text: "✅ +" + numero + " perdoado!" }, { quoted: msg })
      }
    },

    bemvindo: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: "👋 *!bemvindo on/off*" }, { quoted: msg })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].bemvindo = opcao === "on"; db.salvarGrupos(g)
        await sock.sendMessage(jid, { text: "⚡ Boas-vindas: *" + opcao.toUpperCase() + "*" }, { quoted: msg })
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
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const quoted = ctx.quotedMessage
        const tem = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage)
        if (!tem) return sock.sendMessage(jid, { text: "🖼️ Manda imagem!" }, { quoted: msg })
        const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage } })
        const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].fundobv = buffer.toString("base64"); db.salvarGrupos(g)
        await sock.sendMessage(jid, { image: buffer, caption: "⚡ Foto de chegada salva!" }, { quoted: msg })
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
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const quoted = ctx.quotedMessage
        const tem = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage)
        if (!tem) return sock.sendMessage(jid, { text: "🖼️ Manda imagem!" }, { quoted: msg })
        const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage } })
        const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].fundosaiu = buffer.toString("base64"); db.salvarGrupos(g)
        await sock.sendMessage(jid, { image: buffer, caption: "⚡ Foto de partida salva!" }, { quoted: msg })
      }
    },

    abrirgp: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils, groupMetadata }) {
        const jid = msg.key.remoteJid
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: "⚡ Preciso ser admin!" }, { quoted: msg })
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
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: "⚡ Preciso ser admin!" }, { quoted: msg })
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
          return sock.sendMessage(jid, { image: buffer, caption: "⚡ Foto de abertura salva!" }, { quoted: msg })
        }
        if (legenda) { g[jid].legendaAbrir = legenda; db.salvarGrupos(g); return sock.sendMessage(jid, { text: "✅ " + legenda }, { quoted: msg }) }
      }
    },

    fotofechar: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils }) {
        const jid = msg.key.remoteJid
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
          return sock.sendMessage(jid, { image: buffer, caption: "⚡ Foto de fechamento salva!" }, { quoted: msg })
        }
        if (legenda) { g[jid].legendaFechar = legenda; db.salvarGrupos(g); return sock.sendMessage(jid, { text: "✅ " + legenda }, { quoted: msg }) }
      }
    },

    sorteio: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, utils }) {
        const jid = msg.key.remoteJid
        if (args.length < 2) return sock.sendMessage(jid, { text: "🎁 *!sorteio <prêmio> <tempo>*" }, { quoted: msg })
        const dRaw = args[args.length - 1].toLowerCase()
        const premio = args.slice(0, -1).join(" ")
        const m = dRaw.match(/^(\d+)(s|m|h)$/)
        if (!m) return sock.sendMessage(jid, { text: "⚡ Use 30s/5m/1h" }, { quoted: msg })
        const v = parseInt(m[1]), u = m[2]
        let ms = 0, txt = ""
        if (u === "s") { ms = v * 1000; txt = v + "s" }
        if (u === "m") { ms = v * 60000; txt = v + "min" }
        if (u === "h") { ms = v * 3600000; txt = v + "h" }
        await sock.sendMessage(jid, { text: "⚡ *SORTEIO*\n\n" + premio + "\n⏰ " + txt }, { quoted: msg })
        setTimeout(async () => {
          try {
            const meta = await sock.groupMetadata(jid)
            const mbs = meta.participants.map(p => p.id)
            if (!mbs.length) return
            const g = mbs[Math.floor(Math.random() * mbs.length)]
            await sock.sendMessage(jid, { text: "🎉 *VENCEDOR!*\n\n" + premio + "\n🥇 @" + utils.soNumero(g), mentions: [g] })
          } catch (_) {}
        }, ms)
      }
    },

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
        if (!alvo) return sock.sendMessage(jid, { text: "⚡ Marque um soldado!" }, { quoted: msg })
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
        if (!alvo) return sock.sendMessage(jid, { text: "⚡ Marque!" }, { quoted: msg })
        const parcerias = db.parcerias()
        if (!parcerias[jid] || !parcerias[jid].parceiros || !parcerias[jid].parceiros[alvo]) return sock.sendMessage(jid, { text: "💔 Sem aliança." }, { quoted: msg })
        delete parcerias[jid].parceiros[alvo]; db.salvarParcerias(parcerias)
        await sock.sendMessage(jid, { text: "⚡ @" + utils.soNumero(alvo) + " fora da aliança!", mentions: [alvo] }, { quoted: msg })
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