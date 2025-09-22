import { useRef, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  FeatureGroup,
  GeoJSON,
  useMap,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";

import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-geosearch/dist/geosearch.css";

export default function FarmMap({ selectedGeom, setSelectedGeom }) {
  const fg = useRef(null);

  function _onCreated(e) {
    const layer = e.layer;
    const geojson = layer.toGeoJSON();
    setSelectedGeom(geojson);
  }

  // === تحميل ملف GeoJSON ===
  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result); // محتوى الملف
        setSelectedGeom(data); // تعيين المنطقة من الملف
      } catch (err) {
        alert("❌ الملف غير صالح. تأكد أنه بصيغة GeoJSON/JSON.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="p-4 bg-black/30 rounded-2xl border border-green-700 shadow-lg">
      <h2 className="text-lg font-bold mb-3 text-green-400">
        🗺️ Select Your Farm Area
      </h2>

      <div className="rounded-xl overflow-hidden border border-green-600 shadow-md">
        <MapContainer
          center={[30, 31]}
          zoom={6}
          style={{ height: "500px", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Search Box */}
          <SearchBox />

          <FeatureGroup ref={fg}>
            <EditControl
              position="topright"
              onCreated={_onCreated}
              draw={{ rectangle: true, polygon: true }}
            />
            {selectedGeom && <GeoJSON data={selectedGeom} />}
          </FeatureGroup>
        </MapContainer>
      </div>

      {/* زرار رفع ملف */}
      <div className="mt-4">
        <label className="block mb-2 text-gray-300">
          📂 Or Upload GeoJSON File:
        </label>
        <input
          type="file"
          accept=".json,.geojson"
          onChange={handleFileUpload}
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

// ============ Component for Search =============
function SearchBox() {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = new GeoSearchControl({
      provider: provider,
      style: "bar",
      showMarker: true,
      showPopup: true,
      marker: { draggable: false },
      retainZoomLevel: false,
      animateZoom: true,
      autoClose: true,
      searchLabel: "Search for a place...",
      keepResult: true,
    });

    map.addControl(searchControl);

    return () => map.removeControl(searchControl);
  }, [map]);

  return null;
}
