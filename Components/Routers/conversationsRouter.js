const router = require('express').Router();
const conversationsController = require('../Controllers/conversationController');

router.post("/", conversationsController.createConversation);
router.get("/companions/:currentUserID", conversationsController.getCompanions);

module.exports = router;