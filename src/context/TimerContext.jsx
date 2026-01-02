import React, { createContext, useContext, useState } from 'react';
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
  const { setStats, setSeeds, setPostcards } = useStats();
  const { tasks, setTasks, focusedTaskId } = useTasks();
  
  // This state controls the "Extend Session / Take Break" popup logic
  const [showFlowExtend, setShowFlowExtend] = useState(false);

  // Callback passed to useTimer: handles what happens when the clock hits 0:00
  const handleTimerComplete = (mode, isFocusSession) => {
    if (isFocusSession) {
      // 1. Trigger the flow check UI (Extend vs Break)
      setShowFlowExtend(true);
      
      // 2. Add currency (Seeds)
      setSeeds(prev => prev + 1);
      
      // 3. Update Stats (History, Hourly, Streak)
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const hour = now.getHours();
      
      setStats(prev => {
        const newHistory = { ...prev.dailyHistory }; 
        newHistory[today] = (newHistory[today] || 0) + settings.durations.focus;
        
        const newHourly = [...prev.hourlyActivity]; 
        newHourly[hour] += settings.durations.focus;
        
        // Simple streak logic
        let newStreak = prev.streak;
        if (prev.lastActiveDate !== today) { 
            const y = new Date(now); 
            y.setDate(y.getDate() - 1); 
            // If active yesterday, inc streak. If not today/yesterday, reset.
            if (prev.lastActiveDate === y.toISOString().split('T')[0]) newStreak += 1; 
            else if (prev.lastActiveDate !== today) newStreak = 1; 
        }
        
        // Update Category Distribution
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

      // 4. Update the specific task's pomodoro count
      if (focusedTaskId) {
        setTasks(prev => prev.map(t => 
          t.id === focusedTaskId 
            ? { ...t, completedPomos: (t.completedPomos || 0) + 1 } 
            : t
        ));
      }
    } else { 
        // Just increment break counter if it was a break
        setStats(prev => ({ ...prev, breaksCompleted: (prev.breaksCompleted || 0) + 1 })); 
    }
  };

  // Initialize the hook with our settings and callback
  const timer = useTimer(settings, handleTimerComplete);

  // Called by UI when user clicks "Take Break" after a session
  const finishSession = () => {
    setShowFlowExtend(false);
    timer.finishIntermission('break'); 
  };

  // Called by UI when user clicks "Extend 15m" after a session
  const extendSession = () => {
    setShowFlowExtend(false);
    timer.finishIntermission('extend');
    setStats(prev => ({ ...prev, flowExtensions: (prev.flowExtensions || 0) + 1 }));
  };

  return (
    <TimerContext.Provider value={{ 
      timer, 
      showFlowExtend, 
      setShowFlowExtend, 
      finishSession, 
      extendSession 
    }}>
      {children}
    </TimerContext.Provider>
  );
};