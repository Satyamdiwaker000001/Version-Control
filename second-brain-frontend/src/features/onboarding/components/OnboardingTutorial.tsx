import { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Layout, 
  FileText, 
  Github, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '@/shared/api/apiClient';

interface Step {
  title: string;
  description: string;
  icon: any;
  color: string;
}

const steps: Step[] = [
  {
    title: "Workspace Overview",
    description: "Welcome to Second Brain. This platform helps you organize knowledge and collaborate around code. Manage your projects, notes, and integrations from one unified dashboard.",
    icon: Layout,
    color: "bg-indigo-500"
  },
  {
    title: "Notes System",
    description: "Create rich-text or markdown notes to document your technical knowledge. You can link notes directly to code snippets and commit history for better context.",
    icon: FileText,
    color: "bg-emerald-500"
  },
  {
    title: "GitHub Integration",
    description: "Connect your personal GitHub account to sync repositories. This allows you to map your documentation directly to source code and track knowledge across builds.",
    icon: Github,
    color: "bg-zinc-900"
  },
  {
    title: "Chat Channels",
    description: "Communicate with your team or brainstorm with AI in real-time. Share notes, code snippets, and design documents directly within chat channels.",
    icon: MessageSquare,
    color: "bg-purple-500"
  }
];

export const OnboardingTutorial = ({ onClose }: { onClose: () => void }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTutorial();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeTutorial = async () => {
    try {
      await apiClient.patch('/user/preferences', { tutorial_completed: true });
    } catch (error) {
      console.error('Failed to update tutorial status:', error);
    }
    onClose();
  };

  const current = steps[currentStep];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
      >
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div className={`w-14 h-14 rounded-2xl ${current.color} flex items-center justify-center text-white shadow-lg`}>
              <Icon size={28} />
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X size={20} className="text-zinc-500" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mb-10"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold tracking-widest text-indigo-500 uppercase">Step {currentStep + 1} of {steps.length}</span>
                <Sparkles size={12} className="text-amber-500" />
              </div>
              <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-4">
                {current.title}
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {current.description}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-indigo-500' : 'w-1.5 bg-zinc-200 dark:bg-zinc-800'}`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              {currentStep > 0 && (
                <button 
                  onClick={handlePrev}
                  className="h-11 px-5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
              )}
              <button 
                onClick={handleNext}
                className="h-11 px-6 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-lg flex items-center gap-2"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next Step'}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
