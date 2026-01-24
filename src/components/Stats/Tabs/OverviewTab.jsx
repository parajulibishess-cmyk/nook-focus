import React from 'react';
import { Clock, Target, Trophy, Zap, ThermometerSun, PieChart, Layout } from 'lucide-react';

const OverviewTab = ({ stats, calculations, dailyGoal }) => {
    const { 
        todayMinutes, 
        dailyAverage, 
        flowScore, 
        goldenHour, 
        distMax 
    } = calculations;

    return (
        <div className="space-y-6 animate-slide-up">
            {/* 1. Consistency Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] shadow-sm relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-10"><Clock size={64} className="text-[#594a42]" /></div>
                     <h3 className="font-bold text-[#594a42] text-sm">Total Focus Time</h3>
                     <div className="text-3xl font-black text-[#594a42] my-2">
                         {Math.floor(stats.minutes / 60)}<span className="text-lg text-[#a4b0be] ml-1">h</span> {stats.minutes % 60}<span className="text-lg text-[#a4b0be] ml-1">m</span>
                     </div>
                     <div className="text-xs font-bold text-[#a4b0be]">Daily Avg: {dailyAverage}m</div>
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

            {/* 2. Original Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={64} className="text-[#fdcb58]" /></div>
                    <h3 className="font-bold text-[#594a42]">Focus Consistency</h3>
                    <div className="text-4xl font-black text-[#fdcb58] my-2">{flowScore}%</div>
                    <p className="text-xs text-[#a4b0be] font-bold">Sessions completed without quitting.</p>
                </div>
                <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><ThermometerSun size={64} className="text-[#ff6b6b]" /></div>
                    <h3 className="font-bold text-[#594a42]">Golden Hour</h3>
                    <div className="text-2xl font-black text-[#ff6b6b] my-2">{goldenHour ? goldenHour.time : "Not enough data"}</div>
                    <p className="text-xs text-[#a4b0be] font-bold">Your peak productivity time.</p>
                </div>
            </div>

            {/* 3. Goals & Breaks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] shadow-sm">
                    <h3 className="font-bold text-[#594a42] mb-4 flex justify-between">
                        <span>Daily Goal</span>
                        <span className="text-[#a4b0be]">{todayMinutes} / {dailyGoal}m</span>
                    </h3>
                    <div className="w-full bg-[#f1f2f6] rounded-full h-4 overflow-hidden">
                        <div className="bg-[#78b159] h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((todayMinutes/dailyGoal)*100, 100)}%` }}></div>
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] flex justify-between items-center shadow-sm">
                    <div><h3 className="font-bold text-[#594a42]">Breaks Taken</h3><p className="text-xs text-[#a4b0be]">Keep fresh!</p></div>
                    <div className="text-4xl font-black text-[#54a0ff]">{stats.breaksCompleted || 0}</div>
                </div>
            </div>

            {/* 4. Session Breakdown */}
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
            
            {/* 5. Distribution */}
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
    );
};

export default OverviewTab;