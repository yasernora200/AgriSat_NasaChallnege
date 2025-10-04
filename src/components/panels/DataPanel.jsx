
import { useState } from 'react';
import { fetchAllAgriculturalData } from '../../services/agriculturalDataService';

export default function DataPanel({ selectedGeom, setTimeSeries }){
  const [loading, setLoading] = useState(false);

  const handleFetchRealData = async () => {
    if(!selectedGeom) return alert('يرجى تحديد منطقة على الخريطة أولاً');

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
        sm: agriculturalData.soil_moisture.data.map(item => item.value * 100),
        rain: agriculturalData.weather_historical.data.map(item => item.precipitation || 0),
        temp: agriculturalData.weather_historical.data.map(item => item.temperature || 0),
        detailed: agriculturalData
      };

      setTimeSeries(transformedData);
      console.log('✅ Agricultural data loaded successfully:', agriculturalData);
      
    } catch (error) {
      console.error('❌ Error fetching agricultural data:', error);
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

  const fetchMockData = () => {
    if(!selectedGeom) return alert('Select a farm first');
    
    // Demo: محاكاة بيانات NDVI
    const ts = [];
    const today = new Date();
    for(let i=30; i>=0; i--){
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      ts.push({ date: d.toISOString().slice(0,10), ndvi: 0.4+Math.random()*0.4 });
    }
    setTimeSeries(tsOld => ({ ...tsOld, ndvi: ts }));
  };

  return (
    <div className="p-2">
      <h3 className="font-bold">Data Panel</h3>
      <div className="space-y-2 mt-2">
        <button 
          className="bg-blue-600 text-white px-3 py-1 rounded w-full" 
          onClick={handleFetchRealData}
          disabled={loading}
        >
          {loading ? 'جاري جلب البيانات...' : 'جلب بيانات حقيقية'}
        </button>
        <button 
          className="bg-green-600 text-white px-3 py-1 rounded w-full" 
          onClick={fetchMockData}
        >
          جلب بيانات (تجريبية)
        </button>
      </div>
    </div>
  );
}