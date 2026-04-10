'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFlightSearch, useSavedFlights, useSaveFlight, useVoteFlight } from '@/hooks/useFlights';
import { useTrip } from '@/hooks/useTrips';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Loader2, ArrowLeft, Plane, Clock, ThumbsUp, ThumbsDown, Bookmark } from 'lucide-react';

type MemberOrigin = { memberId: string; name: string; origin: string };

export default function FlightsPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const { data: trip } = useTrip(tripId);
  usePageTitle('Flights');

  // Per-member departure city state
  const [memberOrigins, setMemberOrigins] = useState<MemberOrigin[]>([]);

  // Shared search fields
  const [destination, setDestination] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [cabin, setCabin] = useState('economy');

  // Only fire search when user clicks Search (not on every keystroke)
  const [triggeredParams, setTriggeredParams] = useState<any>(null);
  const [activeOriginTab, setActiveOriginTab] = useState<string | null>(null);

  // Initialise per-member origin rows when trip data arrives
  useEffect(() => {
    if (trip?.members && memberOrigins.length === 0) {
      setMemberOrigins(
        trip.members.map((m: any) => ({
          memberId: m.id,
          name: m.user?.name ?? m.name ?? 'Member',
          origin: '',
        }))
      );
    }
  }, [trip]);

  const uniqueOrigins = Array.from(
    new Set(
      memberOrigins
        .map((m) => m.origin.trim().toUpperCase())
        .filter((o) => o.length >= 2)
    )
  );

  const { data: searchResults, isLoading: searching } = useFlightSearch(
    tripId,
    triggeredParams,
    !!triggeredParams
  );
  const { data: savedFlights, isLoading: loadingSaved } = useSavedFlights(tripId);
  const saveFlight = useSaveFlight(tripId);
  const voteFlight = useVoteFlight(tripId);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (uniqueOrigins.length === 0 || !destination || !departDate) return;

    const newParams =
      uniqueOrigins.length === 1
        ? {
            origin: uniqueOrigins[0],
            destination: destination.toUpperCase(),
            departDate,
            returnDate: returnDate || undefined,
            cabinClass: cabin,
          }
        : {
            origins: uniqueOrigins.join(','),
            destination: destination.toUpperCase(),
            departDate,
            returnDate: returnDate || undefined,
            cabinClass: cabin,
          };

    setTriggeredParams(newParams);
    setActiveOriginTab(uniqueOrigins[0] ?? null);
  };

  const isGrouped = searchResults?.grouped === true;
  const groupedResults: { origin: string; flights: any[] }[] = isGrouped
    ? searchResults.results
    : [];
  const flatResults: any[] = !isGrouped && Array.isArray(searchResults) ? searchResults : [];
  const activeGroupFlights =
    activeOriginTab
      ? (groupedResults.find((g) => g.origin === activeOriginTab)?.flights ?? [])
      : [];

  const canSearch = uniqueOrigins.length > 0 && !!destination && !!departDate;

  const updateMemberOrigin = (index: number, value: string) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
    setMemberOrigins((prev) =>
      prev.map((m, i) => (i === index ? { ...m, origin: cleaned } : m))
    );
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/trips/${tripId}`} className="text-slate-400 hover:text-slate-600">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Flights</h1>
      </div>

      {/* ── Search form ── */}
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-2xl border border-slate-200 p-6 mb-8"
      >
        <h2 className="font-semibold mb-5 flex items-center gap-2">
          <Plane size={18} /> Search Flights
        </h2>

        {/* Per-member departure cities */}
        <div className="mb-5">
          <span className="text-sm font-medium text-slate-700 block mb-2" id="departure-cities-label">
            Departure Cities
          </span>
          {memberOrigins.length === 0 ? (
            <p className="text-sm text-slate-400 py-2">Loading members…</p>
          ) : (
            <div className="space-y-2">
              {memberOrigins.map((m, i) => (
                <div key={m.memberId} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {m.name.charAt(0)}
                  </div>
                  <span className="text-sm text-slate-700 w-28 truncate">{m.name}</span>
                  <input
                    id={`origin-${i}`}
                    aria-label={`${m.name}'s departure airport code`}
                    value={m.origin}
                    onChange={(e) => updateMemberOrigin(i, e.target.value)}
                    placeholder="LAX"
                    className="w-20 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono tracking-widest text-center uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Visual hint when members share an origin */}
          {uniqueOrigins.length > 0 && uniqueOrigins.length < memberOrigins.length && (
            <p className="text-xs text-slate-400 mt-2">
              {memberOrigins.length - uniqueOrigins.length} member(s) share a departure city —
              results will be merged.
            </p>
          )}
        </div>

        {/* Destination and dates */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-4">
          <div>
            <label htmlFor="flight-destination" className="text-sm font-medium text-slate-700 block mb-1">To</label>
            <input
              id="flight-destination"
              value={destination}
              onChange={(e) =>
                setDestination(e.target.value.toUpperCase().slice(0, 20))
              }
              placeholder={trip?.destination || 'Barcelona, Spain'}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="flight-depart" className="text-sm font-medium text-slate-700 block mb-1">Depart</label>
            <input
              id="flight-depart"
              type="date"
              value={departDate}
              onChange={(e) => setDepartDate(e.target.value)}
              required
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="flight-return" className="text-sm font-medium text-slate-700 block mb-1">Return</label>
            <input
              id="flight-return"
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <select
            value={cabin}
            onChange={(e) => setCabin(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="economy">Economy</option>
            <option value="premium_economy">Premium Economy</option>
            <option value="business">Business</option>
            <option value="first">First</option>
          </select>
          <button
            type="submit"
            disabled={searching || !canSearch}
            className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {searching ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Searching…
              </>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      {/* ── Search results ── */}
      {searching && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      )}

      {!searching && triggeredParams && searchResults && (
        <div className="mb-8">
          {/* Grouped (multi-origin) results with departure-city tabs */}
          {isGrouped && groupedResults.length > 0 ? (
            <>
              <h2 className="font-semibold text-lg mb-4">Available Flights</h2>

              {/* Origin tabs */}
              <div className="flex gap-1 mb-5 border-b border-slate-200 overflow-x-auto">
                {groupedResults.map((g) => (
                  <button
                    key={g.origin}
                    type="button"
                    onClick={() => setActiveOriginTab(g.origin)}
                    className={`pb-3 px-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                      activeOriginTab === g.origin
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    From {g.origin}
                    <span className="ml-1.5 text-xs font-normal opacity-70">
                      ({g.flights.length})
                    </span>
                  </button>
                ))}
              </div>

              {/* Who departs from this city */}
              {activeOriginTab && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-slate-500">Traveling from {activeOriginTab}:</span>
                  {memberOrigins
                    .filter((m) => m.origin === activeOriginTab)
                    .map((m) => (
                      <span
                        key={m.memberId}
                        className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-1 rounded-full"
                      >
                        <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                          {m.name.charAt(0)}
                        </span>
                        {m.name}
                      </span>
                    ))}
                </div>
              )}

              <div className="grid gap-4">
                {activeGroupFlights.map((flight: any) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    onSave={() => saveFlight.mutate(flight)}
                  />
                ))}
              </div>
            </>
          ) : flatResults.length > 0 ? (
            <>
              <h2 className="font-semibold text-lg mb-4">Available Flights</h2>
              <div className="grid gap-4">
                {flatResults.map((flight: any) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    onSave={() => saveFlight.mutate(flight)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <Plane size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">No flights found. Try different dates or airports.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Saved flights ── */}
      {loadingSaved ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : savedFlights && savedFlights.length > 0 ? (
        <div>
          <h2 className="font-semibold text-lg mb-4">
            Saved Flights ({savedFlights.length})
          </h2>
          <div className="grid gap-4">
            {savedFlights.map((flight: any) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                onVoteUp={() => voteFlight.mutate({ optionId: flight.id, value: 'UP' })}
                onVoteDown={() => voteFlight.mutate({ optionId: flight.id, value: 'DOWN' })}
                upvotes={flight.upvotes}
                downvotes={flight.downvotes}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <Bookmark size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">No saved flights yet. Search and save some options!</p>
        </div>
      )}
    </div>
  );
}

/* ── Reusable flight card ── */
function FlightCard({
  flight,
  onSave,
  onVoteUp,
  onVoteDown,
  upvotes,
  downvotes,
}: {
  flight: any;
  onSave?: () => void;
  onVoteUp?: () => void;
  onVoteDown?: () => void;
  upvotes?: number;
  downvotes?: number;
}) {
  const durationLabel = flight.duration
    ? flight.duration
    : flight.durationMin
    ? `${Math.floor(flight.durationMin / 60)}h ${flight.durationMin % 60}m`
    : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-semibold text-slate-900">{flight.airline}</span>
            {flight.flightNum && (
              <span className="text-xs text-slate-400">{flight.flightNum}</span>
            )}
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
              {flight.cabin ?? flight.cabinClass ?? 'Economy'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              {flight.departTime && (
                <span className="font-bold text-slate-900">{flight.departTime}</span>
              )}
              <span className="text-slate-500 font-medium">{flight.origin}</span>
            </div>
            {durationLabel && (
              <div className="flex items-center gap-1 text-slate-400">
                <Clock size={13} />
                <span className="text-xs">{durationLabel}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              {flight.arriveTime && (
                <span className="font-bold text-slate-900">{flight.arriveTime}</span>
              )}
              <span className="text-slate-500 font-medium">{flight.destination}</span>
            </div>
          </div>
          {flight.stops != null && flight.stops > 0 && (
            <p className="text-xs text-slate-400 mt-1">
              {flight.stops} stop{flight.stops > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="text-right ml-4">
          <div className="text-2xl font-bold text-indigo-600">
            ${flight.price?.toLocaleString()}
          </div>
          {onSave && (
            <button
              onClick={onSave}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold mt-1.5 flex items-center gap-1 ml-auto"
            >
              <Bookmark size={14} /> Save
            </button>
          )}
        </div>
      </div>

      {(onVoteUp || onVoteDown) && (
        <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={onVoteUp}
            className="flex items-center gap-1 text-sm text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ThumbsUp size={16} /> {upvotes ?? 0}
          </button>
          <button
            onClick={onVoteDown}
            className="flex items-center gap-1 text-sm text-slate-600 hover:text-red-600 transition-colors"
          >
            <ThumbsDown size={16} /> {downvotes ?? 0}
          </button>
        </div>
      )}
    </div>
  );
}
