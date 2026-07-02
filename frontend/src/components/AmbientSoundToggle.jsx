import { useRef, useState } from 'react';

const SOUNDS = {
  hearth: 'https://cdn.pixabay.com/audio/2022/03/15/audio_8cb749e9c2.mp3',
  rain: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3',
};

export default function AmbientSoundToggle({ variant = 'hearth' }) {
  const [on, setOn] = useState(false);
  const audioRef = useRef(null);

  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(SOUNDS[variant] || SOUNDS.hearth);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.15;
    }
    if (on) {
      audioRef.current.pause();
      setOn(false);
    } else {
      audioRef.current.play().catch(() => {});
      setOn(true);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="text-xs text-gray-500 hover:text-[#4a1942] flex items-center gap-1"
      aria-pressed={on}
    >
      {on ? '🔇 Quiet room' : '🎧 Ambient hearth'}
    </button>
  );
}