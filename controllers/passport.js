const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

passport.use('local-register', new LocalStrategy(
    async (username, password, done) => {
    try{
        const user = await User.findOne({username});
        if (user) return done(null, false, {message: 'Username already taken'});
        const newUser = new User({username, password});
        await newUser.save();
        return done(null, newUser);
    } catch (err) {
        return done(err);
    }
}));

passport.use('local-login', new LocalStrategy(
    async (username, password, done) => {
    try{
        const user = await User.findOne({username});
        if (!user) return done(null, false, {message: 'User not found'});
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return done(null, false, {message: 'Wrong Username or Password'});
        return done (null, user);
    } catch (err) {
        return done(err);
    }
}));


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, 
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ googleId: profile.id });                 //check if user Google ID exists
            if (user) {
                return done(null, user);
            }

            user = await User.findOne({ email: profile.emails[0].value });          //check if user email exists
            if (user) {
                user.googleId = profile.id
                user.displayName = profile.displayName;
                user.profilePicture = profile.photos[0].value;
                await user.save();
                return done(null, user);
            }

            user = new User({                                                         //create new user since user email nor google id exists
                googleId: profile.id,
                username: profile.emails[0].value,
                email: profile.emails[0].value,
                displayName: profile.displayName,
                profilePicture: profile.photos[0].value
            });

            await user.save();
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

passport.serializeUser((user, done) =>{         //stores user obj in session when logged in 
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {      //attaches user requests to req obj so that other middleware can access it
    try{
        const user = await User.findById(id);
        done (null, user);
    } catch (err) {
        return done(err);
    }
});