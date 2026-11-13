/* ============================================================
   🌸 RIMURU BOT MD - INDEX COMPLETO (TEMA FLORAL)
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

if (!process.env.RIMURU_CHILD) {
  const { fork } = require('child_process');
  function iniciarFilho() {
    const filho = fork(__filename, [], { env: { ...process.env, RIMURU_CHILD: '1' }, stdio: 'inherit' });
    filho.on('exit', (code) => {
      if (code === 0) { console.log('\n♻️ [AUTO-RESTART] Reiniciando o bot...\n'); setTimeout(() => iniciarFilho(), 1000); }
      else { console.log(`\n💤 [AUTO-RESTART] Bot encerrado (código ${code}). Sem restart.\n`); process.exit(code); }
    });
    filho.on('error', (err) => { console.error('❌ [AUTO-RESTART] Erro no filho:', err.message); setTimeout(() => iniciarFilho(), 2000); });
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

function bootstrap() {
  const pastas = [DATA_DIR, MENUS_DIR, path.join(MENUS_DIR, "menu-adm"), path.join(MENUS_DIR, "menu-dono"), path.join(MENUS_DIR, "menu-vip"), path.join(MENUS_DIR, "menu-rpg"), path.join(MENUS_DIR, "menu-fazenda"), path.join(MENUS_DIR, "menu-fnaf"), path.join(MENUS_DIR, "menu-cidade"), path.join(MENUS_DIR, "menu-util"), path.join(MENUS_DIR, "menu-dragao"), path.join(MENUS_DIR, "menu-pokemon"), path.join(MENUS_DIR, "menu-membros")];
  for (const pasta of pastas) { if (!fs.existsSync(pasta)) { try { fs.mkdirSync(pasta, { recursive: true }); } catch (e) {} } }
  const arquivos = [
    ["cidade.json", { usuarios: {}, casas: {}, predios: {} }],
    ["rpg.json", { usuarios: {} }],
    ["blockcmd.json", {}],
    ["keysfz.json", { keys: {} }],
    ["goldfz.json", { usuarios: {} }],
    ["pokemon.json", { treinadores: {} }],
    ["pokemonselvagem.json", {}],
    ["pokemonlobby.json", {}],
    ["pokemoncfg.json", { grupos: {} }],
    ["keyspkc.json", { keys: {} }],
    ["apiconfig.json", {}],
    ["fazendacfg.json", { grupos: {} }],
    ["fazendaloja.json", { sementes: {}, animais: {}, ultimoRestock: 0 }],
    ["fazendavendedores.json", { sementes: { ativo: false, expiraEm: 0, chegouEm: 0, itens: [] }, animais: { ativo: false, expiraEm: 0, chegouEm: 0, itens: [] }, ultimoSemente: 0, ultimoAnimal: 0, ultimoEventoAgua: 0 }],
    ["dragaocfg.json", { grupos: {} }],
    ["antiporn.json", {}]
  ];
  for (const [nome, padrao] of arquivos) {
    const p = path.join(DATA_DIR, nome);
    if (!fs.existsSync(p)) try { fs.writeFileSync(p, JSON.stringify(padrao, null, 2)); } catch (e) {}
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
  config: () => dbLer("config.json", { fotoMenu: null, prefixoGlobal: null, slow: false, subdonos: [], nomeBot: "Rimuru", fotoCmd: null, tipoFotoCmd: null, fotoCmdEncontrado: null, tipoFotoCmdEncontrado: null, audioMenu: null, dormindo: false, botGlobalOff: false }),
  salvarConfig: (d) => dbSalvar("config.json", d),
  canal: () => dbLer("canal.json", { jid: null, nome: null, link: null }), salvarCanal: (d) => dbSalvar("canal.json", d),
  listanegra: () => dbLer("blacklist.json", {}), salvarListanegra: (d) => dbSalvar("blacklist.json", d),
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
  autocfg: () => dbLer("autocfg.json", { grupos: {} }), salvarAutocfg: (d) => dbSalvar("autocfg.json", d),
  figcmd: () => dbLer("figcmd.json", {}), salvarFigcmd: (d) => dbSalvar("figcmd.json", d),
  blockcmd: () => dbLer("blockcmd.json", {}), salvarBlockcmd: (d) => dbSalvar("blockcmd.json", d)
};

function getAlvo(msg) { const ctx = (msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.contextInfo) || (msg.message && msg.message.imageMessage && msg.message.imageMessage.contextInfo) || (msg.message && msg.message.videoMessage && msg.message.videoMessage.contextInfo) || {}; const mentions = ctx.mentionedJid || []; if (mentions.length) return mentions[0]; if (ctx.participant) return ctx.participant; return null; }
function soNumero(jid) { if (!jid) return ""; if (typeof jid === "object") jid = jid.phoneNumber || jid.id || ""; return String(jid).split("@")[0].split(":")[0].replace(/\D/g, ""); }
function getTexto(msg) { return (msg.message && msg.message.conversation) || (msg.message && msg.message.extendedTextMessage && msg.message.extendedTextMessage.text) || (msg.message && msg.message.imageMessage && msg.message.imageMessage.caption) || (msg.message && msg.message.videoMessage && msg.message.videoMessage.caption) || ""; }
function getTextoBotao(msg) { try { if (msg.message && msg.message.buttonsResponseMessage) return msg.message.buttonsResponseMessage.selectedButtonId || ""; if (msg.message && msg.message.templateButtonReplyMessage) return msg.message.templateButtonReplyMessage.selectedId || ""; if (msg.message && msg.message.listResponseMessage) return msg.message.listResponseMessage.singleSelectReply && msg.message.listResponseMessage.singleSelectReply.selectedRowId || ""; } catch (_) {} return ""; }
function naListaNegra(jidGrupo, jidOuNum) { const num = soNumero(jidOuNum); if (!num) return false; return (db.listanegra()[jidGrupo] || []).includes(num); }
function aluguelAtivo() { return db.aluguel().ativo === true; }
function grupoTemAluguel(jid) { const a = db.aluguel(); const exp = a.grupos && a.grupos[jid]; return exp && Date.now() < exp; }
function formatarTempo(ms) { const s = Math.floor(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60), d = Math.floor(h / 24); if (d > 0) return d + "d " + (h % 24) + "h"; if (h > 0) return h + "h " + (m % 60) + "min"; if (m > 0) return m + "min " + (s % 60) + "s"; return s + "s"; }
function adicionarAviso(grupoJid, userJid, tipo) { const avisos = db.avisos(); avisos[grupoJid] = avisos[grupoJid] || {}; const num = soNumero(userJid); avisos[grupoJid][num] = avisos[grupoJid][num] || {}; avisos[grupoJid][num][tipo] = (avisos[grupoJid][num][tipo] || 0) + 1; db.salvarAvisos(avisos); return avisos[grupoJid][num][tipo]; }
function limparAvisos(grupoJid, userJid, tipo) { const avisos = db.avisos(); const num = soNumero(userJid); if (avisos[grupoJid] && avisos[grupoJid][num] && avisos[grupoJid][num][tipo]) { avisos[grupoJid][num][tipo] = 0; db.salvarAvisos(avisos); } }
function ehSubAdmin(jidGrupo, jidUser) { const subs = db.subadmins()[jidGrupo] || []; const num = soNumero(jidUser); return subs.some(s => soNumero(s) === num); }
function botEhAdmin(meta, sock) { if (!meta) return false; const botIds = [sock.user && sock.user.id, sock.user && sock.user.lid, sock.user && sock.user.jid].filter(Boolean).map(soNumero); const botPart = meta.participants.find(p => { const ids = [p.id, p.lid, p.phoneNumber].filter(Boolean).map(soNumero); return ids.some(id => botIds.includes(id)); }); return botPart && (botPart.admin === "admin" || botPart.admin === "superadmin"); }
function dataBrasil() { return new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).split("/").reverse().join("-"); }
function horaBrasil() { return new Date().toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit", hour12: false }); }

function boxTop(titulo) {
  return `╔═══ஓ๑♡๑ஓ═══╗
𓆩 ${titulo} 𓆪
╚═══ஓ๑♡๑ஓ═══╝`
}
function boxFim(nomeBot, frase = "Concluído com sucesso.") {
  return `╔═══ஓ๑♡๑ஓ═══╗
𓆩 ${String(nomeBot).toUpperCase()} 𓆪
❝ ${frase} ❞
╚═══ஓ๑♡๑ஓ═══╝`
}
function msgAviso(titulo, aviso, detalhes, rodape, nomeBot) {
  return `${boxTop(titulo)}

╭┈┈┈┈୨┈┈┈┈╮
𓆩 𝐀𝐕𝐈𝐒𝐎 𓆪
↳ ${aviso}
╰┈┈┈┈୨┈┈┈┈╯

╭┈┈┈┈୨┈┈┈┈╮
𓆩 𝐃𝐄𝐓𝐀𝐋𝐇𝐄𝐒 𓆪
↳ ${detalhes}
╰┈┈┈┈୨┈┈┈┈╯

${rodape ? `╭┈┈┈┈୨┈┈┈┈╮
𓆩 𝐍𝐎𝐓𝐀 𓆪
↳ ${rodape}
╰┈┈┈┈୨┈┈┈┈╯

` : ""}${boxFim(nomeBot, "Verifique e tente novamente.")}`
}
function msgSucesso(titulo, aviso, detalhes, rodape, nomeBot) {
  return `${boxTop(titulo)}

╭┈┈┈┈୨┈┈┈┈╮
𓆩 𝐒𝐓𝐀𝐓𝐔𝐒 𓆪
↳ ${aviso}
╰┈┈┈┈୨┈┈┈┈╯

╭┈┈┈┈୨┈┈┈┈╮
𓆩 𝐃𝐄𝐓𝐀𝐋𝐇𝐄𝐒 𓆪
↳ ${detalhes}
╰┈┈┈┈୨┈┈┈┈╯

${rodape ? `╭┈┈┈┈୨┈┈┈┈╮
𓆩 𝐍𝐎𝐓𝐀 𓆪
↳ ${rodape}
╰┈┈┈┈୨┈┈┈┈╯

` : ""}${boxFim(nomeBot, "Concluído com sucesso.")}`
}

const TERMOS_18 = ["porn", "porno", "xxx", "sexo", "nudes", "nude", "onlyfans", "hentai", "erotic", "putaria", "18+", "nsfw"];
function contemTermo18(texto) {
  const lower = String(texto || "").toLowerCase()
  return TERMOS_18.some(t => lower.includes(t))
}

function levenshtein(a, b) { const matrix = []; for (let i = 0; i <= b.length; i++) matrix[i] = [i]; for (let j = 0; j <= a.length; j++) matrix[0][j] = j; for (let i = 1; i <= b.length; i++) { for (let j = 1; j <= a.length; j++) { if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1]; else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)); } } return matrix[b.length][a.length]; }
function buscarComandoParecido(comandoErrado) { let melhor = null; let menorDistancia = 999; const todos = [...comandos.keys(), ...aliases.keys()]; for (const cmd of todos) { const dist = levenshtein(comandoErrado, cmd); if (dist < menorDistancia) { menorDistancia = dist; melhor = cmd; } } if (menorDistancia <= 3 && melhor) return melhor; return null; }

/* ============================================================
   🧠 IA DA OBANAI (CORRIGIDA COM A RESPOSTA EXATA)
   ============================================================ */
