import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unseenCount, setUnseenCount] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            console.log('Connecting to Socket.io for user:', user._id);
            
            // Connect to Socket.io server
            const newSocket = io('http://localhost:3000', {
                withCredentials: true
            });

            // Authenticate user with socket
            console.log('Authenticating socket for user:', user._id);
            newSocket.emit('authenticate', user._id);

            // Listen for real-time notifications
            newSocket.on('notification', (notification) => {
                console.log('Received real-time notification:', notification);
                setNotifications(prev => [notification, ...prev]);
                setUnseenCount(prev => prev + 1);
                
                //Show browser notification
                if (Notification.permission === 'granted') {
                    new Notification(`New post: ${notification.title}`, {
                        body: `By ${notification.authorName}`,
                        icon: notification.authorProfilePicture || '/favicon.ico'
                    });
                }
            });

            // Handle connection events
            newSocket.on('connect', () => {
                console.log('Connected to Socket.io server with ID:', newSocket.id);
            });

            newSocket.on('disconnect', () => {
                console.log('Disconnected from Socket.io server');
            });

            // Listen for authentication confirmation(useless)
            newSocket.on('authenticated', (data) => {
                console.log('Socket authentication confirmed:', data);
            });

            setSocket(newSocket);

            // Load missed notifications
            loadMissedNotifications();

            // Request notification permission
            if (Notification.permission === 'default') {
                Notification.requestPermission();
            }

            return () => {
                console.log('Cleaning up socket connection');
                newSocket.close();
            };
        }
    }, [user]);

    const loadMissedNotifications = async () => {
        if (!user) return;                                  // Don't fetch if not logged in
        
        try {
            const response = await fetch('/api/notifications/unseen', {
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
                const missedNotifications = await response.json();
                console.log('Loaded missed notifications:', missedNotifications);
                setNotifications(missedNotifications);
                setUnseenCount(missedNotifications.length);
            } else {
                console.log('Notifications API returned non-JSON response');
                setNotifications([]);
                setUnseenCount(0);
            }
        } catch (error) {
            console.log('Could not load notifications (user may not be logged in)');
            setNotifications([]);
            setUnseenCount(0);
        }
    };

    const markNotificationsAsSeen = async () => {
        try {
            await fetch('/api/notifications/mark-seen', {
                method: 'PATCH',
                credentials: 'include'
            });
            setUnseenCount(0);
        } catch (error) {
            console.error('Error marking notifications as seen:', error);
        }
    };

    const value = {
        socket,
        notifications,
        unseenCount,
        markNotificationsAsSeen,
        loadMissedNotifications
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};