/**
 * Actuator Service
 * Manages agricultural actuators for automated actions based on IoT device data
 */

import { createAlert } from './advancedAlertService';

/**
 * Actuator Types
 */
export const ACTUATOR_TYPES = {
  IRRIGATION_VALVE: {
    id: 'irrigation_valve',
    name: 'Irrigation Valve',
    icon: '🚰',
    description: 'Controls water flow for irrigation systems',
    supportedActions: ['open', 'close', 'adjust_flow'],
    parameters: ['flow_rate', 'duration', 'pressure']
  },
  FERTILIZER_DISPENSER: {
    id: 'fertilizer_dispenser',
    name: 'Fertilizer Dispenser',
    icon: '🌿',
    description: 'Automated fertilizer application system',
    supportedActions: ['dispense', 'stop', 'adjust_rate'],
    parameters: ['application_rate', 'volume', 'type']
  },
  PEST_SPRAYER: {
    id: 'pest_sprayer',
    name: 'Pest Control Sprayer',
    icon: '💨',
    description: 'Automated pest control spraying system',
    supportedActions: ['spray', 'stop', 'adjust_coverage'],
    parameters: ['spray_rate', 'coverage_area', 'chemical_type']
  },
  GREENHOUSE_VENT: {
    id: 'greenhouse_vent',
    name: 'Greenhouse Ventilation',
    icon: '🌪️',
    description: 'Controls greenhouse temperature and humidity',
    supportedActions: ['open', 'close', 'adjust_angle'],
    parameters: ['opening_percentage', 'angle', 'duration']
  },
  GROWTH_LIGHT: {
    id: 'growth_light',
    name: 'Growth Light System',
    icon: '💡',
    description: 'Controls artificial lighting for plant growth',
    supportedActions: ['turn_on', 'turn_off', 'adjust_intensity'],
    parameters: ['intensity', 'duration', 'spectrum']
  },
  SOIL_TILLER: {
    id: 'soil_tiller',
    name: 'Soil Tiller',
    icon: '🚜',
    description: 'Automated soil cultivation equipment',
    supportedActions: ['start', 'stop', 'adjust_depth'],
    parameters: ['tilling_depth', 'speed', 'pattern']
  }
};

/**
 * Actuator Status
 */
export const ACTUATOR_STATUS = {
  IDLE: {
    id: 'idle',
    name: 'Idle',
    color: 'gray',
    icon: '⚪',
    description: 'Actuator is ready and waiting'
  },
  ACTIVE: {
    id: 'active',
    name: 'Active',
    color: 'green',
    icon: '🟢',
    description: 'Actuator is currently operating'
  },
  ERROR: {
    id: 'error',
    name: 'Error',
    color: 'red',
    icon: '🔴',
    description: 'Actuator has encountered an error'
  },
  MAINTENANCE: {
    id: 'maintenance',
    name: 'Maintenance',
    color: 'yellow',
    icon: '🟡',
    description: 'Actuator is in maintenance mode'
  },
  DISABLED: {
    id: 'disabled',
    name: 'Disabled',
    color: 'gray',
    icon: '⚫',
    description: 'Actuator is disabled'
  }
};

/**
 * Action Types
 */
export const ACTION_TYPES = {
  IMMEDIATE: {
    id: 'immediate',
    name: 'Immediate Action',
    description: 'Execute action immediately'
  },
  SCHEDULED: {
    id: 'scheduled',
    name: 'Scheduled Action',
    description: 'Execute action at specified time'
  },
  CONDITIONAL: {
    id: 'conditional',
    name: 'Conditional Action',
    description: 'Execute action based on conditions'
  },
  SEQUENTIAL: {
    id: 'sequential',
    name: 'Sequential Action',
    description: 'Execute multiple actions in sequence'
  }
};

/**
 * Actuator Manager Class
 */
class ActuatorManager {
  constructor() {
    this.actuators = new Map();
    this.actionQueue = [];
    this.actionHistory = [];
    this.subscribers = [];
    this.automationRules = [];
    this.isProcessing = false;
  }

