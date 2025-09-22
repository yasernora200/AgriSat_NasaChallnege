

import { useState } from "react";
import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import FarmMap from "../components/map/FarmMap";
import DataPanel from "./DataPanel";
import RecommendationsPanel from "./RecommendationsPanel";
import VisualizationPanel from "./VisualizationPanel";

export default function Dashboard() {
  const [selectedGeom, setSelectedGeom] = useState(null);
  const [timeSeries, setTimeSeries] = useState({
    ndvi: [0.3, 0.4, 0.6, 0.7],
    sm: [20, 35, 40, 30], // Soil Moisture
    rain: [5, 10, 2, 0], // Rainfall
    temp: [25, 27, 29, 31], // Temperature
  });

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-black via-green-950 to-black text-white">
      <Header />
      <div className="flex flex-1">
        {/* ===== Left Sidebar ===== */}
        <Sidebar position="left">
          <DataPanel selectedGeom={selectedGeom} setTimeSeries={setTimeSeries}/>
          <RecommendationsPanel timeSeries={timeSeries} />
        </Sidebar>

        {/* ===== Map in the Middle ===== */}
        <div className="flex-1 border-x border-green-900/30">
          <FarmMap selectedGeom={selectedGeom} setSelectedGeom={setSelectedGeom} />
        </div>

        {/* ===== Right Sidebar ===== */}
        <Sidebar position="right">
          <VisualizationPanel timeSeries={timeSeries} />
        </Sidebar>
      </div>
    </div>
  );
}
