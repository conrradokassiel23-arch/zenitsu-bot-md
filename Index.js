/* ============================================================
   🔥 RIMURU BOT MD - INDEX COMPLETO
   @itsliaaa/baileys + BOTÕES + BEM-VINDO + AUTO-RESTART + AUTO ENTRAR
   ============================================================ */

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestWaWebVersion,
  downloadMediaMessage
} = require('@itsliaaa/baileys');

const pino = require('pino');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');
const os = require('os');
const { execSync } = require('child_process');
const NodeCache = require('node-cache');
const config = require('./config');

// ============================================================
// 🆕 AUTO-RESPAWN (O BOT REINICIA SOZINHO)
// ============================================================
if (!process.env.RIMURU_CHILD) {
  const { fork } = require('child_process');
  function iniciarFilho() {
    const filho = fork(__filename, [], {
      env: { ...process.env, RIMURU_CHILD: '1' },
      stdio: 'inherit'
    });
    filho.on('exit', (code) => {
      if (code === 0) {
        console.log('\n♻️ [AUTO-RESTART] Reiniciando o bot...\n');
        setTimeout(() => iniciarFilho(), 1000);
      } else {
        console.log(`\n💤 [AUTO-RESTART] Bot encerrado (código ${code}). Sem restart.\n`);
        process.exit(code);
      }
    });
    filho.on('error', (err) => {
      console.error('❌ [AUTO-RESTART] Erro no filho:', err.message);
      setTimeout(() => iniciarFilho(), 2000);
    });
  }
  iniciarFilho();
  return;
}

process.on('uncaughtException', (err) => console.error('⚠️ [SISTEMA] Uncaught Exception:', err?.message || err));
process.on('unhandledRejection', (reason) => console.error('⚠️ [SISTEMA] Unhandled Rejection:', reason?.message || reason));

const DATA_DIR = path.join(__dirname, "data");
const MENUS_DIR = path.join(__dirname, "menus");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

const groupCache = new NodeCache({ stdTTL: 5 * 60, useClones: false });

// ============================================================
// 📁 BOOTSTRAP E DB
// ============================================================
function bootstrap() {
  const pastas = [
    DATA_DIR, MENUS_DIR, path.join(MENUS_DIR, "menu-adm"), path.join(MENUS_DIR, "menu-dono"),
    path.join(MENUS_DIR, "menu-vip"), path.join(MENUS_DIR, "menu-rpg"), path.join(MENUS_DIR, "menu-fazenda"),
    path.join(MENUS_DIR, "menu-fnaf"), path.join(MENUS_DIR, "menu-cidade")
  ];
  for (const pasta of pastas) {
    if (!fs.existsSync(pasta)) {
      try { fs.mkdirSync(pasta, { recursive: true }); } catch (e) {}
    }
  }
  const arquivoCidadeJson = path.join(DATA_DIR, "cidade.json");
  if (!fs.existsSync(arquivoCidadeJson)) {
    try { fs.writeFileSync(arquivoCidadeJson, JSON.stringify({ usuarios: {}, casas: {}, predios: {} }, null, 2)); } catch (e) {}
  }
}
bootstrap();

function dbLer(arquivo, padrao = {}) {
  const p = path.join(DATA_DIR, arquivo);
  if (!fs.existsSync(p)) { fs.writeFileSync(p, JSON.stringify(padrao, null, 2)); return padrao; }
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return padrao; }
}
function dbSalvar(arquivo, dados) { fs.writeFileSync(path.join(DATA_DIR, arquivo), JSON.stringify(dados, null, 2)); }

const db = {
  grupos: () => dbLer("grupos.json", {}), salvarGrupos: (d) => dbSalvar("grupos.json", d),
  advs: () => dbLer("advs.json", {}), salvarAdvs: (d) => dbSalvar("advs.json", d),
  config: () => dbLer("config.json", { fotoMenu: null, prefixoGlobal: null, slow: false, subdonos: [], nomeBot: "Rimuru", fotoCmd: null, tipoFotoCmd: null, audioMenu: null }),
  salvarConfig: (d) => dbSalvar("config.json", d),
  canal: () => dbLer("canal.json", { jid: null, nome: null, link: null }), salvarCanal: (d) => dbSalvar("canal.json", d),
  listanegra: () => dbLer("listanegra.json", {}), salvarListanegra: (d) => dbSalvar("listanegra.json", d),
  aluguel: () => dbLer("aluguel.json", { ativo: false, grupos: {} }), salvarAluguel: (d) => dbSalvar("aluguel.json", d),
  parcerias: () => dbLer("parcerias.json", {}), salvarParcerias: (d) => dbSalvar("parcerias.json", d),
  avisos: () => dbLer("avisos.json", {}), salvarAvisos: (d) => dbSalvar("avisos.json", d),
  afk: () => dbLer("afk.json", {}), salvarAfk: (d) => dbSalvar("afk.json", d),
  mutados: () => dbLer("mutados.json", {}), salvarMutados: (d) => dbSalvar("mutados.json", d),
  palavroes: () => dbLer("palavroes.json", {}), salvarPalavroes: (d) => dbSalvar("palavroes.json", d),
  subadmins: () => dbLer("subadmins.json", {}), salvarSubadmins: (d) => dbSalvar("subadmins.json", d),
  vips: () => dbLer("vips.json", { vips: {} }), salvarVips: (d) => dbSalvar("vips.json", d),
  bangp: () => dbLer("bangp.json", { grupos: {} }), salvarBangp: (d) => dbSalvar("bangp.json", d),
  rpg: () => dbLer("rpg.json", { usuarios: {} }), salvarRpg: (d) => dbSalvar("rpg.json", d),
  autocfg: () => dbLer("autocfg.json", { grupos: {} }), salvarAutocfg: (d) => dbSalvar("autocfg.json", d)
};

// ============================================================
// 🛠️ HELPERS
// ============================================================
function getAlvo(msg) {
  const ctx = (msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo) ||
              (msg.message && msg.message.imageMessage && msg.message.imageMessage.contextInfo) ||
              (msg.message && msg.message.videoMessage && msg.message.videoMessage.contextInfo) || {};
  const mentions = ctx.mentionedJid || [];
  if (mentions.length) return mentions[0];
  if (ctx.participant) return ctx.participant;
  return null;
}
function soNumero(jid) {
  if (!jid) return "";
  if (typeof jid === "object") jid = jid.phoneNumber || jid.id || "";
  return String(jid).split("@")[0].split(":")[0].replace(/\D/g, "");
}
function getTexto(msg) {
  return (msg.message && msg.message.conversation) ||
         (msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.text) ||
         (msg.message && msg.message.imageMessage && msg.message.imageMessage.caption) ||
         (msg.message && msg.message.videoMessage && msg.message.videoMessage.caption) || "";
}
function getTextoBotao(msg) {
  try {
    if (msg.message && msg.message.buttonsResponseMessage) return msg.message.buttonsResponseMessage.selectedButtonId || "";
    if (msg.message && msg.message.templateButtonReplyMessage) return msg.message.templateButtonReplyMessage.selectedId || "";
    if (msg.message && msg.message.listResponseMessage) return msg.message.listResponseMessage.singleSelectReply && msg.message.listResponseMessage.singleSelectReply.selectedRowId || "";
  } catch (_) {}
  return "";
}
function naListaNegra(jidGrupo, jidOuNum) { const num = soNumero(jidOuNum); if (!num) return false; return (db.listanegra()[jidGrupo] || []).includes(num); }
function aluguelAtivo() { return db.aluguel().ativo === true; }
function grupoTemAluguel(jid) { const a = db.aluguel(); const exp = a.grupos && a.grupos[jid]; return exp && Date.now() < exp; }
function formatarTempo(ms) {
  const s = Math.floor(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60), d = Math.floor(h / 24);
  if (d > 0) return d + "d " + (h % 24) + "h";
  if (h > 0) return h + "h " + (m % 60) + "min";
  if (m > 0) return m + "min " + (s % 60) + "s";
  return s + "s";
}
function adicionarAviso(grupoJid, userJid, tipo) {
  const avisos = db.avisos();
  avisos[grupoJid] = avisos[grupoJid] || {};
  const num = soNumero(userJid);
  avisos[grupoJid][num] = avisos[grupoJid][num] || {};
  avisos[grupoJid][num][tipo] = (avisos[grupoJid][num][tipo] || 0) + 1;
  db.salvarAvisos(avisos);
  return avisos[grupoJid][num][tipo];
}
function limparAvisos(grupoJid, userJid, tipo) {
  const avisos = db.avisos();
  const num = soNumero(userJid);
  if (avisos[grupoJid] && avisos[grupoJid][num] && avisos[grupoJid][num][tipo]) {
    avisos[grupoJid][num][tipo] = 0;
    db.salvarAvisos(avisos);
  }
}
function ehSubAdmin(jidGrupo, jidUser) {
  const subs = db.subadmins()[jidGrupo] || [];
  const num = soNumero(jidUser);
  return subs.some(s => soNumero(s) === num);
}
function botEhAdmin(meta, sock) {
  if (!meta) return false;
  const botIds = [sock.user && sock.user.id, sock.user && sock.user.lid, sock.user && sock.user.jid].filter(Boolean).map(soNumero);
  const botPart = meta.participants.find(p => {
    const ids = [p.id, p.lid, p.phoneNumber].filter(Boolean).map(soNumero);
    return ids.some(id => botIds.includes(id));
  });
  return botPart && (botPart.admin === "admin" || botPart.admin === "superadmin");
}
function dataBrasil() { return new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).split("/").reverse().join("-"); }
function horaBrasil() { return new Date().toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit", hour12: false }); }

// ============================================================
// 🧠 INTELIGÊNCIA DE COMANDOS
// ============================================================
function levenshtein(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
      else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
    }
  }
  return matrix[b.length][a.length];
}
function buscarComandoParecido(comandoErrado) {
  let melhor = null; let menorDistancia = 999;
  const todos = [...comandos.keys(), ...aliases.keys()];
  for (const cmd of todos) {
    const dist = levenshtein(comandoErrado, cmd);
    if (dist < menorDistancia) { menorDistancia = dist; melhor = cmd; }
  }
  if (menorDistancia <= 3 && melhor) return melhor;
  return null;
}

