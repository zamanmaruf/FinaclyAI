export const emailConfig = {
  // Development SMTP settings (Gmail)
  development: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'your-email@gmail.com',
      pass: process.env.SMTP_PASS || 'your-app-password'
    }
  },
  
  // Production SMTP settings (SendGrid)
  production: {
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY || 'your-sendgrid-api-key'
    }
  },
  
  // Alternative: AWS SES
  ses: {
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.AWS_SES_USER || 'your-ses-user',
      pass: process.env.AWS_SES_PASS || 'your-ses-password'
    }
  }
}

export const getEmailConfig = () => {
  const env = process.env.NODE_ENV || 'development'
  
  switch (env) {
    case 'production':
      return emailConfig.production
    case 'development':
    default:
      return emailConfig.development
  }
}

export const emailTemplates = {
  signupNotification: {
    subject: 'New Lead: {{companyName}}',
    html: `
      <h2>New Lead Captured</h2>
      <p><strong>Company:</strong> {{companyName}}</p>
      <p><strong>Contact:</strong> {{fullName}} ({{email}})</p>
      <p><strong>Role:</strong> {{role}}</p>
      <p><strong>Company Size:</strong> {{companySize}}</p>
      <p><strong>Stack:</strong> {{stackPsp}} + {{stackLedger}}</p>
      <p><strong>Country:</strong> {{country}}</p>
      <p><strong>Phone:</strong> {{phone}}</p>
      <p><strong>UTM Source:</strong> {{utmSource}}</p>
    `
  },
  
  confirmation: {
    subject: 'Welcome to Finacly - Next Steps',
    html: `
      <h2>Welcome to Finacly! 🎉</h2>
      <p>Hi {{fullName}},</p>
      <p>Thank you for your interest in Finacly. We're excited to help you automate your financial reconciliation.</p>
      
      <h3>What's Next?</h3>
      <ul>
        <li>📧 We'll contact you within 24 hours to schedule a demo</li>
        <li>🔗 Connect your Stripe, QuickBooks, and bank accounts</li>
        <li>⚡ Start automating your reconciliation process</li>
      </ul>
      
      <p>Best regards,<br>The Finacly Team</p>
    `
  },
  
  exceptionAlert: {
    subject: 'Reconciliation Exception Alert - {{companyName}}',
    html: `
      <h2>Reconciliation Exception Alert</h2>
      <p>Company: {{companyName}}</p>
      <p>Exception Type: {{exceptionType}}</p>
      <p>Description: {{description}}</p>
      <p>Severity: {{severity}}</p>
      <p>Suggested Action: {{suggestedAction}}</p>
    `
  }
}
