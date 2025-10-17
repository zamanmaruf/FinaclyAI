import nodemailer from 'nodemailer'

// Create transporter with performance optimizations
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  // Performance optimizations
  pool: true, // Use connection pooling
  maxConnections: 5, // Maximum number of concurrent connections
  maxMessages: 100, // Maximum number of messages per connection
  rateLimit: 14, // Maximum number of messages per second
})

// Email queue for asynchronous processing
const emailQueue: Array<() => Promise<void>> = []
let isProcessingQueue = false

async function processEmailQueue() {
  if (isProcessingQueue || emailQueue.length === 0) return
  
  isProcessingQueue = true
  
  while (emailQueue.length > 0) {
    const emailTask = emailQueue.shift()
    if (emailTask) {
      try {
        await emailTask()
        // Add small delay to prevent overwhelming the email service
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error('Email queue processing error:', error)
      }
    }
  }
  
  isProcessingQueue = false
}

// Add email to queue for background processing
function queueEmail(emailTask: () => Promise<void>) {
  emailQueue.push(emailTask)
  // Process queue asynchronously without blocking
  setImmediate(() => processEmailQueue())
}

export async function sendConfirmationEmail(email: string, fullName: string, async = true) {
  const sendEmail = async () => {
    try {
      const mailOptions = {
      from: `"Finacly AI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to Finacly AI Early Access! 🚀',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0A1128 0%, #1e293b 100%); padding: 40px; border-radius: 12px; color: white;">
            <h1 style="color: #00D9FF; text-align: center; margin-bottom: 20px;">
              Welcome to the Future, ${fullName}! 🎉
            </h1>
            
            <p style="font-size: 18px; line-height: 1.6; margin-bottom: 20px;">
              Thank you for joining Finacly AI's early access program! You're now part of an exclusive group of forward-thinking businesses ready to end the reconciliation nightmare.
            </p>
            
            <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #FFB800; margin-top: 0;">What's Next?</h3>
              <ul style="line-height: 1.8;">
                <li>✅ You're on our early access list</li>
                <li>🚀 We'll notify you when beta testing begins</li>
                <li>💡 Get priority access to new features</li>
                <li>🎯 Be among the first 200 businesses to transform their financial operations</li>
              </ul>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Built specifically for 2026 Open Banking, Finacly AI will automatically match your transactions across Stripe, QuickBooks, and bank feeds with 95%+ accuracy.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://finacly.ai" style="background: linear-gradient(45deg, #00D9FF, #FFB800); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Learn More About Finacly AI
              </a>
            </div>
            
            <p style="font-size: 14px; color: #94a3b8; text-align: center; margin-top: 30px;">
              Questions? Reply to this email or contact us at finacly.ai.inc@gmail.com
            </p>
            
            <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.2); margin: 20px 0;">
            
            <p style="font-size: 12px; color: #64748b; text-align: center;">
              © 2025 Finacly AI. Built in 10 days with AI. All rights reserved.
            </p>
          </div>
        </div>
      `,
    }

      await transporter.sendMail(mailOptions)
      console.log(`✅ Confirmation email sent to ${email}`)
      return true
    } catch (error) {
      console.error('❌ Error sending confirmation email:', error)
      return false
    }
  }

  if (async) {
    queueEmail(sendEmail)
    return true // Return immediately for async processing
  } else {
    return await sendEmail()
  }
}

export async function sendContactEmail({
  firstName,
  lastName,
  email,
  company,
  subject,
  message
}: {
  firstName: string
  lastName: string
  email: string
  company: string
  subject: string
  message: string
}) {
  try {
    const mailOptions = {
      from: `"Finacly AI Contact Form" <${process.env.EMAIL_USER}>`,
      to: 'finacly.ai.inc@gmail.com',
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0A1128 0%, #1e293b 100%); padding: 40px; border-radius: 12px; color: white;">
            <h1 style="color: #00D9FF; text-align: center; margin-bottom: 30px;">
              New Contact Form Submission
            </h1>
            
            <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #FFB800; margin-top: 0;">Contact Information</h3>
              <p><strong>Name:</strong> ${firstName} ${lastName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Company:</strong> ${company}</p>
              <p><strong>Subject:</strong> ${subject}</p>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #FFB800; margin-top: 0;">Message</h3>
              <p style="line-height: 1.6; white-space: pre-wrap;">${message}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="mailto:${email}" style="background: linear-gradient(45deg, #00D9FF, #FFB800); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Reply to ${email}
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid rgba(255, 255, 255, 0.2); margin: 20px 0;">
            
            <p style="font-size: 12px; color: #64748b; text-align: center;">
              This message was sent from the Finacly AI contact form.
            </p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    console.log(`✅ Contact email sent to finacly.ai.inc@gmail.com from ${email}`)
    return true
  } catch (error) {
    console.error('❌ Error sending contact email:', error)
    return false
  }
}
