const {Schema, model} = require('mongoose');

const UserSchema = new Schema({
    firstName: {type: String, unique: false, require: true, min: 3, max: 20},
    lastName: {type: String, unique: false, require: true, min: 3, max: 20},
    password: {type: String, require: true, min: 3, max: 20},
    email: {type: String, unique: true, require: true},
    isActivated: {type: Boolean, default: false},
    activationLink: {type: String, default: ""},
    education: {type: Object, max: 50, default: {}},
    aboutMe: {type: String, max: 50, default: ""},
    jobDescription: {type: String, max: 50, default: ""},
    phoneNumber: {type: String, max: 50, default: ""},
    techSkills: {type: Array, default: []},
    softSkills: {type: Array, default: []},
    projects: {type: Array, default: []},
    experience: {type: Array, default: []},
    profilePicture: {type: String, default: `${process.env.API_URL}/default/avatar-user.png`},
    thumbnail: {type: String, default: `${process.env.API_URL}/default/avatar-user.png`},
    followers: {type: Array, default: []},
    followings: {type: Array, default: []},
    isLogged: {type: Boolean, default: false},
    posts: {type: Array, default: []},
    lastSeen: {type: String, default: ''}
}, {
    timestamps: true
});

module.exports = model("User", UserSchema);