require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require("ejs");
const session = require('express-session');
const passport = require('passport');

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const findOrCreate = require('mongoose-findorcreate');


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'This is a secret.',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

const User = require('./user');
passport.use(User.createStrategy());

// mongoose.connect('mongodb://localhost:27017/sacUserDB', {useNewUrlParser: true,  useUnifiedTopology: true, useCreateIndex: true});

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/sac3-0"
  },
  function(accessToken, refreshToken, profile, cb) {
      clog(profile);
    User.findOrCreate({ googleId: profile.id, name: profile.displayName }, function (err, user) {
        if(err){
            clog(err);
        }
        else{
            clog(user);
        }
      return cb(err, user);
    });
  }
));

app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/sac3-0', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/home');
});


/** FACEBOOK STRATEGY */

passport.use(new FacebookStrategy({
    clientID: process.env.FB_CLIENT_ID,
    clientSecret: process.env.FB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/sac3-0",
    profileFields: ['id', 'displayName', 'photos']
  },
  function(accessToken, refreshToken, profile, cb) {
      clog(profile);
    User.findOrCreate({ facebookId: profile.id, name: profile.displayName }, function (err, user) {
        if(err){
            clog(err);
        }
        else{
            clog(user);
        }
      return cb(err, user);
    });
  }
));

app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/sac3-0',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/home');
  });
/************************************************************ */



app.get('/', function(req, res){
    if(req.isAuthenticated()){
        res.redirect('/home');
    }
    else{
        // clog(req.user);
        res.render('index.ejs',{css: 'home', loggedIn: false});
    }
    
});

app.get('/home', (req, res) => {
    if(!req.isAuthenticated()){
        res.redirect('/');
    }
    else{
        clog(req.user);
        res.render('index', {css: 'home', loggedIn: true});
    }
})


app.post('/login', function(req, res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, (err) => {
        if(err){
            clog(err);
            res.redirect('/');
        }
        else{
            passport.authenticate("local")(req, res, ()=>{
                res.redirect('/home');
            });
        }
    });
});

app.post('/signup', (req, res) => {
    clog(req.body);
    User.register({username: req.body.username, name: req.body.name}, req.body.password, function(err, user){
        
        if(err){
            clog(err);
            res.redirect('/');
        }
        else{
            
            passport.authenticate("local")(req, res, function(){
                res.redirect('/home');
            });
        }
    } );
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

let PORT = process.env.PORT;
if(PORT == null){
    PORT = 3000;
}
app.listen(PORT, function(){
    clog('app started on port '+ PORT);
});






function clog(msg){
    console.log(msg);
}