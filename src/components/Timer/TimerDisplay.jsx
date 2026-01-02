import React, { useState } from 'react';
import { Play, Pause, Zap, Coffee } from 'lucide-react';
import Button from '../UI/Button';
import { useTimerContext } from '../../context/TimerContext';
import { useSettings } from '../../context/SettingsContext';
import { useTasks } from '../../context/TaskContext';

const TimerDisplay = () => {
  const { timer, showFlowExtend, finishSession, extendSession } = useTimerContext();
  const { durations, showPercentage } = useSettings();
  const { tasks, focusedTaskId } = useTasks();
  
  const { timeLeft, isActive, mode, calculateProgress, startTimer, pauseTimer, setMode } = timer;
  const activeTask = tasks.find(t => t.id === focusedTaskId);

  // Intentional Start Logic could be moved here or kept simple
  const handleStart = () => startTimer();

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

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full">
      {!isActive && !showFlowExtend && (
        <div className="absolute top-0 flex gap-2 mb-4 z-20 bg-white/40 p-1 rounded-full backdrop-blur-sm animate-pop-in">
            {['focus', 'short', 'long'].map(m => (
                <button key={m} onClick={() => setMode(m)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all capitalize ${mode === m ? 'bg-[#78b159] text-white shadow-md' : 'text-[#594a42] hover:bg-white/50'}`}>{m}</button>
            ))}
        </div>
      )}
      
      <div className="relative mb-6 z-10 animate-pop-in flex items-center justify-center mt-8">
          <svg className="w-56 h-56 sm:w-72 sm:h-72 transform -rotate-90 drop-shadow-xl">
            <circle cx="50%" cy="50%" r="45%" fill="none" stroke={isActive ? "rgba(255,255,255,0.2)" : "#f1f2f6"} strokeWidth="16" />
            <circle cx="50%" cy="50%" r="45%" fill="none" stroke={mode === 'focus' ? '#78b159' : mode === 'short' ? '#fdcb58' : '#54a0ff'} strokeWidth="16" strokeDasharray={`calc(2 * 3.14159 * 45%)`} strokeDashoffset={`calc(2 * 3.14159 * 45% * (1 - ${calculateProgress() / 100}))`} strokeLinecap="round" />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full">
            <div className={`text-5xl sm:text-7xl font-black tracking-tighter font-mono drop-shadow-sm transition-colors duration-500 ${isActive ? 'text-white drop-shadow-md' : 'text-[#594a42]'}`}>{formatTime(timeLeft)}</div>
            <div className={`font-bold mt-2 px-4 py-1 rounded-full backdrop-blur-sm inline-block transition-colors duration-500 text-xs sm:text-base ${isActive ? 'bg-black/20 text-white' : 'bg-white/50 text-[#8e8070]'}`}>{mode === 'focus' ? 'Focus Session' : mode === 'short' ? 'Short Break' : 'Long Break'}</div>
          </div>
      </div>

      {mode === 'focus' && activeTask && (
        <div className={`mb-6 text-xs font-bold transition-colors duration-500 flex flex-col items-center gap-1 ${isActive ? 'text-white/90' : 'text-[#a4b0be]'}`}>
            <span className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm animate-pop-in">
                <span className="w-2 h-2 bg-[#ff6b6b] rounded-full animate-pulse"></span>
                Focusing on: <span className="underline decoration-2 underline-offset-2">{activeTask.text}</span>
            </span>
        </div>
      )}

      <div className="flex gap-4 z-10 h-12">
         {showFlowExtend ? (
            <div className="flex gap-2 animate-pop-in absolute bottom-12">
                <Button onClick={extendSession} variant="primary" icon={Zap} className="shadow-2xl ring-4 ring-[#78b159]/20">Extend 15m</Button>
                <Button onClick={finishSession} variant="secondary" icon={Coffee}>Take Break</Button>
            </div>
         ) : (
            <Button onClick={isActive ? pauseTimer : handleStart} variant={isActive ? "secondary" : "primary"} icon={isActive ? Pause : Play} className="w-32 sm:w-40 text-base sm:text-lg shadow-xl">{isActive ? 'Pause' : 'Start'}</Button>
         )}
      </div>
    </div>
  );
};
export default TimerDisplay;