import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  MenuItem,
  Menu,
  Avatar,
  Tooltip,
  Divider,
  useMediaQuery,
  useTheme,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  MoreVert as MoreIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import toast from 'react-hot-toast';

const Navbar = ({ drawerWidth, onMenuClick, darkMode, toggleDarkMode }) => {
  const { currentUser, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElNotif, setAnchorElNotif] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const navigate = useNavigate();

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const isNotifMenuOpen = Boolean(anchorElNotif);

  // Simular notificaciones para demo
  const notificaciones = [
    {
      id: 'notif1',
      tipo: 'reto',
      titulo: 'Nuevo reto disponible',
      mensaje: 'Se ha publicado un nuevo reto de programación',
      fecha: new Date().toISOString(),
      leida: false
    },
    {
      id: 'notif2',
      tipo: 'plan',
      titulo: 'Plan actualizado',
      mensaje: 'Tu plan de estudio ha sido actualizado',
      fecha: new Date(Date.now() - 3600000).toISOString(),
      leida: true
    }
  ];

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleNotificationMenuOpen = (event) => {
    setAnchorElNotif(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setAnchorElNotif(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Sesión cerrada correctamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      toast.error('Error al cerrar sesión');
    }
  };

  const profileMenuId = 'primary-search-account-menu';
  const renderProfileMenu = (
    <Menu
      anchorEl={anchorEl}
      id={profileMenuId}
      keepMounted
      open={isMenuOpen}
      onClose={handleMenuClose}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
        <PersonIcon sx={{ mr: 1.5, fontSize: 20 }} color="primary" />
        Mi Perfil
      </MenuItem>
      <MenuItem component={Link} to="/settings" onClick={handleMenuClose}>
        <SettingsIcon sx={{ mr: 1.5, fontSize: 20 }} />
        Configuración
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>
        <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} color="error" />
        Cerrar Sesión
      </MenuItem>
    </Menu>
  );

  const notificationMenuId = 'primary-notification-menu';
  const renderNotificationMenu = (
    <Menu
      anchorEl={anchorElNotif}
      id={notificationMenuId}
      keepMounted
      open={isNotifMenuOpen}
      onClose={handleNotificationMenuClose}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: { 
          width: 320, 
          maxWidth: '100%',
        },
      }}
    >
      <Typography sx={{ p: 2, pb: 1 }} variant="h6">
        Notificaciones
      </Typography>
      <Divider />
      
      <List sx={{ pt: 0 }}>
        {notificaciones.length > 0 ? (
          notificaciones.map((notif) => (
            <ListItem 
              key={notif.id} 
              sx={{ 
                backgroundColor: notif.leida ? 'transparent' : 'action.hover',
                '&:hover': { backgroundColor: 'action.selected' },
              }}
              button
              onClick={handleNotificationMenuClose}
            >
              <ListItemAvatar>
                <Avatar>
                  <NotificationsIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary={notif.titulo} 
                secondary={notif.mensaje}
                primaryTypographyProps={{ 
                  fontWeight: notif.leida ? 'normal' : 'bold'
                }}
              />
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemText 
              primary="No hay notificaciones"
              sx={{ textAlign: 'center' }}
            />
          </ListItem>
        )}
      </List>
      
      <Divider />
      <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
        <Button size="small">Ver todas</Button>
      </Box>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={handleNotificationMenuOpen}>
        <IconButton
          size="large"
          aria-label="mostrar notificaciones"
          aria-controls={notificationMenuId}
          aria-haspopup="true"
          color="inherit"
        >
          <Badge badgeContent={notificaciones.filter(n => !n.leida).length} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notificaciones</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="cuenta del usuario"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <Avatar 
            alt={currentUser?.nombre} 
            src={currentUser?.avatar} 
            sx={{ width: 24, height: 24 }}
          />
        </IconButton>
        <p>Perfil</p>
      </MenuItem>
    </Menu>
  );

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        bgcolor: 'background.paper',
        color: 'text.primary',
        boxShadow: 1,
      }}
      elevation={0}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="abrir drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          variant="h6"
          noWrap
          component={Link}
          to="/"
          sx={{
            display: { xs: 'none', sm: 'block' },
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 'bold'
          }}
        >
          Challenge Plans
        </Typography>

        <Box sx={{ flexGrow: 1 }} />
        
        {/* Iconos de navegación para escritorio */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
          {/* Componente ThemeToggle */}
          <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

          <Tooltip title="Notificaciones">
            <IconButton
              size="large"
              aria-label="mostrar notificaciones"
              aria-controls={notificationMenuId}
              aria-haspopup="true"
              onClick={handleNotificationMenuOpen}
              color="inherit"
            >
              <Badge badgeContent={notificaciones.filter(n => !n.leida).length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Mi perfil">
            <IconButton
              size="large"
              edge="end"
              aria-label="cuenta del usuario"
              aria-controls={profileMenuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar 
                alt={currentUser?.nombre} 
                src={currentUser?.avatar}
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Menú móvil */}
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            size="large"
            aria-label="mostrar más"
            aria-controls={mobileMenuId}
            aria-haspopup="true"
            onClick={handleMobileMenuOpen}
            color="inherit"
          >
            <MoreIcon />
          </IconButton>
        </Box>
      </Toolbar>
      {renderMobileMenu}
      {renderProfileMenu}
      {renderNotificationMenu}
    </AppBar>
  );
};

export default Navbar;
