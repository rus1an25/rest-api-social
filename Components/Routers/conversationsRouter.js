const router = require('express').Router();
const conversationsController = require('../Controllers/conversationController');

router.post("/", conversationsController.createConversation);
router.get("/companions/:currentUserID", conversationsController.getCompanions);
router.get("/:companionID/:currentUserID", conversationsController.getConversations);

module.exports = router;