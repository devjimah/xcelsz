import { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Circle as CircleIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import apiClient from '@/utils/apiClient';

export default function NotificationsMenu({ userId = '123' }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get(`notifications?userId=${userId}`);
      setNotifications(response.notifications || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllRead = async () => {
    if (!userId || notifications.length === 0) return;

    try {
      await apiClient.put('notifications/read-all', null, { userId });
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notifications as read:', err);
      setError('Failed to mark notifications as read');
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    if (!userId || !notificationId) return;

    try {
      await apiClient.put(`notifications/${notificationId}/read?userId=${userId}`);
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to mark notification as read');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'MEETING_INVITATION':
        return '🤝';
      case 'MEETING_UPDATE':
        return '📝';
      case 'MEETING_CANCELLED':
        return '❌';
      case 'MEETING_RESCHEDULE':
        return '⏰';
      default:
        return '📢';
    }
  };

  const formatDate = (date) => {
    try {
      return format(new Date(date), 'PPp');
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid date';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label={`${unreadCount} unread notifications`}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: 360,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllRead}>
              Mark all as read
            </Button>
          )}
        </Box>

        <Divider />

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {error && (
          <Box sx={{ p: 2 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

        {!loading && !error && notifications.length === 0 && (
          <Box sx={{ p: 2 }}>
            <Typography color="textSecondary">No notifications</Typography>
          </Box>
        )}

        <List sx={{ p: 0 }}>
          {notifications.map((notification) => (
            <ListItem
              key={notification.id}
              onClick={() => handleMarkAsRead(notification.id)}
              sx={{
                cursor: 'pointer',
                bgcolor: notification.read ? 'transparent' : 'action.hover',
                '&:hover': {
                  bgcolor: 'action.selected',
                },
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{getNotificationIcon(notification.type)}</span>
                    <Typography variant="subtitle2">{notification.title}</Typography>
                    {!notification.read && (
                      <CircleIcon sx={{ fontSize: 8, color: 'primary.main' }} />
                    )}
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2" color="textPrimary">
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formatDate(notification.createdAt)}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Menu>
    </>
  );
}
