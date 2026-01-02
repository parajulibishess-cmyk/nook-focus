import React, { useState } from 'react';
import { X, BarChart2, Sprout, Zap, Clock, ThermometerSun, Layout, Flower2, TreeDeciduous, Wheat } from 'lucide-react';

const AnalyticsModal = ({ onClose, stats, seeds, dailyGoal }) => {
  const [tab, setTab] = useState('dashboard');

  const getTodayMinutes = () => {
      if (!stats.dailyHistory) return 0;
      return stats.dailyHistory[new Date().toISOString().split('T')[0]] || 0;
  };

  const getFlowScore = () => {
      const total = stats.sessions + (stats.flowExtensions || 0);
      return total === 0 ? 0 : Math.round(((stats.flowExtensions || 0) / total) * 100);
  };

  const getGoldenHour = () => {
      if (!stats.hourlyActivity || stats.hourlyActivity.every(h => h === 0)) return null;
      const maxVal = Math.max(...stats.hourlyActivity);
      const hour = stats.hourlyActivity.indexOf(maxVal);
      return { time: `${hour}:00 - ${(hour + 1) % 24}:00` };
  };

  const getWeekendVsWeekday = () => {
      let weekend = 0, weekday = 0;
      if (stats.dailyHistory) {
          Object.entries(stats.dailyHistory).forEach(([dateStr, mins]) => { 
              const d = new Date(dateStr).getDay(); 
              if(d === 0 || d === 6) weekend += mins; 
              else weekday += mins; 
          });
      }
      return { weekend, weekday };
  };

  const distMax = Math.max(...Object.values(stats.categoryDist || { "General": 0 }), 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-pop-in">
        <div className="bg-[#fcfcf7] rounded-[2.5rem] shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden border-8 border-white">
            <div className="bg-[#78b159] p-6 flex justify-between items-center text-white shrink-0">
                <div><h2 className="text-3xl font-black">Your Dashboard</h2><p className="font-bold opacity-80">Productivity at a glance</p></div>
                <button onClick={onClose} className="bg-white/20 p-2 rounded-full hover:bg-white/30"><X/></button>
            </div>
            
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                <div className="w-full md:w-64 bg-white border-r border-[#e6e2d0] p-4 flex flex-row md:flex-col gap-2 overflow-x-auto shrink-0">
                    <button onClick={() => setTab('dashboard')} className={`p-4 rounded-2xl font-bold text-left flex items-center gap-3 ${tab === 'dashboard' ? 'bg-[#78b159] text-white' : 'text-[#8e8070] hover:bg-[#f1f2f6]'}`}><BarChart2 size={20}/> Overview</button>
                    <button onClick={() => setTab('garden')} className={`p-4 rounded-2xl font-bold text-left flex items-center gap-3 ${tab === 'garden' ? 'bg-[#fdcb58] text-[#7d5a00]' : 'text-[#8e8070] hover:bg-[#f1f2f6]'}`}><Sprout size={20}/> Garden</button>
                    <div className="mt-auto hidden md:flex flex-col items-center pt-4 border-t border-[#e6e2d0] text-center w-full">
                         <h4 className="text-xs font-black text-[#a4b0be] uppercase tracking-wider mb-2">Streak</h4>
                         <div className="flex justify-center gap-1 text-[#ff6b6b] items-center"><Flower2 size={24} fill="currentColor"/> <span className="text-2xl font-black">{stats.streak}</span></div>
                    </div>
                </div>

                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                    {tab === 'dashboard' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] relative overflow-hidden"><div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={64} className="text-[#fdcb58]" /></div><h3 className="font-bold text-[#594a42]">Flow Score</h3><div className="text-4xl font-black text-[#fdcb58] my-2">{getFlowScore()}%</div><p className="text-xs text-[#a4b0be] font-bold">Consistency in extending sessions.</p></div>
                                <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] relative overflow-hidden"><div className="absolute top-0 right-0 p-4 opacity-10"><ThermometerSun size={64} className="text-[#ff6b6b]" /></div><h3 className="font-bold text-[#594a42]">Golden Hour</h3><div className="text-2xl font-black text-[#ff6b6b] my-2">{getGoldenHour() ? getGoldenHour().time : "Not enough data"}</div><p className="text-xs text-[#a4b0be] font-bold">Your peak productivity time.</p></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6]"><h3 className="font-bold text-[#594a42] mb-4 flex justify-between"><span>Daily Goal</span><span className="text-[#a4b0be]">{getTodayMinutes()} / {dailyGoal}m</span></h3><div className="w-full bg-[#f1f2f6] rounded-full h-4 overflow-hidden"><div className="bg-[#78b159] h-full rounded-full" style={{ width: `${Math.min((getTodayMinutes()/dailyGoal)*100, 100)}%` }}></div></div></div>
                                <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] flex justify-between items-center"><div><h3 className="font-bold text-[#594a42]">Breaks Taken</h3><p className="text-xs text-[#a4b0be]">Keep fresh!</p></div><div className="text-4xl font-black text-[#54a0ff]">{stats.breaksCompleted || 0}</div></div>
                            </div>
                            <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6]"><h3 className="font-bold text-[#594a42] mb-6 flex items-center gap-2"><Layout size={18} className="text-[#fdcb58]"/> Focus Distribution</h3>
                                <div className="space-y-3">
                                    {Object.entries(stats.categoryDist).map(([cat, mins]) => (
                                        <div key={cat} className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-[#594a42] w-20">{cat}</span>
                                            <div className="flex-1 h-3 bg-[#f1f2f6] rounded-full overflow-hidden"><div className="h-full bg-[#fdcb58]" style={{ width: `${(mins / distMax) * 100}%` }}></div></div>
                                            <span className="text-xs font-bold text-[#a4b0be] w-12 text-right">{mins}m</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    {tab === 'garden' && (
                        <div className="h-full flex flex-col">
                            <div className="mb-6 flex justify-between items-end"><div><h3 className="font-bold text-[#594a42] text-xl">Your Garden</h3><p className="text-[#8e8070] text-xs font-bold">Every session plants a seed.</p></div><span className="bg-[#f1f2f6] px-3 py-1 rounded-full text-xs font-bold text-[#8e8070] border border-[#e6e2d0]">Total Flora: {seeds}</span></div>
                            <div className={`flex-1 bg-[#fffdf5] rounded-3xl p-6 border-4 border-[#e6e2d0] relative overflow-y-auto custom-scrollbar shadow-inner ${stats.streak === 0 ? 'grayscale bg-[#e0dfd5]' : ''}`}>
                                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 pb-12">
                                    {[...Array(seeds)].map((_, i) => { 
                                        let Icon = Sprout; 
                                        let color = "text-[#78b159]"; 
                                        if (i > 20) { Icon = TreeDeciduous; color = "text-[#386641]"; } 
                                        else if (i > 10) { Icon = Flower2; color = "text-[#ff6b6b]"; } 
                                        else if (i > 5) { Icon = Wheat; color = "text-[#fdcb58]"; } 
                                        return <div key={i} className="flex flex-col items-center animate-pop-in hover:scale-110 transition-transform"><div className="p-3 rounded-full bg-white shadow-sm border border-[#f1f2f6]"><Icon size={24} className={color} fill="currentColor"/></div><div className="w-8 h-1 bg-[#e6e2d0] rounded-full mt-1 opacity-50"></div></div> 
                                    })}
                                </div>
                                {seeds === 0 && <div className="absolute inset-0 flex flex-col items-center justify-center text-[#a4b0be] opacity-60"><Sprout size={64} className="mb-4"/><p className="font-bold">Your garden is empty.</p></div>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};
export default AnalyticsModal;