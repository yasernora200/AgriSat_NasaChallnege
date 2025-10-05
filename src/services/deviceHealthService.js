/**
 * Device Health Monitoring Service
 * Monitors device health, battery levels, connectivity, and predictive maintenance
 */

/**
 * Health Status Levels
 */
export const HEALTH_STATUS = {
  EXCELLENT: {
    level: 5,
    name: 'Excellent',
    color: 'green',
    icon: '🟢',
    description: 'Device operating optimally'
  },
  GOOD: {
    level: 4,
    name: 'Good',
    color: 'lightgreen',
    icon: '🟢',
    description: 'Device operating well with minor issues'
  },
  FAIR: {
    level: 3,
    name: 'Fair',
    color: 'yellow',
    icon: '🟡',
    description: 'Device operating with some issues'
  },
  POOR: {
    level: 2,
    name: 'Poor',
    color: 'orange',
    icon: '🟠',
    description: 'Device needs attention'
  },
  CRITICAL: {
    level: 1,
    name: 'Critical',
    color: 'red',
    icon: '🔴',
    description: 'Device requires immediate maintenance'
  }
};

/**
 * Health Metrics
 */
export const HEALTH_METRICS = {
  BATTERY_LEVEL: {
    id: 'battery_level',
    name: 'Battery Level',
    unit: '%',
    weight: 0.3,
    thresholds: {
      excellent: 90,
      good: 70,
      fair: 50,
      poor: 30,
      critical: 10
    }
  },
  SIGNAL_STRENGTH: {
    id: 'signal_strength',
    name: 'Signal Strength',
    unit: 'dBm',
    weight: 0.25,
    thresholds: {
      excellent: -50,
      good: -70,
      fair: -80,
      poor: -90,
      critical: -100
    }
  },
  UPTIME: {
    id: 'uptime',
    name: 'Uptime',
    unit: '%',
    weight: 0.2,
    thresholds: {
      excellent: 99.5,
      good: 98,
      fair: 95,
      poor: 90,
      critical: 85
    }
  },
  DATA_QUALITY: {
    id: 'data_quality',
    name: 'Data Quality',
    unit: '%',
    weight: 0.15,
    thresholds: {
      excellent: 98,
      good: 95,
      fair: 90,
      poor: 80,
      critical: 70
    }
  },
  TEMPERATURE: {
    id: 'temperature',
    name: 'Device Temperature',
    unit: '°C',
    weight: 0.1,
    thresholds: {
      excellent: 25,
      good: 35,
      fair: 45,
      poor: 55,
      critical: 65
    }
  }
};

/**
 * Maintenance Types
 */
export const MAINTENANCE_TYPES = {
  PREVENTIVE: {
    id: 'preventive',
    name: 'Preventive Maintenance',
    icon: '🔧',
    description: 'Scheduled maintenance to prevent issues'
  },
  PREDICTIVE: {
    id: 'predictive',
    name: 'Predictive Maintenance',
    icon: '🔮',
    description: 'Maintenance based on predicted failures'
  },
  CORRECTIVE: {
    id: 'corrective',
    name: 'Corrective Maintenance',
    icon: '🛠️',
    description: 'Repair after failure occurs'
  },
  EMERGENCY: {
    id: 'emergency',
    name: 'Emergency Maintenance',
    icon: '🚨',
    description: 'Urgent repair for critical issues'
  }
};

/**
 * Device Health Manager Class
 */
class DeviceHealthManager {
  constructor() {
    this.deviceHealth = new Map();
    this.maintenanceSchedules = new Map();
    this.healthHistory = new Map();
    this.subscribers = [];
  }

  /**
   * Initialize device health monitoring
   */
  initializeDevice(deviceId, deviceType) {
    const initialHealth = {
      deviceId,
      deviceType,
      overallStatus: HEALTH_STATUS.GOOD,
      metrics: this.initializeMetrics(deviceType),
      lastUpdated: new Date().toISOString(),
      alerts: [],
      maintenanceSchedule: this.generateMaintenanceSchedule(deviceType),
      predictedFailures: []
    };

    this.deviceHealth.set(deviceId, initialHealth);
    this.healthHistory.set(deviceId, []);
    
    return initialHealth;
  }

