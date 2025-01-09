import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  IconButton, 
  Stack,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Delete as DeleteIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  Description as DescriptionIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import UpdateMeetingForm from './UpdateMeetingForm';
import apiClient from '@/utils/apiClient';

export default function MeetingsList({ meetings = [], onDelete, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  const handleDelete = async (id) => {
    setError('');
    setLoading(true);
    try {
      const meetingToDelete = meetings.find(m => m.id === id);
      const meetingTitle = meetingToDelete?.title || 'Meeting';

      await apiClient.delete(`meetings/${id}`);
      onDelete?.(id);
    } catch (err) {
      console.error('Error deleting meeting:', err);
      setError(`Failed to cancel ${meetingTitle}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, updatedData) => {
    setError('');
    setLoading(true);
    try {
      await apiClient.put(`meetings/${id}`, updatedData);
      setShowUpdateForm(false);
      setSelectedMeeting(null);
      onRefresh?.();
    } catch (err) {
      console.error('Error updating meeting:', err);
      setError(`Failed to update meeting: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (meeting) => {
    setSelectedMeeting(meeting);
    setShowUpdateForm(true);
  };

  const getMeetingStatusChip = (meeting) => {
    const now = new Date();
    const startTime = new Date(meeting.startTime);
    const endTime = new Date(startTime.getTime() + meeting.duration * 60000);

    if (now > endTime) {
      return <Chip label="Completed" color="default" size="small" />;
    } else if (now >= startTime && now <= endTime) {
      return <Chip label="In Progress" color="primary" size="small" />;
    } else {
      return <Chip label="Upcoming" color="success" size="small" />;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" component="h2">
            Your Meetings
          </Typography>
          <IconButton
            onClick={onRefresh}
            disabled={loading}
            color="primary"
            aria-label="refresh meetings"
          >
            <RefreshIcon />
          </IconButton>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && meetings.length === 0 ? (
          <Card sx={{ bgcolor: 'grey.50' }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                No meetings scheduled
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {meetings.map((meeting) => (
              <Card key={meeting.id}>
                <CardContent>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Stack spacing={1}>
                        <Typography variant="h6" component="h3">
                          {meeting.title}
                        </Typography>
                        {getMeetingStatusChip(meeting)}
                      </Stack>
                      <Box>
                        <IconButton
                          onClick={() => handleEditClick(meeting)}
                          aria-label="edit meeting"
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(meeting.id)}
                          aria-label="delete meeting"
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    <Stack spacing={1} sx={{ color: 'text.secondary' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EventIcon fontSize="small" />
                        <Typography variant="body2">
                          {format(new Date(meeting.startTime), 'MMMM d, yyyy')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon fontSize="small" />
                        <Typography variant="body2">
                          {format(new Date(meeting.startTime), 'h:mm a')} ({meeting.duration} minutes)
                        </Typography>
                      </Box>
                      {meeting.description && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DescriptionIcon fontSize="small" />
                          <Typography variant="body2">
                            {meeting.description}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>

      <Dialog
        open={showUpdateForm}
        onClose={() => setShowUpdateForm(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Meeting</DialogTitle>
        <DialogContent>
          {selectedMeeting && (
            <UpdateMeetingForm
              meeting={selectedMeeting}
              onSubmit={(data) => handleUpdate(selectedMeeting.id, data)}
              onCancel={() => setShowUpdateForm(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
