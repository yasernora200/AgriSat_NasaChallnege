/**
 * Automation Service
 * Manages automated actions based on IoT sensor data and predefined rules
 */

import { executeActuatorAction } from './actuatorService';
import { createAlert } from './advancedAlertService';

/**
 * Automation Rule Types
 */
export const RULE_TYPES = {
  THRESHOLD: {
    id: 'threshold',
    name: 'Threshold Rule',
    description: 'Trigger action when sensor value crosses threshold'
  },
  SCHEDULE: {
    id: 'schedule',
    name: 'Schedule Rule',
    description: 'Execute action at specific times'
  },
  SEQUENCE: {
    id: 'sequence',
    name: 'Sequence Rule',
    description: 'Execute multiple actions in sequence'
  },
  CONDITIONAL: {
    id: 'conditional',
    name: 'Conditional Rule',
    description: 'Execute action based on multiple conditions'
  }
};

/**
 * Trigger Conditions
 */
export const TRIGGER_CONDITIONS = {
  GREATER_THAN: 'greater_than',
  LESS_THAN: 'less_than',
  EQUALS: 'equals',
  BETWEEN: 'between',
  CHANGED_BY: 'changed_by'
};

/**
 * Automation Rule Manager Class
 */
class AutomationManager {
  constructor() {
    this.rules = new Map();
    this.activeRules = new Set();
    this.executionHistory = [];
    this.subscribers = [];
    this.isProcessing = false;
  }

  /**
   * Create a new automation rule
   */
  createRule(ruleData) {
    const rule = {
      id: this.generateRuleId(),
      ...ruleData,
      enabled: true,
      createdAt: new Date().toISOString(),
      lastExecuted: null,
      executionCount: 0,
      successCount: 0,
      errorCount: 0
    };

    this.rules.set(rule.id, rule);
    this.notifySubscribers();
    
    console.log('Automation rule created:', rule);
    return rule;
  }

