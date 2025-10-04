/**
 * API Configuration
 * Store your API keys and configuration here
 */

export const API_CONFIG = {
  // OpenWeatherMap API Key
  // Get your free API key from: https://openweathermap.org/api
  OPENWEATHER_API_KEY: 'your_openweather_api_key_here',
  
  // NASA Earthdata Login (for MODIS and SMAP data)
  // Create account at: https://urs.earthdata.nasa.gov/
  NASA_USERNAME: 'your_nasa_username',
  NASA_PASSWORD: 'your_nasa_password',
  
  // AppEEARS API Token (optional, for direct API access)
  APPEARS_TOKEN: 'your_appears_token',
  
  // API Endpoints
  ENDPOINTS: {
    NASA_POWER: 'https://power.larc.nasa.gov/api/temporal/daily/point',
    OPENWEATHER_CURRENT: 'https://api.openweathermap.org/data/2.5/weather',
    OPENWEATHER_FORECAST: 'https://api.openweathermap.org/data/2.5/forecast',
    APPEARS_API: 'https://appeears.earthdatacloud.nasa.gov/api',
    EARTHDATA_LOGIN: 'https://urs.earthdata.nasa.gov/oauth/authorize'
  }
};

// Instructions for setting up API keys:
export const SETUP_INSTRUCTIONS = {
  OPENWEATHER: {
    url: 'https://openweathermap.org/api',
    steps: [
      '1. Create a free account at OpenWeatherMap',
      '2. Go to API Keys section',
      '3. Copy your API key',
      '4. Replace "your_openweather_api_key_here" in this file'
    ]
  },
  NASA_EARTHDATA: {
    url: 'https://urs.earthdata.nasa.gov/',
    steps: [
      '1. Create a free NASA Earthdata account',
      '2. Enable access to MODIS and SMAP datasets',
      '3. Update username and password in this file'
    ]
  }
};
