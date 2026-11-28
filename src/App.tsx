import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  Download,
  Eraser,
  KeyRound,
  Loader2,
  Mic,
  Play,
  Trash2,
  Volume2,
} from "lucide-react";
import { AudioPlayerCard } from "./components/AudioPlayerCard";
import { Header } from "./components/Header";
import { SettingsModal } from "./components/SettingsModal";
import {
  SAMPLE_SCRIPTS,
  SPEAKING_STYLES,
  VOICE_OPTIONS,
} from "./data/ttsPresets";
import type { GeneratedAudioTake, VoiceGender, VoiceId } from "./types/tts";

const MAX_CHARS = 5000;
const API_KEY_STORAGE_KEY = "tutursuara_gemini_api_key";

function formatDurationBadge(seconds: number): string {
  const rounded = Math.max(1, Math.round(seconds));
  if (rounded < 60) return `${rounded} dtk`;
  const mins = Math.floor(rounded / 60);
  const secs = rounded % 60;
  return `${mins}m ${secs}d`;
}

function triggerFileDownload(
  base64: string,
  mimeType: string,
  filename: string
): void {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function App() {
  const [text, setText] = useState<string>(SAMPLE_SCRIPTS[0].text);
  const [selectedVoice, setSelectedVoice] = useState<VoiceId>(
    SAMPLE_SCRIPTS[0].recommendedVoice
  );
  const [voiceFilter, setVoiceFilter] = useState<"all" | VoiceGender>("all");
  const [selectedStyleId, setSelectedStyleId] = useState<string>(
    SAMPLE_SCRIPTS[0].recommendedStyleId
  );
  const [customStyleNote, setCustomStyleNote] = useState<string>("");

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isApiKeyError, setIsApiKeyError] = useState<boolean>(false);
  const [activeTake, setActiveTake] = useState<GeneratedAudioTake | null>(null);
  const [history, setHistory] = useState<GeneratedAudioTake[]>([]);
  const [sampleCursor, setSampleCursor] = useState<number>(0);

  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem(API_KEY_STORAGE_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [hasServerKey, setHasServerKey] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  useEffect(() => {
    fetch("/api/config/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.hasServerKey === "boolean") {
          setHasServerKey(data.hasServerKey);
        }
      })
      .catch(() => {
        // Abaikan jika gagal mengecek status awal
      });
  }, []);

  const handleSaveApiKey = (newKey: string) => {
    const clean = newKey.trim();
    setApiKey(clean);
    try {
      if (clean) {
        localStorage.setItem(API_KEY_STORAGE_KEY, clean);
      } else {
        localStorage.removeItem(API_KEY_STORAGE_KEY);
      }
    } catch {
      // Abaikan jika localStorage diblokir
    }
    if (isApiKeyError) {
      setIsApiKeyError(false);
      setErrorMessage(null);
    }
  };

  const selectedStyle = useMemo(
    () =>
      SPEAKING_STYLES.find((s) => s.id === selectedStyleId) ??
      SPEAKING_STYLES[0],
    [selectedStyleId]
  );

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const chars = text.length;
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const estSeconds = words > 0 ? Math.max(1, Math.round((words / 135) * 60)) : 0;
    return { chars, words, estSeconds };
  }, [text]);

  const filteredVoices = useMemo(
    () =>
      voiceFilter === "all"
        ? VOICE_OPTIONS
        : VOICE_OPTIONS.filter((v) => v.gender === voiceFilter),
    [voiceFilter]
  );

  const handleLoadSampleById = (sampleId: string) => {
    const found = SAMPLE_SCRIPTS.find((s) => s.id === sampleId);
    if (!found) return;
    setText(found.text);
    setSelectedVoice(found.recommendedVoice);
    setSelectedStyleId(found.recommendedStyleId);
    setErrorMessage(null);
    const recVoice = VOICE_OPTIONS.find((v) => v.id === found.recommendedVoice);
    if (recVoice && voiceFilter !== "all" && voiceFilter !== recVoice.gender) {
      setVoiceFilter(recVoice.gender);
    }
  };

  const handleCycleSample = () => {
    const nextIndex = (sampleCursor + 1) % SAMPLE_SCRIPTS.length;
    const sample = SAMPLE_SCRIPTS[nextIndex];
    setSampleCursor(nextIndex);
    setText(sample.text);
    setSelectedVoice(sample.recommendedVoice);
    setSelectedStyleId(sample.recommendedStyleId);
    setErrorMessage(null);
    const recVoice = VOICE_OPTIONS.find((v) => v.id === sample.recommendedVoice);
    if (recVoice && voiceFilter !== "all" && voiceFilter !== recVoice.gender) {
      setVoiceFilter(recVoice.gender);
    }
  };

  const handleGenerate = async () => {
    const cleanText = text.trim();
    if (!cleanText) {
      setErrorMessage("Masukkan naskah Bahasa Indonesia terlebih dahulu.");
      return;
    }

    if (cleanText.length > MAX_CHARS) {
      setErrorMessage(`Naskah melebihi batas maksimal ${MAX_CHARS} karakter.`);
      return;
    }

    setErrorMessage(null);
    setIsApiKeyError(false);
    setIsGenerating(true);

    const combinedStyle = customStyleNote.trim()
      ? `${selectedStyle.promptStyle}. Additional nuance: ${customStyleNote.trim()}`
      : selectedStyle.promptStyle;

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (apiKey.trim()) {
        headers["x-gemini-api-key"] = apiKey.trim();
      }

      const response = await fetch("/api/tts", {
        method: "POST",
        headers,
        body: JSON.stringify({
          text: cleanText,
          voiceName: selectedVoice,
          stylePrompt: combinedStyle,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        const keyErr =
          payload?.code === "MISSING_API_KEY" ||
          payload?.code === "INVALID_API_KEY" ||
          response.status === 401 ||
          response.status === 403;
        setIsApiKeyError(keyErr);
        throw new Error(
          payload?.error || "Terjadi kesalahan saat membuat suara."
        );
      }

      const now = new Date();
      const timeFormatted = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const newTake: GeneratedAudioTake = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: timeFormatted,
        text: cleanText,
        voiceName: payload.voiceName as VoiceId,
        styleLabel: selectedStyle.label,
        sampleRate: payload.sampleRate,
        durationSeconds: payload.durationSeconds,
        wavBytes: payload.wavBytes,
        mp3Bytes: payload.mp3Bytes,
        wavBase64: payload.wavBase64,
        mp3Base64: payload.mp3Base64,
        waveform: Array.isArray(payload.waveform) ? payload.waveform : [],
      };

      setActiveTake(newTake);
      setHistory((prev) => [newTake, ...prev].slice(0, 12));
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Gagal terhubung ke server TTS. Silakan coba lagi.";
      setErrorMessage(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (take: GeneratedAudioTake, format: "wav" | "mp3") => {
    const safeVoice = take.voiceName.toLowerCase();
    const stamp = take.id.split("-")[0];
    if (format === "wav") {
      triggerFileDownload(
        take.wavBase64,
        "audio/wav",
        `tutursuara-${safeVoice}-${stamp}.wav`
      );
    } else {
      triggerFileDownload(
        take.mp3Base64,
        "audio/mpeg",
        `tutursuara-${safeVoice}-${stamp}.mp3`
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header
        onLoadSample={handleCycleSample}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasConfiguredKey={Boolean(apiKey.trim()) || hasServerKey}
        historyCount={history.length}
      />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-8 max-w-2xl">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 text-balance sm:text-3xl">
            Text-to-Speech Bahasa Indonesia
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
            Ubah naskah Bahasa Indonesia menjadi suara cewek atau cowok yang lembut, natural, dan jernih.
            Putar langsung hasilnya atau unduh dalam format WAV dan MP3.
          </p>
        </div>

        <div
          id="studio"
          className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12"
        >
          {/* Left Column: Script Input & Audio Player */}
          <div className="space-y-6 lg:col-span-7">
            <section
              aria-label="Kolom input naskah"
              className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <label
                    htmlFor="script-input"
                    className="block text-base font-semibold text-slate-900"
                  >
                    Naskah Teks
                  </label>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Gunakan tanda baca koma dan titik agar jeda napas terdengar alami.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
                  {SAMPLE_SCRIPTS.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleLoadSampleById(sample.id)}
                      className={`shrink-0 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        text === sample.text
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <textarea
                  id="script-input"
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  maxLength={MAX_CHARS}
                  rows={8}
                  placeholder="Tulis atau tempel naskah Bahasa Indonesia di sini..."
                  className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50/60 p-4 text-[15px] leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/15"
                />
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="mt-3 flex flex-wrap items-center justify-between gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertCircle
                      className="mt-0.5 h-4 w-4 shrink-0 text-red-600"
                      aria-hidden="true"
                    />
                    <span>{errorMessage}</span>
                  </div>
                  {isApiKeyError && (
                    <button
                      type="button"
                      onClick={() => setIsSettingsOpen(true)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-red-600 px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-red-700"
                    >
                      <KeyRound className="h-3 w-3" aria-hidden="true" />
                      Buka Pengaturan API
                    </button>
                  )}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono tabular-nums">
                    {stats.chars} / {MAX_CHARS} karakter
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {stats.words} kata
                  </span>
                  {stats.estSeconds > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        Estimasi ~{formatDurationBadge(stats.estSeconds)}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setText("");
                      setErrorMessage(null);
                    }}
                    disabled={!text || isGenerating}
                    className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <Eraser className="h-3.5 w-3.5" aria-hidden="true" />
                    Bersihkan
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating || text.trim().length === 0}
                    className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:bg-blue-400"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2
                          className="h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />
                        Membuat Suara...
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4" aria-hidden="true" />
                        Buat Audio
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>

            <AudioPlayerCard
              take={activeTake}
              isGenerating={isGenerating}
              onDownload={handleDownload}
            />
          </div>

          {/* Right Column: Voice Selector & Natural Speaking Style */}
          <aside className="space-y-6 lg:col-span-5">
            <section
              id="pilihan-suara"
              aria-label="Pilihan suara"
              className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
            >
              <div className="border-b border-slate-100 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-slate-900">
                    Pilihan Suara
                  </h2>

                  <div
                    role="tablist"
                    aria-label="Filter suara"
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 p-1"
                  >
                    {(
                      [
                        { id: "all", label: "Semua" },
                        { id: "female", label: "Cewek" },
                        { id: "male", label: "Cowok" },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={voiceFilter === tab.id}
                        onClick={() => setVoiceFilter(tab.id)}
                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                          voiceFilter === tab.id
                            ? "bg-white text-slate-900 shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Tersedia karakter suara cewek dan cowok yang lembut untuk cerita kehidupan.
                </p>
              </div>

              <div
                role="radiogroup"
                aria-label="Daftar pilihan suara"
                className="mt-4 grid max-h-[430px] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-1"
              >
                {filteredVoices.map((voice) => {
                  const isSelected = selectedVoice === voice.id;
                  return (
                    <button
                      key={voice.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSelectedVoice(voice.id)}
                      className={`w-full rounded-lg border p-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/70"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-sm font-semibold text-slate-900">
                            {voice.name}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                              voice.gender === "female"
                                ? "bg-rose-50 text-rose-700"
                                : "bg-sky-50 text-sky-700"
                            }`}
                          >
                            {voice.gender === "female" ? "Cewek" : "Cowok"}
                          </span>
                          {voice.isSoftStory && (
                            <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                              Lembut · Cerita
                            </span>
                          )}
                        </div>

                        {isSelected && (
                          <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-700">
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                            Dipilih
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs font-medium text-slate-700">
                        {voice.character}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">
                        {voice.description}
                      </p>
                      <p className="mt-1.5 text-[11px] text-slate-500">
                        Cocok untuk: {voice.bestFor}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section
              aria-label="Gaya bicara natural"
              className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
            >
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-semibold text-slate-900">
                  Gaya Bicara Natural
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Atur intonasi dan ritme agar pelafalan Bahasa Indonesia terdengar luwes.
                </p>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {SPEAKING_STYLES.map((style) => {
                  const isActive = selectedStyleId === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setSelectedStyleId(style.id)}
                      className={`rounded-lg border p-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                        isActive
                          ? "border-blue-600 bg-blue-50/70"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-xs font-semibold text-slate-900">
                          {style.label}
                        </span>
                        {isActive && (
                          <Check
                            className="h-3.5 w-3.5 shrink-0 text-blue-700"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <p className="mt-1 text-[11px] leading-snug text-slate-500">
                        {style.shortDesc}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4">
                <label
                  htmlFor="custom-style-note"
                  className="block text-xs font-medium text-slate-700"
                >
                  Arahan Tambahan (Opsional)
                </label>
                <input
                  id="custom-style-note"
                  type="text"
                  value={customStyleNote}
                  onChange={(e) => setCustomStyleNote(e.target.value)}
                  maxLength={160}
                  placeholder="Contoh: sedikit lebih antusias, jeda pelan di kalimat terakhir"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/15"
                />
              </div>
            </section>
          </aside>
        </div>

        {/* Session History Section */}
        <section
          id="riwayat"
          aria-label="Riwayat audio"
          className="mt-8 rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Riwayat Audio Sesi Ini
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Bandingkan hasil antar karakter suara atau unduh ulang file WAV dan MP3.
              </p>
            </div>

            {history.length > 0 && (
              <button
                type="button"
                onClick={() => setHistory([])}
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Hapus Riwayat
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="flex items-center gap-3 py-6 text-slate-500">
              <Volume2 className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              <p className="text-xs">
                Riwayat hasil suara akan muncul di sini setelah Anda membuat audio pertama.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {history.map((item) => {
                const isActive = activeTake?.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`flex flex-col justify-between gap-3 py-3.5 sm:flex-row sm:items-center ${
                      isActive ? "bg-blue-50/40 -mx-2 rounded-lg px-2" : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-semibold text-slate-900">
                          {item.voiceName}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">
                          ·
                        </span>
                        <span className="text-slate-600">{item.styleLabel}</span>
                        <span aria-hidden="true" className="text-slate-300">
                          ·
                        </span>
                        <span className="font-mono text-slate-500 tabular-nums">
                          {formatDurationBadge(item.durationSeconds)}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">
                          ·
                        </span>
                        <span className="font-mono text-slate-400 tabular-nums">
                          {item.createdAt}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-600">
                        {item.text}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTake(item)}
                        className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                      >
                        <Play className="h-3 w-3" aria-hidden="true" />
                        {isActive ? "Aktif" : "Putar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload(item, "wav")}
                        className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                      >
                        <Download className="h-3 w-3" aria-hidden="true" />
                        WAV
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownload(item, "mp3")}
                        className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 font-mono text-xs font-medium text-white transition-colors hover:bg-slate-800"
                      >
                        <Download className="h-3 w-3" aria-hidden="true" />
                        MP3
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        hasServerKey={hasServerKey}
        onSaveApiKey={handleSaveApiKey}
      />
    </div>
  );
}
