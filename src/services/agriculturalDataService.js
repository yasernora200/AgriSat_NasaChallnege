/**
 * Agricultural Data Service
 * Integrates with NASA APIs and OpenWeatherMap for agricultural data
 */

import { API_CONFIG } from '../config/apiConfig';

/**
 * Fetch NDVI data from MODIS MOD13Q1
 * Note: This requires AppEEARS API or Google Earth Engine integration
 */
export async function fetchNDVIData(lat, lon, startDate, endDate) {
  try {
    // Placeholder implementation - real implementation would use AppEEARS API
    console.log('Fetching NDVI data for:', { lat, lon, startDate, endDate });
    
    // Mock data for demonstration
    const mockNDVI = generateMockNDVI(startDate, endDate);
    
    return {
      source: 'MODIS MOD13Q1',
      location: { lat, lon },
      data: mockNDVI,
      status: 'success'
    };
  } catch (error) {
    console.error('Error fetching NDVI data:', error);
    return {
      source: 'MODIS MOD13Q1',
      location: { lat, lon },
      data: [],
      status: 'error',
      error: error.message
    };
  }
}

/**
 * Fetch Soil Moisture data from SMAP SPL4SMGP
 * Note: This requires AppEEARS API or Google Earth Engine integration
 */
export async function fetchSoilMoistureData(lat, lon, startDate, endDate) {
  try {
    console.log('Fetching Soil Moisture data for:', { lat, lon, startDate, endDate });
    
    // Mock data for demonstration
    const mockSoilMoisture = generateMockSoilMoisture(startDate, endDate);
    
    return {
      source: 'SMAP SPL4SMGP',
      location: { lat, lon },
      data: mockSoilMoisture,
      status: 'success'
    };
  } catch (error) {
    console.error('Error fetching Soil Moisture data:', error);
    return {
      source: 'SMAP SPL4SMGP',
      location: { lat, lon },
      data: [],
      status: 'error',
      error: error.message
    };
  }
}

/**
 * Fetch historical weather data from NASA POWER API
 */
