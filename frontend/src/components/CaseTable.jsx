import React from 'react';
import { useCaseStore } from '../store/useCaseStore';
import { AlertCircle, CheckCircle, ShieldAlert, ChevronRight } from 'lucide-react';

export default function CaseTable() {
  const { cases, selectedCaseId, setSelectedCaseId, filterStatus, searchQuery } = useCaseStore();

  const [designationFilter, setDesignationFilter] = React.useState('ALL');

  // Helper: Strictly checks if a case lacks statutory data required to compute compliance
  const isMissingRequiredData = (c) => {
    // 1. Missing trade dates, values, or trades
    const trades = c.trades || [];
    if (trades.length === 0) return true;
    const hasInvalidTrade = trades.some(t => !t.trade_date || t.trade_value === undefined || t.trade_value === null);
    if (hasInvalidTrade) return true;

    // 2. Missing disclosure dates for transactions exceeding the statutory 10 Lakh threshold
    const totalVal = trades.reduce((acc, t) => acc + (t.trade_value || 0), 0);
    if (totalVal >= 1000000.0 && (!c.disclosure_to_company_date || !c.pre_clearance_date)) {
      // Missing pre-clearance token or disclosure date needed to calculate statutory timelines
      if (c.regulatory_assessment?.verdict === 'INSUFFICIENT_EVIDENCE' || c.stretch_goal) {
        return true;
      }
    }

    // 3. Explicit insufficient evidence verdict from regulatory engine
    return c.evaluation?.status === 'INSUFFICIENT_EVIDENCE' || c.regulatory_assessment?.verdict === 'INSUFFICIENT_EVIDENCE';
  };

  const filteredCases = cases.filter((c) => {
    const status = c.evaluation?.status || 'UNKNOWN';
    if (filterStatus === 'CRITICAL' && !status.includes('CRITICAL')) return false;
    if (filterStatus === 'HIGH' && !status.includes('HIGH')) return false;
    if (filterStatus === 'COMPLIANT' && status !== 'COMPLIANT') return false;
    if (filterStatus === 'PRE-2020' && !c.case_id?.includes('PRE')) return false;
    if (filterStatus === 'POST-2020' && !c.case_id?.includes('POST') && !c.case_id?.includes('CSV')) return false;

    // Strict filter by Name/Designation status dropdown:
    if (designationFilter === 'COMPLIANT' && (status !== 'COMPLIANT' || isMissingRequiredData(c))) return false;
    if (designationFilter === 'NON_COMPLIANT' && !status.includes('NON_COMPLIANT')) return false;
    if (designationFilter === 'PARTIAL_VALUE' && !isMissingRequiredData(c)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.insider_name?.toLowerCase().includes(q);
      const matchCo = c.company_name?.toLowerCase().includes(q);
      const matchId = c.case_id?.toLowerCase().includes(q);
      return matchName || matchCo || matchId;
    }
    return true;
  });

  const getStatusBadge = (c) => {
    const status = c.evaluation?.status || 'UNKNOWN';
    if (isMissingRequiredData(c)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30">
          <AlertCircle className="w-3.5 h-3.5" /> PARTIAL VALUE
        </span>
      );
    }
    switch (status) {
      case 'NON_COMPLIANT_CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-3.5 h-3.5" /> NON-COMPLIANT
          </span>
        );
      case 'NON_COMPLIANT_HIGH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertCircle className="w-3.5 h-3.5" /> NON-COMPLIANT
          </span>
        );
      case 'COMPLIANT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-3.5 h-3.5" /> COMPLIANT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-700 text-slate-300">
            REVIEW NEEDED
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm shadow-xl">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
        <div>
          <h3 className="font-semibold text-white text-base">Monitored Surveillance Dossiers</h3>
          <p className="text-xs text-slate-400">Deterministic check against SEBI PIT Reg 4, 7 & Schedule B</p>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
          {filteredCases.length} records
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Case ID & Company</th>
              <th className="py-3 px-4">
                <div className="flex items-center gap-1.5">
                  <span>Name / Designation</span>
                  <select
                    value={designationFilter}
                    onChange={(e) => setDesignationFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-slate-300 text-[10px] rounded px-1.5 py-0.5 focus:outline-none focus:border-indigo-500 font-normal normal-case cursor-pointer"
                    title="Filter by status"
                  >
                    <option value="ALL">All</option>
                    <option value="COMPLIANT">Compliant</option>
                    <option value="NON_COMPLIANT">Non-Compliant</option>
                    <option value="PARTIAL_VALUE">Partial Value</option>
                  </select>
                </div>
              </th>
              <th className="py-3 px-4">Trade Value</th>
              <th className="py-3 px-4">Violations</th>
              <th className="py-3 px-4">Regulatory Verdict</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredCases.map((c) => {
              const isSelected = c.case_id === selectedCaseId;
              const totalVal = c.trades?.reduce((acc, t) => acc + (t.trade_value || 0), 0) || 0;
              const violationCount = c.evaluation?.violations?.length || 0;

              return (
                <tr
                  key={c.case_id}
                  onClick={() => setSelectedCaseId(c.case_id)}
                  className={`cursor-pointer transition hover:bg-slate-800/40 ${
                    isSelected ? 'bg-indigo-950/40 border-l-4 border-l-indigo-500' : ''
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-medium text-indigo-400">{c.case_id}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        c.case_id.includes('PRE') ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30' : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {c.case_id.includes('PRE') ? 'PRE-2020' : 'POST-2020'}
                      </span>
                    </div>
                    <div className="text-white font-medium">{c.company_name}</div>
                    <div className="text-xs text-slate-500 font-mono">{c.symbol}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-slate-200 font-medium">{c.insider_name}</div>
                    <div className="text-xs text-slate-400">{c.designation}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-200">
                    ₹{totalVal.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4">
                    {violationCount > 0 ? (
                      <span className="font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded text-xs">
                        {violationCount} breach(es)
                      </span>
                    ) : (
                      <span className="text-emerald-400 text-xs">0 breaches</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {getStatusBadge(c)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      className={`p-1.5 rounded-lg border transition ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCaseId(c.case_id);
                      }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredCases.length === 0 && (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400">
                  No cases matching current filter or search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
