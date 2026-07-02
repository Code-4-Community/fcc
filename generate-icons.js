const sharp = require('sharp');

async function createIcon(name, bgColor, svgPath) {
  const svg = `<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="${bgColor}" />
    <svg x="8" y="8" width="24" height="24" viewBox="0 0 24 24" fill="white">
      ${svgPath}
    </svg>
  </svg>`;
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(`apps/frontend/public/${name}.png`);
  console.log(`Created ${name}.png`);
}

async function run() {
  await createIcon('facebook', '#1877F2', '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>');
  await createIcon('x', '#000000', '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>');
  await createIcon('linkedin', '#0A66C2', '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>');
}

run();
