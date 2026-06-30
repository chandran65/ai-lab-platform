import React, { useEffect, useState } from "react";

interface PortalLoaderProps {
  isOpen: boolean;
  gameTitle: string;
  onComplete: () => void;
}

export const PortalLoader: React.FC<PortalLoaderProps> = ({
  isOpen,
  gameTitle,
  onComplete,
}) => {
  const [steps, setSteps] = useState([
    { label: "Packing your backpack...", status: "pending" },
    { label: `Preparing today's adventure at ${gameTitle}...`, status: "pending" },
    { label: "Calling your AI buddy (Mindora Buddy)...", status: "pending" },
    { label: "Unlocking today's mission path...", status: "pending" },
    { label: "Almost ready!", status: "pending" },
  ]);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      let currentStep = 0;
      
      const interval = setInterval(() => {
        setSteps((prevSteps) => {
          const next = [...prevSteps];
          if (currentStep < next.length) {
            next[currentStep].status = "complete";
          }
          return next;
        });

        currentStep++;
        
        if (currentStep > steps.length) {
          clearInterval(interval);
          setTimeout(() => {
            setVisible(false);
            onComplete();
          }, 450);
        }
      }, 550);

      return () => clearInterval(interval);
    } else {
      setVisible(false);
      setSteps((prev) => prev.map((s) => ({ ...s, status: "pending" })));
    }
  }, [isOpen, gameTitle, onComplete, steps.length]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FFF9F0]/85 backdrop-blur-md animate-in fade-in duration-300">
      {/* Soft warm glow decorations */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#FFD76A]/20 to-[#FF9BAA]/10 blur-3xl opacity-60 pointer-events-none" />
      
      <div className="w-full max-w-md p-8 bg-white border-2 border-[#FFD76A]/40 rounded-[28px] shadow-2xl relative z-10 flex flex-col items-center">
        {/* Animated Mascot Walking Loader */}
        <div className="relative w-20 h-20 mb-8 floating-buddy">
          <svg viewBox="0 0 60 60" className="w-full h-full">
            <rect x="15" y="22" width="30" height="26" rx="8" fill="#69B8FF" stroke="#334155" strokeWidth="2" />
            <rect x="20" y="27" width="20" height="15" rx="4" fill="#FFFCF8" />
            <circle cx="26" cy="33" r="1.5" fill="#334155" />
            <circle cx="34" cy="33" r="1.5" fill="#334155" />
            <path d="M 27 38 Q 30 40 33 38" fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="20" y="10" width="20" height="10" rx="4" fill="#FFD76A" stroke="#334155" strokeWidth="2" />
            <circle cx="26" cy="15" r="2" fill="#334155" />
            <circle cx="34" cy="15" r="2" fill="#334155" />
            <line x1="30" y1="10" x2="30" y2="4" stroke="#334155" strokeWidth="2" />
            <circle cx="30" cy="3" r="2.5" fill="#FF9BAA" stroke="#334155" strokeWidth="1.5" />
            <path d="M 10 26 Q 8 20 12 16" fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
            <path d="M 50 26 Q 52 20 48 16" fill="none" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
            <circle cx="23" cy="50" r="3.5" fill="#334155" />
            <circle cx="37" cy="50" r="3.5" fill="#334155" />
          </svg>
        </div>

        <h2 className="text-xl font-black font-display text-slate-800 mb-1 uppercase tracking-wide">
          Preparing Adventure
        </h2>
        <p className="text-xs text-[#a16207] font-bold uppercase tracking-widest font-mono">
          {gameTitle}
        </p>

        {/* Packing checklist paths */}
        <div className="w-full mt-6 space-y-3.5 font-display text-xs select-none">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className={step.status === "complete" ? "text-slate-700 font-bold" : "text-slate-400"}>
                {step.label}
              </span>
              <span className="font-bold">
                {step.status === "complete" ? (
                  <span className="text-[#10B981] text-sm">✓</span>
                ) : (
                  <span className="text-[#F4B942] animate-pulse">...</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
