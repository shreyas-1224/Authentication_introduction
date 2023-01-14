require('dotenv').config()

const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate')
const GoogleStrategy = require('passport-google-oauth20').Strategy;



const app = express();

app.set('trust proxy', 1) // trust first proxy
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());         
app.use(passport.session());             


app.set('trust proxy', 1) 
app.set("view engine" , "ejs");


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


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User = new mongoose.model("User" , userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user);
     
});
  
passport.deserializeUser(function(user, done) {
    done(null, user);
});


passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http:localhost:3000/auth/google/secrets",
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));



app.get("/" , (req , res)=>{
    res.render("home");
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ["profile"] })
);

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
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

app.get("/submit" , (req , res)=>{
    if(req.isAuthenticated()){
        res.render("submit");
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
                res.redirect("/secrets");
            }); 

        }
    });
});

app.listen(3000 , ()=>{
    console.log("you can do anything Shreyas!");
});