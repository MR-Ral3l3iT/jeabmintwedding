import { InviteContent } from '@/components/invite/InviteContent';
import { fetchWeddingSettings } from '@/lib/fetchWeddingSettings';

export default async function HomePage() {
  const settings = await fetchWeddingSettings();
  return <InviteContent settings={settings} />;
}
