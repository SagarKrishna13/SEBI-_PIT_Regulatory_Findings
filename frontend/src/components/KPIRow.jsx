import React from 'react';
import { useCaseStore } from '../store/useCaseStore';
import { ShieldAlert, AlertTriangle, CheckCircle2, TrendingUp, IndianRupee } from 'lucide-react';

export default function KPIRow() {
  const { analytics, cases } = useCaseStore();

  const totalCases = analytics?.total_cases_screened ?? cases.length;
  const criticalViolations = analytics?.critical_violations ?? 0;
  const highRisk = analytics?.high_risk_violations ?? 0;
  const compliant = analytics?.clean_compliance_cases ?? 0;
  const totalVolume = analytics?.total_volume_inr ?? 0;
  const complianceRate = analytics?.compliance_rate_percent ?? 0;

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(val);
  };

  const cards = [
    {
      title: 'Monitored Traded Volume',
      value: `₹${formatINR(totalVolume)}`,
      badge: `${totalCases} Insiders Screened`,
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
      icon: IndianRupee,
      iconColor: 'text-indigo-400',
    },
    {
      title: 'Critical Violations (Reg 4/10)',
      value: criticalViolations,
      badge: 'Blackout / Contra-Trades',
      badgeColor: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      icon: ShieldAlert,
      iconColor: 'text-rose-400',
    },
    {
      title: 'Disclosure Delays (Reg 7)',
      value: highRisk,
      badge: '> 2 Trading Days Delay',
      badgeColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
    },
    {
      title: 'Compliance Clean Rate',
      value: `${complianceRate}%`,
      badge: `${compliant} Fully Cleared`,
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, i) => {
        const IconComponent = card.icon;
        return (
          <div
            key={i}
            className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 shadow-lg backdrop-blur-sm flex flex-col justify-between hover:border-slate-700 transition"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className="p-2 rounded-lg bg-slate-800/80">
                <IconComponent className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white tracking-tight mb-2">
                {card.value}
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
