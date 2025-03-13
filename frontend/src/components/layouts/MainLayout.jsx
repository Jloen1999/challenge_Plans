import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { 
  Box, 
  Toolbar, 
  CssBaseline, 
  useTheme, 
  useMediaQuery, 
  Drawer, 
  Container 
} from '@mui/material';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import { ThemeContext } from '../../App';

const drawerWidth = 260;

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const location = useLocation();
  const { darkMode, toggleDarkMode } = React.useContext(ThemeContext);

  const handleDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  // Cierra el drawer móvil cuando cambia la ruta
  React.useEffect(() => {
    if (isMobile && mobileDrawerOpen) {
      setMobileDrawerOpen(false);
    }
  }, [location.pathname, isMobile]);

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* Barra superior */}
      <Navbar 
        drawerWidth={drawerWidth} 
        onMenuClick={handleDrawerToggle}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
      
      {/* Sidebar en modo móvil (drawer temporal) */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileDrawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Mejor rendimiento en móviles
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              width: drawerWidth,
              boxSizing: 'border-box'
            },
          }}
        >
          <Sidebar onItemClick={() => setMobileDrawerOpen(false)} />
        </Drawer>
      )}
      
      {/* Sidebar en modo escritorio (drawer permanente) */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid rgba(0, 0, 0, 0.06)'
            },
          }}
          open
        >
          <Sidebar />
        </Drawer>
      )}
      
      {/* Contenido principal */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, md: 3 }, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
        }}
      >
        <Toolbar /> {/* Espaciado para no ocultar contenido tras la AppBar */}
        <Container maxWidth="xl" sx={{ pb: 8 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;
