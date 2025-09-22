import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ⬅️ React Router v6
import { analyzeAction } from "../components/report/analysisEngine";
import ReportGenerator from "../components/report/ReportGenerator";

export default function WhatIfChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 أهلاً! اسألني: مثلاً (قمح + ري)" },
  ]);
  const [input, setInput] = useState("");
  const [reportData, setReportData] = useState(null);

  function handleSend(e) {
    e.preventDefault();

    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    let crop = "";
    let action = "";

    if (input.includes("قمح")) crop = "wheat";
    if (input.includes("ري")) action = "irrigation";
    if (input.includes("سماد")) action = "fertilizer";

    const { report, chartData } = analyzeAction(crop, action);

    const botMsg = { sender: "bot", text: report };
    setMessages((prev) => [...prev, botMsg]);
    setReportData({ crop, action, report, chartData });
    setInput("");
  }

  // زر تسجيل الخروج
  function handleLogout() {
    navigate("/"); // بيرجع للصفحة الرئيسية
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black via-green-950 to-black text-white">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-2xl font-bold text-green-400">🌱 What If Chat</h2>
<button
  onClick={handleLogout}
  className="px-4 py-2 border border-green-500 text-green-400 hover:bg-green-600/20 rounded-lg font-semibold shadow-md"
>
  🚪 Logout
</button>

      </div>

      {/* رسائل الشات */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-lg max-w-md ${
              msg.sender === "user"
                ? "bg-green-700 ml-auto"
                : "bg-black/50 border border-green-800"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* إدخال */}
      <form onSubmit={handleSend} className="flex p-4 gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 rounded-lg bg-black/60 border border-green-600 text-white"
          placeholder="اكتب سؤالك هنا..."
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg"
        >
          ➤
        </button>
      </form>

      {/* تقرير كامل */}
      {reportData && (
        <ReportGenerator
          crop={reportData.crop}
          action={reportData.action}
          report={reportData.report}
          chartData={reportData.chartData}
        />
      )}
    </div>
  );
}
