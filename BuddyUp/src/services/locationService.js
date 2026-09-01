const locationService = {
  // --------------------------------
  // GET CURRENT LOCATION
  // --------------------------------
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(
          new Error(
            "Geolocation is not supported by this browser."
          )
        );

        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const {
            latitude,
            longitude,
            accuracy,
          } = position.coords;

          resolve({
            latitude,
            longitude,
            accuracy,
          });
        },

        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(
                new Error(
                  "Location permission was denied."
                )
              );
              break;

            case error.POSITION_UNAVAILABLE:
              reject(
                new Error(
                  "Your current location is unavailable."
                )
              );
              break;

            case error.TIMEOUT:
              reject(
                new Error(
                  "Location request timed out."
                )
              );
              break;

            default:
              reject(
                new Error(
                  "Unable to get your location."
                )
              );
          }
        },

        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    });
  },

  // --------------------------------
  // WATCH LOCATION
  // --------------------------------
  watchPosition(onSuccess, onError) {
    if (!navigator.geolocation) {
      throw new Error(
        "Geolocation is not supported by this browser."
      );
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        const {
          latitude,
          longitude,
          accuracy,
        } = position.coords;

        onSuccess({
          latitude,
          longitude,
          accuracy,
        });
      },

      (error) => {
        if (onError) {
          onError(error);
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  },

  // --------------------------------
  // CLEAR LOCATION WATCH
  // --------------------------------
  clearWatch(watchId) {
    if (watchId == null) {
      return;
    }

    navigator.geolocation.clearWatch(
      watchId
    );
  },

  // --------------------------------
  // CREATE DATABASE PAYLOAD
  // --------------------------------
  createLocationPayload(location) {
    if (!location) {
      return null;
    }

    const latitude = Number(
      location.latitude
    );

    const longitude = Number(
      location.longitude
    );

    const accuracy = Number(
      location.accuracy
    );

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      throw new Error(
        "Invalid location coordinates."
      );
    }

    return {
      latitude,
      longitude,

      locationAccuracy:
        Number.isFinite(accuracy)
          ? accuracy
          : null,

      lastLocationUpdate:
        new Date().toISOString(),
    };
  },
};

export default locationService;