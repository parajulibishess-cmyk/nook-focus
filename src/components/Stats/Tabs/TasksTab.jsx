import React from 'react';
import { Target, Clock, CheckCircle2, AlertTriangle, Award } from 'lucide-react';

const TasksTab = ({ calculations }) => {
    const { 
        estimationAccuracy, 
        procrastinationIndex, 
        completionRate, 
        priorityFocus, 
        categoryChampion 
    } = calculations;

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Target size={64} color={estimationAccuracy.color} />
                    </div>
                    <h3 className="font-bold text-[#594a42]">Estimation Accuracy</h3>
                    <div className="flex items-baseline gap-2 my-2">
                        <div className="text-4xl font-black" style={{ color: estimationAccuracy.color }}>{estimationAccuracy.val}%</div>
                        <div className="text-sm font-bold text-[#a4b0be]">Actual vs Planned</div>
                    </div>
                    <p className="text-xs font-bold text-[#594a42] bg-[#f1f2f6] inline-block px-2 py-1 rounded-lg">{estimationAccuracy.text}</p>
                </div>
                <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Clock size={64} className="text-[#ff6b6b]" /></div>
                    <h3 className="font-bold text-[#594a42]">Procrastination Index</h3>
                    <div className="text-4xl font-black text-[#ff6b6b] my-2">{procrastinationIndex}</div>
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
                    <div className="text-3xl font-black text-[#ff6b6b]">{priorityFocus}%</div>
                    <p className="text-[10px] text-[#a4b0be] font-bold mt-1">Time spent on P1/P2 tasks</p>
                </div>
                <div className="bg-white rounded-3xl p-6 border-2 border-[#f1f2f6] shadow-sm flex flex-col items-center text-center">
                    <div className="p-3 bg-[#fff8e1] text-[#fdcb58] rounded-full mb-3"><Award size={24}/></div>
                    <h3 className="font-bold text-[#594a42] text-sm mb-1">Category Champ</h3>
                    <div className="text-xl font-black text-[#fdcb58] mt-1 break-all line-clamp-1">{categoryChampion}</div>
                    <p className="text-[10px] text-[#a4b0be] font-bold mt-1">Most completed tasks</p>
                </div>
            </div>
        </div>
    );
};

export default TasksTab;