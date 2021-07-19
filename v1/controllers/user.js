const MODELS = require('../../models')
const { MESSAGES, CODES, USER_TYPES } = require('../../constants')
const universal = require('../../utils')
module.exports = {
    /*
    User On-Boarding
    */
    signup: async (req, res, next) => {
        try {
            let user = await MODELS.user.findOne({ email: req.body.email, isDeleted: false }).select("email").lean().exec()
            if (user) return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.EMAIL_ALREADY_ASSOCIATED_WITH_ANOTHER_ACCOUNT, {}, req.lang);
            req.body.password = await universal.hashUsingBcrypt(req.body.password)
            req.body.type = USER_TYPES.user // APP USER
            user = await new MODELS.user(req.body).save();
            user = await MODELS.user.findById(user._id).lean().exec()
            return await universal.response(res, CODES.OK, MESSAGES.USER_SIGNUP_SUCCESSFULLY, {}, req.lang);
        } catch (error) {
            next(error);
        }
    },
    login: async (req, res, next) => {
        try {
            let user = {}
            if (req.body.email) {
                user = await MODELS.user.findOne({ email: req.body.email, type: USER_TYPES.user, isDeleted: false }).lean().exec()
            }
            else {
                return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.USER_NOT_EXIST, {}, req.lang);
            }
            if (!user) return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.USER_NOT_EXIST, {}, req.lang);
            let isMatched = await universal.compareUsingBcrypt(req.body.password, user.password)
            if (!isMatched) return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.INVALID_LOGIN_CREDENTIALS, {}, req.lang);
            let token = await universal.jwtSign({ _id: user._id })
            await MODELS.user.findByIdAndUpdate(user._id, { authToken: token })
            return await universal.response(res, CODES.OK, MESSAGES.USER_LOGGEDIN_SUCCESSFULLY, { authToken: token }, req.lang);
        } catch (error) {
            next(error);
        }
    }
}

