const Message = require('../Models/Message.js');

class messageController {
    async createMessage (req, res) {
        const newMessage = new Message(req.body);
        try {
            const savedMessage = await newMessage.save();
            return res.status(200).json(savedMessage);
        } catch (e) {
            return res.json(e);
        }
    }

    async getMessage (req, res) {
        try {
            const messages = await Message.find({
                conversationId: req.params.conversationId
            })
            return res.status(200).json(messages);
        } catch (e) {
            return res.json(e);
        }
    }
}

module.exports = new messageController();