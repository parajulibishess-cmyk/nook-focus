import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';

const TaskContext = createContext();
export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('nook_tasks')) || []);
  const [focusedTaskId, setFocusedTaskId] = useState(null);
  const [todoistToken, setTodoistToken] = useState(() => localStorage.getItem('nook_todoist_token') || "");
  const [isSyncing, setIsSyncing] = useState(false);

  // OPTIMIZATION: Debounce localStorage writes to prevent blocking on every keystroke/update
  useEffect(() => { 
    const handler = setTimeout(() => {
        localStorage.setItem('nook_tasks', JSON.stringify(tasks));
    }, 500);
    return () => clearTimeout(handler);
  }, [tasks]);

  useEffect(() => { localStorage.setItem('nook_todoist_token', todoistToken); }, [todoistToken]);

  const fetchTodoistTasks = async () => {
    if(!todoistToken) return;
    setIsSyncing(true);
    try {
        const res = await fetch('https://api.todoist.com/rest/v2/tasks', { headers: { 'Authorization': `Bearer ${todoistToken}` } });
        if (res.ok) {
            const data = await res.json();
            const newTasks = data.map(t => ({ 
                id: t.id, 
                text: t.content, 
                priority: t.priority, 
                category: "General", 
                completed: t.is_completed, 
                isSyncing: false,
                dueDate: t.due ? t.due.date : null, 
                estimatedPomos: 1
            }));
            setTasks(prev => {
              const existingMap = new Map(prev.map(t => [t.id, t]));
              return newTasks.map(nt => existingMap.has(nt.id) ? { ...existingMap.get(nt.id), ...nt } : nt);
            });
        }
    } catch(e){ console.error(e); } finally { setIsSyncing(false); }
  };

  const value = useMemo(() => ({
    tasks, setTasks, 
    focusedTaskId, setFocusedTaskId, 
    todoistToken, setTodoistToken, 
    fetchTodoistTasks, isSyncing 
  }), [tasks, focusedTaskId, todoistToken, isSyncing]);

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};