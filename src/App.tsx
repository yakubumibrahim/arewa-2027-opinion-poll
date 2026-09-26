import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  ChartNoAxesColumn,
  Clock,
  Download,
  Fingerprint,
  Info,
  MapPin,
  Medal,
  ShieldCheck,
  TrendingUp,
  Trophy,
  Users,
  Vote as VoteIcon,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import HeaderNavbar from "@/components/HeaderNavbar";
import AdminPanel from "@/components/AdminPanel";
import { CandidateCard, LiveBar, VoteModal, type VoteTarget } from "@/components/VoteModal";
import { BRAND, KOGI_NOTE, LOGO_URL, POLL_PRESIDENTIAL, STATE_LIST, ZONES } from "@/data/mockCandidates";
import { exportCsv, metrics, resultsFor, useLiveTick, usePollStore, voteStatus } from "@/lib/voteStore";
import type { Candidate, TabKey } from "@/types";

const rise = (reduce: boolean, delay = 0) => ({
  initial: reduce ? false : { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: reduce ? 0 : 0.6, ease: "easeOut" as const, delay: reduce ? 0 : delay },
});

function SectionHead({ eyebrow, title, blurb }: { eyebrow: string; title: string; blurb: string }) {
  return (
    <div className="max-w-3xl">
      <span className="font-['Manrope'] text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8A94A6]">{eyebrow}</span>
      <h2 className="mt-2 font-['Outfit'] text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
      <p className="mt-3 font-['Manrope'] text-[14px] leading-relaxed text-[#9AA5B4]">{blurb}</p>
    </div>
  );
}

function StatTile({ head, value, hint }: { head: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
      <p className="font-['Manrope'] text-[10px] uppercase tracking-[0.22em] text-[#8A94A6]">{head}</p>
      <p className="mt-1.5 font-['Outfit'] text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 font-['Manrope'] text-[11px] text-[#7F8898]">{hint}</p>
    </div>
  );
}

