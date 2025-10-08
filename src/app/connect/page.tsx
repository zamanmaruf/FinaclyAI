"use client";
import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  CircularProgress,
  Divider,
  Fade,
  Alert,
  Chip,
  Stack,
} from '@mui/material'
import {
  CheckCircle as CheckCircleIcon,
  AccountBalance as BankIcon,
  Payment as StripeIcon,
  Assessment as QboIcon,
  Close as DisconnectIcon,
  PlayArrow as TestIcon,
} from '@mui/icons-material'
import Navigation from '@/components/Navigation'
import { useThemeMode } from '@/app/theme-provider'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ConnectPage() {
  const [stripeKey, setStripeKey] = useState('')
  const [connectingStripe, setConnectingStripe] = useState(false)
  const [plaidLoading, setPlaidLoading] = useState(false)
  const [disconnectDialog, setDisconnectDialog] = useState<{open: boolean, service: string} | null>(null)
  const { mode, toggleTheme } = useThemeMode()
  
  // Real connection status
  const { data: stats, mutate: mutateStats } = useSWR('/api/stats', fetcher);
  const { data: qboStatus, mutate: mutateQboStatus } = useSWR('/api/qbo/status', fetcher);

  const stripeConnected = stats?.matched !== undefined // If we have stats, Stripe is connected
  const plaidConnected = stats?.plaidConnected || false
  const qboConnected = qboStatus?.ok === true || qboStatus?.connected === true

  async function connectStripe() {
    if (!stripeKey || !stripeKey.startsWith('sk_')) {
      toast.error('Please enter a valid Stripe secret key')
      return
    }

    setConnectingStripe(true)
    const toastId = toast.loading('Connecting to Stripe...');
    
    try {
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey: stripeKey }),
      })
      
      if (response.ok) {
        toast.success('Stripe connected successfully!', { id: toastId })
        setStripeKey('')
        await mutateStats()
      } else {
        toast.error('Failed to connect Stripe. Check your key.', { id: toastId })
      }
    } catch (error) {
      toast.error('Network error while connecting Stripe', { id: toastId })
    } finally {
      setConnectingStripe(false)
    }
  }

  async function connectPlaidSandbox() {
    setPlaidLoading(true)
    const toastId = toast.loading('Connecting to Plaid sandbox...')
    
    try {
      const response = await fetch('/api/plaid/sandbox-link', { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'test'}` }
      })
      if (response.ok) {
        toast.success('Plaid sandbox account connected successfully!', { id: toastId })
        await mutateStats()
      } else {
        toast.error('Failed to connect Plaid sandbox', { id: toastId })
      }
    } catch (error) {
      toast.error('Error connecting Plaid', { id: toastId })
    } finally {
      setPlaidLoading(false)
    }
  }

  function connectQBO() {
    toast.loading('Redirecting to QuickBooks...', { duration: 2000 })
    setTimeout(() => {
      window.location.href = '/api/qbo/connect'
    }, 500)
  }

  async function testConnection(service: 'stripe' | 'plaid' | 'qbo') {
    const toastId = toast.loading(`Testing ${service} connection...`)
    
    try {
      let endpoint = ''
      if (service === 'stripe') endpoint = '/api/stripe/sync?days=1'
      else if (service === 'plaid') endpoint = '/api/plaid/transactions'
      else if (service === 'qbo') endpoint = `/api/qbo/ping?realmId=${qboStatus?.realmId}`

      const response = await fetch(endpoint, service === 'stripe' || service === 'plaid' ? { method: 'POST' } : {})
      
      if (response.ok) {
        toast.success(`${service.toUpperCase()} connection working perfectly!`, { id: toastId })
      } else {
        const data = await response.json()
        toast.error(`${service.toUpperCase()} test failed: ${data.message || 'Unknown error'}`, { id: toastId })
      }
    } catch (error) {
      toast.error(`Failed to test ${service}`, { id: toastId })
    }
  }

  async function disconnectService(service: 'stripe' | 'plaid' | 'qbo') {
    const toastId = toast.loading(`Disconnecting ${service}...`)
    
    try {
      // For now, show toast (actual disconnect endpoints would go here)
      toast.success(`${service.toUpperCase()} disconnected. Note: Implement actual disconnect API.`, { id: toastId })
      await mutateStats()
      await mutateQboStatus()
    } catch (error) {
      toast.error(`Failed to disconnect ${service}`, { id: toastId })
    }
    
    setDisconnectDialog(null)
  }

  const connectionProgress = [stripeConnected, plaidConnected, qboConnected].filter(Boolean).length
  const totalServices = 3

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Navigation onThemeToggle={toggleTheme} currentTheme={mode} />

      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 3, px: 3, boxShadow: 2 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h1" fontWeight="bold">
            Connect Your Services
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
            Link your Stripe, Bank, and QuickBooks accounts to enable automated reconciliation
          </Typography>
          
          {/* Progress indicator */}
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ flex: 1, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 1, height: 8, overflow: 'hidden' }}>
              <Box 
                sx={{ 
                  bgcolor: 'white', 
                  height: '100%', 
                  width: `${(connectionProgress / totalServices) * 100}%`,
                  transition: 'width 0.5s ease-in-out'
                }} 
              />
            </Box>
            <Typography variant="body2">
              {connectionProgress} / {totalServices} connected
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Grid container spacing={4}>
          {/* Stripe Connection */}
          <Grid item xs={12} md={4}>
            <Card 
              elevation={3} 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <StripeIcon sx={{ fontSize: 40, color: '#635BFF', mr: 2 }} />
                    <Typography variant="h5" fontWeight="bold">
                      Stripe
                    </Typography>
                  </Box>
                  {stripeConnected && (
                    <Chip label="Connected" size="small" color="success" icon={<CheckCircleIcon />} />
                  )}
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Connect your Stripe account to sync payments and payouts for revenue tracking
                </Typography>

                <Divider sx={{ my: 2 }} />

                {!stripeConnected ? (
                  <TextField
                    fullWidth
                    type="password"
                    label="Stripe Secret Key"
                    placeholder="sk_test_..."
                    size="small"
                    value={stripeKey}
                    onChange={(e) => setStripeKey(e.target.value)}
                    helperText="Enter your Stripe API secret key (starts with sk_test_ or sk_live_)"
                    sx={{ mb: 2 }}
                  />
                ) : (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight="medium">
                      Stripe is connected and syncing
                    </Typography>
                  </Alert>
                )}
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0, gap: 1, flexWrap: 'wrap' }}>
                {!stripeConnected ? (
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={connectingStripe || !stripeKey}
                    startIcon={connectingStripe ? <CircularProgress size={20} /> : <StripeIcon />}
                    onClick={connectStripe}
                  >
                    {connectingStripe ? 'Connecting...' : 'Connect Stripe'}
                  </Button>
                ) : (
                  <>
                    <Button
                      size="small"
                      startIcon={<TestIcon />}
                      onClick={() => testConnection('stripe')}
                      sx={{ flex: 1 }}
                    >
                      Test
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DisconnectIcon />}
                      onClick={() => setDisconnectDialog({ open: true, service: 'stripe' })}
                      sx={{ flex: 1 }}
                    >
                      Disconnect
                    </Button>
                  </>
                )}
              </CardActions>
            </Card>
          </Grid>

          {/* QuickBooks Connection */}
          <Grid item xs={12} md={4}>
            <Card 
              elevation={3} 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <QboIcon sx={{ fontSize: 40, color: '#2CA01C', mr: 2 }} />
                    <Typography variant="h5" fontWeight="bold">
                      QuickBooks
                    </Typography>
                  </Box>
                  {qboConnected && (
                    <Chip label="Connected" size="small" color="success" icon={<CheckCircleIcon />} />
                  )}
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Authorize FinaclyAI to access your QuickBooks Online data for automated bookkeeping
                </Typography>

                <Divider sx={{ my: 2 }} />

                {qboConnected ? (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight="medium">
                      Connected to QuickBooks
                    </Typography>
                    {qboStatus?.companyName && (
                      <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                        Company: {qboStatus.companyName}
                      </Typography>
                    )}
                    {qboStatus?.realmId && (
                      <Typography variant="caption" display="block" sx={{ opacity: 0.8 }}>
                        RealmID: {qboStatus.realmId}
                      </Typography>
                    )}
                  </Alert>
                ) : (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    You'll be redirected to Intuit to authorize access
                  </Alert>
                )}

                <Typography variant="caption" color="text.secondary">
                  We use OAuth 2.0 for secure authentication. Your credentials are never stored.
                </Typography>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0, gap: 1, flexWrap: 'wrap' }}>
                {!qboConnected ? (
                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    onClick={connectQBO}
                    startIcon={<QboIcon />}
                  >
                    Connect QuickBooks
                  </Button>
                ) : (
                  <>
                    <Button
                      size="small"
                      startIcon={<TestIcon />}
                      onClick={() => testConnection('qbo')}
                      sx={{ flex: 1 }}
                    >
                      Test
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DisconnectIcon />}
                      onClick={() => setDisconnectDialog({ open: true, service: 'qbo' })}
                      sx={{ flex: 1 }}
                    >
                      Disconnect
                    </Button>
                  </>
                )}
              </CardActions>
            </Card>
          </Grid>

          {/* Plaid/Bank Connection */}
          <Grid item xs={12} md={4}>
            <Card 
              elevation={3} 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <BankIcon sx={{ fontSize: 40, color: '#00D09C', mr: 2 }} />
                    <Typography variant="h5" fontWeight="bold">
                      Bank Account
                    </Typography>
                  </Box>
                  {plaidConnected && (
                    <Chip label="Connected" size="small" color="success" icon={<CheckCircleIcon />} />
                  )}
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Link your bank account via Plaid to get real-time transaction data and cash flow insights
                </Typography>

                <Divider sx={{ my: 2 }} />

                {plaidConnected ? (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography variant="body2" fontWeight="medium">
                      Bank account connected via Plaid
                    </Typography>
                    {stats?.plaidInstitution && (
                      <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                        Institution: {stats.plaidInstitution}
                      </Typography>
                    )}
                  </Alert>
                ) : (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    For testing, we'll connect a sandbox bank account
                  </Alert>
                )}

                <Typography variant="caption" color="text.secondary">
                  Plaid supports 10,000+ banks with bank-level security
                </Typography>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0, gap: 1, flexWrap: 'wrap' }}>
                {!plaidConnected ? (
                  <Button
                    fullWidth
                    variant="contained"
                    color="info"
                    onClick={connectPlaidSandbox}
                    disabled={plaidLoading}
                    startIcon={plaidLoading ? <CircularProgress size={20} /> : <BankIcon />}
                  >
                    {plaidLoading ? 'Connecting...' : 'Connect Test Bank'}
                  </Button>
                ) : (
                  <>
                    <Button
                      size="small"
                      startIcon={<TestIcon />}
                      onClick={() => testConnection('plaid')}
                      sx={{ flex: 1 }}
                    >
                      Test
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DisconnectIcon />}
                      onClick={() => setDisconnectDialog({ open: true, service: 'plaid' })}
                      sx={{ flex: 1 }}
                    >
                      Disconnect
                    </Button>
                  </>
                )}
              </CardActions>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Paper elevation={3} sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Next Steps
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            After connecting your services:
          </Typography>
          <Stack spacing={1} sx={{ pl: 2, mb: 3 }}>
            <Typography variant="body2">✓ Go to the Dashboard to run your first sync</Typography>
            <Typography variant="body2">✓ Review matched transactions and exceptions</Typography>
            <Typography variant="body2">✓ Use "Fix Now" to automatically resolve discrepancies</Typography>
          </Stack>
          <Button 
            variant="contained" 
            href="/dashboard" 
            size="large"
            disabled={connectionProgress === 0}
            sx={{
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
            }}
          >
            Go to Dashboard →
          </Button>
          {connectionProgress === 0 && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Connect at least one service to access the dashboard
            </Typography>
          )}
        </Paper>
      </Container>

      {/* Disconnect Confirmation Dialog */}
      {disconnectDialog && (
        <ConfirmDialog
          open={disconnectDialog.open}
          title={`Disconnect ${disconnectDialog.service.toUpperCase()}?`}
          message={`This will remove your ${disconnectDialog.service} connection. You'll need to reconnect to sync data again.`}
          confirmText="Disconnect"
          confirmColor="error"
          onConfirm={() => disconnectService(disconnectDialog.service as any)}
          onCancel={() => setDisconnectDialog(null)}
          dangerous
        />
      )}
    </Box>
  );
}

