import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useLocation, matchPath } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Box,
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
  useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import SearchIcon from '@mui/icons-material/Search';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { logout } from '../store/slices/authSlice';
import ThemeModeToggle from './ThemeModeToggle';
import NotificationBell from './Notifications/NotificationBell';

const DRAWER_WIDTH = 264;
const RAIL_WIDTH = 76;
const CONTENT_MAX_WIDTH = 1440;
const COLLAPSE_KEY = 'crm-sidebar-collapsed';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardOutlinedIcon />, path: '/', badge: null },
  { text: 'Leads', icon: <PeopleAltOutlinedIcon />, path: '/leads', badge: 'hot' },
  { text: 'Builders', icon: <BusinessOutlinedIcon />, path: '/builders', badge: null },
  { text: 'Investors', icon: <AccountBalanceOutlinedIcon />, path: '/investors', badge: null },
  { text: 'FB Ads Leads', icon: <FacebookOutlinedIcon />, path: '/fb-ads-leads', badge: 'new' },
  { text: 'Notifications', icon: <NotificationsNoneOutlinedIcon />, path: '/notifications', badge: null },
];

const whatsappItems = [
  { text: 'Templates', icon: <ArticleOutlinedIcon />, path: '/whatsapp/templates', whatsapp: true },
  { text: 'Campaigns', icon: <CampaignOutlinedIcon />, path: '/whatsapp/campaigns', whatsapp: true },
];

const getSettingsItems = (isAdmin) => {
  const items = [
    { text: 'Property Types', icon: <CategoryOutlinedIcon />, path: '/property-types' },
    { text: 'Property Conditions', icon: <BuildOutlinedIcon />, path: '/property-conditions' },
    { text: 'Landmarks', icon: <LocationOnOutlinedIcon />, path: '/landmarks' },
  ];
  if (isAdmin) {
    items.push({ text: 'Users', icon: <ManageAccountsOutlinedIcon />, path: '/users' });
  }
  return items;
};

// Titles for routes that are not in the menu (forms, detail pages)
const subRouteTitles = [
  { pattern: '/leads/new', title: 'New Lead' },
  { pattern: '/leads/edit/:id', title: 'Edit Lead' },
  { pattern: '/leads/view/:id', title: 'Lead Details' },
  { pattern: '/builders/new', title: 'New Builder' },
  { pattern: '/builders/edit/:id', title: 'Edit Builder' },
  { pattern: '/investors/new', title: 'New Investor' },
  { pattern: '/investors/edit/:id', title: 'Edit Investor' },
  { pattern: '/users/new', title: 'New User' },
  { pattern: '/users/edit/:id', title: 'Edit User' },
  { pattern: '/whatsapp/campaigns/new', title: 'New Campaign' },
  { pattern: '/whatsapp/campaigns/:id', title: 'Campaign Details' },
];

const readCollapsed = () => {
  try {
    return window.localStorage.getItem(COLLAPSE_KEY) === '1';
  } catch {
    return false;
  }
};

/** Section of nav items. `rail` = icon-only with tooltips. */
const NavSection = ({ title, items, rail, isActive, onNavigate, getBadgeColor }) => (
  <Box component="nav" aria-label={title} sx={{ mb: 1 }}>
    {rail ? (
      <Divider sx={{ mx: 2, my: 1 }} />
    ) : (
      <Typography
        variant="overline"
        component="div"
        sx={{ px: 3, pt: 1.5, pb: 0.5, color: 'text.secondary', fontSize: '0.68rem', lineHeight: 1.6 }}
      >
        {title}
      </Typography>
    )}
    <List disablePadding>
      {items.map((item) => {
        const active = isActive(item.path);
        const icon = item.badge ? (
          <Badge variant="dot" color={getBadgeColor(item.badge)} sx={{ '& .MuiBadge-badge': { right: 2, top: 2 } }}>
            {item.icon}
          </Badge>
        ) : (
          item.icon
        );
        const button = (
          <ListItemButton
            selected={active}
            aria-current={active ? 'page' : undefined}
            aria-label={rail ? item.text : undefined}
            onClick={() => onNavigate(item.path)}
            sx={{
              py: 1,
              justifyContent: rail ? 'center' : 'flex-start',
              px: rail ? 0 : 2,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: rail ? 0 : 38,
                justifyContent: 'center',
                ...(item.whatsapp && !active && { color: 'whatsapp.main' }),
              }}
            >
              {icon}
            </ListItemIcon>
            {!rail && (
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 600 : 500, noWrap: true }}
              />
            )}
          </ListItemButton>
        );
        return (
          <ListItem key={item.path} disablePadding>
            {rail ? (
              <Tooltip title={item.text} placement="right">
                {button}
              </Tooltip>
            ) : (
              button
            )}
          </ListItem>
        );
      })}
    </List>
  </Box>
);

