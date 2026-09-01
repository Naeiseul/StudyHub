export default function Home() {
  const questions = Array.from({ length: 10 }, (_, i) => `Question ${i + 1}`);

  return (
    <div className="flex min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)]">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Quiz Navigation</h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {questions.map((q, index) => (
            <button
              key={index}
              className="w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors border border-transparent hover:border-blue-100"
            >
              {q}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 sm:p-12 flex flex-col">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex-1 flex flex-col items-center justify-center text-center">
          <h3 className="text-2xl font-semibold text-gray-400">
            Select a question from the sidebar
          </h3>
        </div>
      </main>
    </div>
  );
}
