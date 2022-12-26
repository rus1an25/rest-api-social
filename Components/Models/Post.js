const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    userId: {
        type: String,
        require: true,
        default: null
    },
    author: {
        type: String,
        default: ''
    },
    postText: {
        type: String,
        require: true,
        default: ""
    },
    time: {
        type: String,
        require: true,
        default: ""
    },
    date: {
        type: String,
        require: true,
        default: ""
    },
    likes: {
        type: Array,
        default: []
    }
}, {timestamps: true});

module.exports = mongoose.model("Post", PostSchema);