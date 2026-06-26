import { motion } from 'motion/react';
import { Thermometer, Droplets, Wind, Sunrise, Sunset, Clock, Navigation } from 'lucide-react';
import { GeocodingResult, WeatherData } from '../types';
import { getWeatherCondition } from '../utils/weather';
import WeatherIcon from './WeatherIcon';

interface CurrentWeatherCardProps {
  city: GeocodingResult;
  weather: WeatherData;
}

export default function CurrentWeatherCard({ city, weather }: CurrentWeatherCardProps) {
  const current = weather.current;
  const condition = getWeatherCondition(current.weather_code, current.is_day);

  // Format local current time
  const formatLocalTime = () => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: weather.timezone,
        hour12: true,
      };
      return new Date().toLocaleTimeString('en-US', options);
    } catch {
      // Fallback
      return current.time.split('T')[1] || '';
    }
  };

  // Format local sunset/sunrise
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

  const getWindDirection = (speed: number) => {
    if (speed < 5) return 'Calm';
    if (speed < 15) return 'Gentle Breeze';
    if (speed < 25) return 'Moderate Wind';
    return 'Strong Wind';
  };

  return (
    <motion.div
      id="current-weather-card"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-br from-indigo-600 to-violet-700 text-slate-100 rounded-[2rem] shadow-2xl shadow-indigo-500/10 relative overflow-hidden"
    >
      {/* Decorative top blur glow */}
      <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-white/10 blur-3xl rounded-full pointer-events-none" />

      <div className="p-6 md:p-8">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-1.5 text-indigo-100/80 mb-1">
              <Clock size={14} />
              <span className="text-[10px] font-bold font-mono tracking-widest uppercase">
                CURRENT WEATHER • {formatLocalTime()}
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
              {city.name}
              {city.country_code && (
                <span className="text-xs font-bold bg-white/10 text-indigo-100 rounded-md px-1.5 py-0.5 border border-white/5">
                  {city.country_code}
                </span>
              )}
            </h2>
            <p className="text-indigo-200/90 text-sm font-medium mt-0.5">
              {city.admin1 ? `${city.admin1}, ` : ''}{city.country}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <div className="text-right">
              <span className="text-[10px] font-bold text-indigo-200 block tracking-wider uppercase">
                COORDINATES
              </span>
              <span className="text-xs font-mono font-medium text-white">
                {city.latitude.toFixed(4)}°N, {city.longitude.toFixed(4)}°E
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center">
              <Navigation size={14} className="rotate-45" />
            </div>
          </div>
        </div>

        {/* Main Temperature and Icon Block */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-6 md:py-8 items-center border-b border-white/10">
          {/* Main Temp display (Left) */}
          <div className="md:col-span-7 flex items-center gap-5">
            {/* Dynamic visual bubble for the weather icon */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full bg-white/20 blur-xl scale-125 pointer-events-none" />
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white shadow-lg">
                <WeatherIcon name={condition.iconName} size={44} className="text-white drop-shadow-md animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex items-start">
                <span className="text-6xl md:text-7xl font-extrabold text-white tracking-tighter">
                  {Math.round(current.temperature_2m)}°
                </span>
              </div>
              <div className="mt-0.5">
                <span className="font-bold text-lg text-white block">
                  {condition.label}
                </span>
                <span className="text-indigo-100 text-xs font-medium block">
                  {condition.description} • Feels like {Math.round(current.apparent_temperature)}°C
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics display (Right) */}
          <div className="md:col-span-5 bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col justify-center divide-y divide-white/10 text-white">
            <div className="pb-2.5 flex justify-between items-center text-xs md:text-sm">
              <span className="text-indigo-200 font-semibold flex items-center gap-2">
                <Thermometer size={14} /> Feels Like
              </span>
              <span className="font-bold font-mono">
                {Math.round(current.apparent_temperature)}°C
              </span>
            </div>
            <div className="py-2.5 flex justify-between items-center text-xs md:text-sm">
              <span className="text-indigo-200 font-semibold flex items-center gap-2">
                <Droplets size={14} /> Humidity
              </span>
              <span className="font-bold font-mono">
                {current.relative_humidity_2m}%
              </span>
            </div>
            <div className="pt-2.5 flex justify-between items-center text-xs md:text-sm">
              <span className="text-indigo-200 font-semibold flex items-center gap-2">
                <Wind size={14} /> Wind Speed
              </span>
              <span className="font-bold font-mono">
                {current.wind_speed_10m} km/h
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6">
          <div className="bg-white/5 rounded-2xl p-3 md:p-4 border border-white/10 text-center">
            <Sunrise size={18} className="text-amber-300 mx-auto mb-1.5" />
            <span className="text-[10px] text-indigo-200 block font-bold uppercase tracking-widest">
              Sunrise
            </span>
            <span className="text-xs md:text-sm font-bold text-white font-mono mt-0.5 block">
              {formatTime(weather.daily.sunrise[0])}
            </span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 md:p-4 border border-white/10 text-center">
            <Sunset size={18} className="text-indigo-300 mx-auto mb-1.5" />
            <span className="text-[10px] text-indigo-200 block font-bold uppercase tracking-widest">
              Sunset
            </span>
            <span className="text-xs md:text-sm font-bold text-white font-mono mt-0.5 block">
              {formatTime(weather.daily.sunset[0])}
            </span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 md:p-4 border border-white/10 text-center">
            <Droplets size={18} className="text-sky-300 mx-auto mb-1.5" />
            <span className="text-[10px] text-indigo-200 block font-bold uppercase tracking-widest">
              Rain Amount
            </span>
            <span className="text-xs md:text-sm font-bold text-white font-mono mt-0.5 block">
              {current.precipitation} mm
            </span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 md:p-4 border border-white/10 text-center">
            <Wind size={18} className="text-teal-300 mx-auto mb-1.5" />
            <span className="text-[10px] text-indigo-200 block font-bold uppercase tracking-widest">
              Wind Force
            </span>
            <span className="text-xs md:text-sm font-bold text-white mt-0.5 block truncate">
              {getWindDirection(current.wind_speed_10m)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
