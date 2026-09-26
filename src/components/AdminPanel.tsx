import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Download,
  Eye,
  Lock,
  LogOut,
  Pause,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { Candidate } from "@/types";
import { DEMO_PASSCODE, POLL_PRESIDENTIAL, STATE_LIST } from "@/data/mockCandidates";
import {
  addCandidate,
  allCandidates,
  clearAuditLog,
  exportCsv,
  formatStamp,
  metrics,
  patchCandidate,
  removeCandidate,
  resetAllVotes,
  setPoll,
  usePollStore,
} from "@/lib/voteStore";

const PAGE = 8;

const field =
  "w-full rounded-xl border border-white/15 bg-[#0B0F17] px-3.5 py-2.5 font-['Manrope'] text-[12px] text-white outline-none placeholder:text-[#6B7280] focus:border-[#D4AF37]/60";
const ghost =
  "inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 py-2.5 font-['Manrope'] text-[12px] font-semibold text-[#CBD5E1] transition hover:bg-white/5";
const chip = "inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 font-['Manrope'] text-[11px] font-semibold text-[#CBD5E1] transition hover:bg-white/5";
const label = (pollId: string) => (pollId === POLL_PRESIDENTIAL ? "Presidential" : STATE_LIST.find((s) => s.id === pollId)?.name || pollId);

function Tile({ head, value, hint }: { head: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="font-['Manrope'] text-[10px] uppercase tracking-[0.22em] text-[#8A94A6]">{head}</p>
      <p className="mt-1.5 font-['Outfit'] text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 font-['Manrope'] text-[11px] text-[#7F8898]">{hint}</p>
    </div>
  );
}

const emptyForm = { name: "", party: "", runningMate: "", manifesto: "", ballot: POLL_PRESIDENTIAL };

