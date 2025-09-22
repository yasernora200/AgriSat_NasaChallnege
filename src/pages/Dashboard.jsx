import  { useState } from 'react'
import Header from '../components/layout/Header'
import Sidebar from '../components/layout/Sidebar'
import FarmMap from '../components/map/FarmMap'
import DataPanel from '../components/panels/DataPanel'
import RecommendationsPanel from '../components/panels/RecommendationsPanel'
import VisualizationPanel from '../components/panels/VisualizationPanel'


export default function Dashboard(){
const [selectedGeom, setSelectedGeom] = useState(null)
const [timeSeries, setTimeSeries] = useState({ ndvi: [], sm: [], rain: [] })


return (
<div className="h-screen flex flex-col">
<Header />
<div className="flex flex-1">
<Sidebar>
<DataPanel selectedGeom={selectedGeom} setTimeSeries={setTimeSeries} />
<RecommendationsPanel timeSeries={timeSeries} />
</Sidebar>
<div className="flex-1">
<FarmMap selectedGeom={selectedGeom} setSelectedGeom={setSelectedGeom} />
</div>
<Sidebar position="right">
<VisualizationPanel timeSeries={timeSeries} />
</Sidebar>
</div>
</div>
)
}