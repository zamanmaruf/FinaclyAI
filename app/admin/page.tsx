import { query } from '@/lib/db'

async function getSignups() {
  try {
    const result = await query('SELECT * FROM signups ORDER BY created_at DESC')
    return result.rows
  } catch (error) {
    console.error('Error fetching signups:', error)
    return []
  }
}

export default async function AdminPage() {
  const signups = await getSignups()

  return (
    <div className="min-h-screen bg-navy-900 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-heading font-bold text-white mb-8">
          Finacly AI - Signup Dashboard
        </h1>
        
        <div className="glass-card p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-heading font-semibold text-white">
              Early Access Signups ({signups.length})
            </h2>
            <div className="text-primary-400 font-semibold">
              Goal: 200 signups
            </div>
          </div>

          {signups.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-300 text-lg">No signups yet. Share your site to start collecting early access requests!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="pb-4 text-white font-semibold">Name</th>
                    <th className="pb-4 text-white font-semibold">Email</th>
                    <th className="pb-4 text-white font-semibold">Company</th>
                    <th className="pb-4 text-white font-semibold">Tools</th>
                    <th className="pb-4 text-white font-semibold">Referral</th>
                    <th className="pb-4 text-white font-semibold">Signed Up</th>
                  </tr>
                </thead>
                <tbody>
                  {signups.map((signup: any) => (
                    <tr key={signup.id} className="border-b border-white/5">
                      <td className="py-4 text-white font-medium">{signup.full_name}</td>
                      <td className="py-4 text-primary-400">{signup.email}</td>
                      <td className="py-4 text-gray-300">{signup.company_name}</td>
                      <td className="py-4 text-gray-300">{signup.current_tools || 'Not specified'}</td>
                      <td className="py-4 text-gray-300">{signup.referral_source || 'Not specified'}</td>
                      <td className="py-4 text-gray-400 text-sm">
                        {new Date(signup.created_at).toLocaleDateString()} at{' '}
                        {new Date(signup.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-400">{signups.length}</div>
                <div className="text-gray-300">Total Signups</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gold-400">
                  {Math.round((signups.length / 200) * 100)}%
                </div>
                <div className="text-gray-300">Goal Progress</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-400">
                  {200 - signups.length}
                </div>
                <div className="text-gray-300">Remaining</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
