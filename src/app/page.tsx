'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Link as MuiLink,
  Chip,
  CircularProgress,
  Fade
} from '@mui/material';
import {
  Payment as StripeIcon,
  AccountBalance as BankIcon,
  Assessment as QboIcon,
  CheckCircle as CheckIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import Navigation from '@/components/Navigation';
import { useThemeMode } from '@/app/theme-provider';
import toast from 'react-hot-toast';

const waitlistSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type WaitlistForm = z.infer<typeof waitlistSchema>;

export default function Home() {
  const [submitted, setSubmitted] = useState(false);
  const { mode, toggleTheme } = useThemeMode();
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<WaitlistForm>({
    resolver: zodResolver(waitlistSchema),
  });

  async function onSubmit(data: WaitlistForm) {
    const toastId = toast.loading('Joining waitlist...');
    
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        setSubmitted(true);
        reset();
        toast.success('You\'re on the list! We\'ll be in touch soon.', { id: toastId, duration: 5000 });
      } else {
        toast.error('Failed to join waitlist. Please try again.', { id: toastId });
      }
    } catch (err) {
      toast.error('Network error. Please try again.', { id: toastId });
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navigation onThemeToggle={toggleTheme} currentTheme={mode} />

      {/* Hero Section with Gradient */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
          color: 'white',
          py: 12,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" fontWeight="bold" gutterBottom>
            Reconcile Stripe, Bank & QuickBooks — in seconds
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.95, fontWeight: 300 }}>
            Finacly AI auto-matches payouts, charges, and accounting entries so month-end takes minutes, not days
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main', 
                px: 4, 
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': { bgcolor: 'grey.100' } 
              }}
              href="#waitlist"
            >
              Join Waitlist
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{ 
                borderColor: 'white', 
                color: 'white', 
                px: 4, 
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } 
              }}
              href="#how-it-works"
            >
              See How It Works
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Finacly in Action */}
      <Container maxWidth="lg" sx={{ py: 10 }} id="how-it-works">
        <Typography variant="h3" fontWeight="bold" textAlign="center" gutterBottom>
          Finacly in Action
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          Seamless integration across your financial stack
        </Typography>

        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <StripeIcon sx={{ fontSize: 60, color: '#635BFF', mb: 2 }} />
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Stripe
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sync payouts, charges, and balance transactions automatically
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.main', color: 'white', height: '100%' }}>
              <Box sx={{ fontSize: 60, mb: 2 }}>⚡</Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Finacly AI
              </Typography>
              <Chip 
                label="127 matched / 0 errors" 
                sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 'bold', mb: 2 }} 
                icon={<CheckIcon />}
              />
              <Typography variant="body2">
                AI-powered matching in real-time
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
                <BankIcon sx={{ fontSize: 60, color: '#00D09C' }} />
                <QboIcon sx={{ fontSize: 60, color: '#2CA01C' }} />
              </Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Bank + QuickBooks
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Reconcile deposits and sync to your books instantly
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Why Choose Finacly */}
      <Box sx={{ bgcolor: 'grey.50', py: 10 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" fontWeight="bold" textAlign="center" gutterBottom>
            Why Choose Finacly
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
            Built for modern finance teams who demand accuracy and speed
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <SpeedIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Automated Matching
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Our AI engine matches transactions with ±2 day tolerance and exact amounts, eliminating manual reconciliation
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Real-Time Processing
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Sync on-demand or schedule automatic updates. Know your numbers the moment they change
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <SecurityIcon sx={{ fontSize: 64, color: 'info.main', mb: 2 }} />
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Multi-Currency Ready
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Handle USD, EUR, GBP and more. All amounts stored in minor units with ISO currency codes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Beta CTA / Waitlist */}
      <Container maxWidth="md" sx={{ py: 10 }} id="waitlist">
        <Paper elevation={4} sx={{ p: 6, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Join the Beta Waitlist
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.95 }}>
            Be among the first to experience automated reconciliation. We'll notify you when we're ready.
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 500, mx: 'auto' }}>
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                {...register('email')}
                fullWidth
                type="email"
                placeholder="you@company.com"
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{ 
                  bgcolor: 'white', 
                  borderRadius: 1,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'transparent' },
                  },
                  '& .MuiFormHelperText-root': {
                    bgcolor: 'transparent',
                    color: 'white',
                    fontWeight: 600,
                  }
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
                sx={{ 
                  bgcolor: 'secondary.main', 
                  color: 'white', 
                  px: 4,
                  whiteSpace: 'nowrap',
                  '&:hover': { bgcolor: 'secondary.dark' } 
                }}
                endIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <ArrowIcon />}
              >
                {isSubmitting ? 'Joining...' : 'Join Beta'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Finacly AI
              </Typography>
              <Typography variant="body2" color="grey.400">
                Automated reconciliation for Stripe, Banks & QuickBooks. Bank-level security • SOC 2 in progress • Built for accountants.
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Product
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <MuiLink href="/connect" color="grey.400" underline="hover">
                  Connect
                </MuiLink>
                <MuiLink href="/dashboard" color="grey.400" underline="hover">
                  Dashboard
                </MuiLink>
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Legal
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <MuiLink href="#" color="grey.400" underline="hover">
                  Privacy Policy
                </MuiLink>
                <MuiLink href="#" color="grey.400" underline="hover">
                  Terms of Service
                </MuiLink>
              </Box>
            </Grid>
          </Grid>
          <Typography variant="body2" color="grey.500" textAlign="center" sx={{ mt: 4 }}>
            © {new Date().getFullYear()} Finacly AI. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
