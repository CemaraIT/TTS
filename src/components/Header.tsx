import { Settings } from "lucide-react";

interface HeaderProps {
  onLoadSample: () => void;
  onOpenSettings: () => void;
  hasConfiguredKey: boolean;
  historyCount: number;
}

export function Header({
  onLoadSample,
  onOpenSettings,
  hasConfiguredKey,
  historyCount,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
        <a
          href="#studio"
          className="shrink-0 whitespace-nowrap text-lg font-bold tracking-tight text-slate-900"
        >
          TuturSuara
        </a>

        <nav
          aria-label="Navigasi utama"
          className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex"
        >
          <a
            href="#studio"
            className="shrink-0 whitespace-nowrap transition-colors hover:text-slate-900"
          >
            Studio Naskah
          </a>
          <a
            href="#pilihan-suara"
            className="shrink-0 whitespace-nowrap transition-colors hover:text-slate-900"
          >
            Pilihan Suara
          </a>
          <a
            href="#pemutar"
            className="shrink-0 whitespace-nowrap transition-colors hover:text-slate-900"
          >
            Pemutar Audio
          </a>
          <a
            href="#riwayat"
            className="shrink-0 whitespace-nowrap transition-colors hover:text-slate-900"
          >
            Riwayat{historyCount > 0 ? ` (${historyCount})` : ""}
          </a>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onLoadSample}
            className="hidden shrink-0 whitespace-nowrap rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:inline-flex"
          >
            Muat Contoh Naskah
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
              hasConfiguredKey
                ? "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                : "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            <Settings className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Pengaturan API</span>
            <span
              aria-hidden="true"
              className={`h-2 w-2 rounded-full ${
                hasConfiguredKey ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
