import React, { useState, useRef, useEffect } from 'react';
import { X, CloudRain, Flame, Wind, Coffee, Volume2 } from 'lucide-react';

const MusicModal = ({ onClose, playlists, customSounds }) => {
  const [tab, setTab] = useState('spotify');
  const [currentUrl, setCurrentUrl] = useState(null);
  const [volumes, setVolumes] = useState({ rain: 0, fire: 0, cafe: 0, white: 0 });
  
  // Audio Refs
  const audioRefs = useRef({});

  const sounds = [
      { id: 'rain', name: 'Rain', icon: CloudRain, url: "https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3" },
      { id: 'fire', name: 'Fire', icon: Flame, url: "https://assets.mixkit.co/active_storage/sfx/696/696-preview.mp3" },
      { id: 'cafe', name: 'Cafe', icon: Coffee, url: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3" },
      { id: 'white', name: 'White Noise', icon: Wind, url: "https://assets.mixkit.co/active_storage/sfx/2042/2042-preview.mp3" },
  ];

  // Handle Volume Changes
  useEffect(() => {
      Object.entries(volumes).forEach(([key, vol]) => {
          if (audioRefs.current[key]) {
              audioRefs.current[key].volume = vol;
              if (vol > 0 && audioRefs.current[key].paused) audioRefs.current[key].play().catch(e=>console.log(e));
              if (vol === 0 && !audioRefs.current[key].paused) audioRefs.current[key].pause();
          }
      });
  }, [volumes]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-pop-in">
        {/* Hidden Audio Elements */}
        {sounds.map(s => <audio key={s.id} ref={el => audioRefs.current[s.id] = el} src={s.url} loop />)}

        <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
            <div className="bg-[#54a0ff] p-6 text-white flex justify-between items-center">
                <h2 className="text-2xl font-black">Soundscapes</h2>
                <button onClick={onClose}><X /></button>
            </div>
            
            <div className="flex border-b">
                <button onClick={() => setTab('spotify')} className={`flex-1 p-4 font-bold ${tab === 'spotify' ? 'text-[#1DB954] border-b-4 border-[#1DB954]' : 'text-gray-400'}`}>Spotify</button>
                <button onClick={() => setTab('mixer')} className={`flex-1 p-4 font-bold ${tab === 'mixer' ? 'text-[#54a0ff] border-b-4 border-[#54a0ff]' : 'text-gray-400'}`}>Mixer</button>
            </div>

            <div className="flex-1 p-6 bg-[#fcfcf7] overflow-y-auto">
                {tab === 'spotify' && (
                    <div className="flex gap-4 h-full">
                        <div className="w-1/3 space-y-2">
                            {playlists.map(p => (
                                <button key={p.id} onClick={() => setCurrentUrl(p.url)} className="block w-full text-left p-3 rounded-xl bg-white border hover:bg-gray-50 font-bold text-[#594a42]">{p.name}</button>
                            ))}
                        </div>
                        <div className="flex-1 bg-black rounded-xl overflow-hidden">
                            {currentUrl ? <iframe src={currentUrl} width="100%" height="100%" frameBorder="0" allow="encrypted-media"></iframe> : <div className="text-white flex items-center justify-center h-full">Select a playlist</div>}
                        </div>
                    </div>
                )}

                {tab === 'mixer' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {sounds.map(s => (
                            <div key={s.id} className="bg-white p-6 rounded-2xl border flex flex-col items-center gap-4">
                                <div className={`p-4 rounded-full ${volumes[s.id] > 0 ? 'bg-[#54a0ff] text-white' : 'bg-gray-100 text-gray-400'}`}><s.icon size={32}/></div>
                                <span className="font-bold text-[#594a42]">{s.name}</span>
                                <input type="range" min="0" max="1" step="0.1" value={volumes[s.id]} onChange={(e) => setVolumes({...volumes, [s.id]: parseFloat(e.target.value)})} className="w-full accent-[#54a0ff]"/>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
export default MusicModal;