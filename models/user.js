const bcrypt = require('bcrypt');
const mongoose = require('mongoose');


const saltRounds = 10;

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(saltRounds);
    console.log(salt);
    return await bcrypt.hash(password, salt);
}


const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String},   
    email: {type: String},
    googleId: {type: String},
    displayName: {type: String},
    profilePicture: {type: String},
    isAdmin: {type: Boolean, default: false},
    createdAt: {type: Date, default: Date.now}
})


userSchema.pre('save', async function(next){
    if (this.isModified('password') && this.password){
        this.password = await hashPassword(this.password);
    }
    next();
});


userSchema.methods.comparePassword = async function(password) {
    if (!this.password) return false;                                        //for Google OAuth users 
    return await bcrypt.compare(password, this.password);
  };


module.exports = mongoose.model('User', userSchema, 'users');     