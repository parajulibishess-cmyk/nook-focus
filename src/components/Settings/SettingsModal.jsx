import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../../context/SettingsContext';
import { useMedia } from '../../context/MediaContext';
import { useTasks } from '../../context/TaskContext';
import { X, Clock, Zap, ImageIcon, RefreshCw, Upload, Download, Trash2, ShieldAlert, Percent, Target, Music, Plus, Check, Volume2 } from 'lucide-react';
import Button from '../UI/Button';
import { twMerge } from 'tailwind-merge';

// Helper: Buffered Input to prevent re-render storms while typing
const BufferedInput = ({ value, onCommit, className, type = "text", ...props }) => {
    const [localValue, setLocalValue] = useState(value);
    
    // Sync local state if external prop changes significantly
    useEffect(() => { setLocalValue(value); }, [value]);

    const handleBlur = () => {
        if (localValue !== value) {
            onCommit(localValue);
        }
    };

    return (
        <input 
            type={type}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
            className={className}
            {...props}
        />
    );
};

const Toggle = ({ label, checked, onChange, icon: Icon, color = "bg-[#78b159]" }) => (
    <div className="flex items-center justify-between bg-white/60 p-4 rounded-2xl border-2 border-white/50">
        <div className="flex items-center gap-3">
            {Icon && <div className={`p-2 rounded-xl text-white ${color.replace('bg-', 'bg-opacity-90 bg-')}`}><Icon size={18} /></div>}
            <span className="font-bold text-[#594a42]">{label}</span>
        </div>
        <button 
            onClick={() => onChange(!checked)}
            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${checked ? color : 'bg-[#e6e2d0]'}`}
        >
            <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
    </div>
);

const SettingsModal = ({ onClose }) => {
  const { 
    durations, setDurations, dailyGoal, setDailyGoal, breathingDuration, setBreathingDuration,
    autoStartBreaks, setAutoStartBreaks, longBreakInterval, setLongBreakInterval,
    isDeepFocus, setIsDeepFocus, showPercentage, setShowPercentage, allowedDomains, setAllowedDomains
  } = useSettings();

  const { bgUrl, setBgUrl, bgOpacity, setBgOpacity, bgPresets, setBgPresets, playlists, setPlaylists, customSounds, setCustomSounds } = useMedia();
  const { todoistToken, setTodoistToken, fetchTodoistTasks, isSyncing } = useTasks();

  const [activeTab, setActiveTab] = useState('timer');
  const [newAllowedDomain, setNewAllowedDomain] = useState("");
  const [newBgName, setNewBgName] = useState("");
  const [newBgUrl, setNewBgUrl] = useState("");
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistUrl, setNewPlaylistUrl] = useState("");
  const [newSoundName, setNewSoundName] = useState("");
  const [newSoundUrl, setNewSoundUrl] = useState("");
  const fileInputRef = useRef(null);

  const handleAddDomain = () => { if(newAllowedDomain) { setAllowedDomains([...allowedDomains, newAllowedDomain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]]); setNewAllowedDomain(""); }};
  const handleRemoveDomain = (d) => setAllowedDomains(allowedDomains.filter(x => x !== d));
  const handleAddBackground = () => { if(newBgName && newBgUrl) { setBgPresets([...bgPresets, { name: newBgName, url: newBgUrl, type: 'image', isCustom: true }]); setNewBgName(""); setNewBgUrl(""); }};
  const handleRemoveBackground = (url) => setBgPresets(bgPresets.filter(p => p.url !== url));
  const handleAddPlaylist = () => { if(newPlaylistName && newPlaylistUrl) { setPlaylists([...playlists, { id: Date.now(), name: newPlaylistName, url: newPlaylistUrl }]); setNewPlaylistName(""); setNewPlaylistUrl(""); }};
  const handleRemovePlaylist = (id) => setPlaylists(playlists.filter(p => p.id !== id));
  const handleAddSound = () => { if(newSoundName && newSoundUrl) { setCustomSounds([...customSounds, { name: newSoundName, url: newSoundUrl }]); setNewSoundName(""); setNewSoundUrl(""); }};
  const handleRemoveSound = (name) => setCustomSounds(customSounds.filter(s => s.name !== name));

  const handleDurationChange = (key, val) => {
      const numVal = parseInt(val) || 0;
      setDurations(prev => ({ ...prev, [key]: numVal }));
  };

  const handleImport = (e) => { 
      const file = e.target.files[0]; 
      if (!file) return; 
      const reader = new FileReader(); 
      reader.onload = (ev) => { 
          try { 
              const data = JSON.parse(ev.target.result);
              if(data.durations) setDurations(data.durations);
              if(data.bgPresets) setBgPresets(data.bgPresets);
              if(data.customSounds) setCustomSounds(data.customSounds);
              alert("Import Successful!"); 
          } catch(err) { alert("Invalid file"); } 
      }; 
      reader.readAsText(file); 
  };
  
  const handleExport = () => { 
      const data = { durations, bgPresets, playlists, allowedDomains, customSounds };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }); 
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); 
      a.download = `nookfocus_backup_${new Date().toISOString().slice(0,10)}.json`; a.click(); 
  };

  const tabs = [
      { id: 'timer', label: 'Timer & Focus', icon: Clock, color: 'text-[#78b159]' },
      { id: 'visuals', label: 'Atmosphere', icon: ImageIcon, color: 'text-[#fdcb58]' },
      { id: 'integrations', label: 'Connect', icon: Zap, color: 'text-[#54a0ff]' },
  ];

  return (
    <motion.div 
        key="settings-modal-backdrop"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
        onClick={(e) => e.target === e.currentTarget && onClose()} // Close on backdrop click
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#594a42]/30 backdrop-blur-sm cursor-pointer"
        style={{ pointerEvents: 'auto' }} // Ensure clicks register
    >
      <motion.div 
        key="settings-modal-content"
        initial={{ scale: 0.9, y: 40, opacity: 0 }} 
        animate={{ scale: 1, y: 0, opacity: 1 }} 
        exit={{ scale: 0.95, y: 20, opacity: 0, transition: { duration: 0.15 } }} // Faster exit
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        onClick={(e) => e.stopPropagation()} // Prevent close when clicking content
        className="bg-[#fcfcf7] w-full max-w-5xl h-[85vh] rounded-[3rem] shadow-2xl border-4 border-white flex flex-col overflow-hidden ring-4 ring-black/5 cursor-default relative z-50"
      >
        {/* Header */}
        <div className="bg-white/50 backdrop-blur-md p-6 flex justify-between items-center border-b border-black/5 shrink-0 z-10">
            <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-black/5">
                    <SettingsIcon activeTab={activeTab} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-[#594a42] tracking-tight">Settings</h2>
                    <p className="text-[#8e8070] font-bold text-sm">Customize your island</p>
                </div>
            </div>
            <Button variant="ghost" onClick={onClose} icon={X} className="bg-white hover:bg-[#ff6b6b] hover:text-white transition-colors" />
        </div>
        
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-full md:w-72 bg-white/40 border-r border-black/5 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto shrink-0 md:overflow-y-auto custom-scrollbar">
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)} 
                        className={twMerge(
                            "group p-4 rounded-[1.5rem] font-bold text-left flex items-center gap-4 transition-all duration-300 border-2 relative overflow-hidden",
                            activeTab === tab.id 
                            ? 'bg-white shadow-md text-[#594a42] border-white scale-100' 
                            : 'text-[#8e8070] hover:bg-white/50 border-transparent hover:scale-95'
                        )}
                    >
                        <div className={`p-2 rounded-xl transition-colors ${activeTab === tab.id ? 'bg-[#fcfcf7]' : 'bg-white/50'} ${tab.color}`}>
                            <tab.icon size={22} strokeWidth={2.5}/>
                        </div>
                        <span className="text-lg">{tab.label}</span>
                        {/* Removed layoutId to prevent unmount glitches */}
                        {activeTab === tab.id && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#78b159]" />}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 sm:p-10 overflow-y-auto custom-scrollbar bg-[#fcfcf7] relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }} // Speed up tab switching
                        className="space-y-10 max-w-3xl mx-auto pb-20"
                    >
                        {activeTab === 'timer' && (
                            <>
                                <Section title="Timer Durations" subtitle="Minutes per session">
                                    <div className="grid grid-cols-3 gap-4">
                                        {Object.entries(durations).map(([key, val]) => (
                                            <div key={key} className="bg-white p-5 rounded-[2rem] border-2 border-white shadow-sm flex flex-col items-center gap-2">
                                                <span className="text-xs font-black text-[#a4b0be] uppercase tracking-widest">{key}</span>
                                                <BufferedInput 
                                                    type="number" 
                                                    value={val} 
                                                    onCommit={(v) => handleDurationChange(key, v)} 
                                                    className="w-full bg-transparent text-center font-black text-3xl text-[#594a42] outline-none" 
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </Section>
                                
                                <Section title="Goals & Targets">
                                    <div className="bg-white/60 p-6 rounded-[2.5rem] border-2 border-white/50 space-y-8">
                                        <RangeControl 
                                            label="Daily Focus Goal" 
                                            value={dailyGoal} 
                                            max={480} 
                                            step={15}
                                            format={(v) => `${Math.floor(v/60)}h ${v%60}m`}
                                            onChange={setDailyGoal}
                                            color="#ff6b6b"
                                        />
                                        <RangeControl 
                                            label="Breathing Duration" 
                                            value={breathingDuration} 
                                            max={60} 
                                            step={5}
                                            format={(v) => `${v}s`}
                                            onChange={setBreathingDuration}
                                            color="#54a0ff"
                                        />
                                        <RangeControl 
                                            label="Long Break Interval" 
                                            value={longBreakInterval} 
                                            max={8} 
                                            min={2}
                                            step={1}
                                            format={(v) => `${v} Sessions`}
                                            onChange={setLongBreakInterval}
                                            color="#78b159"
                                        />
                                    </div>
                                </Section>

                                <Section title="Behavior">
                                    <div className="grid grid-cols-1 gap-4">
                                        <Toggle label="Auto-start Breaks" checked={autoStartBreaks} onChange={setAutoStartBreaks} icon={Zap} color="bg-[#fdcb58]" />
                                        <Toggle label="Deep Focus Mode" checked={isDeepFocus} onChange={setIsDeepFocus} icon={ShieldAlert} color="bg-[#ff6b6b]" />
                                        <Toggle label="Show Timer Percentage" checked={showPercentage} onChange={setShowPercentage} icon={Percent} color="bg-[#54a0ff]" />
                                    </div>
                                </Section>

                                <Section title="Allowed Websites">
                                    <div className="bg-white/60 p-2 rounded-[2rem] border-2 border-white/50 flex flex-wrap gap-2 min-h-[60px]">
                                        {allowedDomains.map(d => (
                                            <span key={d} className="bg-white pl-3 pr-2 py-1.5 rounded-full text-sm font-bold text-[#594a42] flex items-center gap-2 shadow-sm border border-[#e6e2d0]">
                                                {d} 
                                                <button onClick={() => handleRemoveDomain(d)} className="bg-[#ff6b6b]/10 hover:bg-[#ff6b6b] text-[#ff6b6b] hover:text-white rounded-full p-1 transition-colors"><X size={10}/></button>
                                            </span>
                                        ))}
                                        <div className="flex-1 min-w-[150px] flex items-center relative">
                                            <input 
                                                type="text" 
                                                value={newAllowedDomain} 
                                                onChange={(e) => setNewAllowedDomain(e.target.value)} 
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
                                                placeholder="Add website..." 
                                                className="w-full bg-transparent px-4 py-2 outline-none text-[#594a42] font-bold placeholder-[#a4b0be]"
                                            />
                                            <button onClick={handleAddDomain} className="absolute right-2 p-1.5 bg-[#78b159] text-white rounded-full hover:scale-110 transition-transform"><Plus size={14} strokeWidth={4}/></button>
                                        </div>
                                    </div>
                                </Section>
                            </>
                        )}

                        {activeTab === 'visuals' && (
                            <>
                                <Section title="Backgrounds">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {bgPresets.map(bg => (
                                            <motion.div 
                                                whileHover={{scale: 1.03}} whileTap={{scale:0.98}} 
                                                key={bg.url} 
                                                onClick={() => setBgUrl(bg.url)}
                                                className={`aspect-video rounded-3xl overflow-hidden cursor-pointer relative group transition-all duration-300 ${bgUrl === bg.url ? 'ring-4 ring-[#78b159] shadow-xl' : 'ring-2 ring-white hover:ring-[#78b159]/50'}`}
                                            >
                                                <img src={bg.type === 'video' ? `https://img.youtube.com/vi/${bg.url.split('/').pop()}/mqdefault.jpg` : bg.url} className="w-full h-full object-cover" />
                                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10">
                                                    <span className="text-white text-sm font-bold truncate block">{bg.name}</span>
                                                </div>
                                                {bg.isCustom && <button onClick={(e) => {e.stopPropagation(); handleRemoveBackground(bg.url);}} className="absolute top-2 right-2 bg-white text-[#ff6b6b] p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"><Trash2 size={14}/></button>}
                                                {bgUrl === bg.url && <div className="absolute top-2 left-2 bg-[#78b159] text-white p-1.5 rounded-full shadow-lg"><Check size={14} strokeWidth={4}/></div>}
                                            </motion.div>
                                        ))}
                                    </div>
                                </Section>
                                
                                <Section title="Custom Background">
                                    <div className="bg-white/60 p-6 rounded-[2.5rem] border-2 border-white/50 flex flex-col sm:flex-row gap-4">
                                        <input type="text" value={newBgName} onChange={(e) => setNewBgName(e.target.value)} placeholder="Name" className="flex-1 bg-white px-5 py-3 rounded-2xl border-2 border-transparent focus:border-[#78b159] outline-none font-bold text-[#594a42] placeholder-[#a4b0be] transition-colors"/>
                                        <input type="text" value={newBgUrl} onChange={(e) => setNewBgUrl(e.target.value)} placeholder="Image or YouTube URL" className="flex-[2] bg-white px-5 py-3 rounded-2xl border-2 border-transparent focus:border-[#78b159] outline-none font-bold text-[#594a42] placeholder-[#a4b0be] transition-colors"/>
                                        <Button onClick={handleAddBackground} disabled={!newBgName || !newBgUrl} icon={Plus} className="px-6">Add</Button>
                                    </div>
                                </Section>
                                
                                <Section title="Overlay Visibility">
                                     <RangeControl 
                                        label="Background Opacity" 
                                        value={bgOpacity} 
                                        max={0.95} 
                                        min={0}
                                        step={0.05}
                                        format={(v) => `${Math.round(v*100)}%`}
                                        onChange={setBgOpacity}
                                        color="#594a42"
                                    />
                                </Section>
                            </>
                        )}
                        
                        {activeTab === 'integrations' && (
                            <>
                                <Section title="Todoist Sync" icon={RefreshCw} iconColor="bg-[#ff6b6b]">
                                    <div className="bg-white/60 p-6 rounded-[2.5rem] border-2 border-white/50">
                                        <div className="flex gap-4">
                                            <BufferedInput type="password" value={todoistToken} onCommit={setTodoistToken} placeholder="Paste your API Token here" className="flex-1 bg-white px-5 py-3 rounded-2xl border-2 border-transparent focus:border-[#ff6b6b] outline-none font-mono text-sm text-[#594a42] shadow-sm"/>
                                            <Button onClick={fetchTodoistTasks} disabled={!todoistToken} variant="primary" className={`px-6 ${isSyncing ? 'opacity-70' : ''}`}>{isSyncing ? 'Syncing...' : 'Sync'}</Button>
                                        </div>
                                        <p className="mt-3 text-xs font-bold text-[#8e8070] px-2">Find this in Todoist Settings {'>'} Integrations {'>'} API Token</p>
                                    </div>
                                </Section>

                                <Section title="Spotify Playlists" icon={Music} iconColor="bg-[#1DB954]">
                                    <div className="space-y-3 mb-4">
                                        {playlists.map(p => (
                                            <div key={p.id} className="flex items-center justify-between bg-white px-5 py-4 rounded-[1.5rem] shadow-sm border border-black/5">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-[#1DB954]/10 p-2 rounded-xl text-[#1DB954]"><Music size={18}/></div>
                                                    <span className="font-bold text-[#594a42]">{p.name}</span>
                                                </div>
                                                <button onClick={() => handleRemovePlaylist(p.id)} className="text-[#ff6b6b] hover:bg-[#ff6b6b]/10 p-2 rounded-xl transition-colors"><Trash2 size={18}/></button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input type="text" value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} placeholder="Playlist Name" className="flex-1 bg-white p-3 rounded-2xl border-2 border-transparent focus:border-[#1DB954] outline-none font-bold text-sm"/>
                                        <input type="text" value={newPlaylistUrl} onChange={(e) => setNewPlaylistUrl(e.target.value)} placeholder="Spotify Embed URL" className="flex-[2] bg-white p-3 rounded-2xl border-2 border-transparent focus:border-[#1DB954] outline-none font-bold text-sm"/>
                                        <Button onClick={handleAddPlaylist} variant="neutral">Add</Button>
                                    </div>
                                </Section>

                                <Section title="Custom Mixer Sounds" icon={Volume2} iconColor="bg-[#54a0ff]">
                                    <div className="space-y-3 mb-4">
                                        {customSounds.map(s => (
                                            <div key={s.name} className="flex items-center justify-between bg-white px-5 py-4 rounded-[1.5rem] shadow-sm border border-black/5">
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-[#54a0ff]/10 p-2 rounded-xl text-[#54a0ff]"><Volume2 size={18}/></div>
                                                    <span className="font-bold text-[#594a42]">{s.name}</span>
                                                </div>
                                                <button onClick={() => handleRemoveSound(s.name)} className="text-[#ff6b6b] hover:bg-[#ff6b6b]/10 p-2 rounded-xl transition-colors"><Trash2 size={18}/></button>
                                            </div>
                                        ))}
                                        {customSounds.length === 0 && <p className="text-center text-[#a4b0be] text-sm py-2">No custom sounds added yet.</p>}
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input type="text" value={newSoundName} onChange={(e) => setNewSoundName(e.target.value)} placeholder="Sound Name (e.g. Rain)" className="flex-1 bg-white p-3 rounded-2xl border-2 border-transparent focus:border-[#54a0ff] outline-none font-bold text-sm"/>
                                        <input type="text" value={newSoundUrl} onChange={(e) => setNewSoundUrl(e.target.value)} placeholder="MP3 URL" className="flex-[2] bg-white p-3 rounded-2xl border-2 border-transparent focus:border-[#54a0ff] outline-none font-bold text-sm"/>
                                        <Button onClick={handleAddSound} variant="neutral" disabled={!newSoundName || !newSoundUrl}>Add Sound</Button>
                                    </div>
                                </Section>

                                <Section title="Data Management">
                                    <div className="flex gap-4">
                                        <Button onClick={handleExport} variant="secondary" className="flex-1 py-4" icon={Download}>Export Backup</Button>
                                        <div className="flex-1 relative">
                                            <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json"/>
                                            <Button onClick={() => fileInputRef.current.click()} variant="neutral" className="w-full py-4" icon={Upload}>Import Backup</Button>
                                        </div>
                                    </div>
                                </Section>
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// UI Helpers
const Section = ({ title, children, icon: Icon, iconColor }) => (
    <div className="space-y-4">
        <h3 className="text-xl font-black text-[#594a42] flex items-center gap-3">
            {Icon && <div className={`p-1.5 rounded-lg text-white ${iconColor}`}><Icon size={16}/></div>}
            {title}
        </h3>
        {children}
    </div>
);

const RangeControl = ({ label, value, max, min=0, step, format, onChange, color }) => (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-black/5">
        <div className="flex justify-between font-bold text-[#594a42] mb-3">
            <span>{label}</span>
            <span className="text-[#a4b0be] bg-[#fcfcf7] px-2 py-0.5 rounded-lg border border-[#e6e2d0] text-xs">{format(value)}</span>
        </div>
        <input 
            type="range" 
            min={min} max={max} step={step} 
            value={value} 
            onChange={(e) => onChange(parseFloat(e.target.value))} 
            className="w-full h-2 bg-[#f1f2f6] rounded-full appearance-none cursor-pointer"
            style={{ accentColor: color }}
        />
    </div>
);

const SettingsIcon = ({activeTab}) => {
    if(activeTab === 'timer') return <Clock size={24} className="text-[#78b159]" />;
    if(activeTab === 'visuals') return <ImageIcon size={24} className="text-[#fdcb58]" />;
    return <Zap size={24} className="text-[#54a0ff]" />;
}

export default SettingsModal;