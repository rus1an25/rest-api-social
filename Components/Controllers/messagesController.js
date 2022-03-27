const Message = require('../Models/Message.js');

class messageController {
    async createMessage (mesObj) {
        const newMessage = new Message(mesObj);
        try {
            const savedMessage = await newMessage.save();
            return savedMessage;
        } catch (e) {
            return e;
        }
    }

    async getMessages (conversationId) {
        try {
            const messages = await Message.find({ conversationId });
            return messages;
        } catch (e) {
            return e;
        }
    }
}

module.exports = new messageController();