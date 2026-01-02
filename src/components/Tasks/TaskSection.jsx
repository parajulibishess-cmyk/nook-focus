import React, { useState } from 'react';
import { useTasks } from '../../context/TaskContext';
import { useStats } from '../../context/StatsContext';
import { Plus, CheckSquare, Flag, CalendarDays, Target, Trash2, Layers, Briefcase, BookOpen, PenTool, Book, Loader2 } from 'lucide-react';
import Card from '../UI/Card';
import Calendar from '../UI/Calendar';

const TaskSection = ({ transparent }) => {
  const { tasks, setTasks, focusedTaskId, setFocusedTaskId, todoistToken } = useTasks();
  const { setStats } = useStats(); // For stats update on toggle
  const [newTask, setNewTask] = useState("");
  // ... keep local UI state (newPriority, showCalendar, etc.) here as it is form state ...
  const [newPriority, setNewPriority] = useState(1);
  const [newDueDate, setNewDueDate] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [newEstimate, setNewEstimate] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showCategorySelect, setShowCategorySelect] = useState(false);

  const categories = [
    { name: "General", icon: Layers, color: "text-[#a4b0be]" },
    { name: "Work", icon: Briefcase, color: "text-[#54a0ff]" },
    { name: "Study", icon: BookOpen, color: "text-[#fdcb58]" },
    { name: "Creative", icon: PenTool, color: "text-[#ff6b6b]" },
    { name: "Reading", icon: Book, color: "text-[#78b159]" }
  ];

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    const tempId = Date.now();
    const taskObj = { id: tempId, text: newTask, priority: newPriority, dueDate: newDueDate, category: newCategory, estimatedPomos: newEstimate, completedPomos: 0, completed: false, isSyncing: !!todoistToken };
    setTasks(prev => [...prev, taskObj]);
    setNewTask(""); setNewPriority(1); setNewDueDate(""); setNewCategory("General"); setNewEstimate(1); setShowCalendar(false);
    
    if (todoistToken) {
        try { 
            const res = await fetch('https://api.todoist.com/rest/v2/tasks', { method: 'POST', headers: { 'Authorization': `Bearer ${todoistToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ content: newTask, priority: newPriority, due_date: newDueDate || undefined }) });
            if (res.ok) {
                const data = await res.json();
                setTasks(prev => prev.map(t => t.id === tempId ? { ...t, id: data.id, isSyncing: false } : t));
            }
        } catch(e) { console.error(e); }
    }
  };

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => {
        if (t.id === id) {
            const newStatus = !t.completed;
            if (newStatus) setStats(s => ({ ...s, tasksCompleted: s.tasksCompleted + 1 }));
            if (focusedTaskId === id && newStatus) setFocusedTaskId(null);
            if (todoistToken) {
                fetch(`https://api.todoist.com/rest/v2/tasks/${id}/${newStatus ? 'close' : 'reopen'}`, { method: 'POST', headers: { 'Authorization': `Bearer ${todoistToken}` } }).catch(console.error);
            }
            return { ...t, completed: newStatus };
        }
        return t;
    }));
  };

  const discardTask = async (id) => {
      setTasks(prev => prev.filter(t => t.id !== id));
      if (focusedTaskId === id) setFocusedTaskId(null);
      if (todoistToken) { fetch(`https://api.todoist.com/rest/v2/tasks/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${todoistToken}` } }).catch(console.error); }
  };
  
  const getPriorityColor = (p) => { if (p === 4) return "text-[#ff6b6b]"; if (p === 3) return "text-[#fdcb58]"; if (p === 2) return "text-[#54a0ff]"; return "text-[#a4b0be]"; };
  const activeCategory = categories.find(c => c.name === newCategory) || categories[0];
  const ActiveIcon = activeCategory.icon;

  return (
    <Card transparent={transparent} className="flex-1 flex flex-col h-full min-h-[350px] overflow-visible relative z-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-black flex items-center gap-3 text-[#594a42]"><span className="bg-[#fdcb58] w-3 h-8 rounded-full shadow-sm"></span>Today's Tasks</h2>
        <span className="text-xs font-bold bg-[#f1f2f6] px-3 py-1.5 rounded-full text-[#8e8070] border border-[#e6e2d0]">{tasks.filter(t => t.completed).length} / {tasks.length}</span>
      </div>

      <form onSubmit={addTask} className={`relative z-30 mb-4 rounded-2xl p-2 border-2 transition-all shadow-inner ${transparent ? 'opacity-0 pointer-events-none' : 'bg-[#f1f2f6]/80 backdrop-blur-sm border-transparent focus-within:border-[#78b159] focus-within:bg-white'}`}>
        <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add a new task..." className="w-full bg-transparent p-3 pl-3 outline-none font-bold text-[#594a42] placeholder-[#a4b0be] text-sm sm:text-base" />
        {/* ... (Keep the rest of the form UI identical to original, using local state variables) ... */}
         <div className="flex flex-wrap items-center justify-between mt-1 px-1 gap-2">
            <div className="flex flex-wrap gap-1 relative z-20">
                <button type="button" onClick={() => setNewPriority(p => p >= 4 ? 1 : p + 1)} className={`p-1.5 sm:p-2 rounded-xl transition-all hover:bg-black/5 flex items-center gap-1 ${getPriorityColor(newPriority)}`}><Flag size={16} fill="currentColor"/><span className="text-[10px] sm:text-xs font-black">P{5 - newPriority}</span></button>
                <div className="relative">
                    <button type="button" onClick={() => setShowCategorySelect(!showCategorySelect)} className="bg-transparent text-[10px] sm:text-xs font-bold text-[#8e8070] p-1.5 sm:p-2 hover:bg-black/5 rounded-xl flex items-center gap-1"><ActiveIcon size={14} className={activeCategory.color} />{newCategory}</button>
                    {showCategorySelect && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowCategorySelect(false)}></div>
                            <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border-2 border-[#f1f2f6] p-2 z-50 w-40 flex flex-col gap-1 animate-pop-in">
                                {categories.map(c => (<button key={c.name} type="button" onClick={() => { setNewCategory(c.name); setShowCategorySelect(false); }} className="flex items-center gap-2 p-2 rounded-xl text-xs font-bold transition-colors w-full text-left hover:bg-[#f1f2f6]"><c.icon size={14} className={c.color} />{c.name}</button>))}
                            </div>
                        </>
                    )}
                </div>
                <button type="button" onClick={() => setNewEstimate(e => e >= 10 ? 1 : e + 1)} className="flex items-center gap-1 bg-white/50 rounded-xl px-2 py-1 text-[#594a42] font-bold text-[10px] cursor-pointer hover:bg-white transition-colors"><span className="text-xs">🍅</span> {newEstimate}</button>
                <div className="relative">
                    <button type="button" onClick={() => setShowCalendar(!showCalendar)} className={`p-1.5 sm:p-2 rounded-xl transition-all flex items-center gap-2 ${newDueDate ? 'bg-[#78b159]/10 text-[#78b159]' : 'text-[#a4b0be] hover:bg-black/5'}`}><CalendarDays size={16} /><span className="text-[10px] font-bold">{newDueDate ? new Date(newDueDate + 'T00:00').toLocaleDateString(undefined, {month:'short',day:'numeric'}) : 'Date'}</span></button>
                    {showCalendar && (
                        <>
                           <div className="fixed inset-0 z-40" onClick={() => setShowCalendar(false)}></div>
                           <div className="absolute top-full right-0 mt-2 z-50 drop-shadow-2xl"><Calendar selectedDate={newDueDate} onSelect={setNewDueDate} onClose={() => setShowCalendar(false)} /></div>
                        </>
                    )}
                </div>
            </div>
            <button type="submit" className="bg-[#78b159] text-white p-2 rounded-xl hover:bg-[#6aa34b] shadow-md"><Plus size={18} /></button>
        </div>
      </form>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 pl-1 custom-scrollbar rounded-2xl relative z-0">
        {tasks.map(task => {
            const isFocused = focusedTaskId === task.id;
            const opacityClass = transparent ? (isFocused ? 'opacity-100 bg-white scale-[1.02] shadow-xl border-[#78b159] z-10' : 'opacity-50 blur-[0.5px] grayscale-[0.3] scale-95 border-transparent') : (task.completed ? 'opacity-60 bg-[#f1f2f6] border-transparent' : 'bg-white opacity-100 border-[#f1f2f6] hover:border-[#78b159] hover:shadow-md');
            return (
                <div key={task.id} className={`group flex items-start gap-3 p-3 rounded-2xl border-2 transition-all duration-500 ${opacityClass}`}>
                    <button onClick={() => toggleTask(task.id)} className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center ${task.completed ? 'bg-[#78b159] border-[#78b159]' : 'border-[#d1d8e0]'}`}>{task.completed && <CheckSquare size={14} className="text-white" />}</button>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2"><span className={`font-bold text-sm ${task.completed ? 'line-through text-[#a4b0be]' : 'text-[#594a42]'}`}>{task.text}</span>{task.priority > 1 && <Flag size={12} className={getPriorityColor(task.priority)} fill="currentColor"/>}</div>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-[9px] font-bold text-[#8e8070] bg-[#f1f2f6] px-2 py-0.5 rounded-md border border-[#e6e2d0]">{task.category}</span>
                            <span className="text-[9px] font-bold text-[#fdcb58] bg-[#fff8e1] px-2 py-0.5 rounded-md border border-[#ffe082]/50">🍅 {task.completedPomos || 0}/{task.estimatedPomos}</span>
                            {task.dueDate && (<span className="text-[9px] font-bold text-[#78b159] bg-[#f0fff4] px-2 py-0.5 rounded-md border border-[#78b159]/20 flex items-center gap-1"><CalendarDays size={10} /> {new Date(task.dueDate + 'T00:00').toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>)}
                            {task.isSyncing && <Loader2 size={12} className="text-[#fdcb58] animate-spin" />}
                        </div>
                    </div>
                    <button onClick={() => !task.completed && setFocusedTaskId(isFocused ? null : task.id)} className={`p-1.5 rounded-xl transition-colors ${isFocused ? 'bg-[#78b159] text-white shadow-md' : 'text-[#a4b0be] hover:bg-[#f1f2f6]'} ${task.completed ? 'opacity-0 pointer-events-none' : ''}`}><Target size={16} /></button>
                    <button onClick={() => discardTask(task.id)} className="opacity-0 group-hover:opacity-100 text-[#ff6b6b] hover:bg-[#fff0f0] p-1.5 rounded-xl transition-opacity"><Trash2 size={16} /></button>
                </div>
            );
        })}
      </div>
    </Card>
  );
};
export default TaskSection;