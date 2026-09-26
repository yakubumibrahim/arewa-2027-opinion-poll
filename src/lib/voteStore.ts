import { useEffect, useState } from "react";
import type { Candidate, CandidateOverride, DuplicateCheck, Metrics, PollConfig, ResultRow, StoreState, VoteRecord } from "@/types";
import { CANDIDATES, PARTY_COLORS, POLL_PRESIDENTIAL, STATE_LIST } from "@/data/mockCandidates";

const KEY = "ymr.arewa.poll.v1";
/** Bump whenever the published candidate roster changes so stale admin edits cannot shadow it. */
const SEED_VERSION = "2";
const VERSION_KEY = "ymr.arewa.poll.seed";

const EMPTY: StoreState = {
  votes: {},
  records: [],
  polls: { presidential: true, governors: true },
  overrides: {},
  added: [],
  blocked: 0,
};

function hash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i += 1) h = ((h * 33) ^ input.charCodeAt(i)) >>> 0;
  return h.toString(16).padStart(8, "0");
}

function canvasPrint(): string {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 180;
    canvas.height = 36;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "no-canvas";
    ctx.fillStyle = "#0B0F17";
    ctx.fillRect(0, 0, 180, 36);
    ctx.fillStyle = "#D4AF37";
    ctx.font = "14px Arial";
    ctx.fillText("YMR Arewa 2027", 4, 24);
    return canvas.toDataURL().slice(-40);
  } catch {
    return "canvas-blocked";
  }
}

let cachedFingerprint = "";

export function deviceFingerprint(): string {
  if (cachedFingerprint) return cachedFingerprint;
  const nav = navigator;
  const parts = [
    nav.userAgent,
    nav.language,
    (nav.languages || []).join(","),
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    String(new Date().getTimezoneOffset()),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    String(nav.hardwareConcurrency || 0),
    canvasPrint(),
  ].join("|");
  cachedFingerprint = `YMR-${hash(parts)}-${hash(parts.split("").reverse().join("")).slice(0, 4)}`.toUpperCase();
  return cachedFingerprint;
}

export function ipHash(): string {
  return `IP-${hash(`${deviceFingerprint()}|edge`)}`.toUpperCase();
}

function rememberSeed() {
  try {
    localStorage.setItem(VERSION_KEY, SEED_VERSION);
  } catch {
    /* storage unavailable - session only */
  }
}

function load(): StoreState {
  try {
    const raw = localStorage.getItem(KEY);
    const stale = localStorage.getItem(VERSION_KEY) !== SEED_VERSION;
    if (stale) rememberSeed();
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<StoreState>;
    return {
      ...EMPTY,
      ...parsed,
      polls: { ...EMPTY.polls, ...(parsed.polls || {}) },
      // Edits saved against an older roster must not shadow the newly published
      // slate; custom candidates, votes and the audit log survive untouched.
      overrides: stale ? {} : parsed.overrides || {},
    };
  } catch {
    return EMPTY;
  }
}

let state: StoreState = load();
const listeners = new Set<() => void>();

function commit(next: Partial<StoreState>) {
  state = { ...state, ...next };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable - session only */
  }
  listeners.forEach((fn) => fn());
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getStore(): StoreState {
  return state;
}

export function usePollStore(): StoreState {
  const [snap, setSnap] = useState<StoreState>(state);
  useEffect(() => {
    setSnap(getStore());
    return subscribe(() => setSnap(getStore()));
  }, []);
  return snap;
}

export function useLiveTick(ms = 7000): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return tick;
}

const seedFor = (c: Candidate) => (parseInt(hash(c.id + c.party), 16) % 5200) + 420;

/** Slow deterministic drift so live counters visibly move without a backend. */
const drift = () => {
  const t = Date.now() / 1000;
  return 1 + (Math.sin(t / 780) + 1) * 0.055;
};

export function simulatedVotes(c: Candidate): number {
  return Math.round(seedFor(c) * drift());
}

export function allCandidates(): Candidate[] {
  return [...CANDIDATES, ...state.added].map((c) => {
    const patch = state.overrides[c.id];
    return patch ? { ...c, ...patch } : c;
  });
}

export function candidatesByPoll(pollId: string, includeInactive = false): Candidate[] {
  return allCandidates().filter((c) => c.ballot === pollId && (includeInactive || c.active));
}

export function liveVotes(c: Candidate): number {
  return simulatedVotes(c) + (state.votes[c.id] || 0);
}

export function totalVotesFor(pollId: string): number {
  return candidatesByPoll(pollId).reduce((sum, c) => sum + liveVotes(c), 0);
}

export function resultsFor(pollId: string): ResultRow[] {
  const rows: ResultRow[] = candidatesByPoll(pollId).map((c) => ({
    candidate: c,
    votes: liveVotes(c),
    mine: state.votes[c.id] || 0,
    pct: 0,
  }));
  const total = rows.reduce((sum, r) => sum + r.votes, 0) || 1;
  return rows
    .map((r) => ({ ...r, pct: (r.votes / total) * 100 }))
    .sort((a, b) => b.votes - a.votes);
}

