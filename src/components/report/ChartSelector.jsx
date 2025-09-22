import { Line, Bar, Pie } from "react-chartjs-2";

export default function ChartSelector({ chartType, setChartType, chartDataConfig, chartOptions, chartData, chartRef }) {
  return (
    <>
      {/* أزرار اختيار نوع الرسم */}
      <div className="flex gap-2 mb-4">
        {["line", "bar", "pie"].map((type) => (
          <button
            key={type}
            onClick={() => setChartType(type)}
            className={`px-3 py-1 rounded-lg ${
              chartType === type ? "bg-green-600" : "bg-gray-700"
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* الرسم البياني */}
      <div className="flex justify-center">
        <div className="w-3/5 bg-black/30 p-4 rounded-lg">
          {chartType === "line" && <Line ref={chartRef} data={chartDataConfig} options={chartOptions} />}
          {chartType === "bar" && <Bar ref={chartRef} data={chartDataConfig} options={chartOptions} />}
          {chartType === "pie" && (
            <Pie
              ref={chartRef}
              data={{
                labels: ["NDVI", "Soil Moisture"],
                datasets: [
                  {
                    data: [
                      chartData.ndvi.reduce((a, b) => a + b, 0),
                      chartData.sm.reduce((a, b) => a + b, 0),
                    ],
                    backgroundColor: [
                      "rgba(34, 197, 94, 0.7)",
                      "rgba(59, 130, 246, 0.7)",
                    ],
                  },
                ],
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}
