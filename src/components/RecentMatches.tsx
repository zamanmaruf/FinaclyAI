"use client";
import { Card, CardContent, List, ListItem, ListItemText, Typography } from '@mui/material'

export interface MatchItem {
  id: string
  description: string
  date: string
}

export default function RecentMatches({ items }: { items: MatchItem[] }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Recent Matches</Typography>
        <List>
          {items.map((m) => (
            <ListItem key={m.id}>
              <ListItemText primary={m.description} secondary={new Date(m.date).toLocaleString()} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  )
}
