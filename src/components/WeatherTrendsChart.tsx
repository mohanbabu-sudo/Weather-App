import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Thermometer, Sparkles } from 'lucide-react';
import { WeatherData } from '../types';
import { formatShortDay } from '../utils/weather';

interface WeatherTrendsChartProps {
  weather: WeatherData;
}

export default function WeatherTrendsChart({ weather }: WeatherTrendsChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const height = 220;

  // Handle dynamic container resizing
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setWidth(Math.max(300, entry.contentRect.width));
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const daily = weather.daily;
  const maxTemps = daily.temperature_2m_max;
  const minTemps = daily.temperature_2m_min;
  const dates = daily.time;

  // Find min and max of all temperatures to establish correct vertical bounds
  const { absoluteMin, absoluteMax, yRange } = useMemo(() => {
    const all = [...maxTemps, ...minTemps];
    const rawMin = Math.min(...all);
    const rawMax = Math.max(...all);
    // Add 2 degrees padding on top and bottom for visual breathing space
    const absoluteMin = rawMin - 2;
    const absoluteMax = rawMax + 2;
    const yRange = absoluteMax - absoluteMin || 1;
    return { absoluteMin, absoluteMax, yRange };
  }, [maxTemps, minTemps]);

  // Chart padding bounds
  const padding = { left: 40, right: 30, top: 30, bottom: 35 };

  // Calculate coordinates for SVG paths
  const chartPoints = useMemo(() => {
    const getX = (index: number) => {
      const drawableWidth = width - padding.left - padding.right;
      return padding.left + (index * drawableWidth) / 6;
    };

    const getY = (temp: number) => {
      const drawableHeight = height - padding.top - padding.bottom;
      const normalized = (temp - absoluteMin) / yRange;
      return padding.top + drawableHeight * (1 - normalized);
    };

    const highPoints = maxTemps.map((temp, i) => ({ x: getX(i), y: getY(temp), temp, date: dates[i] }));
    const lowPoints = minTemps.map((temp, i) => ({ x: getX(i), y: getY(temp), temp, date: dates[i] }));

    return { highPoints, lowPoints };
  }, [maxTemps, minTemps, dates, width, absoluteMin, yRange]);

  // Create SVG path strings (smooth quadratic curves)
  const drawPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      d += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const highPath = drawPath(chartPoints.highPoints);
  const lowPath = drawPath(chartPoints.lowPoints);

  // Closed paths for gradients
  const highGradientPath = `${highPath} L ${chartPoints.highPoints[chartPoints.highPoints.length - 1].x} ${height - padding.bottom} L ${chartPoints.highPoints[0].x} ${height - padding.bottom} Z`;
  const lowGradientPath = `${lowPath} L ${chartPoints.lowPoints[chartPoints.lowPoints.length - 1].x} ${height - padding.bottom} L ${chartPoints.lowPoints[0].x} ${height - padding.bottom} Z`;

  // Handle mouse move to find closest column index
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - svgRect.left;
    
    const drawableWidth = width - padding.left - padding.right;
    const relativeX = clientX - padding.left;
    
    let index = Math.round((relativeX / drawableWidth) * 6);
    index = Math.max(0, Math.min(6, index));
    setHoverIndex(index);
  };

  // Grid line temperatures to display
  const yGridLines = useMemo(() => {
    const lines = [];
    const step = yRange / 4;
    for (let i = 0; i <= 4; i++) {
      lines.push(absoluteMin + step * i);
    }
    return lines;
  }, [absoluteMin, yRange]);

  return (
    <div id="weather-trends-container" className="bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-400" />
            Temperature Trends
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Compare high and low expectations for the upcoming 7 days
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" />
            <span className="text-slate-300">Daily Max</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" />
            <span className="text-slate-300">Daily Min</span>
          </div>
        </div>
      </div>

      <div ref={containerRef} className="w-full select-none relative">
        <svg
          width={width}
          height={height}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
          className="overflow-visible"
        >
          {/* Gradients */}
          <defs>
            <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {yGridLines.map((val, i) => {
            const drawableHeight = height - padding.top - padding.bottom;
            const normalized = (val - absoluteMin) / yRange;
            const y = padding.top + drawableHeight * (1 - normalized);
            return (
              <g key={i} className="opacity-40">
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="font-mono text-[10px] font-bold fill-slate-500"
                >
                  {Math.round(val)}°
                </text>
              </g>
            );
          })}

          {/* Vertical Guides / Hover Pillars */}
          {chartPoints.highPoints.map((pt, i) => (
            <g key={i}>
              {/* Highlight background column on hover */}
              <rect
                x={pt.x - 20}
                y={padding.top}
                width={40}
                height={height - padding.top - padding.bottom}
                fill={hoverIndex === i ? '#1e293b' : 'transparent'}
                rx="8"
                className="transition-colors duration-150"
              />
              <line
                x1={pt.x}
                y1={padding.top}
                x2={pt.x}
                y2={height - padding.bottom}
                stroke={hoverIndex === i ? '#475569' : '#1e293b'}
                strokeWidth={hoverIndex === i ? 1.5 : 1}
                strokeDasharray={hoverIndex === i ? 'none' : '2 2'}
                className="transition-all duration-150"
              />
            </g>
          ))}

          {/* Low Temp area gradient */}
          <path d={lowGradientPath} fill="url(#lowGrad)" />
          {/* High Temp area gradient */}
          <path d={highGradientPath} fill="url(#highGrad)" />

          {/* Low Temp trend line */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            d={lowPath}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* High Temp trend line */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            d={highPath}
            fill="none"
            stroke="#f97316"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Chart Nodes (Dots) */}
          {chartPoints.highPoints.map((pt, i) => {
            const isHovered = hoverIndex === i;
            return (
              <g key={i}>
                {/* High Point Dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 7 : 4}
                  fill="#f97316"
                  stroke="#0f172a"
                  strokeWidth="2.5"
                  className="transition-all duration-150 shadow-sm"
                />
                {/* Low Point Dot */}
                <circle
                  cx={chartPoints.lowPoints[i].x}
                  cy={chartPoints.lowPoints[i].y}
                  r={isHovered ? 7 : 4}
                  fill="#38bdf8"
                  stroke="#0f172a"
                  strokeWidth="2.5"
                  className="transition-all duration-150 shadow-sm"
                />
              </g>
            );
          })}

          {/* X Axis Labels */}
          {chartPoints.highPoints.map((pt, i) => (
            <text
              key={i}
              x={pt.x}
              y={height - 12}
              textAnchor="middle"
              className={`font-semibold text-[10px] md:text-xs transition-colors duration-150 ${
                hoverIndex === i ? 'fill-white font-bold' : 'fill-slate-400'
              }`}
            >
              {i === 0 ? 'Today' : formatShortDay(pt.date)}
            </text>
          ))}
        </svg>

        {/* Dynamic Float Tooltip Card */}
        {hoverIndex !== null && (
          <div
            style={{
              position: 'absolute',
              left: `${chartPoints.highPoints[hoverIndex].x}px`,
              top: '0px',
              transform: `translateX(-50%) translateY(-100%) translateY(${padding.top - 12}px)`,
            }}
            className="bg-slate-950 border border-slate-800 text-white rounded-xl py-2 px-3 shadow-2xl flex flex-col gap-1 z-20 pointer-events-none min-w-[120px]"
          >
            <span className="text-[10px] font-bold text-slate-400 border-b border-slate-800 pb-1 uppercase tracking-wide flex items-center justify-between gap-1.5 font-mono">
              <span>{formatShortDay(dates[hoverIndex])} {dates[hoverIndex].split('-').slice(1).reverse().join('/')}</span>
              <Sparkles size={8} className="text-indigo-400" />
            </span>
            <div className="flex justify-between items-center text-xs mt-1 font-mono">
              <span className="flex items-center gap-1 font-sans text-slate-300 font-medium">
                <Thermometer size={11} className="text-orange-400" /> Max:
              </span>
              <span className="font-bold text-orange-400">{Math.round(maxTemps[hoverIndex])}°C</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="flex items-center gap-1 font-sans text-slate-300 font-medium">
                <Thermometer size={11} className="text-sky-400" /> Min:
              </span>
              <span className="font-bold text-sky-400">{Math.round(minTemps[hoverIndex])}°C</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
