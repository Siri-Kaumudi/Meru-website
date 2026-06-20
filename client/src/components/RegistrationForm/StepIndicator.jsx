import { Check } from 'lucide-react';

const STEPS = [
  { label: 'కుటుంబ వివరాలు', sublabel: 'Household Info' },
  { label: 'సభ్యుల వివరాలు', sublabel: 'Member Details' },
  { label: 'నిర్ధారణ', sublabel: 'Confirm & Submit' },
];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center mb-8 px-4">
      {STEPS.map((step, index) => {
        const stepNum = index + 1;
        const isDone = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <div key={stepNum} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${
                  isDone
                    ? 'bg-green-500 border-green-500 text-white'
                    : isActive
                    ? 'bg-primary-700 border-primary-700 text-white shadow-lg scale-110'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {isDone ? <Check className="w-5 h-5" /> : stepNum}
              </div>
              <div className="text-center mt-1.5 hidden sm:block">
                <div className={`text-xs font-semibold ${isActive ? 'text-primary-700' : isDone ? 'text-green-600' : 'text-gray-400'}`}>
                  {step.label}
                </div>
                <div className="text-xs text-gray-400">{step.sublabel}</div>
              </div>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 sm:mx-4 w-12 sm:w-20 transition-all duration-300 ${
                  isDone ? 'bg-green-400' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
