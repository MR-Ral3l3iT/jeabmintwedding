import { JoinForm } from '@/components/join/JoinForm';
import { WeddingSettingsProvider } from '@/components/WeddingSettingsProvider';
import { fetchWeddingSettings } from '@/lib/fetchWeddingSettings';

export default async function JoinTokenPage({
  params,
}: {
  params: { token: string };
}) {
  const settings = await fetchWeddingSettings();

  return (
    <WeddingSettingsProvider settings={settings}>
      <JoinForm token={params.token} />
    </WeddingSettingsProvider>
  );
}
