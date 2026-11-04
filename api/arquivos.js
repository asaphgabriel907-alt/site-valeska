const { list, del } = require('@vercel/blob');
const { autorizado } = require('./_lib');

// GET: lista os arquivos enviados. POST: apaga os que a corretora não usa mais.
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!autorizado(req)) return res.status(401).json({ erro: 'Senha incorreta ou expirada.' });
  try {
    if (req.method === 'POST') {
      const urls = (req.body && Array.isArray(req.body.urls) ? req.body.urls : []).filter((u) => typeof u === 'string' && /\/f\//.test(u));
      if (urls.length) await del(urls);
      return res.status(200).json({ ok: true, apagados: urls.length });
    }
    const r = await list({ prefix: 'f/', limit: 1000 });
    const assets = r.blobs.map((b) => ({ id: b.url, url: b.url, sizeBytes: b.size }));
    const bytes = assets.reduce((s, a) => s + a.sizeBytes, 0);
    res.status(200).json({ assets, usage: { bytes, maxBytes: 1024 * 1024 * 1024, files: assets.length, maxFiles: 100000 } });
  } catch (e) {
    res.status(500).json({ erro: 'Erro ao acessar os arquivos.' });
  }
};
