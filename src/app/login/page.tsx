"use client";
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  Alert
} from '@mui/material'
import { LockOutlined as LockIcon } from '@mui/icons-material'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const sp = useSearchParams()
  const next = sp.get('next') || '/dashboard'

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      
      if (res.ok) {
        router.replace(next)
      } else {
        setError('Invalid password. Please try again.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
        backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box 
              sx={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                bgcolor: 'primary.main', 
                color: 'white',
                borderRadius: '50%',
                width: 56,
                height: 56,
                mb: 2
              }}
            >
              <LockIcon fontSize="large" />
            </Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              FinaclyAI
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to access your reconciliation dashboard
            </Typography>
          </Box>

          <Box component="form" onSubmit={onSubmit}>
            <TextField
              fullWidth
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoFocus
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              size="large"
              disabled={loading || !password}
              sx={{ mt: 3, py: 1.5 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Automated Reconciliation for Stripe, Banks & QuickBooks
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
