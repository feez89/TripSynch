'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/auth.store';
import { usePageTitle } from '@/hooks/usePageTitle';

const schema = z.object({ email: z.string().email('Invalid email'), password: z.string().min(1, 'Required') });
type Form = z.infer<typeof schema>;

export default function SignIn() {
  usePageTitle('Sign In');
  const router = useRouter();
  const { login } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    setLoading(true); setError('');
    try { await login(data.email, data.password); router.push('/trips'); }
    catch (e: any) { setError(e.response?.data?.error || 'Sign in failed'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
      <p className="text-slate-500 text-sm mb-6">Sign in to your account</p>
      {error && <div role="alert" className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="text-sm font-medium text-slate-700 block mb-1">Email</label>
          <input
            {...register('email')}
            id="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.email && <p role="alert" className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className="text-sm font-medium text-slate-700 block mb-1">Password</label>
          <input
            {...register('password')}
            id="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Your password"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.password && <p role="alert" className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>
        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white rounded-lg py-2.5 font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-4">Don&apos;t have an account? <Link href="/sign-up" className="text-indigo-600 font-semibold">Sign up</Link></p>
      <p className="text-center text-sm text-slate-500 mt-2">Have an invite code? <Link href="/join" className="text-indigo-600 font-semibold">Join a trip</Link></p>
    </div>
  );
}
