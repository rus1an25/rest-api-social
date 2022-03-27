const bcrypt = require('bcryptjs');
const {validationResult} = require('express-validator')
const fs = require("fs");
const mkdirp = require('mkdirp');
const User = require('../Models/User.js');
const userService = require('./../Services/usersService.js');

class authController {
    async getAuthData (req, res) {
        try {
            const user = await User.findById(req.body._id);
            if (user) {
                const {userName, email, password} = user;
                return res.status(200).json({id: user._id, statusCode: 0, userName, email, password})
            } else {
                return res.status(200).json({statusCode: 1, message: "That user not found!"});
            }
        } catch (e) {
            return res.json(e);
        }
    }

    // async registrUser (req, res) {
    //     try {
    //         const errors = await validationResult(req);
    //         if (!errors.isEmpty()) {
    //             return res.status(200).json({statusCode: 1, errors});
    //         }
    //         const {userName, email, password} = req.body;
    //         const candidate = await User.findOne({userName})
    //         if (candidate) {
    //             return res.status(200).json({statusCode: 1, message: "User with the same name already exists"});
    //         }
    //         const hashPassword = await bcrypt.hashSync(password, 7);
    //         const user = await new User({userName, email, password: hashPassword});
    //         await user.save();
    //         fs.mkdirSync(`./images/photos/${user._id}/large`, { recursive: true });
    //         fs.mkdirSync(`./images/photos/${user._id}/small`);
    //         return res.status(200).json({id: user._id, statusCode: 0, message: "User is registered successfully!"});
    //     } catch(e) {
    //         return res.json(e);
    //     }
    // }

    // async loginUser (req, res) {
    //     try {
    //         const {userName, password} = req.body;
    //         const user = await User.findOne({userName});
    //         if (!user) {
    //             res.status(200).json({statusCode: 1, message: "That user not found!"});
    //         } else {
    //             const validPassword = bcrypt.compareSync(password, user.password);
    //             !validPassword && res.status(200).json({statusCode: 1, message: "That password is wrong!"});
    //             if (!user.isLogged) {
    //                 await user.updateOne({isLogged: true});
    //                 return res.status(200).json({id: user._id, userName: user.userName, isLogged: user.isLogged, statusCode: 0, message: "User is logged successfully!"})
    //             } else {
    //                 return res.status(200).json({id: user._id, userName: user.userName, isLogged: user.isLogged, statusCode: 1, message: "User already is logged!"})
    //             }
    //         }
    //     } catch (e) {
    //         return res.json(e);
    //     }
    // }

    // async logoutUser (req, res) {
    //     try {
    //         const user = await User.findById(req.body._id);
    //         if (user.isLogged) {
    //             await user.updateOne({isLogged: false});
    //             return res.status(200).json({id: user._id, userName: user.userName, isLogged: user.isLogged, statusCode: 0, message: "User has been logouted successfully!"})
    //         } else {
    //             return res.status(200).json({id: user._id, userName: user.userName, isLogged: user.isLogged, statusCode: 1, message: "User already has been logouted!"})
    //         }
    //     } catch (e) {
    //         return res.json(e);
    //     }
    // }

    //New registration
    //=============================================================================

    async registrationUser (req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.json({message: "Error during validation", errors});
            }
            const {userName, email, password} = req.body;
            const userData = await userService.registrationUser(userName, email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 3 * 60 * 1000, httpOnly: true});
            return res.json(userData);

        } catch (e) {
            next(e);
        }
    }

    async activation (req, res, next) {
        try {
            const activationLink = req.params.url;
            await userService.activationUser(activationLink);
            return res.redirect(process.env.CLIENT_URL);
        } catch (e) {
            next(e);
        }
    }

    async login (req, res) {
        try {
            const {userName, password} = req.body;
            console.log(userName, password);
            const userData = await userService.login(userName, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 3 * 60 * 1000, httpOnly: true});
            return res.json(userData);
        } catch (e) {
            return res.json(e);
        }
    }

    async logout (req, res) {
        try {
            const refreshToken = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token);
        } catch (e) {
            return res.json(e);
        }
    }

    async refresh (req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 3 * 60 * 1000, httpOnly: true});
            console.log(userData)
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new authController();