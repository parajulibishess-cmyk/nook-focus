import React, { useState } from 'react';
import { useStats } from '../../context/StatsContext';
import { useSettings } from '../../context/SettingsContext';
import { useTasks } from '../../context/TaskContext';
import { X, BarChart2, Sprout, Zap, ThermometerSun, Layout, Flower2, Clock, Trophy, Target, PieChart, CheckCircle2, AlertTriangle, Award } from 'lucide-react';
import GardenDisplay from '../Garden/GardenDisplay';

const AnalyticsModal = ({ onClose }) => {
  const { stats } = useStats();
  const { dailyGoal } = useSettings();
  const { tasks } = useTasks();
  
  const [tab, setTab] = useState('dashboard');

  // --- HELPER FUNCTIONS ---
  const getTodayMinutes = () => {
      if (!stats.dailyHistory) return 0;
      const today = new Date().toISOString().split('T')[0];
      return stats.dailyHistory[today] || 0;
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

  const getDailyAverage = () => {
      if (!stats.installDate) return 0;
      const start = new Date(stats.installDate);
      const now = new Date();
      const diffTime = Math.abs(now - start);
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24))); 
      return Math.round(stats.minutes / diffDays);
  };

  const getEstimationAccuracy = () => {
      const completedWithEstimates = tasks.filter(t => t.completed && t.estimatedPomos > 0);
      if (completedWithEstimates.length === 0) return { val: 100, text: "No data", color: "#a4b0be" };
      
      let totalEst = 0, totalAct = 0;
      completedWithEstimates.forEach(t => { totalEst += t.estimatedPomos; totalAct += (t.completedPomos || 0); });
      
      if (totalAct === 0 && totalEst > 0) return { val: 0, text: "Needs focus", color: "#ff6b6b" };
      
      const ratio = (totalAct / totalEst); 
      const percentage = Math.round(ratio * 100);
      
      if (percentage > 120) return { val: percentage, text: `Underestimating (${percentage}%)`, color: "#ff6b6b" };
      if (percentage < 80) return { val: percentage, text: `Overestimating (${percentage}%)`, color: "#54a0ff" };
      return { val: percentage, text: "Spot on!", color: "#78b159" };
  };

  const getPriorityFocus = () => {
      const dist = stats.priorityDist || {};
      const high = (dist[4] || 0) + (dist[3] || 0); // P1 & P2
      const total = Object.values(dist).reduce((a,b) => a+b, 0);
      if (total === 0) return 0;
      return Math.round((high / total) * 100);
  };

  const getProcrastinationIndex = () => {
      const completedTasks = tasks.filter(t => t.completed && t.completedAt && t.id);
      if (completedTasks.length === 0) return "0h";
      
      let totalDiff = 0;
      completedTasks.forEach(t => { totalDiff += (t.completedAt - t.id); });
      
      const avgMs = totalDiff / completedTasks.length;
      const avgHours = Math.round(avgMs / (1000 * 60 * 60));
      if (avgHours > 24) return `${Math.round(avgHours/24)} days`;
      return `${avgHours} hours`;
  };

  const getCategoryChampion = () => {
      const cats = {};
      tasks.forEach(t => {
          if (!cats[t.category]) cats[t.category] = { total: 0, completed: 0 };
          cats[t.category].total++;
          if (t.completed) cats[t.category].completed++;
      });
      
      let champ = "None";
      let maxRate = -1;
      
      Object.entries(cats).forEach(([name, data]) => {
          if (data.total < 1) return;
          const rate = data.completed / data.total;
          if (rate > maxRate) { maxRate = rate; champ = name; }
      });
      return champ;
  };

  const estAcc = getEstimationAccuracy();
  const completionRate = tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0;
  const distMax = Math.max(...Object.values(stats.categoryDist || { "General": 0 }), 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-pop-in">
        <div className="bg-[#fcfcf7] rounded-[2.5rem] shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden border-8 border-white">
            
            {/* Header */}
            <div className="bg-[#78b159] p-6 flex justify-between items-center text-white shrink-0">
                <div>
                    <h2 className="text-3xl font-black">Your Dashboard</h2>
                    <p className="font-bold opacity-80">Productivity at a glance</p>
                </div>
                <button onClick={onClose} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
                    <X />
                </button>
            </div>
            
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-full md:w-64 bg-white border-r border-[#e6e2d0] p-4 flex flex-row md:flex-col gap-2 overflow-x-auto shrink-0">
                    <button onClick={() => setTab('dashboard')} className={`p-4 rounded-2xl font-bold text-left flex items-center gap-3 transition-colors ${tab === 'dashboard' ? 'bg-[#78b159] text-white' : 'text-[#8e8070] hover:bg-[#f1f2f6]'}`}>
                        <BarChart2 size={20}/> Overview
                    </button>
                    <button onClick={() => setTab('tasks')} className={`p-4 rounded-2xl font-bold text-left flex items-center gap-3 transition-colors ${tab === 'tasks' ? 'bg-[#54a0ff] text-white' : 'text-[#8e8070] hover:bg-[#f1f2f6]'}`}>
                        <CheckCircle2 size={20}/> Task Insights
                    </button>
                    <button onClick={() => setTab('garden')} className={`p-4 rounded-2xl font-bold text-left flex items-center gap-3 transition-colors ${tab === 'garden' ? 'bg-[#fdcb58] text-[#7d5a00]' : 'text-[#8e8070] hover:bg-[#f1f2f6]'}`}>
                        <Sprout size={20}/> Garden
                    </button>
                    
                    <div className="mt-auto hidden md:flex flex-col items-center pt-4 border-t border-[#e6e2d0] text-center w-full">
                         <h4 className="text-xs font-black text-[#a4b0be] uppercase tracking-wider mb-2">Current Streak</h4>
                         <div className="flex justify-center gap-1 text-[#ff6b6b] items-center">
                             <Flower2 size={24} fill="currentColor"/> 
                             <span className="text-2xl font-black">{stats.streak}</span>
                         </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative bg-[#fcfcf7]">
                    
                    {/* --- TAB: OVERVIEW (COMBINED) --- */}
                    {tab === 'dashboard' && (
                        <div className="space-y-6 animate-slide-up">
                            
                            {/* 1. New Consistency Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] shadow-sm relative overflow-hidden">
                                     <div className="absolute top-0 right-0 p-4 opacity-10"><Clock size={64} className="text-[#594a42]" /></div>
                                     <h3 className="font-bold text-[#594a42] text-sm">Total Focus Time</h3>
                                     <div className="text-3xl font-black text-[#594a42] my-2">
                                         {Math.floor(stats.minutes / 60)}<span className="text-lg text-[#a4b0be] ml-1">h</span> {stats.minutes % 60}<span className="text-lg text-[#a4b0be] ml-1">m</span>
                                     </div>
                                     <div className="text-xs font-bold text-[#a4b0be]">Daily Avg: {getDailyAverage()}m</div>
                                </div>
                                <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] shadow-sm relative overflow-hidden">
                                     <div className="absolute top-0 right-0 p-4 opacity-10"><Target size={64} className="text-[#78b159]" /></div>
                                     <h3 className="font-bold text-[#594a42] text-sm">Perfect Days</h3>
                                     <div className="text-3xl font-black text-[#78b159] my-2">{stats.perfectDays || 0}</div>
                                     <div className="text-xs font-bold text-[#a4b0be]">Goals met ({dailyGoal}m)</div>
                                </div>
                                <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] shadow-sm relative overflow-hidden">
                                     <div className="absolute top-0 right-0 p-4 opacity-10"><Trophy size={64} className="text-[#fdcb58]" /></div>
                                     <h3 className="font-bold text-[#594a42] text-sm">Best Streak</h3>
                                     <div className="text-3xl font-black text-[#fdcb58] my-2">{Math.max(stats.streak, stats.bestStreak || 0)}</div>
                                     <div className="text-xs font-bold text-[#a4b0be]">Consecutive days</div>
                                </div>
                            </div>

                            {/* 2. Original Stats (RESTORED) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] relative overflow-hidden shadow-sm">
                                    <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={64} className="text-[#fdcb58]" /></div>
                                    <h3 className="font-bold text-[#594a42]">Flow Score</h3>
                                    <div className="text-4xl font-black text-[#fdcb58] my-2">{getFlowScore()}%</div>
                                    <p className="text-xs text-[#a4b0be] font-bold">Consistency in extending sessions.</p>
                                </div>
                                <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] relative overflow-hidden shadow-sm">
                                    <div className="absolute top-0 right-0 p-4 opacity-10"><ThermometerSun size={64} className="text-[#ff6b6b]" /></div>
                                    <h3 className="font-bold text-[#594a42]">Golden Hour</h3>
                                    <div className="text-2xl font-black text-[#ff6b6b] my-2">{getGoldenHour() ? getGoldenHour().time : "Not enough data"}</div>
                                    <p className="text-xs text-[#a4b0be] font-bold">Your peak productivity time.</p>
                                </div>
                            </div>

                            {/* 3. Goals & Breaks (RESTORED) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] shadow-sm">
                                    <h3 className="font-bold text-[#594a42] mb-4 flex justify-between">
                                        <span>Daily Goal</span>
                                        <span className="text-[#a4b0be]">{getTodayMinutes()} / {dailyGoal}m</span>
                                    </h3>
                                    <div className="w-full bg-[#f1f2f6] rounded-full h-4 overflow-hidden">
                                        <div className="bg-[#78b159] h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((getTodayMinutes()/dailyGoal)*100, 100)}%` }}></div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] flex justify-between items-center shadow-sm">
                                    <div><h3 className="font-bold text-[#594a42]">Breaks Taken</h3><p className="text-xs text-[#a4b0be]">Keep fresh!</p></div>
                                    <div className="text-4xl font-black text-[#54a0ff]">{stats.breaksCompleted || 0}</div>
                                </div>
                            </div>

                            {/* 4. Session Breakdown (New) */}
                            <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] shadow-sm">
                                <h3 className="font-bold text-[#594a42] mb-4 flex items-center gap-2">
                                    <PieChart size={18} className="text-[#54a0ff]"/> Session Breakdown
                                </h3>
                                <div className="flex gap-4">
                                    {['focus', 'short', 'long'].map(type => (
                                        <div key={type} className="flex-1 bg-[#f1f2f6] rounded-2xl p-3 text-center">
                                            <div className="text-xs uppercase font-black text-[#a4b0be] mb-1">{type}</div>
                                            <div className="text-xl font-black text-[#594a42]">{stats.sessionCounts ? stats.sessionCounts[type] || 0 : 0}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* 5. Distribution (Original) */}
                            <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] shadow-sm">
                                <h3 className="font-bold text-[#594a42] mb-6 flex items-center gap-2">
                                    <Layout size={18} className="text-[#fdcb58]"/> Focus Distribution
                                </h3>
                                <div className="space-y-3">
                                    {Object.entries(stats.categoryDist || {}).map(([cat, mins]) => (
                                        <div key={cat} className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-[#594a42] w-20 truncate">{cat}</span>
                                            <div className="flex-1 h-3 bg-[#f1f2f6] rounded-full overflow-hidden">
                                                <div className="h-full bg-[#fdcb58] rounded-full" style={{ width: `${(mins / distMax) * 100}%` }}></div>
                                            </div>
                                            <span className="text-xs font-bold text-[#a4b0be] w-12 text-right">{mins}m</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: TASK INSIGHTS (NEW) --- */}
                    {tab === 'tasks' && (
                        <div className="space-y-6 animate-slide-up">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10"><Target size={64} className={estAcc.color.replace('text-', '')} /></div>
                                    <h3 className="font-bold text-[#594a42]">Estimation Accuracy</h3>
                                    <div className="flex items-baseline gap-2 my-2">
                                        <div className="text-4xl font-black" style={{ color: estAcc.color }}>{estAcc.val}%</div>
                                        <div className="text-sm font-bold text-[#a4b0be]">Actual vs Planned</div>
                                    </div>
                                    <p className="text-xs font-bold text-[#594a42] bg-[#f1f2f6] inline-block px-2 py-1 rounded-lg">{estAcc.text}</p>
                                </div>
                                <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10"><Clock size={64} className="text-[#ff6b6b]" /></div>
                                    <h3 className="font-bold text-[#594a42]">Procrastination Index</h3>
                                    <div className="text-4xl font-black text-[#ff6b6b] my-2">{getProcrastinationIndex()}</div>
                                    <p className="text-xs text-[#a4b0be] font-bold">Avg. time from creation to completion.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] shadow-sm flex flex-col items-center text-center">
                                    <div className="p-3 bg-[#eaf4ff] text-[#54a0ff] rounded-full mb-3"><CheckCircle2 size={24}/></div>
                                    <h3 className="font-bold text-[#594a42] text-sm mb-1">Completion Rate</h3>
                                    <div className="text-3xl font-black text-[#594a42]">{completionRate}%</div>
                                    <div className="w-full bg-[#f1f2f6] h-2 rounded-full mt-3 overflow-hidden">
                                        <div className="bg-[#54a0ff] h-full" style={{width: `${completionRate}%`}}></div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] shadow-sm flex flex-col items-center text-center">
                                    <div className="p-3 bg-[#fff0f0] text-[#ff6b6b] rounded-full mb-3"><AlertTriangle size={24}/></div>
                                    <h3 className="font-bold text-[#594a42] text-sm mb-1">High-Priority Focus</h3>
                                    <div className="text-3xl font-black text-[#ff6b6b]">{getPriorityFocus()}%</div>
                                    <p className="text-[10px] text-[#a4b0be] font-bold mt-1">Time spent on P1/P2 tasks</p>
                                </div>
                                <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] shadow-sm flex flex-col items-center text-center">
                                    <div className="p-3 bg-[#fff8e1] text-[#fdcb58] rounded-full mb-3"><Award size={24}/></div>
                                    <h3 className="font-bold text-[#594a42] text-sm mb-1">Category Champ</h3>
                                    <div className="text-xl font-black text-[#fdcb58] mt-1 break-all line-clamp-1">{getCategoryChampion()}</div>
                                    <p className="text-[10px] text-[#a4b0be] font-bold mt-1">Most completed tasks</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'garden' && (
                        <div className="h-full w-full rounded-3xl overflow-hidden animate-pop-in">
                            <GardenDisplay />
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};
export default AnalyticsModal;