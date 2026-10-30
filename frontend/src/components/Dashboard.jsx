import React, { useEffect } from 'react';
import { useCaseStore } from '../store/useCaseStore';
import KPIRow from './KPIRow';
import CaseTable from './CaseTable';
import AuditTrail from './AuditTrail';
import { ShieldCheck, RefreshCw, Search, Filter } from 'lucide-react';

export default function Dashboard() {
  const [showMap, setShowMap] = React.useState(false);
  const {
    fetchCasesAndAnalytics,
    loading,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    analytics,
  } = useCaseStore();

  useEffect(() => {
    fetchCasesAndAnalytics();
  }, [fetchCasesAndAnalytics]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                SEBI PIT Surveillance Engine
              </h1>
              <p className="text-xs text-slate-400">
                Automated Regulation 4, 7(2) & Schedule B Blackout / Contra-Trade Verification
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMap(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 text-xs font-semibold rounded-lg transition"
          >
            📋 Requirements Map & 2020 Diff
          </button>
          <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
            Engine: {analytics?.engine_version || 'SEBI_PIT_V2015_AMENDED_2020'}
          </span>
          <button
            onClick={() => fetchCasesAndAnalytics()}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Feed
          </button>
        </div>
      </header>

      {/* Requirements Map Modal */}
      {showMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">SEBI PIT Regulations Map & Amendment Breakdown</h2>
                <p className="text-xs text-slate-400">Statutory rules matrix before vs after July 17, 2020 notification</p>
              </div>
              <button
                onClick={() => setShowMap(false)}
                className="text-slate-400 hover:text-white font-mono text-sm px-2 py-1 bg-slate-800 rounded"
              >
                ✕ Close
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-semibold text-indigo-400 block mb-1">1. Who It Applies To</span>
                  <p className="text-slate-300 leading-relaxed">
                    Promoters, Key Managerial Personnel (KMPs), Board of Directors, Designated Persons (DPs), Immediate Relatives, and any Connected Persons who possess or have access to UPSI.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-semibold text-indigo-400 block mb-1">2. Statutory Triggers</span>
                  <p className="text-slate-300 leading-relaxed">
                    • Cumulative trade value exceeding <b>₹10,00,000</b> in a calendar quarter.<br/>
                    • End of financial quarter / Board meeting consideration of financial results.<br/>
                    • Any material events (M&A, dividend, major order, USFDA audits).
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-semibold text-indigo-400 block mb-1">3. Mandatory Actions</span>
                  <p className="text-slate-300 leading-relaxed">
                    • Mandatory Pre-clearance from Compliance Officer if value exceeds threshold.<br/>
                    • Complete cessation of trading during Trading Window Blackout.<br/>
                    • 6-Month lock-in: No opposite position (Contra-trade) permitted under Schedule B Clause 10.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-semibold text-indigo-400 block mb-1">4. Deadlines Counted in Trading Days</span>
                  <p className="text-slate-300 leading-relaxed">
                    • <b>Reg 7(2)(a):</b> Insider must intimate Company within <b>2 market trading days</b>.<br/>
                    • <b>Reg 7(2)(b):</b> Company must notify Stock Exchanges within <b>2 market trading days</b>.<br/>
                    • Trading window must remain shut until <b>48 hours</b> post public announcement.
                  </p>
                </div>
              </div>

              {/* Amendment Diff Table */}
              <div className="mt-4 border border-slate-800 rounded-xl overflow-hidden">
                <div className="bg-slate-950 px-4 py-2 font-semibold text-white border-b border-slate-800">
                  Key Changes in SEBI PIT Amendment (Effective July 17, 2020)
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Regulatory Clause</th>
                      <th className="py-2.5 px-3">Before July 17, 2020 (Original)</th>
                      <th className="py-2.5 px-3 text-indigo-300">After July 17, 2020 (Amended)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-medium">Reg 3(5) - Digital Database (SDD)</td>
                      <td className="py-2.5 px-3 text-slate-400">General database requirement without strict internal maintenance rules.</td>
                      <td className="py-2.5 px-3 text-emerald-400">Mandatory Structured Digital Database with timestamped audit trail, preserved for min 8 years; outsourcing strictly prohibited.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-medium">Schedule B Cl 4(2) - Window Closure</td>
                      <td className="py-2.5 px-3 text-slate-400">Window closure decided on discretionary basis by compliance officer.</td>
                      <td className="py-2.5 px-3 text-emerald-400">Strict statutory window closure from the end of every quarter until 48 hours post financial results.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-mono font-medium">System-Driven Disclosures (SDD)</td>
                      <td className="py-2.5 px-3 text-slate-400">Solely dependent on manual Form C filings by insiders.</td>
                      <td className="py-2.5 px-3 text-emerald-400">Automated system-driven disclosures directly fed from depositories & stock exchanges.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics KPI Row */}
      <KPIRow />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Insider, Company or Case ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 mr-1">Filter:</span>
          {['ALL', 'PRE-2020', 'POST-2020', 'CRITICAL', 'HIGH', 'COMPLIANT'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                filterStatus === tab
                  ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout (Wider Dossiers Table) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <CaseTable />
        </div>
        <div className="lg:col-span-4">
          <AuditTrail />
        </div>
      </div>
    </div>
  );
}
