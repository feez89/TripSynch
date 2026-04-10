'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import { usePageTitle } from '@/hooks/usePageTitle';
import { LogOut, User, Mail, ArrowLeft } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  usePageTitle('Profile');
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/sign-in');
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/trips" className="text-slate-400 hover:text-slate-600">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>

      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-8">
          <div className="text-center mb-8">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full mx-auto mb-4" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                {user?.name.charAt(0)}
              </div>
            )}
            <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <User size={18} className="text-slate-400" />
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-0.5">Name</p>
                <p className="font-semibold text-slate-900">{user?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
              <Mail size={18} className="text-slate-400" />
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-0.5">Email</p>
                <p className="font-semibold text-slate-900">{user?.email}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            <LogOut size={18} /> Sign Out
          </button>

          <p className="text-center text-xs text-slate-500 mt-4">
            Questions? Contact us at support@tripsync.app
          </p>
        </div>
      </div>
    </div>
  );
}
