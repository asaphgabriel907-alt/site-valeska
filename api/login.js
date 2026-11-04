const { autorizado } = require('./_lib');

// Confere a senha da corretora.
module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ ok: false, erro: 'A senha ainda não foi configurada na Vercel.' });
  }
  if (autorizado(req)) return res.status(200).json({ ok: true });
  await new Promise((r) => setTimeout(r, 800));
  res.status(401).json({ ok: false, erro: 'Senha incorreta.' });
};
