"use client";

import { useState } from "react";

type QuestionStatus = "unanswered" | "completed" | "not-sure" | "skipped";

const quizData = [
  {
    type: "single",
    intensity: "Low",
    question: "Which Act encourages businesses to invest in the education and training of the South African workforce?",
    options: [
      "Employment Equity Act (EEA)",
      "Skills Development Act (SDA)",
      "Basic Conditions of Employment Act (BCEA)",
      "Labour Relations Act (LRA)"
    ]
  },
  {
    type: "single",
    intensity: "Medium",
    question: "Jericho Carpets opened a new branch in another province to distribute their carpets. This type of intensive strategy is known as...",
    options: [
      "Product development",
      "Product modification",
      "Market penetration",
      "Market development"
    ]
  },
  {
    type: "multi",
    intensity: "High (Essay)",
    question: "Write an essay on the Consumer Protection Act (CPA) focusing on its purpose. Which of the following points should be included? (Select all that apply)",
    options: [
      "Establishes national standards to protect consumers",
      "Protects employers from unfair strikes and labour disputes",
      "Ensures consumers are not misled by suppliers",
      "Regulates the minimum wage of workers",
      "Empowers consumers to take legal action if rights are not upheld"
    ]
  },
  {
    type: "single",
    intensity: "Low",
    question: "Name the TWO components of a job analysis.",
    options: [
      "Job evaluation and Job rotation",
      "Recruitment and Selection",
      "Job description and Job specification",
      "Performance appraisal and Training"
    ]
  },
  {
    type: "single",
    intensity: "Medium",
    question: "Buhle Architecture pays monthly contributions to a common fund to protect workers in the event of workplace accidents. Which Act applies here?",
    options: [
      "Unemployment Insurance Fund (UIF)",
      "Occupational Health and Safety Act (OHSA)",
      "Compensation for Occupational Injuries and Diseases Amendment Act (COIDA)",
      "National Credit Act (NCA)"
    ]
  },
  {
    type: "multi",
    intensity: "High (Essay)",
    question: "Write an essay on the human resources function, specifically the recruitment procedure. Which of these steps are valid parts of the process?",
    options: [
      "Evaluate the job and prepare a job analysis",
      "Draw up a table of advantages and disadvantages of a strategy",
      "Choose the method of recruitment (internal/external)",
      "Conduct an environmental analysis using SWOT",
      "Place the advertisement in the appropriate media"
    ]
  },
  {
    type: "multi",
    intensity: "Medium",
    question: "What are the rights of employers in terms of the Labour Relations Act (LRA)?",
    options: [
      "Form employer organisations and bargaining councils",
      "Force employees to work overtime without pay",
      "Lockout employees who engage in an unprotected/illegal strike",
      "Dismiss employees without a valid reason",
      "Not pay employees who participated in a protected strike for work they did not do"
    ]
  },
  {
    type: "single",
    intensity: "Medium",
    question: "Bloem Enterprises' CEO effectively communicates the shared vision and mission of the business with employees. Which business function does this represent?",
    options: [
      "Public relations function",
      "Human resources function",
      "General management function",
      "Marketing function"
    ]
  },
  {
    type: "multi",
    intensity: "Medium",
    question: "Identify the types of defensive strategies from the list below.",
    options: [
      "Divestiture",
      "Concentric diversification",
      "Retrenchment",
      "Market penetration",
      "Liquidation"
    ]
  },
  {
    type: "multi",
    intensity: "High (Essay)",
    question: "Advise businesses on how the quality of performance of the administration function can contribute to the success of the business. Which points are valid?",
    options: [
      "Fast and reliable data capturing and processing systems",
      "Make reliable information available for quick decision-making",
      "Implement total quality management to reduce the cost of quality in factories",
      "Handle complaints quickly and effectively",
      "Design attractive packaging to increase sales"
    ]
  }
];

export default function Home() {
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [statuses, setStatuses] = useState<QuestionStatus[]>(Array(10).fill("unanswered"));
  // We will track selected options just so the UI feels interactive, but we won't evaluate them yet.
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number[]>>({});

  const handleSetStatus = (status: QuestionStatus) => {
    const newStatuses = [...statuses];
    newStatuses[activeQuestion] = status;
    setStatuses(newStatuses);
    
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
      return `${baseColor} ring-2 ring-blue-500 ring-offset-1`;
    }
    
    return baseColor;
  };

  const toggleOption = (optionIndex: number) => {
    const currentSelected = selectedOptions[activeQuestion] || [];
    const isMulti = quizData[activeQuestion].type === "multi";

    if (isMulti) {
      if (currentSelected.includes(optionIndex)) {
        setSelectedOptions({
          ...selectedOptions,
          [activeQuestion]: currentSelected.filter(i => i !== optionIndex)
        });
      } else {
        setSelectedOptions({
          ...selectedOptions,
          [activeQuestion]: [...currentSelected, optionIndex]
        });
      }
    } else {
      setSelectedOptions({
        ...selectedOptions,
        [activeQuestion]: [optionIndex]
      });
    }
  };

  const currentQ = quizData[activeQuestion];
  const currentSelected = selectedOptions[activeQuestion] || [];

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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex-1 flex flex-col relative">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Question {activeQuestion + 1}</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                {currentQ.intensity} Intensity
              </span>
            </div>
            
            <p className="text-gray-800 text-xl font-medium max-w-3xl mb-8">
              {currentQ.question}
            </p>

            <div className="space-y-3 max-w-3xl">
              {currentQ.options.map((option, idx) => {
                const isSelected = currentSelected.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => toggleOption(idx)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      isSelected 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-100 hover:border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 flex items-center justify-center border-2 rounded ${currentQ.type === 'single' ? 'rounded-full' : 'rounded-md'} ${
                        isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300"
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-lg ${isSelected ? "text-blue-900 font-medium" : "text-gray-700"}`}>
                        {option}
                      </span>
                    </div>
                  </button>
                );
              })}
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
