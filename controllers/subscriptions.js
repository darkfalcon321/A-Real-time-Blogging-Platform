const Subscription = require('../models/subscriptions');
const User = require('../models/user');

exports.subscribe = async (req, res) => {
    try {
        const { targetId } = req.body;
        const subscriberId = req.user._id;

        if (subscriberId.toString() === targetId) {     //prevent self-subscription
            return res.status(400).json({ error: 'Cannot subscribe to yourself' });            
        }

        const existingSubscription = await Subscription.findOne({
            subscriberId,
            targetId
        });
    
        if (existingSubscription)   {
            return res.status(400).json({ error: 'Already subscribed to this user'});
        }
        const subscription = new Subscription({
            subscriberId,
            targetId
        });

        await subscription.save();
        res.status(201).json({ message: 'Successfully subscribed' });
        
    } catch (err) {
        res.status(500).json({ error: 'Failed to subscribe' });
    }
};


exports.unsubscribe = async (req, res) => {
    try {
        const { targetId } = req.body;
        const subscriberId = req.user._id;

        await Subscription.findOneAndDelete({
            subscriberId,
            targetId
        });

        res.json({ message: 'Successfully unsubscribed' });
        
    } catch (err) {
        res.status(500).json({ error: 'Failed to unsubscribe' });
    }
};


exports.getSubscriptions = async (req, res) => {
    try {
        const subscriberId = req.user._id;
        const subscriptions = await Subscription.find({ subscriberId })
            .populate('targetId', 'username displayName profilePicture'); 

        res.json(subscriptions);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
};


exports.getSubscribers = async (req, res) => {
    try {
        const subscriberId = req.user._id;
        const subscriptions = await Subscription.find({ targetId })
            .populate('subscriberId', 'username displayName profilePicture'); 

        res.json(subscriptions);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch subscribers' });
    }
};

exports.checkSubscription = async (req, res) => {
    try {
        const { targetId } = req.params;
        const subscriberId = req.user._id
        
        const subscription = await Subscription.findOne({ 
            subscriberId,
            targetId
        });

        
        res.json({ isSubscribed: !!subscription });
    } catch (err) {
        res.status(500).json({ error: 'Failed to check subscription status' });
    }
};