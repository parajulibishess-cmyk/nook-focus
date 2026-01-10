import React, { useState, useRef, memo, Suspense, useEffect } from 'react'; // Added useEffect
import { AnimatePresence, motion } from 'framer-motion';
import { SettingsProvider } from './context/SettingsContext';
import { MediaProvider, useMedia } from './context/MediaContext';
import { TaskProvider } from './context/TaskContext';
import { StatsProvider } from './context/StatsContext';
import { JournalProvider } from './context/JournalContext';
import { TimerProvider, useTimerContext } from './context/TimerContext';

import { BarChart2, BookOpen, Minimize, Maximize, Leaf, Settings, Minus, Square, X } from 'lucide-react';

import TimerDisplay from './components/Timer/TimerDisplay';
import TaskSection from './components/Tasks/TaskSection';
import Button from './components/UI/Button';
import Card from './components/UI/Card';

const SettingsModal = React.lazy(() => import('./components/Settings/SettingsModal'));
const AnalyticsModal = React.lazy(() => import('./components/Stats/AnalyticsModal'));
const MusicModal = React.lazy(() => import('./components/Audio/MusicModal'));
const JournalModal = React.lazy(() => import('./components/Journal/JournalModal'));

const ModalLoader = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
        <div className="w-12 h-12 border-4 border-[#78b159] border-t-transparent rounded-full animate-spin"></div>
    </div>
);

const BackgroundLayers = memo(({ bgUrl, bgOpacity }) => {
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
        <div className="fixed inset-0 z-0 bg-[#fcfcf7]">
            {renderBackground()}
            <div className="absolute inset-0 z-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(#78b159 2px, transparent 2px)`, backgroundSize: '40px 40px', opacity: 0.15 }}></div>
            <div className="absolute inset-0 bg-[#fcfcf7] transition-all duration-700 pointer-events-none z-0 mix-blend-overlay" style={{ opacity: bgUrl ? bgOpacity : 1 }}></div>
            <div className="absolute inset-0 bg-[#fffdf5]/40 backdrop-blur-[2px] transition-all duration-700 pointer-events-none z-0" style={{ opacity: bgUrl ? Math.max(0, 0.8 - bgOpacity) : 1 }}></div>
        </div>
    );
});

const TopBar = memo(({ onOpenSettings, onOpenStats }) => (
    <div className="lg:col-span-12 flex justify-between items-center mb-2 h-[10%] min-h-[70px]">
        <motion.div 
            initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-5"
        >
            <div className="bg-white/90 p-3.5 rounded-3xl shadow-sm border-2 border-white/50 -rotate-3 backdrop-blur-md">
                <Leaf className="text-[#78b159]" size={36} fill="currentColor" />
            </div>
            <div>
                <h1 className="text-5xl font-black tracking-tight text-[#594a42] drop-shadow-sm leading-none">NookFocus</h1>
                <p className="text-[#8e8070] font-bold text-sm bg-white/60 inline-block px-4 py-1 rounded-full mt-1.5 backdrop-blur-sm shadow-sm">Your island office</p>
            </div>
        </motion.div>
        <motion.div 
            initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            className="flex gap-4"
        >
            <Button variant="neutral" icon={BarChart2} onClick={onOpenStats}>Stats</Button>
            <Button variant="neutral" icon={Settings} onClick={onOpenSettings}>Settings</Button>
        </motion.div>
    </div>
));

