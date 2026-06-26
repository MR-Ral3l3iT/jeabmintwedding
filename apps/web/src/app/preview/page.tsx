import { InviteContent } from '@/components/invite/InviteContent';
import { NamePreviewGuide } from '@/components/invite/NamePreviewGuide';
import { fetchWeddingSettings } from '@/lib/fetchWeddingSettings';
import { MOCK_GUEST_NAME, MOCK_INVITE } from '@/lib/mock';

export const metadata = {
  title: 'Preview — ตัวอย่างชื่อบนการ์ด',
};

export default async function PreviewPage() {
  const settings = await fetchWeddingSettings();

  return (
    <>
      <InviteContent
        inviteToken="preview"
        invite={MOCK_INVITE}
        showNameHints
        settings={settings}
      />
      <NamePreviewGuide guestName={MOCK_GUEST_NAME} />
    </>
  );
}
