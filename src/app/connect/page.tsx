"use client";
import { useState } from 'react'
import Link from 'next/link'
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
  Alert,
  CircularProgress,
  Divider,
  AppBar,
  Toolbar
} from '@mui/material'
import {
  CheckCircle as CheckCircleIcon,
  AccountBalance as BankIcon,
  Payment as StripeIcon,
  Assessment as QboIcon
} from '@mui/material-icons'

export default function ConnectPage() {
  const [stripeKey, setStripeKey] = useState('')
  const [savingStripe, setSavingStripe] = useState(false)
  const [stripeStatus, setStripeStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [plaidLoading, setPlaidLoading] = useState(false)

  async function saveStripe() {
    if (!stripeKey.trim()) {
      setStripeStatus('error')
      return
    }
    
    setSavingStripe(true)
    try {
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey: stripeKey }),
      })
      
      if (response.ok) {
        setStripeStatus('success')
        setStripeKey('')
      } else {
        setStripeStatus('error')
      }
    } catch (error) {
      setStripeStatus('error')
    } finally {
      setSavingStripe(false)
    }
  }

  async function connectPlaidSandbox() {
    setPlaidLoading(true)
    try {
      const response = await fetch('/api/plaid/sandbox-link', { method: 'POST' })
      if (response.ok) {
        alert('Plaid sandbox account connected successfully!')
      } else {
        alert('Failed to connect Plaid sandbox')
      }
    } catch (error) {
      alert('Error connecting Plaid')
    } finally {
      setPlaidLoading(false)
    }
  }

  function connectQBO() {
    // Redirect to QBO OAuth
    window.location.href = '/api/qbo/connect'
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Navigation */}
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Typography variant="h5" component={Link} href="/" sx={{ flexGrow: 1, fontWeight: 'bold', textDecoration: 'none', color: 'inherit' }}>
            Finacly AI
          </Typography>
          <Button color="inherit" component={Link} href="/connect">
            Connect
          </Button>
          <Button color="inherit" component={Link} href="/dashboard">
            Dashboard
          </Button>
        </Toolbar>
      </AppBar>

      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 3, px: 3, boxShadow: 2 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h1" fontWeight="bold">
            Connect Your Services
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
            Link your Stripe, Bank, and QuickBooks accounts to enable automated reconciliation
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Grid container spacing={4}>
          {/* Stripe Connection */}
          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <StripeIcon sx={{ fontSize: 40, color: '#635BFF', mr: 2 }} />
                  <Typography variant="h5" fontWeight="bold">
                    Stripe
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Connect your Stripe account to sync payments and payouts for revenue tracking
                </Typography>

                <Divider sx={{ my: 2 }} />

                <TextField
                  fullWidth
                  type="password"
                  label="Stripe Secret Key"
                  placeholder="sk_test_..."
                  value={stripeKey}
                  onChange={(e) => setStripeKey(e.target.value)}
                  size="small"
                  sx={{ mb: 2 }}
                  helperText="Enter your Stripe API secret key (starts with sk_test_ or sk_live_)"
                />

                {stripeStatus === 'success' && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Stripe connected successfully!
                  </Alert>
                )}
                {stripeStatus === 'error' && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    Failed to connect Stripe. Check your key.
                  </Alert>
                )}
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={saveStripe}
                  disabled={savingStripe || !stripeKey}
                  startIcon={savingStripe ? <CircularProgress size={20} /> : null}
                >
                  {savingStripe ? 'Connecting...' : 'Connect Stripe'}
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* QuickBooks Connection */}
          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <QboIcon sx={{ fontSize: 40, color: '#2CA01C', mr: 2 }} />
                  <Typography variant="h5" fontWeight="bold">
                    QuickBooks
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Authorize FinaclyAI to access your QuickBooks Online data for automated bookkeeping
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Alert severity="info" sx={{ mb: 2 }}>
                  You'll be redirected to Intuit to authorize access
                </Alert>

                <Typography variant="caption" color="text.secondary">
                  We use OAuth 2.0 for secure authentication. Your credentials are never stored.
                </Typography>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  onClick={connectQBO}
                  startIcon={<QboIcon />}
                >
                  Connect QuickBooks
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Plaid/Bank Connection */}
          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BankIcon sx={{ fontSize: 40, color: '#00D09C', mr: 2 }} />
                  <Typography variant="h5" fontWeight="bold">
                    Bank Account
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Link your bank account via Plaid to get real-time transaction data and cash flow insights
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Alert severity="info" sx={{ mb: 2 }}>
                  For testing, we'll connect a sandbox bank account
                </Alert>

                <Typography variant="caption" color="text.secondary">
                  Plaid supports 10,000+ banks with bank-level security
                </Typography>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
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
          <ol style={{ paddingLeft: '20px', margin: 0 }}>
            <li><Typography variant="body2">Go to the Dashboard to run your first sync</Typography></li>
            <li><Typography variant="body2">Review matched transactions and exceptions</Typography></li>
            <li><Typography variant="body2">Use "Fix Now" to automatically resolve discrepancies</Typography></li>
          </ol>
          <Box sx={{ mt: 3 }}>
            <Button variant="contained" href="/dashboard" size="large">
              Go to Dashboard →
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
