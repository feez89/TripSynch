'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStaySearch, useSavedStays, useSaveStay, useVoteStay } from '@/hooks/useStays';
import { useTrip } from '@/hooks/useTrips';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Loader2, ArrowLeft, Home, MapPin, Star, ThumbsUp, ThumbsDown, Bookmark, Wifi, Wind, Utensils } from 'lucide-react';

export default function StaysPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const { data: trip } = useTrip(tripId);
  usePageTitle('Stays');

  const [searchParams, setSearchParams] = useState({ destination: '', checkIn: '', checkOut: '' });
  // Only fire the search when the user explicitly clicks Search
  const [triggeredParams, setTriggeredParams] = useState<typeof searchParams | null>(null);

  // Pre-fill destination from trip once trip data loads
  useEffect(() => {
    if (trip?.destination && !searchParams.destination) {
      setSearchParams(prev => ({ ...prev, destination: trip.destination }));
    }
  }, [trip?.destination]);

  const { data: searchResults, isLoading: searching } = useStaySearch(
    tripId,
    triggeredParams ?? searchParams,
    !!triggeredParams && !!triggeredParams.destination && !!triggeredParams.checkIn && !!triggeredParams.checkOut,
  );
  const { data: savedStays, isLoading: loadingSaved } = useSavedStays(tripId);
  const saveStay = useSaveStay(tripId);
  const voteStay = useVoteStay(tripId);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchParams.destination || !searchParams.checkIn || !searchParams.checkOut) return;
    setTriggeredParams({ ...searchParams });
  };

  const amenityIcons: Record<string, React.ComponentType<any>> = {
    wifi: Wifi,
    ac: Wind,
    kitchen: Utensils,
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/trips/${tripId}`} className="text-slate-400 hover:text-slate-600">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Accommodations</h1>
      </div>

      <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Home size={18} /> Search Stays
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 mb-4">
          <div>
            <label htmlFor="stay-destination" className="text-sm font-medium text-slate-700 block mb-1">Destination</label>
            <input
              id="stay-destination"
              value={searchParams.destination}
              onChange={e => setSearchParams({ ...searchParams, destination: e.target.value })}
              placeholder={trip?.destination || 'Barcelona'}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="stay-checkin" className="text-sm font-medium text-slate-700 block mb-1">Check-in</label>
            <input
              id="stay-checkin"
              type="date"
              value={searchParams.checkIn}
              onChange={e => setSearchParams({ ...searchParams, checkIn: e.target.value })}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="stay-checkout" className="text-sm font-medium text-slate-700 block mb-1">Check-out</label>
            <input
              id="stay-checkout"
              type="date"
              value={searchParams.checkOut}
              onChange={e => setSearchParams({ ...searchParams, checkOut: e.target.value })}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {searching ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Searching...
              </>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      {!!triggeredParams && searching && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      )}

      {!!triggeredParams && !searching && searchResults && searchResults.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <Home size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">No stays found. Try different dates.</p>
        </div>
      )}

      {!!triggeredParams && searchResults && searchResults.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-lg mb-4">Available Stays</h2>
          <div className="grid gap-4">
            {searchResults.map((stay: any) => (
              <div key={stay.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">{stay.name}</h3>
                    <div className="flex items-center gap-2 mb-2 text-sm text-slate-600">
                      <MapPin size={14} /> {stay.address}
                    </div>
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < Math.floor(stay.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}
                        />
                      ))}
                      <span className="text-sm text-slate-600 ml-1">{stay.rating || 4.5}</span>
                    </div>
                    {stay.amenities && stay.amenities.length > 0 && (
                      <div className="flex gap-2 flex-wrap mb-3">
                        {stay.amenities.map((amenity: string) => {
                          const IconComp = amenityIcons[amenity.toLowerCase()] || Wifi;
                          return (
                            <div key={amenity} className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded">
                              <IconComp size={12} /> {amenity}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {stay.cancellation && <p className="text-xs text-slate-500">{stay.cancellation}</p>}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-600">${stay.pricePerNight}</div>
                    <p className="text-xs text-slate-500 mb-2">/night</p>
                    <button
                      onClick={() => saveStay.mutate(stay)}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 ml-auto"
                    >
                      <Bookmark size={14} /> Save
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loadingSaved ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : savedStays && savedStays.length > 0 ? (
        <div>
          <h2 className="font-semibold text-lg mb-4">Saved Accommodations ({savedStays.length})</h2>
          <div className="grid gap-4">
            {savedStays.map((stay: any) => (
              <div key={stay.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">{stay.name}</h3>
                    <div className="flex items-center gap-2 mb-2 text-sm text-slate-600">
                      <MapPin size={14} /> {stay.address}
                    </div>
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < Math.floor(stay.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}
                        />
                      ))}
                      <span className="text-sm text-slate-600 ml-1">{stay.rating || 4.5}</span>
                    </div>
                    {stay.amenities && stay.amenities.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {stay.amenities.map((amenity: string) => {
                          const IconComp = amenityIcons[amenity.toLowerCase()] || Wifi;
                          return (
                            <div key={amenity} className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded">
                              <IconComp size={12} /> {amenity}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-600">${stay.pricePerNight}</div>
                    <p className="text-xs text-slate-500">/night</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => voteStay.mutate({ optionId: stay.id, value: 'UP' })}
                    className="flex items-center gap-1 text-sm text-slate-600 hover:text-indigo-600 transition-colors"
                  >
                    <ThumbsUp size={16} /> {stay.upvotes || 0}
                  </button>
                  <button
                    onClick={() => voteStay.mutate({ optionId: stay.id, value: 'DOWN' })}
                    className="flex items-center gap-1 text-sm text-slate-600 hover:text-red-600 transition-colors"
                  >
                    <ThumbsDown size={16} /> {stay.downvotes || 0}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <Bookmark size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">No saved stays yet. Search and save some options!</p>
        </div>
      )}
    </div>
  );
}
