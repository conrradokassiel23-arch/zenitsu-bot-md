/* ============================================================
   🌙 MENU DONO - AKAZA BOT MD
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
  if (m.includes("add") || m.includes("novo") || m.includes("new") || m.includes("cria") || m.includes("feat")) {
    return { emoji: "✨", tipo: "Novo comando/sistema" }
  }
  if (m.includes("fix") || m.includes("corrig") || m.includes("bug") || m.includes("arrum")) {
    return { emoji: "🔧", tipo: "Correção" }
  }
  if (m.includes("remove") || m.includes("delet") || m.includes("remov")) {
    return { emoji: "🗑️", tipo: "Removido" }
  }
  if (m.includes("update") || m.includes("atualiz") || m.includes("melhor") || m.includes("improve")) {
    return { emoji: "⚡", tipo: "Melhoria" }
  }
  if (m.includes("rename") || m.includes("nome") || m.includes("tema")) {
    return { emoji: "🎨", tipo: "Visual/Tema" }
  }
  if (m.includes("doc") || m.includes("readme")) {
    return { emoji: "📝", tipo: "Documentação" }
  }
  return { emoji: "🔹", tipo: "Mudança" }
}

module.exports = {
  menu: "menu-dono",
  grupoOnly: false,
  adminOnly: false,
  donoOnly: true,

  commands: {

    menudono: {
      aliases: ["dono", "comandosdono", "menud", "imperador"],
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

        const texto =
`╔═══════════════════════════════╗
║   🔥  𝐀𝐊𝐀𝐙𝐀 𝐁𝐎𝐓 𝐌𝐃  🔥
║   ⚔️  𝐏𝐀𝐈𝐍𝐄𝐋 𝐃𝐎 𝐌𝐄𝐒𝐓𝐑𝐄
╚═══════════════════════════════╝

╭━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  👑  𝑨𝑼𝑻𝑶𝑹𝑰𝑫𝑨𝑫𝑬
╰━━━━━━━━━━━━━━━━━━━━━━━━━╯

${saudacao}, *${pushName}*!

▸ 🆔 *ID:* ${numUser}
▸ ⏰ *Hora:* ${hora}
▸ 📅 *Data:* ${data}
▸ 🔥 *Cargo:* 𝐌𝐄𝐒𝐓𝐑𝐄

> _"A força não se compra. Se conquista."_

╭━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃  ⚔️  𝑪𝑶𝑴𝑨𝑵𝑫𝑶𝑺
╰━━━━━━━━━━━━━━━━━━━━━━━━━╯

╭─ 🔥 𝐆𝐄𝐑𝐀𝐋
│ ▸ \`${p}entrar <link>\`
│ ▸ \`${p}reload\`
│ ▸ \`${p}reiniciar\`
│ ▸ \`${p}botoff\`
│ ▸ \`${p}setfoto\` (reply)
│ ▸ \`${p}fotocmd\` (reply)
│ ▸ \`${p}nomebot <nome>\`
╰────────────────────────

╭─ 🌙 𝐒𝐈𝐒𝐓𝐄𝐌𝐀
│ ▸ \`${p}atualizar\`
│ ▸ \`${p}changelog\`
╰────────────────────────

╭─ 💜 𝐕𝐈𝐏
│ ▸ \`${p}addvip @user <tempo>\`
│ ▸ \`${p}delvip @user\`
│ ▸ \`${p}listavip\`
╰────────────────────────

╭─ 🔥 𝐋𝐔𝐀𝐒 𝐒𝐔𝐏𝐄𝐑𝐈𝐎𝐑𝐄𝐒
│ ▸ \`${p}addsubdono @user\`
│ ▸ \`${p}delsubdono @user\`
│ ▸ \`${p}listasubdono\`
╰────────────────────────

╭─ 💰 𝐀𝐋𝐔𝐆𝐔𝐄𝐋
│ ▸ \`${p}aluguel on/off\`
│ ▸ \`${p}addaluguel <tempo>\`
│ ▸ \`${p}listaaluguel\`
│ ▸ \`${p}delaluguel <nome>\`
╰────────────────────────

╭─ ⚙️ 𝐀𝐉𝐔𝐒𝐓𝐄𝐒
│ ▸ \`${p}prefixoglobal <s>\`
│ ▸ \`${p}slow on/off\`
╰────────────────────────

╭─ 🚫 𝐁𝐀𝐍𝐈𝐌𝐄𝐍𝐓𝐎
│ ▸ \`${p}banirgp\`
│ ▸ \`${p}desbanirgp\`
│ ▸ \`${p}listabangp\`
╰────────────────────────

╭─ 💥 𝐏𝐔𝐍𝐈𝐂̧𝐀̃𝐎
│ ▸ \`${p}nuke\`
│ ▸ \`${p}limpargp\`
╰────────────────────────

╔═══════════════════════════════╗
║   🔥  𝐀𝐊𝐀𝐙𝐀 𝐁𝐎𝐓 𝐌𝐃  🔥
╚═══════════════════════════════╝

> 🔥 _"Respiração... 3ª Forma: Aniquilação."_
> ⚔️ _"A força conhece cada segredo."_`

        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          try {
            if (cfg.tipoMenu === "video") {
              return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "akaza.mp4", gifPlayback: true, caption: texto, mentions }, { quoted: msg })
            }
            return sock.sendMessage(jid, { image: buf, caption: texto, mentions }, { quoted: msg })
          } catch (e) {
            return sock.sendMessage(jid, { text: texto, mentions }, { quoted: msg })
          }
        }
        await sock.sendMessage(jid, { text: texto, mentions }, { quoted: msg })
      }
    },

    // ============ FOTOCMD (foto do "comando não encontrado") ============
    fotocmd: {
      aliases: ["fotocomando", "fotonaoencontrado", "setfotocmd"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const ctx = (msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo) || {}
        const quoted = ctx.quotedMessage
        const temImg = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage)
        const temVid = (msg.message && msg.message.videoMessage) || (quoted && quoted.videoMessage)

        if (!temImg && !temVid) {
          return sock.sendMessage(jid, {
            text: "🌙📸 *FOTO CMD*\n\n> _\"Me manda a imagem que aparece no 'comando não encontrado'.\"_\n\n💡 Responda uma foto/vídeo com `!fotocmd`\n💡 Use `!fotocmd off` pra desativar"
          }, { quoted: msg })
        }

        try {
          const cfg = db.config()

          if (temImg) {
            const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage } })
            const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
            cfg.fotoCmd = buffer.toString("base64")
            cfg.tipoFotoCmd = "foto"
            db.salvarConfig(cfg)
            return sock.sendMessage(jid, { image: buffer, caption: "🌙✅ *FOTO CMD SALVA*\n\n> _\"Vai aparecer no 'comando não encontrado'.\"_" }, { quoted: msg })
          }

          const vidMsg = (msg.message && msg.message.videoMessage) ? msg : Object.assign({}, msg, { message: { videoMessage: quoted.videoMessage } })
          const vidBuffer = await utils.downloadMediaMessage(vidMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          const ff = require("@ffmpeg-installer/ffmpeg").path
          const tmp = os.tmpdir()
          const tIn = path.join(tmp, "cmd_" + Date.now() + ".mp4")
          const tOut = path.join(tmp, "cmd_" + Date.now() + "_out.mp4")
          fs.writeFileSync(tIn, vidBuffer)
          execSync(`"${ff}" -y -i "${tIn}" -vf "fps=12,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black" -an -c:v libx264 -preset fast -crf 30 -pix_fmt yuv420p -movflags +faststart "${tOut}"`, { stdio: "ignore", timeout: 180000 })
          let outBuffer = fs.readFileSync(tOut)
          if (outBuffer.length > 15 * 1024 * 1024) {
            const tOut2 = path.join(tmp, "cmd_" + Date.now() + "_out2.mp4")
            execSync(`"${ff}" -y -i "${tOut}" -vf "fps=8,scale=384:384:force_original_aspect_ratio=decrease,pad=384:384:(ow-iw)/2:(oh-ih)/2:color=black" -an -c:v libx264 -preset fast -crf 32 -pix_fmt yuv420p -movflags +faststart "${tOut2}"`, { stdio: "ignore", timeout: 180000 })
            outBuffer = fs.readFileSync(tOut2)
            try { fs.unlinkSync(tOut2) } catch (_) {}
          }
          cfg.fotoCmd = outBuffer.toString("base64")
          cfg.tipoFotoCmd = "video"
          db.salvarConfig(cfg)
          try { fs.unlinkSync(tIn) } catch (_) {}
          try { fs.unlinkSync(tOut) } catch (_) {}
          await sock.sendMessage(jid, { video: outBuffer, mimetype: "video/mp4", fileName: "akaza.mp4", gifPlayback: true, caption: "🌙✅ *VÍDEO CMD SALVO*\n\n> _\"Vai aparecer no 'comando não encontrado'.\"_" }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: "🌙💥 *ERRO!*\n\n⚠️ " + e.message }, { quoted: msg })
        }
      }
    },

    atualizar: {
      aliases: ["update", "git"],
      async executar({ sock, msg }) {
        const jid = msg.key.remoteJid
        let zipPath, extractDir
        await sock.sendMessage(jid, { text: "🌙🔄 *VERIFICANDO...*\n\n> 📡 _\"Buscando atualizações...\"_" }, { quoted: msg })

        try {
          if (!fs.existsSync(DATA_DIR)) {
            try { fs.mkdirSync(DATA_DIR, { recursive: true }) } catch (e) {}
          }

          const apiResp = await fetch(REPO_API, { headers: { "User-Agent": "AkazaBot" } })
          if (!apiResp.ok) throw new Error("GitHub respondeu " + apiResp.status)
          const apiData = await apiResp.json()
          const commitHash = apiData.sha
          const commitMsg = (apiData.commit && apiData.commit.message || "").split("\n")[0]
          const commitData = apiData.commit && apiData.commit.author && apiData.commit.author.date

          const commitSalvo = dbLer("ultimo_commit.json", { hash: null })

          if (commitSalvo.hash === commitHash) {
            return sock.sendMessage(jid, {
              text: "🌙✅ *TUDO EM ORDEM*\n\n" +
                "> 👁️ _\"Já está atualizado, mestre.\"_\n\n" +
                "📌 Versão: `" + commitHash.slice(0, 7) + "`\n" +
                "📝 _" + commitMsg + "_\n" +
                "📅 " + formatarDataHora(commitData) + "\n\n" +
                "💡 Use `!changelog` pra ver as novidades."
            }, { quoted: msg })
          }

          await sock.sendMessage(jid, {
            text: "🌙🔥 *NOVA ATUALIZAÇÃO!*\n\n" +
              "> 👁️ _\"Detectei mudanças no servidor...\"_\n\n" +
              "━━━━━━━━━━━━━━━━━━━━━━\n" +
              "📌 *Versão:* `" + commitHash.slice(0, 7) + "`\n" +
              "📝 _" + commitMsg + "_\n" +
              "📅 " + formatarDataHora(commitData) + "\n" +
              "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
              "📥 _Baixando arquivos..._"
          }, { quoted: msg })

          const tmp = os.tmpdir()
          const id = Date.now()
          zipPath = path.join(tmp, "akaza_" + id + ".zip")
          extractDir = path.join(tmp, "akaza_" + id)

          const zipUrl = REPO_URL + "/archive/refs/heads/main.zip"
          const r = await fetch(zipUrl)
          if (!r.ok) throw new Error("Download falhou: HTTP " + r.status)
          const buffer = Buffer.from(await r.arrayBuffer())
          fs.writeFileSync(zipPath, buffer)

          if (!fs.existsSync(extractDir)) fs.mkdirSync(extractDir, { recursive: true })

          try {
            execSync(`unzip -o "${zipPath}" -d "${extractDir}"`, { stdio: "ignore" })
          } catch (_) {
            try { execSync(`tar -xf "${zipPath}" -C "${extractDir}"`, { stdio: "ignore" }) }
            catch (e2) { throw new Error("Falta unzip ou tar no servidor") }
          }

          const pastas = fs.readdirSync(extractDir).filter(f => fs.statSync(path.join(extractDir, f)).isDirectory())
          if (!pastas.length) throw new Error("Zip vazio")
          const raiz = path.join(extractDir, pastas[0])

          const preservar = ["auth", "data", "node_modules", ".git", "config.js"]

          function copiarRecursivo(src, dest) {
            const itens = fs.readdirSync(src)
            for (const item of itens) {
              const srcPath = path.join(src, item)
              const destPath = path.join(dest, item)
              const stat = fs.statSync(srcPath)
              if (stat.isDirectory()) {
                if (preservar.includes(item)) continue
                if (!fs.existsSync(destPath)) fs.mkdirSync(destPath, { recursive: true })
                copiarRecursivo(srcPath, destPath)
              } else {
                if (preservar.includes(item)) continue
                fs.copyFileSync(srcPath, destPath)
              }
            }
          }

          copiarRecursivo(raiz, BOT_DIR)

          const commitPath = path.join(DATA_DIR, "ultimo_commit.json")
          fs.writeFileSync(commitPath, JSON.stringify({
            hash: commitHash,
            msg: commitMsg,
            data: commitData,
            atualizadoEm: Date.now()
          }, null, 2))

          try { fs.unlinkSync(zipPath) } catch (_) {}
          try { fs.rmSync(extractDir, { recursive: true, force: true }) } catch (_) {}

          try {
            if (global.__carregarMenus) global.__carregarMenus()
          } catch (e) { console.log("Aviso reload:", e.message) }

          await sock.sendMessage(jid, {
            text: "╔═══════════════════════════════╗\n" +
              "║   ✅  𝐀𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐃𝐎  ✅\n" +
              "╚═══════════════════════════════╝\n\n" +
              "> 👁️ _\"Tudo assimilado.\"_\n\n" +
              "━━━━━━━━━━━━━━━━━━━━━━\n" +
              "📌 *Versão:* `" + commitHash.slice(0, 7) + "`\n" +
              "📝 _" + commitMsg + "_\n" +
              "📅 " + formatarDataHora(commitData) + "\n" +
              "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
              "🔒 *Preservado:*\n" +
              "▸ `auth/` (sessão)\n" +
              "▸ `data/` (dados)\n" +
              "▸ `config.js`\n\n" +
              "━━━━━━━━━━━━━━━━━━━━━━\n" +
              "🔥 *Reiniciando o bot em 3s...*\n" +
              "> ⚔️ _\"Aguarde alguns segundos.\"_"
          }, { quoted: msg })

          console.log("🔥 ATUALIZAÇÃO concluída. Reiniciando processo...")
          setTimeout(() => process.exit(0), 3000)

        } catch (e) {
          console.log("Erro atualizar:", e.message)
          try { if (zipPath) fs.unlinkSync(zipPath) } catch (_) {}
          try { if (extractDir) fs.rmSync(extractDir, { recursive: true, force: true }) } catch (_) {}
          await sock.sendMessage(jid, {
            text: "🌙💥 *FALHA NA ATUALIZAÇÃO!*\n\n⚠️ `" + e.message + "`\n\n> _\"Algo deu errado...\"_"
          }, { quoted: msg })
        }
      }
    },

    changelog: {
      aliases: ["historico", "mudancas", "log", "novidades"],
      async executar({ sock, msg }) {
        const jid = msg.key.remoteJid
        try {
          const r = await fetch(REPO_COMMITS, { headers: { "User-Agent": "AkazaBot" } })
          if (!r.ok) throw new Error("HTTP " + r.status)
          const commits = await r.json()

          if (!Array.isArray(commits) || !commits.length) {
            return sock.sendMessage(jid, {
              text: "🌙📜 *SEM NOVIDADES*\n\n> _\"Nada novo no horizonte.\"_"
            }, { quoted: msg })
          }

          let txt = "╔═══════════════════════════════╗\n" +
            "║   🔥  𝐍𝐎𝐕𝐈𝐃𝐀𝐃𝐄𝐒 𝐃𝐎 𝐁𝐎𝐓  🔥\n" +
            "╚═══════════════════════════════╝\n\n" +
            "> 👁️ _\"O que mudou nas últimas versões?\"_\n\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━\n\n"

          commits.forEach((c, i) => {
            const hash = c.sha ? c.sha.slice(0, 7) : "?"
            const msgCommit = (c.commit && c.commit.message || "").split("\n")[0].trim()
            const autor = c.commit && c.commit.author && c.commit.author.name || "?"
            const data = c.commit && c.commit.author && c.commit.author.date
            const cat = categorizarCommit(msgCommit)

            const dataFmt = data ? new Date(data).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "?"

            txt += cat.emoji + " *" + cat.tipo + "*\n"
            txt += "▸ _" + msgCommit + "_\n"
            txt += "▸ 👤 " + autor + " — 📅 " + dataFmt + "\n"
            txt += "▸ 🔖 `" + hash + "`\n"

            if (i < commits.length - 1) txt += "\n─────────────────────\n\n"
          })

          txt += "\n\n━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
            "🔥 *Total:* " + commits.length + " atualizações recentes\n" +
            "━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
            "> ⚔️ _\"A força se renova a cada batalha.\"_\n" +
            "> 🔥 _\"Sempre evoluindo.\"_"

          await sock.sendMessage(jid, { text: txt }, { quoted: msg })

        } catch (e) {
          await sock.sendMessage(jid, {
            text: "🌙💥 *ERRO NO CHANGELOG*\n\n⚠️ " + e.message
          }, { quoted: msg })
        }
      }
    },

    nomebot: {
      aliases: ["setnomebot", "nomedobot"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const novoNome = args.join(" ").trim()

        if (!novoNome) {
          const cfg = db.config()
          return sock.sendMessage(jid, {
            text: "🌙🔥 *NOME DO BOT*\n\n" +
              "> _\"Me chame como quiser.\"_\n\n" +
              "📝 Atual: *" + (cfg.nomeBot || "Akaza") + "*\n\n" +
              "💡 Use: `!nomebot <novo nome>`\n\n" +
              "⚠️ *Máx 20 caracteres*"
          }, { quoted: msg })
        }

        if (novoNome.length > 20) {
          return sock.sendMessage(jid, { text: "🌙💢 *NOME MUITO LONGO*\n\n> _\"Máx 20 caracteres.\"_" }, { quoted: msg })
        }

        const cfg = db.config()
        cfg.nomeBot = novoNome
        db.salvarConfig(cfg)

        await sock.sendMessage(jid, {
          text: "🌙✅ *NOME ATUALIZADO*\n\n" +
            "> _\"O bot ganha um novo nome.\"_\n\n" +
            "📝 Novo nome: *" + novoNome + "*\n\n" +
            "🔥 Comandos sem prefixo:\n" +
            "▸ `" + novoNome + " fecha`\n" +
            "▸ `" + novoNome + " abre`"
        }, { quoted: msg })
      }
    },

    reload: {
      aliases: ["recarregar", "reloadmenus"],
      async executar({ sock, msg }) {
        const jid = msg.key.remoteJid
        try {
          await sock.sendMessage(jid, {
            text: "╔═══════════════════════════════╗\n" +
              "║   🔥  𝐑𝐄𝐈𝐍𝐈𝐂𝐈𝐀𝐍𝐃𝐎...  🔥\n" +
              "╚═══════════════════════════════╝\n\n" +
              "> ⚔️ _\"Recarregando todos os módulos...\"_\n\n" +
              "♻️ Menus sendo recarregados...\n" +
              "🔄 Bot vai reiniciar em 3s...\n\n" +
              "> 📊 _\"Aguarde o aviso de retorno.\"_"
          }, { quoted: msg })

          try { if (global.__carregarMenus) global.__carregarMenus() } catch (_) {}

          console.log("🔥 RELOAD solicitado pelo dono. Reiniciando...")
          setTimeout(() => process.exit(0), 3000)

        } catch (e) {
          await sock.sendMessage(jid, { text: "🌙💥 *ERRO!*\n\n⚠️ " + e.message }, { quoted: msg })
        }
      }
    },

    reiniciar: {
      aliases: ["restart"],
      async executar({ sock, msg }) {
        const jid = msg.key.remoteJid
        try {
          await sock.sendMessage(jid, {
            text: "╔═══════════════════════════════╗\n" +
              "║   🔥  𝐑𝐄𝐍𝐀𝐒𝐂𝐄𝐍𝐃𝐎...  🔥\n" +
              "╚═══════════════════════════════╝\n\n" +
              "> ⚔️ _\"Voltarei mais forte.\"_\n\n" +
              "♻️ Recarregando módulos...\n" +
              "🔄 Reiniciando em 3s...\n\n" +
              "> 📊 _\"Aguarde o aviso de retorno.\"_"
          }, { quoted: msg })

          try { if (global.__carregarMenus) global.__carregarMenus() } catch (_) {}

          console.log("🔥 REINICIAR solicitado pelo dono. Reiniciando...")
          setTimeout(() => process.exit(0), 3000)

        } catch (e) {
          await sock.sendMessage(jid, { text: "🌙💥 *ERRO!*\n\n⚠️ " + e.message }, { quoted: msg })
        }
      }
    },

    botoff: {
      aliases: ["desligar", "offbot"],
      async executar({ sock, msg }) {
        const jid = msg.key.remoteJid
        await sock.sendMessage(jid, {
          text: "╔═══════════════════════════════╗\n" +
            "║   🌙  𝐀𝐓𝐄́ 𝐋𝐎𝐆𝐎...  🌙\n" +
            "╚═══════════════════════════════╝\n\n" +
            "> _\"Meus olhos se fecham...\"_\n" +
            "> _\"...mas sempre volto.\"_\n\n" +
            "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
            "> 🌙 _\"Até a próxima batalha, mestre.\"_\n" +
            "> 💤 _Zzzz..._"
        }, { quoted: msg })
        console.log("🛑 BOTOFF solicitado. Desligando de vez...")
        setTimeout(() => process.exit(2), 3000)
      }
    },

    entrar: {
      aliases: ["entrargp", "join", "joinlink"],
      async executar({ sock, msg, args }) {
        const jid = msg.key.remoteJid
        const link = args[0]
        if (!link) return sock.sendMessage(jid, { text: "🌙🤔 *ENTRAR ONDE?*\n\n> _\"Me dá o link, mestre.\"_\n\n💡 `!entrar <link>`" }, { quoted: msg })
        const match = link.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/)
        if (!match) return sock.sendMessage(jid, { text: "🌙🔥 *ISSO NÃO É LINK!*\n\n> _\"Meus olhos veem a verdade.\"_" }, { quoted: msg })
        try {
          await sock.sendMessage(jid, { text: "🌙👁️ *ENTRANDO...*\n\n> _\"Meus olhos estão atentos.\"_" }, { quoted: msg })
          const info = await sock.groupAcceptInvite(match[1])
          await sock.sendMessage(jid, { text: "🌙✅ *ENTREI!*\n\n> _\"Mais um território observado.\"_\n\n🔥 `" + (typeof info === "string" ? info : "ok") + "`" }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: "🌙💥 *NÃO CONSEGUI!*\n\n⚠️ " + e.message }, { quoted: msg })
        }
      }
    },

    setfoto: {
      aliases: ["fotomenu", "videomenu"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {}
        const quoted = ctx.quotedMessage
        const temImg = (msg.message && msg.message.imageMessage) || (quoted && quoted.imageMessage)
        const temVid = (msg.message && msg.message.videoMessage) || (quoted && quoted.videoMessage)
        if (!temImg && !temVid) return sock.sendMessage(jid, { text: "🌙📸 *CADÊ A FOTO?*\n\n> _\"Me dá a imagem do estandarte.\"_\n\n💡 `!setfoto` (reply)" }, { quoted: msg })
        try {
          const cfg = db.config()
          if (temImg) {
            const alvoMsg = (msg.message && msg.message.imageMessage) ? msg : Object.assign({}, msg, { message: { imageMessage: quoted.imageMessage } })
            const buffer = await utils.downloadMediaMessage(alvoMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
            cfg.fotoMenu = buffer.toString("base64")
            cfg.tipoMenu = "foto"
            db.salvarConfig(cfg)
            return sock.sendMessage(jid, { image: buffer, caption: "🌙✅ *ESTANDARTE SALVO*\n\n> _\"Meus olhos gravaram.\"_\n\n🖼️ Foto do menu salva!" }, { quoted: msg })
          }
          const vidMsg = (msg.message && msg.message.videoMessage) ? msg : Object.assign({}, msg, { message: { videoMessage: quoted.videoMessage } })
          const vidBuffer = await utils.downloadMediaMessage(vidMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          const ff = require("@ffmpeg-installer/ffmpeg").path
          const tmp = os.tmpdir()
          const tIn = path.join(tmp, "menu_" + Date.now() + ".mp4")
          const tOut = path.join(tmp, "menu_" + Date.now() + "_out.mp4")
          fs.writeFileSync(tIn, vidBuffer)

          execSync(`"${ff}" -y -i "${tIn}" -vf "fps=12,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black" -an -c:v libx264 -preset fast -crf 30 -pix_fmt yuv420p -movflags +faststart "${tOut}"`, { stdio: "ignore", timeout: 180000 })

          let outBuffer = fs.readFileSync(tOut)

          if (outBuffer.length > 15 * 1024 * 1024) {
            const tOut2 = path.join(tmp, "menu_" + Date.now() + "_out2.mp4")
            execSync(`"${ff}" -y -i "${tOut}" -vf "fps=8,scale=384:384:force_original_aspect_ratio=decrease,pad=384:384:(ow-iw)/2:(oh-ih)/2:color=black" -an -c:v libx264 -preset fast -crf 32 -pix_fmt yuv420p -movflags +faststart "${tOut2}"`, { stdio: "ignore", timeout: 180000 })
            outBuffer = fs.readFileSync(tOut2)
            try { fs.unlinkSync(tOut2) } catch (_) {}
          }

          cfg.fotoMenu = outBuffer.toString("base64")
          cfg.tipoMenu = "video"
          db.salvarConfig(cfg)
          try { fs.unlinkSync(tIn) } catch (_) {}
          try { fs.unlinkSync(tOut) } catch (_) {}
          await sock.sendMessage(jid, { video: outBuffer, mimetype: "video/mp4", fileName: "akaza.mp4", gifPlayback: true, caption: "🌙✅ *ESTANDARTE ANIMADO SALVO*\n\n> _\"Movimento também é arte.\"_\n\n🎬 Vídeo do menu salvo!" }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: "🌙💥 *ERRO!*\n\n⚠️ " + e.message }, { quoted: msg })
        }
      }
    },

    addvip: {
      aliases: ["darvip", "setvip"],
      async executar({ sock, msg, args, db, utils }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: "🌙💜 *QUEM?*\n\n> _\"Marque o novo nobre.\"_\n\n💡 `!addvip @user <tempo>`" }, { quoted: msg })
        const tempo = (args.find(a => /^(inf|\d+[dhm])$/i.test(a)) || "").toLowerCase()
        if (!tempo) return sock.sendMessage(jid, { text: "🌙💜 *QUANTO TEMPO?*\n\n▸ `1d` - 1 dia\n▸ `7d` - 7 dias\n▸ `30d` - 30 dias\n▸ `inf` - eterno" }, { quoted: msg })
        let expira = "inf"
        if (tempo !== "inf") {
          const v = parseInt(tempo)
          const u = tempo.slice(-1)
          let ms = 0
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
        await sock.sendMessage(jid, { text: "🌙💜 *NOBRE ADICIONADO*\n\n> _\"A força reconhece você.\"_\n\n👤 @" + num + "\n💜 *" + (tempo === "inf" ? "ETERNO ♾️" : tempo.toUpperCase()) + "*", mentions: [alvo] }, { quoted: msg })
      }
    },

    delvip: {
      aliases: ["rmvip", "removervip"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: "🌙💜 Use `!delvip @user`" }, { quoted: msg })
        const v = db.vips()
        if (!v.vips || !v.vips[alvo]) return sock.sendMessage(jid, { text: "🌙❌ *NÃO É VIP!*\n\n> _\"Meus olhos não erram.\"_\n\n👤 @" + utils.soNumero(alvo), mentions: [alvo] }, { quoted: msg })
        delete v.vips[alvo]
        db.salvarVips(v)
        await sock.sendMessage(jid, { text: "🌙🔥 *VIP REMOVIDO*\n\n> _\"Volte pro seu lugar.\"_\n\n👤 @" + utils.soNumero(alvo), mentions: [alvo] }, { quoted: msg })
      }
    },

    listavip: {
      aliases: ["vips", "vervips"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const v = db.vips()
        const vips = Object.entries(v.vips || {})
        if (!vips.length) return sock.sendMessage(jid, { text: "🌙💜 *NINGUÉM...*\n\n> _\"Nem eu tenho nobres.\"_\n\n_\"Que solidão...\"_" }, { quoted: msg })
        let txt = "🌙💜 *LISTA VIP:*\n\n"
        const mentions = []
        vips.forEach(([jidVip, info], i) => {
          const num = utils.soNumero(jidVip)
          const expira = info.expira === "inf" ? "♾️ Eterno" : new Date(info.expira).toLocaleString("pt-BR")
          txt += "▸ " + (i + 1) + ". @" + num + "\n   💜 " + expira + "\n\n"
          mentions.push(jidVip)
        })
        await sock.sendMessage(jid, { text: txt, mentions }, { quoted: msg })
      }
    },

    addsubdono: {
      aliases: ["addsub", "darsub"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: "🌙🔥 Use `!addsubdono @user`" }, { quoted: msg })
        const cfg = db.config()
        cfg.subdonos = cfg.subdonos || []
        const num = utils.soNumero(alvo)
        if (cfg.subdonos.some(s => utils.soNumero(s) === num)) return sock.sendMessage(jid, { text: "🌙 *JÁ É LUA SUPERIOR!*\n\n> _\"Meus olhos veem isso.\"_\n\n👤 @" + num, mentions: [alvo] }, { quoted: msg })
        cfg.subdonos.push(alvo)
        db.salvarConfig(cfg)
        await sock.sendMessage(jid, { text: "🌙🔥 *NOVA LUA SUPERIOR...*\n\n> _\"Você agora vê como eu vejo.\"_\n\n👤 @" + num, mentions: [alvo] }, { quoted: msg })
      }
    },

    delsubdono: {
      aliases: ["delsub", "rmsub", "rmsubdono"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: "🌙🔥 Use `!delsubdono @user`" }, { quoted: msg })
        const cfg = db.config()
        const num = utils.soNumero(alvo)
        cfg.subdonos = (cfg.subdonos || []).filter(s => utils.soNumero(s) !== num)
        db.salvarConfig(cfg)
        await sock.sendMessage(jid, { text: "🌙⚔️ *REBAIXADO...*\n\n> _\"Seus olhos se fecham agora.\"_\n\n👤 @" + num, mentions: [alvo] }, { quoted: msg })
      }
    },

    listasubdono: {
      aliases: ["subdonos", "listasub"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const cfg = db.config()
        const subs = cfg.subdonos || []
        if (!subs.length) return sock.sendMessage(jid, { text: "🌙🔥 *NINGUÉM...*\n\n> _\"Só eu vejo a verdade.\"_\n\n_\"Solidão...\"_" }, { quoted: msg })
        let txt = "🌙🔥 *LUAS SUPERIORES:*\n\n"
        const mentions = []
        subs.forEach((jidS, i) => {
          txt += "▸ " + (i + 1) + ". @" + utils.soNumero(jidS) + "\n"
          mentions.push(jidS)
        })
        await sock.sendMessage(jid, { text: txt, mentions }, { quoted: msg })
      }
    },

    prefixoglobal: {
      aliases: ["setprefixoglobal"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const p = args[0]
        if (!p || p.length > 3) return sock.sendMessage(jid, { text: "🌙⚙️ *FORMATO ERRADO!*\n\n> _\"Prefixo curto, por favor.\"_\n\n💡 `!prefixoglobal <prefixo>` (máx 3)" }, { quoted: msg })
        const cfg = db.config()
        cfg.prefixoGlobal = p
        db.salvarConfig(cfg)
        await sock.sendMessage(jid, { text: "🌙⚙️ *PREFIXO ATUALIZADO*\n\n> _\"A força muda de forma.\"_\n\n⚙️ Novo: `" + p + "`" }, { quoted: msg })
      }
    },

    slow: {
      aliases: ["modolento"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const opcao = (args[0] || "").toLowerCase()
        if (!["on", "off"].includes(opcao)) return sock.sendMessage(jid, { text: "🌙⚙️ Use `!slow on/off`" }, { quoted: msg })
        const cfg = db.config()
        cfg.slow = opcao === "on"
        db.salvarConfig(cfg)
        if (opcao === "on") await sock.sendMessage(jid, { text: "🌙😴 *MODO LENTO*\n\n> _\"Devagar...\"_\n\n⚙️ Status: *ON*" }, { quoted: msg })
        else await sock.sendMessage(jid, { text: "🌙🔥 *MODO RÁPIDO*\n\n> _\"Respiração... 3ª Forma: Aniquilação!\"_\n\n⚙️ Status: *OFF*" }, { quoted: msg })
      }
    },

    aluguel: {
      aliases: ["modoaluguel", "sistaluguel"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const opcao = (args[0] || "").toLowerCase()
        const a = db.aluguel()
        if (!["on", "off"].includes(opcao)) {
          return sock.sendMessage(jid, { text: "🌙💰 *ALUGUEL*\n\n📊 Status: *" + (a.ativo ? "ON ✅" : "OFF ❌") + "*\n\n💡 `!aluguel on/off`" }, { quoted: msg })
        }
        a.ativo = opcao === "on"
        db.salvarAluguel(a)
        await sock.sendMessage(jid, { text: opcao === "on"
          ? "🌙💰 *ALUGUEL ATIVADO*\n\n> _\"Meus olhos veem cada centavo.\"_"
          : "🌙💰 *LIBERADO GERAL*\n\n> _\"A força é generosa hoje.\"_"
        }, { quoted: msg })
      }
    },

    addaluguel: {
      aliases: ["davaluguel", "setaluguel"],
      grupoOnly: true,
      async executar({ sock, msg, args, db, utils }) {
        const jid = msg.key.remoteJid
        const tempoStr = args.join(" ").trim().toLowerCase()
        if (!tempoStr) return sock.sendMessage(jid, { text: "🌙💰 *QUANTO TEMPO?*\n\n▸ 1dia, 30min, 1mes..." }, { quoted: msg })
        const partes = tempoStr.split(/\s+/)
        let totalMs = 0
        for (const p of partes) {
          const m = p.match(/^(\d+)(min|h|dia|d|sem|mes|ano)$/)
          if (!m) continue
          const v = parseInt(m[1])
          const u = m[2]
          let ms = 0
          if (u === "min") ms = v * 60 * 1000
          else if (u === "h") ms = v * 60 * 60 * 1000
          else if (u === "d" || u === "dia") ms = v * 24 * 60 * 60 * 1000
          else if (u === "sem") ms = v * 7 * 24 * 60 * 60 * 1000
          else if (u === "mes") ms = v * 30 * 24 * 60 * 60 * 1000
          else if (u === "ano") ms = v * 365 * 24 * 60 * 60 * 1000
          totalMs += ms
        }
        if (totalMs <= 0) return sock.sendMessage(jid, { text: "🌙🔥 *FORMATO ERRADO!*\n\n> _\"Meus olhos não entendem isso.\"_" }, { quoted: msg })
        const a = db.aluguel()
        a.grupos = a.grupos || {}
        const agora = Date.now()
        const atual = (a.grupos[jid] > agora) ? a.grupos[jid] : agora
        a.grupos[jid] = atual + totalMs
        if (!a.ativo) a.ativo = true
        db.salvarAluguel(a)
        await sock.sendMessage(jid, { text: "🌙💰 *ALUGUEL ADICIONADO*\n\n⏰ Expira em: *" + utils.formatarTempo(a.grupos[jid] - agora) + "*\n\n> _\"Pague em dia, mortal.\"_" }, { quoted: msg })
      }
    },

    listaaluguel: {
      aliases: ["alugueis", "veralugueis"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const a = db.aluguel()
        const agora = Date.now()
        const entradas = Object.entries(a.grupos || {}).filter(e => e[1] > agora)
        if (!entradas.length) return sock.sendMessage(jid, { text: "🌙💰 *NADA ALUGADO*\n\n> _\"Nem eu cobro nada hoje.\"_\n\n_\"Aproveitem.\"_" }, { quoted: msg })
        let txt = "🌙💰 *TERRITÓRIOS ALUGADOS:*\n\n"
        for (const [jidG, exp] of entradas) {
          try {
            const meta = await sock.groupMetadata(jidG)
            txt += "🌙 *" + (meta.subject || "?") + "*\n⏰ " + utils.formatarTempo(exp - agora) + "\n\n"
          } catch (_) {
            txt += "🌙 `" + jidG + "`\n⏰ " + utils.formatarTempo(exp - agora) + "\n\n"
          }
        }
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    delaluguel: {
      aliases: ["rmaluguel", "removeraluguel"],
      async executar({ sock, msg, args, db }) {
        const jid = msg.key.remoteJid
        const a = db.aluguel()
        a.grupos = a.grupos || {}
        if (!args.length && jid.endsWith("@g.us")) {
          if (!a.grupos[jid]) return sock.sendMessage(jid, { text: "🌙❌ *SEM ALUGUEL*\n\n> _\"Meus olhos veem que tá vazio.\"_" }, { quoted: msg })
          delete a.grupos[jid]
          db.salvarAluguel(a)
          return sock.sendMessage(jid, { text: "🌙✅ *ALUGUEL REMOVIDO*\n\n> _\"Libertado.\"_" }, { quoted: msg })
        }
        await sock.sendMessage(jid, { text: "🌙💡 Use: `!delaluguel <nome>`\nOu em grupo: `!delaluguel`" }, { quoted: msg })
      }
    },

    banirgp: {
      aliases: ["bangp", "banirgrupo"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const b = db.bangp()
        b.grupos = b.grupos || {}
        b.grupos[jid] = true
        db.salvarBangp(b)
        await sock.sendMessage(jid, { text: "🌙🚫 *TERRITÓRIO BANIDO*\n\n> _\"Meus olhos não querem ver vocês.\"_\n> _\"Tchau.\"_" }, { quoted: msg })
      }
    },

    desbanirgp: {
      aliases: ["desbangp"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const b = db.bangp()
        if (b.grupos && b.grupos[jid]) {
          delete b.grupos[jid]
          db.salvarBangp(b)
          return sock.sendMessage(jid, { text: "🌙✅ *LIBERADO*\n\n> _\"Perdoado... uma vez.\"_\n\n_\"Aproveitem.\"_" }, { quoted: msg })
        }
        await sock.sendMessage(jid, { text: "🌙❌ *NÃO TÁ BANIDO*\n\n> _\"Você não presta atenção.\"_" }, { quoted: msg })
      }
    },

    listabangp: {
      aliases: ["gruposbanidos"],
      async executar({ sock, msg, db }) {
        const jid = msg.key.remoteJid
        const b = db.bangp()
        const grupos = Object.keys(b.grupos || {})
        if (!grupos.length) return sock.sendMessage(jid, { text: "🌙🚫 *NADA BANIDO...*\n\n> _\"Por enquanto.\"_\n\n_\"Mas fica de olho.\"_" }, { quoted: msg })
        let txt = "🌙🚫 *BANIDOS:*\n\n"
        grupos.forEach((g, i) => { txt += "▸ " + (i + 1) + ". `" + g + "`\n" })
        await sock.sendMessage(jid, { text: txt }, { quoted: msg })
      }
    },

    nuke: {
      aliases: ["explodir", "destruir"],
      async executar({ sock, msg, groupMetadata, utils }) {
        const jid = msg.key.remoteJid
        if (!jid.endsWith("@g.us")) return
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: "🌙💥 *PRECISO SER ADMIN!*\n\n> _\"Até a força precisa de permissão.\"_" }, { quoted: msg })
        await sock.sendMessage(jid, { text: "🌙💥 *LIMPEZA TOTAL...*\n\n> _\"Não olhe pra trás.\"_\n\n_\"Respiração... 3ª Forma: Aniquilação.\"_" }, { quoted: msg })
        const meta = await sock.groupMetadata(jid)
        const botNum = utils.soNumero(sock.user && sock.user.id)
        const alvos = meta.participants.filter(p => utils.soNumero(p.id) !== botNum).map(p => p.id)
        for (const a of alvos) {
          try { await sock.groupParticipantsUpdate(jid, [a], "remove") } catch (_) {}
          await new Promise(r => setTimeout(r, 500))
        }
      }
    },

    limpargp: {
      aliases: ["limpargrupo"],
      async executar({ sock, msg, groupMetadata, utils }) {
        const jid = msg.key.remoteJid
        if (!jid.endsWith("@g.us")) return
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: "🌙🧹 *PRECISO SER ADMIN!*\n\n> _\"Sério...\"_" }, { quoted: msg })
        await sock.sendMessage(jid, { text: "🌙🧹 *LIMPEZA...*\n\n> _\"O silêncio observa.\"_\n\n_\"Os indignos partem.\"_" }, { quoted: msg })
        const meta = await sock.groupMetadata(jid)
        const botNum = utils.soNumero(sock.user && sock.user.id)
        const alvos = meta.participants.filter(p => {
          if (utils.soNumero(p.id) === botNum) return false
          if (p.admin === "admin" || p.admin === "superadmin") return false
          return true
        }).map(p => p.id)
        for (const a of alvos) {
          try { await sock.groupParticipantsUpdate(jid, [a], "remove") } catch (_) {}
          await new Promise(r => setTimeout(r, 500))
        }
      }
    }

  }
}