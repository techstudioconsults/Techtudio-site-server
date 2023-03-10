require("dotenv").config();
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const compression = require("compression");
const mongoose = require("mongoose");

//import routes
const auth = require("./routes/auth.router");
const mailing = require('./routes/mailing.router');

const app = express();


app.use(express.json());

app.use(bodyParser.json());

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use(compression());

//static assests
app.use("/", express.static(path.join(__dirname, "/public")));

app.get('/', (req, res) => {
  res.send('Hello, World!');
});
app.use("/api/auth", auth);
app.use('/api/mailing', mailing);


module.exports = app;
