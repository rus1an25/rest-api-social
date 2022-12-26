const usersService = require('../Services/usersService.js');
const User = require('./../Models/User.js');
const fs = require("fs");

class usersController {
    async getAllUsers (req, res) {
        try {
            const users = await usersService.getUsers();
            res.status(200).json(users);
        } catch (e) {
            return res.json(e);
        }
    }

    async getUsersByPortion (req, res) {
        try {
            const users = await usersService.getUsers(req.params.currentUserID, req.params.sortParam);
            if (users.length !== 0) {
                const currentUserFollowings = await User.findById(req.params.currentUserID);
                let page = req.params.pageNumber;
                let count = req.params.count;
                if (typeof page === 'undefined' || req.params.sortParam !== 'all') page = 1;
                if (typeof count === 'undefined') count = 4;
                let leftBorder = 0;
                let j = 0;
                let newArr = [];
                let totalCount = users.length;

                if (page > Math.ceil(totalCount / count)) {
                    res.status(200).json(newArr);
                } else {
                    if (page <= 0) page = 1;
                    if (count > totalCount) count = totalCount;
                    let rightBorder = page * count;
                    if ((rightBorder - totalCount) > 0) {
                        rightBorder = totalCount;
                        leftBorder = (page - 1) * count;
                    } else {
                        leftBorder = rightBorder - count;
                    }
                    for (let i = leftBorder; i < rightBorder; i++) {
                        newArr[j] = users[i];
                        j++;
                    }
                    res.status(200).json({users: newArr, currentFollowings: currentUserFollowings.followings, totalCount: users.length});
                }
            } else {
                res.status(200).json({users: null, currentFollowings: null, totalCount: 0});
            }
        } catch (e) {
            return res.json(e);
        }
    }

    async getUser (req, res) {
        try {
            const user = await usersService.getUser(req.params.userId);
            if (user) {
                res.status(200).json({statusCode: 0, user});
            } else {
                res.status(200).json({statusCode: 1, message: "That user is not found!"});
            }
        } catch (e) {
            return res.json(e);
        }
    }

    async deleteUser (req, res) {
        const currentUser = await User.findById(req.params.userId);
        if (!currentUser) {
            res.status(200).json({statusCode: 1, message: "That user is not found!"});
        } else if (req.body._id === req.params.userId && currentUser) {
            try {
                await User.findByIdAndDelete(req.params.userId);
                fs.rmdirSync(`./images/photos/${req.params.userId}`, { recursive: true });
                res.status(200).json({statusCode: 0, message: "Profile has been deleted successfully!"});
            } catch (e) {
                return res.json(e);
            }
        } else {
            res.status(200).json({statusCode: 1, message: "You can delete only your account!"});
        }
    }

    async followUser (req, res) {
        if (req.body._id !== req.params.userId) {
            try {
                const user = await User.findById(req.params.userId);
                const currentUser = await User.findById(req.body._id);
                if (!user.followers.includes(req.body._id)) {
                    await user.updateOne({$push: {followers: req.body._id} });
                    await currentUser.updateOne({$push: {followings: req.params.userId} });
                    res.status(200).json({statusCode: 0, message: "User has been followed successfully!"});
                } else {
                    res.status(200).json({statusCode: 1, message: "You already followed this user!"});
                }
            } catch (e) {
                return res.json(e);
            }
        } else {
            res.status(200).json({statusCode: 1, message: "You don't follow yourself!"});
        }
    }

    async unfollowUser (req, res) {
        if (req.body._id !== req.params.userId) {
            try {
                const user = await User.findById(req.params.userId);
                const currentUser = await User.findById(req.body._id);
                if (user.followers.includes(req.body._id)) {
                    await user.updateOne({$pull: {followers: req.body._id} });
                    await currentUser.updateOne({$pull: {followings: req.params.userId} });
                    res.status(200).json({statusCode: 0, message: "User has been unfollowed successfully!"});
                } else {
                    res.status(200).json({statusCode: 1, message: "You unfollow this user already!"});
                }
            } catch (e) {
                return res.json(e);
            }
        } else {
            res.status(200).json({statusCode: 1, message: "You don't unfollow yourself!"});
        }
    }

    async getFollowList (req, res) {
        try {
            const currentUser = await usersService.getUser(req.params.userId);
            const userFollowings = await Promise.all(currentUser.followings.map(friendId => User.findById(friendId)));
            res.status(200).json({statusCode: 0, userFollowings});
        } catch (e) {
            return res.json(e);
        }
    };
}

module.exports = new usersController();