import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shirt, Sparkles, Smile, AlertTriangle, Car, Filter } from 'lucide-react';
import { WeatherData, PlanningRecommendation } from '../types';
import { generateRecommendations } from '../utils/weather';

interface PlanningGuideProps {
  weather: WeatherData;
}

type FilterCategory = 'all' | 'clothing' | 'activities' | 'alerts' | 'commute';

export default function PlanningGuide({ weather }: PlanningGuideProps) {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');

  const recommendations = generateRecommendations(weather);

  const filteredRecs = recommendations.filter((rec) => {
    if (activeFilter === 'all') return true;
    return rec.category === activeFilter;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'clothing':
        return <Shirt size={20} />;
      case 'activities':
        return <Smile size={20} />;
      case 'alerts':
        return <AlertTriangle size={20} />;
      case 'commute':
        return <Car size={20} />;
      default:
        return <Sparkles size={20} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'clothing':
        return {
          bg: 'bg-slate-950 border-amber-500/20 hover:border-amber-500/40',
          badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
          iconColor: 'text-amber-400',
        };
      case 'activities':
        return {
          bg: 'bg-slate-950 border-emerald-500/20 hover:border-emerald-500/40',
          badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
          iconColor: 'text-emerald-400',
        };
      case 'alerts':
        return {
          bg: 'bg-slate-950 border-rose-500/20 hover:border-rose-500/40',
          badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
          iconColor: 'text-rose-400',
        };
      case 'commute':
        return {
          bg: 'bg-slate-950 border-blue-500/20 hover:border-blue-500/40',
          badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
          iconColor: 'text-blue-400',
        };
      default:
        return {
          bg: 'bg-slate-950 border-slate-800 hover:border-slate-700',
          badge: 'bg-slate-800 text-slate-300 border border-slate-700/40',
          iconColor: 'text-slate-400',
        };
    }
  };

  const categoriesList: { value: FilterCategory; label: string }[] = [
    { value: 'all', label: 'All Recommendations' },
    { value: 'clothing', label: 'Clothing Advice' },
    { value: 'activities', label: 'Recommended Activities' },
    { value: 'alerts', label: 'Alerts & Safety' },
    { value: 'commute', label: 'Commute & Travel' },
  ];

  return (
    <div id="planning-guide-container" className="bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl p-6 md:p-8">
      {/* Header section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles size={18} className="text-amber-400 fill-amber-400/20 animate-pulse" />
            Smart Planning Recommendations
          </h3>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Heuristic decision guide to optimize your day based on local weather conditions
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 text-slate-400 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80 overflow-x-auto max-w-full">
          <div className="text-slate-500 p-1 block md:hidden">
            <Filter size={14} />
          </div>
          {categoriesList.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveFilter(cat.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === cat.value
                  ? 'bg-slate-850 text-white shadow-sm border border-slate-750'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label.replace('Recommended ', '').replace('Advice', '').replace('Alerts & ', '').replace(' & Travel', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredRecs.map((rec, index) => {
            const styles = getCategoryColor(rec.category);
            return (
              <motion.div
                key={`${rec.category}-${index}`}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`border rounded-2xl p-5 flex gap-4 ${styles.bg} transition-all shadow-sm hover:shadow-md`}
              >
                {/* Left Side Icon Column */}
                <div className={`p-3 bg-slate-900 rounded-xl h-fit border border-slate-800 ${styles.iconColor}`}>
                  {getCategoryIcon(rec.category)}
                </div>

                {/* Content Side */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-white text-sm md:text-base tracking-tight">
                      {rec.title}
                    </h4>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase font-mono tracking-wider border ${styles.badge}`}>
                      {rec.category}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
                    {rec.text}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredRecs.length === 0 && (
          <div className="col-span-full text-center py-12 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
            <Smile size={32} className="text-slate-600 mx-auto mb-2" />
            <p className="font-bold text-slate-400 text-sm">No items in this category</p>
            <p className="text-xs text-slate-500 mt-1">Try switching to "All" to review general advice</p>
          </div>
        )}
      </div>
    </div>
  );
}
