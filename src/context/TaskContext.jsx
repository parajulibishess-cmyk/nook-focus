import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';

const TaskContext = createContext();
export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('nook_tasks')) || []);
  const [focusedTaskId, setFocusedTaskId] = useState(null);
  const [todoistToken, setTodoistToken] = useState(() => localStorage.getItem('nook_todoist_token') || "");
  const [isSyncing, setIsSyncing] = useState(false);

  // OPTIMIZATION: Debounce localStorage writes
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
            // These are the tasks currently ACTIVE on Todoist
            const remoteTasks = data.map(t => ({ 
                id: String(t.id), // FIX: Ensure ID is string for consistent matching
                text: t.content, 
                priority: t.priority, 
                category: "General", 
                completed: t.is_completed, 
                isSyncing: false,
                dueDate: t.due ? t.due.date : null, 
                estimatedPomos: 1,
                createdAt: t.created_at 
            }));
            
            setTasks(prev => {
              // Create map using String ID to ensure matches work
              const prevMap = new Map(prev.map(t => [String(t.id), t]));
              
              // 1. Merge Remote Tasks with Local Data (Preserving Categories & Estimates)
              const mergedRemoteTasks = remoteTasks.map(nt => {
                  if (prevMap.has(nt.id)) {
                      const existing = prevMap.get(nt.id);
                      return { 
                          ...existing, 
                          ...nt,       
                          category: existing.category, 
                          estimatedPomos: existing.estimatedPomos || 1
                      };
                  }
                  return nt;
              });

              // 2. FIX: Preserve Locally Completed Tasks
              // Todoist API only returns active tasks. If a task is completed locally,
              // we MUST keep it in state, otherwise stats will drop to 0%.
              const remoteIds = new Set(remoteTasks.map(t => t.id));
              const preservedCompletedTasks = prev.filter(t => t.completed && !remoteIds.has(String(t.id)));

              return [...mergedRemoteTasks, ...preservedCompletedTasks];
            });
        }
    } catch(e){ console.error(e); } finally { setIsSyncing(false); }
  };

  // Poll Todoist every 60 seconds
  useEffect(() => {
    let interval;
    if (todoistToken) {
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