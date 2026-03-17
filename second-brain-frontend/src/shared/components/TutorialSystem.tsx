import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/utils/cn';

interface TutorialStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface TutorialSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialSystem = ({ isOpen, onClose }: TutorialSystemProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: TutorialStep[] = [
    {
      target: 'sidebar-nav',
      title: 'Navigation Hub',
      content: 'Access your Dashboard, Notes, Graph, and Channels from the main sidebar.',
      position: 'right'
    },
    {
      target: 'workspace-selector',
      title: 'Workspace Switcher',
      content: 'Quickly move between your personal and team workspaces.',
      position: 'right'
    },
    {
      target: 'chat-channels',
      title: 'Communication',
      content: 'Stay connected with your team in real-time chat channels.',
      position: 'right'
    },
    {
      target: 'note-creator',
      title: 'Capture Knowledge',
      content: 'Create a new note anytime using the + button. Use $ to link notes.',
      position: 'bottom'
    },
    {
      target: 'graph-view',
      title: 'Knowledge Graph',
      content: 'Visualize how your ideas connect and identify gaps in your knowledge.',
      position: 'right'
    },
    {
      target: 'ai-panel',
      title: 'AI Assistant',
      content: 'Get summaries, suggestions, and answers based on your notes.',
      position: 'left'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] pointer-events-none">
      {/* Dim Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/40 backdrop-blur-[2px] pointer-events-auto"
        onClick={onClose}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={cn(
            "fixed z-[120] w-72 bg-card border border-primary/20 shadow-2xl rounded-2xl p-5 pointer-events-auto",
            "bg-gradient-to-br from-card to-muted/30"
          )}
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Sparkles size={16} />
            </div>
            <h4 className="font-bold text-sm tracking-tight">{steps[currentStep].title}</h4>
            <button 
              onClick={onClose}
              className="ml-auto p-1 rounded-md hover:bg-muted transition-colors"
            >
              <X size={14} className="text-muted-foreground" />
            </button>
          </div>
          
          <p className="text-xs text-muted-foreground leading-relaxed mb-6">
            {steps[currentStep].content}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-1 h-1 rounded-full transition-all",
                    currentStep === i ? "bg-primary w-3" : "bg-muted"
                  )} 
                />
              ))}
            </div>
            
            <Button 
              size="sm" 
              onClick={handleNext}
              className="h-8 rounded-full px-4 text-[11px] gap-1.5"
            >
              {currentStep === steps.length - 1 ? "Finish" : "Next"} 
              <ArrowRight size={12} />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
