/**
 * Predictive Analytics Service
 * Provides machine learning predictions for agricultural data
 */

/**
 * Prediction Types
 */
export const PREDICTION_TYPES = {
  CROP_YIELD: {
    id: 'crop_yield',
    name: 'Crop Yield Prediction',
    icon: '🌾',
    description: 'Predict crop yield based on historical data and current conditions'
  },
  IRRIGATION_SCHEDULE: {
    id: 'irrigation_schedule',
    name: 'Irrigation Schedule Optimization',
    icon: '💧',
    description: 'Optimize irrigation timing based on soil moisture and weather'
  },
  PEST_RISK: {
    id: 'pest_risk',
    name: 'Pest Risk Assessment',
    icon: '🐛',
    description: 'Assess pest risk based on environmental conditions'
  },
  HARVEST_TIME: {
    id: 'harvest_time',
    name: 'Optimal Harvest Time',
    icon: '⏰',
    description: 'Predict optimal harvest timing for maximum yield'
  },
  FERTILIZER_NEED: {
    id: 'fertilizer_need',
    name: 'Fertilizer Requirements',
    icon: '🌿',
    description: 'Calculate fertilizer needs based on soil analysis'
  }
};

/**
 * Predict crop yield based on historical and current data
 */
export function predictCropYield(historicalData, currentConditions, cropType = 'wheat') {
  // Simulate ML model prediction
  const baseYield = getCropBaseYield(cropType);
  
  // Factors affecting yield
  const soilMoistureFactor = calculateSoilMoistureFactor(currentConditions.soilMoisture);
  const temperatureFactor = calculateTemperatureFactor(currentConditions.temperature);
  const rainfallFactor = calculateRainfallFactor(currentConditions.rainfall);
  const ndviFactor = calculateNDVIFactor(currentConditions.ndvi);
  
  // Historical trend analysis
  const trendFactor = analyzeHistoricalTrend(historicalData);
  
  // Calculate predicted yield
  const predictedYield = baseYield * soilMoistureFactor * temperatureFactor * 
                        rainfallFactor * ndviFactor * trendFactor;
  
  // Add some randomness for realism
  const variance = (Math.random() - 0.5) * 0.1; // ±5% variance
  const finalYield = predictedYield * (1 + variance);
  
  return {
    predictedYield: Math.round(finalYield * 100) / 100,
    confidence: calculateConfidence(historicalData),
    factors: {
      soilMoisture: soilMoistureFactor,
      temperature: temperatureFactor,
      rainfall: rainfallFactor,
      ndvi: ndviFactor,
      trend: trendFactor
    },
    recommendations: generateYieldRecommendations(finalYield, baseYield, currentConditions),
    timestamp: new Date().toISOString()
  };
}

/**
 * Optimize irrigation schedule
 */
export function optimizeIrrigationSchedule(soilData, weatherForecast) {
  const schedule = [];
  const daysToPlan = 14; // 2 weeks ahead
  
  for (let day = 0; day < daysToPlan; day++) {
    const forecast = weatherForecast[day] || {};
    const soilMoisture = soilData.currentMoisture - (day * 0.02); // Simulate drying
    
    const irrigationNeed = calculateIrrigationNeed(soilMoisture, forecast);
    
    if (irrigationNeed.shouldIrrigate) {
      schedule.push({
        day: day + 1,
        date: new Date(Date.now() + day * 24 * 60 * 60 * 1000),
        duration: irrigationNeed.duration,
        amount: irrigationNeed.amount,
        reason: irrigationNeed.reason,
        priority: irrigationNeed.priority
      });
    }
  }
  
  return {
    schedule,
    totalWaterNeeded: schedule.reduce((sum, event) => sum + event.amount, 0),
    efficiency: calculateWaterEfficiency(schedule, soilData),
    recommendations: generateIrrigationRecommendations(schedule, soilData),
    timestamp: new Date().toISOString()
  };
}

/**
 * Assess pest risk
 */
