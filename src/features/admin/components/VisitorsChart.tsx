import React, { useState, useRef } from 'react';

interface VisitorsChartProps {
  dates: string[];
  visitors: number[];
  pageViews: number[];
}

export default function VisitorsChart({ dates, visitors, pageViews }: VisitorsChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const maxVal = Math.max(...visitors, ...pageViews, 10);
  const minVal = 0;
  const range = maxVal - minVal;

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 240;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  if (dates.length === 0) {
    return (
      <div className="h-[240px] flex items-center justify-center text-white/40 text-xs font-mono">
        No visitor analytics recorded.
      </div>
    );
  }

  // Generate coordinates for Visitors (Cyan)
  const visitorPoints = visitors.map((val, idx) => {
    const x = paddingLeft + (idx / (dates.length - 1 || 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((val - minVal) / range) * chartHeight;
    return { x, y, value: val };
  });

  // Generate coordinates for Page Views (Purple)
  const pageViewPoints = pageViews.map((val, idx) => {
    const x = paddingLeft + (idx / (dates.length - 1 || 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((val - minVal) / range) * chartHeight;
    return { x, y, value: val };
  });

  // Generate SVG Lines
  const visitorLinePath = visitorPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const pageViewLinePath = pageViewPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Generate SVG Path for the filled Area under the lines
  const visitorAreaPath = visitorPoints.length > 0 
    ? `${visitorLinePath} L ${visitorPoints[visitorPoints.length - 1].x} ${paddingTop + chartHeight} L ${visitorPoints[0].x} ${paddingTop + chartHeight} Z`
    : '';
  const pageViewAreaPath = pageViewPoints.length > 0 
    ? `${pageViewLinePath} L ${pageViewPoints[pageViewPoints.length - 1].x} ${paddingTop + chartHeight} L ${pageViewPoints[0].x} ${paddingTop + chartHeight} Z`
    : '';

  // Handle Mouse Hover
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - paddingLeft;
    
    const step = chartWidth / (dates.length - 1 || 1);
    let closestIdx = Math.round(mouseX / step);
    if (closestIdx < 0) closestIdx = 0;
    if (closestIdx >= dates.length) closestIdx = dates.length - 1;

    setHoveredIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const gridLevels = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div ref={containerRef} className="relative w-full text-left">
      {/* Legend */}
      <div className="flex gap-4 justify-end text-[10px] font-mono mb-2 text-white/60 px-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span>Visitors</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-violet-400" />
          <span>Page Views</span>
        </div>
      </div>

      <svg 
        viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
        className="w-full h-auto overflow-visible select-none cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id="cyanAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.00" />
          </linearGradient>
          <linearGradient id="purpleAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.00" />
          </linearGradient>
        </defs>
        {/* Horizontal grid lines */}
        {gridLevels.map((lvl, idx) => {
          const y = paddingTop + chartHeight - lvl * chartHeight;
          const val = Math.round(minVal + lvl * range);
          return (
            <g key={idx}>
              <line 
                x1={paddingLeft} 
                y1={y} 
                x2={svgWidth - paddingRight} 
                y2={y} 
                className="stroke-white/5 stroke-1" 
                strokeDasharray="4 4"
              />
              <text 
                x={paddingLeft - 10} 
                y={y + 4} 
                className="fill-white/30 text-[9px] font-mono text-right"
                textAnchor="end"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* X Axis labels */}
        {dates.map((date, idx) => {
          const interval = Math.ceil(dates.length / 7);
          if (idx % interval !== 0 && idx !== dates.length - 1) return null;
          const x = paddingLeft + (idx / (dates.length - 1 || 1)) * chartWidth;
          return (
            <text
              key={idx}
              x={x}
              y={svgHeight - 10}
              className="fill-white/30 text-[9px] font-mono"
              textAnchor="middle"
            >
              {date}
            </text>
          );
        })}

        {/* Visitors Area Fill */}
        {visitorAreaPath && (
          <path d={visitorAreaPath} fill="url(#cyanAreaGrad)" className="transition-all duration-300" />
        )}

        {/* Page Views Area Fill */}
        {pageViewAreaPath && (
          <path d={pageViewAreaPath} fill="url(#purpleAreaGrad)" className="transition-all duration-300" />
        )}

        {/* Visitors Cyan Line */}
        {visitorLinePath && (
          <path 
            d={visitorLinePath} 
            fill="none" 
            stroke="#22d3ee" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="transition-all duration-300"
          />
        )}

        {/* Page Views Violet Line */}
        {pageViewLinePath && (
          <path 
            d={pageViewLinePath} 
            fill="none" 
            stroke="#a78bfa" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="transition-all duration-300"
          />
        )}

        {/* Hover elements */}
        {hoveredIndex !== null && visitorPoints[hoveredIndex] && (
          <g>
            <line 
              x1={visitorPoints[hoveredIndex].x} 
              y1={paddingTop} 
              x2={visitorPoints[hoveredIndex].x} 
              y2={paddingTop + chartHeight} 
              className="stroke-white/10 stroke-[1.5px]"
              strokeDasharray="2 2"
            />
            {/* Visitors Dot */}
            <circle cx={visitorPoints[hoveredIndex].x} cy={visitorPoints[hoveredIndex].y} r="5" className="fill-[#22d3ee] stroke-slate-900 stroke-1" />
            {/* Page Views Dot */}
            <circle cx={pageViewPoints[hoveredIndex].x} cy={pageViewPoints[hoveredIndex].y} r="5" className="fill-[#a78bfa] stroke-slate-900 stroke-1" />
          </g>
        )}
      </svg>

      {/* Hover Tooltip */}
      {hoveredIndex !== null && visitorPoints[hoveredIndex] && (
        <div 
          className="absolute z-10 bg-zinc-950/90 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono text-white shadow-2xl backdrop-blur-md pointer-events-none flex flex-col gap-1 min-w-[110px]"
          style={{
            left: `${(visitorPoints[hoveredIndex].x / svgWidth) * 100}%`,
            top: '40%',
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="text-white/40 text-[9px] uppercase tracking-wider">{dates[hoveredIndex]}</div>
          <div className="flex justify-between items-center gap-4 mt-0.5">
            <span className="text-white/60">Visitors:</span>
            <span className="font-bold text-cyan-400">{visitors[hoveredIndex]}</span>
          </div>
          <div className="flex justify-between items-center gap-4">
            <span className="text-white/60">Page Views:</span>
            <span className="font-bold text-purple-400">{pageViews[hoveredIndex]}</span>
          </div>
        </div>
      )}
    </div>
  );
}
