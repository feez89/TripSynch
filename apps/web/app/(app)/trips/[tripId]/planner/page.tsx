'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTrip } from '@/hooks/useTrips';
import { useGeneratePlan as usePlanHook } from '@/hooks/usePlanning';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Loader2, ArrowLeft, MapPin, Calendar, Users, DollarSign, Lightbulb } from 'lucide-react';

const schema = z.object({
  destination: z.string().min(1, 'Required'),
  startDate: z.string().min(1, 'Required'),
  endDate: z.string().min(1, 'Required'),
  budget: z.string().min(1, 'Required'),
  travelers: z.string().min(1, 'Required'),
  vibe: z.string().optional(),
  notes: z.string().optional(),
});
type Form = z.infer<typeof schema>;

const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";
const labelCls = "text-sm font-medium text-slate-700 block mb-1";

export default function PlannerPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;
  const { data: trip, isLoading: tripLoading } = useTrip(tripId);
  const generatePlan = usePlanHook(tripId);

  usePageTitle('AI Planner');
  const [pace, setPace] = useState('BALANCED');
  const [stayPref, setStayPref] = useState('FLEXIBLE');
  const [prefs, setPrefs] = useState({ food: true, nightlife: false, nature: false, culture: false });
  const [result, setResult] = useState<any>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: trip ? {
      destination: trip.destination,
      startDate: trip.startDate?.split('T')[0],
      endDate: trip.endDate?.split('T')[0],
      budget: trip.budgetMax?.toString() || '',
      travelers: trip.members?.length?.toString() || '2',
      vibe: trip.preferences?.vibe || '',
    } : {},
  });

  const onSubmit = async (data: Form) => {
    try {
      const planData = {
        destination: data.destination,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        budgetMax: parseInt(data.budget),
        travelers: parseInt(data.travelers),
        vibe: data.vibe,
        pace,
        stayPreference: stayPref,
        foodPref: prefs.food,
        nightlifePref: prefs.nightlife,
        naturePref: prefs.nature,
        culturePref: prefs.culture,
        notes: data.notes,
      };
      const response = await generatePlan.mutateAsync(planData);
      setResult(response);
    } catch (e: any) {
      console.error(e);
    }
  };

  const PillGroup = ({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) => (
    <div className="flex gap-2 flex-wrap">
      {options.map(o => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${value === o ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:border-indigo-300'}`}
        >
          {o}
        </button>
      ))}
    </div>
  );

  const TogglePill = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:border-indigo-300'}`}
    >
      {label}
    </button>
  );

  if (tripLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  if (result) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setResult(null)} className="text-slate-400 hover:text-slate-600">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Your Itinerary</h1>
        </div>

        {result.summary && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-3">Overview</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{result.summary}</p>
          </div>
        )}

        {result.neighborhood && (
          <div className="bg-indigo-50 rounded-2xl border border-indigo-200 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-3">Where to Stay</h2>
            <p className="text-slate-700 text-sm">{result.neighborhood}</p>
          </div>
        )}

        {result.budgetEstimate && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign size={20} /> Budget Estimate
            </h2>
            <div className="space-y-2 text-sm">
              {Object.entries(result.budgetEstimate).map(([key, value]: [string, any]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-slate-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="font-semibold">${value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.dayByDay && result.dayByDay.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Day-by-Day</h2>
            <div className="space-y-4">
              {result.dayByDay.map((day: any, i: number) => (
                <div key={i} className="pb-4 border-b border-slate-100 last:border-0">
                  <h3 className="font-semibold text-slate-900 mb-2">Day {day.day || i + 1}</h3>
                  {day.activities?.map((activity: string, j: number) => (
                    <p key={j} className="text-sm text-slate-600 mb-1 flex items-start gap-2">
                      <span className="text-indigo-600 mt-1">•</span>
                      {activity}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {result.openQuestions && result.openQuestions.length > 0 && (
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Lightbulb size={20} /> Questions for the Group
            </h2>
            <ul className="space-y-2 text-sm text-slate-700">
              {result.openQuestions.map((q: string, i: number) => (
                <li key={i} className="flex gap-2">
                  <span className="text-amber-600 font-bold">•</span> {q}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/trips/${tripId}`} className="text-slate-400 hover:text-slate-600">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">AI Trip Planner</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <MapPin size={18} /> Trip Basics
          </h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="plan-destination" className={labelCls}>Destination *</label>
              <input {...register('destination')} id="plan-destination" required placeholder="Barcelona, Spain" className={inputCls} />
              {errors.destination && <p role="alert" className="text-red-500 text-xs mt-1">{errors.destination.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="plan-start" className={labelCls}>Start Date *</label>
                <input {...register('startDate')} id="plan-start" type="date" required className={inputCls} />
                {errors.startDate && <p role="alert" className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
              </div>
              <div>
                <label htmlFor="plan-end" className={labelCls}>End Date *</label>
                <input {...register('endDate')} id="plan-end" type="date" required className={inputCls} />
                {errors.endDate && <p role="alert" className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="plan-budget" className={labelCls}>Budget per Person *</label>
                <input {...register('budget')} id="plan-budget" type="number" required placeholder="3000" className={inputCls} />
                {errors.budget && <p role="alert" className="text-red-500 text-xs mt-1">{errors.budget.message}</p>}
              </div>
              <div>
                <label htmlFor="plan-travelers" className={labelCls}>Travelers *</label>
                <input {...register('travelers')} id="plan-travelers" type="number" required placeholder="4" className={inputCls} />
                {errors.travelers && <p role="alert" className="text-red-500 text-xs mt-1">{errors.travelers.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="plan-vibe" className={labelCls}>Trip Vibe</label>
              <input {...register('vibe')} id="plan-vibe" placeholder="Adventure meets culture, relaxing beach time..." className={inputCls} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Lightbulb size={18} /> Preferences
          </h2>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Travel Pace</label>
              <PillGroup options={['RELAXED', 'BALANCED', 'PACKED']} value={pace} onChange={setPace} />
            </div>

            <div>
              <label className={labelCls}>Stay Preference</label>
              <PillGroup options={['HOTEL', 'RENTAL', 'FLEXIBLE']} value={stayPref} onChange={setStayPref} />
            </div>

            <div>
              <label className={labelCls}>Interests</label>
              <div className="flex gap-2 flex-wrap">
                <TogglePill label="🍽️ Food" active={prefs.food} onClick={() => setPrefs(p => ({ ...p, food: !p.food }))} />
                <TogglePill label="🎉 Nightlife" active={prefs.nightlife} onClick={() => setPrefs(p => ({ ...p, nightlife: !p.nightlife }))} />
                <TogglePill label="🌿 Nature" active={prefs.nature} onClick={() => setPrefs(p => ({ ...p, nature: !p.nature }))} />
                <TogglePill label="🏛️ Culture" active={prefs.culture} onClick={() => setPrefs(p => ({ ...p, culture: !p.culture }))} />
              </div>
            </div>

            <div>
              <label htmlFor="plan-notes" className={labelCls}>Additional Notes</label>
              <textarea {...register('notes')} id="plan-notes" placeholder="Any specific requests or constraints..." className={`${inputCls} resize-none h-20`} />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={generatePlan.isPending}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {generatePlan.isPending ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Generating itinerary...
            </>
          ) : (
            '✨ Generate Itinerary'
          )}
        </button>
      </form>
    </div>
  );
}
