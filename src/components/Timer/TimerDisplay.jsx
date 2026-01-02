import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Zap, Coffee, ArrowRight } from 'lucide-react';
import Button from '../UI/Button';
import { useTimerContext } from '../../context/TimerContext';
import { useSettings } from '../../context/SettingsContext';
import { useTasks } from '../../context/TaskContext';

const TimerDisplay = () => {
  const { timer, showFlowExtend, finishSession, extendSession } = useTimerContext();
  const { durations, showPercentage } = useSettings();
  const { tasks, focusedTaskId, setFocusedTaskId } = useTasks();
  
  const { timeLeft, isActive, mode, calculateProgress, startTimer, pauseTimer, setMode } = timer;
  
  // Intention State
  const [intention, setIntention] = useState("");
  const [showIntentionPrompt, setShowIntentionPrompt] = useState(false);
  const inputRef = useRef(null);

  // Sync intention with selected task if available
  useEffect(() => {
    if (focusedTaskId) {
      const task = tasks.find(t => t.id === focusedTaskId);
      if (task) setIntention(task.text);
    }
  }, [focusedTaskId, tasks]);

  // Focus input when prompt opens
  useEffect(() => {
    if (showIntentionPrompt && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [showIntentionPrompt]);

  const handleStartClick = () => {
      // If prompt is needed (Focus mode + not active + not resuming)
      if (mode === 'focus' && !isActive && timeLeft === durations.focus * 60) {
          setShowIntentionPrompt(true);
      } else {
          startTimer();
      }
  };

  const confirmIntention = (e) => {
      e?.preventDefault();
      if (!intention.trim()) return;
      setShowIntentionPrompt(false);
      startTimer();
  };

  const colors = {
      focus: '#78b159',
      short: '#fdcb58',
      long: '#54a0ff'
  };
  const currentColor = colors[mode];

  const formatTime = (seconds) => {
    if (showPercentage && isActive) {
        const total = durations[mode] * 60;
        const pct = Math.round(((total - seconds) / total) * 100);
        return `${pct}%`;
    }
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const progress = calculateProgress();
  const radius = 100; 
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full">
      
      {/* --- INTENTION OVERLAY --- */}
      <AnimatePresence>
        {showIntentionPrompt && (
            <motion.div 
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#bde0fe] text-[#594a42] p-6"
            >
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-full max-w-2xl text-center"
                >
                    <h2 className="text-3xl md:text-5xl font-black mb-8 text-[#54a0ff] drop-shadow-sm tracking-tight">What are you going to do?</h2>
                    <form onSubmit={confirmIntention} className="relative">
                        <input 
                            ref={inputRef}
                            type="text" 
                            value={intention}
                            onChange={(e) => { setIntention(e.target.value); if(focusedTaskId) setFocusedTaskId(null); }}
                            placeholder="I will focus on..."
                            className="w-full bg-white/50 backdrop-blur-md border-4 border-white/60 rounded-3xl p-6 text-2xl md:text-4xl font-black text-center text-[#594a42] placeholder-[#54a0ff]/50 outline-none focus:bg-white/80 focus:border-white focus:shadow-xl transition-all"
                        />
                        <button 
                            type="button"
                            onClick={() => setShowIntentionPrompt(false)}
                            className="absolute top-1/2 -translate-y-1/2 right-6 p-2 rounded-full hover:bg-black/5 transition-colors text-[#8e8070] font-bold text-xs"
                        >
                            ESC
                        </button>
                    </form>
                    <div className="mt-8 flex justify-center">
                        <Button 
                            onClick={confirmIntention} 
                            disabled={!intention.trim()} 
                            className="bg-[#54a0ff] border-[#2e86de] text-white text-xl px-10 py-4 shadow-xl hover:bg-[#48dbfb]"
                        >
                            Let's Go <ArrowRight className="ml-2" strokeWidth={3} />
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- STANDARD DISPLAY --- */}
      
      {/* Mode Switcher */}
      <AnimatePresence>
        {!isActive && !showFlowExtend && (
            <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-0 flex gap-2 mb-4 z-20 bg-white/50 p-1.5 rounded-full backdrop-blur-md shadow-sm border border-white/20"
            >
                {['focus', 'short', 'long'].map(m => (
                    <button 
                        key={m} 
                        onClick={() => setMode(m)} 
                        className={`px-4 py-1.5 rounded-full text-xs font-black transition-all capitalize ${mode === m ? 'bg-white text-[#594a42] shadow-md transform scale-105' : 'text-[#8e8070] hover:bg-white/40'}`}
                    >
                        {m}
                    </button>
                ))}
            </motion.div>
        )}
      </AnimatePresence>
      
      {/* Timer Circle */}
      <div className="relative mb-6 z-10 flex items-center justify-center mt-10">
          <svg className="w-60 h-60 sm:w-72 sm:h-72 transform -rotate-90 drop-shadow-2xl">
            <circle cx="50%" cy="50%" r={radius} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="20" strokeLinecap="round" />
            <motion.circle 
                cx="50%" cy="50%" r={radius} fill="none" 
                stroke={currentColor} 
                strokeWidth="20" 
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference * (1 - progress / 100), stroke: currentColor }}
                transition={{ type: 'spring', stiffness: 50, damping: 20 }}
            />
          </svg>
          
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full flex flex-col items-center">
            <motion.div 
                key={timeLeft}
                className={`text-5xl sm:text-7xl font-black tracking-tighter font-mono transition-colors duration-500 ${isActive ? 'text-white drop-shadow-md' : 'text-[#594a42]'}`}
            >
                {formatTime(timeLeft)}
            </motion.div>
            <motion.div 
                layout
                className={`font-bold mt-2 px-3 py-1 rounded-full backdrop-blur-sm inline-block transition-colors duration-500 text-[10px] sm:text-xs uppercase tracking-widest ${isActive ? 'bg-black/20 text-white' : 'bg-white/50 text-[#8e8070]'}`}
            >
                {mode === 'focus' ? 'Focus Session' : mode === 'short' ? 'Short Break' : 'Long Break'}
            </motion.div>
          </div>
      </div>

      {/* Active Task Pill (Only shows when timer is running) */}
      <div className="h-10 mb-4 w-full flex justify-center z-20">
        <AnimatePresence mode='wait'>
            {isActive && mode === 'focus' && intention && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center gap-1 text-white/90"
                >
                    <span className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-2xl backdrop-blur-md shadow-sm border border-white/10 text-sm font-bold">
                        <span className="w-2 h-2 bg-[#ff6b6b] rounded-full animate-pulse shadow-[0_0_8px_#ff6b6b]"></span>
                        <span className="truncate max-w-[250px]">Focusing on: <span className="text-white decoration-[#ff6b6b] underline decoration-2 underline-offset-2">{intention}</span></span>
                    </span>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex gap-4 z-20 h-14 items-center">
         <AnimatePresence mode='wait'>
             {showFlowExtend ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    className="flex gap-3 absolute bottom-4"
                >
                    <Button onClick={extendSession} variant="primary" icon={Zap} className="shadow-xl ring-4 ring-[#78b159]/20 text-md py-2 px-5">Extend 15m</Button>
                    <Button onClick={finishSession} variant="secondary" icon={Coffee} className="text-md py-2 px-5">Take Break</Button>
                </motion.div>
             ) : (
                <motion.div 
                    key={isActive ? 'pause' : 'start'}
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                >
                    <Button 
                        onClick={isActive ? pauseTimer : handleStartClick} 
                        variant={isActive ? "secondary" : "primary"} 
                        icon={isActive ? Pause : Play} 
                        className="w-36 text-lg py-2.5 shadow-xl"
                    >
                        {isActive ? 'Pause' : 'Start'}
                    </Button>
                </motion.div>
             )}
         </AnimatePresence>
      </div>
    </div>
  );
};
export default TimerDisplay;