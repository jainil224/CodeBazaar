import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, AlertCircle } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  percentChange: number | null;
  status: 'up' | 'down' | 'neutral' | 'no_data';
  icon?: React.ReactNode;
}

export default function KpiCard({ title, value, percentChange, status, icon }: KpiCardProps) {
  const getTrendBadge = () => {
    switch (status) {
      case 'up':
        return (
          <div className="flex items-center gap-0.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{percentChange}%</span>
          </div>
        );
      case 'down':
        return (
          <div className="flex items-center gap-0.5 bg-red-500/10 border border-red-500/25 text-red-400 text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>-{percentChange}%</span>
          </div>
        );
      case 'neutral':
        return (
          <div className="flex items-center gap-0.5 bg-zinc-500/10 border border-zinc-500/25 text-zinc-400 text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0">
            <Minus className="w-3 h-3" />
            <span>0.0%</span>
          </div>
        );
      case 'no_data':
      default:
        return (
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 text-white/40 text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0" title="Not enough comparison data">
            <AlertCircle className="w-3 h-3" />
            <span>No data</span>
          </div>
        );
    }
  };

  const getThemeStyles = () => {
    const t = title.toLowerCase();
    if (t.includes('revenue') || t.includes('conversion')) {
      return {
        bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400 group-hover:border-amber-400/40 group-hover:shadow-[0_0_12px_rgba(245,158,11,0.25)]',
        border: 'border-b-amber-500/30'
      };
    }
    if (t.includes('order') || t.includes('active')) {
      return {
        bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 group-hover:border-emerald-400/40 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.25)]',
        border: 'border-b-emerald-500/30'
      };
    }
    if (t.includes('new user') || t.includes('click')) {
      return {
        bg: 'bg-purple-500/10 border-purple-500/20 text-purple-400 group-hover:border-purple-400/40 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.25)]',
        border: 'border-b-purple-500/30'
      };
    }
    return {
      bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400 group-hover:border-blue-400/40 group-hover:shadow-[0_0_12px_rgba(59,130,246,0.25)]',
      border: 'border-b-blue-500/30'
    };
  };

  const theme = getThemeStyles();

  return (
    <div className={`bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 border-b-2 ${theme.border} rounded-2xl p-5 flex items-center justify-between gap-4 transition-all duration-300 hover:bg-white/[0.06] hover:border-white/15 hover:shadow-xl hover:shadow-black/20 group text-left`}>
      <div className="min-w-0">
        <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono font-bold">{title}</p>
        <h3 className="text-2xl font-black text-white mt-1.5 tracking-tight truncate">{value}</h3>
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {getTrendBadge()}
          <span className="text-[10px] text-white/30 font-medium">vs prev period</span>
        </div>
      </div>

      {icon && (
        <div className={`w-12 h-12 border ${theme.bg} rounded-xl flex items-center justify-center shrink-0 transition-all duration-300`}>
          {icon}
        </div>
      )}
    </div>
  );
}
