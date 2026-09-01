import {
  CheckCircle2,
  LoaderCircle,
  MapPin,
  Navigation,
} from "lucide-react";

import useUserLocation from "../hooks/useUserLocation";

function LocationButton({
  onLocationSuccess,
  className = "",
}) {
  const {
    location,
    loading,
    error,
    getLocation,
  } = useUserLocation();

  const handleLocation = async () => {
    const result = await getLocation();

    if (result && onLocationSuccess) {
      onLocationSuccess(result);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <button
        type="button"
        onClick={handleLocation}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-purple-700/40 bg-[#570080] px-5 py-3 font-semibold text-white transition hover:bg-[#6d009f] disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-gray-500"
      >
        {loading ? (
          <>
            <LoaderCircle
              size={18}
              className="animate-spin"
            />
            Getting Location...
          </>
        ) : location ? (
          <>
            <CheckCircle2 size={18} />
            Location Updated
          </>
        ) : (
          <>
            <Navigation size={18} />
            Use My Current Location
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-950/30 p-3 text-sm text-red-300">
          <MapPin
            size={17}
            className="mt-0.5 shrink-0"
          />

          <p>{error}</p>
        </div>
      )}

      {/* Success */}
      {location && !error && (
        <p className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          <CheckCircle2
            size={14}
            className="text-green-500"
          />

          Your current location has been updated.
        </p>
      )}
    </div>
  );
}

export default LocationButton;