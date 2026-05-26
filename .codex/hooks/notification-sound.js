#!/usr/bin/env node
/**
 * Notification Sound Hook — plays cricket chirp on Stop event
 * @version 1.0.0
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const WAV_PATH = path.join(__dirname, 'sounds', 'cricket.wav');

/**
 * Generate a realistic cricket chirp WAV file (pure Node.js, no dependencies)
 * Based on Cornell ECE4760 cricket synthesis research.
 *
 * Real cricket sound = discrete sine bursts (syllables), NOT continuous tone + tremolo.
 * Each syllable is one wing-scrape: short pure-tone burst with fast attack/decay.
 * A chirp = a group of syllables fired in quick succession.
 *
 * Reference: people.ece.cornell.edu/land/courses/ece4760/labs/f2017/lab2_cricket.html
 */
function generateCricketWav() {
  const sampleRate = 44100;
  const bitsPerSample = 16;
  const channels = 1;
  const TWO_PI = 2 * Math.PI;

  // --- Cricket parameters (based on Gryllus field cricket) ---
  const burstFreq = 4500;        // carrier frequency (Hz)
  const syllableMs = 22;         // each syllable (sine burst) duration
  const syllableGapMs = 14;      // silence between syllables within a chirp
  const syllablesPerChirp = 4;   // syllables in one chirp
  const chirpGapMs = 220;        // silence between chirps
  const chirpCount = 3;          // number of chirps
  const attackMs = 4;            // amplitude ramp up
  const decayMs = 4;             // amplitude ramp down

  // Convert to samples
  const syllableSamples = Math.floor(sampleRate * syllableMs / 1000);
  const syllableGapSamples = Math.floor(sampleRate * syllableGapMs / 1000);
  const chirpGapSamples = Math.floor(sampleRate * chirpGapMs / 1000);
  const attackSamples = Math.floor(sampleRate * attackMs / 1000);
  const decaySamples = Math.floor(sampleRate * decayMs / 1000);

  // Calculate total samples
  const onChirpSamples = syllablesPerChirp * syllableSamples
                       + (syllablesPerChirp - 1) * syllableGapSamples;
  const totalSamples = chirpCount * onChirpSamples
                     + (chirpCount - 1) * chirpGapSamples;

  const dataSize = totalSamples * channels * (bitsPerSample / 8);
  const headerSize = 44;
  const buf = Buffer.alloc(headerSize + dataSize);

  // WAV header
  buf.write('RIFF', 0);
  buf.writeUInt32LE(headerSize + dataSize - 8, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(channels, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * channels * bitsPerSample / 8, 28);
  buf.writeUInt16LE(channels * bitsPerSample / 8, 32);
  buf.writeUInt16LE(bitsPerSample, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);

  // PCM data: chirps → syllables → sine bursts
  let offset = headerSize;

  for (let c = 0; c < chirpCount; c++) {
    for (let s = 0; s < syllablesPerChirp; s++) {
      // Each syllable: a sine burst with fast attack/decay envelope
      for (let i = 0; i < syllableSamples; i++) {
        let envelope = 1.0;
        if (i < attackSamples) {
          envelope = i / attackSamples;
        } else if (i > syllableSamples - decaySamples) {
          envelope = (syllableSamples - i) / decaySamples;
        }

        const t = i / sampleRate;
        const sample = Math.sin(TWO_PI * burstFreq * t) * envelope * 0.65;
        const int16 = Math.max(-32768, Math.min(32767, Math.round(sample * 32767)));
        buf.writeInt16LE(int16, offset);
        offset += 2;
      }

      // Syllable gap (silence) — skip after last syllable in chirp
      if (s < syllablesPerChirp - 1) {
        offset += syllableGapSamples * 2; // zero-filled
      }
    }

    // Chirp gap (longer silence between chirp groups)
    if (c < chirpCount - 1) {
      offset += chirpGapSamples * 2;
    }
  }

  fs.mkdirSync(path.dirname(WAV_PATH), { recursive: true });
  fs.writeFileSync(WAV_PATH, buf);
}

/**
 * Play the WAV file in a detached process (non-blocking)
 */
function playCricket() {
  // Always regenerate if script is newer than WAV
  const scriptMtime = fs.statSync(__filename).mtimeMs;
  const wavExists = fs.existsSync(WAV_PATH);
  const wavOld = wavExists && fs.statSync(WAV_PATH).mtimeMs < scriptMtime;
  if (!wavExists || wavOld) {
    generateCricketWav();
  }

  const wavAbsolute = path.resolve(WAV_PATH).replace(/\//g, '\\');

  // Windows: use PowerShell SoundPlayer in a detached process
  const ps = spawn('powershell', [
    '-NoProfile', '-Command',
    `(New-Object System.Media.SoundPlayer '${wavAbsolute}').PlaySync()`
  ], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true
  });
  ps.unref();
}

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  try {
    playCricket();
  } catch {
    // Silent failure — never block Stop
  }

  console.log(JSON.stringify({ result: 'continue' }));
}

main();
