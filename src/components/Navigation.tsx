'use client';

import { AppBar, Toolbar, Typography, Button, Box, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { Brightness4, Brightness7, Menu as MenuIcon } from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface NavigationProps {
  onThemeToggle?: () => void;
  currentTheme?: 'light' | 'dark';
}

export default function Navigation({ onThemeToggle, currentTheme = 'light' }: NavigationProps) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Connect', href: '/connect' },
    { label: 'Dashboard', href: '/dashboard' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
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
          Finacly AI
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
                }}
              >
                {item.label}
              </Button>
            ))}
            
            {onThemeToggle && (
              <IconButton color="inherit" onClick={onThemeToggle} sx={{ ml: 1 }}>
                {currentTheme === 'dark' ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            )}
          </Box>
        ) : (
          <IconButton color="inherit" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <MenuIcon />
          </IconButton>
        )}
      </Toolbar>

      {/* Mobile Menu - could be enhanced with Drawer */}
      {isMobile && mobileMenuOpen && (
        <Box sx={{ bgcolor: 'primary.dark', p: 2 }}>
          {navItems.map((item) => (
            <Button
              key={item.href}
              color="inherit"
              component={Link}
              href={item.href}
              fullWidth
              sx={{ justifyContent: 'flex-start', mb: 1 }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      )}
    </AppBar>
  );
}
