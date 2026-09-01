const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees) => {
  return (degrees * Math.PI) / 180;
};

export const calculateDistance = (
  latitude1,
  longitude1,
  latitude2,
  longitude2
) => {
  const lat1 = Number(latitude1);
  const lon1 = Number(longitude1);
  const lat2 = Number(latitude2);
  const lon2 = Number(longitude2);

  if (
    !Number.isFinite(lat1) ||
    !Number.isFinite(lon1) ||
    !Number.isFinite(lat2) ||
    !Number.isFinite(lon2)
  ) {
    return null;
  }

  const latitudeDifference =
    toRadians(lat2 - lat1);

  const longitudeDifference =
    toRadians(lon2 - lon1);

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(longitudeDifference / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return EARTH_RADIUS_KM * c;
};

export const formatDistance = (
  distanceInKm
) => {
  if (
    distanceInKm === null ||
    distanceInKm === undefined
  ) {
    return null;
  }

  const distance = Number(distanceInKm);

  if (!Number.isFinite(distance)) {
    return null;
  }

  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }

  if (distance < 10) {
    return `${distance.toFixed(1)} km`;
  }

  return `${Math.round(distance)} km`;
};