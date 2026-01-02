// src/App.jsx
import React, { useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useSettings } from './hooks/useSettings';
import TimerDisplay from './components/Timer/TimerDisplay';
import GardenDisplay from './components/Garden/GardenDisplay'; // Import new component
import Button from './components/UI/Button';
import SettingsModal from './components/Settings/SettingsModal';

function App() {
  const settings = useSettings();
  const [showSettings, setShowSettings] = useState(false);
  
  // Example state for visualization (You can hook this up to real data later)
  // For now, let's assume a streak of 3 and a 'tree' stage to show off the animation
  const streak = 3; 
  const currentStage = 'tree'; // Options: 'seed', 'sprout', 'sapling', 'tree'

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-nook-bg text-nook-brown flex flex-col items-center justify-center select-none">
      <div className="absolute inset-0 bg-[radial-gradient(#78b159_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none"></div>
      
      <main className="relative z-10 w-full max-w-4xl p-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-auto md:h-[500px]">
        
        {/* Left Side: Timer */}
        <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] p-8 shadow-2xl border-4 border-white transition-all duration-500 h-full flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
             <h1 className="text-2xl font-black text-nook-green flex items-center gap-2">NookFocus</h1>
             <Button variant="ghost" onClick={() => setShowSettings(true)} icon={SettingsIcon} />
          </div>
          <TimerDisplay settings={settings} />
        </div>

        {/* Right Side: Garden (UPDATED) */}
        <div className="hidden md:block h-full bg-white/70 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl border-4 border-white opacity-90">
            <GardenDisplay streak={streak} stage={currentStage} />
        </div>

      </main>
      
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} settings={settings} />}
    </div>
  );
}
export default App;