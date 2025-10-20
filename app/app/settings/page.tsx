'use client'

import { useState, useEffect } from 'react'

interface CompanySettings {
  id: number
  name: string
  email: string
  status: 'inactive' | 'trial' | 'active' | 'suspended'
  subscriptionTier: string | null
  createdAt: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<CompanySettings>({
    id: 1,
    name: '',
    email: '',
    status: 'inactive',
    subscriptionTier: null,
    createdAt: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      // TODO: Implement API call to fetch company settings
      // For now, simulate data
      setSettings({
        id: 1,
        name: 'Acme Corporation',
        email: 'admin@acme.com',
        status: 'active',
        subscriptionTier: 'growth',
        createdAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      // TODO: Implement API call to save settings
      console.log('Saving settings:', settings)
      
      // Simulate save
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400'
      case 'trial': return 'text-blue-400'
      case 'suspended': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getTierColor = (tier: string | null) => {
    switch (tier) {
      case 'scale': return 'text-purple-400'
      case 'growth': return 'text-blue-400'
      case 'starter': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="mt-2 text-gray-300">
          Manage your company settings and subscription
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Company Information</h3>
          
          <form onSubmit={saveSettings} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-navy-800 border border-white/20 text-white rounded-lg px-3 py-2 focus:border-primary-500 focus:outline-none"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-navy-800 border border-white/20 text-white rounded-lg px-3 py-2 focus:border-primary-500 focus:outline-none"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Subscription Information */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Subscription</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Status:</span>
              <span className={`font-medium ${getStatusColor(settings.status)}`}>
                {settings.status.toUpperCase()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Plan:</span>
              <span className={`font-medium ${getTierColor(settings.subscriptionTier)}`}>
                {settings.subscriptionTier ? settings.subscriptionTier.toUpperCase() : 'None'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Member Since:</span>
              <span className="text-white">
                {new Date(settings.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/10">
            <button className="btn-secondary w-full">
              Manage Subscription
            </button>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Security</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white font-medium">API Credentials</p>
              <p className="text-sm text-gray-300">Manage your connected service credentials</p>
            </div>
            <button className="btn-secondary">
              Manage Credentials
            </button>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white font-medium">Data Export</p>
              <p className="text-sm text-gray-300">Export your reconciliation data</p>
            </div>
            <button className="btn-secondary">
              Export Data
            </button>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white font-medium">Delete Account</p>
              <p className="text-sm text-gray-300">Permanently delete your account and all data</p>
            </div>
            <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Support */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-white font-medium mb-2">Documentation</h4>
            <p className="text-sm text-gray-300 mb-3">
              Learn how to use Finacly AI effectively
            </p>
            <button className="btn-secondary">
              View Documentation
            </button>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-2">Contact Support</h4>
            <p className="text-sm text-gray-300 mb-3">
              Get help from our support team
            </p>
            <button className="btn-secondary">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
