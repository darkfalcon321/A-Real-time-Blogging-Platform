const express = require('express');
const router = express.Router();
const { ensureAuthenticated, ensurePostOwner } = require('../controllers/middleware');
const { validatePostAPI, validateSubscription } = require('../controllers/validators');
const subscriptionController = require('../controllers/subscriptions');
const notificationController = require('../controllers/notifications');
const postController = require('../controllers/posts');
const User = require('../models/user');


router.post('/subscriptions', ensureAuthenticated, validateSubscription, subscriptionController.subscribe);
router.delete('/subscriptions', ensureAuthenticated, validateSubscription, subscriptionController.unsubscribe);
router.get('/subscriptions', ensureAuthenticated, subscriptionController.getSubscriptions);
router.get('/subscribers', ensureAuthenticated, subscriptionController.getSubscribers);
router.get('/subscriptions/check/:targetId', ensureAuthenticated, subscriptionController.checkSubscription);


router.get('/notifications', ensureAuthenticated, notificationController.getNotifications);
router.get('/notifications/unseen', ensureAuthenticated, notificationController.getUnseenNotifications);
router.patch('/notifications/mark-seen', ensureAuthenticated, notificationController.markNotificationsAsSeen);
router.get('/notifications/count', ensureAuthenticated, notificationController.getUnseenCount);


router.get('/posts', postController.getPosts);
router.get('/posts/:id', postController.getPost);
router.post('/posts', ensureAuthenticated, validatePostAPI, postController.createPost);
router.put('/posts/:id', ensureAuthenticated, ensurePostOwner, validatePostAPI, postController.updatePost);
router.delete('/posts/:id', ensureAuthenticated, ensurePostOwner, postController.deletePost);



router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}, 'username displayName profilePicture');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id, 'username displayName profilePicture');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

router.get('/users/:id/posts', async (req, res) => {
    try {
        const Post = require('../models/posts');
        const posts = await Post.find({ createdBy: req.params.id })
            .populate('createdBy', 'username displayName profilePicture')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user posts' });
    }
});

router.get('/me', ensureAuthenticated, (req, res) => {
    res.json({
        _id: req.user._id,
        username: req.user.username,
        displayName: req.user.displayName,
        email: req.user.email,
        profilePicture: req.user.profilePicture,
        isAdmin: req.user.isAdmin
    });
});

module.exports = router;