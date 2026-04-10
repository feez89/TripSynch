'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTrip } from '@/hooks/useTrips';
import { Loader2, Plane, MapPin, Users, Wallet, Zap, MessageCircle, Share2, Calendar } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';

const formatDate = (d?: string | null) => {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function TripDashboard() {
  const params = useParams();
  const tripId = params.tripId as string;
  const { data: trip, isLoading } = useTrip(tripId);
  usePageTitle(trip?.name ?? 'Trip');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
        <h2 className="text-xl font-semibold mb-2">Trip not found</h2>
      </div>
    );
  }

  const navItems = [
    { href: 'planner', label: 'AI Planner', icon: Zap, desc: 'Get AI-powered itinerary' },
    { href: 'flights', label: 'Flights', icon: Plane, desc: 'Search & compare flights' },
    { href: 'stays', label: 'Stays', icon: MapPin, desc: 'Find accommodations' },
    { href: 'saved', label: 'Saved Options', icon: Users, desc: 'Review group choices' },
    { href: 'wallet', label: 'Wallet', icon: Wallet, desc: 'Expense splits & payments' },
    { href: 'activity', label: 'Activity', icon: MessageCircle, desc: 'Group updates' },
  ];

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{trip.name}</h1>
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">{trip.status}</span>
            </div>
            <p className="text-slate-500 text-sm">Plan, compare, book, and split together</p>
          </div>
          <Link href={`/trips/${tripId}/invite`} className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
            <Share2 size={16} /> Invite
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-xs text-slate-500 mb-1">Destination</div>
            <div className="font-semibold">{trip.destination}</div>
          </div>
          {trip.startDate && (
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="text-xs text-slate-500 mb-1">Dates</div>
              <div className="font-semibold text-sm">
                {formatDate(trip.startDate)}
                {trip.endDate && ` → ${formatDate(trip.endDate)}`}
              </div>
            </div>
          )}
          {trip.budgetMin && (
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <div className="text-xs text-slate-500 mb-1">Budget</div>
              <div className="font-semibold text-sm">
                ${trip.budgetMin.toLocaleString()} – ${trip.budgetMax?.toLocaleString()}
              </div>
            </div>
          )}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-xs text-slate-500 mb-1">Travelers</div>
            <div className="font-semibold">{trip.members?.length || 0}</div>
          </div>
        </div>

        {trip.members && trip.members.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="text-sm font-semibold mb-3">Group Members</div>
            <div className="flex flex-wrap gap-2">
              {trip.members.map((member: any) => (
                <div key={member.id} className="flex items-center gap-2 bg-slate-50 rounded-full px-3 py-1.5 text-sm">
                  {(member.user?.avatarUrl ?? member.avatarUrl) ? (
                    <img src={member.user?.avatarUrl ?? member.avatarUrl} alt={member.user?.name ?? member.name} className="w-5 h-5 rounded-full" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                      {(member.user?.name ?? member.name)?.charAt(0) ?? '?'}
                    </div>
                  )}
                  <span>{member.user?.name ?? member.name ?? 'Unknown'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {trip.itinerary && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar size={18} /> Itinerary Summary
          </h2>
          <div className="text-slate-600 text-sm whitespace-pre-line line-clamp-3">{trip.itinerary}</div>
          <Link href={`/trips/${tripId}/planner`} className="text-indigo-600 font-semibold text-sm mt-3 inline-block hover:text-indigo-700">
            View full itinerary →
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={`/trips/${tripId}/${item.href}`}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-indigo-200 transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                  <Icon size={20} className="text-indigo-600" />
                </div>
                <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{item.label}</h3>
              </div>
              <p className="text-sm text-slate-500">{item.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
