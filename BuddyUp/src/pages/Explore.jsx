import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  AlertCircle,
  MapPin,
  Navigation,
  RefreshCw,
  Search,
} from "lucide-react";

import {
  CompanionCard,
  LocationButton,
} from "../components";

import companionService from "../services/companionService";

import {
  setCompanions,
  setCompanionLoading,
  setCompanionError,
  clearCompanionError,
  setNearbyCompanions,
  setNearbyRadius,
} from "../store/companionSlice";

import {
  getNearbyCompanions,
} from "../utils/nearbyUtils";

function Explore() {
  const dispatch = useDispatch();

  // --------------------------------
  // COMPANION STATE
  // --------------------------------

  const {
    companions,
    loading,
    error,
    nearbyCompanions,
    nearbyRadius,
  } = useSelector(
    (state) => state.companions
  );

  // --------------------------------
  // USER CURRENT LOCATION
  // --------------------------------

  const [currentLocation, setCurrentLocation] =
    useState(null);

  // --------------------------------
  // LOAD COMPANIONS
  // --------------------------------

  const loadCompanions = useCallback(
    async () => {
      try {
        dispatch(
          setCompanionLoading(true)
        );

        dispatch(
          clearCompanionError()
        );

        const data =
          await companionService.getAll();

        dispatch(
          setCompanions(data)
        );
      } catch (error) {
        console.error(
          "Failed to load companions:",
          error
        );

        dispatch(
          setCompanionError(
            error?.message ||
              "Unable to load companions."
          )
        );
      } finally {
        dispatch(
          setCompanionLoading(false)
        );
      }
    },
    [dispatch]
  );

  // --------------------------------
  // INITIAL LOAD
  // --------------------------------

  useEffect(() => {
    loadCompanions();
  }, [loadCompanions]);

  // --------------------------------
  // CALCULATE NEARBY COMPANIONS
  // --------------------------------

  useEffect(() => {
    if (
      !currentLocation ||
      companions.length === 0
    ) {
      dispatch(
        setNearbyCompanions([])
      );

      return;
    }

    const nearby =
      getNearbyCompanions(
        companions,
        currentLocation,
        nearbyRadius
      );

    dispatch(
      setNearbyCompanions(nearby)
    );
  }, [
    currentLocation,
    companions,
    nearbyRadius,
    dispatch,
  ]);

  // --------------------------------
  // LOCATION SUCCESS
  // --------------------------------

  const handleLocationSuccess = (
    location
  ) => {
    setCurrentLocation(location);
  };

  // --------------------------------
  // RADIUS CHANGE
  // --------------------------------

  const handleRadiusChange = (
    event
  ) => {
    const radius = Number(
      event.target.value
    );

    dispatch(
      setNearbyRadius(radius)
    );
  };

  // --------------------------------
  // LOADING
  // --------------------------------

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-5 py-10 text-white">
        <div className="mx-auto max-w-7xl">

          <p className="mb-2 text-sm text-purple-400">
            Find Your Companion
          </p>

          <h1 className="text-4xl font-bold">
            Explore Companions
          </h1>

          <p className="mt-3 text-gray-400">
            Finding companions...
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({
              length: 8,
            }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-purple-700/20 bg-zinc-950"
              >
                <div className="h-72 animate-pulse bg-zinc-900" />

                <div className="space-y-4 p-5">
                  <div className="h-5 w-2/3 animate-pulse rounded bg-zinc-900" />

                  <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-900" />

                  <div className="h-4 w-full animate-pulse rounded bg-zinc-900" />

                  <div className="h-10 w-full animate-pulse rounded bg-zinc-900" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    );
  }

  // --------------------------------
  // ERROR
  // --------------------------------

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-5 text-white">

        <div className="max-w-md text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/30 bg-red-950 text-red-400">
            <AlertCircle size={26} />
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            Something went wrong
          </h1>

          <p className="mt-2 text-gray-400">
            {error}
          </p>

          <button
            type="button"
            onClick={loadCompanions}
            className="mx-auto mt-6 flex items-center gap-2 rounded-xl bg-[#570080] px-5 py-3 font-semibold transition hover:bg-[#6d009f]"
          >
            <RefreshCw size={17} />
            Try Again
          </button>

        </div>

      </main>
    );
  }

  // --------------------------------
  // EMPTY
  // --------------------------------

  if (companions.length === 0) {
    return (
      <main className="min-h-screen bg-black px-5 py-10 text-white">

        <div className="mx-auto max-w-7xl">

          <p className="mb-2 text-sm text-purple-400">
            Find Your Companion
          </p>

          <h1 className="text-4xl font-bold">
            Explore Companions
          </h1>

          <div className="mt-10 rounded-2xl border border-purple-700/20 bg-zinc-950 p-10 text-center">

            <Search
              size={40}
              className="mx-auto text-gray-600"
            />

            <h2 className="mt-4 text-xl font-semibold">
              No companions found
            </h2>

            <p className="mt-2 text-gray-500">
              There are currently no
              companions available.
            </p>

          </div>

        </div>

      </main>
    );
  }

  // --------------------------------
  // MAIN
  // --------------------------------

  return (
    <main className="min-h-screen bg-black px-5 py-10 text-white">

      <div className="mx-auto max-w-7xl">

        {/* =========================
            PAGE HEADER
        ========================== */}

        <div className="mb-10">

          <p className="mb-2 text-sm font-medium text-purple-400">
            Find Your Companion
          </p>

          <h1 className="text-4xl font-bold">
            Explore Companions
          </h1>

          <p className="mt-3 max-w-2xl text-gray-400">
            Discover verified companions for
            coffee, movies, study sessions,
            and much more.
          </p>

        </div>

        {/* =========================
            NEARBY SECTION
        ========================== */}

        <section className="mb-12">

          {/* Nearby Header */}

          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <MapPin
                  size={20}
                  className="text-purple-400"
                />

                <h2 className="text-2xl font-bold">
                  Companions Near You
                </h2>

              </div>

              <p className="mt-2 text-sm text-gray-400">
                Find companions available around
                your current location.
              </p>

            </div>

            {/* Radius Selector */}

            {currentLocation && (
              <div className="flex items-center gap-3">

                <label
                  htmlFor="nearby-radius"
                  className="text-sm text-gray-400"
                >
                  Within
                </label>

                <select
                  id="nearby-radius"
                  value={nearbyRadius}
                  onChange={
                    handleRadiusChange
                  }
                  className="rounded-xl border border-purple-700/30 bg-zinc-950 px-4 py-2 text-sm text-white outline-none focus:border-purple-500"
                >
                  <option value={1}>
                    1 km
                  </option>

                  <option value={5}>
                    5 km
                  </option>

                  <option value={10}>
                    10 km
                  </option>

                  <option value={25}>
                    25 km
                  </option>
                </select>

              </div>
            )}

          </div>

          {/* =========================
              LOCATION BUTTON
          ========================== */}

          {!currentLocation && (
            <div className="mb-6 max-w-md">

              <LocationButton
                onLocationSuccess={
                  handleLocationSuccess
                }
              />

            </div>
          )}

          {/* =========================
              NEARBY RESULTS
          ========================== */}

          {currentLocation &&
            nearbyCompanions.length > 0 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                {nearbyCompanions.map(
                  (companion) => (
                    <CompanionCard
                      key={companion.$id}
                      companion={companion}
                    />
                  )
                )}

              </div>
            )}

          {/* =========================
              NO NEARBY RESULTS
          ========================== */}

          {currentLocation &&
            nearbyCompanions.length === 0 && (
              <div className="rounded-2xl border border-purple-700/20 bg-zinc-950 p-10 text-center">

                <Navigation
                  size={36}
                  className="mx-auto text-gray-600"
                />

                <h3 className="mt-4 text-xl font-semibold">
                  No companions nearby
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  No companions were found within{" "}
                  {nearbyRadius} km of your
                  current location.
                </p>

                <p className="mt-1 text-xs text-gray-600">
                  Try increasing the search radius.
                </p>

              </div>
            )}

        </section>

        {/* =========================
            ALL COMPANIONS
        ========================== */}

        <section>

          <div className="mb-6 flex items-center justify-between">

            <div>
              <h2 className="text-2xl font-bold">
                All Companions
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Explore all available companions.
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {companions.map(
              (companion) => (
                <CompanionCard
                  key={companion.$id}
                  companion={companion}
                />
              )
            )}

          </div>

        </section>

      </div>

    </main>
  );
}

export default Explore;