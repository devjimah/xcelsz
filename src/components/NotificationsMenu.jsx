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
      const data = await apiClient.get(`notifications?userId=${userId}`);
      setNotifications(Array.isArray(data) ? data : []);
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
      const promises = notifications.map(notification =>
        apiClient.put('notifications', {
          notificationId: notification.id,
          userId
        })
      );

      await Promise.all(promises);
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notifications as read:', err);
      setError('Failed to mark notifications as read');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'MEETING_INVITATION':
        return '🤝';
      case 'MEETING_UPDATED':
        return '📝';
      case 'MEETING_CANCELLED':
        return '❌';
      case 'MEETING_REMINDER':
        return '⏰';
      default:
        return '📢';
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
            width: '350px',
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" component="div">
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllRead}
              sx={{ mt: 1 }}
            >
              Mark all as read
            </Button>
          )}
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <MenuItem>
            <Typography color="error">{error}</Typography>
          </MenuItem>
        ) : notifications.length === 0 ? (
          <MenuItem>
            <Typography>No notifications</Typography>
          </MenuItem>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification, index) => (
              <div key={notification.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{getNotificationIcon(notification.type)}</span>
                        <Typography variant="body1">
                          {notification.message}
                        </Typography>
                        {!notification.read && (
                          <CircleIcon
                            sx={{
                              color: 'primary.main',
                              fontSize: 8,
                              ml: 'auto'
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={format(new Date(notification.createdAt), 'PPp')}
                  />
                </ListItem>
              </div>
            ))}
          </List>
        )}
      </Menu>
    </>
  );
}
