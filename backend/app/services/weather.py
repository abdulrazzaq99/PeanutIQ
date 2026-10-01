"""Real forecasts from Open-Meteo (free, no key) for the farm's district."""
import time

import httpx

FORECAST_URL = "https://api.open-meteo.com/v1/forecast"

# The app's farm regions (website FARM_REGIONS) -> coordinates.
REGIONS = {
    "attock": (33.77, 72.36),
    "chakwal": (32.93, 72.86),
    "rawalpindi": (33.60, 73.04),
    "talagang": (32.93, 72.42),
}
DEFAULT = REGIONS["chakwal"]
CACHE_SECONDS = 30 * 60
_cache: dict[tuple[float, float], tuple[float, dict]] = {}


def coordinates(farm_location: str | None) -> tuple[float, float]:
    place = (farm_location or "").split(",")[0].strip().lower()
    return REGIONS.get(place, DEFAULT)


def condition(code: int, wind_kmh: float = 0) -> str:
    """WMO weather code -> the app's condition keys."""
    if code in (95, 96, 99):
        return "thunderstorm"
    if 61 <= code <= 67 or 80 <= code <= 82:
        return "rain"
    if 51 <= code <= 57:
        return "drizzle"
    if 71 <= code <= 77 or code in (85, 86):
        return "snow"
    if code in (45, 48):
        return "fog"
    if code == 3:
        return "cloudy"
    if wind_kmh >= 30:
        return "breezy"
    return "partlyCloudy" if code in (1, 2) else "sunny"


def forecast(farm_location: str | None, client: httpx.Client | None = None) -> dict:
    lat, lon = coordinates(farm_location)
    cached = _cache.get((lat, lon))
    if cached and time.monotonic() - cached[0] < CACHE_SECONDS:
        return cached[1]
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,weather_code,wind_speed_10m",
        "daily": "weather_code,temperature_2m_max,temperature_2m_min,wind_speed_10m_max",
        "timezone": "Asia/Karachi",
        "forecast_days": 3,
    }
    http = client or httpx.Client(timeout=10)
    try:
        res = http.get(FORECAST_URL, params=params)
        res.raise_for_status()
        data = res.json()
    finally:
        if client is None:
            http.close()
    current, daily = data["current"], data["daily"]
    result = {
        "current": {
            "temp_c": round(current["temperature_2m"]),
            "condition": condition(current["weather_code"], current.get("wind_speed_10m") or 0),
        },
        "days": [
            {
                "date": daily["time"][i],
                "max_c": round(daily["temperature_2m_max"][i]),
                "min_c": round(daily["temperature_2m_min"][i]),
                "condition": condition(daily["weather_code"][i], daily["wind_speed_10m_max"][i] or 0),
            }
            for i in range(len(daily["time"]))
        ],
    }
    _cache[(lat, lon)] = (time.monotonic(), result)
    return result
