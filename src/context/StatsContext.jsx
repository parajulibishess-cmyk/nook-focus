import React, { createContext, useState, useEffect, useContext } from 'react';

const StatsContext = createContext();
export const useStats = () => useContext(StatsContext);

export const StatsProvider = ({ children }) => {
  const [stats, setStats] = useState(() => JSON.parse(localStorage.getItem('nook_stats')) || { sessions: 0, minutes: 0, tasksCompleted: 0, breaksCompleted: 0, dailyHistory: {}, hourlyActivity: new Array(24).fill(0), categoryDist: { "General": 0 }, streak: 0, lastActiveDate: null, flowExtensions: 0 });
  const [seeds, setSeeds] = useState(() => parseInt(localStorage.getItem('nook_seeds') || '0'));
  const [postcards, setPostcards] = useState(() => JSON.parse(localStorage.getItem('nook_postcards') || '[]'));

  useEffect(() => { localStorage.setItem('nook_stats', JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem('nook_seeds', seeds.toString()); }, [seeds]);
  useEffect(() => { localStorage.setItem('nook_postcards', JSON.stringify(postcards)); }, [postcards]);

  return (
    <StatsContext.Provider value={{ stats, setStats, seeds, setSeeds, postcards, setPostcards }}>
      {children}
    </StatsContext.Provider>
  );
};