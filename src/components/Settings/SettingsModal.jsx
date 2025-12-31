import React from 'react';
import { X, Clock, Zap } from 'lucide-react';
const SettingsModal = ({ onClose, settings }) => {
  const { durations, setDurations, flowDuration, setFlowDuration, intermissionDuration, setIntermissionDuration } = settings;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-pop-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl border-8 border-white flex flex-col max-h-[90vh] overflow-hidden">
        <div className="bg-[#f1f2f6] p-6 flex justify-between items-center border-b border-gray-200">
          <h2 className="text-2xl font-black text-nook-brown">Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full"><X/></button>
        </div>
        <div className="p-8 overflow-y-auto space-y-8">
          <div>
            <h3 className="text-lg font-black text-nook-brown mb-4 flex items-center gap-2"><Clock size={20} /> Timer Durations (min)</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(durations).map(([key, val]) => (
                <div key={key}>
                  <label className="text-xs font-bold text-gray-400 block capitalize mb-1">{key}</label>
                  <input type="number" value={val} onChange={(e) => setDurations({...durations, [key]: parseInt(e.target.value)})} className="w-full bg-[#fcfcf7] border-2 border-gray-200 rounded-xl p-3 font-bold text-nook-brown text-center"/>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t pt-8 border-gray-100">
            <h3 className="text-lg font-black text-nook-brown mb-4 flex items-center gap-2"><Zap size={20} className="text-nook-yellow"/> Flow & Transitions</h3>
            <div className="bg-[#fcfcf7] p-6 rounded-2xl border-2 border-gray-100 space-y-6">
              <div><label className="font-bold text-nook-brown flex justify-between mb-2">Flow Extension Time<span className="text-gray-400 bg-white px-2 rounded border">{flowDuration} min</span></label><input type="range" min="5" max="60" step="5" value={flowDuration} onChange={(e) => setFlowDuration(parseInt(e.target.value))} className="w-full accent-nook-green"/></div>
              <div><label className="font-bold text-nook-brown flex justify-between mb-2">Auto-Start Countdown<span className="text-gray-400 bg-white px-2 rounded border">{intermissionDuration} sec</span></label><input type="range" min="5" max="60" step="5" value={intermissionDuration} onChange={(e) => setIntermissionDuration(parseInt(e.target.value))} className="w-full accent-nook-yellow"/></div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 bg-white flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-nook-green text-white font-bold rounded-full shadow-lg hover:scale-105 transition-transform">Save</button>
        </div>
      </div>
    </div>
  );
};
export default SettingsModal;
