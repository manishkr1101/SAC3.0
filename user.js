const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');

mongoose.connect('mongodb://localhost:27017/sacUserDB', {useNewUrlParser: true,  useUnifiedTopology: true, useCreateIndex: true});



const userSchema = new mongoose.Schema(
    {
        name: String,
        email: String,
        password: String,
        googleId: String,
        facebookId: String,
    }
);

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model('User', userSchema);


module.exports = User;