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
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  let corsOptions;

  if (
    whiteList.indexOf(req.header("Origin")) !== -1 ||
    whiteListIp.indexOf(ip) !== -1
  ) {
    corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
  } else {
    corsOptions = { origin: false }; // disable CORS for this request
  }
  callback(null, corsOptions); // callback expects two parameters: error and options
};

module.exports = corsOptionsDelegate;
