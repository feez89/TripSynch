'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useActivity } from '@/hooks/useActivity';
import { useTrip } from '@/hooks/useTrips';
import { Loader2, ArrowLeft, MessageCircle, Bookmark, ThumbsUp, Plus, Users, Zap } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'COMMENT_ADDED': return MessageCircle;
    case 'OPTION_SAVED': return Bookmark;
    case 'VOTE_ADDED': return ThumbsUp;
    case 'MEMBER_JOINED': return Users;
    case 'EXPENSE_ADDED': return Plus;
    case 'PLAN_GENERATED': return Zap;
    default: return MessageCircle;
  }
};

const formatTime = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getDescription = (type: string, payload: any): string => {
  switch (type) {
    case 'OPTION_SAVED': {
      const what = payload?.type === 'flight' ? 'a flight' : payload?.type === 'stay' ? 'an accommodation' : 'an option';
      return `saved ${what}`;
    }
    case 'VOTE_ADDED': return 'voted on an option';
    case 'EXPENSE_ADDED': return 'added an expense';
    case 'PLAN_GENERATED': return 'generated a new itinerary';
    case 'MEMBER_JOINED': return 'joined the trip';
    case 'COMMENT_ADDED': return 'added a comment';
    default: return 'updated the trip';
  }
};

const getDetail = (type: string, payload: any): string | null => {
  if (!payload) return null;
  if (type === 'OPTION_SAVED') {
    if (payload.type === 'flight') return `${payload.airline ?? ''} ${payload.origin ?? ''} → ${payload.destination ?? ''}`.trim();
    if (payload.type === 'stay') return payload.name ?? null;
  }
  if (type === 'EXPENSE_ADDED') {
    return `${payload.title ?? ''}${payload.amount != null ? ` ($${payload.amount})` : ''}`.trim() || null;
  }
  return null;
};

export default function ActivityPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const { data: trip } = useTrip(tripId);
  const { data: activity, isLoading } = useActivity(tripId);
  usePageTitle('Activity Feed');

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/trips/${tripId}`} className="text-slate-400 hover:text-slate-600">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Activity Feed</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : activity && activity.length > 0 ? (
          <div className="space-y-4">
            {activity.map((item: any) => {
              const Icon = getActivityIcon(item.type);
              const description = getDescription(item.type, item.payload);
              const detail = getDetail(item.type, item.payload);
              const userName = item.user?.name ?? item.userName ?? 'Someone';

              return (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-slate-100 last:border-0">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Icon size={18} className="text-indigo-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900">{userName}</span>
                      <span className="text-slate-600">{description}</span>
                    </div>
                    {detail && (
                      <p className="text-sm text-slate-600 mt-1">{detail}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">{formatTime(item.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageCircle size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">No activity yet. Start planning with your group!</p>
          </div>
        )}
      </div>
    </div>
  );
}
