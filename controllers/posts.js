const Post = require('../models/posts');
const { createNotificationsForPost } = require('./notifications');

exports.createPost = async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        
        const userId = req.user._id
        console.log('Creating post for user:', userId, req.user.username);
        
        const post = new Post({
            title,
            content,        
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            createdBy: userId
        });
        
        await post.save();
        
        // Populate the post with author info for notifications
        const populatedPost = await Post.findById(post._id).populate('createdBy', 'username displayName profilePicture');
        
        // Create database notifications for ALL subscribers (online + offline)
        await createNotificationsForPost(post._id, req.user._id);
        
        // Emit real-time notification via Socket.io to ONLINE subscribers only
        const io = req.app.get('io');
        if (io && io.sendNotificationToSubscribers) {
            const notificationData = {
                type: 'new_post',
                postId: post._id.toString(),
                title: post.title,
                authorId: req.user._id,
                authorName: req.user.displayName || req.user.username,
                authorProfilePicture: req.user.profilePicture,
                createdAt: post.createdAt
            };
            
            console.log('Sending real-time notifications for new post:', notificationData);
            await io.sendNotificationToSubscribers(req.user._id, notificationData);
        }
        
        console.log('Sending JSON response for created post');
        res.status(201).json(populatedPost);
        
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({ error: 'Post not created due to error' });
    }
};

exports.getPosts = async (req, res) => {
    try {
        const search = req.query.search || '';
        let query = {};
        if (search) {
            query = {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { tags: { $regex: search, $options: 'i' } }
                ]
            };
        }
        
        const posts = await Post.find(query)
            .populate('createdBy', 'username displayName profilePicture')
            .sort({ createdAt: -1 });
        
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: 'Failed to load posts' });
    }
};

exports.getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('createdBy', 'username displayName profilePicture');
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: 'Failed to load post' });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const title = req.body.title;
        const content = req.body.content;
        let tags = req.body.tags;
        if (tags) {
            tags = tags.split(',').map(tag => tag.trim());
        } else {
            tags = [];
        }
        
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, {
            title,
            content,
            tags
        }, { new: true }).populate('createdBy', 'username displayName profilePicture');
        
        res.json(updatedPost);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update post' });
    }
};

exports.deletePost = async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete post' });
    }
};