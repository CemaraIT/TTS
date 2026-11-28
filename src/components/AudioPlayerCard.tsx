import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Pause, Play, RotateCcw, Volume2 } from "lucide-react";
import type { GeneratedAudioTake } from "../types/tts";

interface AudioPlayerCardProps {
  take: GeneratedAudioTake | null;
  isGenerating: boolean;
  onDownload: (take: GeneratedAudioTake, format: "wav" | "mp3") => void;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function base64ToBlobUrl(base64: string, mimeType: string): string {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  return URL.createObjectURL(blob);
}

const SPEED_OPTIONS = [0.85, 1, 1.15, 1.25];

export function AudioPlayerCard({
  take,
  isGenerating,
  onDownload,
}: AudioPlayerCardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  const audioUrl = useMemo(() => {
    if (!take) return null;
    return base64ToBlobUrl(take.wavBase64, "audio/wav");
  }, [take]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(take?.durationSeconds ?? 0);

    const el = audioRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
      el.playbackRate = playbackRate;
    }
  }, [take, audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = async () => {
    const el = audioRef.current;
    if (!el || !audioUrl) return;
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      try {
        await el.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    }
  };

  const handleRestart = async () => {
    const el = audioRef.current;
    if (!el || !audioUrl) return;
    el.currentTime = 0;
    setCurrentTime(0);
    try {
      await el.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const handleSeek = (ratio: number) => {
    const el = audioRef.current;
    const effectiveDuration = duration || take?.durationSeconds || 0;
    if (!el || effectiveDuration <= 0) return;
    const nextTime = Math.max(0, Math.min(effectiveDuration, ratio * effectiveDuration));
    el.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const effectiveDuration = duration || take?.durationSeconds || 0;
  const progress = effectiveDuration > 0 ? Math.min(1, currentTime / effectiveDuration) : 0;

  return (
    <section
      id="pemutar"
      aria-label="Pemutar audio langsung"
      className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Pemutar Audio Langsung
          </h2>
          {take ? (
            <p className="mt-0.5 text-xs text-slate-500">
              <span>Suara {take.voiceName}</span>
              <span aria-hidden="true"> · </span>
              <span>{take.styleLabel}</span>
              <span aria-hidden="true"> · </span>
              <span className="font-mono tabular-nums">
                {(take.sampleRate / 1000).toFixed(0)} kHz
              </span>
              <span aria-hidden="true"> · </span>
              <span className="font-mono tabular-nums">
                WAV {formatBytes(take.wavBytes)}
              </span>
              <span aria-hidden="true"> / </span>
              <span className="font-mono tabular-nums">
                MP3 {formatBytes(take.mp3Bytes)}
              </span>
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-slate-500">
              Putar hasil suara langsung di browser atau unduh dalam format WAV dan MP3.
            </p>
          )}
        </div>

        {take && (
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            {SPEED_OPTIONS.map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => setPlaybackRate(rate)}
                className={`shrink-0 whitespace-nowrap rounded-md px-2.5 py-1 font-mono text-xs font-medium tabular-nums transition-colors ${
                  playbackRate === rate
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        )}
      </div>

      {isGenerating ? (
        <div className="py-6">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-slate-200" />
            <div className="flex-1 space-y-2.5">
              <div className="h-3 w-48 animate-pulse rounded bg-slate-200" />
              <div className="h-8 w-full animate-pulse rounded-lg bg-slate-100" />
            </div>
          </div>
          <p className="mt-3 text-xs font-medium text-blue-700">
            Sedang memproses intonasi Bahasa Indonesia dan merender file WAV & MP3...
          </p>
        </div>
      ) : !take ? (
        <div className="flex flex-col items-start justify-between gap-4 py-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3.5 text-slate-500">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400">
              <Volume2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">
                Belum ada audio yang dibuat
              </p>
              <p className="text-xs text-slate-500">
                Tulis naskah di atas, pilih karakter suara, lalu tekan tombol Buat Audio.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-5">
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              preload="metadata"
              onLoadedMetadata={(e) => {
                const dur = e.currentTarget.duration;
                if (Number.isFinite(dur) && dur > 0) {
                  setDuration(dur);
                }
              }}
              onTimeUpdate={(e) => {
                setCurrentTime(e.currentTarget.currentTime);
              }}
              onEnded={() => {
                setIsPlaying(false);
                setCurrentTime(effectiveDuration);
              }}
            />
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? "Jeda audio" : "Putar audio"}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Play className="ml-0.5 h-5 w-5" aria-hidden="true" />
                )}
              </button>

              <button
                type="button"
                onClick={handleRestart}
                aria-label="Ulangi dari awal"
                title="Putar ulang dari awal"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1">
              <div
                role="slider"
                tabIndex={0}
                aria-label="Posisi pemutaran audio"
                aria-valuemin={0}
                aria-valuemax={Math.round(effectiveDuration)}
                aria-valuenow={Math.round(currentTime)}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const ratio = (e.clientX - rect.left) / rect.width;
                  handleSeek(ratio);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") {
                    e.preventDefault();
                    handleSeek(Math.min(1, progress + 0.05));
                  } else if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    handleSeek(Math.max(0, progress - 0.05));
                  }
                }}
                className="group flex h-12 cursor-pointer items-center gap-[3px] rounded-lg border border-slate-200 bg-slate-50 px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                {take.waveform.map((peak, index) => {
                  const barRatio = (index + 0.5) / take.waveform.length;
                  const isFilled = barRatio <= progress;
                  return (
                    <span
                      key={index}
                      className={`flex-1 rounded-full transition-colors ${
                        isFilled
                          ? "bg-blue-600"
                          : "bg-slate-300 group-hover:bg-slate-400"
                      }`}
                      style={{ height: `${Math.round(peak * 30)}px` }}
                    />
                  );
                })}
              </div>

              <div className="mt-1.5 flex items-center justify-between font-mono text-xs text-slate-500 tabular-nums">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(effectiveDuration)}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="max-w-md truncate text-xs text-slate-500">
              “{take.text}”
            </p>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => onDownload(take, "wav")}
                className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <Download className="h-3.5 w-3.5 text-slate-600" aria-hidden="true" />
                Unduh WAV
              </button>

              <button
                type="button"
                onClick={() => onDownload(take, "mp3")}
                className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Unduh MP3
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
