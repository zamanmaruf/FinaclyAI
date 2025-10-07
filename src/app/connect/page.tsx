"use client";
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
  Alert
} from '@mui/material'
import {
  CheckCircle as CheckCircleIcon,
  AccountBalance as BankIcon,
  Payment as StripeIcon,
  Assessment as QboIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material'
import Navigation from '@/components/Navigation'
import { useThemeMode } from '@/app/theme-provider'
import toast from 'react-hot-toast'

const stripeSchema = z.object({
  secretKey: z.string().startsWith('sk_', 'Must be a valid Stripe secret key'),
});

type StripeForm = z.infer<typeof stripeSchema>;

export default function ConnectPage() {
  const [stripeConnected, setStripeConnected] = useState(false)
  const [plaidLoading, setPlaidLoading] = useState(false)
  const { mode, toggleTheme } = useThemeMode()
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<StripeForm>({
    resolver: zodResolver(stripeSchema),
  });

  async function onStripeSubmit(data: StripeForm) {
    const toastId = toast.loading('Connecting to Stripe...');
    
    try {
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (response.ok) {
        setStripeConnected(true)
        reset()
        toast.success('Stripe connected successfully!', { id: toastId })
      } else {
        toast.error('Failed to connect Stripe. Check your key.', { id: toastId })
      }
    } catch (error) {
      toast.error('Network error while connecting Stripe', { id: toastId })
    }
  }

  async function connectPlaidSandbox() {
    setPlaidLoading(true)
    const toastId = toast.loading('Connecting to Plaid sandbox...')
    
    try {
      const response = await fetch('/api/plaid/sandbox-link', { method: 'POST' })
      if (response.ok) {
        toast.success('Plaid sandbox account connected successfully!', { id: toastId })
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
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Grid container spacing={4}>
          {/* Stripe Connection */}
          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} component="form" onSubmit={handleSubmit(onStripeSubmit)}>
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
                  {...register('secretKey')}
                  fullWidth
                  type="password"
                  label="Stripe Secret Key"
                  placeholder="sk_test_..."
                  size="small"
                  error={!!errors.secretKey}
                  helperText={errors.secretKey?.message || "Enter your Stripe API secret key (starts with sk_test_ or sk_live_)"}
                  sx={{ mb: 2 }}
                />

                {stripeConnected && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: 'success.main' }}>
                    <CheckCircleIcon />
                    <Typography variant="body2" fontWeight="medium">Connected ✓</Typography>
                  </Box>
                )}
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                >
                  {isSubmitting ? 'Connecting...' : 'Connect Stripe'}
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
