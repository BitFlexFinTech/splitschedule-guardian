import { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Snowflake, Wind, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface WeatherData {
  temperature: number;
  weatherCode: number;
  description: string;
}

const getWeatherIcon = (code: number) => {
  if (code === 0) return <Sun className="w-8 h-8 text-amber" strokeWidth={1.5} />;
  if (code >= 1 && code <= 3) return <Cloud className="w-8 h-8 text-info" strokeWidth={1.5} />;
  if (code >= 45 && code <= 48) return <Cloud className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />;
  if (code >= 51 && code <= 67) return <CloudRain className="w-8 h-8 text-info" strokeWidth={1.5} />;
  if (code >= 71 && code <= 77) return <Snowflake className="w-8 h-8 text-cyan" strokeWidth={1.5} />;
  if (code >= 80 && code <= 82) return <CloudRain className="w-8 h-8 text-info" strokeWidth={1.5} />;
  if (code >= 95) return <Wind className="w-8 h-8 text-purple" strokeWidth={1.5} />;
  return <Sun className="w-8 h-8 text-amber" strokeWidth={1.5} />;
};

const getWeatherDescription = (code: number): string => {
  if (code === 0) return 'Clear sky';
  if (code >= 1 && code <= 3) return 'Partly cloudy';
  if (code >= 45 && code <= 48) return 'Foggy';
  if (code >= 51 && code <= 55) return 'Light drizzle';
  if (code >= 56 && code <= 57) return 'Freezing drizzle';
  if (code >= 61 && code <= 65) return 'Rainy';
  if (code >= 66 && code <= 67) return 'Freezing rain';
  if (code >= 71 && code <= 75) return 'Snowy';
  if (code === 77) return 'Snow grains';
  if (code >= 80 && code <= 82) return 'Rain showers';
  if (code >= 85 && code <= 86) return 'Snow showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Unknown';
};

export const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
        );
        
        if (!response.ok) throw new Error('Failed to fetch weather');
        
        const data = await response.json();
        
        setWeather({
          temperature: Math.round(data.current.temperature_2m),
          weatherCode: data.current.weather_code,
          description: getWeatherDescription(data.current.weather_code),
        });
      } catch (err) {
        setError('Unable to load weather');
      } finally {
        setLoading(false);
      }
    };

    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // Default to New York if geolocation fails
          fetchWeather(40.7128, -74.006);
        }
      );
    } else {
      fetchWeather(40.7128, -74.006);
    }
  }, []);

  if (loading) {
    return (
      <Card className="border border-border/50">
        <CardContent className="p-4 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !weather) {
    return null;
  }

  return (
    <Card className="border border-border/50 bg-gradient-to-br from-info/5 to-cyan/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {getWeatherIcon(weather.weatherCode)}
          <div>
            <p className="text-2xl font-light text-foreground">
              {weather.temperature}°F
            </p>
            <p className="text-sm text-muted-foreground">{weather.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