async function processarIA(sock, msg, remetente, sender, isGrupo, db) {
  if (!isGrupo) return false;
  
  const conf = db.grupos()[remetente] || {};
  if (!conf.iaAtiva) return false;

  const texto = getTexto(msg); 
  if (!texto) return false;

  const botNum = soNumero(sock.user?.id); 
  const botNome = (db.config().nomeBot || "Rimuru").toLowerCase();
  const ctx = msg.message?.extendedTextMessage?.contextInfo || {}; 
  const mentionedJid = ctx.mentionedJid || [];
  
  const mencionadoPorId = mentionedJid.some(j => soNumero(j) === botNum);
  const respondendoBot = ctx.participant && soNumero(ctx.participant) === botNum;
  const digitouNome = texto.toLowerCase().trim().startsWith(botNome) || texto.toLowerCase().includes(" " + botNome);

  if (!mencionadoPorId && !respondendoBot && !digitouNome) return false;

  let pergunta = texto
    .replace(/@\d+/g, "")
    .replace(new RegExp("@" + botNome, "gi"), "")
    .replace(new RegExp(botNome, "gi"), "")
    .trim();

  if (!pergunta || pergunta.length < 2) {
    pergunta = "Oi, quem é você?";
  }

  try {
    await sock.sendPresenceUpdate("composing", remetente);
    
    const obanaiToken = require('./config').obanaiToken || "rj8SpI";
    const obanaiBase = require('./config').obanaiApiBase || "https://obanai-apis.eu.cc";
    
    const r = await fetch(`${obanaiBase}/api/ias/unliai?q=${encodeURIComponent(pergunta)}&apitoken=${obanaiToken}`, { signal: AbortSignal.timeout(30000) });
    const data = await r.json();
    
    // Correção: Pega a resposta no lugar certo
    if (data?.success && data?.data?.response) {
      await sock.sendMessage(remetente, { text: data.data.response }, { quoted: msg });
    } else {
      await sock.sendMessage(remetente, { text: "🌸 Minhas conexões com o além falharam... Tente novamente em instantes." }, { quoted: msg });
    }
    return true;
  } catch (e) { 
    console.log("❌ Erro IA Obanai:", e.message); 
    return false; 
  }
}

