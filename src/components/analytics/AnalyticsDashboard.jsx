import { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { 
  predictCropYield, 
  optimizeIrrigationSchedule, 
  assessPestRisk,
  predictHarvestTime,
  calculateFertilizerNeeds,
  PREDICTION_TYPES 
} from '../../services/predictiveAnalyticsService';
import { getAlertStatistics } from '../../services/advancedAlertService';
import { getHealthStatistics } from '../../services/deviceHealthService';
import { exportData, EXPORT_FORMATS, REPORT_TYPES } from '../../services/dataExportService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState({});
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnalyticsData();
    loadPredictions();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [alertStats, healthStats] = await Promise.all([
        getAlertStatistics(),
        getHealthStatistics()
      ]);

      setAnalyticsData({
        alerts: alertStats,
        health: healthStats,
        devices: await generateDeviceAnalytics(),
        performance: await generatePerformanceMetrics()
      });
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPredictions = async () => {
    try {
      // Mock data for predictions
      const mockHistoricalData = generateMockHistoricalData();
      const mockCurrentConditions = {
        soilMoisture: 45,
        temperature: 24,
        rainfall: 150,
        ndvi: 0.65
      };

      const [yieldPrediction, irrigationSchedule, pestRisk, harvestTime, fertilizerNeeds] = await Promise.all([
        predictCropYield(mockHistoricalData, mockCurrentConditions),
        optimizeIrrigationSchedule({ currentMoisture: 45, area: 10 }, generateMockWeatherForecast()),
        assessPestRisk({ temperature: 24, humidity: 65, soilMoisture: 45, rainfall: 150 }),
        predictHarvestTime({ ndvi: 0.65, temperature: 24 }, generateMockWeatherForecast()),
        calculateFertilizerNeeds({ nitrogen: 25, phosphorus: 15, potassium: 30 }, 'wheat', 4.5)
      ]);

      setPredictions({
        yield: yieldPrediction,
        irrigation: irrigationSchedule,
        pest: pestRisk,
        harvest: harvestTime,
        fertilizer: fertilizerNeeds
      });
    } catch (error) {
      console.error('Error loading predictions:', error);
    }
  };

  const generateDeviceAnalytics = async () => {
    // Mock device analytics
    return {
      totalDevices: 12,
      activeDevices: 10,
      offlineDevices: 2,
      averageUptime: 98.5,
      dataPointsCollected: 15420,
      lastUpdate: new Date().toISOString()
    };
  };

  const generatePerformanceMetrics = async () => {
    // Mock performance metrics
    return {
      responseTime: 245, // ms
      dataAccuracy: 96.8, // %
      systemUptime: 99.2, // %
      energyEfficiency: 87.3, // %
      lastWeekTrend: [85, 87, 89, 88, 90, 92, 87]
    };
  };

  const generateMockHistoricalData = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      year: 2023,
      month: i + 1,
      yield: 3.2 + Math.random() * 0.8,
      rainfall: 50 + Math.random() * 100,
      temperature: 20 + Math.random() * 10
    }));
  };

  const generateMockWeatherForecast = () => {
    return Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
      temperature: 20 + Math.random() * 10,
      rainfall: Math.random() * 20,
      humidity: 60 + Math.random() * 30
    }));
  };

  const handleExportData = async (reportType, format) => {
    try {
      const mockData = generateMockExportData(reportType.id);
      await exportData(reportType, format, mockData);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const generateMockExportData = (reportType) => {
    switch (reportType) {
      case 'device_summary':
        return Array.from({ length: 10 }, (_, i) => ({
          name: `Device ${i + 1}`,
          type: ['soil_sensor', 'weather_station', 'irrigation_controller'][i % 3],
          status: ['active', 'offline', 'maintenance'][i % 3],
          location: { lat: 30 + Math.random(), lon: 31 + Math.random() },
          lastSeen: new Date().toISOString(),
          batteryLevel: 80 + Math.random() * 20
        }));
      default:
        return [];
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'predictions', name: 'Predictions', icon: '🔮' },
    { id: 'performance', name: 'Performance', icon: '⚡' },
    { id: 'reports', name: 'Reports', icon: '📄' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-2"></div>
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/40 rounded-lg border border-green-800 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-400">📊 Analytics Dashboard</h2>
        <div className="flex space-x-2">
          <button
            onClick={loadAnalyticsData}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors"
          >
            🔄 Refresh
          </button>
          <button
            onClick={() => handleExportData(REPORT_TYPES.DEVICE_SUMMARY, EXPORT_FORMATS.PDF)}
            className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-sm transition-colors"
          >
            📄 Export PDF
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-800 rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-green-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab data={analyticsData} />}
      {activeTab === 'predictions' && <PredictionsTab predictions={predictions} />}
      {activeTab === 'performance' && <PerformanceTab data={analyticsData} />}
      {activeTab === 'reports' && <ReportsTab onExport={handleExportData} />}
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ data }) {
  const overviewCharts = {
    deviceStatus: {
      labels: ['Active', 'Offline', 'Maintenance'],
      datasets: [{
        data: [data.health?.good || 8, data.health?.poor || 2, data.health?.critical || 1],
        backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
        borderWidth: 0
      }]
    },
    alertTrends: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Alerts',
        data: [5, 3, 8, 2, 6, 1, 4],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.1
      }]
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Devices"
          value={data.devices?.totalDevices || 0}
          icon="🌐"
          color="blue"
          trend="+2 this week"
        />
        <MetricCard
          title="Active Alerts"
          value={data.alerts?.active || 0}
          icon="🚨"
          color="red"
          trend={`${data.alerts?.critical || 0} critical`}
        />
        <MetricCard
          title="System Uptime"
          value={`${data.performance?.systemUptime || 0}%`}
          icon="⚡"
          color="green"
          trend="+0.5% this month"
        />
        <MetricCard
          title="Data Points"
          value={(data.devices?.dataPointsCollected || 0).toLocaleString()}
          icon="📊"
          color="purple"
          trend="+1.2k today"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 text-white">Device Status Distribution</h3>
          <div className="h-64">
            <Doughnut
              data={overviewCharts.deviceStatus}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { labels: { color: 'white' } }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 text-white">Alert Trends (7 Days)</h3>
          <div className="h-64">
            <Line
              data={overviewCharts.alertTrends}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { labels: { color: 'white' } }
                },
                scales: {
                  x: { ticks: { color: 'white' } },
                  y: { ticks: { color: 'white' } }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Predictions Tab Component
function PredictionsTab({ predictions }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crop Yield Prediction */}
        {predictions.yield && (
          <PredictionCard
            title="🌾 Crop Yield Prediction"
            prediction={predictions.yield}
            type="yield"
          />
        )}

        {/* Pest Risk Assessment */}
        {predictions.pest && (
          <PredictionCard
            title="🐛 Pest Risk Assessment"
            prediction={predictions.pest}
            type="pest"
          />
        )}

        {/* Harvest Time Prediction */}
        {predictions.harvest && (
          <PredictionCard
            title="⏰ Harvest Time Prediction"
            prediction={predictions.harvest}
            type="harvest"
          />
        )}

        {/* Fertilizer Requirements */}
        {predictions.fertilizer && (
          <PredictionCard
            title="🌿 Fertilizer Requirements"
            prediction={predictions.fertilizer}
            type="fertilizer"
          />
        )}
      </div>
    </div>
  );
}

