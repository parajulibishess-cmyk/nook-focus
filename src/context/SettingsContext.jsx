import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [durations, setDurations] = useState(() => JSON.parse(localStorage.getItem('nook_durations')) || { focus: 25, short: 5, long: 15 });
  const [autoStartBreaks, setAutoStartBreaks] = useState(() => localStorage.getItem('nook_auto_start') === 'true');
  const [longBreakInterval, setLongBreakInterval] = useState(() => parseInt(localStorage.getItem('nook_interval') || '4'));
  const [isDeepFocus, setIsDeepFocus] = useState(() => localStorage.getItem('nook_deep_focus') === 'true');
  const [dailyGoal, setDailyGoal] = useState(() => parseInt(localStorage.getItem('nook_daily_goal') || '120'));
  const [breathingDuration, setBreathingDuration] = useState(() => parseInt(localStorage.getItem('nook_breathing_duration') || '10'));
  const [showPercentage, setShowPercentage] = useState(() => localStorage.getItem('nook_show_percentage') === 'true');
  const [flowDuration, setFlowDuration] = useState(15);
  const [intermissionDuration, setIntermissionDuration] = useState(15);
  const [allowedDomains, setAllowedDomains] = useState(() => JSON.parse(localStorage.getItem('nook_allowed_domains')) || ["spotify.com", "todoist.com", "youtube.com"]);

  // Persistence Effects
  useEffect(() => { localStorage.setItem('nook_durations', JSON.stringify(durations)); }, [durations]);
  useEffect(() => { localStorage.setItem('nook_auto_start', autoStartBreaks); }, [autoStartBreaks]);
  useEffect(() => { localStorage.setItem('nook_interval', longBreakInterval.toString()); }, [longBreakInterval]);
  useEffect(() => { localStorage.setItem('nook_deep_focus', isDeepFocus); }, [isDeepFocus]);
  useEffect(() => { localStorage.setItem('nook_show_percentage', showPercentage); }, [showPercentage]);
  useEffect(() => { localStorage.setItem('nook_daily_goal', dailyGoal.toString()); }, [dailyGoal]);
  useEffect(() => { localStorage.setItem('nook_breathing_duration', breathingDuration.toString()); }, [breathingDuration]);
  useEffect(() => { localStorage.setItem('nook_allowed_domains', JSON.stringify(allowedDomains)); }, [allowedDomains]);

  // MEMOIZATION FIX: Prevents the entire app from re-rendering on every minor state change
  const value = useMemo(() => ({
    durations, setDurations,
    autoStartBreaks, setAutoStartBreaks,
    longBreakInterval, setLongBreakInterval,
    isDeepFocus, setIsDeepFocus,
    dailyGoal, setDailyGoal,
    breathingDuration, setBreathingDuration,
    showPercentage, setShowPercentage,
    flowDuration, setFlowDuration,
    intermissionDuration, setIntermissionDuration,
    allowedDomains, setAllowedDomains
  }), [
    durations, autoStartBreaks, longBreakInterval, isDeepFocus, 
    dailyGoal, breathingDuration, showPercentage, flowDuration, 
    intermissionDuration, allowedDomains
  ]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};