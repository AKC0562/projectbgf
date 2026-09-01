import { useCallback, useRef, useState } from "react";

import { useUser } from "../providers/useUser";

import locationService from "../services/locationService";
import userService from "../services/userService";
import companionService from "../services/companionService";

function useUserLocation() {
  const {
    user,
    role,
    isAuthenticated,
    refreshUser,
  } = useUser();

  const [location, setLocation] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [isWatching, setIsWatching] =
    useState(false);

  const watchIdRef = useRef(null);

  /*
   * Auth $id hi identity hai.
   * Alag userId create nahi kar rahe.
   */
  const profileId =
    user?.auth?.$id ||
    user?.$id ||
    null;

  // --------------------------------
  // UPDATE LOCATION IN DATABASE
  // --------------------------------

  const updateLocation = useCallback(
    async (position) => {
      if (!position || !profileId) {
        throw new Error(
          "Profile ID is missing."
        );
      }

      if (!role) {
        throw new Error(
          "User role is missing."
        );
      }

      const locationData =
        locationService.createLocationPayload(
          position
        );

      if (role === "user") {
        await userService.updateLocation(
          profileId,
          locationData
        );
      } else if (role === "companion") {
        await companionService.updateLocation(
          profileId,
          locationData
        );
      } else {
        throw new Error(
          "Invalid user role."
        );
      }

      setLocation({
        ...position,
        ...locationData,
      });

      if (refreshUser) {
        await refreshUser();
      }

      return locationData;
    },
    [
      profileId,
      role,
      refreshUser,
    ]
  );

  // --------------------------------
  // GET CURRENT LOCATION ONCE
  // --------------------------------

  const getLocation = useCallback(
    async () => {
      if (!isAuthenticated) {
        setError(
          "You must be logged in to use location."
        );

        return null;
      }

      if (!profileId) {
        setError(
          "User profile could not be found."
        );

        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const position =
          await locationService.getCurrentPosition();

        await updateLocation(position);

        return position;
      } catch (error) {
        console.error(
          "Location update failed:",
          error
        );

        setError(
          error?.message ||
            "Unable to update your location."
        );

        return null;
      } finally {
        setLoading(false);
      }
    },
    [
      isAuthenticated,
      profileId,
      updateLocation,
    ]
  );

  // --------------------------------
  // START LIVE LOCATION
  // --------------------------------

  const startWatching = useCallback(() => {
    if (!isAuthenticated) {
      setError(
        "You must be logged in to use location."
      );

      return;
    }

    if (!profileId) {
      setError(
        "User profile could not be found."
      );

      return;
    }

    if (!role) {
      setError(
        "User role could not be found."
      );

      return;
    }

    // Already watching
    if (watchIdRef.current !== null) {
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const watchId =
        locationService.watchPosition(
          async (position) => {
            try {
              await updateLocation(
                position
              );

              setLoading(false);
            } catch (error) {
              console.error(
                "Live location update failed:",
                error
              );

              setError(
                error?.message ||
                  "Unable to update live location."
              );

              setLoading(false);
            }
          },

          (error) => {
            console.error(
              "Location watch error:",
              error
            );

            setError(
              error?.message ||
                "Unable to track your location."
            );

            setLoading(false);
          }
        );

      watchIdRef.current = watchId;

      setIsWatching(true);
    } catch (error) {
      console.error(
        "Unable to start location tracking:",
        error
      );

      setError(
        error?.message ||
          "Unable to start location tracking."
      );

      setLoading(false);
    }
  }, [
    isAuthenticated,
    profileId,
    role,
    updateLocation,
  ]);

  // --------------------------------
  // STOP LIVE LOCATION
  // --------------------------------

  const stopWatching = useCallback(() => {
    if (watchIdRef.current === null) {
      return;
    }

    locationService.clearWatch(
      watchIdRef.current
    );

    watchIdRef.current = null;

    setIsWatching(false);
  }, []);

  // --------------------------------
  // CLEAR ERROR
  // --------------------------------

  const clearLocationError = useCallback(() => {
    setError(null);
  }, []);

  return {
    location,
    loading,
    error,

    isWatching,

    getLocation,
    startWatching,
    stopWatching,

    clearLocationError,
  };
}

export default useUserLocation;