const pollKey = (pollId: string): keyof PollConfig => (pollId === POLL_PRESIDENTIAL ? "presidential" : "governors");

export function isPollOpen(pollId: string): boolean {
  return state.polls[pollKey(pollId)];
}

export function voteStatus(pollId: string): DuplicateCheck {
  const fp = deviceFingerprint();
  const record = [...state.records].reverse().find((r) => r.pollId === pollId && r.fingerprint === fp);
  if (record) {
    return { allowed: false, reason: "This device has already submitted a vote in this poll.", at: record.at };
  }
  return { allowed: true };
}

export function castVote(candidateId: string, pollId: string, pollLabel: string): DuplicateCheck {
  const candidate = allCandidates().find((c) => c.id === candidateId);
  if (!candidate) return { allowed: false, reason: "Candidate record not found." };
  if (!candidate.active) return { allowed: false, reason: "This candidate has been suspended by the administrator." };
  if (!isPollOpen(pollId)) return { allowed: false, reason: "This poll is temporarily paused by the administrator." };
  const status = voteStatus(pollId);
  if (!status.allowed) {
    commit({ blocked: state.blocked + 1 });
    return status;
  }
  const record: VoteRecord = {
    id: `V${hash(`${candidateId}-${Date.now()}`)}`,
    candidateId,
    candidateName: candidate.name,
    pollId,
    pollLabel,
    at: Date.now(),
    fingerprint: deviceFingerprint(),
    ipHash: ipHash(),
  };
  commit({
    votes: { ...state.votes, [candidateId]: (state.votes[candidateId] || 0) + 1 },
    records: [...state.records, record],
  });
  return { allowed: true, at: record.at };
}

export function metrics(): Metrics {
  const list = allCandidates();
  const totalVotes = list.reduce((sum, c) => sum + liveVotes(c), 0);
  const myVotes = Object.values(state.votes).reduce((a, b) => a + b, 0);
  const recent = state.records.filter((r) => Date.now() - r.at < 3600_000).length;
  return {
    totalVotes,
    myVotes,
    candidates: list.length,
    states: STATE_LIST.length,
    blocked: state.blocked,
    hourlyVelocity: Math.round(totalVotes * 0.0042) + recent,
    lastUpdate: Date.now(),
  };
}

export function patchCandidate(id: string, patch: CandidateOverride) {
  commit({ overrides: { ...state.overrides, [id]: { ...(state.overrides[id] || {}), ...patch } } });
}

export function addCandidate(input: { name: string; party: string; runningMate: string; ballot: string; manifesto: string }) {
  const candidate: Candidate = {
    id: `custom-${hash(`${input.name}-${Date.now()}`)}`,
    name: input.name,
    party: input.party.toUpperCase(),
    runningMate: input.runningMate || "Running mate pending",
    manifesto: input.manifesto || "Manifesto pending verification by the editorial desk",
    ballot: input.ballot,
    color: PARTY_COLORS[input.party.toUpperCase()] || "#C5A059",
    incumbent: false,
    active: true,
    custom: true,
  };
  commit({ added: [...state.added, candidate] });
  return candidate;
}

export function removeCandidate(id: string) {
  commit({ added: state.added.filter((c) => c.id !== id) });
}

export function setPoll(key: keyof PollConfig, open: boolean) {
  commit({ polls: { ...state.polls, [key]: open } });
}

export function resetAllVotes() {
  commit({ votes: {}, records: [], blocked: 0 });
}

export function clearAuditLog() {
  commit({ records: [] });
}

export function formatStamp(at: number): string {
  return new Date(at).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function exportCsv(kind: "results" | "log", pollId?: string) {
  const rows: Array<Array<string | number>> = [];
  if (kind === "results") {
    rows.push(["Poll", "Candidate", "Party", "Running mate", "Votes", "Share (%)"]);
    const targets = pollId ? [pollId] : [POLL_PRESIDENTIAL, ...STATE_LIST.map((s) => s.id)];
    targets.forEach((id) => {
      resultsFor(id).forEach((row) => {
        rows.push([
          row.candidate.ballot === POLL_PRESIDENTIAL ? "Presidential" : row.candidate.ballot,
          row.candidate.name,
          row.candidate.party,
          row.candidate.runningMate,
          row.votes,
          row.pct.toFixed(2),
        ]);
      });
    });
  } else {
    rows.push(["Record ID", "Device fingerprint", "Edge IP hash", "Poll", "Candidate", "Received at"]);
    state.records.forEach((r) => {
      rows.push([r.id, r.fingerprint, r.ipHash, r.pollLabel, r.candidateName, formatStamp(r.at)]);
    });
  }
  const NEWLINE = String.fromCharCode(10);
  const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join(NEWLINE);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `ymr-arewa-${kind}-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}