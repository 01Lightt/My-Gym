/**
 * Gera o ícone do app e a imagem da tela de abertura, no estilo do Menu do Wii,
 * desenhando tudo em código (sem baixar imagens):
 *   - bloco branco arredondado com contorno azul-ciano e brilho de vidro
 *   - halter azul (gradiente Wii) no centro
 *   - fundo cinza claro com listras finas
 *
 * Para mudar cores/tamanhos, ajuste as constantes abaixo e rode:
 *   node scripts/generate-icons.js
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.join(__dirname, '..', 'assets', 'images');

const COLORS = {
  bgTop: [0xf4, 0xf4, 0xf4],
  bgBottom: [0xdc, 0xdc, 0xdc],
  stripe: [0x00, 0x00, 0x00, 0.04],
  tileTop: [0xff, 0xff, 0xff],
  tileBottom: [0xec, 0xec, 0xec],
  cyan: [0x34, 0xbe, 0xed],
  dumbbellTop: [0x5c, 0xd0, 0xf5],
  dumbbellBottom: [0x1a, 0x9b, 0xd7],
};

// ---------- Desenho por "distância até a forma" (bordas suaves) ----------

/** Distância com sinal até um retângulo arredondado centrado em (cx, cy). Negativo = dentro. */
function roundedRect(x, y, cx, cy, halfW, halfH, r) {
  const qx = Math.abs(x - cx) - (halfW - r);
  const qy = Math.abs(y - cy) - (halfH - r);
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  return outside + Math.min(Math.max(qx, qy), 0) - r;
}

/** Quanto do pixel está coberto pela forma (0..1), com borda suavizada. */
const coverage = (distance) => Math.min(1, Math.max(0, 0.5 - distance));

const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

/** Halter centrado em (cx, cy), escala s (1 = cabe em ~500px). Retorna distância. */
function dumbbell(x, y, cx, cy, s) {
  const bar = roundedRect(x, y, cx, cy, 170 * s, 22 * s, 22 * s);
  const plateIn = Math.min(
    roundedRect(x, y, cx - 120 * s, cy, 30 * s, 105 * s, 26 * s),
    roundedRect(x, y, cx + 120 * s, cy, 30 * s, 105 * s, 26 * s),
  );
  const plateOut = Math.min(
    roundedRect(x, y, cx - 185 * s, cy, 24 * s, 70 * s, 20 * s),
    roundedRect(x, y, cx + 185 * s, cy, 24 * s, 70 * s, 20 * s),
  );
  return Math.min(bar, plateIn, plateOut);
}

/**
 * Desenha uma imagem RGBA size×size.
 * layers: { background, tile, dumbbell, monochrome } escolhem o que entra.
 * tileScale: tamanho do bloco em fração da imagem.
 */
function render(size, { background = false, tile = true, mono = false, tileScale = 0.68 }) {
  const px = new Float64Array(size * size * 4); // RGBA 0..1 (cor pré-multiplicada não usada)
  const k = size / 1024; // tudo é desenhado numa grade de 1024 e escalado
  const c = size / 2;
  const half = (1024 * tileScale * k) / 2;
  const radius = half * 0.3;
  const border = 14 * k * (tileScale / 0.68);
  const s = (tileScale / 0.68) * k * 1.3; // tamanho do halter dentro do bloco

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const sx = x + 0.5;
      const sy = y + 0.5;
      let rgb = [0, 0, 0];
      let a = 0;

      const paint = (color, alpha) => {
        // "source over"
        const outA = alpha + a * (1 - alpha);
        if (outA > 0) rgb = rgb.map((v, i) => (color[i] * alpha + v * a * (1 - alpha)) / outA);
        a = outA;
      };

      if (background) {
        paint(mix(COLORS.bgTop, COLORS.bgBottom, y / size), 1);
        if (Math.floor(y / (3 * k)) % 1 === 0 && Math.floor(y / k) % 3 === 0) {
          paint(COLORS.stripe.slice(0, 3), COLORS.stripe[3]);
        }
      }

      if (mono) {
        paint([255, 255, 255], coverage(dumbbell(sx, sy, c, c, s * 0.9)));
      } else if (tile) {
        const d = roundedRect(sx, sy, c, c, half, half, radius);
        // Sombra suave embaixo do bloco
        const shadow = roundedRect(sx, sy, c, c + 10 * k, half, half, radius);
        paint([0, 0, 0], Math.max(0, 0.18 * (1 - Math.min(1, Math.max(0, shadow) / (24 * k)))) * (d > 0 ? 1 : 0));
        // Contorno ciano e corpo branco do bloco
        paint(COLORS.cyan, coverage(d));
        const inner = d + border;
        paint(mix(COLORS.tileTop, COLORS.tileBottom, (sy - (c - half)) / (2 * half)), coverage(inner));
        // Halter azul com gradiente e brilho na metade de cima
        const db = dumbbell(sx, sy, c, c + 6 * k, s);
        const t = (sy - (c - 110 * s)) / (220 * s);
        paint(mix(COLORS.dumbbellTop, COLORS.dumbbellBottom, Math.min(1, Math.max(0, t))), coverage(db));
        if (sy < c) paint([255, 255, 255], coverage(db) * 0.22);
        // Brilho de vidro no topo do bloco, sumindo aos poucos até o meio
        const fade = 1 - (sy - (c - half)) / half;
        if (fade > 0) paint([255, 255, 255], 0.3 * fade * coverage(inner + 6 * k));
      }

      const i = (y * size + x) * 4;
      px[i] = rgb[0];
      px[i + 1] = rgb[1];
      px[i + 2] = rgb[2];
      px[i + 3] = a;
    }
  }
  return px;
}

// ---------- PNG (RGBA 8 bits) só com o zlib do Node ----------

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function writePng(file, size, px) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // sem filtro
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = Math.round(px[i]);
      raw[o + 1] = Math.round(px[i + 1]);
      raw[o + 2] = Math.round(px[i + 2]);
      raw[o + 3] = Math.round(px[i + 3] * 255);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bits
  ihdr[9] = 6; // RGBA
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  fs.writeFileSync(path.join(OUT, file), png);
  console.log(`Gerado assets/images/${file} (${size}×${size})`);
}

// ---------- Arquivos ----------

// Ícone geral (fundo + bloco)
writePng('icon.png', 1024, render(1024, { background: true, tileScale: 0.72 }));
// Android adaptativo: o sistema recorta em círculo/squircle, então o bloco fica dentro da área segura (~66%)
writePng('android-icon-background.png', 1024, render(1024, { background: true, tile: false }));
writePng('android-icon-foreground.png', 1024, render(1024, { tileScale: 0.52 }));
writePng('android-icon-monochrome.png', 1024, render(1024, { mono: true, tileScale: 0.52 }));
// Tela de abertura e favicon (web)
writePng('splash-icon.png', 512, render(512, { tileScale: 0.96 }));
writePng('favicon.png', 48, render(48, { background: true, tileScale: 0.86 }));
