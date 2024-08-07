const userModel=require('../models/user-model');
const bcrypt=require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const { generateToken }= require('../utils/generateToken')
module.exports.registerUser = async function (req, res) {
    try {
      let { email, password, fullname } = req.body;
      if (!email || !password || !fullname) {
        req.flash("error", "Please Enter Your Details");
        return res.redirect("/");
      }
  
      let user = await userModel.findOne({ email: email });
      if (user) {
        req.flash("error", "You already have an account, please login.");
        return res.redirect("/");
      }
  
      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, async function (err, hash) {
          if (err) return res.send(err.message);
          else {
            let user = await userModel.create({
              email,
              password: hash,
              fullname,
            });
  
            let token = generateToken(user);
            res.cookie("token", token);
            res.redirect("/shop");
          }
        });
      });
    } catch (err) {
      res.send(err.message);
    }
  };

module.exports.loginUser= async function (req, res) {
    let {email,password}=req.body;
    if (!email || !password ) {
      req.flash("error", "Please Enter Your Credentials");
      return res.redirect("/");
    }
    let user= await userModel.findOne({email:email});
    if(!user){
        req.flash("error", "Incorrect Email")
        return res.redirect("/")
    } 
    else{
        bcrypt.compare(password,user.password,(err,result)=>{
            if(result){
               let token= generateToken(user);
               res.cookie("token",token);
               res.redirect("/shop");
            }
            else{
             req.flash("error", "Incorrect Password")
             return res.redirect("/")
            } 
        })
    }
}

module.exports.logoutUser = function (req, res) {
    res.cookie("token", "");
    res.redirect("/");
  };