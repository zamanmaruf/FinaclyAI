"use client";
import useSWR from 'swr'
import { useState } from 'react'
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
  TextField,
  InputAdornment,
  TablePagination,
  Pagination,
  Fade
} from '@mui/material'
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Build as BuildIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon
} from '@mui/icons-material'
import Navigation from '@/components/Navigation'
import { useThemeMode } from '@/app/theme-provider'
import { DashboardSkeleton } from '@/components/LoadingSkeleton'
import toast from 'react-hot-toast'

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
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [fixingIds, setFixingIds] = useState<Set<string>>(new Set())
  const { mode, toggleTheme } = useThemeMode()
  
  const { data: stats, mutate: mutateStats, isLoading: statsLoading } = useSWR<{ matched: number; exceptions: number; lastSync?: string | null }>("/api/stats", fetcher, { refreshInterval: 10000 })
  const { data: exceptions, mutate: mutateExceptions, isLoading: exceptionsLoading } = useSWR<{ rows: ExceptionRow[] }>("/api/exceptions/list", fetcher)
  const { data: recent, isLoading: recentLoading } = useSWR<{ items: MatchItem[] }>("/api/matches/recent", fetcher)

  const ITEMS_PER_PAGE = 10

  // Filter and paginate exceptions
  const filteredExceptions = exceptions?.rows.filter(ex => 
    ex.kind.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.message.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const paginatedExceptions = filteredExceptions.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  const totalPages = Math.ceil(filteredExceptions.length / ITEMS_PER_PAGE)

  async function syncNow() {
    setSyncing(true)
    const toastId = toast.loading('Syncing data from Stripe, Plaid, and QuickBooks...')
    
    try {
      const response = await fetch('/api/sync', { method: 'POST' })
      const result = await response.json()
      
      if (result.ok) {
        toast.success(
          `✅ Synced ${result.stripe?.payouts || 0} payouts, ${result.plaid?.transactions || 0} transactions, ${result.matching?.matched || 0} matched`,
          { id: toastId, duration: 5000 }
        )
        await Promise.all([mutateStats(), mutateExceptions()])
      } else {
        toast.error(`Failed: ${result.error}`, { id: toastId })
      }
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: toastId })
    } finally {
      setSyncing(false)
    }
  }

  async function fixException(id: string) {
    setFixingIds(prev => new Set(prev).add(id))
    const toastId = toast.loading('Fixing exception...')
    
    try {
      const response = await fetch(`/api/fix/payout?id=${encodeURIComponent(id)}`, { method: 'POST' })
      
      if (response.ok) {
        toast.success('Exception resolved successfully!', { id: toastId })
        // Optimistic update
        await Promise.all([mutateExceptions(), mutateStats()])
      } else {
        toast.error('Failed to fix exception', { id: toastId })
      }
    } catch (error) {
      toast.error('Network error while fixing exception', { id: toastId })
    } finally {
      setFixingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const formatCurrency = (amountMinor: string, currency: string) => {
    const amount = Number(amountMinor) / 100
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  if (statsLoading || exceptionsLoading || recentLoading) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <Navigation onThemeToggle={toggleTheme} currentTheme={mode} />
        <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 3, px: 3, boxShadow: 2 }}>
          <Container maxWidth="lg">
            <Typography variant="h4" component="h1" fontWeight="bold">
              FinaclyAI Dashboard
            </Typography>
          </Container>
        </Box>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
          <DashboardSkeleton />
        </Container>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Navigation onThemeToggle={toggleTheme} currentTheme={mode} />

      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 3, px: 3, boxShadow: 2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold">
                FinaclyAI Dashboard
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Real-time reconciliation across Stripe, Banks & QuickBooks
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              color="secondary"
              startIcon={syncing ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
              onClick={syncNow} 
              disabled={syncing}
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main', 
                '&:hover': { bgcolor: 'grey.100' },
                fontWeight: 700
              }}
            >
              {syncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Fade in timeout={300}>
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CheckCircleIcon sx={{ color: 'success.main', mr: 1, fontSize: 32 }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Transactions Matched
                    </Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="bold" color="success.main">
                    {stats?.matched?.toLocaleString() ?? 0}
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          <Grid item xs={12} md={4}>
            <Fade in timeout={400}>
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ErrorIcon sx={{ color: 'error.main', mr: 1, fontSize: 32 }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      Exceptions Requiring Action
                    </Typography>
                  </Box>
                  <Typography variant="h3" fontWeight="bold" color="error.main">
                    {stats?.exceptions?.toLocaleString() ?? 0}
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          <Grid item xs={12} md={4}>
            <Fade in timeout={500}>
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Last Sync
                  </Typography>
                  <Typography variant="h6" fontWeight="medium">
                    {stats?.lastSync ? new Date(stats.lastSync).toLocaleString() : 'Never'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Auto-refreshing every 10s
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        </Grid>

        {/* Exceptions Inbox */}
        <Fade in timeout={600}>
          <Paper elevation={3} sx={{ mb: 4, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <ErrorIcon sx={{ mr: 1, color: 'error.main' }} />
                  Exceptions Inbox
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Review and resolve reconciliation exceptions
                </Typography>
              </Box>
              
              <TextField
                size="small"
                placeholder="Search exceptions..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1) // Reset to first page on search
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 250 }}
              />
            </Box>

            {!exceptions || filteredExceptions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Box sx={{ fontSize: 64, mb: 2, opacity: 0.6 }}>
                  {searchTerm ? '🔍' : '🎉'}
                </Box>
                <Typography variant="h6" fontWeight="medium" gutterBottom>
                  {searchTerm ? 'No exceptions match your search' : 'No exceptions found'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {searchTerm 
                    ? 'Try adjusting your search terms'
                    : 'All transactions are reconciled. Run Sync to check for new exceptions.'
                  }
                </Typography>
                {!searchTerm && (
                  <Button variant="outlined" onClick={syncNow} disabled={syncing}>
                    {syncing ? 'Syncing...' : 'Run Sync Now'}
                  </Button>
                )}
              </Box>
            ) : (
              <>
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
                      {paginatedExceptions.map((ex) => (
                        <TableRow key={ex.id} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
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
                                {formatCurrency(ex.amountMinor, ex.currency)}
                              </Typography>
                            ) : '—'}
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Auto-fix this exception">
                              <span>
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={() => fixException(ex.id)}
                                  disabled={fixingIds.has(ex.id)}
                                >
                                  {fixingIds.has(ex.id) ? (
                                    <CircularProgress size={20} />
                                  ) : (
                                    <BuildIcon />
                                  )}
                                </IconButton>
                              </span>
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

                {totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination 
                      count={totalPages} 
                      page={page} 
                      onChange={(_, value) => setPage(value)}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </Paper>
        </Fade>

        {/* Recent Matches */}
        <Fade in timeout={700}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
              Recent Matches
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Recently reconciled transactions
            </Typography>

            {!recent || recent.items.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Box sx={{ fontSize: 48, mb: 2, opacity: 0.6 }}>⚡</Box>
                <Typography variant="h6" fontWeight="medium" gutterBottom>
                  No matches yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Connect your services and run a sync to start matching transactions automatically.
                </Typography>
                <Button variant="outlined" href="/connect">
                  Go to Connect →
                </Button>
              </Box>
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
        </Fade>
      </Container>
    </Box>
  );
}
