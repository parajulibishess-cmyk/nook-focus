import React, { useState, useEffect, useRef } from 'react';

const Calendar = ({ selectedDate, onSelect, onClose }) => {
  const [monthsToRender, setMonthsToRender] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const today = new Date();
    const months = [];
    for (let i = 0; i < 60; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      months.push(d);
    }
    setMonthsToRender(months);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handleDayClick = (date) => {
    if (date < today) return;
    const localIso = date.toLocaleDateString('en-CA');
    onSelect(localIso);
    if (onClose) onClose();
  };

  return (
    // Added z-50 and bg-white specifically here
    <div className="bg-white rounded-3xl border-4 border-[#e6e2d0] shadow-2xl w-72 h-80 flex flex-col animate-pop-in select-none overflow-hidden relative z-50 opacity-100" onClick={(e) => e.stopPropagation()}>
      <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar space-y-6" ref={containerRef}>
        {monthsToRender.map((monthDate, mIdx) => {
          const year = monthDate.getFullYear();
          const month = monthDate.getMonth();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const firstDay = new Date(year, month, 1).getDay();
          const days = [];
          for (let i = 0; i < firstDay; i++) days.push(null);
          for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

          return (
            <div key={mIdx}>
              <h3 className="font-black text-base text-[#78b159] mb-2 sticky top-0 bg-white/95 backdrop-blur-sm py-2 z-10 border-b border-[#f1f2f6]">{monthNames[month]} {year}</h3>
              <div className="grid grid-cols-7 gap-1 mb-1 text-center">{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (<div key={d} className="text-[10px] font-bold text-[#a4b0be] uppercase">{d}</div>))}</div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((date, dIdx) => {
                  if (!date) return <div key={dIdx} className="aspect-square"></div>;
                  const isPast = date < today;
                  const isSelected = selectedDate && date.toLocaleDateString('en-CA') === selectedDate;
                  return (
                    <button key={dIdx} type="button" onClick={() => !isPast && handleDayClick(date)} disabled={isPast}
                      className={`aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-200 ${isSelected ? 'bg-[#fdcb58] text-[#594a42] shadow-sm transform scale-110' : ''} ${isPast ? 'text-gray-200 cursor-default' : 'text-[#594a42] hover:bg-[#c2f2d0] hover:text-[#78b159] hover:scale-110 active:scale-90'}`}>
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-4 py-3 border-t border-[#e6e2d0] flex justify-center bg-white"><button onClick={onClose} className="text-xs font-bold text-[#ff6b6b] hover:bg-[#fff0f0] px-4 py-2 rounded-full transition-colors active:scale-95">Close</button></div>
    </div>
  );
};
export default Calendar;