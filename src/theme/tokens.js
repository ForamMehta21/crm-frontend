/**
 * Harbor design tokens.
 * One set of token names, two palettes. Every colour used in the app should
 * come from here (via the MUI theme), never as a literal in a component.
 */

const shared = {
  whatsapp: '#25D366',
  fontBody: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontDisplay: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
};

export const tokens = {
  light: {
    ...shared,
    bg: '#F3F6F5',
    sidebar: '#FFFFFF',
    surface: '#FFFFFF',
    raised: '#EAF0EE',
    line: '#D8E1DE',
    lineStrong: '#C3CFCB',
    text: '#12201D',
    textMuted: '#5A6B66',
    textDisabled: '#94A3A0',
    brandPanel: '#0E7C6B',
    brandPanelText: '#FFFFFF',
    scrollThumb: '#C3CFCB',
    scrollThumbHover: '#9FB0AB',

    primary: { main: '#0E7C6B', light: '#2A9C89', dark: '#0A5F52', contrastText: '#FFFFFF' },
    brass: { main: '#A86A12', light: '#C98A2E', dark: '#83520C', contrastText: '#FFFFFF' },
    success: { main: '#15803D', light: '#22A04F', dark: '#106530', contrastText: '#FFFFFF' },
    warning: { main: '#B45309', light: '#D97706', dark: '#8F4207', contrastText: '#FFFFFF' },
    error: { main: '#C62828', light: '#E04848', dark: '#9E1F1F', contrastText: '#FFFFFF' },
    info: { main: '#1D5FD1', light: '#4A80E0', dark: '#164BA6', contrastText: '#FFFFFF' },
    violet: { main: '#6D4BC9', light: '#8A6CDB', dark: '#563AA3', contrastText: '#FFFFFF' },
    slate: { main: '#5F6F6B', light: '#7D8C88', dark: '#4A5855', contrastText: '#FFFFFF' },

    softAlpha: 0.12,
    shadowColor: 'rgba(18, 32, 29, 0.08)',
    shadowStrong: 'rgba(18, 32, 29, 0.14)',
  },
  dark: {
    ...shared,
    bg: '#0B1311',
    sidebar: '#0F1816',
    surface: '#111B19',
    raised: '#172320',
    line: '#24342F',
    lineStrong: '#33463F',
    text: '#E5EEEB',
    textMuted: '#93A6A0',
    textDisabled: '#5E716B',
    brandPanel: '#0F2E29',
    brandPanelText: '#E5EEEB',
    scrollThumb: '#2C3E39',
    scrollThumbHover: '#3D544D',

    primary: { main: '#3CC6AE', light: '#6AD8C4', dark: '#22A28B', contrastText: '#062019' },
    brass: { main: '#E3A94B', light: '#EEC27A', dark: '#C48A2C', contrastText: '#241703' },
    success: { main: '#4ADE80', light: '#7EE8A4', dark: '#2FBF63', contrastText: '#052812' },
    warning: { main: '#FBBF24', light: '#FCD15E', dark: '#D99E0B', contrastText: '#2A1E02' },
    error: { main: '#F87171', light: '#FA9A9A', dark: '#E04848', contrastText: '#2C0707' },
    info: { main: '#7AA7FF', light: '#A3C2FF', dark: '#4E86F2', contrastText: '#071633' },
    violet: { main: '#A78BFA', light: '#C4B2FC', dark: '#8B6AF0', contrastText: '#170C38' },
    slate: { main: '#93A6A0', light: '#B1C0BB', dark: '#748883', contrastText: '#0B1311' },

    softAlpha: 0.16,
    shadowColor: 'rgba(0, 0, 0, 0.35)',
    shadowStrong: 'rgba(0, 0, 0, 0.55)',
  },
};

export default tokens;
