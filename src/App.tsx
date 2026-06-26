import { useState, useEffect, useCallback } from 'react';
import { CloudSun, MapPin, AlertCircle, RefreshCw, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GeocodingResult, WeatherData } from './types';
import CitySearch from './components/CitySearch';
import CurrentWeatherCard from './components/CurrentWeatherCard';
import WeeklyForecastList from './components/WeeklyForecastList';
import WeatherTrendsChart from './components/WeatherTrendsChart';
import PlanningGuide from './components/PlanningGuide';

const TOKYO_DEFAULT: GeocodingResult = {
  id: 1850147,
  name: 'Tokyo',
  latitude: 35.6895,
  longitude: 139.69171,
  country: 'Japan',
  admin1: 'Tokyo',
  timezone: 'Asia/Tokyo',
};

export default function App() {
  const [selectedCity, setSelectedCity] = useState<GeocodingResult | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load last selected city or fallback to Tokyo
  useEffect(() => {
    try {
      const saved = localStorage.getItem('weather_active_city');
      if (saved) {
        setSelectedCity(JSON.parse(saved));
      } else {
        setSelectedCity(TOKYO_DEFAULT);
      }
    } catch {
      setSelectedCity(TOKYO_DEFAULT);
    }
  }, []);

  const fetchWeather = useCallback(async (city: GeocodingResult) => {
    setLoading(true);
    setError(null);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch forecast from Open-Meteo.');
      }
      const data: WeatherData = await response.json();
      setWeatherData(data);
    } catch (err) {
      console.error('Weather Fetch Error:', err);
      setError('Unable to fetch weather data. Please check your connection or try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch weather whenever selectedCity changes
  useEffect(() => {
    if (selectedCity) {
      fetchWeather(selectedCity);
      // Persist city selection
      try {
        localStorage.setItem('weather_active_city', JSON.stringify(selectedCity));
      } catch (e) {
        console.error('Failed to save active city selection', e);
      }
    }
  }, [selectedCity, fetchWeather]);

  const handleSelectCity = (city: GeocodingResult) => {
    setSelectedCity(city);
  };

  const handleRefresh = () => {
    if (selectedCity) {
      fetchWeather(selectedCity);
    }
  };

  return (
    <div id="weather-intelligence-root" className="min-h-screen bg-[#020617] text-slate-100 font-sans antialiased pb-16 relative overflow-hidden">
      {/* Visual background atmospheric circles */}
      <div className="absolute top-0 left-1/4 w-[30rem] h-[30rem] bg-indigo-500/5 rounded-full blur-[8rem] pointer-events-none z-0" />
      <div className="absolute top-1/3 right-10 w-[30rem] h-[30rem] bg-violet-500/5 rounded-full blur-[8rem] pointer-events-none z-0" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-8 space-y-8">
        
        {/* Navigation & Search Row */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <CloudSun size={24} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-1.5">
                Weather Intelligence
              </h1>
              <p className="text-[10px] text-indigo-400 font-bold font-mono tracking-widest uppercase">
                HEURISTIC METRIC PREDICTOR
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-xl">
            <CitySearch onSelectCity={handleSelectCity} selectedCity={selectedCity} />
          </div>
        </header>

        {/* Global States Boundary */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error-boundary"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-rose-950/20 border border-rose-900/30 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-4 shadow-xl max-w-2xl mx-auto text-slate-200"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-950 text-rose-400 flex items-center justify-center shrink-0 border border-rose-900/25">
                <AlertCircle size={24} />
              </div>
              <div className="space-y-1 text-center md:text-left">
                <h4 className="font-bold text-rose-300 text-base">Retrieval Issue</h4>
                <p className="text-sm text-rose-400 font-medium">{error}</p>
              </div>
              <button
                onClick={handleRefresh}
                className="mt-2 md:mt-0 md:ml-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm cursor-pointer"
              >
                Retry Request
              </button>
            </motion.div>
          )}

          {loading && !weatherData && (
            <motion.div
              key="full-screen-loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 space-y-4"
            >
              <div className="relative">
                <div className="w-14 h-14 border-4 border-slate-900 border-t-indigo-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-indigo-400">
                  <Compass size={18} className="animate-spin duration-[3s]" />
                </div>
              </div>
              <p className="text-slate-500 text-sm font-semibold tracking-wider font-mono uppercase">
                CALCULATING LOCAL FORECAST...
              </p>
            </motion.div>
          )}

          {!loading && weatherData && selectedCity && (
            <motion.div
              key="app-dashboard-layout"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              
              {/* Left Column: Current Metrics & Planner (7 Columns) */}
              <div className="lg:col-span-7 space-y-8">
                
                {/* Current weather metric card */}
                <div className="relative">
                  {loading && (
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm rounded-[2rem] z-30 flex items-center justify-center">
                      <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-md border border-slate-800">
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Updating data...</span>
                      </div>
                    </div>
                  )}
                  <CurrentWeatherCard city={selectedCity} weather={weatherData} />
                </div>

                {/* Smart Heuristic Activities Planner Section */}
                <PlanningGuide weather={weatherData} />

              </div>

              {/* Right Column: Weekly forecasts & Interactive curves (5 Columns) */}
              <div className="lg:col-span-5 space-y-8">
                
                {/* SVG Temperature trend line chart */}
                <WeatherTrendsChart weather={weatherData} />

                {/* 7-day cards list and drawer details */}
                <WeeklyForecastList weather={weatherData} />

              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Credit Line */}
        <footer className="text-center pt-8 border-t border-slate-800/40 max-w-md mx-auto">
          <p className="text-xs text-slate-500 font-semibold flex items-center justify-center gap-1">
            <MapPin size={12} className="text-slate-600" />
            Weather forecast data fueled by the public Open-Meteo API.
          </p>
        </footer>

      </div>
    </div>
  );
}
