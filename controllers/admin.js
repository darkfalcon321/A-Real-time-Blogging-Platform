const Users = require('../models/user');
const Post = require('../models/posts');

exports.getUsers = async (req, res) =>{
    try{
        const users = await Users.find();
        res.render('adminUser', {users:users})
    }   catch (err){
            req.flash('err', 'failed to find users')
            res.redirect('/')
    }
};


exports.getPosts = async (req, res) =>{
    try{
        const posts = await Post.find().populate('createdBy');
        res.render('adminPosts', {posts:posts})
    }   catch (err){
            req.flash('err', 'failed to load posts')
            res.redirect('/')
    }
};


exports.deletePosts = async (req, res) =>{
    try{
        await Post.findByIdAndDelete(req.params.id)
        res.redirect('/admin/posts')
    }   catch (err){
            req.flash('err', 'failed to load posts')
            res.redirect('/admin/posts')
    }
};