export default function App() {
  const store = usePollStore();
  const tick = useLiveTick(7000);
  const reduce = !!useReducedMotion();
  const [tab, setTab] = useState<TabKey>("home");
  const [stateId, setStateId] = useState("kano");
  const [resultPoll, setResultPoll] = useState(POLL_PRESIDENTIAL);
  const [target, setTarget] = useState<VoteTarget | null>(null);

  const m = metrics();
  const presidential = resultsFor(POLL_PRESIDENTIAL);
  const activeState = STATE_LIST.find((s) => s.id === stateId) || STATE_LIST[0];
  const governorship = resultsFor(stateId);
  const resultRows = resultsFor(resultPoll);
  const pollOpen = (pollId: string) => (pollId === POLL_PRESIDENTIAL ? store.polls.presidential : store.polls.governors);
  const votedIn = (pollId: string) => !voteStatus(pollId).allowed;
  const open = (candidate: Candidate, pollId: string, pollLabel: string) => setTarget({ candidate, pollId, pollLabel });
  const pollName = (pollId: string) =>
    pollId === POLL_PRESIDENTIAL ? "Presidential poll" : `${STATE_LIST.find((s) => s.id === pollId)?.name} governorship poll`;

  const topThree = resultRows.slice(0, 3);
  const slate = candidatesList(POLL_PRESIDENTIAL);

  function candidatesList(pollId: string) {
    return resultsFor(pollId).map((row) => row.candidate);
  }

  const ticker = presidential.slice(0, 6);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-[#E6EAF0] antialiased" data-tick={tick}>
      <Toaster position="top-right" theme="dark" richColors />
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute -left-24 top-0 h-[420px] w-[420px] rounded-full bg-[#D4AF37]/10 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[380px] w-[380px] rounded-full bg-[#2F6FED]/10 blur-[140px]" />
      </div>

      <div className="relative">
        <HeaderNavbar tab={tab} onTab={setTab} totalVotes={m.totalVotes} />

        {tab === "home" && (
          <>
            <div className="border-b border-white/10 bg-[#0E131B]">
              <div className="mx-auto flex max-w-7xl items-center gap-4 overflow-hidden px-4 py-2.5 sm:px-6">
                <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#2E9E5B]/15 px-3 py-1 font-['Manrope'] text-[10px] font-bold uppercase tracking-[0.2em] text-[#7EE0A5]">
                  <Activity className="h-3.5 w-3.5" /> Live poll
                </span>
                <div className="relative flex-1 overflow-hidden">
                  <motion.div
                    className="flex gap-8 whitespace-nowrap"
                    animate={reduce ? undefined : { x: ["0%", "-50%"] }}
                    transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
                  >
                    {[...ticker, ...ticker].map((row, index) => (
                      <span key={`${row.candidate.id}-${index}`} className="inline-flex items-center gap-2 font-['Manrope'] text-[12px] text-[#CBD5E1]">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: row.candidate.color }} />
                        {row.candidate.name}
                        <span className="text-[#E8C766]">{row.pct.toFixed(1)}%</span>
                      </span>
                    ))}
                  </motion.div>
                </div>
              </div>
            </div>

            <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
              <motion.div {...rise(reduce)}>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3.5 py-1.5 font-['Manrope'] text-[11px] font-semibold uppercase tracking-[0.22em] text-[#E8C766]">
                  <MapPin className="h-3.5 w-3.5" /> Arewa 2027 poll window
                </span>
                <h1 className="mt-5 font-['Outfit'] text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
                  The North speaks first.
                  <span className="block bg-gradient-to-r from-[#E8C766] to-[#B8933A] bg-clip-text text-transparent">
                    YMR Media counts it live.
                  </span>
                </h1>
                <p className="mt-5 max-w-xl font-['Manrope'] text-[15px] leading-relaxed text-[#9AA5B4]">
                  Cast a verified ballot on the 2027 presidential ticket and the governorship races of 18 northern states, then
                  watch every response land in the live tally.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    onClick={() => setTab("presidential")}
                    className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3 font-['Manrope'] text-[13px] font-bold text-[#0B0F17] transition hover:bg-[#E8C766] active:scale-[0.98]"
                  >
                    <VoteIcon className="h-4 w-4" /> Cast your vote
                  </button>
                  <button
                    onClick={() => setTab("results")}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 font-['Manrope'] text-[13px] font-semibold text-[#E6EAF0] transition hover:bg-white/5"
                  >
                    <ChartNoAxesColumn className="h-4 w-4" /> View live results
                  </button>
                </div>

                <dl className="mt-9 grid gap-3 sm:grid-cols-3">
                  <StatTile head="Ballots counted" value={m.totalVotes.toLocaleString("en-GB")} hint="Continuous simulated tally" />
                  <StatTile head="Ballot velocity" value={`${m.hourlyVelocity.toLocaleString("en-GB")}/hr`} hint="Projected response rate" />
                  <StatTile head="Coverage" value={`${m.states} states`} hint="North West, North East, North Central" />
                </dl>
              </motion.div>

              <motion.div {...rise(reduce, 0.12)} className="relative">
                <div className="relative overflow-hidden rounded-[32px] border border-[#D4AF37]/25 bg-gradient-to-b from-white/[0.08] to-white/[0.01] p-6">
                  <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#D4AF37]/20 blur-3xl" />
                  <img
                    src={LOGO_URL}
                    alt="YMR Media 3D gold emblem set"
                    className="relative mx-auto w-full max-w-sm rounded-3xl object-cover ring-1 ring-white/10"
                  />
                  <div className="relative mt-5 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0B0F17]/70 p-4">
                    <div>
                      <p className="font-['Manrope'] text-[10px] uppercase tracking-[0.24em] text-[#8A94A6]">Polling desk</p>
                      <p className="mt-1 font-['Outfit'] text-[15px] font-semibold text-white">{BRAND.tagline}</p>
                    </div>
                    <Fingerprint className="h-7 w-7 shrink-0 text-[#E8C766]" />
                  </div>
                </div>
              </motion.div>
            </section>

            <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
              <SectionHead
                eyebrow="Presidential spotlight"
                title="Front runners on the national ticket"
                blurb="Eighteen party tickets are on the slate for the 2027 Arewa opinion poll. Each device holds exactly one ballot, enforced by fingerprint and edge IP hashing."
              />
              <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {presidential.slice(0, 5).map((row, index) => (
                  <motion.div key={row.candidate.id} {...rise(reduce, index * 0.05)}>
                    <CandidateCard
                      candidate={row.candidate}
                      compact
                      voted={votedIn(POLL_PRESIDENTIAL)}
                      disabled={!pollOpen(POLL_PRESIDENTIAL)}
                      onVote={() => open(row.candidate, POLL_PRESIDENTIAL, pollName(POLL_PRESIDENTIAL))}
                    />
                  </motion.div>
                ))}
                <button
                  onClick={() => setTab("presidential")}
                  className="flex min-h-[160px] flex-col items-start justify-between rounded-3xl border border-dashed border-[#D4AF37]/40 bg-[#D4AF37]/[0.05] p-5 text-left transition hover:bg-[#D4AF37]/10"
                >
                  <span className="font-['Manrope'] text-[12px] uppercase tracking-[0.2em] text-[#E8C766]">
                    Full slate: {slate.length} tickets
                  </span>
                  <span className="inline-flex items-center gap-2 font-['Outfit'] text-xl font-semibold text-white">
                    Open the full ballot <ArrowRight className="h-5 w-5" />
                  </span>
                </button>
              </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
              <SectionHead
                eyebrow="Zone coverage"
                title="Three geopolitical zones, eighteen governorship races"
                blurb="The northern corridor carries the heaviest weighting of the 2027 conversation. Every zone below carries its own governorship poll."
              />
              <div className="mt-7 grid gap-4 md:grid-cols-3">
                {ZONES.map((zone, index) => (
                  <motion.div
                    key={zone.zone}
                    {...rise(reduce, index * 0.06)}
                    className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-['Outfit'] text-lg font-semibold text-white">{zone.zone}</h3>
                      <span className="rounded-full bg-white/10 px-2.5 py-0.5 font-['Manrope'] text-[11px] text-[#CBD5E1]">
                        {zone.states}
                      </span>
                    </div>
                    <p className="mt-3 font-['Manrope'] text-[13px] leading-relaxed text-[#9AA5B4]">{zone.blurb}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {STATE_LIST.filter((s) => s.zone === zone.zone).map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setStateId(s.id);
                            setTab("governors");
                          }}
                          className="rounded-full border border-white/15 px-2.5 py-1 font-['Manrope'] text-[11px] text-[#CBD5E1] transition hover:border-[#D4AF37]/50 hover:text-white"
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                  <h3 className="flex items-center gap-2 font-['Outfit'] text-lg font-semibold text-white">
                    <Info className="h-4 w-4 text-[#E8C766]" /> Poll methodology
                  </h3>
                  <p className="mt-3 font-['Manrope'] text-[13px] leading-relaxed text-[#9AA5B4]">{BRAND.methodology}</p>
                  <p className="mt-3 font-['Manrope'] text-[13px] leading-relaxed text-[#9AA5B4]">{BRAND.note}</p>
                </div>
                <div className="rounded-3xl border border-[#D4AF37]/25 bg-[#D4AF37]/[0.06] p-6">
                  <h3 className="flex items-center gap-2 font-['Outfit'] text-lg font-semibold text-white">
                    <ShieldCheck className="h-4 w-4 text-[#E8C766]" /> Integrity controls
                  </h3>
                  <ul className="mt-3 space-y-2.5">
                    {[
                      "One ballot per device fingerprint, per poll window.",
                      "Edge IP hashing flags stuffed responses and bot traffic.",
                      "Every accepted ballot is timestamped in an auditable log.",
                      "Administrators can pause a poll instantly if anomalies appear.",
                    ].map((line) => (
                      <li key={line} className="flex items-start gap-2.5 font-['Manrope'] text-[13px] text-[#CBD5E1]">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D4AF37]" />
                        {line}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 font-['Manrope'] text-[12px] leading-relaxed text-[#E8C766]/80">{KOGI_NOTE}</p>
                </div>
              </div>
            </section>
          </>
        )}

        {tab === "presidential" && (
          <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
            <SectionHead
              eyebrow="National ticket"
              title="2027 Presidential opinion poll"
              blurb="Select one ticket. Your ballot is stamped with a hashed device fingerprint, then folded into the live tally instantly."
            />
            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-['Manrope'] text-[11px] font-bold uppercase tracking-[0.16em] ${
                  pollOpen(POLL_PRESIDENTIAL) ? "bg-[#2E9E5B]/15 text-[#7EE0A5]" : "bg-[#D64541]/20 text-[#FF9C8A]"
                }`}
              >
                <Activity className="h-3.5 w-3.5" /> {pollOpen(POLL_PRESIDENTIAL) ? "Poll open" : "Poll paused"}
              </span>
              <span className="font-['Manrope'] text-[12px] text-[#9AA5B4]">
                {slate.length} tickets on the slate | {m.totalVotes.toLocaleString("en-GB")} ballots counted platform wide
              </span>
              {votedIn(POLL_PRESIDENTIAL) && (
                <span className="font-['Manrope'] text-[12px] font-semibold text-[#7EE0A5]">
                  Your ballot for this poll is already recorded.
                </span>
              )}
            </div>

            {slate.length === 0 ? (
              <p className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center font-['Manrope'] text-[14px] text-[#9AA5B4]">
                No active candidates on this slate yet. Administrators can publish tickets from the control room.
              </p>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {slate.map((candidate, index) => (
                  <motion.div key={candidate.id} {...rise(reduce, Math.min(index, 6) * 0.04)}>
                    <CandidateCard
                      candidate={candidate}
                      voted={votedIn(POLL_PRESIDENTIAL)}
                      disabled={!pollOpen(POLL_PRESIDENTIAL)}
                      onVote={() => open(candidate, POLL_PRESIDENTIAL, pollName(POLL_PRESIDENTIAL))}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "governors" && (
          <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
            <SectionHead
              eyebrow="State races"
              title="2027 Governorship opinion polls"
              blurb="Choose a northern state, review the governorship ticket and record your ballot. Kogi State sits on an off-cycle calendar."
            />

            <div className="mt-6 space-y-4">
              {ZONES.map((zone) => (
                <div key={zone.zone}>
                  <p className="font-['Manrope'] text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8A94A6]">{zone.zone}</p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {STATE_LIST.filter((s) => s.zone === zone.zone).map((state) => {
                      const active = state.id === stateId;
                      return (
                        <button
                          key={state.id}
                          onClick={() => setStateId(state.id)}
                          className={`rounded-full px-3.5 py-2 font-['Manrope'] text-[12px] font-medium transition active:scale-[0.98] ${
                            active
                              ? "bg-[#D4AF37] text-[#0B0F17]"
                              : "border border-white/15 text-[#CBD5E1] hover:border-[#D4AF37]/50 hover:text-white"
                          }`}
                        >
                          {state.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <span className="inline-flex items-center gap-2 font-['Outfit'] text-lg font-semibold text-white">
                <MapPin className="h-4 w-4 text-[#E8C766]" /> {activeState.name} State
              </span>
              <span className="font-['Manrope'] text-[12px] text-[#9AA5B4]">Capital: {activeState.capital}</span>
              <span className="font-['Manrope'] text-[12px] text-[#9AA5B4]">Registered voters: {activeState.voters.toFixed(1)}m</span>
              <span
                className={`ml-auto inline-flex items-center gap-2 rounded-full px-3 py-1 font-['Manrope'] text-[11px] font-bold uppercase tracking-[0.16em] ${
                  pollOpen(stateId) ? "bg-[#2E9E5B]/15 text-[#7EE0A5]" : "bg-[#D64541]/20 text-[#FF9C8A]"
                }`}
              >
                {pollOpen(stateId) ? "Poll open" : "Poll paused"}
              </span>
            </div>

            {governorship.length === 0 ? (
              <p className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center font-['Manrope'] text-[14px] text-[#9AA5B4]">
                No governorship candidates are published for {activeState.name} yet.
              </p>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {governorship.map((row, index) => (
                  <motion.div key={row.candidate.id} {...rise(reduce, index * 0.05)}>
                    <CandidateCard
                      candidate={row.candidate}
                      voted={votedIn(stateId)}
                      disabled={!pollOpen(stateId)}
                      onVote={() => open(row.candidate, stateId, pollName(stateId))}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            <p className="mt-6 font-['Manrope'] text-[12px] leading-relaxed text-[#8A94A6]">{KOGI_NOTE}</p>
          </section>
        )}

        {tab === "results" && (
          <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
            <SectionHead
              eyebrow="Live tally"
              title="Arewa 2027 results dashboard"
              blurb="Percentages update on every accepted ballot and refresh automatically. Sorting is live from highest share to lowest."
            />

            <div className="mt-6 flex flex-wrap gap-2">
              {[POLL_PRESIDENTIAL, ...STATE_LIST.map((s) => s.id)].map((id) => {
                const active = id === resultPoll;
                return (
                  <button
                    key={id}
                    onClick={() => setResultPoll(id)}
                    className={`rounded-full px-3.5 py-2 font-['Manrope'] text-[12px] font-medium transition active:scale-[0.98] ${
                      active ? "bg-[#D4AF37] text-[#0B0F17]" : "border border-white/15 text-[#CBD5E1] hover:border-[#D4AF37]/50 hover:text-white"
                    }`}
                  >
                    {id === POLL_PRESIDENTIAL ? "Presidential" : STATE_LIST.find((s) => s.id === id)?.name}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="flex items-center gap-2 font-['Outfit'] text-lg font-semibold text-white">
                  <Trophy className="h-4 w-4 text-[#E8C766]" /> Podium: {pollName(resultPoll)}
                </h3>
                {topThree.length === 0 ? (
                  <p className="mt-4 font-['Manrope'] text-[13px] text-[#9AA5B4]">No responses recorded for this poll yet.</p>
                ) : (
                  <div className="mt-5 space-y-4">
                    {topThree.map((row, index) => (
                      <div key={row.candidate.id} className="flex items-center gap-4">
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-['Outfit'] text-sm font-bold ${
                            index === 0 ? "bg-[#D4AF37] text-[#0B0F17]" : "bg-white/10 text-[#E8C766]"
                          }`}
                        >
                          {index === 0 ? <Medal className="h-5 w-5" /> : index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-['Manrope'] text-[14px] font-semibold text-white">{row.candidate.name}</p>
                          <p className="font-['Manrope'] text-[11px] text-[#7F8898]">
                            {row.candidate.party} | {row.votes.toLocaleString("en-GB")} ballots
                          </p>
                        </div>
                        <span className="font-['Outfit'] text-lg font-bold text-[#E8C766]">{row.pct.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <StatTile head="Ballots in poll" value={resultRows.reduce((sum, r) => sum + r.votes, 0).toLocaleString("en-GB")} hint={pollName(resultPoll)} />
                  <StatTile head="Behind this device" value={m.myVotes.toString()} hint={`${m.blocked} duplicates blocked`} />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => exportCsv("results", resultPoll)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 font-['Manrope'] text-[12px] font-semibold text-[#CBD5E1] transition hover:bg-white/5"
                  >
                    <Download className="h-4 w-4" /> Export this poll
                  </button>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 font-['Manrope'] text-[11px] text-[#7F8898]">
                    <Clock className="h-3.5 w-3.5" /> Auto refresh every 7s
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {resultRows.map((row, index) => (
                  <LiveBar key={row.candidate.id} row={row} rank={index + 1} showMine />
                ))}
                {resultRows.length === 0 && (
                  <p className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center font-['Manrope'] text-[14px] text-[#9AA5B4]">
                    No candidates published for this poll window.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {tab === "admin" && <AdminPanel />}

        <footer className="border-t border-white/10 bg-[#090C13]">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="flex items-center gap-3">
                <img src={LOGO_URL} alt="YMR Media emblem" className="h-11 w-11 rounded-xl object-cover ring-1 ring-[#D4AF37]/40" />
                <div>
                  <p className="font-['Outfit'] text-lg font-semibold text-white">{BRAND.name}</p>
                  <p className="font-['Manrope'] text-[11px] uppercase tracking-[0.26em] text-[#8A94A6]">{BRAND.division}</p>
                </div>
              </div>
              <p className="mt-4 max-w-2xl font-['Manrope'] text-[12px] leading-relaxed text-[#8A94A6]">{BRAND.disclaimer}</p>
            </div>
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="font-['Manrope'] text-[10px] uppercase tracking-[0.24em] text-[#7F8898]">Platform</p>
                <ul className="mt-2 space-y-1.5">
                  {(["home", "presidential", "governors", "results"] as TabKey[]).map((key) => (
                    <li key={key}>
                      <button onClick={() => setTab(key)} className="font-['Manrope'] text-[13px] capitalize text-[#CBD5E1] transition hover:text-[#E8C766]">
                        {key}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-['Manrope'] text-[10px] uppercase tracking-[0.24em] text-[#7F8898]">Desk</p>
                <ul className="mt-2 space-y-1.5 font-['Manrope'] text-[13px] text-[#CBD5E1]">
                  <li className="inline-flex items-center gap-2"><Users className="h-3.5 w-3.5" /> Editorial polling unit</li>
                  <li className="inline-flex items-center gap-2"><TrendingUp className="h-3.5 w-3.5" /> Live tally operations</li>
                  <li className="inline-flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5" /> Ballot integrity desk</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 px-4 py-5 text-center font-['Manrope'] text-[11px] text-[#6B7280] sm:px-6">
            {BRAND.name} {new Date().getFullYear()} | Independent opinion polling in northern Nigeria. Not affiliated with INEC.
          </div>
        </footer>
      </div>

      <VoteModal target={target} onClose={() => setTarget(null)} />
    </div>
  );
}