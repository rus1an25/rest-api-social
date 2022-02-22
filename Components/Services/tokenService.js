const jwt = require('jsonwebtoken');
const Token = require('./../Models/Token.js');

class TokenService {
    async generateTokens (payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET_KEY, {expiresIn: '24h'});
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET_KEY, {expiresIn: '30d'});
        return {accessToken, refreshToken};
    }

    async saveRefreshToken (userId, token) {
        const tokenData = await Token.findOne({user: userId});
        if (tokenData) {
            tokenData.refreshToken = token;
            return tokenData.save();
        } else {
            const newToken = await Token.create({user: userId, refreshToken: token});
            return newToken;
        }
    }

    async removeToken (refreshToken) {
        const tokenData = await Token.deleteOne({refreshToken: refreshToken.refreshToken});
        return tokenData;
    }

    validateAccessToken (token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY);
            return userData;
        } catch (e) {
            return null;
        }
    }

    validateRefreshToken (token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET_KEY);
            return userData;
        } catch (e) {
            return null;
        }
    }

    async findToken (refreshToken) {
        const token = await Token.findOne({refreshToken});
        return token;
    }
}

module.exports = new TokenService();