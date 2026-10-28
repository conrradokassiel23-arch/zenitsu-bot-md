"use strict";

const crypto = require("crypto");
const { downloadMediaMessage, prepareWAMessageMedia, generateWAMessageFromContent } = require("@itsliaaa/baileys");

const MEDIA_TYPES = ["imageMessage", "videoMessage", "audioMessage", "stickerMessage", "documentMessage"];

function unwrapMessage(message) {
  let m = message;
  for (let i = 0; i < 15 && m; i++) {
    if (m.viewOnceMessage?.message) { m = m.viewOnceMessage.message; continue }
    if (m.viewOnceMessageV2?.message) { m = m.viewOnceMessageV2.message; continue }
    if (m.viewOnceMessageV2Extension?.message) { m = m.viewOnceMessageV2Extension.message; continue }
    if (m.ephemeralMessage?.message) { m = m.ephemeralMessage.message; continue }
    if (m.documentWithCaptionMessage?.message) { m = m.documentWithCaptionMessage.message; continue }
    if (m.editedMessage?.message) { m = m.editedMessage.message; continue }
    if (m.associatedChildMessage?.message) { m = m.associatedChildMessage.message; continue }
    if (m.groupStatusMessage?.message) { m = m.groupStatusMessage.message; continue }
    if (m.groupStatusMessageV2?.message) { m = m.groupStatusMessageV2.message; continue }
    break
  }
  return m || null
}

function getQuotedMessage(msg) {
  const message = unwrapMessage(msg?.message);
  const context = message?.extendedTextMessage?.contextInfo;
  if (!context?.quotedMessage) return null;
  return unwrapMessage(context.quotedMessage)
}

function getMessageType(message) {
  const m = unwrapMessage(message);
  if (!m) return null;
  for (const type of MEDIA_TYPES) if (m[type]) return type;
  if (m.conversation) return "conversation";
  if (m.extendedTextMessage) return "extendedTextMessage";
  return Object.keys(m)[0] || null
}

function getText(message) {
  const m = unwrapMessage(message);
  if (!m) return "";
  return String(
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    m.documentMessage?.caption ||
    m.audioMessage?.caption ||
    ""
  )
}

async function downloadMedia(msg, quoted) {
  const fakeMsg = {
    key: { ...(msg?.key || {}), remoteJid: msg?.key?.remoteJid, id: msg?.key?.id, fromMe: false, participant: msg?.key?.participant },
    message: quoted
  };
  return await downloadMediaMessage(fakeMsg, "buffer", {}, { logger: undefined })
}

async function prepararMidia(carol, type, buffer, original) {
  if (!Buffer.isBuffer(buffer) || !buffer.length) throw new Error("Buffer da mídia inválido.");
  let content = {};

  if (type === "imageMessage") { content.image = buffer; const r = await prepareWAMessageMedia(content, { upload: carol.waUploadToServer }); return r.imageMessage }
  if (type === "videoMessage") { content.video = buffer; const r = await prepareWAMessageMedia(content, { upload: carol.waUploadToServer }); return r.videoMessage }
  if (type === "audioMessage") {
    content.audio = buffer; const r = await prepareWAMessageMedia(content, { upload: carol.waUploadToServer }); const a = r.audioMessage;
    if (original) { if (original.mimetype) a.mimetype = original.mimetype; if (original.seconds != null) a.seconds = original.seconds; if (original.ptt != null) a.ptt = original.ptt; if (original.waveform) a.waveform = original.waveform; }
    return a
  }
  if (type === "stickerMessage") { content.sticker = buffer; const r = await prepareWAMessageMedia(content, { upload: carol.waUploadToServer }); return r.stickerMessage }
  if (type === "documentMessage") {
    content.document = buffer; const r = await prepareWAMessageMedia(content, { upload: carol.waUploadToServer }); const d = r.documentMessage;
    if (original) { if (original.fileName) d.fileName = original.fileName; if (original.mimetype) d.mimetype = original.mimetype; }
    return d
  }
  throw new Error("Tipo de mídia não suportado: " + type)
}

