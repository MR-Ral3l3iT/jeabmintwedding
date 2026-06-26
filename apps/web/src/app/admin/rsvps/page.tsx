import { redirect } from 'next/navigation';

export default function AdminRsvpsRedirectPage() {
  redirect('/admin/wishes');
}
