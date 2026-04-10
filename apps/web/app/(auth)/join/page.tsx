'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useJoinTrip } from '@/hooks/useTrips';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function JoinPage() {
  const router = useRouter();
  usePageTitle('Join a Trip');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const joinTrip = useJoinTrip();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setError('');
    try {
      const trip = await joinTrip.mutateAsync(code.trim().toUpperCase());
      router.push(`/trips/${trip.id}`);
    } catch (e: any) { setError(e.response?.data?.error || 'Invalid invite code'); }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Join a Trip</h2>
      <p className="text-slate-500 text-sm mb-6">Enter the invite code from your trip organizer</p>
      {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}
      <form onSubmit={handleJoin} className="space-y-4">
        <div>
          <label htmlFor="invite-code" className="text-sm font-medium text-slate-700 block mb-1">Invite Code</label>
          <input id="invite-code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. DEMO2024" required autoComplete="off" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase tracking-widest font-mono" />
        </div>
        <button type="submit" disabled={joinTrip.isPending} className="w-full bg-indigo-600 text-white rounded-lg py-2.5 font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          {joinTrip.isPending ? 'Joining...' : 'Join Trip'}
        </button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-4"><Link href="/sign-in" className="text-indigo-600 font-semibold">← Back to sign in</Link></p>
    </div>
  );
}
