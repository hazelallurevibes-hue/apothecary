import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { CSS_VARS, STORAGE_KEYS } from './storageKeys';

const TEXT_SCALE_KEY = STORAGE_KEYS.textScale;

const EasyModeContext = createContext({
  enabled: false,
  setEnabled: () => {},
  toggle: () => {},
  textScale: 1,
  setTextScale: () => {},
});

function readStoredTextScale() {
  try {
    const n = parseFloat(localStorage.getItem(TEXT_SCALE_KEY) || '1');
    return [1, 1.125, 1.25].includes(n) ? n : 1;
  } catch {
    return 1;
  }
}

export function EasyModeProvider({ user, children }) {
  const [enabled, setEnabledState] = useState(!!user?.easy_mode_enabled);
  const [textScale, setTextScaleState] = useState(readStoredTextScale);

  useEffect(() => {
    setEnabledState(!!user?.easy_mode_enabled);
  }, [user?.easy_mode_enabled, user?.email]);

  useEffect(() => {
    document.documentElement.style.setProperty(CSS_VARS.textScale, String(textScale));
    document.documentElement.style.fontSize = `${textScale * 100}%`;
    localStorage.setItem(TEXT_SCALE_KEY, String(textScale));
  }, [textScale]);

  const persist = useCallback(async (next) => {
    setEnabledState(next);
    if (!user?.email) return;
    await supabase.from('users').update({ easy_mode_enabled: next }).ilike('email', user.email.trim());
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || '{}');
    saved.easy_mode_enabled = next;
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(saved));
  }, [user?.email]);

  const setTextScale = useCallback((scale) => {
    const n = Number(scale);
    if ([1, 1.125, 1.25].includes(n)) setTextScaleState(n);
  }, []);

  const value = {
    enabled,
    setEnabled: persist,
    toggle: () => persist(!enabled),
    textScale,
    setTextScale,
  };

  return <EasyModeContext.Provider value={value}>{children}</EasyModeContext.Provider>;
}

export function useEasyMode() {
  return useContext(EasyModeContext);
}