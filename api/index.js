const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const app = express();
const port = 3000;
const cors = require("cors");
app.use(cors());

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());
const jwt = require("jsonwebtoken")

mongoose.connect("mongodb+srv://ifenowoifesegun:ifenowoifesegun@cluster0.ywxmand.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("connected to MongoDb");
}).catch((err) => {
    console.log("Error connecting to MongoDb");
})

app.listen(port, () => {
    console.log("server is running on port 3000");
})

const User = require("./models/user")
const passwordost = require("./models/post")

// endpoint to register a user in the backend
app.post("/register", async(req, res) => {
    try{

        const {name, email, password} = req.body
 
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: "Email already registered" })
        }

    }catch(error){
        console.log("error registering user", error);
        res.status(500).json({message: "error registering user"});
    }
})
