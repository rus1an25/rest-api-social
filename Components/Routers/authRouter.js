const router = require('express').Router();
const authController = require('../Controllers/authController.js');

const {body} = require("express-validator");

router.get("/data", authController.getAuthData);

router.post("/registration",
    body('firstName').notEmpty(),
    body('lastName').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({min: 4, max: 12}),
    authController.registrationUser);

router.post("/login", authController.login);

router.post("/logout", authController.logout);

router.get("/activation/:url", authController.activation);

router.get("/refresh", authController.refresh);

module.exports = router;