import React from 'react';
import { BarChart2, CheckCircle2, TrendingUp, Sprout, Flower2 } from 'lucide-react';

const AnalyticsSidebar = ({ tab, setTab, streak }) => {
    return (
        <div className="w-full md:w-64 bg-white border-r border-[#e6e2d0] p-4 flex flex-row md:flex-col gap-2 overflow-x-auto shrink-0">
            <button onClick={() => setTab('dashboard')} className={`p-4 rounded-2xl font-bold text-left flex items-center gap-3 transition-colors ${tab === 'dashboard' ? 'bg-[#78b159] text-white' : 'text-[#8e8070] hover:bg-[#f1f2f6]'}`}>
                <BarChart2 size={20}/> Overview
            </button>
            <button onClick={() => setTab('tasks')} className={`p-4 rounded-2xl font-bold text-left flex items-center gap-3 transition-colors ${tab === 'tasks' ? 'bg-[#54a0ff] text-white' : 'text-[#8e8070] hover:bg-[#f1f2f6]'}`}>
                <CheckCircle2 size={20}/> Task Insights
            </button>
            <button onClick={() => setTab('trends')} className={`p-4 rounded-2xl font-bold text-left flex items-center gap-3 transition-colors ${tab === 'trends' ? 'bg-[#ff6b6b] text-white' : 'text-[#8e8070] hover:bg-[#f1f2f6]'}`}>
                <TrendingUp size={20}/> Deep Trends
            </button>
            <button onClick={() => setTab('garden')} className={`p-4 rounded-2xl font-bold text-left flex items-center gap-3 transition-colors ${tab === 'garden' ? 'bg-[#fdcb58] text-[#7d5a00]' : 'text-[#8e8070] hover:bg-[#f1f2f6]'}`}>
                <Sprout size={20}/> Garden
            </button>
            
            <div className="mt-auto hidden md:flex flex-col items-center pt-4 border-t border-[#e6e2d0] text-center w-full">
                 <h4 className="text-xs font-black text-[#a4b0be] uppercase tracking-wider mb-2">Current Streak</h4>
                 <div className="flex justify-center gap-1 text-[#ff6b6b] items-center">
                     <Flower2 size={24} fill="currentColor"/> 
                     <span className="text-2xl font-black">{streak}</span>
                 </div>
            </div>
        </div>
    );
};

export default AnalyticsSidebar;