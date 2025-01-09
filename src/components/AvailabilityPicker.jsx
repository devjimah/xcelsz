import { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  CircularProgress,
  Alert,
  Paper,
  TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, parseISO } from 'date-fns';
import apiClient from '@/utils/apiClient';

export default function AvailabilityPicker({ onTimeSelect, userId, duration = 30 }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAvailability = async (date) => {
    setLoading(true);
    setError('');
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log('Fetching availability with:', {
        userId,
        date: date.toISOString(),
        timezone,
        duration
      });

      const data = await apiClient.get(
        `meetings/availability?userId=${userId}&date=${date.toISOString()}&timezone=${timezone}&duration=${duration}`
      );

      console.log('Received availability data:', data);

      if (!Array.isArray(data.availableSlots)) {
        throw new Error('Invalid response format: availableSlots is not an array');
      }

      // Validate each slot
      const validSlots = data.availableSlots.filter(slot => {
        try {
          // Try parsing the dates to validate them
          parseISO(slot.startTime);
          parseISO(slot.endTime);
          return true;
        } catch (err) {
          console.error('Invalid slot:', slot, err);
          return false;
        }
      });

      console.log('Valid slots:', validSlots);
      setAvailableSlots(validSlots);
    } catch (err) {
      console.error('Error fetching availability:', err);
      setError(err.message || 'Failed to fetch availability');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchAvailability(selectedDate);
    }
  }, [selectedDate, duration]);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const handleTimeSelect = (slot) => {
    try {
      // Validate the slot before passing it up
      const startTime = parseISO(slot.startTime);
      const endTime = parseISO(slot.endTime);
      
      onTimeSelect({
        startTime: slot.startTime,
        endTime: slot.endTime
      });
    } catch (err) {
      console.error('Error handling time selection:', err);
      setError('Invalid time slot selected');
    }
  };

  const formatTimeSlot = (slot) => {
    try {
      const startTime = parseISO(slot.startTime);
      const endTime = parseISO(slot.endTime);
      return `${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}`;
    } catch (err) {
      console.error('Error formatting time slot:', slot, err);
      return 'Invalid Time';
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Select Date"
          value={selectedDate}
          onChange={handleDateChange}
          renderInput={(params) => <TextField {...params} fullWidth />}
          disablePast
          sx={{ mb: 3 }}
        />
      </LocalizationProvider>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography variant="h6" gutterBottom>
            Available Time Slots for {format(selectedDate, 'MMMM d, yyyy')}
          </Typography>

          <Grid container spacing={2}>
            {availableSlots.map((slot) => (
              <Grid item xs={12} sm={6} md={4} key={slot.startTime}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                  onClick={() => handleTimeSelect(slot)}
                >
                  <Typography variant="body1">
                    {formatTimeSlot(slot)}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {availableSlots.length === 0 && !loading && (
            <Typography color="text.secondary" align="center" sx={{ mt: 2 }}>
              No available time slots for this date
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}