export function assessPestRisk(environmentalData) {
  const risks = [];
  
  // Temperature-based pest risks
  if (environmentalData.temperature > 25 && environmentalData.humidity > 70) {
    risks.push({
      pest: 'Aphids',
      risk: 'high',
      probability: 0.85,
      description: 'High temperature and humidity favor aphid reproduction'
    });
  }
  
  // Moisture-based risks
  if (environmentalData.soilMoisture > 80) {
    risks.push({
      pest: 'Root Rot',
      risk: 'medium',
      probability: 0.65,
      description: 'Excessive soil moisture increases root rot risk'
    });
  }
  
  // Weather-based risks
  if (environmentalData.rainfall > 20) {
    risks.push({
      pest: 'Fungal Diseases',
      risk: 'high',
      probability: 0.75,
      description: 'Heavy rainfall creates favorable conditions for fungal growth'
    });
  }
  
  const overallRisk = calculateOverallRisk(risks);
  
  return {
    overallRisk,
    risks,
    recommendations: generatePestControlRecommendations(risks),
    monitoringSchedule: generateMonitoringSchedule(overallRisk),
    timestamp: new Date().toISOString()
  };
}

/**
 * Predict optimal harvest time
 */
export function predictHarvestTime(cropData, weatherForecast) {
  const currentStage = assessCropStage(cropData);
  const daysToMaturity = estimateDaysToMaturity(currentStage);
  const weatherImpact = assessWeatherImpact(weatherForecast);
  
  const optimalHarvestDate = new Date(Date.now() + (daysToMaturity + weatherImpact) * 24 * 60 * 60 * 1000);
  
  return {
    optimalHarvestDate,
    daysToHarvest: daysToMaturity + weatherImpact,
    currentStage,
    maturityProgress: (currentStage.stage / currentStage.totalStages) * 100,
    weatherImpact,
    qualityFactors: assessQualityFactors(cropData, weatherForecast),
    recommendations: generateHarvestRecommendations(optimalHarvestDate, weatherForecast),
    timestamp: new Date().toISOString()
  };
}

/**
 * Calculate fertilizer requirements
 */
export function calculateFertilizerNeeds(soilAnalysis, cropType = 'wheat', targetYield) {
  const requirements = {
    nitrogen: calculateNitrogenNeed(soilAnalysis.nitrogen, cropType, targetYield),
    phosphorus: calculatePhosphorusNeed(soilAnalysis.phosphorus, cropType, targetYield),
    potassium: calculatePotassiumNeed(soilAnalysis.potassium, cropType, targetYield)
  };
  
  const totalCost = Object.values(requirements).reduce((sum, req) => sum + req.cost, 0);
  
  return {
    requirements,
    totalCost,
    applicationSchedule: generateFertilizerSchedule(requirements),
    recommendations: generateFertilizerRecommendations(requirements),
    timestamp: new Date().toISOString()
  };
}

// Helper functions
function getCropBaseYield(cropType) {
  const baseYields = {
    wheat: 3.5, // tons per hectare
    corn: 8.0,
    rice: 4.2,
    soybeans: 2.8,
    cotton: 0.8
  };
  return baseYields[cropType] || 3.0;
}

function calculateSoilMoistureFactor(moisture) {
  // Optimal moisture range: 40-70%
  if (moisture >= 40 && moisture <= 70) return 1.0;
  if (moisture < 40) return 0.8 + (moisture / 40) * 0.2;
  if (moisture > 70) return 1.0 - ((moisture - 70) / 30) * 0.3;
  return 0.9;
}

function calculateTemperatureFactor(temperature) {
  // Optimal temperature range: 20-25°C
  if (temperature >= 20 && temperature <= 25) return 1.0;
  if (temperature < 20) return 0.7 + ((temperature - 10) / 10) * 0.3;
  if (temperature > 25) return 1.0 - ((temperature - 25) / 15) * 0.4;
  return 0.9;
}

function calculateRainfallFactor(rainfall) {
  // Optimal rainfall: 500-800mm per season
  if (rainfall >= 500 && rainfall <= 800) return 1.0;
  if (rainfall < 500) return 0.6 + (rainfall / 500) * 0.4;
  if (rainfall > 800) return 1.0 - ((rainfall - 800) / 400) * 0.3;
  return 0.8;
}

function calculateNDVIFactor(ndvi) {
  // NDVI range: 0-1, optimal: 0.6-0.8
  if (ndvi >= 0.6 && ndvi <= 0.8) return 1.0;
  if (ndvi < 0.6) return 0.5 + (ndvi / 0.6) * 0.5;
  if (ndvi > 0.8) return 1.0 - ((ndvi - 0.8) / 0.2) * 0.2;
  return 0.8;
}

