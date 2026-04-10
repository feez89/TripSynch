'use client';
import Link from 'next/link';
import { useTrips } from '@/hooks/useTrips';
import { Plus, MapPin, Calendar, Users, Loader2 } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';

const STATUS_STYLES: Record<string, string> = {
  PLANNING: 'bg-indigo-100 text-indigo-700',
  BOOKED: 'bg-green-100 text-green-700',
  TRAVELING: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-slate-100 text-slate-600',
};

function formatDate(d?: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TripsPage() {
  usePageTitle('My Trips');
  const { data: trips, isLoading } = useTrips();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Trips</h1>
          <p className="text-slate-500 text-sm mt-0.5">Plan and manage your group travel</p>
        </div>
        <Link href="/trips/create" className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors">
          <Plus size={16} /> New Trip
        </Link>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      )}

      {!isLoading && (!trips || trips.length === 0) && (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <div className="text-5xl mb-4">✈️</div>
          <h2 className="text-xl font-semibold mb-2">No trips yet</h2>
          <p className="text-slate-500 text-sm mb-6">Create your first group trip and start planning together.</p>
          <Link href="/trips/create" className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors">
            Create a Trip
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trips?.map((trip: any) => (
          <Link key={trip.id} href={`/trips/${trip.id}`} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <h2 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{trip.name}</h2>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ml-2 shrink-0 ${STATUS_STYLES[trip.status] || STATUS_STYLES.PLANNING}`}>{trip.status}</span>
            </div>
            <div className="space-y-1.5 text-sm text-slate-500">
              <div className="flex items-center gap-1.5"><MapPin size={13} />{trip.destination}</div>
              {trip.startDate && <div className="flex items-center gap-1.5"><Calendar size={13} />{formatDate(trip.startDate)}{trip.endDate ? ` → ${formatDate(trip.endDate)}` : ''}</div>}
              <div className="flex items-center gap-1.5"><Users size={13} />{trip.members?.length} traveler{trip.members?.length !== 1 ? 's' : ''}</div>
            </div>
            {trip.budgetMax && (
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400">
                Budget: ${trip.budgetMin?.toLocaleString()} – ${trip.budgetMax?.toLocaleString()} {trip.currency}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
