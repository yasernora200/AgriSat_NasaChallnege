import { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import AutomationRules from '../components/automation/AutomationRules';
import { 
  getDevices, 
  registerDevice, 
  getDeviceData, 
  getAllDevicesLatestData,
  DEVICE_TYPES,
  ACTION_TYPES 
} from '../services/iotDeviceService';
import { initializeDeviceHealth, updateDeviceHealth } from '../services/deviceHealthService';
import { createAlert } from '../services/advancedAlertService';

export default function IoTDevices() {
  const [devices, setDevices] = useState([]);
  const [latestData, setLatestData] = useState({});
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('devices'); // 'devices', 'analytics', or 'automation'

  // Load devices and data
  useEffect(() => {
    loadDevices();
    loadLatestData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadLatestData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDevices = async () => {
    try {
      const deviceList = await getDevices();
      setDevices(deviceList);
      
      // Initialize health monitoring for new devices
      deviceList.forEach(device => {
        if (!device.health) {
          initializeDeviceHealth(device.id, device.type);
        }
      });
    } catch (error) {
      console.error('Error loading devices:', error);
    }
  };

  const loadLatestData = async () => {
    try {
      const data = await getAllDevicesLatestData();
      setLatestData(data);
      
      // Update device health with latest data
      Object.entries(data).forEach(([deviceId, deviceData]) => {
        if (deviceData.sensors) {
          const healthMetrics = {
            battery_level: 85 + Math.random() * 15, // Simulated battery
            signal_strength: -60 - Math.random() * 20, // Simulated signal
            uptime: 98 + Math.random() * 2, // Simulated uptime
            data_quality: deviceData.quality === 'good' ? 98 : 85, // Based on data quality
            temperature: 25 + Math.random() * 15 // Simulated temperature
          };
          
          updateDeviceHealth(deviceId, healthMetrics);
        }
      });
    } catch (error) {
      console.error('Error loading latest data:', error);
    }
  };

  const handleAddDevice = async (deviceData) => {
    setLoading(true);
    try {
      const result = await registerDevice(deviceData);
      if (result.success) {
        await loadDevices();
        setShowAddDevice(false);
        alert('Device registered successfully!');
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert(`Error registering device: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceStatusColor = (device) => {
    switch (device.status) {
      case 'active': return 'text-green-400';
      case 'irrigating': return 'text-blue-400';
      case 'offline': return 'text-red-400';
      case 'maintenance': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getDeviceStatusIcon = (device) => {
    switch (device.status) {
      case 'active': return '🟢';
      case 'irrigating': return '💧';
      case 'offline': return '🔴';
      case 'maintenance': return '🟡';
      default: return '⚪';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black via-green-950 to-black text-white">
      <Header />
      <div className="flex flex-1">
        {/* Left Sidebar - Device List */}
        <Sidebar position="left">
          <div className="p-4 mb-4 bg-black/40 rounded-lg border border-green-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-green-400">🌐 IoT Devices</h2>
              <button
                onClick={() => setShowAddDevice(true)}
                className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm font-medium transition-colors"
              >
                + Add Device
              </button>
            </div>

            <div className="space-y-3">
              {devices.map(device => {
                const deviceType = DEVICE_TYPES[device.type.toUpperCase()];
                const data = latestData[device.id];
                
                return (
                  <div
                    key={device.id}
                    onClick={() => setSelectedDevice(device)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedDevice?.id === device.id 
                        ? 'border-green-500 bg-green-900/20' 
                        : 'border-gray-700 hover:border-green-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{deviceType?.icon || '📱'}</span>
                        <span className="font-medium text-sm">{device.name}</span>
                      </div>
                      <span className="text-xs">
                        {getDeviceStatusIcon(device)}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>Type: {deviceType?.name || device.type}</p>
                      <p>Location: {device.location?.lat?.toFixed(4)}, {device.location?.lon?.toFixed(4)}</p>
                      <p className={getDeviceStatusColor(device)}>
                        Status: {device.status}
                      </p>
                      {data && (
                        <p>Last Update: {new Date(data.timestamp).toLocaleTimeString()}</p>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {devices.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p>No devices registered yet</p>
                  <p className="text-xs mt-1">Click "Add Device" to register your first IoT device</p>
                </div>
              )}
            </div>
          </div>
        </Sidebar>

        {/* Main Content Area */}
        <div className="flex-1 border-x border-green-900/30">
          {activeView === 'analytics' ? (
            <AnalyticsDashboard />
          ) : activeView === 'automation' ? (
            <AutomationRules />
          ) : selectedDevice ? (
            <DeviceDetails 
              device={selectedDevice} 
              latestData={latestData[selectedDevice.id]}
              onClose={() => setSelectedDevice(null)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <div className="text-6xl mb-4">🌐</div>
                <h3 className="text-xl font-semibold mb-2">IoT Device Management</h3>
                <p>Select a device from the sidebar to view details and control actions</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Quick Actions */}
        <Sidebar position="right">
          <div className="p-4 bg-black/40 rounded-lg border border-green-800">
            <h3 className="text-lg font-bold mb-4 text-green-400">⚡ Quick Actions</h3>
            
            <div className="space-y-3">
              <button 
                onClick={loadLatestData}
                className="w-full p-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
              >
                🔄 Refresh All Devices
              </button>
              
              <button 
                onClick={() => {
                  if (activeView === 'devices') setActiveView('analytics');
                  else if (activeView === 'analytics') setActiveView('automation');
                  else setActiveView('devices');
                }}
                className="w-full p-3 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors"
              >
                📊 {activeView === 'devices' ? 'View Analytics' : activeView === 'analytics' ? 'View Automation' : 'View Devices'}
              </button>
              
              <button 
                onClick={() => {
                  // Create a test alert
                  createAlert({
                    type: 'device_offline',
                    severity: 'HIGH',
                    deviceId: 'test_device',
                    data: {
                      deviceName: 'Test Device',
                      duration: '2 hours',
                      location: 'Field A'
                    }
                  });
                }}
                className="w-full p-3 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-sm font-medium transition-colors"
              >
                ⚙️ Test Alert
              </button>
              
              <button className="w-full p-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors">
                📈 Export Data
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-700">
              <h4 className="text-sm font-semibold text-gray-300 mb-2">System Status</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Active Devices:</span>
                  <span className="text-green-400">{devices.filter(d => d.status === 'active').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Devices:</span>
                  <span className="text-blue-400">{devices.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Update:</span>
                  <span className="text-gray-400">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        </Sidebar>
      </div>

      {/* Add Device Modal */}
      {showAddDevice && (
        <AddDeviceModal 
          onAdd={handleAddDevice}
          onClose={() => setShowAddDevice(false)}
          loading={loading}
        />
      )}
    </div>
  );
}

// Device Details Component
function DeviceDetails({ device, latestData, onClose }) {
  const deviceType = DEVICE_TYPES[device.type.toUpperCase()];
  
  return (
    <div className="h-full flex flex-col">
      {/* Device Header */}
      <div className="p-6 border-b border-green-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{deviceType?.icon || '📱'}</span>
            <div>
              <h2 className="text-xl font-bold">{device.name}</h2>
              <p className="text-sm text-gray-400">{deviceType?.name || device.type}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Device Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Readings */}
          <div className="bg-black/40 rounded-lg border border-green-800 p-4">
            <h3 className="text-lg font-semibold mb-4 text-green-400">📊 Current Readings</h3>
            
            {latestData ? (
              <div className="space-y-3">
                {Object.entries(latestData.sensors || {}).map(([sensor, reading]) => (
                  <div key={sensor} className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                    <span className="text-sm capitalize">{sensor.replace('_', ' ')}</span>
                    <div className="text-right">
                      <span className="font-semibold">{reading.value.toFixed(2)}</span>
                      <span className="text-xs text-gray-400 ml-1">{reading.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No data available</p>
            )}
          </div>

          {/* Device Information */}
          <div className="bg-black/40 rounded-lg border border-green-800 p-4">
            <h3 className="text-lg font-semibold mb-4 text-green-400">ℹ️ Device Info</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Device ID:</span>
                <span className="font-mono text-xs">{device.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-400">{device.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Location:</span>
                <span>{device.location?.lat?.toFixed(4)}, {device.location?.lon?.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Seen:</span>
                <span>{new Date(device.lastSeen).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Created:</span>
                <span>{new Date(device.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Action History */}
          <div className="bg-black/40 rounded-lg border border-green-800 p-4 lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-green-400">📋 Recent Actions</h3>
            
            {device.actionHistory && device.actionHistory.length > 0 ? (
              <div className="space-y-2">
                {device.actionHistory.slice(0, 5).map(action => (
                  <div key={action.id} className="flex justify-between items-center p-2 bg-gray-800/50 rounded text-sm">
                    <div className="flex items-center space-x-2">
                      <span>{ACTION_TYPES[action.actionType]?.icon || '⚡'}</span>
                      <span>{ACTION_TYPES[action.actionType]?.name || action.actionType}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-green-400">{action.status}</span>
                      <span className="text-gray-400 ml-2 text-xs">
                        {new Date(action.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No recent actions</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Add Device Modal Component
function AddDeviceModal({ onAdd, onClose, loading }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'soil_sensor',
    location: { lat: '', lon: '' },
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location.lat || !formData.location.lon) {
      alert('Please fill in all required fields');
      return;
    }

    const deviceData = {
      ...formData,
      location: {
        lat: parseFloat(formData.location.lat),
        lon: parseFloat(formData.location.lon)
      }
    };

    onAdd(deviceData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg border border-green-800 p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-4 text-green-400">Add New IoT Device</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Device Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              placeholder="Enter device name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Device Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
            >
              {Object.values(DEVICE_TYPES).map(type => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.name}
                </option>
              ))}
            </select>
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
                required
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
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
              placeholder="Enter device description"
              rows={3}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? 'Adding...' : 'Add Device'}
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
