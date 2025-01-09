import { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Button, 
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

export default function AvailabilityPicker({ onTimeSelect, userId }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAvailability = async (date) => {
    setLoading(true);
    setError('');
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const data = await apiClient.get(
        `meetings/availability?userId=${userId}&date=${date.toISOString()}&timezone=${timezone}`
      );
      setAvailableSlots(data.availableSlots);
    } catch (err) {
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
  }, [selectedDate]);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
  };

  const handleTimeSelect = (slot) => {
    onTimeSelect({
      startTime: slot.startTime,
      endTime: slot.endTime
    });
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
                    {format(parseISO(slot.startTime), 'h:mm a')}
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