export default function AdminPanel() {
  const store = usePollStore();
  const [passcode, setPasscode] = useState("");
  const [authed, setAuthed] = useState(false);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState(POLL_PRESIDENTIAL);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", party: "" });
  const [form, setForm] = useState(emptyForm);
  const [confirmReset, setConfirmReset] = useState(false);

  const m = metrics();
  const candidates = allCandidates();
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return candidates.filter(
      (c) =>
        (scope === "all" || c.ballot === scope) &&
        (!q || c.name.toLowerCase().includes(q) || c.party.toLowerCase().includes(q)),
    );
  }, [candidates, query, scope]);
  const visible = filtered.slice(0, page * PAGE);

  if (!authed) {
    const unlock = () => {
      if (passcode === DEMO_PASSCODE) {
        setAuthed(true);
        toast.success("Administrator session opened");
      } else {
        toast.error("Incorrect passcode");
      }
    };
    return (
      <section className="mx-auto max-w-md px-4 py-20 sm:px-6">
        <div className="rounded-3xl border border-[#D4AF37]/25 bg-gradient-to-b from-white/[0.07] to-white/[0.01] p-7 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF37]/15 ring-1 ring-[#D4AF37]/40">
            <Lock className="h-6 w-6 text-[#E8C766]" />
          </span>
          <h2 className="mt-5 font-['Outfit'] text-2xl font-semibold text-white">Administrator access</h2>
          <p className="mt-2 font-['Manrope'] text-[13px] leading-relaxed text-[#9AA5B4]">
            This console controls the Arewa 2027 candidate slate and poll windows. Access is restricted to the YMR Media polling
            desk.
          </p>
          <div className="mt-6 flex gap-2">
            <input
              type="password"
              value={passcode}
              onChange={(event) => setPasscode(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && unlock()}
              placeholder="Enter passcode"
              className="flex-1 rounded-full border border-white/15 bg-[#0B0F17] px-4 py-2.5 font-['Manrope'] text-[13px] text-white outline-none placeholder:text-[#6B7280] focus:border-[#D4AF37]/60"
            />
            <button onClick={unlock} className="rounded-full bg-[#D4AF37] px-5 py-2.5 font-['Manrope'] text-[13px] font-bold text-[#0B0F17] transition hover:bg-[#E8C766]">
              Unlock
            </button>
          </div>
          <p className="mt-4 font-['Manrope'] text-[11px] text-[#7F8898]">Demo passcode: {DEMO_PASSCODE}</p>
        </div>
      </section>
    );
  }

  const submitNew = () => {
    if (!form.name.trim() || !form.party.trim()) {
      toast.error("Candidate name and party are required");
      return;
    }
    addCandidate(form);
    toast.success("Candidate added to the slate", { description: `${form.name} | ${form.party.toUpperCase()}` });
    setForm(emptyForm);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-['Manrope'] text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8A94A6]">Control room</span>
          <h2 className="mt-2 font-['Outfit'] text-3xl font-semibold tracking-tight text-white">Poll administration</h2>
          <p className="mt-2 max-w-2xl font-['Manrope'] text-[13px] leading-relaxed text-[#9AA5B4]">
            Manage slates, poll windows, ballot resets, the duplicate-blocking audit log and certified exports. One ballot per
            fingerprint, per poll window.
          </p>
        </div>
        <button onClick={() => { setAuthed(false); toast.success("Administrator session closed"); }} className={chip}>
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tile head="Total ballots" value={m.totalVotes.toLocaleString("en-GB")} hint={`${m.hourlyVelocity.toLocaleString("en-GB")} projected per hour`} />
        <Tile head="This device" value={m.myVotes.toString()} hint="Ballots accepted from your fingerprint" />
        <Tile head="Slate size" value={m.candidates.toString()} hint={`${m.states} states plus presidential ticket`} />
        <Tile head="Blocked duplicates" value={m.blocked.toString()} hint="Rejected repeat attempts" />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-['Outfit'] text-lg font-semibold text-white">Candidate management</h3>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 font-['Manrope'] text-[11px] text-[#CBD5E1]">{filtered.length} records</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search candidate or party"
                className="w-full rounded-full border border-white/15 bg-[#0B0F17] py-2.5 pl-9 pr-4 font-['Manrope'] text-[12px] text-white outline-none placeholder:text-[#6B7280] focus:border-[#D4AF37]/60"
              />
            </div>
            <select
              value={scope}
              onChange={(event) => { setScope(event.target.value); setPage(1); }}
              className="rounded-full border border-white/15 bg-[#0B0F17] px-4 py-2.5 font-['Manrope'] text-[12px] text-white outline-none focus:border-[#D4AF37]/60"
            >
              <option value="all">All polls</option>
              <option value={POLL_PRESIDENTIAL}>Presidential</option>
              {STATE_LIST.map((state) => (
                <option key={state.id} value={state.id}>{state.name} governorship</option>
              ))}
            </select>
          </div>

          <div className="mt-4 space-y-2">
            {visible.length === 0 && (
              <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center font-['Manrope'] text-[13px] text-[#9AA5B4]">
                No candidate matches this filter.
              </p>
            )}
            {visible.map((candidate: Candidate) => (
              <div key={candidate.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-[#0B0F17]/60 p-3">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: candidate.color }} />
                {editing === candidate.id ? (
                  <>
                    <input
                      value={draft.name}
                      onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                      className="min-w-[150px] flex-1 rounded-lg border border-white/15 bg-[#0B0F17] px-3 py-1.5 font-['Manrope'] text-[12px] text-white outline-none"
                    />
                    <input
                      value={draft.party}
                      onChange={(event) => setDraft({ ...draft, party: event.target.value })}
                      className="w-24 rounded-lg border border-white/15 bg-[#0B0F17] px-3 py-1.5 font-['Manrope'] text-[12px] text-white outline-none"
                    />
                    <button
                      onClick={() => {
                        patchCandidate(candidate.id, { name: draft.name.trim() || undefined, party: draft.party.trim().toUpperCase() || undefined });
                        setEditing(null);
                        toast.success("Candidate record updated");
                      }}
                      className="rounded-full bg-[#2E9E5B] px-3 py-1.5 font-['Manrope'] text-[11px] font-bold text-[#04140B]"
                    >
                      Save
                    </button>
                    <button onClick={() => setEditing(null)} className={chip}>Cancel</button>
                  </>
                ) : (
                  <>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-['Manrope'] text-[13px] font-semibold text-white">{candidate.name}</p>
                      <p className="truncate font-['Manrope'] text-[11px] text-[#7F8898]">
                        {candidate.party} | {label(candidate.ballot)} | {candidate.runningMate}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-['Manrope'] text-[10px] font-semibold uppercase tracking-[0.14em] ${
                        candidate.active ? "bg-[#2E9E5B]/15 text-[#7EE0A5]" : "bg-white/10 text-[#9AA5B4]"
                      }`}
                    >
                      {candidate.active ? "Active" : "Suspended"}
                    </span>
                    <button
                      onClick={() => {
                        patchCandidate(candidate.id, { active: !candidate.active });
                        toast.success(candidate.active ? "Candidate suspended" : "Candidate reinstated");
                      }}
                      className={chip}
                    >
                      {candidate.active ? <Eye className="h-3.5 w-3.5" /> : <BadgeCheck className="h-3.5 w-3.5" />}
                      {candidate.active ? "Suspend" : "Activate"}
                    </button>
                    <button onClick={() => { setEditing(candidate.id); setDraft({ name: candidate.name, party: candidate.party }); }} className={chip}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {candidate.custom && (
                      <button
                        onClick={() => { removeCandidate(candidate.id); toast.success("Custom candidate removed"); }}
                        className="inline-flex rounded-full border border-[#D64541]/40 px-3 py-1.5 text-[#FF9C8A] transition hover:bg-[#D64541]/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {visible.length < filtered.length && (
            <button onClick={() => setPage((p) => p + 1)} className={`${ghost} mt-3`}>
              Load more records
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="flex items-center gap-2 font-['Outfit'] text-lg font-semibold text-white">
              <Plus className="h-4 w-4 text-[#E8C766]" /> Add candidate
            </h3>
            <div className="mt-4 space-y-2.5">
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Candidate full name" className={field} />
              <input value={form.party} onChange={(event) => setForm({ ...form, party: event.target.value })} placeholder="Party abbreviation" className={field} />
              <input value={form.runningMate} onChange={(event) => setForm({ ...form, runningMate: event.target.value })} placeholder="Running mate or deputy" className={field} />
              <select value={form.ballot} onChange={(event) => setForm({ ...form, ballot: event.target.value })} className={field}>
                <option value={POLL_PRESIDENTIAL}>Presidential poll</option>
                {STATE_LIST.map((state) => (
                  <option key={state.id} value={state.id}>{state.name} governorship</option>
                ))}
              </select>
              <textarea
                value={form.manifesto}
                onChange={(event) => setForm({ ...form, manifesto: event.target.value })}
                placeholder="Manifesto headline"
                rows={2}
                className={field}
              />
              <button onClick={submitNew} className="w-full rounded-full bg-[#D4AF37] py-2.5 font-['Manrope'] text-[12px] font-bold text-[#0B0F17] transition hover:bg-[#E8C766]">
                Add to slate
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="font-['Outfit'] text-lg font-semibold text-white">Poll windows</h3>
            <div className="mt-4 space-y-2.5">
              {([["presidential", "Presidential poll"], ["governors", "Governorship polls"]] as const).map(([key, text]) => {
                const open = store.polls[key];
                return (
                  <div key={key} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0B0F17]/60 p-3">
                    <div>
                      <p className="font-['Manrope'] text-[13px] font-semibold text-white">{text}</p>
                      <p className="font-['Manrope'] text-[11px] text-[#7F8898]">{open ? "Accepting ballots" : "Paused"}</p>
                    </div>
                    <button
                      onClick={() => { setPoll(key, !open); toast.success(`${text} ${open ? "paused" : "resumed"}`); }}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-['Manrope'] text-[11px] font-bold ${
                        open ? "bg-[#2E9E5B]/20 text-[#7EE0A5]" : "bg-[#D64541]/20 text-[#FF9C8A]"
                      }`}
                    >
                      {open ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      {open ? "Pause" : "Resume"}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 space-y-2">
              <button onClick={() => exportCsv("results")} className={ghost}><Download className="h-4 w-4" /> Export results CSV</button>
              <button onClick={() => exportCsv("log")} className={ghost}><ShieldCheck className="h-4 w-4" /> Export audit log CSV</button>
              <button
                onClick={() => {
                  if (!confirmReset) {
                    setConfirmReset(true);
                    toast.warning("Press reset again to wipe all recorded ballots");
                    return;
                  }
                  resetAllVotes();
                  setConfirmReset(false);
                  toast.success("All recorded ballots cleared");
                }}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-full py-2.5 font-['Manrope'] text-[12px] font-semibold transition ${
                  confirmReset ? "bg-[#D64541] text-white" : "border border-[#D64541]/40 text-[#FF9C8A] hover:bg-[#D64541]/10"
                }`}
              >
                <RotateCcw className="h-4 w-4" /> {confirmReset ? "Confirm reset" : "Reset recorded ballots"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 font-['Outfit'] text-lg font-semibold text-white">
            <Users className="h-4 w-4 text-[#E8C766]" /> Duplicate-blocking audit log
          </h3>
          <button onClick={() => { clearAuditLog(); toast.success("Audit log cleared"); }} className={chip}>
            <X className="h-3.5 w-3.5" /> Clear log
          </button>
        </div>
        {store.records.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-white/10 bg-[#0B0F17]/60 p-6 text-center font-['Manrope'] text-[13px] text-[#9AA5B4]">
            No ballots recorded yet. Cast a vote to populate the audit trail.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="font-['Manrope'] text-[10px] uppercase tracking-[0.18em] text-[#7F8898]">
                  <th className="pb-2">Record</th>
                  <th className="pb-2">Poll</th>
                  <th className="pb-2">Candidate</th>
                  <th className="pb-2">Fingerprint</th>
                  <th className="pb-2">Edge IP hash</th>
                  <th className="pb-2">Received</th>
                </tr>
              </thead>
              <tbody className="font-['Manrope'] text-[12px] text-[#CBD5E1]">
                {[...store.records].reverse().slice(0, 10).map((record) => (
                  <tr key={record.id} className="border-t border-white/5">
                    <td className="py-2.5 font-mono text-[11px] text-[#8A94A6]">{record.id}</td>
                    <td className="py-2.5">{record.pollLabel}</td>
                    <td className="py-2.5 text-white">{record.candidateName}</td>
                    <td className="py-2.5 font-mono text-[11px]">{record.fingerprint}</td>
                    <td className="py-2.5 font-mono text-[11px]">{record.ipHash}</td>
                    <td className="py-2.5">{formatStamp(record.at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}