async function processarAutoFig(sock, msg, remetente, isGrupo) {
  if (!isGrupo) return false; const conf = (db.autocfg().grupos && db.autocfg().grupos[remetente]) || {}; if (!conf.autofig) return false;
  const temImg = msg.message && msg.message.imageMessage; const temVid = msg.message && msg.message.videoMessage; if (!temImg && !temVid) return false;
  try {
    const sharp = require("sharp"); const ff = require("@ffmpeg-installer/ffmpeg").path;
    const buf = await downloadMediaMessage(msg, "buffer", {}, { logger: console, reuploadRequest: sock.updateMediaMessage });
    let wp;
    if (temImg) wp = await sharp(buf).resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 90 }).toBuffer();
    else { const tIn = path.join(os.tmpdir(), "af_" + Date.now() + ".mp4"); const tOut = path.join(os.tmpdir(), "af_" + Date.now() + ".webp"); fs.writeFileSync(tIn, buf); execSync(`"${ff}" -y -i "${tIn}" -vcodec libwebp -filter:v "fps=15,scale=512:512:force_original_aspect_ratio=decrease" -lossless 0 -compression_level 6 -q:v 50 -loop 0 -preset default -an -vsync 0 -s 512:512 "${tOut}"`, { stdio: "ignore" }); wp = fs.readFileSync(tOut); try { fs.unlinkSync(tIn); } catch (_) {} try { fs.unlinkSync(tOut); } catch (_) {} }
    await sock.sendMessage(remetente, { sticker: wp }, { quoted: msg }); return true;
  } catch (e) { return false; }
}

