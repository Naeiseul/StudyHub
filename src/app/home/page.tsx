export default function Home() {
  return (
    <div className="min-h-screen p-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">This is where the main app will go!</p>
      </header>
      
      <main className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder cards for the build */}
        <div className="p-6 bg-gray-50 border border-gray-100 rounded-xl shadow-sm">
          <h2 className="font-semibold text-lg mb-2">My Courses</h2>
          <p className="text-gray-500 text-sm">You haven't enrolled in any courses yet.</p>
        </div>
        <div className="p-6 bg-gray-50 border border-gray-100 rounded-xl shadow-sm">
          <h2 className="font-semibold text-lg mb-2">Recent Activity</h2>
          <p className="text-gray-500 text-sm">No recent activity to show.</p>
        </div>
      </main>
    </div>
  );
}
