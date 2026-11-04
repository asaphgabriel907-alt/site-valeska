const { put } = require('@vercel/blob');
const { autorizado, lerCorpo } = require('./_lib');

const TIPOS = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
  'video/mp4': 'mp4', 'video/webm': 'webm',
};

// Recebe uma foto (ou vídeo curto) e guarda no Blob. Limite da Vercel: 4,5 MB.
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método inválido.' });
  if (!autorizado(req)) return res.status(401).json({ erro: 'Senha incorreta ou expirada. Entre de novo.' });
  const tipo = String(req.query.type || '');
  const ext = TIPOS[tipo];
  if (!ext) return res.status(400).json({ erro: 'Tipo de arquivo não aceito.' });
  try {
    const corpo = await lerCorpo(req);
    if (!corpo.length) return res.status(400).json({ erro: 'Arquivo vazio.' });
    if (corpo.length > 4.4 * 1024 * 1024) {
      return res.status(413).json({ erro: 'Arquivo grande demais (máximo 4 MB). Fotos são reduzidas sozinhas; vídeos precisam ser curtos.' });
    }
    const b = await put('f/arquivo.' + ext, corpo, { access: 'public', addRandomSuffix: true, contentType: tipo });
    res.status(200).json({ id: b.url, url: b.url, size: corpo.length, contentType: tipo });
  } catch (e) {
    res.status(500).json({ erro: 'Falha ao enviar: ' + (e && e.message ? e.message : 'erro') });
  }
};
module.exports.config = { api: { bodyParser: false } };
