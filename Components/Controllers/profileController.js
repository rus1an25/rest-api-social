const User = require('./../Models/User.js');
const fileService = require('../Services/fileService.js');

class profileController {
    async setLogo (req, res) {
        try {
            return res.json({statusCode: 0, logo: `${process.env.API_URL}/default/logo-social.svg`});
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
    async updateUserPhone (req, res) {
        const currentUser = await User.findById(req.body._id);
        if (!currentUser) {
            res.status(200).json({statusCode: 1, message: "That user is not found!"});
        } else {
            try {
                await currentUser.updateOne({phoneNumber: req.body.phoneNumber});
                const user = await User.findById(req.body._id);
                const phoneNumber = user.phoneNumber;
                return res.json({statusCode: 0, userPhone: phoneNumber});
            } catch (e) {
                return res.json(e);
            }
        }
    }

    async updateUserTechSkills (req, res) {
        const currentUser = await User.findById(req.body._id);
        if (!currentUser) {
            res.status(200).json({statusCode: 1, message: "That user is not found!"});
        } else {
            try {
                await currentUser.updateOne({techSkills: req.body.skills});
                const user = await User.findById(req.body._id);
                const techSkills = user.techSkills;
                return res.json({statusCode: 0, techSkills});
            } catch (e) {
                return res.json(e);
            }
        }
    }

    async updateUserSoftSkills (req, res) {
        const currentUser = await User.findById(req.body._id);
        if (!currentUser) {
            res.status(200).json({statusCode: 1, message: "That user is not found!"});
        } else {
            try {
                await currentUser.updateOne({softSkills: req.body.skills});
                const user = await User.findById(req.body._id);
                const softSkills = user.softSkills;
                return res.json({statusCode: 0, softSkills});
            } catch (e) {
                return res.json(e);
            }
        }
    }

    async updateJobDescription (req, res) {
        const currentUser = await User.findById(req.body._id);
        if (!currentUser) {
            res.status(200).json({statusCode: 1, message: "That user is not found!"});
        } else {
            try {
                await currentUser.updateOne({jobDescription: req.body.jobDescription});
                const user = await User.findById(req.body._id);
                const jobDescription = user.jobDescription;
                return res.json({statusCode: 0, jobDescription});
            } catch (e) {
                return res.json(e);
            }
        }
    }

    async updateAboutMe (req, res) {
        const currentUser = await User.findById(req.body._id);
        if (!currentUser) {
            res.status(200).json({statusCode: 1, message: "That user is not found!"});
        } else {
            try {
                await currentUser.updateOne({aboutMe: req.body.aboutMe});
                const user = await User.findById(req.body._id);
                const aboutMe = user.aboutMe;
                return res.json({statusCode: 0, aboutMe});
            } catch (e) {
                return res.json(e);
            }
        }
    }

    async updateProjects (req, res) {
        const currentUser = await User.findById(req.body._id);
        if (!currentUser) {
            res.status(200).json({statusCode: 1, message: "That user is not found!"});
        } else {
            try {
                await currentUser.updateOne({projects: req.body.projects});
                const user = await User.findById(req.body._id);
                const projects = user.projects;
                return res.json({statusCode: 0, projects});
            } catch (e) {
                return res.json(e);
            }
        }
    }

    async updateExperience (req, res) {
        const currentUser = await User.findById(req.body._id);
        if (!currentUser) {
            res.status(200).json({statusCode: 1, message: "That user is not found!"});
        } else {
            try {
                await currentUser.updateOne({experience: req.body.experience});
                const user = await User.findById(req.body._id);
                const experience = user.experience;
                return res.json({statusCode: 0, experience});
            } catch (e) {
                return res.json(e);
            }
        }
    }

    async updateEducation (req, res) {
        const currentUser = await User.findById(req.body._id);
        if (!currentUser) {
            res.status(200).json({statusCode: 1, message: "That user is not found!"});
        } else {
            try {
                await currentUser.updateOne({education: req.body.education});
                const user = await User.findById(req.body._id);
                const education = user.education;
                return res.json({statusCode: 0, education});
            } catch (e) {
                return res.json(e);
            }
        }
    }

    async updateLastSeen (userId) {
       try {
           const date = Date.now();
           const currentUser = User.findById(userId)
           await currentUser.updateOne({lastSeen: date});
       } catch(e) {
           return e;
       }
    }
}

module.exports = new profileController();