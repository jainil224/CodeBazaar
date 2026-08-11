import React, { useState, useRef } from 'react';

interface RevenueChartProps {
  dates: string[];
  values: number[];
}

export default function RevenueChart({ dates, values }: RevenueChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const maxVal = Math.max(...values, 100);
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

  if (values.length === 0) {
    return (
      <div className="h-[240px] flex items-center justify-center text-white/40 text-xs font-mono">
        No sales data recorded.
      </div>
    );
  }

  // Generate coordinates
  const points = values.map((val, idx) => {
    const x = paddingLeft + (idx / (values.length - 1 || 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((val - minVal) / range) * chartHeight;
    return { x, y, value: val, date: dates[idx] };
  });

  // Generate SVG Path for the Line
  const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Generate SVG Path for the filled Area under the line
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : '';

  // Handle Mouse Hover to show tooltips
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - paddingLeft;
    
    // Find closest point on X axis
    const step = chartWidth / (values.length - 1 || 1);
    let closestIdx = Math.round(mouseX / step);
    if (closestIdx < 0) closestIdx = 0;
    if (closestIdx >= values.length) closestIdx = values.length - 1;

    setHoveredIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  // Grid line levels
  const gridLevels = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div ref={containerRef} className="relative w-full text-left">
      <svg 
        viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
        className="w-full h-auto overflow-visible select-none cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Gradients definition */}
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.00" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid lines & Y Axis labels */}
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
                ₹{val}
              </text>
            </g>
          );
        })}

        {/* X Axis labels */}
        {points.map((p, idx) => {
          // Label frequency filter to prevent overlap
          const interval = Math.ceil(values.length / 7);
          if (idx % interval !== 0 && idx !== values.length - 1) return null;
          return (
            <text
              key={idx}
              x={p.x}
              y={svgHeight - 10}
              className="fill-white/30 text-[9px] font-mono"
              textAnchor="middle"
            >
              {p.date}
            </text>
          );
        })}

        {/* The Filled Gradient Area */}
        {areaPath && (
          <path d={areaPath} fill="url(#areaGrad)" className="transition-all duration-300" />
        )}

        {/* The Colored Stroke Line */}
        {linePath && (
          <path 
            d={linePath} 
            fill="none" 
            stroke="url(#lineGrad)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="transition-all duration-300"
          />
        )}

        {/* Hover elements (indicator line and glowing dot) */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <g>
            {/* Vertical guide line */}
            <line 
              x1={points[hoveredIndex].x} 
              y1={paddingTop} 
              x2={points[hoveredIndex].x} 
              y2={paddingTop + chartHeight} 
              className="stroke-purple-500/40 stroke-[1.5px]"
              strokeDasharray="2 2"
            />

            {/* Glowing outer circle */}
            <circle 
              cx={points[hoveredIndex].x} 
              cy={points[hoveredIndex].y} 
              r="6.5" 
              className="fill-purple-500/20 stroke-purple-400 stroke-1 animate-pulse"
            />
            {/* Inner solid circle */}
            <circle 
              cx={points[hoveredIndex].x} 
              cy={points[hoveredIndex].y} 
              r="3.5" 
              className="fill-white stroke-purple-600 stroke-[2px]"
            />
          </g>
        )}
      </svg>

      {/* Floating HTML Tooltip */}
      {hoveredIndex !== null && points[hoveredIndex] && (
        <div 
          className="absolute z-10 bg-zinc-950/90 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white shadow-2xl backdrop-blur-md pointer-events-none"
          style={{
            left: `${(points[hoveredIndex].x / svgWidth) * 100}%`,
            top: `${(points[hoveredIndex].y / svgHeight) * 75}%`,
            transform: 'translate(-50%, -125%)',
          }}
        >
          <div className="text-white/40 text-[9px] uppercase tracking-wider">{points[hoveredIndex].date}</div>
          <div className="font-bold text-green-400 mt-0.5">₹{points[hoveredIndex].value}</div>
        </div>
      )}
    </div>
  );
}
