import React, { createContext, useContext, useState, useMemo } from 'react';
import { useTimer } from '../hooks/useTimer';
import { useSettings } from './SettingsContext';
import { useStats } from './StatsContext';
import { useTasks } from './TaskContext';

const TimerContext = createContext();

export const useTimerContext = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimerContext must be used within a TimerProvider');
  }
  return context;
};

export const TimerProvider = ({ children }) => {
  const settings = useSettings();
  const { setStats, setSeeds } = useStats();
  const { tasks, setTasks, focusedTaskId } = useTasks();
  const [showFlowExtend, setShowFlowExtend] = useState(false);

  const handleTimerComplete = (mode, isFocusSession) => {
    if (isFocusSession) {
      setShowFlowExtend(true);
      setSeeds(prev => prev + 1);
      
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const hour = now.getHours();
      
      setStats(prev => {
        const newHistory = { ...prev.dailyHistory }; 
        newHistory[today] = (newHistory[today] || 0) + settings.durations.focus;
        
        const newHourly = [...prev.hourlyActivity]; 
        newHourly[hour] += settings.durations.focus;
        
        let newStreak = prev.streak;
        if (prev.lastActiveDate !== today) { 
            const y = new Date(now); 
            y.setDate(y.getDate() - 1); 
            if (prev.lastActiveDate === y.toISOString().split('T')[0]) newStreak += 1; 
            else if (prev.lastActiveDate !== today) newStreak = 1; 
        }
        
        const activeTaskCategory = tasks.find(t => t.id === focusedTaskId)?.category || "General";
        const newCategoryDist = { ...prev.categoryDist }; 
        newCategoryDist[activeTaskCategory] = (newCategoryDist[activeTaskCategory] || 0) + settings.durations.focus;
        
        const totalMins = prev.minutes + settings.durations.focus;
        
        return { 
          ...prev, 
          sessions: prev.sessions + 1, 
          minutes: totalMins, 
          dailyHistory: newHistory, 
          hourlyActivity: newHourly, 
          categoryDist: newCategoryDist, 
          streak: newStreak, 
          lastActiveDate: today 
        };
      });

      if (focusedTaskId) {
        setTasks(prev => prev.map(t => 
          t.id === focusedTaskId 
            ? { ...t, completedPomos: (t.completedPomos || 0) + 1 } 
            : t
        ));
      }
    } else { 
        setStats(prev => ({ ...prev, breaksCompleted: (prev.breaksCompleted || 0) + 1 })); 
    }
  };

  const timer = useTimer(settings, handleTimerComplete);

  const finishSession = () => {
    setShowFlowExtend(false);
    timer.finishIntermission('break'); 
  };

  const extendSession = () => {
    setShowFlowExtend(false);
    timer.finishIntermission('extend');
    setStats(prev => ({ ...prev, flowExtensions: (prev.flowExtensions || 0) + 1 }));
  };

  const value = useMemo(() => ({
    timer, 
    showFlowExtend, 
    setShowFlowExtend, 
    finishSession, 
    extendSession 
  }), [timer, showFlowExtend]);

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};