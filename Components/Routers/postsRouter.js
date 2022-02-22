const router = require('express').Router();
const postsController = require('../Controllers/postsController.js');

router.post("/:userId", postsController.createPost);
router.get("/owner/:userId", postsController.getOwnerPosts);
router.get("/", postsController.getAllPosts);
router.put("/:postId", postsController.updatePost);
router.delete("/:postId", postsController.deletePost);
router.get("/:postId", postsController.getPost);
router.put("/:postId/like", postsController.likePost);
router.get("/timeline/all/:userID", postsController.timeLine);

module.exports = router;