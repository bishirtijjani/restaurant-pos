import React from "react";

const PREDEFINED_QUESTIONS = [
  "What was the name of your first pet?",
  "What city were you born in?",
  "What is your mother's maiden name?",
  "What was the name of your elementary school?",
  "What is your favorite book?",
  "What was your childhood nickname?",
  "In what city did you meet your spouse/partner?",
  "What is the name of your favorite childhood friend?",
  "What street did you live on in third grade?",
  "What is your oldest sibling's birthday month and year?",
];

const SecurityQuestionsInput = ({
  securityQuestions,
  onSecurityQuestionsChange,
  showAnswers = true,
}) => {
  const handleQuestionChange = (index, value) => {
    const updated = [...securityQuestions];
    updated[index] = { ...updated[index], question: value };
    onSecurityQuestionsChange(updated);
  };

  const handleAnswerChange = (index, value) => {
    const updated = [...securityQuestions];
    updated[index] = { ...updated[index], answer: value };
    onSecurityQuestionsChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-gray-700 mb-2">
        Security Questions (for password recovery)
      </div>

      {securityQuestions.map((sq, index) => (
        <div key={index} className="space-y-2 p-4 bg-base-200 rounded-lg">
          <label className="block text-sm font-medium">
            Security Question {index + 1}
          </label>
          <select
            value={sq.question}
            onChange={(e) => handleQuestionChange(index, e.target.value)}
            className="select select-bordered w-full"
            required
          >
            <option value="">Select a question...</option>
            {PREDEFINED_QUESTIONS.map((question, qIndex) => (
              <option key={qIndex} value={question}>
                {question}
              </option>
            ))}
          </select>

          {showAnswers && (
            <>
              <label className="block text-sm font-medium mt-2">Answer</label>
              <input
                type="text"
                value={sq.answer}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                className="input input-bordered w-full"
                placeholder="Enter your answer"
                required
                minLength={2}
              />
              <p className="text-xs text-gray-500 mt-1">
                Answer is case-insensitive
              </p>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default SecurityQuestionsInput;
