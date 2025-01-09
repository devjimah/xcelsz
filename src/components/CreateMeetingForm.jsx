import { useState } from 'react';
import { 
  Box,
  TextField,
  Button,
  Stack,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Typography
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import AvailabilityPicker from './AvailabilityPicker';
import { format, parseISO } from 'date-fns';

const durations = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

const steps = ['Meeting Details', 'Select Time', 'Confirm'];

export default function CreateMeetingForm({ onSubmit, userId }) {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: null,
    duration: 30,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleTimeSelect = (selectedTime) => {
    console.log('Selected time:', selectedTime);
    setFormData(prev => ({ 
      ...prev, 
      startTime: selectedTime.startTime // Store the ISO string
    }));
    handleNext();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.title || !formData.startTime) {
        throw new Error('Please fill in all required fields');
      }

      await onSubmit(formData);
      setFormData({
        title: '',
        description: '',
        startTime: null,
        duration: 30,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      setActiveStep(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    try {
      const date = parseISO(dateTimeString);
      return format(date, 'PPpp');
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid Date';
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <TextField
              label="Meeting Title"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              disabled={loading}
            />

            <TextField
              label="Description"
              multiline
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              disabled={loading}
            />

            <FormControl>
              <InputLabel>Duration</InputLabel>
              <Select
                value={formData.duration}
                label="Duration"
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                disabled={loading}
              >
                {durations.map((duration) => (
                  <MenuItem key={duration.value} value={duration.value}>
                    {duration.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        );
      case 1:
        return (
          <AvailabilityPicker 
            onTimeSelect={handleTimeSelect}
            userId={userId}
            duration={formData.duration}
          />
        );
      case 2:
        return (
          <Stack spacing={3}>
            <Alert severity="info">
              Please review your meeting details before confirming.
            </Alert>
            <Box>
              <Typography variant="subtitle1">Title: {formData.title}</Typography>
              <Typography variant="subtitle1">
                Time: {formatDateTime(formData.startTime)}
              </Typography>
              <Typography variant="subtitle1">
                Duration: {durations.find(d => d.value === formData.duration)?.label}
              </Typography>
              {formData.description && (
                <Typography variant="subtitle1">Description: {formData.description}</Typography>
              )}
            </Box>
          </Stack>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <form onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {renderStepContent(activeStep)}

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0 || loading}
          >
            Back
          </Button>
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Meeting'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading || (activeStep === 0 && !formData.title)}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </form>
    </Box>
  );
}
