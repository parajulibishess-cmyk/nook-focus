import React, { useState, useRef } from 'react';
import { SettingsProvider } from './context/SettingsContext';
import { MediaProvider, useMedia } from './context/MediaContext';
import { TaskProvider } from './context/TaskContext';
import { StatsProvider } from './context/StatsContext';
import { JournalProvider } from './context/JournalContext';
import { TimerProvider, useTimerContext } from './context/TimerContext';

import { BarChart2, BookOpen, Minimize, Maximize, Leaf, Music, CheckSquare, ShieldAlert, Lock, X, Settings, Cloud } from 'lucide-react';

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

    // YouTube background handler
    const getYouTubeId = (url) => { if (!url) return null; const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/); return (m && m[2].length === 11) ? m[2] : null; };
    
    const renderBackground = () => { 
        const ytId = getYouTubeId(bgUrl); 
        if (ytId) return (<div className="absolute inset-0 pointer-events-none"><iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&showinfo=0&modestbranding=1&iv_load_policy=3&fs=0&disablekb=1`} className="w-full h-full scale-[1.5] pointer-events-none object-cover" allow="autoplay; encrypted-media" /></div>); 
        return <img src={bgUrl} alt="Background" className="w-full h-full object-cover transition-opacity duration-700" />; 
    };

    return (
        <div ref={containerRef} className="h-screen w-screen relative overflow-hidden bg-[#87CEEB] text-[#594a42] flex flex-col items-center justify-center select-none font-nunito">
            
            {/* --- Dynamic Background Layer --- */}
            <div className="fixed inset-0 z-0 bg-[#fcfcf7] transition-all duration-1000">
                {renderBackground()}
                {/* Overlay pattern for texture */}
                <div className="absolute inset-0 z-10 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>
                {/* Opacity Mask */}
                <div className="absolute inset-0 bg-[#fcfcf7] transition-all duration-500 pointer-events-none z-20" style={{ opacity: bgUrl ? bgOpacity : 1 }}></div>
            </div>

            {/* --- Floating Elements (Clouds) --- */}
            <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden opacity-50">
                <Cloud className="absolute top-10 left-[10%] text-white w-24 h-24 animate-float opacity-80" style={{ animationDuration: '8s' }} />
                <Cloud className="absolute top-32 right-[20%] text-white w-16 h-16 animate-float opacity-60" style={{ animationDuration: '12s', animationDelay: '2s' }} />
                <Cloud className="absolute bottom-20 left-[15%] text-white w-32 h-32 animate-float opacity-40" style={{ animationDuration: '15s', animationDelay: '1s' }} />
            </div>

            {/* --- Main Grid --- */}
            <div className={`relative z-30 w-full max-w-[1600px] mx-auto p-6 h-full transition-all duration-700 ${isMinimalist ? 'flex items-center justify-center' : 'grid grid-cols-1 lg:grid-cols-12 gap-8'}`}>
                
                {/* Header */}
                {!isMinimalist && (
                    <div className="lg:col-span-12 flex justify-between items-center h-[80px] animate-slide-up">
                        <div className="flex items-center gap-4 group">
                            <div className="bg-white p-3 rounded-3xl shadow-lg border-4 border-[#e6e2d0] -rotate-6 group-hover:rotate-6 transition-transform duration-300">
                                <Leaf className="text-[#78b159]" size={32} fill="currentColor" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black tracking-tighter text-[#594a42] drop-shadow-sm">NookFocus</h1>
                                <p className="text-[#8e8070] font-bold text-sm bg-white/60 px-3 py-1 rounded-full backdrop-blur-sm inline-block">
                                    Your island office
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="neutral" icon={BarChart2} onClick={() => toggleModal('analytics')} className="shadow-sm hover:shadow-md">Stats</Button>
                            <Button variant="neutral" icon={Settings} onClick={() => toggleModal('settings')} className="shadow-sm hover:shadow-md">Settings</Button>
                        </div>
                    </div>
                )}
                
                {/* Timer Column */}
                <div className={`flex flex-col gap-6 transition-all duration-700 ${isMinimalist ? 'w-full max-w-2xl scale-110' : 'lg:col-span-7 h-full'}`}>
                    <Card transparent={timer.isActive} className="flex-1 flex flex-col items-center justify-center min-h-[400px] relative group hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-shadow duration-500">
                        {/* Control Corner */}
                        <div className="absolute top-6 right-6 flex gap-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {!isMinimalist && (
                                <button onClick={() => toggleModal('journal')} className="p-3 bg-white rounded-2xl border-2 border-[#e6e2d0] text-[#594a42] hover:scale-110 active:scale-95 transition-all shadow-sm" title="Journal">
                                    <BookOpen size={20} />
                                </button>
                            )}
                            <button onClick={toggleFullscreen} className="p-3 bg-white rounded-2xl border-2 border-[#e6e2d0] text-[#594a42] hover:scale-110 active:scale-95 transition-all shadow-sm">
                                {isMinimalist ? <Minimize size={20} /> : <Maximize size={20} />}
                            </button>
                        </div>

                        <TimerDisplay />

                        {/* Quick Links */}
                        {!isMinimalist && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full px-12 mt-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                                <SafeLink onClick={() => toggleModal('music')} className="cursor-pointer group/card">
                                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl border-2 border-[#f1f2f6] flex items-center gap-4 hover:border-[#78b159] hover:-translate-y-1 transition-all shadow-sm group-hover/card:shadow-md">
                                        <div className="bg-[#78b159]/20 p-3 rounded-2xl text-[#5a8a3f] group-hover/card:scale-110 transition-transform"><Music size={24} strokeWidth={3}/></div>
                                        <div><span className="font-extrabold text-[#594a42]">Soundscapes</span><p className="text-xs font-bold text-[#a4b0be]">Mixer & Spotify</p></div>
                                    </div>
                                </SafeLink>
                                <SafeLink href="https://todoist.com" target="_blank" className="cursor-pointer group/card">
                                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl border-2 border-[#f1f2f6] flex items-center gap-4 hover:border-[#ff6b6b] hover:-translate-y-1 transition-all shadow-sm group-hover/card:shadow-md">
                                        <div className="bg-[#ff6b6b]/20 p-3 rounded-2xl text-[#d63031] group-hover/card:scale-110 transition-transform"><CheckSquare size={24} strokeWidth={3}/></div>
                                        <div><span className="font-extrabold text-[#594a42]">Todoist Web</span><p className="text-xs font-bold text-[#a4b0be]">Open in Browser</p></div>
                                    </div>
                                </SafeLink>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Tasks Column */}
                {!isMinimalist && (
                    <div className="lg:col-span-5 flex flex-col h-full animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <TaskSection transparent={timer.isActive} />
                    </div>
                )}
            </div>

            {/* Modals */}
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