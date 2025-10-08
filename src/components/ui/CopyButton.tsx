'use client';

import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { ContentCopy as CopyIcon, Check as CheckIcon } from '@mui/icons-material';
import toast from 'react-hot-toast';

interface CopyButtonProps {
  text: string;
  label?: string;
  size?: 'small' | 'medium' | 'large';
}

export function CopyButton({ text, label = 'Copy', size = 'small' }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label} copied`);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  return (
    <Tooltip title={copied ? 'Copied!' : `Copy ${label.toLowerCase()}`}>
      <IconButton
        onClick={handleCopy}
        size={size}
        aria-label={`Copy ${label.toLowerCase()}`}
        sx={{
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'scale(1.1)',
          },
        }}
      >
        {copied ? (
          <CheckIcon fontSize="small" sx={{ color: 'success.main' }} />
        ) : (
          <CopyIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}

