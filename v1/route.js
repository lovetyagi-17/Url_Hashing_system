const router = require('express').Router();
const Routes = require('./routes/');
router.use('/utm', Routes.utm)
router.use('/admin', Routes.admin)
router.use('/user', Routes.user)
module.exports = router;