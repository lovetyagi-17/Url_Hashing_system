const MODELS = require('../../models')
const { MESSAGES, CODES, USER_TYPES } = require('../../constants')
const universal = require('../../utils')
const path = require('path')
module.exports = {
    createUrl: async (req, res, next) => {
        try {
            req.body.shortUrl = await universal.hashUsingBcrypt(req.body.url)
            await MODELS.Utm(req.body).save();
            return await universal.response(res, CODES.OK, MESSAGES.URL_HASHED_SUCCESSFULLY, { shortUrl: req.body.shortUrl }, req.lang);
        } catch (error) {
            next(error);
        }
    },
    getUrl: async (req, res, next) => {
        try {
            let data = await MODELS.Utm.findOne({ shortUrl: req.query.code, isUsed: false }).lean()
            if (data) {
                let link = `/api/v1/user/utm/redirect`
                let forgotPasswordPage = path.resolve(__dirname, '../../views/getLink.ejs');
                res.render(forgotPasswordPage, { data: { checkLink: link, code: req.query.code } })
            }
            return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.INVALID_CODE, {}, req.lang);
        } catch (error) {
            next(error);
        }
    },
    redirectUrl: async (req, res, next) => {
        try {
            let user = {}
            if (req.body.email) {
                user = await MODELS.user.findOne({ email: req.body.email, type: USER_TYPES.user, isDeleted: false }).lean().exec()
            }
            else {
                return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.USER_NOT_EXIST, {}, req.lang);
            }
            if (!user) return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.USER_NOT_EXIST, {}, req.lang);
            let isMatched = await universal.compareUsingBcrypt(req.body.password, user.password);
            if (!isMatched) return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.INVALID_LOGIN_CREDENTIALS, {}, req.lang);
            let data = await MODELS.Utm.findOneAndUpdate({ shortUrl: req.body.code, isUsed: false }, { usedBy: user._id, isUsed: true }).lean();
            if (data) {
                return res.redirect(data.url)
            }
            return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.INVALID_CODE, {}, req.lang);
        } catch (error) {
            next(error);
        }
    },
    getUtms: async (req, res, next) => {
        try {
            let data = await MODELS.Utm.aggregate([
                {
                    $lookup: { from: "users", localField: "usedBy", foreignField: "_id", as: "usedBy" }
                },
                {
                    $unwind: {
                        path: "$usedBy",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        url: 1,
                        shortUrl: 1,
                        isUsed: 1,
                        _id: 1,
                        usedBy: {
                            email: 1
                        }
                    }
                }
            ]).exec()
            return await universal.response(res, CODES.OK, MESSAGES.URLS_FETCHED_SUCCESSFULLY, { data }, req.lang);
        } catch (error) {
            next(error);
        }
    },
}

