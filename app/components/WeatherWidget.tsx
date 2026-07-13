"use client";

import { useEffect, useState } from "react";

type WeatherData = {
  temp: number;
  code: number;
};

function weatherIcon(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 2) return "🌤️";
  if (code <= 3) return "☁️";
  if (code <= 48) return "🌫️";
  if (code <= 67) return "🌧️";
  if (code <= 77) return "🌨️";
  if (code <= 82) return "🌦️";
  if (code <= 99) return "⛈️";
  return "🌡️";
}

// Gopalganj, Bangladesh approximate coordinates
const LAT = 23.0;
const LON = 89.8;

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true`,
      { signal: controller.signal },
    )
      .then((r) => r.json())
      .then((data) => {
        if (data?.current_weather) {
          setWeather({
            temp: Math.round(data.current_weather.temperature),
            code: data.current_weather.weathercode,
          });
        }
      })
      .catch(() => {/* silently ignore network/timeout errors */});

    return () => controller.abort();
  }, []);

  if (!weather) {
    return (
      <div className="flex flex-col items-center leading-none select-none">
        <span className="text-xl text-white opacity-50">--°C</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center leading-none select-none">
      <span className="text-2xl leading-none">{weatherIcon(weather.code)}</span>
      <span className="mt-0.5 text-sm font-bold text-white">{weather.temp}°C</span>
    </div>
  );
}
