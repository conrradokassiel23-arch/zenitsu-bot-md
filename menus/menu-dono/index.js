/* ============================================================
   🟣 MENU DONO - RIMURU BOT MD
   ============================================================ */

const fs = require("fs")
const path = require("path")
const os = require("os")
const { execSync } = require("child_process")

const DATA_DIR = path.join(__dirname, "..", "..", "data")
const REPO_URL = "https://github.com/conrradokassiel23-arch/zenitsu-bot-md"
const REPO_API = "https://api.github.com/repos/conrradokassiel23-arch/zenitsu-bot-md/commits/main"
const REPO_COMMITS = "https://api.github.com/repos/conrradokassiel23-arch/zenitsu-bot-md/commits?per_page=15"
const BOT_DIR = path.join(__dirname, "..", "..")

function dbLer(a, p = {}) {
  const f = path.join(DATA_DIR, a)
  if (!fs.existsSync(f)) { fs.writeFileSync(f, JSON.stringify(p, null, 2)); return p }
  try { return JSON.parse(fs.readFileSync(f, "utf8")) } catch { return p }
}
function dbSalvar(a, d) {
  fs.writeFileSync(path.join(DATA_DIR, a), JSON.stringify(d, null, 2))
}

function formatarDataHora(iso) {
  try {
    return new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })
  } catch (e) { return "?" }
}

function categorizarCommit(msg) {
  const m = String(msg || "").toLowerCase()
  if (m.includes("add") || m.includes("novo") || m.includes("new") || m.includes("cria") || m.includes("feat")) return { emoji: "✨", tipo: "Novo comando/sistema" }
  if (m.includes("fix") || m.includes("corrig") || m.includes("bug") || m.includes("arrum")) return { emoji: "🔧", tipo: "Correção" }
  if (m.includes("remove") || m.includes("delet") || m.includes("remov")) return { emoji: "🗑️", tipo: "Removido" }
  if (m.includes("update") || m.includes("atualiz") || m.includes("melhor") || m.includes("improve")) return { emoji: "⚡", tipo: "Melhoria" }
  return { emoji: "🔹", tipo: "Mudança" }
}

function lineEmoji(emoji, label, valor) {
  return `${emoji} ${label}:\n╰➜ ${valor}`
}

function nomeBotDb(db) {
  try { return db.config().nomeBot || "Rimuru Bot" } catch { return "Rimuru Bot" }
}

