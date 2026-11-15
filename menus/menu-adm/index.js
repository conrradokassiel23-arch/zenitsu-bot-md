/* ============================================================
   MENU ADM - LIMPO E ESTILIZADO
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
function getCfg(db) { try { return db.config() || {} } catch { return {} } }

// 🔍 FUNÇÃO PARA ACHAR O JID REAL (LID ou NÚMERO)
async function extrairNumeroReal(jidOuLid, groupMetadata) {
  if (!jidOuLid) return null;
  if (!groupMetadata) return jidOuLid;
  const numBruto = String(jidOuLid).split("@")[0].split(":")[0];
  const participante = groupMetadata.participants.find(p => {
    const idLimpo = String(p.id || "").split("@")[0];
    const lidLimpo = String(p.lid || "").split("@")[0];
    const phoneLimpo = String(p.phoneNumber || "").split("@")[0];
    return idLimpo === numBruto || lidLimpo === numBruto || phoneLimpo === numBruto;
  });
  if (participante) {
    const numeroFinal = participante.phoneNumber || participante.id;
    if (numeroFinal && !numeroFinal.includes("@lid")) {
      return numeroFinal.includes("@s.whatsapp.net") ? numeroFinal : `${numeroFinal}@s.whatsapp.net`;
    }
  }
  return jidOuLid;
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
        await reagir(sock, msg, "🛡️")

        const texto = `𝑴𝑬𝑵𝑼 𝑨𝑫𝑴

🤖 Bot: ${nomeBot}
⚡ Prefixo: ${p}
🟢 Status: Online

𝑀𝑂𝐷𝐸𝑅𝐴𝐶𝐴𝑂
${p}adv
${p}deladv
${p}listaadv
${p}promover
${p}rebaixar
${p}ban
${p}mute
${p}desmute
${p}p
${p}totag
${p}abrir
${p}fechar
${p}link
${p}descricao

𝑃𝑅𝑂𝑇𝐸𝐶𝑂𝐸𝑆
${p}antilink on/off
${p}antiaudio on/off
${p}antivideo on/off
${p}antifoto on/off
${p}antifig on/off
${p}palavrao on/off
${p}addpalavra
${p}rmpalavra

𝐶𝑂𝑁𝐹𝐼𝐺𝑈𝑅𝐴𝐶𝑂𝐸𝑆
${p}soadm on/off
${p}multiprefixo on/off
${p}setprefixo
${p}x9 on/off

𝐵𝐿𝐴𝐶𝐾𝐿𝐼𝑆𝑇
${p}listanegra
${p}blacklist
${p}dellista

𝐵𝑂𝐴𝑆 𝑉𝐼𝑁𝐷𝐴𝑆
${p}bemvindo on/off
${p}textobv
${p}fundobv
${p}legendasaiu
${p}fundosaiu
${p}verbv

𝐴𝐺𝐸𝑁𝐷𝐴𝑀𝐸𝑁𝑇𝑂
${p}abrirgp hh:mm
${p}fechargp hh:mm
${p}fotoabrir
${p}fotofechar
${p}legendaabrir
${p}legendafechar
${p}limparfotos

𝑃𝐴𝑅𝐶𝐸𝑅𝐼𝐴𝑆
${p}modoparceria on/off
${p}addparceria
${p}delparceria
${p}parcerias

𝐹𝐼𝐺𝑈𝑅𝐼𝑁𝐻𝐴𝑆
${p}rgfig
${p}rmfig
${p}listafig

> _Prefixo atual: ${p}_`

        const cfg = getCfg(db)
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

    p: {
      aliases: ["apagar", "delmsg"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, prefixoAtivo, groupMetadata, utils }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo
        if (!ctx || !ctx.stanzaId) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑨𝑷𝑨𝑮𝑨𝑹", "Responda uma mensagem.", `Use ${p}p respondendo a mensagem.`) }, { quoted: msg }) }
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑬𝑴 𝑷𝑬𝑹𝑴𝑰𝑺𝑺𝑨𝑶", "Eu preciso ser admin.", "Promova o bot.") }, { quoted: msg }) }
        try {
          await sock.sendMessage(jid, { delete: { remoteJid: jid, fromMe: false, id: ctx.stanzaId, participant: ctx.participant } })
          await reagir(sock, msg, "✅")
          await sock.sendMessage(jid, { text: msgSucesso("", "Mensagem apagada.", "Concluído.") }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "❌"); await sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha ao apagar.", "Verifique se sou admin.") }, { quoted: msg }) }
      }
    },

    abrir: {
      aliases: ["opennow"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils }) {
        const jid = msg.key.remoteJid
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑬𝑴 𝑷𝑬𝑹𝑴𝑰𝑺𝑺𝑨𝑶", "Eu preciso ser admin.", "Promova o bot.") }, { quoted: msg }) }
        try { await sock.groupSettingUpdate(jid, "not_announcement"); await reagir(sock, msg, "🔓"); await sock.sendMessage(jid, { text: msgSucesso("", "Grupo aberto.", "Todos podem falar.") }, { quoted: msg }) } catch (e) { await reagir(sock, msg, "❌"); await sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha ao abrir.", "Verifique se sou admin.") }, { quoted: msg }) }
      }
    },

    fechar: {
      aliases: ["closenow"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils }) {
        const jid = msg.key.remoteJid
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑬𝑴 𝑷𝑬𝑹𝑴𝑰𝑺𝑺𝑨𝑶", "Eu preciso ser admin.", "Promova o bot.") }, { quoted: msg }) }
        try { await sock.groupSettingUpdate(jid, "announcement"); await reagir(sock, msg, "🔒"); await sock.sendMessage(jid, { text: msgSucesso("", "Grupo fechado.", "Só admins falam.") }, { quoted: msg }) } catch (e) { await reagir(sock, msg, "❌"); await sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha ao fechar.", "Verifique se sou admin.") }, { quoted: msg }) }
      }
    },

    descricao: {
      aliases: ["setdescricao", "descgp"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, prefixoAtivo, groupMetadata, utils }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; const desc = args.join(" ").trim()
        if (!desc) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑫𝑬𝑺𝑪𝑹𝑰𝑪𝑨𝑶", "Informe o texto.", `Uso: ${p}descricao <texto>`) }, { quoted: msg }) }
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑬𝑴 𝑷𝑬𝑹𝑴𝑰𝑺𝑺𝑨𝑶", "Eu preciso ser admin.", "Promova o bot.") }, { quoted: msg }) }
        try { await sock.groupUpdateDescription(jid, desc); await reagir(sock, msg, "✅"); await sock.sendMessage(jid, { text: msgSucesso("", "Descrição alterada.", "Texto salvo.") }, { quoted: msg }) } catch (e) { await reagir(sock, msg, "❌"); await sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha ao alterar.", "Verifique se sou admin.") }, { quoted: msg }) }
      }
    },

    link: {
      aliases: ["linkgp"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils }) {
        const jid = msg.key.remoteJid
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑬𝑴 𝑷𝑬𝑹𝑴𝑰𝑺𝑺𝑨𝑶", "Eu preciso ser admin.", "Promova o bot.") }, { quoted: msg }) }
        try { const code = await sock.groupInviteCode(jid); await reagir(sock, msg, "🔗"); await sock.sendMessage(jid, { text: msgSucesso("", "Link gerado.", `https://chat.whatsapp.com/${code}`) }, { quoted: msg }) } catch (e) { await reagir(sock, msg, "❌"); await sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha ao gerar link.", "Verifique se sou admin.") }, { quoted: msg }) }
      }
    },

    mute: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, prefixoAtivo, utils, groupMetadata }) {
        const jid = msg.key.remoteJid; 
        let alvo = utils.getAlvo(msg); 
        const p = prefixoAtivo || "+"
        
        if (alvo) alvo = await extrairNumeroReal(alvo, groupMetadata);
        
        if (!alvo) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑴𝑼𝑻𝑬", "Marque alguém.", `Uso: ${p}mute @user`) }, { quoted: msg }) }
        
        const mutados = dbLer("mutados.json", {}); 
        mutados[jid] = mutados[jid] || {}; 
        mutados[jid][utils.soNumero(alvo)] = Date.now() + 5 * 60 * 1000; 
        dbSalvar("mutados.json", mutados)
        
        await reagir(sock, msg, "🔨")
        await sock.sendMessage(jid, { text: msgSucesso("", "Silenciado por 5 minutos.", `@${utils.soNumero(alvo)}`), mentions: [alvo] }, { quoted: msg })
      }
    },

    desmute: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, prefixoAtivo, utils, groupMetadata }) {
        const jid = msg.key.remoteJid; 
        let alvo = utils.getAlvo(msg); 
        const p = prefixoAtivo || "+"
        
        if (alvo) alvo = await extrairNumeroReal(alvo, groupMetadata);
        
        if (!alvo) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑫𝑬𝑺𝑴𝑼𝑻𝑬", "Marque alguém.", `Uso: ${p}desmute @user`) }, { quoted: msg }) }
        
        const mutados = dbLer("mutados.json", {}); 
        if (mutados[jid] && mutados[jid][utils.soNumero(alvo)]) { 
          delete mutados[jid][utils.soNumero(alvo)]; 
          dbSalvar("mutados.json", mutados) 
        }
        
        await reagir(sock, msg, "🔊")
        await sock.sendMessage(jid, { text: msgSucesso("", "Usuário liberado. Pode voltar a falar.", `@${utils.soNumero(alvo)}`), mentions: [alvo] }, { quoted: msg })
      }
    },

    promover: {
      aliases: ["promote", "daradm"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; 
        let alvoRaw = utils.getAlvo(msg)
        if (alvoRaw) alvoRaw = await extrairNumeroReal(alvoRaw, groupMetadata);
        
        if (!alvoRaw) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑷𝑹𝑶𝑴𝑶𝑽𝑬𝑹", "Marque alguém.", `Uso: ${p}promover @user`) }, { quoted: msg }) }
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑬𝑴 𝑷𝑬𝑹𝑴𝑰𝑺𝑺𝑨𝑶", "Preciso ser admin.", "Promova o bot.") }, { quoted: msg }) }
        
        const n = utils.soNumero(alvoRaw)
        const part = groupMetadata.participants.find(pa => [pa.id, pa.lid, pa.phoneNumber].filter(Boolean).map(utils.soNumero).includes(n))
        
        if (!part) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑵𝑨𝑶 𝑬𝑵𝑪𝑶𝑵𝑻𝑹𝑨𝑫𝑶", "Usuário fora do grupo.", `@${n}`) }, { quoted: msg }) }
        try { await sock.groupParticipantsUpdate(jid, [part.id], "promote"); await reagir(sock, msg, "👑"); await sock.sendMessage(jid, { text: msgSucesso("", "Virou admin.", `@${n}`), mentions: [part.id] }, { quoted: msg }) } catch (e) { await reagir(sock, msg, "❌"); await sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha ao promover.", "Verifique se sou admin.") }, { quoted: msg }) }
      }
    },

    rebaixar: {
      aliases: ["demote", "tiraradm"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; 
        let alvoRaw = utils.getAlvo(msg)
        if (alvoRaw) alvoRaw = await extrairNumeroReal(alvoRaw, groupMetadata);
        
        if (!alvoRaw) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑹𝑬𝑩𝑨𝑰𝑿𝑨𝑹", "Marque alguém.", `Uso: ${p}rebaixar @user`) }, { quoted: msg }) }
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑬𝑴 𝑷𝑬𝑹𝑴𝑰𝑺𝑺𝑨𝑶", "Preciso ser admin.", "Promova o bot.") }, { quoted: msg }) }
        
        const n = utils.soNumero(alvoRaw)
        const part = groupMetadata.participants.find(pa => [pa.id, pa.lid, pa.phoneNumber].filter(Boolean).map(utils.soNumero).includes(n))
        
        if (!part) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑵𝑨𝑶 𝑬𝑵𝑪𝑶𝑵𝑻𝑹𝑨𝑫𝑶", "Usuário fora do grupo.", `@${n}`) }, { quoted: msg }) }
        try { await sock.groupParticipantsUpdate(jid, [part.id], "demote"); await reagir(sock, msg, "📉"); await sock.sendMessage(jid, { text: msgSucesso("", "Perdeu admin.", `@${n}`), mentions: [part.id] }, { quoted: msg }) } catch (e) { await reagir(sock, msg, "❌"); await sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha ao rebaixar.", "Verifique se sou admin.") }, { quoted: msg }) }
      }
    },

    ban: {
      aliases: ["kick", "remover"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, groupMetadata, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; 
        let alvoRaw = utils.getAlvo(msg)
        if (alvoRaw) alvoRaw = await extrairNumeroReal(alvoRaw, groupMetadata);
        
        if (!alvoRaw) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑩𝑨𝑵𝑰𝑹", "Marque alguém.", `Uso: ${p}ban @user`) }, { quoted: msg }) }
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑬𝑴 𝑷𝑬𝑹𝑴𝑰𝑺𝑺𝑨𝑶", "Preciso ser admin.", "Promova o bot.") }, { quoted: msg }) }
        
        const n = utils.soNumero(alvoRaw)
        const part = groupMetadata.participants.find(pa => [pa.id, pa.lid, pa.phoneNumber].filter(Boolean).map(utils.soNumero).includes(n))
        
        if (!part) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑵𝑨𝑶 𝑬𝑵𝑪𝑶𝑵𝑻𝑹𝑨𝑫𝑶", "Usuário fora do grupo.", `@${n}`) }, { quoted: msg }) }
        try { await sock.groupParticipantsUpdate(jid, [part.id], "remove"); await reagir(sock, msg, "🔨"); await sock.sendMessage(jid, { text: msgSucesso("", "Usuário removido.", `@${n}`), mentions: [part.id] }, { quoted: msg }) } catch (e) { await reagir(sock, msg, "❌"); await sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha ao remover.", "Verifique se sou admin.") }, { quoted: msg }) }
      }
    },

    adv: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils, prefixoAtivo, groupMetadata }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; 
        let alvo = utils.getAlvo(msg)
        
        if (alvo) alvo = await extrairNumeroReal(alvo, groupMetadata);

        if (!alvo) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑨𝑫𝑽𝑬𝑹𝑻𝑰𝑹", "Marque alguém.", `Uso: ${p}adv @user <motivo>`) }, { quoted: msg }) }
        
        const motivo = args.filter(a => !a.includes("@")).join(" ") || "Sem motivo"
        const advs = db.advs(); 
        advs[jid] = advs[jid] || {}; 
        advs[jid][alvo] = (advs[jid][alvo] || 0) + 1
        
        const total = advs[jid][alvo]; const n = utils.soNumero(alvo)
        
        if (total >= 3) {
          delete advs[jid][alvo]; db.salvarAdvs(advs); await reagir(sock, msg, "🔨")
          await sock.sendMessage(jid, { text: msgErro("𝑳𝑰𝑴𝑰𝑻𝑬", "3/3 atingido. Removido.", `@${n} • ${motivo}`), mentions: [alvo] }, { quoted: msg })
          try { await sock.groupParticipantsUpdate(jid, [alvo], "remove") } catch (_) {}
          return
        }
        db.salvarAdvs(advs); await reagir(sock, msg, "⚠️")
        await sock.sendMessage(jid, { text: msgAviso("", "Advertência aplicada.", `@${n} • ${total}/3`), mentions: [alvo] }, { quoted: msg })
      }
    },

    deladv: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils, prefixoAtivo, groupMetadata }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; 
        let alvo = utils.getAlvo(msg)
        
        if (alvo) alvo = await extrairNumeroReal(alvo, groupMetadata);

        if (!alvo) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑹𝑬𝑴𝑶𝑽𝑬𝑹 𝑨𝑫𝑽", "Marque alguém.", `Uso: ${p}deladv @user`) }, { quoted: msg }) }
        
        const advs = db.advs(); const atual = (advs[jid] && advs[jid][alvo]) || 0
        if (atual <= 0) { await reagir(sock, msg, "ℹ️"); return sock.sendMessage(jid, { text: msgSucesso("", "Sem advertências.", `@${utils.soNumero(alvo)}`), mentions: [alvo] }, { quoted: msg }) }
        
        advs[jid][alvo] = atual - 1; if (advs[jid][alvo] === 0) delete advs[jid][alvo]
        db.salvarAdvs(advs); await reagir(sock, msg, "✅")
        await sock.sendMessage(jid, { text: msgSucesso("", "Advertência removida.", `@${utils.soNumero(alvo)} • ${(advs[jid] && advs[jid][alvo]) || 0}/3`), mentions: [alvo] }, { quoted: msg })
      }
    },

    listaadv: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const entradas = Object.entries(db.advs()[jid] || {})
        if (!entradas.length) { await reagir(sock, msg, "📋"); return sock.sendMessage(jid, { text: msgAviso("𝑳𝑰𝑺𝑻𝑨 𝑽𝑨𝒁𝑰𝑨", "Sem advertências.", "Use o comando adv.") }, { quoted: msg }) }
        
        entradas.sort((a, b) => b[1] - a[1])
        let t = `📋 *𝑨𝑫𝑽𝑬𝑹𝑻𝑬̂𝑵𝑪𝑰𝑨𝑺*\n\n`
        entradas.forEach(([j, q], i) => { t += `${i + 1}. @${utils.soNumero(j)} — ${q}/3\n` })
        
        await reagir(sock, msg, "📋")
        await sock.sendMessage(jid, { text: t, mentions: entradas.map(e => e[0]) }, { quoted: msg })
      }
    },

    totag: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, groupMetadata, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; let texto = args.join(" ").trim()
        if (!texto) {
          const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
          const q = ctx.quotedMessage
          if (q) texto = q.conversation || (q.extendedTextMessage && q.extendedTextMessage.text) || (q.imageMessage && q.imageMessage.caption) || ""
        }
        if (!texto) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑻𝑶𝑻𝑨𝑮", "Informe o texto.", `Uso: ${p}totag <texto>`) }, { quoted: msg }) }
        const mentions = groupMetadata.participants.map(pa => pa.id)
        await reagir(sock, msg, "📢")
        await sock.sendMessage(jid, { text: texto, mentions }, { quoted: msg })
      }
    },

    antilink: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑨𝑵𝑻𝑰𝑳𝑰𝑵𝑲", "Use on/off.", `${p}antilink on/off`) }, { quoted: msg }) }
        const cfg = dbLer("admsettings.json", {}); cfg[jid] = cfg[jid] || {}; cfg[jid].antilink = opcao === "on"; dbSalvar("admsettings.json", cfg)
        await reagir(sock, msg, opcao === "on" ? "🛡️" : "🗑️")
        await sock.sendMessage(jid, { text: opcao === "on" ? msgSucesso("", "Antilink ativado.", "Exceção: links de grupo.") : msgAviso("𝑨𝑵𝑻𝑰𝑳𝑰𝑵𝑲", "Desativado.") }, { quoted: msg })
      }
    },

    antiaudio: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑨𝑵𝑻𝑰𝑨𝑼𝑫𝑰𝑶", "Use on/off.", `${p}antiaudio on/off`) }, { quoted: msg }) }
        const cfg = dbLer("admsettings.json", {}); cfg[jid] = cfg[jid] || {}; cfg[jid].antiaudio = opcao === "on"; dbSalvar("admsettings.json", cfg)
        await reagir(sock, msg, opcao === "on" ? "🛡️" : "🗑️")
        await sock.sendMessage(jid, { text: opcao === "on" ? msgSucesso("", "Antiaudio ativado.") : msgAviso("𝑨𝑵𝑻𝑰𝑨𝑼𝑫𝑰𝑶", "Desativado.") }, { quoted: msg })
      }
    },

    antivideo: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑨𝑵𝑻𝑰𝑽𝑰𝑫𝑬𝑶", "Use on/off.", `${p}antivideo on/off`) }, { quoted: msg }) }
        const cfg = dbLer("admsettings.json", {}); cfg[jid] = cfg[jid] || {}; cfg[jid].antivideo = opcao === "on"; dbSalvar("admsettings.json", cfg)
        await reagir(sock, msg, opcao === "on" ? "🛡️" : "🗑️")
        await sock.sendMessage(jid, { text: opcao === "on" ? msgSucesso("", "Antivideo ativado.") : msgAviso("𝑨𝑵𝑻𝑰𝑽𝑰𝑫𝑬𝑶", "Desativado.") }, { quoted: msg })
      }
    },

    antifoto: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑨𝑵𝑻𝑰𝑭𝑶𝑻𝑶", "Use on/off.", `${p}antifoto on/off`) }, { quoted: msg }) }
        const cfg = dbLer("admsettings.json", {}); cfg[jid] = cfg[jid] || {}; cfg[jid].antifoto = opcao === "on"; dbSalvar("admsettings.json", cfg)
        await reagir(sock, msg, opcao === "on" ? "🛡️" : "🗑️")
        await sock.sendMessage(jid, { text: opcao === "on" ? msgSucesso("", "Antifoto ativado.") : msgAviso("𝑨𝑵𝑻𝑰𝑭𝑶𝑻𝑶", "Desativado.") }, { quoted: msg })
      }
    },

    antifig: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑨𝑵𝑻𝑰𝑭𝑰𝑮", "Use on/off.", `${p}antifig on/off`) }, { quoted: msg }) }
        const cfg = dbLer("admsettings.json", {}); cfg[jid] = cfg[jid] || {}; cfg[jid].antisticker = opcao === "on"; dbSalvar("admsettings.json", cfg)
        await reagir(sock, msg, opcao === "on" ? "🛡️" : "🗑️")
        await sock.sendMessage(jid, { text: opcao === "on" ? msgSucesso("", "Antifig ativado.") : msgAviso("𝑨𝑵𝑻𝑰𝑭𝑰𝑮", "Desativado.") }, { quoted: msg })
      }
    },

    palavrao: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑷𝑨𝑳𝑨𝑽𝑹𝑨𝑶", "Use on/off.", `${p}palavrao on/off`) }, { quoted: msg }) }
        const cfg = dbLer("admsettings.json", {}); cfg[jid] = cfg[jid] || {}; cfg[jid].antipalavrao = opcao === "on"; dbSalvar("admsettings.json", cfg)
        await reagir(sock, msg, opcao === "on" ? "🛡️" : "🗑️")
        await sock.sendMessage(jid, { text: opcao === "on" ? msgSucesso("", "Filtro ativado.") : msgAviso("𝑷𝑨𝑳𝑨𝑽𝑹𝑨𝑶", "Desativado.") }, { quoted: msg })
      }
    },

    addpalavra: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; const palavra = args.join(" ").trim().toLowerCase()
        if (!palavra) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑨𝑫𝑰𝑪𝑰𝑶𝑵𝑨𝑹", "Informe a palavra.", `${p}addpalavra <p>`) }, { quoted: msg }) }
        const pal = dbLer("palavroes.json", {}); pal[jid] = pal[jid] || []
        if (pal[jid].includes(palavra)) { await reagir(sock, msg, "ℹ️"); return sock.sendMessage(jid, { text: msgAviso("𝑱𝑨 𝑬𝑿𝑰𝑺𝑻𝑬", "Palavra na lista.", palavra) }, { quoted: msg }) }
        pal[jid].push(palavra); dbSalvar("palavroes.json", pal); await reagir(sock, msg, "✅")
        await sock.sendMessage(jid, { text: msgSucesso("", "Palavra adicionada.", palavra) }, { quoted: msg })
      }
    },

    rmpalavra: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; const palavra = args.join(" ").trim().toLowerCase()
        if (!palavra) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑹𝑬𝑴𝑶𝑽𝑬𝑹", "Informe a palavra.", `${p}rmpalavra <p>`) }, { quoted: msg }) }
        const pal = dbLer("palavroes.json", {}); const arr = pal[jid] || []; const idx = arr.indexOf(palavra)
        if (idx === -1) { await reagir(sock, msg, "ℹ️"); return sock.sendMessage(jid, { text: msgAviso("𝑵𝑨𝑶 𝑬𝑵𝑪𝑶𝑵𝑻𝑹𝑨𝑫𝑨", "Palavra fora da lista.", palavra) }, { quoted: msg }) }
        arr.splice(idx, 1); pal[jid] = arr; dbSalvar("palavroes.json", pal); await reagir(sock, msg, "🗑️")
        await sock.sendMessage(jid, { text: msgSucesso("", "Palavra removida.", palavra) }, { quoted: msg })
      }
    },

    listapalavra: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"
        const lista = dbLer("palavroes.json", {})[jid] || []
        if (!lista.length) { await reagir(sock, msg, "📋"); return sock.sendMessage(jid, { text: msgAviso("𝑳𝑰𝑺𝑻𝑨 𝑽𝑨𝒁𝑰𝑨", "Nenhuma palavra.", `${p}addpalavra`) }, { quoted: msg }) }
        let t = `📋 *𝑷𝑨𝑳𝑨𝑽𝑹𝑨𝑺*\n\n`
        lista.forEach((pal, i) => { t += `${i + 1}. ${pal}\n` })
        await reagir(sock, msg, "📋"); await sock.sendMessage(jid, { text: t }, { quoted: msg })
      }
    },

    soadm: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑺𝑶 𝑨𝑫𝑴", "Use on/off.", `${p}soadm on/off`) }, { quoted: msg }) }
        const cfg = dbLer("admsettings.json", {}); cfg[jid] = cfg[jid] || {}; cfg[jid].soadm = opcao === "on"; dbSalvar("admsettings.json", cfg)
        await reagir(sock, msg, opcao === "on" ? "⚙️" : "🗑️")
        await sock.sendMessage(jid, { text: opcao === "on" ? msgSucesso("", "SoAdm ativado.") : msgAviso("𝑺𝑶 𝑨𝑫𝑴", "Desativado.") }, { quoted: msg })
      }
    },

    multiprefixo: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑴𝑼𝑳𝑻𝑰𝑷𝑹𝑬𝑭𝑰𝑿𝑶", "Use on/off.", `${p}multiprefixo on/off`) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].multiprefixo = opcao === "on"; db.salvarGrupos(g); await reagir(sock, msg, opcao === "on" ? "⚙️" : "🗑️")
        await sock.sendMessage(jid, { text: opcao === "on" ? msgSucesso("", "Multiprefixo ativado.") : msgAviso("𝑴𝑼𝑳𝑻𝑰𝑷𝑹𝑬𝑭𝑰𝑿𝑶", "Desativado.") }, { quoted: msg })
      }
    },

    setprefixo: {
      aliases: ["setprefix", "trocarp"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"
        const g = db.grupos(); const conf = g[jid] || {}
        if (!conf.multiprefixo) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑴𝑼𝑳𝑻𝑰𝑷𝑹𝑬𝑭𝑰𝑿𝑶 𝑶𝑭𝑭", "Ative primeiro.", `${p}multiprefixo on`) }, { quoted: msg }) }
        const novo = args[0]
        if (!novo) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑺𝑬𝑻𝑷𝑹𝑬𝑭𝑰𝑿𝑶", "Informe o prefixo.", `${p}setprefixo <s>`) }, { quoted: msg }) }
        if (novo.length > 3) { await reagir(sock, msg, "❌"); return sock.sendMessage(jid, { text: msgErro("𝑳𝑶𝑵𝑮𝑶", "Máximo 3 caracteres.", novo) }, { quoted: msg }) }
        g[jid].prefixo = novo; db.salvarGrupos(g); await reagir(sock, msg, "⚙️")
        await sock.sendMessage(jid, { text: msgSucesso("", "Prefixo alterado.", novo) }, { quoted: msg })
      }
    },

    x9: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑿9", "Use on/off.", `${p}x9 on/off`) }, { quoted: msg }) }
        const cfg = dbLer("admsettings.json", {}); cfg[jid] = cfg[jid] || {}; cfg[jid].x9 = opcao === "on"; dbSalvar("admsettings.json", cfg)
        await reagir(sock, msg, opcao === "on" ? "👁️" : "🗑️")
        await sock.sendMessage(jid, { text: opcao === "on" ? msgSucesso("", "X9 ativado.") : msgAviso("𝑿9", "Desativado.") }, { quoted: msg })
      }
    },

    listanegra: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, groupMetadata, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; const numero = (args[0] || "").replace(/\D/g, "")
        if (!numero || numero.length < 8) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑳𝑰𝑺𝑻𝑨 𝑵𝑬𝑮𝑹𝑨", "Informe o número.", `${p}listanegra <núm>`) }, { quoted: msg }) }
        const lista = dbLer("blacklist.json", {}); lista[jid] = lista[jid] || []
        if (lista[jid].includes(numero)) { await reagir(sock, msg, "ℹ️"); return sock.sendMessage(jid, { text: msgAviso("𝑱𝑨 𝑵𝑨 𝑳𝑰𝑺𝑻𝑨", "Número já marcado.", `+${numero}`) }, { quoted: msg }) }
        lista[jid].push(numero); dbSalvar("blacklist.json", lista); await reagir(sock, msg, "⛔")
        await sock.sendMessage(jid, { text: msgSucesso("", "Marcado na lista negra.", `+${numero}`) }, { quoted: msg })
        try {
          const part = groupMetadata && groupMetadata.participants.find(pa => [pa.id, pa.lid, pa.phoneNumber].filter(Boolean).map(utils.soNumero).includes(numero))
          if (part) { await sock.groupParticipantsUpdate(jid, [part.id], "remove"); await sock.sendMessage(jid, { text: msgSucesso("", "Removido automaticamente.", `@${numero}`), mentions: [part.id] }) }
        } catch (_) {}
      }
    },

    blacklist: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"
        const lista = dbLer("blacklist.json", {})[jid] || []
        if (!lista.length) { await reagir(sock, msg, "📋"); return sock.sendMessage(jid, { text: msgAviso("𝑳𝑰𝑺𝑻𝑨 𝑽𝑨𝒁𝑰𝑨", "Sem números.", `${p}listanegra`) }, { quoted: msg }) }
        let t = `📋 *𝑩𝑳𝑨𝑪𝑲𝑳𝑰𝑺𝑻*\n\n`
        lista.forEach((n, i) => { t += `${i + 1}. +${n}\n` })
        await reagir(sock, msg, "📋"); await sock.sendMessage(jid, { text: t }, { quoted: msg })
      }
    },

    dellista: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; const numero = (args[0] || "").replace(/\D/g, "")
        if (!numero) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑫𝑬𝑳𝑳𝑰𝑺𝑻𝑨", "Informe o número.", `${p}dellista <núm>`) }, { quoted: msg }) }
        const lista = dbLer("blacklist.json", {}); const arr = lista[jid] || []; const idx = arr.indexOf(numero)
        if (idx === -1) { await reagir(sock, msg, "ℹ️"); return sock.sendMessage(jid, { text: msgAviso("𝑵𝑨𝑶 𝑬𝑵𝑪𝑶𝑵𝑻𝑹𝑨𝑫𝑶", "Número fora da lista.", `+${numero}`) }, { quoted: msg }) }
        arr.splice(idx, 1); lista[jid] = arr; dbSalvar("blacklist.json", lista); await reagir(sock, msg, "🗑️")
        await sock.sendMessage(jid, { text: msgSucesso("", "Removido da lista.", `+${numero}`) }, { quoted: msg })
      }
    },

    bemvindo: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑩𝑬𝑴-𝑽𝑰𝑵𝑫𝑶", "Use on/off.", `${p}bemvindo on/off`) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].bemvindo = opcao === "on"; db.salvarGrupos(g); await reagir(sock, msg, opcao === "on" ? "🎉" : "🗑️")
        await sock.sendMessage(jid, { text: opcao === "on" ? msgSucesso("", "Boas-vindas ativado.") : msgAviso("𝑩𝑬𝑴-𝑽𝑰𝑵𝑫𝑶", "Desativado.") }, { quoted: msg })
      }
    },

    textobv: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; const t = args.join(" ").trim()
        if (!t) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑻𝑬𝑿𝑻𝑶", "Informe o texto.", `${p}textobv <txt> (%nmr%)`) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].textobv = t; db.salvarGrupos(g); await reagir(sock, msg, "✅")
        await sock.sendMessage(jid, { text: msgSucesso("", "Texto salvo.", t) }, { quoted: msg })
      }
    },

    fundobv: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const quoted = ctx.quotedMessage
        const tem = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage)
        if (!tem) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑭𝑼𝑵𝑫𝑶", "Responda uma imagem.", `${p}fundobv (reply)`) }, { quoted: msg }) }
        const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage } })
        const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].fundobv = buffer.toString("base64"); db.salvarGrupos(g); await reagir(sock, msg, "✅")
        await sock.sendMessage(jid, { image: buffer, caption: msgSucesso("", "Fundo salvo.") }, { quoted: msg })
      }
    },

    legendasaiu: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; const t = args.join(" ").trim()
        if (!t) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑳𝑬𝑮𝑬𝑵𝑫𝑨", "Informe o texto.", `${p}legendasaiu <txt> (%nmr%)`) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].legendasaiu = t; db.salvarGrupos(g); await reagir(sock, msg, "✅")
        await sock.sendMessage(jid, { text: msgSucesso("", "Legenda salva.", t) }, { quoted: msg })
      }
    },

    fundosaiu: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const quoted = ctx.quotedMessage
        const tem = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage)
        if (!tem) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑭𝑼𝑵𝑫𝑶", "Responda uma imagem.", `${p}fundosaiu (reply)`) }, { quoted: msg }) }
        const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage } })
        const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].fundosaiu = buffer.toString("base64"); db.salvarGrupos(g); await reagir(sock, msg, "✅")
        await sock.sendMessage(jid, { image: buffer, caption: msgSucesso("", "Fundo de saída salvo.") }, { quoted: msg })
      }
    },

    verbv: {
      aliases: ["testebv", "verbemvindo"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const nomeBot = nomeBotDb(db)
        const g = db.grupos(); const conf = g[jid] || {}
        const meta = await sock.groupMetadata(jid).catch(() => null)
        const nomeGrupo = meta?.subject || "o grupo"
        const numTeste = "5511999999999"
        const textoPadrao = `Bem-vindo(a) ao grupo, @${numTeste}!\n\nLeia as regras.`
        const textoFinal = (conf.textobv && conf.textobv.trim()) ? conf.textobv.replace(/%nmr%/g, '@' + numTeste).replace(/%grupo%/g, nomeGrupo) : textoPadrao
        await reagir(sock, msg, "🎉")
        try {
          const cab = `✨ *𝑻𝑬𝑺𝑻𝑬 𝑩𝑬𝑴-𝑽𝑰𝑵𝑫𝑶*\n\n`
          if (conf.fundobv) { const buf = Buffer.from(conf.fundobv, 'base64'); await sock.sendMessage(jid, { image: buf, caption: cab + textoFinal }, { quoted: msg }) }
          else { await sock.sendMessage(jid, { text: cab + textoFinal }, { quoted: msg }) }
        } catch (e) { await sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha no teste.") }, { quoted: msg }) }
      }
    },

    abrirgp: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils, groupMetadata, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑬𝑴 𝑷𝑬𝑹𝑴𝑰𝑺𝑺𝑨𝑶", "Preciso ser admin.", "Promova o bot.") }, { quoted: msg }) }
        const hora = args[0]
        if (!hora || !/^\d{1,2}:\d{2}$/.test(hora)) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑨𝑩𝑹𝑰𝑹𝑮𝑷", "Informe o horário.", `${p}abrirgp hh:mm`) }, { quoted: msg }) }
        const [h, m] = hora.split(":").map(Number); const fmt = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0")
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].abrirHora = fmt; g[jid].ultimoAbrir = null; db.salvarGrupos(g); await reagir(sock, msg, "⏰")
        await sock.sendMessage(jid, { text: msgSucesso("", "Abertura agendada.", fmt) }, { quoted: msg })
      }
    },

    fechargp: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils, groupMetadata, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"
        if (!utils.botEhAdmin(groupMetadata, sock)) { await reagir(sock, msg, "🚫"); return sock.sendMessage(jid, { text: msgErro("𝑺𝑬𝑴 𝑷𝑬𝑹𝑴𝑰𝑺𝑺𝑨𝑶", "Preciso ser admin.", "Promova o bot.") }, { quoted: msg }) }
        const hora = args[0]
        if (!hora || !/^\d{1,2}:\d{2}$/.test(hora)) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑭𝑬𝑪𝑯𝑨𝑹𝑮𝑷", "Informe o horário.", `${p}fechargp hh:mm`) }, { quoted: msg }) }
        const [h, m] = hora.split(":").map(Number); const fmt = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0")
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].fecharHora = fmt; g[jid].ultimoFechar = null; db.salvarGrupos(g); await reagir(sock, msg, "⏰")
        await sock.sendMessage(jid, { text: msgSucesso("", "Fechamento agendado.", fmt) }, { quoted: msg })
      }
    },

    fotoabrir: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const quoted = ctx.quotedMessage
        const tem = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage)
        const legenda = (args.join(" ").trim()) || (quoted && quoted.imageMessage && quoted.imageMessage.caption) || null
        const g = db.grupos(); g[jid] = g[jid] || {}
        if (tem) {
          const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage } })
          const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          g[jid].fotoAbrir = buffer.toString("base64"); if (legenda) g[jid].legendaAbrir = legenda
          db.salvarGrupos(g); await reagir(sock, msg, "✅")
          return sock.sendMessage(jid, { image: buffer, caption: msgSucesso("", "Foto de abertura salva.") }, { quoted: msg })
        }
        if (legenda) { g[jid].legendaAbrir = legenda; db.salvarGrupos(g); await reagir(sock, msg, "✅"); return sock.sendMessage(jid, { text: msgSucesso("", "Legenda salva.", legenda) }, { quoted: msg }) }
        await reagir(sock, msg, "⚠️")
        return sock.sendMessage(jid, { text: msgAviso("𝑭𝑶𝑻𝑶", "Responda uma imagem.", `${p}fotoabrir (reply)`) }, { quoted: msg })
      }
    },

    fotofechar: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const quoted = ctx.quotedMessage
        const tem = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage)
        const legenda = (args.join(" ").trim()) || (quoted && quoted.imageMessage && quoted.imageMessage.caption) || null
        const g = db.grupos(); g[jid] = g[jid] || {}
        if (tem) {
          const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage } })
          const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          g[jid].fotoFechar = buffer.toString("base64"); if (legenda) g[jid].legendaFechar = legenda
          db.salvarGrupos(g); await reagir(sock, msg, "✅")
          return sock.sendMessage(jid, { image: buffer, caption: msgSucesso("", "Foto de fechamento salva.") }, { quoted: msg })
        }
        if (legenda) { g[jid].legendaFechar = legenda; db.salvarGrupos(g); await reagir(sock, msg, "✅"); return sock.sendMessage(jid, { text: msgSucesso("", "Legenda salva.", legenda) }, { quoted: msg }) }
        await reagir(sock, msg, "⚠️")
        return sock.sendMessage(jid, { text: msgAviso("𝑭𝑶𝑻𝑶", "Responda uma imagem.", `${p}fotofechar (reply)`) }, { quoted: msg })
      }
    },

    legendaabrir: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; let t = args.join(" ").trim()
        if (!t) {
          const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
          const q = ctx.quotedMessage
          if (q) t = q.conversation || (q.extendedTextMessage && q.extendedTextMessage.text) || (q.imageMessage && q.imageMessage.caption) || ""
        }
        if (!t) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑳𝑬𝑮𝑬𝑵𝑫𝑨", "Informe o texto.", `${p}legendaabrir <txt>`) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].legendaAbrir = t; db.salvarGrupos(g); await reagir(sock, msg, "✅")
        await sock.sendMessage(jid, { text: msgSucesso("", "Legenda salva.", t) }, { quoted: msg })
      }
    },

    legendafechar: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, db, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; let t = args.join(" ").trim()
        if (!t) {
          const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
          const q = ctx.quotedMessage
          if (q) t = q.conversation || (q.extendedTextMessage && q.extendedTextMessage.text) || (q.imageMessage && q.imageMessage.caption) || ""
        }
        if (!t) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑳𝑬𝑮𝑬𝑵𝑫𝑨", "Informe o texto.", `${p}legendafechar <txt>`) }, { quoted: msg }) }
        const g = db.grupos(); g[jid] = g[jid] || {}; g[jid].legendaFechar = t; db.salvarGrupos(g); await reagir(sock, msg, "✅")
        await sock.sendMessage(jid, { text: msgSucesso("", "Legenda salva.", t) }, { quoted: msg })
      }
    },

    limparfotos: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid; const g = db.grupos(); g[jid] = g[jid] || {}
        delete g[jid].fotoAbrir; delete g[jid].fotoFechar; delete g[jid].legendaAbrir; delete g[jid].legendaFechar
        db.salvarGrupos(g); await reagir(sock, msg, "🗑️")
        await sock.sendMessage(jid, { text: msgSucesso("", "Fotos e legendas removidas.", "Tudo limpo") }, { quoted: msg })
      }
    },

    modoparceria: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args }) {
        const jid = msg.key.remoteJid
        const parcerias = dbLer("parcerias.json", {}); parcerias[jid] = parcerias[jid] || { ativo: false, parceiros: {} }
        const sub = (args[0] || "").toLowerCase()
        if (sub === "on") parcerias[jid].ativo = true
        else if (sub === "off") parcerias[jid].ativo = false
        else parcerias[jid].ativo = !parcerias[jid].ativo
        dbSalvar("parcerias.json", parcerias); await reagir(sock, msg, parcerias[jid].ativo ? "🤝" : "🗑️")
        await sock.sendMessage(jid, { text: parcerias[jid].ativo
          ? msgSucesso("𝑷𝑨𝑹𝑪𝑬𝑹𝑰𝑨", "Modo Parceria Ativado.", "Não-parceiros terão links apagados.")
          : msgAviso("𝑷𝑨𝑹𝑪𝑬𝑹𝑰𝑨", "Modo Parceria Desativado.", "Links liberados.") }, { quoted: msg })
      }
    },

    addparceria: {
      adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, prefixoAtivo, utils, groupMetadata }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "+"
        
        let alvo = utils.getAlvo(msg)
        if (alvo) alvo = await extrairNumeroReal(alvo, groupMetadata);

        if (!alvo) { 
          await reagir(sock, msg, "⚠️"); 
          return sock.sendMessage(jid, { text: msgAviso("𝑨𝑫𝑰𝑪𝑰𝑶𝑵𝑨𝑹 𝑷𝑨𝑹𝑪𝑬𝑰𝑹𝑶", "Marque alguém de verdade no grupo.", `Uso: ${p}addparceria @user <qtd>`) }, { quoted: msg }) 
        }

        const numAlvo = utils.soNumero(alvo)
        if (!numAlvo || numAlvo.length < 8) { 
          await reagir(sock, msg, "❌"); 
          return sock.sendMessage(jid, { text: msgErro("𝑵𝑼𝑴𝑬𝑹𝑶 𝑰𝑵𝑽𝑨𝑳𝑰𝑫𝑶", "Não foi possível identificar o número.", `O ID recebido foi: ${alvo}`) }, { quoted: msg }) 
        }

        let qtd = 5
        const textoPuro = utils.getTexto(msg).replace(/[^0-9 ]/g, ' ').split(' ')
        const nums = textoPuro.filter(n => n.length > 0 && n.length < 4)
        if (nums.length) {
          const n = parseInt(nums[nums.length - 1])
          if (n > 0 && n <= 999) qtd = n
        }

        const parcerias = dbLer("parcerias.json", {})
        parcerias[jid] = parcerias[jid] || { ativo: true, parceiros: {} }
        
        const jidSalvar = numAlvo + "@s.whatsapp.net"
        parcerias[jid].parceiros[jidSalvar] = { total: qtd, usados: 0, desde: Date.now() }
        dbSalvar("parcerias.json", parcerias)

        await reagir(sock, msg, "🤝")
        await sock.sendMessage(jid, { 
          text: msgSucesso("𝑷𝑨𝑹𝑪𝑬𝑰𝑹𝑶 𝑨𝑫𝑰𝑪𝑰𝑶𝑵𝑨𝑫𝑶", "Pode enviar links de grupo.", `@${numAlvo}\nLimite: ${qtd} links`), 
          mentions: [jidSalvar] 
        }, { quoted: msg })
      }
    },

    delparceria: {
      aliases: ["rmparceria"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, utils, groupMetadata }) {
        const jid = msg.key.remoteJid; 
        
        let alvo = utils.getAlvo(msg)
        if (alvo) alvo = await extrairNumeroReal(alvo, groupMetadata);

        if (!alvo) { await reagir(sock, msg, "⚠️"); return }
        
        const numAlvo = utils.soNumero(alvo);
        const jidSalvar = numAlvo + "@s.whatsapp.net";

        const parcerias = dbLer("parcerias.json", {})
        if (parcerias[jid] && parcerias[jid].parceiros && parcerias[jid].parceiros[jidSalvar]) {
          delete parcerias[jid].parceiros[jidSalvar]; dbSalvar("parcerias.json", parcerias)
          await reagir(sock, msg, "🗑️")
          await sock.sendMessage(jid, { text: msgSucesso("", "Parceiro removido.", `@${numAlvo}`), mentions: [jidSalvar] }, { quoted: msg })
        } else { await reagir(sock, msg, "ℹ️") }
      }
    },

    parcerias: {
      aliases: ["listaparceiros"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, utils }) {
        const jid = msg.key.remoteJid
        const parcerias = dbLer("parcerias.json", {}); const lista = Object.entries(parcerias[jid]?.parceiros || {})
        if (!lista.length) { await reagir(sock, msg, "📋"); return sock.sendMessage(jid, { text: msgAviso("𝑷𝑨𝑹𝑪𝑬𝑹𝑰𝑨𝑺", "Nenhum parceiro.", "Adicione com addparceria") }, { quoted: msg }) }
        let txt = `📋 *𝑷𝑨𝑹𝑪𝑬𝑹𝑰𝑨𝑺*\n\n`; const mentions = []
        lista.forEach(([jidP, info], i) => { txt += `${i + 1}. @${utils.soNumero(jidP)} — ${info.usados}/${info.total} links\n`; mentions.push(jidP) })
        await reagir(sock, msg, "📋"); await sock.sendMessage(jid, { text: txt, mentions }, { quoted: msg })
      }
    },

    rgfig: {
      aliases: ["registrarfig", "addfigcmd"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, args, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"; const comando = (args[0] || "").toLowerCase()
        if (!comando) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑹𝑬𝑮𝑰𝑺𝑻𝑹𝑨𝑹", "Informe o comando.", `${p}rgfig <comando> (reply)`) }, { quoted: msg }) }
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const quoted = ctx.quotedMessage
        const temFig = (msg.message && msg.message.stickerMessage) || (quoted && quoted.stickerMessage)
        if (!temFig) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑭𝑰𝑮𝑼𝑹𝑰𝑵𝑯𝑨", "Responda uma figurinha.", `${p}rgfig <comando>`) }, { quoted: msg }) }
        try {
          const alvoMsg = (msg.message && msg.message.stickerMessage) ? msg : { key: msg.key, message: quoted }
          const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          const hash = crypto.createHash("md5").update(buffer).digest("hex")
          const dbFig = dbLer("figcmd.json", {}); dbFig[jid] = dbFig[jid] || {}
          dbFig[jid][hash] = { comando, criadoPor: utils.soNumero(msg.key.participant), data: Date.now() }
          dbSalvar("figcmd.json", dbFig)
          await reagir(sock, msg, "🖼️")
          await sock.sendMessage(jid, { text: msgSucesso("", "Comando vinculado.", `${p}${comando}`) }, { quoted: msg })
        } catch (e) { await reagir(sock, msg, "❌"); await sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha ao salvar.") }, { quoted: msg }) }
      }
    },

    rmfig: {
      aliases: ["removerfigcmd", "delfigcmd"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, utils, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const quoted = ctx.quotedMessage
        const temFig = (msg.message && msg.message.stickerMessage) || (quoted && quoted.stickerMessage)
        if (!temFig) { await reagir(sock, msg, "⚠️"); return sock.sendMessage(jid, { text: msgAviso("𝑹𝑬𝑴𝑶𝑽𝑬𝑹", "Responda a figurinha.", `${p}rmfig (reply)`) }, { quoted: msg }) }
        try {
          const alvoMsg = (msg.message && msg.message.stickerMessage) ? msg : { key: msg.key, message: quoted }
          const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          const hash = crypto.createHash("md5").update(buffer).digest("hex")
          const dbFig = dbLer("figcmd.json", {})
          if (dbFig[jid] && dbFig[jid][hash]) {
            delete dbFig[jid][hash]; dbSalvar("figcmd.json", dbFig); await reagir(sock, msg, "🗑️")
            await sock.sendMessage(jid, { text: msgSucesso("", "Comando desvinculado.") }, { quoted: msg })
          } else {
            await reagir(sock, msg, "ℹ️")
            await sock.sendMessage(jid, { text: msgAviso("𝑵𝑨𝑶 𝑬𝑵𝑪𝑶𝑵𝑻𝑹𝑨𝑫𝑨", "Figurinha sem comando.") }, { quoted: msg })
          }
        } catch (e) { await reagir(sock, msg, "❌"); await sock.sendMessage(jid, { text: msgErro("𝑬𝑹𝑹𝑶", "Falha ao remover.") }, { quoted: msg }) }
      }
    },

    listafig: {
      aliases: ["figs", "listafiguras", "figcomandos"], adminOnly: true, grupoOnly: true,
      async executar({ sock, msg, prefixoAtivo }) {
        const jid = msg.key.remoteJid; const p = prefixoAtivo || "+"
        const dbFig = dbLer("figcmd.json", {}); const grupo = dbFig[jid] || {}; const total = Object.keys(grupo).length
        if (!total) { await reagir(sock, msg, "📋"); return sock.sendMessage(jid, { text: msgAviso("𝑳𝑰𝑺𝑻𝑨 𝑽𝑨𝒁𝑰𝑨", "Nenhuma figurinha.", `${p}rgfig <cmd>`) }, { quoted: msg }) }
        let txt = `📋 *𝑭𝑰𝑮𝑼𝑹𝑰𝑵𝑯𝑨𝑺*\n\n`
        for (const [, info] of Object.entries(grupo)) { txt += `${p}${info.comando}\n` }
        await reagir(sock, msg, "📋"); await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    }

  }
}