// UPDATED: Window Controls accepts props to handle visibility and alignment
const WindowControls = ({ isMaximized, isAltPressed }) => {
    // 1. If Maximized AND Alt is NOT pressed: Hide completely
    if (isMaximized && !isAltPressed) return null;

    // 2. Alignment logic: Center if maximized, Right if normal
    const alignmentClass = isMaximized ? 'justify-center' : 'justify-end';

    return (
        <div className={`fixed top-0 left-0 right-0 h-10 flex items-start z-50 p-2 ${alignmentClass}`} style={{ WebkitAppRegion: 'drag' }}>
            <div className="flex gap-2 p-1 bg-white/50 backdrop-blur-sm rounded-lg border border-white/40 shadow-sm" style={{ WebkitAppRegion: 'no-drag' }}>
                <button 
                    onClick={() => window.electronAPI?.minimize()} 
                    className="p-1 hover:bg-black/5 rounded-md text-[#594a42] transition-colors"
                    title="Minimize"
                >
                    <Minus size={16} strokeWidth={3} />
                </button>
                <button 
                    onClick={() => window.electronAPI?.maximize()} 
                    className="p-1 hover:bg-black/5 rounded-md text-[#594a42] transition-colors"
                    title="Maximize"
                >
                    <Square size={14} strokeWidth={3} />
                </button>
                <button 
                    onClick={() => window.electronAPI?.close()} 
                    className="p-1 hover:bg-red-500 hover:text-white rounded-md text-[#594a42] transition-colors"
                    title="Close"
                >
                    <X size={16} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
};

const MainLayout = () => {
    const { bgUrl, bgOpacity } = useMedia();
    const { timer } = useTimerContext();
    const [isMinimalist, setIsMinimalist] = useState(false);
    const [activeModal, setActiveModal] = useState(null); 
    const containerRef = useRef(null);

    // NEW STATES: Track Alt key and Maximize state
    const [isAltPressed, setIsAltPressed] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);

    // Effect to handle Alt key and Window State listeners
    useEffect(() => {
        const handleKeyDown = (e) => { if (e.key === 'Alt') setIsAltPressed(true); };
        const handleKeyUp = (e) => { if (e.key === 'Alt') setIsAltPressed(false); };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Listen for Electron window state changes
        if (window.electronAPI) {
            window.electronAPI.onMaximized(() => setIsMaximized(true));
            window.electronAPI.onUnmaximized(() => setIsMaximized(false));
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) { 
            containerRef.current.requestFullscreen().catch(err => console.error(err)); 
            setIsMinimalist(true); 
        } else { 
            document.exitFullscreen(); 
            setIsMinimalist(false); 
        }
    };

    return (
        <div ref={containerRef} className="h-screen w-screen relative overflow-hidden bg-[#fcfcf7] text-[#594a42] flex flex-col items-center justify-center select-none" style={{ fontFamily: "'Nunito', sans-serif" }}>
            
            {/* Pass state to WindowControls */}
            <WindowControls isMaximized={isMaximized} isAltPressed={isAltPressed} />
            
            <BackgroundLayers bgUrl={bgUrl} bgOpacity={bgOpacity} />
            
            <div className={`relative z-20 w-full max-w-[1600px] mx-auto p-6 h-full transition-all duration-700 ${isMinimalist ? 'flex items-center justify-center' : 'grid grid-cols-1 lg:grid-cols-12 gap-8'}`}>
                
                {!isMinimalist && <TopBar onOpenStats={() => setActiveModal('analytics')} onOpenSettings={() => setActiveModal('settings')} />}
                
                <div className={`flex flex-col gap-6 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${isMinimalist ? 'w-full max-w-xl scale-110' : 'lg:col-span-7 h-full'}`}>
                    <Card transparent={timer.isActive} className="flex-1 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden group shadow-2xl border-4 border-white/60">
                        <div className="absolute top-8 right-8 flex gap-3 z-30">
                            {!isMinimalist && (<button onClick={() => setActiveModal('journal')} className="p-3.5 bg-white/60 rounded-2xl hover:bg-white text-[#594a42] transition-all hover:scale-110 active:scale-95 shadow-sm border-2 border-white/40" title="Journal"><BookOpen size={22} /></button>)}
                            <button onClick={toggleFullscreen} className="p-3.5 bg-white/60 rounded-2xl hover:bg-white text-[#594a42] transition-all hover:scale-110 active:scale-95 shadow-sm border-2 border-white/40">{isMinimalist ? <Minimize size={22} /> : <Maximize size={22} />}</button>
                        </div>
                        
                        <TimerDisplay 
                            isMinimalist={isMinimalist} 
                            onOpenModal={setActiveModal} 
                        />
                    </Card>
                </div>

                {!isMinimalist && (
                    <div className="lg:col-span-5 flex flex-col gap-4 h-full overflow-hidden">
                        <TaskSection transparent={timer.isActive} />
                    </div>
                )}
            </div>

            <Suspense fallback={<ModalLoader />}>
                <AnimatePresence>
                    {activeModal === 'settings' && <SettingsModal onClose={() => setActiveModal(null)} />}
                    {activeModal === 'analytics' && <AnalyticsModal onClose={() => setActiveModal(null)} />}
                    {activeModal === 'music' && <MusicModal onClose={() => setActiveModal(null)} />}
                    {activeModal === 'journal' && <JournalModal onClose={() => setActiveModal(null)} />}
                </AnimatePresence>
            </Suspense>
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