//import dependencies here
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

//import custom middlewares

//import custom routes

//Define middlewares
const app = express();
const PORT = process.env.PORT || 5077;

//use middlewares
app.use(
    cors({
      origin: "*"
    })
  );
  app.use(express.json());
  app.use(bodyParser.json());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  
  app.get("/api", (req, res) => {
    res.send("Welcome to Techstudio server");
  });

//use custom middlewares


//connect to server