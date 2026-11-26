import "dotenv/config";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const ALLOWED_VOICES = new Set(["Puck", "Charon", "Fenrir", "Orus"]);
const MAX_TEXT_LENGTH = 5000;

interface ParsedWav {
  wavBuffer: Buffer;
  sampleRate: number;
  numChannels: number;
  bitsPerSample: number;
  pcmData: Buffer;
  durationSeconds: number;
}

function buildWavHeader(pcmByteLength: number, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const header = Buffer.alloc(44);
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcmByteLength, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // PCM subchunk size
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcmByteLength, 40);

  return header;
}

function parseOrWrapWav(rawBuffer: Buffer): ParsedWav {
  const isRiffWave =
    rawBuffer.length >= 44 &&
    rawBuffer.toString("ascii", 0, 4) === "RIFF" &&
    rawBuffer.toString("ascii", 8, 12) === "WAVE";

  if (!isRiffWave) {
    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const wavHeader = buildWavHeader(rawBuffer.length, sampleRate, numChannels, bitsPerSample);
    const wavBuffer = Buffer.concat([wavHeader, rawBuffer]);
    const bytesPerSecond = (sampleRate * numChannels * bitsPerSample) / 8;
    return {
      wavBuffer,
      sampleRate,
      numChannels,
      bitsPerSample,
      pcmData: rawBuffer,
      durationSeconds: rawBuffer.length / bytesPerSecond,
    };
  }

  let sampleRate = 24000;
  let numChannels = 1;
  let bitsPerSample = 16;
  let dataOffset = 44;
  let dataSize = rawBuffer.length - 44;

  let offset = 12;
  while (offset + 8 <= rawBuffer.length) {
    const chunkId = rawBuffer.toString("ascii", offset, offset + 4);
    const chunkSize = rawBuffer.readUInt32LE(offset + 4);
    const chunkDataStart = offset + 8;

    if (chunkId === "fmt " && chunkDataStart + 16 <= rawBuffer.length) {
      numChannels = rawBuffer.readUInt16LE(chunkDataStart + 2);
      sampleRate = rawBuffer.readUInt32LE(chunkDataStart + 4);
      bitsPerSample = rawBuffer.readUInt16LE(chunkDataStart + 14);
    } else if (chunkId === "data") {
      dataOffset = chunkDataStart;
      dataSize = Math.min(chunkSize, rawBuffer.length - chunkDataStart);
      break;
    }

    offset = chunkDataStart + chunkSize + (chunkSize % 2);
  }

  const pcmData = rawBuffer.subarray(dataOffset, dataOffset + dataSize);
  const bytesPerSecond = Math.max(1, (sampleRate * numChannels * bitsPerSample) / 8);

  return {
    wavBuffer: rawBuffer,
    sampleRate,
    numChannels,
    bitsPerSample,
    pcmData,
    durationSeconds: pcmData.length / bytesPerSecond,
  };
}

async function encodePcmToMp3(pcmData: Buffer, sampleRate: number, numChannels: number): Promise<Buffer> {
  const { Mp3Encoder } = await import("@breezystack/lamejs");
  const usableByteLength = pcmData.length - (pcmData.length % 2);
  const alignedArrayBuffer = pcmData.buffer.slice(
    pcmData.byteOffset,
    pcmData.byteOffset + usableByteLength
  );
  const samples = new Int16Array(alignedArrayBuffer);
  const encoder = new Mp3Encoder(numChannels, sampleRate, 128);
  const mp3Chunks: Buffer[] = [];
  const blockSize = 1152;

  if (numChannels === 1) {
    for (let i = 0; i < samples.length; i += blockSize) {
      const chunk = samples.subarray(i, i + blockSize);
      const encoded = encoder.encodeBuffer(chunk);
      if (encoded.length > 0) {
        mp3Chunks.push(Buffer.from(encoded));
      }
    }
  } else {
    const frameCount = Math.floor(samples.length / 2);
    const left = new Int16Array(frameCount);
    const right = new Int16Array(frameCount);
    for (let i = 0; i < frameCount; i++) {
      left[i] = samples[i * 2];
      right[i] = samples[i * 2 + 1];
    }
    for (let i = 0; i < frameCount; i += blockSize) {
      const leftChunk = left.subarray(i, i + blockSize);
      const rightChunk = right.subarray(i, i + blockSize);
      const encoded = encoder.encodeBuffer(leftChunk, rightChunk);
      if (encoded.length > 0) {
        mp3Chunks.push(Buffer.from(encoded));
      }
    }
  }

  const finalChunk = encoder.flush();
  if (finalChunk.length > 0) {
    mp3Chunks.push(Buffer.from(finalChunk));
  }

  return Buffer.concat(mp3Chunks);
}

