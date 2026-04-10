'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/auth.store';
import { usePageTitle } from '@/hooks/usePageTitle';

const schema = z.object({ name: z.string().min(2, 'Name required'), email: z.string().email('Invalid email'), password: z.string().min(8, 'Min 8 characters') });
type Form = z.infer<typeof schema>;

export default function SignUp() {
  usePageTitle('Create Account');
  const router = useRouter();
  const { signup } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    setLoading(true); setError('');
    try { await signup(data.name, data.email, data.password); router.push('/trips'); }
    catch (e: any) { setError(e.response?.data?.error || 'Sign up failed'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1">Create account</h2>
      <p className="text-slate-500 text-sm mb-6">Start planning your next group trip</p>
      {error && <div role="alert" className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="text-sm font-medium text-slate-700 block mb-1">Full name</label>
          <input
            {...register('name')}
            id="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Your name"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.name && <p role="alert" className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
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
            autoComplete="new-password"
            required
            placeholder="Minimum 8 characters"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.password && <p role="alert" className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>
        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white rounded-lg py-2.5 font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-4">Already have an account? <Link href="/sign-in" className="text-indigo-600 font-semibold">Sign in</Link></p>
    </div>
  );
}
