import { useState, useEffect } from 'react';

export const useSettings = () => {
  const [durations, setDurations] = useState(() => 
    JSON.parse(localStorage.getItem('nook_durations')) || { focus: 25, short: 5, long: 15 }
  );
  const [flowDuration, setFlowDuration] = useState(() => 
    parseInt(localStorage.getItem('nook_flow_duration')) || 15
  );
  const [intermissionDuration, setIntermissionDuration] = useState(() => 
    parseInt(localStorage.getItem('nook_intermission_duration')) || 15
  );
  const [autoStartBreaks, setAutoStartBreaks] = useState(() => 
    localStorage.getItem('nook_auto_start') === 'true'
  );

  useEffect(() => { localStorage.setItem('nook_durations', JSON.stringify(durations)); }, [durations]);
  useEffect(() => { localStorage.setItem('nook_flow_duration', flowDuration.toString()); }, [flowDuration]);
  useEffect(() => { localStorage.setItem('nook_intermission_duration', intermissionDuration.toString()); }, [intermissionDuration]);
  useEffect(() => { localStorage.setItem('nook_auto_start', autoStartBreaks); }, [autoStartBreaks]);

  return { durations, setDurations, flowDuration, setFlowDuration, intermissionDuration, setIntermissionDuration, autoStartBreaks, setAutoStartBreaks };
};
