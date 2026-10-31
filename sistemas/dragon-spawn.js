/* ============================================================
   🐉 SISTEMA DE SPAWN AUTOMÁTICO DE DRAGÕES
   ============================================================ */

const fs = require("fs")
const path = require("path")

const DATA_DIR = path.join(__dirname, "..", "data")

function dbLer(a, p = {}) {
  const f = path.join(DATA_DIR, a)
  if (!fs.existsSync(f)) { fs.writeFileSync(f, JSON.stringify(p, null, 2)); return p }
  try { return JSON.parse(fs.readFileSync(f, "utf8")) } catch { return p }
}
function dbSalvar(a, d) { fs.writeFileSync(path.join(DATA_DIR, a), JSON.stringify(d, null, 2)) }

const DRAGOES_SPAWN = {
  "Terror Terrível": { raridade: "Comum", foto: "https://files.catbox.moe/0055r7.jpg", hp: 100, energia: 50, atk: 10, def: 5, evasao: 10 },
  "Gronckle": { raridade: "Comum", foto: "https://files.catbox.moe/9yvvc5.jpg", hp: 150, energia: 40, atk: 15, def: 20, evasao: 5 },
  "Nadder Mortal": { raridade: "Comum", foto: "https://files.catbox.moe/762qus.jpg", hp: 120, energia: 60, atk: 18, def: 10, evasao: 15 },
  "Pesadelo Monstruoso": { raridade: "Raro", foto: "https://files.catbox.moe/g4ocxh.jpg", hp: 180, energia: 70, atk: 25, def: 15, evasao: 10 },
  "Ziperarrepiante": { raridade: "Raro", foto: "https://files.catbox.moe/yk9eic.jpg", hp: 160, energia: 65, atk: 22, def: 18, evasao: 12 },
  "Nadder Mortal (Tempestade)": { raridade: "Raro", foto: "https://files.catbox.moe/bwhqmc.jpg", hp: 140, energia: 75, atk: 24, def: 12, evasao: 18 },
  "Fúria da Noite": { raridade: "Épico", foto: "https://files.catbox.moe/06lj5i.jpg", hp: 200, energia: 90, atk: 35, def: 20, evasao: 25 },
  "Fúria da Luz": { raridade: "Épico", foto: "https://files.catbox.moe/vz770u.jpg", hp: 200, energia: 90, atk: 35, def: 20, evasao: 25 },
  "Corta-Tormenta": { raridade: "Épico", foto: "https://files.catbox.moe/js58qw.jpg", hp: 220, energia: 85, atk: 30, def: 25, evasao: 20 },
  "Morte Vermelha": { raridade: "Lendário", foto: "https://files.catbox.moe/45uete.jpg", hp: 400, energia: 120, atk: 50, def: 40, evasao: 10 },
  "Morte Gritante": { raridade: "Lendário", foto: "https://files.catbox.moe/lh62l3.jpg", hp: 450, energia: 130, atk: 55, def: 45, evasao: 8 },
  "Bewilderbeast": { raridade: "Lendário", foto: "https://files.catbox.moe/r47clm.jpg", hp: 500, energia: 150, atk: 60, def: 50, evasao: 5 },
  "Fúria da Noite (Asa de Titã)": { raridade: "Mítico", foto: "https://files.catbox.moe/r91204.jpg", hp: 600, energia: 200, atk: 80, def: 60, evasao: 30 }
}

function sortearDragao() {
  const roll = Math.random() * 100
  let raridadeAlvo = "Comum"
  if (roll < 0.1) raridadeAlvo = "Mítico"
  else if (roll < 5.1) raridadeAlvo = "Lendário"
  else if (roll < 15.1) raridadeAlvo = "Épico"
  else if (roll < 40.1) raridadeAlvo = "Raro"
  const candidatos = Object.entries(DRAGOES_SPAWN).filter(([_, d]) => d.raridade === raridadeAlvo)
  if (!candidatos.length) return null
  const [nome, dados] = candidatos[Math.floor(Math.random() * candidatos.length)]
  return { nome, ...dados }
}

let intervaloAtivo = null

function iniciar(sockGlobal, intervaloMs = 5 * 60 * 1000) {
  if (intervaloAtivo) return console.log("🐉 [DRAGÃO] Já está rodando.")

  intervaloAtivo = setInterval(async () => {
    if (!sockGlobal) return
    try {
      const cfg = dbLer("dragaocfg.json", { grupos: {} })
      const gruposAtivos = Object.entries(cfg.grupos || {}).filter(([_, c]) => c.ativo === true)
      if (!gruposAtivos.length) return

      const [jidGrupo] = gruposAtivos[Math.floor(Math.random() * gruposAtivos.length)]
      const dragao = sortearDragao()
      if (!dragao) return

      const sessoes = dbLer("dragoesessoes.json", {})
      sessoes[jidGrupo] = { dragao, timestamp: Date.now() }
      dbSalvar("dragoesessoes.json", sessoes)

      const emojiRaridade = { "Comum": "🟢", "Raro": "🔵", "Épico": "🟣", "Lendário": "🟡", "Mítico": "🔴" }[dragao.raridade] || "🐉"

      const texto = `🐉 • 𝐃𝐑𝐀𝐆𝐀̃𝐎 𝐀𝐏𝐀𝐑𝐄𝐂𝐄𝐔! •\n\n${emojiRaridade} *${dragao.nome}*\n🐍 Raridade: ${dragao.raridade}\n\n🌸 Vocês têm *1 minuto* pra domar!\n🐍 \`+domar ${dragao.nome}\`\n\n_"A serpente observa..."_ 🐍`

      try {
        const res = await fetch(dragao.foto, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } })
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer())
          if (buf.length > 1000) {
            await sockGlobal.sendMessage(jidGrupo, { image: buf, caption: texto })
          } else {
            throw new Error("Buffer vazio")
          }
        } else {
          throw new Error("HTTP " + res.status)
        }
      } catch (e) {
        await sockGlobal.sendMessage(jidGrupo, { text: texto })
        console.log("⚠️ [DRAGÃO] Falha ao baixar foto, enviou só texto:", e.message)
      }

      console.log(`\n🐉 [DRAGÃO SPAWN] ${dragao.nome} (${dragao.raridade}) em ${jidGrupo}\n`)

      setTimeout(() => {
        const s = dbLer("dragoesessoes.json", {})
        if (s[jidGrupo] && Date.now() - s[jidGrupo].timestamp >= 55000) {
          delete s[jidGrupo]
          dbSalvar("dragoesessoes.json", s)
          sockGlobal.sendMessage(jidGrupo, {
            text: `🐉 • 𝐅𝐔𝐆𝐈𝐔 •\n\n🌸 O ${dragao.nome} fugiu... ninguém o domou a tempo.\n\n_"A serpente lamenta."_ 🐍`
          }).catch(() => {})
        }
      }, 60000)
    } catch (e) {
      console.log("❌ [DRAGÃO SPAWN] Erro:", e.message)
    }
  }, intervaloMs)

  console.log("🐉 [DRAGÃO] Spawn automático iniciado (5min)")
}

module.exports = { iniciar, sortearDragao, DRAGOES_SPAWN }