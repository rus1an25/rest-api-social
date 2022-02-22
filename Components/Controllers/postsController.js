const usersService = require('../Services/usersService.js');
const Post = require('../Models/Post.js');
const User = require('../Models/User.js');

class postsController {
    async createPost(req, res) {
        const {postText} = req.body;
        try {
            const user = await User.findById(req.params.userId);
            const newPost = new Post({
                userId: req.params.userId,
                author: user.userName,
                postText,
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
                date: new Date().toLocaleDateString()
            });
            await newPost.save();
            await user.updateOne({$push: {posts: newPost._id}});

            res.status(200).json({statusCode: 0, post: {id: newPost._id, author: newPost.author, postText: newPost.postText, date: newPost.date, time: newPost.time}, message: "Post has been created successfully!"});
        } catch (e) {
            return res.json(e);
        }
    }

    async getPost(req, res) {
        try {
            const post = await Post.findById(req.params.postId);
            res.status(200).json(post);
        } catch (e) {
            return res.json(e);
        }
    }

    async getOwnerPosts(req, res) {
        try {
            const currentUser = await User.findById(req.params.userId);
            const userPosts = await Promise.all(currentUser.posts.map(postId => Post.findById(postId)));
            const post = userPosts.map(p => ({
                _id: p._id,
                author: p.author,
                postText: p.postText,
                date: p.date,
                time: p.time
            }));
            res.status(200).json(post);
        } catch (e) {
            return res.json(e);
        }
    }

    async getAllPosts(req, res) {
        try {
            const post = await Post.find();
            res.status(200).json(post);
        } catch (e) {
            return res.json(e);
        }
    }

    async updatePost(req, res) {
        try {
            const post = await Post.findById(req.params.postId);
            if (req.body._id === post.userId) {
                await post.updateOne({$set: req.body});
                res.status(200).json({statusCode: 0, message: "Your post has been updated successfully!"});
            } else {
                res.status(200).json({statusCode: 1, message: "You can update only your post!"});
            }
        } catch (e) {
            return res.json(e);
        }
    }

    async deletePost(req, res) {
        try {
            const post = await Post.findById(req.params.postId);
            if (req.body.userId === post.userId) {
                await post.deleteOne();
                res.status(200).json({statusCode: 0, message: "Your post has been deleted successfully!"});
            } else {
                res.status(200).json({statusCode: 1, message: "You can delete only your post!"});
            }
        } catch (e) {
            return res.json(e);
        }
    }

    async likePost(req, res) {
        try {
            const post = await Post.findById(req.params.postId);
            if (!post.likes.includes(req.body._id)) {
                await post.updateOne({$push: {likes: req.body._id}});
                res.status(200).json({statusCode: 0, message: "Post has been liked!"});
            } else {
                await post.updateOne({$pull: {likes: req.body._id}});
                res.status(200).json({statusCode: 1, message: "Post has been disliked!"});
            }
        } catch (e) {
            return res.json(e);
        }
    }

    async timeLine(req, res) {
        try {
            const currentUser = await User.findById(req.params.userID);
            const userPosts = await Post.find({userId: currentUser._id});
            const friendPosts = await Promise.all(currentUser.followings.map(friendId => {
                return Post.find({userId: friendId})
            }));
            res.status(200).json(userPosts.concat(...friendPosts));
        } catch (e) {
            return res.json(e);
        }
    }
}

module.exports = new postsController();