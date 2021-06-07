const express = require('express');
const app = express();
// DB CONFIG
const mongoose = require('mongoose');
//END DB CONFIG
//BODY-PARSER
const bodyParser = require('body-parser');
//bodyparser-end
//autahnticate js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const expressSession = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
//authanticate end
//ROUTES
const User = require('./models/user');
const mainRoutes = require("./routes/main");
const authRoutes = require("./routes/auth");
//const streamRoutes = require("./routes/stream");
//END ROUTES
try{
  var config = require('./config');
}catch(e){
  console.log("db config down");
  console.log(e);
}
//IMPORT VIDEO-CONFERANCE
//END VIDEO-CONFERANCE
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
// Peer
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
const isLoggedIn = require('./utils/isLoggedIn');
try{
  mongoose.connect(config.db.connection, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true});
}catch(e){
  console.log("db config down");
  mongoose.connect(process.env.DB_CONNECTION_STRING,{useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true});
}

mongoose.Promise = global.Promise;

app.set("view engine","ejs");
app.use(express.static('public'));
app.use("/peerjs", peerServer);
app.use(expressSession({
    secret: process.env.ES_SECRET || config.expressSession.secret,
    resave: false,
    saveUninitialized: false
    // using store session on MongoDB using express-session + connect
}));
// autanhticate
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended : true }));
app.use(cookieParser());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));
// autahanticate
app.use((req,res,next) => {
    res.locals.user = req.user;
    res.locals.errorMessage = req.flash("error");
    res.locals.successMessage = req.flash("success");
    next();
});
//flash config
app.use("/",mainRoutes);
app.use("/",authRoutes);

app.get("/konferans",isLoggedIn, (req, rsp) => {
    rsp.redirect(`/${uuidv4()}`);
  });
  
  app.get("/:room", (req, res) => {
    res.render("room", { roomId: req.params.room });
  });
  
  io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId) => {
      socket.join(roomId);
      socket.to(roomId).emit("user-connected", userId);
  
      socket.on("message", (message) => {
        io.to(roomId).emit("createMessage", message);
      });
    });
  });
  
  server.listen(process.env.PORT || 3030);
