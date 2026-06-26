import Link from 'next/link';

export default function InviteNotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-cream">
      <p className="font-display text-4xl text-teal-dark mb-3">ลิงก์ไม่ถูกต้อง</p>
      <p className="text-sm text-text-light mb-8 max-w-sm">
        ลิงก์เชิญนี้อาจหมดอายุหรือไม่มีอยู่ในระบบ กรุณาติดต่อเจ้าบ่าวเจ้าสาว
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-full bg-sage text-white text-sm transition-colors hover:bg-teal-dark"
      >
        กลับหน้าหลัก
      </Link>
    </main>
  );
}
