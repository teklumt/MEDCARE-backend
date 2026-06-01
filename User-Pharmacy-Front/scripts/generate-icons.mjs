import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const svg = readFileSync(join(root, 'public/icons/icon.svg'));

const sizes = [
  { name: 'icon-72.png',   size: 72  },
  { name: 'icon-96.png',   size: 96  },
  { name: 'icon-128.png',  size: 128 },
  { name: 'icon-144.png',  size: 144 },
  { name: 'icon-152.png',  size: 152 },
  { name: 'icon-192.png',  size: 192 },
  { name: 'icon-384.png',  size: 384 },
  { name: 'icon-512.png',  size: 512 },
  // Apple touch icon (no rounded corners — iOS adds them)
  { name: 'apple-touch-icon.png', size: 180 },
];

for (const { name, size } of sizes) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(join(root, 'public/icons', name));
  console.log(`✓ ${name}`);
}

console.log('\nAll icons generated in public/icons/');
