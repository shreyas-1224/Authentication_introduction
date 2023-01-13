// configuring enviornment variables.
//require('dotenv').config()

const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const alert = require("alert");
//const encrypt = require("mongoose-encryption");
const md5 = require("md5");


const app = express();

// setting up view and body-parser
app.use(express.static("public"));
app.set("view engine" , "ejs");
app.use(bodyParser.urlencoded({extended: true}));


// setting up the database
mongoose.set('strictQuery', false);
mongoose.connect('mongodb://127.0.0.1:27017/usersdb',
{
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(()=>{
    console.log("database connected successfully");
}).catch((error)=>{
    console.log(error);
});


const userSchema = new mongoose.Schema({
    email : String ,
    password : String
});

// encryption
// userSchema.plugin(encrypt , {secret: process.env.SECRET , encryptedField : ['password']});

const User = new mongoose.model("User" , userSchema);

app.get("/" , (req , res)=>{
    res.render("home");
});

app.get("/login" , (req , res)=>{
    res.render("login");
});

app.get("/register" , (req , res)=>{
    res.render("register");
});


app.post("/register", (req , res)=>{

    const userDocument = new User({
        email : req.body.email,
        password : md5(req.body.password)
    });
    userDocument.save();
    res.redirect("login");
});

app.post("/login", (req , res)=>{
    const email = req.body.email;
    const password = md5(req.body.password);
    User.findOne({ email : email } , (error , result)=>{
        if(!error){
            if(result == null){
                res.redirect("/register");
            }else{
                if(result.password === password){
                    res.render("secrets");
                }else{
                    res.redirect("/login");
                }
            }
        }else{
            res.send(error);
        }
    });

});

app.listen(3000 , ()=>{
    console.log("you can do anything Shreyas!");
});