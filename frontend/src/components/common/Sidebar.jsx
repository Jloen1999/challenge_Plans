import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  Collapse,
  Toolbar,
  Badge
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  EmojiEvents as RetosIcon,
  MenuBook as PlanesIcon,
  AutoStories as ApuntesIcon,
  AccountCircle as ProfileIcon,
  ExpandLess,
  ExpandMore,
  Assignment as AssignmentIcon,
  Assignment as TareasIcon,
  Notifications as NotificationsIcon,
  Create as CreateIcon
} from '@mui/icons-material';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ onItemClick = () => {} }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [openRetos, setOpenRetos] = useState(false);
  const [openPlanes, setOpenPlanes] = useState(false);
  const [openApuntes, setOpenApuntes] = useState(false);

  const handleClick = (setOpenState) => {
    setOpenState(prev => !prev);
  };

  const isActive = (path) => {
    // Verificar rutas exactas
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    // Verificar rutas que comienzan con el path (excluyendo la raíz)
    if (path !== '/' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
      exact: true
    },
    {
      text: 'Retos',
      icon: <RetosIcon />,
      onClick: () => handleClick(setOpenRetos),
      open: openRetos,
      subItems: [
        {
          text: 'Explorar Retos',
          path: '/retos'
        },
        {
          text: 'Mis Retos',
          path: '/retos?filter=mios'
        },
        {
          text: 'Crear Reto',
          path: '/retos/create'
        }
      ]
    },
    {
      text: 'Planes de Estudio',
      icon: <PlanesIcon />,
      onClick: () => handleClick(setOpenPlanes),
      open: openPlanes,
      subItems: [
        {
          text: 'Explorar Planes',
          path: '/planes'
        },
        {
          text: 'Mis Planes',
          path: '/planes?filter=mios'
        },
        {
          text: 'Crear Plan',
          path: '/planes/create'
        }
      ]
    },
    {
      text: 'Apuntes',
      icon: <ApuntesIcon />,
      onClick: () => handleClick(setOpenApuntes),
      open: openApuntes,
      subItems: [
        {
          text: 'Biblioteca de Apuntes',
          path: '/apuntes'
        },
        {
          text: 'Mis Apuntes',
          path: '/apuntes?filter=mios'
        },
        {
          text: 'Crear Apunte',
          path: '/apuntes/create'
        }
      ]
    },
    {
      text: 'Mis Tareas',
      icon: <TareasIcon />,
      path: '/tareas'
    },
    {
      text: 'Mi Perfil',
      icon: <ProfileIcon />,
      path: '/profile'
    }
  ];

  return (
    <div>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
          <Typography variant="h6" component={Link} to="/" sx={{ 
            textDecoration: 'none', 
            color: 'text.primary',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <AssignmentIcon color="primary" />
            Challenge Plans
          </Typography>
        </Box>
      </Toolbar>
      
      <Divider />
      
      {/* Perfil del usuario */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <Avatar 
          src={currentUser?.avatar} 
          alt={currentUser?.nombre}
          component={Link}
          to="/profile"
          sx={{
            width: 40, 
            height: 40, 
            mr: 2,
            cursor: 'pointer',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.1)'
            }
          }}
        />
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
            {currentUser?.nombre || 'Usuario'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            Nivel {currentUser?.nivel || 1} • {currentUser?.puntaje || 0} pts
          </Typography>
        </Box>
      </Box>
      
      <Divider />
      
      {/* Menú principal */}
      <List sx={{ px: 2 }}>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={item.path ? Link : 'div'}
                to={item.path}
                onClick={item.onClick || (() => onItemClick())}
                selected={item.path ? isActive(item.path) : false}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {item.text === 'Notificaciones' ? (
                    <Badge badgeContent={3} color="error">
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText primary={item.text} />
                {item.subItems && (
                  item.open ? <ExpandLess /> : <ExpandMore />
                )}
              </ListItemButton>
            </ListItem>
            
            {/* Submenús desplegables */}
            {item.subItems && (
              <Collapse in={item.open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding sx={{ ml: 2 }}>
                  {item.subItems.map((subItem) => (
                    <ListItem key={subItem.text} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        component={Link}
                        to={subItem.path}
                        onClick={() => onItemClick()}
                        selected={isActive(subItem.path)}
                        sx={{
                          borderRadius: 2,
                          pl: 2,
                          '&.Mui-selected': {
                            backgroundColor: 'primary.light',
                            color: 'primary.contrastText',
                            '&:hover': {
                              backgroundColor: 'primary.main',
                            },
                          },
                        }}
                      >
                        <ListItemText 
                          primary={subItem.text}
                          primaryTypographyProps={{
                            variant: 'body2',
                            sx: { fontWeight: isActive(subItem.path) ? 600 : 400 }
                          }} 
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
      
      <Box sx={{ position: 'absolute', bottom: 0, width: '100%', p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Challenge Plans v1.0.0
        </Typography>
      </Box>
    </div>
  );
};

export default Sidebar;