function extrairComandosDaMsg(mensagem) {
  if (!mensagem) return []
  const encontrados = []
  const padroes = [/\b(?:add|adicionado|adiciona|novo|nova|criado|criada|feat|feature|comando[s]?[:\s]+)\s*[:\-]?\s*(.+)/gi]
  let trecho = ""
  for (const re of padroes) { let m; while ((m = re.exec(mensagem)) !== null) { trecho += " " + m[1] } }
  if (!trecho) return []
  const bruto = trecho.replace(/[\(\)\[\]\{\}\.,;!?"']/g, " ").replace(/\s+/g, " ").split(/[\s,e\+]+/i).map(s => s.trim().toLowerCase()).filter(Boolean)
  const blacklist = ["o", "a", "os", "as", "um", "uma", "de", "do", "da", "dos", "das", "e", "ou", "para", "com", "sem", "no", "na", "em", "por", "comando", "comandos", "novo", "nova", "novos", "novas", "add", "adicionado", "adiciona", "criado", "criada", "feat", "feature", "fix", "bug", "corrigido", "correcao", "sistema", "sistemas", "funcao", "funcoes", "arquivo", "arquivos"]
  for (const p of bruto) {
    if (blacklist.includes(p)) continue
    if (p.length < 3) continue
    if (p.length > 30) continue
    if (!/^[a-z][a-z0-9_-]*$/.test(p)) continue
    if (!encontrados.includes(p)) encontrados.push(p)
  }
  return encontrados.slice(0, 10)
}

module.exports = {
  menu: "menu-dono",
  grupoOnly: false,
  adminOnly: false,
  donoOnly: true,

  commands: {
    menudono: {
      aliases: ["dono", "comandosdono", "menud", "imperador", "grandesabio"],
      async executar({ sock, msg, prefixoAtivo, db, sender }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo || "!"
        const cfg = db.config() || {}
        const numUser = String(sender || "").split("@")[0].split(":")[0].replace(/\D/g, "")
        const pushName = msg.pushName || "Mestre"
        const agora = new Date()
        const hora = agora.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" })
        const data = agora.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
        const h = agora.getHours()
        let saudacao = "Boa noite"
        if (h >= 5 && h < 12) saudacao = "Bom dia"
        else if (h >= 12 && h < 18) saudacao = "Boa tarde"
        const mentions = sender ? [sender] : []
        const nomeBot = nomeBotDb(db)

        const commitPath = path.join(DATA_DIR, "ultimo_commit.json")
        let versaoAtual = 0
        if (fs.existsSync(commitPath)) { try { const c = JSON.parse(fs.readFileSync(commitPath, "utf8")); versaoAtual = c.versao || 0 } catch (_) {} }

        const texto =
`🟣 • 𝐏𝐀𝐈𝐍𝐄𝐋 𝐃𝐎 𝐆𝐑𝐀𝐍𝐃𝐄 𝐒𝐀́𝐁𝐈𝐎 •

╭─〔 👑 𝐀𝐔𝐓𝐎𝐑𝐈𝐃𝐀𝐃𝐄 〕
│ ${saudacao}, mestre supremo.
╰──────────────

『 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐜̧𝐨̃𝐞𝐬 』 ↴

👤 𝐍𝐨𝐦𝐞:
╰➜ ${pushName}

🆔 𝐈𝐃:
╰➜ ${numUser}

⏰ 𝐇𝐨𝐫𝐚́𝐫𝐢𝐨:
╰➜ ${hora}

📅 𝐃𝐚𝐭𝐚:
╰➜ ${data}

🔥 𝐕𝐞𝐫𝐬𝐚̃𝐨:
╰➜ *V${versaoAtual}*

🦠 𝐂𝐚𝐫𝐠𝐨:
╰➜ 𝐆𝐑𝐀𝐍𝐃𝐄 𝐒𝐀́𝐁𝐈𝐎

🟣 _"O conhecimento é a verdadeira força."_

╭─〔 🦠 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒 〕
╰──────────────

🟣 𝐆𝐄𝐑𝐀𝐋
╰➜ \`${p}entrar <link>\`
╰➜ \`${p}reload\`
╰➜ \`${p}reiniciar\`
╰➜ \`${p}botoff\`
╰➜ \`${p}setfoto\` (reply)
╰➜ \`${p}fotocmd\` (reply)
╰➜ \`${p}nomebot <nome>\`
╰➜ \`${p}teste\` (reply)
╰➜ \`${p}sora <descrição>\`
╰➜ \`${p}testa @user\`
╰➜ \`${p}googlevoz <texto>\`
╰➜ \`${p}get <comando>\` (reply)

🌌 𝐒𝐈𝐒𝐓𝐄𝐌𝐀
╰➜ \`${p}atualizar\`
╰➜ \`${p}changelog\`
╰➜ \`${p}dono\`

💜 𝐕𝐈𝐏
╰➜ \`${p}addvip @user <tempo>\`
╰➜ \`${p}delvip @user\`
╰➜ \`${p}listavip\`

🟣 𝐋𝐔𝐀𝐒 𝐒𝐔𝐏𝐄𝐑𝐈𝐎𝐑𝐄𝐒
╰➜ \`${p}addsubdono @user\`
╰➜ \`${p}delsubdono @user\`
╰➜ \`${p}listasubdono\`

💰 𝐀𝐋𝐔𝐆𝐔𝐄𝐋
╰➜ \`${p}aluguel on/off\`
╰➜ \`${p}addaluguel <tempo>\`
╰➜ \`${p}listaaluguel\`
╰➜ \`${p}delaluguel <nome>\`

⚙️ 𝐀𝐉𝐔𝐒𝐓𝐄𝐒
╰➜ \`${p}prefixoglobal <s>\`
╰➜ \`${p}slow on/off\`

🚫 𝐁𝐀𝐍𝐈𝐌𝐄𝐍𝐓𝐎
╰➜ \`${p}banirgp\`
╰➜ \`${p}desbanirgp\`
╰➜ \`${p}listabangp\`

💥 𝐏𝐔𝐍𝐈𝐂̧𝐀̃𝐎
╰➜ \`${p}nuke\`
╰➜ \`${p}limpargp\`

🦠 _"O Grande Sábio conhece cada segredo."_

"${nomeBot}"`

        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          try {
            if (cfg.tipoMenu === "video") return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "rimuru.mp4", gifPlayback: true, caption: texto, mentions }, { quoted: msg })
            return sock.sendMessage(jid, { image: buf, caption: texto, mentions }, { quoted: msg })
          } catch (e) { return sock.sendMessage(jid, { text: texto, mentions }, { quoted: msg }) }
        }
        await sock.sendMessage(jid, { text: texto, mentions }, { quoted: msg })
      }
    },

    dono: {
      aliases: ["donoinfo", "infodono", "mestre", "grandesabio"],
      async executar({ sock, msg, config, utils, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const donoArr = Array.isArray(config && config.dono) ? config.dono : [config && config.dono || ""]
        const numerosDono = donoArr.map(n => utils.soNumero(n)).filter(Boolean)
        const prefixo = (config && config.prefixo) || "!"
        const agora = new Date()
        const hora = agora.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" })
        const data = agora.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
        const mentions = numerosDono.map(n => n + "@s.whatsapp.net")
        let numerosTxt = ""
        if (numerosDono.length) { numerosDono.forEach((n) => { numerosTxt += `╰➜ +${n}\n` }) } else { numerosTxt = "╰➜ _não configurado_\n" }
        await sock.sendMessage(jid, { text: `🟣 • 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐂̧𝐎̃𝐄𝐒 𝐃𝐎 𝐃𝐎𝐍𝐎 •\n\n╭─〔 👑 𝐀𝐔𝐓𝐎𝐑𝐈𝐃𝐀𝐃𝐄 〕\n│ O mestre supremo deste bot.\n╰──────────────\n\n『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴\n\n🟣 𝐁𝐨𝐭:\n╰➜ ${nomeBot}\n\n👑 𝐂𝐚𝐫𝐠𝐨:\n╰➜ 𝐆𝐑𝐀𝐍𝐃𝐄 𝐒𝐀́𝐁𝐈𝐎\n\n📱 𝐍𝐮́𝐦𝐞𝐫𝐨(𝐬) 𝐝𝐨 𝐃𝐨𝐧𝐨:\n${numerosTxt}\n🔤 𝐏𝐫𝐞𝐟𝐢𝐱𝐨:\n╰➜ ${prefixo}\n\n🕐 𝐇𝐨𝐫𝐚́𝐫𝐢𝐨 𝐚𝐠𝐨𝐫𝐚:\n╰➜ ${hora} — ${data}\n\n💡 Fale com o mestre pra dúvidas ou suporte!\n\n"${nomeBot}"`, mentions }, { quoted: msg })
      }
    },

    nomebot: {
      aliases: ["setnomebot", "nomedobot"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const novoNome = args.join(" ").trim()
        if (!novoNome) {
          const cfg = db.config()
          return sock.sendMessage(jid, { text: `🟣 • 𝐍𝐎𝐌𝐄 𝐃𝐎 𝐁𝐎𝐓 •\n\n╭─〔 🦠 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐂̧𝐀̃𝐎 〕\n│ Nome atual do bot.\n╰──────────────\n\n『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴\n\n📝 𝐍𝐨𝐦𝐞 𝐚𝐭𝐮𝐚𝐥:\n╰➜ ${cfg.nomeBot || "Rimuru"}\n\n💡 Use:\n╰➜ \`!nomebot <novo nome>\`\n\n⚠️ Máx 20 caracteres\n\n"${nomeBot}"` }, { quoted: msg })
        }
        if (novoNome.length > 20) return sock.sendMessage(jid, { text: `🟣 • 𝐍𝐎𝐌𝐄 𝐌𝐔𝐈𝐓𝐎 𝐋𝐎𝐍𝐆𝐎 •\n\n╭─〔 🚫 𝐄𝐑𝐑𝐎 〕\n│ Máximo de 20 caracteres.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        const cfg = db.config()
        cfg.nomeBot = novoNome
        db.salvarConfig(cfg)
        await sock.sendMessage(jid, { text: `🟣 • 𝐍𝐎𝐌𝐄 𝐀𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐃𝐎 •\n\n╭─〔 💜 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ O bot ganha um novo nome.\n╰──────────────\n\n『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴\n\n📝 𝐍𝐨𝐯𝐨 𝐧𝐨𝐦𝐞:\n╰➜ ${novoNome}\n\n🟣 Comandos sem prefixo:\n╰➜ \`${novoNome} fecha\`\n╰➜ \`${novoNome} abre\`\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    addvip: {
      aliases: ["darvip", "setvip"],
      async executar({ sock, msg, args, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: `🟣 • 𝐀𝐃𝐃𝐕𝐈𝐏 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Marque o novo nobre.\n╰──────────────\n\n💡 \`!addvip @user <tempo>\`\n\n"${nomeBot}"` }, { quoted: msg })
        const tempo = (args.find(a => /^(inf|\d+[dhm])$/i.test(a)) || "").toLowerCase()
        if (!tempo) return sock.sendMessage(jid, { text: `🟣 • 𝐀𝐃𝐃𝐕𝐈𝐏 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Informe o tempo.\n╰──────────────\n\n💡 1d / 7d / 30d / inf\n\n"${nomeBot}"` }, { quoted: msg })
        let expira = "inf"
        if (tempo !== "inf") {
          const v = parseInt(tempo); const u = tempo.slice(-1); let ms = 0
          if (u === "d") ms = v * 24 * 60 * 60 * 1000
          if (u === "h") ms = v * 60 * 60 * 1000
          if (u === "m") ms = v * 60 * 1000
          expira = Date.now() + ms
        }
        const v = db.vips()
        v.vips = v.vips || {}
        v.vips[alvo] = { expira, desde: Date.now() }
        db.salvarVips(v)
        const num = utils.soNumero(alvo)
        await sock.sendMessage(jid, { text: `🟣 • 𝐍𝐎𝐁𝐑𝐄 𝐀𝐃𝐈𝐂𝐈𝐎𝐍𝐀𝐃𝐎 •\n\n╭─〔 💜 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ A força reconhece você.\n╰──────────────\n\n👤 𝐒𝐥𝐢𝐦𝐞:\n╰➜ @${num}\n\n💜 𝐓𝐞𝐦𝐩𝐨:\n╰➜ ${tempo === "inf" ? "ETERNO ♾️" : tempo.toUpperCase()}\n\n"${nomeBot}"`, mentions: [alvo] }, { quoted: msg })
      }
    },

    listavip: {
      aliases: ["vips", "vervips"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const v = db.vips()
        const vips = Object.entries(v.vips || {})
        if (!vips.length) return sock.sendMessage(jid, { text: `🟣 • 𝐍𝐈𝐍𝐆𝐔𝐄́𝐌 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Nem eu tenho nobres.\n╰──────────────\n\n_"Que solidão..."_\n\n"${nomeBot}"` }, { quoted: msg })
        let txt = `🟣 • 𝐋𝐈𝐒𝐓𝐀 𝐕𝐈𝐏 •\n\n『 𝐍𝐨𝐛𝐫𝐞𝐬 』 ↴\n\n`
        const mentions = []
        vips.forEach(([jidVip, info], i) => {
          const num = utils.soNumero(jidVip)
          const expira = info.expira === "inf" ? "♾️ Eterno" : new Date(info.expira).toLocaleString("pt-BR")
          txt += `╰➜ ${i + 1}. @${num}\n   💜 ${expira}\n\n`
          mentions.push(jidVip)
        })
        txt += `📊 𝐓𝐨𝐭𝐚𝐥: ${vips.length}\n\n"${nomeBot}"`
        await sock.sendMessage(jid, { text: txt, mentions }, { quoted: msg })
      }
    },

    addsubdono: {
      aliases: ["addsub", "darsub"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: `🟣 • 𝐀𝐃𝐃𝐒𝐔𝐁𝐃𝐎𝐍𝐎 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Marque o usuário.\n╰──────────────\n\n💡 \`!addsubdono @user\`\n\n"${nomeBot}"` }, { quoted: msg })
        const cfg = db.config()
        cfg.subdonos = cfg.subdonos || []
        const num = utils.soNumero(alvo)
        if (cfg.subdonos.some(s => utils.soNumero(s) === num)) return sock.sendMessage(jid, { text: `🟣 • 𝐉𝐀́ 𝐄́ 𝐋𝐔𝐀 𝐒𝐔𝐏𝐄𝐑𝐈𝐎𝐑 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Meus olhos veem isso.\n╰──────────────\n\n👤 @${num}\n\n"${nomeBot}"`, mentions: [alvo] }, { quoted: msg })
        cfg.subdonos.push(alvo)
        db.salvarConfig(cfg)
        await sock.sendMessage(jid, { text: `🟣 • 𝐍𝐎𝐕𝐀 𝐋𝐔𝐀 𝐒𝐔𝐏𝐄𝐑𝐈𝐎𝐑 •\n\n╭─〔 💜 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Você agora vê como eu vejo.\n╰──────────────\n\n👤 @${num}\n\n"${nomeBot}"`, mentions: [alvo] }, { quoted: msg })
      }
    },

    listasubdono: {
      aliases: ["subdonos", "listasub"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const cfg = db.config()
        const subs = cfg.subdonos || []
        if (!subs.length) return sock.sendMessage(jid, { text: `🟣 • 𝐍𝐈𝐍𝐆𝐔𝐄́𝐌 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Só eu vejo a verdade.\n╰──────────────\n\n_"Solidão..."_\n\n"${nomeBot}"` }, { quoted: msg })
        let txt = `🟣 • 𝐋𝐔𝐀𝐒 𝐒𝐔𝐏𝐄𝐑𝐈𝐎𝐑𝐄𝐒 •\n\n『 𝐋𝐢𝐬𝐭𝐚 』 ↴\n\n`
        const mentions = []
        subs.forEach((jidS, i) => {
          txt += `╰➜ ${i + 1}. @${utils.soNumero(jidS)}\n`
          mentions.push(jidS)
        })
        txt += `\n📊 𝐓𝐨𝐭𝐚𝐥: ${subs.length}\n\n"${nomeBot}"`
        await sock.sendMessage(jid, { text: txt, mentions }, { quoted: msg })
      }
    },

    reload: {
      aliases: ["recarregar", "reloadmenus"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        try {
          await sock.sendMessage(jid, { text: `🟣 • 𝐑𝐄𝐂𝐀𝐑𝐑𝐄𝐆𝐀𝐍𝐃𝐎 •\n\n╭─〔 ♻️ 𝐑𝐄𝐋𝐎𝐀𝐃 〕\n│ Recarregando todos os módulos...\n╰──────────────\n\n♻️ Menus sendo recarregados...\n🔄 Bot reiniciando em 3s...\n\n💡 _Aguarde o retorno._\n\n"${nomeBot}"` }, { quoted: msg })
          try { if (global.__carregarMenus) global.__carregarMenus() } catch (_) {}
          setTimeout(() => process.exit(1), 3000)
        } catch (e) {
          await sock.sendMessage(jid, { text: `🟣 • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 🚫 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    reiniciar: {
      aliases: ["restart"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        try {
          await sock.sendMessage(jid, { text: `🟣 • 𝐑𝐄𝐍𝐀𝐒𝐂𝐄𝐍𝐃𝐎 •\n\n╭─〔 ♻️ 𝐑𝐄𝐒𝐓𝐀𝐑𝐓 〕\n│ Reiniciando o bot...\n╰──────────────\n\n♻️ Recarregando módulos...\n🔄 Reiniciando em 3s...\n\n💡 _Aguarde o retorno._\n\n"${nomeBot}"` }, { quoted: msg })
          try { if (global.__carregarMenus) global.__carregarMenus() } catch (_) {}
          setTimeout(() => process.exit(1), 3000)
        } catch (e) {
          await sock.sendMessage(jid, { text: `🟣 • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 🚫 𝐄𝐑𝐑𝐎 〕\n│ ${e.message}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },

    botoff: {
      aliases: ["desligar", "offbot"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        await sock.sendMessage(jid, { text: `🟣 • 𝐀𝐓𝐄́ 𝐋𝐎𝐆𝐎 •\n\n╭─〔 🌙 𝐃𝐄𝐒𝐋𝐈𝐆𝐀𝐍𝐃𝐎 〕\n│ Até a próxima batalha.\n╰──────────────\n\n🟣 _"O Grande Sábio vai dormir..."_\n🦠 _"Mas sempre volto."_\n\n💤 _Zzzz..._\n\n"${nomeBot}"` }, { quoted: msg })
        setTimeout(() => process.exit(2), 3000)
      }
    },

    entrar: {
      aliases: ["entrargp", "join", "joinlink"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const link = args[0]
        if (!link) return sock.sendMessage(jid, { text: `🟣 • 𝐄𝐍𝐓𝐑𝐀𝐑 𝐄𝐌 𝐆𝐑𝐔𝐏𝐎 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Informe o link do grupo.\n╰──────────────\n\n💡 Use:\n╰➜ \`!entrar <link>\`\n\n"${nomeBot}"` }, { quoted: msg })
        const match = link.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/)
        if (!match) return sock.sendMessage(jid, { text: `🟣 • 𝐋𝐈𝐍𝐊 𝐈𝐍𝐕𝐀́𝐋𝐈𝐃𝐎 •\n\n╭─〔 🚫 𝐄𝐑𝐑𝐎 〕\n│ Isso não é um link de grupo válido.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        try {
          await sock.sendMessage(jid, { text: `🟣 • 𝐄𝐍𝐓𝐑𝐀𝐍𝐃𝐎... •\n\n╭─〔 💜 𝐀𝐆𝐔𝐀𝐑𝐃𝐄 〕\n│ Entrando no grupo...\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
          const info = await sock.groupAcceptInvite(match[1])
          await sock.sendMessage(jid, { text: `🟣 • 𝐄𝐍𝐓𝐑𝐄𝐈! •\n\n╭─〔 💜 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Mais um território observado.\n╰──────────────\n\n${typeof info === "string" ? "🔗 \`" + info + "\`" : "✅ Entrada realizada"}\n\n"${nomeBot}"` }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: `🟣 • 𝐄𝐑𝐑𝐎 •\n\n╭─〔 🚫 𝐅𝐀𝐋𝐇𝐀 〕\n│ Não consegui entrar.\n╰──────────────\n\n⚠️ \`${e.message}\`\n\n"${nomeBot}"` }, { quoted: msg })
        }
      }
    },
    
    prefixoglobal: {
      aliases: ["setprefixoglobal"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const p = args[0]
        if (!p || p.length > 3) return sock.sendMessage(jid, { text: `🟣 • 𝐏𝐑𝐄𝐅𝐈𝐗𝐎 𝐆𝐋𝐎𝐁𝐀𝐋 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Prefixo curto, por favor.\n╰──────────────\n\n💡 \`!prefixoglobal <s>\` (máx 3)\n\n"${nomeBot}"` }, { quoted: msg })
        const cfg = db.config()
        cfg.prefixoGlobal = p
        db.salvarConfig(cfg)
        await sock.sendMessage(jid, { text: `🟣 • 𝐏𝐑𝐄𝐅𝐈𝐗𝐎 𝐀𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐃𝐎 •\n\n╭─〔 💜 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ A força muda de forma.\n╰──────────────\n\n⚙️ 𝐍𝐨𝐯𝐨:\n╰➜ \`${p}\`\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    slow: {
      aliases: ["modolento"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: `🟣 • 𝐒𝐋𝐎𝐖 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Use on ou off.\n╰──────────────\n\n💡 \`!slow on/off\`\n\n"${nomeBot}"` }, { quoted: msg })
        const cfg = db.config()
        cfg.slow = opcao === "on"
        db.salvarConfig(cfg)
        await sock.sendMessage(jid, { text: `🟣 • 𝐌𝐎𝐃𝐎 𝐋𝐄𝐍𝐓𝐎 •\n\n╭─〔 💜 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ ${opcao.toUpperCase()}\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    banirgp: {
      aliases: ["bangp", "banirgrupo"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const b = db.bangp()
        b.grupos = b.grupos || {}
        b.grupos[jid] = true
        db.salvarBangp(b)
        await sock.sendMessage(jid, { text: `🟣 • 𝐓𝐄𝐑𝐑𝐈𝐓𝐎́𝐑𝐈𝐎 𝐁𝐀𝐍𝐈𝐃𝐎 •\n\n╭─〔 🚫 𝐁𝐀𝐍𝐈𝐌𝐄𝐍𝐓𝐎 〕\n│ Meus olhos não querem ver vocês.\n╰──────────────\n\n_"Tchau."_\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    desbanirgp: {
      aliases: ["desbangp"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        const b = db.bangp()
        if (b.grupos && b.grupos[jid]) {
          delete b.grupos[jid]
          db.salvarBangp(b)
          return sock.sendMessage(jid, { text: `🟣 • 𝐋𝐈𝐁𝐄𝐑𝐀𝐃𝐎 •\n\n╭─〔 💜 𝐒𝐔𝐂𝐄𝐒𝐒𝐎 〕\n│ Perdoado... uma vez.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        }
        await sock.sendMessage(jid, { text: `🟣 • 𝐍𝐀̃𝐎 𝐓𝐀́ 𝐁𝐀𝐍𝐈𝐃𝐎 •\n\n╭─〔 🦠 𝐀𝐕𝐈𝐒𝐎 〕\n│ Você não presta atenção.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
      }
    },

    nuke: {
      aliases: ["explodir", "destruir"],
      async executar({ sock, msg, groupMetadata, utils, db }) {
        const jid = msg.key.remoteJid
        const nomeBot = nomeBotDb(db)
        if (!jid.endsWith("@g.us")) return
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: `🟣 • 𝐏𝐑𝐄𝐂𝐈𝐒𝐎 𝐒𝐄𝐑 𝐀𝐃𝐌𝐈𝐍 •\n\n╭─〔 🚫 𝐄𝐑𝐑𝐎 〕\n│ Até o Grande Sábio precisa de permissão.\n╰──────────────\n\n"${nomeBot}"` }, { quoted: msg })
        await sock.sendMessage(jid, { text: `🟣 • 𝐋𝐈𝐌𝐏𝐄𝐙𝐀 𝐓𝐎𝐓𝐀𝐋 •\n\n╭─〔 💥 𝐍𝐔𝐊𝐄 〕\n│ Não olhe pra trás.\n╰──────────────\n\n_"Habilidade Única: Aniquilação."_\n\n"${nomeBot}"` }, { quoted: msg })
        const meta = await sock.groupMetadata(jid)
        const botNum = utils.soNumero(sock.user && sock.user.id)
        const alvos = meta.participants.filter(p => utils.soNumero(p.id) !== botNum).map(p => p.id)
        for (const a of alvos) {
          try { await sock.groupParticipantsUpdate(jid, [a], "remove") } catch (_) {}
          await new Promise(r => setTimeout(r, 500))
        }
      }
    }

  }
}