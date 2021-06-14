const express = require('express'); // express initiliaze
const app = express(); // - need this for using express.js -
const mongoose = require('mongoose'); // need mongoose for database connection
const bodyParser = require('body-parser'); // body-parser
//authenticate with passport.js ( using local-strategy for log-in)
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const expressSession = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash'); // flash messages for users (remember its logged or logged out)
const isLoggedIn = require('./utils/isLoggedIn'); // its basically util so checking logged or logout importing
//authenticate end
//ROUTES
const User = require('./models/user');
const mainRoutes = require("./routes/main");
const authRoutes = require("./routes/auth");
//END ROUTES
// NEED THIS STRUCTER BECAUSE I HIDE MY DB KEY ALSO ITS DB CONFIG WHY ITS VAR (NOT CONST) ?
//IF ITS CONST NOT ACCEES TO ANYWHERE ON CODES SO ITS DECLARE 'VAR'
try{
  var config = require('./config');
}catch(e){
  console.log("db config down");
  console.log(e);
}
//IMPORT VIDEO-CONFERANCE with socket.io and random room_id with UUID npm package
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
// Peer-Server imports
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
//END VIDEO-CONFERANCE
// database connection 
try{
  mongoose.connect(config.db.connection, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true});
}catch(e){
  console.log("db config down");
  mongoose.connect(process.env.DB_CONNECTION_STRING,{useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true});
}
// set and using imports my UI design with EJS so set view engine to EJS and another imports need to 'public'folder like CSS
app.set("view engine","ejs");
app.use(express.static('public'));
app.use("/peerjs", peerServer);
app.use(expressSession({
    secret: process.env.ES_SECRET || config.expressSession.secret,
    resave: false,
    saveUninitialized: false
    // using store session on MongoDB using express-session + connect
}));
// autahanticate require and using
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended : true }));
app.use(cookieParser());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));
// flash message function like error-success
app.use((req,res,next) => {
    res.locals.user = req.user;
    res.locals.errorMessage = req.flash("error");
    res.locals.successMessage = req.flash("success");
    next();
});
//using routes
app.use("/",mainRoutes);
app.use("/",authRoutes);
// if you get /konferans you redirectted to random room_id so creating room_id
app.get("/konferans",isLoggedIn, (req, rsp) => {
    rsp.redirect(`/${uuidv4()}`);
  });
// getting random room_id
  app.get("/:room", (req, res) => {
    res.render("room", { roomId: req.params.room });
  });
// socket.io connection
  io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId) => {
      socket.join(roomId);
      socket.to(roomId).emit("user-connected", userId);
      socket.on("message", (message) => {
        io.to(roomId).emit("createMessage", message);
      });
    });
  });
  // listening to app at 3030 port
  server.listen(process.env.PORT || 3030);
