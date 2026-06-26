import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Droplets, Wind, Sunrise, Sunset, ChevronDown, ChevronUp } from 'lucide-react';
import { WeatherData } from '../types';
import { getWeatherCondition, formatShortDay, formatMonthDay, formatDayName } from '../utils/weather';
import WeatherIcon from './WeatherIcon';

interface WeeklyForecastListProps {
  weather: WeatherData;
}

export default function WeeklyForecastList({ weather }: WeeklyForecastListProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const daily = weather.daily;

  // Format local sunrise/sunset
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: weather.timezone,
      });
    } catch {
      return isoString.split('T')[1] || '';
    }
  };

  const getDayRecommendation = (index: number) => {
    const isRainy = daily.precipitation_sum[index] > 0 || daily.precipitation_probability_max[index] > 50;
    const tempMax = daily.temperature_2m_max[index];
    if (isRainy) return 'Likely wet. Bring an umbrella or rain coat.';
    if (tempMax >= 26) return 'Warm & sunny. Perfect for outdoor fun, remember hydration!';
    if (tempMax < 10) return 'Quite cold. Wrap up warm with layers and scarves.';
    return 'Comfortable weather. Enjoy outdoor strolls and activities.';
  };

  return (
    <div id="weekly-forecast-container" className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Calendar size={18} className="text-indigo-400" />
          7-Day Outlook
        </h3>
        <span className="text-xs text-slate-500 font-mono font-bold tracking-wider">
          CLICK CARD FOR DETAILS
        </span>
      </div>

      {/* Grid of Days */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3">
        {daily.time.map((dateStr, index) => {
          const isSelected = selectedDayIndex === index;
          const condition = getWeatherCondition(daily.weather_code[index]);
          const tempMax = Math.round(daily.temperature_2m_max[index]);
          const tempMin = Math.round(daily.temperature_2m_min[index]);
          const precipProb = daily.precipitation_probability_max[index];

          return (
            <div key={dateStr} className="flex flex-col">
              <motion.button
                layout="position"
                onClick={() => setSelectedDayIndex(isSelected ? null : index)}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex md:flex-col justify-between items-center md:items-center gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-500/10 border-indigo-500/40 shadow-xl shadow-indigo-950/20 ring-1 ring-indigo-500/20'
                    : 'bg-slate-900 border-slate-800/80 text-slate-100 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                {/* Day Header */}
                <div className="text-left md:text-center">
                  <p className="font-bold text-white text-sm md:text-base">
                    {index === 0 ? 'Today' : formatShortDay(dateStr)}
                  </p>
                  <p className="text-[10px] md:text-xs font-semibold text-slate-500 tracking-wide font-mono mt-0.5">
                    {formatMonthDay(dateStr)}
                  </p>
                </div>

                {/* Weather Icon Backdrop Glow */}
                <div className="relative my-1 flex justify-center">
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${condition.bgGradient} opacity-10 blur-md scale-125`} />
                  <div className={`w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-850 ${isSelected ? 'border-indigo-500/30' : ''}`}>
                    <WeatherIcon name={condition.iconName} className={condition.accentColor} size={24} />
                  </div>
                </div>

                {/* Conditions & Temperature Row */}
                <div className="text-right md:text-center">
                  <div className="flex items-center gap-1.5 md:justify-center">
                    <span className="font-bold text-white text-sm md:text-base font-mono">
                      {tempMax}°
                    </span>
                    <span className="text-slate-400 text-xs md:text-sm font-semibold font-mono">
                      {tempMin}°
                    </span>
                  </div>

                  {/* Precipitation Probability pill */}
                  {precipProb > 10 ? (
                    <div className="flex items-center gap-0.5 mt-1 bg-sky-500/10 border border-sky-500/20 rounded-full px-1.5 py-0.5 justify-end md:justify-center w-fit mx-auto">
                      <Droplets size={10} className="text-sky-400" />
                      <span className="text-[9px] font-bold text-sky-400 font-mono">
                        {precipProb}%
                      </span>
                    </div>
                  ) : (
                    <p className="text-[10px] font-semibold text-slate-500 mt-1 md:block hidden">
                      {condition.label}
                    </p>
                  )}
                </div>

                <div className="md:hidden block text-slate-400">
                  {isSelected ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </motion.button>
            </div>
          );
        })}
      </div>

      {/* Expanded Day Details Panel */}
      <AnimatePresence mode="wait">
        {selectedDayIndex !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 mt-2 shadow-inner">
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="text-indigo-400 font-extrabold uppercase tracking-widest text-[10px] font-mono">
                      DAY DETAIL •
                    </span>
                    {formatDayName(daily.time[selectedDayIndex])}, {formatMonthDay(daily.time[selectedDayIndex])}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    Expected conditions: <span className="font-semibold text-slate-200">{getWeatherCondition(daily.weather_code[selectedDayIndex]).description}</span>
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase font-mono tracking-wider">Quick Advice:</span>
                  <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-2.5 py-1">
                    {getDayRecommendation(selectedDayIndex)}
                  </span>
                </div>
              </div>

              {/* Day Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <div className="flex items-center gap-3 bg-slate-900 rounded-xl p-3 border border-slate-800/80">
                  <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                    <Sunrise size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Sunrise</span>
                    <span className="text-sm font-semibold text-white font-mono">{formatTime(daily.sunrise[selectedDayIndex])}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-900 rounded-xl p-3 border border-slate-800/80">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <Sunset size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Sunset</span>
                    <span className="text-sm font-semibold text-white font-mono">{formatTime(daily.sunset[selectedDayIndex])}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-900 rounded-xl p-3 border border-slate-800/80">
                  <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400">
                    <Droplets size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Rain Amount</span>
                    <span className="text-sm font-semibold text-white font-mono">
                      {daily.precipitation_sum[selectedDayIndex]} mm ({daily.precipitation_probability_max[selectedDayIndex]}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-900 rounded-xl p-3 border border-slate-800/80">
                  <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <Wind size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Max Wind</span>
                    <span className="text-sm font-semibold text-white font-mono">{daily.wind_speed_10m_max[selectedDayIndex]} km/h</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
