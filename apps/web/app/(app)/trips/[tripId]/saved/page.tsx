'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { useSavedFlights, useVoteFlight } from '@/hooks/useFlights';
import { useSavedStays, useVoteStay } from '@/hooks/useStays';
import { useTrip } from '@/hooks/useTrips';
import { Loader2, ArrowLeft, Plane, MapPin, Home, Plus, X, Clock, Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const rentalSchema = z.object({
  title: z.string().min(1, 'Required'),
  url: z.string().url('Valid URL required'),
  beds: z.string().min(1, 'Required'),
  priceEstimate: z.string().min(1, 'Required'),
  notes: z.string().optional(),
});
type RentalForm = z.infer<typeof rentalSchema>;

export default function SavedPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as string;
  const { data: trip } = useTrip(tripId);
  usePageTitle('Saved Options');

  const { data: flights, isLoading: flightsLoading } = useSavedFlights(tripId);
  const { data: stays, isLoading: staysLoading } = useSavedStays(tripId);
  const voteFlight = useVoteFlight(tripId);
  const voteStay = useVoteStay(tripId);

  const [activeTab, setActiveTab] = useState<'flights' | 'stays' | 'rentals'>('flights');
  const [showRentalForm, setShowRentalForm] = useState(false);
  const [rentals, setRentals] = useState<RentalForm[]>([]);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<RentalForm>({
    resolver: zodResolver(rentalSchema),
  });

  const onRentalSubmit = (data: RentalForm) => {
    setRentals([...rentals, data]);
    reset();
    setShowRentalForm(false);
  };

  const removeRental = (index: number) => {
    setRentals(rentals.filter((_, i) => i !== index));
  };

  const tabs = [
    { id: 'flights', label: 'Flights', icon: Plane, count: flights?.length || 0 },
    { id: 'stays', label: 'Stays', icon: Home, count: stays?.length || 0 },
    { id: 'rentals', label: 'Rentals', icon: MapPin, count: rentals.length },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/trips/${tripId}`} className="text-slate-400 hover:text-slate-600">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Saved Options</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 mb-8">
        <div className="border-b border-slate-200 px-6">
          <div className="flex gap-1">
            {tabs.map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 font-semibold transition-colors ${
                    activeTab === tab.id
                      ? 'text-indigo-600 border-indigo-600'
                      : 'text-slate-600 border-transparent hover:text-slate-900'
                  }`}
                >
                  <TabIcon size={18} /> {tab.label} <span className="ml-1 text-sm">{tab.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'flights' && (
            <div>
              {flightsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-indigo-600" size={32} />
                </div>
              ) : flights && flights.length > 0 ? (
                <div className="space-y-4">
                  {flights.map((flight: any) => (
                    <div key={flight.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-slate-900">{flight.airline}</span>
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">{flight.cabin || 'Economy'}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{flight.departTime}</span>
                              <span className="text-slate-500">{flight.origin}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                              <Clock size={14} /> {flight.duration}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{flight.arriveTime}</span>
                              <span className="text-slate-500">{flight.destination}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-indigo-600">${flight.price.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => voteFlight.mutate({ optionId: flight.id, value: 'UP' })}
                          className="flex items-center gap-1 text-sm text-slate-600 hover:text-indigo-600 transition-colors"
                        >
                          <ThumbsUp size={16} /> {flight.upvotes || 0}
                        </button>
                        <button
                          onClick={() => voteFlight.mutate({ optionId: flight.id, value: 'DOWN' })}
                          className="flex items-center gap-1 text-sm text-slate-600 hover:text-red-600 transition-colors"
                        >
                          <ThumbsDown size={16} /> {flight.downvotes || 0}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Plane size={32} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500">No saved flights. Search and save flights to start comparing.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'stays' && (
            <div>
              {staysLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-indigo-600" size={32} />
                </div>
              ) : stays && stays.length > 0 ? (
                <div className="space-y-4">
                  {stays.map((stay: any) => (
                    <div key={stay.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-1">{stay.name}</h3>
                          <div className="flex items-center gap-2 mb-1 text-sm text-slate-600">
                            <MapPin size={14} /> {stay.address}
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={i < Math.floor(stay.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}
                              />
                            ))}
                            <span className="text-sm text-slate-600 ml-1">{stay.rating || 4.5}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-indigo-600">${stay.pricePerNight}</div>
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
              ) : (
                <div className="text-center py-12">
                  <Home size={32} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500">No saved stays. Search and save accommodations to start comparing.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'rentals' && (
            <div>
              {!showRentalForm ? (
                <div>
                  {rentals.length > 0 ? (
                    <div className="space-y-4 mb-4">
                      {rentals.map((rental, i) => (
                        <div key={i} className="border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900 mb-1">{rental.title}</h3>
                              <div className="text-sm text-slate-600 mb-2">
                                <a href={rental.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700">
                                  View listing →
                                </a>
                              </div>
                              <div className="text-sm text-slate-600 mb-1">{rental.beds} bed{parseInt(rental.beds) > 1 ? 's' : ''}</div>
                              {rental.notes && <p className="text-sm text-slate-600 italic">{rental.notes}</p>}
                            </div>
                            <div className="text-right mr-4">
                              <div className="text-lg font-bold text-indigo-600">${rental.priceEstimate}</div>
                              <p className="text-xs text-slate-500">estimated</p>
                            </div>
                            <button
                              onClick={() => removeRental(i)}
                              className="text-slate-400 hover:text-red-600 transition-colors"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 mb-4">
                      <MapPin size={32} className="mx-auto text-slate-300 mb-3" />
                      <p className="text-slate-500 mb-4">No rentals added yet.</p>
                    </div>
                  )}
                  <button
                    onClick={() => setShowRentalForm(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors w-full justify-center"
                  >
                    <Plus size={16} /> Add Rental
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onRentalSubmit)} className="space-y-4">
                  <div>
                    <label htmlFor="rental-title" className="text-sm font-medium text-slate-700 block mb-1">Title</label>
                    <input {...register('title')} id="rental-title" required placeholder="Cozy apartment in Gràcia" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    {errors.title && <p role="alert" className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="rental-url" className="text-sm font-medium text-slate-700 block mb-1">Listing URL</label>
                    <input {...register('url')} id="rental-url" type="url" required placeholder="https://airbnb.com/rooms/..." className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    {errors.url && <p role="alert" className="text-red-500 text-xs mt-1">{errors.url.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="rental-beds" className="text-sm font-medium text-slate-700 block mb-1">Bedrooms</label>
                      <input {...register('beds')} id="rental-beds" type="number" required placeholder="2" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      {errors.beds && <p role="alert" className="text-red-500 text-xs mt-1">{errors.beds.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="rental-price" className="text-sm font-medium text-slate-700 block mb-1">Price Estimate ($)</label>
                      <input {...register('priceEstimate')} id="rental-price" type="number" required placeholder="2500" className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      {errors.priceEstimate && <p role="alert" className="text-red-500 text-xs mt-1">{errors.priceEstimate.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="rental-notes" className="text-sm font-medium text-slate-700 block mb-1">Notes</label>
                    <textarea {...register('notes')} id="rental-notes" placeholder="Great views, close to metro..." className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-20" />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      Add Rental
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRentalForm(false)}
                      className="flex-1 bg-slate-100 text-slate-900 py-2.5 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
