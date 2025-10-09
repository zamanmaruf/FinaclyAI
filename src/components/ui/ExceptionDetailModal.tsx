'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Build as FixIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

interface ExceptionDetailModalProps {
  open: boolean;
  exception: {
    id: string;
    kind: string;
    message: string;
    data?: any;
    createdAt: string;
    amountMinor?: string;
    currency?: string;
  } | null;
  onClose: () => void;
  onFix?: (id: string) => void;
  fixing?: boolean;
}

const actionGuidance: Record<string, string> = {
  PAYOUT_NO_BANK_MATCH: 'Wait 1-3 business days for the payout to clear your bank, then sync again. If it still doesn\'t appear after 5 days, contact Stripe support.',
  PAYOUT_NO_QBO_DEPOSIT: 'Click "Fix Now" to automatically create the deposit in QuickBooks with proper fee accounting.',
  MULTI_CURRENCY_PAYOUT: 'Manually enter this transaction in QuickBooks with the appropriate exchange rate. Our system doesn\'t auto-convert currencies to prevent accounting errors.',
  PARTIAL_PAYMENT_DETECTED: 'This payout may be split across multiple bank deposits. Review the candidates and manually reconcile in QuickBooks.',
  AMBIGUOUS_MATCH: 'Multiple bank transactions match this payout. Review the candidates and select the correct one, or wait for additional transactions to clear.',
};

export function ExceptionDetailModal({
  open,
  exception,
  onClose,
  onFix,
  fixing = false,
}: ExceptionDetailModalProps) {
  if (!exception) return null;

  const canFix = exception.kind === 'PAYOUT_NO_QBO_DEPOSIT';
  const guidance = actionGuidance[exception.kind] || 'Review the details below and take appropriate action.';

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const formatCurrency = (minor: string, curr: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
    }).format(Number(minor) / 100);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      aria-labelledby="exception-detail-title"
    >
      <DialogTitle id="exception-detail-title">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Exception Details
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Created {formatDistanceToNow(new Date(exception.createdAt), { addSuffix: true })}
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={onClose}
            size="small"
            sx={{ mt: -1, mr: -1 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Type */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Type
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              label={exception.kind}
              color={exception.kind.includes('NO_MATCH') ? 'error' : exception.kind.includes('MULTI') ? 'warning' : 'default'}
              size="small"
            />
            <Tooltip title="Copy exception type">
              <IconButton
                size="small"
                onClick={() => copyToClipboard(exception.kind, 'Exception type')}
                aria-label="Copy exception type"
              >
                <CopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Message */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Message
          </Typography>
          <Typography variant="body2">{exception.message}</Typography>
        </Box>

        {/* Amount if present */}
        {exception.amountMinor && exception.currency && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Amount
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {formatCurrency(exception.amountMinor, exception.currency)}
            </Typography>
          </Box>
        )}

        {/* What to do next */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            What to Do Next
          </Typography>
          <Alert severity={canFix ? 'success' : 'info'} icon={canFix ? <FixIcon /> : undefined}>
            {guidance}
          </Alert>
        </Box>

        {/* Exception ID */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Exception ID
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'monospace',
                bgcolor: 'grey.100',
                px: 1,
                py: 0.5,
                borderRadius: 0.5,
                fontSize: '0.85rem',
              }}
            >
              {exception.id}
            </Typography>
            <Tooltip title="Copy exception ID">
              <IconButton
                size="small"
                onClick={() => copyToClipboard(exception.id, 'Exception ID')}
                aria-label="Copy exception ID"
              >
                <CopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Full Data */}
        {exception.data && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Technical Details
            </Typography>
            <Box
              sx={{
                bgcolor: 'grey.900',
                color: 'grey.100',
                p: 2,
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                overflowX: 'auto',
                maxHeight: 300,
              }}
            >
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(exception.data, null, 2)}
              </pre>
            </Box>
            <Button
              size="small"
              startIcon={<CopyIcon />}
              onClick={() => copyToClipboard(JSON.stringify(exception.data, null, 2), 'Technical details')}
              sx={{ mt: 1 }}
            >
              Copy JSON
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} size="large">
          Close
        </Button>
        {canFix && onFix && (
          <Button
            onClick={() => onFix(exception.id)}
            variant="contained"
            color="primary"
            size="large"
            startIcon={fixing ? <CircularProgress size={16} color="inherit" /> : <FixIcon />}
            disabled={fixing}
          >
            {fixing ? 'Fixing...' : 'Fix Now'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

