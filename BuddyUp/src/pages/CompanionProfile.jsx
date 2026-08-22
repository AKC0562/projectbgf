import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  ArrowLeft,
  BadgeCheck,
  Languages,
  MapPin,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import companionService from "../services/companionService";

function CompanionProfile() {
  const { id } = useParams();
  const navigate = useNavigate()

  const [companion, setCompanion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(()=>{
    const loadCompanion = async ()=>{
      try {
        setLoading(true)

        const data = await companionService.getById(id)

        if (!data) {
          setError("Companion Not Found")
          return;
        }
        setCompanion(data)
      } catch (error) {
        console.error("Failed to load companion",error)
        setError("Unable to load companion")
        
      }finally{
        setLoading(false)
      }
    }
    loadCompanion()
  },[id])
 
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center  text-white">
        <h1 className="text-2xl font-semibold">
          Loading .........
        </h1>
      </main>
    );
  }
  if (error || !companion) {
    return (
      <main  className="flex min-h-screen items-center justify-center  text-red-800">
        <div className="text-2xl font-bold">{error || "Companion not Found !!"}</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen  px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <button
          onClick={() => navigate("/explore")}
          className="mb-6 flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
        >
          <ArrowLeft size={18} />
          Back to Explore
        </button>

        {/* Profile */}
        <section className="grid overflow-hidden rounded-3xl border border-white/10 bg-white/5 lg:grid-cols-[420px_1fr]">

          {/* Image */}
          <div className="relative min-h-150">
            <img
              src={companion.avatar}
              alt={companion.name}
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black via-black/50 to-transparent p-6 pt-24 lg:hidden">
              <h1 className="text-3xl font-bold">
                {companion.name}
              </h1>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 sm:p-8 lg:p-10">

            {/* Name */}
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold sm:text-4xl">
                {companion.name}
              </h1>

              {companion.isVerified && (
                <span className="flex items-center gap-1 rounded-full bg-[#570080]/30 px-3 py-1 text-sm text-purple-300">
                  <BadgeCheck size={17} />
                  Verified
                </span>
              )}
            </div>

            {/* Location + Age */}
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <MapPin size={16} />
                {companion.location}
              </span>

              <span>
                {companion.age} years old
              </span>
            </div>

            {/* Rating */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star
                  size={18}
                  fill="currentColor"
                  className="text-yellow-400"
                />
                <span className="font-semibold">
                  {companion.rating}
                </span>
              </div>

              <span className="text-sm text-gray-400">
                {companion.reviewCount} reviews
              </span>
            </div>

            {/* Bio */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold">
                About
              </h2>

              <p className="mt-3 leading-7 text-gray-400">
                {companion.bio}
              </p>
            </div>

            {/* Activities */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold">
                Activities
              </h2>

              <div className="mt-3 flex flex-wrap gap-2">
                {companion.activities?.map((activity) => (
                  <span
                    key={activity}
                    className="rounded-full border border-[#570080]/50 bg-[#570080]/20 px-4 py-2 text-sm text-purple-200"
                  >
                    {activity}
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="mt-8">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Languages size={19} />
                Languages
              </h2>

              <div className="mt-3 flex flex-wrap gap-2">
                {companion.languages?.map((language) => (
                  <span
                    key={language}
                    className="rounded-lg bg-white/10 px-3 py-2 text-sm text-gray-300"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom */}
            <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-sm text-gray-400">
                  Starting from
                </p>

                <p className="text-2xl font-bold">
                  ₹{companion.hourlyRate}
                  <span className="text-sm font-normal text-gray-400">
                    {" "} / hour
                  </span>
                </p>
              </div>

              <button
                disabled={!companion.isAvailable}
                onClick={()=> navigate(`/booking/${companion.$id}`)}
                className="rounded-xl bg-[#570080] px-8 py-3 font-semibold transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-700"
              >
                {companion.isAvaliable
                  ? "Book Now"
                  : "Currently Unavailable"}
              </button>

            </div>

          </div>
        </section>
      </div>
    </main>
  );
}

export default CompanionProfile;