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
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Paper,
} from '@mui/material'
import {
  CheckCircle as CheckIcon,
  ExpandMore as ExpandIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material'
import Link from 'next/link'
import Image from 'next/image'

const pricingTiers = [
  {
    name: 'Starter',
    price: 149,
    period: '/month',
    description: 'Perfect for small businesses and startups',
    features: [
      'Up to 1,000 transactions per month',
      'Stripe + Bank + QuickBooks integration',
      'AI-powered auto-matching',
      'Automated exception handling',
      'Real-time sync',
      'Email support',
      'Audit trail and compliance',
      'Multi-currency support',
    ],
    cta: 'Join Waitlist',
    href: '/#waitlist',
  },
  {
    name: 'Growth',
    price: 399,
    period: '/month',
    description: 'For growing businesses scaling fast',
    features: [
      'Up to 10,000 transactions per month',
      'Everything in Starter, plus:',
      'Priority support (4-hour response)',
      'Advanced analytics and reporting',
      'Multi-user access (up to 5 users)',
      'Custom reconciliation rules',
      'API access',
      'Slack/Teams integration',
    ],
    cta: 'Join Waitlist',
    href: '/#waitlist',
    popular: true,
  },
  {
    name: 'Scale',
    price: 999,
    period: '/month',
    description: 'For enterprises with complex needs',
    features: [
      'Unlimited transactions',
      'Everything in Growth, plus:',
      'Dedicated account manager',
      'Custom integrations',
      'White-glove onboarding',
      'SLA guarantee (99.9% uptime)',
      'Advanced security controls',
      'Priority feature requests',
    ],
    cta: 'Contact Sales',
    href: 'mailto:finacly.ai.inc@gmail.com?subject=Enterprise Inquiry',
  },
]

const faqs = [
  {
    question: 'What counts as a transaction?',
    answer: 'A transaction is any Stripe payout, bank deposit, or charge that needs reconciliation. We count each unique item once, regardless of how many times it syncs.',
  },
  {
    question: 'Can I change plans later?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.',
  },
  {
    question: 'What happens if I exceed my transaction limit?',
    answer: 'We\'ll notify you when you reach 80% of your limit. You can upgrade anytime, and we\'ll automatically adjust your billing. We never stop syncing your data.',
  },
  {
    question: 'Do you offer annual billing?',
    answer: 'Yes! Save 20% with annual billing. Contact us for a custom quote.',
  },
  {
    question: 'Is my financial data secure?',
    answer: 'Absolutely. We use bank-level encryption (AES-256-GCM), OAuth authentication, and never store your credentials. We\'re SOC 2 compliant and working towards ISO 27001 certification.',
  },
  {
    question: 'What integrations are included?',
    answer: 'All plans include Stripe, Plaid (10,000+ banks), and QuickBooks Online. Additional integrations (Xero, NetSuite, etc.) available on Growth and Scale plans.',
  },
]

export default function PricingPage() {
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
            
            <Button startIcon={<BackIcon />} href="/">
              Back to Home
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Header */}
      <Box sx={{ bgcolor: 'grey.50', pt: 8, pb: 6 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" fontWeight="bold" gutterBottom>
              Simple, Transparent Pricing
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No hidden fees. No surprises. Cancel anytime.
            </Typography>
            <Chip label="14-day free trial on all plans" color="primary" sx={{ fontWeight: 'bold', mt: 1 }} />
          </Box>
        </Container>
      </Box>

      {/* Pricing Cards */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {pricingTiers.map((tier, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Card 
                elevation={tier.popular ? 12 : 3}
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: tier.popular ? '3px solid' : 'none',
                  borderColor: 'primary.main',
                  transform: tier.popular ? 'scale(1.05)' : 'none',
                  transition: 'all 0.3s',
                  '&:hover': { 
                    transform: tier.popular ? 'scale(1.08)' : 'scale(1.03)',
                    boxShadow: 16,
                  }
                }}
              >
                {tier.popular && (
                  <Box 
                    sx={{ 
                      bgcolor: 'primary.main',
                      color: 'white',
                      textAlign: 'center',
                      py: 1,
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                    }}
                  >
                    MOST POPULAR
                  </Box>
                )}
                
                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {tier.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 48 }}>
                    {tier.description}
                  </Typography>
                  
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h3" fontWeight="bold" component="span">
                      ${tier.price}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" component="span">
                      {tier.period}
                    </Typography>
                  </Box>

                  <Stack spacing={2} sx={{ mb: 4 }}>
                    {tier.features.map((feature, j) => (
                      <Box key={j} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                        <CheckIcon sx={{ color: 'success.main', fontSize: 20, mt: 0.3 }} />
                        <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>

                  <Button
                    fullWidth
                    variant={tier.popular ? 'contained' : 'outlined'}
                    size="large"
                    href={tier.href}
                    sx={{ 
                      py: 1.5,
                      fontWeight: 'bold',
                      ...(tier.popular && {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5568d3 0%, #653a8a 100%)',
                        }
                      })
                    }}
                  >
                    {tier.cta}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Enterprise Add-ons */}
        <Paper elevation={2} sx={{ mt: 8, p: 4, bgcolor: 'primary.main', color: 'white', textAlign: 'center' }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Need Something Custom?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.95 }}>
            We offer custom solutions for enterprises with unique requirements
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            href="mailto:finacly.ai.inc@gmail.com?subject=Custom Enterprise Solution"
            sx={{ 
              bgcolor: 'white',
              color: 'primary.main',
              fontWeight: 'bold',
              '&:hover': { bgcolor: 'grey.100' }
            }}
          >
            Contact Sales
          </Button>
        </Paper>
      </Container>

      {/* FAQs */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
            Frequently Asked Questions
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 6 }}>
            Everything you need to know about our pricing
          </Typography>

          <Stack spacing={2}>
            {faqs.map((faq, i) => (
              <Accordion key={i} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <AccordionSummary expandIcon={<ExpandIcon />}>
                  <Typography fontWeight="600">{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Still have questions?
            </Typography>
            <Button variant="outlined" href="mailto:finacly.ai.inc@gmail.com">
              Contact Us
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

