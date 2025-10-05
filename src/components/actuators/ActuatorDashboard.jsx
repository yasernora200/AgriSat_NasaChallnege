import { useState, useEffect } from 'react';
import { 
  getAllActuators, 
  executeActuatorAction, 
  getActuatorStatistics,
  subscribeToActuators,
  ACTUATOR_TYPES,
  ACTUATOR_STATUS,
  ACTION_TYPES
} from '../../services/actuatorService';

export default function ActuatorDashboard() {
  const [actuators, setActuators] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [selectedActuator, setSelectedActuator] = useState(null);
  const [showAddActuator, setShowAddActuator] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadActuators();
    loadStatistics();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToActuators(({ actuators: newActuators, statistics: newStats }) => {
      setActuators(newActuators);
      setStatistics(newStats);
    });

    return unsubscribe;
  }, []);

  const loadActuators = async () => {
    try {
      const actuatorList = await getAllActuators();
      setActuators(actuatorList);
    } catch (error) {
      console.error('Error loading actuators:', error);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await getActuatorStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleExecuteAction = async (actuatorId, action, parameters = {}) => {
    setLoading(true);
    try {
      await executeActuatorAction(actuatorId, action, parameters);
      alert('Action executed successfully!');
    } catch (error) {
      alert(`Error executing action: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      idle: 'text-gray-400',
      active: 'text-green-400',
      error: 'text-red-400',
      maintenance: 'text-yellow-400',
      disabled: 'text-gray-600'
    };
    return colors[status] || 'text-gray-400';
  };

  const getStatusIcon = (status) => {
    const icons = {
      idle: '⚪',
      active: '🟢',
      error: '🔴',
      maintenance: '🟡',
      disabled: '⚫'
    };
    return icons[status] || '⚪';
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black via-green-950 to-black text-white">
      {/* Header */}
      <div className="p-6 border-b border-green-900/30">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-green-400">🎛️ Actuator Control Center</h1>
            <p className="text-gray-400 mt-1">Automated agricultural equipment control</p>
          </div>
          <button
            onClick={() => setShowAddActuator(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Actuator
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="p-6 border-b border-green-900/30">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatCard
            title="Total Actuators"
            value={statistics.total || 0}
            icon="🎛️"
            color="blue"
          />
          <StatCard
            title="Active"
            value={statistics.active || 0}
            icon="🟢"
            color="green"
          />
          <StatCard
            title="Errors"
            value={statistics.error || 0}
            icon="🔴"
            color="red"
          />
          <StatCard
            title="Maintenance"
            value={statistics.maintenance || 0}
            icon="🟡"
            color="yellow"
          />
          <StatCard
            title="Success Rate"
            value={`${(statistics.successRate || 0).toFixed(1)}%`}
            icon="📊"
            color="purple"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Actuator List */}
        <div className="w-1/3 border-r border-green-900/30 p-6">
          <h2 className="text-lg font-semibold mb-4 text-green-400">Actuators</h2>
          <div className="space-y-3">
            {actuators.map(actuator => {
              const actuatorType = ACTUATOR_TYPES[actuator.type.toUpperCase()];
              return (
                <div
                  key={actuator.id}
                  onClick={() => setSelectedActuator(actuator)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedActuator?.id === actuator.id
                      ? 'border-green-500 bg-green-900/20'
                      : 'border-gray-700 hover:border-green-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{actuatorType?.icon || '🎛️'}</span>
                      <span className="font-medium text-sm">{actuator.name}</span>
                    </div>
                    <span className={`text-sm ${getStatusColor(actuator.status.id)}`}>
                      {getStatusIcon(actuator.status.id)}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-400 space-y-1">
                    <p>Type: {actuatorType?.name || actuator.type}</p>
                    <p>Zone: {actuator.zone}</p>
                    <p>Status: {actuator.status.name}</p>
                    {actuator.currentAction && (
                      <p className="text-yellow-400">Action: {actuator.currentAction.action}</p>
                    )}
                  </div>
                </div>
              );
            })}
            
            {actuators.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p>No actuators registered</p>
                <p className="text-xs mt-1">Click "Add Actuator" to register equipment</p>
              </div>
            )}
          </div>
        </div>

        {/* Actuator Details & Control */}
        <div className="flex-1 p-6">
          {selectedActuator ? (
            <ActuatorDetails 
              actuator={selectedActuator}
              onExecuteAction={handleExecuteAction}
              loading={loading}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <div className="text-6xl mb-4">🎛️</div>
                <h3 className="text-xl font-semibold mb-2">Actuator Control Center</h3>
                <p>Select an actuator from the list to view details and control actions</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Actuator Modal */}
      {showAddActuator && (
        <AddActuatorModal 
          onAdd={(actuatorData) => {
            // In a real app, this would call the registerActuator function
            console.log('Adding actuator:', actuatorData);
            setShowAddActuator(false);
          }}
          onClose={() => setShowAddActuator(false)}
        />
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: 'border-blue-500 bg-blue-900/20',
    green: 'border-green-500 bg-green-900/20',
    red: 'border-red-500 bg-red-900/20',
    yellow: 'border-yellow-500 bg-yellow-900/20',
    purple: 'border-purple-500 bg-purple-900/20'
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color] || colorClasses.blue}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

// Actuator Details Component
function ActuatorDetails({ actuator, onExecuteAction, loading }) {
  const actuatorType = ACTUATOR_TYPES[actuator.type.toUpperCase()];
  const [actionParameters, setActionParameters] = useState({});

  const handleAction = async (action) => {
    const parameters = actionParameters[action] || {};
    await onExecuteAction(actuator.id, action, parameters);
  };

  const updateParameter = (action, param, value) => {
    setActionParameters(prev => ({
      ...prev,
      [action]: {
        ...prev[action],
        [param]: value
      }
    }));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Actuator Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-2xl">{actuatorType?.icon || '🎛️'}</span>
          <div>
            <h2 className="text-xl font-bold">{actuator.name}</h2>
            <p className="text-sm text-gray-400">{actuatorType?.name || actuator.type}</p>
          </div>
          <div className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
            actuator.status.id === 'active' ? 'bg-green-600' :
            actuator.status.id === 'error' ? 'bg-red-600' :
            actuator.status.id === 'maintenance' ? 'bg-yellow-600' : 'bg-gray-600'
          }`}>
            {actuator.status.name}
          </div>
        </div>
        <p className="text-gray-300 text-sm">{actuator.description}</p>
      </div>

      {/* Actuator Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-green-400">📊 Device Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Device ID:</span>
              <span className="font-mono text-xs">{actuator.deviceId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Zone:</span>
              <span>{actuator.zone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Location:</span>
              <span>{actuator.location?.lat?.toFixed(4)}, {actuator.location?.lon?.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Created:</span>
              <span>{new Date(actuator.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-green-400">📈 Performance</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Actions:</span>
              <span>{actuator.performance.totalActions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Successful:</span>
              <span className="text-green-400">{actuator.performance.successfulActions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Errors:</span>
              <span className="text-red-400">{actuator.performance.errorCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Success Rate:</span>
              <span className="text-green-400">
                {actuator.performance.totalActions > 0 
                  ? ((actuator.performance.successfulActions / actuator.performance.totalActions) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-4 text-green-400">🎮 Action Controls</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actuatorType?.supportedActions.map(action => (
            <ActionCard
              key={action}
              actuator={actuator}
              action={action}
              parameters={actionParameters[action] || {}}
              onExecute={() => handleAction(action)}
              onParameterChange={(param, value) => updateParameter(action, param, value)}
              loading={loading}
            />
          ))}
        </div>
      </div>

      {/* Current Action Status */}
      {actuator.currentAction && (
        <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500 rounded-lg">
          <h4 className="text-yellow-400 font-semibold mb-2">⚡ Current Action</h4>
          <p className="text-sm">
            <span className="font-medium">{actuator.currentAction.action}</span>
            {actuator.currentAction.status === 'executing' && (
              <span className="ml-2 text-yellow-400">(Executing...)</span>
            )}
          </p>
          {actuator.currentAction.parameters && Object.keys(actuator.currentAction.parameters).length > 0 && (
            <div className="mt-2 text-xs text-gray-400">
              <p>Parameters:</p>
              <ul className="list-disc list-inside ml-2">
                {Object.entries(actuator.currentAction.parameters).map(([key, value]) => (
                  <li key={key}>{key}: {value}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Action Card Component
function ActionCard({ actuator, action, parameters, onExecute, onParameterChange, loading }) {
  const getActionIcon = (action) => {
    const icons = {
      open: '🔓',
      close: '🔒',
      start: '▶️',
      stop: '⏹️',
      spray: '💨',
      dispense: '🌿',
      turn_on: '💡',
      turn_off: '🔌',
      adjust_flow: '🔧',
      adjust_rate: '⚙️',
      adjust_coverage: '📏',
      adjust_intensity: '💡',
      adjust_depth: '📐',
      adjust_angle: '📐'
    };
    return icons[action] || '⚡';
  };

  const getActionColor = (action) => {
    if (['start', 'open', 'turn_on', 'spray', 'dispense'].includes(action)) return 'green';
    if (['stop', 'close', 'turn_off'].includes(action)) return 'red';
    return 'blue';
  };

  const color = getActionColor(action);
  const colorClasses = {
    green: 'border-green-500 bg-green-900/20 hover:bg-green-900/30',
    red: 'border-red-500 bg-red-900/20 hover:bg-red-900/30',
    blue: 'border-blue-500 bg-blue-900/20 hover:bg-blue-900/30'
  };

  const getParameterInputs = () => {
    const actuatorType = ACTUATOR_TYPES[actuator.type.toUpperCase()];
    const paramTypes = actuatorType?.parameters || [];
    
    return paramTypes.map(param => {
      switch (param) {
        case 'flow_rate':
          return (
            <input
              key={param}
              type="number"
              placeholder="Flow Rate (L/min)"
              value={parameters[param] || ''}
              onChange={(e) => onParameterChange(param, parseFloat(e.target.value))}
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
            />
          );
        case 'duration':
          return (
            <input
              key={param}
              type="number"
              placeholder="Duration (minutes)"
              value={parameters[param] || ''}
              onChange={(e) => onParameterChange(param, parseInt(e.target.value))}
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
            />
          );
        case 'pressure':
          return (
            <input
              key={param}
              type="number"
              placeholder="Pressure (PSI)"
              value={parameters[param] || ''}
              onChange={(e) => onParameterChange(param, parseFloat(e.target.value))}
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
            />
          );
        case 'volume':
          return (
            <input
              key={param}
              type="number"
              placeholder="Volume (L)"
              value={parameters[param] || ''}
              onChange={(e) => onParameterChange(param, parseFloat(e.target.value))}
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
            />
          );
        case 'application_rate':
          return (
            <input
              key={param}
              type="number"
              placeholder="Rate (L/ha)"
              value={parameters[param] || ''}
              onChange={(e) => onParameterChange(param, parseFloat(e.target.value))}
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
            />
          );
        case 'intensity':
          return (
            <input
              key={param}
              type="number"
              min="0"
              max="100"
              placeholder="Intensity (%)"
              value={parameters[param] || ''}
              onChange={(e) => onParameterChange(param, parseInt(e.target.value))}
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
            />
          );
        default:
          return null;
      }
    });
  };

  return (
    <div className={`p-4 rounded-lg border transition-colors ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getActionIcon(action)}</span>
          <span className="font-medium capitalize">{action.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Parameter Inputs */}
      <div className="space-y-2 mb-3">
        {getParameterInputs()}
      </div>

      <button
        onClick={onExecute}
        disabled={loading || actuator.status.id === 'disabled'}
        className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 ${
          color === 'green' ? 'bg-green-600 hover:bg-green-500' :
          color === 'red' ? 'bg-red-600 hover:bg-red-500' :
          'bg-blue-600 hover:bg-blue-500'
        }`}
      >
        {loading ? 'Executing...' : `Execute ${action.replace('_', ' ')}`}
      </button>
    </div>
  );
}

// Add Actuator Modal Component
function AddActuatorModal({ onAdd, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'irrigation_valve',
    deviceId: '',
    zone: '',
    location: { lat: '', lon: '' },
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.type || !formData.deviceId) {
      alert('Please fill in all required fields');
      return;
    }

    const actuatorData = {
      ...formData,
      location: {
        lat: parseFloat(formData.location.lat),
        lon: parseFloat(formData.location.lon)
      }
    };

    onAdd(actuatorData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg border border-green-800 p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4 text-green-400">Add New Actuator</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Actuator Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              placeholder="Enter actuator name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Actuator Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
            >
              {Object.values(ACTUATOR_TYPES).map(type => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Device ID</label>
            <input
              type="text"
              value={formData.deviceId}
              onChange={(e) => setFormData({...formData, deviceId: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              placeholder="Associated device ID"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Zone</label>
            <input
              type="text"
              value={formData.zone}
              onChange={(e) => setFormData({...formData, zone: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              placeholder="Field zone or area"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.location.lat}
                onChange={(e) => setFormData({
                  ...formData, 
                  location: {...formData.location, lat: e.target.value}
                })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                placeholder="0.0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={formData.location.lon}
                onChange={(e) => setFormData({
                  ...formData, 
                  location: {...formData.location, lon: e.target.value}
                })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                placeholder="0.0000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              placeholder="Enter actuator description"
              rows={3}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors"
            >
              Add Actuator
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
