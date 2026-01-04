import React, { useState, useMemo } from 'react';
import { useStats } from '../../context/StatsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { History, X } from 'lucide-react';
import Button from '../UI/Button';

// --- STYLES & ASSETS (User Provided Art) ---

const Styles = () => (
  <style>{`
    .animate-pulse-glow { animation: pulse-glow 3s infinite ease-in-out; }
    .animate-ping-slow { animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite; }
    .animate-scale-x { animation: scale-x 4s ease-in-out infinite alternate; }
    .animate-sway-slow { animation: sway 4s ease-in-out infinite alternate; }
    .animate-sway-medium { animation: sway 3s ease-in-out infinite alternate; }
    .animate-sway-stiff { animation: sway-stiff 5s ease-in-out infinite alternate; }
    .animate-leaf-flutter-left { animation: flutter-left 3s ease-in-out infinite alternate; }
    .animate-leaf-flutter-right { animation: flutter-right 3s ease-in-out infinite alternate; }
    .animate-breathe-slow { animation: breathe 4s ease-in-out infinite; }
    .animate-canopy-sway { animation: canopy-bob 6s ease-in-out infinite alternate; }
    .animate-leaf-cluster-1 { animation: cluster-move 5s ease-in-out infinite alternate; }
    .animate-leaf-cluster-2 { animation: cluster-move 5s ease-in-out infinite alternate-reverse; }
    .animate-leaf-cluster-3 { animation: breathe 4s ease-in-out infinite; }

    @keyframes pulse-glow {
      0%, 100% { opacity: 0.8; transform: scale(0.95); }
      50% { opacity: 1; transform: scale(1.05); filter: drop-shadow(0 0 2px rgba(139, 195, 74, 0.5)); }
    }
    @keyframes ping {
      75%, 100% { transform: scale(2); opacity: 0; }
    }
    @keyframes scale-x {
      0%, 100% { transform: scaleX(0.95); }
      50% { transform: scaleX(1.05); }
    }
    @keyframes sway { 0% { transform: rotate(-3deg); } 100% { transform: rotate(3deg); } }
    @keyframes sway-stiff { 0% { transform: rotate(-1deg); } 100% { transform: rotate(1deg); } }
    @keyframes flutter-left { 0% { transform: rotate(-5deg); } 100% { transform: rotate(2deg); } }
    @keyframes flutter-right { 0% { transform: rotate(5deg); } 100% { transform: rotate(-2deg); } }
    @keyframes breathe { 0% { transform: scale(1); } 50% { transform: scale(1.03); } 100% { transform: scale(1); } }
    @keyframes canopy-bob { 0% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-2px) rotate(1deg); } 100% { transform: translateY(0px) rotate(-1deg); } }
    @keyframes cluster-move { 0% { transform: translate(0, 0); } 100% { transform: translate(1px, -1px); } }
  `}</style>
);

const PlantSeed = ({ className }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="soilGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#8D6E63" />
        <stop offset="100%" stopColor="#5D4037" />
      </linearGradient>
    </defs>
    <ellipse cx="100" cy="175" rx="50" ry="8" fill="#3E2723" opacity="0.2" />
    <path d="M70 170 Q100 150 130 170" stroke="url(#soilGrad)" strokeWidth="0" fill="url(#soilGrad)" />
    <path d="M60 175 C60 175 80 155 100 155 C120 155 140 175 140 175" fill="url(#soilGrad)" />
    <g className="animate-pulse-glow origin-center" style={{ transformBox: 'fill-box' }}>
      <path d="M98 158 Q100 150 102 158" stroke="#8BC34A" strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="158" r="3" fill="#8BC34A" className="animate-ping-slow" opacity="0.5" />
    </g>
  </svg>
);

