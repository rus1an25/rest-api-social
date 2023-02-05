const Post = require('../Models/Post.js');
const User = require('../Models/User.js');

class postsController {
    async createPost(req, res) {
        const {postText} = req.body;
        try {
            const user = await User.findById(req.params.userId);
            const newPost = new Post({
                userId: req.params.userId,
                author: `${user.firstName} ${user.lastName}`,
                postText,
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
                date: new Date().toLocaleDateString()
            });
            await newPost.save();
            await user.updateOne({$push: {posts: newPost._id.toString()}});

            res.status(200).json({statusCode: 0,
                post: {
                    id: newPost._id,
                    author: newPost.userId,
                    authorName: newPost.author,
                    postText: newPost.postText,
                    date: newPost.date,
                    time: newPost.time
                },
                message: "Post has been created successfully!"
            });
        } catch (e) {
            return res.json(e);
        }
    }

    async getPostsBySorting (req, res) {
        try {
            const portion = (posts, currentPostPage, countPosts) => {
                if (posts.length > countPosts) {
                    const array = [];
                    let j = 0;
                    let rightBorder = (currentPostPage * countPosts) - 1;
                    if (rightBorder >= posts.length) {rightBorder = posts.length-1}
                    const leftBorder = ((currentPostPage * countPosts) - countPosts);
                    for (let i=leftBorder; i <= rightBorder; i++) {
                        array[j] = posts[i];
                        j++;
                    }
                    return array;
                } else {
                    return posts;
                }
            };

            if (req.params.filter === 'ALL_POSTS') {
                const posts = await Post.find();
                const allPosts = posts.reverse().map(post => ({
                    id: post._id,
                    author: post.userId,
                    authorName: post.author,
                    postText: post.postText,
                    date: post.date,
                    time: post.time
                }));
                res.status(200).json({statusCode: 0, posts: portion(allPosts, req.params.currentPostPage, req.params.countPosts), countPages: Math.ceil(allPosts.length / req.params.countPosts)});
            }
            else if (req.params.filter === 'FOLLOWINGS_POSTS') {
                const currentUser = await User.findById(req.params.userId);
                if (currentUser.followings.length !== 0) {
                    const posts = await Promise.all(currentUser.followings.map(friendId => {
                        const post = Post.find({userId: friendId});
                        return post;
                    }));
                    const friendPosts = posts.flat().reverse().map(post => ({
                        id: post._id,
                        author: post.userId,
                        authorName: post.author,
                        postText: post.postText,
                        date: post.date,
                        time: post.time
                    }));
                    res.status(200).json({statusCode: 0, posts: portion(friendPosts, req.params.currentPostPage, req.params.countPosts), countPages: Math.ceil(friendPosts.length / req.params.countPosts)});
                } else {
                    res.status(200).json({statusCode: 0, posts: [], countPages: 0});
                }
            } else if (req.params.filter === 'OWNER_POSTS') {
                const currentUser = await User.findById(req.params.userId);
                const posts = await Promise.all(currentUser.posts.map(postId => {
                    return (
                        Post.findById(postId)
                    )
                }));
                const ownerPosts = posts.reverse().map(post => {
                    return (
                        {
                            id: post._id,
                            author: post.userId,
                            authorName: post.author,
                            postText: post.postText,
                            date: post.date,
                            time: post.time
                        }
                    )
                })
                res.status(200).json({statusCode: 0, posts: portion(ownerPosts, req.params.currentPostPage, req.params.countPosts), countPages: Math.ceil(ownerPosts.length / req.params.countPosts)});
            }
            else {
                res.status(200).json({statusCode: 0, posts: [], countPages: 0});
            }
        } catch(e) {
            return res.json({statusCode: 1, errors: e});
        }
    }

