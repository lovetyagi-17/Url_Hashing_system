const router = require("express").Router();
const validations = require('../validations');
const controllers = require('../controllers');
/*
On-Boarding
*/
router.post("/signup", validations.user.validateSignup, controllers.user.signup);
router.post("/login", validations.user.validateLogin, controllers.user.login);
router.get("/utm", controllers.utm.getUrl);
router.post("/utm/redirect", controllers.utm.redirectUrl);
module.exports = router