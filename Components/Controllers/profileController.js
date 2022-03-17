const User = require('./../Models/User.js');
const fileService = require('../Services/fileService.js');
const fs = require("fs");
const bcrypt = require('bcryptjs');

class profileController {
    async setLogo (req, res) {
        try {
            return res.json({statusCode: 0, logo: `${process.env.API_URL}/default/logo-social.png`});
        } catch (e) {
            return res.json(e);
        }
    }

    async setUserStatus (req, res) {
        try {
            const user = await User.findById(req.params.currentUserID);
            await user.updateOne({userStatus: req.body.statusText});
            return res.json({statusCode: 0, message: "Your status has been updated successfully!"});
        } catch (e) {
            return res.json(e);
        }
    }

    async getUserStatus (req, res) {
        try {
            const user = await User.findById(req.params.currentUserID);
            return res.json(user.userStatus);
        } catch (e) {
            return res.json(e);
        }
    }

    async updateUserAvatar (req, res) {
        const currentUser = await User.findById(req.params.userId);
        if (!currentUser) {
            res.status(200).json({statusCode: 1, message: "That user is not found!"});
        } else if (req.body._id === req.params.userId && currentUser) {
            try {
                if (req.files !== null) {
                    const fileName = await fileService.saveFile(req.files.profilePicture, req.params.userId);
                    await User.findByIdAndUpdate(req.params.userId, {
                        $set:req.body,
                        profilePicture: `${process.env.API_URL}/photos/${req.params.userId}/large/${fileName}`,
                        thumbnail: `${process.env.API_URL}/photos/${req.params.userId}/small/small_${fileName}`
                    });
                    const user = await User.findById(req.params.userId);
                    const profilePicture = user.profilePicture;
                    const thumbnail = user.thumbnail;
                    res.status(200).json({statusCode: 0, photos: {profilePicture, thumbnail}});
                }
            } catch (e) {
                return res.json(e);
            }
        } else {
            res.status(200).json({statusCode: 1, message: "You can update only your avatar!"});
        }
    }

    //Заготовка для обонвления профиля
    // async updateUserData (req, res) {
    //     const currentUser = await User.findById(req.params.userId);
    //     if (!currentUser) {
    //         res.status(200).json({statusCode: 1, message: "That user is not found!"});
    //     } else if (req.body._id === req.params.userId && currentUser) {
    //         if (req.body.password) {
    //             try {
    //                 const salt = await bcrypt.genSalt(10);
    //                 req.body.password = await bcrypt.hash(req.body.password, salt);
    //             } catch (e) {
    //                 return res.json(e);
    //             }
    //         }
    //         try {
    //             await User.findByIdAndUpdate(req.params.userId, {$set:req.body});
    //             res.status(200).json({statusCode: 0, message: "Profile data has been updated successfully!"});
    //         } catch (e) {
    //             return res.json(e);
    //         }
    //     } else {
    //         res.status(200).json({statusCode: 1, message: "You can update only your profile data!"});
    //     }
    // }
}

module.exports = new profileController();