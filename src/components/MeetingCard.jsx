import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Stack
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

export default function MeetingCard({ meeting, statusChip, onEdit, onDelete }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    handleMenuClose();
    onEdit();
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(false);
    onDelete();
  };

  const formatDateTime = (date) => {
    try {
      return format(new Date(date), 'PPp');
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
  };

  return (
    <>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" component="div">
                {meeting.title}
              </Typography>
              {statusChip}
            </Stack>
            <IconButton onClick={handleMenuClick} size="small">
              <MoreVertIcon />
            </IconButton>
          </Box>

          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventIcon color="action" fontSize="small" />
              <Typography variant="body2">
                {formatDateTime(meeting.startTime)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon color="action" fontSize="small" />
              <Typography variant="body2">
                {meeting.duration} minutes
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="action" fontSize="small" />
              <Typography variant="body2">
                With: {meeting.participantId}
              </Typography>
            </Box>

            {meeting.description && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <DescriptionIcon color="action" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  {meeting.description}
                </Typography>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>Edit</MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Meeting</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{meeting.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
