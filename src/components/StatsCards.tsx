"use client";
import { Card, CardContent, Grid, Typography } from '@mui/material'

export default function StatsCards({
  matched,
  exceptions,
  lastSync,
}: {
  matched: number
  exceptions: number
  lastSync?: string
}) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">Transactions Matched</Typography>
            <Typography variant="h5">{matched}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">Exceptions</Typography>
            <Typography variant="h5">{exceptions}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">Last Sync</Typography>
            <Typography variant="h6">{lastSync || '—'}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
