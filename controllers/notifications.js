const Notification = require('../models/notifications');
const Subscription = require('../models/subscriptions');

exports.getNotifications = async (req, res) => {
    try {
        const recipientId = req.user._id;
        
        const notifications = await Notification.find({ recipientId }).populate('postId', 'title')
            .populate({
                path: 'postId',
                populate: {path: 'createdBy', select: 'username displayName profilePicture'}
            })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

exports.getUnseenNotifications = async (req, res) => {
    try {
        const recipientId = req.user._id;
        
        const notifications = await Notification.find({ recipientId, seen: false }).populate('postId', 'title')
            .populate({
                path: 'postId',
                populate: {path: 'createdBy', select: 'username displayName profilePicture'}
            })
            .sort({ createdAt: -1 });

        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch unseen notifications' });
    }
};

exports.markNotificationsAsSeen = async (req, res) => {
    try {
        const recipientId = req.user._id;
        
        await Notification.updateMany(
            { recipientId, seen: false },
            { seen: true }
        );

        res.json({ message: 'Notifications marked as seen' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to mark notifications as seen' });
    }
};

exports.getUnseenCount = async (req, res) => {
    try {
        const recipientId = req.user._id;
        
        const count = await Notification.countDocuments({ 
            recipientId, 
            seen: false 
        });

        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get unseen count' });
    }
};

exports.createNotificationsForPost = async (postId, authorId) => {
    try {
        console.log(`Creating notifications for post ${postId} by author ${authorId}`);
        
        const subscriptions = await Subscription.find({ targetId: authorId });
        console.log(`Found ${subscriptions.length} subscriptions for author ${authorId}:`, subscriptions);
        
        const notifications = subscriptions.map(subscription => ({
            recipientId: subscription.subscriberId,
            postId: postId,
            authorId: authorId, 
            seen: false,
            createdAt: new Date()
        }));

        console.log('Notifications to create:', notifications);

        if (notifications.length > 0) {
            const createdNotifications = await Notification.insertMany(notifications);
            console.log(`Successfully created ${createdNotifications.length} notifications`);
            return createdNotifications;
        } else {
            console.log('No notifications to create - no subscribers found');
            return [];
        }
    } catch (err) {
        console.error('Error creating notifications:', err);
        return [];
    }
};