function detectarLink(text) {
  if (typeof text !== "string") return null;
  return text.match(/https?:\/\/[^\s<>"'`]+/i)?.[0] || null
}

function criarLinkPreview(text, options = {}) {
  const url = options["matched-text"] || options.matchedText || detectarLink(text);
  if (!url) return null;
  return {
    "matched-text": url, title: options.title || "CHOOSO BOT", description: options.description || "CHOOSO BOT", previewType: options.previewType ?? 0,
    ...(options.jpegThumbnail ? { jpegThumbnail: options.jpegThumbnail } : {}), ...(options.thumbnail ? { jpegThumbnail: options.thumbnail } : {}), ...(options.canonicalUrl ? { canonicalUrl: options.canonicalUrl } : {}), ...(options.description ? {} : {})
  }
}

function aplicarLinkPreview(message, preview) {
  if (!message || !preview) return message;
  message.linkPreview = preview;
  message.contextInfo = { ...(message.contextInfo || {}), linkPreview: preview };
  return message
}

function aplicarLegenda(message, type, caption) {
  if (!caption) return message;
  if (type === "imageMessage" || type === "videoMessage" || type === "documentMessage") { message.caption = caption }
  return message
}

function criarTextoStatus(text, linkPreview, messageSecret) {
  const extended = { text: String(text || ""), contextInfo: { messageSecret } };
  if (linkPreview) { extended.linkPreview = linkPreview; extended.contextInfo.linkPreview = linkPreview; }
  return { extendedTextMessage: extended }
}

async function criarStatus({ carol, msg, text = "", quoted = null, caption = "", linkPreview = null, messageSecret = crypto.randomBytes(32) }) {
  if (!carol) throw new Error("carol não informado.");
  if (!msg?.key) throw new Error("msg inválida.");

  const texto = String(text || "").trim();
  const legenda = String(caption || "").trim();
  let preview = linkPreview;

  if (preview === true) { preview = criarLinkPreview(texto || legenda); }
  if (typeof preview === "string") { preview = criarLinkPreview(preview); }

  if (!quoted) {
    if (!texto) throw new Error("Nenhum texto ou mídia informado.");
    return { messageSecret, innerMsg: criarTextoStatus(texto, preview, messageSecret) }
  }

  const type = getMessageType(quoted);
  if (!type) throw new Error("Não foi possível identificar a mensagem.");

  if (type === "conversation" || type === "extendedTextMessage") {
    const textoQuoted = getText(quoted) || texto || legenda;
    if (!textoQuoted) throw new Error("A mensagem de texto está vazia.");
    if (!preview) preview = criarLinkPreview(textoQuoted);
    return { messageSecret, innerMsg: criarTextoStatus(textoQuoted, preview, messageSecret) }
  }

  if (MEDIA_TYPES.includes(type)) {
    const original = unwrapMessage(quoted);
    const buffer = await downloadMedia(msg, original);
    if (!Buffer.isBuffer(buffer) || !buffer.length) throw new Error("Não foi possível baixar a mídia.");
    const media = await prepararMidia(carol, type, buffer, original[type]);
    if (!media) throw new Error("Não foi possível preparar a mídia.");

    const legendaFinal = legenda || getText(original) || "";
    aplicarLegenda(media, type, legendaFinal);
    if (!preview && legendaFinal) { preview = criarLinkPreview(legendaFinal); }

    media.contextInfo = { ...(media.contextInfo || {}), messageSecret };
    if (preview) { media.linkPreview = preview; media.contextInfo.linkPreview = preview; }
    
    return { messageSecret, innerMsg: { [type]: media } }
  }

  throw new Error("Tipo de mensagem não suportado: " + type)
}

async function enviarStatus({ carol, from, msg, text = "", quoted = null, caption = "", linkPreview = null }) {
  const { innerMsg, messageSecret } = await criarStatus({ carol, msg, text, quoted, caption, linkPreview });
  if (!innerMsg) throw new Error("Mensagem do status não criada.");

  const tipo = Object.keys(innerMsg)[0];
  if (tipo && innerMsg[tipo]) {
    innerMsg[tipo].contextInfo = { ...(innerMsg[tipo].contextInfo || {}), isGroupStatus: true };
  }

  const statusMsg = generateWAMessageFromContent(from, {
    messageContextInfo: { messageSecret },
    groupStatusMessageV2: { message: innerMsg }
  }, { userJid: carol.user.id });

  await carol.relayMessage(from, statusMsg.message, { messageId: statusMsg.key.id });
  return statusMsg
}

module.exports = {
  unwrapMessage, getQuotedMessage, getMessageType, getText, downloadMedia, prepararMidia, detectarLink, criarLinkPreview, aplicarLinkPreview, aplicarLegenda, criarTextoStatus, criarStatus, enviarStatus
};