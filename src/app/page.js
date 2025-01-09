'use client';

import { Box, Container, Typography, Button, Grid, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';
import Image from 'next/image';


export default function Home() {
  const router = useRouter();

  

  return (
    <Box sx={{ flexGrow: 1 }}>
     
      <Box
        sx={{
          bgcolor: 'background.paper',
          pt: 8,
          pb: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                component="h1"
                variant="h2"
                color="text.primary"
                gutterBottom
                sx={{ fontWeight: 'bold' }}
              >
                Welcome to XcelSz
              </Typography>
              <Typography variant="h5" color="text.secondary" paragraph>
                Your all-in-one platform for managing meetings, tracking jobs, and boosting productivity.
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push('/dashboard')}
                  sx={{ mr: 2 }}
                >
                 Go to Dashboard
                </Button>
               
              </Box>
            </Grid>
           
          </Grid>
        </Container>
      </Box>

    </Box>
  );
}
