const {Schema, model} = require('mongoose');

const UserSchema = new Schema({
    userName: {type: String, unique: true, require: true, min: 3, max: 20},
    password: {type: String, require: true, min: 3, max: 20},
    email: {type: String, unique: true, require: true},
    isActivated: {type: Boolean, default: false},
    activationLink: {type: String, default: ""},
    userStatus: {type: String, max: 50, default: ""},
    aboutMe: {type: String, max: 50, default: ""},
    jobDescription: {type: String, max: 50, default: ""},
    facebook: {type: String, max: 50, default: ""},
    telegram: {type: String, max: 50, default: ""},
    github: {type: String, max: 50, default: ""},
    website: {type: String, max: 50, default: ""},
    city: {type: String, max: 50, default: ""},
    profilePicture: {type: String, default: "http://localhost:5000/default/avatar-user.png"},
    thumbnail: {type: String, default: "http://localhost:5000/default/avatar-user.png"},
    followers: {type: Array, default: []},
    followings: {type: Array, default: []},
    isLogged: {type: Boolean, default: false},
    posts: {type: Array, default: []}
}, {
    timestamps: true
});

module.exports = model("User", UserSchema);