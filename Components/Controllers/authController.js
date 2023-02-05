const {validationResult} = require('express-validator')
const User = require('../Models/User.js');
const userService = require('./../Services/usersService.js');

class authController {
    async getAuthData (req, res) {
        try {
            const user = await User.findById(req.body._id);
            if (user) {
                const {firstName, lastName, email, password} = user;
                return res.status(200).json({id: user._id, statusCode: 0, firstName, lastName, email, password})
            } else {
                return res.status(200).json({statusCode: 1, message: "That user not found!"});
            }
        } catch (e) {
            return res.json(e);
        }
    }

    async registrationUser (req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.json({message: "Error during validation", errors});
            }
            const {firstName, lastName, email, password} = req.body;
            const userData = await userService.registrationUser(firstName, lastName, email, password);
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
            const {mail, password} = req.body;
            const userData = await userService.login(mail, password);
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
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }
}

module.exports = new authController();