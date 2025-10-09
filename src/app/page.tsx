"use client";
import { useState } from 'react'
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Grid,
  Card,
  CardContent,
  TextField,
  Paper,
  Stack,
  Chip,
  Fade,
  Divider,
} from '@mui/material'
import {
  CheckCircle as CheckIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  AutoAwesome as AIIcon,
  Assessment as AnalyticsIcon,
  CloudSync as SyncIcon,
  AccountBalance as BankIcon,
  Payment as StripeIcon,
  Assessment as QboIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function LandingPage() {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  async function handleWaitlistSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, company, email }),
      })

      if (response.ok) {
        toast.success('Thanks for joining! We\'ll be in touch soon.')
        setName('')
        setCompany('')
        setEmail('')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to join waitlist')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box sx={{ bgcolor: 'background.default', overflow: 'hidden' }}>
      {/* Navigation */}
      <Box 
        component="nav" 
        sx={{ 
          position: 'sticky', 
          top: 0, 
          bgcolor: 'rgba(255, 255, 255, 0.9)', 
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
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
              <Typography variant="h6" fontWeight="bold" color="primary">
                FinaclyAI
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Button color="inherit" href="/how-it-works">How It Works</Button>
              <Button color="inherit" href="/pricing">Pricing</Button>
              <Button variant="contained" href="#waitlist">Join Waitlist</Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          pt: { xs: 8, md: 12 },
          pb: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated Background Shapes */}
        <Box 
          sx={{ 
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            filter: 'blur(80px)',
          }}
        />
        <Box 
          sx={{ 
            position: 'absolute',
            bottom: -50,
            left: -50,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            filter: 'blur(60px)',
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Fade in timeout={600}>
                <Box>
                  <Chip 
                    label="AI-Powered Reconciliation" 
                    sx={{ 
                      bgcolor: 'rgba(255,255,255,0.2)', 
                      color: 'white',
                      fontWeight: 'bold',
                      mb: 2,
                    }} 
                  />
                  <Typography 
                    variant="h2" 
                    fontWeight="bold" 
                    sx={{ 
                      mb: 3,
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      lineHeight: 1.2,
                    }}
                  >
                    Automate Financial Reconciliation in Minutes
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 4, 
                      opacity: 0.95,
                      lineHeight: 1.6,
                      fontWeight: 400,
                    }}
                  >
                    AI-powered platform that syncs Stripe, your bank, and QuickBooks automatically. 
                    Save hours every month and eliminate reconciliation errors.
                  </Typography>
                  
                  <Stack direction="row" spacing={2}>
                    <Button 
                      variant="contained" 
                      size="large"
                      href="#waitlist"
                      sx={{ 
                        bgcolor: 'white',
                        color: 'primary.main',
                        px: 4,
                        py: 1.5,
                        fontWeight: 'bold',
                        '&:hover': { 
                          bgcolor: 'grey.100',
                          transform: 'translateY(-2px)',
                          boxShadow: 8,
                        },
                        transition: 'all 0.2s',
                      }}
                    >
                      Join the Waitlist
                    </Button>
                    <Button 
                      variant="outlined" 
                      size="large"
                      href="/how-it-works"
                      endIcon={<ArrowIcon />}
                      sx={{ 
                        borderColor: 'white',
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        fontWeight: 'bold',
                        '&:hover': { 
                          borderColor: 'white',
                          bgcolor: 'rgba(255,255,255,0.1)',
                        },
                      }}
                    >
                      See How It Works
                    </Button>
                  </Stack>
                </Box>
              </Fade>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Fade in timeout={800}>
                <Paper 
                  elevation={12} 
                  sx={{ 
                    p: 3,
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <StripeIcon sx={{ fontSize: 32, color: '#635BFF' }} />
                      <ArrowIcon sx={{ color: 'text.secondary' }} />
                      <BankIcon sx={{ fontSize: 32, color: '#00D09C' }} />
                      <ArrowIcon sx={{ color: 'text.secondary' }} />
                      <QboIcon sx={{ fontSize: 32, color: '#2CA01C' }} />
                    </Box>
                    <Divider />
                    <Typography variant="body2" color="text.secondary">
                      Seamlessly connects your entire financial stack
                    </Typography>
                    <Box>
                      {['Real-time sync', 'AI-powered matching', 'One-click fixes'].map((feature, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <CheckIcon sx={{ color: 'success.main', fontSize: 20 }} />
                          <Typography variant="body2" fontWeight="medium">{feature}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Stack>
                </Paper>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Problem/Solution Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="overline" color="primary" fontWeight="bold" sx={{ fontSize: '0.9rem' }}>
            The Challenge
          </Typography>
          <Typography variant="h3" fontWeight="bold" sx={{ mt: 1, mb: 2 }}>
            Manual Reconciliation is Killing Your Productivity
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
            Finance teams waste hours every week manually matching transactions across platforms
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {[
            { 
              icon: <SpeedIcon sx={{ fontSize: 48, color: 'error.main' }} />,
              title: 'Time-Consuming',
              description: 'Hours spent manually matching Stripe payouts to bank deposits and QuickBooks entries'
            },
            { 
              icon: <SecurityIcon sx={{ fontSize: 48, color: 'warning.main' }} />,
              title: 'Error-Prone',
              description: 'Human errors lead to mismatched records, audit issues, and compliance risks'
            },
            { 
              icon: <TrendingUpIcon sx={{ fontSize: 48, color: 'info.main' }} />,
              title: 'Hard to Scale',
              description: 'As transaction volume grows, the manual process becomes impossible to maintain'
            },
          ].map((problem, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Fade in timeout={600 + i * 200}>
                <Card elevation={2} sx={{ height: '100%', p: 2, textAlign: 'center' }}>
                  <CardContent>
                    <Box sx={{ mb: 2 }}>{problem.icon}</Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {problem.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {problem.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Box sx={{ bgcolor: 'grey.50', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" color="primary" fontWeight="bold" sx={{ fontSize: '0.9rem' }}>
              How It Works
            </Typography>
            <Typography variant="h3" fontWeight="bold" sx={{ mt: 1, mb: 2 }}>
              Reconciliation in 3 Simple Steps
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Set it up once, automate forever
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              {
                step: '01',
                title: 'Connect Your Accounts',
                description: 'Securely link Stripe, your bank (via Plaid), and QuickBooks with one-click OAuth. Takes less than 60 seconds.',
                icon: <SyncIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
              },
              {
                step: '02',
                title: 'AI-Powered Matching',
                description: 'Our AI automatically matches Stripe payouts to bank deposits and QuickBooks entries with 99.8% accuracy.',
                icon: <AIIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
              },
              {
                step: '03',
                title: 'One-Click Fixes',
                description: 'Review exceptions and resolve discrepancies with a single click. FinaclyAI handles the QuickBooks entries automatically.',
                icon: <CheckIcon sx={{ fontSize: 40, color: 'success.main' }} />,
              },
            ].map((step, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Fade in timeout={800 + i * 200}>
                  <Card 
                    elevation={3} 
                    sx={{ 
                      height: '100%',
                      p: 3,
                      position: 'relative',
                      transition: 'all 0.3s',
                      '&:hover': { transform: 'translateY(-8px)', boxShadow: 8 }
                    }}
                  >
                    <Box 
                      sx={{ 
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        fontSize: '4rem',
                        fontWeight: 'bold',
                        color: 'grey.100',
                        lineHeight: 1,
                      }}
                    >
                      {step.step}
                    </Box>
                    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                      <Box sx={{ mb: 2 }}>{step.icon}</Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {step.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        {step.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="overline" color="primary" fontWeight="bold" sx={{ fontSize: '0.9rem' }}>
            Features
          </Typography>
          <Typography variant="h3" fontWeight="bold" sx={{ mt: 1, mb: 2 }}>
            Everything You Need for Perfect Reconciliation
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {[
            { icon: <SyncIcon />, title: 'Real-Time Sync', description: 'Automatic syncing from Stripe, Plaid, and QuickBooks every hour' },
            { icon: <AIIcon />, title: 'AI-Powered Matching', description: 'Advanced algorithms match transactions with 99.8% accuracy' },
            { icon: <CheckIcon />, title: 'Automated Exception Handling', description: 'One-click resolution of discrepancies with QuickBooks integration' },
            { icon: <AnalyticsIcon />, title: 'Audit Trail', description: 'Complete history of all matches and changes for compliance' },
            { icon: <SecurityIcon />, title: 'Bank-Level Security', description: 'Encrypted tokens, OAuth authentication, and SOC 2 compliance' },
            { icon: <TrendingUpIcon />, title: 'Multi-Currency Support', description: 'Handle transactions in USD, EUR, GBP, and 135+ currencies' },
          ].map((feature, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Fade in timeout={600 + i * 100}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Box 
                    sx={{ 
                      width: 64,
                      height: 64,
                      borderRadius: '16px',
                      bgcolor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      fontSize: 32,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {feature.description}
                  </Typography>
                </Box>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Pricing Preview */}
      <Box sx={{ bgcolor: 'grey.50', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Simple, Transparent Pricing
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
              Choose the plan that fits your business
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {[
              { name: 'Starter', price: '$149', period: '/month', features: ['Up to 1,000 transactions/mo', 'All integrations', 'Email support'] },
              { name: 'Growth', price: '$399', period: '/month', features: ['Up to 10,000 transactions/mo', 'Priority support', 'Multi-user access'], popular: true },
              { name: 'Scale', price: '$999', period: '/month', features: ['Unlimited transactions', 'Dedicated support', 'White-glove onboarding'] },
            ].map((tier, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Fade in timeout={800 + i * 200}>
                  <Card 
                    elevation={tier.popular ? 8 : 3}
                    sx={{ 
                      height: '100%',
                      position: 'relative',
                      border: tier.popular ? '2px solid' : 'none',
                      borderColor: 'primary.main',
                      transform: tier.popular ? 'scale(1.05)' : 'none',
                      transition: 'all 0.2s',
                      '&:hover': { transform: tier.popular ? 'scale(1.08)' : 'scale(1.03)', boxShadow: 12 }
                    }}
                  >
                    {tier.popular && (
                      <Chip 
                        label="Most Popular" 
                        color="primary" 
                        size="small"
                        sx={{ 
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          fontWeight: 'bold',
                        }}
                      />
                    )}
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight="bold" color="text.secondary" gutterBottom>
                        {tier.name}
                      </Typography>
                      <Box sx={{ my: 3 }}>
                        <Typography variant="h3" fontWeight="bold" component="span">
                          {tier.price}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" component="span">
                          {tier.period}
                        </Typography>
                      </Box>
                      <Stack spacing={2} sx={{ mb: 3 }}>
                        {tier.features.map((feature, j) => (
                          <Box key={j} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckIcon sx={{ color: 'success.main', fontSize: 20 }} />
                            <Typography variant="body2">{feature}</Typography>
                          </Box>
                        ))}
                      </Stack>
                      <Button 
                        variant={tier.popular ? 'contained' : 'outlined'} 
                        fullWidth 
                        size="large"
                        href="#waitlist"
                        sx={{ fontWeight: 'bold' }}
                      >
                        Join Waitlist
                      </Button>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button href="/pricing" endIcon={<ArrowIcon />}>
              View Full Pricing Details
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Social Proof */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" fontWeight="bold" color="text.secondary" gutterBottom>
            Trusted by Finance Teams
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Join 100+ companies automating their reconciliation
          </Typography>
          
          {/* Stats */}
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {[
              { number: '10,000+', label: 'Transactions Reconciled' },
              { number: '99.8%', label: 'Matching Accuracy' },
              { number: '20hrs', label: 'Saved Per Month' },
            ].map((stat, i) => (
              <Grid item xs={12} sm={4} key={i}>
                <Typography variant="h3" fontWeight="bold" color="primary">
                  {stat.number}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {stat.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      {/* Waitlist CTA */}
      <Box 
        id="waitlist"
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Join the Waitlist
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.95 }}>
              Be among the first to automate your financial reconciliation
            </Typography>
          </Box>

          <Paper elevation={8} sx={{ p: 4, borderRadius: 3 }}>
            <form onSubmit={handleWaitlistSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="John Doe"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                    placeholder="Acme Inc."
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="email"
                    label="Work Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="john@company.com"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={submitting}
                    sx={{ 
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5568d3 0%, #653a8a 100%)',
                      }
                    }}
                  >
                    {submitting ? 'Joining...' : 'Join the Waitlist'}
                  </Button>
                </Grid>
              </Grid>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
                No credit card required. We'll notify you when we launch.
              </Typography>
            </form>
          </Paper>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Image 
                  src="/Finacly AI Logo - Abstract Finance Symbol.jpg" 
                  alt="FinaclyAI" 
                  width={32} 
                  height={32}
                  style={{ borderRadius: '6px' }}
                />
                <Typography variant="h6" fontWeight="bold">
                  FinaclyAI
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Automated financial reconciliation powered by AI
              </Typography>
            </Grid>
            
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Product
              </Typography>
              <Stack spacing={1}>
                <Link href="/how-it-works" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.8 }}>
                  <Typography variant="body2">How It Works</Typography>
                </Link>
                <Link href="/pricing" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.8 }}>
                  <Typography variant="body2">Pricing</Typography>
                </Link>
              </Stack>
            </Grid>
            
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Company
              </Typography>
              <Stack spacing={1}>
                <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.8 }}>
                  <Typography variant="body2">Privacy</Typography>
                </Link>
                <Link href="/terms" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.8 }}>
                  <Typography variant="body2">Terms</Typography>
                </Link>
              </Stack>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Contact
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                finacly.ai.inc@gmail.com
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Link href="/admin/login" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.5, fontSize: '0.75rem' }}>
                  Admin Login
                </Link>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

          <Typography variant="body2" sx={{ textAlign: 'center', opacity: 0.6 }}>
            © {new Date().getFullYear()} FinaclyAI. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

