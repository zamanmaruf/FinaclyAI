"use client";
import { Button, CircularProgress } from '@mui/material'

export default function ConnectButton({
  label,
  onClick,
  connected,
  loading,
  disabled,
}: {
  label: string
  onClick?: () => void
  connected?: boolean
  loading?: boolean
  disabled?: boolean
}) {
  if (connected) {
    return (
      <Button variant="contained" color="success" disabled>
        Connected
      </Button>
    )
  }
  return (
    <Button variant="contained" onClick={onClick} disabled={loading || disabled}>
      {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : label}
    </Button>
  )
}
