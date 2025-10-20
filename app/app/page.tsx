import { redirect } from 'next/navigation'

export default function AppPage() {
  // Redirect to dashboard - access control will be handled in individual pages
  redirect('/app/dashboard')
}
