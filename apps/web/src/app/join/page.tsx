import { JoinForm } from '@/components/join/JoinForm';
import { InviteProvider } from '@/components/invite/InviteContext';
import { WeddingSettingsProvider } from '@/components/WeddingSettingsProvider';
import { fetchWeddingSettings } from '@/lib/fetchWeddingSettings';

export default async function JoinPage() {
  const settings = await fetchWeddingSettings();

  return (
    <WeddingSettingsProvider settings={settings}>
      <InviteProvider locale="TH">
        <JoinForm />
      </InviteProvider>
    </WeddingSettingsProvider>
  );
}
