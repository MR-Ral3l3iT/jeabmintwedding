import { API_URL } from './constants';
import type { WeddingSettings } from '@/types';

export async function fetchWeddingSettings(): Promise<WeddingSettings | null> {
  try {
    const res = await fetch(`${API_URL}/api/settings`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json() as Promise<WeddingSettings>;
  } catch {
    return null;
  }
}
