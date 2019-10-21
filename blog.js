const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: String,
    date: {type: Date, default: Date.now},
    user_id: {type: mongoose.Types.ObjectId, ref: 'User'},
    img_url: String
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;