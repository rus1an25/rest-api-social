const router = require('express').Router();
const messageController = require('../Controllers/messagesController.js');
const Message = require('../Models/Message.js');

router.post("/", messageController.createMessage);
router.get("/:conversationId", messageController.getMessage);

module.exports = router;