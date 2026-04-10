'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Plane, User, LogOut } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => { await logout(); router.push('/sign-in'); };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/trips" className="flex items-center gap-2 font-bold text-indigo-600 text-lg">
            <Plane size={20} /> TripSync
          </Link>
          <div className="flex items-center gap-4">
            {user && <span className="text-sm text-slate-600 hidden sm:block">Hi, {user.name.split(' ')[0]}</span>}
            <Link href="/profile" className="text-slate-500 hover:text-slate-700 p-2 -m-2 rounded-md" aria-label="Profile"><User size={18} /></Link>
            <button onClick={handleLogout} className="text-slate-500 hover:text-slate-700 p-2 -m-2 rounded-md" aria-label="Sign out"><LogOut size={18} /></button>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
