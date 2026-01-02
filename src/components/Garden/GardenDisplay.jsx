import React from 'react';
import { Sprout, TreePine, Leaf, Flame } from 'lucide-react';

const GardenDisplay = ({ streak = 0, stage = 'sprout' }) => {
  // Simple logic to determine stage based on streak if not passed explicitly
  // stage can be: 'seed', 'sprout', 'sapling', 'tree'
  
  const getPlantIcon = () => {
    switch(stage) {
      case 'seed': 
        return <div className="w-4 h-4 rounded-full bg-nook-light-brown animate-pop-in mt-8"></div>;
      case 'sprout': 
        return <Sprout size={64} className="text-nook-green animate-grow drop-shadow-md" />;
      case 'sapling':
        return <Leaf size={80} className="text-nook-green animate-grow drop-shadow-md" />;
      case 'tree':
        return <TreePine size={120} className="text-nook-dark-green animate-grow animate-sway drop-shadow-xl" />;
      default: 
        return <Sprout size={64} className="text-nook-green animate-grow" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative overflow-hidden">
      
      {/* Streak Badge with "Pop" and "Shine" animation */}
      <div className="absolute top-4 right-4 flex flex-col items-end">
         <div className="bg-white/80 backdrop-blur px-3 py-1 rounded-full shadow-sm border border-nook-yellow flex items-center gap-1.5 animate-slide-up hover:scale-105 transition-transform cursor-default">
            <Flame size={16} className={`text-nook-yellow ${streak > 0 ? 'fill-nook-yellow animate-bounce-soft' : ''}`} />
            <span className="font-bold text-nook-brown text-sm">{streak} day streak</span>
         </div>
      </div>

      {/* The Garden Stage */}
      <div className="relative z-10 flex flex-col items-center">
         <div className="h-40 flex items-end justify-center pb-2">
            {getPlantIcon()}
         </div>
         <div className="text-center mt-2 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <h3 className="font-black text-nook-brown text-xl">Your Garden</h3>
            <p className="text-xs text-nook-light-brown font-bold">
               {stage === 'tree' ? "Fully Grown!" : "Focus to grow your tree"}
            </p>
         </div>
      </div>

      {/* Decorative Ground - Slides up */}
      <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-[#e6e7dc] to-transparent z-0 opacity-50"></div>
    </div>
  );
};

export default GardenDisplay;