  /**
   * Register a new actuator
   */
  registerActuator(actuatorData) {
    const actuator = {
      id: this.generateActuatorId(),
      ...actuatorData,
      status: ACTUATOR_STATUS.IDLE,
      currentAction: null,
      lastAction: null,
      performance: {
        totalActions: 0,
        successfulActions: 0,
        errorCount: 0,
        lastMaintenance: null
      },
      configuration: {
        maxFlowRate: actuatorData.maxFlowRate || 100,
        maxPressure: actuatorData.maxPressure || 50,
        safetyLimits: actuatorData.safetyLimits || {},
        automationEnabled: true
      },
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    this.actuators.set(actuator.id, actuator);
    this.notifySubscribers();
    
    console.log('Actuator registered:', actuator);
    return actuator;
  }

  /**
   * Execute action on actuator
   */
  async executeAction(actuatorId, action, parameters = {}) {
    const actuator = this.actuators.get(actuatorId);
    if (!actuator) {
      throw new Error(`Actuator ${actuatorId} not found`);
    }

    if (actuator.status.id === ACTUATOR_STATUS.DISABLED.id) {
      throw new Error(`Actuator ${actuatorId} is disabled`);
    }

    // Validate action
    const actuatorType = ACTUATOR_TYPES[actuator.type.toUpperCase()];
    if (!actuatorType.supportedActions.includes(action)) {
      throw new Error(`Action ${action} not supported by actuator type ${actuator.type}`);
    }

    // Create action record
    const actionRecord = {
      id: this.generateActionId(),
      actuatorId,
      action,
      parameters,
      status: 'pending',
      timestamp: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      result: null,
      error: null
    };

    // Add to queue
    this.actionQueue.push(actionRecord);
    
    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processActionQueue();
    }

    return actionRecord;
  }

  /**
   * Process action queue
   */
  async processActionQueue() {
    if (this.isProcessing || this.actionQueue.length === 0) return;

    this.isProcessing = true;

    while (this.actionQueue.length > 0) {
      const actionRecord = this.actionQueue.shift();
      await this.processAction(actionRecord);
    }

    this.isProcessing = false;
  }

  /**
   * Process individual action
   */
  async processAction(actionRecord) {
    const actuator = this.actuators.get(actionRecord.actuatorId);
    if (!actuator) return;

    try {
      // Update actuator status
      actuator.status = ACTUATOR_STATUS.ACTIVE;
      actuator.currentAction = actionRecord;
      actuator.lastUpdated = new Date().toISOString();

      actionRecord.status = 'executing';
      actionRecord.startedAt = new Date().toISOString();

      // Simulate action execution
      const result = await this.simulateActuatorAction(actuator, actionRecord);

      // Update actuator
      actuator.status = ACTUATOR_STATUS.IDLE;
      actuator.currentAction = null;
      actuator.lastAction = actionRecord;
      actuator.performance.totalActions++;
      actuator.performance.successfulActions++;
      actuator.lastUpdated = new Date().toISOString();

      // Update action record
      actionRecord.status = 'completed';
      actionRecord.completedAt = new Date().toISOString();
      actionRecord.result = result;

      // Store in history
      this.actionHistory.unshift(actionRecord);
      if (this.actionHistory.length > 1000) {
        this.actionHistory = this.actionHistory.slice(0, 1000);
      }

      // Create success notification
      createAlert({
        type: 'action_executed',
        severity: 'MEDIUM',
        deviceId: actuator.deviceId,
        data: {
          deviceName: actuator.name,
          action: actionRecord.action,
          result: result
        }
      });

      console.log(`Action executed successfully: ${actionRecord.action} on ${actuator.name}`);

    } catch (error) {
      // Handle error
      actuator.status = ACTUATOR_STATUS.ERROR;
      actuator.currentAction = null;
      actuator.performance.errorCount++;
      actuator.lastUpdated = new Date().toISOString();

      actionRecord.status = 'failed';
      actionRecord.completedAt = new Date().toISOString();
      actionRecord.error = error.message;

      // Create error notification
      createAlert({
        type: 'actuator_error',
        severity: 'HIGH',
        deviceId: actuator.deviceId,
        data: {
          deviceName: actuator.name,
          action: actionRecord.action,
          error: error.message
        }
      });

      console.error(`Action failed: ${actionRecord.action} on ${actuator.name}`, error);
    }

    this.notifySubscribers();
  }

  /**
   * Simulate actuator action (replace with real hardware control)
   */
  async simulateActuatorAction(actuator, actionRecord) {
    const { action, parameters } = actionRecord;
    
    // Simulate processing time
    const processingTime = Math.random() * 3000 + 1000; // 1-4 seconds
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Simulate different actions
    switch (actuator.type) {
      case 'irrigation_valve':
        return this.simulateIrrigationAction(action, parameters);
      
      case 'fertilizer_dispenser':
        return this.simulateFertilizerAction(action, parameters);
      
      case 'pest_sprayer':
        return this.simulatePestControlAction(action, parameters);
      
      case 'greenhouse_vent':
        return this.simulateGreenhouseAction(action, parameters);
      
      case 'growth_light':
        return this.simulateLightingAction(action, parameters);
      
      case 'soil_tiller':
        return this.simulateTillingAction(action, parameters);
      
      default:
        return { success: true, message: 'Action completed' };
    }
  }

