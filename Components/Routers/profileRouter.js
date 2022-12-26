const router = require('express').Router();
const profileController = require('../Controllers/profileController.js');
const authMiddleware = require('./../middlewares/auth-middleware.js');

router.get('/logo', profileController.setLogo);
router.put('/status/:currentUserID', profileController.setUserStatus);
router.get('/status/:currentUserID', profileController.getUserStatus);
router.put('/avatar/:userId', profileController.updateUserAvatar);
router.post('/user-phone', profileController.updateUserPhone);
router.post('/user-tech-skills', profileController.updateUserTechSkills);
router.post('/user-soft-skills', profileController.updateUserSoftSkills);
router.post('/user-jobDescription', profileController.updateJobDescription);
router.post('/aboutMe', profileController.updateAboutMe);
router.post('/projects', profileController.updateProjects);
router.post('/experience', profileController.updateExperience);
router.post('/education', profileController.updateEducation);

module.exports = router;