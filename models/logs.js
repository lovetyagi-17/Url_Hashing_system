const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const LogModel = new Schema({
    host: {
        type: String
    },
    url: {
        type: String
    },
    userAgent: {
        type: String
    },
    method: {
        type: String
    },
    body: {
        type: String
    },
    query: {
        type: String
    },
    params: {
        type: String
    },
    res: {
        type: String,
        default: ''
    },
    code: {
        type: Number,
        default: 200
    },
    message: {
        type: String,
        default: ''
    },
    error: {
        type: Boolean,
        default: false
    },
    resTime: {
        type: Number,
        default: 0
    }
}, { timestamps: true });
const Logs = mongoose.model('Logs', LogModel);
module.exports = Logs;