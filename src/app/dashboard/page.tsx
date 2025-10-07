"use client";
import useSWR from 'swr'
import { useState } from 'react'
import Link from 'next/link'
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  AppBar,
  Toolbar
} from '@mui/material'
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Build as BuildIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface ExceptionRow {
  id: string
  kind: string
  message: string
  amountMinor?: string
  currency?: string
  createdAt: string
  data?: any
}

interface MatchItem {
  id: string
  description: string
  date: string
}

export default function DashboardPage() {
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  
  const { data: stats, mutate: mutateStats } = useSWR<{ matched: number; exceptions: number; lastSync?: string | null }>("/api/stats", fetcher, { refreshInterval: 10000 })
  const { data: exceptions, mutate: mutateExceptions } = useSWR<{ rows: ExceptionRow[] }>("/api/exceptions/list", fetcher)
  const { data: recent } = useSWR<{ items: MatchItem[] }>("/api/matches/recent", fetcher)

  async function syncNow() {
    setSyncing(true)
    setSyncMessage(null)
    try {
      const response = await fetch('/api/sync', { method: 'POST' })
      const result = await response.json()
      
      if (result.ok) {
        setSyncMessage(`✅ Synced successfully! ${result.stripe?.payouts || 0} payouts, ${result.plaid?.transactions || 0} transactions, ${result.matching?.matched || 0} matched`)
        await Promise.all([mutateStats(), mutateExceptions()])
      } else {
        setSyncMessage(`❌ Sync failed: ${result.error}`)
      }
    } catch (error) {
      setSyncMessage(`❌ Sync error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSyncing(false)
    }
  }

  async function fixException(id: string) {
    try {
      await fetch(`/api/fix/payout?id=${encodeURIComponent(id)}`, { method: 'POST' })
      await mutateExceptions()
      await mutateStats()
    } catch (error) {
      console.error('Fix error:', error)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Navigation */}
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Typography variant="h5" component={Link} href="/" sx={{ flexGrow: 1, fontWeight: 'bold', textDecoration: 'none', color: 'inherit' }}>
            Finacly AI
          </Typography>
          <Button color="inherit" component={Link} href="/connect">
            Connect
          </Button>
          <Button color="inherit" component={Link} href="/dashboard">
            Dashboard
          </Button>
        </Toolbar>
      </AppBar>

      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 3, px: 3, boxShadow: 2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1" fontWeight="bold">
              FinaclyAI Dashboard
            </Typography>
            <Button 
              variant="contained" 
              color="secondary"
              startIcon={syncing ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
              onClick={syncNow} 
              disabled={syncing}
              sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
            >
              {syncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        {/* Sync Status Message */}
        {syncMessage && (
          <Alert severity={syncMessage.startsWith('✅') ? 'success' : 'error'} sx={{ mb: 3 }} onClose={() => setSyncMessage(null)}>
            {syncMessage}
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircleIcon sx={{ color: 'success.main', mr: 1, fontSize: 32 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Transactions Matched
                  </Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold" color="success.main">
                  {stats?.matched ?? 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ErrorIcon sx={{ color: 'error.main', mr: 1, fontSize: 32 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Exceptions Requiring Action
                  </Typography>
                </Box>
                <Typography variant="h3" fontWeight="bold" color="error.main">
                  {stats?.exceptions ?? 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Last Sync
                </Typography>
                <Typography variant="h6" fontWeight="medium">
                  {stats?.lastSync ? new Date(stats.lastSync).toLocaleString() : 'Never'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Exceptions Inbox */}
        <Paper elevation={3} sx={{ mb: 4, p: 3 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <ErrorIcon sx={{ mr: 1, color: 'error.main' }} />
            Exceptions Inbox
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Review and resolve reconciliation exceptions below
          </Typography>

          {!exceptions || exceptions.rows.length === 0 ? (
            <Alert severity="success">
              <Typography variant="body1">
                🎉 No exceptions! All transactions are reconciled.
              </Typography>
            </Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Details</strong></TableCell>
                    <TableCell><strong>Amount</strong></TableCell>
                    <TableCell align="right"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {exceptions.rows.map((ex) => (
                    <TableRow key={ex.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(ex.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={ex.kind} 
                          size="small" 
                          color={ex.kind.includes('NO_MATCH') ? 'error' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{ex.message}</Typography>
                      </TableCell>
                      <TableCell>
                        {ex.amountMinor && ex.currency ? (
                          <Typography variant="body2" fontWeight="medium">
                            {ex.currency} {(Number(ex.amountMinor) / 100).toFixed(2)}
                          </Typography>
                        ) : '—'}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Auto-fix this exception">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => fixException(ex.id)}
                          >
                            <BuildIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View details">
                          <IconButton size="small">
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* Recent Matches */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
            Recent Matches
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Recently reconciled transactions
          </Typography>

          {!recent || recent.items.length === 0 ? (
            <Alert severity="info">
              <Typography variant="body2">
                No matches yet. Run a sync to start matching transactions.
              </Typography>
            </Alert>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recent.items.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography variant="body2">{item.description}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(item.date).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label="Matched" size="small" color="success" icon={<CheckCircleIcon />} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
