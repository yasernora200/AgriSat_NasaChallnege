import { useState, useEffect } from 'react';
import { 
  getAllRules, 
  createAutomationRule, 
  toggleRule, 
  deleteRule,
  getStatistics,
  subscribeToAutomation,
  RULE_TYPES,
  TRIGGER_CONDITIONS
} from '../../services/automationService';
import { getAllActuators } from '../../services/actuatorService';

export default function AutomationRules() {
  const [rules, setRules] = useState([]);
  const [actuators, setActuators] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [showAddRule, setShowAddRule] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);

  useEffect(() => {
    loadData();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToAutomation(({ rules: newRules, statistics: newStats }) => {
      setRules(newRules);
      setStatistics(newStats);
    });

    return unsubscribe;
  }, []);

  const loadData = async () => {
    try {
      const [rulesData, actuatorsData, statsData] = await Promise.all([
        getAllRules(),
        getAllActuators(),
        getStatistics()
      ]);
      
      setRules(rulesData);
      setActuators(actuatorsData);
      setStatistics(statsData);
    } catch (error) {
      console.error('Error loading automation data:', error);
    }
  };

  const handleToggleRule = async (ruleId) => {
    try {
      toggleRule(ruleId);
    } catch (error) {
      console.error('Error toggling rule:', error);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (window.confirm('Are you sure you want to delete this automation rule?')) {
      try {
        deleteRule(ruleId);
      } catch (error) {
        console.error('Error deleting rule:', error);
      }
    }
  };

  const getRuleTypeIcon = (type) => {
    const icons = {
      threshold: '📊',
      schedule: '⏰',
      sequence: '🔄',
      conditional: '🔀'
    };
    return icons[type] || '⚡';
  };

  const getRuleStatusColor = (enabled) => {
    return enabled ? 'text-green-400' : 'text-gray-400';
  };

  return (
    <div className="bg-black/40 rounded-lg border border-green-800 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-400">🤖 Automation Rules</h2>
        <button
          onClick={() => setShowAddRule(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors"
        >
          + Add Rule
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Rules</p>
              <p className="text-2xl font-bold text-white">{statistics.total || 0}</p>
            </div>
            <span className="text-2xl">🤖</span>
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Rules</p>
              <p className="text-2xl font-bold text-green-400">{statistics.enabled || 0}</p>
            </div>
            <span className="text-2xl">🟢</span>
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Executions</p>
              <p className="text-2xl font-bold text-blue-400">{statistics.totalExecutions || 0}</p>
            </div>
            <span className="text-2xl">⚡</span>
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Success Rate</p>
              <p className="text-2xl font-bold text-purple-400">
                {(statistics.successRate || 0).toFixed(1)}%
              </p>
            </div>
            <span className="text-2xl">📊</span>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map(rule => (
          <div
            key={rule.id}
            className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-xl">{getRuleTypeIcon(rule.type)}</span>
                <div>
                  <h3 className="text-lg font-semibold text-white">{rule.name}</h3>
                  <p className="text-sm text-gray-400">{rule.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${getRuleStatusColor(rule.enabled)}`}>
                  {rule.enabled ? 'Enabled' : 'Disabled'}
                </span>
                <button
                  onClick={() => handleToggleRule(rule.id)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    rule.enabled 
                      ? 'bg-red-600 hover:bg-red-500' 
                      : 'bg-green-600 hover:bg-green-500'
                  }`}
                >
                  {rule.enabled ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => setSelectedRule(rule)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs font-medium transition-colors"
                >
                  View
                </button>
                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-xs font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Type:</p>
                <p className="text-white">{RULE_TYPES[rule.type]?.name || rule.type}</p>
              </div>
              <div>
                <p className="text-gray-400">Executions:</p>
                <p className="text-white">{rule.executionCount}</p>
              </div>
              <div>
                <p className="text-gray-400">Last Executed:</p>
                <p className="text-white">
                  {rule.lastExecuted 
                    ? new Date(rule.lastExecuted).toLocaleString()
                    : 'Never'
                  }
                </p>
              </div>
            </div>

            {/* Rule Details */}
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="text-xs text-gray-400">
                <p><strong>Device:</strong> {rule.deviceId}</p>
                {rule.sensorType && <p><strong>Sensor:</strong> {rule.sensorType}</p>}
                {rule.condition && (
                  <p><strong>Condition:</strong> {rule.condition.condition} {rule.condition.threshold}</p>
                )}
                <p><strong>Actions:</strong> {rule.actions.length} action(s)</p>
              </div>
            </div>
          </div>
        ))}

        {rules.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">🤖</div>
            <p>No automation rules configured</p>
            <p className="text-xs mt-1">Create rules to automate actions based on sensor data</p>
          </div>
        )}
      </div>

      {/* Add Rule Modal */}
      {showAddRule && (
        <AddRuleModal 
          actuators={actuators}
          onAdd={(ruleData) => {
            createAutomationRule(ruleData);
            setShowAddRule(false);
          }}
          onClose={() => setShowAddRule(false)}
        />
      )}

      {/* Rule Details Modal */}
      {selectedRule && (
        <RuleDetailsModal 
          rule={selectedRule}
          actuators={actuators}
          onClose={() => setSelectedRule(null)}
        />
      )}
    </div>
  );
}

// Add Rule Modal Component
function AddRuleModal({ actuators, onAdd, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'threshold',
    deviceId: '',
    sensorType: '',
    condition: {
      condition: 'less_than',
      threshold: 30
    },
    actions: [{
      id: 'action_1',
      actuatorId: '',
      action: '',
      parameters: {}
    }],
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.deviceId || formData.actions.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    onAdd(formData);
  };

  const addAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, {
        id: `action_${Date.now()}`,
        actuatorId: '',
        action: '',
        parameters: {}
      }]
    }));
  };

  const removeAction = (actionId) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter(action => action.id !== actionId)
    }));
  };

  const updateAction = (actionId, updates) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.map(action => 
        action.id === actionId ? { ...action, ...updates } : action
      )
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg border border-green-800 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4 text-green-400">Add Automation Rule</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rule Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                placeholder="Enter rule name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Rule Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              >
                {Object.values(RULE_TYPES).map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Device ID</label>
              <input
                type="text"
                value={formData.deviceId}
                onChange={(e) => setFormData({...formData, deviceId: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                placeholder="Target device ID"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sensor Type</label>
              <input
                type="text"
                value={formData.sensorType}
                onChange={(e) => setFormData({...formData, sensorType: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                placeholder="moisture, temperature, etc."
              />
            </div>
          </div>

          {/* Condition Settings */}
          {formData.type === 'threshold' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Condition</label>
                <select
                  value={formData.condition.condition}
                  onChange={(e) => setFormData({
                    ...formData,
                    condition: { ...formData.condition, condition: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                >
                  <option value="greater_than">Greater than</option>
                  <option value="less_than">Less than</option>
                  <option value="equals">Equals</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Threshold</label>
                <input
                  type="number"
                  step="any"
                  value={formData.condition.threshold}
                  onChange={(e) => setFormData({
                    ...formData,
                    condition: { ...formData.condition, threshold: parseFloat(e.target.value) }
                  })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  placeholder="Threshold value"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Actions</label>
              <button
                type="button"
                onClick={addAction}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs transition-colors"
              >
                + Add Action
              </button>
            </div>

            <div className="space-y-3">
              {formData.actions.map((action, index) => (
                <div key={action.id} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Action {index + 1}</span>
                    {formData.actions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAction(action.id)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Actuator</label>
                      <select
                        value={action.actuatorId}
                        onChange={(e) => updateAction(action.id, { actuatorId: e.target.value })}
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                        required
                      >
                        <option value="">Select actuator</option>
                        {actuators.map(actuator => (
                          <option key={actuator.id} value={actuator.id}>
                            {actuator.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1">Action</label>
                      <input
                        type="text"
                        value={action.action}
                        onChange={(e) => updateAction(action.id, { action: e.target.value })}
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                        placeholder="open, close, spray, etc."
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              placeholder="Describe what this rule does"
              rows={3}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors"
            >
              Create Rule
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Rule Details Modal Component
function RuleDetailsModal({ rule, actuators, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg border border-green-800 p-6 w-full max-w-2xl">
        <h3 className="text-lg font-bold mb-4 text-green-400">Rule Details</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-white mb-2">{rule.name}</h4>
            <p className="text-gray-400 text-sm">{rule.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Type:</p>
              <p className="text-white">{RULE_TYPES[rule.type]?.name}</p>
            </div>
            <div>
              <p className="text-gray-400">Status:</p>
              <p className={`${rule.enabled ? 'text-green-400' : 'text-gray-400'}`}>
                {rule.enabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Device:</p>
              <p className="text-white">{rule.deviceId}</p>
            </div>
            <div>
              <p className="text-gray-400">Executions:</p>
              <p className="text-white">{rule.executionCount}</p>
            </div>
          </div>

          {rule.condition && (
            <div>
              <h5 className="font-semibold text-white mb-2">Condition</h5>
              <div className="bg-gray-800/50 rounded p-3 text-sm">
                <p><strong>Sensor:</strong> {rule.sensorType}</p>
                <p><strong>Condition:</strong> {rule.condition.condition}</p>
                <p><strong>Threshold:</strong> {rule.condition.threshold}</p>
              </div>
            </div>
          )}

          <div>
            <h5 className="font-semibold text-white mb-2">Actions ({rule.actions.length})</h5>
            <div className="space-y-2">
              {rule.actions.map((action, index) => {
                const actuator = actuators.find(a => a.id === action.actuatorId);
                return (
                  <div key={action.id} className="bg-gray-800/50 rounded p-3 text-sm">
                    <p><strong>Action {index + 1}:</strong> {action.action}</p>
                    <p><strong>Actuator:</strong> {actuator?.name || 'Unknown'}</p>
                    {action.parameters && Object.keys(action.parameters).length > 0 && (
                      <div>
                        <p><strong>Parameters:</strong></p>
                        <ul className="list-disc list-inside ml-4">
                          {Object.entries(action.parameters).map(([key, value]) => (
                            <li key={key}>{key}: {value}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
