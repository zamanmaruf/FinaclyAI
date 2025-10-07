"use client";
import { useState } from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material'

export interface ExceptionRow {
  id: string
  kind: string
  message: string
  amountMinor?: string
  currency?: string
  createdAt?: string
  data?: unknown
}

export default function ExceptionsTable({ rows, onFix }: { rows: ExceptionRow[]; onFix: (id: string) => Promise<void> }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<ExceptionRow | null>(null)

  const handleInvestigate = (row: ExceptionRow) => {
    setSelected(row)
    setOpen(true)
  }

  const close = () => setOpen(false)

  return (
    <>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}</TableCell>
                <TableCell>{r.kind}</TableCell>
                <TableCell>{r.message}</TableCell>
                <TableCell>{r.amountMinor && r.currency ? `${Number(r.amountMinor)/100} ${r.currency}` : '—'}</TableCell>
                <TableCell align="right">
                  <Button size="small" variant="contained" onClick={() => onFix(r.id)}>Fix Now</Button>
                  <Button size="small" sx={{ ml: 1 }} onClick={() => handleInvestigate(r)}>Investigate</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={close} maxWidth="md" fullWidth>
        <DialogTitle>Exception details</DialogTitle>
        <DialogContent>
          <Typography component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(selected, null, 2)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
