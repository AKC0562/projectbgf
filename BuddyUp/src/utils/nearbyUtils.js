import { calculateDistance } from "./distanceUtils";

/**
 * Add calculated distance to every companion.
 *
 * @param {Array} companions
 * @param {Object} userLocation
 * @returns {Array}
 */
export const addDistanceToCompanions = (
  companions,
  userLocation
) => {
  if (
    !Array.isArray(companions) ||
    !userLocation
  ) {
    return companions || [];
  }

  return companions.map((companion) => {
    const {
      latitude,
      longitude,
    } = companion;

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      latitude,
      longitude
    );

    return {
      ...companion,
      distance,
    };
  });
};


/**
 * Filter companions according to
 * maximum allowed distance.
 *
 * @param {Array} companions
 * @param {number} maxDistanceKm
 * @returns {Array}
 */
export const filterNearbyCompanions = (
  companions,
  maxDistanceKm
) => {
  if (!Array.isArray(companions)) {
    return [];
  }

  const radius = Number(maxDistanceKm);

  if (!Number.isFinite(radius)) {
    return companions;
  }

  return companions.filter(
    (companion) =>
      companion.distance !== null &&
      companion.distance !== undefined &&
      companion.distance <= radius
  );
};


/**
 * Sort companions from nearest
 * to farthest.
 *
 * @param {Array} companions
 * @returns {Array}
 */
export const sortByDistance = (
  companions
) => {
  if (!Array.isArray(companions)) {
    return [];
  }

  return [...companions].sort(
    (a, b) => {
      const distanceA =
        Number.isFinite(a.distance)
          ? a.distance
          : Infinity;

      const distanceB =
        Number.isFinite(b.distance)
          ? b.distance
          : Infinity;

      return distanceA - distanceB;
    }
  );
};


/**
 * Complete nearby-companion pipeline.
 *
 * Adds distance → filters by radius
 * → sorts nearest first.
 *
 * @param {Array} companions
 * @param {Object} userLocation
 * @param {number} maxDistanceKm
 * @returns {Array}
 */
export const getNearbyCompanions = (
  companions,
  userLocation,
  maxDistanceKm
) => {
  const companionsWithDistance =
    addDistanceToCompanions(
      companions,
      userLocation
    );

  const nearbyCompanions =
    filterNearbyCompanions(
      companionsWithDistance,
      maxDistanceKm
    );

  return sortByDistance(
    nearbyCompanions
  );
};