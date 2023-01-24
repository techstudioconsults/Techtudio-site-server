const whiteList = require('./whiteList');

const corsOptions = {
    origin: (origin, callback) => {
        if (process.env.NODE_ENV === 'production') {
            if (whiteList.indexOf(origin) !== -1) {
                callback(null, true)
            } else {
                callback(new Error('Not allowed by CORS'));
            }
          } else {
            if (whiteList.indexOf(origin) !== -1 || !origin) { 
                callback(null, true)
            } else {
                callback(new Error('Not allowed by CORS'));
            }
          }
    },
    optionsSuccessStatus: 200
}

module.exports = corsOptions;