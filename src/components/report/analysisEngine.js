// analysisEngine.js
export function analyzeAction(crop, action) {
  let report = "";
  let chartData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    ndvi: [],
    sm: [],
  };

  if (crop === "wheat" && action === "irrigation") {
    report =
      "🌾 محصول: قمح\n💧 إجراء: زيادة الري\n✅ النتيجة: رطوبة التربة هتزيد، وNDVI هيتحسن 0.1 خلال أسبوعين.";
    chartData.ndvi = [0.3, 0.4, 0.5, 0.6];
    chartData.sm = [20, 30, 40, 45];
  } else if (crop === "wheat" && action === "fertilizer") {
    report =
      "🌾 محصول: قمح\n🌱 إجراء: إضافة سماد\n✅ النتيجة: زيادة النمو الأخضر لكن محتاج متابعة للري.";
    chartData.ndvi = [0.3, 0.5, 0.6, 0.7];
    chartData.sm = [20, 25, 30, 28];
  } else {
    report = "⚠️ لسه مفيش بيانات كافية للتحليل ده.";
    chartData.ndvi = [0.2, 0.2, 0.2, 0.2];
    chartData.sm = [20, 20, 20, 20];
  }

  return { report, chartData };
}
