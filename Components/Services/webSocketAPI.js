const Conversation = require('../Models/Conversation.js');
const Message = require('../Models/Message.js');
const User = require('../Models/User.js');

class WebSocketAPI {
    async getCompanions (currentUserId) {
        try {
            const conversations = await Conversation.find({
                members: {$in: [currentUserId]}
            });
            const companionsId = conversations.map(c => {
                return {
                    companionId: c.members.filter(id => id !== currentUserId),
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
            return JSON.stringify(users);
        } catch (e) {
            return JSON.stringify(e);
        }
    };

    async getConversation (currentUserID, companionID) {
        try {
            const conversation = await Conversation.findOne({
                members: {$all: [currentUserID, companionID]}
            })
            return JSON.stringify(conversation._id);
        } catch (e) {
            return JSON.stringify(e);
        }
    };

    async getMessage (conversationId) {
        try {
            const messages = await Message.find({ conversationId: conversationId });
            return JSON.stringify(messages);
        } catch (e) {
            return JSON.stringify(e);
        }
    };

    async createMessage (conversationId, senderId, text) {
        const newMessage = new Message({
            conversationId: conversationId,
            senderId: senderId,
            text: text
        });
        try {
            const savedMessage = await newMessage.save();
            return JSON.stringify(savedMessage);
        } catch (e) {
            return JSON.stringify(e);
        }
    }
}

module.exports = WebSocketAPI;