'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Chip,
  Divider,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import { Close as CloseIcon, Keyboard as KeyboardIcon } from '@mui/icons-material';

interface KeyboardShortcutsProps {
  open: boolean;
  onClose: () => void;
}

const shortcuts = [
  { category: 'Navigation', items: [
    { keys: ['/', 'Ctrl', 'K'], description: 'Focus search bar' },
    { keys: ['Esc'], description: 'Close dialog / Clear search' },
    { keys: ['↑', '↓'], description: 'Navigate through items' },
    { keys: ['Enter'], description: 'Open selected item' },
  ]},
  { category: 'Actions', items: [
    { keys: ['S'], description: 'Sync now' },
    { keys: ['F'], description: 'Fix selected exception' },
    { keys: ['Ctrl', 'A'], description: 'Select all' },
    { keys: ['Shift', 'Enter'], description: 'Bulk fix selected' },
  ]},
  { category: 'Views', items: [
    { keys: ['D'], description: 'Go to Dashboard' },
    { keys: ['C'], description: 'Go to Connect' },
    { keys: ['?'], description: 'Show keyboard shortcuts' },
  ]},
];

export function KeyboardShortcuts({ open, onClose }: KeyboardShortcutsProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="keyboard-shortcuts-title"
    >
      <DialogTitle id="keyboard-shortcuts-title">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <KeyboardIcon />
            <Typography variant="h6" fontWeight="bold">
              Keyboard Shortcuts
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={onClose}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {shortcuts.map((section, index) => (
          <Box key={section.category} sx={{ mb: index < shortcuts.length - 1 ? 3 : 0 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom fontWeight="bold">
              {section.category}
            </Typography>
            <Table size="small">
              <TableBody>
                {section.items.map((shortcut, i) => (
                  <TableRow key={i} hover>
                    <TableCell sx={{ border: 'none', py: 1 }}>
                      <Typography variant="body2">{shortcut.description}</Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ border: 'none', py: 1 }}>
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        {shortcut.keys.map((key, ki) => (
                          <React.Fragment key={ki}>
                            <Chip
                              label={key}
                              size="small"
                              sx={{
                                fontFamily: 'monospace',
                                fontWeight: 'bold',
                                minWidth: 40,
                                bgcolor: 'grey.100',
                              }}
                            />
                            {ki < shortcut.keys.length - 1 && (
                              <Typography variant="body2" sx={{ alignSelf: 'center', opacity: 0.5 }}>
                                +
                              </Typography>
                            )}
                          </React.Fragment>
                        ))}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {index < shortcuts.length - 1 && <Divider sx={{ mt: 2 }} />}
          </Box>
        ))}

        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            💡 Tip: Press <strong>?</strong> anytime to view this list
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// Hook to manage keyboard shortcuts
export function useKeyboardShortcuts(handlers: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      const ctrl = event.ctrlKey || event.metaKey;
      const shift = event.shiftKey;

      // Build shortcut string
      let shortcut = '';
      if (ctrl) shortcut += 'ctrl+';
      if (shift) shortcut += 'shift+';
      shortcut += key;

      if (handlers[shortcut]) {
        event.preventDefault();
        handlers[shortcut]();
      } else if (handlers[key]) {
        event.preventDefault();
        handlers[key]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}

