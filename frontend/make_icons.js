const fs = require('fs');
const path = require('path');

// Solid emerald green 1x1 PNG file base64
const greenBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mOMD/j/HwAEfgH9X5O5dwAAAABJRU5ErkJggg==';

const buffer = Buffer.from(greenBase64, 'base64');
const publicDir = path.join(__dirname, 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192.png'), buffer);
fs.writeFileSync(path.join(publicDir, 'pwa-512.png'), buffer);

console.log('✅ PWA Icons generated successfully in public directory!');
