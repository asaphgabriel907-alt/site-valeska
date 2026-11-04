const { list } = require('@vercel/blob');
const crypto = require('crypto');

const DATA = 'site/data.json';

function autorizado(req) {
  const senha = String(req.headers['x-admin-password'] || '');
  const certa = String(process.env.ADMIN_PASSWORD || '');
  if (!certa) return false;
  const a = Buffer.from(senha);
  const b = Buffer.from(certa);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function lerDados() {
  const r = await list({ prefix: DATA, limit: 1 });
  if (!r.blobs.length) return null;
  const f = await fetch(r.blobs[0].url + '?t=' + Date.now(), { cache: 'no-store' });
  if (!f.ok) return null;
  return await f.json();
}

async function lerCorpo(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  const partes = [];
  for await (const p of req) partes.push(p);
  return Buffer.concat(partes);
}

module.exports = { DATA, autorizado, lerDados, lerCorpo };
