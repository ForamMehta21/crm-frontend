import { createTheme, alpha, responsiveFontSizes } from '@mui/material/styles';
import { tokens } from './tokens';

/**
 * Builds the Harbor MUI theme for a given mode ('light' | 'dark').
 * Component overrides read from the palette, so both modes share one definition.
 */
export const createAppTheme = (mode = 'light') => {
  const t = tokens[mode] || tokens.light;
  const isDark = mode === 'dark';

  const shadow = (y, blur, a = t.shadowColor) => `0 ${y}px ${blur}px ${a}`;
  const shadows = [
    'none',
    `0 1px 2px ${t.shadowColor}`,
    `0 1px 3px ${t.shadowColor}, 0 1px 2px ${t.shadowColor}`,
    shadow(4, 10),
    shadow(8, 18),
    shadow(12, 24),
    ...Array(19).fill(shadow(18, 40, t.shadowStrong)),
  ];

  let theme = createTheme({
    breakpoints: {
      // xs: phone · sm: tablet portrait · md: tablet landscape / small laptop · lg: laptop · xl: desktop
      values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
    },
    palette: {
      mode,
      primary: t.primary,
      secondary: t.brass,
      brass: t.brass,
      success: t.success,
      warning: t.warning,
      error: t.error,
      info: t.info,
      violet: t.violet,
      slate: t.slate,
      whatsapp: { main: t.whatsapp, contrastText: '#FFFFFF' },
      background: { default: t.bg, paper: t.surface },
      surface: { sidebar: t.sidebar, raised: t.raised, line: t.line, lineStrong: t.lineStrong, brand: t.brandPanel, brandText: t.brandPanelText },
      text: { primary: t.text, secondary: t.textMuted, disabled: t.textDisabled },
      divider: t.line,
      action: {
        hover: alpha(t.primary.main, isDark ? 0.08 : 0.06),
        selected: alpha(t.primary.main, isDark ? 0.16 : 0.1),
        focus: alpha(t.primary.main, 0.16),
      },
    },
    softAlpha: t.softAlpha,
    typography: {
      fontFamily: t.fontBody,
      h1: { fontFamily: t.fontDisplay, fontWeight: 800, letterSpacing: '-0.025em' },
      h2: { fontFamily: t.fontDisplay, fontWeight: 800, letterSpacing: '-0.025em' },
      h3: { fontFamily: t.fontDisplay, fontWeight: 800, letterSpacing: '-0.02em' },
      h4: { fontFamily: t.fontDisplay, fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontFamily: t.fontDisplay, fontWeight: 700, letterSpacing: '-0.015em' },
      h6: { fontFamily: t.fontDisplay, fontWeight: 700, letterSpacing: '-0.01em' },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
      overline: { fontWeight: 600, letterSpacing: '0.1em' },
    },
    shape: { borderRadius: 10 },
    shadows,
  });

  const { palette } = theme;

  theme = createTheme(theme, {
    components: {
      // Page padding is owned by Layout, so containers inside it should not add more
      MuiContainer: {
        defaultProps: { disableGutters: true },
      },
      MuiCssBaseline: {
        styleOverrides: {
          ':root': {
            colorScheme: mode,
            '--crm-bg': t.bg,
            '--crm-surface': t.surface,
            '--crm-raised': t.raised,
            '--crm-line': t.line,
            '--crm-text': t.text,
            '--crm-muted': t.textMuted,
            '--crm-primary': t.primary.main,
            '--crm-primary-soft': alpha(t.primary.main, 0.25),
            '--crm-scroll-thumb': t.scrollThumb,
            '--crm-scroll-thumb-hover': t.scrollThumbHover,
            '--crm-shadow': t.shadowColor,
            '--crm-whatsapp': t.whatsapp,
          },
          body: {
            backgroundColor: t.bg,
            color: t.text,
            transition: 'background-color 0.2s ease, color 0.2s ease',
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '8px 18px',
            minHeight: 40,
            fontSize: '0.875rem',
          },
          sizeSmall: { padding: '5px 12px', minHeight: 32 },
          sizeLarge: { padding: '11px 22px', minHeight: 48, fontSize: '0.95rem' },
          outlined: { borderColor: t.lineStrong },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: t.surface,
            border: `1px solid ${t.line}`,
            borderRadius: 14,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
          rounded: { borderRadius: 14 },
          outlined: { borderColor: t.line },
          elevation1: { boxShadow: `0 1px 2px ${t.shadowColor}`, border: `1px solid ${t.line}` },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: t.sidebar,
            backgroundImage: 'none',
            borderRight: `1px solid ${t.line}`,
          },
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0, color: 'inherit' },
        styleOverrides: {
          root: {
            backgroundColor: alpha(t.surface, 0.85),
            backdropFilter: 'saturate(180%) blur(12px)',
            color: t.text,
            borderBottom: `1px solid ${t.line}`,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundColor: t.surface,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: t.lineStrong },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: palette.primary.main },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 2 },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            margin: '2px 8px',
            minHeight: 44,
            '&.Mui-selected': {
              backgroundColor: alpha(palette.primary.main, isDark ? 0.16 : 0.1),
              '&:hover': { backgroundColor: alpha(palette.primary.main, isDark ? 0.22 : 0.14) },
              '& .MuiListItemIcon-root': { color: palette.primary.main },
              '& .MuiListItemText-primary': { color: palette.primary.main, fontWeight: 600 },
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: { root: { color: t.textMuted, minWidth: 40 } },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 8, fontWeight: 500 },
          filledDefault: { backgroundColor: t.raised, color: t.text },
        },
      },
      MuiTableContainer: {
        styleOverrides: { root: { borderRadius: 14 } },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: t.line },
          head: {
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: t.textMuted,
            backgroundColor: t.raised,
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&.MuiTableRow-hover:hover': { backgroundColor: alpha(palette.primary.main, isDark ? 0.06 : 0.04) },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: t.surface,
            backgroundImage: 'none',
            border: `1px solid ${t.line}`,
            borderRadius: 16,
            [theme.breakpoints.down('sm')]: {
              margin: 12,
              width: 'calc(100% - 24px)',
              maxHeight: 'calc(100% - 24px)',
            },
          },
          paperFullScreen: { borderRadius: 0, margin: 0, width: '100%', maxHeight: '100%' },
        },
      },
      MuiDialogTitle: {
        styleOverrides: { root: { fontFamily: t.fontDisplay, fontWeight: 700 } },
      },
      MuiAlert: {
        styleOverrides: { root: { borderRadius: 10 } },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: isDark ? t.raised : t.text,
            color: isDark ? t.text : t.surface,
            border: isDark ? `1px solid ${t.line}` : 'none',
            borderRadius: 8,
            fontSize: '0.75rem',
            padding: '6px 10px',
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(palette.primary.main, isDark ? 0.2 : 0.12),
            color: palette.primary.main,
            fontWeight: 600,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: { root: { borderRadius: 10 } },
      },
      MuiTab: {
        styleOverrides: { root: { textTransform: 'none', fontWeight: 600, minHeight: 44 } },
      },
      MuiTabs: {
        styleOverrides: { indicator: { height: 3, borderRadius: '3px 3px 0 0' } },
      },
      MuiLinearProgress: {
        styleOverrides: { root: { borderRadius: 4, backgroundColor: t.raised } },
      },
      MuiSkeleton: {
        styleOverrides: { root: { backgroundColor: alpha(t.text, isDark ? 0.08 : 0.06) } },
      },
      MuiMenu: {
        styleOverrides: { paper: { border: `1px solid ${t.line}` } },
      },
      MuiPopover: {
        styleOverrides: { paper: { border: `1px solid ${t.line}` } },
      },
      MuiToggleButton: {
        styleOverrides: { root: { textTransform: 'none', borderColor: t.line } },
      },
    },
  });

  return responsiveFontSizes(theme, { factor: 2.2 });
};

/** Soft tinted background for a palette colour, tuned per mode. */
export const softBg = (theme, colorKey) => {
  const main = theme.palette[colorKey]?.main || colorKey;
  return alpha(main, theme.softAlpha || 0.12);
};

export default createAppTheme;
