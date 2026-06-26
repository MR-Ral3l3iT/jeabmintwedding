export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#faf7f2] font-thai [background-image:none]">
      {children}
    </div>
  );
}
