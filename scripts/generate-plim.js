/**
 * Gera o som "plim" do fim do descanso: assets/sounds/plim.wav
 * Dois tons curtos com decaimento suave (tipo campainha), sintetizados aqui mesmo.
 *
 * Para mudar o som, ajuste NOTES e rode:  node scripts/generate-plim.js
 */
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 22050;
const VOLUME = 0.6;

// Cada nota: frequência (Hz), início (s), duração (s)
const NOTES = [
  { freq: 1318.5, start: 0, duration: 0.35 }, // Mi 6
  { freq: 1760.0, start: 0.13, duration: 0.6 }, // Lá 6
];

const totalSeconds = Math.max(...NOTES.map((n) => n.start + n.duration));
const totalSamples = Math.ceil(totalSeconds * SAMPLE_RATE);
const samples = new Float32Array(totalSamples);

for (const note of NOTES) {
  const first = Math.floor(note.start * SAMPLE_RATE);
  const length = Math.floor(note.duration * SAMPLE_RATE);
  for (let i = 0; i < length && first + i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const attack = Math.min(1, t / 0.005); // evita estalo no começo
    const decay = Math.exp(-t * 7);
    const tone =
      Math.sin(2 * Math.PI * note.freq * t) + 0.3 * Math.sin(2 * Math.PI * note.freq * 2 * t); // harmônico "brilho"
    samples[first + i] += tone * attack * decay;
  }
}

// Normaliza e converte para PCM 16 bits
const peak = Math.max(...samples.map(Math.abs)) || 1;
const pcm = Buffer.alloc(totalSamples * 2);
samples.forEach((value, i) => pcm.writeInt16LE(Math.round((value / peak) * VOLUME * 32767), i * 2));

// Cabeçalho WAV (mono, 16 bits)
const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + pcm.length, 4);
header.write('WAVE', 8);
header.write('fmt ', 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20); // PCM
header.writeUInt16LE(1, 22); // mono
header.writeUInt32LE(SAMPLE_RATE, 24);
header.writeUInt32LE(SAMPLE_RATE * 2, 28);
header.writeUInt16LE(2, 32);
header.writeUInt16LE(16, 34);
header.write('data', 36);
header.writeUInt32LE(pcm.length, 40);

const out = path.join(__dirname, '..', 'assets', 'sounds', 'plim.wav');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, Buffer.concat([header, pcm]));
console.log(`Gerado ${out} (${totalSeconds.toFixed(2)} s)`);
