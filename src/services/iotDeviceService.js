/**
 * IoT Device Service
 * Handles IoT device registration, data collection, and management
 */

import { 
  createDeviceAlert, 
  createActionNotification, 
  createDeviceStatusNotification,
  createDataQualityNotification 
} from './notificationService';
import { processSensorData } from './automationService';

// Mock database for devices (in real app, this would be a backend API)
let devices = [];
let deviceData = [];

/**
 * Device Types and their supported sensors
 */
export const DEVICE_TYPES = {
  SOIL_SENSOR: {
    id: 'soil_sensor',
    name: 'Soil Sensor',
    description: 'Measures soil moisture, temperature, pH, and nutrients',
    sensors: ['moisture', 'temperature', 'ph', 'nitrogen', 'phosphorus', 'potassium'],
    icon: '🌱'
  },
  WEATHER_STATION: {
    id: 'weather_station',
    name: 'Weather Station',
    description: 'Monitors weather conditions and environmental factors',
    sensors: ['temperature', 'humidity', 'pressure', 'wind_speed', 'wind_direction', 'rainfall', 'solar_radiation'],
    icon: '🌤️'
  },
  IRRIGATION_CONTROLLER: {
    id: 'irrigation_controller',
    name: 'Irrigation Controller',
    description: 'Controls irrigation systems and monitors water usage',
    sensors: ['water_flow', 'valve_status', 'pressure'],
    actuators: ['valve_control', 'pump_control'],
    icon: '💧'
  },
  CROP_MONITOR: {
    id: 'crop_monitor',
    name: 'Crop Monitor',
    description: 'Uses cameras and sensors to monitor crop health',
    sensors: ['ndvi', 'leaf_temperature', 'growth_stage', 'pest_detection'],
    icon: '📷'
  }
};

/**
 * Action Types for automated responses
 */
export const ACTION_TYPES = {
  IRRIGATION: {
    id: 'irrigation',
    name: 'Start Irrigation',
    description: 'Automatically start irrigation when soil moisture is low',
    icon: '💧'
  },
  FERTILIZATION: {
    id: 'fertilization',
    name: 'Apply Fertilizer',
    description: 'Trigger fertilization based on soil nutrient levels',
    icon: '🌿'
  },
  ALERT: {
    id: 'alert',
    name: 'Send Alert',
    description: 'Send notification for critical conditions',
    icon: '🚨'
  },
  DATA_LOG: {
    id: 'data_log',
    name: 'Log Data',
    description: 'Record data point for analysis',
    icon: '📊'
  }
};

/**
 * Register a new IoT device
 */