// Performance Tab Component
function PerformanceTab({ data }) {
  const performanceChart = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Response Time (ms)',
        data: [250, 245, 240, 255, 248, 242, 245],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        yAxisID: 'y'
      },
      {
        label: 'Accuracy (%)',
        data: [95, 96, 97, 96, 98, 97, 96],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        yAxisID: 'y1'
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Response Time"
          value={`${data.performance?.responseTime || 0}ms`}
          icon="⚡"
          color="blue"
        />
        <MetricCard
          title="Data Accuracy"
          value={`${data.performance?.dataAccuracy || 0}%`}
          icon="🎯"
          color="green"
        />
        <MetricCard
          title="Energy Efficiency"
          value={`${data.performance?.energyEfficiency || 0}%`}
          icon="🔋"
          color="purple"
        />
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4 text-white">Performance Trends</h3>
        <div className="h-64">
          <Line
            data={performanceChart}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { labels: { color: 'white' } }
              },
              scales: {
                x: { ticks: { color: 'white' } },
                y: { 
                  type: 'linear',
                  display: true,
                  position: 'left',
                  ticks: { color: 'white' }
                },
                y1: {
                  type: 'linear',
                  display: true,
                  position: 'right',
                  ticks: { color: 'white' }
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Reports Tab Component
function ReportsTab({ onExport }) {
  const reportTypes = Object.values(REPORT_TYPES);
  const exportFormats = Object.values(EXPORT_FORMATS);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reportTypes.map(reportType => (
          <div key={reportType.id} className="bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-white">{reportType.name}</h3>
            <p className="text-gray-400 text-sm mb-4">{reportType.description}</p>
            
            <div className="flex flex-wrap gap-2">
              {exportFormats.map(format => (
                <button
                  key={format.id}
                  onClick={() => onExport(reportType, format)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors"
                >
                  {format.icon} {format.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ title, value, icon, color, trend }) {
  const colorClasses = {
    blue: 'border-blue-500 bg-blue-900/20',
    green: 'border-green-500 bg-green-900/20',
    red: 'border-red-500 bg-red-900/20',
    purple: 'border-purple-500 bg-purple-900/20',
    yellow: 'border-yellow-500 bg-yellow-900/20'
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color] || colorClasses.blue}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {trend && (
            <p className="text-xs text-gray-400 mt-1">{trend}</p>
          )}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

// Prediction Card Component
function PredictionCard({ title, prediction, type }) {
  const getConfidenceColor = (confidence) => {
    if (confidence === 'high') return 'text-green-400';
    if (confidence === 'medium') return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3 text-white">{title}</h3>
      
      {type === 'yield' && (
        <div className="space-y-2">
          <p className="text-2xl font-bold text-green-400">
            {prediction.predictedYield} tons/ha
          </p>
          <p className={`text-sm ${getConfidenceColor(prediction.confidence)}`}>
            Confidence: {prediction.confidence}
          </p>
          <div className="text-xs text-gray-400">
            <p>Soil Moisture Factor: {(prediction.factors.soilMoisture * 100).toFixed(1)}%</p>
            <p>Temperature Factor: {(prediction.factors.temperature * 100).toFixed(1)}%</p>
          </div>
        </div>
      )}

      {type === 'pest' && (
        <div className="space-y-2">
          <p className={`text-xl font-bold ${
            prediction.overallRisk === 'high' ? 'text-red-400' :
            prediction.overallRisk === 'medium' ? 'text-yellow-400' : 'text-green-400'
          }`}>
            Risk: {prediction.overallRisk.toUpperCase()}
          </p>
          <div className="text-xs text-gray-400">
            {prediction.risks.slice(0, 2).map(risk => (
              <p key={risk.pest}>{risk.pest}: {(risk.probability * 100).toFixed(0)}%</p>
            ))}
          </div>
        </div>
      )}

      {type === 'harvest' && (
        <div className="space-y-2">
          <p className="text-xl font-bold text-green-400">
            {Math.ceil((new Date(prediction.optimalHarvestDate) - new Date()) / (24 * 60 * 60 * 1000))} days
          </p>
          <p className="text-xs text-gray-400">
            Progress: {prediction.maturityProgress.toFixed(1)}%
          </p>
        </div>
      )}

      {type === 'fertilizer' && (
        <div className="space-y-2">
          <p className="text-xl font-bold text-green-400">
            ${prediction.totalCost.toFixed(2)}
          </p>
          <div className="text-xs text-gray-400">
            <p>N: {prediction.requirements.nitrogen.needed.toFixed(1)}kg</p>
            <p>P: {prediction.requirements.phosphorus.needed.toFixed(1)}kg</p>
            <p>K: {prediction.requirements.potassium.needed.toFixed(1)}kg</p>
          </div>
        </div>
      )}
    </div>
  );
}
