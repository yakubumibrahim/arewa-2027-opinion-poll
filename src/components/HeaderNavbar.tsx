import { Activity, ChartNoAxesColumn, House, Lock, MapPin, ShieldAlert, Vote } from "lucide-react";
import { BRAND, LOGO_URL } from "@/data/mockCandidates";
import type { TabKey } from "@/types";

const NAV: Array<{ key: TabKey; label: string; Icon: typeof House }> = [
  { key: "home", label: "Home", Icon: House },
  { key: "presidential", label: "Presidential", Icon: Vote },
  { key: "governors", label: "Governors", Icon: MapPin },
  { key: "results", label: "Live Results", Icon: ChartNoAxesColumn },
  { key: "admin", label: "Admin", Icon: Lock },
];

interface Props {
  tab: TabKey;
  onTab: (key: TabKey) => void;
  totalVotes: number;
}

export default function HeaderNavbar({ tab, onTab, totalVotes }: Props) {
  return (
    <header className="sticky top-0 z-40">
      <div className="border-b border-[#D4AF37]/25 bg-[#090C13]">
        <div className="mx-auto flex max-w-7xl items-start gap-2.5 px-4 py-2.5 sm:px-6">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" />
          <p className="font-['Manrope'] text-[11px] leading-snug text-[#E8C766]/80">{BRAND.disclaimer}</p>
        </div>
      </div>

      <div className="border-b border-white/10 bg-[#0B0F17]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <button onClick={() => onTab("home")} className="flex items-center gap-3 text-left transition active:scale-[0.98]">
            <img
              src={LOGO_URL}
              alt="YMR Media 3D gold emblem"
              className="h-11 w-11 rounded-xl object-cover ring-1 ring-[#D4AF37]/40"
            />
            <span className="leading-tight">
              <span className="block font-['Outfit'] text-[17px] font-semibold tracking-tight text-white">
                {BRAND.name}
              </span>
              <span className="block text-[9px] uppercase tracking-[0.3em] text-[#8A94A6]">{BRAND.division}</span>
            </span>
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map(({ key, label, Icon }) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  onClick={() => onTab(key)}
                  className={`flex items-center gap-2 rounded-full px-3.5 py-2 font-['Manrope'] text-[13px] font-medium transition active:scale-[0.98] ${
                    active
                      ? "bg-[#D4AF37]/15 text-[#E8C766] ring-1 ring-[#D4AF37]/40"
                      : "text-[#B6C0CE] hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-full border border-[#2E9E5B]/40 bg-[#2E9E5B]/10 px-3 py-1.5 font-['Manrope'] text-[11px] font-semibold text-[#7EE0A5] sm:inline-flex">
              <Activity className="h-3.5 w-3.5" />
              {totalVotes.toLocaleString("en-GB")} ballots
            </span>
            <button
              onClick={() => onTab("presidential")}
              className="rounded-full bg-[#D4AF37] px-4 py-2 font-['Manrope'] text-[12px] font-bold text-[#0B0F17] transition hover:bg-[#E8C766] active:scale-[0.98]"
            >
              Vote now
            </button>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto px-4 pb-2.5 lg:hidden">
          {NAV.map(({ key, label, Icon }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => onTab(key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 font-['Manrope'] text-[12px] font-medium transition ${
                  active ? "bg-[#D4AF37]/15 text-[#E8C766] ring-1 ring-[#D4AF37]/40" : "text-[#9AA5B4]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}