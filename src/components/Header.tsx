interface HeaderProps {
  onLoadSample: () => void;
  historyCount: number;
}

export function Header({ onLoadSample, historyCount }: HeaderProps) {
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
            href="#suara-pria"
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

        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={onLoadSample}
            className="shrink-0 whitespace-nowrap rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Muat Contoh Naskah
          </button>
        </div>
      </div>
    </header>
  );
}
