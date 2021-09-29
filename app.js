const express = require("express");

const app = express();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(express.static(__dirname + '/public'));

app.get("/", function(req, res){
    res.render('index')
})

app.listen(3000, function(req, res){
    console.log("server running on port 3000");
})