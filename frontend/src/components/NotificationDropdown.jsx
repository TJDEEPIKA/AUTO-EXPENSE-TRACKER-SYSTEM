import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .notification-container {
          position: relative;
          display: inline-block;
        }

        .notification-bell {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          cursor: pointer;
          position: relative;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .notification-bell:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .notification-bell:active {
          transform: translateY(0);
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          border-radius: 12px;
          padding: 2px 7px;
          font-size: 11px;
          font-weight: 700;
          min-width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(245, 87, 108, 0.4);
          animation: pulse 2s infinite;
          border: 2px solid white;
        }

        .notification-dropdown {
          position: absolute;
          top: 60px;
          right: 0;
          background: white;
          border-radius: 16px;
          width: 380px;
          max-height: 500px;
          overflow: hidden;
          z-index: 1000;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          animation: slideDown 0.3s ease;
          border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .dropdown-header {
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-weight: 700;
          font-size: 18px;
          letter-spacing: 0.5px;
        }

        .notification-list {
          max-height: 420px;
          overflow-y: auto;
        }

        .notification-list::-webkit-scrollbar {
          width: 6px;
        }

        .notification-list::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .notification-list::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
        }

        .notification-list::-webkit-scrollbar-thumb:hover {
          background: #5568d3;
        }

        .notification-item {
          padding: 16px 20px;
          border-bottom: 1px solid #f0f0f0;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          animation: fadeIn 0.3s ease;
        }

        .notification-item:hover {
          background: linear-gradient(90deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
          transform: translateX(4px);
        }

        .notification-item:last-child {
          border-bottom: none;
        }

        .notification-item.unread {
          background: linear-gradient(90deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
          border-left: 4px solid #667eea;
        }

        .notification-item.unread::before {
          content: '';
          position: absolute;
          left: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          background: #667eea;
          border-radius: 50%;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
        }

        .notification-message {
          margin: 0 0 8px 0;
          font-size: 14px;
          line-height: 1.5;
          color: #2d3748;
          font-weight: 500;
        }

        .notification-date {
          color: #718096;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .mark-read-btn {
          margin-top: 10px;
          padding: 6px 14px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
        }

        .mark-read-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .mark-read-btn:active {
          transform: translateY(0);
        }

        .empty-state {
          padding: 60px 20px;
          text-align: center;
          color: #a0aec0;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .empty-text {
          font-size: 16px;
          font-weight: 500;
          color: #718096;
        }
      `}</style>

      <div className="notification-container">
        <button 
          className="notification-bell"
          onClick={() => setShowDropdown(!showDropdown)}
          aria-label="Notifications"
        >
          🔔
          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {showDropdown && (
          <div className="notification-dropdown">
            <div className="dropdown-header">
              Notifications
            </div>
            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔕</div>
                  <p className="empty-text">No notifications yet</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div 
                    key={notification._id} 
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  >
                    <p className="notification-message">{notification.message}</p>
                    <small className="notification-date">
                      🕒 {new Date(notification.date).toLocaleString()}
                    </small>
                    {!notification.read && (
                      <button 
                        onClick={() => markAsRead(notification._id)} 
                        className="mark-read-btn"
                      >
                        ✓ Mark as read
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationDropdown;