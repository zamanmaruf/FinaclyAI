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
  LinearProgress,
} from '@mui/material'
import {
  CheckCircle as CheckCircleIcon,
  AccountBalance as BankIcon,
  Payment as StripeIcon,
  Assessment as QboIcon,
  PlayArrow as TestIcon,
  Sync as SyncIcon,
} from '@mui/icons-material'
import Navigation from '@/components/Navigation'
import { useThemeMode } from '@/app/theme-provider'
import toast from 'react-hot-toast'

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ConnectPage() {
  const [stripeKey, setStripeKey] = useState('')
  const [connectingStripe, setConnectingStripe] = useState(false)
  const [connectingPlaid, setConnectingPlaid] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncComplete, setSyncComplete] = useState(false)
  const [syncCounts, setSyncCounts] = useState<any>(null)
  const { mode, toggleTheme } = useThemeMode()
  
  // Check provider status
  const { data: stripeStatus, mutate: mutateStripe } = useSWR('/api/status/stripe', fetcher, { refreshInterval: 5000 });
  const { data: plaidStatus, mutate: mutatePlaid } = useSWR('/api/status/plaid', fetcher, { refreshInterval: 5000 });
  const { data: qboStatus, mutate: mutateQbo } = useSWR('/api/status/qbo', fetcher, { refreshInterval: 5000 });

  const stripeConnected = stripeStatus?.connected === true
  const plaidConnected = plaidStatus?.connected === true
  const qboConnected = qboStatus?.connected === true
  const allConnected = stripeConnected && plaidConnected && qboConnected

  const publicMode = stripeStatus?.mode === 'production'

  // Check URL params for OAuth callbacks
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const stripeResult = params.get('stripe')
    const message = params.get('message')
    
    if (stripeResult === 'success') {
      toast.success('Stripe connected successfully!')
      mutateStripe()
      // Clean URL
      window.history.replaceState({}, '', '/connect')
    } else if (stripeResult === 'error') {
      toast.error(`Stripe connection failed: ${message || 'Unknown error'}`)
      // Clean URL
      window.history.replaceState({}, '', '/connect')
    }
  }, [mutateStripe])

  async function connectStripeOAuth() {
    setConnectingStripe(true)
    const toastId = toast.loading('Redirecting to Stripe...');
    
    try {
      const response = await fetch('/api/connect/stripe/start', {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (data.url) {
        toast.success('Redirecting to Stripe...', { id: toastId })
        window.location.href = data.url
      } else if (data.usePasteKey) {
        toast.dismiss(toastId)
        toast.info('Stripe Connect not configured. Use paste-key flow below.')
        setConnectingStripe(false)
      } else {
        toast.error(data.error || 'Failed to start Stripe connection', { id: toastId })
        setConnectingStripe(false)
      }
    } catch (error) {
      toast.error('Network error while connecting Stripe', { id: toastId })
      setConnectingStripe(false)
    }
  }

  async function connectStripePasteKey() {
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
        await mutateStripe()
      } else {
        toast.error('Failed to connect Stripe. Check your key.', { id: toastId })
      }
    } catch (error) {
      toast.error('Network error while connecting Stripe', { id: toastId })
    } finally {
      setConnectingStripe(false)
    }
  }

  async function connectPlaidLink() {
    setConnectingPlaid(true)
    const toastId = toast.loading('Loading Plaid Link...')
    
    try {
      // Get link token
      const linkTokenResponse = await fetch('/api/connect/plaid/link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user-1' }),
      })
      
      if (!linkTokenResponse.ok) {
        throw new Error('Failed to create link token')
      }
      
      const { linkToken } = await linkTokenResponse.json()
      
      // Initialize Plaid Link (you'll need to add Plaid Link SDK)
      toast.success('Opening Plaid Link...', { id: toastId })
      
      // For now, show message that Plaid Link SDK needs to be added
      toast.info('Plaid Link integration requires adding @plaid/link SDK to the UI', { id: toastId })
      setConnectingPlaid(false)
      
      // TODO: Implement Plaid Link with SDK
      // const handler = Plaid.create({
      //   token: linkToken,
      //   onSuccess: async (publicToken) => {
      //     await exchangePlaidToken(publicToken)
      //   },
      // })
      // handler.open()
    } catch (error: any) {
      toast.error(`Failed to connect Plaid: ${error.message}`, { id: toastId })
      setConnectingPlaid(false)
    }
  }

  async function connectPlaidSandbox() {
    setConnectingPlaid(true)
    const toastId = toast.loading('Connecting to Plaid sandbox...')
    
    try {
      const response = await fetch('/api/plaid/sandbox-link', { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'test'}` }
      })
      if (response.ok) {
        toast.success('Plaid sandbox account connected successfully!', { id: toastId })
        await mutatePlaid()
      } else {
        toast.error('Failed to connect Plaid sandbox', { id: toastId })
      }
    } catch (error) {
      toast.error('Error connecting Plaid', { id: toastId })
    } finally {
      setConnectingPlaid(false)
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
      else if (service === 'qbo') endpoint = `/api/qbo/ping?realmId=${qboStatus?.realmId || 'unknown'}`

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

  async function syncNow() {
    setSyncing(true)
    setSyncComplete(false)
    const toastId = toast.loading('Syncing all providers...')
    
    try {
      const response = await fetch('/api/sync/all', { method: 'POST' })
      const result = await response.json()
      
      if (result.ok) {
        toast.success('Sync complete!', { id: toastId })
        setSyncCounts(result.counts)
        setSyncComplete(true)
        // Refresh all status
        await Promise.all([mutateStripe(), mutatePlaid(), mutateQbo()])
      } else {
        toast.error(result.error || 'Sync failed', { id: toastId })
      }
    } catch (error) {
      toast.error('Network error during sync', { id: toastId })
    } finally {
      setSyncing(false)
    }
  }

  const connectionProgress = [stripeConnected, plaidConnected, qboConnected].filter(Boolean).length
  const totalServices = 3

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navigation onThemeToggle={toggleTheme} currentTheme={mode} />

      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 4, px: 3, boxShadow: 2 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h1" fontWeight="bold">
            Connect Your Services
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
            {publicMode 
              ? 'Securely connect your Stripe, Bank, and QuickBooks accounts via OAuth'
              : 'Connect your services for automated reconciliation (Internal Mode)'}
          </Typography>
          
          {/* Progress indicator */}
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">
                {connectionProgress} of {totalServices} services connected
              </Typography>
              <Typography variant="body2">
                {Math.round((connectionProgress / totalServices) * 100)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(connectionProgress / totalServices) * 100}
              sx={{ height: 8, borderRadius: 1 }}
            />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Grid container spacing={3}>
          {/* Stripe Connection */}
          <Grid item xs={12} md={4}>
            <Fade in timeout={300}>
              <Card 
                elevation={stripeConnected ? 4 : 2}
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'all 0.2s',
                  border: stripeConnected ? '2px solid' : 'none',
                  borderColor: 'success.main',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StripeIcon sx={{ fontSize: 40, color: '#635BFF', mr: 2 }} />
                      <Typography variant="h6" fontWeight="bold">
                        Stripe
                      </Typography>
                    </Box>
                    {stripeConnected && (
                      <CheckCircleIcon sx={{ color: 'success.main', fontSize: 32 }} />
                    )}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {publicMode 
                      ? 'Connect via Stripe Connect for secure payment data access'
                      : 'Sync payments and payouts for revenue tracking'}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  {stripeConnected ? (
                    <Alert severity="success" sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        Connected{stripeStatus?.livemode ? ' (Live mode)' : ''}
                      </Typography>
                      {stripeStatus?.accountId && (
                        <Typography variant="caption" display="block" sx={{ mt: 0.5, opacity: 0.8 }}>
                          Account: {stripeStatus.accountId}
                        </Typography>
                      )}
                    </Alert>
                  ) : publicMode ? (
                    <Typography variant="caption" color="text.secondary">
                      You'll be redirected to Stripe to authorize access
                    </Typography>
                  ) : (
                    <TextField
                      fullWidth
                      type="password"
                      label="Stripe Secret Key"
                      placeholder="sk_test_..."
                      size="small"
                      value={stripeKey}
                      onChange={(e) => setStripeKey(e.target.value)}
                      helperText="Internal mode: paste your API key"
                      sx={{ mb: 1 }}
                    />
                  )}
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0, gap: 1, flexWrap: 'wrap' }}>
                  {!stripeConnected ? (
                    publicMode ? (
                      <Button
                        fullWidth
                        variant="contained"
                        disabled={connectingStripe}
                        startIcon={connectingStripe ? <CircularProgress size={20} /> : <StripeIcon />}
                        onClick={connectStripeOAuth}
                      >
                        {connectingStripe ? 'Redirecting...' : 'Connect with Stripe'}
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        variant="contained"
                        disabled={connectingStripe || !stripeKey}
                        startIcon={connectingStripe ? <CircularProgress size={20} /> : <StripeIcon />}
                        onClick={connectStripePasteKey}
                      >
                        {connectingStripe ? 'Connecting...' : 'Connect Stripe'}
                      </Button>
                    )
                  ) : (
                    <Button
                      fullWidth
                      size="small"
                      startIcon={<TestIcon />}
                      onClick={() => testConnection('stripe')}
                    >
                      Test Connection
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Fade>
          </Grid>

          {/* Bank/Plaid Connection */}
          <Grid item xs={12} md={4}>
            <Fade in timeout={400}>
              <Card 
                elevation={plaidConnected ? 4 : 2}
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'all 0.2s',
                  border: plaidConnected ? '2px solid' : 'none',
                  borderColor: 'success.main',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BankIcon sx={{ fontSize: 40, color: '#00D09C', mr: 2 }} />
                      <Typography variant="h6" fontWeight="bold">
                        Bank Account
                      </Typography>
                    </Box>
                    {plaidConnected && (
                      <CheckCircleIcon sx={{ color: 'success.main', fontSize: 32 }} />
                    )}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {publicMode 
                      ? 'Connect your bank via Plaid for real-time transaction data'
                      : 'Link bank account for cash flow insights'}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  {plaidConnected ? (
                    <Alert severity="success" sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        Connected via Plaid
                      </Typography>
                      {plaidStatus?.institutionName && (
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                          {plaidStatus.institutionName} • {plaidStatus.accountsCount} account(s)
                        </Typography>
                      )}
                    </Alert>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      {publicMode 
                        ? 'Plaid supports 10,000+ banks with bank-level security'
                        : 'For testing: sandbox bank account'}
                    </Typography>
                  )}
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0, gap: 1, flexWrap: 'wrap' }}>
                  {!plaidConnected ? (
                    publicMode ? (
                      <Button
                        fullWidth
                        variant="contained"
                        color="info"
                        onClick={connectPlaidLink}
                        disabled={connectingPlaid}
                        startIcon={connectingPlaid ? <CircularProgress size={20} /> : <BankIcon />}
                      >
                        {connectingPlaid ? 'Loading...' : 'Connect Bank'}
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        variant="contained"
                        color="info"
                        onClick={connectPlaidSandbox}
                        disabled={connectingPlaid}
                        startIcon={connectingPlaid ? <CircularProgress size={20} /> : <BankIcon />}
                      >
                        {connectingPlaid ? 'Connecting...' : 'Connect Test Bank'}
                      </Button>
                    )
                  ) : (
                    <Button
                      fullWidth
                      size="small"
                      startIcon={<TestIcon />}
                      onClick={() => testConnection('plaid')}
                    >
                      Test Connection
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Fade>
          </Grid>

          {/* QuickBooks Connection */}
          <Grid item xs={12} md={4}>
            <Fade in timeout={500}>
              <Card 
                elevation={qboConnected ? 4 : 2}
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'all 0.2s',
                  border: qboConnected ? '2px solid' : 'none',
                  borderColor: 'success.main',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <QboIcon sx={{ fontSize: 40, color: '#2CA01C', mr: 2 }} />
                      <Typography variant="h6" fontWeight="bold">
                        QuickBooks
                      </Typography>
                    </Box>
                    {qboConnected && (
                      <CheckCircleIcon sx={{ color: 'success.main', fontSize: 32 }} />
                    )}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Authorize FinaclyAI to access your QuickBooks Online data for automated bookkeeping
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  {qboConnected ? (
                    <Alert severity="success" sx={{ mb: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        Connected
                      </Typography>
                      {qboStatus?.companyName && (
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                          {qboStatus.companyName}
                        </Typography>
                      )}
                    </Alert>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      You'll be redirected to Intuit for secure OAuth authentication
                    </Typography>
                  )}
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
                    <Button
                      fullWidth
                      size="small"
                      startIcon={<TestIcon />}
                      onClick={() => testConnection('qbo')}
                    >
                      Test Connection
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Fade>
          </Grid>
        </Grid>

        {/* Sync Now Section */}
        {allConnected && (
          <Fade in timeout={600}>
            <Paper elevation={3} sx={{ mt: 4, p: 4, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                🎉 All Services Connected!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                You're ready to sync and reconcile your financial data
              </Typography>
              
              <Button
                variant="contained"
                size="large"
                color="primary"
                disabled={syncing}
                startIcon={syncing ? <CircularProgress size={24} color="inherit" /> : <SyncIcon />}
                onClick={syncNow}
                sx={{ 
                  px: 6, 
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'scale(1.05)', boxShadow: 8 }
                }}
              >
                {syncing ? 'Syncing...' : 'Sync Now'}
              </Button>

              {syncComplete && syncCounts && (
                <Alert severity="success" sx={{ mt: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Sync Complete!
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="h4" color="primary">{syncCounts.payouts || 0}</Typography>
                      <Typography variant="caption">Payouts</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="h4" color="primary">{syncCounts.charges || 0}</Typography>
                      <Typography variant="caption">Charges</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="h4" color="primary">{syncCounts.bankTransactions || 0}</Typography>
                      <Typography variant="caption">Bank Transactions</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="h4" color="success.main">{syncCounts.matched || 0}</Typography>
                      <Typography variant="caption">Matched</Typography>
                    </Grid>
                  </Grid>
                  <Button
                    variant="outlined"
                    href="/dashboard"
                    sx={{ mt: 3 }}
                  >
                    View Dashboard →
                  </Button>
                </Alert>
              )}
            </Paper>
          </Fade>
        )}

        {/* Next Steps (when not all connected) */}
        {!allConnected && (
          <Paper elevation={2} sx={{ mt: 4, p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Next Steps
            </Typography>
            <Stack spacing={1} sx={{ pl: 2 }}>
              {!stripeConnected && <Typography variant="body2">• Connect Stripe to sync payment data</Typography>}
              {!plaidConnected && <Typography variant="body2">• Connect your bank for transaction data</Typography>}
              {!qboConnected && <Typography variant="body2">• Connect QuickBooks for automated bookkeeping</Typography>}
            </Stack>
          </Paper>
        )}
      </Container>
    </Box>
  );
}

