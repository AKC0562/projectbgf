import { useCallback, useEffect, useRef, useState } from "react";

import locationService from "../services/locationService";

function useLocation({
  watch = false,
} = {}) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const watchIdRef = useRef(null);

  const getLocation = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);

        const position =
          await locationService.getCurrentPosition();

        setLocation(position);

        return position;
      } catch (error) {
        console.error(
          "Location error:",
          error
        );

        setError(
          error?.message ||
            "Unable to get location."
        );

        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!watch) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      watchIdRef.current =
        locationService.watchPosition(
          (position) => {
            setLocation(position);
            setLoading(false);
          },

          (error) => {
            console.error(
              "Location watch error:",
              error
            );

            setError(
              error?.message ||
                "Unable to track location."
            );

            setLoading(false);
          }
        );
    } catch (error) {
      setError(
        error?.message ||
          "Location is not supported."
      );

      setLoading(false);
    }

    return () => {
      if (watchIdRef.current !== null) {
        locationService.clearWatch(
          watchIdRef.current
        );

        watchIdRef.current = null;
      }
    };
  }, [watch]);

  return {
    location,
    loading,
    error,
    getLocation,
  };
}

export default useLocation;