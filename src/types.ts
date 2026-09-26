export type Zone = "North West" | "North East" | "North Central";

export type TabKey = "home" | "presidential" | "governors" | "results" | "admin";

export interface Candidate {
  id: string;
  name: string;
  party: string;
  runningMate: string;
  manifesto: string;
  /** Poll group this candidate belongs to: "presidential" or a state id */
  ballot: string;
  color: string;
  incumbent: boolean;
  active: boolean;
  custom?: boolean;
}

export interface StateInfo {
  id: string;
  name: string;
  zone: Zone;
  capital: string;
  /** Registered voters, in millions (simulated reference figure) */
  voters: number;
}

export interface VoteRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  pollId: string;
  pollLabel: string;
  at: number;
  fingerprint: string;
  ipHash: string;
}

export interface PollConfig {
  presidential: boolean;
  governors: boolean;
}

export interface CandidateOverride {
  name?: string;
  party?: string;
  runningMate?: string;
  manifesto?: string;
  active?: boolean;
}

export interface StoreState {
  votes: Record<string, number>;
  records: VoteRecord[];
  polls: PollConfig;
  overrides: Record<string, CandidateOverride>;
  added: Candidate[];
  blocked: number;
}

export interface DuplicateCheck {
  allowed: boolean;
  reason?: string;
  at?: number;
}

export interface ResultRow {
  candidate: Candidate;
  votes: number;
  pct: number;
  mine: number;
}

export interface Metrics {
  totalVotes: number;
  myVotes: number;
  candidates: number;
  states: number;
  blocked: number;
  hourlyVelocity: number;
  lastUpdate: number;
}