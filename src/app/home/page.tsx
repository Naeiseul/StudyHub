"use client";

import { useState } from "react";

type QuestionStatus = "unanswered" | "completed" | "not-sure" | "skipped";

const quizData = [
  {
    type: "single",
    intensity: "Low",
    question: "Which Act encourages businesses to invest in the education and training of the South African workforce?",
    options: [
      "A) Employment Equity Act (EEA)",
      "B) Skills Development Act (SDA)",
      "C) Basic Conditions of Employment Act (BCEA)",
      "D) Labour Relations Act (LRA)"
    ]
  },
  {
    type: "single",
    intensity: "Low",
    question: "Jericho Carpets opened a new branch in another province to distribute their carpets. What intensive strategy is this?",
    options: [
      "A) Product development",
      "B) Product modification",
      "C) Market penetration",
      "D) Market development"
    ]
  },
  {
    type: "single",
    intensity: "Medium",
    question: "Consider the following statements about the macro environment:\ni. Amandla Distributors has no control over it.\nii. A PESTLE analysis is used to evaluate its challenges.\niii. It includes the business's suppliers and competitors.\n\nWhich of these statements are CORRECT?",
    options: [
      "A) i only",
      "B) ii and iii",
      "C) i and ii",
      "D) i, ii, and iii"
    ]
  },
  {
    type: "single",
    intensity: "Medium",
    question: "Identify TWO types of defensive strategies from the options below:",
    options: [
      "A) Divestiture and Concentric diversification",
      "B) Retrenchment and Liquidation",
      "C) Market penetration and Divestiture",
      "D) Liquidation and Market development"
    ]
  },
  {
    type: "multi",
    intensity: "High",
    question: "In an essay question, if the topic is \"The Consumer Protection Act (CPA) and its purpose\", which of the following points would you add? (Select all that apply)",
    options: [
      "Establishes national standards to protect consumers regardless of economic status.",
      "Empowers consumers to take legal action if their rights are not upheld.",
      "Ensures consumers are not misled by suppliers.",
      "Regulates the minimum wage of workers to protect them from exploitation.",
      "Protects employers from unfair strikes and labour disputes."
    ]
  },
  {
    type: "single",
    intensity: "Medium",
    question: "Buhle Architecture pays monthly contributions to a common fund to protect workers in the event of workplace accidents. Which Act applies here, and what is one advantage for the business?",
    options: [
      "A) COIDA; it eliminates time and costs spent on lengthy civil court proceedings.",
      "B) UIF; employees do not contribute to this fund.",
      "C) OHSA; it compensates employees for financial distress.",
      "D) COIDA; it allows businesses to block non-compliant government tenders."
    ]
  },
  {
    type: "multi",
    intensity: "High",
    question: "In an essay question, if the topic is \"The Human Resources Recruitment Procedure\", which of the following steps would you include in your discussion? (Select all that apply)",
    options: [
      "Evaluate the job and prepare a job analysis to identify recruitment needs.",
      "Place the advertisement in the appropriate media that will ensure the best candidates apply.",
      "Choose the method of recruitment, such as internal or external.",
      "Draw up a table of advantages and disadvantages of a strategy.",
      "Conduct an environmental analysis using SWOT."
    ]
  },
  {
    type: "single",
    intensity: "Low",
    question: "Bloem Enterprises' CEO effectively communicates the shared vision and mission of the business with employees. Which business function does this represent?",
    options: [
      "A) Public relations function",
      "B) Human resources function",
      "C) General management function",
      "D) Marketing function"
    ]
  },
  {
    type: "single",
    intensity: "Medium",
    question: "Consider the following rights of employers in terms of the Labour Relations Act (LRA):\ni. Lockout employees who engage in an unprotected/illegal strike.\nii. Form bargaining councils for collective bargaining purposes.\niii. Force employees to work overtime without pay.\n\nWhich of these are actual rights of the employer?",
    options: [
      "A) i only",
      "B) i and ii",
      "C) ii and iii",
      "D) i, ii, and iii"
    ]
  },
  {
    type: "multi",
    intensity: "High",
    question: "A 6-mark question asks you to \"Advise businesses on how the quality of performance of the administration function can contribute to business success.\" Which of the following statements would earn you marks? (Select all that apply)",
    options: [
      "Using fast and reliable data capturing and processing systems.",
      "Making reliable information available for quick decision-making.",
      "Handling complaints quickly and effectively.",
      "Implementing total quality management to reduce the cost of quality in factories.",
      "Designing attractive packaging to increase sales."
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
            
            <p className="text-gray-800 text-xl font-medium max-w-3xl mb-8 whitespace-pre-wrap">
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
