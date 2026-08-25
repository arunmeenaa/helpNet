import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MapPin, Search, X, LoaderCircle } from "lucide-react";

import {
  getCachedLocationName,
  getLocationName,
} from "../../services/locationService";

import {
  updateCurrentLocation,
  syncCurrentLocation,
} from "../../services/profileService";
import MapLocationPicker from "./MapLocationPicker";

export default function LocationSelector() {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Initial user parse error:", error);
      return null;
    }
  });

  const cachedLocationName = getCachedLocationName();
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [locationName, setLocationName] = useState(cachedLocationName || "");
  const [locationLoading, setLocationLoading] = useState(!cachedLocationName);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleUserUpdate = () => {
      try {
        const storedUser = localStorage.getItem("user");
        setUser(storedUser ? JSON.parse(storedUser) : null);
      } catch (error) {
        console.error("User sync error:", error);
      }
    };

    window.addEventListener("local-storage-update", handleUserUpdate);

    return () => {
      window.removeEventListener("local-storage-update", handleUserUpdate);
    };
  }, []);

  useEffect(() => {
    const latitude = user?.coordinates?.lat;
    const longitude = user?.coordinates?.lng;

    const invalidCoordinates =
      latitude === null ||
      latitude === undefined ||
      latitude === "" ||
      longitude === null ||
      longitude === undefined ||
      longitude === "" ||
      !Number.isFinite(Number(latitude)) ||
      !Number.isFinite(Number(longitude));

    if (invalidCoordinates) {
      setLocationLoading(false);
      setLocationName(getCachedLocationName() || "Location unavailable");
      return;
    }

    let cancelled = false;

    setLocationLoading(true);

    const loadLocationName = async () => {
      try {
        const name = await getLocationName(Number(latitude), Number(longitude));

        if (!cancelled) {
          setLocationName(name || "Location unavailable");
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Location lookup error:", error);
          setLocationName("Location unavailable");
        }
      } finally {
        if (!cancelled) {
          setLocationLoading(false);
        }
      }
    };

    loadLocationName();

    return () => {
      cancelled = true;
    };
  }, [user?.coordinates?.lat, user?.coordinates?.lng]);

  const resetModal = () => {
    setShowModal(false);
    setSearch("");
    setResults([]);
    setMessage("");
  };

  useEffect(() => {
    if (!showModal) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape" && !saving) {
        resetModal();
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showModal, saving]);

  const searchLocation = async (searchTerm = search, signal) => {
    const query = searchTerm.trim();

    if (query.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    setMessage("");

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(
          query,
        )}`,
        {
          headers: {
            Accept: "application/json",
          },
          signal,
        },
      );

      if (!response.ok) {
        throw new Error("Location search failed.");
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      if (error.name === "AbortError") return;

      console.error("Location search error:", error);
      setResults([]);
      setMessage("Unable to search location.");
    } finally {
      if (!signal?.aborted) {
        setSearching(false);
      }
    }
  };

  // Automatically search while typing
  useEffect(() => {
    if (!showModal) return undefined;

    const query = search.trim();
    const controller = new AbortController();

    if (query.length < 2) {
      setResults([]);
      setSearching(false);
      setMessage("");

      return () => controller.abort();
    }

    const timer = setTimeout(() => {
      searchLocation(query, controller.signal);
    }, 450);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, showModal]);

  const saveMapLocation = async (latitude, longitude, address) => {
    setSaving(true);
    setMessage("");

    try {
      const data = await updateCurrentLocation(
        latitude,
        longitude,
        null,
        "manual",
      );

      console.log("📍 Manual map location saved:", data);

      const storedUser = localStorage.getItem("user");

      const currentUser = storedUser ? JSON.parse(storedUser) : {};

      const updatedUser = {
        ...currentUser,
        coordinates: data.coordinates,
        locationUpdatedAt: data.locationUpdatedAt,
        locationSource: "manual",
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setUser(updatedUser);

      // Use the address selected from search when
      // available. Otherwise reverse-geocode the point.
      if (address) {
        setLocationName(address);
      } else {
        const name = await getLocationName(latitude, longitude);

        setLocationName(name || "Selected location");
      }

      window.dispatchEvent(new Event("local-storage-update"));

      setShowMapPicker(false);
      resetModal();

      console.log("✅ Manual location selected:", latitude, longitude);
    } catch (error) {
      console.error("Map location save error:", error);

      setMessage(error.message || "Failed to save selected location.");
    } finally {
      setSaving(false);
    }
  };

  const selectManualLocation = async (result) => {
    const latitude = Number(result.lat);
    const longitude = Number(result.lon);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setMessage("Invalid location coordinates.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const data = await updateCurrentLocation(
        latitude,
        longitude,
        null,
        "manual",
      );

      console.log("📍 Manual location saved:", data);

      const storedUser = localStorage.getItem("user");

      const currentUser = storedUser ? JSON.parse(storedUser) : {};

      const updatedUser = {
        ...currentUser,
        coordinates: data.coordinates,
        locationUpdatedAt: data.locationUpdatedAt,
        locationSource: "manual",
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setUser(updatedUser);

      const name = await getLocationName(latitude, longitude);

      setLocationName(name || result.display_name);

      window.dispatchEvent(new Event("local-storage-update"));

      setResults([]);
      setSearch("");
      setShowModal(false);
    } catch (error) {
      console.error("Manual location error:", error);

      setMessage(error.message || "Failed to save manual location.");
    } finally {
      setSaving(false);
    }
  };

  const useCurrentLocation = async () => {
    setSaving(true);
    setMessage("");

    try {
      console.log("📍 Requesting current GPS location...");

      const updatedUser = await syncCurrentLocation();

      console.log("📍 SYNC RESULT:", updatedUser);

      if (!updatedUser) {
        setMessage(
          "GPS found your location, but the location could not be saved. Please try again.",
        );
        return;
      }

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setUser(updatedUser);

      const latitude = Number(updatedUser.coordinates?.lat);

      const longitude = Number(updatedUser.coordinates?.lng);

      console.log("📍 SAVED COORDINATES:", latitude, longitude);

      if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
        const name = await getLocationName(latitude, longitude);

        setLocationName(name || "Location unavailable");
      }

      window.dispatchEvent(new Event("local-storage-update"));

      resetModal();
    } catch (error) {
      console.error("GPS location error:", error);

      setMessage(error.message || "Unable to save your current location.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        title="Change location"
        aria-label="Change location"
        className="flex w-full min-w-0 max-w-full items-center gap-2 rounded-full border border-white/30 bg-white/20 px-2.5 py-2 backdrop-blur-md transition hover:bg-white/30 dark:border-white/10 dark:bg-white/5 sm:max-w-[230px] sm:px-3"
      >
        {locationLoading ? (
          <LoaderCircle
            size={16}
            className="shrink-0 animate-spin text-blue-500"
            aria-hidden="true"
          />
        ) : (
          <MapPin
            size={16}
            className="shrink-0 text-red-500"
            aria-hidden="true"
          />
        )}

        <span
          className="min-w-0 truncate text-sm font-medium text-gray-700 dark:text-gray-200"
          aria-live="polite"
        >
          {locationLoading ? "Locating..." : locationName}
        </span>
      </button>

      {showModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm sm:items-center"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !saving) {
                resetModal();
              }
            }}
          >
            <div
              className="my-auto flex min-h-0 max-h-[calc(100dvh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-white/40 bg-white shadow-2xl dark:border-white/10 dark:bg-gray-900"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Set your location
                  </h2>

                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Choose your location for nearby HelpNet posts.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={resetModal}
                  disabled={saving}
                  aria-label="Close location selector"
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setMessage("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        searchLocation();
                      }
                    }}
                    placeholder="Search area, city or address..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-12 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />

                  <button
                    type="button"
                    onClick={searchLocation}
                    disabled={searching || !search.trim()}
                    aria-label="Search location"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-blue-600 hover:bg-blue-50 disabled:opacity-50 dark:hover:bg-blue-900/20"
                  >
                    {searching ? (
                      <LoaderCircle size={17} className="animate-spin" />
                    ) : (
                      <Search size={17} />
                    )}
                  </button>
                </div>

                {results.length > 0 && (
                  <div className="mt-3 max-h-56 overflow-y-auto rounded-xl border dark:border-gray-700">
                    {results.map((result) => (
                      <button
                        key={result.place_id}
                        type="button"
                        disabled={saving}
                        onClick={() => selectManualLocation(result)}
                        className="flex w-full items-start gap-3 border-b p-3 text-left last:border-b-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                      >
                        <MapPin
                          size={18}
                          className="mt-0.5 shrink-0 text-red-500"
                        />

                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          {result.display_name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowMapPicker(true)}
                  disabled={saving}
                  className="mt-3  flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  🗺️ Pick location on map
                </button>
                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                  <span className="text-xs font-medium text-gray-400">OR</span>
                  <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                </div>

                <button
                  type="button"
                  onClick={useCurrentLocation}
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Getting location...
                    </>
                  ) : (
                    <>
                      <MapPin size={18} />
                      Use my current location
                    </>
                  )}
                </button>

                <div className="mt-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Current location
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <MapPin size={16} className="shrink-0 text-red-500" />

                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {locationLoading
                        ? "Locating..."
                        : locationName || "Location unavailable"}
                    </p>
                  </div>

                  {user?.locationSource && (
                    <p className="mt-1 text-[11px] text-gray-400">
                      Source:{" "}
                      {user.locationSource === "manual"
                        ? "Manually selected"
                        : "GPS"}
                    </p>
                  )}
                </div>

                {message && (
                  <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    {message}
                  </p>
                )}
                {showMapPicker && (
                  <MapLocationPicker
                    initialLocation={{
                      lat: user?.coordinates?.lat,
                      lng: user?.coordinates?.lng,
                    }}
                    onConfirm={saveMapLocation}
                    onClose={() => setShowMapPicker(false)}
                  />
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
