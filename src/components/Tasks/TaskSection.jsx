import React, { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useTasks } from '../../context/TaskContext';
import { useStats } from '../../context/StatsContext';
import { Plus, CheckSquare, Flag, CalendarDays, Target, Trash2, Layers, Briefcase, BookOpen, PenTool, Book, Loader2, AlertCircle } from 'lucide-react';
import Card from '../UI/Card';
import Calendar from '../UI/Calendar';

const TaskSection = ({ transparent }) => {
  const { tasks, setTasks, focusedTaskId, setFocusedTaskId, todoistToken } = useTasks();
  const { setStats } = useStats(); 
  const [newTask, setNewTask] = useState("");
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

  const checkOverdue = (dateStr) => {
      if (!dateStr) return false;
      const today = new Date();
      today.setHours(0,0,0,0);
      const due = new Date(dateStr + 'T00:00');
      return due < today;
  };

  return (
    <Card transparent={transparent} delay={0.2} className="flex-1 flex flex-col h-full min-h-[400px] overflow-visible relative z-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-black flex items-center gap-3 text-[#594a42]"><span className="bg-[#fdcb58] w-3 h-8 rounded-full shadow-sm"></span>Today's Tasks</h2>
        <span className="text-xs font-bold bg-[#f1f2f6] px-3 py-1.5 rounded-full text-[#8e8070] border border-[#e6e2d0]">{tasks.filter(t => t.completed).length} / {tasks.length}</span>
      </div>

      <motion.form 
        layout
        onSubmit={addTask} 
        className={`relative z-30 mb-6 rounded-3xl p-3 border-4 transition-all shadow-sm ${transparent ? 'opacity-0 pointer-events-none' : 'bg-white border-[#f1f2f6] focus-within:border-[#78b159] focus-within:shadow-md'}`}
      >
        <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add a new task..." className="w-full bg-transparent p-2 pl-2 outline-none font-bold text-[#594a42] placeholder-[#a4b0be] text-base" />
         
         <div className="flex flex-wrap items-center justify-between mt-2 px-1 gap-2">
            <div className="flex flex-wrap gap-2 relative z-20">
                <button type="button" onClick={() => setNewPriority(p => p >= 4 ? 1 : p + 1)} className={`p-2 rounded-xl transition-all hover:bg-black/5 flex items-center gap-1 ${getPriorityColor(newPriority)}`}><Flag size={18} fill="currentColor"/><span className="text-xs font-black">P{5 - newPriority}</span></button>
                <div className="relative">
                    <button type="button" onClick={() => setShowCategorySelect(!showCategorySelect)} className="bg-transparent text-xs font-bold text-[#8e8070] p-2 hover:bg-black/5 rounded-xl flex items-center gap-1"><ActiveIcon size={16} className={activeCategory.color} />{newCategory}</button>
                    <AnimatePresence>
                    {showCategorySelect && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowCategorySelect(false)}></div>
                            <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.9}} className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border-2 border-[#f1f2f6] p-2 z-50 w-40 flex flex-col gap-1">
                                {categories.map(c => (<button key={c.name} type="button" onClick={() => { setNewCategory(c.name); setShowCategorySelect(false); }} className="flex items-center gap-2 p-2 rounded-xl text-xs font-bold transition-colors w-full text-left hover:bg-[#f1f2f6]"><c.icon size={14} className={c.color} />{c.name}</button>))}
                            </motion.div>
                        </>
                    )}
                    </AnimatePresence>
                </div>
                <button type="button" onClick={() => setNewEstimate(e => e >= 10 ? 1 : e + 1)} className="flex items-center gap-1 bg-[#f1f2f6] rounded-xl px-3 py-1.5 text-[#594a42] font-bold text-xs cursor-pointer hover:bg-[#e6e2d0] transition-colors"><span>🍅</span> {newEstimate}</button>
                
                <div className="relative">
                    <button type="button" onClick={() => setShowCalendar(!showCalendar)} className={`p-2 rounded-xl transition-all flex items-center gap-2 ${newDueDate ? 'bg-[#78b159]/10 text-[#78b159]' : 'text-[#a4b0be] hover:bg-black/5'}`}><CalendarDays size={18} /><span className="text-xs font-bold">{newDueDate ? new Date(newDueDate + 'T00:00').toLocaleDateString(undefined, {month:'short',day:'numeric'}) : 'Date'}</span></button>
                    <AnimatePresence>
                    {showCalendar && (
                        <>
                           <div className="fixed inset-0 z-40" onClick={() => setShowCalendar(false)}></div>
                           <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:10}} className="absolute top-full right-0 mt-2 z-50 drop-shadow-2xl"><Calendar selectedDate={newDueDate} onSelect={setNewDueDate} onClose={() => setShowCalendar(false)} /></motion.div>
                        </>
                    )}
                    </AnimatePresence>
                </div>
            </div>
            <motion.button whileTap={{scale:0.9}} type="submit" className="bg-[#78b159] text-white p-2 rounded-xl hover:bg-[#6aa34b] shadow-md"><Plus size={20} strokeWidth={3} /></motion.button>
        </div>
      </motion.form>

      <div className="flex-1 overflow-y-auto pr-2 pl-1 custom-scrollbar relative z-0">
        <LayoutGroup>
            <motion.div className="space-y-3 pb-4">
                <AnimatePresence initial={false}>
                {tasks.map(task => {
                    const isFocused = focusedTaskId === task.id;
                    const isOverdue = !task.completed && checkOverdue(task.dueDate);
                    
                    let opacityClass = transparent ? (isFocused ? 'opacity-100 bg-white scale-[1.02] shadow-xl border-[#78b159] z-10' : 'opacity-30 blur-[1px] grayscale scale-95 border-transparent') : (task.completed ? 'opacity-60 bg-[#f1f2f6] border-transparent' : 'bg-white opacity-100 border-[#f1f2f6] hover:border-[#78b159] hover:shadow-md');
                    
                    // Overdue styling
                    if (isOverdue && !transparent && !task.completed) {
                        opacityClass = 'bg-[#ff6b6b]/5 border-[#ff6b6b]/30 hover:border-[#ff6b6b]';
                    }

                    return (
                        <motion.div 
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            key={task.id} 
                            className={`group flex items-start gap-4 p-4 rounded-3xl border-2 transition-all duration-300 ${opacityClass}`}
                        >
                            <motion.button whileTap={{scale:0.8}} onClick={() => toggleTask(task.id)} className={`mt-0.5 w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-[#78b159] border-[#78b159]' : 'border-[#d1d8e0] bg-white'}`}>{task.completed && <CheckSquare size={16} className="text-white" strokeWidth={3} />}</motion.button>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={`font-bold text-base ${task.completed ? 'line-through text-[#a4b0be]' : (isOverdue ? 'text-[#ff6b6b]' : 'text-[#594a42]')}`}>
                                        {task.text}
                                    </span>
                                    {task.priority > 1 && <Flag size={14} className={getPriorityColor(task.priority)} fill="currentColor"/>}
                                    {isOverdue && !task.completed && <span className="text-[10px] font-black bg-[#ff6b6b] text-white px-2 py-0.5 rounded-full flex items-center gap-1"><AlertCircle size={10}/> OVERDUE</span>}
                                </div>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                    <span className="text-[10px] font-bold text-[#8e8070] bg-[#f1f2f6] px-2 py-1 rounded-lg border border-[#e6e2d0]">{task.category}</span>
                                    <span className="text-[10px] font-bold text-[#fdcb58] bg-[#fff8e1] px-2 py-1 rounded-lg border border-[#ffe082]/50">🍅 {task.completedPomos || 0}/{task.estimatedPomos}</span>
                                    {task.dueDate && (<span className={`text-[10px] font-bold px-2 py-1 rounded-lg border flex items-center gap-1 ${isOverdue && !task.completed ? 'bg-[#ff6b6b]/10 text-[#ff6b6b] border-[#ff6b6b]/20' : 'text-[#78b159] bg-[#f0fff4] border-[#78b159]/20'}`}><CalendarDays size={12} /> {new Date(task.dueDate + 'T00:00').toLocaleDateString(undefined, {month:'short', day:'numeric'})}</span>)}
                                    {task.isSyncing && <Loader2 size={12} className="text-[#fdcb58] animate-spin" />}
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <motion.button whileHover={{scale:1.1}} onClick={() => !task.completed && setFocusedTaskId(isFocused ? null : task.id)} className={`p-2 rounded-xl transition-colors ${isFocused ? 'bg-[#78b159] text-white shadow-md' : 'text-[#a4b0be] hover:bg-[#f1f2f6]'} ${task.completed ? 'opacity-0 pointer-events-none' : ''}`}><Target size={18} /></motion.button>
                                <motion.button whileHover={{scale:1.1}} onClick={() => discardTask(task.id)} className="opacity-0 group-hover:opacity-100 text-[#ff6b6b] hover:bg-[#fff0f0] p-2 rounded-xl transition-opacity"><Trash2 size={18} /></motion.button>
                            </div>
                        </motion.div>
                    );
                })}
                </AnimatePresence>
            </motion.div>
        </LayoutGroup>
      </div>
    </Card>
  );
};
export default TaskSection;