const PlantSprout = ({ className }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sproutStem" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#AED581" />
        <stop offset="100%" stopColor="#7CB342" />
      </linearGradient>
      <linearGradient id="sproutLeafLight" x1="0" y1="0" x2="0" y2="1">
         <stop offset="0%" stopColor="#DCEDC8" />
         <stop offset="100%" stopColor="#8BC34A" />
      </linearGradient>
       <linearGradient id="sproutLeafDark" x1="0" y1="0" x2="0" y2="1">
         <stop offset="0%" stopColor="#C5E1A5" />
         <stop offset="100%" stopColor="#7CB342" />
      </linearGradient>
    </defs>
    <ellipse cx="100" cy="175" rx="40" ry="6" fill="#3E2723" opacity="0.2" className="animate-scale-x" />
    <g className="animate-sway-slow origin-bottom" style={{ transformOrigin: '100px 175px' }}>
      <path d="M100 175 Q100 155 100 135" stroke="url(#sproutStem)" strokeWidth="6" strokeLinecap="round" />
      <g className="animate-leaf-flutter-left" style={{ transformOrigin: '100px 135px' }}>
        <path d="M100 135 Q80 125 75 140 Q85 150 100 135" fill="url(#sproutLeafLight)" />
        <path d="M100 135 Q80 125 75 140" stroke="#689F38" strokeWidth="1" opacity="0.3" fill="none"/>
      </g>
      <g className="animate-leaf-flutter-right" style={{ transformOrigin: '100px 135px' }}>
        <path d="M100 135 Q120 115 135 125 Q125 140 100 135" fill="url(#sproutLeafDark)" />
        <path d="M100 137 Q120 115 135 125" stroke="#689F38" strokeWidth="1" opacity="0.3" fill="none"/>
      </g>
    </g>
  </svg>
);

const PlantSapling = ({ className }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="saplingWood" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#8D6E63" />
        <stop offset="100%" stopColor="#6D4C41" />
      </linearGradient>
      <radialGradient id="saplingFoliage" cx="0.3" cy="0.3" r="0.7">
        <stop offset="0%" stopColor="#A5D6A7" />
        <stop offset="100%" stopColor="#4CAF50" />
      </radialGradient>
    </defs>
    <ellipse cx="100" cy="175" rx="45" ry="7" fill="#3E2723" opacity="0.2" className="animate-scale-x" />
    <g className="animate-sway-medium origin-bottom" style={{ transformOrigin: '100px 170px' }}>
      <path d="M100 170 C100 170 105 150 100 110" stroke="url(#saplingWood)" strokeWidth="5" strokeLinecap="round" />
      <path d="M100 130 Q110 120 120 125" stroke="url(#saplingWood)" strokeWidth="3" strokeLinecap="round" />
      <g className="animate-breathe-slow origin-center" style={{ transformBox: 'fill-box' }}>
        <circle cx="100" cy="110" r="20" fill="url(#saplingFoliage)" />
        <circle cx="85" cy="115" r="15" fill="#66BB6A" className="animate-leaf-flutter-left" style={{ transformOrigin: '100px 110px' }}/>
        <circle cx="115" cy="115" r="15" fill="#81C784" className="animate-leaf-flutter-right" style={{ transformOrigin: '100px 110px' }}/>
        <circle cx="120" cy="125" r="8" fill="#A5D6A7" />
        <circle cx="100" cy="95" r="12" fill="#A5D6A7" />
      </g>
    </g>
  </svg>
);

