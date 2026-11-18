import React from 'react';
import { ToggleButton, ToggleButtonGroup, Tooltip, IconButton } from '@mui/material';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import SettingsBrightnessOutlinedIcon from '@mui/icons-material/SettingsBrightnessOutlined';
import { useColorMode } from '../theme/ColorModeContext';

const options = [
  { value: 'light', label: 'Light theme', Icon: LightModeOutlinedIcon },
  { value: 'system', label: 'Use device theme', Icon: SettingsBrightnessOutlinedIcon },
  { value: 'dark', label: 'Dark theme', Icon: DarkModeOutlinedIcon },
];

/**
 * Theme switcher.
 * `compact` renders a single icon button that flips light/dark (used on phones);
 * otherwise a three-way light / system / dark segmented control.
 */
const ThemeModeToggle = ({ compact = false }) => {
  const { preference, mode, setPreference, toggleMode } = useColorMode();

  if (compact) {
    const Icon = mode === 'dark' ? LightModeOutlinedIcon : DarkModeOutlinedIcon;
    const label = mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    return (
      <Tooltip title={label}>
        <IconButton aria-label={label} onClick={toggleMode} sx={{ color: 'text.secondary' }}>
          <Icon fontSize="small" />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={preference}
      onChange={(_, next) => next && setPreference(next)}
      aria-label="Colour theme"
      sx={{
        bgcolor: 'surface.raised',
        borderRadius: 999,
        p: '3px',
        gap: '2px',
        '& .MuiToggleButtonGroup-grouped': {
          border: 0,
          borderRadius: '999px !important',
          px: 1,
          py: 0.5,
          color: 'text.secondary',
          '&.Mui-selected': {
            bgcolor: 'background.paper',
            color: 'primary.main',
            boxShadow: 1,
            '&:hover': { bgcolor: 'background.paper' },
          },
        },
      }}
    >
      {options.map(({ value, label, Icon }) => (
        <Tooltip key={value} title={label}>
          <ToggleButton value={value} aria-label={label}>
            <Icon sx={{ fontSize: 18 }} />
          </ToggleButton>
        </Tooltip>
      ))}
    </ToggleButtonGroup>
  );
};

export default ThemeModeToggle;
