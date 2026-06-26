import { notFound } from 'next/navigation';
import { InviteContent } from '@/components/invite/InviteContent';
import { API_URL } from '@/lib/constants';
import { fetchWeddingSettings } from '@/lib/fetchWeddingSettings';
import type { InviteInfo } from '@/types';

async function fetchInvite(token: string): Promise<InviteInfo | null> {
  try {
    const res = await fetch(`${API_URL}/api/invite/${token}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<InviteInfo>;
  } catch {
    return null;
  }
}

export default async function InvitePage({
  params,
}: {
  params: { token: string };
}) {
  const [invite, settings] = await Promise.all([
    fetchInvite(params.token),
    fetchWeddingSettings(),
  ]);
  if (!invite) notFound();

  return <InviteContent inviteToken={params.token} invite={invite} settings={settings} />;
}
