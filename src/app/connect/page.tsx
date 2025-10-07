"use client";
import useSWR from 'swr'
import { useState } from 'react'
import { Container, Grid, Card, CardContent, Typography, TextField, Button, Stack } from '@mui/material'
import ConnectButton from '@/src/components/ConnectButton'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ConnectPage() {
  const [stripeKey, setStripeKey] = useState('')
  const [savingStripe, setSavingStripe] = useState(false)
  const [plaidLoading, setPlaidLoading] = useState(false)

  // Connection states (simple checks)
  const { data: qboStatus } = useSWR<{ connected?: boolean }>(`/api/qbo/status?realmId=${encodeURIComponent('9341455460817411')}`, fetcher)
  const { data: plaidItem } = useSWR<{ ok: boolean }>(null, null)

  async function saveStripe() {
    try {
      setSavingStripe(true)
      await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey: stripeKey }),
      })
    } finally {
      setSavingStripe(false)
    }
  }

  async function connectPlaidSandbox() {
    setPlaidLoading(true)
    try {
      await fetch('/api/plaid/sandbox-link', { method: 'POST' })
    } finally {
      setPlaidLoading(false)
    }
  }

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <Typography variant="h4" gutterBottom>Connection Setup</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                <div>
                  <Typography variant="h6">Connect Stripe</Typography>
                  <Typography variant="body2" color="text.secondary">Enter your Stripe secret key (test key ok for MVP).</Typography>
                </div>
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 2 }}>
                <TextField type="password" label="Stripe Secret Key" fullWidth value={stripeKey} onChange={e=>setStripeKey(e.target.value)} />
                <ConnectButton label="Connect" onClick={saveStripe} loading={savingStripe} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                <div>
                  <Typography variant="h6">Connect QuickBooks</Typography>
                  <Typography variant="body2" color="text.secondary">Authorize Finacly to access your QBO sandbox.</Typography>
                </div>
                <Button variant="contained" href="/api/qbo/connect">Connect</Button>
              </Stack>
              {qboStatus?.connected && (
                <Typography sx={{ mt: 1 }} color="success.main">✅ Connected</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                <div>
                  <Typography variant="h6">Connect Plaid</Typography>
                  <Typography variant="body2" color="text.secondary">Use sandbox link to create a test bank item.</Typography>
                </div>
                <ConnectButton label="Connect Test Bank" onClick={connectPlaidSandbox} loading={plaidLoading} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}
