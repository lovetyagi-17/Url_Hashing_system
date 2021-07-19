const Messages = require('../constants').LANGS
const bcrypt = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')
const fs = require("fs");
const path = require("path");
const Logs = require('../models').logs
const SOCKETS = require('./Sockets').Socket
module.exports = {
    /*
    Response Functions
    */
    response: async (res, status, message, data, lang) => {
        if (status != 200) {
            let log = await Logs.findByIdAndUpdate(res.id, { code: status, message: message, res: JSON.stringify(data), resTime: getMillinseconds(res.time), error: true }, { new: true }).lean().exec()
            SOCKETS.emit('getLog', log)
            return await res.status(status).send({ status: status, message: await Messages[lang][message] });
        }
        let log = await Logs.findByIdAndUpdate(res.id, { code: status, message: message, res: JSON.stringify(data), resTime: getMillinseconds(res.time) }, { new: true }).lean().exec()
        SOCKETS.emit('getLog', log)
        return await res.status(status).send({ status: status, message: await Messages[lang][message], result: data });
    },
    getMillinseconds: (time) => {
        return (Math.abs((new Date().getTime() - time) / 1000)) * 1000;
    },
    /*
    Bcrypt Functions
    */
    hashUsingBcrypt: async (password) => { return bcrypt.hashSync(password, 10); },
    compareUsingBcrypt: async (pass, hash) => { return bcrypt.compareSync(pass, hash) },
    /*
    JWT Functions
    */
    jwtSign: async (payload) => {
        try {
            return jwt.sign(
                { _id: payload._id },
                config.get("JWT_OPTIONS").SECRET_KEY,
                {
                    expiresIn: config.get("JWT_OPTIONS").EXPIRES_IN
                }
            );
        } catch (error) {
            throw error;
        }
    },
    jwtVerify: async (token) => {
        try {
            return jwt.verify(token, config.get("JWT_OPTIONS").SECRET_KEY);
        } catch (error) {
            throw error;
        }
    },
    jwtDecode: (token) => {
        try {
            return jwt.decode(token, { json: true });
        } catch (error) {
            throw error;
        }
    },
    /*
    File Functions
    */
    deleteFiles: async (paths) => {
        await paths.forEach(filePath => fs.unlinkSync(path.resolve(__dirname, '..' + filePath)))
        return
    },
    /*
    Otp
    */
    generateOtp: async () => {
        try {
            var digits = '0123456789';
            let OTP = '';
            for (let i = 0; i < config.get("OTP_OPTIONS.LENGTH"); i++) { OTP += digits[Math.floor(Math.random() * 10)]; }
            return OTP;
        } catch (error) {
            throw error;
        }
    },
    generateUniqueId: async () => {
        try {
            var characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            let ID = '';
            for (let i = 0; i < 12; i++) { ID += characters[Math.floor(Math.random() * 36)]; }
            return ID;
        } catch (error) {
            throw error;
        }
    },
    logger: async (req, res, next) => {
        console.log("API HIT", "\n|\nv\n|\nv");
        const LANGS = await getLanguages()
        if (!LANGS.includes(req.header('Accept-Language'))) { req.lang = 'en' }
        else { req.lang = req.header('Accept-Language') }
        let log = await new Logs({
            host: req.headers.host,
            url: req.url || req.originalUrl,
            userAgent: req.headers["user-agent"],
            method: req.method,
            body: JSON.stringify(req.body),
            query: JSON.stringify(req.query),
            params: JSON.stringify(req.params),
        }).save()
        res.id = log._id
        res.time = new Date().getTime()
        next();
    },
    monitoring: async (req, res, next) => {
        let logs = await Logs.find({}).sort({ createdAt: -1 }).limit(10).lean()
        var occurences = logs.reduce(function (acc, curr) {
            if (typeof acc[curr.url] == 'undefined') {
                acc[curr.url] = 1;
            } else {
                acc[curr.url] += 1;
            }
            return acc;
        }, {});
        res.render('monitoring', { data: logs, occurences: occurences })
    },
}


const getMillinseconds = (time) => {
    return (Math.abs((new Date().getTime() - time) / 1000)) * 1000;
}

/*
Get Languages List
*/
const getLanguages = async () => {
    let fileNames = []
    fs.readdirSync('constants/langs').forEach(file => {
        if (file != 'index.js') { file = file.replace('.js', ''); fileNames.push(file) }
    })
    return fileNames
}