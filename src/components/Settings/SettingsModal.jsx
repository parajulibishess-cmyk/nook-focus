import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSettings } from '../../context/SettingsContext';
import { useMedia } from '../../context/MediaContext';
import { useTasks } from '../../context/TaskContext';
import { X, Clock, Zap, ImageIcon, RefreshCw, Upload, Download, Trash2, ShieldAlert, Percent, Target, Music, Volume2 } from 'lucide-react';
import Button from '../UI/Button';

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

  const handleImport = (e) => { 
      const file = e.target.files[0]; 
      if (!file) return; 
      const reader = new FileReader(); 
      reader.onload = (ev) => { 
          try { 
              const data = JSON.parse(ev.target.result);
              if(data.durations) setDurations(data.durations);
              if(data.bgPresets) setBgPresets(data.bgPresets);
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

  return (
    <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 30, opacity: 0 }} 
        animate={{ scale: 1, y: 0, opacity: 1 }} 
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl border-8 border-white flex flex-col max-h-[90vh] overflow-hidden relative"
      >
        <div className="bg-[#f1f2f6] p-6 flex justify-between items-center border-b border-[#e6e2d0]">
          <div><h2 className="text-3xl font-black text-[#594a42]">Settings</h2><p className="text-[#8e8070] font-bold text-sm">Customize your nook</p></div>
          <div className="flex gap-3">
             {todoistToken && <button onClick={fetchTodoistTasks} className={`p-2 bg-white rounded-full border border-[#e6e2d0] text-[#78b159] hover:bg-[#fcfcf7] ${isSyncing ? 'animate-spin' : ''}`} title="Sync Tasks"><RefreshCw/></button>}
             <Button variant="neutral" onClick={onClose} icon={X} className="px-3" />
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            <div className="w-full md:w-64 bg-[#fcfcf7] border-r border-[#e6e2d0] p-4 flex flex-row md:flex-col gap-2 overflow-x-auto shrink-0">
                {['timer', 'visuals', 'integrations'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)} 
                        className={`p-4 rounded-2xl font-bold text-left flex items-center gap-3 transition-all ${activeTab === tab ? 'bg-white shadow-md scale-105 text-[#594a42] border-l-4 border-[#78b159]' : 'text-[#8e8070] hover:bg-[#e6e2d0] border-l-4 border-transparent'}`}
                    >
                        {tab === 'timer' && <Clock size={20} className={activeTab === tab ? "text-[#78b159]" : ""}/>}
                        {tab === 'visuals' && <ImageIcon size={20} className={activeTab === tab ? "text-[#fdcb58]" : ""}/>}
                        {tab === 'integrations' && <RefreshCw size={20} className={activeTab === tab ? "text-[#54a0ff]" : ""}/>}
                        <span className="capitalize">{tab}</span>
                    </button>
                ))}
            </div>

            <div className="flex-1 p-8 overflow-y-auto bg-white custom-scrollbar">
                {activeTab === 'timer' && (
                    <div className="space-y-8 max-w-2xl">
                        <div><h3 className="font-black text-xl text-[#594a42] mb-4">Durations (min)</h3>
                            {/* Updated Grid for Responsiveness */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {Object.entries(durations).map(([key, val]) => (
                                    <div key={key} className="relative group">
                                        <label className="text-[10px] font-black text-[#a4b0be] uppercase block mb-1 tracking-wider">{key}</label>
                                        <input type="number" value={val} onChange={(e) => setDurations({...durations, [key]: parseInt(e.target.value) || 0})} className="w-full bg-[#fcfcf7] p-4 rounded-2xl font-black text-2xl text-[#594a42] border-2 border-[#f1f2f6] text-center focus:border-[#78b159] focus:bg-white transition-all outline-none" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="border-t-2 border-[#f1f2f6] pt-6">
                            <h3 className="font-black text-xl text-[#594a42] mb-4 flex items-center gap-2"><Target className="text-[#ff6b6b]" size={20}/> Goals</h3>
                            <div className="bg-[#fcfcf7] p-6 rounded-3xl border-2 border-[#f1f2f6] space-y-6">
                                <div><div className="flex justify-between font-bold text-[#594a42] mb-2"><span>Daily Goal</span><span className="text-[#a4b0be]">{Math.floor(dailyGoal/60)}h {dailyGoal%60}m</span></div><input type="range" min="30" max="480" step="15" value={dailyGoal} onChange={(e) => setDailyGoal(parseInt(e.target.value))} className="w-full accent-[#ff6b6b]"/></div>
                                <div><div className="flex justify-between font-bold text-[#594a42] mb-2"><span>Breathing Exercise</span><span className="text-[#a4b0be]">{breathingDuration}s</span></div><input type="range" min="5" max="60" step="5" value={breathingDuration} onChange={(e) => setBreathingDuration(parseInt(e.target.value))} className="w-full accent-[#54a0ff]"/></div>
                            </div>
                        </div>

                        <div className="border-t-2 border-[#f1f2f6] pt-6">
                            <h3 className="font-black text-xl text-[#594a42] mb-4 flex items-center gap-2"><Zap className="text-[#fdcb58]" fill="currentColor"/> Automation & Focus</h3>
                            <div className="bg-[#fcfcf7] p-6 rounded-3xl border-2 border-[#f1f2f6] space-y-6">
                                <div className="flex justify-between items-center"><div><label className="font-bold text-[#594a42]">Auto-start Breaks</label></div><input type="checkbox" checked={autoStartBreaks} onChange={(e) => setAutoStartBreaks(e.target.checked)} className="w-6 h-6 accent-[#78b159]"/></div>
                                <div className="flex justify-between items-center"><div><label className="font-bold text-[#594a42] flex gap-2">Deep Focus Mode <ShieldAlert size={16} className="text-[#ff6b6b]"/></label><p className="text-xs text-[#a4b0be]">Block navigation while focused</p></div><input type="checkbox" checked={isDeepFocus} onChange={(e) => setIsDeepFocus(e.target.checked)} className="w-6 h-6 accent-[#ff6b6b]"/></div>
                                <div className="flex justify-between items-center"><div><label className="font-bold text-[#594a42] flex gap-2">Show Percentage <Percent size={16} className="text-[#54a0ff]"/></label></div><input type="checkbox" checked={showPercentage} onChange={(e) => setShowPercentage(e.target.checked)} className="w-6 h-6 accent-[#54a0ff]"/></div>
                                <div><label className="font-bold text-[#594a42] block mb-2">Long Break Interval</label><div className="flex gap-4 items-center"><input type="range" min="2" max="8" value={longBreakInterval} onChange={(e) => setLongBreakInterval(parseInt(e.target.value))} className="flex-1 accent-[#78b159]"/><span className="font-black text-xl text-[#594a42] bg-white px-4 py-2 rounded-xl border-2 border-[#f1f2f6]">{longBreakInterval}</span></div></div>
                                <div className="pt-4 border-t border-[#e6e2d0]"><label className="font-bold text-[#594a42] block mb-2">Allowed Websites</label><div className="flex gap-2 mb-2"><input type="text" value={newAllowedDomain} onChange={(e) => setNewAllowedDomain(e.target.value)} placeholder="e.g. youtube.com" className="flex-1 bg-white border border-[#e6e2d0] rounded-lg p-2 text-sm"/><Button onClick={handleAddDomain} className="py-2 text-xs">Add</Button></div><div className="flex flex-wrap gap-2">{allowedDomains.map(d => (<span key={d} className="bg-white border border-[#e6e2d0] px-2 py-1 rounded text-xs font-bold text-[#594a42] flex items-center gap-1">{d} <button onClick={() => handleRemoveDomain(d)} className="text-[#ff6b6b]"><X size={10}/></button></span>))}</div></div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'visuals' && (
                    <div className="space-y-8">
                        <div><h3 className="font-black text-xl text-[#594a42] mb-4">Background Presets</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {bgPresets.map(bg => (
                                <motion.div whileHover={{scale: 1.05}} whileTap={{scale:0.95}} key={bg.url} className="relative group cursor-pointer" onClick={() => setBgUrl(bg.url)}>
                                    <div className={`w-full aspect-video rounded-xl overflow-hidden border-4 transition-all ${bgUrl === bg.url ? 'border-[#78b159] shadow-lg scale-105' : 'border-transparent'}`}>
                                        <img src={bg.type === 'video' ? `https://img.youtube.com/vi/${bg.url.split('/').pop()}/mqdefault.jpg` : bg.url} className="w-full h-full object-cover" />
                                        <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] font-bold p-1 text-center truncate backdrop-blur-sm">{bg.name}</span>
                                    </div>
                                    {bg.isCustom && <button onClick={(e) => {e.stopPropagation(); handleRemoveBackground(bg.url);}} className="absolute -top-2 -right-2 bg-white text-[#ff6b6b] p-1.5 rounded-full shadow border border-[#e6e2d0]"><Trash2 size={12}/></button>}
                                </motion.div>
                            ))}
                        </div>
                        </div>
                        <div className="bg-[#fcfcf7] p-6 rounded-3xl border-2 border-[#f1f2f6]"><h3 className="font-black text-[#594a42] mb-4">Add Custom Background</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4"><input type="text" value={newBgName} onChange={(e) => setNewBgName(e.target.value)} placeholder="Name" className="bg-white p-3 rounded-xl border border-[#e6e2d0] text-sm"/><input type="text" value={newBgUrl} onChange={(e) => setNewBgUrl(e.target.value)} placeholder="Image/Video URL" className="bg-white p-3 rounded-xl border border-[#e6e2d0] text-sm"/></div><Button onClick={handleAddBackground} variant="secondary" className="w-full" disabled={!newBgName || !newBgUrl}>Add to Library</Button></div><div><label className="font-bold text-[#594a42] mb-2 block">Overlay Opacity: {Math.round(bgOpacity*100)}%</label><input type="range" min="0" max="0.95" step="0.05" value={bgOpacity} onChange={(e) => setBgOpacity(parseFloat(e.target.value))} className="w-full accent-[#78b159]"/></div>
                    </div>
                )}
                {activeTab === 'integrations' && (
                    <div className="space-y-8 max-w-2xl">
                        <div className="bg-[#fcfcf7] p-6 rounded-3xl border-2 border-[#f1f2f6]"><div className="flex items-center gap-3 mb-4"><div className="bg-[#ff6b6b] p-2 rounded-xl text-white"><RefreshCw size={20}/></div><h3 className="font-black text-[#594a42] text-xl">Todoist</h3></div><input type="password" value={todoistToken} onChange={(e) => setTodoistToken(e.target.value)} placeholder="Paste API Token" className="w-full bg-white p-3 rounded-xl border border-[#e6e2d0] text-sm font-mono mb-2 focus:border-[#ff6b6b] outline-none"/><p className="text-xs text-[#8e8070]">Syncs tasks automatically.</p></div>
                        <div className="bg-[#fcfcf7] p-6 rounded-3xl border-2 border-[#f1f2f6]"><div className="flex items-center gap-3 mb-4"><div className="bg-[#1DB954] p-2 rounded-xl text-white"><Music size={20}/></div><h3 className="font-black text-[#594a42] text-xl">Spotify Playlists</h3></div><div className="space-y-2 mb-4">{playlists.map(p => (<div key={p.id} className="flex justify-between bg-white p-3 rounded-xl border border-[#e6e2d0]"><span className="text-sm font-bold text-[#594a42]">{p.name}</span><button onClick={() => handleRemovePlaylist(p.id)} className="text-[#ff6b6b]"><Trash2 size={14}/></button></div>))}</div><div className="space-y-2"><input type="text" value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} placeholder="Playlist Name" className="w-full bg-white p-2 rounded-lg border border-[#e6e2d0] text-xs"/><input type="text" value={newPlaylistUrl} onChange={(e) => setNewPlaylistUrl(e.target.value)} placeholder="Spotify URL" className="w-full bg-white p-2 rounded-lg border border-[#e6e2d0] text-xs"/><Button onClick={handleAddPlaylist} className="w-full py-2 text-xs">Add Playlist</Button></div></div>
                        <div className="bg-[#fcfcf7] p-6 rounded-3xl border-2 border-[#f1f2f6]"><div className="flex items-center gap-3 mb-4"><div className="bg-[#54a0ff] p-2 rounded-xl text-white"><Volume2 size={20}/></div><h3 className="font-black text-[#594a42] text-xl">Custom Mixer Sounds</h3></div><div className="space-y-2 mb-4">{customSounds.map(s => (<div key={s.name} className="flex justify-between bg-white p-3 rounded-xl border border-[#e6e2d0]"><span className="text-sm font-bold text-[#594a42]">{s.name}</span></div>))}</div><div className="space-y-2"><input type="text" value={newSoundName} onChange={(e) => setNewSoundName(e.target.value)} placeholder="Sound Name (e.g. Ocean)" className="w-full bg-white p-2 rounded-lg border border-[#e6e2d0] text-xs"/><input type="text" value={newSoundUrl} onChange={(e) => setNewSoundUrl(e.target.value)} placeholder="MP3 URL" className="w-full bg-white p-2 rounded-lg border border-[#e6e2d0] text-xs"/><Button onClick={handleAddSound} className="w-full py-2 text-xs">Add to Mixer</Button></div></div>
                         <div className="bg-[#fcfcf7] p-6 rounded-3xl border-2 border-[#f1f2f6]"><h3 className="font-black text-[#594a42] text-xl mb-4">Backup & Restore</h3><div className="flex gap-3"><Button onClick={handleExport} variant="secondary" className="flex-1 text-sm"><Download size={16} className="mr-2"/> Export</Button><div className="flex-1 relative"><input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".json"/><Button onClick={() => fileInputRef.current.click()} variant="neutral" className="w-full text-sm"><Upload size={16} className="mr-2"/> Import</Button></div></div></div>
                    </div>
                )}
            </div>
        </div>
        <div className="p-4 border-t border-[#e6e2d0] bg-white flex justify-end">
            <Button onClick={onClose} className="px-8 shadow-lg text-lg">Save & Close</Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
export default SettingsModal;