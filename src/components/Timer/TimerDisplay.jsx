import React from 'react';
import { Play, Pause, Zap, Coffee } from 'lucide-react';
import Button from '../UI/Button';

const TimerDisplay = ({ timer, settings }) => {
  const { timeLeft, isActive, mode, isIntermission, intermissionTimeLeft, startTimer, pauseTimer, finishIntermission, calculateProgress } = timer;
  
  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  return (
    <div className="relative flex flex-col items-center justify-center py-8">
      <svg className="w-64 h-64 sm:w-72 sm:h-72 transform -rotate-90 drop-shadow-xl mb-6">
        <circle cx="50%" cy="50%" r="45%" fill="none" stroke={isActive ? "rgba(255,255,255,0.2)" : "#f1f2f6"} strokeWidth="16" />
        <circle cx="50%" cy="50%" r="45%" fill="none" stroke={mode === 'focus' ? '#78b159' : '#fdcb58'} strokeWidth="16" strokeDasharray={`calc(2 * 3.14159 * 45%)`} strokeDashoffset={`calc(2 * 3.14159 * 45% * (1 - ${calculateProgress() / 100}))`} strokeLinecap="round" className="transition-all duration-1000 ease-linear" />
      </svg>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full">
        <div className={`text-6xl sm:text-7xl font-black font-mono tracking-tighter ${isActive ? 'text-white drop-shadow-md' : 'text-nook-brown'}`}>{formatTime(timeLeft)}</div>
        <div className="font-bold mt-2 bg-white/50 px-4 py-1 rounded-full inline-block text-nook-light-brown backdrop-blur-sm">{mode === 'focus' ? 'Focus Session' : 'Break Time'}</div>
      </div>
      <div className="flex flex-col items-center gap-3 z-10 w-full max-w-xs h-24 justify-end">
        {isIntermission ? (
          <div className="flex flex-col w-full animate-pop-in bg-white/95 p-3 rounded-2xl shadow-xl border-2 border-nook-yellow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <p className="text-center text-nook-brown font-bold mb-2 text-sm">Session Complete! <br/><span className="text-xs text-nook-light-brown">Auto-break in {intermissionTimeLeft}s</span></p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => finishIntermission('extend')} variant="primary" icon={Zap} className="flex-1 text-xs py-2">Flow ({settings.flowDuration}m)</Button>
              <Button onClick={() => finishIntermission('break')} variant="secondary" icon={Coffee} className="flex-1 text-xs py-2">Start Break</Button>
            </div>
          </div>
        ) : (
          <Button onClick={isActive ? pauseTimer : startTimer} variant={isActive ? "secondary" : "primary"} icon={isActive ? Pause : Play} className="w-36 text-lg shadow-xl">{isActive ? 'Pause' : 'Start'}</Button>
        )}
      </div>
    </div>
  );
};
export default TimerDisplay;