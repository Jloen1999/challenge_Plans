import React from 'react';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import { Brightness4 as DarkModeIcon, Brightness7 as LightModeIcon } from '@mui/icons-material';

const ThemeToggle = ({ darkMode, toggleDarkMode }) => {
  const theme = useTheme();
  
  return (
    <Tooltip title={darkMode ? "Modo claro" : "Modo oscuro"}>
      <IconButton 
        onClick={toggleDarkMode} 
        color="inherit"
        sx={{ ml: 1 }}
      >
        {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