// ============================================================
// 🎨 IA & AUTOMAÇÕES
// ============================================================
async function processarIA(sock, msg, remetente, sender, isGrupo, db) {
  if (isGrupo) {
    const conf = db.grupos()[remetente] || {};
    if (!conf.iaAtiva) return false;
  }
  const texto = getTexto(msg);
  if (!texto) return false;

  const botNum = soNumero(sock.user?.id);
  const botNome = (db.config().nomeBot || "Rimuru").toLowerCase();
  const ctx = msg.message?.extendedTextMessage?.contextInfo || {};
  const mentionedJid = ctx.mentionedJid || [];

  const mencionadoPorId = mentionedJid.some(j => soNumero(j) === botNum);
  const mencionadoPorTexto = texto.toLowerCase().includes("@" + botNome) || texto.toLowerCase().includes("@" + botNome.replace(/\s+/g, ""));
  const respondendoBot = ctx.participant && soNumero(ctx.participant) === botNum;

  if (!mencionadoPorId && !respondendoBot && !mencionadoPorTexto) return false;

  let pergunta = texto.replace(/@\d+/g, "").replace(new RegExp("@" + botNome, "gi"), "").replace(new RegExp(botNome, "gi"), "").trim();
  if (!pergunta) pergunta = "Oi";

  try {
    await sock.sendPresenceUpdate("composing", remetente);
    const promptSistema = encodeURIComponent(`Você é o ${db.config().nomeBot || "Rimuru"}, um bot de WhatsApp estilo anime/inspirado em Tensei Shitara Slime. Responda de forma curta, direta e com personalidade. Use emojis às vezes (💧❄️🧊). Não seja muito formal. O usuário disse: ${pergunta}`);
    const response = await fetch(`https://text.pollinations.ai/${promptSistema}`, { method: 'GET', headers: { 'Content-Type': 'text/plain' }, signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error("Erro na API da IA");
    const resposta = await response.text();
    if (resposta && resposta.trim()) await sock.sendMessage(remetente, { text: resposta.trim() }, { quoted: msg });
    else await sock.sendMessage(remetente, { text: "❄️ Não consegui pensar em nada..." }, { quoted: msg });
    return true;
  } catch (e) {
    console.log("❌ Erro IA:", e.message);
    return true;
  }
}

async function processarAutoFig(sock, msg, remetente, isGrupo) {
  if (!isGrupo) return false;
  const conf = (db.autocfg().grupos && db.autocfg().grupos[remetente]) || {};
  if (!conf.autofig) return false;
  const temImg = msg.message && msg.message.imageMessage;
  const temVid = msg.message && msg.message.videoMessage;
  if (!temImg && !temVid) return false;
  try {
    const sharp = require("sharp");
    const ff = require("@ffmpeg-installer/ffmpeg").path;
    const buf = await downloadMediaMessage(msg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage });
    let wp;
    if (temImg) wp = await sharp(buf).resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 90 }).toBuffer();
    else {
      const tIn = path.join(os.tmpdir(), "af_" + Date.now() + ".mp4");
      const tOut = path.join(os.tmpdir(), "af_" + Date.now() + ".webp");
      fs.writeFileSync(tIn, buf);
      execSync(`"${ff}" -y -i "${tIn}" -vcodec libwebp -filter:v "fps=15,scale=512:512:force_original_aspect_ratio=decrease" -lossless 0 -compression_level 6 -q:v 50 -loop 0 -preset default -an -vsync 0 -s 512:512 "${tOut}"`, { stdio: "ignore" });
      wp = fs.readFileSync(tOut);
      try { fs.unlinkSync(tIn); } catch (_) {}
      try { fs.unlinkSync(tOut); } catch (_) {}
    }
    await sock.sendMessage(remetente, { sticker: wp }, { quoted: msg });
    return true;
  } catch (e) { return false; }
}

