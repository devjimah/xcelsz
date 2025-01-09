import { useState, useEffect } from 'react';
import { Container, Grid, Paper, Box, useTheme } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import MeetingScheduler from '@/components/MeetingScheduler';
import MeetingsList from '@/components/MeetingsList';

export default function TestMeetings() {
  const [meetings, setMeetings] = useState([]);
  const theme = useTheme();

  // Test user IDs
  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const participantId = '987fcdeb-51a2-43d8-b901-123456789000';

  const fetchMeetings = async () => {
    try {
      const response = await fetch(`/api/meetings?userId=${userId}`);
      const data = await response.json();
      if (response.ok) {
        setMeetings(data);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleMeetingScheduled = (meeting) => {
    setMeetings([...meetings, meeting]);
  };

  const handleMeetingDeleted = (meetingId) => {
    setMeetings(meetings.filter(m => m.id !== meetingId));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box 
        sx={{ 
          minHeight: '100vh',
          bgcolor: 'grey.50',
          py: 4
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 4,
                  height: '100%',
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <MeetingScheduler
                  userId={userId}
                  participantId={participantId}
                  onScheduled={handleMeetingScheduled}
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={7}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 4,
                  height: '100%',
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <MeetingsList
                  meetings={meetings}
                  onDelete={handleMeetingDeleted}
                  onRefresh={fetchMeetings}
                />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </LocalizationProvider>
  );
}
