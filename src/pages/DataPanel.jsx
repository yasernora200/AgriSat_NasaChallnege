import { useState } from 'react';
import { fetchAllAgriculturalData } from '../services/agriculturalDataService';

export default function DataPanel({ selectedGeom, setTimeSeries }) {
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);

  const handleFetchRealData = async () => {
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

      console.log('Fetching data for coordinates:', { lat, lon });
      
      // Fetch all agricultural data
      const agriculturalData = await fetchAllAgriculturalData(lat, lon);
      
      // Transform data to the format expected by the visualization components
      const transformedData = {
        ndvi: agriculturalData.ndvi.data.map(item => item.value),
        sm: agriculturalData.soil_moisture.data.map(item => item.value * 100), // Convert to percentage
        rain: agriculturalData.weather_historical.data.map(item => item.precipitation || 0),
        temp: agriculturalData.weather_historical.data.map(item => item.temperature || 0),
        // Add detailed data for advanced features
        detailed: agriculturalData
      };

      setTimeSeries(transformedData);
      setLastFetch(new Date().toLocaleString('ar-EG'));
      
      console.log('Agricultural data loaded successfully:', agriculturalData);
      
    } catch (error) {
      console.error('Error fetching agricultural data:', error);
      alert(`خطأ في جلب البيانات: ${error.message}`);
      
      // Fallback to mock data
      setTimeSeries({
        ndvi: [0.2, 0.3, 0.5, 0.6],
        sm: [15, 25, 35, 40],
        rain: [2, 12, 5, 0],
        temp: [24, 26, 28, 30],
      });
    } finally {
      setLoading(false);
    }
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
      <h2 className="text-lg font-bold mb-2 text-green-400"> لوحة البيانات</h2>
      
      {selectedGeom ? (
        <div className="space-y-3">
          <div className="text-sm text-gray-300">
            <p className="mb-1"> تم تحديد منطقة على الخريطة</p>
            {selectedGeom.geometry.type === 'Point' && (
              <p className="text-xs text-gray-400">
                النقطة: {selectedGeom.geometry.coordinates[1].toFixed(4)}, {selectedGeom.geometry.coordinates[0].toFixed(4)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <button
              onClick={handleFetchRealData}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? ' جاري جلب البيانات...' : ' جلب البيانات الحقيقية'}
            </button>
            
            <button
              onClick={handleLoadMockData}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors"
            >
               تحميل بيانات تجريبية
            </button>
          </div>

          {lastFetch && (
            <div className="text-xs text-gray-400 border-t border-gray-700 pt-2">
              آخر تحديث: {lastFetch}
            </div>
          )}

          <div className="text-xs text-gray-500 space-y-1">
            <p>البيانات المتاحة:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>NDVI (صحة النبات) - MODIS</li>
              <li>رطوبة التربة - SMAP</li>
              <li>الطقس التاريخي - NASA POWER</li>
              <li>التنبؤ الجوي - OpenWeatherMap</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-400">
          <p className="mb-2"> يرجى تحديد منطقة على الخريطة أولاً</p>
          <p className="text-xs">يمكنك:</p>
          <ul className="list-disc list-inside text-xs ml-2 space-y-0.5">
            <li>رسم مستطيل أو مضلع</li>
            <li>البحث عن موقع</li>
            <li>النقر على نقطة محددة</li>
          </ul>
        </div>
      )}
    </div>
  );
}
