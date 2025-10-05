export default function DataPanel({ selectedGeom, setTimeSeries }) {
  return (
    <div className="p-4 mb-4 bg-black/40 rounded-lg border border-green-800">
      <h2 className="text-lg font-bold mb-2 text-green-400">📊 Data Panel</h2>
      {selectedGeom ? (
        <div>
          <p className="text-sm text-gray-300 mb-2">
            You selected an area on the map.
          </p>
          <button
          //Fetch real Data either JSON Or API about(NDVI,SoilMoisture,Rain,Temp)
            onClick={() =>
              setTimeSeries({
                ndvi: [0.2, 0.3, 0.5, 0.6],
                sm: [15, 25, 35, 40],
                rain: [2, 12, 5, 0],
                temp: [24, 26, 28, 30],
              })
            }
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm"
          >
            Load Mock Data
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-400">
          🖱️ Please draw a rectangle or polygon on the map.
        </p>
      )}
    </div>
  );
}
