'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Fade, Zoom } from '@mui/material';
import { CheckCircle as CheckIcon } from '@mui/icons-material';

interface SuccessAnimationProps {
  show: boolean;
  message?: string;
  onComplete?: () => void;
  duration?: number;
}

export function SuccessAnimation({
  show,
  message = 'Success!',
  onComplete,
  duration = 2000,
}: SuccessAnimationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  return (
    <Fade in={visible} timeout={300}>
      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <Zoom in={visible} timeout={300}>
          <Box
            sx={{
              bgcolor: 'success.main',
              color: 'white',
              p: 4,
              borderRadius: 3,
              boxShadow: 6,
              minWidth: 250,
            }}
          >
            <CheckIcon sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="h5" fontWeight="bold">
              {message}
            </Typography>
          </Box>
        </Zoom>
      </Box>
    </Fade>
  );
}

// Confetti animation component
export function ConfettiAnimation({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9998,
        overflow: 'hidden',
      }}
    >
      {[...Array(50)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            top: '-10px',
            left: `${Math.random() * 100}%`,
            width: '10px',
            height: '10px',
            backgroundColor: ['#2e7d32', '#4caf50', '#81c784', '#ffd54f', '#ff9800'][
              i % 5
            ],
            animation: `fall ${3 + Math.random() * 2}s linear ${Math.random() * 2}s`,
            '@keyframes fall': {
              to: {
                transform: `translateY(100vh) rotate(${Math.random() * 360}deg)`,
                opacity: 0,
              },
            },
          }}
        />
      ))}
    </Box>
  );
}

