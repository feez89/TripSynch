'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateTrip } from '@/hooks/useTrips';
import { usePageTitle } from '@/hooks/usePageTitle';
import { ArrowLeft } from 'lucide-react';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  destination: z.string().min(1, 'Required'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  departureAirport: z.string().optional(),
  budgetMin: z.string().optional(),
  budgetMax: z.string().optional(),
});
type Form = z.infer<typeof schema>;

const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";
const labelCls = "text-sm font-medium text-slate-700 block mb-1";

export default function CreateTripPage() {
  const router = useRouter();
  usePageTitle('New Trip');
  const createTrip = useCreateTrip();
  const [pace, setPace] = useState('BALANCED');
  const [stayPref, setStayPref] = useState('FLEXIBLE');
  const [vibe, setVibe] = useState('');
  const [prefs, setPrefs] = useState({ food: true, nightlife: false, nature: false, culture: false });
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    setError('');
    try {
      const trip = await createTrip.mutateAsync({
        ...data,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
        budgetMin: data.budgetMin ? parseInt(data.budgetMin) : undefined,
        budgetMax: data.budgetMax ? parseInt(data.budgetMax) : undefined,
        preferences: { vibe, pace, stayPreference: stayPref, foodPref: prefs.food, nightlifePref: prefs.nightlife, naturePref: prefs.nature, culturePref: prefs.culture },
      });
      router.push(`/trips/${trip.id}`);
    } catch (e: any) { setError(e.response?.data?.error || 'Failed to create trip'); }
  };

  const PillGroup = ({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) => (
    <div className="flex gap-2 flex-wrap">
      {options.map(o => (
        <button key={o} type="button" onClick={() => onChange(o)}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${value === o ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:border-indigo-300'}`}>
          {o}
        </button>
      ))}
    </div>
  );

  const TogglePill = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button type="button" onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:border-indigo-300'}`}>
      {label}
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/trips" className="text-slate-400 hover:text-slate-600"><ArrowLeft size={20} /></Link>
        <h1 className="text-2xl font-bold">New Trip</h1>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold mb-4">Trip Details</h2>
          <div className="space-y-4">
            <div><label htmlFor="trip-name" className={labelCls}>Trip Name *</label><input {...register('name')} id="trip-name" required placeholder="Barcelona Summer 2024" className={inputCls} />{errors.name && <p role="alert" className="text-red-500 text-xs mt-1">{errors.name.message}</p>}</div>
            <div><label htmlFor="trip-destination" className={labelCls}>Destination *</label><input {...register('destination')} id="trip-destination" required placeholder="Barcelona, Spain" className={inputCls} />{errors.destination && <p role="alert" className="text-red-500 text-xs mt-1">{errors.destination.message}</p>}</div>
            <div><label htmlFor="trip-airport" className={labelCls}>Departure Airport (IATA)</label><input {...register('departureAirport')} id="trip-airport" placeholder="JFK" className={inputCls} style={{textTransform:'uppercase'}} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label htmlFor="trip-start" className={labelCls}>Start Date</label><input {...register('startDate')} id="trip-start" type="date" className={inputCls} /></div>
              <div><label htmlFor="trip-end" className={labelCls}>End Date</label><input {...register('endDate')} id="trip-end" type="date" className={inputCls} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label htmlFor="trip-budget-min" className={labelCls}>Budget Min ($)</label><input {...register('budgetMin')} id="trip-budget-min" type="number" placeholder="2000" className={inputCls} /></div>
              <div><label htmlFor="trip-budget-max" className={labelCls}>Budget Max ($)</label><input {...register('budgetMax')} id="trip-budget-max" type="number" placeholder="4000" className={inputCls} /></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold mb-4">Preferences</h2>
          <div className="space-y-4">
            <div><label htmlFor="trip-vibe" className={labelCls}>Trip Vibe</label><input id="trip-vibe" value={vibe} onChange={e => setVibe(e.target.value)} placeholder="Adventure meets culture, beach vibes..." className={inputCls} /></div>
            <div><label className={labelCls}>Pace</label><PillGroup options={['RELAXED','BALANCED','PACKED']} value={pace} onChange={setPace} /></div>
            <div><label className={labelCls}>Stay Preference</label><PillGroup options={['HOTEL','RENTAL','FLEXIBLE']} value={stayPref} onChange={setStayPref} /></div>
            <div>
              <label className={labelCls}>Interests</label>
              <div className="flex gap-2 flex-wrap">
                <TogglePill label="🍽️ Food" active={prefs.food} onClick={() => setPrefs(p => ({...p, food: !p.food}))} />
                <TogglePill label="🎉 Nightlife" active={prefs.nightlife} onClick={() => setPrefs(p => ({...p, nightlife: !p.nightlife}))} />
                <TogglePill label="🌿 Nature" active={prefs.nature} onClick={() => setPrefs(p => ({...p, nature: !p.nature}))} />
                <TogglePill label="🏛️ Culture" active={prefs.culture} onClick={() => setPrefs(p => ({...p, culture: !p.culture}))} />
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={createTrip.isPending} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          {createTrip.isPending ? 'Creating...' : 'Create Trip'}
        </button>
      </form>
    </div>
  );
}