  /**
   * Execute rules based on sensor data
   */
  async processSensorData(deviceId, sensorData) {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    try {
      // Find applicable rules
      const applicableRules = this.getApplicableRules(deviceId, sensorData);
      
      // Execute matching rules
      for (const rule of applicableRules) {
        if (rule.enabled && this.shouldExecuteRule(rule, sensorData)) {
          await this.executeRule(rule, sensorData);
        }
      }
    } catch (error) {
      console.error('Error processing sensor data:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get rules applicable to a device
   */
  getApplicableRules(deviceId, sensorData) {
    return Array.from(this.rules.values()).filter(rule => 
      rule.enabled && (
        rule.deviceId === deviceId || 
        rule.sensorType && Object.keys(sensorData.sensors).includes(rule.sensorType)
      )
    );
  }

  /**
   * Check if rule should execute based on conditions
   */
  shouldExecuteRule(rule, sensorData) {
    switch (rule.type) {
      case RULE_TYPES.THRESHOLD.id:
        return this.checkThresholdCondition(rule, sensorData);
      
      case RULE_TYPES.SCHEDULE.id:
        return this.checkScheduleCondition(rule);
      
      case RULE_TYPES.CONDITIONAL.id:
        return this.checkConditionalRule(rule, sensorData);
      
      default:
        return false;
    }
  }

  /**
   * Check threshold condition
   */
  checkThresholdCondition(rule, sensorData) {
    const sensorValue = sensorData.sensors?.[rule.sensorType]?.value;
    if (sensorValue === undefined) return false;

    const threshold = rule.condition.threshold;
    const condition = rule.condition.condition;

    switch (condition) {
      case TRIGGER_CONDITIONS.GREATER_THAN:
        return sensorValue > threshold;
      
      case TRIGGER_CONDITIONS.LESS_THAN:
        return sensorValue < threshold;
      
      case TRIGGER_CONDITIONS.EQUALS:
        return Math.abs(sensorValue - threshold) < 0.01;
      
      case TRIGGER_CONDITIONS.BETWEEN:
        return sensorValue >= threshold.min && sensorValue <= threshold.max;
      
      default:
        return false;
    }
  }

  /**
   * Check schedule condition
   */
  checkScheduleCondition(rule) {
    const now = new Date();
    const schedule = rule.schedule;
    
    // Check if current time matches schedule
    if (schedule.type === 'daily') {
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const scheduleTime = schedule.hour * 60 + schedule.minute;
      
      // Execute if within 1 minute of scheduled time and not already executed today
      const timeDiff = Math.abs(currentTime - scheduleTime);
      const lastExecuted = new Date(rule.lastExecuted);
      const today = new Date().toDateString();
      
      return timeDiff <= 1 && lastExecuted.toDateString() !== today;
    }
    
    return false;
  }

  /**
   * Check conditional rule
   */
  checkConditionalRule(rule, sensorData) {
    return rule.conditions.every(condition => {
      const sensorValue = sensorData.sensors?.[condition.sensorType]?.value;
      if (sensorValue === undefined) return false;

      switch (condition.condition) {
        case TRIGGER_CONDITIONS.GREATER_THAN:
          return sensorValue > condition.threshold;
        case TRIGGER_CONDITIONS.LESS_THAN:
          return sensorValue < condition.threshold;
        default:
          return false;
      }
    });
  }

  /**
   * Execute automation rule
   */
  async executeRule(rule, sensorData) {
    const executionRecord = {
      id: this.generateExecutionId(),
      ruleId: rule.id,
      ruleName: rule.name,
      timestamp: new Date().toISOString(),
      triggerData: sensorData,
      actions: [],
      status: 'executing',
      error: null
    };

    try {
      // Execute actions
      if (rule.type === RULE_TYPES.SEQUENCE.id) {
        // Execute actions in sequence
        for (const action of rule.actions) {
          const result = await this.executeAction(action, sensorData);
          executionRecord.actions.push(result);
          
          // Add delay between actions if specified
          if (action.delay && action.delay > 0) {
            await new Promise(resolve => setTimeout(resolve, action.delay * 1000));
          }
        }
      } else {
        // Execute single action or parallel actions
        const actionPromises = rule.actions.map(action => 
          this.executeAction(action, sensorData)
        );
        
        const results = await Promise.all(actionPromises);
        executionRecord.actions = results;
      }

      // Update rule statistics
      rule.lastExecuted = new Date().toISOString();
      rule.executionCount++;
      rule.successCount++;

      executionRecord.status = 'completed';

      // Create success notification
      createAlert({
        type: 'automation_executed',
        severity: 'LOW',
        deviceId: rule.deviceId,
        data: {
          ruleName: rule.name,
          actions: rule.actions.length,
          sensorData: sensorData
        }
      });

      console.log(`Automation rule executed successfully: ${rule.name}`);

    } catch (error) {
      // Handle execution error
      rule.errorCount++;
      executionRecord.status = 'failed';
      executionRecord.error = error.message;

      // Create error notification
      createAlert({
        type: 'automation_error',
        severity: 'MEDIUM',
        deviceId: rule.deviceId,
        data: {
          ruleName: rule.name,
          error: error.message
        }
      });

      console.error(`Automation rule execution failed: ${rule.name}`, error);
    }

    // Store execution history
    this.executionHistory.unshift(executionRecord);
    if (this.executionHistory.length > 1000) {
      this.executionHistory = this.executionHistory.slice(0, 1000);
    }

    this.notifySubscribers();
    return executionRecord;
  }

  /**
   * Execute individual action
   */
  async executeAction(action, sensorData) {
    try {
      // Prepare action parameters
      const parameters = { ...action.parameters };
      
      // Replace placeholders with sensor values
      Object.keys(parameters).forEach(key => {
        const value = parameters[key];
        if (typeof value === 'string' && value.startsWith('${')) {
          const sensorName = value.slice(2, -1);
          const sensorValue = sensorData.sensors?.[sensorName]?.value;
          if (sensorValue !== undefined) {
            parameters[key] = sensorValue;
          }
        }
      });

      // Execute actuator action
      const result = await executeActuatorAction(
        action.actuatorId,
        action.action,
        parameters
      );

      return {
        actionId: action.id,
        actuatorId: action.actuatorId,
        action: action.action,
        parameters,
        result,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };

    } catch (error) {
      return {
        actionId: action.id,
        actuatorId: action.actuatorId,
        action: action.action,
        parameters: action.parameters,
        error: error.message,
        timestamp: new Date().toISOString(),
        status: 'failed'
      };
    }
  }

  /**
   * Get all rules
   */
  getAllRules() {
    return Array.from(this.rules.values());
  }

  /**
   * Get rule by ID
   */
  getRule(ruleId) {
    return this.rules.get(ruleId);
  }

  /**
   * Update rule
   */
  updateRule(ruleId, updates) {
    const rule = this.rules.get(ruleId);
    if (rule) {
      Object.assign(rule, updates);
      rule.lastUpdated = new Date().toISOString();
      this.notifySubscribers();
    }
  }

  /**
   * Enable/disable rule
   */
  toggleRule(ruleId) {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = !rule.enabled;
      rule.lastUpdated = new Date().toISOString();
      this.notifySubscribers();
    }
  }

  /**
   * Delete rule
   */
  deleteRule(ruleId) {
    this.rules.delete(ruleId);
    this.notifySubscribers();
  }

  /**
   * Get execution history
   */
  getExecutionHistory(limit = 100) {
    return this.executionHistory.slice(0, limit);
  }

  /**
   * Get automation statistics
   */
  getStatistics() {
    const rules = Array.from(this.rules.values());
    const total = rules.length;
    const enabled = rules.filter(r => r.enabled).length;
    const disabled = total - enabled;

    const totalExecutions = rules.reduce((sum, r) => sum + r.executionCount, 0);
    const totalSuccesses = rules.reduce((sum, r) => sum + r.successCount, 0);
    const totalErrors = rules.reduce((sum, r) => sum + r.errorCount, 0);

    return {
      total,
      enabled,
      disabled,
      totalExecutions,
      totalSuccesses,
      totalErrors,
      successRate: totalExecutions > 0 ? (totalSuccesses / totalExecutions) * 100 : 0
    };
  }

  /**
   * Subscribe to automation updates
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
          rules: Array.from(this.rules.values()),
          statistics: this.getStatistics(),
          executionHistory: this.executionHistory.slice(0, 10)
        });
      } catch (error) {
        console.error('Error notifying automation subscriber:', error);
      }
    });
  }

  /**
   * Generate unique rule ID
   */
  generateRuleId() {
    return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique execution ID
   */
  generateExecutionId() {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Create global automation manager instance
export const automationManager = new AutomationManager();

// Export convenience functions
export function createAutomationRule(ruleData) {
  return automationManager.createRule(ruleData);
}

export function processSensorData(deviceId, sensorData) {
  return automationManager.processSensorData(deviceId, sensorData);
}

export function getAllRules() {
  return automationManager.getAllRules();
}

export function toggleRule(ruleId) {
  return automationManager.toggleRule(ruleId);
}

export function getStatistics() {
  return automationManager.getStatistics();
}

export function subscribeToAutomation(callback) {
  return automationManager.subscribe(callback);
}

export function deleteRule(ruleId) {
  return automationManager.deleteRule(ruleId);
}

// Initialize with sample automation rules
setTimeout(() => {
  // Irrigation rule: Water when soil moisture is below 30%
  createAutomationRule({
    name: 'Auto Irrigation - Low Soil Moisture',
    type: RULE_TYPES.THRESHOLD.id,
    deviceId: 'device_1',
    sensorType: 'moisture',
    condition: {
      condition: TRIGGER_CONDITIONS.LESS_THAN,
      threshold: 30
    },
    actions: [{
      id: 'irrigation_action_1',
      actuatorId: 'actuator_1', // Main Irrigation Valve
      action: 'open',
      parameters: {
        flow_rate: 50,
        duration: 30,
        pressure: 35
      }
    }],
    description: 'Automatically irrigate when soil moisture drops below 30%'
  });

  // Fertilizer rule: Apply fertilizer when nitrogen is low
  createAutomationRule({
    name: 'Auto Fertilizer - Low Nitrogen',
    type: RULE_TYPES.THRESHOLD.id,
    deviceId: 'device_2',
    sensorType: 'nitrogen',
    condition: {
      condition: TRIGGER_CONDITIONS.LESS_THAN,
      threshold: 20
    },
    actions: [{
      id: 'fertilizer_action_1',
      actuatorId: 'actuator_2', // NPK Fertilizer Dispenser
      action: 'dispense',
      parameters: {
        volume: 15,
        application_rate: 8,
        type: 'NPK'
      }
    }],
    description: 'Apply fertilizer when soil nitrogen levels are low'
  });

  // Pest control rule: Spray when humidity and temperature are high
  createAutomationRule({
    name: 'Auto Pest Control - High Humidity & Temperature',
    type: RULE_TYPES.CONDITIONAL.id,
    deviceId: 'device_3',
    conditions: [
      {
        sensorType: 'humidity',
        condition: TRIGGER_CONDITIONS.GREATER_THAN,
        threshold: 70
      },
      {
        sensorType: 'temperature',
        condition: TRIGGER_CONDITIONS.GREATER_THAN,
        threshold: 25
      }
    ],
    actions: [{
      id: 'pest_control_action_1',
      actuatorId: 'actuator_3', // Pest Control Sprayer
      action: 'spray',
      parameters: {
        coverage_area: 100,
        spray_rate: 2,
        chemical_type: 'Organic'
      }
    }],
    description: 'Spray organic pest control when humidity and temperature are high'
  });

  // Scheduled rule: Daily greenhouse ventilation
  createAutomationRule({
    name: 'Daily Greenhouse Ventilation',
    type: RULE_TYPES.SCHEDULE.id,
    deviceId: 'device_4',
    schedule: {
      type: 'daily',
      hour: 8,
      minute: 0
    },
    actions: [{
      id: 'ventilation_action_1',
      actuatorId: 'actuator_4', // Greenhouse Ventilation
      action: 'open',
      parameters: {
        opening_percentage: 50,
        duration: 120
      }
    }],
    description: 'Open greenhouse vents daily at 8:00 AM'
  });

  console.log('Sample automation rules initialized');
}, 3000);
