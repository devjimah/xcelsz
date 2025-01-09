import { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import MeetingsCalendar from '@/components/MeetingsCalendar';
import MeetingList from '@/components/MeetingList';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import apiClient from '@/utils/apiClient';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`meetings-tabpanel-${index}`}
      aria-labelledby={`meetings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function MeetingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // TODO: Replace with actual user ID from authentication
  const userId = '123';

  const fetchMeetings = async () => {
    if (!userId) return;

    setLoading(true);
    setError('');
    try {
      const data = await apiClient.get(`meetings?userId=${userId}`);
      setMeetings(data.meetings || []);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError('Failed to load meetings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    try {
      await apiClient.delete(`meetings/${meetingId}`);
      // Refetch meetings after successful deletion
      setTimeout(fetchMeetings, 500);
    } catch (error) {
      console.error('Error deleting meeting:', error);
      setError('Failed to delete meeting. Please try again.');
    }
  };

  useEffect(() => {
    fetchMeetings();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchMeetings, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Layout>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="Calendar View" />
              <Tab label="List View" />
            </Tabs>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push('/meetings/new')}
            >
              New Meeting
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        <TabPanel value={activeTab} index={0}>
          <MeetingsCalendar 
            meetings={meetings}
            onDelete={handleDeleteMeeting}
            onRefresh={fetchMeetings}
          />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <MeetingList 
            meetings={meetings}
            onDelete={handleDeleteMeeting}
            onRefresh={fetchMeetings}
          />
        </TabPanel>
      </Box>
    </Layout>
  );
}
