import { useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Chip,
  IconButton
} from '@mui/material';
import {
  Refresh as RefreshIcon
} from '@mui/icons-material';
import MeetingCard from './MeetingCard';
import UpdateMeetingForm from './UpdateMeetingForm';

export default function MeetingList({ meetings = [], onDelete, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  const handleUpdate = async (updatedData) => {
    setLoading(true);
    setError('');
    try {
      await onRefresh();
      setShowUpdateForm(false);
      setSelectedMeeting(null);
    } catch (err) {
      console.error('Error updating meeting:', err);
      setError(`Failed to update meeting: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setError('');
    try {
      await onDelete?.(id);
    } catch (err) {
      console.error('Error deleting meeting:', err);
      setError(`Failed to delete meeting: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getMeetingStatusChip = (meeting) => {
    const now = new Date();
    const startTime = new Date(meeting.startTime);
    const endTime = new Date(startTime.getTime() + meeting.duration * 60000);

    if (meeting.status === 'cancelled') {
      return <Chip label="Cancelled" color="error" size="small" />;
    } else if (now > endTime) {
      return <Chip label="Completed" color="default" size="small" />;
    } else if (now >= startTime && now <= endTime) {
      return <Chip label="In Progress" color="primary" size="small" />;
    } else {
      return <Chip label="Upcoming" color="success" size="small" />;
    }
  };

  const filteredMeetings = meetings.filter(meeting => {
    const now = new Date();
    const startTime = new Date(meeting.startTime);
    
    switch (filter) {
      case 'upcoming':
        return startTime > now && meeting.status !== 'cancelled';
      case 'past':
        return startTime <= now || meeting.status === 'cancelled';
      default:
        return true;
    }
  });

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2">
          Your Meetings
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Filter</InputLabel>
            <Select
              value={filter}
              label="Filter"
              onChange={(e) => setFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="upcoming">Upcoming</MenuItem>
              <MenuItem value="past">Past</MenuItem>
            </Select>
          </FormControl>
          <IconButton
            onClick={onRefresh}
            disabled={loading}
            color="primary"
            aria-label="refresh meetings"
          >
            <RefreshIcon />
          </IconButton>
        </Stack>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && meetings.length === 0 && (
        <Alert severity="info">
          You don't have any meetings yet.
        </Alert>
      )}

      {!loading && !error && meetings.length > 0 && filteredMeetings.length === 0 && (
        <Alert severity="info">
          No meetings match the selected filter.
        </Alert>
      )}

      <Stack spacing={2}>
        {filteredMeetings.map(meeting => (
          <MeetingCard
            key={meeting.id}
            meeting={meeting}
            statusChip={getMeetingStatusChip(meeting)}
            onEdit={() => {
              setSelectedMeeting(meeting);
              setShowUpdateForm(true);
            }}
            onDelete={() => handleDelete(meeting.id)}
          />
        ))}
      </Stack>

      <UpdateMeetingForm
        meeting={selectedMeeting}
        open={showUpdateForm}
        onClose={() => {
          setShowUpdateForm(false);
          setSelectedMeeting(null);
        }}
        onUpdate={handleUpdate}
      />
    </Box>
  );
}