export async function fetchHistoricalWeather(lat, lon, startDate, endDate) {
  try {
    const params = new URLSearchParams({
      parameters: 'T2M,PRECTOT,ALLSKY_SFC_SW_DWN',
      community: 'AG',
      longitude: lon,
      latitude: lat,
      start: startDate,
      end: endDate,
      format: 'JSON'
    });

    const response = await fetch(`${API_CONFIG.ENDPOINTS.NASA_POWER}?${params}`);
    
    if (!response.ok) {
      throw new Error(`NASA POWER API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data to our format
    const transformedData = transformPOWERData(data);
    
    return {
      source: 'NASA POWER',
      location: { lat, lon },
      data: transformedData,
      status: 'success'
    };
  } catch (error) {
    console.error('Error fetching historical weather:', error);
    return {
      source: 'NASA POWER',
      location: { lat, lon },
      data: [],
      status: 'error',
      error: error.message
    };
  }
}

/**
 * Fetch weather forecast from OpenWeatherMap API
 */
export async function fetchWeatherForecast(lat, lon) {
  try {
    const response = await fetch(
      `${API_CONFIG.ENDPOINTS.OPENWEATHER_FORECAST}?lat=${lat}&lon=${lon}&appid=${API_CONFIG.OPENWEATHER_API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error(`OpenWeatherMap API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform forecast data
    const transformedData = transformForecastData(data);
    
    return {
      source: 'OpenWeatherMap',
      location: { lat, lon },
      data: transformedData,
      status: 'success'
    };
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    return {
      source: 'OpenWeatherMap',
      location: { lat, lon },
      data: [],
      status: 'error',
      error: error.message
    };
  }
}

/**
 * Main function to fetch all agricultural data for a location
 */
export async function fetchAllAgriculturalData(lat, lon) {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 60 days ago

  try {
    const [ndviData, soilMoistureData, historicalWeather, weatherForecast] = await Promise.all([
      fetchNDVIData(lat, lon, startDate, endDate),
      fetchSoilMoistureData(lat, lon, startDate, endDate),
      fetchHistoricalWeather(lat, lon, startDate, endDate),
      fetchWeatherForecast(lat, lon)
    ]);

    return {
      location: { lat, lon },
      timestamp: new Date().toISOString(),
      ndvi: ndviData,
      soil_moisture: soilMoistureData,
      weather_historical: historicalWeather,
      weather_forecast: weatherForecast
    };
  } catch (error) {
    console.error('Error fetching all agricultural data:', error);
    throw error;
  }
}

// Helper functions for data transformation
function transformPOWERData(data) {
  if (!data.properties || !data.properties.parameter) {
    return [];
  }

  const parameters = data.properties.parameter;
  const dates = Object.keys(parameters.T2M || {});
  
  return dates.map(date => ({
    date,
    temperature: parameters.T2M[date] || null,
    precipitation: parameters.PRECTOT[date] || null,
    solar_radiation: parameters.ALLSKY_SFC_SW_DWN[date] || null
  }));
}

function transformForecastData(data) {
  if (!data.list) return [];

  // Group by date and get daily min/max
  const dailyData = {};
  
  data.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!dailyData[date]) {
      dailyData[date] = {
        date,
        temperatures: [],
        precipitation: [],
        conditions: []
      };
    }
    
    dailyData[date].temperatures.push(item.main.temp);
    dailyData[date].precipitation.push(item.rain?.['3h'] || 0);
    dailyData[date].conditions.push(item.weather[0].description);
  });

  return Object.values(dailyData).map(day => ({
    date: day.date,
    temperature: {
      min: Math.min(...day.temperatures),
      max: Math.max(...day.temperatures)
    },
    precipitation: day.precipitation.reduce((sum, val) => sum + val, 0),
    condition: day.conditions[Math.floor(day.conditions.length / 2)] // Most common condition
  }));
}

// Mock data generators (for demonstration)
function generateMockNDVI(startDate, endDate) {
  const data = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // NDVI data comes every 16 days - simulate realistic crop growth
  let baseNDVI = 0.2; // Starting with bare soil
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 16)) {
    // Simulate crop growth cycle: low -> high -> low
    const daysSinceStart = Math.floor((d - start) / (1000 * 60 * 60 * 24));
    const growthCycle = Math.sin((daysSinceStart / 60) * Math.PI); // 120-day cycle
    const seasonalVariation = Math.sin((daysSinceStart / 365) * 2 * Math.PI); // Annual cycle
    
    const ndviValue = 0.2 + (growthCycle * 0.4) + (seasonalVariation * 0.1) + (Math.random() - 0.5) * 0.1;
    
    data.push({
      date: d.toISOString().split('T')[0],
      value: Math.max(0, Math.min(1, ndviValue)), // Clamp between 0-1
      quality: ndviValue > 0.4 ? 'excellent' : ndviValue > 0.2 ? 'good' : 'fair'
    });
  }
  
  return data;
}

function generateMockSoilMoisture(startDate, endDate) {
  const data = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Simulate realistic soil moisture patterns
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const daysSinceStart = Math.floor((d - start) / (1000 * 60 * 60 * 24));
    
    // Base moisture with seasonal variation
    const seasonalBase = 0.15 + Math.sin((daysSinceStart / 365) * 2 * Math.PI) * 0.05;
    
    // Add rainfall events (simulate occasional spikes)
    const rainEvent = Math.random() < 0.1 ? Math.random() * 0.1 : 0;
    
    // Gradual drying between rainfalls
    const dryingFactor = Math.sin((daysSinceStart % 7) * Math.PI / 7) * 0.02;
    
    const moistureValue = seasonalBase + rainEvent - dryingFactor + (Math.random() - 0.5) * 0.02;
    
    data.push({
      date: d.toISOString().split('T')[0],
      value: Math.max(0.05, Math.min(0.35, moistureValue)), // Clamp between 0.05-0.35
      depth: '0-5cm'
    });
  }
  
  return data;
}
