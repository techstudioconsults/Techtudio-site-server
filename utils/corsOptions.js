const { whiteList, whiteListIp } = require("./whiteList");

const inProduction = process.env.NOD_ENV === "production";

// const corsOptions = {
//   origin: (origin, callback) => {
//     if (whiteList.indexOf(origin) !== -1 || (!inProduction && !origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   optionsSuccessStatus: 200,
// };

const corsOptionsDelegate = function (req, callback) {
  const corsOptions = {
    methods: ["GET", "PUT", "POST", "DELETE", "HEAD", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  };

  const myIpAddress = req.connection.remoteAddress; // This is where you get the IP address from the request
  if (whiteListIp.indexOf(myIpAddress) !== -1 ||whiteList.indexOf(req.header('Origin'))) {
    corsOptions.origin = true;
  } else {
    corsOptions.origin = false;
  }
  callback(null, corsOptions);
};

module.exports = corsOptionsDelegate;
