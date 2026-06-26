import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, History, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GeocodingResult } from '../types';

interface CitySearchProps {
  onSelectCity: (city: GeocodingResult) => void;
  selectedCity: GeocodingResult | null;
}

const PRESET_CITIES: GeocodingResult[] = [
  { id: 5128581, name: 'New York', latitude: 40.71427, longitude: -74.00597, country: 'United States', admin1: 'New York', timezone: 'America/New_York' },
  { id: 2643743, name: 'London', latitude: 51.50853, longitude: -0.12574, country: 'United Kingdom', admin1: 'England', timezone: 'Europe/London' },
  { id: 1850147, name: 'Tokyo', latitude: 35.6895, longitude: 139.69171, country: 'Japan', admin1: 'Tokyo', timezone: 'Asia/Tokyo' },
  { id: 2988507, name: 'Paris', latitude: 48.85341, longitude: 2.3488, country: 'France', admin1: 'Île-de-France', timezone: 'Europe/Paris' },
  { id: 2158177, name: 'Melbourne', latitude: -37.814, longitude: 144.96332, country: 'Australia', admin1: 'Victoria', timezone: 'Australia/Melbourne' },
];

export default function CitySearch({ onSelectCity, selectedCity }: CitySearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<GeocodingResult[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('weather_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load recent searches', e);
    }
  }, []);

  // Save recent search
  const saveRecentSearch = (city: GeocodingResult) => {
    try {
      const filtered = recentSearches.filter((item) => item.id !== city.id);
      const updated = [city, ...filtered].slice(0, 5); // Keep last 5
      setRecentSearches(updated);
      localStorage.setItem('weather_recent_searches', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save recent search', e);
    }
  };

  const removeRecentSearch = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      const updated = recentSearches.filter((item) => item.id !== id);
      setRecentSearches(updated);
      localStorage.setItem('weather_recent_searches', JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to remove recent search', err);
    }
  };

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setError(null);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            query
          )}&count=6&language=en&format=json`
        );
        if (!response.ok) {
          throw new Error('Geocoding API network issue');
        }
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          setSuggestions(data.results);
        } else {
          setSuggestions([]);
          setError('No cities found matching that name');
        }
      } catch (err) {
        console.error('Geocoding search error:', err);
        setError('Error fetching locations. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSelect = (city: GeocodingResult) => {
    onSelectCity(city);
    saveRecentSearch(city);
    setQuery('');
    setSuggestions([]);
    setIsFocused(false);
  };

  return (
    <div id="city-search-container" ref={containerRef} className="relative w-full max-w-xl mx-auto z-50">
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          id="city-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search for a city (e.g. Kyoto, Vancouver, Madrid...)"
          className="w-full pl-11 pr-10 py-3.5 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm md:text-base font-medium transition-all placeholder-slate-500"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setSuggestions([]);
            }}
            className="absolute inset-y-0 right-3 flex items-center pr-1 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl shadow-slate-950/80 overflow-hidden z-50 divide-y divide-slate-800"
          >
            {/* Loading Indicator */}
            {loading && (
              <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
                Searching for locations...
              </div>
            )}

            {/* Suggestions list */}
            {query.trim().length >= 2 && suggestions.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-1.5 text-xs font-semibold text-slate-500 tracking-wider flex items-center gap-1">
                  <Sparkles size={12} className="text-indigo-400" /> SEARCH RESULTS
                </div>
                {suggestions.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleSelect(city)}
                    className="w-full px-4 py-3 text-left hover:bg-slate-800 flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-start gap-2.5">
                      <MapPin size={16} className="text-indigo-500 mt-0.5 group-hover:scale-110 transition-transform" />
                      <div>
                        <p className="font-semibold text-slate-100 text-sm group-hover:text-indigo-400 transition-colors">
                          {city.name}
                        </p>
                        <p className="text-xs text-slate-400 font-medium">
                          {city.admin1 ? `${city.admin1}, ` : ''}
                          {city.country}
                        </p>
                      </div>
                    </div>
                    {city.country_code && (
                      <span className="text-xs font-bold text-slate-400 bg-slate-800 rounded-md px-1.5 py-0.5 uppercase tracking-wider scale-90">
                        {city.country_code}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Error Message */}
            {error && !loading && (
              <div className="p-4 text-center text-sm text-rose-400 font-medium">
                {error}
              </div>
            )}

            {/* Recent Searches */}
            {query.trim().length < 2 && recentSearches.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-1.5 text-xs font-semibold text-slate-500 tracking-wider flex items-center gap-1.5">
                  <History size={12} /> RECENT SEARCHES
                </div>
                {recentSearches.map((city) => (
                  <div
                    key={city.id}
                    onClick={() => onSelectCity(city)}
                    className="w-full px-4 py-2.5 text-left hover:bg-slate-800 flex items-center justify-between cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin size={15} className="text-slate-400 group-hover:text-indigo-400 transition-colors" />
                      <div>
                        <span className="font-medium text-slate-200 text-sm group-hover:text-slate-100 transition-colors">
                          {city.name}
                        </span>
                        <span className="text-xs text-slate-400 ml-2">
                          {city.country}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => removeRecentSearch(e, city.id)}
                      className="text-slate-500 hover:text-slate-300 p-1 rounded-full hover:bg-slate-800 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Favorites (Presets) */}
            {query.trim().length < 2 && (
              <div className="py-2 bg-slate-900/50">
                <div className="px-4 py-1.5 text-xs font-semibold text-slate-500 tracking-wider">
                  POPULAR CITIES
                </div>
                <div className="px-3 pb-2 pt-1 flex flex-wrap gap-2">
                  {PRESET_CITIES.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => handleSelect(city)}
                      className="px-3 py-1.5 bg-slate-800 border border-slate-700/60 hover:border-indigo-500/60 hover:bg-indigo-500/10 text-slate-300 hover:text-indigo-400 rounded-xl text-xs font-medium transition-all shadow-sm"
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
