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
import { format } from 'date-fns';

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
    setFormData(prev => ({ ...prev, startTime: selectedTime }));
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
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              disabled={loading}
            />

            <FormControl>
              <InputLabel>Duration</InputLabel>
              <Select
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                disabled={loading}
                label="Duration"
              >
                {durations.map(({ value, label }) => (
                  <MenuItem key={value} value={value}>
                    {label}
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
                Time: {formData.startTime ? format(formData.startTime, 'PPpp') : ''}
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
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 800 }}>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderStepContent(activeStep)}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0 || loading}
        >
          Back
        </Button>
        
        {activeStep === steps.length - 1 ? (
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Schedule Meeting
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={activeStep === 1 || loading}
          >
            Next
          </Button>
        )}
      </Box>
    </Box>
  );
}
