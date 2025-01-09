import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import UpdateMeetingForm from './UpdateMeetingForm';

export default function MeetingsCalendar({ userId = '123', meetings = [], onDelete, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  // Transform meetings data for FullCalendar
  const calendarEvents = meetings.map(meeting => ({
    id: meeting.id,
    title: meeting.title || 'Untitled Meeting',
    start: new Date(meeting.startTime),
    end: new Date(new Date(meeting.startTime).getTime() + (meeting.duration || 30) * 60000),
    extendedProps: {
      description: meeting.description || '',
      hostId: meeting.hostId,
      participantId: meeting.participantId,
      status: meeting.status || 'scheduled',
      duration: meeting.duration || 30
    }
  }));

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
  };

  const handleCloseDialog = () => {
    setSelectedEvent(null);
  };

  const handleEditClick = () => {
    setShowUpdateForm(true);
  };

  const handleUpdateSuccess = () => {
    setShowUpdateForm(false);
    setSelectedEvent(null);
    onRefresh?.();
  };

  const handleDelete = async (eventId) => {
    try {
      await onDelete?.(eventId);
      setSelectedEvent(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) {
    return (
      <Box m={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={calendarEvents}
        eventClick={handleEventClick}
        height="auto"
        slotMinTime="09:00:00"
        slotMaxTime="17:00:00"
      />

      {selectedEvent && (
        <Dialog open={Boolean(selectedEvent)} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              {selectedEvent.title}
              {(selectedEvent.extendedProps.hostId === userId) && (
                <Box>
                  <IconButton onClick={handleEditClick} size="small" sx={{ mr: 1 }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDelete(selectedEvent.id)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )}
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              {selectedEvent.extendedProps.description}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Start: {format(new Date(selectedEvent.start), 'PPp')}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Duration: {selectedEvent.extendedProps.duration} minutes
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Status: {selectedEvent.extendedProps.status}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {showUpdateForm && selectedEvent && (
        <Dialog open={showUpdateForm} onClose={() => setShowUpdateForm(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Update Meeting</DialogTitle>
          <DialogContent>
            <UpdateMeetingForm
              meetingId={selectedEvent.id}
              initialData={{
                title: selectedEvent.title,
                description: selectedEvent.extendedProps.description,
                startTime: selectedEvent.start,
                duration: selectedEvent.extendedProps.duration
              }}
              onSuccess={handleUpdateSuccess}
              onCancel={() => setShowUpdateForm(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
}
