const Joi = require('joi');

const registerSchema = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().min(6).required()
});

const loginSchema = Joi.object().keys({
    username: Joi.string().required(),
    password: Joi.string().required()
});

const postSchema = Joi.object().keys({
    title: Joi.string().required(),
    content: Joi.string().required(),
    tags: Joi.string().allow('').optional()
});

const subscriptionSchema = Joi.object().keys({
    targetId: Joi.string().required()
});

exports.validateRegister = (req, res, next) => {
    const result = registerSchema.validate(req.body);       //either value/error
    if (result.error){
        req.flash('error', result.error.details[0].message);
        return res.redirect('/register');
    }
    next();
}

exports.validateLogin = (req, res, next) => {
    const result = loginSchema.validate(req.body);
    if (result.error){
        req.flash('error', result.error.details[0].message);
        return res.redirect('/login');
    }
    next();
}

exports.validatePost = (req, res, next) => {
    const result = postSchema.validate(req.body);
    if (result.error){
        req.flash('error', result.error.details[0].message);
        return res.redirect(req.path === '/' ? '/posts/new':`${req.path}/edit`);        //req.path = current path
    }
    next();
}

exports.validatePostAPI = (req, res, next) => {
    const result = postSchema.validate(req.body);
    if (result.error){
        return res.status(400).json({ error: result.error.details[0].message});
    }
    next();
}

exports.validateSubscription = (req, res, next) => {
    const result = subscriptionSchema.validate(req.body);
    if (result.error){
        return res.status(400).json({ error: result.error.details[0].message});        
    }
    next();
}