async function processarAutoTtk(sock, msg, remetente, isGrupo) {
  if (!isGrupo) return false;
  const conf = (db.autocfg().grupos && db.autocfg().grupos[remetente]) || {};
  if (!conf.autottk) return false;
  const texto = getTexto(msg);
  if (!texto) return false;
  const match = texto.match(/https?:\/\/(www\.|vm\.|vt\.)?tiktok\.com\/[^\s]+/i);
  if (!match) return false;
  try {
    const r = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(match[0])}&hd=1`);
    const d = await r.json();
    if (d.code !== 0 || !d.data || !d.data.play) return false;
    const vid = await fetch(d.data.play);
    const buffer = Buffer.from(await vid.arrayBuffer());
    if (buffer.length > 16 * 1024 * 1024) {
      await sock.sendMessage(remetente, { text: "❄️ Vídeo muito grande (max 16MB)" }, { quoted: msg });
      return true;
    }
    await sock.sendMessage(remetente, { video: buffer, mimetype: "video/mp4", fileName: "tiktok.mp4" }, { quoted: msg });
    return true;
  } catch (e) { return false; }
}

// ============================================================
// 📦 CARREGADOR DE MENUS
// ============================================================
const comandos = new Map();
const aliases = new Map();
global.rendasAutomaticas = global.rendasAutomaticas || [];

function carregarMenus() {
  comandos.clear(); aliases.clear(); global.rendasAutomaticas = [];
  if (!fs.existsSync(MENUS_DIR)) return;
  const pastas = fs.readdirSync(MENUS_DIR);
  for (const pasta of pastas) {
    const caminhoPasta = path.join(MENUS_DIR, pasta);
    if (!fs.statSync(caminhoPasta).isDirectory()) continue;
    const arquivos = fs.readdirSync(caminhoPasta).filter(f => f.endsWith(".js"));
    for (const arq of arquivos) {
      const arquivo = path.join(caminhoPasta, arq);
      try {
        delete require.cache[require.resolve(arquivo)];
        const mod = require(arquivo);
        if (!mod.commands) continue;
        if (typeof mod.rendaAutomatica === "function") global.rendasAutomaticas.push(mod.rendaAutomatica);
        const menuCfg = { grupoOnly: mod.grupoOnly || false, adminOnly: mod.adminOnly || false, donoOnly: mod.donoOnly || false };
        for (const [nome, cmd] of Object.entries(mod.commands)) {
          const pacote = {
            nome, aliases: cmd.aliases || [], categoria: mod.menu || pasta,
            grupoOnly: cmd.grupoOnly !== undefined ? cmd.grupoOnly : menuCfg.grupoOnly,
            adminOnly: cmd.adminOnly !== undefined ? cmd.adminOnly : menuCfg.adminOnly,
            donoOnly: cmd.donoOnly !== undefined ? cmd.donoOnly : menuCfg.donoOnly,
            executar: cmd.executar
          };
          comandos.set(nome.toLowerCase(), pacote);
          for (const a of pacote.aliases) aliases.set(a.toLowerCase(), nome.toLowerCase());
        }
      } catch (e) { console.log("Erro ao carregar " + pasta + "/" + arq + ":", e.message); }
    }
  }
  const categorias = {};
  for (const [nome, cmd] of comandos.entries()) { const cat = cmd.categoria || "outros"; categorias[cat] = (categorias[cat] || 0) + 1; }
  global.totalComandos = comandos.size; global.totalAliases = aliases.size; global.comandosPorCategoria = categorias;
  global.__carregarMenus = carregarMenus;
  console.log("\n🔥 Bot carregou " + comandos.size + " comandos e " + aliases.size + " aliases...\n");
}
function getComando(n) { if (comandos.has(n)) return comandos.get(n); if (aliases.has(n)) return comandos.get(aliases.get(n)); return null; }

let canalCache = null;
function recarregarCanal() { canalCache = db.canal(); }
function envolverSendMessage(sock) {
  const original = sock.sendMessage.bind(sock);
  sock.sendMessage = async (jid, content, options = {}) => {
    try {
      const temBotoes = content && (content.buttons || content.sections || content.templateButtons || content.buttonText || content.interactiveButtons || content.listMessage);
      if (temBotoes || options.edit || options.ignorarCanal) return original(jid, content, options);
      if (!canalCache) recarregarCanal();
      const c = canalCache;
      if (c && c.jid && c.jid !== "0@newsletter") {
        content.contextInfo = content.contextInfo || {};
        content.contextInfo.forwardedNewsletterMessageInfo = { newsletterJid: c.jid, newsletterName: c.nome || "Canal", serverMessageId: 0 };
        content.contextInfo.forwardingScore = 1; content.contextInfo.isForwarded = true;
      }
    } catch (_) {}
    return original(jid, content, options);
  };
}

// ============================================================
// 🔥 COMANDOS SEM PREFIXO + BOTÕES
// ============================================================
async function processarComandoSemPrefixo(sock, msg, remetente, sender, isGrupo, isDono, isSubDono) {
  if (!isGrupo) return false;
  if (msg.key.fromMe) return false;
  try {
    const textoOriginal = getTexto(msg).trim();
    if (!textoOriginal) return false;
    const texto = textoOriginal.toLowerCase();
    const cfg = db.config();
    const nomeBot = (cfg.nomeBot || "rimuru").toLowerCase().trim();
    if (!nomeBot) return false;

    const textoSemEspaco = texto.replace(/\s+/g, " ");
    const nomeSemEspaco = nomeBot.replace(/\s+/g, "");
    let comando = null;
    let apenasNome = false;

    if (textoSemEspaco.startsWith(nomeBot)) {
      const resto = textoSemEspaco.slice(nomeBot.length).trim();
      if (resto === "fecha") comando = "fecha";
      else if (resto === "abre") comando = "abre";
      else if (resto === "") apenasNome = true;
    }
    if (!comando && !apenasNome) {
      const textoSemEspacoTotal = texto.replace(/\s+/g, "");
      if (textoSemEspacoTotal.startsWith(nomeSemEspaco)) {
        const resto = textoSemEspacoTotal.slice(nomeSemEspaco.length);
        if (resto === "fecha") comando = "fecha";
        else if (resto === "abre") comando = "abre";
        else if (resto === "") apenasNome = true;
      }
    }

    if (apenasNome) {
      const h = parseInt(new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", hour12: false }));
      let saud, emoji;
      if (h >= 5 && h < 12) { saud = "Bom dia"; emoji = "🌅" }
      else if (h >= 12 && h < 18) { saud = "Boa tarde"; emoji = "☀️" }
      else { saud = "Boa noite"; emoji = "🌙" }

      const numUser = soNumero(sender);
      const nomeExibicao = db.config().nomeBot || "Rimuru";

      const textoMenu = `${emoji} *${saud}, @${numUser}!* 🌸

🐍 Sou o *${nomeExibicao}*.

╭━━━〔 🐍 𝐎 𝐐𝐔𝐄 𝐃𝐄𝐒𝐄𝐉𝐀? 🐍 〕━━━╮
┃
┃ *1* — 🌸 Menu Principal
┃ *2* — 🐍 Comandos de Admin
┃ *3* — 🌸 Comandos de Dono
┃ *4* — 🐍 Comandos VIP
┃ *5* — 🌸 Jogos (RPG/Fazenda/Cidade/FNAF)
┃ *6* — 🐍 Meu Prefixo
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

💡 *Toque no botão* ou responda com o número.

_"A serpente observa."_ 🐍`;

      try {
        await sock.sendMessage(remetente, {
          text: textoMenu,
          footer: nomeExibicao,
          mentions: [sender],
          buttons: [
            { buttonId: "1", buttonText: { displayText: "🌸 Menu Principal" }, type: 1 },
            { buttonId: "2", buttonText: { displayText: "🐍 Admin" }, type: 1 },
            { buttonId: "3", buttonText: { displayText: "🌸 Dono" }, type: 1 }
          ],
          headerType: 1
        }, { quoted: msg });
        return true;
      } catch (e) {
        console.log("⚠️ Botão falhou, fallback texto:", e.message);
        await sock.sendMessage(remetente, { text: textoMenu, mentions: [sender] }, { quoted: msg });
        return true;
      }
    }

    if (!comando) return false;

    let ehAdmin = false;
    try {
      const meta = await sock.groupMetadata(remetente);
      const p = meta.participants.find(x => x.id === sender || soNumero(x.id) === soNumero(sender) || soNumero(x.lid) === soNumero(sender));
      ehAdmin = p && (p.admin === "admin" || p.admin === "superadmin");
    } catch (e) {}

    if (!ehAdmin && !isDono && !isSubDono) {
      await sock.sendMessage(remetente, { text: "❄️ *SEM PERMISSÃO*\n\n> _\"Meus olhos veem que você não é admin.\"_" }, { quoted: msg });
      return true;
    }

    if (comando === "fecha") {
      try {
        await sock.groupSettingUpdate(remetente, "announcement");
        await sock.sendMessage(remetente, { text: "❄️🔒 *GRUPO FECHADO*\n\n> _\"Só os dignos falam.\"_\n\n⚔️ _Respiração... Aniquilação._" }, { quoted: msg });
      } catch (e) { await sock.sendMessage(remetente, { text: "❄️ *Erro ao fechar:* " + e.message }, { quoted: msg }); }
      return true;
    }

    if (comando === "abre") {
      try {
        await sock.groupSettingUpdate(remetente, "not_announcement");
        await sock.sendMessage(remetente, { text: "❄️🔓 *GRUPO ABERTO*\n\n> _\"Respirem, mortais.\"_\n\n⚔️ _Lua Crescente..._" }, { quoted: msg });
      } catch (e) { await sock.sendMessage(remetente, { text: "❄️ *Erro ao abrir:* " + e.message }, { quoted: msg }); }
      return true;
    }
  } catch (e) {}
  return false;
}

async function processarFigCmd(sock, msg, remetente, sender, isGrupo, isDono, isSubDono) {
  if (!isGrupo) return false;
  if (msg.key.fromMe) return false;
  if (!msg.message || !msg.message.stickerMessage) return false;

  try {
    const dbFig = dbLer("figcmd.json", {});
    const grupo = dbFig[remetente] || {};
    if (!Object.keys(grupo).length) return false;

    const buf = await downloadMediaMessage(msg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage });
    if (!buf || !buf.length) return false;
    const hash = crypto.createHash("md5").update(buf).digest("hex");
    const dados = grupo[hash];
    if (!dados) return false;

    const cmdExecutar = getComando(dados.comando);
    if (!cmdExecutar) return false;

    let groupMetadata = null; let isAdmin = false;
    try {
      groupMetadata = await sock.groupMetadata(remetente);
      const p = groupMetadata.participants.find(x => x.id === sender || soNumero(x.id) === soNumero(sender) || soNumero(x.lid) === soNumero(sender));
      isAdmin = p && (p.admin === "admin" || p.admin === "superadmin");
    } catch (_) {}

    const ehSub = ehSubAdmin(remetente, sender);
    const podeAdmin = isAdmin || isDono || isSubDono;

    if (cmdExecutar.donoOnly && !isDono && !isSubDono) return true;
    if (cmdExecutar.adminOnly && !podeAdmin) return true;

    try {
      await cmdExecutar.executar({
        sock, msg, args: [], sender, isGrupo, isAdmin, isDono, isSubDono, ehSub, podeAdmin, groupMetadata, config,
        prefixoAtivo: db.config().prefixoGlobal || config.prefixo || "+",
        db,
        utils: { getAlvo, soNumero, getTexto, downloadMediaMessage, recarregarCanal, naListaNegra, aluguelAtivo, grupoTemAluguel, formatarTempo, adicionarAviso, limparAvisos, DATA_DIR, botEhAdmin, dbLer, dbSalvar, getTextoBotao, ehSubAdmin }
      });
    } catch (e) {}
    return true;
  } catch (e) { return false; }
}

// ============================================================
// ⏰ AGENDAMENTOS
// ============================================================
const ultimoAgendamento = {};
function iniciarAgendamentos() {
  setInterval(async () => {
    if (!global.sockGlobal) return;
    try {
      const agora = horaBrasil();
      const dataHoje = dataBrasil();
      const grupos = db.grupos();
      let alterou = false;

      for (const [jid, conf] of Object.entries(grupos)) {
        if (!jid.endsWith("@g.us")) continue;

        if (conf.abrirHora === agora && conf.ultimoAbrir !== dataHoje) {
          const chaveAbrir = `${jid}_abrir_${dataHoje}_${agora}`;
          if (ultimoAgendamento[chaveAbrir]) continue;
          ultimoAgendamento[chaveAbrir] = true;
          try {
            await global.sockGlobal.groupSettingUpdate(jid, "not_announcement");
            const legenda = (conf.legendaAbrir && conf.legendaAbrir.trim()) || "Território aberto!";
            if (conf.fotoAbrir) await global.sockGlobal.sendMessage(jid, { image: Buffer.from(conf.fotoAbrir, "base64"), caption: legenda });
            else await global.sockGlobal.sendMessage(jid, { text: legenda });
            conf.ultimoAbrir = dataHoje;
            alterou = true;
          } catch (e) {}
        }

        if (conf.fecharHora === agora && conf.ultimoFechar !== dataHoje) {
          const chaveFechar = `${jid}_fechar_${dataHoje}_${agora}`;
          if (ultimoAgendamento[chaveFechar]) continue;
          ultimoAgendamento[chaveFechar] = true;
          try {
            await global.sockGlobal.groupSettingUpdate(jid, "announcement");
            const legenda = (conf.legendaFechar && conf.legendaFechar.trim()) || "Território fechado!";
            if (conf.fotoFechar) await global.sockGlobal.sendMessage(jid, { image: Buffer.from(conf.fotoFechar, "base64"), caption: legenda });
            else await global.sockGlobal.sendMessage(jid, { text: legenda });
            conf.ultimoFechar = dataHoje;
            alterou = true;
          } catch (e) {}
        }
      }

      if (alterou) db.salvarGrupos(grupos);

      for (const chave of Object.keys(ultimoAgendamento)) {
        if (!chave.includes(dataHoje)) delete ultimoAgendamento[chave];
      }
    } catch (e) {}
  }, 30000);
}

// ============================================================
// 🆕 RENDAS AUTOMÁTICAS
// ============================================================
function iniciarRendasAutomaticas() {
  setInterval(async () => {
    if (!global.sockGlobal) return;
    for (const fn of global.rendasAutomaticas) {
      try { await fn(global.sockGlobal, db); } catch (e) {}
    }
  }, 60 * 1000);
}

function iniciarVerificadorDivs() {
  setInterval(() => {
    try {
      const divsPath = path.join(DATA_DIR, "divulgacoes.json")
      if (!fs.existsSync(divsPath)) return
      const divs = JSON.parse(fs.readFileSync(divsPath, "utf8"))
      if (!divs.lista || !divs.lista.length) return
      let alterou = false
      const listaAtualizada = []
      for (const d of divs.lista) {
        if (d.expiraEm <= Date.now()) {
          console.log(`\n⚠️ [AVISO DONO] A divulgação (ID: ${d.id}) EXPIROU e foi removida!\n`)
          alterou = true
        } else {
          listaAtualizada.push(d)
        }
      }
      if (alterou) {
        divs.lista = listaAtualizada
        fs.writeFileSync(divsPath, JSON.stringify(divs, null, 2))
      }
    } catch (e) {}
  }, 60000)
}

// ============================================================
// 🚀 START
// ============================================================
async function iniciarBot() {
  carregarMenus();
  iniciarAgendamentos();
  iniciarRendasAutomaticas();
  iniciarVerificadorDivs();

  const { state, saveCreds } = await useMultiFileAuthState("auth");
  
  let version;
  try {
    const versionInfo = await fetchLatestWaWebVersion({});
    version = versionInfo.version;
  } catch (err) {
    console.warn("⚠️ Falha ao buscar versão do WA Web, usando fallback.");
    version = undefined;
  }

  let qrOption = false;
  let connectionMethod = 'qr';
  let numeroCompleto = '';

  if (!state.creds.registered) {
    console.clear();
    console.log(`
╔════════════════════════════════════════════════╗
│       📱 PAINEL DE CONEXÃO UNIVERSAL 📱        │
╠════════════════════════════════════════════════╣
│                                                │
│  [1] 🔑 Conectar via Pareamento (Pairing Code) │
│  [2] 🖼️  Conectar via Código QR (QR Code)      │
│  [3] 🚪 Sair                                   │
│                                                │
╚════════════════════════════════════════════════╝
`);
    const opcao = await question("👉 Selecione o método (1-3): ");

    switch (opcao.trim()) {
      case '1': connectionMethod = 'pairing'; break;
      case '2': connectionMethod = 'qr'; qrOption = true; break;
      case '3': process.exit(0); break;
      default: return iniciarBot();
    }

    if (connectionMethod === 'pairing') {
      const ddi = await question("🌐 Digite o DDI (ex: 55): ");
      const numero = await question("📱 Digite o DDD + Número (Apenas números): ");
      numeroCompleto = `${ddi.replace(/\D/g, '')}${numero.replace(/\D/g, '')}`;
    }
  }

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: qrOption,
    auth: state,
    browser: ["Windows", "Chrome", "10.0.22631"],
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000,
    keepAliveIntervalMs: 30000,
    syncFullHistory: false,
    shouldSyncHistoryMessage: (msg) => (msg && msg.syncType) !== 2,
    cachedGroupMetadata: async (jid) => groupCache.get(jid)
  });

  global.sockGlobal = sock;
  recarregarCanal();
  envolverSendMessage(sock);

  sock.ev.on('groups.update', async ([event]) => {
    try { const metadata = await sock.groupMetadata(event.id); groupCache.set(event.id, metadata); } catch (_) {}
  });

  sock.ev.on('group-participants.update', async (event) => {
    try {
      const { id: jid, participants, action } = event;
      if (!jid || !jid.endsWith('@g.us')) return;
      if (!participants || !participants.length) return;
      if (action !== 'add' && action !== 'remove') return;

      const grupos = db.grupos();
      const conf = grupos[jid] || {};

      if (action === 'add' && conf.bemvindo !== true) return;
      if (action === 'remove' && !conf.legendasaiu && !conf.fundosaiu) return;

      const nomeBot = db.config().nomeBot || 'Rimuru Bot';
      const meta = await sock.groupMetadata(jid).catch(() => null);
      const nomeGrupo = meta?.subject || 'o grupo';
      if (meta) groupCache.set(jid, meta);

      for (const p of participants) {
        let jidParticipante = typeof p === 'object' ? (p.id || p.phoneNumber || p.lid) : p;
        if (!jidParticipante) continue;
        if (!String(jidParticipante).includes('@')) jidParticipante = String(jidParticipante) + '@s.whatsapp.net';

        const num = soNumero(jidParticipante);
        if (!num) continue;

        if (action === 'add') {
          const textoPadrao = `💧 Bem-vindo(a) ao grupo, @${num}!\n\n❄️ Leia as regras e aproveite.\n\n_"${nomeBot}"_`;
          const texto = (conf.textobv && conf.textobv.trim()) ? conf.textobv.replace(/%nmr%/g, '@' + num).replace(/%grupo%/g, nomeGrupo) : textoPadrao;
          const mentions = [jidParticipante];
          try {
            if (conf.fundobv) {
              const buf = Buffer.from(conf.fundobv, 'base64');
              await sock.sendMessage(jid, { image: buf, caption: texto, mentions }, {});
            } else {
              await sock.sendMessage(jid, { text: texto, mentions }, {});
            }
          } catch (e) { console.log('❌ Erro bem-vindo:', e.message); }
        }

        if (action === 'remove') {
          const textoPadrao = `💧 @${num} saiu do grupo...\n\n❄️ _"Até a próxima."_\n\n_${nomeBot}_`;
          const texto = (conf.legendasaiu && conf.legendasaiu.trim()) ? conf.legendasaiu.replace(/%nmr%/g, '@' + num).replace(/%grupo%/g, nomeGrupo) : textoPadrao;
          const mentions = [jidParticipante];
          try {
            if (conf.fundosaiu) {
              const buf = Buffer.from(conf.fundosaiu, 'base64');
              await sock.sendMessage(jid, { image: buf, caption: texto, mentions }, {});
            } else {
              await sock.sendMessage(jid, { text: texto, mentions }, {});
            }
          } catch (e) { console.log('❌ Erro saiu:', e.message); }
        }
      }
    } catch (e) {
      console.log('❌ Erro group-participants.update:', e.message);
    }
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, qr, lastDisconnect } = update;

    if (qr && connectionMethod === 'pairing' && numeroCompleto && !sock.authState.creds.registered) {
      try {
        const code = await sock.requestPairingCode(numeroCompleto);
        console.log(`\n🔑 CÓDIGO DE PAREAMENTO: ${code}\n`);
      } catch (err) {
        console.error("❌ Erro ao solicitar código:", err.message);
      }
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode !== DisconnectReason.loggedOut) {
        setTimeout(() => iniciarBot(), 5000);
      }
    } else if (connection === 'open') {
      console.log('\n========================================');
      console.log('✅ BOT CONECTADO E OTIMIZADO COM SUCESSO!');
      console.log('========================================\n');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    try {
      if (type !== 'notify') return;
      const msg = messages[0];
      if (!msg.message) return;

      const remetente = msg.key.remoteJid;
      const isGrupo = remetente.endsWith('@g.us');
      if (!isGrupo) return;

      let senderRaw = msg.key.participant;
      let sender = senderRaw;

      if (senderRaw && senderRaw.endsWith("@lid")) {
        if (msg.key && msg.key.participantPn) sender = msg.key.participantPn;
        else if (msg.key && msg.key.participantAlt) sender = msg.key.participantAlt;
        else {
          try {
            const meta = await sock.groupMetadata(remetente).catch(() => null);
            if (meta) {
              const p = meta.participants.find(x => x.lid === senderRaw || x.id === senderRaw || (x.lid && soNumero(x.lid) === soNumero(senderRaw)));
              if (p && p.phoneNumber) sender = p.phoneNumber;
              else if (p && p.id && !p.id.endsWith("@lid")) sender = p.id;
            }
          } catch (_) {}
        }
      }

      const numerosDono = (Array.isArray(config.dono) ? config.dono : [config.dono]).map(soNumero);
      const senderCandidatos = [sender, senderRaw, msg.key && msg.key.participant, msg.key && msg.key.participantPn, msg.key && msg.key.participantLid, msg.key && msg.key.remoteJid, msg.participant, sock.user && sock.user.id, sock.user && sock.user.lid].filter(Boolean);
      const senderNums = senderCandidatos.map(soNumero).filter(Boolean);
      const isDono = msg.key.fromMe === true || senderNums.some(n => numerosDono.includes(n));

      const cfgSub = db.config();
      const numerosSub = (cfgSub.subdonos || []).map(soNumero);
      const isSubDono = senderNums.some(n => numerosSub.includes(n)) && !isDono;

      if (!isDono && !isSubDono) {
        const b = db.bangp();
        if (b.grupos && b.grupos[remetente]) return;
      }

      // 🆕 AUTO ENTRAR (SILENCIOSO NO GRUPO, APENAS NO CONSOLE)
      if (!msg.key.fromMe) {
        const txt = getTexto(msg)
        const temLink = txt.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/)
        const cfgAuto = db.config()
        
        if (temLink && cfgAuto.autoEntrar === true) {
          const codigo = temLink[1]
          console.log(`\n🔗 [AUTO ENTRAR] Link detectado! Tentando entrar no grupo...`)
          try {
            await sock.groupAcceptInvite(codigo)
            console.log(`✅ [AUTO ENTRAR] Entrou no grupo com sucesso! (Aviso enviado apenas no console)`)
            // Removida a mensagem no grupo para ficar silencioso
          } catch (e) {
            console.log(`❌ [AUTO ENTRAR] Falha ao entrar:`, e.message)
          }
        }
      }

      if (!msg.key.fromMe && isGrupo) {
        const btnId = getTextoBotao(msg);
        if (btnId && /^[1-6]$/.test(String(btnId))) {
          const prefixo = db.config().prefixoGlobal || config.prefixo || "+";
          const mapaMenus = { "1": "menu", "2": "menuadmin", "3": "menudono", "4": "menuvip", "5": "menurpg", "6": "prefixo" };
          const cmdAlvo = mapaMenus[btnId];
          if (cmdAlvo) {
            const cmdObj = getComando(cmdAlvo);
            if (cmdObj) {
              try {
                await cmdObj.executar({
                  sock, msg, args: [], sender, isGrupo, isAdmin: false, isDono, isSubDono, ehSub: false, podeAdmin: isDono || isSubDono,
                  groupMetadata: groupCache.get(remetente), config, prefixoAtivo: prefixo, db,
                  utils: { getAlvo, soNumero, getTexto, downloadMediaMessage, recarregarCanal, naListaNegra, aluguelAtivo, grupoTemAluguel, formatarTempo, adicionarAviso, limparAvisos, DATA_DIR, botEhAdmin, dbLer, dbSalvar, getTextoBotao, ehSubAdmin }
                });
                return;
              } catch (e) { console.log("❌ Erro botão:", e.message); }
            }
          }
        }
      }

      if (!msg.key.fromMe && isGrupo) {
        const txt = getTexto(msg).trim();
        const ctxInfo = msg.message?.extendedTextMessage?.contextInfo || {};
        const respondendoBot = ctxInfo.participant && soNumero(ctxInfo.participant) === soNumero(sock.user?.id);
        if (/^[1-6]$/.test(txt) && respondendoBot) {
          const prefixo = db.config().prefixoGlobal || config.prefixo || "+";
          const mapaMenus = { "1": "menu", "2": "menuadmin", "3": "menudono", "4": "menuvip", "5": "menurpg", "6": "prefixo" };
          const cmdAlvo = mapaMenus[txt];
          if (cmdAlvo) {
            const cmdObj = getComando(cmdAlvo);
            if (cmdObj) {
              try {
                await cmdObj.executar({
                  sock, msg, args: [], sender, isGrupo, isAdmin: false, isDono, isSubDono, ehSub: false, podeAdmin: isDono || isSubDono,
                  groupMetadata: groupCache.get(remetente), config, prefixoAtivo: prefixo, db,
                  utils: { getAlvo, soNumero, getTexto, downloadMediaMessage, recarregarCanal, naListaNegra, aluguelAtivo, grupoTemAluguel, formatarTempo, adicionarAviso, limparAvisos, DATA_DIR, botEhAdmin, dbLer, dbSalvar, getTextoBotao, ehSubAdmin }
                });
                return;
              } catch (e) { console.log("❌ Erro menu numérico:", e.message); }
            }
          }
        }
      }

      if (!msg.key.fromMe) {
        const feito = await processarComandoSemPrefixo(sock, msg, remetente, sender, isGrupo, isDono, isSubDono);
        if (feito) return;
      }

      if (!msg.key.fromMe) {
        const feito = await processarFigCmd(sock, msg, remetente, sender, isGrupo, isDono, isSubDono);
        if (feito) return;
      }

      if (!msg.key.fromMe) {
        const feito = await processarIA(sock, msg, remetente, sender, isGrupo, db);
        if (feito) return;
      }

      if (!msg.key.fromMe) {
        try {
          const confAuto = (db.autocfg().grupos && db.autocfg().grupos[remetente]) || {};
          if (confAuto.autottk) { const feito = await processarAutoTtk(sock, msg, remetente, isGrupo); if (feito) return; }
          if (confAuto.autofig) { const feito = await processarAutoFig(sock, msg, remetente, isGrupo); if (feito) return; }
        } catch (e) {}
      }

      if (!msg.key.fromMe) {
        try {
          const grupos = db.grupos();
          const conf = grupos[remetente] || {};
          if (conf.rpgAtivo === true) {
            const rpg = db.rpg();
            const dataHoje = dataBrasil();
            const num = soNumero(sender);
            rpg.usuarios = rpg.usuarios || {};
            rpg.usuarios[num] = rpg.usuarios[num] || { moedas: 0 };
            if (rpg.usuarios[num].ultimoGanho !== dataHoje) {
              rpg.usuarios[num].moedas = (rpg.usuarios[num].moedas || 0) + 100;
              rpg.usuarios[num].ultimoGanho = dataHoje;
              db.salvarRpg(rpg);
              await sock.sendMessage(remetente, { text: "💧💰 Gold diario! +100 pra @" + num + "\nSaldo: " + rpg.usuarios[num].moedas, mentions: [sender] });
            }
          }
        } catch (_) {}
      }

      if (aluguelAtivo() && !isDono && !isSubDono && !grupoTemAluguel(remetente)) return;

      if (!msg.key.fromMe) {
        const cands = [sender, msg.key && msg.key.participantPn, msg.key && msg.key.participantLid].filter(Boolean);
        if (cands.some(j => naListaNegra(remetente, j))) {
          try { await sock.sendMessage(remetente, { delete: msg.key }); } catch (_) {}
          try { await sock.groupParticipantsUpdate(remetente, [sender], "remove"); } catch (_) {}
          return;
        }
      }

      if (!msg.key.fromMe) {
        const grupos = db.grupos();
        const conf = grupos[remetente] || {};
        let meta = groupCache.get(remetente);
        if (!meta) {
          meta = await sock.groupMetadata(remetente).catch(() => null);
          if (meta) groupCache.set(remetente, meta);
        }

        const senderCands = [sender, senderRaw, msg.key && msg.key.participant, msg.key && msg.key.participantPn, msg.key && msg.key.participantLid, msg.key && msg.key.remoteJid].filter(Boolean).map(soNumero);
        const isAdm = meta && meta.participants.find(p => {
          const pIds = [p.id, p.lid, p.phoneNumber].filter(Boolean).map(soNumero);
          return senderCands.some(cand => pIds.includes(cand));
        });
        const ehAdmin = isAdm && (isAdm.admin === "admin" || isAdm.admin === "superadmin");
        const ehSub = ehSubAdmin(remetente, sender);
        const podeBurlar = ehAdmin || isDono || isSubDono || ehSub;

        const mutados = db.mutados();
        const mutadosG = mutados[remetente] || {};
        let jidMutado = null;
        for (const c of senderCands) {
          for (const j of Object.keys(mutadosG)) { if (soNumero(j) === soNumero(c) && mutadosG[j] > Date.now()) { jidMutado = j; break; } }
          if (jidMutado) break;
        }
        if (jidMutado && !podeBurlar) { try { await sock.sendMessage(remetente, { delete: msg.key }); } catch (_) {} return; }

        if (conf.palavrao && !podeBurlar) {
          const lista = db.palavroes()[remetente] || [];
          const normalizar = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
          const textoNorm = normalizar(getTexto(msg));

          const temPalavrao = lista.some(p => {
            const pl = normalizar(p);
            if (!pl) return false;
            const regex = new RegExp(`(^|\\s)${pl}($|\\s)`, "i");
            return regex.test(textoNorm);
          });

          if (lista.length && textoNorm && temPalavrao) {
            try { await sock.sendMessage(remetente, { delete: msg.key }); } catch (_) {}
            const n = adicionarAviso(remetente, sender, "palavrao");
            if (n >= 3) {
              limparAvisos(remetente, sender, "palavrao");
              await sock.sendMessage(remetente, { text: "@" + soNumero(sender) + " 3/3 palavras proibidas!", mentions: [sender] });
              try { await sock.groupParticipantsUpdate(remetente, [sender], "remove"); } catch (_) {}
            } else {
              await sock.sendMessage(remetente, { text: "@" + soNumero(sender) + " palavra proibida - " + n + "/3", mentions: [sender] });
            }
            return;
          }
        }

        const afks = db.afk();
        const afkGrupo = afks[remetente] || {};
        let jidAfk = null;
        for (const c of senderCands) { for (const j of Object.keys(afkGrupo)) { if (soNumero(j) === soNumero(c)) { jidAfk = j; break; } } if (jidAfk) break; }
        if (jidAfk && afkGrupo[jidAfk]) {
          const info = afkGrupo[jidAfk];
          const tempo = formatarTempo(Date.now() - info.desde);
          delete afkGrupo[jidAfk]; afks[remetente] = afkGrupo; db.salvarAfk(afks);
          await sock.sendMessage(remetente, { text: "💧 @" + soNumero(jidAfk) + " voltou! Ficou AFK " + tempo, mentions: [jidAfk] });
        }

        const ctx = msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo || {};
        const mencionados = ctx.mentionedJid || [];
        for (const m of mencionados) {
          for (const [j, info] of Object.entries(afkGrupo)) {
            if (soNumero(j) === soNumero(m)) {
              const tempo = formatarTempo(Date.now() - info.desde);
              await sock.sendMessage(remetente, { text: "💧❄️ AFK: @" + soNumero(j) + "\nHa " + tempo + "\nMotivo: " + info.motivo, mentions: [j] });
            }
          }
        }

        const textoMsg = getTexto(msg);
        const linkGrupo = /(chat\.whatsapp\.com|wa\.me\/)/i.test(textoMsg);

        if (linkGrupo && !podeBurlar) {
          const parcerias = db.parcerias();
          const p = parcerias[remetente] || {};
          const parceiros = p.parceiros || {};
          const modoParceria = p.ativo === true;

          if (modoParceria) {
            let encontrado = null;
            for (const [jidP, info] of Object.entries(parceiros)) {
              if (senderCands.some(cand => cand === soNumero(jidP))) { encontrado = info; break; }
            }

            if (encontrado && encontrado.usados < encontrado.total) {
              encontrado.usados++;
              db.salvarParcerias(parcerias);
              const restantes = encontrado.total - encontrado.usados;
              const extra = restantes === 0 ? "⚠️ *Esse foi o seu último link de hoje!*" : `✨ Ainda tem *${restantes}* link(s) restante(s).`;
              try {
                await sock.sendMessage(remetente, {
                  text: `💧 • 𝐀𝐋𝐈𝐀𝐍𝐂̧𝐀 𝐀𝐏𝐑𝐎𝐕𝐀𝐃𝐀 •\n\n╭─〔 ❄️ 𝐀𝐂𝐄𝐒𝐒𝐎 𝐋𝐈𝐁𝐄𝐑𝐀𝐃𝐎 〕\n│ @${soNumero(sender)}, o link foi autorizado!\n╰──────────────\n\n📊 𝐔𝐬𝐨:\n╰➜ ${encontrado.usados}/${encontrado.total} links enviados.\n\n${extra}\n\n"${db.config().nomeBot || "Rimuru Bot"}"`,
                  mentions: [sender]
                });
              } catch (_) {}
              return;
            }

            if (encontrado && encontrado.usados >= encontrado.total) {
              try { await sock.sendMessage(remetente, { delete: msg.key }); } catch (_) {}
              try {
                await sock.sendMessage(remetente, {
                  text: `💧 • 𝐋𝐈𝐌𝐈𝐓𝐄 𝐀𝐓𝐈𝐍𝐆𝐈𝐃𝐎 •\n\n╭─〔 🚫 𝐋𝐈𝐍𝐊 𝐀𝐏𝐀𝐆𝐀𝐃𝐎 〕\n│ @${soNumero(sender)}, você já usou todos os seus links de hoje.\n╰──────────────\n\n📊 𝐔𝐬𝐨:\n╰➜ ${encontrado.usados}/${encontrado.total} links enviados.\n\n⏰ *VOLTE AMANHÃ* para enviar mais links!\n\n"${db.config().nomeBot || "Rimuru Bot"}"`,
                  mentions: [sender]
                });
              } catch (e) { console.log("Erro aviso limite:", e.message); }
              return;
            }

            try { await sock.sendMessage(remetente, { delete: msg.key }); } catch (_) {}
            const admins = meta ? meta.participants.filter(pa => pa.admin === "admin" || pa.admin === "superadmin").map(pa => pa.id) : [];
            let listaAdmins = "";
            admins.forEach(a => { listaAdmins += `@${soNumero(a)} `; });

            try {
              await sock.sendMessage(remetente, {
                text: `💧 • 𝐀𝐕𝐈𝐒𝐎 𝐃𝐄 𝐋𝐈𝐍𝐊 •\n\n╭─〔 🚫 𝐋𝐈𝐍𝐊 𝐀𝐏𝐀𝐆𝐀𝐃𝐎 〕\n│ @${soNumero(sender)}, link apagado por falta de parceria.\n╰──────────────\n\n👑 *ADMINS:* ${listaAdmins}\n\n👉 *SOLUÇÃO:* Use o comando abaixo para solicitar uma parceria:\n╰➜ \`+parceria\`\n\n"${db.config().nomeBot || "Rimuru Bot"}"`,
                mentions: [sender, ...admins]
              });
            } catch (e) { console.log("Erro aviso link grupo:", e.message); }
            return;
          }
        }

        const linkGeral = /(https?:\/\/|www\.|\.com|\.net|\.br|\.io|\.org|\.xyz|\.tv|\.me|\.gg)/i.test(textoMsg);

        if (conf.antilink && !podeBurlar) {
          if (linkGeral && !linkGrupo) {
            try { await sock.sendMessage(remetente, { delete: msg.key }); } catch (_) {}
            const n = adicionarAviso(remetente, sender, "link");
            if (n >= 3) {
              limparAvisos(remetente, sender, "link");
              await sock.sendMessage(remetente, {
                text: `💧 • 𝐄𝐗𝐏𝐔𝐋𝐒𝐎 •\n\n╭─〔 💀 𝐀𝐌𝐄𝐀𝐂̧𝐀 〕\n│ @${soNumero(sender)} atingiu 3/3 avisos.\n╰──────────────\n\n> _"Veldora, cuide disso."_\n\n"${db.config().nomeBot || "Rimuru Bot"}"`,
                mentions: [sender]
              });
              try { await sock.groupParticipantsUpdate(remetente, [sender], "remove"); } catch (_) {}
            } else {
              await sock.sendMessage(remetente, {
                text: `💧 • 𝐀𝐍𝐓𝐈-𝐋𝐈𝐍𝐊 •\n\n╭─〔 🐉 𝐈𝐍𝐓𝐄𝐑𝐂𝐄𝐏𝐓𝐀𝐃𝐎 〕\n│ @${soNumero(sender)}, links não são permitidos aqui.\n╰──────────────\n\n⚠️ 𝐀𝐯𝐢𝐬𝐨𝐬:\n╰➜ ${n}/3\n\n"${db.config().nomeBot || "Rimuru Bot"}"`,
                mentions: [sender]
              });
            }
            return;
          }
        }

        const antimap = [
          { cond: conf.antiaudio && msg.message && msg.message.audioMessage, tipo: "audio", nome: "Audio" },
          { cond: conf.antivideo && msg.message && msg.message.videoMessage, tipo: "video", nome: "Video" },
          { cond: conf.antifoto && msg.message && msg.message.imageMessage, tipo: "foto", nome: "Foto" },
          { cond: conf.antifig && msg.message && msg.message.stickerMessage, tipo: "fig", nome: "Figurinha" }
        ];
        for (const a of antimap) {
          if (a.cond && !podeBurlar) {
            const n = adicionarAviso(remetente, sender, a.tipo);
            try { await sock.sendMessage(remetente, { delete: msg.key }); } catch (_) {}
            if (n >= 3) {
              limparAvisos(remetente, sender, a.tipo);
              await sock.sendMessage(remetente, { text: "@" + soNumero(sender) + " 3/3 " + a.nome + "s!", mentions: [sender] });
              try { await sock.groupParticipantsUpdate(remetente, [sender], "remove"); } catch (_) {}
            } else {
              await sock.sendMessage(remetente, { text: a.nome + "! " + n + "/3", mentions: [sender] });
            }
            return;
          }
        }
      }

      const hoje = dataBrasil();
      const cfgAll = db.config();
      if (cfgAll.ultimoReset !== hoje) {
        const parceriasAll = db.parcerias();
        for (const jid of Object.keys(parceriasAll)) {
          const p = parceriasAll[jid];
          if (p && p.parceiros) for (const jidP of Object.keys(p.parceiros)) p.parceiros[jidP].usados = 0;
        }
        db.salvarParcerias(parceriasAll);
        cfgAll.ultimoReset = hoje;
        db.salvarConfig(cfgAll);
      }

      const grupos = db.grupos();
      const confGrupo = grupos[remetente] || {};
      const cfgGlobal = db.config();

      const prefixoGlobal = cfgGlobal.prefixoGlobal || config.prefixo || "+";
      let prefixosAtivos;
      if (confGrupo.multiprefixo && confGrupo.prefixo) prefixosAtivos = [confGrupo.prefixo];
      else prefixosAtivos = [prefixoGlobal];

      let texto = getTexto(msg);

      const btnId2 = getTextoBotao(msg);
      if (btnId2) {
        texto = btnId2.replace(new RegExp("^\\" + prefixoGlobal + "+"), prefixoGlobal);
      }

      let prefixoUsado = prefixosAtivos.find(p => texto.startsWith(p));
      let cmdName = "";
      let args = [];

      if (prefixoUsado) {
        const partes = texto.slice(prefixoUsado.length).trim().split(/\s+/);
        cmdName = partes[0];
        args = partes.slice(1);
      } else {
        const partes = texto.trim().split(/\s+/);
        const primeira = (partes[0] || "").toLowerCase();
        if (primeira === "prefixo") {
          cmdName = "prefixo";
          args = partes.slice(1);
          prefixoUsado = "";
        } else return;
      }

      if (cmdName.toLowerCase() === "prefixo") {
        const p = prefixoGlobal;
        const numUser = soNumero(sender);
        const nomeBot = db.config().nomeBot || "Rimuru Bot";
        const mencoes = sender ? [sender] : [];
        const textoBase = `💜 • 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐂̧𝐀̃𝐎 •\n\n╭─〔 🦄 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 〕\n│ Olá @${numUser}, este é o meu prefixo.\n╰──────────────\n\n🫟 𝐏𝐫𝐞𝐟𝐢𝐱𝐨 𝐀𝐭𝐮𝐚𝐥:\n╰➜ 『 ${p} 』\n\n💡 Para usar meus comandos, digite:\n╰➜ ${p}menu\n\n💜 _"Use com sabedoria."_\n\n"${nomeBot}"`;
        await sock.sendMessage(remetente, { text: textoBase, mentions: mencoes, ignorarCanal: true }, { quoted: msg });
        return;
      }

      const cmd = getComando(cmdName.toLowerCase());
      if (!cmd) {
        const p = prefixoUsado || prefixoGlobal;
        const cmdLimpo = (cmdName || "").trim().toLowerCase();

        const VARIACOES_CMD_ERRADO = [
          { topo: "💧 • 𝐂𝐎𝐌𝐀𝐍𝐃𝐎 𝐍𝐀̃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎 •", aviso: "O comando informado não foi reconhecido.", frase: "💡 Verifique a escrita e tente novamente!" },
          { topo: "💧 • 𝐂𝐎𝐌𝐀𝐍𝐃𝐎 𝐈𝐍𝐕𝐀́𝐋𝐈𝐃𝐎 •", aviso: "Isso não existe no meu repertório.", frase: "💡 Confira antes de tentar novamente." }
        ];

        const v = VARIACOES_CMD_ERRADO[Math.floor(Math.random() * VARIACOES_CMD_ERRADO.length)];
        const numUser = soNumero(sender);
        const hora = new Date().toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo" });
        const data = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
        const nomeBot = db.config().nomeBot || "Rimuru Bot";
        const cmdExibido = cmdLimpo ? (p + cmdLimpo) : p;

        let sugestao = "";
        if (cmdLimpo) {
          const parecido = buscarComandoParecido(cmdLimpo);
          if (parecido) sugestao = `\n🤔 *VOCÊ QUIS DIZER?*\n╰➜ \`${p}${parecido}\`\n`;
        }

        const textoBase = `${v.topo}\n\n╭─〔 🔷 𝐀𝐕𝐈𝐒𝐎 〕\n│ ${v.aviso}\n╰──────────────\n\n『 𝐃𝐞𝐭𝐚𝐥𝐡𝐞𝐬 』 ↴\n\n👤 𝐔𝐬𝐮𝐚́𝐫𝐢𝐨:\n╰➜ @${numUser}\n\n🫟 𝐏𝐫𝐞𝐟𝐢𝐱𝐨:\n╰➜ ${p}\n\n❔ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨 𝐮𝐬𝐚𝐝𝐨:\n╰➜ ${cmdExibido}\n${sugestao}\n🕐 𝐇𝐨𝐫𝐚́𝐫𝐢𝐨:\n╰➜ ${hora} — ${data}\n\n${v.frase}\n\n"${nomeBot}"`;

        const mencoes = sender ? [sender] : [];
        const cfgCmd = db.config();

        try {
          if (cfgCmd.fotoCmd) {
            const buf = Buffer.from(cfgCmd.fotoCmd, "base64");
            if (cfgCmd.tipoFotoCmd === "video") {
              await sock.sendMessage(remetente, { video: buf, mimetype: "video/mp4", fileName: "erro.mp4", gifPlayback: true, caption: textoBase, mentions: mencoes, ignorarCanal: true }, { quoted: msg });
            } else {
              await sock.sendMessage(remetente, { image: buf, caption: textoBase, mentions: mencoes, ignorarCanal: true }, { quoted: msg });
            }
          } else {
            await sock.sendMessage(remetente, { text: textoBase, mentions: mencoes, ignorarCanal: true }, { quoted: msg });
          }
        } catch (e) {
          await sock.sendMessage(remetente, { text: textoBase, mentions: mencoes, ignorarCanal: true }, { quoted: msg });
        }
        return;
      }

      try {
        const cidData = dbLer("cidade.json", { usuarios: {} });
        const numSender = soNumero(sender);
        const userCidade = cidData.usuarios && cidData.usuarios[numSender];
        const CMD_LIBERA_PRESO = ["pagar", "fianca", "pagarfianca", "fugircadeia", "fugir", "statuspreso", "cadeia", "minhapena", "menucidade", "menu", "menus", "prefixo", "ping"];
        const ehLiberado = CMD_LIBERA_PRESO.includes(cmdName.toLowerCase());
        if (userCidade && userCidade.preso && userCidade.preso > Date.now() && !ehLiberado) {
          const tempoRestante = formatarTempo(userCidade.preso - Date.now());
          await sock.sendMessage(remetente, { text: "❄️🚔 VOCÊ ESTÁ PRESO!\n\n⏰ Tempo: " + tempoRestante + "\n\n💡 Use `+pagar fianca` ou `+fugircadeia`" }, { quoted: msg });
          return;
        }
        if (userCidade && userCidade.preso && userCidade.preso <= Date.now()) {
          cidData.usuarios[numSender].preso = null;
          dbSalvar("cidade.json", cidData);
        }
      } catch (_) {}

      let groupMetadata = null;
      let isAdmin = false;
      groupMetadata = groupCache.get(remetente);
      if (!groupMetadata) {
        groupMetadata = await sock.groupMetadata(remetente).catch(() => null);
        if (groupMetadata) groupCache.set(remetente, groupMetadata);
      }

      if (groupMetadata) {
        const senderNums2 = [sender, senderRaw, msg.key?.participant, msg.key?.participantPn, msg.key?.participantLid, sock.user?.id, sock.user?.lid].filter(Boolean).map(soNumero);
        const p = groupMetadata.participants.find(x => {
          const pIds = [x.id, x.lid, x.phoneNumber].filter(Boolean).map(soNumero);
          return pIds.some(id => senderNums2.includes(id));
        });
        isAdmin = p && (p.admin === "admin" || p.admin === "superadmin");
      }

      const ehSub = ehSubAdmin(remetente, sender);
      const permitidoSub = ["mute", "desmute", "ban", "kick", "link", "linkgp", "fechar", "closenow", "abrir", "opennow"];
      const ehComandoSub = permitidoSub.includes(cmd.nome) || (cmd.aliases || []).some(a => permitidoSub.includes(a));
      const podeAdmin = isAdmin || isDono || isSubDono || (ehSub && ehComandoSub);

      if (cmd.donoOnly && !isDono && !isSubDono) { return sock.sendMessage(remetente, { text: "❄️ Esse comando e so do mestre!" }, { quoted: msg }); }
      if (cmd.adminOnly && !podeAdmin) { return sock.sendMessage(remetente, { text: "❄️ Esse comando e de admin!" }, { quoted: msg }); }
      if (cmd.grupoOnly && !isGrupo) { return sock.sendMessage(remetente, { text: "❄️ So em grupo!" }, { quoted: msg }); }

      if (cmdName.toLowerCase().startsWith("menu")) {
        const cfgAudio = db.config();
        if (cfgAudio.audioMenu) {
          try {
            const audioBuffer = Buffer.from(cfgAudio.audioMenu, "base64");
            const ff = require("@ffmpeg-installer/ffmpeg").path;
            const tmp = os.tmpdir();
            const tIn = path.join(tmp, "audio_in_" + Date.now());
            const tOut = path.join(tmp, "audio_out_" + Date.now() + ".ogg");
            fs.writeFileSync(tIn, audioBuffer);
            execSync(`"${ff}" -i "${tIn}" -vn -ar 48000 -ac 1 -c:a libopus -b:a 64k -application voip -avoid_negative_ts make_zero -map_metadata -1 -f ogg "${tOut}"`, { stdio: "ignore", timeout: 30000 });
            const audioConvertido = fs.readFileSync(tOut);
            try { fs.unlinkSync(tIn); } catch (_) {}
            try { fs.unlinkSync(tOut); } catch (_) {}
            await sock.sendMessage(remetente, { audio: audioConvertido, mimetype: "audio/ogg; codecs=opus", ptt: true }, { quoted: msg });
            await new Promise(r => setTimeout(r, 1500));
          } catch (e) { console.log("❌ Erro ao converter áudio do menu:", e.message); }
        }
      }

      try {
        await cmd.executar({
          sock, msg, args, sender, isGrupo, isAdmin, isDono, isSubDono, ehSub, podeAdmin, groupMetadata, config,
          prefixoAtivo: prefixoUsado || prefixoGlobal, db,
          utils: { getAlvo, soNumero, getTexto, downloadMediaMessage, recarregarCanal, naListaNegra, aluguelAtivo, grupoTemAluguel, formatarTempo, adicionarAviso, limparAvisos, DATA_DIR, botEhAdmin, dbLer, dbSalvar, getTextoBotao, ehSubAdmin }
        });
      } catch (e) {
        console.log("ERRO em " + cmd.nome + ":", e);
        try { await sock.sendMessage(remetente, { text: "❄️ ERRO no comando " + cmd.nome + "\n\n" + e.message }, { quoted: msg }); } catch (_) {}
      }

    } catch (err) {
      console.error("❌❌❌ ERRO FATAL NO HANDLER:");
      console.error(err);
    }
  });
}

iniciarBot();