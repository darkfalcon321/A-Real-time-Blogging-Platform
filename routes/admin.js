const express = require('express');
const {getUsers, getPosts, deletePosts} = require('../controllers/admin');
const {ensureAuthenticated, ensureAdmin} = require('../controllers/middleware');
const router = express.Router();



router.get('/', ensureAuthenticated, ensureAdmin, getUsers);
router.get('/posts', ensureAuthenticated, ensureAdmin, getPosts);
router.post('/posts/:id/delete', ensureAuthenticated, ensureAdmin, deletePosts);


module.exports = router;
