const socketIo = require('socket.io');
const Subscription = require('../models/subscriptions');

const initializeSocket = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:3001",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    
    const connectedUsers = new Map();                   // Store connected users

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id); 
        socket.on('authenticate', (userId) => {             // Handle user authentication and store their socket
            if (userId) {
                connectedUsers.set(userId, socket.id);
                socket.userId = userId;
                console.log(`User ${userId} authenticated with socket ${socket.id}`);
                
                // Send confirmation back to client
                socket.emit('authenticated', { userId, socketId: socket.id });
            }
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            if (socket.userId) {
                connectedUsers.delete(socket.userId);
                console.log(`User ${socket.userId} disconnected`);
            }
        });
    });

    
    io.sendNotificationToSubscribers = async (authorId, notificationData) => {      // Add a method to send notifications to specific users
        try {
            console.log(`Sending notifications for author ${authorId}`);
            
            // Find all subscribers of the author
            const subscriptions = await Subscription.find({ targetId: authorId });
            console.log(`Found ${subscriptions.length} subscribers`);
            
            // Send notification to each online subscriber
            subscriptions.forEach(subscription => {
                const subscriberSocketId = connectedUsers.get(subscription.subscriberId.toString());
                if (subscriberSocketId) {
                    console.log(`Sending notification to subscriber ${subscription.subscriberId}`);
                    io.to(subscriberSocketId).emit('notification', notificationData);
                } else {
                    console.log(`Subscriber ${subscription.subscriberId} is offline`);
                }
            });
        } catch (err) {
            console.error('Error sending real-time notifications:', err);
        }
    };

    return io;
};

module.exports = initializeSocket;