const Post = require('../models/posts');

exports.ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    
    // Check if it's an API request (from React frontend)
    if (req.headers.accept && req.headers.accept.includes('application/json')) {       
        return res.status(401).json({ error: 'Authentication required' });          
    }
    
    // For non-API requests 
    res.redirect('/login');
};

exports.ensurePostOwner = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            if (req.headers.accept && req.headers.accept.includes('application/json')) {    //if there is accept header in the first place
                return res.status(404).json({ error: 'Post not found' });                   // and checks if client want JSON response and 
            }
            return res.status(404).send("No Post found");       //HTML response
        }
        
        if (post.createdBy.equals(req.user._id)) {
            req.post = post;
            return next();
        }
        
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(403).json({ error: 'Unauthorized' });         //forbidden in json
        }
        res.status(403).send('Unauthorized');
    } catch (error) {
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(500).json({ error: 'Server error' });
        }
        res.status(500).send('Server error');
    }
};

exports.ensureAdmin = (req, res, next) => {
    if (req.user.isAdmin) return next();
    
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    res.status(403).send('Unauthorized');
};