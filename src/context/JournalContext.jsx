import React, { createContext, useState, useEffect, useContext } from 'react';

const JournalContext = createContext();
export const useJournal = () => useContext(JournalContext);

export const JournalProvider = ({ children }) => {
  const [journalEntries, setJournalEntries] = useState(() => JSON.parse(localStorage.getItem('nook_journal')) || []);
  useEffect(() => { localStorage.setItem('nook_journal', JSON.stringify(journalEntries)); }, [journalEntries]);

  return (
    <JournalContext.Provider value={{ journalEntries, setEntries: setJournalEntries }}>
      {children}
    </JournalContext.Provider>
  );
};