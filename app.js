const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

require("dotenv").config();

("use strict");
const nodemailer = require("nodemailer");
const app = express();

const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.static(__dirname + "/public"));

app.use(
  session({
    secret: "ShhhThisisaSecret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log("Connected to MongoDB"));


const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  body: {
    type: String,
    required: true,
  },
  username: String,
});

const Post = mongoose.model("Post", PostSchema);

app.post("/signup", function (req, res) {
  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/signup");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/");
        });
      }
    }
  );
});

app.post("/signin", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/");
      });
    }
  });
});

app.get("/", function (req, res) {

    Post.find({  }, function (err, foundUsers) {
      if (err) {
        console.log(err);
      } else {
        if (foundUsers) {
          res.render("index", { data_from_db: foundUsers });
        }
      }
    });
  
});



app.post("/compose", function (req, res) {
  const newPost = new Post({
    title: req.body.title,
    body: req.body.post,
    username: req.body.username
  });

  newPost.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
    }
  });
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get("/posts/:id", function (req, res) {
  const postId = req.params.id;
 

  Post.findById( postId , function (err, foundUsers) {
    if (err) {
      console.log(err);
    } else {
      if (foundUsers) {
        res.render("posts", { title: foundUsers.title, body:foundUsers.body });
      }
    }
  

  

} )
});

app.get("/compose", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("compose");
  } else {
    res.redirect("/signin");
  }
});

app.post("/compose", function (req, res) {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody,
  });

  post.save(function (err) {
    if (!err) {
      res.redirect("/");
    }
  });
});

app.get("/contact", function (req, res) {
  res.render("contact");
});

const destinationEmailID = "mayurs0802@gmail.com"; //THIS HAS TO BE CHANGED TO THE MAIL WHICH HAS TO RECIEVE ALL THE MAILS

app.post("/contact", function (req, res) {
  const name = req.body.username;
  const recepient_email = req.body.email_id;
  const mail_subject = `Coding Club Blog Message: ${req.body.mail_subject}`;
  const phone = req.body.phone_no;
  const mailMessage = req.body.user_message;
  const mail_body = `Mail from Coding Club Blogs\nName :  ${name}\nemail : ${recepient_email}\nPhone : ${phone}\nSubject : ${req.body.mail_subject}\nMessage : ${mailMessage}\n`;
  const transporter = nodemailer.createTransport({
    service: "yahoo",
    host: "smtp.mail.yahoo.com",
    port: 465,
    secure: false,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
    debug: false,
    logger: true,
  });

  let mailOptions = {
    from: process.env.MAIL_USERNAME,
    to: destinationEmailID,
    subject: mail_subject,
    text: mail_body,
  };
  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      console.log("Error " + err);
    } else {
      console.log("Email sent successfully");
    }
  });
  res.redirect("/");
});
app.get("/about", function (req, res) {
  res.render("about");
});
app.get("/signin", function (req, res) {
  res.render("signin");
});
app.get("/signup", function (req, res) {
  res.render("signup");
});
app.listen(3000, function (req, res) {
  console.log(`server running on port 3000`);
});
