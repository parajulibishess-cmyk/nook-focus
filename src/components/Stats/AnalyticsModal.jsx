import React, { useState } from 'react';
import { useStats } from '../../context/StatsContext';
import { useSettings } from '../../context/SettingsContext';
import { X } from 'lucide-react';
import GardenDisplay from '../Garden/GardenDisplay';

// Import New Components
import { useAnalyticsCalculations } from '../../hooks/useAnalyticsCalculations';
import AnalyticsSidebar from './AnalyticsSidebar';
import OverviewTab from './Tabs/OverviewTab';
import TasksTab from './Tabs/TasksTab';
import TrendsTab from './Tabs/TrendsTab';

const AnalyticsModal = ({ onClose }) => {
  const { stats } = useStats();
  const { dailyGoal } = useSettings();
  const [tab, setTab] = useState('dashboard');
  
  // Use the custom hook for all calculations
  const calculations = useAnalyticsCalculations();

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
                <AnalyticsSidebar 
                    tab={tab} 
                    setTab={setTab} 
                    streak={stats.streak} 
                />

                {/* Content Area */}
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative bg-[#fcfcf7]">
                    
                    {tab === 'dashboard' && (
                        <OverviewTab 
                            stats={stats} 
                            dailyGoal={dailyGoal} 
                            calculations={calculations} 
                        />
                    )}

                    {tab === 'tasks' && (
                        <TasksTab calculations={calculations} />
                    )}

                    {tab === 'trends' && (
                        <TrendsTab 
                            stats={stats} 
                            calculations={calculations} 
                        />
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