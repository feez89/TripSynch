export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-600"><span aria-hidden="true">✈️</span> TripSync</h1>
          <p className="text-slate-500 mt-2">Plan, compare, book, and split.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
