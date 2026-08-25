import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { MapPin, Search, X, LoaderCircle } from "lucide-react";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = {
  lat: 20.5937,
  lng: 78.9629,
};

function MapCenterTracker({ onChange }) {
  const map = useMap();

  useMapEvents({
    moveend() {
      const center = map.getCenter();

      onChange({
        lat: center.lat,
        lng: center.lng,
      });
    },
  });

  return null;
}

function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    // Important when the map is opened inside a modal.
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);

  return null;
}

function SearchLocation({
  selectedLocation,
  onSelect,
}) {
  const map = useMap();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const searchLocation = async () => {
    const cleanQuery = query.trim();

    if (!cleanQuery) return;

    setSearching(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(
          cleanQuery
        )}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Location search failed."
        );
      }

      const data = await response.json();

      setResults(data);
    } catch (error) {
      console.error(
        "Map location search error:",
        error
      );

      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectResult = (result) => {
    const lat = Number(result.lat);
    const lng = Number(result.lon);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      return;
    }

    map.setView([lat, lng], 16);

    onSelect({
      lat,
      lng,
      address: result.display_name,
    });

    setResults([]);
    setQuery("");
  };

  return (
    <div className="absolute left-3 right-3 top-3 z-[1000]">
      <div className="relative">
        <div className="flex overflow-hidden rounded-xl bg-white shadow-lg dark:bg-gray-900">
          <input
            type="text"
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchLocation();
              }
            }}
            placeholder="Search area, city or address..."
            className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none dark:text-white"
          />

          <button
            type="button"
            onClick={searchLocation}
            disabled={
              searching || !query.trim()
            }
            className="px-4 text-blue-600 disabled:opacity-50"
          >
            {searching ? (
              <LoaderCircle
                size={18}
                className="animate-spin"
              />
            ) : (
              <Search size={18} />
            )}
          </button>
        </div>

        {results.length > 0 && (
          <div className="mt-2 max-h-52 overflow-y-auto rounded-xl bg-white shadow-xl dark:bg-gray-900">
            {results.map((result) => (
              <button
                key={result.place_id}
                type="button"
                onClick={() =>
                  selectResult(result)
                }
                className="block w-full border-b border-gray-100 px-4 py-3 text-left text-sm last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:text-white dark:hover:bg-gray-800"
              >
                {result.display_name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MapLocationPicker({
  initialLocation,
  onConfirm,
  onClose,
}) {
  const savedLat = Number(
    initialLocation?.lat
  );

  const savedLng = Number(
    initialLocation?.lng
  );

  const initialCenter =
    Number.isFinite(savedLat) &&
    Number.isFinite(savedLng)
      ? {
          lat: savedLat,
          lng: savedLng,
        }
      : DEFAULT_CENTER;

  const [selectedLocation, setSelectedLocation] =
    useState(initialCenter);

  const [saving, setSaving] = useState(false);

  const [selectedAddress, setSelectedAddress] =
    useState("");

  const handleMapMove = (location) => {
    setSelectedLocation(location);
    setSelectedAddress("");
  };

  const handleSearchSelect = (location) => {
    setSelectedLocation({
      lat: location.lat,
      lng: location.lng,
    });

    setSelectedAddress(
      location.address || ""
    );
  };

  const confirmLocation = async () => {
    if (!selectedLocation || saving) return;

    setSaving(true);

    try {
      await onConfirm(
        selectedLocation.lat,
        selectedLocation.lng,
        selectedAddress
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm">
      <div className="relative flex h-[90dvh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900">
        {/* Header */}

        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Pick your location
            </h2>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Move the map so the pin is at your
              desired location.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Map */}

        <div className="relative min-h-0 flex-1">
          <MapContainer
            center={[
              initialCenter.lat,
              initialCenter.lng,
            ]}
            zoom={15}
            scrollWheelZoom
            className="h-full w-full"
            zoomControl
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapResizeHandler />

            <MapCenterTracker
              onChange={handleMapMove}
            />

            <SearchLocation
              selectedLocation={
                selectedLocation
              }
              onSelect={handleSearchSelect}
            />
          </MapContainer>

          {/* Fixed center pin */}

          <div className="pointer-events-none absolute left-1/2 top-1/2 z-[999] -translate-x-1/2 -translate-y-full">
            <MapPin
              size={42}
              fill="currentColor"
              strokeWidth={1.5}
              className="text-red-500 drop-shadow-lg"
            />
          </div>
        </div>

        {/* Bottom panel */}

        <div className="shrink-0 border-t border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Selected location
            </p>

            {selectedAddress && (
              <p className="mt-1 truncate text-sm font-medium text-gray-900 dark:text-white">
                {selectedAddress}
              </p>
            )}

            <p className="mt-1 text-xs text-gray-500">
              {selectedLocation.lat.toFixed(6)},{" "}
              {selectedLocation.lng.toFixed(6)}
            </p>
          </div>

          <button
            type="button"
            onClick={confirmLocation}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
                Saving location...
              </>
            ) : (
              <>
                <MapPin size={18} />
                Confirm this location
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}