  /**
   * Initialize health metrics for device type
   */
  initializeMetrics(deviceType) {
    const metrics = {};
    
    // All devices have basic metrics
    metrics[HEALTH_METRICS.BATTERY_LEVEL.id] = {
      value: 85 + Math.random() * 15, // 85-100%
      status: HEALTH_STATUS.GOOD,
      lastUpdated: new Date().toISOString()
    };
    
    metrics[HEALTH_METRICS.SIGNAL_STRENGTH.id] = {
      value: -60 - Math.random() * 20, // -60 to -80 dBm
      status: HEALTH_STATUS.GOOD,
      lastUpdated: new Date().toISOString()
    };
    
    metrics[HEALTH_METRICS.UPTIME.id] = {
      value: 98 + Math.random() * 2, // 98-100%
      status: HEALTH_STATUS.EXCELLENT,
      lastUpdated: new Date().toISOString()
    };
    
    metrics[HEALTH_METRICS.DATA_QUALITY.id] = {
      value: 95 + Math.random() * 5, // 95-100%
      status: HEALTH_STATUS.GOOD,
      lastUpdated: new Date().toISOString()
    };
    
    // Add device-specific metrics
    if (deviceType === 'weather_station') {
      metrics[HEALTH_METRICS.TEMPERATURE.id] = {
        value: 25 + Math.random() * 15, // 25-40°C
        status: HEALTH_STATUS.GOOD,
        lastUpdated: new Date().toISOString()
      };
    }

    return metrics;
  }

  /**
   * Update device health metrics
   */
  updateDeviceHealth(deviceId, newMetrics) {
    const deviceHealth = this.deviceHealth.get(deviceId);
    if (!deviceHealth) return;

    // Update individual metrics
    Object.entries(newMetrics).forEach(([metricId, value]) => {
      if (deviceHealth.metrics[metricId]) {
        const oldValue = deviceHealth.metrics[metricId].value;
        deviceHealth.metrics[metricId].value = value;
        deviceHealth.metrics[metricId].status = this.calculateMetricStatus(metricId, value);
        deviceHealth.metrics[metricId].lastUpdated = new Date().toISOString();
        
        // Check for significant changes
        if (Math.abs(value - oldValue) > this.getSignificantChangeThreshold(metricId)) {
          this.checkMetricAlerts(deviceId, metricId, value, deviceHealth.metrics[metricId].status);
        }
      }
    });

    // Recalculate overall health
    deviceHealth.overallStatus = this.calculateOverallHealth(deviceHealth.metrics);
    deviceHealth.lastUpdated = new Date().toISOString();

    // Store health history
    this.storeHealthHistory(deviceId, deviceHealth);

    // Predict failures
    this.predictFailures(deviceId, deviceHealth);

    // Notify subscribers
    this.notifySubscribers(deviceId, deviceHealth);
  }

  /**
   * Calculate metric status based on thresholds
   */
  calculateMetricStatus(metricId, value) {
    const metric = Object.values(HEALTH_METRICS).find(m => m.id === metricId);
    if (!metric) return HEALTH_STATUS.GOOD;

    const thresholds = metric.thresholds;
    
    if (value >= thresholds.excellent) return HEALTH_STATUS.EXCELLENT;
    if (value >= thresholds.good) return HEALTH_STATUS.GOOD;
    if (value >= thresholds.fair) return HEALTH_STATUS.FAIR;
    if (value >= thresholds.poor) return HEALTH_STATUS.POOR;
    return HEALTH_STATUS.CRITICAL;
  }

  /**
   * Calculate overall device health
   */
  calculateOverallHealth(metrics) {
    let weightedScore = 0;
    let totalWeight = 0;

    Object.entries(metrics).forEach(([metricId, metricData]) => {
      const metric = Object.values(HEALTH_METRICS).find(m => m.id === metricId);
      if (metric) {
        weightedScore += metricData.status.level * metric.weight;
        totalWeight += metric.weight;
      }
    });

    const averageScore = totalWeight > 0 ? weightedScore / totalWeight : 3;
    
    if (averageScore >= 4.5) return HEALTH_STATUS.EXCELLENT;
    if (averageScore >= 3.5) return HEALTH_STATUS.GOOD;
    if (averageScore >= 2.5) return HEALTH_STATUS.FAIR;
    if (averageScore >= 1.5) return HEALTH_STATUS.POOR;
    return HEALTH_STATUS.CRITICAL;
  }

