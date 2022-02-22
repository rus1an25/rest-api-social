const User = require('../Models/User.js');
const mailService = require('./mailService.js');
const tokenService = require('./tokenService.js');
const UserDTO = require('./../dtos/user_dto.js');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const ApiError = require('./../exceptions/api-error.js');

class usersService {
    async getUsers (currentUserID, sortParam) {
        if (sortParam === 'all') {
            const allUsers = await User.find();
            const users = allUsers.filter(user => user._id.toString() !== currentUserID)
                .map(user => ({
                    id: user._id,
                    userName: user.userName,
                    userStatus: user.userStatus,
                    thumbnail: user.thumbnail,
                    isLogged: user.isLogged
                }));
            return users;
        } else if (sortParam === 'followings') {
            const currentUser = await User.findById(currentUserID);
            const currentUserFollowings = await Promise.all(currentUser.followings.map(friendId => User.findById(friendId)));
            const followings = currentUserFollowings.map(following => ({
                id: following._id,
                userName: following.userName,
                userStatus: following.userStatus,
                thumbnail: following.thumbnail,
                isLogged: following.isLogged
            }));
            return followings;
        }  else if (sortParam === 'followers') {
            const users = await User.find({followings: currentUserID});
            const followers = users.map(follower => ({
                id: follower._id,
                userName: follower.userName,
                userStatus: follower.userStatus,
                thumbnail: follower.thumbnail,
                isLogged: follower.isLogged
            }))
            return followers;
        }
    }

    async getUser (userId) {
        const user = await User.findById(userId);
        const {password, createdAt, updatedAt, ...other} = user._doc;
        const {_id, userName, profilePicture, thumbnail, aboutMe, jobDescription, facebook, telegram, github, website, city} = other;
        const info = {id: _id, userName, aboutMe, jobDescription}
        const contacts = {facebook, telegram, github, website, city};
        const photos = {profilePicture, thumbnail};
        return {info, contacts, photos};
    }

    async registrationUser (userName, email, password) {
        const candidateByName = await User.findOne({userName});
        const candidateByMail = await User.findOne({email});
        if (candidateByName || candidateByMail) {
            // throw ApiError.BadRequest(`User with the same ${email} is exists!`)
            return {resultCode: 1, message: `User with the same Name or Email is exists!`};
        }
        const hashedPassword = await bcrypt.hash(password, 7);
        const activationLink = uuid.v4();
        const user = await User.create({userName, email, password: hashedPassword, activationLink});
        fs.mkdirSync(`./images/photos/${user._id}/large`, { recursive: true });
        fs.mkdirSync(`./images/photos/${user._id}/small`);
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/auth/activation/${activationLink}`);
        const userDTO = new UserDTO(user);
        const tokens = await tokenService.generateTokens({...userDTO});
        await tokenService.saveRefreshToken(userDTO.id, tokens.refreshToken);
        return {resultCode: 0, ...tokens, user: userDTO};
    }

    async activationUser (activationLink) {
        const user = await User.findOne({activationLink});
        if (!user) {
            // throw new ApiError.BadRequest('Incorrect link activation');
            return {codeResult: 1, message: 'Incorrect link activation'};
        }
        user.isActivated = true;
        await user.save();
    }

    async login (userName, password) {
        const user = await User.findOne({userName});
        if (!user) {
            // throw new ApiError.BadRequest('Incorrect link activation');
            return {resultCode: 1, message: 'User not found!'};
        } else if (!user.isActivated) {
            return {resultCode: 1, message: 'Account is not activated!'};
        } else {
            const isPassEquals = await bcrypt.compare(password, user.password);
            if (!isPassEquals) {
                return {resultCode: 1, message: 'Password incorrect!'};
            } else {
                const userDTO = new UserDTO(user);
                const tokens = await tokenService.generateTokens({...userDTO});
                await tokenService.saveRefreshToken(userDTO.id, tokens.refreshToken);
                return {resultCode: 0, ...tokens, user: userDTO};
            }
        }
    }

    async logout (refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh (refreshToken) {
        if (!refreshToken) {
            return {resultCode: 1, message: 'User is unauthorized'};
        } else {
            const userData = await tokenService.validateRefreshToken(refreshToken);
            const tokenFromDB = await tokenService.findToken(refreshToken);
            if (!userData || !tokenFromDB) {
                return {resultCode: 1, message: 'User is unauthorized'};
            } else {
                if (userData.id !== null || userData.id !== '' || userData.id !== undefined) {
                    const user = await User.findById(userData.id)
                    const userDTO = new UserDTO(user);
                    const tokens = await tokenService.generateTokens({...userDTO});
                    await tokenService.saveRefreshToken(userDTO.id, tokens.refreshToken);
                    return {resultCode: 0, ...tokens, user: userDTO};
                } else {
                    return {resultCode: 1, message: 'User is not find!'};
                }
            }
        }
    }

}

module.exports = new usersService();