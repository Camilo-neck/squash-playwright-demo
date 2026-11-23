// Servidor de la app demo. Sin dependencias: solo módulos nativos de Node.
// Uso: node server.js   (PORT opcional, por defecto 3000)
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const ROOT = path.join(__dirname, 'app');

const USERS = {
  admin: { password: 'Admin123!', role: 'admin' },
  qa: { password: 'Qa12345!', role: 'qa' },
  bloqueado: { password: 'Bloq123!', role: 'qa', locked: true },
};

const PRODUCTS = [
  { id: 1, name: 'Teclado mecánico', price: 89.9, stock: 14 },
  { id: 2, name: 'Mouse inalámbrico', price: 35.5, stock: 40 },
  { id: 3, name: 'Monitor 27"', price: 329, stock: 6 },
  { id: 4, name: 'Webcam HD', price: 59.99, stock: 0 },
  { id: 5, name: 'Auriculares USB', price: 45, stock: 22 },
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch {
        resolve(null);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = url;

  // ---------- API ----------
  if (pathname === '/api/status' && req.method === 'GET') {
    return sendJson(res, 200, { status: 'ok', version: '1.0.0' });
  }

  if (pathname === '/api/products' && req.method === 'GET') {
    return sendJson(res, 200, PRODUCTS);
  }

  const productMatch = pathname.match(/^\/api\/products\/(\d+)$/);
  if (productMatch && req.method === 'GET') {
    const product = PRODUCTS.find((p) => p.id === Number(productMatch[1]));
    return product
      ? sendJson(res, 200, product)
      : sendJson(res, 404, { error: 'Producto no encontrado' });
  }

  if (pathname === '/api/login' && req.method === 'POST') {
    const body = await readBody(req);
    if (!body) return sendJson(res, 400, { error: 'JSON inválido' });
    const user = USERS[body.username];
    if (!user || user.password !== body.password) {
      return sendJson(res, 401, { error: 'Usuario o contraseña incorrectos' });
    }
    if (user.locked) {
      return sendJson(res, 423, { error: 'Usuario bloqueado. Contacte al administrador' });
    }
    return sendJson(res, 200, {
      token: Buffer.from(`${body.username}:${Date.now()}`).toString('base64'),
      username: body.username,
      role: user.role,
    });
  }

  if (pathname.startsWith('/api/')) {
    return sendJson(res, 404, { error: 'Ruta no encontrada' });
  }

  // ---------- Estáticos ----------
  const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
  const filePath = path.normalize(path.join(ROOT, relative));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Prohibido');
  }
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('No encontrado');
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`App demo escuchando en http://localhost:${PORT}`);
});
