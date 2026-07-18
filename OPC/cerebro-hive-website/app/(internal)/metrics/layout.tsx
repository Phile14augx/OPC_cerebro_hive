export default function MetricsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <header className="mb-8 border-b border-white/10 pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Engineering Command Center</h1>
        <p className="text-gray-400 mt-2">CerebroHive Autonomous Operational Intelligence</p>
      </header>
      <main>{children}</main>
    </div>
  );
}
