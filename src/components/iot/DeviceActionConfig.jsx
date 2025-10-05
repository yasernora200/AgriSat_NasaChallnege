import { useState, useEffect } from 'react';
import { ACTION_TYPES } from '../../services/iotDeviceService';

export default function DeviceActionConfig({ device, onSave }) {
  const [actions, setActions] = useState(device.configuration?.actions || []);
  const [showAddAction, setShowAddAction] = useState(false);
  const [editingAction, setEditingAction] = useState(null);

  useEffect(() => {
    setActions(device.configuration?.actions || []);
  }, [device]);

  const handleAddAction = (newAction) => {
    const action = {
      id: `action_${Date.now()}`,
      ...newAction,
      enabled: true
    };
    
    setActions([...actions, action]);
    setShowAddAction(false);
  };

  const handleUpdateAction = (actionId, updatedAction) => {
    setActions(actions.map(action => 
      action.id === actionId ? { ...action, ...updatedAction } : action
    ));
    setEditingAction(null);
  };

  const handleDeleteAction = (actionId) => {
    setActions(actions.filter(action => action.id !== actionId));
  };

  const handleToggleAction = (actionId) => {
    setActions(actions.map(action => 
      action.id === actionId ? { ...action, enabled: !action.enabled } : action
    ));
  };

  const handleSave = () => {
    onSave({ ...device.configuration, actions });
  };

  const getSensorOptions = () => {
    const deviceType = device.type;
    const sensorMap = {
      soil_sensor: ['moisture', 'temperature', 'ph', 'nitrogen', 'phosphorus', 'potassium'],
      weather_station: ['temperature', 'humidity', 'pressure', 'wind_speed', 'rainfall'],
      irrigation_controller: ['water_flow', 'valve_status', 'pressure'],
      crop_monitor: ['ndvi', 'leaf_temperature', 'growth_stage']
    };
    
    return sensorMap[deviceType] || [];
  };

  return (
    <div className="bg-black/40 rounded-lg border border-green-800 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-green-400">⚙️ Action Configuration</h3>
        <button
          onClick={() => setShowAddAction(true)}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium transition-colors"
        >
          + Add Action
        </button>
      </div>

      {/* Actions List */}
      <div className="space-y-3 mb-4">
        {actions.map(action => (
          <div key={action.id} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{ACTION_TYPES[action.type]?.icon || '⚡'}</span>
                <span className="font-medium">{ACTION_TYPES[action.type]?.name || action.type}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  action.enabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                }`}>
                  {action.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingAction(action)}
                  className="px-2 py-1 bg-yellow-600 hover:bg-yellow-500 rounded text-xs transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleAction(action.id)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    action.enabled ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'
                  }`}
                >
                  {action.enabled ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => handleDeleteAction(action.id)}
                  className="px-2 py-1 bg-red-600 hover:bg-red-500 rounded text-xs transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div className="text-sm text-gray-400 space-y-1">
              <p>Sensor: <span className="text-white">{action.sensor}</span></p>
              <p>Condition: <span className="text-white">{action.condition.replace('_', ' ')}</span></p>
              <p>Threshold: <span className="text-white">{action.threshold}</span></p>
              {action.description && (
                <p>Description: <span className="text-white">{action.description}</span></p>
              )}
            </div>
          </div>
        ))}
        
        {actions.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            <p>No actions configured</p>
            <p className="text-xs mt-1">Add actions to automate responses based on sensor data</p>
          </div>
        )}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors"
      >
        Save Configuration
      </button>

      {/* Add Action Modal */}
      {showAddAction && (
        <AddActionModal
          device={device}
          sensorOptions={getSensorOptions()}
          onAdd={handleAddAction}
          onClose={() => setShowAddAction(false)}
        />
      )}

      {/* Edit Action Modal */}
      {editingAction && (
        <EditActionModal
          action={editingAction}
          device={device}
          sensorOptions={getSensorOptions()}
          onUpdate={handleUpdateAction}
          onClose={() => setEditingAction(null)}
        />
      )}
    </div>
  );
}

// Add Action Modal Component
function AddActionModal({ device, sensorOptions, onAdd, onClose }) {
  const [formData, setFormData] = useState({
    type: 'alert',
    sensor: sensorOptions[0] || '',
    condition: 'greater_than',
    threshold: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.sensor || !formData.threshold) {
      alert('Please fill in all required fields');
      return;
    }

    onAdd({
      ...formData,
      threshold: parseFloat(formData.threshold)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg border border-green-800 p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4 text-green-400">Add New Action</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Action Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
            >
              {Object.values(ACTION_TYPES).map(action => (
                <option key={action.id} value={action.id}>
                  {action.icon} {action.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sensor</label>
            <select
              value={formData.sensor}
              onChange={(e) => setFormData({...formData, sensor: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
            >
              {sensorOptions.map(sensor => (
                <option key={sensor} value={sensor}>
                  {sensor.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Condition</label>
            <select
              value={formData.condition}
              onChange={(e) => setFormData({...formData, condition: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
            >
              <option value="greater_than">Greater than</option>
              <option value="less_than">Less than</option>
              <option value="equals">Equals</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Threshold Value</label>
            <input
              type="number"
              step="any"
              value={formData.threshold}
              onChange={(e) => setFormData({...formData, threshold: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              placeholder="Enter threshold value"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              placeholder="Describe what this action does"
              rows={2}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
            >
              Add Action
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

// Edit Action Modal Component
function EditActionModal({ action, device, sensorOptions, onUpdate, onClose }) {
  const [formData, setFormData] = useState({
    type: action.type,
    sensor: action.sensor,
    condition: action.condition,
    threshold: action.threshold.toString(),
    description: action.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.sensor || !formData.threshold) {
      alert('Please fill in all required fields');
      return;
    }

    onUpdate(action.id, {
      ...formData,
      threshold: parseFloat(formData.threshold)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg border border-green-800 p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4 text-green-400">Edit Action</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Action Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
            >
              {Object.values(ACTION_TYPES).map(actionType => (
                <option key={actionType.id} value={actionType.id}>
                  {actionType.icon} {actionType.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sensor</label>
            <select
              value={formData.sensor}
              onChange={(e) => setFormData({...formData, sensor: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
            >
              {sensorOptions.map(sensor => (
                <option key={sensor} value={sensor}>
                  {sensor.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Condition</label>
            <select
              value={formData.condition}
              onChange={(e) => setFormData({...formData, condition: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
            >
              <option value="greater_than">Greater than</option>
              <option value="less_than">Less than</option>
              <option value="equals">Equals</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Threshold Value</label>
            <input
              type="number"
              step="any"
              value={formData.threshold}
              onChange={(e) => setFormData({...formData, threshold: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              placeholder="Enter threshold value"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              placeholder="Describe what this action does"
              rows={2}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-sm font-medium transition-colors"
            >
              Update Action
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
