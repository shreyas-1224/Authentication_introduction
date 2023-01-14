// configuring enviornment variables.
//require('dotenv').config()

const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const saltRounds = 10;
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const e = require("express");
const { serializeUser, deserializeUser } = require("passport");

//const encrypt = require("mongoose-encryption");
//const md5 = require("md5");
// const bcrypt = require('bcrypt');

const app = express();

// setting up view and body-parser
app.use(express.static("public"));
app.set("view engine" , "ejs");
app.use(bodyParser.urlencoded({extended: true}));


// for cookies and session.
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'i love my life very much.',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());         // set passport.
app.use(passport.session());            // use passport to initialize session.    

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
    username : String ,
    password : String
});

// encryption
// userSchema.plugin(encrypt , {secret: process.env.SECRET , encryptedField : ['password']});
userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User" , userSchema);

// use static authenticate method of model in LocalStrategy
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
//passport.serializeUser(User.serializeUser());
//passport.deserializeUser(User.deserializeUser());



//another way to serializeUser and deserializeUser(best way actually.)
passport.serializeUser(function(user, done) {
    done(null, user);
     
});
  
passport.deserializeUser(function(user, done) {
    done(null, user);
});


app.get("/" , (req , res)=>{
    res.render("home");
});

app.get("/login" , (req , res)=>{
    res.render("login");
});

app.get("/register" , (req , res)=>{
    res.render("register");
});

app.get("/secrets" , (req , res)=>{
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
});

app.post("/register", (req , res)=>{
    
    User.register({username : req.body.username} , req.body.password , (error , user)=>{
        if(error){
            console.log(error);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req , res , ()=>{
                res.redirect("/secrets");
            });
        }
    });
    
});


app.get('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
});

app.post("/login", (req , res)=>{
    const userdata = new User({
        username: req.body.username,
        password: req.body.password
    });
    
    req.login(userdata , (err)=>{
        if(err){
            console.log(err);
            res.redirect("/login");
        }else{
            passport.authenticate("local" ,  { failureRedirect: '/login' })(req , res , ()=>{
                //console.log(req.session.passport);
                res.redirect("/secrets");
            }); 
            // if authentication fails
            //res.redirect("/login");   
        }
    });
});

app.listen(3000 , ()=>{
    console.log("you can do anything Shreyas!");
});