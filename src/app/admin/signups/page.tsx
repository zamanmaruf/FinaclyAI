"use client";
import { useState } from 'react'
import useSWR from 'swr'
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Download as DownloadIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface Signup {
  id: string
  name: string | null
  company: string | null
  email: string
  createdAt: string
  source: string | null
}

export default function AdminSignupsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()
  const { data, mutate, isLoading } = useSWR<{ signups: Signup[]; stats: any }>('/api/admin/signups', fetcher)

  const signups = data?.signups || []
  const stats = data?.stats || { total: 0, last7Days: 0, last30Days: 0 }

  const filteredSignups = signups.filter(signup =>
    signup.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    signup.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    signup.company?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  async function handleLogout() {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      toast.error('Logout failed')
    }
  }

  function exportToCSV() {
    if (filteredSignups.length === 0) {
      toast.error('No signups to export')
      return
    }

    const headers = ['Name', 'Company', 'Email', 'Source', 'Signed Up']
    const rows = filteredSignups.map(s => [
      s.name || '',
      s.company || '',
      s.email,
      s.source || '',
      new Date(s.createdAt).toLocaleString()
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `finacly-waitlist-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)

    toast.success(`Exported ${filteredSignups.length} signups to CSV`)
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Admin Navigation */}
      <Box 
        component="nav" 
        sx={{ 
          bgcolor: 'primary.main',
          color: 'white',
          borderBottom: '1px solid',
          borderColor: 'primary.dark',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Image 
                src="/Finacly AI Logo - Abstract Finance Symbol.jpg" 
                alt="FinaclyAI" 
                width={32} 
                height={32}
                style={{ borderRadius: '6px' }}
              />
              <Typography variant="h6" fontWeight="bold">
                FinaclyAI Admin
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={2}>
              <Button color="inherit" component={Link} href="/connect">Connect</Button>
              <Button color="inherit" component={Link} href="/dashboard">Dashboard</Button>
              <Button color="inherit" component={Link} href="/admin/signups" sx={{ fontWeight: 'bold' }}>Signups</Button>
              <IconButton 
                color="inherit" 
                onClick={handleLogout}
                size="small"
                sx={{ ml: 1 }}
              >
                <LogoutIcon />
              </IconButton>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Header */}
      <Box sx={{ bgcolor: 'white', py: 4, boxShadow: 1 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Waitlist Signups
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage and track early access requests
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Tooltip title="Refresh data">
                <IconButton onClick={() => mutate()}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={exportToCSV}
                disabled={filteredSignups.length === 0}
              >
                Export CSV
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" color="primary">
                      {stats.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Signups
                    </Typography>
                  </Box>
                  <EmailIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" color="success.main">
                      {stats.last7Days}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Last 7 Days
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 48, color: 'success.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold" color="info.main">
                      {stats.last30Days}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Last 30 Days
                    </Typography>
                  </Box>
                  <BusinessIcon sx={{ fontSize: 48, color: 'info.main', opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search by name, company, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Paper>

        {/* Signups Table */}
        <Paper elevation={2}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.100' }}>
                <TableRow>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Company</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Source</strong></TableCell>
                  <TableCell><strong>Signed Up</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">Loading signups...</Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredSignups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        {searchTerm ? 'No signups match your search' : 'No signups yet'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSignups.map((signup) => (
                    <TableRow key={signup.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {signup.name || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {signup.company || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {signup.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={signup.source || 'unknown'} 
                          size="small" 
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDistanceToNow(new Date(signup.createdAt), { addSuffix: true })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(signup.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </Box>
  );
}

