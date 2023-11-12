const bcrypt = require('bcrypt');
const {validationResult} = require('express-validator');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const Token = require('../models/tokenModal');

const signup = async(req,res) => {
    try {
        //validate the user inputs
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }

        //validate if the user is already in database
        const {username, email, password} = req.body;
        const userExists = await User.findOne({email});
        if(userExists){
           return res.status(401).json({errors:[{"msg":"User with this email address already exists"}]});
        }
        // Make hash of the user's password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Store information in database
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });
        res.status(201).json({user});

    } catch (error) {
        console.log(error)
        res.status(500).json({errors:[{"msg":"Internal Server Error"}]});
    }
};

const signin = async (req, res) => {
    try {
        //validate the user inputs
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }

        const {email, password} = req.body;

        const user = await User.findOne({email});
        if(user && (await bcrypt.compare(password, user.password))){
            // create access token
            const accessToken = jwt.sign({
                user:{
                    id:user._id,
                    username:user.username,
                    email: user.email
                 }
                },
                process.env.ACCESS_TOKEN_SECRET,
                {
                    expiresIn: "10s"
                }
            );
            // create refresh token
            const refreshToken = jwt.sign({
                user:{
                    id:user._id,
                    username:user.username,
                    email: user.email
                 }
                },
                process.env.REFRESH_TOKEN_SECRET,
                {
                    expiresIn: "1d"
                }
            );
            // save refresh token in database
             await Token.create({
                user_id:user._id,
                refreshToken
            });

            res.cookie('jwt', refreshToken, {httpOnly: true, maxAge: 24 * 60 * 60 * 1000});  //maxAge = one day
            res.status(200).json({accessToken}); 
        }
        else{
         return res.status(401).json({errors:[{"msg":"email or password is incorrect"}]});
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({errors:[{"msg":"Internal Server Error"}]});
    }
}


const signout = async (req, res) => {
    try {

        const cookies = req.cookies;
        if(!cookies?.jwt) return res.sendStats(204);
        const refreshToken = cookies.jwt;

        //check if refresh token in database
        const token = await Token.findOne({refreshToken});
        if(!token) {
            res.clearCookie('jwt', {httpOnly: true});
            return res.sendStatus(403);
        }

        // delete refresh token in database

        await Token.deleteOne(token._id);
        res.clearCookie('JWT', {httpOnly: true}); //secure:true - only serves in https
        res.sendStatus(204);
        
    } catch (error) {
        console.log(error);
        res.status(500).json({errors:[{"msg":"Internal Server Error"}]});
    }
}

const getUsers = async(req, res) => {
    try {

        let users = await User.find();
        if(users.length === 0){
            return res.status(404).json({errors:[{"msg":"No user found"}]});
        }
         users = users.map(user => (
        {
            _id: user._id,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
      )) 
        res.status(200).json({users});
        
    } catch (error) {
      console.log(error)
      res.status(500).json({errors:[{"msg":"Internal Server Error"}]});
    }
}

module.exports = {signup,signin,signout,getUsers};