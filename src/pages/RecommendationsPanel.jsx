import { useNavigate } from "react-router-dom";

export default function RecommendationsPanel({ timeSeries }) {
  const navigate = useNavigate();

  return (
    <div className="p-4 mt-4 bg-black/40 rounded-lg border border-green-800">
      <h2 className="text-lg font-bold mb-2 text-green-400">
        🤖 Recommendations
      </h2>
      <ul className="text-sm text-gray-300 list-disc pl-4 space-y-1">
        <li>
          NDVI is at {timeSeries.ndvi[timeSeries.ndvi.length - 1]} → Crop health
          is <span className="text-green-400">Good</span>.
        </li>
        <li>
          Soil Moisture: {timeSeries.sm[timeSeries.sm.length - 1]}% →{" "}
          {timeSeries.sm[timeSeries.sm.length - 1] < 25
            ? "Irrigation needed 💧"
            : "Optimal"}
        </li>
        <li>
          Rainfall trend: {timeSeries.rain.join(", ")} mm → adjust irrigation.
        </li>
        <li>Temperature is rising → monitor heat stress 🌡.</li>
      </ul>

      {/* زرار ماذا لو */}
      <button
        onClick={() => navigate("/what-if")}
        className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-semibold"
      >
        🌱 What If Action
      </button>
    </div>
  );
}
