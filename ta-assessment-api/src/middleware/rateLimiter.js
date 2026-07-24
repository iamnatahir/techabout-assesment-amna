const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    max: 5,

    message: {

        success:false,

        message:"Too many login attempts"

    }

});

const submissionLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    max: 10,

    message:{

        success:false,

        message:"Too many submissions"

    }

});

module.exports = {

    loginLimiter,

    submissionLimiter

};