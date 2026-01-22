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
                category: "General", // Default for NEW tasks found on Todoist
                completed: t.is_completed, 
                isSyncing: false,
                dueDate: t.due ? t.due.date : null, 
                estimatedPomos: 1,
                // FIX: Map created_at so we can calculate stats like Procrastination Index
                createdAt: t.created_at 
            }));
            
            setTasks(prev => {
              const existingMap = new Map(prev.map(t => [t.id, t]));
              return newTasks.map(nt => {
                  // FIX: If task exists locally, preserve its category instead of overwriting with "General"
                  if (existingMap.has(nt.id)) {
                      const existing = existingMap.get(nt.id);
                      // Merge the new data (nt) into existing, but explicitly keep the local category
                      return { ...existing, ...nt, category: existing.category };
                  }
                  return nt;
              });
            });
        }
    } catch(e){ console.error(e); } finally { setIsSyncing(false); }
  };

  // NEW: Poll Todoist every 60 seconds (1 minute) to keep tasks in sync
  useEffect(() => {
    let interval;
    if (todoistToken) {
        // Initial fetch to ensure data is fresh on load/token set
        fetchTodoistTasks();
        
        interval = setInterval(() => {
            fetchTodoistTasks();
        }, 60000);
    }
    return () => {
        if (interval) clearInterval(interval);
    };
  }, [todoistToken]);

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