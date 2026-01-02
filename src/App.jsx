import React, { useState, useEffect, useRef } from 'react';
import { Settings as SettingsIcon, BarChart2, BookOpen, Minimize, Maximize, Leaf, Music, CheckSquare, ShieldAlert, Lock, Zap, X } from 'lucide-react';
import TimerDisplay from './components/Timer/TimerDisplay';
import TaskSection from './components/Tasks/TaskSection';
import SettingsModal from './components/Settings/SettingsModal';
import AnalyticsModal from './components/Stats/AnalyticsModal';
import MusicModal from './components/Audio/MusicModal';
import JournalModal from './components/Journal/JournalModal';
import Button from './components/UI/Button';
import Card from './components/UI/Card';
import SafeLink from './components/UI/SafeLink';
import { useTimer } from './hooks/useTimer';

const defaultBgPresets = [
  { name: "Morning", url: "https://vijiatjack.github.io/nookoffice/video-feed/bg_1.gif", type: "image" },
  { name: "Afternoon", url: "https://vijiatjack.github.io/nookoffice/video-feed/bg_2.gif", type: "image" },
  { name: "Evening", url: "https://vijiatjack.github.io/nookoffice/video-feed/bg_3.gif", type: "image" },
  { name: "Night", url: "https://vijiatjack.github.io/nookoffice/video-feed/bg_4.gif", type: "image" },
  { name: "Rainy", url: "https://vijiatjack.github.io/nookoffice/video-feed/bg_5.gif", type: "image" },
  { name: "Coffee", url: "https://vijiatjack.github.io/nookoffice/video-feed/bg_6.gif", type: "image" },
  { name: "Snowy", url: "https://vijiatjack.github.io/nookoffice/video-feed/bg_7.gif", type: "image" },
  { name: "The Roost (YT)", url: "https://youtu.be/bAaW9cf6Yw0", type: "video" }
];

