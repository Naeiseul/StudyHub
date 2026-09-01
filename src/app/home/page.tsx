"use client";

import { useState } from "react";

type QuestionStatus = "unanswered" | "completed" | "not-sure" | "skipped";

const quizData = [
  {
    type: "single",
    intensity: "Low",
    marks: 2,
    question: "Which Act encourages businesses to invest in the education and training of the South African workforce?",
    options: [
      "A) Employment Equity Act (EEA)",
      "B) Skills Development Act (SDA)",
      "C) Basic Conditions of Employment Act (BCEA)",
      "D) Labour Relations Act (LRA)"
    ],
    correctAnswers: [1],
    explanation: "The Skills Development Act (SDA) was specifically introduced to develop the skills of the South African workforce and encourage employers to use the workplace as an active learning environment."
  },
  {
    type: "single",
    intensity: "Low",
    marks: 2,
    question: "Jericho Carpets opened a new branch in another province to distribute their carpets. What intensive strategy is this?",
    options: [
      "A) Product development",
      "B) Product modification",
      "C) Market penetration",
      "D) Market development"
    ],
    correctAnswers: [3],
    explanation: "Market development is an intensive growth strategy where a business aims to sell its existing products in new geographical markets (such as opening a branch in a new province)."
  },
  {
    type: "single",
    intensity: "Medium",
    marks: 2,
    question: "Consider the following statements about the macro environment:\ni. Amandla Distributors has no control over it.\nii. A PESTLE analysis is used to evaluate its challenges.\niii. It includes the business's suppliers and competitors.\n\nWhich of these statements are CORRECT?",
    options: [
      "A) i only",
      "B) ii and iii",
      "C) i and ii",
      "D) i, ii, and iii"
    ],
    correctAnswers: [2],
    explanation: "Statements i and ii are correct. The macro environment is out of the business's control and is analysed using PESTLE. Statement iii is incorrect because suppliers and competitors belong to the market environment, not the macro environment."
  },
  {
    type: "single",
    intensity: "Medium",
    marks: 6,
    question: "Identify TWO types of defensive strategies from the options below:",
    options: [
      "A) Divestiture and Concentric diversification",
      "B) Retrenchment and Liquidation",
      "C) Market penetration and Divestiture",
      "D) Liquidation and Market development"
    ],
    correctAnswers: [1],
    explanation: "Retrenchment, divestiture, and liquidation are the three main types of defensive strategies. Concentric diversification and market development are growth strategies."
  },
  {
    type: "multi",
    intensity: "High",
    marks: 10,
    question: "In an essay question, if the topic is \"The Consumer Protection Act (CPA) and its purpose\", which of the following points would you add? (Select all that apply)",
    options: [
      "Establishes national standards to protect consumers regardless of economic status.",
      "Empowers consumers to take legal action if their rights are not upheld.",
      "Ensures consumers are not misled by suppliers.",
      "Regulates the minimum wage of workers to protect them from exploitation.",
      "Protects employers from unfair strikes and labour disputes."
    ],
    correctAnswers: [0, 1, 2],
    explanation: "The first three points are key purposes of the CPA. Regulating minimum wage is the purpose of the BCEA, and protecting against unfair strikes is the purpose of the LRA."
  },
  {
    type: "single",
    intensity: "Medium",
    marks: 6,
    question: "Buhle Architecture pays monthly contributions to a common fund to protect workers in the event of workplace accidents. Which Act applies here, and what is one advantage for the business?",
    options: [
      "A) COIDA; it eliminates time and costs spent on lengthy civil court proceedings.",
      "B) UIF; employees do not contribute to this fund.",
      "C) OHSA; it compensates employees for financial distress.",
      "D) COIDA; it allows businesses to block non-compliant government tenders."
    ],
    correctAnswers: [0],
    explanation: "The Compensation for Occupational Injuries and Diseases Act (COIDA) protects employers from civil claims if an employee is injured at work, saving the business from lengthy and costly court proceedings."
  },
  {
    type: "multi",
    intensity: "High",
    marks: 12,
    question: "In an essay question, if the topic is \"The Human Resources Recruitment Procedure\", which of the following steps would you include in your discussion? (Select all that apply)",
    options: [
      "Evaluate the job and prepare a job analysis to identify recruitment needs.",
      "Place the advertisement in the appropriate media that will ensure the best candidates apply.",
      "Choose the method of recruitment, such as internal or external.",
      "Draw up a table of advantages and disadvantages of a strategy.",
      "Conduct an environmental analysis using SWOT."
    ],
    correctAnswers: [0, 1, 2],
    explanation: "The first three options are valid steps in the HR recruitment procedure. Drawing up strategy tables and conducting SWOT analyses belong to the strategic management process, not HR recruitment."
  },
  {
    type: "single",
    intensity: "Low",
    marks: 2,
    question: "Bloem Enterprises' CEO effectively communicates the shared vision and mission of the business with employees. Which business function does this represent?",
    options: [
      "A) Public relations function",
      "B) Human resources function",
      "C) General management function",
      "D) Marketing function"
    ],
    correctAnswers: [2],
    explanation: "The General management function is responsible for the overall strategic direction of the business, including formulating and communicating the vision and mission."
  },
  {
    type: "single",
    intensity: "Medium",
    marks: 6,
    question: "Consider the following rights of employers in terms of the Labour Relations Act (LRA):\ni. Lockout employees who engage in an unprotected/illegal strike.\nii. Form bargaining councils for collective bargaining purposes.\niii. Force employees to work overtime without pay.\n\nWhich of these are actual rights of the employer?",
    options: [
      "A) i only",
      "B) i and ii",
      "C) ii and iii",
      "D) i, ii, and iii"
    ],
    correctAnswers: [1],
    explanation: "Employers have the right to lockout illegal strikers and form bargaining councils (i and ii). However, forcing employees to work overtime without pay is illegal and a direct violation of the BCEA."
  },
  {
    type: "multi",
    intensity: "High",
    marks: 4,
    question: "Advise businesses on how the quality of performance of the administration function can contribute to business success. Which of the following statements would earn you marks? (Select all that apply)",
    options: [
      "Using fast and reliable data capturing and processing systems.",
      "Making reliable information available for quick decision-making.",
      "Handling complaints quickly and effectively.",
      "Implementing total quality management to reduce the cost of quality in factories.",
      "Designing attractive packaging to increase sales."
    ],
    correctAnswers: [0, 1, 2],
    explanation: "Data capturing, information management, and complaint handling are key administrative duties. Quality management in factories is a Production function, and packaging is a Marketing function."
  }
];

