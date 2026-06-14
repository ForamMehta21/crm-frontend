import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Divider,
  Tooltip,
  Badge,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BuildIcon from '@mui/icons-material/Build';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import CategoryIcon from '@mui/icons-material/Category';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CampaignIcon from '@mui/icons-material/Campaign';
import ArticleIcon from '@mui/icons-material/Article';
import { logout } from '../store/slices/authSlice';

const drawerWidth = 280;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/', badge: null },
  { text: 'Leads', icon: <PeopleIcon />, path: '/leads', badge: 'hot' },
  { text: 'Builders', icon: <BusinessIcon />, path: '/builders', badge: null },
  { text: 'Investors', icon: <AccountBalanceIcon />, path: '/investors', badge: null },
  { text: 'FB Ads Leads', icon: <PeopleIcon />, path: '/fb-ads-leads', badge: 'new' },
];

const whatsappItems = [
  { text: 'Templates', icon: <ArticleIcon />, path: '/whatsapp/templates' },
  { text: 'Campaigns', icon: <CampaignIcon />, path: '/whatsapp/campaigns' },
];

const getSettingsItems = (isAdmin) => {
  const items = [
    { text: 'Property Types', icon: <CategoryIcon />, path: '/property-types' },
    { text: 'Property Conditions', icon: <BuildIcon />, path: '/property-conditions' },
    { text: 'Landmarks', icon: <LocationOnIcon />, path: '/landmarks' },
  ];
  if (isAdmin) {
    items.push({ text: 'Users', icon: <ManageAccountsIcon />, path: '/users' });
  }
  return items;
};

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { admin } = useSelector((state) => state.auth);

  const isAdmin = admin?.role === 'admin';

  const settingsItems = useMemo(() => getSettingsItems(isAdmin), [isAdmin]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getBadgeColor = (badge) => {
    if (badge === 'hot') return 'error';
    if (badge === 'new') return 'success';
    return 'primary';
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 45,
            height: 45,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M55 15C35 15 20 30 20 50C20 70 35 85 55 85C70 85 80 75 85 65H65C60 65 55 60 55 55H95V50C95 28 78 15 55 15ZM55 30C45 30 40 38 40 50C40 62 45 70 55 70C62 70 67 65 70 60H55V45H80C78 35 68 30 55 30Z" fill="white"/>
          </svg>
        </Box>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            RealEstate
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            CRM Platform
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.1)', mx: 2 }} />

      {/* Main Menu */}
      <Box sx={{ px: 1, py: 2, flex: 1 }}>
        <Typography
          variant="overline"
          sx={{
            px: 2,
            py: 1,
            color: 'text.secondary',
            fontWeight: 600,
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
          }}
        >
          Main Menu
        </Typography>
        <List sx={{ py: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                aria-current={location.pathname === item.path ? 'page' : undefined}
                onClick={() => navigate(item.path)}
                sx={{
                  py: 1.2,
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon>
                  {item.badge ? (
                    <Badge
                      variant="dot"
                      color={getBadgeColor(item.badge)}
                      sx={{
                        '& .MuiBadge-badge': {
                          right: 2,
                          top: 2,
                        },
                      }}
                    >
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: location.pathname === item.path ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Typography
          variant="overline"
          sx={{
            px: 2,
            py: 1,
            mt: 2,
            color: 'text.secondary',
            fontWeight: 600,
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            display: 'block',
          }}
        >
          WhatsApp
        </Typography>
        <List sx={{ py: 1 }}>
          {whatsappItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  py: 1.2,
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon>
                  <WhatsAppIcon sx={{ color: '#25D366' }} />
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: location.pathname === item.path ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Typography
          variant="overline"
          sx={{
            px: 2,
            py: 1,
            mt: 2,
            color: 'text.secondary',
            fontWeight: 600,
            fontSize: '0.65rem',
            letterSpacing: '0.1em',
            display: 'block',
          }}
        >
          Settings
        </Typography>
        <List sx={{ py: 1 }}>
          {settingsItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  py: 1.2,
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: location.pathname === item.path ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* User Profile Section */}
      <Box
        sx={{
          p: 2,
          mx: 2,
          mb: 2,
          borderRadius: 3,
          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
          border: '1px solid',
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.15),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: 'text.primary' }}
              noWrap
            >
              {admin?.name || 'Admin User'}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary' }}
              noWrap
            >
              {admin?.role === 'admin' ? 'Administrator' : 'Agent'}
            </Typography>
          </Box>
          <Tooltip title="Logout">
            <IconButton
              size="small"
              aria-label="Logout"
              onClick={handleLogout}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'error.main',
                  backgroundColor: (theme) => alpha(theme.palette.error.main, 0.1),
                },
              }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );

  const currentPageTitle = useMemo(
    () => [...menuItems, ...settingsItems].find((item) => item.path === location.pathname)?.text || 'Dashboard',
    [settingsItems, location.pathname]
  );

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      }}
    >
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <IconButton
            color="inherit"
            aria-label="Open navigation menu"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h5"
              noWrap
              component="div"
              sx={{ fontWeight: 600, letterSpacing: '-0.02em' }}
            >
              {currentPageTitle}
            </Typography>
          </Box>

          {/* Search Button */}
          <Tooltip title="Search">
            <IconButton
              aria-label="Search"
              sx={{
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                },
              }}
            >
              <SearchIcon />
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              aria-label="Notifications"
              sx={{
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                },
              }}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Settings */}
          <Tooltip title="Settings">
            <IconButton
              aria-label="Settings"
              sx={{
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                },
              }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 27, 75, 0.98) 100%)',
              backdropFilter: 'blur(20px)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 27, 75, 0.98) 100%)',
              backdropFilter: 'blur(20px)',
              borderRight: '1px solid rgba(148, 163, 184, 0.08)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 3 },
          width: { xs: '100%', sm: `calc(100% - ${drawerWidth}px)` },
          maxWidth: { xs: '100vw', sm: `calc(100% - ${drawerWidth}px)` },
          minWidth: 0,
          overflow: 'hidden',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
