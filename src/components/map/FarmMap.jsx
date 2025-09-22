import  { useRef } from 'react'
import { MapContainer, TileLayer, FeatureGroup, GeoJSON } from 'react-leaflet'
import { EditControl } from 'react-leaflet-draw'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'


export default function FarmMap({ selectedGeom, setSelectedGeom }){
const fg = useRef(null)


function _onCreated(e){
const layer = e.layer
const geojson = layer.toGeoJSON()
setSelectedGeom(geojson)
}


return (
<MapContainer center={[30, 31]} zoom={6} style={{height: '100%', width: '100%'}}>
<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
<FeatureGroup ref={fg}>
<EditControl position="topright" onCreated={_onCreated} draw={{ rectangle: true, polygon: true }} />
{selectedGeom && <GeoJSON data={selectedGeom} />}
</FeatureGroup>
</MapContainer>
)
}