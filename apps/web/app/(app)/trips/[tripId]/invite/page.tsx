'use client';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { useTrip, useGenerateInvite } from '@/hooks/useTrips';
import { Loader2, ArrowLeft, Share2, Copy, Check, Star } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function InvitePage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const { data: trip, isLoading: tripLoading } = useTrip(tripId);
  const generateInvite = useGenerateInvite(tripId);

  usePageTitle('Invite Members');
  const [copiedField, setCopiedField] = useState<'code' | 'link' | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  const handleGenerateInvite = async () => {
    try {
      const result = await generateInvite.mutateAsync();
      setInviteCode(result.inviteCode);
    } catch (e: any) {
      console.error(e);
    }
  };

  const copyToClipboard = (text: string, field: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const inviteLink = inviteCode ? `${typeof window !== 'undefined' ? window.location.origin : ''}/join?code=${inviteCode}` : '';

  if (tripLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/trips/${tripId}`} className="text-slate-400 hover:text-slate-600">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Invite Group Members</h1>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Share2 size={20} /> Share Invite Code
          </h2>

          {!inviteCode ? (
            <div className="text-center py-8">
              <p className="text-slate-600 mb-4">Generate an invite code to share with your group</p>
              <button
                onClick={handleGenerateInvite}
                disabled={generateInvite.isPending}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                {generateInvite.isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Generating...
                  </>
                ) : (
                  '✨ Generate Code'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                <p className="text-sm text-slate-600 mb-2">Invite Code</p>
                <div className="flex items-center gap-3">
                  <code className="text-3xl font-bold text-indigo-600 font-mono tracking-widest">{inviteCode}</code>
                  <button
                    onClick={() => copyToClipboard(inviteCode, 'code')}
                    className="flex-shrink-0 p-2 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    {copiedField === 'code' ? (
                      <Check size={20} className="text-green-600" />
                    ) : (
                      <Copy size={20} className="text-slate-600" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                <p className="text-sm text-slate-600 mb-2">Invite Link</p>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={inviteLink}
                    readOnly
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => copyToClipboard(inviteLink, 'link')}
                    className="flex-shrink-0 p-2 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    {copiedField === 'link' ? (
                      <Check size={20} className="text-green-600" />
                    ) : (
                      <Copy size={20} className="text-slate-600" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-4">
                <p className="text-sm text-indigo-900">Share this code or link with your friends to join the trip!</p>
              </div>
            </div>
          )}
        </div>

        {trip?.members && trip.members.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Group Members ({trip.members.length})</h2>
            <div className="space-y-3">
              {trip.members.map((member: any) => (
                <div key={member.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    {(member.user?.avatarUrl ?? member.avatarUrl) ? (
                      <img src={member.user?.avatarUrl ?? member.avatarUrl} alt={member.user?.name ?? member.name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                        {(member.user?.name ?? member.name)?.charAt(0) ?? '?'}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-900">{member.user?.name ?? member.name ?? 'Unknown'}</p>
                      <p className="text-xs text-slate-500">{member.user?.email ?? member.email}</p>
                    </div>
                  </div>
                  {member.isOrganizer && (
                    <div className="flex items-center gap-1 text-amber-600 text-sm font-semibold">
                      <Star size={14} className="fill-amber-600" /> Organizer
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Invite Someone Else</h2>
          <p className="text-slate-600 text-sm mb-4">Or join another trip using their invite code:</p>
          <Link
            href="/join"
            className="flex items-center justify-center w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Join Another Trip
          </Link>
        </div>
      </div>
    </div>
  );
}
