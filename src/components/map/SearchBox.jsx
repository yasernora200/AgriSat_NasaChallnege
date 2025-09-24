import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

function SearchBox({ setCoords, setSelectedGeom }) {
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

    map.on("geosearch/showlocation", (e) => {
      const { x: lon, y: lat, label } = e.location;
      const newCoords = { lat, lon };
      setCoords(newCoords);

      //  هنا نولّد GeoJSON Point
      const pointGeom = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [lon, lat],
        },
        properties: { label },
      };

      setSelectedGeom(pointGeom);

      // Placeholder للـ backend
      sendFarmLocation(newCoords, pointGeom);

      console.log("📍 Location found:", lat, lon, label);
    });

    return () => {
      map.removeControl(searchControl);
      map.off("geosearch/showlocation");
    };
  }, [map, setCoords, setSelectedGeom]);

  async function sendFarmLocation(coords, geom) {
    console.log("📤 Placeholder: send to backend", coords, geom);
  }

  return null;
}

export default SearchBox;
