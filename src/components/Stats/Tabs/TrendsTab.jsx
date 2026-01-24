import React from 'react';
import { AlertTriangle, Calendar } from 'lucide-react';

const TrendsTab = ({ stats, calculations }) => {
    const { 
        flowDepth, 
        abandonmentRate, 
        nightOwlScore, 
        weekSplit, 
        monthlyVelocity 
    } = calculations;

    return (
        <div className="space-y-6 animate-slide-up">
            
            {/* 1. Behavioral Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] shadow-sm relative overflow-hidden">
                    <h3 className="font-bold text-[#594a42] text-sm">Flow Depth</h3>
                    <div className="text-3xl font-black text-[#54a0ff] my-2">{flowDepth}</div>
                    <div className="text-xs font-bold text-[#a4b0be]">Avg pauses / session</div>
                    <div className="mt-2 text-[10px] text-[#8e8070] bg-[#f1f2f6] p-2 rounded-xl">
                        {flowDepth < 1 ? "Deep Focus Master!" : "Try to minimize interruptions."}
                    </div>
                </div>
                <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] shadow-sm relative overflow-hidden">
                    <h3 className="font-bold text-[#594a42] text-sm">Abandonment Rate</h3>
                    <div className="text-3xl font-black text-[#ff6b6b] my-2">{abandonmentRate}%</div>
                    <div className="text-xs font-bold text-[#a4b0be]">Sessions stopped early</div>
                </div>
                <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] shadow-sm relative overflow-hidden">
                    <h3 className="font-bold text-[#594a42] text-sm">Night Owl Score</h3>
                    <div className="text-3xl font-black text-[#6c5ce7] my-2">{nightOwlScore}%</div>
                    <div className="text-xs font-bold text-[#a4b0be]">Activity after 10 PM</div>
                </div>
            </div>

            {/* 2. Interruption Pattern & Week Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Interruption Pattern */}
                <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] shadow-sm">
                    <h3 className="font-bold text-[#594a42] mb-4 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-[#fdcb58]"/> Interruption Pattern
                    </h3>
                    <div className="flex items-end gap-2 h-32">
                        {Object.entries(stats.pauseDist || { "0-25": 0 }).map(([key, val]) => {
                            const max = Math.max(...Object.values(stats.pauseDist || {a:1}), 1);
                            return (
                                <div key={key} className="flex-1 flex flex-col items-center justify-end h-full">
                                    <div className="w-full bg-[#fdcb58] rounded-t-lg transition-all" style={{ height: `${(val/max)*100}%`, minHeight: '4px' }}></div>
                                    <span className="text-[10px] font-bold text-[#a4b0be] mt-2">{key}%</span>
                                </div>
                            )
                        })}
                    </div>
                    <p className="text-xs text-[#a4b0be] text-center mt-2 font-bold">When you usually pause during a session.</p>
                </div>

                {/* Weekday vs Weekend */}
                <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] shadow-sm">
                    <h3 className="font-bold text-[#594a42] mb-4 flex items-center gap-2">
                        <Calendar size={18} className="text-[#54a0ff]"/> Work Week Balance
                    </h3>
                    <div className="flex h-12 rounded-full overflow-hidden mb-4">
                        <div className="bg-[#54a0ff] h-full flex items-center justify-center text-white font-bold text-xs" style={{ width: `${weekSplit.wd}%` }}>
                            {weekSplit.wd > 10 && `Weekdays ${weekSplit.wd}%`}
                        </div>
                        <div className="bg-[#ff9f43] h-full flex items-center justify-center text-white font-bold text-xs" style={{ width: `${weekSplit.we}%` }}>
                            {weekSplit.we > 10 && `Weekend ${weekSplit.we}%`}
                        </div>
                    </div>
                    <p className="text-xs text-[#a4b0be] font-bold text-center">
                        {weekSplit.we > 30 ? "You're a weekend warrior!" : "You keep your weekends mostly free."}
                    </p>
                </div>
            </div>

            {/* 3. Weekly Heatmap (7x24) */}
            <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] shadow-sm">
                <h3 className="font-bold text-[#594a42] mb-4">Weekly Focus Heatmap</h3>
                <div className="grid grid-cols-[auto_1fr] gap-2">
                    <div className="flex flex-col justify-between text-[10px] font-bold text-[#a4b0be] py-1">
                        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="h-4 leading-4">{d}</div>)}
                    </div>
                    <div className="grid grid-rows-7 gap-1">
                        {stats.weeklyHourly && stats.weeklyHourly.map((row, i) => (
                            <div key={i} className="grid grid-cols-24 gap-[2px] h-4">
                                {row.map((mins, h) => {
                                    const intensity = Math.min(mins / 30, 1); // Cap at 30 mins for max color
                                    return (
                                        <div key={h} 
                                            title={`${mins}m`}
                                            className="rounded-sm"
                                            style={{ 
                                                backgroundColor: `rgba(120, 177, 89, ${intensity})`,
                                                opacity: intensity === 0 ? 0.1 : 1
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-[#a4b0be] ml-8 mt-1">
                    <span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>11 PM</span>
                </div>
            </div>

            {/* 4. Monthly Velocity */}
            <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] shadow-sm">
                <h3 className="font-bold text-[#594a42] mb-4">Monthly Velocity (Hours)</h3>
                <div className="flex items-end gap-4 h-32">
                    {monthlyVelocity.map(([month, hours]) => (
                        <div key={month} className="flex-1 flex flex-col items-center justify-end h-full group">
                            <div className="text-xs font-bold text-[#594a42] mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{hours}h</div>
                            <div className="w-full bg-[#594a42] rounded-t-lg opacity-80 group-hover:opacity-100 transition-all" style={{ height: `${Math.min(hours*2, 100)}%`, minHeight: '4px' }}></div>
                            <span className="text-[10px] font-bold text-[#a4b0be] mt-2 whitespace-nowrap">{month}</span>
                        </div>
                    ))}
                    {monthlyVelocity.length === 0 && <div className="text-[#a4b0be] text-sm w-full text-center">No monthly data yet.</div>}
                </div>
            </div>
        </div>
    );
};

export default TrendsTab;