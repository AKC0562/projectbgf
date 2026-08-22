import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { CompanionCard } from "../components/index";
import companionService from "../services/companionService";

import {
  setCompanions,
  setCompanionLoading,
  setCompanionError,
} from "../store/slices/companionSlice";

export default function Explore() {
  const dispatch = useDispatch();

  const {
    companions,
    loading,
    error,
  } = useSelector((state) => state.companions);

  useEffect(() => {
    const loadCompanions = async () => {
      try {
        dispatch(setCompanionLoading(true));
        dispatch(setCompanionError(null));

        const data = await companionService.getAll();

        dispatch(setCompanions(data));
      } catch (error) {
        console.error(
          "Failed to load companions:",
          error
        );

        dispatch(
          setCompanionError(
            "Unable to load companions. Please try again."
          )
        );
      } finally {
        dispatch(setCompanionLoading(false));
      }
    };

    loadCompanions();
  }, [dispatch]);

  // Loading
  if (loading) {
    return (
      <main className="min-h-screen px-5 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-gray-400">
            Finding Companions .......
          </p>
        </div>
      </main>
    );
  }

  // Error
  if (error) {
    return (
      <main className="min-h-screen px-5 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-2xl text-white">
              Something Went Wrong
            </p>

            <p className="text-lg text-red-700">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Empty
  if (companions.length === 0) {
    return (
      <main className="min-h-screen px-5 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-red-700">
            No Companions Found.
          </p>
        </div>
      </main>
    );
  }

  // Success
  return (
    <main className="min-h-screen px-5 py-10 text-white">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10">
          <p className="mb-2 text-sm font-medium text-purple-400">
            Find Your Companion
          </p>

          <h1 className="text-4xl font-bold">
            Explore Companions
          </h1>

          <p className="mt-3 max-w-2xl text-gray-400">
            Discover verified companions for coffee,
            movies, study sessions, and much more.
          </p>
        </div>

        {/* Companion Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {companions.map((companion) => (
            <CompanionCard
              key={companion.$id}
              companion={companion}
            />
          ))}
        </div>

      </div>
    </main>
  );
}