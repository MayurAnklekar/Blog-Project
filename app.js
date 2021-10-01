const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const saltRounds = 10;

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


mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log("Connected to MongoDB"));

const data_from_db = [
  {
    id: "1",
    title:
      "Race Matters: How Does It Feel to Be One of the Few Black People in Your Industry?",
    post: "I loved writing stories as a kid. My dad is a writer — he wrote a newspaper column and taught college journalism. So, reading and writing skills were big in my household. When I was 12, I submitted a story to a contest sponsored by American Girl Magazine. The prompt was an illustration of a girl standing at a mailbox with a letter in her hand and two girls standing with her, looking at her like, oh my God. So, I wrote a story about a girl who wins two concert tickets and has to decide which friend to bring. It won and was featured in the magazine — my first official publication. I wasn’t super confident as a young person, so that was validating. Later, after majoring in English literature in college and getting my MFA at the New School, I became an editorial assistant at Random House.",
  },
  {
    id: "2",
    title: "What It Feels Like to Have Autism",
    post: "Since she was on the autism spectrum, Pang had a hard time figuring out the people around her. “I needed to learn how to react, how to laugh in the right places, how to live among them,” she explains. Her mother said no, there was no such manual — which only inspired Pang. “I had to write my own,” she says. Two decades later, Pang is a postdoctoral scientist living in England, and her book comes out today: An Outsider’s Guide to Humans. Below, I spoke to her about what living with autism feels like. There’s a stoicism you have to have in a commute, even though it feels like everything is on a survival instinct. I really react to smells and the social labyrinth. Where do I stand? Is someone going to touch the back of my head? Is that their personal space or mine? A lot of people say, a commute shouldn’t be hard because it’s very normal. But it doesn’t feel normal to me. And I worry that I’ll fail my day before I even can express myself.",
  },
  {
    id: "3",
    title: "A Natural Way to Sleep Better",
    post: "Phew, 2020 has been a year, right?! I don’t know if, like me, you have had some problems falling asleep at night? To be honest, I have always been a bit of a worrier before I fall asleep at night, and this year hasn’t helped at all. I sometimes just keep going over things from the day, or things that could happen in the future, and I can’t relax my body to fall asleep. I was keen to find a natural way to help me sleep better when I have those nights that I’m feeling stressed, which can be more apparent during the busy holiday season where it feels like we all have so much to juggle with.",
  },
  {
    id: "4",
    title: "5 Teacher Tech Essentials for Virtual Classrooms",
    post: "When coronavirus closed schools in March, every teacher did the best they could to transition to emergency schooling. This fall educators across the country reimagined their teaching spaces and got creative to engage a new group of students. They’re using new online teaching tools and tech essentials for virtual classrooms that make online instruction easier. My job as a teacher is to cultivate a thriving classroom. I rely on tools that let my 8th grade computer science students see, hear, and understand me whether in person or online. Now that we’ve settled into the school year, gotten to know our kids through Zoom, and become more comfortable delivering online instruction, it’s time to take stock of what’s working and what isn’t.",
  },
];


const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  desc: {
    type: String,
    required: true,
  },
  username: String,
});

const Post = mongoose.model("Post", PostSchema);

app.post("/signup", function (req, res) {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    const newUser = new User({
      username: req.body.username,
      password: hash,
    });

    newUser.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        res.render("about");
      }
    });
  });
});

app.post("/signin", function(req, res){


  User.findOne({username:req.body.username}, function(err, foundUser){
    if(err)
    {
      console.log(err);
    }
    else{
      if(foundUser)
      {
        bcrypt.compare(req.body.password, foundUser.password, function(err, result) {
          if(result===true)
          {
            res.render("contact");
          }
          else
          {
            console.log(err);
          }
      });
      }
    }
  })

});
app.get("/", function (req, res) {
  //database for posts comes here
  res.render("index", { data_from_db: data_from_db });
});

app.get("/posts/:id", function (req, res) {
  const postId = req.params.id;
  data_from_db.forEach(function (blog) {
    const storedId = blog.id;
    if (postId === storedId) {
      res.render("posts", {
        title: blog.title,
        body: blog.post,

      });
    }
  });
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });
  
  post.save(function(err){
    if (!err){
        res.redirect("/");
    }
  });
});

app.get("/contact", function (req, res) {
  res.render("contact");
});


const destinationEmailID = 'mayurs0802@gmail.com';    //THIS HAS TO BE CHANGED TO THE MAIL WHICH HAS TO RECIEVE ALL THE MAILS

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
app.listen(port, function (req, res) {
  console.log(`server running on port ${port}`);

});
