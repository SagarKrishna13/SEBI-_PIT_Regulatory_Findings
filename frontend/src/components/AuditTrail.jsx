import React from 'react';
import { useCaseStore } from '../store/useCaseStore';
import { Clock, ShieldAlert, AlertTriangle, FileText, Calendar, Scale } from 'lucide-react';

export default function AuditTrail() {
  const { selectedCase } = useCaseStore();

  if (!selectedCase) {
    return (
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 text-center text-slate-400">
        Select a case to inspect regulatory audit logs and violation telemetry.
      </div>
    );
  }

  const { evaluation } = selectedCase;
  const auditEvents = evaluation?.audit_trail || [];
  const violations = evaluation?.violations || [];

  return (
    <div className="space-y-6">
      {/* Violations Summary Box */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 backdrop-blur-sm shadow-xl">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-white text-base">SEBI PIT Regulatory Findings</h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono">
            {selectedCase.case_id}
          </span>
        </div>

        {/* Cited Assessment & Ground Evidence Card */}
        {selectedCase.regulatory_assessment && (
          <div className="mb-4 p-4 rounded-lg bg-slate-950/70 border border-indigo-500/20 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-indigo-300 uppercase tracking-wider text-[11px]">
                Ground Evidence & Regulatory Clause
              </span>
              <span className={`px-2 py-0.5 rounded font-mono font-semibold ${
                selectedCase.regulatory_assessment.verdict === 'COMPLIANT'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : selectedCase.regulatory_assessment.verdict === 'INSUFFICIENT_EVIDENCE'
                  ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}>
                {selectedCase.regulatory_assessment.verdict}
              </span>
            </div>
            <div className="text-slate-300 font-mono">
              <span className="text-slate-400">Cited Clause:</span> {selectedCase.regulatory_assessment.cited_clause}
            </div>
            <div className="text-slate-400 leading-relaxed">
              <span className="text-slate-300 font-medium">Public Evidence Source:</span> {selectedCase.regulatory_assessment.evidence}
            </div>
            <div className="text-slate-400 leading-relaxed">
              <span className="text-slate-300 font-medium">Statutory Analysis:</span> {selectedCase.regulatory_assessment.reasoning}
            </div>

            {/* Optional Stretch Goal Callout for INSUFFICIENT EVIDENCE */}
            {selectedCase.stretch_goal && (
              <div className="mt-3 p-3 rounded bg-purple-950/30 border border-purple-500/30 text-purple-200 space-y-1">
                <div className="font-semibold text-purple-300 flex items-center gap-1.5 text-[11px]">
                  <span>🔍</span> Stretch Goal — Missing Evidence Remediation:
                </div>
                <div><span className="font-medium text-slate-300">Missing Piece:</span> {selectedCase.stretch_goal.missing_evidence}</div>
                <div><span className="font-medium text-slate-300">Where to Settle:</span> {selectedCase.stretch_goal.where_to_find}</div>
              </div>
            )}
          </div>
        )}

        {violations.length === 0 ? (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
            <span>✓</span> All statutory criteria satisfied under {selectedCase.applicable_regulation || 'SEBI PIT'}.
          </div>
        ) : (
          <div className="space-y-3">
            {violations.map((v, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-lg border text-sm ${
                  v.severity === 'CRITICAL'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                }`}
              >
                <div className="flex items-center justify-between font-semibold mb-1">
                  <span className="flex items-center gap-1.5">
                    {v.severity === 'CRITICAL' ? (
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    )}
                    {v.title}
                  </span>
                  <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-black/40">
                    {v.severity}
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-mono mb-1">{v.regulation}</div>
                <div className="text-xs text-slate-300 mb-2">{v.details}</div>
                <div className="text-xs pt-1.5 border-t border-white/10 text-slate-400">
                  <span className="font-semibold text-slate-300">Statutory Consequence:</span>{' '}
                  {v.penalty_risk}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reactive Timeline Audit Trail */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 backdrop-blur-sm shadow-xl">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
          <Clock className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-white text-base">Immutable Surveillance Timeline</h3>
        </div>

        <div className="relative border-l-2 border-slate-800 ml-4 space-y-6 py-2">
          {auditEvents.map((event, index) => {
            const isBreach = event.severity === 'CRITICAL';
            const isWarning = event.severity === 'WARNING';
            const dotColor = isBreach
              ? 'bg-rose-500 ring-rose-500/20'
              : isWarning
              ? 'bg-amber-500 ring-amber-500/20'
              : 'bg-indigo-500 ring-indigo-500/20';

            return (
              <div key={index} className="relative pl-6">
                <span
                  className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full ring-4 ${dotColor}`}
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">
                      {new Date(event.timestamp).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {event.phase}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-100 mt-1">{event.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