const PlantTree = ({ className }) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="trunkGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#795548" />
        <stop offset="40%" stopColor="#8D6E63" />
        <stop offset="100%" stopColor="#5D4037" />
      </linearGradient>
      <radialGradient id="canopyLight" cx="0.3" cy="0.3" r="0.8">
        <stop offset="0%" stopColor="#81C784" />
        <stop offset="100%" stopColor="#388E3C" />
      </radialGradient>
      <radialGradient id="canopyDark" cx="0.5" cy="0.1" r="0.8">
        <stop offset="0%" stopColor="#66BB6A" />
        <stop offset="100%" stopColor="#2E7D32" />
      </radialGradient>
    </defs>
    <ellipse cx="100" cy="175" rx="60" ry="10" fill="#1B5E20" opacity="0.2" className="animate-scale-x" />
    <g className="animate-sway-stiff origin-bottom" style={{ transformOrigin: '100px 175px' }}>
      <path d="M95 175 L98 100 L102 100 L105 175 Q100 180 95 175 Z" fill="url(#trunkGrad)" />
      <path d="M98 130 Q85 110 75 115" stroke="url(#trunkGrad)" strokeWidth="4" strokeLinecap="round" />
      <path d="M102 120 Q120 100 130 105" stroke="url(#trunkGrad)" strokeWidth="4" strokeLinecap="round" />
      <g className="animate-canopy-sway origin-top" style={{ transformOrigin: '100px 100px' }}>
        <circle cx="70" cy="100" r="30" fill="url(#canopyDark)" className="animate-leaf-cluster-1" style={{transformBox: 'fill-box', transformOrigin: 'center'}} />
        <circle cx="130" cy="100" r="30" fill="url(#canopyDark)" className="animate-leaf-cluster-2" style={{transformBox: 'fill-box', transformOrigin: 'center'}} />
        <circle cx="100" cy="70" r="35" fill="url(#canopyLight)" className="animate-leaf-cluster-3" style={{transformBox: 'fill-box', transformOrigin: 'center'}} />
        <circle cx="85" cy="95" r="32" fill="url(#canopyLight)" />
        <circle cx="115" cy="95" r="32" fill="url(#canopyLight)" />
        <circle cx="100" cy="100" r="30" fill="#4CAF50" />
        <ellipse cx="100" cy="60" rx="15" ry="8" fill="#C8E6C9" opacity="0.3" />
      </g>
    </g>
  </svg>
);

// --- MAIN COMPONENT ---

