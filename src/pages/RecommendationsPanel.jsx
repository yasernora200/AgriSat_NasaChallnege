import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RecommendationsPanel({ timeSeries }) {
  const navigate = useNavigate();
  const [crop, setCrop] = useState(""); // ⬅️ هنا المستخدم يختار المحصول

  const latestNDVI = timeSeries.ndvi[timeSeries.ndvi.length - 1];
  const latestSM = timeSeries.sm[timeSeries.sm.length - 1];

  function getCropRecommendations() {
    if (!crop) return ["Please select your crop first 🌱"];

    const recs = [];

    // ✅ توصيات NDVI
    if (latestNDVI < 0.3) {
      recs.push(
        `${crop} health is weak (NDVI=${latestNDVI}). Consider fertilizer 🌱`
      );
    } else {
      recs.push(`${crop} health is good (NDVI=${latestNDVI}). ✅`);
    }

    // ✅ توصيات الرطوبة حسب المحصول
    if (crop === "wheat") {
      if (latestSM < 25) recs.push("Wheat needs irrigation 💧");
      else recs.push("Soil moisture is optimal for wheat.");
    } else if (crop === "rice") {
      if (latestSM < 40) recs.push("Rice needs a lot of water → Irrigate more 💦");
      else recs.push("Soil moisture is optimal for rice.");
    } else if (crop === "corn") {
      if (latestSM < 30) recs.push("Corn is thirsty → Irrigation needed 🌽");
      else recs.push("Soil moisture is optimal for corn.");
    }

    // ✅ توصيات عامة
    recs.push(
      `Rainfall trend: ${timeSeries.rain.join(", ")} mm → adjust irrigation accordingly.`
    );
    recs.push("Temperature is rising → monitor heat stress 🌡");

    return recs;
  }

  const recommendations = getCropRecommendations();

  return (
    <div className="p-4 mt-4 bg-black/40 rounded-lg border border-green-800">
      <h2 className="text-lg font-bold mb-2 text-green-400">🤖 Recommendations</h2>

      {/* اختيار المحصول */}
      <label className="block mb-2 text-gray-300">Select your crop:</label>
      <select
        value={crop}
        onChange={(e) => setCrop(e.target.value)}
        className="mb-4 w-full p-2 rounded-lg bg-black/50 border border-green-600 text-white"
      >
        <option value="">-- Choose Crop --</option>
        <option value="wheat">🌾 Wheat</option>
        <option value="rice">🍚 Rice</option>
        <option value="corn">🌽 Corn</option>
      </select>

      {/* التوصيات */}
      <ul className="text-sm text-gray-300 list-disc pl-4 space-y-1">
        {recommendations.map((rec, idx) => (
          <li key={idx}>{rec}</li>
        ))}
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