function analyzeHistoricalTrend(data) {
  if (!data || data.length < 2) return 1.0;
  
  // Simple trend analysis
  const recent = data.slice(-5);
  const older = data.slice(-10, -5);
  
  const recentAvg = recent.reduce((sum, d) => sum + d.yield, 0) / recent.length;
  const olderAvg = older.reduce((sum, d) => sum + d.yield, 0) / older.length;
  
  const trend = recentAvg / olderAvg;
  return Math.max(0.7, Math.min(1.3, trend)); // Cap between 70% and 130%
}

function calculateConfidence(data) {
  if (!data || data.length < 10) return 'low';
  if (data.length < 30) return 'medium';
  return 'high';
}

function generateYieldRecommendations(predictedYield, baseYield, conditions) {
  const recommendations = [];
  
  if (predictedYield < baseYield * 0.8) {
    recommendations.push({
      type: 'warning',
      message: 'Yield prediction is below average. Consider soil improvement.',
      priority: 'high'
    });
  }
  
  if (conditions.soilMoisture < 40) {
    recommendations.push({
      type: 'irrigation',
      message: 'Soil moisture is low. Schedule irrigation.',
      priority: 'high'
    });
  }
  
  if (conditions.temperature > 30) {
    recommendations.push({
      type: 'heat',
      message: 'High temperatures detected. Monitor for heat stress.',
      priority: 'medium'
    });
  }
  
  return recommendations;
}

function calculateIrrigationNeed(soilMoisture, forecast) {
  const optimalMoisture = 50; // 50% optimal
  
  if (soilMoisture < optimalMoisture - 10) {
    const deficit = optimalMoisture - soilMoisture;
    return {
      shouldIrrigate: true,
      duration: Math.min(60, deficit * 3), // minutes
      amount: deficit * 0.5, // liters per square meter
      reason: 'Low soil moisture',
      priority: 'high'
    };
  }
  
  if (forecast.rainfall < 5 && soilMoisture < optimalMoisture) {
    return {
      shouldIrrigate: true,
      duration: 30,
      amount: 15,
      reason: 'No rain forecast, preventive irrigation',
      priority: 'medium'
    };
  }
  
  return { shouldIrrigate: false };
}

function calculateWaterEfficiency(schedule, soilData) {
  const totalWater = schedule.reduce((sum, event) => sum + event.amount, 0);
  const optimalWater = soilData.area * 0.3; // 300mm per season
  
  return Math.min(100, (optimalWater / totalWater) * 100);
}

function generateIrrigationRecommendations(schedule, soilData) {
  const recommendations = [];
  
  if (schedule.length > 7) {
    recommendations.push({
      type: 'efficiency',
      message: 'Consider drip irrigation for better water efficiency.',
      priority: 'medium'
    });
  }
  
  const totalWater = schedule.reduce((sum, event) => sum + event.amount, 0);
  if (totalWater > soilData.area * 0.4) {
    recommendations.push({
      type: 'conservation',
      message: 'Water usage is high. Consider soil moisture sensors.',
      priority: 'low'
    });
  }
  
  return recommendations;
}

function calculateOverallRisk(risks) {
  if (risks.length === 0) return 'low';
  
  const highRisk = risks.filter(r => r.risk === 'high').length;
  const mediumRisk = risks.filter(r => r.risk === 'medium').length;
  
  if (highRisk > 0) return 'high';
  if (mediumRisk > 1) return 'medium';
  return 'low';
}

function generatePestControlRecommendations(risks) {
  const recommendations = [];
  
  risks.forEach(risk => {
    if (risk.risk === 'high') {
      recommendations.push({
        type: 'prevention',
        message: `High risk of ${risk.pest}. Consider preventive treatment.`,
        priority: 'high',
        pest: risk.pest
      });
    }
  });
  
  return recommendations;
}

function generateMonitoringSchedule(riskLevel) {
  const schedules = {
    low: 'Weekly monitoring recommended',
    medium: 'Bi-weekly monitoring recommended',
    high: 'Daily monitoring recommended'
  };
  
  return schedules[riskLevel] || schedules.low;
}

function assessCropStage(cropData) {
  // Simplified crop stage assessment
  const ndvi = cropData.ndvi || 0.5;
  
  if (ndvi < 0.3) return { stage: 1, name: 'Germination', totalStages: 6 };
  if (ndvi < 0.5) return { stage: 2, name: 'Vegetative', totalStages: 6 };
  if (ndvi < 0.7) return { stage: 3, name: 'Flowering', totalStages: 6 };
  if (ndvi < 0.8) return { stage: 4, name: 'Fruit Development', totalStages: 6 };
  if (ndvi < 0.6) return { stage: 5, name: 'Maturity', totalStages: 6 };
  return { stage: 6, name: 'Harvest Ready', totalStages: 6 };
}

