import * as Icons from 'lucide-react';

interface WeatherIconProps {
  name: string;
  className?: string;
  size?: number;
}

export default function WeatherIcon({ name, className = '', size = 24 }: WeatherIconProps) {
  // Fallback to HelpCircle if icon is not found
  const IconComponent = (Icons as any)[name] || Icons.HelpCircle;
  return <IconComponent className={className} size={size} />;
}
