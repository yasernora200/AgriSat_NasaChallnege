import { useRef, useState } from "react";
import { MapContainer, TileLayer, FeatureGroup, GeoJSON } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import SearchBox from "./SearchBox";
import { handleFileUpload } from "./handleFileUpload";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-geosearch/dist/geosearch.css";

export default function FarmMap({ selectedGeom, setSelectedGeom }) {
  const fg = useRef(null);
  const [coords, setCoords] = useState(null);
  //-------------------------------------------------------------------------
  //هنا هبعت الاحداثيات للباك اند واستقبل منه الداتا

  //  دالة مؤقتة تبعت للـ backend (Placeholder)
  // async function sendFarmLocation(coords, geom) {
  //   try {
  //     const response = await fetch("http://localhost:5000/api/farm-data", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         location: coords, // { lat: 30.05, lon: 31.25 }
  //         geometry: geom,   // GeoJSON
  //       }),
  //     });

  // ⛔️ Placeholder: هنا مفروض تستقبلي الداتا من الـ backend
  // const data = await response.json();
  // console.log("✅ Data from backend:", data);

  // ⛔️ بعد ما الباك إند يجهز، هنا هتحفظي الداتا:
  // setTimeSeries(data.time_series);

  //     console.log("📤 Sent to backend:", { coords, geom });
  //   } catch (err) {
  //     console.error("❌ Error sending farm location:", err);
  //   }
  // }
  //-------------------------------------------------------------------------

  //دي دالة built in leafleat بتجيب الاحداثيات 

  function _onCreated(e) {
    const layer = e.layer;
    const geojson = layer.toGeoJSON();
    setSelectedGeom(geojson);

    if (geojson.geometry.type === "Polygon") {
      const [lon, lat] = geojson.geometry.coordinates[0][0];
      const newCoords = { lat, lon };
      setCoords(newCoords);

      //  ابعتي للـ backend (دلوقتي Placeholder)
      // sendFarmLocation(newCoords, geojson);
    }
  }



  return (
    <div className="p-4 bg-black/30 rounded-2xl border border-green-700 shadow-lg">
      <h2 className="text-lg font-bold mb-3 text-green-400">
        🗺️ Select Your Farm Area
      </h2>

      <div className="rounded-xl overflow-hidden border border-green-600 shadow-md bg-black/40">
        <MapContainer
          center={[30, 31]}
          zoom={6}
          style={{ height: "500px", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <SearchBox setCoords={setCoords} setSelectedGeom={setSelectedGeom} />

          <FeatureGroup ref={fg}>
            <EditControl
              position="topright"
              onCreated={_onCreated}
              draw={{ rectangle: true, polygon: true }}
            />
            {selectedGeom && <GeoJSON data={selectedGeom} />}
          </FeatureGroup>
        </MapContainer>

        {coords && (
          <div className="p-3 bg-black/60 border-t border-green-600 text-green-300 text-sm text-center">
            📍 Selected Coordinates: Lat {coords.lat.toFixed(4)}, Lon{" "}
            {coords.lon.toFixed(4)}
          </div>
        )}
      </div>

      <div className="mt-4">
        <label className="block mb-2 text-gray-300">
          📂 Or Upload GeoJSON File:
        </label>
        <input
          type="file"
          accept=".json,.geojson"
          onChange={(e) =>
            handleFileUpload(e, setSelectedGeom, setCoords, sendFarmLocation)
          }
          className="block w-full text-sm text-gray-300 
             file:mr-4 file:py-2 file:px-4 
             file:rounded-lg file:border-0 
             file:text-sm file:font-semibold 
             file:bg-green-600 file:text-white 
             hover:file:bg-green-500"
        />
      </div>
    </div>
  );
}
