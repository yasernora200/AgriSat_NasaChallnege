import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function VisualizationPanel({ timeSeries }) {
  const labels = ["Week 1", "Week 2", "Week 3", "Week 4"];

  const datasets = [
    {
      label: "🌱 NDVI",
      data: timeSeries.ndvi,
      borderColor: "rgb(34, 197, 94)",
      backgroundColor: "rgba(34, 197, 94, 0.5)",
    },
    {
      label: "💧 Soil Moisture (%)",
      data: timeSeries.sm,
      borderColor: "rgb(59, 130, 246)",
      backgroundColor: "rgba(59, 130, 246, 0.5)",
    },
    {
      label: "🌧 Rainfall (mm)",
      data: timeSeries.rain,
      borderColor: "rgb(139, 92, 246)",
      backgroundColor: "rgba(139, 92, 246, 0.5)",
    },
    {
      label: "🌡 Temperature (°C)",
      data: timeSeries.temp,
      borderColor: "rgb(239, 68, 68)",
      backgroundColor: "rgba(239, 68, 68, 0.5)",
    },
  ];

  return (
    <div className="p-4 bg-black/40 rounded-lg border border-green-800">
      <h2 className="text-lg font-bold mb-4 text-green-400">📈 Visualization</h2>
      <Line
        data={{ labels, datasets }}
        options={{
          responsive: true,
          plugins: { legend: { labels: { color: "white" } } },
          scales: {
            x: { ticks: { color: "white" } },
            y: { ticks: { color: "white" } },
          },
        }}
      />
    </div>
  );
}