  /**
   * Simulate irrigation actions
   */
  simulateIrrigationAction(action, parameters) {
    switch (action) {
      case 'open':
        return {
          success: true,
          flowRate: parameters.flow_rate || 50,
          pressure: parameters.pressure || 30,
          message: 'Irrigation valve opened'
        };
      
      case 'close':
        return {
          success: true,
          message: 'Irrigation valve closed'
        };
      
      case 'adjust_flow':
        return {
          success: true,
          flowRate: parameters.flow_rate,
          message: `Flow rate adjusted to ${parameters.flow_rate} L/min`
        };
      
      default:
        throw new Error(`Unsupported irrigation action: ${action}`);
    }
  }

  /**
   * Simulate fertilizer actions
   */
  simulateFertilizerAction(action, parameters) {
    switch (action) {
      case 'dispense':
        return {
          success: true,
          volume: parameters.volume || 10,
          applicationRate: parameters.application_rate || 5,
          fertilizerType: parameters.type || 'NPK',
          message: `Dispensed ${parameters.volume || 10}L of ${parameters.type || 'NPK'} fertilizer`
        };
      
      case 'stop':
        return {
          success: true,
          message: 'Fertilizer dispensing stopped'
        };
      
      case 'adjust_rate':
        return {
          success: true,
          applicationRate: parameters.application_rate,
          message: `Application rate adjusted to ${parameters.application_rate} L/ha`
        };
      
      default:
        throw new Error(`Unsupported fertilizer action: ${action}`);
    }
  }

  /**
   * Simulate pest control actions
   */
  simulatePestControlAction(action, parameters) {
    switch (action) {
      case 'spray':
        return {
          success: true,
          coverageArea: parameters.coverage_area || 100,
          sprayRate: parameters.spray_rate || 2,
          chemicalType: parameters.chemical_type || 'Organic',
          message: `Sprayed ${parameters.coverage_area || 100}m² with ${parameters.chemical_type || 'Organic'}`
        };
      
      case 'stop':
        return {
          success: true,
          message: 'Spraying stopped'
        };
      
      case 'adjust_coverage':
        return {
          success: true,
          coverageArea: parameters.coverage_area,
          message: `Coverage area adjusted to ${parameters.coverage_area}m²`
        };
      
      default:
        throw new Error(`Unsupported pest control action: ${action}`);
    }
  }

  /**
   * Simulate greenhouse actions
   */
  simulateGreenhouseAction(action, parameters) {
    switch (action) {
      case 'open':
        return {
          success: true,
          openingPercentage: parameters.opening_percentage || 50,
          message: `Greenhouse vents opened to ${parameters.opening_percentage || 50}%`
        };
      
      case 'close':
        return {
          success: true,
          message: 'Greenhouse vents closed'
        };
      
      case 'adjust_angle':
        return {
          success: true,
          angle: parameters.angle,
          message: `Vent angle adjusted to ${parameters.angle}°`
        };
      
      default:
        throw new Error(`Unsupported greenhouse action: ${action}`);
    }
  }

  /**
   * Simulate lighting actions
   */
  simulateLightingAction(action, parameters) {
    switch (action) {
      case 'turn_on':
        return {
          success: true,
          intensity: parameters.intensity || 80,
          spectrum: parameters.spectrum || 'Full Spectrum',
          message: `Growth lights turned on at ${parameters.intensity || 80}% intensity`
        };
      
      case 'turn_off':
        return {
          success: true,
          message: 'Growth lights turned off'
        };
      
      case 'adjust_intensity':
        return {
          success: true,
          intensity: parameters.intensity,
          message: `Light intensity adjusted to ${parameters.intensity}%`
        };
      
      default:
        throw new Error(`Unsupported lighting action: ${action}`);
    }
  }

  /**
   * Simulate tilling actions
   */
  simulateTillingAction(action, parameters) {
    switch (action) {
      case 'start':
        return {
          success: true,
          tillingDepth: parameters.tilling_depth || 15,
          speed: parameters.speed || 5,
          pattern: parameters.pattern || 'Linear',
          message: `Soil tilling started at ${parameters.tilling_depth || 15}cm depth`
        };
      
      case 'stop':
        return {
          success: true,
          message: 'Soil tilling stopped'
        };
      
      case 'adjust_depth':
        return {
          success: true,
          tillingDepth: parameters.tilling_depth,
          message: `Tilling depth adjusted to ${parameters.tilling_depth}cm`
        };
      
      default:
        throw new Error(`Unsupported tilling action: ${action}`);
    }
  }

