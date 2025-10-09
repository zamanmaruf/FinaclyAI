'use client';

import { AppBar, Toolbar, Typography, Button, Box, IconButton, useTheme, useMediaQuery, Drawer, List, ListItem, ListItemButton, ListItemText, Divider, Chip, Menu, MenuItem, Badge } from '@mui/material';
import { Brightness4, Brightness7, Menu as MenuIcon, Close as CloseIcon, DeveloperMode as DevIcon } from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface NavigationProps {
  onThemeToggle?: () => void;
  currentTheme?: 'light' | 'dark';
}

export default function Navigation({ onThemeToggle, currentTheme = 'light' }: NavigationProps) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [devMenuAnchor, setDevMenuAnchor] = useState<null | HTMLElement>(null);
  
  // Check if we're in internal mode
  const { data: stripeStatus } = useSWR('/api/status/stripe', fetcher);
  const isInternalMode = stripeStatus?.mode === 'internal';

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Connect', href: '/connect' },
    { label: 'Dashboard', href: '/dashboard' },
  ];
  
  const devTools = [
    { label: 'Seed Stripe Payout', href: '/api/stripe/seed-payout', method: 'POST' },
    { label: 'Plaid Sandbox Link', href: '/api/plaid/sandbox-link', method: 'POST' },
    { label: 'QBO Debug Config', href: '/api/qbo/debug-config' },
    { label: 'Verification Scripts', href: '#verify', action: () => {
      alert('Run: npm run verify:day6 or npm run verify:day7');
    }},
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <>
      <AppBar position="sticky" elevation={2} sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography 
            variant="h5" 
            component={Link} 
            href="/" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 'bold', 
              textDecoration: 'none', 
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Box component="span" sx={{ fontSize: '1.5rem' }}>⚡</Box>
            FinaclyAI
          </Typography>

          {!isMobile ? (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  color="inherit"
                  component={Link}
                  href={item.href}
                  sx={{
                    fontWeight: isActive(item.href) ? 700 : 500,
                    borderBottom: isActive(item.href) ? '2px solid white' : 'none',
                    borderRadius: 0,
                    pb: 1,
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-2px)' }
                  }}
                >
                  {item.label}
                </Button>
              ))}
              
              {/* Developer Tools Badge (Internal Mode Only) */}
              {isInternalMode && (
                <>
                  <Chip
                    icon={<DevIcon />}
                    label="Dev Tools"
                    size="small"
                    onClick={(e) => setDevMenuAnchor(e.currentTarget)}
                    sx={{ 
                      ml: 1,
                      bgcolor: 'warning.main',
                      color: 'warning.contrastText',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { transform: 'scale(1.05)', bgcolor: 'warning.dark' }
                    }}
                  />
                  <Menu
                    anchorEl={devMenuAnchor}
                    open={Boolean(devMenuAnchor)}
                    onClose={() => setDevMenuAnchor(null)}
                  >
                    <MenuItem disabled>
                      <Typography variant="caption" fontWeight="bold">Internal Mode Tools</Typography>
                    </MenuItem>
                    <Divider />
                    {devTools.map((tool) => (
                      <MenuItem 
                        key={tool.label}
                        onClick={() => {
                          if (tool.action) {
                            tool.action();
                          } else if (tool.method === 'POST') {
                            fetch(tool.href, { method: 'POST' }).then(() => alert(`${tool.label} executed`));
                          } else {
                            window.open(tool.href, '_blank');
                          }
                          setDevMenuAnchor(null);
                        }}
                      >
                        {tool.label}
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}
              
              {onThemeToggle && (
                <IconButton 
                  color="inherit" 
                  onClick={onThemeToggle} 
                  sx={{ 
                    ml: 1,
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'rotate(180deg)' }
                  }}
                  aria-label={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`}
                >
                  {currentTheme === 'dark' ? <Brightness7 /> : <Brightness4 />}
                </IconButton>
              )}
            </Box>
          ) : (
            <IconButton 
              color="inherit" 
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h6" fontWeight="bold">
            Menu
          </Typography>
          <IconButton 
            onClick={() => setMobileMenuOpen(false)} 
            sx={{ color: 'white' }}
            aria-label="Close menu"
          >
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider />
        
        <List sx={{ pt: 0 }}>
          {navItems.map((item) => (
            <ListItem key={item.href} disablePadding>
              <ListItemButton
                component={Link}
                href={item.href}
                selected={isActive(item.href)}
                onClick={() => setMobileMenuOpen(false)}
              >
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive(item.href) ? 'bold' : 'normal'
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider />

        {onThemeToggle && (
          <Box sx={{ p: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={currentTheme === 'dark' ? <Brightness7 /> : <Brightness4 />}
              onClick={onThemeToggle}
            >
              {currentTheme === 'dark' ? 'Light' : 'Dark'} Mode
            </Button>
          </Box>
        )}
      </Drawer>
    </>
  );
}

