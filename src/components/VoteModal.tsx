import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BadgeCheck, Check, Fingerprint, Lock, ShieldAlert, Trophy, Vote as VoteIcon, X } from "lucide-react";
import { toast } from "sonner";
import type { Candidate, ResultRow } from "@/types";
import { castVote, deviceFingerprint, formatStamp, voteStatus } from "@/lib/voteStore";

export interface VoteTarget {
  candidate: Candidate;
  pollId: string;
  pollLabel: string;
}

export function Monogram({ candidate, size = "md" }: { candidate: Candidate; size?: "sm" | "md" | "lg" }) {
  const initials = candidate.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const dim = size === "lg" ? "h-16 w-16 text-xl" : size === "sm" ? "h-9 w-9 text-[11px]" : "h-12 w-12 text-sm";
  return (
    <span
      className={`flex ${dim} shrink-0 items-center justify-center rounded-2xl font-['Outfit'] font-bold text-[#0B0F17] ring-1 ring-white/20`}
      style={{ background: `linear-gradient(140deg, ${candidate.color} 0%, #E8C766 130%)` }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

export function PartyTag({ candidate }: { candidate: Candidate }) {
  return (
    <span
      className="rounded-md px-2 py-0.5 font-['Manrope'] text-[10px] font-bold uppercase tracking-[0.12em]"
      style={{ backgroundColor: `${candidate.color}22`, color: candidate.color }}
    >
      {candidate.party}
    </span>
  );
}

export function CandidateCard({
  candidate,
  onVote,
  voted,
  disabled,
  compact,
}: {
  candidate: Candidate;
  onVote: () => void;
  voted: boolean;
  disabled?: boolean;
  compact?: boolean;
}) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.01] p-5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/40">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#D4AF37]/10 blur-3xl transition group-hover:bg-[#D4AF37]/20" />
      <div className="relative flex items-start gap-4">
        <Monogram candidate={candidate} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-['Outfit'] text-[17px] font-semibold leading-tight text-white">{candidate.name}</h3>
            <PartyTag candidate={candidate} />
            {candidate.incumbent && (
              <span className="rounded-md bg-white/10 px-2 py-0.5 font-['Manrope'] text-[10px] font-semibold uppercase tracking-[0.12em] text-[#E8C766]">
                Incumbent
              </span>
            )}
          </div>
          <p className="mt-1.5 font-['Manrope'] text-[12px] text-[#9AA5B4]">
            {candidate.ballot === "presidential" ? "Running mate" : "Deputy"}: {candidate.runningMate}
          </p>
          {!compact && <p className="mt-2 font-['Manrope'] text-[13px] leading-relaxed text-[#CBD5E1]">{candidate.manifesto}</p>}
        </div>
      </div>

      <div className="relative mt-4 flex items-center gap-3">
        <button
          onClick={onVote}
          disabled={disabled || voted}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 font-['Manrope'] text-[13px] font-bold transition active:scale-[0.98] ${
            voted
              ? "cursor-not-allowed bg-[#2E9E5B]/15 text-[#7EE0A5] ring-1 ring-[#2E9E5B]/40"
              : disabled
                ? "cursor-not-allowed bg-white/5 text-[#6B7280] ring-1 ring-white/10"
                : "bg-[#D4AF37] text-[#0B0F17] hover:bg-[#E8C766]"
          }`}
        >
          {voted ? <BadgeCheck className="h-4 w-4" /> : <VoteIcon className="h-4 w-4" />}
          {voted ? "Vote recorded" : disabled ? "Poll paused" : "Vote for this candidate"}
        </button>
      </div>
    </article>
  );
}

export function LiveBar({ row, rank, showMine }: { row: ResultRow; rank: number; showMine?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-3">
        <span className="w-6 font-['Outfit'] text-sm font-bold text-[#8A94A6]">{rank}</span>
        <Monogram candidate={row.candidate} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-['Outfit'] text-[14px] font-semibold text-white">{row.candidate.name}</p>
            <PartyTag candidate={row.candidate} />
          </div>
          <p className="font-['Manrope'] text-[11px] text-[#7F8898]">
            {row.votes.toLocaleString("en-GB")} ballots
            {showMine && row.mine > 0 ? ` | ${row.mine} from this device` : ""}
          </p>
        </div>
        <span className="font-['Outfit'] text-[15px] font-bold text-[#E8C766]">{row.pct.toFixed(1)}%</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${row.candidate.color} 0%, #D4AF37 100%)` }}
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${Math.max(row.pct, 1.5)}%` }}
          transition={{ duration: reduce ? 0 : 0.9, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

type Stage = "confirm" | "verifying" | "success" | "blocked";

export function VoteModal({ target, onClose }: { target: VoteTarget | null; onClose: () => void }) {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<Stage>("confirm");
  const [message, setMessage] = useState("");
  const [print, setPrint] = useState("");
  const [stamp, setStamp] = useState<number | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!target) return;
    setStage("confirm");
    setMessage("");
    setPrint(deviceFingerprint());
    const status = voteStatus(target.pollId);
    if (!status.allowed) {
      setStage("blocked");
      setMessage(status.reason || "Duplicate ballot blocked.");
      setStamp(status.at || null);
    }
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [target]);

  if (!target) return null;

  const confirm = () => {
    setStage("verifying");
    timer.current = window.setTimeout(() => {
      const result = castVote(target.candidate.id, target.pollId, target.pollLabel);
      setStamp(result.at || Date.now());
      if (result.allowed) {
        setStage("success");
        setMessage("Ballot accepted and cryptographically stamped.");
        toast.success("Your vote was recorded", { description: `${target.candidate.name} | ${target.pollLabel}` });
      } else {
        setStage("blocked");
        setMessage(result.reason || "This ballot was rejected.");
        toast.error("Ballot blocked", { description: result.reason });
      }
    }, 1400);
  };

  const steps: Array<{ id: Stage; label: string }> = [
    { id: "confirm", label: "Confirm" },
    { id: "verifying", label: "Verify device" },
    { id: "success", label: "Record" },
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-lg overflow-hidden rounded-t-3xl border border-white/10 bg-[#0E131B] sm:rounded-3xl"
          initial={reduce ? false : { y: 40, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={reduce ? undefined : { y: 30, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-2 font-['Manrope'] text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8A94A6]">
              <Lock className="h-3.5 w-3.5 text-[#D4AF37]" /> Secure ballot
            </div>
            <button onClick={onClose} className="rounded-full p-1.5 text-[#9AA5B4] transition hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-5 py-5">
            <div className="flex items-center gap-4">
              <Monogram candidate={target.candidate} size="lg" />
              <div className="min-w-0">
                <h2 className="font-['Outfit'] text-xl font-semibold leading-tight text-white">{target.candidate.name}</h2>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <PartyTag candidate={target.candidate} />
                  <span className="font-['Manrope'] text-[11px] text-[#9AA5B4]">{target.pollLabel}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2">
              {steps.map((step, index) => {
                const order = ["confirm", "verifying", "success"];
                const currentIndex = stage === "blocked" ? 1 : order.indexOf(stage);
                const done = index <= currentIndex;
                return (
                  <div key={step.id} className="flex flex-1 items-center gap-2">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full font-['Manrope'] text-[11px] font-bold ${
                        done ? "bg-[#D4AF37] text-[#0B0F17]" : "bg-white/10 text-[#8A94A6]"
                      }`}
                    >
                      {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                    </span>
                    <span className={`font-['Manrope'] text-[11px] ${done ? "text-[#E8C766]" : "text-[#7F8898]"}`}>
                      {step.label}
                    </span>
                    {index < steps.length - 1 && <span className="h-px flex-1 bg-white/10" />}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl border border-[#D4AF37]/25 bg-[#D4AF37]/[0.06] p-4">
              <div className="flex items-center gap-2 font-['Manrope'] text-[11px] uppercase tracking-[0.2em] text-[#E8C766]">
                <Fingerprint className="h-3.5 w-3.5" /> Device fingerprint
              </div>
              <p className="mt-1.5 break-all font-['Manrope'] text-[12px] text-[#CBD5E1]">{print || deviceFingerprint()}</p>
              {stage === "confirm" && (
                <p className="mt-3 font-['Manrope'] text-[12px] leading-relaxed text-[#9AA5B4]">
                  One ballot per device per poll window. The fingerprint is hashed locally and paired with an edge IP hash to
                  block stuffing and automated voting.
                </p>
              )}
              {stage === "verifying" && (
                <div className="mt-3">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-[#D4AF37]"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: reduce ? 0 : 1.3, ease: "easeInOut" }}
                    />
                  </div>
                  <p className="mt-2 font-['Manrope'] text-[12px] text-[#E8C766]">Validating device signature and duplicate registry...</p>
                </div>
              )}
              {stage === "success" && (
                <p className="mt-3 flex items-center gap-2 font-['Manrope'] text-[12px] font-semibold text-[#7EE0A5]">
                  <BadgeCheck className="h-4 w-4" /> {message}
                </p>
              )}
              {stage === "blocked" && (
                <p className="mt-3 flex items-start gap-2 font-['Manrope'] text-[12px] font-semibold text-[#FF9C8A]">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" /> {message}
                </p>
              )}
              {stamp && stage !== "confirm" && stage !== "verifying" && (
                <p className="mt-2 font-['Manrope'] text-[11px] text-[#8A94A6]">Timestamp: {formatStamp(stamp)}</p>
              )}
            </div>

            <div className="mt-5 flex gap-3">
              {stage === "confirm" && (
                <>
                  <button
                    onClick={onClose}
                    className="flex-1 rounded-full border border-white/15 px-4 py-2.5 font-['Manrope'] text-[13px] font-semibold text-[#CBD5E1] transition hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirm}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-4 py-2.5 font-['Manrope'] text-[13px] font-bold text-[#0B0F17] transition hover:bg-[#E8C766] active:scale-[0.98]"
                  >
                    <VoteIcon className="h-4 w-4" /> Confirm vote
                  </button>
                </>
              )}
              {stage === "verifying" && (
                <button
                  disabled
                  className="flex-1 cursor-wait rounded-full bg-white/10 px-4 py-2.5 font-['Manrope'] text-[13px] font-semibold text-[#9AA5B4]"
                >
                  Verifying...
                </button>
              )}
              {stage === "success" && (
                <button
                  onClick={onClose}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#2E9E5B] px-4 py-2.5 font-['Manrope'] text-[13px] font-bold text-[#04140B] transition hover:brightness-110"
                >
                  <Trophy className="h-4 w-4" /> Close and view results
                </button>
              )}
              {stage === "blocked" && (
                <button
                  onClick={onClose}
                  className="flex-1 rounded-full border border-white/15 px-4 py-2.5 font-['Manrope'] text-[13px] font-semibold text-[#CBD5E1] transition hover:bg-white/5"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}