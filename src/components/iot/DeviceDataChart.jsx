import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getDeviceData } from '../../services/iotDeviceService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function DeviceDataChart({ device, timeRange = '24h' }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSensors, setSelectedSensors] = useState([]);

  useEffect(() => {
    loadDeviceData();
  }, [device, timeRange]);

  useEffect(() => {
    // Initialize selected sensors with first few available sensors
    if (chartData && selectedSensors.length === 0) {
      const availableSensors = Object.keys(chartData.sensors || {});
      setSelectedSensors(availableSensors.slice(0, 3)); // Select first 3 sensors
    }
  }, [chartData]);

  const loadDeviceData = async () => {
    if (!device) return;

    setLoading(true);
    try {
      const data = await getDeviceData(device.id, getDataLimit());
      const processedData = processChartData(data);
      setChartData(processedData);
    } catch (error) {
      console.error('Error loading device data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDataLimit = () => {
    switch (timeRange) {
      case '1h': return 12; // 5-minute intervals
      case '6h': return 72; // 5-minute intervals
      case '24h': return 288; // 5-minute intervals
      case '7d': return 168; // 1-hour intervals
      case '30d': return 720; // 1-hour intervals
      default: return 100;
    }
  };

  const processChartData = (data) => {
    if (!data || data.length === 0) return null;

    const sensors = {};
    const labels = [];

    // Sort data by timestamp
    const sortedData = data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    sortedData.forEach((dataPoint, index) => {
      // Create time labels
      const date = new Date(dataPoint.timestamp);
      const timeLabel = getTimeLabel(date);
      labels.push(timeLabel);

      // Process sensor data
      Object.entries(dataPoint.sensors || {}).forEach(([sensorName, sensorData]) => {
        if (!sensors[sensorName]) {
          sensors[sensorName] = {
            values: [],
            unit: sensorData.unit,
            color: getSensorColor(sensorName)
          };
        }
        sensors[sensorName].values.push(sensorData.value);
      });
    });

    return { labels, sensors };
  };

  const getTimeLabel = (date) => {
    switch (timeRange) {
      case '1h':
      case '6h':
      case '24h':
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      case '7d':
      case '30d':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      default:
        return date.toLocaleString();
    }
  };

  const getSensorColor = (sensorName) => {
    const colors = {
      moisture: 'rgb(59, 130, 246)', // Blue
      temperature: 'rgb(239, 68, 68)', // Red
      humidity: 'rgb(34, 197, 94)', // Green
      pressure: 'rgb(139, 92, 246)', // Purple
      ph: 'rgb(245, 158, 11)', // Yellow
      ndvi: 'rgb(34, 197, 94)', // Green
      rainfall: 'rgb(59, 130, 246)', // Blue
      wind_speed: 'rgb(156, 163, 175)', // Gray
      solar_radiation: 'rgb(245, 158, 11)', // Yellow
      water_flow: 'rgb(34, 197, 94)' // Green
    };
    return colors[sensorName] || 'rgb(107, 114, 128)';
  };

  const getChartOptions = () => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: 'white' }
        },
        title: {
          display: true,
          text: `${device.name} - Sensor Data`,
          color: 'white',
          font: { size: 16 }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white'
        }
      },
      scales: {
        x: {
          ticks: { color: 'white' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        y: {
          ticks: { color: 'white' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    };
  };

  const getChartData = () => {
    if (!chartData || !selectedSensors.length) return null;

    const datasets = selectedSensors.map(sensorName => {
      const sensorData = chartData.sensors[sensorName];
      if (!sensorData) return null;

      return {
        label: `${sensorName.replace('_', ' ')} (${sensorData.unit})`,
        data: sensorData.values,
        borderColor: sensorData.color,
        backgroundColor: sensorData.color + '20', // Add transparency
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 5,
        tension: 0.1
      };
    }).filter(Boolean);

    return {
      labels: chartData.labels,
      datasets
    };
  };

  const handleSensorToggle = (sensorName) => {
    setSelectedSensors(prev => 
      prev.includes(sensorName)
        ? prev.filter(s => s !== sensorName)
        : [...prev, sensorName]
    );
  };

  const refreshData = () => {
    loadDeviceData();
  };

  if (loading) {
    return (
      <div className="bg-black/40 rounded-lg border border-green-800 p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-2"></div>
            <p className="text-gray-400">Loading device data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="bg-black/40 rounded-lg border border-green-800 p-4">
        <div className="text-center py-8 text-gray-400">
          <p>No data available for this device</p>
          <button
            onClick={refreshData}
            className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  const availableSensors = Object.keys(chartData.sensors || {});

  return (
    <div className="bg-black/40 rounded-lg border border-green-800 p-4">
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-green-400">📊 Sensor Data Chart</h3>
        <div className="flex space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-sm text-white"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button
            onClick={refreshData}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Sensor Selection */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Select Sensors to Display:</h4>
        <div className="flex flex-wrap gap-2">
          {availableSensors.map(sensorName => {
            const isSelected = selectedSensors.includes(sensorName);
            const sensorData = chartData.sensors[sensorName];
            
            return (
              <button
                key={sensorName}
                onClick={() => handleSensorToggle(sensorName)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                style={{ borderColor: isSelected ? sensorData?.color : undefined }}
              >
                {sensorName.replace('_', ' ')} ({sensorData?.unit})
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        {getChartData() && (
          <Line data={getChartData()} options={getChartOptions()} />
        )}
      </div>

      {/* Data Summary */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Latest Values:</h4>
        <div className="grid grid-cols-2 gap-2">
          {selectedSensors.map(sensorName => {
            const sensorData = chartData.sensors[sensorName];
            const latestValue = sensorData?.values[sensorData.values.length - 1];
            
            return (
              <div key={sensorName} className="flex justify-between text-xs">
                <span className="text-gray-400 capitalize">
                  {sensorName.replace('_', ' ')}:
                </span>
                <span className="font-medium">
                  {latestValue?.toFixed(2)} {sensorData?.unit}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
