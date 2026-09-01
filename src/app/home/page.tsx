"use client";

import { useState } from "react";

type QuestionStatus = "unanswered" | "completed" | "not-sure" | "skipped";

export default function Home() {
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [statuses, setStatuses] = useState<QuestionStatus[]>(Array(10).fill("unanswered"));

  const handleSetStatus = (status: QuestionStatus) => {
    const newStatuses = [...statuses];
    newStatuses[activeQuestion] = status;
    setStatuses(newStatuses);
    
    // Automatically move to the next question if it's not the last one
    if (activeQuestion < 9) {
      setActiveQuestion(activeQuestion + 1);
    }
  };

  const getStatusColor = (status: QuestionStatus, isActive: boolean) => {
    let baseColor = "bg-white text-gray-700 hover:bg-gray-50 border-transparent hover:border-gray-200";
    
    if (status === "completed") {
      baseColor = "bg-green-100 text-green-800 border-green-200 hover:bg-green-200";
    } else if (status === "not-sure") {
      baseColor = "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200";
    } else if (status === "skipped") {
      baseColor = "bg-red-100 text-red-800 border-red-200 hover:bg-red-200";
    }

    if (isActive) {
      // Add a blue ring if this is the currently selected question
      return `${baseColor} ring-2 ring-blue-500 ring-offset-1`;
    }
    
    return baseColor;
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)]">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Quiz Navigation</h2>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {statuses.map((status, index) => (
            <button
              key={index}
              onClick={() => setActiveQuestion(index)}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors border ${getStatusColor(status, activeQuestion === index)}`}
            >
              Question {index + 1}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 sm:p-12 flex flex-col">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex-1 flex flex-col">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Question {activeQuestion + 1}</h2>
            <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-100 min-h-[200px] flex items-center justify-center">
              <p className="text-gray-400 text-lg">Question content will go here...</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-auto pt-8 border-t border-gray-100 flex gap-4">
            <button 
              onClick={() => handleSetStatus("completed")}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              Completed
            </button>
            <button 
              onClick={() => handleSetStatus("not-sure")}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              Not Sure
            </button>
            <button 
              onClick={() => handleSetStatus("skipped")}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-sm ml-auto"
            >
              Skip
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
