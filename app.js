require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');



app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.get('/', function(req, res){
    res.render('index.ejs',{css: 'home'});
});



app.get('/login', function(req, res){
    res.send('this is login page');
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