import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import { createAppTheme } from './createAppTheme';
import { tokens } from './tokens';

const STORAGE_KEY = 'crm-color-mode';
const PREFERENCES = ['light', 'dark', 'system'];

const readPreference = () => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return PREFERENCES.includes(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
};

const ColorModeContext = createContext({
  preference: 'system',
  mode: 'light',
  setPreference: () => {},
  toggleMode: () => {},
});

export const ColorModeProvider = ({ children }) => {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true });
  const [preference, setPreferenceState] = useState(readPreference);

  const mode = preference === 'system' ? (prefersDark ? 'dark' : 'light') : preference;

  const setPreference = useCallback((next) => {
    if (!PREFERENCES.includes(next)) return;
    setPreferenceState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable: keep in memory only */
    }
  }, []);

  const toggleMode = useCallback(() => {
    setPreference(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setPreference]);

  // Keep the browser chrome (mobile address bar) and root attribute in sync
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', tokens[mode].bg);
  }, [mode]);

  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const value = useMemo(
    () => ({ preference, mode, setPreference, toggleMode }),
    [preference, mode, setPreference, toggleMode]
  );

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export const useColorMode = () => useContext(ColorModeContext);

export default ColorModeContext;
