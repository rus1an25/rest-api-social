const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    conversationId: {
        type: String,
        default: ''
    },
    senderId: {
        type: String,
        default: ''
    },
    companionId: {
        type: String,
        default: ''
    },
    text: {
        type: String,
        default: ''
    },
    time: {
        type: String,
        default: ''
    },
    date: {
        type: String,
        default: ''
    }
}, {timestamps: true});

module.exports = mongoose.model("Message", MessageSchema);