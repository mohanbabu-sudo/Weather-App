import { WeatherConditionInfo, WeatherData, PlanningRecommendation } from '../types';

export function getWeatherCondition(code: number, isDay: number = 1): WeatherConditionInfo {
  switch (code) {
    case 0:
      return {
        label: isDay ? 'Sunny' : 'Clear',
        iconName: isDay ? 'Sun' : 'Moon',
        description: isDay ? 'Clear, bright, and sunny' : 'Clear, starry night',
        bgGradient: isDay 
          ? 'from-amber-400 via-orange-400 to-amber-500' 
          : 'from-slate-900 via-indigo-950 to-slate-950',
        accentColor: isDay ? 'text-amber-500 border-amber-200' : 'text-indigo-400 border-indigo-900',
        themeColor: isDay ? 'bg-amber-50/50' : 'bg-indigo-950/20',
      };
    case 1:
    case 2:
      return {
        label: 'Partly Cloudy',
        iconName: isDay ? 'CloudSun' : 'CloudMoon',
        description: 'Mostly clear with some passing clouds',
        bgGradient: isDay
          ? 'from-sky-400 via-blue-400 to-slate-300'
          : 'from-slate-800 via-indigo-900 to-slate-900',
        accentColor: isDay ? 'text-sky-600 border-sky-100' : 'text-slate-400 border-slate-800',
        themeColor: isDay ? 'bg-sky-50/50' : 'bg-slate-900/40',
      };
    case 3:
      return {
        label: 'Overcast',
        iconName: 'Cloud',
        description: 'Thick cover of clouds, dull skies',
        bgGradient: 'from-slate-400 via-zinc-400 to-stone-400',
        accentColor: 'text-zinc-600 border-zinc-200',
        themeColor: 'bg-zinc-50/50',
      };
    case 45:
    case 48:
      return {
        label: 'Foggy',
        iconName: 'CloudFog',
        description: 'Dense fog limiting visibility',
        bgGradient: 'from-zinc-300 via-stone-300 to-slate-200',
        accentColor: 'text-stone-500 border-stone-200',
        themeColor: 'bg-stone-50/50',
      };
    case 51:
    case 53:
    case 55:
      return {
        label: 'Drizzle',
        iconName: 'CloudDrizzle',
        description: 'Light but persistent misty drizzle rain',
        bgGradient: 'from-teal-400 via-cyan-500 to-blue-400',
        accentColor: 'text-teal-600 border-teal-100',
        themeColor: 'bg-teal-50/50',
      };
    case 56:
    case 57:
      return {
        label: 'Freezing Drizzle',
        iconName: 'CloudSnow',
        description: 'Chilling, freezing ice-drizzle',
        bgGradient: 'from-cyan-300 via-blue-400 to-indigo-400',
        accentColor: 'text-cyan-600 border-cyan-100',
        themeColor: 'bg-cyan-50/50',
      };
    case 61:
    case 63:
    case 65:
      return {
        label: 'Rain',
        iconName: 'CloudRain',
        description: code === 61 ? 'Light rain showers' : code === 63 ? 'Moderate rain' : 'Heavy downpour',
        bgGradient: 'from-blue-500 via-indigo-500 to-slate-600',
        accentColor: 'text-blue-600 border-blue-200',
        themeColor: 'bg-blue-50/50',
      };
    case 66:
    case 67:
      return {
        label: 'Freezing Rain',
        iconName: 'CloudSnow',
        description: 'Freezing cold rain turning to ice',
        bgGradient: 'from-indigo-400 via-sky-500 to-blue-600',
        accentColor: 'text-indigo-600 border-indigo-200',
        themeColor: 'bg-indigo-50/50',
      };
    case 71:
    case 73:
    case 75:
      return {
        label: 'Snowing',
        iconName: 'Snowflake',
        description: code === 71 ? 'Light snow flurries' : code === 73 ? 'Moderate snow' : 'Heavy snowfall',
        bgGradient: 'from-sky-300 via-indigo-100 to-slate-200',
        accentColor: 'text-sky-500 border-sky-200',
        themeColor: 'bg-sky-50/50',
      };
    case 77:
      return {
        label: 'Snow Grains',
        iconName: 'Snowflake',
        description: 'Small, frozen white grains of snow',
        bgGradient: 'from-slate-300 via-slate-100 to-sky-100',
        accentColor: 'text-slate-500 border-slate-200',
        themeColor: 'bg-slate-50/50',
      };
    case 80:
    case 81:
    case 82:
      return {
        label: 'Rain Showers',
        iconName: 'CloudRainWind',
        description: 'Sudden, heavy rainfall showers',
        bgGradient: 'from-sky-500 via-blue-600 to-indigo-600',
        accentColor: 'text-blue-500 border-blue-300',
        themeColor: 'bg-blue-50/50',
      };
    case 85:
    case 86:
      return {
        label: 'Snow Showers',
        iconName: 'CloudSnow',
        description: 'Passing heavy snow showers',
        bgGradient: 'from-cyan-400 via-slate-200 to-sky-300',
        accentColor: 'text-sky-600 border-sky-300',
        themeColor: 'bg-sky-50/50',
      };
    case 95:
    case 96:
    case 99:
      return {
        label: 'Thunderstorm',
        iconName: 'CloudLightning',
        description: 'Thunderstorms, lighting, and heavy rainfall',
        bgGradient: 'from-indigo-900 via-slate-800 to-purple-950',
        accentColor: 'text-purple-400 border-purple-900',
        themeColor: 'bg-purple-950/20',
      };
    default:
      return {
        label: 'Unknown',
        iconName: 'HelpCircle',
        description: 'Conditions are shifting',
        bgGradient: 'from-slate-400 to-slate-500',
        accentColor: 'text-slate-600 border-slate-200',
        themeColor: 'bg-slate-50/50',
      };
  }
}

