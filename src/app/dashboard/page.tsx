"use client";
import useSWR from 'swr'
import { useState, useMemo } from 'react'
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
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Pagination,
  Fade,
  Checkbox,
  Menu,
  MenuItem,
  Drawer,
} from '@mui/material'
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Build as BuildIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material'
import Navigation from '@/components/Navigation'
import { useThemeMode } from '@/app/theme-provider'
import { DashboardSkeleton } from '@/components/LoadingSkeleton'
import { ExceptionDetailModal } from '@/components/ui/ExceptionDetailModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { SuccessAnimation } from '@/components/ui/SuccessAnimation'
import { KeyboardShortcuts, useKeyboardShortcuts } from '@/components/ui/KeyboardShortcuts'
import { formatDistanceToNow } from 'date-fns'
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectedEx, setSelectedEx] = useState<ExceptionRow | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'amount'>('date')
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showShortcuts, setShowShortcuts] = useState(false)
  const { mode, toggleTheme } = useThemeMode()
  
  const { data: stats, mutate: mutateStats, isLoading: statsLoading } = useSWR<{ matched: number; exceptions: number; lastSync?: string | null }>("/api/stats", fetcher, { 
    refreshInterval: 10000,
    refreshWhenHidden: false,
    revalidateOnFocus: true
  })
  const { data: exceptions, mutate: mutateExceptions, isLoading: exceptionsLoading } = useSWR<{ rows: ExceptionRow[] }>("/api/exceptions/list", fetcher, {
    refreshWhenHidden: false,
    revalidateOnFocus: true
  })
  const { data: recent, isLoading: recentLoading } = useSWR<{ items: MatchItem[] }>("/api/matches/recent", fetcher, {
    refreshWhenHidden: false,
    revalidateOnFocus: true
  })

  const ITEMS_PER_PAGE = 10

  // Filter, sort, and paginate exceptions
  const filteredExceptions = useMemo(() => {
    let filtered = exceptions?.rows.filter(ex => 
      ex.kind.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.message.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

    // Sort
    filtered = filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else if (sortBy === 'type') {
        return a.kind.localeCompare(b.kind)
      } else if (sortBy === 'amount') {
        const aAmt = Number(a.amountMinor || 0)
        const bAmt = Number(b.amountMinor || 0)
        return bAmt - aAmt
      }
      return 0
    })

    return filtered
  }, [exceptions, searchTerm, sortBy])

  const paginatedExceptions = filteredExceptions.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  const totalPages = Math.ceil(filteredExceptions.length / ITEMS_PER_PAGE)

  // Keyboard shortcuts
  useKeyboardShortcuts({
    's': syncNow,
    '?': () => setShowShortcuts(true),
    'escape': () => {
      setSelectedEx(null)
      setShowShortcuts(false)
    },
  })

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
        
        // Show success animation if matches were found
        if (result.matching?.matched > 0) {
          setSuccessMessage(`${result.matching.matched} transactions matched!`)
          setShowSuccess(true)
        }
      } else {
        toast.error(`Failed: ${result.error}`, { id: toastId })
      }
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { id: toastId })
    } finally {
      setSyncing(false)
    }
  }

  async function fixException(id: string, exData?: ExceptionRow) {
    const amount = exData?.amountMinor && exData?.currency 
      ? formatCurrency(exData.amountMinor, exData.currency)
      : 'this amount';
    
    if (!confirm(`Fix this exception?\n\nThis will create a deposit in QuickBooks for ${amount}.\n\nClick OK to proceed.`)) {
      return;
    }
    
    setFixingIds(prev => new Set(prev).add(id))
    const toastId = toast.loading('Fixing exception...')
    
    try {
      const response = await fetch(`/api/fix/payout?id=${encodeURIComponent(id)}`, { method: 'POST' })
      
      if (response.ok) {
        toast.success('Exception resolved successfully!', { id: toastId })
        await Promise.all([mutateExceptions(), mutateStats()])
        setSelectedEx(null) // Close modal if open
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

  async function fixBulk() {
    if (selectedIds.size === 0) return
    
    if (!confirm(`Fix ${selectedIds.size} exceptions?\n\nThis will create deposits in QuickBooks for all selected exceptions.`)) {
      return
    }

    const toastId = toast.loading(`Fixing ${selectedIds.size} exceptions...`)
    let fixed = 0
    let failed = 0

    for (const id of selectedIds) {
      try {
        const response = await fetch(`/api/fix/payout?id=${encodeURIComponent(id)}`, { method: 'POST' })
        if (response.ok) fixed++
        else failed++
      } catch {
        failed++
      }
    }

    if (failed === 0) {
      toast.success(`✅ Fixed ${fixed} exceptions successfully`, { id: toastId })
    } else {
      toast.error(`Fixed ${fixed}, failed ${failed}`, { id: toastId })
    }

    setSelectedIds(new Set())
    await Promise.all([mutateExceptions(), mutateStats()])
  }

  function exportToCSV() {
    if (!filteredExceptions.length) {
      toast.error('No exceptions to export')
      return
    }

    const headers = ['ID', 'Type', 'Message', 'Amount', 'Currency', 'Created At']
    const rows = filteredExceptions.map(ex => [
      ex.id,
      ex.kind,
      ex.message.replace(/"/g, '""'), // Escape quotes
      ex.amountMinor || '',
      ex.currency || '',
      new Date(ex.createdAt).toLocaleString()
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `finacly-exceptions-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)

    toast.success(`Exported ${filteredExceptions.length} exceptions to CSV`)
  }

  const formatCurrency = (amountMinor: string, currency: string) => {
    const amount = Number(amountMinor) / 100
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedExceptions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paginatedExceptions.map(ex => ex.id)))
    }
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
      {/* Skip to main content */}
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          transform: 'translateY(-100%)',
          '&:focus': {
            transform: 'translateY(0)',
            zIndex: 9999,
            bgcolor: 'primary.main',
            color: 'white',
            px: 3,
            py: 1.5,
            textDecoration: 'none',
            fontWeight: 'bold'
          }
        }}
      >
        Skip to main content
      </Box>
      
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
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Keyboard shortcuts (?)">
                <IconButton
                  onClick={() => setShowShortcuts(true)}
                  sx={{ color: 'white' }}
                  aria-label="Show keyboard shortcuts"
                >
                  <span style={{ fontSize: '1.2rem' }}>⌨️</span>
                </IconButton>
              </Tooltip>
              <Button 
                variant="contained" 
                color="secondary"
                startIcon={syncing ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
                onClick={syncNow} 
                disabled={syncing}
                sx={{ 
                  bgcolor: 'white', 
                  color: 'primary.main', 
                  '&:hover': { bgcolor: 'grey.100', transform: 'translateY(-2px)' },
                  fontWeight: 700,
                  transition: 'all 0.2s',
                }}
              >
                {syncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }} id="main-content">
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Fade in timeout={300}>
              <Card 
                elevation={3}
                sx={{
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
                }}
              >
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
              <Card 
                elevation={3}
                sx={{
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
                }}
              >
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
              <Card 
                elevation={3}
                sx={{
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Last Sync
                  </Typography>
                  <Typography variant="h6" fontWeight="medium">
                    {stats?.lastSync ? formatDistanceToNow(new Date(stats.lastSync), { addSuffix: true }) : 'Never'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Auto-refreshing when active
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
              
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                  size="small"
                  placeholder="Search exceptions..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setPage(1)
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
                
                <Button
                  size="small"
                  startIcon={<SortIcon />}
                  onClick={(e) => setFilterAnchor(e.currentTarget)}
                >
                  Sort: {sortBy}
                </Button>
                <Menu
                  anchorEl={filterAnchor}
                  open={Boolean(filterAnchor)}
                  onClose={() => setFilterAnchor(null)}
                >
                  <MenuItem onClick={() => { setSortBy('date'); setFilterAnchor(null); }}>By Date</MenuItem>
                  <MenuItem onClick={() => { setSortBy('type'); setFilterAnchor(null); }}>By Type</MenuItem>
                  <MenuItem onClick={() => { setSortBy('amount'); setFilterAnchor(null); }}>By Amount</MenuItem>
                </Menu>

                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={exportToCSV}
                  disabled={!filteredExceptions.length}
                >
                  Export CSV
                </Button>

                {selectedIds.size > 0 && (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<BuildIcon />}
                    onClick={fixBulk}
                  >
                    Fix {selectedIds.size} Selected
                  </Button>
                )}
              </Box>
            </Box>

            {!exceptions || filteredExceptions.length === 0 ? (
              <EmptyState
                icon={searchTerm ? '🔍' : '🎉'}
                title={searchTerm ? 'No exceptions match your search' : 'No exceptions found'}
                message={searchTerm 
                  ? 'Try adjusting your search terms or clearing filters'
                  : 'All transactions are reconciled. Run Sync to check for new exceptions.'
                }
                actionLabel={!searchTerm ? 'Run Sync Now' : undefined}
                onAction={!searchTerm ? syncNow : undefined}
              />
            ) : (
              <>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.100' }}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedIds.size === paginatedExceptions.length && paginatedExceptions.length > 0}
                            indeterminate={selectedIds.size > 0 && selectedIds.size < paginatedExceptions.length}
                            onChange={toggleSelectAll}
                            aria-label="Select all exceptions on this page"
                          />
                        </TableCell>
                        <TableCell><strong>Date</strong></TableCell>
                        <TableCell><strong>Type</strong></TableCell>
                        <TableCell><strong>Details</strong></TableCell>
                        <TableCell><strong>Amount</strong></TableCell>
                        <TableCell align="right"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedExceptions.map((ex) => (
                        <TableRow 
                          key={ex.id} 
                          hover 
                          sx={{ 
                            '&:hover': { bgcolor: 'action.hover', cursor: 'pointer' },
                            '&:focus-within': { bgcolor: 'action.selected' }
                          }}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              setSelectedEx(ex)
                            }
                          }}
                          onClick={() => setSelectedEx(ex)}
                        >
                          <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedIds.has(ex.id)}
                              onChange={() => toggleSelect(ex.id)}
                              aria-label={`Select exception ${ex.kind}`}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDistanceToNow(new Date(ex.createdAt), { addSuffix: true })}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(ex.createdAt).toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={ex.kind.replace(/_/g, ' ')} 
                              size="small" 
                              color={ex.kind.includes('NO_MATCH') ? 'error' : ex.kind.includes('MULTI') ? 'warning' : 'default'}
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
                          <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                            <Tooltip title="Auto-fix this exception">
                              <span>
                                <IconButton 
                                  size="small" 
                                  color="primary"
                                  onClick={(e) => { e.stopPropagation(); fixException(ex.id, ex); }}
                                  disabled={fixingIds.has(ex.id)}
                                  aria-label="Automatically fix this exception"
                                  sx={{ transition: 'all 0.15s', '&:hover': { transform: 'scale(1.1)' } }}
                                >
                                  {fixingIds.has(ex.id) ? (
                                    <CircularProgress size={20} />
                                  ) : (
                                    <BuildIcon />
                                  )}
                                </IconButton>
                              </span>
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
              <EmptyState
                icon="⚡"
                title="No matches yet"
                message="Connect your services and run a sync to start matching transactions automatically."
                actionLabel="Go to Connect"
                actionHref="/connect"
              />
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
                          {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
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

      {/* Exception Detail Modal */}
      <ExceptionDetailModal
        open={!!selectedEx}
        exception={selectedEx}
        onClose={() => setSelectedEx(null)}
        onFix={fixException}
        fixing={selectedEx ? fixingIds.has(selectedEx.id) : false}
      />

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcuts
        open={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />

      {/* Success Animation */}
      <SuccessAnimation
        show={showSuccess}
        message={successMessage}
        onComplete={() => setShowSuccess(false)}
      />
    </Box>
  );
}

