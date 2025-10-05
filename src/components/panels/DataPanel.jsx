
export default function DataPanel({ selectedGeom, setTimeSeries }){
function fetchData(){
if(!selectedGeom) return alert('Select a farm first')
// Demo: محاكاة بيانات NDVI
const ts = []
const today = new Date()
for(let i=30; i>=0; i--){
const d = new Date(today)
d.setDate(today.getDate() - i)
ts.push({ date: d.toISOString().slice(0,10), ndvi: 0.4+Math.random()*0.4 })
}
setTimeSeries(tsOld => ({ ...tsOld, ndvi: ts }))
}


return (
<div className="p-2">
<h3 className="font-bold">Data Panel</h3>
<button className="bg-blue-600 text-white px-3 py-1 rounded mt-2" onClick={fetchData}>جلب بيانات (تجريبية)</button>
</div>
)
}