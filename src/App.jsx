import React, { useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { SettingsProvider } from './context/SettingsContext';
import { MediaProvider, useMedia } from './context/MediaContext';
import { TaskProvider } from './context/TaskContext';
import { StatsProvider } from './context/StatsContext';
import { JournalProvider } from './context/JournalContext';
import { TimerProvider, useTimerContext } from './context/TimerContext';

import { BarChart2, BookOpen, Minimize, Maximize, Leaf, Music, CheckSquare, Settings } from 'lucide-react';

import TimerDisplay from './components/Timer/TimerDisplay';
import TaskSection from './components/Tasks/TaskSection';
import SettingsModal from './components/Settings/SettingsModal';
import AnalyticsModal from './components/Stats/AnalyticsModal';
import MusicModal from './components/Audio/MusicModal';
import JournalModal from './components/Journal/JournalModal';
import Button from './components/UI/Button';
import Card from './components/UI/Card';
import SafeLink from './components/UI/SafeLink';

const MainLayout = () => {
    const { bgUrl, bgOpacity } = useMedia();
    const { timer } = useTimerContext();
    const [isMinimalist, setIsMinimalist] = useState(false);
    const [activeModal, setActiveModal] = useState(null); 
    const containerRef = useRef(null);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) { 
            containerRef.current.requestFullscreen().catch(err => console.error(err)); 
            setIsMinimalist(true); 
        } else { 
            document.exitFullscreen(); 
            setIsMinimalist(false); 
        }
    };

    const getYouTubeId = (url) => { 
        if (!url) return null; 
        const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/); 
        return (m && m[2].length === 11) ? m[2] : null; 
    };

    const renderBackground = () => { 
        const ytId = getYouTubeId(bgUrl); 
        if (ytId) return (<div className="absolute inset-0 pointer-events-none scale-125"><iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&showinfo=0&modestbranding=1&iv_load_policy=3&fs=0&disablekb=1`} className="w-full h-full object-cover" allow="autoplay; encrypted-media" /></div>); 
        return <img src={bgUrl} alt="Background" className="w-full h-full object-cover transition-opacity duration-700" />; 
    };

    return (
        <div ref={containerRef} className="h-screen w-screen relative overflow-hidden bg-[#fcfcf7] text-[#594a42] flex flex-col items-center justify-center select-none" style={{ fontFamily: "'Nunito', sans-serif" }}>
            <div className="fixed inset-0 z-0 bg-[#fcfcf7]">
                {renderBackground()}
                <div className="absolute inset-0 z-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(#78b159 1px, transparent 1px)`, backgroundSize: '30px 30px', opacity: 0.1 }}></div>
                <div className="absolute inset-0 bg-[#fcfcf7] transition-all duration-700 pointer-events-none z-0 mix-blend-overlay" style={{ opacity: bgUrl ? bgOpacity : 1 }}></div>
                <div className="absolute inset-0 bg-[#fffdf5] transition-all duration-700 pointer-events-none z-0" style={{ opacity: bgUrl ? Math.max(0, 0.9 - bgOpacity) : 1 }}></div>
            </div>
            
            <div className={`relative z-20 w-full max-w-[1600px] mx-auto p-4 h-full transition-all duration-500 ${isMinimalist ? 'flex items-center justify-center' : 'grid grid-cols-1 lg:grid-cols-12 gap-6'}`}>
                
                {!isMinimalist && (
                    <div className="lg:col-span-12 flex justify-between items-center mb-2 h-[10%] min-h-[60px]">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/90 p-3 rounded-2xl shadow-lg border-b-4 border-[#e6e2d0] -rotate-2 backdrop-blur-md">
                                <Leaf className="text-[#78b159]" size={32} fill="currentColor" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black tracking-tight text-[#594a42] drop-shadow-sm leading-none">NookFocus</h1>
                                <p className="text-[#8e8070] font-bold text-sm bg-white/60 inline-block px-3 py-0.5 rounded-full mt-1 backdrop-blur-sm">Your island office</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="neutral" icon={BarChart2} onClick={() => setActiveModal('analytics')}>Stats</Button>
                            <Button variant="neutral" icon={Settings} onClick={() => setActiveModal('settings')}>Settings</Button>
                        </div>
                    </div>
                )}
                
                <div className={`flex flex-col gap-6 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${isMinimalist ? 'w-full max-w-xl scale-110' : 'lg:col-span-7 h-full'}`}>
                    <Card transparent={timer.isActive} className="flex-1 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden group">
                        <div className="absolute top-6 right-6 flex gap-3 z-30">
                            {!isMinimalist && (<button onClick={() => setActiveModal('journal')} className="p-3 bg-white/50 rounded-2xl hover:bg-white text-[#594a42] transition-all hover:scale-110 active:scale-95 shadow-sm" title="Journal"><BookOpen size={20} /></button>)}
                            <button onClick={toggleFullscreen} className="p-3 bg-white/50 rounded-2xl hover:bg-white text-[#594a42] transition-all hover:scale-110 active:scale-95 shadow-sm">{isMinimalist ? <Minimize size={20} /> : <Maximize size={20} />}</button>
                        </div>
                        
                        <TimerDisplay />
                        
                        {/* RESTORED: Soundscapes and Todoist buttons */}
                        {!isMinimalist && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center w-full mt-4 max-w-xl px-4 z-20">
                                <SafeLink onClick={() => setActiveModal('music')} className="cursor-pointer">
                                    <div className="bg-white/60 hover:bg-white/90 backdrop-blur-sm p-3 rounded-3xl border-2 border-white/50 flex items-center gap-3 transition-all hover:-translate-y-1 hover:shadow-lg group">
                                        <div className="bg-[#78b159]/20 p-2.5 rounded-2xl text-[#78b159] group-hover:scale-110 transition-transform"><Music size={20} strokeWidth={2.5}/></div>
                                        <div><span className="font-black text-[#594a42] text-sm">Soundscapes</span><p className="text-[10px] font-bold text-[#8e8070]">Mixer & Spotify</p></div>
                                    </div>
                                </SafeLink>
                                <SafeLink href="https://todoist.com" target="_blank">
                                    <div className="bg-white/60 hover:bg-white/90 backdrop-blur-sm p-3 rounded-3xl border-2 border-white/50 flex items-center gap-3 transition-all hover:-translate-y-1 hover:shadow-lg group">
                                        <div className="bg-[#ff6b6b]/20 p-2.5 rounded-2xl text-[#ff6b6b] group-hover:scale-110 transition-transform"><CheckSquare size={20} strokeWidth={2.5}/></div>
                                        <div><span className="font-black text-[#594a42] text-sm">Todoist</span><p className="text-[10px] font-bold text-[#8e8070]">Open Web</p></div>
                                    </div>
                                </SafeLink>
                            </div>
                        )}
                    </Card>
                </div>

                {!isMinimalist && (
                    <div className="lg:col-span-5 flex flex-col gap-4 h-full overflow-hidden">
                        <TaskSection transparent={timer.isActive} />
                    </div>
                )}
            </div>

            <AnimatePresence>
                {activeModal === 'settings' && <SettingsModal onClose={() => setActiveModal(null)} />}
                {activeModal === 'analytics' && <AnalyticsModal onClose={() => setActiveModal(null)} />}
                {activeModal === 'music' && <MusicModal onClose={() => setActiveModal(null)} />}
                {activeModal === 'journal' && <JournalModal onClose={() => setActiveModal(null)} />}
            </AnimatePresence>
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