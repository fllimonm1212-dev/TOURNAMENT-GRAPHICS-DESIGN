import React from 'react';
import { useTournament } from '../context/TournamentContext';
import { CardTemplate } from '../types';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Layout, Sparkles, Zap, Moon, Palette } from 'lucide-react';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

const templates: { id: CardTemplate; name: string; icon: any; color: string; description: string }[] = [
  { id: 'Chemistry', name: 'Chemistry Lab', icon: Zap, color: 'text-cyan-400', description: 'The original high-energy science theme.' },
  { id: 'Golden', name: 'Golden Elite', icon: Sparkles, color: 'text-yellow-400', description: 'Luxurious metallic gold for champions.' },
  { id: 'Emerald', name: 'Emerald Elite', icon: Palette, color: 'text-emerald-400', description: 'Dark green energy with flowing wisps.' },
  { id: 'Midnight', name: 'Midnight Noir', icon: Moon, color: 'text-zinc-400', description: 'Minimalist, dark, and professional.' },
  { id: 'Neon', name: 'Neon Pulse', icon: Layout, color: 'text-fuchsia-400', description: 'Vibrant colors with a futuristic glow.' },
  { id: 'Modern', name: 'Modern Glass', icon: Layout, color: 'text-white', description: 'Clean glassmorphism with subtle blurs.' },
];

export default function TemplateSelector({ isOpen, onClose }: TemplateSelectorProps) {
  const { cardTemplate, setCardTemplate, isGoldenMode } = useTournament();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "relative w-full max-w-2xl rounded-3xl border p-8 shadow-2xl overflow-hidden",
              isGoldenMode ? "bg-[#1a1400] border-yellow-500/20" : "bg-[#0a0b10] border-white/10"
            )}
          >
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[100px]" />

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight">CARD TEMPLATES</h2>
                  <p className="text-white/40 text-sm font-medium">Choose a visual style for your player cards</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setCardTemplate(template.id)}
                    className={cn(
                      "group relative flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 text-left",
                      cardTemplate === template.id
                        ? (isGoldenMode ? "bg-yellow-500/10 border-yellow-500/50" : "bg-indigo-500/10 border-indigo-500/50")
                        : (isGoldenMode ? "bg-white/5 border-white/5 hover:border-yellow-500/20" : "bg-white/5 border-white/5 hover:border-white/20")
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300",
                      cardTemplate === template.id
                        ? (isGoldenMode ? "bg-yellow-500 border-yellow-400 text-white" : "bg-indigo-500 border-indigo-400 text-white")
                        : (isGoldenMode ? "bg-white/5 border-white/10 text-white/40 group-hover:text-white" : "bg-white/5 border-white/10 text-white/40 group-hover:text-white")
                    )}>
                      <template.icon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-sm uppercase tracking-widest text-white">
                          {template.name}
                        </span>
                        {cardTemplate === template.id && (
                          <Check className={cn("w-4 h-4", template.color)} />
                        )}
                      </div>
                      <p className="text-xs text-white/40 font-medium leading-relaxed">
                        {template.description}
                      </p>
                    </div>

                    {cardTemplate === template.id && (
                      <motion.div 
                        layoutId="active-template"
                        className={cn(
                          "absolute inset-0 rounded-2xl border-2 pointer-events-none",
                          isGoldenMode ? "border-yellow-500" : "border-indigo-500"
                        )}
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                <button
                  onClick={onClose}
                  className={cn(
                    "px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all",
                    isGoldenMode 
                      ? "bg-yellow-500 text-black hover:bg-yellow-400 shadow-lg shadow-yellow-500/20" 
                      : "bg-indigo-500 text-white hover:bg-indigo-400 shadow-lg shadow-indigo-500/20"
                  )}
                >
                  Apply Template
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
