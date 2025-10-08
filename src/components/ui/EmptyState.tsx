'use client';

import React from 'react';
import { Box, Typography, Button } from '@mui/material';

interface EmptyStateProps {
  icon: string | React.ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Box sx={{ fontSize: typeof icon === 'string' ? 64 : undefined, mb: 2, opacity: 0.6 }}>
        {icon}
      </Box>
      <Typography variant="h6" fontWeight="medium" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
        {message}
      </Typography>
      {(actionLabel && (actionHref || onAction)) && (
        <Button
          variant="outlined"
          size="large"
          href={actionHref}
          onClick={onAction}
          sx={{
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 2,
            },
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}

