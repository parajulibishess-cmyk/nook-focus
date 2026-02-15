import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';

const TaskContext = createContext();
export const useTasks = () => useContext(TaskContext);

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('nook_tasks')) || []);
  const [archivedTasks, setArchivedTasks] = useState(() => JSON.parse(localStorage.getItem('nook_archived_tasks')) || []);
  const [focusedTaskId, setFocusedTaskId] = useState(null);
  const [todoistToken, setTodoistToken] = useState(() => localStorage.getItem('nook_todoist_token') || "");
  const [isSyncing, setIsSyncing] = useState(false);
  const [todoistSections, setTodoistSections] = useState({}); // Map: "Study" -> 12345 (ID)

  // OPTIMIZATION: Debounce localStorage writes
  useEffect(() => { 
    const handler = setTimeout(() => {
        localStorage.setItem('nook_tasks', JSON.stringify(tasks));
    }, 500);
    return () => clearTimeout(handler);
  }, [tasks]);

  // PERSISTENCE: Save archived tasks
  useEffect(() => {
    localStorage.setItem('nook_archived_tasks', JSON.stringify(archivedTasks));
  }, [archivedTasks]);

  useEffect(() => { localStorage.setItem('nook_todoist_token', todoistToken); }, [todoistToken]);

  // Archive function to preserve stats when "discarding"
  const deleteTask = (taskId) => {
    setTasks(currentTasks => {
      const taskToDelete = currentTasks.find(t => t.id === taskId);
      if (taskToDelete) {
        setArchivedTasks(prev => {
          if (prev.find(a => a.id === taskId)) return prev;
          return [...prev, { ...taskToDelete, archivedAt: Date.now() }];
        });
      }
      return currentTasks.filter(t => t.id !== taskId);
    });
  };

  const fetchTodoistTasks = async () => {
    if(!todoistToken) return;
    setIsSyncing(true);
    try {
        // 1. Fetch Sections
        const sectionsRes = await fetch('https://api.todoist.com/rest/v2/sections', { 
            headers: { 'Authorization': `Bearer ${todoistToken}` } 
        });
        
        let sectionIdToName = {};
        if (sectionsRes.ok) {
            const sectionsData = await sectionsRes.json();
            const nameToId = {};
            sectionsData.forEach(s => {
                sectionIdToName[s.id] = s.name;
                nameToId[s.name] = s.id;
            });
            setTodoistSections(nameToId); 
        }

        // 2. Fetch Tasks
        const res = await fetch('https://api.todoist.com/rest/v2/tasks', { headers: { 'Authorization': `Bearer ${todoistToken}` } });
        
        if (res.ok) {
            const data = await res.json();
            // ... (keep your existing mapping logic here) ...
            
            // COPY THE ENTIRE MAPPING AND setTasks LOGIC FROM YOUR ORIGINAL FILE HERE
            const remoteTasks = data.map(t => { 
                /* ... use original mapping code ... */ 
                let content = t.content;
                let category = "General";
                const categoryMatch = content.match(/(?:^|\s)\/(\w+)(?:\s|$)/);
                if (categoryMatch) {
                    category = categoryMatch[1];
                    content = content.replace(categoryMatch[0], ' ').trim();
                } else if (t.section_id && sectionIdToName[t.section_id]) {
                    const secName = sectionIdToName[t.section_id];
                    if (["Work", "Study", "Creative", "Reading"].includes(secName)) {
                        category = secName;
                    }
                }
                return { 
                    id: t.id, 
                    text: content, 
                    priority: t.priority, 
                    category: category, 
                    completed: t.is_completed, 
                    isSyncing: false,
                    dueDate: t.due ? t.due.date : null, 
                    estimatedPomos: 1,
                    createdAt: t.created_at 
                };
            });

            setTasks(prev => {
              const prevMap = new Map(prev.map(t => [t.id, t]));
              const mergedRemoteTasks = remoteTasks.map(nt => {
                  if (prevMap.has(nt.id)) {
                      const existing = prevMap.get(nt.id);
                      const finalCategory = (nt.category !== "General") ? nt.category : existing.category;
                      return { ...existing, ...nt, category: finalCategory, estimatedPomos: existing.estimatedPomos || 1, completedPomos: existing.completedPomos || 0, createdAt: existing.createdAt || nt.createdAt, completed: existing.completed || nt.completed };
                  }
                  return nt;
              });
              const remoteIds = new Set(remoteTasks.map(t => t.id));
              const preservedTasks = prev.filter(t => (t.completed && !remoteIds.has(t.id)) || (t.isSyncing && !remoteIds.has(t.id)));
              return [...mergedRemoteTasks, ...preservedTasks];
            });
            
        } else {
            // NEW: Log error if fetch fails (e.g. 401 Unauthorized)
            console.error("Failed to fetch Todoist tasks. Status:", res.status);
        }
    } catch(e){ console.error(e); } finally { setIsSyncing(false); }
  };

  useEffect(() => {
    let interval;
    if (todoistToken) {
        fetchTodoistTasks();
        // CHANGED: Reduced interval to 5 seconds for faster syncing
        interval = setInterval(() => {
            fetchTodoistTasks();
        }, 5000);
    }
    return () => {
        if (interval) clearInterval(interval);
    };
  }, [todoistToken]);

  const value = useMemo(() => ({
    tasks, setTasks, 
    archivedTasks, deleteTask,
    todoistSections, 
    focusedTaskId, setFocusedTaskId, 
    todoistToken, setTodoistToken, 
    fetchTodoistTasks, isSyncing 
  }), [tasks, archivedTasks, todoistSections, focusedTaskId, todoistToken, isSyncing]);

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};