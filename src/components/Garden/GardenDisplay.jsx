import React from 'react';
import { Sprout, Trees, Leaf, Flame, Flower, Wheat } from 'lucide-react';

const GardenDisplay = ({ streak = 0, stage = 'sprout' }) => {
  const getPlantIcon = () => {
    switch(stage) {
      case 'seed': return <div className="w-4 h-4 rounded-full bg-[#8e8070] animate-pop-in mt-8"></div>;
      case 'sprout': return <Sprout size={64} className="text-[#78b159] animate-grow drop-shadow-md" />;
      case 'sapling': return <Leaf size={80} className="text-[#78b159] animate-grow drop-shadow-md" />;
      case 'tree': return <Trees size={120} className="text-[#386641] animate-grow animate-sway drop-shadow-xl" />;
      default: return <Sprout size={64} className="text-[#78b159] animate-grow" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative overflow-hidden">
      <div className="absolute top-4 right-4 flex flex-col items-end">
         <div className="bg-white/80 backdrop-blur px-3 py-1 rounded-full shadow-sm border border-[#fdcb58] flex items-center gap-1.5 animate-slide-up hover:scale-105 transition-transform cursor-default">
            <Flame size={16} className={`text-[#fdcb58] ${streak > 0 ? 'fill-[#fdcb58] animate-bounce-soft' : ''}`} />
            <span className="font-bold text-[#594a42] text-sm">{streak} day streak</span>
         </div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
         <div className="h-40 flex items-end justify-center pb-2">
            {getPlantIcon()}
         </div>
         <div className="text-center mt-2 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <h3 className="font-black text-[#594a42] text-xl">Your Garden</h3>
            <p className="text-xs text-[#8e8070] font-bold">
               {stage === 'tree' ? "Fully Grown!" : "Focus to grow your tree"}
            </p>
         </div>
      </div>
      <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-[#e6e7dc] to-transparent z-0 opacity-50"></div>
    </div>
  );
};
export default GardenDisplay;