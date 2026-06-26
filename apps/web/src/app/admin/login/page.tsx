'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { accessToken } = await adminLogin({ email, password });
      document.cookie = `admin-token=${accessToken}; path=/; max-age=${7 * 24 * 3600}; SameSite=Strict`;
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[340px] bg-white rounded-2xl p-10 shadow-[0_8px_40px_rgba(30,58,58,0.12)] border border-sage-pale text-center">
        <h1 className="font-display text-[2rem] text-teal-dark mb-1">Admin</h1>
        <p className="text-sm text-text-light mb-6">เฉพาะเจ้าบ่าว-เจ้าสาว</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="อีเมล"
            required
            className="w-full px-4 py-3 rounded-lg border border-sage-pale bg-white text-sm text-text outline-none focus:border-sage transition-colors"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="รหัสผ่าน"
            required
            className="w-full px-4 py-3 rounded-lg border border-sage-pale bg-white text-sm text-text outline-none focus:border-sage transition-colors"
          />

          {error && (
            <p className="text-xs text-red-500 text-left">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-sage text-white font-serif-cg text-base transition-colors hover:bg-teal-dark disabled:opacity-50 mt-1"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  );
}
