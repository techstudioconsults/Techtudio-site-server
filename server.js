const express = require("express");
const auth = require("./routes/authRouter");

const app = express();
app.use(express.json());
app.use("/api/auth/test", auth);

module.exports = app;
