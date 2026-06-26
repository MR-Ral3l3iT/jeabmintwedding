import { AdminHeader } from '@/components/admin/AdminHeader';
import { WishList } from '@/components/admin/WishList';

export default function AdminWishesPage() {
  return (
    <>
      <AdminHeader activeTab="wishes" />
      <main className="mx-auto max-w-5xl px-5 py-7 sm:px-8 sm:py-8">
        <WishList />
      </main>
    </>
  );
}
