const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    subscriberId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    targetId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
});

subscriptionSchema.index({ subscriberId: 1, target: 1 }, { unique: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);