import { useState } from "react";
import { jsPDF } from "jspdf";

export default function WhatIf() {
  const [action, setAction] = useState("");
  const [report, setReport] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();

    let generatedReport = "";
    if (action === "irrigation") {
      generatedReport =
        "💧 إذا زودت الري بنسبة 20%، من المتوقع تحسن رطوبة التربة وزيادة NDVI بمقدار 0.1 خلال أسبوعين.";
    } else if (action === "fertilizer") {
      generatedReport =
        "🌾 إذا ضفت سماد نيتروجيني إضافي، المحصول هيبقى أكثر خضرة ولكن زود الري لتفادي الإجهاد.";
    } else if (action === "pesticide") {
      generatedReport =
        "🪲 إذا استخدمت المبيدات، احتمال تقلل الإصابة بالآفات 40% لكن تابع الأثر على NDVI.";
    } else {
      generatedReport = "⚠️ من فضلك اختر إجراء لتحليل ماذا لو.";
    }

    setReport(generatedReport);
  }

  function downloadPDF() {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("📑 What-If Analysis Report", 20, 20);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Action: ${action}`, 20, 40);
    doc.text("Report:", 20, 55);

    // يكتب النص على أسطر متعددة لو طويل
    const splitReport = doc.splitTextToSize(report, 170);
    doc.text(splitReport, 20, 65);

    doc.save("WhatIf_Report.pdf");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black via-green-950 to-black text-white p-6">
      <h2 className="text-2xl font-bold text-green-400 mb-6"> 🌱 What If Action</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-black/40 p-6 rounded-lg border border-green-800 w-full max-w-md"
      >
        <label className="block mb-2 text-gray-300">Choose an action:</label>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg bg-black/60 text-white border border-green-600"
        >
          <option value="">-- Select --</option>
          <option value="irrigation">💧 Increase Irrigation</option>
          <option value="fertilizer">🌾 Add Fertilizer</option>
          <option value="pesticide">🪲 Apply Pesticide</option>
        </select>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-500 py-2 rounded-lg font-semibold"
        >
          Generate Report
        </button>
      </form>

      {report && (
        <div className="mt-6 bg-black/40 p-4 rounded-lg border border-green-800 w-full max-w-md">
          <h3 className="text-lg font-bold text-green-400 mb-2">📑 Report</h3>
          <p className="text-gray-200 mb-4">{report}</p>

          {/* زرار تحميل PDF */}
          <button
            onClick={downloadPDF}
            className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded-lg font-semibold"
          >
            ⬇️ Download PDF
          </button>
        </div>
      )}
    </div>
  );
}
