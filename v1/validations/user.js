const { ENUMS, REGEX, CODES, MESSAGES } = require('../../constants')
const joi = require("joi");
const universal = require('../../utils')
const MODELS = require('../../models')
const validateSchema = async (req, res, next, schema = false, querySchema = false) => {
    try {
        if (schema) {
            let { error, value } = await schema.validate(req.body);
            if (error) throw error.details ? error.details[0].message.replace(/['"]+/g, '') : "";
            else next()
        }
        else if (querySchema) {
            let { error, value } = await querySchema.validate(req.query);
            if (error) throw error.details ? error.details[0].message.replace(/['"]+/g, '') : "";
            else next()
        }
        else next()
    } catch (error) {
        next(error)
    }
};
module.exports = {
    validateSignup: async (req, res, next) => {
        let schema = joi.object().keys({
            email: joi.string().regex(REGEX.EMAIL).trim().lowercase().required().description('Email of User'),
            password: joi
                .string()
                .required()
                .description('Password of User Account')
        });
        if (req == "swagger") {
            let example = {
                email: "gs593513@gmail.com",
                password: "234567890"
            }
            let summary = "API to add User Account"
            let description = "API to add User Account"
            let swagger = {
                example: example,
                schema: schema,
                querySchema: typeof querySchema !== 'undefined' ? querySchema : false,
                summary: summary,
                description: description
            }
            return swagger
        }
        await validateSchema(req, res, next, schema)
    },
    validateLogin: async (req, res, next) => {
        let schema = joi.object().keys({
            email: joi.string().regex(REGEX.EMAIL).trim().lowercase().optional().description('Email of User'),
            password: joi
                .string()
                .required()
                .description('Password of User Account')
        });
        if (req == "swagger") {
            let example = {
                email: "gs593513@gmail.com",
                password: "234567890"
            }
            let summary = "API to Login"
            let description = "API to Login"
            let swagger = {
                example: example,
                schema: schema,
                querySchema: typeof querySchema !== 'undefined' ? querySchema : false,
                summary: summary,
                description: description
            }
            return swagger
        }
        await validateSchema(req, res, next, schema)
    },
    isUserValid: async (req, res, next) => {
        try {
            if (req.user && req.user.guestMode) {
                next();
            } else if (req.headers.authorization) {
                const accessToken = req.headers.authorization;
                const decodeData = await universal.jwtVerify(accessToken);
                if (!decodeData) return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.USER_NOT_EXIST, {}, req.lang);
                const userData = await MODELS.user.findOne({ _id: decodeData._id, type: 2 }).lean().exec();
                if (userData && userData.authToken != accessToken) {
                    return await universal.response(res, CODES.UN_AUTHORIZED, MESSAGES.INVALID_AUTH_TOKEN, {}, req.lang);
                }
                else if (userData) {
                    req.user = userData;
                    next();
                } else return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.USER_NOT_EXIST, {}, req.lang);
            }
            else return await universal.response(res, CODES.UN_AUTHORIZED, MESSAGES.USER_NOT_AUTHORIZED, {}, req.lang);
        } catch (error) {
            next(error)
        }
    }
}