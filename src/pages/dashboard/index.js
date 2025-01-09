import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

export default function Dashboard() {
  const router = useRouter();
  // TODO: Replace with actual user ID from authentication
  const userId = '123';

  const quickActions = [
    {
      title: 'Schedule Meeting',
      description: 'Create a new meeting with a client or freelancer',
      action: () => router.push('/meetings/new')
    },
    {
      title: 'View Calendar',
      description: 'Check your upcoming meetings and schedule',
      action: () => router.push('/meetings')
    },
    {
      title: 'Browse Jobs',
      description: 'Find new job opportunities',
      action: () => router.push('/jobs')
    },
    {
      title: 'Update Profile',
      description: 'Keep your profile information up to date',
      action: () => router.push('/profile')
    }
  ];

  return (
    <Layout>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>

        <Grid container spacing={3}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={action.action}>
                    Go to {action.title}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Layout>
  );
}
