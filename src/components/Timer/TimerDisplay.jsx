import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Zap, Coffee, Music, CheckSquare, Flag } from 'lucide-react'; // Added Flag icon
import Button from '../UI/Button';
import SafeLink from '../UI/SafeLink';
import { useTimerContext } from '../../context/TimerContext';
import { useSettings } from '../../context/SettingsContext';
import { useTasks } from '../../context/TaskContext';

const TimerDisplay = ({ isMinimalist, onOpenModal }) => {
  // FIX: Destructure cancelSession
  const { timer, showFlowExtend, finishSession, extendSession, pauseSession, cancelSession } = useTimerContext();
  const { durations, showPercentage, autoStartBreaks, breathingDuration } = useSettings();
  const { tasks, focusedTaskId, setFocusedTaskId } = useTasks();
  
  // Destructure initialDuration from timer. 
  // Note: We do NOT use raw pauseTimer here anymore for the main button action.
  const { timeLeft, isActive, mode, calculateProgress, startTimer, setMode, initialDuration } = timer;
  
  // Intention State
  const [intention, setIntention] = useState("");
  const [showIntentionPrompt, setShowIntentionPrompt] = useState(false);
  const [isBreathing, setIsBreathing] = useState(false);
  const [showPercentageToggle, setShowPercentageToggle] = useState(false);
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

  // Alternating Percentage Logic
  useEffect(() => {
    let interval;
    if (isActive && showPercentage) {
        // Switch between Time and Percentage every 8 seconds
        interval = setInterval(() => {
            setShowPercentageToggle(prev => !prev);
        }, 8000); 
    } else {
        // Reset to showing time when paused or if setting is off
        setShowPercentageToggle(false);
    }
    return () => clearInterval(interval);
  }, [isActive, showPercentage]);

  // Flow Extend Timeout (15 seconds) -> Trigger Breathing
  useEffect(() => {
    let timeout;
    if (showFlowExtend) {
        timeout = setTimeout(() => {
            setIsBreathing(true);
        }, 15000);
    }
    return () => clearTimeout(timeout);
  }, [showFlowExtend]);

  // Breathing Timer Logic (Duration)
  useEffect(() => {
      let timeout;
      if (isBreathing) {
          const duration = breathingDuration || 10; 
          timeout = setTimeout(() => {
              setIsBreathing(false);
              finishSession(); 
          }, duration * 1000);
      }
      return () => clearTimeout(timeout);
  }, [isBreathing, breathingDuration, finishSession]);

  // Haptics & Rhythm Loop
  useEffect(() => {
    let interval;
    if (isBreathing) {
        const triggerHaptic = () => {
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(50);
            }
            setTimeout(() => {
                 if (typeof navigator !== 'undefined' && navigator.vibrate) {
                     navigator.vibrate(20);
                 }
            }, 2000);
        };
        triggerHaptic(); 
        interval = setInterval(triggerHaptic, 4000); 
    }
    return () => clearInterval(interval);
  }, [isBreathing]);

  const handleStartClick = () => {
      if (mode === 'focus' && !isActive && timeLeft === durations.focus * 60) {
          setShowIntentionPrompt(true);
      } else {
          startTimer();
      }
  };

  // FIX: Custom Pause Handler
  const handlePauseClick = () => {
    // If we are in a break (not focus) and auto-start is enabled, 
    // pausing should "quit" the break and reset to focus.
    if (autoStartBreaks && mode !== 'focus') {
        timer.pauseTimer(); // Use raw pause for break skipping
        setMode('focus');
    } else {
        // FIX: Use pauseSession() from context to trigger abandonment stats
        pauseSession(); 
    }
  };

  const confirmIntention = (e) => {
      e?.preventDefault();
      if (!intention.trim()) return;
      setShowIntentionPrompt(false);
      startTimer();
  };

  const handleTakeBreak = () => {
      setIsBreathing(true);
  };

  const colors = {
      focus: '#78b159',
      short: '#fdcb58',
      long: '#54a0ff'
  };
  const currentColor = colors[mode];

  const formatTime = (seconds) => {
    if (showPercentage && isActive && showPercentageToggle) {
        // FIX: Use initialDuration to calculate based on correct total (handles Extensions correctly)
        const total = initialDuration || (durations[mode] * 60);
        
        if (total <= 0) return "0%"; // Safety

        const pct = Math.round(((total - seconds) / total) * 100);
        return `${pct}%`;
    }
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const progress = calculateProgress();
  const radius = 115; 
  const circumference = 2 * Math.PI * radius;

  // CHECK: Is the active task completed?
  const activeTask = tasks.find(t => t.id === focusedTaskId);
  const isTaskCompleted = activeTask?.completed;

  return (
    <div className="w-full flex-1 h-full flex flex-col items-center justify-between relative">
      
      {/* --- BREATHING OVERLAY --- */}
      {createPortal(
        <AnimatePresence>
            {isBreathing && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#78b159] text-white overflow-hidden touch-none"
                >
                    <div className="relative flex items-center justify-center">
                        <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="w-64 h-64 bg-white rounded-full absolute"
                        />
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="w-40 h-40 bg-white rounded-full shadow-lg relative z-10 flex items-center justify-center"
                        >
                            <span className="text-[#78b159] font-black text-xl tracking-widest uppercase">Breathe</span>
                        </motion.div>
                    </div>
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-12 text-3xl font-black tracking-tight relative z-10 drop-shadow-sm"
                    >
                        Inhale... Exhale
                    </motion.h2>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
      )}

      {/* --- INTENTION OVERLAY --- */}
      <AnimatePresence>
        {showIntentionPrompt && !isBreathing && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#fcfcf7]/95 backdrop-blur-xl rounded-[2rem]"
            >
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="w-full max-w-sm px-4"
                >
                    <h2 className="text-3xl font-black mb-6 text-[#54a0ff] drop-shadow-sm tracking-tight text-center">Focus Goal?</h2>
                    <form onSubmit={confirmIntention} className="relative group w-full mb-6">
                        {/* FIX: Removed 'if(focusedTaskId) setFocusedTaskId(null)' from onChange. 
                            This allows users to edit the intention without disconnecting the timer from the task data. */}
                        <input 
                            ref={inputRef}
                            type="text" 
                            value={intention}
                            onChange={(e) => setIntention(e.target.value)}
                            placeholder="I will..."
                            className="w-full bg-white border-4 border-[#e6e2d0] rounded-[2rem] p-5 text-xl font-black text-center text-[#594a42] placeholder-[#54a0ff]/30 outline-none focus:border-[#54a0ff] focus:shadow-xl transition-all shadow-sm"
                        />
                    </form>
                    <div className="flex gap-3 justify-center">
                        <Button 
                            onClick={() => setShowIntentionPrompt(false)}
                            variant="neutral"
                            className="px-6"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={confirmIntention} 
                            disabled={!intention.trim()} 
                            className="bg-[#54a0ff] border-[#2e86de] text-white px-8 shadow-[0_4px_0_#2e86de] hover:bg-[#48dbfb]"
                        >
                            Start
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- STANDARD DISPLAY --- */}
      
      {/* 1. Mode Switcher (Top) */}
      <div className="h-14 flex items-center relative z-20">
        <AnimatePresence>
            {!isActive && !showFlowExtend && !autoStartBreaks && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                    className="flex gap-1 bg-white/60 p-2 rounded-full backdrop-blur-md shadow-sm border-2 border-white/50"
                >
                    {['focus', 'short', 'long'].map(m => (
                        <button 
                            key={m} 
                            onClick={() => setMode(m)} 
                            className={`px-6 py-3 rounded-full text-xs font-black transition-all capitalize tracking-wide ${mode === m ? 'bg-white text-[#594a42] shadow-sm transform scale-105 border border-black/5' : 'text-[#8e8070] hover:bg-white/50'}`}
                        >
                            {m}
                        </button>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
      </div>
      
      {/* 2. Timer Circle (Center) */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full mb-14 mt-2">
          <div className="relative">
            {/* Outer glow ring */}
            <div className="absolute inset-0 bg-white/40 blur-3xl rounded-full transform scale-110"></div>
            
            <svg className="w-64 h-64 sm:w-72 sm:h-72 transform -rotate-90 drop-shadow-xl overflow-visible">
                <circle cx="50%" cy="50%" r={radius} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="24" strokeLinecap="round" />
                <motion.circle 
                    cx="50%" cy="50%" r={radius} fill="none" 
                    stroke={currentColor} 
                    strokeWidth="24" 
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
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`text-6xl sm:text-7xl font-black tracking-tight font-mono transition-colors duration-500 ${isActive ? 'text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.1)]' : 'text-[#594a42]'}`}
                >
                    {formatTime(timeLeft)}
                </motion.div>
                <motion.div 
                    layout
                    className={`font-black mt-2 px-4 py-1.5 rounded-full backdrop-blur-sm inline-block transition-colors duration-500 text-[10px] sm:text-xs uppercase tracking-[0.2em] shadow-sm ${isActive ? 'bg-black/10 text-white' : 'bg-[#594a42]/10 text-[#594a42]'}`}
                >
                    {mode === 'focus' ? 'Focus Session' : mode === 'short' ? 'Short Break' : 'Long Break'}
                </motion.div>
            </div>
          </div>
          
          {/* Active Task Pill */}
          <div className="absolute -bottom-5 w-full flex justify-center h-7 z-30">
            <AnimatePresence mode='wait'>
                {isActive && mode === 'focus' && intention && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        className="flex flex-col items-center text-white/90"
                    >
                        <span className="flex items-center gap-3 bg-white/25 px-6 py-3 rounded-2xl backdrop-blur-md shadow-lg border border-white/20 text-sm font-bold ring-1 ring-white/10">
                            <span className="relative flex h-3 w-3">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isTaskCompleted ? 'bg-emerald-400' : 'bg-[#ff6b6b]'}`}></span>
                                <span className={`relative inline-flex rounded-full h-3 w-3 ${isTaskCompleted ? 'bg-emerald-400' : 'bg-[#ff6b6b]'}`}></span>
                            </span>
                            <span className="truncate max-w-[280px]">
                                {isTaskCompleted ? "Task Completed: " : "Focusing on: "} 
                                <span className="text-white drop-shadow-sm">{intention}</span>
                            </span>
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
          </div>
      </div>

      {/* 3. Bottom Controls */}
      <div className="w-full flex flex-col items-center gap-3 z-20">
         <div className="h-16 flex items-center justify-center">
            <AnimatePresence mode='wait'>
                {showFlowExtend ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="flex gap-4"
                    >
                        <Button onClick={extendSession} variant="primary" icon={Zap} className="shadow-xl ring-4 ring-[#78b159]/20 text-lg py-3 px-8">Extend 15m</Button>
                        <Button onClick={handleTakeBreak} variant="secondary" icon={Coffee} className="text-lg py-3 px-8">Take Break</Button>
                    </motion.div>
                ) : (
                    <motion.div 
                        key={isActive ? 'controls' : 'start'}
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                    >
                        {/* FIX: Show "Finish Early" if task is done and timer is running */}
                        {isActive && mode === 'focus' && isTaskCompleted ? (
                             <div className="flex gap-3">
                                <Button 
                                    onClick={handlePauseClick} 
                                    variant="secondary"
                                    icon={Pause} 
                                    className="min-w-[120px] text-lg py-4 shadow-xl"
                                >
                                    Pause
                                </Button>
                                <Button 
                                    onClick={cancelSession} 
                                    variant="primary" 
                                    icon={Flag} // Flag icon for finish
                                    className="min-w-[140px] text-lg py-4 shadow-xl bg-emerald-500 border-emerald-600 shadow-[0_4px_0_#059669] hover:bg-emerald-400"
                                >
                                    Finish Now
                                </Button>
                            </div>
                        ) : (
                            <Button 
                                onClick={isActive ? handlePauseClick : handleStartClick} 
                                variant={isActive ? "secondary" : "primary"} 
                                icon={isActive ? Pause : Play} 
                                className="min-w-[160px] text-xl py-4 shadow-xl"
                            >
                                {isActive ? 'Pause' : 'Start'}
                            </Button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
         </div>

         {/* Widgets */}
         <AnimatePresence>
            {!isMinimalist && !isActive && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="w-full max-w-lg px-2"
                >
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <SafeLink onClick={() => onOpenModal('music')} className="cursor-pointer block">
                            <div className="bg-white/60 hover:bg-white/90 backdrop-blur-md p-3.5 rounded-[1.5rem] border-2 border-white/70 flex items-center gap-3 transition-all hover:-translate-y-1 hover:shadow-lg group w-full h-full">
                                <div className="bg-[#78b159]/20 p-2.5 rounded-xl text-[#78b159] group-hover:scale-110 transition-transform"><Music size={20} strokeWidth={2.5}/></div>
                                <div className="text-left leading-tight"><span className="font-black text-[#594a42] text-sm block">Soundscapes</span><span className="text-[10px] font-bold text-[#8e8070]">Mixer & Spotify</span></div>
                            </div>
                        </SafeLink>
                        <SafeLink href="https://todoist.com" target="_blank" className="block">
                            <div className="bg-white/60 hover:bg-white/90 backdrop-blur-md p-3.5 rounded-[1.5rem] border-2 border-white/70 flex items-center gap-3 transition-all hover:-translate-y-1 hover:shadow-lg group w-full h-full">
                                <div className="bg-[#ff6b6b]/20 p-2.5 rounded-xl text-[#ff6b6b] group-hover:scale-110 transition-transform"><CheckSquare size={20} strokeWidth={2.5}/></div>
                                <div className="text-left leading-tight"><span className="font-black text-[#594a42] text-sm block">Todoist</span><span className="text-[10px] font-bold text-[#8e8070]">Open Web</span></div>
                            </div>
                        </SafeLink>
                    </div>
                </motion.div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
};
export default TimerDisplay;