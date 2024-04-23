const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require('dotenv').config()

const app = express();
const port = 3000;
const cors = require("cors");
app.use(cors());

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());
const jwt = require("jsonwebtoken");

mongoose.connect(process.env.API_MONGO , {
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
const Post = require("./models/post")

// endpoint to register a user in the backend
app.post("/register", async(req, res) => {
    try{
        const {name, email, password} = req.body
 
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: "Email already registered" })
        }
        //create a new user
        const newUser = new User({ name, email, password });

        //generate and store the verification token
        newUser.verificationToken = crypto.randomBytes(20).toString("hex");

        //save the  user to the database
        await newUser.save();

        //send the verification email to the user
        sendVerificationEmail(newUser.email, newUser.verificationToken);

        res.status(200).json({ message: "Registration successful" });

    }catch(error){
        console.log("error registering user", error);
        res.status(500).json({message: "error registering user"});
    }
})


const sendVerificationEmail = async(email, verificationToken) => {
    // create a nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "ifenowoifesegun@gmail.com",
            pass: process.env.APP_PASSWORD
        }
    })

    // compose the email message 
    const mailOptions= {
        from: "Threads App",
        to: email,
        subject: "Email Verification",
        text: `Please click the following link to verify your email address http://localhost:3000/verify/${verificationToken}`
    }

    try{
        await transporter.sendMail(mailOptions)
    }catch(err){
        console.log("error sending email", err);
    }
}

app.get("/verify/:token", async(req, res) => {
    try{
        const token = req.params.token;

        const user = await User.findOne({verificationToken: token});
        if(!user){
            return res.status(404).json({message: "Invalid token"})
        }

        user.verified = true;
        user.verificationToken =
        await user.save();

        res.status(200).json({message: "Email verified successfully"})  

    }catch(err){
        console.log("error getting token", err);
        res.status(500).json({message: "Email Verification Failed"})
    }
})

const generateSecretKey = () => {
    const secretKey = crypto.randomBytes(32).toString("hex")
    return secretKey
}

const secretKey = generateSecretKey();



app.post("/login", async(req, res) => {
    try{

        const {email, password} = req.body

        const user = await User.findOne({email})
        if(!user){
            return res.status(404).json({message: "Invalid email"})
        }

        if(user.password !== password){
            return res.status(404).json({message: "Invalid Password"})
        }

        const token = jwt.sign({userId:user._id}. secretKey);

        res.status(200).json({token})

    }catch(err){
        res.status(500).json({message: "Login failed"})
    }
})