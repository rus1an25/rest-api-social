const router = require('express').Router();
const postsController = require('../Controllers/postsController.js');

router.post("/:userId", postsController.createPost);
router.get("/posts-by-sorting/:userId/:filter/currentPage/:currentPostPage&countPosts/:countPosts", postsController.getPostsBySorting);
router.get("/", postsController.getAllPosts);
router.get("/owner/:userId", postsController.getOwnerPosts);
router.get("/follower-posts/:userId", postsController.followerPosts);
router.put("/:postId", postsController.updatePost);
router.post("/delete-post/:postId", postsController.deletePost);
router.put("/:postId/like", postsController.likePost);

module.exports = router;