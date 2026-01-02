import React, { useState, useRef } from 'react';
import { SettingsProvider } from './context/SettingsContext';
import { MediaProvider, useMedia } from './context/MediaContext';
import { TaskProvider } from './context/TaskContext';
import { StatsProvider } from './context/StatsContext';
import { JournalProvider } from './context/JournalContext';
import { TimerProvider, useTimerContext } from './context/TimerContext';

// FIX: Added 'Settings' to the import list below
import { BarChart2, BookOpen, Minimize, Maximize, Leaf, Music, CheckSquare, ShieldAlert, Lock, X, Settings } from 'lucide-react';

import TimerDisplay from './components/Timer/TimerDisplay';
import TaskSection from './components/Tasks/TaskSection';
import SettingsModal from './components/Settings/SettingsModal';
import AnalyticsModal from './components/Stats/AnalyticsModal';
import MusicModal from './components/Audio/MusicModal';
import JournalModal from './components/Journal/JournalModal';
import Button from './components/UI/Button';
import Card from './components/UI/Card';
import SafeLink from './components/UI/SafeLink';

// Helper component to consume contexts for the Layout
const MainLayout = () => {
    const { bgUrl, bgOpacity } = useMedia();
    const { timer } = useTimerContext();
    const [isMinimalist, setIsMinimalist] = useState(false);
    const [modals, setModals] = useState({ settings: false, analytics: false, journal: false, music: false });
    const containerRef = useRef(null);

    const toggleModal = (name) => setModals(prev => ({ ...prev, [name]: !prev[name] }));
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) { 
            containerRef.current.requestFullscreen().catch(err => console.error(err)); 
            setIsMinimalist(true); 
        } else { 
            document.exitFullscreen(); 
            setIsMinimalist(false); 
        }
    };

    const getYouTubeId = (url) => { if (!url) return null; const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/); return (m && m[2].length === 11) ? m[2] : null; };
    const renderBackground = () => { 
        const ytId = getYouTubeId(bgUrl); 
        if (ytId) return (<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-screen h-screen overflow-hidden pointer-events-none"><iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&showinfo=0&modestbranding=1&iv_load_policy=3&fs=0&disablekb=1`} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ minWidth: '177.77vh', minHeight: '56.25vw', width: '300%', height: '300%' }} allow="autoplay; encrypted-media" /></div>); 
        return <img src={bgUrl} alt="Background" className="w-full h-full object-cover" />; 
    };

    return (
        <div ref={containerRef} className="h-screen w-screen relative overflow-hidden bg-[#fcfcf7] text-[#594a42] flex flex-col items-center justify-center select-none" style={{ fontFamily: "'Nunito', sans-serif" }}>
            <div className="fixed inset-0 z-0 bg-[#fcfcf7] transition-all duration-1000 overflow-hidden">{renderBackground()}<div className="absolute inset-0 z-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(#78b159 1px, transparent 1px)`, backgroundSize: '30px 30px', opacity: 0.1 }}></div><div className="absolute inset-0 bg-[#fcfcf7] transition-all duration-500 pointer-events-none z-0" style={{ opacity: bgUrl ? bgOpacity : 0.95 }}></div></div>
            
            <div className={`relative z-20 w-full max-w-[1600px] mx-auto p-4 h-full ${isMinimalist ? 'flex items-center justify-center' : 'grid grid-cols-1 lg:grid-cols-12 gap-6'}`}>
                {!isMinimalist && (
                    <div className="lg:col-span-12 flex justify-between items-center mb-2 h-[10%] min-h-[60px]">
                        <div className="flex items-center gap-3"><div className="bg-white/80 p-3 rounded-2xl shadow-lg border-2 border-[#e6e2d0] rotate-3 backdrop-blur-sm"><Leaf className="text-[#78b159]" size={28} /></div><div><h1 className="text-4xl font-black tracking-tight text-[#594a42] drop-shadow-sm">NookFocus</h1><p className="text-[#8e8070] font-bold text-sm bg-white/50 inline-block px-2 rounded-lg backdrop-blur-sm">Your island office</p></div></div>
                        <div className="flex gap-2"><Button variant="neutral" icon={BarChart2} onClick={() => toggleModal('analytics')}>Stats</Button><Button variant="neutral" icon={Settings} onClick={() => toggleModal('settings')}>Settings</Button></div>
                    </div>
                )}
                
                <div className={`flex flex-col gap-6 transition-all duration-500 ${isMinimalist ? 'w-full max-w-2xl scale-110' : 'lg:col-span-7 h-full'}`}>
                    <Card transparent={timer.isActive} className="flex-1 flex flex-col items-center justify-center min-h-[350px] relative overflow-hidden group">
                        <div className="absolute top-4 right-4 flex gap-2 z-20">
                            {!isMinimalist && (<button onClick={() => toggleModal('journal')} className="p-2 bg-white/50 rounded-xl hover:bg-white text-[#594a42] transition-colors hover:scale-110 active:scale-90" title="Journal"><BookOpen size={20} /></button>)}
                            <button onClick={toggleFullscreen} className="p-2 bg-white/50 rounded-xl hover:bg-white text-[#594a42] transition-colors hover:scale-110 active:scale-90">{isMinimalist ? <Minimize size={20} /> : <Maximize size={20} />}</button>
                        </div>
                        <TimerDisplay />
                        {!isMinimalist && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start w-full mt-4 max-w-xl">
                                <SafeLink onClick={() => toggleModal('music')} className="cursor-pointer">
                                    <Card transparent={timer.isActive} className="flex items-center gap-4 hover:-translate-y-1 transition-transform p-3">
                                        <div className="bg-nook-green/10 p-2 rounded-xl text-[#78b159] font-bold"><Music size={20}/></div>
                                        <div><span className="font-bold text-sm">Soundscapes</span><p className="text-[10px] opacity-70 font-bold">Mixer & Spotify</p></div>
                                    </Card>
                                </SafeLink>
                                <SafeLink href="https://todoist.com" target="_blank">
                                    <Card transparent={timer.isActive} className="flex items-center gap-4 hover:-translate-y-1 transition-transform p-3">
                                        <div className="bg-[#ff6b6b]/10 p-2 rounded-xl text-[#ff6b6b] font-bold"><CheckSquare size={20}/></div>
                                        <div><span className="font-bold text-sm">Todoist</span><p className="text-[10px] opacity-70 font-bold">Open Web</p></div>
                                    </Card>
                                </SafeLink>
                            </div>
                        )}
                    </Card>
                </div>
                {!isMinimalist && (<div className="lg:col-span-5 flex flex-col gap-4 h-full overflow-hidden"><TaskSection transparent={timer.isActive} /></div>)}
            </div>

            {modals.settings && <SettingsModal onClose={() => toggleModal('settings')} />}
            {modals.analytics && <AnalyticsModal onClose={() => toggleModal('analytics')} />}
            {modals.music && <MusicModal onClose={() => toggleModal('music')} />}
            {modals.journal && <JournalModal onClose={() => toggleModal('journal')} />}
        </div>
    );
};

function App() {
  return (
    <SettingsProvider>
        <StatsProvider>
            <TaskProvider>
                <MediaProvider>
                    <JournalProvider>
                        <TimerProvider>
                            <MainLayout />
                        </TimerProvider>
                    </JournalProvider>
                </MediaProvider>
            </TaskProvider>
        </StatsProvider>
    </SettingsProvider>
  );
}
export default App;