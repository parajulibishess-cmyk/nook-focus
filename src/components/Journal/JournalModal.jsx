import React, { useState } from 'react';
import { useJournal } from '../../context/JournalContext';
import { X, Save, Trash2, BookOpen } from 'lucide-react';
import Button from '../UI/Button';

const JournalModal = ({ onClose }) => {
  const { journalEntries, setEntries } = useJournal();
  const [input, setInput] = useState("");

  const addEntry = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const newEntry = { id: Date.now(), text: input, date: new Date().toLocaleString() };
    setEntries([newEntry, ...journalEntries]);
    setInput("");
  };

  const deleteEntry = (id) => {
    setEntries(journalEntries.filter(e => e.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-pop-in">
      {/* Same UI as original, utilizing addEntry/deleteEntry wrapper functions */}
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden border-8 border-white">
          <div className="bg-[#fdcb58] p-6 text-[#594a42] flex justify-between items-center">
              <h2 className="text-2xl font-black flex items-center gap-2"><BookOpen/> Distraction Journal</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full"><X/></button>
          </div>
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden bg-[#fcfcf7]">
              <div className="w-full md:w-1/2 p-6 border-b md:border-b-0 md:border-r border-[#e6e2d0] flex flex-col">
                  <h3 className="font-bold text-[#594a42] mb-2">Clear your mind</h3>
                  <form onSubmit={addEntry} className="flex-1 flex flex-col">
                      <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Write down distracting thoughts here..." className="flex-1 w-full bg-white rounded-xl p-4 border-2 border-[#e6e2d0] resize-none focus:border-[#fdcb58] outline-none mb-4" />
                      <div className="flex justify-end"><Button type="submit" variant="secondary" icon={Save}>Save Entry</Button></div>
                  </form>
              </div>
              <div className="w-full md:w-1/2 p-6 overflow-y-auto bg-white">
                  <h3 className="font-bold text-[#594a42] mb-4">Previous Entries</h3>
                  <div className="space-y-4">
                      {journalEntries.map(entry => (
                          <div key={entry.id} className="bg-[#fcfcf7] p-4 rounded-xl border border-[#e6e2d0] relative group">
                              <p className="text-sm font-bold text-[#594a42] pr-6">{entry.text}</p>
                              <div className="text-xs text-gray-400 mt-2">{entry.date}</div>
                              <button onClick={() => deleteEntry(entry.id)} className="absolute top-2 right-2 text-[#ff6b6b] opacity-0 group-hover:opacity-100 hover:bg-[#fff0f0] p-1 rounded"><Trash2 size={14}/></button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
export default JournalModal;