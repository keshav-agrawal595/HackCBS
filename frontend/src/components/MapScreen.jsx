import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet-routing-machine";

const destinations = [
  { name: "Mathura Junction Railway Station", coords: [27.4924, 77.6737] },
  { name: "Shri Krishna Janmasthan Temple", coords: [27.5044, 77.6844] },
  { name: "Vishram Ghat", coords: [27.4957, 77.6825] },
  { name: "Birla Mandir", coords: [27.5056, 77.6878] },
  { name: "GLA University", coords: [27.6050, 77.5970] },
  { name: "Prem Mandir, Vrindavan", coords: [27.5612, 77.6846] },
  { name: "Banke Bihari Temple", coords: [27.5745, 77.6994] },
];

function Routing({ source, destination }) {
  const map = useMap();

  useEffect(() => {
    if (!source || !destination) return;

    const routingControl = L.Routing.control({
      waypoints: [L.latLng(...source), L.latLng(...destination)],
      routeWhileDragging: false,
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [map, source, destination]);

  return null;
}

export const MapScreen = ({ visible, onClose }) => {
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);

  useEffect(() => {
    if (!visible) return;
    navigator.geolocation.getCurrentPosition((position) => {
      setSource([position.coords.latitude, position.coords.longitude]);
    });
  }, [visible]);

  const handleDestinationChange = (e) => {
    const selected = destinations.find((d) => d.name === e.target.value);
    if (selected) setDestination(selected.coords);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="p-4 bg-black text-white flex justify-between items-center">
        <span className="text-lg font-semibold">Route Planner</span>
        <div className="justify-end gap-4">
        <button className="p-2 bg-transparent border-0">
          <img src="voice.png" alt="AI Assitant" className="w-8 h-8" />
        </button>
        <button onClick={onClose} className="p-2 bg-transparent border-0">
          <img src="main-menu.png" alt="Main Menu" className="w-8 h-8" />
        </button>
        </div>
      </div>

      <div className="p-4">
        <select
          className="p-2 border rounded"
          onChange={handleDestinationChange}
          defaultValue=""
        >
          <option value="" disabled>Select Destination</option>
          {destinations.map((dest, i) => (
            <option key={i} value={dest.name}>{dest.name}</option>
          ))}
        </select>
      </div>

      {source && (
        <MapContainer
          center={source}
          zoom={13}
          style={{ height: "100%", flex: 1 }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {destination && <Routing source={source} destination={destination} />}
        </MapContainer>
      )}
    </div>
  );
};
