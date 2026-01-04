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
  const { stats, setStats, setSeeds } = useStats();
  const { tasks, setTasks, focusedTaskId } = useTasks();
  
  const [showFlowExtend, setShowFlowExtend] = useState(false);
  const [isExtension, setIsExtension] = useState(false);

  const handleTimerComplete = (mode, isFocusSession) => {
    // 1. UPDATE SESSION COUNTS (Focus, Short, Long)
    setStats(prev => ({
        ...prev,
        sessionCounts: {
            ...prev.sessionCounts,
            [mode]: (prev.sessionCounts?.[mode] || 0) + 1
        }
    }));

    if (isFocusSession) {
      setShowFlowExtend(true);
      
      const durationToAdd = isExtension ? settings.flowDuration : settings.durations.focus;
      const sessionIncrement = isExtension ? 0 : 1;
      const seedIncrement = isExtension ? 0 : 1;
      
      if (seedIncrement > 0) {
          setSeeds(prev => prev + seedIncrement);
      }
      
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const hour = now.getHours();
      
      setStats(prev => {
        const newHistory = { ...prev.dailyHistory }; 
        const oldTodayTotal = newHistory[today] || 0;
        const newTodayTotal = oldTodayTotal + durationToAdd;
        newHistory[today] = newTodayTotal; 
        
        const newHourly = [...prev.hourlyActivity]; 
        newHourly[hour] += durationToAdd;
        
        let newStreak = prev.streak;
        if (prev.lastActiveDate !== today) { 
            const y = new Date(now); 
            y.setDate(y.getDate() - 1); 
            const yesterday = y.toISOString().split('T')[0];
            if (prev.lastActiveDate === yesterday) newStreak += 1; 
            else if (prev.lastActiveDate !== today) newStreak = 1; 
        }

        // 2. UPDATE BEST STREAK
        const newBestStreak = Math.max(prev.bestStreak || 0, newStreak);
        
        // 3. UPDATE PERFECT DAYS
        const goal = settings.dailyGoal;
        const metGoalBefore = oldTodayTotal >= goal;
        const metGoalNow = newTodayTotal >= goal;
        const perfectDaysIncrement = (!metGoalBefore && metGoalNow) ? 1 : 0;

        // 4. CATEGORY & PRIORITY STATS
        const activeTask = tasks.find(t => t.id === focusedTaskId);
        const activeCategory = activeTask?.category || "General";
        const activePriority = activeTask?.priority || 1;

        const newCategoryDist = { ...prev.categoryDist }; 
        newCategoryDist[activeCategory] = (newCategoryDist[activeCategory] || 0) + durationToAdd;

        const newPriorityDist = { ...prev.priorityDist };
        if (activeTask) {
             newPriorityDist[activePriority] = (newPriorityDist[activePriority] || 0) + durationToAdd;
        }

        const totalMins = prev.minutes + durationToAdd;
        
        return { 
          ...prev, 
          sessions: prev.sessions + sessionIncrement, 
          minutes: totalMins, 
          dailyHistory: newHistory, 
          hourlyActivity: newHourly, 
          categoryDist: newCategoryDist, 
          priorityDist: newPriorityDist,
          streak: newStreak,
          lastActiveDate: today,
          bestStreak: newBestStreak,
          perfectDays: (prev.perfectDays || 0) + perfectDaysIncrement
        };
      });

      if (focusedTaskId && sessionIncrement > 0) {
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
    setIsExtension(false);
    timer.finishIntermission('break'); 
  };

  const extendSession = () => {
    setShowFlowExtend(false);
    setIsExtension(true);
    timer.finishIntermission('extend');
    setStats(prev => ({ ...prev, flowExtensions: (prev.flowExtensions || 0) + 1 }));
  };

  const value = useMemo(() => ({
    timer, showFlowExtend, setShowFlowExtend, finishSession, extendSession 
  }), [timer, showFlowExtend]);

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};