export async function registerDevice(deviceData) {
  try {
    const device = {
      id: generateDeviceId(),
      ...deviceData,
      status: 'active',
      lastSeen: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      configuration: {
        samplingInterval: 300, // 5 minutes default
        thresholds: getDefaultThresholds(deviceData.type),
        actions: []
      }
    };

    devices.push(device);
    
    // Simulate initial data
    await generateInitialDeviceData(device);
    
    console.log('Device registered:', device);
    return { success: true, device };
  } catch (error) {
    console.error('Error registering device:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all registered devices
 */
export async function getDevices() {
  return devices;
}

/**
 * Get device by ID
 */
export async function getDevice(deviceId) {
  return devices.find(device => device.id === deviceId);
}

/**
 * Update device configuration
 */
export async function updateDeviceConfig(deviceId, config) {
  const device = devices.find(d => d.id === deviceId);
  if (!device) {
    throw new Error('Device not found');
  }

  device.configuration = { ...device.configuration, ...config };
  device.lastUpdated = new Date().toISOString();
  
  return { success: true, device };
}

/**
 * Get real-time data for a device
 */
export async function getDeviceData(deviceId, limit = 100) {
  return deviceData
    .filter(data => data.deviceId === deviceId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
}

/**
 * Get latest data for all devices
 */
export async function getAllDevicesLatestData() {
  const latestData = {};
  
  for (const device of devices) {
    const data = deviceData
      .filter(d => d.deviceId === device.id)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    
    if (data) {
      latestData[device.id] = data;
    }
  }
  
  return latestData;
}

/**
 * Simulate real-time data collection
 */
export async function simulateDeviceData() {
  for (const device of devices) {
    if (device.status === 'active') {
      const data = generateSensorData(device);
      deviceData.push(data);
      
      // Process actions based on data
      await processDeviceActions(device, data);
      
      // Process automation rules
      await processSensorData(device.id, data);
      
      // Update device last seen
      device.lastSeen = new Date().toISOString();
    }
  }
  
  // Keep only last 1000 data points per device
  for (const device of devices) {
    const deviceDataCount = deviceData.filter(d => d.deviceId === device.id).length;
    if (deviceDataCount > 1000) {
      const toRemove = deviceDataCount - 1000;
      const deviceDataToRemove = deviceData
        .filter(d => d.deviceId === device.id)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .slice(0, toRemove);
      
      deviceDataToRemove.forEach(data => {
        const index = deviceData.indexOf(data);
        if (index > -1) deviceData.splice(index, 1);
      });
    }
  }
}

/**
 * Execute action based on device data and thresholds
 */
export async function processDeviceActions(device, data) {
  const config = device.configuration;
  if (!config.thresholds || !config.actions) return;

  for (const action of config.actions) {
    if (shouldTriggerAction(action, data)) {
      await executeAction(device, action, data);
    }
  }
}

/**
 * Check if action should be triggered based on data
 */
function shouldTriggerAction(action, data) {
  const sensorData = data.sensors[action.sensor];
  if (!sensorData) return false;

  const shouldTrigger = (() => {
    switch (action.condition) {
      case 'greater_than':
        return sensorData.value > action.threshold;
      case 'less_than':
        return sensorData.value < action.threshold;
      case 'equals':
        return Math.abs(sensorData.value - action.threshold) < 0.01;
      default:
        return false;
    }
  })();

  // Create alert notification if threshold is crossed
  if (shouldTrigger && action.type === 'alert') {
    const device = devices.find(d => d.id === data.deviceId);
    if (device) {
      createDeviceAlert(device, action.sensor, sensorData.value, action.threshold, action.condition);
    }
  }

  return shouldTrigger;
}

/**
 * Execute an action
 */
async function executeAction(device, action, data) {
  console.log(`Executing action ${action.type} for device ${device.name}:`, action);
  
  // Simulate action execution
  const actionResult = {
    id: generateActionId(),
    deviceId: device.id,
    actionType: action.type,
    actionConfig: action,
    triggeredBy: data,
    timestamp: new Date().toISOString(),
    status: 'executed',
    result: 'success'
  };

  // Store action history
  if (!device.actionHistory) device.actionHistory = [];
  device.actionHistory.push(actionResult);

  // Create notification for action execution
  createActionNotification(device, action, actionResult);

  // For irrigation actions, update device status
  if (action.type === 'irrigation') {
    const oldStatus = device.status;
    device.status = 'irrigating';
    
    // Create device status change notification
    createDeviceStatusNotification(device, oldStatus, 'irrigating');
    
    // Simulate irrigation completion after 10 minutes
    setTimeout(() => {
      const previousStatus = device.status;
      device.status = 'active';
      createDeviceStatusNotification(device, previousStatus, 'active');
    }, 10 * 60 * 1000);
  }

  return actionResult;
}

/**
 * Get device action history
 */
export async function getDeviceActionHistory(deviceId, limit = 50) {
  const device = devices.find(d => d.id === deviceId);
  if (!device || !device.actionHistory) return [];
  
  return device.actionHistory
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
}

// Helper functions
function generateDeviceId() {
  return 'device_' + Math.random().toString(36).substr(2, 9);
}

function generateActionId() {
  return 'action_' + Math.random().toString(36).substr(2, 9);
}

function getDefaultThresholds(deviceType) {
  const defaults = {
    soil_sensor: {
      moisture: { min: 20, max: 80 },
      temperature: { min: 5, max: 35 },
      ph: { min: 6.0, max: 8.0 }
    },
    weather_station: {
      temperature: { min: -10, max: 50 },
      humidity: { min: 30, max: 90 },
      rainfall: { max: 100 }
    },
    irrigation_controller: {
      water_flow: { min: 0, max: 1000 }
    },
    crop_monitor: {
      ndvi: { min: 0.2, max: 0.8 }
    }
  };
  
  return defaults[deviceType] || {};
}

async function generateInitialDeviceData(device) {
  const data = generateSensorData(device);
  deviceData.push(data);
}

function generateSensorData(device) {
  const deviceType = DEVICE_TYPES[device.type.toUpperCase()];
  const sensors = {};
  
  deviceType.sensors.forEach(sensor => {
    sensors[sensor] = generateSensorReading(sensor);
  });

  const quality = Math.random() > 0.1 ? 'good' : 'poor';
  
  // Create data quality notification for poor quality data
  if (quality === 'poor') {
    createDataQualityNotification(device, quality, Object.keys(sensors)[0]);
  }

  return {
    id: generateDataId(),
    deviceId: device.id,
    timestamp: new Date().toISOString(),
    sensors,
    location: device.location,
    quality
  };
}

function generateSensorReading(sensor) {
  const baseValues = {
    moisture: { value: 45 + Math.random() * 30, unit: '%' },
    temperature: { value: 20 + Math.random() * 15, unit: '°C' },
    ph: { value: 6.5 + Math.random() * 1.5, unit: 'pH' },
    humidity: { value: 40 + Math.random() * 40, unit: '%' },
    pressure: { value: 1000 + Math.random() * 50, unit: 'hPa' },
    wind_speed: { value: Math.random() * 20, unit: 'm/s' },
    rainfall: { value: Math.random() * 10, unit: 'mm' },
    solar_radiation: { value: Math.random() * 1000, unit: 'W/m²' },
    ndvi: { value: 0.2 + Math.random() * 0.6, unit: 'index' },
    water_flow: { value: Math.random() * 100, unit: 'L/min' }
  };

  return baseValues[sensor] || { value: Math.random() * 100, unit: 'units' };
}

function generateDataId() {
  return 'data_' + Math.random().toString(36).substr(2, 9);
}

// Start data simulation
setInterval(simulateDeviceData, 30000); // Every 30 seconds

// Initialize with sample devices for demonstration
setTimeout(async () => {
  try {
    // Add sample devices if none exist
    if (devices.length === 0) {
      await registerDevice({
        name: 'North Field Soil Sensor',
        type: 'soil_sensor',
        location: { lat: 30.0444, lon: 31.2357 }, // Cairo, Egypt
        description: 'Primary soil monitoring station for North Field'
      });

      await registerDevice({
        name: 'Weather Station Alpha',
        type: 'weather_station',
        location: { lat: 30.0544, lon: 31.2457 },
        description: 'Main weather monitoring station'
      });

      await registerDevice({
        name: 'Irrigation Controller Zone 1',
        type: 'irrigation_controller',
        location: { lat: 30.0344, lon: 31.2257 },
        description: 'Automated irrigation for Zone 1'
      });

      await registerDevice({
        name: 'Crop Camera Monitor',
        type: 'crop_monitor',
        location: { lat: 30.0644, lon: 31.2557 },
        description: 'NDVI and crop health monitoring'
      });

      console.log('Sample IoT devices initialized for demonstration');
    }
  } catch (error) {
    console.error('Error initializing sample devices:', error);
  }
}, 2000);
