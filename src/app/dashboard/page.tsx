"use client";
import useSWR from 'swr'
import { useState } from 'react'
import { Container, Stack, Button, Typography, Box } from '@mui/material'
import StatsCards from '@/src/components/StatsCards'
import ExceptionsTable, { ExceptionRow } from '@/src/components/ExceptionsTable'
import RecentMatches, { MatchItem } from '@/src/components/RecentMatches'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function DashboardPage() {
  const [syncing, setSyncing] = useState(false)
  const { data: stats, mutate: mutateStats } = useSWR<{ matched: number; exceptions: number; lastSync?: string }>("/api/stats", fetcher)
  const { data: exceptions, mutate: mutateExceptions } = useSWR<{ rows: ExceptionRow[] }>("/api/exceptions/list", fetcher)
  const { data: recent } = useSWR<{ items: MatchItem[] }>("/api/matches/recent", fetcher)

  async function syncNow() {
    setSyncing(true)
    try {
      await fetch('/api/sync', { method: 'POST' })
      await Promise.all([mutateStats(), mutateExceptions()])
    } finally { setSyncing(false) }
  }

  async function fixException(id: string) {
    await fetch(`/api/fix/payout?id=${encodeURIComponent(id)}`, { method: 'POST' })
    await mutateExceptions()
    await mutateStats()
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">Reconciliation Dashboard</Typography>
        <Button variant="contained" onClick={syncNow} disabled={syncing}>{syncing ? 'Syncing…' : 'Sync Now'}</Button>
      </Stack>

      <Box sx={{ mb: 3 }}>
        <StatsCards matched={stats?.matched ?? 0} exceptions={stats?.exceptions ?? 0} lastSync={stats?.lastSync} />
      </Box>

      <Typography variant="h6" sx={{ mb: 1 }}>Exceptions Inbox</Typography>
      <ExceptionsTable rows={exceptions?.rows ?? []} onFix={fixException} />

      <Box sx={{ mt: 4 }}>
        <RecentMatches items={recent?.items ?? []} />
      </Box>
    </Container>
  )
}
