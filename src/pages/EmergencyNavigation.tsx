import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Ambulance } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L, { LatLngExpression } from "leaflet";

// -------------------- Types --------------------
type HospitalType = "Private" | "Government" | "Unknown";

interface Hospital {
  id: string;
  name: string;
  lat: number;
  lon: number;
  address?: string;
  type: HospitalType;
  doctorAvailable: boolean;
  distance: number; // ⬅ added distance field
}

// -------------------- Distance Calculation --------------------
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// -------------------- Map helper to recenter --------------------
const RecenterMap = ({ position }: { position: LatLngExpression }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position, 13);
  }, [position, map]);
  return null;
};

// -------------------- Custom Icons --------------------
const userIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconAnchor: [12, 41],
});

const hospitalIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2966/2966327.png",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

// -------------------- Classify hospital --------------------
const classifyHospital = (name: string, tags: any) => {
  const lowerName = (name || "").toLowerCase();
  const operatorType = (tags?.["operator:type"] || "").toLowerCase();
  const ownership = (tags?.["ownership"] || "").toLowerCase();

  let type: HospitalType = "Unknown";

  if (operatorType === "government" || ownership === "government") {
    type = "Government";
  } else if (operatorType === "private" || ownership === "private") {
    type = "Private";
  } else {
    const govtKeywords = [
      "govt",
      "government",
      "civil hospital",
      "general hospital",
      "district hospital",
      "medical college",
      "state hospital",
    ];

    const isGovt = govtKeywords.some((k) => lowerName.includes(k));
    type = isGovt ? "Government" : "Private";
  }

  const doctorAvailable = type === "Government" ? false : true;

  return { type, doctorAvailable };
};

// -------------------- Main Component --------------------
const EmergencyNavigation = () => {
  const [userPosition, setUserPosition] = useState<LatLngExpression | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fallbackPosition: LatLngExpression = [12.9716, 77.5946]; // Bengaluru

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPosition([latitude, longitude]);
        fetchHospitals(latitude, longitude);
      },
      () => {
        setError("Unable to get your location. Showing default city.");
        setUserPosition(fallbackPosition);
        const [lat, lon] = fallbackPosition as [number, number];
        fetchHospitals(lat, lon);
      }
    );
  }, []);

  const fetchHospitals = async (lat: number, lon: number) => {
    try {
      setLoading(true);
      const query = `
        [out:json];
        (
          node["amenity"="hospital"](around:5000,${lat},${lon});
          way["amenity"="hospital"](around:5000,${lat},${lon});
          relation["amenity"="hospital"](around:5000,${lat},${lon});
        );
        out center;
      `;

      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
      });

      const data = await res.json();

      const parsed: Hospital[] = data.elements.map((el: any) => {
        const center = el.type === "node" ? el : el.center;
        const name = el.tags?.name || "Unnamed Hospital";
        const address =
          el.tags?.["addr:full"] ||
          `${el.tags?.["addr:street"] || ""} ${el.tags?.["addr:city"] || ""}`.trim() ||
          undefined;

        const { type, doctorAvailable } = classifyHospital(name, el.tags || {});

        return {
          id: `${el.type}-${el.id}`,
          name,
          lat: center.lat,
          lon: center.lon,
          address,
          type,
          doctorAvailable,
          distance: calculateDistance(lat, lon, center.lat, center.lon), // ⬅ add distance
        };
      });

      // Sort nearest → farthest
      parsed.sort((a, b) => a.distance - b.distance);

      setHospitals(parsed);
      setLoading(false);
    } catch (err) {
      setError("Failed to load hospitals.");
      setLoading(false);
    }
  };

  const getDirectionsUrl = (lat: number, lon: number) =>
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;

  const positionToUse = userPosition || fallbackPosition;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />

      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center mb-6 gap-2">
          <div className="p-2 bg-gradient-medical rounded-full shadow-medical">
            <Ambulance className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Emergency Navigation</h1>
        </div>

        {/* Map Card */}
        <Card className="shadow-card-medical border-medical-border bg-gradient-card mb-8">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Live Map & Nearby Hospitals</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="w-full h-[380px] rounded-xl overflow-hidden border border-medical-border">
              <MapContainer
                center={positionToUse}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
              >
                <RecenterMap position={positionToUse} />

                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User Marker */}
                <Marker position={positionToUse} icon={userIcon}>
                  <Popup>
                    <strong>You</strong>
                    <br />
                    Current Location
                  </Popup>
                </Marker>

                {/* Hospital Markers */}
                {hospitals.map((h) => (
                  <Marker key={h.id} position={[h.lat, h.lon]} icon={hospitalIcon}>
                    <Popup>
                      <strong>{h.name}</strong>
                      <br />
                      {h.address || "Address not available"}
                      <br />
                      Type: {h.type}
                      <br />
                      Doctor Availability: {h.doctorAvailable ? "Yes" : "No"}
                      <br />
                      Distance: {h.distance.toFixed(2)} km
                      <br />
                      <a href={getDirectionsUrl(h.lat, h.lon)} target="_blank" className="text-primary underline">
                        Get Directions
                      </a>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </CardContent>
        </Card>

        {/* List Section */}
        <h2 className="text-xl font-semibold text-foreground mb-4">Nearby Hospitals</h2>

        {loading ? (
          <p className="text-muted-foreground">Finding hospitals near you...</p>
        ) : (
          <div className="space-y-4">
            {hospitals.map((h) => (
              <div key={h.id} className="bg-white rounded-xl shadow-medical border p-4">
                <p className="font-semibold">{h.name}</p>
                <p className="text-sm text-muted-foreground">{h.address || "Address not available"}</p>
                <p className="text-sm">
                  <span className="font-medium">Type:</span> {h.type}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Doctor Availability:</span>{" "}
                  {h.doctorAvailable ? "Yes" : "No"}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Distance:</span> {h.distance.toFixed(2)} km
                </p>
                <a
                  href={getDirectionsUrl(h.lat, h.lon)}
                  target="_blank"
                  className="text-sm text-primary font-medium"
                >
                  Get Directions
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyNavigation;
