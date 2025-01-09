import { useState } from 'react';
import { Container, Typography, Box, Alert } from '@mui/material';
import CreateMeetingForm from '@/components/CreateMeetingForm';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';

export default function NewMeeting() {
  const router = useRouter();
  const [error, setError] = useState('');
  // TODO: Replace with actual user ID from authentication
  const userId = '123';

  const handleSubmit = async (meetingData) => {
    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...meetingData,
          hostId: userId,
          participantId: '456'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create meeting');
      }

      if (!data.meeting) {
        throw new Error('Invalid server response');
      }

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
          <Box mb={3}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        <CreateMeetingForm onSubmit={handleSubmit} userId={userId} />
      </Container>
    </Layout>
  );
}
