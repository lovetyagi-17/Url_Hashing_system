const axios = require('axios').default;
const universal = require('../../utils');
const { CODES, MESSAGES } = require('../../constants');
const MODELS = require('../../models');

module.exports = {
    adminOrUserValidate: async function (req, res, next) {
        try {
            let isValid = await isAdminValid(req, res, next);
            if (!isValid) {
                isValid = await isUserValid(req, res, next);
            }
            if (isValid) {
                return next();
            }
            return await universal.response(res, CODES.UN_AUTHORIZED, MESSAGES.USER_NOT_AUTHORIZED, {}, req.lang);
        } catch (error) {
            next(error)
        }
    }
}

let isAdminValid = async (req, res, next) => {
    try {
        if (req.user && req.user.guestMode) {
            return true;
        } else if (req.headers.authorization) {
            let response = await axios.get("https://api.blyott.com/allUnassignedTags", {
                headers: {
                    "authority": "api.blyott.com",
                    "accept": "application / json, text/ plain, */*",
                    "token": req.headers.authorization,
                    "origin": "https://portal.blyott.com",
                    "sec-fetch-site": "same-site",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-dest": "empty",
                    "referer": "https://portal.blyott.com/admin-panel/assets/new",
                    "accept-language": "en-US,en;q=0.9"
                }
            })
            if (response.status == 200) return true
            return false;
        }
        else return false;
    } catch (error) {
        return false
    }
};

let isUserValid = async (req, res, next) => {
    try {
        if (req.user && req.user.guestMode) {
            return true;
        } else if (req.headers.authorization) {
            const accessToken = req.headers.authorization;
            const decodeData = await universal.jwtVerify(accessToken);
            if (!decodeData) return false;
            const userData = await MODELS.user.findOne({ _id: decodeData._id, type: 2 }).lean().exec();
            if (userData && userData.authToken != accessToken) {
                return false;
            }
            else if (userData) {
                req.user = userData;
                return true;
            } else return false;
        }
        else return false;
    } catch (error) {
        return false
    }
};