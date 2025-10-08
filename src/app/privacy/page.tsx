"use client";
import { Container, Typography, Box, Paper, Link } from '@mui/material';
import Navigation from '@/components/Navigation';
import { useThemeMode } from '@/app/theme-provider';

export default function PrivacyPolicyPage() {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Navigation onThemeToggle={toggleTheme} currentTheme={mode} />
      
      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
        <Paper elevation={2} sx={{ p: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            Privacy Policy
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Last Updated: October 8, 2025
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight="600">
              1. Introduction
            </Typography>
            <Typography paragraph>
              FinaclyAI ("we", "our", or "us") is committed to protecting your privacy and the security of your financial data. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our automated 
              reconciliation service.
            </Typography>

            <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mt: 3 }}>
              2. Information We Collect
            </Typography>
            <Typography paragraph>
              <strong>Financial Data:</strong> We access and process financial transaction data from:
            </Typography>
            <Typography component="ul" paragraph>
              <li>Stripe (payment processor): charges, payouts, balance transactions, and fees</li>
              <li>Plaid (bank connections): bank transactions, account balances, and transaction details</li>
              <li>QuickBooks (accounting software): invoices, payments, and deposit records</li>
            </Typography>
            <Typography paragraph>
              <strong>Account Information:</strong> Email address, company name, and basic account details.
            </Typography>
            <Typography paragraph>
              <strong>Usage Data:</strong> Sync history, matching results, exception resolutions, and system logs.
            </Typography>
            <Typography paragraph>
              <strong>Technical Data:</strong> IP addresses, browser type, device information, and access logs.
            </Typography>

            <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mt: 3 }}>
              3. How We Use Your Information
            </Typography>
            <Typography component="ul" paragraph>
              <li><strong>Service Delivery:</strong> Automate reconciliation between Stripe, bank accounts, and QuickBooks</li>
              <li><strong>Exception Detection:</strong> Identify and flag discrepancies requiring manual review</li>
              <li><strong>Auto-Remediation:</strong> Create QuickBooks deposits with proper fee accounting</li>
              <li><strong>System Improvement:</strong> Analyze patterns to enhance matching algorithms</li>
              <li><strong>Security:</strong> Monitor for unauthorized access and fraudulent activity</li>
              <li><strong>Compliance:</strong> Maintain audit trails as required by financial regulations</li>
            </Typography>

            <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mt: 3 }}>
              4. Data Security
            </Typography>
            <Typography paragraph>
              We implement industry-standard security measures:
            </Typography>
            <Typography component="ul" paragraph>
              <li><strong>Encryption:</strong> All data transmitted via HTTPS/TLS 1.3</li>
              <li><strong>Database Security:</strong> Encrypted at rest with access controls and firewall rules</li>
              <li><strong>API Token Management:</strong> Tokens stored securely and never exposed to frontend</li>
              <li><strong>Access Controls:</strong> Role-based permissions and multi-factor authentication</li>
              <li><strong>Audit Logging:</strong> Comprehensive logs of all data access and modifications</li>
              <li><strong>Regular Security Audits:</strong> Ongoing vulnerability assessments and penetration testing</li>
            </Typography>

            <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mt: 3 }}>
              5. Data Sharing and Disclosure
            </Typography>
            <Typography paragraph>
              <strong>We do NOT sell your data.</strong> We may share information only in these circumstances:
            </Typography>
            <Typography component="ul" paragraph>
              <li><strong>Service Providers:</strong> Stripe, Plaid, and QuickBooks for core functionality</li>
              <li><strong>Hosting:</strong> Vercel (platform) and database providers with strict data processing agreements</li>
              <li><strong>Legal Requirements:</strong> When required by law, court order, or regulatory authority</li>
              <li><strong>Business Transfer:</strong> In the event of merger, acquisition, or sale (with notice)</li>
            </Typography>

            <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mt: 3 }}>
              6. Data Retention
            </Typography>
            <Typography paragraph>
              We retain financial data for:
            </Typography>
            <Typography component="ul" paragraph>
              <li><strong>Active Accounts:</strong> As long as your account is active</li>
              <li><strong>Legal Requirements:</strong> Minimum 7 years for financial records (per IRS/tax regulations)</li>
              <li><strong>Audit Logs:</strong> 12 months for security and compliance purposes</li>
              <li><strong>Deleted Accounts:</strong> 90-day grace period, then permanent deletion (except legally required records)</li>
            </Typography>

            <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mt: 3 }}>
              7. Your Rights
            </Typography>
            <Typography paragraph>
              You have the right to:
            </Typography>
            <Typography component="ul" paragraph>
              <li><strong>Access:</strong> Request a copy of your data</li>
              <li><strong>Rectification:</strong> Correct inaccurate information</li>
              <li><strong>Erasure:</strong> Request deletion (subject to legal retention requirements)</li>
              <li><strong>Data Portability:</strong> Export your data in machine-readable format</li>
              <li><strong>Objection:</strong> Object to certain data processing activities</li>
              <li><strong>Withdrawal:</strong> Revoke consent for data collection at any time</li>
            </Typography>

            <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mt: 3 }}>
              8. Compliance
            </Typography>
            <Typography paragraph>
              FinaclyAI is committed to compliance with:
            </Typography>
            <Typography component="ul" paragraph>
              <li><strong>GDPR:</strong> EU General Data Protection Regulation</li>
              <li><strong>PIPEDA:</strong> Canadian Personal Information Protection and Electronic Documents Act</li>
              <li><strong>SOC 2:</strong> Roadmap for Type II certification</li>
              <li><strong>PCI DSS:</strong> Indirect compliance via Stripe and Plaid</li>
            </Typography>
            <Typography paragraph>
              <strong>Data Processing Agreements (DPA):</strong> Available upon request for enterprise customers.
            </Typography>

            <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mt: 3 }}>
              9. Cookies and Tracking
            </Typography>
            <Typography paragraph>
              We use essential cookies for:
            </Typography>
            <Typography component="ul" paragraph>
              <li>Session management and authentication</li>
              <li>Security and fraud prevention</li>
              <li>System performance monitoring</li>
            </Typography>
            <Typography paragraph>
              We do NOT use advertising or third-party tracking cookies.
            </Typography>

            <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mt: 3 }}>
              10. International Data Transfers
            </Typography>
            <Typography paragraph>
              Your data may be processed in the United States. We ensure adequate protection through:
            </Typography>
            <Typography component="ul" paragraph>
              <li>Standard Contractual Clauses (SCCs) for EU data</li>
              <li>Data processing agreements with all service providers</li>
              <li>Encryption in transit and at rest</li>
            </Typography>

            <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mt: 3 }}>
              11. Children's Privacy
            </Typography>
            <Typography paragraph>
              FinaclyAI is not intended for individuals under 18. We do not knowingly collect data from minors.
            </Typography>

            <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mt: 3 }}>
              12. Changes to This Policy
            </Typography>
            <Typography paragraph>
              We may update this policy periodically. Material changes will be communicated via email and dashboard notification. 
              Continued use after changes constitutes acceptance.
            </Typography>

            <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mt: 3 }}>
              13. Contact Us
            </Typography>
            <Typography paragraph>
              For privacy questions, data requests, or DPA inquiries:
            </Typography>
            <Typography paragraph>
              Email: <Link href="mailto:privacy@finaclyai.com">privacy@finaclyai.com</Link><br />
              Data Protection Officer: <Link href="mailto:dpo@finaclyai.com">dpo@finaclyai.com</Link>
            </Typography>

            <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Commitment to Security:</strong> We take data protection seriously. If you discover a security vulnerability, 
                please report it to <Link href="mailto:security@finaclyai.com">security@finaclyai.com</Link>.
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

