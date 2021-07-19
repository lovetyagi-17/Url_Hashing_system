const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UtmModel = new Schema({
    url: {
        type: String,
        required: true
    },
    shortUrl: {
        type: String,
        required: true
    },
    usedBy: {
        type: mongoose.Types.ObjectId,
        ref: 'users'
    },
    isUsed: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Utm = mongoose.model('utms', UtmModel);
module.exports = Utm;