import { LoadingScreen } from '@/components/invite/LoadingScreen';
import { EnvelopeHero } from '@/components/invite/EnvelopeHero';
import { QuoteSection } from '@/components/invite/QuoteSection';
import { CountdownSection } from '@/components/invite/CountdownSection';
import { VenueSection } from '@/components/invite/VenueSection';
import { DressCodeSection } from '@/components/invite/DressCodeSection';
import { GuestManualSection } from '@/components/invite/GuestManualSection';
import { RsvpSection } from '@/components/invite/RsvpSection';
import { RsvpModal } from '@/components/rsvp/RsvpModal';
import { InviteProvider } from '@/components/invite/InviteContext';
import { InvitePageButterflies } from '@/components/invite/InvitePageButterflies';
import { WeddingSettingsProvider } from '@/components/WeddingSettingsProvider';
import type { InviteInfo, WeddingSettings } from '@/types';

interface InviteContentProps {
  inviteToken?: string;
  invite?: InviteInfo;
  showNameHints?: boolean;
  settings?: WeddingSettings | null;
}

export function InviteContent({
  inviteToken,
  invite,
  showNameHints,
  settings = null,
}: InviteContentProps) {
  return (
    <WeddingSettingsProvider settings={settings}>
      <InviteProvider inviteToken={inviteToken} invite={invite} showNameHints={showNameHints}>
        <LoadingScreen />
        <InvitePageButterflies />
        <main className="w-full">
          <EnvelopeHero guestName={invite?.displayName} showNameHints={showNameHints} />
          <QuoteSection />
          <CountdownSection />
          <VenueSection />
          <DressCodeSection />
          <GuestManualSection />
          <RsvpSection />
        </main>
        <RsvpModal />
      </InviteProvider>
    </WeddingSettingsProvider>
  );
}
