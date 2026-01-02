import React, { createContext, useState, useEffect, useContext } from 'react';

const MediaContext = createContext();
export const useMedia = () => useContext(MediaContext);

const defaultBgPresets = [
  { name: "Morning", url: "https://vijiatjack.github.io/nookoffice/video-feed/bg_1.gif", type: "image" },
  { name: "Afternoon", url: "https://vijiatjack.github.io/nookoffice/video-feed/bg_2.gif", type: "image" },
  { name: "Evening", url: "https://vijiatjack.github.io/nookoffice/video-feed/bg_3.gif", type: "image" },
  { name: "Night", url: "https://vijiatjack.github.io/nookoffice/video-feed/bg_4.gif", type: "image" },
  { name: "Rainy", url: "https://vijiatjack.github.io/nookoffice/video-feed/bg_5.gif", type: "image" },
  { name: "Coffee", url: "https://vijiatjack.github.io/nookoffice/video-feed/bg_6.gif", type: "image" },
  { name: "Snowy", url: "https://vijiatjack.github.io/nookoffice/video-feed/bg_7.gif", type: "image" },
  { name: "The Roost (YT)", url: "https://youtu.be/bAaW9cf6Yw0", type: "video" }
];

export const MediaProvider = ({ children }) => {
  const [bgUrl, setBgUrl] = useState(() => localStorage.getItem('nook_bg_url') || defaultBgPresets[3].url);
  const [bgOpacity, setBgOpacity] = useState(() => parseFloat(localStorage.getItem('nook_bg_opacity') || '0.4'));
  const [bgPresets, setBgPresets] = useState(() => JSON.parse(localStorage.getItem('nook_bg_presets')) || defaultBgPresets);
  const [playlists, setPlaylists] = useState(() => JSON.parse(localStorage.getItem('nook_playlists')) || [
    { id: 1, name: "Lofi Beats", url: "https://open.spotify.com/embed/playlist/0vvXsWCC9xrXsKd4FyS8kM" },
    { id: 2, name: "Deep Focus", url: "https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ" }
  ]);
  const [customSounds, setCustomSounds] = useState(() => JSON.parse(localStorage.getItem('nook_custom_sounds') || '[]'));

  useEffect(() => { localStorage.setItem('nook_bg_url', bgUrl); }, [bgUrl]);
  useEffect(() => { localStorage.setItem('nook_bg_opacity', bgOpacity.toString()); }, [bgOpacity]);
  useEffect(() => { localStorage.setItem('nook_bg_presets', JSON.stringify(bgPresets)); }, [bgPresets]);
  useEffect(() => { localStorage.setItem('nook_playlists', JSON.stringify(playlists)); }, [playlists]);
  useEffect(() => { localStorage.setItem('nook_custom_sounds', JSON.stringify(customSounds)); }, [customSounds]);

  return (
    <MediaContext.Provider value={{ 
      bgUrl, setBgUrl, 
      bgOpacity, setBgOpacity, 
      bgPresets, setBgPresets, 
      playlists, setPlaylists, 
      customSounds, setCustomSounds 
    }}>
      {children}
    </MediaContext.Provider>
  );
};