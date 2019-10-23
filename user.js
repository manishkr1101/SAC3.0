const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const findOrCreate = require('mongoose-findorcreate');

mongoose.connect(`mongodb+srv://manish:${process.env.MONGO_ATLAS_PASSWORD}@cluster0-rp3y8.mongodb.net/sacDB`, {useNewUrlParser: true,  useUnifiedTopology: true, useCreateIndex: true});



const userSchema = new mongoose.Schema(
    {
        name: String,
        email: String,
        password: String,
        googleId: String,
        facebookId: String,
        img_url: {type: String, default: '/images/logo.jpg'}
    }
);

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model('User', userSchema);


module.exports = User;
