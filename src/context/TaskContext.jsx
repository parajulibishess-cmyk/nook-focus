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
            // These are the tasks currently ACTIVE on Todoist
            const remoteTasks = data.map(t => ({ 
                id: t.id, 
                text: t.content, 
                priority: t.priority, 
                category: "General", 
                completed: t.is_completed, 
                isSyncing: false,
                dueDate: t.due ? t.due.date : null, 
                estimatedPomos: 1,
                // FIX: Import the created_at time so Procrastination Index works for Todoist tasks
                createdAt: t.created_at 
            }));
            
            setTasks(prev => {
              const prevMap = new Map(prev.map(t => [t.id, t]));
              
              // 1. Merge Remote Tasks with Local Data (Preserving Categories, Estimates, & Completion)
              const mergedRemoteTasks = remoteTasks.map(nt => {
                  if (prevMap.has(nt.id)) {
                      const existing = prevMap.get(nt.id);
                      return { 
                          ...existing, 
                          ...nt,       
                          // FIX: Explicitly preserve local fields that Todoist doesn't have
                          category: existing.category, 
                          estimatedPomos: existing.estimatedPomos || 1,
                          
                          // FIX: CRITICAL - Preserve completedPomos so it doesn't reset to 0
                          completedPomos: existing.completedPomos || 0,
                          
                          // FIX: Preserve creation time if local has it, otherwise use remote
                          createdAt: existing.createdAt || nt.createdAt,

                          // FIX: If local is completed, KEEP it completed. 
                          // Todoist returns active tasks (completed=false). If we check it off in Nook, 
                          // we don't want the sync to immediately uncheck it before the API update processes.
                          completed: existing.completed || nt.completed
                      };
                  }
                  return nt;
              });

              // 2. FIX: Preserve Locally Completed Tasks
              // Todoist API only returns active tasks. If we have a completed task locally, 
              // it won't be in 'remoteTasks' (if synced elsewhere or just now). 
              // We need to keep it so stats count it.
              const remoteIds = new Set(remoteTasks.map(t => t.id));
              // Also preserve tasks that are currently syncing (isSyncing: true) so they don't vanish
              const preservedTasks = prev.filter(t => 
                  (t.completed && !remoteIds.has(t.id)) || 
                  (t.isSyncing && !remoteIds.has(t.id))
              );

              return [...mergedRemoteTasks, ...preservedTasks];
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