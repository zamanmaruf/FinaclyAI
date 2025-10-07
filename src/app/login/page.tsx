"use client";
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Container, Box, Typography, TextField, Button, Card } from '@mui/material'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const sp = useSearchParams()
  const next = sp.get('next') || '/dashboard'

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.replace(next)
    } else {
      setError('Invalid password')
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 12 }}>
      <Card sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>Sign in</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Enter the shared password to access Finacly AI.
        </Typography>
        <Box component="form" onSubmit={onSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
          />
          {error && (
            <Typography color="error" variant="body2">{error}</Typography>
          )}
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Continue
          </Button>
        </Box>
      </Card>
    </Container>
  )
}
