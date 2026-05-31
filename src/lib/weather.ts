const FALLBACK_KEY = "29798a7fd1592707e87b9b9a57bde012";
const AMAP_API_BASE = "https://restapi.amap.com/v3";

export interface AdcodeResponse {
  status: string;
  info: string;
  province?: string;
  city?: string;
  adcode?: string;
  rectangle?: string;
}

export interface WeatherLive {
  province: string;
  city: string;
  adcode: string;
  weather: string;
  temperature: string;
  winddirection: string;
  windpower: string;
  humidity: string;
  reporttime: string;
}

export interface WeatherResponse {
  status: string;
  count: string;
  info: string;
  infocode: string;
  lives?: WeatherLive[];
}

function getWeatherKey(): string {
  return import.meta.env.VITE_WEATHER_KEY || FALLBACK_KEY;
}

export async function getAdcode(signal?: AbortSignal): Promise<AdcodeResponse> {
  const res = await fetch(`${AMAP_API_BASE}/ip?key=${getWeatherKey()}`, { signal });
  if (!res.ok) throw new Error(`Amap IP error ${res.status}`);
  return (await res.json()) as AdcodeResponse;
}

export async function getWeather(adcode: string, signal?: AbortSignal): Promise<WeatherResponse> {
  const res = await fetch(`${AMAP_API_BASE}/weather/weatherInfo?key=${getWeatherKey()}&city=${adcode}`, { signal });
  if (!res.ok) throw new Error(`Amap weather error ${res.status}`);
  return (await res.json()) as WeatherResponse;
}

export async function fetchLiveWeather(signal?: AbortSignal): Promise<WeatherLive | null> {
  const adcodeRes = await getAdcode(signal);
  const adcode = adcodeRes.adcode;
  if (!adcode || typeof adcode !== "string") return null;

  const weatherRes = await getWeather(adcode, signal);
  return weatherRes.lives?.[0] ?? null;
}
