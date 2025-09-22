import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'


export default function VisualizationPanel({ timeSeries }){
return (
<div className="p-2">
<h3 className="font-bold">Visualization</h3>
<LineChart width={300} height={150} data={timeSeries.ndvi || []}>
<CartesianGrid strokeDasharray="3 3" />
<XAxis dataKey="date" hide />
<YAxis />
<Tooltip />
<Line type="monotone" dataKey="ndvi" stroke="#4caf50" />
</LineChart>
</div>
)
}