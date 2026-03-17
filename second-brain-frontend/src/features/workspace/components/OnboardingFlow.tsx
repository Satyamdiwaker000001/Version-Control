import { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Layout, Github, CheckCircle, ArrowRight, X } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/utils/cn';

interface OnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const OnboardingFlow = ({ isOpen, onClose, onComplete }: OnboardingFlowProps) => {
  const [step, setStep] = useState(1);
  const [workspaceName, setWorkspaceName] = useState('');
  const totalSteps = 4;

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const skipAll = () => {
    onComplete();
  };

  if (!isOpen) return null;

  const steps = [
    {
      title: "Welcome to Noetic",
      desc: "Your second brain for team collaboration and deep thought.",
      content: (
        <div className="flex flex-col items-center justify-center space-y-6 pt-4">
          <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Rocket size={48} className="animate-bounce" />
          </div>
          <p className="text-center text-muted-foreground text-sm max-w-[280px]">
            Noetic helps you organize your notes, connect ideas, and collaborate with your team in real-time.
          </p>
        </div>
      )
    },
    {
      title: "Create Your Workspace",
      desc: "Every great idea needs a place to grow.",
      content: (
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
              Workspace Name
            </label>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Research Lab, Project Phoenix"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full px-4 py-3 bg-accent/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all"
            />
          </div>
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
            <Layout size={18} className="text-primary mt-0.5 shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Workspaces are shared environments where you can organize notes into projects and chat with members.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Connect Your Workflow",
      desc: "Integrate with the tools you already use.",
      content: (
        <div className="space-y-4 pt-4">
          <Button 
            variant="outline" 
            className="w-full h-14 justify-start gap-4 px-6 rounded-xl hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all group"
          >
            <Github size={20} className="group-hover:scale-110 transition-transform" />
            <div className="flex flex-col items-start">
              <span className="font-bold text-sm">Connect GitHub</span>
              <span className="text-[10px] opacity-70">Sync repositories and markdown files</span>
            </div>
            <ArrowRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
          </Button>
          <div className="p-4 rounded-xl bg-muted/30 border border-border flex items-start gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
             <p className="text-[11px] text-muted-foreground">
               You can always connect more integrations later from your workspace settings.
             </p>
          </div>
        </div>
      )
    },
    {
      title: "You're All Set!",
      desc: "Ready to start building your knowledge base.",
      content: (
        <div className="flex flex-col items-center justify-center space-y-6 pt-4">
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border-4 border-emerald-500/20 shadow-xl">
            <CheckCircle size={48} />
          </div>
          <div className="space-y-2 text-center">
            <p className="text-sm font-medium text-foreground">Starter pack activated</p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-accent text-[10px] font-bold text-muted-foreground">#general channel</span>
              <span className="px-2.5 py-1 rounded-full bg-accent text-[10px] font-bold text-muted-foreground">Personal Vault</span>
              <span className="px-2.5 py-1 rounded-full bg-accent text-[10px] font-bold text-muted-foreground">Starter Note</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-background/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-lg bg-card border border-border shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[32px] overflow-hidden flex flex-col sm:flex-row h-auto min-h-[480px]"
      >
        {/* Progress Sidebar */}
        <div className="w-full sm:w-48 bg-muted/30 border-b sm:border-b-0 sm:border-r border-border p-6 flex sm:flex-col justify-between sm:justify-start gap-4">
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-6">Onboarding</h4>
            <div className="flex sm:flex-col gap-2 sm:gap-4">
              {steps.map((_, i) => (
                <div key={i} className="flex items-center gap-3 group shrink-0">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all border-2",
                    step === i + 1 ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20" : 
                    step > i + 1 ? "bg-primary/20 border-primary/20 text-primary" : "bg-transparent border-border text-muted-foreground"
                  )}>
                    {step > i + 1 ? <CheckCircle size={14} /> : i + 1}
                  </div>
                  <span className={cn(
                    "text-[11px] font-bold hidden sm:block",
                    step === i + 1 ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {i === 0 && "Welcome"}
                    {i === 1 && "Workspace"}
                    {i === 2 && "Connect"}
                    {i === 3 && "Finish"}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <button 
            onClick={skipAll}
            className="sm:mt-auto text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest px-2 py-1"
          >
            Skip all
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col p-8 sm:p-10 relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors sm:hidden"
          >
            <X size={20} />
          </button>

          <div className="flex-1">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-2 h-full flex flex-col"
            >
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground leading-tight">
                {steps[step-1].title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {steps[step-1].desc}
              </p>
              
              <div className="flex-1 min-h-[240px]">
                {steps[step-1].content}
              </div>
            </motion.div>
          </div>

          <div className="pt-8 flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground">
              Step {step} of {totalSteps}
            </span>
            <Button 
              size="lg" 
              onClick={nextStep}
              className="px-8 rounded-full premium-shadow group gap-2"
            >
              {step === totalSteps ? "Get Started" : "Continue"}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
