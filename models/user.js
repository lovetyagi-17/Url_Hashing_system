const { ENUMS } = require('../constants');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserModel = new Schema({
    email: {
        type: String,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        trim: true,
        default: ''
    },
    type: {
        type: Number,
        enum: ENUMS.USER_TYPES
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    authToken: {
        type: String,
        default: ''
    }
}, { timestamps: true });
UserModel.index({ email: 1 });
const User = mongoose.model('users', UserModel);
module.exports = User;