export default function Home() {
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [statuses, setStatuses] = useState<QuestionStatus[]>(Array(10).fill("unanswered"));
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number[]>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const totalMaxMarks = quizData.reduce((acc, q) => acc + q.marks, 0);

  const handleSubmit = () => {
    let calculatedScore = 0;
    
    quizData.forEach((q, idx) => {
      const selected = selectedOptions[idx] || [];
      const correct = q.correctAnswers;
      
      if (q.type === "single") {
        if (selected.length === 1 && selected[0] === correct[0]) {
          calculatedScore += q.marks;
        }
      } else {
        // Multi-select proportional scoring with bluff penalty
        const correctSelected = selected.filter(i => correct.includes(i)).length;
        const incorrectSelected = selected.filter(i => !correct.includes(i)).length;
        const netCorrect = Math.max(0, correctSelected - incorrectSelected);
        
        calculatedScore += Math.round((netCorrect / correct.length) * q.marks);
      }
    });
    
    setScore(calculatedScore);
    setIsSubmitted(true);
  };

  const handleRetake = () => {
    setIsSubmitted(false);
    setScore(0);
    setSelectedOptions({});
    setStatuses(Array(10).fill("unanswered"));
    setActiveQuestion(0);
  };

  const handleSetStatus = (status: QuestionStatus) => {
    if (isSubmitted) return; // Prevent changing status after submission

    const newStatuses = [...statuses];
    newStatuses[activeQuestion] = status;
    setStatuses(newStatuses);
    
    if (activeQuestion < 9) {
      setActiveQuestion(activeQuestion + 1);
    }
  };

  const getStatusColor = (status: QuestionStatus, isActive: boolean) => {
    let baseColor = "bg-white text-gray-700 hover:bg-gray-50 border-transparent hover:border-gray-200";
    
    if (isSubmitted) {
      // In review mode, show green for correct and red for incorrect
      const selected = selectedOptions[activeQuestion] || [];
      const correct = quizData[activeQuestion].correctAnswers;
      const isCorrect = selected.length === correct.length && selected.every(val => correct.includes(val));
      
      // Let's change the color of ALL sidebar buttons based on whether they got it right
      // Wait, we need to know the index of the button to determine if it was correct.
    }

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

  const getSidebarButtonColor = (index: number, status: QuestionStatus, isActive: boolean) => {
    let baseColor = "bg-white text-gray-700 hover:bg-gray-50 border-transparent hover:border-gray-200";
    
    if (isSubmitted) {
      const selected = selectedOptions[index] || [];
      const correct = quizData[index].correctAnswers;
      const isCorrect = selected.length === correct.length && selected.every(val => correct.includes(val));
      
      if (isCorrect) {
        baseColor = "bg-green-100 text-green-800 border-green-200";
      } else {
        baseColor = "bg-red-100 text-red-800 border-red-200";
      }
    } else {
      if (status === "completed") {
        baseColor = "bg-green-100 text-green-800 border-green-200 hover:bg-green-200";
      } else if (status === "not-sure") {
        baseColor = "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200";
      } else if (status === "skipped") {
        baseColor = "bg-red-100 text-red-800 border-red-200 hover:bg-red-200";
      }
    }

    if (isActive) {
      return `${baseColor} ring-2 ring-blue-500 ring-offset-1`;
    }
    
    return baseColor;
  };

  const toggleOption = (optionIndex: number) => {
    if (isSubmitted) return; // Prevent changing answers after submission

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
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)]">
      {/* Sidebar / Topbar on mobile */}
      <aside className="w-full md:w-64 md:h-screen sticky top-0 z-10 bg-white border-b md:border-b-0 md:border-r border-gray-200 flex flex-col shadow-sm flex-shrink-0">
        <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Quiz Navigation</h2>
          {isSubmitted && (
            <div className="md:hidden text-right">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">Score</span>
              <p className="text-xl font-extrabold text-blue-600 leading-none">{score}/{totalMaxMarks}</p>
            </div>
          )}
        </div>
        
        {isSubmitted && (
          <div className="hidden md:block p-4 bg-blue-50 border-b border-blue-100 text-center">
            <h3 className="text-lg font-bold text-blue-900">Your Score</h3>
            <p className="text-3xl font-extrabold text-blue-600 mb-4">{score} / {totalMaxMarks}</p>
            <button 
              onClick={handleRetake}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm transition-colors text-sm"
            >
              Retake Quiz
            </button>
          </div>
        )}

        <nav className="flex md:flex-col overflow-x-auto md:overflow-y-auto p-4 gap-2 md:gap-0 md:space-y-2 hide-scrollbar">
          {statuses.map((status, index) => (
            <button
              key={index}
              onClick={() => setActiveQuestion(index)}
              className={`flex-shrink-0 w-auto md:w-full whitespace-nowrap text-left px-4 py-3 rounded-lg font-medium transition-colors border ${getSidebarButtonColor(index, status, activeQuestion === index)}`}
            >
              Question {index + 1}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          {!isSubmitted ? (
            <button 
              onClick={handleSubmit}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-colors"
            >
              Submit Quiz
            </button>
          ) : (
            <button 
              onClick={handleRetake}
              className="md:hidden w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-colors"
            >
              Retake Quiz
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 md:p-12 flex flex-col md:overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8 flex-1 flex flex-col relative">
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-0 mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                Question {activeQuestion + 1} <span className="text-gray-400 text-lg md:text-xl font-medium">({currentQ.marks} Marks)</span>
              </h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold w-fit">
                {currentQ.intensity} Intensity
              </span>
            </div>
            
            <p className="text-gray-800 text-lg md:text-xl font-medium max-w-3xl mb-6 md:mb-8 whitespace-pre-wrap">
              {currentQ.question}
            </p>

            <div className="space-y-3 max-w-3xl">
              {currentQ.options.map((option, idx) => {
                const isSelected = currentSelected.includes(idx);
                const isCorrect = currentQ.correctAnswers.includes(idx);
                
                let optionClasses = "border-gray-100 hover:border-gray-200 bg-white hover:bg-gray-50";
                let iconBorderClasses = "border-gray-300";
                let textClasses = "text-gray-700";

                if (!isSubmitted) {
                  if (isSelected) {
                    optionClasses = "border-blue-500 bg-blue-50";
                    iconBorderClasses = "border-blue-500 bg-blue-500";
                    textClasses = "text-blue-900 font-medium";
                  }
                } else {
                  if (isCorrect) {
                    optionClasses = "border-green-500 bg-green-50";
                    iconBorderClasses = "border-green-500 bg-green-500";
                    textClasses = "text-green-900 font-medium";
                  } else if (isSelected && !isCorrect) {
                    optionClasses = "border-red-500 bg-red-50";
                    iconBorderClasses = "border-red-500 bg-red-500";
                    textClasses = "text-red-900 font-medium";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => toggleOption(idx)}
                    disabled={isSubmitted}
                    className={`w-full text-left p-3 md:p-4 rounded-xl border-2 transition-all ${optionClasses} ${isSubmitted ? 'cursor-default' : ''}`}
                  >
                    <div className="flex items-start md:items-center gap-3">
                      <div className={`w-5 h-5 flex-shrink-0 mt-0.5 md:mt-0 flex items-center justify-center border-2 rounded ${currentQ.type === 'single' ? 'rounded-full' : 'rounded-md'} ${iconBorderClasses}`}>
                        {((!isSubmitted && isSelected) || (isSubmitted && isCorrect) || (isSubmitted && isSelected)) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isSubmitted && isSelected && !isCorrect ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            )}
                          </svg>
                        )}
                      </div>
                      <span className={`text-base md:text-lg ${textClasses}`}>
                        {option}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {isSubmitted && (
              <div className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-xl max-w-3xl">
                <h4 className="text-xs md:text-sm font-bold text-blue-800 uppercase tracking-wider mb-2">Explanation</h4>
                <p className="text-blue-900 text-base md:text-lg leading-relaxed">
                  {currentQ.explanation}
                </p>
              </div>
            )}

          </div>
          
          {!isSubmitted && (
            <div className="mt-auto pt-6 md:pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => handleSetStatus("completed")}
                className="w-full sm:w-auto px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                Completed
              </button>
              <button 
                onClick={() => handleSetStatus("not-sure")}
                className="w-full sm:w-auto px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                Not Sure
              </button>
              <button 
                onClick={() => handleSetStatus("skipped")}
                className="w-full sm:w-auto sm:ml-auto px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                Skip
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
