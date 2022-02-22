const Conversation = require('../Models/Conversation.js');
const User = require('../Models/User.js');

class conversationController {
    async createConversation (req, res) {
        try {
            const conversations = await Conversation.findOne({
                members: {$all: [req.body.senderId, req.body.receiverId]}
            });
            if (conversations === null) {
                const newConversation = new Conversation({
                    members: [req.body.senderId, req.body.receiverId]
                });
                const savedConversation = await newConversation.save();
                return res.status(200).json(savedConversation);
            } else {
                return res.status(200).json(conversations);
            }
        } catch (e) {
            return res.json(e);
        }
    }

    async getCompanions (req, res) {
        try {
            const conversations = await Conversation.find({
                members: {$in: [req.params.currentUserID]}
            })
            const companionsId = conversations.map(c => {
                return {
                    companionId: c.members.filter(id => id !== req.params.currentUserID),
                    conversationId: c._id
                }
            });
            const companions = await Promise.all(companionsId.map(id => {
                return User.findById(...id.companionId);
            }));
            let users = companions.map(companion => ({
                id: companion.id,
                userName: companion.userName,
                thumbnail: companion.thumbnail
            }));
            return res.status(200).json(users);
        } catch (e) {
            return res.json(e);
        }
    }

    async getConversations (req, res) {
        try {
            const conversations = await Conversation.findOne({
                members: {$all: [req.params.companionID, req.params.currentUserID]}
            })
            return res.status(200).json(conversations._id);
        } catch (e) {
            return res.json(e);
        }
    }
}

module.exports = new conversationController();