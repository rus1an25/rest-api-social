const router = require('express').Router();
const authController = require('../Controllers/authController.js');
const check = require("express-validator").check;
const authMiddleware = require('./../middlewares/auth-middleware.js');

const {body} = require("express-validator");

router.get("/data", authController.getAuthData);

router.post("/register", [
    check('userName', 'Pole cant be is empty').notEmpty(),
    check('password', 'Password dont be less than 4 and more than 12 symbols').isLength({min: 4, max: 12})
], authController.registrUser);

router.post("/registration",
    body('userName').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({min: 4, max: 12}),
    authController.registrationUser);

router.post("/login", authController.login);

router.post("/logout", authController.logout);

router.get("/activation/:url", authController.activation);

router.get("/refresh", authController.refresh);
//Only for tests
router.get("/test/users", authMiddleware, authController.getTestUsers);

module.exports = router;