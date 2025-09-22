export default function CropSelector({ selectedCrop, setSelectedCrop }) {
  return (
    <>
      <label className="block mb-2 text-gray-200 font-medium">Change Crop:</label>
      <select
        value={selectedCrop}
        onChange={(e) => setSelectedCrop(e.target.value)}
        className="mb-4 w-full p-2 rounded-lg bg-black/50 border border-green-600 text-white"
      >
        <option value="wheat">🌾 Wheat</option>
        <option value="corn">🌽 Corn</option>
        <option value="rice">🍚 Rice</option>
      </select>
    </>
  );
}
