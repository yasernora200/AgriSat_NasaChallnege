import { useState, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
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
} from "chart.js";

import CropSelector from "./CropSelector";
import ReportText from "./ReportText";
import ChartSelector from "./ChartSelector";

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

export default function ReportGenerator({ crop, action, report, chartData }) {
  const [selectedCrop, setSelectedCrop] = useState(crop || "wheat");
  const [chartType, setChartType] = useState("line");
  const chartRef = useRef();

  const chartDataConfig = {
    labels: chartData.labels,
    datasets: [
      {
        label: "NDVI",
        data: chartData.ndvi,
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.5)",
      },
      {
        label: "Soil Moisture (%)",
        data: chartData.sm,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: "white" } } },
    scales: {
      x: { ticks: { color: "white" } },
      y: { ticks: { color: "white" } },
    },
  };

  async function downloadPDF() {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("📑 What-If Analysis Report", 20, 20);

    doc.setFontSize(12);
    doc.text(`Crop: ${selectedCrop}`, 20, 40);
    doc.text(`Action: ${action}`, 20, 50);

    const splitReport = doc.splitTextToSize(report, 170);
    doc.text("Report:", 20, 65);
    doc.text(splitReport, 20, 75);

    const chartCanvas = chartRef.current.canvas;
    const canvasImg = await html2canvas(chartCanvas);
    const imgData = canvasImg.toDataURL("image/png");
    doc.addImage(imgData, "PNG", 20, 100, 170, 80);

    doc.save("WhatIf_Report.pdf");
  }

  return (
    <div className="flex justify-center">
      <div className="w-3/5 p-6 bg-gradient-to-r from-green-900/80 to-blue-900/80 border border-green-700 rounded-2xl mt-6 shadow-lg">
        <h3 className="text-xl font-bold text-yellow-300 mb-4">📊 What-If Report</h3>

        <CropSelector selectedCrop={selectedCrop} setSelectedCrop={setSelectedCrop} />
        <ReportText report={report} />
        <ChartSelector
          chartType={chartType}
          setChartType={setChartType}
          chartDataConfig={chartDataConfig}
          chartOptions={chartOptions}
          chartData={chartData}
          chartRef={chartRef}
        />

        <button
          onClick={downloadPDF}
          className="mt-6 w-full bg-yellow-600 hover:bg-yellow-500 py-2 rounded-lg font-semibold text-black"
        >
          ⬇️ Download PDF
        </button>
      </div>
    </div>
  );
}
