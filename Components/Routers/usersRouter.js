const router = require('express').Router();
const usersController = require('../Controllers/usersController.js');
const authMiddleware = require('./../middlewares/auth-middleware.js');

router.get('/', usersController.getAllUsers);
router.get(['/:sortParam/:currentUserID/page=:pageNumber&count=:count', '/page=:pageNumber'], usersController.getUsersByPortion);
router.get('/:userId', usersController.getUser);
router.delete('/:userId', usersController.deleteUser);
router.put('/:userId/follow', usersController.followUser);
router.put('/:userId/unfollow', usersController.unfollowUser);
router.get('/:userId/followings', usersController.getFollowList);

module.exports = router;