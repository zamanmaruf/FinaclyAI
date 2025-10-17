# Finacly AI - Marketing Landing Page

A stunning, conversion-optimized marketing site for Finacly AI built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 🎨 **Enterprise-Grade Design**: Custom design system with glassmorphism effects
- ⚡ **Performance Optimized**: Built with Next.js 14 and optimized for speed
- 📱 **Responsive**: Mobile-first design that works on all devices
- 🎭 **Animations**: Smooth Framer Motion animations throughout
- 📊 **Analytics Ready**: Google Analytics integration ready
- 🔒 **Secure**: SOC 2 compliance mentions and security features
- 📧 **Email Collection**: PostgreSQL database for signup management

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **Database**: PostgreSQL
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finacly-ai-marketing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your database URL:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/finacly_ai
   ```

4. **Set up the database**
   ```bash
   # Create the database
   createdb finacly_ai
   
   # Run the schema (the app will auto-create tables on first run)
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on push to main branch**

### Manual Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## Database Schema

The application uses a simple PostgreSQL schema for storing signups:

```sql
CREATE TABLE signups (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  company_name VARCHAR(255),
  current_tools TEXT,
  referral_source VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Customization

### Colors
Update the color palette in `tailwind.config.ts`:

```typescript
colors: {
  primary: { /* Your primary colors */ },
  navy: { /* Your navy colors */ },
  gold: { /* Your gold colors */ }
}
```

### Content
- Update hero content in `components/Hero.tsx`
- Modify features in `components/Features.tsx`
- Customize the signup form in `components/SignupForm.tsx`

### SEO
Update metadata in `app/layout.tsx` for your domain and content.

## API Endpoints

- `POST /api/signup` - Handle signup form submissions
- `GET /api/signup` - Get signup count

## Performance

- Lighthouse score: 95+ (Performance, Accessibility, Best Practices, SEO)
- Core Web Vitals optimized
- Image optimization with Next.js
- Lazy loading for components

## Security

- Form validation with React Hook Form
- SQL injection protection with parameterized queries
- Environment variable protection
- HTTPS enforcement in production

## Support

For questions or support, contact:
- Email: hello@finacly.ai
- Documentation: [Link to docs]

## License

© 2025 Finacly AI. All rights reserved.
