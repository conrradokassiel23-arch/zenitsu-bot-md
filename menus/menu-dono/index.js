/* ============================================================
   🌙 MENU DONO - KOKUSHIBO BOT MD
   ============================================================ */

const fs = require("fs")
const path = require("path")
const os = require("os")
const { execSync } = require("child_process")

const DATA_DIR = path.join(__dirname, "..", "..", "data")
const REPO_URL = "https://github.com/conrradokassiel23-arch/zenitsu-bot-md"
const REPO_API = "https://api.github.com/repos/conrradokassiel23-arch/zenitsu-bot-md/commits/main"
const BOT_DIR = path.join(__dirname, "..", "..")

function dbLer(a, p = {}) {
  const f = path.join(DATA_DIR, a)
  if (!fs.existsSync(f)) { fs.writeFileSync(f, JSON.stringify(p, null, 2)); return p }
  try { return JSON.parse(fs.readFileSync(f, "utf8")) } catch { return p }
}
function dbSalvar(a, d) {
  fs.writeFileSync(path.join(DATA_DIR, a), JSON.stringify(d, null, 2))
}

module.exports = {
  menu: "menu-dono",
  grupoOnly: false,
  adminOnly: false,
  donoOnly: true,

  commands: {

    menudono: {
      aliases: ["dono", "comandosdono", "menud", "imperador"],
      async executar({ sock, msg, prefixoAtivo, db }) {
        const jid = msg.key.remoteJid
        const p = prefixoAtivo
        const cfg = db.config()
        const texto = "🌙👁️ *COMANDO DO LUA SUPERIOR* 👁️🌙\n\n" +
          "> _\"Vejo tudo... com meus 6 olhos.\"_\n" +
          "> _\"O que deseja, mestre?\"_\n\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "⚔️👁️ *EXÉRCITO*\n" +
          "▸ `" + p + "entrar` <link>\n" +
          "▸ `" + p + "botoff`\n" +
          "▸ `" + p + "reiniciar`\n" +
          "▸ `" + p + "reload`\n" +
          "▸ `" + p + "setfoto` (reply img/vídeo)\n" +
          "▸ `" + p + "atualizar`\n\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "💜 *NOBREZA*\n" +
          "▸ `" + p + "addvip` @user <tempo>\n" +
          "▸ `" + p + "delvip` @user\n" +
          "▸ `" + p + "listavip`\n\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "🌙 *LUAS SUPERIORES*\n" +
          "▸ `" + p + "addsubdono` @user\n" +
          "▸ `" + p + "delsubdono` @user\n" +
          "▸ `" + p + "listasubdono`\n\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "💰 *ALUGUEL*\n" +
          "▸ `" + p + "aluguel` on/off\n" +
          "▸ `" + p + "addaluguel` <tempo>\n" +
          "▸ `" + p + "listaaluguel`\n" +
          "▸ `" + p + "delaluguel` <nome>\n\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "⚙️ *AJUSTES*\n" +
          "▸ `" + p + "prefixoglobal` <s>\n" +
          "▸ `" + p + "slow` on/off\n\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "🚫 *PUNIÇÃO*\n" +
          "▸ `" + p + "banirgp`\n" +
          "▸ `" + p + "desbanirgp`\n" +
          "▸ `" + p + "listabangp`\n\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
          "💥 *APOCALIPSE*\n" +
          "▸ `" + p + "nuke`\n" +
          "▸ `" + p + "limpargp`\n\n" +
          "━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
          "> 🌙 _\"A lua conhece cada segredo.\"_\n" +
          "> ⚔️ _\"E não perdoa nenhum.\"_"

        if (cfg.fotoMenu) {
          const buf = Buffer.from(cfg.fotoMenu, "base64")
          if (cfg.tipoMenu === "video") return sock.sendMessage(jid, { video: buf, mimetype: "video/mp4", fileName: "kokushibo.mp4", gifPlayback: true, caption: texto }, { quoted: msg })
          return sock.sendMessage(jid, { image: buf, caption: texto }, { quoted: msg })
        }
        await sock.sendMessage(jid, { text: texto }, { quoted: msg })
      }
    },

    atualizar: {
      aliases: ["update", "git"],
      async executar({ sock, msg }) {
        const jid = msg.key.remoteJid
        let zipPath, extractDir
        await sock.sendMessage(jid, { text: "🌙🔄 *VERIFICANDO...*\n\n> 📡 _\"Meus olhos veem o GitHub...\"_" }, { quoted: msg })

        try {
          if (!fs.existsSync(DATA_DIR)) {
            try { fs.mkdirSync(DATA_DIR, { recursive: true }) } catch (e) {}
          }

          const apiResp = await fetch(REPO_API, { headers: { "User-Agent": "KokushiboBot" } })
          if (!apiResp.ok) throw new Error("GitHub respondeu " + apiResp.status)
          const apiData = await apiResp.json()
          const commitHash = apiData.sha
          const commitMsg = (apiData.commit && apiData.commit.message || "").split("\n")[0]
          const commitData = apiData.commit && apiData.commit.author && apiData.commit.author.date

          const commitSalvo = dbLer("ultimo_commit.json", { hash: null })
          console.log("🔍 Commit GitHub:", commitHash)
          console.log("🔍 Commit salvo:", commitSalvo.hash)

          if (commitSalvo.hash === commitHash) {
            return sock.sendMessage(jid, {
              text: "🌙✅ *TUDO EM ORDEM...*\n\n> 👁️ _\"Já está atualizado, mestre.\"_\n\n" +
                "📌 Commit: `" + commitHash.slice(0, 7) + "`\n" +
                "📝 _" + commitMsg + "_\n" +
                "📅 " + (commitData ? new Date(commitData).toLocaleString("pt-BR") : "?") + "\n\n" +
                "> 🌙 _\"Nada escapa dos meus olhos.\"_"
            }, { quoted: msg })
          }

          await sock.sendMessage(jid, {
            text: "🌙⚔️ *NOVO CONTEÚDO DETECTADO!*\n\n> _\"Meus 6 olhos captaram mudanças...\"_\n\n" +
              "📌 Commit: `" + commitHash.slice(0, 7) + "`\n" +
              "📝 _" + commitMsg + "_\n\n" +
              "📥 _Extraindo do reino lunar..._"
          }, { quoted: msg })

          const tmp = os.tmpdir()
          const id = Date.now()
          zipPath = path.join(tmp, "kokushibo_" + id + ".zip")
          extractDir = path.join(tmp, "kokushibo_" + id)

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
          console.log("💾 Commit salvo em:", commitPath)

          try { fs.unlinkSync(zipPath) } catch (_) {}
          try { fs.rmSync(extractDir, { recursive: true, force: true }) } catch (_) {}

          let reloadOk = false
          try {
            if (global.__carregarMenus) {
              global.__carregarMenus()
              reloadOk = true
              console.log("♻️ Menus recarregados com sucesso!")
            }
          } catch (e) { console.log("Aviso reload:", e.message) }

          await sock.sendMessage(jid, {
            text: "🌙✅ *ATUALIZAÇÃO CONCLUÍDA*\n\n> 👁️ _\"Meus 6 olhos assimilaram tudo.\"_\n\n" +
              "📌 Commit: `" + commitHash.slice(0, 7) + "`\n" +
              "📝 _" + commitMsg + "_\n\n" +
              "🔒 *Preservado:*\n" +
              "▸ `auth/` (sessão do WhatsApp)\n" +
              "▸ `data/` (dados do bot)\n" +
              "▸ `config.js`\n\n" +
              "━━━━━━━━━━━━━━━━━━━━━━\n" +
              (reloadOk ? "♻️ _Menus recarregados na hora!_\n\n> 🌙 _\"Nenhuma interrupção... a lua é eterna.\"_" : "⚠️ _Precisa reiniciar no painel._")
          }, { quoted: msg })

        } catch (e) {
          console.log("Erro atualizar:", e.message)
          try { if (zipPath) fs.unlinkSync(zipPath) } catch (_) {}
          try { if (extractDir) fs.rmSync(extractDir, { recursive: true, force: true }) } catch (_) {}
          await sock.sendMessage(jid, {
            text: "🌙💥 *FALHA NA ATUALIZAÇÃO!*\n\n⚠️ `" + e.message + "`\n\n> _\"Nem meus 6 olhos previram isso...\"_"
          }, { quoted: msg })
        }
      }
    },

    reload: {
      aliases: ["recarregar", "reloadmenus"],
      async executar({ sock, msg }) {
        const jid = msg.key.remoteJid
        try {
          if (global.__carregarMenus) {
            global.__carregarMenus()
            return sock.sendMessage(jid, { text: "🌙♻️ *RECARREGADO*\n\n> _\"Os olhos se renovam.\"_\n\n📊 Comandos: *" + (global.totalComandos || 0) + "*" }, { quoted: msg })
          }
          await sock.sendMessage(jid, { text: "🌙💢 O reload não tá disponível." }, { quoted: msg })
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
          await sock.sendMessage(jid, { text: "🌙🔄 *RENASCENDO...*\n\n> _\"Voltarei mais forte.\"_\n> _\"Assim como a lua.\"_\n\n♻️ Recarregando..." }, { quoted: msg })

          let ok = false
          if (global.__carregarMenus) {
            global.__carregarMenus()
            ok = true
          }

          if (ok) {
            await sock.sendMessage(jid, {
              text: "╔══════════════════════════════╗\n" +
                "║   🌙✅ 𝐑𝐄𝐍𝐀𝐒𝐂𝐈𝐃𝐎 ✅🌙\n" +
                "╚══════════════════════════════╝\n\n" +
                "> 👁️ _\"Como a lua, sempre volto.\"_\n" +
                "> _\"Com 6 olhos abertos.\"_\n\n" +
                "━━━━━━━━━━━━━━━━━━━━━━\n" +
                "📊 *Estado do Império:*\n" +
                "▸ ⚔️ Comandos: *" + (global.totalComandos || 0) + "*\n" +
                "▸ 🌙 Aliases: *" + (global.totalAliases || 0) + "*\n" +
                "▸ 👁️ Categorias: *" + Object.keys(global.comandosPorCategoria || {}).length + "*\n" +
                "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                "> 💜 _\"Respirando Lua Crescente...\"_"
            }, { quoted: msg })
          } else {
            await sock.sendMessage(jid, { text: "🌙⚠️ *RELOAD NÃO DISPONÍVEL*\n\n> _\"Não consegui renascer...\"_\n\n💡 Reinicia no painel da A4." }, { quoted: msg })
          }
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
          text: "🌙😴 *A LUA SE APAGA...*\n\n" +
            "> _\"Meus olhos se fecham...\"_\n" +
            "> _\"...mas a lua sempre volta.\"_\n\n" +
            "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
            "> 🌙 _\"Até a próxima noite, mestre.\"_\n" +
            "> 💤 _Zzzz..._"
        }, { quoted: msg })
        setTimeout(() => process.exit(0), 3000)
      }
    },

    entrar: {
      aliases: ["entrargp", "join", "joinlink"],
      async executar({ sock, msg, args }) {
        const jid = msg.key.remoteJid
        const link = args[0]
        if (!link) return sock.sendMessage(jid, { text: "🌙🤔 *ENTRAR ONDE?*\n\n> _\"Me dá o link, mestre.\"_\n\n💡 `!entrar <link>`" }, { quoted: msg })
        const match = link.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/)
        if (!match) return sock.sendMessage(jid, { text: "🌙⚔️ *ISSO NÃO É LINK!*\n\n> _\"Meus olhos veem a verdade.\"_" }, { quoted: msg })
        try {
          await sock.sendMessage(jid, { text: "🌙👁️ *ENTRANDO...*\n\n> _\"Meus 6 olhos estão atentos.\"_" }, { quoted: msg })
          const info = await sock.groupAcceptInvite(match[1])
          await sock.sendMessage(jid, { text: "🌙✅ *ENTREI!*\n\n> _\"A lua observa mais um território.\"_\n\n⚔️ `" + (typeof info === "string" ? info : "ok") + "`" }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: "🌙💥 *NÃO CONSEGUI!*\n\n> _\"Impossível... meus olhos falharam?\"_\n\n⚠️ " + e.message }, { quoted: msg })
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
            return sock.sendMessage(jid, { image: buffer, caption: "🌙✅ *ESTANDARTE SALVO*\n\n> _\"Meus 6 olhos gravaram.\"_\n\n🖼️ Foto do menu salva!" }, { quoted: msg })
          }
          const vidMsg = (msg.message && msg.message.videoMessage) ? msg : Object.assign({}, msg, { message: { videoMessage: quoted.videoMessage } })
          const vidBuffer = await utils.downloadMediaMessage(vidMsg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage })
          const ff = require("@ffmpeg-installer/ffmpeg").path
          const tmp = os.tmpdir()
          const tIn = path.join(tmp, "menu_" + Date.now() + ".mp4")
          const tOut = path.join(tmp, "menu_" + Date.now() + "_out.mp4")
          fs.writeFileSync(tIn, vidBuffer)
          execSync(`"${ff}" -y -i "${tIn}" -t 8 -vf "fps=15,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black" -an -c:v libx264 -preset fast -crf 28 -pix_fmt yuv420p -movflags +faststart "${tOut}"`, { stdio: "ignore" })
          const outBuffer = fs.readFileSync(tOut)
          cfg.fotoMenu = outBuffer.toString("base64")
          cfg.tipoMenu = "video"
          db.salvarConfig(cfg)
          try { fs.unlinkSync(tIn) } catch (_) {}
          try { fs.unlinkSync(tOut) } catch (_) {}
          await sock.sendMessage(jid, { video: outBuffer, mimetype: "video/mp4", fileName: "kokushibo.mp4", gifPlayback: true, caption: "🌙✅ *ESTANDARTE ANIMADO SALVO*\n\n> _\"Movimento também é arte.\"_\n\n🎬 Vídeo do menu salvo!" }, { quoted: msg })
        } catch (e) {
          await sock.sendMessage(jid, { text: "🌙💥 *ERRO!*\n\n> _\"Falha nos olhos...\"_\n\n⚠️ " + e.message }, { quoted: msg })
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
        await sock.sendMessage(jid, { text: "🌙💜 *NOBRE ADICIONADO*\n\n> _\"A lua reconhece você.\"_\n\n👤 @" + num + "\n💜 *" + (tempo === "inf" ? "ETERNO ♾️" : tempo.toUpperCase()) + "*", mentions: [alvo] }, { quoted: msg })
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
        await sock.sendMessage(jid, { text: "🌙⚔️ *VIP REMOVIDO*\n\n> _\"Volte pro seu lugar.\"_\n\n👤 @" + utils.soNumero(alvo), mentions: [alvo] }, { quoted: msg })
      }
    },

    listavip: {
      aliases: ["vips", "vervips"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const v = db.vips()
        const vips = Object.entries(v.vips || {})
        if (!vips.length) return sock.sendMessage(jid, { text: "🌙💜 *NINGUÉM...*\n\n> _\"Nem a lua tem nobres.\"_\n\n_\"Que solidão...\"_" }, { quoted: msg })
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
        if (!alvo) return sock.sendMessage(jid, { text: "🌙👁️ Use `!addsubdono @user`" }, { quoted: msg })
        const cfg = db.config()
        cfg.subdonos = cfg.subdonos || []
        const num = utils.soNumero(alvo)
        if (cfg.subdonos.some(s => utils.soNumero(s) === num)) return sock.sendMessage(jid, { text: "🌙 *JÁ É LUA SUPERIOR!*\n\n> _\"Meus olhos veem isso.\"_\n\n👤 @" + num, mentions: [alvo] }, { quoted: msg })
        cfg.subdonos.push(alvo)
        db.salvarConfig(cfg)
        await sock.sendMessage(jid, { text: "🌙👁️ *NOVA LUA SUPERIOR...*\n\n> _\"Você agora vê como eu vejo.\"_\n\n👤 @" + num, mentions: [alvo] }, { quoted: msg })
      }
    },

    delsubdono: {
      aliases: ["delsub", "rmsub", "rmsubdono"],
      async executar({ sock, msg, db, utils }) {
        const jid = msg.key.remoteJid
        const alvo = utils.getAlvo(msg)
        if (!alvo) return sock.sendMessage(jid, { text: "🌙👁️ Use `!delsubdono @user`" }, { quoted: msg })
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
        if (!subs.length) return sock.sendMessage(jid, { text: "🌙👁️ *NINGUÉM...*\n\n> _\"Só eu vejo a verdade.\"_\n\n_\"Solidão lunar...\"_" }, { quoted: msg })
        let txt = "🌙👁️ *LUAS SUPERIORES:*\n\n"
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
        await sock.sendMessage(jid, { text: "🌙⚙️ *PREFIXO ATUALIZADO*\n\n> _\"A lua muda de forma.\"_\n\n⚙️ Novo: `" + p + "`" }, { quoted: msg })
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
        if (opcao === "on") await sock.sendMessage(jid, { text: "🌙😴 *MODO LENTO*\n\n> _\"Como a lua, devagar...\"_\n\n⚙️ Status: *ON*" }, { quoted: msg })
        else await sock.sendMessage(jid, { text: "🌙⚔️ *MODO RÁPIDO*\n\n> _\"Respiração da Lua Crescente!\"_\n\n⚙️ Status: *OFF*" }, { quoted: msg })
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
          : "🌙💰 *LIBERADO GERAL*\n\n> _\"A lua é generosa hoje.\"_"
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
        if (totalMs <= 0) return sock.sendMessage(jid, { text: "🌙⚔️ *FORMATO ERRADO!*\n\n> _\"Meus olhos não entendem isso.\"_" }, { quoted: msg })
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
        if (!entradas.length) return sock.sendMessage(jid, { text: "🌙💰 *NADA ALUGADO*\n\n> _\"Nem a lua cobra nada hoje.\"_\n\n_\"Aproveitem.\"_" }, { quoted: msg })
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
          return sock.sendMessage(jid, { text: "🌙✅ *ALUGUEL REMOVIDO*\n\n> _\"Libertado pela lua.\"_" }, { quoted: msg })
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
        await sock.sendMessage(jid, { text: "🌙🚫 *TERRITÓRIO BANIDO*\n\n> _\"Meus 6 olhos não querem ver vocês.\"_\n> _\"Tchau.\"_" }, { quoted: msg })
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
          return sock.sendMessage(jid, { text: "🌙✅ *LIBERADO*\n\n> _\"A lua perdoa... uma vez.\"_\n\n_\"Aproveitem.\"_" }, { quoted: msg })
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
        if (!utils.botEhAdmin(groupMetadata, sock)) return sock.sendMessage(jid, { text: "🌙💥 *PRECISO SER ADMIN!*\n\n> _\"Até os 6 olhos precisam de permissão.\"_" }, { quoted: msg })
        await sock.sendMessage(jid, { text: "🌙💥 *LUZ LUNAR DESTRUTIVA...*\n\n> _\"Não olhe pra trás.\"_\n\n_\"Respiração da Lua Cheia.\"_" }, { quoted: msg })
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
        await sock.sendMessage(jid, { text: "🌙🧹 *LIMPEZA LUNAR...*\n\n> _\"A lua observa em silêncio.\"_\n\n_\"Os indignos partem.\"_" }, { quoted: msg })
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