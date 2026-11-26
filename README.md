# TuturSuara 🎙️

**TuturSuara** adalah aplikasi web Text-to-Speech (TTS) modern untuk Bahasa Indonesia berbasis AI yang ditenagai oleh model Google Gemini (`gemini-3.8-flash-tts`). Aplikasi ini menghasilkan suara manusia yang natural dengan intonasi dan pelafalan khas Indonesia, dilengkapi pemutar audio interaktif serta fitur unduhan instan.

---

## ✨ Fitur Utama

- 🎙️ **Karakter Suara Natural:** Pilihan karakter suara pria autentik (*Orus*, *Puck*, *Charon*, dan *Fenrir*).
- 🗣️ **Preset Gaya Bicara:** Berbagai pilihan gaya intonasi seperti santai/percakapan, narasi storytelling, presentasi formal, hingga promosi/iklan.
- 📊 **Visualisasi Waveform:** Pemutar audio bawaan dengan bar gelombang suara real-time.
- 💾 **Dukungan Format Ganda:** Unduh hasil audio langsung dalam format **WAV** tanpa kompresi atau **MP3** hemat ruang.
- ⚡ **UI Ringan & Responsif:** Dibangun menggunakan React 19 dan Tailwind CSS v4 dengan animasi yang halus.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Vite
- **Backend:** Express.js, `@google/genai` (Google Gen AI SDK)
- **Audio Processing:** `@breezystack/lamejs` (konversi PCM ke MP3)
- **AI Model:** `gemini-3.8-flash-tts`

---

## 🚀 Panduan Memulai

### Prasyarat
Pastikan Anda sudah menginstal:
- [Node.js](https://nodejs.org/) (versi 18 ke atas disarankan)
- Kunci API Google Gemini (dapat diperoleh gratis di [Google AI Studio](https://aistudio.google.com/app/apikey))

### 1. Instalasi Dependensi
Clone repositori dan pasang semua pustaka yang dibutuhkan:
```bash
git clone https://github.com/CemaraIT/TTS.git
cd TTS
npm install
```

### 2. Konfigurasi Environment
Buat file `.env` di folder utama (root) proyek:
```bash
cp .env.example .env
```

Buka file `.env` lalu masukkan API Key Gemini Anda:
```env
GEMINI_API_KEY="AIzaSy_kunci_api_gemini_anda"
PORT=3000
```

### 3. Menjalankan Aplikasi
Jalankan server aplikasi dalam mode pengembangan:
```bash
npm run dev
```

Buka browser Anda dan akses:
```
http://localhost:3000
```

---

## 📜 Skrip yang Tersedia

- `npm run dev` : Menjalankan server backend Express dan frontend Vite dalam mode pengembangan.
- `npm run build` : Melakukan build aplikasi frontend untuk produksi.
- `npm run start` : Menjalankan server aplikasi di lingkungan produksi.
- `npm run lint` : Menjalankan pemeriksaan tipe data dengan TypeScript.
