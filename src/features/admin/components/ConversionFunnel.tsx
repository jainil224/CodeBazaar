import React from 'react';
import { Users, Eye, ShoppingCart, CreditCard, CheckCircle, ArrowDown } from 'lucide-react';

interface ConversionFunnelProps {
  funnel: {
    visitors: number;
    productViews: number;
    buyNowClicks: number;
    checkoutStarts: number;
    purchases: number;
  };
}

export default function ConversionFunnel({ funnel }: ConversionFunnelProps) {
  const { visitors, productViews, buyNowClicks, checkoutStarts, purchases } = funnel;

  const stages = [
    {
      name: 'Website Visitors',
      count: visitors,
      icon: <Users className="w-5 h-5" />,
      color: 'bg-blue-600 border-blue-500',
      textColor: 'text-blue-400'
    },
    {
      name: 'Product Views',
      count: productViews,
      icon: <Eye className="w-5 h-5" />,
      color: 'bg-cyan-600 border-cyan-500',
      textColor: 'text-cyan-400'
    },
    {
      name: 'Buy Now Clicks',
      count: buyNowClicks,
      icon: <ShoppingCart className="w-5 h-5" />,
      color: 'bg-amber-600 border-amber-500',
      textColor: 'text-amber-400'
    },
    {
      name: 'Checkout Starts',
      count: checkoutStarts,
      icon: <CreditCard className="w-5 h-5" />,
      color: 'bg-purple-600 border-purple-500',
      textColor: 'text-purple-400'
    },
    {
      name: 'Successful Purchases',
      count: purchases,
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'bg-emerald-600 border-emerald-500',
      textColor: 'text-emerald-400'
    }
  ];

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 text-left">
      <h3 className="text-sm font-bold font-mono uppercase tracking-widest text-white/50 mb-6">
        Conversion Funnel
      </h3>

      <div className="space-y-4">
        {stages.map((stage, idx) => {
          // Calculate percentage relative to first stage (Visitors)
          const basePercent = visitors > 0 ? Math.round((stage.count / visitors) * 100) : 0;
          
          // Calculate conversion from previous stage
          let conversionFromPrev = 100;
          if (idx > 0 && stages[idx - 1].count > 0) {
            conversionFromPrev = Math.round((stage.count / stages[idx - 1].count) * 100);
          }

          return (
            <React.Fragment key={idx}>
              {/* Connector Arrow */}
              {idx > 0 && (
                <div className="flex justify-center my-1 select-none">
                  <div className="flex items-center gap-2 text-white/30 text-[10px] font-mono">
                    <ArrowDown className="w-4 h-4 animate-bounce" />
                    <span>{conversionFromPrev}% conversion ({100 - conversionFromPrev}% drop-off)</span>
                  </div>
                </div>
              )}

              {/* Stage Card */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-4 transition-colors hover:bg-white/[0.04]">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${stage.color} text-white`}>
                    {stage.icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white leading-tight">{stage.name}</h4>
                    <p className="text-[10px] text-white/40 font-mono mt-0.5">Stage {idx + 1}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base font-black text-white font-mono">{stage.count}</div>
                  <div className={`text-xs font-bold font-mono ${stage.textColor} mt-0.5`}>
                    {basePercent}% of total
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
