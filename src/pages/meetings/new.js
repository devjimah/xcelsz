import { useState } from 'react';
import { Container, Typography, Box, Alert } from '@mui/material';
import CreateMeetingForm from '@/components/CreateMeetingForm';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';
import apiClient from '@/utils/apiClient';

export default function NewMeeting() {
  const router = useRouter();
  const [error, setError] = useState('');
  // TODO: Replace with actual user ID from authentication
  const userId = '123';

  const handleSubmit = async (meetingData) => {
    try {
      const response = await apiClient.post('meetings', {
        ...meetingData,
        hostId: userId,
        participantId: '456' // TODO: Replace with actual participant selection
      });

      if (!response.meeting) {
        throw new Error('Invalid server response');
      }

      // Wait a moment for the database to update
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to meetings page after successful creation
      router.push('/meetings');
    } catch (err) {
      console.error('Error creating meeting:', err);
      setError(err.message);
      throw err;
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Schedule New Meeting
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <CreateMeetingForm onSubmit={handleSubmit} userId={userId} />
      </Container>
    </Layout>
  );
}
