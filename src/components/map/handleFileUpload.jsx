// utils/handleFileUpload.js

export function handleFileUpload(event, setSelectedGeom, setCoords, sendFarmLocation) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      setSelectedGeom(data);

      if (data.geometry?.coordinates) {
        const [lon, lat] = data.geometry.coordinates[0][0];
        const newCoords = { lat, lon };
        setCoords(newCoords);

        if (sendFarmLocation) {
          sendFarmLocation(newCoords, data);
        }
      }
    } catch (err) {
      alert("❌ الملف غير صالح. تأكد أنه بصيغة GeoJSON/JSON.");
    }
  };
  reader.readAsText(file);
}
