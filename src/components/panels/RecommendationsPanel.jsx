import React from 'react'


export default function RecommendationsPanel({ timeSeries }){
const recs = []
const latestNDVI = timeSeries.ndvi?.slice(-1)[0]?.ndvi
if(latestNDVI && latestNDVI < 0.35) recs.push('📉 NDVI منخفض → أوصي بالتسميد.')
else if(latestNDVI) recs.push('🌱 NDVI جيد → استمر بالمراقبة.')


return (
<div className="p-2">
<h3 className="font-bold">Recommendations</h3>
<ul className="list-disc ml-5 mt-2">
{recs.map((r,i)=>(<li key={i}>{r}</li>))}
</ul>
</div>
)
}