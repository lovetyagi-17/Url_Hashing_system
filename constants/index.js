module.exports = {
    CODES: require('./codes'),
    MESSAGES: require('./messages'),
    LANGS: require('./langs'),
    USER_TYPES: {
        'admin': 0,
        'user': 1
    },
    REGEX: {
        EMAIL: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        PHONE: /^[0-9]+$/,
        MOBILE: /^\+\d{1,3}\d{9,11}$/,
        COUNTRY_CODE: /^[0-9,+]+$/,
        PASSWORD: /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[a-zA-Z!#$%&? " + "])[a - zA - Z0 - 9!#$ %&?]{ 8, 20 } $ /
    },
    ENUMS: {
        USER_TYPES: [0, 1]
    }
}