    async getAllPosts(req, res) {
        try {
            const posts = await Post.find();
            const allPosts = posts.map(post => ({
                id: post._id,
                author: post.userId,
                authorName: post.author,
                postText: post.postText,
                date: post.date,
                time: post.time
            }));
            res.status(200).json({statusCode: 0, posts: allPosts});
        } catch (e) {
            return res.json({statusCode: 1, errors: e});
        }
    }

    async followerPosts(req, res) {
        try {
            const currentUser = await User.findById(req.params.userId);
            if (currentUser.followings.length !== 0) {
                const posts = await Promise.all(currentUser.followings.map(friendId => {
                    const post = Post.find({userId: friendId});
                    return post;
                }));
                const friendPosts = posts.flat().map(post => ({
                    id: post._id,
                    author: post.userId,
                    authorName: post.author,
                    postText: post.postText,
                    date: post.date,
                    time: post.time
                }));
                res.status(200).json({statusCode: 0, posts: friendPosts});
            } else {
                res.status(200).json({statusCode: 0, posts: []});
            }
        } catch (e) {
            return res.json({statusCode: 1, errors: e});
        }
    }

    async getOwnerPosts(req, res) {
        try {
            const currentUser = await User.findById(req.params.userId);
            const posts = await Promise.all(currentUser.posts.map(postId => {
                return (
                    Post.findById(postId)
                )
            }));
            const ownerPosts = posts.map(post => {
                return (
                    {
                        id: post._id,
                        author: post.userId,
                        authorName: post.author,
                        postText: post.postText,
                        date: post.date,
                        time: post.time
                    }
                )
            })
            res.status(200).json({statusCode: 0, posts: ownerPosts});
        } catch (e) {
            return res.json({statusCode: 1, errors: e});
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

    // async deletePost(req, res) {
    //     try {
    //         const post = await Post.findById(req.params.postId);
    //         const currentUser = await User.findById(req.body.userId);
    //         let posts = [];
    //         if (req.body.userId === post.userId) {
    //             await post.deleteOne();
    //             if (req.body.filter === 'all') {
    //                 posts = await Post.find();
    //                 const allPosts = posts.map(p => ({
    //                     id: p._id,
    //                     author: p.userId,
    //                     postText: p.postText,
    //                     date: p.date,
    //                     time: p.time
    //                 }));
    //                 res.status(200).json(allPosts);
    //             } else if (req.body.filter === 'followings') {
    //                 if (currentUser.followings.length !== 0) {
    //                     posts = await Promise.all(currentUser.followings.map(friendId => Post.find({userId: friendId})));
    //                     const friendPosts = posts[0].map(p => ({
    //                         id: p._id,
    //                         author: p.userId,
    //                         postText: p.postText,
    //                         date: p.date,
    //                         time: p.time
    //                     }));
    //                     res.status(200).json(friendPosts);
    //             } else if (req.body.filter === 'owner') {
    //                     posts = await Promise.all(currentUser.posts.map(postId => {
    //                         return (
    //                             Post.findById(postId)
    //                         )
    //                     }));
    //                     const ownerPosts = posts.map(post => {
    //                         return (
    //                             {
    //                                 id: post._id,
    //                                 author: post.userId,
    //                                 postText: post.postText,
    //                                 date: post.date,
    //                                 time: post.time
    //                             }
    //                         )
    //                     })
    //                     res.status(200).json(ownerPosts);
    //             } else {
    //                     res.status(200).json({statusCode: 0, posts: []});
    //                 }}
    //         } else {
    //             res.status(200).json({statusCode: 1, message: "You can delete only your post!"});
    //         }
    //     } catch (e) {
    //         return res.json(e);
    //     }
    // }

    async deletePost(req, res) {
        try {
            const post = await Post.findById(req.params.postId);
            const currentUser = await User.findById(req.body.userId);
            if (req.body.userId === post.userId) {
                await currentUser.updateOne({$pull: {posts: req.params.postId}});
                await post.deleteOne();
                res.status(200).json({statusCode: 0, message: "You successfully deleted your post!"});
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
}

module.exports = new postsController();