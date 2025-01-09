import { useState } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Alert, 
  CircularProgress,
  Stack,
  InputAdornment,
  Divider
} from '@mui/material';
import { 
  Schedule as ScheduleIcon,
  Title as TitleIcon,
  Description as DescriptionIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import apiClient from '@/utils/apiClient';

export default function MeetingScheduler({ userId, participantId, onScheduled }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [duration, setDuration] = useState(30);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiClient.post('meetings', {
        title,
        description,
        startTime: startTime.toISOString(),
        duration,
        hostId: userId,
        participantId,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      onScheduled?.(data);
      setTitle('');
      setDescription('');
      setStartTime(null);
      setDuration(30);
    } catch (err) {
      setError(err.message || 'Failed to schedule meeting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            Schedule a Meeting
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Fill out the form below to schedule a new meeting
          </Typography>
          <Divider sx={{ mb: 3 }} />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Meeting Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <TitleIcon color="primary" />
              </InputAdornment>
            ),
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />

        <TextField
          fullWidth
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          rows={3}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <DescriptionIcon color="primary" />
              </InputAdornment>
            ),
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />

        <DateTimePicker
          label="Start Time"
          value={startTime}
          onChange={setStartTime}
          required
          slotProps={{
            textField: {
              fullWidth: true,
              required: true,
              InputProps: {
                startAdornment: (
                  <InputAdornment position="start">
                    <ScheduleIcon color="primary" />
                  </InputAdornment>
                ),
              },
              sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } }
            }
          }}
        />

        <TextField
          fullWidth
          type="number"
          label="Duration (minutes)"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccessTimeIcon color="primary" />
              </InputAdornment>
            ),
          }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading || !title || !startTime}
          sx={{
            mt: 2,
            height: 48,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem'
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Schedule Meeting'
          )}
        </Button>
      </Stack>
    </Box>
  );
}
