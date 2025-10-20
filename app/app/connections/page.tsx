'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CheckCircle, XCircle, RefreshCw, ExternalLink, Key, Database, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

interface ConnectionStatus {
  stripe: boolean
  quickbooks: boolean
  plaid: boolean
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<ConnectionStatus>({
    stripe: false,
    quickbooks: false,
    plaid: false
  })
  const [loading, setLoading] = useState(true)
  const [stripeApiKey, setStripeApiKey] = useState('')
  const [connectingStripe, setConnectingStripe] = useState(false)
  const [connectingPlaid, setConnectingPlaid] = useState(false)

  useEffect(() => {
    // Check connection status
    checkConnections()
  }, [])

  const checkConnections = async () => {
    try {
      // Check Stripe connection
      const stripeResponse = await fetch('/api/app/stripe/connect?companyId=1')
      const stripeData = await stripeResponse.json()
      
      // Check QuickBooks connection
      const quickbooksResponse = await fetch('/api/app/quickbooks/connect?companyId=1')
      const quickbooksData = await quickbooksResponse.json()
      
      // Check Plaid connection
      const plaidResponse = await fetch('/api/app/plaid/connect?companyId=1')
      const plaidData = await plaidResponse.json()
      
      setConnections({
        stripe: stripeData.connected,
        quickbooks: quickbooksData.connected || false,
        plaid: plaidData.connected || false
      })
    } catch (error) {
      console.error('Error checking connections:', error)
    } finally {
      setLoading(false)
    }
  }

  const connectStripe = async () => {
    if (!stripeApiKey.trim()) {
      toast.error('Please enter your Stripe API key')
      return
    }

    setConnectingStripe(true)
    toast.loading('Connecting to Stripe...')
    
    try {
      const response = await fetch('/api/app/stripe/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: stripeApiKey,
          companyId: 1 // TODO: Get from auth context
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Stripe connected successfully!')
        setStripeApiKey('')
        await checkConnections() // Refresh connection status
      } else {
        toast.error(`Error connecting to Stripe: ${data.error}`)
      }
    } catch (error) {
      console.error('Error connecting to Stripe:', error)
      toast.error('Error connecting to Stripe. Please try again.')
    } finally {
      setConnectingStripe(false)
    }
  }

  const connectQuickBooks = async () => {
    try {
      console.log('Initiating QuickBooks OAuth...')
      toast.loading('Redirecting to QuickBooks...')
      
      const response = await fetch(`/api/app/quickbooks/auth?companyId=1`)
      const data = await response.json()

      if (data.success) {
        toast.success('Redirecting to QuickBooks...')
        // Redirect to QuickBooks OAuth
        window.location.href = data.authUrl
      } else {
        toast.error(`Error connecting to QuickBooks: ${data.error}`)
      }
    } catch (error) {
      console.error('Error connecting to QuickBooks:', error)
      toast.error('Error connecting to QuickBooks. Please try again.')
    }
  }

  const connectPlaid = async () => {
    setConnectingPlaid(true)
    toast.loading('Connecting to Plaid...')
    
    try {
      console.log('Initiating Plaid Link...')
      
      // Get link token
      const tokenResponse = await fetch('/api/app/plaid/link-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: 1 // TODO: Get from auth context
        })
      })

      const tokenData = await tokenResponse.json()

      if (tokenData.success) {
        // In a real implementation, you would use Plaid Link SDK here
        // For now, we'll simulate the process
        toast.success('Plaid Link integration would open here. For demo purposes, this is simulated.')
        
        // Simulate successful connection
        await checkConnections()
      } else {
        toast.error(`Error connecting to Plaid: ${tokenData.error}`)
      }
    } catch (error) {
      console.error('Error connecting to Plaid:', error)
      toast.error('Error connecting to Plaid. Please try again.')
    } finally {
      setConnectingPlaid(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
        </div>
      </div>
    )
  }

  const connectionCards = [
    {
      name: 'Stripe',
      description: 'Connect your Stripe account to sync payments and payouts',
      icon: <CreditCard className="w-6 h-6" />,
      connected: connections.stripe,
      color: 'purple',
      action: connections.stripe ? null : (
        <div className="space-y-3">
          <Input
            type="password"
            placeholder="Enter your Stripe Secret Key (sk_...)"
            value={stripeApiKey}
            onChange={(e) => setStripeApiKey(e.target.value)}
            className="bg-navy-800 border-white/20 text-white"
          />
          <Button
            onClick={connectStripe}
            disabled={connectingStripe}
            className="w-full bg-purple-500 hover:bg-purple-600"
          >
            {connectingStripe ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect Stripe'
            )}
          </Button>
        </div>
      )
    },
    {
      name: 'QuickBooks Online',
      description: 'Connect your QuickBooks account to sync accounting data',
      icon: <Database className="w-6 h-6" />,
      connected: connections.quickbooks,
      color: 'blue',
      action: connections.quickbooks ? null : (
        <Button
          onClick={connectQuickBooks}
          className="w-full bg-blue-500 hover:bg-blue-600"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Connect QuickBooks
        </Button>
      )
    },
    {
      name: 'Bank Account',
      description: 'Connect your bank account to sync transactions',
      icon: <Key className="w-6 h-6" />,
      connected: connections.plaid,
      color: 'green',
      action: connections.plaid ? null : (
        <Button
          onClick={connectPlaid}
          disabled={connectingPlaid}
          className="w-full bg-green-500 hover:bg-green-600"
        >
          {connectingPlaid ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            'Connect Bank Account'
          )}
        </Button>
      )
    }
  ]

  const connectedCount = Object.values(connections).filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white">Connections</h1>
          <p className="mt-2 text-gray-300">
            Connect your financial services to enable automated reconciliation
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {connectedCount} of 3 services connected
          </p>
        </div>
        <Button
          onClick={checkConnections}
          disabled={loading}
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </Button>
      </motion.div>

      {/* Connection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {connectionCards.map((card, index) => (
          <motion.div
            key={card.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-${card.color}-500/20 flex items-center justify-center text-${card.color}-400`}>
                      {card.icon}
                    </div>
                    <div>
                      <CardTitle className="text-white">{card.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {card.connected ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <Badge className="bg-green-500 text-white">Connected</Badge>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-400" />
                            <Badge variant="destructive">Not Connected</Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">{card.description}</p>
                {card.action}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Connection Status Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white">Connection Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {connectionCards.map((card) => (
                <div key={card.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-${card.color}-500/20 flex items-center justify-center text-${card.color}-400`}>
                      {card.icon}
                    </div>
                    <span className="text-white font-medium">{card.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {card.connected ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 font-medium">Connected</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-400" />
                        <span className="text-red-400 font-medium">Not Connected</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {connectedCount === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center"
              >
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <h3 className="text-lg font-semibold text-white mb-1">All Services Connected!</h3>
                <p className="text-gray-300 text-sm">
                  You're ready to start automated reconciliation
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
