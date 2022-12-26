const tokenService = require('./../Services/tokenService.js')

module.exports = function (req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return res.json({resultCode: 1, message: "User is unauthorized!"});
        } else {
            const accessToken = authorizationHeader.split(' ')[1];
            if (!accessToken) {
                return res.json({resultCode: 1, message: "User is unauthorized!"});
            } else {
                const userData = tokenService.validateAccessToken(accessToken);
                if (!userData) {
                    return res.json({resultCode: 1, message: "User is unauthorized!"});
                } else {
                    req.user = userData;
                    next();
                }
            }
        }
    } catch (e) {
        return {resultCode: 1, message: "User is unauthorized!"};
    }
}