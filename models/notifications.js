const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    postId: {type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true},
    authorId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    seen: {type: Boolean, default: false},
    createdAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Notification', notificationSchema);