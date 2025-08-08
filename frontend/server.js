import { createServer } from 'http';
import { createReadStream } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 5173;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = createServer((req, res) => {
  let filePath = join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url);
  
  // 如果URL没有扩展名，假设它是一个路由，返回index.html
  if (!extname(filePath)) {
    filePath = join(__dirname, 'dist', 'index.html');
  }

  const contentType = MIME_TYPES[extname(filePath)] || 'application/octet-stream';

  createReadStream(filePath)
    .on('error', () => {
      res.writeHead(404);
      res.end('File not found');
    })
    .on('open', () => {
      res.writeHead(200, { 'Content-Type': contentType });
    })
    .pipe(res);
});

server.listen(PORT, () => {
  console.log(`Frontend server is running on port ${PORT}`);
});