const BrandMark = ({ size = 40 }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: 2.5,
      bgcolor: 'primary.main',
      color: 'primary.contrastText',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}
  >
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <path
        d="M55 15C35 15 20 30 20 50C20 70 35 85 55 85C70 85 80 75 85 65H65C60 65 55 60 55 55H95V50C95 28 78 15 55 15ZM55 30C45 30 40 38 40 50C40 62 45 70 55 70C62 70 67 65 70 60H55V45H80C78 35 68 30 55 30Z"
        fill="currentColor"
      />
    </svg>
  </Box>
);

const Layout = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { admin } = useSelector((state) => state.auth);

  // xs/sm: temporary drawer · md: icon rail · lg+: full sidebar (collapsible)
  const isLaptopUp = useMediaQuery(theme.breakpoints.up('lg'));
  const isTabletLandscapeUp = useMediaQuery(theme.breakpoints.up('md'));
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const permanent = isTabletLandscapeUp;
  const rail = permanent && (!isLaptopUp || collapsed);
  const sidebarWidth = permanent ? (rail ? RAIL_WIDTH : DRAWER_WIDTH) : 0;

  const isAdmin = admin?.role === 'admin';
  const settingsItems = useMemo(() => getSettingsItems(isAdmin), [isAdmin]);

  // Close the temporary drawer whenever the route changes or the screen grows
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, isTabletLandscapeUp]);

  const handleMenuButton = () => {
    if (isLaptopUp) {
      setCollapsed((prev) => {
        const next = !prev;
        try {
          window.localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
        } catch {
          /* ignore */
        }
        return next;
      });
    } else {
      setMobileOpen((prev) => !prev);
    }
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

  const isActive = useCallback(
    (path) => (path === '/' ? location.pathname === '/' : location.pathname === path || location.pathname.startsWith(`${path}/`)),
    [location.pathname]
  );

  const currentPageTitle = useMemo(() => {
    const sub = subRouteTitles.find(({ pattern }) => matchPath(pattern, location.pathname));
    if (sub) return sub.title;
    const all = [...menuItems, ...whatsappItems, ...settingsItems];
    const exact = all.find((item) => item.path === location.pathname);
    if (exact) return exact.text;
    return all.find((item) => item.path !== '/' && location.pathname.startsWith(item.path))?.text || 'Dashboard';
  }, [settingsItems, location.pathname]);

  const userInitial = admin?.name?.charAt(0)?.toUpperCase() || 'A';
  const userRole = admin?.role === 'admin' ? 'Administrator' : 'Agent';

  const renderDrawer = (isRail) => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      {/* Brand */}
      <Box
        sx={{
          height: { xs: 56, sm: 64 },
          px: isRail ? 0 : 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isRail ? 'center' : 'flex-start',
          gap: 1.5,
          flexShrink: 0,
        }}
      >
        <BrandMark size={isRail ? 38 : 40} />
        {!isRail && (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontSize: '1.05rem', lineHeight: 1.2 }} noWrap>
              RealEstate
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }} noWrap>
              CRM Platform
            </Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ mx: 2 }} />

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1 }}>
        <NavSection title="Main menu" items={menuItems} rail={isRail} isActive={isActive} onNavigate={navigate} getBadgeColor={getBadgeColor} />
        <NavSection title="WhatsApp" items={whatsappItems} rail={isRail} isActive={isActive} onNavigate={navigate} getBadgeColor={getBadgeColor} />
        <NavSection title="Settings" items={settingsItems} rail={isRail} isActive={isActive} onNavigate={navigate} getBadgeColor={getBadgeColor} />
      </Box>

      {/* Profile */}
      <Box sx={{ p: isRail ? 1 : 2, flexShrink: 0 }}>
        {isRail ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Tooltip title={`${admin?.name || 'Admin User'} · ${userRole}`} placement="right">
              <Avatar sx={{ width: 36, height: 36, fontSize: '0.875rem' }}>{userInitial}</Avatar>
            </Tooltip>
            <Tooltip title="Log out" placement="right">
              <IconButton size="small" aria-label="Log out" onClick={handleLogout} sx={{ color: 'text.secondary' }}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 3,
              bgcolor: 'surface.raised',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Avatar sx={{ width: 38, height: 38, fontSize: '0.9rem' }}>{userInitial}</Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                {admin?.name || 'Admin User'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap component="div">
                {userRole}
              </Typography>
            </Box>
            <Tooltip title="Log out">
              <IconButton
                size="small"
                aria-label="Log out"
                onClick={handleLogout}
                sx={{
                  color: 'text.secondary',
                  '&:hover': { color: 'error.main', bgcolor: (t) => alpha(t.palette.error.main, 0.1) },
                }}
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  );

  const widthTransition = theme.transitions.create(['width', 'margin'], {
    duration: theme.transitions.duration.shorter,
  });

  const menuLabel = isLaptopUp ? (collapsed ? 'Expand sidebar' : 'Collapse sidebar') : 'Open navigation menu';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { xs: '100%', md: `calc(100% - ${sidebarWidth}px)` },
          ml: { md: `${sidebarWidth}px` },
          transition: widthTransition,
        }}
      >
        <Toolbar sx={{ gap: { xs: 1, sm: 1.5 }, px: { xs: 1.5, sm: 2.5, lg: 3 } }}>
          <Tooltip title={menuLabel}>
            <IconButton edge="start" aria-label={menuLabel} onClick={handleMenuButton} sx={{ color: 'text.secondary' }}>
              {isLaptopUp && !collapsed ? <MenuOpenIcon /> : <MenuIcon />}
            </IconButton>
          </Tooltip>

          <Typography variant="h6" component="h1" noWrap sx={{ flex: 1, minWidth: 0, fontSize: { xs: '1.05rem', sm: '1.2rem' } }}>
            {currentPageTitle}
          </Typography>

          {!isPhone && (
            <Tooltip title="Search">
              <IconButton aria-label="Search" sx={{ color: 'text.secondary' }}>
                <SearchIcon />
              </IconButton>
            </Tooltip>
          )}

          <NotificationBell />

          <ThemeModeToggle compact={isPhone} />
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box component="aside" sx={{ width: { md: sidebarWidth }, flexShrink: { md: 0 }, transition: widthTransition }}>
        {/* Phones, tablets portrait, and the "expand" overlay on tablets landscape */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: { xs: 'min(86vw, 300px)', sm: DRAWER_WIDTH + 16 } },
          }}
        >
          {renderDrawer(false)}
        </Drawer>

        {/* Tablet landscape (rail) and laptop/desktop (full or collapsed) */}
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: sidebarWidth || RAIL_WIDTH,
              transition: widthTransition,
              overflowX: 'hidden',
            },
          }}
        >
          {renderDrawer(rail)}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { xs: '100%', md: `calc(100% - ${sidebarWidth}px)` },
          minHeight: '100vh',
          transition: widthTransition,
        }}
      >
        <Toolbar />
        <Box
          className="fade-in"
          key={location.pathname}
          sx={{
            maxWidth: CONTENT_MAX_WIDTH,
            mx: 'auto',
            px: { xs: 2, sm: 3, lg: 4 },
            py: { xs: 2, sm: 3 },
            pb: { xs: 'calc(16px + env(safe-area-inset-bottom, 0px))', sm: 4 },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
