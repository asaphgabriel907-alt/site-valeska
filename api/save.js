const { put } = require('@vercel/blob');
const { DATA, autorizado } = require('./_lib');

// Só a corretora (com a senha) grava os dados.
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método inválido.' });
  if (!autorizado(req)) return res.status(401).json({ erro: 'Senha incorreta ou expirada. Entre de novo.' });
  const d = req.body;
  if (!d || typeof d !== 'object' || typeof d.imoveis !== 'object') {
    return res.status(400).json({ erro: 'Dados inválidos.' });
  }
  const texto = JSON.stringify({ config: d.config || null, imoveis: d.imoveis || {} });
  if (texto.length > 3 * 1024 * 1024) return res.status(413).json({ erro: 'Dados grandes demais.' });
  try {
    await put(DATA, texto, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
      cacheControlMaxAge: 60,
    });
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ erro: 'Não foi possível salvar: ' + (e && e.message ? e.message : 'erro') });
  }
};
