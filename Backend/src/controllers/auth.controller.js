const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");


// REGISTER USER
async function registerUserController(req, res) {

    try {

        const { username, email, password } = req.body;


        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please provide username, email, and password"
            });
        }


        const isUserAlreadyExists = await userModel.findOne({
            $or: [
                { username },
                { email }
            ]
        });


        if (isUserAlreadyExists) {
            return res.status(400).json({
                message: "Account already exists with this username or email"
            });
        }


        const hash = await bcrypt.hash(password, 10);


        const user = await userModel.create({
            username,
            email,
            password: hash
        });


        const token = jwt.sign(
            {
                id: user._id,
                username: user.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );


        res.cookie("token", token);


        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });


    } catch(err) {

        res.status(500).json({
            message: err.message
        });

    }

}





// LOGIN USER
async function loginUserController(req, res) {

    try {

        const { email, password } = req.body;


        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            });
        }


        const user = await userModel.findOne({
            email
        });


        if (!user) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }


        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );


        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }



        const token = jwt.sign(
            {
                id: user._id,
                username: user.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );


        res.cookie("token", token);


        res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            },
            token
        });



    } catch(err) {

        res.status(500).json({
            message: err.message
        });

    }

}





// LOGOUT USER
async function logoutUserController(req, res) {


    const token = req.cookies.token;


    if(token){

        await tokenBlacklistModel.create({
            token
        });

    }


    res.clearCookie("token");


    res.status(200).json({
        message: "User logged out successfully"
    });

}





// GET CURRENT USER
async function getMeController(req, res) {


    res.status(200).json({

        message: "User details fetched successfully",

        user: req.user

    });


}





module.exports = {

    registerUserController,

    loginUserController,

    logoutUserController,

    getMeController

};