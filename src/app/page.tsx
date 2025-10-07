import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default function IndexPage() {
  const auth = cookies().get('finacly_auth')?.value
  redirect(auth === 'ok' ? '/dashboard' : '/connect')
}