const GardenDisplay = () => {
  const { stats } = useStats();
  const [showHistory, setShowHistory] = useState(false);

  // LOGIC: Calculate Harvested Trees and Current Stage from Daily History
  const { harvestedTrees, currentStage, currentStreakCount } = useMemo(() => {
    // Safety check for stats
    const historyEntries = Object.entries(stats?.dailyHistory || {})
        .sort((a, b) => new Date(a[0]) - new Date(b[0])); // Sort by date ascending

    let streak = 0;
    const harvested = [];
    
    const GROWTH_THRESHOLD = 60; // 60 minutes needed to grow
    const CYCLE_LENGTH = 4; // Seed (0) -> Sprout (1) -> Sapling (2) -> Tree (3)

    // Helper: Check if dates are roughly consecutive (allow small gaps if needed, but strict for now)
    const isConsecutive = (prevDateStr, currDateStr) => {
        const prev = new Date(prevDateStr);
        const curr = new Date(currDateStr);
        const diffTime = Math.abs(curr - prev);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        return diffDays <= 2; // Allow 1 missed day to keep streak alive? Or strictly 1. Let's say <= 2 for forgiveness.
    };

    for (let i = 0; i < historyEntries.length; i++) {
        const [date, minutes] = historyEntries[i];
        
        if (minutes >= GROWTH_THRESHOLD) {
            let consecutive = false;
            if (i > 0) {
                 const prevDate = historyEntries[i-1][0];
                 consecutive = isConsecutive(prevDate, date);
            }
            
            if (i === 0 || consecutive) {
                streak++;
            } else {
                streak = 1; // Reset streak if gap is too large
            }

            // Harvest Logic: If we hit a multiple of 4 (Cycle Complete)
            if (streak > 0 && streak % CYCLE_LENGTH === 0) {
                harvested.push({ date: date, id: harvested.length });
            }
        }
        // If minutes < 60, we just ignore this day (don't break streak, just don't grow)
        // OR reset streak? "Grow everyday AS LONG AS you have met..." implies streak breaks.
        // For now, let's just count qualifying days.
    }

    // Current Stage is modulo of current running streak
    // If streak is 0, stage is 0 (Seed)
    // If streak is 1, stage is 1 (Sprout)
    // If streak is 2, stage is 2 (Sapling)
    // If streak is 3, stage is 3 (Tree - Ready to Harvest next tick)
    const stage = streak % CYCLE_LENGTH;

    return { 
        harvestedTrees: harvested.reverse(), 
        currentStage: stage, 
        currentStreakCount: streak 
    };
  }, [stats]);

  const renderPlant = () => {
      const props = { className: "w-64 h-64 sm:w-80 sm:h-80 drop-shadow-2xl" };
      switch (currentStage) {
          case 0: return <PlantSeed {...props} />;
          case 1: return <PlantSprout {...props} />;
          case 2: return <PlantSapling {...props} />;
          case 3: return <PlantTree {...props} />;
          default: return <PlantSeed {...props} />;
      }
  };

  const getStageName = () => {
      switch (currentStage) {
          case 0: return "Seed Stage";
          case 1: return "Sprout Stage";
          case 2: return "Sapling Stage";
          case 3: return "Mature Tree";
          default: return "Seed";
      }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between relative overflow-hidden bg-[#fcfcf7]">
      <Styles />

      {/* --- HISTORY MODAL --- */}
      <AnimatePresence>
        {showHistory && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-4 z-50 bg-white/90 backdrop-blur-xl rounded-[2rem] border-4 border-[#e6e2d0] flex flex-col shadow-2xl overflow-hidden"
            >
                <div className="p-6 border-b-2 border-[#e6e2d0] flex justify-between items-center bg-[#fffdf5]">
                    <div>
                        <h3 className="font-black text-2xl text-[#594a42]">Garden History</h3>
                        <p className="text-xs text-[#8e8070] font-bold uppercase tracking-wider">Harvested Trees</p>
                    </div>
                    <button onClick={() => setShowHistory(false)} className="p-2 bg-[#e6e2d0] rounded-full hover:bg-[#d4d0be] transition-colors"><X size={20} className="text-[#594a42]" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {harvestedTrees.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-[#8e8070] opacity-50">
                            <History size={48} className="mb-2" />
                            <p className="font-bold">No trees harvested yet.</p>
                            <p className="text-sm">Maintain a 4-day streak (60m/day) to grow one!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {harvestedTrees.map((tree) => (
                                <div key={tree.id} className="flex items-center gap-4 bg-[#fcfcf7] p-4 rounded-2xl border-2 border-[#f0f0e8]">
                                    <div className="w-12 h-12 bg-[#78b159]/20 rounded-full flex items-center justify-center text-2xl">🌲</div>
                                    <div>
                                        <p className="font-black text-[#594a42] text-lg">Fully Grown</p>
                                        <p className="text-xs font-bold text-[#8e8070]">Harvested on {tree.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- HEADER --- */}
      <div className="w-full p-6 flex justify-between items-start z-10 relative">
         <div>
            <h2 className="text-3xl font-black text-[#594a42] tracking-tight">Focus Garden</h2>
            <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${currentStage === 3 ? 'bg-[#fdcb58] text-[#594a42]' : 'bg-[#e6e2d0] text-[#8e8070]'}`}>
                   Day {(currentStreakCount % 4) + 1} of 4 Cycle
                </span>
                {/* Debug Info to ensure file updated */}
                {/* <span className="text-[10px] text-gray-300">v3.0</span> */}
            </div>
         </div>
         <Button onClick={() => setShowHistory(true)} variant="neutral" icon={History} className="bg-white shadow-sm border border-[#e6e2d0] text-[#8e8070]">
            History
         </Button>
      </div>

      {/* --- CENTER PLANT --- */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative -mt-10">
          {/* Background Aura */}
          <div className="absolute w-96 h-96 bg-[#fdcb58] rounded-full filter blur-[80px] opacity-20 animate-pulse-slow"></div>
          
          <motion.div
             key={currentStage}
             initial={{ scale: 0.8, opacity: 0, y: 20 }}
             animate={{ scale: 1, opacity: 1, y: 0 }}
             transition={{ type: "spring", stiffness: 100, damping: 20 }}
             className="relative z-10"
          >
             {renderPlant()}
          </motion.div>

          <div className="mt-8 text-center z-10">
              <h3 className="text-2xl font-black text-[#594a42] drop-shadow-sm">{getStageName()}</h3>
              <p className="text-[#8e8070] font-bold text-sm max-w-[200px] mx-auto leading-tight mt-1">
                  {currentStage === 3 
                    ? "Fully grown! Complete tomorrow's session to harvest." 
                    : "Hit 60 mins daily to evolve your plant."}
              </p>
          </div>
      </div>

      {/* --- BOTTOM DECORATION --- */}
      <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-[#fcfcf7] to-transparent z-0"></div>
    </div>
  );
};

export default GardenDisplay;