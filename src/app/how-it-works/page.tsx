"use client";
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
} from '@mui/material'
import {
  Link as LinkIcon,
  Sync as SyncIcon,
  AutoAwesome as AIIcon,
  CheckCircle as CheckIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
} from '@mui/icons-material'
import Link from 'next/link'
import Image from 'next/image'

const steps = [
  {
    label: 'Connect Your Accounts',
    description: 'One-click OAuth authentication',
    details: [
      'Connect Stripe in 30 seconds with OAuth',
      'Link your bank securely via Plaid (10,000+ banks supported)',
      'Authorize QuickBooks Online access',
      'All connections use industry-standard OAuth 2.0',
      'Your credentials are never stored',
    ],
    icon: <LinkIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
    time: '60 seconds',
  },
  {
    label: 'Real-Time Data Sync',
    description: 'Automatic synchronization across platforms',
    details: [
      'Stripe payouts and charges synced hourly',
      'Bank transactions updated in real-time',
      'QuickBooks data refreshed automatically',
      'Webhooks ensure instant updates',
      'Zero manual data entry required',
    ],
    icon: <SyncIcon sx={{ fontSize: 48, color: 'info.main' }} />,
    time: 'Continuous',
  },
  {
    label: 'AI-Powered Matching',
    description: '99.8% accuracy with machine learning',
    details: [
      'Advanced algorithms match Stripe payouts to bank deposits',
      'Multi-currency matching supported',
      'Fuzzy matching handles timing discrepancies',
      'Learns from your patterns over time',
      'Handles complex scenarios (refunds, fees, currency conversion)',
    ],
    icon: <AIIcon sx={{ fontSize: 48, color: 'success.main' }} />,
    time: '< 1 minute',
  },
  {
    label: 'Exception Handling',
    description: 'One-click resolution for discrepancies',
    details: [
      'Clearly flagged exceptions with detailed information',
      'One-click to create QuickBooks deposit entries',
      'Automatic categorization and account mapping',
      'Audit trail for all actions',
      'Bulk resolution for multiple exceptions',
    ],
    icon: <CheckIcon sx={{ fontSize: 48, color: 'success.main' }} />,
    time: '< 5 seconds per exception',
  },
]

const benefits = [
  {
    icon: <SpeedIcon sx={{ fontSize: 40 }} />,
    title: 'Save 20+ Hours Per Month',
    description: 'Eliminate manual reconciliation work',
    stat: '95%',
    statLabel: 'Time Saved',
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 40 }} />,
    title: '99.8% Accuracy Rate',
    description: 'AI-powered matching eliminates errors',
    stat: '99.8%',
    statLabel: 'Match Rate',
  },
  {
    icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
    title: 'Scale Effortlessly',
    description: 'Handle 10x transaction volume with ease',
    stat: '10x',
    statLabel: 'Scalability',
  },
]

export default function HowItWorksPage() {
  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      {/* Navigation */}
      <Box 
        component="nav" 
        sx={{ 
          bgcolor: 'white', 
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Image 
                src="/Finacly AI Logo - Abstract Finance Symbol.jpg" 
                alt="FinaclyAI" 
                width={40} 
                height={40}
                style={{ borderRadius: '8px' }}
              />
              <Typography variant="h6" fontWeight="bold" color="primary" component={Link} href="/" sx={{ textDecoration: 'none' }}>
                FinaclyAI
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={2}>
              <Button href="/pricing">Pricing</Button>
              <Button variant="contained" href="/#waitlist">Join Waitlist</Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Hero */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 10 },
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" fontWeight="bold" gutterBottom>
              See FinaclyAI in Action
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.95, mb: 4 }}>
              Automated reconciliation in 4 simple steps
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Workflow Steps */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              The Complete Workflow
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.8 }}>
              FinaclyAI automates your entire reconciliation process from end to end. 
              Here's exactly how it works:
            </Typography>

            <Stepper orientation="vertical">
              {steps.map((step, i) => (
                <Step key={i} active={true} completed={true}>
                  <StepLabel>
                    <Typography fontWeight="bold">{step.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {step.description} • {step.time}
                    </Typography>
                  </StepLabel>
                  <StepContent>
                    <Stack spacing={1} sx={{ mb: 2 }}>
                      {step.details.map((detail, j) => (
                        <Box key={j} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <CheckIcon sx={{ color: 'success.main', fontSize: 18, mt: 0.3 }} />
                          <Typography variant="body2" color="text.secondary">
                            {detail}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={4}>
              {steps.map((step, i) => (
                <Paper 
                  key={i} 
                  elevation={3} 
                  sx={{ 
                    p: 3,
                    transition: 'all 0.2s',
                    '&:hover': { boxShadow: 8, transform: 'translateX(8px)' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    {step.icon}
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {step.label}
                      </Typography>
                      <Chip label={step.time} size="small" color="primary" sx={{ mt: 0.5 }} />
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* Before/After Comparison */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
            Before vs. After FinaclyAI
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 6 }}>
            See the dramatic difference in your workflow
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', bgcolor: 'error.50', border: '2px solid', borderColor: 'error.main' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" fontWeight="bold" color="error.dark" gutterBottom>
                    ❌ Manual Process
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 3 }}>
                    {[
                      '20+ hours per month of manual work',
                      'Download CSV exports from each platform',
                      'Build complex Excel spreadsheets',
                      'Manually match line by line',
                      'Chase down discrepancies',
                      'Create QuickBooks entries one by one',
                      'High error rate (3-5%)',
                      'Delayed month-end close',
                    ].map((item, i) => (
                      <Typography key={i} variant="body2">
                        • {item}
                      </Typography>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', bgcolor: 'success.50', border: '2px solid', borderColor: 'success.main' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" fontWeight="bold" color="success.dark" gutterBottom>
                    ✅ With FinaclyAI
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 3 }}>
                    {[
                      'Less than 1 hour per month',
                      'Automatic data sync (no downloads)',
                      'AI matches everything instantly',
                      'Review only exceptions',
                      'One-click QuickBooks entries',
                      'Real-time reconciliation status',
                      '99.8% accuracy rate',
                      'Close books in hours, not days',
                    ].map((item, i) => (
                      <Typography key={i} variant="body2" fontWeight="500">
                        ✓ {item}
                      </Typography>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Benefits */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {benefits.map((benefit, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Paper elevation={3} sx={{ p: 4, height: '100%', textAlign: 'center' }}>
                <Box 
                  sx={{ 
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  {benefit.icon}
                </Box>
                <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
                  {benefit.stat}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  {benefit.statLabel}
                </Typography>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {benefit.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {benefit.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Ready to Automate Your Reconciliation?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.95 }}>
              Join the waitlist and be among the first to experience effortless reconciliation
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              href="/#waitlist"
              endIcon={<ArrowIcon />}
              sx={{ 
                bgcolor: 'white',
                color: 'primary.main',
                px: 6,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                '&:hover': { 
                  bgcolor: 'grey.100',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s',
              }}
            >
              Join the Waitlist
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ textAlign: 'center', opacity: 0.6 }}>
            © {new Date().getFullYear()} FinaclyAI. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

