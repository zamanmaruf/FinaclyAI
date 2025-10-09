"use client";
import { Container, Typography, Box, Paper, Link } from '@mui/material';
import Navigation from '@/components/Navigation';
import { useThemeMode } from '@/app/theme-provider';

export default function TermsOfServicePage() {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Navigation onThemeToggle={toggleTheme} currentTheme={mode} />
      
      <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
        <Paper elevation={2} sx={{ p: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            Terms of Service
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Last Updated: October 8, 2025
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight="600">
              1. Acceptance of Terms
            </Typography>
            <Typography paragraph>
              By accessing and using FinaclyAI ("the Service"), you accept and agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use the Service.
            </Typography>

            <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mt: 3 }}>
              2. Service Description
            </Typography>
            <Typography paragraph>
              FinaclyAI provides automated financial reconciliation services that:
            </Typography>
            <Typography component="ul" paragraph>
              <li>Connect to your Stripe, bank accounts (via Plaid), and QuickBooks</li>
              <li>Automatically match payouts to bank deposits</li>
              <li>Detect discrepancies and create exceptions for review</li>
              <li>Generate QuickBooks deposit entries with proper fee accounting</li>
            </Typography>

            <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mt: 3 }}>
              3. Beta Status and "As-Is" Provision
            </Typography>
            <Typography paragraph>
              <strong>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND.</strong>
            </Typography>
            <Typography paragraph>
              FinaclyAI is currently in BETA. We make no guarantees regarding:
            </Typography>
            <Typography component="ul" paragraph>
              <li>Accuracy of reconciliation matches</li>
              <li>Completeness of exception detection</li>
              <li>Service availability or uptime</li>
              <li>Data preservation during system updates</li>
            </Typography>
            <Typography paragraph>
              <strong>You are responsible for verifying all reconciliation results and maintaining backup records.</strong>
            </Typography>

            <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mt: 3 }}>
              4. User Responsibilities
            </Typography>
            <Typography paragraph>
              You agree to:
            </Typography>
            <Typography component="ul" paragraph>
              <li><strong>Accurate Information:</strong> Provide truthful and complete account information</li>
              <li><strong>Security:</strong> Maintain confidentiality of your login credentials</li>
              <li><strong>Verification:</strong> Review all auto-generated QuickBooks entries before finalizing books</li>
              <li><strong>Compliance:</strong> Use the Service in accordance with all applicable laws and regulations</li>
              <li><strong>Authorized Access:</strong> Ensure you have authority to connect third-party accounts (Stripe, Plaid, QuickBooks)</li>
            </Typography>

            <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mt: 3 }}>
              5. Prohibited Uses
            </Typography>
            <Typography paragraph>
              You may NOT:
            </Typography>
            <Typography component="ul" paragraph>
              <li>Use the Service for illegal activities or money laundering</li>
              <li>Attempt to reverse engineer, hack, or compromise system security</li>
              <li>Share your account with unauthorized parties</li>
              <li>Use automated scripts to abuse the Service</li>
              <li>Misrepresent your identity or affiliation</li>
            </Typography>

            <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mt: 3 }}>
              6. Third-Party Integrations
            </Typography>
            <Typography paragraph>
              FinaclyAI integrates with Stripe, Plaid, and QuickBooks. You acknowledge that:
            </Typography>
            <Typography component="ul" paragraph>
              <li>These integrations are subject to their respective Terms of Service</li>
              <li>We are not responsible for changes, outages, or data issues from third parties</li>
              <li>You grant us permission to access your data from these services</li>
              <li>You can revoke access at any time by disconnecting integrations</li>
            </Typography>

            <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mt: 3 }}>
              7. Data Ownership and License
            </Typography>
            <Typography paragraph>
              <strong>You retain ownership of your financial data.</strong>
            </Typography>
            <Typography paragraph>
              By using the Service, you grant us a limited license to:
            </Typography>
            <Typography component="ul" paragraph>
              <li>Access and process your financial data for reconciliation purposes</li>
              <li>Store transaction data securely in our databases</li>
              <li>Use anonymized, aggregated data for service improvement</li>
            </Typography>
            <Typography paragraph>
              <strong>We will never sell your individual data to third parties.</strong>
            </Typography>

            <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mt: 3 }}>
              8. Limitation of Liability
            </Typography>
            <Typography paragraph>
              <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong>
            </Typography>
            <Typography component="ul" paragraph>
              <li>FinaclyAI shall not be liable for any indirect, incidental, special, or consequential damages</li>
              <li>Our total liability shall not exceed the fees paid by you in the 12 months preceding the claim</li>
              <li>We are not liable for financial losses resulting from reconciliation errors</li>
              <li>We are not liable for tax penalties, audit issues, or accounting discrepancies</li>
              <li>We are not responsible for third-party service interruptions (Stripe, Plaid, QuickBooks)</li>
            </Typography>

            <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mt: 3 }}>
              9. Indemnification
            </Typography>
            <Typography paragraph>
              You agree to indemnify and hold harmless FinaclyAI from claims arising from:
            </Typography>
            <Typography component="ul" paragraph>
              <li>Your use of the Service</li>
              <li>Violation of these Terms</li>
              <li>Infringement of third-party rights</li>
              <li>Your financial data or accounting practices</li>
            </Typography>

            <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mt: 3 }}>
              10. Professional Advice Disclaimer
            </Typography>
            <Typography paragraph>
              <strong>FinaclyAI is a software tool, not a professional accounting service.</strong>
            </Typography>
            <Typography paragraph>
              We do not provide:
            </Typography>
            <Typography component="ul" paragraph>
              <li>Tax advice or preparation services</li>
              <li>Audit or assurance services</li>
              <li>Legal or financial consulting</li>
              <li>Certified financial statements</li>
            </Typography>
            <Typography paragraph>
              <strong>Consult with a qualified accountant or CPA for professional advice.</strong>
            </Typography>

            <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mt: 3 }}>
              11. Subscription and Billing
            </Typography>
            <Typography paragraph>
              <strong>Current Status: BETA - Free During Testing</strong>
            </Typography>
            <Typography paragraph>
              When paid plans launch:
            </Typography>
            <Typography component="ul" paragraph>
              <li>Subscriptions are billed monthly or annually in advance</li>
              <li>No refunds for partial months</li>
              <li>You may cancel at any time (access continues until period end)</li>
              <li>Price changes require 30-day advance notice</li>
            </Typography>

            <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mt: 3 }}>
              12. Termination
            </Typography>
            <Typography paragraph>
              We may suspend or terminate your access if:
            </Typography>
            <Typography component="ul" paragraph>
              <li>You violate these Terms</li>
              <li>Your account poses a security risk</li>
              <li>We discontinue the Service (with 30-day notice)</li>
            </Typography>
            <Typography paragraph>
              Upon termination:
            </Typography>
            <Typography component="ul" paragraph>
              <li>You will have 90 days to export your data</li>
              <li>All licenses and access rights terminate immediately</li>
              <li>Legally required records may be retained per our Privacy Policy</li>
            </Typography>

            <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mt: 3 }}>
              13. Changes to Service
            </Typography>
            <Typography paragraph>
              We reserve the right to:
            </Typography>
            <Typography component="ul" paragraph>
              <li>Modify, suspend, or discontinue features</li>
              <li>Change pricing (with notice for existing customers)</li>
              <li>Update these Terms (material changes require notification)</li>
            </Typography>

            <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mt: 3 }}>
              14. Governing Law
            </Typography>
            <Typography paragraph>
              These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict of law provisions.
            </Typography>
            <Typography paragraph>
              Any disputes shall be resolved through binding arbitration, except where prohibited by law.
            </Typography>

            <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mt: 3 }}>
              15. Entire Agreement
            </Typography>
            <Typography paragraph>
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and FinaclyAI.
            </Typography>

            <Typography variant="h5" gutterBottom fontWeight="600" sx={{ mt: 3 }}>
              16. Contact
            </Typography>
            <Typography paragraph>
              Questions about these Terms?<br />
              Email: <Link href="mailto:legal@finaclyai.com">legal@finaclyai.com</Link>
            </Typography>

            <Box sx={{ mt: 4, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                ⚠️ BETA NOTICE
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                FinaclyAI is currently in beta testing. While we strive for accuracy, 
                <strong> you must review all reconciliation results and auto-generated entries before finalizing your books</strong>. 
                We recommend maintaining backup records and consulting with your accountant for critical decisions.
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

