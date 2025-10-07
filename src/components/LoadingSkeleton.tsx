'use client';

import { Box, Skeleton, Card, CardContent, Grid, Paper } from '@mui/material';

export function StatsCardSkeleton() {
  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Skeleton variant="circular" width={32} height={32} sx={{ mr: 1 }} />
          <Skeleton variant="text" width={150} />
        </Box>
        <Skeleton variant="text" width={80} height={60} />
      </CardContent>
    </Card>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Box>
      {[...Array(rows)].map((_, i) => (
        <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Skeleton variant="text" width="20%" />
          <Skeleton variant="text" width="30%" />
          <Skeleton variant="text" width="25%" />
          <Skeleton variant="text" width="15%" />
          <Skeleton variant="rectangular" width="10%" height={32} />
        </Box>
      ))}
    </Box>
  );
}

export function DashboardSkeleton() {
  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[1, 2, 3].map((i) => (
          <Grid item xs={12} md={4} key={i}>
            <StatsCardSkeleton />
          </Grid>
        ))}
      </Grid>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
        <TableSkeleton rows={3} />
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Skeleton variant="text" width={180} height={40} sx={{ mb: 3 }} />
        <TableSkeleton rows={5} />
      </Paper>
    </Box>
  );
}

