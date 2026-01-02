import React from 'react';
import { Play, Pause, Zap, Coffee, SkipForward } from 'lucide-react';
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

  const getModeColor = () => {
      switch(mode) {
          case 'focus': return '#78b159'; // Leaf Green
          case 'short': return '#fdcb58'; // Bell Yellow
          case 'long': return '#54a0ff';  // Sky Blue
          default: return '#78b159';
      }
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full p-6">
      
      {/* Mode Switcher Tabs */}
      {!isActive && !showFlowExtend && (
        <div className="absolute top-0 z-20 flex bg-[#f1f2f6] p-1.5 rounded-full shadow-inner animate-pop-in">
            {['focus', 'short', 'long'].map(m => (
                <button 
                    key={m} 
                    onClick={() => setMode(m)} 
                    className={`
                        px-6 py-2 rounded-full text-sm font-black transition-all duration-300 capitalize
                        ${mode === m 
                            ? 'bg-white text-[#594a42] shadow-md scale-105' 
                            : 'text-[#a4b0be] hover:text-[#594a42]'
                        }
                    `}
                >
                    {m}
                </button>
            ))}
        </div>
      )}
      
      {/* The Big Timer Circle */}
      <div className="relative z-10 my-10 animate-pop-in flex items-center justify-center group cursor-default">
          {/* Decorative outer ring */}
          <div className={`absolute inset-0 rounded-full border-4 border-dashed opacity-20 animate-spin-slow transition-colors duration-1000`} style={{ borderColor: getModeColor(), width: '120%', height: '120%', left: '-10%', top: '-10%' }}></div>
          
          <svg className="w-72 h-72 sm:w-80 sm:h-80 transform -rotate-90 drop-shadow-2xl">
            {/* Background Circle */}
            <circle cx="50%" cy="50%" r="45%" fill="none" stroke="#f1f2f6" strokeWidth="24" strokeLinecap="round" />
            {/* Progress Circle */}
            <circle 
                cx="50%" cy="50%" r="45%" fill="none" 
                stroke={getModeColor()} 
                strokeWidth="24" 
                strokeDasharray={`calc(2 * 3.14159 * 45%)`} 
                strokeDashoffset={`calc(2 * 3.14159 * 45% * (1 - ${calculateProgress() / 100}))`} 
                strokeLinecap="round"
                className="transition-all duration-1000 ease-in-out"
            />
          </svg>
          
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full flex flex-col items-center justify-center">
            <div className={`text-7xl sm:text-8xl font-black tracking-tighter font-nunito transition-all duration-500 ${isActive ? 'scale-110 drop-shadow-md text-[#594a42]' : 'text-[#594a42]'}`}>
                {formatTime(timeLeft)}
            </div>
            <div className={`mt-4 px-4 py-1.5 rounded-full font-bold text-sm tracking-wide transition-all duration-500 ${isActive ? 'bg-[#594a42] text-white' : 'bg-[#f1f2f6] text-[#8e8070]'}`}>
                {mode === 'focus' ? 'Focus Session' : mode === 'short' ? 'Short Break' : 'Long Break'}
            </div>
          </div>
      </div>

      {/* Active Task Pill */}
      {mode === 'focus' && activeTask && (
        <div className="mb-8 animate-slide-up">
            <div className="flex items-center gap-3 bg-white border-2 border-[#f1f2f6] px-5 py-2 rounded-2xl shadow-sm hover:border-[#78b159] transition-colors cursor-pointer">
                <span className="w-3 h-3 bg-[#ff6b6b] rounded-full animate-pulse"></span>
                <span className="font-bold text-[#594a42] max-w-[200px] truncate">{activeTask.text}</span>
            </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="h-16 flex items-center justify-center gap-4 z-20">
         {showFlowExtend ? (
            <div className="flex gap-4 animate-pop-in absolute bottom-10 bg-white/90 p-4 rounded-3xl shadow-xl border-4 border-[#e6e2d0] backdrop-blur-md">
                <Button onClick={extendSession} variant="primary" icon={Zap} className="shadow-lg">Extend 15m</Button>
                <Button onClick={finishSession} variant="secondary" icon={Coffee} className="shadow-lg">Take Break</Button>
            </div>
         ) : (
            <>
                <Button 
                    onClick={isActive ? pauseTimer : startTimer} 
                    variant={isActive ? "secondary" : "primary"} 
                    icon={isActive ? Pause : Play} 
                    className="w-48 h-14 text-xl shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                    {isActive ? 'Pause' : 'Start'}
                </Button>
                {isActive && (
                    <button onClick={() => { pauseTimer(); setMode(mode); }} className="p-4 bg-[#f1f2f6] rounded-2xl text-[#a4b0be] hover:text-[#ff6b6b] hover:bg-[#fff0f0] transition-colors" title="Reset">
                        <SkipForward size={24} fill="currentColor"/>
                    </button>
                )}
            </>
         )}
      </div>
    </div>
  );
};
export default TimerDisplay;