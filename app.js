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

const BASE_URL = 'http://localhost:3000';


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
const Blog = require('./blog');

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
    callbackURL: `${process.env.BASE_URL || BASE_URL}/auth/google/sac3-0`
  },
  function(accessToken, refreshToken, profile, cb) {
      clog(profile);
    User.findOrCreate({ googleId: profile.id, name: profile.displayName, img_url: profile.photos[0].value }, function (err, user) {
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
// console.log(process.env);
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
    callbackURL: `${process.env.BASE_URL || BASE_URL}/auth/facebook/sac3-0`,
    profileFields: ['id', 'displayName', 'photos']
  },
  function(accessToken, refreshToken, profile, cb) {
      clog(profile);
    User.findOrCreate({ facebookId: profile.id, name: profile.displayName, img_url: profile.photos[0].value }, function (err, user) {
        if(err){
            clog(err);
        }
        else{
            // clog(user);
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
        res.render('index.ejs', {css:'home', loggedIn: false, blogs: [], myPost: '', allPost: 'selected'});
    }
    
});

app.get('/home', (req, res) => {
    if(!req.isAuthenticated()){
        res.redirect('/');
    }
    else{
        // clog(req.user);
        Blog.find({}, (err, blogs) => {
            if(err){
                res.send({err: err});
            }
            else{
                // clog(blogs);
                res.render('index', {css: 'home', loggedIn: true, blogs: blogs, myPost: '', allPost: 'selected'});
            }
        });
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
            // res.redirect('/');
            res.send('user already exist');
        }
        else{
            
            passport.authenticate("local")(req, res, function(){
                res.redirect('/home');
            });
        }
    } );
});

app.post('/blog', (req, res) => {
    // clog({
    //     'user':req.user,
    //     authInfo: req.authInfo,
    //     session: req.session
    // });
    const user = req.user;
    const blog = new Blog({
        title: req.body.title,
        content: req.body.content,
        author: user.name,
        user_id: user._id,
        img_url: user.img_url
    });
    blog.save()
    .then(doc => {
        console.log(doc);
        res.redirect('/home');
    })
    .catch(err => {
        clog(err);
        res.send(err);
    });
});

app.get('/mypost', (req, res) => {
    if(!req.isAuthenticated()){
        res.redirect('/');
    }
    else{
        clog(req.user);
        Blog.find({user_id: req.user._id}, (err, blogs) => {
            if(err){
                res.send({err: err});
            }
            else{
                clog(blogs);
                res.render('index', {css: 'home', loggedIn: true, blogs: blogs, myPost: 'selected', allPost: ''});
            }
        });
    }
})

app.get('/allpost', (req, res) => {
    res.redirect('/home');
})

app.get('/request', (req, res) => {
    res.status(200).send('done');
    console.log(req);
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.get('/env', (req, res) => {
    res.send({
        env: process.env,
        url: process.env.BASE_URL
    })
})
app.get('/user', (req, res) => {
    res.send(req.user);
})

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