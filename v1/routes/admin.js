const router = require("express").Router();
const validations = require('../validations');
const controllers = require('../controllers');
/*
On-Boarding
*/
router.post("/signup", validations.admin.validateSignup, controllers.admin.signup);
router.post("/login", validations.admin.validateLogin, controllers.admin.login);

router.post("/utm", validations.admin.isAdminValid, validations.admin.validateCreateUrl, controllers.utm.createUrl);
router.get("/utms", validations.admin.isAdminValid, controllers.utm.getUtms);

module.exports = router