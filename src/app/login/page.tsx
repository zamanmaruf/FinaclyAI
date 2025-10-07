'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if we're in dev mode (no SHARED_PASSWORD set)
  const isDev = !process.env.NEXT_PUBLIC_SHARED_PASSWORD;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        // Store session and redirect
        sessionStorage.setItem('authenticated', 'true');
        router.push('/dashboard');
      } else {
        const data = await response.json();
        setError(data.error || 'Invalid password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDevModeAccess = () => {
    sessionStorage.setItem('authenticated', 'true');
    router.push('/dashboard');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={8} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <LockIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              Finacly AI
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Automated Reconciliation Platform
            </Typography>
          </Box>

          {isDev && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight="medium" gutterBottom>
                Developer Mode
              </Typography>
              <Typography variant="caption">
                SHARED_PASSWORD is not set. Access is open for local testing.
              </Typography>
            </Alert>
          )}

          {isDev ? (
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleDevModeAccess}
              sx={{ py: 1.5 }}
            >
              Enter Dashboard (Dev Mode)
            </Button>
          ) : (
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                type="password"
                label="Access Password"
                placeholder="Enter shared password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                sx={{ mb: 3 }}
                autoFocus
              />

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading || !password}
                sx={{ py: 1.5 }}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </Button>
            </form>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 3 }}>
            Protected access for authorized personnel only
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
