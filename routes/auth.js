const express = require('express');
const passport = require('passport');
const router = express.Router();
const { validateRegister, validateLogin } = require('../controllers/validators');

//Local LOGIN & REGISTER
router.post('/api/login', validateLogin, (req, res, next) => {
    passport.authenticate('local-login', (err, user, info) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        if (!user) return res.status(401).json({ error: info.message });
        
        req.logIn(user, (err) => {
            if (err) return res.status(500).json({ error: 'Login failed' });
            res.json({ user: { _id: user._id, username: user.username, displayName: user.displayName, email: user.email, profilePicture: user.profilePicture } });
        });
    })(req, res, next);
});

router.post('/api/register', validateRegister, (req, res, next) => {
    passport.authenticate('local-register', (err, user, info) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        if (!user) return res.status(400).json({ error: info.message });
        
        req.logIn(user, (err) => {
            if (err) return res.status(500).json({ error: 'Registration failed' });
            res.json({ user: { _id: user._id, username: user.username, displayName: user.displayName, email: user.email, profilePicture: user.profilePicture } });
        });
    })(req, res, next);
});


//Google LOGIN & REGISTER
router.get('/auth/google',
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        prompt: 'select_account'
    })   
);

router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: 'http://localhost:3001/login' }),
    (req, res) => {
        res.redirect(process.env.CLIENT_URL || 'http://localhost:3001')
    }
);

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ error: 'Logout failed' });
        }
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destroy error:', err);
                return res.status(500).json({ error: 'Session destroy failed' });
            }
            res.clearCookie('connect.sid');
            res.json({ message: 'Logged out successfully' });
        });
    });
});

module.exports = router;