function App() {
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
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('nook_tasks')) || []);
  const [stats, setStats] = useState(() => JSON.parse(localStorage.getItem('nook_stats')) || { sessions: 0, minutes: 0, tasksCompleted: 0, breaksCompleted: 0, dailyHistory: {}, hourlyActivity: new Array(24).fill(0), categoryDist: { "General": 0 }, streak: 0, lastActiveDate: null, flowExtensions: 0 });
  const [journalEntries, setJournalEntries] = useState(() => JSON.parse(localStorage.getItem('nook_journal')) || []);
  const [seeds, setSeeds] = useState(() => parseInt(localStorage.getItem('nook_seeds') || '0'));
  const [postcards, setPostcards] = useState(() => JSON.parse(localStorage.getItem('nook_postcards') || '[]'));
  const [bgUrl, setBgUrl] = useState(() => localStorage.getItem('nook_bg_url') || defaultBgPresets[3].url);
  const [bgOpacity, setBgOpacity] = useState(() => parseFloat(localStorage.getItem('nook_bg_opacity') || '0.4'));
  const [bgPresets, setBgPresets] = useState(() => JSON.parse(localStorage.getItem('nook_bg_presets')) || defaultBgPresets);
  const [playlists, setPlaylists] = useState(() => JSON.parse(localStorage.getItem('nook_playlists')) || [
    { id: 1, name: "Lofi Beats", url: "https://open.spotify.com/embed/playlist/0vvXsWCC9xrXsKd4FyS8kM" },
    { id: 2, name: "Deep Focus", url: "https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ" }
  ]);
  const [customSounds, setCustomSounds] = useState(() => JSON.parse(localStorage.getItem('nook_custom_sounds') || '[]'));
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [isMinimalist, setIsMinimalist] = useState(false);
  const [focusedTaskId, setFocusedTaskId] = useState(null);
  const [todoistToken, setTodoistToken] = useState(() => localStorage.getItem('nook_todoist_token') || "");
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [isIntentionalStart, setIsIntentionalStart] = useState(false);
  const [intentionalTask, setIntentionalTask] = useState("");
  const [isBreathing, setIsBreathing] = useState(false);
  const [isSessionLocked, setIsSessionLocked] = useState(false);
  const [showFlowExtend, setShowFlowExtend] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => { localStorage.setItem('nook_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('nook_stats', JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem('nook_journal', JSON.stringify(journalEntries)); }, [journalEntries]);
  useEffect(() => { localStorage.setItem('nook_durations', JSON.stringify(durations)); }, [durations]);
  useEffect(() => { localStorage.setItem('nook_bg_url', bgUrl); }, [bgUrl]);
  useEffect(() => { localStorage.setItem('nook_bg_opacity', bgOpacity.toString()); }, [bgOpacity]);
  useEffect(() => { localStorage.setItem('nook_seeds', seeds.toString()); }, [seeds]);
  useEffect(() => { localStorage.setItem('nook_todoist_token', todoistToken); }, [todoistToken]);
  useEffect(() => { localStorage.setItem('nook_playlists', JSON.stringify(playlists)); }, [playlists]);
  useEffect(() => { localStorage.setItem('nook_bg_presets', JSON.stringify(bgPresets)); }, [bgPresets]);
  useEffect(() => { localStorage.setItem('nook_custom_sounds', JSON.stringify(customSounds)); }, [customSounds]);
  useEffect(() => { localStorage.setItem('nook_allowed_domains', JSON.stringify(allowedDomains)); }, [allowedDomains]);
  useEffect(() => { localStorage.setItem('nook_auto_start', autoStartBreaks); }, [autoStartBreaks]);
  useEffect(() => { localStorage.setItem('nook_interval', longBreakInterval.toString()); }, [longBreakInterval]);
  useEffect(() => { localStorage.setItem('nook_deep_focus', isDeepFocus); }, [isDeepFocus]);
  useEffect(() => { localStorage.setItem('nook_show_percentage', showPercentage); }, [showPercentage]);
  useEffect(() => { localStorage.setItem('nook_daily_goal', dailyGoal.toString()); }, [dailyGoal]);
  useEffect(() => { localStorage.setItem('nook_breathing_duration', breathingDuration.toString()); }, [breathingDuration]);
  useEffect(() => { localStorage.setItem('nook_postcards', JSON.stringify(postcards)); }, [postcards]);

  const getYouTubeId = (url) => { if (!url) return null; const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/); return (m && m[2].length === 11) ? m[2] : null; };
  const renderBackground = () => { const ytId = getYouTubeId(bgUrl); if (ytId) return (<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-screen h-screen overflow-hidden pointer-events-none"><iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&showinfo=0&modestbranding=1&iv_load_policy=3&fs=0&disablekb=1`} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ minWidth: '177.77vh', minHeight: '56.25vw', width: '300%', height: '300%' }} allow="autoplay; encrypted-media" /></div>); else return <img src={bgUrl} alt="Background" className="w-full h-full object-cover" />; };
  const toggleFullscreen = () => { if (!document.fullscreenElement) { containerRef.current.requestFullscreen().catch(err => console.error(err)); setIsMinimalist(true); } else { document.exitFullscreen(); setIsMinimalist(false); } };

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
                  dueDate: t.due ? t.due.date : null, // Mapped Date Correctly
                  estimatedPomos: 1 // Default estimate
              }));
              setTasks(prev => {
                const existingMap = new Map(prev.map(t => [t.id, t]));
                return newTasks.map(nt => existingMap.has(nt.id) ? { ...existingMap.get(nt.id), ...nt } : nt);
              });
          }
      } catch(e){ console.error(e); } finally { setIsSyncing(false); }
  };

  const handleTimerComplete = (mode, isFocusSession) => {
    if (isFocusSession) {
      setShowFlowExtend(true);
      setSeeds(prev => prev + 1);
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const hour = now.getHours();
      setStats(prev => {
        const newHistory = { ...prev.dailyHistory }; newHistory[today] = (newHistory[today] || 0) + durations.focus;
        const newHourly = [...prev.hourlyActivity]; newHourly[hour] += durations.focus;
        let newStreak = prev.streak;
        if (prev.lastActiveDate !== today) { const y = new Date(now); y.setDate(y.getDate() - 1); if (prev.lastActiveDate === y.toISOString().split('T')[0]) newStreak += 1; else if (prev.lastActiveDate !== today) newStreak = 1; }
        const activeTaskCategory = tasks.find(t => t.id === focusedTaskId)?.category || "General";
        const newCategoryDist = { ...prev.categoryDist }; newCategoryDist[activeTaskCategory] = (newCategoryDist[activeTaskCategory] || 0) + durations.focus;
        const totalMins = prev.minutes + durations.focus;
        if (totalMins >= 600 && !postcards.includes("10h_milestone")) { setPostcards(p => [...p, "10h_milestone"]); alert("You earned a new Postcard: 10 Hours of Focus!"); }
        return { ...prev, sessions: prev.sessions + 1, minutes: totalMins, dailyHistory: newHistory, hourlyActivity: newHourly, categoryDist: newCategoryDist, streak: newStreak, lastActiveDate: today };
      });
      if (focusedTaskId) setTasks(prev => prev.map(t => t.id === focusedTaskId ? { ...t, completedPomos: (t.completedPomos || 0) + 1 } : t));
    } else { setStats(prev => ({ ...prev, breaksCompleted: (prev.breaksCompleted || 0) + 1 })); }
  };

  const handleStartClick = () => {
      if (!timer.isActive && timer.mode === 'focus') {
          if (focusedTaskId) { const task = tasks.find(t => t.id === focusedTaskId); setIntentionalTask(task ? task.text : ""); } else { setIntentionalTask(""); }
          setIsIntentionalStart(true);
      } else { timer.startTimer(); }
  };
  const confirmIntent = (customTask) => { setIsIntentionalStart(false); timer.startTimer(); };
  const finishSession = () => { setShowFlowExtend(false); setIsBreathing(true); setTimeout(() => { setIsBreathing(false); timer.finishIntermission('break'); }, breathingDuration * 1000); };
  const extendSession = () => { setShowFlowExtend(false); timer.finishIntermission('extend'); setStats(prev => ({ ...prev, flowExtensions: (prev.flowExtensions || 0) + 1 })); };

  const timerSettings = { durations, flowDuration, intermissionDuration, autoStartBreaks };
  const timer = useTimer(timerSettings, handleTimerComplete);
  const isGlobalTransparencyMode = timer.isActive;

  return (
    <div ref={containerRef} className="h-screen w-screen relative overflow-hidden bg-[#fcfcf7] text-[#594a42] flex flex-col items-center justify-center select-none" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="fixed inset-0 z-0 bg-[#fcfcf7] transition-all duration-1000 overflow-hidden">{renderBackground()}<div className="absolute inset-0 z-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(#78b159 1px, transparent 1px)`, backgroundSize: '30px 30px', opacity: 0.1 }}></div><div className="absolute inset-0 bg-[#fcfcf7] transition-all duration-500 pointer-events-none z-0" style={{ opacity: bgUrl ? bgOpacity : 0.95 }}></div></div>
      <div className={`relative z-20 w-full max-w-[1600px] mx-auto p-4 h-full ${isMinimalist ? 'flex items-center justify-center' : 'grid grid-cols-1 lg:grid-cols-12 gap-6'}`}>
        {!isMinimalist && (<div className="lg:col-span-12 flex justify-between items-center mb-2 h-[10%] min-h-[60px]"><div className="flex items-center gap-3"><div className="bg-white/80 p-3 rounded-2xl shadow-lg border-2 border-[#e6e2d0] rotate-3 backdrop-blur-sm"><Leaf className="text-[#78b159]" size={28} /></div><div><h1 className="text-4xl font-black tracking-tight text-[#594a42] drop-shadow-sm">NookFocus</h1><p className="text-[#8e8070] font-bold text-sm bg-white/50 inline-block px-2 rounded-lg backdrop-blur-sm">Your island office</p></div></div><div className="flex gap-2"><Button variant="neutral" icon={BarChart2} onClick={() => setShowAnalytics(true)}>Stats</Button><Button variant="neutral" icon={SettingsIcon} onClick={() => setShowSettings(true)}>Settings</Button></div></div>)}
        <div className={`flex flex-col gap-6 transition-all duration-500 ${isMinimalist ? 'w-full max-w-2xl scale-110' : 'lg:col-span-7 h-full'}`}>
             <Card transparent={isGlobalTransparencyMode} className="flex-1 flex flex-col items-center justify-center min-h-[350px] relative overflow-hidden group">
                <div className="absolute top-4 right-4 flex gap-2 z-20">
                    {!isMinimalist && (<button onClick={() => setShowJournal(true)} className="p-2 bg-white/50 rounded-xl hover:bg-white text-[#594a42] transition-colors hover:scale-110 active:scale-90" title="Journal"><BookOpen size={20} /></button>)}
                    <button onClick={toggleFullscreen} className="p-2 bg-white/50 rounded-xl hover:bg-white text-[#594a42] transition-colors hover:scale-110 active:scale-90">{isMinimalist ? <Minimize size={20} /> : <Maximize size={20} />}</button>
                </div>
                <TimerDisplay timer={timer} settings={timerSettings} activeTask={tasks.find(t => t.id === focusedTaskId)} showPercentage={showPercentage} onStartClick={handleStartClick} showFlowExtend={showFlowExtend} onExtendSession={extendSession} onFinishSession={finishSession} setMode={timer.setMode}/>
                {!isMinimalist && (<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start w-full mt-4 max-w-xl"><SafeLink onClick={() => setShowMusicModal(true)} isActive={timer.isActive} isDeepFocus={isDeepFocus} allowedDomains={allowedDomains} className="cursor-pointer"><Card transparent={isGlobalTransparencyMode} className="flex items-center gap-4 hover:-translate-y-1 transition-transform p-3"><div className="bg-nook-green/10 p-2 rounded-xl text-[#78b159] font-bold"><Music size={20}/></div><div><span className="font-bold text-sm">Soundscapes</span><p className="text-[10px] opacity-70 font-bold">Mixer & Spotify</p></div></Card></SafeLink><SafeLink href="https://todoist.com" target="_blank" isActive={timer.isActive} isDeepFocus={isDeepFocus} allowedDomains={allowedDomains}><Card transparent={isGlobalTransparencyMode} className="flex items-center gap-4 hover:-translate-y-1 transition-transform p-3"><div className="bg-[#ff6b6b]/10 p-2 rounded-xl text-[#ff6b6b] font-bold"><CheckSquare size={20}/></div><div><span className="font-bold text-sm">Todoist</span><p className="text-[10px] opacity-70 font-bold">{todoistToken ? 'Synced' : 'Open Web'}</p></div></Card></SafeLink></div>)}
             </Card>
        </div>
        {!isMinimalist && (<div className="lg:col-span-5 flex flex-col gap-4 h-full overflow-hidden"><TaskSection tasks={tasks} setTasks={setTasks} focusedTaskId={focusedTaskId} setFocusedTaskId={setFocusedTaskId} todoistToken={todoistToken} setStats={setStats} transparent={isGlobalTransparencyMode} /></div>)}
      </div>

      {isIntentionalStart && (<div className="fixed inset-0 z-[80] flex flex-col items-center justify-center p-8 bg-[#78b159]/95 backdrop-blur-xl animate-pop-in text-white text-center"><div className="max-w-xl w-full"><h2 className="text-3xl sm:text-5xl font-black mb-6 tracking-tight">I am going to...</h2><input type="text" value={intentionalTask} onChange={(e) => setIntentionalTask(e.target.value)} placeholder="Type your task here..." className="w-full bg-white/20 border-b-4 border-white text-white placeholder-white/60 text-2xl sm:text-4xl font-bold py-4 px-2 outline-none mb-12 text-center" autoFocus onKeyDown={(e) => e.key === 'Enter' && confirmIntent(intentionalTask)}/><div className="flex gap-4 justify-center"><Button onClick={() => setIsIntentionalStart(false)} variant="ghost" className="text-white hover:bg-white/20">Cancel</Button><Button onClick={() => confirmIntent(intentionalTask)} variant="secondary" className="px-12 py-4 text-xl shadow-2xl">Commit</Button></div></div></div>)}
      {isBreathing && (<div className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-[#54a0ff]/90 backdrop-blur-xl animate-pop-in text-white pointer-events-none"><div className="w-64 h-64 border-4 border-white/30 rounded-full flex items-center justify-center relative"><div className="w-full h-full bg-white/20 rounded-full absolute animate-breathe"></div><span className="relative z-10 text-2xl font-black tracking-widest uppercase">Breathe</span></div><p className="mt-8 font-bold opacity-80">Resetting focus...</p></div>)}
      {isSessionLocked && (<div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-pop-in"><div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full border-4 border-[#ff6b6b] text-center"><div className="w-16 h-16 bg-[#fff0f0] rounded-full flex items-center justify-center mx-auto mb-4"><Lock size={32} className="text-[#ff6b6b]" /></div><h2 className="text-2xl font-black text-[#594a42] mb-2">Session Locked!</h2><p className="text-[#8e8070] font-bold text-sm mb-6">Complete your task to unlock.</p><Button className="w-full" onClick={() => setIsSessionLocked(false)}>Dismiss</Button></div></div>)}
      {showBlockedModal && (<div className="fixed top-8 left-1/2 -translate-x-1/2 z-[70] bg-[#ff6b6b] text-white px-6 py-3 rounded-full shadow-xl animate-pop-in flex items-center gap-3"><ShieldAlert size={20} /><span className="font-bold">Focus Mode: Navigation Blocked</span><button onClick={() => setShowBlockedModal(false)}><X size={16}/></button></div>)}
      
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} settings={{ durations, setDurations, dailyGoal, setDailyGoal, breathingDuration, setBreathingDuration, autoStartBreaks, setAutoStartBreaks, longBreakInterval, setLongBreakInterval, isDeepFocus, setIsDeepFocus, showPercentage, setShowPercentage, allowedDomains, setAllowedDomains, bgUrl, setBgUrl, bgOpacity, setBgOpacity, bgPresets, setBgPresets, todoistToken, setTodoistToken, playlists, setPlaylists, customSounds, setCustomSounds }} syncTasks={fetchTodoistTasks} isSyncing={isSyncing} exportData={() => ({ tasks, stats, journalEntries, durations, bgUrl, playlists, bgPresets, allowedDomains, seeds, customSounds, dailyGoal, breathingDuration })} importData={(data) => { if(data.tasks) setTasks(data.tasks); if(data.stats) setStats(data.stats); if(data.bgUrl) setBgUrl(data.bgUrl); }} />}
      {showAnalytics && <AnalyticsModal onClose={() => setShowAnalytics(false)} stats={stats} seeds={seeds} dailyGoal={dailyGoal} />}
      {showMusicModal && <MusicModal onClose={() => setShowMusicModal(false)} playlists={playlists} customSounds={customSounds} />}
      {showJournal && <JournalModal onClose={() => setShowJournal(false)} entries={journalEntries} setEntries={setJournalEntries} />}
    </div>
  );
}
export default App;