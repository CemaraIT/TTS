import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  hasServerKey: boolean;
  onSaveApiKey: (newKey: string) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  apiKey,
  hasServerKey,
  onSaveApiKey,
}: SettingsModalProps) {
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setInputKey(apiKey);
      setFeedback(null);
      setShowKey(false);
    }
  }, [isOpen, apiKey]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmedInput = inputKey.trim();
  const isUsingLocalKey = Boolean(apiKey.trim());

  const handleSaveAndVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmedInput) {
      setFeedback({
        type: "error",
        message: "Masukkan Gemini API Key terlebih dahulu.",
      });
      return;
    }

    setIsTesting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/config/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-api-key": trimmedInput,
        },
        body: JSON.stringify({ apiKey: trimmedInput }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.valid) {
        setFeedback({
          type: "error",
          message:
            payload?.error ||
            "API Key tidak valid atau ditolak oleh Gemini API.",
        });
        return;
      }

      onSaveApiKey(trimmedInput);
      setFeedback({
        type: "success",
        message:
          "API Key valid dan berhasil disimpan! Anda sekarang bisa langsung membuat audio.",
      });
    } catch {
      setFeedback({
        type: "error",
        message: "Gagal terhubung ke server untuk memverifikasi API Key.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearKey = () => {
    setInputKey("");
    onSaveApiKey("");
    setFeedback({
      type: "success",
      message: hasServerKey
        ? "API Key browser dihapus. Aplikasi kembali menggunakan konfigurasi server (.env)."
        : "API Key berhasil dihapus dari browser.",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <KeyRound className="h-4.5 w-4.5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="settings-modal-title"
                className="text-base font-bold text-slate-900"
              >
                Pengaturan Gemini API Key
              </h2>
              <p className="text-xs text-slate-500">
                Hubungkan kunci API Google Gemini untuk mengaktifkan generator suara.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pengaturan"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Status Saat Ini */}
          <div
            className={`flex items-start gap-3 rounded-xl border p-3.5 text-xs ${
              isUsingLocalKey
                ? "border-emerald-200 bg-emerald-50/70 text-emerald-900"
                : hasServerKey
                  ? "border-blue-200 bg-blue-50/70 text-blue-900"
                  : "border-amber-200 bg-amber-50/80 text-amber-900"
            }`}
          >
            <ShieldCheck
              className={`mt-0.5 h-4 w-4 shrink-0 ${
                isUsingLocalKey
                  ? "text-emerald-600"
                  : hasServerKey
                    ? "text-blue-600"
                    : "text-amber-600"
              }`}
              aria-hidden="true"
            />
            <div>
              <p className="font-semibold">
                {isUsingLocalKey
                  ? "Status: API Key Tersimpan di Browser"
                  : hasServerKey
                    ? "Status: Menggunakan API Key Server (.env)"
                    : "Status: API Key Belum Diatur"}
              </p>
              <p className="mt-0.5 leading-relaxed opacity-90">
                {isUsingLocalKey
                  ? "Aplikasi sedang menggunakan API Key yang Anda simpan di browser ini."
                  : hasServerKey
                    ? "Server sudah memiliki GEMINI_API_KEY bawaan. Anda tetap bisa mengisinya di bawah jika ingin memakai key pribadi."
                    : "Masukkan Gemini API Key Anda di bawah ini agar fitur Buat Audio dapat digunakan."}
              </p>
            </div>
          </div>

          {/* Form Input API Key */}
          <form onSubmit={handleSaveAndVerify} className="space-y-3">
            <div>
              <label
                htmlFor="gemini-api-key-input"
                className="block text-xs font-semibold text-slate-700"
              >
                Gemini API Key
              </label>
              <div className="relative mt-1.5">
                <input
                  id="gemini-api-key-input"
                  type={showKey ? "text" : "password"}
                  value={inputKey}
                  onChange={(e) => {
                    setInputKey(e.target.value);
                    if (feedback) setFeedback(null);
                  }}
                  placeholder="AIzaSy..."
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/60 py-2.5 pl-3.5 pr-10 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/15"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((prev) => !prev)}
                  aria-label={showKey ? "Sembunyikan API Key" : "Tampilkan API Key"}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-slate-500">
                Disimpan secara lokal di browser Anda (<code className="rounded bg-slate-100 px-1 py-0.5">localStorage</code>) dan tidak dibagikan ke mana pun selain ke server TTS Anda.
              </p>
            </div>

            {feedback && (
              <div
                role="alert"
                className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs ${
                  feedback.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              {isUsingLocalKey ? (
                <button
                  type="button"
                  onClick={handleClearKey}
                  disabled={isTesting}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Hapus Key
                </button>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={isTesting || !trimmedInput}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Memverifikasi...
                    </>
                  ) : (
                    "Simpan & Uji API Key"
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Panduan Langkah-Langkah Mendapatkan API Key */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Langkah Mendapatkan Gemini API Key (Gratis)
              </h3>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Buka Google AI Studio
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </div>

            <ol className="mt-3.5 space-y-2.5 text-xs leading-relaxed text-slate-700">
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">
                  1
                </span>
                <span>
                  Klik tombol <strong>Buka Google AI Studio</strong> di atas (atau kunjungi{" "}
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 underline hover:text-blue-700"
                  >
                    aistudio.google.com/apikey
                  </a>
                  ).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">
                  2
                </span>
                <span>
                  Login menggunakan akun <strong>Google / Gmail</strong> Anda.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">
                  3
                </span>
                <span>
                  Klik tombol <strong>&quot;Create API key&quot;</strong> di pojok kanan atas halaman.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">
                  4
                </span>
                <span>
                  Pilih project Google Cloud yang ada atau klik <strong>&quot;Create API key in new project&quot;</strong> jika belum memiliki project.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">
                  5
                </span>
                <span>
                  Salin (<em>Copy</em>) kode kunci yang muncul (biasanya diawali dengan <code className="rounded bg-slate-200/70 px-1 py-0.5 font-mono text-[11px]">AIzaSy...</code>).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">
                  6
                </span>
                <span>
                  Tempel (<em>Paste</em>) kunci tersebut ke kolom <strong>Gemini API Key</strong> di atas, lalu klik <strong>Simpan &amp; Uji API Key</strong>.
                </span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