async function processarAutoTtk(sock, msg, remetente, isGrupo) {
  if (!isGrupo) return false; const conf = (db.autocfg().grupos && db.autocfg().grupos[remetente]) || {}; if (!conf.autottk) return false;
  const texto = getTexto(msg); if (!texto) return false;
  const match = texto.match(/https?:\/\/(www\.|vm\.|vt\.)?tiktok\.com\/[^\s]+/i); if (!match) return false;
  try {
    const r = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(match[0])}&hd=1`); const d = await r.json();
    if (d.code !== 0 || !d.data || !d.data.play) return false;
    const vid = await fetch(d.data.play); const buffer = Buffer.from(await vid.arrayBuffer());
    if (buffer.length > 16 * 1024 * 1024) { await sock.sendMessage(remetente, { text: "🌸 Vídeo muito grande (max 16MB)" }, { quoted: msg }); return true; }
    await sock.sendMessage(remetente, { video: buffer, mimetype: "video/mp4", fileName: "tiktok.mp4" }, { quoted: msg }); return true;
  } catch (e) { return false; }
}

const comandos = new Map();
const aliases = new Map();
global.rendasAutomaticas = global.rendasAutomaticas || [];

function carregarMenus() {
  comandos.clear(); aliases.clear(); global.rendasAutomaticas = [];
  if (!fs.existsSync(MENUS_DIR)) return;
  const pastas = fs.readdirSync(MENUS_DIR);
  for (const pasta of pastas) {
    const caminhoPasta = path.join(MENUS_DIR, pasta); if (!fs.statSync(caminhoPasta).isDirectory()) continue;
    const arquivos = fs.readdirSync(caminhoPasta).filter(f => f.endsWith(".js"));
    for (const arq of arquivos) {
      const arquivo = path.join(caminhoPasta, arq);
      try {
        delete require.cache[require.resolve(arquivo)];
        const mod = require(arquivo); if (!mod.commands) continue;
        if (typeof mod.rendaAutomatica === "function") global.rendasAutomaticas.push(mod.rendaAutomatica);
        const menuCfg = { grupoOnly: mod.grupoOnly || false, adminOnly: mod.adminOnly || false, donoOnly: mod.donoOnly || false };
        for (const [nome, cmd] of Object.entries(mod.commands)) {
          const pacote = { nome, aliases: cmd.aliases || [], categoria: mod.menu || pasta, grupoOnly: cmd.grupoOnly !== undefined ? cmd.grupoOnly : menuCfg.grupoOnly, adminOnly: cmd.adminOnly !== undefined ? cmd.adminOnly : menuCfg.adminOnly, donoOnly: cmd.donoOnly !== undefined ? cmd.donoOnly : menuCfg.donoOnly, executar: cmd.executar };
          comandos.set(nome.toLowerCase(), pacote); for (const a of pacote.aliases) aliases.set(a.toLowerCase(), nome.toLowerCase());
        }
      } catch (e) { console.log("Erro ao carregar " + pasta + "/" + arq + ":", e.message); }
    }
  }
  const categorias = {}; for (const [nome, cmd] of comandos.entries()) { const cat = cmd.categoria || "outros"; categorias[cat] = (categorias[cat] || 0) + 1; }
  global.totalComandos = comandos.size; global.totalAliases = aliases.size; global.comandosPorCategoria = categorias; global.__carregarMenus = carregarMenus;
  console.log("\n🌸 Bot carregou " + comandos.size + " comandos e " + aliases.size + " aliases...\n");
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
      if (!canalCache) recarregarCanal(); const c = canalCache;
      if (c && c.jid && c.jid !== "0@newsletter") { content.contextInfo = content.contextInfo || {}; content.contextInfo.forwardedNewsletterMessageInfo = { newsletterJid: c.jid, newsletterName: c.nome || "Canal", serverMessageId: 0 }; content.contextInfo.forwardingScore = 1; content.contextInfo.isForwarded = true; }
    } catch (_) {}
    return original(jid, content, options);
  };
}

async function processarComandoSemPrefixo(sock, msg, remetente, sender, isGrupo, isDono, isSubDono) {
  if (!isGrupo) return false;
  if (msg.key.fromMe) return false;

  try {
    const textoOriginal = getTexto(msg).trim();
    if (!textoOriginal) return false;

    const cfg = db.config();
    const nomeBot = (cfg.nomeBot || "rimuru").toLowerCase().trim();
    const nomeBotExibicao = cfg.nomeBot || "Rimuru";

    const verificarAdmin = async () => {
      try {
        const meta = await sock.groupMetadata(remetente);
        const p = meta.participants.find(x => x.id === sender || soNumero(x.id) === soNumero(sender) || soNumero(x.lid) === soNumero(sender));
        return p && (p.admin === "admin" || p.admin === "superadmin");
      } catch (_) { return false }
    }

    if (textoOriginal === "B") {
      const ehAdmin = await verificarAdmin()
      if (!ehAdmin && !isDono && !isSubDono) return false
      const ctx = msg.message?.extendedTextMessage?.contextInfo || {}
      if (!ctx.participant) return false
      try {
        await sock.groupParticipantsUpdate(remetente, [ctx.participant], "remove")
        await sock.sendMessage(remetente, { react: { text: "🌸", key: msg.key } }).catch(() => {})
        await sock.sendMessage(remetente, {
          text: msgSucesso("𝐔𝐒𝐔𝐀́𝐑𝐈𝐎 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐎", "O usuário foi removido do grupo.", `@${soNumero(ctx.participant)}`, "A serpente não perdoa.", nomeBotExibicao),
          mentions: [ctx.participant]
        }, { quoted: msg })
      } catch (e) {
        await sock.sendMessage(remetente, { text: msgAviso("𝐄𝐑𝐑𝐎", "Não foi possível remover.", e.message, null, nomeBotExibicao) }, { quoted: msg })
      }
      return true
    }

    if (textoOriginal.toLowerCase() === "fecha") {
      const ehAdmin = await verificarAdmin()
      if (!ehAdmin && !isDono && !isSubDono) return false
      try {
        await sock.groupSettingUpdate(remetente, "announcement")
        await sock.sendMessage(remetente, { react: { text: "🌸", key: msg.key } }).catch(() => {})
        await sock.sendMessage(remetente, { text: msgSucesso("𝐆𝐑𝐔𝐏𝐎 𝐅𝐄𝐂𝐇𝐀𝐃𝐎", "Só os dignos falam.", "Use `abre` para abrir novamente.", "Respiração... Aniquilação.", nomeBotExibicao) }, { quoted: msg })
      } catch (e) { await sock.sendMessage(remetente, { text: msgAviso("𝐄𝐑𝐑𝐎", "Falha ao fechar.", e.message, null, nomeBotExibicao) }, { quoted: msg }) }
      return true
    }

    if (textoOriginal.toLowerCase() === "abre") {
      const ehAdmin = await verificarAdmin()
      if (!ehAdmin && !isDono && !isSubDono) return false
      try {
        await sock.groupSettingUpdate(remetente, "not_announcement")
        await sock.sendMessage(remetente, { react: { text: "🌸", key: msg.key } }).catch(() => {})
        await sock.sendMessage(remetente, { text: msgSucesso("𝐆𝐑𝐔𝐏𝐎 𝐀𝐁𝐄𝐑𝐓𝐎", "Respirem, mortais.", "Todos podem falar.", "Lua Crescente...", nomeBotExibicao) }, { quoted: msg })
      } catch (e) { await sock.sendMessage(remetente, { text: msgAviso("𝐄𝐑𝐑𝐎", "Falha ao abrir.", e.message, null, nomeBotExibicao) }, { quoted: msg }) }
      return true
    }

    if (textoOriginal.toLowerCase() === nomeBot) {
      const ehAdmin = await verificarAdmin()
      if (!ehAdmin && !isDono && !isSubDono) return false
      try {
        const meta = await sock.groupMetadata(remetente)
        const taFechado = meta.announce === true
        if (taFechado) {
          await sock.groupSettingUpdate(remetente, "not_announcement")
          await sock.sendMessage(remetente, { react: { text: "🌸", key: msg.key } }).catch(() => {})
          await sock.sendMessage(remetente, { text: msgSucesso("𝐆𝐑𝐔𝐏𝐎 𝐀𝐁𝐄𝐑𝐓𝐎", "Respirem, mortais.", "Todos podem falar.", "Lua Crescente...", nomeBotExibicao) }, { quoted: msg })
        } else {
          await sock.groupSettingUpdate(remetente, "announcement")
          await sock.sendMessage(remetente, { react: { text: "🌸", key: msg.key } }).catch(() => {})
          await sock.sendMessage(remetente, { text: msgSucesso("𝐆𝐑𝐔𝐏𝐎 𝐅𝐄𝐂𝐇𝐀𝐃𝐎", "Só os dignos falam.", "Use o nome do bot novamente para abrir.", "Respiração... Aniquilação.", nomeBotExibicao) }, { quoted: msg })
        }
      } catch (e) { await sock.sendMessage(remetente, { text: msgAviso("𝐄𝐑𝐑𝐎", "Falha.", e.message, null, nomeBotExibicao) }, { quoted: msg }) }
      return true
    }

  } catch (e) {}
  return false;
}

async function processarFigCmd(sock, msg, remetente, sender, isGrupo, isDono, isSubDono) {
  if (!isGrupo) return false;
  if (msg.key.fromMe) return false;
  if (!msg.message || !msg.message.stickerMessage) return false;
  try {
    const dbFig = db.figcmd();
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
    try { groupMetadata = await sock.groupMetadata(remetente); const p = groupMetadata.participants.find(x => x.id === sender || soNumero(x.id) === soNumero(sender) || soNumero(x.lid) === soNumero(sender)); isAdmin = p && (p.admin === "admin" || p.admin === "superadmin"); } catch (_) {}
    const ehSub = ehSubAdmin(remetente, sender);
    const podeAdmin = isAdmin || isDono || isSubDono;
    if (cmdExecutar.donoOnly && !isDono && !isSubDono) return true;
    if (cmdExecutar.adminOnly && !podeAdmin) return true;
    try {
      await cmdExecutar.executar({ sock, msg, args: [], sender, isGrupo, isAdmin, isDono, isSubDono, ehSub, podeAdmin, groupMetadata, config, prefixoAtivo: db.config().prefixoGlobal || config.prefixo || "+", db, utils: { getAlvo, soNumero, getTexto, downloadMediaMessage, recarregarCanal, naListaNegra, aluguelAtivo, grupoTemAluguel, formatarTempo, adicionarAviso, limparAvisos, DATA_DIR, botEhAdmin, dbLer, dbSalvar, getTextoBotao, ehSubAdmin } });
    } catch (e) {}
    return true;
  } catch (e) { return false; }
}

const ultimoAgendamento = {};
function iniciarAgendamentos() {
  setInterval(async () => {
    if (!global.sockGlobal) return;
    try {
      const agora = horaBrasil(); const dataHoje = dataBrasil(); const grupos = db.grupos(); let alterou = false;
      for (const [jid, conf] of Object.entries(grupos)) {
        if (!jid.endsWith("@g.us")) continue;
        if (conf.abrirHora === agora && conf.ultimoAbrir !== dataHoje) {
          const chaveAbrir = `${jid}_abrir_${dataHoje}_${agora}`; if (ultimoAgendamento[chaveAbrir]) continue; ultimoAgendamento[chaveAbrir] = true;
          try { await global.sockGlobal.groupSettingUpdate(jid, "not_announcement"); const legenda = (conf.legendaAbrir && conf.legendaAbrir.trim()) || "🌸 Território aberto!"; if (conf.fotoAbrir) await global.sockGlobal.sendMessage(jid, { image: Buffer.from(conf.fotoAbrir, "base64"), caption: legenda }); else await global.sockGlobal.sendMessage(jid, { text: legenda }); conf.ultimoAbrir = dataHoje; alterou = true; } catch (e) {}
        }
        if (conf.fecharHora === agora && conf.ultimoFechar !== dataHoje) {
          const chaveFechar = `${jid}_fechar_${dataHoje}_${agora}`; if (ultimoAgendamento[chaveFechar]) continue; ultimoAgendamento[chaveFechar] = true;
          try { await global.sockGlobal.groupSettingUpdate(jid, "announcement"); const legenda = (conf.legendaFechar && conf.legendaFechar.trim()) || "🌸 Território fechado!"; if (conf.fotoFechar) await global.sockGlobal.sendMessage(jid, { image: Buffer.from(conf.fotoFechar, "base64"), caption: legenda }); else await global.sockGlobal.sendMessage(jid, { text: legenda }); conf.ultimoFechar = dataHoje; alterou = true; } catch (e) {}
        }
      }
      if (alterou) db.salvarGrupos(grupos);
      for (const chave of Object.keys(ultimoAgendamento)) { if (!chave.includes(dataHoje)) delete ultimoAgendamento[chave]; }
    } catch (e) {}
  }, 30000);
}

function iniciarRendasAutomaticas() {
  let rodando = false;
  setInterval(async () => {
    if (!global.sockGlobal) return;
    if (rodando) return;
    rodando = true;
    for (const fn of global.rendasAutomaticas) { try { await fn(global.sockGlobal, db); } catch (e) {} }
    rodando = false;
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
      for (const d of divs.lista) { if (d.expiraEm <= Date.now()) { console.log(`\n⚠️ [AVISO DONO] A divulgação (ID: ${d.id}) EXPIROU e foi removida!\n`); alterou = true } else { listaAtualizada.push(d) } }
      if (alterou) { divs.lista = listaAtualizada; fs.writeFileSync(divsPath, JSON.stringify(divs, null, 2)) }
    } catch (e) {}
  }, 60000)
}

async function iniciarBot() {
  carregarMenus();
  iniciarAgendamentos();
  iniciarRendasAutomaticas();
  iniciarVerificadorDivs();

  const { state, saveCreds } = await useMultiFileAuthState("auth");

  let version;
  try { const versionInfo = await fetchLatestWaWebVersion({}); version = versionInfo.version; } catch (err) { version = undefined; }

  let qrOption = false;
  let connectionMethod = 'qr';
  let numeroCompleto = '';

  if (!state.creds.registered) {
    console.clear();
    console.log(`
╔════════════════════════════════════════════════╗
│       📱 PAINEL DE CONEXÃO UNIVERSAL 📱        │
╠════════════════════════════════════════════════╣
│  [1] 🔑 Conectar via Pareamento (Pairing Code) │
│  [2] 🖼️  Conectar via Código QR (QR Code)      │
│  [3] 🚪 Sair                                   │
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
    cachedGroupMetadata: async (jid) => groupCache.get(jid) || null
  });

  global.sockGlobal = sock;
  recarregarCanal();
  envolverSendMessage(sock);
  try { require("./sistemas/dragon-spawn").iniciar(global.sockGlobal); } catch (e) { console.log("❌ Dragão spawn:", e.message); }  sock.ev.on('groups.upsert', async (grupos) => {
    try {
      const gruposDB = db.grupos(); let alterou = false;
      for (const g of grupos) { if (!gruposDB[g.id]) { gruposDB[g.id] = {}; alterou = true; } try { groupCache.set(g.id, await sock.groupMetadata(g.id)); } catch (_) {} }
      if (alterou) db.salvarGrupos(gruposDB);
    } catch (e) {}
  });

  sock.ev.on('groups.update', async ([event]) => { try { const metadata = await sock.groupMetadata(event.id); groupCache.set(event.id, metadata); } catch (_) {} });

  sock.ev.on('group-participants.update', async (event) => {
    try {
      const { id: jid, participants, action, author } = event;
      if (!jid || !jid.endsWith('@g.us')) return;
      const admsettings = dbLer("admsettings.json", {});
      const c = admsettings[jid] || {};
      if (c.x9 && author && ['promote', 'demote', 'remove', 'add'].includes(action)) {
        const meta = await sock.groupMetadata(jid).catch(() => null);
        const nomeAutor = meta?.participants.find(p => p.id === author)?.notify || soNumero(author);
        let textoX9 = "";
        if (action === 'promote') textoX9 = `👑 *PROMOVIDO*\n\n@${soNumero(participants[0])} foi promovido a admin por *${nomeAutor}*.`;
        else if (action === 'demote') textoX9 = `📉 *REBAIXADO*\n\n@${soNumero(participants[0])} foi rebaixado por *${nomeAutor}*.`;
        else if (action === 'remove') textoX9 = `🥾 *REMOVIDO*\n\n@${soNumero(participants[0])} foi removido por *${nomeAutor}*.`;
        else if (action === 'add') textoX9 = `➕ *ADICIONADO*\n\n@${soNumero(participants[0])} foi adicionado por *${nomeAutor}*.`;
        if (textoX9) await sock.sendMessage(jid, { text: textoX9, mentions: participants });
      }
      if (!participants || !participants.length || (action !== 'add' && action !== 'remove')) return;
      const grupos = db.grupos(); const conf = grupos[jid] || {};
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
          const textoPadrao = `🌸 Bem-vindo(a) ao grupo, @${num}!\n\n❄️ Leia as regras e aproveite.\n\n_"${nomeBot}"_`;
          const texto = (conf.textobv && conf.textobv.trim()) ? conf.textobv.replace(/%nmr%/g, '@' + num).replace(/%grupo%/g, nomeGrupo) : textoPadrao;
          try { if (conf.fundobv) await sock.sendMessage(jid, { image: Buffer.from(conf.fundobv, 'base64'), caption: texto, mentions: [jidParticipante] }); else await sock.sendMessage(jid, { text: texto, mentions: [jidParticipante] }); } catch (e) {}
        }
        if (action === 'remove') {
          const textoPadrao = `🌸 @${num} saiu do grupo...\n\n❄️ _"Até a próxima."_\n\n_${nomeBot}_`;
          const texto = (conf.legendasaiu && conf.legendasaiu.trim()) ? conf.legendasaiu.replace(/%nmr%/g, '@' + num).replace(/%grupo%/g, nomeGrupo) : textoPadrao;
          try { if (conf.fundosaiu) await sock.sendMessage(jid, { image: Buffer.from(conf.fundosaiu, 'base64'), caption: texto, mentions: [jidParticipante] }); else await sock.sendMessage(jid, { text: texto, mentions: [jidParticipante] }); } catch (e) {}
        }
      }
    } catch (e) { console.log('❌ Erro group-participants.update:', e.message); }
  });

  sock.ev.on('call', async (calls) => {
    for (const call of calls) {
      try {
        if (call.status !== 'offer') continue;
        const jid = call.from;
        const admsettings = dbLer("admsettings.json", {});
        if (jid.endsWith('@g.us') && admsettings[jid]?.anticall === true) {
          await sock.rejectCall(call.id, jid).catch(()=>{});
          const meta = await sock.groupMetadata(jid).catch(() => null);
          const admins = meta?.participants.filter(p => p.admin === "admin" || p.admin === "superadmin").map(p => p.id) || [];
          const advs = db.advs(); advs[jid] = advs[jid] || {};
          const numCaller = soNumero(call.from);
          advs[jid][numCaller] = (advs[jid][numCaller] || 0) + 1;
          const totalAdv = advs[jid][numCaller];
          db.salvarAdvs(advs);
          await sock.sendMessage(jid, { text: `📵 *ANTI-CALL*\n\n🚨 @${numCaller} tentou ligar!\n⚠️ Advertência: ${totalAdv}/3\n\n👑 Admins, fiquem atentos.`, mentions: [call.from, ...admins].filter(Boolean) }).catch(()=>{});
          if (totalAdv >= 3) { await sock.groupParticipantsUpdate(jid, [call.from], "remove").catch(()=>{}); delete advs[jid][numCaller]; db.salvarAdvs(advs); }
        }
      } catch (e) { }
    }
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, qr, lastDisconnect } = update;
    if (qr && connectionMethod === 'pairing' && numeroCompleto && !sock.authState.creds.registered) {
      try { const code = await sock.requestPairingCode(numeroCompleto); console.log(`\n🔑 CÓDIGO DE PAREAMENTO: ${code}\n`); } catch (err) {}
    }
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode !== DisconnectReason.loggedOut) setTimeout(() => iniciarBot(), 5000);
    } else if (connection === 'open') {
      console.log('\n✅ BOT CONECTADO!\n');
      try {
        const gruposAPI = await sock.groupFetchAllParticipating();
        const gruposDB = db.grupos(); let alterou = false; let count = 0;
        for (const jid of Object.keys(gruposAPI)) { if (!gruposDB[jid]) { gruposDB[jid] = {}; alterou = true; } groupCache.set(jid, gruposAPI[jid]); count++; }
        if (alterou) db.salvarGrupos(gruposDB);
        console.log(`\n📁 [SINCRONIZAÇÃO] ${count} grupos detectados.`);
      } catch (e) { console.log("❌ Erro ao sincronizar grupos:", e.message); }
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
            if (meta) { const p = meta.participants.find(x => x.lid === senderRaw || x.id === senderRaw); if (p && p.phoneNumber) sender = p.phoneNumber; else if (p && p.id && !p.id.endsWith("@lid")) sender = p.id; }
          } catch (_) {}
        }
      }

      const numerosDono = (Array.isArray(config.dono) ? config.dono : [config.dono]).map(soNumero).filter(n => n.length >= 10);
      const senderCandidatos = [sender, senderRaw, msg.key?.participant, msg.key?.participantPn, msg.key?.participantLid, msg.key?.remoteJid, msg.participant].filter(Boolean);
      const senderNums = senderCandidatos.map(soNumero).filter(n => n.length >= 10);
      const isDono = senderNums.some(n => numerosDono.includes(n));

      const cfgSub = db.config();
      const numerosSub = (cfgSub.subdonos || []).map(soNumero).filter(n => n.length >= 10);
      const isSubDono = senderNums.some(n => numerosSub.includes(n)) && !isDono;

      /* 🌐 BOTOFF GLOBAL — bloqueia tudo em todos os grupos, exceto +boton */
      if (cfgSub.botGlobalOff === true && !isDono && !isSubDono) {
        const textoCheck = getTexto(msg).trim()
        const cmdCheck = textoCheck.split(/\s+/)[0]?.replace(/^[^a-zA-Z0-9]+/, "").toLowerCase() || ""
        if (!["boton", "ligar", "onbot"].includes(cmdCheck)) {
          try { await sock.sendMessage(remetente, { react: { text: "🏳️‍⚧️", key: msg.key } }) } catch (_) {}
          return
        }
      }

      if (!isDono && !isSubDono) {
        const b = db.bangp();
        if (b.grupos && b.grupos[remetente]) return;
      }

      const admsettings = dbLer("admsettings.json", {});
      const admsCfg = admsettings[remetente] || {};
      const textoMensagem = getTexto(msg);

      const isAdminUser = async () => {
         const meta = await sock.groupMetadata(remetente).catch(()=>null);
         const p = meta?.participants.find(x => soNumero(x.id) === soNumero(sender) || soNumero(x.lid) === soNumero(sender));
         return p?.admin === "admin" || p?.admin === "superadmin" || isDono || isSubDono;
      };

      /* 🔞 ANTI-PORN */
      const antiCfg = dbLer("antiporn.json", {});
      if (antiCfg[remetente]?.ativo && !isDono && !isSubDono && !(await isAdminUser())) {
        if (contemTermo18(textoMensagem)) {
          await sock.sendMessage(remetente, { delete: msg.key }).catch(() => {});
          await sock.sendMessage(remetente, { text: msgAviso("𝐀𝐍𝐓𝐈-𝐏𝐎𝐑𝐍", "Termo +18 detectado.", `@${soNumero(sender)}`, "Mensagem deletada.", cfgSub.nomeBot || "Rimuru"), mentions: [sender] });
          return;
        }
      }

      const bl = dbLer("blacklist.json", {});
      if (bl[remetente] && bl[remetente].includes(soNumero(sender)) && !isDono) {
        await sock.groupParticipantsUpdate(remetente, [sender], "remove").catch(()=>{});
        return;
      }

      const mutados = dbLer("mutados.json", {});
      if (mutados[remetente] && mutados[remetente][soNumero(sender)] > Date.now()) {
        if (!(await isAdminUser())) { await sock.sendMessage(remetente, { delete: msg.key }); return; }
      }

      if (!msg.key.fromMe) { const respondeuIA = await processarIA(sock, msg, remetente, sender, isGrupo, db); if (respondeuIA) return; }
      if (!msg.key.fromMe && isGrupo) { const respondeuFig = await processarFigCmd(sock, msg, remetente, sender, isGrupo, isDono, isSubDono); if (respondeuFig) return; }
      if (!msg.key.fromMe && isGrupo) { await processarAutoFig(sock, msg, remetente, isGrupo); await processarAutoTtk(sock, msg, remetente, isGrupo); }

      if (!msg.key.fromMe && isGrupo) {
        const respondeuSemPrefixo = await processarComandoSemPrefixo(sock, msg, remetente, sender, isGrupo, isDono, isSubDono);
        if (respondeuSemPrefixo) return;
      }

      const grupos = db.grupos();
      const confGrupo = grupos[remetente] || {};
      const cfgGlobal = db.config();
      const prefixoGlobal = cfgGlobal.prefixoGlobal || config.prefixo || "+";
      let prefixosAtivos = (confGrupo.multiprefixo && confGrupo.prefixo) ? [confGrupo.prefixo] : [prefixoGlobal];

      let texto = getTexto(msg);
      const btnId2 = getTextoBotao(msg);
      if (btnId2) texto = btnId2.replace(new RegExp("^\\" + prefixoGlobal + "+"), prefixoGlobal);

      let prefixoUsado = prefixosAtivos.find(p => texto.startsWith(p));
      let cmdName = "";
      let args = [];

      if (prefixoUsado) {
        const partes = texto.slice(prefixoUsado.length).trim().split(/\s+/);
        cmdName = partes[0];
        args = partes.slice(1);
      } else {
        const partes = texto.trim().split(/\s+/);
        if ((partes[0] || "").toLowerCase() === "prefixo") { cmdName = "prefixo"; args = partes.slice(1); prefixoUsado = ""; }
        else return;
      }

      if (confGrupo.mudo === true) {
        const cmdNameLower = cmdName.toLowerCase();
        if (!["boton", "ligar", "onbot"].includes(cmdNameLower)) {
          const cmdObj = getComando(cmdNameLower);
          if (cmdObj || cmdNameLower === "prefixo") await sock.sendMessage(remetente, { react: { text: "🏳️‍⚧️", key: msg.key } });
          return;
        }
      }

      if (aluguelAtivo() && !isDono && !isSubDono && !grupoTemAluguel(remetente)) {
        const numDono = numerosDono[0] || "";
        await sock.sendMessage(remetente, { text: `✦━━━━━━━━━━━━━━━━━━✦\n📢 𝔸𝕍𝕀𝕊𝕆 📢\n✦━━━━━━━━━━━━━━━━━━✦\n\n🚫 Este grupo não possui aluguel ativo.\n📞 Contato do dono: +${numDono}\n\n_"${db.config().nomeBot || "Rimuru"}"_`, mentions: [numDono + "@s.whatsapp.net"] }, { quoted: msg });
        return;
      }

      if (cmdName.toLowerCase() === "prefixo") {
        const cmdPrefix = getComando("prefixo");
        if (cmdPrefix) {
          await cmdPrefix.executar({ sock, msg, args, sender, prefixoAtivo: prefixoUsado || prefixoGlobal, db });
        } else {
          await sock.sendMessage(remetente, { text: `🌸 O prefixo atual é: \`${prefixoGlobal}\``, mentions: [sender] }, { quoted: msg });
        }
        return;
      }

      const cmd = getComando(cmdName.toLowerCase());
      if (!cmd) {
        const cmdInvalido = getComando("invalidcommand");
        if (cmdInvalido) {
            await cmdInvalido.executar({ sock, msg, args, sender, prefixoAtivo: prefixoUsado || prefixoGlobal, db });
        } else {
            await sock.sendMessage(remetente, { text: `Comando não encontrado.` }, { quoted: msg });
        }
        return;
      }

      /* 🔒 BLOQUEIO DINÂMICO */
      const blocklist = dbLer("blockcmd.json", {});
      const cmdNomeLower = cmd.nome.toLowerCase();
      const cmdAliasesLower = (cmd.aliases || []).map(a => a.toLowerCase());
      const estaBloqueado = blocklist[cmdNomeLower] === true || cmdAliasesLower.some(a => blocklist[a] === true);

      if (estaBloqueado && !isDono && !isSubDono) {
        try { await sock.sendMessage(remetente, { react: { text: "🔒", key: msg.key } }) } catch (_) {}
        return sock.sendMessage(remetente, {
          text: msgAviso("𝐂𝐎𝐌𝐀𝐍𝐃𝐎 𝐁𝐋𝐎𝐐𝐔𝐄𝐀𝐃𝐎", "Este comando foi bloqueado pelo dono.", `@${soNumero(sender)}`, `Comando: \`${cmd.nome}\``, cfgSub.nomeBot || "Rimuru"),
          mentions: [sender]
        }, { quoted: msg });
      }

      /* ⚠️ SOADM CORRIGIDO — só responde se o comando EXISTE */
      if (admsCfg.soadm === true && !(await isAdminUser())) {
        await sock.sendMessage(remetente, { text: "⛔ Apenas administradores podem usar comandos neste grupo!" }, { quoted: msg });
        return;
      }

      let groupMetadata = groupCache.get(remetente);
      if (!groupMetadata) { groupMetadata = await sock.groupMetadata(remetente).catch(() => null); if (groupMetadata) groupCache.set(remetente, groupMetadata); }
      let isAdmin = false;
      if (groupMetadata) {
        const p = groupMetadata.participants.find(x => { const pIds = [x.id, x.lid, x.phoneNumber].filter(Boolean).map(soNumero); return pIds.some(id => senderNums.includes(id)); });
        isAdmin = p && (p.admin === "admin" || p.admin === "superadmin");
      }
      const ehSub = ehSubAdmin(remetente, sender);
      const permitidoSub = ["mute", "desmute", "ban", "kick", "link", "linkgp", "fechar", "closenow", "abrir", "opennow"];
      const ehComandoSub = permitidoSub.includes(cmd.nome) || (cmd.aliases || []).some(a => permitidoSub.includes(a));
      const podeAdmin = isAdmin || isDono || isSubDono || (ehSub && ehComandoSub);

      if (cmd.donoOnly && !isDono && !isSubDono) return sock.sendMessage(remetente, { text: "🌸 Esse comando é só do mestre!" }, { quoted: msg });
      if (cmd.adminOnly && !podeAdmin) return sock.sendMessage(remetente, { text: "🌸 Esse comando é de admin!" }, { quoted: msg });
      if (cmd.grupoOnly && !isGrupo) return sock.sendMessage(remetente, { text: "🌸 Só em grupo!" }, { quoted: msg });

      /* 📸 FOTO/GIF DO COMANDO ENCONTRADO (fotocmdc) — antes de executar */
      const cfgFoto = db.config();
      if (cfgFoto.fotoCmdEncontrado && !msg.key.fromMe) {
        let bufFoto = null;
        try {
          const limpo = String(cfgFoto.fotoCmdEncontrado).replace(/^data:[^;]+;base64,/, "");
          bufFoto = Buffer.from(limpo, "base64");
        } catch { bufFoto = null; }

        if (bufFoto && bufFoto.length) {
          const nomeBot = cfgFoto.nomeBot || "Rimuru";
          const textoEncontrado = `${boxTop("𝐂𝐎𝐌𝐀𝐍𝐃𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎")}

╭┈┈┈┈୨┈┈┈┈╮
𓆩 𝐄𝐗𝐄𝐂𝐔𝐓𝐀𝐍𝐃𝐎 𓆪
↳ \`${cmd.nome}\`
↳ Usuário: @${soNumero(sender)}
╰┈┈┈┈୨┈┈┈┈╯

${boxFim(nomeBot, "A serpente observa.")}`;

          try {
            if (cfgFoto.tipoFotoCmdEncontrado === "video") {
              await sock.sendMessage(remetente, {
                video: bufFoto,
                mimetype: "video/mp4",
                fileName: "comando.gif",
                gifPlayback: true,
                caption: textoEncontrado,
                mentions: [sender]
              }, { quoted: msg });
            } else {
              await sock.sendMessage(remetente, {
                image: bufFoto,
                caption: textoEncontrado,
                mentions: [sender]
              }, { quoted: msg });
            }
          } catch (e) { console.log("⚠️ Erro fotocmdc:", e.message); }
        }
      }

      try {
        await cmd.executar({ sock, msg, args, sender, isGrupo, isAdmin, isDono, isSubDono, ehSub, podeAdmin, groupMetadata, config, prefixoAtivo: prefixoUsado || prefixoGlobal, db, utils: { getAlvo, soNumero, getTexto, downloadMediaMessage, recarregarCanal, naListaNegra, aluguelAtivo, grupoTemAluguel, formatarTempo, adicionarAviso, limparAvisos, DATA_DIR, botEhAdmin, dbLer, dbSalvar, getTextoBotao, ehSubAdmin } });
      } catch (e) {
        console.log("ERRO em " + cmd.nome + ":", e);
        try { await sock.sendMessage(remetente, { text: "🌸 ERRO no comando " + cmd.nome + "\n\n" + e.message }, { quoted: msg }); } catch (_) {}
      }

    } catch (err) { console.error("❌❌❌ ERRO FATAL NO HANDLER:", err); }
  });
}

iniciarBot();