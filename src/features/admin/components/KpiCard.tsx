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

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex items-center justify-between gap-4 transition-all duration-300 hover:bg-white/[0.05] hover:border-white/15 hover:shadow-lg hover:shadow-purple-900/5 group text-left">
      <div className="min-w-0">
        <p className="text-xs text-white/50 uppercase tracking-widest font-mono font-medium truncate">{title}</p>
        <h3 className="text-2xl font-black text-white mt-1.5 tracking-tight truncate">{value}</h3>
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {getTrendBadge()}
          <span className="text-[10px] text-white/30 font-medium">vs prev period</span>
        </div>
      </div>

      {icon && (
        <div className="w-12 h-12 bg-white/5 border border-white/10 group-hover:border-purple-500/40 rounded-xl flex items-center justify-center text-white/60 group-hover:text-purple-400 shrink-0 transition-all duration-300">
          {icon}
        </div>
      )}
    </div>
  );
}