export function generateRecommendations(data: WeatherData): PlanningRecommendation[] {
  const recommendations: PlanningRecommendation[] = [];
  const current = data.current;
  const temp = current.temperature_2m;
  const isRainy = current.precipitation > 0 || current.rain > 0 || current.showers > 0;
  const isSnowy = current.snowfall > 0;
  const windSpeed = current.wind_speed_10m;
  const humidity = current.relative_humidity_2m;

  // 1. Clothing recommendations
  if (temp >= 28) {
    recommendations.push({
      type: 'warning',
      category: 'clothing',
      title: 'Beat the Heat',
      text: 'Wear light, loose-fitting, breathable clothes (cotton/linen). Bring sunglasses, a wide-brim hat, and apply SPF 30+ sunscreen.',
    });
  } else if (temp >= 18) {
    recommendations.push({
      type: 'success',
      category: 'clothing',
      title: 'Comfortable Attire',
      text: 'Perfect short-sleeved weather. A t-shirt, shorts, or light dress is ideal for today.',
    });
  } else if (temp >= 10) {
    recommendations.push({
      type: 'info',
      category: 'clothing',
      title: 'Layer Up Lightly',
      text: 'Slightly cool out. A light jacket, cardigan, or sweater over a shirt is recommended.',
    });
  } else {
    recommendations.push({
      type: 'danger',
      category: 'clothing',
      title: 'Bundle Up Cozy',
      text: 'Chilly temperatures! Put on a heavy winter coat, thermal layers, and perhaps gloves and a warm hat if staying outside.',
    });
  }

  // 2. Activity recommendations
  if (isRainy) {
    recommendations.push({
      type: 'warning',
      category: 'activities',
      title: 'Indoor Retreat',
      text: 'Rain is coming down. Ideal day for indoor museum visits, reading at a local cafe, board games, or movie marathons.',
    });
  } else if (isSnowy) {
    recommendations.push({
      type: 'info',
      category: 'activities',
      title: 'Winter Wonderland',
      text: 'Snow on the ground! Great day for building a snowman, sledding, or enjoying a warm mug of cocoa indoors.',
    });
  } else if (temp >= 18 && temp <= 26) {
    recommendations.push({
      type: 'success',
      category: 'activities',
      title: 'Perfect Outdoor Day',
      text: 'The weather is absolutely perfect for a picnic, a hike, a bike ride, or spending time in the botanical gardens.',
    });
  } else if (temp > 32) {
    recommendations.push({
      type: 'danger',
      category: 'activities',
      title: 'Avoid Peak Sun',
      text: 'Extremely hot. Limit strenuous outdoor activities between 11 AM and 4 PM. If outdoors, swim or find deep shade.',
    });
  } else {
    recommendations.push({
      type: 'info',
      category: 'activities',
      title: 'Brisk Walk Weather',
      text: 'Dry and cool. Great conditions for a fast-paced walk, jogging, or running errands without sweating.',
    });
  }

  // 3. Alerts (based on extreme weather values)
  if (windSpeed >= 25) {
    recommendations.push({
      type: 'danger',
      category: 'alerts',
      title: 'High Wind Warning',
      text: `Gusts are hitting up to ${windSpeed} km/h. Secure loose outdoor patio items, and expect some resistance when walking or cycling.`,
    });
  }

  if (humidity >= 85 && temp >= 27) {
    recommendations.push({
      type: 'warning',
      category: 'alerts',
      title: 'High Humidity Mugginess',
      text: 'The humidity is very high, making the air feel warmer and heavy. Stay hydrated and don\'t over-exert yourself.',
    });
  }

  if (current.weather_code >= 95) {
    recommendations.push({
      type: 'danger',
      category: 'alerts',
      title: 'Active Thunderstorms',
      text: 'Lightning and thunder in the area. Stay indoors, disconnect sensitive electronics, and keep away from windows.',
    });
  }

  // 4. Commute / Planning
  if (isRainy || current.weather_code >= 51) {
    recommendations.push({
      type: 'warning',
      category: 'commute',
      title: 'Slippery Commute',
      text: 'Rain will make roadways slick. Bring an umbrella, drive at a safe distance, and allocate an extra 10 minutes for travel.',
    });
  } else if (isSnowy) {
    recommendations.push({
      type: 'danger',
      category: 'commute',
      title: 'Icy Roads Warning',
      text: 'Snow/ice leads to hazardous driving. Walk carefully on sidewalks, check highway traffic, and rely on winter tires.',
    });
  } else {
    recommendations.push({
      type: 'success',
      category: 'commute',
      title: 'Smooth Travel',
      text: 'Clear, dry roads and excellent visibility. Excellent day for walking, bicycling, or using open-air public transit.',
    });
  }

  return recommendations;
}

export function formatDayName(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
}

export function formatShortDay(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
}

export function formatMonthDay(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}
