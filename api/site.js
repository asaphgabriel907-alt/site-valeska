const { lerDados } = require('./_lib');

// Qualquer visitante lê os dados do site.
module.exports = async (req, res) => {
  try {
    const d = await lerDados();
    res.setHeader('Cache-Control', 'public, s-maxage=20, stale-while-revalidate=120');
    res.status(200).json(d || { config: null, imoveis: {} });
  } catch (e) {
    res.status(500).json({ erro: 'Não foi possível ler os dados.' });
  }
};