  /**
   * Get all actuators
   */
  getAllActuators() {
    return Array.from(this.actuators.values());
  }

  /**
   * Get actuator by ID
   */
  getActuator(actuatorId) {
    return this.actuators.get(actuatorId);
  }

  /**
   * Get actuators by device ID
   */
  getActuatorsByDevice(deviceId) {
    return Array.from(this.actuators.values()).filter(
      actuator => actuator.deviceId === deviceId
    );
  }

  /**
   * Get action history
   */
  getActionHistory(limit = 100) {
    return this.actionHistory.slice(0, limit);
  }

  /**
   * Get actuator statistics
   */
  getActuatorStatistics() {
    const actuators = Array.from(this.actuators.values());
    const total = actuators.length;
    const active = actuators.filter(a => a.status.id === ACTUATOR_STATUS.ACTIVE.id).length;
    const error = actuators.filter(a => a.status.id === ACTUATOR_STATUS.ERROR.id).length;
    const maintenance = actuators.filter(a => a.status.id === ACTUATOR_STATUS.MAINTENANCE.id).length;

    const totalActions = actuators.reduce((sum, a) => sum + a.performance.totalActions, 0);
    const successfulActions = actuators.reduce((sum, a) => sum + a.performance.successfulActions, 0);
    const errorCount = actuators.reduce((sum, a) => sum + a.performance.errorCount, 0);

    return {
      total,
      active,
      error,
      maintenance,
      idle: total - active - error - maintenance,
      totalActions,
      successfulActions,
      errorCount,
      successRate: totalActions > 0 ? (successfulActions / totalActions) * 100 : 0
    };
  }

  /**
   * Update actuator configuration
   */
  updateActuatorConfig(actuatorId, config) {
    const actuator = this.actuators.get(actuatorId);
    if (actuator) {
      actuator.configuration = { ...actuator.configuration, ...config };
      actuator.lastUpdated = new Date().toISOString();
      this.notifySubscribers();
    }
  }

  /**
   * Enable/disable actuator
   */
  setActuatorStatus(actuatorId, status) {
    const actuator = this.actuators.get(actuatorId);
    if (actuator) {
      actuator.status = status;
      actuator.lastUpdated = new Date().toISOString();
      this.notifySubscribers();
    }
  }

  /**
   * Subscribe to actuator updates
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
  notifySubscribers() {
    this.subscribers.forEach(callback => {
      try {
        callback({
          actuators: Array.from(this.actuators.values()),
          statistics: this.getActuatorStatistics(),
          actionHistory: this.actionHistory.slice(0, 10)
        });
      } catch (error) {
        console.error('Error notifying actuator subscriber:', error);
      }
    });
  }

  /**
   * Generate unique actuator ID
   */
  generateActuatorId() {
    return `actuator_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique action ID
   */
  generateActionId() {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Create global actuator manager instance
export const actuatorManager = new ActuatorManager();

// Export convenience functions
export function registerActuator(actuatorData) {
  return actuatorManager.registerActuator(actuatorData);
}

export function executeActuatorAction(actuatorId, action, parameters) {
  return actuatorManager.executeAction(actuatorId, action, parameters);
}

export function getAllActuators() {
  return actuatorManager.getAllActuators();
}

export function getActuator(actuatorId) {
  return actuatorManager.getActuator(actuatorId);
}

export function getActuatorStatistics() {
  return actuatorManager.getActuatorStatistics();
}

export function subscribeToActuators(callback) {
  return actuatorManager.subscribe(callback);
}

// Initialize with sample actuators
setTimeout(() => {
  registerActuator({
    name: 'Main Irrigation Valve',
    type: 'irrigation_valve',
    deviceId: 'device_1',
    location: { lat: 30.0444, lon: 31.2357 },
    zone: 'North Field',
    maxFlowRate: 100,
    maxPressure: 50
  });

  registerActuator({
    name: 'NPK Fertilizer Dispenser',
    type: 'fertilizer_dispenser',
    deviceId: 'device_2',
    location: { lat: 30.0544, lon: 31.2457 },
    zone: 'Central Field',
    maxFlowRate: 20
  });

  registerActuator({
    name: 'Pest Control Sprayer',
    type: 'pest_sprayer',
    deviceId: 'device_3',
    location: { lat: 30.0344, lon: 31.2257 },
    zone: 'South Field',
    coverageArea: 500
  });

  registerActuator({
    name: 'Greenhouse Ventilation',
    type: 'greenhouse_vent',
    deviceId: 'device_4',
    location: { lat: 30.0644, lon: 31.2557 },
    zone: 'Greenhouse A',
    maxOpening: 100
  });

  console.log('Sample actuators initialized');
}, 2000);