function estimateDaysToMaturity(currentStage) {
  const totalDays = 120; // Default wheat maturity
  const stageProgress = currentStage.stage / currentStage.totalStages;
  
  return Math.round(totalDays * (1 - stageProgress));
}

function assessWeatherImpact(forecast) {
  // Negative weather impacts harvest timing
  let impact = 0;
  
  forecast.slice(0, 7).forEach(day => {
    if (day.rainfall > 10) impact += 1; // Rain delays harvest
    if (day.temperature < 10) impact += 2; // Cold delays maturity
  });
  
  return impact;
}

function assessQualityFactors(cropData, forecast) {
  return {
    moisture: cropData.soilMoisture || 50,
    temperature: forecast[0]?.temperature || 20,
    rainfall: forecast[0]?.rainfall || 0,
    quality: cropData.soilMoisture > 40 && forecast[0]?.temperature > 15 ? 'good' : 'fair'
  };
}

function generateHarvestRecommendations(harvestDate, forecast) {
  const recommendations = [];
  
  const daysToHarvest = Math.ceil((harvestDate - new Date()) / (24 * 60 * 60 * 1000));
  
  if (daysToHarvest < 7) {
    recommendations.push({
      type: 'timing',
      message: 'Harvest window opening soon. Prepare equipment.',
      priority: 'high'
    });
  }
  
  // Check for rain in harvest window
  const rainInWindow = forecast.slice(0, daysToHarvest + 3).some(day => day.rainfall > 5);
  if (rainInWindow) {
    recommendations.push({
      type: 'weather',
      message: 'Rain forecast during harvest window. Consider earlier harvest.',
      priority: 'medium'
    });
  }
  
  return recommendations;
}

function calculateNitrogenNeed(currentNitrogen, cropType, targetYield) {
  const baseNeed = targetYield * 25; // kg per ton yield
  const deficit = Math.max(0, baseNeed - currentNitrogen);
  
  return {
    current: currentNitrogen,
    needed: deficit,
    cost: deficit * 0.8, // $0.8 per kg
    application: deficit > 50 ? 'Split application recommended' : 'Single application'
  };
}

function calculatePhosphorusNeed(currentPhosphorus, cropType, targetYield) {
  const baseNeed = targetYield * 15;
  const deficit = Math.max(0, baseNeed - currentPhosphorus);
  
  return {
    current: currentPhosphorus,
    needed: deficit,
    cost: deficit * 1.2,
    application: 'Apply before planting'
  };
}

function calculatePotassiumNeed(currentPotassium, cropType, targetYield) {
  const baseNeed = targetYield * 20;
  const deficit = Math.max(0, baseNeed - currentPotassium);
  
  return {
    current: currentPotassium,
    needed: deficit,
    cost: deficit * 0.6,
    application: 'Apply in spring'
  };
}

function generateFertilizerSchedule(requirements) {
  const schedule = [];
  
  if (requirements.nitrogen.needed > 0) {
    schedule.push({
      fertilizer: 'Nitrogen',
      amount: requirements.nitrogen.needed,
      timing: 'Split: 50% at planting, 50% at flowering',
      cost: requirements.nitrogen.cost
    });
  }
  
  if (requirements.phosphorus.needed > 0) {
    schedule.push({
      fertilizer: 'Phosphorus',
      amount: requirements.phosphorus.needed,
      timing: 'Before planting',
      cost: requirements.phosphorus.cost
    });
  }
  
  if (requirements.potassium.needed > 0) {
    schedule.push({
      fertilizer: 'Potassium',
      amount: requirements.potassium.needed,
      timing: 'Spring application',
      cost: requirements.potassium.cost
    });
  }
  
  return schedule;
}

function generateFertilizerRecommendations(requirements) {
  const recommendations = [];
  
  const totalNeeded = Object.values(requirements).reduce((sum, req) => sum + req.needed, 0);
  
  if (totalNeeded > 200) {
    recommendations.push({
      type: 'soil_health',
      message: 'High fertilizer needs indicate poor soil health. Consider soil improvement.',
      priority: 'high'
    });
  }
  
  if (requirements.nitrogen.needed > 100) {
    recommendations.push({
      type: 'nitrogen',
      message: 'High nitrogen need. Consider cover crops or organic amendments.',
      priority: 'medium'
    });
  }
  
  return recommendations;
}