function extractWaveformPeaks(pcmData: Buffer, barCount = 48): number[] {
  const usableByteLength = pcmData.length - (pcmData.length % 2);
  if (usableByteLength < 4) {
    return Array.from({ length: barCount }, () => 0.2);
  }
  const alignedArrayBuffer = pcmData.buffer.slice(
    pcmData.byteOffset,
    pcmData.byteOffset + usableByteLength
  );
  const samples = new Int16Array(alignedArrayBuffer);
  const step = Math.max(1, Math.floor(samples.length / barCount));
  const rawPeaks: number[] = [];

  for (let bar = 0; bar < barCount; bar++) {
    const start = bar * step;
    const end = Math.min(samples.length, start + step);
    let maxAmp = 0;
    const stride = Math.max(1, Math.floor((end - start) / 40));
    for (let i = start; i < end; i += stride) {
      const amp = Math.abs(samples[i]) / 32768;
      if (amp > maxAmp) {
        maxAmp = amp;
      }
    }
    rawPeaks.push(maxAmp);
  }

  const peakMax = Math.max(0.05, ...rawPeaks);
  return rawPeaks.map((p) => Number(Math.max(0.14, Math.min(1, p / peakMax)).toFixed(2)));
}

function createGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("MISSING_GEMINI_API_KEY");
  }
  return new GoogleGenAI({
    apiKey,
    apiVersion: "v1beta",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));

  app.post("/api/tts", async (req, res) => {
    try {
      const { text, voiceName, stylePrompt } = req.body ?? {};

      if (typeof text !== "string" || text.trim().length === 0) {
        res.status(400).json({ error: "Naskah teks tidak boleh kosong." });
        return;
      }

      const cleanText = text.trim();
      if (cleanText.length > MAX_TEXT_LENGTH) {
        res.status(400).json({
          error: `Naskah terlalu panjang. Maksimal ${MAX_TEXT_LENGTH} karakter.`,
        });
        return;
      }

      const selectedVoice =
        typeof voiceName === "string" && ALLOWED_VOICES.has(voiceName)
          ? voiceName
          : "Orus";

      const cleanStyle =
        typeof stylePrompt === "string" && stylePrompt.trim().length > 0
          ? stylePrompt.trim()
          : "Natural, warm, conversational Indonesian speaking style";

      const effectiveStyle = `Speak naturally in fluent Indonesian (Bahasa Indonesia) with authentic native pronunciation, natural breathing pauses, and human-like intonation. Delivery style: ${cleanStyle}`;

      const ai = createGeminiClient();

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash-tts",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: cleanText,
                speechMetadata: {
                  style: effectiveStyle,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: selectedVoice,
              },
            },
          },
        },
      });

      const audioPart = response.candidates?.[0]?.content?.parts?.find(
        (part) => part.inlineData?.data
      );
      const base64Audio = audioPart?.inlineData?.data;

      if (!base64Audio) {
        res.status(502).json({
          error: "Model tidak mengembalikan data audio. Silakan coba lagi dengan naskah lain.",
        });
        return;
      }

      const rawBuffer = Buffer.from(base64Audio, "base64");
      const parsed = parseOrWrapWav(rawBuffer);
      const mp3Buffer = await encodePcmToMp3(
        parsed.pcmData,
        parsed.sampleRate,
        parsed.numChannels
      );
      const waveform = extractWaveformPeaks(parsed.pcmData, 48);

      res.json({
        voiceName: selectedVoice,
        sampleRate: parsed.sampleRate,
        channels: parsed.numChannels,
        durationSeconds: Number(parsed.durationSeconds.toFixed(2)),
        wavBytes: parsed.wavBuffer.length,
        mp3Bytes: mp3Buffer.length,
        wavBase64: parsed.wavBuffer.toString("base64"),
        mp3Base64: mp3Buffer.toString("base64"),
        waveform,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const status =
        typeof (err as { status?: unknown })?.status === "number"
          ? (err as { status: number }).status
          : 500;
      console.error("[TTS API Error]:", status, errorMessage, err);

      if (errorMessage === "MISSING_GEMINI_API_KEY") {
        res.status(500).json({
          error: "GEMINI_API_KEY belum tersedia di konfigurasi server (Settings > Secrets).",
        });
        return;
      }

      if (
        status === 403 ||
        errorMessage.includes("403") ||
        errorMessage.includes("PERMISSION_DENIED") ||
        errorMessage.includes("API_KEY_INVALID")
      ) {
        res.status(403).json({
          error: "Akses Gemini API ditolak atau API key tidak valid. Periksa GEMINI_API_KEY di Settings > Secrets.",
          detail: errorMessage,
        });
        return;
      }

      if (
        status === 429 ||
        errorMessage.includes("429") ||
        errorMessage.includes("RESOURCE_EXHAUSTED")
      ) {
        res.status(429).json({
          error: "Kuota permintaan sementara penuh. Tunggu beberapa saat lalu coba lagi.",
          detail: errorMessage,
        });
        return;
      }

      if (
        status === 400 ||
        status === 404 ||
        errorMessage.includes("INVALID_ARGUMENT") ||
        errorMessage.includes("NOT_FOUND")
      ) {
        res.status(status).json({
          error: `Permintaan TTS ditolak oleh model (${status}): ${errorMessage}`,
        });
        return;
      }

      res.status(500).json({
        error: `Gagal membuat suara dari naskah: ${errorMessage}`,
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("/{*path}", (_req, res) => {
      const indexFile = path.join(distPath, "index.html");
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send("Build files not found.");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TuturSuara server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