  /**
   * Check for metric alerts
   */
  checkMetricAlerts(deviceId, metricId, value, status) {
    if (status.level <= HEALTH_STATUS.POOR.level) {
      const alert = {
        id: `health_${deviceId}_${metricId}_${Date.now()}`,
        deviceId,
        metricId,
        value,
        status,
        timestamp: new Date().toISOString(),
        type: 'health_degradation',
        message: `${metricId} is ${status.name.toLowerCase()} (${value})`
      };

      const deviceHealth = this.deviceHealth.get(deviceId);
      deviceHealth.alerts.push(alert);

      // Keep only last 10 alerts
      if (deviceHealth.alerts.length > 10) {
        deviceHealth.alerts = deviceHealth.alerts.slice(-10);
      }
    }
  }

  /**
   * Get significant change threshold for metric
   */
  getSignificantChangeThreshold(metricId) {
    const thresholds = {
      battery_level: 5, // 5%
      signal_strength: 10, // 10 dBm
      uptime: 1, // 1%
      data_quality: 2, // 2%
      temperature: 5 // 5°C
    };
    return thresholds[metricId] || 10;
  }

  /**
   * Store health history
   */
  storeHealthHistory(deviceId, deviceHealth) {
    const history = this.healthHistory.get(deviceId) || [];
    
    history.push({
      timestamp: deviceHealth.lastUpdated,
      overallStatus: deviceHealth.overallStatus,
      metrics: { ...deviceHealth.metrics }
    });

    // Keep only last 1000 records
    if (history.length > 1000) {
      history.splice(0, history.length - 1000);
    }

    this.healthHistory.set(deviceId, history);
  }

  /**
   * Predict device failures
   */
  predictFailures(deviceId, deviceHealth) {
    const predictions = [];
    
    // Battery failure prediction
    const battery = deviceHealth.metrics[HEALTH_METRICS.BATTERY_LEVEL.id];
    if (battery && battery.value < 20) {
      const daysToFailure = (battery.value / 2); // Rough estimate
      predictions.push({
        type: 'battery_failure',
        probability: 0.9,
        estimatedDate: new Date(Date.now() + daysToFailure * 24 * 60 * 60 * 1000),
        description: `Battery will likely fail in ${Math.round(daysToFailure)} days`,
        recommendedAction: 'Schedule battery replacement'
      });
    }

    // Signal strength degradation
    const signal = deviceHealth.metrics[HEALTH_METRICS.SIGNAL_STRENGTH.id];
    if (signal && signal.value < -90) {
      predictions.push({
        type: 'connectivity_loss',
        probability: 0.7,
        estimatedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        description: 'Signal strength is degrading, connectivity loss likely',
        recommendedAction: 'Check antenna and positioning'
      });
    }

    // Data quality degradation
    const dataQuality = deviceHealth.metrics[HEALTH_METRICS.DATA_QUALITY.id];
    if (dataQuality && dataQuality.value < 85) {
      predictions.push({
        type: 'sensor_malfunction',
        probability: 0.6,
        estimatedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        description: 'Data quality declining, sensor malfunction possible',
        recommendedAction: 'Schedule sensor calibration'
      });
    }

    deviceHealth.predictedFailures = predictions;
  }

  /**
   * Generate maintenance schedule
   */
  generateMaintenanceSchedule(deviceType) {
    const schedules = {
      soil_sensor: [
        { type: MAINTENANCE_TYPES.PREVENTIVE, interval: 90, description: 'Sensor calibration' },
        { type: MAINTENANCE_TYPES.PREVENTIVE, interval: 180, description: 'Battery replacement' },
        { type: MAINTENANCE_TYPES.PREVENTIVE, interval: 365, description: 'Full system check' }
      ],
      weather_station: [
        { type: MAINTENANCE_TYPES.PREVENTIVE, interval: 30, description: 'Sensor cleaning' },
        { type: MAINTENANCE_TYPES.PREVENTIVE, interval: 180, description: 'Calibration check' },
        { type: MAINTENANCE_TYPES.PREVENTIVE, interval: 365, description: 'Annual maintenance' }
      ],
      irrigation_controller: [
        { type: MAINTENANCE_TYPES.PREVENTIVE, interval: 14, description: 'Valve inspection' },
        { type: MAINTENANCE_TYPES.PREVENTIVE, interval: 90, description: 'System cleaning' },
        { type: MAINTENANCE_TYPES.PREVENTIVE, interval: 180, description: 'Pressure check' }
      ],
      crop_monitor: [
        { type: MAINTENANCE_TYPES.PREVENTIVE, interval: 30, description: 'Camera cleaning' },
        { type: MAINTENANCE_TYPES.PREVENTIVE, interval: 90, description: 'Calibration check' },
        { type: MAINTENANCE_TYPES.PREVENTIVE, interval: 180, description: 'Lens inspection' }
      ]
    };

    return schedules[deviceType] || [];
  }

