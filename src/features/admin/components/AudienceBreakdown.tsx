
interface BreakdownItem {
  label: string;
  value: number; // percentage e.g. 62
}

interface AudienceBreakdownProps {
  devices: BreakdownItem[];
  browsers: BreakdownItem[];
  systems: BreakdownItem[];
  countries: BreakdownItem[];
}

export default function AudienceBreakdown({ devices, browsers, systems, countries }: AudienceBreakdownProps) {
  const renderCard = (title: string, items: BreakdownItem[], barColor: string) => {
    return (
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex flex-col h-full text-left">
        <h4 className="text-xs text-white/50 uppercase tracking-widest font-mono font-bold mb-4">{title}</h4>
        
        <div className="flex-1 space-y-3.5">
          {items.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-white/30 font-mono py-8">
              No audience data.
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-white/80">{item.label}</span>
                  <span className="font-mono text-white/60">{item.value}%</span>
                </div>
                
                {/* Horizontal Progress Bar */}
                <div className="w-full bg-white/5 border border-white/5 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
                    style={{ width: `${item.value}%` }} 
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {renderCard('Devices', devices, 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]')}
      {renderCard('Browsers', browsers, 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]')}
      {renderCard('Operating Systems', systems, 'bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.3)]')}
      {renderCard('Geographics', countries, 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]')}
    </div>
  );
}
