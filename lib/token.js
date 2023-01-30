const jwt = require('jsonwebtoken')

function createToken (id) {
    const accessToken = jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: "5h"
    });
    return accessToken;
};

module.exports = {createToken};