  /**
   * Get maintenance recommendations
   */
  getMaintenanceRecommendations(deviceId) {
    const deviceHealth = this.deviceHealth.get(deviceId);
    if (!deviceHealth) return [];

    const recommendations = [];

    // Add predictive maintenance based on predicted failures
    deviceHealth.predictedFailures.forEach(failure => {
      recommendations.push({
        type: MAINTENANCE_TYPES.PREDICTIVE,
        priority: 'high',
        description: failure.description,
        recommendedAction: failure.recommendedAction,
        estimatedDate: failure.estimatedDate,
        probability: failure.probability
      });
    });

    // Add preventive maintenance based on schedule
    deviceHealth.maintenanceSchedule.forEach(task => {
      const lastMaintenance = this.getLastMaintenance(deviceId, task.description);
      const daysSinceMaintenance = lastMaintenance ? 
        (Date.now() - new Date(lastMaintenance).getTime()) / (24 * 60 * 60 * 1000) : 999;
      
      if (daysSinceMaintenance >= task.interval) {
        recommendations.push({
          type: task.type,
          priority: daysSinceMaintenance > task.interval * 1.5 ? 'high' : 'medium',
          description: task.description,
          recommendedAction: task.description,
          estimatedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          overdue: daysSinceMaintenance > task.interval
        });
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Get last maintenance record (simulated)
   */
  getLastMaintenance(deviceId, taskDescription) {
    // In real implementation, this would query a maintenance database
    const daysAgo = Math.floor(Math.random() * 365);
    return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
  }

  /**
   * Get device health
   */
  getDeviceHealth(deviceId) {
    return this.deviceHealth.get(deviceId);
  }

  /**
   * Get all device health data
   */
  getAllDeviceHealth() {
    return Array.from(this.deviceHealth.values());
  }

  /**
   * Get health statistics
   */
  getHealthStatistics() {
    const devices = Array.from(this.deviceHealth.values());
    const total = devices.length;
    
    const statusCounts = {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0,
      critical: 0
    };

    devices.forEach(device => {
      const statusName = device.overallStatus.name.toLowerCase();
      statusCounts[statusName]++;
    });

    return {
      total,
      ...statusCounts,
      averageHealth: total > 0 ? 
        devices.reduce((sum, device) => sum + device.overallStatus.level, 0) / total : 0,
      devicesNeedingAttention: statusCounts.poor + statusCounts.critical
    };
  }

  /**
   * Get health trends
   */
  getHealthTrends(deviceId, days = 30) {
    const history = this.healthHistory.get(deviceId) || [];
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    return history
      .filter(record => new Date(record.timestamp) >= cutoffDate)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  /**
   * Subscribe to health updates
   */
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) this.subscribers.splice(index, 1);
    };
  }

  /**
   * Notify subscribers
   */
  notifySubscribers(deviceId, deviceHealth) {
    this.subscribers.forEach(callback => {
      try {
        callback({
          deviceId,
          deviceHealth,
          statistics: this.getHealthStatistics()
        });
      } catch (error) {
        console.error('Error notifying health subscriber:', error);
      }
    });
  }
}

// Create global device health manager instance
export const deviceHealthManager = new DeviceHealthManager();

// Export convenience functions
export function initializeDeviceHealth(deviceId, deviceType) {
  return deviceHealthManager.initializeDevice(deviceId, deviceType);
}

export function updateDeviceHealth(deviceId, metrics) {
  return deviceHealthManager.updateDeviceHealth(deviceId, metrics);
}

export function getDeviceHealth(deviceId) {
  return deviceHealthManager.getDeviceHealth(deviceId);
}

export function getMaintenanceRecommendations(deviceId) {
  return deviceHealthManager.getMaintenanceRecommendations(deviceId);
}

export function getHealthStatistics() {
  return deviceHealthManager.getHealthStatistics();
}

export function subscribeToHealthUpdates(callback) {
  return deviceHealthManager.subscribe(callback);
}
