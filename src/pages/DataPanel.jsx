import { useState, useEffect } from 'react';
import { fetchAllAgriculturalData } from '../services/agriculturalDataService';
import { getDevices, getAllDevicesLatestData } from '../services/iotDeviceService';

export default function DataPanel({ selectedGeom, setTimeSeries }) {
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);
  const [iotDevices, setIotDevices] = useState([]);
  const [iotData, setIotData] = useState({});
  const [dataSource, setDataSource] = useState('satellite'); // 'satellite' or 'iot'

  // Load IoT devices on component mount
  useEffect(() => {
    loadIoTDevices();
    loadIoTData();
    
    // Refresh IoT data every 30 seconds
    const interval = setInterval(loadIoTData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadIoTDevices = async () => {
    try {
      const devices = await getDevices();
      setIotDevices(devices);
    } catch (error) {
      console.error('Error loading IoT devices:', error);
    }
  };

  const loadIoTData = async () => {
    try {
      const data = await getAllDevicesLatestData();
      setIotData(data);
    } catch (error) {
      console.error('Error loading IoT data:', error);
    }
  };

  const handleFetchRealData = async () => {
    if (dataSource === 'iot') {
      handleFetchIoTData();
      return;
    }

    if (!selectedGeom) {
      alert('يرجى تحديد منطقة على الخريطة أولاً');
      return;
    }

    setLoading(true);
    
    try {
      // Extract coordinates from the selected geometry
      let lat, lon;
      
      if (selectedGeom.geometry.type === 'Point') {
        [lon, lat] = selectedGeom.geometry.coordinates;
      } else if (selectedGeom.geometry.type === 'Polygon') {
        // For polygon, use the centroid
        const coords = selectedGeom.geometry.coordinates[0];
        const centroid = coords.reduce(
          (acc, coord) => ({ lat: acc.lat + coord[1], lon: acc.lon + coord[0] }),
          { lat: 0, lon: 0 }
        );
        lat = centroid.lat / coords.length;
        lon = centroid.lon / coords.length;
      } else {
        throw new Error('نوع الهندسة غير مدعوم');
      }

      console.log('Fetching satellite data for coordinates:', { lat, lon });
      
      // Fetch all agricultural data
      const agriculturalData = await fetchAllAgriculturalData(lat, lon);
      
      // Transform data to the format expected by the visualization components
      const transformedData = {
        ndvi: agriculturalData.ndvi.data.map(item => item.value),
        sm: agriculturalData.soil_moisture.data.map(item => item.value * 100), // Convert to percentage
        rain: agriculturalData.weather_historical.data.map(item => item.precipitation || 0),
        temp: agriculturalData.weather_historical.data.map(item => item.temperature || 0),
        // Add detailed data for advanced features
        detailed: agriculturalData,
        source: 'satellite'
      };

      setTimeSeries(transformedData);
      setLastFetch(new Date().toLocaleString('ar-EG') + ' (Satellite)');
      
      console.log('Satellite data loaded successfully:', agriculturalData);
      
    } catch (error) {
      console.error('Error fetching agricultural data:', error);
      alert(`خطأ في جلب البيانات: ${error.message}`);
      
      // Fallback to mock data
      setTimeSeries({
        ndvi: [0.2, 0.3, 0.5, 0.6],
        sm: [15, 25, 35, 40],
        rain: [2, 12, 5, 0],
        temp: [24, 26, 28, 30],
        source: 'mock'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFetchIoTData = async () => {
    if (iotDevices.length === 0) {
      alert('No IoT devices available. Please register devices first.');
      return;
    }

    setLoading(true);
    
    try {
      // Aggregate data from all IoT devices
      const aggregatedData = aggregateIoTData(iotData);
      
      // Transform to the format expected by visualization components
      const transformedData = {
        ndvi: aggregatedData.ndvi || [0.3, 0.4, 0.6, 0.7],
        sm: aggregatedData.moisture || [20, 35, 40, 30],
        rain: aggregatedData.rainfall || [5, 10, 2, 0],
        temp: aggregatedData.temperature || [25, 27, 29, 31],
        detailed: iotData,
        source: 'iot',
        deviceCount: iotDevices.length
      };

      setTimeSeries(transformedData);
      setLastFetch(new Date().toLocaleString('ar-EG') + ' (IoT Devices)');
      
      console.log('IoT data loaded successfully:', transformedData);
      
    } catch (error) {
      console.error('Error fetching IoT data:', error);
      alert(`Error fetching IoT data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const aggregateIoTData = (deviceData) => {
    const sensors = {
      temperature: [],
      moisture: [],
      ndvi: [],
      rainfall: [],
      humidity: [],
      ph: []
    };

    // Collect sensor data from all devices
    Object.values(deviceData).forEach(data => {
      if (data.sensors) {
        Object.entries(data.sensors).forEach(([sensorName, sensorValue]) => {
          if (sensors[sensorName]) {
            sensors[sensorName].push(sensorValue.value);
          }
        });
      }
    });

    // Calculate averages for each sensor type
    const aggregated = {};
    Object.entries(sensors).forEach(([sensorName, values]) => {
      if (values.length > 0) {
        const average = values.reduce((sum, val) => sum + val, 0) / values.length;
        aggregated[sensorName] = [average * 0.9, average * 1.1, average * 0.95, average * 1.05]; // Generate time series
      }
    });

    return aggregated;
  };

  const handleLoadMockData = () => {
    setTimeSeries({
      ndvi: [0.2, 0.3, 0.5, 0.6],
      sm: [15, 25, 35, 40],
      rain: [2, 12, 5, 0],
      temp: [24, 26, 28, 30],
    });
    setLastFetch(new Date().toLocaleString('ar-EG') + ' (بيانات تجريبية)');
  };

  return (
    <div className="p-4 mb-4 bg-black/40 rounded-lg border border-green-800">
      <h2 className="text-lg font-bold mb-2 text-green-400">🌐 Data Panel</h2>
      
      {/* Data Source Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-gray-300">Data Source:</label>
        <div className="flex space-x-2">
          <button
            onClick={() => setDataSource('satellite')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              dataSource === 'satellite' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🛰️ Satellite
          </button>
          <button
            onClick={() => setDataSource('iot')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              dataSource === 'iot' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            🌐 IoT Devices ({iotDevices.length})
          </button>
        </div>
      </div>

      {dataSource === 'iot' ? (
        /* IoT Data Section */
        <div className="space-y-3">
          {iotDevices.length > 0 ? (
            <>
              <div className="text-sm text-gray-300">
                <p className="mb-2">IoT Devices Available: {iotDevices.length}</p>
                <div className="space-y-1">
                  {iotDevices.slice(0, 3).map(device => (
                    <div key={device.id} className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">{device.name}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        device.status === 'active' ? 'bg-green-600' : 'bg-gray-600'
                      }`}>
                        {device.status}
                      </span>
                    </div>
                  ))}
                  {iotDevices.length > 3 && (
                    <p className="text-xs text-gray-500">... and {iotDevices.length - 3} more</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleFetchRealData}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                  {loading ? 'Loading IoT Data...' : 'Fetch IoT Data'}
                </button>
                
                <button
                  onClick={handleLoadMockData}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
                >
                  Load Mock Data
                </button>
              </div>

              {lastFetch && (
                <div className="text-xs text-gray-400 border-t border-gray-700 pt-2">
                  Last Update: {lastFetch}
                </div>
              )}

              <div className="text-xs text-gray-500 space-y-1">
                <p>IoT Sensors Available:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  <li>Temperature Sensors</li>
                  <li>Soil Moisture Sensors</li>
                  <li>Weather Stations</li>
                  <li>Irrigation Controllers</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-gray-400">
              <p className="mb-2">No IoT devices registered</p>
              <p className="text-xs">Go to IoT Devices page to register devices</p>
            </div>
          )}
        </div>
      ) : (
        /* Satellite Data Section */
        <div className="space-y-3">
          {selectedGeom ? (
            <>
              <div className="text-sm text-gray-300">
                <p className="mb-1">Region selected on map</p>
                {selectedGeom.geometry.type === 'Point' && (
                  <p className="text-xs text-gray-400">
                    Point: {selectedGeom.geometry.coordinates[1].toFixed(4)}, {selectedGeom.geometry.coordinates[0].toFixed(4)}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleFetchRealData}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                  {loading ? 'Loading Satellite Data...' : 'Fetch Satellite Data'}
                </button>
                
                <button
                  onClick={handleLoadMockData}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors"
                >
                  Load Mock Data
                </button>
              </div>

              {lastFetch && (
                <div className="text-xs text-gray-400 border-t border-gray-700 pt-2">
                  Last Update: {lastFetch}
                </div>
              )}

              <div className="text-xs text-gray-500 space-y-1">
                <p>Available Data Sources:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  <li>NDVI (Plant Health) - MODIS</li>
                  <li>Soil Moisture - SMAP</li>
                  <li>Historical Weather - NASA POWER</li>
                  <li>Weather Forecast - OpenWeatherMap</li>
                </ul>
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-400">
              <p className="mb-2">Please select a region on the map first</p>
              <p className="text-xs">You can:</p>
              <ul className="list-disc list-inside text-xs ml-2 space-y-0.5">
                <li>Draw a rectangle or polygon</li>
                <li>Search for a location</li>
                <li>Click on a specific point</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
