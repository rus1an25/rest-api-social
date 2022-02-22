const router = require('express').Router();
const profileController = require('../Controllers/profileController.js');
const authMiddleware = require('./../middlewares/auth-middleware.js');

router.get('/logo', profileController.setLogo);
router.put('/status/:currentUserID', profileController.setUserStatus);
router.get('/status/:currentUserID', profileController.getUserStatus);
router.put('/avatar/:userId', profileController.updateUserAvatar);

module.exports = router;